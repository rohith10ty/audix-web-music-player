import {
  Activity,
  ChevronDown,
  Heart,
  ListMusic,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { ScrollingWaveform } from "@/components/ui/waveform";

function formatSeconds(sec) {
  if (!sec || isNaN(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const { theme } = useTheme();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    activeQueue,
    isCreatePlaylistOpen,
    togglePlay,
    playNext,
    playPrevious,
    toggleLike,
    isLiked,
    seekProgress,
    handleVolumeChange,
    toggleMute,
    setShuffle,
    toggleRepeat,
    playTrack,
  } = usePlayer();

  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const [useWaveformMode, setUseWaveformMode] = useState(true);

  if (isCreatePlaylistOpen) return null;

  const liked = isLiked(currentTrack.id);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. BOTTOM PLAYER BAR (Mobile Mini-Player + Desktop Permanent Bottom Bar)  */}
      {/* ========================================================================= */}
      <footer
        onClick={() => {
          // Open dedicated mobile player when clicking on mobile
          if (window.innerWidth < 1024) {
            setShowMobilePlayer(true);
          }
        }}
        className={`
          fixed bottom-[68px] left-2 right-2 z-50 flex h-[62px] items-center rounded-2xl border px-3 shadow-2xl backdrop-blur-2xl transition-all duration-200 cursor-pointer lg:cursor-default overflow-hidden lg:overflow-visible
          ${
            theme === "dark"
              ? "bg-[#181818]/80 border-white/10 text-white lg:bg-black lg:border-white/[0.08]"
              : "bg-[#faf8f5]/80 border-stone-300/70 text-stone-800 lg:bg-[#faf8f5] lg:border-stone-300/70"
          }
        `}
      >
        {/* Mobile Full-Card Low-Opacity Progress Fill Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl lg:hidden">
          <div
            className={`
              h-full transition-all duration-200 ease-linear
              ${
                theme === "dark"
                  ? "bg-gradient-to-r from-red-500/25 via-red-500/20 to-rose-500/30"
                  : "bg-gradient-to-r from-red-500/18 via-red-500/14 to-rose-500/22"
              }
            `}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* LEFT: Current Track Artwork & Meta + Favorite Heart + Progress Percentage */}
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 lg:w-[30%] lg:flex-none">
          <motion.img
            key={currentTrack.image}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentTrack.image}
            alt={currentTrack.title}
            className="h-11 w-11 rounded-lg object-cover shadow-sm lg:h-[58px] lg:w-[58px] shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold lg:text-[14.5px]">
              {currentTrack.title}
            </p>

            <p
              className={`
                mt-[2px] truncate text-[11px] lg:text-[12px]
                ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
              `}
            >
              {currentTrack.artist}{" "}
              {currentTrack.language && (
                <span className="text-red-500 font-semibold">
                  • {currentTrack.language}
                </span>
              )}
            </p>
          </div>

          {/* Favorite Heart Button (Red) */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack);
            }}
            className={`
              shrink-0 p-1 transition cursor-pointer
              ${
                liked
                  ? "text-red-500"
                  : theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white"
                  : "text-stone-400 hover:text-stone-900"
              }
            `}
            title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          >
            <Heart
              size={19}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-red-500" : ""}
            />
          </motion.button>

          {/* Mobile Progress Percentage beside Favorite Heart */}
          <div className="lg:hidden shrink-0 flex items-center">
            <span
              className={`
                text-[10px] sm:text-[10.5px] font-black tabular-nums px-1.5 py-0.5 rounded-full
                ${
                  theme === "dark"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-red-50 text-red-600 border border-red-200"
                }
              `}
              title="Song progress"
            >
              {Math.round(progress || 0)}%
            </span>
          </div>
        </div>

        {/* CENTER: Desktop Audio Controls & Scrubbing Progress Bar */}
        <div className="hidden min-w-0 flex-1 flex-col items-center lg:flex">
          <div className="mb-2 flex items-center gap-5">
            {/* Shuffle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShuffle((v) => !v)}
              className={`
                transition cursor-pointer
                ${
                  shuffle
                    ? "text-red-500"
                    : theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-400 hover:text-stone-900"
                }
              `}
              title={shuffle ? "Shuffle is ON" : "Shuffle is OFF"}
            >
              <Shuffle size={17} />
            </motion.button>

            {/* Previous */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              onClick={playPrevious}
              className={`
                transition cursor-pointer
                ${
                  theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-500 hover:text-stone-900"
                }
              `}
              title="Previous song"
            >
              <SkipBack size={20} fill="currentColor" />
            </motion.button>

            {/* Play/Pause Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.85 }}
              onClick={togglePlay}
              className={`
                flex h-10 w-10 items-center justify-center rounded-full shadow-md transition cursor-pointer
                ${
                  theme === "dark"
                    ? "bg-white text-black hover:scale-105"
                    : "bg-stone-900 text-[#faf8f5] hover:scale-105"
                }
              `}
              title={isLoading ? "Buffering..." : isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-current" />
              ) : isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-[2px]" />
              )}
            </motion.button>

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              onClick={playNext}
              className={`
                transition cursor-pointer
                ${
                  theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-500 hover:text-stone-900"
                }
              `}
              title="Next song"
            >
              <SkipForward size={20} fill="currentColor" />
            </motion.button>

            {/* Repeat */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleRepeat}
              className={`
                transition cursor-pointer
                ${
                  repeatMode !== "off"
                    ? "text-red-500"
                    : theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-400 hover:text-stone-900"
                }
              `}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === "one" ? (
                <Repeat1 size={18} />
              ) : (
                <Repeat size={18} />
              )}
            </motion.button>
          </div>

          {/* Progress & Scrolling Waveform Seek Bar */}
          <div className="flex w-full max-w-[620px] items-center gap-3">
            <span
              className={`
              w-9 text-right text-[11px] font-medium shrink-0
              ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
            `}
            >
              {formatSeconds(currentTime)}
            </span>

            {useWaveformMode ? (
              <div className="relative flex-1 flex items-center h-7 px-1 group cursor-pointer">
                <ScrollingWaveform
                  height={26}
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
                      ? "rgba(255, 255, 255, 0.22)"
                      : "rgba(0, 0, 0, 0.18)"
                  }
                  className="w-full"
                />
              </div>
            ) : (
              <input
                aria-label="Song progress"
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={(e) => seekProgress(e.target.value)}
                className="spotify-range flex-1"
                style={{
                  "--progress": `${progress}%`,
                }}
              />
            )}

            <span
              className={`
              w-9 text-[11px] font-medium shrink-0
              ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
            `}
            >
              {currentTrack.duration}
            </span>

            {/* Toggle Waveform Mode Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setUseWaveformMode((v) => !v)}
              className={`
                p-1 rounded-md transition cursor-pointer shrink-0
                ${
                  useWaveformMode
                    ? "text-red-500 bg-red-500/10"
                    : theme === "dark"
                    ? "text-[#888] hover:text-white"
                    : "text-stone-400 hover:text-stone-800"
                }
              `}
              title={
                useWaveformMode
                  ? "Waveform visualizer active (Click for classic slider)"
                  : "Classic slider active (Click for live waveform visualizer)"
              }
            >
              <Activity size={15} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Mini-Player Play/Pause Button */}
        <div className="relative z-10 flex items-center gap-2 lg:hidden ml-auto">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className={`
              flex h-10 w-10 items-center justify-center rounded-full shadow-md cursor-pointer
              ${
                theme === "dark"
                  ? "bg-white text-black"
                  : "bg-stone-900 text-[#faf8f5]"
              }
            `}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-current" />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-[2px]" />
            )}
          </motion.button>
        </div>

        {/* RIGHT: Auxiliary Controls (Queue, Volume, Fullscreen) */}
        <div className="hidden w-[30%] items-center justify-end gap-3 lg:flex">
          {/* Queue Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowQueueModal((v) => !v)}
            className={`
              transition p-1.5 rounded-full cursor-pointer
              ${
                showQueueModal
                  ? "text-red-500 bg-red-500/10"
                  : theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
              }
            `}
            title="Current Queue"
          >
            <ListMusic size={18} />
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`
                transition cursor-pointer
                ${
                  isMuted || volume === 0
                    ? "text-red-400"
                    : theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-500 hover:text-stone-900"
                }
              `}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} />
              ) : volume < 50 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </motion.button>

            <input
              aria-label="Volume slider"
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="spotify-range w-[88px]"
              style={{
                "--progress": `${isMuted ? 0 : volume}%`,
              }}
            />
          </div>

          {/* Fullscreen Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowFullscreenModal(true)}
            className={`
              transition p-1.5 rounded-full cursor-pointer
              ${
                theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
              }
            `}
            title="Open Fullscreen Player"
          >
            <Maximize2 size={16} />
          </motion.button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 2. DEDICATED FULLSCREEN MOBILE MUSIC PLAYER (Spotify Style Slide-Up)      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showMobilePlayer && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className={`
              fixed inset-0 z-[9999] flex flex-col justify-between h-[100dvh] max-h-[100dvh] overflow-hidden p-4 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden
              ${
                theme === "dark"
                  ? "bg-gradient-to-b from-[#281216] via-[#141414] to-black text-white"
                  : "bg-gradient-to-b from-[#faeae8] via-[#f7f3ed] to-[#ece7de] text-stone-900"
              }
            `}
          >
            {/* Top Bar: Pull down chevron, Title & Queue */}
            <div className="flex items-center justify-between h-10 shrink-0">
              <button
                onClick={() => setShowMobilePlayer(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-current backdrop-blur-md transition active:scale-90 cursor-pointer"
                title="Collapse Player"
              >
                <ChevronDown size={22} />
              </button>

              <div className="text-center min-w-0 px-2 flex-1">
                <p className="text-[9.5px] uppercase font-bold tracking-widest opacity-60">
                  PLAYING FROM PLAYLIST
                </p>
                <p className="text-[11.5px] font-bold truncate max-w-[180px] mx-auto">
                  {currentTrack.album || "Audix Hits"}
                </p>
              </div>

              <button
                onClick={() => setShowQueueModal(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-current backdrop-blur-md transition active:scale-90 cursor-pointer"
                title="View Queue"
              >
                <ListMusic size={18} />
              </button>
            </div>

            {/* Main Center: Scaled Album Artwork */}
            <div className="flex-1 min-h-0 flex items-center justify-center my-1 sm:my-2">
              <div className="relative h-full max-h-[30vh] sm:max-h-[34vh] max-w-[240px] sm:max-w-[280px] aspect-square">
                <motion.img
                  key={currentTrack.image}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={currentTrack.image}
                  alt={currentTrack.title}
                  className="h-full w-full rounded-2xl object-cover shadow-[0_16px_36px_rgba(0,0,0,0.5)] border border-white/10"
                />
                {currentTrack.language && (
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-md">
                    {currentTrack.language}
                  </span>
                )}
              </div>
            </div>

            {/* Song Meta & Favorite Heart */}
            <div className="shrink-0 mb-1.5 sm:mb-2 px-1">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl sm:text-2xl font-black tracking-tight leading-tight">
                    {currentTrack.title}
                  </h1>
                  <p className="mt-0.5 truncate text-xs sm:text-sm font-semibold opacity-70">
                    {currentTrack.artist}
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => toggleLike(currentTrack)}
                  className="p-1.5 cursor-pointer shrink-0"
                >
                  <Heart
                    size={24}
                    fill={liked ? "currentColor" : "none"}
                    className={liked ? "text-red-500" : "opacity-70"}
                  />
                </motion.button>
              </div>
            </div>

            {/* Seek Bar / Live Scrolling Waveform Visualizer */}
            <div className="shrink-0 mb-2 sm:mb-3 px-1">
              {useWaveformMode ? (
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.05] border border-white/10 mb-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-red-400 mb-1">
                    <span className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full bg-red-500 ${isPlaying ? "animate-pulse" : ""}`} />
                      LIVE WAVEFORM
                    </span>
                    <button
                      onClick={() => setUseWaveformMode(false)}
                      className="text-[9.5px] text-current opacity-70 underline cursor-pointer"
                    >
                      Classic Slider
                    </button>
                  </div>
                  <ScrollingWaveform
                    height={30}
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
                        ? "rgba(255, 255, 255, 0.25)"
                        : "rgba(0, 0, 0, 0.2)"
                    }
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <input
                    aria-label="Seek track"
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={(e) => seekProgress(e.target.value)}
                    className="spotify-range w-full"
                    style={{
                      "--progress": `${progress}%`,
                    }}
                  />
                  <div className="flex justify-end mt-0.5">
                    <button
                      onClick={() => setUseWaveformMode(true)}
                      className="text-[9.5px] font-semibold text-red-500 underline cursor-pointer"
                    >
                      Switch to Waveform
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-[11px] font-semibold opacity-60 px-0.5">
                <span>{formatSeconds(currentTime)}</span>
                <span>{currentTrack.duration}</span>
              </div>
            </div>

            {/* Touch-Optimized Primary Playback Controls */}
            <div className="flex items-center justify-between shrink-0 mb-2 sm:mb-3 px-2">
              {/* Shuffle */}
              <button
                onClick={() => setShuffle((v) => !v)}
                className={`p-2 transition cursor-pointer ${
                  shuffle ? "text-red-500" : "opacity-60"
                }`}
                title="Shuffle"
              >
                <Shuffle size={20} />
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="p-2 transition active:scale-85 cursor-pointer text-current"
                title="Previous Track"
              >
                <SkipBack size={26} fill="currentColor" />
              </button>

              {/* Play / Pause Main Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="flex h-15 w-15 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/40 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isLoading ? (
                  <Loader2 size={26} className="animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause size={26} fill="currentColor" />
                ) : (
                  <Play size={26} fill="currentColor" className="ml-1" />
                )}
              </motion.button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-2 transition active:scale-85 cursor-pointer text-current"
                title="Next Track"
              >
                <SkipForward size={26} fill="currentColor" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-2 transition cursor-pointer ${
                  repeatMode !== "off" ? "text-red-500" : "opacity-60"
                }`}
                title="Repeat"
              >
                {repeatMode === "one" ? (
                  <Repeat1 size={20} />
                ) : (
                  <Repeat size={20} />
                )}
              </button>
            </div>

            {/* Bottom Utilities: Audio Quality badge */}
            <div className="flex items-center justify-between text-[11px] opacity-60 border-t border-white/10 pt-2 shrink-0 px-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles size={12} className="text-amber-400" />
                Dolby 320 kbps • Lossless
              </span>

              <button
                onClick={() => setShowMobilePlayer(false)}
                className="font-bold text-red-500 hover:underline cursor-pointer"
              >
                Minimize ▾
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. DESKTOP FULLSCREEN PLAYER MODAL (Responsive & Full Control Visibility) */}
      {/* ========================================================================= */}
      {showFullscreenModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col justify-between items-center bg-black/95 p-4 md:p-8 backdrop-blur-2xl text-white overflow-y-auto spotify-scrollbar"
          >
            {/* Top Bar with Minimize Button */}
            <div className="w-full flex items-center justify-between shrink-0 max-w-4xl mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                <Sparkles size={14} className="text-amber-400" />
                Audix Fullscreen Player
              </div>

              <button
                onClick={() => setShowFullscreenModal(false)}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                title="Exit Fullscreen"
              >
                <Minimize2 size={16} />
                <span>Exit Fullscreen</span>
              </button>
            </div>

            {/* Album Art with Responsive Max-Height */}
            <div className="flex items-center justify-center my-auto py-2">
              <motion.img
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={currentTrack.image}
                alt={currentTrack.title}
                className="h-[28vh] md:h-[34vh] max-h-[300px] min-h-[160px] aspect-square rounded-2xl object-cover shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
              />
            </div>

            {/* Song Meta Information */}
            <div className="text-center shrink-0 mb-3 px-4 max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-black truncate leading-tight">
                {currentTrack.title}
              </h1>
              <p className="text-sm md:text-base text-red-400 font-medium truncate mt-1">
                {currentTrack.artist} • {currentTrack.album}{" "}
                {currentTrack.language ? `(${currentTrack.language})` : ""}
              </p>
            </div>

            {/* Waveform Visualizer & Seek Control Container */}
            <div className="w-full max-w-xl shrink-0 mb-4 p-3 md:p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <span
                    className={`h-2 w-2 rounded-full bg-red-500 ${
                      isPlaying ? "animate-pulse" : ""
                    }`}
                  />
                  Real-Time Audio Waveform
                </div>
                <span className="text-xs text-white/60">
                  {formatSeconds(currentTime)} /{" "}
                  {formatSeconds(duration || currentTrack.seconds)}
                </span>
              </div>

              <ScrollingWaveform
                height={48}
                barWidth={3.5}
                barGap={2.5}
                speed={36}
                fadeEdges={true}
                isPlaying={isPlaying}
                progress={progress}
                interactive={true}
                onSeek={(pct) => seekProgress(pct)}
                activeColor="#ef4444"
                barColor="rgba(255, 255, 255, 0.25)"
              />
            </div>

            {/* Playback Controls (Always Guaranteed to be Visible) */}
            <div className="flex items-center justify-center gap-6 md:gap-8 shrink-0 mb-2">
              {/* Shuffle */}
              <button
                onClick={() => setShuffle((v) => !v)}
                className={`transition cursor-pointer ${
                  shuffle ? "text-red-500" : "text-white/60 hover:text-white"
                }`}
                title="Shuffle"
              >
                <Shuffle size={22} />
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="text-white hover:scale-110 transition cursor-pointer"
                title="Previous Track"
              >
                <SkipBack size={30} fill="currentColor" />
              </button>

              {/* Play / Pause / Buffering */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={togglePlay}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30 hover:bg-red-400 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" className="ml-1" />
                )}
              </motion.button>

              {/* Next */}
              <button
                onClick={playNext}
                className="text-white hover:scale-110 transition cursor-pointer"
                title="Next Track"
              >
                <SkipForward size={30} fill="currentColor" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`transition cursor-pointer ${
                  repeatMode !== "off"
                    ? "text-red-500"
                    : "text-white/60 hover:text-white"
                }`}
                title="Repeat"
              >
                {repeatMode === "one" ? (
                  <Repeat1 size={22} />
                ) : (
                  <Repeat size={22} />
                )}
              </button>

              {/* Favorite */}
              <button
                onClick={() => toggleLike(currentTrack)}
                className={`transition cursor-pointer ${
                  liked ? "text-red-500" : "text-white/60 hover:text-white"
                }`}
                title="Like Song"
              >
                <Heart size={24} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ========================================================================= */}
      {/* 4. QUEUE MODAL (Shared)                                                   */}
      {/* ========================================================================= */}
      {showQueueModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`
              fixed bottom-[104px] right-4 z-[9999] w-80 max-h-[420px] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl
              ${
                theme === "dark"
                  ? "bg-[#181818]/95 border-white/10 text-white"
                  : "bg-[#faf8f5]/95 border-stone-300/80 text-stone-900"
              }
            `}
          >
            <div className="flex items-center justify-between border-b p-3.5 border-stone-300/60 dark:border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">
                Playing Queue ({activeQueue.length})
              </h3>
              <button
                onClick={() => setShowQueueModal(false)}
                className="opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="spotify-scrollbar max-h-[350px] overflow-y-auto p-2 space-y-1">
              {activeQueue.map((t, idx) => {
                const isCurrent = t.id === currentTrack.id;
                return (
                  <button
                    key={t.id + idx}
                    onClick={() => {
                      playTrack(t);
                    }}
                    className={`
                      flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition cursor-pointer
                      ${
                        isCurrent
                          ? "bg-red-500/15 text-red-500 font-bold"
                          : theme === "dark"
                          ? "hover:bg-white/5"
                          : "hover:bg-stone-100"
                      }
                    `}
                  >
                    <img
                      src={t.image}
                      alt={t.title}
                      className="h-9 w-9 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {t.title}
                      </p>
                      <p className="truncate text-[10px] text-[#a7a7a7]">
                        {t.artist}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-red-500">
                        NOW
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
