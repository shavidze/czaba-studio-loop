# A round 402 — PERF-14b-ii lane clip virtualization (PERF-14 stage 3 of 4)

**Implementer:** A (Claude Opus 5.5), 2026-11-08. Baseline HEAD `c17d0e9`.
- No commit, push, deploy or installs.
- Dev server :5173 untouched. It was still listening (pid 3038) after the runs. The perf specs used their own config port 5188, which is not listening after the runs.
- The perf config's webServer ran `npm run build` twice (scale and interactions), and both builds succeeded. This is incidental evidence that the tree builds; it is not the gate build.
- Cited paths checked: `b-round-398/probe/frames200.cjs` and doc `223-perf-waveform-window.md` exist.
- The step-by-step checkpoint log is in `a-round-402/checkpoint-log.md`.

## Scope completed
1. **A1 claims at start:** rc 0, byte-identical to `b-round-401/claims-402-planning-output.txt` (`a-round-402/claims-start.txt`).
2. **Patch applied:** `git apply --check` was clean, then `git apply b-round-401/sketch-402.patch.txt` (sha256 `28569ea2d35c479b…`). The 6 patch files were not edited afterwards.
   - Identity: the diff of the 6 files against the patch, ignoring `index` lines, is empty (`a-round-402/patch-identity.txt`).
   - To build this diff I briefly ran `git add -N` on the 2 new files, then `git reset -- <those 2 paths>`. The index is back to unstaged.
3. **Docs:** doc 256 is new; the contract sections of docs 254 and 255 are updated (D-29z1381).
4. **Checks:** A2–A7 are below.

## Changed files (the 9 grants exactly: 7 M, 2 ??)
- M `app/components/arrangement/ArrangementLane.tsx` (patch)
- M `app/lib/arrangement/__tests__/waveform-window-ui.test.tsx` (patch)
- ?? `app/lib/arrangement/__tests__/lane-virtualization.test.tsx` (patch, new)
- M `perf/budgets.interactions.json`, M `perf/budgets.scale.json`, M `perf/studio-lab-interactions.perf.spec.ts` (patch)
- M `docs/implementation/2026/quarter-IV/254-perf-scale-harness.md` (l.4 unchanged):
  - new subsection "Budget-ები (PERF-14b-ii, round 402, D-29z1380)": the 7 asserted rows, the scroll ceiling, the premise, and the run1/run2 vs final note;
  - the file-list line now notes "7 assert from round 402".
- M `docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md`, R-b′ section (l.4 unchanged):
  - the setup rows are merged into one reveal (Ctrl+D → Ctrl+click → one reveal that reads the id and `ClipState`);
  - the `ownCopy` row describes the three-branch (f);
  - `CopyReveals` is the true number of reveals (3);
  - `copyDelta` is null, not NaN;
  - the Low 3 ruling.
- ?? `docs/implementation/2026/quarter-IV/256-perf-lane-clip-virtualization.md`:
  - Georgian, with the 7 TEMPLATE headings in order;
  - l.4 byte-exact: `**სტატუსი:** In Progress (stage 3 of 4; C round 402 PASS)`;
  - contents: the window rule, the pins and their end events, the D-29z1379 ruling, the VZ1–VZ10 table, the mutant table, the budget changes, and the WG2–WG5 `pinOutsideClips` note (TL-R401-SK-L3).

## Checks (actually run)
| # | Result | Evidence |
|---|---|---|
| A1 | PASS: equal to the planning output | `a-round-402/claims-start.txt` |
| A2 | PASS: `npm run typecheck` rc 0; `npm run lint` rc 0. Biome on the 3 owned app paths rc 0. `perf/**` and the JSON files are outside the biome.json `includes` (`app/**`) | `a-round-402/typecheck.log`, `lint.log`, `biome-owned.log` |
| A3 | PASS: 7 files, 189/189 tests, rc 0. Per-file test time: lane-virtualization 2501 ms, drag-preview-render 10996, fader-guards 10073, tempo-window-ui 3581, navigation-strings-ui 2901, overview-visibility-ui 1953, waveform-window-ui 1249. The slowest single test is NS5 at 1538 ms; no test is above 50 % of its timeout | `a-round-402/vitest-a3.clean.log` |
| A4 | PASS: perf-lib config, 3 files, 54 tests, rc 0 | `a-round-402/vitest-a4.clean.log` |
| A5 scale (alone) | PASS: rc 0, `complete` true, `failures` [], `problems` [] in all passes. The 7 asserts all PASS and equal [K10]: page 950 / 1532 / 1868, model 200, zoom components 42.4 (1x and 6x), scroll 116.5 (budget <= 140) | `a-round-402/perf-scale.json`, `perf-scale.log` |
| A5 interactions (alone, after scale) | PASS: rc 0 (9.0 min), `complete` true, `failures` [], `problems` [] ×6. **All 189 deterministic rows equal** `b-round-401/perf-sketch-interactions-final.json` (min, median, max and samples). path-rewrites [2,2,2]; drag-group-live [1,1,1], 6x too | `a-round-402/perf-interactions.json`, `interactions-compare.txt` (script `a-round-402/tools/compare_interactions.py`) |
| A6 | PASS: only the §7 facts differ (K2 0→9, K5 yes→no, K6 doc256-free 0→1, K7 5→6, K8 5→6). Frozen manifest `sha256sum -c` rc 0; protected manifest rc 0; `In Progress (stage` = 6; `C round N pending` = 0 | `a-round-402/claims-end.txt`, `claims-diff.txt`, `frozen-check.txt`, `protected-check.txt` |
| A7 | PASS: two real `code-reviewer` runs, pass 1 on the full diff and pass 2 a delta on the docs plus the F1 disposition. **No open Medium+** | below |

