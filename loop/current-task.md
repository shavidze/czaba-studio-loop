# CURRENT TASK — Round 197: SABA-B-4 stage 1 fix-up — marker-flag ring contrast (C-R196-01) and keyboard focus hidden under the sticky timeline strip (C-R196-02); ruling on the 1.5 px width (C-R196-04)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z162** (`backlog.json` → `SABA-B-4` `stage1_fixup_d29z162`, open findings `C-R196-01..05`, `narrow_grants` round 197, `rounds[197]`)

- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug gate, and the policy sections "Retrospective" and **SABA-B-4**. They take precedence over older text. `loop/lessons.md` is still empty.
- **Previous task:** `tasks/round-196.md` is an exact copy of the round-196 `current-task.md` (`cmp` OK). B's reasoning: `b-round-196.md`.
- **Why this round:** C round 196 is a **FAIL** with `browserVerified=true`. 13 rows passed. RING-KEY-196 failed on one Medium, **C-R196-01**. C also found **C-R196-02**, a Medium that already existed and was not caused by round 196. Both concern whether keyboard focus is visible in the Studio, so they are tightly related and the round stays within the three-bug limit (two here). Round 196 §7 row 2 calls for one bounded fix-up ahead of the regression round. The regression is due at the first planning on or after 2026-10-27. Today is 2026-10-26.

