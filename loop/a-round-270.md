# A round 270: GATE266-S1 + B-R269-DETAIL-ALLTRACKS-DROP + GATE266-S4 / B-R266-CLIPS-SPLIT-COPY

**Status:** implemented and ready for C. No STOP. Baseline was HEAD `f6ebd2d01c361c17d11c5b885a40e37e2ca9f9eb` with a clean tree (K1 checked before any edit). No commit, push or install.

## Changed files (exactly the 7 granted paths)
- `app/components/arrangement/ArrangementDetailPanel.tsx`: three hunks only.
  - `studioEditStrings` is joined to the import on l.51.
  - `onClipStart` / `onClipEnd` now use `range.start` / `range.end` (no clamp).
  - New keep branch in `applyDetailRange`, after the gesture refusal and before `const target = selection.clip;`. It compares the normalised `rangeInputText(parseSecondsInput(text))` with `rangeInputText(range.start/end)`. It does not call `setTimeRange` and does not set the texts. It announces `detailRangeAppliedMessage(range, range.allTracks ? studioEditStrings.allTracks : selection.laneName)`.
  - No class, testid, `disabled` or JSX change. The layout-effect deps are unchanged.
- `app/lib/arrangement/strings.ts`: `splitRangeDone`, `splitRangeClipsDone` and `splitRangeTitle`, set exactly to the §3.3 text.
- `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx`: the partial-overlap test is rewritten per §5.1 (3 assertions on the same subject). New describe `GATE266-S1 … (DR)` with DR1–DR6.
- `app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx`: BS2 literal; a literal line in `expectSplitPastStart`; new **BS5** (see deviation 1); new describe with DP1.
- `app/lib/arrangement/__tests__/strings.test.ts`: ST6 l.385 and l.411, ST7 l.517 and l.520 literals.
- `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx`: NS2 l.261 literal.
- `docs/implementation/2026/quarter-IV/201-gate266-s1-detail-range-readout.md` (new).
  - l.4 is exactly `**სტატუსი:** Completed (C round 270 PASS)`.
  - The 7 TEMPLATE headings appear in order (diff checked).
  - It cites only DR1–DR6, DP1, BS1, BS2, BS4, BS5, ST6, ST7, NS2 and the renamed partial-overlap test.

## Deviations from the task text (none in the contract)
1. **The task's "BS3" became "BS5".** `background-time-selection-ui.test.tsx` already has `BS3 a range over empty space only, then Ctrl+E, is refused…` at HEAD (HEAD l.564), so B's new row would have duplicated the id. The new row is `BS5 a drag from inside clip A past the whole clip B…`, with the same body as B's sketch. **C: wherever §5.2 or §7 says "BS3" for B-R266-CLIPS-SPLIT-COPY or M-STR-CLIPS, read BS5.** K10's after-count is 16→22 for polish and 18→20 for background.
2. **DR1–DR6 are stronger than the sketch,** after reviewer finding M-2:
   - DR1, DR2, DR3 and DR6 assert `live(api).range` `toBe(before)`, the same object reference, so they prove `setTimeRange` was not called.
   - DR1 clears the status with `setStatus('')` before clicking Set, asserts that the status is `''`, which proves the clear is not a no-op, and then asserts the applied text again. That pins Set's announcement too.
   - DR6 was added; it is not in the sketch.
3. The DR describe's `beforeEach` also stubs `HTMLMediaElement` `play` and `load`, matching the file's existing describe.

## Tests actually run (final tree)
- `npx tsc --noEmit` → rc 0 (`a-round-270/typecheck.txt`).
- `npm run lint` → rc 0, with 205 warnings and 1 info repo-wide. `lint.txt` names none of the six changed files (grep count 0).
- `npx biome check` on the 6 code and test files → "Checked 6 files … No fixes applied." (`biome.txt`).
- `npx vitest run` on the 7 §5.3 files → **197/197 pass** (`vitest.json`).
  - Slowest covering tests: NS5 1898 ms, WSU1 1093 ms, detail-panel gesture-registry 1077 ms.
  - None is above 2500 ms or above 50 % of the 5000 ms timeout.
  - From a separate run of the 2 files (44/44): DP1 94 ms, BS5 120 ms, DR1 152 ms, DR6 105 ms.
- **Mutants** (`a-round-270/mutants.py`, output in `mutants.txt`): each mutant was applied to the source, the 4 files were run, and the source was restored. Every mutant went red exactly as §7 lists, with BS5 in place of BS3:

  | Mutant | Red rows |
  |---|---|
  | M-CLAMP-DISPLAY | DP1, DR1, DR2, the rewritten partial-overlap test |
  | M-NO-KEEP | DP1, DR1, DR2, DR3, DR6 |
  | M-LANE | DR3 |
  | M-RAW-TEXT | DR6 |
  | M-STR-DONE | BS1, BS4, ST6 |
  | M-STR-CLIPS | BS2, BS5, ST7 |
  | M-STR-TITLE | NS2, ST6 |

  - Extra mutants (`mutants-extra.txt`): **M-SET-EQUAL**, where the keep branch calls `setTimeRange({...range})`, turns DR1, DR2, DR3 and DR6 red. **M-NO-STATUS**, where the keep branch writes no status, turns DR1, DR2, DR3 and DR6 red.
  - `git status` after the mutants shows only the 7 granted paths.

