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
        group relative grid grid-cols-[32px_minmax(0,1fr)_75px] items-center gap-3 rounded-lg px-3 py-1.5 transition-colors
        md:grid-cols-[32px_minmax(0,1.8fr)_minmax(0,1.2fr)_85px]
        ${
          active
            ? theme === "dark"
              ? "bg-white/[0.06]"
              : "bg-red-500/10"
            : ""
        }
      `}
    >
      {/* Index number or Play/Pause Button */}
      <div className="flex items-center justify-center">
        <span
          className={`
            text-[13px] font-medium transition
            ${
              active
                ? "text-red-500 font-bold"
                : theme === "dark"
                ? "text-[#a7a7a7]"
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
        className="flex min-w-0 items-center gap-3 text-left focus:outline-none cursor-pointer"
      >
        <img
          src={track.image}
          alt={track.title}
          className="h-10 w-10 shrink-0 rounded-md object-cover shadow-sm"
        />

        <div className="min-w-0 flex-1">
          <p
            className={`
              truncate text-[14px] font-semibold
              ${
                active
                  ? "text-red-500 font-bold"
                  : theme === "dark"
                  ? "text-white"
                  : "text-stone-900"
              }
            `}
          >
            {track.title}
          </p>

          <p
            className={`
              mt-[2px] truncate text-[12px]
              ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
            `}
          >
            {track.artist}{" "}
            {track.language && (
              <span className="ml-1 text-[10px] font-semibold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                {track.language}
              </span>
            )}
          </p>
        </div>
      </button>

      {/* Album name */}
      {showAlbum && (
        <p
          className={`
            hidden truncate text-[13px] md:block
            ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
          `}
        >
          {track.album}
        </p>
      )}

      {/* Heart button + Duration + Options */}
      <div className="flex items-center justify-end gap-2">
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          className={`
            p-1 transition cursor-pointer
            ${
              liked
                ? "text-red-500 opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }
            ${
              theme === "dark"
                ? "text-[#a7a7a7] hover:text-white"
                : "text-stone-400 hover:text-stone-900"
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
            className="p-1 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
            title="Remove from this playlist"
          >
            <Trash2 size={15} />
          </motion.button>
        )}

        <span
          className={`
            text-[12px]
            ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
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
              p-1 opacity-0 transition group-hover:opacity-100 cursor-pointer
              ${
                theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white"
                  : "text-stone-400 hover:text-stone-900"
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
        mb-2 grid grid-cols-[32px_minmax(0,1fr)_65px] gap-3 border-b px-3 pb-2 text-[12px] font-bold uppercase tracking-wider
        md:grid-cols-[32px_minmax(0,1.8fr)_minmax(0,1.2fr)_75px]
        ${
          theme === "dark"
            ? "border-white/[0.08] text-[#a7a7a7]"
            : "border-stone-300/70 text-stone-400"
        }
      `}
    >
      <span className="text-center">#</span>
      <span>Title</span>
      <span className="hidden md:block">Album</span>
      <span className="flex justify-end pr-4">
        <Clock3 size={15} />
      </span>
    </div>
  );
}
