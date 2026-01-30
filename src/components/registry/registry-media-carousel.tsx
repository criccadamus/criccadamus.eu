import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const MEDIA_BASE_URL = "https://static.criccadamus.eu/registry/";
const MEDIA_CACHE_TTL_MS = 5 * 60 * 1000;

interface RegistryMediaCarouselProps {
  addon: string;
}

interface RegistryMediaResponse {
  items: string[];
}

type MediaType = "image" | "video";

interface RegistryMediaItem {
  key: string;
  url: string;
  type: MediaType;
  index: number;
}

function parseMediaItem(key: string): RegistryMediaItem | null {
  const filename = key.split("/").pop() ?? "";
  const baseName = filename.split(".")[0];
  const index = Number.parseInt(baseName, 10);
  if (!Number.isFinite(index)) return null;

  const lowerKey = key.toLowerCase();
  const type = lowerKey.endsWith(".webm") ? "video" : "image";

  return {
    key,
    url: `${MEDIA_BASE_URL}${key}`,
    type,
    index,
  };
}

export function RegistryMediaCarousel({ addon }: RegistryMediaCarouselProps) {
  const [mediaKeys, setMediaKeys] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasError, setHasError] = useState(false);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldLoad) return;
    if (!carouselRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;

    const cacheKey = `registry:media:${addon}`;
    const cacheTsKey = `${cacheKey}:ts`;

    try {
      const cached = localStorage.getItem(cacheKey);
      const cachedAt = Number(localStorage.getItem(cacheTsKey));
      if (cached && Number.isFinite(cachedAt) && Date.now() - cachedAt < MEDIA_CACHE_TTL_MS) {
        const parsed = JSON.parse(cached) as unknown;
        if (Array.isArray(parsed)) {
          setMediaKeys(parsed);
          return;
        }
      }
    } catch {
      // Ignore localStorage errors and fall back to network
    }

    let isActive = true;
    const controller = new AbortController();

    setIsLoading(true);
    setHasError(false);

    fetch(`/registry-media/${addon}/json`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load registry media.");
        }
        return res.json() as Promise<RegistryMediaResponse>;
      })
      .then((data) => {
        if (!isActive) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setMediaKeys(items);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(items));
          localStorage.setItem(cacheTsKey, String(Date.now()));
        } catch {
          // Ignore localStorage errors
        }
      })
      .catch((error) => {
        if (!isActive || controller.signal.aborted) return;
        setHasError(true);
        setMediaKeys([]);
        console.error(error);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [addon, shouldLoad]);

  const mediaItems = useMemo(() => {
    if (!mediaKeys) return [];
    return mediaKeys
      .map((key) => parseMediaItem(key))
      .filter((item): item is RegistryMediaItem => Boolean(item))
      .sort((a, b) => a.index - b.index || a.key.localeCompare(b.key));
  }, [mediaKeys]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [addon, mediaItems.length]);

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

  const scrollToIndex = (index: number) => {
    if (!trackRef.current) return;
    const target = itemRefs.current[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setCurrentIndex(index);
  };

  const handleScroll = () => {
    if (!trackRef.current) return;
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      if (!trackRef.current) return;
      const width = trackRef.current.clientWidth || 1;
      const nextIndex = Math.round(trackRef.current.scrollLeft / width);
      setCurrentIndex(nextIndex);
    });
  };

  const hasItems = mediaItems.length > 0;

  return (
    <div ref={carouselRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Gallery</p>
        {isLoading && <span className="text-[11px] text-muted-foreground">Loading...</span>}
      </div>

      {hasError && !isLoading && (
        <div className="text-xs text-muted-foreground">Media not available.</div>
      )}

      {!hasError && hasItems && (
        <div
          className="relative aspect-video overflow-hidden rounded-lg border border-border"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={trackRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
            onScroll={handleScroll}
          >
            {mediaItems.map((item, index) => (
              <div
                key={item.key}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="relative h-full min-w-full snap-start bg-black"
              >
                {item.type === "video" ? (
                  <video
                    className="h-full w-full object-cover"
                    src={item.url}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    className="h-full w-full object-cover"
                    src={item.url}
                    alt={`${addon} gallery ${item.index}`}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>

          {mediaItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  scrollToIndex((currentIndex - 1 + mediaItems.length) % mediaItems.length)
                }
                className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white transition-all duration-300 ${
                  showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <IconChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollToIndex((currentIndex + 1) % mediaItems.length)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white transition-all duration-300 ${
                  showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <IconChevronRight className="h-5 w-5" />
              </Button>

              <div
                className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all duration-300 ${
                  showControls
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                {mediaItems.map((item, index) => (
                  <button
                    key={item.key}
                    onClick={() => scrollToIndex(index)}
                    aria-label={`Go to media ${index + 1}`}
                    className="group relative h-2 w-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                  >
                    {currentIndex === index && (
                      <div
                        className="absolute inset-0 rounded-full animate-pulse"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(148, 163, 184, 0.6) 0%, transparent 70%)",
                          filter: "blur(6px)",
                          transform: "scale(2.5)",
                        }}
                      />
                    )}
                    <div
                      className={`relative h-full w-full rounded-full transition-all duration-300 ${
                        currentIndex === index
                          ? "bg-white/90 scale-150 shadow-lg shadow-white/30"
                          : "bg-white/40 group-hover:bg-white/70 group-hover:scale-125"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!hasError && !isLoading && mediaKeys && mediaItems.length === 0 && (
        <div className="text-xs text-muted-foreground">No media found.</div>
      )}
    </div>
  );
}
