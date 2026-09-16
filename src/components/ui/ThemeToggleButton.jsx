import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { usePlayer } from "@/context/PlayerContext";

export function CuteSongWave({ isPlaying = false, isDark = false, className = "" }) {
  return (
    <div
      className={`flex items-center gap-[2.5px] h-3.5 px-0.5 shrink-0 transition-opacity duration-200 ${className}`}
      aria-hidden="true"
    >
      <span
        style={!isPlaying ? { height: "4px" } : undefined}
        className={`w-[2.5px] rounded-full transition-all duration-300 ${
          isPlaying ? "animate-wave-1" : ""
        } ${
          isDark
            ? "bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.7)] group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
        }`}
      />
      <span
        style={!isPlaying ? { height: "12px" } : undefined}
        className={`w-[2.5px] rounded-full transition-all duration-300 ${
          isPlaying ? "animate-wave-2" : ""
        } ${
          isDark
            ? "bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.7)] group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
        }`}
      />
      <span
        style={!isPlaying ? { height: "6px" } : undefined}
        className={`w-[2.5px] rounded-full transition-all duration-300 ${
          isPlaying ? "animate-wave-3" : ""
        } ${
          isDark
            ? "bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.7)] group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
        }`}
      />
      <span
        style={!isPlaying ? { height: "9px" } : undefined}
        className={`w-[2.5px] rounded-full transition-all duration-300 ${
          isPlaying ? "animate-wave-4" : ""
        } ${
          isDark
            ? "bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.7)] group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
        }`}
      />
    </div>
  );
}

export default function ThemeToggleButton({
  className = "",
  variant = "circle",
  blur = false,
}) {
  const { theme, toggleTheme } = useTheme();
  const { isPlaying } = usePlayer();
  const isDark = theme === "dark";

  const handleToggle = (e) => {
    let clickX = window.innerWidth - 70;
    let clickY = 32;
    if (e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      clickX = Math.round(rect.left + rect.width / 2);
      clickY = Math.round(rect.top + rect.height / 2);
    }
    toggleTheme({ variant, x: clickX, y: clickY, start: `${clickX}px ${clickY}px`, blur });
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        group relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-full px-3 text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer border
        ${
          isDark
            ? "border-white/10 bg-white/10 text-white hover:border-red-500 hover:text-white"
            : "border-stone-300/80 bg-[#faf8f5] text-stone-800 hover:border-red-500 hover:text-white"
        }
        ${className}
      `}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {/* Sun / Moon Icon with smooth rotation transition */}
      <div className="relative z-10 flex items-center justify-center shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.3 }}
              className="text-amber-300 group-hover:text-white transition-colors duration-300"
            >
              <Sun size={17} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.3 }}
              className="text-stone-700 group-hover:text-white transition-colors duration-300"
            >
              <Moon size={17} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cute Song Playing Wave Visualizer */}
      <CuteSongWave isPlaying={isPlaying} isDark={isDark} className="relative z-10" />

      {/* Interactive Hover Red Fill Effect */}
      <div className="absolute inset-0 z-0 bg-red-500 opacity-0 scale-95 rounded-full transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
    </button>
  );
}
