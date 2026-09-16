import { ArrowLeft, CheckCircle2, Heart, MoreHorizontal, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import MusicCard from "@/components/music/MusicCard";
import TrackRow from "@/components/music/TrackRow";
import { artists, songs } from "@/data/musicData";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

export default function Artist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { playTrack } = usePlayer();

  const [isFollowing, setIsFollowing] = useState(false);

  const artist = artists.find((item) => item.id === id);

  if (!artist) {
    return <Navigate to="/" replace />;
  }

  // Filter songs by artist or artist language
  const artistSongs = useMemo(() => {
    const directMatches = songs.filter((s) =>
      s.artist.toLowerCase().includes(artist.name.toLowerCase()),
    );
    if (directMatches.length >= 5) return directMatches;

    const langMatches = songs.filter((s) => s.language === artist.language);
    return [...directMatches, ...langMatches].slice(0, 10);
  }, [artist]);

  const discographyItems = useMemo(() => {
    return artistSongs.slice(0, 5).map((s) => ({
      id: s.id,
      title: s.album || s.title,
      subtitle: `${s.title} • Single/Album`,
      image: s.image,
      type: "song",
      track: s,
    }));
  }, [artistSongs]);

  const handlePlayAll = () => {
    if (artistSongs.length > 0) {
      playTrack(artistSongs[0], artistSongs);
    }
  };

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
      {/* Artist Hero Banner */}
      <section className="relative flex min-h-[260px] sm:min-h-[300px] items-end overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90 hover:scale-105 shadow-lg"
          title="Back to previous page"
        >
          <ArrowLeft size={18} />
        </button>

        <img
          src={artist.banner || artist.image}
          alt={artist.name}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />

        <div
          className={`
            absolute inset-0 bg-gradient-to-t
            ${
              theme === "dark"
                ? "from-[#121212] via-black/40 to-transparent"
                : "from-[#f5f2eb] via-stone-900/40 to-transparent"
            }
          `}
        />

        <div className="relative z-10 px-6 pb-6 text-white">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 size={18} fill="#ef4444" className="text-white" />
            <span>Verified Artist • {artist.language}</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl xl:text-6xl">
            {artist.name}
          </h1>

          <p className="mt-2 text-[13px] text-white/80 font-medium">
            {artist.listeners}
          </p>
        </div>
      </section>

      {/* Main Section Controls & Content */}
      <div className="px-4 pb-36 sm:pb-24 lg:px-6 lg:pb-6">
        <div className="mb-4 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.88 }}
            onClick={handlePlayAll}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30 transition hover:bg-red-400"
            title="Play artist"
          >
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFollowing((v) => !v)}
            className={`
              rounded-full border px-5 py-2 text-[13px] font-bold transition shadow-sm
              ${
                isFollowing
                  ? "bg-red-500 border-red-500 text-white"
                  : theme === "dark"
                  ? "border-white/40 text-white hover:border-white"
                  : "border-stone-300 text-stone-800 hover:border-stone-900"
              }
            `}
          >
            {isFollowing ? "Following" : "Follow"}
          </motion.button>
        </div>

        {/* Popular Tracks Section */}
        <section>
          <h2 className="mb-4 text-[20px] font-bold tracking-tight">
            Popular Songs
          </h2>

          <div className="space-y-1">
            {artistSongs.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                showAlbum={true}
              />
            ))}
          </div>
        </section>

        {/* Discography Section */}
        <section className="mt-10">
          <h2 className="mb-4 text-[20px] font-bold tracking-tight">
            Discography & Releases
          </h2>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-5">
            {discographyItems.map((item) => (
              <MusicCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
