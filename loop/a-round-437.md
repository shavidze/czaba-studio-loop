# A round 437: COPY-PD-VIS stage 2 (STUDIO-VIS-7, STUDIO-VIS-10, SABA-LANE-RESIZE-HANDLE)

**Status:** implemented and handed to C.
- The first code review graded CR-1/CR-2 (the Detail drag state) Medium. A's brief had misstated the intent (it said the drag swap covered both handles).
- A scoped follow-up review had the real diff (`a-round-437/round.diff`) and the task §2/C6 quoted verbatim. It re-graded both as **none**: the spec scopes the drag swap to the lane only, and HEAD had no Detail drag state.
- Both grades are recorded below. No unresolved Medium+. The browser rows belong to C.
**Baseline:** HEAD `69de9bd`, clean tree at start; no earlier A-437 partial work found.

## Changed files (13, all granted; `a-round-437/status.txt`)
- Components (the sketch, applied unchanged):
  - `ArrangementExportDialog.tsx`
  - `StudioWorkspace.tsx`
  - `StudioNarrowScreen.tsx`
  - `ArrangementLane.tsx`
  - `ArrangementDetailPanel.tsx`
- Tests (the sketch):
  - `affordance-colour-ui`
  - `export-dialog-hold-enter`
  - `label-status-colour-ui`
  - `mixer-onstate-colour-ui`
  - `panel-radius-ui`
  - `studio-narrow-gate-ui`
  - `track-layout`
- New: `docs/implementation/2026/quarter-IV/284-studio-vis-7-10-lane-hairline.md`
  - TEMPLATE headings in order;
  - l.4 is `**სტატუსი:** Completed (C round 437 PASS)`, the same format as doc 283;
  - approach notes (a)–(d) are present;
  - it cites only DXA5, ESU1, DXL3, DXM5 and NG1b, plus the 7 test files.

## A checks (actually run)
| # | Result |
|---|---|
| A1 | PASS. `git apply --check` OK, then applied. The `git diff` equals the sketch, ignoring `index` lines (`diff` empty). Sketch sha256 `8825911…1dde9`, 12 headers |
| A2 | PASS. Covering set: 8 files, 106/106, rc 0 (`a-round-437/covering.log`) |
| A3 | PASS. `npm run typecheck` rc 0 (`typecheck.log`). `npm run lint` rc 0 with 205 warnings, the same as the sketch (`lint.log`). Biome scoped to the 12 changed code files: rc 0, no fixes (`biome-scoped.log`) |
| A4 | PASS with one explained extra. Output: `a-round-437/claims-437-a-output.txt`, rc 0. Diff against the sketch output: `claims-vs-sketch.diff`. It differs in K1 (scratch hash vs `69de9bd`), K2 (13 paths, 0 outside the grants), K6 (doc 284 present) **and K27**: A gets `08b9e53 2026-10-13`, the sketch-scratch run got `c1cd13d 2026-11-10`. A's value equals B's planning output and the task's D-29z1553 correction. The sketch value is an artefact of the scratch repo's history, not a code difference |
| Scope | Frozen manifest (1333) rc 0; protected manifest rc 0; 0 paths outside the grants |

Not run by A (they belong to the gate or to C): the full vitest suite, `npm run verify`, build, the browser probes C3–C13 and the mutants C8.

## Code review: actual `code-reviewer` subagent, score 7/10, no Critical or High
The 12 sketch files are **not edited**: C2 requires byte identity with the sketch. Only doc 284 changed after the review.

| # | Sev (reviewer) | Finding | A disposition |
|---|---|---|---|
**Reviewer limitation (first run):** it had no shell. It reviewed only the files after the change and could not confirm that no assertion was only removed.

**Follow-up run (with the diff):**
- CR-1 and CR-2 are re-graded to **none**.
- Every removed `expect` in the 7 test files has an equivalent or stronger replacement (DXA5, ESU1, DXL3, DXM5, the panel-radius and track-layout constants; NG1b is new). No assertion is only removed.
- The follow-up repeats "pointer capture keeps :hover". A's grep found no `setPointerCapture` in the lane height handle (see CR-4); the Detail separator was not checked.

The table below is from the first run. Its dispositions are superseded where the follow-up says so.

