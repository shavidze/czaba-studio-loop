# A — Round 31: SRW-13 stage 4a — FB-05 track pan (R13-M2)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-13 · Task: `current-task.md` (round 31) · Working dir: `C:/Apps/czaba-project/store`.
No commit, push, deploy, stash or install. The dev server was not started or stopped. Nothing was deleted or reverted. No PASS is claimed.

STATUS: A complete for round 31 (implementation, tests, doc, review dispositions, gates). Awaiting C.

## 1. Pre-flight gate

**Primitives read:** AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT, AUDIO_ARCHITECTURE, DESIGN_TOKENS, TAILWIND_FIRST, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS; `prompts/studio-feature.md`, `prompts/new-test.md`, `skills/pre-flight/SKILL.md`, `rules/read-primitives.md`. The inject-primitives hook re-fed them on the first Edit/Write per file kind.

- **Assumptions:** `pan` exists only when non-zero (1/50 steps, audio only); the existing per-track `StereoPannerNode` is the pan stage (no new node); a pan-only edit never reschedules; the drag preview is an audio-only override ref that never touches history.
- **Smallest version:** ≈ 250 source lines across 5 files, plus 1 test file and doc 036.
- **Files:** exactly §3.2.
- **Success:** `track-pan.test.tsx` red first then green; §5 frozen list green; tsc 0; vitest 1167 + new; Biome 2 baseline errors; `git status` 7 lines.

