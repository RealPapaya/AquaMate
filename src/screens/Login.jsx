import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' | 'error'

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error

      setMessageType('success')
      setMessage('✅ 登入連結已發送到你的信箱！請檢查收件匣（包括垃圾郵件）')
      setEmail('')
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || '發送失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || 'Google 登入失敗')
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-6"
         style={{ background: 'linear-gradient(160deg, #020d1a 0%, #0a1628 50%, #0d1f3c 100%)' }}>
      
      {/* Logo & Title */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="text-7xl mb-4"
        >
          💧
        </motion.div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          水伴 AquaMate
        </h1>
        <p className="text-sm text-white/50 font-medium">
          與另一半一起養成喝水習慣
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm space-y-4"
      >
        {/* Email Magic Link */}
        <div className="glass px-5 py-6 space-y-4">
          <div className="text-center">
            <div className="text-sm font-bold text-white/80 mb-1">
              📧 Email 登入
            </div>
            <div className="text-xs text-white/40">
              我們會發送登入連結到你的信箱
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                         text-white placeholder:text-white/30 outline-none
                         focus:border-aqua-400/60 transition-colors
                         disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {loading ? '發送中...' : '🔗 發送登入連結'}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30 font-semibold">或</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="glass w-full px-5 py-4 flex items-center justify-center gap-3
                     hover:bg-white/5 active:scale-98 transition-all
                     disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-white font-semibold text-sm">
            使用 Google 帳號登入
          </span>
        </button>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`glass px-4 py-3 text-sm text-center ${
                messageType === 'success' 
                  ? 'text-emerald-300 border border-emerald-400/30' 
                  : 'text-red-300 border border-red-400/30'
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center text-xs text-white/30"
      >
        <p>登入即代表同意服務條款與隱私政策</p>
        <p className="mt-1">資料安全由 Supabase 保護</p>
      </motion.div>
    </div>
  )
}
