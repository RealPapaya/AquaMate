# 💧 水伴 AquaMate

> 雙人連線喝水追蹤 PWA — 和另一半一起養成喝水習慣

---

## 📁 專案結構

```
aquamate/
├── public/
│   ├── favicon.svg              # App 圖示（瀏覽器 tab）
│   ├── icon.svg                 # PWA 圖示（統一 SVG 格式）
│   └── manifest.json            # PWA 設定（加入主畫面）
│
├── src/
│   ├── main.jsx                 # React 入口點
│   ├── App.jsx                  # 根組件、路由、Splash 畫面
│   ├── index.css                # Tailwind + 全域樣式
│   │
│   ├── components/
│   │   ├── SimpleWave.jsx       # SVG 動態水位波浪圓
│   │   ├── WaterSlider.jsx      # 攝水量滑桿 + 快捷按鈕
│   │   ├── BadgeCard.jsx        # 成就勳章卡片（含鎖定狀態）
│   │   ├── BottomNav.jsx        # 底部導覽列
│   │   ├── SetupGuide.jsx       # 開發除錯面板
│   │   └── icons/               # SVG 圖標組件（導航、勳章等）
│   │
│   ├── screens/
│   │   ├── Home.jsx             # 主畫面（今日水量 + 隊友）
│   │   ├── Stats.jsx            # 統計畫面（圖表 + 排行榜）
│   │   ├── Profile.jsx          # 個人檔案（配對 + 勳章）
│   │   └── Login.jsx            # 登入頁面（Email Magic Link + Google OAuth）
│   │
│   ├── store/
│   │   └── useStore.js          # Zustand 全域狀態 + Supabase 操作
│   │
│   └── lib/
│       ├── supabase.js          # Supabase client + 工具函數
│       └── badgeManager.js      # 勳章管理器（60 個勳章觸發邏輯）
│
├── .env.local                   # ⚠️ 環境變數（不可上傳 Git）
├── vite.config.js               # Vite + PWA 設定
├── tailwind.config.js           # Tailwind 自訂顏色、動畫
├── postcss.config.js            # PostCSS（Tailwind 需要）
├── package.json                 # 依賴套件
├── BADGES_50.js                 # 60 個勳章定義
└── SCHEMA.sql                   # Supabase 資料庫 Schema
```

---

## 🚀 快速開始

### 第一步：設定 Supabase

