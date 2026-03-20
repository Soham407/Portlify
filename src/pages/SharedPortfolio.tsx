import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTemplateComponent } from "@/components/templates";
import { fetchPortfolioContent } from "@/lib/publicPortfolio";

const SharedPortfolio = () => {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["shared-portfolio", token],
    queryFn: async () => {
      const { data: portfolio, error: portfolioError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("share_token", token!)
        .eq("visibility", "unlisted")
        .maybeSingle();

      if (portfolioError) throw portfolioError;
      if (!portfolio) throw new Error("Portfolio not found");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, username, headline")
        .eq("id", portfolio.user_id)
        .single();
      if (profileError) throw profileError;

      const content = await fetchPortfolioContent(portfolio.id);
      return {
        portfolio,
        profile,
        ...content,
      };
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (!data?.portfolio?.id) return;
    supabase.functions.invoke("log-portfolio-view", {
      body: { portfolio_id: data.portfolio.id, share_channel: "unlisted" },
    });
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
          <h1 className="text-2xl font-bold">Share link not found</h1>
          <p className="mt-2 text-muted-foreground">This link is invalid or no longer active.</p>
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
      sectionOrder={data.portfolio.section_order ?? undefined}
      hiddenSections={data.portfolio.hidden_sections ?? undefined}
    />
  );
};

export default SharedPortfolio;
