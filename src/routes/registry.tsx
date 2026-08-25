import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/registry")({
  validateSearch: (search: Record<string, string | undefined>) => search,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/profiles",
      search,
    });
  },
});
