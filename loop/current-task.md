# Round 372: PERF-11c-ii-a. Tests read committed status through one helper (test-only preparation for moving status out of the workspace context)

**Planned by:** B, at the round 371 → 372 planning, 2026-11-06 (`b-round-371.md`).

**Decisions** (`backlog.json` v336 → v337, `decisions_log_b`):
- **D-29z1227:** round 371 (PERF-11c-i) is accepted from C's evidence (`c-round-371.json` PASS, `browserVerified` and `realVerified` true, 0 bugs). Gate 371 published `66ee771`, which is the new baseline.
- **D-29z1228:** the round-371 reviewer Lows are deferred, and its architecture notes are recorded as signals, not scheduled.
- **D-29z1229:** PERF-11c-ii is split into two stages:
  - **11c-ii-a (this round), test-only:** every test that reads `status`/`statusSequence`/`statusKey` goes through one helper.
  - **11c-ii-b (round 373):** the committed status leaves `ArrangementContextValue` for the status store; only the helper body and the app readers change.
  - A feature-boundary checkpoint request is filed with root (non-blocking).
- **D-29z1230:** this task, and the order after it (§6).

**Why split:** removing the three fields from the context value breaks 34 test files plus 2 app files at HEAD [K6]. Of those test files, 18 already read through the shared `useWorkspaceProbe`; 16 read through a local `api.current = useArrangement()`-style probe. Doing the migration first means:
- round 373's behaviour change touches one helper instead of 34 test files;
- C can prove, by compiler, that no test reads status off the context value any more (row MIGRATION-COMPLETE).

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28 and 58. C also reads 22, 29, 56, 57, 59 and 60.
- `b-round-371/sketch.patch.txt` (the dispatched sketch) and `b-round-371/sketch-review.md`.
- Primitives:
  - `AGENT_DISCOVERABLE_CODE.md` (new test-helper exports);
  - `REACT_CONTEXT.md` (context consumers);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§8).

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a test-only preparation round: no app code, no visible change.
**Screen budget:** nothing visible is added or removed.

## Baseline
- HEAD is `66ee771`, published by gate 371 [K1]. The tree is clean [K2].
- Protected files: all pass their sha check [K10].
- Frozen: every tracked file except the grants below is listed in `b-round-371/r372-frozen-sha256.txt` (1,246 entries) [K12].
- `regression-last.json` is 2026-11-05 [K20], so REGRESSION is due at the first planning on or after 2026-11-08, not now.
- **Today, at HEAD:**
  - `ArrangementContextValue` carries `status`, `statusSequence` and `statusKey`, set by the provider's status reducer [K9].
  - In app code, only StudioWorkspace and ArrangementMarkerRow read them [K8].
  - The shared test probe `helpers/workspace-probe.ts` spreads `useArrangement()` [K4], and 46 test files import it [K5].
  - 13 of the 16 granted test files assign `api.current = useArrangement();` [K3]. The other three use a spread probe: all-lane-clipboard, self-disabling-focus (`{ ...useArrangement(), range }`) and gesture-guard (`{ ...useArrangement(), clipLaneDrag }`).
  - Removing the three fields breaks 36 files with 241 errors [K6].
  - `range-store.test.tsx` RS4 counts the renders of `useArrangement()` consumers [K23]. The sketch adds no subscription, so RS4 stays as it is.

## 0. B's pre-check (L23, L30, L31, L58)
| What | Command | Result |
|---|---|---|
| Sketch typecheck, Biome | `npx tsc --noEmit -p .`; `npx biome check` on the 17 files | rc 0, rc 0 [K16] |
| Full suite on the sketch (L23) | `npx vitest run` | 252 files and 3,703 tests pass, the same totals as HEAD. All 16 migrated files pass (`b-round-371/migrated-pass.txt`) [K15] |
| Assertion counts | `expect(` and `it(` per file, HEAD vs sketch | equal in all 17 files [K14] |
| Completeness on the sketch | `remove-status-fields.py` on a copy, then tsc | errors only in `helpers/workspace-probe.ts` (3, the `useWorkspaceStatus` body), StudioWorkspace (4) and ArrangementMarkerRow (1) [K7] |
| MU-HELPER-EMPTY-STATUS | the helper returns `''` for status | 21 tests red across pending-status, failed-source-refusal and fader-click (`b-round-371/mutants-MU-HELPER-EMPTY-STATUS.log`) |
| MU-REVERT-ONE-PROBE | fader-click.test.tsx restored to HEAD, then the completeness probe | the completeness list gains fader-click (7) (`b-round-371/mutant-MU-REVERT-ONE-PROBE-files.txt`) |
| Timeout headroom (L31) | the slowest covering test in `precheck-full.log` | CP12d 8,233 ms of a declared 30,000 ms (27 %) [K24] |
| Other roots (L30) | `perf/`, `e2e/` | not touched |
| Consults | `tech-lead` (sketch review), `performance-optimizer` | Sketch correct and complete, split sound; 1 Medium ruled (§0 full-suite evidence). Round-373 inputs recorded. Correction: `interact.play.start-components` is 11 at HEAD, not 28 (`sketch-review.md`) |

