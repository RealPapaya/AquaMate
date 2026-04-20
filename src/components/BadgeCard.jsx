import { motion } from 'framer-motion'
import { BADGE_DEFS } from '../store/useStore'
import { BADGE_SVG_MAP } from './icons/BadgeIcons'

export default function BadgeCard({ badge, isNew = false }) {
  const def = BADGE_DEFS[badge.badge_type] ?? {
    emoji: '🎖️',
    title: badge.badge_type,
    desc:  '解鎖成就',
  }

  const unlocked = new Date(badge.unlocked_at)
  const dateStr  = `${unlocked.getMonth() + 1}/${unlocked.getDate()}`

  return (
    <motion.div
      initial={isNew ? { scale: 0, rotate: -10, opacity: 0 } : false}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={isNew ? {
        type: 'spring', stiffness: 300, damping: 18, delay: 0.1,
      } : undefined}
      className="glass flex items-center gap-3 px-4 py-3"
    >
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-aqua-300/15
                      border border-aqua-400/30 flex items-center justify-center">
        {BADGE_SVG_MAP[badge.badge_type] ? (
          <div className="text-aqua-300">
            {BADGE_SVG_MAP[badge.badge_type]({ size: 28 })}
          </div>
        ) : (
          <span style={{ fontSize: '22px', lineHeight: 1 }}>{def.emoji}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm truncate">{def.title}</span>
          {isNew && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[9px] font-black px-1.5 py-0.5 rounded-full
                         bg-aqua-300/30 text-aqua-200 uppercase tracking-wider flex-shrink-0"
            >
              新
            </motion.span>
          )}
        </div>
        <p className="text-[11px] text-white/45 mt-0.5 truncate">{def.desc}</p>
      </div>

      <span className="text-[10px] text-white/30 font-semibold flex-shrink-0">{dateStr}</span>
    </motion.div>
  )
}

// Locked badge placeholder
export function BadgeLocked({ badgeType }) {
  const def = BADGE_DEFS[badgeType]
  if (!def) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl
                    border border-white/5 bg-white/2 opacity-40">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5
                      border border-white/10 flex items-center justify-center grayscale opacity-50">
        {BADGE_SVG_MAP[badgeType] ? (
          <div className="text-white/40">
            {BADGE_SVG_MAP[badgeType]({ size: 28 })}
          </div>
        ) : (
          <span style={{ fontSize: '22px', lineHeight: 1 }}>{def.emoji}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white/40 text-sm">{def.title}</div>
        <p className="text-[11px] text-white/25 mt-0.5">{def.desc}</p>
      </div>
      <span className="text-lg">🔒</span>
    </div>
  )
}