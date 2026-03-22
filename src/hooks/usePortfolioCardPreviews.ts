import { useQuery } from "@tanstack/react-query";
import type { PortfolioData } from "@/components/templates/PortfolioTemplateProps";
import {
  resolvePortfolioCardPreview,
  type PortfolioCardPreview,
  type PortfolioCardProjectImage,
} from "@/components/dashboard/portfolioCardPreview";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";
import {
  normalizeNotApplicableSections,
  createCustomSectionId,
  normalizeHiddenSections,
  normalizeSectionOrder,
} from "@/lib/portfolioSections";

type PortfolioRecord = Tables<"portfolios">;
type BioRow = Tables<"bio_sections">;
type ProjectRow = Tables<"portfolio_projects">;
type SkillRow = Tables<"skills">;
type ExperienceRow = Tables<"experiences">;
type EducationRow = Tables<"education">;
type ContactRow = Tables<"contact_info">;
type CertificationRow = Tables<"certifications">;
type CustomSectionRow = Tables<"custom_sections">;

const buildPlaceholderPreviews = (portfolios: PortfolioRecord[]) =>
  Object.fromEntries(
    portfolios.map((portfolio) => [portfolio.id, resolvePortfolioCardPreview({ portfolio })])
  ) as Record<string, PortfolioCardPreview>;

const getDefaultSectionOrder = (userType?: string | null) =>
  normalizeSectionOrder(
    DEFAULT_SECTION_ORDER[(userType as keyof typeof DEFAULT_SECTION_ORDER) || "fresher"]
  );

const pushToPortfolioMap = <T,>(
  map: Map<string, T[]>,
  portfolioId: string | null,
  value: T
) => {
  if (!portfolioId) {
    return;
  }

  const currentValues = map.get(portfolioId) ?? [];
  currentValues.push(value);
  map.set(portfolioId, currentValues);
};

const buildTemplateData = ({
  portfolio,
  defaultSectionOrder,
  bioByPortfolio,
  projectsByPortfolio,
  skillsByPortfolio,
  experiencesByPortfolio,
  educationByPortfolio,
  contactByPortfolio,
  certificationsByPortfolio,
  customSectionsByPortfolio,
}: {
  portfolio: PortfolioRecord;
  defaultSectionOrder: string[];
  bioByPortfolio: Map<string, BioRow>;
  projectsByPortfolio: Map<string, ProjectRow[]>;
  skillsByPortfolio: Map<string, SkillRow[]>;
  experiencesByPortfolio: Map<string, ExperienceRow[]>;
  educationByPortfolio: Map<string, EducationRow[]>;
  contactByPortfolio: Map<string, ContactRow>;
  certificationsByPortfolio: Map<string, CertificationRow[]>;
  customSectionsByPortfolio: Map<string, CustomSectionRow[]>;
}): PortfolioData => {
  const customSections = customSectionsByPortfolio.get(portfolio.id) ?? [];
  const customSectionIds = customSections.map((section) => createCustomSectionId(section.id));

  return {
    bio: bioByPortfolio.get(portfolio.id) ?? null,
    projects: (projectsByPortfolio.get(portfolio.id) ?? []).map((project) => ({
      ...project,
      solution: project.solution_approach,
    })),
    skills: (skillsByPortfolio.get(portfolio.id) ?? []).map((skill) => ({
      ...skill,
      category: skill.skill_category,
    })),
    experiences: experiencesByPortfolio.get(portfolio.id) ?? [],
    education: educationByPortfolio.get(portfolio.id) ?? [],
    contact: contactByPortfolio.get(portfolio.id) ?? null,
    certifications: certificationsByPortfolio.get(portfolio.id) ?? [],
    customSections,
    sectionLayouts: (portfolio.section_layouts as Record<string, string>) ?? {},
    sectionOrder: normalizeSectionOrder([
      ...(portfolio.section_order ?? defaultSectionOrder),
      ...customSectionIds,
    ]),
    hiddenSections: normalizeHiddenSections(portfolio.hidden_sections),
    notApplicableSections: normalizeNotApplicableSections(portfolio.not_applicable_sections),
  };
};

