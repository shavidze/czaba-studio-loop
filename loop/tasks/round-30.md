# CURRENT TASK — Round 30: SRW-13 stage 3 — FB-04 Clip Gain on one selected audio clip (R13-M1), separate from track Volume, in playback, loop and export

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-12
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11).
Decision record: D-29u in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-29.md`.

> **Environment prerequisite for C (root, not BLOCKED):** the dev server `http://127.0.0.1:5173` answered **200** when B planned (2026-10-12 ~17:25 +04:00). In rounds 27–29 it went down before A/C started. If it is down, root restarts it; no agent starts or stops it.
>
> **Machine load:** B counted **12** `node.exe` at planning time. Every A and C run records the count (`tasklist | grep -ci node.exe`).

## Why this round

**C bugs first:** C round 29 (`c-round-29.md`, `c-round-29.json`) is a **PASS** on every UI-reachable ID (R29-PA..Doc, G29-1..3, vitest 1133/1133).
- Closed: C-R28-01, C-R28-02, A-R28 review finding 4. C-R27-02 is closed by the D-29t rule (3/3 green at 10 `node.exe`).
- Not run: R29-NE and the 40–41 no-op. They are **UI-unreachable by design**, because every UI range lies inside a clip. They are covered by provider tests only, so they are **not PASS**. The doc note goes to a later round (DOC034-UNREACHABLE-NOTE; doc 034 is frozen in this round).
- The open Medium bugs are all with the Tech Lead and need no A round: C-R27-01, C-R23-01, C-R6-02 and C-R8-01.

The next dependency-ordered scope is therefore **SRW-13 stage 3: FB-04 Clip Gain** (user request FB-04: "Clip Gain, ტრეკის Volume-ისგან ცალკე"; acceptance R13-M1: "+6 dB on one clip; track volume unchanged → only that clip louder in playback and export, +6 dB ±0.2").

**References:**
- Backlog v31: `backlog.json` item **SRW-13** (`stages[2]`, `decisions_round30`).
- Progress board: `feature-status.md`.
- B's probe: `b-round-29-probe.txt`.
- Ableton sources: `b-round-29/`.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Previous round:** archived as `tasks/round-29.md`, byte-identical to the dispatched round-29 task (B verified with `cmp`).

**Baseline** (B verified on 2026-10-12):
- HEAD is `c5ed47b`.
- `git status --short` has **67 lines** = `b-round-29-git-status.txt` = `c-round-29/gates/git-status-end.txt`.
- `sha256sum -c ../tmp/studio-real-loop/b-round-29-tree-sha256.txt` → **69 OK**. This is the new frozen list: round 28's 72 files minus the five files A owns in this round, plus `all-lane-clipboard.test.tsx` and doc 034.
- Dispatch snapshots of A's eight existing files are in `../tmp/studio-real-loop/b-round-29-snapshots/`:

  | File | sha256 (first 8) |
  |---|---|
  | `app/types/arrangement.ts` | `9e467c0b` |
  | `app/lib/arrangement/model.ts` | `f67135a8` |
  | `app/lib/arrangement/graph.client.ts` | `988e11b7` |
  | `app/lib/arrangement/clipboard.ts` | `da43c765` |
  | `app/contexts/ArrangementContext.tsx` | `f12fb245` |
  | `app/components/arrangement/ArrangementDetailPanel.tsx` | `1d1fa845` |
  | `app/components/arrangement/StudioWorkspace.tsx` | `ad3b2bed` |
  | `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | `b85c3c96` |

- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat anything in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit or delete them.
- Nobody commits in this round.

## 0. Scope

**The contract after this round:**

| Action | Result |
|---|---|
| Select **one audio clip**, open the detail panel, type a dB value in **Clip Gain, dB**, press Enter (or leave the field) | That clip's level changes by that many dB in playback and in the WAV export. The track Volume, the other clips, Master and the source file are unchanged. There is one history entry `Clip Gain`. |
| Change the gain **while playing** | The level changes smoothly, with no restart, jump, stop or reschedule. It also applies to later loop iterations. |
| Press **0 dB** (reset) | The gain returns to 0 dB, with one history entry. The clip has no `gainDb` field again, so it is identical to a never-changed clip. |
| Undo / Redo | Restores or re-applies the gain exactly, live while playing as well. |
| Split, Duplicate, trim, move, Delete Time (Ctrl+Shift+X), Delete with a gap, Cut/Copy/Paste of that clip or a range of it | Every resulting part or copy keeps the gain. |
| Group selection, a video clip, or no selection | The field and reset are disabled, with a reason. |
| Escape in the field | The text reverts; nothing is committed. |
| A value outside −60…+24 dB | It is clamped to the range, and the status shows the stored value. |

**In (A):**
- the data and model (§2.1), the graph (§2.2), the clipboard carry (§2.3), the context (§2.4);
- the detail-panel column (§2.5) and one wiring prop (§2.6);
- the narrow frozen-test amendment (§2.7);
- doc 035 (§2.8);
- red-first tests in **one new** file (§2.9).

**In (C):** §4.

**Not in this round** (each one is in the user's T12 spec queue, which starts after the original scope; none is deferred FB-04 scope):
- a gain slider with live drag preview, fine (Shift) drag and double-click reset (T12.8/T12.9);
- multi-clip relative gain editing (T12.7; Live 12 §8.13);
- waveform height following clip gain (T12.19);
- a clip gain envelope (T12.10).

Also not in this round:
- FB-05 pan and the fader-click UX (stage 4, round 31);
- A-R29-REVIEW-1 (pending fader flush label; stage 4).

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- the live graph and its gain-node count (`graph.test.ts` l.373);
- the reschedule rule (`scheduleKey`);
- loop iterations;
- the export path (`graph.test.ts` l.384–390 source scan);
- history (JSON equality);
- the clipboard (`clipboard.test.ts` `toEqual` at l.133);
- D-25 paste routing;
- the detail panel's range inputs, wheel guard and geometry;
- the track and Master meters;
- the export overload report;
- the render budget (`render-budget.test.tsx`).

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`;
   - `AUDIO_ARCHITECTURE.md` (required: this round changes audio scheduling);
   - `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`;
   - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

   Also read `prompts/studio-feature.md`, and run the `pre-flight` skill.
