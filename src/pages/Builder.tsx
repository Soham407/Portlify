import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, Save, Eye, ArrowLeft, Plus, Trash2, X, Github, Loader2, Check,
  Award, User, FolderGit2, Code2, Laptop2, GraduationCap, BadgeCheck, Mail,
  ChevronRight, Settings2, Globe, Lock, CheckCircle2, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LinkedInImport from "@/components/LinkedInImport";
import AvatarUpload from "@/components/builder/AvatarUpload";
import AIPolishButton from "@/components/builder/AIPolishButton";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useBio } from "@/hooks/useBio";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { useExperience } from "@/hooks/useExperience";
import { useEducation } from "@/hooks/useEducation";
import { useContact } from "@/hooks/useContact";
import { useCertifications } from "@/hooks/useCertifications";
import { useToast } from "@/hooks/use-toast";
import { VALIDATION_RULES, EMPLOYMENT_TYPES, PORTFOLIO_TYPES, VISIBILITY_OPTIONS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type ParsedContact } from "@/lib/imports";

type Section = "bio" | "projects" | "skills" | "experience" | "education" | "certifications" | "contact" | "settings";

const sections: { id: Section; label: string; icon: React.ElementType; description: string }[] = [
  { id: "bio", label: "Bio", icon: User, description: "Name, headline & about" },
  { id: "projects", label: "Projects", icon: FolderGit2, description: "Showcase your work" },
  { id: "skills", label: "Skills", icon: Code2, description: "Technical skills" },
  { id: "experience", label: "Experience", icon: Laptop2, description: "Work history" },
  { id: "education", label: "Education", icon: GraduationCap, description: "Academic background" },
  { id: "certifications", label: "Certifications", icon: BadgeCheck, description: "Credentials & awards" },
  { id: "contact", label: "Contact", icon: Mail, description: "How to reach you" },
  { id: "settings", label: "Settings", icon: Settings2, description: "Username & visibility" },
];

