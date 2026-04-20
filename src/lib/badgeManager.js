import { supabase } from './supabase'

/**
 * 勳章管理器 - 負責所有勳章的觸發邏輯
 */

// ========================================
// 🎯 主要觸發函數
// ========================================

/**
 * 檢查並授予單個勳章
 */
export async function checkAndAwardBadge(userId, badgeType, myBadges = []) {
  if (!userId) return false
  
  // 檢查是否已擁有
  if (myBadges.some(b => b.badge_type === badgeType)) {
    return false
  }
  
  // 授予勳章
  const { error } = await supabase
    .from('badges')
    .insert({ user_id: userId, badge_type: badgeType })
  
  if (!error) {
    console.log(`🏆 獲得勳章: ${badgeType}`)
    return true
  }
  
  return false
}

// ========================================
// 💧 喝水相關觸發 (在 addIntake 時調用)
// ========================================

export async function checkIntakeBadges(userId, myBadges, intakeData) {
  const { newTotal, amount, goal, hour } = intakeData
  const checks = []
  
  // 第一次喝水
  checks.push(checkAndAwardBadge(userId, 'first_log', myBadges))
  
  // 水量里程碑
  if (newTotal >= 1000) checks.push(checkAndAwardBadge(userId, 'light_drinker', myBadges))
  if (newTotal >= 2000) checks.push(checkAndAwardBadge(userId, 'moderate_drinker', myBadges))
  if (newTotal >= 3000) checks.push(checkAndAwardBadge(userId, 'big_drinker', myBadges))
  if (newTotal >= 4000) checks.push(checkAndAwardBadge(userId, 'mega_hydrator', myBadges))
  if (newTotal >= 5000) checks.push(checkAndAwardBadge(userId, 'ultra_hydrator', myBadges))
  
  // 時間相關
  if (hour < 7 && amount >= 500) {
    checks.push(checkAndAwardBadge(userId, 'early_bird', myBadges))
  }
  
  if (hour >= 12 && hour < 14 && amount >= 300) {
    checks.push(checkAndAwardBadge(userId, 'lunch_champion', myBadges))
  }
  
  if (hour >= 14 && hour < 16) {
    // 檢查這段時間總共喝了多少
    const afternoonTotal = await getTimePeriodTotal(userId, 14, 16)
    if (afternoonTotal >= 500) {
      checks.push(checkAndAwardBadge(userId, 'afternoon_boost', myBadges))
    }
  }
  
  if (hour >= 23) {
    checks.push(checkAndAwardBadge(userId, 'night_owl', myBadges))
  }
  
  // 上午達到一半目標
  if (hour < 12 && newTotal >= goal / 2) {
    checks.push(checkAndAwardBadge(userId, 'morning_hydrator', myBadges))
  }
  
  // 晚餐前達標
  if (hour < 19 && newTotal >= goal) {
    checks.push(checkAndAwardBadge(userId, 'evening_warrior', myBadges))
  }
  
  // 拖延症：晚上10點後才達標
  const prevTotal = newTotal - amount
  if (hour >= 22 && newTotal >= goal && prevTotal < goal) {
    checks.push(checkAndAwardBadge(userId, 'procrastinator', myBadges))
  }
  
  // 半夜沙漠：很晚才開始喝水
  if (hour >= 22 && prevTotal < 500 && amount > 0) {
    checks.push(checkAndAwardBadge(userId, 'midnight_desert', myBadges))
  }
  
  await Promise.all(checks)
}

// ========================================
// 🎯 達標相關觸發 (在 checkGoalReached 時調用)
// ========================================

