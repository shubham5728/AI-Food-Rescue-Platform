import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  ListOrdered,
  MapPin,
  Phone,
  ShieldX,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ConfirmRecipientButton,
  ReanalyseButton,
  StatusActions,
} from "@/components/actions/donation-actions";
import { AcceptDonationButton } from "@/components/actions/donation-actions";
import { MatchCard } from "@/components/match-card";
import { AllocationPanel } from "@/components/allocation-panel";
import { PickupVerification } from "@/components/actions/pickup-verification";
import { RescueClock } from "@/components/rescue-clock";
import { RiskPanel } from "@/components/risk-panel";
import {
  AiSourceNote,
  PriorityBadge,
  StatusBadge,
} from "@/components/signal-badges";
import { StatusTimeline } from "@/components/status-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { planAllocation } from "@/lib/ai/allocation";
import { applyHardConstraints } from "@/lib/ai/constraints";
import { rescoreForList } from "@/lib/ai/pipeline";
import {
  DIETARY_LABELS,
  FOOD_CATEGORY_LABELS,
  QUANTITY_UNIT_LABELS,
  SHELF_LIFE_MINUTES,
  TERMINAL_STATUSES,
} from "@/lib/constants";
import { getDb } from "@/lib/db";
import { getDonationWithRelations } from "@/lib/service";
import { PRIORITY_STYLES } from "@/lib/signals";
import { requireSession } from "@/lib/session";
import { cn, formatDateTime, formatDuration, formatNumber } from "@/lib/utils";
import { publicVerificationState } from "@/lib/verification";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const donation = await getDb().getDonationById(id);
  return { title: donation?.food_name ?? "Donation" };
}

/** Scores drifting this far from the stored pass are worth flagging. */
const DRIFT_THRESHOLD = 5;

