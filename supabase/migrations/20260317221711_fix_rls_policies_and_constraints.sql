
-- Fix 1: Remove UNIQUE constraint on portfolios.user_id to allow multiple portfolios per user
ALTER TABLE public.portfolios DROP CONSTRAINT IF EXISTS portfolios_user_id_key;

-- Fix 2: Drop old public-read RLS policies that incorrectly check profiles.is_public
-- (profiles.is_public defaults to false, so these policies blocked all public portfolio reads)
DROP POLICY IF EXISTS "Public projects viewable" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public skills viewable" ON public.skills;
DROP POLICY IF EXISTS "Public experiences viewable" ON public.experiences;
DROP POLICY IF EXISTS "Public education viewable" ON public.education;
DROP POLICY IF EXISTS "Public certifications viewable" ON public.certifications;

-- Fix 2 (cont): Re-create public-read policies checking portfolios.is_public via portfolio_id join
CREATE POLICY "Public projects viewable" ON public.portfolio_projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = portfolio_projects.portfolio_id AND is_public = true)
);

CREATE POLICY "Public skills viewable" ON public.skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = skills.portfolio_id AND is_public = true)
);

CREATE POLICY "Public experiences viewable" ON public.experiences FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = experiences.portfolio_id AND is_public = true)
);

CREATE POLICY "Public education viewable" ON public.education FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = education.portfolio_id AND is_public = true)
);

CREATE POLICY "Public certifications viewable" ON public.certifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = certifications.portfolio_id AND is_public = true)
);

-- Fix 3: Add performance indexes on portfolio_id foreign key columns
CREATE INDEX IF NOT EXISTS idx_skills_portfolio_id ON public.skills(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_experiences_portfolio_id ON public.experiences(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_education_portfolio_id ON public.education(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_portfolio_id ON public.portfolio_projects(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_certifications_portfolio_id ON public.certifications(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_portfolio_id ON public.portfolio_views(portfolio_id);
