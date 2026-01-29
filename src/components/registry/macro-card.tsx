import { IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { macroTokenColors } from "@/lib/macro-syntax";
import { cn } from "@/lib/utils";
import type { WowClassConfig } from "@/lib/wow-classes";

interface MacroCardProps {
  name: string;
  spec?: string;
  macro: string;
  classConfig: WowClassConfig;
}

function highlightMacroSyntax(macro: string): React.ReactNode[] {
  const lines = macro.split("\n");

  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // #showtooltip with optional spell name
      const showtooltipMatch = remaining.match(/^(#showtooltip)(\s+.+)?$/);
      if (showtooltipMatch) {
        parts.push(
          <span key={keyIndex++} className={macroTokenColors.showtooltip}>
            {showtooltipMatch[1]}
          </span>,
        );
        if (showtooltipMatch[2]) {
          parts.push(
            <span key={keyIndex++} className={macroTokenColors.spellName}>
              {showtooltipMatch[2]}
            </span>,
          );
        }
        remaining = "";
        continue;
      }

      // #showcooldown with spell name
      const showcooldownMatch = remaining.match(/^(#showcooldown)(\s+.+)?$/);
      if (showcooldownMatch) {
        parts.push(
          <span key={keyIndex++} className={macroTokenColors.showcooldown}>
            {showcooldownMatch[1]}
          </span>,
        );
        if (showcooldownMatch[2]) {
          parts.push(
            <span key={keyIndex++} className={macroTokenColors.spellName}>
              {showcooldownMatch[2]}
            </span>,
          );
        }
        remaining = "";
        continue;
      }

      // /command (like /cast, /use, /cancelaura, /stopcasting, etc.)
      const commandMatch = remaining.match(/^(\/\w+)/);
      if (commandMatch) {
        parts.push(
          <span key={keyIndex++} className={macroTokenColors.command}>
            {commandMatch[1]}
          </span>,
        );
        remaining = remaining.slice(commandMatch[0].length);
        continue;
      }

      // [@target] or [mod:shift] style conditionals
      const conditionalMatch = remaining.match(/^(\[[^\]]*\])/);
      if (conditionalMatch) {
        parts.push(
          <span key={keyIndex++} className={macroTokenColors.conditional}>
            {conditionalMatch[1]}
          </span>,
        );
        remaining = remaining.slice(conditionalMatch[0].length);
        continue;
      }

      // ! prefix for toggle spells
      const toggleMatch = remaining.match(/^(!)/);
      if (toggleMatch) {
        parts.push(
          <span key={keyIndex++} className={macroTokenColors.toggle}>
            {toggleMatch[1]}
          </span>,
        );
        remaining = remaining.slice(toggleMatch[0].length);
        continue;
      }

      // Regular text (spell names, etc.)
      const textMatch = remaining.match(/^([^#/[!]+)/);
      if (textMatch) {
        parts.push(
          <span key={keyIndex++} className={macroTokenColors.text}>
            {textMatch[1]}
          </span>,
        );
        remaining = remaining.slice(textMatch[0].length);
        continue;
      }

      // Fallback: single character
      parts.push(
        <span key={keyIndex++} className={macroTokenColors.fallback}>
          {remaining[0]}
        </span>,
      );
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIndex} className="leading-relaxed">
        {parts.length > 0 ? parts : "\u00A0"}
      </div>
    );
  });
}

export function MacroCard({ name, spec, macro, classConfig }: MacroCardProps) {
  const copy = () => {
    void navigator.clipboard.writeText(macro);
    toast.success("Macro copied");
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 min-w-0 overflow-hidden",
        "border rounded-lg p-4",
        "transition-all duration-300 ease-in-out",
        classConfig.border,
        classConfig.bg,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium text-foreground">{name}</h4>
          {spec && <p className="text-xs text-muted-foreground">{spec}</p>}
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={copy}>
          <IconCopy className="h-4 w-4" />
        </Button>
      </div>

      <pre className="min-w-0 rounded bg-muted/50 border border-border px-3 py-2 text-sm font-mono overflow-x-auto whitespace-pre">
        {highlightMacroSyntax(macro)}
      </pre>
    </div>
  );
}
