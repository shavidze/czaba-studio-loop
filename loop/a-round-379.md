# A round 379 — PERF-11c-iii-c2b (MarkerRow leaf)

**Status:** implemented and handed to C. No STOP. Code-reviewer done: 0 Medium+ (1 Low, 1 info, 1 architecture note → B).

## 1. Changed files (exactly the 4 grants, `b-round-378/grants-379.txt`)
- `app/components/arrangement/ArrangementMarkerRow.tsx` (M) — sketch
- `app/components/arrangement/StudioWorkspace.tsx` (M) — sketch
- `app/lib/arrangement/__tests__/render-budget.test.tsx` (M) — sketch
- `docs/implementation/2026/quarter-IV/245-perf-marker-row-leaf.md` (new) — doc 245

Sketch application:
- `sha256sum b-round-378/sketch.patch.txt` = `eaa1b3fdf040cf8077143f0ba8ae6e602ba8e983381b26171298cd99d357f067` = `sketch-dispatched.sha256` (v2).
- Tree was clean at `3ae2885` before the patch (0 status lines).
- `patch -p1 < ../tmp/studio-real-loop/b-round-378/sketch.patch.txt` applied with no fuzz/offset; `sha256sum -c b-round-378/sketch-files-sha256.txt` → 3/3 OK.
- No edit beyond the patch in the three code/test files.

## 2. Checks run by A (logs in `a-round-379/`)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0; 205 warnings, 1 info — pre-existing repository-wide count (`lint.log`) |
| `npx biome check` on the 3 code/test files | rc 0, "Checked 3 files … No fixes applied" (`biome.log`) |
| `npx vitest run` render-budget, markers-ui, markers-move-ui, marker-time-snap-ui, grid-snap-menu, studio-focus-ring, strings | 7 files / 210 tests passed, rc 0 (`vitest.log`); RB-LEAF6 passed (271 ms) |

**Timeout check (L11):** `vitest.config.ts` sets no `testTimeout` (default 5,000 ms). render-budget describe (l.317) has no describe-level timeout; some `it`s declare 15,000 ms. Slowest tests:
- render-budget "does not re-render clips…" 2,687 ms / 15,000 (18 %)
- render-budget "does not re-render the detail panel…" (l.485, default 5,000) 1,770 ms (35 %) — highest ratio
- render-budget RB-IM 1,622 ms / 15,000 (11 %)
- grid-snap-menu GM1 1,169 ms / 15,000 (8 %)
- render-budget "moves the playhead…" (l.442, default 5,000) 1,102 ms (22 %)

No test above 50 %. render-budget file time not separately printed in verbose run; K21 gate-378 reference 10,736 ms for the file.

**Scope self-check:** `git status --short --untracked-files=all` = 4 lines (3 M + doc 245); `sha256sum -c --quiet b-round-378/r379-frozen-sha256.txt` rc 0; `b-round-318/protected-sha256.txt` rc 0; `grep -rn 'C round [0-9]* pending' docs/implementation` 0 hits.

## 3. Doc 245
- l.4 byte for byte: `**სტატუსი:** Completed (C round 379 PASS)`.
- TEMPLATE headings in order: კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, TODO / შემდეგი ნაბიჯები.
- Cited row ids exist (grep): RB-LEAF6 (render-budget), MU8c/MU8d/MU8e (markers-ui), GM44/GM45 (grid-snap-menu), MV15/MV16/MV17 (markers-move-ui). Mutant ids and red lines taken from `b-round-378/mutants/sketch-run/*.full.log` (l.981 ×3, l.966 HEAD-REVERT, noted as name-absent guard).
- Loop paths written as `tmp/studio-real-loop/…`, labelled as outside the repository.
- No `C round N pending` form.
- Headings: `diff` of TEMPLATE's `## ` lines (minus `## Prompt`) vs doc 245's `## ` lines → identical (HEADINGS-EQUAL).
- After advisor check: removed an unverified cause from the leaf-probe sentence (why the Undo/Redo button renders ViewInner 1); the number stays, no cause is claimed.

**Lint baseline:** `gates/round-378/verify.log` also reports `Found 205 warnings` → same count as A's tree.

