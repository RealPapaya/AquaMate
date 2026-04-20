import { useMemo } from 'react'
import { motion } from 'framer-motion'

// Weekly progress circles at the top
export default function WeeklyProgress({ historyData = [], goal = 2000 }) {
  const weekData = useMemo(() => {
    const today = new Date()
    const weekDays = []
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayData = historyData.find(d => d.log_date === dateStr)
      const total = dayData?.my_total || 0
      const percentage = Math.min(total / goal, 1)
      
      weekDays.push({
        date: dateStr,
        dayName: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        total,
        percentage,
        isToday: i === 0
      })
    }
    
    return weekDays
  }, [historyData, goal])

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {weekData.map((day, index) => (
        <div key={day.date} className="flex flex-col items-center gap-2">
          <div className="text-[10px] text-white/40 font-semibold">
            {day.dayName}
          </div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative w-10 h-10"
          >
            {/* Background circle */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke={day.isToday ? 'rgba(0,196,216,0.15)' : 'rgba(255,255,255,0.08)'}
                strokeWidth="2"
              />
              {/* Progress circle */}
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke={day.percentage >= 1 ? '#10b981' : day.isToday ? '#00c4d8' : '#60a5fa'}
                strokeWidth="2"
                strokeDasharray={`${day.percentage * 113} 113`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Center indicator */}
            <div className={`absolute inset-0 flex items-center justify-center
              ${day.isToday ? 'text-aqua-300' : 'text-white/50'}`}>
              {day.percentage >= 1 ? (
                <span className="text-emerald-400 text-lg">✓</span>
              ) : day.isToday ? (
                <div className="w-2 h-2 rounded-full bg-aqua-400"></div>
              ) : (
                <span className="text-[10px] font-bold">
                  {Math.round(day.percentage * 100)}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  )
}
