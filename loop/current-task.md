# Round 472: STORE-2c-1 fix-up: scope FN4 to the store `@theme` (C-R471-01), then the full round-471 verification

**Planned by:** B, at the round 471 → 472 planning on 2026-11-12 (`b-round-471.md`).
- The advisor was available and consulted after orientation.
- `tech-lead` reviewed the delta sketch: APPROVE (`b-round-471/sketch-review.md`).
- The round-471 task is archived unchanged as `tasks/round-471.md`. Its sections "Reference", "Rulings R-471-1…3" and "B's measurements" still hold and are repeated below where C needs them.

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1661: round 471 result.**
  - C FAIL on the short route (L22: A STOP on an unruled Medium, with a diff). `browserVerified` false; C1–C9 and C12 did not run.
  - Gate 471 skipped. STORE-2c-1 is **not done**.
  - C-R471-01 (alias A-R471-REVIEW-M1) is accepted as **Medium, origin B spec**.
- **D-29z1662: the ruling on C-R471-01 (L10).**
  - **Chosen:** FN4 in `self-hosted-fonts.test.ts`, the file round 471 already granted, reads only the comment-stripped store `@theme {` block. It pins the exact values of the three tokens (R-471-1), and FN6 tolerates whitespace and either quote style.
  - **Rejected: pinning the values in `store-theme-tokens.test.ts`.** That adds a fourth file to the grants and a third copy of the literals that TH2 and ST4 already pin. FN4 is the test the round-471 collision rewrote.
  - The obsidian block is not FN4's job. ST4 and TH2 already turn red on an obsidian mutant (`mutant-obsidian-sans-georgia-siblings.log`).
