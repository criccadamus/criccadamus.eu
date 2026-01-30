import { IconExternalLink, IconInfoCircle } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/layout/header";
import { MacrosList } from "@/components/registry/macros-list";
import { RegistryList } from "@/components/registry/registry-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/registry")({
  validateSearch: (search: Record<string, unknown>) => {
    const profile = typeof search.profile === "string" ? search.profile : undefined;
    const tab = typeof search.tab === "string" ? search.tab : undefined;
    return { profile, tab };
  },
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
        <div className="space-y-10">
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Addon Profiles</h2>
              <p className="text-muted-foreground mt-2">
                My personal addon profiles for World of Warcraft.
              </p>
              <p className="text-muted-foreground mt-2">
                Download them with the <code className="tracking-tight">shadcn</code> CLI or copy
                the strings directly.
              </p>
            </div>
            <Alert>
              <IconInfoCircle className="text-muted-foreground" />
              <AlertTitle>Fonts used in these profiles</AlertTitle>
              <AlertDescription>
                <p>
                  These profiles are tailored for <span className="font-bold">Pretendard</span> and{" "}
                  <code className="tracking-tight">Google Sans Code</code>.
                </p>
                <p>
                  You can download this addons that will add them to all <code>libSharedMedia</code>
                  -compatible addons here:
                </p>
                <ul>
                  <li>
                    <a
                      href="https://github.com/criccadamus/SharedMedia_Pretendard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-foreground/80 font-mono"
                    >
                      SharedMedia_Pretendard
                      <IconExternalLink className="text-muted-foreground inline w-3.5 h-3.5 relative -top-0.5" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/criccadamus/SharedMedia_GoogleSansCode"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-foreground/80 font-mono"
                    >
                      SharedMedia_GoogleSansCode
                      <IconExternalLink className="text-muted-foreground inline w-3.5 h-3.5 relative -top-0.5" />
                    </a>
                  </li>
                </ul>
                <p>If the fonts are not found, each addon's fallback will be used instead.</p>
              </AlertDescription>
            </Alert>
            <RegistryList />
          </section>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Macros</h2>
            </div>
            <MacrosList />
          </section>
        </div>
      </main>
    </div>
  );
}
