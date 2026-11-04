# Round 339: PERF-DRAG-PREVIEW stage c4-i. A two-clip group move row in the interactions perf harness, recorded at HEAD

**Planned by:** B, at the round 338 → 339 planning, 2026-11-04.

**Decisions** (all in `backlog.json` v297 → v298 `decisions_log_b`; D-29z1041…D-29z1048):
- **D-29z1041: round 338 closed as PASS, from C's evidence.** `c-round-338.json` PASS, `browserVerified`/`realVerified` true, 10 rows, 0 bugs. Gate 338 `published` `662ed42` on both remotes [K1]. **The baseline is `662ed42`.** Stage c3-ii → done.
- **D-29z1042: the round-338 notes.**
  - A's reviewer Lows → `deferred_low_polish`: A-R338-REVIEW-CL2-SHARED-EMPTY, A-R338-REVIEW-IDENTITY-TRIM-TEST, A-R338-REVIEW-STORE-NAMES.
  - Gate reviewer #1 (the identity branch assumes no other unpublished writer) → GATE338-S1-IDENTITY-INVARIANT, open, carried as a ruling line into c4-ii. #2 → deferred GATE338-S2-PROBE-HELPER. **#3 (the stale "Record until C measures it (L58)." in the two `drag-lane-live` notes) is fixed in this round** (GATE338-S3-STALE-LIVE-NOTE; the budget file is granted) [K7]. #4/#5 → info.
  - The Architecture note → signal ARCH-R338-STORES-PROVIDER, triggered by an 11th store. Not scheduled.
  - A's K23 note → INFO-B337-ACLAIMS-K23 (a B planning gap).
- **D-29z1043: no regression round yet.** `regression-last.json` is 2026-11-02 [K9], and this planning is 2026-11-04 (2 days). The first round planned on or after 2026-11-05 is REGRESSION-ROUND-2026-11-05.
- **D-29z1044: c4 splits into c4-i and c4-ii, as c3 did (L37, L58).** The harness has no multi-selection move scenario [K4], so no c4 row can be asserted yet. **c4-i (this round)** adds the group rows and records HEAD's values. **c4-ii** moves the group preview off the provider history and is measured against c4-i.
- **D-29z1045: c4-ii inputs,** recorded and not done here: the collapsed track-group overview reader [K6], the blocked-move status [K5], GATE338-S1, and the group release-restarts value.
- **D-29z1046: the sketch review** (`b-round-338/sketch-review.md`). `tech-lead` found one Medium (TL-1), fixed in the sketch; the rest are Low/Info and applied.
- **D-29z1047: budgets.** 26 new rows. 24 are `record`; the two liveness rows are `assert == 1`. See §1.2.
- **D-29z1048: this task.**

