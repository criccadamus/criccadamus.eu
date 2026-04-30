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
    addon: "edit-mode",
    profiles: [
      {
        name: "edit-mode-profile",
        title: "Edit Mode Layout",
        description: '"shared edit mode layout"',
      },
    ],
  },
  {
    addon: "details",
    profiles: [
      {
        name: "details-profile",
        title: "Details! Profile",
        description: '"honestly: just use the native damage meter"',
      },
    ],
  },
  {
    addon: "plater",
    profiles: [
      {
        name: "plater-profile",
        title: "Plater Profile",
        description: '"don\'t bother with the native nameplates lmao"',
      },
    ],
  },
  {
    addon: "elvui",
    alerts: [
      {
        title: "Heads up!",
        description:
          "This profile does not include raid or party frame configuration. Use it alongside the native raid frames",
        icon: "info",
      },
    ],
    profiles: [
      {
        name: "elvui-profile",
        title: "ElvUI Profile",
        description: '"3-expansions old profile. honed and perfected (maybe)"',
      },
    ],
  },
];
