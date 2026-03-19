ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS section_layouts jsonb DEFAULT '{}';
