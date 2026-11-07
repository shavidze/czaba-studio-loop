# Round 377: PERF-11c-iii-c1 close-out. Rulings on the round-376 STOP, one identity row, then the full C run

**Planned by:** B, at the round 376 → 377 planning, 2026-11-07 (`b-round-376.md`).

**Decisions** (`backlog.json` v341 → v342, `decisions_log_b`):
- **D-29z1250:** round 376 is not accepted. A stopped and asked for B rulings (`a-round-376.md`). C reported BLOCKED with 0 bugs and `browserVerified` false (`c-round-376.json`). Gate 376 was skipped. **Ruling 1 (TC10):** see §1.
- **D-29z1251:** **Ruling 2 (A-R376-REVIEW-M1, Medium, accepted):** new row RB-LEAF4b. **Ruling 3 (A-R376-REVIEW-M2):** Low, documented, guarded by claim K5. The reviewer's Lows L1–L3 go to `deferred_low_polish`. The Architecture note becomes `SIG-R376-THREE-ACTION-HOOKS`.
- **D-29z1252:** this round's grants, delta and C rows.
- **D-29z1253:** the order after this round.

**What this round does:** it finishes PERF-11c-iii-c1. The round-376 code (the Transport memo view, the three memo groups, the hand-off hook and the actions hook) stays exactly as A applied it.
- A adds one test row and updates doc 243.
- C then runs every row that round 376 did not run.

The user sees, hears and focuses nothing different.

**Read first:**
- `lessons.md`. A reads 10, 11, 23, 26, 28 and 58. C also reads 22, 37, 38, 48, 56, 57, 59 and 60.
- `tasks/round-376.md` (the c1 task; its §3 rows, §4 mutants and §5 neighbour risk still apply where this task does not change them).
- `b-round-376/sketch-v3-delta.patch.txt`.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a performance refactor with no visible change (the 2026-10-27 rule). **Screen budget:** nothing visible is added or removed.

## Baseline
- HEAD is `6b11be7` (gate 375 published) [K1].
- On top of HEAD is A's uncommitted round-376 work: 6 modified files and the new doc 243, 7 status lines [K2].
  - The 6 files equal the round-375 sketch: `b-round-375/sketch-files-sha256.txt`, 0 failing lines [K10].
  - Do not revert or redo any of it (policy 6).
- Protected files pass [K8]. The frozen manifest `b-round-375/r376-frozen-sha256.txt` (1,261 entries) still applies, because the grants did not grow [K9].
- REGRESSION: `regression-last.json` is 2026-11-05 [K16]. It is due at the first planning on or after 2026-11-08, so not this round.

