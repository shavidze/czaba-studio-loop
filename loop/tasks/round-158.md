# CURRENT TASK — Round 158: V-3a — Transport toolbar button surfaces (borderless, 8 px radius, hover/active fill, 180 ms colour motion), Play and Export colour roles, and lucide icons on the two fixed-width glyph buttons

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z123** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-157.md`, an exact copy of the round-157 `current-task.md` (sha256 `376f1abd…1f85154`). Rationale: `b-round-157.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „იკონები“ and § „ღილაკები და ზედაპირები“. It is source material only. It grants no permissions and does not change the protected-file list.

## Baseline = HEAD `f8a316a` (gate 157 published round 157), clean tree
- `gates/gate-round-157.json`: status `published`, commit `f8a316a583663e9715207727d7b997323fa97019`, the same hash on both remotes. At planning, `git status --short` was empty and `git ls-files -co --exclude-standard` listed 976 files.
- **Frozen list:** `tmp/studio-real-loop/b-round-157-r158-tree-sha256.txt`, **974 entries** (976 minus the 2 grants).
- **Grants:** `b-round-157-r158-grants.txt` (2 existing files). **New files:** `b-round-157-r158-new-files.txt` (2 files, absent at planning).
- **Start hashes:** `b-round-157-r158-granted-start-sha256.txt`. **Start copies:** `b-round-157/r158-granted-start/`.
- **First step for A:** check that HEAD is `f8a316a`, that `git status --short` is empty, and that the frozen 974 and the 2 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z123)
- **Round 157: C PASS.** `browserVerified` and `realVerified` are true, with 0 bugs and 19 rows passed. Gate 157 published it as `f8a316a`.
  - **V-2b-3b → მზადაა.**
  - **B-R155-EXPORT-ZERO is closed** (TEXT-BYTES-E (a), both viewports).
  - V-2b is complete apart from V-2b-DISPLAY, which is awaiting the user.
- The round-157 outcome table (`tasks/round-157.md` §7) fixed this round as **V-3a**: B measures V-3 and splits it.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122). Today is 2026-10-25, so it is not due.
  - **User decisions:** I re-checked `user-review/`. Neither `ableton-decisions.md` nor `design-ux-decisions.md` exists.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.

### 0.1 B measurement (planning evidence, not a C row)
- **Tool:** `b-round-157/measure-transport.cjs`, run on the live dev server at `f8a316a`. Output: `b-round-157/measure/transport-{1440,1280}.json`.
- **Rendering:** every transport glyph renders in the local fallback **DejaVu Sans**; CDP `getPlatformFontsForNode` reports Instrument Sans plus DejaVu Sans 1 glyph. So the "old symbol box" depends on the platform.
- **Measured glyph advances:**

| Glyph | Advance | Following space |
|---|---|---|
| ▶ | 10.78 px | 3.02 px |
| ↤, ↶, ↷, ✂, ↻ | 11.73 px | 3.02 px (✂, ↻) |
| ⌫ | 19.8 px | 3.0 px |
| ⇔, ↩ (text-xs) | 10.06 px | 2.02 px (↩) |

- **Consequence:** a 16 px icon plus the existing `gap-1` would move each intrinsic-width button:

| Button | Width change |
|---|---|
| ↤ Back to start | +4.3 px |
| ✂ Split | +5.3 px |
| ⌫ Delete | −2.8 px |
| ↻ Loop | +5.3 px |
| ↩ Zoom | +7.9 px |

  Their neighbours would shift by the same amount. RV-1 is **not** widened for V-3 (D-29z116), so these buttons are not in this round (R2).
- **Fixed-width buttons:** Play/Pause (`w-24`), Zoom to selection (`w-8`), Undo/Redo (`w-28`) and Follow (`w-16`) keep their box whatever the icon is.

### 0.2 B rulings (D-29z123)
- **R1 — V-3 split, without shrinking scope:**

