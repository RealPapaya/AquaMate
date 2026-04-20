import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WaveProgress from '../components/WaveProgress'
import SimpleWave from '../components/SimpleWave'
import WaterSlider  from '../components/WaterSlider'
import useStore     from '../store/useStore'

export default function HomeScreen() {
  const {
    profile, partner,
    myIntakeToday, partnerIntakeToday,
    nudgeActive, nudgeCooldown,
    addIntake, removeLastIntake, sendNudge,
  } = useStore()

  const [showUndo, setShowUndo]   = useState(false)
  const [lastAdded, setLastAdded] = useState(0)

  const myGoal       = profile?.daily_goal_ml  ?? 2000
  const partnerGoal  = partner?.daily_goal_ml  ?? 2000
  const myName       = profile?.display_name   ?? '我'
  const partnerName  = partner?.display_name   ?? '隊友'
  const myEmoji      = profile?.avatar_emoji   ?? '💧'

  const myPct      = Math.min(myIntakeToday / myGoal, 1)
  const partnerPct = Math.min(partnerIntakeToday / partnerGoal, 1)
  const isGoalDone = myPct >= 1

  const handleAdd = async (ml) => {
    setLastAdded(ml)
    await addIntake(ml)
    setShowUndo(true)
    setTimeout(() => setShowUndo(false), 8000)
  }

  const handleUndo = async () => {
    await removeLastIntake()
    setShowUndo(false)
  }

  return (
    <div
      className={`screen relative ${nudgeActive ? 'nudge-overlay' : ''}`}
      style={{ background: 'linear-gradient(160deg, #020d1a 0%, #0a1628 50%, #0d1f3c 100%)' }}
    >
      {/* ── Nudge notification ─────────────────────────────── */}
      <AnimatePresence>
        {nudgeActive && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-0 left-0 right-0 z-50
                       bg-gradient-to-r from-cyan-500/90 to-sky-500/90
                       backdrop-blur-xl px-5 py-4 flex items-center gap-3"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
              style={{ fontSize: '24px' }}
            >
              💦
            </motion.span>
            <div>
              <div className="font-bold text-white text-sm">{partnerName} 提醒你喝水！</div>
              <div className="text-xs text-white/70">記得補充水分哦 ✨</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="px-5 pt-4 pb-2 flex items-center justify-between"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            {myEmoji} 今日水量
          </h1>
          <p className="text-xs text-white/40 mt-0.5">
            {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </div>

        <AnimatePresence>
          {isGoalDone && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="px-3 py-1.5 rounded-full bg-emerald-500/20
                         border border-emerald-400/40 text-emerald-300
                         text-xs font-bold"
            >
              ✅ 達標！
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div className="scroll-area px-5 space-y-4 pb-4">

        {/* ── Main wave circle ───────────────────────────── */}
        <motion.div
          className="flex flex-col items-center justify-center py-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        >
          <SimpleWave
            current={myIntakeToday}
            goal={myGoal}
            size={220}
          />
        </motion.div>

        {/* ── Quick stats row ───────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '目標',  value: `${myGoal}ml`,                              emoji: '🎯' },
            { label: '還差',  value: `${Math.max(0, myGoal - myIntakeToday)}ml`, emoji: '📏' },
            { label: '進度',  value: `${Math.round(myPct * 100)}%`,              emoji: '⚡' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="glass-light px-3 py-3 flex flex-col items-center gap-1">
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{emoji}</span>
              <span className="text-xs text-white/45 font-semibold">{label}</span>
              <motion.span
                key={value}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-sm font-extrabold text-white tabular-nums"
              >
                {value}
              </motion.span>
            </div>
          ))}
        </div>

        {/* ── Water slider ─────────────────────────────── */}
        <WaterSlider onAdd={handleAdd} />

        {/* ── Undo toast ───────────────────────────────── */}
        <AnimatePresence>
          {showUndo && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="flex items-center justify-between glass-light px-4 py-3"
            >
              <span className="text-sm text-white/60">
                已記錄 <span className="text-aqua-300 font-bold">{lastAdded}ml</span>
              </span>
              <button
                onClick={handleUndo}
                className="text-xs font-bold text-white/40 hover:text-white/80
                           border border-white/10 rounded-lg px-3 py-1 transition-colors"
              >
                ↩ 撤銷
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Partner section ───────────────────────────── */}
        {partner ? (
          <div className="glass px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white/60 uppercase tracking-wider">
                隊友進度
              </span>
              <span className="stat-chip">即時同步</span>
            </div>

            <div className="flex items-center gap-4">
              <SimpleWave
                current={partnerIntakeToday}
                goal={partnerGoal}
                size={90}
              />

              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50 font-semibold">{partnerName}</span>
                    <span className="text-white/70 font-bold tabular-nums">
                      {partnerIntakeToday}ml
                    </span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                      animate={{ width: `${partnerPct * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.34, 1.2, 0.64, 1] }}
                    />
                  </div>
                  <div className="text-right text-[10px] text-white/30 mt-1">
                    目標 {partnerGoal}ml
                  </div>
                </div>

                {/* Nudge button */}
                <motion.button
                  onClick={sendNudge}
                  disabled={nudgeCooldown}
                  whileTap={{ scale: 0.92 }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center
                             justify-center gap-2 transition-all duration-200
                    ${nudgeCooldown
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-200 border border-amber-400/30 hover:border-amber-400/60'
                    }`}
                >
                  <span style={{ fontSize: '14px' }}>🔔</span>
                  {nudgeCooldown ? '已提醒（冷卻中）' : `提醒 ${partnerName} 喝水`}
                </motion.button>
              </div>
            </div>

            {/* VS comparison */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/8">
              <div className="flex-1 text-center">
                <div className="text-[10px] text-white/30">我</div>
                <div className="text-sm font-extrabold text-aqua-300">
                  {Math.round(myPct * 100)}%
                </div>
              </div>
              <div className="text-white/20 font-bold text-sm">VS</div>
              <div className="flex-1 text-center">
                <div className="text-[10px] text-white/30">{partnerName}</div>
                <div className="text-sm font-extrabold text-sky-300">
                  {Math.round(partnerPct * 100)}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <NoPairCard />
        )}
      </div>
    </div>
  )
}

function NoPairCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass px-5 py-6 flex flex-col items-center gap-3 text-center"
    >
      <span style={{ fontSize: '40px' }}>💑</span>
      <div>
        <div className="font-bold text-white">還沒有水伴</div>
        <div className="text-xs text-white/45 mt-1">
          前往「個人」頁面建立配對連結，<br />邀請另一半一起喝水！
        </div>
      </div>
    </motion.div>
  )
}
