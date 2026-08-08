import OpenAI from "openai";
import { z } from "zod";

import { DIETARY_LABELS, FOOD_CATEGORY_LABELS } from "@/lib/constants";
import type { Donation, RejectedCandidate } from "@/lib/types";
import { clamp, formatDuration } from "@/lib/utils";

import type { ScoredMatch } from "./match";
import type { PriorityAssessment } from "./priority";
import type { RiskAssessment } from "./risk";

/**
 * The LLM layer sits on top of the deterministic engine, never in front of it.
 *
 * It receives the engine's factor breakdown as evidence and is allowed to do
 * two things: write the prose, and nudge each match score within a bounded
 * window. It cannot introduce a recipient, remove one, or move a score far
 * enough to overturn the constraint filtering — which is what stops a
 * hallucinated recommendation from ever reaching a donor.
 */

/** Hard cap on how far the model may move an engine score, in points. */
const SCORE_ADJUSTMENT_LIMIT = 6;

/** Donation creation blocks on this call, so it must not hang the request. */
const REQUEST_TIMEOUT_MS = 20_000;

export function isLlmConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

const llmResponseSchema = z.object({
  waste_risk: z.object({
    reasons: z.array(z.string()).min(1).max(5),
    explanation: z.string().min(1),
  }),
  matches: z.array(
    z.object({
      recipient_id: z.string(),
      score: z.number(),
      reasons: z.array(z.string()).max(6),
      explanation: z.string().min(1),
    }),
  ),
  priority: z.object({
    reason: z.string().min(1),
  }),
  summary: z.string().min(1),
});

export type LlmResponse = z.infer<typeof llmResponseSchema>;

/** JSON Schema mirror of the Zod shape, for OpenAI strict structured output. */
const responseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["waste_risk", "matches", "priority", "summary"],
  properties: {
    waste_risk: {
      type: "object",
      additionalProperties: false,
      required: ["reasons", "explanation"],
      properties: {
        reasons: {
          type: "array",
          items: { type: "string" },
          description: "Three or four short bullet reasons for the risk score.",
        },
        explanation: {
          type: "string",
          description:
            "Two to three sentences a restaurant manager can act on. No markdown.",
        },
      },
    },
    matches: {
      type: "array",
      description:
        "One entry per candidate supplied, same recipient_id values, no additions.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["recipient_id", "score", "reasons", "explanation"],
        properties: {
          recipient_id: { type: "string" },
          score: {
            type: "number",
            description:
              "0-100 match score, within 6 points of the supplied engine score.",
          },
          reasons: {
            type: "array",
            items: { type: "string" },
            description: "Four to five short checklist bullets, each under 60 characters.",
          },
          explanation: {
            type: "string",
            description:
              "One or two sentences explaining why this recipient suits this donation, citing concrete numbers.",
          },
        },
      },
    },
    priority: {
      type: "object",
      additionalProperties: false,
      required: ["reason"],
      properties: {
        reason: {
          type: "string",
          description:
            "One or two sentences on why this donation deserves its position in the pickup queue.",
        },
      },
    },
    summary: {
      type: "string",
      description: "One sentence summarising the matching pass for the donor.",
    },
  },
} as const;

const SYSTEM_PROMPT = `You are the reasoning layer of FoodBridge, a surplus-food rescue platform.

A deterministic engine has already done two things you must respect:
1. It removed every recipient that cannot physically or legally take this food.
2. It scored the survivors across weighted factors, and gave you that breakdown.

Your job is to explain these decisions to people and to make small, justified
adjustments to the ranking.

Rules:
- Never invent a recipient, a number, a distance or a capacity. Use only the
  supplied evidence.
- You may move a match score by at most 6 points from the engine score, and
  only when a factor in the evidence justifies it. Explain nothing you cannot
  point at.
- Return one entry per supplied candidate, using the exact recipient_id given.
- Write for a busy restaurant manager and a volunteer coordinator: concrete,
  specific, no marketing language, no markdown, no emoji.
- Always cite real quantities: meals, kilometres, minutes, percentages.`;

