export type WowClass = "warrior" | "druid" | "evoker" | "rogue" | "priest" | "shaman";

export interface WowClassConfig {
  name: string;
  color: string;
  border: string;
  bg: string;
}

export const wowClasses = {
  warrior: { name: "Warrior", color: "#C79C6E", border: "border-[#C79C6E]", bg: "bg-[#C79C6E]/10" },
  druid: { name: "Druid", color: "#FF7C0A", border: "border-[#FF7C0A]", bg: "bg-[#FF7C0A]/10" },
  evoker: { name: "Evoker", color: "#33937F", border: "border-[#33937F]", bg: "bg-[#33937F]/10" },
  rogue: { name: "Rogue", color: "#FFF468", border: "border-[#FFF468]", bg: "bg-[#FFF468]/10" },
  priest: { name: "Priest", color: "#FFFFFF", border: "border-[#FFFFFF]", bg: "bg-[#FFFFFF]/10" },
  shaman: { name: "Shaman", color: "#00498f", border: "border-[#00498f]", bg: "bg-[#00498f]/10" },
} satisfies Record<WowClass, WowClassConfig>;
