# A round 27 — SRW-13 stage 2b: per-track live meters in the lane headers, with a latched over-0 warning per track (D-29r)

Implementer: A (Claude Opus 5.5) · 2026-10-11 · Store `C:/Apps/czaba-project/store`, HEAD `c5ed47b` plus the round-6..26 dirty tree · Dev server: the existing `http://127.0.0.1:5173` (I did not start or stop it) · Nothing was committed or pushed. **This report claims no PASS.** C verifies.

Gate outputs are in `a-round-27/`.

## 1. Pre-flight gate

**Baseline, checked before any edit:**
- `sha256sum -c b-round-26-tree-sha256.txt`: **60 OK**.
- `git status --short`: **58 lines**, identical to `c-round-26/gates/git-status-end.txt`.
- The five owned files matched their snapshot shas (`ed52f465`, `ff6c7d2e`, `32108f28`, `cdaf07f4`, `afef9745`).
- No difference to report.

**Read before coding:**
- `.claude/rules/read-primitives.md`, plus the primitives AUDIO_ARCHITECTURE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, REACT_CONTEXT, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and GEORGIAN_DOCS.
- `prompts/studio-feature.md`, `prompts/new-component.md` and `skills/pre-flight`.
- The §1.3 source ranges and the frozen-test ranges.

**Gate:**
- **Assumptions:**
  - The tap is post-panner, and `panner.connect(tap)` comes after `panner.connect(master)`.
  - There is one reset point, the existing `resetMasterPeak`.
  - The meter is absolute in the header's `pb-1.5` band. The header is already `sticky`, so it is already positioned and its class did not change.
  - Track taps exist only when the Master tap exists, so the guard is shared.
- **Smallest version:**
  - `meter.ts`: +39 lines;
  - `graph.client.ts`: +5;
  - context: about +115/−4 (the −4 are dependency arrays and the re-nested provider line);
  - the new component: ~100 lines;
  - `ArrangementLane.tsx`: import plus one element.
- **Files:** exactly §3.2. Each is required by §2.1–2.6.
- **Success:**
  - the new tests are red on the unchanged sources and green afterwards;
  - the frozen 8 are green and unchanged;
  - tsc 0, the build passes, Biome 0 errors with ≤ 218 warnings + 1 info;
  - `git status` has 62 lines.

**design-philosopher (read-only, run once). Advice and my dispositions:**

| Advice | Disposition |
|---|---|
| Zones identical to the Master (`flex-9 bg-positive/80`, `flex-1 bg-warning/80`, `flex-1 bg-destructive`), cover `bg-outline origin-right` | **Adopted** |
| `bottom-px`, so the idle cover does not merge into the row's `border-b` | **Adopted** |
| 0 dBFS mark at `border-foreground/50`, not `/70`, so at 4 px it differs from the white hold tick | **Adopted** (C: the opacity differs from the Master on purpose) |
| Hold tick: wrapper `right-0.5`, tick `w-0.5` at `left-0`, so at +6 dBFS it covers exactly the last 2 px | **Adopted.** It fixes the Master's 1 px edge case for tracks. |
| Over cue: a separate square `w-1 h-1 bg-warning` past the end of the scale with a 2 px gap; scale `rounded-l-full`, square right end | **Adopted.** The cap sits inside the same `data-testid="arrangement-track-meter"` element (scale `right-1.5`, cap `right-0`), so C measures a single rect. |
| `pointer-events-none` on the bar | **Rejected.** It would disable the required hover `title`. |
| sr-only text "Peak 0 dBFS-ს ზემოთ — გაფრთხილება" | **Rejected.** I kept the task's text, `{trackName}: დონემ 0 dBFS-ს გადააჭარბა`. It is a sibling of the `aria-hidden` bar, not inside it. |
| No `aria-live` | **Adopted** (matches the task). |
| `h-0.75` if focus rings overlap | **Not adopted.** The task specifies `h-1`, and the smoke check found no rect intersection with controls. |

