import { Check, Clock, MapPin, Quote, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";

import { ScoreRing } from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ORGANISATION_TYPE_LABELS } from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import { matchTone } from "@/lib/signals";
import type { MatchWithRecipient } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

interface MatchCardProps {
  match: MatchWithRecipient;
  /** Rank 1 gets the winner treatment. */
  isTop?: boolean;
  action?: ReactNode;
  className?: string;
}

/**
 * AI feature #2 on screen: the recommendation itself.
 *
 * The score never appears alone — it is always accompanied by the checklist of
 * satisfied constraints and a written justification, which is the difference
 * between "94%" and a recommendation a coordinator can actually act on.
 */
export function MatchCard({ match, isTop = false, action, className }: MatchCardProps) {
  const tone = matchTone(match.match_score);
  const r = match.recipient;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-lift",
        isTop && "border-primary/35 shadow-lift ring-1 ring-primary/20",
        className,
      )}
    >
      {isTop ? (
        <div className="flex items-center gap-2 bg-primary px-5 py-2 text-primary-foreground">
          <Trophy className="size-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide">
            AI recommended recipient
          </span>
        </div>
      ) : null}

      <CardContent className="pt-5">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-start">
            <ScoreRing
              score={match.match_score}
              ringClassName={tone.ring}
              size={isTop ? 96 : 76}
              label={`${r.name} match score`}
              sublabel="match"
            />
            <Badge variant={tone.variant} className="whitespace-nowrap">
              {tone.label}
            </Badge>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-lg font-semibold leading-tight tracking-tight">
                {r.name}
              </h3>
              <span className="text-sm text-muted-foreground">
                · {ORGANISATION_TYPE_LABELS[r.type]}
              </span>
              {r.verified ? (
                <Badge variant="success">
                  <Check className="size-3" aria-hidden />
                  Verified
                </Badge>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {formatDistance(match.distance_km)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />
                {r.capacity_min}–{r.capacity_max} meals
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden />
                {match.time_buffer_min >= 0
                  ? `${formatDuration(match.time_buffer_min)} of slack`
                  : "Past the deadline"}
              </span>
            </div>

            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {match.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-signal-low"
                    aria-hidden
                  />
                  <span className="text-foreground/90">{reason}</span>
                </li>
              ))}
            </ul>

            <figure className="mt-4 rounded-lg border-l-2 border-primary bg-primary-soft/60 p-4">
              <figcaption className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <Quote className="size-3.5" aria-hidden />
                Why this match?
              </figcaption>
              <blockquote className="text-sm leading-relaxed text-foreground/90">
                {match.explanation}
              </blockquote>
            </figure>

            {action ? <div className="mt-4">{action}</div> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
