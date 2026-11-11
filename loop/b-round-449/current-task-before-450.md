# Round 449: STORE-2b-3a — gradient text leaves the Store; each emphasised heading word becomes plain light ink

**Planned by:** B, at the round 448 → 449 planning, 2026-11-11 (`b-round-448.md`).
- The advisor was available and was consulted after orientation and before writing.
- The round-448 task is archived as `tasks/round-448.md` (byte-identical copy made before this file was rewritten).
- **Baseline:** gate 448 is `published`, commit `48e16b8` [K1]. The store tree is at `48e16b8` and clean at planning [K2, K18, K19]. `context/head-sha.txt` says `cce5eda`; the gate's `commit` wins.
- **Regression:** not due (last 2026-11-10, round 425; due on or after 2026-11-13). **RETRO:** round 450, the next round.

## Why this round
- C round 448 PASS (`browserVerified`/`realVerified` true; C1–C6 and C8–C13 passed; C7, the real mail send, BLOCKED because there is no Brevo key in the cloud; 0 bugs). Gate 448 published `48e16b8`.
  - **STORE-2b-2b is done.** B-R447-HIREUS-EMAIL-LIGHT-CLIENT is closed (D-29z1593).
- **STORE-2b-3 is split** (D-29z1594). The store CSS holds 70 teal hits [K21] plus the glow, blur and gradient rules, which is too much for one checkable round. The stages:
  - **2b-3a (this round):** gradient text.
  - **2b-3b:** glow shadows: `--shadow-glow` and its TSX users, including `ui/Button` and `ui/IconButton`.
  - **2b-3c:** the remaining live teal CSS rules.
  - **2b-3d:** dead tokens and rules, removed with the LEGACY cleanup.

  B re-greps each stage at its own planning.
- **Why gradient text first:**
  - It is self-contained: 1 token, 2 live rules and 8 live words, with no Studio consumer [K4].
  - `/studio-lab` stays at 0 px [K11], and the Studio's obsidian block is untouched [K8].
  - It is fully browser-measurable. At HEAD each word's glyphs are a light-grey → teal gradient, 34–80 % teal ink [K10].
  - 2b-3b is not first because `--shadow-glow` has no obsidian override and `ui/Button` users, so it needs its own Studio rows.

## What changes (user-visible)
- **Eight emphasised heading words** stop being painted with the light-grey → teal gradient. Each takes its heading's own light ink #ECE6DA:
  - "CZABA" in the home hero h1;
  - "Releases" in Latest Releases;
  - "Studio" in CZABA Studio;
  - "Inner Circle" in Join the Inner Circle;
  - "Cinema" and "Stand For" on `/about`;
  - "Sound" on the 404 page;
  - the LeadMagnet popup's "CZABA" eyebrow (keep-list: restyle only, so text and behaviour are unchanged [K23]).
- **Nothing moves.** Every word box, heading box and line count equals HEAD [K10].
- **Nothing else changes:** no other page, no Studio file, no token value, and the obsidian block is byte-identical [K8].

## Reference
- **Store spec:**
  - `store-redesign-spec.md`, row STORE-2: "Remove the 6 blur glow blobs, **the gradient text** and `shadow-glow`. Text brightness: titles #ECE6DA…".
  - Spec l.18 allows "removal of glow and gradients" on keep-list items [K26]; their content, behaviour, timing and placement stay.
  - Direction A ("Obsidian & Brass gallery", `direction-decision.md`) has one accent, brass.
- **`product-designer` consult (this planning):**
  - **Chosen: option A, solid light ink.** The gradient was decoration, not meaning. Round 447 already put titles and the loader wordmark in light ink.
  - **Rejected B, a brass word.** Brass in heading text stops marking clickable things, reads as a link and weakens the brass CTAs.
  - **Rejected C, muting the rest of the heading.** It lowers title contrast.
  - **Exception: none.** The designer would prefer caption grey for the LeadMagnet eyebrow. The popup is restyle-only, so it takes light ink and Saba is asked once (SABA-Q-LEADMAGNET-EYEBROW-TONE; the light-ink default ships).
  - **States the designer named:** the pages above at 1440, 1280 and 375; text selection; forced-colors; WebKit; no leftover gradient; the same line wraps. Each is a C row below. WebKit is a Tech Lead row because there is no WebKit in the cloud.
