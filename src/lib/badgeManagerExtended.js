/**
 * 勳章管理器擴展 - 使用新資料庫欄位的功能
 * 需要先執行 SCHEMA_UPDATE_BADGES.sql
 */

import { supabase } from './supabase'
import { checkAndAwardBadge } from './badgeManager'

// ========================================
// 🔔 Nudge 相關勳章檢查
// ========================================

/**
 * 記錄 Nudge 並檢查相關勳章
 */
export async function recordNudgeAndCheck(senderId, receiverId, senderBadges, receiverBadges) {
  // 調用資料庫函數記錄 Nudge
  const { error } = await supabase.rpc('record_nudge', {
    sender_id: senderId,
    receiver_id: receiverId
  })
  
  if (error) {
    console.error('❌ Record nudge error:', error)
    return
  }
  
  // 查詢更新後的計數
  const { data: senderData } = await supabase
    .from('users')
    .select('nudge_sent_count')
    .eq('id', senderId)
    .single()
  
  const { data: receiverData } = await supabase
    .from('users')
    .select('nudge_received_count')
    .eq('id', receiverId)
    .single()
  
  // 檢查勳章
  if (senderData?.nudge_sent_count >= 10) {
    await checkAndAwardBadge(senderId, 'support_master', senderBadges)
  }
  
  if (receiverData?.nudge_received_count >= 10) {
    await checkAndAwardBadge(receiverId, 'nudge_receiver', receiverBadges)
  }
}

// ========================================
// 🎯 目標修改相關
// ========================================

/**
 * 檢查目標修改次數勳章
 */
export async function checkGoalChangeBadge(userId, myBadges) {
  const { data } = await supabase
    .from('users')
    .select('goal_changes_count')
    .eq('id', userId)
    .single()
  
  if (data?.goal_changes_count >= 3) {
    await checkAndAwardBadge(userId, 'goal_setter', myBadges)
  }
}

// ========================================
// 💍 配對時長相關
// ========================================

/**
 * 檢查長久夥伴勳章
 */
export async function checkLongPartnershipBadge(userId, myBadges) {
  const { data, error } = await supabase.rpc('get_partnership_days', {
    user_id_input: userId
  })
  
  if (error) {
    console.error('❌ Get partnership days error:', error)
    return
  }
  
  if (data >= 30) {
    await checkAndAwardBadge(userId, 'long_partnership', myBadges)
  }
}

// ========================================
// 👻 活躍度檢查（負面勳章）
// ========================================

/**
 * 檢查不活躍勳章
 */
export async function checkInactiveBadges(userId, myBadges) {
  const { data: userData } = await supabase
    .from('users')
    .select('last_active_date')
    .eq('id', userId)
    .single()
  
  if (!userData?.last_active_date) return
  
  const lastActive = new Date(userData.last_active_date)
  const daysSince = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
  
  // 隱形人：連續3天沒用
  if (daysSince >= 3 && daysSince < 7) {
    await checkAndAwardBadge(userId, 'ghost_user', myBadges)
  }
  
  // 被遺忘的APP：連續7天沒用
  if (daysSince >= 7) {
    await checkAndAwardBadge(userId, 'forgotten_app', myBadges)
  }
}

// ========================================
// 🎂 生日相關
// ========================================

/**
 * 檢查生日勳章
 */
export async function checkBirthdayBadge(userId, myBadges, intakeToday, goal) {
  if (intakeToday < goal) return
  
  const { data } = await supabase
    .from('users')
    .select('birthday')
    .eq('id', userId)
    .single()
  
  if (!data?.birthday) return
  
  const today = new Date()
  const birthday = new Date(data.birthday)
  
  // 檢查是否是生日（只比較月日）
  if (today.getMonth() === birthday.getMonth() && 
      today.getDate() === birthday.getDate()) {
    await checkAndAwardBadge(userId, 'birthday', myBadges)
  }
}

// ========================================
// 💧 使用快取的總水量
// ========================================

/**
 * 使用快取檢查總累計勳章（性能優化版）
 */
export async function checkTotalVolumeBadgesCached(userId, myBadges) {
  const { data } = await supabase
    .from('users')
    .select('total_ml_cached')
    .eq('id', userId)
    .single()
  
  if (!data) return
  
  const totalL = (data.total_ml_cached || 0) / 1000
  const checks = []
  
  if (totalL >= 10) checks.push(checkAndAwardBadge(userId, 'total_10l', myBadges))
  if (totalL >= 50) checks.push(checkAndAwardBadge(userId, 'total_50l', myBadges))
  if (totalL >= 100) checks.push(checkAndAwardBadge(userId, 'total_100l', myBadges))
  if (totalL >= 500) checks.push(checkAndAwardBadge(userId, 'total_500l', myBadges))
  if (totalL >= 1000) checks.push(checkAndAwardBadge(userId, 'total_1000l', myBadges))
  
  await Promise.all(checks)
}

// ========================================
// 🤝 團隊累計優化版
// ========================================

/**
 * 檢查團隊水力勳章（使用快取）
 */
export async function checkTeamHydrationCached(userId, partnerId, myBadges) {
  const { data: myData } = await supabase
    .from('users')
    .select('total_ml_cached')
    .eq('id', userId)
    .single()
  
  const { data: partnerData } = await supabase
    .from('users')
    .select('total_ml_cached')
    .eq('id', partnerId)
    .single()
  
  if (!myData || !partnerData) return
  
  const totalL = ((myData.total_ml_cached || 0) + (partnerData.total_ml_cached || 0)) / 1000
  
  if (totalL >= 50) {
    await checkAndAwardBadge(userId, 'team_hydration', myBadges)
  }
}
