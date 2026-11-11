# Round 453: STORE-2b-3b — the glow shadows leave the Store: `--shadow-glow`, the primary-button glows and the zero-offset glow inventory

**Planned by:** B, at the round 452 → 453 planning, 2026-11-11 (`b-round-452.md`).
- The advisor was available and was consulted after orientation, before writing.
- The round-452 task is archived as `tasks/round-452.md` (a byte-identical copy made before this file was rewritten).
- **Baseline:** gate 452 is `published`, commit `ee7cf7c` [K1]. The store tree is at `ee7cf7c` and clean at planning [K2, K15].
- **Regression:** not due (last 2026-11-10, round 425; due on or after 2026-11-13). **Next RETRO:** round 465.

## Why this round
- **Round 452 closed.** C round 452 PASS (C1–C12, `browserVerified`/`realVerified` true, 0 bugs). Gate 452 published `ee7cf7c`. SYS-R450-STORE-STYLE-SCAN is done (D-29z1608).
- **STORE-2b-3b is the next STORE-REDESIGN stage.** Its scope:
  - The spec row STORE-2 says "Remove … `shadow-glow`".
  - The round-452 task (§7, D-29z1604-c) assigns this stage the zero-offset glow inventory in app TS/TSX. HEAD has 5 hits [K17]: CinemaCurtainLoader 2, PurchaseHeader 1, GlobalPlayhead 1, `routes/store.tsx` 1.
- **What is live at HEAD** (browser, `b-round-452/probe/glow-head.json`):
  - A teal glow on hover and on press on every brass primary CTA: the header "Sign In", the hero "Discover the Collection", the 404 "Back Home", the `/account` "Sign In" (ui/Button) and the `/support` "Start Chat".
  - The two stub pages `/account/login` and `/search`: a "Back to Home" link that is a teal gradient with white text. Its hover text contrast is **2.36:1**.
  - The product page's "Added" state: a brass 20px glow.

## What changes (user-visible)
- **Primary buttons:**
  - No glow at rest, on hover or on press.
  - Hover shows the lighter brass `#D9B87F` at full opacity. The old 0.9 hover opacity is removed: without the glow, it made the hover almost invisible (`product-designer`).
  - Press feedback stays: opacity 0.8 on `.btn-primary`, 0.9 on ui/Button.
  - The keyboard focus ring is unchanged.
- **Stub-page "Back to Home"** (`.button-primary`): brass fill, dark `#0E0D0C` text, the lighter brass on hover. Its drop shadow (`--shadow-lg`) and the teal glow go. Contrast goes from 2.36 to 10.28 on hover.
- **Product page "Added" state:** no glow. The "Added" label, the Sparkles icon and the scale pulse stay.
- **No box moves.** Every target's box equals HEAD's [probe].
- **`/studio-lab`:** no computed-style change [probe STUDIO rows].
- **Frozen legacy Studio** (`/studio/:id`, purchased only): the playhead and the Export Audio hover lose the teal halo (see the ruling lines; measured on the stubbed path).

## Reference
- **Spec:** `store-redesign-spec.md`, row STORE-2: "Remove … `shadow-glow`". Spec l.18 allows removing glow on keep-list items. None of the keep-list items is touched here.
- **Direction A** (`direction-decision.md`): one accent, brass, no glow.
- **`product-designer` consult (this planning):**
  - **Q1, primary-button feedback: option (b).** Hover changes the fill only. Button keeps its offset `shadow-sm`. `.btn-primary:hover` drops `opacity: .9`. `:active` keeps `opacity: .8`.
    - Rejected (a), dropping `shadow-sm`: outside STORE-2 and inconsistent with the other filled variants.
    - Rejected (c), adding lift or a border: new design that the direction does not ask for.
  - **Q2, `.button-primary`: option (a).** Brass fill and brand-foreground text.
    - Rejected (b), making it secondary: that takes away the page's only primary action.
  - **Q3, dead and frozen sites stay as they are,** IconButton included, under the standing rule.
  - **States to check:** rest, hover, active, keyboard focus-visible, no ring after a pointer press, disabled, 1280×720 and 1440×900. Each is a C row below.
- **Ableton:** does not apply (Store marketing UI).

**Deviations:** none from the spec.

**Screen budget:** no element is added. One element is removed: the invisible `/store` card "Hover Glow Effect" overlay (it paints nothing at HEAD).

