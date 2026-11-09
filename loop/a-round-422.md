# A round 422 — SYS-2 stage 1 (held Enter on transport buttons and the marker flag)

**Status:** implemented; ready for C. No STOP.

## Changed files (`git status --short --untracked-files=all`: 3 ` M`, 1 `??`)
- `app/components/arrangement/ArrangementTransport.tsx` — sketch only (`git apply` of `b-round-421/sketch-422.patch.txt`, sha256 `7002efc193c1…aba45`; `git apply --check` passed first). Not edited afterwards.
- `app/components/arrangement/ArrangementMarkerRow.tsx` — sketch only.
- `app/lib/arrangement/__tests__/transport-centre-ui.test.tsx` — sketch only (HE1–HE6 appended).
- `docs/implementation/2026/quarter-IV/272-sys-held-enter-transport.md` — new. l.4 `**სტატუსი:** Completed (C round 422 PASS)`; the 7 TEMPLATE `## ` headings in order; mutant block byte-equal to `b-round-421/mutants/summary.txt` (checked with `diff`); browser HEAD-vs-sketch table from `b-round-421/probe/compare-head-vs-sketch.txt`; GATE107-S1 → HE6; A-R107 partial (HE1–HE5), open for stage 2; Fit/TH5 exclusion; TODO stage 2. Cited ids checked by A's grep: TC7, TC8, TC11, HE1–HE6 (transport-centre-ui), FL9 (self-disabling-focus), TH1–TH5 (export-toolbar-hold-enter). The ტესტირება table was reconciled with the actual HE1–HE6 bodies (3 repeats, snapshot fields, HE3 marker `0.000`, HE6 marker `6.000`, `sourceStarts` increases then stays equal). The neighbouring-rows claim holds: `export-toolbar-hold-enter` and `self-disabling-focus` are in the 23 covering files (A2 run). Mutant caption matches `mutants/run.py` (MU-HEAD-SRC reverts both components; six single-guard mutants).

## Checks (all actually run by A)
| # | Result | Log |
|---|---|---|
| A1 | claims at start == `claims-422-planning-output.txt` (empty diff), stderr 0 bytes, HEAD `4786c13` | `a-round-422/claims-start.txt`, `.err` |
| A2 | rc 0; **23 files, 509/509** | `a-round-422/a2-vitest.log` |
| A3 | `npm run typecheck` rc 0; `npm run lint` rc 0 (205 warnings, 1 info = B's precheck) | `a-round-422/typecheck.log`, `lint.log` |
| A4 | `npx biome check` on the 3 code files rc 0, no fixes | `a-round-422/biome3.log` |
| A5 | end claims rc 0, stderr empty. Diff vs planning (`a-round-422/claims-planning-vs-end.diff`): K2 `1 ?? 3 M total 4`, K5 `no`, K6 doc 272 + l.4, K9 (helper 11, export-inline 2, flag-first-guard 1, markerrow 5) and K10 (15 GUARD, 1 KEYDOWN-NO-REPEAT, 1 NONE) equal the sketch output, K20 rows-HE 6. K1 stays `4786c13`; K2b 0; K3 1317 rc 0; K4 rc 0. Re-run after each doc fix identical (`claims-end2.txt`, `claims-end3.txt`, stderr empty) | `a-round-422/claims-end.txt`, `claims-end2.txt` |
| A6 | `code-reviewer` subagent on the 4 files: **no Critical/High/Medium**, score 9/10 | below |

Not run by A (gate rows): full vitest, build, `npm run verify`. No browser run by A (the browser rows belong to C).

## Reviewer findings (A6)
- **Low (sketch, not edited):** on Split, Loop and Zoom to range, `onKeyDown` precedes `{...softDisabledButtonProps(...)}`. Safe today (`SoftDisabledButtonProps` has only `aria-disabled` and `onMouseDown`, checked by A), and consistent with the existing Undo/Redo/Delete/Zoom-back order. A future `onKeyDown` in that interface would silently override the guard. → For B (stage 2 or a hardening row).
- **Low (test strength):** HE4 and HE5 rely mainly on the `defaultPrevented` assertion in `holdEnter`; a repeated Split at the same insert marker probably does not change the snapshot. B's mutants still turn HE4 red under MU-SPLIT. Doc now states this (fixed in doc).
- **Low (doc):** doc said "one restart" for HE3/HE6, while tests assert `sourceStarts` increased and then the snapshot (incl. `sourceStarts`) is unchanged on repeats. **Fixed in the doc** wording; the HE4 sentence now cites only the test asserts and the probe fact (`head held []` for SPLIT/ZOOMRANGE), no guess.
- Info: no HE row presses a fresh Enter after the repeats (helper is stateless; FL9 covers older buttons). Info: Export keeps its inline guard (pre-existing).
- Rulings 1–7 and TL-R422-01…09 confirmed, not new findings.

## Process notes
- Primitives read: AGENT_DISCOVERABLE_CODE/FORWARDREF/AUDIO not needed for a sketch-only apply; GEORGIAN_DOCS (in full) and TEMPLATE.md read before/while writing doc 272; lessons.md read.
- The `pre-flight` skill was read after the sketch was applied, not before (truthful). Its content was covered by the task: assumptions = B rulings 1–7, scope = 4 granted paths, success = A1–A6. No code was written by A beyond `git apply`.

## Known gaps
- Fit stays unguarded by ruling (TH5).
- SYS-2 stage 2 (the rest of `b-round-421/data/button-guard-scan.txt`) not done; A-R107-SWEEP-HELD-ENTER-TOOLBAR stays open.

## Exact next C checks
Per task §6, order L59: row 3 mutants on a clean HEAD scratch (expect the 7 lines), rows 4–6 browser on the running :5173 server (held-enter probe `ALL OK (12 cells)`, play/stop + per-press mouse smoke, auth guard), then rows 1, 2, 7, 8 (claims as in A5, patch identity via `cmp` on a `git archive HEAD` scratch, doc 272 checks, end scope + L57).

## Acceptance criteria truly passed by A
A1, A2, A3, A4, A5, A6. C rows 1–8 not claimed.

## For B
- **Architecture note (reviewer):** none required. Proposal only: a bounded task to fold Export's inline guard into `preventRepeatedEnterKeyDown` and settle `onKeyDown` vs spread order across `ArrangementTransport.tsx` (could ride SYS-2 stage 2).
- Optional: an HE row that presses a fresh Enter after the repeats.
