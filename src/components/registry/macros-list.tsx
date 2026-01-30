import { useEffect, useState } from "react";

import type { WowClass } from "@/lib/wow-classes";

import { MacroCard } from "@/components/registry/macro-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { wowClasses } from "@/lib/wow-classes";

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
  const classOrder = Object.keys(wowClasses) as WowClass[];
  const [activeClass, setActiveClass] = useState<WowClass>(classOrder[0]);
  const [macrosByClass, setMacrosByClass] = useState<Record<WowClass, Macro[]>>(
    {} as Record<WowClass, Macro[]>,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
    const cacheKey = `registry:macros:${activeClass}`;
    const cacheTsKey = `${cacheKey}:ts`;
    const cacheTtlMs = 5 * 60 * 1000;
    const minSkeletonMs = 300;

    const loadMacros = async () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        const cachedAt = Number(localStorage.getItem(cacheTsKey));
        if (cached && Number.isFinite(cachedAt) && Date.now() - cachedAt < cacheTtlMs) {
          const cachedMacros = JSON.parse(cached) as unknown;
          if (Array.isArray(cachedMacros)) {
            if (!cancelled) {
              setMacrosByClass((prev) => ({
                ...prev,
                [activeClass]: cachedMacros as Macro[],
              }));
            }
            return;
          }
        }
      } catch {
        // Ignore localStorage errors and fall back to network
      }

      const loadingStartedAt = Date.now();
      setIsLoading(true);
      try {
        const response = await fetch(`/macros/${activeClass}/json`);
        const data = (await response.json()) as unknown;
        const macros = Array.isArray(data) ? (data as Macro[]) : [];
        if (!cancelled) {
          setMacrosByClass((prev) => ({ ...prev, [activeClass]: macros }));
        }
        if (macros.length > 0) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(macros));
            localStorage.setItem(cacheTsKey, String(Date.now()));
          } catch {
            // Ignore localStorage write errors
          }
        }
      } catch {
        if (!cancelled) {
          setMacrosByClass((prev) => ({ ...prev, [activeClass]: [] }));
        }
      } finally {
        if (!cancelled) {
          const elapsed = Date.now() - loadingStartedAt;
          const remaining = Math.max(0, minSkeletonMs - elapsed);
          if (remaining > 0) {
            loadingTimeout = setTimeout(() => {
              if (!cancelled) setIsLoading(false);
            }, remaining);
          } else {
            setIsLoading(false);
          }
        }
      }
    };

    void loadMacros();

    return () => {
      cancelled = true;
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [activeClass]);

  return (
    <Tabs value={activeClass} onValueChange={(value) => setActiveClass(value as WowClass)}>
      <TabsList>
        {classOrder.map((classKey) => {
          const classConfig = wowClasses[classKey];
          return (
            <TabsTrigger key={classKey} value={classKey} style={{ color: classConfig.color }}>
              {classConfig.name}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {classOrder.map((classKey) => {
        const classConfig = wowClasses[classKey];
        const macros = macrosByClass[classKey];
        return (
          <TabsContent key={classKey} value={classKey}>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
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
  );
}
