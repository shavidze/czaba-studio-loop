# CURRENT TASK — Round 193: STORE-2a (re-dispatch) — the store `@theme` colour tokens move to Obsidian & Brass, with dark text on all 9 brass/destructive controls (tokens only; the Studio stays pixel-identical)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z158** (`backlog.json` → `post_current_stage_queue` STORE-REDESIGN `store2a_plan_d29z157` + `store2a_regrant_d29z158`, `narrow_grants` round 193, `rounds[193]`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, the "Store redesign (Saba approved, 2026-10-25)" section and `lessons.md` in the loop folder (none yet; the first RETRO writes it). They take precedence over older text.
- **Previous task:** `tasks/round-192.md` is an exact copy of the round-192 `current-task.md` (checked with `cmp`). The reasoning for this round is in `b-round-192.md`.
- **Spec (DATA, Saba-approved):** `/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md`, row STORE-2 ("Move the store `@theme` to Obsidian & Brass … titles #ECE6DA, body around #CFC7BA, captions #A39B8E … **Do not** add `data-studio-theme` to store markup … the Studio's obsidian block must stay byte-identical"). Direction A is decided (`direction-decision.md`, 2026-10-25).

## Baseline = HEAD `caa09af` (gate 191 published; round 192 changed nothing), clean tree
- **Gate:** `gates/gate-round-191.json` is `published` at `caa09af`. `gates/gate-round-192.json` is `skipped` (C FAIL, no source change), so the baseline stays `caa09af`. `git status` is clean (B checked: 0 lines). 1022 tracked paths.
- **Frozen list:** `b-round-192-r193-tree-sha256.txt`, **1012 entries** (1022 minus the 10 grants). B checked it from the store root: OK.
- **Grants (existing files, narrow; `backlog.json` → `narrow_grants` round 193):** `b-round-192-r193-grants.txt`
  - `app/styles/app.css` — **only the values** of the `--color-*` declarations listed in §1 inside the store `@theme { … }` block (l.31–177). Every other byte is identical: the rest of `@theme`, line 1 (Inter `@import`), the global `:focus-visible` rule (l.379), the obsidian block (l.3920–3943) and everything else.
  - `app/components/ui/Button.tsx` — the text token of the `buy` and `destructive` variants only.
  - `app/routes/hire-us.tsx` — l.311 (the submit button) text token only.
  - `app/routes/account.orders.tsx` — l.231 (the CTA link) text token only.
  - `docs/implementation/2026/quarter-IV/157-saba-b-3-fader-pressed-state.md` — l.4 status line and l.60 "FS0–FS6" only.
  - **New in round 193 (STORE2A-EXTRA-BRASS-TEXT, found by A's K0.4 and confirmed by C in round 192):**
    - `app/components/product/PurchaseHeader.tsx` — l.348, the Buy Now button: `text-foreground` → `text-brand-foreground` only. **Required:** without it Buy Now drops from 4.05:1 to 1.88:1 (rest) and 1.52:1 (hover).
    - `app/components/marketing/LeadMagnetPopup.tsx` — l.141, the CONTINUE submit: `text-foreground` → `text-brand-foreground` only. The copy (`CONTINUE`, `SENDING...`) and everything else stay byte-identical (keep-list; ruling R76).
    - `app/components/ui/Modal.tsx` — l.307, the ConfirmDialog `destructive` string only: `'bg-destructive text-foreground hover:bg-destructive/90'` → `'bg-destructive text-brand-foreground hover:bg-destructive/90'`. **Exactly one changed line.** `Modal` is mounted in the Studio by `ArrangementExportDialog`; nothing else in this file may change.
    - `app/components/chat/ChatButton.tsx` — l.38, the unread badge `'bg-destructive text-foreground'` → `'bg-destructive text-brand-foreground'` only.
    - `app/components/auth/ForgetPassword.tsx` — l.80, the `CheckCircle` icon class `text-foreground` → `text-brand-foreground` only (it sits on the `bg-brand` circle at l.79). No auth logic is touched; the reset call stays in the frozen `app/lib/auth*`.
- **New files:** `b-round-192-r193-new-files.txt`, both free at `caa09af`:
  - `app/lib/__tests__/store-theme-tokens.test.ts`;
  - `docs/implementation/2026/quarter-IV/158-store-2a-colour-tokens.md`.
- **Start hashes:** `b-round-192-r193-granted-start-sha256.txt` (10). **Start copies:** `b-round-192/r193-granted-start/`.
- **A's first step:** check these three things. If anything differs, stop and report.
  1. HEAD is `caa09af`.
  2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-192-r193-tree-sha256.txt`, run **from the store root**, is OK.
  3. The ten start hashes match.
- **Mock API:** the store rows need it. If :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` from the loop folder and stop it at the end (kill **only that PID**; in round 192 a broad `pkill` ended C's own shell). Record which you did. Do not edit the mock.

## 0. Why this round
- **Round 192 did not implement STORE-2a.** A's K0.4 found 5 non-protected light-text-on-fill sites beyond B's four, and stopped before any edit, as the task required. C confirmed independently that the list is complete and that the stop was correct (`c-round-192.md`). This was a **planning gap in B's grants**, not a defect in A's work, and HEAD is unchanged. Round 192's §7 row 3 applies: the fix-up of a 2a row comes before the regression round.
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24; today is 2026-10-26 (2 days).
- **No Critical, High or Medium finding is open** that reproduces in the cloud.
- **STORE-2 split is unchanged** (one stage per round, nothing dropped; `split_d29z157`): **2a** this round; **2b** hardcoded teal, glow blobs, gradient text and `shadow-glow`; **2c** typography and font loading (needs the root decision in §8); **2d** motion and reduced motion including Lenis.
- **Reusable evidence from round 192 (DATA):** A's K0.1–K0.3 Studio-consumption table and its 29-selector map (`a-round-192.md`), the ST6 baseline (3 lines under `app/` excluding `__tests__`; 1 in `.ts/.tsx`), and the e2e grep (0 value hits; `e2e/store-page.spec.ts:61,64,76` are class-name assertions on `store.tsx`, which is frozen). C spot-confirmed only that ConfirmDialog is not Studio-reachable; the rest of the K0.1–K0.3 table was not re-audited by C.

## 1. What changes (exact)

### Rulings (vetoable by Saba; record them in D1)
- **R72 — the store palette equals the Studio palette.** Each of the 18 colour keys that the obsidian block overrides takes **the same value** in the store `@theme`. So they cannot drift, and `/studio-lab` renders exactly as before.
- **R73 — the text tones follow the spec.** Titles `foreground` `#ece6da`, body `secondary` `#cfc7ba`, captions `muted` `#a39b8e`. Only the values change; which element uses which token is STORE-2c work.
- **R74 — derived tokens.** `bg-alt` and `surface-glass` take the channel-wise midpoint of their new pair (rounded). `surface-glass-strong` stays equal to `surface`. The `*-rgb` triplets follow brass. `buy` and `buy-hover` become brass ("the buy-blue leaves the store").
- **R75 — no ivory text on brass or on the new destructive red.** Ivory on brass is 1.88:1 (1.52:1 on `#d9b87f`); ivory on `#d2776a` is 2.57:1. All **9 non-protected** controls with light text or a light icon on a `brand`/`buy`/`destructive` fill switch to `text-brand-foreground` (`#0e0d0c`): 8.32:1 on brass, 6.09:1 on destructive.
  - The protected `studio.$productId.tsx:440/471` and `account.downloads.tsx:261` have the same pattern and stay untouched (signal `STORE2A-PROTECTED-BRASS-TEXT`).
- **R76 (new) — the keep-list LeadMagnet CONTINUE button changes text colour only.** Saba's binding rule is "restyle them only; never remove or reword". A text-colour token is a restyle: the copy, position, size and behaviour stay. Without it the button would fall to 2.57:1, which this round would cause. Recorded for root/Saba acknowledgement (§8). KEEP-193 checks the button's `innerText` byte for byte.
- **Unchanged on purpose:** `info`, the `error-*` set, the social, decorative (crystal/premium), video and `blue-*` alias colours; `glow-*`, every `--shadow-*`, every `--gradient-*` (STORE-2b); `--font-*` (STORE-2c); the animation tokens (STORE-2d). The mixed look this leaves (brass plus some teal gradients and glows) is an expected intermediate state, not a FAIL of 2a.

| Token (store `@theme`) | `caa09af` | Round 193 | Basis |
|---|---|---|---|
| `--color-background` | `hsl(220, 20%, 4%)` | `#0e0d0c` | R72 |
| `--color-surface` | `hsl(220, 18%, 8%)` | `#161412` | R72 |
| `--color-elevated` | `hsl(220, 18%, 12%)` | `#1d1a17` | R72 |
| `--color-muted-bg` | `hsl(220, 15%, 15%)` | `#24201c` | R72 |
| `--color-surface-glass` | `hsl(220, 18%, 10%)` | `#1a1714` | R74 midpoint of surface/elevated |
| `--color-surface-glass-strong` | `hsl(220, 18%, 8%)` | `#161412` | R74 (= surface) |
| `--color-outline` | `hsl(220, 15%, 22%)` | `#24211e` | R72 |
| `--color-outline-hover` | `hsl(220, 15%, 28%)` | `#2e2a26` | R72 |
| `--color-outline-strong` | `hsl(220, 15%, 32%)` | `#736b60` | R72 |
| `--color-outline-light` | `hsla(220, 15%, 22%, 0.5)` | `rgb(36 33 30 / 0.5)` | R72 |
| `--color-brand` | `hsl(175, 85%, 46%)` | `#c9a46a` | R72 |
| `--color-brand-hover` | `hsl(175, 85%, 52%)` | `#d9b87f` | R72 |
| `--color-brand-foreground` | `hsl(220, 20%, 4%)` | `#0e0d0c` | R72 |
| `--color-accent` | `#f9a91f` | `#c9a46a` | R72 |
| `--color-foreground` | `hsl(220, 10%, 94%)` | `#ece6da` | R72, R73 |
| `--color-muted` | `hsl(220, 10%, 55%)` | `#a39b8e` | R72, R73 |
| `--color-dim` | `hsl(220, 10%, 45%)` | `#928a7d` | R72 |
| `--color-positive` | `#00d26a` | `#8fa382` | R72 |
| `--color-destructive` | `hsl(0, 84%, 60%)` | `#d2776a` | R72 |
| `--color-warning` | `#f59e0b` | `#d9a35b` | R72 |
| `--color-secondary` | `hsl(220, 10%, 70%)` | `#cfc7ba` | R73 |
| `--color-bg-alt` | `hsl(220, 18%, 6%)` | `#12100f` | R74 midpoint of background/surface |
| `--color-brand-rgb` | `19, 217, 204` | `201, 164, 106` | R74 |
| `--color-accent-rgb` | `249, 169, 31` | `201, 164, 106` | R74 |
| `--color-buy` | `#006AFF` | `#c9a46a` | R74 |
| `--color-buy-hover` | `#0052CC` | `#d9b87f` | R74 |

Rules for the value edits:
- Only the value between `:` and `;` changes. Spacing, comments and declaration order stay the same.
- Where a trailing comment names the old colour (for example `/* Primary - #13D9CC */`), A may update the comment text on the **same line** to match the new value, or leave it. Nothing else.

### The 9 approved light-on-fill sites (R75/R76)
| # | Site at `caa09af` | Element | Fill | Change |
|---|---|---|---|---|
| S1 | `ui/Button.tsx` `buy` variant | variant string | `bg-buy` | `text-foreground` → `text-brand-foreground` |
| S2 | `ui/Button.tsx` `destructive` variant | variant string | `bg-destructive` | same |
| S3 | `routes/hire-us.tsx:311` | submit button | `bg-brand` | same |
| S4 | `routes/account.orders.tsx:231` | "Browse Music" CTA | `bg-brand` | same |
| S5 | `product/PurchaseHeader.tsx:348` | Buy Now | `bg-buy` | same |
| S6 | `marketing/LeadMagnetPopup.tsx:141` | CONTINUE submit | `bg-destructive` | same |
| S7 | `ui/Modal.tsx:307` | ConfirmDialog destructive confirm | `bg-destructive` | same |
| S8 | `chat/ChatButton.tsx:38` | unread badge | `bg-destructive` | same |
| S9 | `auth/ForgetPassword.tsx:80` | `CheckCircle` icon inside the `bg-brand` circle (l.79) | `bg-brand` (parent) | same |

| ID | File(s) | Change |
|---|---|---|
| **K0** (evidence first, short) | none | <ol><li>Re-run your round-192 scan (`a-round-192/scripts/brass-scan.mjs` or equivalent) at `caa09af`: same-line **and** ±6-line window, **including child elements and icons within ±2 lines of a fill** (the S9 pattern), over `app/` excluding `__tests__` and `components/arrangement`. Fills: `bg-(brand|accent|buy|destructive|positive|warning)`; light text: `text-(foreground|white|secondary|muted)`.</li><li>**Stop rule (narrowed):** stop and report **only** if a non-protected site **outside S1–S9** appears. S1–S9 and the three protected sites are expected.</li><li>Reuse your K0.1–K0.3 Studio-consumption table from `a-round-192.md` (copy it into D1). Add one line for the new Studio-mounted grant: `Modal.tsx` — only the ConfirmDialog destructive string changes; `ConfirmDialog` is used only by `routes/cart.tsx`; `ArrangementExportDialog` uses `Modal`, not `ConfirmDialog` (cite the grep).</li></ol> |
| **K1** (R72–R74) | `app.css` (`@theme` values only) | The 26 value changes in the table, exactly. |
| **K2** (R75/R76) | the 8 granted component/route files | S1–S9: `text-foreground` → `text-brand-foreground`, one token per site. No other token, class order, copy or behaviour change. |
| **T1** (new) | `store-theme-tokens.test.ts` | Read `app/styles/app.css` the way `audio-preview-player.test.tsx` and `studio-theme-obsidian.test.tsx` do (brace-matched `@theme` body). **Every CSS case runs on comment-stripped CSS.** Cases: <ol><li>**ST1:** each of the 18 colour keys of the obsidian block has **the identical value** in the store `@theme`. Parse both blocks.</li><li>**ST2:** `@theme` holds exactly the round-193 values for the 8 store-only keys (`surface-glass`, `surface-glass-strong`, `secondary`, `bg-alt`, `brand-rgb`, `accent-rgb`, `buy`, `buy-hover`).</li><li>**ST3:** no `--color-*` declaration in `@theme` outside the unchanged list contains `hsl(175`, `13d9cc`, `19, 217, 204`, `#006aff`, `#0052cc` or `#f9a91f` (case-insensitive). Name the exempt keys explicitly in the test; STORE-2b shrinks that list.</li><li>**ST4:** the obsidian block is unchanged: exactly the 21 declarations TH2 pins, and the 18 colour values asserted literally. TH2 in the frozen suite stays green.</li><li>**ST5:** for **each of S1–S9**, read the source file and locate the element by a stable substring (not a line number): its class string contains `text-brand-foreground` together with its fill class (`bg-buy`, `bg-brand`, `bg-destructive`; for S9 the `CheckCircle` icon class, with the `bg-brand` circle as its parent in the same JSX block), and does **not** contain `text-foreground`. **Byte guards:** every other `Button.tsx` variant string, and the non-destructive ConfirmDialog branch string `'bg-foreground text-background hover:bg-foreground/90'` in `Modal.tsx`, equal the start copy (embed them as literals). In `LeadMagnetPopup.tsx` the strings `CONTINUE` and `SENDING...` are still present.</li><li>**ST6:** no store markup gains `data-studio-theme`: the count under `app/` excluding `__tests__` equals the round-192 baseline (3 lines; 1 in `.ts/.tsx`).</li></ol>jsdom cannot paint; the look and the contrast are browser acceptances (§4). |
| **D1** (new) | doc 158 | Georgian, following `docs/implementation/TEMPLATE.md`: status `In Progress (awaiting C round 193)`; R72–R76 with rejected alternatives: (a) store values different from the Studio for the overridden keys (drift); (b) `data-studio-theme` on store markup (TH4 and the spec); (c) leaving ivory on brass (1.88:1); (d) leaving the CONTINUE button ivory to avoid touching a keep-list item (2.57:1, a regression this round would cause); K0's Studio table and the S1–S9 list with ratios; round 192's stop and why (planning gap); that `ChatWidget`/`ChatButton` is mounted on no route at `caa09af` (cite the grep), so S8 is covered by ST5 only; the 2b/2c/2d split; a TODO for the protected brass-text sites and the purchased `/studio/:id` legacy view (Tech Lead / backend check). |
| **D2** (doc 157) | doc 157 | l.4 → `**სტატუსი:** Completed (C round 191 PASS, caa09af)`; l.60 `FS0–FS6` → `FS0–FS7`. Nothing else. |

**Unchanged on purpose (frozen list, byte-identical):** every other `app/styles/**` byte, `root.tsx`, `studio-lab.tsx` and every Studio-owned file; every component other than the granted files; every existing test (`studio-theme-obsidian`, `audio-preview-player`, `panel-radius-ui`, `store-header-footer`, the `*-colour-ui` suites, `e2e/**`); the protected purchase/auth files, `app/lib/auth*`, `public/`, `.claude/**`, `package.json` and the configs.

## 2. A — files you own (everything else is frozen)
- **Grants:** the 10 files above, each limited to its scope, and the 2 new files. Plus your own `a-round-193.md` and `a-round-193/`.
- **Protected, byte-identical:** every path in the frozen list, including `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `AuthContext.tsx`, `app/lib/auth.ts`, `firebase.client.ts`, `app/root.tsx`, `public/`, `.claude/**` and `package.json`. Do not touch `mock-api/` or any other loop file.
- **If a frozen test turns red** because of your change, change your implementation so it stays green. If impossible without dropping a requirement, **stop and report** the exact failing assertion. Do not edit the frozen test.
- **Read first** (rule `read-primitives.md`): `AGENT_DISCOVERABLE_CODE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md` (Button, Modal), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/new-test.md`; `docs/implementation/TEMPLATE.md`.
- Write `a-round-193/end-sha256.txt` (10 grants + 2 new files) and `a-round-193/diff-vs-start.patch` (grants against `b-round-192/r193-granted-start/`, new files in full). No commit and no push.

## 3. A — tests and checks (speed rules)
**Run:**
- `npx vitest run app/lib/__tests__/store-theme-tokens.test.ts`: green.
- **Neighbour suites**, all green: `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`, `panel-radius-ui.test.tsx`, `affordance-colour-ui.test.tsx`, `fader-style-ui.test.tsx`, the arrangement export-dialog suite(s) that render `Modal` (A greps `ArrangementExportDialog` in `__tests__` and lists them); `app/lib/__tests__/audio-preview-player.test.tsx`, `store-header-footer.test.tsx`; every test that imports `Button`, `Modal`/`ConfirmDialog`, `PurchaseHeader`, `LeadMagnetPopup`, `ChatButton`/`ChatWidget` or `ForgetPassword`/`AuthModal`; and every other test that reads `app.css` or asserts a store colour (grep `app.css`, `--color-`, `bg-brand`, `text-foreground` in `*.test.*`). List what ran.
- **e2e (frozen, run by the gate):** re-run the round-192 grep in `e2e/` and add `text-brand-foreground`, `bg-buy`, `CONTINUE`, `Buy Now`. If any frozen e2e assertion depends on a changed class or value, **stop and report**.
- **Red proof:** run T1 against the start copies (temporary copy over the grants, then restore and check `end-sha256.txt`, or a scratch Vite alias). ST1, ST2, ST3 and ST5 must be red there; ST4 and ST6 may be green.
- `npm run typecheck`. `npm run lint`, reporting the count against round 191's 214 warnings + 1 info. `npx biome check` on every changed and new file: 0 errors.
- Do not run the full suite: that is the gate's job.

**Live proof** (Playwright Chromium on :5173, mock on :5199, DPR 2), saved under `a-round-193/`:
- At 1440×900, 1280×720 and 375×812, on `/`, `/store` and `/products/middle-east`: full-page shots, and `getComputedStyle(document.documentElement)` for the 26 tokens.
- Buy Now on `/products/middle-east` (rest + hover) and the `/hire-us` submit: computed colour and background, with crops.
- The LeadMagnet popup, if it can be triggered (as rounds 188/190 did): the CONTINUE button crop and computed colours.
- `/studio-lab` at 1440 and 1280: a rest shot vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, **no mask**: 0 changed px. Plus the export dialog open at 1440 vs HEAD: 0 changed px.
- The keep-list texts on `/` captured before and after.

**Code review:** use the `code-reviewer` subagent (≥ 3 files). Pass its Architecture note to B verbatim. Fix its Medium+ findings within the grants.

## 4. C — rows
**Setup:** real Playwright Chromium on the shared :5173 server, a fresh anonymous context, mock API on :5199 (start it if it is not listening, log `c-round-193/mock.log`, stop **only that PID** at the end). A **HEAD reference** (`git archive caa09af`, served on its own port with its own vite `cacheDir`, as in round 191) for "before" shots and layout, or `c-round-190/shots/store-after/` + `c-round-191/shots/` + `c-round-192/shots/` (round 192 measured HEAD). Viewports: store rows at **1440×900, 1280×720 and 375×812**; Studio rows at 1440×900 and 1280×720. Pixel reads at DPR 2 with `--disable-lcd-text`.

| Row | What | Pass |
|---|---|---|
| **TOKENS-193** | On `/`, `/store`, `/products/middle-east` × 3 viewports: the 26 tokens from `getComputedStyle(document.documentElement)`; `body` background. | Every token equals the §1 table (colour-normalised). `body` background = `rgb(14, 13, 12)` (HEAD `rgb(8,10,12)`). No element on these pages carries `data-studio-theme`. |
| **CONTRAST-193** | Same pages and viewports. Sample at least: nav links (rest and active), h1/h2s, body paragraphs, captions/meta, prices, primary and secondary buttons and their hover, the cart badge, the newsletter field and placeholder on `/`, the footer links, **Buy Now rest and hover**. Record foreground and background **as rendered** (pixel or computed, stating which) and the ratio. | Text ≥ 4.5:1 (large ≥ 3:1), UI parts and focus ring ≥ 3:1, for every **token-coloured** sample. A sample below threshold whose colours come from a §1 token is a **FAIL (Medium, caused by this round)** unless HEAD had the same or lower ratio (then pre-existing → Low). Hardcoded teal, gradient, glow or unchanged-list colours are **STORE-2b inventory** (info, with selector and ratio), not a 2a FAIL. |
| **BRASS-TEXT-193** | S1–S9 in the browser where reachable, rest + hover, 3 viewports: <ul><li>**S5 Buy Now** on `/products/middle-east` (required): expected ≈ 8.3:1 rest on `#c9a46a` and > 8:1 on hover `#d9b87f`.</li><li>**S3** `/hire-us` submit.</li><li>**S6** LeadMagnet CONTINUE: trigger the popup as rounds 188/190 did; if it does not appear, record exactly why.</li><li>**S7** ConfirmDialog: try add to cart → remove on `/cart` with the mock; if no destructive confirm opens, record it and rely on ST5.</li><li>**S1/S2** `Button` buy/destructive: any store page that renders them, or say none does.</li><li>**S8** ChatButton: not mounted on any route at `caa09af` → "not reachable", ST5 only.</li><li>**S9** ForgetPassword success state needs a successful reset call (Firebase not configured) → **BLOCKED — backend unavailable in cloud** unless it renders; ST5 covers the class.</li><li>**S4** account.orders: **BLOCKED — backend unavailable in cloud** (needs a signed-in user).</li></ul> | Every reached site: dark text (`rgb(14,13,12)`) on its fill, ≥ 4.5:1 rest and hover (S9 icon ≥ 3:1). Unreachable/blocked sites are listed as such, never as PASS. |
| **KEEP-193** (binding keep-list) | On `/` (and wherever they render): the LeadMagnet "FREE DOWNLOAD" popup **including the CONTINUE button text**, the Free Samples nav link (desktop + mobile menu), SpecialOffers, the "Limited" badges, the testimonials and stats ("2,500+ Happy Customers", "Netflix Original Score"). | `innerText` of each is byte-identical to HEAD, and each is still mounted where it was (same parent route, same order). Only colours may differ. A missing element that is also missing at HEAD (C-R188-I6 testimonials) is recorded, not failed. |
| **STORE-LAYOUT-193** | `/`, `/store`, `/products/middle-east` × 3 viewports, tree vs HEAD at the same scroll and state: bounding boxes of header, nav items, h1, hero, each section root, product cards, the product page main column (incl. Buy Now), the footer. | Every box unchanged ± 1 px. |
| **STORE-SHOTS-193** (evidence) | Before/after full-page shots of the three pages × 3 viewports, plus a side-by-side montage, under `c-round-193/shots/store-after/`. | Evidence only; one line per page on what changed visibly. Passes when the shots exist and the description matches them. These are STORE-2b's baseline. |
| **PERF-193** | Home `/`, fresh context, 3 runs per viewport: LCP and CLS (PerformanceObserver, as round 190). | LCP median ≤ 2.5 s; CLS median < 0.1 at each viewport. |
| **RM-193** | `prefers-reduced-motion: reduce` on `/`. | The entrance loader is off and no new animation appears (spot check). Same as HEAD. |
| **STUDIO-RV-193** | `/studio-lab` rest at 1440 and 1280 vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, **no mask**. At 1440: open the grid menu, the marker menu and **the export dialog (mandatory: `Modal.tsx` is granted)**, and compare each crop with HEAD. | **0 changed px** at rest and in the three overlays. 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **G193-3** | As G192-3. | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge present. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. studio-token with no header → 401; with a fake Bearer → 403 (mock-backed). |
| **SCOPE-193** | The frozen list (1012) at C's start and end, from the store root; A's `end-sha256.txt`; `git status`; `git diff caa09af` per granted file. | Frozen list OK at both ends. `git status` is exactly the 10 granted ` M` + 2 `??` (doc 157 counts among the 10). `app.css` diff touches **only** §1 declarations inside `@theme` (value, plus an optional same-line comment); the obsidian block and `:focus-visible` rule are byte-identical. Each of the 8 component/route diffs is exactly **one changed line** swapping `text-foreground` → `text-brand-foreground` at its S-site (`Button.tsx`: two lines, S1 and S2). Doc 157 diff is 2 lines. |
| **T-RUN-193** | T1 on the tree and on the start copies. Mutants on the end copy: m1 store `--color-brand` back to `hsl(175, 85%, 46%)`; m2 one obsidian value changed (e.g. `--color-muted`); m3 `--color-secondary` back to `hsl(220, 10%, 70%)`; m4 `buy` variant back to `text-foreground`; m5 hire-us submit back; m6 `--color-buy` back to `#006AFF`; **m7** PurchaseHeader Buy Now back to `text-foreground`; **m8** the Modal destructive string back; **m9** `CONTINUE` changed to `Continue` in LeadMagnetPopup. | T1 green on the tree. ST1, ST2, ST3, ST5 red on the start copies. m1 → ST1 (and ST3) red; m2 → ST1/ST4 red (and TH2 red); m3 → ST2 red; m4, m5, m7, m8, m9 → ST5 red; m6 → ST2/ST3 red. |
| **AN-REVIEW-193** | Read the diff, T1, D1, D2. | Only §1 values in `app.css`, no new rule or selector; no `as`, `any` or `@ts-ignore`; T1 parses the real files and would catch drift; D1 in Georgian, status `In Progress (awaiting C round 193)`, R72–R76 with rejected alternatives, K0's tables, S1–S9, the split; D2 exactly 2 lines. |
| **DOC157-193** | doc 157 l.4 and l.60. | Status `Completed (C round 191 PASS, caa09af)`; `FS0–FS7`. |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror; 0 hydration messages; 0 non-font remote requests; 0 Authorization headers from the page. |

**Outcomes written in advance:**
- Remaining teal in hardcoded classes, inline styles, gradients, glows, loaders or emails is **expected** (STORE-2b): inventory (page, selector, colour) for B, not a FAIL.
- Fonts do not change this round (Inter stays in the store). A font difference vs HEAD is a FAIL.
- Any Studio pixel change at rest or in the three overlays is a **regression FAIL (Medium)**.
- Any store layout move beyond ± 1 px is a **regression FAIL (Medium)**.
- A keep-list text change or a missing keep-list element (that HEAD has) is a **FAIL (Medium, binding Saba rule)**.
- The purchased `/studio/:id` workspace (legacy `components/studio/**`) consumes store tokens and cannot be opened without a backend: **BLOCKED — backend unavailable in cloud** (BACKEND-ONLY-EVIDENCE / TECH-LEAD-MANUAL). Its "Sign in required" gate page is checked in G193-3.
- New Lows go to `deferred_low_polish`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **SCOPE row honesty:** do not put SCOPE-193 in `passed` under a reinterpreted criterion. If A stops again without implementing, SCOPE-193 is `notRun` with a `scopeNote`.

**Adjacent behaviour that could break, with the check that catches it:**
- A shared component in the Studio reads a changed, non-overridden token, or the `Modal.tsx` edit leaks into the export dialog → K0 table, SCOPE-193 one-line diff, STUDIO-RV-193 export-dialog crop.
- A test or e2e spec asserts an old colour or class → neighbour suites (A), the e2e grep, the gate's full run.
- Ivory text left on a fill somewhere → K0 re-scan, CONTRAST-193, BRASS-TEXT-193.
- The keep-list CONTINUE copy changed by accident → ST5 literal, m9, KEEP-193.
- The global `:focus-visible` outline turns brass on the store (intended; reads `--color-brand`) → CONTRAST-193 ring ≥ 3:1.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store colour palette | **None.** This round changes the store web pages, not Arrangement behaviour. | Nothing. | Saba's approved store direction A (Obsidian & Brass), CZABA's own design. | Parity: **არ ეხება**. Do not claim "Ableton does the same". |

## 6. Evidence and reporting
- **A:** `a-round-193.md` and `a-round-193/`: K0 re-scan, token probe, shots, Studio 0-px diff, keep-list capture, tests and the review.
- **C:** `c-round-193.md`, `c-round-193.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `notRun` / `gate`) and `c-round-193/`.
- **Both:** write report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 194 |
|---|---|
| **C PASS** (`browserVerified=true`) and planning on or after **2026-10-27** | Root publishes round 193; STORE-2a → **მზადაა**. Round 194 is the **REGRESSION round** (`REGRESSION-ROUND-2026-10-27`; scope in `backlog.json`, incl. SABA-B-3 one fader per kind with the C-R191-I1 ruling and the STORE-2a token probe). STORE-2b follows it. |
| **C PASS** and planning still on 2026-10-26 | Round 194 = STORE-2b. The regression comes at the first planning on or after 2026-10-27. |
| **C FAIL** on a STORE-2a row (tokens, contrast caused by this round, brass text, keep-list, layout, Studio pixels) | A bounded fix-up in round 194, before the regression round (a Medium this round caused). |
| A stops again at K0 with a site outside S1–S9 | B re-grants once more with the new site; the planning cost is recorded for the RETRO. |
| A browser row that can run here did not run | `browserVerified=false`. STORE-2a is not done; B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the 10 grants and the 2 new files, against `caa09af`.
- **R76 acknowledgement requested (non-blocking):** the keep-list LeadMagnet CONTINUE button changes text colour only (ivory → `#0e0d0c`; copy, size, position, behaviour unchanged). B's reading: this is the "restyle" the keep-list allows. Root or Saba may veto; the round proceeds meanwhile.
- **Root decision still requested (STORE-2c/2d, not this round):** a narrow grant of `app/root.tsx` — for 2c the `links()` font entries only; for 2d the Lenis reduced-motion guard only, unless it can live entirely in `useSmoothScroll`. Fallback if declined: fonts from `app.css` (`@import`) and the deviation recorded for Saba.
- **For Saba (vetoable, nothing scheduled):** C-R191-01 (level-fader thumb vs brass fill 1.82:1: (a) dark thumb edge or (b) accept as R68); R72–R76.
- **Signals recorded, not scheduled:** `GLOBAL-FOCUS-VISIBLE-UNLAYERED` (RETRO systemic candidate), `ARCH-R191-PAN-RING-COUPLING`, `STORE2A-PROTECTED-BRASS-TEXT`.
- **Checkpoint:** `b-round-183-checkpoint-request.md` still unanswered; fallback (c) continues; next checkpoint point: the STORE-REDESIGN exit.
- **Root request C-R188-I3** (mock has no `digital-gift-card` product) still open; nothing is blocked by it.
