# A round 166: V-3c-3b (D-29z131), marker ◀ ▶, detail toggle, grid ✓ and `← CZABA` changed to lucide icons

**Status:** implemented. Waiting for C. I ran no browser rows; those belong to C. realVerified = false until C runs them.

## Start check
- HEAD `75814838b35be7f3ac8befa2c2f007b0cde51d28`, clean tree, 984 files.
- The 973 frozen files match (`sha256sum -c --quiet`), and so do the 11 grant start hashes.

## Changed files (all within the grants)
| File | IDs |
|---|---|
| `app/components/arrangement/ArrangementMarkerRow.tsx` | K0, K1. New const `MARKER_STEP_BUTTON_CLASS` = `${MARKER_HEADER_BUTTON_CLASS} inline-flex items-center justify-center`. `MARKER_HEADER_BUTTON_CLASS` and the add button (`+`) are byte-identical. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | P0, P1 |
| `app/components/arrangement/ArrangementGridMenu.tsx` | G0, G1 (3 spans) |
| `app/components/arrangement/StudioWorkspace.tsx` | W0, W1. 2 hunks at default context. `-U0` shows 3, because W1's class line and children lines sit 2 lines apart. |
| `app/lib/arrangement/strings.ts` | S1 (only `expandText` and `collapseText`) |
| `app/lib/arrangement/__tests__/strings.test.ts` | l.2164/2165 expected values; LG4 added after LG3 |
| `app/lib/arrangement/__tests__/detail-panel-strings-ui.test.tsx` | l.206 → `'Collapse'`, l.215 → `'Expand'`; DPS5 added |
| `app/lib/arrangement/__tests__/grid-triplet-ui.test.tsx` | l.570 `.replace('✓','')` dropped; TU11 added |
| `app/lib/arrangement/__tests__/marker-strings-ui.test.tsx` | MS4 added |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | TS7 added |
| `docs/implementation/2026/quarter-IV/134-studio-marker-gesture-commit-guard.md` | D1: only l.4 changed |
| **new** `docs/implementation/2026/quarter-IV/135-studio-v3c3b-marker-detail-grid-exit-icons.md` | D2, Georgian, status `In Progress (awaiting C round 166)` |

All 11 grants were needed and used.

## Tests and commands (actually run)
- **Baseline:** the 11 files in `a-round-166/vitest-files.txt` passed **206/206** (`a-round-166/vitest-baseline.json`).
- **After the edits:** the same 11 files passed **211/211**. MS4, DPS5, TU11, TS7 and LG4 are present and green. Final run after all mutations were restored: `a-round-166/vitest-after.json`.
- **TU11 bug during writing:** the first version of TU11 failed with `ReferenceError: laneBody` because it was not destructured from the mount helper. I fixed it before the run above.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. It reports 218 warnings and 1 info across the repo. The scoped Biome run shows none of them are in the 10 owned code and test files, so they are not from this round.
- **Read-only `npx biome check` on the 10 code and test files:** clean after one formatter fix in TS7 (a long `expect` line), which I made with Edit.
- **`expect(` counts per test file** (`a-round-166/expect-counts-{before,after}.txt`). No file dropped.

| File | Before | After |
|---|---|---|
| strings | 531 | 535 |
| detail-panel-strings-ui | 33 | 48 |
| grid-triplet-ui | 100 | 112 |
| marker-strings-ui | 25 | 40 |
| transport-surface-ui | 56 | 67 |

- **Not run by A (speed rules):** the full suite, verify, build, e2e and every browser row.

## Mutations (`a-round-166/mutations/m18x.json` + `-vitest.json`; tool `a-round-166/tools/mutate.cjs`)
Each mutation was applied as a temporary shell write, then restored. Each restored file's sha256 equals the post-edit hash (`a-round-166/post-edit-sha256.txt`, re-checked OK after all runs).

| ID | Mutation | Red |
|---|---|---|
| m185 | prev icon `size-2.25` → `size-2.5` | MS4 |
| m186 | `inline-flex items-center justify-center` added to `MARKER_HEADER_BUTTON_CLASS` | MS4 |
| m187 | toggle `pl-2 pr-1` → `px-2` | DPS5 |
| m188 | collapsed icon `ChevronRight` → `ChevronDown` | DPS5 |
| m189 | radio `Check` rendered for every radio | TU11 |
| m190 | exit `ArrowLeft` → `ChevronLeft` (import + use) | TS7 |
| m191 | `collapseText` → `'Collapse ▾'` | DPS1, DPS5, ST41, LG4 |

