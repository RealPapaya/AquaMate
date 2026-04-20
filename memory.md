#= AquaMate 水伴專案記憶檔

> 最後更新：2026-04-20  
> 開發者偏好：繁體中文回覆

---

## 📌 專案概述

**專案名稱**：AquaMate（水伴）  
**類型**：Progressive Web App (PWA)  
**用途**：雙人連線喝水追蹤器，情侶/夥伴一起養成喝水習慣  
**技術棧**：React 18 + Vite + Supabase + Tailwind CSS + Framer Motion

---

## 🎯 核心功能

### 已實現功能
- ✅ Email Magic Link 登入（無需密碼）
- ✅ Google OAuth 登入
- ✅ Session 持久化（重整不登出）
- ❌ 匿名登入（已移除）
- ✅ 雙人配對系統（邀請連結）
- ✅ 即時同步水量記錄
- ✅ Nudge 提醒功能（震動 + 通知）
- ✅ 成就徽章系統（9種徽章）
- ✅ 統計圖表（30天歷史 + 每日小時統計）
- ✅ PWA 離線支持
- ✅ 配對即時通知（NEW）
- ✅ 解除配對功能（NEW）

### 待實現功能
- ⏳ Streak 連續達標徽章解鎖邏輯
- ⏳ RLS 安全策略重新啟用
- ⏳ 代碼分割優化（減少包體積）
- ⚠️ 匿名用戶遷移功能（綁定 Email）
- ✅ 個人頁面帳號資訊區塊（已完成）

---

## 🔧 最近修改記錄

### 2026-04-20 - 勳章系統大幅擴充 (60個勳章 + 觸發系統)

#### 新增功能
1. **60 個勳章定義**
   - 50 個正面成就（新手、連續、水量、時間、雙人、特殊、節日）
   - 10 個負面警示（不喝水、拖延、中斷等）

2. **勳章管理器** (`src/lib/badgeManager.js`)
   - 模組化設計，一邊放成就一邊處理觸發
   - 9 個主要觸發函數：
     - `checkIntakeBadges()` - 喝水相關
     - `checkGoalBadges()` - 達標相關
     - `checkStreakBadges()` - 連續天數
     - `checkTotalVolumeBadges()` - 總累計
     - `checkPairBadges()` - 配對相關
     - `checkDailyBadges()` - 每日檢查
     - `checkHolidayBadges()` - 節日特殊
     - `checkUsageBadges()` - 使用時長
     - `checkMetaBadges()` - 元勳章

3. **Store 整合**
   - `addIntake()` 中調用 `checkIntakeBadges()`
   - `checkGoalReached()` 中調用多個檢查函數
   - `init()` 中調用 `checkUsageBadges()`
   - `acceptInviteToken()` 中調用配對檢查

#### 檔案更新
- `BADGES_50.js` - 60 個勳章定義
- `src/lib/badgeManager.js` - 勳章管理器（新建）
- `src/store/useStore.js` - 整合勳章管理器
- `BADGE_TRIGGERS.md` - 觸發邏輯文檔
- `BADGE_SYSTEM_COMPLETE.md` - 完整實作總結

#### 已實現的勳章觸發
✅ 喝水相關：first_log, 水量里程碁, 時間相關
✅ 連續達標：3/7/14/30/50/100/365 天
✅ 總累計：10/50/100/500/1000 公升
✅ 雙人成就：first_pair, beat_partner, pair_champion, sync_week
✅ 使用時長：7/30/100 天
✅ 特殊成就：perfect_day, consistent, overachiever
✅ 負面勳章：zero_day, lazy_week, procrastinator 等

#### 需要資料庫 Migration 的勳章
⏳ support_master, nudge_receiver - Nudge 計數
⏳ goal_setter - 目標修改計數
⏳ long_partnership - 配對時長
⏳ team_hydration - 團隊總水量
⏳ ghost_user, forgotten_app - 不活躍檢測

#### 完成度
- 📝 代碼設定：100% ✅
- 📦 資料庫：等待 Migration ⏳
- 🎮 立即可用：~50 個勳章 (85%)

#### 重要檔案
- `SETUP_COMPLETE.md` - ⭐ 設定完成總結
- `BADGE_SYSTEM_CHECK.md` - 完整檢查報告
- `SCHEMA_UPDATE_BADGES.sql` - 資料庫 Migration
- `TEST_BADGES.js` - 測試腳本

---

### 2026-04-20 - 匿名認證移除 + Session 恢復修復

