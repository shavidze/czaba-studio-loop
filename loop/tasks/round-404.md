# Round 404: SYS-R385-LEAF-ACTIONS-CONTEXT stage 1 — a stable Arrangement actions context for the five action-bundle leaves (behaviour-preserving), from B's reviewed sketch

**Planned by:** B, at the round 403 → 404 planning, 2026-11-08 (`b-round-403.md`). Advisor used before planning and before hand-off.

## Read first
- `lessons.md` in full. Most relevant: L4, L11, L23, L26, L28, L29, L31, L38, L49, L56, L57, L58, L59, L60.
- This file. Open `tasks/round-403.md` only to look up the PERF-14c-i contract (unchanged here).
- Primitives:
  - `REACT_CONTEXT.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - `.claude/prompts/new-context.md` and `.claude/prompts/new-test.md`.
- **Claims:** `bash b-round-403/claims-404.sh`.
  - Planning output: `b-round-403/claims-404-planning-output.txt` (22 claims; stderr empty, `claims-404-stderr.txt`).
  - The same script on B's sketch-applied scratch: `b-round-403/claims-404-sketch-output.txt`. It differs only on K2, K5, K8, K9 and K10, the lines the patch is meant to change.

## Baseline: HEAD `cc5cbc6`, clean tree
- Gate 403 published `cc5cbc6` on both remotes [K1]. `git status --short --untracked-files=all` is empty [K2].
- **Frozen:** `b-round-403/r404-frozen-sha256.txt`, **1,290** entries: every tracked file except the 7 tracked grants. `sha256sum -c` gives rc 0 [K3].
  - All 11 protected files of `b-round-318/protected-sha256.txt` are in it, once each, and unchanged.
  - None of them is granted [K4].
- **Grants:** `b-round-403/grants-404.txt` (9 paths, §4).

## 0. Why this round
- **Round 403 (PERF-14c-i) passed and is published** [K17]: C PASS, `browserVerified`/`realVerified` true, 0 bugs.
- **REGRESSION-2026-11-10 is not due.** Today is 2026-11-08 and `regression-last.json` says 2026-11-07 [K19].
- **No Critical or High finding is open.** The 5 open Mediums are root-only, manual or `awaiting_user`, and none of them can be reproduced in the cloud browser.
- **PERF-14c-ii was measured first** (D-29z1389, `b-round-403/probe/medians.txt` [K20]).
  - At 6x, mutant A (512 columns), mutant B (fixed path) and mutant D (sticky set, 0 churn) each save at most one 8 ms Event Timing step.
  - The 1x plan target is already met.
  - So the pyramid and canvas tiles go to Saba (`user-review/questions-perf14c-pyramid-canvas.md`, `awaiting_user`). They are not dropped, and the loop continues under the skip rule.
- **The next item in D-29z1387 order is SYS-R385-LEAF-ACTIONS-CONTEXT.**
  - It is the L46 default ("B-actions") of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, which Saba has not answered (`user-review/questions-arch-leaf-plumbing.md`).
  - PERF-11c-iii-d/e stay held until it passes.
- **Product promise (L55):** the Studio behaves exactly as before. Every button, key and fader in the Transport, Master, Library, loop brace and marker row does what it did. What changes is that the actions those leaves receive become one stable object, which no data change can replace.

## 1. Rulings (B)
### D-29z1392: the dispatched patch (L58: reviewed = dispatched)
- **Patch:** `b-round-403/sketch-404.patch.txt`, sha256 `9c0cdbc99e9e0b1c…` (v2, after the `tech-lead` review; v1 `022c2184…` is kept as `sketch-404-v1.patch.txt`), 8 files; `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 8 files afterwards.**
- **`app/contexts/ArrangementContext.tsx`:**
  - **New type** `ArrangementActions = Pick<ArrangementContextValue, …34 keys…>`. The keys are the union of the five bundle hooks' fields, and each is a `value` field today [K7].
  - **New `ArrangementActionsContext`:**
    - its value is a `useMemo` over exactly those 34 callbacks, keyed on their identities;
    - it is provided directly around `ArrangementContext.Provider`, inside the existing provider nest.
  - **New `useArrangementActions()`**, with the same throw guard as `useArrangement`: `'useArrangementActions must be used within an ArrangementProvider'`.
  - `ArrangementActions` is exported as a type.
  - `useArrangement()` and the full `value` are unchanged.
  - The `tech-lead` consult found all 34 callbacks already identity-stable for the provider's lifetime (`b-round-403/consult-tech-lead-sys-r385.md`). The only provider mount passes a module constant [K12].
