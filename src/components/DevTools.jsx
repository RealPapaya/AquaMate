import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, myIntakeToday, partner, partnerIntakeToday } = useStore()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const hasSupabase = supabaseUrl && !supabaseUrl.includes('your-project')

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center justify-center text-white font-bold shadow-lg"
        whileTap={{ scale: 0.9 }}
      >
        🛠️
      </motion.button>

      {/* Debug panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-40 right-4 left-4 z-40 glass p-4 rounded-2xl max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold">🛠️ Debug Info</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white/80 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Supabase Status */}
              <div className="glass-light p-3 rounded-xl">
                <div className="font-bold text-white/80 mb-2">Supabase 連線</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/50">狀態：</span>
                    <span className={hasSupabase ? 'text-green-400' : 'text-red-400'}>
                      {hasSupabase ? '✅ 已設定' : '❌ 未設定'}
                    </span>
                  </div>
                  {!hasSupabase && (
                    <div className="text-yellow-400 text-[10px] mt-2">
                      ⚠️ 請在 .env.local 設定 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="glass-light p-3 rounded-xl">
                <div className="font-bold text-white/80 mb-2">用戶資訊</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/50">User ID：</span>
                    <span className="text-white/70 font-mono text-[10px]">
                      {user?.id?.slice(0, 8) || 'null'}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">名稱：</span>
                    <span className="text-white/70">{profile?.display_name || 'null'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">今日攝水：</span>
                    <span className="text-aqua-300 font-bold">{myIntakeToday}ml</span>
                  </div>
                </div>
              </div>

              {/* Partner Info */}
              <div className="glass-light p-3 rounded-xl">
                <div className="font-bold text-white/80 mb-2">配對資訊</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/50">配對狀態：</span>
                    <span className={partner ? 'text-green-400' : 'text-white/40'}>
                      {partner ? '✅ 已配對' : '未配對'}
                    </span>
                  </div>
                  {partner && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/50">隊友：</span>
                        <span className="text-white/70">{partner.display_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">隊友攝水：</span>
                        <span className="text-sky-300 font-bold">{partnerIntakeToday}ml</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-light p-3 rounded-xl">
                <div className="font-bold text-white/80 mb-2">快速測試</div>
                <button
                  onClick={() => {
                    const store = useStore.getState()
                    store.addIntake(100)
                  }}
                  className="w-full py-2 bg-aqua-300/20 hover:bg-aqua-300/30 rounded-lg text-aqua-200 font-semibold transition-colors"
                >
                  測試加水 +100ml
                </button>
              </div>

              {/* Environment Info */}
              <div className="glass-light p-3 rounded-xl">
                <div className="font-bold text-white/80 mb-2">環境變數</div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-white/50">SUPABASE_URL：</span>
                    <span className={hasSupabase ? 'text-green-400' : 'text-red-400'}>
                      {hasSupabase ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">SUPABASE_ANON_KEY：</span>
                    <span className={import.meta.env.VITE_SUPABASE_ANON_KEY?.length > 20 ? 'text-green-400' : 'text-red-400'}>
                      {import.meta.env.VITE_SUPABASE_ANON_KEY?.length > 20 ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
