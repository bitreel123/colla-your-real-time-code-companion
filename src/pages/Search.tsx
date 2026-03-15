import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mic, MicOff, Monitor, Code, Bug, Wand2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useScreenShare } from "@/hooks/useScreenShare";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useGeminiAnalysis } from "@/hooks/useGeminiAnalysis";
import ScreenSharePreview from "@/components/ScreenSharePreview";
import AnalysisCard from "@/components/AnalysisCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { isSharing, stream, startSharing, stopSharing } = useScreenShare();
  const { results, loading, analyze } = useGeminiAnalysis();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [readyToCapture, setReadyToCapture] = useState(false);

  // Voice input with debounced real-time analysis
  const handleVoiceTranscriptUpdate = useCallback(
    (transcript: string) => {
      analyze("voice", `Voice transcript analysis (real-time): ${transcript}`);
    },
    [analyze]
  );

  const { isListening, transcript, hasPermission, startListening, stopListening, clearTranscript } =
    useVoiceInput({
      onTranscriptUpdate: handleVoiceTranscriptUpdate,
      debounceMs: 3000,
    });

  // Set up video element when stream changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setReadyToCapture(false);
      return;
    }

    video.srcObject = stream;

    const handleLoaded = () => {
      setReadyToCapture(true);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [stream]);

  // Reset readyToCapture when sharing stops
  useEffect(() => {
    if (!isSharing) setReadyToCapture(false);
  }, [isSharing]);

  const captureScreenFrame = (): string | null => {
    if (!stream || !readyToCapture) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    if (!video.videoWidth || !video.videoHeight) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/png").split(",")[1];
  };

  const handleSubmitAll = async () => {
    const text = query || transcript || "Analyze my code";
    const promises: Promise<any>[] = [];

    promises.push(analyze("assistant", text));
    promises.push(analyze("correction", `Please review and correct the following code or query: ${text}`));
    promises.push(analyze("debug", `Debug and find issues in the following: ${text}`));

    if (transcript) {
      promises.push(analyze("voice", `Voice transcript analysis: ${transcript}`));
    }

    if (isSharing && stream && readyToCapture) {
      const frame = captureScreenFrame();
      if (frame) {
        promises.push(analyze("vision", `Analyze this screen share showing code. ${text}`, frame));
      }
    }

    await Promise.allSettled(promises);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        analyze("voice", `Voice transcript analysis: ${transcript}`);
      }
    } else {
      clearTranscript();
      startListening();
    }
  };

  const handleScreenShare = async () => {
    if (isSharing) {
      stopSharing();
    } else {
      await startSharing();
    }
  };

  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const autoAnalyzeRef = useRef(false);

  const handleScreenAnalyze = useCallback(() => {
    if (isSharing && stream && readyToCapture) {
      const frame = captureScreenFrame();
      if (frame) {
        analyze(
          "vision",
          `You are analyzing a live screen capture. Look at the code visible on screen and:
1. Identify what language/framework is being used
2. Explain what the code does line by line
3. Find any bugs, errors, or anti-patterns
4. Suggest corrections with corrected code snippets
5. Rate the code quality (1-10)

${query ? `User's additional context: ${query}` : "Analyze everything you see."}`,
          frame
        );
      }
    }
  }, [isSharing, stream, readyToCapture, query, analyze]);

  useEffect(() => {
    autoAnalyzeRef.current = autoAnalyze;
  }, [autoAnalyze]);

  useEffect(() => {
    if (!autoAnalyze || !isSharing || !stream || !readyToCapture) return;
    handleScreenAnalyze();
    const interval = setInterval(() => {
      if (autoAnalyzeRef.current) handleScreenAnalyze();
    }, 8000);
    return () => clearInterval(interval);
  }, [autoAnalyze, isSharing, stream, readyToCapture, handleScreenAnalyze]);

  const hasAnyResults =
    results.voice || results.vision || results.correction || results.assistant || results.debug;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      {/* Hidden video for capture - managed via useEffect */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      <nav className="flex items-center justify-between px-6 md:px-10 py-4">
        <Link
          to="/"
          className="font-display text-2xl uppercase tracking-tight text-foreground hover:text-foreground/70 transition-colors"
        >
          COLLA
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-body font-medium text-foreground hover:text-foreground/70 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 text-sm font-body font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <div className={`flex-1 flex flex-col items-center px-6 ${hasAnyResults || isSharing ? "pt-6" : "justify-center -mt-20"}`}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-5xl md:text-7xl tracking-tight text-foreground mb-8"
        >
          COLLA
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-2xl"
        >
          <div className="relative flex items-center w-full border border-border bg-card rounded-full shadow-lg hover:shadow-xl transition-shadow px-5 py-3 gap-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitAll()}
              placeholder="Ask anything about your code..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-body text-base"
            />
            <button
              onClick={handleSubmitAll}
              disabled={!query && !transcript && !isSharing}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Mic permission warning */}
          {hasPermission === false && (
            <p className="text-xs text-destructive font-body mt-2 text-center">
              Microphone access denied. Please allow microphone in your browser settings.
            </p>
          )}

          {/* Voice transcript display */}
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 px-4 py-2 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-xs font-body font-medium text-muted-foreground">Listening... (analyzing every 3s)</span>
              </div>
              <p className="text-sm font-body text-foreground">
                {transcript || "Start speaking..."}
              </p>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            <button
              onClick={handleVoiceToggle}
              className={`flex items-center gap-2 px-5 py-2.5 font-body text-sm font-medium rounded-full transition-colors ${
                isListening
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? "Stop Voice" : "Voice"}
            </button>
            <button
              onClick={handleScreenShare}
              className={`flex items-center gap-2 px-5 py-2.5 font-body text-sm font-medium rounded-full transition-colors ${
                isSharing
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              <Monitor className="w-4 h-4" />
              {isSharing ? "Stop Sharing" : "Share Screen"}
            </button>
            {isSharing && (
              <>
                <button
                  onClick={handleScreenAnalyze}
                  disabled={loading.vision || !readyToCapture}
                  className="flex items-center gap-2 px-5 py-2.5 font-body text-sm font-medium rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  {loading.vision ? "Analyzing..." : !readyToCapture ? "Preparing..." : "Analyze Screen"}
                </button>
                <button
                  onClick={() => setAutoAnalyze((v) => !v)}
                  className={`flex items-center gap-2 px-5 py-2.5 font-body text-sm font-medium rounded-full transition-colors ${
                    autoAnalyze
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                  }`}
                >
                  {autoAnalyze ? "⏸ Stop Auto" : "▶ Auto Analyze"}
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Screen share preview */}
        <AnimatePresence>
          {isSharing && stream && (
            <div className="w-full max-w-4xl mt-6">
              <ScreenSharePreview stream={stream} onStop={stopSharing} />
            </div>
          )}
        </AnimatePresence>

        {/* Analysis Result Cards */}
        <AnimatePresence>
          {hasAnyResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-6xl mt-8 mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnalysisCard
                title="Code Assistant"
                icon={<Code className="w-4 h-4 text-foreground" />}
                result={results.assistant?.result || null}
                loading={loading.assistant}
                accentColor="hsl(var(--secondary))"
              />
              <AnalysisCard
                title="Voice Analysis"
                icon={<Mic className="w-4 h-4 text-foreground" />}
                result={results.voice?.result || null}
                loading={loading.voice}
                accentColor="hsl(150 60% 45% / 0.15)"
              >
                {transcript && !results.voice && (
                  <p className="text-xs text-muted-foreground font-body mb-2">
                    Transcript: "{transcript}"
                  </p>
                )}
              </AnalysisCard>
              <AnalysisCard
                title="Screen Share Analysis"
                icon={<Monitor className="w-4 h-4 text-foreground" />}
                result={results.vision?.result || null}
                loading={loading.vision}
                accentColor="hsl(200 60% 50% / 0.15)"
              >
                {isSharing && !results.vision && (
                  <p className="text-xs text-muted-foreground font-body">
                    {readyToCapture
                      ? 'Screen sharing active. Click "Analyze Screen" to capture.'
                      : "Preparing screen capture..."}
                  </p>
                )}
              </AnalysisCard>
              <AnalysisCard
                title="Code Correction"
                icon={<Wand2 className="w-4 h-4 text-foreground" />}
                result={results.correction?.result || null}
                loading={loading.correction}
                accentColor="hsl(40 80% 55% / 0.15)"
              />
              <AnalysisCard
                title="Real-time Debugger"
                icon={<Bug className="w-4 h-4 text-foreground" />}
                result={results.debug?.result || null}
                loading={loading.debug}
                accentColor="hsl(0 84% 60% / 0.15)"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
