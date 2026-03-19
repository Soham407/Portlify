
-- Update profiles table with new columns from spec
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('technical', 'non-technical')),
  ADD COLUMN IF NOT EXISTS career_type TEXT,
  ADD COLUMN IF NOT EXISTS skill_level TEXT,
  ADD COLUMN IF NOT EXISTS selected_role TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter')),
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Create portfolios table (central entity)
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  template_id TEXT DEFAULT 'minimal',
  is_public BOOLEAN DEFAULT true,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged')),
  last_moderated_at TIMESTAMPTZ,
  custom_domain TEXT,
  domain_status TEXT DEFAULT 'none' CHECK (domain_status IN ('none', 'pending', 'active', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bio sections table
CREATE TABLE public.bio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact info table
CREATE TABLE public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  social_urls JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio views table
CREATE TABLE public.portfolio_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  viewer_ip TEXT,
  user_agent TEXT
);

-- Add portfolio_id to existing tables (keeping user_id for backward compat)
ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE;
ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS problem_statement TEXT;
ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS solution_approach TEXT;
ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}';
ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'personal';
ALTER TABLE public.portfolio_projects RENAME COLUMN title TO name;
ALTER TABLE public.portfolio_projects RENAME COLUMN description TO problem_statement_old;

ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE;
ALTER TABLE public.skills RENAME COLUMN name TO skill_name;
ALTER TABLE public.skills RENAME COLUMN category TO skill_category;

ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE;
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full-time';
ALTER TABLE public.experiences RENAME COLUMN company TO company_name;
ALTER TABLE public.experiences RENAME COLUMN role TO role_title;

ALTER TABLE public.education ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE;
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS graduation_year TEXT;
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS cgpa TEXT;

-- RLS for portfolios
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public portfolios viewable" ON public.portfolios FOR SELECT USING (is_public = true);
CREATE POLICY "Owner can view own portfolio" ON public.portfolios FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert portfolio" ON public.portfolios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update portfolio" ON public.portfolios FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete portfolio" ON public.portfolios FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS for bio_sections
ALTER TABLE public.bio_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bio viewable for public portfolios" ON public.bio_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = bio_sections.portfolio_id AND is_public = true)
);
CREATE POLICY "Owner can manage bio" ON public.bio_sections FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = bio_sections.portfolio_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = bio_sections.portfolio_id AND user_id = auth.uid())
);

-- RLS for contact_info
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact viewable for public portfolios" ON public.contact_info FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = contact_info.portfolio_id AND is_public = true)
);
CREATE POLICY "Owner can manage contact" ON public.contact_info FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = contact_info.portfolio_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = contact_info.portfolio_id AND user_id = auth.uid())
);

-- RLS for portfolio_views (anyone can insert, only owner can read)
ALTER TABLE public.portfolio_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log views" ON public.portfolio_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can view analytics" ON public.portfolio_views FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.portfolios WHERE id = portfolio_views.portfolio_id AND user_id = auth.uid())
);

-- Portfolio completion function
CREATE OR REPLACE FUNCTION public.get_portfolio_completion(p_portfolio_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  section_count INTEGER := 0;
  total_sections CONSTANT INTEGER := 6;
BEGIN
  IF EXISTS (SELECT 1 FROM bio_sections WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;
  IF EXISTS (SELECT 1 FROM portfolio_projects WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;
  IF EXISTS (SELECT 1 FROM skills WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;
  IF EXISTS (SELECT 1 FROM education WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;
  IF EXISTS (SELECT 1 FROM experiences WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;
  IF EXISTS (SELECT 1 FROM contact_info WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;
  RETURN ROUND((section_count::NUMERIC / total_sections) * 100);
END;
$$;

-- Can share function
CREATE OR REPLACE FUNCTION public.can_share_portfolio(p_portfolio_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM bio_sections WHERE portfolio_id = p_portfolio_id)
    AND EXISTS (SELECT 1 FROM portfolio_projects WHERE portfolio_id = p_portfolio_id);
END;
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bio_sections_updated_at BEFORE UPDATE ON public.bio_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON public.contact_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_portfolio_projects_updated_at BEFORE UPDATE ON public.portfolio_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
