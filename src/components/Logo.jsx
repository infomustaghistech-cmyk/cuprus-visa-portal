export default function Logo({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Republic of Cyprus Coat of Arms"
    >
      <defs>
        <linearGradient id="cyprusGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Laurel Wreath */}
      <g stroke="url(#cyprusGold)" strokeWidth="2.5" fill="none" strokeLinecap="round">
        {/* Left branch */}
        <path d="M 24 68 C 15 50 18 28 32 16" />
        <ellipse cx="21" cy="60" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(-30 21 60)" />
        <ellipse cx="17" cy="48" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(-15 17 48)" />
        <ellipse cx="18" cy="36" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(10 18 36)" />
        <ellipse cx="23" cy="25" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(30 23 25)" />
        <ellipse cx="30" cy="18" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(50 30 18)" />

        {/* Right branch */}
        <path d="M 76 68 C 85 50 82 28 68 16" />
        <ellipse cx="79" cy="60" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(30 79 60)" />
        <ellipse cx="83" cy="48" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(15 83 48)" />
        <ellipse cx="82" cy="36" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(-10 82 36)" />
        <ellipse cx="77" cy="25" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(-30 77 25)" />
        <ellipse cx="70" cy="18" rx="3.5" ry="1.8" fill="url(#cyprusGold)" transform="rotate(-50 70 18)" />

        {/* Bottom tie */}
        <path d="M 42 74 Q 50 78 58 74" />
      </g>

      {/* Central Shield */}
      <path
        d="M 32 24 L 68 24 C 68 24 69 52 50 72 C 31 52 32 24 32 24 Z"
        fill="url(#cyprusGold)"
        stroke="#92400E"
        strokeWidth="1.5"
      />

      {/* Inner Shield border */}
      <path
        d="M 35 27 L 65 27 C 65 27 66 50 50 67 C 34 50 35 27 35 27 Z"
        fill="#C66D06"
      />

      {/* White Dove of Peace with Olive Branch */}
      <g fill="#FFFFFF">
        {/* Dove Body & Wings */}
        <path d="M 50 34 C 44 32 40 37 43 43 C 44 45 47 48 50 51 C 53 48 56 45 57 43 C 60 37 56 32 50 34 Z" />
        <path d="M 43 38 C 36 34 35 30 38 31 C 41 32 44 35 46 39 Z" />
        <path d="M 57 38 C 64 34 65 30 62 31 C 59 32 56 35 54 39 Z" />
        {/* Tail */}
        <path d="M 48 50 L 52 50 L 50 57 Z" />
        {/* Head */}
        <circle cx="50" cy="34" r="2.5" />
      </g>

      {/* Olive Branch in Beak */}
      <path
        d="M 46 33 Q 42 32 39 34 M 42 32 L 40 30 M 44 33 L 43 35"
        stroke="#FFFFFF"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* Year 1960 text representation */}
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fontSize="6"
        fontWeight="bold"
        fill="#FFFFFF"
        fontFamily="sans-serif"
      >
        1960
      </text>
    </svg>
  )
}
