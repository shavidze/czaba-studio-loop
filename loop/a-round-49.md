# A — Round 49 report: SRW-14 stage 2 (FB-13), D-29z14

Implementer: A (Claude Opus 5.5) · 2026-10-16 · task `current-task.md` (Round 49). No PASS is claimed here; behaviour verdicts belong to C.

## 1. Pre-flight gate and baseline

**Pre-flight gate**
- **Assumptions.** §0.1–§0.4 are implemented literally. The jsdom clip rect is 0, so in unit tests `anchorTime = clip.start + clientX/40`. Demo sources are 40 s once loaded. A group member that would start before 0 on an existing lane gets `'before-start'`; a member with no lane keeps `'out-of-range'`.
- **Smallest version.** About 40 source lines in 4 files, plus 1 new test file and the doc edits.
- **Files.** `grid.ts` (`resolveSnapStep`), `selection.ts` (3 spots), `ArrangementClip.tsx` (step, trim and range snap, group ghost rule), `ArrangementLane.tsx` (prop and `/30`), the new test, doc 044 (2 lines), doc 045 (new).
- **Success.** The new file is green and the red run matches §2.2; mutations (a)–(l) are killed; vitest shows 83 files with 0 failures; tsc, build and `npm run verify` exit 0.

**Reading.** Before the first edit I read `read-primitives.md`; the primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and GEORGIAN_DOCS; the templates `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`; and the `pre-flight` skill. I also read the Ableton text in `b-round-46/ableton-6.7-6.10-20261016.txt`, which doc 045 uses. The project hook also injected the primitive content on the first edits.

**Baseline before edits (§1.2), as output:**
- HEAD `05e1bc075456c35dde33c1eecbcfc2f676af9ef4`; `git status --short` empty.
- `sha256sum -c b-round-48-r49-tree-sha256.txt | grep -vc ': OK$'` → `0`.
- Snapshots: `grid.ts`, `selection.ts`, `ArrangementClip.tsx` and `ArrangementLane.tsx` are `same`. `SHA256SUMS.txt`: 5/5 OK, doc 044 included.
- Protected 4/4 OK; `node.exe` 35.
- Biome `./app` (the same tree, before edits): B's baseline is 8 errors / 218 warnings / 1 info. Mine after the edits is identical (§6).

## 2. Red run, mutations, green run

**New file:** `app/lib/arrangement/__tests__/grid-snap-edit.test.tsx`, with **22 `it`**:
- SE1–SE19;
- three extra cases: SE12b (the 0.25 s sub-case that mutation (g) needs), SE14b (Alt released mid-drag) and SE17b (the Snap-on half of SE17).

**Harness.** This is a copy, not an import, of the `grid-snap-ui` stubs and mount. Changes against the original harness:
- a 4-lane fixture (video, music, stems, sfx), so that a member's target lane exists for SE16/SE17;
- the mount waits until `sourceDurations.get('song')` is set, so trim can grow the end;
- 40 px/s, asserted in SE2 via `arrangement-zoom-readout`.

**Red run** (snapshot sources in scratch `a-round-49/scratch`, outside `store/`, plus the final test). File: `a-round-49/red-run-final.txt`. Result: **16 failed, 6 passed**.
- **Green, as §2.2 expects:** SE2, SE10, SE15, SE18.
- **Also green (guards that cannot be red before the change):**
  - **SE5:** the unsnapped request of 6.3 is clamped to the same 7.05 source start, with the same blocked text. The off-grid limit is the result with and without snap.
  - **SE14b:** without Alt the last move already snaps to 8 in the old code. It would catch Alt being latched for the whole gesture.
- **Red, as expected:** every other case. SE1 fails on the missing export (`resolveSnapStep is not a function`); the file still loads.
- **Earlier red runs, kept as files:**
  - `red-run.txt`: first test version, 15 red / 7 green. SE6 was green then, which led to the reviewer's should-fix (§5).
  - `red-run-2-before-se6-fix.txt`: same split.

