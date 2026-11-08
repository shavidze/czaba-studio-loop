# A round 400 — PERF-14b-i, completion (R-b′ for the Ctrl+D group copy, C-R399-01)

No STOP. B's patch applied byte-identical, doc 255 updated, all A checks run. The tree is consistent.

## Changed files (only the two grants in `b-round-399/grants-400.txt`)
- `perf/studio-lab-interactions.perf.spec.ts`: `git apply` of `b-round-399/sketch-400-group-copy.patch.txt` (patch sha256 `d1b8c17d693409d2…`, `--check` clean first). Result sha256 `fc804c3d3868f622c808d12738db53d38d18fe56f32a7dcd424b0d3631c0ab71` equals `b-round-399/sketch/interactions.sketch.ts`. No other edit.
- `docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md`:
  - title says round 399–400;
  - l.4 is `**სტატუსი:** In Progress (stage 2 of 4; C round 400 PASS)`;
  - new subsection "R-b′" with B's table, the HEAD-vs-sketch expected detail values, and the per-branch key names;
  - per-site rows: old 914–921 (copy id), new `copyAtRest`, 1076 (`copyBefore`), 1089 (own read), 1114/1116 (release), 1173/1175 (reset), 1178 (check f + new g/h), 1222 (detail);
  - budgets: `perf/budgets.interactions.json` is unchanged this round;
  - problems: the STOP is now history, with the D-29z1368 solution;
  - testing section rewritten with the round-400 results (the round-399 resources/scale runs are kept as labelled history);
  - TODO: RETRO 401, then 14b-ii.
  - `STOP` now appears once, only in the problems/solutions history. The 7 TEMPLATE headings are in order (`diff` against TEMPLATE is empty). Every `tmp/studio-real-loop/…` path the doc cites exists (checked by script).
- Round-399 files are untouched. The frozen manifest check passes (below).

## Checks (logs in `a-round-400/`)
| # | Command | Result |
|---|---|---|
| A1 | `bash b-round-399/claims-400.sh` | rc 0, **equal** to `claims-400-planning-output.txt` (`claims-start.txt`) |
| A2 | `npm run typecheck` | rc 0 (`typecheck.log`) |
| A3 | `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` | rc 0, 3 files, 54 tests pass (`perf-lib-vitest.log`) |
| A4 | Interactions spec alone on the working tree | rc 0, 464 s (7.7 min). `complete` true, `failures` [], `abortedAt` null ×6, `problems` [] ×6. **189 of 189 deterministic rows equal** `b-round-398/perf-head-interactions.json` (`a4-interactions-compare.txt`, `a4-interactions.json`, `a4-interactions-head.log`) |
| A5 | Same spec alone on a scratch copy with `b-round-398/sketch-14bii-lane.patch.txt` (rsync outside `store/`, `node_modules` symlinked) | rc 1, 539 s (9.0 min). **VIRT-RULE PASS** (below) (`a5-interactions-summary.txt`, `a5-interactions-virt.json`, `a5-interactions-virt.log`). Scratch deleted by absolute path (link removed first; the real `node_modules` is intact) |
| A6 | Claims at end | rc 0. The only differences are §7 facts: K6 (l.4 → round 400, stop-word 4 → 1, headings 7), K8 `doc255-now` → `a237066af561cb21`, K9 (`interactions-sha` → `fc804c3d3868f622`, `applies-to-tree` → no, `lane-applies` yes), K10 (5 / 0 / 1). K2 and K20 are unchanged (`claims-end.txt`, `claims-diff.txt`) |
| A7 | `code-reviewer` on the applied diff and doc 255 | 0 Critical/High. 1 Medium (doc), fixed. Lows below |
| extra | `sha256sum -c --quiet b-round-399/r400-frozen-sha256.txt` | rc 0, 0 failures (`frozen-check.txt`) |
| extra | `sha256sum -c b-round-318/protected-sha256.txt` | 11 OK |
| extra | `npx biome check perf/studio-lab-interactions.perf.spec.ts` | rc 1: "No files were processed": `perf/` is ignored by the Biome config. Round 399 got the same result (`a-round-399/biome-scoped.log`). Doc 255 is Markdown, which Biome does not check |
| extra | `git status --porcelain` / `git diff --stat -- app` | the same 9 paths (8 M, 1 ??), `app` diff empty |

