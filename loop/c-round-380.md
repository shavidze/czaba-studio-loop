# C round 380 — PERF-12a verification (A's tree vs HEAD ed634d5)

**Verdict: PASS.** 0 bugs. `browserVerified` true (WAV-BYTES, CANCEL-BROWSER, MP3-BROWSER, G380-AUTH at 1440×900 and 1280×720; PERF-RES on the production build). Evidence under `c-round-380/`.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS. Start and end: 19 status lines, identical (`status-start/end.txt`), all in `grants-380.txt` (`comm` empty); frozen manifest rc 0, protected manifest rc 0 at start and end | `status-*.txt` |
| CLAIMS | PASS. Output equals the sketch output on K3, K5, K6, K8, K11 (K3/K5/K6 empty, K8 only the two dialog tests, K11 14/14); K7 lists only `export-wav-stream.test.ts`; K1 `ed634d5`; K2 = 19; K19 doc 246 present; no MISSING | `claims-output.txt` |
| SKETCH-EQUAL | PASS 14/14 (start and end) | |
| ROW-MAP | PASS. Every HEAD `it(` removed (EW4, EW5×3, EW7, IP1–IP5, EC4×5) has a listed replacement (names and counts compared against the A tree; behaviour evidenced by the 8/8 mutant map, bodies not line-read): SW1/SW2a–e/SW3/SW4/SW5/SW6/SW7 (EW8a–e re-pointed to acks; IP2 retired by ruling). No `.skip/.only`. Counts `it(`/`expect(` HEAD→A: export-wav 18/100→15/90, export-cancel 19/63→19/73, in-place 5/26→12/64, stream 0→12/93 (`counts.txt`). The fewer expects in export-wav moved with EW4/5/7 to the stream file (A's total 189→320) | `counts.txt` |
| UNIT | PASS. 32 covering files, 511/511 (`vitest-covering.json`); shuffle seed 42 on stream/wav/cancel: 46/46. Slowest test 1.58 s (`master-ui`), under 50 % of the 5 s default | `vitest-covering.*` |
| MUTANTS-UNIT | PASS 8/8, `restored`. Tree copy byte-equal to the A tree on the 4 source files. NO-CLAMP, OFFSET, PEAK-LAST, CLIPPED-LAST red on SW1; ALL-IN-FLIGHT red on SW2a; NO-ABORT red on SW6; NO-REARM red on SW5 (EW8b); NO-FINISH-CHECK red on SW1 and SW3 | `mutants/summary.txt` |
| PERF-RES | PASS (production build, alone): 22 asserts PASS, 0 FAIL. Four flipped rows: peak-backing 0.1 / 0.2 MiB (≤5), longtask-max.6x 0 / 0 ms (≤100). `res.export.{1,2}.bytes` 29,189,420 / 58,378,796 (= HEAD), also at 6×. Wall-ms 426 / 772 (6×: 854 / 1501), within 30 % of the sketch (455/882, 1011/…) — faster, info | `perf-res.log` |
| PERF-MUTANTS | PASS, `restored`. MU-12A-PERF-GCD: peak-backing 37.2 / 74.4 (>5). MU-12A-PERF-FALLBACK: longtask-max.6x 1221 / 2220 ms (>100) | `perf-mutants.log` |
| WAV-BYTES | PASS at both viewports. E1 `8f9b42a7`, E2 `12414b40`, E3 `5f9c3032`, E4 `2af840dc`: sha256, bytes (4,608,044 / 9,216,044 / 1,440,044 / 9,216,044), file name, overload and progress label equal A vs HEAD copy vs B's HEAD run. 44 + 16 s·48 kHz·6 B = 4,608,044, so the length is right. **E4 overload is empty on both trees; recorded, not an overload PASS.** E3 range radio was enabled and used. No page errors | `wav-A.json`, `wav-HEAD.json` |
| CANCEL-BROWSER | PASS. A: both viewports, Cancel clicked in the "Writing WAV · 0%" phase, message "Export cancelled — no file was created.", 0 downloads, second export sha `ca5a871b…` (18,432,044 B, "WAV created: 01:04.000 …") equal to HEAD. A's first WAV label is 0 % where HEAD's was 5 % (spec'd "starts at 0", not drift). HEAD at 1280×720 (poll log = `labels` in `cm-HEAD.json`): the Cancel click landed after HEAD had finished (HEAD wrote the WAV, 1 download) — HEAD's own race, because its WAV phase is shorter to catch; not an A difference. SW6 covers the rest | `cm-A.json`, `cm-HEAD.json` |
| MP3-BROWSER | PASS. Export MP3: `czaba-studio-lab.mp3` 641,448 B, sha `4c651710`, equal to HEAD. WAV + MP3: wav 4,608,044 B `8f9b42a7` (= E1) + the same mp3, same names and messages. Download order is not stable on HEAD itself (1440: mp3 first on HEAD, wav first on A; 1280 equal) — info | `cm-*.json` |
| G380-AUTH | PASS (A and HEAD, both viewports, fresh contexts). `/studio-lab`: `auth_user` null, 9 library options, title "CZABA Studio — Demo collection". `/studio/middle-east`: "Sign in required", 0 `audio[src]`, 0 clips. `/api/studio-token?product=…&file=…` with no token: 401 "Please sign in to access Studio.", no token in the body. Premium auth is not bypassed | `auth-*.json`, `auth-*-*.png` |
| DOCS | PASS. Doc 246 line 4 is `**სტატუსი:** In Progress (stage 1 of 2; C round 380 PASS)`; 7 TEMPLATE headings in order; cited row, mutant and file names exist; `grep 'C round [0-9]* pending'` = 0 | |

## Blocked
- The fake bearer on `/api/studio-token` returns 500 "Unable to prepare Studio access": backend unavailable in cloud. Same on HEAD. Not PASS, not an A finding.

## Gate rows (not claimed by C)
full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

## Notes (info, no bug)
- First MP3 probe attempt timed out on a disabled export button (cold start, no state captured); a replacement attempt with a 60 s click timeout passed at both viewports. Kept as environment-invalid.
- The browser probes use the 16 s demo bass clip. The 64 s WAV (4 clips) was byte-checked against HEAD only through the cancel-then-export second export.
- Limits: sample content of the WAV was verified by sha equality with HEAD (and size arithmetic), not by decoding; the overload text is not exercised in the browser (unit rows SW1/PEAK-LAST/CLIPPED-LAST).
- DOCS file-existence check re-run with absolute paths: all 6 named files exist. Two earlier shell exits (144) were my own `pgrep/pkill -f` matching the invoking command line, not app faults.
- No Ableton behaviour changed (performance round; the reference-first rule does not apply).
