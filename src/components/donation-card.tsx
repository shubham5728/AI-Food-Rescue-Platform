import { ArrowRight, Clock, MapPin, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  PriorityBadge,
  RiskBadge,
  StatusBadge,
} from "@/components/signal-badges";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DIETARY_LABELS, FOOD_CATEGORY_LABELS } from "@/lib/constants";
import type { ScoredDonation } from "@/lib/service";
import {
  cn,
  formatDateTime,
  formatDuration,
  formatNumber,
  localityOf,
} from "@/lib/utils";

interface DonationCardProps {
  item: ScoredDonation;
  /** Donors already know who they are; other views need the donor name. */
  showDonor?: boolean;
  className?: string;
}

export function DonationCard({
  item,
  showDonor = true,
  className,
}: DonationCardProps) {
  const { donation, donor, risk, priority } = item;
  // Settled donations have no deadline left to run against and no waste risk;
  // showing either turns a success into a false alarm.
  const settled =
    donation.status === "delivered" || donation.status === "cancelled";
  const overdue = !settled && risk.minutes_remaining < 0;

  return (
    <Card
      className={cn(
        "group relative p-4 transition-shadow hover:shadow-lift flex flex-col gap-3",
        className,
      )}
    >
      <div className="flex gap-4">
        {donation.image_url && (
          <div className="shrink-0 relative size-16 sm:size-20 rounded-md overflow-hidden border bg-muted">
            <Image
              src={donation.image_url}
              alt={donation.food_name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight tracking-tight">
                <Link
                  href={`/donations/${donation.id}`}
                  className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {donation.food_name}
                </Link>
              </h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {showDonor ? `${donor?.name ?? "Unknown donor"} · ` : ""}
                {FOOD_CATEGORY_LABELS[donation.food_type]} ·{" "}
                {DIETARY_LABELS[donation.dietary_type]}
              </p>
            </div>
            <StatusBadge status={donation.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Utensils className="size-3.5" aria-hidden />
              <span className="tabular font-medium text-foreground">
                {formatNumber(donation.meals)}
              </span>{" "}
              meals
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                overdue && "text-signal-critical",
              )}
            >
              <Clock className="size-3.5" aria-hidden />
              {settled
                ? formatDateTime(donation.updated_at)
                : overdue
                  ? formatDuration(risk.minutes_remaining)
                  : `${formatDuration(risk.minutes_remaining)} left`}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{localityOf(donation.address)}</span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {settled ? (
              <Badge variant={donation.status === "delivered" ? "low" : "secondary"}>
                {donation.status === "delivered"
                  ? `${formatNumber(donation.meals)} meals rescued`
                  : "Withdrawn"}
              </Badge>
            ) : (
              <>
                <RiskBadge level={risk.level} score={risk.score} />
                {priority.score > 0 ? (
                  <PriorityBadge level={priority.level} score={priority.score} />
                ) : null}
              </>
            )}
            <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
        </div>
      </div>
    </Card>
  );
}
