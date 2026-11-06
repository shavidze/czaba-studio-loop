# A round 360 — PERF-10a-BUDGETS

Implementer A · 2026-11-06 · baseline HEAD `a977b97` · no STOP.

## Scope completed
Exactly the 3 granted files changed; `app/`, `perf/lib`, specs, other budgets files, e2e, config and protected files untouched (K7 `c5816b428fb4` = planning, K6 11).

| # | File | Change |
|---|---|---|
| 1 | `perf/budgets.interactions.json` | `git apply ../tmp/studio-real-loop/b-round-359/sketch/budgets.patch.txt`, unchanged; sha256 `728ed85b08d4…` = `b-round-359/sketch/budgets-dispatched.sha256` |
| 2 | `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | l.4 → `**სტატუსი:** In Progress (stage 2 of 3; C round 360 PASS)`; new `### ეტაპი 2: PERF-10a-BUDGETS (round 360, D-29z1165)` under `## მიდგომა` (table, budget rules, rulings, B's sketch + MU-A/MU-B); `## შეცვლილი ფაილები` old round-358 bullet replaced by a dated 358/360 pair + doc 232 bullet; `## ტესტირება` stage-2 bullet (budgets file, `b-round-359/perf-summary.txt`, C's round-360 PERF row); `## TODO` PERF-10a-BUDGETS and A-R357-TEMPO-SEED-REMOUNT-DUP struck (the latter closed by doc 235, which records the merge under D-29z1160). `## ` count 7 |
| 3 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | one TODO bullet directly after the video-move-budget bullet; l.4 unchanged |

## §2.1 rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: identical to `b-round-359/claims-360-planning-output.txt` | `a-round-360/claims-pre.txt` |
| A-CLAIMS final | PASS: K2 `a977b97 3`; K3/K4 = sketch output; K5 `5807ea0e 7 e93c6776 0`; K6–K11 = planning; K12 `1 0 2 1` | `a-round-360/claims-final.txt` |
| A-TYPE | rc 0 | `a-round-360/typecheck.log` |
| A-LINT | rc 0, 205 warnings (≤ 205) | `a-round-360/lint.log` |
| A-PERF-LIB | 40/40 (2 files) | `a-round-360/perf-lib.log` |
| A-PERF | Production, run alone (nothing else ran during it; only a read-only reviewer subagent was reading files). rc 0, `complete` true, `failures` [], 252 rows, **93/93** asserted pass, 0 NEW. `perf-rowcmp.py` vs `c-round-359/latest-interactions.json`: 181 EQUAL deterministic rows, 0 differing, so none higher than C359. The nine rows: play start-commits 1×3, start-components 28×3, start-sources 1×3, stop-commits 1×3, stop-components 28×3; fade stopped 3×3, fade playing 2×3, video-fade stopped 2×3, video-fade playing 2×3. `durationMs` **462129** (≤ 540000) | `a-round-360/perf.log`, `a-round-360/perf-results/latest-interactions.json`, `a-round-360/perf-rowcmp-vs-c359.txt` |
| A-MUTANT | not run by A, as allowed: B ran MU-A (M-P1 + M-P3, rc 1, 90/93, the 3 predicted rows red) and MU-B (M-P2 + M-F1, rc 1, 85/93, the 6 predicted rows red + both play components rows at 99) on the dispatched budgets file | `b-round-359/perf-summary.txt` |
| A-REVIEW | see below | — |
| A-DOC | as §1.2/§1.3 | diff |

**/check (Biome) on the owned paths:** vacuous. Per L30, `biome.json` includes `app/**` only, so a Biome run scoped to `perf/budgets.interactions.json` and the two docs checks nothing. The Biome check that actually ran is `npm run lint` (rc 0, 205 warnings). K7 proves `app/` is unchanged.