- **Ableton:** does not apply (Store marketing typography).

**Deviations:** none from the spec.

**Screen budget:** no element is added, moved or removed. Only the paint of 8 existing words changes.

## Ruling lines (L4)
- **"Keep-list: restyle only" vs removing the class token in `LeadMagnetPopup.tsx`:** the class removal wins. It is a paint-only restyle. The text, the remaining classes `tracking-[0.5em] uppercase` [K22], the DOM and the behaviour stay. C5 checks the dialog against HEAD.
- **"Dead code is not restyled" (the round-447 rule) vs "no file names the retired class":** the dead-code rule wins.
  - `ArtistBioSection.tsx`, `TestimonialsSection.tsx` and `VideoShowcase.tsx` have 0 importers outside the barrel [K5]. They keep their `text-glow` token, allow-listed with exact counts (GT3) and guarded against re-import (GT5).
  - The dead rule `.loading-brand` keeps its clip, allow-listed (GT1). Its consumer, `PianoLoadingAnimation`, has 0 importers [K5].
- **`.product-detail-title` (0 users [K5b]):** its 4 gradient declarations are removed, because they read the removed token. Nothing else of that rule changes.
- **`.hero-title-glow` `text-shadow`:** it reads `--primary-hue`, which is defined nowhere [K7], so it paints nothing at HEAD. Its removal changes no pixel.
- **The `span` elements stay.** Only their `className` goes, so the DOM tree is unchanged. NM2 (`studio-naming.test.tsx`) reads `heading.querySelector('span')`; only its title text changes [K9b].
- **Tests:** `store-header-footer.test.tsx` asserts no `.text-glow` in the header [K9]. It stays as is and still passes.

## 1. Changes (A applies `b-round-448/sketch-449.patch.txt`; its sha256 is in `b-round-448/sketch-review.md` [K12])

| # | File | Change |
|---|---|---|
| 1 | `app/styles/app.css` | • the `--gradient-text` token is removed. It has 1 definition + 4 `var()` reads [K6]<br>• the `.text-glow` and `.hero-title-glow` rules are removed<br>• `.product-detail-title` loses `background: var(--gradient-text)` and its 3 clip/fill lines<br>• nothing else changes; the obsidian block stays byte-identical [K8] |
| 2 | `app/styles/base/utilities.css` | its duplicate `.text-glow` rule and comment are removed [K3] |
| 3 | `app/components/home/HeroSection.tsx`, `app/components/home/NewsletterSection.tsx`, `app/components/home/StudioShowcase.tsx`, `app/components/marketing/LeadMagnetPopup.tsx`, `app/routes/$.tsx`, `app/routes/_index.tsx`, `app/routes/about.tsx` (×2) | the `text-glow` / `hero-title-glow` class token is removed from each span [K4] |
| 4 | NEW `app/lib/__tests__/store-gradient-text.test.ts` (node) | GT1–GT5 [K24] |
| 5 | `app/lib/__tests__/studio-naming.test.tsx` | NM2 **title only**: "with the glow on Studio" → "with the emphasised span on Studio" [K9b]; its assertions are byte-identical |
| 6 | NEW doc `docs/implementation/2026/quarter-IV/294-store-2b-3a-gradient-text.md` [K16] | see A step 4 |

**Tests.** Every row has a named mutant that turns it red (`b-round-448/mutant-M*.log` [K13]); M6 is the green control:

