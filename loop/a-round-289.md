# A round 289 — FIX-PD-1b (F7 English demo names + SR-230-6 group heading)

**Status:** implemented, no STOP. Handed to C. Nothing committed or pushed.

## Baseline
- HEAD `c345def`, clean tree at start.
- `bash ../tmp/studio-real-loop/b-round-288/claims-289.sh` output equals `b-round-288/claims-289-output.txt` (`diff` empty), checked before editing.
- Note: `b-round-288/sketch.patch`, cited in §5, is **not present** in `b-round-288/`. This is not a STOP, because §5 says §3.2 governs. I implemented from §3.2.

## Changed files (exactly the §4 grants)
| Path | Change |
|---|---|
| `app/data/studio-lab-demo.ts` | The 9 Georgian literals → §3.1 table. `grep -cP '[\x{10A0}-\x{10FF}]'` = 0 |
| `app/components/arrangement/ArrangementLibrary.tsx` | Removed the `arrangement-library-option-context` span.<br>Added `useId`, plus `libraryResultRuns` (a `useMemo` of contiguous `collectionLabel` runs).<br>With ≥ 2 runs, each run renders as `<div role="group" aria-labelledby>` with a plain heading `div` (the classes from §3.2). With 0 or 1 runs, the list renders flat as before.<br>`isFocusTarget` keeps the global index (`run.start + offset`).<br>One `biome-ignore` line, byte-exact to §3.2(3) |
| `app/lib/arrangement/__tests__/strings.test.ts` | `const DEMO_REMAINING_GEORGIAN_LINES: readonly string[] = [];`. ST47 and ST51 are unchanged |
| `app/data/__tests__/studio-lab-demo.test.ts` | DL-VAL pin → `'Synthetic demo · Night Pulse'`. New **DL-EN** |
| `app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx` | New: LG1–LG7 |
| `docs/implementation/2026/quarter-IV/216-fix-pd-demo-names-group-heading.md` | New. l.4 = `**სტატუსი:** Completed (C round 289 PASS)`. The 7 TEMPLATE headings are in order, and every cited test id exists |

**Delta from §3.2(4):** I did not import `Fragment`. The ternary between grouped and flat rendering does not need it. I measured what an unused import does on the scratch copy: adding an unused `Fragment` makes `npx biome check` fail with the error `lint/correctness/noUnusedImports` (2 errors, the other being import sorting). Only `useId` is new. No other new import.

**L12 structure sweep.** The options now sit inside `role=group` when there are 2 or more runs. I grepped `app/**/__tests__`, `perf` and `e2e` for `arrangement-library-list`, the listbox role, `arrangement-library-option-title`, `role="option"` and `getAllByRole('option')`. 13 files hit.
- 7 hit files are in the covering 15.
- I ran the other 5 (fader-guards, grid-adaptive-ui, grid-snap-menu, panel-radius-ui, render-budget), plus `mode-toggle-colour-ui`, which hit the `data-source-id` sweep. **6 files / 170 tests passed** (`a-round-289/l12-sweep-run.log` holds the 5-file run, 162 tests; `mode-toggle-colour-ui` had 8).
- `library-row-strings-ui` LGS1 (l.637) pins a flat list (`list.children.length === options.length`, `option.parentElement === list`). It stays green because its fixture has a single collection, which is the 0/1-run path.
- `perf/studio-lab.perf.spec.ts` l.157 finds `arrangement-library-option-title` filtered by `Soft impact`. That title is unchanged, and the locator does not depend on the list structure. I did not run perf (L38, and it is not my row).
- `e2e`: 0 hits.

**SWEEP re-run** (old demo terms + the context testid; roots `app`, `perf`, `e2e`): the only remaining hits are in `library.test.ts` (its own fixture, unchanged per the ruling) and `ArrangementLibrary.tsx`. The `ArrangementLibrary.tsx` hit was the context span, which has since been removed.

## Tests actually run
- `npm run typecheck`: rc 0.
- `npm run lint`: 0 errors. The 205 warnings are repo-wide and pre-existing. `npx biome lint` and `check` on the 5 owned code files: clean.
- Covering run: `npx vitest run` on the 15 files of §5. **15 files / 255 tests passed** (247 + DL-EN + LG1–LG7). Log: `a-round-289/covering-run.log`.
  - The slowest single test is LRS4 at 1267 ms, against the 5000 ms default. No test is above 50 % of its timeout.
