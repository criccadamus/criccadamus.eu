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

export interface AddonAlertLink {
  text: string;
  url: string;
}

export interface AddonAlert {
  title: string;
  description: string;
  variant?: "default" | "destructive";
  icon?: "info" | "download";
  link?: AddonAlertLink;
}

export const profilesByAddon: AddonProfiles[] = [
  {
    addon: "edit-mode",
    alerts: [
      {
        title: "Extend the Cooldown Manager",
        description: "This layout uses SenseiClassResourceBar instead of the ElvUI solution for better control and placement. Blizzard kinda sucks for some reason for this and so does ElvUI.",
        icon: "download",
        link: {
          text: "SenseiClassResourceBar on Wago",
          url: "https://addons.wago.io/addons/sensei-class-resource-bar",
        },
      },
      {
        title: "More QoL for you",
        description: "Goated addon with so many knobs and options, this should just be native Blizzard. Trust!",
        icon: "download",
        link: {
          text: "Plumber on Wago",
          url: "https://addons.wago.io/addons/plumber",
        },
      },
    ],
    profiles: [
      {
        name: "edit-mode-profile",
        title: "Edit Mode Layout",
        description: '"the skeleton of the thing"',
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
        title: "Tweaks required",
        description:
          "This profile requires ElvUI WindTools to be complete and for icons, text and fonts to be properly shown.",
        icon: "download",
        link: {
          text: "ElvUI WindTools on Wago",
          url: "https://addons.wago.io/addons/elvui-windtools",
        },
      },
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
