# A round 254: SABA-B-10b, the visible flashing insert marker and the transport rows in the shortcut sheet

**No STOP.**

**Risk for C-SHEET-254: needs a B ruling (L4/L10). Not a STOP, because §1.2 dictates the copy.**
- **Measured on the final build** (`a-round-254/browser/sheet-scroll.json`, `sheet.cjs`, 2 screenshots). The sheet's scrolling `div`:

  | Viewport | scrollHeight | clientHeight | Excess |
  |---|---|---|---|
  | 1440×900 | 1,260 | 808 | 452 |
  | 1280×720 | 1,260 | 646 | 614 |

  That is 48 rows.
- **The sheet already scrolled at HEAD:** 11 pre-existing rows are tall, for example `fit` 64, `waveform-zoom` 60 and `edge-nav` 40.
- **This round's content delta, estimated (A has no HEAD server):** about +132 px. That is the 2 new rows (40 + 40 + 2 × 6 px gap), plus `play-stop` and `marker` now wrapping to 40 px (+20 each). `back-to-start` stays 20 px.
- **The conflict:** C-SHEET-254 allows a two-line action only "if the dialog does not scroll more than at HEAD". Taken literally, the row fails by about 132 px at both viewports.
- **For B:** either accept the delta with this finding id (A-R254-SHEET-SCROLL-DELTA), or change the criterion. C should measure HEAD scrollHeight directly (HEAD control).
- Rows at 40 px from this round: `play-stop`, `continue-playback`, `insert-marker-to-playhead`, `marker`.

**One finding for B (L29, not blocking): A-R254-WRONG-TIMEOUT-PREMISE.**
- D-29z471 and A's round-253 STOP said the render-budget test "does not re-render clips, overview bars, library rows or ruler ticks over Play → Pause → Play" had no `{ timeout }` of its own, so the 5 s default applied. That is wrong: at HEAD `c65e5e9` the test ends with `}, 15000);` (`git show HEAD:app/lib/arrangement/__tests__/render-budget.test.tsx` l.346). Vitest 4 accepts that positional overload (`@vitest/runner` `tasks.d-*.d.ts` l.443: `options?: number`).
- So the declared timeout was already 15 s. A's 2,534 ms was 17 % of it, never 50.7 %.
- **Grant 7 is applied anyway:** the same 15 s is now written as `{ timeout: 15_000 }` in the second argument, the house form. Biome re-indented the test body. `git diff -w` shows no assertion change: 29 lines added (RB-IM and the signature), 2 removed.
- B should correct the D-29z471 rationale. Its outcome (15 s) already held.

**Base:** HEAD `c65e5e9`.
- At start the tree was clean and every hash check gave rc 0: frozen (1,103 files), grants and root files.
- At the end, frozen and root again give rc 0, and the 7 protected files give `git diff --quiet HEAD` rc 0.
- No commit, push, install or server start/stop. The dev server on :5173 was used as it was.

## Changed files (grants 1–8 only)
| # | File | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | `ArrangementInsertMarkerSignal` (hidden) is replaced by `ArrangementInsertMarkerLine`, mounted just before `<ArrangementPlayheadLine>` with `hidden={range !== null}`. Line: `pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-foreground motion-safe:animate-insert-marker-blink`, `aria-hidden`. `left` and `data-insert-marker` are written by `subscribePosition` inside `useIsomorphicLayoutEffect` (already imported; the same effect timing as the playhead writer, from code-review Low #2). Deps: `[insertMarkerStore, pxPerSecond]`. Render writes the initial values only. Nothing else changed in this file. |
| 2 | `app/styles/app.css` | One `@theme` declaration, `--animate-insert-marker-blink: insert-marker-blink 1.2s step-end infinite;`, and one `@keyframes insert-marker-blink` block outside `@theme`, under `/* Keyframes */`. |
| 3 | `app/lib/arrangement/shortcuts.ts` | Transport order: `play-stop`, `continue-playback`, `insert-marker-to-playhead`, `back-to-start`, `play-from-point`, `loop`. Action and key texts are exactly as in §1.2, and so is the `marker` row text. |
| 4 | `__tests__/shortcuts.test.ts` | SC1: `EXPECTED_ROW_ORDER` gets the two new ids. SC5: exact asserts for `continue-playback` and `insert-marker-to-playhead`, count 9 → 11. Nothing removed. |
| 5 | `__tests__/insert-marker-ui.test.tsx` | `MarkerProbe` also exposes `useArrangementInsertMarkerStore()`. New describe with IMV1–IMV5. |
| 6 | `__tests__/shortcut-sheet-ui.test.tsx` | New describe with SS-T1 and SS-T2. |
| 7 | `__tests__/render-budget.test.tsx` | `{ timeout: 15_000 }` on the named test (see the finding above), and the new test RB-IM with its own `{ timeout: 15_000 }`. |
| 8 | `docs/implementation/2026/quarter-IV/192-saba-b-10b-visible-insert-marker.md` | New. l.4 is exactly `**სტატუსი:** Completed (C round 254 PASS)`. Its `## ` headings are the 7 TEMPLATE headings in order. Every cited row id exists. |

