# A round 134 — VISUAL-A V-0.3a: grid and Snap texts in English

Implementer: A (Claude Opus 5.5) · Date 2026-10-24 · Task: `current-task.md` (round 134). Scope completed: the A part of §1–§4. The browser rows (§5) are C's.

## Start
- HEAD `ee40ad6` (`feat(studio): verified loop rounds 133-133`); `git status --short` was empty.
- Frozen list `b-round-133-r134-tree-sha256.txt` (930 entries): `sha256sum -c --quiet` OK at the start and again at the end.
- 16 grant start hashes (`b-round-133-r134-granted-start-sha256.txt`): all OK. No partial work from an earlier job existed.

## Pre-edit grep (`a-round-134/pre-edit-grep.txt`, `pre-edit-grep-2.txt`)
- The old texts for each GR row, grepped in `app/**` and `e2e/**`, hit only the §2 lines in the 5 sources and the 10 granted tests. There are 0 hits in `e2e/`.
- `[0-9] წმ` together with the grid words in `__tests__`: only granted files.
- Excluded by design (not GR texts, other stages):
  - `ArrangementClip.tsx` l.456 (fade status, V-0.4);
  - `ArrangementRuler.tsx` l.231 (playhead `±0.1 წმ`, V-0.3b);
  - `clip-fades-ui` l.358, `video-fades-ui` l.367, `status-announcement` l.60/62 and `status-announcement-ui` l.325 (fade texts, V-0.4).
- Left untouched in the granted test files (outside their line lists):
  - the `ვიდეო`/`მუსიკა` track names;
  - `tempo-ui` l.288 (TempoRow);
  - `grid-snap-keys` l.361 (library search);
  - `grid-snap-ui` l.113/376/380/383 and all `undoLabel` pins.
- No test title contains a Georgian grid text.
- **No stop-rule case.**

## Changed files (17: 16 ` M` + 1 `??`)
Full diff against the start copies: `a-round-134/granted.diff`.
- `strings.ts`: one new `studioGridStrings` object at the end, with GR1–GR20 and 21 keys (10 plain strings, 11 formatters taking strings). It still has no import. The other twelve objects are unchanged.
- `grid.ts`: `import { studioGridStrings } from './strings';` and the `formatGridDivision` body → `studioGridStrings.seconds(String(step))`.
- `grid-divisions.ts`:
  - the import and the bar `label: studioGridStrings.barLabel` (the `as const` array is otherwise unchanged; typecheck green);
  - `GRID_TRIPLET_MENU_LABEL`;
  - the string expressions of the end, status, tempo-cleared, group, refusal and title functions.
  - Every condition and branch, and the `snapEnabled ?` pick, are unchanged.
- `ArrangementGridMenu.tsx`: one import line and `GRID_MENU_LABEL = studioGridStrings.menuLabel`.
- `StudioWorkspace.tsx`:
  - one import (between `selection` and `tempo`);
  - `SNAP_OFF_MESSAGE` and the Snap-on status (l.1276);
  - the Snap title ternary picks;
  - the select `aria-label={studioGridStrings.menuLabel}`.
  - The 33 remaining Georgian lines are byte-identical: the ST25 ratchet passes, and my own script confirmed the same 33 lines with both the narrow and the widened pattern.
- Tests: `strings.test.ts` (widened `GEORGIAN_CODEPOINT`, new describe with ST23–ST25); `grid`, `grid-musical`, `grid-triplet`, `grid-snap-ui`, `grid-snap-menu`, `grid-snap-keys`, `grid-musical-ui`, `grid-triplet-ui`; `tempo-ui` (only `SNAP_ON_STATUS`). Every pin is a hand-written English literal with the same matcher. Shared constants were changed once each.
- Doc 109: l.4 and l.128 as specified, plus the GATE133-GROUP-RENAME TODO line under V-0.3.
- New doc 110 (`110-studio-v0-grid-snap-strings.md`): status Completed for A, with C round 134 still to come.

