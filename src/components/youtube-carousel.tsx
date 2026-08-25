import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { playlistItems } from "@/data/playlists";

export function YouTubeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const items = playlistItems;

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const currentItem = items[currentIndex];
  const embedUrl = `https://www.youtube.com/embed/${currentItem.videoId}?list=${currentItem.playlistId}&mute=1`;

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-lg border border-border"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 className="sr-only">Youtube</h2>
      {/* SAFETY: YouTube player requires cookie/storage access; origin pinned to youtube.com embeds */}
      <iframe
        key={currentIndex}
        src={embedUrl}
        title={currentItem.title}
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation allow-popups-to-escape-sandbox"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />

      {/* Floating navigation buttons */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevItem}
            className={`absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white transition-all duration-300 hover:bg-black/70 ${
              showControls ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <IconChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextItem}
            className={`absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white transition-all duration-300 hover:bg-black/70 ${
              showControls ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <IconChevronRight className="h-5 w-5" />
          </Button>

          {/* Playlist indicators with glassmorphic tooltips */}
          <div
            className={`absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md transition-all duration-300 ${
              showControls
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {hoveredIndex === index && (
                  <div
                    className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 animate-in rounded-md border border-white/20 bg-black/80 px-3 py-1.5 text-xs whitespace-nowrap text-white backdrop-blur-xl duration-200 fade-in slide-in-from-bottom-2"
                    style={{
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    {item.title}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2">
                      <div className="h-0 w-0 border-t-4 border-r-4 border-l-4 border-t-white/20 border-r-transparent border-l-transparent" />
                    </div>
                  </div>
                )}

                {/* Indicator button */}
                <button
                  onClick={() => setCurrentIndex(index)}
                  className="group relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                  aria-label={`Go to ${item.title}`}
                >
                  {/* Glow effect for active indicator */}
                  {currentIndex === index && (
                    <div
                      className="absolute inset-0 animate-pulse rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)",
                        filter: "blur(6px)",
                        transform: "scale(2.5)",
                      }}
                    />
                  )}

                  {/* Indicator bar */}
                  <div
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? "scale-150 bg-linear-to-r from-violet-400 to-purple-500 shadow-lg shadow-purple-500/50"
                        : "bg-white/40 group-hover:scale-125 group-hover:bg-white/70"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Current playlist title overlay */}
          <div
            className={`absolute top-4 left-4 rounded-md border border-white/10 bg-black/60 px-3 py-1.5 text-sm font-medium tracking-wide text-white backdrop-blur-md transition-all duration-300 ${
              showControls
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            {currentItem.title}
          </div>
        </>
      )}
    </div>
  );
}
