import { Route, Routes } from "react-router-dom";

import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import NowPlaying from "@/components/layout/NowPlaying";
import MobileNav from "@/components/layout/MobileNav";
import MusicPlayer from "@/components/player/MusicPlayer";
import SmoothScroll from "@/components/common/SmoothScroll";

import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Playlist from "@/pages/Playlist";
import Artist from "@/pages/Artist";
import { useTheme } from "@/context/ThemeContext";

export default function App() {
  const { theme } = useTheme();

  return (
    <SmoothScroll>
      <div
      className={`
        grid h-dvh overflow-hidden transition-colors duration-200
        grid-rows-[64px_minmax(0,1fr)]
        lg:grid-rows-[64px_minmax(0,1fr)_92px]
        ${
          theme === "dark"
            ? "bg-black text-white"
            : "bg-[#ece7de] text-stone-900"
        }
      `}
    >
      <Topbar />

      <div
        className="
          grid min-h-0 gap-2
          px-2 pb-2
          lg:grid-cols-[280px_minmax(0,1fr)]
          xl:grid-cols-[290px_minmax(0,1fr)_320px]
        "
      >
        <Sidebar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/artist/:id" element={<Artist />} />
          <Route path="*" element={<Home />} />
        </Routes>

        <NowPlaying />
      </div>

      <MusicPlayer />
      <MobileNav />
    </div>
  </SmoothScroll>
);
}
