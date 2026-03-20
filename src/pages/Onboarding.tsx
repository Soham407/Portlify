import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Check, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/lib/constants";
import {
  getStarterBio,
  getStarterExperiences,
  getStarterProjects,
  getStarterSectionOrder,
  getTemplateForGoal,
  type OnboardingForm,
} from "@/lib/onboarding";

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

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
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
        import_intent: profile.import_intent || current.import_intent,
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
    `rounded-3xl border p-5 text-left transition-all duration-200 ${
      active
        ? "border-primary/50 bg-primary/10 shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.55)]"
        : "border-border/80 bg-background/80 hover:border-primary/30 hover:bg-primary/5"
    }`;

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
          headline: starterBio.headline,
          bio: starterBio.bio,
          location: profile?.location || "",
        });
        if (bioError) throw bioError;
      }

      if (starterProjects.length > 0) {
        const { data: existingProjects, error: existingProjectsError } = await supabase
          .from("portfolio_projects")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (existingProjectsError) throw existingProjectsError;

        if (!existingProjects || existingProjects.length === 0) {
          const { error: projectError } = await supabase.from("portfolio_projects").insert(
            starterProjects.map((project, index) => ({
              ...project,
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            })),
          );
          if (projectError) throw projectError;
        }
      }

      if (starterExperiences.length > 0) {
        const { data: existingExperiences, error: existingExperiencesError } = await supabase
          .from("experiences")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (existingExperiencesError) throw existingExperiencesError;

        if (!existingExperiences || existingExperiences.length === 0) {
          const { error: experienceError } = await supabase.from("experiences").insert(
            starterExperiences.map((experience, index) => ({
              ...experience,
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            })),
          );
          if (experienceError) throw experienceError;
        }
      }

      toast({ title: "Portfolio setup complete", description: "Your builder is ready with the right defaults." });
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      toast({ title: "Onboarding failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_hsl(var(--primary-glow)/0.16),_transparent_28%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--surface)))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="glass rounded-[32px] p-6 shadow-card sm:p-7">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">PortfolioBuilder</p>
                <h1 className="text-2xl font-bold tracking-tight">Let&apos;s shape your portfolio</h1>
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const active = index === stepIndex;
                const done = index < stepIndex;

                return (
                  <div
                    key={step.id}
                    className={`rounded-3xl border p-4 transition-all ${
                      active
                        ? "border-primary/40 bg-primary/10 shadow-[0_20px_60px_-35px_hsl(var(--primary)/0.6)]"
                        : "border-border/80 bg-background/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                          done
                            ? "bg-emerald-400 text-slate-950"
                            : active
                              ? "bg-gradient-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step {index + 1}</p>
                        <p className="font-medium">{step.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-[28px] border border-primary/15 bg-gradient-hero p-5">
              <div className="mb-4 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">What you&apos;ll get</p>
              </div>

              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>Starter structure tailored to your goal</li>
                <li>Recommended template and section order</li>
                <li>Optional placeholder content to edit fast</li>
              </ul>

              <div className="mt-5 rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Current pick</p>
                <p className="mt-2 font-semibold">{selectedTemplate.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
            </div>
          </aside>

          <main className="glass rounded-[32px] p-6 shadow-card sm:p-8 lg:p-10">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex w-full max-w-3xl flex-col"
            >
              <div className="mb-8 flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">{stepCopy[stepIndex].eyebrow}</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{stepCopy[stepIndex].title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{stepCopy[stepIndex].description}</p>
                </div>

                <div className="w-full max-w-[180px]">
                  <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Progress</span>
                    <span>{stepIndex + 1}/4</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-primary transition-all duration-300"
                      style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                    />
                  </div>
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

              <div className="mt-10 flex items-center justify-between gap-4 border-t border-border/70 pt-6">
                <Button
                  type="button"
                  variant="hero-outline"
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  disabled={stepIndex === 0 || isSaving}
                >
                  Back
                </Button>

                {stepIndex < steps.length - 1 ? (
                  <Button type="button" variant="hero" onClick={() => setStepIndex((current) => current + 1)} disabled={!canContinue()}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" variant="hero" onClick={handleFinish} disabled={!canContinue() || isSaving}>
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
