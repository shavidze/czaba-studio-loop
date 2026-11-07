# C round 376: PERF-11c-iii-c1 (Transport leaves). Verdict: BLOCKED (no bugs found, not PASS)

A reported a STOP (TC10 headroom, reviewer M1) with a complete diff; lesson 22 short round plus selected browser rows. Evidence in `c-round-376/`.

| Row | Result |
|---|---|
| SOURCE-SCOPE | 6 M + 1 new doc; frozen manifest rc 0; protected rc 0 |
| SKETCH-EQUAL | 6/6 OK |
| CLAIMS | K2 = 7, K14 = 1 file, rest equal sketch output (`claims-A.txt`) |
| ASSERT-COUNT | 530/74, 181/17, 38/7, 137/21 = B's expected counts |
| UNIT (4 changed files) | 121 pass (`unit4.log`) |
| TC10 timing | 1685/1684/1671 ms standalone = 33% of 5 s (`tc10.log`); A's 62% was under load; risk stays for B |
| LEAF-PROBE | both viewports, 520 cells, 0 differences vs `leaf-sketch-376.json` (`leaf-A.json`; cold run 1 timed out at 1440, kept) |
| TRANSPORT-BROWSER | recipe a,b,d,e,g equal HEAD values (`recipe-A.json`); Delete -> Undo focus, Export Esc -> Export (`browser.json`) at both viewports. (f) range/zoom-to-selection not run |
| G376-AUTH | anon context: auth_user null, `/studio/middle-east` Sign in required, 0 workspace, 0 audio, token endpoint 401 (`auth.json`, screenshots) |
| STUDIO-SMOKE | add Bass, play 00:01.66, stop, Ctrl+Z ok; lane drag and master mute not run |
| DOCS | l.4 exact, 0 "pending" refs |

**Not run (so not passed):** PERF-INTERACT, PERF-RESOURCES, MUTANTS-TREE, shuffle-seed unit, full 140-file run, HEAD-copy browser comparison. So `browserVerified` = false.
**For B:** rule on TC10 headroom and A-R376-REVIEW-M1 (suggested row: two same-label `setClipGain` edits, Edit group 0 on the second). Then re-dispatch C for perf and mutants.
