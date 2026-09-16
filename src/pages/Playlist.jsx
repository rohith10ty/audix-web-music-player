import { ArrowLeft, Check, Play, Plus, Search, Share2, Sparkles, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TrackRow, { TrackHeader } from "@/components/music/TrackRow";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { playlists, songs } from "@/data/musicData";

const ADD_LANGUAGES = ["All", "Telugu", "Tamil", "Hindi", "English", "Malayalam", "Kannada", "Punjabi"];

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    allPlaylists,
    playTrack,
    addSongToPlaylist,
    removeSongFromPlaylist,
    isAuthenticated,
    openAuthModal,
  } = usePlayer();

  const [showShareToast, setShowShareToast] = useState(false);
  const [searchAddQuery, setSearchAddQuery] = useState("");
  const [selectedAddLang, setSelectedAddLang] = useState("All");

  const playlist = useMemo(() => {
    const found = allPlaylists.find((item) => String(item.id) === String(id));
    if (found) return found;

    const staticFound = playlists.find((item) => String(item.id) === String(id));
    if (staticFound) return staticFound;

    if (id && String(id).startsWith("custom-")) {
      return {
        id: id,
        title: "My Custom Playlist",
        description: "Your personal custom playlist.",
        owner: "You",
        followers: "0 saves",
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
        tracks: [],
        isCustom: true,
      };
    }

    const cleanTitle = id
      ? id
          .replace(/^live-/, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Custom Mix";

    return {
      id: id || "playlist-mix",
      title: `${cleanTitle} Mix`,
      description: "Curated playlist mix with top tracks.",
      owner: "Audix Live",
      followers: "Curated for you",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
      tracks: songs.slice(0, 8),
      isCustom: false,
    };
  }, [allPlaylists, id]);

  const isCustom = Boolean(
    playlist.isCustom || (typeof playlist.id === "string" && playlist.id.startsWith("custom-")),
  );

  const handlePlayAll = () => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  const handleAddSongToPlaylist = (song) => {
    if (!isAuthenticated) {
      openAuthModal("signup");
      return;
    }
    addSongToPlaylist(playlist.id, song);
  };

  // Filter songs for the "Add Songs" section
  const availableSongsToAdd = useMemo(() => {
    let list = songs;

    if (selectedAddLang !== "All") {
      list = list.filter((s) => s.language === selectedAddLang);
    }

    if (searchAddQuery.trim()) {
      const q = searchAddQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          (s.album && s.album.toLowerCase().includes(q)),
      );
    }

    return list.slice(0, 12);
  }, [searchAddQuery, selectedAddLang]);

  return (
    <main
      className={`
        spotify-page transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-[#121212] text-white"
            : "bg-[#f5f2eb] text-stone-900"
        }
      `}
    >
      {/* Hero Banner with Dynamic Gradient */}
      <div className="relative min-h-[210px] sm:min-h-[235px] overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90 hover:scale-105 shadow-md cursor-pointer"
          title="Back to previous page"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          className={`
            absolute inset-0 bg-gradient-to-b transition-colors duration-300
            ${
              id === "liked"
                ? "from-rose-800/60 via-red-950/30 to-transparent"
                : theme === "dark"
                ? "from-red-950/50 via-[#181818]/60 to-transparent"
                : "from-stone-300/60 via-[#f5f2eb]/70 to-transparent"
            }
          `}
        />

        <div className="relative z-10 flex flex-col gap-3.5 px-5 pb-4 pt-9 md:flex-row md:items-end">
          <motion.img
            initial={{
              opacity: 0,
              scale: 0.9,
              rotate: -2,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 170,
              damping: 19,
            }}
            src={playlist.image}
            alt={playlist.title}
            className="h-[125px] w-[125px] rounded-xl object-cover shadow-[0_12px_32px_rgba(0,0,0,0.35)] md:h-[150px] md:w-[150px]"
          />

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-red-500">
              Playlist {playlist.language ? `• ${playlist.language}` : ""}
            </p>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl xl:text-4xl leading-tight">
              {playlist.title}
            </h1>

            <p
              className={`
              mt-1 max-w-2xl text-[12.5px] line-clamp-2
              ${theme === "dark" ? "text-[#b3b3b3]" : "text-stone-600"}
            `}
            >
              {playlist.description}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold">
              <span>{playlist.owner}</span>
              <span className="opacity-40">•</span>
              <span className="text-red-500 font-bold">
                {playlist.tracks?.length || 0}{" "}
                {(playlist.tracks?.length || 0) === 1 ? "song" : "songs"}
              </span>
              <span className="opacity-40">•</span>
              <span
                className={
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }
              >
                {playlist.followers || "Curated for you"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Actions & Track Table */}
      <div className="px-4 pb-36 sm:pb-24 lg:px-6 lg:pb-6">
        <div className="mb-3 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.88 }}
            onClick={handlePlayAll}
            disabled={!playlist.tracks || playlist.tracks.length === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition hover:bg-red-400 disabled:opacity-40 cursor-pointer"
            title="Play playlist"
          >
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className={`
              p-2 transition cursor-pointer
              ${
                theme === "dark"
                  ? "text-[#b3b3b3] hover:text-white"
                  : "text-stone-400 hover:text-stone-900"
              }
            `}
            title="Share playlist link"
          >
            <Share2 size={24} />
          </motion.button>

          {showShareToast && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md animate-bounce">
              Link copied!
            </span>
          )}
        </div>

        {/* Track Table Header */}
        {playlist.tracks && playlist.tracks.length > 0 && <TrackHeader />}

        {/* Tracks List */}
        <div className="space-y-1">
          {playlist.tracks &&
            playlist.tracks.map((track, index) => (
              <TrackRow
                key={track.id + index}
                track={track}
                index={index}
                isCustomPlaylist={isCustom}
                playlistId={playlist.id}
              />
            ))}

          {(!playlist.tracks || playlist.tracks.length === 0) && (
            <div className="py-10 text-center">
              <div
                className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                  theme === "dark" ? "bg-white/5 text-stone-400" : "bg-stone-200 text-stone-600"
                }`}
              >
                <Sparkles size={24} className="text-red-500" />
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                This playlist is empty
              </h3>
              <p
                className={`text-xs mt-1 max-w-sm mx-auto leading-relaxed ${
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }`}
              >
                {isCustom
                  ? "Search or pick from the recommended songs below to add tracks to your playlist!"
                  : "Click the heart icon on any song to add it to your Liked Songs!"}
              </p>
            </div>
          )}
        </div>

        {/* Dedicated "Add Songs to this Playlist" Section for Custom Playlists */}
        {isCustom && (
          <div className="mt-10 border-t border-white/10 dark:border-white/10 border-stone-300/60 pt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-red-500" />
                <h2 className="text-base sm:text-lg font-bold">
                  Add Songs to {playlist.title}
                </h2>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }`}
              >
                Search your favorite tracks across languages and add them with one click.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-3.5 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />
              <input
                type="text"
                value={searchAddQuery}
                onChange={(e) => setSearchAddQuery(e.target.value)}
                placeholder="Search by title, artist, or movie..."
                className={`
                  w-full rounded-full pl-9 pr-8 py-2 text-xs font-medium outline-none border transition
                  ${
                    theme === "dark"
                      ? "bg-[#222] border-white/10 text-white placeholder:text-[#666] focus:border-red-500"
                      : "bg-[#ece7de] border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-red-500"
                  }
                `}
              />
              {searchAddQuery && (
                <button
                  onClick={() => setSearchAddQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Language filter pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 no-scrollbar">
              {ADD_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedAddLang(lang)}
                  className={`
                    px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer shrink-0
                    ${
                      selectedAddLang === lang
                        ? "bg-red-500 text-white shadow-sm"
                        : theme === "dark"
                        ? "bg-white/5 hover:bg-white/10 text-white/80"
                        : "bg-stone-200 hover:bg-stone-300 text-stone-700"
                    }
                  `}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* List of recommended songs with instant "+ Add" button */}
            <div className="space-y-1.5 mt-2">
              {availableSongsToAdd.map((song) => {
                const isAlreadyIn = (playlist.tracks || []).some(
                  (t) => String(t.id) === String(song.id),
                );

                return (
                  <div
                    key={song.id}
                    className={`
                      flex items-center justify-between p-2 rounded-xl transition
                      ${
                        theme === "dark"
                          ? "hover:bg-white/[0.04]"
                          : "hover:bg-stone-200/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      <img
                        src={song.image}
                        alt={song.title}
                        className="h-10 w-10 rounded-md object-cover shrink-0 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-semibold">
                          {song.title}
                        </p>
                        <p
                          className={`truncate text-[11px] ${
                            theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                          }`}
                        >
                          {song.artist}{" "}
                          {song.language && (
                            <span className="text-red-500 font-semibold ml-1">
                              • {song.language}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[11px] hidden sm:block ${
                          theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                        }`}
                      >
                        {song.duration}
                      </span>

                      {isAlreadyIn ? (
                        <button
                          onClick={() => removeSongFromPlaylist(playlist.id, song.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 hover:bg-red-500/15 hover:text-red-400 px-3 py-1.5 rounded-full border border-emerald-500/30 transition cursor-pointer group"
                          title="Click to remove"
                        >
                          <Check size={13} className="group-hover:hidden" />
                          <Trash2 size={13} className="hidden group-hover:block" />
                          <span className="group-hover:hidden">Added</span>
                          <span className="hidden group-hover:inline">Remove</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddSongToPlaylist(song)}
                          className="flex items-center gap-1 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 px-3.5 py-1.5 rounded-full shadow-sm transition hover:scale-105 cursor-pointer"
                        >
                          <Plus size={13} />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