- **D-29z1663: rulings on the reviewer Lows from A-R471 (L10).**
  - **`.artist-title { font-family: var(--font-serif) }`** at `app.css:745–746`: goes on the STORE-2c-2 sweep list. `--font-serif` cannot be deleted in 2c-4 until it is gone.
  - **CommandPalette `<kbd>` (Plex Mono through preflight; ↵ U+21B5 falls back to another font):** owned by STORE-2c-3 (Plex Mono metadata). C records it in C6 this round; it is not a FAIL here.
  - **FN6 brittleness:** fixed by sketch-472. The residuals SR-472-L1 and SR-472-L2 (an override outside `@theme`, an unquoted `Inter`) go to the STORE-2c-4 FN/TL rewrite.
  - **Stale typography primitives** (`DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `DESIGN_SYSTEM.md`): a "For Saba" proposal only, never a loop edit. The `store.tsx:535` and `PremiumProductCard.tsx` comments go to the 2c-2 sweep.
  - **Georgian faked bold:** not applicable to the store UI today. K15 counts 0 Georgian-script UI strings in store routes and components (all hits are comments). C6 still checks the injected glyphs.
- **D-29z1664: process miss B-R471-SKETCH-UNREVIEWED.** Round 471 shipped a `git apply` sketch with no `sketch-review.md`; `l58-check.py` gives rc 1 on that task (`b-round-471/l58-check-round471.txt`). A's reviewer then found the Medium that a pre-dispatch review was meant to catch. L58 already states the rule, so `lessons.md` does not grow. `claims-472.sh` runs `l58-check.py` on this task and requires `L58 OK`.
- **D-29z1666: doc 306 and the last A-R471 item.**
  - Doc 306 l.48 ("pending C5"), l.49 (Georgian bold), l.94, l.97 and l.106 are granted for rewriting (grant row).
  - **A-R471-REVIEW-INFO-COVERAGE (info):** Plex Mono is about 9 % wider than Consolas (Windows unmeasured), and Cyrillic and Greek lose Inter's coverage. Owners: STORE-2c-3 measures mono widths; STORE-2c-4 records the coverage loss when the Inter files go. The store copy is English today.
- **D-29z1665: this dispatch.** Regression is not due: `regression-last.json` is 2026-11-10 [K7] and this planning is dated 2026-11-12. The first planning dated 2026-11-13 or later is REGRESSION-2026-11-13.

## Rules
- **Read `lessons.md` first.** These apply especially:
  - L3 (font change → widest-state boxes with the old font as control);
  - L10 (STOP rulings above);
  - L11 (STOP on a wrong start state);
  - L12 (no styling-class selectors in tests);
  - L20 (glyphs);
  - L22 (this is not a short route: the STOP is ruled);
  - L26 and L28 (the doc);
  - L29 (`[K#]` claims);
  - L54 (journey row);
  - L58 (sketch, review, mutants).
- **Claims script:** `bash b-round-471/claims-472.sh`. B's output is in `b-round-471/claims-472-planning-output.txt`.
- **Screen budget:** nothing persistent is added. Fonts change; no text, label or control changes.

## Product promise
**Spec l.9:** the store and the Studio share one palette and one type system. Instrument Sans is the UI face, IBM Plex Mono is for numerals, Noto Sans Georgian is the fallback, and there is no display serif. This round only makes the test guard the store tokens. The product change is the round-471 tree, unchanged.

## Reference: how the reference stores do it
Unchanged from `tasks/round-471.md`. Source: `docs/technical/store-redesign/research/`, read 2026-11-12.
- One display face and one text face, with mono for technical labels (`luxury-and-galleries.md` l.129, l.138; `competitors.md` l.461).
- Size-dependent tracking belongs to 2c-2.

**Deviations:**
- **Intermediate state.** For at most 3 feature rounds, headings keep their current sizes and weights in Instrument Sans, so 700 renders with the 600 face (product-designer `b-round-470/pd-2c.md` Q1).
- **Old faces stay on disk** until 2c-4, but nothing requests them.

## Baseline: a dirty tree, not a clean HEAD
- **HEAD** `5cd9645`, published by gate 470. Gate 471 was skipped [K2].
- **The working tree is round 471's result, kept as is (no revert):**
  - exactly 3 status paths: ` M app/lib/__tests__/self-hosted-fonts.test.ts`, ` M app/styles/app.css`, `?? docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md`;
  - tracked diff sha `60a7043de64c22c8` [K1];
  - `app.css` sha `d3af7582d8199712`, equal to HEAD plus the `app.css` part of `b-round-470/sketch-471.patch.txt` [K3];
  - doc 306 sha `367f8bc4e070b99d` [K9].
- **B's round-471 browser numbers still apply.** `app.css` has not changed since the sketch they were measured on (K3 sha), and this round changes only a test and a doc. They are claims K12/K15/K16 of `b-round-470/claims-471-planning-output.txt`.
- **sketch-472 is relative to this TREE**, not to HEAD. `git apply --check` rc 0 [K4].
- The obsidian block now starts at l.1624, and its font stacks are on l.1644–1645 [K10].
- Protected manifest rc 0 [K8].

### Grants (exactly these paths)
| Path | What |
|---|---|
| `app/lib/__tests__/self-hosted-fonts.test.ts` | Only sketch-472's hunks, byte for byte: the `INSTRUMENT_SANS_STACK` and `STORE_THEME_FONT_TOKENS` constants, FN4 (title, `@theme` block read, exact token assert, families loop over the parsed set), and FN6's two asserts. FN1–FN3, FN5 and the round-471 lines outside these hunks stay as they are |
| `docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md` | l.4 becomes exactly `**სტატუსი:** In Progress (stage 1 of 4; C round 472 PASS)` (L28: the re-dispatch grants l.4 to rewrite the round number). Rewrite the M1 problem (l.87–88) as solved: problem, then the D-29z1662 solution. Rewrite the FN4 and FN6 lines under ტესტირება (l.95–96) to describe sketch-472, and add the mutant names with B's results attributed to B. Add SR-472-L1/L2 → 2c-4, `.artist-title` → 2c-2, `<kbd>` → 2c-3 and A-R471-REVIEW-INFO-COVERAGE → 2c-3/2c-4 under TODO. Remove every "B-ს გადაწყვეტილებას ელოდება" line. **Also (D-29z1666):** l.48 drops the "დადასტურებული არ არის; browser-ში C5 ამოწმებს" clause and states the post-PASS fact (L28 form: C round 472 C5 confirmed that Latin 700 renders from the 600 face without a fake bold); l.49 keeps the Georgian fact and adds that the store UI has no Georgian text today (D-29z1663, K15); l.94 becomes the round-472 unit run; the mutant line (l.97) lists B's sketch-472 mutants (attributed to B); l.106 says C round 472. No `pending` wording anywhere (L28). All other text stays |

**Unchanged:**
- `app/styles/app.css` stays byte-identical to TREE (sha `d3af7582d8199712`);
- `store-theme-tokens.test.ts`, `studio-theme-obsidian.test.tsx`, `fonts.css`, every woff2 and licence file, `root.tsx`, `third-party-licenses*`;
- every component, including every `font-serif`/`font-bold`/`font-mono` class (45 `font-serif` uses stay for 2c-2 [K14]);
- the keep-list (LeadMagnet, Free Samples, SpecialOffers, Limited badges, testimonials and stats);
- every protected file.

### Rulings carried from round 471 (unchanged)
- **R-471-1:** `--font-sans` and `--font-serif` both equal `'Instrument Sans', 'Noto Sans Georgian', system-ui, sans-serif`, and `--font-mono` equals `'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. FN4 now asserts exactly this.
- **R-471-2: the reflow rule.**
  - Paragraphs (`p`, `li`, `dd`) may reflow either way. They are listed, never a FAIL.
  - Exactly three line growths are accepted, all at 375:
    - `/about` h1 "Crafting Sound for Cinema", 2 → 3;
    - `/` h3 "The Complete Collection", 1 → 2;
    - `/about` stat label "Sounds Delivered", 1 → 2.
  - Any other line increase of `h1`–`h4`, or of a one-line `a`/`button`/`span`/`label`, is a FAIL. So is a new clipped element or any horizontal overflow.
- **R-471-3:** the legacy `/studio/<handle>` route inherits the new fonts through the cascade (Saba Q1 open, `user-review/questions-round-470.md`). This is not a bug.

## 0. The sketch (B, L58)
**`b-round-471/sketch-472.patch.txt`**, sha256 `b9b91596ad4c7a0776c60adf25226b8c41b8f2a7b8db58765e7f625cdef1e93f` [K5]. `tech-lead` reviewed this exact sha: APPROVE, no Medium or higher (`sketch-review.md`).

**Mutants**, run with this sha on a scratch copy of TREE plus the sketch (`b-round-471/mutants.sh`, logs `mutant-<id>.log`) [K11]:

| Mutant | Result on the sketch |
|---|---|
| control | 6 passed |
| `georgia-serif` (`--font-serif: Georgia, serif`) | FN4 red |
| `no-mono` (delete the `@theme` `--font-mono` line) | FN4 red |
| `sans-inter` (`--font-sans: 'Inter', …`) | FN4 and FN6 red |
| `body-dq-inter` (body `"Inter", …`) | FN6 red |
| `head-css` (HEAD's `app.css`) | FN4 and FN6 red |
| `commented-mono` (the `@theme` `--font-mono` commented out) | FN4 red |
| `theme-unterminated` (no `\n}` after `@theme {`) | FN4 red |
| `obsidian-sans-georgia` | green in this file by design; ST4 and TH2 red in their files |

**Other runs on the sketch:**
- the 4 covering files pass, 126 tests (`sketch-vitest.log`);
- `tsc --noEmit` rc 0 (`sketch-tsc.log`);
- Biome reports no fixes on the file.

At HEAD, the round-471 FN4 was green on `georgia-serif` and `no-mono` (`a-round-471/mut-tree-*.log`). That was the bug.

## 1. A: steps
1. **STOP (L11) if the start state is wrong.** Check all of these:
   - HEAD is `5cd9645`;
   - `git status --short --untracked-files=all` shows exactly the 3 paths above;
   - `git diff | sha256sum` starts with `60a7043de64c22c8`;
   - `app.css` sha starts with `d3af7582d8199712`;
   - the protected manifest gives rc 0;
   - `git apply --check` on sketch-472 gives rc 0.

   Do not revert or re-apply round 471's changes.
2. **Apply the sketch from the store root:** `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-471/sketch-472.patch.txt`.
   - Do not tune. Any other change to source or tests is a STOP for B.
   - Read `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md` first. `git apply` bypasses the hook.
3. **Rewrite doc 306** exactly as the grant row says.
   - Keep the seven TEMPLATE headings in order.
   - Cite only test ids that exist (FN4, FN6; L26).
4. **Run the checks** (A's speed rules) and save the logs under `a-round-472/`:
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run app/lib/__tests__/self-hosted-fonts.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/__tests__/third-party-licenses.test.ts` (B's sketch run: 126 passed);
   - the mutants on a full `git ls-files` scratch copy of the tree (after step 2) under `a-round-472/scratch`, with the `node_modules` symlink (L38): `S=<that scratch> B=/home/runner/czaba-project/tmp/studio-real-loop/a-round-472 bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-471/mutants.sh`. Always set `B` to your own folder, so B's logs are not overwritten. The result must equal `b-round-471/mutants-summary.txt` (FN results). Unlink the symlink, then delete the copy inside your own folder (L60).
5. **Ask `code-reviewer`.** There are 2 changed paths this round, so a review is not mandatory, but ask for one on the test and doc delta and include its Architecture note.
   - **Already ruled (D-29z1663, D-29z1666): report, do not STOP:** SR-472-L1/L2/L3, `.artist-title`, `<kbd>`/↵, the stale typography comments and primitives, A-R471-REVIEW-INFO-COVERAGE, and SIG-R472-FONT-STACK-DUP.
   - **STOP only on a new Medium or higher** that none of these covers (L11, L22).
6. **Report** in `a-round-472.md`: the diff stat (relative to HEAD and to TREE), the logs and the reviewer's findings.

## 2. C: what to verify
**This is the full route, not a short one.** The round-471 STOP is ruled (D-29z1662), so L22's short route does not apply. Run every row.

**Files.** Write `c-round-472.md`, `c-round-472.json` (all L57 fields) and `c-round-472/progress.json` as you go.

**Builds.** Make two scratch production builds under `c-round-472/`:
- **HEAD** (`git archive 5cd9645`);
- **TREE** (HEAD plus `git -C store diff` applied with `patch -p1`, plus `cp` of the untracked doc).

Start the mock API with `node $(realpath mock-api/server.mjs)` if :5199 does not answer.

**Probes.** The probes are in `b-round-470/`:
- `type-probe.cjs`: `node type-probe.cjs <out.json> <shotDir> head=<url> tree=<url>`;
- `type-probe2.cjs`;
- `glyph-and-crops.cjs`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | COMPUTED (browser, 1440, 1280, 375) | `type-probe.cjs` on the 8 pages: `/`, `/store`, `/products/middle-east`, `/free-downloads`, `/gift-cards`, `/about`, `/faq`, `/studio/middle-east` | TREE body and h1 `font-family` start with `"Instrument Sans"`. The CDP platform font of the h1 is Instrument Sans on 24/24. The `.font-mono` platform font is IBM Plex Mono on `/`, `/store` and `/gift-cards` (b-round-470 K12). Every text element's family is Instrument Sans or IBM Plex Mono (`type-probe2`, b-round-470 K15). HEAD shows Inter or Playfair (control) |
| C2 | NETWORK | The same run | TREE requests no `inter-*`/`playfair-*` woff2, and every font response is 200/304. The HEAD control requests `inter-latin` on every page and `playfair-display-latin` on every page except `/studio/middle-east` |
| C3 | OVERFLOW + REFLOW (L3, R-471-2) | `node b-round-470/type-probe2.cjs <out.json> head=<url> tree=<url>`, compared the same way as `b-round-470/type-probe2-summary.txt` | 0 horizontal overflow and 0 newly clipped elements on 24/24. Heading and one-line-control line increases are exactly the three R-471-2 growths. Paragraph reflow is listed only |
| C3b | CLS (browser, `type-probe2`) | Buffered `layout-shift` without input, until 2.5 s after load | TREE CLS < 0.1 on every page × viewport. Record each value next to HEAD's. B measured ≤ 0.0216 on the sketch and ≤ 0.0221 on HEAD |
| C3c | LONG TITLE (browser) | `type-probe2` replaces the product h1 with an 87-character title | TREE has the same line count as HEAD (3 at 1440 and 1280, 4 at 375). h1 and page overflow are 0 |
| C4 | KEEP-LIST (browser, 1440 and 1280; screenshots HEAD vs TREE) | `/`: SpecialOffers, the "Limited" badges, testimonials and stats ("2,500+ Happy Customers", "Netflix Original Score"). `/store` cards, with any "Limited"/"Exclusive" badge, the price and the BPM. The LeadMagnet "FREE DOWNLOAD" popup, opened (by its auto-open or as earlier rounds triggered it), with focus moved into it by keyboard | Same text. Badges stay on one line, and nothing is clipped (`scrollWidth ≤ clientWidth` on each badge and title box). The focus ring is visible. Layout boxes are within ±2 px, except text-width changes inside a line and the R-471-2 list |
| C5 | WEIGHT (browser, 1440) | A 200 % crop of the home h1 "CZABA" (700) and of the `/store` h1 (600), TREE vs HEAD | No faked bold: no smeared stems, and the 700 heading matches a 600 heading's stroke. Record the computed `font-weight`. A visible fake bold on Latin is **Medium**. Georgian UI text: none in store source (K15), so it is not applicable |
| C6 | GLYPHS (L20, browser) | `node b-round-470/glyph-and-crops.cjs <dir> head=<url> tree=<url>`. Also record the platform fonts of the CommandPalette `<kbd>` chips (Ctrl+K; D-29z1663, record only) | TREE: the 7 Georgian glyphs use Noto Sans Georgian and Instrument Sans carries 10. At most 2 glyphs (the arrows) fall back to a system font. No `.notdef` boxes. The `<kbd>` result is recorded for 2c-3, not judged |
| C7 | STUDIO-LAB (browser, 1440 and 1280) | `/studio-lab` on TREE | It opens anonymously with the demo, and the workspace's computed font-family is unchanged from HEAD (the obsidian block) |
| C8 | LEGACY STUDIO (browser, 1280) | `/studio/middle-east` on TREE vs HEAD. Try the stubbed client path (L36, `page.route`) to reach the loading and transport state | "Sign in required" renders in Instrument Sans, there are 0 audio `src`, and `/api/studio-token` returns 401. If the stubbed path runs, take a screenshot of the 9–10 px mono labels (record, R-471-3). If it does not, BLOCKED "backend unavailable in cloud" |
| C9 | JOURNEY (L54, browser, 1440) | `/store` → product page → "Try it in the Studio" → `/studio-lab`, with a screenshot per step | Each step renders. The store pages use Instrument Sans and the Studio is unchanged |
| C10 | UNIT + MUTANT (C-R471-01) | In the store: the 4 test files from A step 4. In a scratch copy of TREE (`git ls-files` + `node_modules` symlink), run `S=<your scratch> B=<your c-round-472 folder> bash b-round-471/mutants.sh`. Always set `B` to your own folder, never the default | 126 passed at the tree. FN4 is red on `georgia-serif`, `no-mono` and `commented-mono`. FN4 and FN6 are red on `head-css`. Any green one is a FAIL of C-R471-01 |
| C11 | SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff -U0`; protected manifest; `sha256sum app/styles/app.css`; diff of the test file against TREE plus sketch-472 | 3 paths (2 modified, the doc untracked). `app.css` sha `d3af7582d8199712…` (unchanged from TREE). `self-hosted-fonts.test.ts` equals HEAD plus sketch-471 plus sketch-472, byte for byte. No component changed. Protected rc 0 |
| C12 | DOC | Doc 306 | The TEMPLATE's seven `## ` headings in order. l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 4; C round 472 PASS)`. 0 lines with "ელოდება" for M1, 0 hits for `pending` and for "C5 ამოწმებს", and no "round 471" left on l.94/l.106. It cites FN4 and FN6 (both exist) and names R-471-1…3, the 2c split and D-29z1662 |
| C13 | AUTH SMOKE | As round 471 C13 | `/studio-lab` opens anonymously; the premium `/studio/<handle>` shows "Sign in required"; `/api/studio-token` returns 401. The fake-bearer path is BLOCKED (backend unavailable in cloud) |
| C14 | CLAIMS | `bash b-round-471/claims-472.sh` | Equal to `claims-472-planning-output.txt` except K1 (the diff sha changes), K4 (`--check` now fails, because the sketch is applied) and K9 (the doc sha and l.4 change; M1-open-lines becomes 0). K3 and K14 are unchanged; a change in either is a FAIL. No `MISSING`. The last line is `L58 OK` |
| gate | — | Full verify, code review, publish | Root. Not claimed |

**What could break nearby:**
- FN1–FN3 and FN5 in the same file. The covering run catches them.
- The Studio's obsidian fonts. C7 and ST4/TH2 cover them.

## 3. Claims (`b-round-471/claims-472.sh`)
| Claim | What it checks |
|---|---|
| K1 | HEAD, status paths, tracked diff sha |
| K2 | Gates 471 and 470 |
| K3 | `app.css` sha, l.122–124, l.338 |
| K4 / K5 | sketch-472 applies; its sha |
| K6 | The artifacts exist (b-round-471 and the b-round-470 probes) |
| K7 | `regression-last.json` |
| K8 | Protected rc |
| K9 | Doc 306 sha, l.4, open-M1 lines |
| K10 | Obsidian block lines |
| K11 | Mutant summary, sketch covering run, sibling ST4/TH2 |
| K12 | The b-round-470 browser claims still apply (K3 sha) |
| K13 | `lessons.md` length |
| K14 | `font-serif` count and the `.artist-title` rule |
| K15 | Georgian-script UI strings in store source |
| L58 | `l58-check.py current-task.md` |

## 4. After this round
1. **On C PASS:** STORE-2c-1 is done, and C-R471-01 is closed. The 2c-2 cap is unchanged (D-29z1660): 2c-2 is the next feature round after REGRESSION-2026-11-13 and any fix-ups it needs. This fix-up round does not count toward the cap.
2. **The next planning dated 2026-11-13 or later** is REGRESSION-2026-11-13, with every `scope_additions` entry (L6), including REG-STORE-2C-1-FONTS and REG-SCROLL-HOME-FRAMES.
3. **Then:** STORE-2c-2, 2c-3, 2c-4, STORE-2d, STORE-3, STORE-4, STORE-5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
4. **Root, non-blocking:**
   - ROOT-REQ-DP-GATE-FIRST (with SABA-B-16);
   - ROOT-REQ-ACTIVE-VIEW-STORE-REDESIGN;
   - RETRO 480.
