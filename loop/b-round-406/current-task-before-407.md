# Round 406: PERF-11c-iii-d-i — the actions context hands out the dock's two playback getters, and the video dock reads its getters from it (behaviour-preserving, from B's reviewed sketch)

**Planned by:** B, at the round 405 → 406 planning, 2026-11-08 (`b-round-405.md`). Advisor used before planning and before hand-off.

## Read first
- `lessons.md` in full. The most relevant lessons are L4, L11, L26, L28, L29, L31, L49, L56, L57, L58 and L59.
- This file. Open `tasks/round-404.md` or `tasks/round-405.md` only to look up the actions-context contract (AC1–AC7).
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`, plus `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-405/claims-406.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-405/claims-406-planning-output.txt`. Its stderr is empty (`claims-406-planning-stderr.txt`).
  - Output on the sketch scratch, which is HEAD plus the patch: `b-round-405/claims-406-sketch-output.txt`.
  - The two differ only on the lines in `b-round-405/claims-406-planning-vs-sketch.diff`:
    - K1 (the scratch commit);
    - K2 (3 on the scratch, 4 for A once doc 259 exists);
    - K5, K7, K7b, K8, K9, K10 and K11.

## Baseline: HEAD `5c89a95`, clean tree
- Gate 405 published `5c89a95` on both remotes [K17]. HEAD is `5c89a95…` [K1], and `git status --short --untracked-files=all` is empty [K2].
- `context/head-sha.txt` says `dd52107`. It was written before the gate and is stale.
- **Frozen:** `b-round-405/r406-frozen-sha256.txt` has **1,296** entries: every tracked file except the 3 granted source files. `sha256sum -c` gives rc 0 [K3].
- **Protected:** all 11 protected files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- **Grants:** `b-round-405/grants-406.txt` (4 paths, §4).

## 0. Why this round
- **Round 405 passed and is published.** SYS-R385 is complete (C round 405 PASS, `browserVerified`/`realVerified` true, gate 405 `5c89a95`).
- **No Critical or High finding is open.** The open Mediums are root-only, manual or `awaiting_user`, and none reproduces in the cloud browser. C's only round-405 bug is a Low, deferred (D-29z1404).
- **REGRESSION-2026-11-10 is not due.** `regression-last.json` says 2026-11-07 [K18].
- **The D-29z1402 order puts PERF-11c-iii-d (VideoDock) next.** HEAD measurement (`b-round-405/probe/leaf-head-406.json`, identical at both viewports): the dock renders on every workspace commit, plus 1 on play and 1 on stop. Per step:

  | Step | Dock renders |
  |---|---|
  | audio add | 3 |
  | zoom step | 1 |
  | audio-lane mute | 1 |
  | Ctrl+Z | 1 |
  | Undo / Redo button | 1 each |
  | preview start | 1 |
  | preview stop | 2 |
- **Split (D-29z1405, `tech-lead`):**
  - **d-i (this round)** widens the actions contract, without changing behaviour.
  - **d-ii (next round)** delivers the render saving: a memoised `ArrangementVideoDockViewInner`, the video-lane reader keyed on the video track plus a committed video-clip signal, and a memoised caption.
  - The split gives d-ii a clean baseline, so its render change and its stopped-video correctness trap can be judged on their own.
- **Product promise (L55):** the Studio and its video behave exactly as before. A video on the lane plays in sync, and nothing visible changes.

## 1. Rulings (B)
### D-29z1405: d-i scope and the checkpoint default
- **ARCH-CHECKPOINT-SYS-R385-ACTIONS has no answer from root** (`architecture_checkpoint_requests` still says `requested`). By the request's own clause, B applies option 1: extend `ArrangementActions` (the B-actions default).
- **`performance-optimizer` preferred separate props** (`b-round-405/consult-performance-optimizer.md`). It is ruled down for three reasons:
  - both forms give the same identities, because every getter is `useCallback([])` [K13];
  - the SYS-R385 convention and `tech-lead` both favour one actions source;
  - AC7 then pins the new keys.
- **New keys: `getLivePosition` and `getPlaybackClock`.** The count goes 34 → 36.
  - `getArrangement` is already an action.
  - `pausePlaybackWithStatus` stays on `useArrangement()`. Its dependency chain is not proven stable, and the dock reads it through a ref anyway.
- **The const-tuple derivation (TL-R403-SK-L1) is not folded in.** `tech-lead` found it cannot remove the memo-object list or the deps list without either a forbidden type assertion or breaking Biome's literal deps. It stays a deferred Low and is ruled again at the Lane (e) planning.

### D-29z1407: the dispatched patch (L58: reviewed = dispatched)
- **Patch:** `b-round-405/sketch-406.patch.txt`, sha256 `60bdf24c7a0fff14…` [K14]. It touches 3 files, and `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 3 files afterwards.**
- **`app/contexts/ArrangementContext.tsx`:**
  - the `ArrangementActions` Pick gains `'getLivePosition'` and `'getPlaybackClock'`, for 36 keys [K7, K7b];
  - the actions memo gains `getLivePosition: livePosition,` and `getPlaybackClock,`;
  - its deps gain `getPlaybackClock` and `livePosition` [K8].
