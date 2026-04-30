import { useSearch } from "@tanstack/react-router";

import { AddonAlertCard } from "@/components/registry/addon-alert-card";
import { RegistryItemCard } from "@/components/registry/registry-item-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profilesByAddon } from "@/data/addons";
import { wowAddons } from "@/lib/wow-addons";

export function RegistryList() {
  const search = useSearch({ from: "/registry" }) as { profile?: string };
  const defaultAddon =
    search.profile && wowAddons[search.profile as keyof typeof wowAddons]
      ? (search.profile as keyof typeof wowAddons)
      : profilesByAddon[0]?.addon;

  return (
    <Tabs defaultValue={defaultAddon}>
      <TabsList className="scrollbar-hidden w-full max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/80 p-1">
        {profilesByAddon.map((addonData) => {
          const addonConfig = wowAddons[addonData.addon];
          return (
            <TabsTrigger
              key={addonData.addon}
              value={addonData.addon}
              className="shrink-0 text-foreground/75 data-active:text-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2 rounded-full border border-transparent"
                  style={{ backgroundColor: addonConfig.color }}
                />
                {addonConfig.name}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {profilesByAddon.map((addonData) => {
        const addonConfig = wowAddons[addonData.addon];
        return (
          <TabsContent key={addonData.addon} value={addonData.addon}>
            <div className="mt-4 flex flex-col gap-4">
              {addonData.alerts?.map((alert) => (
                <AddonAlertCard key={alert.title} alert={alert} />
              ))}
              <div className="flex flex-col gap-3">
                {addonData.profiles.map((profile) => (
                  <RegistryItemCard
                    key={profile.name}
                    name={profile.name}
                    title={profile.title}
                    description={profile.description}
                    addon={addonData.addon}
                    addonConfig={addonConfig}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
