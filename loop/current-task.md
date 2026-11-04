# Round 329: PERF-DRAG-PREVIEW stage c1. A move that pushes the project end re-renders only what shows the end (+ C-R328-01 test row)

**Planned by:** B, at the round 328 → 329 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v288; D-29z945…D-29z953):
- **D-29z945: round 328 closed as PASS.** C round 328: PASS, `browserVerified`/`realVerified` true, 15 rows passed. C-R327-01 and C-R327-02 are closed by SETTLE-REMOUNT at both viewports, with a positive control. Gate 328 published `dae81bf` on both remotes [K1]. Stage b is done (published). The fade per-move value stays 21.633 against the item target ≤ 15 (D-29z935 carries).
- **D-29z946: C-R328-01 (Low) is fixed here as a test row (DP20).** The round already owns `drag-preview-render.test.tsx` and the cost is one row. No context code changes.
- **D-29z947: C-R328-02 (Low)** → `deferred_low_polish`, with its numbers (fade stopped `release-commits` 1 at round 325 → 3; playing 1 → 2).
- **D-29z948: A-R328-REVIEW-SAME-TEXT-RACE** (Low, hypothesis, not reproduced) → open finding; its browser probe goes into the next REGRESSION round.
- **D-29z949:** A's architecture note → `b-round-328-checkpoint-addendum.md` (D-29z915). Its trigger is not met: this round changes no line of the status-preview block.
- **D-29z950: stage c is split** (order from the `performance-optimizer` consult; `tech-lead` preferred the group move first, see `b-round-328.md` §5):
  - c1 = the project-end path (this round);
  - c2 = the shared in-second remainder (~23 per move for trim, fade and move: the detail panel, the selected-clip readout and the overview select only the fields they show; it absorbs SIG-R326-READOUT-PRIMITIVE and SIG-R326-DETAIL-IGNORES-FADE);
  - c3 = cross-lane ghosts (`clipLaneDrag` provider state → a store; a same-lane → cross-lane → same-lane row);
  - c4 = the group move (including the collapsed-group overview reader and the blocked-move status);
  - c5 = video clips;
  - then the record → assert conversions of the trim/move rows, each only after a sketch perf run and a red perf mutant (L58).
- **D-29z951:** this task.
- **D-29z953: gate 328's review** (`gates/round-328/review.md`, 8/10, no Critical or Medium) is triaged. GATE328-S1 (Low, a browser-only lane-ordering case), GATE328-S2 and GATE328-S3 → `deferred_low_polish`; S1 also gets a REGRESSION probe. S4 is a signal. The Architecture note GATE328-ARCH-STATUS-STORE is filed in the checkpoint addendum. None of them changes this round.
- **D-29z952: the next round** is REGRESSION if it is planned on or after 2026-11-05 (`regression-last` is 2026-11-02 [K9]). Otherwise it is stage c2a.

**Read first:** `lessons.md`: L4, L11, L23, L29, L31, L34, L37, L56, L58.

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§7).

## Baseline
- HEAD is `dae81bf` with a clean tree [K2]. Protected files: 11/11 OK [K8]. No dependency change.

## 0. Why this round, and B's evidence
- **The premise, re-measured at HEAD** (L37). C's names probe (`b-round-328/names-probe.mjs`, a copy of `c-round-324/probe/c324-names-probe.mjs`) at `dae81bf`, 1440×900: an audio clip header move renders **105–107 components per move** (`names-head-dae81bf.json`, `move-moves`), and the provider does not render. Trim renders 23 and fade 22.
  - The cause: `StudioWorkspace` subscribes to the raw preview project end [K3], which changes on every move that pushes the end. It feeds `timelineSeconds` (ceil of end + 30 s or the viewport) and the overview `extent` [K4]. `ArrangementTransport` subscribes to the same value for its project-end readout [K5].
  - **End-bound, not viewport-bound** (`b-round-328/end-bound-probe.mjs` → `end-bound-head-dae81bf.json`): with the harness gesture (60 steps, +120 px, 40 px/s), the end changes on 60 of 61 samples, `data-extent` on 60, and the ruler width only 3 times (5280 → 5400 px), at both viewports.
