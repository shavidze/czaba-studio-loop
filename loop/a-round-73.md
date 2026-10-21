# A — Round 73 report: C-R72-01 fix (SRW-16 stage 1 completion), D-29z38

Status: implementation done; ready for C. Nothing committed (root only).

## Baseline (A, 2026-10-21, at start)
- HEAD `1e469e59d28aebf2e2a90f3d9d6d614d4e599bd1` — OK.
- `git status --short` = exactly the 10 round-72 lines — OK.
- Frozen list `b-round-72-r73-tree-sha256.txt` (449): `sha256sum -c --quiet` OK at start and at end.
- Snapshots 3/3 equal at start (`b35a0f2a`, `4a09c6cc`, `6c9f0ae5`).
- Protected 4/4 equal to `protected-baseline.json` at start and end (`cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`).
- `pgrep -c node` = 1 at start and end. `:5173/studio-lab` = 200. A did not start or stop any server.

## Pre-flight
Read: CLAUDE.md, `.claude/rules/*`, primitives-map, AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, FORWARDREF_COMPONENT / DESIGN_TOKENS / TAILWIND_FIRST (hook), prompts/studio-feature.md (sections), skills/pre-flight.
- Assumption, confirmed in code: the capture handler on the scroller runs before `ArrangementClip.beginGesture` (bubble phase) claims the gesture, so `isPointerGestureActive()` is still false at capture time.
- Smallest version: one clause (2 changed lines).

## Change
**F1, `app/components/arrangement/StudioWorkspace.tsx`:** in `releaseEditFocusOnTimelinePointerDown`, one clause next to the loop-brace one: `(isMarkerTarget(focused) && !isMarkerTarget(event.target))`. The existing guards stay: gutter, active gesture, `focused.contains`. The Delete and arrow branches, the flag handlers, `ArrangementClip`, `ArrangementLane` and `ArrangementMarkerRow` are untouched. Diff: `a-round-73/sw.diff`.

**Coverage (confirmed in code):** the handler sits on `arrangement-timeline-scroller`. That element wraps `timelineChromeRef`: grid control, ruler, tempo row, Markers row and Loop brace row. It also wraps every `ArrangementLane` (header, lane body and clips), the marquee and the playhead line. Every C73-2 path is covered, so no extension was needed. Outside this handler, with no change: app header, transport, library, detail panel, footer. A press there blurs natively unless the element calls preventDefault (out of scope).

What happens on each target when a flag has focus:
- **Another flag or its label span:** focus is kept (inside a marker).
- **Markers header buttons (+ ◀ ▶) and the empty marker strip:** they are outside any marker, so the flag is blurred. Chrome then focuses the button. Safari and Firefox on macOS do not focus buttons on click, so focus goes to body there.
- **Name editor input:** it sits next to the flags, not inside a `[data-testid="arrangement-marker"]`. A focused flag and an open editor cannot exist together, because the input's blur closes the editor. While the editor is open, focus is on the input, and the existing `focused.contains(target)` guard keeps it there. I did not widen `isMarkerTarget`.

**F2, `markers-ui.test.tsx`:** helpers `stubPointerCapture` and `clickClipBody`, plus 4 tests. MU8 is unchanged and green.
- **MU8c (the bug):** M, then Enter, so the new flag at 0.000 is focused. A clip body pointerdown/up follows, and focus is no longer on the flag. The clip is selected. Delete on the active element, then again on body: the clip is removed, markers are equal to before, the undo label is `კლიპის წაშლა`, and Undo restores the clip. A second case focuses a flag, clicks the clip, then presses ArrowRight on the active element: `start` > 0, markers unchanged, Undo returns it to 0. A third case runs Delete on the active element after a flag focus.
- **MU8d:** a press on a lane background (video dropzone), on the ruler, or on the Markers ▶ header button blurs the flag.
- **MU8e:** a press on another flag or on its label keeps the focused flag. With F2 and the input open, a press on the input keeps the input focused and the editor open. Escape then leaves undo at null.
- **MU8f (mutation h):** Delete, Backspace and ArrowRight dispatched from a flag's label span. The flag handler only acts when `target === currentTarget`, so these keys reach the window branch with a marker target. Result: the clip is kept and not moved, markers are unchanged, and undo stays null. This path is synthetic, because a real keyboard sends keys to the focused button. The window guard is defense-in-depth, and MU8f now covers it directly.

