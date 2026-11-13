# Round 498: DPG-BUTTON-CLEANUP-2, stage 2a. Status-page CTA links move to `buildButtonClassName`

**Planned by:** B, at the round 497 → 498 planning on 2026-11-13 (`b-round-497.md`, `b-round-497/checkpoint.md`).
- **Advisor:** available, consulted after orientation and at the closing check.
- **Archive:** the round-497 task is archived as `tasks/round-497.md`, a byte-identical copy.

## Decisions (`backlog.json` v491, `decisions_log_b`)
- **D-29z1782: round 497 accepted.** C PASS with `browserVerified` and `realVerified` true. Gate 497 published `5d12c75` to both remotes.
  - Closed: B-R496-404-BROWSE-STORE-UNSTYLED (C2/C6), A-R496-CR-GS3-GUARD and A-R496-CR-BC1-PIN (C10/C11), and Lows A-R496-CR-BC3-SELF-DERIVED and A-R496-CR-BC4-NEAR-VACUOUS.
  - DPG-BUTTON-CLEANUP stage 1 is C-verified. The item is **not done**: it still needs stage 2 (all sub-stages) and the DP gate.
- **D-29z1783: findings from C15 and gate 497.**
  - C497-HDR-HEIGHT-SIGNED-IN, GATE497-L1 (header height) → `confirmedBy` on A-R496-CR-SIGNED-IN-SKELETON-SHIFT (L7), deferred.
  - GATE497-L3 → `confirmedBy` on A-R496-CR-LINK-DISABLED-VISUAL-ONLY.
  - GATE497-L4 → PD-R498-404-SECONDARY-ALIGN: product-designer moves the 404 "Browse Store" to ghost lg pill in a later stage.
  - GATE497-L2 (Hero CTA "56 → 48 px"): **not reproduced.** B's stage-1 HEAD run already measured the Hero CTA at 252×48 (`b-round-495/measure/head.json`, HERO); its `px-8 py-4` was dead. Closed as GATE497-L2-HERO-CTA-PADDING; no Saba question.
  - GATE497-L5-BC1B-RENDER-COST → deferred Low.
  - The C15 "±1 px" criterion was an assert B had not run on its sketch. It is recorded as a B spec gap, INFO-B497-C15-UNMEASURED-ASSERT (L58 recurrence; RETRO 510 counter).
- **D-29z1784: stage-2 inventory, sub-stages and this round's scope.**
  - The inventory was redone at `5d12c75`: `b-round-497/stage2-inventory.md`, scanner `scan-brand.py` (mutant-proven), 121 hits / 52 solid.
  - Sub-stages are **2a** (this round), **2b**, **2c** (purchase path), **2d** (chat), **2e** (LeadMagnet, keep-list restyle), plus **DPG-BUTTON-CLEANUP-2-NONBRAND** (30 non-brand hand-rolled buttons, a record count).
  - Protected sites → ROOT-REQ-DPG-BUTTONS-PROTECTED.
  - account.tsx is not touched, so the account.tsx hold wins and the two L8 rows stay deferred (ruling line D-29z1771).
- **D-29z1785:** consults and sketch review.
  - product-designer: primary → primary/lg/pill, partner → ghost/lg/pill.
  - tech-lead: v1 APPROVE-WITH-CHANGES → v3 APPROVE (`b-round-497/sketch-review.md`). The 800 ms pin in B2-2 is kept and N10 is intended.

## Rules
- **Read `lessons.md` first.** Applied here: L1, L4 (port preserves HEAD), L10, L22, L23, L29, L34, L54, L56, L57 and L58.
- **STOP threshold (L10):** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch (doc 320 prose excepted).
- **Ruling lines (L4):**
  - "Continue Shopping" / "Discover More": the product-designer ghost-pill ruling wins over the old DESIGN_SYSTEM sentence "secondary Store navigation is a quiet text link" (`docs/design/DESIGN_SYSTEM.md` l.1193 [K13]). The sketch rewrites that sentence.
  - 404 "Browse Store": frozen; it stays a text link this round and wins over the new ghost rule (PD-R498-404-SECONDARY-ALIGN).
  - ST5: the orders block is replaced by an equal-or-stronger block (no assertion lost, see §2). The title change is part of the sketch.
