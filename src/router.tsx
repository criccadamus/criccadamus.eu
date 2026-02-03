import { createRouter, type AnyRoute } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree: routeTree as AnyRoute,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
