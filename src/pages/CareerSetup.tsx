import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CAREER_TYPES, SKILL_LEVELS } from "@/lib/constants";

const CareerSetup = () => {
  const [careerType, setCareerType] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>("fresher");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.user_type) setUserType(data.user_type);
        });
    }
  }, [user]);

  // Get careers based on user type, with fallback
  const careers = CAREER_TYPES[userType as keyof typeof CAREER_TYPES] || CAREER_TYPES.fresher;

  const handleContinue = async () => {
    if (!careerType || !skillLevel || !user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ career_type: careerType, skill_level: skillLevel })
        .eq("id", user.id);
      if (error) throw error;
      navigate("/role-selection");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="mb-2 text-sm font-medium text-primary">Step 2 of 3</div>
        <h1 className="mb-2 text-3xl font-bold">Your career path</h1>
        <p className="mb-8 text-muted-foreground">Select your field and experience level.</p>

        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium">Career Field</label>
          <div className="grid grid-cols-2 gap-2">
            {careers.map((career) => (
              <button
                key={career}
                onClick={() => setCareerType(career)}
                className={`rounded-lg border px-4 py-3 text-sm text-left transition-all ${
                  careerType === career ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/30"
                }`}
              >
                {career}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium">Skill Level</label>
          <div className="grid grid-cols-2 gap-2">
            {SKILL_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSkillLevel(level.value)}
                className={`rounded-lg border px-4 py-3 text-left transition-all ${
                  skillLevel === level.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="font-medium text-sm">{level.label}</div>
                <div className="text-xs text-muted-foreground">{level.description}</div>
              </button>
            ))}
          </div>
        </div>

        <Button variant="hero" className="mt-8 w-full" disabled={!careerType || !skillLevel || isLoading} onClick={handleContinue}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default CareerSetup;