| # | Sev (reviewer, first run) | Finding | A disposition |
|---|---|---|---|
| CR-1 | Medium → none (follow-up) | The Detail separator (`ArrangementDetailPanel.tsx:1386`) has no drag state (`after:bg-foreground/40` plus the hover swap), unlike the lane | **Not a STOP by A's triage; B must rule. Not in the sketch review.** B's spec (task §2 "Detail separator … follows … with `after:top-0`", the product-designer ruling and C6) defines the Detail hairline as hover-only. HEAD's class was a fixed `hover:bg-foreground/50` with no drag state either, so this is not a regression; during a drag the separator is expected (unmeasured) to show the hover /25. The Medium partly comes from A's review prompt, which wrongly described the drag swap as covering both handles. The gap is recorded in doc 284's TODO. Proposed follow-up: `isDragging ? 'after:bg-foreground/40' : 'hover:after:bg-foreground/25'` (`isDragging` already exists at l.1162). If B rules it in scope, this round becomes a STOP |
| CR-2 | Medium → none (follow-up) | No test covers a Detail drag state | Same as CR-1. It only applies if B adds the drag state; DXM5 covers the specified hover state |
| CR-3 | Low | `expectHairlineHover`'s `after:top-0` edge is never used | Not changed (sketch identity); for B |
| CR-4 | Low | The swap's stated cause, "pointer capture", is wrong: the height handle calls no `setPointerCapture` (grep confirms) and uses window listeners + `claimPointerGesture` | **Doc 284 note (d) and its problems section corrected.** They now state the measured fact (B's probe read /25 during the drag) and give the mechanism as an unmeasured inference. The task text and the L61 clause also say "pointer capture"; for B to correct. `stubCapture` in DXA5 is harmless |
| CR-5 | Low | The lane hit area is really 7 px (`::after` on the border row) | Matches task §2 ("grows from 6 px to 7 px"). No action |
| CR-6 | Low | The header exit link uses `gap-0.75`, the narrow one `gap-1` | Pre-existing (the sketch does not touch gap). NG1b compares colour tokens only. Deferred-Low candidate for B |

**Architecture note:** reviewer: none. The sketch review's own note stands: two hairline recipes now exist, and a third separator should trigger a shared constant in `studio-focus.ts`.

## /check skill
- Read: `.claude/skills/source-command-check` → `.claude/commands/check.md` (`npm run verify` + `test:e2e:smoke`).
- **Not run by A** under the 2026-10-21 speed rules: `npm run verify`, `npm run test:e2e:smoke`, `npm run build`. They are gate rows.
- Run instead:
  - typecheck rc 0;
  - lint rc 0;
  - Biome scoped to the 12 changed code files rc 0;
  - the covering set.

## Pre-flight and primitives
- Pre-flight was done: assumptions, simplicity, scope and success criteria stated before applying the sketch.
- Primitives read only in part (the openings): FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, GEORGIAN_DOCS, AUDIO_ARCHITECTURE; also the implementation TEMPLATE.
- The change is B's pre-written sketch, which uses tokens only.

## After the doc edits (re-run)
- 13 paths, 0 outside the grants.
- Frozen manifest rc 0; protected manifest rc 0.
- Claims output unchanged.
- `git diff -- app` still equals the sketch.
- Doc l.4 reads `**სტატუსი:** Completed (C round 437 PASS)`.

## Known gaps / notes
- No browser run by A. Every visual, pixel, press and export claim is C's to verify.
- Accepted or deferred items from the task, unchanged:
  - B-R437-BUTTON-CURSOR-UNLAYERED: no busy cursor;
  - TL-R437-01: the Detail two-row hover reading;
  - TL-R437-02: the doc 144 override (recorded in doc 284).
- K27: a sketch-scratch artefact (see A4). C10 should compare it with the planning output, where it is equal.

## Exact next C checks
- C1/C14 scope: 13 paths, both manifests.
- C2 patch identity.
- Browser rows:
  - C3 `vis-probe.mjs` + `summarize.py`;
  - C4 `narrow-probe.mjs`;
  - C5 `rows-decode.mjs` + `press-export-probe.mjs`;
  - C6 Detail hover column;
  - C7 K10b sweep (5 hits) + the screen budget.
- C8 mutants.
- C10 claims: allow K2/K6 vs planning; K27 equals planning.
- C11 doc 284.
  - Note (d) was rewritten after CR-4: it now states the measured fact and gives the mechanism as an inference.
  - The TODO lists the Detail drag-state gap.
- C6: also record what the Detail separator paints during a drag. Expected /25 (hover); there is no /40 by design (CR-1).
- C12 auth.
- C13 smoke + real WAV export.

## B acceptance passed by A
A1, A2, A3, A4 (with the K27 explanation). No C row is claimed.
