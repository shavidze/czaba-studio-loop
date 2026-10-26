# A — Round 178 report: DUX-R-5b-3a (labels / status / hover / badge / Grid menu checks / Export note-progress-overload → neutral)

Date: 2026-10-26 · Implementer: A · Baseline: HEAD `cc984b6` · No commit, no push.

## Pre-flight (done before the edits)
- HEAD = `cc984b6f06ded21ec35593fc6dbb65353c153b1e`. The tree was clean. `sha256sum -c b-round-177-r178-tree-sha256.txt` passed, the 12 granted start hashes matched, and neither new file existed.
- Base vitest (the 12 files in `b-round-177-r178-vitest-base.txt`): **134/134** (`a-round-178/out/vitest-base.json`).
- Primitives read: DESIGN_TOKENS, TAILWIND_FIRST, FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, AUDIO_ARCHITECTURE (named by the hook), plus `prompts/new-test.md`, `skills/pre-flight`, `commands/check.md`, and `docs/implementation/TEMPLATE.md`.
- Pre-flight gate:
  - Assumptions: token-only swaps at the 16 §1 sites; no behaviour change.
  - Files: the 12 grants and the 2 new files only.
  - Success means: 13 targeted files green, 9 neighbour files green, typecheck and lint at exit 0, and m278–m287 all red.

## Changed files (14 = 12 grants + 2 new; `a-round-178/end-sha256.txt`, `a-round-178/diff-vs-start.patch`)
- P1–P4 `ArrangementDetailPanel.tsx`; W1–W5 `StudioWorkspace.tsx`; Y1 `ArrangementLibrary.tsx`; G1–G3 `ArrangementGridMenu.tsx`; E1–E3 `ArrangementExportDialog.tsx`. Every token is exactly as in §1.
- L1–L6, each exactly as in §1:
  - `detail-panel-strings-ui`
  - `panel-radius-ui`
  - `grid-triplet-ui` (TU11, with the added `not.toContain('text-accent')`)
  - `master-ui` (with the added `not text-accent`; `not text-destructive` kept)
  - `affordance-colour-ui` (6 → 5; `LATER_STAGE_BRASS_SITES` and its TODO untouched)
  - `mode-toggle-colour-ui` (badge count 1 → 0, at the same position)
- N1 new `app/lib/arrangement/__tests__/label-status-colour-ui.test.tsx`: DXL1–DXL6, DXL7a/b/c, DXL8 (10 tests).
- D1: doc 146 status → Completed (C round 177 PASS, published `cc984b6`), plus the TODO suffix.
- D2: new doc 147, `In Progress (awaiting C round 178)`.
- Frozen list at the end: `FROZEN_OK`. `git status`: 12 ` M` + 2 `??`. No protected file was touched.

## DEVIATION 1: Biome re-wrap (§3.2 l.143). The literal "exactly N lines" acceptance is NOT met; B to rule
- Each replacement is 4–5 characters longer, so three lines went over Biome `lineWidth: 100` and `biome check` reported format errors. Before this, `./app` was format-clean.
- I ran `npx biome format --write` on only those 3 files. Nothing was re-wrapped by hand, and no lint autofix ran.
- Resulting diff:
  - **StudioWorkspace:** the same 5 sites (l.2197, 2210, 2562, 2568, 2605). The refusal at l.2605 is now 4 lines (`<span` / `className=…` / `data-testid=…` / `>`), so numstat is +8/−5.
  - **DetailPanel:** 4 sites. The group count at l.676 is now 3 lines (l.676–678), and later lines shift by +2: Apply is at l.754, 0 dB at l.863, the toggle at l.1144. Numstat is +6/−4.
  - **`detail-panel-strings-ui`:** `surfaceForbidden` is now a 6-line array.
  - The reflows are whitespace-only. The code-reviewer confirmed this independently.
- Two DXL8 "new" needles can't match single-line strings any more:
  - `font-medium text-foreground">{studioDetailStrings.clipCount`
  - `className="font-medium text-foreground" data-testid="arrangement-lane-move-refusal"`

  Both are now counted on a whitespace-normalised source (`expectWrappedCount`, count 1). Every other §3.2 needle is literal.
- **For C (SOURCE-SCOPE / AN-REVIEW):** expect StudioWorkspace hunks `-2197/2210/2562/2568 +1` and `-2605 +2605,4`, and DetailPanel hunks `-676 +676,3`, `-752 +754`, `-861 +863`, `-1142 +1144`. The other three components change exactly 3/3/1 lines. The reflow lines are not "other changes".

## DEVIATION 2 / BLOCKER: two protected tests go red because of W2. Not fixed (outside ownership); B to rule
- `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` l.330, **LRS5**: finds the header badge with `querySelector('span.border-accent')`.
- `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` l.230, `badgeText()`: same selector. **PW1** (l.296) and **PW6** (l.384) fail. The code-reviewer found this one; I then reproduced it.
- W2 (badge `border-accent` → `border-outline-strong`) is mandatory in §1, so these failures are forced. Both files are protected in §2 and I did not edit them.
- A repo-wide selector grep (`app`, `e2e`) found no other selector or lock on a removed token. A plain grep of `e2e/` for `border-accent|text-accent|text-brand|accent-brand|hover:text-brand` returned 0 hits.
- Suggested bounded fix for B to grant: change the selector at both lines to `span.border-outline-strong`, or better, locate the badge by its text or a `data-testid`.
- Until then the root gate's full vitest **will fail on 3 tests**. Do not publish round 178 as-is.

