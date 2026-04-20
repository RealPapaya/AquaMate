import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function SetupGuide() {
  const [checks, setChecks] = useState({
    env: false,
    tables: false,
    realtime: false,
  })
  const [isChecking, setIsChecking] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    runChecks()
  }, [])

  const runChecks = async () => {
    setIsChecking(true)
    const results = {}

    // Check 1: Environment variables
    const hasUrl = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-project')
    const hasKey = import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.length > 20
    results.env = hasUrl && hasKey

    // Skip auth check - handled by Login screen

    // Check 3: Tables exist
    try {
      const { error } = await supabase.from('users').select('*').limit(1)
      results.tables = !error
    } catch {
      results.tables = false
    }

    // Check 4: Realtime (can't easily check, assume true if tables exist)
    results.realtime = results.tables

    setChecks(results)
    setIsChecking(false)

    // Show guide if any check failed
    const allPassed = Object.values(results).every(v => v)
    setShowGuide(!allPassed)
  }

  const projectId = 'pzznpnochkenridvjzui'
  
  const steps = [
    {
      id: 'env',
      title: '環境變數',
      description: 'Supabase URL 和 Key',
      passed: checks.env,
      action: '檢查 .env.local 檔案',
      link: null,
    },
    {
      id: 'tables',
      title: '資料庫 Schema',
      description: '執行 SCHEMA.sql',
      passed: checks.tables,
      action: '前往 SQL Editor',
      link: `https://supabase.com/dashboard/project/${projectId}/sql/new`,
    },
    {
      id: 'realtime',
      title: 'Realtime 同步',
      description: '啟用即時更新',
      passed: checks.realtime,
      action: '前往設定',
      link: `https://supabase.com/dashboard/project/${projectId}/database/replication`,
    },
  ]

  const allPassed = Object.values(checks).every(v => v)

  if (!showGuide && allPassed) return null

  return (
    <AnimatePresence>
      {showGuide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowGuide(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass max-w-md w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🚀</div>
              <h2 className="text-2xl font-bold text-white mb-2">設定 Supabase</h2>
              <p className="text-sm text-white/60">
                {allPassed ? '✨ 全部完成！' : '完成以下步驟開始使用'}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-light p-4 rounded-xl ${
                    step.passed ? 'border-green-500/30' : 'border-yellow-500/30'
                  } border`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                      {isChecking ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                      ) : step.passed ? (
                        <span className="text-green-400 text-lg">✓</span>
                      ) : (
                        <span className="text-yellow-400 text-lg">!</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{step.title}</div>
                      <div className="text-xs text-white/50 mt-0.5">{step.description}</div>
                      {!step.passed && step.link && (
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs font-semibold text-aqua-300 hover:text-aqua-200 transition-colors"
                        >
                          {step.action} →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Instructions */}
            {!allPassed && (
              <div className="glass-light p-4 rounded-xl mb-4">
                <div className="text-xs text-white/60 space-y-2">
                  <div className="font-bold text-white/80">📝 快速步驟：</div>
                  {!checks.tables && (
                    <div>1. 在 SQL Editor 執行 src/SCHEMA.sql</div>
                  )}
                  {!checks.realtime && (
                    <div>2. 啟用 Realtime Replication（建議）</div>
                  )}
                  <div className="pt-2 text-white/40">
                    完成後點擊下方重新檢查
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={runChecks}
                disabled={isChecking}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isChecking ? '檢查中...' : '🔄 重新檢查'}
              </button>
              <button
                onClick={() => setShowGuide(false)}
                className="flex-1 btn-ghost"
              >
                {allPassed ? '開始使用' : '稍後設定'}
              </button>
            </div>

            {/* Help Link */}
            <div className="text-center mt-4">
              <a
                href="https://github.com/yourusername/aquamate/blob/main/SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                查看完整設定指南 →
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Floating button when guide is hidden */}
      {!showGuide && !allPassed && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowGuide(true)}
          className="fixed top-4 right-4 z-40 px-4 py-2 bg-yellow-500/80 backdrop-blur-sm rounded-full text-white text-xs font-bold shadow-lg flex items-center gap-2"
        >
          <span>⚠️</span>
          <span>設定未完成</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
