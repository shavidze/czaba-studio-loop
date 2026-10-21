# CURRENT TASK — Round 25: SRW-13 stage 1 — Master Volume, Master Mute and the export overload warning (FB-14; R13-M3, R13-M4 export part; D-29p)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

## Why this round

C round 24 (`c-round-24.md`, `c-round-24.json`) is a **PASS** with no new bug: R24-H, HC, F, R, S, U, Doc, G24-1..3 and the export sanity check all pass, with vitest at 1010/1010. B re-checked the end state independently: HEAD `c5ed47b`, 47 status lines identical to `c-round-24/gates/git-status-end.txt`, 51 OK, owned shas `324061ea…`/`1d1fa845…`/`8e08f456…`/`ff9e74da…`, `nextElementSibling` 0, `/studio-lab` NUL 4. All A round-11 follow-ups are now closed.

**C bugs first:**
- C has no open critical/high bug.
- **C-R23-01** (medium, SSR NUL) still waits for the Tech Lead's choice between (a) React 19 and (b) a narrow `entry.server.tsx` grant (`b-round-23.md` §3). Nobody has answered yet, so A cannot fix it: both files are outside A's ownership. It is not deferred. As soon as the Tech Lead answers, B schedules it before the next feature round.
- C-R6-02 and C-R8-01 need the Tech Lead's quiet-Chrome run.

So this round starts the next unimplemented scope in dependency order: **SRW-13 (FB-04, FB-05, FB-14)**. This is **stage 1** of 4. The full request is kept and split into separately verifiable stages (§7):
1. **Master bus:** Master Volume (dB) and Master Mute, in live playback **and** in the WAV export. Both are undoable.
2. **Export overload warning (R13-M4 export part):** after rendering, the export measures the pre-clamp peak and the number of clamped samples. If the mix went over full scale, the dialog says so and gives the needed Master reduction. This makes the known R13-M4 hard-clip (1800 full-scale samples on `lay11`) visible to the user instead of silent.

The live overload/clip indicator and the meters are stage 2 (§7). They are **not** in this round and **not** dropped.

**Previous round:** archived as `tmp/studio-real-loop/tasks/round-24.md` (sha `7faf3696…`).

**References:**
- B's record: `b-round-24.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-02 graph, D-03 model, D-29p).
- User request: `C:/Apps/czaba-project/docs/video-to-text-bugs/README.md` FB-14 ("Master Volume, საერთო გათიშვა და საბოლოო დონის/გადატვირთვის კონტროლი"; the compressor and other effects are mentioned only as future ideas and are out of scope).
- Backlog: `backlog.json` SRW-13 (R13-M3, R13-M4).
- B's geometry measurement: `b-round-24/geometry.txt`.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used, and it has no master. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline:** HEAD `c5ed47b` plus the round-6..24 dirty tree.
- `git status --short` has **47 lines**, identical to `c-round-24/gates/git-status-end.txt`. B's copy is `b-round-24-git-status.txt`.
- Frozen for this round: `../tmp/studio-real-loop/b-round-24-tree-sha256.txt`, **50 files**. That is round 23's 51, minus the five files A owns this round, plus five more:
  - removed: `types/arrangement.ts`, `model.ts`, `graph.client.ts`, `ArrangementContext.tsx`, `ArrangementExportDialog.tsx`;
  - added: `ArrangementDetailPanel.tsx` (`1d1fa845…`), `track-layout.test.tsx` (`8e08f456…`), doc 030 (`ff9e74da…`) and `model.test.ts` (`3db058ce…`). `schedule.ts` was already in the list, so the count is 50.

  B verified 50 OK on the live tree.
- Dispatch snapshots of A's seven existing files are in `../tmp/studio-real-loop/b-round-24-snapshots/`:

  | File | sha256 |
  |---|---|
  | `app/types/arrangement.ts` | `4f8b93fe…` |
  | `app/lib/arrangement/model.ts` | `98f8de60…` |
  | `app/lib/arrangement/graph.client.ts` | `db337424…` |
  | `app/contexts/ArrangementContext.tsx` | `d9a14202…` |
  | `app/components/arrangement/StudioWorkspace.tsx` | `324061ea…` |
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `146aa2fa…` |
  | `app/lib/arrangement/__tests__/schedule.test.ts` | `52bad7b3…` |

- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any file in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit or delete them.
- Nobody commits in this round.

## 0. Scope

**In (A):**
- the master model (§2.1);
- the master in the graph (§2.2);
- the export overload report and the master in the export (§2.3);
- the context and history (§2.4);
- the UI: a new `ArrangementMaster.tsx` in the workspace header, and the export dialog notes (§2.5);
- red-first tests in **two new** test files, plus one fixture line in `schedule.test.ts` (§2.6);
- implementation doc 031.

**In (C):** R25-MV, R25-MM, R25-ML, R25-E0, R25-E6, R25-EM, R25-EO, R25-H, R25-K, R25-L, R25-R, R25-S, R25-U, R25-Doc, G25-1..3, and the C-R23-01 information record (§4).

