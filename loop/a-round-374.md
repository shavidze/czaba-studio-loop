# A round 374 — PERF-11c-iii-a (Master strip + closed Export dialog leaves)

**Status:** implemented, reviewed, ready for C. No STOP.

## 1. Changed files (8 = 7 modified + 1 new; exactly the grants)
- `app/components/arrangement/ArrangementExportDialog.tsx` (M)
- `app/components/arrangement/ArrangementMaster.tsx` (M)
- `app/components/arrangement/StudioWorkspace.tsx` (M)
- `app/contexts/ArrangementContext.tsx` (M)
- `app/lib/arrangement/__tests__/context-hygiene.test.tsx` (M)
- `app/lib/arrangement/__tests__/pending-status.test.tsx` (M)
- `app/lib/arrangement/__tests__/render-budget.test.tsx` (M)
- `docs/implementation/2026/quarter-IV/241-perf-master-export-leaves.md` (new)

The 7 code files are B's sketch applied byte for byte: `sha256sum b-round-373/sketch.patch.txt` = `2d2dfcb9…0b60` = `sketch-dispatched.sha256`; `patch -p1` applied with no fuzz/offset; no other edit.

## 2. Checks actually run (logs in `a-round-374/`)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0, 205 warnings / 1 info, 0 errors, pre-existing (`lint.log`) |
| `npx biome check` on the 7 code files | rc 0, "Checked 7 files" (`biome.log`) |
| `xargs -a b-round-373/covering-374.txt npx vitest run` | rc 0: **140/140 files, 2195/2195 tests**, 190 s (`vitest-covering.log`) |
| L11 timeout check | no covering test above 50 % of its declared timeout. Slowest: CP12a 6.1 s / 30 s (gate 373 max CP12 7.0 s); TC10 3.3 s / 15 s (gate 2.9 s); DXM3 2.8 s / 20 s; UM3 2.7 s / 20 s |
| SKETCH-EQUAL `sha256sum -c b-round-373/sketch-files-sha256.txt` | 7/7 OK |
| Frozen `sha256sum -c --quiet b-round-373/r374-frozen-sha256.txt` | rc 0 |
| Protected `sha256sum -c --quiet b-round-318/protected-sha256.txt` | rc 0 |
| ASSERT-COUNT (`expect(` / `^\s*(it|test)(\.each)?\(`) | context-hygiene 52/14, pending-status 86/23, render-budget 140/15 = `expect-counts-374.txt` |
| CLAIMS `bash b-round-373/claims-374.sh` (`a-round-374/claims-374-a.txt`) | rc 0, 0 MISSING. vs sketch output: only K2 (7 → 8) and K16 (`doc 241 files: 1`, doc 238 l.4 unchanged) differ, as the task expects |
| Doc 241 | l.4 `**სტატუსი:** Completed (C round 374 PASS)`; TEMPLATE's 7 headings in order; `C round N pending` hits in `docs/implementation`: 0; doc 238 unchanged |

## 3. Not run by A (C's rows)
PERF-INTERACT, PERF-RESOURCES, MUTANTS-TREE, MASTER-BROWSER, EXPORT-DIALOG-BROWSER, STATUS-LT12-BROWSER, G374-AUTH, STUDIO-SMOKE-374. Full vitest, build, `npm run verify` and e2e smoke are gate rows. `browserVerified`/`realVerified` are C's to set.

## 4. Code review (code-reviewer subagent, real)
- First review of the 7 code files + doc: **no Critical/High/Medium**, score 9/10. Lows:
  - A-R374-REVIEW-L1 (doc): helper named `use<Name>Context` → fixed to `use<Name>StoreContext` (doc l.30, l.59).
  - A-R374-REVIEW-L2 (doc): scroll-lock close delta not listed → bullet added (doc l.36), verified against `useScrollLock.ts:52-62`.
  - A-R374-REVIEW-L3 (code, known): Content's dead `isOpen` branches = B-R373-EXPORT-CONTENT-DEAD-ISOPEN (deferred). Not touched (SKETCH-EQUAL).
  - A-R374-REVIEW-L4 (test gap, known): RB-LEAF1 misses a revert to `<ArrangementMaster />`; reviewer's optional fix: also assert `counts.get('ArrangementMaster') ?? 0` is 0. Not applied (test file must equal sketch); for B.
- Delta re-review of the doc edits: **PASS, no findings**; l.4 confirmed byte for byte.
- **Architecture note (proposal for B/root, not acted on):** the workspace now builds a memoised actions object per leaf (round 371 + this round, and -b/-c will repeat it). Keep for now; pattern B (a stable actions context separate from data stores) belongs to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, not one leaf at a time.

Final state after the doc edit: `git status` 8 lines; sketch-files 7/7 OK; frozen rc 0; protected rc 0. Code was not changed after the review, so typecheck/lint/biome/vitest results stand.

## 5. Known gaps
- Low B-R373-EXPORT-CONTENT-DEAD-ISOPEN (deferred by B): the Content's `isOpen` branches are always true now.
- RB-LEAF1 does not catch a revert of the StudioWorkspace site to `<ArrangementMaster />` (the wrapper's child memo bails out); only PERF-INTERACT's zoom/release counts catch it (accepted in `sketch-review.md`).

## 6. Exact next C checks
§3 table of `current-task.md`: SOURCE-SCOPE (8 lines), CLAIMS, SKETCH-EQUAL, ASSERT-COUNT, UNIT (+ shuffle seed 42 on pending-status and context-hygiene), MUTANTS-TREE, PERF-INTERACT (zoom.1 = 67, zoom.30 = 154, release max −6), PERF-RESOURCES, the five browser rows at 1440×900 and 1280×720, DOCS.

## 7. Scope completed
Stage a of PERF-11c-iii only. PERF-11c and the backlog are not complete.
