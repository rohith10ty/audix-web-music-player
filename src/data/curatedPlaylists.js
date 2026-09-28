/**
 * Helper to find song by ID from song collection
 */
function getTracksByIds(ids, songList = []) {
  const songMap = new Map((songList || []).map((s) => [s.id, s]));
  return ids.map((id) => songMap.get(id)).filter(Boolean);
}

/**
 * Pre-defined curated playlists covering Popular, Trending, Mixed, Romantic, Sad, Workout, and Party for all languages
 */
export const CURATED_PLAYLISTS = [
  // ==========================================
  // ENGLISH PLAYLISTS
  // ==========================================
  {
    id: "english-hits",
    title: "Global English Chartbusters",
    description: "The biggest, record-breaking global English pop hits and Billboard chartbusters.",
    owner: "Audix Global",
    followers: "3.2M saves",
    language: "English",
    category: "popular",
    image: "https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg",
    trackIds: [
      "espresso",
      "birds-of-a-feather",
      "blinding-lights",
      "shape-of-you",
      "cruel-summer",
      "starboy",
      "levitating",
      "perfect-ed-sheeran",
      "as-it-was",
      "believer",
    ],
  },
  {
    id: "english-trending",
    title: "Trending English Viral Hits",
    description: "The hottest trending global tracks streaming worldwide on Audix right now.",
    owner: "Audix Hits",
    followers: "2.1M saves",
    language: "English",
    category: "trending",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "espresso",
      "birds-of-a-feather",
      "as-it-was",
      "stay",
      "cruel-summer",
      "golden-hour",
      "starlight",
      "blinding-lights",
    ],
  },
  {
    id: "english-mixed",
    title: "Global English Pop Mega Mix",
    description: "The ultimate non-stop variety mix of iconic global pop, synthwave, and chill anthems.",
    owner: "Audix Radio",
    followers: "1.7M saves",
    language: "English",
    category: "mixed",
    image: "https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg",
    trackIds: [
      "blinding-lights",
      "starboy",
      "golden-hour",
      "midnight-city",
      "shape-of-you",
      "after-hours",
      "believer",
      "levitating",
      "stay",
    ],
  },
  {
    id: "english-romance",
    title: "English Acoustic & Love Hits",
    description: "Heart-touching romantic acoustic ballads and tender modern love songs.",
    owner: "Audix Romance",
    followers: "2.5M saves",
    language: "English",
    category: "romantic",
    image: "https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg",
    trackIds: [
      "birds-of-a-feather",
      "perfect-ed-sheeran",
      "lover-taylor-swift",
      "until-i-found-you",
      "golden-hour",
      "someone-you-loved",
    ],
  },
  {
    id: "english-sad",
    title: "English Sad & Emotional Melodies",
    description: "Soulful, melancholic, and emotional deep cuts for quiet late nights.",
    owner: "Audix Chill",
    followers: "1.4M saves",
    language: "English",
    category: "sad",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "someone-you-loved",
      "until-i-found-you",
      "after-hours",
      "midnight-city",
      "golden-hour",
      "lover-taylor-swift",
    ],
  },
  {
    id: "english-workout",
    title: "Global Workout & Beast Mode",
    description: "High-adrenaline, heavy-tempo power anthems to crush your gym sessions and workout reps.",
    owner: "Audix Fitness",
    followers: "1.9M saves",
    language: "English",
    category: "workout",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "believer",
      "starlight",
      "levitating",
      "stay",
      "blinding-lights",
      "shape-of-you",
    ],
  },
  {
    id: "english-party",
    title: "Global Energy & Dance Party Hits",
    description: "Euphoric club bangers, disco grooves, and dancefloor anthems to light up any party.",
    owner: "Audix Club",
    followers: "2.8M saves",
    language: "English",
    category: "party",
    image: "https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg",
    trackIds: [
      "espresso",
      "levitating",
      "stay",
      "shape-of-you",
      "cruel-summer",
      "blinding-lights",
      "starboy",
    ],
  },

  // ==========================================
  // TELUGU PLAYLISTS
  // ==========================================
  {
    id: "telugu-hits",
    title: "Telugu Chartbusters 2025",
    description: "The biggest, trending blockbuster hits in Tollywood.",
    owner: "Audix Telugu",
    followers: "1.4M saves",
    language: "Telugu",
    category: "popular",
    image: "https://c.saavncdn.com/000/Guntur-Kaaram-Telugu-2023-20240126145901-500x500.jpg",
    trackIds: [
      "kurchi-madathapetti",
      "chuttamalle",
      "naatu-naatu",
      "ta-takkara",
      "garam-garam",
      "tillu-anna-dj",
      "samajavaragamana",
      "srivalli",
      "inkem-inkem",
    ],
  },
  {
    id: "telugu-trending",
    title: "Trending Telugu Mass & Hits",
    description: "Freshly viral Tollywood bangers and chart-dominating theatrical hits.",
    owner: "Audix Telugu",
    followers: "1.1M saves",
    language: "Telugu",
    category: "trending",
    image: "https://c.saavncdn.com/536/Saripodhaa-Sanivaaram-Original-Motion-Picture-Soundtrack-Telugu-2024-20240828160005-500x500.jpg",
    trackIds: [
      "garam-garam",
      "chuttamalle",
      "kurchi-madathapetti",
      "ta-takkara",
      "oo-antava-mawa",
      "fear-song",
    ],
  },
  {
    id: "telugu-mixed",
    title: "Tollywood All-Time Super Mix",
    description: "The ultimate variety blend of mass anthems, groovy beats, and timeless melodies.",
    owner: "Audix Telugu",
    followers: "1.6M saves",
    language: "Telugu",
    category: "mixed",
    image: "https://c.saavncdn.com/artists/Thaman_S__007_20231106094011_500x500.jpg",
    trackIds: [
      "samajavaragamana",
      "srivalli",
      "inkem-inkem",
      "tillu-anna-dj",
      "urike-urike",
      "ninnila-ninnila",
      "kalavathi",
      "butta-bomma",
      "ramuloo-ramulaa",
    ],
  },
  {
    id: "telugu-romance",
    title: "Telugu Romantic Melodies",
    description: "Heart-touching soulful Telugu love songs and timeless romance.",
    owner: "Audix Telugu",
    followers: "980K saves",
    language: "Telugu",
    category: "romantic",
    image: "https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg",
    trackIds: [
      "chuttamalle",
      "samajavaragamana",
      "srivalli",
      "inkem-inkem",
      "urike-urike",
      "o-rendu-prema-meghaalila",
      "priyathama-priyathama",
      "sooseki-couple-song",
      "sammohanuda-rules-ranjann",
      "ninnila-ninnila",
      "kalavathi",
    ],
  },
  {
    id: "telugu-sad",
    title: "Telugu Soulful Heartbreak & Melancholy",
    description: "Deep, emotional, and soul-stirring melodies for reflective moments and heartbreak.",
    owner: "Audix Telugu",
    followers: "720K saves",
    language: "Telugu",
    category: "sad",
    image: "https://c.saavncdn.com/405/Majili-Telugu-2019-20190323231520-500x500.jpg",
    trackIds: [
      "priyathama-priyathama",
      "o-rendu-prema-meghaalila",
      "urike-urike",
      "samajavaragamana",
      "ninnila-ninnila",
    ],
  },
  {
    id: "telugu-workout",
    title: "Telugu High Voltage Workout & Gym Beast",
    description: "Electrifying mass anthems and relentless energy beats to power up your workout sets.",
    owner: "Audix Telugu",
    followers: "890K saves",
    language: "Telugu",
    category: "workout",
    image: "https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg",
    trackIds: [
      "naatu-naatu",
      "garam-garam",
      "tillu-anna-dj",
      "kurchi-madathapetti",
      "oo-antava-mawa",
      "fear-song",
    ],
  },
  {
    id: "telugu-party",
    title: "Tollywood Mass & Party Masala",
    description: "High-voltage dance anthems and party bangers.",
    owner: "Audix Telugu",
    followers: "760K saves",
    language: "Telugu",
    category: "party",
    image: "https://c.saavncdn.com/430/DJ-Tillu-Telugu-2022-20220210033850-500x500.jpg",
    trackIds: [
      "naatu-naatu",
      "kurchi-madathapetti",
      "oo-antava-mawa",
      "tillu-anna-dj",
      "garam-garam",
      "ramuloo-ramulaa",
      "butta-bomma",
      "oo-antava",
    ],
  },

  // ==========================================
  // TAMIL PLAYLISTS
  // ==========================================
  {
    id: "tamil-hits",
    title: "Tamil Superhits 2025",
    description: "The biggest, most viral Kollywood chartbusters and theater anthems.",
    owner: "Audix Tamil",
    followers: "1.6M saves",
    language: "Tamil",
    category: "popular",
    image: "https://c.saavncdn.com/510/Beast-Tamil-2022-20220504184736-500x500.jpg",
    trackIds: [
      "arabic-kuthu",
      "enjoy-enjaami",
      "rowdy-baby",
      "vaathi-coming",
      "hukum",
      "naan-pizhai",
      "megham-karukatha",
      "jimikki-ponnu",
      "badass",
      "kaavaalaa",
    ],
  },
  {
    id: "tamil-trending",
    title: "Trending Tamil Viral Beats",
    description: "Freshly trending Tamil viral audio tracks and chart-toppers.",
    owner: "Audix Tamil",
    followers: "1.2M saves",
    language: "Tamil",
    category: "trending",
    image: "https://c.saavncdn.com/artists/Anirudh_Ravichander_003_20260121134149_500x500.jpg",
    trackIds: [
      "kaavaalaa",
      "hukum",
      "badass",
      "arabic-kuthu",
      "hayyoda",
      "matta-goat",
    ],
  },
  {
    id: "tamil-mixed",
    title: "Kollywood All-Time Super Mix",
    description: "A sensational mix of modern Anirudh beats, Rahman classics, and melody anthems.",
    owner: "Audix Tamil",
    followers: "1.3M saves",
    language: "Tamil",
    category: "mixed",
    image: "https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg",
    trackIds: [
      "arabic-kuthu",
      "naan-pizhai",
      "megham-karukatha",
      "jimikki-ponnu",
      "enjoy-enjaami",
      "hayyoda",
      "marakkuma-nenjam",
      "enna-solla",
    ],
  },
  {
    id: "tamil-romance",
    title: "Kollywood Romantic Melodies",
    description: "Soulful, poetic Tamil romantic songs and mesmerizing melodies.",
    owner: "Audix Tamil",
    followers: "1.1M saves",
    language: "Tamil",
    category: "romantic",
    image: "https://c.saavncdn.com/712/Thiruchitrambalam-Tamil-2022-20220818165039-500x500.jpg",
    trackIds: [
      "naan-pizhai",
      "megham-karukatha",
      "hayyoda",
      "jimikki-ponnu",
      "enna-solla",
      "neeyum-naanum-anbe",
      "marakkuma-nenjam",
    ],
  },
  {
    id: "tamil-sad",
    title: "Tamil Soulful & Heartbreak Melodies",
    description: "Poignant, touching Tamil emotional melodies for quiet reflection.",
    owner: "Audix Tamil",
    followers: "680K saves",
    language: "Tamil",
    category: "sad",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "naan-pizhai",
      "megham-karukatha",
      "marakkuma-nenjam",
      "neeyum-naanum-anbe",
      "enjoy-enjaami",
    ],
  },
  {
    id: "tamil-workout",
    title: "Tamil Kuthu & Gym Workout Energy",
    description: "Heavy bass, high BPM Tamil Kuthu beats to unleash maximum power in the gym.",
    owner: "Audix Tamil",
    followers: "940K saves",
    language: "Tamil",
    category: "workout",
    image: "https://c.saavncdn.com/732/Leo-Tamil-2023-20231020084534-500x500.jpg",
    trackIds: [
      "hukum",
      "badass",
      "arabic-kuthu",
      "kaavaalaa",
      "vaathi-coming",
      "matta-goat",
    ],
  },
  {
    id: "tamil-party",
    title: "Tamil Kuthu & Party Dance Beats",
    description: "Non-stop celebration Kuthu beats and blockbuster dancefloor bangers.",
    owner: "Audix Tamil",
    followers: "890K saves",
    language: "Tamil",
    category: "party",
    image: "https://c.saavncdn.com/510/Beast-Tamil-2022-20220504184736-500x500.jpg",
    trackIds: [
      "arabic-kuthu",
      "kaavaalaa",
      "hukum",
      "badass",
      "vaathi-coming",
      "jimikki-ponnu",
      "rowdy-baby",
      "matta-goat",
    ],
  },

  // ==========================================
  // HINDI / BOLLYWOOD PLAYLISTS
  // ==========================================
  {
    id: "hindi-hits",
    title: "Bollywood Top Trending Hits 2025",
    description: "The biggest, chart-dominating Bollywood hits and trending anthems.",
    owner: "Audix Bollywood",
    followers: "2.9M saves",
    language: "Hindi",
    category: "popular",
    image: "https://c.saavncdn.com/807/Brahmastra-Hindi-2022-20220909180749-500x500.jpg",
    trackIds: [
      "kesariya",
      "chaleya",
      "raataan-lambiyan",
      "apna-bana-le",
      "o-maahi",
      "tum-se",
      "jhoome-jo-pathaan",
      "tauba-tauba",
      "aaj-ki-raat",
      "satranga",
    ],
  },
  {
    id: "hindi-trending",
    title: "Trending Bollywood Chartbusters",
    description: "Fresh viral Bollywood tracks lighting up social feeds and radio playlists.",
    owner: "Audix Bollywood",
    followers: "1.8M saves",
    language: "Hindi",
    category: "trending",
    image: "https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg",
    trackIds: [
      "tauba-tauba",
      "aaj-ki-raat",
      "o-maahi",
      "chaleya",
      "sajni-laapataa-ladies",
      "satranga",
      "pehle-bhi-main",
    ],
  },
  {
    id: "hindi-mixed",
    title: "Bollywood All-Time Mega Mix",
    description: "The complete variety package of romance, dance, acoustic vibes, and modern Bollywood hits.",
    owner: "Audix Bollywood",
    followers: "2.1M saves",
    language: "Hindi",
    category: "mixed",
    image: "https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg",
    trackIds: [
      "kesariya",
      "raataan-lambiyan",
      "apna-bana-le",
      "chaleya",
      "tum-hi-ho",
      "agar-tum-saath-ho",
      "heeriye",
      "o-maahi",
    ],
  },
  {
    id: "hindi-romance",
    title: "Bollywood Soulful Melodies & Romance",
    description: "Soul-stirring romantic hits by Arijit Singh, Shreya Ghoshal, and Pritam.",
    owner: "Audix Bollywood",
    followers: "2.4M saves",
    language: "Hindi",
    category: "romantic",
    image: "https://c.saavncdn.com/807/Brahmastra-Hindi-2022-20220909180749-500x500.jpg",
    trackIds: [
      "kesariya",
      "raataan-lambiyan",
      "apna-bana-le",
      "o-maahi",
      "tum-hi-ho",
      "agar-tum-saath-ho",
      "chaleya",
      "heeriye",
      "tere-pyaar-mein",
      "satranga",
      "sajni-laapataa-ladies",
    ],
  },
  {
    id: "hindi-sad",
    title: "Bollywood Heartbreak & Sad Classics",
    description: "Timeless emotional melodies and heartbreak anthems for deep healing.",
    owner: "Audix Bollywood",
    followers: "1.5M saves",
    language: "Hindi",
    category: "sad",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "agar-tum-saath-ho",
      "tum-hi-ho",
      "satranga",
      "pehle-bhi-main",
      "apna-bana-le",
      "raataan-lambiyan",
    ],
  },
  {
    id: "hindi-workout",
    title: "Bollywood High-Energy Workout & Gym Beats",
    description: "High-octane Bollywood dance beats and pump-up tracks for intense training sessions.",
    owner: "Audix Bollywood",
    followers: "1.3M saves",
    language: "Hindi",
    category: "workout",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "jhoome-jo-pathaan",
      "tauba-tauba",
      "aaj-ki-raat",
      "chaleya",
      "tere-pyaar-mein",
    ],
  },
  {
    id: "hindi-party",
    title: "Bollywood Club & Party Masala",
    description: "Blockbuster party anthems, wedding dance bangers, and club hits.",
    owner: "Audix Bollywood",
    followers: "1.7M saves",
    language: "Hindi",
    category: "party",
    image: "https://c.saavncdn.com/artists/Sachin_Jigar_003_20251222093820_500x500.jpg",
    trackIds: [
      "tauba-tauba",
      "aaj-ki-raat",
      "jhoome-jo-pathaan",
      "chaleya",
      "tere-pyaar-mein",
    ],
  },

  // ==========================================
  // MALAYALAM PLAYLISTS
  // ==========================================
  {
    id: "malayalam-hits",
    title: "Mollywood Top Blockbusters",
    description: "The most trending, cult Malayalam soundtrack hits and chartbusters.",
    owner: "Audix Malayalam",
    followers: "940K saves",
    language: "Malayalam",
    category: "popular",
    image: "https://c.saavncdn.com/artists/Sushin_Shyam_002_20250707125538_500x500.jpg",
    trackIds: [
      "illuminati-aavesham",
      "armadham-aavesham",
      "darshana",
      "malare",
      "jimikki-kammal",
      "manavalan-thug",
      "katchi-sera",
      "pavizha-mazha",
    ],
  },
  {
    id: "malayalam-trending",
    title: "Trending Malayalam Viral Tracks",
    description: "The hottest viral Malayalam soundscapes and fresh box-office hits.",
    owner: "Audix Malayalam",
    followers: "780K saves",
    language: "Malayalam",
    category: "trending",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "illuminati-aavesham",
      "armadham-aavesham",
      "katchi-sera",
      "manavalan-thug",
      "darshana",
    ],
  },
  {
    id: "malayalam-mixed",
    title: "Mollywood Ultimate Mega Mix",
    description: "Soulful indie melodies seamlessly blended with energetic folk-pop beats.",
    owner: "Audix Malayalam",
    followers: "690K saves",
    language: "Malayalam",
    category: "mixed",
    image: "https://c.saavncdn.com/artists/Vineeth_Sreenivasan_003_20240508103358_500x500.jpg",
    trackIds: [
      "darshana",
      "malare",
      "jimikki-kammal",
      "pavizha-mazha",
      "pala-palli",
      "kudukku",
      "jeevamshamayi",
      "aalocham",
    ],
  },
  {
    id: "malayalam-romance",
    title: "Soul of Malayalam Melodies",
    description: "Mesmerizing, soulful melodies and evergreen Malayalam romantic gems.",
    owner: "Audix Malayalam",
    followers: "810K saves",
    language: "Malayalam",
    category: "romantic",
    image: "https://c.saavncdn.com/artists/Hesham_Abdul_Wahab_001_20220919094035_500x500.jpg",
    trackIds: [
      "darshana",
      "malare",
      "pavizha-mazha",
      "katchi-sera",
      "jeevamshamayi",
      "aalocham",
      "neela-shankhu",
      "periyone-aadujeevitham",
    ],
  },
  {
    id: "malayalam-sad",
    title: "Malayalam Emotional & Soulful Melodies",
    description: "Deep, soothing acoustic tracks and poetic heartbreak classics.",
    owner: "Audix Malayalam",
    followers: "480K saves",
    language: "Malayalam",
    category: "sad",
    image: "https://c.saavncdn.com/artists/Vijay_Yesudas_500x500.jpg",
    trackIds: [
      "malare",
      "pavizha-mazha",
      "periyone-aadujeevitham",
      "jeevamshamayi",
      "neela-shankhu",
    ],
  },
  {
    id: "malayalam-workout",
    title: "Malayalam High-Energy Workout Beats",
    description: "Cult hype beats and pulse-pounding electronic rhythms for gym sessions.",
    owner: "Audix Malayalam",
    followers: "590K saves",
    language: "Malayalam",
    category: "workout",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "armadham-aavesham",
      "illuminati-aavesham",
      "pala-palli",
      "manavalan-thug",
      "kudukku",
    ],
  },
  {
    id: "malayalam-party",
    title: "Kerala Energy & Dance Beats",
    description: "High-voltage celebration hits, festival folk beats, and party vibes.",
    owner: "Audix Malayalam",
    followers: "720K saves",
    language: "Malayalam",
    category: "party",
    image: "https://c.saavncdn.com/artists/Sushin_Shyam_002_20250707125538_500x500.jpg",
    trackIds: [
      "illuminati-aavesham",
      "armadham-aavesham",
      "jimikki-kammal",
      "pala-palli",
      "manavalan-thug",
      "kudukku",
    ],
  },

  // ==========================================
  // KANNADA / SANDALWOOD PLAYLISTS
  // ==========================================
  {
    id: "kannada-hits",
    title: "Sandalwood Top Chartbusters",
    description: "The biggest, record-breaking Sandalwood anthems and mass blockbusters.",
    owner: "Audix Kannada",
    followers: "890K saves",
    language: "Kannada",
    category: "popular",
    image: "https://c.saavncdn.com/artists/B__Ajaneesh_Loknath_002_20231106093827_500x500.jpg",
    trackIds: [
      "ra-ra-rakkamma",
      "singara-siriye",
      "pushpa-pushpa-kannada",
      "belageddu-kirik-party",
      "minchagi-neenu",
      "hands-up",
      "feel-the-power",
    ],
  },
  {
    id: "kannada-trending",
    title: "Trending Sandalwood Viral Hits",
    description: "The most viral Kannada tracks setting social trends ablaze.",
    owner: "Audix Kannada",
    followers: "650K saves",
    language: "Kannada",
    category: "trending",
    image: "https://c.saavncdn.com/artists/Sanjith_Hegde_002_20230413072406_500x500.jpg",
    trackIds: [
      "pushpa-pushpa-kannada",
      "singara-siriye",
      "ra-ra-rakkamma",
      "hands-up",
      "belakina-kavalalli",
    ],
  },
  {
    id: "kannada-mixed",
    title: "Kannada All-Star Super Mix",
    description: "An iconic journey from timeless golden melodies to high-voltage modern mass hits.",
    owner: "Audix Kannada",
    followers: "710K saves",
    language: "Kannada",
    category: "mixed",
    image: "https://c.saavncdn.com/artists/Vijay_Prakash_007_20250225123208_500x500.jpg",
    trackIds: [
      "singara-siriye",
      "belageddu-kirik-party",
      "minchagi-neenu",
      "anisuthide-mungaru-male",
      "soul-of-dia",
      "belakina-kavalalli",
      "neene-modalu-kiss",
    ],
  },
  {
    id: "kannada-romance",
    title: "Kannada Romantic Melodies",
    description: "Timeless Kannada love songs, soulful romantic duets, and sweet melodies.",
    owner: "Audix Kannada",
    followers: "750K saves",
    language: "Kannada",
    category: "romantic",
    image: "https://c.saavncdn.com/artists/Sonu_Nigam_003_20260813182013_500x500.jpg",
    trackIds: [
      "singara-siriye",
      "minchagi-neenu",
      "anisuthide-mungaru-male",
      "soul-of-dia",
      "belageddu-kirik-party",
      "belakina-kavalalli",
      "neene-modalu-kiss",
    ],
  },
  {
    id: "kannada-sad",
    title: "Kannada Soulful & Emotional Melodies",
    description: "Emotional, poetic, and soothing melodies for peaceful introspection.",
    owner: "Audix Kannada",
    followers: "420K saves",
    language: "Kannada",
    category: "sad",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "anisuthide-mungaru-male",
      "soul-of-dia",
      "minchagi-neenu",
      "belakina-kavalalli",
    ],
  },
  {
    id: "kannada-workout",
    title: "Kannada Power & Gym Workout Bangers",
    description: "Heavy mass beats, heroic soundtracks, and powerful basslines for your workout.",
    owner: "Audix Kannada",
    followers: "530K saves",
    language: "Kannada",
    category: "workout",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80",
    trackIds: [
      "ra-ra-rakkamma",
      "pushpa-pushpa-kannada",
      "feel-the-power",
      "hands-up",
      "tagaru-banthu",
      "dheera-dheera",
    ],
  },
  {
    id: "kannada-party",
    title: "Kannada Power & Dance Bangers",
    description: "Mass dancefloor bangers and electrifying party beats.",
    owner: "Audix Kannada",
    followers: "640K saves",
    language: "Kannada",
    category: "party",
    image: "https://c.saavncdn.com/artists/B__Ajaneesh_Loknath_002_20231106093827_500x500.jpg",
    trackIds: [
      "ra-ra-rakkamma",
      "hands-up",
      "pushpa-pushpa-kannada",
      "belageddu-kirik-party",
      "tagaru-banthu",
      "karabul",
    ],
  },
];

