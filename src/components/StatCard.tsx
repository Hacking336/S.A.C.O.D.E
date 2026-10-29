import { FileText, Files, Clock, Wrench, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'

export type Tone = 'blue' | 'orange' | 'purple' | 'green' | 'slate'

const TONES: Record<Tone, { box: string; icon: LucideIcon }> = {
  blue: { box: 'bg-blue-100 text-blue-600', icon: FileText },
  orange: { box: 'bg-orange-100 text-orange-500', icon: Clock },
  purple: { box: 'bg-violet-100 text-violet-600', icon: Wrench },
  green: { box: 'bg-green-100 text-green-600', icon: CheckCircle2 },
  slate: { box: 'bg-slate-100 text-slate-500', icon: XCircle },
}

const ICONS: Record<string, LucideIcon> = {
  file: FileText,
  files: Files,
  clock: Clock,
  wrench: Wrench,
  check: CheckCircle2,
  x: XCircle,
}

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  tone: Tone
  /** overrides the tone's default glyph */
  icon?: string
}

export function StatCard({ label, value, sub, tone, icon }: StatCardProps) {
  const config = TONES[tone]
  const Icon = (icon ? ICONS[icon] : config.icon) ?? config.icon

  return (
    <div className="card group flex items-start gap-4 p-5 transition-shadow hover:shadow-card-hover">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${config.box}`}
        aria-hidden="true"
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="text-[26px] font-bold leading-none text-slate-900">{value}</p>
        <p className="mt-2 truncate text-[13.5px] font-semibold text-slate-700">{label}</p>
        {sub && <p className="mt-0.5 truncate text-[12px] text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}