- **Pre-ruled Lows:** a re-raise is listed "For B" and is not a STOP.
  - #1 `inline-block` → `inline-flex` on faq/orders;
  - #2 orders hover `bg-brand/90` → `brand-hover`, and orders text `text-brand-foreground` → `text-background` (PD-R496-PRIMARY-TEXT-TOKEN);
  - #3 the 800 ms timer pin in B2-2 (A-R498-TL-B2-2-TIMER-PIN);
  - #4 no `ButtonLink` wrapper yet (SIG-R498-BUTTONLINK-WRAPPER);
  - #5 links have no `:active` scale (SIG-R496-LINK-NO-PRESS-SCALE).
- **Doc 319:** its status "stage 1 of 2" stands. Stage 2 is now split into 2a–2e (D-29z1784); doc 319 is not edited this round.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.
- **Out of scope:** Studio (`/studio-lab`) and the Ableton check. This is a Store round.
- **Persistent screen text (L39):** nothing is added; four pages get restyled CTAs only.

## Baseline: HEAD `5d12c75` [K1], clean worktree
Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-497/r498-tree-sha256.txt`: every tracked file outside the grants (1,401; DESIGN_SYSTEM.md is granted and excluded).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files.
3. Before applying: `b-round-497/r498-pre-sha.txt` (the 5 granted existing code/test paths and DESIGN_SYSTEM.md, at HEAD).
4. After applying: `b-round-497/r498-post-sketch-sha.txt` (the 6 code/test paths and DESIGN_SYSTEM.md, as in the sketch).

## 0. Why this round
- **Saba's DPG-FIX P1 item 7:** "Use Button.tsx component only." Stage 1 removed the competing CSS classes. Stage 2 removes the hand-rolled brass buttons.
- **Ownership.** HEAD has 52 solid `bg-brand` hits [K11]. Stage 2a takes the four status-page CTA groups, whose sites share one mapping rule. Each is a single main action, or a main action plus one secondary, on a page every buyer sees after checkout, on the FAQ, or on empty order history.
- **REGRESSION is not due.** The last one was 2026-11-13; the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference: how the Store references do it
- **Source:** the stage-1 reference in `tasks/round-496.md` §1 (direction A "a brass pill"; Artlist and Epidemic pill CTAs; `docs/technical/store-redesign/research/`), plus product-designer's stage-2a consult (`b-round-497/consult-product-designer.md`).
- **Behaviour:** one filled brass pill per page for the main action. A paired secondary is a quiet ghost pill of the same height: transparent at rest, `elevated` on hover, foreground text on hover. Links stay links.
- **Deviations (listed, each with a reason):**
  - D1, FAQ: `px-8` → `px-6` (width 150 → 134). Reason: one lg size for every Store CTA.
  - D2, orders: weight 500 → 600 and hover `/90` → `brand-hover`. Reason: the same.
  - D3, all six: height 50 → 48 and radius 8/12 → 9999 px. Reason: the stage-1 lg pill.
  - D4: the 404 "Browse Store" stays a text link until PD-R498-404-SECONDARY-ALIGN. Reason: it is C-verified; it changes in its own stage.
  - Not a deviation: copy, icons, hrefs, element types and `releaseLinkFocus` stay as they are.

## 2. What changes: sketch `b-round-497/sketch-498-v3.patch.txt`
sha256 `90786f209b69359133debc32a765997f5d71b8a1ad7daed2dfe5fa395dfee7ac`, the last line of `b-round-497/sketch-sha.txt`.

| Site (HEAD) | HEAD class | Sketch |
|---|---|---|
| `app/routes/checkout.cancel.tsx` "Return to Cart" `<Link to="/cart">` [K2] | `px-6 py-3 bg-brand … rounded-md` | `buildButtonClassName({ size: 'lg', shape: 'pill' })` |
| same file, "Continue Shopping" `<Link to="/store">` [K3] | `bg-transparent text-muted … rounded-md` | `buildButtonClassName({ variant: 'ghost', size: 'lg', shape: 'pill' })` |
| `app/routes/checkout.success.tsx` "Access Your Downloads" [K4] / "Discover More" [K3] | primary + ghost-like, `rounded-lg` | primary / ghost lg pill (same as above) |
| `app/routes/faq.tsx` "Contact Us" `<Link to="/hire-us" onClick={releaseLinkFocus}>` [K5] | `inline-block px-8 py-3 …` | primary lg pill; `onClick` kept |
| `app/routes/account.orders.tsx` "Browse Music" `<a href="/store">` [K6] | `inline-block px-6 py-3 … font-medium` | primary lg pill; stays a plain `<a>` |

**Tests and docs in the sketch:**
- **New** `app/lib/__tests__/store-button-cleanup-2.test.tsx`:
  - B2-0: literal oracles `PRIMARY_LG_PILL` and `GHOST_LG_PILL` equal the builder output;
  - B2-1 to B2-4: each of the 6 links is one `<a>` with an exact class and an exact href, and contains no button and no `closest('button')`. B2-2 uses fake timers: the link is absent before the 800 ms reveal [K8], then `advanceTimersByTime(800)`. B2-4 keeps "no `data-discover`" (plain `<a>`);
  - B2-5: no hand-rolled `bg-brand`, `hover:bg-brand-hover` or `bg-transparent`+`text-muted` literal remains in the 4 files.
- **`store-theme-tokens.test.ts` ST5:** the old orders block pinned the hand-rolled string (`bg-brand` + `inline-block`, `text-brand-foreground`) [K9]. Its replacement:
  - asserts 0 `bg-brand` className literals in orders;
  - asserts the builder call is present;
  - asserts the primary variant has `bg-brand` and `text-background`, not `text-foreground`;
  - **new:** asserts the theme `--color-background` equals `--color-brand-foreground`, so the dark text stays tied to the brand-foreground value.

  The title becomes "…carry dark text (brand-foreground or the equal background token)". No other ST5 line changes.
- **`docs/design/DESIGN_SYSTEM.md` `### Buttons`:** the pill usage row (l.1157 [K13]) gains the four pages, and the Ghost "Use for" line (l.1193 [K13]) states the paired-secondary rule and the 404 exception.
- **`docs/implementation/2026/quarter-IV/320-dpg-button-cleanup-stage-2a.md`:** a skeleton with the 7 TEMPLATE headings and the status line [K12]. A writes the prose.