**L50 grep on A's tree (for C's L50-RULING row; note for B):** 12 hits at lines 275 296 307 450 606 723 893 919 972 989 992 999. Count = 12 as specified, but only the first 3 are HEAD + 70. The other 9 are **HEAD + 71**, because sketch v2 added the `pendingFocusRef.current = null;` line in `focusEditorSuccessor` (l.404), above them. `b-round-378/l50-focus-origins.txt`'s "sketch lines" (449, 605, 722, 892, 918, 971, …) match v1. The tree equals the dispatched v2 sha (3/3 OK), so this is a stale line reference in the task/artifact, not a code deviation. C should compare by HEAD + 70/71 with this explanation, not FAIL on the offset.

## 4. Code-reviewer (actual `code-reviewer` subagent, read-only, on the applied diff; score 8/10; it ran no commands)
No Critical, High or Medium → no STOP. No code changed after the review.
- **A-R379-REVIEW-L1 (Low):** RB-LEAF6 does not cover source-import / peaks / export-progress commits. The reviewer traced the 11 Picked callbacks (`playFrom` → `startPlaybackAt` deps ArrangementContext.tsx:1520-1529, `seekTo` → `startGraph`) and found none depends on `collection`/`sourceStates`/`exportProgress`; the one state-dependent callback (l.1584, `collection.sources`) is not in the Pick. No churn today; a future guard would be one source-state step in RB-LEAF6. Not applied (test edit beyond the patch = L11 STOP). For B as deferred Low.
- **A-R379-REVIEW-I1 (info, pre-existing):** `focusEditorSuccessor` returns `true` when the flag is not connected, so StudioWorkspace's `trackRowNameButton` fallback (StudioWorkspace.tsx:2266-2271) is skipped. Same as HEAD; matches B's TL-R379-L1 ruling (`return false` rejected on purpose).
- **Confirmed by reviewer:** memo inputs stable (`markers` identity via `NO_MARKERS`, numbers, refs); handle re-binds on `projectEnd` (Trim step in RB-LEAF6); no-deps effects still fed by row renders; the new `pendingFocusRef` clear is correct and needed; strict TS clean (no any/assertions/suppressions); RB-LEAF6 not vacuous (positive control =1, StudioWorkspace >0 in loop, final M handle check).
- **FORWARDREF_COMPONENT deviation (info, per task §2.1):** `handleRef` replaces `forwardRef`/`displayName` by ruled design; reviewer was told to treat it as info and raised nothing.
- **Architecture note → B signal:** fifth `use*Actions(workspace)` hook with a hand-kept `Pick<>` (StudioWorkspace.tsx:1037, 3527-3536); region changed rounds 374-378. Reviewer verdict **keep** (explicit, tested per leaf, low cost); alternative = stable-actions context (= TL-R379-ARCH / SIG-R379-ACTIONS-CONTEXT). Not extracted.

## 5. Known gaps
- A ran no browser rows; LEAF-PROBE, MARKER-BROWSER, STUDIO-SMOKE-379, G379-AUTH, PERF-INTERACT and MUTANTS-TREE are C's.
- Full suite / `npm run verify` / build not run by A (speed rules; gate rows).

## 6. Exact next C checks
Task §4 rows as written: SOURCE-SCOPE (expect 4 status lines: 3 M + `?? docs/…/245-perf-marker-row-leaf.md`), CLAIMS, SKETCH-EQUAL, ASSERT-COUNT (214/20), UNIT (145 files + shuffled seed 42), MUTANTS-TREE, PERF-INTERACT, LEAF-PROBE, MARKER-BROWSER, G379-AUTH, STUDIO-SMOKE-379, L50-RULING (12 hits at HEAD+70), DOCS.

## 7. B acceptance criteria A can mark
- §2.1 sketch applied, 3/3 sha OK, no extra edits — done.
- §2.2 doc 245 written with required content — done (C verifies DOCS row).
- §3 typecheck/lint/Biome/7 covering files — passed.
- §3 code-reviewer — done, findings recorded in §4, no Medium+.
- All §4 C rows — not A's to mark.