**F3, doc 064:** the status line now reads Round 73 / D-29z38. Added a Problem → Solution entry for C-R72-01, an entry for the two accepted deviations ("არ ეხება"), and an entry for the mutation-h guard. Added round-73 testing and mutation lines and a note on browser-dependent button focus. The document is still Georgian, LF, with the TEMPLATE sections.

## Mutation proofs (run on the final tests; `a-round-73/mutations.txt`; each mutation restored and checked with `cmp` against `a-round-73/sw.orig`)
| Mutation | Red tests |
|---|---|
| (i) remove the new clause (= pre-fix code) | MU8c, MU8d |
| (ii) widen it to `isMarkerTarget(focused)` | MU8e |
| (h1) drop `isMarkerTarget` in the window Delete branch | MU8f |
| (h2) drop `isMarkerTarget` in the window arrow branch | MU8, MU8f |

Note: C round 72 reported that mutation h survived. MU8 already catches the arrow half (h2), so the surviving part was the Delete half (h1). MU8f now kills it.

## Commands actually run (final state)
- `npm run typecheck`: exit 0.
- `npm run lint`: 0 errors, 218 warnings, 1 info (same as the round-72 baseline, all pre-existing).
- `npx biome check` on `StudioWorkspace.tsx` and `markers-ui.test.tsx`: 0 diagnostics. No `--write` was used; I fixed one format diagnostic by hand.
- `npx vitest run markers-ui.test.tsx markers.test.ts delete-selection-ui.test.tsx delete-selection.test.ts`: 4 files, 71/71 passed (markers-ui 22).
- `npm run check` (the non-mutating Biome check on `./app`): exit 0, 218 warnings, 1 info, no fixes applied.
- `/check` (`.claude/commands/check.md`) asks for `npm run verify` and `test:e2e:smoke`. Under the 2026-10-21 speed rules those belong to the root gate, so A did not run them.
- Not run (root gate): full suite, `npm run build`, `npm run verify`, `test:e2e:smoke`.
- Diffs in `a-round-73/{sw,test,doc}.diff` were regenerated against B's snapshots after the review fixes, so they show the final state.

## A's browser self-check (Chromium via Playwright; NOT C evidence; `a-round-73/selfcheck.txt`, `a-round-73/tools/focus-selfcheck.cjs`, shots `selfcheck-*.png`)
I ran this at both 1440x900 and 1280x720, with the same results:
1. Real drag of Middle East into the music lane, ruler click, M, Enter. Focus is on `arrangement-marker`.
2. Real click on the clip body. Focus moves to BODY.
3. ArrowRight: the clip moves 0.050 → 0.150.
4. Delete: clips = [], marker 5.000 kept, status «კლიპი წაიშალა; სიცარიელე დარჩა.».
5. Flag click, then a lane-background click: focus is on BODY.
6. Flag click, then a ruler click: focus is on BODY.

