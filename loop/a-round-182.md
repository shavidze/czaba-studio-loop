# A — Round 182 report: M3, library rows get 4 px of space between them (D-29z147)

Date: 2026-10-26 · Implementer: A · Baseline: HEAD `f1782f8`

## Start checks (all OK)
- HEAD = `f1782f8`, and `git status` was clean.
- `sha256sum -c --quiet b-round-181-r182-tree-sha256.txt` → OK (1003 entries), checked at start and again at end.
- The 3 grant start hashes (`b-round-181-r182-granted-start-sha256.txt`) → OK.
- Vitest base (17 files) before the edits: **328/328**, 0 failed (`a-round-182/out/vitest-before.json`).
- Pre-flight and primitives were read before the edits: FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, AUDIO_ARCHITECTURE (the hook asked for it on the docs), `.claude/prompts/new-test.md`, `docs/implementation/TEMPLATE.md` and the `pre-flight` skill.

## Changed files (the 3 grants + 1 new file; nothing else)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementLibrary.tsx` | **L1:** one token, `space-y-1`, added to the listbox class (l.597). The Biome formatter split the `cn(...)` call over 4 lines (l.597–600), which the task allows. The option class, the handlers and everything else are unchanged. |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | **T1 = LGS1**, a new `it` in `library button surfaces (V-3c-4c-1)` after LBS1, plus one import line (`studioLibraryPanelStrings`). No existing assertion is changed. |
| `docs/implementation/2026/quarter-IV/149-studio-m1-round-icon-play.md` | **D1:** status → `Completed`. Both TODOs are struck and marked done (C round 181 PASS, `f1782f8`; Space/Enter toggle exactly once, the same as HEAD). Next step → "M3 (round 182), then the REGRESSION round". |
| `docs/implementation/2026/quarter-IV/150-studio-m3-library-row-spacing.md` (new) | **D2:** Georgian, with the TEMPLATE sections. Contains L1, R41–R43, the serif / vetoable note, B's prediction table (labelled as a simulation), LGS1, m304–m307 and the §6 Ableton rows. Status `In Progress (awaiting C round 182)`. |

`git status`: 3 ` M` + 1 `??`, exactly the 4 paths above. End hashes are in `a-round-182/end-sha256.txt` (4 paths, END_OK). The patch is `a-round-182/diff-vs-start.patch` (3 grants against `b-round-181/r182-granted-start/`, plus doc 150 in full).

## LGS1 (what it asserts)
It runs one helper `expectRowSpacing()` before and after a click that selects `song` (`aria-selected="true"`, which is assertion c).
- **(a)** The listbox, found by role and name `studioLibraryPanelStrings.listLabel`, includes `space-y-1`, `p-1` and `overflow-y-auto`. It excludes `space-y-0.5`, `space-y-1.5`, `space-y-2`, `gap-1`, `flex` and `flex-col`.
- **(b)** There are at least 2 options. Every option has `px-2`, `py-1.5` and `rounded-md`, and no token matching `/^-?m[tbyl]?-/`.
- **(b, added after code review)** `list.children.length === options.length`, and each `option.parentElement === list`. `space-y-*` only works on direct children, so this check fails if the options are wrapped or a sibling is added.
- Checks are token and DOM-structure only. There is no pixel geometry and no colour-class selector.

