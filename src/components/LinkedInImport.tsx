import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Upload, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  parseLinkedInPdf,
  type ParsedCertification,
  type ParsedContact,
  type ParsedEducation,
  type ParsedExperience,
  type ParsedProfile,
} from "@/lib/imports";

type LinkedInImportProps = {
  onImportExperiences: (experiences: ParsedExperience[]) => Promise<void>;
  onImportSkills: (skills: string[]) => Promise<void>;
  onImportEducation: (education: ParsedEducation[]) => Promise<void>;
  onImportCertifications: (certifications: ParsedCertification[]) => Promise<void>;
  onImportContact: (contact: ParsedContact) => Promise<void>;
  onImportBio: (headline: string, summary: string, location?: string) => Promise<void> | void;
};

const LinkedInImport = ({
  onImportExperiences,
  onImportSkills,
  onImportEducation,
  onImportCertifications,
  onImportContact,
  onImportBio,
}: LinkedInImportProps) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsed, setParsed] = useState<ParsedProfile | null>(null);
  const [selectedExps, setSelectedExps] = useState<Set<number>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());
  const [selectedEducation, setSelectedEducation] = useState<Set<number>>(new Set());
  const [selectedCertifications, setSelectedCertifications] = useState<Set<number>>(new Set());
  const [importBio, setImportBio] = useState(true);
  const [importContact, setImportContact] = useState(true);
  const [fileName, setFileName] = useState("");

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Something went wrong while parsing this PDF.";
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
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
      const profile = await parseLinkedInPdf(file);
      setParsed(profile);

      // Select all by default
      setSelectedExps(new Set(profile.experiences.map((_, i) => i)));
      setSelectedSkills(new Set(profile.skills.map((_, i) => i)));
      setSelectedEducation(new Set(profile.education.map((_, i) => i)));
      setSelectedCertifications(new Set(profile.certifications.map((_, i) => i)));
      setImportBio(true);
      setImportContact(true);

      toast({
        title: "LinkedIn data ready",
        description: `${profile.experiences.length} experiences, ${profile.skills.length} skills, ${profile.education.length} education entries, ${profile.certifications.length} certifications`,
      });
    } catch (error: unknown) {
      toast({ title: "Error parsing PDF", description: getErrorMessage(error), variant: "destructive" });
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

  const toggleEducation = (idx: number) => {
    setSelectedEducation((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleCertification = (idx: number) => {
    setSelectedCertifications((prev) => {
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
        await onImportBio(parsed.headline || "", parsed.summary || "", parsed.location || "");
      }

      if (importContact && parsed.contact && Object.values(parsed.contact).some(Boolean)) {
        await onImportContact(parsed.contact);
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

      if (selectedEducation.size > 0) {
        const education = Array.from(selectedEducation).map((i) => parsed.education[i]);
        await onImportEducation(education);
      }

      if (selectedCertifications.size > 0) {
        const certifications = Array.from(selectedCertifications).map((i) => parsed.certifications[i]);
        await onImportCertifications(certifications);
      }

      toast({
        title: "LinkedIn data imported!",
        description: `${selectedExps.size} experiences, ${selectedSkills.size} skills, ${selectedEducation.size} education entries, ${selectedCertifications.size} certifications imported`,
      });
      setParsed(null);
    } catch (error: unknown) {
      toast({ title: "Import error", description: getErrorMessage(error), variant: "destructive" });
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
              {parsed.location && (
                <p className="text-xs text-muted-foreground pl-6">Location: {parsed.location}</p>
              )}
            </div>
          )}

          {parsed.contact && Object.values(parsed.contact).some(Boolean) && (
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={importContact}
                  onChange={(e) => setImportContact(e.target.checked)}
                />
                Import Contact Links
              </label>
              <div className="pl-6 text-xs text-muted-foreground space-y-1">
                {parsed.contact.linkedin_url && <p>LinkedIn: {parsed.contact.linkedin_url}</p>}
                {parsed.contact.website_url && <p>Website: {parsed.contact.website_url}</p>}
                {parsed.contact.email && <p>Email: {parsed.contact.email}</p>}
                {parsed.contact.phone && <p>Phone: {parsed.contact.phone}</p>}
                {parsed.contact.twitter_url && <p>Twitter: {parsed.contact.twitter_url}</p>}
                {parsed.contact.github_url && <p>GitHub: {parsed.contact.github_url}</p>}
              </div>
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

          {parsed.education.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Education ({selectedEducation.size}/{parsed.education.length})</p>
              {parsed.education.map((entry, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleEducation(idx)}
                  className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all ${
                    selectedEducation.has(idx) ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    selectedEducation.has(idx) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                  }`}>
                    {selectedEducation.has(idx) && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{entry.institution}</span>
                    {(entry.degree || entry.field_of_study) && (
                      <span className="text-muted-foreground"> · {[entry.degree, entry.field_of_study].filter(Boolean).join(" in ")}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {parsed.certifications.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Certifications ({selectedCertifications.size}/{parsed.certifications.length})</p>
              {parsed.certifications.map((entry, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleCertification(idx)}
                  className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all ${
                    selectedCertifications.has(idx) ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    selectedCertifications.has(idx) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                  }`}>
                    {selectedCertifications.has(idx) && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{entry.name}</span>
                    {entry.issuer && <span className="text-muted-foreground"> · {entry.issuer}</span>}
                  </div>
                </button>
              ))}
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
