import { motion } from "framer-motion";
import { MessageSquareHeart, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

const currentFeatureOptions = [
  "AI Content Polish",
  "GitHub Integration",
  "Premium Templates",
  "Live Preview",
  "Profile Views",
  "Public Portfolio Pages",
  "Unlisted Review Links",
  "Guided Builder",
  "Enterprise Security",
];

const personaOptions = [
  "Student",
  "Developer",
  "Designer",
  "Job Seeker",
  "Freelancer",
  "Founder",
  "Recruiter",
  "Other",
];

const focusAreas = [
  "What made you want to keep exploring?",
  "What felt weakest, confusing, or easy to skip?",
  "What feature would make Portlify feel instantly more useful?",
];

type LandingFeedbackProps = {
  userId?: string | null;
};

type FeedbackFormState = {
  likedFeature: string;
  leastLikedFeature: string;
  wantedFeature: string;
  signupBlocker: string;
  persona: string;
};

const createInitialFormState = (): FeedbackFormState => ({
  likedFeature: "",
  leastLikedFeature: "",
  wantedFeature: "",
  signupBlocker: "",
  persona: "",
});

const LandingFeedback = ({ userId }: LandingFeedbackProps) => {
  const [formData, setFormData] = useState<FeedbackFormState>(createInitialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateField = <K extends keyof FeedbackFormState>(field: K, value: FeedbackFormState[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFormData = {
      likedFeature: formData.likedFeature.trim(),
      leastLikedFeature: formData.leastLikedFeature.trim(),
      wantedFeature: formData.wantedFeature.trim(),
      signupBlocker: formData.signupBlocker.trim(),
      persona: formData.persona.trim(),
    };

    if (Object.values(trimmedFormData).some((value) => value.length === 0)) {
      toast({
        title: "Please answer all 5 questions",
        description: "A complete response helps us separate feature demand from signup friction.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: TablesInsert<"landing_feedback"> = {
        user_id: userId ?? null,
        liked_feature: trimmedFormData.likedFeature,
        least_liked_feature: trimmedFormData.leastLikedFeature,
        wanted_feature: trimmedFormData.wantedFeature,
        signup_blocker: trimmedFormData.signupBlocker,
        persona: trimmedFormData.persona,
        page_path: typeof window === "undefined" ? "/" : window.location.pathname,
      };

      const { error } = await supabase.from("landing_feedback").insert(payload);

      if (error) {
        throw error;
      }

      setFormData(createInitialFormState());
      toast({
        title: "Feedback received",
        description: "Thanks for helping us shape the next improvements.",
      });
    } catch (error) {
      toast({
        title: "Could not send feedback",
        description: error instanceof Error ? error.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="pb-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="surface-panel relative overflow-hidden rounded-[2.1rem] p-6 sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/10 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -left-12 top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-6 right-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
            <div className="max-w-xl">
              <div className="surface-panel mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
                FEEDBACK
              </div>
              <h2 className="max-w-lg text-3xl font-bold tracking-tight md:text-4xl">
                Help Shape the <span className="text-gradient">Next Release</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                This is a short form for the landing page. Tell us what feels strongest, what needs work,
                and what would make Portlify worth trying right now.
              </p>

              <div className="mt-8 space-y-3">
                {focusAreas.map((item) => (
                  <div
                    key={item}
                    className="surface-wood flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-foreground/90"
                  >
                    <div className="icon-tile mt-0.5 h-9 w-9 rounded-xl">
                      <MessageSquareHeart className="h-4 w-4" />
                    </div>
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Anonymous feedback works fine. If you are logged in, we quietly attach your account id for
                internal analysis.
              </p>
            </div>

            <form
              className="surface-wood relative grid gap-4 rounded-[1.8rem] p-5 sm:p-6"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="liked-feature">Which feature did you like most?</Label>
                  <Select
                    value={formData.likedFeature}
                    onValueChange={(value) => updateField("likedFeature", value)}
                  >
                    <SelectTrigger id="liked-feature" aria-label="Which feature did you like most?">
                      <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentFeatureOptions.map((feature) => (
                        <SelectItem key={feature} value={feature}>
                          {feature}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="least-liked-feature">Which feature did you like least?</Label>
                  <Select
                    value={formData.leastLikedFeature}
                    onValueChange={(value) => updateField("leastLikedFeature", value)}
                  >
                    <SelectTrigger id="least-liked-feature" aria-label="Which feature did you like least?">
                      <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentFeatureOptions.map((feature) => (
                        <SelectItem key={feature} value={feature}>
                          {feature}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wanted-feature">Which feature would you like most?</Label>
                <Input
                  id="wanted-feature"
                  value={formData.wantedFeature}
                  onChange={(event) => updateField("wantedFeature", event.target.value)}
                  placeholder="Example: LinkedIn import, custom domains, resume upload"
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-blocker">What almost stopped you from signing up today?</Label>
                <Textarea
                  id="signup-blocker"
                  value={formData.signupBlocker}
                  onChange={(event) => updateField("signupBlocker", event.target.value)}
                  placeholder="A short answer is perfect. Pricing, trust, missing feature, unclear value, too much effort..."
                  rows={5}
                  maxLength={320}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="persona">What kind of user are you?</Label>
                <Select value={formData.persona} onValueChange={(value) => updateField("persona", value)}>
                  <SelectTrigger id="persona" aria-label="What kind of user are you?">
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    {personaOptions.map((persona) => (
                      <SelectItem key={persona} value={persona}>
                        {persona}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-start justify-between gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Five short answers are enough. This goes straight into the product feedback backlog.
                </p>
                <Button variant="hero" type="submit" disabled={isSubmitting} className="min-w-40">
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingFeedback;
