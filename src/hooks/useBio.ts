import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sanitizePortfolioData } from "@/lib/sanitize";

export const useBio = (portfolioId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: bio, isLoading } = useQuery({
    queryKey: ["bio", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bio_sections")
        .select("*")
        .eq("portfolio_id", portfolioId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });

  const saveBio = useMutation({
    mutationFn: async (input: { first_name: string; last_name: string; headline: string; bio: string; location?: string; avatar_url?: string }) => {
      const sanitized = sanitizePortfolioData.bio(input);
      const payload = { ...sanitized, portfolio_id: portfolioId! };
      
      if (bio?.id) {
        const { data, error } = await supabase
          .from("bio_sections")
          .update(sanitized)
          .eq("id", bio.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("bio_sections")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bio", portfolioId] }),
  });

  return { bio, isLoading, saveBio };
};
