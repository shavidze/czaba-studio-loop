# A round 222 — B-R220-LEGACY-EXPORT-NO-STEMS (Medium)

**Status:** implemented and handed over to C. No STOP was raised. No covering test failed or ran slow (L32): the slowest row, ES1, took 312 ms against the 5 s vitest default. No regression was found (L33).

## Baseline (start)
- HEAD `6dd45a1eb0f2a756de3168e950707a89aa6942df`, and the tree was clean.
- `sha256sum -c b-round-221-r222-tree-sha256.txt` returned rc 0. The root-owned 3 files were OK, and the grant start sha was OK.

## Changed files (scope at end)
- `M app/components/studio/ExportDialog.tsx` (grant 1, narrow). Only the selection state changed:
  - one pure helper, `createStemIdSetKey` (unique IDs, sorted, `JSON.stringify`);
  - a `selectionStemIdSetKey` state;
  - a lazy `selectedStems` initializer;
  - a render-time adjustment `if (selectionStemIdSetKey !== stemIdSetKey) { set key; select all current IDs }`.
  - Unchanged: JSX, classes, copy, `toggleStem`, `toggleAll`, `handleExport`, `handleAbletonExport` and the 10 old warnings.
- `?? app/lib/__tests__/legacy-export-dialog-stems.test.tsx` (new): rows ES1–ES7.
- `?? docs/implementation/2026/quarter-IV/174-legacy-export-dialog-stem-selection.md` (new). Line 4 is byte-exact `**სტატუსი:** Completed (C round 222 PASS)`.
- End checks:
  - `git status` shows only the 3 entries above;
  - the frozen `sha256sum -c` returns rc 0;
  - the root-owned 3 return rc 0;
  - HEAD is unchanged.

## Tests actually run (logs in `a-round-222/`)
| Check | Result |
|---|---|
| Red-proof, start copy (`redproof-start-copy.log`) | **ES1, ES5, ES6, ES7 red**; ES2, ES3, ES4 green. See "First failing assertions" below. |
| Mutant 1: `useEffect(() => reset, [state.stems])` (`mutant-useeffect.diff`, `redproof-mutant-useeffect.log`) | **ES3 red** (`['Stem a','Stem bMuted','Stem c']` vs `['Stem a','Stem c']`) and ES4 red. The other 5 are green. The start file was restored and its sha checked OK. |
| Mutant 2: key without `.sort()` (`redproof-mutant-ordered-key.log`) | ES4 red, 6 green. The fix was restored (cmp identical). |
| Final: `CI=true npx vitest run app/lib/__tests__/legacy-export-dialog-stems.test.tsx` (`final-run.log`) | **7/7 passed.** File tests took 736 ms (re-run after the final file state), wall time 2.04 s. No custom timeout is set (L31). |
| `npm run typecheck` | rc 0 |
| `npx biome check` on the 2 owned code paths (`biome-owned.log`) | rc 0, 10 warnings, all in `ExportDialog.tsx`. HEAD's copy also gives 10. The test file gives 0. 0 new. |
| `npm run lint` (`lint.log`) | rc 0, 205 warnings, 1 info, 0 errors |

**First failing assertions on the start copy:**
- ES1: 0 checked instead of 10.
- ES5: 0 checked instead of 2.
- ES6: the first failure is `getAllByRole('button',{name:'Deselect All'})`, which finds no element: the label reads "Select All" because the stale Set still holds `c`. B's reading was correct.
- ES7: "Download .als" is disabled.

## Covering runs not run
- The full suite, build, `verify` and e2e smoke were not run. They belong to the gate (speed rule).
- No browser rows were run. They belong to C.

## Code review (actual `code-reviewer` subagent run)
- Score 8.5/10. No Critical and no High findings.
- **Medium, addressed:** doc 174 implied that contract rule 5 (no render with a stale selection) was proven by a mutant. It is not: RTL flushes effects in `act()`, so a `useEffect` keyed on `[stemIdSetKey]` would pass ES1–ES7. The doc now says that rule 5 is held by the render-phase pattern and by review, not by a test. That mutant survives and is listed as a known gap.
- **Low, addressed in the doc:** removing a stem resets the selection to all remaining stems, which also discards toggles on the surviving stems. This is a consequence of rule 1, and the doc now says so explicitly.
- **Lows not changed (for B, deferred_low_polish candidates):**
  - (a) Duplicate stem IDs would keep `size !== length` in the existing `toggleAll` and label code. The duplicates are pre-existing, outside the grant, and only relevant if the backend can send them.
  - (b) There is no StrictMode row. The reviewer judged the pattern safe.
  - (c) The test helper `getCheckedStemNames` reads the label `textContent`, so a checked, muted stem would read as "Stem bMuted". No current row hits this.
  - (d) The reviewer could not verify the Ableton manual quote "most users will choose" itself. It is copied from B's §3 table (B WebFetch, 2026-10-28).
- **Architecture note (proposal for B/root, not acted on):** this adds a new state slot to an existing owner, and the reviewer recommends keeping it. Optionally, if another stems-derived state lands in `ExportDialog`, extract a `useStemSelection(stems)` hook with ES1–ES7 as its acceptance tests. The "all current IDs" Set is built in 3 places.

## B acceptance rows I passed (unit/code level only)
| Row | What I passed |
|---|---|
| UNIT-222 | 7/7 by id, tsc rc 0 |
| REDPROOF-222 | A's half: start copy and mutant 1 logs |
| CODE-222 | self-check: no JSX, class or copy change; no `any`, `as` or `@ts-ignore`; semicolons |
| SCOPE-222 (end) | `git status`, frozen and root-owned checks |
| AN-REVIEW-222 | self-check: headings in order, l.4 exact, only ES1–ES7 cited, no "Live defaults to" claim |

These all still need C's independent check.

**Not passed by A:**
- every browser row: LEGACY-UI-STUBBED-222, SUBSET-AUDIO-222, PERSIST-222, SELECT-ALL-222, ABLETON-TAB-222, LAB-SMOKE-222, G222-3;
- LEGACY-OWNERSHIP-222 (BLOCKED: no backend in the cloud);
- the gate.

## Known gaps
- Contract rule 5 has no test (see the Medium above).
- The behaviour was not verified in a real browser by A.

## Exact next C checks
1. SCOPE-222: `git status` shows exactly the 3 entries; frozen and root-owned rc 0; HEAD `6dd45a1`.
2. UNIT-222: `CI=true npx vitest run app/lib/__tests__/legacy-export-dialog-stems.test.tsx` gives 7/7; `npm run typecheck` gives rc 0.
3. REDPROOF-222 on a scratch copy:
   - revert the init to `useState(new Set(state.stems.map(...)))` with no adjustment block: expect ES1, ES5, ES6 and ES7 red;
   - the `[state.stems]` `useEffect` reset: expect ES3 red.
4. LEGACY-UI-STUBBED-222 (warm-up first):
   - open "Export Mix" without Select All and expect 10/10 checked with Export Audio enabled, at 1440 and 1280;
   - MP3 High at 1440: frame walk;
   - WAV default vs WAV after Deselect All → Select All: byte- or PCM-identical.
5. SUBSET-AUDIO-222, PERSIST-222 (including a Mute toggle on a different stem, then reopen: 9/10), SELECT-ALL-222 and ABLETON-TAB-222.
6. LAB-SMOKE-222 and G222-3 (unstubbed). LEGACY-OWNERSHIP-222 stays BLOCKED.

## Scope completed
The round-222 implementation scope (grant 1 + the 2 new files) is complete at unit and code level. The backlog item is not closed; that depends on C's browser rows and the root gate.
