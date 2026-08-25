import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function mediaCacheKeys(addon: string) {
  const base = `registry:media:${addon}`;
  return { items: base, ts: `${base}:ts` };
}

function readFreshMediaCache(addon: string): string[] | null {
  try {
    const keys = mediaCacheKeys(addon);
    const cached = localStorage.getItem(keys.items);
    const cachedAt = Number(localStorage.getItem(keys.ts));
    if (
      !cached ||
      !Number.isFinite(cachedAt) ||
      Date.now() - cachedAt >= MEDIA_CACHE_TTL_MS
    ) {
      return null;
    }
    // SAFETY: localStorage content is untrusted text; parse to unknown before structural checks
    const parsed = JSON.parse(cached) as unknown;
    // SAFETY: cached value was previously stringified string[]; Array.isArray guards foreign garbage
    return Array.isArray(parsed) ? (parsed as string[]) : null;
  } catch {
    // Ignore localStorage errors and fall back to network
    return null;
  }
}

function writeMediaCache(addon: string, items: string[]) {
  try {
    const keys = mediaCacheKeys(addon);
    localStorage.setItem(keys.items, JSON.stringify(items));
    localStorage.setItem(keys.ts, String(Date.now()));
  } catch {
    // Ignore localStorage write errors
  }
}

interface MediaZoomModalProps {
  item: RegistryMediaItem;
  addon: string;
  hasNavigation: boolean;
  onClose: () => void;
  onMove: (delta: number) => void;
}

function MediaZoomModal({
  item,
  addon,
  hasNavigation,
  onClose,
  onMove,
}: MediaZoomModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // Lock body scroll while the zoom modal is open
    const ownerDocument = dialogRef.current?.ownerDocument ?? document;
    const originalOverflow = ownerDocument.body.style.overflow;
    ownerDocument.body.style.overflow = "hidden";

    return () => {
      ownerDocument.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    // Close or navigate the zoomed media with keyboard
    const ownerDocument = dialogRef.current?.ownerDocument ?? document;
    const ownerWindow = ownerDocument.defaultView ?? window;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onMove(1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onMove(-1);
      }
    };

    ownerWindow.addEventListener("keydown", handleKeyDown);
    return () => ownerWindow.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onMove]);

  useEffect(() => {
    dialogRef.current?.focus();

    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    dialog.addEventListener("click", handleClick);
    return () => dialog.removeEventListener("click", handleClick);
  }, [onClose]);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 flex h-screen max-h-screen w-screen max-w-screen items-center justify-center border-0 bg-black/95 p-0"
      aria-label={`${addon} gallery ${item.index}`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/70 hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <IconX className="h-6 w-6" />
      </Button>
      {hasNavigation && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(-1)}
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20"
            aria-label="Previous media"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(1)}
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20"
            aria-label="Next media"
          >
            <IconChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
      {item.type === "video" ? (
        <video
          className="max-h-[90vh] max-w-[90vw]"
          src={item.url}
          muted
          loop
          autoPlay
          playsInline
          controls
          aria-label={`${addon} gallery video ${item.index}`}
        />
      ) : (
        <img
          className="max-h-[90vh] max-w-[90vw] object-contain"
          src={item.url}
          alt={`${addon} gallery ${item.index}`}
        />
      )}
    </dialog>,
    document.body,
  );
}