## Ruling lines (L4)
- **`app/styles/**` is `global_forbidden` [K11]. B grants `app/styles/app.css` narrowly,** with the same precedent as rounds 192, 196, 201, 316 and 449. A may change only the hunks in `sketch-453.patch.txt`:
  - remove the 2 `@theme` tokens;
  - the 3 `.btn-primary` hunks;
  - the 2 `.button-primary` hunks;
  - delete `.special-offer-card:hover`;
  - delete the `box-shadow` line of `.track-card:hover`.

  The obsidian block stays byte-identical [K8: `e9afeed85faec382`].
- **Dead and frozen sites keep their `shadow-glow` class** (the dead-code rule wins; `product-designer` Q3). These are `ChatButton.tsx`, `ui/IconButton.tsx`, `home/VideoShowcase.tsx` and the frozen `components/studio/GlobalPlayhead.tsx` [K4, K5].
  - With the token removed, the class paints nothing. The probe's INERT rows show `box-shadow: none` on `/` and `/studio-lab`.
  - GS2 allow-lists them with exact counts. LEGACY-DEAD-STORE-COMPONENTS and the legacy Studio removal take them away.
- **Token removal vs frozen legacy Studio:** the removal wins, as `@theme` changes have reached legacy Studio since round 192.
  - GlobalPlayhead's non-amber playhead loses its teal 40px halo. Its brass line stays.
  - The legacy ExportDialog's "Export Audio" (ui/Button primary) loses its teal hover glow too.
  - Both are measured on the stubbed client path (HR-LEGACY-STUBBED, `probe/legacy-playhead-probe.cjs`): HEAD shows a teal `0 0 40px` on the playhead and on the hover; the sketch shows `none` and the `shadow-sm` offset shadow. This is C11. The ownership/backend half is not tested and stays BLOCKED.
  - Doc 296 records it.
- **Every ui/Button with the default or `primary` variant loses its hover glow by design**, including signed-in and frozen consumers that C cannot open unstubbed [K19]: `studio/ExportDialog`, `studio/DownloadDialog`, `account.downloads`, `studio.$productId`, the recordings and scenes pages, `gift-cards`, `account` and `cart`. No file of theirs changes; only the shared Button class and the token do.
- **Loading, disabled cursor and default motion (`product-designer` states):**
  - `isLoading` and the disabled cursor come from Button's base classes (`opacity-50 cursor-not-allowed pointer-events-none`), which this round does not touch. C5 covers the disabled hover; `isLoading` cannot be reached in the cloud without a backend action, so it has no browser row (source rows GS2/ST5).
  - Default motion: C4 runs with `reducedMotion: 'reduce'`, the same as B's HEAD capture. C4b records one default-motion sample.
- **Dead CSS rules that read the removed token:** `.special-offer-card:hover` and `.track-card:hover` have 0 TSX consumers [K9]. The `var()` read is deleted, not left dangling. The rest of those dead rules is STORE-2b-3d's.
- **D-29z1604-c inventory [K17]:**
  - PurchaseHeader (live) is fixed here.
  - `routes/store.tsx`: the overlay is deleted. It paints nothing at HEAD, because `var(--color-brand)25` is invalid CSS (`probe/store-card-head.json`).
  - CinemaCurtainLoader (2, dead) goes to STORE-2b-3d.
  - GlobalPlayhead (frozen) is allow-listed.
- **Not in this round** (K12 lists them, unchanged): every other teal or glow CSS rule. These are `.hover-glow`, `.audio-preview-inline-button`, `.audio-player-*`, `.track-row-waveform`, `glow-pulse`, `.product-detail-add-to-cart`, `.newsletter-button-large`, `.track-card-play-button`, and the `--gradient-primary` users other than `.button-primary`.
  - Live ones go to STORE-2b-3c.
  - Dead ones go to STORE-2b-3d. B re-greps them at that planning.
- **A-R451-REVIEW-L2-ZERO-OFFSET-UNITS and INFO-TL-R451-GLOW-CALC:** re-checked by `tech-lead` this planning. Both still fail open (`0rem 0 20px`, `0 0 calc(…)`).
  - The fix belongs in `helpers/style-scan.ts`, which is not granted here (gate-452 architecture note: no helper growth without an extraction task).
  - Owner: STORE-2b-3c. Doc 296 says so.
