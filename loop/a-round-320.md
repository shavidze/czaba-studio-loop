# A round 320: PERF-8a fix-up 2. Memo naming (O1), RS8, budgets, notices, docs

No STOP. Every §6 condition was checked and none was met. The tree is mid-round and must not be published until C PASS and gate 320.

## 0. Pre-flight gate
- **Assumptions:**
  - continue on the round-319 37-entry tree and do not revert it;
  - O1 naming for exactly the five components;
  - test changes are limited to the five literals plus RS8;
  - no visible change.
- **Smallest version:** about 20 changed source lines (declaration and closing lines), plus RS8 (~95 lines), the budgets JSON, the notices and two docs.
- **Files touched:** only the §2.1 paths plus doc 230. Nothing else.
- **Success criteria:**
  - claims-after as A-CLAIMS-AFTER;
  - typecheck and lint rc 0;
  - the 45 A-UNIT files plus the licence test green;
  - 6 mutants red;
  - prod per move ≤ 15, max ≤ 35, `failures` [].

## 1. Changed files (this round)
| Path | Change |
|---|---|
| `app/components/arrangement/ArrangementClip.tsx` | `function ArrangementPeakPathInner` + `export const ArrangementPeakPath = memo(ArrangementPeakPathInner);`; `function ArrangementClipRangeOverlayInner` + `const ArrangementClipRangeOverlay = memo(ArrangementClipRangeOverlayInner);` |
| `app/components/arrangement/StudioWorkspace.tsx` | `function ArrangementRangeReadoutInner` + `const ArrangementRangeReadout = memo(ArrangementRangeReadoutInner);` |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | `ArrangementDetailPlayheadInner` / `ArrangementDetailWaveformInner` + their `memo` consts |
| `app/lib/arrangement/__tests__/render-budget.test.tsx` | the 3 Playhead literals → `…Inner` |
| `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx` | `PARENT_NAMES` Waveform → `…Inner`; l.557 PeakPath → `…Inner` |
| `app/lib/arrangement/__tests__/detail-panel.test.tsx` | new `describe('RS8 explicit range prop wins over the range store (D-29z874)')`, 3 tests |
| `perf/budgets.interactions.json` | 5 rows → `assert`, owner `PERF-8a`, `"op"` spelling (`<=` 15 ×2, `<=` 35 ×2, `==` 0) |
| `THIRD_PARTY_NOTICES.md` | regenerated: (560) → (564), +4 rows exactly as §2.4, no other line |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | `## მეტრიკები`: one new paragraph naming the 5 asserted rows, owner PERF-8a, measured values |
| `docs/implementation/2026/quarter-IV/230-perf-range-store.md` | **new**. l.4 is `**სტატუსი:** In Progress (stage 1 of 2; C round 320 PASS)`. TEMPLATE's 7 headings are in order |

