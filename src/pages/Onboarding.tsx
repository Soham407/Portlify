import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Check, Sparkles } from "lucide-react";
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

const generateShareToken = () => (
  Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
);

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

  if (!user || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const canContinue = () => {
    if (stepIndex === 0) return !!form.user_type && !!form.career_type && !!form.skill_level && !!form.selected_role.trim();
    if (stepIndex === 1) return !!form.portfolio_goal;
    if (stepIndex === 2) return !!form.import_intent && !!form.starter_content_mode;
    return !!form.preferred_template;
  };

  const handleFinish = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const starterOrder = getStarterSectionOrder(form.user_type, form.portfolio_goal);
      const templateId = getTemplateForGoal(form.portfolio_goal, form.preferred_template);
      const starterBio = getStarterBio(form);
      const starterProjects = getStarterProjects(form);
      const starterExperiences = getStarterExperiences(form);

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

      const { data: existingBio } = await supabase
        .from("bio_sections")
        .select("id")
        .eq("portfolio_id", portfolioId)
        .maybeSingle();
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
        const { data: existingProjects } = await supabase
          .from("portfolio_projects")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (!existingProjects || existingProjects.length === 0) {
          const { error: projectError } = await supabase.from("portfolio_projects").insert(
            starterProjects.map((project, index) => ({
              ...project,
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            }))
          );
          if (projectError) throw projectError;
        }
      }

      if (starterExperiences.length > 0) {
        const { data: existingExperiences } = await supabase
          .from("experiences")
          .select("id")
          .eq("portfolio_id", portfolioId)
          .limit(1);
        if (!existingExperiences || existingExperiences.length === 0) {
          const { error: experienceError } = await supabase.from("experiences").insert(
            starterExperiences.map((experience, index) => ({
              ...experience,
              portfolio_id: portfolioId,
              user_id: user.id,
              display_order: index,
            }))
          );
          if (experienceError) throw experienceError;
        }
      }

      toast({ title: "Portfolio setup complete", description: "Your builder is ready with the right defaults." });
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast({ title: "Onboarding failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <aside className="relative overflow-hidden bg-slate-950 px-8 py-10 text-slate-50 lg:w-[420px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.2),_transparent_30%)]" />
          <div className="relative">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-300">PortfolioBuilder</p>
                <h1 className="text-2xl font-semibold">Let&apos;s shape your portfolio</h1>
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const active = index === stepIndex;
                const done = index < stepIndex;
                return (
                  <div key={step.id} className={`rounded-2xl border p-4 ${active ? "border-sky-300/40 bg-white/10" : "border-white/10 bg-white/5"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${done ? "bg-emerald-400 text-slate-950" : active ? "bg-sky-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>
                        {done ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
                        <p className="font-medium">{step.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium">What you&apos;ll get</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>Starter structure tailored to your goal</li>
                <li>Recommended template and section order</li>
                <li>Optional placeholder content to edit fast</li>
              </ul>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl rounded-[28px] border border-border bg-card p-8 shadow-card"
          >
            {stepIndex === 0 && (
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-medium text-primary">Foundation</p>
                  <h2 className="mt-2 text-3xl font-semibold">Tell us where you are right now</h2>
                  <p className="mt-2 text-muted-foreground">We&apos;ll use this to prioritize sections and seed a better starting portfolio.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="mb-3 text-sm font-medium">User Type</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {USER_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, user_type: type.value }))}
                          className={`rounded-2xl border p-4 text-left transition-all ${form.user_type === type.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                        >
                          <p className="font-medium">{type.label}</p>
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
                          className={`rounded-2xl border p-4 text-left transition-all ${form.career_type === career ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                        >
                          <p className="font-medium">{career}</p>
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
                          className={`rounded-2xl border p-4 text-left transition-all ${form.skill_level === level.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                        >
                          <p className="font-medium">{level.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Role</label>
                    <Input
                      value={form.selected_role}
                      onChange={(event) => setForm((current) => ({ ...current, selected_role: event.target.value }))}
                      placeholder="e.g. Frontend Developer"
                      maxLength={60}
                    />
                  </div>
                </div>
              </div>
            )}

            {stepIndex === 1 && (
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-medium text-primary">Goal</p>
                  <h2 className="mt-2 text-3xl font-semibold">What should this portfolio help you do?</h2>
                  <p className="mt-2 text-muted-foreground">This affects the default order, messaging, and recommended template.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {PORTFOLIO_GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, portfolio_goal: goal.value }))}
                      className={`rounded-3xl border p-5 text-left transition-all ${form.portfolio_goal === goal.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                    >
                      <p className="font-medium">{goal.label}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{goal.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stepIndex === 2 && (
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-medium text-primary">Starting Point</p>
                  <h2 className="mt-2 text-3xl font-semibold">Choose how we set you up</h2>
                  <p className="mt-2 text-muted-foreground">You can still import or edit everything later in the builder.</p>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium">Import Intent</p>
                  <div className="grid gap-4">
                    {IMPORT_INTENTS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, import_intent: option.value }))}
                        className={`rounded-2xl border p-5 text-left transition-all ${form.import_intent === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                      >
                        <p className="font-medium">{option.label}</p>
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
                        className={`rounded-2xl border p-5 text-left transition-all ${form.starter_content_mode === mode.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                      >
                        <p className="font-medium">{mode.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{mode.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stepIndex === 3 && (
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-medium text-primary">Visual Direction</p>
                  <h2 className="mt-2 text-3xl font-semibold">Pick your starting template</h2>
                  <p className="mt-2 text-muted-foreground">We’ll still recommend one based on your goal, but you can start anywhere.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, preferred_template: template.id }))}
                      className={`rounded-3xl border p-5 text-left transition-all ${form.preferred_template === template.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{template.name}</p>
                        {form.preferred_template === template.id && (
                          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">Selected</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>

                <div className="rounded-3xl border border-border bg-muted/30 p-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">What we’ll create</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        A private starter portfolio with your recommended section order, a seeded bio, and starter entries if you chose prefilled mode.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
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
  );
};

export default Onboarding;
