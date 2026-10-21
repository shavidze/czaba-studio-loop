# CURRENT TASK — Round 31: SRW-13 stage 4a — FB-05 track pan (R13-M2) on audio tracks, live, in loop and in export

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-13
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorization 2026-10-13).
- Decision record: D-29v in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-30.md`.

> **Environment prerequisite for C (root, not BLOCKED):** the dev server `http://127.0.0.1:5173` answered **200** when B planned (2026-10-13 ~11:50 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** B counted **6–7** `node.exe`. Every A and C run records the count (`tasklist | grep -ci node.exe`).

## Why this round

**C bugs first:** C round 30 (`c-round-30.md`, `c-round-30.json`) is a **PASS** on every ID (G30-1..3, R30-GE..Doc; vitest 1161/1161).
- The only new finding is **C-R30-01** (Low, pre-existing, cosmetic): the info column overlaps at 1280×720 when the panel is open and a range is shown.
- Under the approved workflow, only critical, security and data-loss bugs preempt a feature, so C-R30-01 goes to the queued detail-panel/docs polish round (D-29v).
- The open Medium bugs are all with the Tech Lead: C-R27-01, C-R23-01, C-R6-02 and C-R8-01.

The next dependency-ordered scope is **SRW-13 stage 4a: FB-05 track pan**.
- **User request:** FB-05, `docs/video-to-text-bugs/README.md` l.31: „მარცხენა/მარჯვენა Pan კონტროლი“, from `1.mp4` 03:39–03:47.
- **Acceptance R13-M2:** "Pan track fully left → export right channel of that track ≈ silent".

Stage 4 was split (one feature per round):
- **4b:** fader-click UX for every fader, double-click reset, per-key coalescing, A-R29-REVIEW-1, pending-commit order and the Master hold tick.
- **4c:** round-9 M1/L8.

**References:**
- Backlog v32: `backlog.json` item **SRW-13** (`stages`, `decisions_round31`).
- Progress board: `feature-status.md`.
- B's geometry probe: `b-round-30/geo-1440.json`, `geo-1280.json`, `geo-1280-detail.json`, `names.json`.
- Ableton source: `b-round-29/ableton-mixing-20261012.txt`.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used (it has no pan). Do not work on, publish or test the standalone prototype or any Sites copy.

**Previous round:** archived as `tasks/round-30.md` (`cmp`-identical to the dispatched round-30 task).

