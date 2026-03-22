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

  return (
    <div
      onClick={() => onSelect(portfolio.id)}
      className={`relative cursor-pointer rounded-xl border bg-card p-4 shadow-card transition-all ${
        isSelected
          ? "border-primary/60 bg-primary/5 ring-2 ring-primary/30 shadow-[0_18px_45px_-24px_hsl(var(--primary)/0.45)]"
          : portfolio.is_default
            ? "border-primary/30 bg-card/95 opacity-90 ring-1 ring-primary/10 hover:opacity-100"
            : "border-border/70 bg-card/85 opacity-75 hover:border-primary/20 hover:bg-card hover:opacity-100"
      }`}
    >
      <div
        className={`absolute left-0 right-0 top-0 h-1 rounded-t-xl bg-gradient-primary ${
          isSelected ? "opacity-100" : portfolio.is_default ? "opacity-70" : "opacity-20"
        }`}
      />

      <div className="flex items-start justify-between pt-1">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold">{portfolio.name || "Untitled"}</h3>
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
          <p className="mt-1.5 text-xs text-muted-foreground">
            {portfolio.template_id || "minimal"} template
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 h-7 w-7 shrink-0"
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
            <DropdownMenuItem onClick={() => onShare(portfolio.id)}>
              <Share2 className="mr-2 h-3.5 w-3.5" /> Share
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

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          {isSelected ? "Active portfolio" : "Click card to select"}
        </p>
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
  );
};

export default PortfolioCard;
