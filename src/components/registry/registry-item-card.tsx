import { IconCopy } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { RegistryMediaCarousel } from "@/components/registry/registry-media-carousel";
import { Button } from "@/components/ui/button";
import { getProfileGist } from "@/data/gists";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { WowAddonConfig } from "@/lib/wow-addons";

const copy = (text: string, message = "Copied") => {
  void navigator.clipboard.writeText(text);
  toast.success(message);
};

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

const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

function profileCacheKeys(name: string) {
  const base = `registry:profile:v3:${name}`;
  return { content: base, ts: `${base}:ts`, updatedAt: `${base}:updatedAt` };
}

function readFreshProfileCache(
  name: string,
): { content: string; updatedAt: string | null } | null {
  try {
    const keys = profileCacheKeys(name);
    const content = localStorage.getItem(keys.content);
    const cachedAt = Number(localStorage.getItem(keys.ts));
    if (
      !content ||
      !Number.isFinite(cachedAt) ||
      Date.now() - cachedAt >= PROFILE_CACHE_TTL_MS
    ) {
      return null;
    }
    return { content, updatedAt: localStorage.getItem(keys.updatedAt) };
  } catch {
    // Ignore localStorage errors and fall back to network
    return null;
  }
}

export function RegistryItemCard({
  name,
  title,
  description,
  addon,
  addonConfig,
}: RegistryItemCardProps) {
  const [profileString, setProfileString] = useState<string | null>(
    () => readFreshProfileCache(name)?.content ?? null,
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(
    () => readFreshProfileCache(name)?.updatedAt ?? null,
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    const storeUpdatedAt = (value: string | null) => {
      if (!value) {
        return;
      }
      setLastUpdated(value);
      try {
        localStorage.setItem(profileCacheKeys(name).updatedAt, value);
      } catch {
        // Ignore localStorage write errors
      }
    };

    const fetchGistUpdatedAt = async () => {
      const gistId = getProfileGist(name);
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
        // SAFETY: GitHub gist API returns object with optional updated_at; validated via property existence check
        const data: { updated_at?: string } = await res.json();
        if (data.updated_at) {
          storeUpdatedAt(data.updated_at);
        }
      } catch {
        // Ignore gist API errors
      }
    };

    const refreshUpdatedAt = async () => {
      try {
        const res = await fetch(`/r/${name}.json`, { cache: "no-store" });
        const updatedAt =
          res.headers.get("x-last-updated") ?? res.headers.get("last-modified");
        if (updatedAt) {
          storeUpdatedAt(updatedAt);
        } else {
          await fetchGistUpdatedAt();
        }
      } catch {
        // Ignore background refresh errors
      }
    };

    const cached = readFreshProfileCache(name);
    if (cached) {
      if (!cached.updatedAt) {
        void refreshUpdatedAt();
      }
      return;
    }

    fetch(`/r/${name}.json`)
      .then(async (res) => {
        const updatedAt =
          res.headers.get("x-last-updated") ?? res.headers.get("last-modified");
        // SAFETY: registry JSON shape is RegistryJson; validated via files array access, same app contract
        const data: RegistryJson = await res.json();
        return { content: data.files?.[0]?.content ?? null, updatedAt };
      })
      .then(({ content, updatedAt }) => {
        setProfileString(content);
        if (updatedAt) {
          storeUpdatedAt(updatedAt);
        } else {
          void fetchGistUpdatedAt();
        }
        if (content) {
          try {
            const keys = profileCacheKeys(name);
            localStorage.setItem(keys.content, content);
            localStorage.setItem(keys.ts, String(Date.now()));
            if (updatedAt) {
              localStorage.setItem(keys.updatedAt, updatedAt);
            }
          } catch {
            // Ignore localStorage write errors
          }
        }
        return null;
      })
      .catch(() => setProfileString(null));
  }, [name]);

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

      <div className="mt-2 flex min-w-0 items-start gap-2">
        <code className="scrollbar-hidden min-w-0 flex-1 overflow-x-auto rounded border border-border bg-muted/50 px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-foreground">
          {profileString ?? "Loading..."}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!profileString}
          onClick={() =>
            profileString && copy(profileString, "Profile string copied")
          }
        >
          <IconCopy className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-0.5 text-[0.625rem] text-muted-foreground">
        <p>Last updated: {formattedUpdatedAt ?? "Unknown"}</p>
      </div>

      {/* key resets all carousel state (index, cache, errors) when the addon changes */}
      <RegistryMediaCarousel
        key={addon}
        addon={addon}
        accentColor={addonConfig.color}
      />
    </div>
  );
}
