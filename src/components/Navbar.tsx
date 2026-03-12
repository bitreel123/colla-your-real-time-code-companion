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
      <div />
    </motion.nav>
  );
}
