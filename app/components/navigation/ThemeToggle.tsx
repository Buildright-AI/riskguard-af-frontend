"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-foreground_alt transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-secondary hover:text-primary transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-secondary hover:text-primary transition-colors" />
      )}
    </button>
  );
}