## Tests actually run (speed rules: no full suite or verify by A)
| Run | Result | Evidence |
|---|---|---|
| Base 12 files, before the edits | **134/134** | `out/vitest-base.json` |
| 12 base + `label-status-colour-ui` (`vitest-files.txt`), after | **143/144**. Only red: LRS5 (Deviation 2) | `out/vitest-after.json` |
| Neighbours (`neighbour-files.txt`): export-dialog-hold-enter, export-cancel-ui, export-mp3, detail-panel-fit, detail-panel-polish, studio-theme-obsidian, content-colour-ui, grid-snap-ui, grid-musical-ui | **108/108** (9 files) | `out/vitest-neighbours.json` |
| Extra: `purchased-collection-ui` | **4/6**. PW1 and PW6 red (Deviation 2) | `out/vitest-purchased-collection.json` |
| `npm run typecheck` | exit 0 | — |
| `npm run lint` (`biome lint ./app`) | exit 0 (pre-existing warnings only) | — |
| `npx biome check` on the 11 changed `app/` files + N1 | 0 errors | — |

## Mutations (`a-round-178/mutations/m278…m287.json`; script `a-round-178/tools/run-mutations.sh`; re-run after the final N1 edits)
All 10 go red on exactly the tests B required. Every file was restored and its sha re-checked (`ALL_RESTORED`).
| ID | Red tests |
|---|---|
| m278 | DXL1, DXL8 |
| m279 | DXL2, DXL8, DSU1 (detail-panel-strings-ui) |
| m280 | DXL3, DXL8, PNR5 (panel-radius-ui) |
| m281 | DXL3, DXL8, DXT8 (mode-toggle-colour-ui) |
| m282 | DXL4, DXL8 |
| m283 | DXL8 only (source-only, as expected) |
| m284 | DXL5, DXL8 |
| m285 | DXL6, DXL8, TU11 |
| m286 | DXL7c, DXL8, DXA7 |
| m287 | DXL7b, DXL8, master-ui overload |

## Code review (code-reviewer subagent, actually invoked; score 8/10)
- **H1:** `purchased-collection-ui` breakage. Confirmed by me and reported as Deviation 2. Doc 147 was corrected (M1).
- **M2:** LRS5, same as Deviation 2.
- **Fixed in N1 (my own file):**
  - L1: whitespace-normalised wrapped needles.
  - L2: DXL1 now asserts exact `studioDetailStrings.clipCount(2)`, after the token check.
  - L3: DXL6 now asserts exactly one checked division, Snap `aria-checked="true"`, and exactly 2 drawn checks.
  - The duplicate `getByTestId` in DXL2.
- **Noted, not changed:**
  - L4: the refusal is only locked in source (by spec; it is C's REFUSAL row).
  - L5: the line-count deviation (Deviation 1).
- **Architecture note (verbatim, for B):**
  > Signal 3 (one region changed repeatedly at high cost):
  > - The new test duplicates, for at least the third time, the fake AudioContext / OfflineAudioContext / AudioBuffer / ResizeObserver / Link setup. It is at `label-status-colour-ui.test.tsx:280–372` and also in `mode-toggle-colour-ui`, `master-ui` and `affordance-colour-ui`.
  > - Locks that count raw source strings with `readFileSync` now live in three files: `mode-toggle-colour-ui` l.468–501, `affordance-colour-ui` `KEPT_BRASS_COUNTS`, and DXL8 here. They depend on Biome's line wrapping, as the two newline needles in this round show. H1 is the same problem from the DOM side: selecting by a colour class ties tests to colour tokens.
  >
  > Leave it this round: these are frozen, already-protected files, and the round only swaps tokens. Proposal for the planner: extend the existing ROOT-RECON-GRID-HARNESS task to cover a shared workspace mount and fakes harness, plus one shared `countOccurrences` that normalises whitespace. Done when the existing colour suites use them with no change in test count. Separately, consider having badge and other DOM lookups use stable hooks (text or `data-testid`) instead of colour classes.

## B acceptance: what A truly passed
- PASS: P1–P4, W1–W5, Y1, G1–G3, E1–E3 tokens; L1–L6; N1 DXL1–DXL8; D1; D2; the §0.2 kept sites and the 5b-3b sites untouched; no style/hex/arbitrary/CSS/aria/data/text change.
- PASS: 10/10 mutations red; typecheck and lint exit 0; scoped Biome 0 errors; neighbours 108/108; code review done.
- NOT MET:
  - "after the edits everything must be green": 143/144, plus 2 extra reds in `purchased-collection-ui` (Deviation 2).
  - "StudioWorkspace exactly 5 changed lines" and "DetailPanel exactly 4": formatter-forced (Deviation 1).
- Not A's: all browser rows, the full suite, verify, build and e2e.

## Next C checks (if B lets the round proceed to C before the selector grant)
- T178-TARGETED: expect 143/144 with LRS5 red until B's ruling.
- SOURCE-SCOPE / AN-REVIEW: use the Deviation 1 hunk map.
- INVENTORY-GREP; CC-TEXT; NO-BRASS-TEXT; CONTRAST-TEXT; REFUSAL; EXPORT-STATES (a/b/c); FUNC-SMOKE-TEXT; ENV-VIS; RV1-DUX5B3A; RV3-STORE; G178-3 (badge text "Demo collection — no sign-in required", now muted); PX-NET / REG-HYD. All as in §4.

## Known gaps
- The two protected badge selectors (above). The root gate will fail until they are fixed.
- The lane-move refusal colour has no DOM unit test; it is covered by C's REFUSAL row.
- ROOT-RECON-GRID-HARNESS is still open (the new file repeats the fakes block).

Scope completed: the A implementation of round 178, with the two deviations above. The backlog is NOT complete, and DUX-R-5 is not მზადაა (needs C round 178 plus 5b-3b).
