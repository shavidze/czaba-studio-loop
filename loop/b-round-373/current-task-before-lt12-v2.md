# Round 374: PERF-11c-iii-a. The Master strip and the closed Export dialog stop rendering on workspace commits

**Planned by:** B, at the round 373 → 374 planning, 2026-11-06 (`b-round-373.md`).

**Decisions** (`backlog.json` v338 → v339, `decisions_log_b`):
- **D-29z1235:** round 373 (PERF-11c-ii-b) is accepted from C's evidence (`c-round-373.json` PASS, `browserVerified` and `realVerified` true, 0 bugs). Gate 373 published `e69eba4`, which is the new baseline.
- **D-29z1236:** the round-373 Lows and C's records are filed.
- **D-29z1237:** PERF-11c-iii is split. This round is stage a. PERF2-FIRST-FRAME-LONGTASK moves to PERF-7 and PERF-11.
- **D-29z1238:** a frontend-architect checkpoint is requested from root. It does not block this round.
- **D-29z1239:** B's rulings on the `tech-lead` sketch review.

**What this round does:** at HEAD, every commit (a lane mute, an Undo, a drag release) and every zoom step renders `ArrangementMaster` and the closed `ArrangementExportDialog` along with the rest of the workspace [K26]. After this round:
- `ArrangementMasterView` (memo) renders only when `arrangement.master` changes.
- The closed Export dialog renders nothing.

The round also fixes B-R370-HOOK-ERROR-NAMES and lands the S5b-same-act row, which closes the Medium TL-R372-M1. What the user sees and hears is unchanged.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28 and 58. C also reads 22, 37, 38, 47, 48, 56, 57, 59 and 60.
- `b-round-373/sketch.patch.txt` (the dispatched sketch) and `b-round-373/sketch-review.md`.
- Primitives:
  - `AUDIO_ARCHITECTURE.md` (Studio);
  - `REACT_CONTEXT.md`;
  - `FORWARDREF_COMPONENT.md` (component change);
  - `AGENT_DISCOVERABLE_CODE.md` (new exports `ArrangementMasterView`, `ArrangementMasterActions`, `useArrangementMasterActions`);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§8).

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a performance refactor with no visible change (the 2026-10-27 rule).

**Screen budget:** nothing visible is added or removed.

## Baseline
- HEAD is `e69eba4`, published by gate 373 [K1]. The tree is clean [K2].
- Protected files: all pass their sha check [K13]. No grant is a protected file.
- Frozen: every tracked file except the grants is listed in `b-round-373/r374-frozen-sha256.txt` (1,258 entries) [K14].
- REGRESSION: `regression-last.json` is 2026-11-05 [K23]. It is due at the first planning on or after 2026-11-08, so not this round.
- **At HEAD:**
  - `ArrangementMaster()` takes no props and calls `useArrangement()` [K3]. StudioWorkspace renders `<ArrangementMaster />` [K4]. During render it reads only `master.mute` and `master.gainDb`; the other 9 fields are callbacks used in handlers [K3]. The value carries `master: arrangement.master,` [K8].
  - StudioWorkspace passes the Export dialog an inline `onClose={() => setIsExportOpen(false)}` [K5]. `ArrangementExportDialog` is a plain exported function that calls `useArrangement()` while closed [K6]. `Modal` returns null when closed [K7].
  - The store hooks' errors: 11 single-quoted literal texts, 1 template `${hookName}` text and 1 multi-line literal [K9]. Because of this, the wrapper hooks report their store hook's name.
  - Tests mount the leaves directly: `<ArrangementMaster />` in 3 files, `<ArrangementExportDialog` in 13 files [K10]. The exported signatures must not change.
  - The non-refusal write in `setStatus` [K11].
  - The new row ids do not exist yet [K12].
