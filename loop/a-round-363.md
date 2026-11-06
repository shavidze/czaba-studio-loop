# A — round 363 (PERF-10b-ii-b)

STOP — needs B ruling on A-PERF-LIB / DC-KINDS (`perf/lib/report.test.ts` l.378–389)

## STOP detail (L11, L23)
- A-PERF-LIB command (`npx vitest run --root store --config b-round-334/vitest.perf-lib.config.mjs`): **39/40, rc 1** (`a-round-363/perf-lib.log`).
- Failing row: `DC-KINDS: windowed drag commits-per-move rows are wallclock, fader rows stay ratio-checked`.
  - Assertion (l.389): `interactions.filter((row) => row.metric === 'commits-per-move' && !windowedDrag.test(row.id))` `.toEqual([])`, with `windowedDrag = /^interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move(\.6x)?$/`.
  - Received: the two new rows `interact.drag.background-range.stopped.commits-per-move` and `.6x`. Both are `kind: "wallclock"`, so the guard's intent (windowed drag commits-per-move rows are wallclock) holds; only its id regex does not know the new drag.
- Cause: the task §1.2 mandates a `commits-per-move` row for the new drag, and `perf/lib` is not granted (§1.1, K9). §0.4 says the perf rows had no B sketch run, so the perf-lib suite was never run against the budgets change (L23/L58 pre-check gap).
- A did **not** edit `perf/lib/report.test.ts` and did not rename the metric to dodge the guard.

### Options for B (A does not choose)
- **(a)** Grant `perf/lib/report.test.ts`: extend the regex to `(range|fade|trim|move|background-range)` and `toHaveLength(16)` → 18. Changes K9's perf/lib sha. This keeps the guard honest.
- **(b)** Use a different `metric` string on the two budgets rows only. The spec's `put('commits-per-move')` still fixes the row id; this breaks the "copy the matching row" intent of §1.2 and sidesteps the guard.
- **(c)** Drop the two commits-per-move rows: 10 rows, K3 → 262 rows, and the spec stops writing them.

## Tree state (consistent partial, 3 modified files)
- `app/lib/arrangement/__tests__/render-budget.test.tsx`: B's sketch patch applied unchanged (`git apply`).
- `perf/studio-lab-interactions.perf.spec.ts`: §1.2 implemented: new helper `backgroundRangeGrabPoint` (the existing `emptyLanePointAfterClip` is untouched, so its three callers get the same point), `readBackgroundRange`, `measureBackgroundRangeDrag`, the `drag background-range stopped` step before `drag lane stopped`, and the sequence entry.
- `perf/budgets.interactions.json`: 12 `record` rows, owner PERF-10b-ii-b; 264 rows, 95 asserted.
- **Not done because of the STOP:** docs 234 and 168 (l.4 `Completed (C round 363 PASS)` would be false), the code-reviewer (the tree changes on re-dispatch).

## Acceptance (§2.1)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: equals `claims-363-planning-output.txt` | `a-round-363/claims-pre.txt` |
| A-TYPE | PASS rc 0 | `a-round-363/typecheck.log` |
| A-LINT | PASS rc 0, 205 warnings (= HEAD) | `a-round-363/lint.log` |
| A-TESTS | PASS 13/13; RB-MEMO1 74 ms, RB-MEMO2 70 ms, RB-MEMO3 75 ms; slowest row 1584 ms (< 50 % of the 5 s default) | `a-round-363/render-budget.log` |
| A-MUTANT | PASS: MU-P red on RB-MEMO1 only, MU-W on RB-MEMO2 only, MU-R on RB-MEMO3 only (12/13 each); run on a `git archive` scratch under `/tmp`, deleted; store source unchanged | `a-round-363/mutants/` |
| A-PERF-LIB | **FAIL 39/40** (STOP above) | `a-round-363/perf-lib.log` |
| A-PERF | PASS on every A-PERF criterion (see below) | `a-round-363/perf-run.log`, `latest-interactions.json`, `rowcmp.txt` |
| A-REVIEW | run: no Medium+; 3 Low + 3 Info, **not applied** (STOP; an edit would also invalidate the A-PERF run) | below |
| A-DOC | not done (STOP) | — |
| A-CLAIMS final | K1, K5, K6, K8–K11, K13, K15, K17, K18 equal planning; K7 equals sketch output (`rb-memo-rows 3 rb-tests 13 rb-sha f67004381b1c`); K3 `rows 264 asserted 95 bg-rows 12 bg-record 12 bg-owner PERF-10b-ii-b`; K12 `bg-mentions 4 dragNames 1 lane-drag-stopped-step 1`; K2 `9da8daa 3` (not 5: docs not edited); K14 `ef9813ea … stage5 0 old-T 1 old-M 1` and K16 `doc168-bg 0` unchanged (docs not done) | `a-round-363/claims-final.txt`, `claims-final-vs-planning.diff` |