| Stage | Round | Scope |
|---|---|---|
| **V-3a** | this round | `ArrangementTransport.tsx` only. The surfaces of all 12 transport buttons, the Play and Export colour roles, and lucide icons on the two glyph buttons whose box is fixed and whose glyph no test pins: Play/Pause (`w-24`) and Zoom to selection ⇔ (`w-8`). |
| **V-3b** | next | The remaining transport glyphs: ↤, ↶, ↷, ✂, ⌫, ↻, ↩. Undo and Redo are fixed-width, but tests find them by `'↶'`/`'↷'`, so they move together with their tests. |
| **V-3c** | then | Library ▶ ◀ × ▸ ▾, the Lane and GroupHeader fold glyphs (including `before:content`), VideoDock ⤢ ✕, MarkerRow ◀ ▶, the Clip ▶ / ⠿ marks, and the glyphs inside the strings module (`previewPlay`, `previewStop`, `rowPreviewing`, `expandText`, `collapseText`, `deleteButton`/`deleteClipLabel`, `braceHint`). Also the surfaces of the other components' buttons and the 10 px panel radius. The panel radius needs a token in the obsidian block (V-1 narrow-grant precedent). V-3c may be split again by owner. |
| **M1, M3, M4** | after V-3 | As approved. |

- **R2 — Default sizing rule for V-3b's intrinsic-width icons (user-vetoable):**
  - **Default:** each icon fills the old glyph slot, not 16 px: 12 px with `strokeWidth={2}`, 10 px for the text-xs ↩, and 20 px for ⌫. Both give the same visual 1 px line as 16 px with stroke 1.5. Boxes stay within ±1 px, so no M-approval is needed.
  - **User question Q-V3-ICON-SIZE** (in `feature-status.md`): (a) 16 px everywhere, as the spec says, with the shifts measured above (an M-type move that needs approval); (b) the default; (c) fixed per-button widths.
  - V-3b goes ahead with (b) unless Saba answers first. This round does not depend on the answer.
- **R3 — Surfaces (spec § „ღილაკები და ზედაპირები“):**
  - The 1 px border stays and becomes `border-transparent`, so the size does not change.
  - Fill: `bg-foreground/5` at rest, `/8` on hover, `/12` while pressed.
  - Radius: `rounded-sm` (6 px) → `rounded-md` (8 px, `--radius-md`).
  - Colour motion: `motion-safe:` 180 ms on `background-color, color`, with `cubic-bezier(0.2,0.8,0.2,1)`. This follows the existing `motion-safe:transition-[…]` pattern in `ArrangementLane`/`DetailPanel`, so reduced motion means no transition.
  - Hover and active use the `enabled:` variant, so disabled buttons no longer react to hover. Today `hover:border-outline-hover` also fires on disabled buttons.
- **R4 — Colour roles:**
  - **Play:** filled `bg-foreground` with `text-background`, in both the Play and Pause states. Today Pause uses accent, which equals brand in obsidian, so the two states already look the same. State is carried by the icon, the label and `aria-label`.
  - **Play hover/active:** the fill steps to /92 and /88, which mirrors the 8 %/12 % steps. Without this, the base /8 hover would empty the fill and leave dark text on a dark surface.
  - **Export:** brand outline and brand text (`border-brand text-brand`). It is no longer a brand fill.
  - **State cues stay:** Delete with a range, Follow paused, Follow on and Loop on keep their classes.
  - **Loop on** also gets `enabled:hover:bg-accent/20 enabled:active:bg-accent/20`, so the on-state fill survives hover. `cn` = `twMerge` replaces the base hover in the same variant group.
  - All of these are user-vetoable.
- **R5 — Icons:**
  - Import from `lucide-react` directly (`^0.561.0`, already used by auth/chat components). Do not use `~/components/icons`: its `PlayIcon`/`PauseIcon` are custom SVGs, not lucide.
  - Icons: `Play`, `Pause` and `MoveHorizontal`, each with `className="size-4 shrink-0"`, `strokeWidth={1.5}` and `aria-hidden="true"`. They inherit `currentColor`.
  - The labels "Play"/"Pause" stay as visible text in a `<span>`. M1 (icon-only, round) is a separate approved move.
  - `aria-label`s are unchanged.