**Name and locator sweep (L23)** [K10]: at HEAD the four route module paths and six names hit exactly the first five files below. `store-lead-magnet-routes.test.tsx` is added because it navigates to `/checkout/success` and `/checkout/cancel`. The sketch adds the new B2 file. All are run as covering:
- `account-orders-card.test.tsx`;
- `account-orders-empty-state.test.tsx` (AO1/AO2: href and one link, unaffected);
- `store-internal-links.test.ts` (faq `to="/hire-us"` and `releaseLinkFocus`, unaffected);
- `store-theme-tokens.test.ts` (ST5, granted);
- `store-teal-sweep.test.ts`;
- `store-lead-magnet-routes.test.tsx`.

There are 0 hits in `perf/**` and `e2e/**` [K10].

## 3. A: what to implement
1. From `store/`, run frozen checks 1–3 (rc 0), then `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-497/sketch-498-v3.patch.txt`, then check 4 (rc 0).
2. **Grants:** the sketch paths only. These are the 4 routes, the 2 test files, DESIGN_SYSTEM.md (sketch hunks only) and doc 320.
   - Doc 320: A writes Georgian prose with English terms in its 7 sections, keeping the status line.
   - Doc 320 records the 6 sites, deviations D1–D4, the ST5 replacement, the mutant and browser evidence (B's files under `b-round-497/`) and the sub-stage list 2b–2e and NONBRAND.
   - Every number in doc 320 names its log (L26, L56). Every backtick-quoted class token in doc 320 already occurs under `app/` or `docs/` at HEAD (C greps each one).
3. **Run** (logs under `a-round-498/`):
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-497/covering-files.txt)`. Expect 9 files and 120 tests (B: `b-round-497/precheck-covering.log`);
   - the code-reviewer on the diff (3+ files).

   Not the full suite: B ran it on the sketch (`precheck-full.log`).
4. Write `a-round-498.md`, with the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-498.md`, `c-round-498.json` and `c-round-498/progress.json` as it goes, browser rows first.

