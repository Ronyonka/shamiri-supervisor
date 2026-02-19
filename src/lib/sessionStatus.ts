import type { AIAnalysis, SupervisorReview } from "@/generated/prisma/client"

interface SessionWithStatusData {
  analysis: AIAnalysis | null
  reviews: SupervisorReview[]
}

/**
 * Derives the display status for a session.
 *
 * Priority:
 * 1. Review exists → supervisor decision is final
 *    - VALIDATED: supervisor agrees with AI → keep AI's verdict (RISK or SAFE)
 *    - REJECTED:  supervisor disagrees with AI → flip AI's verdict
 * 2. No review, AI analysis exists → FLAGGED_FOR_REVIEW (needs human eyes)
 * 3. No analysis at all → MISSING_ANALYSIS
 */
export function getDisplayStatus(session: SessionWithStatusData): string {
  const latestReview = session.reviews[0] ?? null
  const analysis = session.analysis

  // 1. Supervisor reviewed — their decision is final
  if (latestReview && analysis) {
    const aiSaidRisk = analysis.riskFlag === "RISK"

    if (latestReview.decision === "VALIDATED") {
      return aiSaidRisk ? "RISK" : "SAFE"
    }
    if (latestReview.decision === "REJECTED") {
      return aiSaidRisk ? "SAFE" : "RISK"
    }
  }

  // 2. AI analyzed but no review yet
  if (analysis) {
    return "FLAGGED_FOR_REVIEW"
  }

  // 3. No analysis at all
  return "MISSING_ANALYSIS"
}
