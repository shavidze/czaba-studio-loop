# CURRENT TASK — Round 359: C-R358-01, tempo, grid, snap and metronome survive a Studio remount

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 358 → 359 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v321 → v322):
- **D-29z1159:** round 358 is closed as PASS, and PERF-10a is done (`c-round-358.json`, browserVerified true; gate 358 published `f269022`). C-R357-01 is closed.
- **D-29z1160:** the ruling on C-R358-01 and its scope (§1). A-R357-TEMPO-SEED-REMOUNT-DUP is merged into it and becomes Medium.
- **D-29z1161:** routing of the round-358 notes (§5).
- **D-29z1162:** the order after this round (§5).

**Why this round, now.** C-R358-01 is an open **Medium** state-loss bug, reproduced in a real browser at both viewports. The 2026-10-23 bug gate fixes Medium findings before new scope, so it goes ahead of PERF-10a-BUDGETS. It is pre-existing: it is identical on HEAD `d49536b`, and it is not a regression of round 358. REGRESSION is not due yet (`regression-last.json`: 2026-11-05; next on or after 2026-11-08).

**Read first:**
- `lessons.md`. A reads 10, 11, 12, 23, 26, 28, 49, 51, 52 and 58. C also reads 22, 37, 38, 51, 57, 59 and 60.
- `c-round-358.md` and `c-round-358.json` (bug C-R358-01), and `a-round-358.md`.
- Primitives and templates: `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md` (the metronome), `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/new-context.md` (the provider gains one store context).

**L29 note:** untagged code text below is a new name, an expected value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:**
- Reference-first, product-designer, the YouTube request and the screen budget. This is a bug fix that restores the user's own settings. Nothing new appears on screen.
- Ableton conformance: not applicable. B makes no claim about Live here.

## Baseline
- HEAD is `f269022`, the gate-358 publication [K1].
- The tree is clean (0 status entries) [K2].
- Protected files are 11/11 OK [K6]. There is no dependency change: the `package.json` sha is `948eb8eee712` [K9], and `zustand` is already a dependency (`playback-store.ts` uses `zustand/vanilla`).

## 1. The bug and the ruling (D-29z1160)

### 1.1 What C found (C-R358-01, Medium)
1. Open `/studio-lab` and add "Night Pulse · Full mix". The tempo is seeded at 120.
2. Resize to 800×900, then back to 1440×900.
3. Type 100 in the BPM field and press Enter.
4. Resize to 800×900, then back to 1440×900.

**Result:** the field is back at 120, and the status has the "Tempo 120 BPM from …" sentence appended again. After the first resize, the sentence is already in the status twice. HEAD and the round-358 tree behave the same at both viewports. Evidence: `c-round-358/beh-head-1440x900.json` and `beh-head-1280x720.json`, `rows.pre`.

