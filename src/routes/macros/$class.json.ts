import type { RouteMethodHandlerCtx } from "@tanstack/start-client-core";

import { createFileRoute } from "@tanstack/react-router";

import type { WowClass } from "@/lib/wow-classes";

import { wowClasses } from "@/lib/wow-classes";

const GIST_OWNER = "criccadamus";
const kvTtlSeconds = 60 * 60;
const kvKeyPrefix = "registry:macros:";

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
              return new Response(cached, {
                status: 200,
                headers: {
                  "content-type": "application/json; charset=utf-8",
                  "cache-control": "public, max-age=300",
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
        } catch {
          return Response.json({ error: "Failed to load macros." }, { status: 502 });
        }

        const body = JSON.stringify(payload, null, 2);
        if (env?.REGISTRY_KV) {
          try {
            await env.REGISTRY_KV.put(cacheKey, body, { expirationTtl: kvTtlSeconds });
          } catch {
            // Ignore cache write errors
          }
        }

        return new Response(body, {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
