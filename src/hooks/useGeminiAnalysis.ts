import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase-safe";

export type AnalysisMode = "voice" | "vision" | "correction" | "assistant" | "debug";

interface AnalysisResult {
  mode: AnalysisMode;
  result: string;
  timestamp: Date;
  query: string;
}

export function useGeminiAnalysis() {
  const [results, setResults] = useState<Record<AnalysisMode, AnalysisResult | null>>({
    voice: null,
    vision: null,
    correction: null,
    assistant: null,
    debug: null,
  });
  const [loading, setLoading] = useState<Record<AnalysisMode, boolean>>({
    voice: false,
    vision: false,
    correction: false,
    assistant: false,
    debug: false,
  });

  const analyze = useCallback(
    async (mode: AnalysisMode, query: string, imageBase64?: string) => {
      setLoading((prev) => ({ ...prev, [mode]: true }));
      try {
        if (!supabase) throw new Error("Backend not available");

        const { data, error } = await supabase.functions.invoke("gemini-analyze", {
          body: {
            mode,
            messages: [{ role: "user", content: query }],
            imageBase64,
          },
        });

        if (error) throw error;

        const result: AnalysisResult = {
          mode,
          result: data.result || data.error || "No result",
          timestamp: new Date(),
          query,
        };

        setResults((prev) => ({ ...prev, [mode]: result }));
        return result;
      } catch (err) {
        console.error(`${mode} analysis error:`, err);
        const errorResult: AnalysisResult = {
          mode,
          result: `Error: ${err instanceof Error ? err.message : "Analysis failed"}`,
          timestamp: new Date(),
          query,
        };
        setResults((prev) => ({ ...prev, [mode]: errorResult }));
        return errorResult;
      } finally {
        setLoading((prev) => ({ ...prev, [mode]: false }));
      }
    },
    []
  );

  return { results, loading, analyze };
}
