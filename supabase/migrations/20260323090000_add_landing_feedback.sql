CREATE TABLE IF NOT EXISTS public.landing_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  liked_feature TEXT NOT NULL,
  least_liked_feature TEXT NOT NULL,
  wanted_feature TEXT NOT NULL,
  signup_blocker TEXT NOT NULL,
  persona TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit landing feedback" ON public.landing_feedback;
CREATE POLICY "Anyone can submit landing feedback"
  ON public.landing_feedback
  FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own landing feedback" ON public.landing_feedback;
CREATE POLICY "Users can view own landing feedback"
  ON public.landing_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_landing_feedback_created_at
  ON public.landing_feedback (created_at DESC);
