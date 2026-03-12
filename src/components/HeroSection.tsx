import { motion } from "framer-motion";
import { Suspense, lazy } from "react";

const HeroSphere = lazy(() => import("./HeroSphere"));

export default function HeroSection() {
  return (
    <section className="relative min-h-screen grid-lines overflow-hidden">
      {/* Vertical grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-grid-line"
            style={{ left: `${(i + 1) * (100 / 10)}%` }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen pt-24 px-6 md:px-12">
        {/* Left: Text */}
        <div className="flex flex-col justify-center lg:w-[45%] py-12">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight font-display"
          >
            The Real-Time AI Search Engine for Developers
          </motion.h1>

          <motion.a
            href="/search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block mt-8 w-fit bg-primary text-primary-foreground px-10 py-4 text-base font-medium tracking-wide font-body"
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Start →
            </motion.span>
          </motion.a>
        </div>

        {/* Right: 3D Sphere + description card */}
        <div className="relative lg:w-[55%] flex items-center justify-center min-h-[500px]">
          <Suspense fallback={<div className="w-full h-full" />}>
            <HeroSphere />
          </Suspense>

          {/* Description card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute bottom-16 left-4 right-4 md:left-8 md:right-auto md:max-w-md bg-background/90 backdrop-blur-sm p-6 md:p-8 z-20"
          >
            <p className="text-foreground/80 text-base md:text-lg leading-relaxed font-body">
              Search, debug, and understand code instantly. Share your screen, talk to the AI, and solve programming problems in real time.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
