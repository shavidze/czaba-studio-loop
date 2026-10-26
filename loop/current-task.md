# CURRENT TASK — Round 196: SABA-B-4 stage 1 (Studio) — one thin focus ring, no ring after a mouse press, one slider thumb

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z161** (`backlog.json` → open finding `SABA-B-4`, `narrow_grants` round 196, `rounds[196]`)

- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, and policy sections "Retrospective" and **SABA-B-4** (Saba, 2026-10-26). They take precedence over older text. `loop/lessons.md` is still empty; the first RETRO (round 200) fills it.
- **Previous task:** `tasks/round-195.md` is an exact copy of the round-195 `current-task.md` (checked with `cmp`). B's reasoning for this round is in `b-round-195.md`.
- **Why this round:**
  - Round 195 C PASS (`browserVerified=true`). Gate 195 published **`7339cd5`** (rounds 193–195). STORE-2a is done.
  - Saba (2026-10-26) reported **SABA-B-4**: a focused Pan slider shows a thick brass pill with a wide gap, and the slider thumbs differ (Pan pure white and large, Volume cream). Then he widened it: "fix it everywhere, it is not only here". Policy: fix it **next, ahead of the remaining STORE stages**, in at most 2 rounds — **Studio first (this round)**, store pages second. This supersedes the round-195 §7 line "otherwise round 196 is STORE-2b".
  - Severity **Medium** (Saba saw it himself, same rule as SABA-B-3).
  - The regression round is due at the first planning **on or after 2026-10-27**. Today is 2026-10-26, so this is not it.

