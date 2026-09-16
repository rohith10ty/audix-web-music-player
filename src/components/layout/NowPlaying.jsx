import { Check, Ellipsis, Heart, Maximize2, Music2, Sparkles, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BorderBeam } from "@/components/ui/border-beam";
import { ScrollingWaveform } from "@/components/ui/waveform";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

export default function NowPlaying() {
  const { theme } = useTheme();
  const { currentTrack, isPlaying, progress, seekProgress, toggleLike, isLiked } = usePlayer();

  const liked = isLiked(currentTrack.id);

  return (
    <aside
      className={`
        spotify-panel relative hidden min-h-0 overflow-hidden 2xl:flex flex-col transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-[#121212] text-white border-white/[0.06]"
            : "bg-[#faf8f5] text-stone-900 border-stone-300/60 shadow-sm"
        }
      `}
    >
      <BorderBeam
        size={70}
        duration={9}
        colorFrom={theme === "dark" ? "rgba(255,255,255,.03)" : "rgba(239,68,68,.1)"}
        colorTo={theme === "dark" ? "rgba(239,68,68,.45)" : "rgba(239,68,68,.5)"}
      />

      {/* Stable Top Header: Shows Song Name and stays pinned when scrolling */}
      <div
        className={`
          relative z-20 flex shrink-0 items-center justify-between px-4 py-3.5 border-b transition-colors
          ${
            theme === "dark"
              ? "bg-[#121212] border-white/[0.06]"
              : "bg-[#faf8f5] border-stone-300/60"
          }
        `}
      >
        <h2 className="truncate text-[15px] font-bold tracking-tight pr-2" title={currentTrack.title}>
          {currentTrack.title}
        </h2>

        <div
          className={`
          flex items-center gap-2 shrink-0
          ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-400"}
        `}
        >
          {isPlaying && (
            <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold mr-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              Playing
            </div>
          )}
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`
              p-1 transition
              ${liked ? "text-red-500" : "hover:text-current"}
            `}
            title={liked ? "Liked" : "Like song"}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="now-playing-scroll-container spotify-scrollbar flex-1 overflow-y-auto p-4 pt-3">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTrack.id}
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.97,
              filter: "blur(7px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
            }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Artwork */}
            <div className="overflow-hidden rounded-xl shadow-lg relative group">
              <motion.img
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                src={currentTrack.image}
                alt={currentTrack.title}
                className="aspect-square w-full object-cover"
              />
              {currentTrack.language && (
                <span className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-md">
                  {currentTrack.language}
                </span>
              )}
            </div>

            {/* Song Meta + Favorite Status */}
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-black">
                  {currentTrack.title}
                </h1>

                <p
                  className={`
                  mt-0.5 truncate text-[13.5px] font-medium
                  ${theme === "dark" ? "text-[#b3b3b3]" : "text-stone-500"}
                `}
                >
                  {currentTrack.artist}
                </p>

                {currentTrack.genre && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500">
                    Genre: {currentTrack.genre}
                  </p>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleLike(currentTrack)}
                  className={`
                    p-1 transition
                    ${
                      liked
                        ? "text-red-500"
                        : theme === "dark"
                        ? "text-[#a7a7a7] hover:text-white"
                        : "text-stone-400 hover:text-stone-900"
                    }
                  `}
                >
                  <Heart size={20} fill={liked ? "currentColor" : "none"} />
                </motion.button>
              </div>
            </div>

            {/* Live Audio Waveform Visualizer Card */}
            <div
              className={`
                mt-4 rounded-xl border p-3 transition-colors
                ${
                  theme === "dark"
                    ? "bg-white/[0.04] border-white/5"
                    : "bg-[#f4f0e8] border-stone-300/60"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isPlaying ? "bg-red-500 animate-pulse" : "bg-stone-500"
                    }`}
                  />
                  <p
                    className={`
                    text-[11px] font-bold uppercase tracking-wider
                    ${isPlaying ? "text-red-500" : theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                  `}
                  >
                    {isPlaying ? "Live Audio Wave" : "Audio Waveform (Paused)"}
                  </p>
                </div>
                <span className="text-[10.5px] font-semibold opacity-60">
                  {Math.round(progress)}%
                </span>
              </div>

              <ScrollingWaveform
                height={38}
                barWidth={3}
                barGap={2}
                speed={32}
                fadeEdges={true}
                isPlaying={isPlaying}
                progress={progress}
                interactive={true}
                onSeek={(pct) => seekProgress(pct)}
                activeColor="#ef4444"
                barColor={
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.18)"
                }
              />
            </div>

            {/* About the Artist Card */}
            <div
              className={`
                mt-6 overflow-hidden rounded-xl border transition-colors
                ${
                  theme === "dark"
                    ? "bg-white/[0.04] border-white/5"
                    : "bg-[#f4f0e8] border-stone-300/60"
                }
              `}
            >
              <img
                src={
                  currentTrack.image ||
                  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=85"
                }
                alt=""
                className="h-[135px] w-full object-cover"
              />

              <div className="p-3.5">
                <p
                  className={`
                  text-[12px] font-bold uppercase tracking-wider
                  ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                `}
                >
                  About the artist
                </p>

                <h3 className="mt-1 font-bold text-[15px]">
                  {currentTrack.artist.split(",")[0]}
                </h3>

                <p
                  className={`
                  mt-0.5 text-[12px]
                  ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                `}
                >
                  {currentTrack.language} • Over 12M+ monthly listeners
                </p>
              </div>
            </div>

            {/* Credits Section */}
            <div
              className={`
                mt-3.5 rounded-xl border p-3.5 transition-colors
                ${
                  theme === "dark"
                    ? "bg-white/[0.04] border-white/5"
                    : "bg-[#f4f0e8] border-stone-300/60"
                }
              `}
            >
              <h3 className="text-[13px] font-bold">Credits</h3>

              <div className="mt-2 space-y-1">
                <p className="text-[13px] font-semibold">{currentTrack.artist}</p>
                <p
                  className={`
                  text-[11px]
                  ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                `}
                >
                  Main Artist & Composer
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-white/5 dark:border-white/5 border-stone-300/60">
                <p className="text-[12px] font-medium">{currentTrack.album}</p>
                <p
                  className={`
                  text-[11px]
                  ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                `}
                >
                  Album Production
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}
