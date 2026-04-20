import { useState } from 'react'
import WaveProgress from '../components/WaveProgress'
import { motion } from 'framer-motion'

export default function WaveTest() {
  const [intake, setIntake] = useState(500)
  const goal = 2000

  const addWater = (amount) => {
    setIntake(prev => Math.min(prev + amount, goal + 1000))
  }

  const reset = () => {
    setIntake(0)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-ocean-950 to-ocean-800 p-6">
      <h1 className="text-2xl font-bold text-white">Wave Progress 測試</h1>
      
      <WaveProgress
        current={intake}
        goal={goal}
        size={240}
        name="測試用戶"
      />

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <div className="glass px-4 py-3 text-center">
          <div className="text-sm text-white/60">當前進度</div>
          <div className="text-2xl font-bold text-aqua-300">{intake}ml / {goal}ml</div>
          <div className="text-xs text-white/40 mt-1">
            {Math.round((intake / goal) * 100)}%
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[100, 250, 500].map(amount => (
            <motion.button
              key={amount}
              onClick={() => addWater(amount)}
              whileTap={{ scale: 0.95 }}
              className="glass-light py-3 rounded-xl text-white font-bold hover:bg-aqua-300/10 transition-colors"
            >
              +{amount}ml
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={reset}
          whileTap={{ scale: 0.95 }}
          className="glass py-3 rounded-xl text-white/60 font-semibold hover:text-white/90 transition-colors"
        >
          重置
        </motion.button>
      </div>

      <div className="glass-light px-4 py-3 max-w-sm">
        <div className="text-xs text-white/60 space-y-1">
          <div>💡 <strong>測試說明：</strong></div>
          <div>1. 點擊按鈕增加水量</div>
          <div>2. 觀察波浪動畫是否平滑上升</div>
          <div>3. 達到100%時應該有發光效果</div>
        </div>
      </div>
    </div>
  )
}
