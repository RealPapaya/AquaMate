-- ============================================================
--  AquaMate — Supabase Schema
--  Run this in Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- ── 1. Extensions ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. Tables ───────────────────────────────────────────────

-- 2-A  Users (extends auth.users)
CREATE TABLE public.users (
  id              UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name    TEXT        NOT NULL DEFAULT 'Water Buddy',
  daily_goal_ml   INTEGER     NOT NULL DEFAULT 2000 CHECK (daily_goal_ml BETWEEN 500 AND 6000),
  avatar_emoji    TEXT        NOT NULL DEFAULT '💧',
  timezone        TEXT        NOT NULL DEFAULT 'Asia/Taipei',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2-B  Invite links (one-time tokens for pairing)
CREATE TABLE public.invite_links (
  token        TEXT        PRIMARY KEY DEFAULT encode(gen_random_bytes(12), 'hex'),
  creator_id   UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_used      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at      TIMESTAMPTZ
);

-- 2-C  Permanent pairs
CREATE TABLE public.pairs (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id    UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_b_id    UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  invite_token TEXT        REFERENCES public.invite_links(token),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_pair    CHECK  (user_a_id <> user_b_id),
  CONSTRAINT unique_pair     UNIQUE (user_a_id, user_b_id)
);

-- 2-D  Intake logs
CREATE TABLE public.intake_logs (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml  INTEGER     NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 2000),
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note       TEXT
);

-- 2-E  Badges
CREATE TABLE public.badges (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_type   TEXT        NOT NULL,
  unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_badge UNIQUE (user_id, badge_type)
);

-- 2-F  Nudges (partner reminders)
CREATE TABLE public.nudges (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id   UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Indexes ──────────────────────────────────────────────
CREATE INDEX idx_intake_user_time    ON public.intake_logs (user_id, logged_at DESC);
CREATE INDEX idx_intake_user_date    ON public.intake_logs (user_id, (logged_at::DATE));
CREATE INDEX idx_pairs_user_a        ON public.pairs (user_a_id);
CREATE INDEX idx_pairs_user_b        ON public.pairs (user_b_id);
CREATE INDEX idx_nudges_to_user      ON public.nudges (to_user_id, sent_at DESC);
CREATE INDEX idx_badges_user         ON public.badges (user_id);

-- ── 4. Functions ────────────────────────────────────────────

-- Get daily total for a user on a given date
CREATE OR REPLACE FUNCTION public.get_daily_total(p_user_id UUID, p_date DATE)
RETURNS INTEGER LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT COALESCE(SUM(amount_ml), 0)::INTEGER
  FROM public.intake_logs
  WHERE user_id = p_user_id
    AND logged_at::DATE = p_date;
$$;

-- Get partner ID for a given user
CREATE OR REPLACE FUNCTION public.get_partner_id(p_user_id UUID)
RETURNS UUID LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT CASE
    WHEN user_a_id = p_user_id THEN user_b_id
    ELSE user_a_id
  END
  FROM public.pairs
  WHERE user_a_id = p_user_id OR user_b_id = p_user_id
  LIMIT 1;
$$;

-- Get 30-day intake summary for both users in a pair
CREATE OR REPLACE FUNCTION public.get_pair_history(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  log_date     DATE,
  my_total     INTEGER,
  partner_total INTEGER
) LANGUAGE SQL SECURITY DEFINER AS $$
  WITH partner AS (
    SELECT public.get_partner_id(p_user_id) AS id
  ),
  dates AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1) * INTERVAL '1 day',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE AS d
  ),
  my_logs AS (
    SELECT logged_at::DATE AS d, SUM(amount_ml)::INTEGER AS total
    FROM public.intake_logs
    WHERE user_id = p_user_id
      AND logged_at >= CURRENT_DATE - p_days
    GROUP BY 1
  ),
  partner_logs AS (
    SELECT logged_at::DATE AS d, SUM(amount_ml)::INTEGER AS total
    FROM public.intake_logs
    WHERE user_id = (SELECT id FROM partner)
      AND logged_at >= CURRENT_DATE - p_days
    GROUP BY 1
  )
  SELECT
    dates.d                             AS log_date,
    COALESCE(my_logs.total, 0)          AS my_total,
    COALESCE(partner_logs.total, 0)     AS partner_total
  FROM dates
  LEFT JOIN my_logs     ON dates.d = my_logs.d
  LEFT JOIN partner_logs ON dates.d = partner_logs.d
  ORDER BY 1;
$$;

-- Auto-update updated_at on users
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Water Buddy'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 5. Row Level Security ────────────────────────────────────
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges       ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users: read own or partner" ON public.users FOR SELECT
  USING (id = auth.uid() OR id = public.get_partner_id(auth.uid()));
CREATE POLICY "users: update own" ON public.users FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "users: insert own" ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Invite links policies
CREATE POLICY "invite: creator can read" ON public.invite_links FOR SELECT
  USING (creator_id = auth.uid());
CREATE POLICY "invite: creator can insert" ON public.invite_links FOR INSERT
  WITH CHECK (creator_id = auth.uid());
CREATE POLICY "invite: anyone can read unused for joining" ON public.invite_links FOR SELECT
  USING (is_used = FALSE);

-- Pairs policies
CREATE POLICY "pairs: members can read" ON public.pairs FOR SELECT
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid());
CREATE POLICY "pairs: authenticated can insert" ON public.pairs FOR INSERT
  WITH CHECK (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- Intake logs policies
CREATE POLICY "intake: read own or partner" ON public.intake_logs FOR SELECT
  USING (user_id = auth.uid() OR user_id = public.get_partner_id(auth.uid()));
CREATE POLICY "intake: insert own" ON public.intake_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "intake: delete own" ON public.intake_logs FOR DELETE
  USING (user_id = auth.uid());

-- Badges policies
CREATE POLICY "badges: read own or partner" ON public.badges FOR SELECT
  USING (user_id = auth.uid() OR user_id = public.get_partner_id(auth.uid()));
CREATE POLICY "badges: insert own" ON public.badges FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Nudges policies
CREATE POLICY "nudges: read as recipient" ON public.nudges FOR SELECT
  USING (to_user_id = auth.uid());
CREATE POLICY "nudges: insert as sender in pair" ON public.nudges FOR INSERT
  WITH CHECK (
    from_user_id = auth.uid()
    AND to_user_id = public.get_partner_id(auth.uid())
  );

-- ── 6. Realtime publications ────────────────────────────────
-- Enable realtime on relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.intake_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nudges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;