import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

export default function QuickCard({ item }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { playTrack } = usePlayer();

  const handleClick = () => {
    if (item.route) {
      navigate(item.route);
    } else if (item.track) {
      playTrack(item.track);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (item.track) {
      playTrack(item.track);
    } else if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <motion.button
      whileHover={{
        y: -2,
        scale: 1.01,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`
        group relative flex h-14 w-full items-center overflow-hidden rounded-lg text-left shadow-sm transition-all
        ${
          theme === "dark"
            ? "bg-white/[0.08] hover:bg-white/[0.14] text-white"
            : "bg-[#faf8f5] hover:bg-white text-stone-900 border border-stone-300/70"
        }
      `}
    >
      <img
        src={item.image}
        alt={item.title}
        className="aspect-square h-full object-cover shadow-sm shrink-0"
      />

      <div className="min-w-0 flex-1 px-3">
        <p className="truncate text-[13.5px] font-bold">{item.title}</p>
        {item.subtitle && (
          <p
            className={`
            truncate text-[11px]
            ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
          `}
          >
            {item.subtitle}
          </p>
        )}
      </div>

      <motion.span
        initial={false}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePlayClick}
        className="
          mr-2.5 hidden h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-400 group-hover:flex xl:flex xl:opacity-0 xl:group-hover:opacity-100 transition-all shrink-0
        "
        title="Play"
      >
        <Play size={16} fill="currentColor" className="ml-[2px]" />
      </motion.span>
    </motion.button>
  );
}