**Cause (by trace, confirmed by B's sketch):**
- Below 900 px, `/studio-lab` unmounts `StudioWorkspace` while `ArrangementProvider` stays mounted (by trace, not a K-claim: `studio-lab.tsx` l.114–120 at `f269022` renders `<StudioWorkspace />` or `<StopPlaybackOnNarrow />` inside the provider).
- The tempo/grid settings are `useState`/`useRef` defaults inside `StudioWorkspace` [K21], so every remount starts from `tempoBpm = null` and a seed flag that is open again.
- The tempo-seed effect returns early only when `tempoBpmRef.current !== null` [K23]. After a remount it seeds again, overwrites the typed tempo, re-applies grid 1/4 and Snap, and appends its sentence.

### 1.2 Ruling: the smallest honest behaviour
**The tempo/grid settings live as long as the open Studio page (the `ArrangementProvider`), not as long as the `StudioWorkspace` component.** They are:
- `tempoBpm`;
- the tempo-seed-open flag;
- the grid hand-chosen and Snap hand-chosen flags;
- `snapEnabled`;
- the seconds division and the musical division;
- `gridMode` and `gridDensity`;
- `metronomeOn`.

These belong together. `changeTempo` and the seed write the musical grid, Snap and the metronome, so restoring only the tempo would leave the grid inconsistent with it.

**Not in scope** (recorded, not done):
- **Surviving a page reload.** A reload is a new provider and starts from the defaults, as today. Persistence across reloads would be a new feature for Saba.
- **Keeping `StudioWorkspace` mounted while narrow.** That is a layout and behaviour change of the narrow screen.
- **Follow mode.** D-29z1156 re-syncs it at mount, so it is not stored.
- **Envelope mode and waveform zoom.** These also reset by construction, but they are a separate view-state class. They are recorded as **B-R359-VIEW-STATE-REMOUNT** (Low, deferred), and C records them in this round (§3.2 VIEW-STATE).

### 1.3 The change (B's sketch, already run)
The patch is `b-round-358/sketch/source-delta.patch.txt`, made against `f269022`. Its sha256 is in `b-round-358/sketch/patches.sha256`. It has three parts:
1. **New `app/lib/arrangement/workspace-session-store.ts`.**
   - A zustand **vanilla** store, following `playback-store.ts`.
   - It holds `tempoGrid: WorkspaceTempoGridSnapshot | null`, where `null` means nothing has been saved yet, and has the action `saveTempoGrid`.
   - The snapshot has the ten fields of §1.2.
2. **`ArrangementContext.tsx`.**
   - The provider creates **one store per provider**: `useState(() => createArrangementWorkspaceSessionStore())`, never a module singleton.
   - It is exposed through `ArrangementWorkspaceSessionContext`, which wraps `ArrangementContext.Provider`, and the hook `useArrangementWorkspaceSessionStore()`. The hook throws outside a provider, like `useArrangementPlaybackStore`.
3. **`StudioWorkspace.tsx`.**
   - It reads `restoredTempoGrid` once at mount with `useState(() => store.getState().tempoGrid)`.
   - Every one of the ten initialisers uses `restoredTempoGrid?.<field> ?? <today's default>`.
   - It adds `metronomeOnRef`.
   - A `useEffect` cleanup saves the ten values from their refs on unmount.
   - The tempo-seed effect is **unchanged**. With a restored non-null tempo or a closed seed flag, it simply does not run again.

A may write an equivalent: for example, a write-through on every change instead of the unmount save, or a live store with selectors. It must keep the per-provider lifetime, the ten fields and every row in §3. **Any design change is reported in `a-round-359.md`** with the mutant mapping (§3.1 A-MUTANT).

### 1.4 New test rows
File: `app/lib/arrangement/__tests__/workspace-session-remount-ui.test.tsx` (new). B's copy is `b-round-358/sketch/workspace-session-remount-ui.test.tsx`.
- The harness is the `RemountHarness` pattern of `follow-remount-ui.test.tsx`. A live `ArrangementProvider` conditionally renders `<StudioWorkspace />`, and a bpm-90 stem clip seeds 90 at mount.

| Row | What it asserts | HEAD `f269022` | Sketch |
|---|---|---|---|
| WS1 | A typed 100 survives two remounts. The status does not gain the seed sentence, and `statusSequence` does not move across the remounts | **red** (field `90`) | green |
| WS2 | With no typed tempo, the seed sentence appears exactly once after two remounts, and the field stays `90` | **red** (3 occurrences) | green |
| WS3 | A cleared BPM field (Enter on empty) stays empty after a remount, with no seed sentence | **red** (field `90`) | green |
| WS4 | Snap turned off, division `1/8` and metronome on (all by hand) survive a remount | **red** (snap `true`, `1/4`, metronome `false`) | green |
| WS5 | A **new** provider starts from the defaults and seeds again (90, one sentence, Snap on) | green (guard row) | green |

Evidence: `b-round-358/ws-on-head.log` (HEAD) and `b-round-358/cover-sketch.log` (sketch).

**Named mutants** (L58; each was run on the sketch; logs in `b-round-358/mutants/`):

| Mutant | Change | Red rows on the sketch |
|---|---|---|
| M-S1 | the seed flag is not restored (`useRef(true)`) | WS3 |
| M-S2 | `tempoBpm` is not restored | WS1, WS2, WS4 |
| M-S3 | a module singleton store instead of one per provider | WS2, WS4, WS5 |
| M-S4 | the metronome is not restored | WS4 |
| M-S5 | the unmount save does nothing | WS1, WS2, WS3, WS4 |

RM1 and RM2 stay green under every mutant.

### 1.5 B's sketch runs (scratch `/home/runner/b358-scratch`: `git archive f269022` + the delta + a `node_modules` symlink; it does not survive the job)

| Check | Result | Evidence |
|---|---|---|
| `tsc --noEmit`; Biome `check` on the 4 files | rc 0; rc 0 (one formatting fix applied by Biome before the patch was saved) | `b-round-358/sketch-typecheck.log`, `sketch-biome.log` |
| Covering set: `b-round-357/cover-paths.txt` (71) + the new file + 7 more grid, tempo and marker-snap UI suites | **79 files, 1452/1452** | `b-round-358/cover-paths-359.txt`, `cover-sketch.log` |
| WS1–WS5 on HEAD | WS1–WS4 red, WS5 green | `b-round-358/ws-on-head.log` |
| C's PRE-REMOUNT probe (`c-round-358/behaviour-probe.mjs`, copied to `b-round-358/behaviour-probe.mjs`) on a sketch dev server :5193, both viewports | After resize 1: tempo 120 and the seed sentence ×1 (HEAD ×2). After the typed 100 and resize 2: tempo **100** and the sentence ×0 (HEAD: 120, ×1) | `b-round-358/beh-sketch-1440x900.json`, `beh-sketch-1280x720.json` vs `c-round-358/beh-head-*.json` |
| `c-round-357/remount-probe3.mjs` on the sketch | all steps equal `c-round-358/remount3-tree.json` | `b-round-358/remount3-sketch.json` |
| Perf | **not run by B.** The delta adds one context provider and one effect that runs only on mount and unmount; no interaction re-renders. C's PERF runs it | — |

Notes:
- The sketch server used its own `cacheDir` (`/tmp/b358-vite`), set in the scratch's `vite.config.ts` only. That is why K6 reads 10 on the scratch; the real store reads 11.
- `store/` was not touched.

## 2. Scope (A)

### 2.1 Files
| File | Change |
|---|---|
| `app/lib/arrangement/workspace-session-store.ts` | new (§1.3 item 1) |
| `app/contexts/ArrangementContext.tsx` | §1.3 item 2 only |
| `app/components/arrangement/StudioWorkspace.tsx` | §1.3 item 3 only |
| `app/lib/arrangement/__tests__/workspace-session-remount-ui.test.tsx` | new: WS1–WS5 (§1.4) |
| `docs/implementation/2026/quarter-IV/235-workspace-session-remount.md` | <ul><li>New, in Georgian.</li><li>l.4 is exactly `**სტატუსი:** Completed (C round 359 PASS)` (L28).</li><li>The seven TEMPLATE `## ` headings in order (L26).</li><li>It cites only WS1–WS5, M-S1–M-S5 and rows that exist.</li><li>It records the ruling (§1.2), including what is not in scope and why.</li></ul> |

Apply the two sketch files with `git apply b-round-358/sketch/source-delta.patch.txt` and a copy of the test, or write the equivalent.

Any other file is out of scope. If `tsc` or the covering set forces another file, write a STOP (L11); do not edit it.

### 2.2 STOP conditions
- WS1–WS4 are not red on the tree before the source change, or WS5 is not green there, or the rows are not all green after it.
- Any covering test changes result other than through WS1–WS5.
- A mutant of §1.4 is not red on its listed rows (when A applies the sketch verbatim).
- The code-reviewer reports a Medium+ finding that this task does not rule.

## 3. Acceptance

### 3.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-358/claims-359.sh`, run from the loop root | equals `b-round-358/claims-359-planning-output.txt` |
| A-CLAIMS final | same | <ul><li>K2 = `f269022 5`.</li><li>K22 = `session-store-file 1 provider-context 4 hook-export 1`.</li><li>K24 = `ws-rows 5 rm-rows 2`.</li><li>K6 11; K9 unchanged; K23 `seed-guard 1`.</li><li>K21's `restored-reads` is ≥ 10 for the sketch design (A reports the actual value if its design differs).</li><li>Line numbers may differ from the sketch output.</li></ul> |
| A-RED-FIRST (on the real tree, in order) | <ol><li>Add the test file **first**.</li><li>Run `npx vitest run app/lib/arrangement/__tests__/workspace-session-remount-ui.test.tsx` and save the log as `a-round-359/ws-before.log`.</li><li>Apply the source and run it again (`a-round-359/ws-after.log`).</li></ol> | before: WS1–WS4 red and WS5 green, as in `b-round-358/ws-on-head.log`; after: 5/5 green |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-COVER | from `store/`: `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-358/cover-paths-359.txt)` | all pass. B's sketch: 79 files, 1452/1452. A reports its own count |
| A-MUTANT (scratch only, L60) | M-S1–M-S5 as in §1.4, on the new file and `follow-remount-ui.test.tsx` | the red rows of §1.4, and RM1/RM2 green. If A's design differs, A gives the equivalent mutant for each and its red rows. `store/` `git status` is unchanged |
| A-REVIEW | `code-reviewer` on the full diff (5 files) | no unruled Medium+. Any code changed after the review goes back to the reviewer (L11). The Architecture note goes to B |
| A-DOC | doc 235 | as in §2.1 |

A does not run PERF or any browser row (C's).

### 3.2 C rows
Use a warm dev server (L38). If `:5173` returns "504 Outdated Optimize Dep", restart it first.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-358/claims-359.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff --stat` | <ul><li>Exactly the 5 files of §2.1.</li><li>`package.json` and `perf/**` are unchanged; K6 11/11.</li></ul> |
| READ | the diff | <ul><li>The store is created per provider (no module-level instance).</li><li>All ten §1.2 fields are restored and saved.</li><li>The tempo-seed effect is unchanged.</li><li>There is no new `setStatus` write (L51).</li></ul> |
| UNIT | A-COVER's command | all pass |
| MUTANT (C's own, prediction written first in `c-round-359/progress.json`) | one mutant of C's choice outside M-S1–M-S5 (for example, do not restore `gridMode`, or do not restore Snap) | red on the predicted rows. A survivor is recorded as a coverage gap (Low), not a FAIL |
| TEMPO-REMOUNT (browser, **both viewports**; C-R358-01) | C's `c-round-358/behaviour-probe.mjs` on the tree, `rows.pre` | <ul><li>After resize 1: tempo 120, and the "Tempo 120 BPM from" sentence appears **once**.</li><li>After the typed 100 and resize 2: tempo **100**, and the sentence appears **0** times.</li><li>Equal to `b-round-358/beh-sketch-*.json`. HEAD's contrast is `c-round-358/beh-head-*.json`.</li></ul> |
| SETTINGS-REMOUNT (browser, both viewports) | After Night Pulse seeds, do by hand: Snap off (`arrangement-snap-toggle`), division 1/8 (`arrangement-grid-division`), metronome on (`arrangement-metronome-toggle`). Then resize to 800×900 and back | Snap `aria-pressed` false, division `1/8` and metronome `aria-pressed` true, as before the resize. The bars ruler shows at once |
| METRONOME-AUDIO (browser, 1440×900; real audio path) | <ul><li>Count `AudioBufferSourceNode.prototype.start` calls with an init script; metronome clicks are scheduled in `graph.client.ts` around l.280–287, with a short duration.</li><li>Metronome on, Space for 2 s, Stop: count A.</li><li>Resize to 800×900 and back, then Space for 2 s again: count B.</li></ul> | B > 0 and \|B − A\| ≤ 1 click. A control with the metronome off adds 0 short-duration starts. Record the method in the report |
| CLEARED (browser, 1440×900) | After the seed, clear the BPM field (empty + Enter), then resize 800×900 and back | the field stays empty, and no seed sentence is appended |
| RELOAD (browser, 1440×900) | Type 100, reload the page, then add Night Pulse again | after the reload, the field is empty before the clip is added, and adding the clip seeds **120** (the defaults are back, by ruling §1.2) |
| VIEW-STATE (record; browser, 1440×900) | Turn Env on and set the waveform zoom to 2×, then resize 800×900 and back | **record only**. B expects both to reset (B-R359-VIEW-STATE-REMOUNT, Low). Report the observed values. A reset is not a FAIL; a different result goes in the report |
| REMOUNT (browser, 1440×900; regression of C-R357-01) | `c-round-357/remount-probe3.mjs` on the tree | equal to `c-round-358/remount3-tree.json` on every step; the final `data-playing` is false |
| FOLLOW (browser, 1440×900) | `c-round-358/follow-probe.mjs` on the tree | texts equal `c-round-358/follow-tree-1440x900.json`; scroll within 4 px |
| PERF (production, **alone**, L38) | the same command and comparison as C358 PERF (`perf-rowcmp.py` against `c-round-358/latest-interactions.json`) | <ul><li>rc 0, `complete`, every asserted row passes, 0 NEW.</li><li>Every `interact.*` component row equals C358.</li><li>Any other DIFF is listed with its row ids, and C explains whether it is the new provider layer.</li></ul> |
| G359-AUTH (browser, both viewports) | `c-round-358/auth.mjs`, copied to `c-round-359/` | as G358-AUTH. A fake-bearer 500 that fails closed while the mock is down goes under `blocked` |
| DOCS | doc 235 | <ul><li>l.4 byte-exact: `**სტატუსი:** Completed (C round 359 PASS)`.</li><li>7 TEMPLATE `## ` headings in order.</li><li>It cites WS1–WS5 and only rows that exist.</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files.</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified** is false if any of these rows does not run: TEMPO-REMOUNT, SETTINGS-REMOUNT, METRONOME-AUDIO, CLEARED, RELOAD, REMOUNT, FOLLOW, PERF or G359-AUTH. None of them needs the backend.

**L57: write all L57 fields** in `c-round-359.json`, and run `python3 -I tools/l57-check.py c-round-359.json c-round-359/l57-check.txt` until it exits 0.
- `assertsSpecified`: none (no perf row changes mode). The new jsdom rows are WS1–WS5.
- `mutantsRecorded`: M-S1–M-S5 plus C's own.
- `mutantRedOnSketch`: `b-round-358/mutants/m-s1-seed-open.log`, `m-s2-tempo.log`, `m-s3-singleton.log`, `m-s4-metronome.log`, `m-s5-no-save.log`, and `b-round-358/ws-on-head.log`.
- `gateChecksRunOnSketch`: `b-round-358/sketch-typecheck.log` and `b-round-358/sketch-biome.log`. The full suite was not run on the sketch; the covering set was (`b-round-358/cover-sketch.log`).
- `affectedChecksNamed`: the covering set (`b-round-358/cover-paths-359.txt`), the interactions perf spec, the behaviour probe, the remount probe and the follow probe.

## 4. Neighbouring behaviour that could break
- **The first-mount seed** (TU8–TU11 in `tempo-seed-ui`, in the covering set). On a first mount the store is `null`, so every default is today's, and the seed runs exactly as on HEAD.
- **The Follow mount sync (D-29z1156) and RM1/RM2.** The mount string write still runs. On a remount with a tempo source there is simply no seed append left to replace. RM1/RM2 must stay green.
- **Status (L51).** The fix adds no status write. It removes the seed's re-append on remount. Nothing that is shown today is overwritten by a new string.
- **Metronome.** The effect that calls `setMetronomeBpm(metronomeOn && tempoBpm !== null ? tempoBpm : null)` re-runs at mount with the restored values. So the provider's metronome tempo is set again after a remount (METRONOME-AUDIO). Clearing the tempo still turns the metronome off (`changeTempo`).
- **Grid and snap (L49).** `resolveAdaptiveGrid`, the G key and the grid menu read the restored state. No side effect of `changeTempo` or the seed is bypassed; they simply do not re-run.
- **Narrow screen.** `StopPlaybackOnNarrow` is unchanged (NARROW passed in round 358; the SETTINGS rows resize through it).
- **StrictMode.** Not used in `entry.client.tsx` (round 358 K19). If it were, the unmount save followed by a re-mount restore would round-trip the same values.
- **Other provider consumers.** The new context wraps only `ArrangementContext.Provider`. No existing hook's identity or value changes.

## 5. Routed, not in scope
- **D-29z1161:**
  - A-R358-REVIEW-RM1-SEQ (Low) and A-R358-REVIEW-LEAF-GATE-COVER (Low; C's mutant C-M1 survived) go to `deferred_low_polish`.
  - The reviewer's stale-snapshot note joins A-R357-REVIEW-SPLIT-RENDER-LATENT.
  - The Architecture note (`useFollowPlaybackSync`) joins signal A-R357-ARCH-PLAYBACK-SPLIT-HOOKS.
  - C's observation "Next marker with no marker stops playback" is **closed as info by trace** (C-R358-OBS-NEXT-MARKER-END). `adjacentMarkerTarget` returns the project end (`markers.ts:162`), and playback stops there.
- **The architecture checkpoint** is repeated, non-blocking: `b-round-358/root-request-arch-checkpoint.md`, with new question 1c on this round's store.
- **D-29z1162, next:**
  1. REGRESSION, if the next planning is on or after 2026-11-08.
  2. PERF-10a-BUDGETS: the C358 values, plus the two VIDEO-FAIL-STOP variants C did not run in 358.
  3. PERF-10b.
  4. PERF-9 and PERF-11…15, then STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED.

  RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.
- **Lesson candidate** (parked for RETRO 368 and merged with round 358's candidate): "State that lives in a component that can unmount while its provider lives (the narrow screen) gets a remount row in the task that owns it." The evidence is C-R357-01 and C-R358-01.

## 6. Deliverables
- **A:** `a-round-359.md`, with every §3.1 row, its evidence under `a-round-359/` and the code-reviewer result.
- **C:** `c-round-359.md` and `c-round-359.json` with all L57 fields, and evidence under `c-round-359/`.

## 7. Claims
Run `bash b-round-358/claims-359.sh` from the loop root. `CLAIMS_STORE` points it at a scratch.

| Output | File |
|---|---|
| Planning, on `f269022` (clean tree) | `b-round-358/claims-359-planning-output.txt` |
| Sketch | `b-round-358/claims-359-sketch-output.txt` |

| Tag | What it pins | Planning | Sketch |
|---|---|---|---|
| K1 | gate 358 status and commit | `published f269022` | same |
| K2 | HEAD and status entry count | `f269022 0` | scratch n/a; A's final: `f269022 5` |
| K6 | protected files OK (`b-round-318/protected-sha256.txt`) | 11 | 10 (scratch-only `vite.config.ts` `cacheDir`; see §1.5) |
| K9 | `package.json` sha256 prefix | `948eb8eee712` | same |
| K21 | literal tempo/grid defaults in `StudioWorkspace.tsx`; `restoredTempoGrid?.` reads | `18`, `0` | `11`, `10` |
| K22 | store file; `ArrangementWorkspaceSessionContext` mentions; hook export | `0 0 0` | `1 4 1` |
| K23 | seed guard `tempoBpmRef.current !== null`; seed-effect line | `1`, 2028 | `1`, 2051 |
| K24 | WS rows; RM rows | `0 2` | `5 2` |
| K25 | cited `b-round-358/`, `c-round-358/` and `c-round-357/` artifacts missing; patch sha256 OK | `0 missing`, `2` | same |

C also runs the L29 grep over this task.
