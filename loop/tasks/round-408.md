# Round 408: PERF-11c-iii-e-i — the Lane reads its 29 callbacks from the actions context (36 → 59 keys), from B's reviewed sketch (behaviour-preserving)

**Planned by:** B, at the round 407 → 408 planning, 2026-11-08 (`b-round-407.md`). The advisor was used before planning and before hand-off.

## Read first
- `lessons.md` in full. The most relevant lessons are L4, L11, L23, L26, L28, L29, L31, L49, L55, L56, L57, L58 and L59.
- This file. Open `tasks/round-406.md` only to look up the d-i shape (the actions contract AC1–AC7).
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`, plus `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-407/claims-408.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-407/claims-408-planning-output.txt`. Its stderr is empty (`claims-408-planning-stderr.txt`).
  - Output on the sketch scratch (HEAD plus the patch, committed): `b-round-407/claims-408-sketch-output.txt`, stderr empty.
  - The two differ only on the lines in `b-round-407/claims-408-planning-vs-sketch.diff`: K1 (the scratch commit), K5, K7, K8, K9, K10 and K13.

## Baseline: HEAD `5508f70`, clean tree
- Gate 407 published `5508f70` on both remotes [K17]. HEAD is `5508f70…` [K1], and `git status --short --untracked-files=all` is empty [K2].
- `context/head-sha.txt` may be stale (it said `8ac5bfb` at planning); K1 decides.
- **Frozen:** `b-round-407/r408-frozen-sha256.txt` has **1,298** entries: every tracked file except the 3 tracked grants. `sha256sum -c` gives rc 0 [K3].
- **Protected:** all 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- **Grants:** `b-round-407/grants-408.txt` (4 paths, §4).
- **No root patch pending:** `cloud/root-commits/` and `root-deps-request.json` do not exist in the loop folder at planning. If K1 at A1 is not `5508f70`, A re-runs the claims on the new HEAD and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 407 passed and is published.** PERF-11c-iii-d-ii is done (C round 407 PASS, `browserVerified`/`realVerified` true, 0 bugs, gate 407 `5508f70`). The VideoDock leaf (d) is complete.
- **No Critical or High finding is open.** The open Mediums are root-only, manual or `awaiting_user`, and none reproduces in the cloud browser. C reported no bugs in round 407.
- **REGRESSION-2026-11-10 is not due.** `regression-last.json` says 2026-11-07 [K18].
- **Order (D-29z1410): PERF-11c-iii-e (ArrangementLane) is next.** It is the last `useArrangement()` leaf of PERF-11c-iii.
- **Premise, measured at HEAD (L37):** the dev-build leaf probe (`b-round-407/probe/leaf-head-408.json`, identical at both viewports) shows `ArrangementLane` renders `[0,12,4,4,0,0,0,4,4,4,4,4,8]` over the 13 probe steps: all 4 lanes on every workspace commit [K21].
- **Split (D-29z1414), like d:**
  - **e-i (this round)** is plumbing only. The Lane takes its 29 callbacks from the stable actions context. Its render count does not change (probe: 0 differences).
  - **e-ii (next round)** delivers the render saving: a memo inner with per-lane props (`b-round-407/consult-performance-optimizer.md`).
- **Product promise (L55):** the Studio behaves exactly as before. Mute, Solo, Volume, Pan, clip selection, time ranges, the active track, the insert marker, library drops, video import and lane drags work as now, and nothing visible changes.

## 1. Rulings (B)

### D-29z1414: e-i scope
- **New actions keys (23):** `previewClipGeometry`, `previewStatus`, `selectClip`, `toggleClipSelection`, `getSelectedClipIds`, `setTimeRange`, `setActiveTrack`, `setInsertMarker`, `toggleTrackMute`, `toggleTrackSolo`, `previewTrackVolume`, `commitTrackVolume`, `beginTrackVolumeGesture`, `blurTrackVolume`, `setTrackPan`, `beginTrackPanGesture`, `previewTrackPan`, `commitTrackPan`, `cancelTrackPan`, `importVideoFiles`, `getLibraryDragSource`, `dropLibrarySource` and `setClipLaneDrag`. The Pick goes from 36 to 59 keys [K7].
- **Identity premise:** every new key and each of its transitive deps is a store, an empty-deps callback or an existing actions key. None depends on `arrangement` or `history` (`b-round-407/deps-trace.txt`: 58 names, 0 not found, 0 arrangement/history deps [K23]).
  - `getLibraryDragSource` depends on `collection.sources`. That is the same coupling the existing `addSourceToActiveTrack` already has, so the actions identity can change only when the `collection` prop changes, never on a commit.
- **Folded in, because e-i owns the actions region:**
  - **TL-R406-SK-L1:** AC7 no longer hardcodes the key count. It parses the `ArrangementActions` Pick from the source file and asserts that the actions keys equal it, with each entry `toBe` the provider value's entry [K10].
  - **TL-R406-SK-L2** and **TL-R406-SK-L3:** the internal `livePosition` is renamed `getLivePosition` (13 sites). The memo uses shorthand and the alias is gone [K8]. Other files use `livePosition` only as unrelated local names (a `video-sync.ts` parameter, a `status-lifetime` test helper) and are untouched [K11].
- **Not folded:** **TL-R403-SK-L1** (const-tuple key derivation). `tech-lead` re-confirmed that it needs `as const` (a type assertion) or a helper, and would add a third list (sketch review I5). It stays deferred.
- **The Lane** keeps `arrangement`, `collection`, `sourcePeaks`, `sourceDurations`, `pxPerSecond` and `videoSources` on `useArrangement()`, and reads the 29 callbacks from `useArrangementActions()` [K9]. Its render count is unchanged by design; e-ii changes it.

### D-29z1415: the dispatched patch (L58: reviewed = dispatched)
**Patch:** `b-round-407/sketch-408.patch.txt`, sha256 `029e5f8a12e55c8f…` [K14]. It touches 3 files, and `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 3 files afterwards.** It is reproducible with `b-round-407/tools/make-sketch.py` + `make-sketch-tests.py` + `biome format`.

