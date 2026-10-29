import { useMemo, useState } from 'react'
import { Activity, Filter } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { auditEntries, type AuditActionType } from '../../data/adminMock'

const ACTION_STYLES: Record<AuditActionType, string> = {
  'Status Change': 'bg-violet-100 text-violet-700 ring-violet-200',
  'Report Update': 'bg-blue-100 text-blue-700 ring-blue-200',
  'User Management': 'bg-amber-100 text-amber-700 ring-amber-200',
  Equipment: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Authentication: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const ACTION_TYPES: (AuditActionType | 'All')[] = [
  'All',
  'Status Change',
  'Report Update',
  'User Management',
  'Equipment',
  'Authentication',
]

export default function AdminAuditLogs() {
  const [actionType, setActionType] = useState<AuditActionType | 'All'>('All')
  const [user, setUser] = useState('All')

  const users = useMemo(
    () => ['All', ...Array.from(new Set(auditEntries.map((entry) => entry.user)))],
    [],
  )

  const filtered = useMemo(
    () =>
      auditEntries.filter((entry) => {
        const matchesType = actionType === 'All' || entry.actionType === actionType
        const matchesUser = user === 'All' || entry.user === user
        return matchesType && matchesUser
      }),
    [actionType, user],
  )

  return (
    <>
      <PageHeader
        title="Audit Logs"
        subtitle="Full trail of system activity."
        variant="admin"
      />

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-500">
          <Filter className="h-4 w-4 text-slate-400" strokeWidth={2} />
          Filter by
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as AuditActionType | 'All')}
            aria-label="Filter by action type"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'All' ? 'All action types' : type}
              </option>
            ))}
          </select>

          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            aria-label="Filter by user"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            {users.map((name) => (
              <option key={name} value={name}>
                {name === 'All' ? 'All users' : name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setActionType('All')
              setUser('All')
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ------------------------- Phone card list ------------------------ */}
      <div className="space-y-3 md:hidden">
        {filtered.map((entry) => (
          <article key={entry.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${ACTION_STYLES[entry.actionType]}`}
              >
                {entry.actionType.toUpperCase()}
              </span>
              <span className="text-[11.5px] text-slate-400">{entry.timestamp}</span>
            </div>
            <p className="mt-2 text-[13.5px] font-semibold text-slate-900">{entry.user}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{entry.action}</p>
            <p className="mt-2 font-mono text-[11.5px] text-slate-400">{entry.ip}</p>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="card px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-slate-700">No log entries match</p>
            <p className="mt-1 text-[12.5px] text-slate-500">
              Reset the filters to see the full activity trail.
            </p>
          </div>
        )}
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Timestamp
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  User
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Action Type
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Action Performed
                </th>
                <th className="px-5 py-3.5 text-right text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`border-b border-slate-100 transition last:border-0 ${
                    index % 2 === 1
                      ? 'bg-slate-50/60 hover:bg-blue-50/60'
                      : 'bg-white hover:bg-blue-50/60'
                  }`}
                >
                  <td className="whitespace-nowrap px-5 py-3.5 text-[12.5px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 shrink-0 text-slate-300" strokeWidth={2} />
                      {entry.timestamp}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-semibold text-slate-800">
                    {entry.user}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${ACTION_STYLES[entry.actionType]}`}
                    >
                      {entry.actionType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600">{entry.action}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[12px] text-slate-500">
                    {entry.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-slate-700">No log entries match</p>
            <p className="mt-1 text-[13px] text-slate-500">
              Reset the filters to see the full activity trail.
            </p>
          </div>
        )}
      </div>

      <p className="mt-4 text-[13px] text-slate-500">
        Showing {filtered.length} of {auditEntries.length} log entries
      </p>
    </>
  )
}