## `it` counts (before → after)
Only strings.test changes (22 → 25). All others are unchanged: grid 12, grid-musical 12, grid-triplet 7, grid-snap-ui 20, grid-snap-menu 39, grid-snap-keys 13, grid-musical-ui 14, grid-triplet-ui 10, tempo-ui 12. There are 0 `skip`/`only`/`todo`.

## Checks (actually run)
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0 (218 warnings and 1 info repo-wide, none in the changed files).
- `npx biome check` (read-only) on the 15 changed code/test files: clean, exit 0.
- `npx vitest run`: **23 files, 409 tests, all green** (list: `a-round-134/vitest-list.txt`, log: `vitest.log`). All 23 named files exist.
  - Granted: strings 25, grid 12, grid-musical 12, grid-triplet 7, grid-snap-ui 20, grid-snap-menu 39, grid-snap-keys 13, grid-musical-ui 14, grid-triplet-ui 10, tempo-ui 12.
  - Neighbours: grid-edges 11, grid-snap-position 17, grid-snap-edit 25, grid-snap-clip-edges 44, grid-snap-loop-drop 36, marker-snap 25, tempo 10, tempo-window-ui 8, metronome-ui 10, waveform-zoom 9, render-budget 7, self-disabling-focus 10, status-announcement-ui 33.
