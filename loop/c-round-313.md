# C round 313 — PERF-5a fix-up (C-R312-01) — FAIL (A STOP; harness itself verified)

A stopped under §9 (A-PERF failed 2/2 on 6× clip-gain determinism rows). A-DOC and A-REVIEW not done.
Verdict ceiling: FAIL. C collects discriminator evidence for B.

## SOURCE-SCOPE (done)
- git status: 11 entries (expected 12 only if A had edited doc 163; it did not — STOP).
- App code 6/6 OK -> CARRY-312 valid. Head-perf: 4 FAILED (expected, sketch), instrumentation.ts OK, doc 163 OK (unchanged = A-DOC not done). Protected 11/11 OK.

## CLAIMS (done) — `c-round-313/claims-c.txt`
Equals the sketch output on K5, K6, K7, K8, K20, K23, K25; K21 11; K2 `11 dfa4502` (not 12); K4 `2` (not 1), K9 unchanged (`C round 312 PASS`), K10 `1 58 87 20 39` — all three deltas are A-DOC not done (A STOP), not a planning fault.

## G313-AUTH (PASS, both viewports) — `c-round-313/g313-auth.json`, `shots/`
Two cold-start timeouts first (dev server compile of /studio-lab, then /studio/middle-east; same as C312 attempt 1) — logs kept as `g313-auth-attempt{1,2}-*.log`. Third run: /studio-lab workspace+badge, auth_user null, 0 page errors at 1440x900 and 1280x720; /studio/middle-east "Sign in required", 0 audio[src]; /api/studio-token no header 401, fake bearer 500, bare 400, no token in any body.

## PK-SANITY (PASS) — `c-round-313/pk-sanity.json`
mainPeaksMs [], workers demo-synth + peaks.worker.ts (once), 9/9 wave shas equal identity-head.json, 0 page errors.

## LOAF (PASS) — scratch `/tmp/c313s`
- `report.test.ts` 29/29 (`c-round-313/loaf-unit.log`).
- `unit-mutants.sh` output byte-equal to `precheck-unit-mutants.txt` (`c-round-313/unit-mutants.txt`).
- C's own mutants on `injectedLoafEntries` (`c-round-313/c-own-mutants.txt`), all red, restore 29/29:
  C-MU-END-STRICT-PLUS-TOL (end `> end+1`) 1 red; C-MU-START-BOUND-IS-END (`t <= callbackEnd`) 1 red; C-MU-TOLERANCE-50 2 red; C-MU-FIRST-ONLY (`slice(0,1)`) 1 red.

