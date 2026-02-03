import { IconCopy } from "@tabler/icons-react";
import { useSearch } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import type { WowAddonConfig } from "@/lib/wow-addons";

import { RegistryMediaCarousel } from "@/components/registry/registry-media-carousel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileGists } from "@/data/gists";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface RegistryItemCardProps {
  name: string;
  title: string;
  description: string;
  addon: string;
  addonConfig: WowAddonConfig;
}

interface RegistryJsonFile {
  path: string;
  content: string;
  type: string;
}

interface RegistryJson {
  files: RegistryJsonFile[];
}

export function RegistryItemCard({
  name,
  title,
  description,
  addon,
  addonConfig,
}: RegistryItemCardProps) {
  const registryUrl = `https://criccadamus.eu/r/${name}.json`;
  const [profileString, setProfileString] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const search = useSearch({ from: "/registry" }) as { tab?: string };
  const selectedTab =
    search.tab && ["string", "npm", "yarn", "pnpm", "bun"].includes(search.tab)
      ? search.tab
      : "string";
  const tabsListRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    const cacheVersion = "v2";
    const cacheKey = `registry:profile:${cacheVersion}:${name}`;
    const cacheTsKey = `${cacheKey}:ts`;
    const cacheUpdatedAtKey = `${cacheKey}:updatedAt`;
    const cacheTtlMs = 5 * 60 * 1000;

    const fetchUpdatedAtFromGist = async () => {
      const gistId = profileGists[name];
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
          setLastUpdated(data.updated_at);
          localStorage.setItem(cacheUpdatedAtKey, data.updated_at);
        }
      } catch {
        // Ignore gist API errors
      }
    };

    const refreshUpdatedAt = async () => {
      try {
        const res = await fetch(`/r/${name}.json`, { cache: "no-store" });
        const updatedAt = res.headers.get("x-last-updated") ?? res.headers.get("last-modified");
        if (updatedAt) {
          setLastUpdated(updatedAt);
          localStorage.setItem(cacheUpdatedAtKey, updatedAt);
        } else {
          await fetchUpdatedAtFromGist();
        }
      } catch {
        // Ignore background refresh errors
      }
    };

    try {
      const cached = localStorage.getItem(cacheKey);
      const cachedAt = Number(localStorage.getItem(cacheTsKey));
      if (cached && Number.isFinite(cachedAt) && Date.now() - cachedAt < cacheTtlMs) {
        setProfileString(cached);
        const cachedUpdatedAt = localStorage.getItem(cacheUpdatedAtKey);
        if (cachedUpdatedAt) {
          setLastUpdated(cachedUpdatedAt);
        } else {
          void refreshUpdatedAt();
        }
        return;
      }
    } catch {
      // Ignore localStorage errors and fall back to network
    }

    fetch(`/r/${name}.json`)
      .then(async (res) => {
        const updatedAt = res.headers.get("x-last-updated") ?? res.headers.get("last-modified");
        const data = (await res.json()) as RegistryJson;
        return { data, updatedAt };
      })
      .then(({ data, updatedAt }) => {
        const content = data.files?.[0]?.content ?? null;
        setProfileString(content);
        if (updatedAt) {
          setLastUpdated(updatedAt);
        } else {
          void fetchUpdatedAtFromGist();
        }
        if (content) {
          try {
            localStorage.setItem(cacheKey, content);
            localStorage.setItem(cacheTsKey, String(Date.now()));
            if (updatedAt) {
              localStorage.setItem(cacheUpdatedAtKey, updatedAt);
            }
          } catch {
            // Ignore localStorage write errors
          }
        }
      })
      .catch(() => setProfileString(null));
  }, [name]);

  const commands = [
    { id: "string", label: "string", color: "#6b7280" },
    { id: "npm", label: "npm", color: "#cb3837" },
    { id: "yarn", label: "yarn", color: "#2c8ebb" },
    { id: "pnpm", label: "pnpm", color: "#f9ad00" },
    { id: "bun", label: "bun", color: "#fbf0df" },
  ] as const;
  const commandValues = {
    npm: `npx shadcn@latest add ${registryUrl}`,
    yarn: `yarn dlx shadcn@latest add ${registryUrl}`,
    pnpm: `pnpm dlx shadcn@latest add ${registryUrl}`,
    bun: `bunx shadcn@latest add ${registryUrl}`,
  } as const;

  const copy = (text: string, message = "Copied") => {
    void navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const formattedUpdatedAt = lastUpdated
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lastUpdated))
    : null;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3",
        "rounded-lg border p-4",
        "transition-all duration-300 ease-in-out",
        addonConfig.border,
        addonConfig.bg,
        isMobile && "text-foreground **:text-foreground",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <Tabs defaultValue={selectedTab} className="w-full">
        <TabsList
          ref={tabsListRef}
          className="scrollbar-hidden w-full max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/80 p-1"
        >
          {commands.map((command) => {
            const needsBorder = command.id === "bun";
            return (
              <TabsTrigger
                key={command.id}
                value={command.id}
                className="shrink-0 text-foreground/75 data-active:text-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2 rounded-full border"
                    style={{
                      backgroundColor: command.color,
                      borderColor: needsBorder ? "rgba(15, 23, 42, 0.35)" : "transparent",
                    }}
                  />
                  {command.label}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {(["npm", "yarn", "pnpm", "bun"] as const).map((runtime) => (
          <TabsContent key={runtime} value={runtime}>
            <div className="mt-2 flex items-center gap-2">
              <code className="scrollbar-hidden flex-1 rounded border border-border bg-muted/50 px-3 py-2 font-mono text-xs break-all text-muted-foreground">
                {commandValues[runtime]}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => copy(commandValues[runtime], "Command copied")}
              >
                <IconCopy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        ))}
        <TabsContent value="string">
          <div className="mt-2 flex min-w-0 items-start gap-2">
            <code className="scrollbar-hidden min-w-0 flex-1 overflow-x-auto rounded border border-border bg-muted/50 px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-foreground">
              {profileString ?? "Loading..."}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={!profileString}
              onClick={() => profileString && copy(profileString, "Profile string copied")}
            >
              <IconCopy className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-[0.625rem] text-muted-foreground">
        Last updated: {formattedUpdatedAt ?? "Unknown"}
      </p>

      <RegistryMediaCarousel addon={addon} accentColor={addonConfig.color} />
    </div>
  );
}
