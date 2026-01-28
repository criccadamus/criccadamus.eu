import { IconCopy } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { WowAddonConfig } from "@/lib/wow-addons";

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

  useEffect(() => {
    fetch(`/r/${name}.json`)
      .then((res) => res.json() as Promise<RegistryJson>)
      .then((data) => {
        setProfileString(data.files?.[0]?.content ?? null);
      })
      .catch(() => setProfileString(null));
  }, [name]);

  const commands = {
    npm: `npx shadcn@latest add ${registryUrl}`,
    pnpm: `pnpm dlx shadcn@latest add ${registryUrl}`,
    bun: `bunx shadcn@latest add ${registryUrl}`,
  };

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

      <Tabs defaultValue="npm" className="w-full">
        <TabsList>
          <TabsTrigger value="npm">npm</TabsTrigger>
          <TabsTrigger value="pnpm">pnpm</TabsTrigger>
          <TabsTrigger value="bun">bun</TabsTrigger>
          <TabsTrigger value="string">string</TabsTrigger>
        </TabsList>
        {(Object.keys(commands) as (keyof typeof commands)[]).map((runtime) => (
          <TabsContent key={runtime} value={runtime}>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 rounded bg-muted/50 border border-border px-3 py-2 text-xs font-mono text-muted-foreground break-all">
                {commands[runtime]}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => copy(commands[runtime], "Command copied")}
              >
                <IconCopy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        ))}
        <TabsContent value="string">
          <div className="flex items-start gap-2 mt-2">
            <code className="flex-1 rounded bg-muted/50 border border-border px-3 py-2 text-xs font-mono text-muted-foreground whitespace-nowrap overflow-x-auto">
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
