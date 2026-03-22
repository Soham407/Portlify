import { describe, expect, it } from "vitest";
import { resolvePortfolioCardPreview } from "@/components/dashboard/portfolioCardPreview";
import type { Tables } from "@/integrations/supabase/types";

const createPortfolio = (overrides: Partial<Tables<"portfolios">> = {}): Tables<"portfolios"> => ({
  created_at: "2026-03-22T00:00:00.000Z",
  custom_domain: null,
  domain_status: null,
  hidden_sections: [],
  id: "portfolio-1",
  is_default: false,
  is_public: false,
  last_moderated_at: null,
  moderation_status: null,
  name: "Showcase",
  not_applicable_sections: [],
  portfolio_type: "general",
  section_layouts: null,
  section_order: [],
  share_token: "share-token",
  template_id: "minimal",
  updated_at: "2026-03-22T00:00:00.000Z",
  user_id: "user-1",
  visibility: "private",
  ...overrides,
});

describe("resolvePortfolioCardPreview", () => {
  it("prefers the earliest project image over avatar fallback", () => {
    const preview = resolvePortfolioCardPreview({
      portfolio: createPortfolio({ template_id: "developer" }),
      avatarUrl: "https://example.com/avatar.png",
      projectImages: [
        { image_url: "https://example.com/late.png", display_order: 3 },
        { image_url: "https://example.com/first.png", display_order: 1 },
      ],
    });

    expect(preview).toEqual({
      imageUrl: "https://example.com/first.png",
      source: "project",
      templateName: "Night Owl",
    });
  });

  it("falls back to avatar when no usable project image is available", () => {
    const preview = resolvePortfolioCardPreview({
      portfolio: createPortfolio({ template_id: "corporate" }),
      avatarUrl: "https://example.com/avatar.png",
      projectImages: [{ image_url: "   ", display_order: 0 }],
    });

    expect(preview).toEqual({
      imageUrl: "https://example.com/avatar.png",
      source: "avatar",
      templateName: "Editorial",
    });
  });

  it("returns a placeholder preview when no media exists", () => {
    const preview = resolvePortfolioCardPreview({
      portfolio: createPortfolio({ template_id: "photography" }),
    });

    expect(preview).toEqual({
      source: "placeholder",
      templateName: "Brutalist",
    });
  });
});
