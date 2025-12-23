import * as React from "react";
import { useParallaxScroll } from "@/hooks/use-parallax-scroll";
import { useIsMobile } from "@/hooks/use-mobile";

export function ParallaxBackground() {
  const scrollY = useParallaxScroll();
  const isMobile = useIsMobile();

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Parallax configuration based on device and preferences
  const parallaxSpeed = prefersReducedMotion ? 0 : isMobile ? 0.4 : 0.2;
  const blurAmount = isMobile ? "6px" : "10px";
  const translateY = -scrollY * parallaxSpeed;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base image layer with parallax transform */}
      <div
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