**Read first:**
- `lessons.md`: L10, L11, L29, L30, L34, L37, L38, L56, L57, L58.
- Primitives: `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (test creation), `GEORGIAN_DOCS.md` (docs).
- This is a test-and-docs change. No component, context, style or audio code is touched.

**L29 note:** untagged code text below is an expected value, a new name, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first / product-designer / screen budget / YouTube request:** not applicable. This round adds a measurement; nothing visible or audible changes.

## Baseline
- HEAD is `662ed42` (gate 338, published), with a clean tree [K2]. Protected files: 11/11 OK [K8]. No dependency change.
- **Perf oracle:** `c-round-338/perf-results/latest-interactions.json`: 193 rows, `complete` true, 0 failures, 139 non-wallclock rows [K10].
- The budget file has 193 rows, 26 lane rows, 0 group rows, 43 asserted rows, and 2 stale L58 sentences [K7].

## 0. Why this round, and B's evidence

### 0.1 Premise at HEAD (L37)
B's probe `b-round-338/group-probe.mjs` ran on the root dev server (:5173 = HEAD) at 1440×900 and 1280×720 (`b-round-338/probe/head-1440.json`, `head-1280.json`) [K14].
- **Setup:** Add a clip, click its name bar, Ctrl+D (a copy starts at the clip's end), then Ctrl+click the first clip. A press on a clip that is part of a ≥ 2 selection starts a group move [K5].
- **4 same-lane group moves:** 106, 104, 104, 104 components per commit. `ArrangementProvider` and `StudioWorkspace` render on every move, and provider hook 0 (history) changes. The group branch calls `previewArrangement(next)` on every move [K5]. A single clip's same-lane move costs 19 (round 335).
- **Cross-lane group moves:** 5 + 1 per move. The c3-ii store already took the ghosts; the 1 is the provider fiber (hook 0, `previewArrangement(gesture.before)`, SIG-R338-GROUP-CROSS-PREVIEW) [K5].
- **Release:** 89 (hooks 0 and 16). Undo reads "Undo: Move (2)".
- **Blocked group move** (the group at start 0, dragged left): 1 component per move (provider fiber only) [K14].
- Both viewports gave the same counts.

**Conclusion:** a group move costs about 5× a single-clip move, and the provider and the whole workspace re-render on every move. The harness cannot see this today: no row or function names a group drag [K4].

### 0.2 What the sketch adds (`perf/studio-lab-interactions.perf.spec.ts`)
B's sketch is on a `git archive` of `662ed42` in `/home/runner/b338-scratch/sc`, built by `apply-sketch.py`, `apply-sketch-v2.py` (the review fixes) and `apply-sketch-v3.py` (quotes), with budgets by `apply-budgets.py <tree> assert`. The final diffs are `b-round-338/sketch/spec.patch.txt` and `budgets.patch.txt`; both pass `git apply --check` on HEAD.
1. **Sequence:** 4 new `interactionSequence` entries after "Space -> stopped": group setup, group drag stopped, group drag playing, group teardown.
2. **`setupGroupClips(page, clip, result)`**, after the `pause` step in every pass and at both CPU rates [K3]:
   - read the Undo title and the clip state;
   - click the clip's name bar, blur, Ctrl+D, expect 2 audio clips, wait for quiet;
   - find the copy's `data-clip-id`, then Ctrl+click the first clip's name bar (Control released in `finally`).
   - A null clip id or a missing copy is a problem, and the function returns `null`.
3. **`measureGroupDrag(page, state, group, result)`** follows `measureLaneDrag` [K3]: the same three segments (own lane, the next lane, own lane; 10 steps of 40 px each, 1-step lane changes), the same whole, cross and lane windows, and the same row metrics. Added reads:
   - after the first own-lane segment, a double-rAF settle and the copy's clip state;
   - an entry ghost read right after the step into the next lane.
4. **Rows** (`base = interact.drag.group.<state>`, through `rateRowId`): `move-components-per-move`, `move-components-max`, `release-commits`, `cross-components-per-move` (wallclock), `lane-components-per-move` (wallclock), and for playing `move-restarts` and `release-restarts`. No row uses the metric `commits-per-move` (DC-KINDS) [K16].
5. **Liveness `interact.harness.drag-group-live`** through `setLive`, after the reset. It is 1 only when all of these hold:
   - (f) the copy's `data-clip-start` moved at the own-lane read (the copy moves with the pressed clip, so this is a group move);
   - (a) the next lane holds exactly 2 non-blocked lane-move ghosts at the cross read;
   - (e) the first target-lane ghost start advances from the entry read to the cross read;
   - (b) the document holds no lane-move ghost at the back read;
   - (c) after release both clips are on their own lane and moved right by the same delta (±0.0015 s);
   - (d) after the Ctrl+Z reset both clip states equal their start states, each on its own lane.

   Each failed letter pushes a problem, and `buildPerfReport` copies problems into `failures` [K16].
6. **Run order** after `pause`: setup; drag stopped; `setPlayback(true)` + `waitForPlaybackSettled`; drag playing (Home first, as `measureLaneDrag`); `setPlayback(false)`; **teardown** (Ctrl+Z, expect 1 clip, the clip state and Undo title equal the pre-setup values, else a problem). If setup returned `null`, the live row is set 0 and a left-over copy is removed with Ctrl+Z.
7. `DragName`, `dragNames`, `measureDrag`, `measureLaneDrag` and every existing row id are unchanged [K3].

### 0.3 B's sketch evidence (L58)
| Check | Result | File [K#] |
|---|---|---|
| typecheck | rc 0 | `b-round-338/sketch-typecheck.log` |
| Biome on `perf/**` | vacuous by config (L30). Stdin format check equal on HEAD and on the sketch; stdin lint: no diagnostics on either | `b-round-338/biome-sketch-stdin.log` [K23] |
| perf-lib report test (scratch config, GATE304-M1) | 34/34 | `b-round-338/perf-lib-report-sketch.log` [K17] |
| Perf, sketch v1 | rc 0, 219 rows, `failures` [], 139 EQUAL, 0 DIFF, 18 NEW, 45/45 asserted pass | `perf-sketch-v1.log`, `perf-rowcmp-sketch-v1-vs-c338.txt` |
| **Perf, final sketch (v3)** | rc 0, 219 rows, `complete` true, `failures` []; **139/139 pre-existing non-wallclock rows EQUAL, 0 DIFF, 18 NEW**; 26 ids added, 0 removed; 45/45 asserted pass. Every new row is the same in all 3 passes at 1× and 6×: group `move-components-per-move` **74.781** (stopped and playing; the lane drag is 24.906), `move-components-max` 106, `release-commits` 1, `lane-components-per-move` 110.45, `cross-components-per-move` 16.727, `move-restarts` 0, `release-restarts` 2, `drag-group-live` 1 | `perf-sketch.log`, `perf-sketch-results/latest-interactions.json`, `perf-rowcmp-sketch-vs-c338.txt`, `rowids-added-sketch-vs-c338.txt` [K11, K12, K22] |
| **Perf mutant MU-GROUP-SINGLE** on the final sketch (the Ctrl+click skipped, so the press drags one clip) | rc 1 (the assert fails, as intended); `drag-group-live` and `.6x` **0** in all 3 passes; 50 failures: (f), (a), (b) and (c) 12 each (2 states × 6 passes), plus the 2 assert failures; (d), (e) and the teardown do not fail (the teardown still ends at 1 clip) | `perf-mutant-group-single.patch.txt`, `perf-mutant-group-single.log`, `perf-mutant-group-single/latest-interactions.json` [K13] |

### 0.4 Consults (D-29z1046)
`tech-lead` reviewed sketch v1, standing in for `code-reviewer`, which is not on this phase's consult list. Full table in `b-round-338/sketch-review.md`.
- **TL-1 (Medium, fixed in v2):** (a) was `< 2`; it is `!== 2`.
- **TL-2…TL-6 (Low/Info, applied in v2):** the copy's lane in (d); the entry read and (e); the null clip id; `try/finally` on Control and the failed-setup path; the frame settle before the copy read.
- **TL-7 (task text):** ruled in §2.1 (format check, docs, mutant note).
- `performance-optimizer` was not consulted: every component row is `record`. c4-ii consults it.

**B's side observation (info, not a finding of this round):** with another clip starting at the pressed clip's end, a single-clip drag that comes back to a blocked own-lane position keeps the last valid lane target, and release moves the clip to the next lane (`b-round-338/probe/back-lane-1440-sel1.json` vs `-sel0.json`). This is the existing "a blocked position keeps the last valid placement" rule, recorded as INFO-B338-BLOCKED-BACK-KEEPS-LANE-TARGET. The group scenario is not affected: the copy is in the group.

## 1. What A changes (ownership)
**Fastest route:**
1. Apply the two patches: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-338/sketch/spec.patch.txt /home/runner/czaba-project/tmp/studio-real-loop/b-round-338/sketch/budgets.patch.txt`.
2. Read every hunk against §0.2 and §1.2.
3. Edit docs 232 and 168 by hand (§1.3).

A may write equal or stronger code than the sketch. A must not weaken any liveness condition, and every value in §2 must hold.

**Granted files (exactly these 4):**

| File | What |
|---|---|
| `perf/studio-lab-interactions.perf.spec.ts` | §0.2 only |
| `perf/budgets.interactions.json` | §1.2 only |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | whole (L34) |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | `### Pass-ის თანმიმდევრობა`, `### Liveness-ის წესები` and `## მეტრიკები` only |

Nothing else changes: no `app/**`, no `perf/lib/**`, no other perf spec or budget file, no config, `package.json`, lock file or protected file [K15].

### 1.1 Ruling lines (L4)
- `perf/budgets.interactions.json`: §1.2 wins over "the 193 existing rows are byte-equal". Exactly two existing rows change, and only their `note`.
- `interact.harness.drag-group-live` and `.6x`: `assert == 1` (§1.2) wins over the c3-i precedent of `record` liveness rows. B ran the spec on the sketch and the mutant turned it 0 (L58).
- Deterministic group rows: if one varies across the 3 passes of one rate in A's run, A changes that row's `kind` to `wallclock` and reports the values per pass (pre-ruled, L10). This applies to the 24 `record` rows only; it is not a STOP. A liveness row that is not 1 in every pass is a STOP.

### 1.2 Budgets (D-29z1047)
- Add exactly 26 rows, right after `interact.harness.drag-lane-live.6x`. Their shapes are the lane rows' with `interact.drag.lane.` → `interact.drag.group.` and `drag-lane-live` → `drag-group-live`; owner `PERF-DRAG-PREVIEW-c4-i`:
  - stopped: 5 rows; playing: 7 rows; `interact.harness.drag-group-live`; and the `.6x` copy of each.
  - 24 rows are `mode: "record"`, `budget: null`.
  - `interact.harness.drag-group-live` and `.6x` are `assert` `{ "op": "==", "value": 1 }`. Their note lists (f), (a), (e), (b), (c), (d), the failed-setup 0 and the mutant.
- In the two `interact.harness.drag-lane-live` notes, delete the sentence "Record until C measures it (L58). " (gate 338 #3).
- The other 191 existing rows are byte-equal; the file keeps the 2-space JSON layout and its final newline.
- Result: 219 rows, 26 group rows, 2 asserted group rows, 45 asserted rows, 0 stale sentences [K7].

### 1.3 Docs
**Doc 232, whole:**
- l.1: append `, ეტაპი c4-i — group move-ის perf row` inside the parentheses.
- l.4: exactly `**სტატუსი:** In Progress (stage c4-i of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5; C round 339 PASS)` (L28).
- A new section `### ეტაპი c4-i: ორი მონიშნული კლიპის (group) move-ის perf row (round 339, D-29z1044)` after the c3-ii section. In Georgian: the HEAD premise of §0.1 with its numbers; the setup, the gesture and its windows; the 26 rows, why 24 are `record` and why liveness is asserted (sketch + MU-GROUP-SINGLE); and that c4-ii moves the group preview off history and is measured against these rows.
- One entry each under files, testing and problems (problem: a group move needs a second selected clip, so the scenario creates one with Ctrl+D and removes it with Ctrl+Z; solution: the teardown checks and the 139 EQUAL rows).
- TODO: replace the c4 line with c4-ii and its inputs: SIG-R338-GROUP-CROSS-PREVIEW, the collapsed-group overview reader, the blocked-move status, GATE338-S1-IDENTITY-INVARIANT and the group release-restarts value.
- The 7 `## ` headings stay in TEMPLATE order [K19].

**Doc 168 (L34):** the three granted sections must match the live spec and budgets after the edit:
- `### Pass-ის თანმიმდევრობა`: the group block after step 8 (Space → stopped).
- `### Liveness-ის წესები`: one row for `interact.harness.drag-group-live` with (f), (a), (e), (b), (c), (d); and the `drag-lane-live` row says it is `assert == 1` since round 338 (it still says `record`).
- `## მეტრიკები`: a short paragraph on the `interact.drag.group.*` rows (kinds, windows, 24 record, liveness assert, owner).

No other section of doc 168 changes.

## 2. Acceptance

### 2.1 A rows (A writes `a-round-339.md` and `a-round-339/` as it goes)
| Row | Command | Expected |
|---|---|---|
| A-CLAIMS | `bash b-round-338/claims-339.sh > a-round-339/claims-pre.txt` from the loop root, before any edit; again at the end | Pre equals `b-round-338/claims-339-planning-output.txt`. Final equals `b-round-338/claims-339-sketch-output.txt` except **K2** (A's tree: `662ed42 4`) and **K19** (A's doc edits: the l.4 token `stage c3-ii of` → `stage c4-i of`, the `### ეტაპი c4-` count 0 → 1, doc 168 `drag-group-live` count 0 → ≥ 1). Any other difference is a STOP |
| A-TYPE | `npm run typecheck` (covers `perf/`; Biome does not, L30) | rc 0 |
| A-FORMAT | From `store/`: `npx biome format --stdin-file-path=app/x.perf.spec.ts < perf/studio-lab-interactions.perf.spec.ts \| cmp - perf/studio-lab-interactions.perf.spec.ts` | equal (K23 `format-equal`) |
| A-LINT | `npm run lint` | rc 0; warnings ≤ gate 338's count (record it) |
| A-PERF | Production perf **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-338/perf-results/latest-interactions.json <A's result>` | rc 0; `complete` true; `failures` []; 219 rows; **45/45 asserted pass**; 139 EQUAL, 0 DIFF, 18 NEW; the 18 non-wallclock NEW rows equal B's values in §0.3 (`move-components-per-move` 74.781, `move-components-max` 106, `release-commits` 1, `move-restarts` 0, `release-restarts` 2, liveness 1); the 8 wallclock group rows (`cross-`/`lane-components-per-move` and `.6x`) are reported, not compared (L37); `drag-group-live` and `.6x` 1 in every pass. Save under `a-round-339/` |
| A-PREMISE | From A's results | **STOP row:** at 1× and 6×, stopped and playing, `interact.drag.group.<state>.move-components-per-move` > `interact.drag.lane.<state>.move-components-per-move`. Report all values |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs perf/lib/report.test.ts` (scratch config, GATE304-M1) | 34/34 |
| A-MUTANT | On a scratch copy of A's tree, never `store/`: `python3 -I b-round-338/make-mutant.py <copy>`, then the spec alone | as §0.3: `drag-group-live` and `.6x` 0 in every pass; problems name (f), (a), (b) and (c); no (d), (e) or teardown problem. Copy deleted after |
| A-SCOPE | `git status --short`, `git diff --stat` | the 4 files of §1 only, 0 untracked; `app/` and `perf/lib/` clean [K15]; protected 11 OK |
| A-REVIEW | the real `code-reviewer` subagent on the 4 files (3+ files rule) | no Medium+ open; code changed after the review goes back to it (L11); Architecture notes go to B |

A does not run the full vitest suite or `npm run verify` (gate rows).

### 2.2 C rows (C writes `c-round-339.md`, `c-round-339.json` and `c-round-339/` as it goes)
C writes **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding;
- `assertsSpecified` = 5: PERF (the 2 liveness asserts and the 43 existing asserts counted as one row), PREMISE, MUTANT, GROUP-NAMES, G339-AUTH;
- `mutantsRecorded` = MU-GROUP-SINGLE and C's own;
- `mutantRedOnSketch`: `b-round-338/perf-mutant-group-single/latest-interactions.json`;
- `mutantRedOnTree`: from C's own runs;
- `gateChecksNamed` = full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke. `gateChecksRunOnSketch`: typecheck (`b-round-338/sketch-typecheck.log`);
- `chainHeadGateRunGreen` from `gates/gate-round-338.json`;
- `affectedChecksNamed`: the interactions perf spec, rowcmp/rowids, the perf-lib report test, the group probe. `affectedChecksRunOnSketch`: all four (§0.1, §0.3).

| Row | How | Expected |
|---|---|---|
| CLAIMS | `bash b-round-338/claims-339.sh`, first (L56), and at the end | equal to A-CLAIMS final |
| SOURCE-SCOPE | `git status`, `git diff --stat`, protected sha | the 4 files only; `git apply -R --check` of the two B patches passes, except hunks A strengthened (name each); no diff in `app/` or `perf/lib/` [K15]; `DragName`/`dragNames` unchanged [K3]; the 191 untouched budget rows byte-equal by id against `git show HEAD:perf/budgets.interactions.json` |
| PERF | Production build of A's tree, spec alone, after a browser warm-up (L38), then `perf-rowcmp.py` vs `c-round-338/perf-results/latest-interactions.json` and the `rowids-added` check of §0.3 | as A-PERF: the 18 non-wallclock NEW rows equal §0.3; the 8 wallclock group rows are recorded, not compared. Any other DIFF is a finding, with its number |
| PREMISE | from C's results | as A-PREMISE; record every new row's 3 pass values in `c-round-339/group-rows.txt` (c4-ii's baseline) |
| MUTANT | MU-GROUP-SINGLE on C's scratch, plus one mutant of C's own, predicted before it runs and failing a different letter (e.g. the copy reset check removed from (d), or the entry read moved after the cross moves → (e)) | both make `drag-group-live` 0 with a problem naming the predicted letter; files restored (`cmp`) |
| **GROUP-NAMES (browser, dev)** | `node b-round-338/group-probe.mjs <base> <out> <w> <h> 0` on A's tree (:5173) at 1440×900 and 1280×720 | equals `b-round-338/probe/head-<w>.json` (B's HEAD runs were identical) in: per-commit `rendered`, `providerRendered`, `changed`, `workspaceRendered` for every recorded phase; the `before`, `midSame`, `midCross`, `afterRelease`, `afterUndo`, `midBlocked` and `afterBlocked` clip states and ghosts; `undoTitle` and `undoTitleAfterBlocked`; `pageErrors` []. `top` is informational. A cold-start timeout is environment-invalid: keep it and replace it once (L38) |
| HARNESS-READ | read the new functions against §0.2 | setup, gesture, windows (lane from `firstMove`), the six liveness letters, `setLive` after the reset, the teardown checks, the failed-setup path; the other drags' code paths unchanged in the diff |
| PERF-LIB | the A-PERF-LIB command | 34/34; DC-KINDS green |
| G339-AUTH | as G338-AUTH (`c-round-338/g338-auth.cjs`), fresh anonymous contexts, both viewports | `/studio-lab`: anonymous workspace and demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401 |
| DOCS | read doc 232 and doc 168 | §1.3: l.1, l.4 byte-exact; the c4-i section with the §0.1 numbers; files, testing, problems and TODO entries; 7 `## ` headings in TEMPLATE order; doc 168's three sections match the live spec and budgets (L34); `git diff` of doc 168 has hunks only inside them |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** PERF, GROUP-NAMES and G339-AUTH run here; none needs the backend.
**Ableton conformance:** not applicable (a measurement; behaviour unchanged).

## 3. Neighbouring behaviour that could break
- **Pre-existing perf rows**, through state the group block leaves (a second clip, the selection, the redo entry, playback, Home). PERF requires all 139 EQUAL; the teardown checks the clip count, state and Undo title.
- **The 1× block** (30 clips, zoom paths, select same lane) runs after the teardown. Its rows are among the 139.
- **The harness's own vacuity:** a press that drags one clip would record single-clip numbers. (f), (a), (c) and MU-GROUP-SINGLE cover this.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside K2/K19.
- A patch does not apply, or a change is needed outside the 4 files (L22: STOP with the diff).
- Any pre-existing row DIFF, a failed assert, or a liveness row not 1 in every pass.
- A-PREMISE fails.
- The mutant does not turn the live row 0.
- A determinism failure other than the pre-ruled kind change.

## 5. Not in scope
- **c4-ii:** routing the group preview to the preview store; the collapsed-group overview reader; the blocked-move status; GATE338-S1; any group row → assert; jsdom DP rows for the group move.
- **Later:** c5 (video clips), the trim/move conversions, SIG-R338-GHOST-LAYER, Escape-to-cancel (ESCAPE-CANCEL-GESTURE), INFO-B338-BLOCKED-BACK-KEEPS-LANE-TARGET.
- **Deferred Lows:** A-R338-REVIEW-*, GATE338-S2-PROBE-HELPER, A-R337-REVIEW-HELPER-NAMES.
- **Root only:** `vitest.config.ts` (GATE304-M1); commits and pushes.

## 6. Deliverables
- A: the 4 files; `a-round-339.md` with the A rows; `a-round-339/` logs.
- C: `c-round-339.md`, `c-round-339.json`, `c-round-339/`.

## 7. Claims
Run `bash b-round-338/claims-339.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). Expected output at HEAD: `b-round-338/claims-339-planning-output.txt`; on B's final sketch: `b-round-338/claims-339-sketch-output.txt`.
- **K1:** gate 338 `published` `662ed42`. **K2:** HEAD's short hash and the `git status` entry count.
- **K3:** in the spec, one each: the `DragName` line, the `dragNames` array, `laneSegmentSteps = 10`, `laneSegmentPx = 40`, `measureLaneDrag`, `step = 'pause'`.
- **K4 (SWEEP, L49):** files under `app/`, `perf/` and `e2e/` naming `measureGroupDrag`, `setupGroupClips`, `teardownGroupClips`, `drag-group-live` or `interact.drag.group` (HEAD 0; sketch the spec and the budget file).
- **K5:** in `ArrangementClip.tsx`: the `groupIds` selection rule, the Ctrl/Shift `toggleClipSelection` call, `previewArrangement(gesture.before);` (2), the group `moveClips` line, `previewArrangement(next);`, and `setStatus(GROUP_MOVE_BLOCKED_MESSAGE);`.
- **K6:** the collapsed-group overview reader `trackGroupOverviewClips(arrangement, row.id)` in `StudioWorkspace.tsx` (1).
- **K7:** budget rows, lane rows, group rows, asserted group rows, all asserted rows, stale L58 sentences (HEAD `193 26 0 0 43 2`; sketch `219 26 26 2 45 0`).
- **K8:** protected sha, 11 OK. **K9:** the `regression-last` date.
- **K10:** the perf oracle (`c-round-338`). **K11:** B's final sketch run: the new rows' samples. **K12:** its rowcmp counts and asserted pass. **K13:** the mutant run: failures, the live rows' samples, the (f)/(a)/(b)/(c) problem counts, and the (d)/(e)/teardown count (0).
- **K14:** the HEAD probe's per-commit counts at 1440 and 1280.
- **K15:** `git diff --stat HEAD -- app perf/lib` line count (0).
- **K16:** `perf/lib/report.ts` copies problems into failures (1); DC-KINDS regex (1) and `toHaveLength(16)` (1) in `perf/lib/report.test.ts`.
- **K17:** the perf-lib report test on the sketch: 34 passed.
- **K18 (SWEEP):** files referencing `budgets.interactions` in `app/`, `perf/`, `e2e/` (the spec, `perf/lib/report.test.ts`).
- **K19:** the stage token of doc 232 l.4 (`stage c3-ii of` at HEAD), its `## ` count, its `### ეტაპი c4-` count; doc 168 `## ` count, `drag-group-live` hits, stale-sentence hits.
- **K20:** the `previewClipGeometry` identity branch (1) and the `previewGeometry` definition (1) (context for GATE338-S1; unchanged).
- **K21:** every cited artifact exists (L56). **K22:** row ids added/removed by the sketch. **K23:** the stdin format check of the spec.

## 8. Root notes
- **Commit readiness:** after C PASS, the 4 files of §1 are one test-and-docs change; the gate's full verify and review apply.
- **Still open for root:** checkpoint D-29z915 (SIG-R331/SIG-R332, deadline the close of c5); ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1); R80-RECORDINGS-FIELD-BORDERS (`retro-336.md` §12.4).
- **Next:** the first planning on or after 2026-11-05 is REGRESSION-ROUND-2026-11-05 (D-29z1043). Then c4-ii, c5, the conversions, PERF-9…15 and the rest of the queue.
