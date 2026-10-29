import { useState, type FormEvent } from 'react'
import { Calendar, Megaphone, Pencil, Pin, Plus, Trash2, UserRound } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Modal } from '../../components/Modal'
import {
  announcementFeed,
  type AnnouncementCategory,
  type AnnouncementPost,
} from '../../data/mock'

const CATEGORIES: AnnouncementCategory[] = ['Maintenance', 'Guidelines', 'System', 'General']

const CHIP_STYLES: Record<AnnouncementCategory, string> = {
  Maintenance: 'bg-amber-100 text-amber-700 ring-amber-200',
  Guidelines: 'bg-blue-100 text-blue-700 ring-blue-200',
  System: 'bg-violet-100 text-violet-700 ring-violet-200',
  General: 'bg-slate-100 text-slate-600 ring-slate-200',
}

interface Draft {
  id?: number
  title: string
  category: AnnouncementCategory
  body: string
}

const EMPTY_DRAFT: Draft = { title: '', category: 'General', body: '' }

export default function AdminAnnouncements() {
  const [rows, setRows] = useState<AnnouncementPost[]>(announcementFeed)
  const [draft, setDraft] = useState<Draft | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft) return

    if (draft.id) {
      setRows((prev) =>
        prev.map((post) =>
          post.id === draft.id
            ? { ...post, title: draft.title, category: draft.category, body: draft.body }
            : post,
        ),
      )
    } else {
      setRows((prev) => [
        {
          id: Math.max(0, ...prev.map((post) => post.id)) + 1,
          title: draft.title,
          category: draft.category,
          body: draft.body,
          date: 'May 16, 2025',
          author: 'Admin User',
        },
        ...prev,
      ])
    }

    setDraft(null)
  }

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Publish notices to the campus community."
        variant="admin"
        extra={
          <button
            type="button"
            onClick={() => setDraft(EMPTY_DRAFT)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)] transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            New Announcement
          </button>
        }
      />

      <div className="space-y-4">
        {rows.map((post) => (
          <article key={post.id} className="card p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600">
                <Megaphone className="h-[21px] w-[21px]" strokeWidth={1.9} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[16px] font-bold leading-snug text-slate-900">
                    {post.title}
                  </h2>
                  {post.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white">
                      <Pin className="h-3 w-3" strokeWidth={2.4} />
                      Pinned
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${CHIP_STYLES[post.category]}`}
                  >
                    {post.category.toUpperCase()}
                  </span>
                </div>

                <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-600">{post.body}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5" strokeWidth={1.9} />
                      {post.author}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={1.9} />
                      {post.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          id: post.id,
                          title: post.title,
                          category: post.category,
                          body: post.body,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-600 transition hover:border-blue-500 hover:text-blue-700"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setRows((prev) => prev.filter((item) => item.id !== post.id))}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        {rows.length === 0 && (
          <div className="card px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-slate-700">No announcements yet</p>
            <p className="mt-1 text-[13px] text-slate-500">
              Publish your first notice with “New Announcement”.
            </p>
          </div>
        )}
      </div>

      {draft && (
        <Modal
          title={draft.id ? 'Edit Announcement' : 'New Announcement'}
          subtitle="Published immediately to every instructor and staff dashboard."
          onClose={() => setDraft(null)}
          width="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                className="field-input"
                placeholder="e.g. Maintenance Schedule for Computer Lab"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="field-input"
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value as AnnouncementCategory })
                }
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="body">
                Message
              </label>
              <textarea
                id="body"
                rows={6}
                className="field-input resize-y"
                placeholder="Write the full announcement text..."
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
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
                {draft.id ? 'Save Changes' : 'Publish'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
