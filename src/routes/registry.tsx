import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/layout/header";
import { RegistryList } from "@/components/registry/registry-list";

export const Route = createFileRoute("/registry")({
  component: RegistryPage,
  head: () => ({
    meta: [
      {
        title: "Registry | Criccahub",
      },
      {
        name: "description",
        content: "WoW UI profiles registry for Details, Plater, ElvUI and more",
      },
    ],
  }),
});

function RegistryPage() {
  return (
    <div className="relative z-10">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">WoW UI Registry</h2>
            <p className="text-muted-foreground mt-2">
              My personal profiles for World of Warcraft. Use with the <code>shadcn</code>{" "}
              CLI or copy the strings directly.
            </p>
          </div>
          <RegistryList />
        </div>
      </main>
    </div>
  );
}
