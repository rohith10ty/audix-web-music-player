import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MusicSection from "@/components/music/MusicSection";
import { artists, songs } from "@/data/musicData";
import { useTheme } from "@/context/ThemeContext";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useLiveHome } from "@/hooks/useLiveMusic";
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

export default function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const pillsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Dynamic live songs and playlists from JioSaavn API with caching & fallback
  const { sections: liveSections } = useLiveHome(selectedLanguage);

  // Dynamic greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Check scroll position of pill container
  const updateScrollState = useCallback(() => {
    const el = pillsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = pillsContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollPills = (direction) => {
    const el = pillsContainerRef.current;
    if (!el) return;
    const distance = 220;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const handlePillsWheel = (e) => {
    const el = pillsContainerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  // Top 6 Trending Quick Picks (Real songs, immediate 1-click play)
  const topQuickPicks = useMemo(() => {
    if (selectedLanguage === "All") {
      // Pick the top trending hits across languages
      const multiLangTop = [
        songs.find((s) => s.id === "samajavaragamana") || songs[0],
        songs.find((s) => s.id === "blinding-lights") || songs[12],
        songs.find((s) => s.id === "kesariya") || songs[33],
        songs.find((s) => s.id === "arabic-kuthu") || songs[23],
        songs.find((s) => s.id === "darshana") || songs[43],
        songs.find((s) => s.id === "ra-ra-rakkamma") || songs[53],
      ].filter(Boolean);

      return multiLangTop.length === 6 ? multiLangTop : songs.slice(0, 6);
    }

    // Filter by specific language
    const langSongs = songs.filter((s) => s.language === selectedLanguage);
    return langSongs.slice(0, 6);
  }, [selectedLanguage]);

  // Dynamic Categorized Music Collections (Trending, Romance, Party, Artists)
  const categorizedSections = useMemo(() => {
    // When JioSaavn API returns live structured sections
    if (liveSections && liveSections.length > 0) {
      return liveSections;
    }

    const langSongs = songs.filter((s) => s.language === selectedLanguage);
    const langArtists = artists.filter((a) => a.language === selectedLanguage);

    if (selectedLanguage === "All") {
      return [
        {
          title: "🔥 Trending Indian & Global Hits",
          language: "All",
          items: [
            songs[0], // Samajavaragamana
            songs[12], // Blinding Lights
            songs[23], // Arabic Kuthu
            songs[33], // Kesariya
            songs[43], // Darshana
            songs[53], // Ra Ra Rakkamma
          ].filter(Boolean).map((s) => ({
            id: s.id,
            title: s.title,
            subtitle: `${s.artist} • ${s.album}`,
            image: s.image,
            type: "song",
            track: s,
          })),
        },
        {
          title: "🚀 Most Streamed Blockbusters",
          language: "All",
          items: [
            songs[1], // Butta Bomma
            songs[16], // Shape of You
            songs[26], // Rowdy Baby
            songs[34], // Tum Hi Ho
            songs[44], // Malare
            songs[54], // Singara Siriye
          ].filter(Boolean).map((s) => ({
            id: s.id,
            title: s.title,
            subtitle: `${s.artist} • ${s.album}`,
            image: s.image,
            type: "song",
            track: s,
          })),
        },
        {
          title: "💖 Romantic Melodies & Love Hits",
          language: "All",
          items: songs
            .filter((s) => s.genre === "Melody & Romance")
            .slice(0, 6)
            .map((s) => ({
              id: s.id,
              title: s.title,
              subtitle: `${s.artist} • ${s.album}`,
              image: s.image,
              type: "song",
              track: s,
            })),
        },
        {
          title: "⚡ Party & Dance Bangers",
          language: "All",
          items: songs
            .filter((s) => s.genre === "Party & Dance")
            .slice(0, 6)
            .map((s) => ({
              id: s.id,
              title: s.title,
              subtitle: `${s.artist} • ${s.album}`,
              image: s.image,
              type: "song",
              track: s,
            })),
        },
        {
          title: "🎤 Popular Artists",
          language: "All",
          items: artists.slice(0, 6).map((artist) => ({
            id: artist.id,
            title: artist.name,
            subtitle: `${artist.language} • Artist`,
            image: artist.image,
            type: "artist",
            round: true,
          })),
        },
      ];
    }

    // Specific Language Categorized Sections
    const sections = [
      {
        title: `🔥 Trending ${selectedLanguage} Chartbusters`,
        language: selectedLanguage,
        items: langSongs.slice(0, 6).map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: `${s.artist} • ${s.album}`,
          image: s.image,
          type: "song",
          track: s,
        })),
      },
    ];

    const romanceSongs = langSongs.filter((s) => s.genre === "Melody & Romance");
    if (romanceSongs.length > 0) {
      sections.push({
        title: `💖 ${selectedLanguage} Romantic Melodies`,
        language: selectedLanguage,
        items: romanceSongs.slice(0, 6).map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: `${s.artist} • ${s.album}`,
          image: s.image,
          type: "song",
          track: s,
        })),
      });
    }

    const partySongs = langSongs.filter(
      (s) => s.genre === "Party & Dance" || s.genre === "Workout & Energy",
    );
    if (partySongs.length > 0) {
      sections.push({
        title: `⚡ ${selectedLanguage} Energy & Party Hits`,
        language: selectedLanguage,
        items: partySongs.slice(0, 6).map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: `${s.artist} • ${s.album}`,
          image: s.image,
          type: "song",
          track: s,
        })),
      });
    }

    if (langArtists.length > 0) {
      sections.push({
        title: `🎤 Popular ${selectedLanguage} Artists`,
        language: selectedLanguage,
        items: langArtists.map((artist) => ({
          id: artist.id,
          title: artist.name,
          subtitle: `${artist.language} • Artist`,
          image: artist.image,
          type: "artist",
          round: true,
        })),
      });
    }

    return sections;
  }, [selectedLanguage, liveSections]);

  return (
    <main
      className={`
        spotify-page relative transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-[#121212] text-white"
            : "bg-[#f5f2eb] text-stone-900"
        }
      `}
    >
      {/* Dynamic Header Gradient */}
      <div
        className={`
          pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-gradient-to-b transition-opacity duration-300
          ${
            theme === "dark"
              ? "from-red-950/40 via-[#181828]/40 to-transparent"
              : "from-amber-200/25 via-stone-200/20 to-transparent"
          }
        `}
      />

      {/* Sticky Language Filter Pills Header */}
      <div
        className={`
          sticky top-0 z-30 px-4 sm:px-6 py-2.5 transition-colors duration-200
          ${
            theme === "dark"
              ? "bg-[#121212]/95 backdrop-blur-xl border-b border-white/[0.04]"
              : "bg-[#f5f2eb]/95 backdrop-blur-xl border-b border-stone-300/60"
          }
        `}
      >
        <div className="relative flex items-center">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scrollPills("left")}
              className={`
                absolute left-0 z-20 hidden sm:flex h-7 w-7 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition cursor-pointer
                ${
                  theme === "dark"
                    ? "bg-stone-900/90 text-white hover:bg-stone-800 border border-white/10"
                    : "bg-white/90 text-stone-900 hover:bg-white border border-stone-300"
                }
              `}
              title="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Pills horizontal scroll row */}
          <div
            ref={pillsContainerRef}
            onWheel={handlePillsWheel}
            className={`flex flex-1 items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar whitespace-nowrap py-1 px-1 transition-all ${
              canScrollLeft ? "sm:pl-8" : ""
            } ${canScrollRight ? "sm:pr-8" : ""}`}
          >
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <InteractiveHoverButton
                  key={lang}
                  text={lang}
                  isActive={isSelected}
                  onClick={() => setSelectedLanguage(lang)}
                />
              );
            })}
          </div>

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scrollPills("right")}
              className={`
                absolute right-0 z-20 hidden sm:flex h-7 w-7 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition cursor-pointer
                ${
                  theme === "dark"
                    ? "bg-stone-900/90 text-white hover:bg-stone-800 border border-white/10"
                    : "bg-white/90 text-stone-900 hover:bg-white border border-stone-300"
                }
              `}
              title="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 px-4 pb-36 sm:pb-24 pt-4 sm:px-6 lg:pb-16">
        {/* TOP: Trending Quick Picks (6 direct playable cards) */}
        {topQuickPicks.length > 0 && (
          <div className="mb-8">
            <h2
              className={`
                mb-4 text-[22px] sm:text-[24px] font-bold tracking-tight
                ${theme === "dark" ? "text-white" : "text-stone-900"}
              `}
            >
              {selectedLanguage === "All"
                ? `${greeting} • Trending Quick Picks`
                : `🔥 ${selectedLanguage} Trending Quick Picks`}
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {topQuickPicks.map((track, index) => {
                const isThisTrackPlaying =
                  currentTrack?.id === track.id && isPlaying;
                const isThisTrackSelected = currentTrack?.id === track.id;

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.025 }}
                    onClick={() => {
                      if (isThisTrackPlaying) {
                        togglePlay();
                      } else {
                        playTrack(track, topQuickPicks);
                      }
                    }}
                    className={`
                      group relative flex h-[64px] sm:h-[68px] cursor-pointer items-center overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:scale-[1.015]
                      ${
                        isThisTrackSelected
                          ? theme === "dark"
                            ? "bg-red-950/25 border-red-500/40 text-white shadow-red-900/10"
                            : "bg-red-50 border-red-300 text-stone-900 shadow-md"
                          : theme === "dark"
                          ? "bg-[#181818] border-white/[0.07] hover:bg-[#222222] text-white"
                          : "bg-[#faf8f5] border-stone-300/60 hover:bg-white text-stone-900 hover:shadow-md"
                      }
                    `}
                  >
                    <img
                      src={track.image}
                      alt={track.title}
                      className="h-[64px] w-[64px] sm:h-[68px] sm:w-[68px] aspect-square object-cover shadow-sm shrink-0"
                    />

                    <div className="min-w-0 flex-1 py-1.5 pl-3.5 pr-14 flex flex-col justify-center">
                      <p
                        className={`
                          truncate text-[14px] sm:text-[14.5px] font-bold leading-snug transition-colors
                          ${
                            isThisTrackSelected
                              ? "text-red-500"
                              : "group-hover:text-red-500"
                          }
                        `}
                      >
                        {track.title}
                      </p>
                      <p
                        className={`
                          mt-0.5 truncate text-[12px] sm:text-[12.5px] font-medium
                          ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                        `}
                      >
                        {track.artist}
                      </p>
                    </div>

                    {/* Instant Play / Pause Floating Trigger */}
                    <div className="absolute right-2.5 sm:right-3 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isThisTrackPlaying) {
                            togglePlay();
                          } else {
                            playTrack(track, topQuickPicks);
                          }
                        }}
                        className={`
                          flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-xl transition-all duration-200 hover:bg-red-400 cursor-pointer
                          ${
                            isThisTrackPlaying
                              ? "opacity-100 scale-100 ring-2 ring-red-400/50"
                              : "opacity-0 group-hover:opacity-100 group-hover:scale-100"
                          }
                        `}
                        title={isThisTrackPlaying ? "Pause" : "Play"}
                      >
                        {isThisTrackPlaying ? (
                          <Pause size={18} fill="currentColor" />
                        ) : (
                          <Play
                            size={18}
                            fill="currentColor"
                            className="ml-[2px]"
                          />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM: Categorized Music Sections */}
        {categorizedSections.map((section, index) => (
          <MusicSection
            key={section.title + selectedLanguage}
            title={section.title}
            items={section.items}
            delay={index * 0.03}
          />
        ))}

        <Footer />
      </div>
    </main>
  );
}


