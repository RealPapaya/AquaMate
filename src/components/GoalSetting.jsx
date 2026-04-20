import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GOAL_PRESETS = [1500, 2000, 2500, 3000]
const ACTIVITY_LEVELS = [
  { id: 'none',     label: '無運動',   multiplier: 30 },
  { id: 'light',    label: '輕度運動', multiplier: 35 },
  { id: 'moderate', label: '中度運動', multiplier: 40 },
  { id: 'high',     label: '高度運動', multiplier: 45 },
  { id: 'extreme',  label: '極高運動', multiplier: 50 },
]

export default function GoalSetting({ currentGoal, onSave }) {
  const [mode, setMode] = useState('preset') // preset | custom | assess
  const [selectedGoal, setSelectedGoal] = useState(currentGoal)
  const [customGoal, setCustomGoal] = useState('')
  
  // Assessment states
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState('moderate')
  const [recommendedGoal, setRecommendedGoal] = useState(null)

  // Calculate recommended goal based on weight and activity
  const calculateRecommendedGoal = () => {
    if (!weight || weight <= 0) {
      alert('請輸入有效的體重')
      return
    }
    
    const activityLevel = ACTIVITY_LEVELS.find(a => a.id === activity)
    const calculated = Math.round(weight * activityLevel.multiplier / 100) * 100
    
    setRecommendedGoal(calculated)
    setSelectedGoal(calculated)
  }

  const handleApply = () => {
    let finalGoal = selectedGoal
    
    if (mode === 'custom' && customGoal) {
      const parsed = parseInt(customGoal)
      if (parsed >= 500 && parsed <= 5000) {
        finalGoal = parsed
      } else {
        alert('請輸入 500-5000 之間的數值')
        return
      }
    }
    
    onSave(finalGoal)
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('preset')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all
            ${mode === 'preset' 
              ? 'bg-aqua-300/25 text-aqua-200 border border-aqua-400/50' 
              : 'bg-white/5 text-white/40 border border-white/10'}`}
        >
          📋 快速選擇
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all
            ${mode === 'custom' 
              ? 'bg-aqua-300/25 text-aqua-200 border border-aqua-400/50' 
              : 'bg-white/5 text-white/40 border border-white/10'}`}
        >
          ✏️ 自訂輸入
        </button>
        <button
          onClick={() => setMode('assess')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all
            ${mode === 'assess' 
              ? 'bg-aqua-300/25 text-aqua-200 border border-aqua-400/50' 
              : 'bg-white/5 text-white/40 border border-white/10'}`}
        >
          🤖 系統評估
        </button>
      </div>

      {/* Content based on mode */}
      <AnimatePresence mode="wait">
        {mode === 'preset' && (
          <motion.div
            key="preset"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="text-xs text-white/50 font-semibold">選擇每日目標</div>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_PRESETS.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className={`py-3 rounded-xl text-sm font-extrabold transition-all
                    ${selectedGoal === g
                      ? 'bg-aqua-300/25 text-aqua-200 border-2 border-aqua-400/50'
                      : 'bg-white/5 text-white/40 border border-white/10'}`}
                >
                  {g} ml
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="text-xs text-white/50 font-semibold">自訂每日目標</div>
            <div className="relative">
              <input
                type="number"
                value={customGoal}
                onChange={(e) => {
                  setCustomGoal(e.target.value)
                  const val = parseInt(e.target.value)
                  if (val >= 500 && val <= 5000) {
                    setSelectedGoal(val)
                  }
                }}
                placeholder="輸入目標水量"
                min="500"
                max="5000"
                step="50"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                           text-white font-bold text-center text-lg outline-none 
                           focus:border-aqua-400/60 placeholder:text-white/25"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">
                ml
              </div>
            </div>
            <div className="text-[10px] text-white/30 text-center">
              建議範圍：500 - 5000 ml
            </div>
          </motion.div>
        )}

        {mode === 'assess' && (
          <motion.div
            key="assess"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-xs text-white/50 font-semibold">系統評估建議</div>
            
            {/* Weight input */}
            <div className="space-y-2">
              <label className="text-xs text-white/60 font-semibold">您的體重（公斤）</label>
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="例如：70"
                  min="30"
                  max="200"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5
                             text-white font-bold outline-none focus:border-aqua-400/60
                             placeholder:text-white/25"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                  kg
                </div>
              </div>
            </div>

            {/* Activity level */}
            <div className="space-y-2">
              <label className="text-xs text-white/60 font-semibold">運動強度</label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setActivity(level.id)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left
                                transition-all flex items-center justify-between
                      ${activity === level.id
                        ? 'bg-aqua-300/20 text-aqua-200 border border-aqua-400/40'
                        : 'bg-white/5 text-white/50 border border-white/10'}`}
                  >
                    <span>{level.label}</span>
                    <span className="text-[10px] text-white/30">
                      {level.multiplier} ml/kg
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculate button */}
            <button
              onClick={calculateRecommendedGoal}
              disabled={!weight}
              className="btn-primary w-full justify-center text-sm disabled:opacity-50"
            >
              🤖 計算建議水量
            </button>

            {/* Recommendation result */}
            <AnimatePresence>
              {recommendedGoal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-light px-4 py-4 space-y-2"
                >
                  <div className="text-xs text-white/50 font-semibold text-center">
                    🎯 系統建議
                  </div>
                  <div className="text-3xl font-extrabold text-aqua-300 text-center">
                    {recommendedGoal} ml
                  </div>
                  <div className="text-[10px] text-white/30 text-center leading-relaxed">
                    根據您的體重 {weight} kg 和運動強度<br />
                    建議每日攝取約 {recommendedGoal} ml 水分
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply button */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleApply}
          className="flex-1 btn-primary justify-center text-sm"
        >
          ✅ 套用目標
        </button>
      </div>
    </div>
  )
}