- **`app/contexts/ArrangementContext.tsx`:** the Pick, the actions memo object and its deps list are each one sorted list of 59 keys. `livePosition` → `getLivePosition`.
- **`app/components/arrangement/ArrangementLane.tsx`:** two destructures, as above, and the `useArrangementActions` import.
- **`app/lib/arrangement/__tests__/actions-context.test.tsx`:**
  - `ACTION_KEY_COUNT` is replaced by `declaredActionKeys()`, which reads the Pick from the source file. AC7's title says "every provider callback the ArrangementActions Pick declares".
  - **New AC8:** one actions object across a track Solo, a Volume preview + commit, a Pan set, a clip selection, a time range, the active track, the insert marker and an Undo. The arrangement values are checked where the row can read them: Solo true, Volume 0.5, Pan 0.5, the selected ids, and Pan restored after Undo.

**Evidence on the final sketch:**
- tsc and Biome: rc 0 (`b-round-407/sketch-logs/tsc.log`, `biome.log`).
- The 46 covering files (`sketch-logs/covering.txt`): **911/911**. The slowest test is at 21.8 % of its declared timeout (`sketch-logs/l31-headroom.txt`).
- **Full vitest: 262 files and 3,882 tests, rc 0** [K20].
- Mutants: **5/5 red**, and the pristine runs before and after give rc 0 [K16].
- Dev leaf probe, sketch against HEAD: **0 differences** over 24 leaves × 13 steps × 2 viewports [K21].
- **New browser LANE-ACTIONS probe** (`b-round-407/lane/lane-actions-probe.mjs`): Mute click + Ctrl+Z, Solo click + Ctrl+Z, Volume and Pan pointer drags, Undo ×2, active track. It is `ok` on HEAD and on the sketch at both viewports. The MISMAP-SOLO mutant, applied through HMR, fails the solo step: the Solo click mutes instead [K22].
  - The first sketch run hit a cold-server timeout, kept as `lane/sketch-cold-timeout-1440x900.json`. The retry passed.

