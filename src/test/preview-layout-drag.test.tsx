import { act, fireEvent, screen, within } from "@testing-library/react";
import type { PortfolioData } from "@/components/templates/PortfolioTemplateProps";
import SectionWrapper from "@/components/preview/SectionWrapper";
import Preview from "@/pages/Preview";
import { renderWithAppProviders } from "./test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockUsePortfolioPreviewData,
  mockUpdateSectionControls,
  mockUpdateSectionLayouts,
} = vi.hoisted(() => ({
  mockUsePortfolioPreviewData: vi.fn(),
  mockUpdateSectionControls: vi.fn(),
  mockUpdateSectionLayouts: vi.fn(),
}));

vi.mock("@/hooks/usePortfolioPreviewData", () => ({
  usePortfolioPreviewData: mockUsePortfolioPreviewData,
}));

vi.mock("@/components/templates", () => {
  const MockTemplate = ({
    sectionOrder = [],
    editMode,
    onSectionEdit,
  }: PortfolioData) => (
    <main>
      {sectionOrder.map((sectionId) => (
        <SectionWrapper
          key={sectionId}
          id={sectionId}
          editMode={editMode}
          onEdit={onSectionEdit}
        >
          <section aria-label={`${sectionId} section`} className="min-h-24">
            <h2>{sectionId}</h2>
          </section>
        </SectionWrapper>
      ))}
    </main>
  );

  return {
    getTemplateComponent: () => MockTemplate,
  };
});

const getRenderedSectionOrder = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-preview-section-id]")).map(
    (element) => element.dataset.previewSectionId ?? ""
  );

const initialSectionOrder = [
  "bio",
  "projects",
  "skills",
  "experience",
  "education",
  "certifications",
  "contact",
];

describe("Preview customize layout drag and drop", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUpdateSectionControls.mockReset();
    mockUpdateSectionLayouts.mockReset();

    mockUsePortfolioPreviewData.mockReturnValue({
      portfolio: {
        id: "portfolio-1",
        visibility: "unlisted",
        share_token: "share-token",
        is_default: false,
      },
      profile: {
        username: "ada",
      },
      portfolioId: "portfolio-1",
      templateId: "minimal",
      defaultOrderForReset: initialSectionOrder,
      templateData: {
        bio: { first_name: "Ada", last_name: "Lovelace" },
        projects: [{ id: "project-1", name: "Analytical Engine" }],
        skills: [{ id: "skill-1", skill_name: "Math" }],
        experiences: [],
        education: [],
        contact: { email: "ada@example.com" },
        certifications: [],
        customSections: [],
        sectionLayouts: {},
        sectionOrder: initialSectionOrder,
        hiddenSections: [],
        notApplicableSections: [],
      },
      isLoading: false,
      updateSectionLayouts: {
        mutate: mockUpdateSectionLayouts,
      },
      updateSectionControls: {
        mutate: mockUpdateSectionControls,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reorders sections even when the pointer leaves the drag handle", async () => {
    renderWithAppProviders(<Preview />, ["/preview?portfolio=portfolio-1"]);

    fireEvent.click(screen.getByRole("button", { name: "Customize Layout" }));

    const getSection = (sectionId: string) =>
      document.querySelector<HTMLElement>(`[data-preview-section-id="${sectionId}"]`);

    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn((_: number, clientY: number) => {
        if (clientY >= 240) {
          return [getSection("skills")].filter(Boolean);
        }

        return [getSection("projects")].filter(Boolean);
      }),
    });

    const projectsSection = getSection("projects");
    expect(projectsSection).not.toBeNull();

    const dragButton = within(projectsSection as HTMLElement).getByRole("button", {
      name: "Drag",
    });

    act(() => {
      dragButton.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          pointerId: 1,
          clientX: 80,
          clientY: 120,
        })
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          pointerId: 1,
          clientX: 80,
          clientY: 260,
        })
      );

      window.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerId: 1,
          clientX: 80,
          clientY: 260,
        })
      );
    });

    expect(getRenderedSectionOrder()).toEqual([
      "bio",
      "skills",
      "projects",
      "experience",
      "education",
      "certifications",
      "contact",
    ]);

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockUpdateSectionControls).toHaveBeenCalledWith(
      {
        section_order: [
          "bio",
          "skills",
          "projects",
          "experience",
          "education",
          "certifications",
          "contact",
        ],
        hidden_sections: [],
        not_applicable_sections: [],
      },
      expect.objectContaining({
        onError: expect.any(Function),
      })
    );
  });
});
