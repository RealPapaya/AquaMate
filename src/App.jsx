import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore  from './store/useStore'
import BottomNav from './components/BottomNav'
import DevTools  from './components/DevTools'
import SetupGuide from './components/SetupGuide'
import Home      from './screens/Home'
import Stats     from './screens/Stats'
import Profile   from './screens/Profile'
import { acceptInvite } from './lib/supabase'

// ── Screens map ──────────────────────────────────────────────
const SCREENS = { home: Home, stats: Stats, profile: Profile }

// ── Loading / splash ────────────────────────────────────────
function Splash() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6
                    bg-gradient-to-b from-ocean-950 to-ocean-800">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl select-none"
      >
        💧
      </motion.div>
      <div className="text-center">
        <div className="font-extrabold text-2xl text-white tracking-tight">水伴</div>
        <div className="text-sm text-white/40 mt-1 font-semibold">AquaMate</div>
      </div>
      <div className="w-8 h-8 border-2 border-aqua-400/30 border-t-aqua-400 rounded-full animate-spin" />
    </div>
  )
}

// ── Invite join handler (URL: /join?token=xxx) ───────────────
function useInviteFromUrl() {
  const { user, acceptInviteToken } = useStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    if (!token || !user) return

    acceptInviteToken(token)
      .then(() => {
        window.history.replaceState({}, '', '/')
      })
      .catch(e => console.warn('Invite error:', e.message))
  }, [user, acceptInviteToken])
}

// ── Screen transition ────────────────────────────────────────
const variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit:  { opacity: 0, x: -20 },
}

export default function App() {
  const { init, isLoading } = useStore()
  const [tab, setTab] = useState('home')

  useEffect(() => { init() }, [init])
  useInviteFromUrl()

  if (isLoading) return <Splash />

  const Screen = SCREENS[tab]

  return (
    <div
      className="relative h-full max-w-md mx-auto overflow-hidden"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Background ambient gradient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full
                        bg-cyan-500/8 blur-3xl" />
        <div className="absolute top-1/2 -left-16 w-48 h-48 rounded-full
                        bg-blue-500/8 blur-3xl" />
        <div className="absolute bottom-32 right-0 w-40 h-40 rounded-full
                        bg-sky-500/6 blur-2xl" />
      </div>

            {/* Screen with animated transitions */}
      <div className="absolute inset-0" style={{ paddingBottom: '72px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="h-full w-full"
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </div>

                  {/* Bottom Navigation */}
      <BottomNav active={tab} onChange={setTab} />

      {/* Setup Guide */}
      <SetupGuide />

      {/* Dev Tools (development only) */}
      {import.meta.env.DEV && <DevTools />}
    </div>
  )
}