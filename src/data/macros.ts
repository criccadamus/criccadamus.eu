import type { WowClass } from "@/lib/wow-classes";

export interface Macro {
  name: string;
  spec?: string;
  macro: string;
}

export interface ClassMacros {
  class: WowClass;
  macros: Macro[];
}

export const macrosByClass: ClassMacros[] = [
  {
    class: "warrior",
    macros: [
      {
        name: "Champion's Spear",
        macro: `#showtooltip Champion's Spear
/cast Champion's Spear
/cast [@cursor] !Champion's Spear`,
      },
      {
        name: "Intervene / Charge",
        macro: `#showtooltip
/cast [help] Intervene; Charge`,
      },
      {
        name: "Stance Toggle",
        macro: `#showtooltip
/cast Battle Stance
/cast Defensive Stance`,
      },
      {
        name: "Ravager",
        macro: `#showtooltip Ravager
/cast Ravager
/cast [@cursor] !Ravager`,
      },
      {
        name: "Recklessness + Avatar",
        macro: `#showtooltip Recklessness
/cast Recklessness
/cast Avatar`,
      },
    ],
  },
  {
    class: "druid",
    macros: [
      {
        name: "Adaptive Swarm",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Adaptive Swarm
/use [@mouseover, exists] Adaptive Swarm`,
      },
      {
        name: "Cenarion Ward",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Cenarion Ward
/use [@mouseover, exists] Cenarion Ward`,
      },
      {
        name: "Nature's Cure",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Nature's Cure
/use [@mouseover, exists] Nature's Cure`,
      },
      {
        name: "Grove Guardians",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Grove Guardians
/use [@mouseover, exists] Grove Guardians`,
      },
      {
        name: "Ironbark",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Ironbark
/use [@mouseover, exists] Ironbark`,
      },
      {
        name: "Lifebloom",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Lifebloom
/use [@mouseover, exists] Lifebloom`,
      },
      {
        name: "Regrowth",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Regrowth
/use [@mouseover, exists] Regrowth`,
      },
      {
        name: "Rejuvenation",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Rejuvenation
/use [@mouseover, exists] Rejuvenation`,
      },
      {
        name: "Swiftmend",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Swiftmend
/use [@mouseover, exists] Swiftmend`,
      },
    ],
  },
  {
    class: "evoker",
    macros: [
      {
        name: "Emerald Blossom",
        spec: "General",
        macro: `/stopcasting
#showtooltip Emerald Blossom
/use [@mouseover, exists] Emerald Blossom`,
      },
      {
        name: "Verdant Embrace",
        spec: "General",
        macro: `/stopcasting
#showtooltip Verdant Embrace(Green)
/use [@mouseover, exists] Verdant Embrace(Green)`,
      },
      {
        name: "Cauterizing Flame",
        spec: "General",
        macro: `/stopcasting
#showtooltip Cauterizing Flame(Red)
/cast [@mouseover,nomod,exists] Cauterizing Flame(Red)`,
      },
      {
        name: "Expunge",
        spec: "General",
        macro: `/stopcasting
#showtooltip Expunge
/cast [@mouseover,nomod,exists] Expunge`,
      },
      {
        name: "Living Flame",
        spec: "General",
        macro: `#showtooltip Living Flame
/use [@mouseover, exists] Living Flame`,
      },
      {
        name: "Echo",
        spec: "Preservation",
        macro: `/stopcasting
#showtooltip Echo
/use [@mouseover, exists] Echo`,
      },
      {
        name: "Reversion",
        spec: "Preservation",
        macro: `/stopcasting
#showtooltip Reversion
/use [@mouseover, exists] Reversion`,
      },
      {
        name: "Time Dilation",
        spec: "Preservation",
        macro: `/stopcasting
#showtooltip Time Dilation
/use [@mouseover, exists] Time Dilation`,
      },
    ],
  },
  {
    class: "rogue",
    macros: [
      {
        name: "Tricks of the Trade",
        macro: `/stopcasting
#showtooltip Tricks of the Trade
/cast [@mouseover] Tricks of the Trade`,
      },
      {
        name: "Sap Target",
        macro: `#showtooltip
/cleartarget
/targetenemyplayer
/cast [harm,nodead] Sap`,
      },
      {
        name: "Shadowstrike / Backstab",
        spec: "Subtlety",
        macro: `#showtooltip
/cast [bonusbar:1] Shadowstrike; Backstab`,
      },
      {
        name: "Ambush / Mutilate",
        spec: "Assassination",
        macro: `#showtooltip
/cast [bonusbar:1] Ambush; Mutilate`,
      },
    ],
  },
  {
    class: "priest",
    macros: [
      {
        name: "Pain suppression",
        spec: "Discipline",
        macro: `/stopcasting
#showtooltip Pain suppression
/cast [@mouseover] Pain suppression`,
      },
      {
        name: "Plea",
        spec: "Discipline",
        macro: `/stopcasting
#showtooltip Plea
/cast [@mouseover] Plea`,
      },
      {
        name: "Purify",
        spec: "Discipline/Holy",
        macro: `/stopcasting
#showtooltip Purify
/cast [@mouseover] Purify`,
      },
      {
        name: "Power Word: Shield",
        spec: "General",
        macro: `/stopcasting
#showtooltip Power Word: Shield
/cast [@mouseover] Power Word: Shield`,
      },
    ],
  },
  {
    class: "shaman",
    macros: [
      {
        name: "Chain Heal",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Chain Heal
/cast [@mouseover] Chain Heal`,
      },
      {
        name: "Healing Weave",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Healing Weave
/cast [@mouseover] Healing Weave`,
      },
      {
        name: "Riptide",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Riptide
/cast [@mouseover] Riptide`,
      },
      {
        name: "Purify Spirit",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Purify Spirit
/cast [@mouseover] Purify Spirit`,
      },
      {
        name: "Unleash Life",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Unleash Life
/cast [@mouseover] Unleash Life`,
      },
      {
        name: "Earth Shield",
        spec: "Restoration",
        macro: `/stopcasting
#showtooltip Earth Shield
/cast [@mouseover] Earth Shield`,
      },
    ],
  },
];
