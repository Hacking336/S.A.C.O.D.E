import { useMemo, useState } from 'react'
import { ArrowUpNarrowWide, Search, UserPlus } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Modal } from '../../components/Modal'
import { PriorityBadge } from '../../components/Badges'
import { EquipmentThumb } from '../../components/EquipmentThumb'
import { ReportPriorityQueue } from '../../lib/reportPriorityQueue'
import {
  allReports,
  maintenanceStaff,
  type AdminReportRow,
} from '../../data/adminMock'
import type { ReportStatus } from '../../data/mock'

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

export default function AdminReports() {
  const [rows, setRows] = useState<AdminReportRow[]>(allReports)
  const [tab, setTab] = useState<Tab>('All')
  const [query, setQuery] = useState('')
  const [assigning, setAssigning] = useState<AdminReportRow | null>(null)
  const [staffId, setStaffId] = useState(maintenanceStaff[0].id)

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

  const setStatus = (id: string, status: ReportStatus) =>
    setRows((prev) => prev.map((report) => (report.id === id ? { ...report, status } : report)))

  const assign = () => {
    if (!assigning) return
    const member = maintenanceStaff.find((item) => item.id === staffId)
    if (!member) return

    setRows((prev) =>
      prev.map((report) =>
        report.id === assigning.id
          ? {
              ...report,
              assignedTo: member.name,
              status: report.status === 'PENDING' ? 'IN PROGRESS' : report.status,
            }
          : report,
      ),
    )
    setAssigning(null)
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
        subtitle="Review and manage every campus damage report, most urgent first."
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
              onClick={() => {
                setAssigning(report)
                setStaffId(maintenanceStaff[0].id)
              }}
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12.5px] font-semibold text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
            >
              <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />
              Assign to Staff
            </button>
            <p className="mt-1.5 text-center text-[11px] text-slate-400">
              {report.assignedTo ? `Assigned: ${report.assignedTo}` : 'Unassigned'}
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
                      onClick={() => {
                        setAssigning(report)
                        setStaffId(maintenanceStaff[0].id)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12.5px] font-semibold text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />
                      Assign to Staff
                    </button>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      {report.assignedTo ? `Assigned: ${report.assignedTo}` : 'Unassigned'}
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
        heap: Critical → High → Medium → Low) · status changes are local until the API is connected
      </p>

      {assigning && (
        <Modal
          title="Assign to Staff"
          subtitle={`${assigning.id} · ${assigning.equipment} · ${assigning.location}`}
          onClose={() => setAssigning(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="staff">
                Maintenance staff
              </label>
              <select
                id="staff"
                className="field-input"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
              >
                {maintenanceStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} — {member.specialty} ({member.status})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[12px] text-slate-400">
                Assigning a pending report moves it to In Progress.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setAssigning(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={assign}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >
                Assign Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
