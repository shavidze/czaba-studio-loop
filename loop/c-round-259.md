# C round 259 — verification of C-R258-01 perf-harness fix-up

**Verdict: PASS.** browserVerified = realVerified = true. Bugs: 0. Baseline HEAD `d732d26`; app/ and the 7 protected files are unchanged.

## Rows
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE-start / -end | PASS: only the 7 granted paths (4 perf + docs 163, 168, new 194). `git diff --quiet` on app/ and the 7 protected files gives rc 0, at start and at end. | git status in this report's run |
| H-DIFF | PASS: the hunks are exactly H1–H5, with no H6. Removing `note` from both budgets files with jq `walk(del(.note))` gives byte-identical output for HEAD and the working tree, and the id lists are identical (md5). | `git diff -U0 perf/` |
| H-GREP | PASS: `grep -rn "Pause\|click = playhead" perf` has 0 hits (rc 1). | — |
| H-SIGNAL | PASS, 1440×900 and 1280×720, fresh anonymous context. After `Demo collection ready` → Add → 1 audio clip: exactly 1 exact `Play` match. `data-playing` went false → true → false. The aria-label stayed `Play`. Real audio while playing: context `running`, 1 real (non-offline) `start()`, ctx clock +0.499 s in 500 ms, 0 page errors. | `c-round-259/hsignal-auth.json`, `hsignal-playing-*.png`, `hsignal-stopped-*.png` |
| RR-PERF-259 | PASS: `npm run test:perf` ran alone, rc 0, 3/3 specs in 14.6 min. All 3 reports: complete true, failures 0, 6/6 passes, 0 aborts, 0 page errors. 124/124 assert rows PASS. `harness.audio-running` = 1 and `interact.harness.audio-running` = 1. Fader track/group/master/pan `playing.restarts` = 0 at 1× and 6×. `move-components-max` = 1 (≤ 3), per-move 0.75, `release-commits` = 1. 1 valid run, 0 replacement attempts. The run had light overlap: greps, `git diff`, one checkpoint write. No vitest, tsc, build or browser job ran. | `c-round-259/perf-run-1.log`, `latest*.json` |
| RR-PERF-ORACLE | Report only (B rules). Against c-round-225, every deterministic component row is +6 to +7, e.g. `interact.play.start-components` 87 → 94, the drag `move-components-max` rows 98 → 105 (move 100 → 106), `zoom.1` 95 → 102, click 102 → 109. Resources: DOM +7 to +8 nodes per page; studio-lab JS +8.4 kB encoded / +27 kB decoded and +1 script; home and guard +1 script each; `mem.used-ready` 5.1 → 5.3 MiB. The "kind must become wallclock" lines are the old reclass check, not deltas. This confirms B's preview INFO-B259-COMPONENT-DRIFT. | `c-round-259/oracle-interactions.txt`, `oracle-resources.txt` |
| DOC-259 | PASS: the granted sections of 163 (l.73, l.100) and 168 (l.48, l.208) describe `data-playing` + `running` + `start()` ≥ 1, with 0 "Pause". Doc 194 has the 7 TEMPLATE headings in order, l.4 is byte-exact, and the 3 cited perf specs exist. l.14 names C-R258-01, rounds 252–253 and 256, D-29z512 and all six stale hits. | grep output |
| G259-AUTH | PASS, both viewports, no credentials: `/studio-lab` shows the workspace and the demo badge, with `auth_user` null. The exact text 'Demo collection — no sign-in required' is visible, with 0 cookies (`badge.json`, `studio-lab-anon-*.png`). `/studio/middle-east` shows "Sign in required", 0 `audio[src]` and 0 audio requests. `/api/studio-token?product=middle-east&file=stem-1.wav`: no header → 401, fake Bearer → 500, never 200. | `auth-studio-product-*.png`, `api-auth.json` |
| SRW-21 mount | BLOCKED: backend unavailable in cloud (deferred_user). | — |
| Gate rows | Not claimed (vitest, typecheck, build, Biome, verify). | root gate |

## Observations for B
- Without the product/file params, `/api/studio-token` returns 400, because param validation runs before auth. With valid params it gives 401/500. This is not a bypass.
- A's reviewer info: `detail.contextRunning` now means `data-playing && running`. The naming question goes to RETRO 260. PERF-HARNESS-STRINGS-DRIFT stays a RETRO candidate.
- Invalid C-tool run: my first probe, which hooked `AudioScheduledSourceNode.prototype.start`, timed out before the demo was ready. B's unmodified probe and the harness-style per-class hook both passed. The cause is unconfirmed: `hasOwn(AudioScheduledSourceNode.prototype,'start')` is true here, so the hook was not undefined. This is not an app finding. Lesson candidate: hook `start()` per concrete class, as `instrumentation.ts` does.

## Ableton conformance
Not applicable: this was a test-harness and docs round with no user-visible behaviour change.
