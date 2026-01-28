import { profilesByAddon } from "@/data/addons";
import { wowAddons } from "@/lib/wow-addons";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistryItemCard } from "./registry-item-card";

export function RegistryList() {
  return (
    <Tabs defaultValue={profilesByAddon[0].addon}>
      <TabsList>
        {profilesByAddon.map((addonData) => {
          const addonConfig = wowAddons[addonData.addon];
          return (
            <TabsTrigger key={addonData.addon} value={addonData.addon} style={{ color: addonConfig.color }}>
              {addonConfig.name}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {profilesByAddon.map((addonData) => {
        const addonConfig = wowAddons[addonData.addon];
        return (
          <TabsContent key={addonData.addon} value={addonData.addon}>
            <div className="flex flex-col gap-3 mt-4">
              {addonData.profiles.map((profile) => (
                <RegistryItemCard
                  key={profile.name}
                  name={profile.name}
                  title={profile.title}
                  description={profile.description}
                  addonConfig={addonConfig}
                />
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
