# CURRENT TASK — Round 192: STORE-2a — the store `@theme` colour tokens move to Obsidian & Brass (tokens only; the Studio stays pixel-identical)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z157** (`backlog.json` → `post_current_stage_queue` STORE-REDESIGN `split_d29z157` / `store2a_plan_d29z157`, `narrow_grants` round 192, `rounds[192]`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, the "Store redesign (Saba approved, 2026-10-25)" section and `lessons.md` in the loop folder (still empty; no RETRO yet). They take precedence over older text.
- **Previous task:** `tasks/round-191.md` is an exact copy of the round-191 `current-task.md` (checked with `cmp`). The reasoning for this round is in `b-round-191.md`.
- **Spec (DATA, Saba-approved):** `/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md`, row STORE-2: "Move the store `@theme` to Obsidian & Brass … Text brightness: titles #ECE6DA, body around #CFC7BA, captions #A39B8E … **Do not** add `data-studio-theme` to store markup … Coordinate any `app.css` edit with the Studio's obsidian block, which must stay byte-identical." Direction A is decided (`direction-decision.md`, 2026-10-25).

## Baseline = HEAD `caa09af` (gate 191 published), clean tree
- **Gate:** `gates/gate-round-191.json` is `published`, commit `caa09af`, both remotes match. `git status` is clean (B checked: 0 lines). 1022 tracked paths.
- **Frozen list:** `b-round-191-r192-tree-sha256.txt`, **1017 entries** (1022 minus the 5 grants). B checked it from the store root: OK.
- **Grants (existing files, narrow; `backlog.json` → `narrow_grants` round 192):** `b-round-191-r192-grants.txt`
  - `app/styles/app.css` — **only the values** of the `--color-*` declarations listed in §1 inside the store `@theme { … }` block (l.31–177 at `caa09af`). Every other byte is identical: the rest of `@theme` (spacing, typography, radius, shadows, gradients, glow colours, decorative colours, animation), line 1 (Inter `@import`), the global `:focus-visible` rule (l.379), the obsidian block (l.3920–3943) and everything else.
  - `app/components/ui/Button.tsx` — the text token of the `buy` and `destructive` variants only.
  - `app/routes/hire-us.tsx` — l.311 (the submit button) text token only.
  - `app/routes/account.orders.tsx` — l.231 (the CTA link) text token only.
  - `docs/implementation/2026/quarter-IV/157-saba-b-3-fader-pressed-state.md` — l.4 status line and l.60 "FS0–FS6" only.
- **New files:** `b-round-191-r192-new-files.txt`, both free at `caa09af`:
  - `app/lib/__tests__/store-theme-tokens.test.ts`;
  - `docs/implementation/2026/quarter-IV/158-store-2a-colour-tokens.md`.
- **Start hashes:** `b-round-191-r192-granted-start-sha256.txt`. **Start copies:** `b-round-191/r192-granted-start/`.
- **A's first step:** check these three things. If anything differs, stop and report.
  1. HEAD is `caa09af`.
  2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-191-r192-tree-sha256.txt`, run **from the store root**, is OK.
  3. The five start hashes match.
- **Mock API:** the store rows need it. If :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` from the loop folder and stop it at the end. Record which you did. Do not edit the mock.

## 0. Why this round
- **Round 191 closed.** C PASS (`browserVerified=true`, `realVerified=true`, 13 rows). Gate 191 published `caa09af`. **SABA-B-3 → მზადაა.** One Low, C-R191-01 (thumb vs brass fill 1.82:1), is inherent to Saba's R68 look. It goes to `deferred_low_polish` and to Saba as a design question; it is not scheduled.
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24 and today is still 2026-10-26 (2 days). The round-191 task fixed the outcome in advance: "Otherwise round 192 is the first STORE-2 sub-stage".
- **No Critical, High or Medium finding is open** that reproduces in the cloud.
- **STORE-2 is split** (one stage per round, nothing dropped; `split_d29z157`):
  - **2a (this round):** colour token values.
  - **2b:** the hardcoded teal sweep (37 uses in 14 TS/TSX files, 72 in `app.css` outside `@theme`), the glow blobs, the gradient text and `shadow-glow`.
  - **2c:** typography and font loading, together. Instrument Sans is loaded only by `studio-lab.tsx` today, so `--font-sans` cannot change for the store until `root.tsx` loads it. This needs a root decision (§8).
  - **2d:** motion (`--ease-bounce`, hover/reveal timings, reduced motion including Lenis).
