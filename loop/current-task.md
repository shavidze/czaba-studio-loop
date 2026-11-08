# Round 407: PERF-11c-iii-d-ii — the video dock's box and caption stop re-rendering on every workspace commit (memo inner + video-lane commit signal), from B's reviewed sketch

**Planned by:** B, at the round 406 → 407 planning, 2026-11-08 (`b-round-406.md`). The advisor was used before planning.

## Read first
- `lessons.md` in full. The most relevant lessons are L4, L11, L26, L28, L31, L49, L55, L57, L58 and L59.
- This file. Open `tasks/round-406.md` only to look up d-i (the actions contract).
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (memo naming), `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-406/claims-407.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-406/claims-407-planning-output.txt`, with empty stderr.
  - Output on the sketch scratch (HEAD plus the patch): `b-round-406/claims-407-sketch-output.txt`.
  - The two differ only on the lines in `b-round-406/claims-407-planning-vs-sketch.diff`: K1 (the scratch commit), K2 (2 on the scratch), K5, K7, K8, K9 and K11.

## Baseline: HEAD `8ac5bfb`, clean tree
- Gate 406 published `8ac5bfb` on both remotes [K17]. HEAD is `8ac5bfb…` [K1], and `git status --short --untracked-files=all` is empty [K2].
- `context/head-sha.txt` may be stale; K1 decides.
- **Frozen:** `b-round-406/r407-frozen-sha256.txt` has **1,297** entries: every tracked file except the 3 tracked grants. `sha256sum -c` gives rc 0 [K3].
- **Protected:** all 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- **Grants:** `b-round-406/grants-407.txt` (4 paths, §4).

## 0. Why this round
- **Round 406 passed and is published.** PERF-11c-iii-d-i is done (C round 406 PASS, `browserVerified`/`realVerified` true, gate 406 `8ac5bfb`).
- **No Critical or High finding is open.** The open Mediums are root-only, manual or `awaiting_user`, and none reproduces in the cloud browser. C reported no bugs in round 406.
- **REGRESSION-2026-11-10 is not due.** `regression-last.json` says 2026-11-07 [K18].
- **D-29z1407 order: d-ii is next.**
- **What d-ii saves.** HEAD measurement, identical at both viewports (`b-round-406/probe/leaf-head-407.json`): `ArrangementVideoCaption` and the whole video box re-render with the dock on every workspace commit, `[0,3,1,1,1,0,1,1,1,1,1,1,2]` over the 13 probe steps.
  - On the sketch, the caption is `[0,…,0]` and the box (now `ArrangementVideoDockViewInner`) is `[0,…,0]`.
  - The dock shell is unchanged [K21].
- **Product promise (L55):** the Studio and its video behave exactly as before.
  - A stopped frame follows every seek, clip move, Undo and Redo.
  - A playing video stays in sync.
  - Nothing visible changes.

## 1. Rulings (B)

