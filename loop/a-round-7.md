# A — Round 7 report (S1 C-R6-02, S2 C-R6-03, S3 C-R6-01)

Date: 2026-10-09 · Implementer: A (Claude Opus 5.5) · Task: `tasks/round-7` = `current-task.md` (bounded round 7)
Baseline: HEAD `c5ed47b` + 11 round-6 uncommitted files (none reverted). No commits/stash/checkout/push/deploy/installs. Dev server `http://127.0.0.1:5173` reused (not started/stopped). Browser only via gstack browse, state `tmp/studio-real-loop/a-browse.json`. Harness copies in `%TEMP%/a7` (C's `c-round-*` files read-only).

**No PASS is claimed. Everything below is A's own evidence, pending C.**

## 1. Pre-flight gate

- Assumptions:
  - S1 cause unconfirmed → measure first. Hypothesis from C's LoAFs: the "ArrangementContext rAF" script time includes the **microtask** React sync re-render that `useSyncExternalStore` schedules for every `useArrangementPosition()` consumer; `rafcost.js` timed only the synchronous callback.
  - RF7-P2 is achievable by memoization; do not split the context (would change `useArrangement()` shape and tests).
  - S3 needs an own-gesture exemption in `previewTrackVolume` once the slider claims the registry.
  - S2 is a pure label-fit rule in `view.ts`; tick lines stay, only labels drop.
- Smallest version: S1 direct DOM writers for per-frame consumers + memo ruler ticks / library rows (+ Follow read-after-write, overview per-scroll setState); S2 one helper; S3 begin/cancel + guard.
- Files: see §2 (each for its named reason). `video-sync.ts`, dock `step`, `position-store.ts` (only a temp instrumentation patch, removed), `types/arrangement.ts` unchanged.
- Success: vitest ≥ 761 + new, 0 fail; tsc 0; biome 0 errors owned + `./app`; build OK; hashes OK; before/after numbers in §4.

## 2. Files actually changed this round (subset of §2.2)

- `app/contexts/ArrangementContext.tsx` — `useArrangementPositionWriter` hook (S1; isomorphic layout effect); D-30: new value members `beginTrackVolumeGesture(trackId, pointerId)` and `blurTrackVolume(trackId)`, `commitTrackVolume(trackId?)` (track-scoped + guard), internal `cancelTrackVolumeGesture`/`revertTrackVolumePreview`, window `pointerup` commit and `pointercancel` revert for the claiming pointer, own-track exemption in `previewTrackVolume`, gesture release on provider unmount (S3).
- `app/lib/arrangement/view.ts` — `rulerTickMarks`, `RULER_LABEL_OFFSET_PX`, `RULER_LABEL_CHAR_WIDTH_PX` (S2).
- `app/components/arrangement/StudioWorkspace.tsx` — playhead line via writer; Follow subscriber no `scrollLeft` read after write (S1).
- `app/components/arrangement/ArrangementRuler.tsx` — memo `ArrangementRulerTicks` (label-fit rule), playhead line/handle/aria via writer (S1/S2).
- `app/components/arrangement/ArrangementTransport.tsx` — time text via writer (S1).
- `app/components/arrangement/ArrangementVideoDock.tsx` — position subscribers only: caption snapshot by video source id; gap time text via writer. `step`, `<video>` elements, mount and `canEscalateAfterSeeked` untouched (S1).
- `app/components/arrangement/ArrangementOverview.tsx` — no React state on scroll; aria written directly (S1 (c)).
- `app/components/arrangement/ArrangementLibrary.tsx` — memo `ArrangementLibraryOption` row + stable handlers (RF7-P2).
- `app/components/arrangement/ArrangementLane.tsx` — Volume slider D-30 handlers (S3).
- Tests: `app/lib/arrangement/__tests__/render-budget.test.tsx` (new, 3), `gesture-guard.test.tsx` (+8), `view.test.ts` (+7).
- Docs: `docs/implementation/2026/quarter-IV/016-studio-lab-round7-fixes.md` (new), `015-studio-lab-navigation.md` (status + TODO lines only).
- `app/lib/arrangement/position-store.ts`: temporary listener-timing patch for measurement, **removed**; `git status` shows no change to it.
- Not changed: `ArrangementClip.tsx` (round-6 diff only), `video-sync.ts`, `types/arrangement.ts`, `Header.tsx` (byte-identical to HEAD: `git diff` empty; vs `cc1e531` +21/−0), all protected files.
- No round-6 file reverted: all round-7 edits were made on top of the round-6 working tree; `git diff --stat` 14 files 1069+/164− (round 6 + round 7) + untracked `render-budget.test.tsx` and doc 016.

## 3. Command tails (actually run)

```
npx tsc --noEmit                      → exit 0 (no output)
npx vitest run app/lib/arrangement    → Test Files 18 passed (18) · Tests 315 passed (315)   (final, after review fixes)
npx vitest run (1st)                  → 1 failed | 775 passed: app/lib/__tests__/sfx-export.test.ts "Test timed out in 5000ms" (unowned, under parallel load); alone: 10/10 passed
npx vitest run (2nd)                  → Test Files 50 passed (50) · Tests 776 passed (776)
npx vitest run (final, after review)  → Test Files 50 passed (50) · Tests 779 passed (779)   (761 + 18 new)
npx tsc --noEmit (final)              → exit 0
npx biome check app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement
                                      → Checked 48 files. No fixes applied. (final 0 diagnostics; format-only fixes applied with --write on my own round-7 files only: ArrangementOverview, ArrangementVideoDock, ArrangementContext (1 wrapped line, diff checked), render-budget.test, view.test)
npx biome check ./app                 → Checked 314 files. No fixes applied. Found 218 warnings. Found 1 info. (0 errors; same 218 as C round 6)
npm run build (final)                 → ✓ built in 2.53s (exit 0)
hash check                            → download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
git diff app/components/layout/Header.tsx → empty
```
`npm run check` not run (rule: only `--write` on owned paths; `./app` read-only run shows no format diffs outside owned files).

## 4. S1 evidence (C-R6-02)

### 4.1 C's top LoAF scripts (FAIL runs, `c-round-6/runs/*_raw.json`)

| Run | LoAF | Script (sourceURL · fn · invoker) | dur | Name |
|---|---|---|---|---|
| Lr_5 | 74 ms @8919 | ArrangementContext.tsx · "" · FrameRequestCallback | 58 | `tick` + microtask React position re-render |
| L_7 | 58 @115194 | same | 33 | same |
| L_7 | 51 @114379 | same | 26 | same |
| L_7 | 87 @116000 | ArrangementVideoDock.tsx · step · FRC + Context FRC | 5 + 20 | dock `step` + tick |
| Lr2_2 | 88 @10103 (≈Play) | chunk-EGGHUET2.js · performWorkUntilDeadline · MessagePort.onmessage + Context FRC | 62 + 16 | React scheduler task (a non-sync-lane re-render; most likely the post-hold `isTransportRunning` flip set from the 200 ms pump interval, which re-renders every `useArrangement()` consumer — inferred, not proven) + tick |
| Lr2_2 | 69 @20022 | VideoDock step + Context FRC | 22 + 25 | step + tick |
| Lr2_2 | 66 @18854 | Context FRC | 21 | tick |
| L_8 | 59 | Context FRC | 13 | tick |
| Lr_3 | 84 / 65 | Context FRC | 10 / 5 | tick |

C's raw files store only `[url, fn, invoker, dur]` per script — **no `forcedStyleAndLayoutDuration`** — so forced layout in C's failing frames cannot be read back. My harness records it (below).

### 4.2 Before/after (A, `%TEMP%/a7`, light harness copy = C's `rf5.js`/`rf5an.js` + my `perfon.js`/`perfread.js`; R3-V1 layout `r3v1lay.js`; 13 s; 1440×900; steady = > 300 ms after Play)

Per-frame callbacks, p50 / p95 / max (ms), per run:

| Callback | B_1 | B_2 | B_3 | A_1 | A_2 | A_3 |
|---|---|---|---|---|---|---|
| `tick` sync | .3/.7/5.7 | .3/.6/3.6 | .3/.6/4.4 | .3/.5/19.9 | .2/.4/2.8 | .2/.4/1.4 |
| `tick` + microtasks (React) | **2.0/4.2/32.3** | **2.0/3.8/7.8** | **2.0/3.5/7.7** | **.8/1.5/34.7** | **.7/1.1/4.1** | **.7/1.1/3.5** |
| dock `step` + microtasks | .3/1.0/6.6 | .3/.9/12.7 | .3/.8/2.8 | .2/.5/9.8 | .2/.4/1.8 | .2/.4/1.9 |
| subscriber useSyncExternalStore ×5 (before) / writers ×4 + snapshot ×3 (after) | each p50 ≤ .1, p95 ≤ .3, max ≤ 2.0 | — | — | each p50 ≤ .1, p95 ≤ .2, max ≤ 19.6 (one sample) | ≤ .1/.2/.4 | ≤ .1/.2/.6 |
| Follow subscriber | 0/.1/2.6 | — | — | 0/.1/.5 | 0/.1/.3 | 0/.1/.2 |
| overview playhead subscriber | .1/.2/5.6 | — | — | 0/.1/.2 | 0/.1/.2 | 0/.1/.1 |
| app script forcedStyleAndLayout (steady LoAF) | 0 | 0 | 0 | 0 | 0 | 0 |
| app-attributed LoAF ≥ 10 ms | 0 | 0 | 0 | 0 | 0 | 0 |
| CPU % med/max (typeperf 1 s) | 42/64 | 33/48 | 33/47 | 19/39 | 14/33 | 18/53 |
| drift verdict (raw max / ex max) | PASS .058/.035 | PASS .030/.030 | PASS .023/.023 | PASS .086/.086 | PASS .020/.020 | PASS .019/.019 |

(Subscriber rows for B_2/B_3 are in `%TEMP%/a7/runs/B_*_perf.json`.) Layout reads in per-frame paths (code inspection): before, the Follow subscriber did `scrollLeft = target` then read `scroller.scrollLeft` (write→read); now removed. No other per-frame `getBoundingClientRect`/`offsetWidth`/`clientWidth`/`scrollLeft` read in tick/subscribers/step.

Play click (5 clicks, `playclick.js`; "with React" = click + the React microtask flush; no click frame produced a LoAF > 50 ms except before #3 = 57 ms):

| | values (ms) | median | CPU med/max |
|---|---|---|---|
| Before | 34.9, 17.6, 40.6, 15.2, 22.1 | **22.1** | ~31 % (first sampler run) |
| After | 38.3, 11.8, 8.9, 9.6, 10.8 | **10.8** | 17 / 44 % |

The first click after a fresh setup is ~35–38 ms in both cases (cold). C measures the LoAF app-script duration; mine is a click+flush wall time, so it is a proxy for RF7-P2's browser criterion.

### 4.3 What changed and why

- (b/main) React per-frame renders removed: playhead line, ruler playhead (incl. aria), transport time, video gap time → `useArrangementPositionWriter` (direct DOM). Video caption → snapshot of source id (renders only on change). Measured effect: tick+microtasks p50 2.0 → 0.7–0.8 ms, p95 3.5–4.2 → 1.1–1.5 ms.
- (a) Follow: removed the `scrollLeft` read after write. Kept `left` (not `transform`): measured forced layout 0; C's `c6.js`/`loopplay.js` and `view.test.ts:415` read `style.left`.
- (c) Overview: no `setVisibleStart` on scroll (aria written directly).
- RF7-P2: memo ruler ticks and library rows.
- Not changed: `video-sync.ts`, dock `step` (p50 ≤ 0.3 ms; no measured justification), so RF6-1 is not an adjacent regression for this round.

### 4.4 A's own RF7-2/RF7-3 runs (budget: 3 valid per layout)

- R3-V1: before 3/3 PASS, after 3/3 PASS (0 invalid, 0 replacements). Worst after run A_1: raw/ex max 0.086 s, CPU 19/39 %, app LoAF ≥ 10 ms: 0.
- R2-V3 (after the fix, `v3lay.js`, 6 s, 3 valid runs, 0 invalid): V3_1 PASS (max .020), **V3_2 FAIL** (raw = ex max **0.1203 s**, 0 stalls, app LoAF ≥ 10 ms: 0, forced layout 0, CPU 28/36 %), V3_3 PASS (max .066, CPU 30/67 %). Swaps at 0.50–0.53 / 1.00–1.01. The FAIL is a valid run and counts; its cause was not investigated within the budget (no app-attributed LoAF in it). A has no before-fix R2-V3 runs (C round 6: 5/5 PASS).
- RF7-3 (after the fix): setup + R3-V1 + `looplay.js`, then 5 L6 loop runs (L6_1..5 all PASS; first-run first 3 wraps vt 2.297/2.296/2.294 ∈ [2.29, 2.31]; note L6_3 had 2.278 on wraps 1–2 — setup run, outside the verdict rule, recorded honestly), then 3 × (fresh setup + R3-V1 + `rf43.js`):
  - F_1: `play()` −0.01 s (window ≥ −0.02), w1 0.040, w2 0.037; `hold:false` with the only not-paused pre row at −0.01 = the `play()` itself and preMaxAbsVt 0.0016 → C's F2_3 harness-artifact rule;
  - F_2: PASS, play +0.0007, w1 0.048, w2 0.047;
  - F_3: PASS, play +0.0007, w1 0.044, w2 0.051.
  - C's F_1..3 failure (`plays:[]`, video not started within 300 ms) **did not reproduce** in 3 attempts. No code change was made for it.

## 5. Tests

New:
- `render-budget.test.tsx` (3; the arrangement has a video clip at 2–3 s so the gap caption mounts; mount > 0 asserted for every watched component, incl. `ArrangementVideoGapCaption`, whose text follows the frames; test 3 also checks the gap caption hides inside the clip and shows the seek time in a gap): (1) RF7-P2 — real `StudioWorkspace`: `ArrangementClipViewInner`, `ArrangementOverviewInner`, `ArrangementLibraryOptionInner`, `ArrangementRulerTicksInner` render **0** over Play→Pause→Play (incl. 260 ms after each Play so the hold/transport-running re-render is included), while positive controls `ArrangementTransport`, `ArrangementRuler`, `ArrangementLibrary`, `ArrangementLane` do re-render (proves the counter sees renders); (2) RF7-U — playback frames move playhead line / ruler handle / aria / transport text with 0 renders of the position consumers and the 4 lists (positive control: unowned `LibraryPlayheadText` > 0); (3) seek while stopped and zoom change update the writers. Counter = minimal `__REACT_DEVTOOLS_GLOBAL_HOOK__` in `vi.hoisted` (props/state identity per fiber); mount counts > 0 asserted.
- `gesture-guard.test.tsx` (+8, R30-U): R30-1 order; R30-2 normal drag + undo; R26-2 order (clip first → slider refused, snap-back + status); blur mid-drag abort; window-blur abort + window-only release commits; after review: another slider blurring as a drag starts keeps the drag (H1), pointercancel reverts with no entry (M2), a keyboard preview pending during a clip drag is written before the move with the right undo order (M4).
- `view.test.ts` (+7, R10-N5-U): C's two cases (`0:30` at 30 s/40 px/s, `5:30` at 335 s/2.48 px/s dropped) + it.each 6 zooms: every visible label end ≤ ruler width, labels ≥ 40 px apart and wider than the previous label.

Changed existing tests: none (only additions to the two files). The round-6 test `refuses Mute, Solo and Volume during a gesture` still passes unchanged.

R30-U fails on the old code: I temporarily restored the round-6 lane slider handlers (`onPointerUp/onKeyUp/onBlur={commitTrackVolume}`, no `onPointerDown`) and removed the new `commitTrackVolume` guard (backup copies in `%TEMP%/a7/bak`, restored byte-for-byte afterwards, no git stash/checkout). Result `%TEMP%/a7/a7-r30-before.txt`: **3 failed | 13 passed** — R30-1 (`expected false to be true`: slider never claimed), blur abort (`expected 0.3 to be 1`), window-blur abort (`expected 0.6 to be 1`). R30-2 and the R26-2 order pass on both (they preserve behaviour). RF7-P2 cannot be run on the old code (the memo row/tick components did not exist; the ticks were inline in `ArrangementRuler`, which the test shows re-renders on Play).

Browser (A, synthetic pointers `buttons:1`, 1440×900): `volchk.js` — R30-1 order: clip stays at 0, one `Undo: Volume` at slider release, Mute works afterwards, 2× Ctrl+Z → volume 1; R30-2: one entry 0.3, Ctrl+Z → 1. S2 `n5chk.js` at 1280×720 and 1440×900: empty default (beyond 1 px), empty Fit (1 px), Fit after Ctrl+D ×2 / end 05:04.056 (0.3 px / 0 px); min label gap 40 / 74.4 / 45.1 px; 0 overlap; 0 cut; overview extent 304.056.

## 6. code-reviewer (actual subagent, one run on the full round-7 diff)

Reviewer summary: "Score: 7/10. The S1, RF7-P2 and S2 changes are solid. The score is held back by H1, which breaks the D-30 guarantee in a common real-browser sequence that jsdom can't reproduce." Critical: none. Confirmed clean: no double commit on slider pointerup, no registry count leak, no stale closures, React does not overwrite the manual DOM writes, pxPerSecond change handled, TS/Biome/tokens OK.

| # | Finding | Action |
|---|---|---|
| H1 | blur of slider A (focus moving to B on pointerdown) cancelled B's gesture | **Fixed**: track-scoped `blurTrackVolume(trackId)` and `commitTrackVolume(trackId?)`; test added |
| M1 | provider unmount mid-gesture left window listeners | **Fixed**: unmount cleanup releases the volume gesture and the active registry gesture |
| M2 | touch pointercancel → lostpointercapture committed a partial value | **Fixed**: window `pointercancel` of the claiming pointer reverts (D-26 abort semantics); test added |
| M3 | position-consumer zero counts could be vacuous; gap caption untested | **Fixed**: mount > 0 checks; video clip + gap caption assertions |
| M4 | pending keyboard Volume during another gesture untested | **Fixed**: test added |
| L1 | useLayoutEffect SSR warning; playhead line at x=0 before hydration | **Fixed**: isomorphic layout effect; initial `style.left` on the playhead line |
| L2 | label offset 4 vs real 5 px | **Fixed**: `RULER_LABEL_OFFSET_PX = 5` |
| L3 | test asserted gap > label width, which `rulerTickStep` does not guarantee ("10:00" at 4 px/s) | Assertion narrowed to ≥ 40 px; **open note for B** (pre-existing step rule; real label ≈ 39.5 px, so no visible overlap expected) |
| L4 | it.each re-uses the 8 px estimate | Kept; concrete-value test + browser check are the real evidence |
| L5 | refused slider drag jitters | **Not applied**: `preventDefault` on pointerdown would suppress `onChange` and the required refusal status (D-30: snap-back and status stay) |
| L6 | refs read/written during render | Kept (correct in sync mode); note |
| L7 | magic 224 in the test | **Fixed**: imports `ARRANGEMENT_HEADER_WIDTH_PX` |
| L8 | Follow stores the unclamped target | Kept; reviewer traced it as negligible |

After the fixes: tsc 0, 779/779, build OK, biome 0; S2 and S3 browser checks re-run with identical results. The reviewer was not re-run on the fix delta.

## 7. Deviations

- No `transform` for the playhead (kept `left`): measured forced layout 0; harness/test contract reads `style.left`.
- D-30 "change" end: no native `change` listener; release is caught by the slider `pointerup` and by a window capture `pointerup` for the claiming pointer (always precedes `change`).
- Keyboard Volume: unchanged single commits; a keyboard preview pending when another gesture starts is no longer committed mid-gesture — it is flushed by the next commit/undo/redo (`flushPendingVolume`).
- R2-V3 drift not run by A.
- Remaining per-frame React consumer `LibraryPlayheadText` (`ArrangementLibraryPreview.tsx`, not owned this round).
- Post-hold `isTransportRunning` flip still re-renders `useArrangement()` consumers (not the 4 lists). Not changed (would need a context split).

## 8. "Not ready" / not verified by A (per item)

- **S1:** RF7-P1, RF7-P2 (browser half), RF7-2, RF7-3, RF7-U — implemented, pending C. **RF7-2 is not ready on A's own evidence: R2-V3 run V3_2 FAILED (0.1203 s, no app LoAF).** C-R6-02 stays open unless C's runs pass. The cause of C's 16–58 ms LoAFs on a 100 %-CPU machine is still only partly explained (React microtask render was the measurable app part); quiet-Chrome Tech Lead run still required.
- **S2:** R10-N5r, R10-N5-U — pending C. Fit on 4 and 20 minutes (other R10-N5 parts) not re-run by A.
- **S3:** R30-1, R30-2, R30-U — pending C. Real-mouse / real multi-touch / real focus order (the H1 path) not tested in a real browser; only jsdom and synthetic events.
- **Docs:** R7-D1 — pending C.
- Adjacent regressions not run by A: R10-N6, R4-M2 (MutationObserver), R10-N1/N3/N8, R26-1..3 in the browser, R27-1, R3-V3/R5-B1r. RF6-1 not applicable (dock `step`/`video-sync.ts` unchanged).

## 9. Exact next C checks

1. G7-2 first: `git status`, hashes, `git diff Header.tsx` empty, `position-store.ts` unchanged.
2. RF7-P2 browser: 5 Play clicks, LoAF app-script duration of the click frame + CPU.
3. RF7-2: R3-V1 ×3 and R2-V3 ×3 (light harness), LoAF `forcedStyleAndLayoutDuration` per app script (RF7-P1 from the same runs). Note C's current `rf5.js` LoAF collector does not record `forcedStyleAndLayoutDuration` — extend it (A's `%TEMP%/a7/perfon.js` shows how).
4. RF7-3: 5 L6 loops → fresh Play ×3.
5. R10-N5r at 1280/1440 (C's n5o/n5o2 + empty project default/Fit), plus Fit 4/20 min.
6. R30-1 with a real slider pointerdown (`buttons:1`) before pointer 7; R30-2; R26-2/R26-1/R26-3.
7. R4-M2: per-frame mutations now include `aria-valuenow`/`aria-valuetext` attribute writes on the ruler handle and text-node writes in `arrangement-position` / gap caption (all position consumers).
8. R10-N6, R27-1, R10-N1/N3/N8.
9. G7-3 anonymous network.

## 10. Root/B follow-ups carried (root-pre-push-review / publication-checkpoint)

- Purchased `/studio/:product` loader hardcodes middle-east (SRW-21); Lenis on `/studio/*` purchased route (protected); instruction-file portable paths.
- checkpoint-r6-review #6 stale scrub, #7 marquee `buttons`, #10 = C-R6-01 (addressed this round, pending C).
- Root review Low: L2 `holdUntil` on reschedule, L3 Delete `event.repeat`, L7 unbounded history.
- Scrollbar/library user requests and T12 Gain/Volume remain scheduled; SRW-11B = round 8.

## 11. Re-verification after session restart (2026-10-09 16:05)

A new A session (watchdog restart during the final advisor check) made no code changes. It re-ran: `npx tsc --noEmit` → exit 0; `npx vitest run` → Test Files 50 passed (50) · Tests 779 passed (779); `npx biome check app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement` → Checked 48 files, no fixes applied, 0 errors; `npx biome check ./app` → 314 files, 218 warnings, 1 info, 0 errors; `npm run build` → built in 2.47s; protected hashes 4/4 OK; `git diff Header.tsx` empty; `position-store.ts`, `video-sync.ts`, `types/arrangement.ts` unchanged. `git status` = the 14 modified + 2 untracked files listed in §2.