`strings.ts`, `ArrangementTransport.tsx` and `ArrangementContext.tsx` are unchanged.

## Test recipes used
**IMV1–IMV5:**
- They use the existing `mountMarkerWorkspace`, `clickRuler`, `key`, `advance` and `SPACE` helpers.
- A new `clickEmptyLane` does pointerdown on `[data-track-id="music"] [data-grid-seconds]`, then pointerup on `window`, as in grid-snap-position SP11.
- Selections use `setTimeRange` (as in IM5/IM6).
- **Store-only writes:** `act(() => insertMarker.setPosition(x))` with no context change. IMV1, IMV2 (while playing), IMV3 (while hidden) and IMV5 (after the zoom) use them, so only the subscription can move the line. Without them, MU-LEFT-FROZEN stayed green on IMV2 in the first run.
- **IMV2 (L52):** asserts `setPosition(getLivePosition())` moved the store past 1.5 before the playing asserts.
- **IMV1 z-order:** `line.compareDocumentPosition(playhead) & DOCUMENT_POSITION_FOLLOWING` and the same parent (code-review Medium #1).

**SS-T1/SS-T2:**
- They use `mountSheetWorkspace`, `openFromBody`, `shortcutRow` and `rowKeys`. The transport group is found with `getByRole('region', { name: 'Transport' })`.
- Each action text is `getAllByText` → 1.
- SS-T2 searches `insert marker` and expects `play-stop`, `insert-marker-to-playhead`, `back-to-start`, `marker` and `add-sound`, but not `continue-playback`.

**RB-IM:** the same node (`toBe`) and exactly one element after Play → Pause → Play, using real buttons.

No class selectors (L12).

## Tests actually run
**Static checks:**
- `npm run typecheck`: rc 0.
- `npx biome check` on grants 1 and 3–7: "Checked 6 files … No fixes applied", with 0 diagnostics (`biome lint` on the same 6 files is clean too).
- `npm run lint`: 205 warnings and 1 info, no errors. 205 is the same count as gate 253's log; none are in owned files.
- `app.css` is not checked by Biome. The 7 css-reading files are in the covering set and green, including `store-theme-tokens` and `studio-theme-obsidian`.

**Touched and reader files:**
- shortcuts, shortcut-sheet-ui, insert-marker-ui, render-budget, bars-ruler-ui, library-preview, strings: 7 files, 152/152 before the review.
- After the review fixes, the first 5 of those files: 81/81.

**Covering set `b-round-253/covering-254.txt`, run alone, final code:**
- 132 files, 1,987/1,987 pass, rc 0.
- Output: `a-round-254/covering-254-final.json` and `.log`. The pre-review run, also 1,987/1,987, is in `covering-254.json`.

**L11 headroom (no test above 50 % of its declared timeout):**
| Test | Time | Declared timeout | Share |
|---|---|---|---|
| CP12a–d (`clip-gain-pointer-preview`) | 6.14 s max | 30 s (describe) | 20 % |
| UM3 | 2.31 s | 20 s | 12 % |
| UC5 | 2.29 s | 20 s | 11 % |
| Play → Pause → Play (`render-budget`) | 2.04 s | 15 s | 14 % |
| RB-IM | 1.46 s | 15 s | 10 % |

The other new rows each take ≤ 0.16 s.

## Mutants (`a-round-254/mutants/summary.txt`; final raw `summary-raw-3.txt`)
The mutants ran on a tar scratch at `/tmp/a254-scratch`. The repo `git status` was the same before and after.

| Mutant | Red rows |
|---|---|
| MU-SHEET-NO-ROWS | SC1, SC5, SS-T1, SS-T2 |
| MU-ARIA-NO-META | SC5 |
| MU-COPY-OLD | SS-T1, SS-T2 |
| MU-HIDDEN-SIGNAL | IMV1–IMV5 |
| MU-LEFT-FROZEN | IMV1–IMV5 |
| MU-NO-HIDE | IMV3 |
| MU-NO-PPS-DEP | IMV5 |
| MU-REMOUNT | RB-IM |
| MU-ZORDER (added) | IMV1 |
| FIX-CONTROL | green, 56/56 |

## Code review (code-reviewer subagent, 8 files): 8/10, no Critical or High
**Medium:**
- **M1, z-order untested.** Fixed: an IMV1 assert plus MU-ZORDER.

**Lows fixed:**
- **#2, `useEffect` vs the playhead's layout effect.** Fixed: `useIsomorphicLayoutEffect`.
- **#3, IMV3 had no write while hidden.** Fixed.
- **#7, SS-T2 title and `querySelector('span')`.** Fixed: `add-sound` is asserted, and the lookup is by text.
- **#8, doc accuracy.** Fixed: the render-vs-subscription wording, 0.83 flash/s (1.67 opacity changes/s), and the SC5 wording.

**Lows not changed (for B):**
- **#4, render budget.** `ArrangementInsertMarkerLine` is not in the per-frame zero-render list of the render-budget frames test. That test is outside grant 7's named rows, so it is a candidate row for B.
- **#5, WCAG 2.2.2.** The blink can only be stopped with OS reduced motion. This sits with SABA-Q-10B-MARKER-LOOK.
- **#6, dim phase.** About 2:1 at opacity 0.25, which is expected for a blink.
- **#9 (pre-existing).** A missing blank line before SC5. It is not in this diff's hunk, so it was left.
- **#8, doc l.4.** The "Completed" status is the L28 rule, so it was left.

**Architecture note (proposal for B/root, not done):** keep for now. When `ArrangementContext.tsx` is unfrozen, add `useArrangementInsertMarkerWriter`, or move `usePositionWriterEffect` to `lib/`. Then the playhead, this line and the `ArrangementLibraryPreview.tsx` l.61–76 caption would share one layout-effect writer. This matches ARCH addendum 3 / ARCH-CHECKPOINT-TRANSPORT-POSITIONS.

## Browser (Playwright Chromium, :5173 `/studio-lab`, final code)
**Setup:** a fresh context for each of 1440×900 and 1280×720, with `reducedMotion` `no-preference` and `reduce`, and the §4.7 setup. `probe.cjs`, `probe2.cjs` and `sheet.cjs` were all re-run after the final `useIsomorphicLayoutEffect` change. Their numbers match the pre-review runs, and the JSON files hold the final runs. Scripts: `a-round-254/browser/probe.cjs` and `probe2.cjs`. Results: `probe.json` and `probe2.json`, plus 24 screenshots (empty, stopped-2s, two-lines, range, sheet, range-cleared, after-home).

**Results:**
- **Lane click target:** `elementFromPoint` → the SFX lane, not the scrub strip, in all 4 contexts.
- **Before Add (empty project):** one line, visible, 1 × 408 px at 1440 and 1 × 392 px at 1280.
- **Stopped click at 2 s:**
  - exactly 1 element, displayed, 1 px, `rgb(236, 230, 218)`;
  - the same height as the playhead (408 / 392 px);
  - `pointer-events: none`; a click through it at its x hits the SFX lane;
  - `data-insert-marker` is `2.000`; its centre is −0.59 px from the lane x for 2 s.
- **Blink:**
  - `no-preference`: `animation-name` is `insert-marker-blink`. 24 samples at 100 ms read 6 × 1 then 6 × 0.25, repeating: 4 changes in 2.4 s.
  - `reduce`: `animation-name` is `none`, and opacity is 1 in all 24 samples.
- **Contrast** (ink against the first opaque background, with both lines and the handle hidden):

  | Background | Ratio |
  |---|---|
  | ruler / marker strip `rgb(22,20,18)` | 14.78 |
  | video dropzone `rgb(14,13,12)` | 15.62 |
  | SFX lane (`rgb(14,13,12)` + 5 % brass overlay) | ≈14.7 |
  | unselected clip body `bg-elevated` `#1d1a17` | 13.94 |
  | selected brass title bar | 1.88 (INFO-B254-INK-ON-BRASS, listed only) |

  The playhead handle measures the same 1.88 where the two coincide.
- **Two lines:** after Space, about 1.5 s, then Space, the marker stays at 2.000 and the playhead is 145.3 px from it. Both are displayed. The next Space starts at `00:02.069`–`00:02.081`.
- **Click while playing** (lane at 6 s): the marker reads 6.000 within 100 ms. Playback continues and the clock advances (2.59 → 2.99).
- **Home (stopped):** 1 attribute mutation, final `0.000`, and the line is at the header edge (Δ 0 px). **Home while playing:** the clock goes 8.68 → 0.44 and playback continues.
- **Range** (music clip waveform drag 5 → 7 s): `arrangement-range` is present and the line is `hidden`. An empty SFX-lane click (8 s at 1440, 3 s at 1280; 8 s is off-screen at 1280) clears it, and the line shows at the new marker.
- **Zoom and scroll:**
  - The line stays at the ruler `0:02` label x − 5 px (the label's padding) after `-`, `-`, `=` and Shift+wheel scroll at both viewports.
  - The first `=` after setup was a no-op (already at max zoom).
- **Titles:** `Play (Space)` / `Space` and `Back to start (Home)` / `Home`. `Pause (Space)` was not captured stopped; IM rows cover it.
- **Sheet:**
  - The 6 transport rows are in the §1.2 order, with exact texts and keys. The `marker` row text is exact.
  - Row heights at both viewports: the two-line rows are 40 px and the others 20 px; `play-from-point` is 42 px, as at HEAD.
  - Scroll: see the risk at the top. The HEAD control is left to C.
- Page errors: 0.

## Known gaps (not claimed)
- **C's browser rows not run by A:**
  - the HEAD control (hidden 0×0);
  - the sheet dialog scroll height at HEAD (current numbers and the estimated delta are in the risk at the top);
  - the C-BUDGET persistent text-line count (85/101, 69/85);
  - the LAB-SMOKE export sha256 (`1fea093b…`);
  - the auth guard;
  - the `/` store page check after the global `app.css` change;
  - Tab order around the timeline (L50 grep = 20 hits, the same as HEAD).
- **Not run by A:** the full suite, `verify`, the build and e2e smoke. These are gate rows.
- **INFO-B254-INK-ON-BRASS:** 1.88:1 on the selected brass title bar, as B expected.

## Next C checks (exact)
1. **C-SCOPE-254:**
   - `git status` shows 7 `M` (grants 1–7) and 1 `??` (doc 192).
   - The `app.css` diff is 1 `@theme` line plus 1 keyframe block.
   - The grant-1 diff is the component plus its mount only.
   - `render-budget.test.tsx` `git diff -w` adds only RB-IM and the signature.
2. **C-UNIT-254:** run the 7 named files alone and grep SC1, SC5, SS-T1, SS-T2, IMV1–IMV5 and RB-IM.
3. **C-MUT-254:** run MU-HIDDEN-SIGNAL, MU-NO-HIDE and MU-SHEET-NO-ROWS (script: `a-round-254/mutants/run-mutants.py`, scratch path at the top).
4. **Browser rows:** C-MARKER-VISIBLE, C-BLINK, C-CONTRAST, C-TWO-LINES, C-MARKER-PLAYING, C-MARKER-RANGE, C-HOME (mutation count), C-ZOOM, C-SHEET (incl. dialog scroll vs HEAD), C-TITLES, C-FOCUS, C-BUDGET, LAB-SMOKE export hash, Auth, and the `/` store page at 1280.
5. **AN-REVIEW-254:** doc 192 l.4, headings and cited ids.

## B acceptance self-assessment (A's evidence only; C decides)
**Met in A's runs:**
- §1.1 line look, position, flash, `reduce`, hidden with a selection, mount order and signals;
- §1.2 rows and texts;
- §1.3 timeout declared;
- §2 rows SC1, SC5, SS-T1, SS-T2, IMV1–IMV5 and RB-IM, with named mutants red and FIX-CONTROL green;
- §4 steps 1–7.

**Not self-marked:** every §5 row is C's. The backlog is not marked complete.
