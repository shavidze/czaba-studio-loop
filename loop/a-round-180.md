# A round 180 — DUX-R-5b-3b: drag feedback + R35 import/Add go neutral

Status: **IMPLEMENTED — awaiting C round 180.** Nothing committed or pushed. No browser rows were run by A (C's).

## Baseline check (A's first step)
- HEAD `15189d5`; `sha256sum -c --quiet b-round-179-r180-tree-sha256.txt` OK (997); 6 grant start hashes OK.
- 13 base files on the start tree: **242/242**.

## Changed files (exactly 6 grants + 2 new; `git status` = 6 ` M` + 2 `??`)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | G1 (l.883) `border-muted bg-muted/20 text-muted`; G2 (l.884) `border-foreground bg-foreground/15 text-foreground`; G3 (l.919) muted; G4 (l.920) `…/20` foreground; R1 (l.842) `ring-foreground` / `ring-muted`; H1 (l.872) `cn()` removed → plain `className` ending `text-foreground` (data-testid / text unchanged); I1 (l.723) and I2 (l.731) `border-outline-strong … text-foreground`. |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | I3 (l.332) `border-outline-strong … text-foreground`, `disabled:opacity-40` kept. |
| `…/__tests__/affordance-colour-ui.test.tsx` | L1: TODO removed; `LATER_STAGE_BRASS_SITES` → `RETIRED_BRASS_SITES`, count 2 → 0; message `later-stage` → `retired` (Biome reflowed to one line). Test title DXA7 left unchanged. |
| `…/__tests__/lane-strings-ui.test.tsx` | L2: includes `border-outline-strong`, `text-foreground`; excludes + `border-brand`, `text-brand` (formatter split the arrays into multi-line). |
| `…/__tests__/library-row-strings-ui.test.tsx` | L3: same pattern for Add. |
| `docs/…/147-…label-status-colour.md` | D1: status Completed; note on the round-178 "B must decide" Problem (resolved in round 179, C-R179-DOC147-STALE); badge-selector TODO struck through and marked done in round 179; 5b-3b TODO links doc 148. |
| **new** `app/lib/arrangement/__tests__/drag-feedback-colour-ui.test.tsx` | N1: DXG1–DXG7. |
| **new** `docs/…/148-studio-dux-r5b3b-drag-feedback-colour.md` | D2, Georgian, TEMPLATE sections, status `In Progress (awaiting C round 180)`. |

Not touched: K7 sites (l.665/698/712/840 incl. `bg-brand/5`), every focus ring, all protected files (`git diff 15189d5` on routes, auth, firebase, styles, contexts, components/studio, .claude, download-routes test = empty).

Artifacts: `a-round-180/end-sha256.txt` (8 paths), `a-round-180/diff-vs-start.patch` (6 grants vs `b-round-179/r180-granted-start/` + 2 new files in full), `a-round-180/vitest-files.txt`, `a-round-180/out/vitest-final.json`, `a-round-180/out/mutations.txt`, `a-round-180/mutations/m291–m298.{json,diff}`, `a-round-180/tools/{run-mutation.sh,end-artifacts.sh}`, `a-round-180/end-copies/` (2 components).

## Tests and checks actually run
- After edits, 14 files (`vitest-files.txt`): **249/249** — 13 base = **242/242** (same count), N1 = **7/7**.
- `npm run typecheck`: exit 0. `npm run lint`: exit 0 (pre-existing warnings only; 0 in changed files). `npx biome check` on the 6 code/test files: 0 errors.
- AN-REVIEW selector regex on N1: 0 hits; N1 has 0 `querySelector` calls.
- Not run by A (per the speed rules): full suite, verify, build, e2e, browser rows.

## Mutations m291–m298 (each applied, 14 files run, restored, sha-checked OK)
| ID | Red | vs §4.1 |
|---|---|---|
| m291 | DXG1, DXG6, DXG7 | expected + DXG7 extra red (valid ghost loses `border-foreground`) |
| m292 | DXG2, DXG6, DXG7 | as expected |
| m293 | DXG3, DXG6 | as expected |
| m294 | DXG4, DXG6, **DXG7** | **differs**: §4.1 said DXG7 stays green; my DXG7 also requires `ring-muted` on the refused ring, so it is stricter |
| m295 | DXG4 | as expected |
| m296 | DXG5, DXG6, **LSU7** | **differs**: §4.1 expected lane-strings-ui green. LSU7 applies `importIncludes` to the compact button as well (start tree l.540), so the compact colour was already locked |
| m297 | DXG5, DXG6, LSU7 | as expected |
| m298 | DXG5, LPS1 | as expected |
No base test turned red where §4.1 required it to stay green, apart from m296/LSU7 as explained above. No "must turn red" test stayed green. Nothing was weakened; B rules on these.

## Code review (actual `code-reviewer` subagent, 9/10, 0 Critical/High/Medium)
Lows and how they were handled:
1. Silent loading loop in the mount helper → **fixed** (labelled `Error('source durations not loaded')`).
2. Structural lookups (row = `header.parentElement`, lane body = fold button by role/name → `aria-controls` → `getElementById`, clip = `dataset.clipId` among lane children + `firstElementChild`) → **kept, reported**. None uses a colour class and each throws a labelled Error. Strictly these go beyond "role/name/text/testid only"; B rules on it.
3. Two redundant `dataset.blocked` asserts in DXG3 after a filtered lookup → kept (harmless).
4. Old valid recipes not source-locked → **fixed** (DXG6 now also counts `'border-brand bg-brand/15 text-brand'`, `'border-brand bg-brand/20 text-brand'` and `'border-accent bg-accent/20 text-accent'` = 0).
5. `brassTokens` would match `accent-foreground` → **fixed** (neutral list: `focus-visible:ring-brand`, `accent-foreground`, `text-brand-foreground`).
6. Hardcoded 'Preview' / 'Add' → **fixed** (`studioLibraryPanelStrings`).
7. Doc 147 l.123 "C round 178 evidence; then Completed" TODO not struck → **left**: D1 says "nothing else". Proposal for B: strike it in a later doc touch.
After the fixes, the 14 files were rerun (249/249) and m291–m298 rerun; the red sets are unchanged.

**Architecture note (verbatim, for B):**
> Signal 3, the same costly region changing round after round: three nearly identical ~400-character button class strings (`ArrangementLane.tsx:723`, `:731`; `ArrangementLibraryPreview.tsx:332`) are edited in every colour round, and the ~80-line fake AudioContext/ResizeObserver test setup is duplicated again (`drag-feedback-colour-ui.test.tsx:30-107`). Keep both for now: no audio timing, refs, gesture lifecycle or Undo/Redo is involved, and extracting them mid-round would widen a frozen scope. The planner already tracks both (ROOT-RECON-GRID-HARNESS and the toggle-recipe extraction, doc 147:127-128). I saw no signs of mixed responsibility, ownership changes or new state.

## Process notes (honest)
- Lasting edits to the 2 components, 3 lock tests and 2 docs were made with Edit/Write. **N1 deviation:** two N1 debug/fix passes were applied with a python string-replace (shell) instead of Edit: a temporary debug log (restored from a copy) and the `laneMoveGhost(view, blocked)` / `ringTokens` change. The final N1 content was then edited further with Edit and fully re-verified.
- Behaviour fact found: during a refused lane move (to the video lane) the Lane renders **two** lane-move ghosts, the blocked one plus the kept last-valid one (`keptGhosts`, ArrangementClip l.575). N1 selects ghosts by `data-blocked`. C's CC-DRAG should expect both ghosts in the blocked state.
- In DXG4 the audio lane is the active track, so its body carries `bg-brand/5` (K7). The brand check on lane bodies is therefore limited to `ring-*` tokens.

## B acceptance — what A actually passed
- §1 G1–G4, R1, H1, I1–I3: implemented as written (unit-verified; browser rows are C's).
- §2 L1–L3, N1 (DXG1–7), D1, D2: done.
- §3 ownership: only the 8 paths; frozen 997 OK at the end.
- §4 base 242/242 before and after; N1 green; typecheck, lint and scoped biome clean; code-reviewer run and its Lows handled; mutations run (2 differ from §4.1, both stricter, reported above).
- Not claimed: any C row (CC-DRAG, CC-R35, NO-BRASS-DRAG, CONTRAST-DRAG, BEHAVIOUR-DRAG, INVENTORY-EXIT, ENV-VIS, RV1, G180-3, FUNC-SMOKE, PX-NET), gate rows, DUX-R-5 completion. Ableton parity: unverified (no source captured, §6).

## Exact next C checks
1. T180-TARGETED: `npx vitest run $(cat a-round-180/vitest-files.txt)` → 249/249 (13 base = 242).
2. SCOPE-180: `sha256sum -c a-round-180/end-sha256.txt`; frozen 997 at C's start and end; `git status` 6 M + 2 ??.
3. MUT-180: read `a-round-180/mutations/*.json|diff`; m294/DXG7 and m296/LSU7 differ from §4.1 (stricter).
4. CC-DRAG at 1440 and 1280. A blocked lane move shows 2 ghosts (blocked on Video plus the kept valid one). Valid = rgb(236,230,218), blocked = rgb(163,155,142).
5. CC-R35 (full/compact import, Add), NO-BRASS-DRAG, CONTRAST-DRAG, BEHAVIOUR-DRAG (synthetic file DragEvent), INVENTORY-EXIT, ENV-VIS, RV1 (changes only inside the import/Add boxes; the ghost/ring are not at rest), G180-3, FUNC-SMOKE-180, PX-NET/REG-HYD.

Scope completed: the A half of round 180. Backlog not self-marked complete.
