# Round 471: STORE-2c-1, the store font family tokens (Instrument Sans / IBM Plex Mono)

**Planned by:** B, at the round 470 → 471 planning on 2026-11-12 (`b-round-470.md`).
- The advisor was available and consulted after orientation.
- `product-designer` was consulted on the STORE-2c split (`b-round-470/pd-2c.md`).
- The round-470 task is archived as `tasks/round-470.md`.

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1656: round 470 is accepted.**
  - C PASS; gate 470 published `5cd9645` [K2].
  - C-R469-01 is closed.
  - SABA-B-15 is now "home cause fixed in cloud". It stays open until TLM-R468-SABA-SCROLL-DEVICE is answered.
- **D-29z1657: ruling on C-R470-F1.**
  - A "cluster" means ≥ 2 slow frames inside one band in the same pass, recurring in ≥ 2 passes.
  - The isolated y≈372 frame is not a cluster: it also appears on HEAD and on a no-glow build. It goes to `deferred_low_polish` as a Low.
- **D-29z1658: STORE-2c is split, with nothing dropped:**
  - **2c-1:** family tokens (this round).
  - **2c-2:** display weight 500 with size tracking on `:lang(en)`, plus the body 17/1.5 and caption colours, and the `font-serif`/`font-bold` heading sweep. It must land within 3 rounds of 2c-1.
  - **2c-3:** Plex Mono metadata.
  - **2c-4:** delete the Inter and Playfair files, their OFL licences and notices, and update the FN/TL rows.
- **D-29z1659: this dispatch.**
  - The legacy `/studio/<handle>` route inherits the new fonts through the cascade, with no protected-file edit. This is accepted as the product-designer default, and Saba is asked once in `user-review/questions-round-470.md` Q1 (L44).
  - Regression is not due: `regression-last.json` is dated 2026-11-10 [K7] and this planning is dated 2026-11-12. The next planning dated 2026-11-13 or later is REGRESSION-2026-11-13.

