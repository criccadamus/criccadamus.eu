/* eslint-disable react/set-state-in-effect */
import { useEffect, useState } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean | undefined>(undefined);

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    // Set initial value after mount to avoid hydration mismatch
    setIsDark(document.documentElement.classList.contains("dark"));

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const nextIsDarkMode =
        document.documentElement.classList.contains("dark");
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
