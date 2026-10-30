# A round 274: SYS-6 STATUS-LIFETIME stage 3 (nudge result text)

Baseline HEAD `52b17e4`, clean tree at start. No commits, pushes or installs. Protected and frozen files untouched (`git diff -- app/components` is empty; the context diff has 2 hunks, both inside `nudgeSelectedClip`).

## Changed files (all within `b-round-273-r274-grants.txt`)
- `app/contexts/ArrangementContext.tsx`: `nudgeSelectedClip` only.
  - Group success: the label is hoisted to a local const, and after `applyEdit` + `setRange(null)` it writes `groupMovedRight/Left({label, count, distance})`. The distance comes from `ids[0]` before and after.
  - Single success: after `applyEdit` + `setRange(null)` it writes `studioMoveStrings.nudged(formatArrangementTime(moved?.start ?? target))`.
  - Both use `keyRepeat ? () => text : text`. The refusal branches and the deps array are unchanged.
- `app/lib/arrangement/strings.ts`: `studioMoveStrings.nudged`, placed right after `historyNudgeClip`.
- `__tests__/strings.test.ts`: the ST12 sample and one ST11 exact expect (additions only).
- `__tests__/status-announcement-ui.test.tsx`:
  - SK7 and NZ3 now pin the exact 4-item `added` lists of §5.1. Every other line is unchanged.
  - New SK13, SK14 and SK15. SK14 uses a local helper `groupStartsMs` (see deviation 1).
- `__tests__/status-lifetime.test.tsx`: the describe title (options unchanged), plus new LT20 and LT21. LT1–LT19 are unchanged.
- `__tests__/playback-start.test.ts`: the describe title only.
- docs 203 and 204: l.4 → `**სტატუსი:** Completed (C round 274 PASS)`.
- New doc 205: l.4 exact, the 7 TEMPLATE headings in order, the §2.3 held-key and clobber rules, GATE270-S2 recorded as premise-false, and B-R273 recorded as deferred.

## Deviations from B's text (for C to judge)
1. **SK14 positions are compared at ms precision.**
   - The group path accumulates float drift. After the first press and three repeats from 5, the start reads `5.399999999999999`. The cause is `moveClips` in `selection.ts:138`, which adds `start + delta` without rounding. That file is frozen and its behaviour exists at HEAD.
   - The status text is unaffected, because `formatArrangementTime` rounds to ms.
   - SK14 therefore compares `Math.round(start*1000)/1000` against `[0.4, 5.4]` and `[0.5, 5.5]`. The text, sequence and span assertions are exact.
   - **For B:** the drifted raw starts stay in the model and are visible to `data-clip-start`, the Detail Start field and later nudges. Candidate finding `A-R274-GROUP-NUDGE-FLOAT-DRIFT` (Low or Info, outside these grants).
2. **LT21 pins the exact stopped text before the nudge.** It checks `insertMarkerAfterStop('00:04.000')`, which is stronger than B's text. This follows reviewer suggestion 4.

## Tests actually run
- `npm run typecheck`: rc 0 (re-run after the last edit).
- `npm run lint`: rc 0. It reports 205 warnings and 1 info across the repo, and this round adds none: `npx biome check` on the 6 owned code and test files gives "No fixes applied", with no diagnostics.
- `npx vitest run` on the 13 files of §5.3 (strings, status-lifetime, status-announcement-ui, playback-start, grid-snap-ui, detail-panel, detail-panel-polish, track-layout, meter-ui, track-meter-ui, status-announcement, pending-status, insert-marker-ui):
  - 13 files and **323/323 passed**.
  - Slowest single test: track-layout "folds a lane…" at 1844 ms. track-layout's describes declare `{ timeout: 15_000 }` (l.260, 806, 1073), so that is 12%. Even against the vitest default of 5 s it would be 37%. Everything else is lower; nothing is above 50%.
- Frozen extras: bars-ruler-ui and gesture-reentry, **39/39 passed**.
- status-lifetime alone after strengthening LT21: 21/21 passed.

## Mutants (§7), red-proofed in place, file restored byte-identically
The restored sha256 is `1bd2f688…fe14`. Script: `a-round-274/mutants.py`; results: `a-round-274/mutants.json`.

| Mutant | Red rows |
|---|---|
| M-NO-SINGLE | LT20, LT21, NZ3, SK13, SK7 |
| M-NO-GROUP | SK14, SK15 |
| M-GROUP-ALWAYS-RIGHT | SK15 |
| M-SINGLE-PRE-START | LT20, LT21, NZ3, SK13, SK7 |
| M-GROUP-NUDGE-LABEL | SK14, SK15 |
| M-GROUP-REPEAT-STRING | SK14 |
| M-REPEAT-SILENT | NZ3, SK13, SK7 |

