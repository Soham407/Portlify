-- Add portfolio_name and portfolio_type for multiple portfolios
ALTER TABLE public.portfolios
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'My Portfolio',
ADD COLUMN IF NOT EXISTS portfolio_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_user_default ON public.portfolios(user_id, is_default);

-- Update existing portfolios to be default
UPDATE public.portfolios SET is_default = true WHERE is_default = false;

-- Add section_order to portfolios for dynamic ordering
ALTER TABLE public.portfolios
ADD COLUMN IF NOT EXISTS section_order TEXT[] DEFAULT ARRAY['bio', 'skills', 'projects', 'experience', 'education', 'contact'];

-- Update skills table to add learned_vs_implemented tracking
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS skill_type TEXT DEFAULT 'learned' CHECK (skill_type IN ('learned', 'implemented'));

-- Create section_order_config table for user-type based defaults
CREATE TABLE IF NOT EXISTS public.section_order_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL UNIQUE,
  default_order TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default section orders based on user type
INSERT INTO public.section_order_config (user_type, default_order) VALUES
  ('fresher', ARRAY['bio', 'skills', 'education', 'projects', 'experience', 'contact']),
  ('job_seeker', ARRAY['bio', 'skills', 'projects', 'experience', 'education', 'contact']),
  ('expert', ARRAY['bio', 'experience', 'projects', 'skills', 'education', 'contact']),
  ('freelancer', ARRAY['bio', 'projects', 'skills', 'experience', 'education', 'contact']),
  ('professional', ARRAY['bio', 'experience', 'skills', 'projects', 'education', 'contact'])
ON CONFLICT (user_type) DO NOTHING;

-- Enable RLS on section_order_config
ALTER TABLE public.section_order_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read section order configs
CREATE POLICY "Section order config readable by all"
  ON public.section_order_config
  FOR SELECT
  USING (true);