## Browser check by A (Chromium, :5173 dev server, both viewports, 0 page errors)
B's probe scripts were copied into `a-round-270/` with the output dir repointed (B's files untouched). Output files: `probe-detail-range-a.json`, `probe-alltracks-a.json` and `probe-split-copy-a.json`. The first detail-probe run timed out waiting for "Demo collection ready", most likely a cold dev-server start; the re-run passed.
- past-start: the fields show `6.25` / `12.5`. After Enter, the readout and the lane overlay stay at 6.250–12.500, and the status is `Time selection: 00:06.250 — 00:12.500 · Music.`
- past-end: the fields show `12.5` / `115.102`. After Enter the selection is kept, with `· Music.`
- inside: `11.5` / `14`, unchanged.
- all-tracks: after Enter the readout still says "all tracks", there are 4 lane overlays, and the status is `… · all tracks.`
- Split: A gives `Clip split at the time selection; the part inside it is selected.` G gives `Split at the time selection; the 2 clips inside it are selected.`
- At 1280 `panelWasHidden` = true (K10b), at 1440 it is false.

This is A's own check and not a substitute for C's rows. Not run by A: DP-EDIT, Set click in the browser, focus after Enter (L47), SPLIT-BOX, SCREEN-BUDGET, STATUS-CLOBBER at 1 s, the split title, G270-AUTH.

## Code review (actual `code-reviewer` subagent, 7 files): score 8/10, no Critical or High
- **M-1, a UX note and not a code bug.** With From/To now showing values outside the clip, editing one field still sends the other, out-of-clip value through the clamp path, which gives `rangeInvalid`. This is the task's explicit contract (§3.2 step 4, DR4 guard, rejected option (b) / LATER-DETAIL-LANE-RANGE-EDIT). **For B / Saba:** consider it when LATER-DETAIL-LANE-RANGE-EDIT is decided. No change was made, because doing so would change the contract.
- **M-2, test gap: fixed** (deviation 2 above, proved by M-SET-EQUAL).
- **L-1, Set status not asserted: fixed** (DR1).
- **L-2.** The keep path leaves retyped text as typed (`0.500`), while the clamp path normalises the text. This is consistent with §3.2 ("do not change the texts"). Reported only.
- **L-3.** An all-tracks range anchored on another lane gives `rangeOnClip` false, so the fields show the clip bounds and Enter selects the clip span on this lane. This is HEAD behaviour, unchanged, and untested. A candidate Low for B.
- **Architecture note (a proposal for B/root only, not done):** signal 3, repeated change at `ArrangementDetailPanel.tsx` ~519–606. The reviewer says keep it for now. Later, one bounded task could extract a pure `resolveDetailRangeApply({ startText, endText, range, clip, laneName }) → noop | apply | invalid` in `lib/arrangement/`, with unit tests and unchanged JSX.

## Acceptance criteria A truly passed
- TESTS-TARGETED: passed on A's run.
- MUTANTS: all red, on A's run.
- SOURCE-SCOPE and HUNK-SCOPE: self-checked with `git status` and `git diff`.
- CLAIMS: K1–K5, K7, K8, K10 and K11 matched at HEAD before the edits. K6 and K9 also match; they were run after the edits, but those lines are in files this round did not touch: ArrangementTransport.tsx:177, ArrangementContext.tsx:1992/2000/2005, StudioWorkspace.tsx:2222 and :409.
- A's own browser observation of DP-BROWSER, DP-ENTER (Enter part), DP-INSIDE, DP-ALLTRACKS and SPLIT-COPY statuses.

C must still independently verify every §8 row. Gate rows are not claimed.

## Exact next C checks
1. SOURCE-SCOPE: only the 7 paths; doc 201 is untracked.
2. HUNK-SCOPE: `git diff -- app/components/arrangement/ArrangementDetailPanel.tsx` shows 3 hunks.
3. TEST-REWRITES: diff the partial-overlap test and the BS2/ST6/ST7/NS2 literals against HEAD.
4. MUTANTS on C's own scratch. **Read BS5 for BS3.**
5. In the browser: DP-BROWSER, DP-ENTER (including the Set click and `document.activeElement` = From), DP-EDIT (11 → applied; then 9 → `rangeInvalid`), DP-INSIDE, DP-ALLTRACKS, SPLIT-COPY (including the title `Split clips at the time selection (Ctrl+E)` and clip starts 10 / 11.25 / 20), SPLIT-BOX at 1280, SCREEN-BUDGET, STATUS-CLOBBER at 1 s, G270-AUTH.
6. Doc 201: l.4 byte check, heading order, and that every cited test id exists (BS5, not BS3).

## Known gaps
- No full suite, full verify, build or e2e smoke was run by A (speed rules; these are gate rows).
- Reviewer M-1 and L-3 are left for B.
