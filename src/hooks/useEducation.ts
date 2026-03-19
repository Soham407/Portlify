import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeText } from "@/lib/sanitize";

export const useEducation = (portfolioId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: education = [], isLoading } = useQuery({
    queryKey: ["education", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .eq("portfolio_id", portfolioId!)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });

  const addEducation = useMutation({
    mutationFn: async (input: { institution: string; degree?: string; field_of_study?: string; graduation_year?: string; cgpa?: string; description?: string }) => {
      const { data, error } = await supabase
        .from("education")
        .insert({
          institution: sanitizeText(input.institution).slice(0, 150),
          degree: input.degree ? sanitizeText(input.degree).slice(0, 100) : null,
          field_of_study: input.field_of_study ? sanitizeText(input.field_of_study).slice(0, 100) : null,
          graduation_year: input.graduation_year || null,
          cgpa: input.cgpa || null,
          description: input.description ? sanitizeText(input.description).slice(0, 300) : null,
          portfolio_id: portfolioId!,
          user_id: user!.id,
          display_order: education.length,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["education", portfolioId] }),
  });

  const updateEducation = useMutation({
    mutationFn: async ({ id, ...input }: { id: string; institution: string; degree?: string; field_of_study?: string; graduation_year?: string; cgpa?: string; description?: string }) => {
      const { data, error } = await supabase
        .from("education")
        .update({
          institution: sanitizeText(input.institution).slice(0, 150),
          degree: input.degree ? sanitizeText(input.degree).slice(0, 100) : null,
          field_of_study: input.field_of_study ? sanitizeText(input.field_of_study).slice(0, 100) : null,
          graduation_year: input.graduation_year || null,
          cgpa: input.cgpa || null,
          description: input.description ? sanitizeText(input.description).slice(0, 300) : null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["education", portfolioId] }),
  });

  const deleteEducation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("education").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["education", portfolioId] }),
  });

  return { education, isLoading, addEducation, updateEducation, deleteEducation };
};
