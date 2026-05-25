import { motion } from "framer-motion";
import LapsLogoAnimation from "./LapsLogoAnimation";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#f8fafc" }}
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-6 px-8">
        <LapsLogoAnimation loop />
        <Dots />
      </div>
    </motion.div>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Carregando" role="status">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-laps-blue"
          style={{
            animation: `laps-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
