# Round 496: DPG-BUTTON-CLEANUP stage 1. Retire the competing CSS button classes and move their consumers onto `Button.tsx`

**Planned by:** B, at the round 495 → 496 planning on 2026-11-13 (`b-round-495.md`, `b-round-495/checkpoint.md`).
- **Advisor:** available. Consulted after orientation and before hand-off.
- **Archive:** the round-495 task is archived as `tasks/round-495.md`, a byte-identical copy.

## Decisions
All decisions are in `backlog.json` (v488) under `decisions_log_b` [K23].
- **D-29z1772:** round 495 (RETRO) accepted.
  - C PASS, 0 bugs, `browserVerified` true.
  - Gate 495 was `skipped` (no real changes) [K1], so the baseline stays `3bcf8cb`.
- **D-29z1773:** DPG-BUTTON-CLEANUP is split in two stages.
  - **Stage 1 (this round):** the retired CSS classes and their consumers.
  - **Stage 2 (DPG-BUTTON-CLEANUP-2, next):** hand-rolled brand buttons. Saba's "Use Button.tsx component only".
  - **Ruling line (D-29z1771), "account.tsx hold vs the two L8 rows": the hold wins.** The stage-1 inventory has 0 hits in `app/routes/account.tsx` [K19]. So B-R492-PASSWORD-SUBMIT-FOCUS-LOST and GATE488-L3-SAVE-CANCEL-FOCUS-DISABLED stay deferred. They may ride along in stage 2.
- **D-29z1774:** design rulings. See §2.
- **D-29z1775:** grants and the pre-check. See §3 and §6.
- **D-29z1776:** the order after this round. See §7.
- **D-29z1777:** advisor closing-check corrections. C rows were run by B on HEAD and on sketch v2, claims are compared with the sketch run, and the mutant script is saved. Two new ids: B-R496-404-BROWSE-STORE-UNSTYLED (Medium, pre-existing; this round fixes it) and B-R496-HOME-NESTED-BUTTONS-IN-LINKS (Low, deferred).

## Rules
- **Read `lessons.md` first.** The B-side lessons applied here are L1 (inventory before grants), L4 (ruling lines), L10/L58 (sketch review), L23 (collisions, full suite on the sketch), L29 (claims), L54 (journey) and L61 (unlayered rules, hover paint).
- **STOP threshold (L10, the only statement of it):** A writes STOP and changes nothing more if any of these happens:
  - a Medium-or-higher finding (A's own or the code-reviewer's) whose fix is outside the grants;
  - a covering test fails;
  - a frozen-file check is not rc 0;
  - the sketch does not apply cleanly.
  - a granted code file would need a change beyond the sketch (docs are not in the sketch and are granted by §3 item 4).

  Everything else in this task cites this threshold and does not restate it.
- **L29:** every fact about `store/` below carries a `[K#]` tag. Untagged code text is a row id, a loop-artifact path, or a description of what A or C runs.
- **Paths:** the loop root is `/home/runner/czaba-project/tmp/studio-real-loop`, and the store is `/home/runner/czaba-project/store`. Use absolute paths.
- **Out of scope:** the Studio (`/studio-lab`) and the Ableton conformance check. No Studio file changes. This is a Store round, so the reference is the Store research (§1).

## Baseline: HEAD `3bcf8cb`, clean tree
- At planning, HEAD was `3bcf8cb` and `git status --short --untracked-files=all` had 0 lines [K1] [K2]. `git rev-parse HEAD` is the truth.
- **Frozen files:** every tracked file except the 11 granted paths of §3 is listed in `b-round-495/r496-tree-sha256.txt`, **1,394** entries.
  - Check from `store/` with `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-495/r496-tree-sha256.txt`. B got rc 0 [K21].
  - Each of the 11 protected files in `b-round-318/protected-sha256.txt` appears exactly once in that manifest. That file also checks rc 0 [K21].

## 0. Why this round
- **Saba's DPG-FIX P1 item 7 (2026-11-12):** "Delete competing `.button-primary`, `.btn-primary` CSS classes. Use Button.tsx component only."
- DPG P1 comes before STORE-3 and all other work. No Critical is open. The open High (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED) needs root.
- REGRESSION is not due: the last one was 2026-11-13 [K22], and the next is due on or after 2026-11-16.