Deviation from FORWARDREF_COMPONENT/new-component, as the task requires: `ArrangementTrackMeter` is a plain named function with only `trackId` and `trackName` props. It has no `forwardRef`, `memo` or `className`, because the frozen fiber counters match on `type.name`.

## 2. Red first, then green

**Red** (`a-round-27/red-native.txt`): the new tests ran against the unchanged sources, with only the two new test files and the five-line amendment in place. No scratch copy was needed, because both new files load: the UI test imports only existing modules, and a missing hook fails at runtime.
- `track-meter.test.ts`: **9 failed / 13**.
  - The 7 store tests fail with `createTrackMeterStore is not a function`.
  - "music panner `[master, musicTap]`" and "each tap fed only by its own panner" fail on the output assertions.
  - 4 are green on the snapshot. They are regression guards: a track without a tap, no `trackTaps`, disconnect, and the offline export with no taps.
  - tsc would also report the missing exports (expected).
- `track-meter-ui.test.tsx`: **11 failed / 11**. The tap counts are `1` against `4`, there are no taps, the meter is missing on the lanes, and `useTrackMeterStore is not a function`.
- `meter-ui.test.tsx`: **2 failed / 12**. These are the two tests with the amended count lines: `expected length 3 but got 1`.
- Total: **22 failed**.

**Green** (`a-round-27/green-new.txt`, after the review fixes): `Test Files 3 passed (3)`, `Tests 36 passed (36)`.
- `track-meter.test.ts`: 13.
- `track-meter-ui.test.tsx`: 11.
- `meter-ui.test.tsx`: 12.
- **24 new `it` blocks** (≥ 16 required).

**§2.6 coverage:**
- **Store:**
  - independent per-track state;
  - one notify per publish;
  - unsubscribe;
  - reset-all clears max and latch and keeps levels;
  - floor-all keeps max and latch;
  - an unknown id returns floor;
  - no leak across publishes.
- **Graph:**
  - `[master, musicTap]` with `outputs[0]` = master;
  - an untapped track gets `[master]`;
  - no `trackTaps` gives today's wiring;
  - every tap is fed only by its own panner;
  - disconnect removes the tap edge;
  - `renderArrangementWav`: every offline panner gets `[master]` and the master gets `[destination]`.
- **UI:**
  - 1+N splitters and 2+2N analysers, with the master first and `trackTaps` carrying every id;
  - the same taps after Pause/Play and after a reschedule;
  - music −12 / SFX −6 / video `-inf`;
  - the SFX over gives `+3.5`, `over`, the cap, the sr-only text and the over `title`, while music stays clear with the clear `title`;
  - the latch survives quiet frames and Pause/Play;
  - a Master Peak click clears the Master and SFX, with the Undo label, arrangement, status and graph count unchanged;
  - Pause gives `-inf`/`-inf` with `data-peak` kept;
  - folded, `aria-hidden`, absolute, not focusable, with the same header Tab stops with or without the meter element;
  - renders: 30 frames → Lane 0 / TrackMeter 0, the latch → TrackMeter 1 / Lane 0, the reset click → TrackMeter 1 / Lane 0;
  - no analyser: Play works, `trackTaps` undefined, meters `-inf`;
  - unmount: wrapped `subscribeMeter` / `subscribeTrackMeters` spies are each called exactly once, and a publish after unmount does not throw.

**Mutations, scratch copy only** (`a-round-27/scratch/`, a copy of `app/` and the configs; `node_modules` is a junction, a link only). The runner is `a-round-27/mutate.mjs`. Each mutation is a string replace, the file is restored afterwards, and restoration was verified with `diff -q`. Outputs are in `a-round-27/mut-*.txt`. Afterwards I removed the junction with `rmdir`, which deletes the link only; the store's `node_modules` is intact.