Each mutant turns at least B's required rows red. The mutants were re-run on the final tree, after LT21 was strengthened, with identical results.

## Browser (A's own sanity check, not C's verification)
- Setup: Chromium on the running :5173 `/studio-lab`, using B's `probe-r274.cjs` copied to `a-round-274/`. Output is in `a-round-274/probe-r274-a274.json` and `a-round-274/shots/`.
- Both 1440×900 and 1280×720 had 0 page errors.

| Scenario | Result |
|---|---|
| nudgeSingle | `Nudge clip: start 00:01.000.` (clip at 1.000, Undo title `Undo: Nudge clip (Ctrl+Z)`); after the hold, `…00:04.000.` (4.000); after ArrowLeft, `…00:03.000.` (3.000) |
| nudgeGroup | `Move (2): 2 clips moved 00:01.000 to the right.` (clips at 1.000 and 17.000) |
| repeatPastEnd | refusal, then `Nudge clip: start 00:01.000.`, `…00:02.000.`, `…00:03.000.` |

- The first probe attempt timed out waiting for "Demo collection ready", most likely a cold dev-server rebuild after the edits. A manual peek right after showed the page ready, and the re-run passed.
- Not run by A: B-NUDGE-UNDO, B-NUDGE-BLOCKED, B-NUDGE-PASTEND (Space/Stop part), B-AUDIO, B-ENTER-TWICE, LT-WIDTH, SCREEN-BUDGET, G274-AUTH.

## Code review (code-reviewer subagent, actually run)
- Score 8.5/10. No Critical, High or Medium findings.
- Fixed in this round:
  - Doc 205 pointed to this report before it existed. It exists now.
  - Doc 205's step count: three → four (first press + 3 repeats).
  - Doc 205's diagram label: it now says "same text, no new announcement; new text, seq +1".
  - LT21 now pins the exact prior stopped text.
- For B (not fixed, outside the grants):
  - **Info:** the group write is skipped if `ids[0]` is not in the arrangement while another selected id is. The reviewer found no reachable path (undo, delete and cut prune the selection) but did not check every path. Alternative: take the distance from `roundToMs(delta)` and always write.
  - **Info:** the float drift in deviation 1.
  - **Info:** `moved` names an Arrangement in the group block and a clip in the single path (optional rename).
- **Architecture note:** none. Optional: the group direction and distance logic now also exists in `ArrangementClip`'s drag release, so a shared `lib/` helper could become one backlog line. The reviewer would keep it as is.

## B acceptance status (A's view; C decides)
- **Done by A:**
  - §2.1 and §2.2 implemented as written.
  - §2.3 write order, held-key function form, and no change to refusals or deps.
  - §4 grants respected.
  - §5.1 and §5.2 rows present and green.
  - §5.3 checks run.
  - §7 mutants red.
  - DOC-205 l.4 written and the headings present.
- **Not claimed:** every C browser row of §8, and the gate rows (full vitest, build, full Biome, verify, e2e smoke).

## Exact next C checks
1. HUNK-SCOPE:
   - `git diff --stat`: 8 tracked files plus the new doc 205.
   - `git diff -- app/components` is empty.
   - The context diff has 2 hunks, both inside `nudgeSelectedClip`.
2. TEST-CHANGES: SK7 and NZ3 changed only in the `added` list. The new SK14 helper `groupStartsMs` is deviation 1; judge whether it is acceptable.
3. MUTANTS: re-run `a-round-274/mutants.py` (it restores the file and asserts the sha).
4. Browser rows of §8 at both viewports: B-NUDGE-SINGLE, B-NUDGE-HELD, B-NUDGE-GROUP (including the ArrowLeft part, which A did not run), B-NUDGE-UNDO, B-NUDGE-BLOCKED, B-NUDGE-PASTEND (Space and Stop), B-AUDIO, B-ENTER-TWICE (press Expand first at 1280), B-R273-RANGE-PLAYING (observation), LT-WIDTH, SCREEN-BUDGET and G274-AUTH.
5. DOC-205: l.4 is byte-exact, the headings are in order, and the cited ids ST11, ST12, SK7, SK8, SK12, SK13, SK14, SK15, NZ3, LT20 and LT21 exist. `grep -rn 'In Progress (stage' docs/implementation` should leave only doc 176.

## Known gaps
- The B-R273-PLAYING-TEXT-WITH-RANGE Low stays deferred, as the contract says.
- New candidate for B: A-R274-GROUP-NUDGE-FLOAT-DRIFT.
- SYS-6 is not self-marked done; that waits for C PASS.