**Mutations** (scratch copy, applied by `tools/mutate.cjs` with an exact single match; runner `tools/run-mutations.sh`; output `a-round-49/mutations.txt`; node.exe 35). Base is 22/22 green, and **every mutation was killed**:

| # | Mutation | Failed tests |
|---|---|---|
| (a) | trim ignores the step | SE3, SE4, SE6 |
| (b) | range ignores the step | SE7, SE8, SE9, SE13 |
| (c) | range anchor not snapped | SE7, SE8, SE9, SE13 |
| (d) | zero-width range kept | SE9 |
| (e) | click seek snapped | SE10 |
| (f) | `resolveSnapStep` ignores bypass | SE1, SE11, SE12, SE12b, SE13, SE14 |
| (g) | Alt-enable uses a fixed 1 s | SE1, **SE12b** (SE12 with division 1 cannot see it; the 0.25 sub-case does, as §2.2(g) asks) |
| (h) | move reads `snapSeconds` | SE11, SE12, SE12b, SE14 |
| (i) | Shift no longer wins over Alt-enable | SE15 |
| (j) | `'before-start'` folded into `'out-of-range'` | SE16, SE17, SE17b |
| (k) | ghosts still published for `before-start` | SE17, SE17b |
| (l) | overlay back to `/60` | SE19 |
| (o) A extra | lane does not pass `gridSeconds` to the clips | SE12, SE12b, SE13 |

The earlier mutation run is kept in `mutations-v1-before-se6-fix.txt`. The only difference: there, (a) killed SE3 and SE4 but not SE6.

**Green run:** `a-round-49/green-run.txt` → **22/22**.

Earlier green attempts:
- `green-run-1-se16-fixture.txt`: 21/22, with SE16 failing because of my fixture. The "missing lane" case used −7.3 s onto `sfx`. There m1 (music 7 → −0.3) is the first member, and it starts before 0 on the **existing** stems lane, so `'before-start'` is the correct answer under §0.4's check order.
- **Fix:** the fixture now uses −0.5 s. Only `st1` fails, and it has no lane *and* starts before 0, so the test also pins the per-member check order. The code was not changed.

## 3. Diff summary per file (`a-round-49/diff.txt`)

| File | Change | EOL |
|---|---|---|
| `app/lib/arrangement/grid.ts` | +11: `resolveSnapStep` inserted before `adjacentGridLine`; existing lines byte-identical | CRLF kept (74/74) |
| `app/lib/arrangement/selection.ts` | (1) the union gains `'before-start'`; Biome's line width makes the union multi-line; (2) the message entry, exact text; (3) the loop's `||` split: `trackId === undefined` → `'out-of-range'` first, then `start < -ARRANGEMENT_EPS` → `'before-start'` | LF kept (221/221) |
| `app/components/arrangement/ArrangementClip.tsx` | import; optional `gridSeconds?: number` prop with no default; `step = resolveSnapStep(snapSeconds, gridSeconds, event.altKey)` once per move, and `snapStep = timeLocked ? null : step` for move/group; group refusal `'before-start'`/`'out-of-range'` → `publishLaneGhosts(gesture, [])`, other refusals unchanged; trim: `requested = step === null ? roundTime(edge + delta) : snapTimeToGrid(edge + delta, step)`; range: both ends snapped then clamped, and zero width with a step → `setTimeRange(null)`. `finishGesture`, `beginGesture` and `DRAG_THRESHOLD_PX` are untouched; the diff has no hunk in them | CRLF kept (659/659) |
| `app/components/arrangement/ArrangementLane.tsx` | `gridSeconds={gridSeconds}` after `snapSeconds`; the overlay class `/60` → `/30` | CRLF kept (922/922) |
| `app/lib/arrangement/__tests__/grid-snap-edit.test.tsx` | new, 22 tests | LF |
| `docs/.../044-studio-lab-grid-snap-stage-1.md` | l.4 status, exact text; l.63 path → `tmp/claude-cloud-r47-quarantine/...`; nothing else (`diff --strip-trailing-cr` shows 2 hunks of 1 line each) | CRLF kept (106/106) |
| `docs/.../045-studio-lab-grid-snap-stage-2.md` | new: context, approach (the Alt table, trim off-grid stop, range zero width, unsnapped click, F1, refusal split, no lane-background range), Mermaid, files, problems, testing, the §4.8 Ableton table, TODO (stages 3–5, R49-T) | LF |

