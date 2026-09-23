import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete, duration = 2400 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 400); // Allow exit fade transition to complete smoothly
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] select-none overflow-hidden"
        >
          {/* Ambient Warm Studio Glow in Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.12, 0.24, 0.12],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-amber-500/20 blur-[120px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.28, 0.15],
              }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-rose-500/20 blur-[120px]"
            />
          </div>

          {/* Center Brand Artwork Animation Container */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* 1. Authentic Hand-Drawn Yellow Folder Layer */}
              <motion.div
                initial={{ scale: 0.7, y: 25, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 22,
                  duration: 0.6,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <img
                  src="/audix-folder.png"
                  alt="Audix Folder"
                  className="w-full h-full object-contain drop-shadow-[0_16px_36px_rgba(245,158,11,0.28)]"
                  draggable={false}
                />
              </motion.div>

              {/* 2. Authentic Hand-Drawn Red Double Music Note (♫) */}
              {/* Emerges out from the folder and bounces into front position */}
              <motion.div
                initial={{
                  y: 45,
                  scale: 0.35,
                  opacity: 0,
                  rotate: -18,
                }}
                animate={{
                  y: [45, -28, 0],
                  scale: [0.35, 1.18, 1.0],
                  opacity: [0, 1, 1],
                  rotate: [-18, 8, 0],
                }}
                transition={{
                  delay: 0.35,
                  duration: 0.85,
                  times: [0, 0.55, 1],
                  type: "spring",
                  stiffness: 320,
                  damping: 15,
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                {/* Subtle continuous rhythmic float after settling */}
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 1.2, 0, -1.2, 0],
                  }}
                  transition={{
                    delay: 1.2,
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src="/audix-music-note.png"
                    alt="Audix Music Note"
                    className="w-full h-full object-contain drop-shadow-[0_12px_28px_rgba(239,68,68,0.45)]"
                    draggable={false}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Brand Title & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 flex flex-col items-center text-center z-10"
            >
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.25)]">
                Audix
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="text-xs sm:text-sm font-medium text-stone-400 tracking-wider uppercase mt-1.5 flex items-center gap-1.5"
              >
                <span>Live Music</span>
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span>Unlimited Vibes</span>
              </motion.p>
            </motion.div>

            {/* Dancing Equalizer Audio Wave Bars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85, duration: 0.4 }}
              className="flex items-end gap-1.5 mt-5 h-6 z-10"
            >
              {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((heightRatio, i) => (
                <motion.span
                  key={i}
                  animate={{
                    height: [
                      `${heightRatio * 100}%`,
                      `${(1.1 - heightRatio) * 100}%`,
                      `${heightRatio * 100}%`,
                    ],
                  }}
                  transition={{
                    duration: 0.75 + i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 bg-gradient-to-t from-amber-500 to-rose-500 rounded-full min-h-[4px]"
                />
              ))}
            </motion.div>
          </div>

          {/* Quick Skip button at bottom */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            whileHover={{ opacity: 1 }}
            onClick={() => {
              setIsVisible(false);
              if (onComplete) onComplete();
            }}
            className="absolute bottom-6 text-xs text-stone-500 hover:text-stone-300 transition tracking-wider uppercase cursor-pointer"
          >
            Click anywhere to enter →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
