# Round 448: STORE-2b-2b — the Hire-Us inquiry e-mail leaves teal and becomes readable in every mail client

**Planned by:** B, at the round 447 → 448 planning, 2026-11-11 (`b-round-447.md`).
- The advisor was available and was consulted after orientation and before writing.
- The round-447 task is archived as `tasks/round-447.md` (byte-identical copy made before this file was rewritten).
- **Baseline:** gate 447 is `published`, commit `cce5eda` [K1]. The store tree is at `cce5eda` and clean at planning [K2, K18, K19]. (`context/head-sha.txt` still says `5df7717`; the gate's `commit` wins.)
- **Regression:** not due (last 2026-11-10, round 425; due on or after 2026-11-13). **RETRO:** round 450.

## Why this round
- C round 447 PASS (`browserVerified`/`realVerified` true, C1–C15, 0 bugs) and gate 447 published `cce5eda`. **STORE-2b-2a is done** (D-29z1589).
- STORE-2b-2 was planned as "8 e-mail hits: `email.server.ts` 5 + `hire-us.tsx` 3". The planning grep changes that (D-29z1590):
  - **`app/lib/email.server.ts` is dead code.** It has 0 importers in `app`, `perf` and `e2e` [K5]. Its only export, `sendOrderPaidEmail`, lost its last caller in `3b094eb` ("Remove all Shopify code and migrate to backend API"). It is not restyled, by the same rule round 447 applied to `Timeline.tsx`. It joins **LEGACY-DEAD-STORE-COMPONENTS**, together with `PianoCurtainLoader.tsx` (0 users outside the barrels [K6]), for the next cleanup or ARCH-SPLIT round under Saba's legacy removal policy (2026-11-10). Its allow-list reason in `store-teal-sweep` changes to say so.
  - **The 3 live hits are the internal inquiry e-mail** that the `/hire-us` form's action sends to the site owner [K7]. B rendered the e-mail that HEAD sends (through the real `action`, with `fetch` stubbed) in Chromium [K10]:
    - **light client (white background): 10 of 12 text elements fail WCAG contrast.**
    - The submitted name, project type and budget are `#fff` on white, i.e. invisible (1:1).
    - The headings and the e-mail link are teal at 1.78:1, and the labels `#888` at 3.54:1.
    - Dark client (#121212): 1 of 12 fails, the footer at 3.26:1.
    - The wrapper sets **no background**, so the e-mail is drawn on whatever the client paints.
  - This is a pre-existing readability bug in the e-mail Saba receives, filed as **B-R447-HIREUS-EMAIL-LIGHT-CLIENT** (Medium, pre-existing). A plain teal→brass swap cannot fix it, because brass on white is 2.33:1. So this round fixes the teal and the readability together. They sit in the same 30 lines of the same template.
- **Two Lows from round 447 come along,** because this round owns `store-teal-sweep.test.ts` and they cost little:
  - **A-R447-REVIEW-L1:** pin exact allow-list counts;
  - **A-R447-REVIEW-L3:** scan `perf/` too.

  A-R447-REVIEW-L2 (inline `boxShadow` coverage) stays in `deferred_low_polish`.
- Order (D-29z1583): STORE-2b-2b → 2b-3 (`app.css` glow/gradient) → 2b-4 → STORE-2c… STEM-LANES is still `awaiting_user`.

## What changes (user-visible)
1. **The inquiry e-mail the site owner receives** after a `/hire-us` submit:
   - it has its own dark Obsidian background, so it reads the same in light and dark mail clients;
   - the headings and values are light ink, and the labels and footer muted;
   - the e-mail link is brass;
   - there is no teal.
   Text, structure, field order, subject, sender and reply-to are unchanged, and every user-supplied value is still HTML-escaped.
2. **Nothing on the `/hire-us` page changes:** form, copy, layout, validation messages and states stay as they are. The code that builds the e-mail moves out of the route into a pure builder module, so tests and C can render it without sending mail.
3. Nothing else changes: no other page, no Studio file, no token.

## Reference
- **E-mail guidance in the Store spec: none found.** B searched `store-redesign-spec.md` for "e-mail"/"email": 0 hits [K17]. `direction-decision.md` has none either. B did not invent an e-mail reference.
- **Authority used instead:**
  - the Store palette (Obsidian & Brass, `app/styles/app.css` `@theme`: background #0e0d0c, surface #161412, foreground #ece6da, muted #a39b8e, outline #24211e, brand #c9a46a) [K11 via HE1];
  - round 447's product-designer rulings: no glow; brass only on flat fills, strokes and the interactive accent; titles in light ink, as the wordmark ruling did.
- **Why the wrapper and not `<body>`:** the e-mail is an HTML fragment with no `<body>` of its own. The only place it can paint a background is its own wrapper element, which the sketch uses.
- **Whether a given client keeps inline `background` on a `div`** is not proved in the cloud (no mail client). That half is the Tech Lead manual row TLM-R448-HIREUS-EMAIL-CLIENTS (deadline RETRO 465, L46).
- Ableton does not apply: this is a Store e-mail.

**Deviations:** none from the spec. The Tailwind-first rule cannot apply to e-mail HTML (no stylesheet); the hex values are an exact mirror of the `@theme` tokens, pinned by test HE1, so token drift turns the test red.

Screen budget: no on-screen element is added, moved or removed.

## Ruling lines (L4)
- **"Teal goes" vs "the e-mail stays as it was":** only colours change, plus one wrapper declaration set (`padding: 24px; background: #0e0d0c; color: #ece6da;`). Every other byte of the HTML (tags, text, order, the other inline properties) equals HEAD's template; C's structural diff row checks it.
- **`escapeHtml` → `escapeEmailHtml`:** it moves into the builder module. Its body is byte-identical, and it is still used for the e-mail subject in the action. No other caller exists [K9 for tests; A greps `escapeHtml` in `app/**` after the edit: 0 hits].
- **Builder labels:** the action resolves the project-type and budget labels exactly as HEAD (`… || 'Not specified'`), and the builder escapes them, as HEAD did.
- **`email.server.ts`:** untouched (K18 includes it). Only its allow-list reason changes.

## 1. Changes (A applies `b-round-447/sketch-448.patch.txt`; reviewed sha256 in `b-round-447/sketch-review.md`)

| # | File | Change |
|---|---|---|
| 1 | NEW `app/lib/hire-us-inquiry-email.server.ts` | `HIRE_US_EMAIL_PALETTE` (6 hex, keys = `@theme` token names); `HireUsEmailPaletteToken`; `HireUsInquiryEmailFields`; `escapeEmailHtml` (moved, body unchanged); `buildHireUsInquiryEmailHtml(fields)`, with the HEAD template, the colours mapped below, and the wrapper background |
| 2 | `app/routes/hire-us.tsx` | the local `escapeHtml` is removed and imported from 1 as `escapeEmailHtml` (subject); `htmlContent` = `buildHireUsInquiryEmailHtml({ name, email, projectTypeLabel, budgetLabel, message })`; validation, the no-key 500, `fetch` call, sender, replyTo, subject text and responses unchanged |
| 3 | `app/lib/__tests__/hire-us-inquiry-email.test.ts` (new) | HE1–HE6 (below) |
| 4 | `app/lib/__tests__/store-teal-sweep.test.ts` | allow-list entries become `{ hits, reason }` with exact counts (L1); `routes/hire-us.tsx` removed from the allow-list; `routes/hire-us.tsx` and the new module added to the granted teal-free list; `lib/email.server.ts` reason → `LEGACY-DEAD-STORE-COMPONENTS (0 importers)`; TS2 compares exact counts; new TS5 scans `perf/**` (≥ 10 files, 0 teal) (L3) |
| 5 | NEW doc `docs/implementation/2026/quarter-IV/293-store-2b-2b-hire-us-email.md` | below |

**Colour map (HEAD → after):**
- `h2`/`h3` `#13D9CC` → foreground #ece6da;
- the mailto link `#13D9CC` → brand #c9a46a;
- the value cells `#fff` → foreground;
- the label cells `#888` → muted #a39b8e;
- the borders `#333` → outline #24211e;
- the message box `#1a1a1a` → surface #161412, with text `#fff` → foreground;
- the footer `#666` → muted;
- the wrapper gains `padding: 24px; background: #0e0d0c; color: #ece6da;`.

**Tests (all run red on a named mutant, `b-round-447/mutant-M*.log` [K13]):**
- **HE1:** every palette hex equals its `--color-<token>` value inside app.css's `@theme` block. Mutant M3 (brand → #13d9cc) → HE1, HE2, TS1 and TS3 red.
- **HE2:** the builder output uses only palette hex (≥ 10 uses) and no teal (claims regex). Mutant M7 (a literal `#ffffff`) → HE2 red.
- **HE3:** the wrapper style contains the palette background and foreground. Mutant M2 (wrapper background removed) → HE3 red.
- **HE4:** each of the 5 fields with `<script>alert("x")</script>'&` appears only escaped, the mailto `href` included. Mutant M1 (message unescaped) → HE4 red.
- **HE5:** the real `action`, with `BREVO_API_KEY` stubbed and `fetch` captured, sends `htmlContent === buildHireUsInquiryEmailHtml(...)` for the same form, with subject `🎬 New Project Inquiry: Film/Video Scoring` and status 200. Mutant M4 (route reverted to HEAD) → HE5, TS1 and TS3 red.
  - Note: multipart `FormData` turns `\n` into `\r\n`, so HE5's message has no newline (B's first sketch run showed this).
- **HE6:** with no key, the action returns 500 and calls `fetch` 0 times.
- **TS2:** a drifted exact count is red (M5: Timeline 5 → 4). **TS5:** red when perf has teal (M6: `bg-teal-500` appended to `perf/lib/report.ts`).

## 2. A: steps
1. Run `bash b-round-447/claims-448.sh` before editing. K1–K11, K13, K15, K17, K18 and K19 must equal `b-round-447/claims-448-planning-output.txt`. Otherwise STOP (L11).
2. `git apply b-round-447/sketch-448.patch.txt` (sha256 = the one in `sketch-review.md`, K12). If it does not apply cleanly, STOP. Do not hand-port.
3. Run the 7 mutants yourself: `bash b-round-447/run-mutants.sh` copies `/tmp/b448-scratch`. A recreates that scratch from its own tree first: `git clone --shared` at `cce5eda` + the sketch, plus a `node_modules` symlink, then commit. Save the results under `a-round-448/mutants.txt`. They must equal K13.
4. Write doc 293 in Georgian, with technical terms in English.
   - l.3 `**თარიღი:** 2026-11-11`.
   - l.4 exactly `**სტატუსი:** In Progress (stage 2b-2b of STORE-2b; C round 448 PASS)` (L28).
   - The seven TEMPLATE headings in order (L26).
   - Content: why `email.server.ts` is not restyled (0 importers, `3b094eb`); the HEAD contrast measurement (10/12 light, 1/12 dark); the colour map; the extraction; tests HE1–HE6, TS2 and TS5 with mutants M1–M7; and that a real send and real mail-client rendering were not tested (TLM row).
   - TODO: 2b-3, 2b-4, LEGACY-DEAD-STORE-COMPONENTS (now with `email.server.ts` and `PianoCurtainLoader.tsx`), STORE-4 stems-modal hits, TLM-R448-HIREUS-EMAIL-CLIENTS.
   - Cite only the test ids that exist.
5. Checks (speed rules, no full suite):
   - `npx vitest run $(cat b-round-447/covering-448.txt)`: all green. A red or slow (> 50 % of its timeout) file is a STOP (L11).
   - `npm run typecheck` rc 0.
   - `npm run lint` rc 0, with the warning count ≤ HEAD's.
   - `npx biome check` on the 4 code/test paths rc 0. HEAD has 1 warning in `hire-us.tsx` (label `htmlFor`), which is pre-existing.
   - `npm run build` rc 0. The route now imports a `.server` module, and Remix fails the build if a client path reaches it; B's sketch build was rc 0 [K14].
   - code-reviewer (3+ files).
6. Re-capture the e-mail with `b-round-447/probe/capture-hire-us-email.ts` (command in `b-round-447.md` §6) into `a-round-448/hire-us-email-tree.html`, then run `email-contrast.cjs` on it. 0 failing in both clients is expected, equal to K11.
7. `bash b-round-447/claims-448.sh` after the edits. Only K3, K4, K7, K16 and K19 may differ from the planning output, and the differences must equal `b-round-447/claims-448-sketch-output.txt`. Save the diff as `a-round-448/claims-diff.txt`.
8. `git status` shows only paths in `b-round-447/grants-448.txt` [K19].

## 3. C: acceptance rows
- **Setup:** real Chromium (Playwright). Dev server `http://127.0.0.1:5173`, with the mock API on `:5199` (start `node tmp/studio-real-loop/mock-api/server.mjs` if it is down).
- **HEAD control:** `:5178` via `bash b-round-445/probe/sketch-server.sh start <c-round-448 dir> 5178 none`, with its own Vite cacheDir (L38).
- **Probes:** copy the `b-round-447/probe/*` probes into `c-round-448/` before changing anything (L60). Run the HEAD and tree probes one at a time, never both at once (O6 of round 447).

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status` | only `grants-448.txt` paths; `email.server.ts`, `root.tsx`, `app/components/studio/**`, `app/styles/**`, protected routes unchanged [K18, K19] |
| C2 CLAIMS | `bash b-round-447/claims-448.sh` vs `claims-448-planning-output.txt` | only K3, K4, K7, K16, K19 differ and equal `claims-448-sketch-output.txt` for those keys; K3 teal-total 23 → 20; K4 `hire-us.tsx` 0, new module 0, the 6 other files unchanged |
| C3 EMAIL-CONTRAST (the bug) | capture the tree e-mail through the real `action` (`capture-hire-us-email.ts`), then `email-contrast.cjs` (light #fff and dark #121212 clients); same on the HEAD tree (a `git worktree` at `cce5eda`) | tree: 0 failing rows in both clients, 12 rows each, min ratio ≥ 4.5; HEAD reproduces K10 (light 10/12 failing, dark 1/12). Screenshots tree and HEAD, both clients |
| C4 EMAIL-STRUCTURE | normalise every hex colour to `HEX` in both captures and diff them | the only difference is the wrapper `style` gaining `padding: 24px; background: HEX; color: HEX;`; text, tags and order are identical |
| C5 EMAIL-ESCAPE | capture with the payload `<img src=x onerror=alert(1)>` in name, message and project type (an unknown type → `Not specified`), and render it | no `img` element in the rendered DOM; the payload is visible as text; mailto `href` escaped |
| C6 HIRE-US-PAGE (1440, 1280, 375) | open `/hire-us`, tree and HEAD | full-page screenshots pixel-equal to HEAD (`record` any difference and attribute it); form fields, labels and the submit button present; an empty submit shows the same validation as HEAD; a filled submit returns "Server configuration error" on both (no Brevo key in the cloud) |
| C7 SEND-BLOCKED | real send through Brevo, real Gmail/Outlook/Apple Mail rendering | BLOCKED "no Brevo key / mail client in cloud"; listed under `blocked`, not `passed`; TLM-R448-HIREUS-EMAIL-CLIENTS |
| C8 COVERING | `b-round-447/covering-448.txt` | green; counts recorded |
| C9 MUTANTS | re-run M1–M7 on a `git clone --shared` scratch at `cce5eda` + A's diff (never in the store tree) | each red on its named rows (= K13), base green |
| C10 O3-CONTROL (carried from round 447) | `/` at 1440 and 1280: HEAD-vs-HEAD full-page pixel diff, twice, after the loader | `record`: if the hero band (y 430–620) differs HEAD-vs-HEAD, O3 is attributed to animation; otherwise file it as a finding for 2b-3 |
| C11 SHOWCASE-RECHECK (carried, C7 of round 447) | `/` Studio showcase at 1440: measure "Export Mix" text vs its painted background from pixels | ≥ 4.5:1 (A measured 5.82:1 in round 447) |
| C12 STUDIO + PURCHASE PROTECTION | `/studio-lab` at 1440 and 1280: add a clip; Play advances the clock; Stop halts. Anonymous `/studio/middle-east` | Studio as HEAD. The protected route: 0 `audio[src]`, 0 media requests, the same rendered result as HEAD. The "Sign in required" text is not asserted: in the cloud the route renders blank on both trees (C round 447, backend unavailable); that half stays BLOCKED |
| C13 DOCS | doc 293 | l.4 exact; TEMPLATE headings in order; the HE/TS ids and M1–M7 it cites exist in the test files; no `pending` |

- **Gate rows** (full vitest, typecheck, build, Biome, verify) are `gate` and are not claimed by C.
- **`c-round-448.json`:** write **all L57 fields** and run `python3 -I tools/l57-check.py` (rc 0) before hand-off. Every finding gets an `origin`. `mutantRedOnSketch` names `b-round-447/mutant-M1.log` … `mutant-M7.log`.

**Neighbours that could break:**
- the `/hire-us` form (`store-theme-tokens` F3–F6 field borders and ST5 submit fill; `store-focus-ring` file list; `store-header-footer` footer link);
- `e2e/navigation.spec.ts` and `e2e/main-flow.spec.ts` visit `/hire-us` [K9]. They do not submit, and they are not gate rows;
- the Remix client bundle, which must not pull in the `.server` module (the build row).

## 4. Claims
- **Script:** `b-round-447/claims-448.sh` (K1–K20).
- **Planning output:** `b-round-447/claims-448-planning-output.txt`; sketch output: `claims-448-sketch-output.txt`.
- **Probes:** `b-round-447/probe/` (`capture-hire-us-email.ts`, `vn.config.mjs`, `email-contrast.cjs`, `contrast-head.json` [K10], `contrast-sketch.json` [K11], the HTML captures and screenshots).
- **Sketch pre-check:** `precheck-typecheck.log`, `precheck-build.log`, `precheck-full.log` [K14].
- **Mutants:** `mutant-M1.log` … `mutant-M7.log` [K13].
- **Review:** `sketch-review.md` [K12, K20].