2. Check the baseline, and report any difference **before** doing anything else. Do not "fix" it.
   - Run `sha256sum -c ../tmp/studio-real-loop/b-round-29-tree-sha256.txt` and expect **69 OK**.
   - Run `git status --short` and expect **67 lines**, identical to `b-round-29-git-status.txt`.
   - Compare your eight files with the snapshot shas above.
3. Read:
   - `types/arrangement.ts` (`ArrangementClip` l.12–19);
   - `model.ts`:
     - l.455–481 (`setMasterMix`, `masterLinearGain`, `formatMasterGainDb`: your pattern);
     - l.242–271, 331–355, 378–408 (split, duplicate and `deleteTime` use `...clip` spread, so the gain survives them; verify this);
     - l.511–533 (`isSameArrangement` = JSON equality; `commitHistory`);
   - `graph.client.ts`, all of it:
     - options l.44–52, handle l.54–61, `startPlan` l.112–137, `setTrackGain` l.187–196;
     - `renderArrangementWav` l.244–276;
   - `clipboard.ts`:
     - `ArrangementClipboardItem` l.12–18;
     - `materialInWindow` l.51–69, `copyClipsToClipboard` l.92–115;
     - the paste push l.217–224;
   - `ArrangementContext.tsx`:
     - `scheduleKey` l.408–410;
     - `refuseEditDuringGesture` l.569;
     - `startGraph` l.667–708;
     - `syncPlayback` l.837–875 (the non-reschedule branch l.865–872);
     - `applyEdit` l.905–924;
     - the context value objects around l.2481 and l.2565;
   - `ArrangementDetailPanel.tsx`:
     - l.38–67 (reasons and props);
     - l.200–400 (the content; the wheel guard l.232–249 already covers every focused number input);
   - `StudioWorkspace.tsx`:
     - l.205–220 (`isTypingTarget`: number inputs are typing targets, so Delete/Backspace/Ctrl+Z in the field do not reach the workspace);
     - l.1418–1432 (the panel props);
   - the frozen tests:
     - `graph.test.ts` l.95–120, l.360–390 (gain-node count; the `renderArrangementWav` source scan must keep `applySchedule(ctx, planSchedule(arrangement, 0)` and must not contain `setTrackGain`);
     - `schedule.test.ts` l.21–80 and `loop.test.ts` l.179–230 (`ScheduledClip` shape with `toEqual`; **this is why `ScheduledClip`, `schedule.ts` and `loop.ts` stay frozen**);
     - `clipboard.test.ts` l.120–141;
     - `detail-panel-polish.test.tsx` l.360–412;
     - `detail-panel.test.tsx` l.300–335;
     - `master-ui.test.tsx` l.240–260 (`latestHandle()`).
4. **B's probes** (`b-round-29-probe.txt`; scratch copy outside `store/`):
   - Optional `ArrangementClip.gainDb`, `ScheduleHandle.setClipGain` and optional `ApplyScheduleOptions.clipGains` give **tsc 0**.
   - A fourth detail column with one `<label>` + `<input>` fails exactly 2 tests in `detail-panel-polish.test.tsx` (the two "labels … and keeps the aria-labels" tests). The §2.7 amendment makes the file 16/16; `detail-panel.test.tsx` stays 24/24.
   - **Grep yourself** and report:
     - every test or source that builds a `ScheduleHandle`-typed object literal;
     - every consumer of `ArrangementClipboardItem`;
     - every test that asserts on a whole `ArrangementClip` with `toEqual`/`toStrictEqual` after a split, duplicate, paste or Cut Time;
     - every test that counts `setTargetAtTime` calls on clip gain nodes.

     If any frozen assertion would break, **stop and report**: that is a contract conflict for B, not something to edit.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Data and model (`types/arrangement.ts`, `model.ts`)

