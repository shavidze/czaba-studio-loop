# B round 298 → 299 planning

**Date:** 2026-10-31. **Decisions:** D-29z764 to D-29z768. **Next task:** `current-task.md`, round 299, STUDIO-LINK-a4 (a test-only Medium fix-up).

The round-298 task is archived as `tasks/round-298.md`. It was copied, not moved, and is `cmp`-equal to the original.

## 1. Evidence read
- **C round 298** (`c-round-298.json`, `c-round-298.md`): **PASS**.
  - 9 rows passed, 0 failed, 0 blocked. `browserVerified` and `realVerified` are true.
  - The browser rows were the cold deep link at both viewports and auth.
  - CLAIMS was not passed on K11 only: `b-round-297/sketch.patch` was dropped by the loop `.gitignore`. That is C-R298-02, origin B.
  - C confirmed **C-R298-01 (Medium)** with its own mutant (x): a server-only attribute passes LH3.
- **A round 298:** A copied the sketch byte for byte, with no STOP. Its reviewer reported REVIEW-1…7 and an Architecture note.
- **Gate 298** (`gates/gate-round-298.json`): **published** `ece19e3` on both remotes. `verify` ran 229 files and 3,416 tests. The review (`gates/round-298/review.md`) scored 8/10, COMMIT OK, with suggestions S1–S4 and the same Architecture note.
- **Baseline for round 299:** HEAD `ece19e3`, the gate's `commit` field, with a clean tree. Frozen list: `b-round-298-r299-tree-sha256.txt` (1,168 entries).
- **Other inputs:** there is no new Saba, root or user-review decision file. `root-pre-push-review.md` and `publication-checkpoint.json` hold old content.
- **Schedule:** regression is due on or after 2026-11-02, so not now. RETRO is at round 305.

## 2. Backlog updates (C and gate evidence only)
Scripts: `b-round-298/update-backlog.py`, then `fix-backlog-testonly.py` (see §3). The backlog version is now 257.
- **STUDIO-LINK-a3 → done** for its own rows (D-29z764). **GATE297-F1 is partly closed, not closed.**
- **Closed:**
  - GATE297-S2;
  - GATE297-S3, for completed hydrations;
  - INFO-C297-01;
  - A-R298-REVIEW-2, closed by C's mutant (y);
  - A-R298-REVIEW-3, closed by this round's fix and proven by mutant (v).
- **C-R298-02** is closed by method: the diff file is named `.patch.txt`.
- **New open findings:** C-R298-01 (Medium), GATE298-S1, GATE298-S3, A-R298-REVIEW-5 (in fix) and INFO-C298-01 (signal).
- **New deferred Lows:** A-R298-REVIEW-6 and GATE298-S4-UNUSED-STUB-RETURN.
- **New architecture signal:** A-R298-ARCH-HYDRATE-HARNESS. It is not scheduled.
- **`lessons.md`** stays at 59 lines. L52 gains the once-only-flag warning-filter clause, and L56 gains the `.patch.txt` clause (D-29z767). Nothing was merged or dropped.
- **Queue:** a new stage STUDIO-LINK-a4 (round 299). STUDIO-LINK-b moves to round 300.
- **`rounds`:** 298 becomes `c_pass_published`, and 299 is added.
- **`feature-status.md`:** round 298 is **მზადაა** for its own rows, with F1 partly closed. Round 299 is **მუშავდება**. The PD-REVIEW row is updated.
- **Backups:** `b-round-298/backlog-before-299.json`, `b-next-before-299.json`, `feature-status-before-299.md` and `lessons-before-299.md`.

## 3. Why round 299 is a test fix-up, and why it is test-only
C-R298-01 is Medium, and the 2026-10-23 bug gate fixes Medium findings before new scope. Its three related items are:
1. the regex;
2. the `muted` warning that uses up React's one-per-load flag (GATE297-S5);
3. unmount registered after `await act` (GATE298-S3).

Doc 220's overstatements are fixed in the same round.

**B's correction during planning.** Following both reviewers and the advisor, B first pre-ran `suppressHydrationWarning` on the two `<video>` in `ArrangementVideoDock.tsx`. Every mutant behaved as expected. B then checked the premise in the task text, "React does not write `muted` on the server", and found it false:
- `curl :5173/studio-lab` shows `muted=""` on both `<video>`.
- React compares `muted` as a property.
- jsdom leaves `.muted` false (`defaultMuted` is true), but Chromium sets it per the HTML spec. C round 298 saw 0 browser hydration warnings.

