# C — Round 54 verification (SRW-14 stage 4a part II, D-29z19)

Verifier: C · 2026-10-17 18:47–19:19 +04 · task `current-task.md` (round 54), A report `a-round-54.md`.

**Overall: FAIL.** There are two reasons:
- I found a regression in this round's change, C-R54-01 (Medium). A had already raised it in review; I reproduced it independently.
- Every browser ID is **not run (environment)**. `:5173` and `:5199` returned `000` at 18:47, 19:09 and 19:18. This is the third round in a row (ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53).

**The offline items pass, with one exception:** my `npm run verify` did not exit 0 (C-R48-01 recurred; §4).

**Commit readiness for root: rounds 50–54 are NOT ready.**
- No stage-4a browser acceptance has run, and G54-3 (purchase protection) has not been browser-checked for three rounds.
- C-R54-01 is open.
- My quiet verify runs were rc 1 (load timeouts in unchanged files).

Artifacts are under `c-round-54/`:
- `g54-2-start.txt`, `g54-2-end.txt`, `diff-vs-snapshots.txt`, `checkpoint.md`;
- `runs/mutations.txt`, `runs/probes.txt`;
- `gates/` (tsc, biome-app, biome-errors, biome-owned, full-vitest, timeouts-alone, verify, verify-2, build);
- `tools/run-mut.sh`, `tools/mutate.cjs`;
- the scratch copy `scratch/mut/` (outside `store/`). The probe file is `scratch/mut/app/lib/arrangement/__tests__/c-probe-r54.test.tsx`. I removed the `node_modules` junction at the end; `store/node_modules` still has 618 entries.

## 0. Environment

- HEAD `038ed5a45f94596a264c14c4ec834607cb407948` at the start and at the end. Case **(A)**.
- `node.exe` count: 9 on every run.
- Dev server: `:5173/studio-lab` `000`, `:5199` `000`, and anonymous `/api/studio-token` `000` (no listener). I checked at the start, after the offline items and before the report. I did not start any server.
- I did not create a gstack browse state (`c-browse.json`), because there was no target to open. No browser side effects.

## 1. G54-2 — tree integrity: **PASS**

- `git status --short` has 17 lines, exactly as §3.1 says: the 15 baseline lines plus ` M selection.ts` and ` M selection.test.ts`. This holds at the start and at the end.
- Frozen list: 409 entries, 0 non-OK, at the start and at the end.
- Snapshots `SHA256SUMS.txt`: 4/4 OK.
- Protected files: 4/4 OK, at the start and at the end.
- The build and the test runs changed no tracked path.

## 2. R54-S — static: **PASS**

I used `diff -u --strip-trailing-cr` against `b-round-53-r54-snapshots/` (`c-round-54/diff-vs-snapshots.txt`).

| File | Hunks | Verdict |
|---|---|---|
| `selection.ts` | `@@ -169,7 +169,7 @@`; only l.172 changes, `* 1000) / 1000` → `* 1e6) / 1e6` | exact §0.1 |
| `selection.test.ts` | `@@ -323,3 +323,43 @@`; pure append of `describe('planClipLaneMove exact time delta (C-R53-01, D-29z19)')` with SL1 and SL2 | existing bytes unchanged |
| `grid-snap-clip-edges.test.tsx` | `@@ -665,3 +665,34 @@`; pure append with CM16 and CT9 | existing bytes unchanged |
| doc 048 | status line plus an appended `## Round 54 — სხვა ხაზზე ზუსტი ჩაკეტვა (D-29z19)` | earlier text unchanged |

- **EOLs:**
  - all four files are CRLF 0;
  - LF 221 / 365 / 698 / 269;
  - `it` 25 and 28, i.e. +2 and +2.
- **Banned-content scan of the added lines:** no `any`, `@ts-ignore`, `as X`, `//`, hex colour, fake timers or snapshots.
- **Doc 048:** it contains the Ableton "no source" row and the TODO list. It also honestly records A-R54-REVIEW-SHIFT-SUBMS as a known residual.

## 3. R54-U — unit tests, mutations, probes: **PASS** (one new regression found by probe → C-R54-01)

**Base:** my scratch copy, with `selection` + `grid-snap-clip-edges` + `grid-edges`, gives 3 files / 59/59.

**Mutations.** I used my own strings, in my own scratch copy (`runs/mutations.txt`). All three files were restored and checked with `cmp`.

