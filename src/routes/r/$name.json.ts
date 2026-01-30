import type { RouteMethodHandlerCtx } from "@tanstack/start-client-core";

import { createFileRoute } from "@tanstack/react-router";

import { profilesByAddon } from "@/data/addons";

const GIST_OWNER = "criccadamus";

const GIST_BY_PROFILE: Record<string, string> = {
  "details-profile": "58078b1ab69a4e68f07d118c5d57f321",
  "plater-profile": "fe2f86c25a62cf654aceb3ec6a4795e4",
  "elvui-profile": "642482b44a464b84e82284adcf39f9f7",
};

const registrySchemaUrl = "https://ui.shadcn.com/schema/registry-item.json";
const fileType = "registry:file";
const kvTtlSeconds = 60 * 60;
const kvKeyPrefix = "registry:profile:v2:";
const gistApiBase = "https://api.github.com/gists";

type CachedProfile = {
  content: string;
  updatedAt?: string;
};

function findProfileByName(name: string) {
  for (const addon of profilesByAddon) {
    const profile = addon.profiles.find((item) => item.name === name);
    if (profile) return profile;
  }
  return null;
}

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

export const Route = createFileRoute("/r/$name/json")({
  server: {
    handlers: {
      GET: async (ctx: RouteMethodHandlerCtx<any, any, any, { name: string }, any, any>) => {
        const { params, context } = ctx;
        if (!GIST_OWNER) {
          return Response.json({ error: "Registry gist is not configured." }, { status: 500 });
        }

        const profile = findProfileByName(params.name);
        if (!profile) {
          return Response.json({ error: "Profile not found." }, { status: 404 });
        }

        const env = context?.env as (Env & { REGISTRY_KV?: KVNamespace }) | undefined;
        const cacheKey = `${kvKeyPrefix}${profile.name}`;
        if (env?.REGISTRY_KV) {
          try {
            const cached = await env.REGISTRY_KV.get(cacheKey);
            if (cached) {
              let content = cached;
              let updatedAt: string | undefined;
              try {
                const parsed = JSON.parse(cached) as CachedProfile;
                if (typeof parsed?.content === "string") {
                  content = parsed.content;
                  updatedAt = parsed.updatedAt;
                }
              } catch {
                // cached content was a raw string
              }

              const payload = {
                $schema: registrySchemaUrl,
                name: profile.name,
                type: fileType,
                title: profile.title,
                description: profile.description,
                files: [
                  {
                    path: `${profile.name}.txt`,
                    content,
                    type: fileType,
                    target: `~/${profile.name}.txt`,
                  },
                ],
              };

              return new Response(JSON.stringify(payload, null, 2), {
                status: 200,
                headers: {
                  "content-type": "application/json; charset=utf-8",
                  "cache-control": "public, max-age=300",
                  ...(updatedAt ? { "x-last-updated": updatedAt, "last-modified": updatedAt } : {}),
                },
              });
            }
          } catch {
            // Ignore cache errors and fall back to gist
          }
        }

        const gistId = GIST_BY_PROFILE[profile.name];
        if (!gistId) {
          return Response.json({ error: "Profile gist not found." }, { status: 404 });
        }

        const filename = `${params.name}.txt`;
        const rawUrl = buildRawGistUrl(gistId, filename);

        let content = "";
        let updatedAt: string | undefined;
        try {
          const response = await fetch(rawUrl);
          if (!response.ok) {
            return Response.json({ error: "Profile content not found." }, { status: 404 });
          }
          content = await response.text();
          updatedAt = await fetchGistUpdatedAt(gistId);
        } catch {
          return Response.json({ error: "Failed to load profile content." }, { status: 502 });
        }

        if (env?.REGISTRY_KV) {
          try {
            const cacheValue = JSON.stringify({ content, updatedAt } satisfies CachedProfile);
            await env.REGISTRY_KV.put(cacheKey, cacheValue, { expirationTtl: kvTtlSeconds });
          } catch {
            // Ignore cache write errors
          }
        }

        const payload = {
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

        return new Response(JSON.stringify(payload, null, 2), {
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
