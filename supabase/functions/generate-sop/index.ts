import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { portfolio_id, purpose, target_program, tone = "formal" } = await req.json();

    if (!portfolio_id) {
      return new Response(JSON.stringify({ error: "portfolio_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all portfolio data in parallel
    const [bioRes, skillsRes, projectsRes, experiencesRes, educationRes, profileRes] = await Promise.all([
      supabase.from("bio_sections").select("*").eq("portfolio_id", portfolio_id).single(),
      supabase.from("skills").select("*").eq("portfolio_id", portfolio_id),
      supabase.from("portfolio_projects").select("*").eq("portfolio_id", portfolio_id),
      supabase.from("experiences").select("*").eq("portfolio_id", portfolio_id),
      supabase.from("education").select("*").eq("portfolio_id", portfolio_id),
      supabase.from("profiles").select("user_type, career_type, skill_level").eq("id", user.id).single(),
    ]);

    const bio = bioRes.data;
    const skills = skillsRes.data || [];
    const projects = projectsRes.data || [];
    const experiences = experiencesRes.data || [];
    const education = educationRes.data || [];
    const profile = profileRes.data;

    const learnedSkills = skills.filter((s: any) => (s.skill_type || "learned") === "learned").map((s: any) => s.skill_name);
    const implementedSkills = skills.filter((s: any) => s.skill_type === "implemented").map((s: any) => s.skill_name);

    // Build context for AI
    const portfolioContext = `
CANDIDATE PROFILE:
- Name: ${bio?.first_name || ""} ${bio?.last_name || ""}
- Headline: ${bio?.headline || "N/A"}
- Bio: ${bio?.bio || "N/A"}
- Location: ${bio?.location || "N/A"}
- User Type: ${profile?.user_type || "N/A"}
- Career Field: ${profile?.career_type || "N/A"}
- Skill Level: ${profile?.skill_level || "N/A"}

SKILLS LEARNED: ${learnedSkills.join(", ") || "None listed"}
SKILLS IMPLEMENTED (in real projects): ${implementedSkills.join(", ") || "None listed"}

PROJECTS:
${projects.map((p: any) => `- ${p.name}: ${p.problem_statement || ""} | Technologies: ${(p.technologies || []).join(", ")}`).join("\n") || "None listed"}

EXPERIENCE:
${experiences.map((e: any) => `- ${e.role_title} at ${e.company_name} (${e.employment_type}) ${e.start_date || ""} - ${e.is_current ? "Present" : e.end_date || ""}: ${e.description || ""}`).join("\n") || "None listed"}

EDUCATION:
${education.map((e: any) => `- ${e.degree || ""} in ${e.field_of_study || ""} from ${e.institution} (${e.graduation_year || ""}) CGPA: ${e.cgpa || "N/A"}`).join("\n") || "None listed"}
`.trim();

    const toneMap: Record<string, string> = {
      formal: "Write in a formal, academic tone suitable for university admissions.",
      friendly: "Write in a warm, personal tone that shows genuine enthusiasm.",
      technical: "Write with a focus on technical depth, methodology, and analytical rigor.",
      creative: "Write with a compelling narrative style that tells the candidate's story.",
    };

    const systemPrompt = `You are an expert SOP (Statement of Purpose) writer. Generate a professional, compelling Statement of Purpose based on the candidate's portfolio data.

${toneMap[tone] || toneMap.formal}

Guidelines:
- Write 600-800 words
- Structure: Introduction → Academic/Professional Background → Skills & Projects → Goals → Why This Program → Conclusion
- Highlight the candidate's strengths from their actual data
- Connect their skills and projects to their career goals
- Be authentic — don't fabricate achievements not in the data
- If target program/purpose is specified, tailor the SOP accordingly
- Use first person perspective
- Make it compelling and specific, avoiding generic statements`;

    const userPrompt = `Generate a Statement of Purpose for this candidate.
${purpose ? `\nPurpose/Goal: ${purpose}` : ""}
${target_program ? `\nTarget Program/Institution: ${target_program}` : ""}

${portfolioContext}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const sop = data.choices?.[0]?.message?.content?.trim();

    return new Response(
      JSON.stringify({ sop, tone, purpose, target_program }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SOP generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
