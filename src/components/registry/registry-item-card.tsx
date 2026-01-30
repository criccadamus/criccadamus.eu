import { IconCopy } from "@tabler/icons-react";
import { useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import type { WowAddonConfig } from "@/lib/wow-addons";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface RegistryItemCardProps {
  name: string;
  title: string;
  description: string;
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

export function RegistryItemCard({ name, title, description, addonConfig }: RegistryItemCardProps) {
  const registryUrl = `https://criccadamus.eu/r/${name}.json`;
  const [profileString, setProfileString] = useState<string | null>(null);
  const search = useSearch({ from: "/registry" });
  const selectedTab =
    search.tab && ["string", "npm", "pnpm", "bun"].includes(search.tab)
      ? search.tab
      : "string";

  useEffect(() => {
    const cacheKey = `registry:profile:${name}`;
    const cacheTsKey = `${cacheKey}:ts`;
    const cacheTtlMs = 5 * 60 * 1000;

    try {
      const cached = localStorage.getItem(cacheKey);
      const cachedAt = Number(localStorage.getItem(cacheTsKey));
      if (cached && Number.isFinite(cachedAt) && Date.now() - cachedAt < cacheTtlMs) {
        setProfileString(cached);
        return;
      }
    } catch {
      // Ignore localStorage errors and fall back to network
    }

    fetch(`/r/${name}.json`)
      .then((res) => res.json() as Promise<RegistryJson>)
      .then((data) => {
        const content = data.files?.[0]?.content ?? null;
        setProfileString(content);
        if (content) {
          try {
            localStorage.setItem(cacheKey, content);
            localStorage.setItem(cacheTsKey, String(Date.now()));
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

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3",
        "border rounded-lg p-4",
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
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 rounded bg-muted/50 border border-border px-3 py-2 text-xs font-mono text-muted-foreground break-all">
                {commandValues[runtime]}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => copy(commandValues[runtime], "Command copied")}
              >
                <IconCopy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        ))}
        <TabsContent value="string">
          <div className="flex items-start gap-2 mt-2 min-w-0">
            <code className="flex-1 min-w-0 rounded bg-muted/50 border border-border px-3 py-2 text-xs font-mono text-muted-foreground whitespace-nowrap overflow-x-auto">
              {profileString ?? "Loading..."}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              disabled={!profileString}
              onClick={() => profileString && copy(profileString, "Profile string copied")}
            >
              <IconCopy className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