- `ArrangementClip` gets **one** optional field, `gainDb?: number`. It is present **only when non-zero**; never write `gainDb: 0` or `gainDb: undefined`.
- In `model.ts`:
  - `CLIP_GAIN_MIN_DB = -60`, `CLIP_GAIN_MAX_DB = 24`.
  - `setClipGainDb(arrangement, clipId, gainDb): Arrangement` (another name is fine; document it).
    - It returns **the same object** when:
      - the clip is unknown;
      - the clip's track is not `audio`;
      - `gainDb` is not finite;
      - the stored value would not change.
    - Otherwise:
      - it clamps to the range;
      - it rounds to 0.1 dB (`Math.round(x * 10) / 10`, with `-0` normalised to `0`);
      - when the result is `0`, it **removes** the key;
      - everything else is unchanged.
  - `clipLinearGain(clip): number` returns `10 ** (gainDb / 20)`, or `1` when the field is absent.
  - `clipLinearGains(arrangement): Map<string, number>` contains only clips that have the field.
  - `formatMasterGainDb` may be reused for the clip readout. Do not rename it.
- Split, duplicate, trim, move and `deleteTime` are **not** edited; they keep the field through `...clip`.

### 2.2 Graph (`graph.client.ts`)

- `ApplyScheduleOptions.clipGains?: ReadonlyMap<string, number>` (clipId → linear).
- `ScheduleHandle.setClipGain(clipId: string, value: number): void`.
- `ScheduledSourceState` stores `clipId`.
- The handle keeps a `Map` of clip gain targets, seeded from `options.clipGains`.
- In `startPlan`, `clipGain.gain.value` is the handle map's value for `item.clipId`, or `1`.
  - **Add no node.** The existing per-source `clipGain` is the stage (`graph.test.ts` l.373 counts gain nodes).
- `setClipGain(clipId, value)`:
  - returns immediately when the handle is disconnected, or when `value` equals the stored target (default 1);
  - otherwise stores the value and calls `clipGain.gain.setTargetAtTime(value, ctx.currentTime, GAIN_TIME_CONSTANT)` on **every** live (not ended) source state with that `clipId`.
  - Sources appended later (loop iterations through `appendPlan`) read the stored map.
- `renderArrangementWav` passes `clipGains: clipLinearGains(arrangement)`.
  - Keep the literal `applySchedule(ctx, planSchedule(arrangement, 0)`, and add no `setTrackGain` there (frozen source scan).
  - No other export change. The clamp stays, and nothing normalises or limits.
- No change to taps, meters, panner, master, mute time constants or `measureExportOverload`.

### 2.3 Clipboard (`clipboard.ts`)

- `ArrangementClipboardItem.gainDb?: number`, present only when the source clip has it.
- `materialInWindow` and `copyClipsToClipboard` copy it from the clip.
- The paste push in `planClipboardPaste` writes it onto the pasted clip when present.
- Without gain, every output is **byte-identical** to today, so frozen `clipboard.test.ts` `toEqual` stays green. `cutTimeToClipboard`'s body is unchanged (it uses `materialInWindow`).
- No change to the routing rule (D-25/D-29t), refusals, overlap or the `at` clamp.

### 2.4 Context (`ArrangementContext.tsx`)

- **`scheduleKey`** ignores `gainDb`. A gain-only change must not reschedule.
  - One option is a `JSON.stringify` replacer, `(key, value) => (key === 'gainDb' ? undefined : value)`. It is safe because `master` is not in the key array, and it avoids an unused destructured binding.
  - The provider tests with fake audio (`master-ui`, `meter-ui`, `track-meter-ui`) now reach `handle.setClipGain` through `syncPlayback`. Run them (§5) and report any fake handle that lacks the method; that would be a frozen conflict for B.
- **`startGraph`** passes `clipGains: clipLinearGains(arrangement)` to `applySchedule`.
- **`syncPlayback`'s non-reschedule branch** (after the track gains and Master, l.869–872) calls `handle.setClipGain(clip.id, clipLinearGain(clip))` for every clip. The handle ignores unchanged values, so a fader preview frame costs only map lookups.
- **New context action `setClipGain(clipId: string, gainDb: number): boolean`:**
  - if `refuseEditDuringGesture()` → return `false`;
  - otherwise `return applyEdit(setClipGainDb(present, clipId, gainDb), CLIP_GAIN_LABEL)`, with `CLIP_GAIN_LABEL = 'Clip Gain'`;
  - add it to the context type and to both value objects, with a stable `useCallback`.
- No change to the volume/master preview machinery, the transport, the loop, the video, the dock or the meters.

### 2.5 Detail panel (`ArrangementDetailPanel.tsx`)

**Props:** add `setClipGain: (clipId: string, gainDb: number) => boolean` to `ArrangementDetailContentProps`.

**New column:** a fourth column after the range column:

```
<div className="flex w-32 shrink-0 flex-col gap-1" data-testid="arrangement-detail-clip-gain">
```

**The column contains:**
- `<label className="flex flex-col text-dim">Clip Gain, dB<input …/></label>`:
  - `type="number"`, `step={0.1}`, `min={-60}`, `max={24}`;
  - reuse `inputClass`;
  - `aria-label="Clip Gain (dB)"`, `data-testid="arrangement-detail-clip-gain-input"`.