## 0. B's evidence (read-only; you can re-run it)
- **Root cause of the "heavy" ring (confirmed by `GLOBAL-FOCUS-VISIBLE-UNLAYERED`, b-round-190 fader probe):** `app/styles/app.css:379` and `app/styles/base/utilities.css:79` both declare an **unlayered** `:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }`. Tailwind v4 utilities live in `@layer utilities`, so the unlayered rule beats every `focus-visible:outline-none`. About 50 Studio controls therefore draw **two bands**: the global 2 px offset outline plus their own `focus-visible:ring-2 ring-brand` box-shadow.
- **The pill in Saba's shot** is `STUDIO_FADER_FOCUS_PEER_RING_CLASS` (`studio-fader.ts:12-26`): the Pan **reset button's** `::before`, `w-12 h-4 rounded-full`, outline 2 px, offset 2 px, around a 4 px-high Pan input (`ArrangementLane.tsx:773`).
- **Thumbs:** level faders use `STUDIO_LEVEL_FADER_CLASS` (15 px `size-3.75`, `bg-foreground` #ECE6DA). Pan (`ArrangementLane.tsx:773`) and Zoom (`ArrangementTransport.tsx:274`) use the native `accent-foreground` thumb (white, larger).
- **Mouse press:** Chromium matches `:focus-visible` on a mouse press for range inputs and selects (SABA-B-3 probe; `C-R177-WZOOM-FOCUS-ON-PRESS`). Overview calls `.focus()` on pointerdown (`C-R173-N1`). Pure CSS cannot meet "never after a mouse press".
- **Inventory:** `node ../tmp/studio-real-loop/b-round-195/tools/focus-inventory.mjs app` (output `b-round-195/out/focus-inventory.json`; per-line Studio list `b-round-195/out/studio-focus-sites.tsv`, 66 lines). Studio: 188 focus/ring/outline tokens in 19 files. Recipes: 30× `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`; ~11 with `ring-inset`; 5× `ring-1`; plus `focus:border-brand` (library search, l.473), `focus-visible:bg-brand` (library separator, l.641), `focus-visible:ring-warning` (clip-gain pending, DetailPanel l.804), `ring-offset-1 ring-offset-surface` (marker flag, MarkerRow l.796), and the `!` outline recipes in `studio-fader.ts`. **Not focus** (do not touch): selection/state rings `ArrangementClip.tsx:826`, `ArrangementLane.tsx:854`, `ArrangementVideoDock.tsx:922`, `ArrangementOverview.tsx:334`.
- **Store dependency (why the global rule stays unlayered this round):** 27 store sites use `focus:outline-none` with no ring of their own; today the unlayered global outline is their only indicator. Moving it into `@layer base` now would leave them without focus. That move belongs to stage 2.
- **Expected ring contrast** (brass at 80 % blended over the surround, computed by B): background 5.66, surface 5.43, elevated 5.20, muted-bg 4.97, outline-hover 4.48. All ≥ 3:1.

## Baseline = HEAD `7339cd5`, clean tree
- `gates/gate-round-195.json` is `published`, commit `7339cd5`. `git status --short` is empty (`b-round-195/git-status-at-planning.txt`).
- **Frozen list:** `b-round-195-r196-tree-sha256.txt`, **990 entries** = 1024 tracked files − 34 grants. B checked it from the store root: OK.
- **Grants:** `b-round-195-r196-grants.txt` (34 existing files, each narrow, §1/§2). **New files:** `b-round-195-r196-new-files.txt` (5).
- **Start hashes:** `b-round-195-r196-granted-start-sha256.txt`. **Start copies:** `b-round-195/r196-granted-start/`.
- **A's first step:** (1) HEAD is `7339cd5`; (2) `git status --short` is empty; (3) `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-195-r196-tree-sha256.txt` and the 34 start hashes are OK, run from the store root. If anything differs, stop and report.
- **Mock API:** only needed for C's store rows. If :5199 is not listening, start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` from the loop folder and stop only that PID at the end.

## 1. What changes (exact)

### Rulings (vetoable by Saba; record them in doc 159)
- **R83 — one shared focus style = the one global rule.** Keep a single **unlayered** `:focus-visible` rule in `app.css` (l.378-382) with exactly:
  `outline: 1.5px solid color-mix(in srgb, var(--color-brand) 80%, transparent); outline-offset: var(--focus-offset, 2px);`
  Delete the duplicate block in `base/utilities.css` (l.77-81, comment included). Studio sites then **drop their own ring recipes**, so the global outline alone draws the ring: an outline, so layout never moves, and it follows the element's own `border-radius`.
  - Rejected: (a) `@layer base` now — the 27 store `focus:outline-none` sites would lose their only indicator (stage 2 does this with the store sweep); (b) an `!important` `@utility focus-ring` — a second mechanism fighting the global rule; (c) a Studio-scoped `[data-studio-theme]` selector — ST6/TH4 lock the marker count in `app.css` at 2.
  - **Known effect, not a FAIL:** store pages get the thinner ring now. Store controls that also carry `focus-visible:ring-2` keep a double band until stage 2.
- **R84 — one variant, inset.** For elements whose parent clips (overflow hidden/scroll: library rows and items, lane/group header controls, the marker strip), export `STUDIO_FOCUS_RING_INSET_CLASS = '[--focus-offset:-2px]'` (the variable name deliberately contains neither `ring` nor `outline`, so it cannot trip SFR2 or INVENTORY) from the new `app/components/arrangement/studio-focus.ts`. Every Studio site that has `ring-inset` today uses this constant. A may move a site between inset and default only with a measured reason: the ring is clipped, or it is not. Record each one in `a-round-196.md`.
- **R85 — no ring after a pointer press.** New `app/lib/focus-source.ts` exports a hook (suggested name `useFocusSourceAttribute`) plus a pure installer for tests:
  - On `document`, in the **capture** phase: `pointerdown` (any pointer type) sets `document.documentElement.dataset.focusSource = 'pointer'`. A `keydown` whose `key` is **not** a modifier only (`Shift`, `Control`, `Alt`, `AltGraph`, `Meta`, `CapsLock`, `Fn`, `OS`) sets `'keyboard'`.
  - Unmount removes both listeners and the attribute. A StrictMode double mount leaves exactly one active pair of listeners.
  - `app.css`, immediately after the R83 rule: `html[data-focus-source="pointer"] :focus-visible { outline: none; }`.
  - Mounted once in `StudioWorkspace` (stage 1). Stage 2 decides the store mount.
  - **Vetoable consequences:** a non-modifier key pressed while a mouse-focused control keeps focus shows the ring. This matches the CSS `:focus-visible` heuristic: arrow keys on a fader after a mouse grab, Space for Play after a mouse fader move, and typing into a clicked text field all show it. Text fields follow the same rule; no exceptions are carved out.
- **R86 — one thumb, one track.** In `studio-fader.ts`:
  - `STUDIO_SLIDER_THUMB_CLASS` (webkit + moz): **14 px** (`size-3.5`), `rounded-full`, `bg-foreground` (#ECE6DA), `border-0`, `appearance-none`. There is **no** hover/active size or colour change, which satisfies "differ only slightly".
  - `STUDIO_SLIDER_TRACK_CLASS`: neutral `h-1 rounded-full bg-outline-hover`.
  - `STUDIO_LEVEL_FADER_CLASS` = track + brass fill + thumb. Recompute the fill and the thumb margin for 14 px: the fill ends at the thumb centre.
  - **Pan and Zoom** use track + thumb with **no brass fill** (R70 kept).
  - All six range inputs (track Volume, Pan, Master, Clip Gain, group Volume, Zoom): `appearance-none bg-transparent rounded-full forced-colors:appearance-auto`, and **one input box height for all six: `h-4` (16 px)**. The five level faders already are `h-4` (round 191, published), so they keep their box; only Pan grows from `h-1` to `h-4`. The ring then sits 1 px (box) + 2 px (offset) = 3 px from the thumb, hugging the control. Widths stay as they are (Pan `w-12`, Zoom `w-20`, Master/Clip Gain `w-24`, group `w-12`, track Volume `flex-1`). Neighbour boxes (row, M/S, readouts, Pan reset) ±1 px (the SABA-B-3 K1_geometry licence).
  - Delete `STUDIO_FADER_FOCUS_CLASS`, `STUDIO_FADER_FOCUS_PEER_INPUT_CLASS`, `STUDIO_FADER_FOCUS_PEER_RING_CLASS` and every `!` focus modifier. The Pan input carries its own ring. The Pan reset button gets the plain shared ring on its own `rounded-md` box. This closes `GATE191-PAN-RESET-DOUBLE-RING` and `ARCH-R191-PAN-RING-COUPLING`.
  - `C-R191-01` (ivory thumb vs brass fill 1.82:1) is **not** closed: the colours stay as Saba approved. It stays `awaiting_user`.
- **R87 — focus never changes fill, border or shadow.**
  - The library separator drops `focus-visible:bg-brand` and uses the ring (default or inset by measurement).
  - The library search drops `focus:border-brand` (closes `C-R169-N1-SEARCH-DOUBLE-RING`).
  - Clip-gain pending drops `focus-visible:ring-warning`; its `border-warning` stays, so the pending state is still visible.
  - The marker flag drops `ring-offset-*`.
  - **One listed exception:** `ArrangementExportDialog.tsx:261` `focusTrapRef` container `focus:outline-none` stays byte-identical. It has no effect today because the unlayered rule wins. C records the dialog-open look; it is out of scope.

### Sites
- **K0 (evidence first, no edits):** re-run the inventory and write `a-round-196/k0-sites.tsv`. One line per focusable Studio site: file:line, element, old recipe, new recipe (`default` / `inset`). **Stop rule:** stop and report only if a focus recipe sits in a file **outside the 18 Studio grants**. B's grep shows none; `ArrangementClip.tsx` has only a selection ring.
- **K1 (CSS):** `app.css` — only the R83 rule body and the one new R85 rule right after it. `base/utilities.css` — only the deleted block. The obsidian block (l.3920+) and everything else stay byte-identical.
- **K2 (Studio sweep):** in the 18 Studio files, remove `focus-visible:outline-none`, `focus-visible:ring-*`, `focus-visible:ring-offset-*`, `focus-visible:bg-*`, `focus:border-brand` **and `focus:outline-none` on the library search field (`ArrangementLibrary.tsx:473`)**, `peer-focus-visible:*`, and the `!` outline modifiers. Former `ring-inset` sites get `STUDIO_FOCUS_RING_INSET_CLASS`. **Nothing else changes in a class string**, except the R86 range-input classes. A Biome reflow is allowed (`biome format` proves it).
- **K3 (R86):** `studio-fader.ts` constants, and their six consumers in Lane (Pan, Volume), Master, DetailPanel (Clip Gain), GroupHeader, Transport (Zoom).
- **K4 (R85):** `focus-source.ts` and its mount in `StudioWorkspace`.

## 2. A — files you own (everything else is frozen)
- **Source grants (20):** the 18 Studio files and the two CSS files in `b-round-195-r196-grants.txt`, each limited to §1.
- **New (5):** `app/components/arrangement/studio-focus.ts`, `app/lib/focus-source.ts`, `app/lib/__tests__/focus-source.test.tsx`, `app/lib/arrangement/__tests__/studio-focus-ring.test.ts`, `docs/implementation/2026/quarter-IV/159-saba-b-4-studio-focus-ring.md`.
- **Test grants (14):** the listed `__tests__` files. You may **update** an assertion that locks a token this task removes or changes (the focus recipes above, `STUDIO_FADER_FOCUS*`, `size-3.75`, `accent-foreground` on the six inputs, the input heights, the fill calc) **to the new recipe**. Do not delete assertions or tests.
- **Pre-authorised extra test file:** if another `app/lib/arrangement/__tests__/*` file turns red **only** on such a token assertion, update it the same way. List it in `a-round-196.md` with the exact assertion before and after. Any other red frozen test: change your implementation, or stop and report the failing assertion.
- **Read first** (`read-primitives.md`): `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md` (the faders), `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/new-hook.md`, `prompts/new-test.md`, `prompts/studio-feature.md`.
- Write `a-round-196/end-sha256.txt` (the grants plus new files) and `a-round-196/diff-vs-start.patch` (the grants against `b-round-195/r196-granted-start/`). Use Edit/Write for lasting edits. No commit and no push.

## 3. A — tests and checks (speed rules)
- **`studio-focus-ring.test.ts` (new), pure source reads with a walker guard (at least 18 Studio files, the required-file list):**
  - **SFR1:** `app.css` has exactly one top-level `:focus-visible` rule with the R83 declarations and exactly one R85 rule. `base/utilities.css` has no `:focus-visible`. The `data-studio-theme` count in `app.css` stays 2.
  - **SFR2:** Studio sources (`components/arrangement/**`, `routes/studio-lab.tsx`, `lib/arrangement/**`, without `__tests__`) contain **0** of: `focus-visible:ring`, `focus-visible:outline`, `focus-visible:bg-`, `focus-visible:border`, `focus-visible:shadow`, `focus:border`, `focus:ring`, `peer-focus-visible`, `ring-offset`. `focus:outline-none` appears exactly once (the R87 ExportDialog container). Scan whole whitespace/quote/backtick-delimited class tokens with a prefix match (a token whose variant chain contains a listed prefix counts); arbitrary-property tokens `[--…]` are not focus recipes.
  - **SFR3:** every K0 `inset` site carries `STUDIO_FOCUS_RING_INSET_CLASS`. The count of constant uses equals the K0 inset count.
  - **SFR4:** rendered (or constant-level) classes of the six range inputs: thumb `size-3.5` + `bg-foreground`, box `h-4` on all six, no `accent-foreground`. Pan and Zoom have no `from-brand` / `bg-brand` fill.
  - **SFR5:** `studioLevelFaderFillStyle` is unchanged, and the fill calc string uses the 14 px geometry (half = 7 px).
- **`focus-source.test.tsx` (new):**
  - **FS-a:** pointerdown sets `pointer`.
  - **FS-b:** keydown `Tab` (and `ArrowUp`, ` `, `a`) sets `keyboard`.
  - **FS-c:** keydown of each modifier key alone leaves the value unchanged.
  - **FS-d:** unmount removes the attribute, and later events set nothing.
  - **FS-e:** a target handler calling `stopPropagation()` does not block the update (capture phase).
  - **FS-f:** a StrictMode mount gives one listener pair (spy on `addEventListener` / `removeEventListener` counts).
- **Red proof:** run both new files against `b-round-195/r196-granted-start/` (a scratch tree): SFR1, SFR2, SFR4 and SFR5 are red there (SFR5 because the calc string changes; expected). Record the output.
- **Neighbour suites, all green:** the 14 granted tests plus `fader-click`, `fader-guards`, `track-pan`, `pan-release-recovery`, `lane-strings-ui`, `studio-theme-obsidian`, `track-group-mix-ui`, `export-dialog-focus`, `library-*` and `marker-*` UI suites (grep and list them), and `app/lib/__tests__/store-theme-tokens.test.ts`.
- Run `npm run typecheck`. Run `npm run lint` and report the count against round 195's. Run `npx biome check` on every changed file: 0 errors. Do not run the full suite; the gate runs it.
- **Live proof** (Playwright Chromium on :5173, DPR 2, `--disable-lcd-text`, 1440×900), saved under `a-round-196/`:
  - Saba's scene: Tab to the first Pan, then a shot.
  - Mouse press on Pan, Volume and Zoom: shots with no ring.
  - ArrowUp after the press: the ring appears.
  - The six thumbs: centre colour and size.
  - A rest shot vs `c-round-191/shots/c191-1440-1/rest-full.png`: changed pixels only inside the six range-input boxes.
- **Code review:** use the `code-reviewer` subagent (≥ 3 files). Pass its Architecture note to B verbatim. Fix its Medium+ findings within the grants.

## 4. C — rows
**Setup:** real Playwright Chromium on the shared :5173 server, a fresh anonymous context, DPR 2, `--disable-lcd-text`. Studio rows at **1440×900 and 1280×720**; store rows at **1440×900, 1280×720 and 375×812** with the mock on :5199. **Reference:** the `7339cd5` archive served on a separate port with its own cacheDir, or the start copies swapped in. Say which.

| Row | What | Pass |
|---|---|---|
| **INVENTORY-196** | `focus-inventory.mjs app` on the tree; read `a-round-196/k0-sites.tsv`. | The Studio area holds no token from the SFR2 list. The only `focus:outline-none` is the ExportDialog container. Each K0 inset site has the inset class. |
| **RING-KEY-196** | From the top of `/studio-lab`, Tab (then Shift+Tab back) through every focusable; also open the grid menu, marker menu and export dialog and Tab inside them. For each focused element: computed `outline-width`, `outline-color`, `outline-offset`, `box-shadow`, `background-color`, `border-color`, and the box. | The reached set and order equal the ref. **Every** reached element shows exactly one ring: outline 1.5 px, brass at 80 %, offset +2 px (or −2 px on K0 inset sites). `box-shadow`, `background-color` and `border-color` equal the same element unfocused. Box ±0. Pixel check on ≥ 20 elements, one per control type (transport button, Snap, Follow, Env, M, S, track name, fold, Pan, Pan reset, track Volume, group Volume, Master, Clip Gain, Zoom, Waveform Zoom select, BPM field, library search, library row, library item, separator, marker flag, clip, Overview, Export button, export radio, grid-menu item): ring vs the pixel just outside it (inside for inset) **≥ 3:1**; no second band. |
| **POINTER-196** | Mouse press and release on: the six range inputs, the Waveform Zoom select (Escape to close), a transport button, the Overview, a library row, the BPM field. Then press ArrowUp (ArrowRight on Pan) on the pressed fader. Then Shift alone and Alt alone after a mouse press on a fader. Then Tab. | After each mouse press, no ring pixel (computed outline, or pixels ±0 vs the unfocused state). After ArrowUp, the ring appears and the value steps as before. Modifier-only keys show no ring. Tab moves to the next element, which shows the ring. |
| **THUMB-196** | The six thumbs at rest, on hover, and pressed. | Same size **14 ± 0.5 px** and centre colour **#ECE6DA ± 3** for all six (not #FFFFFF). On hover and press, size ≤ 1.1× and colour the same. Pan and Zoom tracks have no brass pixel. On level faders the brass fill ends at the thumb centre ±1 px at min, mid and max. |
| **SABA-SHOT-196** | Saba's scene: keyboard-focused first Pan, at 1440 and 1280, ref vs tree; plus the mouse-pressed Pan on the tree. | The tree ring box = the Pan input box (16 px high, `w-12`) + 2 px per side (±1). There is no pill wider than the input, and no gap > 3 px between the thumb and the ring vertically. The mouse-pressed Pan has no ring. Shots saved side by side. |
| **REST-196** | `/studio-lab` rest vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, no mask; neighbour boxes. | Changed pixels lie **only** inside the union of the six range-input boxes (each grown by 2 px); 0 elsewhere. Lane row, M/S, readouts and Pan reset boxes ±1 px vs ref; the five level-fader input boxes ±0 (they stay `h-4`). 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **FUNC-196** | Neighbour behaviour. | Arrow keys step every fader; a double-click resets; Pan reset puts focus on Pan with no ring (pointer); Space plays and pauses; the export dialog opens with the same initial focus and Tab trap as ref (record the container look); keyboard resize of the library separator works; library search typing and Escape work. |
| **STORE-FOCUS-196** | `/`, `/store`, `/support` (chat open): Tab to 6 controls per page (one nav link, Free Samples, a card link, store search, the newsletter field, a guest-chat field); rest shots at 3 viewports vs ref; client navigation `/studio-lab` → `/`. | Each control shows a visible ring ≥ 3:1 (now 1.5 px); the `focus:outline-none` fields still have a ring. Rest pixels 0 changed and boxes ±0 at 3 viewports. `html` has no `data-focus-source` on store pages, including after leaving `/studio-lab`. Store controls that keep a `ring-2` band next to the outline are a **known effect** (stage 2), info only. |
| **G196-3** | As G195-3. | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge present. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. studio-token with no header → 401; with a fake Bearer → 403 (mock-backed). |
| **SCOPE-196** | Frozen list (990) at C's start and end; A's `end-sha256.txt`; `git status`; `git diff` of each grant against the start copies. | Frozen OK at both ends, except a pre-authorised test file that A listed (C checks that its diff only swaps the listed tokens). `git status` = modified grants (≤ 34) + the 5 new files, nothing else. CSS diff is only R83/R85 and the deleted block. Studio diffs are only the K2/K3 tokens and the R85 mount. Test diffs only update token assertions or add the new files. Doc 159 is in Georgian. |
| **T-RUN-196** | The 2 new suites on the tree and on the start-copy scratch. Mutants on scratch copies: **m1** restore `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand` on one Lane button; **m2** global rule back to `2px`; **m3** remove the modifier filter in `focus-source.ts`; **m4** Pan thumb back to `size-3.75`; **m5** cleanup that keeps the attribute; **m6** a new `focus:border-brand` in a Library field. | Tree green. Scratch: SFR1, SFR2, SFR4 and SFR5 red. m1 and m6 → SFR2 red; m2 → SFR1 red; m3 → FS-c red; m4 → SFR4 red; m5 → FS-d red. |
| **AN-REVIEW-196** | Read the diff, the new tests and doc 159. | No `as`, `any` or `@ts-ignore`. No hex or colour function in `.tsx` (TH3). The listener is in the capture phase and cleans up. Doc 159 in Georgian with R83–R87, the rejected alternatives and the known store effect. |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror; 0 hydration messages; 0 non-font remote requests; 0 Authorization headers from the page. |

**Outcomes written in advance:**
- A Studio focusable with no ring, two bands, or a ring after a pure mouse press → **FAIL (Medium, SABA-B-4)**.
- A ring below 3:1 → FAIL (Medium).
- Thumbs differing in size or colour → FAIL (Medium).
- Any rest pixel change outside the six input boxes, or a neighbour box moving more than 1 px → **regression FAIL (Medium)**.
- A store control that lost its only focus indicator → **FAIL (Medium, a11y regression)**.
- A broken fader, keyboard or export behaviour → FAIL (Medium or above by impact).
- New Lows go to `deferred_low_polish`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **SCOPE row honesty:** if A stops without implementing, SCOPE-196 is `notRun` with a `scopeNote`, never `passed`.

**Adjacent behaviour that could break, and the check that catches it:**

| Risk | Check |
|---|---|
| A store control loses its focus indicator (global rule edited) | STORE-FOCUS-196 |
| An inset ring is clipped, or a default ring is clipped by an overflow parent | RING-KEY-196 pixel row |
| The modality listener swallows or reorders key handling (Space, arrows, shortcuts) | FUNC-196; FS-e |
| Fader geometry: fill misaligned, hit area shrinks, Pan row reflows | THUMB-196, REST-196, `fader-click` / `track-pan` suites |
| The attribute leaks onto store pages | STORE-FOCUS-196 navigation step; FS-d |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Keyboard focus ring, pointer-press ring, slider thumb style | **None.** Live 12's manual does not specify these as Arrangement behaviour. | Nothing. | Saba's 2026-10-26 request (SABA-B-4), WCAG 2.4.7 / 2.4.11 / 1.4.11, CSS `:focus-visible`. | Parity: **არ ეხება**. Do not claim "Ableton does the same". |

## 6. Evidence and reporting
- **A:** `a-round-196.md` and `a-round-196/` (`k0-sites.tsv`, red proof, live proof, review).
- **C:** `c-round-196.md`, `c-round-196.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `notRun` / `gate`) and `c-round-196/`.
- **Both:** write the report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 197 |
|---|---|
| **C PASS** (`browserVerified=true`) | Root publishes round 196 against `7339cd5`. SABA-B-4 stage 1 → **მზადაა**. If planning is on or after 2026-10-27 (expected), round 197 is the **REGRESSION round**, which includes SABA-B-4 stage 1. Then SABA-B-4 **stage 2 (store pages)**: layer the global rule, sweep the 157 store tokens, decide the store mount of R85. Then STORE-2b. RETRO at round 200. |
| **C FAIL** on a 196 row | One bounded fix-up, ahead of the regression round only when it is Medium+ in Studio focus or a11y. |
| A stops at K0 with a site outside the grants | B re-grants. The planning cost is recorded for the RETRO. |
| A browser row that can run here did not run | `browserVerified=false`. SABA-B-4 stage 1 is not done; B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** round 196 against `7339cd5`: ≤ 34 modified + 5 new files.
- **For Saba, vetoable (non-blocking):** R83 (1.5 px brass at 80 %, offset 2), R84 (inset on clipped rows), R85 (keys after a mouse press show the ring; text fields included), R86 (14 px ivory thumb, all six boxes `h-4`, Pan/Zoom without fill), R87 (no border or fill on focus; search loses the brass border).
- **Closes on C PASS:** `SABA-B-4` (Studio half); deferred Lows `C-R169-N1-SEARCH-DOUBLE-RING` and `GATE191-PAN-RESET-DOUBLE-RING`; signals `ARCH-R191-PAN-RING-COUPLING`, `C-R177-WZOOM-FOCUS-ON-PRESS`, `C-R173-N1-OVERVIEW-MOUSE-FOCUS-RING`; `GLOBAL-FOCUS-VISIBLE-UNLAYERED` Studio half (the store half is stage 2).
- **Root question for stage 2 (non-blocking):** R85 on store pages needs a mount that lives on every store route. `root.tsx` is globally forbidden, so either a narrow `root.tsx` grant or a store layout component. B decides at stage-2 planning. Chromium shows no `:focus-visible` on mouse-clicked buttons or links, so the store need is smaller.
- **Checkpoint:** one-line addendum to `b-round-183-checkpoint-request.md`: `app.css` is shared by STORE-2a, SABA-B-4 and STORE-2b/2c (`ARCH-R193-THEME-REGION`). Non-blocking.
- **`agent-workflow.md`** in `docs/technical/studio-real-workspace/` lacks the policy sections from SABA-B-3 onward (Retrospective, SABA-B-4, the three new queue entries). B follows the policy text; root may sync the file.
