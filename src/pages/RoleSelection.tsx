import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const RoleSelection = () => {
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContinue = async () => {
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
          .insert({ user_id: user.id, is_default: true, name: "My Professional Portfolio" });
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
        <p className="mb-8 text-muted-foreground">Tell us your role in your own words so we can tailor the builder.</p>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Role</label>
          <Input
            placeholder="e.g. Software Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={50}
          />
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate("/career-setup")}>
            Back
          </Button>
          <Button variant="hero" disabled={!role.trim() || isLoading} onClick={handleContinue}>
            <Sparkles className="mr-2 h-4 w-4" /> Start Building
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
