import { RegistryItemCard } from "./registry-item-card";

interface RegistryItem {
  name: string;
  title: string;
  description: string;
  addon: "details" | "plater" | "elvui" | "weakauras";
}

const registryItems: RegistryItem[] = [
  {
    name: "details-profile",
    title: "Details! Profile",
    description: "Clean and minimal Details! damage meter profile",
    addon: "details",
  },
  {
    name: "plater-profile",
    title: "Plater Profile",
    description: "Customized Plater nameplates configuration",
    addon: "plater",
  },
  {
    name: "elvui-profile",
    title: "ElvUI Profile",
    description: "Full ElvUI interface profile",
    addon: "elvui",
  },
];

export function RegistryList() {
  return (
    <div className="flex flex-col gap-4">
      {registryItems.map((item) => (
        <RegistryItemCard key={item.name} item={item} />
      ))}
    </div>
  );
}
