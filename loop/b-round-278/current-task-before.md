# Round 278: SYS-5 stage 2 (final). The metronome toggle and the library Preview and Add buttons keep their reason reachable by keyboard, the soft-disabled helper moves to one shared file with a click wrapper, the soft-disabled cursor finally shows `not-allowed`, and the unavailable Delete is named plainly

**Planned by:** B, at the round 277 → 278 planning, 2026-10-30. **Decisions:**
- D-29z624: round 277 closed (C PASS, gate 277 published `42872cf`). SYS-5 stage 1 is **მზადაა**; GATE276-T1, C-R229-01 and GATE229-S1 are closed.
- D-29z625: round 278 = SYS-5 stage 2, the final stage. Its scope is §2.
- D-29z626: the Preview toggle is in scope. `product-designer` and `tech-lead` disagreed; the ruling is in §3.
- D-29z627: A-R276-ARCH-GUARD-IN-HELPER is ruled: one shared wrapper, `guardSoftDisabledClick` (`tech-lead`).
- D-29z628: the metronome keeps mouse focus (variant X, `product-designer`). This is a measured HEAD-equivalence and a narrow exception to C-R276-02.
- D-29z629: A-R276-REVIEW-DELETE-NAME. With no target, Delete's `aria-label` is `Delete`.
- D-29z630: C-R276-01. Every soft-disabled button gets `aria-disabled:cursor-not-allowed!`. The app-wide form stays deferred as B-R276-CURSOR-UNLAYERED-GLOBAL.
- D-29z631: the perf readiness predicate is granted (C-R258-01 class).
- D-29z632: the outcome table of §11.
- D-29z633: the doc grants of §5 (doc 206 is closed, doc 207 is new).

This is a fix-up of a recommendation Saba approved (DUX-R-4(b), `user-review/design-ux-decisions.md`, 2026-10-25). It needs no AGREE note and no YouTube request. The reference section is still written.

**Owner:** A (one implementer). **Verifier:** C. **Grants:** §5 and `b-round-277-r278-grants.txt`. **Frozen list:** `b-round-277-r278-tree-sha256.txt` (every tracked file except the grants).

## Baseline: HEAD `42872cf`, clean tree
`gates/gate-round-277.json` is `published`, commit `42872cf`. At planning, `git status --short` was empty and `git ls-files | wc -l` was 1139.

## 0. Read first
1. `lessons.md`, every role. Especially L4, L23 (the attribute/state-contract clause), L29, L47, L49 and L51.
2. This task.
3. B's sketch: `b-round-277/sketch.diff`.

**Primitives for A:**
- `AGENT_DISCOVERABLE_CODE.md` (a new export file);
- `FORWARDREF_COMPONENT.md`;
- `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`;
- `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`;
- `.claude/prompts/new-test.md` for the new test file.

## 1. What changes, and why
**Metronome.** At HEAD the toggle uses native `disabled` while no BPM is committed [K4], so Tab never reaches it [K14]. Its reason, `Metronome — set a BPM first`, therefore exists only for mouse hover. This is ROOT-R66-L3, the disabled-reason half.

**Add.** On the video track, Add is natively disabled and has **no title in any state** [K6][K14]. This is C-R130-ADD-DISABLED-NO-REASON.

**Preview.** The Preview toggle next to Add has the same native `disabled` and no title [K6].

**Stage-1 leftovers:**
- The soft-disabled transport buttons compute `cursor: pointer` [K14] (C-R276-01). `aria-disabled:cursor-not-allowed` is a layered rule [K2]. It loses to the unlayered `button { cursor:pointer }` in `app.css` l.483 [K8].
- With nothing selected, Delete's `aria-label` still says "Delete — the selected clip; leaves a gap" [K3][K14] (A-R276-REVIEW-DELETE-NAME).
- The soft-disabled helper and seven hand-copied guards are local to `ArrangementTransport.tsx` [K1] (A-R276-ARCH-GUARD-IN-HELPER).

| Button | Unavailable when | Title when unavailable, after | Title when available, after |
|---|---|---|---|
| Metronome | no committed BPM [K4] | `Metronome — set a BPM first` (unchanged) | unchanged |
| Preview | no sound / failed / loading | `Preview — select a sound in the list first` / `Preview — this sound could not load; choose another` / `Preview — wait for the sound to load` | none (unchanged) |
| Add | no sound / failed / loading / active track not audio [K6] | `Add — select a sound in the list first` / `Add — this sound could not load; choose another` / `Add — wait for the sound to load` / `Add — make an audio track active first` | `Add to the active track at the insert marker` |
| Delete | no range and no selected clip | unchanged | unchanged; `aria-label` `Delete` when there is no target (range → range hint, clip → `deleteClipLabel`, unchanged) |

**Title precedence.** The order follows the refusal order in `addSourceToActiveTrack` [K7]: no source, then error, then not ready, then not audio. So a title can never contradict the status text the same action writes from the keyboard path. Accessible names do not change (`Add`, `Preview`/`Stop`, `Metronome`). The reasons live in `title` only, which the AX tree exposes as the description.

