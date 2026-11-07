# C round 386: PASS (browserVerified true, 0 bugs)
Evidence in `c-round-386/` (progress.json, *.json, *.png, mutants/, auth-smoke.json, export-wav.json).

| Row | Result |
|---|---|
| SOURCE-SCOPE | 5 M + doc 249; frozen rc 0, protected rc 0 (start and end) |
| CLAIMS | claims-386.sh diff only where the patch changes lines; 0 MISSING; K9 22 EV / 2 PW / 8 new names |
| PATCH-EQUAL | concatenated diff vs 7295618 `cmp` identical to sketch-386.patch.txt |
| UNIT | 34 files, 633 tests pass; EV11x2, EV12, EV13x2, EV14, EV15, PW20 present |
| MUTANTS | 7/7 red (CLICK-STOP EV13; LOAD-PATH EV15; NO-CATCH EV11/15/PW20; OWNER-GUARD EV12; REPLAY-STATUS EV11; UNSTABLE EV11/13/14+; VIDEO-PATH PW20); restored |
| BROWSER-M1 1440/1280 | thrown 1, errors [], clock frozen (1.683/1.683; 1.651/1.651), scheduleFailed shown, replay "Playing from", failed text gone |
| BROWSER-M1-MUTANT (record) | NO-CATCH: 1 pageerror, clock running |
| BROWSER-L2-OK both | clock 1.050→1.201 during decode, previewStarted, settle frozen, errors [] |
| BROWSER-L2-FAIL both | decodeFailed 1, not started, timeline keeps playing (1.52→2.32), failText exact, errors [] |
| BROWSER-JOIN both | longSourceStarted [101.35], clock advances, errors [] |
| G386-AUTH both | auth_user null, "Sign in required", 0 audio[src], token 401 without token. Fake bearer: blocked (backend) |
| STUDIO-SMOKE both | Enter adds clip, play 1.46s, stop frozen, export dialog opens, Esc closes |
| EXPORT-WAV | 24-bit/48k stereo, 1,536,000 frames = 32 s, 0 NaN, 99.98% non-zero, peak 0.297 |
| DOCS | l.4 exact; 0 "pending" hits |

Gate rows (verify/full suite/build) not claimed. Two cold-start crashes (first M1 run, first mutant-server run) were environment and were retried.
