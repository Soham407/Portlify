import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TONE_PROMPTS = {
  formal: "Use a polished, business-appropriate tone.",
  friendly: "Use a warm, approachable, professional tone.",
  technical: "Use precise, specific, technically accurate language.",
  creative: "Use distinctive, memorable language while remaining credible.",
};

const ACTION_PROMPTS = {
  rewrite: "Produce 3 rewritten variants with different phrasing strengths.",
  shorten: "Produce 3 shorter variants while keeping the strongest signal.",
  strengthen: "Produce 3 stronger variants emphasizing ownership, outcomes, and impact.",
  suggest: "Produce 1 improved variant and focus on coaching suggestions.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const {
      content,
      content_type,
      tone = "formal",
      action = "rewrite",
    } = await req.json();

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentType = typeof content_type === "string" ? content_type : "text";
    const toneInstruction = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS] || TONE_PROMPTS.formal;
    const actionInstruction = ACTION_PROMPTS[action as keyof typeof ACTION_PROMPTS] || ACTION_PROMPTS.rewrite;

    const systemPrompt = `
You are a portfolio writing assistant.
Return strictly valid JSON with this shape:
{
  "variants": [{"title": "string", "content": "string"}],
  "suggestions": ["string"],
  "missing_details": ["string"]
}

Rules:
- ${toneInstruction}
- ${actionInstruction}
- Do not invent facts, metrics, awards, names, or tools.
- Preserve the user's meaning and factual details.
- Suggestions must be short, practical, and specific.
- Missing details should highlight measurable outcomes, action verbs, proof points, or context gaps.
- Keep the response concise and directly usable.
`;

    const contentPrompt = `
Content type: ${contentType}
Tone: ${tone}
Requested action: ${action}

Original content:
${content}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n${contentPrompt}` }] }],
          generationConfig: {
            maxOutputTokens: 900,
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const parsed = rawText ? JSON.parse(rawText) : {};

    const variants = Array.isArray(parsed.variants)
      ? parsed.variants.filter((variant: any) => typeof variant?.content === "string").map((variant: any, index: number) => ({
        title: typeof variant.title === "string" && variant.title.trim() ? variant.title : `Variant ${index + 1}`,
        content: variant.content.trim(),
      }))
      : [];

    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((item: unknown) => typeof item === "string" && item.trim())
      : [];

    const missingDetails = Array.isArray(parsed.missing_details)
      ? parsed.missing_details.filter((item: unknown) => typeof item === "string" && item.trim())
      : [];

    return new Response(
      JSON.stringify({
        original: content,
        action,
        tone,
        variants,
        suggestions,
        missing_details: missingDetails,
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
