import { useEffect, useState } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean | undefined>(() => {
    try {
      return document.documentElement.classList.contains("dark");
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const nextIsDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(nextIsDarkMode);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
