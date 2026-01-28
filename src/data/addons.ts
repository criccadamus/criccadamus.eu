import type { WowAddon } from "@/lib/wow-addons";

export interface AddonProfile {
  name: string;
  title: string;
  description: string;
}

export interface AddonProfiles {
  addon: WowAddon;
  profiles: AddonProfile[];
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
    profiles: [
      {
        name: "elvui-profile",
        title: "ElvUI Profile",
        description: "Full ElvUI interface profile",
      },
    ],
  },
];
