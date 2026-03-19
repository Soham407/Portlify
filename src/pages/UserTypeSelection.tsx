import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GraduationCap, Search, Award, Laptop, Briefcase, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const USER_TYPES = [
  { value: "fresher", label: "Fresher", description: "Recent graduate or new to the field", icon: GraduationCap },
  { value: "job_seeker", label: "Job Seeker", description: "Actively looking for employment", icon: Search },
  { value: "expert", label: "Expert", description: "Experienced professional with deep expertise", icon: Award },
  { value: "freelancer", label: "Freelancer", description: "Independent contractor or consultant", icon: Laptop },
  { value: "professional", label: "Professional", description: "Established career with certifications", icon: Briefcase },
];

const UserTypeSelection = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContinue = async () => {
    if (!selected || !user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ user_type: selected })
        .eq("id", user.id);
      if (error) throw error;
      navigate("/career-setup");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="mb-2 text-sm font-medium text-primary">Step 1 of 3</div>
        <h1 className="mb-2 text-3xl font-bold">What describes you best?</h1>
        <p className="mb-8 text-muted-foreground">This helps us tailor your portfolio layout and content priority.</p>

        <div className="space-y-3">
          {USER_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelected(type.value)}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                selected === type.value
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                selected === type.value ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <type.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{type.label}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/career-setup")}>
              Skip
            </Button>
            <Button variant="hero" disabled={!selected || isLoading} onClick={handleContinue}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserTypeSelection;
