# C round 194 — STORE-2a fix-up verification (C-R193-01 / C-R193-02)

**Verdict: FAIL** · `browserVerified=true` · `realVerified=true` · Ableton parity: **არ ეხება** (store pages, no Arrangement behaviour)

A's 13 granted changes are correct, and every granted row passes in the real browser. The round fails on the pre-written outcome rule "any reached field below 3:1 after the change → FAIL (Medium)":
- **C-R194-01:** the anonymous `/support` guest-chat fields (`GuestForm.tsx:67/:91`, not granted) measure **1.21:1**. HEAD `caa09af` gave **1.62:1**, so round 193 caused this and it is still open.
- **C-R194-02:** the new ST8b class guard false-passes this layout.

This is the §7 "A stops at K0 → B re-grants" path, not an error in A's granted work. A reported both problems itself; C reproduced them independently.

## Setup
- **Browser:** Playwright Chromium (headless shell), fresh anonymous context per page, DPR 2, `--disable-lcd-text`. The shared dev server :5173 was not touched.
- **Mock API:** :5199 was not listening at start. C started `mock-api/server.mjs` (PID 7731, log `c-round-194/mock.log`) and stopped only that PID at the end.
- **"Before" references:**
  - **ref**: the round-193 tree. It is the current tree with the 13 grants replaced by `b-round-193/r194-granted-start/` (start-hash check OK), served by C on :5174 with its own cacheDir (PID 7835).
  - **head**: `git archive caa09af`, served on :5175 (PID 11276). Used for GuestForm and F2.
  - Popup texts were compared against C round 193's HEAD numbers (`c-round-193/out/popup-*.json`).
  - Both reference servers were stopped at the end.
- **Tools:** `c-round-194/tools/`
  - `fields194.cjs` samples all four edge midpoints.
  - `popup194.cjs` and `phpx.cjs` (inner-region pixel histogram).
  - `store194.cjs` and `analyze194.cjs`.
  - Reused unchanged: `rv193.cjs`, `g194-3.cjs`.
  - `trun/mut.sh`.

## Rows

| Row | Result | Evidence |
|---|---|---|
| **PLACEHOLDER-194** | **PASS** | <ul><li>Placeholder pixel `rgb(110,110,109)` on white = **5.10:1** at 1440, 1280 and 375. The round-193 tree (ref) gave `rgb(146,138,125)` = 3.41.</li><li>Typed `a@b.co` is `rgb(0,0,0)` = 21:1, so the placeholder is visibly lighter than the value.</li><li>The attribute `Enter your email address`, step-1 and step-2 `innerText` and `CONTINUE` are identical to HEAD at all 3 viewports.</li><li>Files: `out/popup194-*.json`, `out/popup-phpx.json`, `shots/popup/*-tree-input{,-typed}.png`.</li></ul> |
| **FIELD-BORDER-194** | **FAIL** (all granted sites pass; the row fails on the reached GuestForm field, next line) | <ul><li>Minimum of the four edge midpoints, tree (1440 / 1280 / 375):<ul><li>F1 3.13 / 3.13 / 3.12 (tight edge: top);</li><li>F2 3.64 ×3;</li><li>F3–F6 3.70 ×3.</li></ul></li><li>At 1440: F7 3.50 (after clicking Download), F8 3.30, F14 sign-in email/password and sign-up 3.50.</li><li>Ref at the same sites: 1.02–1.21. HEAD F2 1.60. So every granted field is better than HEAD.</li><li>F1 did not need the `border-dim` fallback.</li><li>Keyboard focus (Shift+Tab, Tab): `:focus-visible` true everywhere; the border becomes brass, or brand/50 plus the global brass outline (`shots/fields/*-focus.png`).</li><li>Field box sizes tree = ref (Δ 0).</li><li>File: `out/fields-summary-194.json`.</li></ul> |
| FIELD-BORDER-194 outcome rule | **FAIL → C-R194-01** | GuestForm `/support` 1.21 at all 4 midpoints × 3 viewports (ref 1.21, HEAD 1.62). |
| F9/F10 `/cart` | not reachable | Empty mock cart: the inputs do not render (tree and ref). Round 193 recorded mock 501 on add-to-cart. ST8 only. |
| F15 `Textarea` | not reachable | No route renders it. ST8 only. |
| F16 `ChatInput` | **BLOCKED** | Backend unavailable in cloud: `/api/chat` is sign-in-required in the mock, so Live Chat → Start Chat gives no session. ST8 only. |
| F11–F13 `/account` | **BLOCKED** | Backend unavailable in cloud (needs a signed-in user). |
| `recordings/` constants | **BLOCKED** | Backend unavailable in cloud (the mock answers sign-in-required). Not measured, not passed. |
| **CONTRAST-194** | **PASS** | <ul><li>`/`, `/store`, `/products/middle-east`, `/hire-us` and `/free-downloads` at 1440, 1280 and 375, tree vs ref: 0 token-coloured text samples got worse (Δ > 0.05).</li><li>The text sets are identical and there are 0 token mismatches.</li><li>Home has 12 low samples in both tree and ref: the known hardcoded StudioShowcase neutrals, the same as round 193.</li><li>File: `out/store-compare-194.json`.</li></ul> |
| **KEEP-194** | **PASS** | <ul><li>Popup steps 1–2, CONTINUE and the placeholder equal HEAD.</li><li>SpecialOffers, `Limited Collection`, section order and `/about` (2,500+) equal HEAD.</li><li>Free Samples is in the desktop header and in the 375 mobile menu (same as ref).</li><li>The `/free-downloads` keep block equals ref.</li></ul> |
| **STORE-LAYOUT-194** | **PASS** | <ul><li>`/`, `/store`, `/hire-us`, `/free-downloads` (and product) × 3 viewports: 0 boxes moved more than 1 px.</li><li>The first 375 tree run flagged 4 hidden 0×0 desktop header links on `/store`, offset by scrollY = 8. A rerun gave 0 differences, so it was a measurement artifact (`out/store-tree-375-run1.json` vs `store-tree-375.json`).</li></ul> |
| **STUDIO-RV-194** | **PASS** | `/studio-lab` rest vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, no mask: **0 changed px** at both viewports. 0 errors, 0 hydration messages. The grid menu, marker menu and export dialog open at 1440. No cold-load replacement was needed. Files: `out/rv-tree-{1440,1280}-1.json`. |
| **G194-3** | **PASS** | <ul><li>`/studio-lab`: `auth_user` null, 0 cookies, workspace and demo badge present.</li><li>`/studio/middle-east` at 1440 and 1280: "Sign in required", 0 `audio[src]`.</li><li>studio-token with no header → 401; with a fake Bearer → 403.</li><li>File: `out/g194-3.json`.</li></ul> |
| **SCOPE-194** | **PASS** | <ul><li>HEAD is `caa09af`. The frozen list (1011) is OK at C's start and end, and A's `end-sha256.txt` is OK at both ends.</li><li>`git status --short` is 21 lines (19 ` M` + 2 `??`), the exact expected set, and identical at start and end.</li><li>Grant diffs against `r194-granted-start`:<ul><li>P1 1/1;</li><li>every F-site one token (hire-us 4, account 3, Input 2, the rest 1);</li><li>no reflow, so R79 was not needed;</li><li>the test file +218/−0;</li><li>doc 158 changes the status line (hunk `4c4`) and adds one section (`118a119,198`).</li></ul></li></ul> |
| **T-RUN-194** | **PASS** (as specified) | <ul><li>T1 on the live tree: 24 green.</li><li>On the start copies: ST7, ST8 ×16 and ST8b red; ST1–ST6 green.</li><li>m10 → ST7 red. m11 → ST8 (F2) and ST8b red. m12 → ST8 (F14) red. m13 → ST8b red.</li><li>`STORE_THEME_TOKENS_ROOT` is honoured (test line 6).</li><li>File: `trun/trun.txt`.</li></ul> |
| **AN-REVIEW-194** | **FAIL → C-R194-02** (other clauses pass) | Only the listed tokens changed; no `as`, `any` or `@ts-ignore` in the diff; doc 158 is in Georgian with R77–R79, the rejected alternatives, F1–F16 and the forbidden legacy sites. But **ST8b would not catch a new faint field** laid out like GuestForm: C's probe m14 (token at tag+14) stays green, and the live tree is green while GuestForm is bare. |
| **PX-NET / REG-HYD** | **PASS** | Every session: 0 pageerror, 0 hydration messages, 0 Authorization headers from the page, 0 non-font remote requests. |
| Gate rows | `gate` | Full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL are not C's. |