**What is wrong today** (HEAD browser measurement, `b-round-495/measure/head.json` [K12]):
1. **Three button systems:**
   - unlayered CSS `.btn-primary` (pill);
   - unlayered CSS `.button` + `.button-primary` (6px radius, 24/48px padding, so a 68px-tall "Back to Home");
   - the Tailwind `Button` component (8px radius).

   The rules are at `app/styles/app.css` l.251/266/270 and l.322/333/338 [K3].
2. **Dead utilities.** The unlayered rules beat Tailwind utilities:
   - the Hero's `px-8 py-4` is dead: padding renders 11.2px, not 16px [K9] [K12];
   - the Header needed `!hidden lg:!inline-block` and `!rounded-sm` to win [K8].
3. **A dead class.** The 404 page's "Browse Store" uses `btn-secondary`, which has no CSS rule anywhere [K5]. It renders as plain unstyled text [K12].
4. **No link support.** `Button.tsx` renders only `<button>` [K6], so the four `<Link>` consumers could not use it.

## 1. Reference: how the Store references do it
Source: `docs/technical/store-redesign/direction-decision.md` (direction A, Obsidian & Brass), `research/competitors.md` and `research/visual-pass.md`. The product-designer consult read all three (`b-round-495/consult-product-designer.md`).
- **Primary CTA shape:** direction A's hero has "a brass pill 'Listen'" plus a text link "Open the Studio →" (direction-decision l.8) [K26]. In `visual-pass.md`:
  - Artlist uses a yellow pill on near-black;
  - Epidemic uses black pill buttons plus a secondary grey pill;
  - Spitfire uses a 6px ghost button.
- **Pair pattern:** one filled primary CTA, with the secondary as a quiet text link, not a second filled button (direction-decision l.8 [K26]; luxury research: "one accent … used only for the active state or CTA").
- **Hover and focus:** a fill shift on hover (brand to brand-hover). Focus uses the site's one shared ring: 1.5px brass outline with a 2px offset, `:focus-visible` only; the pointer rule is at app.css l.241 [K24].
- **Deviations:**
  - **D1:** Store CTAs become pills, while dialog and Studio Buttons keep 8px. Two shapes on purpose: brand on Store pages, task focus in dialogs.
  - **D2:** links styled as buttons do not get the `<button>:active` 0.98 scale. Recorded as SIG-R496-LINK-NO-PRESS-SCALE for DPG-INTERACTION-FIX.
  - **D3:** Button's primary text keeps the token name `text-background`, not product-designer's `text-brand-foreground`. Both are #0e0d0c (0 px of change), and keeping it keeps Button byte-identical for its importers. Recorded as PD-R496-PRIMARY-TEXT-TOKEN for DPG-COLOR-CONSOLIDATE.

## 2. Design (product-designer framing; tech-lead mechanism; D-29z1774)
- **Mechanism:** a pure class builder, `buildButtonClassName(params: ButtonClassNameParams)`, exported from `Button.tsx` and from the `~/components/ui` barrel.
  - `Button` itself calls it. Its default output is byte-identical to HEAD.
  - A new opt-in `shape: 'default' | 'pill'` changes only the radius (`rounded-md` → `rounded-full`).
  - Links call `<Link className={buildButtonClassName(...)}>`, so the output is one `<a>`, never a button inside a link.
  - Rejected: a `ButtonLink` component (it would tie `ui/` to Remix) and `asChild`/`as` (it needs type assertions).
