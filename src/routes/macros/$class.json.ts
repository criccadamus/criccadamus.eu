import { createFileRoute } from "@tanstack/react-router";

import { GIST_OWNER, classGists } from "@/data/gists";
import { wowClasses, type WowClass } from "@/lib/wow-classes";
const kvTtlSeconds = 60 * 60;
const kvKeyPrefix = "registry:macros:v2:";
const gistApiBase = "https://api.github.com/gists";

type RouteCtx<TParams> = {
  params: TParams;
  context: unknown;
};

type CachedMacros = {
  macros: unknown[];
  updatedAt?: string;
};

function getEnvFromContext(context: unknown) {
  if (typeof context === "object" && context && "env" in context) {
    return (context as { env?: Env & { REGISTRY_KV?: KVNamespace } }).env;
  }
  return undefined;
}

function buildMacrosResponse(macros: unknown[], updatedAt?: string) {
  return new Response(JSON.stringify(macros, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
      ...(updatedAt ? { "x-last-updated": updatedAt, "last-modified": updatedAt } : {}),
    },
  });
}

function parseCachedMacros(cached: string) {
  try {
    const parsed = JSON.parse(cached) as CachedMacros;
    if (Array.isArray(parsed?.macros)) {
      return { macros: parsed.macros, updatedAt: parsed.updatedAt };
    }
  } catch {
    // ignore
  }

  try {
    const parsed: unknown = JSON.parse(cached);
    if (Array.isArray(parsed)) {
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
    const updatedAt = (await fetchGistUpdatedAt(gistId)) ?? rawLastModified ?? undefined;

    return { macros: payload as unknown[], updatedAt };
  } catch {
    return { error: Response.json({ error: "Failed to load macros." }, { status: 502 }) };
  }
}

function buildRawGistUrl(gistId: string, filename: string) {
  return `https://gist.githubusercontent.com/${GIST_OWNER}/${gistId}/raw/${filename}`;
}

async function fetchGistUpdatedAt(gistId: string) {
  try {
    const response = await fetch(`${gistApiBase}/${gistId}`, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "criccadamus.eu",
      },
    });
    if (!response.ok) {
      return undefined;
    }
    const data = (await response.json()) as { updated_at?: string };
    return data.updated_at;
  } catch {
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const Route = createFileRoute("/macros/$class/json")({
  server: {
    handlers: {
      GET: async (ctx: RouteCtx<{ class: WowClass }>) => {
        const { params } = ctx;
        const classKey = params.class as WowClass;
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
