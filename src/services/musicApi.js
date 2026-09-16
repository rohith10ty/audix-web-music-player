import { formatSaavnSong, API_BASE_URL } from "@/context/AudioContext";
import { homeSections, playlists, songs } from "@/data/musicData";

// Cache to prevent duplicate network calls
const memoryCache = new Map();

/**
 * Generic fetcher with caching and error handling
 */
async function fetchFromApi(endpoint) {
  if (memoryCache.has(endpoint)) {
    return memoryCache.get(endpoint);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    memoryCache.set(endpoint, data);
    return data;
  } catch (err) {
    console.warn(`Fetch error for ${endpoint}:`, err.message);
    return null;
  }
}

/**
 * Search songs by query with pagination
 */
export async function searchSongs(query, page = 1, limit = 20) {
  if (!query || !query.trim()) return [];
  const endpoint = `/search/songs?query=${encodeURIComponent(query.trim())}&page=${page}&limit=${limit}`;
  const data = await fetchFromApi(endpoint);

  const results = data?.data?.results || data?.results || [];
  if (results.length > 0) {
    return results.map(formatSaavnSong).filter(Boolean);
  }

  // Fallback to local mock songs matching query
  const q = query.toLowerCase().trim();
  return songs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q),
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
    const data = await fetchFromApi(`/songs?id=${encodeURIComponent(id)}`) || await fetchFromApi(`/songs/${encodeURIComponent(id)}`);
    const results = Array.isArray(data?.data) ? data.data : (data?.data?.results || (data?.data ? [data.data] : []));
    if (results.length > 0) {
      const song = formatSaavnSong(results[0]);
      if (song && song.title && song.title !== "Favorited Song") {
        return song;
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
  const langKey = language.toLowerCase();

  // Queries tailored to language
  const queries =
    language === "All"
      ? [
          { key: "trending", query: "Trending Indian Hits 2024", title: "🔥 Top Trending Chartbusters" },
          { key: "telugu", query: "Latest Telugu Superhits", title: "🎵 Telugu Superhits & Blockbusters" },
          { key: "tamil", query: "Anirudh Ravichander Tamil Hits", title: "⚡ Tamil Energy & Beats" },
          { key: "hindi", query: "Arijit Singh Romantic Hindi Hits", title: "💖 Bollywood Romance & Melodies" },
          { key: "english", query: "Global English Top Hits Pop", title: "🌍 Global English Anthems" },
        ]
      : [
          { key: "top", query: `Top ${language} Trending Songs 2024`, title: `🔥 Top ${language} Chartbusters` },
          { key: "romance", query: `Best ${language} Love Romantic Melodies`, title: `💖 Romantic ${language} Melodies` },
          { key: "party", query: `High Energy ${language} Dance Party Hits`, title: `⚡ High Energy & Dance (${language})` },
          { key: "classics", query: `Golden Classic ${language} Hits`, title: `✨ Evergeen & Classic ${language}` },
        ];

  try {
    const results = await Promise.allSettled(
      queries.map(async (q) => {
        const fetched = await searchSongs(q.query, 1, 10);
        return {
          title: q.title,
          language,
          items: (fetched.length > 0 ? fetched : songs.slice(0, 6)).map((track) => ({
            id: track.id,
            title: track.title,
            subtitle: `${track.artist} • ${track.album}`,
            image: track.image,
            type: "song",
            track,
          })),
        };
      }),
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
 * Fetch dynamic featured playlists
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
                        : true,
                    )
                    .slice(0, 8),
            language: "All",
          };
        }),
      );
      return livePlaylists;
    } catch (e) {
      console.warn("Featured playlists fallback:", e);
    }
  }

  return playlists;
}
