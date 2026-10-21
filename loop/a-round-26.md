# A — Round 26 report (SRW-13 stage 2a: live Master meter, peak hold, latched Master Peak/Clip; R26-X)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-11 · Status: implementation done; awaiting C. No PASS claimed.

## 0. Baseline check (before any edit)

- `sha256sum -c ../tmp/studio-real-loop/b-round-25-tree-sha256.txt` → **57 OK**, 0 FAILED.
- `git status --short` → **54 lines**, `diff` against `c-round-25/gates/git-status-end.txt` → identical.
- HEAD `c5ed47b`.
- Snapshot shas of the four owned files match B's table exactly: graph.client `63f1fdf9…`, ArrangementContext `2ec43d1a…`, ArrangementMaster `d6548d21…`, ArrangementExportDialog `dda9f265…`. No difference to report.
- No partial A round-26 edits existed (`a-round-26-result.json` was empty; no meter files).

## 1. Pre-flight gate

Primitives read: `read-primitives.md`, AUDIO_ARCHITECTURE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, REACT_CONTEXT, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, `prompts/studio-feature.md`, `skills/pre-flight/SKILL.md`.

- **Assumptions:**
  - The meter measures the post-master-gain signal via a fan-out `master.connect(tap)`; the export (offline) gets no tap and stays bit-for-bit the same pipeline.
  - "Over" uses exactly the export predicate (`x > MAX_24BIT_SAMPLE || x < −1`), moved to `meter.ts`; `graph.client.ts` imports it (no cycle).
  - Only the latch flag drives a React render (boolean `useSyncExternalStore` snapshot) in a plain named sub-component; level, hold, max-peak text, `data-*` and `aria-label` are DOM writes from a store subscription.
  - Frozen tests' fake `AudioContext` has no `createAnalyser`; the guard keeps them green unchanged.
- **Smallest version:** `meter.ts` (~120 lines pure), graph `tap` (~3 lines), context analyser/sampling/floor/reset/meter context (~70 lines), Master sub-component (~90 lines), dialog one condition.
- **Cut list:** no RMS/LUFS, no per-track meters (stage 2b), no visible "Clip" text label (contract: button text = `formatPeakDbfs`), no 10 Hz text throttle, no CSS transitions on the meter.
- **Files:** exactly §3.2 — `meter.ts` (new pure module), `graph.client.ts` (tap + shared predicate), `ArrangementContext.tsx` (analyser/sampling/store/reset), `ArrangementMaster.tsx` (meter + Peak button), `ArrangementExportDialog.tsx` (R26-X), two new test files, doc 032.
- **Success:** `npx vitest run …meter.test.ts …meter-ui.test.tsx` green (≥14 new `it`), frozen six green unchanged, `tsc` 0, full vitest 1045 + new, build OK, Biome 0 errors (warnings ≤ 218 + 1 info), git status 58 lines, 57 OK.

### Design-philosopher (read-only, run once) — advice and dispositions

| Advice | Disposition |
|---|---|
| Bar `h-1.5 w-20`, `rounded-full bg-outline/60`; static zone layer (positive −60..−6, warning −6..0, destructive 0..+6) revealed by a moving `bg-surface` cover written as one `scaleX` per frame | **Adopted.** Zones are flex segments with ratio 9:1:1 (54:6:6 dB) instead of arbitrary `left-[%]` values. |
| 0 dBFS mark: 1 px `bg-foreground/70`, protruding 2 px | **Adopted without the protrusion**: an overlay flex row (10:1) with a `border-l border-foreground/70` on the 0..+6 segment, above the cover. Protrusion would need overflow outside the bar; not worth it in a 35 px header. |
| Peak-hold tick `w-0.5 bg-foreground`, moved by `translateX` | **Adopted**, moved as a full-width wrapper translated by a percentage (no width measurement). The `data-over` tick colour is skipped (the tick already sits in the red zone above 0). |
| Peak button: `h-5 rounded-sm border text-xs tabular-nums`, clear `border-outline text-muted`, over **destructive** (`border-destructive bg-destructive/15 text-destructive font-medium`), not accent (accent = Master Mute on) | **Adopted.** |
| Visible "Clip" label in the button | **Declined**: §2.4 fixes the visible text to `formatPeakDbfs(...)`; C's R26-C0 reads it. The non-colour cues are the `+` sign and the accessible name `… გადატვირთვა (Clip) …`. |
| Throttle the Peak text to ~10 Hz | **Declined**: the text is the monotonic max since reset (rarely changes) and C samples per rAF. |
| No `animate-pulse`, no transitions on meter transforms, fixed width/tabular-nums, header ≤ 20 px elements | **Adopted.** |

