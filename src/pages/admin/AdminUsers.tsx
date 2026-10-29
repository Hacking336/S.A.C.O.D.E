import { useMemo, useState, type FormEvent } from 'react'
import { Pencil, Plus, Search, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Modal } from '../../components/Modal'
import {
  directoryUsers,
  type DirectoryUser,
  type UserRole,
  type UserStatus,
} from '../../data/adminMock'

const ROLE_STYLES: Record<UserRole, string> = {
  Admin: 'bg-blue-100 text-blue-700 ring-blue-200',
  'Maintenance Staff': 'bg-green-100 text-green-700 ring-green-200',
  Instructor: 'bg-slate-100 text-slate-600 ring-slate-200',
}

interface Draft {
  id?: string
  name: string
  email: string
  role: UserRole
  department: string
  status: UserStatus
}

const EMPTY_DRAFT: Draft = {
  name: '',
  email: '',
  role: 'Instructor',
  department: '',
  status: 'Active',
}

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'NA'

export default function AdminUsers() {
  const [rows, setRows] = useState<DirectoryUser[]>(directoryUsers)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((user) => {
      const matchesRole = roleFilter === 'All' || user.role === roleFilter
      const matchesQuery =
        !q ||
        [user.name, user.email, user.department, user.id].some((field) =>
          field.toLowerCase().includes(q),
        )
      return matchesRole && matchesQuery
    })
  }, [rows, query, roleFilter])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft) return

    if (draft.id) {
      setRows((prev) =>
        prev.map((user) =>
          user.id === draft.id
            ? {
                ...user,
                name: draft.name,
                initials: initialsOf(draft.name),
                email: draft.email,
                role: draft.role,
                department: draft.department,
                status: draft.status,
              }
            : user,
        ),
      )
    } else {
      setRows((prev) => [
        {
          id: `USR-${String(prev.length + 1).padStart(3, '0')}`,
          name: draft.name,
          initials: initialsOf(draft.name),
          email: draft.email,
          role: draft.role,
          department: draft.department,
          status: draft.status,
          lastActive: 'Invited',
        },
        ...prev,
      ])
    }

    setDraft(null)
  }

  return (
    <>
      <PageHeader
        title="Users & Roles"
        subtitle="Manage accounts, roles and permissions."
        variant="admin"
        extra={
          <button
            type="button"
            onClick={() => setDraft(EMPTY_DRAFT)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)] transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Add New User
          </button>
        }
      />

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex flex-wrap items-center gap-1">
          {(['All', 'Admin', 'Maintenance Staff', 'Instructor'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold transition ${
                roleFilter === role
                  ? 'bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.28)]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {role === 'All' ? 'All roles' : role}
            </button>
          ))}
        </div>          <div className="relative w-full sm:w-auto">
            <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <input
            type="search"
            placeholder="Search name, email or department..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-[280px]"
          />
        </div>
      </div>

      {/* ------------------------- Phone card list ------------------------ */}
      <div className="space-y-3 md:hidden">
        {filtered.map((user) => (
          <article key={user.id} className="card p-4">
            <div className="flex items-start gap-3">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12.5px] font-bold text-white ${
                  user.role === 'Admin'
                    ? 'bg-blue-600'
                    : user.role === 'Maintenance Staff'
                      ? 'bg-emerald-600'
                      : 'bg-slate-400'
                }`}
              >
                {user.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-[12.5px] text-slate-500">{user.email}</p>
                <p className="truncate text-[11.5px] text-slate-400">{user.department}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${ROLE_STYLES[user.role]}`}
              >
                {user.role === 'Admin' && <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />}
                {user.role.toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                  user.status === 'Active'
                    ? 'bg-green-100 text-green-700 ring-green-200'
                    : 'bg-slate-100 text-slate-500 ring-slate-200'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    user.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'
                  }`}
                />
                {user.status}
              </span>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    status: user.status,
                  })
                }
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-600 transition hover:border-blue-500 hover:text-blue-700"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                Edit
              </button>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="card px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-slate-700">No users match your filters</p>
            <p className="mt-1 text-[12.5px] text-slate-500">
              Try a different role or search term.
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
                  User
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Role
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Department
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
              {filtered.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-b border-slate-100 transition last:border-0 ${
                    index % 2 === 1
                      ? 'bg-slate-50/60 hover:bg-blue-50/60'
                      : 'bg-white hover:bg-blue-50/60'
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white ${
                          user.role === 'Admin'
                            ? 'bg-blue-600'
                            : user.role === 'Maintenance Staff'
                              ? 'bg-emerald-600'
                              : 'bg-slate-400'
                        }`}
                      >
                        {user.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-900">{user.name}</p>
                        <p className="text-[11.5px] text-slate-400">
                          {user.id} · {user.lastActive}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-slate-600">{user.email}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${ROLE_STYLES[user.role]}`}
                    >
                      {user.role === 'Admin' && <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />}
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-slate-600">{user.department}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                        user.status === 'Active'
                          ? 'bg-green-100 text-green-700 ring-green-200'
                          : 'bg-slate-100 text-slate-500 ring-slate-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: user.role,
                          department: user.department,
                          status: user.status,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-600 transition hover:border-blue-500 hover:text-blue-700"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-slate-700">No users match your filters</p>
            <p className="mt-1 text-[13px] text-slate-500">Try a different role or search term.</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-[13px] text-slate-500">
        Showing {filtered.length} of {rows.length} accounts
      </p>

      {draft && (
        <Modal
          title={draft.id ? 'Edit User' : 'Add New User'}
          subtitle={
            draft.id
              ? `Update the account details for ${draft.name}.`
              : 'Create an account and assign its role.'
          }
          onClose={() => setDraft(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                className="field-input"
                placeholder="e.g. Maria Santos"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="name@mabini.edu.ph"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className="field-input"
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })}
                >
                  {(['Admin', 'Maintenance Staff', 'Instructor'] as const).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="field-input"
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as UserStatus })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="userDepartment">
                Department
              </label>
              <input
                id="userDepartment"
                className="field-input"
                placeholder="e.g. College of Computer Studies"
                value={draft.department}
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >
                {draft.id ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