- **Why tokens first:** every later stage builds on these values, and a token-only change is easy to verify (computed styles plus a pixel-identical Studio).

## 1. What changes (exact)

### Rulings (vetoable by Saba; record them in D1)
- **R72 — the store palette equals the Studio palette.** Each of the 18 colour keys that the obsidian block overrides takes **the same value** in the store `@theme`. So the two cannot drift, and `/studio-lab` renders exactly as before, because the block still overrides them there.
- **R73 — the text tones follow the spec.** Titles use `foreground` `#ece6da`. Body copy uses `secondary`, which becomes `#cfc7ba`. Captions use `muted` `#a39b8e`. This round changes **only the values**. Which element uses which token is STORE-2c work.
- **R74 — derived tokens.** `bg-alt` and `surface-glass` sat between two palette steps, so each takes the channel-wise midpoint of the new pair (rounded). `surface-glass-strong` stays equal to `surface`, as today. The `*-rgb` triplets follow brass. The commerce `buy` and `buy-hover` tokens become brass, because the spec says "the buy-blue leaves the store".
- **R75 — no ivory text on brass.** Ivory on brass is 1.88:1, and ivory on the new destructive red is 2.57:1. Both fail 4.5:1. The four **non-protected** controls that put `text-foreground` on a brass or destructive fill switch to `text-brand-foreground` (`#0e0d0c`): 8.32:1 on brass, 6.09:1 on destructive.
  - The protected `studio.$productId.tsx:440/471` and `account.downloads.tsx:261` have the same pattern. They stay untouched; signal `STORE2A-PROTECTED-BRASS-TEXT`. They were already about 1.5:1 on teal.
- **Unchanged on purpose:**
  - `info`, the `error-*` set, the social, decorative (crystal/premium), video and `blue-*` alias colours;
  - `glow-*`, every `--shadow-*`, every `--gradient-*` (STORE-2b removes or replaces them);
  - `--font-*` (STORE-2c);
  - the animation tokens (STORE-2d).

  The mixed look this leaves (brass plus a few remaining teal gradients and glows) is an expected intermediate state. It is not a FAIL of 2a.

| Token (store `@theme`) | `caa09af` | Round 192 | Basis |
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
- Where a trailing comment names the old colour (for example `/* Primary - #13D9CC */`, `/* Secondary - Orange */`, `/* #333640 - was 18% */`), A may update the comment text on the **same line** to match the new value, or leave it. Nothing else.

