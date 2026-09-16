import { createContext, useContext, useEffect, useState, useCallback } from "react";

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

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyThemeToDOM(nextTheme);
    setThemeState(nextTheme);
  }, [theme]);

  const setTheme = useCallback(
    (newTheme) => {
      if (newTheme === theme) return;
      applyThemeToDOM(newTheme);
      setThemeState(newTheme);
    },
    [theme]
  );

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
