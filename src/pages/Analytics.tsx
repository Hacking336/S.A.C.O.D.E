import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import {
  analyticsStats,
  reportsByCategory,
  reportsOverTime,
  topEquipment,
  topLocations,
} from '../data/mock'

const AXIS_TICK = { fill: '#94A3B8', fontSize: 12 }

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #E2E8F0',
  fontSize: 12.5,
  boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
}

function renderLegend(props: { payload?: readonly { value: string; color?: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-5 pt-2">
      {props.payload?.map((entry) => (
        <span key={entry.value} className="flex items-center gap-2 text-[12.5px] text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </span>
      ))}
    </div>
  )
}

function RankedTable({
  title,
  data,
  accent,
}: {
  title: string
  data: { name: string; value: number }[]
  accent: string
}) {
  const max = Math.max(...data.map((item) => item.value))

  return (
    <div className="card p-6">
      <h3 className="mb-5 text-[15.5px] font-bold text-slate-900">{title}</h3>
      <ul className="space-y-4">
        {data.map((item, index) => (
          <li key={item.name} className="grid grid-cols-[18px_1fr_auto] items-center gap-3">
            <span className="text-[12.5px] font-bold text-slate-400">{index + 1}</span>
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[13.5px] text-slate-700">{item.name}</span>
                <span className="text-[13.5px] font-bold text-slate-900">{item.value}</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.value / max) * 100}%`, backgroundColor: accent }}
                />
              </div>
            </div>
            <span className="w-0" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Analytics() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Analyze equipment reports and maintenance performance."
        variant="admin"
        extra={
          <select
            aria-label="Date range"
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-600 shadow-card focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            defaultValue="This Month"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        }
      />

      {/* ---------------------------- Metric cards --------------------------- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsStats.map((stat) => {
          const negative = stat.delta.trim().startsWith('-')
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[28px] font-bold leading-none text-slate-900">
                    {stat.value}
                    {stat.unit && (
                      <span className="ml-1.5 text-[13px] font-semibold text-slate-400">
                        {stat.unit}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 truncate text-[13.5px] font-semibold text-slate-700">
                    {stat.label}
                  </p>
                </div>
              </div>
              <p
                className={`mt-3 flex items-center gap-1.5 text-[12.5px] font-medium ${
                  negative ? 'text-green-600' : 'text-green-600'
                }`}
              >
                {negative ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                {stat.delta}
              </p>
            </div>
          )
        })}
      </div>

      {/* --------------------------- Reports over time ----------------------- */}
      <section className="card mt-8 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15.5px] font-bold text-slate-900">Reports Over Time</h2>
        </div>
        <div className="h-[230px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportsOverTime} margin={{ top: 8, right: 24, bottom: 4, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" vertical={false} />
              <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend content={renderLegend} />
              <Line
                type="monotone"
                dataKey="submitted"
                name="Submitted"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* --------------------------- Reports by category --------------------- */}
      <section className="card mt-8 p-6">
        <h2 className="mb-5 text-[15.5px] font-bold text-slate-900">Reports by Category</h2>
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
          <div className="relative h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportsByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={104}
                  paddingAngle={2}
                  stroke="none"
                >
                  {reportsByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} reports`, name]}
                  contentStyle={TOOLTIP_STYLE}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-[26px] font-bold leading-none text-slate-900">128</p>
                <p className="mt-1 text-[11.5px] font-medium text-slate-400">Total</p>
              </div>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {reportsByCategory.map((item) => (
              <li key={item.name} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 truncate text-[13.5px] text-slate-600">{item.name}</span>
                <span className="text-[13.5px] font-bold text-slate-900">{item.value}</span>
                <span className="w-14 text-right text-[12px] text-slate-400">{item.percent}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------- Top locations / equipment ------------------ */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RankedTable title="Top Locations with Most Reports" data={topLocations} accent="#2563EB" />
        <RankedTable title="Top Equipment with Most Issues" data={topEquipment} accent="#8B5CF6" />
      </div>
    </>
  )
}