### D-29z1410: the d-ii design (the dispatched patch; L58 reviewed = dispatched)
**Patch:** `b-round-406/sketch-407.patch.txt`, sha256 `4ec62e316b8776b7…` [K14]. It touches 2 files, and `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 2 files afterwards.**

**`app/components/arrangement/ArrangementVideoDock.tsx`:**
- **New memo inner.** `function ArrangementVideoDockViewInner` + `const ArrangementVideoDockView = memo(ArrangementVideoDockViewInner);` [K7].
  - It holds the float state, its handlers and the placeholder + video box JSX, as a Fragment, so the DOM order is unchanged.
  - Props: `videoLane`, `hasVideoClips`, `isVideoExpanded`, `videoFloatAnchor`, `onVideoExpandedChange`, `claimPointerGesture`, `firstVideoRef`, `secondVideoRef`.
- **Memo caption.** `const ArrangementVideoCaptionView = memo(ArrangementVideoCaption);` [K7].
- **Reader.** `useVideoLanePreviewReader(videoTrackId, getArrangement)` is keyed on `[videoTrackId, getArrangement, previewStore]`, no longer on `arrangement` [K8].
- **Commit signal:**
  - `useCommittedVideoLaneClips` gives an identity-stable video-lane clip list, using element-identity `sameClipList` [K9].
  - A `useIsomorphicLayoutEffect` calls `videoLane.publishCommittedVideoClips(videoClips)` [K9].
  - That call notifies every `subscribeVideoLanePreview` listener when the list identity changes. The first publish is silent.
- **The shell keeps the rest:**
  - `useArrangement()` (arrangement, videoSources, pausePlaybackWithStatus);
  - the pause ref;
  - both sync effects;
  - `<section ref={rootRef}>`, where the counters are published;
  - the caption row and `{overview}` [K10].

**`app/lib/arrangement/__tests__/drag-preview-render.test.tsx`:**
- `'ArrangementVideoDockViewInner'` joins `VIDEO_DOCK_COMPONENTS`.
- New describe `PERF-11c-iii-d-ii` [K11]:
  - **DP73:** zoom, an audio move, an audio mute, Undo ×2 and Redo. The dock shell renders, but the inner, caption, fade and gap render 0. The box and overlay elements are the same nodes.
  - **DP74:** stopped video-clip move, then Undo, then Redo. The inner renders 0, while the gap and the overlay opacity follow each commit.
  - **DP75 (positive control):** the inner renders when the first video clip arrives and when the box expands.

**Evidence on the final sketch:**
- tsc and Biome: rc 0 (`b-round-406/sketch-logs/`).
- Biome lint on the whole repo: 205 warnings and 2 infos, the same as the store HEAD with the same command.
- The 16 covering files (`sketch-logs/covering.txt`): 360/360.
- **Full vitest: 262 files and 3,881 tests, rc 0** [K20].
- Mutants: 7/7 red, and the pristine runs before and after give rc 0 [K16].
- With the commit notify dropped, the existing DP70 and DP72 turn red as well.
- Dev leaf probe [K21].
- Stopped-seek browser recipe [K23]: HEAD and the sketch both have error 0 at both viewports. The commit-notify mutant has error **1.5 s** after Ctrl+Z.
- Real-video play drift on the sketch: max 0.008 s (1440) and 0.012 s (1280) [K22].

**Review:** `tech-lead`, one pass on the dispatched sha (`b-round-406/sketch-review.md` names the sha [K14]). Result: **no Critical, High or Medium.** Its Lows are ruled in D-29z1411 (below).

### D-29z1411: rulings on Lows and open signals
- **R406-CR-L2 ruling line:** the shell keeps `useArrangement()` and reads `pausePlaybackWithStatus` through `pauseWithStatusRef`. Only the inner and the caption are memoised. The dock shell's render count is unchanged by design [K10, K21].
- **R406-CR-L3** (no behavioural pin on `getLivePosition` through actions): covered by C row 4 (VIDEO-SYNC). The play loop reads `getLivePosition` from the actions context on every sample, so a wrong mapping breaks the drift assertion. Closed when row 4 passes.
- **TL-R406-SK-L4** (no test proves the dock reads its getters from actions): **closed as equivalent by construction.** Both sources hand out the same function identity, and the shell stays on `useArrangement()` by the ruling above. No render-count test can tell the two apart. This is recorded, not a row.
- **TL-R407-SK-L1** (the cached lane's top-level fields can lag after a track-only commit; no visible effect) and **TL-R407-SK-L2** (no caption-text unit row): deferred_low_polish. The hardening is written in the review.
- **TL-R407-SK-L3** (one extra synchronous caption re-render on a video-clip commit): info, accepted by design.

### Doc 260 (new) and doc 259 (L26, L28)
**New doc:** `docs/implementation/2026/quarter-IV/260-perf-video-dock-memo.md`. 260 is the next free number.
- **Form:** title `PERF-11c-iii-d-ii: video dock-ის memo inner და video-lane commit signal`, in Georgian with technical terms in English. The 7 TEMPLATE headings, in order.
- **l.4, byte-exact:** `**სტატუსი:** Completed (C round 407 PASS)`.
- **ტესტირება** contains:
  - DP73–DP75;
  - the 7 mutant rows, copied from `b-round-406/mutants/summary.txt`;
  - the leaf-probe caption result;
  - the stopped-seek numbers, including the mutant's 1.5 s;
  - the drift numbers.
- **TODO** lists TL-R407-SK-L1/L2 and PERF-11c-iii-e (Lane).

**Doc 259**, as the final stage of a multi-stage feature (L28): only l.4 changes, to exactly `**სტატუსი:** Completed (C round 407 PASS)`. The count of `In Progress (stage` docs goes from 8 to 7 [K6b], and the count of `C round N pending` lines stays 0.

No other doc changes.

### Ruling lines (L4)
- **Patch files:** "apply the patch byte-for-byte" wins over any style preference of A's reviewer.
- **STOP:** a Medium+ in the patch logic is a STOP (L11), not an edit. A doc finding is fixed in doc 260 or 259 (l.4 only).
- **drag-preview-render.test.tsx:** "no assertion lost; equal or stronger replacements allowed". The patch only adds a list entry and 3 rows. Every existing row keeps its assertions. Adding the inner to `VIDEO_DOCK_COMPONENTS` makes DP66/DP71 and the other `NO_VIDEO_DOCK_RENDERS` rows stricter, which is intended.

### Side effects of the old per-commit `videoLane` re-identity (L49)
Today every commit gives `videoLane` a new identity, and its consumers re-run. Each such effect is ruled here.

| Effect today | Ruling | Proof (row / mutant) |
|---|---|---|
| Stopped re-seek after a commit with no preview (Undo, Redo) | Kept, through the commit notify | DP72, DP74; browser row 3; MU-407-NO-COMMIT-NOTIFY, -SUBSCRIBE, -PUBLISH-EFFECT (red) |
| Fade overlay re-subscribe + re-write | Kept, through the notify (`subscribeVideoLanePreview`) | DP70, DP74 |
| Gap and caption re-read | Kept, through `useSyncExternalStore` on the notify; the caption no longer re-renders on audio commits | DP74 (gap); row 5 (caption 0) |
| `stoppedKeyRef` dedupe | Unchanged. The key stays `url|mediaTime` | DP72; row 3 |
| `hasVideoClips` placeholder/gap switch | Kept, as an inner prop computed in the shell | DP75; MU-407-HAS-VIDEO-STUCK |
| Box/inner re-render on audio commits | **Dropped (intended)** | DP73; row 5; MU-407-NO-INNER-MEMO, -NO-CAPTION-MEMO, -READER-PER-RENDER |

**Consumer-count positive controls (L58 memo clause).**
- **drag-preview-render:** `rendersOf('ArrangementVideoDock')).toBeGreaterThan(0)` in DP60, DP66 and DP71 (HEAD l.1787, 2089, 2245; one line later on the patched tree for the last two) count the **shell**, which still renders on mount and on commits. None is silenced. They pass on the sketch (77/77).
- **render-budget:** the `toBeGreaterThan(0)` controls that name the caption or gap (l.375 over `WATCHED_LISTS`, l.450 over `POSITION_CONSUMERS`) are taken right after mount. The memo never skips the first render, so none is silenced. l.463–464 assert `ArrangementVideoCaption: 0` and `ArrangementVideoGapCaption: 0` during playback frames; the memo can only lower those. They pass on the sketch (20/20).
- **No root patch pending:** `cloud/root-commits/` and `root-deps-request.json` do not exist in the loop folder at planning time. If K1 at A1 is not `8ac5bfb`, A re-runs the claims on the new HEAD and STOPs only if K5 is `no` or K3 is not rc 0.

## 2. Reference
Not applicable. This is a performance and refactor round with no visible or behavioural change, which the reference-first rule excludes. There is no screen-budget change, and the product-designer, Ableton and YouTube steps do not apply.

## 3. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-406/sketch-407.patch.txt`, then `git apply` the same file. Do not edit the 2 files after that.
3. Write doc 260 and change doc 259 l.4, as above.
4. Run the §5 checks. Write `a-round-407.md` as you go: changed files, checks with their rc and file paths, reviewer findings, and a For B section.