**Not in this round** (scheduled; not PASS):
- **SRW-13 stage 2:** the live level meters (per track and master), peak hold and the master clip/overload indicator (FB-14 "გადატვირთვის ჩვენება" live part, R13-M4 meter part).
- **SRW-13 stage 3:** FB-04 clip gain in the detail panel (R13-M1).
- **SRW-13 stage 4:** FB-05 track pan (R13-M2), plus:
  - the fader-click UX note (C round 22 §5);
  - context items M1 (the `transportRunningRef` latch, round-9 reviewer) and L8 (the `useArrangementPositionStore` error message names `useArrangementPosition`).
  Both are in `ArrangementContext.tsx`, which stage 4 edits anyway. They ride with stage 4 at the latest.
- **C-R23-01:** awaits the Tech Lead (§7).
- **LIB-SEP-REASON** (`ArrangementLibrary.tsx:549`): the first round that edits `ArrangementLibrary.tsx`, or at the latest the fix round before the final regression. The file is frozen here.
- **Other later items:**
  - the lane overlay `/60` (SRW-14 or SRW-18);
  - the footer selected-clip Latin text;
  - the Latin `range` in the group hint;
  - folded clips staying in the accessibility tree (SRW-17).
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, L2/L3 (with C-R8-01), and the manual list in §4.9.

**Out of scope for the whole project:** plugins and effects (including a compressor or a limiter), pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch. The 24-bit clamp in the export stays a clamp. The UI and doc 031 must **not** call it a limiter, and the export must not add any normalisation or soft-clip.

