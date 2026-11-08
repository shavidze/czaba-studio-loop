# Round 415: SYS-R388-FAKE-WEB-AUDIO-HELPER — one shared fake Web Audio helper for three jsdom playback suites (test-only; closes A-R388-REVIEW-L3)

**Planned by:** B, at the round 414 → 415 planning, 2026-11-08 (`b-round-414.md`). The advisor was used after orientation; `tech-lead` reviewed the design (APPROVE WITH CHANGES, all applied). The round-414 task is archived as `tasks/round-414.md` [K15].

## Read first
- `lessons.md` in full. Most relevant here: L4, L11, L12, L26, L28, L29, L30, L31, L38, L56, L57, L58, L59, L60.
- This file. Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AUDIO_ARCHITECTURE.md` (read only; no audio code changes), `AGENT_DISCOVERABLE_CODE.md` (new export), `GEORGIAN_DOCS.md`, plus `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-414/claims-415.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-414/claims-415-planning-output.txt` (stderr empty).
  - Sketch output on B's committed scratch: `b-round-414/claims-415-sketch-output.txt` (stderr empty).
  - Expected differences: `b-round-414/claims-415-planning-vs-sketch.diff` (K1 scratch commit, K5 patch already in, K7 label, K10 counts).

## Baseline: HEAD `5be9294`, clean tree
- **Gate 414** published `5be9294` to both remotes [K11]. HEAD is `5be9294…` [K1]; the tree is clean (K2 `total 0`). `context/head-sha.txt` may still show `dc536a6` (pre-gate snapshot); `git rev-parse HEAD` is the truth.
- **Frozen:** `b-round-414/r415-frozen-sha256.txt`, **1,311** entries = every tracked file except the three migrated test files; `sha256sum -c` rc 0 [K3]. Frozen includes all runtime (`app/contexts/ArrangementContext.tsx`, `app/lib/arrangement/graph.client.ts`, `meter.ts`), `helpers/workspace-test-environment.ts` and `apply-schedule-rollback.test.ts`.
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged and none is granted [K4].
- **Pending root work:** none (no `cloud/root-commits/` folder; last commit `5be9294`). If K1 at A1 is not `5be9294`, A re-runs the claims; A STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 414 passed** (C PASS, `browserVerified` true, 0 bugs; gate 414 published). SYS-R2-FAKE-FIDELITY is done (D-29z1441).
- **Next in the recorded order (D-29z1438): SYS-R388-FAKE-WEB-AUDIO-HELPER.** Root cause (SIG-R388): every playback-bug round (385–388) copied its own fake Web Audio graph. Today three jsdom suites each declare their own `FakeParam/FakeNode/FakeGain/FakePanner/FakeSource/FakeAudioContext/FakeOfflineAudioContext/FakeAudioBuffer` (+ metered variants, rAF capture, `runFrames`, a `setInterval` stub) [K10: 3 copies].
- **Open Criticals/Highs:** none. Open Mediums are root-only, manual-only or `awaiting_user`.
- **Schedule:** REGRESSION-2026-11-10 is not due [K13]. RETRO is round 416.

## 1. Rulings (B, D-29z1442)
1. **Scope = three jsdom suites:** `schedule-failure-ui.test.tsx` (SF1–SF11), `master-hold-tick.test.tsx` (HT1–HT3), `decoded-buffer-eviction-ui.test.tsx` (EV1–EV25, 35 rows).
2. **`apply-schedule-rollback.test.ts` stays out** (deviation from SIG-R388's four-file list). Its `Recording*` classes implement the typed `ScheduleAudioContext<string>` interfaces with no globals, string buffers, disconnect counters and owner-driven `throwOnStart`/`stopThrows`; merging would change AR1–AR5's meaning (`tech-lead` agrees). It is frozen.
3. **`createWorkspaceTestEnvironment` (25 suites) is untouched.** The new helper returns the same names (`fakeClock`, `FakeAudioContext`, `FakeOfflineAudioContext`, `FakeAudioBuffer`, `FakeResizeObserver`) so a later one-line delegation is possible; recorded as signal SIG-R415-WORKSPACE-ENV-CONVERGENCE, not scheduled.
4. **The wall clock stays.** `currentTime` still follows `Date.now()`; that is SYS-CLOCK-DETERMINISM. A-R388-REVIEW-L4 (SF11 real-clock wait) is handed to it and is **not** closed here.
5. **A-R388-REVIEW-L3 closes on C PASS:** `install({ stubSetInterval: true })` throws unless `window.setInterval` is the stub (`Object.is`). B's mutants show why: removing the stub alone turns SF11 red through the guard; removing stub and guard leaves SF11 green (the interval pump then triggers the failure), which is exactly the old unasserted dependency.
6. **Faithful defaults (tech-lead):** `metered`, `captureFrames`, `stubSetInterval`, `resizeObserver` all default off, because `ArrangementContext.tsx` feature-detects metering by `typeof ctx.createAnalyser/createChannelSplitter` [K9]. The clock lead is per suite: SF passes `clockLeadSeconds: 5` (HEAD: `base = now - 5`), HT and EV use 0 (HEAD: `base = now`). `install()` resets every state field (frames, sources, start-failure counters, meter signal, clock), so no field can leak between the two SF describes.
7. **Superset is inert for the migrated rows (tech-lead read):** `FakeParam.setValueAtTime/linearRampToValueAtTime` are no-ops called through `?.()` in `graph.client.ts` [K9]; no suite reads `.outputs` (HT's unused `outputs` tracking is dropped); `started/stops` and the start-failure hook act only when armed.
8. **Owned-file Lows stay deferred:** A-R388-REVIEW-L1 (resync branch row) and A-R388-REVIEW-L2 (SF11 track hold) are not fixed here even though this round owns `schedule-failure-ui.test.tsx`: the byte-identical `it()` contract wins over the cheap-Low clause.

## 2. What A changes (sketch `b-round-414/sketch-415.patch.txt`, sha256 `2d04d6eb73025527…` [K12])
1. **A1:** run the claims at start.
2. From `store/`: `git apply --check ../tmp/studio-real-loop/b-round-414/sketch-415.patch.txt`, then `git apply` the same file. **Do not edit the four files afterwards.** A Medium+ in the sketch logic is a STOP (L11), not an edit.
   - New `app/lib/arrangement/__tests__/helpers/fake-web-audio.ts`: `createFakeWebAudio()` with per-call state (`fakeClock`, `meterSignal`, `startFailure`, `frames`, `createdSources`), the fake classes, `MeteredAudioContext`, `armStartFailure`, `install(options)` and `runFrames(count = 1)`. B's copy: `b-round-414/fake-web-audio.ts.txt`.
   - The three suites drop their local fakes and call `install(...)` in `beforeEach`; `afterEach` (`vi.unstubAllGlobals`, `vi.restoreAllMocks`), error listeners, HT's `HTMLMediaElement` spies and EV's `vi.mock`s stay in the suites.
   - **Every `it(...)` block is byte-identical to HEAD** (K7, `b-round-414/it-bodies.py`; HEAD hashes in `it-bodies-head.txt`): 11 + 3 + 35 rows, plus AR's 5 in the frozen file.
3. **Doc:** new `docs/implementation/2026/quarter-IV/267-sys-fake-web-audio-helper.md` (267 is the next free number [K6]), Georgian with English technical terms:
   - l.4 exactly `**სტატუსი:** Completed (C round 415 PASS)` (L28);
   - TEMPLATE's 7 `## ` headings in order (L26);
   - content: rulings 1–8, the helper API and options with their defaults, the 3 migrated suites and the excluded one with its reason, the hand-off of A-R388-REVIEW-L4 to SYS-CLOCK-DETERMINISM;
   - a mutant block of all 14 lines of `b-round-414/mutants/summary.txt` (11 `MU-415-` lines, 2 PRISTINE lines, 1 SCRATCH-STATUS line) copied byte for byte;
   - it cites only rows and files that exist (L26).