- **B's sketch** (`b-round-328/sketch/sketch.patch.txt`; scratch `/home/runner/b328-scratch`; `git apply --check` is clean on `dae81bf`). Three files: `StudioWorkspace.tsx`, `ArrangementTransport.tsx` and `drag-preview-render.test.tsx`.
  - **Browser, names probe on the sketch** (dev server :5198 with its own `cacheDir`; `names-sketch-final.json`): move commits **[23, 2, 23, 2, 108, 2, 23, 2]**. The in-second commits now equal trim. The one 108 is the move that widens the ruler. Fade and trim are unchanged. The first sketch run timed out on the cold compile; it was environment-invalid and replaced (`names-sketch-attempts.txt`).
  - **Browser, end probe on the sketch** (`end-bound-sketch-final.json`): every sample (end text, ruler width, scroll width, clip start and width, overview `data-extent` and `aria-valuetext`) and the state after release **equal HEAD** at 1440×900 and 1280×720 (`head-vs-sketch.txt`).
  - **Browser, C's stage-a rows** (`b-round-328/rows.mjs`, a copy of `c-round-325/c325-rows.mjs` whose output dir is `ROWS_DIR`, default `b-round-328/rows/`): D-TRIM, D-MOVE, D-MIXED, D-ABORT, D-UNDO, D-NOFLASH, D-OLDPATH, D-LOOP and EXPORT, HEAD :5173 vs sketch :5198, both viewports: **0 differences** (`rows/rows-diff.txt`; B's files are `rows-head-b.json` and `rows-sketch-b.json`). This ran before the two tech-lead tweaks: the props alias is erased at compile time, and the extra DP22 assert is test-only, so the runtime is the same. The names and end probes were re-run on the final sketch.
  - **Full vitest on the sketch: 3562/3562** (243 files), typecheck rc 0 [K16]. Biome is clean on the three files.
  - **HEAD parity:** DP20 passes on a `dae81bf` copy; DP21 and DP22 fail there (the fix's red proof) [K18].
  - **jsdom mutants** (`b-round-328/run-mutants.sh`; `mutants-summary.txt`) [K17], every one red:
    - MU-WORKSPACE-RAW-END (the selector without `Math.ceil`) → DP21, DP22.
    - MU-WORKSPACE-COMMITTED-END (the selector ignores the preview) → DP22.
    - MU-OVERVIEW-COMMITTED-END (the overview extent ignores the preview) → DP21, DP22.
    - MU-TRANSPORT-SUBSCRIBES (`ArrangementTransport` subscribes to the preview again) → DP2, DP9a, DP21.
    - MU-CLEAR-ANY-PREVIEW (C's C-R328-01 mutant: the layout-effect clear drops the sequence guard [K7]) → DP20.
  - **Not run by B:** the perf spec on a production build. The move rows therefore stay `record` (L58). The expected harness value is an inference, not an assert: at most about (57 × 25 + 3 × 110) / 60 ≈ **29** components per move (from 106.85); slightly less, because moves under the drag threshold commit nothing (`performance-optimizer`). An assert at the item target (≤ 15) would fail on the 23-component in-second floor, which is stage c2.
- **Consults** (`b-round-328.md` §5): `tech-lead` (keep the ownership and the inline selector; named prop alias; add a provider-render assert to DP22: both applied to the sketch) and `performance-optimizer` (no correctness risk in the selector closure, zustand 5 `useStore`; ship the move rows as `record`; next cut is the shared in-second floor).
- **Not chosen:**
  - A `selectPreviewTimelineSeconds` helper in `preview-store.ts`. The tail constant and the viewport are layout policy, not preview state (tech-lead).
  - Lanes reading the timeline width from a store. The crossing commit (108) happens 3 times per harness gesture; it is a later candidate (§6).
  - `memo` on the new readout leaf. Its only prop is a primitive and its parent no longer renders on a move; a no-memo mutant stayed green, so it would be an unguarded line.
- **Reference-first, product-designer, screen budget:** not applicable. This is a perf round and nothing visible changes.

## 1. Contract
**Apply `b-round-328/sketch/sketch.patch.txt` with `git apply` from `store/`.** §1.1–§1.4 describe that patch. Do not retype it: `run-mutants.sh` and the claims match its exact lines. §1.5 (doc 232) is the only edit by hand. If the patch does not apply, STOP.

1. **`StudioWorkspace.tsx`, the workspace body:**
   - the raw `const projectEnd = useArrangementPreview(…)` subscription after the `workspace` destructuring is removed [K3];
   - `timelineSeconds` becomes its own primitive selector: `useArrangementPreview((state) => Math.ceil(Math.max(selectPreviewProjectEnd(state.preview, committedProjectEnd) + TIMELINE_TAIL_SECONDS, viewportSeconds)))`, at the place of the old line [K3]. The value equals HEAD's for every input;
   - the `extent` `useMemo` is removed, and the overview receives `committedProjectEnd={committedProjectEnd}` instead of `extent={extent}` [K4].
   - `fitTimeline` keeps reading the committed end through `workspaceRef` [K7]; it refuses during a gesture, as now.
2. **`StudioWorkspace.tsx`, the overview wrapper:** a named type `ArrangementOverviewWithPreviewProps` (the overview's props without `extent`, plus `committedProjectEnd: number`). `ArrangementOverviewWithPreviewInner` subscribes to `selectPreviewProjectEnd(state.preview, committedProjectEnd)` and passes `extent={timelineExtent(projectEnd, arrangement.loop)}` [K4]. The loop comes from the committed arrangement, as at HEAD. The names `ArrangementOverviewWithPreviewInner` and `ArrangementOverviewWithPreview` do not change (render-log keys, L23).
3. **`ArrangementTransport.tsx`:** a plain function component `ArrangementProjectEndText({ committedProjectEnd })` subscribes to the preview end and renders the same `<span data-testid="arrangement-project-end">` [K5]. `ArrangementTransport` renders it in place of the span and no longer subscribes to the preview. No other line of the transport changes.
4. **Tests** (`drag-preview-render.test.tsx`), appended verbatim from `b-round-328/sketch/drag-preview-render.test.tsx.txt`; A may strengthen them, never weaken them:
   - **DP20** (closes C-R328-01): mid-fade, `setStatus('Committed write.')` and a move to the next fade value run in one `act`. The footer and `getStatusPreviewText()` show "Fade In: 3.000 s"; the release shows the committed fade text.
   - **DP21:** a header move that pushes the end of `LATE_AUDIO_CLIPS` (c1 at 6 s) inside one timeline second. Over two moves: Provider, `StudioWorkspace`, `ArrangementRuler` and `ArrangementTransport` render 0 times; `ArrangementProjectEndText` 2, `ArrangementLane` 2, `ArrangementOverviewWithPreviewInner` 2. The end text is 00:12.750, `data-extent` 12.750, and the ruler width is unchanged; the release keeps both values.
   - **DP22:** the move into the next second renders the Provider 0 times, `StudioWorkspace` and `ArrangementRuler` once, the ruler grows by exactly one second of pixels, and `data-extent` is 13.250.
5. **Doc 232** (the whole doc, L34):
   - l.4 becomes exactly `**სტატუსი:** In Progress (stage c1 of a, b, c1–c5; C round 329 PASS)` [K11].
   - The title names stage c1. The seven TEMPLATE headings stay in order (L26). Add a `### ეტაპი c1` section under `## მიდგომა`, the new subscriptions under `## არქიტექტურა`, the two files under `## შეცვლილი ფაილები`, and DP20–DP22 and the HEAD → sketch names numbers (105 → 23 per in-second move, the 108 crossing) under `## ტესტირება`.
   - `## პრობლემები და გადაწყვეტები`: one Problem → Solution entry. The raw end selector re-rendered the workspace on every move; the fix selects the ceil'd timeline width and moves the end readers into leaves.
   - `## TODO`: replace the stage-c line with c2–c5 and the assert conversions (D-29z950); note that A's status-hook trigger was checked and is not met (D-29z949). Cite only rows that exist.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-328/claims-329.sh` from the loop root. The output must equal `b-round-328/claims-329-planning-output.txt`. Any difference is a STOP |
| A-IMPL | `git apply b-round-328/sketch/sketch.patch.txt` (§1.1–§1.4), then §1.5 by hand |
| A-CLAIMS-AFTER | Save as `a-round-329/claims-after.txt`. Compare with `b-round-328/claims-329-sketch-output.txt`: they must be equal except K2 (the scratch is not a git repo: A's line is `dae81bf 4`), K8 (the scratch's `vite.config.ts` has a `cacheDir`: A's line is `11`), K10 (more only if A strengthens a row) and K11 (the new l.4) |
| A-SCOPE | `git status --short` lists exactly 4 modified files: the 3 patch files and doc 232 |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0. The Biome diagnostic count for `app/lib/arrangement app/contexts app/components/arrangement` (K12 command) stays **16**. `npx biome check` on the three code files is clean |
| A-UNIT | `npx vitest run` on the 9 files of `b-round-328/k13-covering-files.txt` plus `app/lib/arrangement/__tests__/status-preview-store.test.ts`. All green. List any test above 50 % of its timeout (L31) |
| A-MUTANT | On a scratch copy, never in `store/`: `b-round-328/run-mutants.sh <scratch>`. Each of the five mutants is red on the rows listed in §0; restored: 24/24 green |
| A-REVIEW | code-reviewer (4 files). Its Architecture note goes to B |

A does not run a browser or perf row; C runs them.

### 2.2 C's rows
C writes `c-round-329.md` and `c-round-329.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding;
- `assertsSpecified` = 3 (DP20–DP22) + 3 browser rows (END-LIVE, DRAG-NAMES, D-ROWS) = 6;
- `mutantsRecorded` = 5, the `run-mutants.sh` set; `mutantRedOnSketch` = true, evidence `b-round-328/mutants-summary.txt`; `mutantRedOnTree` from C's own run;
- `gateChecksNamed` = 6; `gateChecksRunOnSketch` = 2 (full vitest `b-round-328/precheck-full.log`, typecheck `b-round-328/sketch-typecheck.log`);
- `chainHeadGateRunGreen` = true, evidence `gates/gate-round-328.json` (the baseline is a published gate commit).

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-328/claims-329.sh`, first (L56) | Equal to A-CLAIMS-AFTER |
| SOURCE-SCOPE | `git status`; `git diff --stat`; protected sha | 4 modified files (the 3 patch files + doc 232), nothing untracked; `git apply -R --check b-round-328/sketch/sketch.patch.txt` passes unless A strengthened a test (then only the test hunk may differ, with no `expect(` removed); protected 11/11 |
| UNIT | On C's scratch: `drag-preview-render` and `status-preview-store`, ×3 | Green on every run; DP20–DP22 present |
| MUTANT | `b-round-328/run-mutants.sh` on C's scratch, plus one mutant of C's own | As A-MUTANT. C's own mutant is red on the row C names |
| **END-LIVE (browser)** | `node b-round-328/end-bound-probe.mjs <base> <absolute out path>` against A's tree (:5173) and HEAD `dae81bf` on a second dev server with its own Vite `cacheDir` (L38) | At 1440×900 and 1280×720, the whole output equals HEAD's: every sample's end text, ruler width, scroll width, clip start and width, overview `data-extent` and `aria-valuetext`; `distinctEnds` 60, `distinctExtents` 60, 4 ruler widths; `afterRelease` equal |
| **DRAG-NAMES (browser)** | `node b-round-328/names-probe.mjs <A base> <out>` on A's tree, warm server (a cold-compile timeout is environment-invalid and replaced) | `move-moves`: no commit that does not change the ruler width contains `StudioWorkspace`, `ArrangementTransport`, `ArrangementRuler` or `ArrangementLibrary`, and those commits contain `ArrangementProjectEndText`. The per-commit counts equal `b-round-328/names-sketch-final.json` ([23, 2, 23, 2, 108, 2, 23, 2]; the index of the 108 may shift with the start pixel). `fade-moves` and `trim-moves` equal `names-head-dae81bf.json` |
| **D-ROWS (browser)** | `ROWS_DIR=<absolute c-round-329/rows dir> node b-round-328/rows.mjs <base> <tag>` on A and on HEAD (both viewports by default; tags `a` and `head`), then `python3 b-round-328/rows-diff.py <dir>/rows-head.json <dir>/rows-a.json` | `DIFFS 0`; no page errors on either tree. Covers D-TRIM, D-MOVE (left, right past the end, snap, Alt), D-MIXED, D-ABORT, D-UNDO, D-NOFLASH, D-OLDPATH (fade, 2-clip group move, video move), D-LOOP and the EXPORT sha |
| PERF | Production build. Run the interactions spec **alone**, after a browser warm-up (L38) | <ul><li>The 5 asserted fade rows pass (≤ 24 per move and max, 0 restarts); the move restart rows pass.</li><li>Record `interact.drag.move.{stopped,playing}.move-components-per-move` and `-max` (B's inference ≈ 29 per move, max ≈ 110; a record row, no budget).</li><li>The range, fade and trim rows equal C round 328's run (`c-round-328/perf-interactions-atree-results/latest-interactions.json`) within the determinism contract. Any other rise is a finding, reported with its number</li></ul> |
| G329-AUTH | As G328-AUTH (`c-round-328/g328-auth.cjs`), at both viewports | `/studio-lab`: the anonymous workspace and the demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required" and 0 `audio[src]`. `/api/studio-token` with no header → 401 |
| DOCS | Check doc 232 against §1.5 | l.4 byte-equal; 7 headings in order; the c1 section, the problem entry and the TODO split exist; every cited DP id exists in the test files |

**Gate rows.** C does not claim these: the full vitest, the build, Biome, typecheck, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if END-LIVE, D-ROWS and G329-AUTH ran at both viewports and DRAG-NAMES ran once.

**Ableton conformance:** not applicable. Behaviour is held to HEAD.

## 3. Grants
A edits only:
- `app/components/arrangement/StudioWorkspace.tsx`: the overview wrapper and its props type, the removed raw subscription, the `timelineSeconds` line and the overview's props (§1.1–§1.2);
- `app/components/arrangement/ArrangementTransport.tsx`: the new leaf and the replaced span/subscription (§1.3);
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: append DP20–DP22 and `LATE_AUDIO_CLIPS` (§1.4);
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (§1.5).

Nothing else may change: not `ArrangementContext.tsx`, `preview-store.ts`, `ArrangementOverview.tsx`, `perf/*`, any other test, the package, lock or config files, any protected file, or a loop artifact outside `a-round-329*`.

## 4. Neighbouring behaviour at risk (C probes)
- **Every reader of the project end:** the transport readout, the overview extent (its frame, playhead, `aria-valuetext` and `data-extent` [K19]), the ruler, lane and scroll widths, Fit (`fitTimeline` reads the committed end). Covering rows: DP7, DP21, DP22, END-LIVE, D-MOVE, D-UNDO.
- **The viewport-bound case** (a short project at a wide window): `timelineSeconds` comes from the viewport and must not change on a move. Covering: the selector is the HEAD formula (K3), D-ROWS at both viewports.
- **Playback while moving:** the transport no longer renders on a move; the Play state and position still update (D-ROWS playing samples, PERF move restarts 0).
- **The fade status path** (DP9a–DP20) stays as published in `dae81bf`.

## 5. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-329.md` and leaves the tree consistent when:
- A-CLAIMS differs from planning, or the patch does not apply;
- a covering test fails, or a test runs above 50 % of its timeout (L11);
- a mutant is not red on its rows;
- Biome flags anything new;
- another file seems to need a change;
- the reviewer's fix would change a clause ruled here (L11).

## 6. Next, and commit readiness
- **After C PASS:** the gate runs verify and publishes round 329. PERF-DRAG-PREVIEW stays in progress (stage c1 done).
- **Next round:** REGRESSION if it is planned on or after 2026-11-05 [K9]. It carries C-R318-06, CAND-R323-FOLD-CLEARS-SELECTION, SIG-R327-NOBPM-RULER-CLICK, the A-R328-REVIEW-SAME-TEXT-RACE probe and one short row per item finished since round 301 (stage b and c1 included). Otherwise stage c2 (the shared in-second remainder, D-29z950).
- **Candidate, recorded and not scheduled:** lanes reading the timeline width from a store (the 108 crossing commit, about 4 per move). It only pays once `ArrangementLane` can be memoised.

## 7. Claims (L29 + L56)
Run `bash b-round-328/claims-329.sh` from the loop root. `CLAIMS_STORE` may override the store path.
- Planning output: `b-round-328/claims-329-planning-output.txt`. Sketch output: `b-round-328/claims-329-sketch-output.txt`.

| Tag | Claim | Now | After A |
|---|---|---|---|
| K1 | gate 328 status, commit | published dae81bf | same |
| K2 | HEAD, status entries | dae81bf 0 | dae81bf 4 |
| K3 | in `StudioWorkspace.tsx`: `const projectEnd = useArrangementPreview((state) =>`; `const timelineSeconds = useArrangementPreview((state) =>`; the HEAD `timelineSeconds = Math.ceil(Math.max(projectEnd + …` line | 1 0 1 | 1 1 0 (the remaining one is in the overview wrapper) |
| K4 | `extent={extent}`; `committedProjectEnd={committedProjectEnd}`; `extent={timelineExtent(projectEnd, arrangement.loop)}`; the `extent` useMemo line | 1 0 0 1 | 0 1 1 0 |
| K5 | in `ArrangementTransport.tsx`: the preview-end subscription; the `ArrangementProjectEndText` declaration; the `arrangement-project-end` span; its use | 1 0 1 0 | 1 1 1 1 |
| K6 | `TIMELINE_TAIL_SECONDS = 30`; `TIMELINE_MIN_EXTENT_SECONDS = 10`; the `timelineExtent` body | 1 1 1 | same |
| K7 | `fitTimeline`'s committed-end line; the context's layout-effect guard (C-R328-01) | 1 1 | same |
| K8 | protected files OK | 11 | 11 |
| K9 | regression-last date | 2026-11-02 | same |
| K10 | `expect(` lines; `it('DP` rows; DP20–22 rows | 137 21 0 | 163 24 3 (more only if A strengthens a row) |
| K11 | doc 232 l.4 | `… (stage 2 of 3; C round 328 PASS)` | `**სტატუსი:** In Progress (stage c1 of a, b, c1–c5; C round 329 PASS)` |
| K12 | Biome diagnostics in the three folders | 16 | 16 |
| K13 | test/perf/e2e files naming the touched render-log names, the end testid or the extent (`SWEEP`, roots `app/**`, `perf/**`, `e2e/**`) | 9 (`k13-covering-files.txt`) | same |
| K14 | cited artifacts exist | checked | checked |
| K15 | `tasks/round-328.md` equals the before-copy | archive-equal | same |
| K16 | B's full vitest on the sketch; typecheck rc 0 lines | `Tests 3562 passed (3562)` 1 | same |
| K17 | `×` lines in the mutant summary; restored 24 passed | 9 1 | same |
| K18 | HEAD-parity `×` lines; DP21/DP22 among them | 2 2 | same |
| K19 | in `ArrangementOverview.tsx`: `extent` feeds the frame, the `aria-valuetext`, the playhead and `data-extent` | 1 1 1 1 | same |
