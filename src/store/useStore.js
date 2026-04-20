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

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Auto sign-in anonymously
      console.log('🔐 No session, signing in anonymously...')
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) { 
        console.error('❌ Failed to sign in:', error)
        set({ isLoading: false })
        return 
      }
      console.log('✅ Signed in as:', data.user.id)
      set({ user: data.user })
    } else {
      console.log('✅ Found existing session:', session.user.id)
      set({ user: session.user })
    }

        await get().loadProfile()
    const partner = await get().loadPartner()
    await get().loadTodayIntake()
    await get().loadBadges()

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

    // Start realtime subscription
    console.log('🔗 Starting realtime subscription for partner:', partnerId)
    const cleanup = get().subscribeRealtime(partnerId)
    set({ realtimeCleanup: cleanup })

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
    // Immediately reload partner data and start realtime sync
    await get().loadPartner()
    // Also reload badges in case partner-related badges can now be earned
    await get().loadBadges()
    return pair
  },

    // ── Realtime subscriptions ──────────────────────────────
  subscribeRealtime: (partnerId) => {
    const myId = get().user?.id

    const channel = supabase.channel(`aquamate-${myId}`)
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