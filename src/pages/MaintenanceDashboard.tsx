import { Link } from 'react-router-dom'
import {
  ArrowUpNarrowWide,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  PlayCircle,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import { ReportPriorityQueue } from '../lib/reportPriorityQueue'
import {
  maintenanceUser,
  setWorkOrderStatus,
  useMyWorkOrders,
  type WorkOrder,
} from '../data/maintenanceMock'

const isOpen = (order: WorkOrder) => order.status === 'PENDING' || order.status === 'IN PROGRESS'

function JobActions({ order }: { order: WorkOrder }) {
  if (order.status === 'PENDING') {
    return (
      <button
        type="button"
        onClick={() => setWorkOrderStatus(order.id, 'IN PROGRESS')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_6px_14px_rgba(37,99,235,0.28)] transition hover:bg-blue-700"
      >
        <PlayCircle className="h-4 w-4" />
        Start Job
      </button>
    )
  }

  if (order.status === 'IN PROGRESS') {
    return (
      <button
        type="button"
        onClick={() => setWorkOrderStatus(order.id, 'RESOLVED')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_6px_14px_rgba(22,163,74,0.28)] transition hover:bg-green-700"
      >
        <CheckCircle2 className="h-4 w-4" />
        Mark Resolved
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-[12.5px] font-semibold text-green-700 ring-1 ring-inset ring-green-200">
      <CheckCircle2 className="h-4 w-4" />
      Completed
    </span>
  )
}

export default function MaintenanceDashboard() {
  const orders = useMyWorkOrders()
  const open = orders.filter(isOpen)
  const inProgress = orders.filter((order) => order.status === 'IN PROGRESS')
  const critical = open.filter((order) => order.priority === 'Critical')
  const resolved = orders.filter((order) => order.status === 'RESOLVED')

  // DSA #1 — same max heap the admin queue uses: Critical before Low.
  const queue = ReportPriorityQueue.from(open).drainSorted()
  const progress = orders.length ? Math.round((resolved.length / orders.length) * 100) : 0

  return (
    <>
      <PageHeader
        title={
          <>
            Welcome back, {maintenanceUser.name}! <span className="align-middle">🔧</span>
          </>
        }
        subtitle="Repair jobs assigned to you, ordered by urgency."
        variant="staff"
      />

      {/* --------------------------- Stat cards --------------------------- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Jobs" value={open.length} sub="Assigned to you" tone="blue" icon="files" />
        <StatCard
          label="In Progress"
          value={inProgress.length}
          sub="Currently being repaired"
          tone="purple"
          icon="wrench"
        />
        <StatCard
          label="Critical"
          value={critical.length}
          sub="Needs immediate attention"
          tone="orange"
          icon="clock"
        />
        <StatCard
          label="Resolved"
          value={resolved.length}
          sub="Completed this week"
          tone="green"
          icon="check"
        />
      </div>

      {/* ---------------------------- Progress ---------------------------- */}
      <div className="card mt-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[13.5px] font-semibold text-slate-800">Today&rsquo;s progress</p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {resolved.length} of {orders.length} assigned jobs completed
            </p>
          </div>
          <span className="text-[22px] font-bold leading-none text-slate-900">{progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-green-500 transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* -------------------------- Assigned jobs ------------------------- */}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-bold text-slate-900">Assigned Jobs</h2>
            <span className="hidden items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-200 sm:inline-flex">
              <ArrowUpNarrowWide className="h-3 w-3" strokeWidth={2.2} />
              Urgent first
            </span>
          </div>
          <Link
            to="/maintenance/tasks"
            className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
          >
            View All Tasks
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {queue.length === 0 ? (
          <div className="card grid place-items-center p-10 text-center">
            <CheckCircle2 className="h-9 w-9 text-green-500" strokeWidth={1.8} />
            <p className="mt-3 text-[14px] font-semibold text-slate-800">No open jobs</p>
            <p className="mt-1 text-[12.5px] text-slate-500">
              Every repair assigned to you has been completed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((order) => (
              <article key={order.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-blue-600">{order.id}</p>
                    <h3 className="truncate text-[15px] font-bold text-slate-900">{order.equipment}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                      <span className="truncate">
                        {order.room} · {order.building}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {order.triage && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide text-violet-700 ring-1 ring-inset ring-violet-200">
                        <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                        AI · {order.triage.confidence}%
                      </span>
                    )}
                    <PriorityBadge priority={order.priority} />
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{order.note}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-400">
                    <span>
                      Reported by {order.reportedBy} · {order.date}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.9} />
                      Due {order.due}
                    </span>
                  </div>
                  <JobActions order={order} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------ Recently completed ---------------------- */}
      {resolved.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-[17px] font-bold text-slate-900">Recently Completed</h2>
          <div className="space-y-3">
            {resolved.map((order) => (
              <article
                key={order.id}
                className="card flex flex-wrap items-start justify-between gap-3 p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-100 text-green-600">
                    <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-slate-900">
                      {order.equipment}
                    </p>
                    <p className="truncate text-[12.5px] text-slate-500">
                      {order.id} · {order.room} · {order.building}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                  <TriangleAlert className="h-3.5 w-3.5 text-green-600" strokeWidth={1.9} />
                  {order.due}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
