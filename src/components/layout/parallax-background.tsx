/* eslint-disable react/set-state-in-effect */
import { useEffect, useRef, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useParallaxScroll } from "@/hooks/use-parallax-scroll";

export function ParallaxBackground() {
  const { scrollY, viewportHeight } = useParallaxScroll();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Check for reduced motion preference - init false to match SSR, update after mount
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Set initial value after mount to avoid hydration mismatch
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Track container height for clamping
  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Parallax configuration based on device and preferences
  const parallaxSpeed = prefersReducedMotion ? 0 : isMobile ? 0.4 : 0.2;
  const blurAmount = isMobile ? "6px" : "10px";

  // Calculate translateY with clamping to prevent background from scrolling out
  const rawTranslateY = -scrollY * parallaxSpeed;
  const maxTranslateY =
    containerHeight > viewportHeight ? -(containerHeight - viewportHeight) : 0;
  const translateY = Math.max(rawTranslateY, maxTranslateY);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base image layer with parallax transform */}
      <div
        ref={containerRef}
        className="parallax-container absolute inset-0 h-[calc(100%+200px)] w-full"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(1.1)`,
          willChange: "transform",
        }}
      >
        <img
          src="/bg/1.jpeg"
          alt=""
          className="h-full w-full object-cover object-center"
          style={{
            filter: `blur(${blurAmount})`,
            opacity: 0.5,
          }}
        />
      </div>

      {/* Dark radial gradient overlay - lighter in center, darker at edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.145 0 0 / 20%) 0%, oklch(0.145 0 0 / 60%) 100%)",
        }}
      />

      {/* Purple tint layer matching theme primary color */}
      <div
        className="absolute inset-0"
        style={{
          background: "oklch(0.59 0.2 277)",
          opacity: 0.08,
          mixBlendMode: "color",
        }}
      />

      {/* Noise/grain texture overlay */}
      <div className="grain-overlay absolute inset-0" />

      {/* Vignette effect - darkening at edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, oklch(0.145 0 0 / 35%) 100%)",
        }}
      />
    </div>
  );
}
