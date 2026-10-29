import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { BrandMark } from '../components/Seal'

export function AppLayout({ variant }: { variant: 'instructor' | 'admin' }) {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  // a navigation always closes the drawer, so the next screen is visible at once
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar variant={variant} open={navOpen} onClose={() => setNavOpen(false)} />

      {navOpen && (
        <button
          type="button"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
          className="fixed inset-0 z-30 cursor-default bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <main className="lg:pl-[248px]">
        {/* ------------------------ Phone top bar ------------------------ */}
        <div className="sticky top-0 z-20 flex items-center gap-2 bg-navy px-3 py-2.5 text-white shadow-[0_2px_10px_rgba(11,17,38,0.25)] lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <BrandMark />
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