**Perf isolation:** the perf window was 2026-11-06T01:28:20Z → 2026-11-06T01:36:14Z (`a-round-360/perf.start`, `perf.end`). typecheck, lint and perf-lib all ran after `perf.end`. During the window, only the read-only code-reviewer subagent was reading files.

## Code review (code-reviewer subagent, actually run)
First pass, on all 3 files: no Critical/High/Medium. Score 9/10. Findings:
- **Low 1 → B (A-R360-REVIEW-VIDEOFADE-NOTE-STALE):** the notes of `interact.drag.video-fade.stopped/playing.release-commits` keep the old "Record until C measures it (L58, …round 349)" sentence before the new "Asserted since PERF-10a-BUDGETS (round 360)" one. The note now contradicts the mode. The file is sha-pinned to B's patch, so A did not edit it.
- **Low 2 → B (A-R360-REVIEW-FADE-PLAYING-INTERMITTENT):** the `interact.drag.fade.playing.release-commits` note says "the third commit is intermittent while playing", but all samples are 2 (C358, C359, sketch, A). An intermittent third commit would already fail the `exact` equal-samples check. The file is sha-pinned, so A did not edit it.
- **Low 3, fixed in doc 234:** "any `deterministic` row" was narrowed to the `exact` contract, which is what these nine rows' units get (verified in `perf/lib/determinism.ts:19-34` and `perf/lib/report.ts:108-109`).
- **Low 4, fixed:** the Georgian wording of the MU-B "99 components" explanation.
- **Info 5, fixed:** only 7 of the 9 rows have `.6x` copies; the two video-fade rows are measured at 1× only (confirmed in A's results). The doc now says so.
- **Info 6, fixed:** "this stage changes only the budgets file" now says it also changes docs 234 and 232.
- Info 7: the forward "C round 360 PASS" status follows L28.
- **Architecture note:** none (budget-only round).

Second pass (L11, doc 234 changed after the first review; code-reviewer subagent, actually run): fixes 3–6 confirmed against `perf/lib/report.ts:101,108-109,182-183`, `perf/lib/determinism.ts:19-28` and the budgets file. l.4 byte-exact; 7 `## ` headings. **No new Medium+.** No change after the re-review.

## Known gaps / for B
- Lows 1 and 2 above: note text in the sha-pinned budgets file. A future notes cleanup on that file is needed.
- A ran no browser behaviour probes (VIDEO-FAIL-STOP-1/2/3, G360-AUTH). Those are C's rows.
- No mutant was run by A (allowed by the task).

## Exact next C checks
1. CLAIMS: `bash b-round-359/claims-360.sh` must equal `a-round-360/claims-final.txt`.
2. SOURCE-SCOPE: 3 modified files, 0 untracked; `git apply -R --check b-round-359/sketch/budgets.patch.txt` passes; budgets sha256 = dispatched; doc 232 diff = 1 added line.
3. PERF (production, alone): 93/93, 0 NEW, no row above C359; record `durationMs` (A: 462129).
4. MUTANT (C's own, outside MU-A/MU-B), predicted first in `c-round-360/progress.json`.
5. PERF-LIB 40/40.
6. VIDEO-FAIL-STOP-2 / -3 (`b-round-359/vfs-probe.mjs` v2/v3, dev :5173, 1440×900) and VIDEO-FAIL-STOP-1 (`c-round-358/behaviour-probe.mjs`, both viewports).
7. G360-AUTH, both viewports.
8. DOCS: doc 234 l.4 byte-exact, 7 `## ` headings in TEMPLATE order, every budget doc 234 states matches the live file (L34), doc 232 l.4 unchanged, `grep -rl 'C round [0-9]* pending' docs/implementation` → 0.

## B acceptance criteria truly passed by A
A-CLAIMS pre, A-CLAIMS final, A-TYPE, A-LINT, A-PERF-LIB, A-PERF, A-DOC, A-REVIEW (no unruled Medium+; Lows 1 and 2 routed to B). The round is not complete until C verifies it.