## Reference: how others do it
| Point | Source | What it shows | CZABA |
|---|---|---|---|
| Unavailable toolbar controls stay focusable | WAI-ARIA APG, "Developing a Keyboard Interface" → "Focusability of disabled controls" (https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/, read 2026-10-30, as in round 276) | `aria-disabled` keeps a control in the Tab sequence; native `disabled` removes it | Same pattern as stage 1 |
| Live's metronome | Ableton Live 12 manual, §19.4 "Recording in Sync" and §19.4.1 "Metronome Settings" (https://www.ableton.com/en/live-manual/12/recording-new-clips/, read 2026-10-30) | "the built-in metronome, which is activated via its Control Bar switch and will begin ticking when the Play button is pressed". The manual never describes the switch as unavailable; Live always has a Set tempo | **Deviation (Saba decision, 2026-10-28, "never invent 120 BPM"):** CZABA has no tempo until one is committed, so the toggle can be unavailable. Its reason is now keyboard-reachable |
| Live: commit a field by clicking away | Live 12 manual §41 "Accessibility and Keyboard Navigation" (read in round 276); no sentence about a click-away commit was found | No reference found. Searched: §19.4, §19.4.1, §41.1–§41.5 as read | Variant X (§2.3) keeps HEAD's own measured behaviour [K15]. It is not presented as Live's |
| Live: unavailable controls and screen readers | No reference found (round 276, LIVE-MEAS-SYS5-DISABLED, open in `user-review/live-checks.md`) | — | Not guessed |

**Deviations:**
- The metronome can be unavailable. This is Saba's decision above.
- Reason titles are the approved DUX-R-4(b) addition.

**No new persistent screen text (L39).** Every reason is a `title`. The quieter homes considered:
- tooltip: chosen;
- the `?` sheet: rejected, because it does not explain the current state;
- the status line: rejected by stage-1 Q1 (no status write on a no-op).

## 2. The contract (D-29z625…D-29z630)
### 2.1 The shared helper (D-29z627, `tech-lead`)
New file `app/components/arrangement/studio-soft-disabled.ts`, a `.ts` sibling of `studio-focus.ts` and `studio-fader.ts`. It exports the stage-1 names and one new wrapper:
- `SoftDisabledButtonProps`;
- `softDisabledButtonProps(isUnavailable)`: unchanged. `{ 'aria-disabled': 'true', onMouseDown: preventDefault }` or `{}`;
- `isSoftDisabledButton(button)`: unchanged;
- **new:** `guardSoftDisabledClick(handler)` returns `(event) => { if (isSoftDisabledButton(event.currentTarget)) return; handler(event); }`.

`preventSoftDisabledMouseFocus` stays private.

`ArrangementTransport.tsx` deletes its local copies [K1] and imports from the new file. Each of its seven `onClick` guards becomes `onClick={guardSoftDisabledClick((event) => { …body unchanged… })}`. The body keeps `armFocusHandoff` first and the action second, so the order is unchanged.

The onClick is **not** folded into `softDisabledButtonProps`, because a later explicit `onClick` prop would silently override it.

B's sketch is byte-exact in `b-round-277/sketch.diff`. A applies it; formatting may differ only where Biome demands.

### 2.2 Library Preview and Add (D-29z626)
- Both use `{...softDisabledButtonProps(…)}`: Preview with `!isReady`, Add with `!canAdd`. Neither has a `disabled` prop.
- Each `onClick` is wrapped in `guardSoftDisabledClick`. A click, Enter or Space on a soft-disabled Preview or Add therefore runs nothing:
  - no preview starts;
  - no clip is added;
  - **no status write**, although `addSourceToActiveTrack` writes a status in each refused branch [K7]. They stay unreachable from the button, as native `disabled` left them.
- Titles follow §1. Two derived constants in the component: `previewUnavailableTitle` (null when ready) and `addTitle`.
- **Class tokens on both:**
  - `enabled:hover:bg-foreground/8` → `not-aria-disabled:hover:bg-foreground/8`;
  - `enabled:active:bg-foreground/12` → `not-aria-disabled:active:bg-foreground/12`;
  - `disabled:cursor-not-allowed` → `aria-disabled:cursor-not-allowed!`;
  - `disabled:opacity-40` → `aria-disabled:*:opacity-40`.

  The children are dimmed, as in stage 1, so the ring keeps full strength. After the change the file has 0 `enabled:` and 0 `disabled:` tokens.
- **Keyboard paths are unchanged (L49).** Enter on a library row, the global Enter and the preview wave's Space/Enter keep their handlers and status texts.

### 2.3 Metronome (D-29z628, variant X)
- `aria-disabled={tempoBpm === null ? 'true' : undefined}`; no `disabled` prop; `onClick={guardSoftDisabledClick(onMetronomeToggle)}`. The label is wrapped in a `<span>`, so `aria-disabled:*:opacity-50` has a child to dim [K4]. The button keeps its own 50 %.
- **No `onMouseDown` preventDefault on this one button.** It is the only soft-disabled button that does not use `softDisabledButtonProps`.
  - **Why:** B measured HEAD [K15]. A user types `120` in the BPM field, does not press Enter, and clicks Metronome. At HEAD the mousedown blurs the field, the tempo commits, the button re-renders as enabled before `click`, and the same click turns the metronome on. The status reads `Metronome is on — 120 BPM, 4/4: …`.
  - The shared pattern (preventDefault) would turn that click into a dead click. The field would keep focus with an uncommitted draft. That is a regression.
  - Variant X keeps HEAD's result. One improvement: on an invalid draft (`abc`), focus lands on the toggle instead of BODY [K15].
  - `product-designer` chose X. The field and the toggle are one tempo unit.
  - This is a narrow exception to C-R276-02 ("keep"), which still holds for every other soft-disabled button.
