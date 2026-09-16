import { Home, Library, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const items = [
  {
    title: "Home",
    icon: Home,
    to: "/",
  },
  {
    title: "Search",
    icon: Search,
    to: "/search",
  },
  {
    title: "Your Library",
    icon: Library,
    to: "/library",
  },
];

export default function MobileNav() {
  const { theme } = useTheme();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className={`
        fixed bottom-0 left-0 right-0 z-[60] grid grid-cols-3 items-center h-[62px] px-2 border-t backdrop-blur-2xl lg:hidden transition-colors duration-200 pb-[env(safe-area-inset-bottom,0px)]
        ${
          theme === "dark"
            ? "bg-black/60 border-white/10 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
            : "bg-[#faf8f5]/70 border-stone-300/60 text-stone-900 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]"
        }
      `}
    >
      {items.map(({ title, icon: Icon, to }) => (
        <NavLink
          key={title}
          to={to}
          className={({ isActive }) => `
            relative flex flex-col items-center justify-center h-full w-full py-1.5 transition-all duration-200
            ${
              isActive
                ? theme === "dark"
                  ? "text-red-500 font-bold"
                  : "text-red-600 font-bold"
                : theme === "dark"
                ? "text-white/60 hover:text-white font-medium"
                : "text-stone-500 hover:text-stone-900 font-medium"
            }
          `}
        >
          {({ isActive }) => (
            <>
              <motion.div
                animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="relative flex items-center justify-center"
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.9}
                  fill={isActive && title === "Home" ? "currentColor" : "none"}
                />
              </motion.div>
              <span className="text-[11px] mt-1 tracking-tight leading-none text-center">
                {title}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-red-500"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
