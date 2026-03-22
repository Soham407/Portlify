import { Link } from "react-router-dom";
import { CheckCheck, Copy, Linkedin, Settings, Share2, Twitter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/integrations/supabase/types";

type PortfolioRecord = Tables<"portfolios"> | null | undefined;

interface SharePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: PortfolioRecord;
  username: string | null | undefined;
  builderHref: string;
  shareUrl: string;
  copied: boolean;
  onCopyLink: (url: string) => Promise<void>;
  onNativeShare: (url: string) => Promise<void>;
}

const SharePortfolioDialog = ({
  open,
  onOpenChange,
  portfolio,
  username,
  builderHref,
  shareUrl,
  copied,
  onCopyLink,
  onNativeShare,
}: SharePortfolioDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Share Portfolio</DialogTitle>
        <DialogDescription>
          {!username && portfolio?.visibility === "public"
            ? "Set a username first to get your public URL."
            : portfolio?.visibility === "private"
              ? "Change visibility to public or unlisted before sharing."
              : portfolio?.visibility === "unlisted"
                ? "Share your secret link with selected people."
                : "Share your public portfolio with the world."}
        </DialogDescription>
      </DialogHeader>
      {(!username && portfolio?.visibility === "public") || portfolio?.visibility === "private" ? (
        <div className="py-2">
          <Button variant="hero" asChild className="w-full">
            <Link
              to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=settings`}
              onClick={() => onOpenChange(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              {!username ? "Set Username in Settings" : "Update Visibility in Settings"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{portfolio?.visibility === "unlisted" ? "Your secret share URL" : "Your public URL"}</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1 text-sm" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => void onCopyLink(shareUrl)}
                disabled={!shareUrl}
              >
                {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {typeof navigator.share !== "undefined" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => void onNativeShare(shareUrl)}
                disabled={!shareUrl}
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out my portfolio!")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="mr-1.5 h-3.5 w-3.5" /> Twitter
              </a>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="mr-1.5 h-3.5 w-3.5" /> LinkedIn
              </a>
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default SharePortfolioDialog;