## 4. Grants (`b-round-406/grants-407.txt`)
- **Patch only:**
  - `app/components/arrangement/ArrangementVideoDock.tsx`
  - `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`
- **Doc 259:** l.4 only.
- **New doc:** `docs/implementation/2026/quarter-IV/260-perf-video-dock-memo.md`.
- **Nothing else:** no protected, auth, route, config, package, perf, context or other doc file.
- At the end, `git status --short --untracked-files=all` shows exactly 3 ` M` lines and 1 `??` line.

## 5. A's checks
Under the speed rules, the full suite and verify belong to the gate.

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-406/claims-407.sh` at start | Equals `claims-407-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 2 patch files | rc 0 each |
| A3 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-406/sketch-logs/covering.txt)` (16 files) | 360/360 pass. Report the slowest test against its declared timeout. L31: none may be above 50 %; otherwise STOP |
| A4 | Claims at end | Differs from planning only on K2 (4), K5 (`no`), K6 (`Completed (C round 407 PASS)`), K6a (`1` plus the doc 260 l.4), K6b (7, pending 0) and K7–K11. K7–K11 equal `claims-407-sketch-output.txt`. K3 stays 1,297 with rc 0 |
| A5 | `code-reviewer` (4 files) | No Critical, High or Medium in the patch logic. A Medium+ there is a STOP (L11). Doc findings are fixed in the docs |

## 6. C's acceptance
Write `c-round-407.json` with **all L57 fields**, including `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`, and one result per row. `mutantRedOnSketch` = `b-round-406/mutants/summary.txt`.

**Order (L59):** run the heaviest rows first: row 6, then row 5, then rows 3 and 4. Write `c-round-407/progress.json` after every row.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the planning output except the A4 lines. Status = the 4 granted paths. Frozen 1,297 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply the patch to a `git archive HEAD` scratch and `cmp` its 2 files against the working tree: 0 differences |
| 3 | **STOPPED-SEEK** (browser, 1440×900 and 1280×720, working tree) | Run `node b-round-406/video/video-stopped-seek-probe.mjs http://127.0.0.1:5173 <out>.json <WxH>`. **Assert:** no `error` field; `moved` true; all 4 steps (ruler click, move release, Ctrl+Z, Ctrl+Shift+Z) have `error` ≤ 0.05 s; `maxError` ≤ 0.05. B's runs: 0 on HEAD and on the sketch. B's commit-notify mutant gave 1.5 (`video/stopped-mutant-NO-COMMIT-NOTIFY-1440x900.json`). Screenshot per viewport |
| 4 | **VIDEO-SYNC** (browser, both viewports) | Run `node b-round-406/video/video-playsync-probe.mjs http://127.0.0.1:5173 <out>.json <WxH>`. **Assert:** every sample has `paused` false and \|drift\| ≤ 0.05 s. **Record:** `data-video-swaps` and `data-video-fallbacks` on `[data-testid="arrangement-video-dock"]` after the run (the only `data-video-*` counters the dock publishes; there is no `data-video-hardseeks`), and the `[data-testid="arrangement-video-caption"]` text with the video under the playhead (TL-R407-SK-L2) |
| 5 | **LEAF-PROBE** (browser, both viewports) | Run `node b-round-406/probe/leaf-probe-407.mjs http://127.0.0.1:5173 <out>.json`. **Assert:** 0 page errors and no `error` per viewport. `ArrangementVideoDock` per step = `[0,3,1,1,1,0,1,1,1,1,1,1,2]`. `ArrangementVideoCaption` = 13 zeros. `ArrangementVideoDockViewInner` = 13 zeros. `StudioWorkspace` equals `b-round-406/probe/leaf-sketch-407.json`. **Record:** the other leaves. `ArrangementLibraryPreviewViewInner`'s `library-preview-stop` has a known jitter of ±2 (313 vs 315 in B's runs). **Record (not run on the sketch):** clicking `arrangement-video-expand` once afterwards makes `ArrangementVideoDockViewInner` > 0 (positive control; the unit control is DP75) |
| 6 | **UNIT + MUTANT** | The A3 set passes, 360/360. Then run the mutants on a committed scratch copy of the working tree (steps in the notes). Pass = 7/7 RED, each naming its expected DP row; pristine before and after rc 0; scratch status 0 lines |
| 7 | **AUTH** (browser, both viewports) | Demo `/studio-lab` opens with `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token?product=middle-east&file=a.mp3` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 8 | **DOCS** | Doc 260 l.4 byte-exact; the 7 TEMPLATE headings in order. Its 7 mutant rows equal `b-round-406/mutants/summary.txt`, and DP73/DP74/DP75 exist in the test file (L26). Doc 259 differs from HEAD only on l.4, which is `**სტატუსი:** Completed (C round 407 PASS)`. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. No other doc changed |
| 9 | **SOURCE-SCOPE end + L57** | As row 1, at the end. Claims at end equal claims at start, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch run is in `b-round-406/precheck-full.log` |