- **Test pin (L23):** `store-theme-tokens.test.ts` ST5 pins ui/Button's primary block as a literal [K7]. It is replaced by the new literal (`'shadow-sm',`), the same exact-literal strength, and GS2/GS4 add the glow ban. No assertion is removed. Mutant M2 turns ST5 red.

## 1. Changes (A applies `b-round-452/sketch-453.patch.txt`, sha256 `6e7710919c8315eb6ef441956832e0cd71e66c56e16db394762bbebe8ad73935`; per-file hashes `b-round-452/sketch-files-sha256.txt`)

| # | File | Change |
|---|---|---|
| 1 | `app/styles/app.css` (narrow grant) | the hunks named in the ruling lines; nothing else |
| 2 | `app/components/ui/Button.tsx` | primary: `'shadow-sm hover:shadow-glow'` → `'shadow-sm'` |
| 3 | `app/components/chat/ChatInput.tsx`, `app/components/chat/GuestForm.tsx` | `'hover:bg-brand-hover hover:shadow-glow'` → `'hover:bg-brand-hover'` |
| 4 | `app/components/product/PurchaseHeader.tsx` | the `justAdded ? 'shadow-[0_0_20px_…]'` class part is removed [K18] |
| 5 | `app/routes/store.tsx` | the "Hover Glow Effect" overlay `div` and its comment are removed (9 lines) [K18]; `BRAND_COLOR` and `isHovered` stay in use |
| 6 | `app/lib/__tests__/store-theme-tokens.test.ts` | the ST5 primary literal only |
| 7 | NEW `app/lib/__tests__/store-glow-shadow.test.ts` (node) | GS1–GS4; it reuses `helpers/style-scan.ts` unchanged |
| 8 | NEW doc `docs/implementation/2026/quarter-IV/296-store-2b-3b-glow-shadows.md` [K10] | see A step 4 |

**Tests and mutants** (`b-round-452/run-mutants.sh`, `mutants/mutants.txt`; HEAD control `head-control.log`: GS1–GS4 all red at HEAD):

| Row | Checks | Mutant → red |
|---|---|---|
| GS1 | `--shadow-glow` / `--shadow-glow-accent` are neither defined nor read in app CSS/TS/TSX | M1 token restored → GS1 GS4; M8 `.special-offer-card:hover` read restored → GS1 GS4 |
| GS2 | the `shadow-glow` utility appears only in the 4 allow-listed files, each exactly once | M2 Button glow back → GS2 GS4 ST5; M7 IconButton loses its token (drift) → GS2; M9 ChatInput glow back → GS2 GS4 |
| GS3 | every rule whose selector ends in `.btn-primary`, `.btn-primary:hover`, `.btn-primary:active`, `.button-primary` or `.button-primary:hover` (including `@media`, descendant and comma forms): no zero-offset glow, no teal, no `--gradient-primary`; `.button-primary` has brand-foreground text; `.btn-primary:hover` has the brand-hover fill and no opacity | M3 M4 M5 M6 M10 M12 M13 M14 (`@media`) M15 (no space) M16 (descendant, comma) → GS3 |
| GS4 | non-vacuous (≥ 200 sources, every granted and allow-listed file read); the 5 granted scripts and `app.css` carry no utility or token; the 5 granted scripts carry 0 zero-offset glows; matcher self-test | M17 ChatInput arbitrary brass glow → GS4; M18 PurchaseHeader glow back → GS4; M19 store-card overlay back → GS4 |
| — | controls | BASE, M11 (an offset drop shadow on `.btn-primary:hover`) and M20 (the glow only inside a CSS comment) → none |