- **Bundle hooks:**
  - `useArrangementLoopBraceActions`, `useArrangementMasterActions`, `useArrangementTransportActions` and `useArrangementMarkerRowActions` now take their own narrow `Pick<>` type instead of `ArrangementContextValue`, and their parameter is renamed `workspace` → `actions` [K8].
  - `useArrangementLibraryActions` already took its narrow type.
- **Call sites:**
  - `StudioWorkspace.tsx`: the 5 call sites [K9] get `useArrangementActions()` (`workspaceActions`).
  - The four wrappers `ArrangementLoopBrace`, `ArrangementLibrary`, `ArrangementMaster` and `ArrangementTransport` also pass `useArrangementActions()`.
  - The wrappers keep `useArrangement()` for their data props, so render counts are unchanged.
- **New test `app/lib/arrangement/__tests__/actions-context.test.tsx`** (provider plus a probe; fake `AudioContext`, `OfflineAudioContext`, `AudioBuffer`):

  | Row | What it asserts |
  |---|---|
  | AC1 | One actions object (`toBe`) across a lane mute, a zoom step, a marker commit and an undo, while the context value object changes; each step is proven to take effect (`pxPerSecond` changes; marker count +1 after the commit and back after the undo) |
  | AC2 | The actions' `toggleMasterMute`, `commitArrangement`, `undo` and `togglePlayback` are the provider's own callbacks (`toBe`). These and `getArrangement` keep their identity across a lane mute and a zoom step |
  | AC3 | `getArrangement()` through the stable actions returns the latest `present` after a commit and after its undo |
  | AC4 | The fixture has a loop and one marker; after mount the test freezes `getArrangement().loop` and each marker, so an in-place write throws. Across a lane mute, a Master mute and a marker commit, `loop` keeps its identity and value, and the marker count goes 1 → 2 (GATE378-L2) |
  | AC5 | No source under `app/components/arrangement` or `app/contexts` (test folders excluded) uses `startTransition`, `useTransition` or `useDeferredValue`, after block comments and full-line `//` comments are stripped (GATE377-L1) [K11]. `entry.client.tsx` is outside the scanned roots on purpose: hydration uses `startTransition` |
  | AC6 | The named error is thrown outside the provider |

- **Evidence on the final sketch (L58):**
  - **Mutants:** 9/9 red, plus one control mutant (a commented API name) that stays green; the pristine run passes before and after (`b-round-403/mutants/summary.txt`, runner `mutants/run.py`) [K13].
  - **Full vitest:** 262 files / 3876 tests, rc 0. `tsc`, `lint` and Biome: rc 0 [K14].
  - **Interactions perf spec**, run alone on the v2 sketch's production build: rc 0, `complete`, 0 failures. **All 189 deterministic rows equal `c-round-402/perf-interactions.json`** (`b-round-403/interactions-compare.txt`; the v1 run is `*-v1.*`) [K15].
  - RB-LEAF1–6 plus RB-LEAF4b (7 rows [K22]) are in that full run, unchanged.
- **Review:** `tech-lead`, two passes (`b-round-403/sketch-review.md`, which names the dispatched sha) [K16]. Pass 1 on v1 found 3 Medium (test strength) and 2 Low; all are fixed in v2 or recorded. Pass 2, the delta on the final sha: **"no new Medium+; dispatch v2 as it is"**, plus 3 optional Lows, which are recorded as deferred.

### D-29z1393: what this stage closes and what stays open
- **Closes on C PASS:**
  - GATE379-L3-ACTIONS-STABILITY-NOTE (AC1 pins the memo over all 34 callbacks, AC2 the provider callbacks; jsdom only, as the backlog caveat says);
  - GATE378-L2-LOOP-IMMUTABILITY-PIN (AC4), within its stated scope only: the loop and marker objects present at mount, through track mute, Master mute and a marker commit. It does not cover loop objects created later, other edit paths (drag, trim, split, loop-brace step) or the `markers` array (`b-round-403/sketch-review.md` pass 2);
  - GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO (AC5).
- **Stays open for SYS-R385 stage 2:**
  - GATE371-L2-COMPARATOR-PER-KEY and GATE375-L2-COMPARATOR-UNSTABLE-PROP: per-key comparators.
  - A-R371-REVIEW-GH5-IDENTITY (the backlog id; `retros/retro-385.md` calls it A-R371-GH5-IDENTITY): key the GH5 count on `group.id`.
  - B-R374-MASTER-VACUOUS-NAME-COUNTS: `master-ui.test.tsx:639,676` and `fader-pointer-preview.test.tsx:221` count `'ArrangementMaster'`, which never mounts.
