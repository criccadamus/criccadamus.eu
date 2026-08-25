/* eslint-disable react/set-state-in-effect */
import { useEffect, useState } from "react";

export function useParallaxScroll() {
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    // Set initial values after mount to avoid hydration mismatch
    setScrollY(window.scrollY);
    setViewportHeight(window.innerHeight);

    let ticking = false;

    const updateScrollY = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollY);
        ticking = true;
      }
    };

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { scrollY, viewportHeight };
}