export default async function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organisation } = await requireSession();
  const donation = await getDonationWithRelations(id);
  if (!donation) notFound();

  const recipients = await getDb().listOrganisations("recipient");
  const now = new Date();

  // Risk and priority are functions of the clock, so the page always shows the
  // live value rather than whatever was true when the donation was analysed.
  const { risk, priority } = rescoreForList(donation, recipients, now);
  const { viable, rejected } = applyHardConstraints(donation, recipients, now);

  // Feature #6: only surfaced when the donation genuinely needs splitting.
  // Uses partial matching, so recipients too small for the whole donation can
  // still take a share.
  const { viable: partialViable } = applyHardConstraints(
    donation,
    recipients,
    now,
    { allowPartial: true },
  );
  const allocation = planAllocation(donation, partialViable);

  // Feature #9: which half of the handshake this viewer is on.
  const verification = publicVerificationState(donation.id);

  // Feature #3: the food expires on the earlier of these two.
  const safeUntil = new Date(
    new Date(donation.prepared_at).getTime() +
      SHELF_LIFE_MINUTES[donation.food_type] * 60_000,
  ).toISOString();

  const drifted =
    donation.analysed_at !== null &&
    Math.abs(risk.score - donation.waste_risk_score) >= DRIFT_THRESHOLD;

  const isDonor = donation.donor_id === organisation.id;
  const isMatchedRecipient = donation.matched_recipient_id === organisation.id;
  const canAct = isDonor || isMatchedRecipient;

  const priorityStyle = PRIORITY_STYLES[priority.level];
  const openForClaims = donation.status === "available";

  const myMatch = donation.matches.find(
    (m) => m.recipient_id === organisation.id,
  );

  return (
    <div className="container py-8">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-5">
        <Link href="/donations">
          <ArrowLeft className="size-4" aria-hidden />
          All donations
        </Link>
      </Button>

      {/* ---------------------------------------------------------------- */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={donation.status} />
            <Badge variant="outline">
              {FOOD_CATEGORY_LABELS[donation.food_type]}
            </Badge>
            <Badge variant="outline">
              {DIETARY_LABELS[donation.dietary_type]}
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {donation.food_name}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {donation.donor?.name} · posted {formatDateTime(donation.created_at)}
          </p>
        </div>

        {canAct ? <ReanalyseButton donationId={donation.id} /> : null}
      </header>

      {drifted ? (
        <p className="mt-5 flex items-start gap-2.5 rounded-lg border border-signal-medium/30 bg-signal-medium/[0.08] p-4 text-sm">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-signal-medium"
            aria-hidden
          />
          <span>
            Conditions have moved since this was last analysed — waste risk was{" "}
            <span className="tabular font-medium">{donation.waste_risk_score}</span>,
            it is now{" "}
            <span className="tabular font-medium">{risk.score}</span>. The written
            explanations below reflect the earlier pass.
            {canAct ? " Re-run the analysis to refresh them." : ""}
          </span>
        </p>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-7">
          {/* Food facts ------------------------------------------------- */}
          <Card>
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="flex items-center gap-2">
                <Utensils className="size-4 text-primary" aria-hidden />
                Donation details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
                <Fact label="Quantity">
                  {formatNumber(donation.quantity)}{" "}
                  {QUANTITY_UNIT_LABELS[donation.quantity_unit]}
                </Fact>
                <Fact label="Meals">{formatNumber(donation.meals)}</Fact>
                <Fact label="Estimated weight">{donation.weight_kg} kg</Fact>
                <Fact label="Prepared">{formatDateTime(donation.prepared_at)}</Fact>
                <Fact label="Pickup opens">
                  {formatDateTime(donation.pickup_start)}
                </Fact>
                <Fact label="Pickup deadline">
                  <span
                    className={cn(
                      risk.minutes_remaining < 0 && "text-signal-critical",
                    )}
                  >
                    {formatDateTime(donation.pickup_deadline)}
                  </span>
                </Fact>
                <Fact label="Allergens" className="sm:col-span-3">
                  {donation.allergens.length > 0
                    ? donation.allergens.join(", ")
                    : "None declared"}
                </Fact>
                <Fact label="Pickup address" className="sm:col-span-3">
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    {donation.address}
                  </span>
                </Fact>
                {donation.notes ? (
                  <Fact label="Notes" className="sm:col-span-3">
                    {donation.notes}
                  </Fact>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          {/* AI feature #1 ---------------------------------------------- */}
          {/* AI feature #6 — only when a single recipient cannot take it all. */}
          {!allocation.single_recipient && allocation.slices.length > 0 ? (
            <AllocationPanel plan={allocation} />
          ) : null}

          <RiskPanel
            risk={risk}
            explanation={donation.waste_risk_explanation}
            reasons={
              donation.waste_risk_reasons.length > 0
                ? donation.waste_risk_reasons
                : risk.reasons
            }
            aiSource={donation.ai_source}
          />

          {/* AI feature #2 ---------------------------------------------- */}
          <section aria-labelledby="matches-heading" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="matches-heading"
                className="flex items-center gap-2 text-lg font-semibold tracking-tight"
              >
                <Sparkles className="size-4 text-primary" aria-hidden />
                AI recommended recipients
              </h2>
              <AiSourceNote source={donation.ai_source} />
            </div>

            {donation.matches.length > 0 ? (
              <ul className="space-y-4">
                {donation.matches.map((match, index) => (
                  <li key={match.id}>
                    <MatchCard
                      match={match}
                      isTop={index === 0}
                      action={
                        openForClaims ? (
                          isDonor ? (
                            <ConfirmRecipientButton
                              donationId={donation.id}
                              recipientId={match.recipient_id}
                              recipientName={match.recipient.name}
                              variant={index === 0 ? "default" : "outline"}
                            />
                          ) : match.recipient_id === organisation.id ? (
                            <AcceptDonationButton donationId={donation.id} />
                          ) : null
                        ) : null
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={ShieldX}
                title="No recipient clears every constraint"
                description="Extending the pickup deadline, splitting the quantity, or relaxing the allergen list would open up options."
              />
            )}

            {rejected.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Ruled out before scoring ({rejected.length})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    These organisations were removed by hard constraints, so no
                    score was ever computed for them.
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border text-sm">
                    {rejected.map((r) => (
                      <li
                        key={r.recipient_id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                      >
                        <span className="font-medium">{r.recipient_name}</span>
                        <span className="text-muted-foreground">{r.reason}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </section>
        </div>

        {/* -------------------------------------------------------------- */}
        <aside className="space-y-7">
          {/* Feature #3 — the clock that actually ticks. */}
          <RescueClock
            pickupDeadline={donation.pickup_deadline}
            safeUntil={safeUntil}
            windowStart={donation.prepared_at}
            frozen={TERMINAL_STATUSES.includes(donation.status)}
          />

          {/* Feature #9 — the handover handshake, shown to whoever acts next. */}
          {canAct && donation.status === "pickup_assigned" ? (
            <PickupVerification
              donationId={donation.id}
              stage="collection"
              role={isDonor ? "issuer" : "redeemer"}
              state={verification.collection}
            />
          ) : null}
          {canAct &&
          (donation.status === "picked_up" || donation.status === "in_transit") ? (
            <PickupVerification
              donationId={donation.id}
              stage="delivery"
              role={isMatchedRecipient ? "issuer" : "redeemer"}
              state={verification.delivery}
            />
          ) : null}

          {/* AI feature #3 ---------------------------------------------- */}
          <Card>
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className={cn("size-4", priorityStyle.text)} aria-hidden />
                Pickup priority
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <p className={cn("text-4xl font-semibold tracking-tight", priorityStyle.text)}>
                {priority.score}
                <span className="text-xl text-muted-foreground">/100</span>
              </p>
              <Progress
                value={priority.score}
                className="mt-3 h-2"
                indicatorClassName={priorityStyle.bar}
              />
              <div className="mt-3">
                <PriorityBadge level={priority.level} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {donation.priority_reason || priority.reason}
              </p>

              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden />
                {risk.minutes_remaining >= 0
                  ? `${formatDuration(risk.minutes_remaining)} until the deadline`
                  : `Deadline ${formatDuration(risk.minutes_remaining)}`}
              </p>
            </CardContent>
          </Card>

          {/* Lifecycle -------------------------------------------------- */}
          <Card>
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle>Tracking</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <StatusTimeline status={donation.status} history={donation.history} />

              {donation.matched_recipient ? (
                <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Matched recipient
                  </p>
                  <p className="mt-1 font-medium">
                    {donation.matched_recipient.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5" aria-hidden />
                    {donation.matched_recipient.contact_person} ·{" "}
                    {donation.matched_recipient.phone}
                  </p>
                </div>
              ) : null}

              {canAct ? (
                <StatusActions
                  donationId={donation.id}
                  status={donation.status}
                  className="mt-5"
                />
              ) : null}

              {!canAct && openForClaims && myMatch ? (
                <AcceptDonationButton
                  donationId={donation.id}
                  className="mt-5 w-full"
                />
              ) : null}
            </CardContent>
          </Card>

          {/* Donor contact ---------------------------------------------- */}
          <Card>
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle>Donor</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 text-sm">
              <p className="font-medium">{donation.donor?.name}</p>
              <p className="mt-1 text-muted-foreground">
                {donation.donor?.contact_person}
              </p>
              <p className="mt-1 text-muted-foreground">{donation.donor?.phone}</p>
              <p className="mt-1 text-muted-foreground">{donation.donor?.email}</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Fact({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{children}</dd>
    </div>
  );
}
