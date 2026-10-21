# CURRENT TASK — Round 27: SRW-13 stage 2b — live per-track meters in the lane headers, with a latched over-0 warning per track (T12.20/T12.22; D-29r)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

## Why this round

**C bugs first.** C round 26 (`c-round-26.md`) is a **PASS** with no new bug in scope. The only open C bugs are:
- **C-R23-01** (Medium, SSR NUL bytes in `/studio-lab`): still open. It is now 4 NUL at 28013/28014 (visible `Arrangement · ` text) and 44397/44398 (music lane `aria-label`). The header badge and library text are clean only because the offsets **moved again**. This is not a fix. The fix still needs the Tech Lead's choice: (a) React 19, or (b) a narrow `app/entry.server.tsx` grant to A (oracle: `b-round-23.md` §3). B cannot grant either. As soon as the answer exists, it is scheduled **before** the next feature round.
- **C-R6-02 and C-R8-01**: they need the Tech Lead's quiet-Chrome run.

None of these is critical, security or data loss, so under the workflow policy they do not stop independent work.

**Round 26 result:** C **PASS**:
- PASS IDs: R26-ML/MP/C0/C6/CR/CM/RB/X/E/K/L/R/S/U/Doc, G26-1..3;
- vitest 1072/1072.

B re-checked the end state:
- HEAD `c5ed47b`;
- 58 status lines, identical to `c-round-26/gates/git-status-end.txt`;
- 57 OK on `b-round-25-tree-sha256.txt`;
- the 8 owned shas equal C's record;
- live curl `/studio-lab`: NUL 4 at the same offsets.

FB-14 is now complete at the Master: Volume, Mute, the export overload warning, the live meter and the latched Clip. Only the Tech Lead's manual R25-T and R26-T remain.

**So this round** continues SRW-13 in dependency order with **stage 2b**: a live **meter for every track** in its lane header. It reuses `meter.ts`, adds a latched **over-0 warning** per track (T12.20 "Peak Level + clipping indication", T12.22 "track > 0 dBFS is a warning") and keeps the lane geometry exactly as it is. This completes the meter part of SRW-13 ("per-track and master level meters with clip indicator").

**Scheduled, not dropped:**
- Stage 3: FB-04 clip gain (R13-M1).
- Stage 4: FB-05 pan (R13-M2), the fader-click UX for all faders, the round-9 reviewer's context items M1/L8, and the Master hold tick that shows only 1 px at +6 dBFS or more (C round 26 §9; `ArrangementMaster.tsx` stays frozen this round).

**Previous round:** archived as `tmp/studio-real-loop/tasks/round-26.md` (sha `49b7f26d…`, identical to the dispatched task).

**References:**
- B's record: `b-round-26.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-29r).
- Target: `next-stage-t12/gain-volume-source.txt` T12.20 (a realtime track meter on the Track Volume output stage, with Peak Level and a clipping indication), T12.22 (a track over 0 dBFS is a warning, not destructive clipping; Main Output clipping is the real problem) and T12.23 (the indicator stays until the user resets it). T12 itself is **not** started; RMS/LUFS are not in this round.
- Backlog: `backlog.json` SRW-13 stage 2b.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline:** HEAD `c5ed47b` plus the round-6..26 dirty tree.
- `git status --short` has **58 lines**, identical to `c-round-26/gates/git-status-end.txt`. B's copy is `b-round-26-git-status.txt`.
- Frozen for this round: `../tmp/studio-real-loop/b-round-26-tree-sha256.txt`, **60 files**. That is round 25's 57 files minus `ArrangementLane.tsx` (A owns it now), plus four round-26 files: `ArrangementMaster.tsx`, `ArrangementExportDialog.tsx`, `meter.test.ts` and doc 032. B verified **60 OK** on the live tree.
- Dispatch snapshots of A's five existing files are in `../tmp/studio-real-loop/b-round-26-snapshots/`:

  | File | sha256 |
  |---|---|
  | `app/lib/arrangement/meter.ts` | `ed52f465…` |
  | `app/lib/arrangement/graph.client.ts` | `ff6c7d2e…` |
  | `app/contexts/ArrangementContext.tsx` | `32108f28…` |
  | `app/components/arrangement/ArrangementLane.tsx` | `cdaf07f4…` |
  | `app/lib/arrangement/__tests__/meter-ui.test.tsx` | `afef9745…` (narrow amendment only, §2.6) |

- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any file in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit or delete them.
- Nobody commits in this round.

## 0. Scope

**In (A):**
- the track meter store in `meter.ts` (§2.1);
- per-track graph taps (§2.2);
- the per-track analysers, sampling, floor and reset in the context (§2.3);
- a new `ArrangementTrackMeter` component and its placement in the lane header (§2.4);
- red-first tests in **two new** test files, plus the narrow count amendment in `meter-ui.test.tsx` (§2.6);
- implementation doc 033.

**In (C):** R27-TL, R27-TI, R27-TM, R27-TV, R27-TW, R27-TO, R27-TR, R27-TF, R27-RB, R27-E, R27-K, R27-L, R27-R, R27-S, R27-U, R27-Doc, G27-1..3 and the C-R23-01 information record (§4).

