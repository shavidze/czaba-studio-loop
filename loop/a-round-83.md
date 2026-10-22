# A round 83: SRW-18 stage 2 (clip volume envelope) + X1 (GATE82-S1)

STATUS: IMPLEMENTED. Waiting for C. Nothing committed or pushed. The checkpoint log is kept in `a-round-83/checkpoint-log.md`.

## Baseline (verified before the first edit, 2026-10-22)
- HEAD `bdc2067627b8390679caeda1a7e3d25db41452e9`. `git status --short` printed 0 lines.
- Frozen list 471/471 OK. The 8 snapshots matched on sha prefix and LF count, with CR=0. Protected files 4/4 OK.
- Pre-flight greps:
  - `applySchedule` has two callers: `startGraph` (ArrangementContext l.805) and `renderArrangementWav`.
  - Field-by-field clip builders: the 3 clipboard builders and `model.ts` l.148/167 (fresh library/video clips, so no envelope by design).
  - `cutRangeFromArrangement` spreads `{ ...clip }`. No persistence sanitizer exists.
  - Nothing matched a stop condition.

## End state
- Exactly **8 M + 5 ??**. HEAD is unchanged. Frozen list 471/471 OK. Protected files 4/4 OK. Auth files are untouched.
- End hashes: `a-round-83/end-hashes.txt`.

