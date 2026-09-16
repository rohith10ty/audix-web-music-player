import {
  Check,
  Clock3,
  Heart,
  ListPlus,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

export default function TrackRow({
  track,
  index,
  showAlbum = true,
  isCustomPlaylist = false,
  playlistId = null,
}) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    isLiked,
    customPlaylists = [],
    addSongToPlaylist,
    removeSongFromPlaylist,
    openCreatePlaylistModal,
    isAuthenticated,
    openAuthModal,
  } = usePlayer();

  const [showOptions, setShowOptions] = useState(false);
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);

  const active = currentTrack.id === track.id;
  const liked = isLiked(track.id);

  const handlePlay = () => {
    if (active) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleTogglePlaylistSong = (pId, isInPlaylist) => {
    if (!isAuthenticated) {
      openAuthModal("signup");
      setShowOptions(false);
      return;
    }
    if (isInPlaylist) {
      removeSongFromPlaylist(pId, track.id);
    } else {
      addSongToPlaylist(pId, track);
    }
  };

  return (
    <motion.div
      whileHover={{
        backgroundColor:
          theme === "dark"
            ? "rgba(255,255,255,0.08)"
            : "rgba(120, 113, 108, 0.08)",
      }}
      className={`
        group relative grid grid-cols-[24px_minmax(0,1fr)_auto] sm:grid-cols-[32px_minmax(0,1fr)_auto] md:grid-cols-[32px_minmax(0,1.8fr)_minmax(0,1.2fr)_105px] items-center gap-2.5 sm:gap-3.5 rounded-xl px-2.5 sm:px-3.5 py-2 transition-colors
        ${
          active
            ? theme === "dark"
              ? "bg-white/[0.08] ring-1 ring-white/10"
              : "bg-red-500/10 ring-1 ring-red-400/30"
            : ""
        }
      `}
    >
      {/* Index number or Play/Pause Button */}
      <div className="flex items-center justify-center shrink-0">
        <span
          className={`
            text-[12px] sm:text-[13px] font-semibold transition tabular-nums
            ${
              active
                ? "text-red-500 font-bold"
                : theme === "dark"
                ? "text-[#888888]"
                : "text-stone-400"
            }
            group-hover:hidden
          `}
        >
          {active && isPlaying ? (
            <div className="flex items-end gap-[2px] h-3.5">
              <span className="w-0.5 h-full bg-red-500 animate-pulse" />
              <span className="w-0.5 h-2/3 bg-red-500 animate-pulse delay-75" />
              <span className="w-0.5 h-4/5 bg-red-500 animate-pulse delay-150" />
            </div>
          ) : (
            index + 1
          )}
        </span>

        <button
          onClick={handlePlay}
          className={`
            hidden transition group-hover:block cursor-pointer
            ${
              active
                ? "text-red-500"
                : theme === "dark"
                ? "text-white"
                : "text-stone-900"
            }
          `}
          title={active && isPlaying ? "Pause" : "Play"}
        >
          {active && isPlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
      </div>

      {/* Song Cover Art + Title + Artist + Language */}
      <button
        onClick={handlePlay}
        className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 text-left focus:outline-none cursor-pointer overflow-hidden"
      >
        <img
          src={track.image}
          alt={track.title}
          className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-lg object-cover shadow-sm"
        />

        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className={`
              truncate text-[13.5px] sm:text-[14.5px] font-bold leading-tight tracking-tight
              ${
                active
                  ? "text-red-500"
                  : theme === "dark"
                  ? "text-white group-hover:text-red-400"
                  : "text-stone-900 group-hover:text-red-600"
              }
            `}
          >
            {track.title}
          </p>

          <div className="mt-0.5 flex items-center gap-1.5 overflow-hidden">
            <span
              className={`
                truncate text-[11.5px] sm:text-[12.5px] font-medium
                ${
                  theme === "dark"
                    ? "text-[#a0a0a0] group-hover:text-[#c0c0c0]"
                    : "text-stone-600 group-hover:text-stone-800"
                }
              `}
            >
              {track.artist}
            </span>
            {track.language && (
              <span className="shrink-0 text-[9.5px] sm:text-[10px] font-bold text-red-500 bg-red-500/15 px-1.5 py-0.2 rounded border border-red-500/20">
                {track.language}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Album name */}
      {showAlbum && (
        <p
          className={`
            hidden truncate text-[13px] md:block font-medium
            ${theme === "dark" ? "text-[#a0a0a0]" : "text-stone-600"}
          `}
        >
          {track.album}
        </p>
      )}

      {/* Heart button + Duration + Options */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
        {/* Heart button */}
        <motion.button
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          className={`
            p-1.5 rounded-full transition cursor-pointer
            ${
              liked
                ? "text-red-500 opacity-100"
                : "hidden sm:block opacity-0 md:group-hover:opacity-100"
            }
            ${
              theme === "dark"
                ? "text-[#a0a0a0] hover:text-white hover:bg-white/10"
                : "text-stone-400 hover:text-stone-900 hover:bg-stone-200"
            }
          `}
          title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
        >
          <Heart
            size={15}
            fill={liked ? "currentColor" : "none"}
            className={liked ? "text-red-500" : ""}
          />
        </motion.button>

        {/* Remove button if inside custom playlist */}
        {isCustomPlaylist && playlistId && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              removeSongFromPlaylist(playlistId, track.id);
            }}
            className="p-1.5 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
            title="Remove from this playlist"
          >
            <Trash2 size={15} />
          </motion.button>
        )}

        <span
          className={`
            text-[12px] sm:text-[12.5px] font-medium tabular-nums
            ${theme === "dark" ? "text-[#a0a0a0]" : "text-stone-500"}
          `}
        >
          {track.duration}
        </span>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions((v) => !v);
              setShowPlaylistSubmenu(false);
            }}
            className={`
              p-1.5 rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition cursor-pointer
              ${
                theme === "dark"
                  ? "text-[#a0a0a0] hover:text-white hover:bg-white/10"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-200"
              }
            `}
            title="More options"
          >
            <MoreHorizontal size={17} />
          </button>

          {showOptions && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`
                absolute right-0 top-8 z-50 w-52 rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl text-xs
                ${
                  theme === "dark"
                    ? "bg-[#1f1f1f] border-white/10 text-white"
                    : "bg-[#faf8f5] border-stone-300 text-stone-900"
                }
              `}
            >
              <button
                onClick={() => {
                  toggleLike(track);
                  setShowOptions(false);
                }}
                className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-red-500/15 text-left font-medium cursor-pointer"
              >
                <Heart size={14} fill={liked ? "currentColor" : "none"} className={liked ? "text-red-500" : ""} />
                {liked ? "Remove from Liked" : "Add to Liked Songs"}
              </button>

              <button
                onClick={() => {
                  playTrack(track);
                  setShowOptions(false);
                }}
                className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-red-500/15 text-left font-medium cursor-pointer"
              >
                <Play size={14} />
                Play Now
              </button>

              <button
                onClick={() => setShowPlaylistSubmenu((v) => !v)}
                className="flex w-full items-center justify-between rounded-md p-2 hover:bg-red-500/15 text-left font-medium cursor-pointer border-t border-white/5 dark:border-white/5 mt-0.5"
              >
                <div className="flex items-center gap-2">
                  <ListPlus size={14} className="text-red-400" />
                  <span>Add to Playlist</span>
                </div>
                <span className="text-[10px] opacity-60">
                  {showPlaylistSubmenu ? "▲" : "▼"}
                </span>
              </button>

              {/* Submenu for playlists */}
              {showPlaylistSubmenu && (
                <div className="mt-1 space-y-0.5 rounded-lg bg-black/20 p-1 max-h-36 overflow-y-auto spotify-scrollbar">
                  {customPlaylists.length > 0 ? (
                    customPlaylists.map((cp) => {
                      const inThis = (cp.tracks || []).some(
                        (t) => String(t.id) === String(track.id),
                      );
                      return (
                        <button
                          key={cp.id}
                          onClick={() => handleTogglePlaylistSong(cp.id, inThis)}
                          className={`
                            flex w-full items-center justify-between rounded p-1.5 text-[11px] text-left transition cursor-pointer
                            ${
                              inThis
                                ? "bg-red-500/20 text-red-400 font-bold"
                                : "hover:bg-white/10"
                            }
                          `}
                        >
                          <span className="truncate max-w-[120px]">{cp.title}</span>
                          {inThis && <Check size={12} className="text-red-500" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-1.5 text-[10.5px] opacity-60 text-center">
                      No custom playlists
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowOptions(false);
                      openCreatePlaylistModal();
                    }}
                    className="flex w-full items-center gap-1.5 rounded p-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/15 cursor-pointer mt-1"
                  >
                    <Plus size={12} />
                    New Playlist
                  </button>
                </div>
              )}

              {isCustomPlaylist && playlistId && (
                <button
                  onClick={() => {
                    removeSongFromPlaylist(playlistId, track.id);
                    setShowOptions(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-red-500/20 text-left font-medium text-red-400 cursor-pointer border-t border-white/5 mt-0.5"
                >
                  <Trash2 size={14} />
                  Remove from Playlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TrackHeader() {
  const { theme } = useTheme();

  return (
    <div
      className={`
        mb-2 grid grid-cols-[24px_minmax(0,1fr)_auto] sm:grid-cols-[32px_minmax(0,1fr)_auto] md:grid-cols-[32px_minmax(0,1.8fr)_minmax(0,1.2fr)_105px] items-center gap-2.5 sm:gap-3.5 border-b px-2.5 sm:px-3.5 pb-2.5 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider
        ${
          theme === "dark"
            ? "border-white/[0.08] text-[#888888]"
            : "border-stone-300 text-stone-500"
        }
      `}
    >
      <span className="text-center">#</span>
      <span>Title</span>
      <span className="hidden md:block">Album</span>
      <span className="flex justify-end pr-2">
        <Clock3 size={15} />
      </span>
    </div>
  );
}
