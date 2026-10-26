# C round 195 — STORE-2a fix-up 2 verification (C-R194-01 GuestForm, R80 recordings constants, C-R194-02 whole-tag ST8b)

**Verdict: PASS** · `browserVerified=true` · `realVerified=true` · Ableton parity: **არ ეხება** (these are store web pages and a test guard, not Arrangement behaviour; no "Ableton does the same" claim is made)

- Every row that can run in the cloud passed in a real browser or a real test run.
- RECORDINGS-195 is **BLOCKED** (backend unavailable in cloud). Only ST8 R1–R4 cover it at source level. It is not passed.
- Gate rows are left to root.
- C opened no new bugs this round.

## Setup
- **Browser:** Playwright Chromium (headless shell).
  - Every page got a fresh anonymous context with no credentials.
  - DPR 2, `--disable-lcd-text`.
  - The shared dev server :5173 was used, not restarted.
- **Mock API:** :5199 was not listening at start. C started `mock-api/server.mjs` (node PID 8326; `mock.pid` holds its bash wrapper 8325, and both were stopped; log `c-round-195/mock.log`) and stopped only its own processes at the end.
- **"Before" references:**
  - **ref (round-194 tree):** `c-round-195/ref`, a copy of the current tree with the 5 source grants replaced from `b-round-194/r195-granted-start/`. The GuestForm sha equals the start hash. Served on :5174 with its own cacheDir.
  - **head (`caa09af`):** `c-round-195/head`, whose `app/` was checked to equal `git archive caa09af app`. Served on :5175.
  - C stopped both servers at the end; :5173 was not touched.
- **Tools:** `c-round-195/tools/`.
  - Reused from C round 194: `fields194.cjs`, `store194.cjs` (+ `/support`, `/about`), `analyze194.cjs`, `popup194.cjs` (+ head), `rv193.cjs`, `g194-3.cjs`.
  - New: `guest195.cjs` (error state and boxes, tree vs ref vs head) and `trun/mut.sh`.

## Rows

