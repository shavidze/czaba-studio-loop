# C — Round 305 (RETRO 305) — verification

**Verdict: FAIL** (one Low against the screen review, C-R305-01; the app and the retro numbers pass). `browserVerified` = `realVerified` = **true**. No file in `store/` changed.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS at start and end: HEAD `adf959d`, `git status` empty, `sha256sum -c --quiet` rc 0 | shell, this round |
| CLAIMS | PASS: `claims-305.sh` output byte-identical to `claims-305-output.txt`; K8 `done`, no MISSING | `c-round-305/claims-output.txt` |
| RT-NUM | PASS. Scripts copied to `c-round-305/rtb/` (outputs redirected), run from the loop root, outputs diffed with B's. Totals $146.29/71.43/86.42/304.14, median $18.39, phase medians 9.75/3.70/3.86, FAIL cost 52.14 (19.95+32.19), B share 48.1%, groups and fix-ups, chain 45.75 (11.43+18.39+15.93), gate 11/3/1, C bugs Medium 2/Low 11, 11 review.md/51 findings/Critical 1, classify origins/categories, origins §4 29/25/23/9 (=open+deferred), 544/28/516, 70 awaiting-user, 3 STOPs, `[K#]` 4–29, manifest fields 290–299 only. retro-290 baselines (12/3, $22.32, 51%, $12.77, 1 of 7) match `retro-290.md` | `c-round-305/rtb/*.stdout` |
| RT-CAUSE | PASS. §3/§9 causes match `c-round-290.json`, `c-round-292.json` bugs[0].origin, `gates/round-293/verify.log` l.3069 (ST6 FAIL) / l.3093 (`1 failed`), `gates/round-297/review.md` Critical 1 (LH3 vacuous, LH1 consumes the flag), `c-round-298.json`, `a-round-295.md`/`a-round-303.md` STOP lines, `a-round-304.md` l.19–23 (overlap deviation) and l.107 (reviewer did not see post-review changes). EXP-R290 verdict follows `retro-290.md` §10 (≥3 claim/artifact: 3+2; ≥1 absent: C-R298-02; ≥1 pre-check FAIL: gate 293) | files cited |
| RT-IDS | PASS. PERF-3c done (D-29z799); PERF-3 in_progress; C-R304-01 closed by ruling; C-R304-02 open → PERF-3d; GATE304-M1-PERF-LIB-NOT-IN-GATE Medium open_root; GATE304-M2-EQ60-TRIPWIRE Medium open, named in PERF-3d; GATE304-L3-PROBE-IN-WINDOW open; GATE304-L5-COSMETIC deferred; GATE304-ARCH-ZOOM-LIVE-RULE in architecture_signals. All 10 mention ids disposed in §8/§12. Extended grep of the before copy (`retro[ -_]?305`, `RETRO (305)`, `round 305`) adds only decision-log scheduling notes ("RETRO at round 305") and ids already disposed. Retired-candidate greps reproduced (AX: 290/291 only; MULTILINE-TERNARY: 291 only; post-frame: 0) | `backlog.json` v264 |
| RT-LESSONS | PASS. 59 lines, 3 parts. Only l.3, L11, L23, L38, L44, L56 changed (each prefix-equal to the old text, append only), L43 removed, L57 added. New L44 carries old L43 text and evidence (SABA-B-9, D-29z485, SABA-Q-9-TRANSPORT) verbatim | python diff in this round |
| RT-SABA | PASS. §12 phrased as proposals; SR-305-2/-3/-7/-9 marked "კითხვა"; SR-305-6 collapse variant named a position move for Saba; CLAUDE.md tagline a proposal only | `retro-305.md`, `screen-review-305.md` |
| RT-SCREEN (browser) | **FAIL (document only).** Re-run of `capture.mjs` with my own mock (:5199 was down; started, stopped after; `c-round-305/mock.log`): `laneErrors` none; journey reaches `/studio-lab?preview=middle-east`, preview selected and focused; arrival has 0 clips (`arrival.json`, both viewports); position after Play 00:01.483 / 00:01.471; counts identical to `counts.txt` (138/168/118/144; outside 97/124/86/101). All named PNGs exist. Opened: DEMO-1440 (B and C copies), S0-1440, arrival-1440, product-1440, export-1440, and the probe shots; SR-305-1/-2/-5/-6/-8/-9 are as described there (the -1280 copies and playing shots were checked by the text dump and `screen305.json`). Every candidate is as described **except SR-305-4** (C-R305-01) | `c-round-305/screens/` |
| G305-AUTH (browser) | PASS at 1440×900 and 1280×720: `/studio-lab` workspace + demo badge, `auth_user` null; `/studio/middle-east` "Sign in required", no workspace, 0 `audio[src]`; `/api/studio-token` no header 401, fake bearer 403 (mock running), bare 400; no token in any body | `c-round-305/auth/g305-auth.json`, `attempt4.log` |
| STUDIO-SMOKE-305 (browser) | PASS at both viewports: Bass via Enter (1 clip), 00:01.471 after 1.5 s, `data-playing` false→true→false, WAV RIFF/WAVE, 48 kHz, 24-bit stereo, 768000 frames = 16.000 s, peak 0.217, non-zero 99.99%, NaN 0 | `c-round-305/smoke/smoke305.json`, `shots/` |

**Gate rows** (not claimed): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

## C-R305-01 (Low, origin B): SR-305-4 says the status line is cut at 1440; it is not
- SR-305-4 says the add-status "1440-ზე წყდება". B's own `screen305-full-DEMO-1440x900.png` and my re-capture show the full sentence on one line, ending "Snap on — grid 1/2 (G)".
- Probe (`sr-probe.cjs`), longest status (added + name-bar hint + tempo + grid + snap): scrollWidth = clientWidth (1416/1416 at 1440, 1256/1256 at 1280), height 16 px, no ellipsis or overflowing child. Also full at 1280 (`sr-probe-status-1280x720.png`).
- Likely source: `capture.mjs` `textLines()` cuts every text to 120 chars, so `screen305.json` shows "… Gri". The candidate's other claims (five facts in one sentence; the SABA-B-8 constraint) are correct.
- Fix (B, round 306 planning): reword SR-305-4 (density, not truncation) before it goes to Saba. Next C re-checks only that line (RT-FIX).

## Notes (info, no finding)
- SR-305-3 says Play on the empty arrival "plays nothing". True; Play also writes the status "Nothing to play — add a clip from the library first." (`sr-probe.json`). The review does not mention this. Saba may want to know when he weighs (a) against (b).
- `rounds-290-304.json` re-generated now differs only in round 304's `b_cost` (14.23 vs 0), because B's round-305 planning result now exists. `cost.py` reads `b-round-(N−1)` directly, so no retro number changes.
- Smoke: Bass was added to the active **Music** lane (status "added to the Music track"); stems on their own lanes is STEM-LANES, not this round.
- Environment: G305-AUTH attempt 1 timed out on a cold dev server (L38). Attempt 2 crashed and its output was lost. Attempts 3 and 4 passed. The browser rows ran one at a time, never alongside another job.
- L57 fields: manifestPaths 61 (K8 49 + K9 12), missingPaths 0, countMismatches 0, claimCheckMinutes 2; the three EXP fields are null ("RETRO: no assert specified").
- Warm-up probe script: `c-round-305/warmup-probe.cjs` (first written to /tmp, copied here).
- Consults: none (`consequence-tester` was optional).

## For B
- C-R305-01 → correct SR-305-4 at the round-306 planning, then RT-FIX together with PERF-3d (per §4).
- Nothing in the app needs fixing from this round.