export async function checkGoalBadges(userId, myBadges, goalData) {
  const { myIntake, myGoal, partnerIntake, partnerGoal, hasPartner } = goalData
  const checks = []
  
  // 首次達標
  if (myIntake >= myGoal) {
    checks.push(checkAndAwardBadge(userId, 'first_goal', myBadges))
  }
  
  // 雙人成就
  if (hasPartner) {
    // 比隊友先達標
    if (myIntake >= myGoal && partnerIntake < partnerGoal) {
      checks.push(checkAndAwardBadge(userId, 'beat_partner', myBadges))
    }
    
    // 雙方都達標
    if (myIntake >= myGoal && partnerIntake >= partnerGoal) {
      checks.push(checkAndAwardBadge(userId, 'pair_champion', myBadges))
    }
  }
  
  await Promise.all(checks)
  
  // 檢查需要歷史資料的勳章
  await checkStreakBadges(userId, myBadges, myGoal)
  await checkTotalVolumeBadges(userId, myBadges)
  await checkMetaBadges(userId, myBadges)
}

// ========================================
// 🔥 連續天數檢查
// ========================================

export async function checkStreakBadges(userId, myBadges, myGoal) {
  // 獲取最近 400 天的歷史（足夠檢查365天連續）
  const { data } = await supabase.rpc('get_pair_history', {
    p_user_id: userId,
    p_days: 400
  })
  
  if (!data || !data.length) return
  
  // 計算連續天數
  let currentStreak = 0
  let previousStreak = 0
  let inCurrentStreak = true
  let maxPreviousStreak = 0
  
  for (let i = data.length - 1; i >= 0; i--) {
    const dayTotal = data[i].my_total
    
    if (dayTotal >= myGoal) {
      if (inCurrentStreak) {
        currentStreak++
      } else {
        previousStreak++
        maxPreviousStreak = Math.max(maxPreviousStreak, previousStreak)
      }
    } else {
      if (inCurrentStreak) {
        inCurrentStreak = false
        previousStreak = 0
      } else {
        maxPreviousStreak = Math.max(maxPreviousStreak, previousStreak)
        break
      }
    }
  }
  
  const checks = []
  
  // 正面連續成就
  if (currentStreak >= 3) checks.push(checkAndAwardBadge(userId, 'streak_3', myBadges))
  if (currentStreak >= 7) checks.push(checkAndAwardBadge(userId, 'streak_7', myBadges))
  if (currentStreak >= 14) checks.push(checkAndAwardBadge(userId, 'streak_14', myBadges))
  if (currentStreak >= 30) checks.push(checkAndAwardBadge(userId, 'streak_30', myBadges))
  if (currentStreak >= 50) checks.push(checkAndAwardBadge(userId, 'streak_50', myBadges))
  if (currentStreak >= 100) checks.push(checkAndAwardBadge(userId, 'streak_100', myBadges))
  if (currentStreak >= 365) checks.push(checkAndAwardBadge(userId, 'streak_365', myBadges))
  
  // 負面：中斷長連勝
  if (maxPreviousStreak >= 30 && currentStreak === 0) {
    checks.push(checkAndAwardBadge(userId, 'streak_killer', myBadges))
  }
  
  // 王者歸來
  if (maxPreviousStreak > 0 && currentStreak >= 7) {
    checks.push(checkAndAwardBadge(userId, 'comeback_king', myBadges))
  }
  
  // 穩定輸出：連續7天都在目標±20%
  const last7 = data.slice(-7)
  if (last7.length === 7) {
    const allConsistent = last7.every(d => {
      const diff = Math.abs(d.my_total - myGoal)
      return diff <= myGoal * 0.2
    })
    if (allConsistent) {
      checks.push(checkAndAwardBadge(userId, 'consistent', myBadges))
    }
  }
  
  // 超越自我：連續7天都超過目標20%
  if (last7.length === 7) {
    const allOverachieve = last7.every(d => d.my_total >= myGoal * 1.2)
    if (allOverachieve) {
      checks.push(checkAndAwardBadge(userId, 'overachiever', myBadges))
    }
  }
  
  // 負面：懶惰一週
  if (last7.length === 7 && last7.every(d => d.my_total < myGoal)) {
    checks.push(checkAndAwardBadge(userId, 'lazy_week', myBadges))
  }
  
  await Promise.all(checks)
}

// ========================================
// 💧 總累計水量檢查
// ========================================

