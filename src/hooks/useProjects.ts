import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizePortfolioData } from "@/lib/sanitize";

export const useProjects = (portfolioId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("portfolio_id", portfolioId!)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });

  const addProject = useMutation({
    mutationFn: async (input: { name: string; problem_statement: string; solution_approach: string; technologies: string[]; github_url?: string; project_url?: string }) => {
      const sanitized = sanitizePortfolioData.project(input);
      const { data, error } = await supabase
        .from("portfolio_projects")
        .insert({ ...sanitized, portfolio_id: portfolioId!, user_id: user!.id, display_order: projects.length })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", portfolioId] }),
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...input }: { id: string; name: string; problem_statement: string; solution_approach: string; technologies: string[]; github_url?: string; project_url?: string }) => {
      const sanitized = sanitizePortfolioData.project(input);
      const { data, error } = await supabase
        .from("portfolio_projects")
        .update(sanitized)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", portfolioId] }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", portfolioId] }),
  });

  return { projects, isLoading, addProject, updateProject, deleteProject };
};
