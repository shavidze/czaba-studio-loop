# Round 402: PERF-14b-ii — lane clip virtualization (PERF-14 stage 3 of 4), from B's reviewed sketch; plus RT-FIX-401 (C-R401-01)

**Planned by:** B, at the round 401 → 402 planning, 2026-11-08 (`b-round-401.md`). Advisor used before planning.

## Read first
- `lessons.md` in full. Most relevant: L4, L10, L11, L22, L23, L28, L29, L31, L37, L38, L49, L50, L57, L58, L59, L60.
- This file. Open `tasks/round-399.md` / `tasks/round-400.md` only to look up Rule R or R-b′ (they stay in force unless §1 changes them).
- Primitives: `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `.claude/prompts/new-test.md`, `.claude/prompts/studio-feature.md`.
- **Claims:** `bash b-round-401/claims-402.sh` from the loop root. Planning output: `b-round-401/claims-402-planning-output.txt`. A runs it before editing; C at the start of SOURCE-SCOPE (must equal the planning output) and at the end (only the §7 facts may differ).

## Baseline: HEAD `c17d0e9`, clean tree
- Gate 400 published `c17d0e9` on both remotes; gate 401 is `skipped` (C taskStatus FAIL on a Low planning-artifact finding; round 401 changed no source) [K1]. So the baseline stays `c17d0e9`.
- `git status --short --untracked-files=all` is empty at planning [K2].
- **Frozen:** `b-round-401/r402-frozen-sha256.txt`, **1,287** entries = every tracked file except the 7 tracked grants; `sha256sum -c` rc 0 from `store/` [K3]. Each of the 11 protected files of `b-round-318/protected-sha256.txt` is in it exactly once, and none is in the grants [K4].
- **Grants:** `b-round-401/grants-402.txt` (§4).

## 0. Why this round
- D-29z1375 set round 402 = PERF-14b-ii, unless REGRESSION-2026-11-10 is due. It is not: today is 2026-11-08 and `regression-last.json` says 2026-11-07 [K13]; the next REGRESSION is the first planning on or after 2026-11-10.
- Round 401's only finding is C-R401-01 (Low, origin B, a planning artifact): **fixed by B in this planning** (§1 D-29z1377); C re-checks only that line (RT-FIX-401).
- No Critical/High is open. The open Mediums are root-only, manual or `awaiting_user`, except TL-R398-SK-M1, which is a sketch input fixed in this round's patch (§1).
- **Product promise this stage serves (L55):** a long project stays smooth: the lane draws only the clips near the visible window, and nothing the user sees or undoes changes. Every model operation this round checks (select-all, Delete, group move, Undo) keeps working on clips that are not drawn. Export is model-based and not re-measured here; REGRESSION-2026-11-10 re-checks it in the browser after this stage.

## 1. Rulings (B)
### D-29z1377: round 401 and RT-FIX
- Round 401 rows all PASS except RT-LESSONS (C-R401-01, Low, origin B): `lessons.md` l.3 did not update its Sources pointer, although retro §10 and the task said so.
- B updated l.3 in this planning: `retro-385.md` (windows … 369–384) → `retro-401.md` (windows … 385–400). Only l.3 changed; 60 lines [K12]. Before-copy `b-round-401/lessons-before-402.md`, diff `b-round-401/lessons-diff.txt`.
- RETRO 401 is done once RT-FIX-401 passes. C's note on the C cost total (14.49 vs 14.47, glob difference) is recorded, not a finding.

### D-29z1378: the dispatched patch (L58: reviewed = dispatched)
- **Patch:** `b-round-401/sketch-402.patch.txt`, sha256 `28569ea2d35c479b…`, 6 file diffs; `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 6 files further.**
- **Lane (ArrangementLane.tsx):** the round-398 lane sketch (page window `[page-1, page+2]` through `useSyncExternalStore` on the timeline scroll; pins = clips under an active pointer press + lane-move sources; selected clips not pinned, Q-14B-PIN-SELECTED) plus the two review fixes:
  - **TL-R398-SK-M1 (Medium) — fixed:** each press keeps one entry per `pointerId` with its own `unpin`; window `pointerup`/`pointercancel` (capture) end it for that pointer, window `blur` ends it too (the same event `claimPointerGesture` aborts on [K15]), and `unpin` removes all three listeners. A second press with the same `pointerId` first ends the old entry.
  - **TL-R398-SK-L1 (Low) — fixed:** an unmount effect runs every live `unpin`.
