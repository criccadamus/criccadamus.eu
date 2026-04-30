export type WowAddon = "details" | "plater" | "elvui" | "weakauras" | "edit-mode";

export interface WowAddonConfig {
  name: string;
  color: string;
  border: string;
  bg: string;
}

export const wowAddons: Record<WowAddon, WowAddonConfig> = {
  elvui: { name: "ElvUI", color: "#3b82f6", border: "border-[#3b82f6]", bg: "bg-[#3b82f6]/10" },
  details: {
    name: "Details!",
    color: "#f97316",
    border: "border-[#f97316]",
    bg: "bg-[#f97316]/10",
  },
  plater: { name: "Plater", color: "#a855f7", border: "border-[#a855f7]", bg: "bg-[#a855f7]/10" },
  weakauras: {
    name: "WeakAuras",
    color: "#ef4444",
    border: "border-[#ef4444]",
    bg: "bg-[#ef4444]/10",
  },
  "edit-mode": {
    name: "Edit Mode",
    color: "#10b981",
    border: "border-[#10b981]",
    bg: "bg-[#10b981]/10",
  },
};
