import { SHELF_LIFE_MINUTES } from "@/lib/constants";
import { haversineKm, travelMinutes } from "@/lib/geo";
import type {
  DietaryType,
  Donation,
  Organisation,
  RejectedCandidate,
} from "@/lib/types";
import { minutesBetween } from "@/lib/utils";

/**
 * Step 1 of the AI architecture: deterministic hard filtering.
 *
 * Nothing here is a judgement call — every rule encodes a fact that makes the
 * pairing impossible (unsafe food, physically unreachable, dietary violation).
 * Running this before any scoring is what stops the model from ever
 * recommending a recipient that cannot actually take the food.
 */

/**
 * Diets, from strictest to most permissive. Food prepared to a stricter
 * standard is always safe for an organisation that accepts a looser one:
 * vegan food is acceptable wherever vegetarian food is.
 */
const DIET_STRICTNESS: Record<DietaryType, number> = {
  vegan: 2,
  vegetarian: 1,
  non_vegetarian: 0,
};

export function dietIsAcceptable(
  food: DietaryType,
  accepts: DietaryType[],
): boolean {
  if (accepts.length === 0) return false;
  return accepts.some(
    (accepted) => DIET_STRICTNESS[food] >= DIET_STRICTNESS[accepted],
  );
}

export interface CandidateContext {
  recipient: Organisation;
  distance_km: number;
  travel_min: number;
  /** Earliest the recipient could physically be at the pickup point. */
  earliest_arrival: Date;
  /** Minutes between that arrival and the pickup deadline. */
  time_buffer_min: number;
  /** Minutes of shelf life left at the moment of arrival. */
  freshness_buffer_min: number;
}

export interface ConstraintResult {
  viable: CandidateContext[];
  rejected: RejectedCandidate[];
}

/**
 * Applies every hard constraint and returns both sides of the split. The
 * rejected list is kept (rather than discarded) so the donation page can show
 * a judge *why* eleven organisations were never considered.
 */
export function applyHardConstraints(
  donation: Donation,
  recipients: Organisation[],
  now: Date = new Date(),
): ConstraintResult {
  const viable: CandidateContext[] = [];
  const rejected: RejectedCandidate[] = [];

  const deadline = new Date(donation.pickup_deadline);
  const pickupStart = new Date(donation.pickup_start);
  const preparedAt = new Date(donation.prepared_at);
  const shelfLife = SHELF_LIFE_MINUTES[donation.food_type];
  const spoilsAt = new Date(preparedAt.getTime() + shelfLife * 60000);

  const reject = (recipient: Organisation, reason: string) =>
    rejected.push({
      recipient_id: recipient.id,
      recipient_name: recipient.name,
      reason,
    });

  for (const recipient of recipients) {
    if (recipient.role !== "recipient") continue;

    if (!recipient.verified) {
      reject(recipient, "Organisation is not verified");
      continue;
    }

    if (!dietIsAcceptable(donation.dietary_type, recipient.dietary_requirements)) {
      reject(
        recipient,
        `Cannot accept ${donation.dietary_type.replace("_", "-")} food`,
      );
      continue;
    }

    const capacity = recipient.capacity_max ?? 0;
    if (capacity < donation.meals) {
      reject(
        recipient,
        `Capacity is ${capacity} meals, donation is ${donation.meals}`,
      );
      continue;
    }

    const excluded = recipient.excluded_allergens ?? [];
    const conflict = donation.allergens.find((a) =>
      excluded.includes(a.toLowerCase()),
    );
    if (conflict) {
      reject(recipient, `Cannot handle the allergen "${conflict}"`);
      continue;
    }

    const accepted = recipient.accepted_food_types ?? [];
    if (accepted.length > 0 && !accepted.includes(donation.food_type)) {
      reject(recipient, `Does not accept ${donation.food_type.replace("_", " ")}`);
      continue;
    }

    // Rounded once, here, so the constraint check, the score, the stored row
    // and every rendered label all quote the same figure.
    const distance_km =
      Math.round(
        haversineKm(
          donation.latitude,
          donation.longitude,
          recipient.latitude,
          recipient.longitude,
        ) * 100,
      ) / 100;
    const radius = recipient.pickup_radius_km ?? 0;
    if (distance_km > radius) {
      reject(
        recipient,
        `${distance_km.toFixed(1)} km away, outside their ${radius} km range`,
      );
      continue;
    }

    const travel_min = travelMinutes(distance_km);
    const lead = recipient.pickup_lead_time_min ?? 30;
    // They cannot arrive before the donor's window opens, however fast they are.
    const earliest_arrival = new Date(
      Math.max(
        now.getTime() + (lead + travel_min) * 60000,
        pickupStart.getTime(),
      ),
    );

    const time_buffer_min = minutesBetween(earliest_arrival, deadline);
    if (time_buffer_min < 0) {
      reject(
        recipient,
        `Needs ${lead + travel_min} min to collect, deadline is sooner`,
      );
      continue;
    }

    const freshness_buffer_min = minutesBetween(earliest_arrival, spoilsAt);
    if (freshness_buffer_min < 0) {
      reject(recipient, "Food would pass its safe holding time before arrival");
      continue;
    }

    viable.push({
      recipient,
      distance_km,
      travel_min,
      earliest_arrival,
      time_buffer_min,
      freshness_buffer_min,
    });
  }

  return { viable, rejected };
}
