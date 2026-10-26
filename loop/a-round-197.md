# A — Round 197 report: SABA-B-4 stage 1 fix-up

**Scope:** R88 implemented (option a, plus a measured stacking fix). R90 is a ruling; no code change was needed. **R89 was implemented, measured, then reverted under the task's stop rule**, because it scrolled the view on its own when a sticky-chrome control got focus. C-R196-02 stays open for its own round. No commit, push or deploy.

## Baseline (A's first step): all OK
- HEAD is `7339cd5`.
- `git status --short` equals `b-round-196/git-status-at-planning.txt`.
- `a-round-196/end-sha256.txt` is OK.
- The frozen list (1023) is OK, and so are the 6 start hashes.

## Changed files (vs `b-round-196/r197-granted-start/`, patch `a-round-197/diff-vs-start.patch`)
| File | Change |
|---|---|
| `app/components/arrangement/studio-focus.ts` | + `STUDIO_FOCUS_RING_EDGE_CLASS = '[--focus-offset:-1px]'` (one constant). |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | <ul><li>Import of the edge constant.</li><li>Flag button: `INSET` → `EDGE`, and adds `pr-1` and `isolate`.</li><li>The flag's stem span: adds `-z-1`.</li><li>Nothing else (handlers, strings and other rows are unchanged).</li></ul> |
| `app/components/arrangement/StudioWorkspace.tsx` | **Unchanged**: byte-identical to its start copy after the R89 revert (sha `fc95ed4b…`). |
| `app/lib/arrangement/__tests__/studio-focus-ring.test.ts` | <ul><li>SFR3: exact file content is now 2 lines; MarkerRow inset count 2→1; `EXPECTED_INSET_TOTAL` 22→21.</li><li>+ **SFR6**.</li><li>No assertion weakened.</li></ul> |
| `app/lib/arrangement/__tests__/markers-ui.test.tsx` | Unchanged (no flag-class assertion locks the old recipe). |
| `docs/implementation/2026/quarter-IV/159-saba-b-4-studio-focus-ring.md` | + Georgian section "Round 197" (R88–R90, measurements, rejected alternatives, the R89 revert). |
| **new** `app/lib/arrangement/__tests__/focus-reveal-ui.test.tsx` | Stub with 3 `it.todo` (FR-a/b/c), see "R89" below. The full working suite is saved at `a-round-197/focus-reveal-ui.test.tsx.r89-full`. |

- **No pre-authorised extra test edits** were needed.
- `git status` = the round-196 set + `?? app/lib/arrangement/__tests__/focus-reveal-ui.test.tsx`.
- Frozen list OK at the end.
- `a-round-197/end-sha256.txt` written (6 grants + 1 new file).

## R88: the flag ring (C-R196-01)
**Geometry before the change** (`geom-start-1440.json`):
- Flag 61×20; pill 57×16.
- Clearance: top 2, bottom 2, left 4 (stem column x 0–1), right 0.
- The loop strip starts at the flag's bottom edge (y 259).

**Option (a):**
- `pr-1` gives a box of 65×20.
- The edge constant gives a computed offset of `-1px` and a computed width of `1px` (Chromium 143). The ring is 2 device px on the box's outermost pixel.

