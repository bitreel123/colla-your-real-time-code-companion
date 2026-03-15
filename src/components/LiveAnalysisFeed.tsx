import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { LiveAnalysisEntry } from "@/hooks/useLiveAnalysis";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function LiveAnalysisFeed({ entries }: { entries: LiveAnalysisEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="font-body text-sm text-muted-foreground text-center">
          Start screen sharing and enable live analysis to see real-time insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 p-4">
      <AnimatePresence initial={false}>
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs font-body font-medium text-muted-foreground">
                {formatTime(entry.timestamp)}
              </span>
            </div>
            <div className="prose prose-sm max-w-none font-body text-foreground/90 
              prose-headings:font-body prose-headings:text-foreground prose-headings:text-sm prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
              prose-p:text-sm prose-p:leading-relaxed prose-p:my-1
              prose-code:text-xs prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground
              prose-pre:bg-secondary prose-pre:rounded-md prose-pre:p-3 prose-pre:overflow-x-auto prose-pre:text-xs
              prose-li:text-sm prose-li:my-0.5
              prose-strong:text-foreground
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.result}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