**What could be affected (C checks these):**
- the arrangement model and its JSON equality (history entries);
- every literal that builds an `Arrangement`;
- live playback: track Volume, Mute and Solo, the mute de-click from round 22, loop wraps and the absence of reschedules;
- video audio through the graph;
- the export file at Master 0 dB, which must stay identical to round 24;
- the header and transport geometry, and through them every lane and floating-video layout reference;
- the global keyboard (Space, Home and arrows on a range input);
- `render-budget.test.tsx`;
- `export-dialog-focus.test.tsx`;
- the anonymous `/studio-lab` network policy.

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `AUDIO_ARCHITECTURE.md` (Studio audio). The real code is authoritative where the primitive's examples are older (plan §1);
   - `FORWARDREF_COMPONENT.md` (new component);
   - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (no hardcoded colours);
   - `REACT_CONTEXT.md` (context change);
   - `AGENT_DISCOVERABLE_CODE.md` (naming);
   - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
   - `GEORGIAN_DOCS.md` (doc 031).

   Also read `prompts/studio-feature.md` and `prompts/new-component.md`, and run the `pre-flight` skill.

   Run the `design-philosopher` agent once, read-only, for the visual form of the header Master group. Its constraints: tokens only, the header height must stay unchanged (§2.5), and Georgian UI text with the DAW terms "Master", "Mute" and "dB" kept in English (D-07). Report its advice and your dispositions.
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-24-tree-sha256.txt` and expect **50 OK**. Run `git status --short` and expect **47 lines**, identical to `c-round-24/gates/git-status-end.txt`. Compare your seven existing files with the snapshot shas above. Report any difference **before** doing anything else, and do not "fix" it.
3. Read:
   - `types/arrangement.ts`;
   - `model.ts` l.78–90, l.110–120 and l.427–520 (`createArrangement`, `setTrackMix`, `isSameArrangement`, history);
   - `schedule.ts`;
   - `graph.client.ts` (all of it);
   - `ArrangementContext.tsx` l.128–270 (value and types), l.290–330, l.533–715 (`startGraph`, `syncPlayback`, `applyEdit`), l.1740–1882 (Mute, Solo and the whole track-volume gesture pipeline) and l.1884–1930 (`exportWav`);
   - `StudioWorkspace.tsx` l.1276–1301 (header and transport) and l.995–1180 (global keydown);
   - `ArrangementLane.tsx` l.359–515 (the track M/S/Volume markup; read-only pattern);
   - `ArrangementExportDialog.tsx` (all of it);
   - the frozen `render-budget.test.tsx` (how renders are counted) and `export-dialog-focus.test.tsx`.
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Model (`types/arrangement.ts`, `model.ts`)

**Contract (B, D-29p):**
- New type `ArrangementMaster { gainDb: number; mute: boolean }`. `Arrangement` gets a **required** `master: ArrangementMaster` field.
  - **Why required:** `isSameArrangement` is a JSON compare. An optional field would make "absent" and "default" differ and create spurious history entries, and every reader would need a fallback.
  - B probed the type change in a scratch copy outside `store/` (`tmp/studio-real-loop/b-scratch-r24`). tsc reports exactly 3 sites, all of which A owns this round:
    - `model.ts` l.83 (`createArrangement`);
    - `model.ts` l.118 (the `projectEnd({...})` literal in `findFreeStart`);
    - `schedule.test.ts` l.9.

    Every other construction goes through `createArrangement` or a spread. If your tsc shows any other site, stop and report it; do not edit a frozen file.
- Export these from `model.ts`:
  - `DEFAULT_ARRANGEMENT_MASTER = { gainDb: 0, mute: false }`;
  - `MASTER_GAIN_MIN_DB = -60` and `MASTER_GAIN_MAX_DB = 6`;
  - `setMasterMix(arrangement, patch: Partial<ArrangementMaster>)`, which clamps `gainDb` to [−60, +6] and returns the **same object** when nothing changes (no-op = no history entry);
  - `masterLinearGain(master)`: 0 when muted, otherwise `10 ** (gainDb / 20)`.
- `createArrangement` sets `master: { ...DEFAULT_ARRANGEMENT_MASTER }`. `studio-lab.tsx` and `studio-lab-demo.ts` stay untouched and get the default through `createArrangement`.
- `scheduleKey` (`ArrangementContext.tsx` l.297) keeps hashing only `[clips, loop]`. **A master change must never reschedule the graph.**
- Undo and Redo restore `master` like any other part of the snapshot. Delete Time, clipboard, duplicate and the other model operations keep `master` unchanged, because they spread the arrangement. A test must prove this for at least `deleteTime` and a paste.

### 2.2 Graph (`graph.client.ts`)

- `ApplyScheduleOptions` gets `masterGain?: number` (linear; default 1). `applySchedule` sets the existing master node's `gain.value` to it. Omitting it must behave exactly as today; the frozen `graph.test.ts` stays green.
- `ScheduleHandle` gets `setMasterGain(value: number)`. It uses `setTargetAtTime` on the master node with the **same time-constant rule as `setTrackGain`**:
  - `MUTE_TIME_CONSTANT` (3 ms) when the new or the previous target is 0;
  - `GAIN_TIME_CONSTANT` otherwise.

  This is the C-R21-01 de-click lesson (doc 028); a master mute must not click.
- After `disconnect()`, `setMasterGain` is a no-op, the same as the other methods' disconnected behaviour.
- No other graph change: no new node types, no analysers (those are stage 2) and no change to the source, clip or track wiring.

### 2.3 Export (`graph.client.ts` `renderArrangementWav`; `ArrangementContext.tsx` `exportWav`)

- The offline render passes `masterGain: masterLinearGain(arrangement.master)`, so the export applies the same Master as playback (D-02, "export = the same graph").
- `renderArrangementWav` returns `{ blob, peak, clippedSamples }` instead of a bare `Blob`. The context is its only caller.
  - `peak` is the largest `|x|` over both channels **before** the clamp.
  - `clippedSamples` is the number of channel samples the clamp changed: `x > MAX_24BIT_SAMPLE` or `x < -1`.
  - The clamp itself is unchanged.
- **Master at 0 dB must produce exactly today's file:** the same frames, sample values and header (R25-E0).
- **Overload report** (export state; the dialog renders it, §2.5). Add to `ArrangementExportState` one **optional** field, `warning?: string`.
  - The key is **absent** in every existing path. Every non-overload state stays exactly `{ phase, message }`.
  - **Why optional (B probe):** the frozen `ArrangementContext.test.ts` l.329 asserts `exportState` `toEqual({ phase: 'error', message: … })`. `warning: null` would fail that test; an absent key passes it.
  - When `clippedSamples > 0` after a successful render, the done `message` stays as it is today and `warning` is exactly:
    ```
    გადატვირთვა: პიკი +{P} dBFS — {N} sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ {R} dB-ით და გაიმეორე ექსპორტი.
    ```
    - `P` = `20·log10(peak)` with one decimal, rounded half up;
    - `N` = `clippedSamples` as plain digits;
    - `R` = `max(0.1, ceil(10·20·log10(peak)) / 10)` with one decimal.
  - When `clippedSamples === 0`, there is no `warning` key. Resetting or closing the dialog returns to `{ phase: 'idle', message: null }` with no `warning`.
- **Master Mute during export (R13-M3 "warns/blocks"; B's choice: warn and proceed).**
  - This is consistent with the existing all-silent precedent: "პროექტში ხმოვანი კლიპი არ არის — WAV შეიქმნება … სიჩუმით".
  - The dialog shows a note before export (§2.5). The export still renders and saves a real WAV of the full length, all zeros.
  - The done message gets the suffix ` Master დადუმებულია — ფაილი სიჩუმეა.`.
  - **Rationale:** blocking would invent a new disabled state. The frozen focus test expects the export button to be enabled in its default state. Warning matches the existing silence note and the "no fake output" rule: the file is honest and the user is told before and after.

### 2.4 Context and history (`ArrangementContext.tsx`)

Add to the context value (names may differ if doc 031 maps them):
- `master: ArrangementMaster` (from `arrangement.master`);
- `toggleMasterMute()`, which commits **one** history entry labelled `Master Mute`;
- `previewMasterGain(db)`, `commitMasterGain()`, `beginMasterGainGesture(pointerId)` and `blurMasterGain()`, which give the Master fader **the same gesture and history semantics as the track Volume fader**:
  - one history entry labelled `Master Volume` per pointer drag;
  - for keyboard steps, entries are coalesced exactly as track Volume does today;
  - a refused edit during another pointer gesture behaves the same;
  - Undo or Redo during a pending preview flushes it first, exactly like `flushPendingVolume`.

  A chooses the mechanism. For example, generalise the `TrackVolumeGesture` key from `trackId` to a mix target, or add a parallel master path. Justify the choice in doc 031. **Track Volume behaviour must not change**, and every existing test stays green and unchanged.

Live audio:
- `startGraph` passes `masterGain: masterLinearGain(arrangement.master)`.
- `syncPlayback`'s no-reschedule branch (l.674) also calls `handle.setMasterGain(masterLinearGain(arrangement.master))`.
- A master change while playing must not call `startGraph`; a test proves it.
- Retired graphs that are already stopping need no update.

The video element stays muted as today. Video sound reaches the speakers only through the graph, so Master Mute silences it too. No change to the video, dock, scheduler, loop or transport logic.

**No status-line text** on Master Mute or on a Master Volume change. Track Mute writes none either (`toggleTrackMute` l.1742–1755 only calls `applyEdit`), so the footer status stays unchanged; the state is shown by `aria-pressed` and the readout.

### 2.5 UI (`ArrangementMaster.tsx` new; `StudioWorkspace.tsx` header; `ArrangementExportDialog.tsx`)

**Placement (B, D-29p, measured):** the **workspace header**, between the title block and the demo badge. It does **not** go in the transport bar. B measured (`b-round-24/geometry.txt`):
- the transport is already **2 rows (87 px) at 1280×720** and has only **25 px** free at 1440×900, so a Master group there would wrap and move every layout reference;
- the header is 35 px high with 622 px (1280) and 782 px (1440) free.

**`ArrangementMaster`** is a plain function component (it is not a `forwardRef` target and needs no ref), inside a `role="group"` with `aria-label="Master"`. It contains, in this Tab order:
1. **The Mute button:**
   - text `M`, `aria-label="Master Mute"`, `aria-pressed`;
   - the same visual language as the track M button (tokens only), but sized so the header does not grow (see below).
2. **The fader:**
   - `input type="range"`, `min=-60`, `max=6`, `step=0.5`, `value=gainDb`;
   - `aria-label="Master Volume"`, and `aria-valuetext` = the readout text;
   - the same pointer, key and blur wiring pattern as the track Volume input (`ArrangementLane.tsx` l.487–510);
   - the width is A's choice, ≥ 80 px.
3. **The readout:**
   - `{sign}{abs.toFixed(1)} dB` with the sign U+2212 for negative values, `+` for positive values and no sign at 0. For example `0.0 dB`, `−6.0 dB`, `+6.0 dB`;
   - `data-testid="arrangement-master-readout"`;
   - `tabular-nums`, with a fixed width so the layout does not shift.
- A small `Master` label before them is allowed.

**Geometry contract:** the header height stays **35 px** and the transport height stays **49 px (1440) / 87 px (1280)**. Lane rows, the scroller and the floating video therefore keep their round-24 numbers (§4.7). If the controls do not fit in 35 px, make them smaller; do not change the header.

**Rendering contract:** `ArrangementMaster` must render **0 times per Play frame** (the round-9 render-budget rule). Prove it in your new UI test with the same counting approach as the frozen `render-budget.test.tsx`; do not edit that file. The frozen render-budget test itself must stay green.

**Export dialog:**
- When `master.mute` is true, show `<p role="note" data-testid="arrangement-export-master-mute">`:
  ```
  Master დადუმებულია (M) — WAV შეიქმნება {projectEnd} სიგრძის სიჩუმით. ჩართე Master, თუ ხმა გჭირდება.
  ```
- When `master.gainDb !== 0`, show one short note: `Master: {readout} — ექსპორტში შედის.` (`data-testid="arrangement-export-master-gain"`). This gives the user an honest "export = playback" statement.
- When `exportState.warning` is set, render it as `<p role="alert" data-testid="arrangement-export-overload">` with a warning token colour (for example `text-accent`; not `text-destructive`, because the file **was** created).
- No other dialog change. The button states and the focus behaviour stay as they are, and the frozen `export-dialog-focus.test.tsx` stays green.

### 2.6 Tests (written first; red on the snapshot sources)

**Order:**
1. Write the new tests against the **unchanged** sources.
2. Run them and paste which fail and why.
   - tsc failures because new exports or props do not exist yet are expected; say so.
   - Prove red with vitest. If imports of not-yet-existing exports make a whole file fail to load, prove red in a scratch copy outside `store/` with minimal stubs, as in round 24, and say how.
3. Implement, then re-run.

**Files:**
- `app/lib/arrangement/__tests__/master.test.ts` (new; model, graph, export maths);
- `app/lib/arrangement/__tests__/master-ui.test.tsx` (new; context, history, component, dialog);
- `schedule.test.ts`: **only** add `master: DEFAULT_ARRANGEMENT_MASTER` (or the literal) to the fixture at l.9, plus its import if needed.

No other existing test file changes. No test is deleted or weakened.

At least **12** new `it` blocks, covering:

1. **Model:**
   - `createArrangement` has the default master;
   - `setMasterMix` clamps (−80 → −60, +9 → +6) and returns the same object on a no-op;
   - `masterLinearGain` gives −6 dB → 0.501187… (±1e-6), mute → 0 and 0 dB → 1;
   - `deleteTime` and a clipboard paste keep `master`;
   - undo and redo restore a master change.
2. **Graph with the fake context (as in the frozen `graph.test.ts`):**
   - `masterGain` sets the master node's initial `gain.value`; omitted → 1;
   - `setMasterGain(0)` uses τ 0.003 and `setMasterGain(0.5)` after a mute uses τ 0.003, while 0.5 → 0.25 uses τ 0.015;
   - after `disconnect`, `setMasterGain` does nothing.
3. **Export maths:** test the pure peak, clamp-count and warning-text pieces without `OfflineAudioContext`. Extract a small pure helper (for example `measureExportOverload(channels)` and `formatExportOverloadWarning(peak, count)`) and test it:
   - with peak 1.1 and 3 over-range samples → `+0.8 dBFS`, `3 sample`, `0.9 dB`;
   - with a peak exactly at `MAX_24BIT_SAMPLE` → count 0 and no warning;
   - with negative over-range (−1.2) counted.
4. **Context (`renderHook`/provider, as the frozen `ArrangementContext.test.ts` does):**
   - `toggleMasterMute` gives one `Master Mute` entry, and undo restores it;
   - a master change while playing calls `setMasterGain` on the live handle and does **not** create a new graph (spy on `applySchedule`, or count graph creations);
   - a master fader pointer gesture with several previews gives **one** `Master Volume` entry;
   - track Volume still gives `Volume` entries unchanged.
5. **UI:**
   - `ArrangementMaster` renders the group, `Master Mute` with `aria-pressed`, `Master Volume` with min/max/step and the readout `0.0 dB` → `−6.0 dB` after a change;
   - it renders 0 times per simulated Play frame.
6. **Export dialog:**
   - the master-mute note appears only when muted;
   - the gain note appears only at a non-zero gain;
   - with a warning in the export state, the `role=alert` overload text appears; after close or reset it is gone;
- a non-overload export state has no `warning` key (`toEqual({ phase, message })`);
   - the export button stays enabled when muted.

### 2.7 After the code

- **Self-check the edge cases:**
  - Master Mute while playing, then Undo while playing;
  - a fader drag interrupted by Escape or blur;
  - Master changes during a loop wrap;
  - a muted Master with soloed tracks;
  - a video with sound and Master Mute;
  - the export while muted;
  - +6 dB with an over-range mix;
  - −60 dB, which is quiet but not muted.
- Run `npx biome check --write` **only** on your own code and test files, then a read-only `npx biome check ./app`.
- Run the `code-reviewer` agent (more than 3 files changed) and report its findings and your dispositions.
- **Mutation checks only in a scratch copy outside `store/`.** Never mutate in place.
- Run the §5 commands.
- A browser smoke check is allowed (§5).

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementExportDialog,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/{graph.client.ts,video-sync.ts,view.ts}
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,graph.test.ts,video-sync.test.ts,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx,export-dialog-focus.test.tsx,library-preview.test.tsx,detail-panel-polish.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..030}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/types/arrangement.ts` | A | §2.1: `ArrangementMaster` and the required `master` field only |
| `app/lib/arrangement/model.ts` | A | §2.1: the master constants and helpers, `createArrangement`, the l.118 literal |
| `app/lib/arrangement/graph.client.ts` | A | §2.2 and §2.3: `masterGain`, `setMasterGain`, the overload measurement and the return type of `renderArrangementWav` |
| `app/contexts/ArrangementContext.tsx` | A | §2.3 and §2.4: the master value and actions, the gesture/history, `startGraph`/`syncPlayback` master gain, `exportWav` (`warning`, mute suffix), `ArrangementExportState.warning` |
| `app/components/arrangement/ArrangementMaster.tsx` | A | **new**, §2.5 |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.5: a relative `import { ArrangementMaster } from './ArrangementMaster'` and the header render only. Nothing else; the keyboard, layout and panels are unchanged. `app/components/arrangement/index.ts` stays frozen (no barrel export) |
| `app/components/arrangement/ArrangementExportDialog.tsx` | A | §2.5: the master-mute note, the master-gain note and the overload alert only |
| `app/lib/arrangement/__tests__/master.test.ts` | A | **new**, §2.6 |
| `app/lib/arrangement/__tests__/master-ui.test.tsx` | A | **new**, §2.6 |
| `app/lib/arrangement/__tests__/schedule.test.ts` | A | §2.6: the fixture `master` line and its import only |
| `docs/implementation/2026/quarter-IV/031-studio-lab-master-bus.md` | A | new doc (Georgian, `docs/implementation/TEMPLATE.md`) |
| `../tmp/studio-real-loop/a-round-25.md`, `a-round-25/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-25.md`, `c-round-25.json`, `c-round-25/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: exactly 54 lines.** These are the 47 baseline lines plus these 7:

```
 M app/lib/arrangement/__tests__/schedule.test.ts
 M app/lib/arrangement/model.ts
 M app/types/arrangement.ts
