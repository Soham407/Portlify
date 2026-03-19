import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AI_TONES } from "@/lib/constants";

type AIPolishButtonProps = {
  content: string;
  contentType: "bio" | "project" | "experience";
  onAccept: (polished: string) => void;
};

const AIPolishButton = ({ content, contentType, onAccept }: AIPolishButtonProps) => {
  const { toast } = useToast();
  const [isPolishing, setIsPolishing] = useState(false);
  const [tone, setTone] = useState("formal");
  const [polished, setPolished] = useState<string | null>(null);

  const handlePolish = async () => {
    if (!content.trim()) {
      toast({ title: "Enter some content first", variant: "destructive" });
      return;
    }
    setIsPolishing(true);
    setPolished(null);
    try {
      const { data, error } = await supabase.functions.invoke("polish-content", {
        body: { content, content_type: contentType, tone },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI error", description: data.error, variant: "destructive" });
        return;
      }
      setPolished(data.polished);
    } catch (err: any) {
      toast({ title: "Polish failed", description: err.message, variant: "destructive" });
    } finally {
      setIsPolishing(false);
    }
  };

  if (polished) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
        <p className="text-xs font-medium text-primary">AI Suggestion:</p>
        <p className="text-sm">{polished}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              onAccept(polished);
              setPolished(null);
            }}
          >
            <Check className="mr-1 h-3 w-3" /> Accept
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPolished(null)}>
            <X className="mr-1 h-3 w-3" /> Dismiss
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={tone} onValueChange={setTone}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AI_TONES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        onClick={handlePolish}
        disabled={isPolishing || !content.trim()}
        className="h-8 text-xs"
      >
        {isPolishing ? (
          <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Polishing...</>
        ) : (
          <><Sparkles className="mr-1 h-3 w-3" /> AI Polish</>
        )}
      </Button>
    </div>
  );
};

export default AIPolishButton;
