import { motion } from "framer-motion";
import { MessageSquare, Monitor, Mic, Sparkles } from "lucide-react";
import mockupAIChat from "@/assets/mockup-ai-chat.png";

const capabilities = [
  {
    icon: MessageSquare,
    title: "Context-Aware Conversations",
    description:
      "Ask questions about your code naturally. Colla remembers your entire session — files opened, errors hit, and changes made.",
  },
  {
    icon: Monitor,
    title: "Screen-Aware Debugging",
    description:
      "Share your screen and let the AI see exactly what you see. It reads your IDE, terminal, and browser in real time.",
  },
  {
    icon: Mic,
    title: "Voice-First Interaction",
    description:
      "Describe your problem out loud. Colla listens, understands, and responds with spoken and written solutions instantly.",
  },
  {
    icon: Sparkles,
    title: "Proactive Suggestions",
    description:
      "Don't wait for bugs. Colla continuously scans your workflow and surfaces issues, optimizations, and security risks before they ship.",
  },
];

export default function ConversationalAISection() {
  return (
    <section className="relative py-24 md:py-40 px-6 md:px-12 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-xl overflow-hidden border border-border shadow-2xl">
              {/* Window chrome */}
              <div className="bg-card px-4 py-3 flex items-center gap-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-accent/40" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                </div>
                <span className="text-xs font-body text-muted-foreground">Colla Chat — Live Session</span>
              </div>
              <img
                src={mockupAIChat}
                alt="Colla AI chat interface showing real-time debugging conversation with a developer"
                className="w-full"
                loading="lazy"
              />
            </div>

            {/* Floating accent element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-6 -right-4 md:-right-8 bg-accent text-accent-foreground p-4 rounded-lg shadow-xl"
            >
              <div className="text-xs font-body opacity-80 mb-1">Session Insights</div>
              <div className="text-lg font-display">23 issues resolved</div>
            </motion.div>
          </motion.div>

          {/* Right — Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm font-body tracking-widest uppercase text-muted-foreground">
                Conversational AI
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display tracking-tight mb-6"
            >
              Build with an AI
              <br />
              that <span className="italic text-accent">understands</span>
              <br />
              your workflow
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground font-body mb-12 leading-relaxed"
            >
              Not just another chatbot. Colla is a real-time pair programmer that sees your screen, hears your voice, and understands the full context of your work.
            </motion.p>

            {/* Capability cards */}
            <div className="space-y-6">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <cap.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-body font-semibold mb-1">{cap.title}</h3>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