- **`app/components/arrangement/ArrangementVideoDock.tsx`:** `ArrangementVideoDock` reads `getLivePosition`, `getPlaybackClock` and `getArrangement` from `useArrangementActions()`. It keeps `arrangement`, `videoSources` and `pausePlaybackWithStatus` from `useArrangement()` [K10], so its render count does not change; d-ii changes it.
- **`app/lib/arrangement/__tests__/actions-context.test.tsx`:** `ACTION_KEY_COUNT = 36`, and AC7's title says "all 36" [K9]. AC7's all-keys loop now also pins the two new entries `toBe` the provider value's entries.
- **Evidence on the final sketch:**
  - tsc and Biome: rc 0 on the 3 files (`b-round-405/sketch-logs/`).
  - The 8 covering files pass 180/180: actions-context, floating-video, video-fades-ui, video-dock-strings-ui, render-budget, library-video-return-focus, drag-preview-render and overview-visibility-ui.
  - Full vitest: 262 files and 3878 tests, rc 0 [K20].
  - Mutants: 4/4 red. The pristine runs before and after give rc 0 [K16].
  - Dev leaf probe, sketch against HEAD: **0 differences** over all 22 leaves × 13 steps × 2 viewports [K21].
  - Real-video play sync on HEAD and on the sketch: max |drift| 0.013 s, and the video never paused [K22].
- **Review:** `tech-lead` made one pass on the dispatched sha (`b-round-405/sketch-review.md` names the sha [K14]). Result: **no Critical, High or Medium.** The Lows TL-R406-SK-L1…L5 are ruled there (D-29z1406):
  - L1–L3 are deferred;
  - L4 is proven in d-ii;
  - L5 is doc 259, below.

### Doc 259 (new; L26, L28)
- **Path:** `docs/implementation/2026/quarter-IV/259-perf-video-dock-actions.md`. 259 is the next free number; 258 is SYS-R385.
- **Form:** title `PERF-11c-iii-d: video dock-ის leaf …`, in Georgian with technical terms in English. The 7 TEMPLATE headings, in order.
- **l.4, byte-exact:** `**სტატუსი:** In Progress (stage 1 of 2; C round 406 PASS)`.
  - This is the post-PASS value (L28). `c-round-406.json` stays the source of truth.
  - The count of `In Progress (stage` docs goes from 7 to 8 [K6b]. The count of `C round N pending` lines stays 0.
- **ტესტირება** contains:
  - the AC7 count change;
  - the 4 mutant rows, copied from `b-round-405/mutants/summary.txt`;
  - the leaf-probe result (0 differences);
  - the video-drift numbers from `b-round-405/video/drift-summary.txt`.
