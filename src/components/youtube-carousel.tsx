import * as React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface PlaylistItem {
  videoId: string;
  playlistId: string;
  title: string;
}

function parseYouTubeUrl(url: string): { videoId: string; playlistId: string } {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  const videoId = urlParams.get("v") || "";
  const playlistId = urlParams.get("list") || "";
  return { videoId, playlistId };
}

export function YouTubeCarousel() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [showControls, setShowControls] = React.useState(true);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

  React.useEffect(() => {
    // Initially hide controls after 3 seconds
    const initialTimeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      clearTimeout(initialTimeout);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [currentIndex]);

  const items: PlaylistItem[] = [
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=BBxqw9r5FZU&list=PLoGa9G4mB1GhdBdQdwnrnyYZLdCrQENxo",
      ),
      title: "FFXIV: Dawntrail post-game",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=tC_akewvR0o&list=PLoGa9G4mB1GhuIYeYE-6WKmQbe7Ags6OC",
      ),
      title: "FFXIV: Dawntrail MSQ",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=O4jALVwmpGA&list=PLoGa9G4mB1Gha-vfKxoS8yHWYCeUd4ZYk",
      ),
      title: "FFXIV: Endwalker",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=6mgUiB2Fuao&list=PLoGa9G4mB1GgUtOByPIgVHFpM-JrnKVxr",
      ),
      title: "FFXVI",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=OTArZvgOSYg&list=PLoGa9G4mB1Gjp1XLknZJPNskHtgpg-gko",
      ),
      title: "Crisis Core: a FF Story",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=4FJjiFFe4xg&list=PLoGa9G4mB1GiCRnSKzuIJ3ilHrsfdFGP9",
      ),
      title: "FFXV",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=xDp9uChxJls&list=PLoGa9G4mB1GhCiHDLtemmfq6b1cge42AW",
      ),
      title: "FFVII Remake",
    },
  ];

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
      <iframe
        key={currentIndex}
        src={embedUrl}
        title={currentItem.title}
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
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white transition-all duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <IconChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextItem}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white transition-all duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <IconChevronRight className="h-5 w-5" />
          </Button>

          {/* Playlist indicators with glassmorphic tooltips */}
          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all duration-300 ${
              showControls
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
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
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-black/80 backdrop-blur-xl border border-white/20 text-white text-xs whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    {item.title}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/20" />
                    </div>
                  </div>
                )}

                {/* Indicator button */}
                <button
                  onClick={() => setCurrentIndex(index)}
                  className="group relative w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                  aria-label={`Go to ${item.title}`}
                >
                  {/* Glow effect for active indicator */}
                  {currentIndex === index && (
                    <div
                      className="absolute inset-0 rounded-full animate-pulse"
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
                    className={`relative w-full h-full rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? "bg-gradient-to-r from-violet-400 to-purple-500 scale-150 shadow-lg shadow-purple-500/50"
                        : "bg-white/40 group-hover:bg-white/70 group-hover:scale-125"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Current playlist title overlay */}
          <div
            className={`absolute top-4 left-4 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm font-medium tracking-wide transition-all duration-300 ${
              showControls
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {currentItem.title}
          </div>
        </>
      )}
    </div>
  );
}
