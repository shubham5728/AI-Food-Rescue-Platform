import type {
  AiSource,
  Donation,
  Match,
  Organisation,
  RejectedCandidate,
} from "@/lib/types";
import { newId } from "@/lib/utils";

import { applyHardConstraints } from "./constraints";
import { generateAiNarration, isLlmConfigured } from "./llm";
import { rankCandidates, type ScoredMatch } from "./match";
import { narrateMatch, narrateMatchSummary, narrateWasteRisk } from "./narrate";
import { assessPriority, type PriorityAssessment } from "./priority";
import { assessWasteRisk, type RiskAssessment } from "./risk";

/**
 * The full analysis pass, in the order the architecture requires:
 *
 *   hard constraints -> deterministic scoring -> LLM reasoning & explanation
 *
 * Called on donation creation, on every status change, and on demand from the
 * donation page, because risk and priority are both functions of "now".
 */

export interface AnalysisResult {
  risk: RiskAssessment;
  priority: PriorityAssessment;
  matches: ScoredMatch[];
  rejected: RejectedCandidate[];
  summary: string;
  ai_source: AiSource;
  /** Donation columns the caller should persist. */
  donationPatch: Pick<
    Donation,
    | "waste_risk_score"
    | "waste_risk_level"
    | "waste_risk_reasons"
    | "waste_risk_explanation"
    | "priority_score"
    | "priority_level"
    | "priority_reason"
    | "ai_source"
    | "analysed_at"
  >;
  /** Fully-formed match rows, ranked, ready to replace the previous set. */
  matchRows: Match[];
}

export async function analyseDonation(
  donation: Donation,
  recipients: Organisation[],
  options: { useLlm?: boolean; now?: Date } = {},
): Promise<AnalysisResult> {
  const now = options.now ?? new Date();
  const useLlm = options.useLlm ?? isLlmConfigured();

  // Step 1 — deterministic hard filtering.
  const { viable, rejected } = applyHardConstraints(donation, recipients, now);

  // Step 2 — deterministic scoring of the survivors.
  const scored = rankCandidates(donation, viable);

  const risk = assessWasteRisk(donation, viable.length, now);
  const priority = assessPriority(
    donation,
    risk.score,
    risk.minutes_remaining,
    scored.length > 0 ? scored[0].score : null,
  );

  // Step 3 — reasoning and explanation.
  const llm = useLlm
    ? await generateAiNarration(donation, risk, priority, scored, rejected)
    : null;

  const ai_source: AiSource = llm ? "openai" : "engine";

  let finalMatches = scored;
  let riskReasons = risk.reasons;
  let riskExplanation = narrateWasteRisk(donation, risk);
  let priorityReason = priority.reason;
  let summary = narrateMatchSummary(scored, rejected.length);

  const narration = new Map<string, { reasons: string[]; explanation: string }>();

  if (llm) {
    riskReasons = llm.waste_risk.reasons;
    riskExplanation = llm.waste_risk.explanation;
    priorityReason = llm.priority.reason;
    summary = llm.summary;

    const adjusted = new Map(llm.matches.map((m) => [m.recipient_id, m]));
    for (const m of llm.matches) {
      narration.set(m.recipient_id, {
        reasons: m.reasons.length > 0 ? m.reasons : [],
        explanation: m.explanation,
      });
    }

    // Re-rank using the (bounded) adjusted scores.
    finalMatches = scored
      .map((m) => {
        const a = adjusted.get(m.recipient.id);
        return a ? { ...m, score: a.score } : m;
      })
      .sort((a, b) => b.score - a.score || a.distance_km - b.distance_km);
  }

  const matchRows: Match[] = finalMatches.map((m, index) => {
    const written = narration.get(m.recipient.id);
    return {
      id: newId("match"),
      donation_id: donation.id,
      recipient_id: m.recipient.id,
      match_score: m.score,
      explanation:
        written?.explanation ?? narrateMatch(donation, m, index === 0),
      reasons:
        written && written.reasons.length > 0 ? written.reasons : m.reasons,
      rank: index + 1,
      distance_km: m.distance_km,
      time_buffer_min: m.time_buffer_min,
      ai_source,
      created_at: now.toISOString(),
    };
  });

  return {
    risk,
    priority,
    matches: finalMatches,
    rejected,
    summary,
    ai_source,
    donationPatch: {
      waste_risk_score: risk.score,
      waste_risk_level: risk.level,
      waste_risk_reasons: riskReasons,
      waste_risk_explanation: riskExplanation,
      priority_score: priority.score,
      priority_level: priority.level,
      priority_reason: priorityReason,
      ai_source,
      analysed_at: now.toISOString(),
    },
    matchRows,
  };
}

/**
 * Lightweight re-score used by dashboards, which need current risk and
 * priority for many donations at once without paying for an LLM call each.
 */
export function rescoreForList(
  donation: Donation,
  recipients: Organisation[],
  now: Date = new Date(),
): { risk: RiskAssessment; priority: PriorityAssessment; viable: number } {
  const { viable } = applyHardConstraints(donation, recipients, now);
  const scored = rankCandidates(donation, viable);
  const risk = assessWasteRisk(donation, viable.length, now);
  const priority = assessPriority(
    donation,
    risk.score,
    risk.minutes_remaining,
    scored.length > 0 ? scored[0].score : null,
  );
  return { risk, priority, viable: viable.length };
}