export function RegistryMediaCarousel({
  addon,
  accentColor,
}: RegistryMediaCarouselProps) {
  const [mediaKeys, setMediaKeys] = useState<string[] | null>(() =>
    readFreshMediaCache(addon),
  );
  const [showControls, setShowControls] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [zoomedItem, setZoomedItem] = useState<RegistryMediaItem | null>(null);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollRafRef = useRef<number | null>(null);

  const scheduleHide = useCallback((delayMs = 2000) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, delayMs);
  }, []);

  const handleMouseEnter = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    scheduleHide();
  };

  // Hide controls after initial reveal once the user has not interacted
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
  }, []);

  const handleZoomClose = useCallback(() => {
    setZoomedItem(null);
  }, []);

  const mediaItems = useMemo(() => {
    if (!mediaKeys) {
      return [];
    }
    const parsedItems = mediaKeys
      .map((key) => parseMediaItem(key))
      .filter((item): item is RegistryMediaItem => Boolean(item));

    const sortedItems: RegistryMediaItem[] = [];
    for (const item of parsedItems) {
      const insertAt = sortedItems.findIndex(
        (current) =>
          current.index > item.index ||
          (current.index === item.index && current.key > item.key),
      );
      if (insertAt === -1) {
        sortedItems.push(item);
      } else {
        sortedItems.splice(insertAt, 0, item);
      }
    }

    return sortedItems;
  }, [mediaKeys]);

  const moveZoom = useCallback(
    (delta: number) => {
      if (mediaItems.length < 2) {
        return;
      }

      setZoomedItem((current) => {
        if (!current) {
          return current;
        }

        const currentZoomIndex = mediaItems.findIndex(
          (item) => item.key === current.key,
        );
        if (currentZoomIndex === -1) {
          return current;
        }

        const nextIndex =
          (currentZoomIndex + delta + mediaItems.length) % mediaItems.length;
        return mediaItems[nextIndex] ?? current;
      });
    },
    [mediaItems],
  );

  useEffect(() => {
    if (shouldLoad) {
      return undefined;
    }
    if (!carouselRef.current) {
      return undefined;
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
    if (!shouldLoad || mediaKeys !== null) {
      return undefined;
    }

    let isActive = true;
    const controller = new AbortController();

    fetch(`/registry-media/${addon}/json`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load registry media.");
        }
        // SAFETY: registry-media endpoint returns { items: string[] }; validated via Array.isArray below
        const data: RegistryMediaResponse = await res.json();
        return data;
      })
      .then((data) => {
        if (!isActive) {
          return null;
        }
        const items = Array.isArray(data.items) ? data.items : [];
        setMediaKeys(items);
        writeMediaCache(addon, items);
        return null;
      })
      .catch((error) => {
        if (!isActive || controller.signal.aborted) {
          return;
        }
        setHasError(true);
        setMediaKeys([]);
        console.error(error);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [addon, shouldLoad, mediaKeys]);

  const scrollToIndex = (index: number) => {
    if (!trackRef.current) {
      return;
    }
    const target = itemRefs.current[index];
    if (!target) {
      return;
    }
    target.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
    setCurrentIndex(index);
    scheduleHide(3000);
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
      scheduleHide(3000);
    });
  };

  const hasItems = mediaItems.length > 0;
  const hasZoomNavigation = mediaItems.length > 1;
  // Loading is exactly the phase between intersection triggering the fetch and media keys arriving
  const isLoading = shouldLoad && mediaKeys === null;

  return (
    <div ref={carouselRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Gallery</p>
        {isLoading && (
          <span className="text-[11px] text-muted-foreground">Loading...</span>
        )}
      </div>

      {hasError && !isLoading && (
        <div className="text-xs text-muted-foreground">
          Media not available.
        </div>
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
                  onClick={() => setZoomedItem(item)}
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
                      aria-label={`${addon} gallery preview ${item.index}`}
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
                  scrollToIndex(
                    (currentIndex - 1 + mediaItems.length) % mediaItems.length,
                  )
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
                onClick={() =>
                  scrollToIndex((currentIndex + 1) % mediaItems.length)
                }
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
                      // SAFETY: CSS variable keys are known custom properties; values are derived from validated accentColor string
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
                        currentIndex === index
                          ? "scale-150"
                          : "group-hover:scale-125"
                      }`}
                      style={{
                        backgroundColor:
                          currentIndex === index
                            ? accentColor
                            : `${accentColor}66`,
                        boxShadow:
                          currentIndex === index
                            ? `0 0 8px ${accentColor}80`
                            : undefined,
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
      {zoomedItem && (
        <MediaZoomModal
          item={zoomedItem}
          addon={addon}
          hasNavigation={hasZoomNavigation}
          onClose={handleZoomClose}
          onMove={moveZoom}
        />
      )}
    </div>
  );
}
