import { useMemo, useState } from 'react'
import {
  ArrowUpNarrowWide,
  CheckCircle2,
  Loader2,
  ScanLine,
  Search,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Modal } from '../../components/Modal'
import { PriorityBadge } from '../../components/Badges'
import { EquipmentThumb } from '../../components/EquipmentThumb'
import { ReportPriorityQueue } from '../../lib/reportPriorityQueue'
import { type AdminReportRow } from '../../data/adminMock'
import { setReportStatus, updateReport, useReports } from '../../data/reportStore'
import { setWorkOrderStatus } from '../../data/maintenanceMock'
import type { Priority, ReportStatus } from '../../data/mock'
import { addWorkOrder, type WorkOrder } from '../../data/maintenanceMock'
import { triageReport, type TriageVerdict } from '../../lib/aiTriage'

const TABS = ['All', 'Pending', 'In Progress', 'Resolved', 'Cancelled'] as const
type Tab = (typeof TABS)[number]

const STATUS_BY_TAB: Record<Exclude<Tab, 'All'>, ReportStatus> = {
  Pending: 'PENDING',
  'In Progress': 'IN PROGRESS',
  Resolved: 'RESOLVED',
  Cancelled: 'CANCELLED',
}

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const STATUS_TONE: Record<ReportStatus, string> = {
  PENDING: 'border-amber-300 bg-amber-50 text-amber-800',
  'IN PROGRESS': 'border-violet-300 bg-violet-50 text-violet-800',
  RESOLVED: 'border-green-300 bg-green-50 text-green-800',
  CANCELLED: 'border-slate-300 bg-slate-50 text-slate-600',
}

const buildingFor = (location: string) => (/^mri/i.test(location) ? 'MRI Building' : 'Main Building')

const dueFor = (priority: Priority) => {
  if (priority === 'Critical') return 'Today · end of shift'
  if (priority === 'High') return 'Today · 5:00 PM'
  if (priority === 'Medium') return 'Tomorrow'
  return 'This week'
}

const triageInput = (report: AdminReportRow) => ({
  id: report.id,
  equipment: report.equipment,
  category: report.category,
  location: report.location,
  reportedBy: report.reportedBy,
  // Real photo from the instructor's report — this is what the vision model reads.
  photo: report.photo,
})

