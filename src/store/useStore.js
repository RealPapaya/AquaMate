import { create } from 'zustand'
import { supabase, todayStr, createInviteLink, acceptInvite } from '../lib/supabase'
import * as BadgeManager from '../lib/badgeManager'
import * as BadgeExt from '../lib/badgeManagerExtended'

// ── Badge definitions ────────────────────────────────────────
export const BADGE_DEFS = {
  // 🐶 新手入門 (5個)
  first_log:        { emoji: '💧', title: '初次報到',     desc: '完成第一次喝水紀錄' },
  first_goal:       { emoji: '🌟', title: '首次達標',     desc: '第一次達成每日目標' },
  week_warrior:     { emoji: '💪', title: '一週戰士',     desc: '使用應用滿一週' },
  month_master:     { emoji: '🏅', title: '月度大師',     desc: '使用應用滿一月' },
  hundred_days:     { emoji: '👴', title: '百日老手',     desc: '使用應用滿 100 天' },
  
  // 🔥 連續達標 (7個)
  streak_3:         { emoji: '🔥', title: '三日之火',     desc: '連續 3 天達成目標' },
  streak_7:         { emoji: '⚡', title: '一週霸主',     desc: '連續 7 天達成目標' },
  streak_14:        { emoji: '🔥', title: '雙週戰神',     desc: '連續 14 天達成目標' },
  streak_30:        { emoji: '👑', title: '月度傳說',     desc: '連續 30 天達成目標' },
  streak_50:        { emoji: '🌟', title: '五十天王',     desc: '連續 50 天達成目標' },
  streak_100:       { emoji: '🏆', title: '百日神話',     desc: '連續 100 天達成目標' },
  streak_365:       { emoji: '💎', title: '年度鑽王',     desc: '連續 365 天達成目標' },
  
  // 🌊 水量挑戰 (10個)
  light_drinker:    { emoji: '💦', title: '淺嚐者',       desc: '單日達到 1000 ml' },
  moderate_drinker: { emoji: '💧', title: '正常人',     desc: '單日達到 2000 ml' },
  big_drinker:      { emoji: '🌊', title: '海量飲者',     desc: '單日攝水超過 3000 ml' },
  mega_hydrator:    { emoji: '🌊', title: '水桶挑戰',     desc: '單日攝水超過 4000 ml' },
  ultra_hydrator:   { emoji: '🔱', title: '張簡晨昀',     desc: '單日攝水超過 5000 ml' },
  total_10l:        { emoji: '💧', title: '十公升',       desc: '總累計喝水 10 公升' },
  total_50l:        { emoji: '🌊', title: '五十公升',     desc: '總累計喝水 50 公升' },
  total_100l:       { emoji: '🔱', title: '百升大師',     desc: '總累計喝水 100 公升' },
  total_500l:       { emoji: '🌊', title: '水桶挑戰',     desc: '總累計喝水 500 公升' },
  total_1000l:      { emoji: '🌏', title: '海王',     desc: '總累計喝水 1000 公升' },
  
  // 🕰️ 時間大師 (6個)
  early_bird:       { emoji: '🌅', title: '早起水鳥',     desc: '早上 7 點前完成 500 ml' },
  morning_hydrator: { emoji: '☕', title: '晨間補水',     desc: '上午完成一半目標' },
  lunch_champion:   { emoji: '🍴', title: '午餐冠軍',     desc: '午餐時間喝足 300 ml' },
  afternoon_boost:  { emoji: '☀️', title: '下午加油',     desc: '下午 2-4 點間喝水 500 ml' },
  evening_warrior:  { emoji: '🌆', title: '晚間勇士',     desc: '晚餐前達成目標' },
  night_owl:        { emoji: '🦉', title: '深夜補水',     desc: '晚上 11 點後記錄喝水' },
  
  // 💑 雙人成就 (8個)
  first_pair:       { emoji: '🤝', title: '結識水伴',     desc: '完成第一次配對' },
  beat_partner:     { emoji: '🏆', title: '先馳得點',     desc: '比隊友先達到今日目標' },
  pair_champion:    { emoji: '💑', title: '夥伴之力',     desc: '和隊友都同天達成目標' },
  sync_week:        { emoji: '🔄', title: '同步一週',     desc: '和隊友連續一週都達標' },
  support_master:   { emoji: '👏', title: '推力大師',     desc: '發送 10 次 Nudge 提醒' },
  nudge_receiver:   { emoji: '🔔', title: '受推之王',     desc: '收到 10 次 Nudge 提醒' },
  team_hydration:   { emoji: '🤝', title: '團隊水力',     desc: '和隊友總共喝足 50 公升' },
  long_partnership: { emoji: '💍', title: '長久夥伴',     desc: '配對滿 30 天' },
  
  // 🏅 特殊成就 (9個)
  perfect_day:      { emoji: '🌟', title: '完美一天',     desc: '一天內每小時都有喝水' },
  consistent:       { emoji: '🎯', title: '穩定輸出',     desc: '連續 7 天都在目標±20%' },
  overachiever:     { emoji: '🚀', title: '超越自我',     desc: '連續 7 天都超過目標 20%' },
  comeback_king:    { emoji: '🔙', title: '王者歸來',     desc: '中斷後重新連續 7 天' },
  goal_setter:      { emoji: '🎯', title: '目標制定者',   desc: '修改過 3 次每日目標' },
  badge_collector:  { emoji: '🏅', title: '勳章收藏家',   desc: '獲得 10 個勳章' },
  badge_master:     { emoji: '🏅', title: '勳章大師',     desc: '獲得 25 個勳章' },
  badge_legend:     { emoji: '🏆', title: '勳章傳說',     desc: '獲得 40 個勳章' },
  completionist:    { emoji: '💎', title: '全成就達成',   desc: '獲得所有勳章！' },
  
    // 🎉 特殊節日 (5個)
  new_year:         { emoji: '🎆', title: '第一滴水',   desc: '在元旦達成目標' },
  valentine:        { emoji: '💖', title: '情人節水愛',   desc: '情人節和隊友一起達標' },
  birthday:         { emoji: '🎂', title: '生日快樂',     desc: '在生日當天達成目標' },
  summer_hydration: { emoji: '☀️', title: '夏日補水',     desc: '夏天連續 7 天達成目標' },
  winter_warrior:   { emoji: '❄️', title: '冬日戰士',     desc: '冬天連續 7 天達成目標' },
  
  // 🚫 警示勳章（負面成就）(10個)
  dehydrated:       { emoji: '😵', title: '脱水了',       desc: '一整天沒喝足水分', negative: true },
  zero_day:         { emoji: '💤', title: '沙漠跳鼠',     desc: '一整天完全沒有記錄', negative: true },
  lazy_week:        { emoji: '😴', title: '懶惰一週',     desc: '連續 7 天都未達標', negative: true },
  barely_trying:    { emoji: '😪', title: '極少努力',     desc: '單日只喝不到 500 ml', negative: true },
  ghost_user:       { emoji: '👻', title: '隱形人',       desc: '連續 3 天沒有使用應用', negative: true },
  streak_killer:    { emoji: '💔', title: '功虧一簣',     desc: '中斷了 30+ 天的連續記錄', negative: true },
  midnight_desert:  { emoji: '🏜️', title: '半夜沙漠',     desc: '整天到晚上才開始喝水', negative: true },
  partner_loser:    { emoji: '😔', title: '隊友落後',     desc: '連續 7 天都輸給隊友', negative: true },
  procrastinator:   { emoji: '⏰', title: '拖延症患者',   desc: '晚上 10 點後才達標', negative: true },
  forgotten_app:    { emoji: '📱', title: '被遺忘的APP', desc: '連續 7 天沒有使用', negative: true },
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
    
    // 🎯 檢查使用時長勳章
    const { myBadges } = get()
    BadgeManager.checkUsageBadges(session.user.id, myBadges)
      .catch(err => console.error('🚫 Usage badge check error:', err))

    // 👻 檢查不活躍勳章
    BadgeExt.checkInactiveBadges(session.user.id, myBadges)
      .catch(err => console.error('🚫 Inactive badge check error:', err))
      
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
  const { user, profile, myBadges } = get()
  if (!user) return

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)

  if (!error) {
    set({ profile: { ...profile, ...updates } })
    
    // 🎯 檢查目標修改勳章
    if (updates.daily_goal_ml && updates.daily_goal_ml !== profile?.daily_goal_ml) {
      BadgeExt.checkGoalChangeBadge(user.id, myBadges)
        .catch(err => console.error('🚫 Goal change badge check error:', err))
    }
  }

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

    // 🏆 勳章檢查 (non-blocking)
    const goal = profile?.daily_goal_ml ?? 2000
    const hour = new Date().getHours()
    const { myBadges } = get()
    
    // 使用勳章管理器檢查
    BadgeManager.checkIntakeBadges(user.id, myBadges, {
      newTotal,
      amount: amountMl,
      goal,
      hour,
    }).catch(err => console.error('🚫 Badge check error:', err))
    
    // 達標檢查
    if (newTotal >= goal) {
      get().checkGoalReached()
    }
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
    const { user, partnerIntakeToday, partner, profile, myBadges, myIntakeToday, historyData } = get()
    if (!user) return
    
    const partnerGoal = partner?.daily_goal_ml ?? 2000
    const myGoal = profile?.daily_goal_ml ?? 2000

    // 🏆 使用勳章管理器檢查達標相關勳章
    BadgeManager.checkGoalBadges(user.id, myBadges, {
      myIntake: myIntakeToday,
      myGoal,
      partnerIntake: partnerIntakeToday,
      partnerGoal,
      hasPartner: !!partner,
    }).catch(err => console.error('🚫 Goal badge check error:', err))
    
    // 🎉 檢查節日勳章
    BadgeManager.checkHolidayBadges(user.id, myBadges, {
      intakeToday: myIntakeToday,
      goal: myGoal,
      hasPartner: !!partner,
      partnerIntake: partnerIntakeToday,
      partnerGoal,
    }).catch(err => console.error('🚫 Holiday badge check error:', err))
    
    // 📅 檢查每日勳章
    const hour = new Date().getHours()
    BadgeManager.checkDailyBadges(user.id, myBadges, {
      intakeToday: myIntakeToday,
      goal: myGoal,
      hour,
    }).catch(err => console.error('🚫 Daily badge check error:', err))
    
    // 💍 檢查長久夥伴
    if (partner) {
      BadgeExt.checkLongPartnershipBadge(user.id, myBadges)
        .catch(err => console.error('🚫 Partnership badge check error:', err))
        
      // 🤝 檢查團隊水力
      BadgeExt.checkTeamHydrationCached(user.id, partner.id, myBadges)
        .catch(err => console.error('🚫 Team hydration badge check error:', err))
  }
  
  // 使用快取版本的總累計檢查
  BadgeExt.checkTotalVolumeBadgesCached(user.id, myBadges)
    .catch(err => console.error('🚫 Total volume badge check error:', err))
},

  // ── Nudge ───────────────────────────────────────────────
  sendNudge: async () => {
  const { user, partner, nudgeCooldown, myBadges } = get()
  if (!user || !partner || nudgeCooldown) return

  set({ nudgeCooldown: true })
  setTimeout(() => set({ nudgeCooldown: false }), 30_000)

  await supabase.from('nudges').insert({
    from_user_id: user.id,
    to_user_id:   partner.id,
  })
  
  // 🔔 記錄 Nudge 並檢查勳章
  BadgeExt.recordNudgeAndCheck(user.id, partner.id, myBadges, [])
    .catch(err => console.error('🚫 Nudge badge check error:', err))
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
    const { user, myBadges } = get()
    if (!user) throw new Error('未登入')
    
    // 檢查是否是第一次配對
    const isFirstPair = !myBadges.some(b => b.badge_type === 'first_pair')
    
    const pair = await acceptInvite(token, user.id)
    // Immediately reload partner data
    await get().loadPartner()
    // Restart realtime to include partner events
    const { realtimeCleanup } = get()
    if (realtimeCleanup) realtimeCleanup()
    const cleanup = get().startRealtimeSubscription()
    set({ realtimeCleanup: cleanup })
    
    // 🤝 配對勳章檢查
    if (isFirstPair) {
      BadgeManager.checkAndAwardBadge(user.id, 'first_pair', myBadges)
        .catch(err => console.error('🚫 Pair badge check error:', err))
    }
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