## 4. Browser smoke (one run, not a PASS claim)

- Script: `a-round-49/tools/smoke.cjs`; output: `a-round-49/smoke.txt`.
- Method: **REAL-mouse (PW)**, standalone Playwright with the installed chromium (pending deviation GSTACK-NO-MOUSE). I did not use the gstack daemon, did not start a server, and used the running `http://127.0.0.1:5173/studio-lab` (curl 200). node.exe 35.

**Steps and results:**
1. On the fresh load the timeline had no `Soft impact`. I added it with a REAL click on the library row and on `＋ დამატება`. It landed on the **music** lane at 0.000 (the active lane), not on SFX at 4–6 as in L49. This deviates from L49's layout, but the smoke only needs one audio clip.
2. Snap off, REAL-mouse header drag of +13 px → start **0.325** (off-grid); status `კლიპის გადატანა: start 00:00.325 …`.
3. REAL `g` → `data-snap="on"`, status `Snap ჩართულია — ბადე 1 წმ (G)`.
4. REAL-mouse drag of the right trim edge by −30 px (requested end 1.575) → `data-clip-start` **0.325, unchanged**; status `Trim — მარჯვენა კიდე: start 00:00.325, length 00:01.675 …`. The end is 0.325 + 1.675 = **2.000**, an integer second; width 67 px at 40 px/s. Undo shows `Undo: Trim — მარჯვენა კიდე`.

**Console.** Only the known `GET /api/cart` `ERR_CONNECTION_REFUSED` and the CartContext "Failed to load cart" (allowed list). The filter showed no hydration, React or `useLayoutEffect` warning; this is not REG-HYD, which C runs.

## 5. code-reviewer (actual subagent run)

The `code-reviewer` agent ran read-only on the diff. Its full output is in `a-round-49/code-review.md`. Verdict: **no blockers, score 9/10.** Findings and what I did with them:

- **Should-fix — SE6 passed with or without snapping** (−8 px also hit the 0.05 s minimum when free).
  - **Fixed in the test only:** SE6 now drags −5 px. With Snap off the end is 7.075, allowed, then undone. With Snap on (0.25) the end is 7.000, stopped at 0.05 s with the blocked text.
  - Final red: SE6 is now red. Mutation (a) now also kills SE6.
  - Everything was re-run after the fix: green, the mutations, the frozen suites inside verify, and the full run.
- **Nit — the refusal order depends on member order across members.** This is what §0.4 specifies ("order of checks otherwise unchanged"), and within one member the order is pinned by SE16. Recorded, no change.
- **Nit — `selection.ts` union now multi-line.** Biome's line width forces this; the LF-copy format check shows no change. No action.
- **Nit — SE14b also passes on the snapshot.** It is a guard against Alt being latched (§2). No action.
- **Nit — SE9 does not check that the range reappears after a zero-width move.** Each move recomputes the range from scratch, so the value is low. Not added; C's RG-ZERO covers the real browser.
- **Observation:** toggling Alt during a range drag re-snaps the anchor on the next move, so the start can jump. This is consistent with "the last move wins". → R49-T item 3 (snapping feel).