## A-PERF (production, alone, L38)
- `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`: rc 0, 1 passed (8.3 m), `durationMs` 483109 (≤ 560000).
- `complete` true, `failures` [], `problems` [] in all 6 passes, `pageErrors` 0, `abortedAt` null.
- `perf-rowcmp.py c-round-362/latest-interactions.json a-round-363/latest-interactions.json`: 264 rows (prev 252); asserted 95, **95/95 pass**; **181 EQUAL, 0 DIFF** across every pre-existing non-wallclock row (rows before and after the new step, both rates), so the hard floor and the before/after rule hold. NEW lines are only the 8 new non-wallclock rows (the 4 wallclock new rows are not printed by the script).
- The 12 new rows (median, samples):

| Row | 1× | 6× |
|---|---|---|
| `interact.drag.background-range.stopped.commits-per-move` (wallclock) | 0.983 [0.983, 0.983, 0.983] | 0.983 [0.983, 0.983, 0.983] |
| `….move-components-max` | 37 [37, 37, 37] | 37 [37, 37, 37] |
| `….release-commits` | 1 [1, 1, 1] | 1 [1, 1, 1] |
| `….move-to-paint-p95` (wallclock, ms) | 2.6 [2.6, 3.9, 2.5] | 16.1 [17.7, 16.1, 12.9] |
| `….move-components-per-move` | 7.383 [7.383 ×3] | 7.383 [7.383 ×3] |
| `interact.harness.drag-background-range-live` | 1 [1, 1, 1] | 1 [1, 1, 1] |

## Code-reviewer (actual `code-reviewer` subagent, 8/10)
Not applied, because of the STOP. For B to rule on at re-dispatch:
- **Low** spec `measureBackgroundRangeDrag`: `selectedBefore` only appears in the problem text. Add `selectedBefore === selectedAfter` to the reset check, so a future unselected start state is caught.
- **Low**: the liveness value includes the reset result (after-reset counts). The task §1.2 requires this ("after the reset, 0 lane-range and 0 `[data-range-start]`"), so this is task-mandated. The duplicate reset problem line is the only cost.
- **Low**: the name-bar reset checks the Undo title and the range counts, but not the clip start/width or the Insert Marker. Today's 0-DIFF run shows it holds; a `readClipState(clip)` before/after comparison would make that explicit.
- **Info**: the not-found sentinel `{x:0,y:0,trackId:null}` and `null` both map to one message. `liveId` is rate-applied here but base in `measureDrag` (naming). On an early return the 5 metric rows are absent and only the problem line records it.
- **Info, B's sketch (applied unchanged):** RB-MEMO2 does not itself assert that the waveform is mounted (positive control on the content only). RB-MEMO1 covers the same setup.
- **Architecture note (for B):** no signal. The row-writing blocks of `measureDrag` and `measureBackgroundRangeDrag` are near-identical. Keep them for now; propose a `writeDragRows` helper only if a third copy appears.

## Known gaps
- STOP item: DC-KINDS (above). Docs 234/168 not written. The reviewer Lows are not applied.
- Biome is not applied to `perf/**` (L30); `npm run lint` covers `app/**` incl. `render-budget.test.tsx`; typecheck covers `perf/**`.

## Next C checks (after B's ruling and A's re-dispatch)
- PERF-LIB 40/40 under the ruled option. Re-run A-PERF only if the spec changes (option c or reviewer Lows); otherwise compare against `a-round-363/latest-interactions.json`.
- Then the §2.2 rows as written: RB-MEMO + mutants, the C mutant, PERF, BG-RANGE at both viewports, G363-AUTH, DOCS.

## Scope completed
§1.1 files 1–3 implemented; files 4–5 (docs) not started. B acceptance rows truly passed: A-CLAIMS pre, A-TYPE, A-LINT, A-TESTS, A-MUTANT, A-PERF. Failed: A-PERF-LIB (39/40). Not done: A-REVIEW fixes, A-DOC, A-CLAIMS final (K2/K14/K16 differ only because of the docs).

STATUS: STOP — needs B ruling on DC-KINDS.

## Addendum
- Scoped Biome (`/check` on the owned `app/` path): `npx biome check app/lib/arrangement/__tests__/render-budget.test.tsx` rc 0, clean (`a-round-363/biome-render-budget.log`).
- **Smallest re-dispatch under option (a):** grant `perf/lib/report.test.ts` (regex + `toHaveLength(16)` → 18), re-run perf-lib (40/40 expected) and the code-reviewer, write docs 234/168. No `app/` change and no perf re-run is needed: the 12 values above still apply under options (a) or (b), because the spec and row ids stay the same.
