import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTemplateComponent } from "@/components/templates";
import { fetchPortfolioContent } from "@/lib/publicPortfolio";

const PublicPortfolio = () => {
  const { username, token } = useParams<{ username: string; token?: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-portfolio", username, token],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, username, headline")
        .eq("username", username!)
        .single();
      if (profileError) throw profileError;

      let portfolioQuery = supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", profile.id)
        .eq("visibility", "public");

      if (token) {
        portfolioQuery = portfolioQuery.eq("share_token", token);
      } else {
        portfolioQuery = portfolioQuery.order("is_default", { ascending: false }).order("updated_at", { ascending: false }).limit(1);
      }

      const { data: portfolio, error: portfolioError } = await portfolioQuery.maybeSingle();
      if (portfolioError) throw new Error("Portfolio not found or is private");
      if (!portfolio) throw new Error("Portfolio not found or is private");

      const content = await fetchPortfolioContent(portfolio.id);

      return {
        profile,
        portfolio,
        ...content,
      };
    },
    enabled: !!username,
  });

  useEffect(() => {
    if (!data?.portfolio?.id) return;
    supabase.functions.invoke("log-portfolio-view", {
      body: { portfolio_id: data.portfolio.id, share_channel: token ? "public_specific" : "public" },
    });
  }, [data?.portfolio?.id, token]);

  useEffect(() => {
    if (!data) return;
    const { bio, profile } = data;
    const name = bio
      ? `${bio.first_name || ""} ${bio.last_name || ""}`.trim()
      : profile.full_name || username || "";
    const description = bio?.bio || profile.headline || "";
    const url = window.location.href;
    const image = bio?.avatar_url || "";

    const prevTitle = document.title;
    const setMeta = (prop: string, value: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, prop);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    document.title = name ? `${name} - Portfolio` : "Portfolio";
    setMeta("description", description);
    setMeta("og:title", name, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    if (image) setMeta("og:image", image, "property");
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", name);
    setMeta("twitter:description", description);

    return () => {
      document.title = prevTitle;
      ["description", "twitter:card", "twitter:title", "twitter:description"].forEach((metaName) => {
        document.querySelector(`meta[name="${metaName}"]`)?.remove();
      });
      ["og:title", "og:description", "og:url", "og:image"].forEach((property) => {
        document.querySelector(`meta[property="${property}"]`)?.remove();
      });
    };
  }, [data, username]);

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
      sectionOrder={data.portfolio.section_order ?? undefined}
      hiddenSections={data.portfolio.hidden_sections ?? undefined}
    />
  );
};

export default PublicPortfolio;