## 2. Red first, then green

**Red in `store/` against unchanged sources** (`a-round-26/red-in-store.txt`):
- `meter-ui.test.tsx`: **10/10 failed**. Examples: `Unable to find an element by: [data-testid="arrangement-master-meter"]`; `Unable to find … role "button" and name /^Master Peak /`; R26-X `expected <p …> to be null`.
- `meter.test.ts`: the file failed to load: `Failed to resolve import "../meter"`. This is expected, because the module did not exist yet.

**Behavioural red in a scratch copy** (`a-round-26/red-scratch.txt`, `red-scratch-meter-2.txt`):
- For the red run, `../tmp/studio-real-loop/a-round-26/scratch/` held a copy of `app/` and the configs, taken before any source edit. **The directory now holds the final sources**: I replaced `scratch/app` with them for the two review mutation runs (`mut-mono.txt`, `mut-reset-fresh.txt`), restoring the original file after each mutation.
  - Context sha `2ec43d1a` and graph sha `63f1fdf9` (the snapshot shas) were verified.
  - The only addition is a stub `meter.ts`. It exports the right names with trivially wrong bodies.
  - `node_modules` is a junction (link only).
- Result: **24 failed / 25**.
- The one green is "connects the offline master only to the destination". It is a regression guard and is expected to be green on unchanged sources.
- The first scratch run exposed a fixture bug in my own test: `createArrangement` requires a video track. I fixed it in the test before implementing.
- **Not red-proved on the snapshot:** the 3 tests added after the review (stereo splitter, reschedule tap, frozen-clock reset). Instead, the two mutations they target were shown to fail in the scratch copy (§4).
- The junction was removed afterwards (link only). The store `node_modules` is intact.

**Green, final** (`a-round-26/green-new.txt`): `Test Files 2 passed (2)`, `Tests 27 passed (27)`. That is `meter.test.ts` 15 and `meter-ui.test.tsx` 12, so **27 new `it` blocks** (≥ 14 required).

**Frozen six** (`a-round-26/green-frozen6.txt`): `Test Files 6 passed (6)`, `Tests 101 passed (101)`. All six are unchanged (they are part of 57 OK).

### §2.6 coverage map
1. **Pure:**
   - the `isOverFullScale` cases, plus a check through `measureExportOverload`;
   - `measureBlock`: 1.2 → peak 1.2 and over; −1 → peak 1, not over; an empty block;
   - release at 20 dB/s down to the floor; the 1.5 s hold, then follow; the monotonic max; the latch survives about 300 quiet blocks and only reset clears it; the floor frame keeps max and latch;
   - `formatPeakDbfs`: `+5.0`, `+3.5`, `+0.0`, `−1.0`, `0.0`, `−∞` at 0 and at −60, `−12.0`;
   - the attribute formatter and the store.
2. **Graph:**
   - `[destination, tap]` with a tap and `[destination]` without;
   - the tap is fed only by the master;
   - the offline master connects only to the destination.
3. **Context and UI:**
   - a splitter(2) feeding 2 analysers (channels 0/1, `fftSize ≥ 4096`), passed as `tap` and the same after Pause/Play;
   - the same tap after a reschedule edit while playing;
   - a **right-only over** (L 0.3, R 1.2) → `+1.6`, over;
   - −12 dBFS → `-12.0`/`-12.0`, text `−12.0`, clear, exact label;
   - 1.5 → `+3.5`, over, kept through quiet frames and across Pause/Play;
   - a click → `−∞`, clear; the Undo label, arrangement, status and graph count are unchanged;
   - with the clock frozen at the click, the next frame stays clear; then the text rises to `−6.0`;
   - a stale buffer after reset while paused stays clear;
   - Pause → `-inf`/`-inf`, and the text is unchanged;
   - renders: 0/0 over 30 frames, **1** total on the latch, 0 over 20 frames after it, ≤ 1 on reset;
   - no `createAnalyser` → Play works and the meter stays at the floor;
   - Tab order `Master Volume` < `Master Peak` < `Play`, and the meter is `aria-hidden`.
