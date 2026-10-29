import { useState } from 'react'
import {
  Building2,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { studentProfile } from '../data/mock'

export default function Profile() {
  const [form, setForm] = useState({
    fullName: studentProfile.fullName,
    email: studentProfile.email,
    studentId: studentProfile.studentId,
    department: studentProfile.department,
    program: studentProfile.program,
    yearLevel: studentProfile.yearLevel,
    phone: studentProfile.phone,
  })

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account details." variant="student" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        {/* --------------------------- Identity card -------------------------- */}
        <section className="card h-fit p-6 text-center">
          <div className="mx-auto grid h-[88px] w-[88px] place-items-center rounded-full bg-blue-600 text-[30px] font-bold text-white ring-4 ring-blue-50">
            {studentProfile.initials}
          </div>
          <h2 className="mt-4 text-[18px] font-bold text-slate-900">{studentProfile.fullName}</h2>
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11.5px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
            {studentProfile.role}
          </span>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-left">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>
                <p className="truncate text-[13px] text-slate-700">{studentProfile.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                  Student ID
                </p>
                <p className="text-[13px] text-slate-700">{studentProfile.studentId}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                  Department
                </p>
                <p className="text-[13px] text-slate-700">{studentProfile.department}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                  Program
                </p>
                <p className="text-[13px] text-slate-700">
                  {studentProfile.program} · {studentProfile.yearLevel}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 border-t border-slate-100 pt-4 text-[11.5px] text-slate-400">
            Member since {studentProfile.memberSince}
          </p>
        </section>

        {/* ---------------------------- Details form -------------------------- */}
        <div className="space-y-5">
          <section className="card p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="h-4 w-1 rounded-full bg-blue-600" />
              <h2 className="text-[15.5px] font-bold text-slate-900">Account Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  className="field-input"
                  value={form.fullName}
                  onChange={update('fullName')}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  value={form.email}
                  onChange={update('email')}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="studentId">
                  Student ID
                </label>
                <input
                  id="studentId"
                  className="field-input bg-slate-50 text-slate-500"
                  value={form.studentId}
                  onChange={update('studentId')}
                  readOnly
                />
              </div>

              <div>
                <label className="field-label" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  className="field-input"
                  value={form.phone}
                  onChange={update('phone')}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="department">
                  Department
                </label>
                <input
                  id="department"
                  className="field-input"
                  value={form.department}
                  onChange={update('department')}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="yearLevel">
                  Year Level
                </label>
                <input
                  id="yearLevel"
                  className="field-input"
                  value={form.yearLevel}
                  onChange={update('yearLevel')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="field-label" htmlFor="program">
                  Program
                </label>
                <input
                  id="program"
                  className="field-input"
                  value={form.program}
                  onChange={update('program')}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <p className="text-[12.5px] text-slate-400">
                Saving will be enabled once the Spring Boot API is connected.
              </p>
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[13.5px] font-semibold text-white opacity-50"
              >
                <Save className="h-4 w-4" strokeWidth={2} />
                Save Changes
              </button>
            </div>
          </section>

          {/* --------------------------- Password --------------------------- */}
          <section className="card p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="h-4 w-1 rounded-full bg-blue-600" />
              <h2 className="text-[15.5px] font-bold text-slate-900">Change Password</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="currentPassword">
                  Current Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    strokeWidth={1.9}
                  />
                  <input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    strokeWidth={1.9}
                  />
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="At least 8 characters"
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    strokeWidth={1.9}
                  />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-type new password"
                    className="field-input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <p className="text-[12.5px] text-slate-400">
                Password changes are handled by the IT department for now.
              </p>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-[13.5px] font-semibold text-slate-500 opacity-70"
              >
                Update Password
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
