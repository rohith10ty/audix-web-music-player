import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import MusicCard from "./MusicCard";
import { useTheme } from "@/context/ThemeContext";

export default function MusicSection({ title, items, delay = 0 }) {
  const { theme } = useTheme();
  const [showAll, setShowAll] = useState(false);

  const displayedItems = showAll ? items : items.slice(0, 5);

  return (
    <section className="mb-9">
      <BlurFade delay={delay} duration={0.45} direction="up" blur="6px" inView>
        <div className="mb-4 flex items-end justify-between">
          <h2
            className={`
              text-xl font-bold tracking-tight sm:text-[22px]
              ${theme === "dark" ? "text-white" : "text-stone-900"}
            `}
          >
            {title}
          </h2>

          {items.length > 5 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className={`
                flex items-center gap-1 text-[13px] font-bold transition hover:underline
                ${
                  theme === "dark"
                    ? "text-[#b3b3b3] hover:text-white"
                    : "text-stone-500 hover:text-stone-900"
                }
              `}
            >
              {showAll ? "Show less" : "Show all"}
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      </BlurFade>

      <div
        className="
          grid grid-cols-2 gap-3.5
          sm:grid-cols-3
          lg:grid-cols-3
          xl:grid-cols-4
          2xl:grid-cols-5
        "
      >
        {displayedItems.map((item, index) => (
          <BlurFade
            key={item.id}
            delay={delay + index * 0.035}
            duration={0.4}
            direction="up"
            blur="7px"
            inView
          >
            <MusicCard item={item} />
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
