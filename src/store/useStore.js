import { create } from 'zustand'
import { supabase, todayStr, createInviteLink, acceptInvite } from '../lib/supabase'

// ── Badge definitions ────────────────────────────────────────
export const BADGE_DEFS = {
  first_log:     { emoji: '💧', title: '初次報到',   desc: '完成第一次喝水紀錄' },
  streak_3:      { emoji: '🔥', title: '連續3天',    desc: '連續 3 天達成目標' },
  streak_7:      { emoji: '⚡', title: '一週霸主',   desc: '連續 7 天達成目標' },
  streak_30:     { emoji: '👑', title: '月度傳說',   desc: '連續 30 天達成目標' },
  big_drinker:   { emoji: '🌊', title: '海量飲者',   desc: '單日攝水超過 3000 ml' },
  beat_partner:  { emoji: '🏆', title: '先馳得點',   desc: '比隊友先達到今日目標' },
  early_bird:    { emoji: '🌅', title: '早起水鳥',   desc: '早上 8 點前完成 500 ml' },
  night_owl:     { emoji: '🦉', title: '深夜補水',   desc: '晚上 11 點後記錄喝水' },
  pair_champion: { emoji: '💑', title: '夥伴之力',   desc: '和隊友都同天達成目標' },
}

const useStore = create((set, get) => ({
  // ── Auth ────────────────────────────────────────────────
  user:    null,
  profile: null,
  partner: null,
  pairId:  null,
  isLoading: true,

  // ── Today's hydration ───────────────────────────────────
  myIntakeToday:      0,
  partnerIntakeToday: 0,

    // ── Nudge state ─────────────────────────────────────────
  nudgeActive: false,
  nudgeCooldown: false,  // prevent spam

  // ── Pair notification ───────────────────────────────────
  pairNotification: null,  // { type: 'paired', partnerName: 'xxx' }

  // ── Badges ──────────────────────────────────────────────
  myBadges:      [],

  // ── Historical data (for Stats) ─────────────────────────
  historyData:   [],
  historyLoaded: false,

  // ── Realtime cleanup fn ─────────────────────────────────
  realtimeCleanup: null,

  // ── Actions ─────────────────────────────────────────────

                        init: async () => {
    set({ isLoading: true })
    console.log('🔧 Initializing app...')

    // First, check for existing session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.log('🔐 No session found, user needs to login')
      set({ isLoading: false, user: null })
      return
    }

            console.log('✅ Found session:', session.user.email || session.user.id)
    console.log('📧 User object:', JSON.stringify(session.user, null, 2))
    console.log('📧 User email:', session.user.email)
    console.log('📧 User metadata:', session.user.user_metadata)
    console.log('📧 App metadata:', session.user.app_metadata)
    
    // Reject anonymous sessions (should not happen after disabling in Supabase)
    if (session.user.is_anonymous) {
      console.error('❌ Anonymous session detected! Please disable anonymous sign-ins in Supabase Dashboard.')
      await supabase.auth.signOut()
      set({ isLoading: false, user: null })
      return
    }
    
    set({ user: session.user })

        // Setup auth state change listener for future changes
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔐 Auth state changed:', _event, session?.user?.email)
      
      // Only update user state if we have a valid session with email
      // or if explicitly signing out
      if (_event === 'SIGNED_OUT') {
        set({ user: null, profile: null, partner: null })
      } else if (_event === 'INITIAL_SESSION' && session?.user) {
        // Only update on initial session, not on subsequent SIGNED_IN events
        // which might have incomplete user data
        console.log('🔄 Updating user from INITIAL_SESSION')
        set({ user: session.user })
      }
      // Ignore other events (SIGNED_IN, TOKEN_REFRESHED) to prevent overwriting
      // complete user data with incomplete data
    })

            await get().loadProfile()
    const partner = await get().loadPartner()
    await get().loadTodayIntake()
    await get().loadBadges()

        // Always start realtime (to receive pair notifications even when not paired)
    const cleanup = get().startRealtimeSubscription()
    set({ realtimeCleanup: cleanup })

    console.log('✅ App initialized')
    set({ isLoading: false })
  },

  loadProfile: async () => {
    const { user } = get()
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) set({ profile: data })
  },

  updateProfile: async (updates) => {
    const { user, profile } = get()
    if (!user) return

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) set({ profile: data })
    return { error }
  },

    loadPartner: async () => {
    const { user } = get()
    if (!user) return null

    const { data: pairs, error: pairError } = await supabase
      .from('pairs')
      .select('*')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .limit(1)

    if (pairError || !pairs || pairs.length === 0) return null
    
    const pair = pairs[0]

    const partnerId = pair.user_a_id === user.id ? pair.user_b_id : pair.user_a_id
    set({ pairId: pair.id })

    const { data: partner } = await supabase
      .from('users')
      .select('*')
      .eq('id', partnerId)
      .single()

            set({ partner })

    // Load partner's today intake
    const { data: logs } = await supabase
      .from('intake_logs')
      .select('amount_ml')
      .eq('user_id', partnerId)
      .gte('logged_at', todayStr() + 'T00:00:00.000Z')

    const total = logs?.reduce((s, l) => s + l.amount_ml, 0) ?? 0
    set({ partnerIntakeToday: total })

    return partner
  },

  loadTodayIntake: async () => {
    const { user } = get()
    if (!user) return

    const { data } = await supabase
      .from('intake_logs')
      .select('amount_ml')
      .eq('user_id', user.id)
      .gte('logged_at', todayStr() + 'T00:00:00.000Z')

    const total = data?.reduce((s, l) => s + l.amount_ml, 0) ?? 0
    set({ myIntakeToday: total })
  },

    addIntake: async (amountMl) => {
    const { user, myIntakeToday, profile } = get()
    if (!user || amountMl <= 0) return

    console.log('Adding intake:', amountMl, 'Current:', myIntakeToday)

    const { error } = await supabase.from('intake_logs').insert({
      user_id:   user.id,
      amount_ml: amountMl,
    })

    if (error) {
      console.error('Failed to add intake:', error)
      return
    }

    const newTotal = myIntakeToday + amountMl
    console.log('New total:', newTotal)
    set({ myIntakeToday: newTotal })

    // Badge checks (non-blocking)
    get().checkAndAwardBadge('first_log')
    if (newTotal >= 3000) get().checkAndAwardBadge('big_drinker')
    const goal = profile?.daily_goal_ml ?? 2000
    if (newTotal >= goal) {
      get().checkGoalReached()
    }
    const hour = new Date().getHours()
    if (hour < 8) get().checkAndAwardBadge('early_bird')
    if (hour >= 23) get().checkAndAwardBadge('night_owl')
  },

  removeLastIntake: async () => {
    const { user } = get()
    if (!user) return

    const { data } = await supabase
      .from('intake_logs')
      .select('id, amount_ml')
      .eq('user_id', user.id)
      .gte('logged_at', todayStr() + 'T00:00:00.000Z')
      .order('logged_at', { ascending: false })
      .limit(1)

    if (!data?.length) return

    const last = data[0]
    await supabase.from('intake_logs').delete().eq('id', last.id)
    set(s => ({ myIntakeToday: Math.max(0, s.myIntakeToday - last.amount_ml) }))
  },

  loadBadges: async () => {
    const { user } = get()
    if (!user) return

    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })

    set({ myBadges: data ?? [] })
  },

  checkAndAwardBadge: async (badgeType) => {
    const { user, myBadges } = get()
    if (!user) return
    if (myBadges.some(b => b.badge_type === badgeType)) return  // already have it

    const { error } = await supabase
      .from('badges')
      .insert({ user_id: user.id, badge_type: badgeType })

    if (!error) {
      const newBadge = { user_id: user.id, badge_type: badgeType, unlocked_at: new Date().toISOString() }
      set(s => ({ myBadges: [newBadge, ...s.myBadges] }))
    }
  },

  checkGoalReached: async () => {
    const { partnerIntakeToday, partner, profile } = get()
    const partnerGoal = partner?.daily_goal_ml ?? 2000
    const myGoal = profile?.daily_goal_ml ?? 2000
    const myTotal = get().myIntakeToday

    if (myTotal >= myGoal && partnerIntakeToday < partnerGoal) {
      get().checkAndAwardBadge('beat_partner')
    }
    if (myTotal >= myGoal && partnerIntakeToday >= partnerGoal) {
      get().checkAndAwardBadge('pair_champion')
    }
  },

  // ── Nudge ───────────────────────────────────────────────
  sendNudge: async () => {
    const { user, partner, nudgeCooldown } = get()
    if (!user || !partner || nudgeCooldown) return

    set({ nudgeCooldown: true })
    setTimeout(() => set({ nudgeCooldown: false }), 30_000)  // 30s cooldown

    await supabase.from('nudges').insert({
      from_user_id: user.id,
      to_user_id:   partner.id,
    })
  },

    triggerNudge: () => {
    set({ nudgeActive: true })
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300])
    setTimeout(() => set({ nudgeActive: false }), 3500)
  },

  triggerPairNotification: (partnerName) => {
    set({ pairNotification: { type: 'paired', partnerName } })
    if (navigator.vibrate) navigator.vibrate([200, 100, 200])
    setTimeout(() => set({ pairNotification: null }), 4000)
  },

  unpair: async () => {
    const { pairId, realtimeCleanup } = get()
    if (!pairId) return { error: new Error('未配對') }

    // Cleanup realtime first
    if (realtimeCleanup) {
      realtimeCleanup()
      set({ realtimeCleanup: null })
    }

    // Delete pair from database
    const { error } = await supabase
      .from('pairs')
      .delete()
      .eq('id', pairId)

    if (!error) {
      set({ partner: null, pairId: null, partnerIntakeToday: 0 })
    }

    return { error }
  },

  // ── History for Stats ───────────────────────────────────
  loadHistory: async () => {
    const { user, historyLoaded } = get()
    if (!user || historyLoaded) return

    const { data, error } = await supabase.rpc('get_pair_history', {
      p_user_id: user.id,
      p_days: 30,
    })

    if (!error && data) {
      set({ historyData: data, historyLoaded: true })
    }
  },

  // ── Pairing ─────────────────────────────────────────────
  generateInviteLink: async () => {
    const { user } = get()
    if (!user) return null
    return createInviteLink(user.id)
  },

      acceptInviteToken: async (token) => {
    const { user } = get()
    if (!user) throw new Error('未登入')
    const pair = await acceptInvite(token, user.id)
    // Immediately reload partner data
    await get().loadPartner()
    // Restart realtime to include partner events
    const { realtimeCleanup } = get()
    if (realtimeCleanup) realtimeCleanup()
    const cleanup = get().startRealtimeSubscription()
    set({ realtimeCleanup: cleanup })
    // Also reload badges
    await get().loadBadges()
    return pair
  },

          // ── Realtime subscriptions ──────────────────────────────
  startRealtimeSubscription: () => {
    const myId = get().user?.id
    if (!myId) return () => {}

    // Cleanup existing subscription first
    const { realtimeCleanup } = get()
    if (realtimeCleanup) {
      console.log('🧹 Cleaning up old realtime subscription')
      realtimeCleanup()
    }

    const partnerId = get().partner?.id
    console.log('🔗 Starting realtime, partner:', partnerId || 'none')

    let channel = supabase.channel(`aquamate-${myId}`)

    // If we have a partner, listen to their events
    if (partnerId) {
      channel
        // Partner adds water
        .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'intake_logs',
        filter: `user_id=eq.${partnerId}`,
      }, ({ new: log }) => {
        console.log('💧 Partner added water:', log.amount_ml)
        set(s => ({ partnerIntakeToday: s.partnerIntakeToday + log.amount_ml }))
      })
      // Partner deletes water
      .on('postgres_changes', {
        event:  'DELETE',
        schema: 'public',
        table:  'intake_logs',
        filter: `user_id=eq.${partnerId}`,
      }, ({ old: log }) => {
        console.log('❌ Partner removed water:', log.amount_ml)
        set(s => ({ partnerIntakeToday: Math.max(0, s.partnerIntakeToday - (log.amount_ml ?? 0)) }))
            })
        // Partner profile changes
        .on('postgres_changes', {
          event:  'UPDATE',
          schema: 'public',
          table:  'users',
          filter: `id=eq.${partnerId}`,
        }, ({ new: updated }) => {
          console.log('👤 Partner profile updated:', updated)
          set({ partner: updated })
        })
    }

    // Always listen for pairing and nudges (even without partner)
    channel
      // Incoming nudge
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'nudges',
        filter: `to_user_id=eq.${myId}`,
      }, (payload) => {
        console.log('🔔 Received nudge:', payload)
        get().triggerNudge()
      })
      // Someone paired with me (I am user_a_id, they are user_b_id)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'pairs',
        filter: `user_a_id=eq.${myId}`,
      }, async ({ new: pair }) => {
        console.log('💑 Someone paired with me!', pair)
        // Reload partner data
        await get().loadPartner()
        // Show notification
        const partner = get().partner
        if (partner) {
          get().triggerPairNotification(partner.display_name)
        }
      })
      // Pair was deleted (unpaired)
      .on('postgres_changes', {
        event:  'DELETE',
        schema: 'public',
        table:  'pairs',
        filter: `user_a_id=eq.${myId}`,
      }, () => {
        console.log('💔 Pair was deleted')
        set({ partner: null, pairId: null, partnerIntakeToday: 0 })
      })
      .on('postgres_changes', {
        event:  'DELETE',
        schema: 'public',
        table:  'pairs',
        filter: `user_b_id=eq.${myId}`,
      }, () => {
        console.log('💔 Pair was deleted')
        set({ partner: null, pairId: null, partnerIntakeToday: 0 })
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime error:', err)
        }
      })

    return () => {
      console.log('🔌 Disconnecting realtime')
      supabase.removeChannel(channel)
    }
  },

  teardown: () => {
    const { realtimeCleanup } = get()
    if (realtimeCleanup) realtimeCleanup()
  },
}))

export default useStore