/**
 * Hydrates playlists with actual track objects
 */
export function getHydratedPlaylists() {
  return CURATED_PLAYLISTS.map((p) => ({
    ...p,
    tracks: getTracksByIds(p.trackIds || []),
  }));
}

/**
 * Get playlists for a specific language
 */
export function getPlaylistsByLanguage(lang) {
  if (!lang || lang === "All") return getHydratedPlaylists();
  const normalized = lang.toLowerCase().trim();
  return getHydratedPlaylists().filter(
    (p) => (p.language || "").toLowerCase() === normalized
  );
}

/**
 * Get playlists matching a category / mood (popular, trending, mixed, romantic, sad, workout, party)
 */
export function getPlaylistsByCategory(cat, lang = "All") {
  const normCat = cat.toLowerCase().trim();
  const all = getPlaylistsByLanguage(lang);
  return all.filter((p) => (p.category || "").toLowerCase().includes(normCat));
}

/**
 * Search playlists by query and language
 */
export function searchCuratedPlaylists(query = "", lang = "All") {
  const all = getPlaylistsByLanguage(lang);
  if (!query || !query.trim()) return all;

  const q = query.toLowerCase().trim();

  // Category synonyms mapping
  const categoryKeywords = {
    romantic: ["romance", "romantic", "love", "melody", "melodies", "soulful", "acoustic"],
    sad: ["sad", "heartbreak", "emotional", "cry", "lonely", "breakup", "melancholy"],
    workout: ["workout", "gym", "energy", "fitness", "beast", "power", "pump", "training"],
    party: ["party", "dance", "club", "masala", "kuthu", "dhol", "banger", "dj"],
    trending: ["trending", "viral", "fresh", "latest", "new"],
    popular: ["popular", "top", "hits", "chartbusters", "superhits", "best"],
    mixed: ["mixed", "mix", "mega", "variety", "radio", "all-time"],
  };

  // Check category match
  const matchedCategories = new Set();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => q.includes(k))) {
      matchedCategories.add(cat);
    }
  }

  return all.filter((p) => {
    const titleMatch = (p.title || "").toLowerCase().includes(q);
    const descMatch = (p.description || "").toLowerCase().includes(q);
    const langMatch = (p.language || "").toLowerCase().includes(q);
    const catMatch =
      (p.category || "").toLowerCase().includes(q) ||
      (p.category && matchedCategories.has(p.category));

    return titleMatch || descMatch || langMatch || catMatch;
  });
}