## 1. What A changes (grants: exactly these files)
A applies `b-round-371/sketch.patch.txt` with `patch -p1` from `store/`, after checking its sha256 against `b-round-371/sketch-dispatched.sha256` [K18]. A makes no other edit to these 17 files (row SKETCH-EQUAL).
1. **`app/lib/arrangement/__tests__/helpers/workspace-probe.ts`:**
   - new `interface WorkspaceStatusValue { status; statusSequence; statusKey }`;
   - new `type WorkspaceStatusProbeValue = ArrangementContextValue & WorkspaceStatusValue`;
   - new `useWorkspaceStatus()`: today it reads the three fields from `useArrangement()`;
   - new `useWorkspaceStatusProbe()` = `{ ...useArrangement(), ...useWorkspaceStatus() }`;
   - `useWorkspaceProbe()` spreads `useWorkspaceStatusProbe()`, and `WorkspaceProbeValue` extends `WorkspaceStatusProbeValue`.
2. **The 16 test files under `app/lib/arrangement/__tests__/`:**
   - `all-lane-clipboard.test.tsx`;
   - `context-hygiene.test.tsx`;
   - `fader-click.test.tsx`;
   - `fader-focus-order.test.tsx`;
   - `failed-source-refusal.test.tsx`;
   - `follow-remount-ui.test.tsx`;
   - `gesture-guard.test.tsx`;
   - `grid-adaptive-ui.test.tsx`;
   - `library-preview.test.tsx`;
   - `pan-release-recovery.test.tsx`;
   - `pending-status.test.tsx`;
   - `range-store.test.tsx`;
   - `self-disabling-focus.test.tsx`;
   - `tempo-seed-ui.test.tsx`;
   - `video-import-status-ui.test.tsx`;
   - `workspace-session-remount-ui.test.tsx`.

   In each file:
   - the local probe (`api.current = …`, `renderHook(() => …)`, or the spread probe) calls `useWorkspaceStatusProbe()` instead of `useArrangement()`;
   - `ArrangementContextValue` becomes `WorkspaceStatusProbeValue`;
   - imports that become unused are removed (Biome).

   No assertion, test name, setup or timing changes.
