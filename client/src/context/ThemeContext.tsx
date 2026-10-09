import { createContext, useContext, useEffect, ReactNode } from "react";

export type ThemeChoice = "light";

interface ThemeState {
  theme: "light";
  resolvedTheme: "light";
  setTheme: (t?: string) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

const STORAGE_KEY = "iti-theme";

function enforceLightTheme(): "light" {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }
  try {
    localStorage.setItem(STORAGE_KEY, "light");
  } catch {}
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    enforceLightTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", resolvedTheme: "light", setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
