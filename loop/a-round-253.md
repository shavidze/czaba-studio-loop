# A round 253: SABA-B-10a stage 2b fix-up (stale status after Stop, paused-Follow copy)

**STOP — needs B ruling on L11 timeout headroom (render-budget), not caused by this round.** L22 does not apply: the tree carries the full round-253 diff, so C runs every feature row. One covering test ran above 50 % of its declared timeout during the covering run.
- **Test:** `app/lib/arrangement/__tests__/render-budget.test.tsx` › "does not re-render clips, overview bars, library rows or ruler ticks over Play → Pause → Play". It has no `{ timeout }` of its own, so the vitest default of 5,000 ms applies.
- **A's time:** 2,534 ms (50.7 %) in the 130-file covering run (4 workers), and 1,420 ms (28 %) when re-run alone.
- **Last gate time:** 2,231 ms in `gates/round-251/verify.log` (44.6 %).
- **The higher time decides:** 2,534 ms.
- **Not in the grants:** this round does not touch that file, and its code path (the Play/Pause render budget) is unchanged apart from a status write on stop.
- **Everything else is green.** I changed nothing else because of this item. B decides whether it needs a split or a timeout.

## Start state (§0): all rc 0
- HEAD `83b7c75`. `git status` listed exactly the 13 round-252 `M` files, with nothing untracked.
- Hash checks: frozen tree (1,097 files), carried (7), grants-start and root files all gave rc 0. The 7 protected files are unchanged against HEAD.
- **End state:** the same 13 `M` files.
  - Frozen, carried and root still give rc 0.
  - Only the 6 grants differ from `b-round-252/r253-granted-start/`.
  - Grant 1's diff (9 added lines) sits only inside the `!isPlaying` branch.

## Changed files (grants 1–6 only)
1. `app/components/arrangement/StudioWorkspace.tsx`: in the stop branch of the `isPlaying` effect, after Follow goes from `paused` to `on`:
   - The status is replaced with `insertMarkerAfterStop(marker)` only when it equals one of three texts exactly: `insertMarkerWhilePlaying(marker)`, `insertMarkerWhilePlayingFollowPaused(marker)` or `FOLLOW_PAUSED_MESSAGE`.
   - `marker` = `formatArrangementTime(Math.max(0, getLocatorPosition()))`.
   - The dependency list is unchanged.
2. `app/lib/arrangement/strings.ts`:
   - New `studioPlaybackStrings.insertMarkerAfterStop`.
   - New `followPausedTitle`: `Follow paused — press Follow, or stop playback, to resume`.
   - New `followPaused`: `Follow paused by manual navigation. Press Follow, or stop playback, to resume it.`
3. `bars-ruler-ui.test.tsx`:
   - FW6 amended: the two removed asserts are replaced in place by the exact stopped text (`00:06.000`) and `statusSequence + 1`. The plain half is kept as the control.
   - New FW8 (scroll pause, then Space).
   - New FW9 (Follow off, lower zone, then Space).
   - New FW10 recipe: strip click, then scroll pause, then the Follow button gives `followResumed`; then Space. Status and sequence stay unchanged.
4. `strings.test.ts`:
   - ST11: exact `insertMarkerAfterStop('00:06.500')` text.
   - ST12: sample added. Its formatter-key list is the exact-key check, and it now includes the new key.
   - ST17: the two new literals.
5. `navigation-strings-ui.test.tsx`: NS3b's two literals. Nothing else changes.
6. Doc 191:
   - l.4 = `**სტატუსი:** Completed (C round 253 PASS)`.
   - A round-253 part was added to each of the 7 TEMPLATE sections; earlier text was not rewritten.
   - The cited ids FW6, FW8, FW9, FW10, NS3b and ST11/12/17 each grep once.

## Tests actually run
- **`npm run typecheck`:** rc 0.
- **`npx biome check` on grants 1–5:** clean.
- **`npm run lint`:** rc 0. Biome reports 205 warnings and 1 info repo-wide; Biome on the 5 granted files reports none.
- **L29 sweep:** `grep -rn "Follow or Play\|press Follow or Play" app --include=*.ts --include=*.tsx` gives 0 hits.
- **Covering set `b-round-252/covering-253.txt`, run alone:** 130 files, 1,959 tests, all pass (`a-round-253/covering.json`).
  - CP12a–d took 8.0–8.5 s of a 30 s timeout (28 %).
  - The UM/UC rows took ≤ 3.4 s of 20 s.
  - render-budget is in the STOP item above.
- **Targeted runs:** `bars-ruler-ui` (25 tests) and `navigation-strings-ui` (7) pass; `strings.test` (64) passes.

## Mutants (`a-round-253/mutants/summary.txt`)
Run on the tar scratch `/tmp/a253-scratch`, outside the repo. The repo `git status` was byte-identical before and after.

| Mutant | Red rows |
|---|---|
| FIX-CONTROL | none (green) |
| MU-STOP-NO-REPLACE | FW6 (l.605), FW8 (l.627), FW9 (l.651) |
| MU-STOP-REPLACE-ANY | FW6 plain half (l.589), FW10 (l.669) |
| MU-STOP-NO-FOLLOWPAUSED | FW8 (l.627) |
| MU-STOP-NO-PLAIN | FW9 (l.651) |
| MU-COPY-OLD | NS3b (l.325), ST17 (l.1142) |