| Mutation | Result |
|---|---|
| (a) tap from `trackGain` | 2 failed (`track-meter.test.ts`: music panner outputs; fed only by own panner) |
| (b) one shared state for every track (store sets every key to the last frame) | 5 failed (store independence, and the UI levels/latch/Pause/render tests) |
| (c) `stopPlayback` without the track floor | 1 failed (Pause floors every track meter) |
| (d) `resetMasterPeak` without track reset | 1 failed (Master Peak click clears the SFX latch) |
| (e) tap connected before `panner.connect(master)` | 1 failed (`track-meter.test.ts` music panner `[master, tap]`). The frozen `graph.test.ts` stays green: it passes no `trackTaps`. |
| (f) the writer's cleanup removed | 1 failed (the unmount unsubscribe test) |

## 3. Diff summary per file

All files were diffed against `b-round-26-snapshots/`; see `a-round-27/diff-*.txt`.

**`meter.ts` (+39/−0): additions only.**
- `TrackMeterStore`, a frozen `TRACK_METER_FLOOR_FRAME`, `floorTrackMeterFrames`, `resetTrackMeterPeaks` and `createTrackMeterStore`.
- The store is a closure, so its properties can be replaced.
- Round-26 exports are byte-identical.

**`graph.client.ts` (+5/−0):**
- `trackTaps?: ReadonlyMap<string, ScheduleAudioNode>` on `ApplyScheduleOptions`.
- `panner.connect(trackTap)` immediately **after** `panner.connect(master)`.
- `renderArrangementWav` and the master tap are unchanged.

**`ArrangementContext.tsx` (+115/−4):**
- The meter imports.
- `ArrangementTrackMeterContext`.
- `TrackMeterTap` (the master tap plus blocks pre-allocated once per analyser).
- `createTrackMeterTap`, which reuses `createMasterMeterTap` and its guard.
- `measureTrackMeterTap` (max/OR over both channels, with the same freshness subarray).
- `ensureTrackMeterInputs` (lazy, once per track id per context).
- The `trackMeterStore` state, plus `trackMeterTapsRef` and `trackMeterStatesRef`.
- `startGraph` passes `trackTaps` only when the Master tap exists.
- `stopPlayback` floors every track and publishes once.
- `sampleTrackMeters` runs in `tick` right after `sampleMasterMeter`: one publish, no `setState`.
- `resetMasterPeak` also resets every track.
- Unmount clears the track taps.
- The provider is nested inside the meter provider.
- `useTrackMeterStore` and `useTrackMeterWriter(trackId, write)`.
- The 4 removed lines are the three dependency arrays and the provider line I re-nested.
- No video, dock, scheduler, loop, transport or `scheduleKey` change.

**`ArrangementTrackMeter.tsx` (new):**
- `useSyncExternalStore` on the per-track over boolean, with server snapshot `false`.
- The writer writes `data-level-db`, `data-hold-db`, the cover `scaleX` and the hold `translateX` only when `levelDb`/`holdDb` change. It writes `data-peak`, `data-state` and `title` only when the label key changes.
- The over cap and the sr-only sibling are rendered only while over.
- Tokens only, no JSX `style=`.

**`ArrangementLane.tsx` (+2/−0):** the import, and one `<ArrangementTrackMeter trackId={track.id} trackName={track.name} />` as the last child of the header.

**`meter-ui.test.tsx` (+5/−5):** exactly the five count lines (`a-round-27/meter-ui-diff.txt`):
- l.348 / 362 / 376: `toHaveLength(1)` → `toHaveLength(1 + meterArrangement().tracks.length)`.
- l.351 / 363: `toHaveLength(2)` → `toHaveLength(2 + 2 * meterArrangement().tracks.length)`.
- No other line changed.

**New:**
- `track-meter.test.ts`;
- `track-meter-ui.test.tsx`;
- `docs/implementation/2026/quarter-IV/033-studio-lab-track-meters.md` (Georgian; covers every R27-Doc point).

## 4. code-reviewer (the real subagent, read-only)

