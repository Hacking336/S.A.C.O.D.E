import { useMemo, useState } from 'react'
import { BookOpen, ChevronDown, Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { kbArticles, type KBCategory } from '../data/mock'

const CATEGORIES: (KBCategory | 'All')[] = [
  'All',
  'Reporting Guidelines',
  'Common Equipment Issues',
  'IT Support',
]

export default function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<KBCategory | 'All'>('All')
  const [openId, setOpenId] = useState<number | null>(kbArticles[0].id)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return kbArticles.filter((article) => {
      const matchesCategory = category === 'All' || article.category === category
      const matchesQuery =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.body.join(' ').toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  return (
    <>
      <PageHeader
        title="Knowledge Base"
        subtitle="View common issues and solutions."
        variant="student"
      />

      {/* --------------------------- Search bar --------------------------- */}
      <div className="card mb-5 p-3.5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <input
            type="search"
            placeholder="Search articles — e.g. flickering monitor, password reset..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold transition ${
                category === item
                  ? 'bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.28)]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------- Accordion --------------------------- */}
      {filtered.length === 0 ? (
        <div className="card grid place-items-center px-6 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <BookOpen className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-slate-700">No articles found</p>
          <p className="mt-1 text-[13px] text-slate-500">
            Try a different keyword or choose another category.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => {
            const open = openId === article.id

            return (
              <div key={article.id} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : article.id)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-slate-50/70"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen className="h-[19px] w-[19px]" strokeWidth={1.9} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-slate-900">
                        {article.title}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-slate-500">
                        {article.category.toUpperCase()}
                      </span>
                    </span>
                    <span className="mt-1 block text-[13px] text-slate-500">{article.summary}</span>
                  </span>

                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2}
                  />
                </button>

                {open && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:pl-[76px]">
                    <div className="space-y-3">
                      {article.body.map((paragraph, index) => (
                        <p key={index} className="text-[13.5px] leading-relaxed text-slate-600">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <p className="mt-3 text-[11.5px] text-slate-400">
                      Last updated {article.updated}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-4 text-[13px] text-slate-500">
        {filtered.length} of {kbArticles.length} articles
      </p>
    </>
  )
}
