# B → root: frontend-architect checkpoint at the VISUAL-A exit (2026-10-26, D-29z149)

**Status:** `requested_from_root`. This is one bounded request at a feature boundary. It does **not** block round 184 (ROOT-RECON-GRID-HARNESS) or round 185 (REGRESSION).
- **Supersedes:** `b-round-180-checkpoint-request.md`. Its Q1–Q3 are unanswered and carried over unchanged. Q-COMMIT (`b-round-165-checkpoint-request.md`) stays open separately.
- **Procedure:** `store/.claude/references/architecture-checkpoint.md`. Root calls the read-only `frontend-architect` and records, per question, keep/extract, value, risk and at most 3 sentences.

## Why now
- **VISUAL-A-OBSIDIAN is closing.**
  - DUX-R-5 and M1, M3 and M4 are published: `59d4bab`, `f1782f8`, `f22290f` and `423fbc4`.
  - ROOT-RECON-GRID-HARNESS (round 184) is the last item.
  - STORE-REDESIGN comes next, then REVIEW-RECOMMENDATIONS (22 approved ids), which touches many of the same Studio files again.
- **The signals since round 180:**
  - Signal 3 is unchanged: class-recipe literals and source-string test locks.
  - The harness copy now exists in **76 suites**. Round 184 extracts it from only the 3 grid suites the user approved.
  - A new mild coupling signal from round 183: the `pathname.startsWith('/studio')` predicate is duplicated at `root.tsx:137` and `CookieConsent.tsx:16`. Both reviewers said keep it until `root.tsx` unfreezes.

## Questions (max 3)
1. **Recipe extraction: keep or extract?** This is `b-round-180` Q1, unchanged: a `studioToggleClass` / surface-classes module in `app/lib/arrangement/`, for class strings only. Should it be done before REVIEW-RECOMMENDATIONS?
2. **Test infrastructure.** After round 184, should `createWorkspaceTestEnvironment` be rolled out to the other 73 suites, in bounded test-only batches? Should `expectTokens` / `countOccurrences` be added (b-round-180 Q2)? Or keep the per-suite copies?
3. **Order.** Run (1) and/or (2) between VISUAL-A and STORE-REDESIGN, interleave them with REVIEW-RECOMMENDATIONS, or not at all?

## B's default if there is no answer
- **Fallback (c) continues.** Recipes stay per component, locked by tests.
- **The harness stays at the 3 approved suites.** New suites may import the helper. Old suites are not migrated.
- **The order is unchanged:** REGRESSION (round 185), then STORE-0.
- **No self-scheduling.** A root-approved change becomes a separate B task with one owner and behaviour-preserving tests.

- **Addendum (B round 195 -> 196 planning, D-29z161, 2026-10-26):** `app/styles/app.css` is now edited by STORE-2a (192-195), SABA-B-4 stage 1 (196, global `:focus-visible` rule) and planned SABA-B-4 stage 2 / STORE-2b/2c (ARCH-R193-THEME-REGION). Question: should the shared focus rule and store theme region move to their own CSS module before stage 2? Non-blocking; a "keep" answer is valid.
