# C round 314 — PERF-5a close-out (C-R313-01 Follow-off + scroll guards; A's docs and review) — PASS

All C rows ran. Every browser row ran in Chromium (Playwright). Source unchanged by C (`c-round-314/git-status-{start,end}.txt` equal).

## SOURCE-SCOPE — PASS (`c-round-314/git-status-start.txt`, `manifests.txt`)
- 12 entries: the 11 at planning + M doc 163; doc 228 stays `??`. HEAD dfa4502.
- App code 6/6 OK. Tree manifest 3/8 OK (exactly budgets.json, instrumentation.ts, page.ts). Protected 11/11 OK. Same at the end of C's phase.
- The 3 perf files are `cmp`-equal to B's `sketch-*.txt` copies.

## CLAIMS — PASS (`c-round-314/claims-c.txt`)
Diff vs `claims-314-sketch-output.txt` only on the by-design rows: K2 `12 dfa4502`, K4 `3`, K9 round-314 l.4, K10 `3 20 41 60 92 103 115`, K19 `11`. K5–K8, K11–K18, K20–K23 equal.

## CARRY — PASS
App 6/6 OK and budgets.json OK -> round 312's 13 app rows and round 313's HARNESS-HEAD-CONTROL, MU-LIVE-BUSY0, LOAF, PK-SANITY stand without a re-run.

## Perf runs (alone, sequential, browser warm-up before each; no overlap flag in `perf-driver.status`)
Driver `c-round-314/perf-driver.sh`: harness-1 (store) 10:58–11:05, harness-2 (store) 11:05–11:11, mu-follow-scroll (`/tmp/c314m`, own cacheDir) 11:11–11:17.

| run | rc | failures | 6× clip-gain commits / release | loaf-scripts-live (loafEntries) | restart-live | idle-commits | load.script-max |
|---|---|---|---|---|---|---|---|
| harness-1 | 0 | 0 | 91,91,91 / 1,1,1 | 80,80,80 (1,1,1) | 1,1,1 | 0,0,0 | 36,0,0 |
| harness-2 | 0 | 0 | 91,91,91 / 1,1,1 | 80,80,80 (1,1,1) | 1,1,1 | 0,0,0 | 22,0,0 |
| mu-follow-scroll | 1 | 117 (expected) | — | — | — | — | — |

- Logs: 0 hits for `timeline scrolled|Follow is|nondeterministic` in both clean runs. `sequence` carries the Follow-off entry.
- **HARNESS-PASS — PASS** (2/2; release-commits and commits-per-move agree within each run).
- **ROW-EQUALITY — PASS**: C's own comparer `c-round-314/rowcmp.py` (samples of every `deterministic` row) vs `a-round-313/perf-control-headharness.json`: 164/164 equal, 0 differ, 0 extra, in both runs. §8 neighbours (`play.idle-*`, `harness.restart-live`, group/members playing rows) unchanged.
- **MU-FOLLOW-SCROLL — PASS (red as required)** (`mu-follow-scroll.diff.txt`: `setFollowOff` call removed in `runPass`; `scrollLeft += 50` after `page.mouse.up()` in `dragFader`). 117 failures = 81 "timeline scrolled during …" (12 fader labels × 6 passes = 72, plus the 3 1×-only move-latency drags × 3 = 9) + 12 "Follow is on before …" (fader.track.playing ×6, fader.group.playing ×6) + 24 "Follow is paused before …" (pan/master/clipgain/clipgain-members playing ×6). No other class; the idle-bracket string did not fire. Equals B's K13 `81 12 24 117`.
  - Caveat (already recorded by B §6): the idle bracket itself has no browser negative control.

## UNIT — PASS (scratch `/tmp/c314u`, own cacheDir)
- `report.test.ts` 34/34 (`unit.log`).
- `unit-mutants.sh` output byte-equal to `precheck-unit-mutants.txt` (`unit-mutants.txt`: 1/3/1/3/1 red, restored 34).
- C's own mutants on `timelineScrollProblem` (`c-own-mutants.txt`), restored 34 passed:
  C-MU-SCROLL-DROP-NUMBERS (message without the numbers) 3 red; C-MU-SCROLL-ONLY-FORWARD (`after <= before` = no problem; a scroll back passes) 1 red; C-MU-SCROLL-SWAP-ARGS (`after -> before` in the message) 3 red.