- Class tokens:
  - `enabled:hover:bg-foreground/8` → `not-aria-disabled:hover:bg-foreground/8`;
  - `enabled:active:bg-foreground/12` → `not-aria-disabled:active:bg-foreground/12`;
  - `hover:text-foreground` → `not-aria-disabled:hover:text-foreground`;
  - drop `disabled:hover:text-muted`;
  - `disabled:cursor-not-allowed` → `aria-disabled:cursor-not-allowed!`;
  - `disabled:opacity-50` → `aria-disabled:*:opacity-50`.

  The on-state `enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20` becomes `not-aria-disabled:hover:bg-foreground/20 not-aria-disabled:active:bg-foreground/20`.
- `aria-pressed` is unchanged. The workspace's `toggleMetronome` still returns early when `tempoBpm === null` [K5]. That return is the second line of defence, which is why the button-level guard has a unit row (§6.2) and a source row, not a workspace mutant (L52).
- There is no metronome keyboard shortcut [K10].

### 2.4 Transport leftovers
- `toolButtonClass`: `aria-disabled:cursor-not-allowed` → `aria-disabled:cursor-not-allowed!` [K2] (D-29z630).
  - `tech-lead` compiled it with Tailwind 4.1.18 to `@layer utilities { [aria-disabled="true"] { cursor: not-allowed !important } }`. A layered `!important` beats the unlayered `button { cursor:pointer }` [K8].
  - B measured it on the sketch: `not-allowed` on soft-disabled Split, Delete, Metronome and Add; `pointer` on Fit [K14].
- Delete's `aria-label` (D-29z629) becomes `rangeDeleteHint ?? (selectedClipId ? studioEditStrings.deleteClipLabel : studioEditStrings.deleteButton)` [K3].
  - With no target, the name is `Delete` and the needs-target sentence stays the description.
  - Rejected (`product-designer`): the sentence as the name, because it is long and voice control says "click Delete"; and dropping the label.

### 2.5 Perf readiness predicate (D-29z631)
Three perf specs wait for `add instanceof HTMLButtonElement && !add.disabled && wave !== null` [K9]. After this round `add.disabled` is always false.
- B measured both forms on the video track: the old predicate is `true` on the sketch, which is vacuous, and the new one is `false` [K14].
- Each of the three lines changes only `!add.disabled` → `add.getAttribute('aria-disabled') !== 'true'`.
- `perf/**` is checked by `npm run typecheck` (L30; Biome does not cover `perf/`).

### 2.6 Side effects of native `disabled` for the three new users (L49)
| Effect | Ruling | Row |
|---|---|---|
| Not focusable | dropped on purpose | B-TAB-2 |
| Click suppressed | kept (wrapper) | SDU2, LPA1, LPA4, B-NOOP-2 |
| `:disabled` CSS variants | moved to `aria-disabled:` / `not-aria-disabled:` | UI11, LPS1, DXG5, V-LOOK-2 |
| AX "unavailable" | kept | B-AX-2 |
| No mouse focus | kept for Preview and Add; **dropped for the metronome** (variant X) | LPA1, UI12, B-VARIANT-X |
| Global press scale `:not([aria-disabled="true"])` | kept (stage 1 already covers `[aria-disabled]` [K8]) | V-PRESS-2 |
| Playwright `click()` actionability | Playwright also waits on `aria-disabled`; probes click soft-disabled buttons with `page.mouse.click` at the box centre | harness note |

### 2.7 Out of scope (recorded, not built)
- The preview wave slider (`aria-disabled={!isReady}` on a `div`) is already focus-correct (`tabIndex -1` when not ready) [K6]: unchanged.
- B-R275-FOCUS-REASON-VISIBLE is revisited now that stage 2 is planned. It stays in `deferred_low_polish` for the polish pass.
- B-R276-CURSOR-UNLAYERED-GLOBAL stays deferred: the natively disabled buttons elsewhere.
- B-R275-SPLIT-HELD-ENTER stays deferred.

## 3. Consults and rulings
- **`product-designer`:**
  - Q-A: wrap the label in a span and dim the child.
  - Q-B: the five Add titles.
  - Q-C: include Preview.
  - Q-D: `Delete` as the no-target name.
  - Q-E: confirmed the cursor `!`.
  - Variant X for the metronome draft click.
- **`tech-lead`:**
  - file and names (§2.1);
  - the wrapper over inline guards;
  - the exact tokens and the compiled `!` rule;
  - the perf predicate;
  - the collisions (all granted, §5).
- **The one disagreement, Preview in or out:** `tech-lead` would keep Preview native this stage. `product-designer` would include it: Preview and Add sit side by side, and Tab would stop on one and skip the other. **Ruling: include** (product-designer decides user-visible trade-offs, policy 2026-10-30). Cost: one more button in the same file, already in B's sketch. Benefit: the shared `LIBRARY_SURFACE_FILL` test constant stays one list instead of splitting.
- **Status writes (note_retro275):** the sketch adds no `setStatus`. Evidence line for ARCH-CHECKPOINT-SYS6-STATUS-TAG: "SYS-5 stage 2 adds no status write; variant X reuses the existing tempo and metronome writes".
- **L51 for variant X:** the existing order is tempo commit (`Tempo 120 BPM …`), then `Metronome is on — …`. The final text is the metronome text, measured at HEAD and on the sketch [K15]. No new write, so no new lifetime.

