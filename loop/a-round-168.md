# A round 168: V-3c-4b, Lane and Group header button surfaces (D-29z133)

**Status:** implementation complete. Awaiting C round 168. A did not run any browser rows.

## Start state (checked before the first edit)
- HEAD `1fef377`; `git status` clean; `git ls-files -co --exclude-standard` = 986.
- The 980 frozen files pass `sha256sum -c --quiet b-round-167-r168-tree-sha256.txt`, and the 6 grant start hashes are OK.
- `a-round-168/` did not exist before this job (only `a-round-168-prompt.txt`). Nothing came from an earlier job.
- Baseline: the 12 files in `b-round-167-r168-vitest-base.txt` gave **249/249** (`a-round-168/vitest-baseline.json`; list in `a-round-168/vitest-files.txt`).
- twMerge fact re-checked in node (tailwind-merge as installed):
  - The mixed Solo string drops `bg-foreground/5` and `border-transparent`, and keeps `enabled:hover:bg-foreground/8` and `enabled:active:bg-foreground/12`.
  - The on strings drop every SURF base token.

## Changed files (all within the grants)
| File | IDs |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | L1–L5 (class strings only) |
| `app/components/arrangement/ArrangementGroupHeader.tsx` | G1–G4 (class strings only); the Solo-on `cn` argument wraps onto 2 lines because of Biome line width, so the file is one line longer |
| `app/lib/arrangement/__tests__/lane-strings-ui.test.tsx` | Adds LSU7 (new describe at the end of the file); nothing else changed |
| `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx` | Adds UM11 (new describe at the end of the file); nothing else changed |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | G-TH: only the l.448 `after` value changes, `rounded-sm` → `rounded-md` |
| `docs/implementation/2026/quarter-IV/136-…md` | D1: the l.4 status, plus the l.135 TODO struck through (allowed) |
| **new** `docs/implementation/2026/quarter-IV/137-studio-v3c4b-lane-group-button-surfaces.md` | D2 |

Every grant was used. `git status` shows the 6 granted files as ` M` and doc 137 as `??`, nothing else.

## Tests and commands (actually run)
- **12 targeted files after the edits:** **251/251** (249 + LSU7 + UM11) → `a-round-168/vitest-after.json`.
- `npm run typecheck` exit 0. `npm run lint` exit 0: the repo-wide warnings are pre-existing, and none are in the 5 changed code and test files.
- Read-only `npx biome check` on the 5 code and test files: clean ("No fixes applied").
- **`expect(` counts** (`a-round-168/expect-counts.txt`):
  - lane-strings-ui 45 → 64;
  - track-group-mix-ui 131 → 155;
  - studio-theme-obsidian 76 → 76.
- **Mutations** (Edit → run → restore by Edit → sha256 equal to post-edit; JSON in `a-round-168/mutations/`):

| Mutation | Change | Red | Killed |
|---|---|---|---|
| m199 | Lane Mute off gets `border-outline` back | LSU7 | yes |
| m200 | `enabled:hover:bg-brand` dropped from Lane Solo on | LSU7 | yes |
| m201 | `hover:bg-brand/10` back on the full import button | LSU7 | yes |
| m202 | Lane fold `rounded-md` → `rounded-sm` | LSU7 | yes |
| m203 | `TRACK_GROUP_MIX_BUTTON_CLASS` `rounded-md` → `rounded-sm` | UM11 **and** TH10 | yes |
| m204 | `bg-gradient-to-r` dropped from mixed Solo | UM11 | yes |
| m205 | group rename input `rounded-md` → `rounded-sm` | UM11 | yes |

  - m203 ran twice. On the first run both tests were already red, but the helper parsed the vitest title as `TH10:` and wrote `killed:false`. A fixed the parser (`run-mutation.sh`) and re-ran m203; the JSON on disk comes from the re-run.
  - No `!`-only MOTION mutant was used.
- **Not run by A** (speed rules): the full suite, `npm run verify`, the build, e2e, and every browser row.