§4 says "six mutants", but §2 names five distinct ones. I ran those five plus FIX-CONTROL and did not invent a sixth.

## Playwright (`a-round-253/browser/a253.json`, screenshots `*-1440.png` and `*-1280.png`)
**Setup:** fresh context per sequence; wait for `Demo collection ready`; pulse stem added; `=` pressed 4 times (120 BPM); lower-zone aim at `scrollerRight − 300`, with `elementFromPoint` confirmed as `arrangement-bars-ruler`.

The first attempt timed out waiting for `Demo collection ready` (probably a cold Vite compile). A probe then loaded in 8 s, and the rerun is the evidence below.

| Sequence | 1440×900 | 1280×720 |
|---|---|---|
| pause → stop | PASS. Paused text at 00:06.500 with the new paused title. After Space: Follow `on` / `Follow`, status `Stopped — Space plays from the insert marker at 00:06.500.`, marker unchanged, exactly 1 status write at the stop. | PASS (00:04.750), 1 write |
| Follow off → stop (FW9) | PASS. Playing text, then the stopped text. Follow stays `off`. 1 write. | PASS (00:04.750) |
| scroll pause → stop (FW8) | PASS. The status read the new `followPaused` with the new title. After Space: Follow `on`, stopped text at 00:00.000, 1 write. | PASS |
| plain stop (control) | PASS. 0 writes; the status is unchanged. | PASS |

No page errors in any run.

**§1.2 STOP condition checked; it did not trigger.** In scroll-stop, playback ran about 1.7 s from 0, yet the stopped text named `00:00.000`, the insert marker, not the stop position. In pause-stop, the stopped time equals `[data-insert-marker]`. The code-reviewer confirmed it from code: `isPlayingRef` is cleared before `setIsPlaying(false)`.

**Not run by A (left to C):**
- the project-end auto-stop with a playing-only text;
- the Escape and transport-button stops;
- C-STATUS-WIDE box measurements;
- the HEAD and round-252 controls;
- the export hash;
- the budget and auth rows.

## Code review (code-reviewer subagent, 8.5/10)
The reviewer found no Critical, High or Medium issues. It confirmed that the ref is not stale: `stopPlayback` sets `isPlayingRef` false before `setIsPlaying`, so `getLocatorPosition()` returns the insert marker. It also confirmed that no mount re-run can match.

Its Lows are passed to B; none was fixed, all are outside the spec'd copy or not reproduced:
- **A-R253-REVIEW-PASTEND-COPY (Low):** if the insert marker is at or past the project end, `Stopped — Space plays from the insert marker …` is inaccurate, because Space then writes past-end, or starts from 0 within EPS of the end. A did not confirm whether a ruler click during playback can land past the end. C could probe this with a lower-zone click past 16 s while playing, then Space.
- **A-R253-REVIEW-STRICTMODE-REMOUNT (Low):** a remount while the context holds a playing-only text would replace it on mount; under StrictMode `statusSequence` would go up by 2. In the dev browser A saw exactly 1 write.
- **A-R253-REVIEW-PASSIVE-EFFECT (Low, theoretical):** a `setStatus` that lands between commit and the passive effect on the rAF auto-stop could be overwritten. No current writer does this.
- **A-R253-REVIEW-STOP-PATHS-UNIT (Low):** no jsdom row covers a stop by Escape, the transport button or the project-end auto-stop while a playing-only text is shown. Today these are browser-only (§6 / C-STOP-UNRELATED-253).

**Architecture note (for B/root, not a refactor):** the `isPlaying` effect at StudioWorkspace.tsx l.1917–1937 now owns both the Follow resume and the stop status. The reviewer says keep it: same lifecycle, under 10 lines. This is input for the ARCH-CHECKPOINT-TRANSPORT-POSITIONS / `useTimelineFollow` addendum (D-29z465).

## Known gaps / residuals
- The B-R253-STALE-PLAYING-STATUS residual (a marker moved during playback without a status write, e.g. Ctrl+→) was not probed by A.
- The past-end copy Low above.
- The render-budget headroom STOP above.

## Exact next C checks
C-SCOPE-253, C-UNIT-253, C-MUT-253 (NO-REPLACE, REPLACE-ANY and NO-PLAIN plus FIX-CONTROL), C-FOLLOW-STOP-253, C-STOP-PLAIN-253, C-STOP-SCROLL-253, C-STOP-UNRELATED-253 (including the 16 s auto-stop), C-TITLES-253, C-STATUS-WIDE-253, C-NAV-ORIGIN-253, C-BUDGET-253, C-LESSON-253, AN-REVIEW-253, LAB-SMOKE-253 (export sha `1fea093b…`), and Auth.

Also these probes:
- the §6 residual (Ctrl+→ during playback, then Space);
- one Escape or transport-button stop;
- the reviewer's past-end probe.

## Scope / acceptance status (A's own evidence only; C decides)
- **Done:** §1.1–1.3 implemented; §2 rows FW6, FW8, FW9, FW10, NS3b and ST11/12/17 present and red-proved; §4 steps 1–8 run.
- **Not claimed:** any C row, the gate rows, and whether SABA-B-10a is done.