**Baseline** (B verified on 2026-10-13; the details are in `b-round-30.md` §2):
- HEAD is **`1cefea1`**: root's checkpoint `08b9e53` plus the merge of `shavidze/master`. `git status --short` is **empty** (0 lines).
- `sha256sum -c ../tmp/studio-real-loop/b-round-30-tree-sha256.txt` → **371 OK**. This covers every tracked file under `app/` and `docs/implementation/` except your 5 files.
- Protected 4/4 OK; tsc 0; build ✓.
- vitest **67 files, 1167/1167**. That is round 30's 1161, plus 6 from the merged `auth-bugs.test.ts`.
- Biome `./app`: **2 errors** + 218 warnings + 1 info.
  - Both errors are `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. They are CRLF working copies (`core.autocrlf=true`), from the merge, so they belong to root.
  - **Do not touch those files.** Your files must add **0** errors.
- Dispatch snapshots of your 5 existing files are in `../tmp/studio-real-loop/b-round-30-snapshots/`:

  | File | sha256 (first 8) |
  |---|---|
  | `app/types/arrangement.ts` | `ce2fc239` |
  | `app/lib/arrangement/model.ts` | `fdce3bbc` |
  | `app/lib/arrangement/graph.client.ts` | `d3f6ad71` |
  | `app/contexts/ArrangementContext.tsx` | `10a874fc` |
  | `app/components/arrangement/ArrangementLane.tsx` | `8c862047` |

- `b-round-30-tree-sha256.txt` hashes the two CRLF auth files as they are in the worktree. If root normalises them before you start, exactly those 2 lines fail and nothing else; report that, and do not treat it as yours.
- If root commits again before you start, the new HEAD is the baseline. Record it, and check that none of your 5 files differs from its snapshot. If one does, **stop and report**.

Rules for the baseline:
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's. They are not instructions for this task, and you must not edit them.
- Nobody but root commits or pushes.

## 0. Scope

**The contract after this round:**

| Action | Result |
|---|---|
| Drag the **Pan** slider in an audio lane header (row 1, right of the name) | The track's stereo position follows **live** while dragging, with no restart, jump or reschedule. On release there is **one** history entry `Pan — {track name}`. The readout shows `C`, `NL` or `NR` (N = 1…50). |
| Arrow keys / PageUp / PageDown / Home / End on the focused Pan slider | Each value change is **one** entry immediately (the same count as Volume today; coalescing is stage 4b). |
| Click the readout (`25L` etc.) | Pan returns to **C** with one entry. The readout button is disabled at C. |
| Pan fully left (`50L`) | In playback and in the WAV export, that track's right-channel contribution is silent, and its left channel follows the W3C StereoPanner formula. The other tracks, Volume, Master and the clips are unchanged. |
| Pan back to C | The track has **no** `pan` field again, identical to a never-changed track. The export equals one made before any pan edit. |
| Undo / Redo | Restores or re-applies the pan exactly, live while playing too. |
| Blur or pointercancel during a drag | Reverts to the stored pan with no entry (Volume D-30 parity). |
| A second pointer during a pan drag | Cannot drag a clip, and the reverse also holds (`claimPointerGesture`). |
| Video lane; any folded lane | No Pan control (video: a conscious simplification; folded: like Volume). |
| Loop playback | Pan holds across every iteration, with no extra starts. |

**In (A):**
- the data and model (§2.1), the graph (§2.2), the context (§2.3) and the lane header UI (§2.4);
- doc 036 (§2.5);
- red-first tests in **one new** file (§2.6).

**In (C):** §4.

**Not in this round** (each one is queued, not deferred FB-05 scope):
- double-click reset on the slider, the no-jump fader, Shift fine drag and key coalescing (stage 4b, for all faders);
- multi-track linked pan (Live §18.1; there is no track multi-select in CZABA);
- Split Stereo Pan Mode (Live §18.1; not requested);
- pan automation (FB-06 is clip volume; there is no pan envelope);
- video-lane pan;
- C-R30-01 and DOC035-NOTES (polish round).

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- the per-track panner and node counts (`graph.test.ts`, `track-meter.test.ts`);
- the reschedule rule (`scheduleKey` must stay clips + loop);
- loop appends;
- the export (no change to `renderArrangementWav`);
- history (JSON equality; frozen track fixtures without `pan`);
- the Volume gesture machine (`gesture-guard.test.tsx`);
- lane header geometry and density (`track-layout.test.tsx`; folded 36, rows 81/61/53);
- the R24-HC Home test (it queries the **first** `input[type="range"]` in the music row; see §2.4);
- the track and Master meters (post-panner taps);
- render budget.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives.**
   - Read `.claude/rules/read-primitives.md` and these primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md` (required), `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
   - Also read `prompts/studio-feature.md` and run the `pre-flight` skill.
   - You may consult `design-philosopher` about the row-1 placement. The geometry contract in §2.4 is fixed.
2. **Check the baseline** and report any difference **before** doing anything else:
   - `sha256sum -c ../tmp/studio-real-loop/b-round-30-tree-sha256.txt` → 371 OK;
   - `git status --short` → empty;
   - `git rev-parse HEAD`;
   - your 5 files against the snapshot shas.
3. **Read:**
   - `types/arrangement.ts` (`ArrangementTrack` l.3–10);
   - `model.ts`:
     - `setTrackMix` l.438–455;
     - `CLIP_GAIN_*` l.19–20 and `setClipGainDb`/`clipLinearGains` l.482–515 (your pattern for "absent unless non-zero");
     - `isSameArrangement`/`commitHistory` l.550–572;
   - `graph.client.ts`, all of it:
     - the per-track loop l.94–112 (the panner already exists, `pan.value = 0`);
     - `setTrackGain` l.192–201;
     - `setClipGain` l.211–221;
     - `renderArrangementWav` l.260–293 (**must stay byte-identical**);
   - `ArrangementContext.tsx`:
     - the context type l.260–280;
     - `scheduleKey` l.413–417;
     - `refuseEditDuringGesture` l.576;
     - `startGraph` l.674–720;
     - `syncPlayback` l.845–886;
     - `applyEdit` l.916–934;
     - the Volume machine l.2025–2137 (your **reference**; do **not** copy its pending-snapshot design, see §2.3);
     - `claimPointerGesture` l.1297;
     - the value objects around l.2502 and l.2587;
   - `ArrangementLane.tsx`:
     - l.95–135 (context and density);
     - row 1 l.418–483;
     - row 2 l.484–516 (the Volume input, your interaction reference);
   - the frozen tests:
     - `graph.test.ts` l.40–120 (fakes, `track()` without `pan`) and l.360–390;
     - `track-meter.test.ts` l.50–95 (node lists);
     - `gesture-guard.test.tsx` l.130–230 and l.380–520 (Volume D-30);
     - `track-layout.test.tsx` l.270–305 (fold) and l.1124–1148 (R24-HC: `querySelector('[data-track-id="music"] input[type="range"]')` takes the **first** range);
     - `render-budget.test.tsx`.
4. **Grep yourself and report** (contract-conflict check):
   - every test asserting `pan.value`, counting `createStereoPanner`/panner nodes, or counting `setTargetAtTime` on panners;
   - every `toEqual`/`toStrictEqual` on whole `ArrangementTrack` objects or `arrangement.tracks`;
   - every test that queries `input[type="range"]` in a lane header, or counts sliders/buttons in a header;
   - every test that asserts a header's child count or row geometry.

   B's grep found:
   - all 18 `FakePanner`s use `FakeParam` (with `setTargetAtTime`);
   - no test reads `pan.value`;
   - the only header range query is R24-HC.

   **If a frozen assertion would break, stop and report.** That is a contract conflict for B; do not edit the test.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Data and model (`types/arrangement.ts`, `model.ts`)

- `ArrangementTrack` gets **one** optional field, `pan?: number`. It is present **only when non-zero**; never write `pan: 0` or `pan: undefined`.
- In `model.ts`:
  - `TRACK_PAN_STEPS = 50` (display units per side).
  - `setTrackPan(arrangement, trackId, pan): Arrangement` (another name is fine; document it).
    - It returns **the same object** when:
      - the track is unknown;
      - the track is not `audio`;
      - `pan` is not finite;
      - the stored value would not change.
    - Otherwise:
      - it clamps to −1…+1;
      - it rounds to 1/50 (`Math.round(p * 50) / 50`, with `-0` normalised to `0`);
      - when the result is `0`, it **removes** the key;
      - everything else is unchanged.
  - `trackPanValue(track): number` returns `track.pan ?? 0`.
  - `formatTrackPan(pan): string` returns `C` at 0, otherwise `${Math.abs(units)}L`/`${units}R`, where units = `Math.round(pan * 50)`.
- Do not widen or edit `setTrackMix` (frozen behaviour; Volume tests).

### 2.2 Graph (`graph.client.ts`)

- In the per-track loop:
  - `panner.pan.value = clampPan(track.pan ?? 0)` (a local clamp to −1…+1), instead of the literal `0`;
  - keep panners **by track id** (a `Map`), and keep `disconnect()` disconnecting all of them.
- `ScheduleHandle.setTrackPan(trackId: string, value: number): void`:
  - returns immediately when the handle is disconnected, the track is unknown, or `value` equals the stored target (default = the initial value);
  - otherwise it stores the value and calls `panner.pan.setTargetAtTime(value, ctx.currentTime, GAIN_TIME_CONSTANT)`.
- **No new node, no new option, no new `create*` call.** Do not change `startPlan`, `appendPlan`, taps, meters, the master or the mute time constants.
- **`renderArrangementWav` stays byte-identical.** The export picks pan up from `tracks` through the same `applySchedule`.

### 2.3 Context (`ArrangementContext.tsx`)

- **`scheduleKey`:** unchanged. It already keys only clips + loop, so pan never reschedules.
- **New actions** (stable `useCallback`; add them to the context type and to both value objects):
  - `setTrackPan(trackId: string, pan: number): boolean`
    - If another pointer gesture is active and it is not this track's pan gesture, `refuseEditDuringGesture()` handles it, and the action returns `false`.
    - Otherwise: `applyEdit(setTrackPan(present, trackId, pan), \`Pan — ${track.name}\`)`.
    - `applyEdit` already flushes any pending Volume/Master preview first.
  - `beginTrackPanGesture(trackId: string, pointerId: number): boolean`
    - Claims through `claimPointerGesture`. On refusal it returns `false`.
    - Window `pointerup` with the same id → commit; window `pointercancel` → cancel.
    - It flushes a pending Volume/Master preview first, as `beginTrackVolumeGesture` does.
  - `previewTrackPan(trackId: string, pan: number): void`
    - Only while that track's pan gesture is active.
    - Sets a context **preview override** `{ trackId, value }`, with the value clamped and rounded as in §2.1, and pushes it to the live handle with `handle.setTrackPan`.
    - **It never writes `history.present` or history.** The context override is a ref for audio only. The slider's visible value during a drag is the lane's local draft state (§2.4), because a controlled range whose `change` produces no state update snaps back.
  - `commitTrackPan(trackId: string): void`
    - Ends the gesture, clears the override, then `setTrackPan(trackId, overrideValue)`. That makes one entry, or none if the value is unchanged.
    - **A no-op when no pan gesture is active for that track.** `onLostPointerCapture` and the window `pointerup` can both fire, also after a blur-cancel; neither may re-commit.
  - `cancelTrackPan(trackId: string): void`
    - Ends the gesture, clears the override, and pushes the stored pan back to the handle. No entry.
    - A no-op when no pan gesture is active for that track.
- **The override is honoured** in:
  - `startGraph`: apply it to the `tracks` passed to `applySchedule` for that track only, or call `handle.setTrackPan` right after;
  - `syncPlayback`'s non-reschedule branch: push `handle.setTrackPan(track.id, override ?? trackPanValue(track))` for every track, after the track gains.

  This way a reschedule during a drag (for example Space) keeps the dragged pan audible.
- On provider unmount, release a live pan gesture like the Volume ones.
- No change to the Volume/Master preview machinery, the transport, the loop, the video, the dock, the meters, the clipboard or `applyEdit`.

**Rationale (B, D-29v):** a third copy of the Volume machine would snapshot `present` and would need flush ordering against Volume and Master. The round-30 review found an ordering gap there, and A-R29-REVIEW-1 is a label leak from the same design. A preview that never touches history has neither problem.

### 2.4 Lane header UI (`ArrangementLane.tsx`)

**Audio lanes, not folded only.** Two new elements go in **row 1** (the `flex min-w-0 items-center gap-1` div, l.418), **after** the name button, and **after** the video branch in DOM order. The video branch never renders for audio, so the order is fold → name → Pan → readout.

1. **The slider:**
   ```
   <input type="range" min={-50} max={50} step={1} … />
   ```
   - `value={Math.round(displayPan * 50)}`, where `displayPan` = the lane's **local draft** (`useState` in `ArrangementLane`, set in `onChange` while this track's pan gesture is active, cleared on commit/cancel/blur), else `trackPanValue(track)`;
   - `aria-label={\`Pan — ${track.name}\`}`, `aria-valuetext` = the readout text;
   - `data-testid="arrangement-track-pan"`;
   - classes `h-1 w-12 shrink-0 accent-brand` plus the same focus-visible classes as Volume.

   **Events, mirroring Volume:**
   - `onPointerDown` (primary button, `buttons !== 0`) → `beginTrackPanGesture`;
   - `onChange`:
     - if this track's pan gesture is active → set the local draft **and** `previewTrackPan(track.id, value / 50)`;
     - otherwise (keyboard or AT) → `setTrackPan(track.id, value / 50)` immediately;
   - `onPointerUp` and `onLostPointerCapture` → `commitTrackPan(track.id)`;
   - `onBlur` → if this track's pan gesture is active → `cancelTrackPan(track.id)`.