## FOLLOW-UI — PASS (1440×900 and 1280×720; `follow-ui-*.json|log`, `shots/follow-*`)
Real clicks, demo project, one clip added via the library Add button.
- Start: `data-follow-mode="on"`, aria-pressed true. Play: page turn after 21.9 s (0 → 588) at 1440 and 18.0 s (0 → 481) at 1280.
- One click on Follow -> `off`, aria-pressed false, status "Follow off: the view does not move by itself." scrollLeft constant for 5 s (20 samples, one value) while playing.
- Extra (doc 163 claim): Space stop -> Space play keeps `off` (verified at both viewports).
- Click again -> `on`; the view re-follows the playhead (588 -> 0 after the replay from the insert marker). Space -> stopped.
- Attempt 1 at 1440 used the Play button to "stop", which does not stop while playing (`follow-ui-1440x900-attempt1-playclick.*`); invalid probe step, re-run with Space as the harness does. Not an app finding.

## G314-AUTH — PASS (both viewports; `g314-auth.json`, `shots/lab-*`, `shots/legacy-*`)
- Attempt 1: cold-start timeout on `/studio/middle-east` (`g314-auth-attempt1-cold.log`), environment-invalid (L38), replaced after a browser warm-up of that route.
- `/studio-lab`: workspace + demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`. `/api/studio-token`: no header 401, fake bearer 500, bare 400; no token in any body. Premium auth is not bypassed.

## DOC — PASS
- Doc 163: all 5 diff hunks fall inside the 4 granted sections (L34). The pass list names the round-313 LoAF step (2) and the round-314 Follow-off step + idle bracket (6) at their real positions (spec l.684 `idleScrollLeft` before `idleStart`; l.706 `setFollowOff`). The guards paragraph matches the spec (`dragFader` reads scrollLeft before t0 and after tEnd for every drag; Follow-mode check on playing drags) and `report.ts` l.73–81. `harness.loaf-scripts-live` detail fields match spec l.611–616. LOAF2 = 6 cases, SCROLL1 = 5 cases (verified). C-R313-01 entry keeps confirmed (ruler commit, B probe) vs inferred (held-back Follow page turn) apart.
- Doc 228: l.4 byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 314 PASS)`; the 7 TEMPLATE headings in order; C-R312-01 and C-R313-01 entries; testing line names `harness.loaf-scripts-live` and the HEAD-app control.

## Findings
No new bugs.
- INFO-C314-DOC-PENDING-SENTENCE (info, origin A docs, already A's own optional Low): docs 163 and 228 still say "C-ის შემოწმება მოლოდინშია" while 228 l.4 (mandated, L28) says C round 314 PASS. Now that C passed, B may refresh the sentence; not a defect of this round.
- Note: 2 clean runs at 91/1 do not by themselves prove the confound is gone (it was timing-dependent), but the new guards make any page turn in a measured window fail loudly; MU-FOLLOW-SCROLL proves they fire.

## Ableton
Not applicable (perf-harness/test-only round; §0.4). FOLLOW-UI only confirms the existing Follow toggle works as before.

## Gate rows (not claimed)
full vitest, build, Biome, `npm run verify`, e2e smoke.

## Artifact sweep (L56/L57)
Every path cited above exists (`test -e` on 29 files + 12 shots, 0 missing); `c-round-314.json` lists them in `manifestPaths` (`missingPaths` []). `countMismatches` []: every count matches B's K-claims (K13 81/12/24/117, K17 unit mutants, K23 0 differ). Lessons C-section read: L38 (alone, own cacheDir, browser warm-up, cold-start replaced), L57 (fields) applied; L16–L25 do not apply to a harness-only round.
