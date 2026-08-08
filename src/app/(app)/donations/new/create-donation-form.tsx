"use client";

import {
  ArrowRight,
  Camera,
  Flame,
  Loader2,
  MapPin,
  Sparkles,
  Utensils,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { apiRequest, RequestError } from "@/lib/client-api";
import {
  COMMON_ALLERGENS,
  DIETARY_LABELS,
  FOOD_CATEGORY_LABELS,
  QUANTITY_UNIT_LABELS,
} from "@/lib/constants";
import { RISK_STYLES } from "@/lib/signals";
import type {
  DietaryType,
  Donation,
  FoodCategory,
  Organisation,
  QuantityUnit,
  RiskLevel,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { createDonationSchema, fieldErrors } from "@/lib/validation";
import { detectFoodImage, ALL_FOOD_IMAGES } from "@/lib/food-images";

/**
 * The donor's entry point, and step 2 of the demo.
 *
 * Two decisions worth flagging:
 *  - The form is pre-filled with the demo scenario relative to the current
 *    clock, so "prepared an hour ago, 90 minutes left" is true whenever it is
 *    opened rather than only at 12:30.
 *  - On success it shows the AI verdict inline before navigating, because the
 *    point of the product is that the analysis is immediate.
 */

const MINUTE = 60_000;

/** `datetime-local` wants local wall-clock time, not an ISO/UTC string. */
function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * MINUTE;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

interface AnalysisResult {
  risk_score: number;
  risk_level: RiskLevel;
  reasons: string[];
  priority_score: number;
  priority_level: string;
  match_count: number;
  top_match: { name: string; score: number } | null;
  ai_source: "openai" | "engine";
}

export function CreateDonationForm({
  donor,
  className,
}: {
  donor: Organisation;
  className?: string;
}) {
  const router = useRouter();
  const now = new Date();

  const [values, setValues] = useState({
    food_name: "Vegetable Rice",
    food_type: "cooked_meal" as FoodCategory,
    quantity: "50",
    quantity_unit: "meals" as QuantityUnit,
    meals: "50",
    dietary_type: "vegetarian" as DietaryType,
    prepared_at: toLocalInput(new Date(now.getTime() - 60 * MINUTE)),
    pickup_start: toLocalInput(new Date(now.getTime() - 10 * MINUTE)),
    pickup_deadline: toLocalInput(new Date(now.getTime() + 90 * MINUTE)),
    address: donor.address,
    latitude: String(donor.latitude),
    longitude: String(donor.longitude),
    notes: "",
  });

  const [allergens, setAllergens] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>(
    () => detectFoodImage("Vegetable Rice", "cooked_meal"),
  );
  const [autoDetected, setAutoDetected] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<{
    donation: Donation;
    analysis: AnalysisResult;
  } | null>(null);

  const set = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Auto-detect image when food name or food type changes
    if (key === "food_name" || key === "food_type") {
      const newName = key === "food_name" ? value : values.food_name;
      const newType = key === "food_type" ? value : values.food_type;
      if (autoDetected) {
        setImageUrl(detectFoodImage(newName, newType));
      }
    }
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleAllergen = (allergen: string) =>
    setAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen],
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    // Validate with the same schema the API uses, so the two never disagree.
    const parsed = createDonationSchema.safeParse({
      ...values,
      allergens,
      notes: values.notes.trim() ? values.notes : null,
      image_url: imageUrl || null,
    });

    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      setErrors(fields);
      toast.error("Please correct the highlighted fields.");
      // If error is in step 1 fields, go back to step 1
      const step1Fields = ["food_name", "food_type", "dietary_type", "quantity", "quantity_unit", "meals"];
      if (Object.keys(fields).some(f => step1Fields.includes(f))) {
        setStep(1);
      }
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<{
        donation: Donation;
        analysis: AnalysisResult;
      }>("/api/donations", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setResult(response);
      toast.success("Donation analysed");
      router.refresh();
    } catch (error) {
      if (error instanceof RequestError) {
        if (error.fields) setErrors(error.fields);
        toast.error(error.message);
      } else {
        toast.error("Could not save the donation. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <AnalysisSummary
        donation={result.donation}
        analysis={result.analysis}
        className={className}
      />
    );
  }

  const err = (key: string) => errors[key];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium mb-3">
          <span className={step === 1 ? "text-primary" : "text-muted-foreground"}>Step 1: Food Details</span>
          <span className={step === 2 ? "text-primary" : "text-muted-foreground"}>Step 2: Logistics</span>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-2 transition-all duration-500" />
      </div>

      <form noValidate onSubmit={submit} className="space-y-6">
        <AnimatePresence mode="wait" custom={step}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <Card className="border-border/50 shadow-sm">
                <CardContent className="space-y-5 pt-5">
          <SectionTitle icon={Utensils}>What is the food?</SectionTitle>

          <Field label="Food name or type" htmlFor="food_name" error={err("food_name")}>
            <Input
              id="food_name"
              value={values.food_name}
              onChange={(e) => set("food_name", e.target.value)}
              aria-invalid={Boolean(err("food_name"))}
              placeholder="Vegetable Rice"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="food_type" error={err("food_type")}>
              <Select
                id="food_type"
                value={values.food_type}
                onChange={(e) => set("food_type", e.target.value)}
              >
                {Object.entries(FOOD_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Dietary type"
              htmlFor="dietary_type"
              error={err("dietary_type")}
            >
              <Select
                id="dietary_type"
                value={values.dietary_type}
                onChange={(e) => set("dietary_type", e.target.value)}
              >
                {Object.entries(DIETARY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Quantity" htmlFor="quantity" error={err("quantity")}>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="any"
                inputMode="decimal"
                value={values.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                aria-invalid={Boolean(err("quantity"))}
              />
            </Field>

            <Field label="Unit" htmlFor="quantity_unit" error={err("quantity_unit")}>
              <Select
                id="quantity_unit"
                value={values.quantity_unit}
                onChange={(e) => set("quantity_unit", e.target.value)}
              >
                {Object.entries(QUANTITY_UNIT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Number of meals"
              htmlFor="meals"
              error={err("meals")}
              hint="Drives matching and impact"
            >
              <Input
                id="meals"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={values.meals}
                onChange={(e) => set("meals", e.target.value)}
                aria-invalid={Boolean(err("meals"))}
              />
            </Field>
          </div>

          <fieldset>
            <legend className="text-sm font-medium">Allergens</legend>
            <p className="mt-1 text-xs text-muted-foreground">
              Recipients that cannot handle a listed allergen are filtered out
              entirely, not just ranked lower.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {COMMON_ALLERGENS.map((allergen) => {
                const active = allergens.includes(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleAllergen(allergen)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                      active
                        ? "border-transparent bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {allergen}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Image picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Camera className="size-4 text-muted-foreground" aria-hidden />
                Food photo
              </p>
              {autoDetected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <Sparkles className="size-3" />
                  AI Auto-detected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAutoDetected(true);
                    setImageUrl(detectFoodImage(values.food_name, values.food_type));
                  }}
                  className="text-[10px] font-medium text-primary underline underline-offset-2"
                >
                  Reset to auto-detect
                </button>
              )}
            </div>

            {/* Selected image large preview */}
            <div className="relative h-44 w-full overflow-hidden rounded-xl border bg-muted">
              <Image
                src={imageUrl}
                alt="Selected food image"
                fill
                className="object-cover transition-all duration-300"
                sizes="(max-width: 640px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                <span className="text-xs font-semibold text-white drop-shadow">
                  {ALL_FOOD_IMAGES.find((f) => f.path === imageUrl)?.label ?? "Food Photo"}
                </span>
                {autoDetected && (
                  <span className="rounded-full bg-emerald-600/90 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">
                    Auto-matched
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail grid — click to manually override */}
            <div className="grid grid-cols-4 gap-2">
              {ALL_FOOD_IMAGES.map(({ path, label }) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => {
                    setImageUrl(path);
                    setAutoDetected(false);
                  }}
                  aria-pressed={imageUrl === path}
                  title={label}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    imageUrl === path
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent opacity-55 hover:opacity-100 hover:scale-105",
                  )}
                >
                  <Image
                    src={path}
                    alt={label}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/75 py-0.5 text-center text-[8px] font-medium text-white leading-tight px-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              ✨ Image auto-detects as you type the food name. Click any photo to pick manually.
            </p>
          </div>
        </CardContent>
      </Card>
      </motion.div>
      )}

      {step === 2 && (
        <motion.div
          key="step2"
          custom={-1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
      {/* ---------------------------------------------------------------- */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="space-y-5 pt-5">
          <SectionTitle icon={Flame}>When can it be collected?</SectionTitle>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label="Prepared at"
              htmlFor="prepared_at"
              error={err("prepared_at")}
            >
              <Input
                id="prepared_at"
                type="datetime-local"
                value={values.prepared_at}
                onChange={(e) => set("prepared_at", e.target.value)}
                aria-invalid={Boolean(err("prepared_at"))}
              />
            </Field>

            <Field
              label="Pickup opens"
              htmlFor="pickup_start"
              error={err("pickup_start")}
            >
              <Input
                id="pickup_start"
                type="datetime-local"
                value={values.pickup_start}
                onChange={(e) => set("pickup_start", e.target.value)}
                aria-invalid={Boolean(err("pickup_start"))}
              />
            </Field>

            <Field
              label="Pickup deadline"
              htmlFor="pickup_deadline"
              error={err("pickup_deadline")}
            >
              <Input
                id="pickup_deadline"
                type="datetime-local"
                value={values.pickup_deadline}
                onChange={(e) => set("pickup_deadline", e.target.value)}
                aria-invalid={Boolean(err("pickup_deadline"))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="space-y-5 pt-5">
          <SectionTitle icon={MapPin}>Where is it?</SectionTitle>

          <Field label="Pickup address" htmlFor="address" error={err("address")}>
            <Input
              id="address"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              aria-invalid={Boolean(err("address"))}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Latitude" htmlFor="latitude" error={err("latitude")}>
              <Input
                id="latitude"
                type="number"
                step="any"
                inputMode="decimal"
                value={values.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                aria-invalid={Boolean(err("latitude"))}
              />
            </Field>
            <Field label="Longitude" htmlFor="longitude" error={err("longitude")}>
              <Input
                id="longitude"
                type="number"
                step="any"
                inputMode="decimal"
                value={values.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                aria-invalid={Boolean(err("longitude"))}
              />
            </Field>
          </div>

          <Field
            label="Additional notes"
            htmlFor="notes"
            error={err("notes")}
            optional
          >
            <Textarea
              id="notes"
              rows={3}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Packed in foil trays. Collect from the rear service gate."
            />
          </Field>
        </CardContent>
      </Card>
      </motion.div>
      )}
      </AnimatePresence>

      {errors._form ? (
        <p role="alert" className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">
          {errors._form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
        {step === 1 ? (
          <>
            <Button type="button" size="lg" className="font-bold shadow-md" onClick={() => setStep(2)}>
              Next Step
              <ArrowRight className="size-4 ml-2" aria-hidden />
            </Button>
            <Button asChild type="button" variant="ghost" size="lg">
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" size="lg" disabled={submitting} className="font-bold shadow-md">
              {submitting ? (
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden />
              ) : (
                <Wand2 className="size-4 mr-2" aria-hidden />
              )}
              {submitting ? "Analysing…" : "Submit & Analyse"}
            </Button>
          </>
        )}
      </div>
    </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Utensils;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon className="size-4" aria-hidden />
      {children}
    </h2>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {optional ? (
          <span className="ml-1.5 font-normal text-muted-foreground">
            (optional)
          </span>
        ) : null}
      </Label>
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

/* -------------------------------------------------------------------------- */

/** The immediate verdict, shown before the donor navigates anywhere. */
function AnalysisSummary({
  donation,
  analysis,
  className,
}: {
  donation: Donation;
  analysis: AnalysisResult;
  className?: string;
}) {
  const style = RISK_STYLES[analysis.risk_level];

  return (
    <div className={cn("animate-fade-up space-y-5", className)}>
      <Card className="overflow-hidden">
        <div
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white",
            analysis.risk_level === "HIGH"
              ? "bg-signal-critical"
              : analysis.risk_level === "MEDIUM"
                ? "bg-signal-medium"
                : "bg-signal-low",
          )}
        >
          <Flame className="size-4" aria-hidden />
          Waste risk analysed
        </div>

        <CardContent className="pt-5">
          <p className={cn("text-4xl font-semibold tracking-tight", style.text)}>
            {analysis.risk_score}
            <span className="text-xl text-muted-foreground">/100</span>
          </p>
          <p className={cn("mt-1 text-sm font-medium", style.text)}>
            {style.label}
          </p>
          <Progress
            value={analysis.risk_score}
            className="mt-3 h-2"
            indicatorClassName={style.bar}
          />

          <ul className="mt-4 space-y-2">
            {analysis.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm">
                <span
                  className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", style.dot)}
                  aria-hidden
                />
                <span className="text-foreground/90">{reason}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" aria-hidden />
            {analysis.match_count > 0
              ? `${analysis.match_count} verified recipient${analysis.match_count === 1 ? "" : "s"} can take this`
              : "No verified recipient can take this right now"}
          </p>

          {analysis.top_match ? (
            <div className="mt-3 rounded-lg border border-primary/25 bg-primary-soft/60 p-4">
              <p className="text-sm text-muted-foreground">Best match</p>
              <p className="mt-0.5 text-lg font-semibold tracking-tight">
                {analysis.top_match.name}{" "}
                <span className="tabular text-primary">
                  — {analysis.top_match.score}%
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Extending the pickup deadline or splitting the quantity would open up
              options.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant={analysis.priority_score >= 85 ? "critical" : "high"}>
              Pickup priority {analysis.priority_score}/100
            </Badge>
            <Badge variant="secondary">
              {analysis.ai_source === "openai"
                ? "Explained by GPT"
                : "Explained by the scoring engine"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href={`/donations/${donation.id}`}>
            See the full analysis
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