- a button with the text `0 dB`:
  - `aria-label="Clip Gain-ის განულება (0 dB)"`, `data-testid="arrangement-detail-clip-gain-reset"`;
  - the same classes as the `მონიშვნა` button.
- a reason `<p>` with its **own** `useId` and `data-testid="arrangement-detail-clip-gain-reason"`, wired to the input with `aria-describedby`. Do not reuse `arrangement-detail-reason`.

**Enabled only for a single selected audio clip** (`selection && !selection.isVideo`). Otherwise the input and reset are disabled, with a `title` and one of these reasons:

| Case | Reason text |
|---|---|
| Nothing selected | `ჯერ აირჩიე კლიპი` (reuse `DETAIL_INPUTS_NONE_REASON`) |
| Group | `Clip Gain ერთ აუდიო კლიპზე ისმება — აირჩიე ერთი` |
| Video clip | `ვიდეო კლიპს Clip Gain არ აქვს — ხმა: ხაზის Volume/Mute` |

**Reset** is also disabled when the clip has no gain.

**Text:**
- It shows `(clip.gainDb ?? 0).toFixed(1)`.
- It re-syncs when the clip id or its `gainDb` changes (a `useLayoutEffect`, as the range texts do).

**Commit** (Enter, or blur when the text differs from the current value):
1. If `isPointerGestureActive()`: status `GESTURE_EDIT_BLOCKED_MESSAGE`, then revert the text.
2. Empty or non-numeric text: status `Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).`, then revert the text. No entry.
3. Otherwise call `setClipGain(clip.id, value)`.
   - If it returns `true`: status `Clip Gain: {title} — {formatMasterGainDb(stored)}.`. The stored value is the clamped and rounded one, so `+30` reads `+24.0 dB`.
   - If it returns `false` because nothing changed: on Enter, status `Clip Gain უცვლელია: {formatted}.`; on blur, nothing.

**Escape** reverts the text and does not commit. The following blur must not commit either.

**Selection change with uncommitted text** (B decision; not left to A): the content already **remounts** on every selection change (`key={selection?.clip.id …}` at l.664; frozen polish test l.301–305). Uncommitted text is therefore **discarded**: no commit, no history entry, and no status, for either the old or the new clip. If a browser blur fires during the unmount, it must not commit (guard it, for example by committing only while mounted).

**Reset** runs the same step 1 gesture check first, then calls `setClipGain(clip.id, 0)`, with the commit status. After step 1, a `false` return from `setClipGain` always means "unchanged", never "refused".

**Constraints:**
- No new colour or token. No change to the info column (`w-72`, its `span.font-sans` labels), the waveform, the range column or the panel header.
- The label is **Clip Gain**. Never write "input", "sensitivity", "მგრძნობელობა" or "trim" anywhere in the UI.

### 2.6 Wiring (`StudioWorkspace.tsx`)

- Pass `setClipGain` from `useArrangement()` to `<ArrangementDetailPanel … />`, and change **nothing else** in this file.

### 2.7 Frozen-test amendment (`detail-panel-polish.test.tsx`)

**Only** inside `detailLabelTexts` (l.363–379), change the two queries:
- l.372 `content.querySelectorAll('label')`;
- l.375 `content.querySelectorAll('input')`.

Each must exclude descendants of `[data-testid="arrangement-detail-clip-gain"]`. B's probe used `'label:not([data-testid="arrangement-detail-clip-gain"] *)'` and the same for `input`.
- Biome may re-wrap those two statements.
- Every other line of the file stays byte-identical, including all expectation lines (`toEqual([...])` at l.384–385 and l.398–399). C diffs it.

### 2.8 Doc 035 (`docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md`)

Georgian; technical terms in English; follow `docs/implementation/TEMPLATE.md`. Cover:
- the contract table of §0;
- the data rule (absent unless non-zero; range; rounding);
- the graph design (the `clipGains` option, `setClipGain`, why there is no reschedule, the loop append);
- the clipboard carry;
- the UI and its disabled reasons;
- the frozen-test amendment, with the reason;
- the tests;
- the Ableton table (§4.6, with statuses);
- the T12 items that are explicitly not in this round (§0).

### 2.9 Tests (written first; red on the snapshot sources)

**Order:**
1. Write the new tests against the **unchanged** sources.
2. Run them and paste which fail and why. If the file fails to load (missing exports), prove red in a scratch copy **outside `store/`**, as in rounds 24–29, and say how.
3. Implement, then re-run.

**New file:** `app/lib/arrangement/__tests__/clip-gain.test.tsx`. No other test file changes except the §2.7 lines.

At least **16** new `it` blocks. Each fixture must make the wrong behaviour observable: two clips on the **same** audio track with different gains, plus a clip on another track.

