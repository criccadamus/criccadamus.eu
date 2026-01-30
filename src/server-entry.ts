import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

type RegistryEnv = {
  REGISTRY_KV?: KVNamespace;
};

const handler = createStartHandler(defaultStreamHandler);

export default {
  async fetch(request: Request, env: Env & RegistryEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/r\/([^/]+)\.json$/);
    if (match) {
      url.pathname = `/r/${match[1]}/json`;
      request = new Request(url, request);
    }

    return handler(request, { context: { env, ctx } });
  },
};