function buildUserPrompt(
  donation: Donation,
  risk: RiskAssessment,
  priority: PriorityAssessment,
  matches: ScoredMatch[],
  rejected: RejectedCandidate[],
): string {
  const donationBlock = [
    `Food: ${donation.food_name} (${FOOD_CATEGORY_LABELS[donation.food_type]})`,
    `Diet: ${DIETARY_LABELS[donation.dietary_type]}`,
    `Quantity: ${donation.quantity} ${donation.quantity_unit} = ${donation.meals} meals (~${donation.weight_kg} kg)`,
    `Allergens: ${donation.allergens.length ? donation.allergens.join(", ") : "none declared"}`,
    `Prepared: ${donation.prepared_at}`,
    `Pickup window: ${donation.pickup_start} to ${donation.pickup_deadline}`,
    `Time remaining: ${formatDuration(risk.minutes_remaining)}`,
    `Safe holding time left: ${formatDuration(risk.freshness_remaining)}`,
    `Status: ${donation.status}`,
    `Location: ${donation.address}`,
  ].join("\n");

  const riskBlock = [
    `Engine waste-risk score: ${risk.score}/100 (${risk.level})`,
    "Factor breakdown (value is 0-1 pressure, points are the contribution to the score):",
    ...risk.factors.map(
      (f) =>
        `  - ${f.label}: value ${f.value.toFixed(2)}, ${f.points} points — ${f.detail}`,
    ),
  ].join("\n");

  const priorityBlock = `Engine pickup-priority score: ${priority.score}/100 (${priority.level})`;

  const matchBlock =
    matches.length === 0
      ? "No candidate survived the hard constraints."
      : matches
          .map((m) => {
            const r = m.recipient;
            return [
              `Candidate recipient_id: ${r.id}`,
              `  Name: ${r.name} (${r.type}, ${r.verified ? "verified" : "unverified"})`,
              `  Engine match score: ${m.score}/100`,
              `  Capacity: ${r.capacity_min}-${r.capacity_max} meals, typically takes ${r.typical_quantity}`,
              `  Accepts diets: ${r.dietary_requirements.join(", ")}`,
              `  Accepts food types: ${r.accepted_food_types.join(", ") || "any"}`,
              `  Distance: ${m.distance_km} km, ~${m.travel_min} min drive`,
              `  Pickup: ${r.can_pickup ? "self-collects" : "needs delivery"}, ${r.pickup_lead_time_min} min lead time`,
              `  Slack before deadline: ${formatDuration(m.time_buffer_min)}`,
              `  Completion record: ${Math.round(r.reliability * 100)}%`,
              "  Factor breakdown:",
              ...m.factors.map(
                (f) =>
                  `    - ${f.label}: value ${f.value.toFixed(2)}, ${f.points} points — ${f.detail}`,
              ),
            ].join("\n");
          })
          .join("\n\n");

  const rejectedBlock =
    rejected.length === 0
      ? "None."
      : rejected.map((r) => `  - ${r.recipient_name}: ${r.reason}`).join("\n");

  return `DONATION
${donationBlock}

WASTE RISK
${riskBlock}

PICKUP PRIORITY
${priorityBlock}

VIABLE CANDIDATES (already passed all hard constraints)
${matchBlock}

RULED OUT BY HARD CONSTRAINTS
${rejectedBlock}

Produce the structured explanation object.`;
}

/**
 * Returns null on any failure — missing key, timeout, malformed output, an
 * invented recipient id. Callers fall back to the deterministic narrator, so a
 * failed LLM call degrades the prose, never the product.
 */
export async function generateAiNarration(
  donation: Donation,
  risk: RiskAssessment,
  priority: PriorityAssessment,
  matches: ScoredMatch[],
  rejected: RejectedCandidate[],
): Promise<LlmResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: buildUserPrompt(donation, risk, priority, matches, rejected),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "foodbridge_recommendation",
          strict: true,
          schema: responseJsonSchema as unknown as Record<string, unknown>,
        },
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = llmResponseSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn("[ai] LLM output failed validation", parsed.error.issues);
      return null;
    }

    return clampToEngine(parsed.data, matches);
  } catch (error) {
    console.warn("[ai] LLM narration failed, falling back to engine", error);
    return null;
  }
}

/**
 * Enforces the guardrails after the fact: drop any recipient the engine did not
 * supply, and pull every score back inside the permitted window.
 */
function clampToEngine(
  response: LlmResponse,
  matches: ScoredMatch[],
): LlmResponse {
  const byId = new Map(matches.map((m) => [m.recipient.id, m]));

  const safeMatches = response.matches
    .filter((m) => byId.has(m.recipient_id))
    .map((m) => {
      const engine = byId.get(m.recipient_id)!;
      return {
        ...m,
        score: clamp(
          Math.round(m.score),
          Math.max(0, engine.score - SCORE_ADJUSTMENT_LIMIT),
          Math.min(100, engine.score + SCORE_ADJUSTMENT_LIMIT),
        ),
      };
    });

  return { ...response, matches: safeMatches };
}
