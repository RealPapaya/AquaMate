import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PRESETS = [150, 250, 350, 500]

export default function WaterSlider({ onAdd, disabled = false }) {
  const [value, setValue]   = useState(250)
  const [adding, setAdding] = useState(false)
  const trackRef = useRef(null)

  // Compute fill percentage for gradient track
  const fillPct = ((value - 50) / (1000 - 50)) * 100

  const handleAdd = useCallback(async () => {
    if (disabled || adding || value <= 0) return
    setAdding(true)

    // Ripple feedback
    if (navigator.vibrate) navigator.vibrate(40)

    await onAdd(value)

    // Bounce animation then reset
    setTimeout(() => setAdding(false), 600)
  }, [value, disabled, adding, onAdd])

  const mlLabel = value >= 1000 ? `${(value / 1000).toFixed(1)} L` : `${value} ml`

  return (
    <div className="glass px-5 py-5 space-y-4">
      {/* Amount display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/50 uppercase tracking-wider">
          新增攝水量
        </span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-2xl font-bold text-aqua-300 tabular-nums"
          >
            {mlLabel}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Slider */}
      <div className="relative" ref={trackRef}>
        {/* Colored track fill */}
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none w-full">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${fillPct}%`,
                background: 'linear-gradient(90deg, #0077aa 0%, #00c4d8 60%, #00e5f0 100%)',
              }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </div>

        <input
          type="range"
          min={50}
          max={1000}
          step={10}
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="relative w-full z-10 bg-transparent"
          style={{ WebkitAppearance: 'none' }}
          aria-label="選擇攝水量"
        />
      </div>

      {/* Scale markers */}
      <div className="flex justify-between text-[10px] font-semibold text-white/25 -mt-1 px-1">
        {[50, 250, 500, 750, 1000].map(n => (
          <span key={n}>{n}</span>
        ))}
      </div>

      {/* Quick preset buttons */}
      <div className="flex gap-2">
        {PRESETS.map(ml => (
          <button
            key={ml}
            onClick={() => setValue(ml)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-150
              ${value === ml
                ? 'bg-aqua-300/25 text-aqua-200 border border-aqua-400/50'
                : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
              }`}
          >
            {ml}ml
          </button>
        ))}
      </div>

      {/* Add button */}
      <motion.button
        onClick={handleAdd}
        disabled={disabled || adding}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200
          ${adding
            ? 'bg-aqua-300/40 text-white scale-95'
            : disabled
              ? 'bg-white/5 text-white/25 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500/80 to-sky-500/80 text-white shadow-wave-glow hover:shadow-lg'
          }`}
      >
        <span className="flex items-center justify-center gap-2">
          {adding ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, ease: 'linear' }}
              >⟳</motion.span>
              記錄中…
            </>
          ) : (
            <>
              <span>💧</span>
              <span>喝了 {mlLabel}！</span>
            </>
          )}
        </span>
      </motion.button>
    </div>
  )
}