**Architecture note (for B; not acted on):**
- `ArrangementClip.tsx` `handlePointerMove` (l.343–502) has now changed in R47, in the R48 reconcile and in R49, and stage 4 (clip-edge snap) will reopen the trim-clamp region. The move branch already uses pure helpers (`moveStartOnGrid`, `groupDeltaOnGrid`), while trim and range snap inline.
- Reviewer's verdict: keep for this round. Low-cost proposal before stage 4: pure `trimEdgeOnGrid` / `rangeEndsOnGrid` helpers in `lib/arrangement`, with unit tests, leaving the gesture lifecycle untouched.
- The `gridSeconds`/`snapSeconds` prop plumbing belongs to the existing ARCH-CHECKPOINT-SRW14-PREFS; no new item.
- Alternative considered and rejected by the reviewer: Alt `keydown`/`keyup` listeners per gesture. They would add listeners and cleanup, and would raise the Chrome app-menu accelerator question on every gesture.

## 6. Command tails (verbatim, files in `a-round-49/`)

```
git rev-parse HEAD                      -> 05e1bc075456c35dde33c1eecbcfc2f676af9ef4
git status --short                      ->  M app/components/arrangement/ArrangementClip.tsx
                                            M app/components/arrangement/ArrangementLane.tsx
                                            M app/lib/arrangement/grid.ts
                                            M app/lib/arrangement/selection.ts
                                            M docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md
                                           ?? app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
                                           ?? docs/implementation/2026/quarter-IV/045-studio-lab-grid-snap-stage-2.md
frozen 399 not-OK count                 -> 0
protected                               -> download-routes.test.ts OK / account.downloads.tsx OK / api.studio-token.ts OK / studio.$productId.tsx OK
npx tsc --noEmit (tsc.txt)              -> tsc exit 0
frozen suites, 18 files (frozen-suites.txt; before the SE6 test fix) -> Test Files 18 passed (18) / Tests 357 passed (357)
npx vitest run (full-vitest-1-before-se6-fix.txt) -> Test Files 83 passed (83) / Tests 1418 passed (1418)
npm run build (build.txt)               -> ✓ built in 5.14s / build exit 0
npx biome check ./app (biome-app.txt, biome-app-errors.txt) -> Found 8 errors. Found 218 warnings. Found 1 info.
   errors, all `format`, the 8 baseline files: ArrangementClip.tsx, ArrangementLane.tsx, StudioWorkspace.tsx,
   bug-hunting/auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, grid.ts, auth.ts (CRLF-only; no new file listed)
npx biome lint <4 owned sources + new test> (biome-owned.txt) -> Checked 5 files. No fixes applied. lint exit 0
biome format on LF copies (biome-format-lf.txt) -> all 5 code files: "format no changes" (test re-checked after the SE6 fix: no changes)
npm run verify, final tree (verify.txt) -> Test Files 83 passed (83) / Tests 1418 passed (1418) / ✓ built in 20.63s / verify exit 0
tasklist | grep -ci node.exe            -> 35 (every run)
```

- The final tree's full vitest is the one inside `verify.txt` (83/1418). The first verify, before the SE6 test fix, is also exit 0: `verify-1-before-se6-fix.txt`.
- No test timed out in any run, and C-R48-01 did not reproduce.
- Doc 045 is markdown, which Biome does not check, so it has no diagnostics by construction.
- The `stderr` lines `useArrangement… must be used within an ArrangementProvider` in verify come from pre-existing tests that expect that throw. They are not failures.

## 7. Deviations

1. **Three additional `it` cases** (SE12b, SE14b, SE17b) in the one allowed new file. SE12b is the mandated 0.25 s sub-case of (g), written as its own `it`.
2. **Red run green set.** It is SE2, SE10, SE15, SE18 plus the guards SE5 and SE14b, explained in §2. With the final test, SE6 is red.
3. **Floating-point-derived values use `toBeCloseTo(…, 9)`:** SE4 (`sourceOffset`), SE5 (start, `sourceOffset`), SE6 (duration), SE10 (position) and SE17 (starts). Binary floating point (for example `0.6 + (7 − 7.3)`) is not exact. Grid-snapped ends (SE3, SE7, SE8, SE11, SE12) are asserted with `toBe`.
4. **The test harness waits for `sourceDurations`** (up to 10 microtask pairs) and asserts that the source is 40 s in SE2. Without that wait, trim could not grow the end.
5. **Smoke deviations.** `Soft impact` was on the music lane at 0, not on SFX at 4–6. Playwright REAL-mouse was used under pending deviation GSTACK-NO-MOUSE. I never touched the gstack daemon and wrote no browse state file (`a-browse.json` is not needed).
6. **Scratch.** `a-round-49/scratch` holds a full `app/` copy. The `node_modules` junction was created with `mklink /J` and removed with `cmd /c rmdir`; `store/node_modules` is intact.