**Baseline before any edit:**
- HEAD `1cefea18500ac98c523caae6bf9626c811254b9e` (= B's `1cefea1`).
- `git status --short` → 0 lines.
- `sha256sum -c b-round-30-tree-sha256.txt` → 371 OK, 0 non-OK.
- 5 owned files vs snapshots: `ce2fc239 fdce3bbc d3f6ad71 10a874fc 8c862047` — all match.
- `node.exe` = 6; `curl /studio-lab` → 200.

**§1.4 grep results (contract-conflict check):**
- `pan.value` reads in tests: **none**. (`clip.pan` hits are only in `components/recordings/SfxSceneBuilder.tsx`, unrelated.)
- `createStereoPanner` / panner counts: `track-meter.test.ts` (`ctx.panners` l.71–88, `toHaveLength(3)` l.331, outputs l.251–253, l.332–334) and `meter.test.ts:89`. No new panner is created, outputs unchanged → green.
- `setTargetAtTime` counts on panners: **none**.
- Whole-track `toEqual`/`toStrictEqual`: none; only `.tracks).toBe(` identity in `clip-gain.test.tsx:346` and `master.test.ts:135` (unaffected — those paths don't touch tracks).
- Header range queries: only R24-HC `track-layout.test.tsx:1141` (first range in music row). Header child counts / row geometry: none found that assert children; `track-layout.test.tsx:140` mocks `offsetHeight` by `firstElementChild` of the scroller's child (not the header).
- **No frozen assertion breaks.** No contract conflict for B.

## 2. Red-first, then green

New file `app/lib/arrangement/__tests__/track-pan.test.tsx`, **26 `it`** (model 5, graph 4, provider 8, UI 9). Loaded in place on the unchanged snapshot sources (missing exports resolve to `undefined` in vitest; round 29/30 method). Output: `a-round-31/red-first.txt`.

```
 Test Files  1 failed (1)
      Tests  26 failed (26)
```

Failure reasons (`grep | uniq -c`):
```
 6 TypeError: setArrangementTrackPan is not a function
 1 TypeError: formatTrackPan is not a function
 2 TypeError: handle.setTrackPan is not a function
 3 TypeError: result.current.setTrackPan is not a function
 3 TypeError: result.current.beginTrackPanGesture is not a function
 1 AssertionError: expected [ +0, +0, +0 ] to deeply equal [ +0, -1, +0 ]      (graph seed)
 1 AssertionError: source scan missing 'panner.pan.value = clampPan(track.pan…'
 1 AssertionError: row 1 has 2 children, expected 4
 8 Error: pan slider missing
```
One source-scan string was adjusted after red (`const initialPan = clampPan(track.pan ?? 0);` + `panner.pan.value = initialPan;`) because the seed now stores the JS number for the float32 equality reason (§6). It is red on the snapshot either way (the snapshot has `panner.pan.value = 0;`).

Green: `a-round-31/green-1.txt` → `Tests 26 passed (26)`.

**Red-first scope caveat:** assertions added inside existing `it`s after the code review (§4) were **not** run against the snapshot or pre-fix sources. They are: NaN seed → 0, `pointerUp` with id 9 mid-drag ignored, `lostPointerCapture` after `pointerUp`, focus moves to the slider after reset, and `setTrackPan` refused during the track's own pan gesture. All but one would have failed on the pre-review code, judging from the code: NaN gives a NaN seed, id 9 committed early, focus stayed on the disabled button, and the own-gesture bypass returned `true`. The `lostPointerCapture` assertion is a guard; it was already a no-op before the review fixes. The whole file is red on the snapshot anyway, because the exports are missing. Final green: `green-2.txt`.

## 3. Diff summary per file (hunk purposes)

- `app/types/arrangement.ts` — `ArrangementTrack.pan?: number` (1 line).
- `app/lib/arrangement/model.ts` — `TRACK_PAN_STEPS = 50`; `normalizeTrackPan` (clamp ±1, round 1/50, −0 → 0); `trackPanValue`; `setArrangementTrackPan` (same-object returns; key removed at 0); `formatTrackPan`. `setTrackMix` untouched.
- `app/lib/arrangement/graph.client.ts` — `ScheduleHandle.setTrackPan` in the interface; local `clampPan`; panners kept in a `Map` by track id + `lastPanTargets`; seed `initialPan = clampPan(track.pan ?? 0)`; `disconnect` iterates `panners.values()`; `setTrackPan` (disconnected/unknown/equal → return; else store + `setTargetAtTime(v, now, 0.015)`). **No new `create*` call. `renderArrangementWav`: no hunk.**
- `app/contexts/ArrangementContext.tsx` — imports; 5 context-type members; `TrackPanGesture`, `TrackPanOverride`; `panGestureRef`, `panOverrideRef`; `startGraph` passes the override into `tracks` for that track only; `syncPlayback` non-reschedule branch pushes `override ?? trackPanValue(track)` for every track after the gains; actions `setTrackPan`, `restoreStoredTrackPan`, `finishTrackPanGesture`, `commitTrackPan`, `cancelTrackPan`, `beginTrackPanGesture`, `previewTrackPan`; unmount release; both value objects + deps. `scheduleKey`, Volume/Master machinery, transport, loop, `applyEdit` untouched.
- `app/components/arrangement/ArrangementLane.tsx` — import; context destructure; `panDraft` state + `panDragCleanupRef`; derived `storedPan`/`displayPan`/`panText`; handlers `handlePanPointerDown` (window pointerup/pointercancel cleanup), `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur`, `handlePanKeyDown`; row 1 JSX (audio, not folded) after the video branch. Row 2, meter, fold, height handle untouched.
- New: `track-pan.test.tsx`, `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`.

## 4. Code review (`code-reviewer` subagent actually invoked; static, score 8.5/10, no Critical/High/Medium)

| # | Finding | Disposition |
|---|---|---|
| 1 | Low: lane `onPointerUp`/`onLostPointerCapture` ignore pointer id; a second touch's release commits the first drag early | **Fixed:** `panDragPointerRef`; other ids are ignored. Test: `pointerUp` with id 9 mid-drag → no entry, draft kept. (Volume has the same gap; row 2 frozen → not touched.) |
| 2 | Low: draft gate uses global `isPointerGestureActive()`; after a claim abort + another gesture, moves set a visual-only draft | **Recorded, not changed:** visual only, clears on next pointerup/blur; fixing needs an `onEnd` callback in the context API beyond §2.3. For B. |
| 3 | Low: `setTrackPan` bypassed refusal during the track's own pan gesture → reset clicked with a second pointer + release = two entries | **Fixed (deviation from §2.3 wording, stricter):** `setTrackPan` now refuses during **any** gesture; commit releases first so it is unaffected. Test added in the refusal test. |
| 4 | Low: `clampPan(NaN)` → NaN throws on a real AudioParam | **Fixed:** non-finite → 0. Test: `pan: NaN` seeds 0. |
| 5 | Low test gap: export scan not limited to the function body | **Fixed:** scan sliced to the body (CRLF-tolerant end match) and asserts the final `return` line. Byte-compare to the snapshot was not done in-test (would bind the test to `../tmp`); C's R31-S diff covers it. |
| 6 | Low test gaps: lostpointercapture after pointerup; syncPlayback override branch; Volume flush before begin | **Partly fixed:** `lostPointerCapture` after `pointerUp` now asserted (still one entry). The non-reschedule override push is **defensive** (every edit is refused during a drag, so it is reachable only via restore paths that are also blocked) — recorded for C's mutation (b)/(h). Volume-flush-before-begin not added (Volume code path unchanged; same as `beginTrackVolumeGesture`). |
| 7 | Low a11y: disabled reset drops keyboard focus; visible text not in accessible name | **Fixed first part:** successful reset moves focus to the Pan slider (test asserts `activeElement`). Accessible name is fixed by §2.4 → recorded. |
| 8 | Info: Volume Delete/Backspace deletes the selected clip | Already found and verified (§6 deviation 1) → for B (stage 4b or polish). |
| 9 | Nit: centred override writes `pan: 0` into graph-only track copies | Not changed (graph-only, never stored). |
| 10 | Nit: `formatTrackPan(±0.01)` asymmetry | Not changed (slider values are whole 1/50 steps; matches §2.1 formula). |

The reviewer did not run commands; all gates were re-run by A after the fixes (§5).

## 5. Command tails (verbatim)

**Final run after the review fixes** (files: `frozen-list-final.txt`, `vitest-full-final.txt`, `build-final.txt`, `biome-final.txt`, `green-2.txt`):
```
node.exe before: 6
track-pan.test.tsx: Tests 26 passed (26)   (re-run after biome --write reformatted one quote in the test file)
frozen list (14 files): Tests 251 passed (251)
npx tsc --noEmit: no output, exit 0
npx vitest run: Test Files 68 passed (68) / Tests 1193 passed (1193)
npm run build: exit 0
biome check --write <6 owned files>: Fixed 1 file (track-pan.test.tsx quote style)
biome check ./app: Found 2 errors / 218 warnings / 1 info; errors = auth-bugs.test.ts, auth.ts (format, baseline CRLF); 0 diagnostics in A's files
git status --short: exactly the 7 §3.2 lines
sha256sum -c b-round-30-tree-sha256.txt | grep -vc ': OK$' → 0
protected 4/4 OK
HEAD 1cefea18500ac98c523caae6bf9626c811254b9e (start = end)
node.exe after: 6
```

First run (before the review fixes):

```
$ git rev-parse HEAD
1cefea18500ac98c523caae6bf9626c811254b9e
$ sha256sum -c ../tmp/studio-real-loop/b-round-30-tree-sha256.txt | grep -vc ': OK$'
0
$ npx vitest run app/lib/arrangement/__tests__/track-pan.test.tsx
 Test Files  1 passed (1)
      Tests  26 passed (26)
$ npx vitest run <§5 frozen list, 14 files>
 Test Files  14 passed (14)
      Tests  251 passed (251)
$ npx tsc --noEmit
(no output, exit 0)
$ npx vitest run            (node.exe = 6 before)
 Test Files  68 passed (68)
      Tests  1193 passed (1193)
$ npm run build
✓ built in 1.87s   (exit 0)
$ npx biome check --write <6 owned code/test files>
Checked 6 files in 130ms. No fixes applied.
$ npx biome check ./app
Found 2 errors.  Found 218 warnings.  Found 1 info.
  errors: app\lib\__tests__\bug-hunting\auth-bugs.test.ts format, app\lib\auth.ts format (baseline CRLF, root's)
  diagnostics in A's files: 0
$ git status --short
 M app/components/arrangement/ArrangementLane.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/graph.client.ts
 M app/lib/arrangement/model.ts
 M app/types/arrangement.ts
?? app/lib/arrangement/__tests__/track-pan.test.tsx
?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
$ protected-baseline.json
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ tasklist | grep -ci node.exe
6
```

## 6. Deviations, R24-HC, self-checks

**Deviations (for B):**
1. **Delete/Backspace guard on the Pan slider (`onKeyDown` → `stopPropagation` for those two keys only).** `StudioWorkspace`'s window keydown has no slider guard on the Delete/Backspace branch and `isTypingTarget` excludes `range`, so without it the §2.6 / R31-PH requirement fails. `StudioWorkspace.tsx` is frozen, so the guard lives on the Pan input. Space and Home are not stopped (Space toggles playback, Home stays with the browser).
   - **Pre-existing bug found, not fixed (row 2 frozen):** Delete on a focused **Volume** slider deletes the selected clip. Verified with a temporary probe `it` in my own test file (removed, file restored byte-identical via `cmp`): `PROBE clips after Delete on Volume: s1,v1` (m1 deleted). Suggest B queue it (fix in `StudioWorkspace` Delete branch with `!isSliderTarget`, or a Volume `onKeyDown`).
2. **Model function named `setArrangementTrackPan`** (B allowed another name) so it does not shadow the context action `setTrackPan`; `normalizeTrackPan` is exported and reused by `previewTrackPan`.
3. **Graph stores the JS number as the equal-value target** (`initialPan`), not `panner.pan.value` read back, because a real `AudioParam` is float32 (0.34 reads back as 0.3400000035…), which would defeat the equal-value early return on every sync.
4. **Lane-level window `pointerup`/`pointercancel` listeners** clear the local draft when the context ends the gesture without an element event (window pointercancel, pointer released outside). Not in the §2.4 event list; needed so the slider cannot stay on a stale draft.
5. **`startGraph` honours the override by seeding `tracks`** (B allowed either way), so the new panner starts at the dragged value without a 15 ms ramp racing the 50 ms lookahead.

6. **`setTrackPan` refuses during *any* pointer gesture, the track's own pan gesture included.** This is stricter than the §2.3 wording, and **B must accept this contract change.** Without it, clicking reset with a second pointer during a drag produces two entries. Commit releases the gesture first, so it still works. (Review #3.)
7. **The lane ignores element `pointerup`/`lostpointercapture` from a different `pointerId`** than the one dragging. (Review #1.)
8. **A successful reset moves focus to the Pan slider.** The button becomes disabled, which would otherwise drop keyboard focus. (Review #7.)
9. **`clampPan` maps non-finite values to 0**, because `initialArrangement` is an unvalidated prop. (Review #4.)

**R24-HC:** `track-layout.test.tsx:1140–1147` takes `querySelector('[data-track-id="music"] input[type="range"]')`, which is now the **Pan** slider (row 1 precedes row 2). It passes unchanged (`pressHome` not prevented; position stays 5). No other frozen test relies on "first range = Volume".

**§2.7 self-checks (code reading + tests where stated):**
- *Pan on a track whose clips have no live source while playing:* the panner exists per track for the whole graph lifetime; `handle.setTrackPan` ramps it regardless of sources; later sources (next clip, loop append) connect through the same trackGain → panner, so they play panned. Covered indirectly by the provider test (music panner ramps even though only the panner is asserted).
- *Pan during a loop wrap:* `fillLoopIterations → appendPlan → startPlan` reuses `trackGains` → same panners; no reschedule and no extra `setTargetAtTime` at wraps (equal-value early return). Not unit-tested in this file; C's R31-PL is the oracle.
- *Undo of a pan while a Volume preview is pending (keyboard Volume, keyup not yet fired):* `undo` flushes the pending Volume first (existing behaviour), so Ctrl+Z undoes the **Volume** entry, not the pan. Same as Clip Gain. Recorded, not changed.
- *Escape during a drag:* no handler except the floating-video Escape in `StudioWorkspace`; the native range has no Escape semantics, so the drag continues and commits on release. No contract beyond native.
- *Provider unmount during a drag:* the unmount effect releases the pan gesture (detach window listeners + release claim) and clears the override before `stopGraph`; the lane's own unmount effect removes its window listeners.

## 7. Known gaps / next C checks

- **Browser smoke (A, not a PASS claim)**, own state `a-browse.json`, wrapper `a-round-31/b.sh`, server already on :5173: synthetic pointerdown (id 41) → 3 native-setter `input` events (−15/−35/−50) → pointerup. Mid-drag values/readouts `-15/15L, -35/35L, -50/50L`; after release `value -50`, `aria-valuetext 50L`, reset enabled, Undo button title `Undo: Pan — მუსიკა`, music Volume `1` unchanged. Console: only the known anonymous `GET /api/cart` connection-refused errors. Geometry probe at 1440×900: header `scrollWidth == clientWidth` (219) on all 4 lanes, row 1 height 20–22, Volume 107, lane rows 81/81/81/81; the music name box (101 px) ellipsizes only the active ` · აქტიური` suffix (allowed). Screenshot `a-round-31/smoke-1440.png`. The smoke happened before the review fixes (lane pointer-id/focus changes not re-smoked).
- C: R31-PE/PE2 decode oracles, R31-PV/PL live hooks, R31-PUI geometry at 1440/1280+panel, R31-U mutations (a)–(k) in a scratch copy. Oracles for the deviations, each with the mutation that should trip it:
- **Deviation 1:** the Delete test. Mutation: remove the `stopPropagation`.
- **Deviation 6:** the `setTrackPan(..., 0.6) → false` assertion in "refuses during another pointer gesture…". Mutation: restore the own-gesture bypass.
- **Deviation 7:** the `pointerUp` id 9 assertion in the drag UI test. Mutation: drop the pointer-id check in `handlePanPointerEnd`.
- **Deviation 8:** `activeElement === slider` in the readout test.
- **Deviation 9:** the `pan: NaN` seed assertion in the graph test.

`syncPlayback`'s override push in the non-reschedule branch is defensive, because edits are refused during a drag. Mutation (b) is caught by the Undo-while-playing test; an override-only mutation there may survive.
- Carried (unchanged): C-R27-01, C-R23-01, C-R6-02, C-R8-01, C-R30-01; R26-M1, MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, R9-REVIEWER-M1-L8, DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, DOC034-UNREACHABLE-NOTE, DOC035-NOTES; root items per §4.7 (`root-pre-push-review.md`, `publication-checkpoint.json`).
- New for B: VOLUME-DELETE-KEY (pre-existing, Medium-ish: data edit via a key on a focused fader; undoable).

## 8. Scope

Scope completed for A: §2.1–§2.6 implemented; §2.7 Biome/tests/build/review done. Additional deviations from the review: `setTrackPan` refuses during any gesture (stricter than §2.3), pointer-id filter on lane commit, focus to slider after reset, NaN-safe `clampPan`. B acceptance criteria are C's to mark; A marks none as PASS.

## 9. Continuation addendum (new A session, 2026-10-13 ≈ 12:30–12:33)

Why: the previous A session ended with `a-round-31-result.json` empty (0 bytes, 12:30:00). The test file (12:26:51) and doc 036 (12:29:47) were modified after the saved gate artifacts. A new A session took over, made **no code or doc edits**, and re-ran the §5 gates on the final tree:

```
node.exe before: 6
git rev-parse HEAD → 1cefea18500ac98c523caae6bf9626c811254b9e
npx vitest run app/lib/arrangement/__tests__/track-pan.test.tsx → Test Files 1 passed (1) / Tests 26 passed (26)
npx tsc --noEmit → exit 0, no output
npx biome check <6 owned code/test files> → Checked 6 files. No fixes applied.
§5 frozen list (14 files) → Tests 251 passed (251)
npx vitest run → Test Files 68 passed (68) / Tests 1193 passed (1193)
npm run build → exit 0
npx biome check ./app → Found 2 errors / 218 warnings / 1 info; errors only: app\lib\__tests__\bug-hunting\auth-bugs.test.ts format, app\lib\auth.ts format (baseline CRLF, root's)
git status --short → exactly the 7 §3.2 lines
sha256sum -c b-round-30-tree-sha256.txt | grep -vc ': OK$' → 0
protected-baseline.json → 4/4 OK
node.exe after: 6
```

Doc 036 was read end to end. It is complete and not truncated. It has every TEMPLATE section and matches the final code: `setArrangementTrackPan`/`normalizeTrackPan`, the stricter any-gesture refusal, the pointer-id filter, focus moving to the slider after a reset, NaN → 0, the W3C mono and stereo formulas, the Ableton table with statuses, the R24-HC note and the not-in-round list.

The code-reviewer and the browser smoke were not re-run in this session. §4 records the earlier review. The smoke predates the review fixes, which were not re-smoked.

STATUS (12:33): A complete for round 31; awaiting C. No PASS claimed.