2. **The readout/reset button:**
   - `type="button"`, text = `formatTrackPan(displayPan)`;
   - `aria-label={\`Pan-ის ცენტრში დაბრუნება — ${track.name}\`}`, `title="Pan → C"`;
   - `data-testid="arrangement-track-pan-reset"`;
   - `disabled` when the stored pan is 0;
   - `onClick` → `setTrackPan(track.id, 0)`;
   - classes `w-7 shrink-0 text-right text-xs tabular-nums text-muted`, plus hover/focus-visible from existing tokens.

**Geometry contract** (B probe, `b-round-30/geo-*.json`):
- The header inner width stays 203. Row 1 stays a single line, ≤ 22 px tall.
- Row heights stay unchanged: 81 at the default height, 61 at the audio minimum, 36 folded, 53 video.
- Row 2 is byte-identical: the Volume width stays **107** and the meter position is unchanged.
- The four demo base names (ვიდეო, მუსიკა, სტემები, SFX) must not ellipsize. With the probed widths (≤ 61 px) and a name box of ≈ 98 px, they fit.
- The ` · აქტიური` suffix may ellipsize; record it. The active state is still shown by the brand left border and `aria-pressed`.
- Do not change row 2, the meter, the fold, the height handle, the density thresholds or any other lane.

**R24-HC:** because Pan sits in row 1, `querySelector('[data-track-id="music"] input[type="range"]')` now returns the **Pan** slider. Run `track-layout.test.tsx`, which must pass unchanged: Home on any focused range must stay with the browser. **Report** in §6 which element the frozen test now exercises. B accepts this; Home is left to every slider (`isSliderTarget`). If you find any other frozen test that relies on "first range = Volume", stop and report.

