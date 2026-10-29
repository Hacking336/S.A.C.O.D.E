import type { Priority, ReportStatus } from '../data/mock'

const STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 ring-amber-200',
  'IN PROGRESS': 'bg-violet-100 text-violet-700 ring-violet-200',
  RESOLVED: 'bg-green-100 text-green-700 ring-green-200',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const PRIORITY_STYLES: Record<Priority, string> = {
  Critical: 'bg-red-600 text-white ring-red-600',
  High: 'bg-red-100 text-red-700 ring-red-200',
  Medium: 'bg-orange-100 text-orange-700 ring-orange-200',
  Low: 'bg-green-100 text-green-700 ring-green-200',
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wider ring-1 ring-inset ${
        STATUS_STYLES[status]
      }`}
    >
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${
        PRIORITY_STYLES[priority]
      }`}
    >
      {priority}
    </span>
  )
}
