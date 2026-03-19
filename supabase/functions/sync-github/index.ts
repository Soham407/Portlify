import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { username } = await req.json();
    if (!username) {
      return new Response(JSON.stringify({ error: "username required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username) || username.length > 39) {
      return new Response(JSON.stringify({ error: "Invalid GitHub username" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch public repos from GitHub
    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`, {
      headers: { "Accept": "application/vnd.github.v3+json" },
    });

    if (!ghRes.ok) {
      const errorMessage =
        ghRes.status === 404 ? "GitHub user not found" :
        ghRes.status === 403 || ghRes.status === 429 ? "GitHub rate limit hit. Try again later." :
        "GitHub API error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: ghRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const repos = await ghRes.json();

    const projects = repos
      .filter((r: any) => !r.fork)
      .map((r: any) => ({
        name: r.name,
        problem_statement: r.description || "",
        solution_approach: "",
        technologies: r.language ? [r.language] : [],
        github_url: r.html_url,
        demo_url: r.homepage || null,
      }));

    return new Response(JSON.stringify({ projects }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
