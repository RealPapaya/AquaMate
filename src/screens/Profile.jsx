import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BadgeCard, { BadgeLocked } from '../components/BadgeCard'
import useStore, { BADGE_DEFS } from '../store/useStore'

const AVATAR_OPTIONS = ['💧', '🌊', '🐳', '🦈', '🐬', '🐟', '⛵', '🏖️', '🌿', '💦']
const GOAL_OPTIONS   = [1500, 2000, 2500, 3000]

export default function ProfileScreen() {
  const { profile, partner, myBadges, pairId, updateProfile, generateInviteLink, acceptInviteToken } = useStore()

  const [editMode,     setEditMode]     = useState(false)
  const [name,         setName]         = useState(profile?.display_name ?? '')
  const [goal,         setGoal]         = useState(profile?.daily_goal_ml ?? 2000)
  const [avatar,       setAvatar]       = useState(profile?.avatar_emoji ?? '💧')
  const [saving,       setSaving]       = useState(false)
  const [inviteUrl,    setInviteUrl]    = useState('')
  const [joinToken,    setJoinToken]    = useState('')
  const [pairingState, setPairingState] = useState('idle')  // idle | generating | joining | success | error
  const [pairMsg,      setPairMsg]      = useState('')
  const [copied,       setCopied]       = useState(false)

  const unlockedTypes = new Set(myBadges.map(b => b.badge_type))
  const allTypes      = Object.keys(BADGE_DEFS)

  const handleSave = useCallback(async () => {
    setSaving(true)
    const { error } = await updateProfile({ display_name: name.trim() || '水友', daily_goal_ml: goal, avatar_emoji: avatar })
    setSaving(false)
    if (!error) setEditMode(false)
  }, [name, goal, avatar, updateProfile])

  const handleGenerate = useCallback(async () => {
    setPairingState('generating')
    try {
      const url = await generateInviteLink()
      setInviteUrl(url)
      setPairingState('idle')
    } catch {
      setPairingState('error')
      setPairMsg('生成失敗，請重試')
    }
  }, [generateInviteLink])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [inviteUrl])

    const handleJoin = useCallback(async () => {
    const token = joinToken.trim().split('token=').pop()
    if (!token) return
    setPairingState('joining')
    try {
      await acceptInviteToken(token)
      setPairingState('success')
      setPairMsg('配對成功！🎉')
      setJoinToken('')
      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        setPairingState('idle')
        setPairMsg('')
      }, 2000)
    } catch (e) {
      setPairingState('error')
      setPairMsg(e.message ?? '配對失敗')
    }
  }, [joinToken, acceptInviteToken])

  return (
    <div className="screen" style={{ background: 'linear-gradient(160deg, #020d1a 0%, #0a1628 60%, #0d1f3c 100%)' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between"
           style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <h1 className="text-xl font-extrabold text-white tracking-tight">🏅 個人檔案</h1>
        <button
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          className={`btn-primary text-sm py-2 ${saving ? 'opacity-50' : ''}`}
          disabled={saving}
        >
          {editMode ? (saving ? '儲存中…' : '✅ 完成') : '✏️ 編輯'}
        </button>
      </div>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div className="scroll-area px-5 space-y-4">

        {/* ── Avatar & name ────────────────────────────────── */}
        <motion.div className="glass px-5 py-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div
            whileTap={editMode ? { scale: 0.9 } : {}}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl
              ${editMode ? 'bg-aqua-300/20 border-2 border-aqua-400/50 cursor-pointer' : 'bg-ocean-800/60'}`}
          >
            {avatar}
          </motion.div>

          <div className="flex-1 min-w-0">
            {editMode ? (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={16}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2
                           text-white font-bold w-full outline-none focus:border-aqua-400/60
                           placeholder:text-white/25"
                placeholder="你的名字"
              />
            ) : (
              <div className="font-extrabold text-lg text-white">{profile?.display_name ?? '水友'}</div>
            )}
            <div className="text-xs text-white/35 mt-1 font-semibold">
              目標 {goal}ml／天
              {pairId ? ' · 已配對 💑' : ' · 尚未配對'}
            </div>
          </div>
        </motion.div>

        {/* ── Avatar picker (edit mode) ─────────────────────── */}
        <AnimatePresence>
          {editMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="glass px-4 py-4 overflow-hidden"
            >
              <div className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">選擇頭像</div>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => setAvatar(e)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                      transition-all duration-150 active:scale-90
                      ${avatar === e ? 'bg-aqua-300/30 border-2 border-aqua-400' : 'bg-white/5 border border-white/10'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold text-white/50 mt-4 mb-3 uppercase tracking-wider">每日目標</div>
              <div className="flex gap-2">
                {GOAL_OPTIONS.map(g => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all
                      ${goal === g
                        ? 'bg-aqua-300/25 text-aqua-200 border border-aqua-400/50'
                        : 'bg-white/5 text-white/40 border border-white/10'}`}
                  >
                    {g}ml
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pair section ─────────────────────────────────── */}
        <div className="glass px-4 py-4 space-y-3">
          <div className="text-sm font-bold text-white/60 uppercase tracking-wider">💑 配對設定</div>

                    {pairId && partner ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20"
            >
              <span style={{ fontSize: '28px' }}>{partner.avatar_emoji}</span>
              <div>
                <div className="font-bold text-emerald-300">{partner.display_name}</div>
                <div className="text-xs text-white/40">已永久綁定 💑</div>
              </div>
              <span className="ml-auto text-emerald-400 font-extrabold text-xl">✓</span>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {/* Generate link */}
              <div>
                <button
                  onClick={handleGenerate}
                  disabled={pairingState === 'generating'}
                  className="btn-primary w-full justify-center flex items-center gap-2 text-sm"
                >
                  {pairingState === 'generating' ? '生成中…' : '🔗 建立邀請連結'}
                </button>
                <AnimatePresence>
                  {inviteUrl && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2 flex gap-2 overflow-hidden"
                    >
                      <input
                        readOnly value={inviteUrl}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2
                                   text-xs text-white/60 outline-none truncate"
                      />
                      <button
                        onClick={handleCopy}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors
                          ${copied ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-white/60'}`}
                      >
                        {copied ? '✓' : '複製'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/25 font-semibold">或貼上對方的連結</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Join via token */}
              <div className="flex gap-2">
                <input
                  value={joinToken}
                  onChange={e => setJoinToken(e.target.value)}
                  placeholder="貼上邀請連結…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5
                             text-xs text-white/80 outline-none focus:border-aqua-400/40
                             placeholder:text-white/20"
                />
                <button
                  onClick={handleJoin}
                  disabled={!joinToken || pairingState === 'joining'}
                  className="btn-primary text-xs px-4 flex-shrink-0"
                >
                  {pairingState === 'joining' ? '…' : '加入'}
                </button>
              </div>

              <AnimatePresence>
                {(pairingState === 'success' || pairingState === 'error') && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm font-bold text-center ${pairingState === 'success' ? 'text-emerald-300' : 'text-red-400'}`}
                  >
                    {pairMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Badges ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">🏅 成就勳章</h2>
            <span className="stat-chip">{myBadges.length} / {allTypes.length}</span>
          </div>

          <div className="space-y-2">
            {/* Unlocked badges */}
            {myBadges.map((badge, i) => (
              <BadgeCard key={badge.id ?? badge.badge_type} badge={badge} isNew={i === 0} />
            ))}

            {/* Locked badges */}
            {allTypes
              .filter(t => !unlockedTypes.has(t))
              .map(t => <BadgeLocked key={t} badgeType={t} />)
            }
          </div>
        </div>
      </div>
    </div>
  )
}