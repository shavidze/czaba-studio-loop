# A — Round 196: SABA-B-4 stage 1 (Studio focus ring, pointer modality, one thumb)

STATUS: IMPLEMENTED — ready for C. No commit or push.

## Start / scope
- At start: HEAD 7339cd5, `git status` clean, frozen 990 OK, 34 start hashes OK.
- At end: frozen 990 still OK (`sha256sum -c` re-run). `git status` shows **31 modified grants + 5 new files**, nothing else. Unmodified grants: content-colour-ui, drag-feedback-colour-ui and mode-toggle-colour-ui tests (they still pass as written).
- No pre-authorised extra test file was needed. No grep hit outside the 18 Studio grants, so the K0 stop rule did not fire.
- Artifacts:
  - `a-round-196/end-sha256.txt` (39 = grants + new files)
  - `a-round-196/diff-vs-start.patch` (grants vs `b-round-195/r196-granted-start/`)
  - `a-round-196/k0-sites.tsv`
- Process note: most lasting edits used Edit/Write. Exceptions:
  - The K2 token sweep was a line-targeted node script on the K0 rows; it removed 168 tokens.
  - Two test edits (export-dialog-hold-enter, detail-panel-strings-ui) were small python replaces.
  - `biome format --write` was run only on owned files.

## Changed files
- **CSS (K1):**
  - `app/styles/app.css`: the R83 rule body and the new R85 rule right after it.
  - `app/styles/base/utilities.css`: the duplicate block deleted, comment included.
- **K3 (R86):** `studio-fader.ts` rewritten with `STUDIO_SLIDER_INPUT_CLASS`, `STUDIO_SLIDER_TRACK_CLASS`, `STUDIO_SLIDER_THUMB_CLASS`, `STUDIO_NEUTRAL_SLIDER_CLASS` (Pan, Zoom) and `STUDIO_LEVEL_FADER_CLASS`.
  - Thumb: 14 px (`size-3.5`), `-mt-1.25`. Fill: `1.75 / 3.5 × spacing`.
  - `STUDIO_FADER_FOCUS*` constants deleted.
  - Six consumers updated; all six range inputs are `h-4` with no `accent-foreground`. Pan went from `h-1` to `h-4`; Zoom had no height before and is now `h-4`.
  - The Pan reset button lost the peer recipe and its own ring.
- **New:** `app/components/arrangement/studio-focus.ts` (`STUDIO_FOCUS_RING_INSET_CLASS = '[--focus-offset:-2px]'`).
- **K4 (R85):** new `app/lib/focus-source.ts` (`installFocusSourceTracking(doc)`, `useFocusSourceAttribute()`, `isFocusSourceModifierKey`), mounted as the first hook in `StudioWorkspace`.
- **K2 sweep:** 17 Studio components. R87 changes:
  - Library separator: `focus-visible:bg-brand` removed.
  - Library search: `focus:border-brand` and `focus:outline-none` removed.
  - Clip-gain pending: `focus-visible:ring-warning` removed (`border-warning` kept).
  - Marker flag: `ring-offset-*` removed.
  - ExportDialog:261 container is unchanged.
- **Doc:** `docs/implementation/2026/quarter-IV/159-saba-b-4-studio-focus-ring.md` (Georgian: R83–R87, rejected alternatives, known store effect).
- **Tests:** 2 new files and 11 granted test files updated. Every update replaced the old ring tokens with "no own focus recipe" or the inset-constant assertion; no assertion was deleted.
  - affordance DXA1/DXA6/DXA7: `focus-visible:bg-brand` moved from KEPT to RETIRED with count 0.
  - detail-panel-fit F4.
  - detail-panel-strings DSU1.
  - export-dialog-hold-enter ESU1.
  - label-status DXL2.
  - mixer-onstate DXM5.
  - panel-radius PNR2/PNR5 class strings.
  - track-layout handle class and R23-N.
  - transport-surface TS1.
  - video-dock VFR1.
  - fader-style FS7/FS1/FS5. The FS1 check "dimmed reset dims the Pan ring" was dropped because the delegated ring no longer exists.

