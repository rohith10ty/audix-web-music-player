import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Loader2,
  Music,
  Pause,
  Play,
  Radio,
  Share2,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MusicCard from "@/components/music/MusicCard";
import TrackRow, { TrackHeader } from "@/components/music/TrackRow";
import { artists, songs } from "@/data/musicData";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { searchSongs } from "@/services/musicApi";
import Footer from "@/components/common/Footer";

export default function Artist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  const [liveSongs, setLiveSongs] = useState([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isFollowing, setIsFollowing] = useState(() => {
    try {
      const saved = localStorage.getItem("followed_artists");
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.includes(String(id).toLowerCase());
    } catch {
      return false;
    }
  });

  // Resolve artist object safely with extensive slug & name fallbacks
  const artist = useMemo(() => {
    if (!id) return null;
    const cleanId = String(id).toLowerCase().trim();

    // 1. Match exact id
    let found = (artists || []).find((a) => String(a.id).toLowerCase() === cleanId);
    if (found) return found;

    // 2. Match slugified name (e.g. "billie-eilish" -> "Billie Eilish")
    found = (artists || []).find((a) => {
      const slug = a.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return slug === cleanId;
    });
    if (found) return found;

    // 3. Match partial name inclusion
    const unslugged = cleanId.replace(/-/g, " ");
    found = (artists || []).find((a) => a.name.toLowerCase().includes(unslugged));
    if (found) return found;

    // 4. Look up in songs data
    const matchedSong = (songs || []).find((s) =>
      s.artist.toLowerCase().includes(unslugged) ||
      (s.singers && s.singers.toLowerCase().includes(unslugged)) ||
      (s.musicDirector && s.musicDirector.toLowerCase().includes(unslugged))
    );

    const formattedTitle = unslugged
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      id: cleanId,
      name: matchedSong ? matchedSong.artist.split(",")[0].trim() : formattedTitle,
      language: matchedSong ? matchedSong.language : "Global",
      image:
        matchedSong?.image ||
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80",
      banner: matchedSong?.image || null,
      monthlyListeners: "15.4M monthly listeners",
      bio: `Acclaimed artist streaming global chart-topping hits and fan favorites on Audix.`,
      topSongs: matchedSong ? [matchedSong.id] : [],
    };
  }, [id]);

  // Initial local matching songs
  const localMatches = useMemo(() => {
    if (!artist) return [];
    const nameLower = artist.name.toLowerCase();

    // 1. Direct song matches
    const direct = (songs || []).filter((s) => {
      const art = (s.artist || "").toLowerCase();
      const sing = (s.singers || "").toLowerCase();
      const dir = (s.musicDirector || "").toLowerCase();
      return (
        art.includes(nameLower) ||
        sing.includes(nameLower) ||
        dir.includes(nameLower) ||
        (artist.topSongs && artist.topSongs.includes(s.id))
      );
    });

    if (direct.length >= 8) return direct;

    // 2. Language-based companion matches if few songs
    const lang = (songs || []).filter(
      (s) => s.language === artist.language && !direct.some((d) => d.id === s.id)
    );

    return [...direct, ...lang].slice(0, 10);
  }, [artist]);

  // Fetch live artist songs from Saavn API for deep catalog coverage
  useEffect(() => {
    if (!artist) return;
    let isMounted = true;

    async function fetchArtistTracks() {
      try {
        setIsLoadingSongs(true);
        const apiResults = await searchSongs(artist.name, 1, 20);
        if (isMounted && Array.isArray(apiResults) && apiResults.length > 0) {
          // Deduplicate with local songs
          const localIds = new Set(localMatches.map((s) => String(s.id)));
          const combined = [
            ...localMatches,
            ...apiResults.filter((r) => !localIds.has(String(r.id))),
          ];
          setLiveSongs(combined);
        } else if (isMounted) {
          setLiveSongs(localMatches);
        }
      } catch (err) {
        console.warn("Artist songs fetch error:", err);
        if (isMounted) setLiveSongs(localMatches);
      } finally {
        if (isMounted) setIsLoadingSongs(false);
      }
    }

    fetchArtistTracks();

    return () => {
      isMounted = false;
    };
  }, [artist, localMatches]);

  // Combined active song pool for the artist
  const artistSongs = useMemo(() => {
    if (liveSongs.length > 0) return liveSongs;
    return localMatches;
  }, [liveSongs, localMatches]);

  // Discography items derived from songs
  const discographyItems = useMemo(() => {
    const seenTitles = new Set();
    const items = [];
    for (const s of artistSongs) {
      const key = (s.album || s.title || "").toLowerCase();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        items.push({
          id: s.id,
          title: s.album || s.title,
          subtitle: `${s.title} • ${s.year || "Single"}`,
          image: s.image,
          type: "song",
          track: s,
        });
      }
      if (items.length >= 6) break;
    }
    return items;
  }, [artistSongs]);

  // Related Recommended Artists
  const relatedArtists = useMemo(() => {
    if (!artist) return [];
    return (artists || [])
      .filter((a) => String(a.id).toLowerCase() !== String(artist.id).toLowerCase())
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        title: a.name,
        subtitle: a.monthlyListeners || `${a.language} Artist`,
        image: a.image,
        type: "artist",
        round: true,
      }));
  }, [artist]);

  // Toggle follow status and save to localStorage
  const handleToggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      const saved = localStorage.getItem("followed_artists");
      let list = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];
      const cleanId = String(id).toLowerCase();
      if (next) {
        if (!list.includes(cleanId)) list.push(cleanId);
      } else {
        list = list.filter((item) => item !== cleanId);
      }
      localStorage.setItem("followed_artists", JSON.stringify(list));
    } catch {
      // Ignored
    }
  };

  // Copy share URL
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2400);
  };

  // Play all songs
  const isCurrentArtistPlaying =
    isPlaying &&
    currentTrack &&
    artistSongs.some((t) => String(t.id) === String(currentTrack.id));

  const handlePlayAll = () => {
    if (artistSongs.length === 0) return;
    if (isCurrentArtistPlaying) {
      togglePlay();
    } else {
      playTrack(artistSongs[0], artistSongs, `Artist: ${artist.name}`);
    }
  };

  if (!artist) {
    return null;
  }

  return (
    <main
      className={`
        spotify-page min-h-screen transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-[#121212] text-white"
            : "bg-[#f5f2eb] text-stone-900"
        }
      `}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 z-[100000] -translate-x-1/2 flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>Artist link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Artist Hero Banner */}
      <section className="relative flex min-h-[300px] sm:min-h-[360px] md:min-h-[400px] items-end overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90 hover:scale-105 shadow-lg cursor-pointer"
          title="Back to previous page"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Hero Background Banner */}
        <img
          src={artist.banner || artist.image}
          alt={artist.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80";
          }}
          className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.65] contrast-[1.05]"
        />

        {/* Ambient Gradient Overlay */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-t
            ${
              theme === "dark"
                ? "from-[#121212] via-[#121212]/60 to-black/20"
                : "from-[#f5f2eb] via-[#f5f2eb]/60 to-stone-900/30"
            }
          `}
        />

        {/* Hero Content Information */}
        <div className="relative z-10 px-4 pb-6 sm:px-8 sm:pb-8 max-w-5xl">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/90 text-white backdrop-blur-md shadow-md">
              <CheckCircle2 size={14} />
              <span>Verified Artist</span>
            </span>

            {artist.language && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
                {artist.language}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white drop-shadow-md">
            {artist.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/90 font-medium drop-shadow">
            <span className="flex items-center gap-1.5">
              <Users size={15} className="text-red-400" />
              <span>{artist.monthlyListeners || "18.4M monthly listeners"}</span>
            </span>

            {artistSongs.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Music size={14} className="text-amber-400" />
                  <span>{artistSongs.length} Tracks Available</span>
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Section Content */}
      <div className="px-4 pb-36 sm:pb-24 lg:px-8 lg:pb-16 pt-4">
        {/* Action Controls Bar */}
        <div className="mb-6 flex items-center gap-3.5 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={handlePlayAll}
            className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30 transition hover:bg-red-400 cursor-pointer"
            title={isCurrentArtistPlaying ? "Pause artist" : "Play artist"}
          >
            {isCurrentArtistPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleFollow}
            className={`
              flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer
              ${
                isFollowing
                  ? "bg-red-500 border-red-500 text-white shadow-red-500/20"
                  : theme === "dark"
                  ? "border-white/30 text-white hover:border-white hover:bg-white/10"
                  : "border-stone-400 text-stone-900 hover:border-stone-900 hover:bg-stone-200/60"
              }
            `}
          >
            {isFollowing ? (
              <>
                <UserCheck size={16} />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Follow</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleShare}
            className={`
              flex h-10 w-10 items-center justify-center rounded-full border transition cursor-pointer
              ${
                theme === "dark"
                  ? "border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                  : "border-stone-300 text-stone-800 hover:bg-stone-200/60 hover:border-stone-500"
              }
            `}
            title="Share artist link"
          >
            <Share2 size={16} />
          </motion.button>

          {isLoadingSongs && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold animate-pulse ml-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Loading full catalog...</span>
            </div>
          )}
        </div>

        {/* Popular Tracks Section */}
        <section className="mb-12">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Popular Songs
            </h2>
            <span className="text-xs font-semibold opacity-60">
              {artistSongs.length} tracks
            </span>
          </div>

          <TrackHeader />

          <div className="space-y-1">
            {artistSongs.map((track, index) => (
              <TrackRow
                key={`${track.id}-${index}`}
                track={track}
                index={index}
                showAlbum={true}
                playlistTracks={artistSongs}
                playlistTitle={`Artist: ${artist.name}`}
              />
            ))}
          </div>
        </section>

        {/* Discography & Singles Section */}
        {discographyItems.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl sm:text-2xl font-black tracking-tight">
              Discography & Releases
            </h2>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {discographyItems.map((item) => (
                <MusicCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* About Artist Bio Card */}
        {artist.bio && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl sm:text-2xl font-black tracking-tight">
              About
            </h2>

            <div
              className={`
                relative overflow-hidden rounded-2xl p-6 sm:p-8 border shadow-lg max-w-3xl
                ${
                  theme === "dark"
                    ? "bg-[#181818] border-white/10 text-white"
                    : "bg-[#faf8f5] border-stone-300/80 text-stone-900"
                }
              `}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover shadow-md border-2 border-red-500/50"
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">{artist.name}</h3>
                  <p className="text-xs opacity-70 mt-0.5">
                    {artist.monthlyListeners || "18.4M monthly listeners"}
                  </p>
                  <span className="inline-block mt-1.5 text-[11px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                    {artist.language} Music Icon
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed opacity-80">
                {artist.bio}
              </p>
            </div>
          </section>
        )}

        {/* Fans Also Like / Recommended Artists */}
        {relatedArtists.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl sm:text-2xl font-black tracking-tight">
              Fans Also Like
            </h2>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {relatedArtists.map((item) => (
                <MusicCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Footer */}
        <Footer />
      </div>
    </main>
  );
}
