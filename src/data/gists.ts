import type { WowClass } from "@/lib/wow-classes";

export const GIST_OWNER = "criccadamus";

// oxlint-disable-next-line anti-slop/no-known-value-widening -- profileGists is intentionally open dictionary for dynamic profile lookup
export const profileGists: Record<string, string> = {
  "details-profile": "58078b1ab69a4e68f07d118c5d57f321",
  "plater-profile": "fe2f86c25a62cf654aceb3ec6a4795e4",
  "elvui-profile": "642482b44a464b84e82284adcf39f9f7",
  "edit-mode-profile": "6ce6306dd998d5654950f4de29f6ed48",
};

export const classGists = {
  warrior: "b903af03034235a04fe65dcd24870044",
  druid: "1a09d5ffad529c02090f44ea93d19e66",
  evoker: "31c0777eb2529c393be03d46723d4dad",
  rogue: "9137e2f14fa51a84c748fbd4410528fa",
  priest: "1dfafd3e60b1249201ccfaf01c321a67",
  shaman: "ec2c34115e866ba136350115d5a987c5",
} satisfies Record<WowClass, string>;
