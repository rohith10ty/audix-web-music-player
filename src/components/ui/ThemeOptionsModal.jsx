import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, X, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const VARIANTS = ["circle", "circle-blur", "rectangle"];
const STARTS = ["top-right", "center", "top-left", "bottom-up", "top-down", "left-right"];

export default function ThemeOptionsModal({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const [selectedVariant, setSelectedVariant] = useState("circle");
  const [selectedStart, setSelectedStart] = useState("top-right");
  const [blur, setBlur] = useState(false);

  if (!isOpen) return null;

  const handleTestTransition = () => {
    toggleTheme({
      variant: selectedVariant,
      start: selectedStart,
      blur,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className={`
            relative z-10 w-full max-w-[380px] rounded-2xl border p-5 shadow-2xl transition-colors
            ${
              theme === "dark"
                ? "bg-[#181818] border-white/10 text-white"
                : "bg-[#faf8f5] border-stone-300 text-stone-900"
            }
          `}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-500">
                <Sparkles size={16} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Theme Transition Styles
              </h3>
            </div>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 p-1">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Animation Variant */}
            <div>
              <label className="block font-bold text-stone-500 dark:text-[#a7a7a7] mb-1.5 uppercase tracking-wider text-[11px]">
                Animation Variant
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {VARIANTS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`
                      rounded-lg py-1.5 px-2 font-semibold capitalize transition
                      ${
                        selectedVariant === v
                          ? "bg-red-500 text-white shadow-sm"
                          : theme === "dark"
                          ? "bg-white/5 hover:bg-white/10 text-white"
                          : "bg-stone-200/70 hover:bg-stone-200 text-stone-800"
                      }
                    `}
                  >
                    {v.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Origin */}
            <div>
              <label className="block font-bold text-stone-500 dark:text-[#a7a7a7] mb-1.5 uppercase tracking-wider text-[11px]">
                Start Origin
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {STARTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStart(s)}
                    className={`
                      rounded-lg py-1.5 px-2 font-semibold capitalize transition text-[11px]
                      ${
                        selectedStart === s
                          ? "bg-red-500 text-white shadow-sm"
                          : theme === "dark"
                          ? "bg-white/5 hover:bg-white/10 text-white"
                          : "bg-stone-200/70 hover:bg-stone-200 text-stone-800"
                      }
                    `}
                  >
                    {s.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Motion Blur */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-stone-500 dark:text-[#a7a7a7] uppercase tracking-wider text-[11px]">
                Motion Blur
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setBlur(false)}
                  className={`
                    rounded-lg px-3 py-1 font-semibold transition
                    ${
                      !blur
                        ? "bg-red-500 text-white"
                        : theme === "dark"
                        ? "bg-white/5 text-white"
                        : "bg-stone-200 text-stone-800"
                    }
                  `}
                >
                  Off
                </button>
                <button
                  onClick={() => setBlur(true)}
                  className={`
                    rounded-lg px-3 py-1 font-semibold transition
                    ${
                      blur
                        ? "bg-red-500 text-white"
                        : theme === "dark"
                        ? "bg-white/5 text-white"
                        : "bg-stone-200 text-stone-800"
                    }
                  `}
                >
                  On
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-stone-300/60 dark:border-white/10">
            <button
              onClick={handleTestTransition}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-red-500 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-400 transition"
            >
              Test Transition Now ✨
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