## 1. Rulings on the round-376 STOP (L10)
| Id | A's point | Ruling | Evidence |
|---|---|---|---|
| **TC10 headroom** (INFO-A376-TC10-DESCRIBE-TIMEOUT) | A's loaded run took 3,088 ms, which A read as 62 % of the 5 s default | **No STOP condition, closed.** TC10 (l.408) sits inside the describe at `transport-centre-ui.test.tsx` l.175–471, which sets `timeout: 15_000` (l.178) [K3]. All measurements are 11–21 % of 15 s: 2,096 ms in gate 375, 2,984 ms in B's v3 covering run, 3,088 ms in A's run and 1,685 ms in C's standalone run [K4]. No grant, no timeout change | `b-round-376/claims-377-output.txt` K3, K4 |
| **A-R376-REVIEW-M1** (Medium) | No row proves the transport leaves stay still across an edit that keeps the Undo/Redo labels | **Accepted. New row RB-LEAF4b.** Scenario: toggle Master Mute twice (one constant label, `MASTER_MUTE_LABEL` [K7]). On the second toggle: `StudioWorkspace` > 0, all four leaves 0, the Edit text unchanged, `master.mute` back to false. The new mutant MU-T-UNDO-FRESH-PER-EDIT (the provider's `undo` deps gain `history`) is red **only** on RB-LEAF4b (View 1, Edit 1). RB-LEAF4 stays green, which proves the gap was real [K15] | `b-round-376/rbleaf4b-sketch.log`, `b-round-376/mutants/sketch-run/` |
| **A-R376-REVIEW-M2** | The one-frame expiry assumes synchronous commits | **Low, no guard row.** Zero `startTransition`/`useTransition`/`useDeferredValue` in ArrangementTransport, StudioWorkspace and ArrangementContext [K5]. Doc 243 records the assumption. Claim K5 is the tripwire that every later PERF task touching these files repeats | K5 |
| Reviewer Lows L1–L3 (rAF scheduled when nothing is armed; DP23 stale title; unused `event` params) | — | `deferred_low_polish`. They are sketch code, and changing it would reopen FL11 and the mutant set in a close-out round | `a-round-376.md` |
| Architecture note (three `use*Actions` hooks) | — | `SIG-R376-THREE-ACTION-HOOKS`, an input to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. Not scheduled | — |

## 0. B's pre-check on the v3 sketch (scratch = A's tree + delta; L23, L58)
| What | Result |
|---|---|
| RB-LEAF4 and RB-LEAF4b | 2 pass (`rbleaf4b-sketch.log`) |
| `render-budget` + `self-disabling-focus`, `--sequence.shuffle --sequence.seed=42` | 2 files, 41 tests pass [K14] |
| The 140 covering files (`b-round-375/covering-376.txt`) | 140 files, **2,201** tests pass (round 376: 2,200 + RB-LEAF4b); TC10 2,984 ms of 15 s [K14] |
| `npm run typecheck`; Biome on render-budget | rc 0; clean [K14] |
| Assertion counts | render-budget 181/17 → **187/18**; the other three unchanged at 530/74, 38/7 and 137/21 (`b-round-376/expect-counts-377.txt`) [K12] |
| Mutant MU-T-UNDO-FRESH-PER-EDIT | red: RB-LEAF4b only, 1 failed [K15] |
| Not re-run by B | perf and the leaf probe. The delta is test-only and changes no app file, so the round-375 sketch numbers stand (`b-round-375/perf-sketch-vs-head-json-all.txt`, `probe/leaf-sketch-376.json`) |

## 2. What A changes (grants: `b-round-376/grants-377.txt`, exactly 2 files)
1. **render-budget.test.tsx:** check `sha256sum ../tmp/studio-real-loop/b-round-376/sketch-v3-delta.patch.txt` against `sketch-v3-dispatched.sha256` (`08c162f8…`). From `store/`, run `patch -p1 < ../tmp/studio-real-loop/b-round-376/sketch-v3-delta.patch.txt`. Then `sha256sum -c ../tmp/studio-real-loop/b-round-376/sketch-v3-files-sha256.txt` must give 6/6 OK. Make no other edit to any of the six files.
2. **Doc 243** (`docs/implementation/2026/quarter-IV/243-perf-transport-leaves.md`, A's file):
   - Line 4 becomes, byte for byte, `**სტატუსი:** Completed (C round 377 PASS)`.
   - Add RB-LEAF4b and why it exists (A-R376-REVIEW-M1).
   - Add MU-T-UNDO-FRESH-PER-EDIT, with its red row taken from the log (`b-round-376/mutants/sketch-run/mutant-MU-T-UNDO-FRESH-PER-EDIT.full.log`), not from this table.
   - Add the TC10 ruling (the 15 s describe) and the M2 assumption with the K5 tripwire.
   - Keep the TEMPLATE headings in order. Loop artifacts keep their full `tmp/studio-real-loop/…` path, labelled as outside the repository.

**Must not change (neighbour risk):** everything in `tasks/round-376.md` §1 "Behaviour that must not change" and §5.

## 3. A: checks (speed rules)
- `npm run typecheck`, `npm run lint`, and `npx biome check` on render-budget.test.tsx.
- `npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx` → 18 tests pass.
- Optionally, the 140 covering files. If you run them, report any test above 50 % of **its declared timeout**: read the `describe`/`it` options first (D-29z1250).
- `code-reviewer` is not required: 2 files, one of them a doc. If you edit anything beyond the patch and the doc, that is a STOP.
- Write `a-round-377.md` as you go.

## 4. C: what to verify (full run; not an L22 short round, because the STOP clauses are ruled)
C writes `c-round-377.md` and `c-round-377.json` as it goes, with all L57 fields (`manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` = `b-round-375/mutants/` + `b-round-376/mutants/sketch-run/`, `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`). Then `python3 -I tools/l57-check.py c-round-377.json c-round-377/l57-check.txt` must exit 0. Write `c-round-377/progress.json` after every row (L59). Copies and destructive commands stay under `c-round-377/` (L60). Run perf and mutants alone (L38). Warm up the browser before timed probes (L38).

**Browser rows:** run them at 1440×900 and 1280×720, after `Demo collection ready` (L48). Compare against a HEAD copy (`6b11be7`) on another port with its own Vite `cacheDir`. **PASS means A's value equals HEAD's for the same step at both viewports**, unless the row says otherwise. **One rule: every browser row below runs fresh in round 377 at both viewports.** C's round-376 files (`c-round-376/leaf-A.json`, `recipe-A.json`, `browser.json`, `auth.json`) are reference values for comparison only, never a substitute. A cold-start timeout is environment-invalid (L38) and uses a replacement attempt.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all`; from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-375/r376-frozen-sha256.txt` and the protected check `b-round-318/protected-sha256.txt` | 7 lines (the 6 M files + doc 243); both rc 0 |
| **CLAIMS** | From the loop root: `bash b-round-376/claims-377.sh`; compare with `b-round-376/claims-377-output.txt` (before A) and `claims-377-sketch-output.txt` (v3 sketch) | K6, K10 and K12 equal the sketch output. K11 shows l.4 `C round 377 PASS` and ≥ 1 mention each of RB-LEAF4b and MU-T-UNDO-FRESH-PER-EDIT. K2 reads 7 (compare K2 on `store/` only). Every other line equals the before-A output. No `MISSING` |
| **SKETCH-EQUAL** | `sha256sum -c ../tmp/studio-real-loop/b-round-376/sketch-v3-files-sha256.txt` from `store/` | 6/6 OK |
| **ASSERT-COUNT** | `expect(` and `^\s*it\(` on the 4 test files | Equal to `b-round-376/expect-counts-377.txt`. A lower count is a Medium bug |
| **UNIT** | The 140 files of `b-round-375/covering-376.txt`; then render-budget and self-disabling-focus with `--sequence.shuffle --sequence.seed=42` | 140 files, 2,201 tests pass; shuffle 41/41. Report every test above 50 % of **its declared timeout** (describe or row option, else 5 s) |
| **MUTANTS-TREE** | On a `cp -a` copy of A's tree under `c-round-377/`, one at a time, alone: (1) `TREE=<copy> OUT=<abs>/c-round-377/mutants bash b-round-375/mutants/run-all-376.sh`; (2) `TREE=<copy> OUT=<abs>/c-round-377/mutants bash b-round-376/mutants/run-mutant-377.sh` | All 11 red. For the 10 round-376 mutants, the red ids include those in `b-round-375/mutants/mutant-<id>.log`. An extra red **RB-LEAF4b** is allowed. Any other new red id is recorded and compared before it is called a FAIL. MU-T-UNDO-FRESH-PER-EDIT is red on RB-LEAF4b. The copy's `ArrangementContext.tsx` is restored afterwards (the script prints `restored`) |
| **PERF-INTERACT** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on A's tree, alone, after a production build | Every assert passes; `zoom.1.components-per-key` 41; `zoom.30` 128; `click.components` 29; each drag `releaseComponentsMax`/`move-components-max` equals the sketch column of `b-round-375/perf-sketch-vs-head-json-all.txt`; range `move-components-max` 27 (accepted +2). A value equal to HEAD's (53/140/38) is a FAIL. A value off by one is compared with `b-round-375/perf-sketch.log` before it is called a FAIL |
| **PERF-RESOURCES** | `…/studio-lab-resources.perf.spec.ts`, alone | Passes; `res.harness.export-1-produced` passes |
| **LEAF-PROBE (browser, dev)** | `node b-round-375/probe/leaf-probe-376.mjs <A base> c-round-377/leaf-A.json` | Equal to `b-round-375/probe/leaf-sketch-376.json` at both viewports |
| **TRANSPORT-BROWSER (f) (browser)** | On A's tree and the HEAD copy: drag a time range on the Music lane; read the title and `aria-disabled` of Split, Delete and Zoom to selection; press Ctrl+L and read Loop `aria-pressed`; mute a lane and read Loop again; click Zoom to selection, then Zoom back until it is soft-disabled, and read `document.activeElement` | Every value equals HEAD; focus lands on Fit with a visible ring |
| **TRANSPORT-BROWSER (a, c) (browser)** | (a) empty project: the titles and `aria-disabled` of Undo, Redo, Split, Delete, Loop, Zoom to selection and Zoom back. (c) select the clip, Tab to Delete, press Enter: `document.activeElement` | Equal to HEAD |
| **G377-AUTH (browser)** | Fresh anonymous context, both viewports, warmed up | `/studio-lab` shows the workspace with `auth_user` null; `/studio/middle-east` shows "Sign in required" with no workspace and 0 `audio[src]`; `/api/studio-token` with no token → 401 and no token in the body. The fake bearer's 500 goes under `blocked` (backend unavailable) |
| **STUDIO-SMOKE-377 (browser)** | Add `Bass` with Enter; Play shows position ≥ 00:01.000 after 1.5 s; drag the clip by its name bar to the lane below, then Ctrl+Z (Undo title `Undo: Move to track — <lane>`); click Master Mute, then Ctrl+Z; library preview Play and Stop. **Also, for RB-LEAF4b in the browser:** click Master Mute twice and read that the Undo button's title and text after the second click equal those after the first | As stated, equal to HEAD |
| **DOCS** | Doc 243 l.4 byte for byte; TEMPLATE headings in order; every row id, mutant id and file it names exists (L26); `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits | As stated |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. List them under `"gate"` and `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if LEAF-PROBE, both TRANSPORT-BROWSER rows, G377-AUTH and STUDIO-SMOKE-377 ran at both viewports in this round. No exception. If the budget runs out, it is false and B plans the remainder (V2 rule).
- If a row cannot finish before the job limit, mark it not run with the real stop signal (L59), never PASS.

## 5. Neighbour risk
- RB-LEAF4b reads `api.current?.arrangement.master.mute` and `toggleMasterMute`. A change to the master mix label or history would show up there first, and that is intended.
- The 10 round-376 mutants now run on 18 render-budget rows instead of 17, so their red sets can grow by RB-LEAF4b. This is allowed as written above.

## 6. Order after this round (D-29z1253)
1. After C PASS, round 376+377 goes to the gate as one stage: 6 code/test files and doc 243.
2. **REGRESSION** at the first planning on or after 2026-11-08 (likely the round-378 planning).
3. PERF-11c-iii-c2: LoopBrace and MarkerRow.
4. PERF-11c-iii-d (VideoDock) and -e (Lane) wait for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING or RETRO 384.
5. Then PERF-11b, PERF-12…15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and the phase-2 entries under the skip rule.

## 7. Root notes
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING** is still open, and this is its fourth echo (`SIG-R376-THREE-ACTION-HOOKS`; `b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`). It blocks neither c1 nor c2.
- The working tree carries A's round-376 changes uncommitted. Do not reset it between rounds.

## 8. Claims (L29 + L56)
Run `bash b-round-376/claims-377.sh` from the loop root. Before-A output: `b-round-376/claims-377-output.txt`. Sketch output: `b-round-376/claims-377-sketch-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 375 published `6b11be7`; gate 376 skipped |
| K2 | status line count |
| K3 | TC10 sits inside the 15 s describe |
| K4 | TC10 times |
| K5 | 0 transition APIs on the hand-off path |
| K6 | row ids RB-LEAF4, RB-LEAF4b, FL11 |
| K7 | `MASTER_MUTE_LABEL`; the undo/redo deps lines |
| K8 | protected sha |
| K9 | frozen sha |
| K10 | v3 sketch files; round-375 sketch files |
| K11 | doc 243 l.4 and its mentions |
| K12 | expect/it counts |
| K13 | delta patch sha |
| K14 | B's v3 runs |
| K15 | M1 mutant on the sketch |
| K16 | regression date, lessons lines, archive sha |
| K17 | covering file count |
| K18 | every cited artifact exists |