So the warning is a jsdom-only gap. B rejected the production change, because it would fix a test-environment gap in product code and hide real future `<video>` attribute mismatches. B replaced it with a test helper, `applyBrowserParsedMutedState` (`video.muted = video.defaultMuted` before hydration). The dock sketch and the old r/r2 scripts were deleted, and the backlog text was corrected (`fix-backlog-testonly.py`). This is recorded in D-29z766, and C re-checks the premise in the JSDOM-MUTED-PREMISE row.

**Sketch pre-run** (`/tmp/b299-scratch`, a `git archive` of `ece19e3`, own `cacheDir`):
- 7 files, 58 tests green; `tsc` rc 0; Biome clean.
- **Mutants:**

  | Mutant | Red rows |
  |---|---|
  | x (option attribute) | LH3, NG9 |
  | v (standby `<video>` attribute) | LH3, NG9 |
  | y (extra node) | LH3, NG9, NG9c |
  | h | LH3, NG9 |
  | r (no helper in LH3) | LH3 |
  | r2 (no helper in NG9) | NG9 |
  | e | LH1, LH3 |
  | g | LH4 |
  | identity order | LH3 |
  | i | none (green, as designed) |
- **Controls:** x and v on unmodified `ece19e3` give 20/20 green. This reproduces C-R298-01, shows that NG9 had the same gap, and shows that the dock was invisible before the fix.

**Browser rows:** C runs a dock regression row at both viewports (both `<video>` stay muted while a video plays), the deep link and auth.

## 4. Consults
- **Advisor:** available and consulted once, before writing. It recommended:
  - bundling the S5 fix and making LH3/NG9 zero-tolerance;
  - a mutant per emitter class and a "revert the fix" mutant;
  - checking NG9;
  - REVIEW-2/3 rulings, `.patch.txt`, two lessons, and the architecture checkpoint input;
  - running C's mutant x before writing.

  B followed this, except for the form of the S5 fix: the new primary-source evidence in §3 shows S5 is jsdom-only, so the fix is a test helper instead of a production attribute. B asks the advisor about this divergence in its final check.
- No project subagent was consulted. This is a test-only fix-up, and the STUDIO-LINK-b design inputs from round 297 (`b-round-297/product-designer-studio-link-b.md`) stay saved for round 300.

## 5. Order after 299 (D-29z768)
REGRESSION if round 300 is planned on or after 2026-11-02. Otherwise:
1. STUDIO-LINK-b (300)
2. NAME-AND-HINT
3. **Frontend-architect checkpoint request to root.** Inputs:
   - GATE296-ARCH-ROUTE-DOM-FOCUS;
   - library-menu vs marker-menu duplication;
   - A-R298-ARCH-HYDRATE-HARNESS together with ROOT-RECON-GRID-HARNESS.
4. PERF-3c and the rest of STUDIO-PERFORMANCE
5. STEM-LANES
6. SYS-1…3
7. STORE-2b…5
8. REVIEW-RECOMMENDATIONS
9. T12-ADVANCED
10. The phase-2 entries (skip rule)

SRW-21-PLAN stays parallel. RETRO is at round 305.

## 6. Ready for commit?
- **Round 298:** already published as `ece19e3`.
- **Round 299:** after C PASS and the gate, root publishes the 4 §4 paths: three test files and doc 220. No app source changes.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:** these all remain:
  - STUDIO-LINK-a4/b and NAME-AND-HINT;
  - STUDIO-PERFORMANCE, STEM-LANES and SYS-1…3;
  - STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - every deferred Low.

  SRW-21 is `deferred_user`.
- **Not BLOCKED:** nothing external is missing.

## 8. Housekeeping
- **Store tree untouched:** `git status` is empty, and the claims re-run after the last edit equals `claims-299-output.txt`.
- **Servers:** B ran no dev server and no browser. It made one `curl` of `:5173/studio-lab` to read the server HTML.
- **Scratch runs** used their own `cacheDir`: `/tmp/b299-vite-cache` and `/tmp/b299-control-cache`.
- **Artifacts in `b-round-298/`:**
  - claims: `claims-299.sh`, `-output.txt` and `-after-sketch.txt`;
  - sketches: the 4 sketch files and `sketch.patch.txt`;
  - run logs: `sketch-covering-run.log` and `sketch-tsc.log`;
  - mutants: `run-mutant.sh`, plus the scripts and logs for x, v, y, h, r, r2, e, g, i, vacuity and controls x/v;
  - `edit-doc220.py`;
  - the backups and both backlog scripts.
- **Advisor final check (after writing):** confirmed the test-only pivot. B applied its three fixes: B-DOCK-MUTED gained a `canPlayType` environment guard (step 1 alone decides the row); JSDOM-MUTED-PREMISE gained a Chromium `DOMParser` measurement; the `sketch.patch.txt` wording was corrected.