| Row | Result | Evidence |
|---|---|---|
| **GUEST-BORDER-195** (C-R194-01) | **PASS** | <ul><li>`#guest-name` and `#guest-email`, unfocused, border pixel vs the pixel 2 CSS px outside, four edge midpoints. **3.70 / 3.70 / 3.70 / 3.70 at 1440, 1280 and 375** for both fields.</li><li>Border `rgb(115,107,96)` = `border-outline-strong`. R81 was not used, which matches A's record.</li><li>Ref (round-194 tree) 1.21 at every viewport. HEAD 1.62 (email; the name probe timed out on a cold load and its class is the same). So the fix beats HEAD.</li><li>Keyboard focus (Shift+Tab, Tab): `:focus-visible` true, border brass `rgb(201,164,106)`.</li><li>Empty submit: both fields `border-destructive focus:border-destructive`, `rgb(210,119,106)`, with "Name is required" and "Email is required". The error state equals ref at all 3 viewports. HEAD's red differs only because of round 193's token.</li><li>Field boxes: tree = ref = head (Δ 0) at 3 viewports.</li><li>Files: `out/fields-tree-*.json`, `out/fields-ref-*.json`, `out/fields-head-1440*.json`, `out/guest195-*.json`, `shots/fields/`, `shots/guest/`.</li></ul> |
| **FIELD-SPOT-195** | **PASS** | <ul><li>F1 (`/` newsletter) min **3.13** at 1440 (also 3.13 at 1280 and 3.12 at 375).</li><li>F2 (`/store` search) **3.64** at 1440, 1280 and 375.</li><li>Both are within ±0.05 of C round 194 (3.13 / 3.64).</li><li>The first F1 1440 probe hit a screenshot clip error. The rerun measured it (`logs/fields-tree-1440-F1b.log`).</li></ul> |
| **RECORDINGS-195** | **BLOCKED** | Backend unavailable in cloud: the mock answers sign-in-required. Source is covered only by ST8 R1–R4 (green), and T-RUN m17 proves the R2 row bites. |
| **CONTRAST-195** | **PASS** | <ul><li>`/`, `/store`, `/products/middle-east`, `/hire-us`, `/free-downloads`, `/support` and `/about` at 1440, 1280 and 375, tree vs ref.</li><li>0 text samples got worse (Δ > 0.05) and 0 token mismatches.</li><li>Home has the same 12 low samples in tree and ref: the known StudioShowcase neutrals.</li><li>File: `out/store-compare-195.json`.</li></ul> |
| **KEEP-195** | **PASS** | <ul><li>LeadMagnet steps 1–2 `innerText`, CONTINUE, the placeholder attribute "Enter your email address", SpecialOffers, `Limited Collection`, section order and the `/about` stats are identical in tree, ref and **HEAD** at all 3 viewports (`out/popup194-*.json`).</li><li>Free Samples is in the desktop header and the 375 mobile menu, the same as ref.</li><li>The first 1440 popup run crashed on a cold-load navigation; the rerun is clean.</li></ul> |
| **STORE-LAYOUT-195** | **PASS** | <ul><li>All 7 pages × 3 viewports, tree vs ref: 0 boxes moved more than 1 px.</li><li>The GuestForm field and form boxes, chat open, are covered by `guest195` (Δ 0).</li><li>The first 1440 run flagged home `h1` (Δ 49.7) with extra texts "Get Your / FREE DOWNLOAD": the timed LeadMagnet popup opened during the tree capture only. The rerun gave 0 bad boxes and identical text sets (`out/store-*-1440-run1.json` vs `store-*-1440.json`). None of the 5 changed files renders on `/`.</li></ul> |
| **STUDIO-RV-195** | **PASS** | <ul><li>`/studio-lab` rest vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, no mask: **0 changed px, maxDelta 0** at both viewports.</li><li>0 errors and 0 hydration messages.</li><li>At 1440 the grid menu, marker menu and export dialog open.</li><li>No cold-load replacement was used.</li><li>Files: `out/rv-tree-{1440,1280}-1.json`.</li></ul> |
| **G195-3** | **PASS** | <ul><li>`/studio-lab`: `auth_user` null, 0 cookies, workspace and demo badge present.</li><li>`/studio/middle-east` at 1440 and 1280: "Sign in required", 0 `audio[src]`, no workspace.</li><li>studio-token with no header → **401**; with a fake Bearer → **403**, no Set-Cookie.</li><li>0 page Authorization headers and 0 forbidden requests. Premium auth is **not** bypassed.</li><li>File: `out/g195-3.json`.</li></ul> |
| **SCOPE-195** | **PASS** | <ul><li>HEAD is `caa09af`.</li><li>Frozen list (1017) OK at C's start and end. A's `end-sha256.txt` OK at both ends.</li><li>`git status --short` is **26 lines = 24 ` M` + 2 `??`**, identical at start and end. It equals the planning status plus exactly GuestForm and the 4 Sfx files.</li><li>Grant diffs vs `r195-granted-start`: GuestForm 2 lines (67, 91), each one token. The 4 Sfx files 1 line each (`inputClass`), each one token. No reflow, so R79 was not needed.</li><li>Doc 158: only the status line (`4c4`) and an appended Round 195 section (`198a199,260`).</li><li>Test file (`out/test-diff.patch`), 5 hunks: `@@ -93` (scanner constants and the walker-guard constants; deletes `FIELD_SCAN_WINDOW_LINES`), `@@ -201` (appends G1/G2/R1–R4 and the ST8c fixtures after F16), `@@ -325` and `@@ -339` (`fieldClassRegion` and the scanner helpers), `@@ -518` (the ST8b `it` and ST8c). Every removed line belongs to the old window scanner or `fieldClassRegion`. No ST1–ST7 body or F1–F16 entry changed.</li></ul> |
| **T-RUN-195** | **PASS** | <ul><li>T1 on the live tree: **38/38 green**.</li><li>On the round-194 copy: **7 red** (ST8 G1, G2, R1–R4 and ST8b) and 31 green. ST8b lists exactly the 14 hits of B's `fieldscan2.mjs`.</li><li>m14 (token at tag+14 in `hire-us`) → ST8b red, `hire-us.tsx:191`.</li><li>m15 (`const fieldClass` on a new `<input>` in `store.tsx`) → ST8b red, `store.tsx:119 via fieldClass`.</li><li>m16 (G1 back) → ST8 G1 and ST8b red.</li><li>m17 (R2 back) → ST8 R2 and ST8b red.</li><li>m18 (a `<section>` with no field) → green.</li><li>Extra C probe m19 (`<textarea onChange={(e) => e}` plus a template-literal className with a bare token) → ST8b red.</li><li>B's `fieldscan2.mjs app` on the tree: 0 hits. C's separate `grep -P` attempt failed on a flag conflict and was not rerun; ST8b and fieldscan2 cover the same ground.</li><li>Files: `trun/trun.txt`, `trun/*.log`.</li></ul> |
| **AN-REVIEW-195** | **PASS** | <ul><li>Only the listed tokens changed in source.</li><li>`grep -E '\bas\s+\w|\bany\b|@ts-ignore'` on the test file: 1 match, inside the fixture string `'(ii) same-file string constant used as className'`. So there are 0 type escapes.</li><li>ST8b scans whole tags. `jsxTagEndIndex` tracks brace depth and quotes, so the `>` of `=>` is at depth ≥ 1 inside `{}` and does not end the tag. `bareOutlineConstantNames` follows same-file constants up to `;`.</li><li>The walker guard requires 4 known files and at least 50 tags.</li><li>Doc 158's Round 195 section is in Georgian. It contains C-R194-01/02 with 1.21/1.62, R80–R82 with the rejected alternatives (a)/(b), G1/G2 and R1–R4, 3.70 with `border-outline-strong`, the BLOCKED recordings rows, and the RETRO note.</li></ul> |
| **PX-NET / REG-HYD** | **PASS** | Every session: 0 pageerror, 0 hydration messages, 0 Authorization headers from the page, 0 non-font remote requests. |
| Gate rows | `gate` | Full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL are not C's. |

## Bugs
None new.
- **C-R194-01:** fixed and verified (3.70:1 at 3 viewports).
- **C-R194-02:** fixed and verified (m14 is now red).

## Notes for B / root
- **Signals, not bugs:** A's open scanner Lows from the R195 reviewer (#3 typed/`clsx` constants, #4 one-level constants, #5 side variants, #6 quote desync). None reproduces in the current tree. They stay recorded with `A-R194-REVIEW-LOWS`.
- **Gate:** per §7, a C PASS lets root publish rounds 193 + 194 + 195 (24 M + 2 new) against `caa09af` after the gate.
- **Next round:** the regression round is due at the first planning on or after 2026-10-27.
- **Still BLOCKED (backend):** the recordings/scenes fields (R1–R4), F11–F13 `/account` and F16 `ChatInput`.
