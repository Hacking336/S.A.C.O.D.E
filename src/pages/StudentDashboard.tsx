import { Link } from 'react-router-dom'
import {
  Megaphone,
  FileText,
  PlusCircle,
  ClipboardList,
  Monitor,
  BookOpen,
  ArrowRight,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard, type Tone } from '../components/StatCard'
import { StatusBadge, PriorityBadge } from '../components/Badges'
import { announcements, quickActions, reports, studentStats } from '../data/mock'

const ACTION_ICONS: Record<string, LucideIcon> = {
  plus: PlusCircle,
  list: ClipboardList,
  monitor: Monitor,
  book: BookOpen,
}

const ANNOUNCEMENT_TONE = {
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-500',
}

export default function StudentDashboard() {
  const recent = reports.slice(0, 3)

  return (
    <>
      <PageHeader
        title={
          <>
            Welcome back, Juan Dela Cruz! <span className="align-middle">👋</span>
          </>
        }
        subtitle="Here's what's happening with your reports today."
        variant="student"
      />

      {/* --------------------------- Stat cards --------------------------- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {studentStats.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            sub={stat.sub}
            tone={stat.tone as Tone}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* ------------------------- Announcements -------------------------- */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-600">
              <Megaphone className="h-[17px] w-[17px]" strokeWidth={2} />
            </span>
            <h2 className="text-[17px] font-bold text-slate-900">Recent Announcements</h2>
          </div>
          <Link
            to="/announcements"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-card transition hover:bg-slate-50"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {announcements.map((item) => (
            <article
              key={item.id}
              className="card flex items-start gap-4 p-4 transition-shadow hover:shadow-card-hover"
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                  ANNOUNCEMENT_TONE[item.tone]
                }`}
              >
                <FileText className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-[12.5px] text-slate-400">
                {item.date}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* -------------------------- Quick actions ------------------------- */}
      <section className="mt-8">
        <h2 className="mb-4 text-[17px] font-bold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = ACTION_ICONS[action.icon]
            return (
              <Link
                key={action.title}
                to={action.to}
                className="card group flex items-start gap-3.5 p-5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-card-hover"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-[14.5px] font-semibold text-slate-900">
                    {action.title}
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-slate-500">
                    {action.description}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ---------------------------- My reports -------------------------- */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-slate-900">My Reports</h2>
          <Link
            to="/my-reports"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-card transition hover:bg-slate-50"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full border-collapse text-left">
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
                  Status
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Date Reported
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Priority
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {recent.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4 text-[13.5px] font-semibold text-blue-600">
                    <Link to={`/reports/${report.id}`}>{report.id}</Link>
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-slate-700">{report.equipment}</td>
                  <td className="px-5 py-4 text-[13.5px] text-slate-600">{report.location}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-slate-600">{report.date}</td>
                  <td className="px-5 py-4">
                    <PriorityBadge priority={report.priority} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/reports/${report.id}`}
                      className="text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View
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
