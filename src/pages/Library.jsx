import {
  ArrowUpDown,
  Heart,
  Library as LibraryIcon,
  Music,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { artists, playlists } from "@/data/musicData";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const FILTER_TABS = ["All", "Playlists", "Liked", "Artists", "Featured"];

export default function Library() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    likedSongs = [],
    customPlaylists = [],
    isAuthenticated,
    openAuthModal,
    openCreatePlaylistModal,
    playTrack,
    deleteCustomPlaylist,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [sortBy, setSortBy] = useState("recents");

  const combinedItems = useMemo(() => {
    let items = [];

    const likedCount = likedSongs.length;
    if (activeTab === "All" || activeTab === "Liked" || activeTab === "Playlists") {
      items.push({
        id: "liked",
        title: "Liked Songs",
        subtitle: `Playlist • ${likedCount} ${likedCount === 1 ? "song" : "songs"}`,
        image:
          "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=85",
        route: "/playlist/liked",
        type: "Liked",
        isLikedCard: true,
        count: likedCount,
      });
    }

    if (activeTab === "All" || activeTab === "Playlists") {
      customPlaylists.forEach((p) => {
        const count = p.tracks?.length || 0;
        items.push({
          id: p.id,
          title: p.title,
          subtitle: `Playlist • ${count} ${count === 1 ? "song" : "songs"}`,
          image:
            p.image ||
            "https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg",
          route: `/playlist/${p.id}`,
          type: "Playlists",
          isCustom: true,
          count,
          raw: p,
        });
      });
    }

    if (activeTab === "All" || activeTab === "Featured" || activeTab === "Playlists") {
      playlists.forEach((p) => {
        const count = p.tracks?.length || 0;
        items.push({
          id: p.id,
          title: p.title,
          subtitle: `Curated • ${p.owner || "Audix"} • ${count} songs`,
          image: p.image,
          route: `/playlist/${p.id}`,
          type: "Featured",
          count,
        });
      });
    }

    if (activeTab === "All" || activeTab === "Artists") {
      artists.forEach((a) => {
        items.push({
          id: a.id,
          title: a.name,
          subtitle: `Artist • ${a.language}`,
          image: a.image,
          route: `/artist/${a.id}`,
          type: "Artists",
          isArtist: true,
        });
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q)
      );
    }

    if (sortBy === "alphabetical") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }

    return items;
  }, [likedSongs, customPlaylists, activeTab, searchQuery, sortBy]);

  const handleCreateNew = () => {
    if (!isAuthenticated) {
      openAuthModal("signup");
    } else {
      openCreatePlaylistModal();
    }
  };

  return (
    <main
      className={`spotify-page relative transition-colors duration-200 min-h-0 overflow-y-auto ${
        theme === "dark" ? "bg-[#121212] text-white" : "bg-[#f5f2eb] text-stone-900"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-gradient-to-b transition-opacity duration-300 ${
          theme === "dark"
            ? "from-red-950/30 via-[#181828]/20 to-transparent"
            : "from-rose-200/25 via-stone-200/20 to-transparent"
        }`}
      />

      <div
        className={`sticky top-0 z-30 px-4 sm:px-6 py-3 transition-colors duration-200 ${
          theme === "dark"
            ? "bg-[#121212]/95 backdrop-blur-xl border-b border-white/[0.04]"
            : "bg-[#f5f2eb]/95 backdrop-blur-xl border-b border-stone-300/60"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 text-red-500">
              <LibraryIcon size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Your Library
              </h1>
              <p className="text-[11px] opacity-60">
                {customPlaylists.length} custom playlists • {likedSongs.length} liked songs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowSearchInput((prev) => !prev)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer ${
                showSearchInput
                  ? "bg-red-500 text-white"
                  : theme === "dark"
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-stone-200 text-stone-900 hover:bg-stone-300"
              }`}
              title="Search Library"
            >
              <Search size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-md hover:bg-red-400 transition cursor-pointer"
              title="Create new playlist"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Playlist</span>
            </motion.button>
          </div>
        </div>

        {showSearchInput && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-3 flex items-center gap-2"
          >
            <div
              className={`flex flex-1 items-center gap-2 px-3 py-1.5 rounded-xl border ${
                theme === "dark"
                  ? "bg-[#1e1e1e] border-white/10 text-white"
                  : "bg-white border-stone-300 text-stone-900 shadow-sm"
              }`}
            >
              <Search size={16} className="opacity-50 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search playlists, artists, liked songs..."
                className="w-full bg-transparent text-xs font-medium outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="opacity-60 hover:opacity-100"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar scrollbar-none">
          <div className="flex items-center gap-1.5">
            {FILTER_TABS.map((tab) => (
              <InteractiveHoverButton
                key={tab}
                text={tab}
                isActive={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>

          <button
            onClick={() =>
              setSortBy((prev) => (prev === "recents" ? "alphabetical" : "recents"))
            }
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 transition cursor-pointer ${
              theme === "dark"
                ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
            title="Toggle sort order"
          >
            <ArrowUpDown size={13} />
            <span>{sortBy === "recents" ? "Recents" : "A-Z"}</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 px-4 pb-36 sm:pb-24 pt-4 sm:px-6 lg:pb-16 space-y-6">
        {(activeTab === "All" || activeTab === "Liked") && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/playlist/liked")}
            className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-6 shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
              theme === "dark"
                ? "bg-gradient-to-br from-red-950/60 via-[#1f151b] to-[#161616] border-red-500/20 hover:border-red-500/40"
                : "bg-gradient-to-br from-red-100 via-rose-50 to-white border-red-200 hover:border-red-300"
            }`}
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-amber-500 text-white shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Heart size={32} fill="currentColor" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-500 mb-1">
                  <Sparkles size={11} />
                  Your Favorites
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  Liked Songs
                </h2>
                <p className="text-xs sm:text-sm font-semibold opacity-70 mt-0.5">
                  {likedSongs.length} {likedSongs.length === 1 ? "track" : "tracks"} saved
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (likedSongs.length > 0) {
                    playTrack(likedSongs[0], likedSongs);
                  } else {
                    navigate("/playlist/liked");
                  }
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30 hover:bg-red-400 transition shrink-0 cursor-pointer"
                title="Play Liked Songs"
              >
                <Play size={22} fill="currentColor" className="ml-0.5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {(activeTab === "All" || activeTab === "Playlists") && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Your Custom Playlists ({customPlaylists.length})
              </h2>
              <button
                onClick={handleCreateNew}
                className="text-xs font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} />
                Create New
              </button>
            </div>

            {customPlaylists.length === 0 ? (
              <div
                className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border text-center ${
                  theme === "dark"
                    ? "bg-white/[0.02] border-white/[0.06]"
                    : "bg-white/80 border-stone-200"
                }`}
              >
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-red-500/15 text-red-500 mb-3">
                  <Music size={22} />
                </div>
                <h3 className="text-sm font-bold mb-1">Create your first playlist</h3>
                <p className="text-xs opacity-65 max-w-sm mb-4 leading-relaxed">
                  Collect and organize your favorite Telugu, Tamil, Hindi, and English tracks into personal playlists.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-400 transition shadow-md cursor-pointer"
                >
                  Create Playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {customPlaylists.map((p) => {
                  const songCount = p.tracks?.length || 0;
                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: 1.015 }}
                      onClick={() => navigate(`/playlist/${p.id}`)}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-all cursor-pointer ${
                        theme === "dark"
                          ? "bg-[#181818] border-white/[0.08] hover:bg-[#202020]"
                          : "bg-white border-stone-200 hover:shadow-md"
                      }`}
                    >
                      <img
                        src={
                          p.image ||
                          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85"
                        }
                        alt={p.title}
                        className="h-14 w-14 rounded-lg object-cover shadow-sm shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold group-hover:text-red-500 transition-colors">
                          {p.title}
                        </h4>
                        <p className="truncate text-xs opacity-65 mt-0.5">
                          Playlist • {songCount} {songCount === 1 ? "song" : "songs"}
                        </p>
                        <p className="text-[10.5px] text-red-500 font-semibold mt-0.5">
                          {p.owner || "Created by you"}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete playlist "${p.title}"?`)) {
                            deleteCustomPlaylist(p.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-70 hover:!opacity-100 p-2 rounded-full hover:bg-red-500/15 hover:text-red-500 transition cursor-pointer"
                        title="Delete Playlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(activeTab === "All" || activeTab === "Featured" || activeTab === "Playlists") && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Curated & Featured Playlists ({playlists.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {playlists.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/playlist/${p.id}`)}
                  className={`group flex flex-col p-3 rounded-xl border shadow-sm transition-all cursor-pointer ${
                    theme === "dark"
                      ? "bg-[#181818] border-white/[0.08] hover:bg-[#222222]"
                      : "bg-white border-stone-200 hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-square mb-2.5 overflow-hidden rounded-lg">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p.tracks && p.tracks.length > 0) {
                          playTrack(p.tracks[0], p.tracks);
                        } else {
                          navigate(`/playlist/${p.id}`);
                        }
                      }}
                      className="absolute right-2 bottom-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 cursor-pointer"
                      title="Play Playlist"
                    >
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </motion.button>
                  </div>

                  <h4 className="truncate text-xs sm:text-sm font-bold group-hover:text-red-500 transition-colors">
                    {p.title}
                  </h4>
                  <p className="truncate text-[11px] opacity-65 mt-0.5">
                    {p.owner || "Audix"} • {p.tracks?.length || 0} songs
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "All" || activeTab === "Artists") && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Artists & Composers
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {artists.map((a) => (
                <motion.div
                  key={a.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/artist/${a.id}`)}
                  className={`group flex flex-col items-center p-3 rounded-xl border text-center shadow-sm transition-all cursor-pointer ${
                    theme === "dark"
                      ? "bg-[#181818] border-white/[0.08] hover:bg-[#222222]"
                      : "bg-white border-stone-200 hover:shadow-md"
                  }`}
                >
                  <img
                    src={a.image}
                    alt={a.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover shadow-md mb-2 group-hover:scale-105 transition-transform duration-300"
                  />
                  <h4 className="truncate text-xs sm:text-sm font-bold w-full group-hover:text-red-500 transition-colors">
                    {a.name}
                  </h4>
                  <p className="truncate text-[11px] opacity-65 mt-0.5 w-full">
                    {a.language} • Artist
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
