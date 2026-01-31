import { IconExternalLink, IconInfoCircle } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/layout/header";
import { MacrosList } from "@/components/registry/macros-list";
import { RegistryList } from "@/components/registry/registry-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const mobileTextClass = isMobile ? "text-white" : "text-foreground";
  const mobileSubtextClass = isMobile ? "text-white/75" : "text-foreground/75";

  return (
    <div className="relative z-10">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-10">
          <section className="space-y-6 sm:rounded-lg sm:border sm:border-border/60 sm:bg-card/80 sm:p-6 sm:backdrop-blur">
            <div>
              <h2 className={`text-2xl font-bold tracking-tight ${mobileTextClass}`}>
                Addon Profiles
              </h2>
              <p className={`mt-2 ${mobileSubtextClass}`}>
                My personal addon profiles for World of Warcraft.
              </p>
              <p className={`mt-2 ${mobileSubtextClass}`}>
                Download them with the <code className="tracking-tight">shadcn</code> CLI or copy
                the strings directly.
              </p>
            </div>
            <Alert className="border-border/60 bg-background/70 sm:bg-background/70">
              <IconInfoCircle className="text-foreground/70" />
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
                      href="https://addons.wago.io/addons/sharedmedia-pretendard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-foreground underline decoration-dotted underline-offset-4 hover:text-foreground/80"
                    >
                      SharedMedia_Pretendard
                      <IconExternalLink className="relative -top-0.5 inline h-3.5 w-3.5 text-foreground/60" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://addons.wago.io/addons/sharedmedia-googlesanscode"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-foreground underline decoration-dotted underline-offset-4 hover:text-foreground/80"
                    >
                      SharedMedia_GoogleSansCode
                      <IconExternalLink className="relative -top-0.5 inline h-3.5 w-3.5 text-foreground/60" />
                    </a>
                  </li>
                </ul>
                <p>If the fonts are not found, each addon's fallback will be used instead.</p>
              </AlertDescription>
            </Alert>
            <RegistryList />
          </section>

          <section className="space-y-6 sm:rounded-lg sm:border sm:border-border/60 sm:bg-card/80 sm:p-6 sm:backdrop-blur">
            <div>
              <h2 className={`text-2xl font-bold tracking-tight ${mobileTextClass}`}>Macros</h2>
            </div>
            <MacrosList />
          </section>
        </div>
      </main>
    </div>
  );
}
