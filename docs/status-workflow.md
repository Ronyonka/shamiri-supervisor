# Session Status Workflow

This document describes how sessions move through status states in the Shamiri Supervisor Copilot.

## Design Philosophy

> **AI flags, humans decide.**

The AI is a triage tool — it surfaces sessions that need attention, but it never makes a final clinical judgment. Only a supervisor can confirm whether a session is truly safe or carries risk. This design reflects the reality that AI can miss context, misinterpret cultural expressions, or flag false positives, especially in the diverse linguistic landscape of East African therapy sessions.

## Status States

| Status                 | Badge  | Icon            | Meaning                                                   |
| :--------------------- | :----- | :-------------- | :-------------------------------------------------------- |
| **Missing Analysis**   | Grey   | `Clock`         | Session exists but AI analysis has not run yet.            |
| **Flagged for Review** | Blue   | `AlertTriangle` | AI has analyzed; waiting for supervisor to make the call.  |
| **Safe**               | Green  | —               | Supervisor confirmed the session is safe (human-verified). |
| **Risk**               | Red    | `ShieldAlert`   | Supervisor confirmed a risk exists (human-verified).       |

### Why these four?

- **Missing Analysis** — Analysis is triggered manually via API. Sessions may sit unprocessed. The supervisor needs to see what's pending.
- **Flagged for Review** — The mid-state. AI has done its job; now a human needs to look. Blue (not red/yellow) avoids alarm fatigue.
- **Safe** and **Risk** — Terminal states set exclusively by humans. These can change if a supervisor submits a new review overriding the previous one.

### Status can change

- A session marked **Safe** can become **Risk** if a supervisor later reviews it and disagrees.
- A session marked **Risk** can become **Safe** if a supervisor overrides the original assessment.
- The latest review always wins.

## Lifecycle

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
┌─────────────────────┐
│  Flagged for Review  │  Blue — AI analyzed, awaiting supervisor
└─────────┬───────────┘
          │
          │  POST /api/sessions/[id]/review
          ▼
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌──────┐   ┌──────┐
│ Safe │◄─►│ Risk │  Can flip via new review
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

### Examples

**True Positive** — Fellow Amina's transcript has "I don't want to be here anymore." AI flags RISK. Supervisor validates. → **Risk** 🔴

**False Positive** — Fellow Kofi's transcript has a character in a story who "wanted to end it all." AI flags RISK. Supervisor rejects. → **Safe** 🟢

**False Negative** — Fellow Zawadi's transcript looks normal to AI (SAFE). Supervisor notices subtle distress. Rejects. → **Risk** 🔴

**True Negative** — Routine session. AI says SAFE. Supervisor validates. → **Safe** 🟢

## Implementation

### Shared logic

The status derivation lives in `src/lib/sessionStatus.ts` → `getDisplayStatus()`. Both the dashboard list and individual session page use this same function.

```
getDisplayStatus(session):
  1. Has review + analysis?  → derive from review.decision + analysis.riskFlag
  2. Has analysis only?     → "FLAGGED_FOR_REVIEW"
  3. Neither?               → "MISSING_ANALYSIS"
```

### Where it renders

| Page                 | File                                              | Shows status via                |
| :------------------- | :------------------------------------------------ | :------------------------------ |
| Dashboard list       | `src/components/SessionTable.tsx`                 | `<StatusBadge>` in each row/card |
| Session detail       | `src/app/dashboard/sessions/[id]/page.tsx`        | `<StatusBadge>` in the header   |

### Database fields involved

| Model              | Field        | Type             | Role                                    |
| :------------------ | :----------- | :--------------- | :-------------------------------------- |
| `AIAnalysis`        | `riskFlag`   | `RiskStatus`     | AI's assessment: SAFE or RISK.          |
| `SupervisorReview`  | `decision`   | `ReviewDecision` | Supervisor's verdict: VALIDATED or REJECTED. |

## Edge Cases

| Scenario                                    | Behaviour                                    |
| :------------------------------------------ | :------------------------------------------- |
| No transcript uploaded                      | Shows "Missing Analysis" (can't analyze)     |
| Analysis deleted after review               | Shows "Missing Analysis"                     |
| Multiple reviews on same session            | Latest review (by `reviewedAt`) wins         |
| Review exists but no analysis               | Shows "Missing Analysis"                     |