- **GATE375-L1-UNUSED-WRAPPERS stays open.** It would delete exported wrappers, and CLAUDE.md requires the owner's permission for any deletion. If it is still wanted, it goes to Saba with stage 2.
- **Not in scope:**
  - zustand data stores;
  - the other ~76 action fields (export, clip gain, pan, track volume);
  - VideoDock and Lane (PERF-11c-iii-d/e).

### D-29z1394: doc
- **New doc 258:** `docs/implementation/2026/quarter-IV/258-sys-arrangement-actions-context.md`. The number is free [K6].
- Georgian, with English technical terms. The 7 TEMPLATE headings appear in order (L26).
- l.4 is byte-exact: `**სტატუსი:** In Progress (stage 1 of 2; C round 404 PASS)` (L28).
- It contains:
  - the why: the ARCH-CHECKPOINT default, B-actions;
  - the rejected option A (ref delegation), because it hides instability and needs ~34 hand-typed wrappers;
  - the 34 keys;
  - the AC1–AC6 table;
  - the mutant table, the 10 mutant rows copied from `mutants/summary.txt` (9 red + 1 control);
  - the interactions equality result;
  - the Lows that stay open for stage 2.
- No other doc changes.

### Side effects (L49)
| Effect | Ruling |
|---|---|
| A second provider wraps `ArrangementContext.Provider` | Intended. Its value never changes on data changes (AC1), so it adds no renders (interactions 189/189 equal; RB-LEAF unchanged) |
| The bundle hooks no longer accept the whole workspace | Intended (narrow types). tsc rc 0 on the sketch; no other caller [K9] |
| The wrappers subscribe to two contexts | Accepted. The actions context never changes on data changes |
| A future dependency added to one of the 34 callbacks changes the actions object | Intended: AC1/AC2 turn red (MU-404-MASTER-MUTE-DEP) instead of hiding it |

### Ruling lines (L4)
- "Apply the patch byte-for-byte" wins over any style preference of A's reviewer for those 8 files.
- A Medium+ in the patch **logic** is a STOP (L11), not an edit. A doc finding is fixed in the doc.

### Review dispositions
- **Fixed in v2:**
  - TL-R403-SK-M1: AC1 effect checks.
  - TL-R403-SK-M2: frozen loop and markers, plus MU-404-LOOP-INPLACE.
  - TL-R403-SK-M3: a real-import mutant, AC5 comment stripping, and the control mutant.
  - TL-R403-SK-L2: the param rename.
- **Recorded as deferred Lows, not edited (reviewed = dispatched):**
  - TL-R403-SK-L1: 34 names kept in 3 places; exhaustive deps is only `warn`.
  - TL-R403-SK2-L1/L2/L3: a redundant `not.toBeNull`, the `markers` array not frozen, and the edges of the comment strip.
- An A reviewer finding on these items is not a STOP.

## 2. Reference
Not applicable. This is a refactor and test round with no visible or behavioural change, and the policy's reference-first rule excludes refactor and test-only rounds. No screen-budget change. The product-designer, Ableton and YouTube steps do not apply.

## 3. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-403/sketch-404.patch.txt`, then `git apply` the same file. Do not edit the 8 files after that.
3. Write doc 258 exactly as described in D-29z1394.
4. Run the §5 checks. Write `a-round-404.md` as you go: changed files, checks with rc and file paths, reviewer findings, and a For B section.

## 4. Grants (`b-round-403/grants-404.txt`)
- **Patch only:**
  - `app/contexts/ArrangementContext.tsx`;
  - `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementLibrary.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementMaster.tsx`, `ArrangementTransport.tsx`;
  - `app/lib/arrangement/__tests__/actions-context.test.tsx` (new).
- **New doc:** `docs/implementation/2026/quarter-IV/258-sys-arrangement-actions-context.md`.
- **Nothing else.** No protected, auth, route, config, package, perf or other doc file.
- At the end, `git status --short --untracked-files=all` shows exactly 7 ` M` lines and 2 `??` lines.

## 5. A's checks (speed rules: the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-403/claims-404.sh` at start | equals `claims-404-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 8 patch files | rc 0 each |
| A3 | `npx vitest run` on `app/lib/arrangement/__tests__/{actions-context,render-budget,selection-wrappers-render,library-preview,master-ui,fader-pointer-preview}.test.tsx` | all pass; report the slowest test against its timeout (L31: none above 50 %, otherwise STOP) |
| A4 | Claims at end | only K2 (9 status lines), K5 (`applies-on-tree no`), K6 (`doc258-free 1`, stage docs 7 → 8), K8, K9 and K10 differ from the planning output; K8–K10 equal `claims-404-sketch-output.txt` |
| A5 | `code-reviewer` (8+ files) | no Critical/High/Medium; a Medium+ in the patch logic is a STOP (L11); doc findings are fixed in doc 258 |

