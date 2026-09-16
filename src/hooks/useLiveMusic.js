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
        const searchQuery =
          language !== "All" ? `${query} ${language}` : query;
        const songs = await searchSongs(searchQuery, 1, 25);
        setResults(songs);
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
