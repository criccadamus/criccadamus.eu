import type { RouteMethodHandlerCtx } from "@tanstack/start-client-core";

import { createFileRoute } from "@tanstack/react-router";

import type { WowClass } from "@/lib/wow-classes";

import { wowClasses } from "@/lib/wow-classes";

const GIST_OWNER = "criccadamus";
const kvTtlSeconds = 60 * 60;
const kvKeyPrefix = "registry:macros:v2:";
const gistApiBase = "https://api.github.com/gists";

type CachedMacros = {
  macros: unknown[];
  updatedAt?: string;
};

const GIST_BY_CLASS: Record<WowClass, string> = {
  warrior: "b903af03034235a04fe65dcd24870044",
  druid: "1a09d5ffad529c02090f44ea93d19e66",
  evoker: "31c0777eb2529c393be03d46723d4dad",
  rogue: "9137e2f14fa51a84c748fbd4410528fa",
  priest: "1dfafd3e60b1249201ccfaf01c321a67",
  shaman: "ec2c34115e866ba136350115d5a987c5",
};

function buildRawGistUrl(gistId: string, filename: string) {
  return `https://gist.githubusercontent.com/${GIST_OWNER}/${gistId}/raw/${filename}`;
}

async function fetchGistUpdatedAt(gistId: string) {
  try {
    const response = await fetch(`${gistApiBase}/${gistId}`, {
      headers: {
        accept: "application/vnd.github+json",
      },
    });
    if (!response.ok) return undefined;
    const data = (await response.json()) as { updated_at?: string };
    return data.updated_at;
  } catch {
    return undefined;
  }
}

export const Route = createFileRoute("/macros/$class/json")({
  server: {
    handlers: {
      GET: async (ctx: RouteMethodHandlerCtx<any, any, any, { class: WowClass }, any, any>) => {
        const { params, context } = ctx;
        const classKey = params.class as WowClass;
        if (!wowClasses[classKey]) {
          return Response.json({ error: "Class not found." }, { status: 404 });
        }

        const env = context?.env as (Env & { REGISTRY_KV?: KVNamespace }) | undefined;
        const cacheKey = `${kvKeyPrefix}${classKey}`;
        if (env?.REGISTRY_KV) {
          try {
            const cached = await env.REGISTRY_KV.get(cacheKey);
            if (cached) {
              let cachedPayload: CachedMacros | null = null;
              try {
                const parsed = JSON.parse(cached) as CachedMacros;
                if (Array.isArray(parsed?.macros)) {
                  cachedPayload = parsed;
                }
              } catch {
                // cached content was a raw array string
              }

              const macros = cachedPayload?.macros ?? (JSON.parse(cached) as unknown[]);
              const body = JSON.stringify(macros, null, 2);

              return new Response(body, {
                status: 200,
                headers: {
                  "content-type": "application/json; charset=utf-8",
                  "cache-control": "public, max-age=300",
                  ...(cachedPayload?.updatedAt
                    ? {
                        "x-last-updated": cachedPayload.updatedAt,
                        "last-modified": cachedPayload.updatedAt,
                      }
                    : {}),
                },
              });
            }
          } catch {
            // Ignore cache errors and fall back to gist
          }
        }

        const gistId = GIST_BY_CLASS[classKey];
        if (!gistId || gistId === "TODO") {
          return Response.json({ error: "Class gist not configured." }, { status: 500 });
        }

        const rawUrl = buildRawGistUrl(gistId, "macros.json");

        let payload: unknown;
        let updatedAt: string | undefined;
        try {
          let response = await fetch(rawUrl);
          if (!response.ok) {
            const fallbackUrl = buildRawGistUrl(gistId, `${classKey}.json`);
            response = await fetch(fallbackUrl);
            if (!response.ok) {
              return Response.json({ error: "Macros not found." }, { status: 404 });
            }
          }
          const text = await response.text();
          payload = JSON.parse(text);
          if (!Array.isArray(payload)) {
            return Response.json({ error: "Invalid macros format." }, { status: 502 });
          }
          updatedAt = await fetchGistUpdatedAt(gistId);
        } catch {
          return Response.json({ error: "Failed to load macros." }, { status: 502 });
        }

        const body = JSON.stringify(payload, null, 2);
        if (env?.REGISTRY_KV) {
          try {
            const cacheValue = JSON.stringify({
              macros: payload,
              updatedAt,
            } satisfies CachedMacros);
            await env.REGISTRY_KV.put(cacheKey, cacheValue, { expirationTtl: kvTtlSeconds });
          } catch {
            // Ignore cache write errors
          }
        }

        return new Response(body, {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=300",
            ...(updatedAt ? { "x-last-updated": updatedAt, "last-modified": updatedAt } : {}),
          },
        });
      },
    },
  },
});
