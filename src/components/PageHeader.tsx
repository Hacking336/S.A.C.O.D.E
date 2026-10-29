import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, MessageCircle, ChevronDown, LogOut, RefreshCw } from 'lucide-react'
import { adminUser, currentUser } from '../data/mock'

interface PageHeaderProps {
  title: ReactNode
  subtitle?: string
  backTo?: string
  variant: 'student' | 'admin'
  /** page-specific controls rendered to the left of the icon cluster */
  extra?: ReactNode
}

export function PageHeader({ title, subtitle, backTo, variant, extra }: PageHeaderProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const user = variant === 'student' ? currentUser : adminUser

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:mb-6 sm:gap-4">
      <div className="flex items-start gap-3">
        {backTo && (
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-card transition hover:bg-slate-50"
            aria-label="Go back"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
        )}
        <div>
          <h1 className="text-[21px] font-bold leading-tight text-slate-900 sm:text-[26px]">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
        {extra}

        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-card transition hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          className="hidden h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-card transition hover:bg-slate-50 sm:grid"
          aria-label="Messages"
        >
          <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </button>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-card transition hover:bg-slate-50"
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold text-white ${
                variant === 'student' ? 'bg-blue-600' : 'bg-indigo-600'
              }`}
            >
              {user.initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[13px] font-semibold text-slate-800">{user.name}</span>
              <span className="block text-[11px] text-slate-500">{user.role}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-panel">
              <div className="px-4 py-2.5">
                <p className="text-[13px] font-semibold text-slate-800">{user.name}</p>
                <p className="truncate text-[11.5px] text-slate-500">{user.email}</p>
              </div>
              <div className="my-1 h-px bg-slate-100" />
              {/* Students get no shortcut into the admin side — that door is
                  /admin/login. Admins may still preview the student view. */}
              {variant === 'admin' && (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4 text-slate-400" />
                  Switch to Student view
                </Link>
              )}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
