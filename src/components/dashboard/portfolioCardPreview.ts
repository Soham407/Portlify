import type { Tables } from "@/integrations/supabase/types";
import type { PortfolioData } from "@/components/templates/PortfolioTemplateProps";

type PortfolioRecord = Tables<"portfolios">;

export type PortfolioCardPreviewSource = "project" | "avatar" | "placeholder";

export interface PortfolioCardPreview {
  imageUrl?: string;
  source: PortfolioCardPreviewSource;
  templateName: string;
  livePreview?: PortfolioData;
}

export interface PortfolioCardProjectImage {
  image_url: string | null;
  display_order: number | null;
}

export interface PortfolioCardTemplateMeta {
  name: string;
  canvasClass: string;
  badgeClass: string;
  accentClass: string;
  panelClass: string;
  lineClass: string;
}

const DEFAULT_TEMPLATE_ID = "minimal";

const TEMPLATE_PREVIEW_META: Record<string, PortfolioCardTemplateMeta> = {
  minimal: {
    name: "Glass",
    canvasClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-violet-900 text-white",
    badgeClass: "border-white/20 bg-white/10 text-white/90",
    accentClass: "bg-violet-300/85",
    panelClass: "border-white/15 bg-white/8",
    lineClass: "bg-white/65",
  },
  developer: {
    name: "Night Owl",
    canvasClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 text-white",
    badgeClass: "border-teal-300/25 bg-teal-300/10 text-teal-100",
    accentClass: "bg-teal-300/90",
    panelClass: "border-teal-200/18 bg-slate-950/35",
    lineClass: "bg-teal-100/80",
  },
  creative: {
    name: "Vibrant",
    canvasClass: "bg-gradient-to-br from-zinc-950 via-orange-950 to-amber-500 text-white",
    badgeClass: "border-amber-200/35 bg-amber-100/10 text-amber-50",
    accentClass: "bg-lime-300/95",
    panelClass: "border-white/12 bg-black/18",
    lineClass: "bg-amber-50/85",
  },
  corporate: {
    name: "Editorial",
    canvasClass: "bg-gradient-to-br from-stone-50 via-emerald-50 to-stone-200 text-stone-900",
    badgeClass: "border-emerald-700/15 bg-white/75 text-emerald-900",
    accentClass: "bg-emerald-600/90",
    panelClass: "border-stone-300/80 bg-white/60",
    lineClass: "bg-stone-700/75",
  },
  photography: {
    name: "Brutalist",
    canvasClass: "bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 text-white",
    badgeClass: "border-white/20 bg-white/8 text-white/90",
    accentClass: "bg-white/95",
    panelClass: "border-white/12 bg-black/15",
    lineClass: "bg-white/80",
  },
};

const normalizeMediaUrl = (value?: string | null) => {
  const nextValue = value?.trim();
  return nextValue ? nextValue : undefined;
};

export const getPortfolioCardTemplateMeta = (templateId?: string | null): PortfolioCardTemplateMeta =>
  TEMPLATE_PREVIEW_META[templateId || DEFAULT_TEMPLATE_ID] ?? TEMPLATE_PREVIEW_META[DEFAULT_TEMPLATE_ID];

export const resolvePortfolioCardPreview = ({
  portfolio,
  avatarUrl,
  projectImages = [],
}: {
  portfolio: PortfolioRecord;
  avatarUrl?: string | null;
  projectImages?: PortfolioCardProjectImage[];
}): PortfolioCardPreview => {
  const templateName = getPortfolioCardTemplateMeta(portfolio.template_id).name;
  const firstProjectImage = [...projectImages]
    .sort(
      (left, right) =>
        (left.display_order ?? Number.MAX_SAFE_INTEGER) -
        (right.display_order ?? Number.MAX_SAFE_INTEGER)
    )
    .map((project) => normalizeMediaUrl(project.image_url))
    .find(Boolean);

  if (firstProjectImage) {
    return {
      imageUrl: firstProjectImage,
      source: "project",
      templateName,
    };
  }

  const normalizedAvatarUrl = normalizeMediaUrl(avatarUrl);
  if (normalizedAvatarUrl) {
    return {
      imageUrl: normalizedAvatarUrl,
      source: "avatar",
      templateName,
    };
  }

  return {
    source: "placeholder",
    templateName,
  };
};