**Environment and harness:**
- Init script `localStorage.czaba_lead_magnet_dismissed = '1'`.
- Orders: `localStorage.auth_user` without `accessToken` (L1), and a `page.route` stub of `/api/orders/my` returning an empty page (L36).
- Warm each page once, because a cold dev server missed one link on B's first sketch pass.
- Harness: `BASE=http://127.0.0.1:5173 node /home/runner/czaba-project/tmp/studio-real-loop/b-round-497/measure/measure-498.mjs <c-round-498/after> after`. Compare with `b-round-497/measure/head.json` and `sketch.json` (B's sketch run on a scratch dev server).

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | Exactly the 8 sketch paths (6 modified, 2 new); every check rc 0 |
| C1 | REST (browser, 1440×900, 1280×720, 375×812) | The 6 links: computed style and box | Primary: bg `rgb(201, 164, 106)`, text `rgb(14, 13, 12)`. Ghost: bg `rgba(0, 0, 0, 0)`, text `rgb(163, 155, 142)`. Both: radius `9999px`, height 48, 16px / 600, padding 12px 24px. Boxes equal `sketch.json` ±1 px; the FAQ width is 134 |
| C2 | HOVER (browser, same viewports) | Hover each link | Primary bg `rgb(217, 184, 127)`, opacity 1. Ghost bg `rgb(29, 26, 23)`, text `rgb(236, 230, 218)` |
| C3 | FOCUS (browser, 1440 + 1280) | Keyboard Tab to each of the 6; mouse press on cancel "Return to Cart" | Keyboard: `:focus-visible` true, outline solid 1px `color(srgb 0.788235 0.643137 0.415686 / 0.8)`, offset 2px. Press: **record, not run on sketch** (stage 1 C3 measured `:focus-visible` false and outline none for the same builder class) |
| C4 | STACK (browser, 375×812) | Cancel and success pairs; screenshots | Both links of each pair are 343 wide and 48 tall and stacked. "Access Your Downloads" stays on one line (height 48). The pill is not clipped |
| C5 | CONTRAST | Ghost rest text against the page background (`restContrast` in the harness) | ≥ 4.5:1 (B measured 7.06 at HEAD and on the sketch). A failure is a Medium finding; no token is swapped in this round |
| C6 | NAV (browser, 1440) | `BASE=http://127.0.0.1:5173 node b-round-497/measure/nav-498.mjs <c-round-498/after> after` (Enter on each link, signed out, except orders with the stub) | The final paths equal `b-round-497/measure/head-nav.json`: `/cart`, `/store`, `/account/downloads`, `/store`, `/hire-us`, `/store`. `fullDocumentLoad` is false for the five Links and true for orders. The hrefs are unchanged, so HEAD is the oracle [K14]. `document.activeElement` after Enter: **record** (HEAD: BODY on all six; `releaseLinkFocus` and the Remix navigation are unchanged code) |
| C7 | JOURNEY (L54, browser, 1440) | The same script's journey part: `/checkout/cancel` → "Return to Cart" → `/cart` → back → "Continue Shopping" → `/store` | The journey paths equal `head-nav.json` `journey` (`/checkout/cancel`, `/cart`, `/checkout/cancel`, `/store`). One screenshot per step. The console errors are only the two known cloud ones, `Failed to load resource: net::ERR_CONNECTION_REFUSED` and `Failed to load cart: TypeError: Failed to fetch` (HEAD: 2, `journeyErrors`). B ran it at HEAD without the mock API |
| C8 | GREP | `python3 -I b-round-497/scan-brand.py . /tmp/s.json` from `store/`; `grep -c 'buildButtonClassName(' ` over the 4 files | Scanner output `116 hits; 48 solid`; 6 builder calls in total (K7) |
| C9 | TESTS | `npx vitest run $(cat …/covering-files.txt)` | 9 files, 120/120 pass |
| C10 | MUTANTS | Copy the working tree of `store/` (excluding `node_modules` and `.git`) to a folder outside `store/`, `git init`, commit, symlink `node_modules`; then `bash b-round-497/mutants-498.sh <copy>` | N1–N11 all RED, as in `b-round-497/mutants-498.txt` (N11 isolates B2-5: an extra `bg-brand` literal in faq.tsx) |
| C11 | DOCS | `git diff docs/design/DESIGN_SYSTEM.md`; doc 320 | Hunks only in the pill row and the Ghost "Use for" line, equal to the sketch. Doc 320 has the 7 headings and the status line; every number traces to a log; every backtick-quoted class token in it is found by `grep -rF` under `app/` or `docs/` of HEAD (`git show 5d12c75:<path>` or `git grep -F <token> 5d12c75 -- app docs`) |
| C12 | CLAIMS | `bash b-round-497/claims-498.sh` (default tree) compared with `b-round-497/claims-498-sketch-output.txt` | No `MISSING`. Output identical, except K16 locations (`backlog:open_findings` may become `archive` after root's optimizer archives closed ids) |
| C13 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-498.json c-round-498/l57-check.txt` | As C0; rc 0 |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Neighbours that could break:**
  - the stage-1 sites (404, login, search, Hero, Header). They are frozen, so C0 covers them;
  - the orders empty state's single link (AO2);
  - the LeadMagnet route list on `/checkout/*` (covering test);
  - the success page's 800 ms reveal (B2-2).
- **L22:** if A STOPs, C runs C0, C12 and C13 only.
- **Bugs:** every bug carries an enum `origin` (L57).
- **Closing:** with C PASS and `browserVerified` true, DPG-BUTTON-CLEANUP-2 stage 2a is verified. The item stays open for 2b–2e, NONBRAND and the DP gate.

## 5. B's pre-check (on a scratch copy of HEAD + sketch outside `store/`; it does not survive the job, and the logs below are the evidence)
| Check | Result | Log |
|---|---|---|
| Biome on the 6 code/test files, tsc | rc 0 (5 pre-existing warnings, equal to HEAD) / rc 0 | `precheck-biome.log`, `precheck-tsc.log` |
| Covering tests | 9 files, 120/120 | `precheck-covering.log` |
| Full suite on sketch v3 | 296 files / 4,322 tests, rc 0 (gate 497 count + the 6 new B2 tests) | `precheck-full.log` |
| Build on the sketch, docs included (L56) | rc 0; CSS bundle `app-P1AqvFE3.css`, the same as gate 497 [K15] | `precheck-build-sketch.log` |
| Mutants | N1–N11 RED | `mutants-498.txt`, `m498-N*.log` |
| Browser, HEAD vs sketch (1440 / 1280 / 375) | as in C1–C5; contrast primary 8.32, ghost 7.06 | `measure/head.json`, `measure/sketch.json`, PNGs |
| Browser nav + journey at HEAD (C6/C7 oracle) | 6 final paths; orders a full load; journey 4 paths; 2 known console errors | `measure/head-nav.json`, `head-j*.png` |
| Scanner mutant | +2 hits / +1 solid detected | `scan-mutant.txt` |
| Sketch review | v3 APPROVE | `sketch-review.md` |
| Claims (HEAD and sketch) | rc 0, no MISSING | `claims-498-planning-output.txt`, `claims-498-sketch-output.txt` |

## 6. After this round (D-29z1784)
1. **DPG-BUTTON-CLEANUP-2 stage 2b:** the route and section CTAs (`stage2-inventory.md` A2). REGRESSION comes first if planning happens on or after 2026-11-16.
2. **2c:** the purchase path (PurchaseHeader). **2d:** chat. **2e:** LeadMagnet (keep-list restyle). **NONBRAND:** the other hand-rolled buttons. **PD-R498-404-SECONDARY-ALIGN.**
3. **Then the rest of DPG P1** (CSS-DEDUP, COLOR-CONSOLIDATE, FONT-RESOLVE), the DP-gate re-run with root, and P2. The next RETRO is round 510.
