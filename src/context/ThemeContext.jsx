import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createAnimation, updateThemeStyles } from "@/lib/theme-animations";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("spotify_theme");
    return saved || "dark";
  });

  const applyThemeToDOM = (t) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("spotify_theme", t);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = useCallback((options = {}) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const x = options?.x ?? (typeof window !== "undefined" ? window.innerWidth - 80 : 0);
    const y = options?.y ?? 32;

    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);

    if (typeof document !== "undefined" && document.startViewTransition) {
      try {
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
          applyThemeToDOM(nextTheme);
          setThemeState(nextTheme);
        });

        transition.ready
          .then(() => {
            const clipPath = [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ];

            // Silky smooth, instantaneous 400ms-450ms transition (eliminates mobile freeze)
            document.documentElement.animate(
              {
                clipPath: clipPath,
              },
              {
                duration: isTouch ? 400 : 450,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          })
          .catch(() => {
            applyThemeToDOM(nextTheme);
            setThemeState(nextTheme);
          });
        return;
      } catch (err) {
        // Fallback for browsers with partial view transition support
      }
    }

    applyThemeToDOM(nextTheme);
    setThemeState(nextTheme);
  }, [theme]);

  const setTheme = useCallback((newTheme, options = {}) => {
    if (newTheme === theme) return;
    const x = options?.x ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 0);
    const y = options?.y ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 0);

    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);

    if (typeof document !== "undefined" && document.startViewTransition) {
      try {
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
          applyThemeToDOM(newTheme);
          setThemeState(newTheme);
        });

        transition.ready
          .then(() => {
            const clipPath = [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ];

            document.documentElement.animate(
              {
                clipPath: clipPath,
              },
              {
                duration: isTouch ? 400 : 450,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          })
          .catch(() => {
            applyThemeToDOM(newTheme);
            setThemeState(newTheme);
          });
        return;
      } catch (err) {
        // Fallback
      }
    }

    applyThemeToDOM(newTheme);
    setThemeState(newTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
