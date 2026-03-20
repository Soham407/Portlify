import { useState } from "react";
import { Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AI_ACTIONS, AI_TONES } from "@/lib/constants";

type AIPolishButtonProps = {
  content: string;
  contentType: "bio" | "project" | "experience";
  onAccept: (polished: string) => void;
};

type AIResponse = {
  variants?: { title: string; content: string }[];
  suggestions?: string[];
  missing_details?: string[];
  error?: string;
};

const AIPolishButton = ({ content, contentType, onAccept }: AIPolishButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState("formal");
  const [action, setAction] = useState("rewrite");
  const [result, setResult] = useState<AIResponse | null>(null);

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast({ title: "Enter some content first", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("polish-content", {
        body: {
          content,
          content_type: contentType,
          tone,
          action,
        },
      });

      if (error) {
        throw new Error(
          error.message?.includes("non-2xx")
            ? "The AI writing service is unavailable right now. Please try again shortly."
            : error.message
        );
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error: any) {
      toast({
        title: "AI suggestion failed",
        description: error.message || "We couldn't generate suggestions right now.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="h-9 text-xs md:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_ACTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger className="h-9 text-xs md:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_TONES.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          onClick={handleGenerate}
          disabled={isLoading || !content.trim()}
          className="h-9 text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Thinking...
            </>
          ) : (
            <>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI Assist
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          {(result.variants || []).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Variants</p>
              {(result.variants || []).map((variant, index) => (
                <div key={`${variant.title}-${index}`} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-primary">{variant.title}</p>
                      <p className="mt-1 text-sm text-foreground">{variant.content}</p>
                    </div>
                    <Button size="sm" variant="default" onClick={() => onAccept(variant.content)}>
                      <Check className="mr-1.5 h-3.5 w-3.5" /> Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(result.suggestions || []).length > 0 && (
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Improvement Suggestions</p>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {(result.suggestions || []).map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>- {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {(result.missing_details || []).length > 0 && (
            <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Missing Details to Add</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {(result.missing_details || []).map((detail, index) => (
                  <li key={`${detail}-${index}`}>- {detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPolishButton;