1. **Model:**
   - `setClipGainDb(+6)` changes only that clip, and leaves tracks (`volume`), master and the other clips unchanged.
   - Setting `0` removes the key (`Object.hasOwn` is false), and the result `isSameArrangement` with the never-changed arrangement.
   - Clamp: `+30` → 24 and `-100` → −60. Rounding: `6.04` → 6. Same-object returns for NaN, an unknown id, a video-track clip and an unchanged value.
   - Split, duplicate and `deleteTime` keep `gainDb` on every part or copy.
2. **Graph** (fake context, as in `graph.test.ts`):
   - `clipGains` sets that clip's `clipGain.gain.value` to `10 ** (6 / 20)`, and the others to `1`. The gain-node count is unchanged.
   - `setClipGain`:
     - calls `setTargetAtTime` on that clip's live sources only;
     - a repeated equal value makes no call;
     - a source appended later through `appendPlan` for that clip starts at the new value;
     - nothing happens after `disconnect`.
   - The `renderArrangementWav` source contains `clipGains:`. That is a source scan like the frozen one, because jsdom has no `OfflineAudioContext`.
3. **Clipboard:**
   - `copyClipsToClipboard` and `copyRangeToClipboard` carry `gainDb`, and `planClipboardPaste` writes it on the pasted clip;
   - a clipboard from clips without gain has **no** own `gainDb` on any item.
4. **Provider** (real provider, fake audio as in the frozen tsx tests):
   - `setClipGain` → one history entry `Clip Gain`; Undo restores the absence of the key; Redo re-applies it;
   - an unchanged value → `false`, and no entry;
   - while playing, a gain-only change does **not** reschedule (no new source starts) and reaches the clip gain node through `setTargetAtTime`;
   - Undo while playing does the same;
   - a refusal during a pointer gesture.
5. **UI** (real `StudioWorkspace`):
   - type `6` + Enter → the store has `gainDb` 6, the status is the commit text, and there is one entry;
   - Escape then blur → no entry;
   - blur with changed text commits;
   - `0 dB` reset → no key, and the reset is disabled afterwards;
   - group, video clip and nothing selected → disabled, with the three exact reasons;
   - Delete and Backspace in the focused field do not delete the clip;
  - dirty text (for example `9`), then select another clip → no entry, both clips keep their gain, and the new clip shows its own value;
  - `0 dB` during a pointer gesture → `GESTURE_EDIT_BLOCKED_MESSAGE`, and no entry;
   - the panel text contains no `sensitivity`/`მგრძნობ`.

### 2.10 After the code

- Self-check these edge cases:
  - a gain change on a clip that has no live source while playing (map only);
  - a gain change during a loop wrap;
  - Undo of a paste that carried gain;
  - a pending track-volume preview when committing gain (the existing `applyEdit` flush; record what the undo label shows);
  - a selection change while the field has uncommitted text (the contract is fixed in §2.5: discarded, no commit; test it, and report what the browser does on unmount).
- Run `npx biome check --write` **only** on your own code and test files, then a read-only `npx biome check ./app`.
- Run the `code-reviewer` agent (more than 3 files changed) and report its findings and your dispositions.
- **Mutation checks only in a scratch copy outside `store/`.** Never mutate in place.
- Run the §5 commands. One browser smoke check is allowed if the server is up.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

The 67 lines of `b-round-29-git-status.txt`, including the two foreign agent files (not Studio work; do not touch).

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/types/arrangement.ts` | A | `ArrangementClip.gainDb?` only |
| `app/lib/arrangement/model.ts` | A | §2.1 only (new constants and helpers) |
| `app/lib/arrangement/graph.client.ts` | A | §2.2 only |
| `app/lib/arrangement/clipboard.ts` | A | §2.3 only |
| `app/contexts/ArrangementContext.tsx` | A | §2.4 only |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | §2.5 only |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.6 only (one prop) |
| `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | A | §2.7 only (two queries in `detailLabelTexts`) |
| `app/lib/arrangement/__tests__/clip-gain.test.tsx` | A | **new**, §2.9 |
| `docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md` | A | **new**, §2.8 |
| `../tmp/studio-real-loop/a-round-30.md`, `a-round-30/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-30.md`, `c-round-30.json`, `c-round-30/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: exactly 69 lines.** That is the 67 baseline lines plus:

```
?? app/lib/arrangement/__tests__/clip-gain.test.tsx
?? docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md
```

The eight existing owned files are already in the 67 (` M` or `??`). Check this and report if not.

### 3.3 Frozen this round

**Frozen:** all 69 files in `b-round-29-tree-sha256.txt` and everything else under `store/`. That includes:
- `schedule.ts`, `loop.ts`, `meter.ts`, `transport.ts`, `video-sync.ts`, `view.ts`, `panels.ts`, `position-store.ts`;
- `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementTransport.tsx`, `ArrangementMaster.tsx`, `ArrangementTrackMeter.tsx`, `ArrangementExportDialog.tsx`, `ArrangementLibrary.tsx`;
- doc 034;
- **every existing test** except the §2.7 lines.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**` and `../backend/**`;
- user settings, env/config files and the sitemap; `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..29 work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewports:** 1440×900; also 1280×720 for R30-GUI.

**Harness rules (unchanged):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press`/`$B type`.
- Ranges, seeks and library drops come from the existing gestures or synthetic events, as in round 29.
- No source instrumentation. C may hook browser APIs (`AudioBufferSourceNode.prototype.start`, `AudioParam.prototype.setTargetAtTime`, `AudioNode.prototype.connect`, `BaseAudioContext.prototype.createGain`), labelled as such.
- Mutations run only in a scratch copy outside `store/`.
- **Every run and every vitest gate records the `node.exe` count.**

