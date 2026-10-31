# B round 288 → 289 planning (2026-10-31)

**Decision: CONTINUE.** The next task is round 289, FIX-PD-1b (F7 + SR-230-6), in `current-task.md`. The round-288 task is archived as `tasks/round-288.md` (a byte-identical copy).

**Advisor:** available. I consulted it once before writing; a second call follows the hand-off.

## 1. Evidence read
- **`c-round-288.json`:** `taskStatus: PASS`, with `browserVerified: true` and `realVerified: true`. There are no bugs.
  - **11 rows passed:** CLAIMS, SOURCE-SCOPE, TYPECHECK, UNIT (8 files / 136), UNIT-MUTANTS (N1–N10), B-LINE-BOX, B-PREMIUM, B-KEEP-287, B-JOURNEY (11 fixtures), G288-AUTH and DOC-215. Every browser row ran at both viewports.
  - **BLOCKED (backend unavailable in cloud):** the owned-Standard upgrade state and the real-backend 403. Per cloud rules, they do not make the round unverified.
- **`gates/gate-round-288.json`:** `published`, commit `c345def`, both remotes. **The baseline for round 289 is `c345def`**, and the tree is clean.
- **`a-round-288.md`:** typecheck and lint rc 0, 8/136 covering tests, mutants N1–N10, a browser smoke, and one Architecture note (forwarded by C).

## 2. Backlog changes (`b-round-288/backlog-update.py`; D-29z707…D-29z709; backups `b-round-288/*-before-289.*`)
| Id | Change |
|---|---|
| FIX-PD-1a2 | **მზადაა** (done), from independent C evidence: c-round-288 PASS, browserVerified true, gate published. **F9 is closed** |
| C-R286-01, C-R286-02, C-R287-01, A-R287-PREMIUM-UNVALIDATED | closed |
| C-R186-01 | closed by L7: the same F9 root cause. Round 286 fixed door-slams ($0.00 → $9.00), and round 288 closes the rest |
| BACKEND-EVIDENCE-F9 | new info item. It keeps the backend-only rows as open evidence for a later backend-enabled check |
| A-R288-ARCH-LEADING-SPANS | architecture **signal**, not scheduled: three hand-matched `leading-*` spans. A STORE-4 candidate |
| INFO-C288-FIXTURE-COUNT | noted. B's task said 10 active fixtures; the mock had 11. L29 already covers this, so no new lesson |
| SABA-Q-FIXPD1B-NAMES | `awaiting_user`, non-blocking: Pulse or Rhythm, Melody or Lead |
| FIX-PD-1b | `in_progress`, dispatched as round 289 |
| retro_policy.next_due | round 290 (window 275–289) |

I also updated `feature-status.md` (round-log rows 288/289, the next line, and the PD-REVIEW row) and appended LIVE-MEAS-BROWSER-SEARCH-LOCATION (non-blocking) to `user-review/live-checks.md`.

`lessons.md` is unchanged. F7 is covered by L54, and RETRO 290 will count it.

## 3. Design for round 289
- **Names:**
  - `Night Pulse` · `Full mix` / `Pulse` / `Bass` / `Pad` / `Melody`;
  - `Middle East — public preview` and `CZABA hero — public preview`;
  - the collection `Synthetic demo · Night Pulse`.
- **Library:** the per-card collection line is removed. When the results contain ≥ 2 collections, the label shows once as an ARIA `group` heading inside the listbox. Groups are contiguous runs, so the DOM order equals the keyboard order.
- **Product-designer consult:** they chose the group role, the "≥ 2 collections" condition and headings on every group.
  - **B override, based on a measurement:** the designer's truncation cut **both** labels at the default 144 px list width (`b-round-288/probe/sketch.json`). The heading wraps instead (`sketch-wrap.json`).
  - **Measured effect:** synthetic cards go from 80.25 to 47.25 px, the list `scrollHeight` from 669 to 614, and the list's text elements from 14 to 11 (screen budget L39: net decrease).
