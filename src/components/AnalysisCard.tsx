import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnalysisCardProps {
  title: string;
  icon: ReactNode;
  result: string | null;
  loading: boolean;
  accentColor: string;
  children?: ReactNode;
}

export default function AnalysisCard({
  title,
  icon,
  result,
  loading,
  accentColor,
  children,
}: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-border bg-card shadow-md overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-border"
        style={{ background: accentColor }}
      >
        {icon}
        <span className="font-body text-sm font-semibold text-foreground">{title}</span>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-auto max-h-80">
        {children}
        {result && (
          <div className="prose prose-sm max-w-none font-body text-sm text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        )}
        {!result && !loading && (
          <p className="text-sm text-muted-foreground font-body italic">
            No analysis yet. Submit a query to get started.
          </p>
        )}
      </div>
    </motion.div>
  );
}