## Rules
- **Read `lessons.md` first.** These apply especially:
  - L3 (font change → widest-state boxes with the old font as control);
  - L12 (no styling-class selectors in tests);
  - L20 (glyph coverage and platform font);
  - L23 (test collisions are granted, not met by A);
  - L26/L28 (the doc);
  - L29 (`[K#]` claims);
  - L54 (journey row);
  - L58 (asserted numbers come from B's sketch run).
- **Claims script:** `b-round-470/claims-471.sh`. B's output is in `b-round-470/claims-471-planning-output.txt`.
- **Screen budget:** nothing persistent is added. The font changes; no text, label or control does.

## Product promise and why now
- **The promise (spec l.9):** the store and the Studio share one palette and one type system. Instrument Sans is the UI face, IBM Plex Mono is used for numerals, Noto Sans Georgian is the fallback, and there is no display serif.
- **Why this is possible now:**
  - PERF-7 already self-hosts every face, and `root.tsx` loads `fonts.css` globally.
  - So the earlier `root.tsx` dependency (b-round-191 §8) is gone for font loading.
  - Only the Lenis reduced-motion part still needs root, and that is in STORE-2d.

## Reference: how the reference stores do it
Source: `docs/technical/store-redesign/research/`, read 2026-11-12.
- **One display face and one text face; mono for technical labels.**
  - Nothing uses uppercase mono at 11–14 px for labels (`luxury-and-galleries.md` l.129).
  - Aesop has one grotesk that "does almost all the work" (l.138).
  - Epidemic and Splice show typographic restraint: one display face and one weight (`competitors.md` l.461).
- **Size-dependent tracking:** large type is tracked negative (−0.015em at 80 px) and small type positive (`luxury-and-galleries.md` l.17, l.268). This lands in 2c-2, not here.

**Deviations:**
- **Intermediate state.** For at most 3 rounds the headings keep their current sizes and weights in Instrument Sans: 700 renders with the 600 face, and the tracking is unchanged. Reason: product-designer chose to bisect the family change from the scale change (`pd-2c.md` Q1). "Simpler" is not the reason.
- **Old faces stay on disk.** Inter and Playfair stay self-hosted until 2c-4. Nothing requests them any more (K12).

## Baseline
- HEAD `5cd9645`, clean tree: 0 status lines, empty diff [K1].
- Protected manifest rc 0 [K8].
- Today [K3]:
  - `app/styles/app.css` l.122 is `--font-sans: 'Inter', system-ui, sans-serif;`;
  - l.123 is `--font-serif: 'Playfair Display', Georgia, serif;`;
  - l.337 (the `body` rule) is `font-family: 'Inter', -apple-system, …`.
- The Studio obsidian block starts at l.1623. Its l.1643–1644 hold the Instrument Sans and Plex Mono stacks [K10].
- Faces: Instrument Sans ships weights 400/500/600 only, and Plex Mono ships 400 only [K9].

### Grants (exactly these paths)
| Path | What |
|---|---|
| `app/styles/app.css` | Only the store `@theme` typography lines l.122–123 (plus one new `--font-mono` line after them) and the `body` rule's `font-family` line l.337. Nothing else, and the obsidian block stays byte-identical |
| `app/lib/__tests__/self-hosted-fonts.test.ts` | Only the sketch's change: the new `TOKEN_FONT_FAMILIES` constant, FN4's first assertion plus its containment loop, and the new FN6. FN1–FN3 and FN5 stay unchanged (L23 collision: HEAD's FN4 goes red on the swap; `b-round-470/sketch-vitest.log` shows the first attempt) |
| `docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md` | New, in Georgian (L26) |

**Unchanged:**
- `fonts.css` and every woff2 or licence file;
- `root.tsx`, `third-party-licenses*`, `store-theme-tokens.test.ts` and `studio-theme-obsidian.test.tsx`;
- every component, including every `font-serif`/`font-bold`/`font-mono` class (45 `font-serif` uses stay for 2c-2 [K14]);
- the keep-list (LeadMagnet, Free Samples, SpecialOffers, Limited badges, testimonials and stats);
- every protected file.

### Rulings
- **R-471-1: the store stack equals the obsidian stack.** `--font-sans` and `--font-serif` are both exactly `'Instrument Sans', 'Noto Sans Georgian', system-ui, sans-serif`, and `--font-mono` is exactly the l.1644 value.
- **R-471-2: the reflow rule (one element, one rule, L4).** B's wide probe (`b-round-470/type-probe2.cjs`, summary `type-probe2-summary.txt` [K15]) compares every visible text element between HEAD and the sketch on 8 pages × 3 viewports. The element lists match one to one.
  - **Paragraphs** (`p`, `li`, `dd`) may reflow in either direction. They are listed, never a FAIL. Instrument Sans sets narrower than Inter, so most paragraphs lose a line.
  - **Exactly three accepted growths, all at 375:**
    - `/about` h1 "Crafting Sound for Cinema" goes 2 → 3 lines;
    - `/` h3 "The Complete Collection" goes 1 → 2;
    - `/about` stat label "Sounds Delivered" goes 1 → 2.

    2c-2 and 2c-3 re-measure them, because the display scale and the mono labels change them again.
  - **Any other line increase** of a heading (`h1`–`h4`) or of a one-line `a`/`button`/`span`/`label` is a FAIL. So is any new clipped element or any horizontal overflow.
- **R-471-3: the legacy `/studio/<handle>` route inherits the new fonts** (D-29z1659, Q1 open with Saba). This is not a bug in this round.

## 0. The sketch (B, L58)
**`b-round-470/sketch-471.patch.txt`** (sha256 starts `358dcb8179b8e039` [K5]) applies to HEAD with `git apply --check` rc 0 [K4]:
- **app.css:**
  - l.122–123 become the Instrument Sans stack;
  - a new l.124 `--font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;`;
  - the body `font-family` becomes `var(--font-sans);`.
- **self-hosted-fonts.test.ts:**
  - `TOKEN_FONT_FAMILIES = ['IBM Plex Mono', 'Instrument Sans', 'Noto Sans Georgian']`;
  - FN4 asserts that the token families equal this list and are each contained in `SELF_HOSTED_FONT_FAMILIES`;
  - the new **FN6** asserts that `body {\n  font-family: var(--font-sans);` exists and that `app.css` matches neither `'Inter'` nor `'Playfair Display'`.

**B's measurements on the sketch** (production builds of HEAD and the sketch, `b-round-470/type-probe.cjs`; summary in `type-probe-summary.txt`):

| Check | Result | Source |
|---|---|---|
| 4 covering test files on the sketch | 126 passed | K11 |
| Mutant: the new test against HEAD's `app.css` | FN4 and FN6 red | K11 (`mutant-head-css.log`) |
| `scrollWidth === clientWidth`, 8 pages × 1440/1280/375 | 24/24 | K12 |
| Font responses | Only `instrument-sans-latin` and `ibm-plex-mono-latin`, all 200. No `inter-*` and no `playfair-*` | K12 |
| CDP platform font of the h1 | Instrument Sans on 24/24 | K12 |
| First-heading height change | Only `/about` at 375: +48 | K12 |

Pages: `/`, `/store`, `/products/middle-east`, `/free-downloads`, `/gift-cards`, `/about`, `/faq`, `/studio/middle-east`.

## 1. A: steps
1. **STOP (L11) if the start state is wrong.** Check all of these:
   - HEAD is `5cd9645`;
   - `git status --short --untracked-files=all` is empty;
   - the protected manifest gives rc 0;
   - `git apply --check` on the sketch gives rc 0.
2. **Apply the sketch from the store root:** `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-470/sketch-471.patch.txt`.
   - Do not tune. Any other change is a STOP for B.
   - Read `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md` first. `git apply` bypasses the hook (A-R470).
3. **Write doc 306** in Georgian, with the seven TEMPLATE headings in order. l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 4; C round 471 PASS)` (L28). Content:
   - **კონტექსტი:** spec l.9, why now (PERF-7).
   - **მიდგომა:** R-471-1…3; the 2c-1…2c-4 split with product-designer's rejected options; the 600-face fallback for 700.
   - **შეცვლილი ფაილები.**
   - **ტესტირება:** FN4 and FN6, B's numbers attributed to B.
   - **TODO:** 2c-2 (≤ 3 rounds), 2c-3, 2c-4, and Saba Q1.
   - Cite only test ids that exist (L26).
4. **Run the checks** (A's speed rules). Save the logs under `a-round-471/`:
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run app/lib/__tests__/self-hosted-fonts.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/__tests__/third-party-licenses.test.ts`.
5. **Ask `code-reviewer`** (3 changed files) and include its Architecture note.
6. **Report** in `a-round-471.md`: the diff stat, the logs and the reviewer's findings.

## 2. C: what to verify
**Files.** Write `c-round-471.md`, `c-round-471.json` (with the L57 fields) and `c-round-471/progress.json` as you go.

**Builds.** Make two scratch production builds under `c-round-471/`:
- **HEAD** (`git archive 5cd9645`);
- **TREE** (HEAD plus `git -C store diff` applied with `patch -p1`, plus `cp` of the untracked doc).

Start the mock API with `node $(realpath mock-api/server.mjs)` if :5199 does not answer.

**Probe.** `b-round-470/type-probe.cjs` is the starting probe: `node type-probe.cjs <out.json> <shotDir> head=<url> tree=<url>`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | COMPUTED (browser, 1440, 1280, 375) | `type-probe.cjs` on the 8 pages | TREE: body and h1 `font-family` start with `"Instrument Sans"`. The CDP platform font of the h1 is Instrument Sans on 24/24, and the `.font-mono` platform font is IBM Plex Mono on `/`, `/store` and `/gift-cards` [K12]. Every text element's family is Instrument Sans or IBM Plex Mono (`type-probe2`) [K15]. HEAD shows Inter or Playfair (control) |
| C2 | NETWORK | The same run | TREE requests no `inter-*`/`playfair-*` woff2, and every font response is 200/304 [K12]. The HEAD control requests `inter-latin` on every page and `playfair-display-latin` on every page except `/studio/middle-east` |
| C3 | OVERFLOW + REFLOW (L3, R-471-2) | `node b-round-470/type-probe2.cjs <out.json> head=<url> tree=<url>` and the same comparison as `type-probe2-summary.txt` | 0 horizontal overflow and 0 newly clipped elements on 24/24. Heading and one-line-control line increases are exactly the three R-471-2 growths. Paragraph reflow is listed only |
| C3b | CLS (browser, `type-probe2`) | Buffered `layout-shift` without input, until 2.5 s after load | TREE CLS < 0.1 on every page × viewport. B measured ≤ 0.0216 on the sketch and ≤ 0.0221 on HEAD [K15]. Record each value next to HEAD's |
| C3c | LONG TITLE (browser) | `type-probe2` replaces the product h1 with an 87-character title | TREE: the same line count as HEAD (3 at 1440 and 1280, 4 at 375) [K15]; h1 and page overflow 0 |
| C4 | KEEP-LIST (browser, 1440 and 1280; screenshots HEAD vs TREE) | `/`: SpecialOffers, the "Limited" badges, testimonials and stats ("2,500+ Happy Customers", "Netflix Original Score"). `/store` cards, including any "Limited" or "Exclusive" badge, price and BPM. The LeadMagnet "FREE DOWNLOAD" popup, opened (wait for its auto-open, or trigger it as earlier rounds did), with focus moved into it by keyboard | Same text. Badges stay on one line, nothing is clipped (`scrollWidth ≤ clientWidth` on each badge or title box), and the focus ring is visible. Layout boxes are within ±2 px, except text-width changes inside a line and the R-471-2 list |
| C5 | WEIGHT (browser, 1440) | A 200 % crop of the home h1 "CZABA" (700) and the `/store` h1 (600), TREE vs HEAD | No faked bold: no smeared stems, and the 700 heading matches a 600 heading's stroke. Record the computed `font-weight`. A visible fake bold is **Medium** |
| C6 | GLYPHS (L20, browser) | `node b-round-470/glyph-and-crops.cjs <dir> head=<url> tree=<url>`: it injects `ქართული — · → € ¼ ↑` at 32 px, waits for `document.fonts.ready`, then reads CDP `getPlatformFontsForNode` | TREE: the 7 Georgian glyphs use **Noto Sans Georgian**, and Instrument Sans carries 10. At most 2 glyphs (the arrows) fall back to a system font: B's sketch run shows `DejaVu Sans:2`, while HEAD sends 7 to DejaVu and 1 to Liberation [K16]. No `.notdef` boxes in the crop |
| C7 | STUDIO-LAB (browser, 1440 and 1280) | `/studio-lab` on TREE | It opens anonymously with the demo. The workspace's computed font-family is unchanged from HEAD (the obsidian block) |
| C8 | LEGACY STUDIO (browser, 1280) | `/studio/middle-east` on TREE vs HEAD. Try the stubbed client path (L36, `page.route`) to reach the loading and transport state | "Sign in required" renders in Instrument Sans; 0 audio src; `/api/studio-token` returns 401. If the stubbed path runs: screenshot of the 9–10 px mono labels (record, R-471-3). If it does not: BLOCKED "backend unavailable in cloud" |
| C9 | JOURNEY (L54, browser, 1440) | `/store` → product page → "Try it in the Studio" → `/studio-lab`, screenshot per step | Each step renders. Store pages use Instrument Sans and the Studio is unchanged |
| C10 | UNIT + MUTANT | In the store: the 4 test files from A step 4. In a scratch copy of TREE, restore HEAD's `app.css` | rc 0 at the tree; the mutant turns FN4 and FN6 red |
| C11 | SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff -U0`; protected manifest; `sed -n 1623,1650p app.css` vs HEAD | 3 paths (2 modified, the doc untracked). `app.css` hunks only at l.122–124 and the body line, and the `+` lines equal the sketch's byte for byte. The obsidian block is byte-identical. No component changed. Protected rc 0 |
| C12 | DOC | Doc 306 | TEMPLATE's seven `## ` headings in order; l.4 exact; cites FN4/FN6 (which exist); names R-471-1…3 and the 2c split |
| C13 | AUTH SMOKE | As round 470 C12 | `/studio-lab` anonymous; premium `/studio/<handle>` shows "Sign in required"; `/api/studio-token` returns 401. The fake-bearer path is BLOCKED (backend unavailable in cloud) |
| C14 | CLAIMS | `bash b-round-470/claims-471.sh` | Equal to `claims-471-planning-output.txt` except K1 (status and diff sha change), K3 (the lines change by design) and K4 (`--check` now fails). K14 is unchanged; a change would mean a component changed, which is a FAIL. No `MISSING` |
| gate | — | Full verify, code review, publish | Root. Not claimed |

## 3. Claims (`b-round-470/claims-471.sh`)
| Claim | What it checks |
|---|---|
| K1 | HEAD, status, diff sha |
| K2 | Gate 470 |
| K3 | `app.css` l.122, l.123, l.337 |
| K4 / K5 | The sketch applies; its sha |
| K6 | The artifacts exist |
| K7 | `regression-last.json` |
| K8 | Protected rc |
| K9 | Font weights shipped |
| K10 | Obsidian block lines |
| K11 | Sketch unit and mutant |
| K12 | Probe 1: overflow, font responses, h1 and mono platform fonts, first-heading height deltas |
| K15 | Probe 2: element lists, line growths, CLS, long title |
| K16 | Glyph probe |
| K13 | `lessons.md` length |
| K14 | `font-serif` count |

## 4. After this round
1. **On C PASS:** STORE-2c-1 is done. **Cap (D-29z1660):** 2c-2 is the next feature round after REGRESSION-2026-11-13 and any fix-up rounds it needs. No other feature stage goes in between. Regression and fix-up rounds do not count toward product-designer's 3-round cap.
2. **Next planning dated 2026-11-13 or later:** REGRESSION-2026-11-13, with every `scope_additions` entry (L6), including REG-STORE-2C-1-FONTS and REG-SCROLL-HOME-FRAMES (now p95).
3. **Then:** STORE-2c-2, 2c-3, 2c-4, STORE-2d, STORE-3, STORE-4, STORE-5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
4. **Root, non-blocking:**
   - ROOT-REQ-DP-GATE-FIRST (with SABA-B-16);
   - ROOT-REQ-ACTIVE-VIEW-STORE-REDESIGN (the active view mislabels STORE-REDESIGN as done);
   - RETRO 480.
