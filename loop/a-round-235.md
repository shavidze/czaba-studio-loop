# A round 235 — SABA-B-11a stage 2: interactive bars ruler and scrub strip

**Result:** implemented within the 8 grants + 3 new files. **No STOP.** C has not verified anything yet; nothing here is a C PASS.

## Top of report (L32 / L33)
- **No covering-set failure.** 108 files / 1,624 tests green (run before the BR6/BR11 additions; N2 then re-run 12/12).
- **No test above 50 % of its timeout.** Closest: `library-row-strings-ui` LRS4 2,488 ms / 5,000 ms default (49.8 %; gate 234: 1,625 ms). Then `workspace-strings-ui` WSU1 2,083 / 5,000 (gate 234: 1,268). CP12a–d max 9,129 ms / 30,000 (gate 234: 6.3 s). The numbers come from a 4-worker covering run on a loaded runner, and this round does not touch those files.
- **Reviewer Medium, needs a B ruling (not reproduced, not a regression):** A-R235-REVIEW-M1. `playFromRuler` (`StudioWorkspace.tsx`, §2.3 as specified) decides whether to start playback from the render-time `workspaceRef.current.isPlaying`, while `togglePlayback` uses `isPlayingRef`.
  - **Possible failure:** if the two differ before React commits (for example, playback ends on its own in a rAF tick and a strip click arrives before the commit), a strip click could only seek, or in the opposite case stop playback.
  - **Not observed:** discrete events flush synchronously, and nothing like this showed in the browser runs (below).
  - **Proper fix:** a context `playFrom(time)` that reads `isPlayingRef`. That needs `ArrangementContext.tsx`, which is frozen this round. Round 236 already holds an `ArrangementContext.tsx` grant (D-29z329), so B could add it there.
  - **Why this is not a STOP:** it is a latent race in new behaviour, not a regression of existing behaviour. It concerns B's specified design: §2.3 prescribes `seekTo`, then `togglePlayback` "only if not playing", and B's own `precheck-scratch.diff` used the same `latest.isPlaying` check. It is not a deviation in the implementation.
- Housekeeping: I deleted my own interim checkpoint `a-round-235.md` (written earlier this round) and replaced it with this report. No other file was deleted.

## Changed files
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementRuler.tsx` | Navigation gesture removed and the hook used instead; `RulerNavigation`, `RULER_DOUBLE_CLICK_AFTER_DRAG_MS`, `rulerDragView`, `TIMELINE_DRAG_THRESHOLD_PX` imports gone. Playhead handle, ticks, markup, `title`, testid unchanged. |
| 2 | `app/components/arrangement/ArrangementTempoRow.tsx` | `BarsRulerGestures` type; `rulerGestures` prop; with a tempo: hook handlers, `cursor-pointer touch-none`, `title = rulerTitle`, first child `arrangement-bars-scrub-strip` (`h-2.5`, `hover:bg-foreground/8`, `aria-hidden`, tooltip). Zone = `pressTarget instanceof Node && stripRef.current?.contains(pressTarget)` (no px constant; B's `offsetY` sketch not copied). Without a tempo: no handlers, title, child or cursor class. `ArrangementBarsRulerInner` name and memo kept. |
| 3 | `app/components/arrangement/StudioWorkspace.tsx` | `playFromRuler` (`[]` deps), memoised `barsRulerGestures`, `rulerGestures` prop, type import. Nothing else. |
| 4 | `app/lib/arrangement/strings.ts` | `studioTempoStrings.scrubStripTitle = 'Click = play from here'`. |
| 5 | `app/lib/arrangement/shortcuts.ts` | Row `play-from-point` after `back-to-start`, no `ariaKeyShortcuts`. |
| 6 | `app/lib/arrangement/__tests__/strings.test.ts` | ST17 key list + literal. Existing assertions unchanged. |
| 7 | `app/lib/arrangement/__tests__/shortcuts.test.ts` | SC1 `EXPECTED_ROW_ORDER` + one keys assertion (placed in SC4, beside the `fit`/`waveform-zoom` key assertions). Existing assertions unchanged. |
| 8 | `docs/implementation/2026/quarter-IV/182-saba-b-11a-tempo-seed.md` | l.4 only → `**სტატუსი:** Completed (C round 235 PASS)` (`git diff -U0`: one hunk `@@ -4 +4 @@`). |
| N1 | `app/hooks/useRulerNavigation.ts` | New hook. The logic moved unchanged; `pressTarget` (pointerdown `event.target`) is stored on the record and passed to `onRulerClick`. Latest options are kept in a ref. Not added to `app/hooks/index.ts` (unchanged). No JSDoc (project no-comments rule; style of `useRelativeFaderDrag.ts`). |
| N2 | `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | BR1–BR10, BR4b, plus **BR11** (render stability, added after review). BR6 also covers `pointercancel` / `lostpointercapture` producing no click. Uses the shared `helpers/workspace-test-environment.ts`; stubs copied in-file; testid/role/name queries only (L12). |
| N3 | `docs/implementation/2026/quarter-IV/183-saba-b-11a-bars-ruler.md` | New doc. Georgian; l.4 byte-exact; its `## ` headings contain TEMPLATE's seven in order (diff empty), plus one `###` Ableton subsection. It cites BR1–BR11, BR4b, MU-B/C/D/MEMO, ST17, SC1, SC4, all of which exist. |

