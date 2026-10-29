# A — round 248: SABA-B-11b stage 2b (hidden grid lines pause Snap)

**STOP:** none. No covering test is above 50 % of its timeout. Code-reviewer findings are in §5.

## 1. Start state (task §0, §4.1)
- HEAD `da8c64192d3574adf349dd3a9626ad16ec94d858`. `git status --short --untracked-files=all` was empty.
- `sha256sum -c --quiet b-round-247-r248-tree-sha256.txt` (1,098 files) gave rc 0. The root list (4 files) and the grant start list (10 files) were all OK.
- Pre-flight checks on HEAD before applying anything:
  - `pxPerSecondRef` is assigned on every render (`StudioWorkspace.tsx` l.621–622).
  - `resolveAdaptiveGrid` writes `gridSecondsRef.current` before it returns (l.1483–1484). So `withSnapPausedNote` reads the new grid in the adaptive callers.

## 2. Changed files (exactly the 10 grants)
- Grants 1–9: applied `b-round-247/precheck-scratch.diff` with `git apply -p1`, with no edits on top.
  - Proof: each of the 9 app files is byte-identical (`cmp`) to a fresh HEAD archive with the same diff applied.
  - `git diff HEAD -- app` differs from the precheck file only in file order, because git sorts paths.
  - The full round diff is in `a-round-248/round-248.diff`.
  - Hunks: `StudioWorkspace.tsx` +94/−53, `ArrangementLane.tsx` +4/−2, `ArrangementTempoRow.tsx` +1/−1, `strings.ts` +3/−1, `grid-snap-ui.test.tsx` +122/−3, `grid-snap-position.test.tsx` +39, `grid-musical-ui.test.tsx` +1, `grid-musical.test.ts` +2/−2, `strings.test.ts` +7/−3.
- Grant 10: `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md`.
  - l.4 is exactly `**სტატუსი:** Completed (C round 248 PASS)`. This is a claim pending C; `c-round-248.json` stays the source of truth.
  - `## მიდგომა` gets one stage-2b paragraph: the D-29z420 rule, the rejected coarsening, why `grid.ts` is unchanged, and measured fact kept apart from inference.
  - `## შეცვლილი ფაილები` gets the stage-2b list.
  - `## პრობლემები და გადაწყვეტები` gets two Problem → Solution entries: "Snap still works" on hidden lines, and the Alt path that switched on a hidden grid.
  - `## ტესტირება` cites GS10, HS1–HS5, HP1–HP2, GU12, GM5, ST23, ST24 and the 10 runs. I grepped every id in the test files and found it.
  - In `## TODO`, the "ეტაპი 2b (შემდეგი რაუნდი)" block is replaced: stage 2b done, ABL-R-8 closes at PASS, ARCH-CHECKPOINT-TEMPO-GRID (D-29z423), and SABA-Q-11B-HIDDEN-SNAP added to the Saba questions.
  - The seven TEMPLATE headings are still in order (l.7, 22, 168, 190, 241, 327, 374).
  - The doc title (l.1) still says "ეტაპები 1 და 2a". It is outside the granted sections, so I left it; B can grant it later.
- **A second stale line I did not edit (for B):** doc 186 `## არქიტექტურა` l.186–188 says snap, Alt bypass, edges, markers and every gesture read `gridSeconds` "უცვლელად" (unchanged). After stage 2b they read `snapGridSeconds` / `activeSnapSeconds`, and Alt no longer enables a hidden grid. The section is not granted, so I left it.
- **Old-text grep:** `grep -rn "Snap still works" app e2e docs USER_GUIDE.md` returns:
  - 0 hits in `app/` and `e2e/`;
  - doc 110 l.39 and l.126 (a historical record of the old string; frozen);
  - doc 186 l.316 (my Problem entry quoting the old title, which is intended).
- **End-state check** (after all the work): `git status` is exactly `M` on the 10 grants. HEAD is still `da8c641`. The frozen 1,098 list and the root list give `sha256sum -c` rc 0.

## 3. Tests actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 |
| `npx biome check` on grants 1–9 | "Checked 9 files … No fixes applied" |
| `npm run lint` | rc 0. There are 205 warnings and 1 info repo-wide; none are in the 4 owned source files |
| Covering set `b-round-247/covering.txt` | **134 files, 2,073/2,073 passed**, rc 0, 217.95 s (`a-round-248/covering.log`, `covering.json`) |
| Timeout headroom (L11/L31) | Slowest is CP12b at 8.6 s against its 30 s describe timeout (29 %). render-budget Play→Pause→Play: 2.78 s / 15 s. Track-group tests: ≤ 3.96 s / 20 s. None is above 50 % |
| Full suite, `verify`, build, e2e smoke | not run (speed rule; gate rows) |

## 4. Mutants (scratch `/tmp/a248-mut`: `git archive` of HEAD + the 9 files, `node_modules` symlinked)
The scripts are copied to `a-round-248/mutants/` (backup paths renamed to `/tmp/a248-mut-*`). The logs are in `a-round-248/mutants/logs/`.

