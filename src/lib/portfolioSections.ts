import { PORTFOLIO_SECTIONS } from "@/lib/constants";

export type PortfolioSectionId = (typeof PORTFOLIO_SECTIONS)[number]["id"];

const DEFAULT_ORDER = PORTFOLIO_SECTIONS.map((section) => section.id);

export const normalizeSectionOrder = (sectionOrder?: string[] | null) => {
  const seen = new Set<string>();
  const ordered = (sectionOrder || [])
    .filter((section) => DEFAULT_ORDER.includes(section as PortfolioSectionId))
    .filter((section) => {
      if (seen.has(section)) return false;
      seen.add(section);
      return true;
    });

  for (const section of DEFAULT_ORDER) {
    if (!seen.has(section)) {
      ordered.push(section);
    }
  }

  return ordered;
};

export const normalizeHiddenSections = (hiddenSections?: string[] | null) => {
  return (hiddenSections || []).filter((section, index, array) => (
    DEFAULT_ORDER.includes(section as PortfolioSectionId) && array.indexOf(section) === index
  ));
};

export const isSectionHidden = (sectionId: string, hiddenSections?: string[] | null) => {
  return normalizeHiddenSections(hiddenSections).includes(sectionId);
};

export const getRenderableSectionIds = (
  sectionOrder: string[] | null | undefined,
  hiddenSections: string[] | null | undefined,
  availableSections: Partial<Record<PortfolioSectionId, boolean>>
) => {
  const normalizedOrder = normalizeSectionOrder(sectionOrder);
  const normalizedHidden = new Set(normalizeHiddenSections(hiddenSections));

  return normalizedOrder.filter((sectionId) => (
    !normalizedHidden.has(sectionId) && Boolean(availableSections[sectionId as PortfolioSectionId])
  ));
};
