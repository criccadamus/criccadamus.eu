import { createFileRoute } from "@tanstack/react-router";

import { GIST_OWNER, classGists } from "@/data/gists";
import { wowClasses, type WowClass } from "@/lib/wow-classes";
const kvTtlSeconds = 60 * 60;
const kvKeyPrefix = "registry:macros:v2:";
const gistApiBase = "https://api.github.com/gists";

type AppRequestContext = {
  env?: Env & { REGISTRY_KV?: KVNamespace };
};

type RouteCtx<TParams> = {
  params: TParams;
  context: AppRequestContext;
};

type CachedMacros = {
  macros: unknown[];
  updatedAt?: string;
};

function getEnvFromContext(context: AppRequestContext | undefined) {
  return context?.env;
}

function buildMacrosResponse(macros: unknown[], updatedAt?: string) {
  const headers = new Headers();
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "public, max-age=300");
  if (updatedAt) {
    headers.set("x-last-updated", updatedAt);
    headers.set("last-modified", updatedAt);
  }
  return new Response(JSON.stringify(macros, null, 2), {
    status: 200,
    headers,
  });
}

function parseCachedMacros(cached: string) {
  try {
    // SAFETY: cached JSON was stringified CachedMacros; shape validated via Array.isArray
    const parsed = JSON.parse(cached) as CachedMacros;
    if (Array.isArray(parsed?.macros)) {
      return {
        macros: parsed.macros,
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    // ignore
  }

  try {
    const parsed: unknown = JSON.parse(cached);
    if (Array.isArray(parsed)) {
      // SAFETY: parsed is array from JSON; elements are unknown macros, validated by caller
      return { macros: parsed as unknown[], updatedAt: undefined };
    }
  } catch {
    // ignore
  }

  return null;
}

async function readCachedMacros(
  env: (Env & { REGISTRY_KV?: KVNamespace }) | undefined,
  cacheKey: string,
) {
  if (!env?.REGISTRY_KV) {
    return null;
  }

  try {
    const cached = await env.REGISTRY_KV.get(cacheKey);
    if (!cached) {
      return null;
    }

    return parseCachedMacros(cached);
  } catch {
    return null;
  }
}

async function fetchMacrosFromGist(classKey: WowClass, gistId: string) {
  try {
    const primaryUrl = buildRawGistUrl(gistId, "macros.json");
    let response = await fetch(primaryUrl);
    if (!response.ok) {
      const fallbackUrl = buildRawGistUrl(gistId, `${classKey}.json`);
      response = await fetch(fallbackUrl);
      if (!response.ok) {
        return { error: Response.json({ error: "Macros not found." }, { status: 404 }) };
      }
    }

    const text = await response.text();
    const payload: unknown = JSON.parse(text);
    if (!Array.isArray(payload)) {
      return { error: Response.json({ error: "Invalid macros format." }, { status: 502 }) };
    }

    const rawLastModified = response.headers.get("last-modified") ?? undefined;
    const metadata = await fetchGistMetadata(gistId);
    const updatedAt = metadata.updatedAt ?? rawLastModified ?? undefined;

    // SAFETY: payload is array validated via Array.isArray; elements are unknown macro objects
    return { macros: payload as unknown[], updatedAt };
  } catch {
    return { error: Response.json({ error: "Failed to load macros." }, { status: 502 }) };
  }
}

function buildRawGistUrl(gistId: string, filename: string) {
  return `https://gist.githubusercontent.com/${GIST_OWNER}/${gistId}/raw/${filename}`;
}

interface GistMetadataResponse {
  updated_at?: string;
}

async function fetchGistMetadata(gistId: string): Promise<{ updatedAt: string | undefined }> {
  try {
    const response = await fetch(`${gistApiBase}/${gistId}`, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "criccadamus.eu",
      },
    });
    if (!response.ok) {
      return { updatedAt: undefined };
    }
    // SAFETY: GitHub gist API returns object with optional updated_at; validated via optional access
    // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- response.json() returns unknown, cast to typed response is required
    const data = (await response.json()) as GistMetadataResponse;
    return { updatedAt: data.updated_at };
  } catch {
    return { updatedAt: undefined };
  }
}

// oxlint-disable-next-line typescript/no-unsafe-assignment -- TanStack createFileRoute is typed as any for generated routes
export const Route = createFileRoute("/macros/$class/json")({
  server: {
    handlers: {
      GET: async (ctx: RouteCtx<{ class: WowClass }>) => {
        const { params } = ctx;
        const classKey = params.class;
        if (!wowClasses[classKey]) {
          return Response.json({ error: "Class not found." }, { status: 404 });
        }

        const env = getEnvFromContext(ctx.context);
        const cacheKey = `${kvKeyPrefix}${classKey}`;
        const cached = await readCachedMacros(env, cacheKey);
        if (cached) {
          return buildMacrosResponse(cached.macros, cached.updatedAt);
        }

        const gistId = classGists[classKey];
        if (!gistId || gistId === "TODO") {
          return Response.json({ error: "Class gist not configured." }, { status: 500 });
        }

        const macrosResult = await fetchMacrosFromGist(classKey, gistId);
        if ("error" in macrosResult) {
          return macrosResult.error;
        }

        const { macros, updatedAt } = macrosResult;
        if (env?.REGISTRY_KV) {
          try {
            const cacheValue = JSON.stringify({
              macros,
              updatedAt,
            } satisfies CachedMacros);
            await env.REGISTRY_KV.put(cacheKey, cacheValue, { expirationTtl: kvTtlSeconds });
          } catch {
            // Ignore cache write errors
          }
        }

        return buildMacrosResponse(macros, updatedAt);
      },
    },
  },
});