**Hunk identity:** the source and test hunks of this round (`a-round-320/round-320-source.patch.txt`, rebuilt by reverse-applying B's sketch to copies) have changed lines identical to `b-round-319/sketch-o1.patch.txt`. The bodies are byte-equal; only the declaration and closing lines changed and the `memo` const lines were added. Call sites are unchanged.

**Direct check, the two literal-only test files vs HEAD:** `git diff -U0 HEAD` on `render-budget.test.tsx` and `clip-gain-pointer-preview.test.tsx` shows exactly 5 `-` / 5 `+` lines: the three Playhead literals, the `PARENT_NAMES` Waveform literal and the l.557 PeakPath literal. Nothing else changed.

**RS8 details:**
- **Observables:** the From/To input values (`arrangement-detail-start` / `-end`) and the overlay testid `arrangement-detail-range`, with its `style.left` / `width`.
- **How the store is driven:** a `DetailProbe` inside the same `ArrangementProvider` calls the context's `setTimeRange`, which writes to the range store. Each case asserts the store state with `live(api).range`, so (a) proves the store really holds r.
- **The panel under test:** rendered directly inside the provider with an audio selection (`music-1`, start 2, duration 8) and opened with the toggle.
- **The three prop states:** omitted (a conditional spread), `null`, and r.
- **(c):** checks panel node identity (no remount) and both directions (set, then clear).

## 2. Checks actually run
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS (before) | `claims-320.sh` output **identical** to `claims-320-head-output.txt` | `a-round-320/claims-before.txt` |
| A-CLAIMS-AFTER | K2 `50662e1 43`; K4 0, K5 0, K6 8, K7 0, K8 11 OK, K11 0, K12 2, K13 1, **K14 5**, K15 1, K16 12/12, **K17 1 / 1**, K18 1, **K19 1+1 ×4**, **K20 (564) / 1**, **K21 1**, K22 `b7528ac5ab192b8d`, K23 0, **K24 0**, **K25 0+0+0 / 3+1+1**, **K26 4** (≥ 1), **K27 88 / 184**. All equal the A-CLAIMS-AFTER row | `a-round-320/claims-after.txt` |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-320/typecheck.log` |
| A-LINT | `npm run lint` rc 0: 205 warnings + 1 info, the same as round 319. Scoped `biome check` on the 6 changed TS/TSX files: 0 diagnostics | `a-round-320/lint.log` |
| A-UNIT | 45 files from `a-round-319/unit-files.txt` + `third-party-licenses.test.ts`: **46 files, 970 / 970 passed, TL5 included** (897 + 3 RS8 + 70 licence tests). Slowest single test is CP12a–d, 9.1–9.5 s against a 30 s timeout. Gate 317's `verify.log` max is 10.2 s (34 %), so it is not above 50 % | `a-round-320/unit.log` |
| A-UNIT perf | `perf/lib/report.test.ts` through a scratch `vitest.perf-scratch.config.ts` (include `perf/**/*.test.ts`) on `/tmp/a320s`: 34 / 34 | `a-round-320/perf-report-unit.log` |
| A-EXPECT | `expect-count.py`: 22 files, none lower. Only `detail-panel.test.tsx` changes, 135 → 154 (RS8 = 19 asserts). TOTAL 3,139 → **3,158**. render-budget / clip-gain-pointer-preview stay 88 / 184 | `a-round-320/expect-count-after.txt` |
| A-MUTANTS | Scratch `/tmp/a320m`, never in `store/`. Results below. Restored: range-store + detail-panel 34 / 34 green | `a-round-320/mutants.txt`, `mutants.py`, `mut-*.log` |
| A-PERF (alone) | Production build on scratch `/tmp/a320s`, interactions spec once, rc 0, 5.4 min. Results in §2.1 | `a-round-320/perf-a-scratch.log`, `perf-a-latest-interactions.json`, `rowcmp-vs-c319.txt` |
| A-PERF dev breakdown | A's round-318 profiler on :5173 (served from this tree, `…Inner` names). Results in §2.2 | `a-round-320/diag-dev-steady.json`, `diag-dev-from-down.json` |
| A-REVIEW | actual `code-reviewer` subagent on the final tree, after all code edits (no code changed after it). Results in §3 | §3 |

**A-MUTANTS results:**

| Mutant | Rows red |
|---|---|
| MU-RANGE-IN-VALUE (`useStore(rangeStore)` value put into the context value and its deps) | RS4 |
| MU-LANE-NEW-OBJECT (`selectArrangementClipRange` returns `{ ...range }`) | RS4, RS5, RS6 (no loop) |
| MU-NO-STATUS-REWRITE | RS6 |
| MU-STALE-LATESTREF (`splitSelection` reads a render-time `useStore` snapshot) | RS7 |
| C-MU-DETAIL-IGNORE-PROP | RS8(a), RS8(b) |
| MU-DETAIL-IGNORE-STORE | RS8(c) |

### 2.1 A-PERF (production build)
| Row | A round 320 | Budget |
|---|---|---|
| `interact.drag.range.stopped.move-components-per-move` | **9.233** | ≤ 15 PASS |
| `interact.drag.range.playing.move-components-per-move` | **9.233** | ≤ 15 PASS |
| `interact.drag.range.stopped.move-components-max` | **30** | ≤ 35 PASS |
| `interact.drag.range.playing.move-components-max` | **30** | ≤ 35 PASS |
| `interact.drag.range.playing.move-restarts` | 0 | == 0 PASS |
| `interact.harness.drag-range-live` (and `.6x`) | 1 | == 1 PASS |
| `failures` | `[]` | |

**Non-range rows, compared with C's round-319 JSONs** (`a-round-320/rowcmp-vs-c319.txt`, every components/commits/restarts/path/mutation row): **no row of this tree is above the `50662e1` baseline.**

| Row | Baseline | r319 tree | r320 |
|---|---|---|---|
| click.components | 109 | 107 | 103 |
| drag.move per move | 107.283 | 106.3 | 103.35 |
| zoom.30.components-per-key | 247 | 275 | 245 |
| play.start-components | 94 | 92 | 92 |

This is an A-side comparison against C's earlier baseline run. C's PERF-RANGE row on a fresh baseline build decides.

### 2.2 Dev profiler breakdown (:5173)
**Steady window** (30 moves after a 10 px pre-move): 60 commits, 270 components, histogram 30 × 7 + 30 × 2.
- **Main commit (7):** `ArrangementClipRangeOverlayInner`, `ArrangementDetailPanel`, `ArrangementDetailContentInner`, `ArrangementDetailWaveformInner`, `ArrangementDetailClipGain`, `ArrangementRangeReadoutInner`, `ArrangementTimeText`.
- **Layout commit (2):** `ArrangementDetailContentInner`, `ArrangementDetailClipGain`.
- PeakPath and Playhead bail in both commits, and Waveform bails in the layout commit. This matches B's projection of 7 + 2.

**From pointerdown:** 59 commits, histogram 29 × 2, 28 × 7, 1 × 30, 1 × 92.
- 92 is the pointerdown commit, outside the harness window.
- 30 is the first-move null→range commit with the transport flip (D-29z864).

**Invalid attempt:** the first steady attempt timed out on a cold dev load (L38). It is kept as `diag-dev-steady-coldstart-invalid.log` and was replaced once.

## 3. Code review (A-REVIEW, final tree)
The reviewer scored the tree 9/10. There are no Critical, High or Medium findings. All eight checks PASS:
- (1) no selector builds a new object;
- (2) the event-time reads use `getState()`, except the documented `applyDetailRange`;
- (3) the memo form is right and props are stable at the call sites on audio selections. The listed non-bail is the Waveform on video selections (`SIG-R320-WAVEFORM-VIDEO-NONBAIL`, `ArrangementDetailPanel.tsx` ~l.960);
- (4) the bodies are byte-equal;
- (5) exactly the five literals changed;
- (6) peaks are never mutated in place. `accumulatePeakChunk` writes only into the worker's own `job.peaks` before transfer; the main thread wraps arrays in new Maps and never writes;
- (7) RS8 can fail, and none of its asserts are vacuous;
- (8) strict TS (no `any` / `as` / ts-ignore), semicolons, hook rules, no security impact.

**Low findings, outside my grants, so not fixed and passed to B:**
- **A-R320-REVIEW-EXPORT-RENDER-READ (Low).** `ArrangementExportDialog.tsx` ~l.607–615: the export `onClick` builds `renderWindow` from the render-time selector value (l.91, `isOpen ? state.range : null`). This is a second render-time read besides `applyDetailRange`. The reviewer judged it harmless: the dialog is subscribed while open and exports the range it shows. Options: document it as an intended exception, or switch to `getState()`. `ArrangementExportDialog.tsx` is not in this round's edit grant.
- **A-R320-REVIEW-WAVEFORM-NAME-POSITIVE (Low).** `'ArrangementDetailWaveformInner'` appears only in `PARENT_NAMES` (`clip-gain-pointer-preview.test.tsx` l.224), which is asserted only as 0. A positive count would prove that the name is live. The grant forbids any change other than the five literals, so I made none. B's sketch name-liveness file and C's NAME-LIVE row cover it.

**Architecture note (for B, not applied):**
- `ArrangementDetailPanel` resolves `range` once and passes it through `ArrangementDetailContent` (memo) to the Waveform. So every range-drag move re-renders all of `ArrangementDetailContentInner`, and no test budgets that.
- Proposal: one bounded task adds a `useDetailRange(override)` hook used in the two leaves that need the range (the Waveform overlay and the range inputs). Done = RS8 green, plus a render-budget row showing `ArrangementDetailContentInner` = 0 during a range drag.
- This is the same direction as `A-R319-ARCH-DETAIL-SUBSCRIPTION` (PERF-10).

The six nested store providers follow the existing pattern; keep them.

## 4. Acceptance rows I truly passed (A's rows only)
A-CLAIMS, A-IMPL, A-CLAIMS-AFTER, A-TYPE / A-LINT, A-UNIT (including the perf report test), A-EXPECT, A-MUTANTS, A-PERF, A-REVIEW.

C's rows are not claimed. The gate rows (full vitest, build in `store/`, Biome, `npm run verify`, e2e smoke) were not run by A, per the speed rules.

## 5. Known gaps
- The tree is mid-round (43 status entries) and is not publishable before C PASS and gate 320.
- **Full vitest suite and `npm run verify`: not run** (gate rows). I ran only the A-UNIT set.
- The A-PERF comparison of non-range rows uses C's round-319 baseline JSON, not a fresh baseline build of mine.
- **Doc 230 l.4 carries the post-PASS status (L28).** It is a claim pending C.
- I did not test video selections for the Waveform memo bail. It is a known non-bail and a PERF-10 signal.
- **Browser state:** the two dev-profiler runs used fresh Playwright contexts with no persisted state. They did not read or write `a-browse.json`, which is left untouched from an earlier round.
- **Scratch dirs** `/tmp/a320s` (build plus `vitest.perf-scratch.config.ts`), `/tmp/a320m` (mutants) and `/tmp/a320r` (reverse-applied copies) live outside `store/` and do not survive the job.

## 6. Exact next C checks
1. **SOURCE-SCOPE:**
   - `git status --short | wc -l` = 43, and the new paths beyond the 37 are exactly `perf/budgets.interactions.json`, `THIRD_PARTY_NOTICES.md`, doc 168, doc 230, `render-budget.test.tsx` and `clip-gain-pointer-preview.test.tsx`;
   - compare the three sources and the two test files against `a-round-320/round-320-source.patch.txt` / `b-round-319/sketch-o1.patch.txt`;
   - protected 11/11.
2. **CLAIMS:** `bash b-round-319/claims-320.sh`, compared with `a-round-320/claims-after.txt`.
3. **UNIT and mutants:**
   - A-UNIT's 46 files on C's scratch;
   - the 6 mutants, with `a-round-320/mutants.py <scratch> <name>` usable as is;
   - plus one mutant of C's own. I made no prediction of which row a memo-removal mutant would turn red; that is for C to establish.
4. **NAME-LIVE:** all five `…Inner` names with count > 0 in CP1's setup window and in R11-P1e before its first `clear()`. `ArrangementDetailWaveformInner` especially (A-R320-REVIEW-WAVEFORM-NAME-POSITIVE).
5. **PERF-RANGE (alone):**
   - baseline ≈ 108;
   - A: 9.233 / max 30 / restarts 0 / `drag-range-live` 1 / `failures` [];
   - non-range rows ≤ baseline + N.
6. **PERF-NAMED (dev):**
   - `c319-diag.mjs` with the `…Inner` names, each serve with its own `cacheDir`;
   - expect the steady main commit to be 7 and the layout commit 2, with the lists in §2.2.
7. **PERF-LOAD:** at matched commit counts.
8. **Browser rows at 1440×900 and 1280×720, A vs baseline:**
   - R-WAVEFORM (`d` equal at every zoom step, detail `d` equal), the PeakPath memo risk;
   - R-DETAIL (blur the toggle before Space; the detail playhead moves at both viewports), the Playhead memo risk;
   - R-DRAG (overlay left/width and label), R-ALLTRACKS / R-CLEAR / R-SPACE, R-SPLIT / R-DELETE / R-CUT-TIME, R-LOOP / R-ZOOM / R-EXPORT (byte-identical WAVs), R-BG / R-MARQUEE / R-TRANSPORT, G320-AUTH.
9. **DOC rows:**
   - doc 230 l.4 byte-exact;
   - its headings contain TEMPLATE's 7 in order;
   - it cites only tests that exist (RS1–RS8, R11-P1e, CP1);
   - doc 168 `## მეტრიკები` agrees with the live budgets file.

## 7. Scope
Round 320's A scope is complete. PERF-8a is not done until C PASS and gate 320. I am not marking the backlog item complete.

**Signals for B:**
- A-R320-REVIEW-EXPORT-RENDER-READ (Low);
- A-R320-REVIEW-WAVEFORM-NAME-POSITIVE (Low);
- the architecture note in §3 (`useDetailRange` leaves → PERF-10, together with A-R319-ARCH-DETAIL-SUBSCRIPTION and SIG-R320-WAVEFORM-VIDEO-NONBAIL).
