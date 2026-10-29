import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seal } from '../components/Seal'

/**
 * S.A.C.O.D.E. Sign-In page.
 *
 * Background : /images/school-building-night.jpg — cover / center / no-repeat
 *              + a bg-black/50 overlay for readability.
 * Logo       : /images/sacode-logo.png — 100px, centered above the wordmark.
 *              If that file is ever absent the drawn seal stands in for it.
 * Form       : just the Sign In button. No username, no password, no auth —
 *              clicking it routes straight to the Student Dashboard.
 */
export default function Login() {
  const navigate = useNavigate()
  const [logoSrc, setLogoSrc] = useState<string | null>(null)

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#16264a]"
      style={{
        backgroundImage: "url('/images/school-building-night.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* semi-transparent dark overlay so white text stays readable */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col overflow-y-auto px-4 py-8">
        {/* ---------------------------- Header ---------------------------- */}
        <header className="flex flex-col items-center text-center">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Campus Care logo"
              width={100}
              height={100}
              className="h-[100px] w-[100px] rounded-full object-contain"
            />
          ) : (
            <>
              <Seal size={100} />
              {/* probe for the logo file; replaces the seal when it exists */}
              <img
                src="/images/sacode-logo.png"
                alt="Campus Care logo"
                width={100}
                height={100}
                className="hidden"
                onLoad={(e) => setLogoSrc(e.currentTarget.src)}
                onError={() => undefined}
              />
            </>
          )}
          <h1 className="mt-4 text-[32px] font-extrabold tracking-tight text-white">
            Campus Care
          </h1>
          <p className="mt-1 max-w-md text-[13px] font-medium text-white">
            School Asset Condition Observation and Damage Evaluation
          </p>
        </header>

        {/* -------------------------- Sign In card -------------------------- */}
        <main className="flex flex-1 items-center justify-center py-10">
          {/* No card, no validation, no auth: the button sits straight on the photo */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full max-w-md rounded-xl bg-blue-600 py-3.5 text-[14.5px] font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60"
          >
            Sign In
          </button>
        </main>

        {/* ---------------------------- Footer ---------------------------- */}
        <footer className="text-center text-[12px] text-white">
          © 2025 Mabini Colleges, Inc. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
