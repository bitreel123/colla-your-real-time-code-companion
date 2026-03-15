import { useState, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-safe";

export interface LiveAnalysisEntry {
  id: string;
  timestamp: Date;
  result: string;
  mode: "explanation" | "bugs" | "fixes" | "quality";
}

export function useLiveAnalysis() {
  const [entries, setEntries] = useState<LiveAnalysisEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureRef = useRef<(() => string | null) | null>(null);

  const setCaptureFunction = useCallback((fn: () => string | null) => {
    captureRef.current = fn;
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (!captureRef.current) return;
    const frame = captureRef.current();
    if (!frame) return;

    setAnalyzing(true);
    try {
      const client = await getSupabaseClient();
      if (!client) return;

      const { data, error } = await client.functions.invoke("gemini-analyze", {
        body: {
          mode: "vision",
          messages: [{
            role: "user",
            content: `You are a LIVE code analysis agent watching a developer's screen in real-time. Analyze the current screen capture and provide a structured response:

## 🔍 What's on Screen
Brief description of what you see (language, framework, file).

## 💡 Code Explanation
Concise explanation of the visible code logic.

## 🐛 Bugs & Issues
List any bugs, errors, or anti-patterns. Use severity:
- 🔴 Critical: crashes or security issues
- 🟡 Warning: logic errors or bad practices  
- 🟢 Info: style or minor improvements

## ✅ Suggested Fixes
Provide corrected code snippets for any issues found.

## 📊 Quality Score
Rate 1-10 with brief justification.

Be concise but thorough. Focus on what CHANGED since your last analysis.`,
          }],
          imageBase64: frame,
        },
      });

      if (error) throw error;

      const entry: LiveAnalysisEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        result: data.result || data.error || "No result",
        mode: "explanation",
      };

      setEntries((prev) => [entry, ...prev].slice(0, 50)); // keep last 50
    } catch (err) {
      console.error("Live analysis error:", err);
      const entry: LiveAnalysisEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        result: `Error: ${err instanceof Error ? err.message : "Analysis failed"}`,
        mode: "explanation",
      };
      setEntries((prev) => [entry, ...prev]);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const start = useCallback((intervalMs = 7000) => {
    setRunning(true);
    analyzeFrame(); // immediate first analysis
    intervalRef.current = setInterval(analyzeFrame, intervalMs);
  }, [analyzeFrame]);

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, analyzing, running, start, stop, clear, setCaptureFunction, analyzeFrame };
}
