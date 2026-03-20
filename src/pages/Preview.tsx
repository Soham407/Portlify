import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, LayoutPanelLeft, PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionLayoutPicker from "@/components/preview/SectionLayoutPicker";
import SectionManager from "@/components/preview/SectionManager";
import { getTemplateComponent } from "@/components/templates";
import { useBio } from "@/hooks/useBio";
import { useCertifications } from "@/hooks/useCertifications";
import { useContact } from "@/hooks/useContact";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { useProfile } from "@/hooks/useProfile";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";
import { normalizeHiddenSections, normalizeSectionOrder } from "@/lib/portfolioSections";

const TEMPLATE_NAMES: Record<string, string> = {
  minimal: "Glass",
  developer: "Night Owl",
  creative: "Vibrant",
  corporate: "Editorial",
  photography: "Brutalist",
};

const Preview = () => {
  const [searchParams] = useSearchParams();
  const portfolioParam = searchParams.get("portfolio") ?? undefined;
  const { portfolio, isLoading: portfolioLoading, updateSectionLayouts, updateSectionControls } = usePortfolio(portfolioParam);
  const { profile } = useProfile();
  const portfolioId = portfolio?.id;
  const templateId = portfolio?.template_id ?? "minimal";
  const dashboardHref = "/dashboard";
  const builderHref = portfolioId ? `/builder?portfolio=${portfolioId}` : "/builder";
  const exportPortfolioHref = portfolioId ? `/export/portfolio?portfolio=${portfolioId}` : "/export/portfolio";
  const exportResumeHref = portfolioId ? `/export/resume?portfolio=${portfolioId}` : "/export/resume";

  const { bio } = useBio(portfolioId);
  const { projects } = useProjects(portfolioId);
  const { skills } = useSkills(portfolioId);
  const { experiences } = useExperience(portfolioId);
  const { education } = useEducation(portfolioId);
  const { contact } = useContact(portfolioId);
  const { certifications } = useCertifications(portfolioId);

  const TemplateComponent = getTemplateComponent(templateId);
  const templateName = TEMPLATE_NAMES[templateId] ?? templateId;
  const defaultOrderForReset = normalizeSectionOrder(
    DEFAULT_SECTION_ORDER[(profile?.user_type as keyof typeof DEFAULT_SECTION_ORDER) || "fresher"]
  );

  const [editMode, setEditMode] = useState(false);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, string>>({});
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const templateRenderKey = `${templateId}:${JSON.stringify(sectionLayouts)}:${sectionOrder.join(",")}:${hiddenSections.join(",")}`;

  useEffect(() => {
    if (portfolio?.section_layouts) {
      setSectionLayouts(portfolio.section_layouts as Record<string, string>);
    }
    setSectionOrder(normalizeSectionOrder(portfolio?.section_order ?? defaultOrderForReset));
    setHiddenSections(normalizeHiddenSections(portfolio?.hidden_sections));
  }, [defaultOrderForReset, portfolio]);

  useEffect(() => {
    if (!editMode) {
      setActiveSidebarSection(null);
    }
  }, [editMode]);

  const persistSectionControls = (nextOrder: string[], nextHidden: string[]) => {
    setSectionOrder(nextOrder);
    setHiddenSections(nextHidden);
    updateSectionControls.mutate({
      section_order: nextOrder,
      hidden_sections: nextHidden,
    });
  };

  const handleMoveSection = (sectionId: string, direction: -1 | 1) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sectionOrder.length) return;

    const nextOrder = [...sectionOrder];
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];
    persistSectionControls(nextOrder, hiddenSections);
  };

  const handleToggleHidden = (sectionId: string) => {
    const nextHidden = hiddenSections.includes(sectionId)
      ? hiddenSections.filter((entry) => entry !== sectionId)
      : [...hiddenSections, sectionId];
    persistSectionControls(sectionOrder, nextHidden);
  };

  const handleResetSections = () => {
    persistSectionControls(defaultOrderForReset, []);
  };

  if (portfolioLoading || (portfolioParam && !portfolio)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="container flex h-12 items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to={dashboardHref}>
                <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading your portfolio preview...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex h-12 items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to={dashboardHref}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Preview - {templateName}</Badge>
            <Button size="sm" variant="outline" asChild>
              <Link to={exportPortfolioHref} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-3.5 w-3.5" /> Portfolio PDF
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to={exportResumeHref} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-3.5 w-3.5" /> Resume PDF
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={builderHref}>
                <PenTool className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div key={templateRenderKey}>
        <TemplateComponent
          bio={bio ?? null}
          projects={projects ?? []}
          skills={skills ?? []}
          experiences={experiences ?? []}
          education={education ?? []}
          contact={contact ?? null}
          certifications={certifications ?? []}
          sectionLayouts={sectionLayouts}
          sectionOrder={sectionOrder}
          hiddenSections={hiddenSections}
          editMode={editMode}
          onSectionEdit={(section) => setActiveSidebarSection(section)}
        />
      </div>

      <button
        onClick={() => {
          setEditMode((current) => {
            if (current) setActiveSidebarSection(null);
            return !current;
          });
        }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95 ${
          editMode
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card text-foreground hover:bg-accent"
        }`}
      >
        <LayoutPanelLeft className="h-4 w-4" />
        {editMode ? "Done Editing" : "Customize Layout"}
      </button>

      {activeSidebarSection && (
        <SectionLayoutPicker
          section={activeSidebarSection}
          current={sectionLayouts[activeSidebarSection]}
          onSelect={(layoutId) => {
            const next = { ...sectionLayouts, [activeSidebarSection]: layoutId };
            setSectionLayouts(next);
            updateSectionLayouts.mutate(next);
          }}
          onClose={() => setActiveSidebarSection(null)}
        />
      )}

      {editMode && (
        <div className="fixed left-6 top-20 z-40 hidden w-[340px] xl:block">
          <SectionManager
            order={sectionOrder}
            hiddenSections={hiddenSections}
            onMove={handleMoveSection}
            onToggleHidden={handleToggleHidden}
            onReset={handleResetSections}
          />
        </div>
      )}
    </div>
  );
};

export default Preview;
