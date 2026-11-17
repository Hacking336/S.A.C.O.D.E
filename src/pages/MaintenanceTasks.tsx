import { useMemo, useState } from 'react'
import { CheckCircle2, MapPin, PlayCircle, Search, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import { maintenanceStaff } from '../data/adminMock'
import {
  maintenanceUser,
  setWorkOrderStatus,
  useWorkOrders,
} from '../data/maintenanceMock'

const TABS = ['Open', 'In Progress', 'Resolved', 'All'] as const
type Tab = (typeof TABS)[number]

const matchesTab = (tab: Tab, status: string) => {
  if (tab === 'Open') return status === 'PENDING' || status === 'IN PROGRESS'
  if (tab === 'In Progress') return status === 'IN PROGRESS'
  if (tab === 'Resolved') return status === 'RESOLVED'
  return true
}

export default function MaintenanceTasks() {
  const allOrders = useWorkOrders()
  // AI triage routes each job to the best-fit technician, so the board can be
  // switched to any teammate instead of only showing the signed-in account.
  const [technician, setTechnician] = useState(maintenanceUser.name)
  const orders = useMemo(
    () => allOrders.filter((order) => (order.assignedTo ?? maintenanceUser.name) === technician),
    [allOrders, technician],
  )
  const [tab, setTab] = useState<Tab>('Open')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((order) => {
      const inTab = matchesTab(tab, order.status)
      const inQuery =
        !q ||
        [order.id, order.equipment, order.room, order.building, order.reportedBy].some((field) =>
          field.toLowerCase().includes(q),
        )
      return inTab && inQuery
    })
  }, [orders, tab, query])

  return (
    <>
      <PageHeader
        title="My Tasks"
        subtitle="Every repair job assigned to you, with its current status."
        variant="staff"
      />

      <div className="card mb-5 flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((item) => {
            const count = orders.filter((order) => matchesTab(item, order.status)).length
            return (
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
                <span
                  className={`ml-1.5 text-[11.5px] font-bold ${
                    tab === item ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="technician-filter">
            Technician
          </label>
          <select
            id="technician-filter"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="field-input sm:w-52"
          >
            {maintenanceStaff.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name}
                {member.name === maintenanceUser.name ? ' (you)' : ''}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, rooms or people"
              aria-label="Search tasks"
              className="field-input !pl-9"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card grid place-items-center p-10 text-center">
          <CheckCircle2 className="h-9 w-9 text-slate-300" strokeWidth={1.8} />
          <p className="mt-3 text-[14px] font-semibold text-slate-800">Nothing here</p>
          <p className="mt-1 text-[12.5px] text-slate-500">
            {technician === maintenanceUser.name
              ? 'No jobs match this filter. Try another status or clear the search.'
              : `No jobs are assigned to ${technician} right now.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <article key={order.id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-blue-600">{order.id}</p>
                  <h2 className="truncate text-[15px] font-bold text-slate-900">{order.equipment}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                    <span className="truncate">
                      {order.room} · {order.building}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {order.triage && (
                    <span
                      className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide text-violet-700 ring-1 ring-inset ring-violet-200"
                      title={`AI triage: ${order.triage.issue} · ${order.triage.skill} (${order.triage.confidence}% confidence)`}
                    >
                      <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                      AI · {order.triage.confidence}%
                    </span>
                  )}
                  <PriorityBadge priority={order.priority} />
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-[12.5px] text-slate-500 sm:grid-cols-3">
                <span>
                  <span className="font-semibold text-slate-700">Reported by</span> {order.reportedBy}
                </span>
                <span>
                  <span className="font-semibold text-slate-700">Reported</span> {order.date}
                </span>
                <span>
                  <span className="font-semibold text-slate-700">Due</span> {order.due}
                </span>
              </div>

              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-slate-600">
                {order.note}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                {order.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => setWorkOrderStatus(order.id, 'IN PROGRESS')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-blue-700"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start Job
                  </button>
                )}
                {order.status === 'IN PROGRESS' && (
                  <button
                    type="button"
                    onClick={() => setWorkOrderStatus(order.id, 'RESOLVED')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Resolved
                  </button>
                )}
                {order.status === 'RESOLVED' && (
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
