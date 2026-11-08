# Round 417: SYS-CLOCK-DETERMINISM — five jsdom rows stop depending on the wall clock (test-only; closes 6 Low/info findings)

**Planned by:** B, at the round 416 → 417 planning, 2026-11-08 (`b-round-416.md`). The advisor was used after orientation. The round-416 task is archived as `tasks/round-416.md` [K13].

## Read first
- `lessons.md` in full. Most relevant here: L4, L11, L12, L26, L28, L29, L31, L37, L38, L56 (new archive clause), L57, L58, L59, L60.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AUDIO_ARCHITECTURE.md` (read only; no audio code changes), `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-416/claims-417.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-416/claims-417-planning-output.txt` (stderr empty).
  - Sketch output on B's committed scratch: `b-round-416/claims-417-sketch-output.txt` (stderr empty).
  - Expected differences: `b-round-416/claims-417-planning-vs-sketch.diff`. K1 is the scratch commit; K5 is `no` because the patch is already in; K10 has the new row counts.

## Baseline: HEAD `344a59f`, clean tree
- **Gate 416 was `skipped`** (no source change in the RETRO). **Gate 415 is `published`** at `344a59f` [K7]. HEAD is `344a59f…` [K1], and the tree is clean (K2 `total 0`).
- **Frozen:** `b-round-416/r417-frozen-sha256.txt` has **1,311** entries: every tracked file except the 5 granted test files. `sha256sum -c` rc 0 [K3]. That includes all runtime code (`ArrangementContext.tsx`, `ArrangementVideoDock.tsx`, `tempo.ts`, `transport.ts`) and both helpers (`helpers/fake-web-audio.ts`, `helpers/workspace-test-environment.ts`).
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- If K1 is not `344a59f` at A1 (root published in between), A re-runs the claims. A STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 416 (RETRO 416) passed:** C PASS, `browserVerified` true, 0 app bugs (D-29z1450).
- **Next in the recorded order (D-29z1448, D-29z1453): SYS-CLOCK-DETERMINISM.** Root cause: the fake `AudioContext.currentTime` follows `Date.now()` [K9 helper-clock], and `positionAt` holds 50 ms after a start [K9 lookahead]. Rows that read the live position or wait on real time therefore drift or flake on a loaded runner.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **Schedule:** REGRESSION is not due (`regression-last.json` is 2026-11-07, so it is due on or after 2026-11-10) [K8]. The next RETRO is round 431.
- **C bug from round 416:** C-R416-CLAIMS-K22-ARCHIVE (Low, environment, a B loop tool). B fixed it in its own tooling: K14 of this round's claims also reads `archive/findings-archived.json` (D-29z1451, L56). C checks it in row 1. No app change.

## 1. Rulings (B, D-29z1452)
1. **Scope = 5 rows in 5 test files.**
   - EN10 in `marker-edge-nav-ui.test.tsx`
   - VDS3 in `video-dock-strings-ui.test.tsx`
   - SF11 in `schedule-failure-ui.test.tsx`
   - IM24 in `insert-marker-ui.test.tsx`
   - BW5 in `tempo-window.test.ts`

   These close GATE77-S4-EN10-CLOCK, GATE148-S2-VDS3-WALLCLOCK, A-R388-REVIEW-L4-SF11-REAL-CLOCK, A-R415-REVIEW-L1-CALLSITE-FLAG, C-R326-01 and ROOT-R70-L4-BW5-WALLCLOCK [K14]. B-R184-FAKECLOCK-UNASSERTED and GATE325-IM24-WALLCLOCK stay related and are not closed.
2. **Both helpers stay unchanged** (frozen).
   - Only SF11 uses `fake-web-audio.ts`, and it already returns `fakeClock`.
   - EN10, VDS3 and IM24 keep their file-local fakes. Moving them onto a helper is signal SIG-R415-WORKSPACE-ENV-CONVERGENCE and is not scheduled.
3. **Each row uses the clock method that it actually needs** (B probes, `b-round-416/probe/vds3-advance.md`):
   - **EN10:** freeze `Date.now` (`vi.spyOn(Date, 'now')`, the IM24 house pattern). The landing point is exact (`toBe(2.25)`). A fake-clock step of 0.3 s then reads `toBeCloseTo(2.5, 6)` and the transport is still playing, which proves playback continues.
   - **VDS3:** use `vi.useFakeTimers({ toFake: ['Date', 'performance'] })`. Freezing `Date.now` alone is not enough, because the dock steps with `performance.now()` [K9 dock-perf] and `play` was never called in that probe. Advance **exactly 50 ms** (= `PLAYBACK_LOOKAHEAD`), then flush one frame, and `play` is called once. With 100 ms, `play` is not called (probe), so the 50 ms value is load-bearing. Add `vi.useRealTimers()` to that describe's `afterEach`.
   - **SF11:** freeze `Date.now`. Both real `setTimeout(150)` waits become `fakeClock.base -= 0.15` steps. Add one assertion that `window.setInterval(() => undefined, 1_000)` returns `0`, which proves the stub is installed (fixes A-R415-REVIEW-L1). The pump runs through `setInterval` [K9 pump], and that is stubbed here.
   - **IM24 (C-R326-01, `B spec` origin):** the playing tail now does what the browser does (c-round-326 B-IM24, c-round-272 B-ATEND).
     - Ctrl+Right while playing visits `[2, 6, 10, 16]`.
     - Then one captured rAF tick runs, after a 0.05 s clock step [K9 endstop]. The transport stops at 16.
     - The 5th Ctrl+Right gives the **stopped** text `No more markers after the insert marker`, with the insert marker at `16.000`.
     - The old "Playing at 16 + `No more markers after the playhead`" state existed only because jsdom never ran the end-stop. This is the smallest honest contract, and it is not an app change.
   - **BW5 (L4, an equal-or-stronger replacement):** remove `elapsed < 100`. Instead, count reads of the window object's `fromPx`/`toPx` getters and require **≤ 1,000**.
     - HEAD's windowed walk reads it 442 times.
     - A full-build mutant reads it 6,784,880 times, and the existing 180–240 count bound stays green under that mutant. So the old count bound never proved "no full build"; only the timing did, and that was flaky.
4. **Every other `it()` body in the five files stays byte-identical to HEAD.** The sketch only changes the five named rows, one describe's `afterEach` (VDS) and the SF helper destructuring.
5. **Doc:** `268-sys-clock-determinism.md` [K6: 267 is the last].

## 2. What A changes (sketch `b-round-416/sketch-417.patch.txt`, sha256 `70a75d989b19b434…` [K11]; generator `b-round-416/make-sketch.py`)
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-416/sketch-417.patch.txt`, then `git apply` the same file (5 files, +61/−20). **Do not edit the five files afterwards.** If you find a Medium or worse in the sketch logic, STOP (L11); do not edit around it.
3. **Doc:** create `docs/implementation/2026/quarter-IV/268-sys-clock-determinism.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** Completed (C round 417 PASS)` (L28).
   - It has TEMPLATE's 7 `## ` headings in order (L26).
   - Content: rulings 1–5; per row, the old dependence and the new clock method; the VDS3 50 ms fact and the BW5 read numbers with their source files; the IM24 contract change and why; the 6 closed ids.
   - It includes a mutant block that copies the 12 lines of `b-round-416/mutants/summary.txt` byte for byte.
   - It cites only rows and files that exist (L26).