**Layout L30** (record the clip table [id, lane, start, offset, duration, gainDb] before and after each step):
- library `სრული მიქსი` on music at 7 (7–23), split at 15 into **A** (7–15) and **B** (15–23);
- `Soft impact` on SFX at 4 (4–6);
- the demo video at 0 (0–6.008).

**Checkpoint order if the session may end:** G30 → R30-GE → R30-GV/GL → R30-GH/GK/GD → R30-GN → R30-GUI → rest. Write `c-round-30/checkpoint.md` as you go.

### 4.1 R30-GE — the R13-M1 export oracle (decode)

**Setup:** music solo and Master **−12.0 dB** in **both** exports. At Master 0 the music peak (0.574 in round 29) would clamp at +6 dB and falsify the ratio. WAV 48 kHz / 24-bit.
- **E0:** export with every clip at 0 dB.
- **E+6:** set B to `+6` (field + Enter), then export.
  - Window [15, 23) (B): `20·log10(rms(E+6) / rms(E0))` = **+6.0 ± 0.2 dB**. Also report the per-sample max |E+6 − 1.99526·E0| in LSB.
  - Window [7, 15) (A, same track): max |Δ| ≤ **1 LSB**.
  - The track Volume slider value is unchanged before and after (read the control).
- **E−6:** set B to `−6`, then export. Window [15, 23) is −6.0 ± 0.2 dB, and [7, 15) is ≤ 1 LSB.
- **One unsoloed pair (Master −12, B +6 vs 0):** the SFX window [4, 6) and the video window [0, 4) are ≤ 1 LSB.
- **Information (expected, not a bug):** at Master 0 with B at +6, the export overload alert appears, and the Master Clip latch and the music track warning light up while playing. Record it.

### 4.2 R30-GV / R30-GL — live and loop (real audio graph)

**R30-GV:**
- Play from 14. At ≈ 16 (inside B), commit `+6`.
- Oracles (browser hooks):
  - **no new** `AudioBufferSourceNode.start` call (no reschedule);
  - one `setTargetAtTime(≈1.99526, …)` on the GainNode that B's source connects to;
  - the playhead slope stays ≈ 1.0, and `playing` stays true;
  - the track Volume is unchanged.
- **Meter:**
  - play [17, 19) twice (B at 0, then at +6) and read the music track meter peak; the difference is **+6 ± 1 dB**;
  - the Master meter moves by the same amount within ± 1 dB.
- Undo while playing: no new start, and a `setTargetAtTime(1, …)` on B's node.

**R30-GL:**
- Loop 13–17 (spans A|B). Play, let it wrap at least once, then commit B `+6` and let it wrap at least twice more.
- Oracle: every **later** B source (identified by its start `offset` ≥ 8) connects to a GainNode whose value at start is ≈ 1.99526. A's later sources start at 1.
- The loop seam stays as before (no extra starts beyond one per clip per iteration).

### 4.3 R30-GH, R30-GK, R30-GD — history, keys, disabled states

**R30-GH:**
- each commit is exactly one history entry, `Clip Gain`;
- typing digits or ArrowUp/ArrowDown in the field without a commit makes no entry;
- Enter on an unchanged value → no entry, and status `Clip Gain უცვლელია: …`;
- Undo/Redo restore or re-apply the field text and the gain;
- `0 dB` reset → one entry; the clip object has **no** own `gainDb` (React context read), and reset becomes disabled.

**R30-GK:**
- Escape reverts the text, and a following Tab/blur makes no entry;
- empty text + Enter → the invalid status, and no entry;
- `30` → stored `+24.0 dB` (status), `-100` → `−60.0 dB`;
- Delete/Backspace inside the focused field do not delete the clip, and the clip table is unchanged;
- a commit or a `0 dB` reset during a clip drag → `GESTURE_EDIT_BLOCKED_MESSAGE`, and no entry;
- type `9` without a commit, then click another clip → no entry, and neither clip changes;
- the wheel over the focused field does not change it.

**R30-GD:**
- nothing selected → disabled with `ჯერ აირჩიე კლიპი`;
- a group → disabled with the group reason;
- the video clip → disabled with the video reason;
- the reasons are linked via `aria-describedby`.

### 4.4 R30-GN — the gain survives edits (+ export proof)

With B at +6, check that the gain survives each of these:
- Split B at 19 → both parts show `6.0`;
- Duplicate a part → the copy shows `6.0`;
- move and trim → it is kept;
- Ctrl+Shift+X on a range inside A → B shifts left and keeps +6;
- Delete on a range inside B (gap kept) → both remaining parts keep +6;
- select B → Ctrl+C → active music, seek 30 → Ctrl+V → the pasted clip shows `6.0`;
- a range copy of part of B pasted elsewhere → `6.0`.