export async function checkTotalVolumeBadges(userId, myBadges) {
  const { data } = await supabase
    .from('intake_logs')
    .select('amount_ml')
    .eq('user_id', userId)
  
  if (!data) return
  
  const totalMl = data.reduce((sum, log) => sum + log.amount_ml, 0)
  const totalL = totalMl / 1000
  
  const checks = []
  
  if (totalL >= 10) checks.push(checkAndAwardBadge(userId, 'total_10l', myBadges))
  if (totalL >= 50) checks.push(checkAndAwardBadge(userId, 'total_50l', myBadges))
  if (totalL >= 100) checks.push(checkAndAwardBadge(userId, 'total_100l', myBadges))
  if (totalL >= 500) checks.push(checkAndAwardBadge(userId, 'total_500l', myBadges))
  if (totalL >= 1000) checks.push(checkAndAwardBadge(userId, 'total_1000l', myBadges))
  
  await Promise.all(checks)
}

// ========================================
// 👥 配對相關檢查
// ========================================

export async function checkPairBadges(userId, myBadges, pairData) {
  const { isFirstPair, historyData, myGoal, partnerGoal } = pairData
  const checks = []
  
  // 首次配對
  if (isFirstPair) {
    checks.push(checkAndAwardBadge(userId, 'first_pair', myBadges))
  }
  
  // 同步一週：連續7天都達標
  const last7 = historyData.slice(-7)
  if (last7.length === 7) {
    const allBothAchieved = last7.every(d => 
      d.my_total >= myGoal && d.partner_total >= partnerGoal
    )
    if (allBothAchieved) {
      checks.push(checkAndAwardBadge(userId, 'sync_week', myBadges))
    }
  }
  
  // 負面：連續7天輸給隊友
  if (last7.length === 7) {
    const allLostToPartner = last7.every(d => d.my_total < d.partner_total)
    if (allLostToPartner) {
      checks.push(checkAndAwardBadge(userId, 'partner_loser', myBadges))
    }
  }
  
  // 團隊水力：總共50公升
  const { data: myLogs } = await supabase
    .from('intake_logs')
    .select('amount_ml')
    .eq('user_id', userId)
  
  if (myLogs && pairData.partnerId) {
    const { data: partnerLogs } = await supabase
      .from('intake_logs')
      .select('amount_ml')
      .eq('user_id', pairData.partnerId)
    
    if (partnerLogs) {
      const myTotal = myLogs.reduce((s, l) => s + l.amount_ml, 0)
      const partnerTotal = partnerLogs.reduce((s, l) => s + l.amount_ml, 0)
      const combinedL = (myTotal + partnerTotal) / 1000
      
      if (combinedL >= 50) {
        checks.push(checkAndAwardBadge(userId, 'team_hydration', myBadges))
      }
    }
  }
  
  await Promise.all(checks)
}

// ========================================
// 📅 每日檢查 (建議在每天結束時或開啟APP時調用)
// ========================================

export async function checkDailyBadges(userId, myBadges, dailyData) {
  const { intakeToday, goal, hour } = dailyData
  const checks = []
  
  // 只在接近一天結束時檢查
  if (hour >= 22) {
    // 沙漠跳鼠
    if (intakeToday === 0) {
      checks.push(checkAndAwardBadge(userId, 'zero_day', myBadges))
    }
    
    // 極少努力
    if (intakeToday > 0 && intakeToday < 500) {
      checks.push(checkAndAwardBadge(userId, 'barely_trying', myBadges))
    }
    
    // 脫水了
    if (intakeToday < goal * 0.3) {
      checks.push(checkAndAwardBadge(userId, 'dehydrated', myBadges))
    }
  }
  
  // 完美一天：每小時都有記錄
  const perfectDay = await checkPerfectDay(userId)
  if (perfectDay) {
    checks.push(checkAndAwardBadge(userId, 'perfect_day', myBadges))
  }
  
  await Promise.all(checks)
}

// ========================================
// 🎉 特殊節日檢查
// ========================================

