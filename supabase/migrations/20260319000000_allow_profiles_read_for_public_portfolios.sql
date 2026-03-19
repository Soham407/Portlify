-- Allow anonymous users to read profiles when the user has a public portfolio.
-- Previously, profiles were only readable if profiles.is_public = true,
-- but the builder sets portfolios.is_public = true (a separate flag).
-- This caused the PublicPortfolio page to fail with 406 when looking up the
-- profile by username before verifying the portfolio is public.
CREATE POLICY "Profiles with public portfolios are viewable" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE user_id = profiles.id AND is_public = true
    )
  );
