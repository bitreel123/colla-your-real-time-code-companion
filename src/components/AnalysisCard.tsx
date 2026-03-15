import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

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
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-border"
        style={{ background: accentColor }}
      >
        {icon}
        <span className="font-body text-sm font-semibold text-foreground">{title}</span>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
      </div>

      <div className="p-4 flex-1 overflow-auto max-h-80">
        {children}
        {result && (
          <div className="prose prose-sm max-w-none font-body text-foreground/90
            prose-headings:font-body prose-headings:text-foreground prose-headings:text-sm prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
            prose-p:text-sm prose-p:leading-relaxed prose-p:my-1
            prose-code:text-xs prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground
            prose-pre:bg-secondary prose-pre:rounded-md prose-pre:p-3 prose-pre:overflow-x-auto prose-pre:text-xs
            prose-li:text-sm prose-li:my-0.5
            prose-strong:text-foreground
          ">
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