| Row | Checks | Mutant → red rows |
|---|---|---|
| GT1 | A rule-aware scan of `app.css` + `styles/base/*`: no rule paints text through a background clip or a transparent text fill (case-insensitive, any spacing, `padding-box, text`, `#0000`), except the dead `.loading-brand` at exactly 3 | M4 (`-webkit-text-fill-color: transparent` alone on a new rule) → GT1; M5 (`.loading-brand` loses a line) → GT1; M9 (`background-clip : padding-box, text`) → GT1 |
| GT2 | `--gradient-text` is neither defined nor read in any app CSS/TS/TSX | M2 (token restored) → GT2 |
| GT3 | only the 3 dead home sections name `text-glow`/`hero-title-glow`, each exactly once | M3 (`_index.tsx` span gets `text-glow` back) → GT3; M7 (a dead file loses its token) → GT3 |
| GT4 | the scan is non-vacuous: both CSS files are read, ≥ 200 TS/TSX sources, and the parser self-test (nested `@media`, comment, upper case, space before the colon, value list, `#0000`) files 5 hits under the right selectors | M8 (the parser reads the outer selector) → GT4; M11 (the old case-sensitive regex) → GT4 |
| GT5 | the 4 dead components (`ArtistBioSection`, `TestimonialsSection`, `VideoShowcase`, `PianoLoadingAnimation`) are named in no TS/TSX outside their own file and the 3 barrels | M10 (`ArtistBioSection` added to the `_index.tsx` import) → GT5 |
| — | control | M1 (the `.text-glow` rule restored in `utilities.css`) → GT1 GT2 GT3; M6 (the clip inside a CSS comment) → none |

## 2. A: steps
1. **Claims, before editing.** Run `bash b-round-448/claims-449.sh`.
   - K1–K15 and K17–K30 must equal `b-round-448/claims-449-planning-output.txt`, except K20, which reads `rc=0`.
   - K16 must read `absent prefix-294-files=0`, and K19 must read 0 outside and 0 inside the grants.
   - Otherwise STOP (L11).
2. **Apply the sketch.** Check `b-round-448/sketch-449.patch.txt`'s sha256 against `sketch-review.md` (K12), then `git apply` it. If it does not apply cleanly, STOP; do not hand-port.
3. **Mutants, on a scratch, never in the store tree.**
   1. `git clone --shared` the store at `48e16b8` into `/tmp/a449-scratch`.
   2. Apply the sketch, symlink `node_modules` and commit.
   3. Run `SRC=/tmp/a449-scratch OUT=<a-round-449 dir> bash b-round-448/run-mutants.sh`.

   Each mutant must be red on exactly K13's rows. Save `a-round-449/mutants.txt`.