4. Write `a-round-417.md` as you go: changed files, each check with its rc and log path (`a-round-417/`), reviewer findings, and a For B section with any Architecture note.

## 3. Grants (`b-round-416/grants-417.txt`, 6 paths)
- `app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/tempo-window.test.ts` (sketch only)
- `docs/implementation/2026/quarter-IV/268-sys-clock-determinism.md` (new, whole)
- **Nothing else.** That means no runtime, helper, protected, auth, route, component, config, package or `public/` file. At the end, `git status --short --untracked-files=all` shows 5 ` M` lines and 1 `??` line.

## 4. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-416/claims-417.sh` at start | Equals `claims-417-planning-output.txt`; stderr empty |
| A2 | `npx vitest run app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx app/lib/arrangement/__tests__/insert-marker-ui.test.tsx app/lib/arrangement/__tests__/tempo-window.test.ts` | rc 0; **5 files, 63/63** (same count as HEAD). Report the per-row durations. On B's scratch (`b-round-416/sketch-run.log`): EN10 116 ms, VDS3 170 ms, SF11 80 ms (HEAD 681 ms), IM24 69 ms, BW5 5 ms. All are far below their timeouts (L31) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch scratch: typecheck rc 0 (`b-round-416/precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info repo-wide, the same as round 415, so no new finding (`b-round-416/precheck-lint.log`) |
| A4 | `npx biome check` on the 5 granted test files | rc 0, no fixes (clean on B's sketch) |
| A5 | Claims at end | Differs from the planning output only in K2 (`1 ?? 5 M total 6`), K6 (doc 268 l.4) and K10 (equal to the sketch output line). K3 is 1,311 rc 0, K4 rc 0, K2b 0, K5 `no` (already applied) |
| A6 | `code-reviewer` on the diff and doc 268 (6 files) | No Critical/High/Medium in the sketch logic (otherwise STOP, L11). Rulings 1–5 are not new findings. Fix doc findings in the doc |

## 5. C's acceptance
**Before hand-off:** write `c-round-417.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-416/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-417.json c-round-417/l57-check.txt`.

**Order (L59):** row 3 (mutants), then rows 4, 5 and 6 (browser), then the rest. Write `c-round-417/progress.json` after every row. Never run vitest while a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | Claims equal the A5 expectation, and **stderr is empty**. K14 lists all 7 ids with a status, none `NOT-FOUND`, which closes the C-R416-CLAIMS-K22-ARCHIVE check. Status = the 6 granted paths. Frozen 1,311 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-417.patch.txt` to a `git archive HEAD` scratch and `cmp` the 5 test files against the working tree: identical. A2's command gives 63/63. Also check that every `it()` body other than EN10, VDS3, SF11, IM24 and BW5 is unchanged: `git diff -U0` hunks touch only those five bodies, the VDS `afterEach` and the SF destructuring |
| 3 | **MUTANTS** | The scratch base must be **HEAD, with nothing applied** (unlike round 415's working-tree copy). Run `git archive HEAD \| tar -x -C /tmp/c417-scratch`, symlink `node_modules`, then `git init && git add -A && git commit`. The script applies the sketch itself and asserts the HEAD base at start (K10 EN10-window = 1). Then run `python3 -I b-round-416/mutants/run.py /tmp/c417-scratch <a copy of b-round-416 whose mutants/ is your OUT>`. The script writes logs and `summary.txt` into `<arg2>/mutants/`, so pass a copy (e.g. `c-round-417/b416copy/`, with `make-sketch.py` inside). Never write into `b-round-416/`. **Pass = the same 12 lines as B's `summary.txt`:** EN10-SLEEP600, VDS3-SLEEP200 and SF11-STALL are red on HEAD and green on the sketch (wall-clock independence); SF11-NOFLAG is green on HEAD and red on the sketch (A-R415-REVIEW-L1); BW5-FULLBUILD is red on both (the sketch by the read count 6,784,880 > 1,000; HEAD only by timing); IM24-NO-ENDSTOP is green on HEAD and red on the sketch (the end-stop is now pinned). Then add **one C-own loaded replicate:** run A2's command with 2 × `node -e "for(;;){}"` busy loops in the background: 63/63 (L37) |
| 4 | **IM24-BROWSER (the contract the test now pins)** | Real Chromium, `/studio-lab` demo, **1440×900 and 1280×720**, fresh context. Warm the page and wait for `Demo collection ready`. Place one demo clip, and add 2 markers before its end (as in `c-round-326/b-im24.json`). Press Home, then Space. Press Ctrl+Right while playing until the playhead reaches the project end. **Pass:** the transport is stopped at the project end; the next Ctrl+Right shows `No more markers after the insert marker`, the transport stays stopped, and the insert marker equals the project end. Before that next press, poll until the transport shows Stopped (Play label back, `playing=false`). The playing text can render for up to ~50 ms before the end-stop fires (c-round-326 `probe-sync-ctrlright.json`), so a press inside that window is not a regression. Take screenshots before and after the last press |
| 5 | **PLAY-STOP SMOKE** (browser, both viewports) | With a demo clip: Space plays; the position advances (≥ 1 s of wallclock ≈ ≥ 0.9 s of position, L48); Space stops and the position is frozen for 500 ms; 0 page errors (ignore the documented cloud cart/connection errors) |
| 6 | **AUTH** (fresh context, no credentials, both viewports) | Copy `c-round-416/scripts/` auth probe. Demo `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=a.mp3` without auth → 401. **BLOCKED:** the fake-bearer path (backend unavailable in the cloud) |
| 7 | **DOC** | Doc 268 l.4 is byte-exact `**სტატუსი:** Completed (C round 417 PASS)`; the 7 TEMPLATE headings are in order; its mutant block equals the 12 lines of `b-round-416/mutants/summary.txt` byte for byte; the numbers 442, 6,784,880, 1,000 and 50 ms are present with their source paths; the 6 closed ids are present; every row id it cites exists. No other doc differs from HEAD |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end; end claims equal start claims; `git diff HEAD -- app/contexts app/components app/lib/arrangement/*.ts app/lib/arrangement/__tests__/helpers` is empty; `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows) |

**Retries (rows 4–6):** a cold-server first load or a port in use is an environment problem (L38). Retry at most twice; it is never a FAIL.

**Neighbouring behaviour that could break:**
- the other 58 rows in the 5 files (row 2);
- the 25 `createWorkspaceTestEnvironment` suites and the `fake-web-audio.ts` users (frozen helpers; the gate runs the full suite);
- a leaked fake timer or `Date.now` spy into later rows of the same file. Row 2 runs the whole files; the VDS `afterEach` restores real timers, and `vi.restoreAllMocks` is already present in each file's `afterEach`;
- real playback and end-stop behaviour (rows 4–5; runtime frozen).

**Ableton conformance:** does not apply (test-only, no user-visible change). The IM24 end-stop is the existing CZABA contract. **Reference-first / `product-designer` / screen budget:** N/A (test-only).

## 6. The mutants (`b-round-416/mutants/run.py`; logs and `reasons.txt` in `b-round-416/mutants/`)
| Mutant | Site | HEAD | Sketch | Red message |
|---|---|---|---|---|
| MU-EN10-SLEEP600 | 600 ms real sleep after the Ctrl+Right | red | green | HEAD `2.8039… < 2.75` |
| MU-VDS3-SLEEP200 | 200 ms real sleep after Play | red | green | HEAD `play` never called |
| MU-SF11-STALL | `Date.now` frozen after Play | red | green | HEAD master meter stays `-inf` |
| MU-SF11-NOFLAG | `stubSetInterval: true` removed | green | red | sketch `setInterval` returned a Timeout, not 0 |
| MU-BW5-FULLBUILD | `tempo.ts` firstBar = 0, window break removed | red (timing 130 ms) | red | sketch `6784880 ≤ 1000` |
| MU-IM24-NO-ENDSTOP | `ArrangementContext.tsx` end-stop condition never true | green | red | sketch `true` to be `false` |