- **TODO** lists:
  - d-ii: the memo inner, the reader keyed on the video track and the committed video clips, the caption memo, and the stopped video-Undo re-seek row;
  - the deferred TL-R406-SK-L1…L3.
- No other doc changes.

### Ruling lines (L4)
- "Apply the patch byte-for-byte" wins over any style preference of A's reviewer for the 3 patch files.
- A Medium+ in the patch logic is a STOP (L11), not an edit. A doc finding is fixed in doc 259.
- AC7 follows "no assertion lost; equal or stronger replacements allowed". Changing the count literal from 34 to 36 is the intended pin, not a weaker assertion.

### Side effects (L49)
| Effect | Ruling |
|---|---|
| Two more entries in the actions object | Intended. Both getters are stable `useCallback([])` [K13], so the actions object keeps one identity (AC1/AC7) |
| The dock now calls `useArrangementActions()` | Intended. The function identities are the same, so the sync-loop effect never re-runs differently. The dock still subscribes through `useArrangement()`, so its render count is unchanged (probe: 0 differences) |
| A future action key | AC7 turns red until `ACTION_KEY_COUNT` and the title are updated. This pin is intended |

## 2. Reference
Not applicable. This is a performance and refactor round with no visible or behavioural change, which the reference-first rule excludes. There is no screen-budget change, and the product-designer, Ableton and YouTube steps do not apply.

## 3. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-405/sketch-406.patch.txt`, then `git apply` the same file. Do not edit the 3 files after that.
3. Write doc 259 as above.
4. Run the §5 checks. Write `a-round-406.md` as you go: changed files, checks with their rc and file paths, reviewer findings, and a For B section.

## 4. Grants (`b-round-405/grants-406.txt`)
- **Patch only:**
  - `app/contexts/ArrangementContext.tsx`
  - `app/components/arrangement/ArrangementVideoDock.tsx`
  - `app/lib/arrangement/__tests__/actions-context.test.tsx`
- **New doc:** `docs/implementation/2026/quarter-IV/259-perf-video-dock-actions.md`.
- **Nothing else:** no protected, auth, route, config, package, perf or other doc file.
- At the end, `git status --short --untracked-files=all` shows exactly 3 ` M` lines and 1 `??` line.

## 5. A's checks
Under the speed rules, the full suite and verify belong to the gate.

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-405/claims-406.sh` at start | Equals `claims-406-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 3 patch files | rc 0 each |
| A3 | `npx vitest run` on the 8 files in `b-round-405/sketch-logs/covering.txt` | 180/180 pass. Report the slowest test against its declared timeout. L31: none may be above 50 %; otherwise STOP |
| A4 | Claims at end | Differs from planning only on K2 (4 lines), K5 (`no`), K6 (`1` plus the l.4 above), K6b (8, pending 0) and K7–K11. K7–K11 equal `claims-406-sketch-output.txt`. K3 stays 1,296 with rc 0 |
| A5 | `code-reviewer` (4 files) | No Critical, High or Medium in the patch logic. A Medium+ there is a STOP (L11). Doc findings are fixed in doc 259 |

