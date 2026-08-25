import { createFileRoute } from "@tanstack/react-router";

import { profilesByAddon } from "@/data/addons";

const mediaExtensions = [".webp", ".webm"];
const cacheMaxAgeSeconds = 300;

type AppRequestContext = {
  env?: Env & { REGISTRY_MEDIA_BUCKET?: R2Bucket };
};

type RouteCtx<TParams> = {
  params: TParams;
  context: AppRequestContext;
};

function getEnvFromContext(context: AppRequestContext | undefined) {
  return context?.env;
}

function isAddonKnown(addon: string) {
  return profilesByAddon.some((entry) => entry.addon === addon);
}

function extractNumericIndex(key: string) {
  const filename = key.split("/").pop() ?? "";
  const baseName = filename.split(".")[0];
  const index = Number.parseInt(baseName, 10);
  return Number.isFinite(index) ? index : null;
}

export const Route = createFileRoute("/registry-media/$addon/json")({
  server: {
    handlers: {
      GET: async (ctx: RouteCtx<{ addon: string }>) => {
        const { params } = ctx;
        const addon = params.addon;
        if (!addon || !isAddonKnown(addon)) {
          return Response.json({ error: "Addon not found." }, { status: 404 });
        }

        const env = getEnvFromContext(ctx.context);
        if (!env?.REGISTRY_MEDIA_BUCKET) {
          return Response.json(
            { error: "Media bucket not configured." },
            { status: 500 },
          );
        }

        const items: string[] = [];
        let cursor: string | undefined = undefined;

        try {
          do {
            const listed = await env.REGISTRY_MEDIA_BUCKET.list({
              prefix: `${addon}/`,
              cursor,
            });

            for (const object of listed.objects) {
              const key = object.key;
              const lowerKey = key.toLowerCase();
              if (!mediaExtensions.some((ext) => lowerKey.endsWith(ext))) {
                continue;
              }
              if (extractNumericIndex(key) === null) {
                continue;
              }
              items.push(key);
            }

            if (listed.truncated) {
              cursor = listed.cursor;
            } else {
              cursor = undefined;
            }
          } while (cursor);
        } catch {
          return Response.json(
            { error: "Failed to list media." },
            { status: 502 },
          );
        }

        items.sort((a, b) => {
          const indexA = extractNumericIndex(a) ?? 0;
          const indexB = extractNumericIndex(b) ?? 0;
          return indexA - indexB || a.localeCompare(b);
        });

        return new Response(JSON.stringify({ items }, null, 2), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": `public, max-age=${cacheMaxAgeSeconds}`,
          },
        });
      },
    },
  },
});