- **R6 — `studio-theme-obsidian.test.tsx` is not touched** (A-R156 Architecture note: no new source-count table). The new classes are locked by DOM assertions in a new test file.
- **R7 — C-157-N5 triage:** the round-157 demo WAV exports have peak 1.0 with 797 / 4741 full-scale samples. SRW-20 has an overload warning (`arrangement-export-overload`, `formatExportOverloadWarning`), but C did not record whether it rendered.
  - This becomes the open finding **B-R157-EXPORT-PEAK** (triage) and C row OVERLOAD-CHECK on unchanged audio code.
  - It does not block V-3a. If it proves a shipped SRW-20 failure, it is High and is fixed before V-3b.

## 1. What changes (exact; line numbers at `f8a316a`)
| ID | File | Change |
|---|---|---|
| T0 | `app/components/arrangement/ArrangementTransport.tsx` l.1–22 | Add `import { MoveHorizontal, Pause, Play } from 'lucide-react';`, sorted by Biome. |
| T1 | same, l.39–40 `toolButtonClass` | Becomes exactly: `'inline-flex h-8 items-center gap-1 rounded-md border border-transparent bg-foreground/5 px-2.5 text-sm text-foreground motion-safe:transition-[background-color,color] motion-safe:duration-180 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)] enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40'`. This removes `rounded-sm`, `border-outline`, `bg-elevated` and `hover:border-outline-hover`. |
| T2 | same, l.118–129 Play | <ul><li>The class becomes `cn(toolButtonClass, 'w-24 justify-center bg-foreground font-medium text-background enabled:hover:bg-foreground/92 enabled:active:bg-foreground/88')`, with no `isPlaying` branch in the class.</li><li>The children become `<Pause …/><span>Pause</span>` when playing and `<Play …/><span>Play</span>` otherwise (R5).</li><li>`aria-label`, `onClick` and `type` are unchanged.</li></ul> |
| T3 | same, l.208 Loop | The `loop?.enabled` string becomes `'border-accent bg-accent/20 text-accent enabled:hover:bg-accent/20 enabled:active:bg-accent/20'`. The `↻ Loop` text is unchanged. |
| T4 | same, l.256–271 Zoom to selection | The child `⇔` becomes `<MoveHorizontal …/>` (R5). The class, `aria-label`, `aria-keyshortcuts`, `title`, `data-testid` and `disabled` are unchanged. |
| T5 | same, l.310 Export | The class becomes `cn(toolButtonClass, 'border-brand font-medium text-brand')`. The `Export` text and `onKeyDown` are unchanged. |
| — | same | **Everything else is unchanged:** <ul><li>the `↤`, `↶ Undo`, `↷ Redo`, `✂ Split`, `{studioEditStrings.deleteButton}`, `↻ Loop`, `Follow` / `Follow ‖`, `↩ Zoom` and `Fit` children;</li><li>the Delete-range, Follow-on and Follow-paused state classes;</li><li>the widths `w-24`/`w-28`/`w-16`/`w-8`;</li><li>the position readout, the separators, the container, every handler, the focus handoff and the zoom slider.</li></ul> |
| N1 | **new** `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | DOM tests TS1–TS6 (§3). Mount the real `StudioWorkspace` with the harness of an existing test that already toggles Play (`render-budget.test.tsx` or `master-ui.test.tsx`, which stub AudioContext), copying its mocks. Scope queries to the transport toolbar: the ancestor `.flex-wrap` element that contains both `[data-testid="arrangement-position"]` and `[data-testid="arrangement-fit"]`. Do **not** use `closest('div')`, which returns the position readout box. Assert that it holds exactly 12 `button` elements. |
| D1 | `docs/implementation/2026/quarter-IV/127-studio-v2b3b-export-timecodes-font-trim.md` l.4 | Status line → `Completed (C round 157 PASS, gate 157 f8a316a)`. Nothing else changes. |
| D2 | **new** `docs/implementation/2026/quarter-IV/128-studio-v3a-transport-surfaces.md` | Follow `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English:<ul><li>R1–R6;</li><li>the measurement table from §0.1;</li><li>the class before/after;</li><li>Problem → Solution: the base hover would empty the Play and Loop-on fills;</li><li>tests and mutations;</li><li>TODO: V-3b (Q-V3-ICON-SIZE), V-3c, M1/M3/M4.</li></ul>Status `In Progress (awaiting C round 158)`. |

