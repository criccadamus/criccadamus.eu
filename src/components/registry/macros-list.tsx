import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { MacroCard } from "@/components/registry/macro-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { classGists } from "@/data/gists";
import { useIsMobile } from "@/hooks/use-mobile";
import { wowClasses, type WowClass } from "@/lib/wow-classes";

interface Macro {
  name: string;
  spec?: string;
  macro: string;
}

function MacroCardSkeleton({ color }: { color: string }) {
  const skeletonShade = `${color}33`;
  const surfaceShade = `${color}1A`;

  return (
    <div
      className="flex min-w-0 animate-pulse flex-col gap-3 overflow-hidden rounded-lg border p-4"
      style={{ borderColor: color, backgroundColor: surfaceShade }}
    >
      <div className="flex items-center justify-between">
        <div className="w-full space-y-2">
          <div
            className="h-3 rounded"
            style={{ backgroundColor: skeletonShade, width: "60%" }}
          />
          <div
            className="h-2.5 rounded"
            style={{ backgroundColor: skeletonShade, width: "40%" }}
          />
        </div>
        <div
          className="h-8 w-8 rounded"
          style={{ backgroundColor: skeletonShade }}
        />
      </div>
      <div className="space-y-2 rounded border border-transparent px-3 py-2">
        <div
          className="h-2.5 rounded"
          style={{ backgroundColor: skeletonShade, width: "85%" }}
        />
        <div
          className="h-2.5 rounded"
          style={{ backgroundColor: skeletonShade, width: "70%" }}
        />
        <div
          className="h-2.5 rounded"
          style={{ backgroundColor: skeletonShade, width: "60%" }}
        />
      </div>
    </div>
  );
}

function isWowClass(value: string): value is WowClass {
  return value in wowClasses;
}

