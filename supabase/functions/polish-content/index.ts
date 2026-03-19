import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TONE_PROMPTS = {
  formal: "Rewrite to be professional, business-appropriate, and polished. Use formal language suitable for corporate settings.",
  friendly: "Rewrite to be warm, approachable, and conversational while remaining professional. Make it engaging and personable.",
  technical: "Rewrite to be detailed, precise, and technically accurate. Include specific terminology and measurable outcomes.",
  creative: "Rewrite to be unique, engaging, and memorable. Use vivid language and storytelling techniques while staying professional.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const { content, content_type, tone = "formal" } = await req.json();

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toneInstruction = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS] || TONE_PROMPTS.formal;

    let systemPrompt = `You are a professional portfolio content editor. Your job is to improve and polish portfolio content while preserving the original meaning and key details.

${toneInstruction}

Guidelines:
- Keep the content concise and impactful
- Preserve all factual information, numbers, and achievements
- Remove filler words and redundant phrases
- Use active voice when possible
- Ensure proper grammar and punctuation
- Do not add false information or exaggerate
- Output ONLY the improved text, no explanations`;

    // Adjust prompt based on content type
    if (content_type === "bio") {
      systemPrompt += "\n- Keep the bio under 200 characters\n- Focus on professional identity and value proposition";
    } else if (content_type === "project") {
      systemPrompt += "\n- Highlight the problem solved and impact\n- Mention technologies used clearly";
    } else if (content_type === "experience") {
      systemPrompt += "\n- Quantify achievements where possible\n- Use action verbs to describe responsibilities";
    }

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
          { role: "user", content: `Polish this ${content_type || "text"}: "${content}"` },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const polishedContent = data.choices?.[0]?.message?.content?.trim() || content;

    return new Response(
      JSON.stringify({ 
        original: content,
        polished: polishedContent,
        tone 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Polish content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
