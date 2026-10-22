# Request to root: bounded frontend-architect checkpoint at the SRW-20 boundary (q14)

From: B · Date: 2026-10-22 · Status: **requested, non-blocking**
Method: `store/.claude/references/architecture-checkpoint.md` (read-only frontend-architect). For each question, give keep or extract, the value, the risk, and at most three sentences.

## Why now
- SRW-20 (export completeness) is complete. All stages passed C with browser evidence, the last being 3b-2: C round 91 PASS, `browserVerified=true`, gate 91 published as `77cd5b6`.
- `b-round-83-checkpoint-request.md` promised the formal request at this boundary. Root has not answered q1–q14 yet.
- Round 92 (SRW-21 stage 1) touches `ArrangementContext.tsx` only at the status initializer, the load-effect status and the three download names. It does not wait for this answer.

## Questions (inputs already on file)
- **q1–q13:** see `b-round-78-checkpoint-request.md` (SRW-16 snap entry points, row focus, track selection hook, volume state machine) and `b-round-83-checkpoint-request.md` (fades helpers, export dialog axes).
- **q14 — export orchestration (SRW-20 boundary):**
  - **(a)** Keep the export orchestration in `ArrangementContext.tsx` (`exportWav` l.2674–2749, `exportMp3` l.2751–2954, `exportAbortRef`, cancel, the unmount abort), or extract it into a `useArrangementExport` hook or a pure `lib/arrangement/export-orchestration.ts`? Acceptance for an extraction: CU1–CU9, EC1–EC4, TR1–TR6, MX*, PU* and EW* unchanged and green, and an identical `useArrangement()` surface.
  - **(b)** Keep or extract `useExportDialogFocus` from the four focus effects in `ArrangementExportDialog.tsx`.
  - **(c)** Where should `dialog-tab-stops.ts` live?
  - **(d) New from round 91:** the gate-91 reviewer suggests exporting the user-facing export message constants from one module, so tests import them instead of copying them. A's round-91 reviewer counted up to four coordinated edits per wording change (component/context plus `export-mp3`, `export-progress-ui`, `export-range-ui`). Keep or extract? Note: C's exact-text acceptance rows must keep literal strings in C's own harness either way.
  - **(e) Shared UI test harness (ARCH (c)):** round 92 adds a fifth copy of the workspace jsdom stubs (`purchased-collection-ui.test.tsx`). Should it be a shared `__tests__/harness/` module now?

## What B does without an answer
B schedules no extraction. Any approved change becomes one separate B task with one owner and behaviour-preserving tests. The Lows batch and the regression round do not wait for this answer.
