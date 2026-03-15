import { motion } from "framer-motion";
import mockupCodeAnalysis from "@/assets/mockup-code-analysis.png";
import mockupScreenShare from "@/assets/mockup-screen-share.png";

export default function ProductShowcase() {
  return (
    <section className="relative py-24 md:py-40 px-6 md:px-12 overflow-hidden bg-foreground">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-background"
            style={{ left: `${(i + 1) * (100 / 13)}%` }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm font-body tracking-widest uppercase text-background/50">
            Real-Time AI Analysis
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display tracking-tight text-background mb-6 max-w-4xl"
        >
          See your code through
          <br />
          <span className="italic text-accent">AI-powered</span> eyes
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-background/60 font-body max-w-2xl mb-16 leading-relaxed"
        >
          Colla watches your screen in real-time, understands your code context, and delivers instant analysis — bugs, optimizations, and security issues surfaced before they ship.
        </motion.p>

        {/* Layered mockup windows — Tavus-inspired */}
        <div className="relative mt-8">
          {/* Main mockup — Code Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10"
          >
            <div className="rounded-lg overflow-hidden border border-background/10 shadow-2xl shadow-accent/5">
              {/* Window chrome */}
              <div className="bg-background/10 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-background/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/40" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs font-body text-background/40 bg-background/5 px-4 py-1 rounded-full">
                    Colla AI — Code Analysis
                  </span>
                </div>
              </div>
              <img
                src={mockupCodeAnalysis}
                alt="Colla AI detecting bugs and suggesting optimizations in real-time code analysis"
                className="w-full"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Secondary mockup — Screen Share (overlapping) */}
          <motion.div
            initial={{ opacity: 0, x: 60, y: 40 }}
            whileInView={{ opacity: 1, x: 0, y: -80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative z-20 ml-auto w-[70%] md:w-[55%] lg:w-[45%] -mt-20"
          >
            <div className="rounded-lg overflow-hidden border border-accent/20 shadow-2xl shadow-accent/10">
              <div className="bg-accent/10 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-accent/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/20" />
                </div>
                <span className="text-xs font-body text-background/50">Screen Share — Live</span>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-accent font-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Recording
                </span>
              </div>
              <img
                src={mockupScreenShare}
                alt="Live screen sharing with AI overlay detecting issues in VS Code"
                className="w-full"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="absolute top-12 -left-2 md:left-8 z-30 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-border"
          >
            <div className="text-xs font-body text-muted-foreground mb-1">Bugs Found</div>
            <div className="text-2xl font-display text-foreground">14</div>
            <div className="text-xs font-body text-accent">↓ 60% fewer in prod</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="absolute bottom-24 left-4 md:left-16 z-30 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-border"
          >
            <div className="text-xs font-body text-muted-foreground mb-1">Avg Response</div>
            <div className="text-2xl font-display text-foreground">0.8s</div>
            <div className="text-xs font-body text-accent">Real-time analysis</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