**Consults:**
- `performance-optimizer` on the split: e-i is sound, and it found no cheaper split (`b-round-407/consult-performance-optimizer.md`).
- `tech-lead` made one pass on the dispatched sha (`b-round-407/sketch-review.md` names it). **APPROVE WITH LOWS, no Critical, High or Medium.**
  - TL-R408-SK-L1 (AC7's key regex `[A-Za-z]+`) and TL-R408-SK-L2 (AC8's last `?? 0`): deferred_low_polish.
  - TL-R408-SK-L3 (identity-only steps in AC8): accepted by design.

### Doc 261 (new; L26, L28)
- **Path:** `docs/implementation/2026/quarter-IV/261-perf-lane-actions.md`. 261 is the next free number.
- **Form:** title `PERF-11c-iii-e-i: Lane-ის callback-ები actions context-იდან`, in Georgian with technical terms in English. The 7 TEMPLATE headings, in order.
- **l.4, byte-exact:** `**სტატუსი:** In Progress (stage 1 of 2; C round 408 PASS)`.
  - The count of `In Progress (stage` docs goes from 7 to 8 [K6b]. The count of `C round N pending` lines stays 0.
- **ტესტირება** contains:
  - AC7 (keys from the Pick) and AC8;
  - the 5 mutant rows, copied from `b-round-407/mutants/summary.txt`;
  - the leaf-probe result (0 differences; Lane `[0,12,4,4,0,0,0,4,4,4,4,4,8]`);
  - the LANE-ACTIONS probe result, including the mutant's failed solo step.
- **TODO** lists e-ii, the deferred TL-R408-SK-L1/L2 and TL-R403-SK-L1.
- Loop evidence is cited with its full loop path and is marked as outside the repo.
- No other doc changes.

### Ruling lines (L4)
- **Patch files:** "apply the patch byte-for-byte" wins over any style preference of A's reviewer.
- **STOP:** a Medium+ in the patch logic is a STOP (L11), not an edit. A doc finding is fixed in doc 261.
- **actions-context.test.tsx:** "no assertion lost; equal or stronger replacements allowed". The `toHaveLength(ACTION_KEY_COUNT)` assertion is replaced by an exact key-set `toEqual` against the declared Pick. That is stronger: it fails on a missing, an extra or a renamed key. Every other row keeps its assertions.
- **L50 (focus origins):** not triggered. No focus moves, and no element unmounts. The Lane's JSX, handlers and focus calls are byte-identical; only the source of the same callback references changes.
- **L39 (screen budget):** not triggered. Nothing visible changes.

### Side effects (L49)
| Effect | Ruling | Proof |
|---|---|---|
| 23 more entries in the actions object | Intended. All are stable across commits (deps trace), so the actions object keeps one identity | AC1, AC7, AC8; MU-408-DEPS-PER-COMMIT red |
| The Lane calls `useArrangementActions()` | Intended. Same function references, so no handler changes behaviour. The Lane still subscribes through `useArrangement()`, so its render count is unchanged | Leaf probe 0 differences; LANE-ACTIONS row |
| A future action key | AC7 turns red only if the memo and the Pick disagree. There is no count literal to update | MU-408-DROP-SOLO, MU-408-DROP-DRAG-SOURCE red |
| `livePosition` rename | A pure rename inside the provider; no string, test or other file names it | K8, K11 |

## 2. Reference
Not applicable. This is a performance and refactor round with no visible or behavioural change, which the reference-first rule excludes. There is no screen-budget change, and the product-designer, Ableton and YouTube steps do not apply.

## 3. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-407/sketch-408.patch.txt`, then `git apply` the same file. Do not edit the 3 files after that.
3. Write doc 261 as above.
4. Run the §5 checks. Write `a-round-408.md` as you go: changed files, checks with their rc and file paths, reviewer findings, and a For B section (include any Architecture note).

