# C round 501: DPG-BUTTON-CLEANUP-2 stage 2b-2 — PASS (browserVerified true)

| Row | Result | Evidence |
|---|---|---|
| C0/C14 source scope | PASS: 5 M + 2 ?? only; frozen checks 1, 2, 4 rc 0 (start and end) | c-round-501/c0.log |
| C1 rest ×3 viewports | PASS: all 9 rows equal sketch.json (±1 px) incl. shadow, radius, type, box | after2/after.json |
| C2 hover | PASS rgb(217,184,127) | after2/after.json |
| C3 focus/press | PASS: ring visible in 5 viewed crops; press opacity ≈0.90 | after2/*-focus-*.png |
| C4 busy | PASS: "Subscribing..."/"Sending...", disabled, opacity .5, pointer-events none, same bg | after2/after.json |
| C5 stack 375 | PASS: NL 343×56 below field; FD 152×48 on all 3 cards; HU 311×48 | c13.json fd375 |
| C6 contrast | PASS 8.32 / 10.28 | after2/after.json |
| C7 journey | PASS: identical to sketch-journey.out, errors [] | journey.out |
| C8 | PASS 104 hits; 41 solid; 1,1,1 `<Button` | c8.txt |
| C9 | PASS 15 files, 179/179, B2B2-0..7 present, HE5 1443 ms ≤ 2500 | covering.log |
| C10 | PASS: 25 mutants RED on exactly the expected rows | mutants.out |
| C11 | PASS (full trace, see JSON notes) | |
| C12 | PASS: no MISSING; only K2 differs (expected, dirty tree) | claims.out |
| C13 | PASS: fresh no-credential context: /studio/1 and /account/downloads show "Sign in required", no download link (only nav "Free Samples"); /studio-lab opens demo at 1440 and 1280, no console errors | c13.json, c13-*.png |

Honest caveats: first harness run FD 1440 count 0 (cold load) kept as env-invalid, replaced by after2; first mutant run lost its evidence (relative path) and was redone. HEAD-side numbers were not re-measured. Full vitest/build/verify are gate rows. No bugs; Studio audio/video/export not exercised (outside this round's scope).