**Constraints:**
- No new colour or token.
- The visible label is **Pan**. Never call it "balance" in the UI.

### 2.5 Doc 036 (`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`)

Write it in Georgian, with technical terms in English, following `docs/implementation/TEMPLATE.md`. Cover:
- the contract table of §0;
- the data rule (absent unless non-zero; 1/50 steps; audio only);
- the graph design (the existing panner, `setTrackPan`, why there is no reschedule, the export through `tracks`, and that `renderArrangementWav` is unchanged);
- the preview-override design and **why** it is not a third pending machine (§2.3 rationale);
- the UI, the geometry and the R24-HC note;
- the W3C StereoPanner law used (stereo and mono formulas), stated as **CZABA's** engine behaviour and not as Ableton's;
- the tests;
- the Ableton table (§4.6, with statuses);
- the items explicitly not in this round (§0).

### 2.6 Tests (written first; red on the snapshot sources)

**Order:**
1. Write the new tests against the **unchanged** sources.
2. Run them and paste which fail and why. If the file fails to load (missing exports), prove red in a scratch copy **outside `store/`**, as in rounds 24–30, and say how.
3. Implement, then re-run.

**New file:** `app/lib/arrangement/__tests__/track-pan.test.tsx`. No other test file changes.

At least **18** new `it` blocks. Fixtures must make the wrong behaviour observable: two audio tracks plus the video track, each with clips, and a non-default Volume on the panned track.

1. **Model:**
   - `setTrackPan(-1)` changes only that track's `pan`. Volume, mute, solo, the other tracks, clips and master are unchanged.
   - Setting `0` removes the key (`Object.hasOwn` is false), and the result `isSameArrangement` with the never-changed arrangement.
   - Clamp `±2` → `±1`; rounding `0.333` → `0.34` (17/50); `-0.001` → no key.
   - Same-object returns for NaN, an unknown id, the video track and an unchanged value.
   - `formatTrackPan`: `C`, `50L`, `50R`, `1L`.
2. **Graph** (fake context, as in `graph.test.ts`):
   - `tracks` with `pan: -1` seed that panner's `pan.value` to `-1` and the others to `0`. The panner and gain node counts are unchanged.
   - `setTrackPan`:
     - calls `setTargetAtTime(v, now, 0.015)` on that track's panner only;
     - a repeated equal value makes no call;
     - nothing happens after `disconnect`;
     - an unknown track does nothing.
   - Source scan: `renderArrangementWav`'s text is unchanged from the snapshot body. At minimum it still contains `applySchedule(ctx, planSchedule(arrangement, 0)` and `tracks: arrangement.tracks`, and contains no `setTrackPan`.