4. **Doc 294**, in Georgian with English technical terms.
   - Format:
     - l.3 is `**თარიღი:** 2026-11-11`.
     - l.4 is exactly `**სტატუსი:** In Progress (stage 2b-3a of STORE-2b; C round 449 PASS)` (L28).
     - The seven TEMPLATE headings appear in order (L26).
   - Content:
     - The 2b-3 split.
     - Why the dead sections and `.loading-brand` are allow-listed, not restyled.
     - The `product-designer` ruling (light ink, brass rejected).
     - The HEAD measurement: teal ink 34–80 %, boxes equal.
     - The tests GT1–GT5 and the NM2 title. The mutants and the browser probe are process evidence, not repo tests.
     - A line that `docs/design/star-brand-audit.md` (its `text-glow` lines [K25]) is superseded by this stage. Do not edit that file: it is outside the grants, and STORE-5 updates the design docs.
   - TODO:
     - 2b-3b, 2b-3c, 2b-3d and 2b-4;
     - LEGACY-DEAD-STORE-COMPONENTS (now also the 3 home sections, and Saba's question on the testimonials);
     - TLM-R449-WEBKIT-HEADING-INK;
     - the TL-R449 deferred Lows.
   - Cite only test ids that exist.
5. **Checks** (speed rules; no full suite):
   - `npx vitest run $(cat b-round-448/covering-449.txt)`: all green. A red file, or a test slower than 50 % of its timeout, is a STOP (L11).
   - `npm run typecheck`: rc 0.
   - `npm run lint`: rc 0, with warnings ≤ 205, which is HEAD [K14d].
   - `npx biome check` on the changed TS/TSX paths: rc 0, with 2 warnings, the same as HEAD on those files [K14d].
   - `npm run build`: rc 0.
   - code-reviewer (3+ files).
6. **Browser re-measure, with the dev server on `:5173`.**
   - **Preconditions:** the mock API answers on `:5199`; if it does not, start `node tmp/studio-real-loop/mock-api/server.mjs`. B's HEAD capture was taken with it up. Warm the server first with `node b-round-448/probe/warm.cjs http://127.0.0.1:5173 /studio-lab /studio/middle-east /` (L38).
   - Run `node b-round-448/probe/gradient-text-probe.cjs http://127.0.0.1:5173 a-round-449/gt-tree.json 1440,1280,375 a-round-449/shots`.
   - Then run `python3 -I b-round-448/probe/compare-gt.py b-round-448/probe/gt-head.json a-round-449/gt-tree.json x`. It must end `ROWS 24 ALL_OK True`.
   - A `NOT FOUND` row is environment-invalid: B saw it on the first 1440 page after each server start [K28]. Rerun it.
   - If a row fails on `boxSame` only, capture HEAD yourself (`bash b-round-448/probe/serve-tree.sh start /tmp/a449-head 5178 /home/runner/czaba-project/store 48e16b8`, warm it, run the probe) and compare against that. A mismatch that persists against your own HEAD is a STOP (L11).
7. **Claims, after editing.** Run `bash b-round-448/claims-449.sh`.
   - Only K3, K3b, K4, K6, K9, K9b, K16, K19, K21 and K24 may differ from the planning output (K2 differs only on B's committed scratch).
   - K3, K3b, K4, K6, K9, K9b, K21 and K24 must equal `b-round-448/claims-449-sketch-output.txt`.
   - K16 must be the new doc's l.4, and K19 must read 0 outside and 12 inside the grants.
   - Save the diff as `a-round-449/claims-diff.txt`.
8. **`git status`** shows only paths in `b-round-448/grants-449.txt` [K19].

## 3. C: acceptance rows
**Setup:**
- Use real Chromium (Playwright).
- **Warm-up:** run `node b-round-448/probe/warm.cjs <base> /studio-lab /studio/middle-east /` on each server before its first timed probe (L38). B's first C12 run on fresh servers timed out on `/studio-lab` (`b-round-448/probe/c12-run/invalid-cold/`).
- **Servers:**
  - Dev server on `http://127.0.0.1:5173`.
  - Mock API on `:5199`. If it is down, start it with `node tmp/studio-real-loop/mock-api/server.mjs`.
  - HEAD control: `bash b-round-448/probe/serve-tree.sh start <c-round-449 dir>/head 5178 /home/runner/czaba-project/store 48e16b8`. It runs `git archive` of HEAD with its own Vite `cacheDir` (L38). Use it instead of `sketch-server.sh`, whose patch mode is a silent no-op.
- **Probes:** copy `b-round-448/probe/*` into `c-round-449/` before changing anything (L60).
- **Run order:** HEAD and tree probes one at a time, never both at once. Warm each server with one untimed browser load of `/` and `/studio-lab` before any timed probe (L38).

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all` | only `grants-449.txt` paths [K19]. Unchanged [K18]: `app/root.tsx`, `app/components/studio/**`, `app/styles/studio.css`, `app/styles/pages/**`, `app/contexts/**`, the protected routes and the 3 dead home sections |
| C2 CLAIMS | `bash b-round-448/claims-449.sh` vs `claims-449-planning-output.txt` | only the K ids in A step 7 differ, and those equal `claims-449-sketch-output.txt`. K3 app.css 12 → 3, utilities 3 → 0; K6 5 → 0; K8 unchanged (obsidian block sha `e9afeed85faec382`) |
| C3 HEADING-INK (the change) | `gradient-text-probe.cjs` on HEAD `:5178` and tree `:5173` at 1440, 1280 and 375, then `compare-gt.py <head.json> <tree.json> x` | `ROWS 24 ALL_OK True`, i.e. for each of the 8 words × 3 viewports:<br>• HEAD: fill transparent, a gradient `background-image`, teal ink ≥ 0.2 [K10]. B's lowest is 0.338; HERO over 3 replicates per viewport stays at 0.341–0.349 / 0.654–0.656 [K28]<br>• tree: fill `rgb(236, 230, 218)`, `background-image: none`, teal ink ≤ 0.01, core ink within 8 per channel of (236, 230, 218), core-ink contrast ≥ 4.5 (B's sketch: 13.6–15.7)<br>• span box, heading box and line count identical to HEAD<br>Keep the crops of both trees |
| C4 DEFAULT-MOTION | the same probe with `reducedMotion` left at the browser default (copy the script and drop that option), at 1440, `/` and `/about` only | `record`: fill and teal ink as in C3 once the reveal settles; a word still mid-animation is re-sampled after 3 s |
| C5 LEADMAGNET (keep-list) | `lm-dialog.cjs <out> http://127.0.0.1:5178 http://127.0.0.1:5173` (opens the popup by scroll + timer at 1440); also C3's LEADMAGNET rows | dialog text, tag sequence and box equal HEAD [K23]; the eyebrow is light ink, 0 teal; a screenshot of the open dialog on both trees |
| C6 SELECTION | `node b-round-448/probe/extras-probe.cjs <base> <out.json> <shotDir>` on the tree (and HEAD as the control), at 1440: it double-clicks "Releases" and "Cinema" | `selection.<id>.selected` is the word; the highlight covers the crop: `bluishFraction` ≥ 0.5 (B's sketch: 0.754 and 0.829; HEAD 0.756 and 0.831 [K29]) |
| C7 FORCED-COLORS | the same run, `forced` part (`forcedColors: 'active'`): `/` hero, "Releases" and `/about` "Cinema" | `forcedMediaMatches` true; tree fill `rgb(236, 230, 218)` and `inkFraction` ≥ 0.5 (B's sketch: 0.79–0.82 [K29]); HEAD: `record` (fill transparent, ink is drawn by forced colours) |
| C8 WEBKIT | Safari | BLOCKED "no WebKit on the cloud runner"; listed under `blocked`; TLM-R449-WEBKIT-HEADING-INK |
| C9 STUDIO 0 px | `studio-pixel.cjs <out> <shots> http://127.0.0.1:5178 http://127.0.0.1:5178 http://127.0.0.1:5173 http://127.0.0.1:5178` | every pair 0 px at 1440 and 1280 [K11]. A HEAD-vs-HEAD pair above 0 means the control is invalid (L37) and the run is replaced, with at most 2 replacement attempts. B saw it once, unexplained: in `b-round-448/probe/studio-pixel-run1-INVALID.json` the second HEAD shot at 1440 differed from the first in every pixel while HEAD-vs-sketch was 0; the rerun overwrote those PNGs. A warm-up is not proven to prevent it |
| C10 COVERING | `npx vitest run $(cat b-round-448/covering-449.txt)` | green, with the counts recorded (B's sketch: 16 files / 190 tests [K14c]) |
| C11 MUTANTS | `SRC=<C scratch> OUT=<c-round-449 dir> bash b-round-448/run-mutants.sh`, where the C scratch is a `git clone --shared` at `48e16b8` with A's diff applied **and committed** (the runner clones `$SRC`, so uncommitted files never reach the mutants), never the store tree | each mutant red on its K13 rows; BASE and M6 green |
| C12 STUDIO + PURCHASE PROTECTION | after the warm-up, from inside `c-round-449/` (the script writes `shots/<tag>-*.png` relative to the working directory, so create `shots/` there): `node <your copy>/c12-from-c448.cjs http://127.0.0.1:5178 head > c12-head.json` and `… http://127.0.0.1:5173 tree > c12-tree.json` | for each of 1440 and 1280:<br>• `/studio-lab`: `clips` 1, `playState` Playing with `posPlay` > 0, `stopState` Stopped, `stopHeld` true<br>• anonymous `/studio/middle-east`: `audioSrc` 0, `media` 0, the text contains "Sign in required"<br>All values equal HEAD (B's run on HEAD and sketch: `b-round-448/probe/c12-run/c12-summary.txt` [K30]) |
| C13 DOCS | doc 294 | l.4 exact; TEMPLATE headings in order; every GT/NM id it cites exists in the test files; the `star-brand-audit` supersede line is present; no `pending` |

- **Gate rows** (full vitest, typecheck, build, Biome, verify) are `gate` and are not claimed by C.
- **`c-round-449.json`:**
  - Write **all L57 fields**, and run `python3 -I tools/l57-check.py c-round-449.json c-round-449/l57-check.txt` (rc 0) before hand-off.
  - Every finding has an `origin`.
  - `mutantRedOnSketch` = `b-round-448/mutant-M1.log` … `mutant-M11.log`.
  - `affectedChecksRunOnSketch` = `b-round-448/precheck-covering.log` and `b-round-448/probe/gt-compare.txt`.

**Neighbours that could break:**
- The home sections' reveal animations. C3 compares boxes and C4 records default motion.
- The LeadMagnet dialog: covering tests `store-lead-magnet-dialog`, `store-lead-magnet-routes` and `store-focus-ring`, plus C5.
- `studio-naming` NM2.
- The header test's `.text-glow` absence assertions [K9].
- Any Studio surface that imports `app.css` (C9).
- The e2e specs that visit `/` or `/about` [K27] are not gate rows; B's full suite on the sketch is green [K14b].

## 4. Claims
- **Script:** `b-round-448/claims-449.sh` (K1–K30). Planning output: `b-round-448/claims-449-planning-output.txt`. Sketch output (`STORE_ROOT=/tmp/b449-scratch`): `b-round-448/claims-449-sketch-output.txt`.
- **Probes** (in `b-round-448/probe/`):
  - Scripts:
    - `gradient-text-probe.cjs` and `compare-gt.py`;
    - `lm-dialog.cjs`;
    - `studio-pixel.cjs`;
    - `serve-tree.sh`;
    - `c12-from-c448.cjs`;
    - `warm.cjs` and `extras-probe.cjs`.
  - Outputs:
    - `gt-head.json`, `gt-sketch.json`, `gt-sketch-1440.json` (the first sketch run's 1440 `/` rows were a cold start; they were rerun) and `gt-compare.txt` [K10];
    - `lm-dialog-sketch.json` [K23];
    - `studio-pixel.json` [K11] (and `studio-pixel-run1-INVALID.json`);
    - `shots-head/` and `shots-sketch/` [K15];
    - `hero-replicates.txt` [K28], `extras-sketch.json` / `extras-head.json` [K29], `c12-run/c12-summary.txt` [K30].
- **Sketch pre-check** (v3):
  - `precheck-typecheck.log`, `precheck-lint.log` (205 warnings = HEAD) and `precheck-biome-scoped.log` vs `precheck-biome-head.log` [K14, K14d];
  - `precheck-covering.log` (16 files / 190 tests) [K14c];
  - `precheck-full.log` [K14b];
  - `precheck-build.log` [K14];
  - `git apply --check` on the store tree: rc 0.
- **Mutants:** `run-mutants.sh`, `mutants.txt` and `mutant-M1.log` … `mutant-M11.log` [K13].
- **Review:** `sketch-review.md` [K12]. v2 got APPROVE-WITH-CHANGES; both Mediums were fixed in v3; the delta review gave APPROVE. v2 artifacts are in `v2-superseded/`.
