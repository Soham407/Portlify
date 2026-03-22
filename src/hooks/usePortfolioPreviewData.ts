import type { PortfolioData } from "@/components/templates";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";
import {
  normalizeHiddenSections,
  normalizeNotApplicableSections,
  normalizeSectionOrder,
} from "@/lib/portfolioSections";
import { useBio } from "@/hooks/useBio";
import { useCertifications } from "@/hooks/useCertifications";
import { useContact } from "@/hooks/useContact";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProfile } from "@/hooks/useProfile";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";

export const usePortfolioPreviewData = (specificPortfolioId?: string) => {
  const portfolioState = usePortfolio(specificPortfolioId);
  const { portfolio, isLoading: isPortfolioLoading } = portfolioState;
  const { profile, isLoading: isProfileLoading } = useProfile();
  const portfolioId = portfolio?.id;

  const { bio, isLoading: isBioLoading } = useBio(portfolioId);
  const { projects, isLoading: isProjectsLoading } = useProjects(portfolioId);
  const { skills, isLoading: isSkillsLoading } = useSkills(portfolioId);
  const { experiences, isLoading: isExperiencesLoading } = useExperience(portfolioId);
  const { education, isLoading: isEducationLoading } = useEducation(portfolioId);
  const { contact, isLoading: isContactLoading } = useContact(portfolioId);
  const { certifications, isLoading: isCertificationsLoading } = useCertifications(portfolioId);
  const { customSections, isLoading: isCustomSectionsLoading } = useCustomSections(portfolioId);

  const defaultOrderForReset = normalizeSectionOrder(
    DEFAULT_SECTION_ORDER[(profile?.user_type as keyof typeof DEFAULT_SECTION_ORDER) || "fresher"]
  );
  const customSectionIds = customSections.map((section) => `custom:${section.id}`);
  const sectionOrder = normalizeSectionOrder([
    ...(portfolio?.section_order ?? defaultOrderForReset),
    ...customSectionIds,
  ]);
  const hiddenSections = normalizeHiddenSections(portfolio?.hidden_sections);
  const notApplicableSections = normalizeNotApplicableSections(portfolio?.not_applicable_sections);
  const sectionLayouts = (portfolio?.section_layouts as Record<string, string>) ?? {};
  const templateId = portfolio?.template_id ?? "minimal";
  const isSectionDataLoading = Boolean(portfolioId) && [
    isBioLoading,
    isProjectsLoading,
    isSkillsLoading,
    isExperiencesLoading,
    isEducationLoading,
    isContactLoading,
    isCertificationsLoading,
    isCustomSectionsLoading,
  ].some(Boolean);
  const isLoading = isPortfolioLoading || isProfileLoading || isSectionDataLoading;

  const templateData: PortfolioData = {
    bio: bio ?? null,
    projects,
    skills,
    experiences,
    education,
    contact: contact ?? null,
    certifications,
    customSections,
    sectionLayouts,
    sectionOrder,
    hiddenSections,
    notApplicableSections,
  };

  return {
    ...portfolioState,
    profile,
    portfolioId,
    templateId,
    defaultOrderForReset,
    templateData,
    isLoading,
    isPortfolioLoading,
    isProfileLoading,
    isSectionDataLoading,
    isReady: Boolean(portfolioId) && !isLoading,
  };
};
