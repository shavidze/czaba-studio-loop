# C round 335 — PERF-DRAG-PREVIEW c3-i (cross-lane move row in the interactions perf harness)

**Verdict: PASS.** 0 bugs. browserVerified true (PERF, CROSS-NAMES, G335-AUTH ran in real Chromium). Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS. Start and end identical. Only the allowed deltas: K2 `0d22ab9 4`, K5 `193 35`, K11 new l.4, K12 `1 1 1 7 11 3`. K17–K20 unchanged | `claims-c-start.txt`, `claims-c-end.txt` |
| SOURCE-SCOPE | PASS. 4 files, 0 untracked; `app/` and `perf/lib/` no diff; protected 11/11 OK; spec diff has 0 removed lines (DragName/dragNames untouched); 167 old budget rows equal by id and content; 26 added, all `record`, budget null, owner `PERF-DRAG-PREVIEW-c3-i` | `budget-compare.txt` |
| PERF | PASS. Production build of a scratch copy of A's tree, run alone. rc 0, `complete` true, `failures` [], 193 rows, 36/36 asserts pass. rowcmp vs c334: 121 EQUAL, 0 DIFF, 18 NEW. `drag-lane-live` and `.6x` = [1,1,1]; `hook-live` = 1 | `perf-interactions-atree.log`, `perf-rowcmp-vs-c334.txt`, `perf-results/` |
| PREMISE | PASS. cross-components-per-move 96.545 > lane 41.25 at 1x and 6x, stopped and playing. Record-only: lane `move-components-max` 101 = move's 101. All new deterministic rows identical across 3 passes (move-per-move 58.969, max 101, release-commits 1, playing move-restarts 0, release-restarts 1). Baseline for c3-ii | `lane-rows.txt` |
| MUTANT | PASS. MU-LANE-NO-CROSS on a scratch: live row [0,0,0] (+`.6x`), 12 failures naming "(a) target-lane stems non-blocked ghosts 0 at the cross read" | `mutants/MU-LANE-NO-CROSS*` |
| MUTANT-C-OWN | PASS. MU-C335-NO-BACK (back step stays on the target lane): live row [0,0,0], 24 failures naming (b) "document ghosts 1 at the back read" and (c) "after release lane stems (want music)". Scratch spec restored (`cmp`) | `mutants/MU-C335-NO-BACK*` |
| CROSS-NAMES | PASS (browser, 1440x900). A tree on :5173, HEAD via git archive on :5197 with its own Vite cacheDir: the two JSONs are equal to each other and to `b-round-334/cross-head-1440.json`. Own lane 19/19/101/19, provider not rendered; enter 101, 91 (provider rendered in the second); 4 cross moves of 87 each with the provider rendered on every one; release 93 on `music`; "Undo: Move clip" | `cross-compare.txt`, `cross-a-1440.json`, `cross-head-1440.json` |
| HARNESS-READ | PASS. Gesture, three windows (lane from `firstMove`), (a)–(d) present. Ghost reads use a double-rAF settle, not `waitForQuiet`. `setLive` is after the reset; (d) is a re-read of the clip state plus lane. The reset checks the lane. The other drags' code paths are unchanged in the diff | spec diff |
| PERF-LIB | PASS. 34/34, DC-KINDS green (scratch config outside store) | `perf-lib.log` |
| G335-AUTH | PASS at 1440x900 and 1280x720, fresh anonymous contexts. `/studio-lab` shows the workspace and demo badge with `auth_user` null. `/studio/middle-east` shows "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token`: no header 401, fake bearer 500 without a token, bare 400. Mock backend off (expected). Premium auth not bypassed | `g335-auth.json` |
| DOCS | PASS. Doc 232 l.1, l.4 (byte-exact) and l.5 per §1.3; c3-i section with the §0 numbers; 7 `## ` headings. Doc 168: hunks only at lines 25/27/29 (Pass-ის თანმიმდევრობა), 50 (Liveness-ის წესები), 111 (მეტრიკები). `drag-lane-live` hits: 3 | `git diff` |

## Notes
- Transient: the first G335-AUTH and HEAD probe attempts timed out on a cold Vite dev server (dependency optimisation); both passed when re-run warm. Not an app finding. The first auth script copy also wrote to the c334 path, but failed before writing, so no c334 file was changed.
- A's own Low `A-R335-REVIEW-WHOLE-NOTE` (notes wording of the whole window): agreed, belongs in `deferred_low_polish`.
- Pre-existing Info (A reported): the 1x `interactionSequence` text lists Ctrl+wheel before the last Space but the code runs it after. Outside this round's grant.
- Not tested: no visible change in this round, so no screenshots/screen budget apply. Ableton conformance: not applicable.
- Handoff for c3-ii: `lane-rows.txt` is the baseline; liveness row is still `record`. Convert it to assert `== 1` in c3-ii.
