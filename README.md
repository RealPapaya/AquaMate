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
│   │   ├── WaveProgress.jsx     # SVG 動態水位波浪圓
│   │   ├── WaterSlider.jsx      # 攝水量滑桿 + 快捷按鈕
│   │   ├── BadgeCard.jsx        # 成就勳章卡片（含鎖定狀態）
│   │   └── BottomNav.jsx        # 底部導覽列
│   │
│   ├── screens/
│   │   ├── Home.jsx             # 主畫面（今日水量 + 隊友）
│   │   ├── Stats.jsx            # 統計畫面（圖表 + 排行榜）
│   │   └── Profile.jsx          # 個人檔案（配對 + 勳章）
│   │
│   ├── store/
│   │   └── useStore.js          # Zustand 全域狀態 + Supabase 操作
│   │
│   └── lib/
│       └── supabase.js          # Supabase client + 工具函數
│
├── .env.local                   # ⚠️ 環境變數（不可上傳 Git）
├── vite.config.js               # Vite + PWA 設定
├── tailwind.config.js           # Tailwind 自訂顏色、動畫
├── postcss.config.js            # PostCSS（Tailwind 需要）
├── package.json                 # 依賴套件
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

## 📱 如何配對（雙人使用）

1. **A 方**：前往「個人」頁面 → 點「建立邀請連結」→ 複製連結
2. **B 方**：點開連結（或貼上連結後點「加入」）
3. 配對完成後，主畫面下方會出現隊友的即時進度 🎉

> 配對是**永久性**的，之後每次打開 App 都會自動登入並看到對方資料。

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

前往 Supabase Dashboard → **Database → Replication**，確認以下三個表格已開啟 Realtime：
- `intake_logs`
- `nudges`
- `users`

### 匿名登入（自動使用，需開啟）

前往 **Authentication → Providers → Anonymous**，確認已啟用。

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

**Q: 隊友的資料沒有即時更新？**
→ 確認 Supabase Realtime 已為 `intake_logs`、`nudges`、`users` 開啟。

**Q: 波浪圓圈下半部是黑色的？**
→ 重新整理瀏覽器，波浪動畫已修復。

**Q: PWA 無法「加入主畫面」？**
→ 確認 `public/icon.svg` 存在，且網站是 HTTPS（部署後才支援）。現已使用 SVG 格式，無需 PNG 檔案。

**Q: 配對連結點了沒反應？**
→ 確認 Supabase SQL Editor 有執行 `SCHEMA.sql`，特別是 `invite_links` 表格。
