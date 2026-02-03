import type { ReactNode } from "react";

import { IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

import type { WowClassConfig } from "@/lib/wow-classes";

import { Button } from "@/components/ui/button";
import { macroTokenColors } from "@/lib/macro-syntax";
import { cn } from "@/lib/utils";

interface MacroCardProps {
  name: string;
  spec?: string;
  macro: string;
  classConfig: WowClassConfig;
}

type TokenParseResult = {
  nodes: ReactNode[];
  consumed: number;
  keyIndex: number;
};

function parseNextToken(remaining: string, keyIndex: number): TokenParseResult {
  const showtooltipMatch = remaining.match(/^(#showtooltip)(\s+.+)?$/);
  if (showtooltipMatch) {
    let nextIndex = keyIndex;
    const nodes: ReactNode[] = [
      <span key={nextIndex++} className={macroTokenColors.showtooltip}>
        {showtooltipMatch[1]}
      </span>,
    ];
    if (showtooltipMatch[2]) {
      nodes.push(
        <span key={nextIndex++} className={macroTokenColors.spellName}>
          {showtooltipMatch[2]}
        </span>,
      );
    }
    return { nodes, consumed: remaining.length, keyIndex: nextIndex };
  }

  const showcooldownMatch = remaining.match(/^(#showcooldown)(\s+.+)?$/);
  if (showcooldownMatch) {
    let nextIndex = keyIndex;
    const nodes: ReactNode[] = [
      <span key={nextIndex++} className={macroTokenColors.showcooldown}>
        {showcooldownMatch[1]}
      </span>,
    ];
    if (showcooldownMatch[2]) {
      nodes.push(
        <span key={nextIndex++} className={macroTokenColors.spellName}>
          {showcooldownMatch[2]}
        </span>,
      );
    }
    return { nodes, consumed: remaining.length, keyIndex: nextIndex };
  }

  const commandMatch = remaining.match(/^(\/\w+)/);
  if (commandMatch) {
    let nextIndex = keyIndex;
    return {
      nodes: [
        <span key={nextIndex++} className={macroTokenColors.command}>
          {commandMatch[1]}
        </span>,
      ],
      consumed: commandMatch[0].length,
      keyIndex: nextIndex,
    };
  }

  const conditionalMatch = remaining.match(/^(\[[^\]]*\])/);
  if (conditionalMatch) {
    let nextIndex = keyIndex;
    return {
      nodes: [
        <span key={nextIndex++} className={macroTokenColors.conditional}>
          {conditionalMatch[1]}
        </span>,
      ],
      consumed: conditionalMatch[0].length,
      keyIndex: nextIndex,
    };
  }

  const toggleMatch = remaining.match(/^(!)/);
  if (toggleMatch) {
    let nextIndex = keyIndex;
    return {
      nodes: [
        <span key={nextIndex++} className={macroTokenColors.toggle}>
          {toggleMatch[1]}
        </span>,
      ],
      consumed: toggleMatch[0].length,
      keyIndex: nextIndex,
    };
  }

  const textMatch = remaining.match(/^([^#/[!]+)/);
  if (textMatch) {
    let nextIndex = keyIndex;
    return {
      nodes: [
        <span key={nextIndex++} className={macroTokenColors.text}>
          {textMatch[1]}
        </span>,
      ],
      consumed: textMatch[0].length,
      keyIndex: nextIndex,
    };
  }

  let nextIndex = keyIndex;
  return {
    nodes: [
      <span key={nextIndex++} className={macroTokenColors.fallback}>
        {remaining[0]}
      </span>,
    ],
    consumed: 1,
    keyIndex: nextIndex,
  };
}

function renderMacroLine(line: string, lineIndex: number) {
  const parts: ReactNode[] = [];
  let remaining = line;
  let keyIndex = 0;

  while (remaining.length > 0) {
    const result = parseNextToken(remaining, keyIndex);
    parts.push(...result.nodes);
    keyIndex = result.keyIndex;
    remaining = remaining.slice(result.consumed);
  }

  return (
    <div key={lineIndex} className="leading-relaxed">
      {parts.length > 0 ? parts : "\u00A0"}
    </div>
  );
}

function highlightMacroSyntax(macro: string): ReactNode[] {
  const lines = macro.split("\n");

  return lines.map((line, lineIndex) => renderMacroLine(line, lineIndex));
}

export function MacroCard({ name, spec, macro, classConfig }: MacroCardProps) {
  const copy = () => {
    void navigator.clipboard.writeText(macro);
    toast.success("Macro copied");
  };

  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col gap-3 overflow-hidden",
        "rounded-lg border p-4",
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
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copy}>
          <IconCopy className="h-4 w-4" />
        </Button>
      </div>

      <pre className="scrollbar-hidden min-w-0 overflow-x-auto rounded border border-border/70 bg-background/80 px-3 py-2 font-mono text-sm whitespace-pre text-foreground">
        {highlightMacroSyntax(macro)}
      </pre>
    </div>
  );
}
