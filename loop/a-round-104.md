# A — Round 104 report: GATE96-S2 (repeated status re-announced) + GATE103-S5 (doc 091 l.4)

Implementer: A (Claude Opus 5.5) · 2026-10-23 · Task: current-task.md (round 104, D-29z69)
Status: implementation complete, waiting for C. One review finding (A-R104-REPEAT-DRAG) is open and outside ownership. Nothing committed or pushed.

## Start state (verified)
- HEAD `3b6178b758253d5098cea19f07c43e4799cb9299`, `git status --short` empty, frozen list 535/535 OK, owned files matched B's snapshots (db7a477d / ac9c0815 / e489e5f4).

## Changed files (end sha256 in `a-round-104/end-hashes.txt`)
| File | Kind | sha256 |
|---|---|---|
| app/contexts/ArrangementContext.tsx | M | 3b22246a… |
| app/components/arrangement/StudioWorkspace.tsx | M | bfe53dcb… |
| docs/implementation/2026/quarter-IV/091-studio-export-worker-watchdog.md | M (l.4 only) | 075dbf68… |
| app/lib/arrangement/status-announcement.ts | new | 8befcfa8… |
| app/lib/arrangement/__tests__/status-announcement.test.ts | new | d25afddf… |
| app/lib/arrangement/__tests__/status-announcement-ui.test.tsx | new | 503b198a… |
| docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md | new | eaafb193… |

End state: 3 M + 4 ??; frozen list 535/535 OK; HEAD unchanged.

### Diff scope
- ArrangementContext.tsx (`git diff -U0`): `useReducer` added to the react import; a new import block for `~/lib/arrangement/status-announcement` (sorted between selection and transport); `statusSequence: number;` after `status: string;`; the old l.535 is replaced by the `useReducer(reduceArrangementStatus, collection.origin, (origin) => createArrangementStatusEntry(workspaceCollectionCopy(origin).loading))` call plus `const status = statusEntry.text; const statusSequence = statusEntry.sequence;`; and `statusSequence,` follows `status,` at both value sites (value object + deps). Untouched: the `lastNonRefusalStatusRef` lines, the functional restore at the old l.1484 and every `setStatus(` call.
- StudioWorkspace.tsx: `statusSequence` in the destructure, and `{status}` becomes `<span key={statusSequence}>{status}</span>`. The `<output>` attributes and position are unchanged and it is not keyed.
- The layout was formatted by hand to Biome's stdin output (no `--write`).

