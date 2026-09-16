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
    to: "/playlist/liked",
  },
];

export default function MobileNav() {
  const { theme } = useTheme();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className={`
        fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around h-[68px] px-2 border-t backdrop-blur-2xl lg:hidden transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-[#101010]/95 border-white/[0.08] text-white"
            : "bg-[#faf8f5]/95 border-stone-300/80 text-stone-900 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]"
        }
      `}
    >
      {items.map(({ title, icon: Icon, to }) => (
        <NavLink
          key={title}
          to={to}
          className={({ isActive }) => `
            relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all duration-200
            ${
              isActive
                ? theme === "dark"
                  ? "text-red-500 bg-red-500/15"
                  : "text-red-600 bg-red-500/10 font-bold"
                : theme === "dark"
                ? "text-[#a0a0a0] hover:text-white"
                : "text-stone-500 hover:text-stone-900"
            }
          `}
        >
          {({ isActive }) => (
            <>
              <motion.div
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive && title === "Home" ? "currentColor" : "none"}
                />
              </motion.div>
              <span
                className={`
                  text-[11px] mt-0.5 tracking-tight
                  ${isActive ? "font-bold" : "font-medium"}
                `}
              >
                {title}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
