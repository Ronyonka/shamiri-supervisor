# Session Status Workflow

This document describes how sessions move through status states in the Shamiri Supervisor Copilot.

## Design Philosophy

> **AI flags, humans decide. Efficiency through triage.**

The AI is a triage tool — it surfaces sessions that need attention, but it never makes a final clinical judgment. Only a supervisor can confirm whether a session is truly safe or carries risk.

**The Clinical Tradeoff:**
"Processed" is not a terminal state — it is AI-cleared and available for supervisor spot-checking. Only AI-flagged RISK sessions require mandatory supervisor review (**Flagged for Review**). This is an intentional clinical tradeoff that prioritises supervisor attention on genuine risk signals while preserving the ability to catch false negatives through random sampling of Processed sessions.

## Status States

| Status                 | Badge  | Icon            | Meaning                                                   |
| :--------------------- | :----- | :-------------- | :-------------------------------------------------------- |
| **Missing Analysis**   | Grey   | `Clock`         | Session exists but AI analysis has not run yet.            |
| **Processed**          | Blue   | —               | AI analyzed and found no risk. Available for spot-check.   |
| **Flagged for Review** | Amber  | `AlertTriangle` | AI analyzed and flagged RISK. **Requires immediate review.** |
| **Safe**               | Green  | —               | Supervisor confirmed the session is safe (human-verified). |
| **Risk**               | Red    | `ShieldAlert`   | Supervisor confirmed a risk exists (human-verified).       |

### Priority & Lifecycle

Sessions are prioritized on the dashboard to ensure the most critical items are seen first:
1. **Flagged for Review** (Top priority)
2. **Processed**
3. **Safe / Risk** (Terminal states)
4. **Missing Analysis**

### Lifecycle Diagram

```
Session Created (via seed or upload)
         │
         ▼
┌─────────────────────┐
│  Missing Analysis   │  Grey — no AI analysis exists
└─────────┬───────────┘
          │
          │  POST /api/sessions/[id]/analyze
          ▼
    ┌─────┴──────────────┐
    │                    │
    ▼                    ▼
┌───────────┐      ┌─────────────────────┐
│ Processed │      │ Flagged for Review  │
│  (Blue)   │      │ (Amber - RISK flag) │
└─────┬─────┘      └──────────┬──────────┘
      │                       │
      └──────────┬────────────┘
                 │
                 │  POST /api/sessions/[id]/review
                 ▼
           ┌─────┴─────┐
           │           │
           ▼           ▼
       ┌──────┐   ┌──────┐
       │ Safe │◄─►│ Risk │  Terminal human-verified states
       │  🟢  │   │  🔴  │
       └──────┘   └──────┘
```

## Review Decision Matrix

- **VALIDATED** = "I agree with the AI."
- **REJECTED** = "I disagree with the AI."

| Review Decision | AI Risk Flag | Final Status | Explanation                                         |
| :-------------- | :----------- | :----------- | :-------------------------------------------------- |
| **VALIDATED**   | `RISK`       | **Risk** 🔴  | AI found risk, supervisor confirms it's real.       |
| **VALIDATED**   | `SAFE`       | **Safe** 🟢  | AI found nothing, supervisor agrees it's clean.     |
| **REJECTED**    | `RISK`       | **Safe** 🟢  | AI flagged a false positive, supervisor overrules.  |
| **REJECTED**    | `SAFE`       | **Risk** 🔴  | AI missed something, supervisor caught it manually. |

## Implementation

### Shared logic

The status derivation lives in `src/lib/sessionStatus.ts` → `getDisplayStatus()`.

```
getDisplayStatus(session):
  1. Has review + analysis?     → derive from review.decision + analysis.riskFlag
  2. Analysis exists + RISK?    → "FLAGGED_FOR_REVIEW"
  3. Analysis exists + SAFE?    → "PROCESSED"
  4. Neither?                   → "MISSING_ANALYSIS"
```

### Database fields involved

| Model              | Field        | Type             | Role                                    |
| :------------------ | :----------- | :--------------- | :-------------------------------------- |
| `AIAnalysis`        | `riskFlag`   | `RiskStatus`     | AI's assessment: SAFE or RISK.          |
| `SupervisorReview`  | `decision`   | `ReviewDecision` | Supervisor's verdict: VALIDATED or REJECTED. |