## 4. Grants (`b-round-407/grants-408.txt`)
- **Patch only:**
  - `app/contexts/ArrangementContext.tsx`
  - `app/components/arrangement/ArrangementLane.tsx`
  - `app/lib/arrangement/__tests__/actions-context.test.tsx`
- **New doc:** `docs/implementation/2026/quarter-IV/261-perf-lane-actions.md`.
- **Nothing else:** no protected, auth, route, config, package, perf or other doc file.
- At the end, `git status --short --untracked-files=all` shows exactly 3 ` M` lines and 1 `??` line.

## 5. A's checks
Under the speed rules, the full suite and verify belong to the gate.

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-407/claims-408.sh` at start | Equals `claims-408-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 3 patch files | rc 0 each |
| A3 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-407/sketch-logs/covering.txt)` (46 files) | 911/911 pass. Report the slowest test against its declared timeout. L31: none may be above 50 %; otherwise STOP |
| A4 | Claims at end | Differs from planning only on K2 (4), K5 (`no`), K6 (`1` plus the l.4 above), K6b (8, pending 0), K7–K10 and K13. K7–K10 and K13 equal `claims-408-sketch-output.txt`. K3 stays 1,298 with rc 0 |
| A5 | `code-reviewer` (4 files) | No Critical, High or Medium in the patch logic. A Medium+ there is a STOP (L11). Doc findings are fixed in doc 261 |

## 6. C's acceptance
Write `c-round-408.json` with **all L57 fields**, including `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`, and one result per row. `mutantRedOnSketch` = `b-round-407/mutants/summary.txt`. Run `python3 -I tools/l57-check.py` before hand-off.

**Order (L59):** run the heaviest rows first: row 5, then row 4, then row 3. Write `c-round-408/progress.json` after every row.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the planning output except the A4 lines. Status = the 4 granted paths. Frozen 1,298 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply the patch to a `git archive HEAD` scratch and `cmp` its 3 files against the working tree: 0 differences |
| 3 | **LANE-ACTIONS** (browser, 1440×900 and 1280×720, working tree) | Run `node b-round-407/lane/lane-actions-probe.mjs http://127.0.0.1:5173 <out>.json <WxH>`. **Assert:** `ok` true, no `error`, `pageErrors` []. Each of the 6 steps has `pass` true: `mute` (Mute pressed and Solo not, then unpressed after Ctrl+Z), `solo` (Solo pressed and Mute not, then unpressed after Ctrl+Z), `volume-drag` (value lower), `pan-drag` (value higher), `undo-mix` (both restored after Undo ×2) and `active-track` (a non-regression check, see the notes). B's runs: `ok` on HEAD and on the sketch at both viewports; the MISMAP-SOLO mutant fails `solo` (`lane/mutant-MISMAP-SOLO-1440x900.json`). Keep the screenshot per viewport |
| 4 | **LEAF-PROBE** (browser, both viewports) | Run `node b-round-407/probe/leaf-probe-408.mjs http://127.0.0.1:5173 <out>.json`. **Assert:** 0 page errors and no `error` per viewport. `ArrangementLane` per step = `[0,12,4,4,0,0,0,4,4,4,4,4,8]`. `StudioWorkspace` equals `b-round-407/probe/leaf-sketch-408.json`. **Record:** every other leaf against the same file. `ArrangementLibraryPreviewViewInner`'s `library-preview-stop` has a known jitter of ±2; B's runs showed none |
| 5 | **UNIT + MUTANT** | The A3 set passes, 911/911. Then run the mutants on a committed scratch copy of the working tree (steps in the notes). Pass = 5/5 RED, each naming its expected AC rows; pristine before and after rc 0; scratch status 0 lines |
| 6 | **AUTH** (browser, both viewports) | Demo `/studio-lab` opens with `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token?product=middle-east&file=a.mp3` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 7 | **DOCS** | Doc 261 l.4 byte-exact; the 7 TEMPLATE headings in order (L26). Its 5 mutant rows equal `b-round-407/mutants/summary.txt`, and AC7 and AC8 exist in the test file. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. No other doc changed |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. Claims at end equal claims at start, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch run is in `b-round-407/precheck-full.log` |