3. **`docs/implementation/2026/quarter-IV/239-perf-status-probe-migration.md` (new; 239 is free [K11]):**
   - Georgian, with the TEMPLATE headings (L26);
   - l.4 exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 372 PASS)`;
   - it records the split, §0's completeness numbers (36 → 3 files), the two mutants, and round 373's plan (one sentence per input in `sketch-review.md`);
   - it names only tests and files that exist.

**Ruling lines (L4):**
- "No assertion lost" wins. Equal or stronger replacements are allowed, but this sketch has none: per-file `expect(`/`it(` counts are equal (row ASSERT-COUNT).
- The app files and `ArrangementContext.tsx` are **not** granted. If A finds a reason to touch them, that is a STOP (L11).

**Behaviour that must not change (neighbour risk):** every test result. The app does not change at all, so the Studio's behaviour cannot change. The browser rows only confirm that the gate's tree still serves the Studio and the auth guard.

## 2. A: checks (speed rules)
- Run `npm run typecheck` and `npm run lint`.
- Run `npx biome check` on the 17 files.
- Run `npx vitest run` on the 62 covering files in `b-round-371/covering-372.txt`: the 16 migrated files plus every test file that imports `helpers/workspace-probe`. Pass them with `xargs` from `store/`.
- Ask the code-reviewer once (17 files change), and send any later edit back to it (L11).
- A STOP takes the L11 form: a red covering file, a test above 50 % of its declared timeout, or a sketch hunk that does not apply.

## 3. C: what to verify
C writes `c-round-372.md` and `c-round-372.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` for every finding;
- `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (= `b-round-371/`), `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-372.json c-round-372/l57-check.txt` must exit 0. Write `c-round-372/progress.json` after every row (L59). Destructive commands stay under `c-round-372/` (L60).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all` lists only the §1 files (17 modified, 1 new doc = 18 lines). From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-371/r372-frozen-sha256.txt` gives rc 0. The protected sha check (`b-round-318/protected-sha256.txt`) gives rc 0 | Nothing outside the grants changed; no app file changed |
| **CLAIMS** | `bash b-round-371/claims-372.sh` from the loop root first (L56). Compare with `b-round-371/claims-372-output.txt` (HEAD) and `b-round-371/claims-372-sketch-output.txt` (the sketch) | K3, K4, K5 and K13 equal the sketch output (K3 0; K4 `1 … exported: 1`; K5 `46 … 16`; K13 0 failing lines). K2 reads `66ee771 status-lines: 18`. K11 reads `doc 239 free: 1 last: 239-perf-status-probe-migration.md`. Every other line equals the HEAD output, K12 reads 0 failing lines, and there is no `MISSING` |
| **SKETCH-EQUAL** | From `store/`: `sha256sum -c ../tmp/studio-real-loop/b-round-371/sketch-files-sha256.txt` | rc 0, all 17 OK |
| **ASSERT-COUNT** | For each of the 16 test files: the `expect(` count and the `^\s*(it\|test)\(` count on A's tree vs `git show HEAD:<file>` | Equal in every file (B: `b-round-371/expect-counts.txt`). A lower count is a Medium bug ("a test whose only change is removing an assertion") |
| **MIGRATION-COMPLETE** | Copy A's tree under `c-round-372/tree` (with `node_modules` linked, never in `store/`). Run `python3 -I b-round-371/remove-status-fields.py <copy>`, then `npx tsc --noEmit -p .` in the copy | The script prints `removed interface fields: 3, value shorthand lines: 6`. The tsc error files are exactly `helpers/workspace-probe.ts` (3), `StudioWorkspace.tsx` (4) and `ArrangementMarkerRow.tsx` (1), equal to `b-round-371/tsc-sketch-removed-files.txt` |
| **UNIT** | The 62 covering files of `b-round-371/covering-372.txt`, plus `pending-status.test.tsx` with `--sequence.shuffle --sequence.seed=42` | All pass. No covering test above 50 % of its declared timeout |
| **MUTANTS-TREE** | On copies under `c-round-372/` (L60): (1) MU-HELPER-EMPTY-STATUS: in the copy's `helpers/workspace-probe.ts` replace `return { status, statusSequence, statusKey };` with `return { status: status.length > 0 ? '' : status, statusSequence, statusKey };`, then run pending-status, failed-source-refusal and fader-click. (2) MU-REVERT-ONE-PROBE: restore `fader-click.test.tsx` from `git show HEAD:`, then run the MIGRATION-COMPLETE probe | (1) 21 tests red, as in `b-round-371/mutants-MU-HELPER-EMPTY-STATUS.log` (FS1–FS8, S1… rows). (2) The error list gains `fader-click.test.tsx` (7). Record both as `mutantRedOnTree` |
| **G372-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720. Warm up first (L38) | `/studio-lab` shows the workspace and the demo state, and `localStorage.auth_user` is null. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `/api/studio-token` returns 401 with no token (a fake bearer: 403 with the mock, else a fail-closed 500 under `blocked`). No token appears in any body |
| **STUDIO-SMOKE-372 (browser)** | After `Demo collection ready` (L48), at both viewports: <ul><li>add `Bass` with Enter;</li><li>Play: the position is ≥ 00:01.000 after 1.5 s;</li><li>drag the clip by its name bar to the lane below, then Ctrl+Z (the Undo title reads "Undo: Move to track — <lane>");</li><li>export a WAV</li></ul> | As stated. The WAV is RIFF/WAVE, 48 kHz, with peak > 0. Record (not a FAIL criterion): the status-line text after the move and after the Undo. The app is byte-identical to HEAD, so the expectation is equal to HEAD |
| **DOCS** | Doc 239: l.4 byte for byte (§1 item 3); the TEMPLATE headings as an in-order subsequence; every test and file it names exists (L26). `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits | As stated |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if G372-AUTH and STUDIO-SMOKE-372 ran at both viewports.
- **No perf spec this round.** The app does not change, so no perf row can move.

## 4. Rows (no new test rows; existing rows are the asserts)
| Row | Asserts | Mutant that turns it red |
|---|---|---|
| MIGRATION-COMPLETE | no test file reads committed status off `ArrangementContextValue` | MU-REVERT-ONE-PROBE |
| FS1–FS8, S1, S2, S3, S1-same-act … (existing) | read status through the helper and still pass | MU-HELPER-EMPTY-STATUS (21 red) |
| RS4 (existing) | the probe adds no `useArrangement()` subscription in this round | — (round 373 watches it) |

## 5. Neighbour risk
- **A probe that subscribes to more than before:** `useWorkspaceStatusProbe` calls `useArrangement()` twice in the same component. That is the same context, so there is no extra render (tech-lead). RS4 and the PV rows pass on the sketch.
- **A test that later needs status from the store (round 373):** only the helper body changes then. The round-373 inputs are in `backlog.json` under `PERF-11c-ii-b.inputs_round_372`:
  - committed-only subscription with equality;
  - RS4 / PV1–PV4 must stay equal;
  - the parent render totals may only drop;
  - the layout-effect logic moves into the store action;
  - `release-commits == 1` stays.

## 6. Order after this round (D-29z1230)
1. PERF-11c-ii-b (round 373, the status store). If the round-373 planning falls on or after 2026-11-08, REGRESSION goes first.
2. PERF-11c-iii.
3. PERF-11b, if root or Saba answers.
4. PERF-12…15, then SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
5. STEM-LANES, then SYS-1…3.
6. STORE-2b…5, then REVIEW-RECOMMENDATIONS and T12-ADVANCED.
7. The phase-2 entries, under the skip rule.

SYS-R369 runs when root answers ARCH-CHECKPOINT-PERF9-STEM-CACHE. RETRO is due at about round 384, or at the end of STUDIO-PERFORMANCE.

## 7. Root notes
- **New, non-blocking:** ARCH-CHECKPOINT-PERF11C-STATUS-STORE (`b-round-371/root-request-arch-checkpoint-status-store.md`). An answer before the round-373 planning is applied to PERF-11c-ii-b.
- The open requests are unchanged:
  - ROOT-REQ-PERF11B-FIREBASE-LAZY;
  - ARCH-CHECKPOINT-PERF9-STEM-CACHE;
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1);
  - ROOT-REQ-B-RETRO-CONSULTS.
- After C PASS, this round is ready for the gate: 17 test files and 1 doc, with no app code.

## 8. Claims (L29 + L56)
Run `bash b-round-371/claims-372.sh` from the loop root. The expected output at HEAD is `b-round-371/claims-372-output.txt`, and on the sketch it is `b-round-371/claims-372-sketch-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 371 published `66ee771` |
| K2 | HEAD and the status line count |
| K3 | the granted files with `api.current = useArrangement();` (13 at HEAD) |
| K4 | the shared probe spreads `useArrangement()`; whether `useWorkspaceStatusProbe` is exported |
| K5 | the files importing `useWorkspaceProbe` (46) and `useWorkspaceStatusProbe` (0 at HEAD) |
| K6 | HEAD with the fields removed: 36 files, 241 errors |
| K7 | the sketch with the fields removed: the helper, StudioWorkspace and MarkerRow only |
| K8 | the app readers of status off the value |
| K9 | the 3 interface fields and the 6 value lines |
| K10 | the protected sha check |
| K11 | doc 239 is free, and the last doc number |
| K12 | the frozen list check |
| K13 | the 17 granted files equal B's sketch |
| K14 | the `expect(`/`it(` counts are unchanged |
| K15 | the full suite on the sketch |
| K16 | sketch typecheck and Biome |
| K17 | every cited artifact exists |
| K18 | the sketch patch sha equals the dispatched sha |
| K19 | the lessons line count |
| K20 | the regression-last date |
| K21 | the round-371 archive sha |
| K22 | the l57 check on `c-round-371.json` |
| K23 | the RS4 row exists |
| K24 | the slowest covering test on the sketch |