export function MacrosList() {
  const isMobile = useIsMobile();
  // SAFETY: wowClasses is defined with WowClass keys; Object.keys returns those exact keys at runtime
  const classOrder = Object.keys(wowClasses) as WowClass[];
  // SAFETY: /profiles search is validated to { macro?: string, profile?: string }; shape trusted from validateSearch
  const search = useSearch({ from: "/profiles" });
  const navigate = useNavigate({ from: "/profiles" });
  const initialClass =
    search.macro !== undefined &&
    isWowClass(search.macro) &&
    wowClasses[search.macro]
      ? search.macro
      : classOrder[0];
  const [activeClass, setActiveClass] = useState<WowClass>(initialClass);

  const handleClassChange = (value: string) => {
    if (!isWowClass(value)) {
      return;
    }
    const classKey = value;
    setActiveClass(classKey);
    void navigate({
      search: (prev) => ({ ...prev, macro: classKey }),
      replace: true,
      resetScroll: false,
    });
  };
  // SAFETY: empty record is valid initial cache before any class loads
  const [macrosByClass, setMacrosByClass] = useState<Record<WowClass, Macro[]>>(
    // SAFETY: empty record is valid initial cache before any class loads; entries populated on demand
    {} as Record<WowClass, Macro[]>,
  );
  // SAFETY: empty record is valid initial cache before any class loads
  const [updatedAtByClass, setUpdatedAtByClass] = useState<
    Record<WowClass, string | null>
  >(
    // SAFETY: empty record is valid initial cache before any class loads; entries populated on demand
    {} as Record<WowClass, string | null>,
  );
  const [isLoading, setIsLoading] = useState(false);
  const tabsRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tabsList = tabsRootRef.current?.querySelector<HTMLElement>(
      "[data-slot='tabs-list']",
    );
    if (tabsList) {
      tabsList.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
    const cacheVersion = "v3";
    const cacheKey = `registry:macros:${cacheVersion}:${activeClass}`;
    const cacheTsKey = `${cacheKey}:ts`;
    const cacheUpdatedAtKey = `${cacheKey}:updatedAt`;
    const cacheTtlMs = 5 * 60 * 1000;
    const minSkeletonMs = 300;

    const storeUpdatedAt = (updatedAt: string | null) => {
      if (!updatedAt) {
        return;
      }
      setUpdatedAtByClass((prev) => ({ ...prev, [activeClass]: updatedAt }));
      localStorage.setItem(cacheUpdatedAtKey, updatedAt);
    };

    const fetchMetadataFromGist = async () => {
      const gistId = classGists[activeClass];
      if (!gistId) {
        return;
      }
      try {
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: { accept: "application/vnd.github+json" },
        });
        if (!res.ok) {
          return;
        }
        // SAFETY: GitHub gist API returns object with optional updated_at; shape validated via property check
        const data: { updated_at?: string } = await res.json();
        if (data.updated_at) {
          storeUpdatedAt(data.updated_at);
        }
      } catch {
        // Ignore gist API errors
      }
    };

    const refreshMetadata = async () => {
      try {
        const res = await fetch(`/macros/${activeClass}/json`, {
          cache: "no-store",
        });
        const updatedAt =
          res.headers.get("x-last-updated") ?? res.headers.get("last-modified");
        if (updatedAt) {
          storeUpdatedAt(updatedAt);
        } else {
          await fetchMetadataFromGist();
        }
      } catch {
        // Ignore background refresh errors
      }
    };

    const applyClassState = (macros: Macro[], updatedAt: string | null) => {
      if (!cancelled) {
        setMacrosByClass((prev) => ({ ...prev, [activeClass]: macros }));
        setUpdatedAtByClass((prev) => ({ ...prev, [activeClass]: updatedAt }));
      }
    };

    const readCache = () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        const cachedAt = Number(localStorage.getItem(cacheTsKey));
        if (
          !cached ||
          !Number.isFinite(cachedAt) ||
          Date.now() - cachedAt >= cacheTtlMs
        ) {
          return null;
        }

        const cachedMacros: unknown = JSON.parse(cached);
        if (!Array.isArray(cachedMacros)) {
          return null;
        }

        return {
          // SAFETY: cached JSON was previously stringified Macro[]; Array.isArray check passed, shape trusted from same app
          macros: cachedMacros as Macro[],
          updatedAt: localStorage.getItem(cacheUpdatedAtKey),
        };
      } catch {
        return null;
      }
    };

    const writeCache = (macros: Macro[], updatedAt: string | null) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(macros));
        localStorage.setItem(cacheTsKey, String(Date.now()));
        if (updatedAt) {
          localStorage.setItem(cacheUpdatedAtKey, updatedAt);
        }
      } catch {
        // Ignore localStorage write errors
      }
    };

    const fetchMacrosFromNetwork = async () => {
      try {
        const response = await fetch(`/macros/${activeClass}/json`);
        const updatedAt =
          response.headers.get("x-last-updated") ??
          response.headers.get("last-modified");
        const data: unknown = await response.json();
        // SAFETY: response JSON is expected to be Macro[]; Array.isArray confirms array, elements validated by MacroCard rendering
        const macros = Array.isArray(data) ? (data as Macro[]) : [];
        return { macros, updatedAt };
      } catch {
        return { macros: null, updatedAt: null };
      }
    };

    const finishLoading = (loadingStartedAt: number) => {
      if (cancelled) {
        return;
      }

      const elapsed = Date.now() - loadingStartedAt;
      const remaining = Math.max(0, minSkeletonMs - elapsed);
      if (remaining > 0) {
        loadingTimeout = setTimeout(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        }, remaining);
      } else {
        setIsLoading(false);
      }
    };

    const loadMacros = async () => {
      const cached = readCache();
      if (cached) {
        applyClassState(cached.macros, cached.updatedAt);
        if (!cached.updatedAt) {
          void refreshMetadata();
        }
        return;
      }

      const loadingStartedAt = Date.now();
      setIsLoading(true);
      const result = await fetchMacrosFromNetwork();
      if (result.macros) {
        applyClassState(result.macros, result.updatedAt);
        if (!result.updatedAt) {
          void fetchMetadataFromGist();
        }
        if (result.macros.length > 0) {
          writeCache(result.macros, result.updatedAt);
        }
      } else if (!cancelled) {
        setMacrosByClass((prev) => ({ ...prev, [activeClass]: [] }));
      }

      finishLoading(loadingStartedAt);
    };

    void loadMacros();

    return () => {
      cancelled = true;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [activeClass]);

  return (
    <div ref={tabsRootRef}>
      <Tabs value={activeClass} onValueChange={handleClassChange}>
        <TabsList className="scrollbar-hidden w-full max-w-full justify-start gap-1 overflow-x-auto rounded-lg bg-muted/80 p-1">
          {classOrder.map((classKey) => {
            const classConfig = wowClasses[classKey];
            const dotBorderColor =
              classKey === "priest" ? "rgba(15, 23, 42, 0.35)" : "transparent";
            return (
              <TabsTrigger
                key={classKey}
                value={classKey}
                className="shrink-0 text-foreground/75 data-active:text-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2 rounded-full border"
                    style={{
                      backgroundColor: classConfig.color,
                      borderColor: dotBorderColor,
                    }}
                  />
                  {classConfig.name}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {classOrder.map((classKey) => {
          const classConfig = wowClasses[classKey];
          const macros = macrosByClass[classKey];
          const updatedAt = updatedAtByClass[classKey];
          const formattedUpdatedAt = updatedAt
            ? new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(updatedAt))
            : null;
          return (
            <TabsContent key={classKey} value={classKey}>
              <div
                className={`mt-3 text-[0.625rem] ${isMobile ? "text-white/60" : "text-muted-foreground"}`}
              >
                Last updated: {formattedUpdatedAt ?? "Unknown"}
              </div>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {macros?.map((macro) => (
                  <MacroCard
                    key={macro.name}
                    name={macro.name}
                    spec={macro.spec}
                    macro={macro.macro}
                    classConfig={classConfig}
                  />
                ))}
                {!macros && isLoading && (
                  <>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <MacroCardSkeleton
                        key={`${classKey}-skeleton-${index}`}
                        color={classConfig.color}
                      />
                    ))}
                  </>
                )}
                {macros && macros.length === 0 && !isLoading && (
                  <div className="text-xs text-muted-foreground">
                    No macros found.
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
