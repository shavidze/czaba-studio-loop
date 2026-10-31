# B round 291 → 292 planning (2026-10-31)

**Decision: CONTINUE.** The next task is round 292, FIX-PD-1c (F8 Medium, a narrow-window state for `/studio-lab`) plus R5 (the LRS4 timeout ruling). The baseline is `88b23dd`, which gate 291 published.

## 1. Round 291 closure (D-29z723), from independent evidence only
- **C:** `c-round-291.json` is PASS, with `browserVerified` and `realVerified` both true.
  - 14 rows passed and 0 failed. Gate rows were not claimed.
  - Browser rows B-AX, B-KEYS-291, B-STATES-291, B-SCREEN (0 px), B-JOURNEY-291 (with a WAV export) and G291-AUTH passed at 1440×900 and 1280×720.
- **Gate:** `gates/gate-round-291.json` is `published 88b23dd`, with both remotes at the same hash. `verify.log` shows 225 files and 3369 tests passing, and the review scored the change 9/10 with nothing blocking.
- **Backlog:** FIX-PD-1b2 is done. GATE289-S1, S2 and S3, A-R289-REVIEW-L2, C-R290-01 and B-R290-S3-FIRST-ID-KEY-PARTIAL are closed.
- `tasks/round-291.md` is a copy of the round-291 task (`cmp` identical before the overwrite). Nothing was deleted.

## 2. Rulings on A's round-291 STOP (L10, D-29z724)
1. **LRS4 headroom.** Gate 291 took 2496 ms against the 5000 ms default; C took 2707 ms and A 2609 ms. This is the third time (rounds 238, 253 and 291).
   - **Ruling:** granted in round 292 as R5, a test-only `{ timeout: 15_000 }` on the describe. This finally carries out D-29z354.
2. **C-R291-01 (Low).** The `#occurrence` suffix is not pinned by any row.
   - **Ruling:** it goes to `deferred_low_polish`, together with the gate-291 Lows GATE291-S1 (LG8's scenario name) and GATE291-S2 (a focused option skipped by Tab after filtering).
   - The reviewer's watch goes to `architecture_signals` as GATE291-ARCH-LIB-RUNS-WATCH.
   - There is a bundle candidate, LIB-RUNS-POLISH, that would close B-R290-LIB-SHAPE-SWITCH-FOCUS, C-R291-01, GATE291-S1 and GATE291-S2 in the polish pass. It is not scheduled now: a third round in that region is not planned, so no frontend-architect checkpoint is requested.
3. INFO-C291-K5-WORDING and INFO-C291-S3-BROWSER are noted. No lesson is added; lessons.md is unchanged at 59 lines.

## 3. Why round 292 is FIX-PD-1c
- **Bug gate:** Medium findings are fixed first. No Critical, High or Medium finding is open apart from F8, which is the next PD-REVIEW stage (D-29z722).
- **Regression round:** `regression-last.json` was written on 2026-10-30 (round 258). It is due on or after 2026-11-02, so it is not due today (2026-10-31). The file was not touched.
- **RETRO:** the last one was RETRO 290; the next is due at round 305.

## 4. How the task was built
- **Consults:**
  - **product-designer** decided the behaviour, the states and the rows.
  - **tech-lead** decided the mechanism. Their positions differed on *where* the gate lives, and tech-lead's route-level gate was chosen. It touches neither `StudioWorkspace.tsx` nor `ArrangementContext.tsx`, it unmounts the window key listeners, and it keeps the provider so no work is lost.
  - **advisor:** available and consulted twice.
    - **Before writing:** the STOP rulings, the copy, the sketch and the focus targets.
    - **Before hand-off**, three fixes, each checked in the source:
      1. **The latch must ignore the hydration pass.** Without that, a direct phone load would land in the latched branch and autofocus the heading. Fixed with `useStudioHydrated`, R8 and NG9.
      2. **`max-[899px]` becomes `max-[900px]`.** Tailwind v4 compiles `max-[N]` to `(width < N)`, confirmed in `node_modules/tailwindcss/dist/lib.js`.
      3. **No Biome ignore is needed for the native `<audio>`:** `useMediaCaption` is `off` in `biome.json`.
    - `root.tsx` has no `<main>`, so the narrow screen's `<main>` is the only one.
- **Copy:** Saba's approved F8 wording is kept. product-designer's rewrite and the "no escape" choice go to Saba as SABA-Q-FIXPD1C-COPY and SABA-Q-FIXPD1C-ESCAPE (L44, non-blocking).
- **Reference:** none found. B searched Soundtrap, BandLab and Figma, and recorded what was searched. Ableton conformity is not applicable.
- **Pre-check sketch on a scratch copy of `88b23dd`** (`b-round-291/`):
  - **Tests:** with the TH4 and TH10 grants, the SSR, theme, focus-ring and strings tests pass, 5 files and 89 tests (`sketch-tests.log`).
  - **Browser (`probe/narrow-sketch.json`):**
    - the narrow state shows at 390, 768 and 899, and the workspace at 900;
    - resizing keeps the clips;
    - with the CSS gate, the desktop has 0 differing pixels at 1280 and 1440 (`probe/desk-diff.json`);
    - `scheme-dark` gives the native player a dark chrome.
  - **Findings from the sketch:**
    - focus fell to BODY on both resize transitions, so the task names its targets (L47);
    - a phone still downloads the two demo mp3 files, exactly as HEAD does. This is recorded as B-R291-NARROW-PREFETCH (Low, deferred) and is not a regression.
  - **Environment note:** the first sketch server briefly shared `node_modules/.vite` (L38). B stopped it within seconds and re-ran it with its own `cacheDir`. A Playwright check of the root `:5173` afterwards showed no 5xx and no page errors (`probe/root-health.cjs`).
- **Claims:** `b-round-291/claims-292.sh` and its output `claims-292-output.txt`, K1–K18. The frozen list is `b-round-291-r292-tree-sha256.txt` (1158 entries).

## 5. Ready for commit?
Round 291 is already published (`88b23dd`). Nothing else is pending for root from B.

## 6. Order after 292 (D-29z726)
REGRESSION if the round-293 planning falls on or after 2026-11-02. Otherwise:
1. SYS-VACUOUS-ROWS
2. STUDIO-LINK
3. NAME-AND-HINT
4. PERF-3c and the rest of STUDIO-PERFORMANCE
5. STEM-LANES
6. SYS-1…3
7. STORE-2b…5 (direction gate)
8. REVIEW-RECOMMENDATIONS
9. T12-ADVANCED
10. The phase-2 entries (skip rule)

SRW-21-PLAN stays a parallel planning task.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - F8 is an open Medium.
  - Most of the queued scope is not done: FIX-PD-1c, STUDIO-LINK, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-*, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2.
  - The deferred Lows are still open.
- **Not BLOCKED:** nothing external is missing. The Saba questions are non-blocking.
