import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";
import { normalizeNotApplicableSections } from "@/lib/portfolioSections";

type PortfolioRecord = Tables<"portfolios">;
type PortfolioUpdate = TablesUpdate<"portfolios"> & { id?: string };

const generateShareToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

export const usePortfolio = (specificPortfolioId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const portfolioQueryKey = ["portfolio", specificPortfolioId || "default", user?.id];

  const syncPortfolioCaches = (nextPortfolio: PortfolioRecord) => {
    queryClient.setQueryData(portfolioQueryKey, nextPortfolio);
    queryClient.setQueryData(["portfolios-all", user?.id], (current: PortfolioRecord[] | undefined) => {
      if (!current) return current;
      return current.map((entry) => (entry.id === nextPortfolio.id ? { ...entry, ...nextPortfolio } : entry));
    });
  };

  const duplicateRows = async (
    table: string,
    sourcePortfolioId: string,
    targetPortfolioId: string,
    single: boolean = false
  ) => {
    const query = supabase.from(table).select("*").eq("portfolio_id", sourcePortfolioId);
    const { data, error } = single ? await query.maybeSingle() : await query;
    if (error) throw error;
    if (!data) return;

    const rows = Array.isArray(data) ? data : [data];
    if (rows.length === 0) return;

    const sanitizedRows = rows.map((row) => {
      const { id: _id, portfolio_id: _pid, created_at: _ca, updated_at: _ua, ...rest } = row;
      return { ...rest, portfolio_id: targetPortfolioId };
    });

    const { error: insertError } = await supabase.from(table).insert(sanitizedRows);
    if (insertError) throw insertError;
  };

  // Fetch the specific portfolio or the default one
  const { data: portfolio, isLoading } = useQuery({
    queryKey: portfolioQueryKey,
    queryFn: async () => {
      if (specificPortfolioId) {
        const { data, error } = await supabase
          .from("portfolios")
          .select("*")
          .eq("id", specificPortfolioId)
          .eq("user_id", user!.id)
          .single();
        if (error) throw error;
        return data;
      }
      // Get default portfolio
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_default", true)
        .maybeSingle();
      if (error) throw error;
      // If no default, get the first one
      if (!data) {
        const { data: first, error: e2 } = await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (e2) throw e2;
        return first;
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch ALL portfolios for this user
  const { data: allPortfolios = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["portfolios-all", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createPortfolio = useMutation({
    mutationFn: async (opts?: { name?: string; portfolio_type?: string; user_type?: string }) => {
      const isFirst = allPortfolios.length === 0;
      // Get section order based on user type
      const userType = opts?.user_type || "fresher";
      const sectionOrder = DEFAULT_SECTION_ORDER[userType as keyof typeof DEFAULT_SECTION_ORDER] 
        || DEFAULT_SECTION_ORDER.fresher;

      const { data, error } = await supabase
        .from("portfolios")
        .insert({
          user_id: user!.id,
          name: opts?.name || "My Professional Portfolio",
          portfolio_type: opts?.portfolio_type || "general",
          is_default: isFirst,
          visibility: "private",
          is_public: false,
          hidden_sections: [],
          not_applicable_sections: [],
          share_token: generateShareToken(),
          section_order: [...sectionOrder] as string[], // Convert readonly to mutable
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-all"] });
    },
  });

  const duplicatePortfolio = useMutation({
    mutationFn: async (sourcePortfolioId: string) => {
      const source = allPortfolios.find((p) => p.id === sourcePortfolioId);
      if (!source) throw new Error("Portfolio not found");

      const { data: newPortfolio, error } = await supabase
        .from("portfolios")
        .insert({
          user_id: user!.id,
          name: `${source.name || "Portfolio"} (Copy)`,
          portfolio_type: source.portfolio_type,
          template_id: source.template_id,
          section_layouts: source.section_layouts,
          hidden_sections: source.hidden_sections || [],
          not_applicable_sections: source.not_applicable_sections || [],
          share_token: generateShareToken(),
          is_public: false,
          visibility: "private",
          is_default: false,
          section_order: source.section_order,
        })
        .select()
        .single();
      if (error) throw error;

      await duplicateRows("bio_sections", sourcePortfolioId, newPortfolio.id, true);
      await duplicateRows("portfolio_projects", sourcePortfolioId, newPortfolio.id);
      await duplicateRows("skills", sourcePortfolioId, newPortfolio.id);
      await duplicateRows("experiences", sourcePortfolioId, newPortfolio.id);
      await duplicateRows("education", sourcePortfolioId, newPortfolio.id);
      await duplicateRows("contact_info", sourcePortfolioId, newPortfolio.id, true);
      await duplicateRows("certifications", sourcePortfolioId, newPortfolio.id);
      await duplicateRows("custom_sections", sourcePortfolioId, newPortfolio.id);

      return newPortfolio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios-all"] });
    },
  });

  const setDefaultPortfolio = useMutation({
    mutationFn: async (portfolioId: string) => {
      // Unset all defaults first
      await supabase.from("portfolios").update({ is_default: false }).eq("user_id", user!.id);
      // Set new default
      const { data, error } = await supabase
        .from("portfolios")
        .update({ is_default: true })
        .eq("id", portfolioId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-all"] });
    },
  });

  const updatePortfolio = useMutation({
    mutationFn: async (updates: PortfolioUpdate) => {
      const { id: updateId, ...rest } = updates;
      const targetId = updateId || specificPortfolioId || portfolio?.id;
      if (!targetId) throw new Error("No portfolio to update");
      const targetPortfolio =
        allPortfolios.find((entry) => entry.id === targetId) ??
        (portfolio?.id === targetId ? portfolio : undefined);
      const nextUpdates: TablesUpdate<"portfolios"> = { ...rest };

      if (nextUpdates.visibility) {
        nextUpdates.is_public = nextUpdates.visibility === "public";
      }
      if (nextUpdates.is_public === true && !nextUpdates.visibility) {
        nextUpdates.visibility = "public";
      }
      if (nextUpdates.is_public === false && !nextUpdates.visibility) {
        nextUpdates.visibility = "private";
      }
      if (
        (nextUpdates.visibility === "public" || nextUpdates.visibility === "unlisted") &&
        !nextUpdates.share_token
      ) {
        nextUpdates.share_token = targetPortfolio?.share_token || generateShareToken();
      }

      const { data, error } = await supabase
        .from("portfolios")
        .update(nextUpdates)
        .eq("id", targetId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-all"] });
    },
  });

  const updateSectionLayouts = useMutation({
    mutationFn: async (layouts: Record<string, string>) => {
      const targetId = specificPortfolioId || portfolio?.id;
      if (!targetId) throw new Error("No portfolio to update");
      const { data, error } = await supabase
        .from("portfolios")
        .update({ section_layouts: layouts })
        .eq("id", targetId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      syncPortfolioCaches(data);
    },
  });

  const updateSectionControls = useMutation({
    mutationFn: async (updates: { section_order?: string[]; hidden_sections?: string[]; not_applicable_sections?: string[] }) => {
      const targetId = specificPortfolioId || portfolio?.id;
      if (!targetId) throw new Error("No portfolio to update");
      const sanitizedUpdates = {
        ...updates,
        ...(updates.not_applicable_sections
          ? { not_applicable_sections: normalizeNotApplicableSections(updates.not_applicable_sections) }
          : {}),
      };
      const { data, error } = await supabase
        .from("portfolios")
        .update(sanitizedUpdates)
        .eq("id", targetId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      syncPortfolioCaches(data);
    },
  });

  const deletePortfolio = useMutation({
    mutationFn: async (portfolioId: string) => {
      const { error } = await supabase.from("portfolios").delete().eq("id", portfolioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-all"] });
    },
  });

  return {
    portfolio,
    allPortfolios,
    isLoading,
    isLoadingAll,
    createPortfolio,
    duplicatePortfolio,
    setDefaultPortfolio,
    updatePortfolio,
    updateSectionLayouts,
    updateSectionControls,
    deletePortfolio,
  };
};