export default function AdminReports() {
  const rows = useReports()
  const [tab, setTab] = useState<Tab>('All')
  const [query, setQuery] = useState('')
  const [triaging, setTriaging] = useState<AdminReportRow | null>(null)
  const [verdict, setVerdict] = useState<TriageVerdict | null>(null)
  const [triageState, setTriageState] = useState<'scanning' | 'ready' | 'error'>('scanning')
  const [triageError, setTriageError] = useState<string | null>(null)
  const [assignedByAi, setAssignedByAi] = useState<Record<string, number>>({})
  const [assigningAll, setAssigningAll] = useState(false)
  const [bulkSummary, setBulkSummary] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = rows.filter((report) => {
      const matchesTab = tab === 'All' || report.status === STATUS_BY_TAB[tab]
      const matchesQuery =
        !q ||
        [report.id, report.equipment, report.location, report.reportedBy].some((field) =>
          field.toLowerCase().includes(q),
        )
      return matchesTab && matchesQuery
    })

    // DSA #1 — the max heap always hands back Critical before Low.
    return ReportPriorityQueue.from(matches).drainSorted()
  }, [rows, tab, query])

  // One queue: a status set here also moves the job on the technician's board.
  const setStatus = (id: string, status: ReportStatus) => {
    setReportStatus(id, status)
    setWorkOrderStatus(id, status)
  }

  /* ------------------------- AI triage & routing ------------------------- */

  /** Hand a finished triage verdict to the technician's work order list. */
  const applyAssignment = (report: AdminReportRow, result: TriageVerdict) => {
    const technician = result.technician.name

    updateReport(report.id, {
      assignedTo: technician,
      priority: result.priority,
      status: report.status === 'PENDING' ? 'IN PROGRESS' : report.status,
    })

    const order: WorkOrder = {
      id: report.id,
      equipment: report.equipment,
      category: report.category,
      location: report.location,
      room: report.location,
      building: buildingFor(report.location),
      reportedBy: report.reportedBy,
      priority: result.priority,
      status: 'PENDING',
      date: report.date,
      due: dueFor(result.priority),
      note: result.summary,
      assignedTo: technician,
      triage: {
        engine: result.engine,
        skill: result.skill,
        issue: result.issue,
        confidence: Math.round(result.confidence * 100),
      },
    }
    addWorkOrder(order)
    setAssignedByAi((prev) => ({ ...prev, [report.id]: Math.round(result.confidence * 100) }))
  }

  const runTriage = async (report: AdminReportRow) => {
    setTriageState('scanning')
    setTriageError(null)
    setVerdict(null)
    try {
      const result = await triageReport(triageInput(report))
      setVerdict(result)
      setTriageState('ready')
    } catch (error) {
      setTriageState('error')
      setTriageError(
        error instanceof Error ? error.message : 'The triage step could not read this report.',
      )
    }
  }

  const openTriage = (report: AdminReportRow) => {
    setTriaging(report)
    void runTriage(report)
  }

  const pendingUnassigned = useMemo(
    () => rows.filter((row) => row.status === 'PENDING' && !row.assignedTo),
    [rows],
  )

  const autoAssignPending = async () => {
    if (assigningAll || pendingUnassigned.length === 0) return
    setAssigningAll(true)
    setBulkSummary(null)
    try {
      const results = await Promise.all(pendingUnassigned.map((report) => triageReport(triageInput(report))))
      results.forEach((result, index) => applyAssignment(pendingUnassigned[index], result))
      setBulkSummary(
        `AI triaged and routed ${results.length} pending report${results.length === 1 ? '' : 's'}.`,
      )
    } catch (error) {
      setBulkSummary(error instanceof Error ? error.message : 'Bulk triage failed.')
    } finally {
      setAssigningAll(false)
    }
  }

  const counts = useMemo(
    () => ({
      pending: rows.filter((row) => row.status === 'PENDING').length,
      critical: rows.filter((row) => row.priority === 'Critical').length,
    }),
    [rows],
  )

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Every campus damage report, triaged by AI and routed to the right technician."
        variant="admin"
      />

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold transition ${
                tab === item
                  ? 'bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.28)]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
          <span className="rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            {counts.pending} pending
          </span>
          <span className="rounded-lg bg-red-50 px-3 py-2 text-[12.5px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
            {counts.critical} critical
          </span>
          <span className="hidden items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-[12.5px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 lg:inline-flex">
            <ArrowUpNarrowWide className="h-3.5 w-3.5" strokeWidth={2} />
            Urgent first
          </span>

          <button
            type="button"
            onClick={() => void autoAssignPending()}
            disabled={assigningAll || pendingUnassigned.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-[12.5px] font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {assigningAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            Auto-assign pending ({pendingUnassigned.length})
          </button>

          <div className="relative w-full sm:w-auto">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
            />
            <input
              type="search"
              placeholder="Search reports..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-[230px]"
            />
          </div>
        </div>
      </div>

      {bulkSummary && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-violet-50 px-3.5 py-3 text-[12.5px] font-medium text-violet-800 ring-1 ring-inset ring-violet-200">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <p>{bulkSummary}</p>
        </div>
      )}

      {/* ------------------------- Phone card list ------------------------ */}
      <div className="space-y-3 md:hidden">
        {filtered.map((report) => (
          <article key={report.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-blue-600">{report.id}</p>
                <p className="truncate text-[14px] font-semibold text-slate-900">
                  {report.equipment}
                </p>
                <p className="truncate text-[12.5px] text-slate-500">
                  {report.location} · {report.reportedBy}
                </p>
              </div>
              <PriorityBadge priority={report.priority} />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <select
                value={report.status}
                onChange={(e) => setStatus(report.id, e.target.value as ReportStatus)}
                aria-label={`Status for ${report.id}`}
                className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide focus:outline-none focus:ring-4 focus:ring-blue-100 ${STATUS_TONE[report.status]}`}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="shrink-0 text-[12px] text-slate-400">{report.date}</span>
            </div>

            <button
              type="button"
              onClick={() => openTriage(report)}
              disabled={report.status === 'RESOLVED' || report.status === 'CANCELLED'}
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[12.5px] font-semibold text-violet-700 transition hover:border-violet-600 hover:bg-violet-600 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              {report.assignedTo ? 'Re-run AI triage' : 'Assign with AI'}
            </button>
            <p className="mt-1.5 text-center text-[11px] text-slate-400">
              {report.assignedTo ? `Assigned: ${report.assignedTo}` : 'Unassigned'}
              {assignedByAi[report.id] ? ` · AI ${assignedByAi[report.id]}%` : ''}
            </p>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="card px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-slate-700">No reports found</p>
            <p className="mt-1 text-[12.5px] text-slate-500">
              Try another status tab or search term.
            </p>
          </div>
        )}
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Report ID
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Equipment
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Location
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Reported By
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Priority
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </th>
                <th className="px-5 py-3.5 text-right text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report, index) => (
                <tr
                  key={report.id}
                  className={`border-b border-slate-100 transition last:border-0 ${
                    index % 2 === 1
                      ? 'bg-slate-50/60 hover:bg-blue-50/60'
                      : 'bg-white hover:bg-blue-50/60'
                  }`}
                >
                  <td className="whitespace-nowrap px-5 py-4 text-[13px] font-semibold text-blue-600">
                    {report.id}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <EquipmentThumb category={report.category} className="h-8 w-8" />
                      <span className="text-[13.5px] text-slate-800">{report.equipment}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13px] text-slate-600">
                    {report.location}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13px] text-slate-600">
                    {report.reportedBy}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <PriorityBadge priority={report.priority} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <select
                      value={report.status}
                      onChange={(e) => setStatus(report.id, e.target.value as ReportStatus)}
                      aria-label={`Status for ${report.id}`}
                      className={`rounded-lg border px-2.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide focus:outline-none focus:ring-4 focus:ring-blue-100 ${STATUS_TONE[report.status]}`}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13px] text-slate-600">
                    {report.date}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openTriage(report)}
                      disabled={report.status === 'RESOLVED' || report.status === 'CANCELLED'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[12.5px] font-semibold text-violet-700 transition hover:border-violet-600 hover:bg-violet-600 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                      {report.assignedTo ? 'Re-run AI triage' : 'Assign with AI'}
                    </button>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      {report.assignedTo ? `Assigned: ${report.assignedTo}` : 'Unassigned'}
                      {assignedByAi[report.id] ? ` · AI ${assignedByAi[report.id]}%` : ''}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-slate-700">No reports found</p>
            <p className="mt-1 text-[13px] text-slate-500">
              Try another status tab or search term.
            </p>
          </div>
        )}
      </div>

      <p className="mt-4 text-[13px] text-slate-500">
        Showing {filtered.length} of {rows.length} reports · ordered by the priority queue (max
        heap: Critical → High → Medium → Low) ·{' '}
        AI triage reads the report photo with a server-side vision model (Gemini Flash on the free
        tier, or a local model when the backend is set to Ollama) and falls back to the built-in
        classifier if it is offline{' '}
        · assignments are local until the API is connected
      </p>

      {triaging && (
        <Modal
          title="AI Triage"
          subtitle={`${triaging.id} · ${triaging.equipment} · ${triaging.location}`}
          onClose={() => setTriaging(null)}
        >
          {triageState === 'scanning' && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                <Loader2 className="h-7 w-7 animate-spin" />
              </span>
              <p className="text-[14px] font-semibold text-slate-800">Reading the report…</p>
              <p className="max-w-xs text-[12.5px] leading-relaxed text-slate-500">
                Scanning the report photo to detect the equipment and damage type, then matching
                the technician whose specialty fits and whose workload is lightest.
              </p>
            </div>
          )}

          {triageState === 'error' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 px-3.5 py-3 text-[12.5px] text-red-700 ring-1 ring-inset ring-red-200">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                <p>{triageError}</p>
              </div>
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setTriaging(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => void runTriage(triaging)}
                  className="rounded-lg bg-violet-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-violet-700"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {triageState === 'ready' && verdict && (
            <div className="space-y-4">
              {triaging.photo ? (
                <figure className="overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={triaging.photo}
                    alt={`Damage photo attached to ${triaging.id}`}
                    className="max-h-52 w-full bg-slate-100 object-cover"
                  />
                  <figcaption className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 text-[11.5px] font-semibold text-slate-500">
                    <ScanLine className="h-3.5 w-3.5" strokeWidth={2.1} />
                    Report photo read by AI triage
                  </figcaption>
                </figure>
              ) : (
                <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[12px] text-slate-500">
                  No photo was attached to this report, so triage used the written details only.
                </p>
              )}

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                    Detected issue
                  </p>
                  <p className="mt-0.5 text-[12.5px] font-semibold text-slate-800">
                    {verdict.issue}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                    Priority
                  </p>
                  <div className="mt-1">
                    <PriorityBadge priority={verdict.priority} />
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                    Skill needed
                  </p>
                  <p className="mt-0.5 text-[12.5px] font-semibold text-slate-800">
                    {verdict.skill}
                  </p>
                </div>
              </div>

              {verdict.signals.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11.5px] font-semibold text-slate-500">Signals:</span>
                  {verdict.signals.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-violet-500">
                  Routed to
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-600 text-[13px] font-bold text-white">
                    {verdict.technician.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-slate-900">
                      {verdict.technician.name}
                    </p>
                    <p className="truncate text-[12px] text-slate-500">
                      {verdict.technician.specialty} · {verdict.technician.assigned.length} active
                      job{verdict.technician.assigned.length === 1 ? '' : 's'} ·{' '}
                      {verdict.technician.status}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11.5px] font-bold text-violet-700 ring-1 ring-inset ring-violet-200">
                    {verdict.matchScore}% match
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11.5px] font-semibold text-slate-500">
                  <span>Triage confidence</span>
                  <span className="text-slate-800">{Math.round(verdict.confidence * 100)}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${Math.round(verdict.confidence * 100)}%` }}
                  />
                </div>
              </div>

              <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-slate-600">
                {verdict.summary}
              </p>

              <p className="text-[11.5px] leading-relaxed text-slate-400">
                {verdict.engine === 'model'
                  ? `Read by ${verdict.model ?? 'the vision model'}. Confirming hands this job to the technician above.`
                  : verdict.fallbackReason
                    ? `The AI model could not be reached (${verdict.fallbackReason}), so the built-in classifier triaged this one.`
                    : 'Built-in classifier — this report was triaged from its text alone.'}
              </p>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setTriaging(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyAssignment(triaging, verdict)
                    setTriaging(null)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-violet-700"
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                  Assign to {verdict.technician.name}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
