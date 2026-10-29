import { useState } from 'react'
import { CheckCircle2, ClipboardList, Phone, Plus, Wrench } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Modal } from '../../components/Modal'
import {
  allReports,
  maintenanceStaff,
  type MaintenanceStaff,
  type StaffSpecialty,
} from '../../data/adminMock'

const SPECIALTY_STYLES: Record<StaffSpecialty, string> = {
  'IT / Computers': 'bg-blue-100 text-blue-700 ring-blue-200',
  Electrical: 'bg-amber-100 text-amber-700 ring-amber-200',
  Plumbing: 'bg-cyan-100 text-cyan-700 ring-cyan-200',
  'General Repair': 'bg-slate-100 text-slate-600 ring-slate-200',
  'Air Conditioning': 'bg-violet-100 text-violet-700 ring-violet-200',
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<MaintenanceStaff[]>(maintenanceStaff)
  const [target, setTarget] = useState<MaintenanceStaff | null>(null)
  const [reportId, setReportId] = useState('')

  const available = staff.filter((member) => member.status === 'Available').length
  const onTask = staff.length - available
  const openReports = allReports.filter(
    (report) => report.status !== 'RESOLVED' && report.status !== 'CANCELLED',
  )

  const openAssign = (member: MaintenanceStaff) => {
    const candidates = openReports.filter((report) => !member.assigned.includes(report.id))
    setTarget(member)
    setReportId(candidates[0]?.id ?? '')
  }

  const assign = () => {
    if (!target || !reportId) return
    setStaff((prev) =>
      prev.map((member) =>
        member.id === target.id
          ? { ...member, assigned: [...member.assigned, reportId], status: 'On Task' }
          : member,
      ),
    )
    setTarget(null)
    setReportId('')
  }

  return (
    <>
      <PageHeader
        title="Maintenance Staff"
        subtitle="Assign repairs to the maintenance team."
        variant="admin"
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-[12.5px] font-semibold text-green-700 ring-1 ring-inset ring-green-200">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          {available} available
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-[12.5px] font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">
          <Wrench className="h-4 w-4" strokeWidth={2} />
          {onTask} on task
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
          <ClipboardList className="h-4 w-4" strokeWidth={2} />
          {staff.reduce((sum, member) => sum + member.assigned.length, 0)} active assignments
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {staff.map((member) => {
          const busy = member.status === 'On Task'

          return (
            <article key={member.id} className="card flex flex-col p-5">
              <div className="flex items-start gap-3.5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-[15px] font-bold text-white ring-2 ring-slate-100">
                  {member.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[15px] font-bold text-slate-900">{member.name}</h2>
                  <p className="text-[11.5px] text-slate-400">{member.id}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                    busy
                      ? 'bg-violet-100 text-violet-700 ring-violet-200'
                      : 'bg-green-100 text-green-700 ring-green-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${busy ? 'bg-violet-500' : 'bg-green-500'}`}
                  />
                  {member.status}
                </span>
              </div>

              <span
                className={`mt-4 inline-flex w-fit items-center rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${
                  SPECIALTY_STYLES[member.specialty]
                }`}
              >
                {member.specialty}
              </span>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-slate-500">Current assignments</span>
                  <span className="font-bold text-slate-800">{member.assigned.length}</span>
                </div>

                {member.assigned.length === 0 ? (
                  <p className="text-[12px] text-slate-400">No active tasks — ready to assign.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {member.assigned.map((id) => (
                      <span
                        key={id}
                        className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                )}

                <p className="flex items-center gap-1.5 pt-1 text-[11.5px] text-slate-400">
                  <Phone className="h-3 w-3" strokeWidth={2} />
                  {member.phone} · {member.shift}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openAssign(member)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-[13px] font-semibold text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Assign Task
              </button>
            </article>
          )
        })}
      </div>

      {target && (
        <Modal
          title={`Assign task to ${target.name}`}
          subtitle={`${target.specialty} · ${target.status}`}
          onClose={() => setTarget(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="report">
                Open report
              </label>
              <select
                id="report"
                className="field-input"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
              >
                {openReports
                  .filter((report) => !target.assigned.includes(report.id))
                  .map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.id} · {report.equipment} · {report.location} ({report.priority})
                    </option>
                  ))}
              </select>
              <p className="mt-2 text-[12px] text-slate-400">
                Reports already held by this staff member are hidden.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setTarget(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={assign}
                disabled={!reportId}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