## 2. A: steps
1. **Read first:** `lessons.md` (L11–L15, L26, L28, L60) and the primitives `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `FORWARDREF_COMPONENT.md` (Button), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
2. **Claims, before editing.** Run `bash b-round-452/claims-453.sh`.
   - The output must equal `b-round-452/claims-453-planning-output.txt`, with stderr empty.
   - Otherwise STOP (L11).
3. **Apply.**
   - Check the patch sha256 against `b-round-452/sketch-453.sha256`.
   - Run `git apply b-round-452/sketch-453.patch.txt`.
   - Run `sha256sum -c b-round-452/sketch-files-sha256.txt`; it must give rc 0.
   - If the patch does not apply cleanly, STOP. Do not hand-port, and make no hand edits to code.
4. **Doc 296**, in Georgian with English technical terms, edited with the editor tools only (L60).
   - **Format:**
     - l.3 is `**თარიღი:** 2026-11-11`.
     - l.4 is exactly `**სტატუსი:** In Progress (stage 2b-3b of STORE-2b; C round 453 PASS)` (L28).
     - The 7 TEMPLATE headings appear in order (L26), with no `pending`.
   - **Content:**
     - the `product-designer` choices;
     - the HEAD measurements: teal hover glow, stub contrast 2.36, the "Added" glow;
     - the GlobalPlayhead legacy visual change and the `.button-primary` `shadow-lg` removal;
     - the inert `store.tsx` overlay;
     - the D-29z1604-c inventory ruling;
     - A-R451-REVIEW-L2 and INFO-TL-R451-GLOW-CALC: still fail open, owner STORE-2b-3c;
     - GS1–GS4 and the ST5 literal.

     Say that the mutants and probes are loop artifacts and are not in the repo (GATE452-L4).
   - **TODO:** 2b-3c, 2b-3d (CinemaCurtainLoader, the dead allow-list, `.special-offer-card`/`.track-card`), 2b-4, and LEGACY-DEAD-STORE-COMPONENTS.
   - Cite only test ids that exist.
5. **Checks** (speed rules; no full suite):
   - `npx vitest run $(cat b-round-452/covering-453.txt)`: 5 files green. B's run: 5 files / 66 tests, each file under 0.4 s.
   - `npm run typecheck`: rc 0.
   - `npm run lint`: rc 0, with 205 warnings, the same as HEAD.
   - `npx biome check` on the 7 changed code files: rc 0 and 6 warnings, the same as HEAD on the same 6 existing files (`precheck-biome-head.log`).
   - **Mutants**, on a scratch clone, never in the store tree:
     1. `git clone --shared` the store at `ee7cf7c` into `/tmp/a453-src`.
     2. Apply the patch, symlink `node_modules` and **commit**.
     3. Run `SRC=/tmp/a453-src OUT=<abs a-round-453 dir>/mutants bash b-round-452/run-mutants.sh`. OUT must be absolute.

     The result must equal `b-round-452/mutants/mutants.txt`.
   - **code-reviewer** (3+ files). Pass its Architecture note to B.
6. **Browser** (dev server `:5173` on A's tree, mock API on `:5199`; warm-up first, L38). Run on A's tree:
   - `node b-round-452/probe/glow-probe.cjs http://127.0.0.1:5173 <a-round-453>/glow-tree.json 1440,1280 <a-round-453>/shots`, then `python3 -I b-round-452/probe/compare-glow.py b-round-452/probe/glow-head.json <a-round-453>/glow-tree.json`. It must end `ROWS 22 ALL_OK True`.
   - `added-probe.cjs`: `addedShadow` is `none` at both viewports.
   - `store-card-probe.cjs`: `glowing` is `[]`.
7. **Claims, after editing.** Run `STORE_ROOT=<store> bash b-round-452/claims-453.sh`.
   - Every K equals `b-round-452/claims-453-sketch-output.txt`, except K2 (HEAD sha), K10 and K15. B dry-ran this on a clone with the patch and a placeholder doc 296: only those three differ.
   - K10 must read `1 files`, and K15 must read `outside 0 inside 9`.
8. **`git status`** shows only the 9 paths in `b-round-452/grants-453.txt`.

## 3. C: acceptance rows
**Setup:**
- Real Chromium (Playwright). Copy `b-round-452/probe/*` into `c-round-453/` before changing anything (L60).
- **Servers:**
  - The tree: dev server `:5173`.
  - Mock API: `:5199` (`node tmp/studio-real-loop/mock-api/server.mjs`, started detached with `setsid`).
  - HEAD control: `bash b-round-448/probe/serve-tree.sh start <c-round-453>/head 5178 /home/runner/czaba-project/store ee7cf7c`.