Result: **no Critical, High or Medium**, score 9/10. It confirmed:
- every hunk is inside §3.2;
- the tap is post-panner and after the master;
- the export passes no taps;
- the uSES/SSR setup is correct;
- the accessibility is correct;
- no banned patterns;
- tests exist for each of mutations a–f.

| Finding | Disposition |
|---|---|
| L1: `data-state` is written by both React and the writer | **Kept, documented in doc 033.** Both read the same published frame. The React prop gives SSR and the latch render; the writer gives "updated with every written frame". |
| L2: the reset render budget is not tested | **Fixed.** The render test now clicks `Master Peak` and asserts TrackMeter 1 / Lane 0. |
| L3: taps and states of a removed track are never pruned | **Not changed, a known gap** (doc 033). Tracks are a fixed set today. |
| L4: every writer does DOM work every frame | **Fixed for levels.** Level, hold and transform writes are skipped when `levelDb` and `holdDb` are unchanged (idle tracks at floor write nothing). The label still uses the string key, which includes `trackName`, so a rename rewrites the title. |
| L5: the 0 dB mark is `/50` versus the Master's `/70` | **Deliberate** (design-philosopher, §1). |
| L6: per-frame allocation | Inherited from the Master path: one `stepMeter` object per track and a `subarray` only inside the freshness window. Read buffers are allocated once. |
| L7: `as const` in the test | Consistent with frozen tests. Kept. |

## 5. Command tails (actually run)

All commands ran on the final code, after the review fixes.

**Machine load warning.** About 40–42 `node.exe` processes from other agents and servers were running at the same time. That caused timeouts, and I am reporting every run honestly.

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-26-tree-sha256.txt        → 60 OK, 0 FAILED
$ npx vitest run track-meter.test.ts track-meter-ui.test.tsx meter-ui.test.tsx
   Test Files  3 passed (3)
        Tests  36 passed (36)
$ npx vitest run <frozen 8>
   run 1 (under load, a-round-27/green-frozen8.txt):        Tests 22 failed | 130 passed (152) — all 22 are "Test timed out in 5000ms/15000ms", no assertion failure
   run 2 (a-round-27/green-frozen8-rerun.txt):               Tests 1 failed | 151 passed (152) — 1 timeout (track-layout "folds a lane to a 36 px row", 5100ms)
   track-layout alone (a-round-27/track-layout-rerun.txt):   Tests 36 passed (36) — that test 780ms
   (an earlier pre-review-fix run gave 152/152; its output file was overwritten by run 1, see §7.7)
$ npx tsc --noEmit                                                        → exit 0, no output
$ npx vitest run
   run 1 (under load, a-round-27/vitest-full.txt):           Tests 6 failed | 1090 passed (1096) — 5 timeouts in sfx-library / sfx-export / sfx-video-transport (known flake area) plus 1 render-budget hold-release timing assert
   sfx-* files alone (a-round-27/sfx-rerun.txt):             Test Files 3 passed (3), Tests 15 passed (15)
   run 2 (a-round-27/vitest-full-rerun.txt):                 Test Files 63 passed (63), Tests 1096 passed (1096)   (= 1072 + 24)
$ npm run build                                                           → exit 0, "✓ built"
$ npx biome check ./app                                                   → Checked 332 files. Found 218 warnings. Found 1 info. (0 errors)
$ npx biome check <8 owned code/test files>                               → No fixes applied (clean). --write was applied only to track-meter-ui.test.tsx.
$ git status --short | wc -l                                              → 62
   diff vs b-round-26-git-status.txt: + ArrangementTrackMeter.tsx, track-meter-ui.test.tsx, track-meter.test.ts, docs/.../033-studio-lab-track-meters.md