**Export proof for the pasted clip (Master −12, music solo):** its window equals B's source window × 1.99526 within the R30-GE bounds.

**D-25 regression:** a single-lane range on music, Ctrl+X, active SFX, Ctrl+V → it goes to SFX with `· SFX ხაზზე` and keeps its gain.

### 4.5 R30-GUI, R30-GC, R30-K, R30-R, R30-S, R30-U, R30-Doc

**R30-GUI (1440 and 1280, detail panel open, one audio clip selected):**
- the clip-gain column is visible inside `arrangement-detail-content`;
- the content has no horizontal overflow (`scrollWidth ≤ clientWidth`);
- the info column is 288 px wide, and the waveform box is ≥ 128 px wide;
- with a range shown, the footer is 89, and the scroller is 476 at 1440 and 280 at 1280 (= R29-FT);
- the Tab order is range start → end → `მონიშვნა` → Clip Gain → `0 dB` (record it);
- screenshots.

**R30-GC:** the UI text in the panel and footer contains no `sensitivity`, `input gain`, `მგრძნობ` or `trim` for the gain; the label is `Clip Gain, dB`.

**R30-K (adjacent, one run each):**
- the range inputs Apply/Enter still work;
- the track Volume fader preview is still one `Volume` entry;
- the Master Volume is unchanged;
- clip drag/move still works;
- Ctrl+Shift+L / Ctrl+Shift+X / Delete as in round 29 (one run).

**R30-R (no gain set):**
- play, seek, a track volume change and Mute make the **same** source-start counts as before this change (compare with a run on the same page with no gain edits);
- the track meters still move;
- the export with every gain at 0 equals the round-29 export of the same layout within 0 LSB, if C still has `pa-export-before.json`'s layout; otherwise E0 is the reference.