- Warm each server with `node b-round-448/probe/warm.cjs <base> /studio-lab /studio/middle-east / /store` before its first timed probe. Run probes one at a time, never during a vitest run (L38).

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all` | only the 9 `grants-453.txt` paths. Unchanged: `app/root.tsx`, `app/components/studio/**`, `app/styles/` other than `app.css`, `app/contexts/**`, the protected routes, `helpers/style-scan.ts`, ChatButton, IconButton, VideoShowcase |
| C2 CLAIMS | `claims-453.sh` on the tree vs `claims-453-sketch-output.txt` | equal except K2, K10 (`1 files`) and K15 (`outside 0 inside 9`); K8 obsidian sha `e9afeed85faec382`; K17 shows only CinemaCurtainLoader 2 and GlobalPlayhead 1 |
| C3 APPLY | `sha256sum -c b-round-452/sketch-files-sha256.txt` on the tree | 8 OK; `app.css` diff vs `ee7cf7c` = exactly the sketch's hunks |
| C4 PRIMARY-STATES (the change) | `glow-probe.cjs` on HEAD `:5178` and tree `:5173` at 1440 and 1280; `compare-glow.py <head> <tree>` | `ROWS 22 ALL_OK True`. Per enabled target (header Sign In, hero CTA, 404, 2 stubs, `/account` Sign In, `/support` Start Chat):<br>• no zero-offset or teal shadow at rest, hover, active or focus<br>• no teal background<br>• rest `rgb(201,164,106)`, hover `rgb(217,184,127)` at opacity 1<br>• text contrast ≥ 4.5 at rest and on hover (B: 8.32 / 10.28)<br>• active opacity 0.8 (`.btn-primary`), 0.9 (Button), 1 (stubs, chat)<br>• keyboard ring present and equal to HEAD<br>• box equal to HEAD<br>The HEAD control must show the teal hover glow (the script checks this). Keep the hover and focus crops of both trees.<br>A transition sample still in flight (a non-round value like `12.0136px` or an opacity between states) is environment-invalid: rerun that target once. A second unsettled sample is a finding |
| C5 DISABLED | the same run, GIFTCARD-SELECT (disabled in the cloud: no gift-card product) | no hover change, opacity 0.5, no glow |
| C6 POINTER-NO-RING | C4's `active` sample, taken while the mouse button is held on the target (`compare-glow.py` checks it) | `focusVisible` false and outline `none` on every enabled target at both viewports (B's sketch run: 14 of 14) |
| C4b DEFAULT-MOTION | a copy of `glow-probe.cjs` with `reducedMotion` left at the default, on the tree at 1440, HEADER-SIGNIN and HERO-CTA only | `record`: hover fill and no glow, as in C4, after the 450 ms wait |
| C7 ADDED-STUBBED | `added-probe.cjs` on HEAD and the tree (it stubs `POST /api/cart/items`, client path only, L36) | HEAD `addedShadow` contains `0px 0px 20px`; tree `none`; `addedText` "Added" on both; `posted` 1 |
| C8 STORE-CARD | `store-card-probe.cjs` on HEAD and the tree | `glowing: []` on both. The overlay was inert at HEAD; the card href and the hover screenshot are unchanged |
| C9 INERT + STUDIO | C4's INERT and STUDIO rows | the injected `.shadow-glow` element is `none` on the tree and teal on HEAD; the `/studio-lab` computed-style digest (rest and Export dialog) equals HEAD at both viewports. Pixel rows are not used: INFO-C449-C9-HEAD-CONTROL-FLAKE is unexplained, and the digest is deterministic (B: HEAD vs HEAD equal across 3 runs) |
| C10 COVERING + MUTANTS | `npx vitest run $(cat b-round-452/covering-453.txt)`; then `run-mutants.sh` on a C scratch (`git clone --shared` at `ee7cf7c` + A's diff applied **and committed**; absolute OUT) | 5 files green; `mutants.txt` equals `b-round-452/mutants/mutants.txt` (21 lines) |
| C11 LEGACY-STUBBED | `node legacy-playhead-probe.cjs <base> <out.json> <W> <H> <shots>` on HEAD and the tree, at 1440×900 and 1280×720; one throwaway load of `/studio/middle-east` first (HR-MP3-WARMUP, amended round 222) | client path only (HR-LEGACY-STUBBED):<br>• the `shadow-glow` playhead line: HEAD ends `0px 0px 40px 0px`, tree `none`<br>• "Export Audio" hover: HEAD teal `0 0 40px`, tree `rgba(4, 5, 6, 0.3) 0px 1px 2px 0px` with fill `rgb(217, 184, 127)`<br>• the button box equals HEAD's<br>• `audioSrc` 0 and 0 page errors<br>B's runs: `probe/legacy-{head,sketch}-{1440,1280}.json`. Ownership and backend stay BLOCKED |
| C12 STUDIO + PURCHASE PROTECTION | from inside `c-round-453/` (create `shots/` there): `node <copy of b-round-452/probe/c12-run/c12-from-c448.cjs> <base> <tag> > c12-<tag>.json` on HEAD and the tree | at 1440 and 1280: `/studio-lab` clips 1, Playing with `posPlay` > 0, Stopped, `stopHeld` true; anonymous `/studio/middle-east`: `audioSrc` 0, `media` 0, "Sign in required"; equal to HEAD (B: `probe/c12-run/c12-sketch.json`) |
| C13 DOCS | doc 296 | l.4 exact; TEMPLATE headings in order; no `pending`; every GS/ST id cited exists; the GlobalPlayhead, `shadow-lg`, inventory and fail-open (owner 2b-3c) lines present |
| C14 L57 | `python3 -I tools/l57-check.py c-round-453.json c-round-453/l57-check.txt` | rc 0 |

- **Gate rows** (full vitest, typecheck, build, Biome, verify) are `gate` and are not claimed by C. B's full suite on the sketch: 283 files / 4132 tests (`precheck-full-raw.log`).
- **Fake-bearer premium path:** BLOCKED (backend unavailable in cloud).
- **`c-round-453.json`:** write all L57 fields. Every finding has an `origin`. Fill these fields:
  - `mutantRedOnSketch` = `b-round-452/mutants/mutants.txt`;
  - `affectedChecksRunOnSketch` = `b-round-452/precheck-full-raw.log` and `b-round-452/probe/glow-compare.txt`.

**Neighbours that could break:**
- Every page with the header Sign In or ui/Button. C4 covers 8 targets.
- The Sign-in modal: its submit is the `accent` variant, which is unchanged.
- The `/store` card hover (C8).
- The product page cart button (C7).
- `/studio-lab`, including the Export dialog (C9).
- The legacy Studio playhead and its Export dialog (C11, stubbed).
- Tests that read `app.css` or Button: covering set + full-suite precheck.

## 4. Claims
- **Script:** `b-round-452/claims-453.sh` (K1–K19; K17 runs the real helper through `vite-node`).
  - Planning output: `claims-453-planning-output.txt`.
  - Sketch output (`STORE_ROOT=/tmp/b453-scratch`): `claims-453-sketch-output.txt`.
  - Both stderr files are empty.
- **Probes** (`b-round-452/probe/`):

  | Script | Outputs |
  |---|---|
  | `glow-probe.cjs` + `compare-glow.py` | `glow-head.json`, `glow-sketch.json`, `glow-compare.txt`, `glow-compare-head-self-CONTROL.txt` (fails, as it must) |
  | `added-probe.cjs` | `added-head.json`, `added-sketch.json` |
  | `store-card-probe.cjs` | `store-card-head.json`, `store-card-sketch.json` |
  | `c12-run/c12-from-c448.cjs` | `c12-sketch.json` |
  | `legacy-playhead-probe.cjs` | `legacy-head-1440.json`, `legacy-head-1280.json`, `legacy-sketch-1440.json`, `legacy-sketch-1280.json` |

  Screenshots are in `shots-*`. The v1 artifacts are in `v1-superseded/`.
- **Pre-check (v2):**
  - `precheck-typecheck.log` rc 0;
  - `precheck-lint.log` 205 warnings;
  - `precheck-biome-scoped.log` vs `precheck-biome-head.log`, 6 = 6;
  - `precheck-full-raw.log`, 283 / 4132;
  - `precheck-build.log` rc 0;
  - `git apply --check` on the store tree: rc 0.
- **Reviews:** `b-round-452/sketch-review.md`. The v1 `tech-lead` review was APPROVE-WITH-CHANGES with 5 Lows, all addressed in v2. The v2 delta review (APPROVE) is recorded there.

## 5. After this round
- **Round 454:** REGRESSION-2026-11-13 if it is planned on or after 2026-11-13; otherwise STORE-2b-3c (live teal and glow CSS, plus the helper's fail-open forms).
- **Then:** 2b-3d (dead tokens, rules and files), 2b-4, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