$ git diff --stat cc1e531 -- app/components/layout/Header.tsx             → 1 file changed, 21 insertions(+)
$ protected-baseline node check                                           → download-routes.test.ts OK, account.downloads.tsx OK, api.studio-token.ts OK, studio.$productId.tsx OK
$ diff -u b-round-26-snapshots/meter-ui.test.tsx …                        → 3 hunks, exactly 5 −/5 + count lines (a-round-27/meter-ui-diff.txt)
```

**Unresolved under load.** The one render-budget failure in full run 1, `keeps the context value … when the start hold releases`, is a timing assertion (`expected 0.0019998 to be +0`), not a timeout. It passed in the frozen re-run and in full run 2. I count it as load timing, but **C should watch it**: it is a frozen render-budget test.

## 6. Browser smoke (not a PASS claim)

gstack browse with `a-browse.json` on `:5173/studio-lab`, 1440×900.
- The daemon needed `BROWSE_PARENT_PID=0`: without it, three starts failed with "Server failed to start within 15s".
- I stopped my daemon at the end, and the state file was removed.

**On load:**
- **Pre-hydration window.** My first read, taken right after `goto`, saw `data-level-db` and `data-peak` as **absent** while `data-state="clear"` was present. The writer sets those attributes in a layout effect after hydration; they are not SSR props, unlike the Master's. The spec only requires them to be "updated with every written frame", so I made no code change. **C: read them after hydration.** Their absence before hydration is neither a bug nor C-R23-01.
- After hydration: 4 track meters, `position: absolute`, 4 px high, all `-inf`/`−∞`/`clear` with the title `ვიდეო · Peak −∞ dBFS`.
- Header **35 px**, rows **81×4**.

**Library `სრული მიქსი` → `＋ დამატება`, then real Play:**
- `music:-9.6/-7.6/−7.6/clear`, then `-14.6`, then `-9.9/-6.4`. **The music meter moves.**
- video, stems and SFX stay `-inf`.
- Pause → music `-inf/-inf/−6.4`.

**`Soft impact` on SFX at 0, then Play:**
- SFX `+0.0 / over / cap`, sr-only `SFX: დონემ 0 dBFS-ს გადააჭარბა`, title `SFX · Peak +0.0 dBFS — 0 dBFS-ს გადააჭარბა. გასასუფთავებლად დააჭირე Master Peak-ს`.
- Music keeps its own `−6.4` / `clear`.
- Master Peak `+1.5 / over`.
- The over survives Pause.

**A real click on `Master Peak`:**
- every track goes to `−∞ / clear` with no cap and no sr-only text;
- the Master goes to `−∞ / clear`;
- the Undo title is unchanged (`Undo: დამატება — Soft impact`).

**Geometry:**
- Every meter is inside the header's bottom 6 px band, with 0 rect intersections against the header's buttons, inputs and `p`: offset left 12, bottom 1, 203×4.
- Folding SFX with its fold button gives row 38 (mid-transition) and the meter is still in the band.
- Playing from 0 folded: the SFX meter reads `-14.2`, so **the folded meter moves**.
- At 1280×720: header 35, video 53 (tight), meters in band with 0 hits. My lane state was not the `lay11`/detail-open layout, so the other rows are not the C reference numbers.

**Console:**
- After a fresh load, the only error is the allowed anonymous cart fetch (`ERR_CONNECTION_REFUSED` / "Failed to load cart").
- A `ReferenceError: writtenLevelRef is not defined` at 07:49:57Z came from Vite HMR **between my two partial edits** of the L4 fix, before the fresh load. It does not occur on the final code.

**Screenshots:** `a-round-27/a27-over-1440.png` (the SFX over cap) and `a-round-27/a27-folded-1440.png`.

## 7. Deviations

1. **No scratch red proof.** Native red was possible because both new test files load, so I used it.
2. **One edge case not covered by a test:** `createTrackMeterTap` reuses the Master tap factory, and `ensureTrackMeterInputs` skips a track whose tap factory returns null. If the Master tap exists but a track tap throws, that track gets no tap and its meter stays at the floor.
3. **The code-reviewer had no Bash.** It checked scope by line anchors instead of `diff -u`, so I ran the `diff -u` myself (§3).
4. **HMR ReferenceError in the smoke console.** This is the transient entry described in §6, caused by my two-step edit. It is not a product error.
5. **The L2 reset-render assertion was not red-proved.** I added it to the render test after the review, on code that was already implemented. Mutation (d) does cover the reset path through the latch-clear test.
6. **The scratch copy predates the L2/L4 fixes.** It does not have the final `ArrangementTrackMeter.tsx` or `track-meter-ui.test.tsx`. Mutations a–f are still valid: they touch `meter.ts`, `graph.client.ts` and `ArrangementContext.tsx`, and none of those changed after the copy was taken. C will see this difference when diffing the scratch copy against the live files.
7. **The earlier 152/152 frozen-8 output was overwritten** by the run under load. Evidence that still exists: `green-frozen8-rerun.txt` (151 passed, 1 timeout), `track-layout-rerun.txt` (36/36) and `vitest-full-rerun.txt` (1096/1096, which includes the frozen 8).
8. **No `/check` skill exists in the store's `.claude/skills/`.** Instead I ran a scoped `npx biome check` on the 8 owned code and test files, with `--write` only on the new `track-meter-ui.test.tsx`, plus the read-only `npx biome check ./app`.

## 8. Known gaps (for B and C)

- **R26-M1** is inherited: rAF-only sampling, so hidden tabs and stalls over ~85 ms can miss an over.
- **L3:** the tap and state of a removed track are not pruned.
- The Master hold tick at ≥ +6 dBFS is still 1 px; `ArrangementMaster.tsx` is frozen (stage 4).
- The track meter is **4 px**. Readability at every density is the Tech Lead's **R27-T**.

## 9. Exact next checks for C

1. G27-1/2/3 yourself. Expected:
   - 60 OK;
   - 62 status lines (the 58 plus the 4 in §3.2);
   - `Header.tsx` +21/−0;
   - protected 4/4 OK;
   - Biome 218 + 1 info.

   If the full vitest suite times out under load, re-run the failed files alone (see §5).
2. **R27-TL / TI / TM / TV / TW / TO / TR / TF** on `lay11`:
   - read `fftSize` 4096 and `sampleRate` from the page;
   - with `lay11` expect **10 `AnalyserNode`s and 5 splitters**;
   - track `data-level-db` per rAF against the tap.
3. **R27-RB** with the `rb26.js` method on `ArrangementLane`, `ArrangementTrackMeter`, `ArrangementMaster` and `ArrangementMasterMeter`, plus one drift sample.
4. **R27-E:** one export of `lay11`. Analysers and splitters on `OfflineAudioContext` must be **0**.
5. **R27-L:** rect comparison with the meters `remove()`d at full 1440, tight/regular 1280 with the detail panel open, and folded.
6. **R27-K:** Tab order unchanged, and the meter is never focused.
7. **R27-S:** `diff -u` against `b-round-26-snapshots/`.
8. **R27-U:** mutations a–f in your own scratch copy.
9. **R27-Doc:** doc 033.
10. The **C-R23-01** record, including the sr-only text code points while a track is over.

## 10. Scope completed / not completed

**Completed by A (pending C):** §2.1–§2.6, doc 033 and the report.

**Not in this round** (carried, not PASS):
- SRW-13 stage 3 (FB-04 clip gain) and stage 4 (pan, fader-click UX, M1/L8, the Master hold tick);
- R26-M1;
- C-R23-01 (awaits the Tech Lead);
- C-R6-02 and C-R8-01;
- LIB-SEP-REASON;
- the lane overlay `/60`;
- the footer and group-hint Latin text;
- the folded-clip accessibility tree.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`) remain open as listed in the task §4.12:
- SRW-21 (middle-east loader);
- Lenis on `/studio/*`;
- portable instruction paths;
- the export hard clip;
- the final commit/push and the uncommitted round-6..27 tree;
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the two foreign agent files;
- the earlier A/C deviations;
- the fake Bearer 500;
- the CDP `Input.dispatchMouseEvent` allowlist;
- the publication-checkpoint requirements;
- the `Content-Type` charset.

I did not mark the backlog or the board complete.
