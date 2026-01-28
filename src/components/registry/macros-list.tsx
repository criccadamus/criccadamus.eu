import { macrosByClass } from "@/data/macros";
import { wowClasses } from "@/lib/wow-classes";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MacroCard } from "./macro-card";

export function MacrosList() {
  return (
    <Tabs defaultValue={macrosByClass[0].class}>
      <TabsList>
        {macrosByClass.map((classData) => {
          const classConfig = wowClasses[classData.class];
          return (
            <TabsTrigger key={classData.class} value={classData.class} style={{ color: classConfig.color }}>
              {classConfig.name}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {macrosByClass.map((classData) => {
        const classConfig = wowClasses[classData.class];
        return (
          <TabsContent key={classData.class} value={classData.class}>
            <div className="grid gap-3 md:grid-cols-2 mt-4">
              {classData.macros.map((macro) => (
                <MacroCard
                  key={macro.name}
                  name={macro.name}
                  spec={macro.spec}
                  macro={macro.macro}
                  classConfig={classConfig}
                />
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
