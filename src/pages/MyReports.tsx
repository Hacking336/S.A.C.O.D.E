import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/Badges'
import { EquipmentThumb } from '../components/EquipmentThumb'
import { reports, type Priority, type ReportStatus } from '../data/mock'

const TABS = ['All', 'Pending', 'In Progress', 'Resolved', 'Cancelled'] as const
const PAGE_SIZE = 5

export default function MyReports() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(reports[0].id)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reports.filter((report) => {
      const matchesTab = tab === 'All' || report.status === tab.toUpperCase()
      const matchesPriority = priority === 'All' || report.priority === priority
      const matchesQuery =
        !q ||
        report.id.toLowerCase().includes(q) ||
        report.equipment.toLowerCase().includes(q) ||
        report.location.toLowerCase().includes(q) ||
        report.building.toLowerCase().includes(q)
      return matchesTab && matchesPriority && matchesQuery
    })
  }, [tab, query, priority])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  const goTo = (next: number) => setPage(Math.min(Math.max(next, 1), totalPages))

  return (
    <>
      <PageHeader
        title="My Reports"
        subtitle="View and track all your submitted reports."
        variant="instructor"
      />

      {/* --------------------------- Filter bar --------------------------- */}
      <div className="card mb-5 flex flex-wrap items-center justify-between gap-4 p-3.5">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item)
                setPage(1)
              }}
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

        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
            />
            <input
              type="search"
              placeholder="Search reports..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-[230px]"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-panel">
                {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setPriority(option)
                      setFilterOpen(false)
                      setPage(1)
                    }}
                    className={`block w-full px-4 py-2 text-left text-[13px] transition ${
                      priority === option
                        ? 'bg-blue-50 font-semibold text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option === 'All' ? 'All priorities' : `Priority: ${option}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------- Report list -------------------------- */}
      {visible.length === 0 ? (
        <div className="card grid place-items-center px-6 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Inbox className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-slate-700">No reports found</p>
          <p className="mt-1 text-[13px] text-slate-500">Try a different search term or filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => {
                setSelectedId(report.id)
                navigate(`/reports/${report.id}`)
              }}
              className={`card flex w-full flex-wrap items-center gap-4 border-l-4 p-4 text-left transition hover:shadow-card-hover ${
                selectedId === report.id
                  ? 'border-l-blue-600'
                  : 'border-l-transparent hover:border-l-slate-300'
              }`}
            >
              <EquipmentThumb category={report.category} className="h-14 w-14" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[13px] font-bold text-blue-600">{report.id}</span>
                  <span className="text-[14.5px] font-semibold text-slate-900">
                    {report.equipment}
                  </span>
                </div>
                <p className="mt-1 truncate text-[13px] text-slate-500">
                  {report.room} <span className="text-slate-300">·</span> {report.building}
                </p>
                <p className="mt-0.5 text-[12.5px] text-slate-400">
                  {report.date} <span className="text-slate-300">·</span> {report.time}
                </p>
              </div>

              <span className="ml-auto shrink-0">
                <StatusBadge status={report.status as ReportStatus} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ---------------------------- Pagination --------------------------- */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-slate-500">
          Showing {filtered.length === 0 ? 0 : start + 1} to{' '}
          {Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} reports
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 1}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => goTo(number)}
              className={`h-9 min-w-[36px] rounded-lg border px-2 text-[13.5px] font-semibold transition ${
                number === safePage
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {number}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goTo(safePage + 1)}
            disabled={safePage === totalPages}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )
}
