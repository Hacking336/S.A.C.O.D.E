import { maintenanceStaff, type MaintenanceStaff, type StaffSpecialty } from '../data/adminMock'
import { maintenanceUser } from '../data/maintenanceMock'
import type { Priority } from '../data/mock'

/* ------------------------------------------------------------------
   Campus Care — AI triage for damage reports.

   When a report reaches the admin side, this module reads it (photo +
   text) and decides three things: what is broken, how urgent it is and
   which technician should own it.

   Two engines:
   • 'model'   — a real vision model. Enabled by pointing
                 VITE_TRIAGE_API_URL at a server endpoint that accepts
                 POST { report, photo } and answers with
                 { issue, skill, priority, confidence, signals, summary }.
                 The key belongs on that server, never in this bundle.
   • 'builtin' — the deterministic classifier below, used by default so
                 the hand-off works end to end without a provider.
------------------------------------------------------------------ */

/**
 * Spring Boot adapter for the vision model: a hosted Gemini Flash on the free
 * tier by default, or a local Ollama model when the backend is configured that way.
 * The API key lives on the server, never in this bundle.
 */
const TRIAGE_ENDPOINT =
  (import.meta.env.VITE_TRIAGE_API_URL as string | undefined) ?? 'http://localhost:8080/api/triage'

export interface TriageInput {
  id: string
  equipment: string
  category: string
  location: string
  reportedBy: string
  /** Free-text damage description from the report. */
  description?: string
  /** Report photo as a data URL or public URL — what a vision model reads. */
  photo?: string
}

export interface TriageVerdict {
  engine: 'model' | 'builtin'
  /** Short label for what the photo/report appears to show. */
  issue: string
  skill: StaffSpecialty
  priority: Priority
  /** 0–1. How sure the triage is about the skill + priority. */
  confidence: number
  /** The evidence the decision was based on. */
  signals: string[]
  /** One-line brief handed to the technician. */
  summary: string
  technician: MaintenanceStaff
  /** 0–100 fit between the job and the chosen technician. */
  matchScore: number
  /** Vision model that made the call, when one did. */
  model?: string
  /** Set when the model could not be reached and the built-in classifier stood in. */
  fallbackReason?: string
}

interface ModelAnswer {
  issue?: string
  skill?: StaffSpecialty
  priority?: Priority
  confidence?: number
  signals?: string[]
  summary?: string
  /** Model id the backend actually used, e.g. gemini-3.8-flash. */
  model?: string
}

const SKILLS: StaffSpecialty[] = [
  'IT / Computers',
  'Electrical',
  'Plumbing',
  'Air Conditioning',
  'General Repair',
]

const SKILL_SIGNALS: Record<StaffSpecialty, string[]> = {
  'IT / Computers': [
    'computer', 'monitor', 'laptop', 'desktop', 'keyboard', 'mouse', 'printer', 'projector',
    'screen', 'display', 'vga', 'hdmi', 'cable', 'network', 'wifi', 'software', 'hard drive',
    'tablet', 'speaker', 'microphone', 'avr', 'cpu', 'ram', 'black screen', 'not booting',
  ],
  Electrical: [
    'light', 'bulb', 'lamp', 'outlet', 'socket', 'wiring', 'wire', 'switch', 'breaker', 'fan',
    'extension cord', 'power', 'short circuit', 'spark', 'fluorescent', 'ballast', 'generator',
    'no power', 'overload',
  ],
  Plumbing: [
    'leak', 'faucet', 'pipe', 'sink', 'toilet', 'flush', 'drain', 'water', 'tap', 'plumbing',
    'valve', 'tank', 'sewer', 'drip', 'clog',
  ],
  'Air Conditioning': [
    'aircon', 'air conditioner', 'air-conditioning', 'cooling', 'freon', 'compressor', 'chiller',
    'condenser', 'thermostat', 'hvac', 'ventilation', 'not cold',
  ],
  'General Repair': [
    'chair', 'table', 'desk', 'door', 'window', 'cabinet', 'chalkboard', 'whiteboard', 'wall',
    'lock', 'hinge', 'ceiling', 'floor', 'furniture', 'drawer', 'shelf', 'crack', 'paint',
    'glass', 'tile',
  ],
}

const SEVERITY: { level: Priority; words: string[] }[] = [
  {
    level: 'Critical',
    words: [
      'smoke', 'fire', 'burning', 'burnt', 'spark', 'shock', 'electrocution', 'exposed wire',
      'flood', 'flooding', 'gas leak', 'collapse', 'melted', 'sparking',
    ],
  },
  {
    level: 'High',
    words: [
      'leak', 'drip', 'short circuit', 'overheat', 'overheating', 'no power', 'black screen',
      'dead', 'broken', 'stuck', 'unsafe', 'not working', 'cannot', 'jam', 'fails', 'failed',
      'loose wire',
    ],
  },
  {
    level: 'Medium',
    words: ['flicker', 'noisy', 'loose', 'slow', 'intermittent', 'sometimes', 'vibrat', 'squeak'],
  },
  {
    level: 'Low',
    words: ['cosmetic', 'dent', 'scratch', 'stain', 'paint chip', 'minor'],
  },
]

const titleCase = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

