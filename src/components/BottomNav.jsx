import { motion } from 'framer-motion'

const TABS = [
  { id: 'home',    emoji: '💧', label: '今日' },
  { id: 'stats',   emoji: '📊', label: '統計' },
  { id: 'profile', emoji: '🏅', label: '個人' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 flex items-center justify-around
                 bg-ocean-900/80 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)', paddingTop: '8px' }}
    >
      {TABS.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-1 px-6 py-1 rounded-xl
                       transition-all duration-150 active:scale-90 select-none"
          >
            <div className="relative">
              <span className="text-xl leading-none" style={{ fontSize: '22px' }}>
                {tab.emoji}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2
                             w-1 h-1 rounded-full bg-aqua-300"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
            <span className={`text-[10px] font-bold transition-colors duration-150
              ${isActive ? 'text-aqua-300' : 'text-white/35'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}