All 7 were killed. m191 also turned ST41 red (the literal map test), which B did not predict.

## Code-reviewer (actual subagent, run on the saved diff `a-round-166/code-diff-for-review.patch`)
Score 9/10. No Critical, High or Medium findings. The reviewer found the scope matches §1/§2, checked that the Tailwind v4 classes are valid (`size-2.25` = 9 px, `gap-0.75` = 3 px), and its box arithmetic agrees with B's probe.

Info and Low findings, not changed because the spec requires the current form:
1. **Info:** the svg `aria-hidden` assertions cannot fail on their own, because lucide adds `aria-hidden` by default (INFO-R160-M160-EQUIVALENT).
2. **Info:** TU11's empty-slot `childNodes` length 0 check would also have passed on the old `''`. m189 is caught by the radio-sum and checked-filter assertions.
3. **Low:** LG4 duplicates the updated literal map. §2 asks for it.
4. **Low, UX:** the exit link's accessible name `CZABA` does not say "back to the store". The old name did not either. This is user-vetoable ruling R3. A possible later `aria-label` belongs to Saba or DUX.
5. **Nit:** the `Check` is inside a span that is already `aria-hidden`. Kept for recipe consistency.
6. **Nit:** the toggle could use a single icon variable. The explicit branches map directly to m188.

**Architecture note (verbatim):** "None. The diff only changes children and classes in four leaf render sites. It adds no state, effect, listener or ownership change, so none of the four signals applies. This is a review of the diff only, not of the whole modules."

## End state
- The 973 frozen files are OK. The protected diff vs `7581483` is empty: purchase and auth routes, contexts, styles, root, ui/icons, `collection.ts`, every other Arrangement component, `studio-lab.tsx` and the 6 frozen neighbour tests.
- `git status --short` shows 11 ` M` (the grants) and 1 `??` (doc 135), nothing else.
- `a-round-166/end-sha256.txt` covers 12 paths. `a-round-166/diff-vs-start.patch` is against `b-round-165/r166-granted-start/`, with doc 135 as a new file.
- No commit, push, stash, install or build.

## B acceptance that A passed
- §1 K0/K1, P0/P1, G0/G1, W0/W1, S1, D1, D2 are implemented as specified.
- §3: baseline 206/206; after 211/211 with the 5 new locks; typecheck, lint and scoped Biome are clean; `expect(` counts did not drop; m185–m191 are all red and restored; code-reviewer done; end files written.
- Not claimed: every C row (T166-TARGETED re-run, SOURCE-SCOPE, AN-REVIEW, ICON-V3C3B, ICON-BOX, RV1-V3C3B, FUNC-SMOKE-V3C3B, G166-3, PX-NET/REG-HYD) and the gate rows.

## Known gaps
- Nothing has been verified in a browser by A. The ±1 px box claims rest on B's probe 2 simulation until C measures the real build.
- The exit link's name is now `CZABA` (R3, user-vetoable).
- `+` stays text (R5, Q-V3-ICON-SIZE).
- **ENV-FIRST-LOAD-LUCIDE:** the 4 new lucide imports may cause an "Invalid hook call" on the first cold-Vite load. C may replace one such load.

## Exact next C checks
1. T166-TARGETED: `npx vitest run $(cat a-round-166/vitest-files.txt)`, expect 211/211 including MS4, DPS5, TU11, TS7 and LG4.
2. SOURCE-SCOPE: `sha256sum -c` against the frozen 973 and against `a-round-166/end-sha256.txt`, plus the `git status` shape.
3. AN-REVIEW: read `a-round-166/diff-vs-start.patch`.
4. ICON-V3C3B, ICON-BOX (against `b-round-165/out/v3c3b-final.json` `before`), RV1-V3C3B (d6 plus the rename map), FUNC-SMOKE-V3C3B (click on the svg centres), G166-3 and PX-NET/REG-HYD, at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`.
