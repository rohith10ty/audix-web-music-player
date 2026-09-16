import CryptoJS from "crypto-js";
import { homeSections, playlists, songs } from "@/data/musicData";

// In-memory cache to prevent duplicate network calls
const memoryCache = new Map();

/**
 * Utility: Decode HTML entities from JioSaavn text fields (e.g. &quot; -> ", &amp; -> &)
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return str || "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/**
 * Utility: Decrypt JioSaavn DES-ECB encrypted media URL to direct 320kbps CDN stream URL
 */
export function decryptSaavnMediaUrl(encryptedUrl) {
  if (!encryptedUrl || typeof encryptedUrl !== "string") return "";
  try {
    const key = CryptoJS.enc.Utf8.parse("38346591");
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl.trim()) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const decryptedUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedUrl || !decryptedUrl.startsWith("http")) return "";
    return decryptedUrl
      .replace("_96.mp4", "_320.mp4")
      .replace("_160.mp4", "_320.mp4");
  } catch (err) {
    console.warn("Error decrypting JioSaavn media url:", err);
    return "";
  }
}

/**
 * Normalizer: Converts raw JioSaavn API song objects into the standard Player Track structure
 */
export function formatDirectSaavnSong(raw) {
  if (!raw) return null;

  // Already formatted
  if (raw.audioUrl && raw.title && raw.image && !raw.encrypted_media_url) {
    return raw;
  }

  // Decrypt or extract audio URL (320kbps)
  let audioUrl = "";
  if (raw.encrypted_media_url) {
    audioUrl = decryptSaavnMediaUrl(raw.encrypted_media_url);
  }

  if (!audioUrl) {
    if (Array.isArray(raw.downloadUrl) && raw.downloadUrl.length > 0) {
      const sorted = [...raw.downloadUrl].reverse();
      audioUrl =
        raw.downloadUrl.find((d) => d.quality === "320kbps")?.url ||
        raw.downloadUrl.find((d) => d.quality === "160kbps")?.url ||
        sorted[0]?.url ||
        sorted[0]?.link ||
        "";
    } else if (typeof raw.downloadUrl === "string") {
      audioUrl = raw.downloadUrl;
    } else if (raw.media_preview_url) {
      audioUrl = raw.media_preview_url
        .replace("_96_p.mp4", "_320.mp4")
        .replace("_96_p.mp4", ".mp4");
    } else if (
      raw.url &&
      typeof raw.url === "string" &&
      (raw.url.endsWith(".mp3") || raw.url.endsWith(".mp4"))
    ) {
      audioUrl = raw.url;
    }
  }

  // HD Album Image: 500x500
  let image = "";
  if (typeof raw.image === "string") {
    image = raw.image
      .replace("150x150.jpg", "500x500.jpg")
      .replace("50x50.jpg", "500x500.jpg");
  } else if (Array.isArray(raw.image) && raw.image.length > 0) {
    image =
      raw.image.find((i) => i.quality === "500x500")?.url ||
      raw.image.find((i) => i.quality === "150x150")?.url ||
      raw.image[raw.image.length - 1]?.url ||
      raw.image[raw.image.length - 1]?.link ||
      "";
  }

  if (!image) {
    image =
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85";
  }

  // Artist info
  let artist = "Unknown Artist";
  if (typeof raw.primary_artists === "string" && raw.primary_artists.trim()) {
    artist = raw.primary_artists;
  } else if (typeof raw.primaryArtists === "string" && raw.primaryArtists.trim()) {
    artist = raw.primaryArtists;
  } else if (typeof raw.singers === "string" && raw.singers.trim()) {
    artist = raw.singers;
  } else if (raw.artists?.primary && Array.isArray(raw.artists.primary)) {
    artist = raw.artists.primary.map((a) => a.name).join(", ");
  } else if (typeof raw.artist === "string" && raw.artist.trim()) {
    artist = raw.artist;
  }

  // Song title / name
  const title = decodeHtmlEntities(raw.song || raw.name || raw.title || "Untitled Song");
  const albumName = decodeHtmlEntities(
    typeof raw.album === "object" ? raw.album?.name : raw.album || "Single"
  );

  // Duration
  const seconds = Number(raw.duration) || 240;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedDuration = `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;

  const lang = raw.language
    ? raw.language.charAt(0).toUpperCase() + raw.language.slice(1).toLowerCase()
    : "Telugu";

  // Additional credits and metadata
  const musicDirector = decodeHtmlEntities(
    raw.music || raw.music_director || raw.composer || raw.composers || ""
  );
  const starring = decodeHtmlEntities(raw.starring || raw.actors || raw.cast || "");
  const label = decodeHtmlEntities(
    raw.copyright_text || raw.label || raw.album_artist || raw.record_label || ""
  );

  return {
    id: String(raw.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`),
    title,
    artist: decodeHtmlEntities(artist),
    album: albumName,
    image,
    duration: formattedDuration,
    seconds,
    audioUrl,
    streamUrl: audioUrl,
    language: lang,
    genre: raw.genre || "Soundtrack",
    year: raw.year || raw.release_date || "",
    singers: decodeHtmlEntities(raw.singers || artist),
    musicDirector: musicDirector || "Audix Studio Originals",
    starring,
    label: label || "Audix Music Records",
    bitrate: "320 kbps (Lossless)",
    hasLossless: true,
    raw,
  };
}

