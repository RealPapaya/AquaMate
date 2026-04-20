import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, useSpring } from 'framer-motion'

// Generate unique ID for each instance
let instanceCounter = 0

function SimpleWave({ current = 0, goal = 2000, size = 220 }) {
  const [offset, setOffset] = useState(0)
  const pct = Math.min(current / Math.max(goal, 1), 1)
  const radius = size / 2 - 4
  
  // Generate unique IDs for this instance
  const uniqueId = useMemo(() => {
    instanceCounter += 1
    return instanceCounter
  }, [])
  
  const clipId = `wave-clip-simple-${uniqueId}`
  const gradientId = `wave-gradient-simple-${uniqueId}`
  
  // Smooth spring animation for fill percentage
  const springPct = useSpring(pct, {
    stiffness: 60,
    damping: 20,
    mass: 0.8
  })
  
  const [animatedPct, setAnimatedPct] = useState(pct)
  
  // Update animated percentage
  useEffect(() => {
    const unsubscribe = springPct.on('change', (v) => {
      setAnimatedPct(v)
    })
    return unsubscribe
  }, [springPct])
  
  // Update spring when pct changes
  useEffect(() => {
    springPct.set(pct)
  }, [pct, springPct])
  
  // Animate wave offset
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + 0.02)
    }, 16)
    return () => clearInterval(interval)
  }, [])
  
  // Calculate wave paths with animated percentage
  const fillHeight = size * (1 - animatedPct)
  
  // Primary wave
  const wavePoints1 = []
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * size
    const y = fillHeight + Math.sin((i / 60) * Math.PI * 4 + offset) * 8
    wavePoints1.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
  }
  const wavePath1 = `${wavePoints1.join(' ')} L${size},${size} L0,${size} Z`
  
  // Secondary wave (slightly offset for depth)
  const wavePoints2 = []
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * size
    const y = fillHeight + 4 + Math.sin((i / 60) * Math.PI * 4 + offset + Math.PI) * 5
    wavePoints2.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
  }
  const wavePath2 = `${wavePoints2.join(' ')} L${size},${size} L0,${size} Z`
  
  const displayPct = Math.round(animatedPct * 100)
  const displayMl = current >= 1000 ? `${(current / 1000).toFixed(1)}L` : `${current}ml`
  const isGoalReached = pct >= 1
  
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <clipPath id={clipId}>
            <circle cx={size / 2} cy={size / 2} r={radius} />
          </clipPath>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5f0" />
            <stop offset="100%" stopColor="#0099b8" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius}
          fill="#0a1628"
          stroke="#00c4d8"
          strokeWidth="2"
          strokeOpacity="0.3"
        />
        
        {/* Waves */}
        <g clipPath={`url(#${clipId})`}>
          {/* Secondary wave (back layer) */}
          <path 
            d={wavePath2}
            fill="rgba(0,180,220,0.3)"
          />
          {/* Primary wave (front layer) */}
          <path 
            d={wavePath1}
            fill={`url(#${gradientId})`}
            opacity="0.9"
          />
        </g>
        
        {/* Border */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius}
          fill="none"
          stroke="#00c4d8"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        
        {/* Goal reached glow ring */}
        {isGoalReached && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#00e5f0"
            strokeWidth="3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: [0.5, 1, 0.5], 
              scale: [1, 1.02, 1] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          />
        )}
        
        {/* Text */}
        <text
          x={size / 2}
          y={size / 2 - 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.155}
          fontWeight="800"
          fill="white"
          fontFamily="Nunito, sans-serif"
        >
          {displayPct}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.085}
          fontWeight="600"
          fill="rgba(255,255,255,0.75)"
          fontFamily="Nunito, sans-serif"
        >
          {displayMl}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 32}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.068}
          fontWeight="500"
          fill="rgba(255,255,255,0.45)"
          fontFamily="Nunito, sans-serif"
        >
          / {goal}ml
        </text>
      </svg>
    </div>
  )
}

export default SimpleWave
