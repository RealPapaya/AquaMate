// Badge-specific SVG icons

export function FirstLogBadge({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="firstLogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00e5f0" />
          <stop offset="100%" stopColor="#0099b8" />
        </linearGradient>
      </defs>
      <path 
        d="M50 15C50 15 25 47 25 62C25 77 36 88 50 88C64 88 75 77 75 62C75 47 50 15 50 15Z" 
        fill="url(#firstLogGrad)"
      />
      <ellipse cx="40" cy="52" rx="6" ry="10" fill="white" opacity="0.35" transform="rotate(-20 40 52)" />
    </svg>
  )
}

export function StreakBadge({ size = 40, className = "", days = 3 }) {
  const colors = days >= 30 ? ['#FFD700', '#FFA500'] : days >= 7 ? ['#00e5f0', '#0099b8'] : ['#FF6B6B', '#FF4757']
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={`streakGrad${days}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <path 
        d="M50 15L55 35L45 30L55 50L45 45L55 70L45 60L50 85L40 60L50 50L40 35L50 40L45 20Z" 
        fill={`url(#streakGrad${days})`}
      />
      <circle cx="50" cy="50" r="8" fill="white" opacity="0.4" />
    </svg>
  )
}

export function BigDrinkerBadge({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0099b8" />
        </linearGradient>
      </defs>
      <path 
        d="M10 50Q25 40 40 50T70 50T90 50L90 90L10 90Z" 
        fill="url(#waveGrad)"
      />
      <path 
        d="M10 60Q25 50 40 60T70 60T90 60L90 90L10 90Z" 
        fill="url(#waveGrad)"
        opacity="0.6"
      />
      <circle cx="30" cy="35" r="4" fill="white" opacity="0.5" />
      <circle cx="70" cy="40" r="3" fill="white" opacity="0.4" />
    </svg>
  )
}

export function TrophyBadge({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      <path d="M35 20L65 20L65 45C65 55 58 62 50 62C42 62 35 55 35 45Z" fill="url(#trophyGrad)" />
      <rect x="25" y="15" width="10" height="15" rx="2" fill="url(#trophyGrad)" opacity="0.8" />
      <rect x="65" y="15" width="10" height="15" rx="2" fill="url(#trophyGrad)" opacity="0.8" />
      <rect x="42" y="62" width="16" height="8" rx="1" fill="url(#trophyGrad)" />
      <rect x="35" y="70" width="30" height="8" rx="2" fill="url(#trophyGrad)" />
      <circle cx="50" cy="40" r="6" fill="white" opacity="0.3" />
    </svg>
  )
}

export function EarlyBirdBadge({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF6347" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="20" fill="url(#sunGrad)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 50 + Math.cos(rad) * 30
        const y = 50 + Math.sin(rad) * 30
        return (
          <line 
            key={i}
            x1="50" 
            y1="50" 
            x2={x} 
            y2={y} 
            stroke="url(#sunGrad)" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

export function NightOwlBadge({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#A5B4FC" />
        </linearGradient>
      </defs>
      <path 
        d="M50 20C50 20 65 25 65 45C65 65 50 70 50 70C35 70 20 60 20 45C20 30 35 20 50 20Z" 
        fill="url(#moonGrad)"
      />
      <circle cx="45" cy="45" r="15" fill="#1e293b" opacity="0.3" />
      {[...Array(5)].map((_, i) => (
        <circle 
          key={i}
          cx={20 + i * 15} 
          cy={15 + (i % 2) * 5} 
          r="1.5" 
          fill="white" 
          opacity="0.8"
        />
      ))}
    </svg>
  )
}

export function PairChampionBadge({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#C44569" />
        </linearGradient>
      </defs>
      <path 
        d="M50 85L20 55C10 45 10 30 20 20C30 10 40 15 50 25C60 15 70 10 80 20C90 30 90 45 80 55L50 85Z" 
        fill="url(#heartGrad)"
      />
      <circle cx="35" cy="35" r="4" fill="white" opacity="0.4" />
      <circle cx="65" cy="35" r="4" fill="white" opacity="0.4" />
    </svg>
  )
}

export function CrownBadge({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      <path 
        d="M15 40L25 50L35 30L50 45L65 30L75 50L85 40L80 70L20 70Z" 
        fill="url(#crownGrad)"
      />
      <rect x="20" y="70" width="60" height="10" rx="2" fill="url(#crownGrad)" />
      <circle cx="25" cy="50" r="4" fill="#FF6347" />
      <circle cx="50" cy="45" r="4" fill="#FF6347" />
      <circle cx="75" cy="50" r="4" fill="#FF6347" />
    </svg>
  )
}

// Map badge types to their SVG components
export const BADGE_SVG_MAP = {
  first_log: FirstLogBadge,
  streak_3: (props) => <StreakBadge {...props} days={3} />,
  streak_7: (props) => <StreakBadge {...props} days={7} />,
  streak_30: CrownBadge,
  big_drinker: BigDrinkerBadge,
  beat_partner: TrophyBadge,
  early_bird: EarlyBirdBadge,
  night_owl: NightOwlBadge,
  pair_champion: PairChampionBadge,
}