## Code-reviewer (actual subagent, read-only): 9/10, no Critical, High or Medium
- **Confirmed by the reviewer:**
  - every ruling is matched: on strings byte-identical apart from the R2 appends, mixed string byte-identical, R6 exact, and R5' sites untouched;
  - twMerge resolves as intended;
  - no text, aria, handler or size change;
  - the only arbitrary values are the 4 MOTION tokens.
- **Low suggestions A applied** (in the owned test additions only):
  1. `enabled:active:bg-foreground/12` added to both on-state exclusion lists.
  2. UM11 asserts `aria-pressed="false"` in the off state.
  3. UM11 locks the full mixed Solo string with `toContain`, so R8's byte-identity is tested directly.

  The tests, Biome, typecheck and lint were re-run after these changes, and `post-edit-sha256.txt` was regenerated before the mutations.
- **Low suggestions not applied** (informational): the on-state appends are checked as tokens, not as a contiguous string; the label literals are hard-coded, as in the existing tests.
- **Architecture note (verbatim, for B):**
  > Signal 3 (the same region changed repeatedly at growing cost): this round adds 5 more copies of the SURF+MOTION recipe (ArrangementLane.tsx l.613, l.631, l.723, l.731; ArrangementGroupHeader.tsx l.37), on top of the 7 copies in 5 files counted in round 167. l.613 and l.631 are byte-identical within the same file. A local constant in the file would stay within A's files but outside §1's "class strings only" grant, so it does not belong in this round. Keep for now: fallback (c) is the ruling, LSU7/UM11/TH10 lock every copy, and no state, ref, gesture, audio or Undo behaviour moves. Proposal for B: after V-3c-4c, a single bounded task to introduce one shared tool-surface constant, done together with Q2 (dropping the `!` suffixes), as drafted in b-round-167-checkpoint-request.md, keeping TH10's substring locks and the LSU7/UM11 token lists green. This is a proposal, not approved scope.

## End state
- The 7 changed or new paths match `a-round-168/end-sha256.txt` (regenerated after the final doc 137 edit, which inlines the expect( counts and the mutation table).
- The frozen 980 files are OK.
- The protected diff vs `1fef377` is empty: the purchase and auth routes, `download-routes.test.ts`, `app/styles`, `app/contexts`, `ArrangementTransport.tsx` and `studio-lab.tsx`. Every other path is covered by the frozen list.
- `a-round-168/diff-vs-start.patch` holds the 6 grants vs `b-round-167/r168-granted-start/`, plus doc 137 as a new file.
- No commit, push, stash, install or build.

## B acceptance: what A actually passed
- §1 L1–L5, G1–G4, G-TH, D1 and D2 are implemented.
- §3: the targeted vitest set is green (251), typecheck and lint pass, scoped Biome is clean, m199–m205 are all killed, the code-reviewer ran and its findings were addressed, and the end hashes and patch are written.
- **Not claimed:** any C row. SURF, BOX, CONTRAST, RV1, FUNC-SMOKE, G168-3 and PX-NET/REG-HYD need C's real browser.

## Known gaps / trade-offs (from the spec, not bugs)
- The fill against its own surface is 1.12–1.13:1 (WCAG 1.4.11). This is the spec's decision.
- Q-R167-ON-HOVER: on-state buttons show no hover change.
- R7: the selected lane name and the 16 px pan reset get rounder ends. Saba can veto this from C's 4× crops.

## Exact next C checks
- T168-TARGETED: re-run `a-round-168/vitest-files.txt`. Expect 251/251, with LSU7, UM11 and TH10 present.
- SOURCE-SCOPE against `a-round-168/end-sha256.txt`.
- AN-REVIEW against `diff-vs-start.patch`.
- Then SURF-V3C4B, BOX-V3C4B, CONTRAST-V3C4B, RV1-V3C4B, FUNC-SMOKE-V3C4B, G168-3 and PX-NET/REG-HYD at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`, as written in task §4.