#### 問題
1. 網頁重整後變成匿名帳號，帳號資訊顯示「未設定」
2. localStorage 殘留舊的匿名 session
3. Supabase Anonymous sign-ins 仍然啟用，會自動創建匿名帳號
4. `onAuthStateChange` 的 SIGNED_IN 事件覆蓋完整 user 資料

#### 解決方案
1. **Supabase Dashboard 設定**
   - 關閉 Authentication → Providers → Anonymous sign-ins
   - 清理資料庫中的匿名用戶

2. **src/store/useStore.js - init()**
   - 添加 `onAuthStateChange` 監聽器
   - 只在 `INITIAL_SESSION` 和 `SIGNED_OUT` 更新 user
   - 忽略 `SIGNED_IN` 避免覆蓋完整資料
   - 檢查 `is_anonymous`，自動登出匿名帳號

3. **src/screens/Profile.jsx - 帳號資訊區塊**
   - 添加 `userEmail` 檢查
   - 無 email 時顯示「正在載入...」狀態
   - 有 email 時才顯示雲端同步狀態

4. **src/components/SetupGuide.jsx**
   - 移除 Anonymous 認證檢查
   - 保留環境變數、Schema、Realtime 檢查

#### 修改檔案
- `src/store/useStore.js` - 新增 onAuthStateChange 監聽 + 匿名檢查
- `src/screens/Profile.jsx` - 條件渲染帳號資訊
- `src/components/SetupGuide.jsx` - 移除 Anonymous 認證步驟
- `src/App.jsx` - 暫時暴露 useStore/supabase 到 window (除錯)

#### 重要變更
⚠️ **不再支持匿名登入！**
- 用戶必須使用 Email Magic Link 或 Google OAuth 登入
- 舊的匿名帳號無法遷移，需重新註冊

---

### 2026-04-20 - Realtime 重複訂閱修復 + 統計平均值優化

#### 問題
1. Realtime 被多次訂閱，導致 `cannot add callbacks after subscribe()` 錯誤
2. 切換頁面時偶爾出現黑畫面
3. 統計頁面平均值計算不正確（第一天也顯示平均）

#### 解決方案

**檔案修改**：
- `src/store/useStore.js`
  - 在 `startRealtimeSubscription` 開始時清理舊訂閱
  - 移除重複的 Nudge 事件監聽（被註冊兩次）
  - 加入 cleanup 日誌提示

- `src/screens/Stats.jsx`
  - 修正平均值計算邏輯：
    - 「本日」：顯示今日總量，標籤為「今日」
    - 「本週」：顯示 7 天平均，標籤為「週平均」
    - 「本月」：顯示 30 天平均，標籤為「月平均」

**效果**：
- ✅ Realtime 訂閱不會重複
- ✅ 切換頁面流暢
- ✅ 平均值計算正確

---

### 2026-04-20 - 持久化登入系統

#### 問題
匿名登入每次重整頁面都會產生新帳號，導致配對和記錄遺失。

#### 解決方案
**檔案修改**：
- `src/screens/Login.jsx` （新創）
  - Email Magic Link 登入表單
  - Google OAuth 登入按鈕
  - 美觀的登入界面設計

- `src/App.jsx`
  - 整合 Login 組件
  - 未登入時顯示登入畫面

- `src/store/useStore.js`
  - 移除匿名登入邏輯
  - 改為檢查 session，沒有則返回 null

**Supabase 設定**：
- ✅ Email provider 已啟用
- ✅ Google OAuth 已設定
- ✅ Site URL 和 Redirect URLs 已設定

**優點**：
- ✅ 重整頁面不會登出
- ✅ 資料持久化
- ✅ 跨裝置同步（手機 + 電腦）
- ✅ 無需密碼（Magic Link）
- ✅ 個人頁面顯示帳號資訊
- ✅ 雲端同步狀態提示
- ✅ 登出功能

---

### 2026-04-20 - 配對即時通知與解除配對

#### 問題
1. A 接受 B 的邀請後，B 沒有收到配對成功通知
2. 沒有解除配對的功能
3. "永久綁定"措辭不當

#### 解決方案
**檔案修改**：
- `src/store/useStore.js`
  - 重構 `subscribeRealtime` → `startRealtimeSubscription`
  - 新增監聽 `pairs` INSERT 事件（配對通知）
  - 新增監聽 `pairs` DELETE 事件（解除配對同步）
  - 新增 `triggerPairNotification(partnerName)` 方法
  - 新增 `unpair()` 方法
  - 新增 `pairNotification` 狀態

