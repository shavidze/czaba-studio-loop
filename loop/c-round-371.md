# C round 371 — PASS (PERF-11c-i group header leaf + playback-store hook error text)

Evidence is under `c-round-371/`; the machine-readable result is `c-round-371.json`. The L57 check exits rc 0.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS. `git status` shows exactly the 6 granted entries at the start and the end. The frozen list, the protected sha check and SKETCH-EQUAL are all rc 0. | `status-end.txt` |
| CLAIMS | PASS. The output equals the sketch output except for K2/K11, whose differences are expected (6 status lines, doc 238 present). | `claims-out.txt` |
| UNIT | PASS. 19 covering files, 366 tests. GH1–GH5, L8c and L8d exist. Shuffle seed 42: 7 of 7 pass. | `unit.log`, `unit-shuffle.log` |
| MUTANTS-TREE | PASS. All 8 mutants run on a copy under `c-round-371/`, each red on the predicted rows. | `mutants.out`, `mutants/` |
| PERF-FADER | PASS. 1 passed, `failures []`, 94 asserts. All 164 deterministic rows equal c-round-347 and B's sketch v2. The group rows read max 1, per-move 0.75, release-commits 1, restarts 0. | `perf-fader.log`, `perf-rowcmp.txt` |
| PERF-INTERACT | PASS. 1 passed, `failures []`, 95 asserts. All 189 deterministic rows equal c-round-364 and B's sketch. | `perf-interact.log`, `perf-rowcmp.txt` |
| GROUP-BEHAVIOUR (browser) | PASS at 1440×900 and 1280×720. Every behaviour field equals B's HEAD probe: solo off→on→off, member solo `mixed`→off, mute then Undo, volume 0→−0.1→0, rename "Drums" with focus returning to the name button, folded group, outside mute pressed. | `group-c.json`, `group-c-*.png` |
| GROUP-RENDERS (record) | Muting an outside lane renders the header 0 times and the wrapper 0 times (workspace 1) at both viewports. HEAD was 1/1/1. | `group-c.json` |
| G371-AUTH (browser) | PASS. An anonymous `/studio-lab` shows the demo, and `auth_user` is null. `/studio/middle-east` shows "Sign in required", with 0 workspace and 0 `audio[src]`. `/api/studio-token` returns 401. A fake bearer returns 500 fail-closed because there is no backend. Premium auth is not bypassed. | `auth.json`, `screens/` |
| STUDIO-SMOKE-371 (browser) | PASS at both viewports. The Bass add, play (position 00:01.47–00:01.48 after 1.5 s), drag to the lane below, "Undo: Move to track — SFX" and the Undo all work. The WAV export is RIFF/WAVE, 48 kHz, 24-bit stereo, 16 s, peak 0.217, declared length equal to actual, no NaN. | `smoke.json` |
| DOCS | PASS. l.4 is byte-exact, the 7 headings are in order, every test named exists, and there are 0 "C round N pending" hits. | — |

Gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke) belong to the root gate and are not claimed here.

No bugs. A's three reviewer Lows (A-R371-REVIEW-TODO-COMMENT, -SOLO-FALLBACK, -GH5-IDENTITY) are for B to decide on; they are not C findings.

Not verified: a real screen reader or a touch device. This round has no UI change.