?? app/components/arrangement/ArrangementMaster.tsx
?? app/lib/arrangement/__tests__/master-ui.test.tsx
?? app/lib/arrangement/__tests__/master.test.ts
?? docs/implementation/2026/quarter-IV/031-studio-lab-master-bus.md
```

`graph.client.ts`, `ArrangementContext.tsx`, `StudioWorkspace.tsx` and `ArrangementExportDialog.tsx` are already ` M` lines in the 47.

### 3.3 Frozen this round

**Frozen:** all 50 files in `b-round-24-tree-sha256.txt` and everything else under `store/`. That includes:
- `ArrangementTransport.tsx`, `ArrangementLane.tsx`, `ArrangementLibrary.tsx`, `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx` and `ArrangementVideoDock.tsx`;
- `schedule.ts`, `panels.ts`, `video-sync.ts`, `transport.ts`, `loop.ts` and `position-store.ts`;
- every existing test except `schedule.test.ts`, including `graph.test.ts`, `ArrangementContext.test.ts`, `render-budget.test.tsx`, `export-dialog-focus.test.tsx`, `model.test.ts` and `track-layout.test.tsx`;
- docs 015–030, `app/entry.server.tsx`, `app/types/*` other than `arrangement.ts`, and `components/ui/Modal.tsx`.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*` (`encodeSfxWav` is import-only), `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**` and `../backend/**`;
- user settings, env/config files and the sitemap;
- `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..24 work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewports:** 1440×900, plus 1280×720 for R25-L and R25-K.

**Harness rules:**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press` or Tab.
- The fader may be set through real arrow keys on the focused range. Each step is 0.5 dB, so −6 dB = 12 × ArrowDown from 0. A synthetic pointer drag is used only for the one-entry-per-drag check, and it is labelled synthetic.
- No source instrumentation.
- Live audio uses C's existing master tap and the raw-sample worklet from round 22 (`c-round-22/scripts/sp22.js` / `rv22.js`), labelled as such.
- Mutation checks run only in a scratch copy outside `store/`.

**Setup:** the demo loads with an empty arrangement. Use the round-11 `lay11` layout (`c-round-11/scripts/lay11.js`: video 0–6.008, music 0–16, stems 2–18, SFX 4–6). Record the clip table.

**Run budget** (workflow policy): for each live-audio measurement, 3 valid runs plus at most 2 replacements for environment-invalid runs. A repeated failure stays an open bug. Tolerances are never relaxed.

### 4.1 R25-MV: Master Volume in live playback

1. With `lay11` playing over the music-only window (8–12 s), record the tap RMS for 1 s at 0 dB.
2. Set Master to −6.0 dB (12 × ArrowDown on the focused fader; readout `−6.0 dB`) and record 1 s again.

**Oracle:**
- ΔRMS = −6.0 ±0.3 dB;
- the playhead keeps running with no jump or restart (position read 200 ms apart increases);
- the video stays in sync: one R3-V2-style drift sample is no worse than round 22.

Return to 0 dB and confirm the level is restored to within ±0.3 dB.

### 4.2 R25-MM: Master Mute in live playback

While playing (music window), click `Master Mute`.

**Oracle:**
- the R22-M1 method applies. With τ = 3 ms, a 60 dB fall alone takes about 3·ln(1000) ≈ 20.7 ms, plus the click → React → audio-thread latency, so the oracle is:
  - the tap is **≤ −60 dBFS from 60 ms after the click event onward**, and stays there while muted;
  - the decay is monotone: no 2 ms raw block after the click is louder than the block before it (no click);
- `aria-pressed=true`;
- the footer status text is unchanged (no status is written for Master Mute; §2.4).

Click again: from 60 ms after the click, the level is within ±0.3 dB of the level before the mute, and the rise has no 2 ms block overshooting the final level by more than 0.3 dB (no click). Also check Master Mute over the video's own sound: with the music lane muted, play 0–6 s and Master Mute silences the video sound too.

### 4.3 R25-ML: no reschedule on a master change

During the R25-MV and R25-MM runs:
- no new graph is created. Use C's existing source counter or connect log (round 22): no new `AudioBufferSourceNode` starts at the moment of the change;
- a master change during an enabled loop (loop 8–12) does not disturb the wrap: the next wrap lands as in R5-L3 (seam within the round-21 limits; one run).

### 4.4 Export (real `WAV-ის ექსპორტი` through the dialog on `lay11`, 1440×900)

- **R25-E0, Master 0 dB:**
  - 864 000 frames = 18.000 s, NaN 0, a valid header;
  - full-scale count **1800** and RMS **−15.48 dBFS ±0.01**, both identical to round 24 (`c-round-24/runs/export-sanity.txt`);
  - if C kept the round-24 WAV bytes, they are byte-identical.
- **R25-EO, the overload alert on the same export:** `arrangement-export-overload` is visible with `role=alert`.
  - The text matches §2.3 exactly.
  - Its `N` satisfies 0.99 × FS ≤ N ≤ FS, where FS is C's decoded full-scale count from R25-E0.
  - Its `P` agrees with C's own estimate, or C explains why it cannot know the pre-clamp peak from the file.
  - Applying the advised reduction `R` and exporting again gives **FS 0** and no alert. Set Master to the first 0.5 dB fader step at or below −R dB; for example R = 0.8 → −1.0 dB.
- **R25-E6, Master −6.0 dB:**
  - 864 000 frames, NaN 0, FS 0, no alert;
  - the gain note shows `Master: −6.0 dB — ექსპორტში შედის.`;
  - over every sample where |x₀| < 0.9 in the 0 dB file, the median of x₋₆ / x₀ is **0.5012 ±0.001**.
- **R25-EM, Master Mute:**
  - the dialog shows the master-mute note before export, and the export button is enabled;
  - the export creates a real file of 864 000 frames with peak 0, NaN 0 and a valid header;
  - the done message ends with ` Master დადუმებულია — ფაილი სიჩუმეა.`.

### 4.5 R25-H: history

Each of these is real-click or keyboard unless stated:
- Master Mute → Undo label `Undo: Master Mute`. Undo restores, Redo re-applies, and the audio follows each one (a quick tap check).
- Twelve discrete ArrowDown presses on the Master fader create N `Master Volume` entries. Track Volume commits on every key-up, so N is expected to be 12. **N must equal the number of `Volume` entries** the same 12 presses create on the music Volume (C runs both).
- Undo × N restores `0.0 dB`; Redo × N re-applies `−6.0 dB`.
- **Synthetic** pointer drag on the Master fader with several moves → exactly one `Master Volume` entry.
- Track Volume, Mute and Solo labels are unchanged (`Volume`, `Mute — …`).

### 4.6 R25-K: keyboard and accessibility (1440 and 1280)

- **Tab order in the header:** `← CZABA` → `Master Mute` → `Master Volume` → … then the transport as before. Report the full order up to Play.
- **Focus on the Master fader:**
  - Home sets −60.0 dB (native) and does **not** seek;
  - End sets +6.0 dB;
  - Space behaves exactly as on a track Volume range today (report both);
  - ArrowUp/Down step 0.5 dB.
- The group has `aria-label=Master`. Mute has `aria-pressed`. The fader has `aria-valuetext` equal to the readout.

### 4.7 R25-L: layout unchanged (1440×900 and 1280×720)

The references are B's `b-round-24/geometry.txt` and C round 24.
- Header **35 px** and transport **49 px** (1440) / **87 px** (1280).
- With `lay11`:
  - 1440: rows 81×4 and scroller 496/604 (detail open/closed);
  - 1280: detail closed → 81×4 with scroller 386, open → 53/61/61/61 with scroller 280. These are `c-round-24/runs/p2a-*.txt`.
- The floating video at 1440 with the library collapsed lands at **8,503 272×153** (`c-round-24/runs/fv-1440.txt`).
- No text in the Master group is clipped. Report with screenshots of the header at both viewports.

### 4.8 R25-R, R25-S, R25-U and R25-Doc

**R25-R (adjacent, one run each):**
- track Mute and Solo still silence and isolate on the tap;
- the R22-M1 track-mute de-click is unchanged (one run);
- Play from 0 and stop;
- the library drop of `სრული მიქსი` onto music at 7 gives one clip;
- Home elsewhere still seeks to 0 (R24-HC quick).

**R25-S (static, read-only):** use `diff -u` of the snapshots in `b-round-24-snapshots/` against the live files. Each diff is limited to the hunks §3.2 allows; report each hunk's purpose.
- `StudioWorkspace.tsx`: only the import and the header render.
- `schedule.test.ts`: only the fixture line and its import.
- `scheduleKey` is unchanged.
- No `limiter`, `normalize` or `compress` words in the code or the UI.
- No hardcoded colours in `ArrangementMaster.tsx`.

This rule replaces round 24's "only added lines in test files", which conflicted with import edits (C round 24 §8, deviation 1).

**R25-U:**
- the §2.6 cases exist and are green;
- A's red-first output shows them failing on the snapshot sources;
- C runs mutations in a scratch copy outside `store/`:
  - (a) `syncPlayback` without `setMasterGain` makes a context test fail;
  - (b) the mute time constant changed from 0.003 to 0.015 in `setMasterGain` makes a graph test fail;
  - (c) `clippedSamples` counting `>= MAX_24BIT_SAMPLE` instead of `>` makes the export-maths test fail;
  - (d) `scheduleKey` including `master` makes the no-reschedule test fail.

  Report how each mutation was done.

**R25-Doc:** doc 031 exists and is in Georgian. It states:
- the master contract (dB range, mute, linear gain, the time constants);
- why the field is required;
- the placement and the measured geometry reason;
- the gesture/history mechanism and why;
- the export overload report (and that the clamp is not a limiter);
- the mute-export rationale;
- the tests;
- the scheduled stages 2–4.

It must match the code.

### 4.9 Gates

**G25-1:**
- tsc 0;
- vitest = **1010** + A's new tests, with at least 12 new `it` blocks and 0 failures (if the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both runs);
- the build passes;
- Biome 0 errors on `./app` (read-only). The warning count must not exceed round 24's 218 warnings + 1 info;
- `render-budget.test.tsx`, `export-dialog-focus.test.tsx`, `graph.test.ts` and `ArrangementContext.test.ts` are green **and unchanged** (their sha256 is in the frozen list).

**G25-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-24-tree-sha256.txt` gives **50 OK**;
- `git status --short` shows the 47 baseline lines plus exactly the 7 lines in §3.2 (54 lines);
- `Header.tsx` is identical to HEAD;
- nothing else under `store/` changed.

**G25-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (including during a Master change and an export);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts`.

**C-R23-01 information record (not PASS, not FAIL):**
- the NUL-byte count and offsets of `curl -s http://127.0.0.1:5173/studio-lab` (round 24: 4 at 26019/26020/42403/42404);
- the code points of every lane name `aria-label` **and** every Master control label after hydration.

The new header markup moves the SSR byte boundaries, so the corrupted character may move. If a Master label now carries U+FFFD, record it under C-R23-01. It is not a new bug of this round, unless the label is wrong in the source.

**Not re-run this round:** RF5-3, R3-V1, R3-V4 and R11-P3 sync. Only the master gain path changes in the audio; there is no change to the video, dock, scheduler, transport or loop code, and G25-2 proves it. One R3-V2-style drift sample is in R25-MV. Their latest full evidence is in rounds 21–22.

### 4.10 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- **C-R23-01** (medium, SSR NUL; awaits the Tech Lead, §7);
- C-R6-02 and C-R8-01 (Tech Lead quiet Chrome).

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS. This round makes it **visible** (R25-EO) and gives Master as the user's remedy. The clamp itself stays (no limiter: effects are out of scope);
- the final commit/push only after everything, and the uncommitted round-6..24 tree;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4, and C's python probes in rounds 21–22;
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push);
- `Content-Type: text/html` without a charset in `entry.server.tsx` (observation; part of the same Tech Lead question).

Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed; do not list them as open. The round-9 reviewer's M1/L8 context items are different items, scheduled with SRW-13 stage 4.

**Tech Lead manual checks:** R23-1/2, R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, Lenis `/studio/*`, and the positive MP4/MOV import path.
- New: **R25-T**, a real-mouse Master fader drag and listening for Master Mute and unmute clicks on headphones in real Chrome.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-24-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/master.test.ts app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/schedule.test.ts
npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/export-dialog-focus.test.tsx app/lib/arrangement/__tests__/graph.test.ts app/lib/arrangement/__tests__/ArrangementContext.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
git diff --stat cc1e531 -- app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

A may use the browser (`a-browse.json`) for one smoke check on `/studio-lab`: the header Master group is visible, the header is 35 px at 1440 and 1280, a Master Mute click toggles `aria-pressed`, and there is no console error. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-25.md`:**
1. the pre-flight gate (with the design-philosopher advice);
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails;
6. deviations.

Do not claim PASS.

**C → `c-round-25.md` and `c-round-25.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID), or **not run** (with the budget reason);
- the tap numbers per run;
- the export numbers per file;
- the history labels;
- the Tab order;
- the geometry;
- the gates;
- the C-R23-01 information record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

### C-R23-01: the Tech Lead decision (requested in `b-round-23.md` §3; unchanged)

- **(a)** React 19.
- **(b)** A narrow `app/entry.server.tsx` grant to A, for a NUL-stripping `Transform` module with tests.

The oracle is in `b-round-23.md` §3. Because this touches shared SSR, that round includes a broad SSR page regression. As soon as the Tech Lead answers, B schedules it **before** the next feature round.

### SRW-13, the remaining stages (the full request; nothing is cut)

- **Stage 2:**
  - live level meters per track and on the Master (an `AnalyserNode` tap after the master gain), with peak hold;
  - the **master clip/overload indicator** that latches until clicked (FB-14 live part, R13-M4 meter part).

  Oracle: an over-range mix (for example `lay11` at Master +6 dB) lights the indicator during playback, and −6 dB does not. The meters render with no per-frame React render (render-budget).
- **Stage 3:** FB-04 clip gain in the detail panel (the `clipGain` node; one history entry per gesture; the export applies it; R13-M1 +6 dB ±0.2 on that clip only). It is never labelled as input sensitivity.
- **Stage 4:** FB-05 track pan (`StereoPanner`; R13-M2: hard left → the right channel of that track is ≈ silent), plus:
  - the fader-click UX decision for all faders (C round 22 §5);
  - context items M1 (the `transportRunningRef` latch) and L8 (the position-store error message).

### After SRW-13

- SRW-14 (FB-13 grid/snap/free) → SRW-15 (FB-09/FB-11 bars/beats, metronome, grid tempo; never audio stretch) → SRW-16 (FB-10 markers);
- SRW-17 (FB-12 track groups; folded-clip a11y);
- SRW-18 (FB-06 fades and the volume envelope) → SRW-19 (FB-07 video opacity fade);
- SRW-20 (range export, MP3);
- the SRW-21 adapter contract (the route mount needs Tech Lead or auth-owner permission);
- the full regression and the root check;
- T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 25 -StartPhase A` and a higher limit.