## 8. Known gaps / not done by A

- No behaviour PASS is claimed. R49-TRIM, RANGE, ALT and GROUP, R49-S1 (the stage-1 re-check on the reconciled code), AU-1, REG-HYD and G49-3 are C's.
- The Alt + Chrome app-menu question cannot be checked with CDP → Tech Lead R49-T(2).
- No `preventDefault` on Alt was added (§0.6).
- F1 (absolute snap) is unchanged, as decided → R49-T(1).
- The trim limit can be off-grid by design until stage 4 (clip-edge snap).
- `npm run test:e2e:smoke` was not run; it is root-only.

## 9. Exact next C checks

1. **G49-2:** HEAD, the 7 paths, 399 OK, protected 4/4.
2. **R49-S:** `diff -u --strip-trailing-cr` against the snapshots, plus EOL counts (CRLF: grid, Clip, Lane, doc 044; LF: selection).
3. **R49-U:** re-run `grid-snap-edit` and the mutations (a)–(l) in your own scratch copy, plus C extras:
   - **(m):** `return bypass ? (gridSeconds ?? null) : null;` → `return null;` should kill SE1, SE12 and SE12b.
   - **(n):** snap-after-clamp in trim. Hint: snapping the *clamped* 7.05 in SE5 gives 7.0, which `trimClipStart` clamps back to 7.05. The final state may therefore be indistinguishable. Consider asserting the blocked status, or use a neighbour limit instead.
4. **R49-TRIM**, **R49-RANGE / ALT** and **R49-GROUP** with REAL-mouse (PW), on L49.
5. **R49-S1**, including UI-1 measured in the real browser, and the **AU-1** re-run.
6. **REG-HYD**, **G49-1** (re-run all gates yourself) and **G49-3**.
7. The Ableton two-verdict table (doc 045 §Ableton = task §4.8).

## 10. Scope completed / B acceptance

- **Implemented:** §0.1 (`resolveSnapStep`), §0.2 (`gridSeconds` prop, per-move Alt, trim snap, range snap, zero width, unsnapped click), §0.3 (lane prop, `/30`), §0.4 (selection's 3 spots, group ghost rule), §0.5 (doc 045, doc 044 at l.4 and l.63).
- **A-side §2.3 items actually passed:**
  - the new file is green;
  - the red run is explained;
  - mutations (a)–(l) are all killed;
  - the frozen suites are green;
  - full vitest is 83 / 1418 (1396 + 22), 0 failures;
  - tsc 0, build exit 0, `npm run verify` exit 0;
  - Biome `./app` is 8 / 218 / 1 with only the baseline CRLF format errors;
  - owned lint 0, LF-copy format clean;
  - code-reviewer run, and its should-fix resolved in the test.
- **Not claimed:** any §4 C acceptance ID.

## 11. Root and B follow-up (from `publication-checkpoint.json` → `round48Reconciliation.open`)

These are still open; this round did not touch them:
- C-R47-01, C-R48-01 (render-budget :547 cold flake; did not reproduce in A's runs at node.exe 35);
- "F1 jitter absolute snap decision" → R49-T(1);
- "bounded edit preferences review before stage 3" → ARCH-CHECKPOINT-SRW14-PREFS.

`root-pre-push-review.md` (2026-10-07) is an old round-12 review, and its doc-012 TODO note is not in this round's scope.

**Commit readiness (for root):** the 7 paths in §6 are stable, and A has finished editing.
