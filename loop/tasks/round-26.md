# CURRENT TASK — Round 26: SRW-13 stage 2a — live Master meter, peak hold and the latched Master peak/clip indicator (FB-14 live part; R13-M4 meter part; D-29q)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

## Why this round

**C bugs first — C-R23-01 has worsened and needs the Tech Lead now.**
- C round 25 (`c-round-25.md` §12) found **8 NUL bytes** in the `/studio-lab` SSR HTML, up from 4. Three are now inside **visible Georgian text before hydration**: the header demo badge, the library text and the `Arrangement ·` heading. Hydration repairs the visible text, but first paint, no-JS readers and crawlers see broken characters. The music lane `aria-label` still keeps 2× U+FFFD.
- The corrupted offsets move with every markup change, so every feature round can make it worse.
- The fix needs `app/entry.server.tsx` (outside A's ownership, plan §6) or `package.json` (React 19; globally forbidden). B cannot grant either: the only precedent (Header.tsx) rested on explicit user permission.
- **Tech Lead question (unchanged, now urgent):** (a) React 19, or (b) a narrow `app/entry.server.tsx` grant to A for a NUL-stripping `Transform` module with tests. The oracle is in `b-round-23.md` §3. As soon as the answer exists, B schedules it **before** the next feature round. It is not deferred.
- It is Medium, not security and not data loss, so under the workflow policy it does not stop independent work.
- C-R6-02 and C-R8-01 still need the Tech Lead's quiet-Chrome run.

**Round 25 result:** C **PASS** with no new bug in scope (R25-MV/MM/ML/E0/EO/E6/EM/H/K/L/R/S/U/Doc, G25-1..3; vitest 1045/1045). B re-checked the end state: HEAD `c5ed47b`, 54 status lines identical to `c-round-25/gates/git-status-end.txt`, 50 OK on `b-round-24-tree-sha256.txt`, all 11 owned shas equal C's record, live curl `/studio-lab` NUL 8.

**So this round** continues SRW-13 in dependency order with **stage 2a**: the live **Master meter** and the **latched Master peak/clip indicator**. Together with round 25 this completes FB-14's request ("Master Volume, საერთო გათიშვა და საბოლოო დონის/გადატვირთვის კონტროლი") and the R13-M4 meter part.

Also in this round (**R26-X**, one condition): C round 25 §5.4 noticed that the export dialog shows both the master-mute note and `Master: −5.0 dB — ექსპორტში შედის.` when Master is muted, which contradicts the silent file. The smallest honest behaviour: **hide the gain note while Master is muted**. It is one condition in a file A already owns this round, on the same Master feature, so it is not a second feature.

**Scheduled, not dropped:** per-track meters are **stage 2b** (next round). They touch the lane header geometry (`lay11` rows 81×4, 53/61/61/61, scroller numbers), which needs its own verifiable round. Stages 3 (FB-04 clip gain) and 4 (FB-05 pan, fader UX, round-9 M1/L8) follow.

**Previous round:** archived as `tmp/studio-real-loop/tasks/round-25.md` (sha `489ee115…`).

**References:**
- B's record: `b-round-25.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-29p, D-29q).
- User request: `C:/Apps/czaba-project/docs/video-to-text-bugs/README.md` FB-14. Compressors and other effects are only mentioned as future ideas and are out of scope.
- Compatible target for later: `next-stage-t12/gain-volume-source.txt` T12.20–T12.23 (meter on the output stage, over-0 indication that stays until reset, Main Output clipping especially clear). T12 itself is **not** started.
- Backlog: `backlog.json` SRW-13 (R13-M4) stage 2a.
- B's probe: `b-round-25-probe.txt` (§2.2).
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline:** HEAD `c5ed47b` plus the round-6..25 dirty tree.
- `git status --short` has **54 lines**, identical to `c-round-25/gates/git-status-end.txt`. B's copy is `b-round-25-git-status.txt`.
- Frozen for this round: `../tmp/studio-real-loop/b-round-25-tree-sha256.txt`, **57 files**. That is round 24's 50 plus the seven round-25 files A does not own now: `types/arrangement.ts`, `model.ts`, `StudioWorkspace.tsx`, `schedule.test.ts`, `master.test.ts`, `master-ui.test.tsx` and doc 031. B verified **57 OK** on the live tree.
- Dispatch snapshots of A's four existing files are in `../tmp/studio-real-loop/b-round-25-snapshots/`:

  | File | sha256 |
  |---|---|
  | `app/lib/arrangement/graph.client.ts` | `63f1fdf9…` |
  | `app/contexts/ArrangementContext.tsx` | `2ec43d1a…` |
  | `app/components/arrangement/ArrangementMaster.tsx` | `d6548d21…` |
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `dda9f265…` |

- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any file in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit or delete them.
- Nobody commits in this round.

## 0. Scope

**In (A):**
- a pure meter module (§2.1);
- the graph tap (§2.2);
- the analyser, sampling and meter store in the context (§2.3);
- the meter and the peak/clip button in `ArrangementMaster` (§2.4);
- R26-X in the export dialog (§2.5);
- red-first tests in **two new** test files (§2.6);
- implementation doc 032.

**In (C):** R26-ML, R26-MP, R26-C0, R26-C6, R26-CR, R26-CM, R26-RB, R26-X, R26-E, R26-K, R26-L, R26-R, R26-S, R26-U, R26-Doc, G26-1..3 and the C-R23-01 information record (§4).

**Not in this round** (scheduled; not PASS):
- **SRW-13 stage 2b:** per-track meters in the lane headers, with the lane geometry contract.
- **SRW-13 stage 3:** FB-04 clip gain (R13-M1).
- **SRW-13 stage 4:** FB-05 pan (R13-M2), the fader-click UX for all faders (C round 22 §5; C round 25 noted the 4 px fader box), and the round-9 reviewer's context items M1/L8.
- **C-R23-01:** awaits the Tech Lead (above).
- **LIB-SEP-REASON** (`ArrangementLibrary.tsx:549`): the first round that edits that file, at the latest the fix round before the final regression.
- **Other later items:** the lane overlay `/60` (SRW-14 or SRW-18); the footer selected-clip Latin text; the Latin `range` in the group hint; folded clips in the accessibility tree (SRW-17).
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, L2/L3 (with C-R8-01) and the manual list in §4.10.

**Out of scope for the whole project:** plugins and effects (including a compressor or a limiter), pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch. The meter only **measures**; it never changes the signal. The export clamp stays a clamp and is never called a limiter. No RMS/LUFS meter in this round (T12 lists them as later).

**What could be affected (C checks these):**
- live playback: the master gain path, Master Mute de-click, track Volume/Mute/Solo, loop wraps and the absence of reschedules;
- the per-frame cost of `tick` (video sync, C-R8-01/C-R6-02 history);
- the export file (it must not change: the offline render gets no tap);
- the header geometry (35 px) and through it every lane and floating-video reference;
- the header Tab order and the global keyboard;
- `render-budget.test.tsx`, `master-ui.test.tsx`, `ArrangementContext.test.ts` and every frozen test whose fake `AudioContext` has no `createAnalyser`;
- the anonymous `/studio-lab` network policy.

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives: `AUDIO_ARCHITECTURE.md` (the real code is authoritative where its examples are older), `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `REACT_CONTEXT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`. Also read `prompts/studio-feature.md` and run the `pre-flight` skill.

   Run the `design-philosopher` agent once, read-only, for the visual form of the meter and the peak/clip button. Its constraints: tokens only; the header height stays 35 px (§2.4); the over state must not be colour-only; Georgian UI text with the DAW terms "Master", "Peak", "dBFS" and "Clip" kept in English (D-07). Report its advice and your dispositions.
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-25-tree-sha256.txt` and expect **57 OK**. Run `git status --short` and expect **54 lines**, identical to `c-round-25/gates/git-status-end.txt`. Compare your four existing files with the snapshot shas above. Report any difference **before** doing anything else, and do not "fix" it.
3. Read:
   - `graph.client.ts` (all of it; 267 lines);
   - `ArrangementContext.tsx` l.340–470 (refs, position store, `updatePosition`), l.540–700 (`stopGraph`, `startGraph`, `stopPlayback`, `tick`, `syncPlayback`), l.750–830 (`ensureAudioContext`, `togglePlayback`), l.2170–2190 (unmount and context close) and l.2370–2407 (providers and the position hooks);
   - `ArrangementMaster.tsx`, `ArrangementExportDialog.tsx` l.230–270;
   - `StudioWorkspace.tsx` l.995–1010 (Space on buttons toggles playback) — read-only;
   - the frozen `render-budget.test.tsx` (how renders are counted), `master-ui.test.tsx` (its fake `AudioContext`, l.135–160, and its 0-render test) and `graph.test.ts` l.127–145 (`master.outputs` equals `[ctx.destination]`).

   **B grepped the frozen `master-ui.test.tsx` (l.570–636):** it has no structural assertion that a third control would break — only `group.contains(...)`, `compareDocumentPosition` ordering (`exit` < `Master Mute`, `Master Mute` < `Master Volume`, `Master Volume` < `Play`; no "immediately precedes"), the readout text, and a render count filtered by the name `ArrangementMaster`. Its fake `AudioContext` has no `createAnalyser`, so it exercises the guarded path. A correct implementation keeps it green unchanged; if it fails, report it as a finding and do not edit it.
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Pure meter module (`app/lib/arrangement/meter.ts`, new)

Pure functions and a small store, no Web Audio:
- `isOverFullScale(sample)`: `sample > MAX_24BIT_SAMPLE || sample < -1`. It is **the same predicate** the export uses in `measureExportOverload`, so the live indicator and the export count agree by construction. Move the constant/predicate so that both use one definition (`graph.client.ts` imports it from `meter.ts`, or the reverse; your choice, no duplicate literal). The R25 export maths and its tests must stay green and unchanged.
- `measureBlock(samples: ArrayLike<number>)` → `{ peak, over }`: `peak = max |x|`, `over = some(isOverFullScale)`.
- A meter state step, for example `stepMeter(state, block, nowMs)`, that returns the displayed **level**, the **peak hold**, the **max peak since reset** and the **over latch**:
  - level: follows the block peak instantly upwards and falls with a fixed release rate (your choice between 12 and 30 dB/s; document it);
  - peak hold: holds the highest level for **1.5 s**, then follows the level;
  - max peak since reset: monotonic until reset;
  - over latch: becomes true on any block with `over`, and **only `resetPeak()` clears it**. A quiet block never clears it.
- A floor: `METER_FLOOR_DB = -60`. Any value at or below it is shown as the floor.
- `formatPeakDbfs(peak, over)`: one decimal, half up.
  - When `over` is true the text always starts with `+` and is floored at `+0.0` (the same rule as the export warning's `P`). For example `+5.0`.
  - When `over` is false the text never starts with `+`: negative values use U+2212, and a value that rounds to zero is `0.0`. For example `−1.0`.
  - Nothing measured since reset, or a peak at or below the floor: `−∞`.
- A subscribe/get store for the meter frame (the position-store pattern), so that writers update the DOM with no React render.

### 2.2 Graph tap (`graph.client.ts`)

**B probe** (`b-round-25-probe.txt`, scratch copy outside `store/`):
- adding a required `createAnalyser()` to `ScheduleAudioContext` breaks tsc with **28 errors** in the frozen `graph.test.ts` (21) and `master.test.ts` (7). **Do not do that.**
- an optional `tap` on `ApplyScheduleOptions` with a fan-out connection gives tsc 0, and `graph.test.ts` + `master.test.ts` pass 36/36.

Contract:
- `ApplyScheduleOptions` gets `tap?: ScheduleAudioNode`. When it is given, `applySchedule` calls `master.connect(tap)` **in addition to** the unchanged `master.connect(ctx.destination)`. When it is absent, the wiring is exactly today's (`master.outputs` equals `[ctx.destination]`).
- The tap sits **after** the master gain: the meter measures what is heard, Master Volume and Master Mute included (T12.20 "output stage").
- `disconnect()` needs no new code: `master.disconnect()` already removes the tap connection. A retired graph that is still stopping keeps feeding the tap until it is disconnected; that is correct, because it is still audible.
- `renderArrangementWav` passes **no** tap. The offline export is unchanged.
- No other graph change: no new node types inside the graph and no change to source, clip, track, panner or master wiring.

### 2.3 Context (`ArrangementContext.tsx`)

- **The analyser** is created by the context on the real `AudioContext`, once per context, and reused by every graph (`startGraph` passes it as `tap`).
  - Guard it: if `createAnalyser` is not a function, or it throws, the meter is **inactive** — no throw, playback unchanged and the meter stays at the floor. Every frozen test stubs `AudioContext` without `createAnalyser`; they must all stay green **unchanged**. One new test proves the no-analyser path.
  - `fftSize` ≥ **4096** (≥ 85 ms at 48 kHz), so a frame gap up to that length misses no sample. Use `getFloatTimeDomainData`. The byte variant clamps to ±1 and would hide every over; never use it.
  - The analyser is released when the context is closed on unmount.
- **Sampling** happens in the existing `tick`, once per frame while playing: read the analyser, step the meter, publish to the meter store. No `setState` per frame.
- **On stop** (`stopPlayback`): publish one floor frame (level and hold at the floor). The max peak and the over latch stay until reset.
- **`resetMasterPeak()`** clears the max peak and the latch (and publishes it). It is **not** an arrangement edit: no `Arrangement` field, no history entry, no status text, and `scheduleKey` is unchanged.
- **Over latch transitions** may cause at most **one** React render each (latch on, reset). Everything else is written through the store.
- Expose the meter to components through a **separate context** (like `ArrangementPositionContext`), not in the main context value, plus `resetMasterPeak` (in the main value is fine; it is stable).
- No change to the video, dock, scheduler, loop or transport logic.

### 2.4 UI (`ArrangementMaster.tsx`)

Inside the existing `<fieldset aria-label="Master">`, after the readout, in this Tab order: `Master Mute` → `Master Volume` → **`Master Peak`**.

1. **The meter bar** (`data-testid="arrangement-master-meter"`, `aria-hidden="true"`):
   - a horizontal bar scaled from −60 to +6 dBFS, with a visible 0 dBFS mark, and the peak-hold tick;
   - written from the store with no React render (transform or style writes);
   - it exposes `data-level-db` and `data-hold-db` (one decimal, or `-inf` at the floor), updated with every written frame. This is C's oracle hook. It is not instrumentation; it is part of the contract.
   - width is your choice (≥ 64 px).
2. **The Master Peak button** (`data-testid="arrangement-master-peak"`):
   - always present and enabled; a click (or Enter) calls `resetMasterPeak()`;
   - visible text = `formatPeakDbfs(maxPeak, over)`, `tabular-nums`, fixed width so the layout does not shift;
   - `data-state="clear"` or `data-state="over"`;
   - accessible name: `Master Peak {text} dBFS — გასასუფთავებლად დააჭირე`, and when over, `Master Peak {text} dBFS — გადატვირთვა (Clip). გასასუფთავებლად დააჭირე`. The name is updated whenever the text or state changes (the max is monotonic between resets, so this is rare).
   - The over state uses a clear warning token **and** the non-colour cues above (the `+` sign and the name). Main Output clipping must be especially clear (T12.23).
3. **Space on the Peak button** behaves exactly as on the track `M` buttons today: the global handler toggles playback (StudioWorkspace l.1003; frozen). Enter resets.

**Geometry contract:** the header height stays **35 px** and the transport height stays **49 px (1440) / 87 px (1280)**. The Master group may only grow in width. Measured free width after the 257 px group is about 365 px (1280) and 525 px (1440). No wrapping and no clipped text at `+6.0`, `−60.0`, `−∞` or `+12.3`.

**Rendering contract:** `ArrangementMaster` **and every component it renders** (for example an extracted meter sub-component) render **0 times per Play frame**, including frames with signal and frames after the latch, and at most **once per latch transition**. Prove it in your new UI test with the same counting approach as the frozen `render-budget.test.tsx`; do not edit that file.

### 2.5 R26-X (`ArrangementExportDialog.tsx`)

- Show the gain note only when `master.gainDb !== 0` **and** `!master.mute`. With Master muted, only the master-mute note shows.
- No other dialog change.

### 2.6 Tests (written first; red on the snapshot sources)

**Order:**
1. Write the new tests against the **unchanged** sources.
2. Run them and paste which fail and why. tsc failures for not-yet-existing exports are expected; say so. If a whole file fails to load, prove red in a scratch copy outside `store/` with minimal stubs, as in rounds 24–25, and say how.
3. Implement, then re-run.

**Files:**
- `app/lib/arrangement/__tests__/meter.test.ts` (new; pure module and graph tap);
- `app/lib/arrangement/__tests__/meter-ui.test.tsx` (new; context, component and dialog).

No existing test file changes. No test is deleted or weakened.

At least **14** new `it` blocks, covering:
1. **Pure:**
   - `isOverFullScale`: `MAX_24BIT_SAMPLE` → false, `1.0` → true, `−1.0` → false, `−1.0001` → true; and it is the predicate `measureExportOverload` uses (one behavioural check through `measureExportOverload`);
   - `measureBlock` on a `Float32Array` with `1.2` → peak 1.2 and over;
   - the level release over injected time, the 1.5 s hold, the monotonic max;
   - the latch stays true after quiet blocks and clears only on reset;
   - `formatPeakDbfs`: `1.778` over → `+5.0`; `0.8907` → `−1.0`; a value just over full scale → `+0.0`; 0 → `−∞`; −60 dBFS → `−∞`.
2. **Graph (fake context, as in the frozen `graph.test.ts`):**
   - with `tap`, `master.outputs` is `[destination, tap]`; without it, `[destination]`;
   - the tap is fed by the master node and not by any track node;
   - `renderArrangementWav` passes no tap (stub `OfflineAudioContext` as the round-25 `master.test.ts` does).
3. **Context and UI** (a fake `AudioContext` **with** `createAnalyser`, whose `getFloatTimeDomainData` returns test-controlled blocks):
   - Play, then frames with a −12 dBFS block → `data-level-db` ≈ `−12.0`, text `−12.0`, `data-state="clear"`;
   - a block with `1.5` → `data-state="over"`, text `+3.5`, and it stays over after quiet frames and across Pause/Play;
   - a click on `Master Peak` → `−∞`, `clear`; no new history entry, the Undo label unchanged;
   - Pause → `data-level-db="-inf"` and `data-hold-db="-inf"`;
   - `ArrangementMaster` renders 0 times over 30 frames with signal, and once on the latch transition;
   - a fake `AudioContext` **without** `createAnalyser`: Play works, no throw, the meter stays `-inf`;
   - Tab order: `Master Volume` < `Master Peak` < `Play`.
4. **R26-X:** muted with gain −5 dB → the mute note shows and the gain note does not; unmuted → the gain note shows.

### 2.7 After the code

- Self-check the edge cases: Master Mute while over (no new latch, floor), a reset during playback, a reschedule (edit while playing) keeps the same analyser, a loop wrap, a context without an analyser, unmount during playback, a hidden tab (rAF paused; the meter simply stops).
- Run `npx biome check --write` **only** on your own code and test files, then a read-only `npx biome check ./app`.
- Run the `code-reviewer` agent (more than 3 files changed) and report its findings and your dispositions.
- **Mutation checks only in a scratch copy outside `store/`.** Never mutate in place.
- Run the §5 commands. A browser smoke check is allowed (§5).

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

The 54 lines of `b-round-25-git-status.txt`, including the two foreign agent files (not Studio work; do not touch).

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/meter.ts` | A | **new**, §2.1 |
| `app/lib/arrangement/graph.client.ts` | A | §2.2: the optional `tap` and the fan-out connect; the shared over predicate (§2.1) |
| `app/contexts/ArrangementContext.tsx` | A | §2.3 only |
| `app/components/arrangement/ArrangementMaster.tsx` | A | §2.4 only |
| `app/components/arrangement/ArrangementExportDialog.tsx` | A | §2.5 only (one condition) |
| `app/lib/arrangement/__tests__/meter.test.ts` | A | **new**, §2.6 |
| `app/lib/arrangement/__tests__/meter-ui.test.tsx` | A | **new**, §2.6 |
| `docs/implementation/2026/quarter-IV/032-studio-lab-master-meter.md` | A | new doc (Georgian, `docs/implementation/TEMPLATE.md`) |
| `../tmp/studio-real-loop/a-round-26.md`, `a-round-26/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-26.md`, `c-round-26.json`, `c-round-26/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: exactly 58 lines** — the 54 baseline lines plus:

```
?? app/lib/arrangement/meter.ts
?? app/lib/arrangement/__tests__/meter-ui.test.tsx
?? app/lib/arrangement/__tests__/meter.test.ts
?? docs/implementation/2026/quarter-IV/032-studio-lab-master-meter.md
```

`graph.client.ts`, `ArrangementContext.tsx` and `ArrangementExportDialog.tsx` are already ` M` lines, and `ArrangementMaster.tsx` is already a `??` line, in the 54.

### 3.3 Frozen this round

**Frozen:** all 57 files in `b-round-25-tree-sha256.txt` and everything else under `store/`. That includes `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementVideoDock.tsx`, `types/arrangement.ts`, `model.ts`, `schedule.ts`, `position-store.ts`, `transport.ts`, `loop.ts`, `video-sync.ts`, `app/components/arrangement/index.ts` (no barrel export), and every existing test (including `graph.test.ts`, `master.test.ts`, `master-ui.test.tsx`, `ArrangementContext.test.ts`, `render-budget.test.tsx`, `export-dialog-focus.test.tsx`, `schedule.test.ts`).

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*` (`encodeSfxWav` is import-only), `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**` and `../backend/**`;
- user settings, env/config files and the sitemap; `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting round-6..25 work; in-place mutation of `store/` files; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

**Viewports:** 1440×900; 1280×720 for R26-L and R26-K.

**Harness rules:**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press` or Tab. Master gain changes use real arrow keys on the focused fader (0.5 dB per step), as in round 25.
- No source instrumentation. The `data-level-db`/`data-hold-db`/`data-state` attributes are part of the contract and may be read.
- Live audio uses C's existing master tap and the raw-sample worklet from round 22 (`c-round-22/scripts/sp22.js`), labelled as such. Note: with a tap given, the app's master GainNode now has **two** outputs (destination and the analyser). C's tap still sees master → destination.
- **Export comparison rule (from C round 25 §5.1):** the export pipeline is not bit-deterministic (±1 LSB, known since round 11). Exports are compared by frames, NaN, header, full-scale count and RMS, or by max |Δ| ≤ 1 LSB. Byte identity is never an oracle.
- Mutation checks run only in a scratch copy outside `store/`.

**Setup:** the round-11 `lay11` layout (`c-round-11/scripts/lay11.js`: video 0–6.008, music 0–16, stems 2–18, SFX 4–6). Record the clip table. Reference numbers from C round 25: export 0 dB pre-clamp peak **+5.0 dBFS** (1800 FS), −6 dB export peak **0.8907 (−1.0 dBFS)**.

**Run budget** (workflow policy): for each live-audio measurement, 3 valid runs plus at most 2 replacements for environment-invalid runs. A repeated failure stays an open bug. Tolerances are never relaxed.

### 4.1 R26-ML: meter level follows the output

With `lay11` at Master 0 dB, play the music-only window (8–12 s) and sample `data-level-db` every rAF for 1 s while the tap records.
**Oracle:** the max `data-level-db` over the second equals the tap's max |x| over the same second in dBFS, **±1.0 dB**. The analyser reads the trailing `fftSize / sampleRate` (≈ 85 ms at 4096 / 48 kHz), so C extends the tap window by that length before its start (or compares per frame). Report the `fftSize` and `sampleRate` C read from the page. Repeat at Master −6.0 dB: the max falls by 6.0 ±0.5 dB.
One extra check: with the music lane muted, play 0–2 s (video only): the meter rises during the beep (the video sound reaches the meter through the graph).

### 4.2 R26-MP: peak hold and the floor

- During playback, `data-hold-db` ≥ `data-level-db` on every sample, and after a loud passage it stays at its value for 1.5 s ±0.2 s before following the level.
- Pause: within one frame, both attributes are `-inf` and the bar is empty. The Peak text does **not** change.

### 4.3 R26-C0: the latch at Master 0 dB

Reset, then play 0 → 8 s at Master 0 dB.
**Oracle:**
- by 6.5 s, `data-state="over"`;
- the text starts with `+` and its value is within **±0.5 dB** of +5.0 (the round-25 export `P`) **and** within ±0.5 dB of the tap's max over the same run (the tap is float and unclamped);
- the accessible name contains `გადატვირთვა (Clip)`;
- after Pause, the text and state stay.

### 4.4 R26-C6: no latch at Master −6 dB

Reset, set −6.0 dB (12 × ArrowDown), play 0 → 8 s.
**Oracle:** `data-state="clear"` throughout; the text is within ±0.5 dB of the tap max (≈ `−1.0`) and never starts with `+`.
Do **not** use −5.0 dB as an oracle: its export margin is 0.005 dB, below the live resampling uncertainty.

### 4.5 R26-CR: reset and persistence

- After R26-C0, a real click on `Master Peak` → text `−∞`, `data-state="clear"`.
- The latch survives Pause/Play, a Master Volume change, a reschedule edit while playing (for example a clip move) and Undo/Redo, and only the click clears it.
- The reset creates **no** history entry (the Undo label before and after is the same) and writes no status text.
- A reset during playback restarts the measurement (the text rises again from `−∞`).

### 4.6 R26-CM: Master Mute

After a reset, mute Master while playing through 2–6 s.
**Oracle:** the level reaches the floor within 3 s (the release rate) and stays there; no latch; the tap shows ≤ −60 dBFS as in round 25 (one run). Unmute: the meter rises again.

### 4.7 R26-RB: render budget in the browser

With C's fiber wrapper (round 25 `render-count-browser.txt` method): 2 s of playback with signal below full scale → `ArrangementMaster` and every component inside it render **0** times; a run that latches → at most **1** render at the transition and 0 per frame after it; a reset click → at most 1.
One R3-V2-style video drift sample (round 25 `vm-1.txt` method): no worse than round 25 (max 19.6 ms) by more than 10 ms, and dock counters 0 → 0.

### 4.8 R26-X, R26-E

- **R26-X:** Master −5.0 dB and muted → the export dialog shows only the master-mute note. Unmuted at −5.0 → only the gain note.
- **R26-E (export unchanged):** one real export of `lay11` at Master 0 dB: 864 000 frames, NaN 0, valid header, FS **1800**, RMS **−15.481 ±0.01 dBFS**, and the overload alert as in round 25. The meter does not change the export.

### 4.9 R26-K, R26-L, R26-R, R26-S, R26-U, R26-Doc

**R26-K (1440 and 1280):**
- Tab order from `← CZABA`: `Master Mute` → `Master Volume` → `Master Peak` → `Play` → … Report the full order up to `✂ Split`.
- Enter on `Master Peak` resets; Space on it toggles playback exactly as Space on a track `M` button does (report both).
- The meter bar is `aria-hidden`; the button's accessible name matches §2.4 in both states.

**R26-L (1440 and 1280):** the references are C round 25 `geo-*.txt`/`p2a-*.txt`/`fv-1440.txt`.
- Header **35 px**, transport **49 / 87 px**.
- With `lay11`: 1440 rows 81×4 and scroller 496/604 (detail open/closed); 1280 closed 81×4 scroller 386, open 53/61/61/61 scroller 280.
- Floating video at 1440 with the library collapsed: **8,503 272×153**.
- No clipped text in the Master group with the text at `+12.3` (or the longest the harness can reach), `−∞`, readouts `−60.0 dB` and `+6.0 dB`. Screenshots of the header at both viewports, clear and over.

**R26-R (adjacent, one run each):**
- Master Volume −6.0 and back, and Master Mute de-click: the round-25 numbers (Δ −6.0 ±0.3; ≤ −60 dBFS from 60 ms; monotone gain decay);
- track Mute and Solo silence/isolate on the tap;
- no new graph on a Master change (round-25 `newGraphs` method);
- one loop 8–12 wrap with seam 0 (round-25 `ur-1` method);
- Play from 0 and stop; the library drop of `სრული მიქსი` onto music at 7 gives one clip.

**R26-S (static, read-only):** `diff -u` of `b-round-25-snapshots/` against the live files; every hunk within §3.2 (report each hunk's purpose).
- `graph.client.ts`: only the optional `tap`, the fan-out connect and the shared predicate; `master.connect(ctx.destination)` unchanged; `renderArrangementWav` passes no tap.
- `ArrangementExportDialog.tsx`: one condition.
- `scheduleKey` unchanged; no `Arrangement` type change (the frozen files prove it).
- No `getByteTimeDomainData`; no `limiter`, `normalize` or `compress` words in the code or the UI; no hardcoded colours in `ArrangementMaster.tsx`.

**R26-U:**
- the §2.6 cases exist and are green; A's red-first output shows them failing on the snapshot sources;
- C mutations in a scratch copy outside `store/`, each must make a test fail:
  - (a) the latch clears on a quiet block;
  - (b) the tap connected from a track node (or the panner) instead of the master node;
  - (c) `stopPlayback` without the floor frame;
  - (d) the over predicate in `meter.ts` changed to `>=` `MAX_24BIT_SAMPLE`.

  Report how each mutation was done.

**R26-Doc:** doc 032 exists, is in Georgian and matches the code. It states: the tap position (post-fader) and why; the fan-out and the B probe; the analyser guard and `fftSize`; the meter maths (release rate, 1.5 s hold, floor, latch, the shared over predicate with the export); the 0-render mechanism; the reset is not an edit; R26-X; the tests; and the scheduled stages 2b, 3 and 4.

### 4.10 Gates

**G26-1:**
- tsc 0;
- vitest = **1045** + A's new tests (≥ 14 new `it`), 0 failures (if the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both runs);
- the build passes;
- Biome 0 errors on `./app` (read-only); the warning count must not exceed round 25's 218 + 1 info;
- `render-budget.test.tsx`, `master-ui.test.tsx`, `master.test.ts`, `graph.test.ts`, `ArrangementContext.test.ts` and `export-dialog-focus.test.tsx` are green **and unchanged** (their sha256 is in the frozen list).

**G26-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-25-tree-sha256.txt` gives **57 OK**;
- `git status --short` shows the 54 baseline lines plus exactly the 4 lines in §3.2 (58 lines);
- `Header.tsx` identical to HEAD; nothing else under `store/` changed.

**G26-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (including during playback with the meter, a reset and an export);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts`.

**C-R23-01 information record (not PASS, not FAIL):** the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab` (round 25: 8 at 3536/3537, 11728/11729, 26924/26925, 43308/43309), the context of each, and the code points of every lane name `aria-label` and every Master control name after hydration (including `Master Peak`). A Master label carrying U+FFFD **in SSR** is recorded under C-R23-01, not as a new bug, unless the label is wrong in the source.

**Not re-run this round:** RF5-3, R3-V1, R3-V4 and R11-P3 sync. The audio change is a fan-out tap and per-frame reads; video, dock, scheduler, transport and loop code do not change (G26-2 proves it). One drift sample is in R26-RB.

### 4.11 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:** **C-R23-01** (medium, SSR NUL, worsened in round 25; awaits the Tech Lead); C-R6-02 and C-R8-01 (Tech Lead quiet Chrome).

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS: visible since round 25 (R25-EO), and live from this round (R26-C0). The clamp stays (no limiter: effects are out of scope);
- the final commit/push only after everything, and the uncommitted round-6..25 tree;
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
- New: **R26-T** — watch the Master meter and the Clip indicator in real Chrome with real speakers on `lay11` (it lights in the 4–6 s overlap at 0 dB and not at −6 dB), and confirm the meter motion is readable.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-25-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/meter.test.ts app/lib/arrangement/__tests__/meter-ui.test.tsx
npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/master.test.ts app/lib/arrangement/__tests__/graph.test.ts app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/export-dialog-focus.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
git diff --stat cc1e531 -- app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

A may use the browser (`a-browse.json`) for one smoke check on `/studio-lab`: the meter moves during playback, the header is 35 px at 1440 and 1280, a click on `Master Peak` shows `−∞`, and there is no console error. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-26.md`:**
1. the pre-flight gate (with the design-philosopher advice);
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails;
6. deviations.

Do not claim PASS.

**C → `c-round-26.md` and `c-round-26.json`** (the usual schema): per ID PASS, FAIL (with a bug ID) or **not run** (with the budget reason); the tap and meter numbers per run; the Peak texts; the Tab order; the geometry; the gates; the C-R23-01 record; the carried items. `passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers (before the next feature round).
- **SRW-13 stage 2b:** per-track meters in the lane headers (the same `meter.ts`; a tap per track after its gain stage; folded/tight/full densities; the lane geometry contract; no per-frame render).
- **Stage 3:** FB-04 clip gain in the detail panel (R13-M1 +6 dB ±0.2 on that clip only; never labelled input sensitivity).
- **Stage 4:** FB-05 track pan (R13-M2), the fader-click UX for all faders, the round-9 context items M1/L8.
- **After SRW-13:** SRW-14 (FB-13 grid/snap/free) → SRW-15 (FB-09/FB-11 bars/beats, metronome, grid tempo; never audio stretch) → SRW-16 (FB-10 markers); SRW-17 (FB-12 groups; folded-clip a11y); SRW-18 (FB-06 fades and the volume envelope) → SRW-19 (FB-07 video opacity fade); SRW-20 (range export, MP3); the SRW-21 adapter contract (the route mount needs Tech Lead or auth-owner permission); the full regression and the root check; then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 26 -StartPhase A` and a higher limit.
