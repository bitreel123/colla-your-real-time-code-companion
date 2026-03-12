import { motion } from "framer-motion";
import { Search, Monitor, Mic, Zap } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Instant Code Search",
    description: "Search through documentation, Stack Overflow, and code repos in real time with AI-powered understanding.",
  },
  {
    icon: Monitor,
    title: "Screen Sharing",
    description: "Share your screen and let the AI see exactly what you're working on for context-aware solutions.",
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description: "Talk to the AI naturally. Describe your problem out loud and get instant spoken and written responses.",
  },
  {
    icon: Zap,
    title: "Real-Time Debugging",
    description: "Get instant error explanations, code fixes, and optimization suggestions as you code.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-display tracking-tight mb-16"
        >
          Built for how developers actually work
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-background p-8 md:p-12 group"
            >
              <feature.icon className="w-6 h-6 text-foreground/60 mb-6 group-hover:text-foreground transition-colors" />
              <h3 className="text-2xl font-display mb-3">{feature.title}</h3>
              <p className="text-muted-foreground font-body leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