## 6. C's acceptance
Write `c-round-406.json` with **all L57 fields**, including `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`, and one result per row. Run the heaviest rows first (L59): row 5, then row 4, then row 3.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the planning output except the A4 lines. Status = the 4 granted paths. Frozen 1,296 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply the patch to a `git archive HEAD` scratch and `cmp` its 3 files against the working tree: 0 differences |
| 3 | **VIDEO-SYNC** (browser, 1440×900 and 1280×720, working tree) | Run `node b-round-405/video/video-playsync-probe.mjs http://127.0.0.1:5173 <out>.json <viewport>` (see the notes below the table). **Assert:** every sample has `paused` false and \|drift\| ≤ 0.05 s. **Record:** the `data-video-swaps/fallbacks/hardSeeks` values on `[data-testid="arrangement-video-dock"]` after the run, and a screenshot per viewport. **Record — not run on sketch: no B stopped-seek recipe:** while stopped, seek to 2 s and read the active video's `currentTime` |
| 4 | **LEAF-PROBE** (browser, both viewports) | Run `node b-round-405/probe/leaf-probe-406.mjs http://127.0.0.1:5173 <out>.json`. **Assert:** 0 page errors, and the per-step counts equal `b-round-405/probe/leaf-sketch-406.json` for `StudioWorkspace` and `ArrangementVideoDock`. VideoDock per step: `[0,3,1,1,1,0,1,1,1,1,1,1,2]`. `ArrangementLane` and the other leaves are recorded (see the notes) |
| 5 | **UNIT + MUTANT** | The A3 set passes. Then run the mutants on a scratch copy of the working tree (steps in the notes). Pass = 4/4 RED, pristine before and after rc 0, and scratch status 0 lines |
| 6 | **AUTH** (browser, both viewports) | Demo `/studio-lab` opens with `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 7 | **DOCS** | Doc 259: l.4 byte-exact as above; the 7 TEMPLATE headings in order; the 4 mutant rows equal `b-round-405/mutants/summary.txt`; AC7 exists in the test file (L26). `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. No other doc changed |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. Claims at end equal claims at start, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch run is in `b-round-405/precheck-full.log` |

Notes on the rows:
- **Row 3, probe:** it adds `public/videos/hero/1.mp4` and records two play windows of 3 samples each. The second window comes after a trim, a fade and a move, each followed by Ctrl+Z.
- **Row 3, baseline:** B measured max |drift| 0.013 s on HEAD and on the sketch [K22].
- **Row 3, retries:** a first-load timeout on a cold server is an environment problem. Retry at most twice; it is never a FAIL.
- **Row 4, recorded leaves:** `ArrangementLibraryPreviewViewInner`'s `library-preview-stop` count has a known jitter of ±2 (round 379).
- **Row 5, mutant steps:**
  1. Copy the working tree to `/tmp/c406-scratch` and symlink `node_modules`.
  2. `git init && git add -A && git commit`.
  3. Run `S=/tmp/c406-scratch OUT=<loop>/c-round-406/mutants python3 -I b-round-405/mutants/run.py`. Never use the default `OUT`, which is B's evidence.
  4. The runner prints `SCRATCH-STATUS N lines (sketch files expected: 3)`. The parenthetical describes B's uncommitted scratch. On C's committed scratch, 0 lines is the pass value.

**Neighbouring behaviour that could break:**
- The video sync loop. It reads `getArrangement()`, `getLivePosition()` and `getPlaybackClock()` on every sample, and now gets them from the actions context. Row 3 covers it.
- Every actions consumer (K11 SWEEP: Library, LoopBrace, Master, Transport, StudioWorkspace and VideoDock), if the actions identity were to change. AC1 and AC7 cover that, and row 4 shows no extra renders.

## 7. For C: the mutants (`b-round-405/mutants/run.py`)
| Mutant | Site | Expected red |
|---|---|---|
| MU-406-DROP-LIVEPOS | `getLivePosition: livePosition,` removed from the actions memo | AC7 (count 35) |
| MU-406-DROP-CLOCK | `getPlaybackClock,` removed from the actions memo | AC7 |
| MU-406-WRAP-LIVEPOS | `getLivePosition: () => livePosition(),` | AC7 (not `toBe` the provider entry) |
| MU-406-WRAP-CLOCK | `getPlaybackClock: () => getPlaybackClock(),` | AC7 |

**Equivalent and recorded (not rows):** if the dock read its getters from `useArrangement()` instead of `useArrangementActions()`, the function identities would be the same, so no test can tell the two apart (TL-R406-SK-L4). d-ii's render-budget row is the proof that the dock depends on the actions context alone.
