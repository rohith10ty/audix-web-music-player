import { ArrowUpRight, List, Music, Plus, Search, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CreatePlaylistModal from "./CreatePlaylistModal";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const {
    likedSongIds = [],
    customPlaylists = [],
    isAuthenticated,
    openAuthModal,
    isCreatePlaylistOpen,
    openCreatePlaylistModal,
    closeCreatePlaylistModal,
  } = usePlayer();

  const [activeFilter, setActiveFilter] = useState("All"); // 'All' | 'Playlists' | 'Artists'
  const [searchLibraryQuery, setSearchLibraryQuery] = useState("");
  const [showLibrarySearch, setShowLibrarySearch] = useState(false);
  const [sortBy, setSortBy] = useState("recents"); // 'recents' | 'alphabetical'

  // Combine user's personal Liked Songs and Custom Playlists into library items
  const libraryItems = useMemo(() => {
    const items = [];

    // Only show Liked Songs if the user actually liked songs
    if (likedSongIds.length > 0) {
      items.push({
        id: "liked",
        title: "Liked Songs",
        subtitle: `Playlist • ${likedSongIds.length} songs`,
        image:
          "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=85",
        route: "/playlist/liked",
        type: "Liked",
        artist: false,
      });
    }

    // User's custom created playlists
    customPlaylists.forEach((p) => {
      items.push({
        id: p.id,
        title: p.title,
        subtitle: `Playlist • ${p.tracks?.length || 0} songs`,
        image:
          p.image ||
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
        route: `/playlist/${p.id}`,
        type: "Playlists",
        artist: false,
      });
    });

    let combined = items;

    if (activeFilter === "Playlists") {
      combined = combined.filter((item) => item.type === "Playlists");
    } else if (activeFilter === "Artists") {
      combined = combined.filter((item) => item.type === "Artists");
    }

    if (searchLibraryQuery.trim()) {
      const q = searchLibraryQuery.toLowerCase().trim();
      combined = combined.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q),
      );
    }

    if (sortBy === "alphabetical") {
      combined.sort((a, b) => a.title.localeCompare(b.title));
    }

    return combined;
  }, [likedSongIds, customPlaylists, activeFilter, searchLibraryQuery, sortBy]);

  const toggleSort = () => {
    setSortBy((prev) => (prev === "recents" ? "alphabetical" : "recents"));
  };

  const hasAnyItems = likedSongIds.length > 0 || customPlaylists.length > 0;

  return (
    <>
      <aside
        className={`
          spotify-panel hidden min-h-0 flex-col overflow-hidden lg:flex transition-colors duration-200
          ${
            theme === "dark"
              ? "bg-[#121212] text-white border-white/[0.06]"
              : "bg-[#faf8f5] text-stone-900 border-stone-300/60 shadow-sm"
          }
        `}
      >
        {/* Header: Library Title + Action Buttons */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-[16px] font-bold">Your Library</h2>

          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal("signup");
                } else {
                  openCreatePlaylistModal();
                }
              }}
              className={`
                flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer
                ${
                  theme === "dark"
                    ? "text-[#b3b3b3] hover:text-white hover:bg-white/10"
                    : "text-stone-600 hover:text-stone-900 hover:bg-[#ece7de]"
                }
              `}
              title="Create new playlist"
            >
              <Plus size={22} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate("/search")}
              className={`
                flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer
                ${
                  theme === "dark"
                    ? "text-[#b3b3b3] hover:text-white hover:bg-white/10"
                    : "text-stone-600 hover:text-stone-900 hover:bg-[#ece7de]"
                }
              `}
              title="Browse all"
            >
              <ArrowUpRight size={18} />
            </motion.button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto px-4 py-1.5 scrollbar-none no-scrollbar">
          {["All", "Playlists", "Artists"].map((filter) => (
            <InteractiveHoverButton
              key={filter}
              text={filter}
              isActive={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </div>

        {/* Search within Library & Sort Controls */}
        {hasAnyItems && (
          <div className="flex items-center justify-between px-4 pb-2">
            {showLibrarySearch ? (
              <div className="flex flex-1 items-center gap-2 pr-2">
                <input
                  value={searchLibraryQuery}
                  onChange={(e) => setSearchLibraryQuery(e.target.value)}
                  placeholder="Search in Library..."
                  className={`
                    w-full rounded-md px-2.5 py-1 text-xs outline-none
                    ${
                      theme === "dark"
                        ? "bg-[#222] text-white border border-white/10"
                        : "bg-[#ece7de] text-stone-900 border border-stone-300/80"
                    }
                  `}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowLibrarySearch(false);
                    setSearchLibraryQuery("");
                  }}
                  className="opacity-70 hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.08 }}
                onClick={() => setShowLibrarySearch(true)}
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full transition
                  ${
                    theme === "dark"
                      ? "text-[#b3b3b3] hover:text-white hover:bg-white/10"
                      : "text-stone-600 hover:text-stone-900 hover:bg-[#ece7de]"
                  }
                `}
                title="Search Library"
              >
                <Search size={16} />
              </motion.button>
            )}

            <button
              onClick={toggleSort}
              className={`
                flex items-center gap-1.5 text-[12px] font-semibold transition
                ${
                  theme === "dark"
                    ? "text-[#b3b3b3] hover:text-white"
                    : "text-stone-600 hover:text-stone-900"
                }
              `}
              title="Click to toggle sorting"
            >
              <span>
                {sortBy === "recents" ? "Recents" : "Alphabetical (A-Z)"}
              </span>
              <List size={15} />
            </button>
          </div>
        )}

        {/* Scrollable Library List or Filter Empty States */}
        <div className="sidebar-scroll-container spotify-scrollbar flex-1 overflow-y-auto px-2 pb-5">
          {libraryItems.length > 0 ? (
            libraryItems.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  onClick={() => navigate(item.route)}
                  className={`
                    group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors
                    ${
                      isActive
                        ? theme === "dark"
                          ? "bg-white/10"
                          : "bg-red-500/10"
                        : theme === "dark"
                        ? "hover:bg-white/[0.06]"
                        : "hover:bg-[#ece7de]/70"
                    }
                  `}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`
                      h-12 w-12 shrink-0 object-cover shadow-sm transition group-hover:scale-105
                      ${item.artist ? "rounded-full" : "rounded-md"}
                    `}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                      truncate text-[14px] font-semibold
                      ${
                        isActive
                          ? "text-red-500 font-bold"
                          : theme === "dark"
                          ? "text-white"
                          : "text-stone-900"
                      }
                    `}
                    >
                      {item.title}
                    </p>

                    <p
                      className={`
                      mt-0.5 truncate text-[12px]
                      ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                    `}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </motion.button>
              );
            })
          ) : activeFilter === "Playlists" ? (
            /* Specific Empty State for "Playlists" filter */
            <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
                  theme === "dark" ? "bg-white/5 text-[#a7a7a7]" : "bg-stone-200 text-stone-600"
                }`}
              >
                <Music size={22} />
              </div>
              <p className="font-bold text-[14px] mb-1">No playlists created yet</p>
              <p
                className={`text-[12px] max-w-[210px] mb-4 leading-relaxed ${
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }`}
              >
                Create your first custom playlist to save and organize your tracks.
              </p>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal("signup");
                  } else {
                    openCreatePlaylistModal();
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition hover:scale-105 cursor-pointer shadow-sm ${
                  theme === "dark"
                    ? "bg-white text-stone-950 hover:bg-stone-200"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
              >
                Create playlist
              </button>
            </div>
          ) : activeFilter === "Artists" ? (
            /* Specific Empty State for "Artists" filter */
            <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
                  theme === "dark" ? "bg-white/5 text-[#a7a7a7]" : "bg-stone-200 text-stone-600"
                }`}
              >
                <User size={22} />
              </div>
              <p className="font-bold text-[14px] mb-1">No artists followed yet</p>
              <p
                className={`text-[12px] max-w-[210px] mb-4 leading-relaxed ${
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }`}
              >
                Explore music and follow your favorite singers & composers.
              </p>
              <button
                onClick={() => navigate("/search")}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition hover:scale-105 cursor-pointer shadow-sm ${
                  theme === "dark"
                    ? "bg-white text-stone-950 hover:bg-stone-200"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
              >
                Find artists
              </button>
            </div>
          ) : searchLibraryQuery.trim() ? (
            <div className="py-8 text-center text-xs opacity-60">
              No matching playlists or artists found.
            </div>
          ) : (
            /* General Spotify-style Empty State Prompts */
            <div className="flex flex-col gap-3 px-2 py-3">
              <div
                className={`
                  p-4 rounded-xl transition-colors
                  ${theme === "dark" ? "bg-[#1e1e1e]" : "bg-[#ece7de]/80"}
                `}
              >
                <p className="font-bold text-[14px] leading-tight">
                  Create your first playlist
                </p>
                <p
                  className={`
                    mt-1 text-[12px] leading-relaxed
                    ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-600"}
                  `}
                >
                  It's easy, we'll help you organize your favorite tracks.
                </p>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal("signup");
                    } else {
                      openCreatePlaylistModal();
                    }
                  }}
                  className={`
                    mt-3.5 px-4 py-1.5 rounded-full text-[13px] font-bold transition hover:scale-105 cursor-pointer shadow-sm
                    ${
                      theme === "dark"
                        ? "bg-white text-stone-950 hover:bg-stone-200"
                        : "bg-stone-900 text-white hover:bg-stone-800"
                    }
                  `}
                >
                  Create playlist
                </button>
              </div>

              <div
                className={`
                  p-4 rounded-xl transition-colors
                  ${theme === "dark" ? "bg-[#1e1e1e]" : "bg-[#ece7de]/80"}
                `}
              >
                <p className="font-bold text-[14px] leading-tight">
                  Explore new music & hits
                </p>
                <p
                  className={`
                    mt-1 text-[12px] leading-relaxed
                    ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-600"}
                  `}
                >
                  Discover trending songs, artists, and playlists curated for you.
                </p>
                <button
                  onClick={() => navigate("/search")}
                  className={`
                    mt-3.5 px-4 py-1.5 rounded-full text-[13px] font-bold transition hover:scale-105 cursor-pointer shadow-sm
                    ${
                      theme === "dark"
                        ? "bg-white text-stone-950 hover:bg-stone-200"
                        : "bg-stone-900 text-white hover:bg-stone-800"
                    }
                  `}
                >
                  Explore music
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Modal to create custom playlist */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={closeCreatePlaylistModal}
      />
    </>
  );
}
