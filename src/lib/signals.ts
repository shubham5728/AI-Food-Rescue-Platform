import {
  BadgeCheck,
  CheckCircle2,
  CircleDashed,
  Clock,
  Handshake,
  Navigation,
  PackageCheck,
  Truck,
  UserCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { DonationStatus, PriorityLevel, RiskLevel } from "./types";

/**
 * The visual language for the four things that must be obvious at a glance:
 * waste risk, AI match, pickup priority and donation status.
 *
 * Every mapping pairs a colour with an icon and a word, so meaning is never
 * carried by colour alone.
 */

export type BadgeVariant =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info"
  | "secondary";

export const RISK_STYLES: Record<
  RiskLevel,
  { label: string; variant: BadgeVariant; dot: string; bar: string; text: string }
> = {
  HIGH: {
    label: "High risk",
    variant: "critical",
    dot: "bg-signal-critical",
    bar: "bg-signal-critical",
    text: "text-signal-critical",
  },
  MEDIUM: {
    label: "Medium risk",
    variant: "medium",
    dot: "bg-signal-medium",
    bar: "bg-signal-medium",
    text: "text-signal-medium",
  },
  LOW: {
    label: "Low risk",
    variant: "low",
    dot: "bg-signal-low",
    bar: "bg-signal-low",
    text: "text-signal-low",
  },
};

export const PRIORITY_STYLES: Record<
  PriorityLevel,
  { label: string; variant: BadgeVariant; dot: string; bar: string; text: string }
> = {
  CRITICAL: {
    label: "Critical",
    variant: "critical",
    dot: "bg-signal-critical",
    bar: "bg-signal-critical",
    text: "text-signal-critical",
  },
  HIGH: {
    label: "High",
    variant: "high",
    dot: "bg-signal-high",
    bar: "bg-signal-high",
    text: "text-signal-high",
  },
  MEDIUM: {
    label: "Medium",
    variant: "medium",
    dot: "bg-signal-medium",
    bar: "bg-signal-medium",
    text: "text-signal-medium",
  },
  LOW: {
    label: "Low",
    variant: "low",
    dot: "bg-signal-low",
    bar: "bg-signal-low",
    text: "text-signal-low",
  },
};

export const STATUS_STYLES: Record<
  DonationStatus,
  { label: string; variant: BadgeVariant; icon: LucideIcon; dot: string }
> = {
  available: {
    label: "Available",
    variant: "medium",
    icon: CircleDashed,
    dot: "bg-signal-medium",
  },
  matched: {
    label: "Matched",
    variant: "info",
    icon: Handshake,
    dot: "bg-signal-info",
  },
  pickup_scheduled: {
    label: "Pickup Scheduled",
    variant: "info",
    icon: Clock,
    dot: "bg-signal-info",
  },
  pickup_assigned: {
    label: "Pickup Assigned",
    variant: "info",
    icon: UserCheck,
    dot: "bg-signal-info",
  },
  picked_up: {
    label: "Picked Up",
    variant: "high",
    icon: Truck,
    dot: "bg-signal-high",
  },
  in_transit: {
    label: "In Transit",
    variant: "high",
    icon: Navigation,
    dot: "bg-signal-high",
  },
  delivered: {
    label: "Delivered",
    variant: "low",
    icon: PackageCheck,
    dot: "bg-signal-low",
  },
  completed: {
    label: "Completed",
    variant: "low",
    icon: BadgeCheck,
    dot: "bg-signal-low",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary",
    icon: XCircle,
    dot: "bg-muted-foreground",
  },
};

export const STATUS_ICONS = {
  available: CircleDashed,
  matched: Handshake,
  pickup_scheduled: Clock,
  pickup_assigned: UserCheck,
  picked_up: Truck,
  in_transit: Navigation,
  delivered: CheckCircle2,
  completed: BadgeCheck,
  cancelled: XCircle,
} satisfies Record<DonationStatus, LucideIcon>;

/** Match quality bands. A viable match is never painted as a failure. */
export function matchTone(score: number): {
  label: string;
  variant: BadgeVariant;
  ring: string;
  text: string;
} {
  if (score >= 90)
    return {
      label: "Excellent match",
      variant: "low",
      ring: "stroke-signal-low",
      text: "text-signal-low",
    };
  if (score >= 75)
    return {
      label: "Strong match",
      variant: "info",
      ring: "stroke-signal-info",
      text: "text-signal-info",
    };
  if (score >= 60)
    return {
      label: "Workable match",
      variant: "medium",
      ring: "stroke-signal-medium",
      text: "text-signal-medium",
    };
  return {
    label: "Weak match",
    variant: "secondary",
    ring: "stroke-muted-foreground",
    text: "text-muted-foreground",
  };
}
