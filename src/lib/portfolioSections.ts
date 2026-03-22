import { PORTFOLIO_SECTIONS } from "@/lib/constants";

export type PortfolioSectionId = (typeof PORTFOLIO_SECTIONS)[number]["id"];

const DEFAULT_ORDER = PORTFOLIO_SECTIONS.map((section) => section.id);
const LOCKED_SECTION_IDS: PortfolioSectionId[] = ["bio"];
const REQUIRED_SECTION_IDS: PortfolioSectionId[] = ["bio"];
const CONTACT_SECTION_ID: PortfolioSectionId = "contact";

export const normalizeSectionOrder = (sectionOrder?: string[] | null) => {
  const seen = new Set<string>();
  const ordered = (sectionOrder || [])
    .filter((section) => DEFAULT_ORDER.includes(section as PortfolioSectionId) || isCustomSectionId(section))
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

  const orderedWithoutContact = ordered.filter((sectionId) => sectionId !== CONTACT_SECTION_ID);
  const locked = LOCKED_SECTION_IDS.filter((sectionId) => orderedWithoutContact.includes(sectionId));
  const unlocked = orderedWithoutContact.filter((sectionId) => !LOCKED_SECTION_IDS.includes(sectionId as PortfolioSectionId));

  return [...locked, ...unlocked, CONTACT_SECTION_ID];
};

export const normalizeHiddenSections = (hiddenSections?: string[] | null) => {
  return (hiddenSections || []).filter((section, index, array) => (
    (DEFAULT_ORDER.includes(section as PortfolioSectionId) || isCustomSectionId(section)) &&
    (!LOCKED_SECTION_IDS.includes(section as PortfolioSectionId) || isCustomSectionId(section)) &&
    array.indexOf(section) === index
  ));
};

export const isLockedSection = (sectionId: string) => {
  return LOCKED_SECTION_IDS.includes(sectionId as PortfolioSectionId);
};

export const isCustomSectionId = (sectionId: string) => sectionId.startsWith("custom:");

export const canSectionBeMarkedNotApplicable = (sectionId: string) => (
  isCustomSectionId(sectionId) || !REQUIRED_SECTION_IDS.includes(sectionId as PortfolioSectionId)
);

export const createCustomSectionId = (id: string) => `custom:${id}`;

export const getOrderedCustomSectionIds = (sectionOrder?: string[] | null) =>
  normalizeSectionOrder(sectionOrder).filter(isCustomSectionId);

export const normalizeNotApplicableSections = (notApplicableSections?: string[] | null) => {
  return (notApplicableSections || []).filter((section, index, array) => (
    (DEFAULT_ORDER.includes(section as PortfolioSectionId) || isCustomSectionId(section)) &&
    canSectionBeMarkedNotApplicable(section) &&
    array.indexOf(section) === index
  ));
};

export const getSectionVisibilityState = (
  sectionId: string,
  hiddenSections?: string[] | null,
  notApplicableSections?: string[] | null
) => {
  const hidden = normalizeHiddenSections(hiddenSections).includes(sectionId);
  const notApplicable = normalizeNotApplicableSections(notApplicableSections).includes(sectionId);
  return {
    hidden,
    notApplicable,
    renderHidden: hidden || notApplicable,
  };
};

export const isSectionHidden = (sectionId: string, hiddenSections?: string[] | null) => {
  return normalizeHiddenSections(hiddenSections).includes(sectionId);
};

export const getRenderableSectionIds = (
  sectionOrder: string[] | null | undefined,
  hiddenSections: string[] | null | undefined,
  availableSections: Record<string, boolean>,
  notApplicableSections?: string[] | null
) => {
  const normalizedOrder = normalizeSectionOrder(sectionOrder);
  const normalizedHidden = new Set(normalizeHiddenSections(hiddenSections));
  const normalizedNotApplicable = new Set(normalizeNotApplicableSections(notApplicableSections));

  return normalizedOrder.filter((sectionId) => (
    !normalizedHidden.has(sectionId) &&
    !normalizedNotApplicable.has(sectionId) &&
    Boolean(availableSections[sectionId])
  ));
};