- **Measured at HEAD:**
  - Production perf: `interact.zoom.1.components-per-key` is 73, `zoom.30` is 160, and the drag `releaseComponentsMax` is 72 to 74 (`c-round-373/perf-latest-interactions.json`).
  - Dev probe: on a zoom key, a lane mute and Ctrl+Z, Master and ExportDialog each render once (`b-round-373/probe/leaf-head.json`) [K26].

## 0. B's pre-check (L23, L30, L37, L58)
| What | Command | Result |
|---|---|---|
| Sketch typecheck, Biome | `npx tsc --noEmit -p .`; `npx biome check` on the 7 code files | rc 0 and rc 0 [K18] |
| Full suite on the sketch (L23) | `npx vitest run` | 252 files and 3,717 tests pass [K17] |
| Perf on the sketch (L58), production build | `npx playwright test --config playwright.perf.config.ts` (all specs) on sketch v1; the interactions spec again on v2 (v2 only changes the hook-error code and tests) | <ul><li>v1: 214 PASS, 0 FAIL [K19].</li><li>v2: `b-round-373/perf-sketch-v2.log`.</li><li>zoom.1: 73 → 67 at 1x and 6x. zoom.30: 160 → 154.</li><li>`releaseComponentsMax` is 6 lower on every drag kind (`b-round-373/perf-sketch-vs-head.txt`) [K27].</li><li>start/stop: 11/11. click: 38</li></ul> |
| Other test roots (L30) | `perf/lib` imports none of the changed modules. `e2e/` has no Master or Export reference. `perf/studio-lab-resources.perf.spec.ts` opens the Export dialog | That spec passed on v1 (`perf-sketch-results/latest-resources.json`) |
| Mutants (`b-round-373/mutants/`) | see §4 | [K21] |
| Assertion counts | `expect(`/`it(` per changed test file, HEAD vs sketch | context-hygiene 50 → 52 / 12 → 14; pending-status 84 → 86 / 22 → 23; render-budget 129 → 140 / 13 → 15 [K22] |
| Patch equals sketch | the patch on a fresh copy of `e69eba4`, then `sha256sum -c sketch-files-sha256.txt` | 7/7 OK |
| Consults | <ul><li>`tech-lead`: the pattern ruling, then a review of the patch (approved with changes; all applied).</li><li>`performance-optimizer`: the field inventory</li></ul> | `b-round-373/consult-tech-lead.md`, `consult-perf.md`, `sketch-review.md` |

## 1. What A changes (grants: exactly these files, `b-round-373/grants-374.txt`)
A applies `b-round-373/sketch.patch.txt` with `patch -p1` from `store/`, after checking its sha256 against `b-round-373/sketch-dispatched.sha256` [K20]. A makes no other edit to the 7 code files (row SKETCH-EQUAL).

1. **`app/components/arrangement/ArrangementMaster.tsx`:**
   - new type `ArrangementMasterActions`, a `Pick` of 9 `ArrangementContextValue` callbacks;
   - new hook `useArrangementMasterActions(workspace)`, a `useMemo` over those callbacks;
   - the old body becomes `ArrangementMasterViewInner({ master, actions })`, exported as `ArrangementMasterView = memo(...)`;
   - `ArrangementMaster()` stays as a thin wrapper that reads the context; tests mount it.
2. **`app/components/arrangement/ArrangementExportDialog.tsx`:**
   - `ArrangementExportDialog = memo(ArrangementExportDialogShell)`;
   - the shell returns `isOpen ? <ArrangementExportDialogContent isOpen onClose={onClose} /> : null`;
   - the old body is unchanged and becomes `ArrangementExportDialogContent`.
3. **`app/components/arrangement/StudioWorkspace.tsx`:**
   - `closeExportDialog = useCallback(() => setIsExportOpen(false), [])`;
   - `masterActions = useArrangementMasterActions(workspace)`;
   - it renders `<ArrangementMasterView master={arrangement.master} actions={masterActions} />`.
