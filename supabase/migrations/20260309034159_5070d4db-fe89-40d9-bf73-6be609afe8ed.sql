
-- Fix search_path on update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix permissive RLS on portfolio_views - add rate limiting via portfolio existence check
DROP POLICY IF EXISTS "Anyone can log views" ON public.portfolio_views;
CREATE POLICY "Anyone can log views for existing portfolios" ON public.portfolio_views 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.portfolios WHERE id = portfolio_id AND is_public = true)
  );
