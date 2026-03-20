ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portfolio_goal TEXT,
  ADD COLUMN IF NOT EXISTS preferred_template TEXT,
  ADD COLUMN IF NOT EXISTS import_intent TEXT,
  ADD COLUMN IF NOT EXISTS starter_content_mode TEXT;

ALTER TABLE public.portfolios
  ADD COLUMN IF NOT EXISTS hidden_sections TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

ALTER TABLE public.portfolio_views
  ADD COLUMN IF NOT EXISTS share_channel TEXT;

UPDATE public.portfolios
SET visibility = CASE
  WHEN visibility = 'share_only' THEN 'unlisted'
  WHEN visibility IS NULL AND is_public = true THEN 'public'
  WHEN visibility IS NULL THEN 'private'
  ELSE visibility
END;

ALTER TABLE public.portfolios
  DROP CONSTRAINT IF EXISTS portfolios_visibility_check;

ALTER TABLE public.portfolios
  ADD CONSTRAINT portfolios_visibility_check
  CHECK (visibility IN ('public', 'private', 'unlisted'));

UPDATE public.portfolios
SET share_token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE share_token IS NULL;

CREATE INDEX IF NOT EXISTS idx_portfolios_share_token ON public.portfolios(share_token);

DROP POLICY IF EXISTS "Public portfolios viewable" ON public.portfolios;
CREATE POLICY "Visible portfolios viewable"
  ON public.portfolios
  FOR SELECT
  USING (visibility IN ('public', 'unlisted') OR is_public = true);

DROP POLICY IF EXISTS "Bio viewable for public portfolios" ON public.bio_sections;
CREATE POLICY "Bio viewable for visible portfolios"
  ON public.bio_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portfolios
      WHERE id = bio_sections.portfolio_id
        AND (visibility IN ('public', 'unlisted') OR is_public = true)
    )
  );

DROP POLICY IF EXISTS "Contact viewable for public portfolios" ON public.contact_info;
CREATE POLICY "Contact viewable for visible portfolios"
  ON public.contact_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portfolios
      WHERE id = contact_info.portfolio_id
        AND (visibility IN ('public', 'unlisted') OR is_public = true)
    )
  );

DROP POLICY IF EXISTS "Public projects viewable" ON public.portfolio_projects;
CREATE POLICY "Visible projects viewable"
  ON public.portfolio_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portfolios
      WHERE id = portfolio_projects.portfolio_id
        AND (visibility IN ('public', 'unlisted') OR is_public = true)
    )
  );

DROP POLICY IF EXISTS "Public skills viewable" ON public.skills;
CREATE POLICY "Visible skills viewable"
  ON public.skills
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portfolios
      WHERE id = skills.portfolio_id
        AND (visibility IN ('public', 'unlisted') OR is_public = true)
    )
  );

DROP POLICY IF EXISTS "Public experiences viewable" ON public.experiences;
CREATE POLICY "Visible experiences viewable"
  ON public.experiences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portfolios
      WHERE id = experiences.portfolio_id
        AND (visibility IN ('public', 'unlisted') OR is_public = true)
    )
  );

DROP POLICY IF EXISTS "Public education viewable" ON public.education;
CREATE POLICY "Visible education viewable"
  ON public.education
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portfolios
      WHERE id = education.portfolio_id
        AND (visibility IN ('public', 'unlisted') OR is_public = true)
    )
  );

DROP POLICY IF EXISTS "Public certifications viewable" ON public.certifications;
CREATE POLICY "Visible certifications viewable"
  ON public.certifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portfolios
      WHERE id = certifications.portfolio_id
        AND (visibility IN ('public', 'unlisted') OR is_public = true)
    )
  );

DROP POLICY IF EXISTS "Anyone can log views for existing portfolios" ON public.portfolio_views;
CREATE POLICY "Anyone can log views for visible portfolios"
  ON public.portfolio_views
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.portfolios
      WHERE id = portfolio_id
        AND (visibility IN ('public', 'unlisted') OR is_public = true)
    )
  );
