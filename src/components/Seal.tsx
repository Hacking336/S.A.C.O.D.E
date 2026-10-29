import { useState } from 'react'

interface SealProps {
  size?: number
  className?: string
  /** dark ring variant used on the navy sidebar */
  onDark?: boolean
}

/**
 * Mabini Colleges, Inc. seal — redrawn to match the uploaded logo:
 * navy outer ring, white band with curved text ("MABINI COLLEGES, Inc." /
 * "DAET, CAMARINES NORTE"), light sky-blue centre with sunburst rays,
 * lamp of knowledge on an open book, and the founding year 1924.
 *
 * On the Sign-In screen this is only the FALLBACK: the real logo file at
 * public/images/sacode-logo.png is rendered first and swaps in automatically.
 */
export function Seal({ size = 180, className = '', onDark = false }: SealProps) {
  const navy = '#12224A'
  const ring = onDark ? '#3B82F6' : navy

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Mabini Colleges Inc. seal"
    >
      <defs>
        <path
          id="seal-ring-top"
          d="M100,100 m-77,0 a77,77 0 1,1 154,0"
          fill="none"
          transform="rotate(-4 100 100)"
        />
        <path
          id="seal-ring-bottom"
          d="M100,100 m-77,0 a77,77 0 1,0 154,0"
          fill="none"
          transform="rotate(4 100 100)"
        />
        {/* soft glow behind the flame, upper-left */}
        <radialGradient id="seal-flame-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---------------------------- Rings ---------------------------- */}
      {/* thick navy outer ring */}
      <circle cx="100" cy="100" r="97" fill={navy} />
      <circle cx="100" cy="100" r="86.5" fill="#FFFFFF" />
      {/* white text band sits between r=97 and r=86.5 ... thin white line */}
      <circle cx="100" cy="100" r="88.5" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
      {/* inner navy circle boundary */}
      <circle cx="100" cy="100" r="62" fill="#BEDFF6" stroke={ring} strokeWidth="2.4" />

      {/* ------------------ Sunburst + flame glow ------------------ */}
      <g opacity="0.55">
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i * 360) / 14
          return (
            <path
              key={i}
              d="M100,100 L96,34 L104,34 Z"
              fill="#FFFFFF"
              opacity={i % 2 === 0 ? 0.75 : 0.4}
              transform={`rotate(${a} 100 100)`}
            />
          )
        })}
      </g>
      <circle cx="78" cy="86" r="26" fill="url(#seal-flame-glow)" />

      {/* --------------------------- Lamp --------------------------- */}
      <g>
        {/* flame */}
        <path
          d="M74,92 C70.5,88 71.5,83.5 74.5,80 C74.5,83.5 76.5,84.5 77.5,86.5 C79,84.5 79,82 78,80.5 C82,84 82.5,89 78.5,92.5 Z"
          fill="#FDB52A"
        />
        <path
          d="M75.5,91 C73.8,88.5 74.4,85.6 76,83.6 C76.2,85.6 77.3,86.3 77.8,87.5 C78.6,86.4 78.6,85 78.1,84.2 C80.2,86.5 80.4,89.3 78.4,91.4 Z"
          fill="#F97316"
        />
        {/* lamp body */}
        <path
          d="M78,96 C78,93.6 81,92 86,92 L110,92 C117,92 121,95 121,98.5 C121,102.5 116,105.5 109,105.5 L87,105.5 C81,105.5 78,102.8 78,99.5 Z"
          fill="#9CA3AF"
          stroke="#4B5563"
          strokeWidth="1.6"
        />
        {/* spout (pointing left) */}
        <path
          d="M79,95.5 L66,90.5 C63.5,89.6 61.5,91.5 63,93.6 L70,101"
          fill="#9CA3AF"
          stroke="#4B5563"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* handle (right) */}
        <path
          d="M120,96 C126,95 129,98 127,102 C125.5,105 122,105.5 119,104.5"
          fill="none"
          stroke="#4B5563"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* lamp base */}
        <path d="M92,105.5 L112,105.5 L115,111 L89,111 Z" fill="#6B7280" />
      </g>

      {/* --------------------------- Book --------------------------- */}
      <g>
        <path
          d="M100,116 C92,110.5 82,108.5 71,109.5 L71,131 C82,130 92,132 100,137 Z"
          fill="#E4CDA4"
          stroke="#5B4426"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M100,116 C108,110.5 118,108.5 129,109.5 L129,131 C118,130 108,132 100,137 Z"
          fill="#D8BC8E"
          stroke="#5B4426"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M100,116 L100,137" stroke="#3B2C18" strokeWidth="2.6" />
        {/* page lines */}
        <g stroke="#8A6F45" strokeWidth="1.2" opacity="0.7">
          <path d="M77,116 C84,115.5 91,117 95,119.5" fill="none" />
          <path d="M77,122 C84,121.5 91,123 95,125.5" fill="none" />
          <path d="M105,119.5 C109,117 116,115.5 123,116" fill="none" />
          <path d="M105,125.5 C109,123 116,121.5 123,122" fill="none" />
        </g>
      </g>

      {/* --------------------------- Year --------------------------- */}
      <text
        x="100"
        y="152"
        textAnchor="middle"
        fill={navy}
        fontSize="15"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        1924
      </text>

      {/* ------------------------ Ring text ------------------------ */}
      <text
        fill={navy}
        fontSize="12"
        fontWeight="700"
        letterSpacing="1.4"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        <textPath href="#seal-ring-top" startOffset="50%" textAnchor="middle">
          MABINI COLLEGES, Inc.
        </textPath>
      </text>
      <text
        fill={navy}
        fontSize="11"
        fontWeight="700"
        letterSpacing="1.6"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        <textPath href="#seal-ring-bottom" startOffset="50%" textAnchor="middle">
          DAET, CAMARINES NORTE
        </textPath>
      </text>
    </svg>
  )
}

/**
 * Compact mark used in the sidebar header.
 * The Mabini Colleges seal (public/images/mabini-logo.png) sits where the old
 * home glyph was; if the file is missing the drawn tile stands in for it.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {logoFailed ? (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-600/90 ring-1 ring-blue-400/40">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 10.5 12 4l9 6.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            />
            <path
              d="M5.5 10.5V20h13v-9.5M9 20v-4.5h6V20"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            />
          </svg>
        </div>
      ) : (
        <img
          src={`${import.meta.env.BASE_URL}images/mabini-logo.png`}
          alt="Mabini Colleges, Inc. logo"
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
          onError={() => setLogoFailed(true)}
        />
      )}
      <div className="min-w-0">
        <div className="truncate text-[15px] font-extrabold tracking-wide text-white">
          S.A.C.O.D.E.
        </div>
        <div className="truncate text-[10px] font-medium text-blue-200/70">
          Mabini Colleges, Inc.
        </div>
      </div>
    </div>
  )
}
