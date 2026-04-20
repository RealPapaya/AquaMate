# 🔧 故障排除指南

## 問題：按下「喝了 XXml」後圓圈沒有動靜

### 可能原因與解決方法

#### 1. ⚠️ Supabase 未設定（最常見）

**症狀：**
- 按下按鈕後沒有反應
- 開發工具顯示「❌ 未設定」
- 控制台顯示連線錯誤

**解決方法：**

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 建立或選擇專案
3. 複製以下資訊：
   - Project URL (Settings → API)
   - anon public key (Settings → API)

4. 編輯 `.env.local` 檔案：
   ```env
   VITE_SUPABASE_URL=https://你的專案id.supabase.co
   VITE_SUPABASE_ANON_KEY=你的-anon-key
   ```

5. **重啟開發伺服器**（重要！）：
   ```bash
   # 按 Ctrl+C 停止
   npm run dev
   ```

---

#### 2. 📊 資料庫 Schema 未執行

**症狀：**
- Supabase 已設定但仍無法記錄
- 控制台顯示 SQL 錯誤

**解決方法：**

1. 前往 Supabase Dashboard → **SQL Editor**
2. 開啟 `src/SCHEMA.sql` 檔案
3. 複製全部內容並貼到 SQL Editor
4. 點擊 **Run** 執行
5. 確認所有表格已建立（Database → Tables）

---

#### 3. 🔌 Realtime 未啟用

**症狀：**
- 可以記錄但隊友的資料不會即時更新

**解決方法：**

1. 前往 Supabase Dashboard → **Database → Replication**
2. 啟用以下表格的 Realtime：
   - ✅ `intake_logs`
   - ✅ `nudges`
   - ✅ `users`

---

#### 4. 🔐 Anonymous 認證未啟用

**症狀：**
- 無法自動登入
- 持續顯示載入畫面

**解決方法：**

1. 前往 Supabase Dashboard → **Authentication → Providers**
2. 找到 **Anonymous** 選項
3. 啟用 Anonymous Sign-ins

---

## 🛠️ 使用開發工具除錯

本專案內建開發工具面板，可以快速檢查狀態：

1. 啟動開發伺服器後，畫面右下角會出現紫色的 🛠️ 按鈕
2. 點擊按鈕開啟除錯面板
3. 檢查以下資訊：
   - ✅ Supabase 連線狀態
   - 👤 用戶資訊
   - 💧 當前攝水量
   - 🔗 配對狀態

4. 使用「測試加水 +100ml」按鈕快速測試

---

## 📝 控制台檢查

開啟瀏覽器開發者工具（F12），查看控制台訊息：

### 正常啟動應該看到：
```
🔧 Initializing app...
🔐 No session, signing in anonymously...
✅ Signed in as: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✅ App initialized
```

### 如果看到錯誤訊息：

**❌ Failed to sign in:**
→ 檢查 `.env.local` 是否正確設定

**❌ relation "intake_logs" does not exist**
→ 執行 `src/SCHEMA.sql`

**❌ JWT expired**
→ 清除瀏覽器儲存空間後重新載入

---

## 🧪 測試波浪動畫

如果只想測試波浪動畫（不需要 Supabase）：

1. 暫時修改 `src/screens/Home.jsx`
2. 在 `handleAdd` 函數中添加本地狀態更新：
   ```javascript
   const handleAdd = async (ml) => {
     setLastAdded(ml)
     // 臨時：直接更新本地狀態測試
     const store = useStore.getState()
     store.set({ myIntakeToday: store.myIntakeToday + ml })
     await addIntake(ml)
     setShowUndo(true)
     setTimeout(() => setShowUndo(false), 8000)
   }
   ```

---

## 💡 其他檢查項目

### 確認環境變數已載入
在 `src/lib/supabase.js` 加入：
```javascript
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
```

### 清除瀏覽器快取
1. 開啟開發者工具（F12）
2. Application → Storage → Clear site data
3. 重新載入頁面

### 檢查網路請求
1. 開啟開發者工具（F12）
2. Network 分頁
3. 點擊「喝了 XXml」按鈕
4. 查看是否有 POST 請求到 Supabase

---

## ✅ 確認修復成功

修復後應該能看到：

1. ✅ 點擊「喝了 XXml」按鈕
2. ✅ 波浪圓圈平滑上升
3. ✅ 百分比和毫升數字更新
4. ✅ 控制台顯示「Adding intake: XXX Current: YYY」
5. ✅ 控制台顯示「New total: ZZZ」
6. ✅ 出現「已記錄 XXml」撤銷提示

---

## 🆘 還是無法解決？

1. 檢查本專案的 [GitHub Issues](https://github.com/your-repo/issues)
2. 提供以下資訊：
   - 控制台完整錯誤訊息
   - 開發工具截圖
   - 瀏覽器版本
   - 作業系統

---

**祝你順利解決問題！💧**