4. **R26-X:** both states.

## 3. Diff summary per file (`a-round-26/diff-*.txt`)

- **`meter.ts` (new):**
  - constants: `MAX_24BIT_SAMPLE`, floor −60, ceiling +6, release 20 dB/s, hold 1500 ms, `MASTER_METER_FFT_SIZE` 4096;
  - functions: `isOverFullScale`, `measureBlock`, `createMasterMeterState`, `stepMeter`, `floorMasterMeter`, `resetMasterMeterPeak`, `formatPeakDbfs`, `formatMeterDbAttribute`, `meterDbToFraction`, `createMasterMeterStore`.
- **`graph.client.ts`** (4 hunks):
  1. import the predicate and constant from `./meter`, and drop the local literal;
  2. `tap?: ScheduleAudioNode`;
  3. `if (options.tap) master.connect(options.tap)` after the unchanged `master.connect(ctx.destination)`;
  4. `measureExportOverload` uses `isOverFullScale`.
  
  The clamp is unchanged. `renderArrangementWav` passes no tap.
- **`ArrangementContext.tsx`:**
  - the imports;
  - `resetMasterPeak` in the interface, `value` and deps;
  - `ArrangementMeterContext`;
  - `createMasterMeterTap` (guard + try/catch; a splitter(2) and one analyser per channel);
  - the meter store and refs;
  - `startGraph` passes `tap: meterTapRef.current?.input`;
  - the floor frame in `stopPlayback`;
  - `sampleMasterMeter`: both channels, only samples newer than `meterFreshFromRef`, combined with max/OR;
  - `resetMasterPeak`: refs and store only;
  - `tick` calls the sampler after `pumpPlaybackAudio()`;
  - `ensureAudioContext` creates the tap once per context;
  - `togglePlayback` sets `meterFreshFromRef = startAt`;
  - unmount nulls the tap and the blocks;
  - the provider, and `useMasterMeterStore`/`useMasterMeterWriter`.
  
  There is no change to the video, dock, scheduler, loop or transport logic. `scheduleKey` is unchanged.
- **`ArrangementMaster.tsx`:**
  - a plain named `ArrangementMasterMeter`:
    - zones 9:1:1 under a `bg-outline` cover (`scaleX`), the 0 dBFS mark and the hold tick (`translateX`);
    - the `Master Peak` button.
  - The latch is a `useSyncExternalStore` boolean. Everything else is DOM writes. The label and text are rewritten only on change.
  - No JSX `style`, tokens only.
- **`ArrangementExportDialog.tsx`:** the one condition `gainDb !== 0 && !master.mute`.
- **Doc 032** (new, Georgian).

## 4. code-reviewer (actual subagent run) — findings and dispositions

| # | Finding | Disposition |
|---|---|---|
| H1 | `AnalyserNode` mixes its input down to mono, so a one-channel over would not latch. The live meter and the export would disagree. | **Fixed.** The tap is a `ChannelSplitterNode(2)` with an analyser per channel, combined with max/OR. New test: right-only over. Scratch mutation (channel 0 only) → it fails (`a-round-26/mut-mono.txt`). |
| M1 | rAF-only sampling misses samples when frames are more than ~85 ms apart (hidden tab, stall). | **Not changed; known gap.** §2.7 accepts that a hidden tab stops the meter. 32768 × 2 per frame would add copy cost on `tick`. A gap-free Clip (AudioWorklet) is for B to schedule. |
| M2a | No test for a reschedule keeping the tap. | **Fixed:** new test. |
| M2b | The reset test could not catch a missing `meterFreshFromRef` update. | **Fixed:** frozen fake clock. Scratch mutation (remove the update) → it fails (`a-round-26/mut-reset-fresh.txt`). |
| M2c | No unmount-unsubscribe test. | **Not added; gap.** The writer uses the same cleanup pattern as the frozen position writer. |
| L1 | `[...listeners]` copy on every publish. | **Kept:** it matches `position-store.ts` and is safe if a listener unsubscribes during dispatch. |
| L2 | The label string is built every frame. | **Fixed** (`writtenPeakRef`). |
| L3 | The render reads the store outside `useSyncExternalStore`. | **Kept:** the writer reconciles from the same store; documented in doc 032. |
| L4 | Wrap the sub-component in `memo`. | **Declined:** the frozen fiber counter matches on `type.name`, and the component never renders per frame. |

