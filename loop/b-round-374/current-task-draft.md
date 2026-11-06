# Round 375: PERF-11c-iii-b. The Library and its preview stop rendering on workspace commits

**Planned by:** B, at the round 374 → 375 planning, 2026-11-06 (`b-round-374.md`).

**Decisions** (`backlog.json` v339 → v340, `decisions_log_b`):
- **D-29z1242:** round 374 (PERF-11c-iii-a) is accepted from C's evidence (`c-round-374.json` PASS, `browserVerified` and `realVerified` true, 0 bugs). Gate 374 published `ad13a96`, which is the new baseline. TL-R372-M1 and B-R370-HOOK-ERROR-NAMES are closed.
- **D-29z1243:** gate 374's findings are filed. Finding 2 (RB-LEAF1 cannot see a revert of the Master site) is fixed in this round as GATE374-L2-RBLEAF1-REVERT.
- **D-29z1244:** this round is PERF-11c-iii-b, with pattern A as ruled in D-29z1237. B's rulings on the `tech-lead` sketch review are below.
- **D-29z1245:** the order after this round.

**What this round does:** at HEAD, every zoom key, lane mute and Ctrl+Z renders `ArrangementLibrary` and `ArrangementLibraryPreview` once each, at both viewports [K24]. After this round:
- `ArrangementLibraryView` (memo) renders only when one of its props changes: the collection, the source states, the peaks, the selected source, the previewing source, the library's own layout props, or a track's id, kind or name.
- `ArrangementLibraryPreviewView` (memo, same comparator) renders on the same changes and, through its own `useArrangementActiveTrackId()` subscription, when the active lane changes.
- A lane mute, a zoom step and an Undo of a mute render neither.

The round also closes GATE374-L2 (RB-LEAF1 gains an `ArrangementMaster` 0-render assert). What the user sees and hears is unchanged.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28 and 58. C also reads 22, 37, 38, 47, 48, 56, 57, 59 and 60.
- `b-round-374/sketch.patch.txt` (the dispatched sketch) and `b-round-374/sketch-review.md`.
- Primitives:
  - `AUDIO_ARCHITECTURE.md` (Studio);
  - `REACT_CONTEXT.md`;
  - `FORWARDREF_COMPONENT.md` (component change);
  - `AGENT_DISCOVERABLE_CODE.md` (new exports `ArrangementLibraryView`, `ArrangementLibraryActions`, `useArrangementLibraryActions`, `ArrangementLibraryPreviewView`, `ArrangementLibraryPreviewActions`, `LibraryTrackLabel`, `sameLibraryTrackLabels`, `sameLibraryLeafProps`);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§8).

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a performance refactor with no visible change (the 2026-10-27 rule).

**Screen budget:** nothing visible is added or removed.

## Baseline
- HEAD is `ad13a96`, published by gate 374 [K1]. The tree is clean [K2].
- Protected files: all pass their sha check [K11]. No grant is a protected file.
- Frozen: every tracked file except the grants is listed in `b-round-374/r375-frozen-sha256.txt` (1,260 entries) [K12].
- REGRESSION: `regression-last.json` is 2026-11-05 [K21]. It is due at the first planning on or after 2026-11-08, so not this round.
- **At HEAD:**
  - `ArrangementLibrary({...})` destructures its props and calls `useArrangement()` once [K3]. StudioWorkspace renders `<ArrangementLibrary` with five props [K5].
  - `ArrangementLibraryPreview({ sourceId })` calls `useArrangement()` and `useArrangementActiveTrackId()`, and finds the active lane in `arrangement.tracks` [K4]. It reads only a track's `id`, `kind` and `name` [K4].
  - The seven library actions are `useCallback`s in the provider, and StudioWorkspace's `changeLibraryCollapsed` is a `useCallback` with no deps [K10].
  - Tests mount the leaves directly: `<ArrangementLibrary` in 1 file, `<ArrangementLibraryPreview` in 1 file [K8]. The exported signatures must not change.
  - Name-keyed render counts of the old leaves: `rendersOf('ArrangementLibrary')` ×4 in `drag-preview-render.test.tsx`, `'ArrangementLibrary'` in `render-budget.test.tsx`, `'ArrangementLibraryPreview'` ×1 in `library-preview.test.tsx` [K7]. Once StudioWorkspace renders the view, the wrapper names count 0 under StudioWorkspace, so these rows are renamed (required; `tech-lead`).
  - The new row ids do not exist yet [K9].
