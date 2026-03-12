import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  voice: `You are a real-time voice code analyst. The user is speaking about their code or development problem. 
Analyze their speech transcript and provide:
- A clear understanding of what they're describing
- Relevant code suggestions or fixes
- Best practices related to their topic
Keep responses concise and actionable. Format with markdown.`,

  vision: `You are a screen share code analyst. The user is sharing their screen showing code or an IDE.
Analyze what you see and provide:
- What the code does
- Any bugs or issues you spot
- Suggested improvements
- Performance considerations
Be specific about line numbers or sections you're referencing. Format with markdown.`,

  correction: `You are a code correction specialist. Analyze the provided code and:
- Identify syntax errors, logic bugs, and anti-patterns
- Provide corrected code with explanations
- Suggest modern alternatives or better approaches
- Rate the code quality (1-10)
Always show the corrected code in full. Format with markdown and use code blocks.`,

  assistant: `You are an expert code assistant. Help the user with their coding questions by:
- Providing clear, well-structured answers
- Including code examples when helpful
- Explaining concepts from fundamentals when needed
- Suggesting relevant documentation or resources
Be thorough but concise. Format with markdown.`,

  debug: `You are a real-time code debugger. Analyze the provided code for:
- Runtime errors and exceptions
- Logic errors and edge cases
- Memory leaks and performance issues
- Security vulnerabilities
- Type errors and null safety issues
Provide step-by-step debugging guidance with fixes. Format with markdown. Use severity levels: 🔴 Critical, 🟡 Warning, 🟢 Info.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, messages, imageBase64 } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.assistant;

    // Build parts for Gemini API
    const contents: any[] = [];

    // Add system instruction as first user turn
    contents.push({
      role: "user",
      parts: [{ text: `System: ${systemPrompt}` }],
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood. I'll analyze according to these instructions." }],
    });

    // Add conversation messages
    for (const msg of messages) {
      const parts: any[] = [];
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      if (msg.imageBase64) {
        parts.push({
          inline_data: {
            mime_type: "image/png",
            data: msg.imageBase64,
          },
        });
      }
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      });
    }

    // If there's a standalone image (from screen share)
    if (imageBase64 && contents.length > 2) {
      const lastContent = contents[contents.length - 1];
      if (lastContent.role === "user") {
        lastContent.parts.push({
          inline_data: {
            mime_type: "image/png",
            data: imageBase64,
          },
        });
      }
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return new Response(JSON.stringify({ result: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Function error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