Timeout headroom (L31): both runs are under 12 minutes (464 s and 539 s of the spec's 900 s).

### `drag-group-live` detail per pass
`a4-group-live-detail.txt`, `a5-group-live-detail.txt`.
- **Plain tree:**
  - `interact.harness.drag-group-live` and `.6x`: samples [1, 1, 1].
  - In every pass, both branches: `CopyReveals` 0, `OwnCopyObserved` true, `CopyBeforeSource` `mounted`, `FollowAtT0` `on`.
- **Lane sketch:**
  - `drag-group-live` and `.6x`: samples [1, 1, 1].
  - In every pass, both branches: `CopyReveals` 3, `OwnCopyObserved` false, `CopyBeforeSource` `setup-at-rest`, `FollowAtT0` `on`.

### A5 VIRT-RULE
- `complete` true; `abortedAt` null ×6; `problems` [] ×6.
- 264 rows, 0 with fewer than 3 non-null samples.
- 10 `interact.drag.group.*` asserts, 0 failing.
- `drag-group-live` / `.6x` ≥ 1 in every sample.
- `playingFollowAtT0` `on` in every pass.
- **A's failing-assert list (complete):** `interact.zoom.30.out.path-rewrites`, deterministic, median 2, samples [2, 2, 2], budget == 3. Expected; 14b-ii input.

## Code review (A7): findings and dispositions
- **Medium (doc), testing section:** it cited only round-399 results, including the "no Ctrl+D copy" failure. **Fixed:** the section was rewritten with the A4/A5 results. This also removed the stray `STOP` from the testing section.
- **Reviewer remark "l.4 looks premature":** not applied. L28 and §3 item 2 require this byte-exact string.
- **Low (doc), "`OwnCopyStart` HEAD line 1221, not 1222":** not applied. The reviewer had no shell and inferred the line from hunk offsets. My `git show HEAD:perf/studio-lab-interactions.perf.spec.ts | grep -n OwnCopyStart` gives **1222** (`a-round-400/head-line-numbers.txt`).
- **Low (spec, pinned, not edited; for B):**
  1. `CopyReveals` counts the id reveal plus release plus reset (3). The setup `copyAtRest` reveal is a second scroll that is not counted, so the real number of scrolls per pass on the sketch is higher, and the setup reveal is counted in both branch keys. **Doc fix (in grant):** the R-b′ bullet now says the at-rest reveal is not counted.
  2. `copyAtRest` is read before the Ctrl+click that adds the copy to the selection, while HEAD's `copyBefore` is read after it. If `readClipState`'s range fields ever depend on the selection, check (d) could false-fail on the virtualization path only. It does not happen today (A5: reset check green).
  3. In `readBesideClip`, the Follow re-enable click comes after the 1 px `scrollLeft` restore check, so a scroll caused by re-enabling Follow is not re-checked. This is harmless for `resetAfterDrag('move')` (Ctrl+Z).
  4. When `copyReleased` is null, `copyDelta` is NaN. Check (c) still fails, but only through the null lane id. This is fragile, not wrong.
- **Doc lines changed after the review:** the testing section (whole) and the R-b′ bullet on the sketch `CopyReveals` (the at-rest note). The spec did not change after the review.

## For B (proposals, not done)
- **Architecture note (reviewer, verbatim intent):** keep `readBesideClip` in the spec for now. It is test-only, has one caller family and has no app effect. At 14b-ii (Q-14B-PIN-GROUP-MEMBERS), one bounded task should decide whether to pin the group members or to move the reveal helper into `perf/lib/page.ts` with a vitest for the restore and Follow paths.
- **Alternative (reviewer):** one setup reveal that reads the id and the `ClipState` together. It saves a scroll and makes `CopyReveals` the true scroll count. It needs a new sketch, because the spec is pinned.
- Spec Lows 1–4 above are 14b-ii inputs.

## Known gaps
- Resources and scale specs were not re-run by A (frozen; round-399 runs stand, per §5). C re-runs them.
- `interact.zoom.30.out.path-rewrites` 2 vs 3 on the sketch stays open (14b-ii).
- Biome cannot check `perf/**` (it is ignored by config), so lint of the spec rests on typecheck plus B's sketch.

## Next C checks (§6)
- **INTERACT-HEAD:** expected values in `a-round-400/a4-interactions-compare.txt` and `a4-group-live-detail.txt`.
- **INTERACT-VIRT:** compare C's failing list against A's list above (`path-rewrites` only).
- **RES-HEAD / RES-VIRT / SCALE-HEAD / SCALE-VIRT:** not run by A this round.
- **PERF-LIB:** A3.
- **BUDGET-SHAPE:** compare against `a-round-399/budget-shape.txt`.
- **NO-APP-CHANGE**, **AUTH**.
- **SOURCE-SCOPE:** spec sha `fc804c3d3868f622…`; the end claims diff should equal `a-round-400/claims-diff.txt`.
- **DOCS:** doc 255 l.4, headings, R-b′ table, per-site rows. `grep -rln 'In Progress (stage' docs/implementation` should give 5.

## Scope
§3 items 1–2 are done. A1–A7 passed as listed. Whole-round acceptance is C's (INTERACT-*, RES-*, SCALE-*, DOCS, AUTH rows). The backlog is not marked.
