# A round 454 — STORE-2b-3c-1 live teal CSS

**Status:** implemented; awaiting C. Store tree base `db641ec`. No commit/push.

## Changed files (exactly `b-round-453/grants-454.txt`)
- `app/styles/app.css` (M) and `app/styles/base/utilities.css` (M) — from `git apply b-round-453/sketch-454.patch.txt` (v4); no hand edits to code.
- `app/lib/__tests__/store-live-teal.test.ts` (new, from the patch).
- `docs/implementation/2026/quarter-IV/297-store-2b-3c-1-live-teal-css.md` (new, written by A with Write/Edit; l.3 `**თარიღი:** 2026-11-11`, l.4 `**სტატუსი:** In Progress (stage 2b-3c-1 of STORE-2b; C round 454 PASS)`, 7 TEMPLATE headings in order, no `pending`).

`git status --short --untracked-files=all`: only the 4 paths above.

## Steps and actual results (logs in `a-round-454/`)
| Step | Result |
|---|---|
| 2 claims before | `claims-before.txt` == `claims-454-planning-output.txt`; stderr empty |
| 3 apply | patch sha256 OK; `git apply` clean; `sketch-files-sha256.txt` 3 OK |
| 5 covering | `npx vitest run $(cat covering-454.txt)`: 14 files / 134 tests PASS (`covering.log`) |
| 5 typecheck | rc 0 (`typecheck.log`) |
| 5 lint | rc 0, 205 warnings = HEAD (`lint.log`) |
| 5 biome scoped | `npx biome check app/lib/__tests__/store-live-teal.test.ts` rc 0, no diagnostics |
| 5 mutants | scratch `/tmp/a454-src` (`--shared` clone at db641ec + patch, node_modules symlink excluded, committed in the scratch only); `a-round-454/mutants/mutants.txt` == `b-round-453/mutants/mutants.txt` (27 lines) |
| 5 code-reviewer | run (real subagent). 8/10, no Critical/High. See below |
| 6 browser | dev `:5173` (existing, A's tree); mock API `:5199` started with setsid (was down); warm x2. `teal-probe` + `compare-teal.py` vs B's `head-*.json`: `ROWS 19 ALL_OK True` at 1440x900 and 1280x720 (`compare-1440.txt`, `compare-1280.txt`). `scrollbar-pixels`: tealPx 0, thumbGreyPx 1030 / 508, geo == HEAD at both. `extras-probe` + `compare-extras.py`: `ROWS 8 ALL_OK True` at both. Shots in `a-round-454/shots/` |
| 7 claims after | differs from `claims-454-sketch-output.txt` only in K10 (`1 files`) and K12 (`outside 0 inside 4`); stderr empty |
| 8 git status | 4 granted paths only |

Not run by A (speed rules / gate): full vitest suite, build, `npm run verify`.

## code-reviewer findings (on B's patch; A made no code hand edits, per task step 3)
- **Medium** A-R454-REVIEW-M-DEAD-UNCHECKED: LT3/LT5/LT6 trust the "dead" label of allow-listed rules; nothing asserts those classes have no mounted consumer (`audio-preview-inline-button`, `waveform-bar`, `track-row-waveform`, `loading-brand` still appear in TSX of currently unmounted components). Proposal for 2b-3c-2/2b-3d: reachability check per dead class.
- Low A-R454-REVIEW-L1: LT1 pins `.code-4 { color: var(--color-text-primary) }`; token undefined repo-wide (pre-existing).
- Low A-R454-REVIEW-L2: LT1 pins motion values (`scale(...)`, `transition: all`) that STORE-2c/2d will change -> test churn.
- Low A-R454-REVIEW-L3: LT1 header counts only exact top-level lines; a brass glow in an `@media` copy passes (LT5 catches teal only).
- Low A-R454-REVIEW-L4: LT5 header bucket never resets on `}`; `@theme` is one 6-hit bucket (mitigated by LT6).
- Low A-R454-REVIEW-L5: CRLF checkout turns LT1/LT2 red (fails safe).
- Low A-R454-REVIEW-L6: `color-mix` / `in srgb` gradient have no fallback; old browsers drop the decorative layer.
- Info: Biome does not check CSS (doc line clarified); `none` resets are test anchors only; `AudioPlayer.tsx:78` play button lacks base class (pre-existing, harmless).
- Doc fixes applied by A: Biome scope clarified; the Medium and L1 recorded in doc TODO.
- **Architecture note (for B, not acted on):** `hitsByEnclosingRule` in the test is a second line-regex CSS parser; keep for now; propose moving enclosing-rule attribution into `helpers/style-scan.ts` on its brace-aware walker in 2b-3c-2 (SIG-R453-CSSRULEBODIES), with nested/single-line self-tests.

## Acceptance (A-side only)
- Passed by A's own runs: task steps 2, 3, 5, 6 (four probe checks at both viewports), 7, 8.
- Not claimed: C rows C1-C10 (C verifies independently) and gate rows.

## Known gaps
- BLOCKED (backend unavailable in cloud): signed-in legacy ExportDialog stem list; fake-bearer premium path.
- Not testable in cloud: Firefox `scrollbar-color`, Safari WebKit thumb hover (TLM-R454-FIREFOX-SAFARI-SCROLLBAR).
- A did not start a HEAD `:5182` control server; compared against B's saved HEAD JSONs. C runs its own HEAD control (C4/C5/C6).
- Mock API on `:5199` was started by A (setsid) and left running.

## Exact next C checks
C1 scope, C2 claims, C3 apply hashes, C4 teal-probe HEAD vs tree at both viewports, C5 head-self control fails, C6 scrollbar pixels HEAD+tree, C6b extras + sweep, C7 covering + mutants on a C scratch, C8 c12 studio/purchase protection, C9 doc 297 lines, C10 l57 check — as in `current-task.md` section 3.

## Scope
Round 454 task only. Backlog not marked complete.

## Final re-checks (after the last doc edit)
- Covering set re-run: 14 files / 134 tests PASS (`a-round-454/covering-final.log`).
- `claims-454.sh` re-run: differs from the sketch output only in K10/K12; stderr empty (`claims-final.txt`).
- `git status`: the 4 granted paths only. Doc l.3/l.4 exact; 7 headings in order; `pending` count 0.
- A reproduced the reviewer's claims with grep: `--color-text-primary` has no definition in `app/`; `audio-preview-inline-button`/`waveform-bar` appear in `AudioPreviewButton.tsx`, `WaveForm.tsx`, `TrackRow.tsx`.
- Doc gaps filled: full dead-class list and the card hover scale in the motion lines.
- Reviewer findings are deliberately **not fixed in code**: step 3 forbids hand edits and C3 pins the file hashes. They go to B with ids and the Architecture note, which is how they are addressed this round.
