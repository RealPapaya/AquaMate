import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '❌  Please create .env.local and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
    storageKey:        'aquamate-auth',
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
  global: {
    headers: {
      'Prefer': 'return=representation',
    },
  },
})

// ── Helper: get today's date string in user's local timezone ──
export const todayStr = () => new Date().toISOString().split('T')[0]

// ── Helper: accept invite token and create pair ───────────────
export async function acceptInvite(token, myUserId) {
  const { data: invite, error } = await supabase
    .from('invite_links')
    .select('*')
    .eq('token', token)
    .eq('is_used', false)
    .single()

  if (error || !invite) throw new Error('邀請連結無效或已使用')
  if (invite.creator_id === myUserId) throw new Error('不能和自己配對')

  const { data: pair, error: pairErr } = await supabase
    .from('pairs')
    .insert({
      user_a_id:    invite.creator_id,
      user_b_id:    myUserId,
      invite_token: token,
    })
    .select()
    .single()

  if (pairErr) throw pairErr

  await supabase
    .from('invite_links')
    .update({ is_used: true, used_at: new Date().toISOString() })
    .eq('token', token)

  return pair
}

// ── Helper: generate invite link ──────────────────────────────
export async function createInviteLink(userId) {
  const { data, error } = await supabase
    .from('invite_links')
    .insert({ creator_id: userId })
    .select('token')
    .single()

  if (error) throw error
  return `${window.location.origin}/join?token=${data.token}`
}
