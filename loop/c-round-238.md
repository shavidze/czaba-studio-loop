# C round 238 — SABA-B-11a-FIX-3 (C-R237-01, A-R237-REVIEW-L1)

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs. Every browser row ran in real Chromium (Playwright, `@playwright/test` Chromium) on `http://127.0.0.1:5173/studio-lab` at 1440×900 and 1280×720, with a fresh context per attempt, `auth_user` null, and 0 page errors.

Env: `env-status.json` 2026-10-29T01:09:18Z, store 200. C made no change to app source. Repo `git status` was identical before and after C's work, and `ArrangementContext.tsx` still has sha `522e4a5d…0084`.

## CZABA requirement

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-238 | PASS | <ul><li>HEAD is `ecaf0e4`.</li><li>`git status` equals `b-round-237/git-status-at-planning.txt` (same 11 paths).</li><li>`sha256sum -c` on the tree list (1,098) and the root list: rc 0.</li><li>Protected files plus `.claude`, `CLAUDE.md` and root configs: `git diff --quiet HEAD` rc 0.</li><li>Against the start list, only the 3 grant files differ.</li><li>`tempo-seed-ui.test.tsx` `--no-index` diff: 0 removed lines, 121 added. The 3 start copies match the start list (sha256). Applying `b-round-237/precheck-scratch.diff` to the start copies gives a byte-identical `ArrangementContext.tsx`. The test file is B's diff plus 6 added `statusSequence` lines in TU12 and TU14 (A's reviewer-M1 deviation). That deviation is inside grant 2's appended describe, with 0 removed lines.</li><li>`ArrangementContext.tsx`: 6 removed lines, exactly the old layout-effect condition and the old 5-line release updater; 23 added (`c-round-238/context-vs-start.diff`).</li></ul> |
| C-UNIT-238 | PASS | 13 files, 232 tests, all green. The files are: the 10 named, plus refusal files `gesture-guard`, `fader-guards` and `pending-status` (`c-round-238/unit.log`). TU12–TU15 are green. |
| C-MUT-238 | PASS | C ran its own `mutants.py` on `/tmp/c238-scratch`, outside the repo: <ul><li>MU-RF: TU12 and TU13 red, TU14 and TU15 green.</li><li>MU-L1-REL: only TU15 red.</li></ul>The scratch file was restored each time, and repo status is identical before and after (`mutant-*.log`). |
| C-REFUSAL-238 | PASS | Attempt 1 is valid at both viewports. The status before the press is loading, the refusal is shown after Ctrl+Z, and the hero row reads `02:30.372` before the release.<ul><li>History 1440: loading → refusal (1291 ms) → ready (9332 ms, at release).</li><li>History 1280: 287 / 1215 / 9342 ms.</li><li>The refusal is still showing at release, so it stayed through settle.</li><li>Final status is exactly the ready text. 0 loading entries after the refusal.</li></ul>Control: `c-round-237/race-after.json` ended on loading. |
| C-REFUSAL-FAIL-238 | PASS | Hero answered 404 after the 6 s delay. While the button is still held, the status becomes exactly `1 sound in the demo collection failed to load — details are in the library.` (7423 / 7378 ms). After the release it is the same text, with no new entry. The hero row shows `Error: File failed to load (404)`. |
| C-REFUSAL-READY-238 | PASS | ready → undo refusal → exactly the ready text after the release, at both viewports. **Extra neighbour probe** (`editref.json`): with one clip, the user status as before, a held fader and Delete / Ctrl+D / Ctrl+Shift+Z: <ul><li>Delete and Ctrl+D show the edit refusal, and the clip count stays at 1.</li><li>Ctrl+Shift+Z shows the undo refusal.</li><li>After the release the status is byte-equal to the status before, at both viewports.</li></ul> |
| C-RACE-238 | PASS | Attempt 1 is valid for every mode at both viewports (`race238-race.json`): <ul><li>**delay:** placement + seed + Snap text; 0 ready entries after Add; bpm 120; snap on.</li><li>**fail:** the exact failed(1) text; bpm 120; snap on; box 16 px.</li><li>**idle:** the exact ready text, then placement + seed + Snap.</li><li>**placement:** `“Soft impact” added to the Music track at 00:00.000.`; bpm empty before and after; snap off before and after.</li></ul>No leading space in any row. |
| C-L1-238 | PASS (unit, as defined) | TU15 is green, and red on MU-L1-REL. **UI path:** C tried pressing Enter on the focused pulse library row while the fader was held (`l1probe`). The status went back from the refusal to ready 22 ms after focus moved, before the Enter add landed. This is consistent with the focus loss ending the gesture, but it is an inference from timing: the gesture state was not instrumented. No UI path was found. |
| C-SHOTS-238 | PASS | `c-round-238/shots/after-refusal-{1440x900,1280x720}.png` (this round: ready text) next to `c-round-237/shots/after-refusal-*` (before: loading). Also `after-{refusalfail,refusalready,delay,fail,idle,placement,l1probe}-*` and `out/full-*`. C-BUDGET was not re-run: no persistent element changed, only the status content. |
| AN-REVIEW-238 | PASS | Doc 185: <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 238 PASS)`.</li><li>The 7 TEMPLATE headings are in order.</li><li>It has the C-R237-01 and A-R237-REVIEW-L1 Problem → Solution bullets, both edges and the live-region note.</li><li>Every cited row id exists (grep): TU9–TU15, CR1–CR4, TS7, TQ1/TQ2, LS3/LS3b/LS6/LS7.</li></ul>Docs 182/183 match their frozen hashes. |
| C-REF-238 | PASS | §3 says "no reference found", with the round-237 search. Doc 185 keeps "Reference ვერ მოიძებნა". `backlog.json` has the ids C-R237-01, A-R237-REVIEW-L1 and A-R237-ARCH-STATUS-PARTS (as a signal, D-29z349). |
| LAB-SMOKE-238 | PASS | Space plays (pos 0.771, RMS 0.0108) and Space pauses. The export dialog exports a WAV: 48 kHz, 24-bit, stereo, 768,000 frames = 16.000 s, −24.91 dBFS, peak 0.2967, 0 NaN. The sha256 `1fea093b…3f94` is identical at both viewports and identical to round 237. 0 page errors. |
| Auth | PASS | `/studio-lab` opens anonymously, `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`. `/api/studio-token`: no header → 401; fake bearer → 500 "Unable to prepare Studio access". No bypass. |
| Purchased origin (browser) | BLOCKED | Backend unavailable in cloud. Unit coverage only: CR1, `purchased-collection-ui`. |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke. Not claimed here. |

## Ableton conformance
Not applicable / no reference found: this is CZABA's own status-line contract (task §3, doc 185). There is no claim that Live behaves the same way.

## Notes for B
- No new finding.
- MU-L1-EFF was not re-run by C (the task asked for MU-RF and MU-L1-REL only). Its result rests on A's report.
- After Ctrl+Z on a pointer-held fader, Chromium shows the focus-visible ring on that fader, because a key was pressed while it had focus. The round-237 shots show the same. This is an observation, not a finding.
- A's LRS4 timeout-headroom note (53 % of the 5 s default) still needs B's ruling. It was green in C's run.
- The reviewer's Architecture note (a shared prefix helper) adds to `A-R237-ARCH-STATUS-PARTS`.
- Per task §7, this PASS lets the gate publish rounds 237 + 238 together.

## Reproduce
- `node c-round-238/race238.cjs http://127.0.0.1:5173 <out.json> refusal,refusalfail,refusalready,l1probe after`
- `… delay,fail,idle,placement after`
- `node c-round-238/editref.cjs <base> <out.json>`
- `node c-round-238/c238.cjs <outDir> '^(smoke|auth)$'`
- `python3 c-round-238/mutants.py <scratch copy> <logdir>`
