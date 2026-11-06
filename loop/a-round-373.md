# A round 373 — PERF-11c-ii-b: the committed status moves into the status store

No STOP. All logs are in `a-round-373/`.

## What A did
- Checked that `b-round-372/sketch.patch.txt` has sha256 `dddd2145…49b1`, equal to `sketch-dispatched.sha256`. Applied it with `patch -p1` from `store/`. All hunks applied cleanly, and A made no other edit to the 7 code files.
- Changed doc 239 l.4 to exactly `**სტატუსი:** Completed (stage 1 of 2; stage 2 in doc 240; C round 373 PASS)`.
- Wrote doc 240 (`docs/implementation/2026/quarter-IV/240-perf-status-store.md`) in Georgian, with the TEMPLATE headings in order. Its l.4 is exactly `**სტატუსი:** Completed (C round 373 PASS)`. It covers R-CALLTIME (with the playFrom reorder and the reviewer's describeSpaceStart note), R-PREVIEW-GUARD, R-KEY, TL-R372-M1, the trigger change, B's §0 perf numbers and the 6 mutants. A checked that every test id and file it names exists.

## Changed files (`git status`: 9 lines)
- M `app/components/arrangement/ArrangementMarkerRow.tsx`
- M `app/components/arrangement/StudioWorkspace.tsx`
- M `app/contexts/ArrangementContext.tsx`
- M `app/lib/arrangement/__tests__/helpers/workspace-probe.ts`
- M `app/lib/arrangement/__tests__/render-budget.test.tsx`
- M `app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx`
- M `app/lib/arrangement/status-preview-store.ts`
- M `docs/implementation/2026/quarter-IV/239-perf-status-probe-migration.md`
- ?? `docs/implementation/2026/quarter-IV/240-perf-status-store.md`

## Checks A actually ran (on A's tree)
| Check | Result | Log |
|---|---|---|
| SKETCH-EQUAL: `sha256sum -c b-round-372/sketch-files-sha256.txt` | rc 0, 7/7 OK (also re-run at the end) | — |
| Frozen: `sha256sum -c --quiet b-round-372/r373-frozen-sha256.txt` | rc 0 | — |
| Protected: `b-round-318/protected-sha256.txt` | rc 0 | — |
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0 (205 warnings and 1 info, repo-wide; Biome on the 7 files is clean) | `lint.log` |
| `npx biome check` on the 7 code files | rc 0, no fixes | `biome.log` |
| Covering: `xargs -a b-round-372/covering-373.txt npx vitest run` | 136 files and 2,153 tests pass, rc 0 | `covering.log` |
| The 4 status files, verbose (render-budget, selection-wrappers-render, status-lifetime, pending-status) | 63 pass | `changed-verbose.log` |
| `pending-status` + `status-lifetime` with `--sequence.shuffle --sequence.seed=42` | 43 pass | `shuffle.log` |
| Timeout headroom (L11: the higher of A's time and gate 372's `gates/round-372/verify.log` time) | `vitest.config.ts` sets no `testTimeout`, so the default is 5,000 ms. Every test over 2,500 ms in either log sits under a declared timeout:<ul><li>CP12a–d: describe 30 s (`clip-gain-pointer-preview` l.499); the maximum is 9,146 ms at the gate, 30 %.</li><li>TC10: describe 15 s (`transport-centre-ui` l.175–178); 4,492 ms at the gate, 30 %.</li><li>DXM3: 20 s (`mixer-onstate-colour-ui` l.344); 3,810 ms, 19 %.</li><li>UM1, UM3, UM4, UM9 X1: 20 s (`track-group-mix-ui` l.381). UM11: 20 s (l.767).</li><li>UC1, UC2, UC5: 20 s (`track-group-collapse-ui` l.478). GF5: 20 s (l.1123).</li><li>TG1, TG5: 20 s (`track-groups-ui` l.420).</li><li>render-budget "does not re-render clips…": per-`it` 15 s (l.323); 2,982 ms at the gate.</li></ul>None is above 50 %, so this is not a STOP | `covering.log` |
| ASSERT-COUNT `expect(`/`it(` (HEAD → tree) | render-budget 125/13 → 129/13; selection-wrappers-render 34/7 → 37/7; status-lifetime 145/21 → 145/21 | — |
| `grep -rn 'C round [0-9]* pending' docs/implementation` | 0 | — |

**Not run by A:** the speed rules leave these to C and the gate.
- the full vitest suite, `npm run build` and `npm run verify`;
- the mutants;
- the perf spec, MU-B-RECORD and the browser rows.

## Code review
- **First review:** the code-reviewer read all 7 code files and both docs. It found 0 Critical, 0 High and 0 Medium, and scored the change 8.5/10. The 5 Lows:
  1. **R-CALLTIME, second call-time read.** `placeInsertMarker` writes the marker before `setRange(null)`, so the stopped-text updater's `describeSpaceStart` reads a range that is about to be cleared. With no gesture active, `rewriteStoppedTruth` corrects it in the same call (LT13). During an active gesture it would stay wrong until release, but no production handler writes the marker during a gesture.
     - **Handled:** A documented it in doc 240. The code fix (clear the range before `writeInsertMarker`) would break SKETCH-EQUAL, so A did not apply it. → B (candidate row for PERF-11c-iii).
  2. **Same-batch preview "A" → `setStatus("B")` → `previewStatus("A")`.** This now shows the preview "A"; HEAD showed "B". It cannot happen today: the only caller, `ArrangementClip.tsx:614`, does no `setStatus` in the same event. → B, as a record.
  3. **`statusSequence` counts intermediate commits.** For example, playFrom from a stopped text gives +2, where HEAD gave +1. The span key still changes once per batch, so screen-reader behaviour is unchanged, and all covering tests pass. → B, a note for tests that assert `+1`.
  4. **Doc l.4 says "C round 373 PASS" before C has run.** This is mandated byte for byte by L28 and §1 item 7, so A did not change it.
  5. **Naming: `getStatus` → `getCommittedStatusText`.** The task fixes the name, so A did not change it. → B.
- **Delta re-review 1** (the R-CALLTIME note in doc 240): OK. The reviewer confirmed it against `ArrangementContext.tsx` l.908, 936–944 and 968–976, and against LT13.
- **Delta re-review 2:** A removed the loop-folder paths from doc 240's ტესტირება bullet (`b-round-372/covering-373.txt`, `a-round-373.md`), because C's DOCS row checks that every named file exists in the repo, and replaced them with the actual results. Reviewer: OK, every path the doc names exists. It found 2 wording Lows, which A applied: "ვინც" → "ყველა ფაილი, რომელიც", and l.5 "სამი ტესტ-ფაილი" → "ორი ტესტ-ფაილი და ტესტის helper `workspace-probe.ts`".
- **Delta re-review 3** (those two wording edits): OK, plus one missing comma on l.5. A applied it as the reviewer wrote it, a one-character punctuation fix; that last edit was not re-reviewed. No code file changed after the first review.
- **Architecture note** (signal, for B/root; no refactor this round): `status-preview-store.ts` now also owns the committed status. Keep one store, because adopting in a single `set` is the invariant. Possible follow-up: one bounded rename task (`status-store.ts`, `useArrangementStatus*`) with no behaviour change.

## B acceptance that A truly passed
- §1 items 1–6: the patch applied unchanged (SKETCH-EQUAL).
- §1 item 7: both docs (l.4 strings checked byte for byte).
- §2 checks: typecheck, lint, Biome on the 7 files, all 136 covering files, and the code-reviewer with a delta re-review.
- SOURCE-SCOPE: 9 lines; the frozen and protected checks give rc 0.
- ASSERT-COUNT: no count went down.
- **Not claimed:** CLAIMS, MUTANTS-TREE, PERF-INTERACT, MU-B-RECORD, STATUS-BROWSER, G373-AUTH, STUDIO-SMOKE-373 and the full DOCS row. These are C's rows.

## Known gaps
- No browser check by A: no perf spec, no mutants, no STATUS-BROWSER.
- The reviewer's Low 1 (describeSpaceStart during a gesture) has no production path today and stays unfixed. Fixing it would need a grant that differs from the sketch.

## Exact next C checks
1. From the loop root, run `bash b-round-372/claims-373.sh` and diff it against both outputs (K2 should be 9, K17 should be doc 240 files: 1).
2. MUTANTS-TREE on a `cp -a` copy (`run-all-373.sh`). The expected red counts are 2, 3, 1, 16, 1 and 11.
3. PERF-INTERACT:
   - start and stop components ≤ 11;
   - fade release-commits 2, the other drags 1;
   - range rows 0.
4. MU-B-RECORD (record only).
5. STATUS-BROWSER (a)–(e), comparing HEAD and A's tree at 1440×900 and 1280×720. Pay special attention to (a): the ruler-strip playFrom text, which the reorder touches.
6. G373-AUTH and STUDIO-SMOKE-373 at both viewports.
7. DOCS: the TEMPLATE heading order, and the named files existing.

## Scope completed
Only the round-373 task. A did not mark any backlog item done, made no commit or push, and touched no protected file.
