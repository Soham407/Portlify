import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Check, Github, Linkedin, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import {
  CAREER_TYPES,
  IMPORT_INTENTS,
  PORTFOLIO_GOALS,
  SKILL_LEVELS,
  STARTER_CONTENT_MODES,
  TEMPLATES,
  USER_TYPES,
  VALIDATION_RULES,
} from "@/lib/constants";
import {
  getStarterBio,
  getStarterExperiences,
  getStarterProjects,
  getStarterSectionOrder,
  getTemplateForGoal,
  type OnboardingForm,
} from "@/lib/onboarding";
import {
  fetchGithubProjects,
  normalizeImportedDate,
  parseLinkedInPdf,
  type GithubProject,
  type ParsedCertification,
  type ParsedContact,
  type ParsedEducation,
  type ParsedProfile,
} from "@/lib/imports";
import { sanitizeArray, sanitizePortfolioData, sanitizeText, sanitizeUrl } from "@/lib/sanitize";

const steps = [
  { id: "identity", title: "Who are you?" },
  { id: "goal", title: "What are you building for?" },
  { id: "setup", title: "How should we start?" },
  { id: "finish", title: "Give it a quick shape" },
] as const;

const stepCopy = [
  {
    eyebrow: "Foundation",
    title: "Tell us where you are right now",
    description: "We will tune your starting sections, tone, and defaults around your current stage.",
  },
  {
    eyebrow: "Goal",
    title: "What should this portfolio help you do?",
    description: "Your goal influences section order, starter messaging, and the recommended visual style.",
  },
  {
    eyebrow: "Starting Point",
    title: "Choose how we set you up",
    description: "Pick the fastest path now. You can still import, edit, and rearrange everything later.",
  },
  {
    eyebrow: "Visual Direction",
    title: "Pick your starting template",
    description: "We still suggest one based on your goal, but you stay in control of the starting look.",
  },
] as const;

const generateShareToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Something went wrong while setting up your portfolio.";
};

