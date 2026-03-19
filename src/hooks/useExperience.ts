import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeText } from "@/lib/sanitize";

export const useExperience = (portfolioId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["experiences", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("portfolio_id", portfolioId!)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });

  const addExperience = useMutation({
    mutationFn: async (input: { company_name: string; role_title: string; employment_type: string; start_date: string; end_date?: string; description?: string; is_current?: boolean }) => {
      const { data, error } = await supabase
        .from("experiences")
        .insert({
          company_name: sanitizeText(input.company_name).slice(0, 100),
          role_title: sanitizeText(input.role_title).slice(0, 100),
          employment_type: input.employment_type,
          start_date: input.start_date,
          end_date: input.end_date || null,
          description: input.description ? sanitizeText(input.description).slice(0, 500) : null,
          is_current: input.is_current || false,
          portfolio_id: portfolioId!,
          user_id: user!.id,
          display_order: experiences.length,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experiences", portfolioId] }),
  });

  const updateExperience = useMutation({
    mutationFn: async ({ id, ...input }: { id: string; company_name: string; role_title: string; employment_type: string; start_date: string; end_date?: string; description?: string; is_current?: boolean }) => {
      const { data, error } = await supabase
        .from("experiences")
        .update({
          company_name: sanitizeText(input.company_name).slice(0, 100),
          role_title: sanitizeText(input.role_title).slice(0, 100),
          employment_type: input.employment_type,
          start_date: input.start_date,
          end_date: input.end_date || null,
          description: input.description ? sanitizeText(input.description).slice(0, 500) : null,
          is_current: input.is_current || false,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experiences", portfolioId] }),
  });

  const deleteExperience = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experiences", portfolioId] }),
  });

  return { experiences, isLoading, addExperience, updateExperience, deleteExperience };
};