## Bugs for B

### C-R194-01 (Medium): `/support` GuestForm border 1.21:1, a round-193 regression
- **Steps:**
  1. Open a fresh anonymous context at any viewport.
  2. Go to `/support` and click "Live Chat".
  3. Sample the border of `#guest-name` or `#guest-email` against the pixel 2 CSS px outside it, at the four edge midpoints.
- **Actual:**
  - Border `rgb(36,33,30)` (`--color-outline`), 1.21:1 at all four midpoints and all three viewports.
  - HEAD gave 1.62:1, so round 193 made it worse.
  - Focus state is fine (brass, 5.98:1).
- **Source:** `app/components/chat/GuestForm.tsx:67` and `:91`, `'border-outline focus:border-brand'`. Not in the round-194 grants.
- **Suggested re-grant:** the same R78 swap to `border-outline-strong`. F3–F6 sit on a similar surface and measure 3.70 with it.

### C-R194-02 (Medium, test-only): ST8b false-passes a field whose class sits 14 lines below the tag
- The scan window is tag + 13 lines, and it does not follow class constants. Confirmed by m14 and by the green live tree.
- This is why the guard did not catch C-R194-01.
- In the re-grant round, ST8b should take the whole tag up to its closing `>` or `/>` and follow same-file class constants. It must be red on GuestForm before the fix.
- Optionally, the round could also fix `b-round-193/tools/fieldscan.mjs` (A's RETRO input).

## Notes for B / root
- **Inventory needing a backend:** the `recordings/` constant-styled fields (`SfxSoundLibrary:68`, `SfxSceneBuilder:112`, `SfxVideoSync:25`, `SfxQuickEdit:183`) have the same bare `border-outline` on `bg-background`.
  - They can only be checked with a backend. B must decide whether they are store or Studio-adjacent scope.
  - They are BLOCKED here, not passed.
- **Per §7:** round 195 is one more bounded fix-up (GuestForm, plus the ST8b strengthening), before the regression round. The round-193 + 194 work stays uncommitted, and STORE-2a is **not** მზადაა.
- **For Saba (vetoable, from B):** R77 and R78 look good in the browser. The placeholder is clearly lighter than typed text, and the field borders are visible without being loud.