export const formatSaavnSong = formatDirectSaavnSong;

/**
 * Search songs by query with pagination from live JioSaavn API
 */
export async function searchSongs(query, page = 1, limit = 20) {
  if (!query || !query.trim()) return [];
  const cacheKey = `search_${query.trim().toLowerCase()}_${page}_${limit}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  try {
    const url = `/saavn-api/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=${page}&n=${limit}&q=${encodeURIComponent(
      query.trim()
    )}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`JioSaavn search HTTP error: ${res.status}`);
    }
    const data = await res.json();
    const results = data?.results || data?.data?.results || [];
    if (results.length > 0) {
      const formatted = results.map(formatDirectSaavnSong).filter(Boolean);
      memoryCache.set(cacheKey, formatted);
      return formatted;
    }
  } catch (err) {
    console.warn("Direct JioSaavn search error:", err.message);
  }

  // Fallback to local mock songs matching query
  const q = query.toLowerCase().trim();
  return songs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q)
  );
}

/**
 * Fetch detailed song metadata by ID from JioSaavn API
 */
export async function fetchSongById(id) {
  if (!id) return null;

  // 1. Check local mock songs
  const localSong = songs.find((s) => String(s.id) === String(id));
  if (localSong) return localSong;

  // 2. Fetch from JioSaavn API endpoint
  try {
    const url = `/saavn-api/api.php?__call=song.getDetails&pids=${encodeURIComponent(
      id
    )}&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const rawSong =
        (data?.songs && data.songs[0]) ||
        data?.[id] ||
        (Object.values(data || {})[0]);
      if (rawSong && (rawSong.song || rawSong.name || rawSong.title)) {
        const song = formatDirectSaavnSong(rawSong);
        if (song && song.title) {
          return song;
        }
      }
    }
  } catch (e) {
    console.warn("fetchSongById error:", e);
  }

  // 3. Fallback search by ID
  try {
    const searchRes = await searchSongs(String(id), 1, 1);
    if (searchRes && searchRes.length > 0) {
      return searchRes[0];
    }
  } catch (e) {
    console.warn("searchSongs by ID error:", e);
  }

  return null;
}

/**
 * Fetch categorized live collections for Home page based on language
 */
export async function fetchHomeCollections(language = "All") {
  // Queries tailored to language
  const queries =
    language === "All"
      ? [
          {
            key: "trending",
            query: "Trending Indian Hits 2024 2025",
            title: "🔥 Top Trending Chartbusters",
          },
          {
            key: "telugu",
            query: "Latest Telugu Superhits",
            title: "🎵 Telugu Superhits & Blockbusters",
          },
          {
            key: "tamil",
            query: "Anirudh Ravichander Tamil Hits",
            title: "⚡ Tamil Energy & Beats",
          },
          {
            key: "hindi",
            query: "Arijit Singh Romantic Hindi Hits",
            title: "💖 Bollywood Romance & Melodies",
          },
          {
            key: "english",
            query: "Global English Top Hits Pop",
            title: "🌍 Global English Anthems",
          },
        ]
      : [
          {
            key: "top",
            query: `Top ${language} Trending Songs`,
            title: `🔥 Top ${language} Chartbusters`,
          },
          {
            key: "romance",
            query: `Best ${language} Love Romantic Melodies`,
            title: `💖 Romantic ${language} Melodies`,
          },
          {
            key: "party",
            query: `High Energy ${language} Dance Party Hits`,
            title: `⚡ High Energy & Dance (${language})`,
          },
          {
            key: "classics",
            query: `Golden Classic ${language} Hits`,
            title: `✨ Evergreen & Classic ${language}`,
          },
        ];

  try {
    const results = await Promise.allSettled(
      queries.map(async (q) => {
        const fetched = await searchSongs(q.query, 1, 10);
        return {
          title: q.title,
          language,
          items: (fetched.length > 0 ? fetched : songs.slice(0, 6)).map(
            (track) => ({
              id: track.id,
              title: track.title,
              subtitle: `${track.artist} • ${track.album}`,
              image: track.image,
              type: "song",
              track,
            })
          ),
        };
      })
    );

    const validSections = results
      .filter((r) => r.status === "fulfilled" && r.value?.items?.length > 0)
      .map((r) => r.value);

    if (validSections.length > 0) {
      return validSections;
    }
  } catch (err) {
    console.warn("Error fetching home collections, using fallback:", err);
  }

  return homeSections;
}

/**
 * Featured playlist themes
 */
export const LIVE_PLAYLIST_THEMES = [
  {
    id: "live-telugu",
    title: "Telugu Superhits 2024",
    query: "Telugu Trending 2024",
    owner: "Audix Live",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=85",
    description: "Top Telugu chartbusters and superhit soundtracks.",
  },
  {
    id: "live-tamil",
    title: "Tamil Hot Hits",
    query: "Latest Tamil Hits",
    owner: "Audix Originals",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=700&q=85",
    description: "Electrifying Tamil dance beats and mass melodies.",
  },
  {
    id: "live-hindi",
    title: "Bollywood Romance Mix",
    query: "Romantic Hindi Arijit",
    owner: "Audix India",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=85",
    description: "Soulful Hindi love songs and Bollywood melodies.",
  },
  {
    id: "live-global",
    title: "Global English Top 50",
    query: "Global English Pop Hits",
    owner: "Audix Global",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
    description: "International pop anthems and billboard favorites.",
  },
  {
    id: "live-party",
    title: "Dance Party Masala",
    query: "South Indian Party Beats",
    owner: "DJ Mix",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=85",
    description: "High-voltage dance and festival bangers.",
  },
  {
    id: "live-acoustic",
    title: "Acoustic Chill Vibes",
    query: "Acoustic Melody Songs",
    owner: "Lo-Fi Beats",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=85",
    description: "Calm melodies, soft acoustics, and relaxed rhythms.",
  },
];

/**
 * Fetch dynamic featured playlists
 */
export async function fetchFeaturedPlaylists(language = "All") {
  if (language === "All") {
    try {
      const livePlaylists = await Promise.all(
        LIVE_PLAYLIST_THEMES.map(async (pt) => {
          const tracks = await searchSongs(pt.query, 1, 8);
          return {
            id: pt.id,
            title: pt.title,
            description: pt.description,
            owner: pt.owner,
            image: pt.image,
            tracks:
              tracks.length > 0
                ? tracks
                : songs
                    .filter((s) =>
                      pt.id === "live-telugu"
                        ? s.language === "Telugu"
                        : pt.id === "live-tamil"
                        ? s.language === "Tamil"
                        : pt.id === "live-hindi"
                        ? s.language === "Hindi"
                        : pt.id === "live-global"
                        ? s.language === "English"
                        : true
                    )
                    .slice(0, 8),
            language: "All",
          };
        })
      );
      return livePlaylists;
    } catch (e) {
      console.warn("Featured playlists fallback:", e);
    }
  }

  return playlists;
}
