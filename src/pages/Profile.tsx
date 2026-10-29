import { useRef, useState } from 'react'
import {
  Briefcase,
  Building2,
  Camera,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { UserAvatar, fileToAvatar, storeAvatar, useAvatar } from '../components/Avatar'
import { adminProfile, instructorProfile } from '../data/mock'

export default function Profile({ variant = 'instructor' }: { variant?: 'instructor' | 'admin' }) {
  const isAdmin = variant === 'admin'
  const profile = isAdmin ? adminProfile : instructorProfile
  const photo = useAvatar(variant)

  const [form, setForm] = useState({
    fullName: profile.fullName,
    email: profile.email,
    employeeId: profile.employeeId,
    department: profile.department,
    position: profile.position,
    phone: profile.phone,
  })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBusy(true)
    setError(null)
    try {
      storeAvatar(variant, await fileToAvatar(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That photo could not be saved.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account details." variant={variant} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        {/* --------------------------- Identity card -------------------------- */}
        <section className="card h-fit p-6 text-center">
          <div className="relative mx-auto h-[96px] w-[96px]">
            {photo ? (
              <UserAvatar
                variant={variant}
                initials={profile.initials}
                className="h-[96px] w-[96px] text-[30px] ring-4 ring-blue-50"
                tone={isAdmin ? 'bg-indigo-600' : 'bg-blue-600'}
              />
            ) : (
              <div
                className={`mx-auto grid h-[96px] w-[96px] place-items-center rounded-full text-[30px] font-bold text-white ring-4 ${
                  isAdmin ? 'bg-indigo-600 ring-indigo-50' : 'bg-blue-600 ring-blue-50'
                }`}
              >
                {profile.initials}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              aria-label="Change profile picture"
              className="absolute -bottom-0.5 -right-0.5 grid h-9 w-9 place-items-center rounded-full border-[3px] border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Camera className="h-[15px] w-[15px]" strokeWidth={2.1} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickPhoto}
            />
          </div>

          <p className="mt-3 text-[11.5px] text-slate-400">
            {busy ? 'Saving photo…' : 'JPG or PNG, up to 8 MB'}
          </p>

          <div className="mt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {photo ? 'Change photo' : 'Add photo'}
            </button>
            {photo && (
              <button
                type="button"
                onClick={() => storeAvatar(variant, null)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                Remove
              </button>
            )}
          </div>
          {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
          <p className="mt-2 text-[11px] text-slate-400">Saved on this device.</p>

          <h2 className="mt-4 text-[18px] font-bold text-slate-900">{profile.fullName}</h2>
          <span
            className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset ${
              isAdmin
                ? 'bg-indigo-50 text-indigo-700 ring-indigo-100'
                : 'bg-blue-50 text-blue-700 ring-blue-100'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
            {profile.role}
          </span>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-left">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>
                <p className="truncate text-[13px] text-slate-700">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                  Employee ID
                </p>
                <p className="text-[13px] text-slate-700">{profile.employeeId}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                  Department
                </p>
                <p className="text-[13px] text-slate-700">{profile.department}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                  Position
                </p>
                <p className="text-[13px] text-slate-700">{profile.position}</p>
              </div>
            </div>
          </div>

          <p className="mt-5 border-t border-slate-100 pt-4 text-[11.5px] text-slate-400">
            Member since {profile.memberSince}
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
                <label className="field-label" htmlFor="employeeId">
                  Employee ID
                </label>
                <input
                  id="employeeId"
                  className="field-input bg-slate-50 text-slate-500"
                  value={form.employeeId}
                  onChange={update('employeeId')}
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
                <label className="field-label" htmlFor="position">
                  Position
                </label>
                <input
                  id="position"
                  className="field-input"
                  value={form.position}
                  onChange={update('position')}
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
        </div>
      </div>
    </>
  )
}