**Tailwind check by A:** `bg-foreground/8`, `/12`, `/92`, `/88` and `duration-180` are bare-value utilities in Tailwind v4.1.
- A confirms that each one generates CSS: grep the dev-server CSS, or read the computed style in jsdom if it is available.
- If one does not generate, use the arbitrary form (`bg-foreground/[0.08]`, `duration-[180ms]`) and report it. **Never** custom CSS or `style=`.

**Not allowed:** a colour token or hex, `app.css`, any other component, `strings.ts`, `package.json`, or any glyph other than ▶ ❚❚ ⇔.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementTransport.tsx` | T0–T5 only |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` (new) | N1 only |
| `docs/implementation/2026/quarter-IV/127-studio-v2b3b-export-timecodes-font-trim.md` | D1 only |
| `docs/implementation/2026/quarter-IV/128-studio-v3a-transport-surfaces.md` (new) | D2 only |

- **Read before editing** (`.claude/rules/read-primitives.md`):
  - `FORWARDREF_COMPONENT.md` (existing component edited);
  - `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
  - `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio file; no audio logic changes);
  - `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md`.
- **Protected:** the diff vs `f8a316a` stays empty for:
  - the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`;
  - shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
  - `strings.ts`, `StudioWorkspace.tsx`, `studio-theme-obsidian.test.tsx` and `studio-lab.tsx`.
- **Not allowed:**
  - any other file;
  - commit, push, stash, install, revert, or `npm run build`.
  - Every lasting edit goes through Edit/Write (C-R120-01).
- **B grep at planning:** tests that query transport controls. They must stay green **unchanged**. The list is `b-round-157-r158-vitest-base.txt` (24 files). Highlights:
  - `self-disabling-focus` finds Undo/Redo/Delete by `'↶'`/`'↷'`/`'⌫'`; those glyphs are unchanged.
  - `grid-snap-ui` l.384 `labels[9]` = `'↩ Zoom'`; unchanged.
  - `render-budget` and `master-ui` use `getByRole('button', { name: 'Play' | 'Pause' })`; the `aria-label` is unchanged.
  - `navigation-strings-ui` and `delete-selection-ui` read `'⌫ Delete'`; unchanged.

  No test reads the Play button's text, `'⇔'` or the Export classes. If any listed test turns red, A stops and reports the file, the line and the assertion. A does not change it.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 24 files in `b-round-157-r158-vitest-base.txt`. Save the list as `a-round-158/vitest-files.txt` (the 24 files plus the new file) and the result as `a-round-158/vitest-baseline.json`.
- **New file N1.** `TOKENS(el)` = `el.className.split(/\s+/)`. The transport buttons are the 12 `button` elements in the transport container.

| Test | Asserts |
|---|---|
| **TS1 (base surface)** | <ul><li>Every one of the 12 buttons has `rounded-md`, `motion-safe:transition-[background-color,color]`, `motion-safe:duration-180`, `motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]` and `enabled:active:bg-*` (some value).</li><li>None has `rounded-sm`, `border-outline`, `bg-elevated` or `hover:border-outline-hover`.</li><li>At S0 (no range, no loop, not playing), the 10 buttons other than Play and Export have `border-transparent`, `bg-foreground/5`, `enabled:hover:bg-foreground/8` and `enabled:active:bg-foreground/12`.</li></ul> |
| **TS2 (Play/Pause)** | <ul><li>Play has `bg-foreground`, `text-background`, `enabled:hover:bg-foreground/92`, `enabled:active:bg-foreground/88` and `border-transparent`.</li><li>It has none of `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `border-brand`, `text-brand` or `border-accent`.</li><li>It has exactly one `svg[aria-hidden="true"]`, `textContent === 'Play'`, no `▶`, and the accessible name `Play`.</li><li>After a click: the accessible name is `Pause`, `textContent === 'Pause'`, there is one aria-hidden svg, no `❚`, and the same tokens.</li></ul> |
| **TS3 (Zoom to selection)** | `[data-testid="arrangement-zoom-range"]` has exactly one aria-hidden svg, `textContent === ''`, no `⇔`, and an `aria-label` equal to `studioViewStrings.zoomToSelectionLabel`. |
| **TS4 (Export)** | `border-brand`, `text-brand` and `font-medium` are present. `bg-brand`, `text-brand-foreground` and `border-transparent` are absent. `textContent === 'Export'`. |
| **TS5 (state fills survive hover)** | <ul><li>With a time selection and the Loop toggled on, the Loop button has `bg-accent/20`, `enabled:hover:bg-accent/20` and `enabled:active:bg-accent/20`, and has neither `enabled:hover:bg-foreground/8` nor `bg-foreground/5`.</li><li>With the range, Delete has `border-accent` and `text-accent`.</li></ul>Reuse the range or Loop setup of an existing test file. If it cannot be reached, stop and report; do not weaken the test. |
| **TS6 (V-3a scope lock)** | The texts are still exactly `'↤'`, `'↶Undo'`, `'↷Redo'`, `'✂ Split'`, `studioEditStrings.deleteButton`, `'↻ Loop'`, `'↩ Zoom'`, `'Fit'` and `'Follow'`. None of those 9 buttons contains an svg. |

