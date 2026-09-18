export default function Logo({ size = 32, className = "", light = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Cyprus Dove & Laurel Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label="Republic of Cyprus Emblem"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="cyEmblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>

        {/* Outer Wreath */}
        <g stroke={light ? "#FFFFFF" : "#475569"} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 22 70 C 12 50 16 26 32 14" />
          <ellipse cx="20" cy="62" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(-30 20 62)" />
          <ellipse cx="15" cy="50" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(-15 15 50)" />
          <ellipse cx="16" cy="38" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(10 16 38)" />
          <ellipse cx="22" cy="26" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(30 22 26)" />
          <ellipse cx="30" cy="18" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(50 30 18)" />

          <path d="M 78 70 C 88 50 84 26 68 14" />
          <ellipse cx="80" cy="62" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(30 80 62)" />
          <ellipse cx="85" cy="50" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(15 85 50)" />
          <ellipse cx="84" cy="38" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(-10 84 38)" />
          <ellipse cx="78" cy="26" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(-30 78 26)" />
          <ellipse cx="70" cy="18" rx="3.5" ry="1.8" fill={light ? "#FFFFFF" : "#475569"} transform="rotate(-50 70 18)" />

          <path d="M 40 76 Q 50 80 60 76" />
        </g>

        {/* Shield */}
        <path
          d="M 30 22 L 70 22 C 70 22 71 54 50 74 C 29 54 30 22 30 22 Z"
          fill={light ? "none" : "#1E293B"}
          stroke={light ? "#FFFFFF" : "#475569"}
          strokeWidth="2"
        />

        {/* Dove of Peace */}
        <g fill={light ? "#FFFFFF" : "#334155"}>
          <path d="M 50 32 C 43 30 39 35 42 42 C 44 45 47 48 50 52 C 53 48 56 45 58 42 C 61 35 57 30 50 32 Z" />
          <path d="M 42 36 C 34 32 33 28 36 29 C 39 30 42 33 45 38 Z" />
          <path d="M 58 36 C 66 32 67 28 64 29 C 61 30 58 33 55 38 Z" />
          <circle cx="50" cy="32" r="2.5" />
        </g>

        {/* Olive Branch in Beak */}
        <path
          d="M 45 31 Q 40 30 37 32 M 40 30 L 38 28 M 43 31 L 41 33"
          stroke={light ? "#FFFFFF" : "#334155"}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Year 1960 */}
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="bold"
          fill={light ? "#FFFFFF" : "#475569"}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          1960
        </text>
      </svg>

      {/* gov.cy wordmark */}
      <span className={`text-2xl font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        gov<span className="font-semibold">.cy</span>
      </span>
    </div>
  )
}

