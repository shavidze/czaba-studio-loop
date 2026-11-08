# Round 405: SYS-R385-LEAF-ACTIONS-CONTEXT stage 2 of 2 — test strength for the actions context and the leaf render counts, comparators closed on mutant evidence (behaviour-preserving), from B's reviewed sketch

**Planned by:** B, at the round 404 → 405 planning, 2026-11-08 (`b-round-404.md`). Advisor used before planning and before hand-off.

## Read first
- `lessons.md` in full. Most relevant: L4, L7, L8, L11, L23, L26, L28, L29, L31, L56, L57, L58, L59, L60.
- This file. Open `tasks/round-404.md` only to look up the stage-1 contract (AC1–AC6, unchanged here except AC4's two lines, see D-29z1400).
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `.claude/prompts/new-test.md`.
- **Claims:** `bash b-round-404/claims-405.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-404/claims-405-planning-output.txt` (stderr empty, `claims-405-planning-stderr.txt`).
  - The same script on a fresh HEAD copy with the patch applied but not committed: `b-round-404/claims-405-sketch-output.txt`. It differs from planning only on the lines listed in `b-round-404/claims-405-planning-vs-sketch.diff`: K1 (the scratch repo's own commit), K2 (6 on the scratch, 7 for A with doc 258), K5, K7, K7b, K8, K9, K10, K11, K12 and K13.

## Baseline: HEAD `dd52107`, clean tree
- Gate 404 published `dd52107` on both remotes [K18]. HEAD is `dd52107…` [K1]. `git status --short --untracked-files=all` is empty [K2]. (`context/head-sha.txt` says `cc5cbc6`; it was written before the gate and is stale.)
- **Frozen:** `b-round-404/r405-frozen-sha256.txt`, **1,292** entries: every tracked file except the 7 grants. `sha256sum -c` gives rc 0 [K3]. All 11 protected files of `b-round-318/protected-sha256.txt` are unchanged and none is granted [K4].
- **Grants:** `b-round-404/grants-405.txt` (7 paths, §4).

## 0. Why this round
- **Round 404 (SYS-R385 stage 1) passed and is published.** C PASS on 8 rows, `browserVerified`/`realVerified` true, gate 404 published `dd52107`.
- **REGRESSION-2026-11-10 is not due.** Today is 2026-11-08 and `regression-last.json` says 2026-11-07 [K19].
- **No Critical or High finding is open.** The open Mediums are root-only, manual or `awaiting_user`; none reproduces in the cloud browser.
- **The D-29z1395 order puts SYS-R385 stage 2 next.** It closes the action-identity and leaf-render-count test class in one owner, and it is the last step before PERF-11c-iii-d/e (VideoDock, Lane).
- **Product promise (L55):** the Studio behaves exactly as before. Only tests get stronger, and one local parameter is renamed. No user-visible change.

## 1. Rulings (B)
### D-29z1400: the dispatched patch (L58: reviewed = dispatched)
- **Patch:** `b-round-404/sketch-405.patch.txt`, sha256 `c64a5589ed319464…` [K15] (v2, after `tech-lead` pass 1; v1 `9158d333…` is described in `sketch-review.md`). It has 6 files, and `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 6 files afterwards.**
- **`app/components/arrangement/ArrangementLibrary.tsx`:** `useArrangementLibraryActions` renames its parameter `workspace` to `actions` [K11]. The other four bundle hooks already use `actions`. Closes A-R404-REVIEW-LIBRARY-PARAM.
- **`actions-context.test.tsx`:**
  - **New AC7** (C-R404-A-AC1-COVERAGE, A-R404-REVIEW-AC2-ALL-KEYS). A second source (`hit`) is added. The actions object is captured *before* the mount-time load flush, then the test checks that it is the same object (`toBe`) after each of these steps, each proven effective:
    - the sources load (`sourceStates` replaced, `song` `ready`);
    - `selectSource('hit')`;
    - a library preview starts (`waitFor` on `libraryPreviewSourceId === 'hit'`) and stops (`null`);
    - Play/Stop (`useArrangementIsPlayingReader`);
    - Master mute;
    - a Master gain step (`previewMasterGain` + `commitMasterGain`, then `gainDb` −6 and `undoLabel` `'Master Volume'`).

    At the end, all 34 action entries are `toBe` the provider value's entry under the same key, and the entry count is pinned to 34.
  - **AC4** (TL-R403-SK2-L1/L2): the redundant `not.toBeNull` goes, `start.markers` is frozen, and `arrangement.markers` is checked `toBe` the frozen array after the track and Master mutes.
  - AC1–AC3, AC5 and AC6 are unchanged. The AC row count goes 6 → 7 [K12].
- **`master-ui.test.tsx` and `fader-pointer-preview.test.tsx`** (B-R374-MASTER-VACUOUS-NAME-COUNTS):
  - The render counts key on `'ArrangementMasterViewInner'` [K7, K7b]. That is the fiber `StudioWorkspace` mounts [K14].
  - master-ui's footer test now clears the counts first [K9]. Without the clear, its positive control was fed by the previous test's `<ArrangementMaster />` mount, because that file never cleared counts.
  - fader-pointer-preview gets **FP0**: every `PARENT_NAMES` entry renders on mount [K13].
- **`render-budget.test.tsx`** (TL-R405-SK-L1): RB-LEAF1's vacuous `'ArrangementMaster'` `toBe(0)` line is removed. Its `ArrangementMasterViewInner` `toBe(0)` and `toBe(1)` checks stay. After the patch, the only `'ArrangementMaster'` literal left in `app`, `perf` and `e2e` is in `meter-ui.test.tsx` [K8]. That file mounts `<ArrangementMaster />` directly, so its count is live (pass 1); it is not part of B-R374.
- **`selection-wrappers-render.test.tsx`** (A-R371-REVIEW-GH5-IDENTITY): the render log records the `group.id` of each `ArrangementGroupHeader` render [K10]. GH5 asserts that the ids equal `[the one muted group's id]`, and that this id is not `g1`.
- **Evidence on the final sketch (L58):**
  - **Mutants:** 14/14 red. The four gap mutants keep AC1/AC2 green, which proves the gap was real. The pristine runs pass before and after on all 5 test files, and the scratch status is 0 (`b-round-404/mutants/summary.txt`, runner `mutants/run.py`) [K17].
  - `tsc`, `lint` and Biome on the 6 files: rc 0 (`b-round-404/sketch-{tsc,lint,biome}.log`).
  - Full vitest (`b-round-404/precheck-full.log`) [K21].
- **Review:** `tech-lead`, two passes (`b-round-404/sketch-review.md`, which opens with the dispatched sha).
  - Pass 1 on v1: "no Medium+", 4 Lows, all folded into v2.
  - Pass 2 on the final sha: "no Medium+ … dispatch sha c64a5589… as is".
- **No perf row is asserted.** The only runtime-visible change is a local parameter name, so render counts cannot move. L58: `record — not run on sketch: no runtime change`. C runs no perf spec this round.

### D-29z1399: comparators closed on mutant evidence (no production change)
- GATE371-L2-COMPARATOR-PER-KEY and GATE375-L2-COMPARATOR-UNSTABLE-PROP are closed as covered, following `b-round-404/consult-tech-lead-stage2.md`.
  - A type rule cannot reject `Object.is`, because it is typed `(any, any) => boolean`.
  - GH2 and RB-LEAF3 already go red on the regressions the findings describe: `Object.is` on `activeCandidateTrackIds` or `overviewClips`, or an inline `actions={{ ... }}` at the two production call sites.
- **They close when C's mutant row (row 5) shows the four comparator mutants red on the tree.**

### D-29z1398: GATE375-L1 goes to Saba
Deleting the test-only wrappers needs the owner's permission (CLAUDE.md). It is asked in `user-review/questions-unused-leaf-wrappers.md` [K16b] as `awaiting_user`. Nothing in this round deletes or moves a wrapper.

### D-29z1400 (doc): doc 258 is the final-stage doc
- Doc 258 l.4 becomes, byte-exact: `**სტატუსი:** Completed (C round 405 PASS)` (L28). Today it reads `In Progress (stage 1 of 2; C round 404 PASS)` [K6].
- A adds a `### ეტაპი 2 (round 405)` sub-section inside `## ტესტირება`. The 7 TEMPLATE headings must stay in order (L26). It contains:
  - the closed ids;
  - the AC7, FP0 and GH5 rows, and the master-ui clear;
  - the comparator closure, with the four mutant ids;
  - the 14-row mutant table copied from `b-round-404/mutants/summary.txt`;
  - the Lows that stay deferred: TL-R403-SK2-L3, TL-R403-SK-L1, GATE404-L2/L3.
- The TODO section marks stage-2 items done and keeps the deferred ones. Doc 258's `შეცვლილი პროექტი` line also names the 6 stage-2 files.
- No other doc changes. The other 7 `In Progress (stage` docs belong to open stages (PERF-14, PERF-DRAG-PREVIEW, PERF-12b, PERF-11c) and are not granted [K6b]. The `pending` form count stays 0 [K6b].

### Ruling lines (L4)
- "Apply the patch byte-for-byte" wins over any style preference of A's reviewer for those 6 files.
- A Medium+ in the patch logic is a STOP (L11), not an edit. A doc finding is fixed in doc 258.
- RB-LEAF1 line removal: "no assertion lost; equal or stronger replacements allowed" wins over "assertions unchanged". The removed count could never be non-zero, and the `ArrangementMasterViewInner` checks stay (pass 2).

### Side effects (L49)
| Effect | Ruling |
|---|---|
| master-ui footer test now clears counts | Intended. It makes the positive control live (MU-405-MU-OLD-NAME red) |
| `ACTION_KEY_COUNT = 34` pin | Intended. Adding an action key without updating AC7 fails loudly (pass 1) |
| AC7 depends on load timing | Ruled: the mount flush uses the same two microtask turns as `mountProbe`, and the preview step uses `waitFor` |
| A future leaf action added to `ArrangementActions` | AC7 turns red until the count and the key are updated. That is the intended pin |

## 2. Reference
Not applicable. This is a test and refactor round with no visible or behavioural change, which the reference-first rule excludes. No screen-budget change. The product-designer, Ableton and YouTube steps do not apply.

## 3. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-404/sketch-405.patch.txt`, then `git apply` the same file. Do not edit the 6 files after that.
3. Edit doc 258 as D-29z1400 (doc) says.
4. Run the §5 checks. Write `a-round-405.md` as you go: changed files, checks with rc and file paths, reviewer findings, and a For B section.

## 4. Grants (`b-round-404/grants-405.txt`)
- **Patch only:**
  - `app/components/arrangement/ArrangementLibrary.tsx`;
  - `app/lib/arrangement/__tests__/{actions-context,fader-pointer-preview,master-ui,render-budget,selection-wrappers-render}.test.tsx`.
- **Doc:** `docs/implementation/2026/quarter-IV/258-sys-arrangement-actions-context.md` (whole file; the l.4 value is fixed above).
- **Nothing else.** No protected, auth, route, config, package, perf or other doc file. At the end, `git status --short --untracked-files=all` shows exactly 7 ` M` lines.

## 5. A's checks (speed rules: the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-404/claims-405.sh` at start | equals `claims-405-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 6 patch files | rc 0 each |
| A3 | `npx vitest run` on `app/lib/arrangement/__tests__/{actions-context,render-budget,selection-wrappers-render,library-preview,master-ui,fader-pointer-preview}.test.tsx` | all pass; report the slowest test against its timeout. L31: none above 50 %, otherwise STOP. Gate 404 slowest: render-budget 2134 ms / 15 000, selection-wrappers SS8a 1601 / 20 000, master-ui footer 1509 / 15 000, fader FP12 1387 / 20 000 |
| A4 | Claims at end | differ from planning only on K2 (7 status lines), K5 (`applies-on-tree no`), K6 (the new l.4), K6b (`in-progress-stage-docs` 8 → 7; `pending-form 0` unchanged) and K7–K13; K7–K13 equal `claims-405-sketch-output.txt`. K3 stays 1,292 rc 0 |
| A5 | `code-reviewer` (7 files) | no Critical/High/Medium in the patch logic; a Medium+ in the patch logic is a STOP (L11); doc findings are fixed in doc 258; a test-strength Medium is reported at the top for B, not edited |

## 6. C's acceptance (`c-round-405.json` with all L57 fields, including `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`; one result per row)
| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | claims equal the planning output except the A4 lines; status = the 7 granted paths; frozen 1,292 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | apply the patch to a `git archive HEAD` scratch and `diff` its 6 files against the working tree: 0 differences. Or: `git diff -- <the 6 files>` equals `sketch-405.patch.txt`, ignoring `index` lines |
| 3 | **AUTH** (browser, 1440×900 and 1280×720) | the demo `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 4 | **STUDIO-SMOKE** (browser, both viewports, working tree) | add a library sound with Enter (the lane `data-clip-count` goes +1); Play then Stop (the clock moves, then stops; a real `AudioContext` is running); Master Mute `aria-pressed` true then false; select a second library sound and start, then stop, its preview; 0 page errors; a screenshot per step. This is a smoke check of the renamed hook's consumer, the Library. Behaviour must be identical to HEAD |
| 5 | **UNIT + MUTANT** | the A3 set passes. Mutants: copy the working tree to `/tmp/c405-scratch` (symlink `node_modules`), `git init && git add -A && git commit`, then run `S=/tmp/c405-scratch OUT=<loop>/c-round-405/mutants python3 -I b-round-404/mutants/run.py`. Never run it with the default `OUT`, which is B's evidence. Pass = 14/14 RED, the gap mutants' must-stay-green lists empty (`red []`), pristine rc 0 before and after on all 5 files, scratch status 0 lines. This row closes GATE371-L2 and GATE375-L2 (D-29z1399) |
| 6 | **DOCS** | doc 258: l.4 byte-exact `**სტატუსი:** Completed (C round 405 PASS)`; the 7 TEMPLATE headings in order; the stage-2 mutant table equals `b-round-404/mutants/summary.txt`; AC7, FP0 and GH5 are named and each exists in its test file (L26); `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits; no other doc changed |
| 7 | **SOURCE-SCOPE end + L57** | as row 1, at the end; claims at end equal claims at start; `tools/l57-check.py` OK |
| gate | full vitest, typecheck, build, Biome, verify | not run by C (gate rows) |

**Neighbouring behaviour that could break:** only test outcomes: every row in the 5 test files, which row 5 runs as pristine. The only source change is the Library actions hook (row 4).

## 7. For C: the mutants (`b-round-404/mutants/run.py`)
| Mutant | Site | Expected red | Must stay green |
|---|---|---|---|
| MU-405-SELECTED-DEP | `selectedSourceId` in the `toggleMasterMute` deps | AC7 | AC1 |
| MU-405-SOURCESTATES-DEP | `sourceStates` in the `undo` deps | AC7 | AC1 |
| MU-405-PREVIEW-DEP | `libraryPreviewSourceId` in the `toggleMasterMute` deps | AC7 | AC1 |
| MU-405-SEEKTO-WRAP | `seekTo: (time) => seekTo(time)` in the actions object | AC7 | AC2 |
| MU-405-MASTER-COMMIT-SKIP | `commitMasterGain` skips its history entry | AC7 | — |
| MU-405-MARKERS-INPLACE | `setTrackMix` writes `markers` in place (`push()`) | AC4 | — |
| MU-405-MARKERS-COPY | `setTrackMix` copies `markers` | AC4 | — |
| MU-405-FP-OLD-NAME | `PARENT_NAMES` back to `'ArrangementMaster'` | FP0 | — |
| MU-405-MU-OLD-NAME | master-ui footer positive control back to `'ArrangementMaster'` | footer test | — |
| MU-405-GH5-RECORDER | GH5 expects `['g1']` (recorder liveness) | GH5 | — |
| MU-405-GH2-CANDIDATES-OBJECTIS | `activeCandidateTrackIds: Object.is` | GH2 | — |
| MU-405-GH2-OVERVIEW-OBJECTIS | `overviewClips: Object.is` | GH2 | — |
| MU-405-RBLEAF3-INLINE-WORKSPACE | `actions={{ ...libraryActions }}` in StudioWorkspace | RB-LEAF3 | — |
| MU-405-RBLEAF3-INLINE-LIBRARY | `actions={{ ...actions }}` in ArrangementLibrary | RB-LEAF3 | — |

**Equivalent and recorded (not rows):** GH5's new id assertion has no source mutant that turns it red while the old `aria-pressed` and count asserts stay green. A wrong header render would also leave the clicked header's `aria-pressed` stale. MU-405-GH5-RECORDER proves the recorder is live.
