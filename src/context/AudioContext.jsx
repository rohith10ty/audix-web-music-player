import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultTrack, playlists, songs } from "@/data/musicData";
import {
  LIVE_PLAYLIST_THEMES,
  formatDirectSaavnSong,
  formatSaavnSong,
  searchSongs,
  fetchSongById,
  decryptSaavnMediaUrl,
  decodeHtmlEntities,
} from "@/services/musicApi";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "@/lib/firebase";

export const AudioContext = createContext(null);

export const API_BASE_URL = "/saavn-api";

export {
  formatDirectSaavnSong,
  formatSaavnSong,
  searchSongs,
  fetchSongById,
  decryptSaavnMediaUrl,
};

/**
 * Async API Helper: Fetch search songs from JioSaavn API
 */
export async function fetchSearchSongs(query, page = 1, limit = 20) {
  return searchSongs(query, page, limit);
}

/**
 * Async API Helper: Fetch single song details by ID from JioSaavn API
 */
export async function resolveSongDetails(id) {
  return fetchSongById(id);
}

/**
 * Global Audio Provider Component
 */
export function AudioProvider({ children }) {
  // Persistent HTML5 Audio Instance
  const audioRef = useRef(null);

  // Player States (Initially null until user starts playback)
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100 percentage
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [duration, setDuration] = useState(240); // in seconds
  const [volume, setVolume] = useState(80); // 0 to 100
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(80);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'all' | 'one'
  const [userQueue, setUserQueue] = useState([]); // User manually added queue
  const [contextQueue, setContextQueue] = useState([]); // Active playlist/album context queue
  const [contextName, setContextName] = useState("Audix Hits");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [audioError, setAudioError] = useState(null);

  // References to keep event listeners and MediaSession handlers fresh without recreation
  const playNextRef = useRef(null);
  const playPreviousRef = useRef(null);
  const repeatModeRef = useRef(repeatMode);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Combined activeQueue for components reading queue
  const activeQueue = useMemo(() => {
    return [currentTrack, ...(userQueue || [])].filter(Boolean);
  }, [currentTrack, userQueue]);

  // Initialize and attach native HTML5 Audio element listeners
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "auto";
    audio.volume = volume / 100;

    // Time update listener: Updates exact seek percentage and elapsed seconds
    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        const cur = audio.currentTime;
        const dur = audio.duration;
        setCurrentTime(cur);
        setDuration(dur);
        setProgress((cur / dur) * 100);
      }
    };

    // Loaded metadata listener: sync duration
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
      setAudioError(null);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setAudioError(null);
    };
    const handlePause = () => setIsPlaying(false);

    // Song ended listener: Auto-play next or repeat
    const handleEnded = () => {
      if (repeatModeRef.current === "one") {
        audio.currentTime = 0;
        audio.play().catch((err) => console.error("Repeat play error:", err));
      } else if (playNextRef.current) {
        playNextRef.current();
      }
    };

    // Error listener
    const handleError = (e) => {
      console.warn("HTML5 Audio playback error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      if (audio.src && audio.src !== "about:blank" && !audio.src.endsWith("/")) {
        setAudioError("Audio playback error. Stream may be unavailable or CORS restricted.");
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Local Storage Helpers for instant 0ms persistence and offline reliability
  const STORAGE_KEYS = {
    ACTIVE_UID: "audix_active_uid",
    LIKED_PREFIX: "audix_liked_songs_",
    PLAYLISTS_PREFIX: "audix_custom_playlists_",
    PROFILE_PREFIX: "audix_user_profile_",
  };

  const getLocalLikedSongs = (uid) => {
    try {
      const key = STORAGE_KEYS.LIKED_PREFIX + (uid || "guest");
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveLocalLikedSongs = (uid, songsList) => {
    try {
      const key = STORAGE_KEYS.LIKED_PREFIX + (uid || "guest");
      localStorage.setItem(key, JSON.stringify(songsList));
    } catch (e) {}
  };

  const getLocalCustomPlaylists = (uid) => {
    try {
      const key = STORAGE_KEYS.PLAYLISTS_PREFIX + (uid || "guest");
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveLocalCustomPlaylists = (uid, playlistsList) => {
    try {
      const key = STORAGE_KEYS.PLAYLISTS_PREFIX + (uid || "guest");
      localStorage.setItem(key, JSON.stringify(playlistsList));
    } catch (e) {}
  };

  const getLocalProfile = (uid) => {
    try {
      const key = STORAGE_KEYS.PROFILE_PREFIX + (uid || "guest");
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const saveLocalProfile = (uid, profileData) => {
    try {
      const key = STORAGE_KEYS.PROFILE_PREFIX + (uid || "guest");
      localStorage.setItem(key, JSON.stringify(profileData));
    } catch (e) {}
  };

  // Initial UID from previous session if available
  const initialUid = (() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_UID) || "guest";
    } catch (e) {
      return "guest";
    }
  })();

  // Liked Songs and Custom Playlists in State (Synchronously read from local cache on mount)
  const [likedSongs, setLikedSongs] = useState(() => getLocalLikedSongs(initialUid));
  const [customPlaylists, setCustomPlaylists] = useState(() => getLocalCustomPlaylists(initialUid));

  const likedSongIds = useMemo(() => {
    return (likedSongs || []).map((s) => String(s.id));
  }, [likedSongs]);

  // User Profile and Firebase Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(auth.currentUser || (initialUid && initialUid !== "guest")));
  const [currentUser, setCurrentUser] = useState(() => auth.currentUser || null);
  const [authLoading, setAuthLoading] = useState(true);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = getLocalProfile(initialUid);
    if (saved) return saved;
    return {
      name: "Music Lover",
      email: "",
      handle: "@listener",
      avatar: "",
      plan: "Audix Free",
      playlistsCount: 0,
      followingCount: 0,
      followersCount: 0,
      audioQuality: "Standard (160 kbps)",
      preferredLanguage: "All",
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' | 'signup'
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const openCreatePlaylistModal = useCallback(() => {
    if (!auth.currentUser) {
      openAuthModal("signup");
      return;
    }
    setIsCreatePlaylistOpen(true);
  }, [openAuthModal]);

  const closeCreatePlaylistModal = useCallback(() => {
    setIsCreatePlaylistOpen(false);
  }, []);

  // Sync state to Firestore in cloud & local storage
  const syncLikedSongsToFirestore = useCallback(async (newSongs) => {
    const uid = auth.currentUser?.uid || localStorage.getItem(STORAGE_KEYS.ACTIVE_UID);
    if (!uid) return;
    saveLocalLikedSongs(uid, newSongs);
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { likedSongs: newSongs }, { merge: true });
    } catch (e) {
      console.warn("Firestore sync liked songs error:", e);
    }
  }, []);

  const syncPlaylistsToFirestore = useCallback(async (newPlaylists) => {
    const uid = auth.currentUser?.uid || localStorage.getItem(STORAGE_KEYS.ACTIVE_UID);
    if (!uid) return;
    saveLocalCustomPlaylists(uid, newPlaylists);
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { customPlaylists: newPlaylists }, { merge: true });
    } catch (e) {
      console.warn("Firestore sync playlists error:", e);
    }
  }, []);

  // Listen for Firebase Auth State Changes & live Firestore real-time onSnapshot
  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, firebaseUser.uid);

        const emailPrefix = firebaseUser.email ? firebaseUser.email.split("@")[0] : "Music Lover";
        const initialDisplayName = firebaseUser.displayName || emailPrefix;

        // 1. Immediately hydrate from local storage (0ms latency, zero empty state flash)
        const cachedLiked = getLocalLikedSongs(firebaseUser.uid);
        const cachedPlaylists = getLocalCustomPlaylists(firebaseUser.uid);
        const cachedProfile = getLocalProfile(firebaseUser.uid);

        if (cachedLiked.length > 0) setLikedSongs(cachedLiked);
        if (cachedPlaylists.length > 0) setCustomPlaylists(cachedPlaylists);

        // Immediate responsive profile state (avatar is empty by default unless user uploaded one)
        const initialProfile = {
          uid: firebaseUser.uid,
          name: cachedProfile?.name || initialDisplayName,
          email: firebaseUser.email || cachedProfile?.email || "",
          handle: `@${(cachedProfile?.name || initialDisplayName).toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          avatar: cachedProfile?.avatar || "",
          plan: "Audix Free",
          playlistsCount: cachedPlaylists.length,
          followingCount: 0,
          followersCount: 0,
          audioQuality: cachedProfile?.audioQuality || "Very High (320 kbps)",
          preferredLanguage: "All",
        };
        setUserProfile(initialProfile);
        saveLocalProfile(firebaseUser.uid, initialProfile);

        // 2. Set up real-time live listener from Firestore for multi-device sync
        const userRef = doc(db, "users", firebaseUser.uid);

        // Immediate write to Firestore if Device has local playlists, liked songs, or avatar
        if (cachedPlaylists.length > 0 || cachedLiked.length > 0 || cachedProfile?.avatar) {
          const syncDoc = {
            uid: firebaseUser.uid,
            name: cachedProfile?.name || initialDisplayName,
            email: firebaseUser.email || "",
            avatar: cachedProfile?.avatar || "",
            likedSongs: cachedLiked,
            customPlaylists: cachedPlaylists,
            updatedAt: new Date().toISOString(),
          };
          setDoc(userRef, syncDoc, { merge: true }).catch((err) => {
            console.warn("Immediate cloud sync error:", err);
          });
        }

        try {
          unsubscribeSnapshot = onSnapshot(
            userRef,
            async (docSnap) => {
              if (docSnap.exists()) {
                const cloudData = docSnap.data() || {};

                // Update liked songs: If cloud has songs, use cloud. If cloud is empty but local has items, upload local to cloud!
                if (Array.isArray(cloudData.likedSongs) && cloudData.likedSongs.length > 0) {
                  setLikedSongs(cloudData.likedSongs);
                  saveLocalLikedSongs(firebaseUser.uid, cloudData.likedSongs);
                } else if (cachedLiked.length > 0) {
                  setLikedSongs(cachedLiked);
                  syncLikedSongsToFirestore(cachedLiked);
                } else if (Array.isArray(cloudData.likedSongs)) {
                  setLikedSongs([]);
                  saveLocalLikedSongs(firebaseUser.uid, []);
                }

                // Update custom playlists: If cloud has playlists, use cloud. If cloud is empty but local has items, upload local to cloud!
                if (Array.isArray(cloudData.customPlaylists) && cloudData.customPlaylists.length > 0) {
                  setCustomPlaylists(cloudData.customPlaylists);
                  saveLocalCustomPlaylists(firebaseUser.uid, cloudData.customPlaylists);
                } else if (cachedPlaylists.length > 0) {
                  setCustomPlaylists(cachedPlaylists);
                  syncPlaylistsToFirestore(cachedPlaylists);
                } else if (Array.isArray(cloudData.customPlaylists)) {
                  setCustomPlaylists([]);
                  saveLocalCustomPlaylists(firebaseUser.uid, []);
                }

                // Update Profile info: Only use explicitly uploaded avatar
                const emailName = firebaseUser.email ? firebaseUser.email.split("@")[0] : "Music Lover";
                const resolvedName =
                  cloudData.name ||
                  cachedProfile?.name ||
                  firebaseUser.displayName ||
                  emailName;
                const resolvedAvatar =
                  cloudData.avatar || cachedProfile?.avatar || "";
                const resolvedEmail =
                  cloudData.email || firebaseUser.email || cachedProfile?.email || "";

                if (!cloudData.avatar && cachedProfile?.avatar) {
                  // Upload local avatar to cloud if missing in cloud
                  try {
                    setDoc(userRef, { avatar: cachedProfile.avatar, name: resolvedName, email: resolvedEmail }, { merge: true });
                  } catch (e) {}
                }

                const profile = {
                  uid: firebaseUser.uid,
                  name: resolvedName,
                  email: resolvedEmail,
                  handle: `@${resolvedName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
                  avatar: resolvedAvatar,
                  plan: "Audix Free",
                  playlistsCount: Array.isArray(cloudData.customPlaylists)
                    ? cloudData.customPlaylists.length
                    : cachedPlaylists.length,
                  followingCount: 0,
                  followersCount: 0,
                  audioQuality: cloudData.audioQuality || "Very High (320 kbps)",
                  preferredLanguage: "All",
                };
                setUserProfile(profile);
                saveLocalProfile(firebaseUser.uid, profile);
              } else {
                // Create user document in Firestore if not existing yet
                const localLiked = getLocalLikedSongs(firebaseUser.uid);
                const localPlaylists = getLocalCustomPlaylists(firebaseUser.uid);
                const localProf = getLocalProfile(firebaseUser.uid);

                const emailName = firebaseUser.email ? firebaseUser.email.split("@")[0] : "Music Lover";
                const initialName =
                  localProf?.name ||
                  firebaseUser.displayName ||
                  emailName;

                const newCloudDoc = {
                  uid: firebaseUser.uid,
                  name: initialName,
                  email: firebaseUser.email || "",
                  avatar: localProf?.avatar || "",
                  likedSongs: localLiked,
                  customPlaylists: localPlaylists,
                  createdAt: new Date().toISOString(),
                };

                try {
                  await setDoc(userRef, newCloudDoc, { merge: true });
                } catch (err) {
                  console.warn("Initial Firestore user creation error:", err);
                }
              }
              setAuthLoading(false);
            },
            (err) => {
              console.warn("Firestore snapshot listener error:", err);
              setAuthLoading(false);
            },
          );
        } catch (err) {
          console.warn("Error setting onSnapshot listener:", err);
          setAuthLoading(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, "guest");
        setUserProfile({
          name: "Guest Listener",
          email: "",
          handle: "@guest",
          avatar: "",
          plan: "Audix Free",
          playlistsCount: 0,
          followingCount: 0,
          followersCount: 0,
          audioQuality: "Standard (160 kbps)",
          preferredLanguage: "All",
        });
        setLikedSongs([]);
        setCustomPlaylists([]);
        setAuthLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  // Real Firebase Auth Actions
  const loginWithEmail = useCallback(async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (res.user) {
      const user = res.user;
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, user.uid);

      const emailPrefix = user.email ? user.email.split("@")[0] : "Music Lover";
      const resolvedName = user.displayName || emailPrefix;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      let profileData;
      if (snap.exists()) {
        const cloudData = snap.data() || {};
        profileData = {
          uid: user.uid,
          name: cloudData.name || resolvedName,
          email: user.email || cloudData.email || "",
          handle: `@${(cloudData.name || resolvedName).toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          avatar: cloudData.avatar || "",
          plan: "Audix Free",
          playlistsCount: Array.isArray(cloudData.customPlaylists) ? cloudData.customPlaylists.length : 0,
          followingCount: 0,
          followersCount: 0,
          audioQuality: cloudData.audioQuality || "Very High (320 kbps)",
          preferredLanguage: "All",
        };
        if (Array.isArray(cloudData.likedSongs)) {
          setLikedSongs(cloudData.likedSongs);
          saveLocalLikedSongs(user.uid, cloudData.likedSongs);
        }
        if (Array.isArray(cloudData.customPlaylists)) {
          setCustomPlaylists(cloudData.customPlaylists);
          saveLocalCustomPlaylists(user.uid, cloudData.customPlaylists);
        }
      } else {
        profileData = {
          uid: user.uid,
          name: resolvedName,
          email: user.email || "",
          handle: `@${resolvedName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          avatar: "",
          plan: "Audix Free",
          playlistsCount: 0,
          followingCount: 0,
          followersCount: 0,
          audioQuality: "Very High (320 kbps)",
          preferredLanguage: "All",
        };
      }
      setUserProfile(profileData);
      saveLocalProfile(user.uid, profileData);
    }
    return res.user;
  }, []);

  const signUpWithEmail = useCallback(async (name, email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const trimmedName = name && name.trim() ? name.trim() : (email.split("@")[0] || "Music Lover");

    try {
      await updateProfile(res.user, {
        displayName: trimmedName,
      });
    } catch (e) {
      console.warn("updateProfile error:", e);
    }

    const userDocData = {
      uid: res.user.uid,
      name: trimmedName,
      email: email.trim(),
      handle: `@${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      avatar: "",
      likedSongs: [],
      customPlaylists: [],
      plan: "Audix Free",
      playlistsCount: 0,
      followingCount: 0,
      followersCount: 0,
      audioQuality: "Very High (320 kbps)",
      preferredLanguage: "All",
      createdAt: new Date().toISOString(),
    };

    try {
      const userRef = doc(db, "users", res.user.uid);
      await setDoc(userRef, userDocData, { merge: true });
    } catch (e) {
      console.warn("Firestore profile creation error:", e);
    }

    setCurrentUser(res.user);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, res.user.uid);
    setUserProfile(userDocData);
    saveLocalProfile(res.user.uid, userDocData);
    setLikedSongs([]);
    setCustomPlaylists([]);

    return res.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      const user = res.user;
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, user.uid);

      const emailPrefix = user.email ? user.email.split("@")[0] : "Music Lover";
      const resolvedName = user.displayName || emailPrefix;
      const cachedProfile = getLocalProfile(user.uid);

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      let profileData;
      if (snap.exists()) {
        const cloudData = snap.data() || {};
        profileData = {
          uid: user.uid,
          name: cloudData.name || resolvedName,
          email: user.email || cloudData.email || "",
          handle: `@${(cloudData.name || resolvedName).toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          avatar: cloudData.avatar || cachedProfile?.avatar || "",
          plan: "Audix Free",
          playlistsCount: Array.isArray(cloudData.customPlaylists) ? cloudData.customPlaylists.length : 0,
          followingCount: 0,
          followersCount: 0,
          audioQuality: cloudData.audioQuality || "Very High (320 kbps)",
          preferredLanguage: "All",
        };
        if (Array.isArray(cloudData.likedSongs)) {
          setLikedSongs(cloudData.likedSongs);
          saveLocalLikedSongs(user.uid, cloudData.likedSongs);
        }
        if (Array.isArray(cloudData.customPlaylists)) {
          setCustomPlaylists(cloudData.customPlaylists);
          saveLocalCustomPlaylists(user.uid, cloudData.customPlaylists);
        }
      } else {
        profileData = {
          uid: user.uid,
          name: resolvedName,
          email: user.email || "",
          handle: `@${resolvedName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          avatar: cachedProfile?.avatar || "",
          likedSongs: [],
          customPlaylists: [],
          plan: "Audix Free",
          playlistsCount: 0,
          followingCount: 0,
          followersCount: 0,
          audioQuality: "Very High (320 kbps)",
          preferredLanguage: "All",
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, profileData, { merge: true });
      }
      setUserProfile(profileData);
      saveLocalProfile(user.uid, profileData);
    }
    return res.user;
  }, []);

  const logoutUser = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_UID);
    await signOut(auth);
  }, []);

  // Update user profile picture (synced to LocalStorage, Firestore & Auth)
  const updateUserAvatar = useCallback(async (base64Avatar) => {
    const uid = auth.currentUser?.uid || localStorage.getItem(STORAGE_KEYS.ACTIVE_UID);
    if (!uid) return;
    try {
      setUserProfile((prev) => {
        const updated = { ...prev, avatar: base64Avatar || "" };
        saveLocalProfile(uid, updated);
        return updated;
      });
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { avatar: base64Avatar || "" }, { merge: true });
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { photoURL: base64Avatar || "" });
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Update avatar error:", err);
      throw err;
    }
  }, []);

  // Remove user profile picture
  const removeUserAvatar = useCallback(async () => {
    await updateUserAvatar("");
  }, [updateUserAvatar]);

  // Update user display name (synced to LocalStorage, Firestore & Auth)
  const updateUserName = useCallback(async (newName) => {
    const uid = auth.currentUser?.uid || localStorage.getItem(STORAGE_KEYS.ACTIVE_UID);
    if (!uid || !newName?.trim()) return;
    const trimmed = newName.trim();
    try {
      setUserProfile((prev) => {
        const updated = {
          ...prev,
          name: trimmed,
          handle: `@${trimmed.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        };
        saveLocalProfile(uid, updated);
        return updated;
      });
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { name: trimmed }, { merge: true });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmed });
      }
    } catch (err) {
      console.warn("Update user name error:", err);
      throw err;
    }
  }, []);

  // Change user password
  const changeUserPassword = useCallback(async (newPassword) => {
    if (!auth.currentUser) throw new Error("Please log in to change password.");
    await updatePassword(auth.currentUser, newPassword);
  }, []);

  // Send password reset email
  const sendPasswordReset = useCallback(async (email) => {
    const target = email || auth.currentUser?.email;
    if (!target) throw new Error("Email is required for password reset.");
    await sendPasswordResetEmail(auth, target.trim());
  }, []);

  /**
   * Core Playback Action: Play a specific track with optional custom queue & source context
   */
  const playTrack = useCallback(
    async (rawTrack, queue = null, sourceTitle = null, updateContext = true) => {
      if (!rawTrack) return;
      let track = formatSaavnSong(rawTrack);
      const audio = audioRef.current;

      setCurrentTrack(track);
      setAudioError(null);
      setProgress(0);
      setCurrentTime(0);

      // 1. If explicit queue list is provided (e.g. from Playlist, Album, Liked Songs, Search)
      if (queue && Array.isArray(queue) && queue.length > 0) {
        const formattedQueue = queue.map(formatSaavnSong).filter(Boolean);
        setContextQueue(formattedQueue);
        if (sourceTitle) {
          setContextName(sourceTitle);
        }
      } else if (updateContext) {
        // If single song is played, ensure it is part of contextQueue without wiping everything
        setContextQueue((prev) => {
          const exists = (prev || []).some((t) => String(t.id) === String(track.id));
          if (exists) return prev;
          return [track, ...(prev || [])];
        });
        if (sourceTitle) {
          setContextName(sourceTitle);
        }
      }

      let streamUrl = track.audioUrl || track.streamUrl || track.url || "";

      // If track does not have a live streaming URL, dynamically fetch from JioSaavn API!
      if (!streamUrl) {
        setIsLoading(true);
        try {
          const liveQuery = `${track.title} ${track.artist || ""}`.trim();
          const searchResults = await fetchSearchSongs(liveQuery, 1, 1);
          if (searchResults && searchResults.length > 0 && searchResults[0].audioUrl) {
            streamUrl = searchResults[0].audioUrl;
            track = {
              ...track,
              audioUrl: streamUrl,
              streamUrl: streamUrl,
              image: searchResults[0].image || track.image,
              duration: searchResults[0].duration || track.duration,
              seconds: searchResults[0].seconds || track.seconds,
            };
            setCurrentTrack(track);
          }
        } catch (e) {
          console.warn("Failed to auto-resolve live stream URL:", e);
        }
      }

      // If backend is offline, provide smooth audio stream fallback
      if (!streamUrl) {
        streamUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        track = {
          ...track,
          audioUrl: streamUrl,
          streamUrl: streamUrl,
        };
      }

      if (audio) {
        audio.src = streamUrl;
        setIsLoading(true);
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch((err) => {
              console.warn("Autoplay / stream play warning:", err);
              setIsLoading(false);
              setIsPlaying(true);
            });
        }
      }
    },
    [],
  );

  /**
   * Add a song to the user's manual queue (Next In Queue)
   */
  const addToQueue = useCallback((rawTrack) => {
    if (!rawTrack) return false;
    const track = formatSaavnSong(rawTrack);
    setUserQueue((prev) => [...prev, track]);
    return true;
  }, []);

  /**
   * Add a song to play immediately next (Top of manual queue)
   */
  const playNextInQueue = useCallback((rawTrack) => {
    if (!rawTrack) return false;
    const track = formatSaavnSong(rawTrack);
    setUserQueue((prev) => [track, ...prev]);
    return true;
  }, []);

  /**
   * Remove a specific song from the user manual queue by index
   */
  const removeFromUserQueue = useCallback((index) => {
    setUserQueue((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  /**
   * Remove a song from the active context queue
   */
  const removeFromContextQueue = useCallback((trackId) => {
    setContextQueue((prev) => prev.filter((t) => String(t.id) !== String(trackId)));
  }, []);

  /**
   * Clear all user-added queue songs
   */
  const clearUserQueue = useCallback(() => {
    setUserQueue([]);
  }, []);

  /**
   * Clear all queues (resets to current track only)
   */
  const clearQueue = useCallback(() => {
    setUserQueue([]);
    setContextQueue(currentTrack ? [currentTrack] : []);
  }, [currentTrack]);

  /**
   * Toggle Play / Pause
   */
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      // If no track is currently selected, start playing the first trending song
      const trackToPlay = songs && songs.length > 0 ? songs[0] : null;
      if (trackToPlay) {
        playTrack(trackToPlay, songs, "Audix Hits", false);
      }
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      let srcToPlay = audio.src;
      if (!srcToPlay || srcToPlay === "about:blank" || srcToPlay.endsWith("/")) {
        srcToPlay =
          currentTrack.audioUrl ||
          currentTrack.streamUrl ||
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        audio.src = srcToPlay;
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("Playback resume error:", err);
            setIsPlaying(true);
          });
      } else {
        setIsPlaying(true);
      }
    }
  }, [isPlaying, currentTrack, playTrack]);

  /**
   * Seek by percentage (0 - 100)
   */
  const seekProgress = useCallback((percentage) => {
    const audio = audioRef.current;
    const p = Math.max(0, Math.min(100, Number(percentage)));
    setProgress(p);

    if (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      const targetTime = (p / 100) * audio.duration;
      audio.currentTime = targetTime;
      setCurrentTime(targetTime);
    } else if (currentTrack?.seconds) {
      setCurrentTime((p / 100) * currentTrack.seconds);
    }
  }, [currentTrack]);

  /**
   * Seek by direct seconds
   */
  const seekTime = useCallback((seconds) => {
    const audio = audioRef.current;
    const sec = Math.max(0, Number(seconds));
    setCurrentTime(sec);

    if (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.min(sec, audio.duration);
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  }, []);

  /**
   * Volume control (0 - 100)
   */
  const handleVolumeChange = useCallback((newVol) => {
    const audio = audioRef.current;
    const val = Math.max(0, Math.min(100, Number(newVol)));
    setVolume(val);

    if (audio) {
      audio.volume = val / 100;
      if (val > 0 && isMuted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  /**
   * Mute / Unmute
   */
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (isMuted) {
      setIsMuted(false);
      if (audio) {
        audio.muted = false;
        audio.volume = prevVolume / 100;
      }
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      if (audio) {
        audio.muted = true;
        audio.volume = 0;
      }
    }
  }, [isMuted, volume, prevVolume]);

  /**
   * Toggle Repeat: 'off' -> 'all' -> 'one'
   */
  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  /**
   * Next Song: Prioritizes userQueue first, then continues with contextQueue
   */
  const playNext = useCallback(() => {
    // 1. If user has manually queued songs in userQueue, play the first one and shift
    if (userQueue && userQueue.length > 0) {
      const nextUserSong = userQueue[0];
      setUserQueue((prev) => prev.slice(1));
      playTrack(nextUserSong, null, null, false);
      return;
    }

    // 2. Play next song in active playlist / context queue
    if (contextQueue && contextQueue.length > 0) {
      if (shuffle) {
        const pool = currentTrack ? contextQueue.filter((t) => String(t.id) !== String(currentTrack.id)) : contextQueue;
        const finalPool = pool.length > 0 ? pool : contextQueue;
        const randomIndex = Math.floor(Math.random() * finalPool.length);
        playTrack(finalPool[randomIndex], null, null, false);
      } else {
        const curIdx = currentTrack ? contextQueue.findIndex((t) => String(t.id) === String(currentTrack.id)) : -1;
        if (curIdx >= 0 && curIdx + 1 < contextQueue.length) {
          playTrack(contextQueue[curIdx + 1], null, null, false);
        } else if (repeatMode === "all" || curIdx === -1) {
          playTrack(contextQueue[0], null, null, false);
        }
      }
    } else if (songs && songs.length > 0) {
      const curIdx = currentTrack ? songs.findIndex((t) => String(t.id) === String(currentTrack.id)) : -1;
      const nextSong = songs[(curIdx + 1) % songs.length];
      playTrack(nextSong, songs, "Audix Hits", false);
    }
  }, [userQueue, contextQueue, currentTrack, shuffle, repeatMode, playTrack]);

  /**
   * Previous Song
   */
  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (contextQueue && contextQueue.length > 0) {
      const curIdx = currentTrack ? contextQueue.findIndex((t) => String(t.id) === String(currentTrack.id)) : -1;
      if (curIdx > 0) {
        playTrack(contextQueue[curIdx - 1], null, null, false);
      } else if (repeatMode === "all") {
        playTrack(contextQueue[contextQueue.length - 1], null, null, false);
      } else if (contextQueue.length > 0) {
        playTrack(contextQueue[0], null, null, false);
      }
    } else if (songs && songs.length > 0) {
      const curIdx = currentTrack ? songs.findIndex((t) => String(t.id) === String(currentTrack.id)) : 0;
      const prevSong = songs[(curIdx - 1 + songs.length) % songs.length];
      playTrack(prevSong, songs, "Audix Hits", false);
    }
  }, [contextQueue, currentTrack, repeatMode, playTrack]);

  // Keep playNextRef and playPreviousRef synced for event listeners and MediaSession handlers
  useEffect(() => {
    playNextRef.current = playNext;
    playPreviousRef.current = playPrevious;
  }, [playNext, playPrevious]);

  /* =========================================================================
     WEB MEDIA SESSION API (Android/iOS Notification Panel & Lockscreen Controls)
     - Enables Title, Artist, HD Album Artwork
     - Enables Previous / Next track buttons (Forward & Backward)
     - Enables Notification Scrubber Seek
  ========================================================================= */
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (currentTrack) {
      const artworkList = [];
      if (currentTrack.image) {
        artworkList.push(
          { src: currentTrack.image, sizes: "96x96", type: "image/jpeg" },
          { src: currentTrack.image, sizes: "128x128", type: "image/jpeg" },
          { src: currentTrack.image, sizes: "192x192", type: "image/jpeg" },
          { src: currentTrack.image, sizes: "256x256", type: "image/jpeg" },
          { src: currentTrack.image, sizes: "512x512", type: "image/jpeg" }
        );
      }
      artworkList.push({ src: "/logo.png", sizes: "512x512", type: "image/png" });

      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title || "Audix Track",
          artist: currentTrack.artist || "Audix Music",
          album: currentTrack.album || currentTrack.genre || "Audix Hits",
          artwork: artworkList,
        });
      } catch (e) {
        console.warn("MediaSession metadata error:", e);
      }
    } else {
      navigator.mediaSession.metadata = null;
    }
  }, [currentTrack]);

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    const setHandler = (action, handler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        // Ignored for browsers that do not support specific optional actions
      }
    };

    setHandler("play", () => {
      if (audioRef.current && currentTrack) {
        audioRef.current.play().catch(console.warn);
        setIsPlaying(true);
      } else if (!currentTrack && songs && songs.length > 0) {
        playTrack(songs[0], songs, "Audix Hits", false);
      }
    });

    setHandler("pause", () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    });

    // PREVIOUS TRACK (Backward button on phone notification panel)
    setHandler("previoustrack", () => {
      if (playPreviousRef.current) {
        playPreviousRef.current();
      }
    });

    // NEXT TRACK (Forward button on phone notification panel)
    setHandler("nexttrack", () => {
      if (playNextRef.current) {
        playNextRef.current();
      }
    });

    // SEEK BACKWARD 10s
    setHandler("seekbackward", (details) => {
      const skipTime = details?.seekOffset || 10;
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - skipTime);
      }
    });

    // SEEK FORWARD 10s
    setHandler("seekforward", (details) => {
      const skipTime = details?.seekOffset || 10;
      if (audioRef.current && audioRef.current.duration) {
        audioRef.current.currentTime = Math.min(
          audioRef.current.duration,
          audioRef.current.currentTime + skipTime
        );
      }
    });

    // SEEK TO POSITION
    setHandler("seekto", (details) => {
      if (audioRef.current && details?.seekTime !== null && details?.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime;
      }
    });

    // STOP
    setHandler("stop", () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    });
  }, [currentTrack, isPlaying, playTrack]);

  // Sync notification lockscreen progress scrubber
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("mediaSession" in navigator) ||
      !("setPositionState" in navigator.mediaSession)
    )
      return;

    if (audioRef.current && duration > 0 && currentTime >= 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: audioRef.current.playbackRate || 1.0,
          position: Math.min(Math.max(0, currentTime), duration),
        });
      } catch (e) {
        // Minor sync mismatch ignored
      }
    }
  }, [currentTime, duration]);

  /**
   * Like / Favorite toggling - Supports passing track object, string ID, or currentTrack
   */
  const toggleLike = useCallback(
    (trackOrId, optionalTrack = null) => {
      if (!trackOrId) return;

      // Gate for unauthenticated guests
      if (!auth.currentUser) {
        openAuthModal("signup");
        return;
      }

      const isObj = typeof trackOrId === "object" && trackOrId !== null;
      const targetId = isObj ? String(trackOrId.id) : String(trackOrId);
      let targetTrack = isObj ? trackOrId : optionalTrack;

      setLikedSongs((prev) => {
        const isAlreadyLiked = prev.some((t) => String(t.id) === targetId);
        let updated;

        if (isAlreadyLiked) {
          updated = prev.filter((t) => String(t.id) !== targetId);
        } else {
          // If track object wasn't directly passed, find it in currentTrack, activeQueue, or songs
          if (!targetTrack) {
            if (currentTrack && String(currentTrack.id) === targetId) {
              targetTrack = currentTrack;
            } else if (activeQueue && activeQueue.length > 0) {
              targetTrack = activeQueue.find((t) => String(t.id) === targetId);
            }
            if (!targetTrack) {
              targetTrack = songs.find((t) => String(t.id) === targetId);
            }
          }

          let formatted = formatSaavnSong(targetTrack);
          if (!formatted || formatted.title === "Favorited Song" || !formatted.title) {
            resolveSongDetails(targetId).then((realTrack) => {
              if (realTrack && realTrack.title && realTrack.title !== "Favorited Song") {
                setLikedSongs((curr) => {
                  const resolved = curr.map((item) =>
                    String(item.id) === targetId ? realTrack : item,
                  );
                  syncLikedSongsToFirestore(resolved);
                  return resolved;
                });
              }
            });

            formatted = {
              id: targetId,
              title: currentTrack?.id === targetId ? currentTrack.title : targetId,
              artist: currentTrack?.id === targetId ? currentTrack.artist : "Artist",
              album: currentTrack?.id === targetId ? currentTrack.album : "Single",
              image:
                currentTrack?.id === targetId
                  ? currentTrack.image
                  : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
              duration: currentTrack?.id === targetId ? currentTrack.duration : "3:30",
              seconds: currentTrack?.id === targetId ? currentTrack.seconds : 210,
              audioUrl: currentTrack?.id === targetId ? currentTrack.audioUrl : "",
            };
          }

          updated = [formatted, ...prev.filter((t) => String(t.id) !== targetId)];
        }

        syncLikedSongsToFirestore(updated);
        return updated;
      });
    },
    [currentTrack, activeQueue, openAuthModal, syncLikedSongsToFirestore],
  );

  const isLiked = useCallback(
    (trackOrId) => {
      if (!trackOrId) return false;
      const sId =
        typeof trackOrId === "object" && trackOrId !== null
          ? String(trackOrId.id)
          : String(trackOrId);
      return likedSongs.some((t) => String(t.id) === sId);
    },
    [likedSongs],
  );

  /**
   * Playlist Creation & Management
   */
  const createCustomPlaylist = useCallback(
    ({ title, description, image }) => {
      // Gate for unauthenticated guests
      if (!auth.currentUser) {
        openAuthModal("signup");
        return null;
      }

      const newPlaylist = {
        id: `custom-${Date.now()}`,
        title: title || "My Custom Playlist",
        description: description || `Created by ${userProfile.name}`,
        owner: userProfile.name || "Audix Listener",
        followers: "0 saves",
        image:
          image ||
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
        tracks: [], // Start strictly empty with 0 songs
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setCustomPlaylists((prev) => {
        const updated = [newPlaylist, ...prev];
        syncPlaylistsToFirestore(updated);
        return updated;
      });

      return newPlaylist;
    },
    [userProfile, openAuthModal, syncPlaylistsToFirestore],
  );

  const addSongToPlaylist = useCallback(
    (playlistId, track) => {
      if (!auth.currentUser) {
        openAuthModal("signup");
        return false;
      }
      if (!playlistId || !track) return false;

      let added = false;
      setCustomPlaylists((prev) => {
        const updated = prev.map((p) => {
          if (p.id === playlistId) {
            const currentTracks = Array.isArray(p.tracks) ? p.tracks : [];
            const exists = currentTracks.some(
              (t) => String(t.id) === String(track.id),
            );
            if (!exists) {
              added = true;
              return {
                ...p,
                tracks: [...currentTracks, track],
              };
            }
          }
          return p;
        });

        if (added) {
          syncPlaylistsToFirestore(updated);
        }
        return updated;
      });

      return added;
    },
    [openAuthModal, syncPlaylistsToFirestore],
  );

  const removeSongFromPlaylist = useCallback(
    (playlistId, trackId) => {
      if (!playlistId || !trackId) return;

      setCustomPlaylists((prev) => {
        const updated = prev.map((p) => {
          if (p.id === playlistId) {
            const currentTracks = Array.isArray(p.tracks) ? p.tracks : [];
            return {
              ...p,
              tracks: currentTracks.filter(
                (t) => String(t.id) !== String(trackId),
              ),
            };
          }
          return p;
        });

        syncPlaylistsToFirestore(updated);
        return updated;
      });
    },
    [syncPlaylistsToFirestore],
  );

  // Dynamic Liked Songs playlist
  const likedSongsList = likedSongs;

  const allPlaylists = useMemo(() => {
    const likedPlaylist = {
      id: "liked",
      title: "Liked Songs",
      description: `Your collected favorites (${likedSongs.length} tracks).`,
      owner: userProfile.name,
      followers: `${likedSongs.length} songs`,
      image:
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=85",
      tracks: likedSongs,
      isLikedPlaylist: true,
    };

    const liveThemedPlaylists = LIVE_PLAYLIST_THEMES.map((pt) => ({
      id: pt.id,
      title: pt.title,
      description: pt.description,
      owner: pt.owner,
      image: pt.image,
      tracks: songs
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
    }));

    return [
      likedPlaylist,
      ...customPlaylists,
      ...liveThemedPlaylists,
      ...playlists,
    ];
  }, [likedSongs, customPlaylists, userProfile]);

  const value = useMemo(
    () => ({
      // Audio & Queue State
      currentTrack,
      isPlaying,
      isLoading,
      progress,
      currentTime,
      duration,
      volume,
      isMuted,
      shuffle,
      repeatMode,
      activeQueue,
      userQueue,
      contextQueue,
      contextName,
      audioError,

      // Authentication State
      isAuthenticated,
      currentUser,
      authLoading,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      isCreatePlaylistOpen,
      openCreatePlaylistModal,
      closeCreatePlaylistModal,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      logoutUser,

      // User & Library State
      likedSongs,
      likedSongIds,
      likedSongsList,
      customPlaylists,
      allPlaylists,
      userProfile,
      searchQuery,
      activeLanguage,

      // Playback & Queue Controls
      playTrack,
      togglePlay,
      playNext,
      playPrevious,
      seekProgress,
      seekTime,
      handleVolumeChange,
      toggleMute,
      setShuffle,
      toggleRepeat,
      toggleLike,
      isLiked,
      addToQueue,
      playNextInQueue,
      removeFromUserQueue,
      removeFromContextQueue,
      clearUserQueue,
      clearQueue,
      setUserQueue,
      setContextQueue,
      setContextName,
      createCustomPlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      setUserProfile,
      updateUserAvatar,
      removeUserAvatar,
      updateUserName,
      changeUserPassword,
      sendPasswordReset,
      setSearchQuery,
      setActiveLanguage,

      // API Search & Resolver Methods
      fetchSearchSongs,
      resolveSongDetails,
    }),
    [
      currentTrack,
      isPlaying,
      isLoading,
      progress,
      currentTime,
      duration,
      volume,
      isMuted,
      shuffle,
      repeatMode,
      activeQueue,
      userQueue,
      contextQueue,
      contextName,
      audioError,
      isAuthenticated,
      currentUser,
      authLoading,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      isCreatePlaylistOpen,
      openCreatePlaylistModal,
      closeCreatePlaylistModal,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      logoutUser,
      likedSongs,
      likedSongIds,
      likedSongsList,
      customPlaylists,
      allPlaylists,
      userProfile,
      searchQuery,
      activeLanguage,
      playTrack,
      togglePlay,
      playNext,
      playPrevious,
      seekProgress,
      seekTime,
      handleVolumeChange,
      toggleMute,
      toggleRepeat,
      toggleLike,
      isLiked,
      addToQueue,
      playNextInQueue,
      removeFromUserQueue,
      removeFromContextQueue,
      clearUserQueue,
      clearQueue,
      createCustomPlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      updateUserAvatar,
      removeUserAvatar,
      updateUserName,
      changeUserPassword,
      sendPasswordReset,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

/**
 * Custom Hook: useAudio
 */
export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

// Backward-compatibility aliases for existing usePlayer imports
export const usePlayer = useAudio;
export const PlayerProvider = AudioProvider;
export default AudioContext;