**Measured extra (not in B's text):**
- Chromium paints positioned descendants after the element's own outline. So the `absolute` stem hid the ring's whole left side: 0 changed px in the left column in both states (`colcheck.cjs`).
- Fix inside the flag structure: `isolate` on the button and `-z-1` on the stem. The stem now paints under the ring, inside the button's own stacking context.
- After the fix the unselected left column changed 0 → 40 px. This also proves `-z-1` is compiled (answers the reviewer's build-CSS Low).
- B/C: please judge whether the stem class is within "flag structure for R88". It is the minimal change that makes four sides present.

**Pixel results** (`flag-ring-{1440,1280}.json`/`.out`, shots in `flag/`). DPR 2, both viewports, selected and unselected, Tab-focused (stop 70):

| Side | Ring vs outer | Ring vs inner | Background gap to pill border |
|---|---|---|---|
| top | 4.73 | 5.43 | 2 device px |
| bottom | 5.59 | 5.59 | 2 device px |
| right | 5.43 | 5.43 | 6 device px |
| left, unselected (ring over the muted stem) | 6.63 | 7.61 | 6 device px |
| left, selected (column = brass stem #c9a46a, ring is the same colour) | 6.86 | 7.88 | 6 device px |

- **Left side when selected:** brass at 80 % over the brass stem gives brass. The column reads as the brass stem, so 0 changed px. The stem column vs outer #24211e and inner #161412 is well above 3:1. This is the "ring covers the stem column" case that B allowed.
- **Outside the flag box:** 0 changed px.
- **Bottom ring row:** CSS y 258, while the loop strip starts at 259, so it is not covered. No side is clipped.
- **Label pixels:** unchanged.

**Rest vs ref** (`rest/rest-{1440,1280}.json`):
- Ref is a start-copy scratch (`/tmp/a197-scratch`, own node_modules link dir, so a separate vite cache), served on :5183 and stopped afterwards.
- Default and marker scene: **0 changed px**, both viewports.
- Chrome, marker strip, loop strip, lane and label boxes Δ 0.
- Flag 61→65 wide.
- Load scrollTop/scrollLeft 0/0 on both.
- 0 pageerror, 0 hydration. The only console errors are the expected cart `ERR_CONNECTION_REFUSED`.
- The first 1440 run died while the ref server was cold-loading; the rerun passed.

**Evidence timing:** `flag-ring-1440`, `flag-ring-1280`, `rest/*` and `marker-func-5173-1440` were all re-captured after the R89 revert, with identical results. The earlier copies taken with R89 active are in `pre-revert/`.

**Marker function, tree = ref** (`marker-func-{5173,5183}-1440.json`):
- A click near the flag's right edge jumps to 00:00.000.
- Dragging the flag from 0 lands at 2.000 s.
- Right-click opens the menu.
- A mouse press leaves no outline (`outline-style: none`, source `pointer`).
- ArrowRight afterwards nudges to 2.100 with a solid ring.

## R89: scroll-padding (C-R196-02). Stop rule invoked, reverted
1. **Pre-change probe** (`probe-r89-start-none-1280.json`): 6 hidden stops forward (i69–74 Video row) and 6 backward. With `scroll-padding-top: 84px` injected into the page: 0 hidden (`probe-r89-start-inject-1280.json`).
2. **Implemented:** `scroller.style.scrollPaddingTop = `${metrics.timelineChromeHeight}px`` in `refreshTrackLaneLayout`, before the panel-animation early return.
   - Tab: 0 hidden at 1280 and at 1440.
   - Load scroll 0/0.
   - Mouse click on a lane Mute: 46→46 (`pre-revert/probe-r89-tree-*.json`).
   - FR-a/b/c green, red on the start copies; m9/m11 killed.
3. **Regression (code-reviewer Medium, confirmed live):** at 1280 in the rich scene, scrolled to scrollTop 46, focusing a **sticky chrome** control scrolls the view to the top. Tree vs ref:

   | Action | Tree with R89 | Ref |
   |---|---|---|
   | Playhead handle mouse grab | 46 → **0** (mid-drag) | 46 |
   | Marker flag focus | 46 → **0** | 46 |
   | F2 rename input | 46 → **0** | 46 |

   Files: `pre-revert/chrome-focus-5173-1280.json` (tree with R89) and `chrome-focus-5183-1280.json` (ref).
4. **Why it was reverted:**
   - The task pre-writes "R89 scrolls by itself … on a mouse click → regression FAIL (Medium)".
   - The fixes are all outside my grant: `scroll-margin` on the chrome's children (StudioWorkspace, chrome div), or `preventScroll` at `ArrangementRuler.tsx:151` `focus()` and the `ArrangementMarkerRow.tsx:202` rename `input.focus()`.
   - So `StudioWorkspace.tsx` was restored byte-for-byte from its start copy.
   - After the revert, chrome-focus is 46/46/46, the same as ref (`chrome-focus-5173-1280.json`). Tab hides i69–74 again (`probe-r89-final-1280.json`).
5. **Test file:**
   - `focus-reveal-ui.test.tsx` is kept as 3 `it.todo` entries, not deleted (orchestrator "no deleting tests/files"). It prints "3 todo", exit 0, and adds 0 lint warnings.
   - The full suite is saved in `a-round-197/focus-reveal-ui.test.tsx.r89-full` for the follow-up round.
   - B/root may prefer to delete the stub instead; that is their call.
6. **Proposal for B's C-R196-02 round:**
   - Grant the chrome div (or its focusables) a negative `scroll-margin-top`, or `preventScroll` on the two `focus()` sites.
   - Extend FR-c to "focus on a sticky chrome control while scrolled does not change scrollTop" (live row: playhead grab, flag Tab/focus, F2, Snap).
   - Chrome height was 84 px in every state I checked (default, BPM 90, marker, detail). The tempo, marker and loop strips are always mounted.

## R90
No code change. The served rule still declares `1.5px` (SFR1 green; mutant m2 → SFR1 red). The computed width is `1px` in Chromium 143 (HeadlessChrome), confirmed on the flag (`ow: 1px`).

## Tests and checks actually run (after the revert)
- `npx vitest run` on 24 neighbour files (`a-round-197/neighbour-suites.txt`, including studio-focus-ring, focus-source, markers-ui, every marker*, status-announcement-ui, track-layout, the detail suites and the 10 scroller suites): **23 passed + 1 skipped (todo); 441 passed, 3 todo** (`vitest-neighbours.log`).
- **Red proof** on the start copies (scratch): SFR3 and SFR6 red (`mutants.log` "start-copies"). Before the revert, FR-a/b/c were also red (`red-proof-start-copies.log`).
- **Mutants** (scratch copies, final tree):

  | Mutant | Fails |
  |---|---|
  | m10 | SFR3 + SFR6 |
  | m12 | SFR2 + SFR6 |
  | m13 (stem without `-z-1`) | SFR6 |
  | m2 | SFR1 |

  m9/m11 are n/a after the revert (both were killed by FR-* before it).
- `npm run typecheck`: clean.
- `npm run lint`: 214 warnings + 1 info (equal to round 196).
- `npx biome check` on the 6 granted files + the new file: 0 errors.
- Not run: the full suite, `npm run verify`, build (gate rows per the speed rules).

## Code review (code-reviewer subagent, actually invoked): 8/10, conditional on the chrome-focus check
- **Medium (chrome focus scroll):** confirmed, so R89 was reverted (see above).
- **Low FR-c weak in jsdom; Low early-return placement untested:** moot after the revert. Recorded for the follow-up round.
- **Low `-z-1` build:** answered by the pixel evidence (left column 0→40 changed px).
- **Low:** SFR6/stub helpers depend on class-string order. They fail loudly; accepted.
- **Low/Info, tightly packed markers:** with clamped labels the ring's right edge (D+3) touches the next pill's border (D+4), and the next flag's stem crosses the ring's top and bottom edges. Not measured; a known gap for B/C. FLAG-RING-197 uses one marker.
- **Info:** hit-testing and drag are unchanged (stem `pointer-events-none`, button still `z-index: auto`); no stub leakage.
- **Architecture note (verbatim, for B):**
  > - **Signal 4 (new state added to an existing owner):** `StudioWorkspace.tsx:695–722`. `refreshTrackLaneLayout` now also owns a scroll setting next to lane metrics. **Keep:** it is one line in an existing read-then-write path, uses the same measured value, and adds no new effect, listener or cleanup. Moving it out would duplicate the chrome measurement for no gain.
  > - **Signal 3 (repeated costly change):** `studio-focus.ts` and `studio-focus-ring.test.ts`. The focus-ring area is changed in consecutive rounds. Each tweak forces edits to source-parsing tests with exact counts (`EXPECTED_INSET_TOTAL` 22 → 21, SFR3's exact file contents, SFR6's literal stem prefix). **Keep for now;** this is a one-line backlog signal for the planner (B) that the maintenance cost of these tests is rising.

  Signal 4 no longer applies, because R89 was reverted.

## B acceptance: what A truly passed (A-side evidence; C verifies independently)
- **FLAG-RING-197:**
  - A's measurements meet every listed condition at 1440 and 1280, selected and unselected: one outline-only ring, ≥ 3:1 on both neighbours on all sides, ≥ 1 device px of background gap, a 4 px wider flag, unchanged label pixels, not covered or clipped.
  - Caveat: in the selected state the left side coincides with the brass stem (0 changed px in that column).
- **REST-197, MARKER-FUNC-197 (click, drag, right-click menu, pointer), POINTER-197 on the flag:** A-side evidence as above.
  - Not checked by A: double-click play, keyboard menu shortcut, rename/delete via the menu, Ctrl+←/→, and POINTER on a Video-row lane control.
- **FOCUS-REVEAL-197:** **not passed**. The stop rule was invoked; the expected C status is `notRun` with the measurement above. C-R196-02 stays open.
- **T-RUN-197:** SFR6 red on the start copies; m10/m12/m13/m2 killed. FR-a red / m9 / m11 do not apply after the revert.
- **SCOPE-197:**
  - The StudioWorkspace diff is empty.
  - The MarkerRow diff is the flag (constant, `pr-1`, `isolate`) plus the stem `-z-1`. The stem token goes slightly beyond B's literal "constant, `pr-1`, or the (b) structure". Rationale above.
- **Process deviation:** the first doc-159 append was made with a shell heredoc, not Edit/Write. Later corrections used Edit. Content only, inside the grant.

## Exact next checks for C
1. **FLAG-RING-197 at 1440 and 1280:**
   - Add Marker 1 (selected), Tab to it (about stop 70 in the default scene). Then add a second marker at a later time (Marker 1 becomes unselected) and Tab back to Marker 1.
   - Sample all four sides. Expect the left side over the muted stem when unselected, and a brass stem column when selected.
   - Reset `scrollLeft` to 0 if a ruler click scrolled it. At 1280 a ruler click produced `scrollLeft` 2, which puts the t=0 stem under the sticky header; that is pre-existing.
2. **MARKER-FUNC-197 in full:** double-click play, the keyboard menu shortcut, rename/delete, Ctrl+←/→, and the drag snap.
3. **REST-197 vs a round-196 ref:** 0 px outside the flag. Under (a) the flag box is 65 wide.
4. **RING-KEY-197:**
   - Same reached set and order as the ref.
   - The flag stop has offset `-1px`; every other stop is unchanged.
5. **FOCUS-REVEAL-197:** `notRun` (stop rule). Optionally reproduce the R89 regression from this report only as context. Do not FAIL A on C-R196-02.
6. **SCOPE / T-RUN:**
   - SCOPE: frozen list (1023), `a-round-197/end-sha256.txt`, `git status` = the round-196 set + the stub.
   - T-RUN: SFR6 on the start copies; mutants m10/m12/m13/m2.
7. **G197-3 and PX-NET/REG-HYD:** as in the task.

## Known gaps
- C-R196-02 is still open (R89 reverted). A proposal for its round is above.
- Tightly packed markers: the ring touches the next pill's border (reviewer Low, unmeasured).
- Firefox: a 1.5 px ring at −1 px offset would extend 0.5 px outside the box, and its bottom half-pixel would sit under the loop strip. Only Chromium was checked.
- C-R196-05 and C-R196-03 were untouched (out of scope).
