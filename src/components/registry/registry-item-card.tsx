import { IconCopy } from "@tabler/icons-react";
import { useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import type { WowAddonConfig } from "@/lib/wow-addons";

import { RegistryMediaCarousel } from "@/components/registry/registry-media-carousel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const search = useSearch({ from: "/registry" });
  const selectedTab =
    search.tab && ["string", "npm", "pnpm", "bun"].includes(search.tab) ? search.tab : "string";

  useEffect(() => {
    const cacheVersion = "v2";
    const cacheKey = `registry:profile:${cacheVersion}:${name}`;
    const cacheTsKey = `${cacheKey}:ts`;
    const cacheUpdatedAtKey = `${cacheKey}:updatedAt`;
    const cacheTtlMs = 5 * 60 * 1000;

    const refreshUpdatedAt = async () => {
      try {
        const res = await fetch(`/r/${name}.json`, { cache: "no-store" });
        const updatedAt = res.headers.get("x-last-updated");
        if (updatedAt) {
          setLastUpdated(updatedAt);
          localStorage.setItem(cacheUpdatedAtKey, updatedAt);
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
        const updatedAt = res.headers.get("x-last-updated");
        const data = (await res.json()) as RegistryJson;
        return { data, updatedAt };
      })
      .then(({ data, updatedAt }) => {
        const content = data.files?.[0]?.content ?? null;
        setProfileString(content);
        if (updatedAt) setLastUpdated(updatedAt);
        if (content) {
          try {
            localStorage.setItem(cacheKey, content);
            localStorage.setItem(cacheTsKey, String(Date.now()));
            if (updatedAt) localStorage.setItem(cacheUpdatedAtKey, updatedAt);
          } catch {
            // Ignore localStorage write errors
          }
        }
      })
      .catch(() => setProfileString(null));
  }, [name]);

  const commands = [
    { id: "string", label: "string" },
    { id: "npm", label: "npm" },
    { id: "pnpm", label: "pnpm" },
    { id: "bun", label: "bun" },
  ] as const;
  const commandValues = {
    npm: `npx shadcn@latest add ${registryUrl}`,
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
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <RegistryMediaCarousel addon={addon} />

      <Tabs defaultValue={selectedTab} className="w-full">
        <TabsList>
          {commands.map((command) => (
            <TabsTrigger key={command.id} value={command.id}>
              {command.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {(["npm", "pnpm", "bun"] as const).map((runtime) => (
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
          <p className="mt-2 text-[0.625rem] text-muted-foreground">
            Last updated: {formattedUpdatedAt ?? "Unknown"}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
