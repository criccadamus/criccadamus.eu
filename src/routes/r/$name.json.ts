import { createFileRoute } from "@tanstack/react-router";

import { profilesByAddon } from "@/data/addons";
import { GIST_OWNER, profileGists } from "@/data/gists";

const registrySchemaUrl = "https://ui.shadcn.com/schema/registry-item.json";
const fileType = "registry:file";
const kvTtlSeconds = 60 * 60;
const kvKeyPrefix = "registry:profile:v2:";
const gistApiBase = "https://api.github.com/gists";

type RouteCtx<TParams> = {
  params: TParams;
  context: unknown;
};

function getEnvFromContext(context: unknown) {
  if (typeof context === "object" && context && "env" in context) {
    return (context as { env?: Env & { REGISTRY_KV?: KVNamespace } }).env;
  }
  return undefined;
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
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
      ...(updatedAt ? { "x-last-updated": updatedAt, "last-modified": updatedAt } : {}),
    },
  });
}

function parseCachedProfile(cached: string): ProfileCacheEntry | null {
  try {
    const parsed = JSON.parse(cached) as CachedProfile;
    if (typeof parsed?.content === "string") {
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

async function fetchGistMetadata(gistId: string) {
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
    const data = (await response.json()) as { updated_at?: string };
    return { updatedAt: data.updated_at };
  } catch {
    return { updatedAt: undefined };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment - prob oxlint type aware bug
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