## Baseline = HEAD `7339cd5` + the uncommitted round-196 tree
- **Gate:** `gates/gate-round-196.json` is `skipped` (C FAIL), so HEAD is still `7339cd5`. Round 196 left 31 ` M` and 5 `??` in the working tree (`b-round-196/git-status-at-planning.txt`). A builds on top of that tree.
- **On C PASS, root publishes rounds 196 and 197 together, against `7339cd5`.** There is no separate round-197-only diff.
- **Frozen list:** `b-round-196-r197-tree-sha256.txt`, **1023 entries**. That is the 1024 tracked files plus the 5 round-196 untracked files, minus the 6 grants. It hashes the **round-196 tree**. B checked it from the store root: OK.
- **Grants:** `b-round-196-r197-grants.txt` (6 files, each narrow, §2). **New file:** `b-round-196-r197-new-files.txt` (1).
- **Start hashes:** `b-round-196-r197-granted-start-sha256.txt`. **Start copies:** `b-round-196/r197-granted-start/`.
- **A's first step.** Check all four. If anything differs, stop and report.
  1. HEAD is `7339cd5`.
  2. `git status --short` equals `b-round-196/git-status-at-planning.txt`.
  3. `sha256sum -c --quiet ../tmp/studio-real-loop/a-round-196/end-sha256.txt` is OK.
  4. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-196-r197-tree-sha256.txt` and the 6 start hashes are OK. Run both from the store root.

## 0. B's evidence (from the code and C's measurements)
- **C-R196-01, cause:**
  - The marker flag (`ArrangementMarkerRow.tsx` ~l.796) is a rectangular `h-5` `<button>`. It holds a 1 px stem (`absolute left-0 h-full w-px`, brass when selected) and a centred `h-4 rounded-sm border` label pill. The pill spans y 2–18, x from 4 px (`pl-1`).
  - The inset ring (`--focus-offset:-2px`, painted 1 px) lands on the pill's top and bottom border and right next to the stem.
  - A newly added marker is **selected**, so its border is `border-brand`. Ring vs that border: **1.45:1**. The ring is a rectangle; the pill is rounded.
  - A moved the flag to inset in round 196 because the bottom edge of a default (+2 px) ring is covered by the loop strip.
- **C-R196-02, cause:**
  - The timeline scroller (`StudioWorkspace.tsx` ~l.2255, `overflow-auto`) holds the sticky `timelineChromeRef` block (`sticky top-0 z-30`: grid, tempo, markers and loop strips).
  - At 1280×720, with the detail panel open and a group present, the Video lane's header controls sit at y 267–313, under the chrome (marker row y 277–297).
  - The scroller treats them as already visible, so Tab does not scroll them. The ring is fully hidden: 0 changed px, in ref and tree alike.
  - The chrome height is already measured: `refreshTrackLaneLayout` (~l.695-705) reads `timelineChromeRef.current?.offsetHeight` and runs from an existing ResizeObserver (~l.1103).
  - There is no `scrollIntoView` and no `scroll-padding` in the arrangement code today, so nothing existing depends on them.

## 1. What changes (exact)

### Rulings (vetoable by Saba; append them to doc 159 as section "Round 197")
- **R88 — the flag ring is kept off the pill border and the stem.**
  - The marker flag's focus ring must be one of:
  - **Geometry today** (A re-checks it with `getBoundingClientRect` before choosing):
    - The pill has **2 px** of clearance at the top and bottom, and **4 px** on the left (`pl-1`), where the stem fills column x 0–1.
    - It has **0 px** on the right: there is no `pr`, so the pill's right border is the button's right edge.
    - So no offset alone works: −2 px fuses with the pill border, −1 px makes the right ring side the pill's border column, and 0 / +2 px is covered at the bottom by the loop strip.
  - The marker flag's focus ring must be one of:
    - **(a) Ring on the flag's own box (preferred).**
      - Add `pr-1` to the flag button. It is transparent: the box grows 4 px to the right, and there is 0 rest-pixel change.
      - Place the ring at the box's outermost pixel with a per-site constant exported from `studio-focus.ts`. Suggested name `STUDIO_FOCUS_RING_EDGE_CLASS`; expected value `[--focus-offset:-1px]`, but confirm it by measurement.
      - This leaves ≥ 1 px of background between the ring and the pill border on all four sides.
      - The ring may cover the stem column. That is acceptable when both of its neighbours pass contrast (see the C row).
      - The ring must not be covered by the loop strip or clipped on any side. It is still a rectangle.
    - **(b) The button becomes the pill (fallback).**
      - The flag button takes the label's `rounded-sm border` box, and the ring follows the pill's radius.
      - The default +2 px offset is **still covered at the bottom** and paints into the tempo row at the top. An inset offset fuses with the brand border. So (b) needs its own measured offset and has to meet exactly the same row.
      - Because of that, (b) is the larger change.
  - **A picks (a) first.** It moves to (b) only if a measurement shows (a) cannot meet the C row.
  - Under (b):
    - The flag's drag and click hit area must stay at least as large as it is now (the `h-5` strip box). Use a transparent hit wrapper or keep the outer box.
    - `data-testid="arrangement-marker"`, `data-marker-*`, `data-marker-label`, the aria attributes and every handler stay on the same focusable element.
  - **Forbidden:** `group-focus*`, `focus-visible:*` or `ring-*` tokens. SFR2 already denies them; a second recipe is exactly what SABA-B-4 removes.
  - Record the measured offset, or the (b) structure, in `a-round-197.md` and doc 159.
- **R89 — keyboard focus inside the timeline scroller is never hidden under the sticky chrome.**
  - The scroller's `scroll-padding-top` equals the live chrome height.
  - Set it in the existing `refreshTrackLaneLayout` path: `scroller.style.scrollPaddingTop = `${chromeHeight}px``, or the equivalent React-owned style. It updates whenever the chrome height changes (tempo/marker strips shown or hidden, viewport resize), through the same ResizeObserver.
  - The CSS scroll-padding spec makes focus-driven and `scrollIntoView` scrolling treat the padded band as not visible. Do not assume Chromium does this: **A proves it with a live probe** (§3).
  - **Stop rule:** if the probe shows that Tab still leaves a control fully or partly under the chrome after R89, **do not invent a larger mechanism** (no focusin handler, no new scroll code). Revert R89, report the measurement, and B splits C-R196-02 into its own round. R88 still ships alone. Also, at 1440×900 and 1280×720 with **no** keyboard action, the scroller's `scrollTop` and `scrollLeft` after load must equal HEAD's. R89 must not scroll anything by itself.
  - Scope: vertical only. `scroll-padding-left` stays unset. The lane headers are themselves `sticky left-0`, and C found no horizontally hidden focus.
- **R90 — ruling on C-R196-04, no code change.** R83 keeps the **declared** `1.5px`, Saba's value. Firefox and Safari paint 1.5 px; Chromium 143 floors it to a computed and painted `1px` (2 device px at DPR 2).
  - The acceptance is the declared value in source (SFR1, mutant m2 unchanged), plus a **computed `outline-width` of `1px` or `1.5px`** in the browser, with contrast ≥ 3:1.
  - Rejected: `2px`, which is heavier than Saba asked for, and he complained about heaviness. Rewriting the value to `1px`, which would throw away Saba's value in the engines that render it.
  - C-R196-04 closes as ruled. It is not a deferred Low.

### Not in this round (recorded, not scheduled here)
- **C-R196-05** (library separator inset ring reads as a solid bar, Low, vetoable) → `deferred_low_polish`. `ArrangementLibrary.tsx` is frozen this round.
- **C-R196-03** (home product card ring clipped, Low, pre-existing) → an input row for **SABA-B-4 stage 2** (store pages). Not a stand-alone Low.
- C's info items: the playhead top edge, the group-name editor next to its own brass border, and Export WAV's border plus ring. Recorded only.

## 2. A — files you own (everything else is frozen)
- `app/components/arrangement/ArrangementMarkerRow.tsx`: **only** the flag button's class or structure for R88 and its import. Marker behaviour, handlers, strings and other rows are unchanged.
- `app/components/arrangement/StudioWorkspace.tsx`: **only** R89 (the `scrollPaddingTop` assignment in the layout-refresh path, plus at most a small pure helper call). No other line.
- `app/components/arrangement/studio-focus.ts`: may add **one** constant for R88(a).
- `app/lib/arrangement/__tests__/studio-focus-ring.test.ts`:
  - SFR3: update `EXPECTED_INSET_TOTAL` and the K0 list if the flag leaves the inset class.
  - Add **SFR6** (below).
  - No other assertion may be weakened.
- `app/lib/arrangement/__tests__/markers-ui.test.tsx`: only if a flag-class or structure assertion locks the old recipe. Swap it to the new recipe; deletions are not allowed.
- `docs/implementation/2026/quarter-IV/159-saba-b-4-studio-focus-ring.md`: append a Georgian "Round 197" section (R88–R90, the measurements, the rejected alternatives).
- **New:** `app/lib/arrangement/__tests__/focus-reveal-ui.test.tsx`.
- **Pre-authorised extra test edit:** if another `app/lib/arrangement/__tests__/*` file goes red **only** on a marker-flag class or structure token that R88 changes, update it the same way. List it in `a-round-197.md` with the assertion before and after. Any other red frozen test: change your implementation, or stop and report.
- **Read first:** `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `prompts/new-test.md` and `prompts/studio-feature.md`.
- Write `a-round-197/end-sha256.txt` (grants plus new file) and `a-round-197/diff-vs-start.patch` (grants vs `b-round-196/r197-granted-start/`). Use Edit/Write. No commit, no push.

## 3. A — tests and checks (speed rules)
- **SFR6** (in `studio-focus-ring.test.ts`): the marker flag's class string contains no `group-focus`, `focus-visible:`, `ring-` or `outline` token.
  - Under (a), it carries the new edge constant and `pr-1`, and the constant's offset is the measured value.
  - Under (b), the focusable flag element has a `rounded-sm` and `border` and has no inner bordered label.
  - Red on the start copies.
- **`focus-reveal-ui.test.tsx` (new, jsdom):**
  - **FR-a:** render the Studio. Stub `timelineChromeRef`'s `offsetHeight` (e.g. 60, then 84) and fire the ResizeObserver callback through the test's FakeResizeObserver. The scroller's `style.scrollPaddingTop` is `60px` and then `84px`.
  - **FR-b:** a chrome height of 0 gives `0px`, not `NaNpx` or empty.
  - **FR-c:** setting it does not change `scrollTop` or `scrollLeft`.
  - Red on the start copies (FR-a).
  - Reuse an existing FakeResizeObserver pattern from a neighbour suite. Do not create a shared helper this round (ROOT-RECON-GRID-HARNESS is separate).
- **Neighbour suites green:** `studio-focus-ring`, `focus-source`, `markers-ui`, every `marker-*`/`markers-*` suite, `status-announcement-ui`, `track-layout`, the detail-panel suites, and every suite that queries `arrangement-timeline-scroller` (grep them; there are about 10). Then `npm run typecheck`, `npm run lint` (count vs round 196: 214 warnings + 1 info), and `npx biome check` on every changed file (0 errors). Do not run the full suite.
- **Live proof** (Playwright Chromium on :5173, DPR 2, `--disable-lcd-text`; save under `a-round-197/`):
  1. **R88:** first record the flag button and pill rects (the clearances on all four sides). Add a marker (it is selected). Tab to the flag. At 1440 and 1280, sample all four ring sides:
     - ring vs the pixel on its outer side and on its inner side;
     - the gap pixels between the ring and the pill border.
     Repeat with the marker **unselected** (click empty ruler space or select another marker, then re-focus the flag by keyboard). Shots focused and unfocused.
  2. **R89 probe:** C's scene at 1280×720: drop a library clip on Music, Shift-click two track names, Ctrl+G, open the detail panel, select the clip. Tab through to the Video row (fold, name, Your own video, M, S, Volume). For each stop, measure:
     - the element's top vs the chrome's bottom (`getBoundingClientRect`);
     - the ring pixels changed vs unfocused.
     Then Shift+Tab back up through the lanes. Repeat at 1440. Also record the load-time `scrollTop`/`scrollLeft` vs HEAD (`git stash` is **not** allowed: compare against C's round-196 ref numbers or against a start-copy scratch server).
  3. **Rest:** a `/studio-lab` rest shot vs C's round-196 tree rest shot (`c-round-196/shots/rest/`, or C's recipe): changed pixels only inside the marker flag box (none at rest if (a)). 0 console errors.
- **Code review:** 3+ files change, so use the `code-reviewer` subagent. Pass its Architecture note to B verbatim. Fix its Medium+ findings inside the grants.

## 4. C — rows
**Setup:** real Playwright Chromium on the shared :5173, fresh anonymous context, DPR 2, `--disable-lcd-text`, at **1440×900 and 1280×720**.
- **Ref:** the round-196 tree, i.e. a scratch copy of `7339cd5` with A's round-196 files from `a-round-196/end-sha256.txt` (identical to `b-round-196/r197-granted-start/` for the 6 grants), served on a separate port with its own cacheDir. Say how it was built.
- The mock API is not needed.

| Row | What | Pass |
|---|---|---|
| **FLAG-RING-197** (C-R196-01) | Add Marker 1 (selected), Tab to the flag; then the same flag unselected. Both viewports. Sample all four sides. | <ul><li>Exactly one ring, outline only: `box-shadow`, `background-color`, `border-color` and box equal to the unfocused state.</li><li>On every side, selected and unselected, **ring vs its inner neighbour pixel ≥ 3:1 and ring vs its outer neighbour pixel ≥ 3:1**. A ring that covers the stem column passes if both neighbours pass.</li><li>Either at least **1 device px of background** between the ring and the pill border on every side (a), or the ring follows the pill's own radius with no inner bordered pill (b).</li><li>Under (a), the flag box may be 4 px wider (`pr-1`); its label pixels are unchanged.</li><li>No side covered by the loop strip or clipped (four sides present in pixels).</li><li>Under (b), the drag hit area is ≥ the ref box: drag the flag by 1 bar, then click to jump, both still work.</li></ul> |
| **FOCUS-REVEAL-197** (C-R196-02) | C's round-196 rich scene at 1280×720 and 1440×900. Tab forward into the Video row and on to the next lanes; Shift+Tab back up through every lane header control. Also Tab through the default scene. | <ul><li>For **every** stop inside the scroller, the element's top ≥ the chrome's bottom (±0.5 px), and its ring pixels are visible (changed px > 0 on all four sides, or three sides where round 196 already recorded the clip, e.g. the playhead top).</li><li>i69–74 at 1280 are visible.</li><li>Load-time `scrollTop`/`scrollLeft` equal the ref. A mouse click on a lane control does not scroll the scroller vertically.</li></ul> |
| **RING-KEY-197** | Re-run RING-KEY-196 (both scenes, both viewports, reached set and order, per-stop computed styles, the ≥ 20 control-type pixel sample). | <ul><li>The same reached set and order as the ref.</li><li>Every stop has one ring: computed width **`1px` or `1.5px`** (R90), brass at 80 %, offset per the K0 list or the new flag constant.</li><li>Ring ≥ 3:1 on every sampled type, **including the marker flag**.</li><li>No stop is hidden under the chrome.</li></ul> |
| **R90-WIDTH-197** | Served CSS and computed width. | The served `:focus-visible` rule still declares `1.5px`. Computed `outline-width` is `1px` in Chromium 143 (record the engine version). |
| **REST-197** | `/studio-lab` rest at both viewports vs the ref; neighbour boxes. | <ul><li>Changed pixels 0 outside the marker flag box, and inside it 0 under (a). The flag box may be 4 px wider under (a) (`pr-1`, transparent).</li><li>Marker strip, loop strip, lanes and chrome boxes Δ 0.</li><li>Scroller `scrollTop`/`scrollLeft` equal the ref.</li><li>0 console errors.</li></ul> |
| **MARKER-FUNC-197** | Marker behaviour around the changed flag. | <ul><li>Click jumps; double-click jumps and plays.</li><li>Drag moves the marker (snap as before).</li><li>The context menu opens on right-click and on the keyboard shortcut.</li><li>Rename via the menu, delete, prev/next (Ctrl+←/→) and the flag's keyboard handlers all behave as in ref.</li><li>A mouse press on the flag shows no ring (R85).</li></ul> |
| **POINTER-197** | A short re-check of R85 on the flag and on one lane control in the Video row. | No ring after a mouse press. ArrowUp/Tab afterwards shows the ring. |
| **G197-3** | As G196-3. | `/studio-lab` anonymous, workspace and demo badge present. `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`. studio-token with no header → 401; fake Bearer → 403 (mock-backed; if the mock is not running, start it from the loop folder and stop that PID). |
| **SCOPE-197** | <ul><li>Frozen list (1023) at C's start and end.</li><li>A's `end-sha256.txt`.</li><li>`git status`.</li><li>The diff of each grant vs the start copies.</li></ul> | <ul><li>Frozen OK at both ends, except a pre-authorised test A listed. C checks that it only swaps the listed tokens.</li><li>`git status` = the round-196 set + `focus-reveal-ui.test.tsx`; nothing else.</li><li>The StudioWorkspace diff is only R89.</li><li>The MarkerRow diff is only the flag (R88: the constant, `pr-1`, or the (b) structure).</li><li>Test diffs only add SFR6/FR-*, update `EXPECTED_INSET_TOTAL` and the K0 list, or swap the flag tokens.</li><li>Doc 159 has a Georgian Round-197 section.</li></ul> |
| **T-RUN-197** | <ul><li>The new and changed suites on the tree and on a start-copy scratch.</li><li>Mutants on scratch copies: **m9** delete the `scrollPaddingTop` assignment; **m10** put the flag back on `STUDIO_FOCUS_RING_INSET_CLASS` (or, under (b), restore the inner bordered label); **m11** hard-code `scrollPaddingTop` to `0px`; **m12** add `group-focus-visible:outline` to the label.</li><li>Re-run round 196's m2.</li></ul> | <ul><li>The tree is green.</li><li>SFR6 and FR-a are red on the scratch.</li><li>m9 and m11 → FR-a red; m10 and m12 → SFR6 (m12 also SFR2) red.</li><li>m2 → SFR1 red (unchanged).</li></ul> |
| **AN-REVIEW-197** | The diff, the new tests and doc 159. | <ul><li>No `as`, `any` or `@ts-ignore`, and no hex or colour function in `.tsx`.</li><li>No new event listener, focusin handler or `scrollIntoView` (the R89 stop rule).</li><li>Doc in Georgian.</li></ul> |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror, 0 hydration messages, 0 non-font remote requests, 0 Authorization headers. |

**Outcomes written in advance:**
- The flag ring < 3:1 on any side, fused with the pill border or stem, or covered → **FAIL (Medium, C-R196-01)**.
- Any keyboard stop inside the scroller still hidden under the chrome → **FAIL (Medium, C-R196-02)**, unless A invoked the R89 stop rule. In that case FOCUS-REVEAL-197 is `notRun`, with A's measurement as the note. C-R196-02 stays open for its own round, and the round can still PASS on the R88 rows.
- R89 scrolls by itself at load or on a mouse click → regression FAIL (Medium).
- Marker drag, click or menu broken → FAIL (Medium or above).
- New Lows go to `deferred_low_polish`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **SCOPE honesty:** if A stops without implementing, SCOPE-197 is `notRun` with a `scopeNote`.

**Adjacent behaviour that could break, and the check that catches it:**

| Risk | Check |
|---|---|
| Flag drag hit area shrinks, or click/drag/menu break, under (b) | MARKER-FUNC-197, FLAG-RING-197 drag step |
| scroll-padding changes the scroll position at load or on resize | REST-197 scroll position, FR-c |
| scroll-padding pulls the view on a mouse click (pointer focus) | FOCUS-REVEAL-197 click step |
| Inset count drift breaks SFR3 | T-RUN-197, SCOPE-197 |
| Other rings change | RING-KEY-197 |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Keyboard focus ring visibility, sticky-header focus reveal | **None.** The Live 12 manual does not specify keyboard focus rings or browser focus scrolling. | Nothing. | Saba's SABA-B-4 request; WCAG 2.4.7 / 2.4.11 / 1.4.11; CSS `scroll-padding`. | Parity **არ ეხება**. Do not claim "Ableton does the same". |

## 6. Evidence and reporting
- **A:** `a-round-197.md` and `a-round-197/`.
- **C:** `c-round-197.md`, `c-round-197.json` and `c-round-197/`.
- Write them as you go.

## 7. Outcome, fixed in advance
| Condition | Round 198 |
|---|---|
| **C PASS** (`browserVerified=true`) | <ul><li>Root publishes rounds 196 + 197 against `7339cd5`.</li><li>SABA-B-4 stage 1 → **მზადაა**. C-R196-01, and C-R196-02 (unless split out), are closed. So are the round-196 `closes_on_stage1_pass` ids.</li><li>Round 198 is the **REGRESSION round** (planning on or after 2026-10-27). It includes SABA-B-4 stage 1.</li><li>Then SABA-B-4 stage 2 (store pages, with C-R196-03 as an input), then STORE-2b. RETRO at round 200.</li></ul> |
| PASS with the R89 stop rule invoked | Publish. C-R196-02 gets its own bounded round right after the regression round. |
| **C FAIL** | One more bounded fix-up only if it is Medium+ in this round's rows. Otherwise the regression round. |
| A browser row that could run here did not run | `browserVerified=false`; not done; B re-plans the browser half. |

## 8. Root notes
- **Gate on C PASS:** rounds 196 + 197 against `7339cd5`: ≤ 34 modified + 6 new files.
- **For Saba (vetoable, non-blocking):** R88 (the flag ring placement), R89 (focus reveal through scroll-padding), R90 (1.5 px declared, 1 px painted in Chromium). R83–R87 are still pending his veto as well.
- **Architecture signals kept (not scheduled):** A-R196 reviewer Signal 4 (move the R85 mount out of `StudioWorkspace` at the stage-2 store-mount decision; this also fixes the unconditional-cleanup Low). Signal 2 (`--focus-offset` is a shared string between `studio-focus.ts` and `app.css`, locked by SFR1/SFR3). Signal 3 → `ARCH-R193-THEME-REGION`.
- **`agent-workflow.md` drift:** it still lacks the policy sections from SABA-B-3 onward. B follows `policy.local.md`; root may sync the file.
