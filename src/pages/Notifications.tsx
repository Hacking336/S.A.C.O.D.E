import { useState } from 'react'
import {
  CheckCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  RefreshCw,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { notificationFeed, type NotificationKind } from '../data/mock'

const KIND_STYLES: Record<NotificationKind, { icon: LucideIcon; box: string }> = {
  resolved: { icon: CheckCircle2, box: 'bg-green-100 text-green-600' },
  updated: { icon: RefreshCw, box: 'bg-blue-100 text-blue-600' },
  assigned: { icon: Wrench, box: 'bg-violet-100 text-violet-600' },
  comment: { icon: MessageSquare, box: 'bg-amber-100 text-amber-600' },
  reminder: { icon: Clock, box: 'bg-slate-100 text-slate-500' },
}

export default function Notifications() {
  const [items, setItems] = useState(notificationFeed)
  const unread = items.filter((item) => !item.read).length

  const markAllRead = () => setItems((prev) => prev.map((item) => ({ ...item, read: true })))
  const markRead = (id: number) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on your report activity."
        variant="instructor"
        extra={
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-card transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" strokeWidth={2} />
            Mark all as read
          </button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-slate-500">
          {unread === 0 ? 'All caught up — no unread notifications.' : `${unread} unread notifications`}
        </p>
        <p className="text-[13px] text-slate-400">Latest first</p>
      </div>

      <div className="card divide-y divide-slate-100 overflow-hidden">
        {items.map((item) => {
          const config = KIND_STYLES[item.kind]
          const Icon = config.icon

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => markRead(item.id)}
              className={`flex w-full items-start gap-4 border-l-4 px-5 py-4 text-left transition hover:bg-slate-50/80 ${
                item.read ? 'border-l-transparent bg-white' : 'border-l-blue-600 bg-blue-50/40'
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${config.box}`}
                aria-hidden="true"
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={1.9} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[14px] ${
                      item.read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'
                    }`}
                  >
                    {item.title}
                  </span>
                  {!item.read && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-blue-700">
                      New
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-[13.5px] leading-relaxed text-slate-500">
                  {item.message}
                </span>
                <span className="mt-1.5 block text-[12px] text-slate-400">{item.time}</span>
              </span>

              {!item.read && (
                <span
                  className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600"
                  aria-label="Unread"
                />
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
