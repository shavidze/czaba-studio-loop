# C round 372 — PERF-11c-ii-a (test-only status probe migration): PASS

Verdict: PASS, browserVerified/realVerified true, 0 bugs.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | 18 status lines (17 M + 1 new doc), frozen sha rc 0, protected rc 0 | c-round-372/status-start.txt, status-end.txt |
| CLAIMS | only K2 (`66ee771`, 18) and K11 (239 free) differ from sketch output, as predicted | c-round-372/claims-out.txt |
| SKETCH-EQUAL | 17 OK | sha256sum -c |
| ASSERT-COUNT | expect()/it() counts equal to HEAD in 16 files | assert-count.txt |
| MIGRATION-COMPLETE | script: 3 fields, 6 lines; tsc errors only in workspace-probe (3), StudioWorkspace (4), MarkerRow (1) = B's list | (tree removed after run) |
| UNIT | 62 files / 1153 tests pass; pending-status shuffle seed 42: 22 pass | unit.log |
| MUTANTS-TREE | MU-HELPER-EMPTY-STATUS 21 red of 56 (clean copy); MU-REVERT-ONE-PROBE adds fader-click (7) | mutants/ |
| G372-AUTH | both viewports: demo state, auth_user null; /studio/middle-east "Sign in required", 0 workspace, 0 audio[src]; token API 401 / fake 500 fail-closed | auth.json |
| STUDIO-SMOKE-372 | both viewports: Play to 00:01.483; drag to SFX, Undo title "Undo: Move to track — SFX (Ctrl+Z)", Undo returns to stems; WAV RIFF/WAVE 48 kHz 24-bit, 16 s, peak 0.217, no NaN, length consistent | smoke.json |
| DOCS | l.4 exact, 7 headings in template order, no "C round N pending" hits, no missing named files | — |

Recorded: status after move "Move to track — SFX: start 00:00.000."; after Undo "Undo: Move to track — SFX".
Notes: my first mutant run used a tree already stripped by the migration probe (C mistake, discarded); per-test timeout share not independently measured. Gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke) left to the gate.
