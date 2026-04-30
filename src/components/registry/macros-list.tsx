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
          <div className="h-3 rounded" style={{ backgroundColor: skeletonShade, width: "60%" }} />
          <div className="h-2.5 rounded" style={{ backgroundColor: skeletonShade, width: "40%" }} />
        </div>
        <div className="h-8 w-8 rounded" style={{ backgroundColor: skeletonShade }} />
      </div>
      <div className="space-y-2 rounded border border-transparent px-3 py-2">
        <div className="h-2.5 rounded" style={{ backgroundColor: skeletonShade, width: "85%" }} />
        <div className="h-2.5 rounded" style={{ backgroundColor: skeletonShade, width: "70%" }} />
        <div className="h-2.5 rounded" style={{ backgroundColor: skeletonShade, width: "60%" }} />
      </div>
    </div>
  );
}

export function MacrosList() {
  const isMobile = useIsMobile();
  const classOrder = Object.keys(wowClasses) as WowClass[];
  const [activeClass, setActiveClass] = useState<WowClass>(classOrder[0]);
  const [macrosByClass, setMacrosByClass] = useState<Record<WowClass, Macro[]>>(
    {} as Record<WowClass, Macro[]>,
  );
  const [updatedAtByClass, setUpdatedAtByClass] = useState<Record<WowClass, string | null>>(
    {} as Record<WowClass, string | null>,
  );
  const [isLoading, setIsLoading] = useState(false);
  const tabsRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tabsList = tabsRootRef.current?.querySelector<HTMLElement>("[data-slot='tabs-list']");
    if (tabsList) {
      tabsList.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    const tabsList = tabsRootRef.current?.querySelector<HTMLElement>("[data-slot='tabs-list']");
    if (!tabsList) {
      return;
    }

    const activeTrigger = tabsList.querySelector<HTMLElement>(
      "[data-slot='tabs-trigger'][data-active], [data-slot='tabs-trigger'][aria-selected='true']",
    );
    if (!activeTrigger) {
      return;
    }

    activeTrigger.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [activeClass]);

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
        const data = (await res.json()) as { updated_at?: string };
        if (data.updated_at) {
          storeUpdatedAt(data.updated_at);
        }
      } catch {
        // Ignore gist API errors
      }
    };

    const refreshMetadata = async () => {
      try {
        const res = await fetch(`/macros/${activeClass}/json`, { cache: "no-store" });
        const updatedAt = res.headers.get("x-last-updated") ?? res.headers.get("last-modified");
        if (updatedAt) {
          storeUpdatedAt(updatedAt);
        } else {
          await fetchMetadataFromGist();
        }
      } catch {
        // Ignore background refresh errors
      }
    };

    const applyClassState = (
      macros: Macro[],
      updatedAt: string | null,
    ) => {
      if (!cancelled) {
        setMacrosByClass((prev) => ({ ...prev, [activeClass]: macros }));
        setUpdatedAtByClass((prev) => ({ ...prev, [activeClass]: updatedAt }));
      }
    };

    const readCache = () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        const cachedAt = Number(localStorage.getItem(cacheTsKey));
        if (!cached || !Number.isFinite(cachedAt) || Date.now() - cachedAt >= cacheTtlMs) {
          return null;
        }

        const cachedMacros: unknown = JSON.parse(cached);
        if (!Array.isArray(cachedMacros)) {
          return null;
        }

        return {
          macros: cachedMacros as Macro[],
          updatedAt: localStorage.getItem(cacheUpdatedAtKey),
        };
      } catch {
        return null;
      }
    };

    const writeCache = (
      macros: Macro[],
      updatedAt: string | null,
    ) => {
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
          response.headers.get("x-last-updated") ?? response.headers.get("last-modified");
        const data: unknown = await response.json();
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
      <Tabs value={activeClass} onValueChange={(value) => setActiveClass(value as WowClass)}>
        <TabsList className="scrollbar-hidden w-full max-w-full justify-start gap-1 overflow-x-auto rounded-lg bg-muted/80 p-1">
          {classOrder.map((classKey) => {
            const classConfig = wowClasses[classKey];
            const dotBorderColor = classKey === "priest" ? "rgba(15, 23, 42, 0.35)" : "transparent";
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
                  <div className="text-xs text-muted-foreground">No macros found.</div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