| ID | File(s) | Change |
|---|---|---|
| **K0** (evidence first) | none | <ol><li>For every token in the table, grep its Tailwind utility forms (`bg-`/`text-`/`border-`/`ring-`/`from-`/`to-`/`via-`/`shadow-`/`fill-`/`stroke-`/`outline-`/`divide-`/`placeholder-` + name) and `var(--color-name)` in **Studio-rendered** code: `app/components/arrangement/**`, `app/lib/arrangement/**` (non-test), `app/routes/studio-lab.tsx`, and every shared component that `/studio-lab` mounts (for example `app/components/ui/Toast.tsx` through root's `ToastContainer`, and `Modal` through `ArrangementExportDialog`). **Also the CSS side:** `app/styles/studio.css`, `app/styles/pages/studio.css`, `app/styles/base/utilities.css`, and the rules of `app.css` outside `@theme`. B counted 29 `var(--color-secondary|bg-alt|surface-glass|brand-rgb|…)` uses in `app.css` class rules (l.207–3629) and 0 in the other three. For each such selector, grep its class name in the Studio-rendered code above.</li><li>Record a table in `a-round-192.md`: token → Studio sites → "overridden by the obsidian block: yes/no".</li><li>A token with a Studio site that is **not** overridden may change only if A shows that the site is not rendered at Studio rest **and** names the state in which it shows. B found one: `Toast.tsx:82` `text-secondary`. Otherwise stop and report.</li><li>Grep every store site with `bg-brand`, `bg-accent`, `bg-buy`, `bg-destructive`, `bg-positive` or `bg-warning` together with a light text token (`text-foreground`, `text-white`, `text-secondary`, `text-muted`) on the same element. Record the list. Anything beyond B's four non-protected sites → stop and report (do not widen the grants).</li></ol> |
| **K1** (R72–R74) | `app.css` (`@theme` values only) | The 26 value changes in the table, exactly. |
| **K2** (R75) | `Button.tsx`, `hire-us.tsx:311`, `account.orders.tsx:231` | `text-foreground` → `text-brand-foreground` on: the `buy` variant (`'bg-buy text-foreground'`), the `destructive` variant (`'bg-destructive text-foreground'`), the hire-us submit button and the account.orders CTA. No other token, class order or behaviour change. |
| **T1** (new) | `store-theme-tokens.test.ts` | Read `app/styles/app.css` the way `audio-preview-player.test.tsx` and `studio-theme-obsidian.test.tsx` do (brace-matched `@theme` body). **Every case runs on comment-stripped CSS**, so a same-line comment that still names an old colour (allowed in §1) cannot turn ST3 red. Cases: <ol><li>**ST1:** each of the 18 colour keys of the obsidian block has **the identical value** in the store `@theme`. Parse both blocks, so that any future drift turns red.</li><li>**ST2:** `@theme` holds exactly the round-192 values for the 8 store-only keys in the table (`surface-glass`, `surface-glass-strong`, `secondary`, `bg-alt`, `brand-rgb`, `accent-rgb`, `buy`, `buy-hover`).</li><li>**ST3:** no `--color-*` declaration in `@theme` outside the unchanged list (§1 "Unchanged on purpose") contains `hsl(175`, `13d9cc`, `19, 217, 204`, `#006aff`, `#0052cc` or `#f9a91f` (case-insensitive). Name the exempt keys explicitly in the test. That exempt list is what STORE-2b shrinks.</li><li>**ST4:** the obsidian block is unchanged. It has exactly the 21 declarations TH2 already pins, and this case asserts the 18 colour values literally. TH2 in the frozen suite must also stay green.</li><li>**ST5:** in `Button.tsx`, the `buy` and `destructive` variant strings contain `text-brand-foreground` and not `text-foreground`. Every other variant string is byte-identical to the start copy, embedded as a literal. Also, the hire-us submit and account.orders CTA class strings contain `text-brand-foreground` together with `bg-brand`. Read their sources and locate the elements by a stable substring, not by line number.</li><li>**ST6:** no store markup gains `data-studio-theme`. Count the occurrences under `app/` excluding `__tests__`: the count equals the round-191 count, which A measures at the start and records.</li></ol>jsdom cannot paint. The look and the contrast are browser acceptances (§4). |
| **D1** (new) | doc 158 | Georgian, following `docs/implementation/TEMPLATE.md`: <ul><li>status `In Progress (awaiting C round 192)`;</li><li>R72–R75 with their rejected alternatives: (a) changing the Studio-overridden keys to different store values (rejected: drift); (b) a `data-studio-theme` on store markup (rejected: TH4 and the spec); (c) leaving ivory on brass (rejected: 1.88:1);</li><li>K0's Studio-consumption table and the brass-text site list;</li><li>the 2b/2c/2d split with what each still owns;</li><li>a TODO: the protected brass-text sites, and the purchased `/studio/:id` legacy view, which consumes store tokens and cannot be seen in the cloud (Tech Lead / backend check).</li></ul> |
| **D2** (doc 157) | doc 157 | l.4 → `**სტატუსი:** Completed (C round 191 PASS, caa09af)`; l.60 `FS0–FS6` → `FS0–FS7`. Nothing else. |

**Unchanged on purpose (frozen list, byte-identical):**
- every other `app/styles/**` byte, `root.tsx`, `studio-lab.tsx` and every Studio-owned file;
- every component other than the three granted source files;
- every existing test, including `studio-theme-obsidian`, `audio-preview-player`, `panel-radius-ui`, `store-header-footer` and the `*-colour-ui` suites;
- the protected purchase/auth files, `public/`, `.claude/**`, `package.json` and the configs.

## 2. A — files you own (everything else is frozen)
- **Grants:** the 5 files above, each limited to its scope, and the 2 new files. Plus your own `a-round-192.md` and `a-round-192/`.
- **Protected, byte-identical:** every path in the frozen list. That includes the purchase/auth files (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `AuthContext.tsx`, `app/lib/auth.ts`, `firebase.client.ts`), `app/root.tsx`, `public/`, `.claude/**` and `package.json`. Do not touch `mock-api/` or any other loop file.
- **If a frozen test turns red** because of your change, change your implementation so that it stays green. If that is impossible without dropping a requirement, **stop and report** the exact failing assertion. Do not edit the frozen test.
- **Read first** (rule `read-primitives.md`):
  - primitives: `AGENT_DISCOVERABLE_CODE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md` (Button), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - prompts: `prompts/new-test.md`;
  - template: `docs/implementation/TEMPLATE.md`.
- Write `a-round-192/end-sha256.txt` (5 grants + 2 new files) and `a-round-192/diff-vs-start.patch` (grants against `b-round-191/r192-granted-start/`, new files in full). No commit and no push.

## 3. A — tests and checks (speed rules)
**Run:**
- `npx vitest run app/lib/__tests__/store-theme-tokens.test.ts`: green.
- **Neighbour suites**, all green:
  - `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`, `panel-radius-ui.test.tsx`, `affordance-colour-ui.test.tsx`, `fader-style-ui.test.tsx`;
  - `app/lib/__tests__/audio-preview-player.test.tsx`, `store-header-footer.test.tsx`;
  - every other test that reads `app.css` or asserts a store colour (A greps for `app.css`, `--color-`, `bg-brand` and `text-foreground` in `*.test.*` and lists what it ran).
- **e2e specs (frozen, run by the gate):** B grepped `e2e/` at `caa09af` for `hsl(175`, `13d9cc`, `19, 217, 204`, `006aff`, `0052cc`, `f9a91f` and `rgb(249`: 0 hits. A re-runs that grep, adds `text-foreground` / `bg-brand` / `secondary`, and records the result. If any frozen e2e assertion depends on a changed value, **stop and report** (no grant).
- **Red proof:** run T1 against the start copies (a temporary copy over the grants, then restore and check `end-sha256.txt`, or a scratch Vite alias). ST1, ST2, ST3 and ST5 must be red there; ST4 and ST6 may be green.
- `npm run typecheck`. `npm run lint`, reporting the count against round 191's 214 warnings + 1 info. `npx biome check` on every changed and new file: 0 errors.
- Do not run the full suite: that is the gate's job.

**Live proof** (Playwright Chromium on :5173, mock on :5199, DPR 2), saved under `a-round-192/`:
- At 1440×900, 1280×720 and 375×812, on `/`, `/store` and `/products/middle-east`: full-page shots, and `getComputedStyle(document.documentElement)` for the 26 tokens.
- `/hire-us`: the submit button's computed colour and background, with a crop.
- `/studio-lab` at 1440 and 1280: a rest shot compared with `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, **with no mask**: 0 changed px.
- The keep-list texts on `/` (see KEEP-192) captured before and after.

**Code review:** use the `code-reviewer` subagent (≥ 3 files). Pass its Architecture note to B verbatim. Fix its Medium+ findings within the grants.

## 4. C — rows
**Setup:**
- Real Playwright Chromium on the shared :5173 server, a fresh anonymous context, mock API on :5199 (start it if it is not listening, log `c-round-192/mock.log`, stop it at the end if you started it).
- A **HEAD reference** (`git archive caa09af`, served on its own port with its own vite `cacheDir`, as in round 191) for "before" shots and layout. Or use `c-round-190/shots/store-after/` and `c-round-191/shots/`, which round 191 proved equal to HEAD on the 9 non-scrolled shots.
- Viewports: store rows at **1440×900, 1280×720 and 375×812**; Studio rows at 1440×900 and 1280×720. Pixel reads at DPR 2 with `--disable-lcd-text`.

| Row | What | Pass |
|---|---|---|
| **TOKENS-192** | On `/`, `/store`, `/products/middle-east` × 3 viewports: `getComputedStyle(document.documentElement).getPropertyValue(...)` for the 26 tokens; `body` background colour. | Every token equals the §1 table (colour-normalised). `body` background = `rgb(14, 13, 12)`. No element on these pages carries `data-studio-theme`. |
| **CONTRAST-192** | Same pages and viewports. Sample at least: the nav links (rest and active), the h1/h2s, body paragraphs, captions/meta, prices, the primary and secondary buttons and their hover, the cart badge, form fields and placeholders on `/` (newsletter), the footer links. Record the foreground and background **as rendered** (pixel or computed, stating which), and the ratio. | Text ≥ 4.5:1 (large text ≥ 3:1), UI parts and focus ring ≥ 3:1, for every **token-coloured** sample. **Outcome rule:** <ul><li>A sample below the threshold whose colours come from a §1 token is a **FAIL (Medium, caused by this round)**, unless HEAD had the same or a lower ratio. Then it is pre-existing: record it as a Low.</li><li>A sample whose colour is a hardcoded teal, a gradient, a glow, or a token in the unchanged list is **STORE-2b inventory** (info, listed with selector and ratio), not a 2a FAIL.</li></ul> |
| **BRASS-TEXT-192** | `/hire-us` submit button (rest + hover) at 3 viewports; `Button` buy/destructive variants via any store page that renders them (if none renders them, say so and rely on ST5). `account.orders` needs a signed-in user. | Submit text = `brand-foreground` on brass, ≥ 4.5:1 rest and hover. account.orders: **BLOCKED — backend unavailable in cloud** (ST5 covers the class), not PASS. |
| **KEEP-192** (binding keep-list) | On `/` (and wherever they render): the LeadMagnet "FREE DOWNLOAD" popup (trigger it the way round 188/190 did, or record why it did not appear), the Free Samples nav link (desktop + mobile menu), the SpecialOffers section, the "Limited" badges, the testimonials and stats ("2,500+ Happy Customers", "Netflix Original Score"). | `innerText` of each is byte-identical to HEAD, and each is still mounted where it was (same parent route, same order). Only colours may differ. |
| **STORE-LAYOUT-192** | `/`, `/store`, `/products/middle-east` × 3 viewports, tree vs HEAD at the same scroll and state: the bounding boxes of header, nav items, h1, hero, each section root, product cards, the product page main column, the footer. | Every box is unchanged ± 1 px. A token-only change must not move anything. |
| **STORE-SHOTS-192** (evidence) | Before/after full-page shots of the three pages × 3 viewports, plus a side-by-side montage. | Evidence only. Describe in one line per page what changed visibly. This row passes when the shots exist and the description matches them. The new shots are STORE-2b's baseline. |
| **PERF-192** | Home `/`, fresh context, 3 runs per viewport: LCP and CLS (PerformanceObserver, as round 190). | LCP median ≤ 2.5 s; CLS median < 0.1 at each viewport. |
| **RM-192** | `prefers-reduced-motion: reduce` on `/`. | The entrance loader is off and no new animation appears (spot check). Same as HEAD. |
| **STUDIO-RV-192** | `/studio-lab` rest at 1440 and 1280 vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, **no mask**. Plus, at 1440: open the grid menu, the marker menu and the export dialog, and compare each crop with HEAD. | **0 changed px** at rest; the three overlays are 0 changed px vs HEAD. 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **G192-3** | As G191-3. | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge present. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. studio-token with no header → 401; with a fake Bearer → 403 (mock-backed). |
| **SCOPE-192** | The frozen list (1017) at C's start and end, from the store root; A's `end-sha256.txt`; `git status`; `git diff caa09af -- app/styles/app.css`. | Frozen list OK at both ends. `git status` is exactly the 5 granted ` M` + 2 `??`. The `app.css` diff touches **only** declarations inside `@theme` that are listed in §1 (value, plus an optional same-line comment); the obsidian block and the `:focus-visible` rule are byte-identical. The `Button`/`hire-us`/`account.orders` diffs change only `text-foreground` → `text-brand-foreground` at the granted sites. The doc 157 diff is 2 lines. |
| **T-RUN-192** | T1 on the tree and on the start copies (scratch alias). Mutants on the end copy: <ul><li>m1: the store `--color-brand` back to `hsl(175, 85%, 46%)`;</li><li>m2: one obsidian-block value changed (for example `--color-muted`);</li><li>m3: `--color-secondary` back to `hsl(220, 10%, 70%)`;</li><li>m4: the `buy` variant back to `text-foreground`;</li><li>m5: the hire-us submit back to `text-foreground`;</li><li>m6: `--color-buy` back to `#006AFF`.</li></ul> | T1 green on the tree. ST1, ST2, ST3, ST5 red on the start copies. m1 → ST1 (and ST3) red; m2 → ST1/ST4 red (and TH2 red); m3 → ST2 red; m4 → ST5 red; m5 → ST5 red; m6 → ST2/ST3 red. |
| **AN-REVIEW-192** | Read the diff, T1, D1, D2. | <ul><li>Only §1 values changed in `app.css`; no new CSS rule or selector.</li><li>No `as`, `any` or `@ts-ignore`.</li><li>T1 parses the real files and would catch drift (not just restating constants).</li><li>D1 is in Georgian, status `In Progress (awaiting C round 192)`, with R72–R75 and rejected alternatives, K0's tables and the split.</li><li>D2 is exactly 2 lines.</li></ul> |
| **DOC157-192** | doc 157 l.4 and l.60. | Status `Completed (C round 191 PASS, caa09af)`; `FS0–FS7`. |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror; 0 hydration messages; 0 non-font remote requests; 0 Authorization headers from the page. |

**Outcomes written in advance:**
- Remaining teal in hardcoded classes, inline styles, gradients, glows, the loaders or emails is **expected** (STORE-2b). Record it as inventory (page, selector, colour) for B; it is not a FAIL.
- The fonts do not change this round (Inter stays in the store). A font difference vs HEAD is a FAIL.
- Any Studio pixel change at rest, or in the three Studio overlays, is a **regression FAIL (Medium)**.
- Any layout move on the store pages beyond ± 1 px is a **regression FAIL (Medium)**.
- A keep-list text change or a missing keep-list element is a **FAIL (Medium, binding Saba rule)**.
- The purchased `/studio/:id` workspace (legacy `components/studio/**`) also consumes store tokens. It cannot be opened without a backend: **BLOCKED — backend unavailable in cloud**, recorded under BACKEND-ONLY-EVIDENCE / TECH-LEAD-MANUAL. The "Sign in required" gate page is checked in G192-3.
- New Lows go to `deferred_low_polish`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Adjacent behaviour that could break, with the check that catches it:**
- A shared component rendered inside the Studio reads a changed, non-overridden token → K0 table, STUDIO-RV-192 (rest + overlays).
- A hand-written test or e2e spec asserts an old colour → neighbour suites (A) and the gate's full run.
- Ivory text left on a brass fill somewhere B did not find → K0 grep, CONTRAST-192.
- The global `:focus-visible` outline turns brass on the store. That is intended (it reads `--color-brand`). CONTRAST-192 checks the ring at ≥ 3:1.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store colour palette | **None.** This round changes the store web pages, not Arrangement behaviour. | Nothing. | Saba's approved store direction A (Obsidian & Brass), CZABA's own design. | Parity: **არ ეხება** (not applicable). Do not claim "Ableton does the same". |

## 6. Evidence and reporting
- **A:** `a-round-192.md` and `a-round-192/`: K0 tables, the token probe, shots, the Studio 0-px diff, the keep-list capture, tests and the review.
- **C:** `c-round-192.md`, `c-round-192.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-192/`. The after shots of the three store pages become STORE-2b's baseline: `c-round-192/shots/store-after/`.
- **Both:** write report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 193 |
|---|---|
| **C PASS** (`browserVerified=true`) and planning on or after **2026-10-27** | Root publishes round 192, and STORE-2a → **მზადაა**. Round 193 is the **REGRESSION round** (`REGRESSION-ROUND-2026-10-27`; scope additions in `backlog.json`, now including SABA-B-3 one fader per kind with the C-R191-I1 ruling, and STORE-2a one token probe). STORE-2b follows it. |
| **C PASS** and planning still on 2026-10-26 | Round 193 = STORE-2b (the teal and glow sweep). The regression comes at the first planning on or after 2026-10-27. |
| **C FAIL** on a STORE-2a row (tokens, contrast caused by this round, keep-list, layout, Studio pixels) | A bounded fix-up in round 193. It goes before the regression round, because it is a Medium this round caused. |
| A browser row that can run here did not run | `browserVerified=false`. STORE-2a is not done, and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the 5 grants and the 2 new files, against `caa09af`.
- **Root decision requested (needed by STORE-2c and STORE-2d, not this round):** the spec requires loading the fonts in `app/root.tsx` (Instrument Sans, IBM Plex Mono, Noto Sans Georgian; removing the Playfair link at `root.tsx:37` and the Inter `@import` at `app.css:1`) and a global reduced-motion rule that covers Lenis (`useSmoothScroll`, called in `root.tsx`). `app/root.tsx` is in `global_forbidden_files`, and no round has granted it before. B asks root for a **narrow grant of `root.tsx`** for STORE-2c: the `links()` font entries only. For STORE-2d: the Lenis reduced-motion guard only, unless it can live entirely in `useSmoothScroll`. Saba's approved spec names `root.tsx`, and the file holds no auth or purchase logic. If root declines, B will plan 2c with the fonts loaded from `app.css` (`@import`, still render-blocking) and record the deviation from the spec for Saba.
- **For Saba (vetoable, nothing scheduled):**
  - **C-R191-01:** the level-fader thumb against the brass fill is 1.82:1. Options: (a) a dark thumb edge, or (b) accept it as part of your R68 look.
  - **R72–R75:** the store adopts exactly the Studio palette values. The commerce "buy" colour becomes brass, and text on brass buttons becomes dark.
- **Signals recorded, not scheduled:**
  - `GLOBAL-FOCUS-VISIBLE-UNLAYERED`, now with two rules (`app.css:379`, `base/utilities.css:79`) and the gate-191 reviewer's one-task proposal. It is the candidate systemic task for the first RETRO (round 200 or the STORE-REDESIGN exit).
  - `ARCH-R191-PAN-RING-COUPLING`.
  - `STORE2A-PROTECTED-BRASS-TEXT`.
- **Checkpoint:** `b-round-183-checkpoint-request.md` is still unanswered, so fallback (c) continues. Next checkpoint point: the STORE-REDESIGN exit.
- **Root request C-R188-I3** (the mock has no `digital-gift-card` product) is still open. Nothing is blocked by it.