1. 前往 [supabase.com](https://supabase.com) 建立免費帳號與新專案
2. 進入 **SQL Editor**，貼上 `SCHEMA.sql` 的內容並執行
3. 前往 **Settings → API**，複製：
   - `Project URL`
   - `anon public` key

### 第二步：設定環境變數

編輯 `.env.local`，填入你的 Supabase 資訊：

```env
VITE_SUPABASE_URL=https://你的專案id.supabase.co
VITE_SUPABASE_ANON_KEY=你的-anon-key
```

### 第三步：安裝並啟動

```bash
npm install
npm run dev
```

打開瀏覽器前往 `http://localhost:5173`

---

## 🎯 核心功能

### ✨ 完整功能列表

**個人追蹤**
- ✅ 每日喝水記錄（滑桿 + 快捷按鈕）
- ✅ 波浪動畫進度顯示
- ✅ 8 秒內撤銷功能
- ✅ 30 天歷史統計圖表
- ✅ 每日小時統計
- ✅ 60 種成就勳章系統

**雙人功能**
- ✅ 邀請連結配對系統
- ✅ 即時同步水量記錄
- ✅ 提醒隊友功能（震動 + 通知）
- ✅ 雙人 VS 比較
- ✅ 配對即時通知
- ✅ 解除配對功能

**認證系統**
- ✅ Email Magic Link 登入（無需密碼）
- ✅ Google OAuth 登入
- ✅ Session 持久化（重整不登出）
- ✅ 跨裝置同步

**PWA 功能**
- ✅ 離線支持
- ✅ 可安裝到手機主畫面
- ✅ SVG 向量圖標（任何尺寸都清晰）
- ✅ 快速載入與快取

## 🏆 60 種勳章成就系統

### 勳章分類

**新手成就** (8 個)
- 🎯 第一次喝水、第一次達標、第一次配對等

**連續達標** (7 個)
- 🔥 3/7/14/30/50/100/365 天連續達標

**水量里程碑** (10 個)
- 💧 單日水量、總累計水量（10L - 1000L）

**時間相關** (6 個)
- ⏰ 早起鳥、午餐冠軍、午後提神、夜貓子等

**雙人成就** (8 個)
- 👥 比隊友先達標、雙方達標、同步一週等

**特殊成就** (11 個)
- ⭐ 完美一天、穩定輸出、超越自我等

**節日成就** (4 個)
- 🎉 元旦、情人節、夏日水力、冬日戰士

**負面警示** (10 個)
- ⚠️ 沙漠跳鼠、拖延症、中斷連勝等

**元勳章** (4 個)
- 🏅 勳章收藏家、大師、傳奇、全成就

詳細勳章觸發條件請參考 `BADGES_50.js` 和 `BADGE_TRIGGERS.md`。

## 🖼️ PWA 圖示說明

本專案已改用 **SVG 格式**統一所有圖示，無需額外產生 PNG 檔案：

- `public/favicon.svg` - 瀏覽器分頁圖示
- `public/icon.svg` - PWA 應用程式圖示（支援所有尺寸）

✅ SVG 格式優勢：
- 向量圖形，任何尺寸都清晰
- 檔案小，載入快
- 無需產生多個尺寸
- 方便編輯和客製化

---

## 🔐 登入系統

### 支援的登入方式

**1. Email Magic Link（推薦）**
- 輸入 Email 後收取登入連結
- 無需記住密碼
- 點擊信箱內連結即可登入

**2. Google OAuth**
- 一鍵使用 Google 帳號登入
- 快速方便

**特色**
- ✅ 重新整理頁面不會登出
- ✅ 跨裝置同步（手機 + 電腦）
- ✅ 資料雲端儲存
- ✅ 個人頁面顯示帳號資訊

⚠️ **注意：不再支援匿名登入！**

## 📱 如何配對（雙人使用）

1. **A 方**：前往「個人」頁面 → 點「建立邀請連結」→ 複製連結
2. **B 方**：點開連結（或貼上連結後點「加入」）
3. **雙方都會收到配對成功通知** ✨
4. 配對完成後，主畫面下方會出現隊友的即時進度 🎉

**配對管理**
- 配對後資料持續同步
- 可在個人頁面查看配對狀態
- 如需解除配對，點「解除配對」按鈕（需二次確認）

> 配對資料會即時同步，之後每次打開 App 都會自動看到對方資料。

---

## 🏗️ 部署（上線給手機用）

### 推薦：Vercel（最簡單）

```bash
npm run build
npx vercel deploy dist/
```

或連接 GitHub repo，Vercel 會自動部署。

記得在 Vercel 的 **Environment Variables** 加入：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 也可以用 Netlify

```bash
npm run build
# 把 dist/ 資料夾拖曳到 netlify.com/drop
```

---

## ⚙️ Supabase 額外設定

### 開啟 Realtime（即時同步必要）

前往 Supabase Dashboard → **Database → Replication**，確認以下表格已開啟 Realtime：
- ✅ `pairs` - **配對通知必需**
- ✅ `intake_logs` - 喝水記錄同步
- ✅ `nudges` - 提醒功能
- ✅ `users` - 用戶資料同步

### 認證設定

前往 **Authentication → Providers**，確認以下設定：

**Email Provider**
- ✅ 已啟用 Email Magic Link
- 設定 Site URL: `http://localhost:5173`（開發）或你的部署網址
- 設定 Redirect URLs: 包含你的網域

**Google Provider**
- ✅ 已設定 Google OAuth（需要 Client ID 和 Secret）
- 參考：https://supabase.com/docs/guides/auth/social-login/auth-google

**⚠️ Anonymous Provider**
- ❌ 已停用（不再支援匿名登入）

---

## 🛠️ 技術棧

| 技術 | 用途 |
|------|------|
| React 18 + Vite | 前端框架與建構工具 |
| Tailwind CSS | 樣式 |
| Framer Motion | 動畫（波浪、頁面切換、勳章） |
| Zustand | 全域狀態管理 |
| Supabase | 資料庫、認證、即時訂閱 |
| Recharts | 統計圖表 |
| vite-plugin-pwa | PWA / Service Worker |

---

## 🔧 常見問題

**Q: 打開後一直轉圈圈？**
→ 檢查 `.env.local` 的 Supabase URL 和 Key 是否正確。

**Q: 重新整理後變成未登入狀態？**
→ 確認已使用 Email 或 Google 登入（不支援匿名）。檢查瀏覽器 Console 是否有錯誤。

**Q: 隊友的資料沒有即時更新？**
→ 確認 Supabase Realtime 已為 `pairs`、`intake_logs`、`nudges`、`users` 開啟。

**Q: 配對後沒收到通知？**
→ 確認 `pairs` 表的 Replication 已啟用。檢查 Console 是否有 "💑 Someone paired with me!" 日誌。

**Q: 波浪圓圈下半部是黑色的？**
→ 重新整理瀏覽器，波浪動畫已修復。

**Q: PWA 無法「加入主畫面」？**
→ 確認 `public/icon.svg` 存在，且網站是 HTTPS（部署後才支援）。現已使用 SVG 格式，無需 PNG 檔案。

**Q: 配對連結點了沒反應？**
→ 確認 Supabase SQL Editor 有執行 `SCHEMA.sql`，特別是 `invite_links` 表格。

**Q: 勳章沒有自動解鎖？**
→ 部分勳章需要特定條件或時間觸發。檢查 `BADGE_TRIGGERS.md` 了解觸發邏輯。某些勳章需要資料庫 Migration（參考 `SCHEMA_UPDATE_BADGES.sql`）。

**Q: 控制台出現 406 錯誤？**
→ 這是 Supabase API preferences 的正常警告，不影響功能，可忽略。