- **Mutants** (`a-round-289/mutants.sh` + `mutate.py`, rsync scratch at `/tmp/a289scratch`; logs `M1..M5.log`):

  | Mutant | Red as expected |
  |---|---|
  | M1 (heading at ≥ 1 run) | LG3, LG4, LG5 |
  | M2 (context span back) | LG1, LG5 |
  | M3 (group by first appearance) | LG7 |
  | M4 (heading `tabIndex=0`) | LG2 |
  | M5 (`bass` back to Georgian) | DL-EN |

  The live sha of the 5 code files is unchanged before and after (`live-sha-before.txt` = `live-sha-after.txt`).
- **A browser smoke** on :5173, not C evidence (`a-round-289/smoke.mjs`, `smoke.json`, `a-smoke-1440.png` and `a-smoke-1280.png`). The values match at 1440 and 1280:

  | Measured | Value |
  |---|---|
  | Groups, in order | 2: `CZABA public previews + synthetic SFX` and `Synthetic demo · Night Pulse` |
  | Heading heights | 59.5 and 43 px, not truncated |
  | Option heights | previews 66.5, SFX and synthetic 47.25 |
  | List `scrollHeight` | 614 |
  | Context spans | 0 |
  | Georgian code points | 0 text lines and 0 `title`/`aria-*`/`alt`/`placeholder` attributes |
  | Option titles | equal the §3.1 table |

  Storage state: `a-browse.json`.

## Code review (real `code-reviewer` subagent)
No Critical, High or Medium findings. Lows:
- **A-R289-REVIEW-L1 (Low):** switching between grouped and flat rendering, or moving an option into another run, remounts the option buttons. This is harmless today: `results` changes only on a search or tree click, when focus is in the search box or tree, and arrow keys do not change `results`. It becomes a risk if `collection.sources` changes while an option has focus. Signal for B.
- **A-R289-REVIEW-L2 (Low, outside the grant):** the ST47 and ST51 test names in `strings.test.ts` still say "keeps only the sound titles" and "except the demo sound titles", but the array is now empty. The grant allows only the array change, so I did not rename them. For B.
- **L3 (Low):** DL-EN sits in the same `describe` block as DL-VAL, which is a loader-error block. Readability only; not changed.
- **L4 (Low):** the DL-EN regex covers U+10A0–10FF only, exactly as the spec asks. It misses Mtavruli (U+1C90–1CBF), a theoretical gap.
- **Architecture note (signal only, no in-round refactor):** `libraryResultRuns` adds derived state to an `ArrangementLibrary` that already owns a lot. Proposal for B/root: one bounded task that moves the run calculation into `library.ts` as a pure function next to `filterLibrarySources`, with unit tests, and decides the L1 keying at the same time.

## Acceptance criteria (§6), from A's side
- SOURCE-SCOPE: only the §4 paths changed (`git status`: 4 M + 2 new). No frozen file was touched.
- TYPECHECK: rc 0 (A run).
- UNIT: 15 files pass, with DL-EN and LG1–LG7 present by name (A run).
- UNIT-MUTANTS: A's run is red as listed. C runs its own.
- DOC-216: l.4 is byte-exact, the headings are in order, and the cited ids exist (A check).
- **Not claimed:** the browser rows (B-NAMES, B-GROUPS, B-KEYS, B-STATES, B-JOURNEY, B-SCREEN, G289-AUTH) and CLAIMS belong to C. The gate rows belong to root.

## Exact next C checks
1. CLAIMS: `claims-289.sh` at `c345def` = `claims-289-output.txt`.
2. SOURCE-SCOPE: `git diff c345def` shows the 4 modified files, and `git status` shows the 2 new ones as `??`. Confirm the `Fragment` delta above.
   - UNIT ids: grep LG1–LG7 in `library-group-heading-ui.test.tsx`. `strings.test.ts` has its own unrelated `LG*` ids.
3. B-GROUPS and B-NAMES at 1440×900 and 1280×720, on a fresh context after `Demo collection ready`.
4. B-KEYS: ArrowDown ×8 and ArrowUp ×8, with the in-box check after each step.
5. B-STATES: (a) through (f).
6. B-JOURNEY: the exact Bass status sentence, the Undo text, the clip and footer names, and the position advancing.
7. B-SCREEN: element count 14 → 11.
8. G289-AUTH.
9. C's own mutants M1–M5.

## Known gaps
- No browser evidence from A beyond the smoke.
- `sketch.patch` is missing from B's folder.
- Saba questions are still open: SABA-Q-FIXPD1B-NAMES, SR-275-6 and LIVE-MEAS-BROWSER-SEARCH-LOCATION.

## Scope completed
§3.1–§3.4 are implemented. This round does not complete the backlog. FIX-PD-1 still has its remaining parts (F8 etc., per B).
