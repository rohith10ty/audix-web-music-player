import {
  Activity,
  Check,
  ChevronDown,
  Heart,
  Info,
  ListMusic,
  ListPlus,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  Repeat,
  Repeat1,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { ScrollingWaveform } from "@/components/ui/waveform";
import { songs } from "@/data/musicData";

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
    userQueue = [],
    contextQueue = [],
    contextName = "Audix Hits",
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
    addToQueue,
    playNextInQueue,
    removeFromUserQueue,
    clearUserQueue,
    fetchSearchSongs,
    customPlaylists = [],
    addSongToPlaylist,
    removeSongFromPlaylist,
    openCreatePlaylistModal,
    isAuthenticated,
    openAuthModal,
  } = usePlayer();

  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const [showSongInfoModal, setShowSongInfoModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [useWaveformMode, setUseWaveformMode] = useState(true);

  // Queue Inline Search States
  const [queueSearchText, setQueueSearchText] = useState("");
  const [queueSearchResults, setQueueSearchResults] = useState([]);

  const handleQueueSearch = useCallback(
    async (q) => {
      setQueueSearchText(q);
      if (!q.trim()) {
        setQueueSearchResults([]);
        return;
      }
      const lower = q.toLowerCase().trim();
      const localMatches = (songs || []).filter(
        (s) =>
          s.title.toLowerCase().includes(lower) ||
          s.artist.toLowerCase().includes(lower) ||
          (s.album && s.album.toLowerCase().includes(lower)),
      ).slice(0, 5);

      setQueueSearchResults(localMatches);

      if (localMatches.length < 3 && typeof fetchSearchSongs === "function") {
        try {
          const apiMatches = await fetchSearchSongs(q, 1, 5);
          if (apiMatches && apiMatches.length > 0) {
            setQueueSearchResults(apiMatches.slice(0, 6));
          }
        } catch (e) {
          console.warn("Queue search fallback error:", e);
        }
      }
    },
    [fetchSearchSongs],
  );

  const upcomingFromContext = useMemo(() => {
    if (!contextQueue || contextQueue.length === 0) return [];
    const curIdx = contextQueue.findIndex((t) => String(t.id) === String(currentTrack?.id));
    if (curIdx === -1) {
      return contextQueue.filter((t) => String(t.id) !== String(currentTrack?.id));
    }
    const after = contextQueue.slice(curIdx + 1);
    const before = contextQueue.slice(0, curIdx);
    return [...after, ...before];
  }, [contextQueue, currentTrack]);

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
          fixed bottom-[68px] left-2 right-2 z-50 flex h-[62px] items-center rounded-2xl border px-3 shadow-2xl backdrop-blur-2xl transition-all duration-200 cursor-pointer overflow-hidden
          lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-50 lg:h-[88px] lg:cursor-default lg:overflow-visible lg:rounded-none lg:border-x-0 lg:border-b-0 lg:border-t lg:px-6
          ${
            theme === "dark"
              ? "bg-[#181818]/80 border-white/10 text-white lg:bg-[#121212]/95 lg:border-white/10"
              : "bg-[#faf8f5]/80 border-stone-300/70 text-stone-800 lg:bg-[#faf8f5]/95 lg:border-stone-300/80"
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

        {/* Mobile Live Scrolling Waveform Inside Bottom Music Player */}
        <div className="absolute inset-x-2 inset-y-0 z-0 pointer-events-none overflow-hidden rounded-2xl opacity-25 dark:opacity-30 flex items-center justify-center lg:hidden">
          <ScrollingWaveform
            height={28}
            barWidth={2.5}
            barGap={2}
            speed={30}
            fadeEdges={true}
            isPlaying={isPlaying}
            progress={progress}
            interactive={false}
            activeColor="#ef4444"
            barColor={
              theme === "dark"
                ? "rgba(255, 255, 255, 0.45)"
                : "rgba(0, 0, 0, 0.35)"
            }
            className="w-full"
          />
        </div>

        {/* LEFT: Current Track Artwork & Meta + (Desktop Favorite Heart + Info Credits Button) */}
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5 lg:w-[220px] xl:w-[270px] 2xl:w-[320px] lg:flex-none">
          <motion.img
            key={currentTrack.image}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentTrack.image}
            alt={currentTrack.title}
            onClick={(e) => {
              if (window.innerWidth >= 1024) {
                e.stopPropagation();
                setShowSongInfoModal(true);
              }
            }}
            className="h-11 w-11 rounded-lg object-cover shadow-sm lg:h-[48px] lg:w-[48px] xl:h-[54px] xl:w-[54px] lg:rounded-md shrink-0 lg:cursor-pointer hover:opacity-90"
            title="Click to view song info & credits"
          />

          <div
            onClick={(e) => {
              if (window.innerWidth >= 1024) {
                e.stopPropagation();
                setShowSongInfoModal(true);
              }
            }}
            className="min-w-0 flex-1 lg:flex-initial lg:max-w-[110px] xl:max-w-[150px] 2xl:max-w-[180px] lg:cursor-pointer"
            title="Click to view song info & credits"
          >
            <p className="truncate text-[13px] font-bold lg:text-[13.5px] xl:text-[14px] hover:underline">
              {currentTrack.title}
            </p>

            <p
              className={`
                mt-[2px] truncate text-[11px] lg:text-[11.5px]
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

          {/* Desktop Favorite Heart Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack);
            }}
            className={`
              hidden lg:flex shrink-0 p-1.5 transition cursor-pointer rounded-full
              ${
                liked
                  ? "text-red-500"
                  : theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                  : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
              }
            `}
            title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          >
            <Heart
              size={17}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-red-500" : ""}
            />
          </motion.button>

          {/* Desktop Song Information (i) Credits Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowSongInfoModal(true);
            }}
            className={`
              hidden lg:flex shrink-0 p-1.5 transition cursor-pointer rounded-full
              ${
                showSongInfoModal
                  ? "text-red-500 bg-red-500/10"
                  : theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                  : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
              }
            `}
            title="Song Information & Credits"
          >
            <Info size={17} />
          </motion.button>
        </div>

        {/* CENTER: Desktop Audio Controls & Scrubbing Progress Bar */}
        <div className="hidden min-w-0 flex-1 flex-col items-center lg:flex max-w-[560px] xl:max-w-[700px] mx-auto px-1 sm:px-2">
          <div className="mb-2 flex items-center gap-3.5 xl:gap-4.5">
            {/* Add to Playlist Button (Beside Shuffle) */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowPlaylistModal(true)}
              className={`
                p-1.5 rounded-full transition cursor-pointer
                ${
                  theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                    : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
                }
              `}
              title="Add song to Playlist"
            >
              <ListPlus size={18} />
            </motion.button>

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
                    : "text-stone-700 hover:text-stone-950"
                }
              `}
              title={shuffle ? "Shuffle is ON" : "Shuffle is OFF"}
            >
              <Shuffle size={16} />
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
                    : "text-stone-700 hover:text-stone-950"
                }
              `}
              title="Previous song"
            >
              <SkipBack size={19} fill="currentColor" />
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
                    : "text-stone-700 hover:text-stone-950"
                }
              `}
              title="Next song"
            >
              <SkipForward size={19} fill="currentColor" />
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
                    : "text-stone-700 hover:text-stone-950"
                }
              `}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === "one" ? (
                <Repeat1 size={17} />
              ) : (
                <Repeat size={17} />
              )}
            </motion.button>

            {/* Live Waveform Toggle Button (Beside Repeat) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setUseWaveformMode((v) => !v)}
              className={`
                p-1.5 rounded-full transition cursor-pointer
                ${
                  useWaveformMode
                    ? "text-red-500 bg-red-500/10"
                    : theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                    : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
                }
              `}
              title={
                useWaveformMode
                  ? "Live Waveform active (Click for classic slider)"
                  : "Classic slider active (Click for live waveform)"
              }
            >
              <Activity size={16} />
            </motion.button>
          </div>

          {/* Progress & Scrolling Waveform Seek Bar + Progress % Badge */}
          <div className="flex w-full items-center gap-2 sm:gap-2.5">
            <span
              className={`
              w-8 text-right text-[11px] font-medium tabular-nums shrink-0
              ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
            `}
            >
              {formatSeconds(currentTime)}
            </span>

            {useWaveformMode ? (
              <div className="relative flex-1 min-w-0 flex items-center h-7 px-0.5 group cursor-pointer">
                <ScrollingWaveform
                  height={24}
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
                className="spotify-range flex-1 min-w-0"
                style={{
                  "--progress": `${progress}%`,
                }}
              />
            )}

            <span
              className={`
              w-8 text-left text-[11px] font-medium tabular-nums shrink-0
              ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
            `}
            >
              {currentTrack.duration}
            </span>

            {/* Desktop Song Percentage Pill Badge */}
            <span
              className={`
                text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full select-none shrink-0 ml-1
                ${
                  theme === "dark"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : "bg-red-100/90 text-red-600 border border-red-200"
                }
              `}
              title="Song progress percentage"
            >
              {Math.round(progress || 0)}%
            </span>
          </div>
        </div>

        {/* Mobile Mini-Player Controls Group: Percentage + Favorite + Play/Pause */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 lg:hidden ml-auto shrink-0">
          {/* Progress Percentage Badge */}
          <span
            className={`
              text-[10.5px] font-black tabular-nums px-2 py-0.5 rounded-full select-none
              ${
                theme === "dark"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-red-100/90 text-red-600 border border-red-200"
              }
            `}
            title="Song progress"
          >
            {Math.round(progress || 0)}%
          </span>

          {/* Mobile Favorite Heart Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack);
            }}
            className={`
              flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer shrink-0
              ${
                liked
                  ? "text-red-500 bg-red-500/15"
                  : theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white hover:bg-white/10"
                  : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/80"
              }
            `}
            title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          >
            <Heart
              size={18}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-red-500" : ""}
            />
          </motion.button>

          {/* Mobile Play / Pause Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className={`
              flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full shadow-md cursor-pointer shrink-0
              ${
                theme === "dark"
                  ? "bg-white text-black hover:scale-105"
                  : "bg-stone-900 text-[#faf8f5] hover:scale-105"
              }
            `}
            title={isLoading ? "Buffering..." : isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-current" />
            ) : isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" className="ml-[1.5px]" />
            )}
          </motion.button>
        </div>

        {/* RIGHT: Auxiliary Controls (Queue, Volume, Fullscreen) */}
        <div className="hidden lg:w-[190px] xl:w-[230px] 2xl:w-[260px] lg:flex-none items-center justify-end gap-2 xl:gap-3 lg:flex">
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
                  : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
              }
            `}
            title="Current Queue"
          >
            <ListMusic size={17} />
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 xl:gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`
                transition cursor-pointer p-1
                ${
                  isMuted || volume === 0
                    ? "text-red-400"
                    : theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-700 hover:text-stone-950"
                }
              `}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={17} />
              ) : volume < 50 ? (
                <Volume1 size={17} />
              ) : (
                <Volume2 size={17} />
              )}
            </motion.button>

            <input
              aria-label="Volume slider"
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="spotify-range w-[60px] xl:w-[84px]"
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
                  : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
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
            {/* Top Bar: Pull down chevron, Title, Info & Queue */}
            <div className="flex items-center justify-between h-10 shrink-0 gap-2">
              <button
                onClick={() => setShowMobilePlayer(false)}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 cursor-pointer
                  ${
                    theme === "dark"
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-stone-900/10 text-stone-800 hover:bg-stone-900/20"
                  }
                `}
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

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setShowSongInfoModal(true)}
                  className={`
                    flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 cursor-pointer
                    ${
                      theme === "dark"
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-stone-900/10 text-stone-800 hover:bg-stone-900/20"
                    }
                  `}
                  title="Song Credits & Information"
                >
                  <Info size={17} />
                </button>

                <button
                  onClick={() => setShowQueueModal(true)}
                  className={`
                    flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 cursor-pointer
                    ${
                      theme === "dark"
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-stone-900/10 text-stone-800 hover:bg-stone-900/20"
                    }
                  `}
                  title="View Queue"
                >
                  <ListMusic size={18} />
                </button>
              </div>
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

            {/* Song Meta, Add to Playlist & Favorite Heart */}
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

                {/* Mobile Action Buttons: Add to Playlist + Like Heart */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setShowPlaylistModal(true)}
                    className={`
                      p-2 rounded-full cursor-pointer transition
                      ${
                        theme === "dark"
                          ? "text-white/80 hover:text-white hover:bg-white/10"
                          : "text-stone-800 hover:text-stone-950 hover:bg-stone-900/10"
                      }
                    `}
                    title="Add to Playlist"
                  >
                    <ListPlus size={24} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleLike(currentTrack)}
                    className={`
                      p-2 rounded-full cursor-pointer shrink-0 transition
                      ${
                        liked
                          ? "text-red-500 bg-red-500/15"
                          : theme === "dark"
                          ? "text-white/80 hover:text-white hover:bg-white/10"
                          : "text-stone-800 hover:text-stone-950 hover:bg-stone-900/10"
                      }
                    `}
                    title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
                  >
                    <Heart
                      size={24}
                      fill={liked ? "currentColor" : "none"}
                      className={liked ? "text-red-500" : ""}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Seek Bar / Live Scrolling Waveform Visualizer */}
            <div className="shrink-0 mb-2 sm:mb-3 px-1">
              {useWaveformMode ? (
                <div className="p-2 sm:p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 mb-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-red-500 dark:text-red-400 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full bg-red-500 ${isPlaying ? "animate-pulse" : ""}`} />
                      <span>LIVE WAVEFORM</span>
                    </div>

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
                  <div className="flex justify-end items-center mt-0.5">
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

            {/* Bottom Utilities: Audio Quality badge & Credits trigger */}
            <div className="flex items-center justify-between text-[11px] opacity-75 border-t border-black/10 dark:border-white/10 pt-2 shrink-0 px-1">
              <button
                onClick={() => setShowSongInfoModal(true)}
                className="flex items-center gap-1.5 font-medium hover:text-red-500 transition cursor-pointer"
                title="View Song Credits & Info"
              >
                <Sparkles size={12} className="text-amber-500" />
                Dolby 320 kbps • Credits
              </button>

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
            {/* Top Bar with Info & Minimize Buttons */}
            <div className="w-full flex items-center justify-between shrink-0 max-w-4xl mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                <Sparkles size={14} className="text-amber-400" />
                Audix Fullscreen Player
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPlaylistModal(true)}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                  title="Add to Playlist"
                >
                  <ListPlus size={15} />
                  <span>+ Playlist</span>
                </button>

                <button
                  onClick={() => setShowSongInfoModal(true)}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                  title="Song Information & Credits"
                >
                  <Info size={15} />
                  <span>Credits</span>
                </button>

                <button
                  onClick={() => setShowFullscreenModal(false)}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                  title="Exit Fullscreen"
                >
                  <Minimize2 size={16} />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
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
            <div className="flex items-center justify-center gap-5 md:gap-7 shrink-0 mb-2">
              {/* Add to Playlist */}
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="text-white/60 hover:text-white hover:scale-110 transition cursor-pointer p-1"
                title="Add to Playlist"
              >
                <ListPlus size={22} />
              </button>

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
      {/* 4. QUEUE MODAL (Spotify-Style Pro Queue Manager)                          */}
      {/* ========================================================================= */}
      {showQueueModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
              fixed bottom-[100px] right-3 sm:right-6 z-[9999] w-[94vw] sm:w-[380px] md:w-[430px] max-h-[520px] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl flex flex-col
              ${
                theme === "dark"
                  ? "bg-[#181818]/95 border-white/10 text-white"
                  : "bg-[#faf8f5]/95 border-stone-300 text-stone-900 shadow-stone-900/10"
              }
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 border-stone-300/60 dark:border-white/10 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold leading-tight">
                    Playing Queue
                  </h3>
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10.5px] font-bold text-red-500">
                    {1 + userQueue.length + (contextQueue?.length ? Math.max(0, contextQueue.length - 1) : 0)} songs
                  </span>
                </div>
                <p className="text-[11px] opacity-60 truncate mt-0.5">
                  Source: <span className="font-semibold">{contextName || "Audix Hits"}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {userQueue.length > 0 && (
                  <button
                    onClick={clearUserQueue}
                    className="text-[11px] font-bold text-red-500 hover:underline px-2 py-1 rounded cursor-pointer"
                    title="Clear manually added queue songs"
                  >
                    Clear Queue
                  </button>
                )}
                <button
                  onClick={() => setShowQueueModal(false)}
                  className="rounded-full p-1.5 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  title="Close Queue"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Quick Inline Search & Add to Queue Bar */}
            <div className="px-3 pt-2.5 pb-1 shrink-0">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 opacity-50" />
                <input
                  type="text"
                  placeholder="Search & add songs to queue..."
                  value={queueSearchText}
                  onChange={(e) => handleQueueSearch(e.target.value)}
                  className={`
                    w-full rounded-xl pl-8 pr-8 py-1.5 text-xs outline-none transition border
                    ${
                      theme === "dark"
                        ? "bg-white/[0.05] border-white/10 text-white placeholder-white/40 focus:border-red-500"
                        : "bg-black/[0.04] border-stone-300 text-stone-900 placeholder-stone-400 focus:border-red-500"
                    }
                  `}
                />
                {queueSearchText && (
                  <button
                    onClick={() => {
                      setQueueSearchText("");
                      setQueueSearchResults([]);
                    }}
                    className="absolute right-2.5 opacity-60 hover:opacity-100 cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {queueSearchResults.length > 0 && (
                <div className={`mt-1.5 rounded-xl border p-1 space-y-1 max-h-36 overflow-y-auto spotify-scrollbar shadow-lg ${
                  theme === "dark" ? "bg-[#222] border-white/10" : "bg-white border-stone-200"
                }`}>
                  {queueSearchResults.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-red-500/10 transition text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                        <img src={song.image} alt={song.title} className="h-7 w-7 rounded object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate text-[11.5px]">{song.title}</p>
                          <p className="text-[10px] opacity-60 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            playNextInQueue(song);
                            setQueueSearchText("");
                            setQueueSearchResults([]);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition cursor-pointer"
                          title="Play next"
                        >
                          Play Next
                        </button>
                        <button
                          onClick={() => {
                            addToQueue(song);
                            setQueueSearchText("");
                            setQueueSearchResults([]);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
                          title="Add to end of queue"
                        >
                          + Queue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable Queue Content */}
            <div className="spotify-scrollbar flex-1 overflow-y-auto p-3 space-y-3.5 max-h-[380px]">
              {/* NOW PLAYING SECTION */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-1.5 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full bg-red-500 ${isPlaying ? "animate-pulse" : ""}`} />
                  Now Playing
                </p>
                <div
                  className={`
                    flex items-center justify-between p-2.5 rounded-xl border
                    ${
                      theme === "dark"
                        ? "bg-red-500/10 border-red-500/20 text-white"
                        : "bg-red-50 border-red-200 text-stone-900"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <img
                      src={currentTrack.image}
                      alt={currentTrack.title}
                      className="h-10 w-10 rounded-lg object-cover shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-red-500">{currentTrack.title}</p>
                      <p className="truncate text-[10.5px] opacity-70">{currentTrack.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10.5px] font-bold text-red-500 tabular-nums">
                      {formatSeconds(currentTime)} / {currentTrack.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* USER QUEUED SONGS (NEXT IN QUEUE) */}
              {userQueue.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400">
                      Next in Queue ({userQueue.length})
                    </p>
                    <button
                      onClick={clearUserQueue}
                      className="text-[10px] font-bold text-red-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-1">
                    {userQueue.map((song, idx) => (
                      <div
                        key={`user-q-${song.id}-${idx}`}
                        className={`
                          group flex w-full items-center justify-between p-2 rounded-xl text-left transition
                          ${
                            theme === "dark"
                              ? "hover:bg-white/5 bg-white/[0.02]"
                              : "hover:bg-stone-200/60 bg-stone-100/60"
                          }
                        `}
                      >
                        <button
                          onClick={() => {
                            removeFromUserQueue(idx);
                            playTrack(song);
                          }}
                          className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <span className="text-[11px] font-bold text-amber-500 tabular-nums w-4 text-center shrink-0">
                            {idx + 1}
                          </span>
                          <img
                            src={song.image}
                            alt={song.title}
                            className="h-8 w-8 rounded-lg object-cover shrink-0 shadow-sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">{song.title}</p>
                            <p className="truncate text-[10px] opacity-60">{song.artist}</p>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={() => removeFromUserQueue(idx)}
                            className="p-1 rounded-full opacity-60 hover:opacity-100 hover:text-red-500 transition cursor-pointer"
                            title="Remove from queue"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-7 px-4 text-center border rounded-2xl border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <ListMusic size={18} />
                  </div>
                  <p className="text-xs font-bold mb-0.5">Queue is empty</p>
                  <p className="text-[11px] opacity-60 max-w-[220px] mx-auto leading-relaxed">
                    Search above or click &quot;...&quot; on any track to add songs to your queue.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ========================================================================= */}
      {/* 5. SONG INFORMATION & CREDITS MODAL                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSongInfoModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSongInfoModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                relative z-10 w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl flex flex-col
                ${
                  theme === "dark"
                    ? "bg-[#181818] border-white/10 text-white"
                    : "bg-[#faf8f5] border-stone-300 text-stone-900"
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-5 py-4 border-stone-300/60 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-500">
                    <Info size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">
                      Song Information & Credits
                    </h3>
                    <p className="text-[11px] opacity-60">
                      High-fidelity metadata & production details
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSongInfoModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="spotify-scrollbar flex-1 overflow-y-auto p-5 space-y-4">
                {/* Hero Header Card */}
                <div
                  className={`
                    flex items-center gap-4 p-3.5 rounded-xl border
                    ${
                      theme === "dark"
                        ? "bg-white/[0.03] border-white/[0.08]"
                        : "bg-stone-100/80 border-stone-200"
                    }
                  `}
                >
                  <img
                    src={currentTrack.image}
                    alt={currentTrack.title}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-cover shadow-lg shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 mb-1.5">
                      <Sparkles size={10} className="text-amber-400" />
                      320 kbps Lossless
                    </span>
                    <h4 className="text-base sm:text-lg font-black truncate leading-snug">
                      {currentTrack.title}
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold opacity-75 truncate">
                      {currentTrack.artist}
                    </p>
                    <p className="text-[11.5px] opacity-60 truncate mt-0.5">
                      {currentTrack.album || "Single"} • {currentTrack.year || "2024"}
                    </p>
                  </div>
                </div>

                {/* Credits Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Performed By / Singers */}
                  <div
                    className={`
                      p-3 rounded-xl border
                      ${
                        theme === "dark"
                          ? "bg-white/[0.02] border-white/[0.06]"
                          : "bg-stone-100/60 border-stone-200/80"
                      }
                    `}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                      Performed By (Singers)
                    </p>
                    <p className="font-semibold leading-relaxed">
                      {currentTrack.singers || currentTrack.artist}
                    </p>
                  </div>

                  {/* Music Director / Composers */}
                  <div
                    className={`
                      p-3 rounded-xl border
                      ${
                        theme === "dark"
                          ? "bg-white/[0.02] border-white/[0.06]"
                          : "bg-stone-100/60 border-stone-200/80"
                      }
                    `}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                      Music Director / Composer
                    </p>
                    <p className="font-semibold leading-relaxed">
                      {currentTrack.musicDirector || currentTrack.artist || "Audix Studio Originals"}
                    </p>
                  </div>

                  {/* Album / Movie */}
                  <div
                    className={`
                      p-3 rounded-xl border
                      ${
                        theme === "dark"
                          ? "bg-white/[0.02] border-white/[0.06]"
                          : "bg-stone-100/60 border-stone-200/80"
                      }
                    `}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                      Album / Soundtrack
                    </p>
                    <p className="font-semibold leading-relaxed">
                      {currentTrack.album || "Original Sound Recording"}
                    </p>
                  </div>

                  {/* Language & Genre */}
                  <div
                    className={`
                      p-3 rounded-xl border
                      ${
                        theme === "dark"
                          ? "bg-white/[0.02] border-white/[0.06]"
                          : "bg-stone-100/60 border-stone-200/80"
                      }
                    `}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                      Language & Genre
                    </p>
                    <p className="font-semibold leading-relaxed">
                      {currentTrack.language || "Telugu"} • {currentTrack.genre || "Soundtrack"}
                    </p>
                  </div>

                  {/* Cast / Starring (if present) */}
                  {currentTrack.starring && (
                    <div
                      className={`
                        p-3 rounded-xl border sm:col-span-2
                        ${
                          theme === "dark"
                            ? "bg-white/[0.02] border-white/[0.06]"
                            : "bg-stone-100/60 border-stone-200/80"
                        }
                      `}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                        Starring / Featured Cast
                      </p>
                      <p className="font-semibold leading-relaxed">
                        {currentTrack.starring}
                      </p>
                    </div>
                  )}

                  {/* Record Label / Copyright */}
                  <div
                    className={`
                      p-3 rounded-xl border sm:col-span-2
                      ${
                        theme === "dark"
                          ? "bg-white/[0.02] border-white/[0.06]"
                          : "bg-stone-100/60 border-stone-200/80"
                      }
                    `}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                      Record Label & Copyright
                    </p>
                    <p className="font-semibold leading-relaxed opacity-85">
                      {currentTrack.label || "© Audix Media Network / Official Licensee"}
                    </p>
                  </div>
                </div>

                {/* Technical Stream Specifications */}
                <div
                  className={`
                    p-3.5 rounded-xl border text-[11.5px] space-y-2
                    ${
                      theme === "dark"
                        ? "bg-red-950/20 border-red-500/20"
                        : "bg-red-50/60 border-red-200"
                    }
                  `}
                >
                  <p className="font-bold text-red-500 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Audio Stream Specifications
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="opacity-60 block text-[10px]">BITRATE & CODEC</span>
                      <span className="font-bold">320 kbps MP4/AAC Stereo</span>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">DELIVERY PROTOCOL</span>
                      <span className="font-bold">DES-ECB Decrypted CDN</span>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">SAMPLE RATE</span>
                      <span className="font-bold">44.1 kHz • 16-bit Studio</span>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">PLAYBACK DURATION</span>
                      <span className="font-bold">{currentTrack.duration} ({currentTrack.seconds || 240}s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between border-t px-5 py-3.5 border-stone-300/60 dark:border-white/10 shrink-0">
                <button
                  onClick={() => toggleLike(currentTrack)}
                  className={`
                    flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer
                    ${
                      liked
                        ? "text-red-500 bg-red-500/15"
                        : theme === "dark"
                        ? "bg-white/10 hover:bg-white/15 text-white"
                        : "bg-stone-200/80 hover:bg-stone-200 text-stone-900"
                    }
                  `}
                >
                  <Heart
                    size={16}
                    fill={liked ? "currentColor" : "none"}
                    className={liked ? "text-red-500" : ""}
                  />
                  <span>{liked ? "Saved to Liked Songs" : "Save to Liked Songs"}</span>
                </button>

                <button
                  onClick={() => setShowSongInfoModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500 text-white hover:bg-red-400 transition cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. DEDICATED ADD TO PLAYLIST MODAL (All Screens)                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPlaylistModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlaylistModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl flex flex-col max-h-[85vh]
                ${
                  theme === "dark"
                    ? "bg-[#181818] border-white/10 text-white"
                    : "bg-[#faf8f5] border-stone-300 text-stone-900"
                }
              `}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b p-4 border-stone-300/60 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-500 shrink-0">
                    <ListPlus size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold truncate">Add to Playlist</h3>
                    <p className="text-[11px] opacity-60 truncate max-w-[200px]">
                      {currentTrack.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="rounded-full p-1.5 opacity-70 hover:opacity-100 transition cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Current Track Banner Preview */}
              <div className="p-3 border-b border-stone-300/60 dark:border-white/10 shrink-0 bg-black/5 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <img
                    src={currentTrack.image}
                    alt={currentTrack.title}
                    className="h-11 w-11 rounded-lg object-cover shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{currentTrack.title}</p>
                    <p className="text-[11px] opacity-65 truncate mt-0.5">
                      {currentTrack.artist} {currentTrack.album ? `• ${currentTrack.album}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action: Create New Playlist Button */}
              <div className="p-3 border-b border-stone-300/60 dark:border-white/10 shrink-0">
                <button
                  onClick={() => {
                    setShowPlaylistModal(false);
                    if (!isAuthenticated) {
                      openAuthModal("signup");
                    } else {
                      openCreatePlaylistModal();
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Create New Playlist</span>
                </button>
              </div>

              {/* Playlists List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 spotify-scrollbar min-h-[140px] max-h-[260px]">
                {!isAuthenticated ? (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs opacity-75 mb-3 leading-relaxed">
                      Log in to create custom playlists and save this track to your personal library.
                    </p>
                    <button
                      onClick={() => {
                        setShowPlaylistModal(false);
                        openAuthModal("login");
                      }}
                      className="px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-400 transition cursor-pointer"
                    >
                      Log in / Sign up
                    </button>
                  </div>
                ) : customPlaylists.length === 0 ? (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs opacity-65 leading-relaxed">
                      You don&apos;t have any custom playlists yet. Click above to create your first one!
                    </p>
                  </div>
                ) : (
                  customPlaylists.map((playlist) => {
                    const isSongInPlaylist = (playlist.tracks || []).some(
                      (t) => String(t.id) === String(currentTrack.id),
                    );
                    const count = playlist.tracks?.length || 0;

                    return (
                      <button
                        key={playlist.id}
                        onClick={() => {
                          if (isSongInPlaylist) {
                            removeSongFromPlaylist(playlist.id, currentTrack.id);
                          } else {
                            addSongToPlaylist(playlist.id, currentTrack);
                          }
                        }}
                        className={`
                          flex w-full items-center justify-between p-2.5 rounded-xl transition cursor-pointer text-left
                          ${
                            isSongInPlaylist
                              ? "bg-red-500/15 border border-red-500/30 text-red-500"
                              : theme === "dark"
                              ? "hover:bg-white/5 border border-transparent"
                              : "hover:bg-stone-200/60 border border-transparent"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <img
                            src={
                              playlist.image ||
                              "https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg"
                            }
                            alt={playlist.title}
                            className="h-10 w-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{playlist.title}</p>
                            <p className="text-[10.5px] opacity-60 truncate mt-0.5">
                              {count} {count === 1 ? "song" : "songs"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSongInPlaylist ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-500/20 px-2.5 py-1 rounded-full">
                              <Check size={12} />
                              Added
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-semibold opacity-60 hover:opacity-100 px-2 py-1">
                              <Plus size={13} />
                              Add
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t p-3 border-stone-300/60 dark:border-white/10 shrink-0 flex justify-end">
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-white/10 text-xs font-bold hover:opacity-80 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
