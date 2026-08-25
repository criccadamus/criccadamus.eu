import { useEffect, useState } from "react";

export function useParallaxScroll() {
  const [scrollY, setScrollY] = useState(() => {
    try {
      return window.scrollY;
    } catch {
      return 0;
    }
  });
  const [viewportHeight, setViewportHeight] = useState(() => {
    try {
      return window.innerHeight;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
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
