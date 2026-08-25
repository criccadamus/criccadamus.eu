import { createFileRoute } from "@tanstack/react-router";

import { profilesByAddon } from "@/data/addons";
import { GIST_OWNER, profileGists } from "@/data/gists";

const registrySchemaUrl = "https://ui.shadcn.com/schema/registry-item.json";
const fileType = "registry:file";
const kvTtlSeconds = 60 * 60;
const kvKeyPrefix = "registry:profile:v2:";
const gistApiBase = "https://api.github.com/gists";

type AppRequestContext = {
  env?: Env & { REGISTRY_KV?: KVNamespace };
};

type RouteCtx<TParams> = {
  params: TParams;
  context: AppRequestContext;
};

function getEnvFromContext(context: AppRequestContext | undefined) {
  return context?.env;
}

type CachedProfile = {
  content: string;
  updatedAt?: string;
};

type ProfileCacheEntry = {
  content: string;
  updatedAt?: string;
};

function buildProfilePayload(
  profile: { name: string; title: string; description: string },
  content: string,
  filename: string,
) {
  return {
    $schema: registrySchemaUrl,
    name: profile.name,
    type: fileType,
    title: profile.title,
    description: profile.description,
    files: [
      {
        path: filename,
        content,
        type: fileType,
        target: `~/${profile.name}.txt`,
      },
    ],
  };
}

function buildProfileResponse(
  profile: { name: string; title: string; description: string },
  content: string,
  filename: string,
  updatedAt?: string,
) {
  const payload = buildProfilePayload(profile, content, filename);
  const headers = new Headers();
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "public, max-age=300");
  if (updatedAt) {
    headers.set("x-last-updated", updatedAt);
    headers.set("last-modified", updatedAt);
  }
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers,
  });
}

// oxlint-disable-next-line anti-slop/no-unknown-parameters -- type guard requires unknown for parsing
function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}

function parseCachedProfile(cached: string): ProfileCacheEntry | null {
  try {
    // SAFETY: cached JSON was stringified CachedProfile; shape validated via isString check
    const parsed = JSON.parse(cached) as CachedProfile;
    if (isString(parsed?.content)) {
      return {
        content: parsed.content,
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    // ignore
  }

  return { content: cached };
}

async function readCachedProfile(
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
    return parseCachedProfile(cached);
  } catch {
    return null;
  }
}

async function fetchProfileContent(gistId: string, filename: string) {
  const rawUrl = buildRawGistUrl(gistId, filename);
  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      return { error: Response.json({ error: "Profile content not found." }, { status: 404 }) };
    }

    const content = await response.text();
    const rawLastModified = response.headers.get("last-modified") ?? undefined;
    const metadata = await fetchGistMetadata(gistId);
    const updatedAt = metadata.updatedAt ?? rawLastModified ?? undefined;

    return { content, updatedAt };
  } catch {
    return { error: Response.json({ error: "Failed to load profile content." }, { status: 502 }) };
  }
}

function findProfileByName(name: string) {
  for (const addon of profilesByAddon) {
    const profile = addon.profiles.find((item) => item.name === name);
    if (profile) {
      return profile;
    }
  }
  return null;
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
export const Route = createFileRoute("/r/$name/json")({
  server: {
    handlers: {
      GET: async (ctx: RouteCtx<{ name: string }>) => {
        const { params } = ctx;
        if (!GIST_OWNER) {
          return Response.json({ error: "Registry gist is not configured." }, { status: 500 });
        }

        const profile = findProfileByName(params.name);
        if (!profile) {
          return Response.json({ error: "Profile not found." }, { status: 404 });
        }

        const env = getEnvFromContext(ctx.context);
        const cacheKey = `${kvKeyPrefix}${profile.name}`;
        const filename = `${profile.name}.txt`;

        const cached = await readCachedProfile(env, cacheKey);
        if (cached) {
          return buildProfileResponse(profile, cached.content, filename, cached.updatedAt);
        }

        const gistId = profileGists[profile.name];
        if (!gistId) {
          return Response.json({ error: "Profile gist not found." }, { status: 404 });
        }

        const profileResult = await fetchProfileContent(gistId, filename);
        if ("error" in profileResult) {
          return profileResult.error;
        }

        const { content, updatedAt } = profileResult;
        if (env?.REGISTRY_KV) {
          try {
            const cacheValue = JSON.stringify({
              content,
              updatedAt,
            } satisfies CachedProfile);
            await env.REGISTRY_KV.put(cacheKey, cacheValue, { expirationTtl: kvTtlSeconds });
          } catch {
            // Ignore cache write errors
          }
        }

        return buildProfileResponse(profile, content, filename, updatedAt);
      },
    },
  },
});
