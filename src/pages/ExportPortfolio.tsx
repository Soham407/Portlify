import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useBio } from "@/hooks/useBio";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { useExperience } from "@/hooks/useExperience";
import { useEducation } from "@/hooks/useEducation";
import { useContact } from "@/hooks/useContact";
import { useCertifications } from "@/hooks/useCertifications";
import PrintablePortfolio from "@/components/export/PrintablePortfolio";

const ExportPortfolio = () => {
  const { mode } = useParams<{ mode: string }>();
  const [searchParams] = useSearchParams();
  const portfolioParam = searchParams.get("portfolio") ?? undefined;
  const exportMode = mode === "resume" ? "resume" : "portfolio";
  const { portfolio } = usePortfolio(portfolioParam);
  const portfolioId = portfolio?.id;

  const { bio } = useBio(portfolioId);
  const { projects } = useProjects(portfolioId);
  const { skills } = useSkills(portfolioId);
  const { experiences } = useExperience(portfolioId);
  const { education } = useEducation(portfolioId);
  const { contact } = useContact(portfolioId);
  const { certifications } = useCertifications(portfolioId);

  useEffect(() => {
    if (!portfolioId) return;
    const timeout = window.setTimeout(() => {
      window.print();
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [portfolioId, exportMode]);

  if (!portfolioId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PrintablePortfolio
      mode={exportMode}
      name={portfolio?.name}
      bio={bio ?? null}
      projects={projects}
      skills={skills}
      experiences={experiences}
      education={education}
      contact={contact ?? null}
      certifications={certifications}
      sectionOrder={portfolio?.section_order ?? undefined}
      hiddenSections={portfolio?.hidden_sections ?? undefined}
    />
  );
};

export default ExportPortfolio;
