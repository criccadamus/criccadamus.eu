import { IconCopy } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface RegistryItem {
  name: string;
  title: string;
  description: string;
  addon: "details" | "plater" | "elvui" | "weakauras";
}

interface RegistryItemCardProps {
  item: RegistryItem;
}

interface RegistryJsonFile {
  path: string;
  content: string;
  type: string;
}

interface RegistryJson {
  files: RegistryJsonFile[];
}

const addonStyles: Record<string, { border: string; bg: string; text: string }> = {
  details: { border: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-400" },
  plater: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  elvui: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-400" },
  weakauras: { border: "border-red-500", bg: "bg-red-500/10", text: "text-red-400" },
};

export function RegistryItemCard({ item }: RegistryItemCardProps) {
  const registryUrl = `https://criccadamus.eu/r/${item.name}.json`;
  const [profileString, setProfileString] = useState<string | null>(null);
  const style = addonStyles[item.addon];

  useEffect(() => {
    fetch(`/r/${item.name}.json`)
      .then((res) => res.json() as Promise<RegistryJson>)
      .then((data) => {
        setProfileString(data.files?.[0]?.content ?? null);
      })
      .catch(() => setProfileString(null));
  }, [item.name]);

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
        "group relative flex flex-col gap-4",
        "bg-card border border-border rounded-lg p-6",
        "transition-all duration-300 ease-in-out",
        style.border,
        style.bg,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.description}</p>
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
                className={cn("shrink-0 h-8 w-8 transition-colors", `group-hover:${style.text}`)}
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
