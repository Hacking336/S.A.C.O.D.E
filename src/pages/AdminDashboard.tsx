import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowUpNarrowWide, Eye, ChevronRight } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard, type Tone } from '../components/StatCard'
import { StatusBadge, PriorityBadge } from '../components/Badges'
import { adminStats, recentAdminReports, reportsByPriority, reportsByStatus } from '../data/mock'
import { ReportPriorityQueue } from '../lib/reportPriorityQueue'

const AXIS_TICK = { fill: '#94A3B8', fontSize: 12 }

// DSA #1 — max heap: Critical first, then High, Medium, Low.
const recentReportsByUrgency = ReportPriorityQueue.from(recentAdminReports).drainSorted()

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="card p-6">
      <h2 className="mb-5 text-[15.5px] font-bold text-slate-900">{title}</h2>
      {children}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of all equipment reports across the campus."
        variant="admin"
      />

      {/* --------------------------- Stat cards --------------------------- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {adminStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            tone={stat.tone as Tone}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* ------------------------------ Charts ---------------------------- */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Reports by Status">
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,220px)_1fr]">
            <div className="relative h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportsByStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {reportsByStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} reports`, name]}
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      fontSize: 12.5,
                      boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-[24px] font-bold leading-none text-slate-900">128</p>
                  <p className="mt-1 text-[11.5px] font-medium text-slate-400">Total</p>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {reportsByStatus.map((item) => (
                <li key={item.name} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 truncate text-[13px] text-slate-600">{item.name}</span>
                  <span className="text-[13.5px] font-bold text-slate-900">{item.value}</span>
                  <span className="w-11 text-right text-[12px] text-slate-400">{item.percent}</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>

        <ChartCard title="Reports by Priority">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportsByPriority}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
                barCategoryGap={22}
              >
                <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(37,99,235,0.06)' }}
                  formatter={(value: number) => [`${value} reports`, 'Reports']}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    fontSize: 12.5,
                    boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {reportsByPriority.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* -------------------------- Recent reports ------------------------ */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-bold text-slate-900">Recent Reports</h2>
            <span className="hidden items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-200 sm:inline-flex">
              <ArrowUpNarrowWide className="h-3 w-3" strokeWidth={2.2} />
              Urgent first
            </span>
          </div>
          <Link
            to="/admin/reports"
            className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
          >
            View All Reports
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* phone: one card per report */}
        <div className="space-y-3 md:hidden">
          {recentReportsByUrgency.map((report) => (
            <Link key={report.id} to={`/reports/${report.id}`} className="card block p-4">
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
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <StatusBadge status={report.status} />
                <span className="text-[12px] text-slate-400">{report.date}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="card hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {['Report ID', 'Equipment', 'Location', 'Reported By', 'Status', 'Priority', 'Date Reported', 'Actions'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentReportsByUrgency.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] font-semibold text-blue-600">
                    <Link to={`/reports/${report.id}`}>{report.id}</Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] text-slate-700">
                    {report.equipment}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] text-slate-600">
                    {report.location}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] text-slate-600">
                    {report.reportedBy}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <PriorityBadge priority={report.priority} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] text-slate-600">
                    {report.date}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/reports/${report.id}`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      aria-label={`View ${report.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
