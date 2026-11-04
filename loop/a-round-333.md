# A round 333 — PERF-DRAG-PREVIEW stage c2b-ii (A done, C verifies)

**Scope:** implemented only `current-task.md` (round 333). No commits, pushes, installs or browser/perf runs. Protected files are untouched. Evidence is in `a-round-333/`.

## Pre-flight gate
This block was written after the patch was applied (B's patch was fixed in advance). It was stated in chat before the edits.
- **Assumptions:** apply B's exact sketch patch; the only hand edit is doc 232 §1.3; behaviour is held to HEAD; tests may only be strengthened.
- **Smallest version:** the patch itself (2 files), plus the doc.
- **Files:**
  - `ArrangementDetailPanel.tsx`: the fix (render-phase sentinel).
  - `drag-preview-render.test.tsx`: DP33–DP42.
  - doc 232: required by §1.3.
- **Success:**
  - claims-after equals the sketch output except for K2, K11, K12 and K7;
  - typecheck and lint rc 0;
  - 37 covering files green;
  - 6 mutants red on B's rows.

## Changed files (3; `git status --short` = 3 M, 0 untracked)
- `app/components/arrangement/ArrangementDetailPanel.tsx`: byte-exact B patch. `git apply -R --check --include=<panel> b-round-332/sketch/sketch.patch.txt` passes.
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: B patch plus strengthened rows. `a-round-333/test-vs-sketch.diff` has 9 lines added and 1 changed (`start.focus();` → `act(() => start.focus());`). No `expect(` was removed.
  - **DP39:** `renderLog.counts.clear()` before the 3–6 range change, then `rendersOf('ArrangementDetailContentInner')` is `1`. This pins the range-move commit removal.
  - **DP40:**
    - before Enter, the status does not contain `00:03.250`;
    - after Enter, the status contains `00:03.250` and `00:06.500` (the applied range);
    - after the invalid `1` Enter, the status is `DETAIL_RANGE_INVALID_MESSAGE` (new import from `../panels`).
  - **DP42:** `expect(document.activeElement).toBe(start)` before typing.
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`: all of §1.3.
  - l.1, l.4 and l.5 changed;
  - c2b-ii section, items 35–38, including D-29z992;
  - 4 alternatives, files entry, problem entry, testing entry and TODO;
  - 7 `## ` headings.
  - It also covers the reviewer Lows: range move in item 35, the count wording in item 36, and the backticks on the files entry.

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: identical to `claims-333-planning-output.txt` | `a-round-333/claims-before.txt` |
| A-IMPL | PASS: `git apply` clean, plus §1.3 by hand | — |
| A-CLAIMS-AFTER | PASS. Diffs vs `claims-333-sketch-output.txt`:<ul><li>K2 `de28cca 3`</li><li>K11 the new l.4</li><li>K12 `1 1 1 7`</li><li>K7 `271 44 10` (sketch `265 44 10`; +6 `expect(` from the strengthened rows)</li></ul>Everything else is equal. K10 reads `16`. | `a-round-333/claims-after.txt` |
| A-SCOPE | PASS: 3 modified, 0 untracked. `StudioWorkspace.tsx`, `ArrangementClip.tsx` and `ArrangementContext.tsx` pass `git diff --quiet` | — |
| A-TYPE / A-LINT | PASS: typecheck rc 0; lint rc 0 (K10 = 16); Biome on the 2 code files is clean | `typecheck.log`, `lint.log`, `biome-owned.log` |
| A-UNIT | PASS: 37 files, 613/613 (final tree). L31: the slowest rows are CP12a–d at 4.1–5.4 s against the describe's 30 s timeout (≤ 18%), and render-budget is about 2.0 s of 5 s (40%). Nothing is above 50%. New rows take 57–221 ms | `covering-unit.json`, `covering-unit.log`, `slow-tests.txt` |
| A-MUTANT | PASS. All 6 are red and `restored` is true, on a scratch whose git HEAD tree is `2ca37d0` (equal to `de28cca^{tree}`).<ul><li>On the patch tests the output is identical to `b-round-332/mutants-summary.txt`.</li><li>On the strengthened tests, MU-DTXT-EFFECT-BACK is now also red on DP39 (DP33, DP34, DP38, DP39). The other 5 are unchanged.</li></ul> | `mutants.txt`, `mutants-strengthened.txt` |
| A-REVIEW | DONE: the real `code-reviewer` subagent ran on all 3 files (score 8.5/10; no Critical or High). Findings and their handling are below | — |

## Code-reviewer findings and handling
- **Medium: DP40 did not prove that Enter applied anything.** Fixed by strengthening (status asserts). The context value here does not expose `range`, so the applied status text is the proof.
- **Medium: no jsdom render count for a range move.** Fixed: DP39 now asserts 1 render, and the HEAD mutant is red on it.
- **Low: DP42 never checked focus.** Fixed partly. Focus is asserted before the drag.
  - **Finding for B: A-R333-DP42-FOCUS-PREMISE (info/Low).** I tried asserting focus after the pointermove too. That assert fails in jsdom on both A's tree and HEAD's panel (scratch with `git show HEAD:` panel, failing at the same line). The clip pointerdown takes focus off the input in both versions.
  - So DP42's "focused input during the drag" is really "typed while focused; the drag then replaces it". The behaviour is the same as HEAD, so it is not a regression. C's DETAIL-TEXT step 2 checks the same thing in the real browser.
- **Low: "no extra mount pass" (v1 null seed) cannot be seen with the commit probe.** Not changed. The doc cites the perf/names evidence for it.
- **Low (doc): the files-entry backticks, range move missing from item 35, and the count wording in item 36.** All fixed. The import is counted with the matches (5 → 4 matches; 4 → 3 calls, verified with grep).
- **info:** loop safety, StrictMode, the undefined clip, the order of layout effects, the first render and on/off-clip changes all match HEAD. The duplicated `detailRangeTexts` call in the two lazy initialisers is harmless. I did not change it, because the panel file is frozen to the patch.
- **Architecture note (for B, a proposal and not an in-round task):** signal 3/4, `ArrangementDetailPanel.tsx:555` and `:577`. The file has been changed in several rounds (c2a, c2b-ii; D-29z915 still pending) and holds two copies of the same render-phase sentinel. Keep it: both live in one component with one lifecycle, and a generic hook is not justified. One-line signal only.

## Known gaps
- I ran no browser or perf rows. DRAG-NAMES, PERF, DETAIL-TEXT, D-ROWS and G333-AUTH are C's.
- The full suite, build, `verify` and e2e smoke are gate rows. I did not run them, per the speed rules.

## Exact next C checks
1. `bash b-round-332/claims-333.sh`. Expect `a-round-333/claims-after.txt`, with **K7 `271 44 10`** (strengthened rows).
2. SOURCE-SCOPE:
   - `git apply -R --check` passes for the panel (`--include`);
   - the whole patch fails only on the test file. The test differences are listed in `a-round-333/test-vs-sketch.diff`: additions only, plus the `act()` wrap of `focus()`.
3. **Scratch for MUTANT.** `git archive de28cca` plus `git add -A` skips `public/middle-east.mp3` because of `.gitignore`. Use `git add -f public/middle-east.mp3` to get tree `2ca37d0`. Expect `a-round-333/mutants-strengthened.txt` (EFFECT-BACK is also red on DP39).
4. UNIT ×3 on `drag-preview-render`, `detail-panel` and `detail-panel-polish`.
5. Browser rows as in §2.2: DRAG-NAMES, PERF (`hook-live` = 1 is recorded), DETAIL-TEXT (step 2: confirm that the focus loss on pointerdown is the same on A and HEAD), D-ROWS, G333-AUTH and DOCS.

## Acceptance marked by A
A-CLAIMS, A-IMPL, A-CLAIMS-AFTER, A-SCOPE, A-TYPE/A-LINT, A-UNIT, A-MUTANT and A-REVIEW pass. All §2.2 rows are open for C. The stage is not done until C passes it.
