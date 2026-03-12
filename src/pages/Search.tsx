import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mic, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav bar */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4">
        <Link
          to="/"
          className="font-display text-2xl uppercase tracking-tight text-foreground"
        >
          COLLA
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-body font-medium text-foreground hover:text-foreground/70 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 text-sm font-body font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-5xl md:text-7xl tracking-tight text-foreground mb-10"
        >
          COLLA
        </motion.h1>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-2xl"
        >
          <div className="relative flex items-center w-full border border-border bg-card rounded-full shadow-lg hover:shadow-xl transition-shadow px-5 py-3 gap-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your code..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-body text-base"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-body text-sm font-medium rounded-full hover:bg-secondary/70 transition-colors">
              <Mic className="w-4 h-4" />
              Voice
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-body text-sm font-medium rounded-full hover:bg-secondary/70 transition-colors">
              <Monitor className="w-4 h-4" />
              Share Screen
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