- Not run (gate's job): the full suite, `npm run verify`, build, e2e.

## Mutations (`a-round-134/mut/*.txt`; each restored from `a-round-134/bak/`, sha256 OK)
| | Red tests (observed) | Spec expectation met |
|---|---|---|
| m24 `seconds` → `წმ` | ST4, ST24, ST25; grid "labels every division in seconds"; grid-snap-ui GS1/GS3/GS4/GS10; grid-snap-menu GM4/5/6/7/15/18/22/25/30/32 (18 total) | yes (ST4 is extra: the Export scan includes strings.ts) |
| m25 swap snap suffix picks | GM5 (grid-musical), ST24, GK1/GK8/GK9 | yes |
| m26 drop "; Snap still works" | GM5, ST24, GS10 | yes |
| m27 swap Snap title picks | GS1 (l.295), GS3 (l.408) | yes |
| m28 aria-label back to Georgian | ST25 (ratchet → 34 lines; the per-file scan does not include StudioWorkspace), GS1 (l.298) | yes |
| m29 `backToSeconds` drops `: {label}` | GM5 (l.118), ST24, GU7 (grid-musical-ui l.490) | yes |

## Shell writes (all temporary or outside `store/`)
- `/tmp/ratchet.mjs` and `/tmp/gen.mjs`: helper scripts outside the repo.
- `tmp/studio-real-loop/a-round-134/*`: evidence (grep, logs, diff, hashes, `bak/` copies, `mut/` results).
- Mutations: `sed -i` on `strings.ts` (m24, m26, m29), `grid-divisions.ts` (m25) and `StudioWorkspace.tsx` (m27, m28). Each was restored with `cp` from `a-round-134/bak/` and checked with `sha256sum -c`: OK after each.
- Every lasting edit was made with Edit/Write.

## End state
- `git status --short`: exactly 16 ` M` (the grants) + `?? docs/implementation/2026/quarter-IV/110-studio-v0-grid-snap-strings.md`.
- Frozen list: OK.
- Protected files: `git diff ee40ad6` on `studio.$productId.tsx`, `api.studio-token.ts`, `auth.ts`, `AuthContext.tsx` and `Modal.tsx` is empty.
- End sha256 of the 17 paths: `a-round-134/end-sha256.txt`.
  - strings.ts `adb7c76f…`
  - grid.ts `2aa3ccc3…`
  - grid-divisions.ts `e34eda4d…`
  - ArrangementGridMenu.tsx `8959f9d3…`
  - StudioWorkspace.tsx `d95f2808…`
  - strings.test `fcdf3516…`
  - grid.test `ac488f14…`
  - grid-musical `9629e5eb…`
  - grid-triplet `66b75473…`
  - grid-snap-ui `18102c35…`
  - grid-snap-menu `b9e49a06…`
  - grid-snap-keys `bfd35276…`
  - grid-musical-ui `e97d529d…`
  - grid-triplet-ui `7361e50b…`
  - tempo-ui `fa4de816…`
  - doc 109 `1c176a19…`
  - doc 110 `2f672662…`

## Deviations
1. **StudioWorkspace Snap title ternary:** Biome's formatter requires the 3-line ternary (baseline l.2269–2271) as one line, so the edit also touches baseline l.2269 (`snapEnabled`). The condition and the pick order are unchanged. The reviewer judged it acceptable.
2. **Biome re-wrapping in the tests** (applied by hand; `--write` is forbidden):
   - the four `gridDivisionEndMessage` expects in grid-musical GM5 and two in grid-triplet now wrap over three lines;
   - three grid-snap-ui GS4 `toBe(` calls became one line each.
   - The matchers and literals are unchanged.

## Code review (actual `code-reviewer` subagent)
- **Verdict 9/10.** No Critical, High or Medium findings.
- Info notes:
  - (1) the ternary collapse is acceptable;
  - (2) GM5 only looks reordered in the diff and is not weakened;
  - (3) the ST25 self-check tests the start codepoint of each range, not the end (optional later hardening; the spec lists exactly these three);
  - (4) `ArrangementTempoRow.tsx:228` still says "ტაქტების ბადე" next to the English grid select (V-0.3b scope; a mixed surface for one round);
  - (5) the short test alias `gs` follows the file's existing convention.
- **Architecture note (for B/root, not acted on):** "Keep. `strings.ts` gains one cohesive, side-effect-free object, and StudioWorkspace gains only one import and swaps literals, with no new state, effect or ownership change. The question of splitting `strings.ts` (now 13 objects) already has a vehicle in the pending frontend-architect checkpoint, addendum (g), so this round needs no new proposal. Any split must keep the `~/lib/arrangement/strings` import path, which this diff already uses."

## Acceptance (A part only)
- Passed (A's checks): §1.1 texts exact (ST23/ST24 plus the reviewer's side-by-side check); exported names and signatures kept; `strings.ts` still a leaf; the imports as specified; the §2 pins replaced; ST23–ST25 added (22 → 25); the widened pattern with its self-check; m24–m29 red as named; typecheck, lint and Biome clean; the 23-file vitest list green; doc 109/110 written; reviewer run.
- **Not claimed:** every browser row (GRID-SEC, GRID-MUSICAL, GRID-TRIPLET, GRID-HIDDEN, SNAP, MENU, GEO-COUNT, LAYOUT, REG-133, G134-3, PX-NET/REG-HYD) is C's. The gate rows (full suite, build, verify, e2e smoke) are the root gate's. I did not use a browser this round (none was needed for A's scope).

## Known gaps / notes for B
- GATE132-TEMPO-CLEARED-MIXED is closed in code (GR9). C should confirm it in the browser (GRID-MUSICAL).
- TempoRow l.228 "ტაქტების ბადე" remains mixed next to the English grid select until V-0.3b (reviewer note 4).
- Optional Low hardening: an end-codepoint self-check (U+10FF/U+1CBF/U+2D2F) in ST25.

## Exact next C checks
1. T134-TARGETED: `npx vitest run $(cat tmp/studio-real-loop/a-round-134/vitest-list.txt)`, run from `store/` → 23 files / 409 tests.
2. SOURCE-SCOPE: `git status --short` (16 M + 1 ??); `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-133-r134-tree-sha256.txt`; `sha256sum -c ../tmp/studio-real-loop/a-round-134/end-sha256.txt`; protected `git diff ee40ad6` empty.
3. AN-REVIEW on `a-round-134/granted.diff`, including the two deviations above.
4. Browser rows §5 at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`. Select divisions by option value (`'1'`, `'0.25'`, `'1/4'`, `'1/4T'`).