- **Saba questions (L44, once each; non-blocking):**
  1. **SABA-Q-FIXPD1B-NAMES:** Pulse or Rhythm, and Melody or Lead.
  2. **Deviation from Live:** Live 12's content pane has no group headings (manual 4.1/4.2/4.6). CZABA adds them because its short card titles are ambiguous. Saba endorsed SR-230-6. Whether Live shows a location in search results is not confirmed, so root will measure it (LIVE-MEAS-BROWSER-SEARCH-LOCATION).
- **Buyer side:** a purchased single collection shows stem names only, with no heading. The product name stays in the tree, the option `title` and the clip names. This is recorded in D-29z709.

## 4. Pre-check (L23, L29, L3)
- **Claims:** `b-round-288/claims-289.sh` → `claims-289-output.txt`, K1–K19 at `c345def`.
- **SWEEP K10** (roots `app`, `perf` and `e2e`): demo terms appear in 4 files. The only data pins are `strings.test.ts` `DEMO_REMAINING_GEORGIAN_LINES` and `studio-lab-demo.test.ts` l.248. `library.test.ts` has its own fixture and stays unchanged.
  - The wider Georgian-codepoint sweep (`b-round-288/sweep-georgian.txt`, 1137 lines) shows only legacy track-name fixtures beyond those. They are out of scope.
  - The testid `arrangement-library-option-context` has 1 hit, in the component only.
- **Scratch** (`git archive c345def` → `/tmp/b288scratch`; the diff is kept as `b-round-288/sketch.patch`): I applied the rename, the 2 pins and a sketch of the grouping.
  - `tsc` rc 0.
  - Biome: `useSemanticElements` on `role="group"` is resolved by one biome-ignore (precedent K12). This is ruled in the task.
  - **14 covering files / 247 tests passed.** The whole `app/lib/arrangement` + `app/data` folders also passed: **172 files / 2607 tests** (`scratch-arrangement-suite.log`). These are B pre-check numbers, not gate results.
- **Browser at HEAD** (dev :5173, both viewports): `probe/baseline.json`, `probe/sketch*.json` + PNGs, `probe/journey-head.json`, and `probe/play-head.json`.
  - Adding Bass gives the exact status sentence C checks in B-JOURNEY (the tempo seed appends to the add status; L51).
  - Play moves the position readout from 00:00.000 to 00:01.512.
  - `probe/states-head.json`: ArrowDown/ArrowUp visit the 9 options in order with every focused option inside the list box at both viewports; the tree, folder and search states (a)(b)(c)(f) match the task.
- **Second advisor pass (applied):** status locators named in B-JOURNEY; the edge rule (A,B,A → 3 groups) is explicit as LG7, with M3 retargeted at it; the HEAD keys and states probes were added; /tmp evidence was copied into `b-round-288/`.

## 5. Queue and cadence
- **Order:** round 289 FIX-PD-1b → **round 290 RETRO** (window 275–289) → **REGRESSION**, due at the first planning on or after 2026-11-02 (`regression-last.json` is 2026-10-30) → FIX-PD-1c → STUDIO-LINK → NAME-AND-HINT → PERF-3c and the rest of STUDIO-PERFORMANCE → STEM-LANES → SYS-1..3 → STORE-2b..5 (direction gate) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (PHASE2-VIDEO-SCORING awaiting the user's go-ahead; PHASE2B-SPOTTING, STUDIO-AGENT-COMMANDS and RECORDING-META-S1 follow the skip rule).
- **RETRO 290 inputs to remember:**
  - F7 is the fifth PD-REVIEW journey miss (L54).
  - The 287 FAIL came from a B spec conflict (L4).
  - The 288 fixture-count slip.
  - The product-designer truncation override (a measured spec beats an unmeasured consult).
- **No frontend-architect checkpoint:** this is a small change with one owner. ArrangementLibrary gains one `useMemo` and a wrapper, so no structural risk is accumulating.
- **Ready for commit:** round 288 is already published (`c345def`). Round 289 is not ready until C passes.

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE:** FIX-PD-1b/1c, STUDIO-LINK, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and all deferred Lows remain.
- **Not BLOCKED:** nothing external is missing.
