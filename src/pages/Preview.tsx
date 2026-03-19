import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useBio } from "@/hooks/useBio";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { useExperience } from "@/hooks/useExperience";
import { useEducation } from "@/hooks/useEducation";
import { useContact } from "@/hooks/useContact";
import { useCertifications } from "@/hooks/useCertifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PenTool, LayoutPanelLeft } from "lucide-react";
import { getTemplateComponent } from "@/components/templates";
import SectionLayoutPicker from "@/components/preview/SectionLayoutPicker";

const TEMPLATE_NAMES: Record<string, string> = {
  minimal: "Glass",
  developer: "Night Owl",
  creative: "Vibrant",
  corporate: "Editorial",
  photography: "Brutalist",
};

const Preview = () => {
  const { portfolio, updateSectionLayouts } = usePortfolio();
  const portfolioId = portfolio?.id;
  const templateId = portfolio?.template_id ?? "minimal";

  const { bio } = useBio(portfolioId);
  const { projects } = useProjects(portfolioId);
  const { skills } = useSkills(portfolioId);
  const { experiences } = useExperience(portfolioId);
  const { education } = useEducation(portfolioId);
  const { contact } = useContact(portfolioId);
  const { certifications } = useCertifications(portfolioId);

  const TemplateComponent = getTemplateComponent(templateId);
  const templateName = TEMPLATE_NAMES[templateId] ?? templateId;

  const [editMode, setEditMode] = useState(false);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, string>>({});
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(null);

  useEffect(() => {
    if (portfolio?.section_layouts) {
      setSectionLayouts(portfolio.section_layouts as Record<string, string>);
    }
  }, [portfolio]);

  // When edit mode is turned off, close the sidebar too
  useEffect(() => {
    if (!editMode) {
      setActiveSidebarSection(null);
    }
  }, [editMode]);

  return (
    <div className="min-h-screen bg-background">
      {/* Preview toolbar */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex h-12 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/builder">
                <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Builder
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Preview — {templateName}</Badge>
            <Button size="sm" asChild>
              <Link to="/builder">
                <PenTool className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <TemplateComponent
        bio={bio ?? null}
        projects={projects ?? []}
        skills={skills ?? []}
        experiences={experiences ?? []}
        education={education ?? []}
        contact={contact ?? null}
        certifications={certifications ?? []}
        sectionLayouts={sectionLayouts}
        editMode={editMode}
        onSectionEdit={(section) => setActiveSidebarSection(section)}
      />

      {/* Sticky floating Customize Layout button — bottom right */}
      <button
        onClick={() => {
          setEditMode((v) => {
            if (v) setActiveSidebarSection(null);
            return !v;
          });
        }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95 ${
          editMode
            ? "bg-primary text-primary-foreground"
            : "bg-card text-foreground border border-border hover:bg-accent"
        }`}
      >
        <LayoutPanelLeft className="h-4 w-4" />
        {editMode ? "Done Editing" : "Customize Layout"}
      </button>

      {/* Right sidebar layout picker */}
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
    </div>
  );
};

export default Preview;
