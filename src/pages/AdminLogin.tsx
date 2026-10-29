import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Seal } from '../components/Seal'

/**
 * Administrator sign-in — a separate door from the instructor sign-in.
 *
 * Same night-building backdrop and seal as /, but the badge, the copy and the
 * destination make it clear this is the admin side. Like the instructor form it
 * has no credentials and no validation: the button routes straight to /admin.
 */
const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export default function AdminLogin() {
  const navigate = useNavigate()
  const [logoSrc, setLogoSrc] = useState<string | null>(null)

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden bg-[#16264a]"
      style={{
        backgroundImage: `url('${asset('images/school-building-night.jpg')}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-4 py-6 sm:py-8">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
            Administrator Portal
          </span>
        </div>

        {/* ---------------------------- Header ---------------------------- */}
        <header className="mt-6 flex flex-col items-center text-center">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Mabini Colleges, Inc. logo"
              width={100}
              height={100}
              className="h-[100px] w-[100px] rounded-full object-contain"
            />
          ) : (
            <>
              <Seal size={100} />
              {/* probe for the logo file; replaces the seal when it exists */}
              <img
                src={asset('images/sacode-logo.png')}
                alt="Mabini Colleges, Inc. logo"
                width={100}
                height={100}
                className="hidden"
                onLoad={(e) => setLogoSrc(e.currentTarget.src)}
                onError={() => undefined}
              />
            </>
          )}
          <h1 className="mt-4 text-[30px] font-extrabold tracking-tight text-white sm:text-[32px]">
            Administrator Access
          </h1>
          <p className="mt-1 max-w-md text-[13px] font-medium text-white">
            Manage reports, maintenance staff and the campus equipment inventory.
          </p>
        </header>

        {/* --------------------------- Sign in ---------------------------- */}
        <main className="flex flex-1 flex-col items-center justify-center gap-4 py-10">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full max-w-md rounded-xl bg-blue-600 py-3.5 text-[14.5px] font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60"
          >
            Sign In to Admin Dashboard
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/85 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to instructor sign in
          </Link>
        </main>

        {/* ---------------------------- Footer ---------------------------- */}
        <footer className="text-center text-[12px] text-white/80">
          © 2025 Mabini Colleges, Inc. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
