# A round 388: the meters return to the floor after a schedule failure in the loop pump (C-R387-01)

**Result:** done, no STOP. The reviewed sketch was applied verbatim, the doc was updated, and every A check is green. Not browser-verified by A (the task does not require it); C does the browser rows.

## 1. Pre-flight (from `store/`)
- `git status --short --untracked-files=all` = the 5 round-387 lines (before and after A).
- `sha256sum -c --quiet b-round-387/r388-frozen-sha256.txt` rc 0; `b-round-318/protected-sha256.txt` rc 0.
- Sketch sha256 `494afafcf79a8aa02ded3450e39c6e47a80991dc8eea7572e5e335c002004c71` (K5 matches); `git apply --check` rc 0, then `git apply` rc 0.
- Primitives read: AUDIO_ARCHITECTURE (l.1–80), TESTING_QUALITY_GATES (l.1–60), GEORGIAN_DOCS (l.1–60). REACT_CONTEXT and BUG_HUNTING_TESTS: headings only, plus the BUG_HUNTING regression acceptance rule (a test must fail before the fix; met by MU-388). Lessons 10, 11, 26, 28, 31, 49, 52, 58 read.

## 2. Changed files (grants: 3 paths)
1. `app/contexts/ArrangementContext.tsx`: the `tick` guard after `pumpPlaybackAudio();` (l.1363–1367), patch only.
2. `app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx`: the new `describe` with SF11 and the 2 imports, patch only.
3. `docs/implementation/2026/quarter-IV/250-schedule-failure-rollback.md` (Georgian): l.4 = `**სტატუსი:** Completed (C round 388 PASS)`; a `tick` guard bullet under მიდგომა; the files list names the guard and SF11; Problem → Solution for C-R387-01; ტესტირება names SF11 (with the note that it listens only to window `error`, not to unhandled rejections), the 66 covering files, the PUMP-NO-CATCH delta and MU-388-TICK-NO-GUARD; TODO notes the D-29z1309 deferred Lows. TEMPLATE headings in order (7/7). `grep -rn 'C round [0-9]* pending' docs/implementation` = 0.

PATCH-EQUAL: `cmp` ArrangementContext.tsx and schedule-failure-ui.test.tsx against `b-round-387/sketch-files/` = same; graph.client.ts and apply-schedule-rollback.test.ts against `b-round-386/sketch-files/` = same.

## 3. Checks actually run
- `npm run typecheck`: rc 0 (`a-round-388/typecheck.log`).
- `npm run lint`: rc 0, **205 warnings** (unchanged from gate 386/round 387) (`a-round-388/lint.log`).
- Scoped Biome on the 2 code files: `Checked 2 files … No fixes applied.`
- Covering set `npx vitest run $(cat b-round-387/covering-388.txt)`: **66 files passed (66), 1,026 tests passed (1,026)** (`a-round-388/covering.log`); repeated with the JSON reporter: 1026/1026, 0 failed (`a-round-388/covering.json`).
- L31 headroom (per-test, JSON reporter; gate 386 `verify.log` time where higher):
  - SF11 0.70 s / 5 s (14 %);
  - TC10 3.05 s here, 3.97 s at gate 386 / 15 s (26 %);
  - CP12c 4.34 s here, 4.90 s at gate 386 / 30 s (16 %);
  - UM9 X1 2.43 s / 20 s (12 %). No test above 50 %.
