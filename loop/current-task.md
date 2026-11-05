# CURRENT TASK — Round 347: PERF-DRAG-PREVIEW stage c6-ii. Lane mix faders and the detail clip gain stop re-rendering during a clip drag; one round-346 Low is closed

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 346 → 347 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v307 → v308, D-29z1095…D-29z1099):
- **D-29z1095:** round 346 closed as PASS from C's evidence (`c-round-346.json`: PASS, `browserVerified`/`realVerified` true, 11 rows, 0 bugs). Gate 346 `published` **`4895732`** on both remotes [K1]. **Baseline = `4895732`**, clean tree [K2]. Stage c6-i → done. New perf oracle: `c-round-346/perf-results/latest-interactions.json`.
- **D-29z1096:** round-346 notes routed.
  - **Fixed in this round:** GATE346-L1 (= A-R346-REVIEW-L3, DP64's fixed 5-tick loop) and GATE346-INFO3 (doc 232 status).
  - **Signal only:** the gate's harness-extraction note → ARCH-R346-DP-HARNESS-EXTRACT.
  - **Correction:** PERF-LIB is **40/40** (report 34 + zoom-probe 6), not the 34 that round 346's task said.
- **D-29z1097:** the c6-ii shape is option **(b)**: one small `useStableHandler` hook plus `memo`. Rejected: per-site `useCallback` with deps, and extracting a memoised lane header (that is checkpoint question 3). Both halves ship in one round, with acceptance reported per half (`tech-lead`).
- **D-29z1098:** not in this round (recorded):
  - Master and GroupHeader inline fader handlers → PERF-CAND-MASTER-GROUP-FADER-PROPS.
  - The conversions are the next stage.
  - The ClipGain memo does not hold in the no-selection state (`reasonNode`); this is a known limit, since nothing is dragged there.
  - ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is still due with root and does not block this round.
- **D-29z1099:** this task.

**Read first:**
- `lessons.md` items 10, 11, 12, 22, 23, 29, 37, 38, 56, 57, 58. For C, also 59 and 60 (destructive commands only inside `c-round-347/`, with absolute paths).
- Primitives:
  - `AUDIO_ARCHITECTURE.md` (Studio);
  - `FORWARDREF_COMPONENT.md` (the two memoised components);
  - `AGENT_DISCOVERABLE_CODE.md` (new hook name, no JSDoc);
  - `REACT_CONTEXT.md` (handlers read context functions);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` (doc 232).
- `.claude/prompts/new-hook.md` (new hook) and `.claude/prompts/studio-feature.md`.

**L29 note:** untagged code text below is an expected value, a new name, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first, product-designer, the screen budget and the YouTube request do not apply.** This is a performance round. The DOM output is identical: same inputs, attributes, readouts and buttons. No text, layout, colour, behaviour or audio change.

## Baseline
- HEAD `4895732` (gate 346, published), clean tree [K2]. Protected files 11/11 OK [K8]. No dependency change.
- **Interactions oracle:** `c-round-346/perf-results/latest-interactions.json`, with 230 rows, `complete`, 0 failures and 60/60 asserted rows passing [K12]. Per move: trim 17.7 (max 18), move 18.467 (max 89), fade 5.9 (max 6).
- **Fader oracle:** `c-round-341/perf-results/latest.json`, the last full run of `perf/studio-lab.perf.spec.ts` (321 rows, `complete`, 0 failures). The `fader.*.move-components-per-move` rows are track 0.75, pan 0.875/0.65, group 0.75, master 0.792/0.742 and clipgain 2.75/2.25 (stopped/playing). All are `assert`.

## 0. Why, and B's evidence

### 0.1 Premise at HEAD (L37)
C's round-346 NAMES (`c-round-346/names.json`, dev :5173, `4895732`) show the components per pointermove commit:
- **fade** 6: `ArrangementLane`, 2× `ArrangementMixFader`, `ArrangementClipViewInner`, `ArrangementClipEnvelope`, `ArrangementStatusTextInner`;
- **trim** 18: the same list without the status text, plus the overview, peak path, range overlay, the detail chain, **`ArrangementDetailClipGain`**, and the readouts;
- **move** 15 (89 at the project-end crossing).

The two lane faders and the detail clip gain draw nothing the drag changes. They re-render because their parents pass new closures on every render [K3, K4, K5]:
- **Lane:** about 12 per-render closures (pan change, pointer end, blur, keydown, double-click, `renderPanReadout`, and five inline volume arrows).
- **Detail panel:** four inline arrows, plus named handlers rebuilt on each render and a new `storedClipGainsDb` array literal.

### 0.2 B's sketch (`b-round-346/sketch/`, scratch `git archive 4895732` at `/home/runner/b346-scratch/sc`)
- **`source.patch.txt`,** made by `apply-source.py` and then `apply-source-clipgain.py`, both followed by `biome check --write`. It changes 4 files:
  - **New `app/hooks/useStableHandler.ts`:** `export function useStableHandler<Args extends unknown[], Result>(handler)`. It stores the latest handler in a ref, written in `useIsomorphicLayoutEffect`, and returns `useCallback((...args) => handlerRef.current(...args), [])`. No JSDoc: the contract goes into doc 232 (`tech-lead`, `AGENT_DISCOVERABLE_CODE.md` §8).
  - **`ArrangementMixFader.tsx`:** the forwardRef becomes `ArrangementMixFaderInner`, keeping `displayName = 'ArrangementMixFader'`. The export is `const ArrangementMixFader = memo(ArrangementMixFaderInner);`. The component name, exported type and props are unchanged.
  - **`ArrangementLane.tsx`:** 10 handlers are wrapped in `useStableHandler`. Four are new named handlers replacing the inline volume arrows (`handleVolumeChange`, `handleVolumePointerEnd`, `handleVolumeKeyUp`, `handleVolumeBlur`); `handlePanDoubleClick` replaces the inline pan double-click. **`renderPanReadout` is a `useCallback` with deps `[isPanCentred, setTrackPan, trackId, trackName]`, not a stable handler, because `ArrangementMixFader` calls it during render.**
  - **`ArrangementDetailPanel.tsx`:**
    - `ArrangementDetailClipGainInner` keeps `displayName = 'ArrangementDetailClipGain'` and is wrapped in `memo`.
    - `selectedClipGainIds` and `storedClipGainsDb` are memoised by a JSON string key. A new `parseClipGainDbKey` keeps only finite numbers, so there is no `[]` → `[0]` round trip; clip gain is −60…+24 dB.
    - 10 handlers use `useStableHandler`: 5 existing named ones plus 5 replacing inline arrows (`handleClipGainFieldChange`, `handleClipGainFieldBlur`, `handleClipGainFaderChange`, `handleClipGainFaderKeyUp`, `handleClipGainResetClick`).
  - `git apply --check` is clean on `store/`. Typecheck rc 0 (`b-round-346/sketch-tsc.log`). Biome is clean on all 4 files.
- **Names on the sketch** (dev :5197 with a private Vite `cacheDir`, stopped afterwards; `b-round-346/names-sketch-v2.json`). Components are only removed, never added:
  - fade [6×4] → **[4×4]**;
  - trim [18×4] → **[15×4]**;
  - move [15, 15, 89, 15] → **[12, 12, 82, 12]**;
  - click [88, 0] → **[83, 0]**.

  The crossing commit still holds `ArrangementMaster` and its fader, because Master passes inline props (D-29z1098).
- **Interactions perf on the sketch build** (production, run alone; `b-round-346/sketch-perf-results/latest-interactions.json`, `b-round-346/sketch-perf-rowcmp-vs-c346.txt`):
  - `complete`, 0 failures, 230 rows, 60/60 asserted rows pass, 0 NEW, **0 rows higher**. `durationMs` 468516.
  - Per move: trim 17.7 → **14.75** (max 15), move 18.467 → **15.317** (max 82), fade 5.9 → **3.933** (max 4).
  - Also lower: lane 20.531 → 17.344, group 21.219 → 18.031, video stopped 17.717 → 15.75, range 7.267 → 6.283, click 88 → 83, play start/stop 76 → 70, zoom 83 → 77.
- **Fader perf on the sketch build** (`perf/studio-lab.perf.spec.ts`): see §0.3.
- **Unit tests on the sketch:** the covering run of 104 files passed 1670/1670 (`b-round-346/sketch-covering-vitest.log`; list in `b-round-346/covering-files.txt`). The final sketch's 36 fader, clip-gain and drag-preview files passed 720/720 (`b-round-346/sketch-final-vitest.log`), together with B's DP65 prototype (`b-round-346/sketch/dp65-prototype.test.tsx.txt`; it holds a `console.log` that A must not copy).
- **B's mutants on the DP65 prototype:**
  - `memo` removed from MixFader → red ("trimStart: expected 4 to be +0");
  - the lane volume `onBlur` inline again → red;
  - `memo` removed from ClipGain → red;
  - the `storedClipGainsDb` array literal inline again → red.

  Separately, dropping `isPanCentred` from the `renderPanReadout` deps (a stale pan-reset `disabled`) turns 2 `track-pan.test.tsx` tests red.

### 0.3 Fader drag (SABA-B-5 path)
`memo` cannot stop the fader's own `useSyncExternalStore` draft re-render, so a fader's own drag still updates its value and readout. B ran `perf/studio-lab.perf.spec.ts` on the sketch build (production, alone; `b-round-346/sketch-fader-perf-results/latest.json`, `b-round-346/sketch-fader-perf-rowcmp-vs-c341.txt`):
- `complete`, 0 failures, 321 rows, **94/94 asserted rows pass**, 0 NEW. `durationMs` 472717.
- **No `fader.*` components, commits or restarts row differs** from the round-341 oracle, and no row is higher.

## 1. Scope (A)

### 1.1 Files (exactly 7)
| # | File | Change |
|---|---|---|
| 1 | `app/hooks/useStableHandler.ts` (new) | From `source.patch.txt`. |
| 2 | `app/hooks/__tests__/useStableHandler.test.ts` (new) | §1.2.1. |
| 3 | `app/components/arrangement/ArrangementMixFader.tsx` | Apply `source.patch.txt`. |
| 4 | `app/components/arrangement/ArrangementLane.tsx` | Apply `source.patch.txt`. |
| 5 | `app/components/arrangement/ArrangementDetailPanel.tsx` | Apply `source.patch.txt`. |
| 6 | `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | §1.2.2 and §1.2.3. |
| 7 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | §1.3. |

Untouched:
- `ArrangementMaster.tsx`, `ArrangementGroupHeader.tsx` (PERF-CAND-MASTER-GROUP-FADER-PROPS), `ArrangementContext.tsx`, `useRelativeFaderDrag.ts` and `app/hooks/index.ts` (the new hook is not re-exported, like `useRelativeFaderDrag`);
- `perf/budgets*.json`, the perf specs, `perf/lib`, `e2e`, config, and the protected files.

### 1.2 Tests
1. **`useStableHandler.test.ts`** (`renderHook` with `initialProps`; style as in `useIsomorphicLayoutEffect.test.ts`). Test names start with `SH1:` … `SH4:`; K6 counts `it('SH`:
   - **SH1:** the returned function keeps its identity across `rerender` with a new handler.
   - **SH2:** after `rerender`, calling it runs the new handler, not the old one.
   - **SH3:** arguments and the return value pass through.
   - **SH4:** the handler is never called by rendering alone. Its call count equals the number of explicit calls after mount and two rerenders.
   - **Red proof (A, scratch copy):** a hook that returns `handler` directly makes SH1 red, and a hook that never updates the ref makes SH2 red.
2. **DP65** "a stopped trim, move and fade re-render no lane mix fader and no detail clip gain". It goes in the c6-i describe block; **no new describe**, because of ARCH-R346-DP-HARNESS-EXTRACT.
   - Mount `[...AUDIO_CLIPS, PROJECT_END_CLIP]`.
   - **Positive control:** after mount, `rendersOf('ArrangementMixFader') > 0` and `rendersOf('ArrangementDetailClipGain') > 0`.
   - For trimStart, the header move and the fade-in handle on `c1`, use the same gesture table and steps as DP63: press, one move, `renderLog.counts.clear()`, two more moves. Then:
     - `rendersOf('ArrangementClipViewInner') > 0`;
     - `rendersOf('ArrangementMixFader') === 0`;
     - `rendersOf('ArrangementDetailClipGain') === 0`.
   - Release, then Undo.
   - B's prototype is in `b-round-346/sketch/dp65-prototype.test.tsx.txt`. Drop its `console.log`.
3. **DP64 waitFor** (closes GATE346-L1): replace the `for (let tick = 0; tick < 5; tick++)` loop with `await waitFor(() => expect(live(api).arrangement.clips.some((clip) => clip.trackId === 'video')).toBe(true));`. Add `waitFor` to the `@testing-library/react` import. The rest of DP64 is unchanged.

### 1.3 Doc 232 (Georgian, technical terms in English)
- **l.4 status:** `In Progress (stage c6-ii of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5-i, c5-ii, c6-i, c6-ii, conversions; C round 347 pending)`. This closes GATE346-INFO3: the "C round 346 pending" text is gone.
- **Title line:** append `, ეტაპი c6-ii — fader-ებისა და clip gain-ის memo`.
- **New section** `### ეტაპი c6-ii: MixFader და DetailClipGain memo (round 347, D-29z1097)` after the c6-i section. It covers:
  - the premise (§0.1) and the names/perf numbers (§0.2, §0.3);
  - the `useStableHandler` contract: stable identity; calls the latest handler; **never call it during render**, which is why `renderPanReadout` stays a dep-ful `useCallback`;
  - the rejected options;
  - the known limits (`reasonNode` in the no-selection state; Master and GroupHeader still pass inline props).
- **Changed files, testing and TODO:** add the hook and its test, DP65, the DP64 `waitFor`, and A's perf runs. TODO: conversions → PERF-CAND-VIDEO-TRIM-FADE-ROWS → PERF-CAND-MASTER-GROUP-FADER-PROPS.
- **The `## ` count stays 7** [K11].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-346/claims-347.sh` from the loop root | equals `b-round-346/claims-347-planning-output.txt` |
| A-CLAIMS final | same | K3, K4 and K5 equal `b-round-346/claims-347-sketch-output.txt`. K2 = `4895732 7` (5 modified + 2 untracked). K6 = `hook present export 1 test present SH-it 4`. K7 = `DP it( 67 DP64 1 DP65 1 tick-loop 0 waitFor ≥ 1`. K8 11. K10 = `0` lines and `untracked 0` (the K10 untracked count excludes the hook files). K11 = `7 1 0`. K12 = `230 60` |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205 |
| /check | Biome on the 6 changed code files | rc 0 |
| A-UNIT | `npx vitest run app/hooks/__tests__/useStableHandler.test.ts app/lib/arrangement/__tests__/drag-preview-render.test.tsx` plus the fader/clip-gain files: `fader-click`, `fader-guards`, `fader-pointer-preview`, `fader-touch`, `fader-style-ui`, `track-pan`, `pan-release-recovery`, `master-ui`, `track-group-mix-ui`, `group-volume-db`, `clip-gain`, `clip-gain-fader`, `clip-gain-multi`, `clip-gain-pointer-preview`, `detail-panel`, `lane-strings-ui` (all `app/lib/arrangement/__tests__/<name>.test.tsx`) | all pass; drag-preview-render 67/67; SH 4/4 |
| A-MUTANT (scratch copy only, L59/L60) | (1) `memo` removed from MixFader; (2) the lane volume `onChange` inline again; (3) `memo` removed from ClipGain; (4) `storedClipGainsDb` array literal inline again; (5) `isPanCentred` dropped from the `renderPanReadout` deps (and `disabled={storedPan === 0}`); (6) the SH red proofs (§1.2.1) | (1)–(4) turn DP65 red; (5) turns at least one `track-pan` or `fader-click` test red; (6) SH1 and SH2 red. Files restored; `store/` `git status` is unchanged by the mutants |
| A-PERF | Production perf **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-346/perf-results/latest-interactions.json <A's result>` | rc 0; `complete`; `failures` []; 230 rows; 60/60 asserted pass; 0 NEW. Every DIFF in a `deterministic` components or commits row is **lower**, never higher. Expected about trim 14.75, move 15.317, fade 3.933 per move (B's sketch run). A different value is recorded and explained; only a higher value is a STOP. `durationMs` recorded |
| A-FADER-PERF | Production, alone: `npx playwright test -c playwright.perf.config.ts perf/studio-lab.perf.spec.ts`, then the same rowcmp script: `c-round-341/perf-results/latest.json` against A's `test-results/perf/latest.json` | rc 0; `complete`; `failures` []; 321 rows; 94/94 asserted pass; 0 NEW; no `fader.*` deterministic components, commits or restarts row **higher** than the oracle. On B's sketch every such row was equal (§0.3); a lower value is recorded, not a STOP |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` | 40/40 (report 34 + zoom-probe 6) |
| A-REVIEW | `code-reviewer` (7 files) | 0 Medium+ open; Architecture note passed to B |

### 2.2 C rows
Each row reports the **lane half** and the **ClipGain half** separately where both apply (D-29z1097).

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-346/claims-347.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all` and `git apply -R --check b-round-346/sketch/source.patch.txt` | 5 modified + 2 untracked (the hook and its test); the patch reverse-applies |
| READ | read the diff | Only the changes in §0.2; DOM attributes unchanged; `renderPanReadout` is not a stable handler; no JSDoc, `any`, `as` or `@ts-ignore` |
| UNIT | A-UNIT's files | all pass |
| MUTANT | C's own, on a scratch copy: (1) the lane pan double-click inline again → DP65 red; (2) `handleClipGainFaderChange` inline again → DP65 red; (3) the `useStableHandler` body returns `handler` directly → SH1 red | all three red |
| NAMES (browser, dev :5173) | `node b-round-346/names-probe-v2.mjs http://127.0.0.1:5173 c-round-347/names.json` after a browser warm-up (L38) | fade [4×4]; trim [15×4]; move [12, 12, 82, 12] (the crossing position may vary; non-crossing commits are 12); click [83, 0]. No `ArrangementMixFader` or `ArrangementDetailClipGain` in any fade, trim or non-crossing move commit. The crossing commit may hold Master's fader (D-29z1098) |
| FADER-LANE (browser, 1440×900 and 1280×720) | `/studio-lab` demo, Music lane | (a) The Volume drag readout follows mid-drag; the value commits on release with one undo entry. (b) Keyboard ArrowUp/Down and key-up commit the volume. (c) Double-click resets Volume to 0 dB. (d) A Pan drag follows; double-click centres it; the pan-reset button is enabled after a non-zero pan, disabled after reset, and focus returns to the Pan slider. (e) A blur during a pan drag cancels it (pan-release-recovery behaviour). C may trigger the blur by script mid-drag (`element.blur()` or a window blur), because a captured pointer makes Tab hard to reproduce. (f) The video lane Volume fader keeps its title and works (no clip needed) |
| FADER-CLIPGAIN (browser, both viewports) | select a clip, Clip details open | (a) A clip-gain fader drag previews and commits, for one clip and for a 2-clip selection. (b) Double-click resets to 0 dB. (c) Select clip A, then clip B, type a value, press Escape: the field shows **B's** value (latest-closure check). (d) Enter and blur commit a typed value. (e) The reset button works and keeps focus. (f) The fader is disabled when a reason applies (a video clip selected; import a local synthetic video as in round 346) and enabled again on an audio clip |
| VISUAL (browser, both viewports) | the lane Volume and Pan `input` `outerHTML` plus the readouts, and the detail clip-gain `input` plus its field, before (HEAD) and after | identical `outerHTML` at rest |
| PERF | production, alone; A-PERF's rows | as A-PERF |
| FADER-PERF | production, alone; A-FADER-PERF | as A-FADER-PERF |
| PERF-LIB | A-PERF-LIB | 40/40 |
| G347-AUTH | fresh anonymous context at both viewports | `/studio-lab` opens with the workspace and demo badge, `auth_user` is null; `/studio/<id>` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` refuses (401/400; 500 only when the mock on :5199 is down, and then it is listed under `blocked`) |
| DOCS | doc 232 | l.4 as in §1.3; one `### ეტაპი c6-ii` section; 7 `## `; no "C round 346 pending" |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** NAMES, FADER-LANE, FADER-CLIPGAIN, VISUAL, PERF, FADER-PERF and G347-AUTH all run here; none needs the backend.
**Ableton conformance:** not applicable (performance change; behaviour identical).

## 3. Neighbouring behaviour that could break
- **Stale handlers.** Every wrapped handler reads values at call time through the ref. The risky ones are the Escape restore (`displayedClipGainText`), the fader-enabled guard (`isClipGainFaderEnabled`), the reset after a selection change (`selectedClipGainIds`) and the pan reset. FADER-LANE (d) and FADER-CLIPGAIN (c) and (f) cover them.
- **Render-time callbacks.** `renderPanReadout` and `renderTrackVolumeReadout` run during render, so they must not go through `useStableHandler`. READ checks this.
- **The fader's own drag (SABA-B-5).** It is still driven by the draft store subscription. FADER-PERF guards it.
- **Master and GroupHeader.** These call sites now receive a memoised component but still pass inline props, so their behaviour is unchanged and they simply never skip. FADER-PERF covers the master and group rows.
- **Render-count tests.** `clip-gain-pointer-preview.test.tsx` pins exact ClipGain counts, and `fader-pointer-preview.test.tsx` pins MixFader ≥ 4. Both passed on the sketch.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside the values in §2.1.
- The patch does not apply, or a change is needed outside the 7 files (L22: STOP with the diff).
- Any asserted perf row fails, any deterministic component or commit row goes higher, or any NEW row appears, in either spec.
- A mutant stays green.
- **ClipGain half fails on its own** (one of its tests or FADER rows cannot be made green without touching another file): revert only the `ArrangementDetailPanel.tsx` hunks (`apply-source-clipgain.py`). Ship the lane half, the hook and DP65 **without** its two `ArrangementDetailClipGain` assertions (the positive control and the per-gesture `=== 0`), which go with the reverted hunks. Report the attempt with its log. The ClipGain half then becomes c6-iii. This is not a round failure.

## 5. Not in scope (recorded)
- **Conversions:** trim/move/fade rows → `assert` at ceil(value), with gross, fine and `flushSync`-release mutants (D-29z1092). The oracle is C's round-347 run. `performance-optimizer` suggested converting trim now at 17; this is kept for the conversions round, so all three families share one mutant set (D-29z1098).
- **PERF-CAND-MASTER-GROUP-FADER-PROPS,** PERF-CAND-CHROME-ICONS and PERF-CAND-VIDEO-TRIM-FADE-ROWS.
- **ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE:** root, with frontend-architect.
- **ARCH-R346-FADER-DRAG-OPTIONS-EFFECT** and ARCH-R346-DP-HARNESS-EXTRACT: signals only.
- **Deliberate doc placement:** `tech-lead` pointed the hook's "never call during render" contract at `docs/technical/`. In this 7-file round it lives only in doc 232 (`docs/implementation/`), so the round stays within its files. The next round that touches `docs/technical/` may move it. This is not a miss for the code-reviewer.
- **Root only:** `vitest.config.ts` (GATE304-M1), `playwright.perf.config.ts` (ROOT-REQ-PERF-TIMEOUT), commits and pushes.

## 6. Deliverables
- **A:** the 7 files; `a-round-347.md` with the A rows; logs in `a-round-347/`.
- **C:** `c-round-347.md`, `c-round-347.json` and `c-round-347/`.

## 7. Claims
Run `bash b-round-346/claims-347.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree; a scratch tree with a private Vite `cacheDir` shows K8 10.
- **Expected outputs:** `b-round-346/claims-347-planning-output.txt` (HEAD) and `b-round-346/claims-347-sketch-output.txt` (B's sketch: source only, no test or doc change).
- **K1:** gate 346 `published` `4895732`.
- **K2:** HEAD and the `git status` entry count.
- **K3:** `ArrangementMixFader.tsx`: the memo export, the inner `displayName`, and the plain forwardRef export count.
- **K4:** `ArrangementLane.tsx`:
  - the `useStableHandler(` count (sketch 10);
  - `renderPanReadout = useCallback(`;
  - the inline pan double-click, volume pointer-up and volume blur counts.
- **K5:** `ArrangementDetailPanel.tsx`:
  - the memo export and the inner `displayName`;
  - the `useStableHandler(` count (sketch 10);
  - the `storedClipGainsDb={storedClipGainsDb}` prop;
  - the inline array, field-change and reset-click counts.
- **K6:** the hook file, its export, the test file and the SH `it(` count.
- **K7:** test file: DP `it(` count, DP64, DP65, the tick loop and `waitFor(`.
- **K8:** protected files OK.
- **K9:** `regression-last` date.
- **K10:** `app/`, `perf/`, `e2e/` and `docs/` diff lines outside the 5 tracked files, and untracked files other than the hook.
- **K11:** doc 232 `## ` count, the c6-ii section, and "C round 346 pending".
- **K12:** budgets rows and asserted rows.