| # | C mutation | Failed | Expected | Verdict |
|---|---|---|---|---|
| (a) | `Math.round(params.timeDelta * 1e3) / 1e3` | SL1, CM16 | SL1, CM16 | ✔ (this is the snapshot code, so it also reproduces A's red run) |
| (b) | `const delta = params.timeDelta + 0;` | SL2 | SL2 | ✔ |
| (c) | `Math.round(params.timeDelta * 10000) / 10000` | SL1 | SL1 | ✔ |
| (g) | `clipEdgeTimes` pushes `Number(x.toFixed(3))` | CE6, CT9 (CT8 green) | CE6, CT9 | ✔ |
| (d) extra | delta unrounded; µs rounding applied to each member `start` (anchor and loop) | none | none (equivalent) | info: equivalent alternative, 59/59 |
| (e) extra | `ArrangementClip.tsx:452` `timeDelta: roundTime(requestedStart) - original.start` | CM16 | CM16 (SL1 green) | ✔ the mounted path reaches the planner unrounded |

**Probe re-run.** These are the round-53 probes plus new round-54 probes, run on the round-54 `selection.ts` and on the snapshot `selection.ts` (`runs/probes.txt`).

| Probe | Round 54 | Snapshot (round 53) | Verdict |
|---|---|---|---|
| **P3x** (m1 music 2 dur 2 → stems; st0 ends 6.0004; raw 6.05) | **stems 6.0004**, `გადატანა ხაზზე — სტემები: start 00:06.000.`, Undo `გადატანა ხაზზე — სტემები` | refused, music 2, `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` | **PASS**: C-R53-01 fixed (unit level) |
| P3s (same-lane control) | 6.0004 | 6.0004 | unchanged ✔ |
| P1 / P1m | 8.3996 | 8.3996 | unchanged ✔ |
| P1s | 6.0004 | 6.0004 | unchanged ✔ |
| P2 / P2m | 8 (normal text) | 8 | unchanged ✔ |
| P4 | start 6.8504, off 0.1504, end 11.3 | same | unchanged ✔ |
| P5 | refused "ცვლილება არ მოხდა" (by design) | same | unchanged ✔ |
| **P3x-END** (C new: cross-lane **end**-touch; st1 stems 10.4004; raw start 8.35) | stems **8.4004**, end 10.4004 | 8.4, end 10.4 (a 0.4 ms gap) | PASS: the end-touch is exact too |
| **PF-FREE** (C new: m1 music 6.0004, Snap off, +1 s → stems) | stems **7** | 7.0004 | the §0.1 accepted side effect, observed. Info, not a defect |
| **PG-GROUP2** (C new: group m1 music 2 + t2 stems 2.0004, anchor → stems, grid) | m1 stems 8; t2 sfx 8.000399999999999; `გადატանა (2): start 00:08.000.` | identical | group cross-lane unchanged ✔ |
| **PS-FREE** (C new: m1 music **6.0004**, Shift-drag to empty stems) | stems **6** | stems **6.0004** | **regression → C-R54-01** |
| **PS-TOUCH** (as PS-FREE, plus st0 stems 0–6.0004) | **refused**: stays on music, `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`, Undo null | stems **6.0004**, normal text | **regression → C-R54-01** |
| PS-SAME (C new: same-lane Shift-drag, sub-ms start) | music **6**, Undo `კლიპის გადატანა` | music **6** | pre-existing in both trees → **C-R54-02** (Low) |

## 4. G54-1 — gates: **FAIL** (C-R48-01 recurrence; not attributable to the round-54 diff)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 ✔ |
| Biome `./app` (read-only) | 5 errors / 218 warnings / 1 info. The 5 errors are exactly the baseline CRLF `format` list: `StudioWorkspace.tsx`, `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` ✔ |
| Biome on the 3 owned code/test files | 0 diagnostics ✔ |
| `npm run build` | rc 0, `✓ built in 7.42s` ✔ |
| full `npx vitest run` (node 9) | **3 failed / 1498 of 1501**, 87 files. All 3 are `Test timed out in 5000ms`: `track-layout` "folds a lane…", `sfx-library` "adds three sounds…", `master-ui` "renders the Master group…". Alone: 36/36, 3/3, 18/18 |
| `npm run verify`, run 1 (quiet) | **rc 1**. `fader-guards` "Clip Gain typed 3…" timed out (8454 ms), 1500/1501. The chain stopped at test:run. Alone: 71/71 |
| `npm run verify`, run 2 (quiet) | **rc 1**. `track-layout` and `sfx-library` timed out, 1499/1501 |
| §5 focused command (11 files, node 9) | **11 files / 224/224**, rc 0 ✔ (`gates/frozen-suites.txt`) |
| other §4.8 frozen suites (8 files: gesture-reentry, track-layout, context-hygiene, view, ArrangementContext, ssr-layout-effect, delete-selection, delete-selection-ui) | 148/149. `track-layout` "folds a lane to a 36 px row…" **timed out again** (5716 ms) in an 8-file run. It is 36/36 alone |

- **Timings alone:** the two recurring tests take 2057 ms and 2102 ms alone, against more than 5 s in the parallel run.
- **The failures move between runs.** Every failing file is unchanged this round, and none of them uses the changed code path's tests. The cause is load (the jsdom `StudioWorkspace` mounts under parallel workers), not D-29z19.
- **The most frequent failure** is `track-layout` "folds a lane to a 36 px row…". It timed out in 4 of C's 5 multi-file runs this round, and in A's frozen-suite run. It takes about 2.1 s alone, but more than 5 s with only 8 files in parallel. This is the clearest headroom target for C-R48-01.
- **I do not write PASS.** The spec requires verify rc 0, and in my two attempts it was not. A got rc 0 once. **C-R48-01 stays open and recurred: 3 of 3 C full runs this round.**

## 5. Browser acceptance — all **not run (environment)**

R52-EDGE (EG-OFF, EG-1, EG-VIDEO, EG-LINE, EG-ALT, EG-ALT-ON, EG-CROSS, EG-GROUP, EG-1280), R54-CROSS (CX-VIDEO, CX-NOTE), R53-LANE (LN-TOUCH, LN-AFTER, LN-SHORT), R52-TRIM (ET-START, ET-END, ET-ALT, ET-CLAMP), R52-PLAY (EP-VIDEO, EP-OFF, EP-CROSS), R52-REG (REG-HYD, SN-1, NU-1, the stage-2 trim, RU-1, LB-MOVE, LD-1, the Shift cross-lane drag, the clip-body click, the G and division texts) and **G54-3** (anonymous `/studio-lab` with the demo badge, no token/R2/Authorization requests, `/api/studio-token` 401, `/studio/middle-east` "Sign in required").

- **Reason:** no listener on `:5173` or `:5199` (three checks, §0).
- **Consequences:**
  - V, the exact video end, was not measured;
  - CX-NOTE could not be decided;
  - no real audio graph, source timing, transport or export WAV was measured this round;
  - purchase protection has not been browser-checked for **three** rounds. Only the protected-file hashes (4/4) back it statically, and that is not runtime evidence.
- **Root action:** start the Store dev server and the backend before the next C run. The probable cause, ENV-VITE-ENOMEM-R53, is the Vite FSWatcher ENOMEM on `playwright-report/`, which is root's to address.

## 6. Bugs

### C-R54-01 (Medium, regression introduced by D-29z19) — a Shift time-locked cross-lane move no longer keeps a sub-ms start

This is the same issue as A's reviewer finding A-R54-REVIEW-SHIFT-SUBMS, independently reproduced.

- **Steps** (mounted `StudioWorkspace`, jsdom; scratch probe PS-TOUCH):
  1. m1 on music at **6.0004**, dur 2; st0 on stems 0–6.0004.
  2. Snap on (G), 1 s.
  3. Drag m1's header +40 px down to the stems lane with **Shift** held.
- **Expected** (round-53 behaviour, and §0.4 "the Shift time lock (delta 0)" / R52-REG "a Shift-locked cross-lane drag keeps its start exactly"): m1 on stems at 6.0004, touching st0.
- **Actual:**
  - the move is refused: m1 stays on music, the status is `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`, and there is no undo entry;
  - without the neighbour (PS-FREE), m1 lands at **6**, which moves it 0.4 ms while it is "time-locked".
- **Cause (read-only):**
  - with Shift held, `ArrangementClip.tsx:371-373` sets delta 0 and `snapStep` null;
  - `moveStartOnGrid` (`:106-107`) returns `roundTime(start)` = 6.000;
  - `:452` passes `timeDelta` −0.0004, which ms rounding used to absorb and µs rounding now keeps.
- **Reachability:** sub-ms starts are produced exactly by the round-53/54 locks (P1s, P3x) onto real decoded audio whose `buffer.duration` is not a whole millisecond. So the lock-then-Shift-move workflow is reachable.
- **Fix direction (for B; it touches the frozen `ArrangementClip.tsx`):** pass `timeDelta: 0` when `timeLocked`, plus a CM9c-type test (a sub-ms start with Shift cross-lane keeps its start bit-exactly, including next to a touching neighbour).
- **Evidence:** `c-round-54/runs/probes.txt` (PS-FREE, PS-TOUCH, round 54 vs snapshot).

### C-R54-02 (Low, pre-existing in both trees) — a same-lane Shift drag of a sub-ms clip changes its start and creates a history entry

- **Steps:** m1 on music at 6.0004; Snap on; Shift-drag the header +40 px on the same lane.
- **Expected:** time locked and lane unchanged, so nothing changes and no history entry is made. This is C's inference from the existing contract, not a separately stated rule: CM9 and CM9b say the Shift time lock keeps the start exactly (`toBe(2)`, `toBe(2.3)`), R52-REG says "a Shift-locked … drag keeps its start exactly", and an unchanged drag elsewhere reports `ცვლილება არ მოხდა — ისტორია არ შეიცვალა`. B decides whether a 0.4 ms ms-rounding shift under Shift is acceptable.
- **Actual:** start **6** (moved 0.4 ms); Undo `კლიპის გადატანა`; status `კლიპის გადატანა: start 00:06.000, …`.
- **Cause:** the same `moveStartOnGrid` → `roundTime` path as C-R54-01. It is identical on the snapshot `selection.ts`, so this is **not** a round-54 regression.
- **Note for B:** it can be bundled with the C-R54-01 fix.
- **Evidence:** `runs/probes.txt` PS-SAME.

### C-R48-01 (recurred) — load timeouts in the full suite

See §4. The failures are in different files each run, and every failing file is green alone at about 2.1 s.

## 7. Ableton — two verdicts per row

I checked no new source this round. B's capture is `b-round-46/ableton-6.7-6.10-20261016.txt` (Live 12 manual §6.7/§6.10). I watched no video and used no Live installation.

| Behaviour | CZABA requirement (this round's evidence) | Ableton conformance |
|---|---|---|
| Clips snap to the editing grid | unit only (suites green); EG-LINE and SN-1 browser **not run** | confirmed (6.7 text) |
| Clips snap to the edges of other clips | unit and probe PASS for single moves and trims, same-lane and cross-lane (P3x, P3x-END, P1s, P4, CM16, CT9). Browser EG-1/EG-VIDEO/EG-CROSS/CX-VIDEO/LN-*/ET-* **not run** | confirmed (6.7 "edges of other clips"); groups/drop are 4c |
| Snap distance / grid-vs-edge priority | unit only; EG-1 vs EG-LINE **not run** | unconfirmed (6.7 does not say) |
| Sub-ms lock exactness, same lane | unit PASS (CM12, CM13, CT8; P1s, P3s, P4) | no source (CZABA decision) |
| Sub-ms lock exactness, across lanes | unit PASS (SL1, CM16, CT9; P3x, P3x-END). **But the Shift lock across lanes regressed (C-R54-01).** CX-VIDEO **not run** | no source (CZABA decision) |
| Which edge pairs count on the same lane | unit (CM14, CM15, CT7; P2, P2m); LN-SHORT **not run** | unconfirmed |
| Grid off → no snapping | unit (CM4); EG-OFF **not run** | confirmed for subdivisions; unconfirmed for objects |
| Alt bypasses / temporarily enables | unit (CM5, CM6); EG-ALT, EG-ALT-ON and ET-ALT **not run** | confirmed (6.10 text) |
| Locators / time-signature targets | — | not applicable yet (SRW-16) |

I make no claim that "Ableton does it this way" for any unconfirmed or no-source row.

## 8. Carried items (unchanged; not re-run)

- **Root review findings that are still open** (`root-pre-push-review.md`, `publication-checkpoint.json` followupReview):
  - RF3-1 (video sync not 15/15; the R2-V3 layout was not measured), RF3-2 (`play()` 22–30 ms after `startAt`) and R5-L6 (wrap seeks 0.3–1 s; drift above 0.1) are all still FAIL and were not re-run;
  - the purchased loader hardcodes `middle-east` (SRW-21). I do not claim that every product's stems work;
  - portable instruction paths;
  - the protected-auth permission is unchanged.
- **Not run (by scope):**
  - the full find → add → fit video → export flow, which has no WAV/duration/sample evidence this round;
  - the FB-01..FB-16 stage regression;
  - `test:e2e:smoke` (root);
  - a real `pointercancel`.
- **Open C bugs:** C-R51-01, C-R51-02 (round 55), C-R52-T1 (round 56), C-R48-01 (recurred), C-R41-01, C-R27-01, C-R6-02, C-R8-01, C-R23-01, C-R38-01, plus the new C-R54-01 and C-R54-02.
- **Architecture note (A → B), endorsed by C's evidence:** the time-precision rule lives in four places (`roundTime`, `roundGridTime`, `toWholeMicroseconds`, and the inline µs in `selection.ts`). C-R54-01 is a direct consequence. It is a candidate for ARCH-CHECKPOINT-SRW14-PREFS, bundled with the C-R54-01 fix.
- **Stray `store/nul`:** a stray root-level file (A §7). Root's call; I did not touch it.

## 9. Return to B

1. **C-R54-01 (Medium regression):** plan a one-owner fix in `ArrangementClip.tsx` (`timeDelta: 0` when `timeLocked`), plus CM9c-type tests. C-R54-02 can share that change.
2. **Root:** restart `:5173` and `:5199`, then re-dispatch C for the stage-4a browser acceptance and G54-3. Per B's own rule, stage 4b must not be dispatched without it.
3. **C-R48-01:** in every C full run this round, 3 of 3, the timeouts made `verify` unreliable. A bounded task should give the StudioWorkspace-mounting tests a headroom review.
4. **Commit readiness:** not ready (see top).
