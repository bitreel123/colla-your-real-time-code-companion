import { useState, useRef, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase-safe";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GeminiChatProps {
  captureFrame: () => string | null;
  isSharing: boolean;
}

export default function GeminiChat({ captureFrame, isSharing }: GeminiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const client = await getSupabaseClient();
      if (!client) throw new Error("Backend not available");

      // Build conversation history for context
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Capture screen frame if sharing
      let imageBase64: string | undefined;
      if (isSharing) {
        const frame = captureFrame();
        if (frame) imageBase64 = frame;
      }

      const { data, error } = await client.functions.invoke("gemini-analyze", {
        body: {
          mode: "chat",
          messages: apiMessages,
          imageBase64,
        },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.result || "No response",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "Failed to get response"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, captureFrame, isSharing]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bot className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="font-body text-xs text-muted-foreground">
                Chat with Gemini about your code.
                {isSharing ? " It can see your screen!" : " Share your screen for visual analysis."}
              </p>
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none font-body text-foreground/90
                    prose-headings:font-body prose-headings:text-foreground prose-headings:text-xs prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1
                    prose-p:text-xs prose-p:leading-relaxed prose-p:my-0.5
                    prose-code:text-[10px] prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground
                    prose-pre:bg-secondary prose-pre:rounded-md prose-pre:p-2 prose-pre:overflow-x-auto prose-pre:text-[10px]
                    prose-li:text-xs prose-li:my-0
                    prose-strong:text-foreground
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="font-body text-xs">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
            </div>
            <div className="bg-secondary/60 rounded-lg px-3 py-2">
              <p className="font-body text-xs text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={isSharing ? "Ask about what's on screen..." : "Ask a coding question..."}
            className="flex-1 px-3 py-1.5 rounded-md border border-input bg-background text-foreground font-body text-xs outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-1.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