## R84 inset decisions (measured, Playwright 1440, DPR 2)
- K0 started with **11** former `ring-inset` sites, all on the inset constant.
- A moved **11** more sites from default to inset. Evidence: `a-round-196/r84-clip-1440.json` (overflow-ancestor geometry) and `a-round-196/live/covered/*.png` (pixel probe of all four ring sides).
  - **Clipped by an overflow ancestor (geometry):**
    - Snap, Grid-division select, Env and Waveform Zoom select: top T1.5 cut by the timeline scroller.
    - Tempo input: T1.5/B0.5 cut by the sticky `h-5` strip. The metronome is in the same strip; it was disabled when measured, so it is classed by inference.
    - Marker add/prev/next (`MARKER_HEADER_BUTTON_CLASS`): T1.5/B0.5 cut by the same strip.
    - Library separator: default ring cut R2/T3/B3.
  - **Covered by the next row (pixels, found after code review):**
    - Group M/S (`TRACK_GROUP_MIX_BUTTON_CLASS`): bottom edge covered by the next track header.
    - Group name editor: bottom edge covered by the next row.
    - Marker flag: bottom edge covered by the loop strip.
  - After the moves, all four ring sides were present in pixels on group M/S, group name editor, group name, group Volume, marker flag, Collapse and video expand.
- **Kept on default:** the playhead handle. The scroller cuts its top edge (T3), but the left, right and bottom edges are visible. An inset ring would be brass on its brass fill.
- **Not ring-caused:** library items cut only because they are scrolled below the list, and the track-height handle's right edge cut because the handle is wider than the scroller (1424 px).
- Total constant uses: **22**, locked by SFR3.

## Tests actually run (final tree)
- `npm run typecheck`: clean.
- `npm run lint`: **214 warnings + 1 info**, equal to round 195. An intermediate +6 `noTemplateCurlyInString` in my new test was fixed.
- `npx biome check` on all 33 changed/new code files: 0 errors.
- New suites: `studio-focus-ring.test.ts` (walker guard + SFR1–SFR5) and `focus-source.test.tsx` (FS-a…FS-f plus FS-g for the pure installer): **13/13 green**.
- Neighbour suites: `npx vitest run app/lib/arrangement app/components app/lib/__tests__/focus-source.test.tsx app/lib/__tests__/store-theme-tokens.test.ts` gave **148 files / 2195 tests passed** (`a-round-196/vitest-arrangement-3.log`). This includes all 14 granted tests and fader-click, fader-guards, track-pan, pan-release-recovery, lane-strings-ui, studio-theme-obsidian, track-group-mix-ui, export-dialog-focus(-restore), all library-* and marker-* suites, and store-theme-tokens.
  - That run started before the 4 extra SFR2 prefixes were added (`focus:bg-`, `focus:shadow`, `focus-within:`, `group-focus`). The changed suite was re-run on its own afterwards: green.
- **Red proof** (`a-round-196/mutants.log`, section `red-start-copies`; first run in `red-proof-start-copies.log`): on the start copies, SFR1–SFR5 are red and `focus-source.test.tsx` fails to resolve its import.
- **Mutants**, on scratch copies of the final tree:

| Mutant | Change | Red tests |
|---|---|---|
| m1 | ring recipe back on a Lane M button | SFR2 |
| m2 | global rule back to 2px | SFR1 |
| m3 | modifier filter removed | FS-c |
| m4 | thumb back to `size-3.75` | SFR4 |
| m5 | cleanup keeps the attribute | FS-d, FS-f, FS-g |
| m6 | `focus:border-brand` in Library | SFR2 |

- Not run, per the speed rules: the full `npm run test:run`, build, verify and e2e. Those belong to the root gate.