- **Measured at HEAD:**
  - Production perf (C's run on `ad13a96`'s code, `c-round-374/perf-latest-interactions.json`): `interact.zoom.1.components-per-key` 67, `zoom.30` 154, drag `releaseComponentsMax` 66 to 68.
  - Dev probe (`b-round-374/probe/leaf-head-375.json`, both viewports): on a zoom key, a lane mute and Ctrl+Z, Library and LibraryPreview each render once [K24].

## 0. B's pre-check (L23, L30, L37, L58)
| What | Command | Result |
|---|---|---|
| Sketch typecheck, Biome | `npx tsc --noEmit -p .`; `npx biome check` on the 6 sketch files | rc 0 and rc 0 [K16] |
| Full suite on the sketch (L23) | `npx vitest run` on v1 | 252 files and 3,720 tests pass [K15]. v2 changes only `render-budget` and `library-preview` asserts; the 4 library/budget files were run again on v2: 117/117 [K15] |
| Perf on the sketch v2 (L58), production build, alone | `npx playwright test --config playwright.perf.config.ts` (all 4 specs) | <ul><li>214 PASS, 0 FAIL [K17].</li><li>`interact.zoom.1.components-per-key`: 67 → **53** at 1x and 6x. `zoom.30`: 154 → **140**.</li><li>`releaseComponentsMax` is 14 lower on every drag kind that commits (fade/trim 66 → 52; move/lane/video 67 → 53; group 68 → 54), and `move-components-max` of move/lane 72 → 58, group 73 → 59 (`b-round-374/perf-sketch-vs-head.txt`, HEAD = `c-round-374/perf-latest-interactions.json`).</li><li>start/stop 11/11; click 38; every other deterministic row equals HEAD</li></ul> |
| Other test roots (L30) | `perf/lib` imports none of the changed modules; `e2e/` has no Library component reference; the perf specs reach the Library only through the UI | All 4 perf specs passed on v2 (above) |
| Mutants (`b-round-374/mutants/`) | see §4 | [K19] |
| Assertion counts | `expect(`/`it(` per changed test file, HEAD vs sketch | render-budget 140 → 160 / 15 → 16; library-preview 61 → 71 / 12 → 14; drag-preview-render 526 / 74 unchanged (4 names renamed) [K20] |
| Patch equals sketch | the 6 files taken from `git show HEAD:` (`ad13a96`), `patch -p1` with the sketch, then `sha256sum -c sketch-files-sha256.txt` | patch rc 0, 6/6 OK (`b-round-374/patch-equals-sketch.txt`) |
| Browser probe on the sketch (dev, own `node_modules`, port 5176, both viewports) | `node b-round-374/probe/leaf-probe-375.mjs` | zoom in/out, lane mute and Ctrl+Z: Library view, preview view and both wrappers 0 at both viewports; a preview start renders the preview view 12 times (as HEAD's wrapper) (`b-round-374/probe/leaf-sketch-375.json` [K25]). The first run's 1440 pass timed out cold before `Demo collection ready` (kept as `leaf-sketch-375-run1-cold.json`, L38); the warm rerun is the record |
| Timeout headroom (L31) | gate 374 `verify.log` and `b-round-374/precheck-full.log` | `render-budget.test.tsx`: slowest row (Play→Stop→Play) 2.27 s at gate 374, 2.28 s on the sketch, of its declared 15 s (15 %); RB-LEAF3 is below the 300 ms report line (default 5 s). `library-preview.test.tsx`: whole file 0.91 s → 1.07 s. No row above 50 % |
| State recipes (L29), HEAD, both viewports | `node b-round-374/probe/recipe-probe-375.mjs http://127.0.0.1:5173 …` (`recipe-head-375.json`) | <ul><li>After selecting `Bass`: Add has no `aria-disabled`, title "Add to the active track at the insert marker", row title "Active track: Music".</li><li>Clicking the button named "Video — set as the active track": Add `aria-disabled="true"`, title "Add — make an audio track active first", row title "Active track: Video (audio is not added here)".</li><li>Clicking "Music — set as the active track": back to the first values.</li><li>Playwright `dragTo` from the `Bass` option to the Music lane's grid body (`[data-grid-seconds]` inside the `[data-track-id]` element whose header reads Music) at x = 200 px: clips 0 → 1, status "“Night Pulse · Bass” added to the Music track at 00:05.000. …" [K28]. (A first run used a wrong selector and clicked another Music header button; kept as `recipe-head-375-v1-wrong-selector.json`, not a record)</li></ul> |
| Consult | `tech-lead`: review of sketch v1, approved with changes; all three findings above Low applied in v2; delta review approved v2 (reviewed sha = dispatched sha `b246502f…`) | `b-round-374/sketch-review.md` |

## 1. What A changes (grants: exactly these files, `b-round-374/grants-375.txt`)
A applies `b-round-374/sketch.patch.txt` with `patch -p1` from `store/`, after checking its sha256 against `b-round-374/sketch-dispatched.sha256` [K18]. A makes no other edit to the 6 sketch files (row SKETCH-EQUAL).

1. **`app/components/arrangement/ArrangementLibraryPreview.tsx`:**
   - new exported type `LibraryTrackLabel` (`id`, `kind`, `name`) and `ArrangementLibraryPreviewActions` (a `Pick` of 4 callbacks);
   - new exported pure functions `sameLibraryTrackLabels` (compares two track lists by id, kind and name, in order) and `sameLibraryLeafProps` (every prop by `Object.is` except `tracks`, a key present in only one side is a change, then `sameLibraryTrackLabels`);
   - the old body becomes `ArrangementLibraryPreviewViewInner({ sourceId, collection, sourceStates, sourcePeaks, libraryPreviewSourceId, tracks, actions })`, exported as `ArrangementLibraryPreviewView = memo(..., sameLibraryLeafProps)`; it keeps its own `useArrangementActiveTrackId()` and insert-marker store subscriptions;
   - `ArrangementLibraryPreview({ sourceId })` stays as a thin wrapper that reads the context; a test mounts it.
2. **`app/components/arrangement/ArrangementLibrary.tsx`:**
   - new type `ArrangementLibraryActions` (a `Pick` of 7 callbacks) and hook `useArrangementLibraryActions(workspace)` (a `useMemo` over them);
   - the old body becomes `ArrangementLibraryViewInner`, exported as `ArrangementLibraryView = memo(..., sameLibraryLeafProps)`; it renders `ArrangementLibraryPreviewView` with its data props and the same `actions` object;
   - `ArrangementLibrary(props)` stays as a thin wrapper with the same props type; a test mounts it.
3. **`app/components/arrangement/StudioWorkspace.tsx`:** `libraryActions = useArrangementLibraryActions(workspace)`; it renders `<ArrangementLibraryView` with the five layout props plus `collection`, `sourceStates`, `sourcePeaks`, `selectedSourceId`, `libraryPreviewSourceId`, `tracks={arrangement.tracks}` and `actions={libraryActions}`.
4. **Tests:**
   - `render-budget.test.tsx`:
     - RB-LEAF3 (new): a lane mute, a zoom step and an Undo render neither `ArrangementLibraryViewInner` nor `ArrangementLibraryPreviewViewInner`, nor the wrappers `ArrangementLibrary` / `ArrangementLibraryPreview`; making the Video lane active renders the preview once and the Library 0 times, sets Add `aria-disabled="true"` with the title "Add — make an audio track active first"; back to Music removes `aria-disabled`; selecting another sound renders the Library once; typing in the search renders the Library once and the preview 0 times.
     - RB-LEAF1: also asserts `ArrangementMaster` renders 0 times on a lane commit (GATE374-L2).
     - The Play/Stop rows, the start-hold row and the RB-MEMO checks count `ArrangementLibraryViewInner` where they counted `ArrangementLibrary`. `ArrangementLibrary` leaves `CONTEXT_CONSUMERS`; after `resetExportState()` the row now asserts the Library view renders **0** times (stronger: the export state is not a Library prop).
   - `library-preview.test.tsx`: LP-EQ1 (labels compare by id, kind and name, not identity or other fields; id-only, kind-only, name-only, order and length changes are inequality), LP-EQ2 (leaf props: copied track list equal; another `sourceId`, a new `actions` object or an extra key unequal). The cursor row counts `ArrangementLibraryPreviewViewInner` (the cursor state now lives in the view).
   - `drag-preview-render.test.tsx`: the 4 `rendersOf('ArrangementLibrary')` become `rendersOf('ArrangementLibraryViewInner')`.
   - No assertion is removed.
5. **Doc:** `docs/implementation/2026/quarter-IV/242-perf-library-leaves.md` (new; no 242 exists [K14]).
   - Georgian, with the TEMPLATE headings in order (L26).
   - l.4 exactly `**სტატუსი:** Completed (C round 375 PASS)`.
   - It records: the comparator and why tracks compare by id/kind/name; the actions hook; the test renames and why they are required; the §0 perf numbers; the mutants; the rulings below.
   - It names only tests and files that exist. Doc 238 and doc 241 l.4 stay unchanged [K14].

**Rulings:**
- **R-PATTERN (D-29z1237, unchanged):** pattern A (memo view + Pick actions + thin wrapper). The custom comparator is the only new part; `tech-lead` ruled it safe and the checkpoint safe to wait for (SIG-R375-LEAF-COMPARATOR-HOME).
- **R-TRACK-LABELS (D-29z1244):** the Library and the preview read only `id`, `kind` and `name` of a track [K4]; the context has no rename, add or delete-track action, so a label change cannot happen through the UI today. The prop is typed `readonly LibraryTrackLabel[]`, so a future read of another field does not compile without widening the type.
- **R-RENAMES (D-29z1244, `tech-lead`):** the renamed name counts are required, not cosmetic: under StudioWorkspace the wrappers are no longer mounted, so the old names count 0. Each new name has a positive control in the same file (RB-LEAF3 `=== 1` ×3; library-preview cursor row `>= 10`).
- **R-MASTER-COUNTS (D-29z1244):** `master-ui.test.tsx` and `fader-pointer-preview.test.tsx` also count `'ArrangementMaster'` under StudioWorkspace (vacuous since round 374). They are not this round's files: B-R374-MASTER-VACUOUS-NAME-COUNTS, deferred Low. A does not touch them.
- **"No assertion lost":** counts only grow (row ASSERT-COUNT).
- **STOP (L11):** any of these is a STOP:
  - a red covering file;
  - a covering test above 50 % of its declared timeout;
  - a hunk that does not apply;
  - any need to touch a file outside the grants.

**Behaviour that must not change (neighbour risk):**
- The Library: option click and selection, ArrowUp/ArrowDown, held Enter (one add), Enter add to the active lane, drag to a lane, the right-click and Shift+F10 menu with focus return, search typing, Escape and the clear button with focus return, folder tree and collapsed collections, the collapse/expand toggles and their focus hand-off, the width separator (keys and pointer), the demo notice dismiss.
- The preview: Play/Stop, the cursor while playing, wave click and keys, the "Active track" row, Add enabled only on an audio lane, the insert-marker text, stop-on-collapse and stop-when-filtered-out.
- The floating video's library inset (`bottomInsetPx`).
- The auth guard.

## 2. A: checks (speed rules)
- Run `npm run typecheck` and `npm run lint`.
- Run `npx biome check` on the 6 sketch files.
- Run `xargs -a ../tmp/studio-real-loop/b-round-374/covering-375.txt npx vitest run` from `store/`: 140 files [K23] (every test that imports the context, StudioWorkspace, the Library leaves, the probe, plus the repo-scan suites).
- Ask the code-reviewer once (6 files and 1 doc). Send any later edit back to it (L11).

## 3. C: what to verify
C writes `c-round-375.md` and `c-round-375.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` for every finding;
- `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (= `b-round-374/mutants/`), `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-375.json c-round-375/l57-check.txt` must exit 0. Write `c-round-375/progress.json` after every row (L59). Destructive commands and copies stay under `c-round-375/` (L60).

**Copies:** use `cp -a` for every tree copy, never `git archive`. Run mutants and perf one at a time, never next to each other or another vitest job (L38). A HEAD copy served on another port gets its own `node_modules` (its own Vite cache).

**Browser recipe (all browser rows):** after `Demo collection ready` (L48), at 1440×900 and 1280×720, on a `cp -a` copy of HEAD served on another port and on A's tree. Each step reads the named values on both trees; **PASS means A's value equals HEAD's for the same step at both viewports**, unless the row says otherwise.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all` lists only the §1 files (6 modified, 1 new doc = 7 lines). From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-374/r375-frozen-sha256.txt` gives rc 0. The protected check (`b-round-318/protected-sha256.txt`) gives rc 0 | Nothing outside the grants changed |
| **CLAIMS** | First (L56), from the loop root: `bash b-round-374/claims-375.sh`. Compare with `b-round-374/claims-375-output.txt` (HEAD) and `b-round-374/claims-375-sketch-output.txt` (the sketch) | <ul><li>K3–K9 equal the sketch output.</li><li>K2 reads 7 and K14 reads `doc 242 files: 1`, with doc 238 and doc 241 l.4 unchanged.</li><li>Every other line (including K27 and K28, which the sketch output does not contain) equals the HEAD output; K12 has 0 failing lines; there is no `MISSING`</li></ul> |
| **SKETCH-EQUAL** | From `store/`: `sha256sum -c ../tmp/studio-real-loop/b-round-374/sketch-files-sha256.txt` | rc 0, 6/6 OK |
| **ASSERT-COUNT** | `expect(` and `^\s*(it\|test)(\.each)?\(` on A's tree vs `git show HEAD:` for the 3 test files | Equal to `b-round-374/expect-counts-375.txt`. A lower count is a Medium bug |
| **UNIT** | The 140 files of `covering-375.txt`, plus `render-budget.test.tsx` and `library-preview.test.tsx` with `--sequence.shuffle --sequence.seed=42` | All pass. No covering test above 50 % of its declared timeout |
| **MUTANTS-TREE** | On a `cp -a` copy of A's tree under `c-round-375/`: `TREE=<copy> OUT=<abs path>/c-round-375/mutants bash b-round-374/mutants/run-all-375.sh`. The runner restores each file from a backup. Run it once, alone | Each mutant is red with the same failing ids as `b-round-374/mutants/mutant-<id>.log` (§4). Record each as `mutantRedOnTree` |
| **PERF-INTERACT** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on A's tree, alone | <ul><li>Every assert passes.</li><li>`interact.zoom.1.components-per-key` = 53 and `zoom.30` = 140.</li><li>Each drag `releaseComponentsMax` equals `b-round-374/perf-sketch-vs-head.txt`.</li><li>start/stop components ≤ 11; click components ≤ 38.</li><li>A value equal to HEAD's (67/154) is a FAIL: the fix is not live.</li><li>A value off by one is recorded and compared with `b-round-374/perf-sketch.log` before it is called a FAIL</li></ul> |
| **PERF-RESOURCES** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, alone | It passes, and `res.harness.export-1-produced` passes |
| **LEAF-PROBE (browser, dev)** | Warm up first: load `/studio-lab` once untimed in a browser (L38; B's first sketch run timed out cold at 1440). Then `node b-round-374/probe/leaf-probe-375.mjs <A's dev base> c-round-375/leaf-A.json` (both viewports in one run); a cold-start timeout is environment-invalid, kept and replaced | On `zoom-in-key`, `zoom-out-key`, `lane-mute-click` and `undo-ctrl-z`: `ArrangementLibraryViewInner`, `ArrangementLibraryPreviewViewInner`, `ArrangementLibrary` and `ArrangementLibraryPreview` are all 0 at both viewports; `library-preview-start` renders `ArrangementLibraryPreviewViewInner` ≥ 1. Equal to `b-round-374/probe/leaf-sketch-375.json` for those steps. HEAD's 1/1 (`leaf-head-375.json`) is a FAIL |
| **LIB-KEYS-BROWSER (browser)** | <ul><li>(a) click the first option in the `Sounds` listbox; press ArrowDown twice; read the selected option's name, `document.activeElement` (role and name) and the preview's title text;</li><li>(b) press Enter; read the status text, the number of clips and the Undo button title; press Ctrl+Z;</li><li>(c) focus the search, type `bass`; read the option names; press Escape; read the search value and `document.activeElement`;</li><li>(d) type `zzz`; read the empty message; click the clear button; read the search value and `document.activeElement` (L47: not BODY)</li></ul> | Every value equals HEAD's at both viewports. (c) and (d): focus stays on or returns to the search input |
| **LIB-MENU-BROWSER (browser)** | <ul><li>(a) right-click an option that has a product link; read the menu's role and name and the focused item; press Escape; read `document.activeElement`;</li><li>(b) focus the same option, press Shift+F10; read the menu and the focused item; press Escape; read `document.activeElement`.</li><li>If no demo source has a product link on either tree, record "no link" (equal on both) and skip the reads</li></ul> | Equal to HEAD; focus returns to the option, not BODY (L47) |
| **LIB-PREVIEW-BROWSER (browser)** | <ul><li>(a) select `Bass`; click the preview Play; read the toggle text; wait 1 s; read the wave's `aria-valuetext` (non-zero); click Stop; read the toggle text;</li><li>(b) focus the wave, press ArrowRight; read `aria-valuetext`;</li><li>(c) click the lane button named "Video — set as the active track" [K27]; read the "Active track" row `title`, and the preview Add button's `aria-disabled` and `title`;</li><li>(d) click the button named "Music — set as the active track"; read the same three values;</li><li>(e) press Enter on the Add button (focused by Tab from the wave, or by `focus()`); read the status text</li></ul> | (c): `aria-disabled="true"`, title "Add — make an audio track active first", row title "Active track: Video (audio is not added here)"; (d): no `aria-disabled`, title "Add to the active track at the insert marker", row title "Active track: Music" (HEAD values, `b-round-374/probe/recipe-head-375.json` [K28]). Every value equals HEAD's (the cursor text may differ by timing: compare its form and that it is > 00:00.000) |
| **LIB-LAYOUT-BROWSER (browser)** | <ul><li>(a) focus the collapse button, press Enter; read `document.activeElement` (expand button); press Enter; read `document.activeElement` (collapse button);</li><li>(b) focus the width separator, press ArrowRight 3 times; read `aria-valuenow`;</li><li>(c) if the demo notice is shown, click its dismiss button; read that the notice is gone; reload; read that it stays gone;</li><li>(d) Playwright `dragTo` from the `Bass` option to the Music lane's grid body (`[data-grid-seconds]` inside the `[data-track-id]` element whose header reads Music) at x = 200 px; read the `[data-clip-id]` count before and after and the status text</li></ul> | Every value equals HEAD's at both viewports. (d) at HEAD: clips 0 → 1, status starts "“Night Pulse · Bass” added to the Music track at 00:05.000." [K28]. If the harness cannot deliver the drop on **either** tree, record it as harness-limited (equal on both), not a FAIL |
| **G375-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720. Warm up first (L38) | <ul><li>`/studio-lab` shows the workspace and the demo state, and `localStorage.auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` returns 401 with no token. With a fake bearer, a fail-closed 500 goes under `blocked` (no backend in the cloud).</li><li>No token appears in any body</li></ul> |
| **STUDIO-SMOKE-375 (browser)** | At both viewports: <ul><li>add `Bass` with Enter;</li><li>Play: the position is ≥ 00:01.000 after 1.5 s (L48);</li><li>drag the clip by its name bar to the lane below, then Ctrl+Z (the Undo title reads "Undo: Move to track — <lane>");</li><li>Master Mute click, then Ctrl+Z (round 374's strip still works)</li></ul> | As stated, and equal to HEAD |
| **DOCS** | Doc 242 l.4 byte for byte; the TEMPLATE headings as an in-order subsequence; every test and file it names exists (L26). `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits | As stated |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if LEAF-PROBE, LIB-KEYS-BROWSER, LIB-MENU-BROWSER, LIB-PREVIEW-BROWSER, LIB-LAYOUT-BROWSER, G375-AUTH and STUDIO-SMOKE-375 all ran at both viewports.

## 4. Mutants (`b-round-374/mutants/run-all-375.sh`, on the 140 covering files)
| Mutant | File: old → new | Red on the sketch |
|---|---|---|
| MU-LIB-NO-MEMO | Library: `memo(ArrangementLibraryViewInner, sameLibraryLeafProps)` → the plain inner function | RB-LEAF3, the Play→Stop→Play row, the start-hold row (3) [K19] |
| MU-PREVIEW-NO-MEMO | Preview: the memo → the plain inner function | RB-LEAF3 (search step) (1) [K19] |
| MU-LEAF-PROPS-DEFAULT-EQUALITY | Library: `memo(...)` without the comparator | RB-LEAF3 (1) [K19] |
| MU-LIB-ACTIONS-FRESH | StudioWorkspace: `actions={libraryActions}` → `actions={{ ...libraryActions }}` | RB-LEAF3, Play→Stop→Play, start-hold (3) [K19] |
| MU-TRACK-LABEL-NO-NAME | Preview: the name compare dropped | LP-EQ1 (1) [K19] |
| MU-TRACK-LABEL-NO-ID | Preview: the id compare dropped | LP-EQ1 (1) [K19] |
| MU-LEAF-PROPS-NO-EXTRA-KEY | Preview: the second `for…in` loop dropped | LP-EQ2 (1) [K19] |
| MU-LIB-SITE-REVERT | StudioWorkspace renders `<ArrangementLibrary …/>` again (import added) | RB-LEAF3 (1) [K19] |
| MU-PREVIEW-SITE-REVERT | Library renders `<ArrangementLibraryPreview sourceId={visibleSelectedId} />` again (import added) | RB-LEAF3 (1) [K19] |
| MU-MASTER-SITE-REVERT | StudioWorkspace renders `<ArrangementMaster />` again (import added; GATE374-L2) | RB-LEAF1 (1) [K19] |

The exact red ids are in `b-round-374/mutants/mutant-<id>.log`; the runner restored every file (`summary.txt`: `restore-check rc 0`). Every mutant ran alone, after the perf run.

## 5. Neighbour risk
- **Render totals** may only drop. RS4, PV1–PV4, GH1–GH5, RB-MEMO1–3 and RB-LEAF1/2 pass on the sketch.
- **The test mount contract:** `<ArrangementLibrary …>` (1 file) and `<ArrangementLibraryPreview sourceId>` (1 file) keep their signatures [K8].
- **A stale prop:** every value the old leaves read from `useArrangement()` is now a prop or the leaf's own subscription (`tech-lead`, `sketch-review.md` §1). A missed one would show as a HEAD difference in the LIB-* rows.
- **SSR:** `memo` adds no SSR path.

## 6. Order after this round (D-29z1245)
1. REGRESSION first, if the round-376 planning falls on or after 2026-11-08.
2. PERF-11c-iii-c: Transport, LoopBrace and MarkerRow.
3. PERF-11c-iii-d (VideoDock) and PERF-11c-iii-e (Lane). These wait for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, or for RETRO 384 if there is no answer.
4. PERF-11b, if root or Saba answers.
5. PERF-12…15, then SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
6. STEM-LANES, then SYS-1…3.
7. STORE-2b…5, then REVIEW-RECOMMENDATIONS and T12-ADVANCED.
8. The phase-2 entries, under the skip rule.

RETRO is due at about round 384, or at the end of STUDIO-PERFORMANCE.

## 7. Root notes
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING** (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`) is still open; gate 374's architecture note is its second independent echo, and SIG-R375-LEAF-COMPARATOR-HOME is added to its inputs. It does not block this round.
- **Open requests, unchanged:** ROOT-REQ-PERF11B-FIREBASE-LAZY; ARCH-CHECKPOINT-PERF9-STEM-CACHE; ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1); ROOT-REQ-B-RETRO-CONSULTS.
- After C PASS, this round is ready for the gate: 6 code/test files and 1 doc.

## 8. Claims (L29 + L56)
Run `bash b-round-374/claims-375.sh` from the loop root. The output at HEAD is `b-round-374/claims-375-output.txt`; on the sketch it is `b-round-374/claims-375-sketch-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 374 published `ad13a96` |
| K2 | the status line count |
| K3 | Library: the wrapper form, `useArrangement()` calls, the memo view |
| K4 | Preview: `useArrangement()`, `useArrangementActiveTrackId()`, `arrangement.tracks.find(`, the track fields read, the memo view |
| K5 | the StudioWorkspace Library site and the actions hook |
| K6 | the StudioWorkspace Master site (unchanged) |
| K7 | the name-keyed render counts in the 3 test files |
| K8 | SWEEP: tests that mount the leaves (`app/**`) |
| K9 | the new row ids and the RB-LEAF1 `ArrangementMaster` assert |
| K10 | the 7 library actions and `changeLibraryCollapsed` are `useCallback`s |
| K11 | the protected sha check |
| K12 | the frozen list check |
| K13 | the 6 granted code/test files equal B's sketch |
| K14 | the doc-242 count and doc 238/241 l.4 |
| K15 | the full suite on the sketch, and the v2 delta run |
| K16 | the sketch typecheck and Biome |
| K17 | perf on the sketch |
| K18 | the patch sha equals the dispatched sha |
| K19 | the mutants' failed-test counts |
| K20 | the `expect(`/`it(` counts |
| K21 | the regression-last date and the lessons line count |
| K22 | the round-374 archive sha |
| K23 | the covering file count |
| K24 | the HEAD probe: Library and LibraryPreview render on zoom, mute and Undo |
| K25 | the sketch probe |
| K26 | every cited artifact exists |
| K27 | the strings and testids the browser rows use (`Sounds`, `Add`, the two Add titles, the lane button label, three testids) |
| K28 | the HEAD recipe probe: Video/Music lane buttons and the library drag |
