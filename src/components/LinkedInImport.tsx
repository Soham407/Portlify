import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Upload, Loader2, Check, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

type ParsedExperience = {
  company_name: string;
  role_title: string;
  employment_type?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
};

type ParsedProfile = {
  headline?: string;
  summary?: string;
  experiences: ParsedExperience[];
  skills: string[];
};

type LinkedInImportProps = {
  onImportExperiences: (experiences: ParsedExperience[]) => Promise<void>;
  onImportSkills: (skills: string[]) => Promise<void>;
  onImportBio: (headline: string, summary: string) => void;
};

const LinkedInImport = ({ onImportExperiences, onImportSkills, onImportBio }: LinkedInImportProps) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsed, setParsed] = useState<ParsedProfile | null>(null);
  const [selectedExps, setSelectedExps] = useState<Set<number>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());
  const [importBio, setImportBio] = useState(true);
  const [fileName, setFileName] = useState("");

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n\n");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Please upload a PDF file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large (max 5MB)", variant: "destructive" });
      return;
    }

    setFileName(file.name);
    setIsParsing(true);
    setParsed(null);

    try {
      const text = await extractTextFromPdf(file);

      if (text.trim().length < 50) {
        toast({ title: "Could not extract enough text from this PDF", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("parse-linkedin", {
        body: { text },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Parse error", description: data.error, variant: "destructive" });
        return;
      }

      const profile = data.parsed as ParsedProfile;
      setParsed(profile);

      // Select all by default
      setSelectedExps(new Set(profile.experiences.map((_, i) => i)));
      setSelectedSkills(new Set(profile.skills.map((_, i) => i)));
      setImportBio(true);

      toast({ title: `Found ${profile.experiences.length} experiences and ${profile.skills.length} skills` });
    } catch (err: any) {
      toast({ title: "Error parsing PDF", description: err.message, variant: "destructive" });
    } finally {
      setIsParsing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggleExp = (idx: number) => {
    setSelectedExps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSkill = (idx: number) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleImport = async () => {
    if (!parsed) return;
    setIsImporting(true);

    try {
      // Import bio
      if (importBio && (parsed.headline || parsed.summary)) {
        onImportBio(parsed.headline || "", parsed.summary || "");
      }

      // Import experiences
      if (selectedExps.size > 0) {
        const exps = Array.from(selectedExps).map((i) => parsed.experiences[i]);
        await onImportExperiences(exps);
      }

      // Import skills
      if (selectedSkills.size > 0) {
        const skills = Array.from(selectedSkills).map((i) => parsed.skills[i]);
        await onImportSkills(skills);
      }

      toast({
        title: "LinkedIn data imported!",
        description: `${selectedExps.size} experiences, ${selectedSkills.size} skills imported`,
      });
      setParsed(null);
    } catch (err: any) {
      toast({ title: "Import error", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
        <h3 className="text-sm font-semibold">Import from LinkedIn</h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Export your LinkedIn profile as PDF (Profile → More → Save to PDF), then upload it here.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!parsed && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={isParsing}
          className="w-full"
        >
          {isParsing ? (
            <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Parsing {fileName}...</>
          ) : (
            <><Upload className="mr-2 h-3.5 w-3.5" /> Upload LinkedIn PDF</>
          )}
        </Button>
      )}

      {parsed && (
        <div className="space-y-4">
          {/* Bio preview */}
          {(parsed.headline || parsed.summary) && (
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={importBio}
                  onChange={(e) => setImportBio(e.target.checked)}
                />
                Import Bio
              </label>
              {parsed.headline && (
                <p className="text-xs text-muted-foreground pl-6">Headline: {parsed.headline}</p>
              )}
            </div>
          )}

          {/* Experiences */}
          {parsed.experiences.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Experiences ({selectedExps.size}/{parsed.experiences.length})</p>
              {parsed.experiences.map((exp, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleExp(idx)}
                  className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all ${
                    selectedExps.has(idx) ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    selectedExps.has(idx) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                  }`}>
                    {selectedExps.has(idx) && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{exp.role_title}</span>
                    <span className="text-muted-foreground"> at {exp.company_name}</span>
                    {exp.start_date && (
                      <span className="text-muted-foreground"> · {exp.start_date} — {exp.is_current ? "Present" : exp.end_date || ""}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Skills */}
          {parsed.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Skills ({selectedSkills.size}/{parsed.skills.length})</p>
              <div className="flex flex-wrap gap-1">
                {parsed.skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant={selectedSkills.has(idx) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleSkill(idx)}
                  >
                    {skill}
                    {selectedSkills.has(idx) && <X className="ml-1 h-2.5 w-2.5" />}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setParsed(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={isImporting || (selectedExps.size === 0 && selectedSkills.size === 0 && !importBio)}
              className="flex-1"
            >
              {isImporting ? (
                <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Importing...</>
              ) : (
                <>Import Selected</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedInImport;