**R30-S (static, read-only):** `diff -u` of `b-round-29-snapshots/` against the live files. Every hunk must be within §3.2 (report each hunk's purpose):
- `detail-panel-polish.test.tsx`: only the two queries;
- `StudioWorkspace.tsx`: only the prop;
- `graph.client.ts`: no new `create*` call;
- no hardcoded colour and no `any`/`@ts-ignore`.

**R30-U:**
- the §2.9 cases exist and are green, and A's red-first output shows them failing on the snapshot sources;
- C mutations in a scratch copy outside `store/`; each must make a test fail. Report how each mutation was done:
  - (a) `startPlan` ignores `clipGains`;
  - (b) `setClipGain` does not update the stored map (an appended source reverts);
  - (c) `scheduleKey` includes `gainDb`;
  - (d) `setClipGainDb` keeps `gainDb: 0`;
  - (e) the clipboard drops `gainDb`;
  - (f) `setClipGainDb` accepts a video clip;
  - (g) `renderArrangementWav` omits `clipGains`;
  - (h) no rounding;
  - (i) the panel commits on Escape-then-blur.

**R30-Doc:** doc 035 covers §2.8 and matches the code.

### 4.6 Ableton source and compliance (workflow addendum 2026-10-11)

**Source:** the **Ableton Live 12 Reference Manual**, fetched by B on **2026-10-12 17:23 +04:00** with gstack `/browse` and saved in `../tmp/studio-real-loop/b-round-29/`:
- `ableton-clip-view-20261012.txt` — <https://www.ableton.com/en/live-manual/12/clip-view/>:
  - §8.4.7 "Clip Gain and Pitch": "The Gain slider, calibrated in dB, changes the clip gain. When multiple audio clips with different Gain values are selected, the value range is shown with split triangle handles on the Gain slider.";
  - §8.13 "Editing Clip Properties for Multiple Clips": differing values are shown as a range, and dragging to the extreme makes them identical;
- `ableton-arrangement-view-20261012b.txt` — <https://www.ableton.com/en/live-manual/12/arrangement-view/>: "You can enlarge the waveform display in audio clips using the Waveform Vertical Zoom Level slider … without having to adjust the clip gain."

No video is used. The captured text states **no** gain bounds, **no** reset gesture, and nothing about what Cut/Copy/Paste/Split do to clip gain.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Per-clip gain in dB, set in the clip's properties | §8.4.7 | **Confirmed** | Numeric dB field in the detail panel (the CZABA clip properties). There is no slider this round (**conscious difference**; slider and drag are T12.8/T12.9) | R30-GE, GH |
| Clip gain is separate from track Volume | §8.4.7 names a clip property; the track signal flow is not in the captured text | **Unconfirmed** (the T12 note's claim is not re-verified) | The per-clip `clipGain` node before the track gain (the existing graph); the track Volume is untouched | R30-GE (A unchanged, Volume read) |
| Multi-clip selection shows a value range | §8.4.7, §8.13 | **Confirmed** | Disabled for groups with a reason (**conscious difference**; T12.7 later) | R30-GD |
| Waveform zoom is not gain | Arrangement View, Waveform Vertical Zoom | **Confirmed** | CZABA has no waveform zoom, and the waveform does not follow gain this round (T12.19 later) | — (არ ეხება for zoom) |
| Gain bounds | — | **Unconfirmed** (not in the text) | −60…+24 dB, 0.1 dB | R30-GK |
| Reset to 0 dB | — | **Unconfirmed** | `0 dB` button | R30-GH |
| Clip gain survives split/duplicate/paste | — | **Unconfirmed** | Kept (data integrity) | R30-GN |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). A test PASS alone never proves Ableton compliance.

### 4.7 Gates

**G30-1:**
- tsc 0;
- vitest = **1133** + A's new tests (≥ 16 new `it`), 0 failures. Record `node.exe`. If a failure is a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome 0 errors on `./app` (read-only), with the warning count not above round 29's 218 + 1 info;
- these frozen tests are green: `graph.test.ts`, `schedule.test.ts`, `loop.test.ts`, `clipboard.test.ts`, `master.test.ts`, `master-ui.test.tsx`, `meter-ui.test.tsx`, `track-meter-ui.test.tsx`, `detail-panel.test.tsx`, `detail-panel-polish.test.tsx` (amended), `render-budget.test.tsx`, `gesture-guard.test.tsx`, `ArrangementContext.test.ts` and `all-lane-clipboard.test.tsx`.

**G30-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-29-tree-sha256.txt` → **69 OK**;
- `git status --short` = the 67 baseline lines plus exactly the 2 lines in §3.2 (69 lines);
- `Header.tsx` is identical to HEAD, and nothing else under `store/` changed.

**G30-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (including during gain edits, playback and an export);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts`.

**Not re-run this round:** RF5-3, R3-V1, R3-V4, R11-P3 sync and the C-R27-01 table. The video, dock, transport and scheduler timing do not change; R30-S, R30-R and R30-GV's start counts prove that.

### 4.8 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01 (Medium, Tech Lead quiet Chrome; vm-5 287.6 ms);
- C-R23-01 (Medium, Tech Lead; record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab` as information, as in round 29: 2 at 28013/28014);
- C-R6-02 and C-R8-01 (Tech Lead quiet Chrome).

**Open low items:**
- R26-M1;
- the Master hold tick (stage 4);
- DEMO-SFX-FULL-SCALE (Tech Lead a/b);
- L3 (removed-track taps);
- LIB-SEP-REASON;
- R27-T (the 4 px over cap);
- R9-REVIEWER-M1-L8 (stage 4);
- A-R29-REVIEW-1 (stage 4);
- DOC034-UNREACHABLE-NOTE.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- the final commit/push only after everything, and the uncommitted round-6..29 tree (67 lines);
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4, C's python probes in rounds 21–22, and C round 29's `npx` cache download of vitest 5.0.4 (store unchanged);
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push);
- `Content-Type: text/html` without a charset;
- the dev server repeatedly down at A/C start (rounds 27–29).

Root review M1–M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

**Tech Lead manual checks:** R23-1/2, R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, R25-T, R26-T, R27-T, R28-T, Lenis `/studio/*`, and the positive MP4/MOV import path.
- **New: R30-T.** In real Chrome with headphones, a clip gain change while playing has no click or zipper (τ 15 ms), and +6 dB on one clip is audibly louder only on that clip.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-29-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/clip-gain.test.tsx
npx vitest run app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx app/lib/arrangement/__tests__/track-meter-ui.test.tsx app/lib/arrangement/__tests__/graph.test.ts app/lib/arrangement/__tests__/schedule.test.ts app/lib/arrangement/__tests__/loop.test.ts app/lib/arrangement/__tests__/clipboard.test.ts app/lib/arrangement/__tests__/master.test.ts app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
git diff --stat cc1e531 -- app/components/layout/Header.tsx
diff -u ../tmp/studio-real-loop/b-round-29-snapshots/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If the server is up, A may use the browser (`a-browse.json`) for one smoke check on `/studio-lab`: select a music clip, `+6` + Enter, and confirm the status, one `Clip Gain` entry and no console error. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G30-1/2, R30-S, R30-U, R30-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-30.md`:**
1. the pre-flight gate, including the §1.4 grep results;
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations, and the observed unmount/blur behaviour (§2.5).

Do not claim PASS.

**C → `c-round-30.md` and `c-round-30.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the clip tables;
- the export window numbers (dB ratio, max |Δ| in LSB);
- the hook counts;
- the meter deltas;
- the Ableton compliance column (§4.6);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers (before the next feature round). **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 31: SRW-13 stage 4:**
  - FB-05 track pan (R13-M2: fully left → the export's right channel of that track ≈ silent);
  - the fader-click UX decision for every fader (C round 22 §5);
  - round-9 M1/L8;
  - the Master hold tick at ≥ +6 dBFS;
  - A-R29-REVIEW-1.
- **Then:**
  - SRW-14 (FB-13 grid/snap) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including the edge fades C noted) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter contract;
  - DOC034-UNREACHABLE-NOTE;
  - the full regression and the root check;
  - then T12, including T12.7/T12.8/T12.9/T12.19 for clip gain.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 30 -StartPhase A` and a higher limit.
