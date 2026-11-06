# C round 358 — PERF-10a (C-R357-01 ruling b): PASS, browserVerified true

Everything below was run by C in a real Chromium (Playwright) against the dev server `:5173` (A's tree) and a HEAD `d49536b` dev server I built from `git archive` (port 5192, since removed). Evidence is in `c-round-358/`, and JSON copies are named in `c-round-358.json` manifestPaths.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS / SOURCE-SCOPE / READ (round-358 delta) | PASS: claims equal A's final, 57 entries, delta lines all in the diff, mount effect after tempo-seed | `claims.txt` |
| UNIT | PASS 71 files, 1290/1290 | `cover.log` |
| REMOUNT 1440x900 | PASS: 7/7 step texts equal HEAD | `remount3-tree.json` |
| PRE-REMOUNT | RECORD: tree == HEAD at both viewports. A pre-existing defect: remount re-appends the tempo-seed sentence, and a typed 100 BPM reverts to 120 (C-R358-01) | `beh-*-*.json` rows.pre |
| PLAY-BEHAVIOUR (both viewports), FOLLOW (both), NARROW, VIDEO-SYNC, VIDEO-FAIL-STOP (variant 1) | PASS, equal to HEAD | `beh-*`, `follow-*`, `narrow-*`, `behaviour-video-1440x900.json` |
| G358-AUTH (both viewports) | PASS. Demo opens without credentials. `/studio/middle-east` shows sign-in, with no audio and no token. The fake-bearer 500 fails closed, so it is blocked on the backend | `auth.json` |
| PERF (alone) | PASS: 84/84, 0 NEW, play components 70 → 28, 473 s | `perf-rowcmp-vs-c356.txt` |
| MUTANT (C own) | The prev-value guard removal survives all 47 Follow files and RM1/RM2: equivalence/coverage gap (A's Low A-R358-REVIEW-LEAF-GATE-COVER), not a FAIL | `mutant-noguard.log` |
| DOCS | PASS | doc 234 |

**Note on my probe.** My first probe versions had flaws (focus on the marker button swallowed Space, and the cold dev server timed out under CPU contention while vitest ran). I fixed the probe and re-ran HEAD and the tree on identical scripts, so the numbers above come from the corrected runs. The "DIFF" lines on `followScrollers*` in the behaviour probe are scroll-pixel jitter from its invalid follow part. The valid FOLLOW row is `follow-probe.mjs`.

**Not run:** VIDEO-FAIL-STOP variants with Follow paused and with the playhead reaching a clip. A and B's mutants M-B1..M-B6 were not re-run by C (A's logs and B's are cited).

**For B:** C-R358-01 is the pre-existing remount defect that PRE-REMOUNT was meant to size. A typed tempo is lost on a plain window resize, which makes it Medium under the bug gate. It is not A's regression. Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are left to the root gate.

**Correction after self-review.** The marker steps of `behaviour-probe.mjs` were vacuous, because playback was not on when Next marker was clicked. They are replaced by `marker-probe.mjs` (`marker-{head,tree}-{1440x900,1280x720}.json`). It shows tree == HEAD at both viewports. Observation, identical on HEAD and therefore not this round's: clicking "Next marker" with no marker during playback leaves data-playing false and writes no new message. B can decide whether that is intended. The same probe's follow part was also invalid, so only `follow-probe.mjs` counts for FOLLOW. REMOUNT-ANNOUNCE is evidenced: `follow-remount-ui.test.tsx (2 tests)` is green in `cover.log`.
