"use client";

import { Building2, Loader2, Store, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, RequestError } from "@/lib/client-api";
import {
  COMMON_ALLERGENS,
  DIETARY_LABELS,
  DONOR_TYPES,
  FOOD_CATEGORY_LABELS,
  ORGANISATION_TYPE_LABELS,
  RECIPIENT_TYPES,
} from "@/lib/constants";
import type { DietaryType, FoodCategory, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fieldErrors, registerSchema } from "@/lib/validation";
import { useLanguage } from "@/lib/i18n/context";

/** Bangalore city centre, so a new profile starts somewhere plausible. */
const DEFAULT_LOCATION = { latitude: "12.9716", longitude: "77.5946" };

export function RegisterForm({ className }: { className?: string }) {
  const router = useRouter();
  const { t } = useLanguage();

  const [role, setRole] = useState<UserRole>("donor");
  const [values, setValues] = useState({
    name: "",
    type: "restaurant",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    ...DEFAULT_LOCATION,
    capacity_min: "20",
    capacity_max: "100",
    typical_quantity: "50",
    pickup_radius_km: "8",
    pickup_lead_time_min: "30",
  });
  const [diets, setDiets] = useState<DietaryType[]>(["vegetarian"]);
  const [foodTypes, setFoodTypes] = useState<FoodCategory[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [canPickup, setCanPickup] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const switchRole = (next: UserRole) => {
    setRole(next);
    // Keep the organisation type valid for the newly selected role.
    setValues((prev) => ({
      ...prev,
      type: next === "donor" ? DONOR_TYPES[0] : RECIPIENT_TYPES[0],
    }));
    setErrors({});
  };

  const toggle = <T extends string>(
    list: T[],
    setList: (next: T[]) => void,
    value: T,
  ) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const payload =
      role === "donor"
        ? {
            role,
            name: values.name,
            type: values.type,
            contact_person: values.contact_person,
            phone: values.phone,
            email: values.email,
            address: values.address,
            latitude: values.latitude,
            longitude: values.longitude,
          }
        : {
            role,
            name: values.name,
            type: values.type,
            contact_person: values.contact_person,
            phone: values.phone,
            email: values.email,
            address: values.address,
            latitude: values.latitude,
            longitude: values.longitude,
            capacity_min: values.capacity_min,
            capacity_max: values.capacity_max,
            typical_quantity: values.typical_quantity,
            dietary_requirements: diets,
            accepted_food_types: foodTypes,
            excluded_allergens: excluded,
            pickup_radius_km: values.pickup_radius_km,
            can_pickup: canPickup,
            pickup_lead_time_min: values.pickup_lead_time_min,
          };

    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      toast.success("Profile created — you are signed in.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof RequestError) {
        if (error.fields) setErrors(error.fields);
        toast.error(error.message);
      } else {
        toast.error("Could not create the profile. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const err = (key: string) => errors[key];
  const types = role === "donor" ? DONOR_TYPES : RECIPIENT_TYPES;

  return (
    <form noValidate onSubmit={submit} className={cn("space-y-6", className)}>
      {/* Role -------------------------------------------------------- */}
      <fieldset>
        <legend className="text-sm font-medium">{t("registerAs")}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                value: "donor" as const,
                icon: Store,
                title: t("donorTitle"),
                body: t("donorDesc"),
              },
              {
                value: "recipient" as const,
                icon: Building2,
                title: t("recipientTitle"),
                body: t("recipientDesc"),
              },
            ]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={role === option.value}
              onClick={() => switchRole(option.value)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                role === option.value
                  ? "border-primary bg-primary-soft/60 ring-1 ring-primary/25"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              <option.icon
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  role === option.value ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden
              />
              <span>
                <span className="block text-sm font-semibold">{option.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {option.body}
                </span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Organisation ------------------------------------------------ */}
      <Card>
        <CardContent className="space-y-5 pt-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("orgName")} htmlFor="name" error={err("name")}>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={Boolean(err("name"))}
                placeholder="Hope Community Kitchen"
              />
            </Field>
            <Field label={t("orgType")} htmlFor="type" error={err("type")}>
              <Select
                id="type"
                value={values.type}
                onChange={(e) => set("type", e.target.value)}
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {ORGANISATION_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t("contactPerson")}
              htmlFor="contact_person"
              error={err("contact_person")}
            >
              <Input
                id="contact_person"
                value={values.contact_person}
                onChange={(e) => set("contact_person", e.target.value)}
                aria-invalid={Boolean(err("contact_person"))}
              />
            </Field>
            <Field label={t("phone")} htmlFor="phone" error={err("phone")}>
              <Input
                id="phone"
                type="tel"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                aria-invalid={Boolean(err("phone"))}
                placeholder="+91 98450 11223"
              />
            </Field>
          </div>

          <Field label={t("email")} htmlFor="email" error={err("email")}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={Boolean(err("email"))}
            />
          </Field>

          <Field label={t("address")} htmlFor="address" error={err("address")}>
            <Input
              id="address"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              aria-invalid={Boolean(err("address"))}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("latitude")} htmlFor="latitude" error={err("latitude")}>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={values.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                aria-invalid={Boolean(err("latitude"))}
              />
            </Field>
            <Field label={t("longitude")} htmlFor="longitude" error={err("longitude")}>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={values.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                aria-invalid={Boolean(err("longitude"))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Recipient constraints --------------------------------------- */}
      {role === "recipient" ? (
        <Card>
          <CardContent className="space-y-5 pt-5">
            <div>
              <h2 className="text-sm font-semibold">{t("whatCanYouTake")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("hardConstraintsHint")}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                label={t("minQty")}
                htmlFor="capacity_min"
                error={err("capacity_min")}
              >
                <Input
                  id="capacity_min"
                  type="number"
                  min="0"
                  value={values.capacity_min}
                  onChange={(e) => set("capacity_min", e.target.value)}
                  aria-invalid={Boolean(err("capacity_min"))}
                />
              </Field>
              <Field
                label={t("maxCap")}
                htmlFor="capacity_max"
                error={err("capacity_max")}
              >
                <Input
                  id="capacity_max"
                  type="number"
                  min="1"
                  value={values.capacity_max}
                  onChange={(e) => set("capacity_max", e.target.value)}
                  aria-invalid={Boolean(err("capacity_max"))}
                />
              </Field>
              <Field
                label={t("typicalQty")}
                htmlFor="typical_quantity"
                error={err("typical_quantity")}
              >
                <Input
                  id="typical_quantity"
                  type="number"
                  min="1"
                  value={values.typical_quantity}
                  onChange={(e) => set("typical_quantity", e.target.value)}
                  aria-invalid={Boolean(err("typical_quantity"))}
                />
              </Field>
            </div>

            <fieldset>
              <legend className="text-sm font-medium">{t("acceptedDiets")}</legend>
              {err("dietary_requirements") ? (
                <p role="alert" className="mt-1 text-sm text-destructive">
                  {err("dietary_requirements")}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(DIETARY_LABELS) as DietaryType[]).map((diet) => (
                  <Chip
                    key={diet}
                    active={diets.includes(diet)}
                    onClick={() => toggle(diets, setDiets, diet)}
                  >
                    {DIETARY_LABELS[diet]}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium">
                {t("acceptedFood")}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((type) => (
                  <Chip
                    key={type}
                    active={foodTypes.includes(type)}
                    onClick={() => toggle(foodTypes, setFoodTypes, type)}
                  >
                    {FOOD_CATEGORY_LABELS[type]}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium">
                {t("excludedAllergens")}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {COMMON_ALLERGENS.map((allergen) => (
                  <Chip
                    key={allergen}
                    active={excluded.includes(allergen)}
                    onClick={() => toggle(excluded, setExcluded, allergen)}
                  >
                    <span className="capitalize">{allergen}</span>
                  </Chip>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={t("collectionRange")}
                htmlFor="pickup_radius_km"
                error={err("pickup_radius_km")}
              >
                <Input
                  id="pickup_radius_km"
                  type="number"
                  min="1"
                  step="any"
                  value={values.pickup_radius_km}
                  onChange={(e) => set("pickup_radius_km", e.target.value)}
                  aria-invalid={Boolean(err("pickup_radius_km"))}
                />
              </Field>
              <Field
                label={t("noticeNeeded")}
                htmlFor="pickup_lead_time_min"
                error={err("pickup_lead_time_min")}
              >
                <Input
                  id="pickup_lead_time_min"
                  type="number"
                  min="0"
                  value={values.pickup_lead_time_min}
                  onChange={(e) => set("pickup_lead_time_min", e.target.value)}
                  aria-invalid={Boolean(err("pickup_lead_time_min"))}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={canPickup}
                onChange={(e) => setCanPickup(e.target.checked)}
                className="size-4 rounded border-input accent-[hsl(var(--primary))]"
              />
              {t("weCanCollect")}
            </label>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-sm text-muted-foreground">
        {t("unverifiedNote")}
      </p>

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <UserPlus className="size-4" aria-hidden />
        )}
        {t("createProfileBtn")}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
