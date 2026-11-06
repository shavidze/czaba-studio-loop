# C — Round 362: PERF-10b-ii-a (Play/Stop leaf, reader-only playback hook)

**Verdict: PASS, browserVerified true.** Evidence under `c-round-362/`; machine-readable rows in `c-round-362.json`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equals A's final | `claims-c.txt` |
| SOURCE-SCOPE | PASS: 7 M, 0 untracked; sketch and budgets patches reverse-apply; doc 234 the only doc | git output (re-run) |
| PERF (production, alone) | PASS: rc 0, complete, 95/95 asserted, 0 NEW, 252 rows; play start/stop 11 x3 (1x, 6x); click 38 x3; 44 DIFF lines byte-equal to B's `perf-final-rowcmp.txt`, all decreases; durationMs 454589 | `perf.log`, `latest-interactions.json`, `perf-rowcmp.txt` |
| PERF-LIB | PASS 40/40 | `perf-lib.log` |
| MUTANT (C's own) | RED as predicted: hidden state span moved into the Transport body (which reads isPlaying again) -> play start/stop 29 x3 > 11 (2 failures only, 93/95), click stays 38. My "about 28" was off by one. Scratch deleted, store unchanged | `progress.json`, `mutant-perf.log`, `mutant-rowcmp.txt`, `mutant-MU-C362.diff` |
| PLAY-STOP 1440x900 and 1280x720 | PASS, identical at both: Play data-playing true, span "Playing", clock 0.272 -> 1.271 s then frozen after Stop (span "Stopped"); Space start/stop; held Enter = one flip (one start); double-click Stop -> 00:00.000; Tab order Follow > Play > Stop > Back to start > Loop; aria-describedby of Play and Stop = the span id; titles/aria-keyshortcuts unchanged | `playstop-*.json`, `play-*.png` |
| MARKER-NONE | Stopped branch PASS at both viewports ("No more markers after the insert marker", reached after Ctrl+Right to project end then Ctrl+Right). **Playing branch not browser-verifiable**: playback ends the moment the playhead reaches project end, so the `readIsPlaying()` true text could not be observed (recorded as Low C-R362-MARKER-PLAYING-NONE-UNREACHABLE). IM24 jsdom re-run passes (not a browser check) | `marker-*.json`, `marker-stopped-*.png`, `im24.log` |
| VIDEO-FAIL-STOP-1 | PASS both viewports: all rows equal c-round-361 except follow scroll sl (119 vs 123/124) and followPlay pos (.831 vs .880). Both are equal to C360 within 1 px and the known jitter class C-R359-OBS-FOLLOW-JITTER; no row related to Play/Stop differs | `beh-tree-*.json` |
| G362-AUTH | PASS: fresh context, no credentials, `/studio-lab` opens the demo workspace; `/studio/middle-east` shows sign-in required with 0 audio[src]; studio-token GET 401, no token in body. Fake-bearer returns 500 (fails closed, mock backend down) -> BLOCKED, not PASS | `auth.json` |
| DOCS | PASS: l.4 byte-exact (md5 ef9813ea), 7 `## `, stage-4 numbers equal budgets file and perf-final, PS4/RB-PB2 exist, 0 pending docs. Notes below | doc 234 |

## Findings (all Low, none block)
- **A-R362-DOC-UC7-WORDING** — UC7 clause keeps its description after the colon; literal `UC7 (არსებული, უკვე HEAD-ზე)` not present. Intent met.
- **A-R362-DOC-STALE-MERMAID** — doc 234 architecture diagram and stage-1 text still show the pre-stage-4 wiring (confirmed).
- **A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT** — private lookup's error text names `useArrangementIsPlaying` even for the reader caller.
- **C-R362-MARKER-PLAYING-NONE-UNREACHABLE** — coverage gap above.

## Not claimed
- Gate rows: full vitest, typecheck, build, Biome, verify, e2e smoke.
- Export WAV / audio-graph integrity: not run. This round changes only React subscriptions, no audio code, and I make no claim about export.
- G362-AUTH fake-bearer 403: backend unavailable in cloud.
- Ableton conformance: not applicable (no on-screen change).

## Probe notes
First 1440x900 Play/Stop probe timed out at the ready wait (cold dev server while perf-lib ran): environment-invalid, re-run passed once. The 3-valid-measure budget is not relevant (deterministic counts).
