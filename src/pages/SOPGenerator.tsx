import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Sparkles, Copy, Download } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useToast } from "@/hooks/use-toast";
import { AI_TONES } from "@/lib/constants";

const SOPGenerator = () => {
  const { portfolio } = usePortfolio();
  const { toast } = useToast();

  const [purpose, setPurpose] = useState("");
  const [targetProgram, setTargetProgram] = useState("");
  const [tone, setTone] = useState("formal");
  const [sop, setSop] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!portfolio?.id) {
      toast({ title: "No portfolio found", description: "Please create a portfolio first.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setSop("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-sop", {
        body: {
          portfolio_id: portfolio.id,
          purpose,
          target_program: targetProgram,
          tone,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
        return;
      }

      setSop(data.sop || "");
      toast({ title: "SOP generated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sop);
    toast({ title: "Copied to clipboard!" });
  };

  const handleDownload = () => {
    const blob = new Blob([sop], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "statement-of-purpose.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">SOP Generator</span>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Generate Statement of Purpose</h1>
            <p className="text-muted-foreground">AI-powered SOP from your portfolio data — skills, projects, experience, and education.</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>Purpose / Career Goal</Label>
              <Input
                placeholder="e.g. Pursuing MS in Computer Science, applying for a data scientist role..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Program / Institution (optional)</Label>
              <Input
                placeholder="e.g. Stanford University, Google AI Residency..."
                value={targetProgram}
                onChange={(e) => setTargetProgram(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Writing Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AI_TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label} — {t.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="hero"
              onClick={handleGenerate}
              disabled={isGenerating || !portfolio?.id}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate SOP
                </>
              )}
            </Button>
          </div>

          {sop && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Statement of Purpose</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-1 h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                  {sop}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default SOPGenerator;
