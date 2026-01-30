import { IconInfoCircle } from "@tabler/icons-react";
import { useSearch } from "@tanstack/react-router";

import { RegistryItemCard } from "@/components/registry/registry-item-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profilesByAddon } from "@/data/addons";
import { wowAddons } from "@/lib/wow-addons";

export function RegistryList() {
  const search = useSearch({ from: "/registry" });
  const defaultAddon =
    search.profile && wowAddons[search.profile as keyof typeof wowAddons]
      ? (search.profile as keyof typeof wowAddons)
      : profilesByAddon[0]?.addon;

  const alertIcons = {
    info: IconInfoCircle,
  } as const;

  return (
    <Tabs defaultValue={defaultAddon}>
      <TabsList>
        {profilesByAddon.map((addonData) => {
          const addonConfig = wowAddons[addonData.addon];
          return (
            <TabsTrigger
              key={addonData.addon}
              value={addonData.addon}
              style={{ color: addonConfig.color }}
            >
              {addonConfig.name}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {profilesByAddon.map((addonData) => {
        const addonConfig = wowAddons[addonData.addon];
        return (
          <TabsContent key={addonData.addon} value={addonData.addon}>
            <div className="flex flex-col gap-4 mt-4">
              {addonData.alerts?.map((alert) => (
                <Alert key={alert.title} variant={alert.variant}>
                  {alert.icon
                    ? (() => {
                        const Icon = alertIcons[alert.icon];
                        return Icon ? <Icon className="text-muted-foreground" /> : null;
                      })()
                    : null}
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>
                    <p>{alert.description}</p>
                  </AlertDescription>
                </Alert>
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