4. Write `a-round-415.md` as you go: changed files, each check with rc and log path (`a-round-415/`), reviewer findings, a For B section with any Architecture note.

## 3. Grants (`b-round-414/grants-415.txt`, 5 paths)
- `app/lib/arrangement/__tests__/helpers/fake-web-audio.ts` (new, sketch only)
- `app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/master-hold-tick.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx` (sketch only)
- `docs/implementation/2026/quarter-IV/267-sys-fake-web-audio-helper.md` (new, whole)
- **Nothing else:** no runtime, protected, auth, route, component, config, package or `public/` file. At the end `git status --short --untracked-files=all` shows 3 ` M` and 2 `??` lines.

## 4. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-414/claims-415.sh` at start | Equals `claims-415-planning-output.txt`; stderr empty |
| A2 | `npx vitest run app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx app/lib/arrangement/__tests__/master-hold-tick.test.tsx app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx app/lib/arrangement/__tests__/apply-schedule-rollback.test.ts` | rc 0; **4 files, 54/54** (11 + 3 + 35 + 5; same as HEAD). Report per-file durations (B's scratch: SF 1.08 s, HT 0.98 s, EV 1.46 s; slowest row SF11 0.64 s of the 5 s default — L31 headroom; gate 414 file totals 1.23 s / 1.05 s / 2.67 s) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each; lint 205 warnings and 1 info repo-wide, measured on B's sketch scratch (same as round 414), so no new finding |
| A4 | `npx biome check` on the 4 granted code paths | rc 0, no fixes (Biome covers `app/**`, L30) |
| A5 | Claims at end | Differs from `claims-415-planning-output.txt` only as in `claims-415-planning-vs-sketch.diff` except K1 (stays `5be9294`, the real HEAD) and K2 (`2 ?? 3 M total 5`), K6 (doc 267 l.4). K3 1,311 rc 0, K4 rc 0, K2b 0, K7 `yes`, K10 `fake-copies 0 helper-users 3 workspace-env-users 25` |
| A6 | `code-reviewer` on the diff and doc 267 (3+ files) | No Critical/High/Medium in the sketch logic (else STOP, L11). Findings ruled here (rulings 1–8) are not new. Doc findings are fixed in the doc |

## 5. C's acceptance
**Before hand-off:** write `c-round-415.json` with **all L57 fields**, including `mutantRedOnSketch` = `b-round-414/mutants/summary.txt`, `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`; then `python3 -I tools/l57-check.py c-round-415.json c-round-415/l57-check.txt`.

**Order (L59):** row 4 (mutants), then rows 5 and 6 (browser), then the rest. Write `c-round-415/progress.json` after every row. Never run vitest while a browser probe runs (L38). Warm `/studio-lab` in a browser first.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the A5 expectation; status = the 5 granted paths; frozen 1,311 rc 0 (runtime, `workspace-test-environment.ts`, `apply-schedule-rollback.test.ts` included); protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply `b-round-414/sketch-415.patch.txt` to a `git archive HEAD` scratch; `cmp` its 4 code files against the working tree: identical |
| 3 | **ROWS-UNCHANGED + UNIT** | `python3 -I b-round-414/it-bodies.py <store> WORKTREE` equals `b-round-414/it-bodies-head.txt` and `… <store> HEAD` (fresh run on HEAD); A2's command 54/54. C's own row, not a gate row |
| 4 | **MUTANTS** | Committed scratch copy of the working tree at `/tmp/c415-scratch` (`git init && git add -A && git commit`, `node_modules` symlinked); `S=/tmp/c415-scratch OUT=<loop>/c-round-415/mutants python3 -I b-round-414/mutants/run.py`. **Pass = equal to B's `summary.txt`:** 8 mutants RED with `expected-rows-red True` (START-NO-FAIL, SOURCES-UNRECORDED, STOP-UNCOUNTED, ANALYSER-SILENT, NO-SETINTERVAL-STUB, METERED-IGNORED, FRAMES-NOT-RUN, RESET-LEAK) with the same failed-row lists; CLOCK-LEAD-IGNORED, CONTROL-METERED-ALWAYS and GUARD-AND-STUB-REMOVED GREEN (by design, see ruling 5 and §6); PRISTINE before/after rc 0 `failed []` 49 tests; `SCRATCH-STATUS 0 lines`. Never use another `OUT` |
| 5 | **METER-PLAY-STOP** (real Chromium, `/studio-lab` demo, **1440×900 and 1280×720**, fresh context) | The runtime is unchanged, so this is the no-regression browser half for the behaviour HT/SF pin. If the demo project opens empty, place one demo clip (library Enter or drag); otherwise use an existing clip. Press Play (Space), wait ≥ 1 s: `[data-testid=arrangement-master-meter]` `data-level-db` is not `-inf` at least once in 10 samples 100 ms apart, and `data-hold-db` is not `-inf` and the hold layer (the meter's last child) has a bounding box width > 0. Press Space again (Stop): within 500 ms `data-level-db` and `data-hold-db` are `-inf` and every `[data-testid=arrangement-track-meter]` `data-level-db` is `-inf`. 0 page errors (ignore the documented cloud cart/connection errors). Screenshots playing and stopped per viewport |
| 6 | **AUTH** (fresh context, no credentials, both viewports) | Copy `c-round-414/auth-probe.mjs` (or `c-round-413/`). Demo `/studio-lab` opens with `auth_user` null and no "Sign in required"; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=a.mp3` without auth → 401. **BLOCKED:** fake-bearer path (backend unavailable in the cloud) |
| 7 | **DOC** | Doc 267 l.4 byte-exact `**სტატუსი:** Completed (C round 415 PASS)`; 7 TEMPLATE headings in order; its block equals the 14 lines of `b-round-414/mutants/summary.txt` byte for byte (11 `MU-415-` lines); rulings 1–8 present; every row id it cites (SF*, HT*, EV*, AR*) exists. Sweeps: `grep -rn 'C round [0-9]* pending' docs/implementation` → 0; `grep -rln 'In Progress (stage' docs/implementation \| wc -l` → 7. No other doc differs from HEAD |
| 8 | **SOURCE-SCOPE end + L57** | As row 1 at the end; end claims equal start claims; `git diff HEAD -- app/contexts app/lib/arrangement/*.ts app/components` empty; `tools/l57-check.py` OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows) |

**Retries (rows 5, 6):** a cold-server first load or a port in use is an environment problem (L38): retry at most twice; never a FAIL.

**Neighbouring behaviour that could break:** the 49 migrated rows (row 3), AR1–AR5 (frozen, row 3), the 25 `createWorkspaceTestEnvironment` suites (frozen helper; gate full suite), real metering/playback (row 5, runtime frozen).

**Ableton conformance:** does not apply (test-only, no user-visible change). **Reference-first / `product-designer` / screen budget:** N/A (test-only).

## 6. For C: the mutants (`b-round-414/mutants/run.py`, all on the helper)
| Mutant | Site | Red rows on the sketch |
|---|---|---|
| MU-415-START-NO-FAIL | `start()` failure hook never fires | SF1–SF11 |
| MU-415-SOURCES-UNRECORDED | `createBufferSource` does not record | SF2, SF10, EV3 |
| MU-415-STOP-UNCOUNTED | `stop()` does not count | SF1–SF11 |
| MU-415-ANALYSER-SILENT | analyser ignores `meterSignal` | HT1–HT3, SF11 |
| MU-415-NO-SETINTERVAL-STUB | stub removed, guard kept | SF11 (guard throws) |
| MU-415-METERED-IGNORED | `metered` ignored | HT1–HT3, SF11 |
| MU-415-FRAMES-NOT-RUN | `runFrames` drains nothing | HT1–HT3, SF11 |
| MU-415-RESET-LEAK | `install` keeps `startFailure.thrown` | SF2–SF11 |
| MU-415-CLOCK-LEAD-IGNORED | lead 5 s → 0 | none: green (the lead is HEAD-faithful but not load-bearing; recorded, not a gap this round) |
| MU-415-CONTROL-METERED-ALWAYS | always metered | none: control (flag does not affect unmetered suites) |
| MU-415-GUARD-AND-STUB-REMOVED | stub and guard removed | none: shows the A-R388-REVIEW-L3 dependency the guard now asserts |
