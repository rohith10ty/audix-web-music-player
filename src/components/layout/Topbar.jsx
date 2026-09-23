import {
  Bell,
  Check,
  Compass,
  Headphones,
  Heart,
  Home,
  Moon,
  Music,
  Search,
  Sun,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ProfileModal from "./ProfileModal";
import AuthModal from "@/components/auth/AuthModal";
import ThemeToggleButton from "@/components/ui/ThemeToggleButton";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { songs } from "@/data/musicData";
import { useLiveSearch } from "@/hooks/useLiveMusic";

function AudixLogo() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/")}
      aria-label="Audix Home"
      className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
    >
      <img
        src="/logo.png"
        alt="Audix Logo"
        className="h-10 w-10 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-105 shrink-0"
      />
      <span className="hidden sm:inline-block font-black text-[20px] tracking-tight bg-gradient-to-r from-red-500 via-rose-500 to-red-400 bg-clip-text text-transparent">
        Audix
      </span>
    </button>
  );
}

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const {
    userProfile,
    currentUser,
    playTrack,
    isAuthenticated,
    openAuthModal,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
  } = usePlayer();

  const emailPrefix = currentUser?.email ? currentUser.email.split("@")[0] : "User";
  const displayName =
    userProfile?.name && userProfile.name !== "Guest Listener"
      ? userProfile.name
      : currentUser?.displayName || emailPrefix;
  const avatarSrc = userProfile?.avatar || currentUser?.photoURL || "";

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  const searchContainerRef = useRef(null);

  const isSearchPage = location.pathname === "/search";

  // Sync with URL when on /search page
  useEffect(() => {
    if (isSearchPage) {
      const q = new URLSearchParams(location.search).get("q") || "";
      setSearchTerm(q);
    }
  }, [isSearchPage, location.search]);

  // Live real-time search results for topbar dropdown
  const { results: apiLiveResults, isSearching } = useLiveSearch(
    searchTerm,
    "All",
    250,
  );

  const liveResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    if (apiLiveResults && apiLiveResults.length > 0) {
      return apiLiveResults.slice(0, 5);
    }
    return songs
      .filter((s) =>
        `${s.title} ${s.artist} ${s.language} ${s.album} ${s.genre}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()),
      )
      .slice(0, 5);
  }, [searchTerm, apiLiveResults]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (isSearchPage) {
      if (val.trim()) {
        navigate(`/search?q=${encodeURIComponent(val)}`, { replace: true });
      } else {
        navigate(`/search`, { replace: true });
      }
    } else {
      setShowSearchDropdown(true);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (isSearchPage) {
      navigate("/search", { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  return (
    <>
      <header
        className={`
          relative z-40 flex h-16 w-full items-center justify-between px-3 sm:px-6 transition-colors duration-200
          ${
            theme === "dark"
              ? "bg-black text-white"
              : "bg-[#faf8f5] text-stone-900 border-b border-stone-300/60 shadow-sm"
          }
        `}
      >
        {/* LEFT: Audix Logo */}
        <div className="flex items-center shrink-0 z-10">
          <AudixLogo />
        </div>

        {/* CENTER: Home Button + Omnibar Search Bar (Hidden on Mobile to Prevent Overlap) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center gap-2 w-full max-w-[540px] px-3 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("/")}
            title="Home"
            className={`
              flex h-[48px] w-[48px] min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full transition-all cursor-pointer
              ${
                location.pathname === "/"
                  ? theme === "dark"
                    ? "bg-[#282828] text-white"
                    : "bg-[#ded6c9] text-stone-900 shadow-sm"
                  : theme === "dark"
                  ? "bg-[#1f1f1f] text-[#b3b3b3] hover:text-white hover:bg-[#282828]"
                  : "bg-[#ece7de] text-stone-700 hover:text-stone-900 hover:bg-[#ded6c9]"
              }
            `}
          >
            <Home
              size={22}
              fill={location.pathname === "/" ? "currentColor" : "none"}
            />
          </motion.button>

          <div
            ref={searchContainerRef}
            className="relative flex-1 max-w-[480px]"
          >
            <motion.div
              whileFocusWithin={{ scale: 1.01 }}
              className={`
                flex h-[48px] min-h-[48px] w-full items-center rounded-full px-4.5 transition-all
                ${
                  theme === "dark"
                    ? "bg-[#242424] text-white border border-white/[0.08] hover:bg-[#2a2a2a] focus-within:border-red-500/50 focus-within:bg-[#282828]"
                    : "bg-[#ece7de] text-stone-900 border border-stone-300/70 hover:bg-[#e4ded4] focus-within:border-red-500 focus-within:bg-white focus-within:shadow-md"
                }
              `}
            >
              <Search
                size={21}
                className={`mr-3 shrink-0 ${
                  theme === "dark" ? "text-[#b3b3b3]" : "text-stone-400"
                }`}
              />

              <input
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (!isSearchPage && searchTerm.trim()) setShowSearchDropdown(true);
                }}
                onKeyDown={handleSearchSubmit}
                placeholder="What do you want to play? (Telugu, Tamil, Hindi, English...)"
                className={`
                  min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none
                  ${
                    theme === "dark"
                      ? "text-white placeholder:text-[#888]"
                      : "text-stone-900 placeholder:text-stone-400"
                  }
                `}
              />

              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="mr-1 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}

              <div
                className={`
                ml-2 hidden rounded-md px-1.5 py-0.5 text-[10px] font-semibold md:block
                ${
                  theme === "dark"
                    ? "bg-white/10 text-[#a7a7a7]"
                    : "bg-stone-200 text-stone-600"
                }
              `}
              >
                Ctrl K
              </div>
            </motion.div>

            {/* Quick Live Search Results Dropdown (only outside /search page) */}
            {showSearchDropdown && !isSearchPage && liveResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  absolute left-0 right-0 top-13 z-50 overflow-hidden rounded-xl border p-2 shadow-2xl backdrop-blur-xl
                  ${
                    theme === "dark"
                      ? "bg-[#181818]/98 border-white/10 text-white"
                      : "bg-[#faf8f5]/98 border-stone-300 text-stone-900"
                  }
                `}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-400">
                  Matching Songs
                </div>
                {liveResults.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => {
                      playTrack(song);
                      setShowSearchDropdown(false);
                    }}
                    className={`
                      flex w-full items-center gap-3 rounded-lg p-2 text-left transition
                      ${
                        theme === "dark"
                          ? "hover:bg-white/10"
                          : "hover:bg-stone-100"
                      }
                    `}
                  >
                    <img
                      src={song.image}
                      alt={song.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {song.title}
                      </p>
                      <p className="truncate text-xs text-[#a7a7a7]">
                        {song.artist} •{" "}
                        <span className="text-red-400 font-medium">
                          {song.language}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-[#a7a7a7]">
                      {song.duration}
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    navigate(
                      `/search?q=${encodeURIComponent(searchTerm.trim())}`,
                    );
                    setShowSearchDropdown(false);
                  }}
                  className={`
                    mt-1 w-full rounded-lg py-2 text-center text-xs font-bold text-red-500 transition
                    ${
                      theme === "dark"
                        ? "hover:bg-white/5"
                        : "hover:bg-stone-100"
                    }
                  `}
                >
                  View all results for &quot;{searchTerm}&quot; →
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT: Dark/Light Mode Switcher + Notifications + Profile / Login / Signup */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0 z-10">
          {/* Theme Toggle Button with View Transition Ripple */}
          <ThemeToggleButton variant="circle" start="top-right" />

          {isAuthenticated ? (
            <>
              {/* Notifications Button */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowNotifications((v) => !v)}
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full transition cursor-pointer
                    ${
                      theme === "dark"
                        ? "text-[#b3b3b3] hover:text-white hover:bg-white/10"
                        : "text-stone-600 hover:text-stone-900 hover:bg-[#ece7de]"
                    }
                  `}
                  title="What's New"
                >
                  <Bell size={18} />
                </motion.button>

                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`
                      absolute right-0 top-12 z-50 w-72 rounded-xl border p-4 shadow-2xl backdrop-blur-xl
                      ${
                        theme === "dark"
                          ? "bg-[#1f1f1f] border-white/10 text-white"
                          : "bg-[#faf8f5] border-stone-300/80 text-stone-900"
                      }
                    `}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">
                        What&apos;s New
                      </h4>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-xs opacity-60"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p className="font-semibold">
                        ✨ Added 60+ Multi-lingual songs!
                      </p>
                      <p className="text-[#a7a7a7]">
                        Explore Telugu, English, Tamil, Hindi, Malayalam, and
                        Kannada hits now.
                      </p>
                      <p className="text-[10px] text-red-400">Just now</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* User Profile Photo Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsProfileOpen(true)}
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-red-500/50 p-0.5 transition hover:border-red-500 cursor-pointer"
                title={`View profile of ${displayName}`}
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-black text-sm">
                    {(displayName || "U")[0]?.toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black" />
              </motion.button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className={`
                  hidden sm:block px-3.5 py-2 text-xs font-bold transition rounded-full
                  ${
                    theme === "dark"
                      ? "text-[#b3b3b3] hover:text-white hover:bg-white/5"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                  }
                `}
              >
                Sign up
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => openAuthModal("login")}
                className="flex items-center justify-center rounded-full bg-red-500 px-4 sm:px-5 py-2 text-xs font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600 cursor-pointer"
              >
                Log in
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* Interactive Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Login & Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </>
  );
}
