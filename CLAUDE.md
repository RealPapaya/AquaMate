# 💧 AquaMate Project Guide

**Version:** 1.0.0  
**Last Updated:** 2026-04-20

---

## 📋 Project Overview

### Purpose
AquaMate (水伴) is a Progressive Web App (PWA) designed for couples to track their daily water intake together. The app provides real-time synchronization, gamification through badges, partner nudging, and visual progress tracking with animated wave components.

### Key Technologies
- **Frontend Framework:** React 18 with Vite
- **State Management:** Zustand (lightweight state management)
- **Styling:** Tailwind CSS with custom theme
- **Animation:** Framer Motion (for smooth transitions and effects)
- **Backend & Database:** Supabase (PostgreSQL with Realtime, Authentication, Row-Level Security)
- **Charts:** Recharts (for statistics visualization)
- **PWA:** vite-plugin-pwa (Service Worker, offline support, installable)

### Architecture
AquaMate follows a single-page application (SPA) architecture with:
- Client-side rendering using React
- Real-time data synchronization via Supabase WebSocket subscriptions
- Anonymous authentication (auto sign-in)
- Component-based UI with screen routing
- Centralized state management with Zustand store

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18+ (required for Vite and modern JavaScript features)
- **npm:** v9+ (comes with Node.js)
- **Supabase Account:** Free tier available at [supabase.com](https://supabase.com)
- **Modern Browser:** Chrome, Edge, Safari, or Firefox with PWA support

### Environment Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd AquaMate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to **SQL Editor** and run the entire `src/SCHEMA.sql` file
   - Navigate to **Settings → API** and copy:
     - Project URL
     - anon public key

4. **Create environment file:**
   Create `.env.local` in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

5. **Enable Supabase Realtime:**
   - Go to **Database → Replication** in Supabase Dashboard
   - Enable realtime for: `intake_logs`, `nudges`, `users`

6. **Enable Anonymous Authentication:**
   - Go to **Authentication → Providers → Anonymous**
   - Enable anonymous sign-ins

### Running the Application

**Development mode:**
```bash
npm run dev
```
Access at `http://localhost:5173`

**Production build:**
```bash
npm run build
npm run preview
```

### Running Tests
> ⚠️ Note: This project currently does not have automated tests configured. Testing is manual through browser interaction.

### Icon System
All icons in this project use **SVG format** for consistency and scalability:
- **Navigation icons:** `src/components/icons/` (WaterDropIcon, StatsIcon, BadgeIcon)
- **Badge icons:** `src/components/icons/BadgeIcons.jsx` (9 custom badge designs)
- **PWA icons:** `public/icon.svg` (supports all sizes, no PNG generation needed)

---

## 📁 Project Structure

```
AquaMate/
├── .afsmycoder/
│   └── rules/                  # AFS MyCoder project documentation
│       └── AFSMYCODER.md       # This file
│
├── public/
│   ├── favicon.svg             # Browser tab icon
│   ├── icon.svg                # PWA app icon (unified SVG format)
│   └── manifest.json           # PWA manifest configuration
│
├── src/
│   ├── main.jsx                # React application entry point
│   ├── App.jsx                 # Root component with routing & splash screen
│   ├── index.css               # Global CSS with Tailwind imports
│   │
│   ├── components/             # Reusable UI components
│   │   ├── BadgeCard.jsx       # Achievement badge display (locked/unlocked)
│   │   ├── BottomNav.jsx       # Tab navigation bar (Home/Stats/Profile)
│   │   ├── WaterSlider.jsx     # Water intake input slider + quick buttons
│   │   └── WaveProgress.jsx    # Animated SVG water wave circle
│   │
│   ├── screens/                # Main application screens
│   │   ├── Home.jsx            # Main screen: today's intake + partner status
│   │   ├── Stats.jsx           # Statistics: charts + 30-day history
│   │   └── Profile.jsx         # User profile: pairing + badges collection
│   │
│   ├── store/
│   │   └── useStore.js         # Zustand global state + Supabase operations
│   │
│   ├── lib/
│   │   └── supabase.js         # Supabase client initialization + helpers
│   │
│   └── SCHEMA.sql              # Database schema (run in Supabase SQL Editor)
│
├── .env.local                  # ⚠️ Environment variables (DO NOT commit)
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite config + PWA manifest
├── tailwind.config.js          # Tailwind theme (colors, animations)
├── postcss.config.js           # PostCSS config (required for Tailwind)
└── README.md                   # User-facing documentation (Chinese)
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `src/main.jsx` | Entry point that renders `<App />` into the DOM |
| `src/App.jsx` | Root component managing screen routing, splash screen, and layout |
| `src/store/useStore.js` | Global state store with all business logic and Supabase interactions |
| `src/lib/supabase.js` | Supabase client setup + utility functions (acceptInvite, createInviteLink) |
| `src/SCHEMA.sql` | Complete database schema with tables, functions, RLS policies, triggers |
| `vite.config.js` | Vite build config + PWA manifest configuration |
| `tailwind.config.js` | Custom colors (ocean, aqua, wave), animations, keyframes |

---

## 💻 Development Workflow

### Coding Standards

1. **Language & Comments:**
   - All code, variable names, and comments MUST be in English
   - Use clear, descriptive names (e.g., `myIntakeToday` not `m`)

2. **React Conventions:**
   - Use functional components with hooks
   - Prefer named exports for utilities, default export for components
   - Keep components focused and under 200 lines where possible

3. **State Management:**
   - All shared state lives in `src/store/useStore.js`
   - Use Zustand store actions for any state modifications
   - Avoid local state for data that needs persistence or cross-component access

4. **Styling:**
   - Use Tailwind utility classes directly in JSX
   - Custom colors/animations defined in `tailwind.config.js`
   - Avoid inline styles unless absolutely necessary

5. **Async Operations:**
   - All Supabase operations are async and handled in store actions
   - Use try-catch for error handling in critical operations
   - Non-blocking badge checks (don't await)

### Testing Approach

**Manual Testing Workflow:**
1. Test anonymous authentication flow (app should auto-login)
2. Test water intake logging (add, remove last)
3. Test pairing flow (generate invite link, accept from second browser/device)
4. Test real-time updates (log water in one browser, see update in partner's view)
5. Test nudge functionality (send nudge, receive with vibration if supported)
6. Test badge unlocking conditions
7. Test PWA installation ("Add to Home Screen")
8. Test offline capability (Service Worker caching)

### Build & Deployment

**Local Build:**
```bash
npm run build
# Output: dist/ folder
```

**Deployment Platforms:**

1. **Vercel (Recommended):**
   ```bash
   npm run build
   npx vercel deploy dist/
   ```
   Or connect GitHub repo for automatic deployments.
   
   **Important:** Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Netlify:**
   ```bash
   npm run build
   # Drag dist/ folder to netlify.com/drop
   ```
   Add environment variables in Netlify site settings.

3. **Other Static Hosts:**
   - GitHub Pages (requires base path config in `vite.config.js`)
   - Cloudflare Pages
   - Firebase Hosting

**Note:** PWA features (Add to Home Screen, Service Worker) only work over HTTPS (production deployments).

---

## 🧠 Key Concepts

### Domain Terminology

| Term | Definition |
|------|------------|
| **Intake** | Amount of water logged by user (in milliliters) |
| **Partner** | The paired user in a couple relationship |
| **Nudge** | A gentle reminder sent to partner to drink water |
| **Badge** | Achievement unlocked by completing specific tasks |
| **Pair** | The relationship record connecting two users |
| **Daily Goal** | Target water intake for the day (default: 2000ml) |

### Core Abstractions

#### 1. **Zustand Store (`useStore`)**
Central state management with actions for:
- Authentication and profile management
- Partner pairing and synchronization
- Water intake logging and removal
- Badge checking and awarding
- Real-time subscriptions
- Historical data loading

#### 2. **Supabase Integration**
- **Authentication:** Anonymous auto-login (persistent sessions)
- **Database:** PostgreSQL with Row-Level Security (RLS)
- **Realtime:** WebSocket subscriptions for live updates
- **Functions:** Server-side functions for complex queries (e.g., `get_pair_history`)

#### 3. **Component Architecture**
- **Screens:** Top-level page components (Home, Stats, Profile)
- **Components:** Reusable UI elements (WaveProgress, WaterSlider, etc.)
- **Store Actions:** Business logic separated from UI

### Design Patterns Used

1. **Centralized State Management:**
   - Single source of truth in Zustand store
   - UI components consume state via hooks
   - Actions encapsulate all mutations

2. **Real-time Observer Pattern:**
   - Supabase subscriptions automatically update local state
   - Store listens to database changes and triggers UI updates

3. **Optimistic UI Updates:**
   - Local state updated immediately on user actions
   - Database sync happens asynchronously in background

4. **Separation of Concerns:**
   - UI components focus on presentation
   - Store handles business logic and data fetching
   - Supabase lib handles client initialization

---

## 🔧 Common Tasks

### Adding a New Badge

1. **Define badge in `src/store/useStore.js`:**
   ```javascript
   export const BADGE_DEFS = {
     // ... existing badges
     new_badge_id: { 
       emoji: '🎯', 
       title: 'Badge Name', 
       desc: 'Description of unlock condition' 
     },
   }
   ```

2. **Add check logic in appropriate action:**
   ```javascript
   // Example: in addIntake action
   if (someCondition) {
     get().checkAndAwardBadge('new_badge_id')
   }
   ```

3. **Badge automatically appears in Profile screen once unlocked**

### Adding a New Screen

1. **Create screen component in `src/screens/`:**
   ```javascript
   // src/screens/NewScreen.jsx
   export default function NewScreen() {
     return (
       <div className="h-full p-6">
         {/* Your content */}
       </div>
     )
   }
   ```

2. **Register in `src/App.jsx`:**
   ```javascript
   import NewScreen from './screens/NewScreen'
   
   const SCREENS = { 
     home: Home, 
     stats: Stats, 
     profile: Profile,
     newscreen: NewScreen  // Add here
   }
   ```

3. **Add navigation in `src/components/BottomNav.jsx`:**
   ```javascript
   const tabs = [
     { id: 'home', icon: '🏠', label: '主畫面' },
     { id: 'stats', icon: '📊', label: '統計' },
     { id: 'profile', icon: '👤', label: '個人' },
     { id: 'newscreen', icon: '✨', label: 'New' },  // Add here
   ]
   ```

### Modifying Daily Goal Default

**In database schema (`src/SCHEMA.sql`):**
```sql
daily_goal_ml   INTEGER     NOT NULL DEFAULT 2000  -- Change this value
```

**Existing users can update via Profile screen UI**

### Adding Real-time Subscription for New Table

**In `src/store/useStore.js` → `subscribeRealtime` function:**
```javascript
.on('postgres_changes', {
  event:  'INSERT',
  schema: 'public',
  table:  'your_new_table',
  filter: `user_id=eq.${partnerId}`,
}, (payload) => {
  // Handle update
  console.log('New record:', payload.new)
})
```

### Customizing Theme Colors

**Edit `tailwind.config.js`:**
```javascript
colors: {
  ocean: {
    950: '#your-color',  // Background dark
    900: '#your-color',  // Background medium
    // ... etc
  },
}
```

**Colors are used throughout components via Tailwind classes like `bg-ocean-950`**

---

## 🐛 Troubleshooting

### Issue: App shows infinite loading spinner

**Possible Causes:**
1. Invalid or missing Supabase credentials in `.env.local`
2. Supabase project is paused (free tier inactivity)
3. Network connectivity issues

**Solutions:**
- Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Verify Supabase project is active in dashboard
- Check browser console for error messages
- Ensure `src/SCHEMA.sql` was executed in Supabase SQL Editor

---

### Issue: Partner data not updating in real-time

**Possible Causes:**
1. Realtime not enabled for required tables
2. Subscription failed to establish

**Solutions:**
- Go to Supabase Dashboard → **Database → Replication**
- Enable realtime for: `intake_logs`, `nudges`, `users`
- Check browser console for subscription errors
- Verify WebSocket connection in Network tab

---

### Issue: PWA not installable (no "Add to Home Screen")

**Possible Causes:**
1. Missing PNG icons in `public/icons/`
2. Running on HTTP instead of HTTPS
3. Service Worker not registered

**Solutions:**
- Verify `public/icon.svg` exists (SVG format now used)
- Deploy to HTTPS hosting (Vercel, Netlify, etc.)
- Check `Application → Manifest` in Chrome DevTools
- For older browsers, convert SVG to PNG if needed: `convert icon.svg -resize 512x512 icon-512.png`

---

### Issue: Invite link doesn't work

**Possible Causes:**
1. Database schema not applied
2. Invite link already used
3. Trying to pair with yourself

**Solutions:**
- Ensure `src/SCHEMA.sql` was fully executed in Supabase
- Generate a fresh invite link
- Test with a different browser or incognito window (different anonymous user)
- Check `invite_links` table in Supabase for `is_used = false`

---

### Issue: Badges not unlocking

**Possible Causes:**
1. Badge check logic not triggered
2. Badge already exists (constraint prevents duplicates)
3. Condition not actually met

**Solutions:**
- Check browser console for errors in `checkAndAwardBadge`
- Verify condition logic in `src/store/useStore.js`
- Query `badges` table in Supabase to see existing badges
- Test with fresh anonymous user (clear browser storage)

---

### Issue: Build fails or Vite errors

**Common Issues:**
- Node version too old (require v18+)
- Missing dependencies after git clone
- Port 5173 already in use

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Use different port
npm run dev -- --port 3000

# Update Node.js
nvm install 18
nvm use 18
```

---

## 📚 References

### Documentation

- **React 18:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Framer Motion:** https://www.framer.com/motion/
- **Zustand:** https://github.com/pmndrs/zustand
- **Supabase:**
  - Getting Started: https://supabase.com/docs
  - Realtime: https://supabase.com/docs/guides/realtime
  - Row-Level Security: https://supabase.com/docs/guides/auth/row-level-security
  - PostgreSQL Functions: https://www.postgresql.org/docs/current/sql-createfunction.html
- **Recharts:** https://recharts.org/
- **PWA:**
  - vite-plugin-pwa: https://vite-pwa-org.netlify.app/
  - Web.dev PWA Guide: https://web.dev/progressive-web-apps/

### Important Resources

- **Supabase Dashboard:** https://app.supabase.com/
- **Deployment Platforms:**
  - Vercel: https://vercel.com/
  - Netlify: https://netlify.com/
- **Icon Generator:** https://github.com/onderceylan/pwa-asset-generator

### Badge Definitions Reference

Defined in `src/store/useStore.js`:

| Badge ID | Emoji | Title | Unlock Condition |
|----------|-------|-------|------------------|
| `first_log` | 💧 | 初次報到 | First water intake log |
| `streak_3` | 🔥 | 連續3天 | 3-day streak reaching goal |
| `streak_7` | ⚡ | 一週霸主 | 7-day streak |
| `streak_30` | 👑 | 月度傳說 | 30-day streak |
| `big_drinker` | 🌊 | 海量飲者 | Single day intake > 3000ml |
| `beat_partner` | 🏆 | 先馳得點 | Reach goal before partner today |
| `early_bird` | 🌅 | 早起水鳥 | Log 500ml+ before 8 AM |
| `night_owl` | 🦉 | 深夜補水 | Log water after 11 PM |
| `pair_champion` | 💑 | 夥伴之力 | Both users reach goal same day |

### Database Schema Quick Reference

**Main Tables:**
- `users` - User profiles (extends auth.users)
- `pairs` - Partner relationships (permanent)
- `intake_logs` - Water intake records
- `badges` - Unlocked achievements
- `nudges` - Partner reminders
- `invite_links` - One-time pairing tokens

**Key Functions:**
- `get_daily_total(user_id, date)` - Get total intake for a specific day
- `get_partner_id(user_id)` - Get partner's user ID
- `get_pair_history(user_id, days)` - Get 30-day comparison data

---

## 🎯 Next Steps for New Developers

1. **Read the README.md** - User-facing setup instructions (in Chinese)
2. **Explore the Zustand store** - `src/store/useStore.js` contains all business logic
3. **Review SCHEMA.sql** - Understand the data model and RLS policies
4. **Test locally** - Set up Supabase, run dev server, test pairing flow
5. **Experiment with components** - Modify `WaveProgress.jsx` or `BadgeCard.jsx` to learn Framer Motion
6. **Add a custom badge** - Follow "Common Tasks" section above
7. **Deploy to production** - Experience the full PWA on mobile device

---

## 📝 Contributing Guidelines

> ⚠️ Note: This project currently does not have formal contribution guidelines. If you're working as a team, consider establishing:

1. **Branch naming convention** (e.g., `feature/badge-system`, `fix/realtime-sync`)
2. **Commit message format** (e.g., Conventional Commits)
3. **Code review process**
4. **Testing requirements** before merging
5. **Documentation updates** for new features

**Recommended workflow:**
- Create feature branch from `main`
- Make changes and test locally
- Update this AFSMYCODER.md if adding new concepts/features
- Submit pull request with description
- Deploy to staging environment before production

---

## 🔐 Security Notes

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - `.env.local` is already in `.gitignore`
   - Only use `VITE_` prefix for variables exposed to client

2. **Supabase Security:**
   - Row-Level Security (RLS) enforces data access control
   - Anonymous users can only see their own data + partner's data
   - `anon` key is safe to expose (RLS policies protect data)
   - Service role key should NEVER be used client-side

3. **Authentication:**
   - Anonymous auth allows app to work without user accounts
   - Sessions persist in browser localStorage
   - Each browser/device gets unique anonymous user ID

---

## 📊 Performance Considerations

1. **Real-time Subscriptions:**
   - Limit to 10 events/second (configured in `supabase.js`)
   - Cleanup subscriptions on component unmount or store teardown

2. **Database Queries:**
   - Use indexed columns for filters (`user_id`, `logged_at`)
   - Leverage Supabase functions for complex queries
   - Historical data loaded once and cached (`historyLoaded` flag)

3. **Bundle Size:**
   - Current bundle ~150KB gzipped (reasonable for feature set)
   - Consider code splitting if adding many new screens
   - Framer Motion is largest dependency (~60KB)

4. **PWA Caching:**
   - Service Worker caches all static assets
   - Google Fonts cached for 1 year
   - Offline mode shows cached app shell

---

**Happy Coding! 💧✨**

*For questions or issues, check the Troubleshooting section above or review the Supabase logs.*
