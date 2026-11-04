# A round 338: PERF-DRAG-PREVIEW stage c3-ii (cross-lane ghosts → per-provider store)

**Base:** `bbc281f` (clean tree before edits). **Route:** B's three patches (`b-round-337/sketch/{sketch,spec,budgets}.patch.txt`) applied with `git apply` (clean). A read each hunk against §0.2/§1.2/§1.3, then edited docs 232 and 168 by hand. A added no code beyond the sketch and removed or weakened no assertion.

## Changed files (exactly the 16 granted; `git status` = 16 entries: 14 M, 2 ??)
- new: `app/lib/arrangement/clip-lane-drag-store.ts`, `app/lib/arrangement/__tests__/clip-lane-drag-store.test.ts`
- `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementClip.tsx`, `ArrangementLane.tsx`, `StudioWorkspace.tsx`
- tests: `drag-preview-render.test.tsx` (DP49, DP50, probe, import); `gesture-guard`, `shortcut-sheet-ui`, `track-groups-ui`, `workspace-strings-ui`, `track-group-collapse-ui` (probe lines, types and imports only)
- `perf/studio-lab-interactions.perf.spec.ts`, `perf/budgets.interactions.json` (7 rows)
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`:
  - title, l.4 status, l.5 files;
  - item 3 superseded note; item 46 "(own store)";
  - new c3-ii section (items 47–52), 2 alternatives, c3-ii Mermaid;
  - files, TL-1 problem → solution;
  - tests (DP49, DP50, CL1–CL4, mutants, perf, probe) and TODO.
- `168-perf-interactions-baseline.md`: `## მეტრიკები` l.87 and l.111 only.

Protected files are unchanged: `git diff` is empty on `app/routes` and `download-routes.test.ts`, and K8 is 11 OK. No dependency or config change.

