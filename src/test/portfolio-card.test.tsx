import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PortfolioCard from "@/components/dashboard/PortfolioCard";
import type { PortfolioCardPreview } from "@/components/dashboard/portfolioCardPreview";
import type { PortfolioData } from "@/components/templates/PortfolioTemplateProps";
import type { Tables } from "@/integrations/supabase/types";
import { renderWithAppProviders } from "./test-utils";

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

const createPreview = (overrides: Partial<PortfolioCardPreview> = {}): PortfolioCardPreview => ({
  source: "placeholder",
  templateName: "Glass",
  ...overrides,
});

const createLivePreview = (overrides: Partial<PortfolioData> = {}): PortfolioData => ({
  bio: {
    first_name: "Ada",
    last_name: "Lovelace",
    headline: "Computing Pioneer",
    bio: "Inventing analytical engines for the modern web.",
  },
  projects: [],
  skills: [],
  experiences: [],
  education: [],
  contact: null,
  certifications: [],
  customSections: [],
  sectionLayouts: {},
  sectionOrder: ["bio", "contact"],
  hiddenSections: [],
  notApplicableSections: [],
  ...overrides,
});

const baseVisibilityOptions = [
  { label: "Private", value: "private" },
  { label: "Public", value: "public" },
];

const renderPortfolioCard = ({
  portfolio = createPortfolio(),
  preview = createPreview(),
} = {}) => {
  const onSelect = vi.fn();
  const onShare = vi.fn();

  renderWithAppProviders(
    <PortfolioCard
      portfolio={portfolio}
      preview={preview}
      isSelected={false}
      viewCount={0}
      canDelete
      visibilityOptions={baseVisibilityOptions}
      onSelect={onSelect}
      onShare={onShare}
      onDuplicate={vi.fn()}
      onSetDefault={vi.fn()}
      onSetVisibility={vi.fn()}
      onDelete={vi.fn()}
    />
  );

  return { onSelect, onShare };
};

describe("PortfolioCard", () => {
  it("renders a live template miniature when preview content is available", () => {
    renderPortfolioCard({
      preview: createPreview({
        livePreview: createLivePreview(),
      }),
    });

    expect(screen.getByTestId("portfolio-card-live-preview")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Showcase live preview" })).toBeInTheDocument();
  });

  it("renders a connected media container with a real preview image", () => {
    renderPortfolioCard({
      preview: createPreview({
        imageUrl: "https://example.com/preview.png",
        source: "project",
      }),
    });

    expect(screen.getByTestId("portfolio-card-media")).toBeInTheDocument();
    expect(screen.getByAltText("Showcase preview")).toHaveAttribute(
      "src",
      "https://example.com/preview.png"
    );
  });

  it("renders a placeholder preview when no image is available", () => {
    renderPortfolioCard({
      portfolio: createPortfolio({ name: null, template_id: "developer" }),
      preview: createPreview({
        source: "placeholder",
        templateName: "Night Owl",
      }),
    });

    expect(
      screen.getByRole("img", { name: "Untitled preview placeholder" })
    ).toBeInTheDocument();
    expect(screen.getByText("Night Owl")).toBeInTheDocument();
  });

  it("selects the card when the shell is clicked", () => {
    const { onSelect } = renderPortfolioCard();

    fireEvent.click(screen.getByText("Showcase"));

    expect(onSelect).toHaveBeenCalledWith("portfolio-1");
  });

  it("opens share without selecting the card", () => {
    const { onSelect, onShare } = renderPortfolioCard();

    fireEvent.click(screen.getByRole("button", { name: "Share Showcase" }));

    expect(onShare).toHaveBeenCalledWith("portfolio-1");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not select the card when preview or actions buttons are clicked", () => {
    const { onSelect } = renderPortfolioCard();

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Showcase" }));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