## Perf runs (done, sequential, alone; browser warm-up on :5173 before; no overlap flagged in `perf-driver.status`)
Driver `c-round-313/perf-driver.sh`, order: sketch-store-1, headharness-1 (/tmp/c313h: A's app + HEAD perf files), sketch-store-2, headharness-2, mu-live-busy0 (/tmp/c313m), head-app-control (/tmp/c313hc: HEAD app + new harness). Each scratch has its own cacheDir.

## Prior tally (existing JSONs, `c-round-313/tally.py`)
| run | harness | job | 6x clip-gain commits | release |
|---|---|---|---|---|
| C312 perf-a-run1/2, perf-head | HEAD (no injection) | earlier job | 91×3 each | 1×3 |
| B312 precheck run1-3, busy0 | sketch variants | earlier job | 91×3 each | 1×3 |
| A313 perf-a-run1 | sketch | this job | 91,91,92 | 1,1,2 → FAIL |
| A313 perf-a-run2 | sketch | this job | 92,91,92 | 2,1,2 → FAIL |
| A313 control headharness | HEAD | this job | 91×3 | 1×3 |
| A313 control sketch scratch | sketch | this job | 92×3 | 2×3 (pass) |

## Results of C's 6 perf runs (`c-round-313/perf-*.json|log`)
| run | tree | failures | 6x clip-gain commits / release | live | load.script-max (loafEntries) | ready-ms | settled-ms | longtask-max |
|---|---|---|---|---|---|---|---|---|
| sketch-store-1 | store (A's tree) | 0 | 92×3 / 2×3 | 79,79,79 (1/1/1 each) | 49,48,46 (2,3,3) | 1120,1097,1031 | 1712,1657,1589 | 131,112,99 |
| sketch-store-2 | store | 0 | 92×3 / 2×3 | 80,79,79 (1/1/1 each) | 47,45,48 (2,2,2) | 977,965,980 | 1608,1629,1606 | 80,72,105 |
| headharness-1 | A's app + HEAD perf | 0 | 92×3 / 2×3 | n/a | 47,50,47 | 1038,1029,1048 | 1660,1587,1606 | — |
| headharness-2 | A's app + HEAD perf | 0 | 92×3 / 2×3 | n/a | 48,48,57 | 1005,1041,1049 | 1633,1603,1607 | — |
| mu-live-busy0 | store + busy 0 | **7** (expected) | 92×3 / 2×3 | 0,0,0 | 51,0,46 | — | — | — |
| head-app-control | HEAD app + new harness | 0 | 92×3 / 2×3 | 80,80,80 | 47,50,49 (4,4,4) | 994,999,970 | 1600,1934,1598 | 126,50,102 |

Trend vs C312 `perf-a-run1/2.json`: load.script-max there [0,51,0]/[0,0,0], here 45–49 on A's tree too, so on this runner the load window holds a script ≥45 ms in both trees; a 0 is still allowed and was seen in A's runs and in MU-BUSY0 pass 2.

### Row verdicts
- **HARNESS-PASS — PASS** (2/2, failures empty; live ≥50 with loafEntries 1, scriptCount 1 in all 6 passes; load.script-max has the loafEntries detail).
- **HARNESS-HEAD-CONTROL — PASS** (0 failures; load.script-max 47/50/49, C312 HEAD median was 32 → the new harness does not hide a real main-thread script).
- **MU-LIVE-BUSY0 — PASS (red as required):** 7 failures = `harness.loaf-scripts: no long-animation-frame entry carried script timings` ×3 + `0 … entries contain the injected callback` ×3 + `assert failed harness.loaf-scripts-live: measured median 0`. Matches K14 `3 1 7`.
- **DOC — FAIL (not done).** Doc 163 has 0 `harness.loaf-scripts-live`; doc 228 l.4 still `C round 312 PASS`. A §9 STOP, not a new defect.
- **A-REVIEW — not done.** Round cannot PASS.

## C-R313-01 (Medium) — 6× clip-gain determinism rows vary across runs on one machine; origin: pre-existing (harness contract or app behaviour, not separated), NOT the round-313 patch
- Values are 91/1 or 92/2 (commits / release-commits). Earlier job: 7/7 runs 91/1 under both harnesses. This job: **HEAD harness (no injection) 2/2 runs 92/2**, sketch 2/2 runs 92/2, A's control HEAD run 91/1, A's two store runs mixed inside one run → `nondeterministic` FAIL.
- A's own discriminator ("92/2 anywhere under the HEAD harness clears the patch") is met. Confirmed fact: the value depends on the run, not on the injected step. Hypothesis only (unproven): a timing-dependent pre-paint release commit under 6× throttle (the row note's "pre-paint commit follows when the committed value changed"). A mixed run under the HEAD harness was not observed in this sample (n=3 HEAD runs on this job).
- Effect: any run whose three 6× passes straddle the two values fails the whole spec, so A-PERF can fail at random. Steps/evidence in `c-round-313.json`.

## For B
- A's STOP was correct per §9; the new harness itself is verified (rows above, both unit and browser mutants red).
- Rule C-R313-01 (contract for the release commit, or a bounded re-run rule) as its own task/grant — changing those rows is outside round 313 §5.
- Re-dispatch A for A-DOC + A-REVIEW only; the 4 perf files and the 6 app paths need no change (sketch-equal, app 6/6 OK).
- `browserVerified`/`realVerified` true: HARNESS-PASS, PK-SANITY, G313-AUTH all ran in Chromium.

### C-R313-01 extra evidence (`c-round-313/clipgain-details.txt`, all 17 runs / 51 passes)
- Same tree + HEAD harness + this runner: 91/1 (A, 08:19) and 92/2 (C, 08:51, 09:07). So it varies across runs on one machine, not only across machines.
- Per-pass details are identical for 91/1 and 92/2 passes: endsCase `max`, valueStart 24, valueLow −13.8, valueHigh/valueMax 24, releaseComponentsMax 3. settleMs: 91 → 606–637, 92 → 628–653 (overlapping).
- So the extra release commit happens with the same recorded end value. Whether the row contract is too strict, or the clip-gain fader really commits a second time at random, is **not separated**. That is B's ruling, and the next step may be a probe of the release path (commit reasons per pass).
