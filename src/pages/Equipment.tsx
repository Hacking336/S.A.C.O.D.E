import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileWarning, PackageSearch, Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EquipmentThumb } from '../components/EquipmentThumb'
import { equipmentList, type EquipmentItem, type EquipmentStatus } from '../data/mock'

const STATUS_STYLES: Record<EquipmentStatus, string> = {
  Working: 'bg-green-100 text-green-700 ring-green-200',
  'Needs Repair': 'bg-amber-100 text-amber-700 ring-amber-200',
  'Under Maintenance': 'bg-violet-100 text-violet-700 ring-violet-200',
}

const STATUS_TABS = ['All', 'Working', 'Needs Repair', 'Under Maintenance'] as const
type StatusTab = (typeof STATUS_TABS)[number]

function StatusPill({ status }: { status: EquipmentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}

export default function Equipment({ variant = 'student' }: { variant?: 'student' | 'admin' }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusTab>('All')
  const [category, setCategory] = useState('All')

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(equipmentList.map((item) => item.category)))],
    [],
  )

  const filtered = useMemo<EquipmentItem[]>(() => {
    const q = query.trim().toLowerCase()
    return equipmentList.filter((item) => {
      const matchesStatus = status === 'All' || item.status === status
      const matchesCategory = category === 'All' || item.category === category
      const matchesQuery =
        !q ||
        [item.id, item.name, item.brand, item.room, item.building, item.category].some((field) =>
          field.toLowerCase().includes(q),
        )
      return matchesStatus && matchesCategory && matchesQuery
    })
  }, [query, status, category])

  const counts = useMemo(
    () => ({
      Working: equipmentList.filter((item) => item.status === 'Working').length,
      'Needs Repair': equipmentList.filter((item) => item.status === 'Needs Repair').length,
      'Under Maintenance': equipmentList.filter((item) => item.status === 'Under Maintenance')
        .length,
    }),
    [],
  )

  return (
    <>
      <PageHeader
        title="Equipment"
        subtitle={variant === 'admin' ? 'Manage the campus asset inventory.' : 'Browse all campus equipment.'}
        variant={variant}
      />

      {/* --------------------------- Filter bar --------------------------- */}
      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex flex-wrap items-center gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatus(tab)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition ${
                status === tab
                  ? 'bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.28)]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {tab}
              {tab !== 'All' && (
                <span
                  className={`rounded-full px-1.5 text-[11px] font-bold ${
                    status === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13.5px] text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option === 'All' ? 'All categories' : option}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
            />
            <input
              type="search"
              placeholder="Search equipment, ID or room..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-[260px] rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* ---------------------------- Data table --------------------------- */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Equipment ID
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Category
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Brand / Model
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Location
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-[13px] font-semibold text-blue-600">
                    {item.id}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <EquipmentThumb category={item.category} className="h-9 w-9" />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-900">{item.name}</p>
                        <p className="text-[12px] text-slate-400">
                          Serviced {item.lastServiced}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] text-slate-600">
                    {item.category}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] text-slate-600">
                    {item.brand}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13.5px] text-slate-700">{item.room}</p>
                    <p className="text-[12px] text-slate-400">{item.building}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/report-damage')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12.5px] font-semibold text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <FileWarning className="h-3.5 w-3.5" strokeWidth={2} />
                      Report Issue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="grid place-items-center px-6 py-20 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
              <PackageSearch className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-[15px] font-semibold text-slate-700">No equipment found</p>
            <p className="mt-1 text-[13px] text-slate-500">
              Try a different search term, category or status filter.
            </p>
          </div>
        )}
      </div>

      <p className="mt-4 text-[13px] text-slate-500">
        Showing {filtered.length} of {equipmentList.length} equipment
      </p>
    </>
  )
}