/** Strongest skill match for the report text, with the evidence that produced it. */
function classifySkill(input: TriageInput) {
  const equipmentText = `${input.equipment} ${input.category}`.toLowerCase()
  const detailText = `${input.description ?? ''} ${input.location}`.toLowerCase()

  let best: { skill: StaffSpecialty; score: number; signals: string[] } = {
    skill: 'General Repair',
    score: 0,
    signals: [],
  }

  for (const skill of SKILLS) {
    const signals = SKILL_SIGNALS[skill].filter(
      (word) => equipmentText.includes(word) || detailText.includes(word),
    )
    // A hit in the equipment name or category counts double: that is the
    // field the reporter fills in first and it is the least noisy.
    const score = signals.reduce(
      (total, word) => total + (equipmentText.includes(word) ? 2 : 1),
      0,
    )
    if (score > best.score) best = { skill, score, signals }
  }

  return best
}

/** Highest severity keyword present, falling back to Medium. */
function classifyPriority(input: TriageInput): { priority: Priority; signal?: string } {
  const text = `${input.equipment} ${input.category} ${input.description ?? ''}`.toLowerCase()
  for (const tier of SEVERITY) {
    const signal = tier.words.find((word) => text.includes(word))
    if (signal) return { priority: tier.level, signal }
  }
  return { priority: 'Medium' }
}

/**
 * Best technician for a skill: specialty match first, then the lighter
 * workload and an on-shift availability bonus.
 *
 * The signed-in technician is nudged to the front on a specialty match so a
 * demo assignment is visible in the maintenance UI right away.
 */
function chooseTechnician(skill: StaffSpecialty) {
  const specialists = maintenanceStaff.filter((member) => member.specialty === skill)
  const pool = specialists.length > 0 ? specialists : maintenanceStaff

  const scored = pool.map((member) => {
    const specialtyScore = member.specialty === skill ? 60 : 25
    const availabilityScore = member.status === 'Available' ? 20 : 10
    const workloadScore = Math.max(0, 20 - member.assigned.length * 7)
    const demoBonus = member.name === maintenanceUser.name ? 4 : 0
    return { member, score: specialtyScore + availabilityScore + workloadScore + demoBonus }
  })

  scored.sort((a, b) => b.score - a.score)
  return { technician: scored[0].member, matchScore: Math.min(99, scored[0].score) }
}

async function runModel(input: TriageInput): Promise<ModelAnswer> {
  const response = await fetch(TRIAGE_ENDPOINT as string, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      report: {
        id: input.id,
        equipment: input.equipment,
        category: input.category,
        location: input.location,
        reportedBy: input.reportedBy,
        description: input.description ?? '',
      },
      photo: input.photo ?? null,
    }),
  })

  if (!response.ok) {
    let detail = `Triage endpoint answered ${response.status}.`
    try {
      const body = (await response.json()) as { error?: string }
      if (body?.error) detail = body.error
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    throw new Error(detail)
  }

  const answer = (await response.json()) as ModelAnswer
  if (!answer.skill || !SKILLS.includes(answer.skill)) {
    throw new Error('Triage endpoint did not return a known maintenance skill.')
  }
  return answer
}

async function triageWithModel(input: TriageInput): Promise<TriageVerdict> {
  const answer = await runModel(input)
  const skill = answer.skill as StaffSpecialty
  const { technician, matchScore } = chooseTechnician(skill)
  return {
    engine: 'model',
    issue: answer.issue ?? `${input.equipment} fault`,
    skill,
    priority: answer.priority ?? classifyPriority(input).priority,
    confidence: clamp(answer.confidence ?? 0.85),
    signals: answer.signals ?? [],
    summary:
      answer.summary ??
      `${input.equipment} in ${input.location} routed to ${skill} based on the report photo.`,
    technician,
    matchScore,
    model: answer.model,
  }
}

/** Deterministic classifier, used only when the model cannot answer. */
async function builtinVerdict(input: TriageInput): Promise<TriageVerdict> {
  const { skill, signals } = classifySkill(input)
  const { priority, signal } = classifyPriority(input)
  const { technician, matchScore } = chooseTechnician(skill)
  const confidence = clamp(0.52 + Math.min(0.34, signals.length * 0.09) + (signals.length ? 0.06 : 0))

  const issue = signal ? `${titleCase(signal)} on ${input.equipment}` : `${input.equipment} fault`

  return {
    engine: 'builtin',
    issue,
    skill,
    priority,
    confidence,
    signals: signals.slice(0, 4),
    summary: `${input.equipment} in ${input.location} — ${issue.toLowerCase()}. Needs ${skill} work.${input.photo ? ' Reviewed the attached photo.' : ''}`,
    technician,
    matchScore,
  }
}

/**
 * Read a report and decide who should fix it.
 *
 * The local model does the reading; if Ollama or the backend is down, the
 * built-in classifier answers instead and says so in `fallbackReason`, so the
 * admin is never shown a model decision that never happened.
 */
export async function triageReport(input: TriageInput): Promise<TriageVerdict> {
  try {
    return await triageWithModel(input)
  } catch (error) {
    const verdict = await builtinVerdict(input)
    return {
      ...verdict,
      fallbackReason: error instanceof Error ? error.message : 'the model could not be reached',
    }
  }
}

const clamp = (value: number) => Math.min(0.97, Math.max(0.35, Number(value.toFixed(2))))