## Tests and commands actually run (final tree)
- **Targeted vitest:** `a-round-182/vitest-files.txt` (= the 17-file base) → **329/329, 0 failed** (`a-round-182/out/vitest-after.json`).
- **`npm run typecheck`:** exit 0 (`out/typecheck.log`).
- **`npm run lint`:** exit 0. The 218 warnings and 1 info are repo-wide and existed before this round (`out/lint.log`).
- **`npx biome check`** on the 2 code/test files: clean, after applying the formatter reflow with Edit.
- **Not run (not A's job):** the full suite, `npm run verify`, the build, e2e and every browser row.

## Mutations m304–m307 (`a-round-182/mutations/`, script `a-round-182/tools/run-mutations.sh`)
Each mutation is a temporary `sed` edit to `ArrangementLibrary.tsx`, followed by a run of the 17 files, a restore from the end copy and `sha256sum -c a-round-182/end-sha256.txt`. Each one has a `.diff`, a `-vitest.json` and a summary `.json`. These are the results of the final re-run on the final tree.

| ID | Edit | Result | Failing assertion | Other 16 files | Restore sha |
|---|---|---|---|---|---|
| m304 | `space-y-1` removed from L1 | LGS1 red (328/329) | (a) inclusion, l.628 | green | OK |
| m305 | `space-y-1` → `space-y-2` | LGS1 red (328/329) | (a) inclusion of `space-y-1`, l.628 | green | OK |
| m306 | `mb-1` added to the option class (`space-y-1` kept) | LGS1 red (328/329) | **(b)** no-margin filter, l.640: `expected ['mb-1'] to deeply equal []` | green | OK |
| m307 | option `py-1.5` → `py-2.5` (`space-y-1` kept) | LGS1 red (328/329) | **(b)** `px-2 / py-1.5 / rounded-md` lock, l.639 | green | OK |

In every row the only failing file was `library-row-strings-ui.test.tsx`, and the only failing test was LGS1. The red and green sets match §4.1.

## Code review (actual `code-reviewer` subagent; 4 files)
Score 8.5/10, with 0 Critical and 0 High findings. The reviewer confirmed that L1 interacts correctly with `style={bottomInsetStyle}` (inline padding, not margin), the empty `<output>` sibling (outside the listbox) and the conditional render (direct children only).
- **Medium: LGS1 did not lock the direct-child structure.** → **Fixed:** the two parent/children assertions above. The 17 files and m304–m307 were re-run afterwards.
- **Low: the regex `/^-?m[tbyl]?-/` misses variant-prefixed margins** (`last:mb-0`, `md:mb-1`, `!mb-1`) and `mx/mr/ms/me`, yet includes horizontal `ml-`. → **Kept as B prescribed.** I changed the doc 150 wording to "no unprefixed margin token (`/^-?m[tbyl]?-/`)". **For B:** a broader `/(^|:)!?-?m[tby]?-/` is the reviewer's suggestion. I did not adopt it because it changes B's exact assertion. B can rule on it.
- **Low (optional):** `space-y-reverse`, `divide-y` and `gap-y-*` are not in the listbox exclusion list. Not changed (B's list). Recorded for B.
- **Info:** m305 turns red through the `space-y-1` inclusion, not the exclusion list.
- **Architecture note (verbatim):** "Architecture note: none. The diff adds one layout token to the existing listbox and one test, with no new state, effect, ownership shift or mixed responsibility."

## B acceptance criteria (only what I actually passed)
- §1 L1: one token added at l.597 with a formatter reflow; listbox still block; option class unchanged → done.
- §2 T1 / LGS1, D1, D2 → done. There is no new test file and no new harness.
- §3 ownership: only the 3 grants and doc 150 changed; frozen list OK at start and end → done.
- §4 before 328/328, after 329/329, typecheck, lint, Biome on 2 files, code-reviewer, m304–m307 → done.
- **Not claimed:** every browser row (GAP-M3, LAYOUT-M3, RV1-M3, SCROLL-M3, STATE-M3, BEHAVIOUR-M3, M1-NEIGHBOUR, G182-3, PX-NET / REG-HYD) and every gate row. The 4 px in the browser has **not** been measured by A. A ran no Playwright this round.

## Known gaps
- The pixel effect (the 4 px gap, scrollHeight 669, last-row 4.3 px clearance, highlight boxes) is unverified until C checks it.
- R42 (a click in the gap does nothing) is a design cost and has not been checked in a browser.
- The LGS1 regex only covers unprefixed margins (see the review Low above).
- The new structural assertion (direct children) has no dedicated mutation in §4.1. It was checked only by reasoning and by passing on the real tree.

## Exact next C checks
1. **SCOPE-182:** compare against `c-round-181/end-tree-sha256.txt`. Check the frozen 1003 entries, then `sha256sum -c a-round-182/end-sha256.txt` (`3a7e16a7…` lib, `9810411b…` test, `cae3c2ae…` doc 149, `73b80132…` doc 150). `git status` should show 3 ` M` + 1 `??`.
2. **T182-TARGETED:** `npx vitest run $(cat a-round-182/vitest-files.txt)` → 329/329.
3. **AN-REVIEW-182 / MUT-182:** read `a-round-182/diff-vs-start.patch` and `a-round-182/mutations/m304–m307.{diff,json}`. LGS1 contains two parent/children assertions that the review added. The test file still adds only LGS1 plus one import.
4. Browser rows from §5 at 1440×900 and 1280×720: GAP-M3, LAYOUT-M3, RV1-M3, SCROLL-M3, STATE-M3, BEHAVIOUR-M3 (including the R42 gap click, info only), M1-NEIGHBOUR, G182-3 and PX-NET / REG-HYD.

## Scope completed
All of A's §1–§4 work for round 182. M3 is **not** done until C passes the browser rows. I did not mark any backlog item complete. No commit, push, install or deploy.
