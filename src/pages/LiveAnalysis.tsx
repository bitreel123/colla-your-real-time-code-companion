import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Monitor, Play, Square, Trash2, LogOut, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useScreenShare } from "@/hooks/useScreenShare";
import { useLiveAnalysis } from "@/hooks/useLiveAnalysis";
import LiveAnalysisFeed from "@/components/LiveAnalysisFeed";

export default function LiveAnalysis() {
  const { user, signOut } = useAuth();
  const { isSharing, stream, startSharing, stopSharing } = useScreenShare();
  const { entries, analyzing, running, start, stop, clear, setCaptureFunction } = useLiveAnalysis();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [readyToCapture, setReadyToCapture] = useState(false);

  // Set up video when stream changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setReadyToCapture(false);
      return;
    }
    video.srcObject = stream;
    const handleLoaded = () => setReadyToCapture(true);
    video.addEventListener("loadedmetadata", handleLoaded);
    video.play().catch(() => {});
    return () => video.removeEventListener("loadedmetadata", handleLoaded);
  }, [stream]);

  useEffect(() => {
    if (!isSharing) {
      setReadyToCapture(false);
      stop();
    }
  }, [isSharing, stop]);

  // Register capture function
  const captureFrame = useCallback((): string | null => {
    if (!stream || !readyToCapture) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/png").split(",")[1];
  }, [stream, readyToCapture]);

  useEffect(() => {
    setCaptureFunction(captureFrame);
  }, [captureFrame, setCaptureFunction]);

  const handleToggleAnalysis = () => {
    if (running) {
      stop();
    } else {
      start(7000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen">
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-display text-2xl uppercase tracking-tight text-foreground hover:text-foreground/70 transition-colors">
            COLLA
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/search" className="px-3 py-1.5 text-xs font-body font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
              Search
            </Link>
            <span className="px-3 py-1.5 text-xs font-body font-medium text-foreground bg-secondary rounded-md">
              Live
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-body text-muted-foreground hidden sm:block">{user?.email}</span>
          <button onClick={signOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Screen share */}
        <div className="md:w-1/2 flex flex-col border-r border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-body font-medium text-foreground">Screen Share</span>
              {isSharing && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
            </div>
            <div className="flex items-center gap-2">
              {!isSharing ? (
                <button
                  onClick={startSharing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Share Screen
                </button>
              ) : (
                <>
                  <button
                    onClick={handleToggleAnalysis}
                    disabled={!readyToCapture}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium rounded-md transition-colors ${
                      running
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "bg-accent text-accent-foreground hover:bg-accent/80"
                    } disabled:opacity-50`}
                  >
                    {running ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {running ? "Stop Analysis" : readyToCapture ? "Start Analysis" : "Preparing..."}
                  </button>
                  <button
                    onClick={stopSharing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
                  >
                    Stop Share
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-foreground/[0.02] overflow-hidden">
            {isSharing && stream ? (
              <video
                ref={(el) => {
                  if (el && stream) {
                    el.srcObject = stream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8">
                <Monitor className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">Share your screen to begin live analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Analysis feed */}
        <div className="md:w-1/2 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-body font-medium text-foreground">Live Analysis</span>
              {analyzing && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent ml-1" />}
              {running && (
                <span className="ml-2 text-[10px] font-body font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              )}
            </div>
            {entries.length > 0 && (
              <button
                onClick={clear}
                className="flex items-center gap-1 px-2 py-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <LiveAnalysisFeed entries={entries} />
        </div>
      </div>
    </div>
  );
}
