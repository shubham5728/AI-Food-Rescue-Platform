import { AlertTriangle, Flame, Leaf, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_STYLES,
  RISK_STYLES,
  STATUS_STYLES,
  matchTone,
} from "@/lib/signals";
import type {
  AiSource,
  DonationStatus,
  PriorityLevel,
  RiskLevel,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function RiskBadge({
  level,
  score,
  className,
}: {
  level: RiskLevel;
  score?: number;
  className?: string;
}) {
  const style = RISK_STYLES[level];
  const Icon = level === "HIGH" ? Flame : level === "MEDIUM" ? AlertTriangle : Leaf;
  return (
    <Badge variant={style.variant} className={className}>
      <Icon className="size-3.5" aria-hidden />
      {style.label}
      {score !== undefined ? <span className="tabular">· {score}</span> : null}
    </Badge>
  );
}

export function PriorityBadge({
  level,
  score,
  className,
}: {
  level: PriorityLevel;
  score?: number;
  className?: string;
}) {
  const style = PRIORITY_STYLES[level];
  return (
    <Badge
      variant={style.variant}
      className={cn(
        level === "CRITICAL" && "animate-pulse-ring",
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} aria-hidden />
      Priority {style.label}
      {score !== undefined ? <span className="tabular">· {score}</span> : null}
    </Badge>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: DonationStatus;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  const Icon = style.icon;
  return (
    <Badge variant={style.variant} className={className}>
      <Icon className="size-3.5" aria-hidden />
      {style.label}
    </Badge>
  );
}

export function MatchBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const tone = matchTone(score);
  return (
    <Badge variant={tone.variant} className={className}>
      <Sparkles className="size-3.5" aria-hidden />
      <span className="tabular">{score}%</span> {tone.label}
    </Badge>
  );
}

/**
 * States plainly whether the prose came from the LLM or the scoring engine.
 * The scores themselves are always the engine's.
 */
export function AiSourceNote({
  source,
  className,
}: {
  source: AiSource;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Sparkles className="size-3" aria-hidden />
      {source === "openai"
        ? "Scored by the FoodBridge engine, explained by GPT"
        : "Scored and explained by the FoodBridge engine"}
    </span>
  );
}
