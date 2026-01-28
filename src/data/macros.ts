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
        macro: `#showtooltip
#showcooldown Adaptive Swarm
/use [@mouseover, exists] Adaptive Swarm`,
      },
      {
        name: "Cenarion Ward",
        spec: "Restoration",
        macro: `#showtooltip
#showcooldown Cenarion Ward
/use [@mouseover, exists] Cenarion Ward`,
      },
      {
        name: "Nature's Cure",
        spec: "Restoration",
        macro: `#showtooltip
#showcooldown Nature's Cure
/use [@mouseover, exists] Nature's Cure`,
      },
      {
        name: "Grove Guardians",
        spec: "Restoration",
        macro: `#showtooltip
#showcooldown Grove Guardians
/use [@mouseover, exists] Grove Guardians`,
      },
      {
        name: "Ironbark",
        spec: "Restoration",
        macro: `#showtooltip
#showcooldown Ironbark
/use [@mouseover, exists] Ironbark`,
      },
      {
        name: "Lifebloom",
        spec: "Restoration",
        macro: `#showtooltip
#showcooldown Lifebloom
/use [@mouseover, exists] Lifebloom`,
      },
      {
        name: "Regrowth",
        spec: "Restoration",
        macro: `#showtooltip
#showcooldown Regrowth
/use [@mouseover, exists] Regrowth`,
      },
      {
        name: "Rejuvenation",
        spec: "Restoration",
        macro: `#showtooltip
#showcooldown Rejuvenation
/use [@mouseover, exists] Rejuvenation`,
      },
      {
        name: "Swiftmend",
        spec: "Restoration",
        macro: `#showtooltip
#showcooldown Swiftmend
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
        macro: `#showtooltip Emerald Blossom
/use [@mouseover, exists] Emerald Blossom`,
      },
      {
        name: "Verdant Embrace",
        spec: "General",
        macro: `#showtooltip Verdant Embrace(Green)
/use [@mouseover, exists] Verdant Embrace(Green)`,
      },
      {
        name: "Cauterizing Flame",
        spec: "General",
        macro: `#showtooltip Cauterizing Flame(Red)
/stopcasting
/cast [@mouseover,nomod,exists] Cauterizing Flame(Red)`,
      },
      {
        name: "Expunge",
        spec: "General",
        macro: `#showtooltip Expunge
/stopcasting
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
        macro: `#showtooltip Echo
/use [@mouseover, exists] Echo`,
      },
      {
        name: "Reversion",
        spec: "Preservation",
        macro: `#showtooltip Reversion
/use [@mouseover, exists] Reversion`,
      },
      {
        name: "Time Dilation",
        spec: "Preservation",
        macro: `#showtooltip Time Dilation
/use [@mouseover, exists] Time Dilation`,
      },
      {
        name: "Prescience",
        spec: "Augmentation",
        macro: `#showtooltip Prescience
/stopcasting
/cast [@mouseover,nomod,exists] Prescience`,
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
        name: "Vanish + Shadowstrike",
        spec: "Subtlety",
        macro: `#showtooltip
/cast Vanish
/cast Shadowstrike
/stopattack`,
      },
      {
        name: "Shadow Dance + Shadowstrike",
        spec: "Subtlety",
        macro: `#showtooltip
/cast Shadow Dance
/cast Shadowstrike`,
      },
      {
        name: "Ambush / Mutilate",
        spec: "Assassination",
        macro: `#showtooltip
/cast [bonusbar:1] Ambush; Mutilate`,
      },
    ],
  },
];
