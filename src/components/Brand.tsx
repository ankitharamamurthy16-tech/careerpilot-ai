export function BrandMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 rounded-2xl ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="CareerPilot AI"
    >
      <defs>
        {/* Background Gradient: Rich Violet to Deep Indigo */}
        <linearGradient id="cp-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="45%" stopColor="#4f46e5" />
          <stop offset="80%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        {/* Luminous Bloom behind Summit */}
        <radialGradient id="cp-summit-glow" cx="80%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
          <stop offset="40%" stopColor="#818cf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
        </radialGradient>

        {/* Subtle Container Border Glow */}
        <linearGradient id="cp-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
        </linearGradient>

        {/* Rising Path Gradient */}
        <linearGradient id="cp-path-grad" x1="10%" y1="90%" x2="80%" y2="20%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="35%" stopColor="#c4b5fd" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Achievement Star Gradient */}
        <linearGradient id="cp-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="35%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        {/* Star Glow */}
        <radialGradient id="cp-star-ambient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#fde047" stopOpacity="0.6" />
          <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Squircle App Icon Base */}
      <rect width="512" height="512" rx="116" fill="url(#cp-bg-grad)" />
      <rect
        x="5"
        y="5"
        width="502"
        height="502"
        rx="111"
        fill="none"
        stroke="url(#cp-border-grad)"
        strokeWidth="2.5"
      />
      <rect width="512" height="512" rx="116" fill="url(#cp-summit-glow)" />

      {/* Dynamic Trajectory Guidelines (AI Precision) */}
      <path
        d="M 90 435 C 150 435, 195 395, 245 330 C 285 275, 318 225, 355 170"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 10"
        opacity="0.3"
      />

      {/* Smooth Rising Pathway */}
      <path
        d="M 82 405 C 145 405, 198 362, 252 292 C 292 240, 326 190, 365 138"
        fill="none"
        stroke="url(#cp-path-grad)"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Upward Arrow Head (Culmination of the Pathway) */}
      <polygon
        points="426,96 394,186 364,142 334,124"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Abstract Human Figure Leaping / Moving Upward (Career Growth) */}
      {/* Head */}
      <circle cx="232" cy="158" r="26" fill="#ffffff" />

      {/* Forward Reaching Arm (reaching toward the achievement star) */}
      <path
        d="M 245 192 C 275 186, 305 174, 335 152"
        fill="none"
        stroke="#ffffff"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Torso leaning forward into ascent */}
      <path
        d="M 212 272 C 224 232, 242 205, 256 192"
        fill="none"
        stroke="#ffffff"
        strokeWidth="24"
        strokeLinecap="round"
      />

      {/* Dynamic High Stepping Forward Leg */}
      <path
        d="M 216 270 C 238 270, 258 252, 274 228"
        fill="none"
        stroke="#ffffff"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Propelling Trailing Leg pushing off the rising pathway */}
      <path
        d="M 156 342 C 176 316, 196 292, 214 272"
        fill="none"
        stroke="#ffffff"
        strokeWidth="22"
        strokeLinecap="round"
      />

      {/* Small Glowing Achievement Star at the Zenith */}
      <circle cx="436" cy="72" r="46" fill="url(#cp-star-ambient)" />

      {/* 4-pointed Faceted Diamond Star */}
      <path
        d="M 436 42 
           C 436 60, 448 72, 466 72 
           C 448 72, 436 84, 436 102 
           C 436 84, 424 72, 406 72 
           C 424 72, 436 60, 436 42 Z"
        fill="url(#cp-star-grad)"
      />

      {/* Center Sparkle Glint */}
      <circle cx="436" cy="72" r="4.5" fill="#ffffff" />
    </svg>
  );
}

export function Progress({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <div className="animate-bar h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
    </div>
  );
}
