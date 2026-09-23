import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   LISTENER FRAME SEQUENCE
========================================================= */

const LISTENER_FRAME_COUNT = 73;
const LISTENER_ANIMATION_DURATION = 4000;

const LISTENER_FRAMES = Array.from(
  { length: LISTENER_FRAME_COUNT },
  (_, index) => `/listener-frames/frame_${String(index).padStart(3, "0")}.webp`,
);

/* =========================================================
   SPLASH SCREEN
========================================================= */

export default function SplashScreen({ onComplete, duration = 4300 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [listenerFrame, setListenerFrame] = useState(0);

  const animationFrameRef = useRef(null);

  /* =======================================================
     PRELOAD LISTENER FRAMES
  ======================================================= */

  useEffect(() => {
    const preloadImages = LISTENER_FRAMES.map((src) => {
      const img = new Image();
      img.src = src;
      img.decoding = "async";
      return img;
    });

    return () => {
      preloadImages.length = 0;
    };
  }, []);

  /* =======================================================
     LISTENER FRAME ANIMATION
  ======================================================= */

  useEffect(() => {
    const startTime = performance.now();

    const animateListener = (currentTime) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / LISTENER_ANIMATION_DURATION, 1);

      const newFrame = Math.min(
        LISTENER_FRAME_COUNT - 1,
        Math.floor(progress * LISTENER_FRAME_COUNT),
      );

      setListenerFrame((previousFrame) =>
        previousFrame === newFrame ? previousFrame : newFrame,
      );

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateListener);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateListener);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /* =======================================================
     SPLASH TIMER
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);

      if (onComplete) {
        setTimeout(onComplete, 450);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(6px)",
          }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070709] select-none overflow-hidden"
        >
          {/* =================================================
              AMBIENT BACKGROUND
          ================================================= */}

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.15, 0.28, 0.15],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-transparent blur-[120px]"
            />

            <motion.div
              animate={{
                x: [-10, 15, -10],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-amber-400/15 blur-[100px]"
            />
          </div>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="relative flex flex-col items-center justify-center">
            {/* =================================================
                FOLDER + MUSIC + MAN
            ================================================= */}

            <motion.div
              initial={{
                scale: 0.85,
                y: 18,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
                duration: 0.65,
              }}
              className="relative flex items-center justify-center pl-6 sm:pl-8"
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center"
              >
                {/* =================================================
                    BACKLIGHT
                ================================================= */}

                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-[36px] pointer-events-none" />

                {/* =================================================
                    YELLOW FOLDER
                ================================================= */}

                <div className="relative w-full h-full flex items-center justify-center z-10">
                  <img
                    src="/audix-folder.webp"
                    alt="Audix Folder"
                    className="w-full h-full object-contain drop-shadow-[0_16px_36px_rgba(245,158,11,0.28)]"
                    draggable={false}
                  />
                </div>

                {/* =================================================
                    RED MUSIC NOTE
                ================================================= */}

                <div className="absolute left-1/2 top-[63%] -translate-x-1/2 -translate-y-1/2 w-[43%] h-[43%] flex items-center justify-center pointer-events-none z-20">
                  <img
                    src="/audix-music-note.webp"
                    alt="Audix Music Note"
                    className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(239,68,68,0.42)]"
                    draggable={false}
                  />
                </div>

                {/* =================================================
                    ANIMATED MAN

                    Increased one more step.
                ================================================= */}

                <div
                  className="
                    absolute

                    -left-[21%]
                    sm:-left-[22%]

                    -bottom-[4%]
                    sm:-bottom-[5%]

                    w-[48%]
                    sm:w-[50%]

                    h-[124%]
                    sm:h-[127%]

                    pointer-events-none
                    z-30

                    flex
                    items-end
                    justify-center
                  "
                >
                  <img
                    src={LISTENER_FRAMES[listenerFrame]}
                    alt="Audix Listener Man"
                    className="w-full h-full object-contain object-bottom"
                    draggable={false}
                    decoding="sync"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* =================================================
                AUDIX BRAND
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.6,
                duration: 0.5,
              }}
              className="mt-5 flex flex-col items-center text-center z-10"
            >
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-red-500 via-rose-500 to-red-400 bg-clip-text text-transparent drop-shadow-[0_2px_24px_rgba(239,68,68,0.45)]">
                Audix
              </h1>

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 0.85,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.4,
                }}
                className="mt-2 flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />

                <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-stone-300 uppercase">
                  Live Music & Unlimited Vibes
                </span>
              </motion.div>
            </motion.div>

            {/* =================================================
                EQUALIZER
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.9,
                duration: 0.4,
              }}
              className="flex items-end gap-1.5 mt-5 h-5 z-10"
            >
              {[0.35, 0.85, 0.55, 1.0, 0.65, 0.9, 0.4].map((heightRatio, i) => (
                <motion.span
                  key={i}
                  animate={{
                    height: [
                      `${heightRatio * 100}%`,
                      `${(1.15 - heightRatio) * 100}%`,
                      `${heightRatio * 100}%`,
                    ],
                  }}
                  transition={{
                    duration: 0.7 + i * 0.08,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1 bg-gradient-to-t from-red-500 via-rose-500 to-red-400 rounded-full min-h-[4px] shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
