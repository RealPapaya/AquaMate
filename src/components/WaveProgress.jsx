import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useSpring, useTransform, useMotionValueEvent } from 'framer-motion'

// Generate a sinusoidal wave SVG path that fills from bottom
function buildWavePath(fillY, offset, amplitude, width, height) {
  const segments = 60
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width
    const y = fillY + Math.sin((i / segments) * Math.PI * 4 + offset) * amplitude
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return `${pts.join(' ')} L${width},${height} L0,${height} Z`
}

export default function WaveProgress({
  current   = 0,
  goal      = 2000,
  size      = 220,
  name      = '',
  mini      = false,
  className = '',
}) {
  const pct      = Math.min(current / Math.max(goal, 1), 1)
  const radius   = size / 2 - 4

  // Spring-animated fill percentage
  const springPct = useSpring(pct, { stiffness: 50, damping: 18, mass: 0.8 })

  // Wave animation frame
  const rafRef   = useRef(null)
  const [waves, setWaves] = useState({ w1: '', w2: '' })
  const offsetRef = useRef(0)
  const fillYRef  = useRef(size * (1 - pct))

  // Track spring value to update fillYRef
  useMotionValueEvent(springPct, 'change', (v) => {
    fillYRef.current = size * (1 - v)
  })

  // Continuous wave RAF loop
  const tick = useCallback(() => {
    offsetRef.current += mini ? 0.025 : 0.018
    const fillY = fillYRef.current
    const amp   = mini ? 4 : 8
    const w1 = buildWavePath(fillY,           offsetRef.current,       amp,     size, size)
    const w2 = buildWavePath(fillY + amp * 0.5, offsetRef.current + Math.PI, amp * 0.6, size, size)
    setWaves({ w1, w2 })
    rafRef.current = requestAnimationFrame(tick)
  }, [size, mini])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [tick])

  // Update spring when pct changes
  useEffect(() => {
    springPct.set(pct)
  }, [pct, springPct])

  const displayPct    = Math.round(pct * 100)
  const displayMl     = current >= 1000 ? `${(current / 1000).toFixed(1)}L` : `${current}ml`
  const clipId        = `wave-clip-${name || 'main'}`
  const fillGradId    = `fill-grad-${name || 'main'}`

  const isGoalReached = pct >= 1

  if (mini) {
    return (
      <div className={`relative flex flex-col items-center ${className}`}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-hidden">
          <defs>
            <clipPath id={clipId}>
              <circle cx={size / 2} cy={size / 2} r={radius} />
            </clipPath>
            <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4f5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0066a8" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="rgba(0,30,60,0.7)" stroke="rgba(0,196,216,0.25)" strokeWidth="1.5" />

          {/* Wave fills */}
          <g clipPath={`url(#${clipId})`}>
            <path d={waves.w2} fill="rgba(0,180,220,0.35)" />
            <path d={waves.w1} fill={`url(#${fillGradId})`} opacity="0.85" />
          </g>

          {/* Glow ring when goal reached */}
          {isGoalReached && (
            <circle cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="rgba(0,229,240,0.7)" strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0,229,240,0.9))' }} />
          )}

          {/* Percentage text */}
          <text
            x={size / 2} y={size / 2 + 1}
            textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.2} fontWeight="700" fontFamily="Nunito, sans-serif"
            fill="white"
          >
            {displayPct}%
          </text>
        </svg>

        {name && (
          <span className="mt-1 text-xs font-semibold text-white/60 truncate max-w-[80px] text-center">
            {name}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-hidden">
        <defs>
          <clipPath id={clipId}>
            <circle cx={size / 2} cy={size / 2} r={radius} />
          </clipPath>
          <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5f0" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#00aacc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0077aa" stopOpacity="1" />
          </linearGradient>
          {/* Outer glow filter */}
          <filter id="wave-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track circle */}
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="rgba(0,20,45,0.8)"
          stroke="rgba(0,196,216,0.2)" strokeWidth="2" />

        {/* Wave fills clipped to circle */}
        <g clipPath={`url(#${clipId})`}>
          <path d={waves.w2} fill="rgba(0,160,210,0.3)" />
          <path d={waves.w1} fill={`url(#${fillGradId})`} opacity="0.9" />
        </g>

        {/* Goal reached glow ring */}
        {isGoalReached && (
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#00e5f0" strokeWidth="3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Border ring */}
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(0,196,216,0.35)" strokeWidth="1.5" />

        {/* Center text */}
        <text
          x={size / 2} y={size / 2 - 12}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.155} fontWeight="800" fontFamily="Nunito, sans-serif"
          fill="white"
        >
          {displayPct}%
        </text>
        <text
          x={size / 2} y={size / 2 + 16}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.085} fontWeight="600" fontFamily="Nunito, sans-serif"
          fill="rgba(255,255,255,0.75)"
        >
          {displayMl}
        </text>
        <text
          x={size / 2} y={size / 2 + 32}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.068} fontWeight="500" fontFamily="Nunito, sans-serif"
          fill="rgba(255,255,255,0.45)"
        >
          / {goal}ml
        </text>
      </svg>

      {name && (
        <motion.div
          className="mt-2 text-sm font-bold text-white/80 tracking-wide"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {name}
        </motion.div>
      )}
    </div>
  )
}