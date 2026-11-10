# C round 437: verdict PASS (browserVerified true)

Chromium via Playwright, http://127.0.0.1:5173, fresh contexts, 1440x900 and 1280x720. Evidence in `c-round-437/`.

| Row | Result |
|---|---|
| C1 scope | PASS: 13 paths (12 + doc 284); frozen 1333 rc 0; protected rc 0 |
| C2 patch identity | PASS: sketch applied to `git archive HEAD`; 12/12 files `cmp` identical |
| C3 Export states | PASS: `vis/summary.txt` IDENTICAL to B's sketch output (rest brass/text rgb(14,13,12), hover 217,184,127, pressed back to base, focus ring 0.8/2px, empty 0.4, busy 0.7 + aria-busy true, box 113x38, label 8.32:1, ring 5.45:1) |
| C4 exit link | PASS header and narrow (word 236,230,218; arrow 163,155,142 -> hover 236,230,218; boxes 70x20@12,7 / 71x20@16,16) |
| C5 lane hairline | PASS: rest transparent, hover /0.25 1px bottom -1px, drag and drag-pointer-away /0.4, released transparent, box h6; hover column only the border row changes (86,82,77); press on border row / 1px / 5px above all hit track-height and move 20 |
| C6 Detail | PASS: hover /0.25 1px top 0; column 36,33,30 / 75,73,68 / 22,20,18; box h6 |
| C7 siblings/budget | PASS: siblings Clip 2, LoopBrace 2, Library 1, Lane/Detail 0; screen counts 138/168/118/144, outside 97/124/86/101, 0 text diffs |
| C8 mutants | PASS: M1-M12 each red, sketch green rc 0 (`mutants.txt`) |
| C10 claims | PASS: differences are only those expected from applied tree (K2, K5-K10b, K6) |
| C11 doc 284 | PASS: TEMPLATE headings in order; l.4 `**სტატუსი:** Completed (C round 437 PASS)`; notes (a)-(d) present; cited tests exist |
| C12 auth | PASS: fresh anon context, auth_user null; /studio/middle-east shows Sign in required, 0 audio[src]; token API 401 (fake bearer BLOCKED: no backend) |
| C13 smoke+export | PASS: WAV 29189420 B, RIFF size consistent, PCM 24-bit 48 kHz stereo, 101.352 s, peak 1.0, 0 NaN/over-range samples, 99.8% non-zero, RMS 0.172; identical at both viewports; button returns to "Export WAV" opacity 1; Esc closes |
| C14 | PASS: scope unchanged; L57 OK |

Ableton: §6.9 split line, manual silent on hover/drag paint; recorded as CZABA's own choice, not "matches Live".

## Finding C-R437-01 (Low, pre-existing, for B)
Play pressed right after adding a clip (audio still loading) silently does nothing: data-playing=false and clock 00:00.000 for 7 s, no message; second click works, or first after ~5 s wait. Evidence `play4.json`, `play7.mjs` run. Round 437 files are colour/class-only, so not a regression from it (not run on HEAD). Candidate for deferred_low_polish.

Limits: WAV integrity is checked from a single demo clip; export was not compared bit-for-bit with a HEAD export. The full suite/verify belong to the gate.
