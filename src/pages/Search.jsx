import { Filter, Loader2, Search as SearchIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import TrackRow from "@/components/music/TrackRow";
import MusicCard from "@/components/music/MusicCard";
import { artists, searchCategories, songs } from "@/data/musicData";
import { useTheme } from "@/context/ThemeContext";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useLiveSearch } from "@/hooks/useLiveMusic";
import Footer from "@/components/common/Footer";

const LANGUAGES = [
  "All",
  "Telugu",
  "English",
  "Tamil",
  "Hindi",
  "Malayalam",
  "Kannada",
];

export default function Search() {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  // Live real-time search from local JioSaavn API server
  const { results: liveResults, isSearching } = useLiveSearch(
    query,
    selectedLanguage,
    300,
  );

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleQueryChange = (val) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const normalized = query.trim().toLowerCase();

  const songResults = useMemo(() => {
    if (liveResults && liveResults.length > 0) {
      return liveResults;
    }

    let filtered = songs;
    if (selectedLanguage !== "All") {
      filtered = filtered.filter((s) => s.language === selectedLanguage);
    }

    if (!normalized) {
      return selectedLanguage !== "All" ? filtered : [];
    }

    return filtered.filter((song) =>
      `${song.title} ${song.artist} ${song.album} ${song.language} ${song.genre}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [liveResults, normalized, selectedLanguage]);

  const artistResults = useMemo(() => {
    if (!normalized && selectedLanguage === "All") return [];

    let filtered = artists;
    if (selectedLanguage !== "All") {
      filtered = filtered.filter((a) => a.language === selectedLanguage);
    }

    if (normalized) {
      filtered = filtered.filter(
        (artist) =>
          artist.name.toLowerCase().includes(normalized) ||
          artist.language.toLowerCase().includes(normalized),
      );
    }

    return filtered.map((artist) => ({
      id: artist.id,
      title: artist.name,
      subtitle: `${artist.language} • Artist`,
      image: artist.image,
      type: "artist",
      round: true,
    }));
  }, [normalized, selectedLanguage]);

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
      <div className="px-4 pb-36 sm:pb-24 pt-4 sm:px-6 lg:pb-16">
        {/* Search Input Bar (Mobile only; on iPad and Desktop the Topbar Search is active) */}
        <div className="mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div
            className={`
              flex h-[48px] min-h-[48px] w-full flex-1 max-w-[560px] items-center rounded-full px-5 shadow-md transition-all duration-200 md:hidden
              ${
                theme === "dark"
                  ? "bg-[#242424] text-white border border-white/10 focus-within:border-red-500/60 focus-within:bg-[#282828]"
                  : "bg-white text-stone-900 border border-stone-300/80 focus-within:border-red-500 focus-within:shadow-lg"
              }
            `}
          >
            <SearchIcon
              size={21}
              className={`mr-3.5 shrink-0 ${
                theme === "dark" ? "text-[#b3b3b3]" : "text-stone-400"
              }`}
            />

            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="What do you want to listen to? (e.g. Sid Sriram, Butta Bomma, Kesariya)"
              className={`
                min-w-0 flex-1 bg-transparent text-[14.5px] font-medium outline-none
                ${
                  theme === "dark"
                    ? "text-white placeholder:text-[#888]"
                    : "text-stone-900 placeholder:text-stone-400"
                }
              `}
            />

            {isSearching && (
              <Loader2
                size={20}
                className="animate-spin text-red-500 mr-2 shrink-0"
              />
            )}

            {query && !isSearching && (
              <button
                onClick={() => handleQueryChange("")}
                className="opacity-70 hover:opacity-100 p-1 mr-1 cursor-pointer"
                title="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Language filter pills in Search */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none no-scrollbar">
            {LANGUAGES.map((lang) => (
              <InteractiveHoverButton
                key={lang}
                text={lang}
                isActive={selectedLanguage === lang}
                onClick={() => setSelectedLanguage(lang)}
              />
            ))}
          </div>
        </div>

        {/* Browse Categories */}
        {!normalized && selectedLanguage === "All" ? (
          <>
            <h1 className="mb-5 text-[22px] font-bold tracking-tight">
              Browse all categories & languages
            </h1>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-4">
              {searchCategories.map((category) => (
                <motion.div
                  key={category.id || category.title || category.name}
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 330,
                    damping: 24,
                  }}
                  onClick={() => handleQueryChange(category.filter || category.title || category.name)}
                  className={`
                    group relative aspect-[1.6/1] cursor-pointer overflow-hidden rounded-xl border p-4 shadow-sm bg-gradient-to-br ${category.color}
                    ${
                      theme === "dark"
                        ? "border-white/[0.08]"
                        : "border-black/[0.08]"
                    }
                  `}
                >
                  <h2 className="relative z-10 text-lg sm:text-xl font-black text-white drop-shadow-md">
                    {category.title || category.name}
                  </h2>

                  {category.image && (
                    <motion.img
                      whileHover={{
                        rotate: 15,
                        scale: 1.1,
                      }}
                      src={category.image}
                      alt={category.title || category.name}
                      className="absolute -bottom-4 -right-4 h-[95px] w-[95px] rotate-12 rounded-lg object-cover shadow-2xl transition-transform"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* Search Results */
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-[22px] font-bold tracking-tight">
                {normalized
                  ? `Search results for "${query}"`
                  : `Songs in ${selectedLanguage}`}
              </h1>
              <span className="text-xs text-[#a7a7a7]">
                {songResults.length} songs found
              </span>
            </div>

            {songResults.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-3 text-lg font-bold text-red-500">
                  Songs ({songResults.length})
                </h2>

                <div className="space-y-1">
                  {songResults.map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index} />
                  ))}
                </div>
              </section>
            )}

            {artistResults.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-lg font-bold text-red-500">
                  Artists ({artistResults.length})
                </h2>

                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-4">
                  {artistResults.map((artist) => (
                    <MusicCard key={artist.id} item={artist} />
                  ))}
                </div>
              </section>
            )}

            {songResults.length === 0 && artistResults.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-4xl mb-2">🔍</p>
                <h2 className="text-xl font-bold">No results found</h2>
                <p
                  className={`mt-2 text-sm ${
                    theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                  }`}
                >
                  Please check the spelling or explore another song, language, or artist.
                </p>
              </div>
            )}
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
