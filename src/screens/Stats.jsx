import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine, Area, AreaChart,
} from 'recharts'
import useStore from '../store/useStore'

const PERIODS = [
  { id: 'day',   label: '本日', days: 1  },
  { id: 'week',  label: '本週', days: 7  },
  { id: 'month', label: '本月', days: 30 },
]

// Custom tooltip for chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ocean-800/95 border border-white/15 rounded-xl px-3 py-2 text-xs">
      <div className="text-white/50 mb-1 font-semibold">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: p.color }} className="font-bold">{p.value} ml</span>
          <span className="text-white/40">{p.name}</span>
        </div>
      ))}
    </div>
  )
}

export default function StatsScreen() {
  const { profile, partner, user, historyData, historyLoaded, loadHistory } = useStore()
  const [period, setPeriod] = useState('week')
  const [todayHourlyData, setTodayHourlyData] = useState([])

  const myName      = profile?.display_name ?? '我'
  const partnerName = partner?.display_name  ?? '隊友'
  const myGoal      = profile?.daily_goal_ml ?? 2000

  useEffect(() => {
    loadHistory()
  }, [loadHistory])
  
  // Load today's hourly data when period is 'day'
  useEffect(() => {
    if (period !== 'day' || !user) return
    
    const loadTodayHourly = async () => {
      const { supabase } = await import('../lib/supabase')
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      
      // Get my logs
      const { data: myLogs } = await supabase
        .from('intake_logs')
        .select('amount_ml, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', todayStart.toISOString())
        .order('logged_at', { ascending: true })
      
      // Get partner logs if exists
      let partnerLogs = []
      if (partner) {
        const { data } = await supabase
          .from('intake_logs')
          .select('amount_ml, logged_at')
          .eq('user_id', partner.id)
          .gte('logged_at', todayStart.toISOString())
          .order('logged_at', { ascending: true })
        partnerLogs = data || []
      }
      
      // Group by hour
      const hourlyMap = {}
      for (let h = 0; h < 24; h++) {
        hourlyMap[h] = { hour: `${h}:00`, my: 0, partner: 0 }
      }
      
      myLogs?.forEach(log => {
        const hour = new Date(log.logged_at).getHours()
        hourlyMap[hour].my += log.amount_ml
      })
      
      partnerLogs.forEach(log => {
        const hour = new Date(log.logged_at).getHours()
        hourlyMap[hour].partner += log.amount_ml
      })
      
      // Convert to array and filter to show only relevant hours
      const currentHour = new Date().getHours()
      const data = Object.values(hourlyMap)
        .filter((_, i) => i <= currentHour + 1) // Show up to next hour
      
      setTodayHourlyData(data)
    }
    
    loadTodayHourly()
  }, [period, user, partner])

    // Filter data by period
  const chartData = useMemo(() => {
    // For 'day' period, use hourly data
    if (period === 'day') {
      return todayHourlyData
    }
    
    // For other periods, use daily data
    if (!historyData.length) return []
    const days = PERIODS.find(p => p.id === period)?.days ?? 7
    const slice = historyData.slice(-days)

    return slice.map(row => {
      const date = new Date(row.log_date)
      const label = period === 'month'
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : date.toLocaleDateString('zh-TW', { weekday: 'short', day: 'numeric' })
      return {
        date:    label,
        my:      row.my_total,
        partner: row.partner_total,
      }
    })
  }, [historyData, period, todayHourlyData])

    // Summary stats
  const stats = useMemo(() => {
    if (!chartData.length) return { myAvg: 0, partnerAvg: 0, myWins: 0, partnerWins: 0, streak: 0, periodLabel: '每日' }
    
    // Calculate average (skip if period is 'day')
    let myAvg = 0
    let partnerAvg = 0
    let periodLabel = '每日'
    
    if (period === 'day') {
      // For hourly data, just show total
      myAvg = Math.round(chartData.reduce((s, d) => s + d.my, 0))
      partnerAvg = Math.round(chartData.reduce((s, d) => s + d.partner, 0))
      periodLabel = '今日'
    } else if (period === 'week') {
      myAvg = Math.round(chartData.reduce((s, d) => s + d.my, 0) / chartData.length)
      partnerAvg = Math.round(chartData.reduce((s, d) => s + d.partner, 0) / chartData.length)
      periodLabel = '週平均'
    } else if (period === 'month') {
      myAvg = Math.round(chartData.reduce((s, d) => s + d.my, 0) / chartData.length)
      partnerAvg = Math.round(chartData.reduce((s, d) => s + d.partner, 0) / chartData.length)
      periodLabel = '月平均'
    }
    
    const myWins = chartData.filter(d => d.my >= myGoal && d.my > d.partner).length
    const partnerWins = chartData.filter(d => d.partner >= myGoal && d.partner > d.my).length

    // Streak: consecutive goal-met days from end
    let streak = 0
    for (let i = historyData.length - 1; i >= 0; i--) {
      if (historyData[i].my_total >= myGoal) streak++
      else break
    }

    return { myAvg, partnerAvg, myWins, partnerWins, streak, periodLabel }
  }, [chartData, historyData, myGoal, period])

  return (
    <div className="screen" style={{ background: 'linear-gradient(160deg, #020d1a 0%, #0a1628 60%, #0d1f3c 100%)' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3"
           style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <h1 className="text-xl font-extrabold text-white tracking-tight">📊 數據分析</h1>

        {/* Period tabs */}
        <div className="flex gap-1 mt-3 bg-white/5 rounded-xl p-1 relative">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200
                          relative z-10
                ${period === p.id ? 'text-ocean-900' : 'text-white/40 hover:text-white/70'}`}
            >
              {period === p.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-aqua-300 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div className="scroll-area px-5 space-y-4">

        {/* ── Summary stats ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
                    {[
            { label: '我的平均',    value: `${stats.myAvg}ml`,      sub: stats.periodLabel, color: 'text-aqua-300' },
            { label: '隊友平均',    value: `${stats.partnerAvg}ml`, sub: stats.periodLabel, color: 'text-sky-300'  },
            { label: '我先達標',    value: `${stats.myWins}天`,     sub: '期間內',   color: 'text-emerald-300' },
            { label: '連續達標',    value: `${stats.streak}天`,     sub: '目前連續', color: 'text-amber-300'   },
          ].map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass px-4 py-3"
            >
              <div className="text-xs text-white/40 font-semibold">{s.label}</div>
              <div className={`text-2xl font-extrabold mt-1 tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-white/25 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Line chart ───────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="glass px-4 py-4"
          >
                        <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white/70">
                {period === 'day' ? '今日每小時攝水量' : '攝水趨勢對比'}
              </span>
              <div className="flex gap-3">
                <span className="flex items-center gap-1 text-xs text-aqua-300 font-semibold">
                  <span className="w-3 h-0.5 bg-aqua-300 rounded inline-block" />{myName}
                </span>
                {partner && (
                  <span className="flex items-center gap-1 text-xs text-sky-300 font-semibold">
                    <span className="w-3 h-0.5 bg-sky-300 rounded inline-block" />{partnerName}
                  </span>
                )}
              </div>
            </div>

                        {period === 'day' && chartData.length > 0 && (
              <div className="text-[10px] text-white/30 mb-2">
                📊 顯示今日每小時累計攝水量（至目前時間）
              </div>
            )}
            
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="myGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="partnerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis
                    dataKey={period === 'day' ? 'hour' : 'date'}
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                    tickLine={false} axisLine={false}
                    interval={period === 'day' ? 2 : 'preserveStartEnd'}
                  />
                                    <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                    tickLine={false} axisLine={false}
                    tickFormatter={v => v >= 1000 ? `${v/1000}L` : `${v}ml`}
                    label={period === 'day' ? { value: 'ml', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 9 } : undefined}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                  <ReferenceLine
                    y={myGoal} stroke="rgba(16,185,129,0.4)"
                    strokeDasharray="4 3"
                    label={{ value: '目標', fill: 'rgba(16,185,129,0.7)', fontSize: 9, position: 'right' }}
                  />
                  <Area type="monotone" dataKey="my" name={myName}
                    stroke="#22d3ee" strokeWidth={2.5}
                    fill="url(#myGrad)" dot={false} activeDot={{ r: 4, fill: '#22d3ee' }}
                  />
                  {partner && (
                    <Area type="monotone" dataKey="partner" name={partnerName}
                      stroke="#38bdf8" strokeWidth={2}
                      fill="url(#partnerGrad)" strokeDasharray="5 3"
                      dot={false} activeDot={{ r: 4, fill: '#38bdf8' }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                {historyLoaded
                  ? <p className="text-white/30 text-sm">尚無足夠資料</p>
                  : <div className="w-6 h-6 border-2 border-aqua-400/40 border-t-aqua-400 rounded-full animate-spin" />
                }
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Leaderboard ──────────────────────────────────── */}
        <div className="glass px-4 py-4">
          <h3 className="text-sm font-bold text-white/60 mb-3">🏆 本月排行榜（先達標次數）</h3>
          <div className="space-y-2">
            {[
              { name: myName,      wins: stats.myWins,      emoji: profile?.avatar_emoji ?? '💧', isMe: true },
              { name: partnerName, wins: stats.partnerWins, emoji: partner?.avatar_emoji  ?? '💧', isMe: false },
            ]
              .sort((a, b) => b.wins - a.wins)
              .map((p, i) => (
                <div
                  key={p.name}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                    ${p.isMe ? 'bg-aqua-300/10 border border-aqua-400/20' : 'bg-white/5'}`}
                >
                  <span className="text-lg font-black text-white/30">#{i + 1}</span>
                  <span style={{ fontSize: '20px' }}>{p.emoji}</span>
                  <span className="flex-1 font-bold text-sm text-white">{p.name}</span>
                  <span className={`font-extrabold text-base tabular-nums
                    ${p.isMe ? 'text-aqua-300' : 'text-sky-300'}`}>
                    {p.wins} 天
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}