## A rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | Equal to `claims-338-planning-output.txt` | `a-round-338/claims-pre.txt` |
| A-CLAIMS final | Differs from `claims-338-sketch-output.txt` in **K2** (`bbc281f 16`), **K16** (`0 2 7 11 0`) and **K23** (`3 1 0 1`). K23 is not in the A-CLAIMS exception list. Its values are exactly the "A" values that §7 K23 itself specifies: the doc 168 lane sentence goes 1 → 0, and doc 232 "(preview store)" goes 2 → 1. The sketch had no doc edits. All other K lines are equal | `a-round-338/claims-final.txt`, `claims-final-vs-sketch.diff` |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-338/typecheck.log` |
| A-LINT | `npm run lint` rc 0, 205 warnings (= gate 337's 205), 1 info. Biome on the owned code, spec and json files rc 0 | `lint.log`, `biome-owned.log` |
| A-UNIT | Covering list: 18 files, 446 tests, all pass | `covering-unit.log` |
| A-MUTANT | 6/6 red on the named rows: MU-WS-SUB → DP49; MU-CLIP-GUARD → DP49; MU-GUARD-V2 → DP49 at l.580 `isArrangementPreviewActive()`; MU-LANE-ALL → DP49; MU-REFUSAL → DP50; MU-CLEAR → DP5b + DP49. Run on the scratch copy `/home/runner/a338-scratch`, deleted afterwards | `unit-mutants-summary.txt`, `unit-mutants/*.log` |
| A-PERF | Production build, run alone: rc 0, `complete` true, `failures` [], 193 rows, **43/43 asserted pass**. Against `c-round-337`: 131 EQUAL, 0 NEW, `ids-equal 193`, and exactly the 8 DIFF rows of §0.3:<br>• lane `move-components-per-move` (1x and 6x, both states): 58.969 → 24.906<br>• same-lane `interact.drag.move.*.move-components-per-move` (1x and 6x): 24.267 → 22.8<br>Liveness [1,1,1] at 1x and 6x; check (e): entry start 1 → cross 2 | `perf.log`, `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c337.txt`, `rowids-equal.txt` |
| A-SCOPE | 16 entries (2 untracked, 14 modified); `test-results/` is gitignored. Removed `expect(` lines in the test diff: 0. `git apply -R --check` of the three B patches: OK | `git status` above, `a-round-338/expect-removed.txt` |
| A-REVIEW | `code-reviewer` subagent run: 0 Critical, 0 High, 0 Medium. Findings below | this file |

## code-reviewer findings and disposition
The reviewer had no shell and read the files directly, so it could not diff the 6 probe lines against `bbc281f`. The K7 and K18 claims and A's own reading of each probe hunk cover those lines.
1. **Low:** `selectLaneDragGhosts` returns a fresh `[]` when a drag exists but the lane has no ghost, while CL2's title says "shared empty array". It is harmless at runtime because of `useShallow`. **Not changed**, so B's sketch stays byte-equal for C's `git apply -R --check`. Sent to B as A-R338-REVIEW-CL2-SHARED-EMPTY (deferred Low candidate).
2. **Low (missing test):** trim and fade that return to the start value also reach the new identity branch, because the model returns the same object. The reviewer found the behaviour equivalent: readers show `preview ?? arrangement`, and the commit is a no-op as before. **Not added** this round: task §1.1 (first ruling line) already rules on this. The identity clear branch wins over "same-lane trim/fade/move behaviour unchanged", it fires only when `next` is the exact published `present`, and for those callers it means "no preview". DP5b pins it. Sent to B as A-R338-REVIEW-IDENTITY-TRIM-TEST. Proposed DP row: trim out and back, then preview null, preview active true, release undo null, provider 0 renders.
3. **Low (docs):** doc 232 item 3 said cross-lane stays on `previewArrangement`. **Fixed** with a superseded note pointing to item 51.
4. **Low (naming):** the names mix `ClipLaneDrag*`, `LaneDrag*` and `LaneMove*`, and the setter is both `setDrag` and `setClipLaneDrag`. B and TL-2 fixed these names, so A **did not change** them. Sent to B; it fits the same deferral as A-R337-REVIEW-HELPER-NAMES.
5. **Info:** one long line in `StudioWorkspace.tsx`; Biome passes.

Also fixed after an advisor note: a Mermaid label in the new diagram used `;`, now commas.

**Architecture notes (proposals for B/root, not done):**
- (a) The ownership move to `lib/arrangement/clip-lane-drag-store.ts`: keep it. It matches the range, selection and preview stores.
- (b) `previewClipGeometry` and the release logic now have a third publish path. Proposal: one bounded docs/test-table task that writes down the publish rules (publish, keep local, reset to published). No extraction.

## Known gaps / not done
- The browser rows (CROSS-NAMES, CROSS-BEHAVIOUR, G338-AUTH, STUDIO-SMOKE-338) belong to C. A ran no browser probe against :5173.
- Escape during a cross-lane drag still does not cancel it. This is pre-existing (C-R85-L1 / ESCAPE-CANCEL-GESTURE) and unchanged.
- Signals for c4: SIG-R338-GHOST-LAYER and SIG-R338-GROUP-CROSS-PREVIEW, recorded in the doc 232 TODO.
- Full vitest, build, verify and e2e smoke are gate rows that A did not run (speed rules). The perf run's webServer step did run `npm run build` successfully.
- B spec inconsistency: the A-CLAIMS exception list omits K23 (see the table).

## Exact next C checks
1. `bash b-round-337/claims-338.sh`: expect it to equal `a-round-338/claims-final.txt`.
2. SOURCE-SCOPE: 16 files. `git apply -R --check` of the three B patches (A applied them verbatim, with no hunk changed). `expect(` counts equal to the sketch.
3. UNIT twice on a scratch copy. MUTANT: the 6, plus C's own with a prediction.
4. PERF alone on a production build: expect the numbers above.
5. CROSS-NAMES / CROSS-BEHAVIOUR:
   - Run `node b-round-337/cross-lane-probe.mjs` on A's tree (:5173) and on HEAD `bbc281f` on a second dev server with its own `cacheDir`, at 1440×900 and 1280×720.
   - Expect 5 per cross-lane commit, with provider and workspace false and hooks [].
   - Expect enter [101] and release [106] with hooks [0,16].
   - Expect BEHAVIOUR-DIFFS 0, plus a screenshot mid-drag.
6. G338-AUTH, and STUDIO-SMOKE-338: move a clip by its name bar while playing, Export WAV, 0 page errors.
7. DOCS: doc 232 l.4 byte-exact, 7 `## ` headings in order, and every cited DP49/DP50/CL1–CL4 exists. The doc 168 diff is only l.87 and l.111.

## Scope completed
These A rows passed as described: A-CLAIMS (with the K23 note), A-TYPE, A-LINT, A-UNIT, A-MUTANT, A-PERF, A-SCOPE, A-REVIEW. A claims no C rows or gate rows, and marks no backlog item complete.