**Notes on the rows:**
- **Rows 3, 4 and 6, retries:** a first-load timeout on a cold server is an environment problem (L38: warm `/studio-lab` once in a browser first). Retry at most twice; it is never a FAIL.
- **Row 3, `active-track` step:** it clicks the second lane's active-track button and checks `aria-pressed` is `true` afterwards. It records no value before the click. In B's runs that button was "Music — set as the active track, selected", the lane Bass had just been added to, so it was most likely active already. The step is therefore a non-regression check, not a `setActiveTrack` proof. `setActiveTrack` is covered by AC8 (identity only, TL-R408-SK-L3) and the unit set. Its fix (pick an unpressed lane, record before and after) goes to the e-ii probe as B-R408-PROBE-ACTIVE-TRACK-VACUOUS (Low).
- **Row 3, scope:** the probe drives the first non-video lane after adding Bass with Enter. The library drop, video import and lane-drag paths are not in the browser probe. They are covered by unit files in the A3 set that use drop events and the video input (for example `track-layout`, `lane-strings-ui`, `grid-snap-loop-drop`, `markers-ui`, `name-bar-hint-ui`). The Lane's references are the same functions as before. C records this, and it is not a FAIL.
- **Row 5, mutant steps:**
  1. Copy the working tree to `/tmp/c408-scratch` and symlink `node_modules`.
  2. Run `git init && git add -A && git commit`.
  3. Run `S=/tmp/c408-scratch OUT=<loop>/c-round-408/mutants python3 -I b-round-407/mutants/run.py`. Never use the default `OUT`, which holds B's evidence.
  4. The runner prints `SCRATCH-STATUS N lines (B uncommitted sketch: 3; a committed scratch: 0)`. On C's committed scratch, 0 lines is the pass value.

**Neighbouring behaviour that could break:**
- Every actions consumer, if the actions identity changed per commit: Library, LoopBrace, Master, Transport, StudioWorkspace, VideoDock and now the Lane [K13]. AC1, AC7 and AC8 cover this, and row 4 would show extra renders.
- Lane Mute, Solo, Volume and Pan, including Undo (row 3).
- The video sync loop, which reads `getLivePosition` (renamed only inside the provider). The covering set includes the video files, and the gate runs the full suite.

## 7. For C: the mutants (`b-round-407/mutants/run.py`, site file `ArrangementContext.tsx`, first occurrence = the actions memo object)
| Mutant | Site | Expected red |
|---|---|---|
| MU-408-DROP-SOLO | `toggleTrackSolo,` removed from the memo object | AC7, AC8 |
| MU-408-MISMAP-SOLO | `toggleTrackSolo: toggleTrackMute,` | AC7, AC8 (also the browser `solo` step) |
| MU-408-WRAP-PAN | `setTrackPan: (trackId, pan) => setTrackPan(trackId, pan),` | AC7 |
| MU-408-DEPS-PER-COMMIT | `history,` added to the actions deps | AC1, AC8 |
| MU-408-DROP-DRAG-SOURCE | `getLibraryDragSource,` removed from the memo object | AC7 |

**Equivalent and recorded (not rows), from `sketch-review.md`:**
- reordering memo or deps entries;
- adding a stable dep, or removing one (Biome lint catches the removal; no test does);
- the Lane reading any callback from `useArrangement()` instead of `useArrangementActions()` (same reference; detectable only in e-ii);
- reverting the rename, or aliasing `getLivePosition: livePosition`;
- removing the `declared.length` guard or the final `?? 0`;
- `[A-Za-z]+` → `\w+`;
- the thrown error text.
