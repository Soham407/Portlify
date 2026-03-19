import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTemplateComponent } from "@/components/templates";

const PublicPortfolio = () => {
  const { username } = useParams<{ username: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-portfolio", username],
    queryFn: async () => {
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, username, headline")
        .eq("username", username!)
        .single();
      if (pErr) throw pErr;

      const { data: portfolio, error: portErr } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", profile.id)
        .eq("is_public", true)
        .single();
      if (portErr) throw new Error("Portfolio not found or is private");

      const [bioRes, projectsRes, skillsRes, expRes, eduRes, contactRes, certRes] = await Promise.all([
        supabase.from("bio_sections").select("*").eq("portfolio_id", portfolio.id).maybeSingle(),
        supabase.from("portfolio_projects").select("*").eq("portfolio_id", portfolio.id).order("display_order"),
        supabase.from("skills").select("*").eq("portfolio_id", portfolio.id).order("display_order"),
        supabase.from("experiences").select("*").eq("portfolio_id", portfolio.id).order("display_order"),
        supabase.from("education").select("*").eq("portfolio_id", portfolio.id).order("display_order"),
        supabase.from("contact_info").select("*").eq("portfolio_id", portfolio.id).maybeSingle(),
        supabase.from("certifications" as any).select("*").eq("portfolio_id", portfolio.id).order("display_order"),
      ]);

      return {
        profile,
        portfolio,
        bio: bioRes.data,
        projects: projectsRes.data || [],
        skills: skillsRes.data || [],
        experiences: expRes.data || [],
        education: eduRes.data || [],
        contact: contactRes.data,
        certifications: (certRes.data as any[]) || [],
      };
    },
    enabled: !!username,
  });

  useEffect(() => {
    if (data?.portfolio?.id) {
      supabase.functions.invoke("log-portfolio-view", {
        body: { portfolio_id: data.portfolio.id },
      });
    }
  }, [data?.portfolio?.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Portfolio not found</h1>
          <p className="mt-2 text-muted-foreground">This portfolio doesn't exist or is private.</p>
        </div>
      </div>
    );
  }

  const TemplateComponent = getTemplateComponent(data.portfolio.template_id);

  return (
    <TemplateComponent
      bio={data.bio}
      projects={data.projects}
      skills={data.skills}
      experiences={data.experiences}
      education={data.education}
      contact={data.contact}
      certifications={data.certifications}
      sectionLayouts={(data.portfolio.section_layouts as Record<string, string>) ?? undefined}
    />
  );
};

export default PublicPortfolio;
