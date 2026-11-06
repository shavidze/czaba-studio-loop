# C round 361 — PERF-10b-i (active track in the selection store)

**Verdict: PASS.** browserVerified true. Evidence under `c-round-361/`; JSON `c-round-361.json` (L57 OK, `c-round-361/l57-check.txt`).
Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed here.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS: `claims-361.sh` output byte-equal to A's `claims-final.txt` | `claims.txt` |
| SOURCE-SCOPE | PASS: 11 modified, 0 untracked; sketch patch and budgets patch both reverse-apply; budgets sha256 `371659418617` = dispatched; doc 234 only doc changed | diff --stat |
| PERF (production, alone) | PASS: rc 0, complete, failures [], 252 rows, **95/95** asserted, 0 NEW. Only `interact.click.components` 83→**42** ×3 and `.6x` 83→**42** ×3 differ from C360; `click.commits` 2 ×3 both rates; `select.same-lane` 15, `reclick` 0 equal. durationMs 512520 (≤ 540000) | `perf.log`, `latest-interactions.json`, `perf-rowcmp-vs-c360.txt` |
| PERF-LIB | PASS 40/40 | `perf-lib.log` |
| MUTANT (own, MU-C361) | Predicted first in `progress.json`. `ArrangementLane` selects the `activeTrackId` string → click.components **44,0 ×3** (1× and 6×) > 42: red, the only failure of 95; commits 2 and same-lane 15 unchanged. Proves `<= 42` is sensitive to a +2 regression. Scratch deleted; store unchanged | `mutant-MU-C361.diff`, `mutant-perf.log`, `mutant-rowcmp.txt` |
| ACTIVE-LANE (browser, dev) | PASS, 1440×900 and 1280×720 JSON equal to B's HEAD run: music → stems (line "Stems") → clip click music → Enter on Stems adds to stems | `lane-1440x900-all.json`, `lane-1280x720.json` |
| GROUP-RING | PASS: after collapse `data-contains-active="true"`, no pressed lane button, library line SFX; absent after Music click. Equal to HEAD except the random group UUID | `lane-1440x900-all.json` |
| PASTE-LANE | PASS: clips on music+sfx, sfx active, status "Paste (1): at 00:00.000 · on the SFX track." | same |
| VIDEO-FAIL-STOP-1 | PASS both viewports; all rows equal C360 except follow scroll `sl` +4 px and followPlay pos 00:01.880 vs .831 (jitter class C-R359-OBS-FOLLOW-JITTER, 4 px bound) | `beh-tree-*.json` |
| G361-AUTH | PASS: new incognito context, no credentials opens `/studio-lab` demo workspace; `/studio/middle-east` shows sign-in required, 0 audio elements; unauthenticated token GET 401; no token in body. Fake-bearer 500 (fails closed, mock down) is BLOCKED, not PASS | `auth.json` |
| DOCS | PASS: l.4 byte-exact; 7 `## ` headings in order; stage-3 numbers (83/42, 2, 93→95 of 252) match budgets and perf; SS8–SS11 and UC7 exist; 0 "C round N pending" docs | grep |

## Notes (for B)
- **A's L11 STOP (TG1/UC1 3.2–3.4 s in the parallel 9-file run):** pre-existing on HEAD (3561/3204 ms), 1.7 s isolated. C did not re-run (gate row). B's ruling: accepted delta; the gate full suite measures it.
- **A-R361-REVIEW-CANDIDATES-ARRANGEMENT-DEP (Low, A):** `trackGroupActiveCandidates` depends on the whole arrangement; no measured cost. Route to deferred_low_polish / PERF-10b-ii.
- Probe attempt 1 (1440 all-mode) timed out on a cold dev server concurrent with vitest — environment-invalid, replaced, log kept.
- L29 grep over the task not run (no definition in `lessons.md`); not claimed.
- No audio/export behaviour changed; not separately measured beyond the behaviour probe (play/stop/marker/follow rows). Ableton conformance: not applicable.
