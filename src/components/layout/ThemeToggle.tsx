
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
      className="transition-apple hover:bg-secondary-100/20 dark:hover:bg-secondary-900/20"
    >
      {isDarkMode ? (
        <Sun size={20} className="text-secondary-400 transition-apple animate-fadeIn" />
      ) : (
        <Moon size={20} className="text-secondary-400 transition-apple animate-fadeIn" />
      )}
      <span className="sr-only">{isDarkMode ? "Light mode" : "Dark mode"}</span>
    </Button>
  );
};