## 6. C's acceptance (`c-round-404.json` with the L57 fields; one result per row)
| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | claims equal the planning output except the A4 lines; status = the 9 granted paths; frozen 1,290 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | `git diff -- <the 7 tracked patch files>` concatenated with `git diff --no-index /dev/null app/lib/arrangement/__tests__/actions-context.test.tsx` (the new file is untracked after `git apply`) equals `sketch-404.patch.txt`, ignoring `index` lines; or, equivalently, apply the patch to a `git archive HEAD` scratch and `diff -r` its 8 files against the working tree (0 differences) |
| 3 | **AUTH** (browser, 1440×900 and 1280×720) | the demo `/studio-lab` opens with `auth_user` null; `/studio/<handle>` shows "Sign in required" with 0 `audio[src]`; a token request without auth gets 401 |
| 4 | **LEAF-ACTIONS** (browser, both viewports, working tree) | see the list below this table |
| 5 | **INTERACT** (alone, L38) | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on the working tree: rc 0, `complete` true, 0 failures; the 189 deterministic rows equal `b-round-403/perf-sketch-interactions.json` (per-row diff file) |
| 6 | **UNIT + MUTANT** | the A3 set passes. Mutants: copy the working tree to `/tmp/c404-scratch` (symlink `node_modules`), `git init && git add -A && git commit`, then run `S=/tmp/c404-scratch OUT=<loop>/c-round-404/mutants python3 -I b-round-403/mutants/run.py`. Never run it with the default `OUT`, which is B's evidence. Pass = 9/9 red, the control green, pristine rc 0 before and after, scratch status 0 lines |
| 7 | **DOCS** | doc 258: l.4 byte-exact, 7 TEMPLATE headings in order, mutant table equals `mutants/summary.txt`, AC table names AC1–AC6; no other doc changed |
| 8 | **SOURCE-SCOPE end + L57** | as row 1, at the end; claims at end equal claims at start; `tools/l57-check.py` OK |
| gate | full vitest, typecheck, build, Biome, verify | not run by C (gate rows) |

**Row 4, LEAF-ACTIONS.** Add a clip first, then check that each action reaches its leaf and works:
- Transport: Play, then Stop. The clock moves, then stops.
- Undo/Redo of a clip move: clip start goes 0 → 2.5 → 0 → 2.5.
- Split (round-266 contract, BS1/BS2): make a time selection with both edges inside one clip, then press Ctrl+E. The clip is cut at both edges, giving 3 pieces from 1. A selection that crosses only one edge gives 2.
- Loop toggle: the loop brace shows, then hides.
- Master Mute: `aria-pressed` goes true, then false.
- Master fader: focus the Master Volume fader and press and release ArrowUp. A keyboard step commits one entry on key-up (master-ui "keyboard steps commit one Master Volume entry per key-up"). The readout changes, and Ctrl+Z after the key-up restores it.
- Marker row: add a marker and seek to it. The playhead or clock lands on the marker time.
- Library: select a sound and add it with Enter. The lane clip count from `data-clip-count` goes up by 1. Start the library preview, then stop it.
- Pass also needs 0 page errors and a screenshot for each step.

**Neighbouring behaviour that could break:** every Transport, Master, Library, loop-brace and marker-row action (row 4), and render counts (row 5, and RB-LEAF in row 6).

## 7. For C: the mutants
| Mutant | Site | Expected red |
|---|---|---|
| MU-404-ACTIONS-DEP-HISTORY | `history` in the actions memo deps | AC1 |
| MU-404-ACTIONS-NO-MEMO | `Math.random()` in the deps | AC1 |
| MU-404-MASTER-MUTE-DEP | `history` in the `toggleMasterMute` deps | AC2 (AC1 too) |
| MU-404-ACTIONS-WRAPPER | `undo: () => undo()` in the actions object | AC2 |
| MU-404-GETARRANGEMENT-STALE | `getArrangement` reads `history.present` | AC3 |
| MU-404-LOOP-SPREAD | `setTrackMix` spreads `loop` | AC4 |
| MU-404-LOOP-INPLACE | `setTrackMix` writes `loop.enabled` in place (throws on the frozen loop) | AC4 |
| MU-404-TRANSITION | a real `import { useDeferredValue } from 'react'` plus a call in `ArrangementLoopBrace` | AC5 |
| MU-404-TRANSITION-COMMENTED (control) | a full-line `//` comment naming `useDeferredValue` | none (stays green) |
| MU-404-NO-THROW | the guard warns instead of throwing | AC6 |

**Equivalent mutant (recorded, not a row):** reverting one wrapper to `useArrangement…Actions(workspace)`. The callbacks are identical, so nothing observable changes, and the narrow types accept the full value.