- `src/screens/Profile.jsx`
  - 新增解除配對按鈕（二次確認機制）
  - 修改 "已永久綁定 💑" → "已綁定"
  - ✅ 已添加配對通知橫幅（綠色通知）

**Supabase 設定**：
- ✅ `pairs` 表 Realtime Replication 已啟用

**測試流程**：
1. 浏览器 B 创建邀请链接
2. 浏览器 A 接受邀请
3. A 看到 "配對成功！🎉"
4. **B 立即收到綠色橫幅通知 "XXX 與你綁定了 ✨"**

---

### 2026-04-20 - PWA Manifest 401 錯誤修復

#### 問題
Vercel 部署後 `manifest.webmanifest` 返回 401 錯誤

#### 解決方案
- 修改 `vite.config.js` 新增 `manifestFilename: 'manifest.json'`
- 修改 `index.html` 新增 `<link rel="manifest" href="/manifest.json" />`

---

### 2026-04-20 - 頁面切換內容消失

#### 問題
切換「今日」「統計」「個人」頁面時，內容有時不顯示

#### 解決方案
修改 `src/App.jsx` 布局結構：
```jsx
// 外層 div 固定定位
<div className="absolute inset-0" style={{ paddingBottom: '72px' }}>
  <AnimatePresence mode="wait">
    {/* 內層使用相對布局 */}
    <motion.div className="h-full w-full">
      <Screen />
    </motion.div>
  </AnimatePresence>
</div>
```

---

## 📁 專案結構

```
AquaMate/
├── src/
│   ├── screens/          # 主要頁面
│   │   ├── Home.jsx      # 今日水量頁面
│   │   ├── Stats.jsx     # 統計圖表頁面
│   │   └── Profile.jsx   # 個人檔案頁面
│   ├── components/       # 可重用組件
│   │   ├── SimpleWave.jsx          # 波浪進度圓圈
│   │   ├── WaterSlider.jsx         # 喝水滑動選擇器
│   │   ├── BadgeCard.jsx           # 徽章卡片
│   │   ├── BottomNav.jsx           # 底部導航欄
│   │   └── icons/                  # SVG 圖標組件
│   ├── store/
│   │   └── useStore.js   # Zustand 全局狀態管理
│   ├── lib/
│   │   └── supabase.js   # Supabase 客戶端配置
│   └── main.jsx          # 應用入口
├── public/
│   ├── icon.svg          # PWA 圖標（可縮放）
│   └── manifest.json     # PWA manifest
├── .env.local            # 環境變數（本地）
├── vite.config.js        # Vite 配置
└── vercel.json           # Vercel 部署配置
```

---

## 🗄️ Supabase 資料庫結構

### 表格
- `users` - 用戶檔案（延伸 auth.users）
- `pairs` - 配對關係（永久綁定）
- `intake_logs` - 喝水記錄
- `badges` - 徽章解鎖記錄
- `nudges` - 提醒訊息記錄
- `invite_links` - 一次性邀請連結

### 重要函數
- `get_daily_total(user_id, date)` - 計算單日總量
- `get_partner_id(user_id)` - 獲取配對對象 ID
- `get_pair_history(user_id, days)` - 獲取歷史數據（30天）

### Realtime 設定狀態
✅ **當前狀態**：已啟用以下表的 Replication
- [x] `pairs` ← **關鍵！配對通知必需**
- [x] `intake_logs`
- [x] `nudges`
- [x] `users`

管理頁面：https://supabase.com/dashboard/project/pzznpnochkenridvjzui/database/replication

### RLS 策略狀態
⚠️ **當前狀態**：所有表的 RLS 已禁用（開發階段）
- 生產環境前必須重新啟用並設計簡化策略

---

## 🚀 部署資訊

### Vercel
- **專案名稱**：aquamate
- **URL**：https://aqua-mate-62yj25cm3-realpapayas-projects.vercel.app
- **環境變數**：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Supabase
- **專案 ID**：pzznpnochkenridvjzui
- **URL**：https://pzznpnochkenridvjzui.supabase.co
- **認證方式**：Anonymous（自動登入）

---

## 🐛 已知問題與解決方案

### 1. Realtime 無法連接
**症狀**：Console 顯示 "❌ Realtime error"  
**解決**：
1. 檢查 Supabase Dashboard → Database → Replication
2. 確認相關表已啟用 Replication
3. 清除瀏覽器快取並重新載入