| Run | Red rows (A) | B §0.2 |
|---|---|---|
| FIX-CONTROL | none | none ✓ |
| MU-HEAD (4 source files from `da8c641`) | GM5 GS10 HP1 HP2 HS1 HS2 HS4 HS5 ST23 ST24 | same ✓ |
| MU-ACTIVE-IGNORES-LINES | GS10 HP1 HS5 | ✓ |
| MU-ALT-ENABLES-HIDDEN | HP2 HS2 HS3 | ✓ |
| MU-LANE-FORWARDS-DRAW-GRID | HS2 HS3 | ✓ |
| MU-SEEK-REF-IGNORES-LINES | HP1 HP2 | ✓ |
| MU-NUDGE-HIDDEN | HS4 | ✓ |
| MU-NO-NOTE | HS1 | ✓ |
| MU-TITLE-NOT-PAUSED | HS1 | ✓ |
| MU-PAUSED-ATTR | GS10 HS1 HS5 | ✓ |

Repo `git status` was identical before and after (`a-round-248/git-status-{before,after}-mutants.txt`).

## 5. Code-reviewer
The real `code-reviewer` subagent read `git diff HEAD` and `a-round-248/round-248.diff`. Score 8.5/10. It found 0 Critical, 0 High and 0 Medium issues.
- **Leak check:** none. Every snap prop and both ref paths use the derived values. Raw `gridSeconds` stays only for the drawn lines and `data-grid-seconds`.
- **Refs, closures and deps:** correct. All 6 callers write `gridSecondsRef` before `withSnapPausedNote` reads it.
- **Project rules:** OK (strict TS, semicolons, no comments, no CSS).

| Finding (Low) | Handling |
|---|---|
| A-R248-REVIEW-L1: HS3 is green at HEAD, so it does not prove the fix | Already known to B (task §0.2 "HS3 is green at HEAD"). It is a regression guard. No change |
| A-R248-REVIEW-L2: no jsdom row for the hidden grid on marker drag, loop brace drag, bars ruler / tempo row, library drop and clip trim | Not added. C-SCOPE-248 requires the app diff to equal `precheck-scratch.diff` hunk for hunk, so extra rows would break that row. **For B:** a follow-up test-only task, one short `it` per surface. C's browser rows cover the marker and loop parts this round |
| A-R248-REVIEW-L3: GU12 now checks only the visible-grid path | Intended (task §2.2). HS4 covers the hidden nudge |
| A-R248-REVIEW-L4: the ref-side visibility check is written 4 times; a small helper could remove that | Outside the exact diff. Architecture proposal for B (below) |
| A-R248-REVIEW-L5: doc l.4 "Completed (C round 248 PASS)" is premature | Required byte-exact by L28 / task §2.3. It is a claim pending C. No change |
| A-R248-REVIEW-L6: the reviewer could not find `a-round-248.md` | It did not exist yet when the review ran. It is this file (`tmp/studio-real-loop/a-round-248.md`, with logs in `a-round-248/mutants/logs/`). Same citation pattern as `a-round-242.md` in the doc |
| A-R248-REVIEW-L7 (for the planner): two status writes sit outside the 6 wrapped ones, so they carry no note: the tempo-seed effect (`snapOnStatus`, l.1588–1595) and `changeTempo` (`tempoStatusMessage`, l.1539–1562). Also, the grid menu Snap item has no paused mark | Matches task §1.4 (the seed and tempo texts are unchanged). The seed case belongs in C-STATUS-NEIGHBOURS-248. **For B:** a candidate for SABA-Q-11B-HIDDEN-SNAP (d) |

**Architecture note (verbatim gist, for B, not acted on):** "Signal #3 (the same region changed expensively again and again): `StudioWorkspace.tsx` l.585–600 (derivation), l.1425–1760 (the six callers), l.2068–2081 and l.2423–2436 (the ref paths), changed in rounds 241–248. Keep it now: it is one lifecycle, and extracting it mid-feature would re-wire 5 props and 2 ref paths with no change in behaviour. Proposal: a separate task that moves `gridDivisionId`, `gridSeconds`, `gridLinesShown`, `snapGridSeconds`, `activeSnapSeconds` and their ref mirror into one grid-derivation hook. Acceptance: the grid-snap, grid-snap-position and grid-musical suites pass unchanged." This feeds ARCH-CHECKPOINT-TEMPO-GRID (D-29z423).

## 6. Browser (Playwright, the existing `:5173` server, fresh context per case, 1440×900 and 1280×720)
- Script: a copy, `a-round-248/probe.cjs`, of `b-round-247/snap-hidden-probe-248-v2.cjs`. The original was not edited.
- Results: `a-round-248/probe.json` and `probe-atload.json`, screenshots in `a-round-248/shots/` (12). Every case had 0 page errors.
- No HEAD control server was run, so only the fix column is measured.
- `atLoad@1440` timed out on the Vite cold start in the first run, as it did for B. I re-ran it alone and it was clean: Snap off, adaptive 1 s, 40 px/s, `data-snap-paused="false"`.

