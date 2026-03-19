import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeText } from "@/lib/sanitize";

export const useSkills = (portfolioId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("portfolio_id", portfolioId!)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });

  const addSkill = useMutation({
    mutationFn: async (input: { skill_name: string; skill_category: string; skill_type?: string }) => {
      const { data, error } = await supabase
        .from("skills")
        .insert({
          skill_name: sanitizeText(input.skill_name).slice(0, 50),
          skill_category: sanitizeText(input.skill_category),
          skill_type: input.skill_type || "learned",
          portfolio_id: portfolioId!,
          user_id: user!.id,
          display_order: skills.length,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["skills", portfolioId] }),
  });

  const deleteSkill = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["skills", portfolioId] }),
  });

  return { skills, isLoading, addSkill, deleteSkill };
};