4. **`app/contexts/ArrangementContext.tsx` (B-R370-HOOK-ERROR-NAMES):**
   - each of the 7 store hooks gets a private `use<Name>Context(hookName)` helper, the same pattern as the existing `useArrangementPlaybackStoreContext`;
   - the public store hooks stay zero-argument;
   - 10 wrappers pass their own name: Range, ClipLaneDrag, Selection, Preview, ActiveTrackId, PreviewLaneClips, Position, PositionWriter, MasterMeterWriter and TrackMeterWriter.
5. **Tests:**
   - `pending-status.test.tsx`: S5b-same-act (a new status, a refusal and the release in one batch keep the new status; it pins TL-R372-M1).
   - `context-hygiene.test.tsx`:
     - L8e, an `it.each` over the 10 wrappers, each reporting its own name;
     - L8f, a store hook called directly keeps its own name.
   - `render-budget.test.tsx`:
     - RB-LEAF1: a lane mute and a zoom step render `ArrangementMasterViewInner` 0 times; a Master mute renders it once and sets `aria-pressed`.
     - RB-LEAF2: a lane mute renders neither the shell nor the content, and no dialog is in the DOM; the Export click renders both and the dialog opens.
   - No assertion is removed.
6. **Doc:** `docs/implementation/2026/quarter-IV/241-perf-master-export-leaves.md` (new; no 241 exists [K16]).
   - Georgian, with the TEMPLATE headings in order (L26).
   - l.4 exactly `**სტატუსი:** Completed (C round 374 PASS)`.
   - It records:
     - the pattern ruling;
     - the shell/content split and why it is equivalent;
     - the hook-name helpers;
     - the §0 perf numbers;
     - the mutants;
     - the rulings below.
   - It names only tests and files that exist.
   - Doc 238 l.4 stays unchanged [K16]: PERF-11c is not finished.

**Rulings:**
- **R-PATTERN (D-29z1237, `tech-lead`):** pattern A is used, the round-371 shape: a memo view with Pick props, and the export stays a thin wrapper that reads the context. Pattern B (a stable actions context plus data stores) waits for the checkpoint (D-29z1238).
- **R-SHELL-EQUIV (D-29z1239):** closing now unmounts the content.
  - Accepted deltas, none of them visible:
    - the opener is focused in the content's layout-effect cleanup before the portal DOM is removed (HEAD removed the DOM first; nothing listens for `blur`/`focusout`);
    - `useId` values are new on each open;
    - `scopeChoice` and `exportFormat` reset on unmount instead of in a passive effect, with the same end state.
  - Closing while an export renders is still refused by `handleClose`.
  - The Content's `isOpen` branches are now always true; they are left unchanged, to keep the diff small (Low B-R373-EXPORT-CONTENT-DEAD-ISOPEN, deferred).
- **R-HOOK-API (D-29z1239, the `tech-lead` Medium is fixed):** no public hook gains a parameter.
- **"No assertion lost":** counts only grow (row ASSERT-COUNT).
- **STOP (L11):** any of these is a STOP:
  - a red covering file;
  - a covering test above 50 % of its declared timeout;
  - a hunk that does not apply;
  - any need to touch a file outside the grants.

**Behaviour that must not change (neighbour risk):**
- The Master strip: Mute, the fader drag and keyboard, the double-click reset to 0 dB, Undo/Redo, the meter and the peak reset.
- The Export dialog:
  - focus on open, the Tab cycle, Escape and backdrop close, and focus returning to the opener;
  - the format and scope reset on reopen;
  - WAV and MP3 export, refusal while rendering, the range scope and the hold-Enter behaviour.
- Status texts.
- The auth guard.

## 2. A: checks (speed rules)
- Run `npm run typecheck` and `npm run lint`.
- Run `npx biome check` on the 7 code files.
- Run `xargs -a ../tmp/studio-real-loop/b-round-373/covering-374.txt npx vitest run` from `store/`. That is 140 files: every test that imports the context, StudioWorkspace, Master, the Export dialog or the probe, plus the repo-scan suites [K25].
- Ask the code-reviewer once (7 code files and 1 doc). Send any later edit back to it (L11).

