# Round 454: STORE-2b-3c-1 — the last live teal leaves the Store CSS: the global player, the card light, the 404 page, the palette selection and the store scrollbar

**Planned by:** B, at the round 453 → 454 planning, 2026-11-11 (`b-round-453.md`).
- The advisor was available and was consulted after orientation, before writing.
- The round-453 task is archived as `tasks/round-453.md` (a byte-identical copy made before this file was rewritten).
- **Baseline:** gate 453 is `published`, commit `db641ec` [K1]. The store tree is at `db641ec` and clean at planning [K2, K12]. (`context/head-sha.txt` still says `ee7cf7c`; the gate file wins.)
- **Regression:** not due (last 2026-11-10, round 425; due on or after 2026-11-13). **Next RETRO:** round 465.

## Why this round
- **Round 453 closed.** C round 453 PASS (C1–C13 + C4b, `browserVerified`/`realVerified` true, 0 bugs). Gate 453 published `db641ec`. STORE-2b-3b is done (D-29z1611).
- **STORE-2b-3c is the next STORE-REDESIGN stage** (spec row STORE-2: "Replace the hardcoded teal … remove … glow"). B split it at this planning (D-29z1612):
  - **2b-3c-1 (this round):** every teal or glow CSS rule that a mounted Store screen still paints.
  - **2b-3c-2 (next):** the test-only `helpers/style-scan.ts` fail-open forms (A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC) and A-R453-REVIEW-L-GS-TEST-GAPS. That round needs a golden test and is kept separate from a restyle.
- **Inventory** (`b-round-453/inv/`). It was rebuilt after the advisor showed the first scan had holes.
  - It covers every tracked `app/**/*.css` file, multi-line selectors, keyframes resolved to the rules that animate them, and every class of a compound selector.
  - Module reachability runs from the routes, `root.tsx` and the entries, and resolves barrels (`reach.py`, 259 of 349 files reachable).
  - Live teal remains in 5 groups, all measured at HEAD in Chromium (`probe/head-1440.json`, `head-1280.json`):

    | Group | What paints teal at HEAD |
    |---|---|
    | Global sticky AudioPlayer (`root.tsx` → `AudioPlayer.tsx`) | artwork glow (rest and hover); play button `0 0 20px`/`40px` teal (rest) and `25px`/`50px` (hover); progress thumb hover `0 0 12px` teal |
    | ProductCard light (home "Latest releases") | `.light-flicker-effect::after` teal radial; `::before` has a teal stop at 40 % |
    | 404 page (`routes/$.tsx`) | grid lines; `.code-4` text glow; `.code-0` outer and inset glow |
    | Ctrl+K palette | selected row background `rgba(19,217,204,.1)` |
    | `.styled-scrollbar` (cart list, cart ConfirmDialog via ui/Modal, frozen legacy ExportDialog) | thumb teal; pixels decode to `15,94,87` (`probe/sb-head-*.json`) |
- **Not live, and not touched in this round:**
  - **Dead (no reachable consumer), for 2b-3d:**
    - the `@theme` teal tokens (`--color-glow-primary`, `--color-video-sync`, `--gradient-primary`, `--gradient-hero`, `--gradient-glow`);
    - `.hover-glow`, `.interactive-card`, `.product-detail-add-to-cart`, `.newsletter-button-large`, `.testimonial-card`, `.track-card-play-button`, `.waveform-bar`, `.track-row-waveform*`, `.loading-brand`, `.piano-key`, `.pack-card-3d`, `.about-image-overlay`, `.value-card`, `.glass-card`, `.premium-card-*`;
    - `glow-pulse` (animates only the dead `.hero-*-dot`) and `playButtonPulse` (only `.is-playing`, which no TSX sets);
    - `.audio-preview-inline-button` and its `audioPlayingPulse`. Every caller passes `variant="overlay"` [K7], so the inline markup never renders.
  - **Frozen legacy Studio:** `.stems-loader-list` (StemsLoadingAnimation, imported only by the protected `studio.$productId.tsx` [K8]) and `slider-thumb-teal` in the read-only `styles/studio.css` and `styles/pages/studio.css`. These stay until the legacy Studio is removed (D-29z1604 precedent).

