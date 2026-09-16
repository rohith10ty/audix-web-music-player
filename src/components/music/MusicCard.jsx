import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MagicCard } from "@/components/ui/magic-card";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

export default function MusicCard({ item }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { playTrack } = usePlayer();

  const openItem = () => {
    if (item.type === "artist") {
      navigate(`/artist/${item.id}`);
      return;
    }

    if (item.type === "playlist") {
      navigate(`/playlist/${item.id}`);
      return;
    }

    if (item.track) {
      playTrack(item.track);
    }
  };

  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.015,
      }}
      transition={{
        type: "spring",
        stiffness: 330,
        damping: 25,
      }}
      className="group min-w-0 h-full"
    >
      <MagicCard
        gradientColor={theme === "dark" ? "#343434" : "#e5dfd3"}
        gradientOpacity={0.6}
        gradientSize={240}
        className={`
          h-full cursor-pointer overflow-hidden rounded-xl p-3.5 transition-colors shadow-sm flex flex-col justify-between
          ${
            theme === "dark"
              ? "bg-[#181818] border-white/[0.05] text-white hover:bg-[#202020]"
              : "bg-[#faf8f5] border-stone-300/60 text-stone-800 hover:bg-white hover:shadow-md"
          }
        `}
      >
        <div onClick={openItem} className="flex flex-col h-full">
          <div
            className={`
              relative aspect-square w-full overflow-hidden shadow-sm shrink-0
              ${item.round ? "rounded-full" : "rounded-lg"}
            `}
          >
            <motion.img
              whileHover={{ scale: 1.045 }}
              transition={{ duration: 0.35 }}
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
            />

            {!item.round && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            )}

            {/* Red Floating Play Button */}
            <motion.button
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.86,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              onClick={(event) => {
                event.stopPropagation();
                if (item.track) {
                  playTrack(item.track);
                } else {
                  openItem();
                }
              }}
              className="
                absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-red-400
              "
              title="Play"
            >
              <Play size={20} fill="currentColor" className="ml-[2px]" />
            </motion.button>
          </div>

          <div className="pt-3 flex-1 flex flex-col justify-start">
            <h3
              className={`
                truncate text-[15px] font-bold leading-snug
                ${theme === "dark" ? "text-white" : "text-stone-900"}
              `}
            >
              {item.title}
            </h3>

            <p
              className={`
                mt-1 line-clamp-2 text-[13px] leading-tight
                ${theme === "dark" ? "text-[#b3b3b3]" : "text-stone-500"}
              `}
            >
              {item.subtitle}
            </p>
          </div>
        </div>
      </MagicCard>
    </motion.div>
  );
}
