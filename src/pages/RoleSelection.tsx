import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "UI/UX Designer", "DevOps Engineer", "Mobile Developer",
  "Product Manager", "Marketing Manager", "Content Creator", "Business Analyst",
];

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContinue = async () => {
    const role = selectedRole === "custom" ? customRole : selectedRole;
    if (!role || !user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ selected_role: role })
        .eq("id", user.id);
      if (error) throw error;
      // Create portfolio for user only if one doesn't exist yet
      const { data: existing } = await supabase
        .from("portfolios")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existing) {
        const { error: portError } = await supabase
          .from("portfolios")
          .insert({ user_id: user.id, is_default: true, name: "My Portfolio" });
        if (portError) throw portError;
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="mb-2 text-sm font-medium text-primary">Step 3 of 3</div>
        <h1 className="mb-2 text-3xl font-bold">What's your role?</h1>
        <p className="mb-8 text-muted-foreground">This helps us suggest the right template for you.</p>

        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`rounded-lg border px-4 py-3 text-sm text-left transition-all ${
                selectedRole === role ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/30"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={() => setSelectedRole("custom")}
            className={`w-full rounded-lg border px-4 py-3 text-sm text-left transition-all ${
              selectedRole === "custom" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            Other (specify below)
          </button>
          {selectedRole === "custom" && (
            <Input
              className="mt-2"
              placeholder="e.g. Growth Hacker"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              maxLength={50}
            />
          )}
        </div>

        <Button variant="hero" className="mt-8 w-full" disabled={(!selectedRole || (selectedRole === "custom" && !customRole)) || isLoading} onClick={handleContinue}>
          <Sparkles className="mr-2 h-4 w-4" /> Start Building
        </Button>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