- **Radius, the chosen and the rejected options (product-designer):** chosen, an opt-in pill for Store CTAs. Rejected:
  - pill as Button's base radius (about 51 uses in 21 files, including the Studio and Store dialogs, an unmeasured restyle);
  - 8px everywhere (it flattens the hero and the 404 page against direction A);
  - 6px (only the Header's old `!rounded-sm` patch).
- **Per site:**

  | # | Site | After | Box at HEAD → sketch (1440) |
  |---|---|---|---|
  | 1 | 404 "Back Home" (`$.tsx`) | link, `lg` pill | 160×48 → 160×48 |
  | 2 | 404 "Browse Store" | text link: `inline-flex min-h-12 items-center gap-2 text-foreground hover:text-brand`, icon and copy unchanged | 123×48 → 123×48; hover colour none → brass |
  | 3 | `/account/login` and `/search` "Back to Home" | link, `lg` pill | 202×68 r6 → 154×48 pill |
  | 4 | Home Hero "Discover the Collection" | link, `lg` pill + `group` (arrow hover kept); dead `px-8 py-4` dropped | 252×48 → 252×48 |
  | 5 | Header desktop "Sign In" | `Button size="lg" shape="pill" className="max-lg:hidden"`, no `!` | 99×48 r6 → 99×48 pill; `display` none at 1023, shown at 1024 |
  | 6 | Header mobile-menu "Sign In" | `Button size="lg" shape="pill" fullWidth` | full width × 48, pill (no change) |
  | 7 | `AssetListingPage` "Clear Filters" | `Button type="button"` (md). The component has no importer but the barrel [K10]; jsdom/grep only | — |

  The sketch numbers are from `b-round-495/measure/sketch.json` [K13].
  - **Header skeletons:** they match the button. Mobile `h-[44px] rounded-md` becomes `h-12 rounded-full`, and desktop `w-[70px] h-[36px] rounded-sm` becomes `w-24 h-12 rounded-full` [K8]. This is a cheap Low in code the round owns.
  - **Why `max-lg:hidden`:** tailwindcss 4.1.18 [K20] emits `.hidden` before `.inline-flex`, so `hidden lg:inline-flex` would show the button on mobile.
- **Kept:** `shadow-sm` and `active:opacity-90` on primary (DPG-INTERACTION-FIX), and `.btn-icon` (live in the Header, outside the item; DPG-INTERACTION-FIX owns its scale).
- **Ruling lines (L4):**
  - "Header Sign In radius: pill wins over the old `!rounded-sm`."
  - "Hero padding: `size="lg"` wins over `px-8 py-4`."
  - "Store CTA radius: `shape="pill"` wins over the DESIGN_SYSTEM 8px rule. The doc changes in this round (§3 item 4)."
- **Saba:** `user-review/questions-round-496.md` Q1 (delete the dead `AssetListingPage`?) and Q2 (Sign In as a pill or as quiet text). Both defaults are as built; nothing waits.
- **States checklist:** rest, hover, focus-visible (keyboard), focus after a pointer press, active, disabled/loading (#7 only), and Header auth-initialising (the skeleton). These are rows C1–C8.

## 3. A: what to implement
1. From `store/`, run `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-495/sketch-496.patch.txt`. Its sha256 is in `b-round-495/sketch-sha.txt`. The tech-lead review is `b-round-495/sketch-review.md` (v2: APPROVE).
   - The sketch is the code. Do not restyle beyond it.
   - **`app/styles/app.css`:** only the hunks of `b-round-495/sketch-496-appcss.patch.txt`, byte for byte (narrow grant D-29z1775).
2. **Granted code files** (sketch content; see the STOP threshold in Rules). **Ruling line: "code-reviewer Lows on sketch lines vs the sketch-is-the-code rule: the sketch wins."** A lists such Lows under "For B" and does not edit, which keeps the reviewed sha valid. A Medium+ is the STOP threshold.
   - `app/components/ui/Button.tsx`, `app/components/ui/index.ts`;
   - `app/routes/$.tsx`, `app/routes/account_.login.tsx`, `app/routes/search.tsx`;
   - `app/components/home/HeroSection.tsx`, `app/components/layout/Header.tsx`, `app/components/product/AssetListingPage.tsx`;
   - `app/lib/__tests__/store-glow-shadow.test.ts` (GS3 port);
   - new `app/lib/__tests__/store-button-cleanup.test.tsx` (BC1–BC6).
3. **GS3 port (L4 "port preserves HEAD"; no assertion lost; equal or stronger replacements allowed).** Each HEAD pin [K7] maps to a replacement:

   | HEAD pin | Replacement |
   |---|---|
   | ≥ 1 rule body per selector | 0 bodies for the same 5 selectors + `.button` |
   | no glow / teal / `--gradient-primary` / `gradient(` | the same on `buildButtonClassName` primary (default and pill), regex `gradient\|bg-linear\|shadow-glow\|teal\|cyan` |
   | `background: var(--color-brand)` / `color: var(--color-brand-foreground)` | tokens `bg-brand`, `text-background` |
   | hover = brand-hover, no opacity | `hover:bg-brand-hover`, no `hover:opacity` |
4. **Docs (DPG rule 2, same round):**
   - **`docs/design/DESIGN_SYSTEM.md`:** the whole `### Buttons` section, from l.1107 up to `### IconButton` at l.1190 [K14] (L34 whole-section grant). Document:
     - `shape="pill"` (Store CTAs) and `buildButtonClassName` (links styled as buttons, one `<a>`);
     - the size table fixed to the real classes (`sm` px-3 py-1.5, `md` px-4 py-2.5, `lg` px-6 py-3 text-base, 48px);
     - that the CSS `.btn-primary`/`.button-primary` are retired.

     Also update the `--radius-md` comment at l.1062 [K14] to name "Buttons (dialogs, Studio); Store CTAs use pill". No other line changes. Georgian prose, English terms.
   - **New `docs/implementation/2026/quarter-IV/319-dpg-button-cleanup-stage-1.md`** per TEMPLATE. The last doc is 318 [K15].
   - `docs/design/star-brand-audit.md` l.192–196/261 is a dated audit record [K27]. It stays unchanged.
5. **A runs:**
   - `npm run typecheck` and `npm run lint`;
   - `npx vitest run` on the covering set: `app/lib/__tests__/store-button-cleanup.test.tsx`, `store-glow-shadow.test.ts`, `store-header-footer.test.tsx` and `store-hidden-focusables.test.tsx`;
   - the code-reviewer (3+ files).

   Not the full suite (the gate runs it). Write `a-round-496.md`, including the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-496.md`, `c-round-496.json` and `c-round-496/progress.json` as it goes, browser rows first.
- **Environment:** start `node /home/runner/czaba-project/tmp/studio-real-loop/mock-api/server.mjs` if `http://127.0.0.1:5199/__mock/health` is not ok (stop it by PID, never `pkill -f`).
- **Warm-up:** warm `/`, `/no-such-page-496`, `/account/login` and `/search` once (a cold dev server misses the first 1440 load; B saw this on the sketch run).
- **Stubs:** set `localStorage.czaba_lead_magnet_dismissed = '1'` in an init script, so the LeadMagnet does not cover the hero.
- **Harness:** B's harnesses `b-round-495/measure/measure.mjs` (rest, hover, breakpoints, mobile menu) and `probe.mjs` (focus, press, navigation, modal) may be reused (`BASE=http://127.0.0.1:5173 node <script> <outdir> after`). Numbers are compared with `head.json`, `sketch.json` and `sketch2-probe.json`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; the r496 manifest; the protected manifest | Only the 11 granted paths + the new test + doc 319 changed; both manifests rc 0 |
| C1 | REST (browser, 1440×900 + 1280×720) | Computed style of sites #1, #3 (login and search), #4, #5 | bg `rgb(201, 164, 106)`, text `rgb(14, 13, 12)`, radius `9999px`, height 48, 16px / 600, padding 12px 24px; boxes equal `sketch.json` ±1 px (Hero `y` may differ by animation phase; compare width and height) |
| C2 | HOVER (browser, both) | Hover each of #1, #3, #4, #5; hover #2 | bg `rgb(217, 184, 127)` and no opacity change on #1/#3/#4/#5; #2 text turns `rgb(201, 164, 106)` with no box or background |
| C3 | FOCUS (browser, both) | Keyboard Tab to #1 and #2 on `/no-such-page-496`, #5 and #4 on `/`; then a mouse press-and-hold on #1 (move away before release, so no navigation) | Keyboard: `:focus-visible` true, outline `solid` 1px `color(srgb 0.788235 0.643137 0.415686 / 0.8)` offset 2px, equal to HEAD on the same element (B: `b-round-495/measure/head-probe.json` and `sketch2-probe.json`). Press: `:focus-visible` false, outline `none` (equal to HEAD). The ring itself is unchanged this round. No contrast assert is needed; record the crop |
| C4 | BREAKPOINT (browser, 1023 / 1024 / 375) | Header "Sign In" | `display: none` at 1023 and 375, shown (`flex`) at 1024 (`sketch.json`). At 375 open "Toggle menu": the menu Sign In is full width (343 px at 375), 48 tall, radius 9999px. At 1440, click the desktop Sign In: the heading "Sign in" becomes visible (the modal has no `role="dialog"` at HEAD either; detect it by the heading), and Esc hides it (B ran this at HEAD and on the sketch: `*-probe.json` `signinHeadingVisible` true, `signinHeadingAfterEsc` false) |
| C5 | NAV (browser, 1440 + 1280) | Enter on #1, #2 and #4; click "Back to Home" on `/search` | Routes `/`, `/store`, `/store` and `/` (B: `*-probe.json`). Each migrated element (#1, #2, #3, #4) is one `<a>` with no `<button>` inside it. The home page's other 14 `a button` nestings are pre-existing (B-R496-HOME-NESTED-BUTTONS-IN-LINKS, equal at HEAD) and not part of this row |
| C6 | 404 PAIR (browser, both) | Screenshot `/no-such-page-496` against the HEAD crops `b-round-495/measure/head-NF-*` | "Back Home" brass pill + "Browse Store" as a quiet text link, aligned, no wrap |
| C7 | JOURNEY (L54, browser, 1440) | `/` hero CTA → `/store` → back; header Sign In → heading "Sign in" visible → Esc | Screenshots per step; no console errors other than the known cloud ones |
| C8 | SKELETON (grep) | `grep -cE 'h-12 bg-elevated rounded-full animate-pulse' app/components/layout/Header.tsx` from `store/` | 2 (desktop + mobile skeleton) [K28]. The auth-initialising state is transient in the browser, and the sketch adds no skeleton test, so this row is a content check |
| C9 | GREP | The three commands in the block under this table | As stated there |
| C10 | TESTS | `npx vitest run` on the 4 covering files | All pass. BC1–BC6 and GS3 exist with the sketch's titles |
| C11 | MUTANTS | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-495/mutants.sh <copy>` on a sketch-applied git copy outside `store/` (`git archive HEAD` of the round-496 tree, `git init`, commit, symlink `node_modules`); at least M1, M2 and M7 | Each red as in `b-round-495/mutants.txt` (all 8 red on v2) |
| C12 | DOCS | DESIGN_SYSTEM.md `### Buttons` section and l.1062 [K14] vs the live `Button.tsx`; doc 319 sections | Each documented class or size equals the code; no other DESIGN_SYSTEM line changed (`git diff` hunks) |
| C13 | CLAIMS | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-495/claims-496.sh` (default tree = the real store) compared with `b-round-495/claims-496-sketch-output.txt` (B's run on a sketch-applied copy) | No `MISSING`, empty stderr. Expected differences from the sketch output: K1 (the copy's HEAD hash), K18 (both counts are the sketch count once A applies it, so lint-head may read 182), K21 (manifest still rc 0). Doc-driven differences from A's doc edits, not in the sketch: K14 (the `### IconButton` line moves when the Buttons section grows; the radius line stays at l.1062) and K15 (becomes 319). K23 (backlog version) may differ. Any other difference is a finding |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-496.json c-round-496/l57-check.txt` | As C0, then rc 0 |

**C9 commands** (run from `store/`; the table cell cannot hold `|` safely):
```bash
python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-495/scan-button-classes.py app
grep -cE '^\.(btn-primary|button|button-primary)[ :{]' app/styles/app.css
grep -cE '^\.btn-icon' app/styles/app.css
```
PASS: the scanner prints exactly the two `Header.tsx` `btn-icon` lines and `TOTAL 2` (equal to `b-round-495/scan-sketch.txt` up to line numbers), then `0`, then `3`. B checked the second grep on HEAD: it reads 6 there (K3 lists the rule lines), so it is not vacuous.

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, build, Biome and `npm run verify`.
- **Product-designer review mode** (optional, ≤ 7 findings): C may consult it on the C6/C7 screenshots.
- **Neighbours that could break:**
  - the Header nav and cart badge positions at 1024–1440 (C1 box ±1 px);
  - the mobile menu hidden-focusables (`store-hidden-focusables.test.tsx`);
  - the e2e text locators on "Discover the Collection" [K11] (text and href unchanged).
- **L22:** if A STOPs, C runs C0, C13 and C14 only and reports "STOPPED — routed to B".
- **Bugs:** every bug carries an enum `origin` (L57).

## 5. Claims
- **Script:** `b-round-495/claims-496.sh`.
- **B's run:** output in `b-round-495/claims-496-planning-output.txt`; stderr in `claims-496-planning.err`, which is empty.

| Claim | Fact |
|---|---|
| K1 | HEAD `3bcf8cb`; gate 495 `skipped` |
| K2 | 0 status lines |
| K3 | `app.css` rules at l.251, 266, 270 (`.btn-primary*`), 275 (`.btn-icon`), 322 (`.button`), 333, 338 (`.button-primary*`) |
| K4 | scanner TOTAL 14 in 6 files (`b-round-495/scan-head.txt`; mutant proof `scan-mutant.txt`) |
| K5 | 0 `btn-secondary` rules in `app/styles` |
| K6 | `Button.tsx` has one `<button` and the `'font-semibold rounded-md'` element at l.85 |
| K7 | `PRIMARY_BUTTON_SELECTORS` in `store-glow-shadow.test.ts` l.50, used at l.86 and l.101 |
| K8 | `Header.tsx`: `!hidden lg:!inline-block` l.191, `btn-primary w-full` l.259, `h-[44px]` l.251, `w-[70px] h-[36px]` l.117 |
| K9 | Hero `btn-primary group … px-8 py-4` at l.183 |
| K10 | `AssetListingPage` is named only by `components/product/index.ts` and the type file `app/types/filters.ts` |
| K11 | e2e text locators in 3 files; the only test or spec naming a retired class is `store-glow-shadow.test.ts` (the sketch adds `store-button-cleanup.test.tsx`, whose guard regex names them); `Sign In` e2e locators in 4 specs: `header button` + text, `getByRole`, `header .lg\:hidden button`, all still matching |
| K12 | HEAD measure: login box `[619,261,202,68]`, header radius 6px, Hero padding-top 11.2px, Browse Store background transparent, header `display` none at 1023 |
| K13 | Sketch measure: login `[643,283,154,48]`, header radius 9999px, `display` none at 1023 / flex at 1024, Browse Store hover colour brass |
| K14 | DESIGN_SYSTEM.md `### Buttons` l.1107, `### IconButton` l.1190, `--radius-md` l.1062 |
| K15 | Last implementation doc: 318 |
| K16 | Every cited `b-round-495/` artifact exists |
| K17 | Sketch sha ok; pre-check full suite 295 files / 4315 tests, rc 0 |
| K18 | Biome warnings: HEAD 183, sketch 182 |
| K19 | 0 retired class names in `account.tsx` |
| K20 | tailwindcss 4.1.18 |
| K21 | Manifest 1,394 entries rc 0; protected rc 0 |
| K22 | Regression date 2026-11-13 |
| K23 | `backlog.json` v488, last D-ID D-29z1777 |
| K24 | Pointer focus rule at app.css l.241 |
| K25 | `.not-found-actions` at l.1375 (a flex container only) |
| K26 | `direction-decision.md` l.8 names "a brass pill" (outside `store/`; tagged anyway) |
| K27 | `star-brand-audit.md` names `.btn-primary` at l.192, 194, 196, 261 |
| K28 | `Header.tsx` has 0 `h-12 bg-elevated rounded-full animate-pulse` lines at HEAD, 2 on the sketch |

## 6. Pre-check (B, on a sketch-applied scratch copy of HEAD: `git archive 3bcf8cb` + `git apply b-round-495/sketch-496.patch.txt`; the scratch was removed after the run, 326 MB)
- typecheck rc 0 (`b-round-495/typecheck.log`);
- lint rc 0 (`lint.log`);
- full suite 295 files / 4,315 tests rc 0 (`precheck-full.log`);
- 8 mutants red (`mutants.txt`);
- scanner on the sketch (`scan-sketch.txt`);
- browser HEAD vs sketch: `measure/head.json` and `measure/sketch.json` (v2; v1 in `sketch-v1.json`, 0 diffs); focus, press, navigation and modal in `measure/head-probe.json` and `sketch2-probe.json`; crops `measure/*.png`. The first sketch probe run hit a cold dev server; the warm re-run is the one cited;
- claims on the sketch: `claims-496-sketch-output.txt`; mutant script `mutants.sh`.

An earlier full run raced the mutant loop in the same tree and was discarded. The cited log is the clean re-run on sketch v2 [K17].

## 7. After this round (D-29z1776)
1. **DPG-BUTTON-CLEANUP-2:** classify the 115 `bg-brand` lines in `b-round-495/stage2-bg-brand-hits.txt` into buttons and non-buttons, then migrate the Store buttons. Protected files are excluded. If `account.tsx` lines are buttons, the two L8 rows ride along. REGRESSION comes first if planning happens on or after 2026-11-16.
2. **Then the rest of DPG P1:** DPG-CSS-DEDUP (with SIG-R496-UNLAYERED-A-TRANSITION), DPG-COLOR-CONSOLIDATE (with PD-R496-PRIMARY-TEXT-TOKEN) and DPG-FONT-RESOLVE (STORE-2c-2..2c-4).
3. **Then the DP-gate re-run with root, then P2.**
4. **Elsewhere in the queue:** SYS-R495-SHARED-DIALOG when root grants it; STEM-LANES ahead as soon as Saba answers AGREE-STEM-LANES. The next RETRO is round 510.