- Mutants, on a `cp -a` copy at `a-round-388/tree` (deleted afterwards; `store/` untouched; after each run the copy's two files were `cmp`-equal to `store/`):
  - `run-mutant-388.sh`: MU-388-TICK-NO-GUARD **red on SF11** (`expected '-20.0' to be '-inf'`), `restored` printed (`a-round-388/mutants/MU-388-TICK-NO-GUARD.log`).
  - `run-mutants-387.sh`: all 15 red, every red-row set identical to the `a-round-387.md` §3 table, with the one expected delta **PUMP-NO-CATCH: SF6 and SF11**; `restored` in every log (`a-round-388/mutants/mutant-MU-387-*.log`).
  - Total **16/16 red**.
- Claims `bash b-round-387/claims-388.sh <store>` (`a-round-388/claims-388-a.txt`): K1 5312260, K2 5, K3 1, K4 `SF11 rows: 1; SF rows total: 11`, K5 match, K7 both `same`, K8 rc 0, K9 rc 0, K10 the exact l.4, K11 2/6/2 (re-checked after the L5 doc edit: unchanged), K12 `same same`.
- Not run by A (by the task): full suite, verify, build, perf, browser.

## 4. code-reviewer (actual subagent run)
Verdict: no Critical/High/Medium; 5 Lows; score 9/10. Rulings:
- **L1** (the resync-failure branch inside the pump, where `startGraphOrStop` catches and the pump's `catch` never runs, relies on the new guard; no row covers it): not fixable here, the test file is pinned byte-for-byte to the sketch (L58). **For B:** candidate SF12 or an early return in `pumpPlaybackAudio` after the resync.
- **L2** (SF11 does not assert the track meters' `data-hold-db`): same pin. For B.
- **L3** (SF11 depends on `vi.stubGlobal('setInterval')` also replacing `window.setInterval`; true under jsdom, unasserted): same pin. For B.
- **L4** (SF11 waits on the real clock, worst case about 3.2 s / 5 s, same pattern as SF6): measured 0.70 s; no action. For B as a later item.
- **L5** (the doc mixed −19.8 dB and −20.0): **fixed** in doc 250 (one clause: −20.0 is SF11's fake −20 dBFS signal, −19.8 dB is the browser observation). Doc only, no code changed after the review. Sources: −19.8 dB is `current-task.md` l.31 and `b-round-387/probe/meter-head-*.json`; −20.0 is SF11's −20 dBFS `meterSignal` and the MU-388 log (`expected '-20.0' to be '-inf'`).

**Architecture note (verbatim):**
> Signal 3 (the same region keeps getting expensive changes): rounds 385–388 have each changed the pump/tick/stop region of `/home/runner/czaba-project/store/app/contexts/ArrangementContext.tsx` (about 1235-1391: `stopPlayback`, `stopForScheduleFailure`, `startGraphOrStop`, `pumpPlaybackAudio`, `tick`). Each round needed a custom fake Web Audio setup, and this round adds a third variant in `schedule-failure-ui.test.tsx:400-458` (metered context, captured rAF, stubbed `setInterval`). Keep the runtime code where it is, because these functions share one lifecycle and the same refs (`isPlayingRef`, `frameRef`, `audioPumpTimerRef`, `meterStateRef`). Pulling them out would put audio timing and the start/stop ordering at risk (for example `frameRef === null` deciding whether a new frame is queued at 1723) without making the tests cheaper. Proposal for the planner, test side only: one bounded task to move `FakeAudioContext`, the metered variant (`createAnalyser`/`createChannelSplitter`), rAF capture with `runFrames`, and the `setInterval` stub into a shared `app/lib/arrangement/__tests__/helpers/fake-web-audio.ts`. Done when SF1–SF11 and AR1–AR5 pass unchanged on the shared helper and the playback runtime is not touched. This is a proposal, not a finding for this round. This review covers the round 388 diff, not the whole module.

This is a proposal for B/root (ARCH-CHECKPOINT-DECODE-REGION request); nothing was extracted.

## 5. A's acceptance status (only what A ran)
| Criterion | A result |
|---|---|
| Pre-flight manifests rc 0, 5 status lines | pass |
| `git apply` of the reviewed sketch, byte-equal | pass |
| typecheck rc 0; lint 205 warnings (not higher) | pass |
| Covering 66 / 1,026, no test > 50 % of its timeout | pass |
| MU-388 red on SF11; 15 round-387 mutants on their rows (+ PUMP-NO-CATCH SF6/SF11) | pass (16/16) |
| Doc 250 l.4, C-R387-01 Problem → Solution, SF11 + MU-388 named, headings in order | pass (C checks byte for byte) |
| code-reviewer, Medium+ ruled | pass (no Medium+) |
| Browser rows (METER-FLOOR/CONTROL/PLAYING, M2-FLOW, M1-NEIGHBOUR, EXPORT-EQUAL, G388-AUTH, SMOKE) | not run by A; C's |

## 6. Known gaps
- Reviewer L1–L4 above (Lows, test-file pin). L1 is the most useful: the resync-inside-pump failure route is protected by the guard but has no unit row.
- A ran no browser check; the meter floor in Chromium is B's sketch evidence plus C's rows.

## 7. Exact next C checks
Run §4 of `current-task.md` as written: SOURCE-SCOPE, CLAIMS (compare with `a-round-388/claims-388-a.txt`), PATCH-EQUAL, UNIT (all 66 files from `covering-388.txt`), MUTANTS (16 on a copy under `c-round-388/`), BROWSER-METER-FLOOR at 1440×900 and 1280×720, BROWSER-METER-CONTROL, BROWSER-METER-PLAYING, BROWSER-M2-FLOW, BROWSER-M1-NEIGHBOUR, EXPORT-EQUAL, G388-AUTH, STUDIO-SMOKE, DOCS (note the doc 250 L5 clarification line in ტესტირება).

## 8. Scope
Round 388 implemented in full. The backlog is not complete; REGRESSION-2026-11-08 is next per the task.
