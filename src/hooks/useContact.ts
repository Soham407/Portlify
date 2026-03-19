import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sanitizePortfolioData } from "@/lib/sanitize";

export const useContact = (portfolioId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: contact, isLoading } = useQuery({
    queryKey: ["contact", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .eq("portfolio_id", portfolioId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });

  const saveContact = useMutation({
    mutationFn: async (input: { email: string; phone?: string; linkedin_url?: string; github_url?: string; twitter_url?: string; website_url?: string }) => {
      const sanitized = sanitizePortfolioData.contact(input);
      
      if (contact?.id) {
        const { data, error } = await supabase
          .from("contact_info")
          .update(sanitized)
          .eq("id", contact.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("contact_info")
          .insert({ ...sanitized, portfolio_id: portfolioId! })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact", portfolioId] }),
  });

  return { contact, isLoading, saveContact };
};