The reviewer found no banned patterns.

## 5. Command tails (actually run, after the review fixes)

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-25-tree-sha256.txt     → 57 OK, 0 FAILED
$ npx vitest run …/meter.test.ts …/meter-ui.test.tsx                → Test Files 2 passed (2) · Tests 27 passed (27)
$ npx vitest run <frozen six>                                         → Test Files 6 passed (6) · Tests 101 passed (101)
$ npx tsc --noEmit                                                   → exit 0
$ npx vitest run                                                     → Test Files 61 passed (61) · Tests 1072 passed (1072)  (= 1045 + 27; no sfx flake)
$ npm run build                                                      → exit 0
$ npx biome check ./app                                              → exit 0; 329 files; 218 warnings; 1 info (= round 25)
$ npx biome check <6 owned code/test files>                          → No fixes applied, 0 warnings
$ git status --short                                                 → 58 lines = 54 baseline + the 4 expected ?? lines
$ git diff --stat cc1e531 -- app/components/layout/Header.tsx        → 1 file changed, 21 insertions(+)
$ protected-baseline check                                           → 4 × OK
```

- `biome check --write` ran only on the 7 owned code/test files. It made import-order and format fixes, all inside my hunks.
- Owned sha256 (first 12): `meter.ts` ed52f465d0d3 · `graph.client.ts` ff6c7d2e792d · `ArrangementContext.tsx` 32108f2826e7 · `ArrangementMaster.tsx` 0de72e4f0b8d · `ArrangementExportDialog.tsx` 89bc8e064247 · `meter.test.ts` fcdbd91c73be · `meter-ui.test.tsx` afef97450c13.
- Doc 032 was patched afterwards; C should re-hash it.

### Browser smoke (not a PASS claim; pre-review build)

I used gstack browse with `a-browse.json` on `:5173` `/studio-lab`:
- At 1440, the header is **35 px**, the meter is 80 px, and Peak shows `−∞` (54/54 px, no clipping).
- I added `სრული მიქსი` and pressed Play: `data-level-db` read `-4.7` → `-8.3` with the hold at `-4.7`, and the text was `−4.7`. **The meter moves.**
- A Peak click during playback restarted the measurement (`−5.2`, then `−4.9`).
- Pause → `-inf`/`-inf`, and the text stayed.
- The Undo title did not change.
- At 1280, the header is 35 px.
- A click while paused → `−∞`, `clear`.
- No console errors.
- Screenshots: `a-round-26/header-1440-playing.png`, `a-round-26/header-1280-paused.png`.
- **Re-smoke after the splitter change** (current build, 1440): fresh `goto`, then I added `სრული მიქსი` and pressed real Play.
  - Reads: `["-6.6","-5.6","−5.6","clear",35]`, then `["-8.7","-4.7","−4.7","clear",35]`.
  - Pause → `["-inf","-inf","−4.7","clear",35]`.
  - So the splitter → 2 analysers path is pulled by real Chrome, and the header stays 35 px.
  - `console --errors` shows only the root `CartContext` `GET /api/cart` `ERR_CONNECTION_REFUSED` (the backend is not running). This is the known, allowed item, not workspace code.

## 6. Deviations

1. **The tap is a `ChannelSplitterNode(2)` with 2 analysers,** not a single analyser (code-reviewer H1, mono down-mix). The graph contract is unchanged: one optional `tap` fan-out from the master. `fftSize` is 4096 per channel, and the code uses `getFloatTimeDomainData` only.
2. **Stale-buffer guard `meterFreshFromRef`** (not in the spec). It measures only samples after the Play `startAt` or after the reset time. Right after a reset during playback, the trailing ≤ 85 ms of already-heard audio is ignored.
3. **The latch render lands on `ArrangementMasterMeter`.** `ArrangementMaster` renders 0 times; the total is 1, within "at most one".
4. **The design-philosopher's visible "Clip" label was declined.** §2.4 fixes the button text.
5. **`resetMasterPeak` is in the main value** (it is stable). The store is in a separate context.

## 7. Known gaps / not verified by A

- **Not measured by A** (all live/browser oracles are C's):
  - R26-ML/MP/C0/C6/CR/CM numbers vs the tap;
  - the hold timing in the browser;
  - R26-E export, R26-RB browser renders and drift;
  - R26-K Tab/Enter/Space in the browser;
  - R26-L geometry (`lay11`, `+12.3`);
  - G26-3, and the C-R23-01 record.
- The browser re-smoke after the splitter change covered only "the meter moves, Pause floors, 35 px"; no live dB oracle.
- **M1 rAF-gap sampling:** a stall over ~85 ms can miss an over. A hidden tab stops the meter.
- **M2c:** no unmount-unsubscribe test.
- **Edge cases, by reasoning plus tests:**
  - Mute while over: the level falls 20 dB/s to the floor, there is no new latch, and the latch stays.
  - Reset during playback: tested.
  - Reschedule: same tap, tested.
  - Loop wrap: `appendPlan` keeps the same graph and tap.
  - No analyser: tested.
  - Unmount: `tick` is cancelled, the tap ref is nulled and the context is closed.
  - Hidden tab: sampling stops.

## 8. Scope completed / B acceptance

- **Done (A side), within §3.2 ownership:** §2.1–§2.6, doc 032, and the code-reviewer run with dispositions.
- **B criteria A truly passed (gates only):** **G26-1** (tsc 0; vitest 1072 = 1045 + 27; build; Biome 0 errors, 218 + 1 info; the frozen six green and unchanged) and **G26-2** (protected 4/4, 57 OK, 58 lines, Header identical).
- **Every user-facing R26-* ID is C's. A claims no PASS.**

## 9. Exact next C checks

1. G26-2, and re-hash doc 032.
2. R26-S diffs vs `b-round-25-snapshots/`:
   - the tap is a splitter with 2 analysers (deviation 1);
   - grep for no `getByteTimeDomainData`, `limiter`, `normalize` or `compress` in the code;
   - no hardcoded colours.
3. R26-U mutations in a scratch copy:
   - (a) the latch clears on quiet → `meter.test.ts` latch test;
   - (b) the tap from a panner → "fed only by master";
   - (c) no floor frame → "Pause writes the floor frame";
   - (d) `>=` MAX → the `isOverFullScale(MAX_24BIT_SAMPLE)` case.
4. R26-ML/MP/C0/C6/CR/CM with `lay11` and the round-22 tap:
   - read `fftSize` (4096) and `sampleRate` from the page;
   - the meter now uses the **per-channel** max.
5. R26-RB, R26-E, R26-X, R26-K, R26-L, R26-R, G26-3, and the C-R23-01 record including the `Master Peak` label code points.

## 10. Carried items (for B/C follow-up)

- **Open C bugs:**
  - C-R23-01 (awaits the Tech Lead: React 19 or an `entry.server.tsx` grant; the offsets will move again this round);
  - C-R6-02 and C-R8-01 (quiet Chrome).
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - SRW-21 middle-east loader;
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip, now visible live (the clamp stays, no limiter);
  - the final commit/push of the uncommitted round-6..26 tree;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - the two foreign agent files;
  - A round-17 dev 4, round-19 dev 5, round-22 dev 4, and C's python probes in rounds 21–22;
  - the fake Bearer gets 500;
  - the CDP `Input.dispatchMouseEvent` deny;
  - the publication-checkpoint requirements;
  - `Content-Type` without a charset.
- **New Tech Lead item: R26-T** (real Chrome + speakers on `lay11`: Clip lights in 4–6 s at 0 dB and not at −6 dB).
- **New for B:** M1 (AudioWorklet if a gap-free Clip is required) and M2c.

Nothing was committed, pushed or deployed. No installs. No server was started or stopped.
