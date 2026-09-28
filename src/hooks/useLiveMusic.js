import { useEffect, useState } from "react";
import { fetchHomeCollections, fetchFeaturedPlaylists, searchSongs } from "@/services/musicApi";
import { homeSections, playlists } from "@/data/musicData";

/**
 * Custom Hook: useLiveHome
 * Fetches dynamic live playlists and song sections based on language filter
 */
export function useLiveHome(language = "All") {
  const [sections, setSections] = useState(homeSections);
  const [featuredPlaylists, setFeaturedPlaylists] = useState(playlists);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        const [fetchedSections, fetchedPlaylists] = await Promise.all([
          fetchHomeCollections(language),
          fetchFeaturedPlaylists(language),
        ]);

        if (isMounted) {
          if (fetchedSections && fetchedSections.length > 0) {
            setSections(fetchedSections);
          }
          if (fetchedPlaylists && fetchedPlaylists.length > 0) {
            setFeaturedPlaylists(fetchedPlaylists);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("useLiveHome error:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [language]);

  return { sections, featuredPlaylists, isLoading };
}

/**
 * Helper to map language / mood keywords to high-quality Saavn search queries
 */
function getSmartSearchQuery(query, language = "All") {
  const q = (query || "").toLowerCase().trim();

  // Language keywords mapping
  const languageQueryMap = {
    english: "Global English Top Hits 2025 Billboard",
    telugu: "Telugu Top Chartbusters 2025 Tollywood",
    tamil: "Tamil Superhits 2025 Anirudh",
    hindi: "Bollywood Top Trending Hits 2025 Arijit",
    malayalam: "Mollywood Top Blockbusters 2025",
    kannada: "Sandalwood Top Chartbusters 2025",
    punjabi: "Punjabi Top Hits 2025 Chartbusters",
  };

  if (languageQueryMap[q]) {
    return languageQueryMap[q];
  }

  // Mood / Genre keywords mapping
  const moodMap = {
    romantic: `${language !== "All" ? language : "Bollywood"} romantic love melodies`,
    love: `${language !== "All" ? language : "Bollywood"} romantic love songs`,
    sad: `${language !== "All" ? language : "Bollywood"} sad heartbreak songs`,
    heartbreak: `${language !== "All" ? language : "Bollywood"} emotional sad songs`,
    workout: `${language !== "All" ? language : "English"} workout gym motivation energy`,
    gym: `${language !== "All" ? language : "English"} gym workout beast mode`,
    party: `${language !== "All" ? language : "Bollywood"} dance party club hits`,
    dance: `${language !== "All" ? language : "Bollywood"} dance party hits`,
    trending: `${language !== "All" ? language : "Indian"} top trending chartbusters`,
    popular: `${language !== "All" ? language : "Indian"} superhits top songs`,
  };

  if (moodMap[q]) {
    return moodMap[q];
  }

  return language !== "All" ? `${query} ${language}` : query;
}

/**
 * Custom Hook: useLiveSearch
 * Debounced real-time JioSaavn API song searching
 */
export function useLiveSearch(query, language = "All", delay = 350) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query || !query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const searchQuery = getSmartSearchQuery(query, language);
        const songs = await searchSongs(searchQuery, 1, 25);
        setResults(songs || []);
      } catch (err) {
        console.warn("useLiveSearch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [query, language, delay]);

  return { results, isSearching };
}