3. **Provider** (real provider, fake audio as in the frozen tsx tests):
   - `setTrackPan` → one entry `Pan — {name}`; Undo restores the absence of the key; Redo re-applies it;
   - an unchanged value → `false` and no entry;
   - while playing, a pan-only change does **not** reschedule (no new source starts) and reaches the panner through `setTargetAtTime`;
   - Undo while playing does the same;
   - begin → several previews → `history.present` and the past length are **unchanged** during previews → commit makes exactly one entry;
   - cancel → no entry, and the handle gets the stored value back;
   - a reschedule during a preview (force `syncPlayback`/Space) keeps the override on the new graph's panner;
   - a refusal during another pointer gesture (clip drag).
4. **UI** (real `StudioWorkspace`):
   - audio lanes show `arrangement-track-pan` and `-pan-reset`; the video lane does not; a folded lane does not;
   - pointer down → change ×3 → pointer up gives one entry, and the readout shows `NL`;
   - **during** the pointer moves (before release), the slider's `value` and the readout follow the draft, while `history.past.length` and `present` are unchanged;
   - a keyboard change gives one entry per change;
   - the readout click → C, one entry, and the button is disabled afterwards;
   - blur during a drag → no entry, and the stored pan is unchanged;
   - Delete/Backspace on the focused Pan slider do not delete a selected clip;
   - Space on the focused Pan slider toggles playback, like Volume;
   - DOM order in row 1: fold, name, Pan, readout.

### 2.7 After the code

- **Self-check** (report each one):
  - pan on a track whose clips have no live source while playing;
  - pan during a loop wrap;
  - Undo of a pan while a Volume preview is pending;
  - Escape during a drag (record what happens; there is no contract beyond the native one);
  - provider unmount during a drag.
- **Biome:** run `npx biome check --write` **only** on your own files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (more than 3 files changed). Report its findings and your dispositions.
- **Mutation checks:** only in a scratch copy outside `store/`. Never mutate in place.
- **Commands:** run the §5 commands. One browser smoke check is allowed if the server is up.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `1cefea1`, a clean tree.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/types/arrangement.ts` | A | `ArrangementTrack.pan?` only |
| `app/lib/arrangement/model.ts` | A | §2.1 only (new constant and helpers) |
| `app/lib/arrangement/graph.client.ts` | A | §2.2 only |
| `app/contexts/ArrangementContext.tsx` | A | §2.3 only |
| `app/components/arrangement/ArrangementLane.tsx` | A | §2.4 only (row 1 of audio lanes) |
| `app/lib/arrangement/__tests__/track-pan.test.tsx` | A | **new**, §2.6 |
| `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | A | **new**, §2.5 |
| `../tmp/studio-real-loop/a-round-31.md`, `a-round-31/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-31.md`, `c-round-31.json`, `c-round-31/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: exactly 7 lines.**

```
 M app/components/arrangement/ArrangementLane.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/graph.client.ts
 M app/lib/arrangement/model.ts
 M app/types/arrangement.ts
