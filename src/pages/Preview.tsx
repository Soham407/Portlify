import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, LayoutPanelLeft, PenTool, Share2, Copy, CheckCheck, Settings, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionLayoutPicker from "@/components/preview/SectionLayoutPicker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTemplateComponent } from "@/components/templates";
import { useBio } from "@/hooks/useBio";
import { useCertifications } from "@/hooks/useCertifications";
import { useContact } from "@/hooks/useContact";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { DEFAULT_SECTION_ORDER, PORTFOLIO_SECTIONS } from "@/lib/constants";
import { getOrderedCustomSectionIds, isCustomSectionId, normalizeHiddenSections, normalizeSectionOrder } from "@/lib/portfolioSections";
import { PreviewLayoutProvider } from "@/components/preview/PreviewLayoutContext";

const TEMPLATE_NAMES: Record<string, string> = {
  minimal: "Glass",
  developer: "Night Owl",
  creative: "Vibrant",
  corporate: "Editorial",
  photography: "Brutalist",
};

const areSectionListsEqual = (left: string[], right: string[]) => (
  left.length === right.length && left.every((entry, index) => entry === right[index])
);

const Preview = () => {
  const [searchParams] = useSearchParams();
  const portfolioParam = searchParams.get("portfolio") ?? undefined;
  const { portfolio, isLoading: portfolioLoading, updateSectionLayouts, updateSectionControls } = usePortfolio(portfolioParam);
  const { profile } = useProfile();
  const portfolioId = portfolio?.id;
  const templateId = portfolio?.template_id ?? "minimal";
  const dashboardHref = "/dashboard";
  const builderHref = portfolioId ? `/builder?portfolio=${portfolioId}` : "/builder";

  const { bio } = useBio(portfolioId);
  const { projects } = useProjects(portfolioId);
  const { skills } = useSkills(portfolioId);
  const { experiences } = useExperience(portfolioId);
  const { education } = useEducation(portfolioId);
  const { contact } = useContact(portfolioId);
  const { certifications } = useCertifications(portfolioId);
  const { customSections } = useCustomSections(portfolioId);

  const TemplateComponent = getTemplateComponent(templateId);
  const templateName = TEMPLATE_NAMES[templateId] ?? templateId;
  const defaultOrderForReset = normalizeSectionOrder(
    DEFAULT_SECTION_ORDER[(profile?.user_type as keyof typeof DEFAULT_SECTION_ORDER) || "fresher"]
  );

  const [editMode, setEditMode] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, string>>({});
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [notApplicableSections, setNotApplicableSections] = useState<string[]>([]);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [activeDropTargetId, setActiveDropTargetId] = useState<string | null>(null);
  const [isHiddenTrayOpen, setIsHiddenTrayOpen] = useState(false);
  const sectionLayoutSaveRef = useRef<number | null>(null);
  const sectionControlsSaveRef = useRef<number | null>(null);
  const pendingLayoutsRef = useRef<Record<string, string> | null>(null);
  const pendingControlsRef = useRef<{ section_order: string[]; hidden_sections: string[]; not_applicable_sections: string[] } | null>(null);
  const lastSyncedLayoutsRef = useRef<Record<string, string>>({});
  const lastSyncedOrderRef = useRef<string[]>([]);
  const lastSyncedHiddenRef = useRef<string[]>([]);
  const lastSyncedNotApplicableRef = useRef<string[]>([]);
  const sectionOrderRef = useRef<string[]>([]);
  const hiddenSectionsRef = useRef<string[]>([]);
  const notApplicableSectionsRef = useRef<string[]>([]);
  const dragSessionRef = useRef<{
    sectionId: string;
    pointerId: number;
    initialOrder: string[];
  } | null>(null);

  useEffect(() => {
    const nextLayouts = (portfolio?.section_layouts as Record<string, string>) ?? {};
    const customSectionIds = (customSections || []).map((section) => `custom:${section.id}`);
    const nextOrder = normalizeSectionOrder([...(portfolio?.section_order ?? defaultOrderForReset), ...customSectionIds]);
    const nextHidden = normalizeHiddenSections(portfolio?.hidden_sections);
    const nextNotApplicable = (portfolio?.not_applicable_sections as string[] | null) ?? [];

    lastSyncedLayoutsRef.current = nextLayouts;
    lastSyncedOrderRef.current = nextOrder;
    lastSyncedHiddenRef.current = nextHidden;
    lastSyncedNotApplicableRef.current = nextNotApplicable;
    sectionOrderRef.current = nextOrder;
    hiddenSectionsRef.current = nextHidden;
    notApplicableSectionsRef.current = nextNotApplicable;

    setSectionLayouts(nextLayouts);
    setSectionOrder(nextOrder);
    setHiddenSections(nextHidden);
    setNotApplicableSections(nextNotApplicable);
  }, [customSections, defaultOrderForReset, portfolio]);

  const rollbackSectionLayouts = useCallback(() => {
    setSectionLayouts(lastSyncedLayoutsRef.current);
  }, []);

  const rollbackSectionControls = useCallback(() => {
    setSectionOrder(lastSyncedOrderRef.current);
    setHiddenSections(lastSyncedHiddenRef.current);
    setNotApplicableSections(lastSyncedNotApplicableRef.current);
    sectionOrderRef.current = lastSyncedOrderRef.current;
    hiddenSectionsRef.current = lastSyncedHiddenRef.current;
    notApplicableSectionsRef.current = lastSyncedNotApplicableRef.current;
  }, []);

  const executeSectionLayoutsPersist = useCallback((nextLayouts: Record<string, string>) => {
    pendingLayoutsRef.current = null;
    updateSectionLayouts.mutate(nextLayouts, {
      onError: () => {
        rollbackSectionLayouts();
        toast({
          title: "Could not save layout",
          description: "Your last layout change was not saved. We restored the previous version.",
          variant: "destructive",
        });
      },
    });
  }, [rollbackSectionLayouts, updateSectionLayouts]);

  const executeSectionControlsPersist = useCallback((nextOrder: string[], nextHidden: string[], nextNotApplicable: string[]) => {
    pendingControlsRef.current = null;
    updateSectionControls.mutate(
      {
        section_order: nextOrder,
        hidden_sections: nextHidden,
        not_applicable_sections: nextNotApplicable,
      },
      {
        onError: () => {
          rollbackSectionControls();
          toast({
            title: "Could not save section order",
            description: "Your last section change was not saved. We restored the previous version.",
            variant: "destructive",
          });
        },
      }
    );
  }, [rollbackSectionControls, updateSectionControls]);

  const flushPendingSaves = () => {
    if (sectionLayoutSaveRef.current) {
      window.clearTimeout(sectionLayoutSaveRef.current);
      sectionLayoutSaveRef.current = null;
    }

    if (sectionControlsSaveRef.current) {
      window.clearTimeout(sectionControlsSaveRef.current);
      sectionControlsSaveRef.current = null;
    }

    if (pendingLayoutsRef.current) {
      executeSectionLayoutsPersist(pendingLayoutsRef.current);
    }

    if (pendingControlsRef.current) {
      executeSectionControlsPersist(
        pendingControlsRef.current.section_order,
        pendingControlsRef.current.hidden_sections,
        pendingControlsRef.current.not_applicable_sections
      );
    }
  };

  useEffect(() => {
    return () => {
      if (sectionLayoutSaveRef.current) {
        window.clearTimeout(sectionLayoutSaveRef.current);
        sectionLayoutSaveRef.current = null;
      }

      if (sectionControlsSaveRef.current) {
        window.clearTimeout(sectionControlsSaveRef.current);
        sectionControlsSaveRef.current = null;
      }

      if (pendingLayoutsRef.current) {
        executeSectionLayoutsPersist(pendingLayoutsRef.current);
      }

      if (pendingControlsRef.current) {
        executeSectionControlsPersist(
          pendingControlsRef.current.section_order,
          pendingControlsRef.current.hidden_sections,
          pendingControlsRef.current.not_applicable_sections
        );
      }
    };
  }, [executeSectionControlsPersist, executeSectionLayoutsPersist]);

  useEffect(() => {
    if (!editMode) {
      setActiveSidebarSection(null);
      setDraggedSectionId(null);
      setActiveDropTargetId(null);
      dragSessionRef.current = null;
      setIsHiddenTrayOpen(false);
    }
  }, [editMode]);

  useEffect(() => {
    sectionOrderRef.current = sectionOrder;
  }, [sectionOrder]);

  useEffect(() => {
    hiddenSectionsRef.current = hiddenSections;
  }, [hiddenSections]);

  useEffect(() => {
    notApplicableSectionsRef.current = notApplicableSections;
  }, [notApplicableSections]);

  useEffect(() => {
    if (hiddenSections.length === 0) {
      setIsHiddenTrayOpen(false);
    }
  }, [hiddenSections.length]);

  const queueSectionControlsPersist = (nextOrder: string[], nextHidden: string[], nextNotApplicable: string[]) => {
    if (sectionControlsSaveRef.current) {
      window.clearTimeout(sectionControlsSaveRef.current);
    }

    pendingControlsRef.current = {
      section_order: nextOrder,
      hidden_sections: nextHidden,
      not_applicable_sections: nextNotApplicable,
    };

    sectionControlsSaveRef.current = window.setTimeout(() => {
      sectionControlsSaveRef.current = null;
      executeSectionControlsPersist(nextOrder, nextHidden, nextNotApplicable);
    }, 220);
  };

  const queueSectionLayoutsPersist = (nextLayouts: Record<string, string>) => {
    if (sectionLayoutSaveRef.current) {
      window.clearTimeout(sectionLayoutSaveRef.current);
    }

    pendingLayoutsRef.current = nextLayouts;

    sectionLayoutSaveRef.current = window.setTimeout(() => {
      sectionLayoutSaveRef.current = null;
      executeSectionLayoutsPersist(nextLayouts);
    }, 220);
  };

  const persistSectionControls = (nextOrder: string[], nextHidden: string[], nextNotApplicable: string[]) => {
    const normalizedOrder = normalizeSectionOrder(nextOrder);
    setSectionOrder(normalizedOrder);
    setHiddenSections(nextHidden);
    setNotApplicableSections(nextNotApplicable);
    sectionOrderRef.current = normalizedOrder;
    hiddenSectionsRef.current = nextHidden;
    notApplicableSectionsRef.current = nextNotApplicable;
    queueSectionControlsPersist(normalizedOrder, nextHidden, nextNotApplicable);
  };

  const handleMoveSection = (sectionId: string, direction: -1 | 1) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sectionOrder.length) return;

    const nextOrder = [...sectionOrder];
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];
    persistSectionControls(nextOrder, hiddenSections, notApplicableSections);
  };

  const handleToggleHidden = (sectionId: string) => {
    const nextHidden = hiddenSections.includes(sectionId)
      ? hiddenSections.filter((entry) => entry !== sectionId)
      : [...hiddenSections, sectionId];
    const nextNotApplicable = notApplicableSections.filter((entry) => entry !== sectionId);
    if (nextHidden.length > 0) {
      setIsHiddenTrayOpen(true);
    }
    persistSectionControls(sectionOrder, nextHidden, nextNotApplicable);
  };

  const handleRestoreHiddenSection = (sectionId: string) => {
    const nextHidden = hiddenSections.filter((entry) => entry !== sectionId);
    persistSectionControls(sectionOrder, nextHidden, notApplicableSections);
  };

  const handleResetSections = () => {
    const customSectionIds = getOrderedCustomSectionIds(sectionOrder);
    const defaultSectionsWithoutContact = defaultOrderForReset.filter((sectionId) => sectionId !== "contact");
    persistSectionControls([...defaultSectionsWithoutContact, ...customSectionIds, "contact"], [], notApplicableSections);
  };

  const resetDragSession = (options?: { revertOrder?: boolean }) => {
    if (options?.revertOrder && dragSessionRef.current) {
      setSectionOrder(dragSessionRef.current.initialOrder);
      sectionOrderRef.current = dragSessionRef.current.initialOrder;
    }

    dragSessionRef.current = null;
    setDraggedSectionId(null);
    setActiveDropTargetId(null);
  };

  const getSectionIdFromPoint = (clientX: number, clientY: number) => {
    const elements = document.elementsFromPoint(clientX, clientY);

    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue;
      const sectionElement = element.closest<HTMLElement>("[data-preview-section-id]");
      const sectionId = sectionElement?.dataset.previewSectionId;
      if (sectionId) {
        return sectionId;
      }
    }

    return null;
  };

  const handleDragHandleStart = (sectionId: string, pointerId: number) => {
    if (!editMode) return;

    dragSessionRef.current = {
      sectionId,
      pointerId,
      initialOrder: [...sectionOrderRef.current],
    };
    setDraggedSectionId(sectionId);
    setActiveDropTargetId(sectionId);
  };

  const handleDragHandleMove = (pointerId: number, clientX: number, clientY: number) => {
    const activeDrag = dragSessionRef.current;
    if (!activeDrag || activeDrag.pointerId !== pointerId || !draggedSectionId) return;

    const targetSectionId = getSectionIdFromPoint(clientX, clientY);
    if (!targetSectionId || targetSectionId === "bio") {
      setActiveDropTargetId(null);
      return;
    }

    setActiveDropTargetId(targetSectionId);

    if (targetSectionId === draggedSectionId) return;

    const currentOrder = sectionOrderRef.current;
    const fromIndex = currentOrder.indexOf(draggedSectionId);
    const targetIndex = currentOrder.indexOf(targetSectionId);

    if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return;

    const nextOrder = [...currentOrder];
    nextOrder.splice(fromIndex, 1);
    nextOrder.splice(targetIndex, 0, draggedSectionId);

    const normalizedOrder = normalizeSectionOrder(nextOrder);
    if (areSectionListsEqual(normalizedOrder, currentOrder)) return;

    sectionOrderRef.current = normalizedOrder;
    setSectionOrder(normalizedOrder);
  };

  const handleDragHandleEnd = (pointerId: number) => {
    const activeDrag = dragSessionRef.current;
    if (!activeDrag || activeDrag.pointerId !== pointerId) return;

    const shouldPersist = Boolean(
      draggedSectionId && !areSectionListsEqual(activeDrag.initialOrder, sectionOrderRef.current)
    );
    const nextOrder = sectionOrderRef.current;

    resetDragSession();

    if (shouldPersist) {
      persistSectionControls(nextOrder, hiddenSectionsRef.current, notApplicableSectionsRef.current);
    }
  };

  const handleDragHandleCancel = (pointerId: number) => {
    const activeDrag = dragSessionRef.current;
    if (!activeDrag || activeDrag.pointerId !== pointerId) return;
    resetDragSession({ revertOrder: true });
  };

  const hiddenSectionItems = hiddenSections.map((sectionId) => {
    if (isCustomSectionId(sectionId)) {
      const customSection = customSections?.find((section) => `custom:${section.id}` === sectionId);
      return {
        id: sectionId,
        label: customSection?.title?.trim() || "Custom section",
      };
    }

    const builtInSection = PORTFOLIO_SECTIONS.find((section) => section.id === sectionId);
    return {
      id: sectionId,
      label: builtInSection?.label ?? sectionId,
    };
  });

  const shareUrl = portfolio?.visibility === "unlisted"
    ? `${window.location.origin}/share/${portfolio?.share_token}`
    : `${window.location.origin}/p/${profile?.username}${portfolio?.share_token ? `/${portfolio.share_token}` : ""}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  if (portfolioLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="container flex h-12 items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to={dashboardHref} onClick={flushPendingSaves}>
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

  if (portfolioParam && !portfolio) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="container flex h-12 items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to={dashboardHref} onClick={flushPendingSaves}>
                <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-foreground">Preview not available</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This portfolio could not be found, or you no longer have access to it.
            </p>
            <Button className="mt-6" asChild>
              <Link to={dashboardHref}>Return to Dashboard</Link>
            </Button>
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
            <Link to={dashboardHref} onClick={flushPendingSaves}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Preview - {templateName}</Badge>
            <Button size="sm" variant="outline" onClick={() => setIsShareOpen(true)}>
              <Share2 className="mr-2 h-3.5 w-3.5" /> Share
            </Button>
            <Button size="sm" asChild>
              <Link to={builderHref} onClick={flushPendingSaves}>
                <PenTool className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <PreviewLayoutProvider
        value={{
          editMode,
          draggedSectionId,
          activeDropTargetId,
          onDragHandleStart: handleDragHandleStart,
          onDragHandleMove: handleDragHandleMove,
          onDragHandleEnd: handleDragHandleEnd,
          onDragHandleCancel: handleDragHandleCancel,
          onToggleHidden: handleToggleHidden,
        }}
      >
        <div>
          <TemplateComponent
            bio={bio ?? null}
            projects={projects ?? []}
            skills={skills ?? []}
            experiences={experiences ?? []}
            education={education ?? []}
            contact={contact ?? null}
            certifications={certifications ?? []}
            customSections={customSections ?? []}
            sectionLayouts={sectionLayouts}
            sectionOrder={sectionOrder}
            hiddenSections={hiddenSections}
            notApplicableSections={notApplicableSections}
            editMode={editMode}
            onSectionEdit={(section) => setActiveSidebarSection(section)}
          />
        </div>
      </PreviewLayoutProvider>

      {editMode && hiddenSectionItems.length > 0 && (
        <div className="fixed bottom-24 left-6 z-40 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur">
          <button
            type="button"
            onClick={() => setIsHiddenTrayOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Hidden sections</p>
                <p className="text-xs text-muted-foreground">
                  Restore hidden sections without resetting the whole layout.
                </p>
              </div>
            </div>
            {isHiddenTrayOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {isHiddenTrayOpen && (
            <div className="mt-3 space-y-2">
              {hiddenSectionItems.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2"
                >
                  <span className="truncate text-sm font-medium text-foreground">{section.label}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestoreHiddenSection(section.id)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            queueSectionLayoutsPersist(next);
          }}
          onClose={() => setActiveSidebarSection(null)}
        />
      )}

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Portfolio</DialogTitle>
            <DialogDescription>
              {!profile?.username && portfolio?.visibility === "public"
                ? "Set a username first to get your public URL."
                : portfolio?.visibility === "private"
                ? "Change visibility to public or unlisted before sharing."
                : portfolio?.visibility === "unlisted"
                ? "Share your secret link with selected people."
                : "Share your public portfolio with the world."}
            </DialogDescription>
          </DialogHeader>
          {(!profile?.username && portfolio?.visibility === "public") || portfolio?.visibility === "private" ? (
            <Button variant="hero" asChild className="w-full">
              <Link to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=settings`} onClick={() => setIsShareOpen(false)}>
                <Settings className="mr-2 h-4 w-4" />
                {!profile?.username ? "Set Username in Settings" : "Update Visibility in Settings"}
              </Link>
            </Button>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Your share URL</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1 text-sm" />
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {copied ? <CheckCheck className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Preview;