- **After the edits:**
  - Run the same 25 files. Everything that passed at baseline still passes, and TS1–TS6 are green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the component and the new test file.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-158/mutations/`):
  - **m151:** in T1, `border-transparent` → `border-outline`. TS1 turns red.
  - **m152:** in T2, replace the Play icon and span with the text `▶ Play`. TS2 turns red.
  - **m153:** in T3, drop `enabled:hover:bg-accent/20`. TS5 turns red.
  - **m154:** in T5, put back `border-brand bg-brand font-medium text-brand-foreground`. TS4 turns red.
- **Code-reviewer: required** (4 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 974 are OK, and the protected diff is empty.
  - `git status --short` = the 2 granted paths ` M` + the 2 new paths `??`, nothing else.
  - Write `a-round-158/end-sha256.txt` (4 paths) and `a-round-158/diff-vs-start.patch` (vs `b-round-157/r158-granted-start/`, plus the two new files in full).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Use both viewports, 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session where a Google Fonts css2/woff2 response is not 200 is invalid (environment). Replace an invalid session at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD).
- **Harness rules:**
  - Make a time selection with a clip-body or lane drag; a ruler drag navigates.
  - Escape does not clear a range; click an empty lane instead (C-157-N3).
  - The idle Export footer button is **Done**; Cancel exists only while rendering (C-157-N4).
- Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T158-TARGETED | Re-run `a-round-158/vitest-files.txt`. The counts equal A's, and TS1–TS6 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `f8a316a`.</li><li>The frozen 974 are OK at start and at end.</li><li>The end hashes equal `a-round-158/end-sha256.txt`.</li><li>`git status` = 2 ` M` + 2 `??` exactly.</li><li>The protected diff vs `f8a316a` is empty (list in §2).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff itself:<ul><li>T0–T5 only.</li><li>`toolButtonClass` is exactly the T1 string.</li><li>The only glyphs removed are ▶, ❚❚ and ⇔.</li><li>No handler, attribute or width changed.</li><li>No hex, no `style=` and no custom CSS.</li><li>Lucide is imported directly.</li><li>Doc 127 changed only its status line.</li><li>Doc 128 follows the template, in Georgian.</li></ul> |
| RV1-V3A | <ul><li>Run `b-round-157/tools/d6.cjs` unchanged (copy it to `c-round-158/tools/` with its 5 helpers; the sha256 must equal `b-round-157/tools-sha256.txt`) for runs 1 and 2 at both viewports.</li><li>Compare S0/S1/S2 with the **B-captured pre-V-3 reference** `b-round-157/out/d6/d6-{1440,1280}-r1.json`. That reference was captured at `f8a316a` on a clean tree; B's own r1-vs-r2 check was 0 px and 0 missing keys in all six states.</li><li>Expected: every key present, and every x/y/w/h within ±1 px (expected 0) in all states, at both viewports. Report the max delta per state.</li><li>Every untouched region doubles as the determinism check. Report r1 vs r2 for C's own runs.</li><li>A missing or added key, or any delta > 1 px, is a finding (Medium if a control moves).</li><li>Root may re-run the reference from `f8a316a`.</li></ul> |
| SURFACE-STYLE | Use computed styles of the 12 transport buttons, both viewports, with real mouse hover and real mousedown.<ul><li>**Precheck:** record `matchMedia('(hover: hover)').matches` per session. Tailwind v4 `hover:` sits inside `@media (hover: hover)`, so `false` makes the session environment-invalid, never a FAIL.</li><li>Background colours are checked against `--color-foreground` (#ECE6DA in obsidian). Chromium may return `color(srgb … / a)` or `oklab(…)`; convert to sRGB plus alpha, with a tolerance of ±0.005 on alpha and ±1 on each 0–255 channel.</li></ul><ul><li>**(a) rest:** `border-top-width` 1px and `border-*-color` transparent (except Export brand and the state cues); background = foreground at 5 %; `border-radius` 8px.</li><li>**(b) hover** on an enabled button: 8 %. **(c) pressed:** 12 %.</li><li>**(d) disabled** (Undo at S0): hover leaves 5 %.</li><li>**(e) Play:** opaque foreground at rest, 92 % on hover, 88 % pressed; text = background colour; same in Pause.</li><li>**(f) Export:** border and text brand (#C9A46A); background 5 %.</li><li>**(g) Loop on:** accent at 20 % at rest, on hover and pressed.</li><li>**(h)** `transition-property` = `background-color, color`, `transition-duration` = `0.18s`, timing = `cubic-bezier(0.2, 0.8, 0.2, 1)`. With `emulateMedia({ reducedMotion: 'reduce' })`, `transition-duration` is `0s` (or there is no transition).</li><li>**(i)** a focus-visible (Tab) ring is still visible as a 2 px brand box-shadow on Play, Export and one plain button.</li></ul>Give one table per viewport. |
| ICON-STYLE | <ul><li>Play, Pause and Zoom to selection each contain one `svg` of 16×16 with `stroke-width` 1.5, `aria-hidden="true"`, and stroke = the button's computed `color`.</li><li>There is no ▶ ❚ ⇔ text in the transport.</li><li>CDP accessible names: `Play` / `Pause` / the zoom-to-selection label, unchanged.</li><li>The other 9 buttons still show their glyph or label text byte-identically (`↤`, `↶Undo`, `↷Redo`, `✂ Split`, `⌫ Delete`, `↻ Loop`, `Follow`, `↩ Zoom`, `Fit`).</li><li>Screenshot the transport at rest, hover and Pause at both viewports.</li></ul> |
| CONTRAST-V3A | <ul><li>At rest and on hover: every enabled transport text ≥ 4.5:1 and every enabled icon ≥ 3:1 on its composited background. Use the round-125 `contrast()` method from d6.cjs plus a pixel sample of Play, Export and Zoom to selection with a range.</li><li>Disabled controls are listed but exempt.</li></ul> |
| FUNC-SMOKE-T | Both viewports:<ul><li>Play 2 s: the playhead moves and the output peak is > 0. Then Pause, and Space toggles.</li><li>With a range: Z and a click on Zoom to selection both zoom to it, and ↩ Zoom goes back.</li><li>Undo after an edit hands focus to Redo when Undo disables (one check).</li><li>Export opens the dialog; Done and Escape close it, and focus returns to Export.</li></ul> |
| OVERLOAD-CHECK (B-R157-EXPORT-PEAK) | At 1440 (plus one 1280 spot), on unchanged audio code, export the 3–5 s range WAV and the project WAV in the demo state used in round 157. For each:<ul><li>whether `[data-testid="arrangement-export-overload"]` rendered, and its exact text;</li><li>from the file: the peak, the count of samples at ±full scale (24-bit ±8388607/−8388608), and the frame count.</li></ul>**Ruling, fixed in advance:**<ul><li>≥ 10 full-scale samples and no warning → finding **C-R158-OVERLOAD, High** (SRW-20 overload warning failed).</li><li>The warning shows, and its count is consistent with the file → B-R157-EXPORT-PEAK closes as info (working as designed: the user controls Master).</li><li>A warning count that does not match the file → Medium.</li></ul> |
| G158-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it): every V-2 row, TEXT-BYTES-E, MONO-STYLE, CSS2-TRIM, FONT-INVENTORY and FONT-FAIL. A new observation about them is a note.
- **Not C rows:** V-2b-DISPLAY, B-R153-PREVIEW-DUR, Q-V3-ICON-SIZE (user questions), and C-R151-2/3 (deferred).
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Button boxes and the 1280 wrap of the right group (y = 81) | RV1-V3A |
| Focus ring visibility on the new fill | SURFACE-STYLE (i) |
| Disabled look (opacity 40 % on a 5 % fill) and hover on disabled | SURFACE-STYLE (d), CONTRAST-V3A (listed) |
| State cues: Delete with a range, Follow paused, Loop on | SURFACE-STYLE (g), TS5, ICON-STYLE |
| Play/Pause accessible name and keyboard toggle | ICON-STYLE, FUNC-SMOKE-T, T158-TARGETED (render-budget, master-ui) |
| Focus handoff Undo → Redo, ↩ Zoom → Fit | FUNC-SMOKE-T, T158-TARGETED (self-disabling-focus) |
| Export entry point and focus return | FUNC-SMOKE-T, T158-TARGETED (export-toolbar-hold-enter, export-dialog-focus-restore) |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Borderless filled buttons, 8 px radius, hover fill, colour motion, lucide icons on Play/Pause and Zoom to selection | None used. Source: the user-approved `visual-direction-a.md` § „იკონები“ and § „ღილაკები და ზედაპირები“. | Not checked. | **Not applicable; CZABA brand decision.** Behaviour, shortcuts and sizes are unchanged. | Requirement: SURFACE-STYLE, ICON-STYLE, RV1-V3A, CONTRAST-V3A. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-158.md`, `a-round-158-result.json`, and `a-round-158/`. That folder holds the vitest JSON and file list, the mutations, end-sha256, the diff patch and the code-reviewer result.
- **C:** `c-round-158.md` and `c-round-158.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the RV1-V3A, SURFACE-STYLE, CONTRAST-V3A and OVERLOAD-CHECK tables. Put tools, out and shots in `c-round-158/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 159 planning)
| Condition | Round 159 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`). Then the row below applies. |
| OVERLOAD-CHECK → C-R158-OVERLOAD (High) or Medium | A bounded SRW-20 overload fix, before V-3b, whatever else passed. |
| C FAIL Critical / High / Medium on a V-3a row | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL Low only | A bounded fix-up of that row if it is in V-3a's own code and cheap; otherwise `deferred_low_polish`, and V-3b goes ahead. |
| C PASS | Root publishes round 158. V-3a → **მზადაა**. Round 159 = **V-3b**: the 7 remaining transport glyphs (↤, ↶, ↷, ✂, ⌫, ↻, ↩) with the R2 default sizing (unless Saba has answered Q-V3-ICON-SIZE). It goes together with the `self-disabling-focus` / `grid-snap-ui` / `navigation-strings-ui` / `delete-selection-ui` glyph queries and the `studioEditStrings.deleteButton` / `deleteClipLabel` values (strings + `strings.test.ts`). |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 158 planning).

## 8. Root notes
- **Gate:** on a C PASS, publish round 158 (4 paths). `app/styles/**`, `root.tsx`, `Modal.tsx`, `Toast.tsx`, `CookieConsent.tsx`, `strings.ts` and `StudioWorkspace.tsx` are unchanged vs `f8a316a`.
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - D-29z123 R3: transport buttons lose their visible frame, gain a faint fill and 8 px corners.
  - D-29z123 R4: Play becomes ivory-filled; Export changes from a brass fill to a brass outline.
  - D-29z123 R2 (V-3b default): icons sized to the old glyph slot instead of 16 px (Q-V3-ICON-SIZE).
- **Frontend-architect checkpoint:**
  - `b-round-157-checkpoint-request.md` re-asks at the V-2b end, as the earlier requests said. It adds one V-2b-3b question, the Export template duplication.
  - `b-round-148-…` and `b-round-155-checkpoint-request.md` are still pending.
  - None of them blocks. Before V-3c adds icon usage across 8 components is the last natural moment.
- **User questions:**
  - New: Q-V3-ICON-SIZE.
  - Unchanged: B-R153-PREVIEW-DUR (a)–(c), V-2b-DISPLAY (a)–(d), C-R151-2.
