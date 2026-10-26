# A — Round 191 report (SABA-B-3: fader pressed/focus state)

Status: DONE (implementation complete, awaiting C round 191). A does not mark SABA-B-3 done; C verifies.

## Start checks
- HEAD `338564e`: OK.
- `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-190-r191-tree-sha256.txt` from the store root: OK (1013).
- The 6 granted start hashes: all OK.
- The `:5173` server was already running (orchestrator). Mock `:5199`: not started (A needs no store rows).

## K0 — reproduction and cause (start tree, before any edit)
Tools: `a-round-191/tools/fader-probe.cjs` (B's probe extended to six controls, with group and clip setup), `a-round-191/tools/fresh-press.cjs` (a fresh page with no prior interaction, mouse-down held 400 ms). Playwright Chromium, DPR 2, `--disable-lcd-text`, `:5173/studio-lab`.
Variants are runtime DOM toggles on the one element under test, not source edits: `noring` = `classList.remove('focus-visible:ring-2','focus-visible:ring-brand')`; `nooutline` = `style.setProperty('outline','none','important')` (this is what the `!` modifier would do).

### Cause table (fresh page, pointer-down; identical at 1440×900 and 1280×720)
| Control | variant | `:focus-visible` | outline | box-shadow (brass layer) | look |
|---|---|---|---|---|---|
| track Volume / Pan / Master | none | true | `rgb(201,164,106) solid 2px`, offset 2px | `0 0 0 2px rgb(201,164,106)` | **filled brass box** (`shots/fresh-before-*-*-none.png`) |
| same | noring | true | brass 2px @ 2px offset | none | one ring at a gap; it cuts through the thumb |
| same | nooutline | true | none | 2px hugging | one hugging ring; it cuts through the thumb |
| Zoom | none | **false** | none | none | no box on a press |

Logs: `a-round-191/fresh-before-1440.log`, `fresh-before-1280.log`. Crops: `a-round-191/shots/fresh-before-{1440,1280}-{trackVol,pan,master,zoom}-{none,noring,nooutline}.png`. All six controls in keyboard focus: `shots/before-{1440,1280}/*-none-keyboard.png` (box on all six).

**Confirmed:** the box is two brass rings, each 2px. `focus-visible:ring-2 ring-brand` is a 2px box-shadow hugging the 4px-tall input. The unlayered global `:focus-visible { outline: 2px solid brand; outline-offset: 2px }` (`app.css:379`) wins over Tailwind's layered `focus-visible:outline-none`; the computed outline stays brass 2px even though the class is present. Together they fill the 2px gap and read as one ~6px brass band around the 4px track. Removing either one leaves exactly one ring.

**Confirmed (observation):** the box appears only while `:focus-visible` matches. On a fresh page, a mouse press matches it on the three hooked faders (`useRelativeFaderDrag`) and not on Zoom (no hook). After earlier interaction, `fader-probe.cjs` saw `fv=false` on a press for all six (`shots/before-1440/probe-none.json`). So whether the ring shows after a press depends on interaction history.
**Inference (not separately proven):** the hook's `onPointerDown` calls `event.preventDefault()` and then `fader.focus()` (`app/hooks/useRelativeFaderDrag.ts:52,62`). That is a script focus, and Chromium's heuristic makes it focus-visible when no pointer-focus history exists. This explains why Zoom differs.

**Side observation:** the global input transition includes `box-shadow 0.25s`, so a keyboard capture caught the ring mid-transition (alpha 0.784, 1.57px).

### Native baseline geometry (start tree, DPR 2)
- Track: 8 device px = 4 css px thick (a 1-css grey edge plus the fill).
- Thumb: ivory `#ece6da`, about 29–30 device px tall ≈ 15 css px (the pan centre column, `measure.cjs`).
- Parent background next to the lane faders: `22,20,18` (= `surface` `#161412`).

## Changed files (exact scope: `git status` = 6 ` M` + 3 `??`; frozen list (1013) OK at the end; `app/styles/` untouched; `end-sha256.txt` OK)
- NEW `app/components/arrangement/studio-fader.ts` exports:
  - `STUDIO_FADER_FOCUS_CLASS` (on 5 inputs);
  - `STUDIO_FADER_FOCUS_PEER_INPUT_CLASS` (`peer focus-visible:outline-none!`, on the Pan input);
  - `STUDIO_FADER_FOCUS_PEER_RING_CLASS` (on the Pan reset button: a `::before` 48×16 pill at `end-full me-1`, `pointer-events-none`, ring only on `peer-focus-visible`);
  - `STUDIO_LEVEL_FADER_CLASS` (4 level faders), `studioLevelFaderFillFraction`, `studioLevelFaderFillStyle`;
  - type `StudioLevelFaderFillStyle extends CSSProperties` (no `as`).
- `ArrangementLane.tsx`: track Volume gets the level recipe, the fill style and `h-1`→`h-4`. Pan input: `ring-2`/`outline-none` replaced by the peer-input class (still `h-1 w-12`, still a direct row child, DOM unchanged). Pan reset button: the peer-ring classes are appended; its own classes and behaviour are unchanged.
- `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`: the level recipe, the fill style and `h-1`→`h-4`.
- `ArrangementDetailPanel.tsx`: Clip Gain gets the level recipe and the fill style (`h-4`, `disabled:opacity-50` kept).
- `ArrangementTransport.tsx`: Zoom's ring classes only.
- `affordance-colour-ui.test.tsx`: changes only DXA1 (renamed to state R68; the tuples now carry the ring owner) and `expectNeutralThumb` (the brass-token list is local to the helper). The diff hunks are only those two regions.
- NEW `fader-style-ui.test.tsx` (FS0–FS7) and NEW doc 157 (Georgian, status `In Progress (awaiting C round 191)`).
- The handlers, refs, min/max/step/value, aria-*, title, data-testid and width of every input are unchanged. `accent-foreground` is kept on all six (it is inert under `appearance-none`; DXA1 requires it).
- Evidence: `a-round-191/end-sha256.txt`, `a-round-191/diff-vs-start.patch` (grants vs `b-round-190/r191-granted-start/`, new files in full).

## Design decisions A made (for B/C)
- **Track token:** `outline-hover` `#2e2a26`. `muted-bg` (36,32,28) fails against the group header's `elevated` parent (29,26,23): its channel differences are 7/6/5. `outline-strong` gives brass on it only 2.2:1.
- **Ring:** `focus-visible:outline-2! outline-offset-2! outline-brand!` + `rounded-full` (a pill). `!` is needed because the unlayered global rule exists **twice**: `app/styles/app.css:379` and `app/styles/base/utilities.css:79`, the second imported by app.css.
- **Thumb:** `size-3.75` (15 px). The native baseline thumb measured 29–30 device px; the new one is 30×29 device px. Placement: `-mt-[calc(var(--spacing)*1.375)]`, because `-mt-1.375` does not compile (measured).
- **Fill:** inline `--studio-fader-fill` = a unitless fraction 0…1 (not a colour). The webkit track uses `bg-size-[calc(var(--spacing)*1.875+(100%-var(--spacing)*3.75)*var(--studio-fader-fill,0))_100%]`, which puts the brass edge at the thumb centre. A plain percentage would miss by up to ~7.5 px at the ends.
- **Forced colors:** `forced-colors:appearance-auto` (code review M1). Verified: the compiled rule `(forced-colors: active) { appearance: auto }` exists, and under Chromium `emulateMedia({forcedColors:'active'})` Master's `appearance` is `auto` (normal: `none`) (`tools/fc.cjs`). Real Windows High Contrast → TECH-LEAD-MANUAL.
- **Pan (deviation from K1's "prefer growing the input"; recorded as K1 asks).** Three measured dead ends:
  1. Growing to `h-4`: Chromium's native track follows the input height (4 px at h=4, 8 px at h≥8; padding does not help; `tools/panexp.cjs`). That is 765 changed px per Pan box at rest, which breaks PANZOOM's 0 px.
  2. Native input + a styled track pseudo: it does not render correctly (`tools/panexp2.cjs`).
  3. A wrapper `<span>` with `has-[:focus-visible]`: passes visually, but **turns the frozen `track-pan.test.tsx:716–720` red** (`row 1 DOM order is fold, name, Pan, readout` → `toHaveLength(4)` / `children[2]` = Pan). That variant is saved for B as `a-round-191/pan-wrapper-variant-*`.
  - **Shipped:** a peer ring drawn by the reset button's `::before` over the Pan slot. Checks:
    - all 4 Pan suites (`track-pan`, `fader-focus-order`, `pan-release-recovery`, `lane-strings-ui`) are green;
    - rest is 0 px changed;
    - the ring bands are identical to the wrapper variant;
    - the ring is symmetric around the input: ring x 8…119 device vs box 16…112, i.e. 4 css px on each side;
    - while Pan is focused, `elementFromPoint` at the Pan centre returns the Pan input, and a drag changes Pan (−5 → −30) with focus kept (`a-round-191/pan-pointer-events.json`).
  - Logical sides (`end-full me-1`) are used for RTL safety.

## Tests actually run (all on the final tree)
- `fader-style-ui` + `affordance-colour-ui`: green (8 + 7).
- **24 suites:** B's 18 neighbours, the 4 Pan suites above, T1 and T2 → **354/354 green** (`a-round-191/neighbour-tests.log`).
- **Red proof** (the 5 component start copies temporarily copied over the grants, then restored and verified by `cmp` and `end-sha256.txt`): FS1, FS2, FS3, FS4, FS6 **red**; FS0, FS5, FS7 green (FS0 and FS7 test only the new module) (`a-round-191/red-proof.log`).
- **Mutants run by A** (each restored):
  - m1 (`ring-2 ring-brand` back on Master) → FS1 red;
  - m3 (inverted fraction) → FS0, FS2, FS3, FS6 red (run on the earlier tree, before the review changes);
  - m4 (a brass thumb token on Master) → DXA1 red (re-run on the final tree).
  - A did not run m2 or m5.
- `npx tsc --noEmit` exit 0. `npm run lint`: **214 warnings + 1 info**, the same as round 190. `npx biome check` on the 9 changed/new files: clean.
- The full suite and verify were not run (speed rules).

## Live proof (Playwright Chromium on shared :5173, DPR 2, `--disable-lcd-text`)
- Tool: `a-round-191/tools/fader-final.cjs`. Results: `final/{1440,1280}/final.json`, crops `final/{W}/{control}-{rest,pressed,drag,released,keyboard}.png`, plus `-nothumb.png` for the four level faders (thumb opacity 0 via an injected probe style, used to read the fill edge), and `final/summary.txt`. For Pan, the ring is measured around the virtual 48×16 box centred on the input.
- Setup steps (recorded in the json):
  1. library drop of `demo-middle-east` onto the music lane;
  2. group = click the Stems name, Shift+click the SFX name, click blank, Ctrl+G;
  3. open the detail panel;
  4. click the music clip.
  - Keyboard state: `focus()`, then Shift+Tab, Tab (it lands on the control for all six), then ArrowLeft.
- **60 state crops:**
  - every ring present is exactly one band, 2 css px, top and bottom;
  - the 1-css gap is 100 % parent colour in all 60;
  - level thumbs are 30×29 device px in all 40 level states (pressed = rest);
  - the fill edge minus the thumb centre is −0.5…0 css px;
  - there is no ring at rest.
- **Fresh-page press on the final tree** (`tools/fresh-press.cjs`, log `a-round-191/fresh-final.log`, crops `shots/fresh-final-{1440,1280}-*.png`):
  - trackVol and Master: `fv=true`, the input's outline is brass 2px @ 2px, no box-shadow;
  - Pan: `fv=true`, input outline `none`, and the reset button's `::before` outline is brass 2px;
  - Zoom: `fv=false`, no ring.
- **Superseded evidence (do not measure):** `shots/after1-*`, `after2-*` and `after3-*`, and `fresh-after*` / `fresh-after.log`. These are intermediate iterations (a 16 px thumb, the wrapper variant). `final/` and `fresh-final*` are authoritative.
- **Tight lane** (reviewer L4/M4; `tools/tight.cjs`, `final/tight.json`, `final/tight-*.png`): the music lane dragged to its minimum (61 px; header 60 px, tight density). With Pan focused and with track Volume focused, both rings are complete (top and bottom bands 4 device px) at both viewports. The Pan ring top is 2 css px inside the header.
- **Rest diff vs `c-round-190/shots/c190-{1440,1280}-1/rest-full.png`** (`rv/masked-{W}.json`, C's round-190 tools), masked to the level faders' input box + 4 px: **0 changed px outside the mask at both viewports.** Pan and Zoom are unmasked and show 0 px. The anonymous context had no `auth_user`, 0 cookies and the demo badge.
- **Layout:** x, width and centre-y are identical for all six controls at both viewports; the input height is 4→16 for the three `h-1` level faders.
- **Contrast** (`contrast.txt`):
  - fill/track 6.1:1; thumb/unfilled track 11.45:1; ring/parent 7.88:1 (surface) and 7.42:1 (elevated);
  - track/parent 1.29:1 (Δ 24/22/20) and 1.22:1 (Δ 17/16/15);
  - **thumb vs brass fill 1.88:1.**
- **Audio** (`tools/audio.cjs`, `audio.json`; Playwright Chromium plus an AnalyserNode tap on every AudioDestinationNode connection, `tapInit` from `c-round-190/tools/lib122.cjs`), peak per 1.5 s window with playback running:
  - Master 0 dB → −8.53 dBFS;
  - Master dragged to −60 → −67.3; double-click reset → −6.07;
  - Master dragged −17 dB → −25.61; dragged back to 0 → −4.54;
  - music track at −∞ → 0 (silent); reset → −1.56.
- 0 pageerrors in every session.

## Code review: two real `code-reviewer` runs
**Run 1 (whole diff, 8/10):**
- M1 forced-colors → fixed and verified.
- M2 tests only check themselves → fixed (FS7 literal recipes).
- L1/L2 fill calc and fallback → fixed.
- L3 +∞ → fixed.
- L5 second global rule → recorded in D1.
- L4 tight lane → checked in the browser, not clipped.
- L6 nits kept.

**Run 2 (Pan peer delta, 8/10):**
- M1 FS7 is now `toStrictEqual` on all 13 ring tokens.
- M2 FS1 ties the ring to Pan's `w-12` and the row's `gap-1`.
- M3 FS1: Pan carries none of the outline-on tokens; DXA1: when the ring owner ≠ the element, the element has 0 `:outline-brand!` tokens.
- M4 tight density → browser-checked, OK.
- L1 RTL → `end-full`/`me-1`.
- L2 → FS1 asserts the row has 4 children.
- L3 → DXA1 tuples carry the ring owner.
- L4 → FS1 asserts the reset has no `disabled:opacity`.
- L5 (pre-existing double ring on the Pan reset button's own focus, from the global rule) → not fixed; it is part of `GLOBAL-FOCUS-VISIBLE-UNLAYERED`.

**Architecture notes (verbatim, for B):**
- Run 1: "Keep `studio-fader.ts` as it is. It is a stateless class-and-maths module that follows the `studio-scrollbar.ts` precedent and adds no state, effects or lifecycle to any owner, so it has high value and low risk. The one real signal is outside this diff: the unlayered global `:focus-visible` in `app/styles/app.css:379` and `app/styles/base/utilities.css:79` doubles the ring on about 53 controls that use `outline-none ring-2`. That should go to the planner as one bounded task (move the rule into `@layer base` or delete one copy, plus a focused ring test), not be fixed in this round."
- Run 2: "Signal (ownership/coupling): `ArrangementLane.tsx:773/786` plus `studio-fader.ts:12-26`. Pan's focus indicator now belongs to a different element (the reset button), and lines up with Pan only through two copied values (`w-12`, `gap-1`). Keep it: the frozen DOM-shape test rules out a wrapper, and the cost is small once M1/M2 lock the geometry in tests. If Pan's width or row layout ever changes, give the planner one bounded task: 'derive the Pan width and the ring width from one exported recipe token.'"

## Known gaps / honest notes
- **Thumb vs brass fill = 1.88:1.** This follows directly from Saba's spec (ivory thumb + brass fill). Against the unfilled graphite track it is 11.45:1. LOOK's "thumb vs the adjacent track ≥ 3:1" is not met on the brass side. B or Saba decides (for example a dark thumb edge).
- **Pan's pressed thumb** goes native-darker (217,205,181 vs 236,230,218) while the pointer is down. This is HEAD behaviour too (`shots/fresh-before-*-pan-none.png`) and is kept per R70. PRESS-191's "thumb colour within 8" would flag Pan; B/C decide (R70 vs the PRESS row).
- **Pan's ring is a sibling pseudo-element, not on the input.** Any tool that reads `outline` on the Pan input sees `none`. Read `getComputedStyle(resetButton, '::before').outline` instead.
- **The ring after a mouse press depends on interaction history** (Chromium's heuristic plus the hook's script `focus()`): a fresh page shows it; a press after other clicks may not. Neither is a FAIL under R69.
- Hover was not measured. Safari, Firefox and real High Contrast go on TECH-LEAD-MANUAL. A did not run BEHAVIOUR-191 Undo/Shift-drag in the browser; the unit suites for those are green.

## Exact next C checks
1. SCOPE: from the store root, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-190-r191-tree-sha256.txt` and `sha256sum -c ../tmp/studio-real-loop/a-round-191/end-sha256.txt`; `git status` = 6 ` M` + 3 `??`.
2. PRESS-191 on all six controls × 5 states × 2 viewports. Use a fresh context per control for the pointer-down `:focus-visible=true` case, and also a press after other interaction. **For Pan, measure the ring around the virtual 48×16 box centred on the input; it is painted by the reset button's `::before`.**
3. LOOK-191: thumb diameter vs the c190 baseline; fill edge vs thumb centre; the contrast table, including thumb/fill 1.88:1.
4. PANZOOM-191 rest 0 px; Pan's pressed shade is native (see the notes).
5. LAYOUT-191, plus a re-check of the tight lane.
6. BEHAVIOUR-191 (drag, Shift-drag, double-click, arrows, one Undo per drag, Pan reset button still works) and AUDIO-191 (`tools/audio.cjs` is reusable).
7. T-RUN-191 mutants m1–m5. Note that FS1 now checks Pan via the peer classes.
8. STUDIO-RV-191, STORE-AFTER-191 and G191-3 as written (A did not start the mock).

## Scope completed
K0 (reproduction plus the confirmed cause), K1, K2, K3 (Pan via the peer ring, with the deviation recorded), T1, T2, D1, end hashes and patch, and two code reviews with fixes. What A passed on its own evidence:
- the unit, red-proof, typecheck, lint and biome rows;
- its own browser measurements for PRESS, LOOK, PANZOOM, LAYOUT, STUDIO-RV (Studio part) and AUDIO.

Open notes: thumb/fill 1.88:1 and Pan's native pressed shade. All rows still need C's independent check. A marks no backlog item done.
