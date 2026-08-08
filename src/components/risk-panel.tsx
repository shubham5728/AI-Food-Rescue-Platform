import { Flame, Info } from "lucide-react";

import { ScoreRing } from "@/components/score-ring";
import { AiSourceNote, RiskBadge } from "@/components/signal-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { RiskAssessment } from "@/lib/ai/risk";
import { RISK_STYLES } from "@/lib/signals";
import type { AiSource } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RiskPanelProps {
  risk: RiskAssessment;
  explanation: string;
  reasons: string[];
  aiSource: AiSource;
  className?: string;
}

/**
 * AI feature #1 on screen. The score, the level, the reasons, the prose
 * explanation, and the factor breakdown that produced the number — so the
 * output is inspectable rather than a magic percentage.
 */
export function RiskPanel({
  risk,
  explanation,
  reasons,
  aiSource,
  className,
}: RiskPanelProps) {
  const style = RISK_STYLES[risk.level];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border bg-muted/40">
        <CardTitle className="flex items-center gap-2">
          <Flame className={cn("size-4", style.text)} aria-hidden />
          Waste risk prediction
        </CardTitle>
        <RiskBadge level={risk.level} />
      </CardHeader>

      <CardContent className="pt-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ScoreRing
            score={risk.score}
            ringClassName={style.text.replace("text-", "stroke-")}
            size={104}
            label="Waste risk"
            sublabel="/ 100"
          />

          <div className="min-w-0 flex-1">
            <p className={cn("text-2xl font-semibold tracking-tight", style.text)}>
              {risk.score}% · {style.label}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {explanation}
            </p>
          </div>
        </div>

        {reasons.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm">
                <span
                  className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", style.dot)}
                  aria-hidden
                />
                <span className="text-foreground/90">{reason}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Settled donations carry no factor breakdown — the score is simply zero. */}
        {risk.factors.length > 0 ? (
          <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Info className="size-3.5" aria-hidden />
              How the score was built
            </p>
            <dl className="space-y-2.5">
              {risk.factors.map((factor) => (
                <div
                  key={factor.key}
                  className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-3"
                >
                  <dt className="truncate text-xs font-medium text-foreground">
                    {factor.label}
                  </dt>
                  <dd className="min-w-0">
                    <Progress
                      value={factor.value * 100}
                      className="h-1.5"
                      indicatorClassName={style.bar}
                    />
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {factor.detail}
                    </p>
                  </dd>
                  <dd className="tabular text-right text-xs font-semibold text-muted-foreground">
                    +{factor.points}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <AiSourceNote source={aiSource} className="mt-4" />
      </CardContent>
    </Card>
  );
}