Scope check at handover:
- `git status`: exactly the 8 grants `M` + 3 `??`.
- `sha256sum -c` passes on the frozen list (rc 0) and the root-files list (rc 0).
- The 7 protected files: `git diff --quiet HEAD` rc 0.

## Tests actually run
1. `npm run typecheck`: rc 0. It was run again after the final test edits.
2. `npx biome check` on the 9 changed code files: clean, no fixes. `npm run lint`: 0 errors (205 warnings and 1 info elsewhere, none in these files).
2b. `npm run build`: rc 0 (`a-round-235/build.log`). Afterwards `git status` still showed exactly 8 `M` + 3 `??`; `build/` is ignored.
3. Covering set: `npx vitest run $(cat b-round-234/covering-files.txt) bars-ruler-ui.test.tsx` gave **108 files / 1,624 tests passed**, 195 s (`a-round-235/covering.log`). This run came before BR11 and the BR6 cancel loop were added. After them, N2 alone: 12/12 passed.
4. Mutants, each applied, run and reverted, with the file sha verified after restore. MU-B and MU-C were re-run against the final 12-test N2:
   - **MU-B** (strip calls `onSeek`): 5 red: BR2, BR3, BR4b, BR5, BR8 (`a-round-235/mu-b.log`).
   - **MU-C** (handlers attached with `bpm === null`): 1 red, BR1 (`mu-c.log`).
   - **MU-D** (extra; cancel / lost capture counted as a click): 1 red, BR6 (`mu-d.log`).
   - **MU-MEMO** (extra; `barsRulerGestures` without `useMemo`):
     - `tempo-window-ui` + `render-budget`: **15/15 green**, so BU8 does not guard the memo, because playhead frames do not re-render `StudioWorkspace` (`mu-memo.log`).
     - I added BR11 for this. It turns red on MU-MEMO (`mu-memo-n2.log`), and its positive control (G toggles Snap) does re-render the bars ruler.
   - The final files contain no mutant.
5. **code-reviewer** (real subagent, read-only, no shell): 8/10. How each finding was handled:
   - Medium A-R235-REVIEW-M1: see the top of the report (B ruling).
   - Low test gaps:
     - cancel / lost capture: added in BR6, killed by MU-D;
     - memo guard: BR11 added, killed by MU-MEMO;
     - not added: the `setPointerCapture`-throws fallback, a past-end strip click while playing, and touch pointers.
   - Low: a tempo cleared mid-drag detaches the handlers. The context's window listener aborts the gesture; this path has no test.
   - Low/info: `optionsRef.current = options` is assigned during render (the same pattern as `workspaceRef`). Kept.
   - Info: the doc wording "MU-C checks BU7" was wrong. Fixed to "BR1, red on MU-C".
