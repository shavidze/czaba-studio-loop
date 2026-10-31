# B round 296 → 297 planning

**Date:** 2026-10-31. **Decisions:** D-29z752 to D-29z757. **Next task:** `current-task.md`, round 297, STUDIO-LINK-a2 (test-only Medium fix-up).

The round-296 task is archived as `tasks/round-296.md` (copied, not moved; `cmp` equal).

## 1. Evidence read
- **C round 296** (`c-round-296.json`, `c-round-296.md`): **PASS**.
  - 15 rows passed, 1 failed, 0 blocked. `browserVerified` and `realVerified` are both true.
  - B-SCREEN-BUDGET failed only on B's own ≤ 32 px threshold (C-R296-01, origin B).
  - The browser rows covered link, keyboard, landing, Enter, Undo/Redo, real audio (analyser RMS), the WAV export journey, negative and narrow cases, and auth, at both viewports.
- **A round 296** (`a-round-296.md`): implemented the sketch byte for byte, with no STOP. Code-reviewer 8/10.
  - Open: two Medium findings (REVIEW-1 and REVIEW-2) and Lows 5 and 6.
  - Mutant (e) confirmed REVIEW-2.
- **Gate 296** (`gates/gate-round-296.json`): **published**, commit `bc9d9a7` on both remotes. `review.md` is 9/10, COMMIT OK, with suggestions S1–S5 and an Architecture note.
- **Baseline for round 297:** HEAD `bc9d9a7`, clean tree. Frozen list `b-round-296-r297-tree-sha256.txt` (1166).
- `root-pre-push-review.md` and `publication-checkpoint.json` hold only old content (2026-10-07 and earlier checkpoints). No new findings.
- `user-review/` has no new decision file.
- **Regression:** the last one was 2026-10-30 (round 258), so the next is due on or after 2026-11-02. It is **not** due now; `regression-last.json` is untouched.
- **RETRO:** round 305.

## 2. Backlog updates (C and gate evidence only; script `b-round-296/update-backlog.py`)
- **STUDIO-LINK-a → done** (D-29z752). The parent STUDIO-LINK is in progress.
- **Round 297 = STUDIO-LINK-a2** (D-29z753). It closes A-R296-REVIEW-1 and -2 (Medium) and -5 (Low), all recorded in `open_findings` as "in fix". STUDIO-LINK-b moves to round 298.
- **Rulings** (D-29z754):
  - **C-R296-01:** closed as B's arithmetic (the budget = the measured line box, C's own option).
  - **C-R296-02:** `deferred_low_polish`, plus question 4 of SABA-Q-STUDIO-LINK. B's probe `b-round-296/probe/fv.cjs` (Chromium 143): `focus({focusVisible:true})` is unsupported, and native `:focus-visible` is false after a pointer interaction. A fix would be a second focus style, which collides with SABA-B-4.
  - **A-R296-REVIEW-6:** deferred Low.
  - **Gate S1** (phone link) and **S2** (prefetch): deferred Lows.
  - **S3** becomes a STUDIO-LINK-DYNAMIC prerequisite. **S4** becomes a STUDIO-LINK-b decision row.
  - **S5**, the Architecture note and A-R296-ARCH-DEEPLINK-HOOK become signal GATE296-ARCH-ROUTE-DOM-FOCUS ("keep"; not scheduled).
- `rounds`: 296 → `c_pass_published`; the 297 entry is added. `current_task` is updated.
- **Backups:**
  - `b-round-296/backlog-before-297.json`
  - `b-next-before-297.json`
  - `feature-status-before-297.md`
  - `lessons-before-297.md`

  `lessons.md` is unchanged (59 lines). No new lesson: the gaps are already covered by L52 (vacuity) and L23.
- `feature-status.md`: round 296 is **მზადაა**, round 297 is **მუშავდება**, and the PD-REVIEW row is updated.

## 3. Round 297 in one paragraph
**Test-only.** A copies B's pre-run test file `studio-link-hydrate-ui.test.tsx` (LH1–LH4) byte for byte and edits doc 220's status, testing, files and TODO lines. That is 2 grants and no app source.
- The file mocks the demo collection **reversed**, so `demo-middle-east` is not first. That makes the route's `initialSelectedSourceId` wiring observable.
- It drives every row through `renderToString` → `hydrateRoot`, the real cold-load path.

**B's scratch run** (`/tmp/b297-scratch`, `git archive` of `bc9d9a7`):
- 4/4 green;
- the covering set is 6 files and 58 tests;
- `tsc` rc 0, and Biome is clean;
- mutant (e) (the prop removed) turns LH1 and LH3 red;
- mutant (g) (the settle ref never set) turns LH4 red;
- mutant (f) (the `!isWide` guard removed) stays green. It is an **equivalent mutant**: a hydrated narrow route unmounts the workspace before the effect can query the option. It is recorded, not a gap;
- the vacuity control (identity order) turns LH1 and LH2 red (`vacuity-identity-order.log`).

C runs claims, scope, typecheck, unit, mutants and the vacuity control. It also runs one real-browser cold deep-link row at both viewports and G297-AUTH, so `browserVerified` stays meaningful.

**First sketch miss, fixed before dispatch:** spying on `console.error` before `renderToString` caught React's server-only "useLayoutEffect does nothing on the server … non-hydrated" warning in jsdom. The final sketch spies after the server render, as NG9 does.

## 4. Consults
- **Advisor:** available and consulted before writing. It confirmed:
  - the test-only fix-up before STUDIO-LINK-b (bug gate, ≤ 3 related bugs);
  - a separate file for the reordered mock;
  - the NG9 hydrate pattern;
  - the rulings for C-R296-01, C-R296-02, REVIEW-6 and the architecture signal;
  - keeping one real-browser row.

  It also flagged the gate review, which B then read and ruled on.
- **Project agents:** none consulted. This is a test-only round, so it needs no reference-first, product-designer or Ableton section (D-29z755).

## 5. Order after 297 (D-29z757)
REGRESSION if round 298 is planned on or after 2026-11-02. Otherwise:
1. STUDIO-LINK-b (298), which includes the gate S4 decision row
2. NAME-AND-HINT
3. PERF-3c and the rest of STUDIO-PERFORMANCE
4. STEM-LANES
5. SYS-1…3
6. STORE-2b…5
7. REVIEW-RECOMMENDATIONS
8. T12-ADVANCED
9. The phase-2 entries (skip rule)

SRW-21-PLAN stays parallel. RETRO at round 305.

**Architecture checkpoint:** not yet. B requests a bounded frontend-architect checkpoint at the PD-REVIEW boundary (after STUDIO-LINK-b / NAME-AND-HINT), with GATE296-ARCH-ROUTE-DOM-FOCUS as its input.

## 6. Ready for commit?
- **Round 296:** already published as `bc9d9a7`.
- **Round 297:** after C PASS and the gate, root publishes the 2 §4 paths.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:** STUDIO-LINK-a2/b, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and every deferred Low remain. SRW-21 is `deferred_user`.
- **Not BLOCKED:** nothing external is missing. The open Saba questions do not block.

## 8. Housekeeping
- The store tree was untouched: `git status` is empty, and :5173 is not touched.
- B ran no dev server. The probe was a standalone `setContent` page in Playwright.
- Artifacts are in `b-round-296/`:
  - `claims-297.sh`, `claims-297-output.txt`, `claims-297-after-sketch.txt`;
  - the sketch, `sketch-covering-run.log`, `sketch-tsc.log`;
  - `mutant-{e,f,g}-*.log`, `vacuity-identity-order.log`;
  - `probe/fv.cjs`;
  - the backups and `update-backlog.py`.