| File | Change |
|---|---|
| `app/types/arrangement.ts` | Adds `ArrangementClipEnvelopePoint` and `envelope?` on `ArrangementClip`. |
| `app/lib/arrangement/envelope.ts` (new) | E2 functions plus `clipEnvelopePointTimelineTime` and `formatClipEnvelopeData`. |
| `app/lib/arrangement/clipboard.ts` | `envelope?` on the item; the 3 builders use a conditional spread. |
| `app/lib/arrangement/graph.client.ts` | Adds `clipEnvelopes?`, `envelopeGain` state, `scheduleClipEnvelopeGain`, the chain `source → fade? → envelope → clipGain`, both cleanup sites, and one export line. |
| `app/contexts/ArrangementContext.tsx` | One import and one line only. |
| `app/components/arrangement/ArrangementClip.tsx` | `envelopeMode` prop, envelope render, fade handles hidden in mode, `data-envelope`, X1. `watchUncapturedPointerGesture` is passed as a prop, which avoids an import cycle. |
| `app/components/arrangement/ArrangementClipEnvelope.tsx` (new) | The line, plus an inner editor-only component that owns the drag state, so an unmount reverts. Points are siblings of the editor, so `z-30` sits above the trim strips. |
| `app/components/arrangement/ArrangementLane.tsx` | One prop. |
| `app/components/arrangement/StudioWorkspace.tsx` | State, toggle (refused mid-gesture or mid-preview), `Env` button, `data-envelope-mode`, `a` key, lane prop, effect dependency. |
| `app/lib/arrangement/__tests__/envelope.test.ts` (new) | EV1–EV6b, 24 tests. |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` (new) | EU1–EU7, 23 tests. |
| doc 072 | l.4 exactly as specified, plus 3 lines (GATE82-S2, S3, X1). |
| doc 073 (new) | Georgian, TEMPLATE sections, status as specified. |

## Tests actually run
- `npm run typecheck`: exit 0.
- `npm run lint`: 0 errors. The 218 warnings are the repo-wide count and the same before and after this change. Owned files have 0 diagnostics.
- Scoped `biome check` on the 11 owned code files: clean. New files were formatted through stdin; there was no `--write`.
- Targeted vitest (`a-round-83/targeted-list.txt`, 64 files): **64/64 files, 1140/1140 tests pass**. Log: `a-round-83/targeted-run.log`.
- The full suite and `npm run verify` were not run, per the speed rules; they belong to the gate.
- Mutation proofs ran in a scratch copy (`a-round-83/mut/store`, with `node_modules` symlinked). `store/` was never mutated. Logs and `summary.txt` are in `a-round-83/mut/`. Every mutation turned at least one listed test red:
  - (a) ramps on clipGain → EV5a, b, c, e.
  - (b) initial value ignores `from` → EV5b, c.
  - (c) no final ramp → EV5a, b, c, e.
  - (d1/d2/d3) each clipboard builder drops `envelope` → EV4.
  - (e) export omits `clipEnvelopes` → EV6, EV6b.
  - (f/f2) either neighbour is ignored → EV3 and EU3.
  - (g) pointercancel commits → EU3.
  - (h) X1 guard removed → EU6.
  - (i) the add uses pointer y → EU2 ×2.
  - (j) an unmount keeps the preview → EU3.
  - After review: (k) line hidden when every point is outside the window → EU7. (l) a cancelled fade drag does not arm the guard → EU6#2. (m) the editor ignores Ctrl → EU7.
- A real bug found by EV3: a window-start clamp returned `-0`. It is fixed with `withoutNegativeZero`.

## A's own Playwright smoke (not C evidence)
Chromium, `:5173/studio-lab`, one warm-up load. Scripts and output are in `a-round-83/pw/`.
- **1440×900:**
  - `Env` button and `a` both toggle `aria-pressed`, `data-envelope-mode` and the status.
  - In mode the fade handles are absent (0).
  - 3 double-clicks gave `3.950:1.0000;8.950:1.0000;13.950:1.0000`.
  - Dragging the middle point gave `0.2512`, with status `Envelope: 8.950 წმ · −12.0 dB.` and the matching title.
  - The point centre y is 37.44 px against an expected 37.44 px.
  - `elementFromPoint` returns the point at the point, the left trim strip at the clip edge, and the editor inside the body.
  - Mode off: line drawn, 0 points, no editor.
  - A double-click delete, then Ctrl+Z, restores the exact `data-envelope`.
  - No non-noise console errors.
  - Screenshots: `a-r83-env-on-1440.png`, `a-r83-env-off-1440.png`.
- **X1 in Chromium:**
  - A fade drag (+5 px → `0.125`) followed by a click 100 ms later left the fade at `0.125`.
  - **The page saw 0 `dblclick` events.** Chromium did not pair the drag with the click, so A did not reproduce the GATE82-S1 trigger itself. The guard is proven in jsdom (EU6).
  - A double-click 1 s later reset the fade to `0.000` (FD-UNDO behaviour is intact).
- **Grid row:** with tempo 120, all 18 divisions (seconds, musical and triplet) have `scrollWidth ≤ clientWidth` (223/223) at both 1440 and 1280. The Env button keeps a 35 px right gap (`grid-fit.json`, `a-r83-grid-*.png`).
- **1280×720:** toggle rows OK, no console errors. The clip flow was run only at 1440.
- Not run by A: export ratio, live meter paired measurements, the video-lane check, and the full EN-EDITS sequence. These are C rows.
- The smoke was re-run after the review fixes (`pw/smoke-output-final.json`), with identical results and no console errors at either viewport.
- `mut/` is git-ignored in the loop repo, so the mutation logs and `summary.txt` are copied to `a-round-83/mut-logs/`.

## Code review (real `code-reviewer` subagent): 8.5/10, no Critical or High
- **Fixed in this round:**
  - **M1:** the line now shows whenever the clip stores ≥ 1 point, even if all points are outside the window.
  - **L2:** the guard is also armed on stale, aborted or lost-pointer endings, for both fades and points.
  - **L3:** `hasPointerCapture` is called consistently.
  - **L4:** EU6#2 was rewritten so it really tests the guard after a cancel. New EU7 tests cover a trimmed clip with a hidden point before the window, Ctrl/Shift on the editor, and a trim-strip double-click that adds nothing.
- **Not fixed; signals for B:**
  - **L1:** the line's SVG uses the root width (the existing fade-ramp convention), so it drifts up to 2 px at the right edge. The double-click time is measured from the body's left edge, 1 px off the ruler (25 ms at 40 px/s).
  - **Stacking signal (not verified in a browser):** the clip root is not a stacking context, so during horizontal scroll the `z-30` points and fade handles may cover the sticky track header (`z-20`). A possible fix is `isolate` on the clip root, but that is outside this grant.
- **Architecture note (verbatim, for B and root):** "კომპონენტის ცალკე გამოყოფა სწორი იყო და ასე უნდა დარჩეს. 500 ms-იანი დაცვა „drag-ის შემდეგ double-click“ ახლა ორჯერაა დაწერილი (`ArrangementClip.tsx:728-736`, `ArrangementClipEnvelope.tsx:299-308`), მისი კონსტანტა child-ის ფაილს ეკუთვნის და parent მას იქიდან იმპორტირებს, ხოლო `watchUncapturedPointerGesture` parent-ში ცხოვრობს და prop-ით გადაეცემა. Proposal: ერთი შეზღუდული დავალება — ორივე გადავიდეს `lib/arrangement/`-ში, invariant-ებია უცვლელი gesture lifecycle და მწვანე fade/envelope UI ტესტები."

## B acceptance: what A can honestly mark
- Passed by A, offline or in A's smoke only:
  - Required tests EV1–EV6 and EU1–EU6 are written and green.
  - Mutations (a)–(j) are all red.
  - Docs 072 and 073 are done.
  - Scope is 8 M + 5 ??.
  - T83-TARGETED passes for A's list.
- **Not claimed:** every §5 C row (EN-MODE … SOURCE-UNCHANGED) still needs C's real-browser evidence at both viewports. In particular, EN-EXPORT and EN-EDITS ratios and EN-LIVE / EN-MIDSTART are unmeasured by A. Do not mark SRW-18 done before C passes.

## Known gaps
- X1's real-browser trigger was not reproduced in A's smoke: Chromium saw no `dblclick`.
- Envelope points have no keyboard path (by spec; tracked as SRW18-KEYBOARD-FADES).
- Points do not snap to the grid (ENVELOPE-SNAP signal).
- The L1 and stacking signals above.

## Exact next checks for C
1. SOURCE-UNCHANGED: compare HEAD, `git status` (8 M + 5 ??), frozen 471/471 and protected 4/4 against `a-round-83/end-hashes.txt`.
2. EN-MODE at both viewports, including the video clip (`media/beeps-6s-h264-aac.mp4`), a folded lane, and grid-row overflow with a musical division selected.
3. EN-ADD / EN-DRAG / EN-UNDO / EN-DRAWN on the stems clip at default and 40 px/s zoom.
   - Note: at default zoom the clip is wider than the viewport, so use on-screen coordinates.
4. EN-EXPORT, plus the EN-EDITS a–g export comparisons: the primary R18-A2 evidence.
5. EN-MULTIPLY (fade + Clip Gain + envelope).
6. EN-LIVE / EN-MIDSTART as paired meter differences.
7. EN-PLAY-EDIT.
8. EN-NEIGHBOURS.
9. X1-DBLCLICK: record whether `dblclick` fires; A saw none with Playwright `mouse.click` after a drag.
10. REG-HYD and G83-3.
11. Optional: check the reviewer's sticky-header overlap signal by scrolling horizontally with a clip under the track header in Env mode.