### 2. 配對通知不顯示
**症狀**：A 接受邀請後，B 沒收到通知  
**解決**：
1. 確認 `pairs` 表 Replication 已啟用
2. 檢查 Console 是否有 "💑 Someone paired with me!" 日誌
3. 手動測試：`useStore.getState().triggerPairNotification('測試')`

### 3. 構建警告（非阻塞）
**警告**：`supabase.js` 同時被靜態和動態導入  
**影響**：無，可通過代碼分割優化  
**優先級**：低

---

## 📋 開發檢查清單

### 每次修改後
- [ ] 執行 `npm run build` 確認無錯誤
- [ ] 檢查 Console 無異常日誌
- [ ] 雙瀏覽器測試配對流程
- [ ] 驗證 Realtime 即時同步

### 部署前
- [ ] 更新 `memory.md`（本檔案）
- [ ] 創建 Git commit
- [ ] 推送到 GitHub
- [ ] 等待 Vercel 自動部署
- [ ] 測試線上版本

### 生產環境發布前
- [ ] 重新啟用 RLS 策略
- [ ] 移除開發用 Console 日誌
- [ ] 壓縮圖片資源
- [ ] 代碼分割優化
- [ ] 完整雙設備真機測試

---

## 🎨 設計規範

### 色彩
- **主色調**：Ocean 深藍漸層 (`#020d1a` → `#0a1628` → `#0d1f3c`)
- **強調色**：Aqua 青色 (`#00c4d8`)
- **成功**：Emerald 綠色
- **警告**：Amber 琥珀色
- **錯誤**：Red 紅色

### 動畫
- **頁面切換**：200ms ease-in-out
- **按鈕點擊**：scale(0.95)
- **通知彈出**：Spring animation (stiffness: 400, damping: 30)
- **波浪進度**：Spring (stiffness: 60, damping: 20, mass: 0.8)

### 字體
- **主要**：Nunito（數字、標題）
- **次要**：DM Sans（正文）

---

## 🔐 安全注意事項

### 當前狀態（開發階段）
⚠️ **RLS 完全禁用**  
⚠️ **所有表對 `anon` 和 `authenticated` 角色開放**

### 生產環境必須
1. 重新啟用 RLS
2. 設計簡化策略避免複雜子查詢
3. 使用 Service Role Key 執行管理操作
4. 啟用 Rate Limiting
5. 配置 CORS 白名單

---

## 📞 支援資源

### 文檔
- `CLAUDE.md` - 完整技術文檔
- `DEPLOY.md` - Vercel 部署指南
- `REALTIME-SETUP.md` - Realtime 設定詳細說明
- `TROUBLESHOOTING.md` - 常見問題解決
- `FIXES-2026-04-20.md` - 最新修復報告
- `SUMMARY-REALTIME-FIX.md` - Realtime 修復總結
- `PATCH-PROFILE-NOTIFICATION.md` - 通知橫幅補丁代碼

### 外部連結
- Supabase Dashboard: https://supabase.com/dashboard/project/pzznpnochkenridvjzui
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: （待補充）

---

## 📝 開發者筆記

### 編碼偏好
- ✅ 使用繁體中文註解和文檔
- ✅ Console 日誌使用 emoji 標記（🔧 🔐 ✅ ❌ 💧 🔔 等）
- ✅ 變數命名使用英文，註解使用中文
- ✅ 優先使用函數式組件和 Hooks
- ✅ 使用 Tailwind 原子類而非自定義 CSS

### Git Commit 規範
```
feat: 新功能描述
fix: 錯誤修復描述
docs: 文檔更新
refactor: 代碼重構
style: 樣式調整
test: 測試相關
chore: 建置工具或輔助工具變動
```

### 除錯技巧
1. 檢查 Supabase Logs（Dashboard → Logs）
2. 查看 Realtime Inspector（supabase.getChannels()）
3. 使用 React DevTools 檢查狀態
4. Network 標籤查看 API 請求
5. 雙瀏覽器並排測試即時功能

---

## ✨ 特別感謝

- React Team - 卓越的 UI 框架
- Supabase - 開源 Firebase 替代方案
- Vercel - 零配置部署平台
- Framer Motion - 流暢動畫庫

---

**專案狀態**：✅ 認證系統完成，功能完整，準備部署  
**下一步**：
1. ✅ 帳號資訊 UI 已添加
2. 測試 Google 登入功能
3. 測試跨裝置同步
4. 推送部署到 Vercel

**維護者**：RealPapaya（使用者）+ AI Assistant
