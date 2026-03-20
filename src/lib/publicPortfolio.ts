import { supabase } from "@/integrations/supabase/client";

export const fetchPortfolioContent = async (portfolioId: string) => {
  const [bioRes, projectsRes, skillsRes, expRes, eduRes, contactRes, certRes] = await Promise.all([
    supabase.from("bio_sections").select("*").eq("portfolio_id", portfolioId).maybeSingle(),
    supabase.from("portfolio_projects").select("*").eq("portfolio_id", portfolioId).order("display_order"),
    supabase.from("skills").select("*").eq("portfolio_id", portfolioId).order("display_order"),
    supabase.from("experiences").select("*").eq("portfolio_id", portfolioId).order("display_order"),
    supabase.from("education").select("*").eq("portfolio_id", portfolioId).order("display_order"),
    supabase.from("contact_info").select("*").eq("portfolio_id", portfolioId).maybeSingle(),
    supabase.from("certifications" as any).select("*").eq("portfolio_id", portfolioId).order("display_order"),
  ]);

  return {
    bio: bioRes.data,
    projects: (projectsRes.data || []).map((project) => ({
      ...project,
      solution: project.solution_approach,
    })),
    skills: (skillsRes.data || []).map((skill) => ({
      ...skill,
      category: skill.skill_category,
    })),
    experiences: expRes.data || [],
    education: eduRes.data || [],
    contact: contactRes.data,
    certifications: (certRes.data as any[]) || [],
  };
};