?? app/lib/arrangement/__tests__/track-pan.test.tsx
?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
```

(If root has committed in between, compare against the new HEAD.)

### 3.3 Frozen this round

**Frozen:**
- all 371 files in `b-round-30-tree-sha256.txt`, and everything else under `store/`;
- that includes `schedule.ts`, `loop.ts`, `meter.ts`, `clipboard.ts`, `panels.ts`, `view.ts`, `transport.ts`, `video-sync.ts` and `position-store.ts`;
- `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementClip.tsx`, `ArrangementTransport.tsx`, `ArrangementMaster.tsx`, `ArrangementTrackMeter.tsx`, `ArrangementExportDialog.tsx` and `ArrangementLibrary.tsx`;
- docs 001–035;
- **every existing test**.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**` (including the 2 CRLF files), `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs and `../backend/**`;
- user settings, env/config files and the sitemap; `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting earlier work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewports:** 1440×900; also 1280×720 **with the detail panel open** for R31-PUI.

**Harness rules (unchanged):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press`/`$B type`.
- Range drags, seeks and library drops come from synthetic pointer/input events, as in round 30; label them.
- No source instrumentation. C may hook browser APIs (`BaseAudioContext.prototype.createStereoPanner` to tag panners, `AudioParam.prototype.setTargetAtTime`, `AudioBufferSourceNode.prototype.start`, `AudioNode.prototype.connect`), labelled as such.
- Mutations run only in a scratch copy outside `store/`.
- **Every run and every vitest gate records the `node.exe` count.**

**Layout L31** (record the track table `[id, volume, pan or '-']` and the clip table before and after each step):
- the demo video at 0 (0–6.008);
- library `სრული მიქსი` on music at 7 (7–23);
- `Soft impact` on SFX at 4 (4–6).

**Report first:** the decoded **channel count** of `სრული მიქსი`'s buffer and of the SFX buffer. The R31-PE formula depends on it.

**Checkpoint order if the session may end:** G31 → R31-PE → R31-PV/PL → R31-PH/PG/PD → R31-PUI → rest. Write `c-round-31/checkpoint.md` as you go.

### 4.1 R31-PE / R31-PE2 — the R13-M2 export oracle (decode)

**Setup:** music solo and Master **−12.0 dB** in every export. WAV 48 kHz / 24-bit / 2 ch. Every export's overload report must have `clippedSamples = 0`; otherwise that export is invalid and is re-done.

**Exports:**
- **E0:** every pan at C. Make it **before** any pan edit on the page.
- **EL:** music `50L`, set by a real drag or a keyboard **Home** (on a native range `min=-50`, Home = −50 = `50L`; End = `50R`). Window [7, 23):
  - right channel: max |sample| ≤ **1 LSB**;
  - left channel:
    - **stereo source:** max |EL.L − (E0.L + E0.R)| ≤ **2 LSB**;
    - **mono source:** E0 is equal-power centre (`L = R = 0.70711·x`), so max |EL.L − E0.L / 0.70711| ≤ **2 LSB**.
  - The music Volume control value is unchanged before and after (read the control).
- **ER:** music `50R` gives the mirror image (left ≤ 1 LSB; right per the formula).
- **E25L (R31-PE2):** music `25L` (pan −0.5). For a stereo source, x = 0.5, gL = gR = cos(π/4):
  - `EL.L = E0.L + 0.70711·E0.R` and `EL.R = 0.70711·E0.R`, each within ≤ 2 LSB;
  - for a mono source, use `L = cos(π/8)·x`, `R = sin(π/8)·x`, against `x = E0.L/0.70711`.
  - Report the max |Δ| per channel in LSB.
- **EC:** reset to C with the readout click, then export. It must equal E0 within **0 LSB** on both channels and over the whole file.
- **One unsoloed pair (Master −12, music 50L vs E0-unsoloed):** the SFX window [4, 6) and the video window [0, 4) are ≤ 1 LSB on both channels.

### 4.2 R31-PV / R31-PL — live and loop (real audio graph)

**R31-PV** (music solo, Master −12):
- Play from 8.
- At ≈ 10, drag Pan from C to `50L` (synthetic pointer: down, ≥ 3 moves, up).
- **Oracles** (browser hooks):
  - **no new** `AudioBufferSourceNode.start` during or after the drag;
  - `setTargetAtTime` calls land on the **music panner's** `pan` param (tagged through `createStereoPanner`), the last one with value −1, τ 0.015;
  - no call on other panners;
  - the playhead slope stays ≈ 1.0 and `playing` stays true;
  - **history:** the past length is unchanged during the moves; after release it grew by +1, labelled `Pan — მუსიკა`;
  - the music Volume is unchanged.
- **Channels** (destination tap, as in round 30): RMS of the right channel over [12, 14) with music at 50L is ≥ 60 dB below its value at C (or at the tap floor). Report both channels at C and at 50L.
- **Information (expected, not a bug):** at 50L the music **track** meter's left channel receives L+R (up to +6 dB) and may light its over-0 warning, because track meters are pre-Master. The export at Master −12 stays below full scale. Record it; do not file it.
- **Undo while playing:** no new start, and `setTargetAtTime(0, …)` on the music panner.

**R31-PL:**
- Loop 9–13; play and let it wrap once.
- Then keyboard **Home** on the focused music Pan (→ `50L`, one entry), and let it wrap at least twice more.
- **Oracles:**
  - after the change, every iteration is exactly one start per clip;
  - there is no further `setTargetAtTime` on the music panner at the wraps;
  - the right channel over the later iterations stays at the floor.

### 4.3 R31-PH, R31-PG, R31-PD — history, keys, gestures, absence

**R31-PH:**
- a drag is one entry;
- each ArrowLeft/ArrowRight/PageUp/PageDown/Home/End that changes the value is one entry, and one that does not change it (End at `50R`) is none;
- the readout click → C with one entry, then disabled;
- Undo/Redo restore or re-apply the slider value and the readout text;
- at C, the track object has **no** own `pan` (React context read);
- Delete/Backspace on the focused Pan slider leave the clip table unchanged (with a clip selected);
- Space on the focused Pan slider toggles playback;
- Home on the focused Pan slider does not seek (R24-HC behaviour).

**R31-PG:**
- **during a pan drag:** a second synthetic pointer on a clip header cannot move the clip;
- **during a clip drag:** the Pan change is refused, with no entry and the stored pan unchanged;
- **blur during a pan drag** (programmatic `blur()` mid-drag) → no entry, the stored pan is unchanged, and the live panner gets the stored value back;
- **`pointercancel` mid-drag** → the same;
- **Space during a drag** (if the harness can) → after the reschedule the music panner still carries the dragged value (hook the new panner's initial `pan.value` or the first `setTargetAtTime`).

**R31-PD:**
- the video lane has no `arrangement-track-pan`;
- a folded audio lane has none, and unfolding restores it with the same value;
- the reset button is disabled at C and its title is `Pan → C`.

### 4.4 R31-PUI, R31-PC, R31-K, R31-R, R31-S, R31-U, R31-Doc

**R31-PUI**, at 1440×900 (default lanes) and at 1280×720 with the detail panel **open** (lanes 61):
- each audio header has `scrollWidth ≤ clientWidth` and row 1 is one line (≤ 22 px);
- the Pan slider is 48 px wide and the readout 28 px;
- the Volume width is **107**, unchanged;
- the meter top is unchanged versus `b-round-30/geo-*.json` (75 at 81, 55 at 61);
- the row heights match the probe: 81/81/81/81 at 1440, and 53/61/61/61 at 1280 with the panel open;
- the base names are not ellipsized (name `scrollWidth ≤ clientWidth` with the suffix removed, or text measure ≤ box). Record whether the active suffix is ellipsized;
- the Tab order inside the music header is fold → name → Pan → readout → M → S → Volume (record it);
- screenshots at both viewports.

**R31-PC:**
- the slider's `aria-label` is `Pan — {name}` and `aria-valuetext` equals the readout;
- the readout texts are `C`, `25L`, `50R`;
- no "balance" appears in the header text or the attributes.

**R31-K** (adjacent, one run each):
- a Volume drag is still one `Volume` entry;
- Clip Gain `+6` + Enter is still one `Clip Gain` entry;
- the Master Volume is unchanged;
- Mute/Solo work;
- fold/unfold and the height handle work;
- the track meters still move;
- a clip drag still works.

**R31-R** (no pan set):
- play, seek, a Volume change and Mute give the **same** source-start counts as a run on the same page before any pan edit;
- E0 vs EC is 0 LSB (§4.1).

**R31-S** (static, read-only): `diff -u` of `b-round-30-snapshots/` against the live files. Every hunk must be within §3.2; report each hunk's purpose.
- `renderArrangementWav`: no hunk.
- `graph.client.ts`: no new `create*` call.
- `ArrangementLane.tsx`: only row 1 plus the context destructure and helpers.
- No hardcoded colour, no `any`/`@ts-ignore`, and no new `// comment`.

**R31-U:**
- The §2.6 cases exist and are green, and A's red-first output shows them failing on the snapshot sources.
- C runs these mutations in a scratch copy outside `store/`; each must make a test fail. Report how each mutation was done:
  - (a) the panner seed ignores `track.pan` (literal `0`);
  - (b) `syncPlayback` does not push pans;
  - (c) `setTrackPan` keeps `pan: 0`;
  - (d) `setTrackPan` accepts the video track;
  - (e) no rounding;
  - (f) `previewTrackPan` writes `history.present` (or commits per move);
  - (g) blur during a drag commits instead of cancelling;
  - (h) the override is ignored on reschedule;
  - (i) the reset is enabled at C, or makes no entry;
  - (j) `setTrackPan` on the handle has no equal-value early return (expect the "repeated equal value" test);
  - (k) the lane drops the local draft, so the slider shows the stored value during a drag (expect the "during the pointer moves" UI test).

**R31-Doc:** doc 036 covers §2.5 and matches the code.

### 4.5 Gates

**G31-1:**
- tsc 0;
- vitest = **1167** + A's new tests (≥ 18 new `it`), 0 failures. Record `node.exe`. If a failure is a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome `./app` (read-only): exactly the **2** baseline CRLF format errors (`auth.ts`, `auth-bugs.test.ts`), 0 errors in Studio files, and warnings ≤ 218 + 1 info;
- these frozen tests are green: `graph.test.ts`, `track-meter.test.ts`, `track-meter-ui.test.tsx`, `meter-ui.test.tsx`, `master-ui.test.tsx`, `master.test.ts`, `gesture-guard.test.tsx`, `track-layout.test.tsx`, `render-budget.test.tsx`, `clip-gain.test.tsx`, `ArrangementContext.test.ts`, `schedule.test.ts`, `loop.test.ts` and `all-lane-clipboard.test.tsx`.

**G31-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-30-tree-sha256.txt` → **371 OK**;
- `git status --short` = exactly the 7 lines in §3.2;
- HEAD recorded at start and end.

**G31-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (including during pan drags, playback and an export);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied events, and the dev-module `GET /app/lib/r2.config.ts`.

**Not re-run this round:** RF5-3, R3-V1, R3-V4, R11-P3 sync, the C-R27-01 table and the R30-GE/GV/GL series. Video, dock, transport, scheduler and clip gain do not change; R31-S, R31-R and R31-K prove it.

### 4.6 Ableton source and compliance (workflow addendum 2026-10-11)

**Source:** the **Ableton Live 12 Reference Manual**, chapter 18 "Mixing", §18.1 "The Live Mixer". B fetched it with gstack `/browse` on **2026-10-12** and saved it as `../tmp/studio-real-loop/b-round-29/ableton-mixing-20261012.txt` (<https://www.ableton.com/en/live-manual/12/mixing/>). B re-read it on 2026-10-13; no video is used. Quoted:
- "The Pan control positions the track's output in the stereo field and has two different modes: the default Stereo Pan Mode and Split Stereo Pan Mode."
- "In Stereo Pan Mode, the control positions the track's output by increasing the volume of the channel to which the control is set, and simultaneously decreasing the volume of the opposite channel."
- "With multiple tracks selected, adjusting the Pan control for one of them adjusts the others as well."
- "Double-clicking the Pan control resets it to its default value."
- "Note that panning is a non-neutral audio operation; see the Audio Fact Sheet for more information." The fact sheet was **not** captured.
- The Arrangement View has "Track Controls" for mixer features per track.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Per-track pan positions the output in the stereo field | §18.1 | **Confirmed** | Pan slider per audio track in the lane header (Track Controls analogue) | R31-PE, PV |
| Full pan to one side silences the opposite channel | §18.1 ("decreasing the volume of the opposite channel") | **Confirmed in direction**; the amount at the extreme is not stated | Right channel ≤ 1 LSB at 50L | R31-PE |
| Pan law: what happens to the panned-away channel's content | §18.1 refers to the uncaptured Audio Fact Sheet | **Unconfirmed** | W3C `StereoPannerNode` (stereo: the far channel folds into the near one with equal-power gains). This is CZABA's engine choice, never presented as Live's | R31-PE, PE2 |
| Reset to default | §18.1 double-click | **Confirmed** | A readout click resets to C; slider double-click is stage 4b (**conscious difference** this round) | R31-PH |
| Multi-track linked pan | §18.1 | **Confirmed** | CZABA has no track multi-select (**conscious difference**) | — |
| Split Stereo Pan Mode | §18.1 | **Confirmed** | Not provided (**conscious difference**; not requested) | — |
| Every track has pan (incl. video/audio of video) | §18.1 (per track) | **Confirmed** for audio tracks | No pan on the video lane (**conscious difference**) | R31-PD |
| Display format `C`/`50L`/`50R`, range ±50 | — | **Unconfirmed** (not in the captured text) | CZABA display decision | R31-PC |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). A test PASS alone never proves Ableton compliance.

### 4.7 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01 (Medium, Tech Lead quiet Chrome);
- C-R23-01 (Medium, Tech Lead; record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab` as information; round 30: 2 at 28013/28014, 61 609 bytes);
- C-R6-02 and C-R8-01 (Tech Lead quiet Chrome);
- **C-R30-01** (Low → polish round).

**Open low items:**
- R26-M1;
- MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1 and FADER-KEY-ENTRIES (stage 4b);
- R9-REVIEWER-M1-L8 (stage 4c);
- DEMO-SFX-FULL-SCALE;
- L3;
- LIB-SEP-REASON;
- R27-T;
- DOC034-UNREACHABLE-NOTE;
- DOC035-NOTES.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `b-round-30.md` §8):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- the push to the second remote was rejected (reconcile, no force push);
- the CRLF Biome errors on the merged auth files;
- the tracked `frontend-architect.md` grants Write/Bash;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the fake Bearer gets 500 without a token;
- the CDP allowlist;
- the publication-checkpoint requirements;
- `Content-Type` without a charset;
- the dev server's availability.

**Tech Lead manual checks:** the existing list (`feature-status.md` §5, including R30-T) plus:
- **New: R31-T.** In real Chrome with headphones, the Pan drag is smooth (no zipper), `50L` sounds only on the left, and C is centred. The real-mouse slider drag goes to the Tech Lead as well.
- **New: TL-Q-FB05-FB11 (information).** In `2.mp4` 03:08–03:17 the speaker says "პანინგი … ვოლუმი, ტემპი … ესენი არ გვჭირდება" while showing the main mixer. B keeps track pan (FB-05, `1.mp4` 03:39) and tempo (FB-11) in scope; the Tech Lead may clarify.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
sha256sum -c ../tmp/studio-real-loop/b-round-30-tree-sha256.txt | grep -vc ': OK$'
npx vitest run app/lib/arrangement/__tests__/track-pan.test.tsx
npx vitest run app/lib/arrangement/__tests__/graph.test.ts app/lib/arrangement/__tests__/track-meter.test.ts app/lib/arrangement/__tests__/track-meter-ui.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/master.test.ts app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/schedule.test.ts app/lib/arrangement/__tests__/loop.test.ts app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
diff -u ../tmp/studio-real-loop/b-round-30-snapshots/graph.client.ts app/lib/arrangement/graph.client.ts
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If the server is up, A may use the browser (`a-browse.json`) for one smoke check on `/studio-lab`: drag music Pan to the left, then confirm the readout, one `Pan — მუსიკა` entry and no console error. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G31-1/2, R31-S, R31-U, R31-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-31.md`:**
1. the pre-flight gate, including the §1.4 grep results;
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations, the R24-HC note (§2.4) and the §2.7 self-check results.

Do not claim PASS.

**C → `c-round-31.md` and `c-round-31.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the channel counts;
- the track and clip tables;
- the export window numbers per channel (max |Δ| in LSB, `clippedSamples`);
- the hook counts;
- the tap channel RMS values;
- the geometry table;
- the Ableton two-verdict column (§4.6);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers (before the next feature round). **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 32 — stage 4b (fader UX for Volume, Master and Pan):**
  - no jump to the click point;
  - double-click reset;
  - per-key entry coalescing;
  - A-R29-REVIEW-1;
  - pending-commit order (checkpoint review suggestion 5);
  - MASTER-HOLD-TICK-EDGE.
- **Then:** stage 4c (round-9 M1/L8) → the detail-panel/docs polish round (C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE).
- **Then:**
  - SRW-14 (FB-13 grid/snap) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including the edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter contract;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 31 -StartPhase A` and a higher limit.