## Commands run and results
- `npx biome check <5 code/test files>` → "Checked 5 files … No fixes applied", exit 0 (`a-round-104/biome-check-owned.txt`).
- `npm run typecheck` → exit 0 (`typecheck.log`).
- `npm run lint` → exit 0, 218 warnings + 1 info repository-wide; `biome lint --max-diagnostics=2000` shows **0** diagnostics in the owned and new files (`lint.log`).
- The targeted list (B's grep command) has **69** files (`targeted-list.txt`). `npx vitest run $(cat …)` → **69/69 files, 1122/1122 tests passed** (`targeted-vitest.log`). That is B's 1113 plus the 9 new tests. render-budget and context-hygiene are included and green, unchanged.
- I did not run the full suite or `npm run verify`, per the speed rules; the gate runs them.

## Fail-before (scratch `a-round-104/mut/`, app files = B snapshots, module absent) — `fail-before.log`
- `status-announcement.test.ts`: the file fails to import (`Failed to resolve import "../status-announcement"`), so SA1–SA5 do not run.
- SU1 red (`expected null not to be null`, the firstElementChild check); SU2 red (same); SU3 red (`expected +0 to be 1`, childElementCount); **SU4 green**.
- This matches B's expectation exactly.

## Mutations (scratch; `run-mutations.py`, `mutations.log`, `mutation-results.json`)
| Mutation | Red tests | Matches B |
|---|---|---|
| unmutated control (before and after) | none, 9/9 green | — |
| m1: identical string returns `previous` | SA3, SU1, SU2 | yes |
| m2: span key removed | SU1, SU2 | yes |
| m3: key on `<output>`, span removed | SU1, SU2, SU3 (all at the region-identity `toBe(region)`), SU4 (stale detached region text) | yes, plus SU4 (see below) |
| m4: function branch always bumps | SA4, SU4 | yes |
| m5: `statusSequence` missing from value deps | SU1, SU2 (span not replaced) | yes (B: "SU1/SU2 or none") |

- On the first mutation run, m3 turned the tests red only at a stale-node text read. I then added an explicit `getByTestId('arrangement-status')` `toBe(region)` check right after the first action in SU1–SU3, so m3 now fails at the identity assertion. The final run above uses the final test files.
- SU4 is also red under m3, because the region captured at mount is detached when the key changes. That is an extra detection, not a gap.

## A's own browser check (not C's acceptance) — `a-round-104/browser/`
SR-REPEAT-SPACE at 1280 and 1440 against the running `:5173/studio-lab` (Playwright Chromium):
- 0 clips; activeElement was BODY; after both presses the text is exactly the expected sentence.
- The second press produced 2 `childList` records, and one of them adds the exact sentence.
- The `<output>` is the same node, with `aria-live=polite` and 1 element child.
- The position stays `00:00.000`.
- The CDP AX count is 2 after both press 1 and press 2.
- 0 errors, 0 forbidden requests. Screenshot: `repeat-space-1280.png`, with the status on one line.

## Code-reviewer, first output (project `code-reviewer` subagent) — score 9/10
- Critical/High/Medium: none.
- Low 1: the SA5 assertions are sufficient; no action.
- Low 2: SU4 is green on baseline by construction, so the doc should say it is a guard and not a fail-before test. **Applied:** one sentence added in doc 092 under ტესტირება.
- Low 3: the doc wording on clear-and-set is accurate; no change.
- The reviewer confirmed hydration (sequence 0 on both sides), StrictMode purity, dispatch assignability, that the lastNonRefusalStatusRef effect is unaffected, and that the render cost is bounded.
- **Architecture note (verbatim):** "Architecture note: none — the reducer is a small pure module with one owner (ArrangementContext), and the keyed span is a one-line render detail; extracting further would add indirection with no value."

## Code-reviewer, second output from the same invocation (no shell; it read files) — score 8/10
The same reviewer task reported twice. The second report is more critical, and I give it precedence where the two conflict.
- **Medium 1, confirmed by me at `ArrangementClip.tsx` l.495, 513, 563, 579–581 and 611–615.**
  - During a *blocked* drag (single-clip blocked move, group blocked, lane refusal, trim blocked), the identical sentence is passed to `setStatus` on every pointermove. Before this change that was a React bail-out (no render). Now each move bumps the sequence. That causes a provider render, a re-render of every `useArrangement` consumer, a span swap and a repeated polite announcement of the same sentence.
  - On the single-clip blocked-move and lane-refusal paths, `previewArrangement` is not called, so these moves used to render nothing.
  - The span swap is at most one per pointermove, so SR-DRAG-STREAM's "≤ pointermoves + 2" bound still holds, but announcement chatter and the render cost are new.
  - **Not fixed: outside ownership.** The fix is to change those call sites to `setStatus(() => message)`, which reuses the silent same-object path. It needs `ArrangementClip.tsx`, which is frozen this round. **Proposed backlog ID for B: A-R104-REPEAT-DRAG.** Doc 092's earlier claim ("same frequency, no extra multiplication") was wrong; **corrected** in doc 092, with the gap recorded as open.
- **Low 2:** the mount effect re-sets `copy.loading`, so the sequence becomes 1 (2 in dev StrictMode), plus one extra render and span swap. Hydration is safe (key 0 on both sides). **Documented** in doc 092.
- **Low 3:** doc 092 overstated the silent restore. In React 18 `useReducer` has no eager bail-out: the provider body runs, but nothing is committed. **Doc corrected.**
- **Low 4:** the MutationObserver callback discarded its records. **Fixed:** the callback now collects records, which are merged with `takeRecords()` (`stopWatching`).
- **Low 5:** no direct `statusSequence` assertion; `includes(...).toBe(true)`. **Fixed:** SU1 asserts sequence + 1 for the identical second press, SU4 asserts the sequence is unchanged after the silent restore, and `toContain` is used. A StrictMode-wrapped test was **not added** (proposal for B; the reducer purity is covered by SA3/SA4).
- **Architecture note (verbatim, second output):** "Keep — moving the pure reducer into `lib/` is a harmless ownership shift and is unit-tested, while the ref, layout effect and restore closure correctly stay with the gesture lifecycle in the context. The only signal is a weak one: the status region was touched in round 94 and again now in 104. Extracting further has low value and would add risk to the gesture/restore invariant."
- After these test and doc changes I re-ran everything on the final files:
  - fail-before: identical (SA import failure; SU1/SU2/SU3 red; SU4 green);
  - mutations m1–m5: identical red sets, control 9/9;
  - Biome on the 5 files: 0;
  - typecheck: 0;
  - lint: 0, with 0 diagnostics in the owned files;
  - targeted: 69/69 files, 1122/1122 tests;
  - frozen list: 535/535;
  - git status: 3 M + 4 ??.

## B acceptance criteria I actually passed
- T1, T2, T3, tests (SA1–SA5, SU1–SU4), fail-before as predicted, m1–m5 recorded, doc 091 l.4, doc 092, typecheck, lint with 0 diagnostics in owned files, scoped Biome, targeted 69/1122, and the code-reviewer run.
- The browser rows (SR-*, PX-NET, REG-HYD, G104-3) are **C's**. Only A's own SR-REPEAT-SPACE probe ran.

## Known gaps
- **A-R104-REPEAT-DRAG (open, proposed Medium/Low for B):** blocked-drag repeats now re-render and re-announce on every pointermove (see above). The fix needs `ArrangementClip.tsx`, which is outside this round's ownership.
- No real screen reader was used (Tech Lead check R104-T).
- SR-DRAG-STREAM, SR-REPEAT-FAILED-ROW, SR-REGION-STABLE and SR-TEXT-REG were not run by A.
- The full suite, verify, build and e2e smoke were not run by A (gate).

## Exact next C checks
1. SOURCE-UNCHANGED: HEAD 3b6178b, 3 M + 4 ??, `sha256sum -c ../tmp/studio-real-loop/b-round-103-r104-tree-sha256.txt` 535/535, end hashes = `a-round-104/end-hashes.txt`, plus the diff-scope checks above.
2. T104-TARGETED: re-grep (expect 69) and run it (expect 1122 green).
3. AN-REVIEW: re-run m1–m4 in C's own scratch with C's own mutation strings.
4. Browser: in SR-DRAG-STREAM, also hold a clip move against a neighbour (blocked move) for ≥ 40 pointermoves and report the added span count and provider-driven DOM churn, as evidence for A-R104-REPEAT-DRAG. SR-REPEAT-SPACE (1280, 1440), SR-REPEAT-FAILED-ROW (abort `**/videos/hero/hero-music.mp3`), SR-REGION-STABLE, SR-DRAG-STREAM (fade-in clamp, added element nodes ≤ pointermoves + 2, longtask report only), SR-TEXT-REG, PX-NET, REG-HYD, G104-3 (fake-Bearer BLOCKED, backend unavailable).