## What changes (user-visible)
- **Global player:**
  - The artwork keeps its dark drop shadow without the teal halo.
  - The play button has no shadow; hover changes only the fill, brass `#C9A46A` → `#D9B87F` (the round-453 primary-button rule).
  - The progress thumb hover keeps its dark shadow only.
  - Every scale and transition stays as it is (motion belongs to STORE-2c/2d).
- **Card light:**
  - The teal `::after` layer is deleted, along with the `::after` half of its stagger selectors. Those selectors are dead: `light-flicker-stagger` has 0 TSX users [K6].
  - The white `::before` light and its one-shot animation stay. Its 40 % stop becomes neutral ink, `color-mix(in srgb, var(--color-foreground) 6%, transparent)`, so the falloff stays monotonic. The gradient becomes `180deg in srgb`, so the interpolation stays sRGB as at HEAD (B's pixel check: max 1/255 difference, `probe/gradient-interpolation-check.txt`).
  - The stale comment `/* Glow რადიალური ეფექტი */` is deleted.
- **404:**
  - Grid lines are foreground ink at the same 0.03 alpha, via `color-mix(in srgb, var(--color-foreground) 3%, transparent)` (no raw colour literal; `tech-lead` L3).
  - The "4" digits lose their glow.
  - The ring-shaped "0" keeps its 4px brass border without the outer and inset glow. The `pulse404` motion is untouched.
- **Palette:** the selected row becomes `rgba(var(--color-brand-rgb), .12)`, about `#2B251D` on the panel. Title contrast is 12.2:1 (HEAD 12.39).
- **Store scrollbar:** the thumb is `var(--color-outline-strong)` (`#736B60`, about 3.7:1 on the page), and `var(--color-muted)` on WebKit thumb hover. Chromium paints `scrollbar-color` (pixels `115,107,96`).
- **Nothing moves.** Every measured box equals HEAD's.
- **`/studio-lab`:** the computed-style digest equals HEAD at both viewports.

## Reference
- **Spec:**
  - `store-redesign-spec.md` rule 1: one brass accent; teal leaves the store.
  - Row STORE-2: replace the hardcoded teal; remove the glow.
  - Rule 2 (keep-list): untouched here.
- **Direction A** (`direction-decision.md`): Obsidian & Brass, no glow.
- **`product-designer` consult (this planning),** chosen option for each question, with the rejected one:
  - **Q1, player:** drop only the teal layers and keep the dark offset shadows; the play button hover is fill-only. Rejected: a brass shadow ("a brass glow is still a glow").
  - **Q2, card light:** delete `::after`. Rejected: a brass radial (decoration that spends the one accent).
  - The `::before` teal stop was missed by the consult and by B's first inventory; B found it in the sketch browser run (`tealRows: ['cardBefore']`). B chose a neutral ink stop, by the consult's own reasoning (no accent on decoration). This is sketch v2 (v3 adds the `tech-lead` fixes); v1 is in `b-round-453/v1-superseded/`.
  - **Q3, 404:** foreground grid, no digit glow, and the ring keeps only its brass border. Rejected: a brass grid (two accents on one screen).
  - **Q4, palette:** brass at 0.12. Rejected: a neutral surface token (indistinguishable from hover).
    - B measured that hovering a row moves the selection (`selectedIndex` follows the mouse, HEAD and sketch alike), so hover and selected never show together. The combined `:hover, .selected` rule stays as at HEAD.
  - **Q5, scrollbar:** the neutral `outline-strong`, with `muted` on hover. Rejected: brass at 0.4 (about 2.3:1, below 3:1).
- **Ableton:** does not apply (Store marketing UI).

**Deviations:** none from the spec. **Screen budget:** no element is added or moved. One decorative layer (`::after`) is removed.

**Docs warning (A-R453-REVIEW-L-DESIGN-DOCS-STALE, D-29z1611):** `.claude/primitives/DESIGN_TOKENS.md:89` and the design docs still recommend glow and teal. They are stale; STORE-5 updates them. Do not follow them in this round, and do not edit them (`.claude/**` is forbidden).

## Ruling lines (L4)
- **`app/styles/**` is `global_forbidden` [K11].** B grants two files narrowly, with the same precedent as rounds 192, 196, 201, 316, 449 and 453. A may change only the hunks in `sketch-454.patch.txt`:
  - **`app/styles/app.css`:**
    - the 6 player hunks;
    - delete the `.light-flicker-effect::after` block;
    - the 6 stagger selector lines;
    - the `::before` 40 % stop;
    - the `.not-found-grid`, `.code-4` and `.code-0` hunks;
    - the standalone `.command-palette-item.selected` background.
  - **`app/styles/base/utilities.css`:** the `.styled-scrollbar` comment, `scrollbar-color` and the 2 thumb backgrounds.
  - The obsidian block stays byte-identical [K3: `e9afeed85faec382`].
- **Frozen legacy Studio vs the shared `.styled-scrollbar`:** the shared-rule change wins, as round 453 ruled for the shared token. The legacy ExportDialog stem list gets the neutral thumb. No file under `app/components/studio/**` changes. Its signed-in path is not openable in the cloud; the class and the computed value are the same as on the cart rows.
- **Legacy-only CSS is not touched:** `.stems-loader-list` and `slider-thumb-teal`. LT3 and LT5 allow-list them with exact counts.
  - The frozen legacy Studio therefore shows mixed scrollbars until the legacy Studio is removed: the neutral `.styled-scrollbar` in ExportDialog, and the teal `.stems-loader-list` in its loader. This is accepted (`tech-lead` L4).
- **Studio `/studio-lab`:** Studio dialogs drop `styled-scrollbar` (DS2 in `studio-dialog-scrollbar.test.tsx`, which pins only the class name and stays green). The C digest row proves no Studio style moved.
- **Protected `account.downloads.tsx` renders ProductCard** (K6 lists every consumer). The card-light change reaches it through CSS only; that file does not change.
- **Motion is not this round's:** the play `scale(1.08)`, artwork `scale(1.03)`, thumb `scale(1.3)`, card hover scale and `pulse404` belong to STORE-2c/2d.
- **No third CSS parser.**
  - LT1/LT2 pin exact block literals plus each pinned header's line count, the same strength as ST5.
  - LT3 uses the helper's `countTealHits` per file. LT5 keys each teal line to its enclosing top-level header line (a line scan, not a rule parser).
  - LT6 uses two local regexes (teal token reads and alpha-suffixed teal hex) and leaves the shared helper unchanged.
  - Consolidating the parsers, and fixing the helper's own fail-open forms, is 2b-3c-2's question (SIG-R453-CSSRULEBODIES).
- **Test pins (L23):** K14 lists the one other test that names a changed selector, `studio-dialog-scrollbar.test.tsx` (class presence only). It is in the covering set. No assertion is removed anywhere.

## 1. Changes (A applies `b-round-453/sketch-454.patch.txt` (v4), sha256 `9f6fcb40f189e845b8fc1881c0120d1a1dae1a05ad57eb306fa13fc2c43955bc`; per-file hashes `b-round-453/sketch-files-sha256.txt`)

| # | File | Change |
|---|---|---|
| 1 | `app/styles/app.css` (narrow grant) | the hunks named in the ruling lines, plus deleting the stale card comment; nothing else |
| 2 | `app/styles/base/utilities.css` (narrow grant) | the `.styled-scrollbar` comment, `scrollbar-color` and thumb backgrounds |
| 3 | NEW `app/lib/__tests__/store-live-teal.test.ts` (node) | LT1–LT6; reuses `helpers/style-scan.ts` unchanged |
| 4 | NEW doc `docs/implementation/2026/quarter-IV/297-store-2b-3c-1-live-teal-css.md` [K10] | see A step 4 |

**Tests and mutants** (`b-round-453/run-mutants.sh`, `mutants.py`, `mutants/mutants.txt`, 27 lines; HEAD control `head-control.log`: LT1, LT2, LT3 and LT5 red, LT4 and LT6 green):

| Row | Checks | Mutant → red |
|---|---|---|
| LT1 | each of the 12 live blocks appears exactly once as the teal-free literal (0 teal, 0 zero-offset glow); each pinned header line appears exactly as often as at the sketch (`.command-palette-item.selected {` 2, the others 1) | M1 artwork teal → LT1 LT3 LT5; M2 brass glow on play → LT1; M3 play hover glow → LT1 LT3 LT5; M4 brass thumb glow → LT1; M6 brass grid → LT1; M7 brass digit glow → LT1; M8 ring border 2px → LT1; M9 palette teal → LT1 LT3 LT5; M10 hover split from selected → LT1; M11 scrollbar teal → LT1 LT3 LT5; M12 thumb hover teal → LT1 LT3 LT5; M20 second `.audio-player-button-play:hover` rule → LT1 |
| LT2 | no `.light-flicker-effect::after` anywhere; the `::before` block is the neutral literal with its `light-flicker-on` animation | M5 brass `::after` back → LT2; M16 `::before` teal stop back → LT2 LT3 LT5 |
| LT3 | teal only in the allow-listed files, at exact per-line counts: `app.css` 37, `utilities.css` 6, `studio.css` 4, `pages/studio.css` 4 | M13 new teal elsewhere → LT3 LT5; M14 a dead teal line removed without updating the list → LT3 LT5; M15 a new CSS file with teal → LT3 |
| LT5 | every teal line in `app.css` and `utilities.css` sits under an allow-listed dead or frozen top-level rule header, at its exact count (23 headers). The key is the whole top-level selector, comma-continuation lines included; a one-line rule or a header with a trailing comment is its own key | M19 count-neutral swap (a dead line removed, a teal line added to the unpinned live `.command-palette`) → LT5; M21 a live selector added to a dead teal comma list → LT5; M22 one-line teal rule after a dead rule → LT5; M23 header with a trailing comment → LT5 |
| LT6 | `var(--color-glow-primary\|--color-video-sync\|--gradient-primary\|--gradient-hero\|--gradient-glow)` is read only by the 2 dead rules (per file and per enclosing rule: `.product-detail-add-to-cart {`, `.newsletter-button-large {`); no alpha-suffixed teal hex in any CSS; self-tests for both patterns and for the LT5 header logic | M17 a teal token read in `.command-palette` → LT6; M18 `#13d9cc1a` in `.code-4` → LT1 LT6; M24 a dead token read moved into a live rule → LT6 |
| LT4 | non-vacuous (every allow-listed file is scanned); matcher self-tests for the removed forms (`hsl(175 … / .4)`, `rgba(19, 217, 204, …)`, `0 0 12px`, text-shadow) and a brass negative | — |
| — | controls | BASE, C1 (comment-only edit) and C2 (an offset drop shadow) → none |

## 2. A: steps
1. **Read first:** `lessons.md` (L1, L4, L11–L15, L23, L26, L28, L58, L60, L61) and the primitives `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md` (stale glow lines: see the warning above), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
2. **Claims, before editing.** Run `bash b-round-453/claims-454.sh`.
   - The output must equal `b-round-453/claims-454-planning-output.txt`, with stderr empty.
   - Otherwise STOP (L11).
3. **Apply.**
   - Check the patch sha256 against `b-round-453/sketch-454.sha256`.
   - Run `git apply b-round-453/sketch-454.patch.txt`.
   - Run `sha256sum -c b-round-453/sketch-files-sha256.txt`; it must give rc 0 (3 OK).
   - If the patch does not apply cleanly, STOP. Do not hand-port, and make no hand edits to code.
4. **Doc 297**, in Georgian with English technical terms, edited with the editor tools only (L60).
   - **Format:**
     - l.3 is `**თარიღი:** 2026-11-11`.
     - l.4 is exactly `**სტატუსი:** In Progress (stage 2b-3c-1 of STORE-2b; C round 454 PASS)` (L28).
     - The 7 TEMPLATE headings appear in order (L26), with no `pending`.
   - **Content:**
     - the 5 live groups with their HEAD measurements;
     - the `product-designer` choices, plus the `::before` stop found in the sketch run;
     - the dead and frozen ruling, including the inline preview variant and the legacy-only CSS;
     - the palette hover-moves-selection observation;
     - the scrollbar pixels;
     - LT1–LT6, and the `tech-lead` review (M1/M2 closed by LT5/LT6).

     Say that the mutants, probes and inventory are loop artifacts, not in the repo (GATE452-L4).
   - **TODO:** 2b-3c-2 (helper fail-open forms and the GS test gaps), 2b-3d (the dead tokens and rules listed above, CinemaCurtainLoader, the dead allow-lists), 2b-4, STORE-2c/2d motion (the scales listed in the ruling lines), STORE-5 docs, legacy Studio removal (`.stems-loader-list`, `slider-thumb-teal`).
   - Cite only test ids that exist.
5. **Checks** (speed rules; no full suite):
   - `npx vitest run $(cat b-round-453/covering-454.txt)`: 14 files green. B's run: 14 files / 134 tests.
   - `npm run typecheck`: rc 0.
   - `npm run lint`: rc 0, with 205 warnings, the same as HEAD.
   - `npx biome check app/lib/__tests__/store-live-teal.test.ts`: rc 0, no diagnostics. Biome does not check CSS here.
   - **Mutants**, on a scratch clone, never in the store tree:
     1. `git clone --shared` the store at `db641ec` into `/tmp/a454-src`.
     2. Apply the patch, symlink `node_modules` and add it to `.git/info/exclude`, then **commit**.
     3. Run `SRC=/tmp/a454-src OUT=<abs a-round-454 dir>/mutants bash b-round-453/run-mutants.sh`. OUT must be absolute.

     The result must equal `b-round-453/mutants/mutants.txt` (27 lines).
   - **code-reviewer** (3+ files with the doc). Pass its Architecture note to B.
6. **Browser** (dev server `:5173` on A's tree, mock API on `:5199`, warm-up first, L38). Run on A's tree:
   - `node b-round-453/probe/teal-probe.cjs http://127.0.0.1:5173 <a-round-454>/tree-<W>.json <W> <H> <shots>` at 1440×900 and 1280×720.
   - Then `python3 -I b-round-453/probe/compare-teal.py b-round-453/probe/head-<W>.json <a-round-454>/tree-<W>.json`. It must end `ROWS 19 ALL_OK True` at both viewports.
   - `scrollbar-pixels.cjs` on the tree: `tealPx` 0 and `thumbGreyPx` > 0 at both viewports.
   - `extras-probe.cjs` on the tree at both viewports, then `compare-extras.py b-round-453/probe/extras-head-<W>.json <tree>`: `ROWS 8 ALL_OK True`.
7. **Claims, after editing.** Run `bash b-round-453/claims-454.sh`.
   - Every K equals `b-round-453/claims-454-sketch-output.txt`, except K10 (`1 files`) and K12 (`outside 0 inside 4`). B dry-ran this on a clone with the patch and a placeholder doc 297: only those two differ.
8. **`git status`** shows only the 4 paths in `b-round-453/grants-454.txt`.

## 3. C: acceptance rows
**Setup:**
- Real Chromium (Playwright). Copy `b-round-453/probe/*.cjs`, `compare-teal.py` and the `head-*.json`, `sb-*.json` files into `c-round-454/` before changing anything (L60).
- **Servers:**
  - The tree: dev server `:5173`.
  - Mock API: `:5199` (`node tmp/studio-real-loop/mock-api/server.mjs`, started detached with `setsid` if it is not up).
  - HEAD control: `bash b-round-448/probe/serve-tree.sh start <c-round-454>/head 5182 /home/runner/czaba-project/store db641ec`. If B's `:5182` is still up, stop it first.
- Warm each server with `node b-round-448/probe/warm.cjs <base> /studio-lab /studio/middle-east / /store /cart /no-such-page` twice before its first probe. A first `/studio-lab` load during a Vite dependency reload is environment-invalid; B saw one on a cold server. Run probes one at a time, never during a vitest run (L38).

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all` | only the 4 `grants-454.txt` paths. Unchanged: `app/root.tsx`, `app/components/**` (studio, audio, product, search), `routes/$.tsx`, `routes/cart.tsx`, `ui/Modal.tsx`, `app/styles/` other than the 2 granted files, `helpers/style-scan.ts`, the protected routes |
| C2 CLAIMS | `claims-454.sh` on the tree vs `claims-454-sketch-output.txt` (v3; equal to v2's) | equal except K10 (`1 files`) and K12 (`outside 0 inside 4`); K3 obsidian sha `e9afeed85faec382`; K4 `app.css` 37, `utilities.css` 6, `studio.css` 4, `pages/studio.css` 4; K5 every live selector has `tealLines=0` and `.light-flicker-effect::after blocks=0` |
| C3 APPLY | `sha256sum -c b-round-453/sketch-files-sha256.txt` on the tree | 3 OK; the diffs of `app.css` and `utilities.css` vs `db641ec` are exactly the sketch's hunks |
| C4 LIVE-STATES (the change) | `teal-probe.cjs` on HEAD `:5182` and the tree `:5173` at 1440×900 and 1280×720; `compare-teal.py <head> <tree>` | `ROWS 19 ALL_OK True` at both viewports:<br>• the HEAD control shows teal in card, player, 404, palette and cart scrollbar (the script checks)<br>• the tree has no teal anywhere<br>• player artwork rest/hover dark shadow only; play button rest, hover and paused `none`, fill brass → `rgb(217,184,127)` on hover<br>• labels "Pause preview"/"Pause" while playing, "Play" when paused, equal to HEAD<br>• keyboard ring on play equal to HEAD; thumb-hover rule dark only<br>• card `::after` gone; `::before` neutral (`color(srgb 0.92549 0.901961 0.854902 / 0.06) 40%`) and animated as at HEAD<br>• 404 grid ink (2 × `color(srgb 0.92549 0.901961 0.854902 / 0.03) 1px`), digits no shadow, ring 4px brass and box equal<br>• palette selected `rgba(201,164,106,.12)`, contrast ≥ 4.5 (B: 12.2), selection-follows-hover and ArrowDown equal to HEAD<br>• cart list and ConfirmDialog `scrollbar-color` `rgb(115,107,96)`, overflow and box equal<br>• `/studio-lab` digest sha and element count equal to HEAD<br>• 0 page errors<br>Keep the player, 404, palette and cart crops of both trees |
| C5 CONTROL | `compare-teal.py <head> <head>` | fails (`ALL_OK False`), as B's `compare-head-self-CONTROL.txt` |
| C6 SCROLLBAR-PIXELS (L61) | `scrollbar-pixels.cjs` on HEAD and the tree at both viewports (real scrollbars, stubbed cart) | HEAD `tealPx` > 0 (B: 1046 / 524, colour `15,94,87`); tree `tealPx` 0 and `thumbGreyPx` > 0 (B: `115,107,96`); `geo` equal to HEAD |
| C6b EXTRA STATES + LIVE-TEAL SWEEP | `extras-probe.cjs` on HEAD and the tree at both viewports; `compare-extras.py <head> <tree>` | `ROWS 8 ALL_OK True`:<br>• **CSSOM sweep:** every stylesheet rule whose non-custom-property declarations contain teal (pseudo parts stripped), and every element animated by a teal keyframes rule, matched against 8 live states (home, home + player, palette open, `/store`, `/products/middle-east`, 404, stubbed cart, cart + ConfirmDialog). HEAD > 0 on home, player, palette, 404, cart and dialog (B: 2/7/8/3/3/3); the tree is 0 in all 8<br>• card light under **default motion**: `light-flicker-on` runs, end opacity equal to HEAD, `::after` none<br>• progress thumb **keyboard focus**: `:focus-visible` ring equal to HEAD<br>• palette **longest title** selected (brass .12, no overflow) and **empty result** equal to HEAD<br>• ConfirmDialog scrollbar sampled **inside the dialog**<br>• 0 page errors<br>`compare-extras.py <head> <head>` must fail |
| C7 COVERING + MUTANTS | `npx vitest run $(cat b-round-453/covering-454.txt)`; then `run-mutants.sh` on a C scratch (`git clone --shared` at `db641ec` + A's diff applied **and committed**; absolute OUT) | 14 files green; `mutants.txt` equals `b-round-453/mutants/mutants.txt` (27 lines) |
| C8 STUDIO + PURCHASE PROTECTION | from inside `c-round-454/` (create `shots/` there): `node <copy of b-round-453/probe/c12-run/c12-from-c448.cjs> <base> <tag> > c12-<tag>.json` on HEAD and the tree | at 1440 and 1280: `/studio-lab` clips 1, Playing with `posPlay` > 0, Stopped, `stopHeld` true; anonymous `/studio/middle-east`: `audioSrc` 0, `media` 0, "Sign in required". Equal to HEAD in every field except `url` and the `posPlay` value (B: `probe/c12-run/c12-{head,sketch}.json`) |
| C9 DOCS | doc 297 | l.4 exact; TEMPLATE headings in order; no `pending`; every LT id cited exists (LT1–LT6); the dead/frozen, inline-variant, `::before`, palette and scrollbar-pixel lines present |
| C10 L57 | `python3 -I tools/l57-check.py c-round-454.json c-round-454/l57-check.txt` | rc 0 |

- **Gate rows** (full vitest, typecheck, build, Biome, verify) are `gate` and are not claimed by C. B's full suite on the v3 sketch: 284 files / 4138 tests (`b-round-453/precheck-full-raw.log`); build rc 0 (`precheck-build.log`).
- **BLOCKED (backend unavailable in cloud):** the fake-bearer premium path, and the signed-in legacy ExportDialog stem list.
- **Not testable in the cloud:** Firefox `scrollbar-color` (ROOT-REQ-PLAYWRIGHT-FIREFOX) and the Safari WebKit thumb hover (`var(--color-muted)`; only Safari paints `::-webkit-scrollbar` when `scrollbar-color` is set). Both go in one Tech Lead row, TLM-R454-FIREFOX-SAFARI-SCROLLBAR, deadline RETRO 465.

**`product-designer` states checklist → rows:**

| State | Row |
|---|---|
| player rest/hover (artwork, play, thumb) at 1440/1280 | C4 |
| player playing vs paused | C4 PLAY-PAUSED-STATE |
| keyboard ring on play | C4 |
| keyboard ring on thumb | C6b |
| zero teal | C4 + C6b sweep |
| card first load, light still plays | C6b default motion |
| card "staggered fade" | **not a row:** `light-flicker-stagger` has 0 TSX users at HEAD [K6], so no stagger plays today (dead → 2b-3d) |
| card with no image | **not a row:** the home loader is SSR from the mock API and every mock product has an image. The changed layers are pseudo-elements of the container and do not depend on the `<img>` |
| card reduced motion | C4 |
| 404 ring reads as "0", grid faint | C4 + crops |
| palette opens with row 1 selected; arrows move | C4 |
| palette hover vs selected | C4: the hover moves the selection (HEAD behaviour), so both never show at once |
| palette empty result and long title | C6b |
| cart ConfirmDialog and long cart list | C4, C6, C6b |
| scrollbar hover | Safari only (TLM row above) |
| legacy ExportDialog | BLOCKED (signed-in, backend) |
| `/studio-lab` unchanged | C4 digest + C8 |

**INFO-B454-PREVIEW-AUDIO-ELEMENT (B observation, not a bug):** the probes read the DOM `<audio>` as paused at 0 s after a preview click. That element is HeroSection's hero music (`HeroSection.tsx:95`). The preview plays through `new Audio()` in `AudioContext.tsx:146`, which is not in the DOM, and the button and player labels show the playing state. This is the same at HEAD. Not a row in this round.
- **`c-round-454.json`:** write all L57 fields. Every finding has an `origin`. Fill these fields:
  - `mutantRedOnSketch` = `b-round-453/mutants/mutants.txt`;
  - `affectedChecksRunOnSketch` = `b-round-453/precheck-full-raw.log` and `b-round-453/probe/compare-1440.txt`, `compare-1280.txt`.

**Neighbours that could break:**
- Every page with the sticky player: C4 runs it on home.
- The home cards and the protected downloads page (same CSS; C4 card rows).
- The 404 page.
- The header palette.
- The cart list and every ui/Modal default dialog (C4/C6).
- `/studio-lab` (C4 digest, C8).
- Tests that read `app.css` or `utilities.css`: the covering set + B's full-suite precheck.

## 4. Claims
- **Script:** `b-round-453/claims-454.sh` (K1–K14; K4 runs the real helper through `vite-node`, `k4-css-teal.ts`).
  - Planning output: `claims-454-planning-output.txt`.
  - Sketch output (`STORE_ROOT=/tmp/b454-scratch`): `claims-454-sketch-output.txt`.
  - Both stderr files are empty.
- **Inventory:** `b-round-453/inv/`:
  - `teal-inventory2.py` + `.txt/.json` (HEAD), `sketch-inv.*` (sketch);
  - `reach.py` + `reachable.json`;
  - the v1 scan `teal-inventory.*`, kept for the record (it missed multi-line forms).
- **Probes** (`b-round-453/probe/`):

  | Script | Outputs |
  |---|---|
  | `teal-probe.cjs` + `compare-teal.py` | `head-{1440,1280}.json`, `sketch-{1440,1280}.json`, `compare-{1440,1280}.txt`, `compare-head-self-CONTROL.txt` (fails, as it must) |
  | `scrollbar-pixels.cjs` | `sb-{head,sketch}-{1440,1280}.json` |
  | `c12-run/c12-from-c448.cjs` | `c12-head.json`, `c12-sketch.json` |
  | `extras-probe.cjs` + `compare-extras.py` | `extras-{head,sketch}-{1440,1280}.json`, `compare-extras-{1440,1280}.txt`, `compare-extras-head-self-CONTROL.txt` (fails, as it must) |
  | `teal-states-probe.cjs` | the first reachability probe |

  Screenshots are in `shots-head/` and `shots-sketch/`.
- **Pre-check (v4):**
  - `precheck-covering.log` 14 / 134;
  - `precheck-typecheck.log` rc 0;
  - `precheck-lint.log` 205 warnings;
  - `precheck-biome-scoped.log` clean;
  - `precheck-full-raw.log` 284 / 4138;
  - `precheck-build.log` rc 0.
- **Reviews:** `b-round-453/sketch-review.md`. Three `tech-lead` passes:
  - **v2:** APPROVE-WITH-CHANGES (M1, M2, L1–L4), all fixed in v3.
  - **v3 delta:** APPROVE-WITH-CHANGES (P1 Medium; P2, P3 and P5 Low; the gradient interpolation), all fixed in v4 with mutants M21–M24.
  - **v4 delta:** recorded in the review file.
  
  Superseded artifacts are in `v1-`, `v2-` and `v3-superseded/`.

## 5. After this round
- **Round 455:** REGRESSION-2026-11-13 if it is planned on or after 2026-11-13; otherwise STORE-2b-3c-2 (the style-scan helper fail-open forms, with a golden test).
- **Then:** 2b-3d (dead tokens, rules and files), 2b-4, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