## 3. C: what to verify
C writes `c-round-374.md` and `c-round-374.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` for every finding;
- `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (= `b-round-373/mutants/`), `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-374.json c-round-374/l57-check.txt` must exit 0. Write `c-round-374/progress.json` after every row (L59). Destructive commands and copies stay under `c-round-374/` (L60).

**Copies:** use `cp -a` for every tree copy, never `git archive` (`public/middle-east.mp3` is tracked but matches `.gitignore`). Run mutants and perf one at a time, and never two mutant runs at once. B lost two mutant runs that way (`b-round-373/mutants/invalid-*`).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all` lists only the §1 files (7 modified, 1 new doc = 8 lines). From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-373/r374-frozen-sha256.txt` gives rc 0. The protected check (`b-round-318/protected-sha256.txt`) gives rc 0 | Nothing outside the grants changed |
| **CLAIMS** | First (L56), from the loop root: `bash b-round-373/claims-374.sh`. Compare with `b-round-373/claims-374-output.txt` (HEAD) and `b-round-373/claims-374-sketch-output.txt` (the sketch) | <ul><li>K3–K12 and K15 equal the sketch output.</li><li>K2 reads 8, and K16 reads `doc 241 files: 1` with doc 238 l.4 unchanged.</li><li>Every other line equals the HEAD output, K14 has 0 failing lines, and there is no `MISSING`</li></ul> |
| **SKETCH-EQUAL** | From `store/`: `sha256sum -c ../tmp/studio-real-loop/b-round-373/sketch-files-sha256.txt` | rc 0, 7/7 OK |
| **ASSERT-COUNT** | The `expect(` and `^\s*(it\|test)(\.each)?\(` counts on A's tree vs `git show HEAD:` for the 3 test files | Equal to `b-round-373/expect-counts-374.txt`. A lower count is a Medium bug |
| **UNIT** | The 140 files of `covering-374.txt`, plus `pending-status.test.tsx` and `context-hygiene.test.tsx` with `--sequence.shuffle --sequence.seed=42` | All pass. No covering test above 50 % of its declared timeout |
| **MUTANTS-TREE** | On a `cp -a` copy of A's tree under `c-round-374/`: `TREE=<copy> OUT=<abs path>/c-round-374/mutants bash b-round-373/mutants/run-all-374.sh`. The runner restores each file from a backup, so the copy need not be committed. Run it once, alone | Each mutant is red with the same failing ids as `b-round-373/mutants/mutant-<id>.log` (§4). Record each as `mutantRedOnTree` |
| **PERF-INTERACT** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on A's tree, alone | <ul><li>Every assert passes.</li><li>`interact.zoom.1.components-per-key` = 67 and `zoom.30` = 154.</li><li>Each drag `releaseComponentsMax` equals `b-round-373/perf-sketch-vs-head.txt`.</li><li>start/stop components ≤ 11; click components ≤ 38.</li><li>A value equal to HEAD's (73/160) is a FAIL: the fix is not live.</li><li>A value off by one is recorded and compared with `perf-sketch-v2.log` before it is called a FAIL</li></ul> |
| **PERF-RESOURCES** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, alone | It passes, and `res.harness.export-1-produced` passes: the Export dialog path works in the harness |
| **MASTER-BROWSER (browser)** | After `Demo collection ready` (L48), at 1440×900 and 1280×720, on a `cp -a` copy of HEAD served on another port (its own Vite `cacheDir`, L38) and on A's tree: <ul><li>(a) click Master Mute; read `aria-pressed` and the Undo title; press Ctrl+Z and read both again;</li><li>(b) focus the Master fader, press ArrowDown twice; read the value and the readout; then press Ctrl+Z;</li><li>(c) double-click the fader and read the value;</li><li>(d) drag the fader thumb 30 px left and release; read the value and the Undo title</li></ul> | Every value, readout and Undo title on A's tree equals HEAD's for the same step, at both viewports |
| **EXPORT-DIALOG-BROWSER (browser)** | Same two servers and viewports, after adding `Bass` with Enter: <ul><li>(a) click Export; read the dialog's accessible name and `document.activeElement` (name and role);</li><li>(b) press Tab 12 times and list the focused names;</li><li>(c) press Escape; check the dialog is gone and read `document.activeElement`;</li><li>(d) reopen, choose MP3, close with the close button, reopen, and read which format is checked;</li><li>(e) export WAV and wait for the done text; check the file is RIFF/WAVE, 48 kHz, with peak > 0;</li><li>(f) close, then open with the keyboard (Tab to Export, Enter) and read `document.activeElement`</li></ul> | <ul><li>Every name, focus target, Tab sequence and checked format on A's tree equals HEAD's at both viewports.</li><li>(c) and (f): focus returns to the Export button and is not BODY (L47).</li><li>(e): the WAV is valid on both trees</li></ul> |
| **STATUS-LT12-BROWSER (browser, the round-373 record fixed)** | Same two servers and viewports. Start state: after `Demo collection ready`, add `Bass` with Enter, then press Space, wait 1 s, and press Space (stop). Read the status; it must be a stopped text. Then click the bars ruler's top strip at about 6 s and read the status; press Space and read it again | <ul><li>A's tree equals HEAD for every text.</li><li>`record`: after the strip click, the text is expected to be the LT12 form `Insert marker at <t> — playback continues. Stop, then Space plays from here.`, now that the start state is a stopped text.</li><li>If the start state is not a stopped text, C writes that and does not judge the LT12 text</li></ul> |
| **G374-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720. Warm up first (L38) | <ul><li>`/studio-lab` shows the workspace and the demo state, and `localStorage.auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` returns 401 with no token. With a fake bearer, a fail-closed 500 goes under `blocked` (no backend in the cloud).</li><li>No token appears in any body</li></ul> |
| **STUDIO-SMOKE-374 (browser)** | At both viewports: <ul><li>add `Bass` with Enter;</li><li>Play: the position is ≥ 00:01.000 after 1.5 s (L48);</li><li>drag the clip by its name bar to the lane below, then Ctrl+Z (the Undo title reads "Undo: Move to track — <lane>");</li><li>hold ArrowRight on the selected clip (≥ 5 repeats) and read the status</li></ul> | As stated. The move and Undo statuses equal round 373's record (`c-round-373.json` `recorded`) |
| **DOCS** | Doc 241 l.4 byte for byte; the TEMPLATE headings as an in-order subsequence; every test and file it names exists (L26). `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits | As stated |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if MASTER-BROWSER, EXPORT-DIALOG-BROWSER, STATUS-LT12-BROWSER, G374-AUTH and STUDIO-SMOKE-374 all ran at both viewports.

## 4. Mutants (`b-round-373/mutants/run-all-374.sh`, on the 140 covering files)
| Mutant | File: old → new | Red on the sketch |
|---|---|---|
| MU-MASTER-NO-MEMO | Master: `memo(ArrangementMasterViewInner)` → the plain inner function | RB-LEAF1 (1) [K21] |
| MU-MASTER-ACTIONS-FRESH | StudioWorkspace: `actions={masterActions}` → `actions={{ ...masterActions }}` | RB-LEAF1 (1) [K21] |
| MU-EXPORT-NO-SHELL | ExportDialog: the shell always renders the content | RB-LEAF2 (1) [K21] |
| MU-EXPORT-INLINE-ONCLOSE | StudioWorkspace: `onClose={closeExportDialog}` → the old inline arrow | RB-LEAF2 (1) [K21] |
| MU-HOOK-NAME-RANGE | Context: `useArrangementRange` passes no name of its own | L8e useArrangementRange (1) [K21] |
| MU-NONREFUSAL-OUTSIDE-GESTURE-ONLY | Context: the non-refusal write runs only when no gesture is active | S5b, S5b-same-act, SU5 (3) [K21] |

The exact red ids are in `b-round-373/mutants/mutant-<id>.log`. `invalid-git-checkout/` and `invalid-concurrent/` are kept as evidence of two invalid runs and do not count.

## 5. Neighbour risk
- **Render totals** may only drop. RS4, PV1–PV4, GH1–GH5 and RB-MEMO1–3 pass on the sketch.
- **The test mount contract:** `<ArrangementMaster />` and `<ArrangementExportDialog isOpen onClose>` keep their signatures [K10].
- **SSR:** `memo` adds no SSR path. Master's meter keeps its `useSyncExternalStore` server snapshot.

## 6. Order after this round (D-29z1237)
1. REGRESSION first, if the round-375 planning falls on or after 2026-11-08.
2. PERF-11c-iii-b: ArrangementLibrary with LibraryPreview (an active-track selector).
3. PERF-11c-iii-c: Transport, LoopBrace and MarkerRow.
4. PERF-11c-iii-d (VideoDock: hoist the inline overview) and PERF-11c-iii-e (Lane). These wait for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, or for RETRO 384 if there is no answer.
5. PERF-11b, if root or Saba answers.
6. PERF-12…15, then SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
7. STEM-LANES, then SYS-1…3.
8. STORE-2b…5, then REVIEW-RECOMMENDATIONS and T12-ADVANCED.
9. The phase-2 entries, under the skip rule.

RETRO is due at about round 384, or at the end of STUDIO-PERFORMANCE.

## 7. Root notes
- **New:** ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`). It does not block this round.
- **Open requests, unchanged:**
  - ROOT-REQ-PERF11B-FIREBASE-LAZY;
  - ARCH-CHECKPOINT-PERF9-STEM-CACHE;
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1);
  - ROOT-REQ-B-RETRO-CONSULTS.
- ARCH-CHECKPOINT-PERF11C-STATUS-STORE is closed by round 373 (option A).
- After C PASS, this round is ready for the gate: 7 code files and 1 doc.

## 8. Claims (L29 + L56)
Run `bash b-round-373/claims-374.sh` from the loop root. The output at HEAD is `b-round-373/claims-374-output.txt`; on the sketch it is `b-round-373/claims-374-sketch-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 373 published `e69eba4` |
| K2 | the status line count |
| K3 | Master: the wrapper, the `useArrangement()` calls, the memo view, and the `master.*` render reads |
| K4 | the StudioWorkspace Master site |
| K5 | the StudioWorkspace Export `onClose` |
| K6 | the ExportDialog shell, content and export form |
| K7 | `Modal` returns null when closed |
| K8 | the context value's `master` field |
| K9 | the hook error text forms |
| K10 | SWEEP: tests that mount the leaves (`app/**`) |
| K11 | the `setStatus` non-refusal write line |
| K12 | the new row ids |
| K13 | the protected sha check |
| K14 | the frozen list check |
| K15 | the 7 granted code files equal B's sketch |
| K16 | the doc-241 count and doc 238 l.4 |
| K17 | the full suite on the sketch |
| K18 | the sketch typecheck and Biome |
| K19 | perf on the sketch |
| K20 | the patch sha equals the dispatched sha |
| K21 | the mutants' red counts |
| K22 | the `expect(`/`it(` counts |
| K23 | the regression-last date and the lessons line count |
| K24 | the round-373 archive sha |
| K25 | the covering file count |
| K26 | the HEAD probe: Master and ExportDialog render on a zoom key |
| K27 | the perf release components, sketch vs HEAD |
| K28 | every cited artifact exists |
