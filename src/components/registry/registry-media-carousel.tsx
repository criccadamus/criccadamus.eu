import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

const MEDIA_BASE_URL = "https://static.criccadamus.eu/";
const MEDIA_CACHE_TTL_MS = 5 * 60 * 1000;

interface RegistryMediaCarouselProps {
  addon: string;
  accentColor: string;
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
  if (!Number.isFinite(index)) {
    return null;
  }

  const lowerKey = key.toLowerCase();
  const type = lowerKey.endsWith(".webm") ? "video" : "image";

  return {
    key,
    url: `${MEDIA_BASE_URL}${key}`,
    type,
    index,
  };
}

// eslint-disable-next-line complexity
export function RegistryMediaCarousel({ addon, accentColor }: RegistryMediaCarouselProps) {
  const [mediaKeys, setMediaKeys] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [zoomedItem, setZoomedItem] = useState<RegistryMediaItem | null>(null);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollRafRef = useRef<number | null>(null);

  const handleMediaClick = (item: RegistryMediaItem) => {
    setZoomedItem(item);
  };

  const handleZoomClose = () => {
    setZoomedItem(null);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (zoomedItem) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [zoomedItem]);

  // Close modal on Escape key
  useEffect(() => {
    if (!zoomedItem) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleZoomClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedItem]);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }
    if (!carouselRef.current) {
      return;
    }

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
    if (!shouldLoad) {
      return;
    }

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
        if (!isActive) {
          return;
        }
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
        if (!isActive || controller.signal.aborted) {
          return;
        }
        setHasError(true);
        setMediaKeys([]);
        console.error(error);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [addon, shouldLoad]);

  const mediaItems = useMemo(() => {
    if (!mediaKeys) {
      return [];
    }
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
    if (!trackRef.current) {
      return;
    }
    const target = itemRefs.current[index];
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setCurrentIndex(index);
  };

  const handleScroll = () => {
    if (!trackRef.current) {
      return;
    }
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      if (!trackRef.current) {
        return;
      }
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
            className="scrollbar-hidden flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
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
                <button
                  onClick={() => handleMediaClick(item)}
                  className="h-full w-full cursor-zoom-in"
                  aria-label={`View ${item.type} ${item.index} in full size`}
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
                </button>
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
                className={`absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white transition-all duration-300 hover:bg-black/70 ${
                  showControls ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <IconChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollToIndex((currentIndex + 1) % mediaItems.length)}
                className={`absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white transition-all duration-300 hover:bg-black/70 ${
                  showControls ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <IconChevronRight className="h-5 w-5" />
              </Button>

              <div
                className={`absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-2 backdrop-blur-md transition-all duration-300 ${
                  showControls
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
                style={{
                  backgroundColor: `${accentColor}33`,
                  borderColor: `${accentColor}66`,
                  borderWidth: 1,
                }}
              >
                {mediaItems.map((item, index) => (
                  <button
                    key={item.key}
                    onClick={() => scrollToIndex(index)}
                    aria-label={`Go to media ${index + 1}`}
                    className="group relative h-2 w-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={
                      {
                        "--tw-ring-color": `${accentColor}80`,
                        "--tw-ring-offset-color": `${accentColor}33`,
                      } as React.CSSProperties
                    }
                  >
                    {currentIndex === index && (
                      <div
                        className="absolute inset-0 animate-pulse rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${accentColor}99 0%, transparent 70%)`,
                          filter: "blur(6px)",
                          transform: "scale(2.5)",
                        }}
                      />
                    )}
                    <div
                      className={`relative h-full w-full rounded-full transition-all duration-300 ${
                        currentIndex === index ? "scale-150" : "group-hover:scale-125"
                      }`}
                      style={{
                        backgroundColor: currentIndex === index ? accentColor : `${accentColor}66`,
                        boxShadow: currentIndex === index ? `0 0 8px ${accentColor}80` : undefined,
                      }}
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

      {/* Zoom Modal - rendered via portal to escape parent stacking context */}
      {zoomedItem &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={handleZoomClose}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                handleZoomClose();
              }
            }}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
            aria-label={`${addon} gallery ${zoomedItem.index}`}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomClose}
              className="absolute top-4 right-4 z-10 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <IconX className="h-6 w-6" />
            </Button>
            {zoomedItem.type === "video" ? (
              <video
                className="max-h-[90vh] max-w-[90vw]"
                src={zoomedItem.url}
                muted
                loop
                autoPlay
                playsInline
                controls
                onPointerDown={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                className="max-h-[90vh] max-w-[90vw] object-contain"
                src={zoomedItem.url}
                alt={`${addon} gallery ${zoomedItem.index}`}
                onPointerDown={(e) => e.stopPropagation()}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
