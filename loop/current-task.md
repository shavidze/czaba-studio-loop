# Round 448: STORE-2b-2b — the Hire-Us inquiry e-mail leaves teal and becomes readable in every mail client

**Planned by:** B, at the round 447 → 448 planning, 2026-11-11 (`b-round-447.md`).
- The advisor was available and was consulted after orientation and before writing.
- The round-447 task is archived as `tasks/round-447.md` (byte-identical copy made before this file was rewritten).
- **Baseline:** gate 447 is `published`, commit `cce5eda` [K1]. The store tree is at `cce5eda` and clean at planning [K2, K18, K19]. `context/head-sha.txt` still says `5df7717`; the gate's `commit` wins.
- **Regression:** not due (last 2026-11-10, round 425; due on or after 2026-11-13). **RETRO:** round 450.

## Why this round
- C round 447 PASS (`browserVerified`/`realVerified` true, C1–C15, 0 bugs) and gate 447 published `cce5eda`. **STORE-2b-2a is done** (D-29z1589).
- STORE-2b-2b was planned as "8 e-mail hits: `email.server.ts` 5 + `hire-us.tsx` 3". The planning grep changes that (D-29z1590):
  - **`app/lib/email.server.ts` is dead code.** It has 0 importers in `app`, `perf` and `e2e` [K5]. Its only export, `sendOrderPaidEmail`, lost its last caller in `3b094eb` ("Remove all Shopify code and migrate to backend API") [K21]. By the rule round 447 applied to `Timeline.tsx`, it is not restyled. It joins **LEGACY-DEAD-STORE-COMPONENTS**, with `PianoCurtainLoader.tsx` (0 users outside the barrels [K6]), for the next cleanup or ARCH-SPLIT round under Saba's legacy removal policy (2026-11-10). This round only changes its allow-list reason in `store-teal-sweep`.
  - **The 3 live hits are in the internal inquiry e-mail** that the `/hire-us` form's action sends to the site owner [K7]. B rendered the e-mail HEAD sends in Chromium, through the real `action` with `fetch` stubbed [K10]:
    - **In a light client (white background), 10 of 12 text elements fail WCAG contrast.**
    - The submitted name, project type and budget are `#fff` on white, i.e. invisible (1:1).
    - The headings and the e-mail link are teal at 1.78:1, and the labels `#888` at 3.54:1.
    - In a dark client (#121212), 1 of 12 fails: the footer, at 3.26:1.
    - The wrapper sets **no background**.
  - This is a pre-existing readability bug in the e-mail Saba receives: **B-R447-HIREUS-EMAIL-LIGHT-CLIENT** (Medium, pre-existing). A plain teal→brass swap cannot fix it, since brass on white is 2.33:1. The teal and the readability are fixed together; they are the same 30 lines of one template.
- **Two Lows from round 447 come along,** because this round owns `store-teal-sweep.test.ts` and they cost little:
  - **A-R447-REVIEW-L1:** pin exact allow-list counts.
  - **A-R447-REVIEW-L3:** also scan `perf/`.

  A-R447-REVIEW-L2 stays in `deferred_low_polish`.
- **Order (D-29z1583):** STORE-2b-2b → 2b-3 (`app.css` glow/gradient) → 2b-4 → STORE-2c… STEM-LANES is still `awaiting_user`.

## What changes (user-visible)
1. **The inquiry e-mail the site owner receives** after a `/hire-us` submit:
   - It paints its own dark Obsidian background, so it reads the same in light and dark mail clients.
   - Headings and values are light ink, labels and the footer muted, and the e-mail link brass. No teal.
   - Text, field order, subject, sender and reply-to are unchanged, and every user-supplied value is still HTML-escaped.
2. **Nothing on the `/hire-us` page changes:** form, copy, layout, validation and states. The e-mail's markup moves out of the route into a pure builder module, so tests and C can render it without sending mail.
3. **Nothing else changes:** no other page, no Studio file, no token.

## Reference
- **E-mail guidance in the Store spec: none found.** B searched `store-redesign-spec.md` for "e-mail"/"email" and got 0 hits [K17]; `direction-decision.md` has none either. B did not invent an e-mail reference.
- **Authority used instead:**
  - The Store palette, Obsidian & Brass, from the `@theme` block of `app/styles/app.css`: background #0e0d0c, surface #161412, foreground #ece6da, muted #a39b8e, outline #24211e, brand #c9a46a [K22]. It is pinned by test HE1.
  - Round 447's product-designer rulings: no glow; brass only on flat fills, strokes and the interactive accent; titles in light ink, as the wordmark ruling did.
- **Why an outer presentation table and not `<body>`:** the e-mail is an HTML fragment with no `<body>` of its own. Mail clients commonly drop `body` styles, and Outlook's Word engine honours `bgcolor` on tables and cells more reliably than a `div` background. So the background is painted three times, each with the `background-color` longhand:
  - an outer `<table role="presentation" bgcolor>`;
  - its `td`;
  - the content `div`.

  This hardening comes from the `tech-lead` sketch review (finding 2). Whether every real client keeps it cannot be proved in the cloud, which has no mail client. That half is the Tech Lead manual row **TLM-R448-HIREUS-EMAIL-CLIENTS** (deadline RETRO 465, L46).
- Ableton does not apply: this is a Store e-mail.

**Deviations:** none from the spec. The Tailwind-first rule cannot apply to e-mail HTML, which has no stylesheet. The hex values are an exact mirror of the `@theme` tokens, and HE1 goes red on drift.

**Screen budget:** no on-screen element is added, moved or removed.

## Ruling lines (L4)
- **"Teal goes" vs "the e-mail stays as it was":** only colours change, plus the background hardening:
  - an outer presentation `table`/`tr`/`td` around the HEAD `div`;
  - `background-color: #0e0d0c; color: #ece6da;` added to that `div`;
  - the message box's `background:` written as `background-color:`.

  Every other byte of the HTML (tags, text, order, the other inline properties) equals HEAD's template. C4 checks it.
- **`escapeHtml` → `escapeEmailHtml`:** it moves into the builder module with a byte-identical body and is still used for the subject in the action. At HEAD, its 7 uses are all in `hire-us.tsx` [K24]; after the edit there are 0 [K24].
- **Builder labels:** the action resolves the project-type and budget labels exactly as HEAD (`… || 'Not specified'`, subject `… || 'General'`), and the builder escapes them, as HEAD did.
- **`email.server.ts`:** untouched (K18 includes it). Only its allow-list reason in the test changes.
- **Pre-existing action issues the `tech-lead` noted are not fixed here:**
  - a prototype key such as `projectType=toString` turns into a 500;
  - the subject goes through the HTML escaper;
  - the mailto `href` is not URL-encoded;
  - `formData.get(...) as string` casts.

  They are deferred Lows (TL-R448-L6-*). Changing them would change behaviour beyond this round.

## 1. Changes (A applies `b-round-447/sketch-448.patch.txt`; its sha256 is in `b-round-447/sketch-review.md` [K12])

| # | File | Change |
|---|---|---|
| 1 | NEW `app/lib/hire-us-inquiry-email.server.ts` [K4 absent at HEAD] | Exports:<br>• `HIRE_US_INQUIRY_EMAIL_PALETTE` (6 hex; keys = `@theme` token names)<br>• `HireUsInquiryEmailFields`<br>• `escapeEmailHtml` (moved; body unchanged)<br>• `buildHireUsInquiryEmailHtml(fields)`: the HEAD template with the colours mapped below and the background hardening above |
| 2 | `app/routes/hire-us.tsx` | • The local `escapeHtml` [K24] is removed; `escapeEmailHtml` is imported from 1 for the subject.<br>• `htmlContent` = `buildHireUsInquiryEmailHtml({ name, email, projectTypeLabel, budgetLabel, message })`.<br>• Unchanged: validation, the no-key 500, the `fetch` call, sender, replyTo, the subject text and the responses. |
| 3 | NEW `app/lib/__tests__/hire-us-inquiry-email.test.ts` (node) [K25 new-tests 0 at HEAD] | HE1–HE7 |
| 4 | NEW `app/lib/__tests__/hire-us-inquiry-email-contrast.test.ts` (jsdom `DOMParser`) [K25] | HE8–HE9 |
| 5 | `app/lib/__tests__/store-teal-sweep.test.ts` (a `string → string` allow-list at HEAD [K25]) | • Allow-list entries become `{ hits, reason }` with exact counts (L1).<br>• `routes/hire-us.tsx` leaves the allow-list; it and the new module join the granted teal-free list.<br>• The reason for `lib/email.server.ts` becomes `LEGACY-DEAD-STORE-COMPONENTS (0 importers)`.<br>• TS2 compares exact counts.<br>• New TS5 scans `perf/**`: ≥ 10 files, 0 teal (L3). |
| 6 | NEW doc `docs/implementation/2026/quarter-IV/293-store-2b-2b-hire-us-email.md` [K16] | see A step 4 |

**Colour map, HEAD → after:**

| Element | HEAD | After |
|---|---|---|
| `h2`, `h3` | `#13D9CC` | foreground #ece6da |
| mailto link | `#13D9CC` | brand #c9a46a |
| value cells | `#fff` | foreground |
| label cells | `#888` | muted #a39b8e |
| borders | `#333` | outline #24211e |
| message box | `#1a1a1a`, text `#fff` | surface #161412, text foreground |
| footer | `#666` | muted |
| outer table, `td` and content `div` | (no background) | background #0e0d0c; the `td` keeps `padding: 24px` |

- **Dark rather than light e-mail:** the e-mail paints the Store's own Obsidian background instead of adopting a light "default" palette, so it matches the brand Saba sees on the site; it is also the smallest change from HEAD's dark-intended colours. The rejected option, a light e-mail (dark ink on white with a brass link), is asked once as SABA-Q-HIREUS-EMAIL-THEME (`awaiting_user`); the dark default ships.

**Tests.** Every row except HE7 has a named mutant that turns it red (`b-round-447/mutant-M*.log` [K13]):

| Row | Checks | Mutant → red rows |
|---|---|---|
| HE1 | each palette hex equals its `--color-<token>` value inside app.css's `@theme {` block | M3 (brand → #13d9cc) → HE1, HE2, TS1, TS3 |
| HE2 | the builder output uses only palette hex (≥ 10 uses) and no teal (the claims regex) | M7 (a literal `#ffffff` on the footer) → HE2 |
| HE3 | the e-mail starts with `<table role="presentation"`, and that opening tag has `bgcolor` and `background-color` = background | M2 (the outer table's colours removed) → HE3 |
| HE4 | each of the 5 fields with `<script>alert("x")</script>'&` appears only escaped, the mailto `href` included | M1 (message unescaped) → HE4 |
| HE5 | the real `action` (`BREVO_API_KEY` stubbed, `fetch` captured) sends `htmlContent === buildHireUsInquiryEmailHtml(...)` for the same form, subject `🎬 New Project Inquiry: Film/Video Scoring`, status 200; the body is parsed to `unknown` and narrowed by a type guard | M4 (route reverted to HEAD) → HE5, TS1, TS3 |
| HE6 | with no project type and no budget: subject `General`, both labels `Not specified`, as at HEAD | M10 (budget fallback `''`) → HE6 |
| HE7 | characterisation: with no key, the action returns 500 and calls `fetch` 0 times; green at HEAD, no mutant, not a gate | — |
| HE8 | each of the 12 text elements resolves a colour and a painted background (`background-color` or `bgcolor`) on itself or an ancestor inside the e-mail. The colour may be inherited: the delta review's D1 is deferred, and doc 293 describes HE8 as "resolved (own or inherited) colour" | M9 (every background removed) → HE3, HE8, HE9 |
| HE9 | every text element is ≥ 4.5:1 against its nearest painted background | M8 (value cells in the outline colour) → HE9 |
| TS2 | an allow-listed file's count drifts from its pinned exact count | M5 (Timeline 5 → 4) → TS2 |
| TS5 | perf has teal | M6 (`bg-teal-500` appended to `perf/lib/report.ts` [K25]) → TS5 |

Multipart `FormData` turns `\n` into `\r\n`, so HE5 sends a message with no newline; B's first sketch run showed this.

## 2. A: steps
1. Run `bash b-round-447/claims-448.sh` before editing. K1–K11, K13–K15, K17, K18 and K21–K27 must equal `b-round-447/claims-448-planning-output.txt`, and K19 must read 0 outside and 0 inside the grants. Otherwise STOP (L11).
2. Run `git apply b-round-447/sketch-448.patch.txt` after checking its sha256 against `sketch-review.md` (K12). If it does not apply cleanly, STOP. Do not hand-port.
3. Run the 10 mutants on a scratch, never in the store tree:
   1. `git clone --shared` the store at `cce5eda` into `/tmp/a448-scratch`.
   2. Apply the sketch, symlink `node_modules`, and commit.
   3. Run `SRC=/tmp/a448-scratch OUT=<a-round-448 dir> bash b-round-447/run-mutants.sh`.

   Each mutant must be red on the same rows as K13. Save the summary as `a-round-448/mutants.txt`.
4. Write doc 293 in Georgian, with technical terms in English.
   - l.3 is `**თარიღი:** 2026-11-11`.
   - l.4 is exactly `**სტატუსი:** In Progress (stage 2b-2b of STORE-2b; C round 448 PASS)` (L28).
   - The seven TEMPLATE headings appear in order (L26).
   - Content:
     - why `email.server.ts` is not restyled (0 importers, `3b094eb`);
     - the HEAD measurement (10/12 failing in the light client, 1/12 in the dark);
     - the colour map and the background hardening, with the reason for the presentation table;
     - the extraction;
     - tests HE1–HE9, TS2 and TS5, and mutants M1–M10 (HE7 is a characterisation test);
     - that no real send or real mail-client rendering was tested (the TLM row).
   - TODO: 2b-3, 2b-4, LEGACY-DEAD-STORE-COMPONENTS (now with `email.server.ts` and `PianoCurtainLoader.tsx`), the STORE-4 stems-modal hits, TLM-R448-HIREUS-EMAIL-CLIENTS, and the TL-R448-L6 deferred Lows.
   - Cite only test ids that exist.
5. Checks (speed rules, no full suite):
   - `npx vitest run $(cat b-round-447/covering-448.txt)`: all green. A red file, or one slower than 50 % of its timeout, is a STOP (L11).
   - `npm run typecheck` rc 0.
   - `npm run lint` rc 0, with the warning count ≤ HEAD's.
   - `npx biome check` on the 5 code/test paths rc 0. HEAD has 1 pre-existing warning in `hire-us.tsx` (label `htmlFor`) [K23].
   - `npm run build` rc 0, and `grep -rl buildHireUsInquiryEmailHtml build/client` finds 0 files. The route imports a `.server` module; B's sketch build passed this [K14].
   - code-reviewer (3+ files).
6. Re-capture the e-mail and measure it (commands in `b-round-447.md` §6). Expect 0 failing rows in both clients, equal to K11. Save the results to `a-round-448/`.
7. Run `bash b-round-447/claims-448.sh` after the edits.
   - Only K3, K4, K7, K9, K16, K19, K24 and K25 may differ from the planning output. For K3, K4, K7, K9, K24 and K25 the values must equal `b-round-447/claims-448-sketch-output.txt` (K9 gains the two new test files); K16 is the new doc's l.4, and K19 shows 6 dirty paths inside the grants. (K2 differs only on B's committed scratch.)
   - Save the diff as `a-round-448/claims-diff.txt`.
8. `git status` shows only paths in `b-round-447/grants-448.txt` [K19].

## 3. C: acceptance rows
- **Setup:** real Chromium (Playwright). Dev server on `http://127.0.0.1:5173`, mock API on `:5199` (start `node tmp/studio-real-loop/mock-api/server.mjs` if it is down).
- **HEAD control:** serve it on `:5178` with its own Vite cacheDir (L38): `bash b-round-445/probe/sketch-server.sh start <c-round-448 dir> 5178 none`.
- **Probes:** copy `b-round-447/probe/*` into `c-round-448/` before changing anything (L60). Do not use `sketch-server.sh` with a patch: inside the loop's git repo its `git apply` silently does nothing (B-R447-SKETCH-SERVER-PATCH-SILENT). C serves HEAD with `none` only. Run HEAD and tree probes one at a time, never both at once (round 447 O6).

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all` | only `grants-448.txt` paths; `email.server.ts`, `root.tsx`, `app/components/studio/**`, `app/styles/**` and the protected routes unchanged [K18, K19] |
| C2 CLAIMS | `bash b-round-447/claims-448.sh` vs `claims-448-planning-output.txt` | only K3, K4, K7, K9, K16, K19, K24 and K25 differ; K3/K4/K7/K9/K24/K25 equal `claims-448-sketch-output.txt`; K3 teal-total 23 → 20; K4: `hire-us.tsx` 0, the new module 0, the 6 other files unchanged |
| C3 EMAIL-CONTRAST (the bug) | capture the tree e-mail through the real `action` (`capture-hire-us-email.ts`), then run `email-contrast.cjs` (light client #fff and dark #121212). Same on HEAD, from a `git clone --shared` of the store checked out at `cce5eda` with a `node_modules` symlink; never `git worktree`, which writes into the store's `.git`. B's HEAD capture with this recipe is byte-identical to `probe/hire-us-email-head.html` | tree: 0 failing rows in both clients, 12 rows each, min ratio ≥ 4.5; HEAD reproduces K10 (light 10/12 failing, dark 1/12); screenshots of tree and HEAD in both clients |
| C4 EMAIL-STRUCTURE | `probe/email-structure-diff.sh <HEAD capture> <tree capture>` (hex → `HEX`, `diff -U0`) | output equals `b-round-447/probe/email-structure-diff-sketch.txt` (10 lines [K27]): the outer presentation `table`/`tr`/`td` opening and closing lines, the content `div` gaining `background-color: HEX; color: HEX;`, and the message box `background:` → `background-color:` |
| C5 EMAIL-ESCAPE | capture with the payload `<img src=x onerror=alert(1)>` in name and message, and an unknown project type; render it | 0 `img` elements in the rendered DOM; the payload visible as text; the project label reads `Not specified` |
| C6 HIRE-US-PAGE (1440, 1280, 375) | `probe/hire-us-page.cjs` with HEAD on `:5178` and the tree on `:5173` (`TREE_URL=http://127.0.0.1:5173`), which writes JSON and screenshots | B's sketch run [K26]: HEAD-vs-HEAD 0 px and HEAD-vs-sketch 0 px at all 3 viewports; empty submit blocked by native `required` (3 invalid fields: name, email, message; no server error text); filled submit shows "Server configuration error" on both (no Brevo key in the cloud). Pass: the same values on the tree. A non-zero HEAD-vs-tree diff, when HEAD-vs-HEAD is 0, is a finding |
| C7 SEND-BLOCKED | real send through Brevo; real Gmail, Outlook and Apple Mail rendering | BLOCKED "no Brevo key / mail client in cloud"; listed under `blocked`, not `passed`; TLM-R448-HIREUS-EMAIL-CLIENTS |
| C8 COVERING | `b-round-447/covering-448.txt` | green; counts recorded |
| C9 MUTANTS | `SRC=<C scratch> OUT=<c-round-448 dir> bash b-round-447/run-mutants.sh`, where the scratch is a `git clone --shared` at `cce5eda` + A's diff, never the store tree | each mutant red on its named rows (= K13); base green |
| C10 O3-CONTROL (carried from round 447) | `/` at 1440 and 1280: HEAD-vs-HEAD full-page pixel diff, twice, after the loader | `record`. If the hero band (y 430–620) differs HEAD-vs-HEAD, O3 is attributed to animation; otherwise it is a finding for 2b-3 |
| C11 SHOWCASE-RECHECK (carried: round 447 C7) | `/` Studio showcase at 1440: "Export Mix" text vs its painted background, measured from pixels | ≥ 4.5:1 (A measured 5.82:1 in round 447) |
| C12 STUDIO + PURCHASE PROTECTION | `/studio-lab` at 1440 and 1280: add a clip, Play advances the clock, Stop halts. Then open anonymous `/studio/middle-east` | Studio behaves as HEAD. The protected route has 0 `audio[src]`, 0 media requests and the same rendered result as HEAD. The "Sign in required" text is not asserted: in the cloud the route renders blank on both trees (round 447, backend unavailable), so that half stays BLOCKED (B-R447-AUTH-ROW-PREMISE) |
| C13 DOCS | doc 293 | l.4 exact; TEMPLATE headings in order; every HE/TS id and M1–M10 it cites exists in the test files or `run-mutants.sh`; no `pending` |

- **Gate rows** (full vitest, typecheck, build, Biome, verify) are `gate` and are not claimed by C.
- **`c-round-448.json`:** write **all L57 fields** and run `python3 -I tools/l57-check.py c-round-448.json c-round-448/l57-check.txt` (rc 0) before hand-off; round 447's JSON had none (INFO-C447-L57-ABSENT). Every finding has an `origin`. `mutantRedOnSketch` = `b-round-447/mutant-M1.log` … `mutant-M10.log`.

**Neighbours that could break:**
- The `/hire-us` form, pinned by `store-theme-tokens` (F3–F6 field borders, ST5 submit fill), `store-focus-ring` (its file list) and `store-header-footer` (footer link). All three are covering tests.
- `e2e/navigation.spec.ts` and `e2e/main-flow.spec.ts` visit `/hire-us` [K9]. They do not submit, and they are not gate rows.
- The Remix client bundle must not pull in the `.server` module (A step 5, the build row).

## 4. Claims
- **Script:** `b-round-447/claims-448.sh` (K1–K27). Page probe: `probe/hire-us-page.cjs` → `probe/hire-us-page-sketch.json` [K26]. Structure diff: `probe/email-structure-diff.sh` → `probe/email-structure-diff-sketch.txt` [K27].
- **Outputs:**
  - planning: `b-round-447/claims-448-planning-output.txt`
  - sketch: `b-round-447/claims-448-sketch-output.txt` (run with `STORE_ROOT=/tmp/b448-scratch`)
- **Probes:** in `b-round-447/probe/`:
  - `capture-hire-us-email.ts`, `vn.config.mjs` and `email-contrast.cjs`;
  - `contrast-head.json` [K10] and `contrast-sketch.json` [K11];
  - the HTML captures and the screenshots.
- **Sketch pre-check:** `precheck-typecheck.log`, `precheck-build.log`, `precheck-full.log` (281 files / 4119 tests), `precheck-lint.log` and `precheck-check.log` (rc 0, 205 warnings = HEAD) [K14, K14b]; `git apply --check` of the patch on the store tree is rc 0.
- **Mutants:** `mutant-M1.log` … `mutant-M10.log` [K13]; runner `run-mutants.sh`.
- **Review:** `sketch-review.md` [K12, K20].