6. **Playwright on :5173** (my own script; Chromium; a fresh context per block; `a-round-235/recipes.mjs` → `recipes.json`). The results were the same at 1440×900 and 1280×720, with 0 page errors in every context:

   | Check | Result |
   |---|---|
   | Seed (Add pulse) | `data-bpm` 120 |
   | Zones | y+4 hits `arrangement-bars-scrub-strip` (10 px high, 1840 px wide = ruler width); y+15 hits `arrangement-bars-ruler` |
   | Titles | strip `Click = play from here`; ruler = `rulerTitle` |
   | Cursor | `pointer` on both |
   | Strip background | `rgba(0,0,0,0)` at rest; `oklab(… / 0.08)` on hover |
   | Strip click 4.1 s, stopped | playing; playhead 4.481 / 4.472 after 500 ms, so it started at 4.000 |
   | Strip click 8.2 s, playing | still playing; 8.249 / 8.237 after ~305 ms, so it jumped to 8.000 |
   | Lower click 6.3 s, stopped | `6.5`, not playing |
   | Alt + lower click 6.3 s | `6.3` |
   | 200 px drag on the lower zone | scrollLeft 0 → 200; playhead unchanged; not playing |
   | Double-click | `Fit: the entire project is visible (00:16.000). X goes back.` |
   | Seconds ruler click at 3.175 s | `3`, not playing, title unchanged |
   | No tempo (soft impact) | 0 strips, `title` null, cursor `auto`, `textContent ''`; clicks and drag changed nothing |
   | Past end (scroll 400, t = 20) | not playing; exact `playPastEnd` text |
   | Empty project, tempo 90 typed | `Nothing to play — add a clip from the library first.` |

   **Not run by A:** the strip-playing ±50 ms timing judgement, the RMS analyser, the `?` sheet in the browser, the loop and library-preview neighbours, the Performance trace, touch, and the full C-BUDGET line count.
7. **Screenshots:** `a-round-235/shots/`:
   - before (taken before any edit): `before-{1440,1280}-{empty,seeded,strip-hover}.png`;
   - after: `after-{1440,1280}-{empty,seeded,strip-hover,seeded-used}.png`.

   The strip has no text and no fill at rest. I did not count persistent lines (no image-diff tool here: PIL is missing); that is C's C-BUDGET row.

## Acceptance criteria I actually checked (A-side only; not a C PASS)
- §4.1 typecheck and Biome: done. §4.2 covering set: green. §4.3 MU-B and MU-C: red as required. §4.4 code-reviewer: done. §4.5 Playwright recipes and before/after screenshots: done for the §0.3 strip-stopped, strip-playing, lower-zone and no-tempo recipes (plus Alt, drag, double-click, past-end and empty-project).
- For C's rows the above is A's own evidence only. C-STRIP-PLAYING timing, RMS, C-SHEET, C-BUDGET, C-REF-235, LAB-SMOKE, Auth and the §6 neighbours are not claimed.

## Known gaps / notes for B
- A-R235-REVIEW-M1 (Medium, theoretical): see the top of the report.
- Edge case (existing `togglePlayback` rule, not changed; **inferred from code, not reproduced**): a strip click that snaps to exactly the project end (≥ end − EPS, no loop) should start playback from **0**, because `togglePlayback` sets `from = current >= end - EPS && !loopActive ? 0 : current`. C may want to record what this looks like.
- The strip is 10 px high, below WCAG 2.5.8's 24 px target: the trade-off recorded in §2.2 and doc 183.
- **Architecture note (reviewer; proposal only, nothing extracted):**
  1. `app/hooks/useRulerNavigation.ts` imports `watchUncapturedPointerGesture` from a component file (`ArrangementClip.tsx`). Proposal: move it to `app/lib/arrangement/pointer-gesture.ts` and re-export it from `ArrangementClip`. Low cost; Clip/Overview/Ruler tests are the acceptance.
  2. `ArrangementOverview.tsx` keeps its own copy of the drag/capture logic. Reviewer: keep it for now (different view math).
  3. The reviewer prefers a context `playFrom(time)` over `seekTo` + render-state `togglePlayback` (the same item as M1).

## Exact next C checks (priority)
1. C-SCOPE-235 (hashes, 8 M + 3 new, doc 182 l.4 only), then C-UNIT-235, which includes N2 12/12.
2. C-STRIP-STOPPED with RMS, and C-STRIP-PLAYING (±50 ms, no Pause→Play blip in the label).
3. C-LOWER, including the playing half at 10.2 s (A ran only the stopped half), then C-ALT for the strip at 4.3 s.
4. The §6 neighbours: the seconds ruler after extraction (drag pan/zoom, double-click Fit and zoom-to-selection, drag-then-double-click guard, playhead handle drag and arrows, MU8d marker release), Follow pause on a bars drag, loop brace, library preview stop, a Performance trace, and touch.
5. C-SHEET, C-BUDGET, C-ZONES hover crop, C-EDGE, C-NO-TEMPO, AN-REVIEW-235 (doc 183 headings and ids), LAB-SMOKE, Auth.

## Scope completed
All of §2 (grants 1–8, N1–N3) is implemented and checked by A. This is not a backlog-complete claim. SABA-B-11a closes only after C PASS and the root gate.