## 4. Neighbour risk
- **Transport handoff.** The handlers are rewrapped. Covered by FL3–FL10 and SD1–SD7, plus mutant G.
- **Tab order.** It grows by the metronome when there is no BPM, and by Preview/Add while unavailable. Covered by B-TAB-2.
- **Library add from the keyboard.** HA1–HA6 in `held-enter-add` are unchanged. HA5's available-state read gains an `aria-disabled` check.
- **Perf harness ready time.** §2.5 and B-PERF-PREDICATE.
- **Look.**
  - The metronome fill and the Add border and fill are no longer dimmed with the button.
  - B measured ΔE2000 against HEAD on the sketch (`b-round-277/probe/sketch.json`, method `avg()` in `probe/sketch.cjs`): metronome mean 1.57, brightest 1.76, edge 1.57; Add on the video track mean 2.83, brightest 2.31, border 1.88.
  - Boxes are equal: metronome 77×16 px, Add 128×34 px [K14].
  - This is the stage-1 Q3 trade-off and is accepted at ≤ 3.

## 5. Grants (exact; also in `b-round-277-r278-grants.txt`)
| Path | What may change |
|---|---|
| `app/components/arrangement/studio-soft-disabled.ts` | new, §2.1 |
| `app/components/arrangement/ArrangementTransport.tsx` | remove the local helper and the `MouseEvent` import, import the shared one, wrap the seven guards, the cursor `!` token, Delete's `aria-label` (§2.1, §2.4). Nothing else |
| `app/components/arrangement/ArrangementTempoRow.tsx` | the metronome button only (§2.3) + the import |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | the Preview and Add buttons, the two title constants (§2.2) + the import |
| `app/lib/arrangement/strings.ts` | eight keys in `studioLibraryPanelStrings` (§1 texts; names as in the sketch) |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | UI1, UI2, UI6 and UI11 reads/tokens as in the sketch; new UI12–UI14 (§6.2) |
| `app/lib/arrangement/__tests__/mode-toggle-colour-ui.test.tsx` | DXT4 metronome branch and the DXT8 `TEMPO_ROW_PATH` counts, as in the sketch. The round-276 clause "TEMPO_ROW_PATH byte-identical" is **reversed** for this round: the metronome's on-string moves to `not-aria-disabled:` |
| `app/lib/arrangement/__tests__/library-preview.test.tsx` | l.251 as in the sketch; new LPA1–LPA5 (§6.2) |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | `LIBRARY_SURFACE_FILL` and the two `disabled:opacity-40` tokens, as in the sketch |
| `app/lib/arrangement/__tests__/drag-feedback-colour-ui.test.tsx` | the DXG5 Add token, as in the sketch |
| `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx` | SD7's cursor token, as in the sketch; new SD8, SD9 (§6.2) |
| `app/lib/arrangement/__tests__/transport-centre-ui.test.tsx` | TC1's Delete name, as in the sketch |
| `app/lib/arrangement/__tests__/strings.test.ts` | ST49 keys, literals, length 24 → 32, as in the sketch |
| `app/lib/arrangement/__tests__/held-enter-add.test.tsx` | HA5: add `expect(add.hasAttribute('aria-disabled')).toBe(false);` after l.270 [K16]. Nothing else |
| `app/lib/arrangement/__tests__/studio-soft-disabled.test.tsx` | new, §6.2 SDU1–SDU4 (renders plain buttons, no workspace, so the factory rule does not apply) |
| `perf/studio-lab-interactions.perf.spec.ts`, `perf/studio-lab.perf.spec.ts`, `perf/studio-lab-resources.perf.spec.ts` | the one predicate line each (§2.5) |
| `docs/implementation/2026/quarter-IV/206-sys-5-disabled-reasons-stage-1.md` | **l.4** → exactly `**სტატუსი:** Completed (C round 278 PASS)` (L28, final stage); **l.9** `მეორე ეტაპი (277)` → `მეორე ეტაპი (278)`; **l.65** `(რაუნდი 277)` → `(რაუნდი 278)` [K11]. Nothing else |
| `docs/implementation/2026/quarter-IV/207-sys-5-disabled-reasons-stage-2.md` | new [K12]; l.4 exactly `**სტატუსი:** Completed (C round 278 PASS)`; the seven TEMPLATE headings (L26); every cited row id exists |

