import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MonitorOff } from "lucide-react";

interface ScreenSharePreviewProps {
  stream: MediaStream | null;
  onStop: () => void;
}

export default function ScreenSharePreview({ stream, onStop }: ScreenSharePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto mt-8"
    >
      <div className="relative rounded-lg overflow-hidden border border-border bg-card shadow-xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/60 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-body font-medium text-foreground/80">
              Screen sharing active
            </span>
          </div>
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
          >
            <MonitorOff className="w-3.5 h-3.5" />
            Stop sharing
          </button>
        </div>

        {/* Video preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-contain bg-foreground/5"
        />
      </div>
    </motion.div>
  );
}