- **Tests:** new `lane-virtualization.test.tsx` VZ1–VZ10 (VZ8 blur unpins; VZ9 unmount removes every listener the press added, capture flag compared; VZ10 a same-lane group member outside the window is not pinned and mounts at its preview start mid-gesture); `waveform-window-ui.test.tsx` WG2–WG5 gain `pinOutsideClips` (0 assertions removed).
- **Mutants on the sketch:** 11/11 red, pristine before and after rc 0 (`b-round-401/mutants/summary.txt`, runner `mutants/run.py`) [K9].
- **Review:** `tech-lead` pass 1 (3 Medium, 4 Low, all disposed) and delta pass 2: **"no new Medium+"** (`b-round-401/sketch-review.md`) [K16].

### D-29z1379: Q-14B-PIN-GROUP-MEMBERS and the harness check (f)
- **Ruling: same-lane group-move members are not pinned.** Pinning them would mount every selected clip on select-all + drag (defeats VZ7). Cross-lane members are already pinned as lane-move sources (`selectLaneMoveSourceKey` [K15]). The group preview is model-based, so a member that enters the window mid-gesture mounts at its preview position: VZ10 (jsdom) and B's browser probe (row 5) [K20].
- **Check (f)** in `measureGroupDrag` becomes three branches: copy mounted at t0 → the old check plus "mounted at t0 but not on the own-lane read"; copy outside the window at t0 → fail if it is mounted on the own-lane read (catches pinning if it comes back).
- A-R400-ARCH-READBESIDECLIP: `readBesideClip` stays in the spec (one caller family, test-only). The signal stays in `architecture_signals`, not scheduled.