export async function checkHolidayBadges(userId, myBadges, holidayData) {
  const { intakeToday, goal, hasPartner, partnerIntake, partnerGoal } = holidayData
  
  if (intakeToday < goal) return
  
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const checks = []
  
  // 元旦
  if (month === 1 && day === 1) {
    checks.push(checkAndAwardBadge(userId, 'new_year', myBadges))
  }
  
  // 情人節
  if (month === 2 && day === 14 && hasPartner && partnerIntake >= partnerGoal) {
    checks.push(checkAndAwardBadge(userId, 'valentine', myBadges))
  }
  
  // 季節連續
  if (month >= 6 && month <= 8) {
    const summerStreak = await checkSeasonStreak(userId, goal, 6, 8)
    if (summerStreak >= 7) {
      checks.push(checkAndAwardBadge(userId, 'summer_hydration', myBadges))
    }
  }
  
  if (month === 12 || month <= 2) {
    const winterStreak = await checkSeasonStreak(userId, goal, 12, 2)
    if (winterStreak >= 7) {
      checks.push(checkAndAwardBadge(userId, 'winter_warrior', myBadges))
    }
  }
  
  await Promise.all(checks)
}

// ========================================
// 🏅 使用時長檢查
// ========================================

export async function checkUsageBadges(userId, myBadges) {
  const { data } = await supabase
    .from('intake_logs')
    .select('logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: true })
    .limit(1)
  
  if (!data || !data.length) return
  
  const firstUse = new Date(data[0].logged_at)
  const daysSince = Math.floor((Date.now() - firstUse) / (1000 * 60 * 60 * 24))
  
  const checks = []
  
  if (daysSince >= 7) checks.push(checkAndAwardBadge(userId, 'week_warrior', myBadges))
  if (daysSince >= 30) checks.push(checkAndAwardBadge(userId, 'month_master', myBadges))
  if (daysSince >= 100) checks.push(checkAndAwardBadge(userId, 'hundred_days', myBadges))
  
  await Promise.all(checks)
}

// ========================================
// 🏆 元勳章檢查
// ========================================

export async function checkMetaBadges(userId, myBadges) {
  const count = myBadges.length
  const checks = []
  
  if (count >= 10) checks.push(checkAndAwardBadge(userId, 'badge_collector', myBadges))
  if (count >= 25) checks.push(checkAndAwardBadge(userId, 'badge_master', myBadges))
  if (count >= 40) checks.push(checkAndAwardBadge(userId, 'badge_legend', myBadges))
  
  // 全成就（需要動態計算總數）
  // 假設有 60 個勳章
  if (count >= 58) {  // 留2個餘地因為有些互斥
    checks.push(checkAndAwardBadge(userId, 'completionist', myBadges))
  }
  
  await Promise.all(checks)
}

// ========================================
// 🛠️ 輔助函數
// ========================================

async function getTimePeriodTotal(userId, startHour, endHour) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data } = await supabase
    .from('intake_logs')
    .select('amount_ml, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', today.toISOString())
  
  if (!data) return 0
  
  return data
    .filter(log => {
      const hour = new Date(log.logged_at).getHours()
      return hour >= startHour && hour < endHour
    })
    .reduce((sum, log) => sum + log.amount_ml, 0)
}

async function checkPerfectDay(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data } = await supabase
    .from('intake_logs')
    .select('logged_at')
    .eq('user_id', userId)
    .gte('logged_at', today.toISOString())
  
  if (!data || data.length === 0) return false
  
  // 檢查是否至少有 12 個不同的小時有記錄
  const hours = new Set(data.map(log => new Date(log.logged_at).getHours()))
  return hours.size >= 12
}

async function checkSeasonStreak(userId, goal, startMonth, endMonth) {
  const { data } = await supabase.rpc('get_pair_history', {
    p_user_id: userId,
    p_days: 90
  })
  
  if (!data) return 0
  
  // 過濾出季節內的資料
  const seasonData = data.filter(d => {
    const month = new Date(d.log_date).getMonth() + 1
    if (startMonth <= endMonth) {
      return month >= startMonth && month <= endMonth
    } else {
      // 跨年（冬天）
      return month >= startMonth || month <= endMonth
    }
  })
  
  // 計算連續天數
  let streak = 0
  for (let i = seasonData.length - 1; i >= 0; i--) {
    if (seasonData[i].my_total >= goal) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}
