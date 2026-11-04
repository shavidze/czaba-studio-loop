# A round 332: PERF-DRAG-PREVIEW stage c2b-i (overview equality + track meter memo)

**Scope completed:** this B task only (§1.1–§1.3). The backlog is not marked complete. C verifies.

## Changed files (7, nothing untracked; `git diff --stat`: 257+/38−)
- `app/lib/arrangement/preview-store.ts`: from B's patch. Adds `OVERVIEW_CLIP_FIELD_ROLES`, `sameOverviewClipShownFields` and `sameOverviewArrangementShownFields`.
- `app/components/arrangement/StudioWorkspace.tsx`: from the patch. The overview wrapper's first selector now goes through `useEqualityStableSelector`, and the import is added.
- `app/components/arrangement/ArrangementTrackMeter.tsx`: from the patch. `ArrangementTrackMeterInner` is exported as `memo(...)`.
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`, `preview-store.test.ts`, `track-meter-ui.test.tsx`: from the patch, unchanged. They add DP29–DP32, PS-OVR-ROLES and PS-OVR-ARR, the GATE331-S3 try/finally, and the 4 name-string grant.
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`: edited by hand, per §1.3:
  - the l.1 title and l.4 status;
  - item 27 gets the S1 sentence, and item 30 adds `sourceOffset`;
  - a new section with items 31–34;
  - 4 new alternatives;
  - updates to the changed-files, problems, testing and TODO sections.
  - It also adds `ArrangementTrackMeter.tsx` to the l.5 project header, which fixes a Low from the reviewer. **This is the only hand edit that §1.3 does not list.**

`git apply -R --check b-round-331/sketch/sketch.patch.txt` passes, so every patch hunk is byte-identical to the sketch. A did not strengthen any row. These files are untouched: Lane, Overview, Clip, DetailPanel, Context, `perf/**` and the protected files.

## Rows (run by A)
| Row | Result |
|---|---|
| A-CLAIMS | `claims-332.sh` before editing = `claims-332-planning-output.txt` (diff empty) |
| A-IMPL | `git apply` clean; §1.3 by hand |
| A-CLAIMS-AFTER | `a-round-332/claims-after.txt`. Differs from `claims-332-sketch-output.txt` only on the allowed lines: K2 `c1d3fbf 7`, K13 `11`, K16 the new l.4, K17 `1 0 0 1`. K11 and K15 (16) are equal |
| A-SCOPE | 7 modified, 0 untracked |
| A-TYPE / A-LINT | typecheck rc 0 (`a-round-332/typecheck.log`); lint rc 0 (`lint.log`); `biome check` on the 6 patch files is clean (`biome-owned.log`) |
| A-UNIT | 30 covering files, **438/438** green (`a-round-332/covering-unit.log`). DP32 took 857 ms against the 5 s timeout. L31, above 50 % of the timeout: `render-budget.test.tsx` "does not re-render clips, overview bars, library rows or ruler ticks over Play → Stop → Play" took 2771 ms against the 5 s default (55 %). That test is pre-existing and unchanged. CP12a–d top out at 10169 ms against a 30 s timeout (34 %) |
| A-MUTANT | Scratch copy `/home/runner/a332-scratch/sc`, never `store/`. All 6 mutants are red on exactly the §0 rows, with `restored` true (`a-round-332/mutants-a.txt`) |
| A-REVIEW | The actual `code-reviewer` subagent ran on the 7 files (score 8.5/10). No Critical or High findings. Its findings are listed below |

A ran no browser or perf rows; C runs them.

## Code-reviewer findings (for B)
- **Medium (latent, not reproducible today), A-R332-REVIEW-OVERVIEW-PROP-TYPE.** `ArrangementOverviewProps.arrangement` is still a full `Arrangement` (`ArrangementOverview.tsx:22`). The stabilised object can therefore hold an old `loop`, markers or fade/gain. If the overview later reads one of those, it compiles and shows a stale value. Today it reads only `clips.length`, `id`, `trackId`, `start`, `duration` and `tracks[].id`/`kind`, so it is correct; the reviewer traced this. `extent` reads `loop` from the unstabilised prop.
  - Suggested fix: narrow the prop to a `Pick` projection inside `ArrangementOverview.tsx`. That file is outside A's ownership this round, so A did not touch it.
- **Low.** No row covers a committed loop or track change during the stabilised hold. A suggested row: toggle the loop after a fade preview and check `data-extent`.
- **Low.** DP32 uses a fresh mount for each variant, so it checks the roles record but never runs the stable selector; DP29 and the PS rows do that.
- **Low.** DP29–DP31 have no try/finally (same as DP2–DP28; RTL auto-cleanup handles unmount).
- **Low.** `b.clips[index]` is type-safe only because `noUncheckedIndexedAccess` is off.
- **Low.** `rolesSplit` and `ignoredFields` duplicate each other across two test files.
- **Low (fixed):** the doc's l.5 header now includes `ArrangementTrackMeter.tsx`.
- **Architecture note (proposal only, signal 3):** `StudioWorkspace.tsx:638-867`. c1, c2a and c2b-i each added a wrapper or selector with its own equality. Verdict: keep it for now. Proposal inside D-29z915: one "preview readers" module holding the `*_FIELD_ROLES` and equality pairs plus the overview projection type, with no behaviour change. This adds evidence to ARCH-R331-PREVIEW-READERS.

## Known gaps
- :5173 still serves A's tree after the scratch vitest runs (`a-round-332/server-check.txt`): `/studio-lab` returns 200, and both new names are present in the served modules.
- No browser or perf evidence from A, by design: DRAG-NAMES, PERF, OVERVIEW-SHOWN, METER-SHOWN, D-ROWS and G332-AUTH are C's.
- Full suite, build and `npm run verify` were not run by A (speed rules); they are gate rows.
- The scratch dir `/home/runner/a332-scratch` stays outside the loop folder and will not survive the job.

## Exact next C checks
1. `bash b-round-331/claims-332.sh` must equal `a-round-332/claims-after.txt`.
2. SOURCE-SCOPE: 7 files; `git apply -R --check` on the sketch patch passes; `git diff --quiet` on Lane, Overview, Clip and DetailPanel; protected files 11/11.
3. UNIT ×3 and MUTANT (plus one mutant of C's own) on C's scratch.
4. DRAG-NAMES on :5173, warm, 1440×900. Expect fade [11×4], trim [22, 2 …], move [21, 2, 21, 2, 103, 2, 21, 2], click [100, 2, 0].
5. PERF alone on a production build, compared with `c-round-331`: 83 EQUAL, and the 38 rows at or below B's sketch values.
6. OVERVIEW-SHOWN and METER-SHOWN at A versus HEAD (second server with its own `cacheDir`), both viewports.
7. D-ROWS (`DIFFS 0`, EXPORT sha equal), G332-AUTH and DOCS.