A did not run the full vitest suite, build or verify (speed rules); they are root-gate rows.

## Reviewer findings and dispositions
| Id | Sev | Finding | Disposition |
|---|---|---|---|
| A-R402-REVIEW-F1 | Medium → **Low** (pass 2) | Spec (f) branches 2/3 assume the same page window at t0 and at the own-lane read; Follow or edge auto-scroll could flip it | Rebutted with code (details below the table). Pass 2 reviewer: "not a STOP". **Residual: Low, origin B patch, For B** |
| A-R402-REVIEW-F2 | Low | The `scale.clips.model` JSON note cites the MU-399-NO-FILTER mutant, which cannot affect a model count; the doc premise also overreached | Doc side fixed: the 254 premise is limited to the page and components rows. The JSON note is in the patch and was not edited: **For B** |
| A-R402-REVIEW-F3 | Low | Ref read during render (`gesturePinsRef.current`) and a non-lazy `useRef(new Map())` | Patch code, recorded only: For B. The sketch review already kept the lazy-init nit |
| A-R402-REVIEW-F4 | Low (B to rate) | A keyboard-focused clip that scrolls out of the window unmounts, and focus falls to `<body>` | Shortcuts keep working because they are on `window` (`StudioWorkspace.tsx:3116`). But the project has a "focus never falls to body" precedent (OV-T6 / GATE232-S1 in `overview-visibility-ui.test.tsx`). **B should rate severity against that precedent.** One option: pin the clip that holds `document.activeElement`. Not reproduced in a browser by A |
| A-R402-REVIEW-F5 | Low | No VZ covers a `pointercancel` unpin, a `pointerup` from another pointerId keeping the pin, or a same-id re-press replacing it | For B: candidate VZ11 |
| F6 | nit | Doc 254 said "ზემოთ" for a later section | Fixed ("ქვემოთ") |
| F7 | nit | Evidence names: run1/run2 vs final | Fixed: one sentence each in 254 and 256 (source `b-round-401/sketch-review.md:27`) |
| F8 | nit | `scale.dom.page.min-zoom-mid` 1868 is about 7 % under the 2000 budget | For B: likely the first row to trip as the UI grows |
| F9 | nit | The doc 256 setup omitted Ctrl+D | Fixed |
| F10 | nit | "Number of scrolls" for `CopyReveals` | Fixed in 255 and 256: "reveals; each = one scroll + one restore" |

**F1 evidence and residual:**
- The Follow subscription returns early on `isPointerGestureActive()` (`StudioWorkspace.tsx:2464-2471`).
- The flag is `gestureCountRef > 0` (`ArrangementContext.tsx:2384`). It is raised by `claimPointerGesture` (2313/2333), which `ArrangementClip.tsx:499` calls.
- There is no drag edge auto-scroll in `app/`.
- Residual: `copyMountedBefore` is read at spec l.1166, before `mouse.down`. In the playing branch, Follow can still move the page in those few ms. Every such flip fails the check, so there is no false pass, but branch 3's message would name the wrong cause.
- Candidate fix: record the page key at t0 and at the own-lane read. Run branches 2/3 only when the two are equal; otherwise report a harness problem.

**Architecture note** (reviewer; a proposal for B/root, not done):
- Observation: the per-press window listeners in `ArrangementLane.tsx` (≈331–359, plus the unmount effect ≈482) sit next to the `panBlurSuppressionCleanupRef` pattern. They listen for the same end-of-press events that `claimPointerGesture` already handles. The page-window check is also computed in both the lane and `ArrangementClip`.
- Keep it for this round.
- Candidate bounded task: move pin tracking into `claimPointerGesture`, or into a small `usePointerPressPins` under `app/lib/arrangement/`. Acceptance: VZ5/VZ8/VZ9 unchanged and the `useArrangement()` shape unchanged.

## B acceptance passed by A
A1–A7, as above. No C row is self-claimed, and the backlog is not marked complete.

## Known gaps
- A ran no browser checks. The browser rows 3–6 (AUTH, VIRT-FRAMES, PIN-BLUR-GROUP, STUDIO-SMOKE) and the resources/studio-lab perf specs (row 9) belong to C.
- A did not re-run the mutants on the tree (C row 10).
- F4 (focus falls to body) was found by reading the code; it has not been measured in a browser.

## Exact next C checks
Run rows 1–14 of `current-task.md` §6 as written, in the stated order (browser 3–6, then perf 7–9 each alone, then the rest). In addition:
- Row 1: status must be the 9 paths (7 M, 2 ??), with the index unstaged.
- Row 8: you may reuse `a-round-402/tools/compare_interactions.py <yours.json> b-round-401/perf-sketch-interactions-final.json <out>`. It compares min, median, max and samples of every deterministic row.
- Verify the F1 disposition from its citations: `StudioWorkspace.tsx:2464-2471` (early return on `isPointerGestureActive()`) and `ArrangementClip.tsx:499`.
- Optional browser probe for F4: focus a clip by keyboard, scroll the timeline two pages, then read `document.activeElement`. Report only; B rates it.

## For B
- Findings: the F1 residual (gate the spec on the page key), the F2 JSON note, F3, F4 (rate against OV-T6/GATE232-S1), F5 (VZ11) and the F8 headroom.
- The architecture note above (pin tracking next to `claimPointerGesture`).