**Frozen:** the manifest is the authority. It includes `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `shortcuts.ts`, `app.css`, `utilities.css`, `e2e/**`, `package.json`, `package-lock.json`, `fader-style-ui.test.tsx` and `navigation-strings-ui.test.tsx`.

**Protected auth/purchase (never touched):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`.

## 6. Tests
### 6.1 Collisions, pre-applied by B (L23, no assertion lost; equal or stronger)
B applied the whole of §2 plus these test edits on a scratch copy of `42872cf`:
- targeted: 13 files, 181/181 pass (`b-round-277/sketch2-vitest.log`);
- full `npx vitest run`: 220 files, 3294 tests pass (`b-round-277/sketch-full-vitest.log`). The variant-X edit landed during that run, and the four tempo-row files were re-run after it: 38/38;
- `tsc --noEmit` rc 0 (`sketch-tsc.log`); Biome clean on the 5 source and 8 test files (`sketch-biome.log`).

| File | Edit (sketch) |
|---|---|
| `metronome-ui` | UI1/UI2/UI6/UI11: `.disabled` → `aria-disabled` `'true'`/absent, **plus** `hasAttribute('disabled') === false`; the tokens move to the §2.3 set |
| `mode-toggle-colour-ui` | DXT4: metronome on → `TRANSPORT_ON_TOKENS` + `not-aria-disabled:hover:text-foreground`. DXT8: the old on-string count for `TEMPO_ROW_PATH` 1 → 0, plus a new count 1 for the `not-aria-disabled` on-string |
| `library-preview` | l.251 → `aria-disabled` `'true'` + no `disabled` + the exact title `Add — make an audio track active first` |
| `library-row-strings-ui` | `LIBRARY_SURFACE_FILL` → the `not-aria-disabled` pair + `aria-disabled:cursor-not-allowed!`; `disabled:opacity-40` → `aria-disabled:*:opacity-40` (×2) |
| `drag-feedback-colour-ui` | DXG5 Add token → `aria-disabled:*:opacity-40` |
| `self-disabling-focus` | SD7 cursor token → `aria-disabled:cursor-not-allowed!` |
| `transport-centre-ui` | TC1 (no target) Delete name → `Delete`. The old label stays asserted in its clip-selected state in SD4 and NS1 (unchanged files/lines) |
| `strings.test.ts` | ST49 expected object, key list and length 24 → 32 |

**Mutants B ran on the sketch** (each red; logs in `b-round-277/mutant-*.log`; files restored):
- **G:** the wrapper's guard deleted → SD2 and SD2b red;
- **C:** cursor without `!` → SD7 red;
- **D:** Delete label reverted → TC1 red;
- **A:** the video branch returns `addTitle` → library-preview l.251 red;
- **M:** `disabled:opacity-50` back on the metronome → UI11 red.

### 6.2 New rows (A writes; B's sketch does not contain them)
| Row | File | Start → action → expected | Red-proof (mutant) |
|---|---|---|---|
| SDU1 | `studio-soft-disabled.test.tsx` | render `<button {...softDisabledButtonProps(true)}>` → `aria-disabled="true"`, `fireEvent.mouseDown` returns `false`; `(false)` → no `aria-disabled` attribute, mouseDown returns `true` | props always `{}` |
| SDU2 | same | `onClick={guardSoftDisabledClick(spy)}` with `aria-disabled="true"` → click: spy 0 calls; without → 1 call, receiving the event whose `currentTarget` is the button | G |
| SDU3 | same | `isSoftDisabledButton`: `"true"` → true; `"false"` → false; absent → false | compare with `!== null` |
| SDU4 | same | a wrapped button whose `aria-disabled` is removed by a rerender between two clicks → the first click 0 calls, the second 1 (the guard reads the DOM at click time) | guard closes over a prop |
| UI12 | `metronome-ui` | no tempo: `toggle.focus()` makes it `document.activeElement`; its first element child is a `SPAN` with text `Metronome`; `fireEvent.click` → `aria-pressed` `'false'`, status text unchanged, Play schedules no metronome; `fireEvent.mouseDown(toggle)` returns **`true`** (variant X) | TempoRow uses `softDisabledButtonProps` → mouseDown `false` |
| UI13 | `metronome-ui` | variant X in jsdom, browser order: change the field to `120` (no Enter), `fireEvent.mouseDown(toggle)`, `act(() => toggle.focus())` (the field blurs and commits), `fireEvent.click(toggle)` → field `120`, `aria-pressed` `'true'`, no `aria-disabled`, status = `metronomeStatusMessage(120)` | on a scratch copy, `handleTempoBlur` stops committing → red. (A guard deletion stays green because of the workspace no-op [K5], L52. The preventDefault half is proven by UI12 in jsdom and by B-VARIANT-X in the browser) |
| UI14 | `metronome-ui` | same sequence with `abc` → `aria-pressed` `'false'`, `aria-disabled` `'true'`, status = the tempo-invalid text, `document.activeElement` is the toggle (L47: never BODY) | — (records the state) |
| LPA1 | `library-preview` | video track active, sound ready: Add soft-disabled; `fireEvent.mouseDown(add)` returns `false`; click → clip count unchanged **and** `api.current.status` unchanged (an unguarded click writes the video-lane refusal [K7]) | G (status changes) |
| LPA2 | `library-preview` | audio track active, sound ready: Add has no `aria-disabled`, title `Add to the active track at the insert marker`; click → +1 clip | — |
| LPA3 | `library-preview` | the no-sound, loading and failed states: exact Preview and Add titles of §1, both `aria-disabled="true"`. A state that `mountPreview` cannot produce in jsdom is listed in `a-round-278.md` with the reason (the SD5b precedent); C checks the statement against the fixture | title chain reordered |
| LPA4 | `library-preview` | soft-disabled Preview (a not-ready state from LPA3) → click → `libraryPreviewSourceId` stays `null` | G |
| LPA5 | `library-preview` | Add focused while soft-disabled (video track) → `setActiveTrack` to an audio track → `aria-disabled` removed, `document.activeElement` is still Add, a click adds exactly one clip | — |
| SD8 | `self-disabling-focus` | no target: Delete `aria-label` === `studioEditStrings.deleteButton` (`Delete`), title `deleteNeedsTargetTitle`; after `selectClip` → `deleteClipLabel`; with a range → the range hint | D |
| SD9 | `self-disabling-focus` | source scan of `ArrangementTempoRow.tsx` and `ArrangementLibraryPreview.tsx`: 0 `enabled:` tokens, 0 `disabled:` tokens, 0 `(^\|\s)disabled=\{` props; the two library buttons and the metronome render `aria-disabled:cursor-not-allowed!` | C (any file) |

For UI13, the red-proof is not a guard deletion (L52: that one stays green). A uses the honest one stated in the row.

### 6.3 What A runs (speed rules; no full suite)
1. `npm run typecheck` (covers `perf/**`) and `npm run lint`.
2. `npx vitest run` on these files under `app/lib/arrangement/__tests__/`: `studio-soft-disabled`, `metronome-ui`, `mode-toggle-colour-ui`, `library-preview`, `library-row-strings-ui`, `drag-feedback-colour-ui`, `self-disabling-focus`, `transport-centre-ui`, `strings`, `held-enter-add`, `navigation-strings-ui`, `transport-surface-ui`, `tempo-ui`, `waveform-zoom`.
3. Then `code-reviewer` (more than 3 files). Pass its Architecture note to B.

**L31 (timeouts):** at gate 277 the slowest of these files is `drag-feedback-colour-ui`, 7 tests in 6.7 s. `metronome-ui` runs 11 tests in 3.35 s under a 15 s describe timeout. No covering test is near 50 %.

### 6.4 Mutants (A runs each on a scratch copy; C re-runs G and the UI12 variant)
G, C, D, A and M (§6.1), plus the red-proofs of SDU1, SDU3, SDU4, UI12, UI13 and SD9. Report red/green per row.

## 7. B's pre-check (L23, L29, L50)
- **Sweep [SW-A]** (the amended L23 form, every assertion form, roots `app`, `perf`, `e2e`): 49 files.
  - The consumer filter by the buttons' testids, accessible names and accessors leaves 10 files [SW-A].
  - Each is granted (§5) or ruled [K16]. `navigation-strings-ui` l.434 is Loop (stage 1, unchanged). `held-enter-add` l.270 is granted to strengthen. Perf l.230/l.278 (`toBeEnabled`) read a fader and the export primary, so they are an exclusion.
- **Sweep [SW-B]** (old literals and old tokens): 7 hits.
  - **granted:** `self-disabling-focus` l.652, `metronome-ui` l.523/l.524, `transport-centre-ui` l.193;
  - **clip-selected state, unchanged:** `navigation-strings-ui` l.231;
  - **the string's own unit, unchanged:** `strings.test.ts` l.420;
  - **Clip Gain fader, an exclusion:** `fader-style-ui` l.426.
- **Focus origins (L50):** `grep -cE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)'` gives 5 hits each in TempoRow, LibraryPreview and Transport [K13]. Rulings:
  - TempoRow l.141/l.146 (ruler pointer) and l.169/l.197 (ruler render): out of scope, nothing unmounts;
  - TempoRow l.306 (the BPM field `onBlur`): the variant-X path, rows UI13, UI14 and B-VARIANT-X;
  - LibraryPreview l.235/l.238/l.258/l.265/l.314: text and SVG renders, out of scope;
  - Transport l.144 (handoff `.focus()`): FL rows and SD5;
  - Transport l.210/l.234/l.274/l.346: prop spreads and text, out of scope.

  No action in this round unmounts a focused element. LPA5 and B-ADD-ENABLE cover a focused Add that becomes available.
- **Browser baseline at HEAD and on the sketch:**
  - `b-round-277/probe/baseline.cjs` → `baseline.json`;
  - `probe/sketch.cjs` → `sketch.json` (a second dev server on the scratch copy at :5174);
  - `probe/variantx.cjs` → `variantx.json` [K14][K15].

## 8. C rows (Chromium, `/studio-lab`, 1440×900 and 1280×720, fresh anonymous contexts)
Wait for `Demo collection ready` first (L48).
- Click a soft-disabled button with `page.mouse.click` at the box centre. Playwright's `click()` waits forever on `aria-disabled`, as B found.
- Make the video track active with its header button `[data-track-id="video"] [data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]`.
- The status line is `[data-testid="arrangement-status"]`.
- HEAD control values come from `b-round-277/probe/*.json`. A second server at `42872cf` is optional.

**Scope, claims, tests**
| Row | Check |
|---|---|
| SOURCE-SCOPE | `sha256sum -c b-round-277-r278-tree-sha256.txt` rc 0. `git status --short` lists only §5 paths: 3 new (`??`), the rest `M` |
| HUNK-SCOPE | the §5 files differ from `b-round-277/planning-copies/` only as in §2/§6. Source hunks equal `b-round-277/sketch.diff` (formatting aside). Doc 206 changes only l.4, l.9 and l.65, with l.4 byte-exact |
| CLAIMS | `bash ../tmp/studio-real-loop/b-round-277/claims.sh` from `store/` on a scratch copy with the planning copies put back, which must equal `b-round-277/claims-output-at-42872cf.txt`. Plus the L29 sweep over this task |
| SWEEP | re-run SW-A and SW-B on A's tree. Every hit has a §5 grant or a §7 ruling |
| TESTS-TARGETED, TEST-CHANGES, MUTANTS | the §6.3 files pass. No assertion lost (read the diff against §6.1). Re-run G (SD2, SDU2, LPA1 red) and the UI12 mutant (red) |

**Browser behaviour**
| Row | Recipe | Expected |
|---|---|---|
| B-TAB-2 | empty demo (no BPM): Tab from the document start ×140; then make the video track active and Tab to Add. Backward: End, then Shift+Tab | Metronome is a Tab stop with `aria-disabled="true"` and a visible ring (`:focus-visible`, outline ≥ 1 px, brass). Add on the video track is a stop with `aria-disabled="true"`. At HEAD the metronome was never reached [K14] |
| B-AX-2 | CDP `Accessibility.getFullAXTree` on Metronome (no BPM) and Add (video track) | each is a button, `disabled: true`, description = its §1 title, name `Metronome` / `Add` |
| B-NOOP-2 | the metronome is focused (no BPM): Enter. Add on the video track: Tab + Enter, then a mouse click | metronome `aria-pressed` stays `false`, status unchanged. Add: no clip, status unchanged, Undo title unchanged. After the mouse click on Add, `document.activeElement` is the element focused before (the video header button in B's run), not Add, not BODY |
| B-VARIANT-X | empty demo: click the BPM field, type `120` (no Enter), mouse-click Metronome | field `120`; `aria-pressed="true"`; no `aria-disabled`; status = `Metronome is on — 120 BPM, 4/4: a click on every beat, louder on the first beat of each bar. Not included in the export.` (equal to HEAD [K15]). Then with `abc`: status `Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.`, `aria-pressed="false"`, focus on the toggle |
| B-ADD-TITLES | hover 1.5 s: Add on an audio track (a sound selected) → `Add to the active track at the insert marker`; on the video track → `Add — make an audio track active first`. The no-sound/loading/failed titles are jsdom rows (LPA3). C records whether any is reachable in the demo (data only) | native tooltip text = the title |
| B-ADD-ENABLE | video track active, focus Add (Tab), then click the audio track's header button with the mouse, then Shift+Tab back to Add and press Enter | `aria-disabled` absent and the title is the available text; Enter adds exactly one clip |
| B-CURSOR | hover the soft-disabled Split, Delete, Loop, Metronome and Add (video track); control: Fit, and Add on an audio track | computed `cursor` is `not-allowed` on each soft-disabled button and `pointer` on the controls. Closes C-R276-01 |
| B-DELETE-NAME | empty demo; then select a clip; then make a range | AX name `Delete` → `Delete — the selected clip; leaves a gap` → the range hint; the description is the title in each state |
| B-PERF-PREDICATE | on A's tree, evaluate the new perf predicate (§2.5) in the page: on a fresh load poll every 100 ms until `Demo collection ready`; then with the video track active; then with an audio track active | false before Add is available, false on the video track, true on an audio track with the wave drawn. The old predicate is `true` on the video track (vacuous), recorded as data |
| B-HANDOFF-REG | stage-1 B-HANDOFF-DELETE and B-HANDOFF-UNDO, re-run once each at both viewports (the guards were rewrapped) | focus on Undo / Redo as in round 276 |
| STUDIO-SMOKE-278 | the round-277 smoke (play/stop, the playhead moves, live RMS > 0.001, export WAV) | export sha256 equals `1fea093b…f94` (no audio path changed) |

**Look**
| Row | Check |
|---|---|
| V-LOOK-2 | Metronome (no BPM) and Add (video track) at rest, sampled with B's `avg()` method (`b-round-277/probe/sketch.cjs`). Pass: ΔE2000 against HEAD's values in `probe/sketch.json` ≤ 3 for mean, brightest and left-edge-mid. Boxes ±0 px (77×16 and 128×34). This is the measured §4 trade-off |
| V-HOVER-2 | hover the soft-disabled Metronome, Add and Preview (when reachable) | computed `background-color` equals the rest value |
| V-HOVER-ENABLED-2 | hover and press the available Metronome (on and off), Add and Preview | backgrounds equal HEAD's in the same state (data from a HEAD run or a second server) |
| V-PRESS-2 | mousedown and hold on the soft-disabled Add | computed `transform` is `none` |
| V-RING-2 | keyboard-focus Metronome (no BPM) and Add (video track) | the outline is painted at full strength (not dimmed by the child opacity) and ring vs background ≥ 3:1 (measured) |
| SCREEN-BUDGET | persistent text lines outside the timeline, empty demo and demo with a clip, HEAD vs new | equal (L39) |

**Guards and docs**
| Row | Check |
|---|---|
| C-R276-02-KEEP | focus the BPM field and type `9` (no Enter); mouse-click a soft-disabled **transport** button (Split) | the field keeps focus and its draft (the stage-1 keep ruling still holds outside the metronome) |
| G278-AUTH | `/studio-lab` anonymous with the badge "Demo collection — no sign-in required". `/studio/middle-east` signed out shows "Sign in required" with 0 `audio[src]`. `/api/studio-token` with no header → 401, no token |
| DOC-206-207 | doc 206: l.4 byte-exact `**სტატუსი:** Completed (C round 278 PASS)`, l.9 and l.65 say 278, nothing else changed. Doc 207: l.4 byte-exact, the seven TEMPLATE headings in order (L26), every cited row id exists in its test file |
| gate | full vitest, typecheck, build, Biome, `npm run verify`, `test:e2e:smoke`: **gate** rows, not claimed in `passed` |

**Ableton conformance**, separate from the CZABA requirement:
- the APG point: confirmed;
- Live's metronome: never unavailable (§19.4), so CZABA's unavailable state is a listed Saba-decision deviation;
- Live's treatment of unavailable controls: unconfirmed (LIVE-MEAS-SYS5-DISABLED);
- variant X: matches HEAD (measured), and Live's behaviour is unconfirmed.

## 9. Claims (L29). Run `bash ../tmp/studio-real-loop/b-round-277/claims.sh` from `store/` at HEAD `42872cf`
B's output is `b-round-277/claims-output-at-42872cf.txt`.

| Tag | What | Expected |
|---|---|---|
| K1 | the local helper and the guards in `ArrangementTransport.tsx` | definitions at l.60, 64 and 70; guards at l.167, 186, 205, 227, 341, 395 and 416 |
| K2 | `aria-disabled:cursor-not-allowed aria-disabled:*:opacity-40` in Transport | 1 (l.53) |
| K3 | Delete's `aria-label` | l.241, `rangeDeleteHint ?? studioEditStrings.deleteClipLabel` |
| K4 | metronome: `onClick`, the `disabled` prop, the bare label | l.316, l.317 and l.328 |
| K5 | `toggleMetronome` returns on a null tempo | 1 |
| K6 | library: `canAdd` l.111; Preview `disabled` l.307; Add `onClick` l.327; Add `disabled` l.333; the wave slider's `tabIndex={isReady ? 0 : -1}` (its `aria-disabled` is l.244) | as listed |
| K7 | `setStatus(` writes in `addSourceToActiveTrack` l.1625–1651 | 3 |
| K8 | `app.css` `button { cursor:pointer }`; the press-scale selectors with `:not([aria-disabled="true"])` | l.483; app.css l.380–381, utilities.css l.73–74 |
| K9 | perf `!add.disabled` | interactions l.561, resources l.197, studio-lab l.521 |
| K10 | metronome in `shortcuts.ts` | 0 |
| K11 | doc 206 l.4, l.9 (contains `(277)`) and l.65 (`(რაუნდი 277)`) | as listed |
| K12 | last doc in quarter-IV | `206-sys-5-disabled-reasons-stage-1.md` |
| K13 | the L50 grep counts for TempoRow, LibraryPreview and Transport | 5, 5, 5 |
| K14 | browser, HEAD: `probe/baseline.json` and the `head@*` entries of `probe/sketch.json` | **Metronome:** `disabled: true`, not reached by Tab, `cursor: pointer`. **Add:** natively disabled on the video track, `title` empty. **Split/Delete soft-disabled:** `cursor: pointer`. **Delete label:** `Delete — the selected clip; leaves a gap`. **Perf predicate on the video track:** old `false` |
| K15 | browser, HEAD: `probe/variantx.json` `head` | `120` then click: `aria-pressed` `true`, status `Metronome is on — 120 BPM, …`. `abc`: status invalid, focus BODY |
| SW-A | the assertion-form sweep, then the consumer filter | 49 files, then the 10 listed in `claims-output-at-42872cf.txt` |
| SW-B | old literals and tokens | 7 hits (§7) |
| K16 | the sweep-ruled lines | `navigation-strings-ui` l.434 is the Loop `hasAttribute('disabled')` read; `held-enter-add` l.270 is HA5's read; perf l.230 is the fader locator and l.278 the export primary (counts 1, 1) |

## 10. STOP conditions (L11)
- A test outside §5 fails.
- A §6.2 row cannot go red with its stated mutant. Write a STOP; do not drop the row.
- tailwind-merge drops a `not-aria-disabled:` / `aria-disabled:` token in a rendered class.
- A covering test goes above 50 % of its timeout.
- Any change is needed in a frozen file.
- Variant X does not reproduce in jsdom with the §6.2 UI13 order. STOP with the event trace; do not switch the metronome to `softDisabledButtonProps`.

## 11. Outcome, fixed in advance (D-29z632)
| C result | B at the round-279 planning |
|---|---|
| PASS, gate publishes, planning before 2026-11-02 | SYS-5 is **მზადაა**. It closes ROOT-R66-L3 (disabled-reason half; the 16 px target half stays in `deferred_low_polish`), C-R130-ADD-DISABLED-NO-REASON, C-R276-01, C-R276-02 (row kept), A-R276-REVIEW-DELETE-NAME and A-R276-ARCH-GUARD-IN-HELPER. Round 279 = the next STUDIO-PERFORMANCE task (PERF b-ii, per the queue), with the `performance-optimizer` and `tech-lead` consult first |
| PASS, planning on or after 2026-11-02 | REGRESSION round first (the 3-day rule) |
| A behaviour or look row fails at Medium+ | a bounded fix-up of that row, same grants |
| SOURCE-SCOPE fails | stop; root inspects; nothing is published |
| Gate fails | one bounded fix-up with its cause recorded (the round-277 shape) |

## 12. Deliverables
- **A:**
  - the §2/§6 changes and the two docs;
  - `a-round-278.md`: changed files; commands with results; the mutants table; the LPA3 reachability statement; the code-reviewer result and its Architecture note.
- **C:**
  - `c-round-278.md`;
  - `c-round-278.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`);
  - evidence under `c-round-278/`.

## 13. Root notes
- No dependency change, no root request.
- The architecture checkpoint addenda (`b-round-274-checkpoint-addendum.md` and earlier) stand and are non-blocking.
- **SYS-5 feature boundary:** B's request for a bounded checkpoint is in `b-round-277.md` §5. It is optional and non-blocking.
- After C PASS, SYS-5 (stages 1 and 2) is ready for the gate. That is not a release.