## Code review (real `code-reviewer` subagent; score 8.5/10; no Critical or High)
- **Low 1 (first Delete went to body):** fixed. The first Delete now goes to the active element.
- **Low 2 (MU8c did not use the add flow):** fixed. MU8c now uses M → Enter.
- **Low 3 (no test for the header button):** added to MU8d. The gutter and active-gesture guards are shared with older clauses and covered by older tests.
- **Low 4 (doc's button-focus claim was Chrome-only):** doc corrected.
- **Lows 5–7 (Georgian title selector is the existing pattern; right and middle buttons also blur, as the existing clauses do; MU8d's lane half mostly covers a jsdom gap):** accepted, no change.
- **Medium 1 → signal for B (outside ownership, not fixed):** in Safari, and Firefox on macOS, clicking flag B does not move focus off flag A, while B becomes `aria-current`. A Delete would then remove A, not the highlighted B. This behaviour predates this round. A possible fix is for the flag `onClick` to focus itself, but `ArrangementMarkerRow.tsx` is frozen. MU8e's "another flag keeps focus" assertion only reflects jsdom. Chromium, which C tests, moves focus to B natively.
- **Architecture note (signal, not a task):** in `StudioWorkspace.tsx` ~1143–1160 and the keydown stand-downs at ~1495 and 1504–1510, every new focusable widget adds an `isX(focused) && !isX(target)` clause plus keydown guards. The current predicates are range, typing, loop brace and marker. Reviewer's verdict: keep for now. An optional proposal is a single `FOCUS_OWNING_TARGETS` predicate list for both places (low–medium value).

## End state, for C's source-unchanged check
- `git status --short` = the same 10 lines.
- Owned files (all LF, CR=0):
  - `StudioWorkspace.tsx` `67e1786e6933d187cc9270dfeafd82d01d5308691c0ce3fbeec08e8cdd43846e` (2010 LF)
  - `markers-ui.test.tsx` `d5e854bfc0dbe1e0e7f263b85b916820afac9e73777fa3769da5e9f6325fbb24` (833 LF)
  - `064-studio-lab-markers.md` `adb44c78c27c072da55e5f76d61cbab4f6c1fe71f8cdc435cc7d398812f03b04` (94 LF)
- The other 7 round-72 files are unchanged (`a-round-73/other7.sha256`, OK at end):
  - ArrangementContext `e374b433…`
  - model `6efefa41…`
  - types `66832e8d…`
  - doc 063 `92d149da…`
  - ArrangementMarkerRow `7d83398e…`
  - markers.test `51ea7558…`
  - markers.ts `a677d653…`

## B acceptance: what A can truthfully mark
- F1 done: clause added, coverage confirmed, no extension needed.
- F2 done: MU8c, MU8d, MU8e, MU8f added; mutations (i) and (ii) proven; mutation h is now killed by a test, not just recorded.
- F3 done.
- The C73-1…4, REG-*, G73-3 rows are C's to verify. A's browser self-check does not count as a PASS.

## Exact next C checks
- **C73-1:** at both viewports: drop a clip, ruler click, M, Enter, REAL click on the clip body, Delete → the clip is gone, the marker stays, and the status is «კლიპი წაიშალა; სიცარიელე დარჩა.». Repeat with plain → → `data-clip-start` changes, the marker stays, and the flag is not `activeElement`.
- **C73-2:** with a flag focused, REAL click on: (a) a lane background → blur; (b) the ruler → blur; (c) another flag → Chromium focuses that flag; (d) F2 rename, then click inside the input → the input keeps focus and the editor stays open. Then MK-DELETE: Delete on a focused flag removes only that marker, and focus moves to the next flag.
- **C73-3, Add then Escape:** in Chromium, the mousedown on `+` focuses the button, and that was already true before this fix. The "prior element" is therefore `arrangement-marker-add`, so Escape should leave `activeElement` = `arrangement-marker-add`. This round does not change that. Escape landing back on the flag is not the expected result. The Safari difference is in the review signal (Medium 1).
- **C73-3 rest, C73-4, REG-KEYS, REG-HYD, G73-3:** as in the task. Use `[role=option][title^="Middle East"]` for the library item; the option has no `data-source-id`.

## Known gaps
- The Safari focus caveat (review Medium 1) is unverified in Safari and outside A's ownership.
- No full suite, build or verify was run by A (speed rules; root gate).