### D-29z1380: spec Lows, budgets and the scroll ceiling
- **A-R400-REVIEW-SPEC-LOWS:** Low 1 and Low 2 fixed (the setup now does the Ctrl+click first, then **one** reveal that reads the copy's id and `ClipState` together; `CopyReveals` = the true scroll count, 3 per pass on the sketch); Low 4 fixed (`copyDelta` is null, not NaN, and check (c) fails explicitly on null). **Low 3 is kept (ruling):** re-enabling Follow while playing may legitimately scroll, so the 1 px restore check stays before it (`tech-lead` agrees). Low 3 stays in `deferred_low_polish` with this ruling.
- **`interact.zoom.30.out.path-rewrites`: `== 3` → `== 2`.** Under virtualization the clip that the anchored scroll on key 4 brings into the window mounts fresh at the new band (a mount, not an attribute rewrite). perKey `0,0,1,0,0,0,0,1,0,0` in every pass [K11]. No other interactions budget changes.
- **`budgets.scale.json`:** exactly 7 rows change (`mode`, `budget`, `note`; every HEAD note kept as the prefix): `scale.dom.page`, `.min-zoom`, `.min-zoom-mid` `<= 2000`; `scale.clips.model` `== 200`; `scale.zoom.components-per-key` and `.6x` `<= 60`; **`scale.scroll.components-per-step` `<= 140`** (TL-R398-SK-L3). The ceiling is a known, accepted cost and not a target: 116.5 on the sketch vs 57.75 at HEAD (a page crossing mounts the next page's clips once). Hysteresis stays the later candidate PERF-CAND-14-SCROLL-HYSTERESIS.
- **Measured on the dispatched patch (production build, alone, L38):** scale page 950 / 1532 / 1868, model 200, zoom 42.4 (1x and 6x), scroll 116.5, all asserts PASS [K10]; interactions rc 0, `complete` true, `failures` [] [K11]; resources and `studio-lab` specs [K22].
- **Loaded replicate (L37):** every flipped row is a whole-interval count or a DOM count after quiet; the 6x zoom rows equal 1x (42.4). The scroll row has no 6x pass in the spec; its min = max over 3 passes.

### D-29z1381: docs and stage count
- PERF-14 keeps 4 stages; this is stage 3 (14b-ii). **New doc 256** `docs/implementation/2026/quarter-IV/256-perf-lane-clip-virtualization.md` (256 is free [K6]): Georgian, technical terms in English, the 7 TEMPLATE headings in order (L26), l.4 byte-exact `**სტატუსი:** In Progress (stage 3 of 4; C round 402 PASS)` (L28). It holds: the window rule, the pin set and its end events, the D-29z1379 ruling, the VZ1–VZ10 table, the mutant table, the budget changes, and the note that WG2–WG5 rely on `pinOutsideClips` (TL-R401-SK-L3).
- **Docs 254 and 255 (L34, whole contract section):** doc 254's budgets section describes the 7 asserted rows and the ceiling; doc 255's R-b′ section describes the one-reveal setup and the three-branch (f). **l.4 of both stays byte-unchanged** [K6].

### Side effects (L49)
| Effect | Ruling |
|---|---|
| A clip outside the window is not in the DOM | Intended. Model operations do not need its DOM (Q-14B-PIN-SELECTED evidence; VZ7; select-all + Delete) |
| A pointer press on a clip pins it until pointerup/pointercancel/blur | Kept: `ArrangementClip`'s unmount effect cancels a gesture, so the pressed clip must not unmount mid-gesture (VZ5, VZ8) |
| `unpin` does not render | Kept: an unpinned clip leaves the DOM at the next lane render (scroll, zoom, edit) |
| Waveform rebuilds for clips that mount | Intended: a freshly mounted clip draws at the current band (the path-rewrites change) |

### Ruling lines (L4)
- "Apply the patch byte-for-byte" wins over any style preference of A's reviewer for those 6 files. A Medium+ in the patch **logic** is a STOP (L11), not an edit. A doc finding is fixed in the docs.

## 2. Reference
Not applicable: PERF round, no visible or behavioural change (policy "Reference first": performance rounds are out of scope). No screen-budget change: no persistent element is added. product-designer and YouTube steps: not applicable.

## 3. What A changes
1. Claims at start (A1).
2. `git apply --check` then `git apply ../tmp/studio-real-loop/b-round-401/sketch-402.patch.txt` from `store/`. Do not edit the 6 files after that.
3. Write doc 256; update the contract sections of docs 254 and 255 (§1 D-29z1381).
4. Run §5 checks; write `a-round-402.md` as you go (changed files, checks with rc and file paths, reviewer findings, For B).

## 4. Grants (`b-round-401/grants-402.txt`)
- `app/components/arrangement/ArrangementLane.tsx` (patch only)
- `app/lib/arrangement/__tests__/waveform-window-ui.test.tsx` (patch only)
- `app/lib/arrangement/__tests__/lane-virtualization.test.tsx` (new, patch only)
- `perf/budgets.interactions.json`, `perf/budgets.scale.json`, `perf/studio-lab-interactions.perf.spec.ts` (patch only)
- `docs/implementation/2026/quarter-IV/254-perf-scale-harness.md`, `255-perf-harness-model-count.md` (contract sections; l.4 unchanged)
- `docs/implementation/2026/quarter-IV/256-perf-lane-clip-virtualization.md` (new)

Anything else changing is a STOP. Protected files (auth, purchased Studio route, token API) are frozen.

## 5. A: checks
| # | Check | PASS when |
|---|---|---|
| A1 | Claims at start | Equal to the planning output |
| A2 | `npm run typecheck`; `npm run lint` | rc 0 both |
| A3 | `npx vitest run app/lib/arrangement/__tests__/lane-virtualization.test.tsx app/lib/arrangement/__tests__/drag-preview-render.test.tsx` plus the 5 files of `b-round-401/scroller-width-stub-tests.txt` [K8] | All pass. Record each file's duration; a test above 50 % of its timeout is reported (L31). B's full suite on the sketch: [K19] |
| A4 | `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (GATE304-M1) | 3 files, ≥ 54 tests pass |
| A5 | Scale spec, then interactions spec, each **alone** (L38): `npx playwright test --config playwright.perf.config.ts perf/<spec>.perf.spec.ts` | rc 0 both, `failures` [], `complete` true. Scale: the 7 asserted values equal [K10]. Interactions: every `deterministic` row equals `b-round-401/perf-sketch-interactions-final.json` (write a per-row compare file); path-rewrites [2,2,2] |
| A6 | Claims at end | Only the §7 facts differ |
| A7 | `code-reviewer` (≥ 3 files) on the applied diff and the docs | No open Medium+. A Medium+ in the patch logic is a STOP; doc findings are fixed. Any change after the review goes back to the reviewer |

## 6. C: rows
Write `c-round-402.md`, `c-round-402.json` and `c-round-402/progress.json` as you go (L59). **Run order:** browser rows 3–6, then perf rows 7–9 (each alone, L38), then the rest. The dev server is `http://127.0.0.1:5173`. For the probes, build the working tree in a scratch copy outside `store/` and serve it on its own port (B used 5189 with `npx remix-serve build/server/index.js`); stop it by PID, not by a pattern that matches your own shell.

| # | Row | Steps | PASS when |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | Claims; `git status --short --untracked-files=all`; both manifests | Claims equal the planning output except §7 facts; status = the 9 granted paths only (7 M, 2 ??); frozen rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | On a scratch copy, `git add -N` the new test file, then compare `git diff -- <the 6 patch files>` with `b-round-401/sketch-402.patch.txt`, ignoring `index` lines | Identical |
| 3 | **AUTH (browser)** | Fresh context, 1440×900 and 1280×720: `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization | Demo opens with `auth_user` null; "Sign in required" with 0 `audio[src]`; 401 `Please sign in to access Studio.`, no token. Fake-bearer → `blocked` (no backend) |
| 4 | **VIRT-FRAMES (browser)** | `node b-round-398/probe/frames200.cjs <base> <abs out.json> <vp>` on the working-tree build, both viewports | `frames.gapFrames` 0 with `frames.n` > 300; `afterScroll.page` ≤ 2000; `selectAll.mounted` ≤ 60 (B: 55 / 46); `heldMounted` 1; `afterNextPageMounted` 0; `modelAfter` 200; `pageErrors` []. The probe leaves select-all on, so its held press commits `Move (200)`: expected, not a finding. B's values [K21] |
| 5 | **PIN-BLUR-GROUP (browser)** | `node b-round-401/probe/pin-blur-group.cjs <base> <abs out.json> <vp>`, both viewports. Keep the PNG | A: `heldMounted` 1, `mountedAfterBlurWhileHeld` 0, `model` 30, `undoUnchanged` true. B: `memberMountedAtRestScroll0` 0, `memberMountedMidDragScroll0` 0, `memberMountedMidDrag` 1, `deltaMember` = `deltaPressed` (B: 2 / 2), `undoAfterRelease` "Undo: Move (30) (Ctrl+Z)", `memberAfterUndo` = `memberRest`; `pageErrors` []. B's values [K20] |
| 6 | **STUDIO-SMOKE (browser)** | Dev server, both viewports, after `Demo collection ready`: Enter adds a clip; drag it by its name bar 100 px; Ctrl+Z; Play ~1.5 s then Stop; open Export and close it | Clip appears and moves; Ctrl+Z restores its start; position advances then stops; dialog opens/closes; 0 page errors; screenshots |
| 7 | **SCALE** | Scale spec alone on the working tree | rc 0, `failures` [], `problems` [] (gap check clean); the 7 asserted rows PASS with the [K10] values |
| 8 | **INTERACT** | Interactions spec alone | rc 0, `complete` true, `failures` [], `problems` [] ×6; deterministic rows equal `b-round-401/perf-sketch-interactions-final.json` (per-row diff file); `interact.harness.drag-group-live` [1,1,1]; path-rewrites [2,2,2] |
| 9 | **RES + STUDIO-LAB** | Resources spec, then `studio-lab.perf.spec.ts`, each alone | rc 0 and `failures` [] each, as on B's sketch [K22] |
| 10 | **VZ + MUTANT** | The A3 vitest set; then on your own scratch copy apply MU-402-NO-BLUR-UNPIN from `b-round-401/mutants/run.py` and run `lane-virtualization.test.tsx` | All pass; the mutant turns VZ8 and VZ9 red |
| 11 | **BUDGET-SHAPE** | JSON diff of `perf/budgets.scale.json` and `budgets.interactions.json` against HEAD | Scale: same ids and order, exactly the 7 rows of D-29z1380 differ, only in `mode`/`budget`/`note`, each new note starts with the HEAD note minus ` record — not run on sketch (L58)`. Interactions: only `interact.zoom.30.out.path-rewrites` (`budget.value` 3 → 2, `note`) |
| 12 | **DOCS** | Read docs 254, 255, 256 | Georgian; 7 TEMPLATE headings in order; doc 256 l.4 byte-exact; docs 254/255 l.4 unchanged; contract sections match the live files (L34); every id and file cited exists; `grep -rln 'In Progress (stage' docs/implementation` = 6; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 |
| 13 | **RT-FIX-401** | `diff b-round-401/lessons-before-402.md lessons.md`; `retros/retro-401.md` §10 l.1 | Only l.3 differs; it names `retro-401.md` (windows … 385–400) and keeps the rest of the line; 60 lines; retro §10's pointer claim now matches the file |
| 14 | **SOURCE-SCOPE** (end) + **L57** | As row 1; claims; `python3 -I tools/l57-check.py c-round-402.json c-round-402/l57-check.txt` | As row 1; rc 0 |
| — | **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- **`browserVerified`:** true only if rows 3–6 ran at both viewports.
- **L57 fields:** `manifestPaths` (`b-round-401/r402-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`), `missingPaths`, `countMismatches`, `claimCheckMinutes`, `origin` per finding, `assertsSpecified` (VZ1–VZ10 and the 8 changed budget rows), `mutantsRecorded` and `mutantRedOnSketch` (`b-round-401/mutants/summary.txt`), `mutantRedOnTree` (row 10), `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-401/sketch-full-vitest.log`, `sketch-tsc.log`, `sketch-biome.log`), `chainHeadGateRunGreen` (gate 400 published `c17d0e9`), `affectedChecksNamed` (rows 7–10), `affectedChecksRunOnSketch` (`b-round-401/perf-sketch-scale-final.*`, `perf-sketch-interactions-final.*`, `perf-sketch-resources.*`, `perf-sketch-studio-lab.*`), `progressFile`, `stopSignal`.

**Verdict and routing:** every row PASS → PASS. A failing app behaviour row (4–6, 8) at Medium+ → fixed first (bug gate). A Low → `deferred_low_polish`. A claims or doc mismatch caused by B's spec → finding with `origin` B.

## 7. Claims that may change during the round
- **K2:** status 0 → 9 lines (the grants).
- **K5:** `applies-on-tree` yes → no (the patch is applied).
- **K6:** `doc256-free` 0 → 1; the two l.4 counts stay 1.
- **K7:** `in-progress-stage-docs` 5 → 6.
- **K8:** 5 → 6 is allowed (the new `lane-virtualization.test.tsx` stubs the scroller's `clientWidth`).
- **K3** stays: 1,287 entries, 0 failures. Everything else stays.

## 8. Order after this round (D-29z1375, unchanged)
1. REGRESSION-2026-11-10 at the first planning on or after 2026-11-10 (it carries every item done since 2026-11-08, including 14b-ii).
2. PERF-14c → SYS-R385-LEAF-ACTIONS-CONTEXT → PERF-15 → SYS-R2-FAKE-FIDELITY + SYS-R388 → SYS-CLOCK-DETERMINISM → SYS-R369 → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule).
3. Architecture checkpoint ARCH-CHECKPOINT-PREVIEW-AFTER-13C stays with root (deadline RETRO 416).

## 9. Out of scope (recorded, not dropped)
PERF-14c (peak pyramid, canvas tiles); scroll hysteresis (PERF-CAND-14-SCROLL-HYSTERESIS); moving `readBesideClip` to `perf/lib` (A-R400-ARCH-READBESIDECLIP); A-R400 spec Low 3 (ruled, deferred); protected files; the purchased route (SRW-21, deferred_user).
