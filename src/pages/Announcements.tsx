import { Calendar, Megaphone, Pin, UserRound } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { announcementFeed, type AnnouncementCategory } from '../data/mock'

const CATEGORY_STYLES: Record<AnnouncementCategory, { chip: string; tile: string }> = {
  Maintenance: { chip: 'bg-amber-100 text-amber-700 ring-amber-200', tile: 'bg-amber-100 text-amber-600' },
  Guidelines: { chip: 'bg-blue-100 text-blue-700 ring-blue-200', tile: 'bg-blue-100 text-blue-600' },
  System: { chip: 'bg-violet-100 text-violet-700 ring-violet-200', tile: 'bg-violet-100 text-violet-600' },
  General: { chip: 'bg-slate-100 text-slate-600 ring-slate-200', tile: 'bg-slate-100 text-slate-500' },
}

export default function Announcements() {
  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Official notices from the administration."
        variant="student"
      />

      <div className="space-y-4">
        {announcementFeed.map((post) => {
          const styles = CATEGORY_STYLES[post.category]

          return (
            <article
              key={post.id}
              className="card p-5 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${styles.tile}`}
                  aria-hidden="true"
                >
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
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wide ring-1 ring-inset ${styles.chip}`}
                    >
                      {post.category.toUpperCase()}
                    </span>
                  </div>

                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-600">{post.body}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-slate-100 pt-3 text-[12.5px] text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5" strokeWidth={1.9} />
                      {post.author}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={1.9} />
                      {post.date}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
