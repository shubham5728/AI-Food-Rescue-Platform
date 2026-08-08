import { z } from "zod";

import { COMMON_ALLERGENS, DONOR_TYPES, RECIPIENT_TYPES } from "./constants";

export const foodCategorySchema = z.enum([
  "cooked_meal",
  "bakery",
  "produce",
  "dairy",
  "packaged",
  "beverage",
  "dry_goods",
]);

export const dietaryTypeSchema = z.enum([
  "vegetarian",
  "vegan",
  "non_vegetarian",
]);

export const quantityUnitSchema = z.enum([
  "meals",
  "kg",
  "litres",
  "packets",
  "trays",
]);

export const donationStatusSchema = z.enum([
  "available",
  "matched",
  "pickup_scheduled",
  "pickup_assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "completed",
  "cancelled",
]);

/** A 6-digit pickup code, or a scanned QR payload carrying one. */
export const verifyPickupSchema = z.object({
  stage: z.enum(["collection", "delivery"]),
  code: z
    .string()
    .trim()
    .min(4, "Enter the code shown by the other party")
    .max(120),
});

export const issueVerificationSchema = z.object({
  stage: z.enum(["collection", "delivery"]),
});

export const organisationTypeSchema = z.enum([
  ...DONOR_TYPES,
  ...RECIPIENT_TYPES,
] as [string, ...string[]]);

/**
 * `datetime-local` inputs submit "YYYY-MM-DDTHH:mm" with no zone. Parse in the
 * server's local zone and normalise to ISO so everything downstream compares
 * absolute instants.
 */
const localDateTime = z
  .string()
  .min(1, "Required")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Not a valid date/time")
  .transform((v) => new Date(v).toISOString());

const allergen = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => v.length > 0, "Allergen cannot be blank");

export const createDonationSchema = z
  .object({
    food_name: z
      .string()
      .trim()
      .min(2, "Give the food a recognisable name")
      .max(120),
    food_type: foodCategorySchema,
    quantity: z.coerce
      .number()
      .positive("Quantity must be greater than zero")
      .max(100000),
    quantity_unit: quantityUnitSchema,
    meals: z.coerce
      .number()
      .int("Use a whole number of meals")
      .positive("Meals must be greater than zero")
      .max(50000),
    dietary_type: dietaryTypeSchema,
    allergens: z.array(allergen).max(20).default([]),
    prepared_at: localDateTime,
    pickup_start: localDateTime,
    pickup_deadline: localDateTime,
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    address: z.string().trim().min(3, "Enter a pickup address").max(300),
    notes: z.string().trim().max(1000).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.pickup_deadline) <= new Date(data.pickup_start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pickup_deadline"],
        message: "Pickup deadline must be after the pickup start time",
      });
    }
    if (new Date(data.prepared_at) > new Date(data.pickup_deadline)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prepared_at"],
        message: "Food cannot be prepared after its own pickup deadline",
      });
    }
  });

export type CreateDonationInput = z.infer<typeof createDonationSchema>;

export const updateStatusSchema = z.object({
  status: donationStatusSchema,
  note: z.string().trim().max(500).optional().nullable(),
});

export const acceptDonationSchema = z.object({
  recipient_id: z.string().min(1),
});

const baseOrganisation = {
  name: z.string().trim().min(2, "Organisation name is required").max(160),
  type: organisationTypeSchema,
  contact_person: z.string().trim().min(2, "Contact person is required").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a contact phone number")
    .max(30),
  email: z.string().trim().email("Enter a valid email address"),
  address: z.string().trim().min(3, "Enter an address").max(300),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
};

export const createDonorSchema = z.object({
  ...baseOrganisation,
  role: z.literal("donor"),
});

export const createRecipientSchema = z
  .object({
    ...baseOrganisation,
    role: z.literal("recipient"),
    capacity_min: z.coerce.number().int().min(0).max(50000),
    capacity_max: z.coerce.number().int().positive().max(50000),
    typical_quantity: z.coerce.number().int().positive().max(50000),
    dietary_requirements: z
      .array(dietaryTypeSchema)
      .min(1, "Select at least one diet you can accept"),
    accepted_food_types: z.array(foodCategorySchema).default([]),
    excluded_allergens: z.array(allergen).default([]),
    pickup_radius_km: z.coerce.number().positive().max(500),
    can_pickup: z.coerce.boolean().default(true),
    pickup_lead_time_min: z.coerce.number().int().min(0).max(1440).default(30),
  });

export const registerSchema = z.discriminatedUnion("role", [
  createDonorSchema,
  createRecipientSchema,
]).superRefine((data, ctx) => {
  if (data.role === "recipient") {
    if (data.capacity_max < data.capacity_min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capacity_max"],
        message: "Maximum capacity must be at least the minimum",
      });
    }
    if (data.typical_quantity > data.capacity_max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["typical_quantity"],
        message: "Typical quantity cannot exceed maximum capacity",
      });
    }
  }
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const knownAllergens = COMMON_ALLERGENS;

/** Flattens a ZodError into `{ field: message }` for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