**Notes on the rows:**
- **Rows 3–5, retries:** a first-load timeout on a cold server is an environment problem (B hit one on the sketch's first 1440 leaf run: `probe/leaf-sketch-407-cold-timeout.json`). Retry at most twice; it is never a FAIL.
- **Row 6, mutant steps:**
  1. Copy the working tree to `/tmp/c407-scratch` and symlink `node_modules`.
  2. Run `git init && git add -A && git commit`.
  3. Run `S=/tmp/c407-scratch OUT=<loop>/c-round-407/mutants python3 -I b-round-406/mutants/run.py`. Never use the default `OUT`, which holds B's evidence.
  4. The runner prints `SCRATCH-STATUS N lines (B uncommitted sketch: 2; a committed scratch: 0)`. On C's committed scratch, 0 lines is the pass value.

**Neighbouring behaviour that could break:**
- The stopped frame after Undo or Redo of a video edit (rows 3 and 6).
- The play sync loop (row 4).
- The floating video box: expand, drag, return and resize clamp. Its code moved into the inner unchanged; the floating-video file (47 rows) is in the A3 set.
- The video fade overlay (video-fades-ui, DP70).
- The empty-monitor state (DP75).

## 7. For C: the mutants (`b-round-406/mutants/run.py`, site file `ArrangementVideoDock.tsx`)
| Mutant | Site | Expected red |
|---|---|---|
| MU-407-NO-INNER-MEMO | `memo(ArrangementVideoDockViewInner)` → the bare function | DP73 |
| MU-407-NO-CAPTION-MEMO | `memo(ArrangementVideoCaption)` → the bare function | DP73 |
| MU-407-READER-PER-RENDER | the reader gets `() => getArrangement()` (a new identity every render) | DP73 |
| MU-407-NO-COMMIT-NOTIFY | the listener loop in `publishCommittedVideoClips` is removed | DP74 (also DP70, DP72) |
| MU-407-NO-COMMIT-SUBSCRIBE | `commitListeners.add(listener);` is removed | DP74 |
| MU-407-NO-PUBLISH-EFFECT | the publish call becomes a plain read | DP74 |
| MU-407-HAS-VIDEO-STUCK | `hasVideoClips = true` | DP75 |

**Equivalent and recorded (not rows), from `sketch-review.md`:**
- iterating the listener set without a copy;
- dropping the `publishedClips === clips` early return (StrictMode only);
- a noisy first publish;
- adding `onChange` without the wrapper;
- `useEffect` instead of the layout effect for the publish;
- the `sameClipList` cache bypass;
- `useArrangement()` versus `useArrangementActions()` for the dock's getters (TL-R406-SK-L4).