| Case | 1440 | 1280 | Reading |
|---|---|---|---|
| minZoomAdaptive (0.5 px/s, adaptive 10 s, hidden): `G`, ruler click | 811.328 | 669.92 | free; equals B's fix column |
| same, Snap off + Alt | 973.08 | 803.48 | free; equals B |
| fixed01Hidden (0.1 at 40 px/s), Snap on, 3 clicks | 8.535, 10.196, 11.792 | 7.051, 8.423, 9.741 | all free (not multiples of 0.1) |
| same, Snap off: Alt click / plain click | 14.35 / 6.479 | 11.854 / 5.352 | free |
| fixed01Visible (0.1 at 60 px/s): Snap on click; Snap off + Alt click | 5.7; 9.6 | 4.7; 7.9 | snapped to 0.1 (Alt still enables a visible grid) |
| musical132Hidden (pulse, 1/32 at 40 px/s) | 8.535 | 7.051 | free (8.535 / 0.0625 = 136.56) |
| same at 100 px/s (visible) | 7.625 | 7.051 | 1440 snapped (122 × 0.0625). **1280 invalid**: it repeats the first value, the same harness problem B recorded (off-screen or double-click). C re-measures it |
| nudgeHidden (0.25, 20 px/s, ArrowRight ×2; 40 px/s, ArrowRight) | 0.000 → 0.100 → 0.200 → 0.250 | same | equals B and HS4 |

- The x positions in my fixed and musical cases differ from B's `scratch-probe.json`, so the times differ. I did not trace why. What the rule needs still holds: hidden gives free times, visible gives snapped times. Only minZoomAdaptive and the nudge can be compared value for value, and they are equal.
- Signals (both viewports), the same as task §0.3 / §1.3:
  - Snap title: `Snap on — paused: grid lines are hidden at this zoom. Zoom in. (G)`.
  - Select title: `Grid 0.1 s — lines are hidden at this zoom, so Snap is paused. Zoom in. · 1 — narrower, 2 — wider · Fixed at every zoom — 5 for adaptive`.
  - Status after `G`: `Snap on — grid 0.1 s (G) · Lines are hidden at this zoom, so Snap is paused — zoom in.`
  - Status after choosing 1/32: `Grid: 1/32 · 0.063 s at 120 BPM (Snap on) · Lines are hidden at this zoom, so Snap is paused — zoom in.`
  - Visible grid: `data-snap-paused="false"` and the old titles.
- Observed status behaviour (consistent with §1.4; C should note it):
  - In musical132Hidden, after zooming to 100 px/s (lines now visible), the status still shows the hidden note. Zoom writes no status (D-29z357).
  - In nudgeHidden, the status `Grid: 0.25 s (Snap on)` has no note, because 0.25 was chosen at 40 px/s (visible) before zooming out to 20 px/s.
- `a-browse.json` was not used: every case uses a fresh context with no stored state.

## 7. Known gaps (not run by A)
- Not run in the browser by A: C-KEYSTEP-248 (loop brace and marker ArrowRight), C-STATUS-BOX-248, C-SIGNALS-248's full key list (`4`, `5`, `1`/`2`, `3`, the grid menu width items), C-KEYS-248, C-BUDGET-248, LAB-SMOKE-248 export hash, the Auth row, the playhead-drag and clip-drag halves of C-HIDDEN-SNAP-248, the library drop with hidden lines, and the musical visible click at 1280.
- No HEAD control in the browser.
- Purchased origin: BLOCKED, backend unavailable in cloud.

## 8. Next C checks (exact)
1. C-SCOPE-248: HEAD `da8c641`, status `M` on exactly the 10 grants, the hash lists, the 7 protected files clean, and `git diff HEAD -- app` vs `precheck-scratch.diff` (per-file compare; the order differs).
2. The C-HIDDEN-SNAP-248 drag and playhead-drag halves, C-ALT-HIDDEN-248 with a HEAD control, and C-VISIBLE-KEEP-248 including the 1280 musical 100 px/s click with its own x and ≥ 800 ms spacing.
3. C-RESUME-248, C-NUDGE-248, C-KEYSTEP-248 (values unmeasured by A and B).
4. C-SIGNALS-248 across all 6 wrapped writes. C-STATUS-NEIGHBOURS-248: record the stale-note-after-zoom-in and the missing-note-after-zoom-out cases above.
5. C-STATUS-BOX-248 (1/32T note at 1280), C-BUDGET-248, C-KEYS-248, AN-REVIEW-248, LAB-SMOKE-248, Auth.

## 9. Scope completed
- I ran task §4 steps 1–8. B acceptance that A really verified:
  - C-UNIT-248: covering set green.
  - C-MUT-248: the 10 runs match.
  - Partial browser evidence for C-HIDDEN-SNAP-248 (ruler clicks), C-ALT-HIDDEN-248, C-VISIBLE-KEEP-248 (0.1 at 60, 1/32 at 100 at 1440), C-NUDGE-248 and C-SIGNALS-248 (G and the division choice).
- Every other row is for C. I am not claiming the feature or the backlog complete.