export const usePortfolioCardPreviews = (
  portfolios: PortfolioRecord[],
  userType?: string | null
) => {
  const portfolioIds = portfolios.map((portfolio) => portfolio.id);
  const placeholderPreviews = buildPlaceholderPreviews(portfolios);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "portfolio-card-previews", portfolioIds, userType ?? "fresher"],
    enabled: portfolioIds.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const [
        { data: bios, error: bioError },
        { data: projectImages, error: projectError },
        { data: skills, error: skillsError },
        { data: experiences, error: experiencesError },
        { data: education, error: educationError },
        { data: contacts, error: contactsError },
        { data: certifications, error: certificationsError },
        { data: customSections, error: customSectionsError },
      ] = await Promise.all([
        supabase.from("bio_sections").select("*").in("portfolio_id", portfolioIds),
        supabase
          .from("portfolio_projects")
          .select("*")
          .in("portfolio_id", portfolioIds)
          .order("portfolio_id")
          .order("display_order"),
        supabase
          .from("skills")
          .select("*")
          .in("portfolio_id", portfolioIds)
          .order("portfolio_id")
          .order("display_order"),
        supabase
          .from("experiences")
          .select("*")
          .in("portfolio_id", portfolioIds)
          .order("portfolio_id")
          .order("display_order"),
        supabase
          .from("education")
          .select("*")
          .in("portfolio_id", portfolioIds)
          .order("portfolio_id")
          .order("display_order"),
        supabase.from("contact_info").select("*").in("portfolio_id", portfolioIds),
        supabase
          .from("certifications")
          .select("*")
          .in("portfolio_id", portfolioIds)
          .order("portfolio_id")
          .order("display_order"),
        supabase
          .from("custom_sections")
          .select("*")
          .in("portfolio_id", portfolioIds)
          .order("portfolio_id")
          .order("display_order"),
      ]);

      if (bioError) throw bioError;
      if (projectError) throw projectError;
      if (skillsError) throw skillsError;
      if (experiencesError) throw experiencesError;
      if (educationError) throw educationError;
      if (contactsError) throw contactsError;
      if (certificationsError) throw certificationsError;
      if (customSectionsError) throw customSectionsError;

      const bioByPortfolio = new Map<string, BioRow>();
      for (const bio of (bios ?? []) as BioRow[]) {
        bioByPortfolio.set(bio.portfolio_id, bio);
      }

      const contactByPortfolio = new Map<string, ContactRow>();
      for (const contact of (contacts ?? []) as ContactRow[]) {
        contactByPortfolio.set(contact.portfolio_id, contact);
      }

      const projectsByPortfolio = new Map<string, ProjectRow[]>();
      for (const project of (projectImages ?? []) as ProjectRow[]) {
        pushToPortfolioMap(projectsByPortfolio, project.portfolio_id, project);
      }

      const skillsByPortfolio = new Map<string, SkillRow[]>();
      for (const skill of (skills ?? []) as SkillRow[]) {
        pushToPortfolioMap(skillsByPortfolio, skill.portfolio_id, skill);
      }

      const experiencesByPortfolio = new Map<string, ExperienceRow[]>();
      for (const experience of (experiences ?? []) as ExperienceRow[]) {
        pushToPortfolioMap(experiencesByPortfolio, experience.portfolio_id, experience);
      }

      const educationByPortfolio = new Map<string, EducationRow[]>();
      for (const educationEntry of (education ?? []) as EducationRow[]) {
        pushToPortfolioMap(educationByPortfolio, educationEntry.portfolio_id, educationEntry);
      }

      const certificationsByPortfolio = new Map<string, CertificationRow[]>();
      for (const certification of (certifications ?? []) as CertificationRow[]) {
        pushToPortfolioMap(certificationsByPortfolio, certification.portfolio_id, certification);
      }

      const customSectionsByPortfolio = new Map<string, CustomSectionRow[]>();
      for (const customSection of (customSections ?? []) as CustomSectionRow[]) {
        pushToPortfolioMap(customSectionsByPortfolio, customSection.portfolio_id, customSection);
      }

      const defaultSectionOrder = getDefaultSectionOrder(userType);

      return Object.fromEntries(
        portfolios.map((portfolio) => {
          const livePreview = buildTemplateData({
            portfolio,
            defaultSectionOrder,
            bioByPortfolio,
            projectsByPortfolio,
            skillsByPortfolio,
            experiencesByPortfolio,
            educationByPortfolio,
            contactByPortfolio,
            certificationsByPortfolio,
            customSectionsByPortfolio,
          });

          const projectPreviewImages =
            projectsByPortfolio.get(portfolio.id)?.map<PortfolioCardProjectImage>((project) => ({
              image_url: project.image_url,
              display_order: project.display_order,
            })) ?? [];

          return [
            portfolio.id,
            {
              ...resolvePortfolioCardPreview({
                portfolio,
                avatarUrl: bioByPortfolio.get(portfolio.id)?.avatar_url,
                projectImages: projectPreviewImages,
              }),
              livePreview,
            },
          ];
        })
      ) as Record<string, PortfolioCardPreview>;
    },
  });

  return {
    previews: data ?? placeholderPreviews,
    isLoading,
  };
};