## Live proof (Playwright Chromium on :5173, DPR 2, `--disable-lcd-text`)
Script: `a-round-196/live196.cjs`. Results: `live/{1440,1280}/result.json`. State file: `a-browse.json`.
- **Rest vs `c-round-191/.../rest-full.png`:**
  - 1440: 5589 changed device px, **0 outside** the union of range-input boxes (grown 2 px).
  - 1280: 5389 changed, **0 outside**.
  - 0 console errors, 0 hydration messages, no forbidden or auth requests (`netOk` true).
  - ENV-FIRST-LOAD: the first 1440 load after the new import was blank, with "Invalid hook call" and a hydration error (Vite dependency re-optimisation). Every later load was clean. That attempt is kept in `live/1440-attempt1/`.
- **Thumbs** (clip selected; centre pixel and measured diameter):
  - Pan, track Volume, Master, Clip Gain and Zoom: centre **#ECE6DA exactly (Δ0)**, **14 × 14 CSS px**.
  - Group Volume: no group exists in the default lab, so it was not sampled by this script. Its ring was pixel-checked separately.
  - Clip Gain at 1280: below the fold, so not sampled at that size.
- **Saba's scene:** the 4th Tab focuses the first Pan, "Pan — Stems" (`saba-pan-keyboard.png`). The ring hugs the 48 × 16 input, offset 2 px, with no pill. Source attribute: `keyboard`.
- **Pointer then keyboard, on Pan, track Volume and Zoom:**
  - After a mouse press: `outline-style: none` and source `pointer` (`*-mouse-pressed.png`).
  - After ArrowRight on Pan (0 → 1) and ArrowUp on Zoom (500 → 501): ring solid, source `keyboard`.
  - Track Volume stayed 0 → 0 because that lane was already at its 0 dB max (`TRACK_VOLUME_DB_MAX = 0`). This is the normal clamp, not a bug.
  - Shift alone, then Alt alone, after a fader press: no ring. A following Tab moved to the next element, which shows the ring.
- **All 77–82 focusables** (`r84-clip-1440.json`): each shows a solid outline when focused from the keyboard, with `box-shadow: none`.

## Known gaps / findings for B (not fixed)
1. **Medium — needs B or Saba before C's RING-KEY row.** Chromium reports `outline-width: 1.5px` as **`1px`** (computed) and draws 2 device px at DPR 2. The cause is Chromium, not the build (`a-round-196/outline-width-probe.json`, HeadlessChrome 143):
   - The served stylesheet declares `1.5px`. The pipeline only adds a color-mix fallback; the width is unchanged.
   - Chromium floors widths to whole CSS px: a test `1.5px` outline gives `1px`, `2.5px` gives `2px`, and a `1.5px` border also gives `1px`.
   - The only fix is a spec change to 2px, and mutant m2 would then have to flip. The code implements R83 exactly. C will read 1px on every element. B must either accept "1px computed, about 3:1+ colour" or change R83 to 2px. Note that mutant m2 currently locks 1.5px.
2. Library separator (`w-1`, inset −2 px): there is no inner box left, so the ring draws as a solid brass bar about 3 px wide. That reads like a fill (R87 spirit). Vetoable; listed for Saba.
3. The playhead handle's top ring edge is cut by the scroller; the other 3 sides are visible. Kept on default (reason above).
4. Group Volume thumb and 1280 Clip Gain thumb were not sampled (see Thumbs). REST-196 neighbour boxes vs the ref server were not measured by A; C does that with the ref.
5. `--focus-offset` inherits. Today every inset site is a leaf control. Putting the constant on a container would make every child inset.
6. Store pages: thinner ring now (known R83 effect). Store controls with their own `ring-2` keep a double band until stage 2.

