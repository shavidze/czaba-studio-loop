# A round 337 — SYS-R336-PERF-DRAG-WINDOW

**Scope completed:** all of §1 (spec helpers, released button, lane constants, sequence text; 58 budget notes; doc 168 `## მეტრიკები`; new doc 233). No STOP. Test-only; no `app/**`, `perf/lib/**`, protected, package or config change. No commit/push.

## Changed files (`git status --short`, exactly 4)
- `M perf/studio-lab-interactions.perf.spec.ts` — B's sketch v2 applied with `git apply`, every hunk read against §1.1 (filters, read/timestamp order, detail keys, problem text, release semantics unchanged/as specified). RV-5 (`readonly`) not added.
- `M perf/budgets.interactions.json` — `note` only, 58 ids (sketch budgets patch).
- `M docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` — 3 hunks, all inside `## მეტრიკები` (l.87, l.88, l.111). l.87 also says the commit window starts *after* the first move and ends *before* pointerup (code-reviewer #5).
- `?? docs/implementation/2026/quarter-IV/233-sys-r336-perf-drag-window.md` — new; l.4 `**სტატუსი:** Completed (C round 337 PASS)` (L28), 7 TEMPLATE headings in order.
- `app/` and `perf/lib/`: `git diff --stat` empty.

## A rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS — equal to `claims-337-planning-output.txt` before any edit | `a-round-337/claims-pre.txt` |
| A-TYPE | PASS — `npm run typecheck` rc 0 | `a-round-337/typecheck.log` |
| A-LINT | PASS — rc 0, 205 warnings / 1 info (= gate/C round 335 counts; Biome covers `app/**` only, L30) | `a-round-337/lint.log` |
| A-PERF | PASS — run alone (L38), rc 0, 6.7 min; `complete` true, `failures` [], 193 rows, asserted 36/36; rowcmp **139 EQUAL / 0 DIFF / 0 NEW**; `ids-equal 193`; liveness rows (`drag-{range,fade,trim,move}-live` + `.6x`, `drag-fade-30-live`, `drag-lane-live` + `.6x`, `hook-live`) = [1,1,1] | `a-round-337/perf.log`, `perf-results/latest-interactions.json`, `perf-rowcmp.txt`, `rowids-equal.txt`, `liveness.txt` |
| A-NOTES | PASS — `ids equal order equal nonnote-diffs 0 notes-changed 58 matches-expected True` | `a-round-337/notes-only-check.txt` |
| A-PERF-LIB | PASS — 34/34 (scratch config, GATE304-M1) | `a-round-337/perf-lib.log` |
| A-MUTANT | PASS — all anchors matched (no hand mutation). **P:** aborted `drag lane stopped`, `MU-INJECT-THROW`, `MU-PROBE up-after-last-down true`. **M:** same abort, `false`. **D:** 9 DIFF exactly the listed set (range/fade/trim/move 1× `move-components-per-move` stopped+playing, + `interact.drag.fade.30.playing.move-components-per-move`), 73 EQUAL. Each run rc 1 by design (1 pass). Copies in `/home/runner/a337-mu` deleted | `a-round-337/mutant-{P,M,D}/`, `mutant-*.log`, `mutant-D-rowcmp.txt` |
| A-SCOPE | PASS — exactly the 4 files, doc 233 the only untracked | above |
| A-REVIEW | PASS — real `code-reviewer`: **9/10**, no Medium+. Hard-contract check (bounds, order, detail keys, release/rethrow, notes) all pass. Re-review of the post-review doc edits: **9.5/10**, no blockers | below |

Final claims run (`a-round-337/claims-final.txt`) differs from planning only in: K2 `f1def9c 4`; K3–K7 = sketch output (`1 1 0 0 1 1`, `1 1 1 1 1 1`, `3 2 1 1`, `0 1`, `193 0 0 36`); K16 `1 11 0 8`; K20 `2` — both hits are in doc 233 (it quotes the old `dragSteps / 6` / `dragDistancePx / 3`), as the C CLAIMS row allows.

## Reviewer findings and disposition
- #1–#4 Low (rename `DragWindow.commits` → `moveCommits`, `pointerSpan` vs `DragWindow` naming, `pressedGesture` → `withPressedPointer`, arrow vs `function` helpers): **not applied**. The helper names are pinned by B's task (§1.1) and K4. Renaming them would change C's expected K4 output. They change no value. Proposal for B.
- #5 Low (doc 168 l.87 window wording): **fixed**, then re-reviewed.
- #6 Low (status line before results): **not applied**. L28 requires the post-PASS final value, and the placeholders are now filled.
- Re-review Low (l.87 has two "შემდეგ" in a row, readability only) and Info (doc 233 could name `make-mutant.py`): not applied, so no unreviewed text is left. Candidates for B.
- **Architecture note:** none (both reviews).

## Known gaps / not done
- The full vitest suite, build gate, `npm run verify` and e2e smoke were not run (gate rows, speed rules).
- No browser rows besides the perf/mutant Chromium runs. G337-AUTH is a C row.
- GATE304-M1 (perf/lib not in `vitest.config.ts`) is still root's.

## Exact next C checks
1. `bash b-round-336/claims-337.sh`: expect the diff vs planning listed above (K20 hits only in doc 233).
2. `git status --short` / `git diff --stat`: the 4 files; `app/`, `perf/lib/` clean; protected 11 OK.
3. A-NOTES command, plus read 5 notes (one lane, one older `commits-per-move`, one older `move-components-per-move`).
4. Production perf spec alone after a warm-up, then `perf-rowcmp.py` and `rowids-equal.py` vs `c-round-335/perf-results/latest-interactions.json`: expect 139/0/0 and 193.
5. Mutants P/M/D on C's own copies, plus C's own `dragWindow` mutant with its predicted rows (`rowcmp-1x.py`).
6. HARNESS-READ of `dragWindow`, `componentsPerMove`, `rowWriter`, `pressedGesture`, `measureDrag`, `measureLaneDrag` against §1.1.
7. PERF-LIB 34/34; G337-AUTH at 1440×900 and 1280×720; DOCS (doc 233 l.4 byte-exact, headings; doc 168 hunks only in `## მეტრიკები`).

The B acceptance rows A-CLAIMS through A-REVIEW above passed. C rows are not claimed. The backlog is not marked complete.