const normalizeImportIntent = (value?: string | null) => {
  if (value === "linkedin_pdf" || value === "github" || value === "fetch_upload") {
    return "fetch_upload";
  }
  return "manual";
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const linkedInFileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<OnboardingForm>({
    user_type: "fresher",
    career_type: "",
    skill_level: "intermediate",
    selected_role: "",
    portfolio_goal: "job_hunt",
    preferred_template: "minimal",
    import_intent: "manual",
    starter_content_mode: "prefilled",
  });
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepos, setGithubRepos] = useState<GithubProject[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [linkedInFileName, setLinkedInFileName] = useState("");
  const [isParsingLinkedIn, setIsParsingLinkedIn] = useState(false);
  const [parsedLinkedIn, setParsedLinkedIn] = useState<ParsedProfile | null>(null);
  const [selectedLinkedInExperiences, setSelectedLinkedInExperiences] = useState<Set<number>>(new Set());
  const [selectedLinkedInSkills, setSelectedLinkedInSkills] = useState<Set<number>>(new Set());
  const [selectedLinkedInEducation, setSelectedLinkedInEducation] = useState<Set<number>>(new Set());
  const [selectedLinkedInCertifications, setSelectedLinkedInCertifications] = useState<Set<number>>(new Set());
  const [importLinkedInBio, setImportLinkedInBio] = useState(true);
  const [importLinkedInContact, setImportLinkedInContact] = useState(true);

  useEffect(() => {
    if (profile?.onboarding_completed_at) {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (profile) {
      setForm((current) => ({
        ...current,
        user_type: profile.user_type || current.user_type,
        career_type: profile.career_type || current.career_type,
        skill_level: profile.skill_level || current.skill_level,
        selected_role: profile.selected_role || current.selected_role,
        portfolio_goal: profile.portfolio_goal || current.portfolio_goal,
        preferred_template: profile.preferred_template || current.preferred_template,
        import_intent: normalizeImportIntent(profile.import_intent) || current.import_intent,
        starter_content_mode: profile.starter_content_mode || current.starter_content_mode,
      }));
    }
  }, [navigate, profile]);

  const careers = useMemo(() => {
    return CAREER_TYPES[form.user_type as keyof typeof CAREER_TYPES] || CAREER_TYPES.fresher;
  }, [form.user_type]);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === form.preferred_template) ?? TEMPLATES[0],
    [form.preferred_template],
  );

  if (!user || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const canContinue = () => {
    if (stepIndex === 0) {
      return !!form.user_type && !!form.career_type && !!form.skill_level && !!form.selected_role.trim();
    }
    if (stepIndex === 1) return !!form.portfolio_goal;
    if (stepIndex === 2) return !!form.import_intent && !!form.starter_content_mode;
    return !!form.preferred_template;
  };

  const cardClass = (active: boolean) =>
    `rounded-3xl border p-4 text-left transition-all duration-200 sm:p-5 ${
      active
        ? "border-primary/50 bg-primary/10 shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.55)]"
        : "border-border/80 bg-background/80 hover:border-primary/30 hover:bg-primary/5"
    }`;

  const handleFetchGithub = async () => {
    if (!githubUsername.trim()) return;
    setIsFetchingGithub(true);
    setGithubRepos([]);
    setSelectedRepos(new Set());

    try {
      const projects = await fetchGithubProjects(githubUsername);
      setGithubRepos(projects);

      if (projects.length === 0) {
        toast({ title: "No public repositories found for this username" });
      }
    } catch (error: unknown) {
      toast({ title: "Error fetching repos", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const toggleRepoSelection = (index: number) => {
    setSelectedRepos((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < VALIDATION_RULES.PROJECTS.MAX_COUNT) {
        next.add(index);
      } else {
        toast({ title: `Select up to ${VALIDATION_RULES.PROJECTS.MAX_COUNT} projects`, variant: "destructive" });
      }
      return next;
    });
  };

  const handleLinkedInFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Please upload a PDF file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large (max 5MB)", variant: "destructive" });
      return;
    }

    setLinkedInFileName(file.name);
    setIsParsingLinkedIn(true);
    setParsedLinkedIn(null);

    try {
      const parsedProfile = await parseLinkedInPdf(file);
      const initialSkillSelection = new Set(
        parsedProfile.skills
          .slice(0, VALIDATION_RULES.SKILLS.MAX_COUNT)
          .map((_, index) => index),
      );
      setParsedLinkedIn(parsedProfile);
      setSelectedLinkedInExperiences(new Set(parsedProfile.experiences.map((_, index) => index)));
      setSelectedLinkedInSkills(initialSkillSelection);
      setSelectedLinkedInEducation(new Set(parsedProfile.education.map((_, index) => index)));
      setSelectedLinkedInCertifications(new Set(parsedProfile.certifications.map((_, index) => index)));
      setImportLinkedInBio(true);
      setImportLinkedInContact(true);
      toast({
        title: "LinkedIn data ready",
        description:
          [
            `${parsedProfile.experiences.length} experiences`,
            `${parsedProfile.skills.length} skills`,
            `${parsedProfile.education.length} education entries`,
            `${parsedProfile.certifications.length} certifications`,
            parsedProfile.skills.length > VALIDATION_RULES.SKILLS.MAX_COUNT
              ? `preselected first ${VALIDATION_RULES.SKILLS.MAX_COUNT} skills`
              : "",
          ]
            .filter(Boolean)
            .join(", "),
      });
    } catch (error: unknown) {
      toast({ title: "Error parsing PDF", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsParsingLinkedIn(false);
      if (linkedInFileRef.current) linkedInFileRef.current.value = "";
    }
  };

  const toggleLinkedInExperience = (index: number) => {
    setSelectedLinkedInExperiences((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleLinkedInSkill = (index: number) => {
    setSelectedLinkedInSkills((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else if (next.size < VALIDATION_RULES.SKILLS.MAX_COUNT) next.add(index);
      else toast({ title: `Select up to ${VALIDATION_RULES.SKILLS.MAX_COUNT} skills`, variant: "destructive" });
      return next;
    });
  };

  const toggleLinkedInEducation = (index: number) => {
    setSelectedLinkedInEducation((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleLinkedInCertification = (index: number) => {
    setSelectedLinkedInCertifications((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const hasImportedContact = (contact?: ParsedContact) => !!contact && Object.values(contact).some(Boolean);

  const handleFinish = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const starterOrder = getStarterSectionOrder(form.user_type, form.portfolio_goal);
      const templateId = getTemplateForGoal(form.portfolio_goal, form.preferred_template);
      const starterBio = getStarterBio(form);
      const starterProjects = getStarterProjects(form);
      const starterExperiences = getStarterExperiences(form).map((experience) => ({
        ...experience,
        start_date: experience.start_date || null,
        end_date: experience.end_date || null,
      }));
      const selectedGithubProjects = Array.from(selectedRepos)
        .map((index) => githubRepos[index])
        .filter(Boolean)
        .slice(0, VALIDATION_RULES.PROJECTS.MAX_COUNT);
      const selectedImportedExperiences = parsedLinkedIn
        ? Array.from(selectedLinkedInExperiences).map((index) => parsedLinkedIn.experiences[index]).filter(Boolean)
        : [];
      const selectedImportedSkills = parsedLinkedIn
        ? Array.from(selectedLinkedInSkills)
            .map((index) => parsedLinkedIn.skills[index])
            .filter(Boolean)
            .slice(0, VALIDATION_RULES.SKILLS.MAX_COUNT)
        : [];
      const selectedImportedEducation = parsedLinkedIn
        ? Array.from(selectedLinkedInEducation).map((index) => parsedLinkedIn.education[index]).filter(Boolean)
        : [];
      const selectedImportedCertifications = parsedLinkedIn
        ? Array.from(selectedLinkedInCertifications).map((index) => parsedLinkedIn.certifications[index]).filter(Boolean)
        : [];
      const shouldImportLinkedInBio =
        form.import_intent === "fetch_upload" &&
        importLinkedInBio &&
        !!parsedLinkedIn &&
        !!(parsedLinkedIn.headline || parsedLinkedIn.summary);
      const shouldImportLinkedInContact =
        form.import_intent === "fetch_upload" &&
        importLinkedInContact &&
        hasImportedContact(parsedLinkedIn?.contact);
      const bioToCreate = {
        headline: shouldImportLinkedInBio ? parsedLinkedIn?.headline || starterBio.headline : starterBio.headline,
        bio: shouldImportLinkedInBio ? parsedLinkedIn?.summary || starterBio.bio : starterBio.bio,
        location: shouldImportLinkedInBio ? parsedLinkedIn?.location || profile?.location || "" : profile?.location || "",
      };
      const projectsToCreate =
        selectedGithubProjects.length > 0
          ? selectedGithubProjects.map((project) => ({
              name: project.name,
              problem_statement: project.problem_statement || "",
              solution_approach: project.solution_approach || "",
              technologies: project.technologies || [],
              github_url: project.github_url || "",
              project_url: project.demo_url || "",
            }))
          : starterProjects;
      const experiencesToCreate =
        selectedImportedExperiences.length > 0
          ? selectedImportedExperiences.map((experience) => ({
              company_name: experience.company_name,
              role_title: experience.role_title,
              employment_type: experience.employment_type || "full-time",
              start_date: normalizeImportedDate(experience.start_date) || null,
              end_date: normalizeImportedDate(experience.end_date) || null,
              is_current: experience.is_current || false,
              description: experience.description || "",
            }))
          : starterExperiences;
      const skillsToCreate = sanitizeArray(selectedImportedSkills).slice(0, VALIDATION_RULES.SKILLS.MAX_COUNT);
      const educationToCreate = selectedImportedEducation.map((entry: ParsedEducation) => ({
        institution: sanitizeText(entry.institution).slice(0, 150),
        degree: entry.degree ? sanitizeText(entry.degree).slice(0, 100) : null,
        field_of_study: entry.field_of_study ? sanitizeText(entry.field_of_study).slice(0, 100) : null,
        graduation_year: entry.graduation_year ? sanitizeText(entry.graduation_year).slice(0, 4) : null,
        description: entry.description ? sanitizeText(entry.description).slice(0, 300) : null,
      }));
      const certificationsToCreate = selectedImportedCertifications.map((entry: ParsedCertification) => ({
        name: sanitizeText(entry.name).slice(0, 100),
        issuer: entry.issuer ? sanitizeText(entry.issuer).slice(0, 100) : "",
        issue_date: normalizeImportedDate(entry.issue_date) || null,
        expiry_date: normalizeImportedDate(entry.expiry_date) || null,
        credential_url: entry.credential_url ? sanitizeUrl(entry.credential_url) : null,
        description: entry.description ? sanitizeText(entry.description).slice(0, 300) : null,
      }));
      const sanitizedImportedContact = shouldImportLinkedInContact
        ? sanitizePortfolioData.contact({
            email: parsedLinkedIn?.contact?.email || "",
            phone: parsedLinkedIn?.contact?.phone || "",
            linkedin_url: parsedLinkedIn?.contact?.linkedin_url || "",
            github_url: parsedLinkedIn?.contact?.github_url || "",
            twitter_url: parsedLinkedIn?.contact?.twitter_url || "",
            website_url: parsedLinkedIn?.contact?.website_url || "",
          })
        : null;
      const contactToCreate =
        sanitizedImportedContact && Object.values(sanitizedImportedContact).some(Boolean)
          ? sanitizedImportedContact
          : null;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          user_type: form.user_type,
          career_type: form.career_type,
          skill_level: form.skill_level,
          selected_role: form.selected_role.trim(),
          portfolio_goal: form.portfolio_goal,
          preferred_template: templateId,
          import_intent: form.import_intent,
          starter_content_mode: form.starter_content_mode,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { data: existingPortfolios, error: portfoliosError } = await supabase
        .from("portfolios")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      if (portfoliosError) throw portfoliosError;

      let portfolioId = existingPortfolios?.[0]?.id;
      if (!portfolioId) {
        const { data: portfolio, error: portfolioError } = await supabase
          .from("portfolios")
          .insert({
            user_id: user.id,
            name: "My Portfolio",
            portfolio_type: "general",
            template_id: templateId,
            is_default: true,
            visibility: "private",
            is_public: false,
            share_token: generateShareToken(),
            section_order: starterOrder,
            hidden_sections: [],
          })
          .select()
          .single();
        if (portfolioError) throw portfolioError;
        portfolioId = portfolio.id;
      }

      const { error: portfolioUpdateError } = await supabase
        .from("portfolios")
        .update({
          template_id: templateId,
          section_order: starterOrder,
        })
        .eq("id", portfolioId);
      if (portfolioUpdateError) throw portfolioUpdateError;

      const { data: existingBio, error: existingBioError } = await supabase
        .from("bio_sections")
        .select("id")
        .eq("portfolio_id", portfolioId)
        .maybeSingle();
      if (existingBioError) throw existingBioError;

      if (!existingBio) {
        const names = (profile?.full_name || "").trim().split(/\s+/).filter(Boolean);
        const { error: bioError } = await supabase.from("bio_sections").insert({
          portfolio_id: portfolioId,
          first_name: names[0] || "",
          last_name: names.slice(1).join(" "),
          headline: bioToCreate.headline,
          bio: bioToCreate.bio,
          location: bioToCreate.location,
        });
        if (bioError) throw bioError;
      }

      if (projectsToCreate.length > 0) {
        const { data: existingProjects, error: existingProjectsError } = await supabase
          .from("portfolio_projects")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (existingProjectsError) throw existingProjectsError;

        if (!existingProjects || existingProjects.length === 0) {
          const { error: projectError } = await supabase.from("portfolio_projects").insert(
            projectsToCreate.map((project, index) => ({
              ...sanitizePortfolioData.project(project),
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            })),
          );
          if (projectError) throw projectError;
        }
      }

      if (experiencesToCreate.length > 0) {
        const { data: existingExperiences, error: existingExperiencesError } = await supabase
          .from("experiences")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (existingExperiencesError) throw existingExperiencesError;

        if (!existingExperiences || existingExperiences.length === 0) {
          const { error: experienceError } = await supabase.from("experiences").insert(
            experiencesToCreate.map((experience, index) => ({
              company_name: sanitizeText(experience.company_name).slice(0, 100),
              role_title: sanitizeText(experience.role_title).slice(0, 100),
              employment_type: experience.employment_type,
              start_date: experience.start_date || null,
              end_date: experience.end_date || null,
              description: experience.description ? sanitizeText(experience.description).slice(0, 500) : null,
              is_current: experience.is_current || false,
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            })),
          );
          if (experienceError) throw experienceError;
        }
      }

      if (skillsToCreate.length > 0) {
        const { data: existingSkills, error: existingSkillsError } = await supabase
          .from("skills")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (existingSkillsError) throw existingSkillsError;

        if (!existingSkills || existingSkills.length === 0) {
          const { error: skillsError } = await supabase.from("skills").insert(
            skillsToCreate.map((skill, index) => ({
              skill_name: sanitizeText(skill).slice(0, 50),
              skill_category: "Other",
              skill_type: "learned",
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            })),
          );
          if (skillsError) throw skillsError;
        }
      }

      if (educationToCreate.length > 0) {
        const { data: existingEducation, error: existingEducationError } = await supabase
          .from("education")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (existingEducationError) throw existingEducationError;

        if (!existingEducation || existingEducation.length === 0) {
          const { error: educationError } = await supabase.from("education").insert(
            educationToCreate.map((entry, index) => ({
              ...entry,
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            })),
          );
          if (educationError) throw educationError;
        }
      }

      if (certificationsToCreate.length > 0) {
        const { data: existingCertifications, error: existingCertificationsError } = await supabase
          .from("certifications")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (existingCertificationsError) throw existingCertificationsError;

        if (!existingCertifications || existingCertifications.length === 0) {
          const { error: certificationsError } = await supabase.from("certifications").insert(
            certificationsToCreate.map((entry, index) => ({
              ...entry,
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            })),
          );
          if (certificationsError) throw certificationsError;
        }
      }

      if (contactToCreate) {
        const { data: existingContact, error: existingContactError } = await supabase
          .from("contact_info")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .maybeSingle();
        if (existingContactError) throw existingContactError;

        if (!existingContact) {
          const { error: contactError } = await supabase
            .from("contact_info")
            .insert({ ...contactToCreate, portfolio_id: portfolioId });
          if (contactError) throw contactError;
        }
      }

      toast({ title: "Portfolio setup complete", description: "Your builder is ready with your imported and starter content." });
      navigate(`/builder?portfolio=${portfolioId}`, { replace: true });
    } catch (error: unknown) {
      toast({ title: "Onboarding failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_hsl(var(--primary-glow)/0.16),_transparent_28%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--surface)))]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
        <div className="grid w-full gap-5 xl:grid-cols-[268px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden xl:block">
            <div className="sticky top-6 space-y-4">
              <div className="glass rounded-[30px] p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">PortfolioBuilder</p>
                    <h1 className="mt-1 text-[28px] font-bold leading-[1.1] tracking-tight">Shape your portfolio</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      A fast setup flow that gets you into Builder with a strong starting point.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <span>Progress</span>
                    <span>{stepIndex + 1} of {steps.length}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-primary transition-all duration-300"
                      style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="glass rounded-[30px] p-4 shadow-card">
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const active = index === stepIndex;
                    const done = index < stepIndex;

                    return (
                      <div
                        key={step.id}
                        className={`rounded-2xl border px-3 py-3 transition-all ${
                          active
                            ? "border-primary/35 bg-primary/10 shadow-[0_20px_55px_-40px_hsl(var(--primary)/0.65)]"
                            : done
                              ? "border-emerald-200/80 bg-emerald-50/60"
                              : "border-border/70 bg-background/65"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              done
                                ? "bg-emerald-400 text-slate-950"
                                : active
                                  ? "bg-gradient-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {done ? <Check className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Step {index + 1}</p>
                            <p className="text-sm font-medium leading-5">{step.title}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-primary/15 bg-gradient-hero p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">What this setup gives you</p>
                </div>

                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5">
                    Tailored starter structure for your goal and stage.
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5">
                    Recommended template and section order to edit from.
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5">
                    Optional imported or starter content so Builder feels fast.
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border/70 bg-background/90 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Current template</p>
                  <p className="mt-2 font-semibold">{selectedTemplate.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="glass min-w-0 rounded-[28px] p-4 shadow-card sm:rounded-[32px] sm:p-6 lg:p-8 xl:p-10">
            <div className="mb-6 space-y-4 border-b border-border/70 pb-5 xl:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">PortfolioBuilder</p>
                  <h1 className="text-xl font-bold tracking-tight">Let&apos;s shape your portfolio</h1>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {steps.map((step, index) => {
                  const active = index === stepIndex;
                  const done = index < stepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border p-3 transition-all ${
                        active
                          ? "border-primary/40 bg-primary/10"
                          : "border-border/80 bg-background/70"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            done
                              ? "bg-emerald-400 text-slate-950"
                              : active
                                ? "bg-gradient-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </div>
                        <span className="min-w-0 text-sm font-medium">{step.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex w-full max-w-5xl flex-col"
            >
              <div className="mb-6 grid gap-4 border-b border-border/70 pb-5 sm:mb-8 sm:pb-6 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-end">
                <div>
                  <p className="text-sm font-semibold text-primary">{stepCopy[stepIndex].eyebrow}</p>
                  <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl xl:text-[2.85rem] xl:leading-[1.02]">{stepCopy[stepIndex].title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{stepCopy[stepIndex].description}</p>
                </div>

                <div className="hidden rounded-[24px] border border-border/70 bg-background/70 p-4 xl:block">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Progress</span>
                    <span>{stepIndex + 1}/4</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-primary transition-all duration-300"
                      style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{steps[stepIndex].title}</p>
                </div>
              </div>

              {stepIndex === 0 && (
                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-sm font-medium">User Type</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {USER_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, user_type: type.value }))}
                          className={cardClass(form.user_type === type.value)}
                        >
                          <p className="font-semibold">{type.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium">Career Field</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {careers.map((career) => (
                        <button
                          key={career}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, career_type: career }))}
                          className={cardClass(form.career_type === career)}
                        >
                          <p className="font-semibold">{career}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium">Skill Level</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {SKILL_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, skill_level: level.value }))}
                          className={cardClass(form.skill_level === level.value)}
                        >
                          <p className="font-semibold">{level.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-border/80 bg-background/80 p-5">
                    <label className="mb-2 block text-sm font-medium">Role</label>
                    <Input
                      value={form.selected_role}
                      onChange={(event) => setForm((current) => ({ ...current, selected_role: event.target.value }))}
                      placeholder="e.g. Frontend Developer"
                      maxLength={60}
                      className="h-12 rounded-2xl border-border/80 bg-background/90"
                    />
                  </div>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {PORTFOLIO_GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, portfolio_goal: goal.value }))}
                      className={cardClass(form.portfolio_goal === goal.value)}
                    >
                      <p className="font-semibold">{goal.label}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{goal.description}</p>
                    </button>
                  ))}
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-sm font-medium">Import Intent</p>
                    <div className="grid gap-4">
                      {IMPORT_INTENTS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, import_intent: option.value }))}
                          className={cardClass(form.import_intent === option.value)}
                        >
                          <p className="font-semibold">{option.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.import_intent === "fetch_upload" && (
                    <div className="space-y-5 rounded-[28px] border border-primary/20 bg-primary/5 p-5">
                      <div>
                        <p className="text-sm font-semibold">Bring in real data now</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Importing here is optional, but this is where the choice becomes real. Anything you bring in can still be edited in Builder.
                        </p>
                      </div>

                      <div className="grid gap-5 xl:grid-cols-2">
                        <div className="rounded-3xl border border-border/80 bg-background/90 p-4">
                          <div className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            <p className="font-semibold">Fetch GitHub projects</p>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Pull public repositories now and choose which ones to seed into your portfolio.
                          </p>
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <Input
                              placeholder="GitHub username"
                              value={githubUsername}
                              onChange={(event) => setGithubUsername(event.target.value)}
                              onKeyDown={(event) => event.key === "Enter" && handleFetchGithub()}
                            />
                            <Button type="button" onClick={handleFetchGithub} disabled={isFetchingGithub || !githubUsername.trim()} className="sm:min-w-[96px]">
                              {isFetchingGithub ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                            </Button>
                          </div>

                          {githubRepos.length > 0 && (
                            <div className="mt-4 space-y-3">
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                Selected {selectedRepos.size}/{VALIDATION_RULES.PROJECTS.MAX_COUNT}
                              </p>
                              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                                {githubRepos.map((repo, index) => (
                                  <button
                                    key={`${repo.github_url || repo.name}-${index}`}
                                    type="button"
                                    onClick={() => toggleRepoSelection(index)}
                                    className={`w-full rounded-2xl border p-3 text-left transition-all ${
                                      selectedRepos.has(index)
                                        ? "border-primary bg-primary/10"
                                        : "border-border/80 bg-background hover:border-primary/30"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="font-medium">{repo.name}</p>
                                        {repo.problem_statement && (
                                          <p className="mt-1 text-xs text-muted-foreground">{repo.problem_statement}</p>
                                        )}
                                      </div>
                                      {selectedRepos.has(index) && (
                                        <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                                          Selected
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="rounded-3xl border border-border/80 bg-background/90 p-4">
                          <div className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                            <p className="font-semibold">Upload LinkedIn PDF</p>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Upload your LinkedIn PDF export and choose the bio, experience, and skills you want to keep.
                          </p>

                          <input
                            ref={linkedInFileRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleLinkedInFileSelect}
                            className="hidden"
                          />

                          {!parsedLinkedIn ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-4 w-full"
                              onClick={() => linkedInFileRef.current?.click()}
                              disabled={isParsingLinkedIn}
                            >
                              {isParsingLinkedIn ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Parsing {linkedInFileName}...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload LinkedIn PDF
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="mt-4 space-y-4">
                              {(parsedLinkedIn.headline || parsedLinkedIn.summary) && (
                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <input
                                    type="checkbox"
                                    checked={importLinkedInBio}
                                    onChange={(event) => setImportLinkedInBio(event.target.checked)}
                                  />
                                  Use LinkedIn bio for the starter profile
                                </label>
                              )}
                              {parsedLinkedIn.location && (
                                <p className="text-xs text-muted-foreground">Location: {parsedLinkedIn.location}</p>
                              )}

                              {hasImportedContact(parsedLinkedIn.contact) && (
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                      type="checkbox"
                                      checked={importLinkedInContact}
                                      onChange={(event) => setImportLinkedInContact(event.target.checked)}
                                    />
                                    Import contact links
                                  </label>
                                  <div className="rounded-2xl border border-border/80 bg-background p-3 text-xs text-muted-foreground space-y-1">
                                    {parsedLinkedIn.contact?.linkedin_url && <p>LinkedIn: {parsedLinkedIn.contact.linkedin_url}</p>}
                                    {parsedLinkedIn.contact?.website_url && <p>Website: {parsedLinkedIn.contact.website_url}</p>}
                                    {parsedLinkedIn.contact?.email && <p>Email: {parsedLinkedIn.contact.email}</p>}
                                    {parsedLinkedIn.contact?.phone && <p>Phone: {parsedLinkedIn.contact.phone}</p>}
                                    {parsedLinkedIn.contact?.twitter_url && <p>Twitter: {parsedLinkedIn.contact.twitter_url}</p>}
                                    {parsedLinkedIn.contact?.github_url && <p>GitHub: {parsedLinkedIn.contact.github_url}</p>}
                                  </div>
                                </div>
                              )}

                              {parsedLinkedIn.experiences.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Experiences {selectedLinkedInExperiences.size}/{parsedLinkedIn.experiences.length}
                                  </p>
                                  <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                                    {parsedLinkedIn.experiences.map((experience, index) => (
                                      <button
                                        key={`${experience.company_name}-${experience.role_title}-${index}`}
                                        type="button"
                                        onClick={() => toggleLinkedInExperience(index)}
                                        className={`w-full rounded-2xl border p-3 text-left transition-all ${
                                          selectedLinkedInExperiences.has(index)
                                            ? "border-primary bg-primary/10"
                                            : "border-border/80 bg-background hover:border-primary/30"
                                        }`}
                                      >
                                        <p className="font-medium">{experience.role_title}</p>
                                        <p className="text-xs text-muted-foreground">{experience.company_name}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {parsedLinkedIn.skills.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Skills {selectedLinkedInSkills.size}/{VALIDATION_RULES.SKILLS.MAX_COUNT}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {parsedLinkedIn.skills.map((skill, index) => (
                                      <Badge
                                        key={`${skill}-${index}`}
                                        variant={selectedLinkedInSkills.has(index) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleLinkedInSkill(index)}
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {parsedLinkedIn.education.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Education {selectedLinkedInEducation.size}/{parsedLinkedIn.education.length}
                                  </p>
                                  <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                                    {parsedLinkedIn.education.map((entry, index) => (
                                      <button
                                        key={`${entry.institution}-${entry.degree || ""}-${index}`}
                                        type="button"
                                        onClick={() => toggleLinkedInEducation(index)}
                                        className={`w-full rounded-2xl border p-3 text-left transition-all ${
                                          selectedLinkedInEducation.has(index)
                                            ? "border-primary bg-primary/10"
                                            : "border-border/80 bg-background hover:border-primary/30"
                                        }`}
                                      >
                                        <p className="font-medium">{entry.institution}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {[entry.degree, entry.field_of_study, entry.graduation_year].filter(Boolean).join(" · ")}
                                        </p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {parsedLinkedIn.certifications.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Certifications {selectedLinkedInCertifications.size}/{parsedLinkedIn.certifications.length}
                                  </p>
                                  <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                                    {parsedLinkedIn.certifications.map((entry, index) => (
                                      <button
                                        key={`${entry.name}-${entry.issuer || ""}-${index}`}
                                        type="button"
                                        onClick={() => toggleLinkedInCertification(index)}
                                        className={`w-full rounded-2xl border p-3 text-left transition-all ${
                                          selectedLinkedInCertifications.has(index)
                                            ? "border-primary bg-primary/10"
                                            : "border-border/80 bg-background hover:border-primary/30"
                                        }`}
                                      >
                                        <p className="font-medium">{entry.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {[entry.issuer, entry.issue_date].filter(Boolean).join(" · ")}
                                        </p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <Button type="button" variant="outline" className="w-full" onClick={() => setParsedLinkedIn(null)}>
                                Replace LinkedIn PDF
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-3 text-sm font-medium">Starter Content</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {STARTER_CONTENT_MODES.map((mode) => (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, starter_content_mode: mode.value }))}
                          className={cardClass(form.starter_content_mode === mode.value)}
                        >
                          <p className="font-semibold">{mode.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{mode.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="space-y-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, preferred_template: template.id }))}
                        className={cardClass(form.preferred_template === template.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{template.name}</p>
                          {form.preferred_template === template.id && (
                            <span className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[28px] border border-primary/15 bg-gradient-hero p-5">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">What we&apos;ll create</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          A private starter portfolio with your section order, seeded bio, and starter entries if you chose prefilled mode.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <Button
                  type="button"
                  variant="hero-outline"
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  disabled={stepIndex === 0 || isSaving}
                  className="w-full sm:w-auto"
                >
                  Back
                </Button>

                {stepIndex < steps.length - 1 ? (
                  <Button type="button" variant="hero" onClick={() => setStepIndex((current) => current + 1)} disabled={!canContinue()} className="w-full sm:w-auto">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" variant="hero" onClick={handleFinish} disabled={!canContinue() || isSaving} className="w-full sm:w-auto">
                    {isSaving ? "Creating your portfolio..." : "Finish Setup"}
                  </Button>
                )}
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