**Not in this round** (scheduled; not PASS):
- **SRW-13 stage 3:** FB-04 clip gain (R13-M1).
- **SRW-13 stage 4:** FB-05 pan (R13-M2), the fader-click UX for all faders (C round 22 §5; the 4 px fader box from C round 25), the round-9 reviewer's context items M1/L8, and the Master hold tick at ≥ +6 dBFS (C round 26 §9).
- **R26-M1** (Low): rAF-only sampling can miss an over during a stall over ~85 ms or in a hidden tab. A gap-free path (AudioWorklet) needs a module URL, and `public/**` is forbidden. This is a hardening item for the Tech Lead/B after stage 4, not this round. Track meters use the same sampling and inherit the same limit (say so in doc 033).
- **C-R23-01:** awaits the Tech Lead (above).
- **LIB-SEP-REASON** (`ArrangementLibrary.tsx:549`): the first round that edits that file, at the latest the fix round before the final regression.
- **Other later items:** the lane overlay `/60` (SRW-14 or SRW-18); the footer selected-clip Latin text; the Latin `range` in the group hint; folded clips in the accessibility tree (SRW-17).
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, L2/L3 (with C-R8-01), the demo `Soft impact` full-scale decision (§4.11) and the manual list in §4.11.

**Out of scope for the whole project:** plugins and effects (including a compressor or a limiter), pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch. A meter only **measures**; it never changes the signal. No RMS/LUFS meter in this round.

**What could be affected (C checks these):**
- **Live playback:** the master path and the Master meter/latch from round 26; track Volume/Mute/Solo; loop wraps; no extra reschedules.
- **The per-frame cost of `tick`:** this round reads **five** stereo taps instead of one (video sync history: C-R8-01/C-R6-02).
- **The export file:** it must not change. The offline render gets no tap.
- **The lane header geometry:** rows 81×4, 53/61/61/61, the scroller numbers and the floating video.
- **Keyboard:** the lane Tab order and the global keyboard.
- **Frozen tests:**
  - `render-budget.test.tsx` (`ArrangementLane` 0 renders per frame);
  - `track-layout.test.tsx`: the header `textContent` assertions at l.308/313, the header `style.height` at l.458 and `header.nextElementSibling` at l.991–992;
  - `meter-ui.test.tsx`: its exact tap counts, which are amended in §2.6;
  - `master-ui.test.tsx`, `ArrangementContext.test.ts` and every frozen test whose fake `AudioContext` has no `createAnalyser`.
- **Network:** the anonymous `/studio-lab` network policy.

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives: `AUDIO_ARCHITECTURE.md` (the real code is authoritative where its examples are older), `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `REACT_CONTEXT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`. Also read `prompts/studio-feature.md` and `prompts/new-component.md`, and run the `pre-flight` skill.

   Run the `design-philosopher` agent once, read-only, for the visual form of the track meter and its over cue. Its constraints:
   - tokens only;
   - **no new layout row** (§2.4);
   - the over cue must not be colour-only;
   - a track over uses a **warning** token, not `destructive` (T12.22: the Master Clip stays the clearly destructive one);
   - Georgian UI text with "Peak", "dBFS" and "Master Peak" kept in English (D-07).

   Report its advice and your dispositions.
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-26-tree-sha256.txt` and expect **60 OK**. Run `git status --short` and expect **58 lines**, identical to `c-round-26/gates/git-status-end.txt`. Compare your five existing files with the snapshot shas above. Report any difference **before** doing anything else, and do not "fix" it.
3. Read:
   - `meter.ts` (all of it), `graph.client.ts` (all of it);
   - `ArrangementContext.tsx`: l.300–330 (`createMasterMeterTap`), l.380–415 (refs and stores), l.608–740 (`startGraph`, `stopPlayback`, `sampleMasterMeter`, `resetMasterPeak`, `tick`), l.830–850 (`ensureAudioContext`), l.880–895 (`togglePlayback`), l.2250–2265 (unmount) and l.2450–2510 (providers and the meter hooks);
   - `ArrangementLane.tsx`: l.25–45 (densities) and l.395–517 (the header);
   - `ArrangementMaster.tsx` (read-only; the round-26 meter pattern to follow);
   - the frozen `render-budget.test.tsx` l.20–60 and l.225–345 (how renders are counted by `type.name`; `ArrangementLane` must stay 0 per frame);
   - `track-layout.test.tsx` l.220–236, 300–315, 450–460 and 985–995;
   - `graph.test.ts` l.100–145. It walks `outputs[0]`, so a track tap must be connected **after** `panner.connect(master)`;
   - `meter-ui.test.tsx` l.95–200 (its fake `AudioContext` with `createAnalyser`) and l.345–377.
