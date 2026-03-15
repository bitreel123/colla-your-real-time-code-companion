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

  vision: `You are a real-time screen share code analyst with expert-level programming knowledge. The user is sharing their screen showing code or an IDE.
Carefully analyze every line of code visible in the screenshot and provide:
- What language/framework is being used
- A detailed explanation of what the code does
- Any bugs, syntax errors, logic issues, or anti-patterns you spot (reference specific lines)
- Corrected code with explanations for each fix
- Performance considerations and security issues
- A code quality rating (1-10) with justification
Be extremely specific and thorough. Format with markdown and use code blocks for corrections.`,

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

  chat: `You are COLLA, an AI pair programming assistant having a real-time conversation with a developer. You can see their screen when they share it.
Be conversational, helpful, and proactive. You remember the full conversation context.
- Answer questions about the code you see on screen
- Suggest improvements proactively
- Explain concepts when asked
- Help debug issues in real-time
Keep responses focused and concise. Use markdown for code. Be like a smart colleague looking over their shoulder.`,

  summary: `You are a code review summarizer. Given multiple analysis entries from a live coding session, create a comprehensive summary:
## 📋 Session Summary
- Overview of what was analyzed
- Key issues found (grouped by severity)
- Top recommendations
- Overall code quality assessment
Be concise but thorough. Format with markdown.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, messages, imageBase64 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.assistant;

    // Build messages for OpenAI-compatible API
    const apiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation messages
    for (const msg of messages) {
      if (msg.imageBase64) {
        // Vision message with image
        apiMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: [
            { type: "text", text: msg.content || "Analyze this image" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${msg.imageBase64}`,
              },
            },
          ],
        });
      } else {
        apiMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    }

    // If there's a standalone imageBase64, attach it to the last user message
    if (imageBase64) {
      const lastUserIdx = apiMessages.map((m, i) => m.role === "user" ? i : -1).filter(i => i >= 0).pop();
      if (lastUserIdx !== undefined && lastUserIdx >= 0) {
        const lastMsg = apiMessages[lastUserIdx];
        const textContent = typeof lastMsg.content === "string" ? lastMsg.content : (lastMsg.content?.[0]?.text || "Analyze this image");
        apiMessages[lastUserIdx] = {
          role: "user",
          content: [
            { type: "text", text: textContent },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        };
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: `AI gateway error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No response generated.";

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
