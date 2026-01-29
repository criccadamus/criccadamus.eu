import type { WowAddon } from "@/lib/wow-addons";

export interface AddonProfile {
  name: string;
  title: string;
  description: string;
}

export interface AddonProfiles {
  addon: WowAddon;
  alerts?: AddonAlert[];
  profiles: AddonProfile[];
}

export interface AddonAlert {
  title: string;
  description: string;
  variant?: "default" | "destructive";
  icon?: "info";
}

export const profilesByAddon: AddonProfiles[] = [
  {
    addon: "details",
    profiles: [
      {
        name: "details-profile",
        title: "Details! Profile",
        description: "Clean and minimal Details! damage meter profile",
      },
    ],
  },
  {
    addon: "plater",
    profiles: [
      {
        name: "plater-profile",
        title: "Plater Profile",
        description: "Customized Plater nameplates configuration",
      },
    ],
  },
  {
    addon: "elvui",
    alerts: [
      {
        title: "ElvUI raid/party frames",
        description:
          "This profile does not include raid or party frame configuration. Use it alongside the native Blizzard raid frames.",
        icon: "info",
      },
    ],
    profiles: [
      {
        name: "elvui-profile",
        title: "ElvUI Profile",
        description: "Full ElvUI interface profile",
      },
    ],
  },
];