4. **B's probes** (these decide the UI contract):
   - `render-budget.test.tsx` counts renders per component `type.name`. Its `CONTEXT_CONSUMERS` (including `ArrangementLane`) must stay **0** over 30 Play frames. Its fake `AudioContext` has no `createAnalyser`, so it exercises the inactive path.
   - `track-layout.test.tsx` has no assertion on the number of header buttons or children. It does assert:
     - the video header `textContent` contains, or does not contain, `ორიგინალი ხმა` (l.308/313);
     - the header `style.height` is `''` (l.458);
     - the lane body is `header.nextElementSibling` (l.991–992).

     So the meter must live **inside** the header, must not set an inline height on the header, and any screen-reader text must not contain `ორიგინალი ხმა` (use `track.name`, not `mixLabel`).
   - `meter-ui.test.tsx` asserts **exactly** 1 splitter and 2 analysers at l.348, 351, 362, 363 and 376. Per-track taps on the same `AudioContext` break these five lines and nothing else (the master is created first, so `analysers[0..1]` and `splitters[0]` stay the master's). That is why §2.6 grants a narrow amendment.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Track meter store (`meter.ts`)

- Do **not** rename or change any round-26 export (`createMasterMeterState`, `stepMeter`, `floorMasterMeter`, `resetMasterMeterPeak`, `formatPeakDbfs`, `isOverFullScale`, `createMasterMeterStore`, …). Round-26 tests and the frozen `ArrangementMaster.tsx` use them.
- Add a keyed store for track meters, for example `createTrackMeterStore()`. It needs:
  - per-track frames (`MasterMeterState`, or a type alias of it), stepped with the same `stepMeter`;
  - `getTrackMeterFrame(trackId)` and `getTrackMeterOver(trackId)`;
  - **one** publish per frame for all tracks;
  - subscribe/unsubscribe.

  Each track keeps **its own** state object, so one track's latch never leaks into another's.
- An unknown track id returns a floor frame (no throw).
- Pure helpers only; no Web Audio in `meter.ts`.

### 2.2 Per-track graph taps (`graph.client.ts`)

- `ApplyScheduleOptions` gets `trackTaps?: ReadonlyMap<string, ScheduleAudioNode>`.
  - For each track whose id has a tap, `applySchedule` calls `panner.connect(tap)` **after** the unchanged `panner.connect(master)`. So `panner.outputs` is `[master, tap]` and `outputs[0]` stays the master (frozen `graph.test.ts` l.108–117).
  - Tracks without a tap, and the whole call when `trackTaps` is absent, wire exactly as today.
- **Tap position: post-panner**, which is the track's output into the master. That is the "Track Volume output stage" of T12.20: it includes the track Volume, Mute and Solo gain, and from stage 4 it will include Pan. Do not tap after `trackGain` alone: that would silently become wrong once pan lands.
- `disconnect()` needs no new code, because `panner.disconnect()` already removes the tap connection.
- `renderArrangementWav` passes **no** `trackTaps`. The offline export is unchanged.
- No other graph change: no new node type inside the graph, and no change to the source, clip, track, panner, master or round-26 master-tap wiring.

### 2.3 Context (`ArrangementContext.tsx`)

**Taps:**
- **Per-track taps:** one stereo tap per track, built the same way as `createMasterMeterTap`: a `ChannelSplitterNode(2)` plus one `AnalyserNode` per channel, `fftSize` 4096, `getFloatTimeDomainData` only, and the same guard (missing `createAnalyser`/`createChannelSplitter`, or a throw → no track taps; Play unchanged; the meters stay at the floor).
  - The taps are created on the real `AudioContext` **after** the master tap (creation order matters for §2.6), once per track id per `AudioContext`, and reused by every graph. `startGraph` passes them as `trackTaps`.
  - If a track id has no tap yet when a graph starts, create it then. Tracks are a fixed set today, but do not assume it.
- **Release:** release them where the master tap is released (unmount and context close).

**Sampling:**
- Sampling happens in the existing `tick`, once per frame while playing, next to `sampleMasterMeter`:
  - read every track tap;
  - per track, combine both channels with max/OR, using only fresh samples (the same `meterFreshFromRef` guard as the master);
  - step that track's state;
  - publish **once** to the track store.
- No `setState` per frame.
- **Cost:** 5 stereo taps × 4096 floats per frame. Allocate the read buffers once per analyser (as the master does). No per-frame allocation.

**Stop and reset:**
- **On stop** (`stopPlayback`): publish one floor frame for **every** track, next to the master floor frame. Each track keeps its max peak and over latch.
- **Reset:** `resetMasterPeak()` (the existing name, used by the frozen `ArrangementMaster.tsx`) now clears the master latch **and every track's** max peak and latch. There is one reset point for all meters, so there are no new Tab stops. Document this in doc 033.
  - It is still **not** an arrangement edit: no `Arrangement` field, no history entry, no status text, and `scheduleKey` unchanged.
- **Renders:** a track's over latch transition may cause at most **one** React render, and only of that track's meter component. Everything else goes through the store.

**Exposure and limits:**
- Expose the track store through a **separate context** (like `ArrangementMeterContext`), with hooks such as `useTrackMeterStore()` and `useTrackMeterWriter(trackId, write)`. Do not put it in the main context value.
- No change to the video, dock, scheduler, loop, transport or Master-meter logic beyond the shared reset and the extra tap/sampling.

### 2.4 UI (`ArrangementTrackMeter.tsx`, new; placement in `ArrangementLane.tsx`)

**The component.** `ArrangementTrackMeter` is a plain named function component (the frozen fiber counters match on `type.name`). Its props are `trackId` and `trackName` only.
- It renders an `aria-hidden="true"` bar with `data-testid="arrangement-track-meter"`. The bar has:
  - the same −60..+6 dBFS scale and zones as the Master;
  - a visible 0 dBFS mark;
  - a peak-hold tick that stays **fully visible** at ≥ +6 dBFS. Do not repeat the round-26 Master 1 px edge case.
- The bar exposes, updated with every written frame (C's oracle hooks; part of the contract):
  - `data-level-db` and `data-hold-db`: one decimal, or `-inf` at the floor;
  - `data-peak`: `formatPeakDbfs(maxPeak, over)`;
  - `data-state`: `clear` or `over`.
- The `title` is a hover tooltip, rewritten only when the text changes:
  - when clear: `{trackName} · Peak {data-peak} dBFS`;
  - when over: `{trackName} · Peak {data-peak} dBFS — 0 dBFS-ს გადააჭარბა. გასასუფთავებლად დააჭირე Master Peak-ს`.
- **The over cue is not colour-only.** It uses a **warning** token, plus a visible shape change at the bar's end (for example an end cap that appears only when over; the design-philosopher's choice). It also renders an `sr-only` text `{trackName}: დონემ 0 dBFS-ს გადააჭარბა` **only while over**.
- **Rendering:** the frame is written from the store with no React render (transform/attribute writes). Only the latch boolean (`useSyncExternalStore` per track) renders.

**Placement.** Render it inside the existing `data-testid="arrangement-track-header"` element, for **every density** including folded. It is **absolutely positioned** in the header's existing bottom padding band (`pb-1.5`, 6 px), for example `absolute inset-x-2 bottom-px h-1`. It is not a new flex row and must not change the header's inline style.

**Geometry contract** (C measures it):
- every row height, the scroller numbers and the floating video are unchanged;
- every existing header control (fold, name, video import, M, S, Volume, readout, `ორიგინალი ხმა`) keeps exactly its round-26 rect;
- the meter rect lies inside the header and intersects no control rect, at folded 36, tight 53, regular 61 and full 81.

**Keyboard:** the meter is not focusable, and the lane Tab order is unchanged.

**Rendering contract:**
- `ArrangementLane` renders **0** times per Play frame, including frames with signal and after a track latch;
- each `ArrangementTrackMeter` renders 0 times per frame and at most once per latch transition of **its** track;
- a reset click renders at most one meter per latched track.

### 2.5 Nothing else

- `ArrangementMaster.tsx` and `ArrangementExportDialog.tsx` are frozen.
- The Master `Master Peak` label does not change. It already says "გასასუფთავებლად დააჭირე", and it now also clears the track latches (doc 033, the track `title`).

### 2.6 Tests (written first; red on the snapshot sources)

**Order:**
1. Write the new tests against the **unchanged** sources.
2. Run them and paste which fail and why. tsc failures for not-yet-existing exports are expected; say so. If a whole file fails to load, prove red in a scratch copy outside `store/` with minimal stubs, as in rounds 24–26, and say how.
3. Implement, then re-run.

**New files:**
- `app/lib/arrangement/__tests__/track-meter.test.ts` (pure store and graph taps);
- `app/lib/arrangement/__tests__/track-meter-ui.test.tsx` (context, lane UI, renders, unmount).

**Narrow amendment** to `app/lib/arrangement/__tests__/meter-ui.test.tsx`:
- **only** the five `toHaveLength` assertions at l.348, 351, 362, 363 and 376 change. Each becomes an **exact** count:
  - splitters: `1 + <tracks in meterArrangement()>`;
  - analysers: `2 + 2 × <tracks>`.

  Derive the track count from the fixture, not as a literal.
- Every master-specific assertion stays word-for-word: `splitters[0]` is the master tap, its `channelOutputs` are `[analysers[0],0],[analysers[1],1]`, `fftSize ≥ 4096`, and `tap` is `splitters[0]` after Pause/Play and the reschedule.
- No other line of that file changes. No test is deleted or weakened.

At least **16** new `it` blocks, covering:

1. **Pure store:**
   - two tracks get independent states: an over on track A leaves track B clear and its level unchanged;
   - one publish notifies once;
   - reset-all clears every max/latch;
   - floor-all keeps max/latch;
   - an unknown id returns a floor frame.
2. **Graph (fake context, as in the frozen `graph.test.ts`):**
   - with `trackTaps`, the music panner's outputs are `[master, musicTap]` and `outputs[0]` is the master;
   - a track without a tap has `[master]`;
   - without `trackTaps` the wiring is identical to today;
   - each tap is fed **only** by its own track's panner, and by no `trackGain`, clip node, other panner or the master;
   - `renderArrangementWav` passes no `trackTaps`: stub `OfflineAudioContext` as round 25's `master.test.ts` does, and assert that no node but the master's destination path is connected.
3. **Context and UI** (a fake `AudioContext` **with** `createAnalyser`, whose analysers return **per-analyser** test-controlled blocks):
   - **Taps:**
     - Play creates 1 + N splitters and 2 + 2N analysers, with the master first;
     - `applySchedule` gets `trackTaps` with every track id;
     - the same taps after Pause/Play and after a reschedule edit while playing.
   - **Levels and the latch:**
     - per-track levels are independent: music −12 dBFS → its meter `-12.0`, SFX −6 dBFS → `-6.0`, the video meter `-inf`;
     - a 1.5 block on the SFX analysers only → the SFX meter `data-state="over"`, `data-peak="+3.5"` and the sr-only text present; music stays `clear`;
     - the latch stays over through quiet frames and Pause/Play;
     - a click on `Master Peak` clears the Master **and** the SFX latch (`−∞`, `clear`, sr-only text gone). There is no new history entry, the Undo label is unchanged and no status is written.
   - **Pause and stop:** Pause → every track meter `-inf`/`-inf`, and `data-peak` is unchanged.
   - **Folded:** a folded track still has its meter, `aria-hidden="true"`, and it is not in the Tab sequence. The header Tab order is the same as without the meter.
   - **Renders:** over 30 frames with signal on every track, `ArrangementLane` 0 and `ArrangementTrackMeter` 0; the SFX latch → exactly one `ArrangementTrackMeter` render, and `ArrangementLane` 0.
   - **No analyser:** a fake `AudioContext` **without** `createAnalyser` → Play works, `trackTaps` is undefined (or empty) and every track meter stays `-inf`.
   - **Unmount (closes A round-26 gap M2c).** Neither store exposes a listener count, and after unmount the refs are null, so "writes nothing" alone would be vacuous. Observe it like this, with no source change:
     1. mount the provider with a probe only and capture both stores (`useMasterMeterStore()` and the track store);
     2. replace the subscribe function on each plain store object with a wrapper that records a `vi.fn` around every returned unsubscribe;
     3. `rerender` to add `ArrangementMaster` and a lane (with its `ArrangementTrackMeter`);
     4. `unmount()`;
     5. assert that every recorded unsubscribe spy was called exactly once, and that a publish after unmount throws nothing.

### 2.7 After the code

- Self-check these edge cases:
  - Mute or Solo while a track is over: the level floors, no new latch, and the latch stays.
  - Volume 0.
  - A reset during playback.
  - A reschedule keeps the same taps.
  - A loop wrap.
  - A context without an analyser.
  - Unmount during playback.
  - A hidden tab (the rAF pauses and the meters simply stop).
  - The video track meter.
  - Master Mute: the track meters still move, because they are pre-master; the Master meter floors. This is correct and matches T12.20/T12.22; say so in doc 033.
- Run `npx biome check --write` **only** on your own code and test files, then a read-only `npx biome check ./app`.
- Run the `code-reviewer` agent (more than 3 files changed) and report its findings and your dispositions.
- **Mutation checks only in a scratch copy outside `store/`.** Never mutate in place.
- Run the §5 commands. A browser smoke check is allowed (§5).

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

The 58 lines of `b-round-26-git-status.txt`, including the two foreign agent files (not Studio work; do not touch).

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/meter.ts` | A | §2.1: additions only; round-26 exports unchanged |
| `app/lib/arrangement/graph.client.ts` | A | §2.2: the optional `trackTaps` and the post-panner fan-out connect |
| `app/contexts/ArrangementContext.tsx` | A | §2.3 only |
| `app/components/arrangement/ArrangementTrackMeter.tsx` | A | **new**, §2.4 |
| `app/components/arrangement/ArrangementLane.tsx` | A | §2.4: the import and the one `<ArrangementTrackMeter …/>` element inside the header; nothing else |
| `app/lib/arrangement/__tests__/meter-ui.test.tsx` | A | §2.6 narrow amendment: the five count lines only |
| `app/lib/arrangement/__tests__/track-meter.test.ts` | A | **new**, §2.6 |
| `app/lib/arrangement/__tests__/track-meter-ui.test.tsx` | A | **new**, §2.6 |
| `docs/implementation/2026/quarter-IV/033-studio-lab-track-meters.md` | A | new doc (Georgian, `docs/implementation/TEMPLATE.md`) |
| `../tmp/studio-real-loop/a-round-27.md`, `a-round-27/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-27.md`, `c-round-27.json`, `c-round-27/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: exactly 62 lines.** That is the 58 baseline lines plus:

```
?? app/components/arrangement/ArrangementTrackMeter.tsx
?? app/lib/arrangement/__tests__/track-meter-ui.test.tsx
?? app/lib/arrangement/__tests__/track-meter.test.ts
?? docs/implementation/2026/quarter-IV/033-studio-lab-track-meters.md
```

The other owned files already have lines in the 58:
- `graph.client.ts`, `ArrangementContext.tsx` and `ArrangementLane.tsx` are ` M` lines;
- `meter.ts` and `meter-ui.test.tsx` are `??` lines.

No barrel export: `app/components/arrangement/index.ts` is frozen.

### 3.3 Frozen this round

**Frozen:** all 60 files in `b-round-26-tree-sha256.txt` and everything else under `store/`. That includes:
- `ArrangementMaster.tsx`, `ArrangementExportDialog.tsx`, `StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementVideoDock.tsx`;
- `types/arrangement.ts`, `model.ts`, `schedule.ts`, `panels.ts`, `position-store.ts`, `transport.ts`, `loop.ts`, `video-sync.ts`, `app/components/arrangement/index.ts`;
- every existing test except the §2.6 amendment, including `meter.test.ts`, `graph.test.ts`, `master.test.ts`, `master-ui.test.tsx`, `ArrangementContext.test.ts`, `render-budget.test.tsx`, `track-layout.test.tsx` and `export-dialog-focus.test.tsx`.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*` (`encodeSfxWav` is import-only), `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**` and `../backend/**`;
- user settings, env/config files and the sitemap; `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..26 work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewports:** 1440×900; 1280×720 for R27-L and R27-K.

**Harness rules (unchanged from round 26):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press` or Tab. Track Volume uses real arrow keys on the focused slider (0.01 per step).
- No source instrumentation. The `data-level-db`/`data-hold-db`/`data-peak`/`data-state` attributes are part of the contract and may be read. C may hook browser APIs (round 26 `h26.js` method), labelled as such.
- Live audio uses C's existing master tap and the raw-sample worklet from round 22 (`c-round-22/scripts/sp22.js`). The app's panners now have two outputs (the master and the track tap); C's tap still sees master → destination.
- The export is compared by frames, NaN, header, FS count and RMS, or by max |Δ| ≤ 1 LSB. Byte identity is never an oracle.
- **Time-to-floor oracle** (C round 26 §7): a meter that loses its signal reaches the floor within `(L0 + 60) / 20 s + 0.1 s`, where `L0` is its level at the moment of muting.
- Mutation checks run only in a scratch copy outside `store/`.

**Setup:** the round-11 `lay11` layout (`c-round-11/scripts/lay11.js`: video 0–6.008, music 0–16, stems 2–18, SFX 4–6). Record the clip table.

Reference numbers from C round 26:
- Master 0 dB: music + stems at 9–10 s, master max −1.9 dBFS; the latch at ~2.0 s; `+5.0` max at 4.0 s.
- Video-only beeps: −5.9 dBFS at 0 and 1 s.
- `Soft impact` alone at Master 0 dB: Master `+0.0` Clip.

**Run budget** (workflow policy): for each live-audio measurement, 3 valid runs plus at most 2 replacements for environment-invalid runs. A repeated failure stays an open bug. Tolerances are never relaxed.

### 4.1 R27-TL: a soloed track's meter equals the output

At Master 0 dB, Solo one track at a time (music, stems, SFX, video) and play a window where it sounds. Sample its `data-level-db` every rAF while the tap records.

**Oracle:**
- the max of that track's meter over each 1 s window equals the tap's max(|L|,|R|) over `[t0 − 4096/48000, t1]` in dBFS, **±1.0 dB**;
- 3 runs for music (8–12 s), one each for stems, SFX (4–6 s) and video (0–2 s).

Report the `fftSize` and `sampleRate` read from the page, and the number of `AnalyserNode`s and splitters (expected **10** and **5** with `lay11`).

### 4.2 R27-TI: the meters are per track, not a copy of the master

Unsoloed, at Master 0 dB, play 8–12 s and 4–6 s. Sample every track meter and the Master meter.

**Oracle:**
- each track meter's max per 1 s window equals **the same track's soloed max** from R27-TL (same window), **±0.5 dB**. A track meter is pre-master, so the other tracks do not change it;
- discrimination: C reports at least one window where the Master max and a track max differ by ≥ 1.0 dB. If no such window exists in `lay11`, C says so and reports the numbers (then this check proves nothing beyond R27-TL, and is recorded as such, not as PASS);
- the SFX meter reads `-inf` before 4 s, and from the clip end (6 s) plus the time-to-floor oracle onwards; the same rule applies to the video meter (0–6.008 s).

Do **not** use "track ≤ Master" as an oracle: a mix can partly cancel.

### 4.3 R27-TM: Mute and Solo

- During 8–12 s, real-click `M` on music. The music meter reaches the floor within the time-to-floor oracle and stays there; the stems meter keeps moving; the master drops.
- Unmute: the music meter rises again within 3 frames.
- Solo stems: every non-soloed track meter floors within the oracle.
- 3 runs for the music mute.

### 4.4 R27-TV: track Volume

Set the music Volume from 1.00 to 0.50 with 50 real ArrowDown presses, then play 8–12 s.

**Oracle:**
- the music meter max in the 9–10 s window drops **6.0 ±0.5 dB** versus the 1.00 run;
- the Master drop is no larger than the music drop + 0.5 dB (it is smaller wherever the stems sound);
- no new graph on the Volume change (round 25 `newGraphs` method).

Restore 1.00 afterwards.

### 4.5 R27-TW: a track over at Master −6 dB is a warning, and the Master stays clear

Reset, set Master −6.0 dB (12 × ArrowDown), play 0–8 s.

**Oracle:**
- the Master stays `clear` and its text never starts with `+` (= R26-C6);
- if any single track reaches full scale on its own (C measures it; round 26 §17.3 shows that `Soft impact` alone reaches about 1.0), that track's meter shows `data-state="over"` and `data-peak="+0.0"` (or higher), with the warning cue, the shape cue and the sr-only text;
- if no track reaches full scale, C reports the per-track `data-peak` values and the track maxima on solo runs, and records R27-TW as PASS only if every track is `clear` and matches its solo maximum ±0.5 dB.

This proves the tracks are measured before the Master gain (T12.22).

### 4.6 R27-TO: the track latch and reset

- **Latch:** with `Soft impact` alone on SFX (library drop) at Master 0 dB, play it. The SFX meter latches `over` (`+0.0`) and the Master latches `+0.0` (consistent by construction; not a bug, see §4.11). Both stay over after quiet frames, Pause/Play, a Master Volume change, a reschedule edit while playing, and Undo/Redo.
- **Reset:** one real click on `Master Peak` clears **both**: the track `data-state="clear"`, `data-peak="−∞"` and the sr-only text gone. The Undo label is the same before and after, there is no status text, and the Redo stack is untouched.
- **Over cue:**
  - the over cue is visible in a screenshot at 1440 and 1280;
  - it is a warning token, not `destructive`;
  - it has a non-colour shape change;
  - the `title` text matches §2.4 in both states.

### 4.7 R27-TR: floor on stop and the Master Mute interplay

- **Pause:** within one frame, every track meter `-inf`/`-inf`, and `data-peak` is unchanged.
- **Master Mute** while playing 8–12 s:
  - the Master floors (round 26 R26-CM);
  - the track meters **keep moving**, because they are pre-master;
  - the tap shows ≤ −60 dBFS;
  - one run.

### 4.8 R27-TF: densities

Which density is reachable where: tight is a height under 60 px, and audio lanes clamp at 60, so **tight exists only on the video lane** (min 52).
- **Full (81):** 1440 with `lay11`; every lane is 81. Play 8–12 s: the music and stems meters move.
- **Tight and regular:** 1280 with the detail panel open (the round-26 `53/61/61/61` layout). The video lane is 53 (tight), and the audio lanes are 61 (regular). Play 0–2 s: the video meter moves. Play 8–12 s: the music meter moves.
- **Folded (36):** fold the SFX lane with its fold button and play 4–6 s: the folded SFX meter moves (`data-level-db` > −60) and is visible in a screenshot.

### 4.9 R27-RB: render budget and cost in the browser

Use C's fiber wrapper (round 26 `rb26.js` method) on `ArrangementLane`, `ArrangementTrackMeter`, `ArrangementMaster` and `ArrangementMasterMeter`.

**Render oracle:**
- 2 s of playback with signal below full scale → **0** renders of each;
- a track latch → exactly **1** `ArrangementTrackMeter` render for that track, and `ArrangementLane` 0;
- a reset click → at most 1 per latched meter.

**Cost oracle:**
- one R3-V2-style video drift sample (round 26 `vm-1.txt` method): no worse than round 26 (max 20.1 ms) by more than 10 ms;
- dock counters 0 → 0;
- report the max rAF gap and the mean `tick` frame interval over 2 s, versus round 26.

### 4.10 R27-E, R27-K, R27-L, R27-R, R27-S, R27-U, R27-Doc

**R27-E (export unchanged):**
- one real export of `lay11` at Master 0 dB: 864 000 frames, NaN 0, valid header, FS **1800**, RMS **−15.481 ±0.01 dBFS**, and the overload alert as in round 26;
- analysers and splitters created on `OfflineAudioContext`: **0**.

**R27-K (1440 and 1280):**
- the lane Tab order (fold → name → [video import] → M → S → Volume, per lane) equals round 24/26. Report it from `← CZABA` to the first lane's Volume;
- the meter is never focused;
- the header Tab order (`Master Mute` → `Master Volume` → `Master Peak` → `Play` …) equals round 26;
- Space on `M` still toggles playback (round 26 method).

**R27-L (1440 and 1280):** the references are C round 26 `geo-*.txt`/`p2a-*.txt`/`fv-1440.txt`.
- Header **35 px**, transport **49 / 87 px**.
- With `lay11`: 1440 rows 81×4 and scroller 496/604 (detail open/closed); 1280 closed 81×4 scroller 386, open 53/61/61/61 scroller 280.
- Floating video at 1440 with the library collapsed: **8,503 272×153**.
- **Header control rects (self-contained check):**
  1. C records every header control rect;
  2. C checks that the meter's computed `position` is `absolute`;
  3. C removes the meter elements from the live DOM (`element.remove()`, runtime only, no source change) and records the rects again.

  Every other rect must be identical.
- The meter rect lies inside its header's bottom 6 px band and intersects no control. Check all four densities as reached in R27-TF: full at 1440; tight (video) and regular (audio) at 1280 with the detail panel open; folded.
- Screenshots of a lane header at both viewports, clear and over.

**R27-R (adjacent, one run each):**
- R26 Master meter regression: lay11 0 dB latch `+5.0` ±0.5 by 6.5 s; −6 dB clear `−1.0`; Pause floors.
- Master Volume −6.0 and back (Δ −6.0 ±0.3), and the Master Mute de-click (≤ −60 dBFS from 60 ms).
- Track Mute de-click (round 22 R22-M1 numbers).
- One loop 8–12 wrap with seam 0 (round 25 `ur-1` method).
- Play from 0 and stop; the library drop of `სრული მიქსი` onto music at 7 gives one clip.

**R27-S (static, read-only):** `diff -u` of `b-round-26-snapshots/` against the live files. Every hunk must be within §3.2 (report each hunk's purpose).
- `graph.client.ts`: only `trackTaps` and `panner.connect(tap)` **after** `panner.connect(master)`. `renderArrangementWav` passes no `trackTaps`, and the master tap is unchanged.
- `ArrangementLane.tsx`: only the import and the one element inside the header.
- `meter.ts`: additions only; the round-26 exports are byte-identical in behaviour.
- `meter-ui.test.tsx`: exactly the five count lines, now exact formulas; nothing else.
- `scheduleKey` is unchanged, and there is no `Arrangement` type change (frozen files).
- No `getByteTimeDomainData`; no `limiter`, `normalize` or `compress` in the new code or UI; no hardcoded colours or JSX `style=` in `ArrangementTrackMeter.tsx`.

**R27-U:**
- the §2.6 cases exist and are green; A's red-first output shows them failing on the snapshot sources;
- C mutations in a scratch copy outside `store/`, each must make a test fail:
  - (a) a track tap wired from `trackGain` instead of the panner;
  - (b) one shared state object for all tracks;
  - (c) `stopPlayback` without the per-track floor frames;
  - (d) `resetMasterPeak` not clearing the track latches;
  - (e) the track tap connected **before** `panner.connect(master)`. Frozen `graph.test.ts` or a new test must fail;
  - (f) the writer effect's cleanup removed (the subscription is never unsubscribed). The §2.6 unmount test must fail.

  Report how each mutation was done.

**R27-Doc:** doc 033 exists, is in Georgian and matches the code. It states:
- the tap position (post-panner) and why (T12.20, stage 4 pan);
- the fan-out order;
- the guard and the cost (5 × 2 × 4096 per frame);
- the per-track state and the store;
- the warning-not-destructive over (T12.22) and the shared over predicate;
- the single reset point and why there are no new Tab stops;
- the geometry (absolute in the padding band);
- the 0-render mechanism;
- the Master Mute interplay;
- the inherited R26-M1 limit;
- the `meter-ui.test.tsx` amendment and why;
- the tests;
- the scheduled stages 3 and 4.

### 4.11 Gates

**G27-1:**
- tsc 0;
- vitest = **1072** + A's new tests (≥ 16 new `it`), 0 failures (if the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both runs);
- the build passes;
- Biome 0 errors on `./app` (read-only), with the warning count not above round 26's 218 + 1 info;
- `render-budget.test.tsx`, `track-layout.test.tsx`, `master-ui.test.tsx`, `meter.test.ts`, `master.test.ts`, `graph.test.ts`, `ArrangementContext.test.ts` and `export-dialog-focus.test.tsx` are green **and unchanged** (their sha256 is in the frozen list);
- `meter-ui.test.tsx` is green with only the §2.6 amendment.

**G27-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-26-tree-sha256.txt` → **60 OK**;
- `git status --short` = the 58 baseline lines plus exactly the 4 lines in §3.2 (62 lines);
- `Header.tsx` is identical to HEAD, and nothing else under `store/` changed.

**G27-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (including during playback with the meters, a reset and an export);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts`.

**C-R23-01 information record (not PASS, not FAIL):**
- the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab` (round 26: 4 at 28013/28014 and 44397/44398), and the context of each;
- the code points of every lane name `aria-label`, every track-meter sr-only text that is present, and every Master control name after hydration.

A label carrying U+FFFD **in SSR** is recorded under C-R23-01, not as a new bug, unless the label is wrong in the source.

**Not re-run this round:** RF5-3, R3-V1, R3-V4 and R11-P3 sync. The audio change is a fan-out tap per track and per-frame reads; the video, dock, scheduler, transport and loop code do not change (G27-2 proves it). One drift sample is in R27-RB.

### 4.12 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- **C-R23-01** (Medium, SSR NUL, 4 NUL; awaits the Tech Lead);
- C-R6-02 and C-R8-01 (Tech Lead quiet Chrome).

**Open low items:**
- **R26-M1:** rAF-gap sampling (after stage 4; needs a module URL; `public/**` is forbidden).
- **Master hold tick:** only 1 px is visible at ≥ +6 dBFS (stage 4 polish).
- **Demo `Soft impact` full scale:** the stock demo SFX alone reaches full scale, so the live Clip shows `+0.0` and the export clamps 2 samples. This is consistent by construction and the predicate stays. The **Tech Lead** chooses one of:
  - (a) a narrow `lib/sfx-*`/demo-synth grant to normalise demo peaks to ≤ `MAX_24BIT_SAMPLE`;
  - (b) accept it.

  R27-TO uses it as a fixture, and its `+0.0` is expected.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS: visible in the export since round 25 and live since round 26. The clamp stays (no limiter: effects are out of scope);
- the final commit/push only after everything, and the uncommitted round-6..26 tree;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4, and C's python probes in rounds 21–22;
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push);
- `Content-Type: text/html` without a charset in `entry.server.tsx` (same Tech Lead question).

Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

**Tech Lead manual checks:** R23-1/2, R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, R25-T, Lenis `/studio/*`, and the positive MP4/MOV import path.
- **R26-T (text corrected per C round 26 §17.1):** watch the Master meter and the Clip in real Chrome with speakers on `lay11`. At 0 dB the Clip lights at **~2.0 s** (stems enter), and `+5.0` is the max at ~4.0 s. At −6 dB it does not light. Also confirm the meter motion is readable.
- **New, R27-T:** in real Chrome, the track meters are readable at every density and the track over cue is distinguishable from the Master Clip. The hover `title` shows the Peak.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-26-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/track-meter.test.ts app/lib/arrangement/__tests__/track-meter-ui.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx
npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/meter.test.ts app/lib/arrangement/__tests__/master.test.ts app/lib/arrangement/__tests__/graph.test.ts app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/export-dialog-focus.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
git diff --stat cc1e531 -- app/components/layout/Header.tsx
diff -u ../tmp/studio-real-loop/b-round-26-snapshots/meter-ui.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

A may use the browser (`a-browse.json`) for one smoke check on `/studio-lab`:
- the track meters move during playback;
- a folded lane keeps its meter;
- the header is 35 px and the lane rows are 81 px at 1440;
- a click on `Master Peak` clears a track latch;
- there is no console error.

This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-27.md`:**
1. the pre-flight gate (with the design-philosopher advice);
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes), including the exact `meter-ui.test.tsx` diff;
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails;
6. deviations.

Do not claim PASS.

**C → `c-round-27.md` and `c-round-27.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the budget reason);
- the tap and per-track meter numbers per run;
- the node counts;
- the geometry and rect comparison;
- the Tab order;
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers (before the next feature round).
- **Stage 3:** FB-04 clip gain in the detail panel:
  - R13-M1: +6 dB ±0.2 on that clip only;
  - the existing `clipGain` node;
  - one history entry per gesture;
  - the export applies it;
  - never labelled input sensitivity;
  - the track meter will show it.
- **Stage 4:** FB-05 track pan (R13-M2), the fader-click UX for all faders, the round-9 context items M1/L8, and the Master hold tick at ≥ +6 dBFS.
- **After SRW-13:**
  - SRW-14 (FB-13 grid/snap/free) → SRW-15 (FB-09/FB-11 bars/beats, metronome, grid tempo; never audio stretch) → SRW-16 (FB-10 markers);
  - SRW-17 (FB-12 groups; folded-clip a11y);
  - SRW-18 (FB-06 fades and the volume envelope) → SRW-19 (FB-07 video opacity fade);
  - SRW-20 (range export, MP3);
  - R26-M1 hardening;
  - the SRW-21 adapter contract (the route mount needs Tech Lead or auth-owner permission);
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 27 -StartPhase A` and a higher limit.