## Code review (actual `code-reviewer` subagent, score 8/10)
- **Medium 1** (1.5 → 1px): reported above as finding 1. It is B's decision and not changed in code.
- **Medium 2** (group-row rings probably covered): **fixed**. Pixel probe confirmed group M/S and group name editor bottom edges were covered, and the marker flag's too. All moved to inset and re-measured with 4 sides visible.
- **Lows addressed:** SFR2 forbidden list widened (`focus:bg-`, `focus:shadow`, `focus-within:`, `group-focus`; Studio has 0 hits). Doc 159 count corrected to 11 tests.
- **Lows left:**
  - Leftover `!== 'focus-visible:ring-brand'` exclusions in 3 tests: harmless.
  - `ringOwner` parameter in the affordance test now always equals the element.
  - FS-f filters on `options === true`.
  - Unused helper exports.
  - Test file name differs from its source file (the spec required this name).
  - Cleanup deletes the attribute unconditionally. This matters only if stage 2 adds a second mount.
- **Architecture note (verbatim, for B):**
  > **Signal 4 (new listener lifecycle in an existing owner):** `StudioWorkspace.tsx:460` now owns a document-wide input-modality listener pair. That concern is page-wide, not Studio. **Keep** for stage 1: one lifecycle, small, tested, and in the spec. **Proposal for the planner:** at stage 2's store-mount decision (store layout vs. a narrow `root.tsx` grant, already in §8), move the mount out of StudioWorkspace instead of mounting twice. That also solves the Low on unconditional cleanup.
  > **Signal 2 (coupling):** `studio-focus.ts:1` and `app.css:381` share the string `--focus-offset` with no common constant. SFR1 and SFR3 lock it on both sides. Keep.
  > **Signal 3:** the shared `app.css` region is already logged as `ARCH-R193-THEME-REGION`. One-line addendum only, no new action.
  > This is a proposal, not a refactor instruction.

## B acceptance items A truly passed
- K0 inventory written; stop rule did not fire.
- K1, K2, K3, K4 implemented within grants. SFR1–SFR5 and FS-a…FS-f green on the tree. Red proof and all six mutants behave as specified.
- typecheck clean, lint count unchanged, Biome 0 errors, neighbour suites green, doc 159 in Georgian.
- Live proof items run: Saba scene, mouse press on Pan/Volume/Zoom with no ring, ring after ArrowUp, thumbs, rest diff only inside range boxes.
- Code-reviewer run; its Medium 2 fixed; Medium 1 escalated.
- **Not claimed:** the RING-KEY "1.5 px computed" expectation (see finding 1), and any C row.

## Exact next C checks
1. INVENTORY-196: `focus-inventory.mjs app` plus `k0-sites.tsv`. Inset count is 22 constant uses; the 11 A moves are marked in the tsv with their measured reason.
2. RING-KEY-196: expect computed `outline-width: 1px` in Chromium (finding 1). Check offset −2 on the 22 inset sites, including group M/S, group name editor, marker flag, Snap/Grid/Env/WZoom, tempo, metronome, marker buttons and the separator. Pixel check all four sides of the group-row controls and the marker flag.
3. POINTER-196 for all six ranges, the WZoom select, the Overview, a library row and BPM. **R85 by design:** any non-modifier key switches to keyboard modality. Measure the select's ring **before** pressing Escape; a ring after Escape (or after Space-to-play following a fader press) is the expected R85 consequence, not a regression. Group Volume needs a group: Shift-click two track names, then Ctrl+G.
4. THUMB-196: include group Volume and Clip Gain at both viewports (scroll it into view at 1280).
5. REST-196 / SABA-SHOT-196 vs ref; neighbour boxes ±1. Zoom became `h-4`; compare its row.
6. STORE-FOCUS-196: no `data-focus-source` on store pages after leaving `/studio-lab` (unmount deletes it). Store fields with `focus:outline-none` still show the global ring.
7. FUNC-196: Pan reset puts focus on Pan with no ring; Space play/pause; separator keyboard resize; search typing and Escape; export dialog initial focus and Tab trap.
