import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
    >
      <div className="font-display text-3xl tracking-tight font-normal uppercase">
        COLLA
      </div>

      <div className="hidden md:flex items-center gap-10 font-body text-sm tracking-wide">
        <a href="#features" className="text-foreground/70 hover:text-foreground transition-colors">Features</a>
        <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">How It Works</a>
        <a href="#docs" className="text-foreground/70 hover:text-foreground transition-colors">Docs</a>
      </div>

      <a
        href="#get-started"
        className="bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
      >
        Get Started →
      </a>
    </motion.nav>
  );
}
