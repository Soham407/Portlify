
-- Certifications table
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL DEFAULT '',
  issue_date DATE,
  expiry_date DATE,
  credential_url TEXT,
  image_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- RLS: Owner can manage
CREATE POLICY "Users can manage own certifications"
  ON public.certifications FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS: Public view
CREATE POLICY "Public certifications viewable"
  ON public.certifications FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = certifications.user_id AND profiles.is_public = true
  ));

-- Avatar storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS: Anyone can view avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Storage RLS: Authenticated users can upload to own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: Users can update own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: Users can delete own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add visibility column for share-only mode
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'share_only'));

-- Backfill existing data
UPDATE public.portfolios SET visibility = CASE WHEN is_public = true THEN 'public' ELSE 'private' END WHERE visibility IS NULL;

-- Update completion function to include certifications
CREATE OR REPLACE FUNCTION public.get_portfolio_completion(p_portfolio_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  section_count INTEGER := 0;
  total_sections CONSTANT INTEGER := 7;
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
  IF EXISTS (SELECT 1 FROM certifications WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;
  RETURN ROUND((section_count::NUMERIC / total_sections) * 100);
END;
$$;
