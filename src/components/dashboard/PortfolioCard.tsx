import { useNavigate } from "react-router-dom";
import {
  Copy,
  Eye,
  Globe,
  Layout,
  Lock,
  MoreVertical,
  PenTool,
  Share2,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import {
  getPortfolioCardTemplateMeta,
  type PortfolioCardPreview,
} from "@/components/dashboard/portfolioCardPreview";
import { getTemplateComponent } from "@/components/templates";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

const portfolioTypeColors: Record<string, string> = {
  general: "bg-secondary text-foreground border-border/70",
  developer: "bg-primary/10 text-primary border-primary/20",
  designer: "bg-accent/20 text-accent-foreground border-accent/25",
  marketing: "bg-muted text-foreground border-border/70",
};

type PortfolioRecord = Tables<"portfolios">;

interface VisibilityOption {
  label: string;
  value: string;
}

interface PortfolioCardProps {
  portfolio: PortfolioRecord;
  preview: PortfolioCardPreview;
  isSelected: boolean;
  viewCount: number;
  canDelete: boolean;
  visibilityOptions: VisibilityOption[];
  onSelect: (portfolioId: string) => void;
  onShare: (portfolioId: string) => void;
  onDuplicate: (portfolioId: string) => void;
  onSetDefault: (portfolioId: string) => void;
  onSetVisibility: (portfolioId: string, visibility: string) => void;
  onDelete: (portfolioId: string) => void;
}

const PortfolioCard = ({
  portfolio,
  preview,
  isSelected,
  viewCount,
  canDelete,
  visibilityOptions,
  onSelect,
  onShare,
  onDuplicate,
  onSetDefault,
  onSetVisibility,
  onDelete,
}: PortfolioCardProps) => {
  const navigate = useNavigate();
  const portfolioName = portfolio.name?.trim() || "Untitled";

  return (
    <div
      onClick={() => onSelect(portfolio.id)}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-300",
        isSelected
          ? "border-primary/60 bg-primary/5 ring-2 ring-primary/30 shadow-[0_18px_45px_-24px_hsl(var(--primary)/0.45)]"
          : portfolio.is_default
            ? "border-primary/30 bg-card/95 opacity-90 ring-1 ring-primary/10 hover:opacity-100"
            : "border-border/70 bg-card/85 opacity-80 hover:border-primary/20 hover:bg-card hover:opacity-100"
      )}
    >
      <div
        className={cn(
          "absolute left-0 right-0 top-0 z-20 h-1 rounded-t-xl bg-gradient-primary",
          isSelected ? "opacity-100" : portfolio.is_default ? "opacity-70" : "opacity-20"
        )}
      />

      <div data-testid="portfolio-card-media" className="group/media relative border-b border-border/60 bg-muted/30">
        <AspectRatio ratio={16 / 9}>
          <PortfolioCardMedia
            portfolio={portfolio}
            portfolioName={portfolioName}
            preview={preview}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/35 via-background/5 to-background/0 opacity-70 transition-opacity duration-300 group-hover/media:opacity-45" />
        </AspectRatio>
      </div>

      <div className="flex flex-col p-4">
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold">{portfolioName}</h3>
              {isSelected && <Badge className="px-1.5 py-0 text-[10px]">Selected</Badge>}
              {portfolio.is_default && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  Default
                </Badge>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                  portfolioTypeColors[portfolio.portfolio_type || "general"] ||
                  "bg-muted text-muted-foreground border-border"
                }`}
              >
                {portfolio.portfolio_type || "general"}
              </span>
              {portfolio.visibility === "unlisted" ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-accent/35 px-1.5 py-0 text-[10px] text-accent-foreground"
                >
                  <Share2 className="h-2.5 w-2.5" /> Unlisted
                </Badge>
              ) : portfolio.visibility === "public" ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/25 px-1.5 py-0 text-[10px] text-primary"
                >
                  <Globe className="h-2.5 w-2.5" /> Public
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px]">
                  <Lock className="h-2.5 w-2.5" /> Private
                </Badge>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{preview.templateName} template</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-7 w-7 shrink-0"
                aria-label={`Actions for ${portfolioName}`}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/builder?portfolio=${portfolio.id}`)}>
                <PenTool className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/preview?portfolio=${portfolio.id}`)}>
                <Eye className="mr-2 h-3.5 w-3.5" /> Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/templates?portfolio=${portfolio.id}`)}>
                <Layout className="mr-2 h-3.5 w-3.5" /> Templates
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Users className="mr-2 h-3.5 w-3.5" /> Profile Views: {isSelected ? viewCount : "Select to view"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDuplicate(portfolio.id)}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              {!portfolio.is_default && (
                <DropdownMenuItem onClick={() => onSetDefault(portfolio.id)}>
                  <Star className="mr-2 h-3.5 w-3.5" /> Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {visibilityOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSetVisibility(portfolio.id, option.value)}
                >
                  {option.value === "public" && <Globe className="mr-2 h-3.5 w-3.5" />}
                  {option.value === "private" && <Lock className="mr-2 h-3.5 w-3.5" />}
                  {option.value === "unlisted" && <Share2 className="mr-2 h-3.5 w-3.5" />}
                  {option.label}
                </DropdownMenuItem>
              ))}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(portfolio.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-muted-foreground">
            {isSelected ? "Active portfolio" : "Click card to select"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              aria-label={`Share ${portfolioName}`}
              onClick={(event) => {
                event.stopPropagation();
                onShare(portfolio.id);
              }}
            >
              <Share2 className="mr-1 h-3 w-3" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/preview?portfolio=${portfolio.id}`);
              }}
            >
              <Eye className="mr-1 h-3 w-3" /> Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PortfolioCardMedia = ({
  portfolio,
  portfolioName,
  preview,
}: {
  portfolio: PortfolioRecord;
  portfolioName: string;
  preview: PortfolioCardPreview;
}) => {
  if (preview.livePreview) {
    return (
      <PortfolioCardLivePreview
        portfolio={portfolio}
        portfolioName={portfolioName}
        templateData={preview.livePreview}
      />
    );
  }

  if (preview.source === "placeholder" || !preview.imageUrl) {
    return (
      <PortfolioCardPlaceholder
        portfolioName={portfolioName}
        templateId={portfolio.template_id}
        templateName={preview.templateName}
      />
    );
  }

  if (preview.source === "avatar") {
    return (
      <div className="relative h-full w-full">
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl transition-transform duration-500 group-hover/media:scale-[1.16]"
          style={{ backgroundImage: `url("${preview.imageUrl}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/5 via-background/15 to-background/50" />
        <img
          src={preview.imageUrl}
          alt={`${portfolioName} preview`}
          className="relative h-full w-full object-contain px-6 py-4 transition-transform duration-500 group-hover/media:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <img
      src={preview.imageUrl}
      alt={`${portfolioName} preview`}
      className="h-full w-full object-cover transition-transform duration-500 group-hover/media:scale-[1.04]"
    />
  );
};

const PortfolioCardPlaceholder = ({
  portfolioName,
  templateId,
  templateName,
}: {
  portfolioName: string;
  templateId?: string | null;
  templateName: string;
}) => {
  const templateMeta = getPortfolioCardTemplateMeta(templateId);
  const initials = portfolioName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div
      role="img"
      aria-label={`${portfolioName} preview placeholder`}
      className={cn("relative h-full w-full overflow-hidden", templateMeta.canvasClass)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%,rgba(0,0,0,0.16))]" />
      <div className="relative flex h-full flex-col p-4">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              templateMeta.badgeClass
            )}
          >
            {templateName}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", templateMeta.accentClass)} />
            <span className={cn("h-2 w-8 rounded-full opacity-70", templateMeta.lineClass)} />
          </div>
        </div>

        <div
          className={cn(
            "mt-4 flex flex-1 flex-col justify-between rounded-[1.15rem] border p-4 backdrop-blur-[2px]",
            templateMeta.panelClass
          )}
        >
          <div>
            <div
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold shadow-lg shadow-black/10",
                templateMeta.accentClass,
                templateId === "corporate" ? "text-white" : "text-zinc-950"
              )}
            >
              {initials || "PF"}
            </div>
            <div className={cn("mt-4 h-3 w-28 rounded-full opacity-90", templateMeta.lineClass)} />
            <div className={cn("mt-2 h-2 w-20 rounded-full opacity-55", templateMeta.lineClass)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className={cn("rounded-xl border p-2.5", templateMeta.panelClass)}>
              <div className={cn("h-2 w-10 rounded-full opacity-70", templateMeta.lineClass)} />
              <div className={cn("mt-2 h-1.5 w-full rounded-full opacity-35", templateMeta.lineClass)} />
            </div>
            <div className={cn("rounded-xl border p-2.5", templateMeta.panelClass)}>
              <div className={cn("h-2 w-12 rounded-full opacity-70", templateMeta.lineClass)} />
              <div className={cn("mt-2 h-1.5 w-3/4 rounded-full opacity-35", templateMeta.lineClass)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LIVE_PREVIEW_SCALE = 0.23;
const LIVE_PREVIEW_WIDTH = `${100 / LIVE_PREVIEW_SCALE}%`;

const PortfolioCardLivePreview = ({
  portfolio,
  portfolioName,
  templateData,
}: {
  portfolio: PortfolioRecord;
  portfolioName: string;
  templateData: NonNullable<PortfolioCardPreview["livePreview"]>;
}) => {
  const TemplateComponent = getTemplateComponent(portfolio.template_id);

  return (
    <div
      role="img"
      aria-label={`${portfolioName} live preview`}
      data-testid="portfolio-card-live-preview"
      className="absolute inset-0 overflow-hidden bg-background"
    >
      <div className="portfolio-card-live-preview absolute inset-0 origin-center transition-transform duration-500 group-hover/media:scale-[1.02]">
        <div
          aria-hidden="true"
          className="origin-top-left pointer-events-none select-none"
          style={{
            width: LIVE_PREVIEW_WIDTH,
            transform: `scale(${LIVE_PREVIEW_SCALE})`,
          }}
        >
          <TemplateComponent {...templateData} />
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