const Builder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const requestedPortfolioId = searchParams.get("portfolio") ?? undefined;
  const { portfolio, isLoading: portfolioLoading, createPortfolio, updatePortfolio } = usePortfolio(requestedPortfolioId);
  const portfolioId = portfolio?.id;
  const previewHref = portfolioId ? `/preview?portfolio=${portfolioId}` : "/preview";

  const { bio, saveBio } = useBio(portfolioId);
  const { projects, addProject, updateProject, deleteProject } = useProjects(portfolioId);
  const { skills, addSkill, deleteSkill } = useSkills(portfolioId);
  const { experiences, addExperience, updateExperience, deleteExperience } = useExperience(portfolioId);
  const { education, addEducation, updateEducation, deleteEducation } = useEducation(portfolioId);
  const { contact, saveContact } = useContact(portfolioId);
  const { certifications, addCertification, deleteCertification } = useCertifications(portfolioId);

  const [activeSection, setActiveSection] = useState<Section>(() => {
    const param = searchParams.get("section") as Section | null;
    return param && sections.some((s) => s.id === param) ? param : "bio";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Settings state
  const [usernameValue, setUsernameValue] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [portfolioNameValue, setPortfolioNameValue] = useState("");
  const [portfolioTypeValue, setPortfolioTypeValue] = useState("general");
  const [visibilityValue, setVisibilityValue] = useState("private");
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bioForm, setBioForm] = useState({ first_name: "", last_name: "", headline: "", bio: "", location: "" });
  const [contactForm, setContactForm] = useState({ email: "", phone: "", linkedin_url: "", github_url: "", twitter_url: "", website_url: "" });
  const [newSkill, setNewSkill] = useState("");
  const [projectForm, setProjectForm] = useState({ name: "", problem_statement: "", solution_approach: "", technologies: "", github_url: "", project_url: "" });
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [expForm, setExpForm] = useState({ company_name: "", role_title: "", employment_type: "full-time", start_date: "", end_date: "", description: "", is_current: false });
  const [eduForm, setEduForm] = useState({ institution: "", degree: "", field_of_study: "", graduation_year: "", cgpa: "", description: "" });
  const [certForm, setCertForm] = useState({ name: "", issuer: "", issue_date: "", expiry_date: "", credential_url: "", description: "" });

  useEffect(() => {
    if (bio) {
      setBioForm({
        first_name: bio.first_name || "",
        last_name: bio.last_name || "",
        headline: bio.headline || "",
        bio: bio.bio || "",
        location: bio.location || "",
      });
    }
  }, [bio]);

  useEffect(() => {
    if (contact) {
      setContactForm({
        email: contact.email || "",
        phone: contact.phone || "",
        linkedin_url: contact.linkedin_url || "",
        github_url: contact.github_url || "",
        twitter_url: contact.twitter_url || "",
        website_url: contact.website_url || "",
      });
    }
  }, [contact]);

  useEffect(() => {
    if (!portfolioLoading && !portfolio && user && !requestedPortfolioId) {
      createPortfolio.mutate({});
    }
  }, [portfolioLoading, portfolio, user, requestedPortfolioId]);

  // Initialize settings form from profile
  const { data: profileData } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  useEffect(() => {
    if (profileData) setUsernameValue(profileData.username || "");
  }, [profileData]);

  useEffect(() => {
    if (portfolio) {
      setPortfolioNameValue(portfolio.name || "");
      setPortfolioTypeValue(portfolio.portfolio_type || "general");
      setVisibilityValue((portfolio.visibility as string) || (portfolio.is_public ? "public" : "private"));
    }
  }, [portfolio?.id, portfolio?.name, portfolio?.portfolio_type, portfolio?.visibility, portfolio?.is_public]);

  const checkUsername = useCallback(async (value: string) => {
    if (!value) { setUsernameStatus("idle"); return; }
    if (!VALIDATION_RULES.USERNAME.PATTERN.test(value)) { setUsernameStatus("invalid"); return; }
    if (value.length < VALIDATION_RULES.USERNAME.MIN_LENGTH || value.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
      setUsernameStatus("invalid"); return;
    }
    setUsernameStatus("checking");
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value)
      .neq("id", user!.id)
      .maybeSingle();
    setUsernameStatus(data ? "taken" : "available");
  }, [user]);

  const handleUsernameChange = (value: string) => {
    setUsernameValue(value);
    setUsernameStatus("idle");
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
    usernameDebounceRef.current = setTimeout(() => checkUsername(value), 400);
  };

  const handleSaveSettings = async () => {
    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      toast({ title: "Fix username errors first", variant: "destructive" }); return;
    }
    if (visibilityValue === "public" && !usernameValue.trim()) {
      toast({
        title: "Set a username before making this portfolio public",
        description: "Public portfolios need a username so the public URL can resolve.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username: usernameValue || null })
        .eq("id", user!.id);
      if (profileError) throw profileError;

      await updatePortfolio.mutateAsync({
        name: portfolioNameValue,
        portfolio_type: portfolioTypeValue,
        visibility: visibilityValue,
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      await queryClient.invalidateQueries({ queryKey: ["portfolios-all"] });
      toast({ title: "Settings saved!" });
    } catch (e: any) {
      toast({ title: "Error saving settings", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveBio = () => {
    saveBio.mutate(bioForm, {
      onSuccess: () => toast({ title: "Bio saved!" }),
      onError: (e) => toast({ title: "Error saving bio", description: e.message, variant: "destructive" }),
    });
  };

  const handleSaveContact = () => {
    saveContact.mutate(contactForm, {
      onSuccess: () => toast({ title: "Contact saved!" }),
      onError: (e) => toast({ title: "Error saving contact", description: e.message, variant: "destructive" }),
    });
  };

  const handleAddSkill = () => {
    const parsedSkills = newSkill
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (parsedSkills.length === 0) return;

    if (skills.length >= VALIDATION_RULES.SKILLS.MAX_COUNT) {
      toast({ title: `Max ${VALIDATION_RULES.SKILLS.MAX_COUNT} skills`, variant: "destructive" });
      return;
    }

    const availableSlots = VALIDATION_RULES.SKILLS.MAX_COUNT - skills.length;
    const nextSkills = parsedSkills.slice(0, availableSlots);

    Promise.all(
      nextSkills.map((skillName) =>
        addSkill.mutateAsync({ skill_name: skillName, skill_category: "Custom", skill_type: "learned" })
      )
    )
      .then(() => {
        setNewSkill("");
        toast({
          title: nextSkills.length === 1 ? "Skill added!" : `${nextSkills.length} skills added!`,
        });
      })
      .catch((error: any) => {
        toast({ title: "Error adding skills", description: error.message, variant: "destructive" });
      });
  };

  const handleAddProject = () => {
    if (projects.length >= VALIDATION_RULES.PROJECTS.MAX_COUNT) {
      toast({ title: `Max ${VALIDATION_RULES.PROJECTS.MAX_COUNT} projects`, variant: "destructive" });
      return;
    }
    if (!projectForm.name.trim()) return;
    addProject.mutate({
      ...projectForm,
      technologies: projectForm.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    }, {
      onSuccess: () => {
        setProjectForm({ name: "", problem_statement: "", solution_approach: "", technologies: "", github_url: "", project_url: "" });
        toast({ title: "Project added!" });
      },
    });
  };

  const handleFetchGithub = async () => {
    if (!githubUsername.trim()) return;
    setIsFetchingGithub(true);
    setGithubRepos([]);
    setSelectedRepos(new Set());
    try {
      const { data, error } = await supabase.functions.invoke("sync-github", {
        body: { username: githubUsername.trim() },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "GitHub error", description: data.error, variant: "destructive" });
        return;
      }
      setGithubRepos(data.projects || []);
      if ((data.projects || []).length === 0) {
        toast({ title: "No public repositories found for this username" });
      }
    } catch (err: any) {
      toast({ title: "Error fetching repos", description: err.message, variant: "destructive" });
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const toggleRepoSelection = (index: number) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        const remaining = VALIDATION_RULES.PROJECTS.MAX_COUNT - projects.length;
        if (next.size < remaining) {
          next.add(index);
        } else {
          toast({ title: `You can only select ${remaining} more project(s)`, variant: "destructive" });
        }
      }
      return next;
    });
  };

  const handleImportSelected = async () => {
    const remaining = VALIDATION_RULES.PROJECTS.MAX_COUNT - projects.length;
    const toImport = Array.from(selectedRepos).slice(0, remaining);
    if (toImport.length === 0) return;
    setIsImporting(true);
    try {
      for (const idx of toImport) {
        const repo = githubRepos[idx];
        await addProject.mutateAsync({
          name: repo.name,
          problem_statement: repo.problem_statement || "",
          solution_approach: repo.solution_approach || "",
          technologies: repo.technologies || [],
          github_url: repo.github_url || "",
          project_url: repo.demo_url || "",
        });
      }
      toast({ title: `Imported ${toImport.length} project(s) from GitHub!` });
      setGithubRepos([]);
      setSelectedRepos(new Set());
      setGithubUsername("");
    } catch (err: any) {
      toast({ title: "Import error", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddExperience = () => {
    if (!expForm.company_name.trim() || !expForm.role_title.trim()) return;
    addExperience.mutate(expForm, {
      onSuccess: () => {
        setExpForm({ company_name: "", role_title: "", employment_type: "full-time", start_date: "", end_date: "", description: "", is_current: false });
        toast({ title: "Experience added!" });
      },
    });
  };

  const handleAddEducation = () => {
    if (!eduForm.institution.trim()) return;
    addEducation.mutate(eduForm, {
      onSuccess: () => {
        setEduForm({ institution: "", degree: "", field_of_study: "", graduation_year: "", cgpa: "", description: "" });
        toast({ title: "Education added!" });
      },
    });
  };

  const handleAddCertification = () => {
    if (!certForm.name.trim()) return;
    addCertification.mutate(certForm, {
      onSuccess: () => {
        setCertForm({ name: "", issuer: "", issue_date: "", expiry_date: "", credential_url: "", description: "" });
        toast({ title: "Certification added!" });
      },
    });
  };

  const getSectionCount = (id: Section): number | null => {
    if (id === "projects") return projects.length;
    if (id === "skills") return skills.length;
    if (id === "experience") return experiences.length;
    if (id === "education") return education.length;
    if (id === "certifications") return certifications.length;
    return null;
  };

  const sectionFilled = (id: Section): boolean => {
    if (id === "settings") return false;
    if (id === "bio") return !!(bioForm.first_name || bio?.first_name);
    if (id === "contact") return !!(contactForm.email || contact?.email);
    const count = getSectionCount(id);
    return count !== null && count > 0;
  };

  if (portfolioLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your portfolio…</p>
        </div>
      </div>
    );
  }

  const progressSections = sections.filter((section) => section.id !== "settings");
  const filledCount = progressSections.filter((s) => sectionFilled(s.id)).length;
  const progressPct = Math.round((filledCount / progressSections.length) * 100);
  const ActiveIcon = sections.find((s) => s.id === activeSection)?.icon || User;
  const activeLabel = sections.find((s) => s.id === activeSection)?.label || "";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <Briefcase className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm hidden sm:block">Portfolio Builder</span>
          </div>

          {/* Progress bar — center */}
          <div className="mx-auto hidden max-w-xs flex-1 flex-col gap-1 sm:flex">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filledCount}/{progressSections.length} sections filled</span>
              <span className="font-medium text-foreground">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={previewHref}>
                <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Preview</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — desktop */}
        <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
          <div className="sticky top-14 p-3">
            <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sections</p>
            <nav className="space-y-0.5">
              {sections.map((section) => {
                const count = getSectionCount(section.id);
                const filled = sectionFilled(section.id);
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <section.icon className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium">{section.label}</span>
                        {count !== null && count > 0 && (
                          <span className={`text-[10px] font-semibold rounded-full px-1.5 py-0 ${isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                    {filled && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile section selector */}
          <div className="border-b border-border bg-card px-4 py-2 lg:hidden">
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <ActiveIcon className="h-4 w-4 text-primary" />
                <span className="font-medium">{activeLabel}</span>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${mobileNavOpen ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {mobileNavOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-1 pt-2">
                    {sections.map((section) => {
                      const filled = sectionFilled(section.id);
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => { setActiveSection(section.id); setMobileNavOpen(false); }}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          <section.icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{section.label}</span>
                          {filled && <Check className="ml-auto h-3 w-3 text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mx-auto max-w-2xl p-4 lg:p-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Section header */}
              <div className="mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ActiveIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">{activeLabel}</h1>
                    <p className="text-xs text-muted-foreground">
                      {sections.find((s) => s.id === activeSection)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* BIO */}
              {activeSection === "bio" && (
                <div className="space-y-5">
                  <AvatarUpload
                    currentUrl={bio?.avatar_url}
                    onUpload={(url) => {
                      saveBio.mutate({ ...bioForm, avatar_url: url }, {
                        onSuccess: () => toast({ title: "Avatar saved!" }),
                      });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={bioForm.first_name} onChange={(e) => setBioForm({ ...bioForm, first_name: e.target.value })} maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={bioForm.last_name} onChange={(e) => setBioForm({ ...bioForm, last_name: e.target.value })} maxLength={100} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input value={bioForm.headline} onChange={(e) => setBioForm({ ...bioForm, headline: e.target.value })} placeholder="e.g. Full Stack Developer" maxLength={150} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Bio</Label>
                      <span className="text-xs text-muted-foreground">{bioForm.bio.length}/{VALIDATION_RULES.BIO.MAX_LENGTH}</span>
                    </div>
                    <Textarea value={bioForm.bio} onChange={(e) => setBioForm({ ...bioForm, bio: e.target.value.slice(0, VALIDATION_RULES.BIO.MAX_LENGTH) })} placeholder="Tell recruiters about yourself..." rows={4} />
                    <AIPolishButton
                      content={bioForm.bio}
                      contentType="bio"
                      onAccept={(polished) => setBioForm({ ...bioForm, bio: polished.slice(0, VALIDATION_RULES.BIO.MAX_LENGTH) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={bioForm.location} onChange={(e) => setBioForm({ ...bioForm, location: e.target.value })} placeholder="e.g. San Francisco, CA" maxLength={100} />
                  </div>
                  <Button onClick={handleSaveBio} disabled={saveBio.isPending} variant="hero">
                    <Save className="mr-2 h-4 w-4" /> {saveBio.isPending ? "Saving..." : "Save Bio"}
                  </Button>
                </div>
              )}

              {/* PROJECTS */}
              {activeSection === "projects" && (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{project.problem_statement}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(project.technologies || []).map((tech: string) => (
                              <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 ml-2 text-muted-foreground hover:text-destructive" onClick={() => deleteProject.mutate(project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {projects.length < VALIDATION_RULES.PROJECTS.MAX_COUNT && (
                    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Project
                        <span className="ml-auto text-xs font-normal text-muted-foreground">{projects.length}/{VALIDATION_RULES.PROJECTS.MAX_COUNT}</span>
                      </h3>
                      <Input placeholder="Project name *" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} maxLength={100} />
                      <Textarea placeholder="Problem statement" value={projectForm.problem_statement} onChange={(e) => setProjectForm({ ...projectForm, problem_statement: e.target.value })} rows={2} />
                      <Textarea placeholder="Solution approach" value={projectForm.solution_approach} onChange={(e) => setProjectForm({ ...projectForm, solution_approach: e.target.value })} rows={2} />
                      <Input placeholder="Technologies (comma-separated)" value={projectForm.technologies} onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="GitHub URL" value={projectForm.github_url} onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })} />
                        <Input placeholder="Demo URL" value={projectForm.project_url} onChange={(e) => setProjectForm({ ...projectForm, project_url: e.target.value })} />
                      </div>
                      <Button onClick={handleAddProject} disabled={addProject.isPending} size="sm" variant="hero">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Project
                      </Button>
                    </div>
                  )}

                  {projects.length < VALIDATION_RULES.PROJECTS.MAX_COUNT && (
                    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        <h3 className="text-sm font-semibold">Import from GitHub</h3>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="GitHub username"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleFetchGithub()}
                          className="flex-1"
                        />
                        <Button onClick={handleFetchGithub} size="sm" disabled={isFetchingGithub || !githubUsername.trim()}>
                          {isFetchingGithub ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                        </Button>
                      </div>
                      {githubRepos.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">{VALIDATION_RULES.PROJECTS.MAX_COUNT - projects.length} slots remaining</p>
                          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                            {githubRepos.map((repo, idx) => {
                              const alreadyAdded = projects.some((p) => p.github_url === repo.github_url);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => !alreadyAdded && toggleRepoSelection(idx)}
                                  disabled={alreadyAdded}
                                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                                    alreadyAdded ? "border-border opacity-40 cursor-not-allowed"
                                    : selectedRepos.has(idx) ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                  }`}
                                >
                                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                    alreadyAdded ? "border-muted-foreground/20 bg-muted"
                                    : selectedRepos.has(idx) ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/30"
                                  }`}>
                                    {(alreadyAdded || selectedRepos.has(idx)) && <Check className="h-3 w-3" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{repo.name}</div>
                                    {repo.problem_statement && (
                                      <p className="text-xs text-muted-foreground truncate">{repo.problem_statement}</p>
                                    )}
                                  </div>
                                  {alreadyAdded && <span className="text-[10px] text-muted-foreground italic shrink-0">added</span>}
                                </button>
                              );
                            })}
                          </div>
                          <Button onClick={handleImportSelected} disabled={selectedRepos.size === 0 || isImporting} size="sm" className="w-full" variant="hero">
                            {isImporting ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Importing…</>
                              : <><Plus className="mr-2 h-3.5 w-3.5" /> Import {selectedRepos.size} Selected</>}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SKILLS */}
              {activeSection === "skills" && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold">Skills</h3>
                      <p className="text-xs text-muted-foreground">Add skills as free text.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="gap-1 pr-1">
                          {skill.skill_name}
                          <button onClick={() => deleteSkill.mutate(skill.id)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {skills.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No skills added yet</p>
                      )}
                    </div>
                  </div>

                  {skills.length < VALIDATION_RULES.SKILLS.MAX_COUNT && (
                    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Skill
                        <span className="ml-auto text-xs font-normal text-muted-foreground">{skills.length}/{VALIDATION_RULES.SKILLS.MAX_COUNT}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Type one skill or a comma-separated list like `React, TypeScript, Figma`.
                      </p>
                      <div className="flex gap-2">
                        <Input placeholder="e.g. React, TypeScript, Figma" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="flex-1" maxLength={120} onKeyDown={(e) => e.key === "Enter" && handleAddSkill()} />
                        <Button onClick={handleAddSkill} size="sm" disabled={addSkill.isPending} variant="hero">
                          <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      </div>
                    </div>
                  )}
                  </div>
                )}

              {/* EXPERIENCE */}
              {activeSection === "experience" && (
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{exp.role_title}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company_name} · <span className="capitalize">{exp.employment_type}</span></p>
                          <p className="text-xs text-muted-foreground mt-0.5">{exp.start_date} — {exp.is_current ? "Present" : exp.end_date}</p>
                          {exp.description && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{exp.description}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 ml-2 text-muted-foreground hover:text-destructive" onClick={() => deleteExperience.mutate(exp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add Experience</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Company name *" value={expForm.company_name} onChange={(e) => setExpForm({ ...expForm, company_name: e.target.value })} maxLength={100} />
                      <Input placeholder="Role title *" value={expForm.role_title} onChange={(e) => setExpForm({ ...expForm, role_title: e.target.value })} maxLength={100} />
                    </div>
                    <Select value={expForm.employment_type} onValueChange={(v) => setExpForm({ ...expForm, employment_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Start Date</Label>
                        <Input type="date" value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End Date</Label>
                        <Input type="date" value={expForm.end_date} onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })} disabled={expForm.is_current} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={expForm.is_current} onChange={(e) => setExpForm({ ...expForm, is_current: e.target.checked, end_date: "" })} className="rounded border-border" />
                      Currently working here
                    </label>
                    <Textarea placeholder="Description" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} rows={2} />
                    <Button onClick={handleAddExperience} disabled={addExperience.isPending} size="sm" variant="hero">
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Experience
                    </Button>
                  </div>

                  <LinkedInImport
                    onImportExperiences={async (exps) => {
                      for (const exp of exps) {
                        await addExperience.mutateAsync({
                          company_name: exp.company_name,
                          role_title: exp.role_title,
                          employment_type: exp.employment_type || "full-time",
                          start_date: exp.start_date || "",
                          end_date: exp.end_date || "",
                          is_current: exp.is_current || false,
                          description: exp.description || "",
                        });
                      }
                    }}
                    onImportSkills={async (skillNames) => {
                      let remainingSlots = Math.max(VALIDATION_RULES.SKILLS.MAX_COUNT - skills.length, 0);
                      for (const name of skillNames) {
                        if (remainingSlots > 0) {
                          await addSkill.mutateAsync({ skill_name: name, skill_category: "Other", skill_type: "learned" });
                          remainingSlots -= 1;
                        }
                      }
                    }}
                    onImportEducation={async (entries) => {
                      for (const entry of entries) {
                        await addEducation.mutateAsync({
                          institution: entry.institution,
                          degree: entry.degree || "",
                          field_of_study: entry.field_of_study || "",
                          graduation_year: entry.graduation_year || "",
                          description: entry.description || "",
                        });
                      }
                    }}
                    onImportCertifications={async (entries) => {
                      for (const entry of entries) {
                        await addCertification.mutateAsync({
                          name: entry.name,
                          issuer: entry.issuer || "",
                          issue_date: entry.issue_date || "",
                          expiry_date: entry.expiry_date || "",
                          credential_url: entry.credential_url || "",
                          description: entry.description || "",
                        });
                      }
                    }}
                    onImportContact={async (parsedContact: ParsedContact) => {
                      const mergedContact = {
                        ...contactForm,
                        email: parsedContact.email || contactForm.email,
                        phone: parsedContact.phone || contactForm.phone,
                        linkedin_url: parsedContact.linkedin_url || contactForm.linkedin_url,
                        github_url: parsedContact.github_url || contactForm.github_url,
                        twitter_url: parsedContact.twitter_url || contactForm.twitter_url,
                        website_url: parsedContact.website_url || contactForm.website_url,
                      };
                      setContactForm(mergedContact);
                      await saveContact.mutateAsync(mergedContact);
                    }}
                    onImportBio={async (headline, summary, location) => {
                      const mergedBio = {
                        ...bioForm,
                        headline: headline || bioForm.headline,
                        bio: summary || bioForm.bio,
                        location: location || bioForm.location,
                      };
                      setBioForm(mergedBio);
                      await saveBio.mutateAsync(mergedBio);
                      toast({ title: "Bio updated from LinkedIn", description: "Headline, bio, and location were merged into your profile." });
                    }}
                  />
                </div>
              )}

              {/* EDUCATION */}
              {activeSection === "education" && (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{edu.institution}</h3>
                          <p className="text-sm text-muted-foreground">{edu.degree}{edu.field_of_study && ` in ${edu.field_of_study}`}</p>
                          {edu.graduation_year && <p className="text-xs text-muted-foreground mt-0.5">Class of {edu.graduation_year}</p>}
                          {edu.cgpa && <p className="text-xs text-muted-foreground">CGPA: {edu.cgpa}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 ml-2 text-muted-foreground hover:text-destructive" onClick={() => deleteEducation.mutate(edu.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add Education</h3>
                    <Input placeholder="Institution *" value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} maxLength={150} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Degree" value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} maxLength={100} />
                      <Input placeholder="Field of study" value={eduForm.field_of_study} onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })} maxLength={100} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Graduation year" value={eduForm.graduation_year} onChange={(e) => setEduForm({ ...eduForm, graduation_year: e.target.value })} maxLength={4} />
                      <Input placeholder="CGPA" value={eduForm.cgpa} onChange={(e) => setEduForm({ ...eduForm, cgpa: e.target.value })} maxLength={5} />
                    </div>
                    <Textarea placeholder="Description" value={eduForm.description} onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })} rows={2} />
                    <Button onClick={handleAddEducation} disabled={addEducation.isPending} size="sm" variant="hero">
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Education
                    </Button>
                  </div>
                </div>
              )}

              {/* CERTIFICATIONS */}
              {activeSection === "certifications" && (
                <div className="space-y-4">
                  {certifications.map((cert: any) => (
                    <div key={cert.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary shrink-0" />
                            <h3 className="font-semibold">{cert.name}</h3>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{cert.issuer}</p>
                          {cert.issue_date && <p className="text-xs text-muted-foreground mt-0.5">Issued: {cert.issue_date}</p>}
                          {cert.credential_url && (
                            <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-primary hover:underline inline-flex items-center gap-1">
                              View credential →
                            </a>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 ml-2 text-muted-foreground hover:text-destructive" onClick={() => deleteCertification.mutate(cert.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add Certification</h3>
                    <Input placeholder="Certification name *" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} maxLength={150} />
                    <Input placeholder="Issuer (e.g. AWS, Google)" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} maxLength={100} />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Issue Date</Label>
                        <Input type="date" value={certForm.issue_date} onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Expiry Date</Label>
                        <Input type="date" value={certForm.expiry_date} onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })} />
                      </div>
                    </div>
                    <Input placeholder="Credential URL" value={certForm.credential_url} onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })} />
                    <Textarea placeholder="Description" value={certForm.description} onChange={(e) => setCertForm({ ...certForm, description: e.target.value })} rows={2} />
                    <Button onClick={handleAddCertification} disabled={addCertification.isPending} size="sm" variant="hero">
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Certification
                    </Button>
                  </div>
                </div>
              )}

              {/* CONTACT */}
              {activeSection === "contact" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} maxLength={254} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} maxLength={20} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input value={contactForm.linkedin_url} onChange={(e) => setContactForm({ ...contactForm, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div className="space-y-2">
                      <Label>GitHub</Label>
                      <Input value={contactForm.github_url} onChange={(e) => setContactForm({ ...contactForm, github_url: e.target.value })} placeholder="https://github.com/..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Twitter / X</Label>
                      <Input value={contactForm.twitter_url} onChange={(e) => setContactForm({ ...contactForm, twitter_url: e.target.value })} placeholder="https://x.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input value={contactForm.website_url} onChange={(e) => setContactForm({ ...contactForm, website_url: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <Button onClick={handleSaveContact} disabled={saveContact.isPending} variant="hero">
                    <Save className="mr-2 h-4 w-4" /> {saveContact.isPending ? "Saving..." : "Save Contact"}
                  </Button>
                </div>
              )}

              {/* SETTINGS */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  {/* Username */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold">Username</h3>
                      <p className="text-xs text-muted-foreground">Your public portfolio URL: /p/username</p>
                    </div>
                    <div className="relative">
                      <Input
                        value={usernameValue}
                        onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                        placeholder="e.g. johndoe"
                        maxLength={VALIDATION_RULES.USERNAME.MAX_LENGTH}
                        className="pr-9"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {usernameStatus === "available" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {(usernameStatus === "taken" || usernameStatus === "invalid") && <XCircle className="h-4 w-4 text-destructive" />}
                      </div>
                    </div>
                    {usernameStatus === "taken" && <p className="text-xs text-destructive">Username already taken</p>}
                    {usernameStatus === "invalid" && <p className="text-xs text-destructive">3–30 characters, only a-z 0-9 _ -</p>}
                    {usernameStatus === "available" && <p className="text-xs text-emerald-600">Username is available!</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select value={visibilityValue} onValueChange={setVisibilityValue}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VISIBILITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start gap-3">
                        {visibilityValue === "public"
                          ? <Globe className="mt-0.5 h-4 w-4 text-emerald-600" />
                          : <Lock className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {visibilityValue === "public" ? "Public" : visibilityValue === "unlisted" ? "Unlisted" : "Private"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {visibilityValue === "public" && "Visible on your username URL and ready to share."}
                            {visibilityValue === "unlisted" && "Only people with your secret share link can open this portfolio."}
                            {visibilityValue === "private" && "Only you can access this portfolio right now."}
                          </p>
                          {visibilityValue === "public" && usernameValue && portfolio?.share_token && <p className="text-xs text-muted-foreground">Public URL: /p/{usernameValue}/{portfolio.share_token}</p>}
                          {visibilityValue === "unlisted" && portfolio?.share_token && <p className="text-xs text-muted-foreground">Share URL: /share/{portfolio.share_token}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio name */}
                  <div className="space-y-2">
                    <Label>Portfolio Name</Label>
                    <Input
                      value={portfolioNameValue}
                      onChange={(e) => setPortfolioNameValue(e.target.value)}
                      placeholder="e.g. My Portfolio"
                      maxLength={100}
                    />
                  </div>

                  {/* Portfolio type */}
                  <div className="space-y-2">
                    <Label>Portfolio Type</Label>
                    <Select value={portfolioTypeValue} onValueChange={setPortfolioTypeValue}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PORTFOLIO_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSaveSettings} disabled={updatePortfolio.isPending} variant="hero">
                    <Save className="mr-2 h-4 w-4" /> Save Settings
                  </Button>
                </div>
              )}

              {/* Section navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                {sections.findIndex((s) => s.id === activeSection) > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const idx = sections.findIndex((s) => s.id === activeSection);
                      setActiveSection(sections[idx - 1].id);
                    }}
                  >
                    ← Previous
                  </Button>
                ) : <div />}
                {sections.findIndex((s) => s.id === activeSection) < sections.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const idx = sections.findIndex((s) => s.id === activeSection);
                      setActiveSection(sections[idx + 1].id);
                    }}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Builder;
