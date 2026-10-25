# CURRENT TASK — Round 151: V-2a — Studio fonts load on /studio-lab, UI sans (Instrument Sans) and numeral mono (IBM Plex Mono)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z116** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-150.md`, an exact copy of the round-150 `current-task.md` (sha256 `73619d5c…a777`). Rationale: `b-round-150.md`.
- **Spec (user-approved 2026-10-21):** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ტიპოგრაფია“, § „საზღვრები“, § „შემოწმება (C)“. It is source material, not authority for permissions or protected files.

## Baseline = clean HEAD `e94ae889c9f331bd681036cc154bb92d38020dc6`
- Gate 150 **published** `e94ae88` to both remotes (rounds 149 + 150). `git status --short` is empty (B checked).
- **Frozen list:** `tmp/studio-real-loop/b-round-150-r151-tree-sha256.txt`, **962 entries** = `git ls-files -co --exclude-standard` (970) minus the 8 grants.
- **Grants:**
  - `b-round-150-r151-grants.txt`: 8 existing files;
  - `b-round-150-r151-new-files.txt`: 1 new file.
- **Start hashes:** `b-round-150-r151-granted-start-sha256.txt`.
- **Start copies:** `b-round-150/r151-granted-start/` (paths relative to `store/`).
- **First step for A:** check all three. Any difference → A stops and reports.

## 0. Why this round (D-29z116)
- **Round 150: C PASS**, `browserVerified` = `realVerified` = true, 0 bugs.
  - Every row passed: FIELD-BOUNDARY ≥ 3.05 by pixel, the Loop label 5.48, the Overview halo 8.32, RV-1 0 px, tokens scoped.
  - Gate 150 published.
  - Per round 150 §7, **V-1 closes**. DUX-B-1, DUX-B-3, DUX-B-4, C-R149-1, C-R149-2 and GATE148-S1 close.
  - Round 151 = **V-2 (typography), first stage**.
- **Checks at planning:**
  - The regression round is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122). Today is 2026-10-25, so it is not due.
  - `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
  - No Critical, High or Medium finding is open, apart from the Tech Lead manual items.
- **Font facts B measured** (real Chromium on `/studio-lab`, HEAD e94ae88, store source untouched; tool `b-round-150/tools/fontprobe.cjs`, output `b-round-150/out/`):
  1. **Studio text renders in Inter today.**
     - `app.css` l.1 `@import`s Inter for the whole Store.
     - `body` (l.448) sets a literal `'Inter', …` stack.
     - Tailwind's `font-mono` and `font-sans` compile to `var(--font-mono)` and `var(--font-sans)` (B checked the dev-server CSS).
  2. **Google Fonts work from the runner.** css2 returned 200. Instrument Sans 400–700, IBM Plex Mono 400 and Noto Sans Georgian 400/500 all reached `loaded` in Chromium.
  3. **Any font swap moves content-sized boxes horizontally.** B simulated exactly this round's change with CSS injection (`v2a`):
     - **29 of 153 keys move > 1 px at 1440, and 27 of 136 at 1280.**
       - Followers in the same row move by at most 9 px (the Master strip).
       - The shortcut-hint line's own width shrinks by 119 px.
       - Full lists: `b-round-150/out/v2a-predicted-moves-{1440,1280}.json`.
     - **0 vertical or height deltas > 1 px**, 0 keys missing or added, 0 new overflow.
     - Mono alone, on the existing `font-mono` elements, moves 5 keys by ≤ 6 px.
  4. **So two lines of the spec conflict.** Typography is approved, but "every box within ±1 px" cannot hold once glyph widths change. See R1.

## 1. What changes (exact)
| ID | File (e94ae88 tree) | Change |
|---|---|---|
| F1 | `app/styles/app.css`, **inside the obsidian block only** (l.3916–3936) | Add 3 declarations after `--color-destructive` (l.3935), before `}`:<br>`  --font-sans: 'Instrument Sans', 'Noto Sans Georgian', system-ui, sans-serif;`<br>`  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;`<br>`  font-family: var(--font-sans);` |
| F2 | `app/routes/studio-lab.tsx` | <ul><li>Add `type LinksFunction` to the existing `@remix-run/node` import.</li><li>Add a module constant `STUDIO_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Georgian:wght@400;500&display=swap'` (B checked: 200).</li><li>Export `links: LinksFunction = () => [{ rel: 'stylesheet', href: STUDIO_FONTS_HREF }]`.</li><li>`meta`, the arrangement and the component stay the same. Precedent: the `links` export in `studio.$productId.tsx` l.37.</li></ul> |
| F3 | `ArrangementTempoRow.tsx` l.230 (BPM field) | Add the token `font-mono` to the class string. |
| F4 | `ArrangementMaster.tsx` l.108 (master peak, base class string) | Add the token `font-mono`. |
| F5 | `ArrangementMaster.tsx` l.198 (master readout `arrangement-master-readout`) | Add the token `font-mono`. |
| F6 | `ArrangementLane.tsx` l.818 (track volume readout, `formatTrackVolumeReadout`) | Add the token `font-mono`. |
| T1 | `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx` l.293 | `expect(pendingTokens).not.toContain('border-outline');` → `expect(pendingTokens).not.toContain('border-outline-strong');` (A-R150-REVIEW-L1). |

- **F3–F6:** each changes **one token on one line**. The token's position in the string is free. No other class, testid, handler or text changes.
- **`app.css`:** only F1.
  - The Store `@theme` (`--font-sans` l.123, `--font-serif` l.124), the `@import` on l.1 and the `body` rule on l.448 stay unchanged.
  - The obsidian block keeps its selector and its position at EOF. It grows from 18 to 21 declarations.
- **`root.tsx` is protected.** Its preconnect links stay as they are; only the route adds the stylesheet.

### 1.1 B decisions (D-29z116)
- **R1, the RV-1 contract for V-2 (smallest honest reading).**
  - **Rationale:**
    - The user approved typography (font, weight, letter-spacing) as a type of change, in the same spec that requires ±1 px boxes.
    - Glyph widths change as an unavoidable result of that approved change; this is not a layout move.
    - RV-1 in `backlog.json` already makes the same exception for V-0 ("text-width changes from V-0").
    - B extends that precedent to V-2 and records it in `feature-status.md` as a decision the user may veto.
  - **Allowed:** horizontal deltas (x, w) only on elements whose own text width changed, or that follow such an element in the same row.
  - **Not allowed:**
    - any vertical or height delta > 1 px;
    - a key that goes missing or appears;
    - new wrap, ellipsis, clipping or overflow;
    - any element leaving the viewport at 1280.
  - **Panels** (`kind: panel` in d6) stay within ±1 px.
  - **Scope:** this does **not** widen RV-1 for V-3. Icons must keep the old box, as the spec says.
- **R2, staging (full V-2 scope kept).**
  - **V-2a (this round):** fonts load, UI sans, numeral mono.
  - **V-2b (next):**
    - Display serif (Cormorant Garamond 500, Noto Serif Georgian fallback), only where the text is already ≥ 16 px. B measures which Studio text qualifies before planning. Roles below 16 px stay sans, because a size change is not approved.
    - Label style: 11 px, 500, `0.14em`, Latin UPPERCASE.
    - Weight roles: sans 400/500, mono 300/400.
  - **Nothing is deferred.**
- **R3, loading scope.**
  - The stylesheet comes from the `/studio-lab` route's `links`, so Store pages do not download these fonts and RV-3 must hold.
  - No npm dependency (spec).
  - The deferred SRW-21 purchased mount will need the same `links` later; this is recorded on SRW-21.
- **R4, family scope.**
  - `font-family: var(--font-sans)` sits in the existing selector `[data-studio-theme="obsidian"], body:has([data-studio-theme="obsidian"])`.
  - That covers the workspace and both portals, which inherit from `body`: the Export dialog (via the protected `Modal.tsx`) and the marker menu.
  - Its specificity (0,1,1) beats the `body` rule (0,0,1).
  - **Side effect, as in V-1:** on `/studio-lab` the cookie banner and toasts also get the Studio sans.
  - The `font-sans` spans inside the detail panel's mono lines (`ArrangementDetailPanel.tsx` l.658–682) become Instrument Sans automatically.
- **R5, which numbers become mono.** The spec lists timecode, BPM, dB and From/To.
  - **Already `font-mono` (8 uses; they change through the token):** the transport position and end, From/To/Clip Gain, the detail lines, the grid menu and the loop times.
  - **Added now:** BPM (F3) and the three dB readouts (F4–F6). All four sit in fixed-width boxes (`w-14`, `w-16`, `w-10`), so they cannot move their row.
  - **Stay sans (not on the spec's list, B decision):** the pan readout (`Lane` l.773), the ruler labels and the zoom readout.
  - **Left open for B:** the remaining `tabular-nums` elements (range readouts, library counts and durations). C notes in VISUAL whether any of them looks out of place, and B decides in V-2b.
- **R6, weights loaded.**
  - **Instrument Sans 400–700:** the Studio already uses `font-semibold` (3 uses) and `font-bold` (4 uses). With only 400/500 loaded, Chrome would synthesise faux bold. V-2b remaps the weights.
  - **Plex Mono 400/500:** the master peak's over state uses `font-medium` as an emphasis cue.
  - **Plex Mono 300:** waits for V-2b, where it is first used.
  - **Noto Sans Georgian 400/500:** the spec's fallback for Georgian user content (demo sound names). Google serves it with a `unicode-range`, so it downloads only when Georgian glyphs are on the page.
- **R7, A-R150-REVIEW-L1.**
  - C confirmed that B's round-150 R5 was wrong: `detail-panel-fit` F4 l.293 no longer guards anything. T1 pins the exact token.
  - `B-R150-PM2-SUBSTRING` (`pending-status.test.tsx`) stays an info signal, because that file is not granted.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/styles/app.css` | F1 only (narrow grant: 3 lines inside the obsidian block) |
| `app/routes/studio-lab.tsx` | F2 only |
| `app/components/arrangement/ArrangementTempoRow.tsx` | F3 only |
| `app/components/arrangement/ArrangementMaster.tsx` | F4 and F5 only |
| `app/components/arrangement/ArrangementLane.tsx` | F6 only |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | <ul><li>TH2 map: add the 3 F1 entries with the exact strings; the TH2 title says 21 declarations.</li><li>New `it`s TH7 and TH8 (§3.1).</li><li>TH1 and TH3–TH6 stay unchanged.</li></ul> |
| `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx` | T1 only |
| `docs/implementation/2026/quarter-IV/122-studio-v1a-obsidian-color-tokens.md` | In Georgian; no other line changes:<ul><li>status l.4 → `Completed (C round 150 PASS, gate 150 e94ae88)`;</li><li>l.123 and l.127 say that C round 150 ran and passed (FIELD-BOUNDARY ≥ 3.05 pixel, Loop 5.48, halo 8.32, RV-1 0 px).</li></ul> |
| **new** `docs/implementation/2026/quarter-IV/123-studio-v2a-typography-fonts.md` | In Georgian, with the TEMPLATE sections. Status `In Progress (C round 151 — ჯერ არ გაშვებულა)`. Covers F1–F6, T1, R1–R7 and B's probe numbers |

- **Protected:** the diff vs e94ae88 stays empty for:
  - `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`;
  - `auth*`, `AuthContext.tsx`, `StudioContext.tsx`;
  - `Modal.tsx`, `root.tsx`.
- **Not allowed:**
  - any other style file, class or line;
  - `package.json` or a new dependency;
  - self-hosted font files;
  - commit, push, stash or install;
  - `npm run build` (it writes under `store/`).
- **How to edit:** every lasting edit goes through Edit/Write (C-R120-01 rule). Shell writes only for temporary mutations, restored and sha-verified.

## 3. A — tests and mutations (hand-written literals; no module-against-module pins)
### 3.1 `studio-theme-obsidian.test.tsx`
- **TH2:** `EXPECTED_OBSIDIAN_TOKENS` gets three entries, typed by hand exactly as in F1:
  - `'--font-sans': "'Instrument Sans', 'Noto Sans Georgian', system-ui, sans-serif"`;
  - `'--font-mono': "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"`;
  - `'font-family': 'var(--font-sans)'`.

  Rename the constant only if needed. Everything else in TH2 stays (exactly once, top-level, `toEqual`).
- **TH7, route font stylesheet:**
  - Import `links` from `~/routes/studio-lab`.
  - `links()` `toEqual` `[{ rel: 'stylesheet', href: '<the F2 URL, typed by hand>' }]`.
  - The href contains `display=swap` and none of `Cormorant`, `Inter` or `Playfair`.
- **TH8, mono numerals (SSR):** use the TH1 setup (`renderToString(<StudioLabRoute />)`) and split each element's `class` into tokens.
  - `arrangement-tempo-input`, `arrangement-master-readout` and `arrangement-master-peak` each have the tokens `font-mono` and `tabular-nums`.
  - Every element whose tokens include both `w-10` and `tabular-nums` (the track volume readouts) has `font-mono`.
    - Their count is **4** (video, music, stems, sfx).
    - If the SSR count differs, A records the actual count and the reason, and stops before changing the literal.
  - `arrangement-track-pan-reset` does **not** have `font-mono` (R5).
  - If one of these testids is not in the S0 SSR output, A reports it and uses a source-literal check (the TH6 pattern) for that element only.
- **T1** (detail-panel-fit F4) passes.

### 3.2 Mutations
Procedure: Edit → run → restore by Edit → sha256 equals the post-edit hash. Save the JSON in `a-round-151/mutations/`.

| ID | Mutation | Must turn red |
|---|---|---|
| m125 | F1: delete the `font-family: var(--font-sans);` line | TH2 only |
| m126 | F1: `'IBM Plex Mono'` → `'IBM Plex Mon'` | TH2 only |
| m127 | F2: drop `&display=swap` from the href | TH7 only |
| m128 | F3: remove `font-mono` | TH8 only |
| m129 | F4: remove `font-mono` | TH8 only |
| m130 | F5: remove `font-mono` | TH8 only |
| m131 | F6: remove `font-mono` | TH8 only |
| m132 | Temporarily add `font-mono` to the pan-reset class (`Lane` l.773) | TH8 only |

### 3.3 Commands (speed rules)
- **At the start:** HEAD is e94ae88; `git status --short` is empty; `sha256sum -c --quiet b-round-150-r151-tree-sha256.txt` and the granted start hashes pass.
- **Baseline:** run `npx vitest run` on these files and save the result as `a-round-151/vitest-baseline.json`:
  - `studio-theme-obsidian.test.tsx`, `detail-panel-fit.test.tsx`, `pending-status.test.tsx`;
  - `tempo-ui.test.tsx`, `tempo-window-ui.test.tsx`;
  - `master-ui.test.tsx`, `master-hold-tick.test.tsx`, `meter-ui.test.tsx`;
  - `track-volume-db.test.tsx`, `navigation-strings-ui.test.tsx`;
  - `default-track-names-ssr.test.tsx`, `ssr-layout-effect.test.tsx`.

  All are in `app/lib/arrangement/__tests__/`. These cover the BPM field, the Master strip, the track readouts and the route SSR.
- **After the edits:**
  - `npm run typecheck` and `npm run lint`;
  - read-only `npx biome check` on the 6 changed `.ts`/`.tsx` files;
  - the same vitest files. Per-file `it` counts stay the same, except the theme file (6 → 8).
- **Code-reviewer:** run it (3+ files) and pass its Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and any browser row.
- **At the end:**
  - frozen 962 OK; protected diff empty;
  - `git status --short` = exactly **8 ` M` + 1 `??`**; `git diff e94ae88 --name-only` = the 8 granted tracked files;
  - write `a-round-151/end-sha256.txt` (all 9 paths) and `a-round-151/diff-vs-start.patch` (vs the start copies).

## 4. C — rows
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, Snap state recorded at the start. Both viewports: 1440×900 and 1280×720.
- **Wait for fonts before measuring.** Every measurement waits for `document.fonts.ready` after load.
- **Font download failures are environment problems.** A session where the Google Fonts css2 or its woff2 files do not return 200 is **invalid (environment)**, not an A FAIL. Replace it at most twice, per the run budget.
- **Tools:** reuse the round-150 tools (`c-round-150/tools/`) and B's `b-round-150/tools/fontprobe.cjs`, changing only the output dir, label and file names. Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T151-TARGETED | Re-run A's vitest files; counts equal A's. |
| SOURCE-SCOPE | <ul><li>Frozen 962 OK at the start and the end.</li><li>End hashes = `a-round-151/end-sha256.txt`.</li><li>`git status` = 8 M + 1 ??; `git diff e94ae88 --name-only` = the 8 granted files; protected diff vs e94ae88 empty.</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | <ul><li>The 6 source diffs vs the start copies are exactly §1 (F3–F6 one token each; F2 = import + constant + `links`).</li><li>`app.css` changes only by the 3 F1 lines inside the obsidian block.</li><li>The theme test diff = TH2 entries + TH7 + TH8, with literals typed by hand.</li><li>T1 = one line.</li><li>Docs 122 and 123 are in Georgian, with the statuses as in §2.</li></ul> |
| FONTS-APPLIED | In S0 and S1 at both viewports, use CDP `CSS.getPlatformFontsForNode` (the font actually used to render, not only the computed stack) on the text node of:<ul><li>the `CZABA Studio Lab` title, a track name, the Library title, a status line and the Export dialog title (Instrument Sans);</li><li>the transport position, the From field (S1), BPM, the master readout and a track volume readout (IBM Plex Mono);</li><li>a Georgian library item name (Noto Sans Georgian);</li><li>a marker-menu item (Instrument Sans).</li></ul>Record the faces loaded in `document.fonts` and the css2 request (200, exactly once per load). PASS: every node renders in the expected family. |
| FONTS-SCOPED (RV-3) | <ul><li>`/`, `/cart` and `/login` (404) at both viewports: **0** requests to the F2 css2 URL or to the Instrument Sans, IBM Plex Mono or Noto Sans Georgian woff2 files.</li><li>`body` computed `font-family` = the Store literal (`Inter, -apple-system, …`).</li><li>Pages equal `b-round-148/out/storebase149.json`, as in round 150; 0 `[data-studio-theme]`.</li><li>On `/studio-lab`, the `html` computed `font-family` and the `@theme` values stay Store.</li></ul> |
| RV-1-TYPE (R1) | d6 bbox chain in S0/S1/S2 vs `c-round-148/out/bbox-post-v0-{1280,1440}.json` (equal to post-v1b), run twice, determinism 0 px. PASS only if all of these hold:<ul><li>every element's y and h are within ±1 px;</li><li>0 keys missing or added;</li><li>`kind: panel` boxes are within ±1 px;</li><li>every element that moves > 1 px moves only horizontally, and is either a text element whose own text changed width or a follower in the same flex row. List each with its dx/dw and cause;</li><li>no element's right edge passes the viewport at 1280.</li></ul>Use d6 for the RV-1 chain itself. For the comparison with B's `b-round-150/out/v2a-predicted-moves-{w}.json`, run `fontprobe.cjs`'s collector (its key scheme differs from d6) on the post-A S0. A delta more than 2 px off B's prediction is a finding to explain, not an automatic FAIL. |
| NO-CLIP | <ul><li>In S0/S1/S2, list every element with `truncate`, `overflow-hidden` or an `<input>` where `scrollWidth > clientWidth + 1`. FAIL if a control's label, a readout or a field value is cut where the post-v1b shots show it whole.</li><li>**Extremes:** BPM `300` typed, master volume at min and max, a track volume at min and max, and the master peak in its over state (play the loudest demo clip at max gain, or record that it could not be reached).</li><li>Each readout shows its full text (`scrollWidth ≤ clientWidth`).</li></ul> |
| FONT-FAIL | One session per viewport with `fonts.googleapis.com` and `fonts.gstatic.com` aborted by `page.route`. The Studio renders and works (Play 1 s, select a clip, Escape) with 0 pageerror. Record the fallback family. Not a layout row. |
| RV-2 | Re-run the d6 contrast pass (computed + pixel, as in round 150). The fonts changed, so the size/weight class and anti-aliasing may change. Same thresholds and exemptions. Required: all 61 DUX-B-1/B-4 elements ≥ 4.5, and no new enabled-text failure. |
| TOKENS-SCOPED | On `.studio-container`, `body`, the Export panel and the marker menu: the 18 colour values unchanged, and `--font-sans`/`--font-mono` = the F1 strings. `html` keeps the Store values. |
| FUNC-SMOKE | As in round 150: Play 2 s, a clip drag + Ctrl+Z, BPM type + Enter, library search, Export dialog and marker menu open and close with Escape, Ctrl+L on/off. |
| VISUAL | Full-window shots of S0, S1, loop-on and the Export dialog at both viewports, next to the round-150 shots. Describe:<ul><li>readability at 11–14 px;</li><li>any faux-bold look;</li><li>any mono/sans mix that looks wrong;</li><li>how the remaining `tabular-nums` texts look (R5).</li></ul> |
| G151-3 | <ul><li>`/studio-lab` works anonymously with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | <ul><li>Every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed.</li><li>`fonts.googleapis.com` and `fonts.gstatic.com` GETs without credentials are expected; the Store already loads Inter from there.</li><li>A cold-Vite first load may be replaced once (ENV-FIRST-LOAD rule).</li></ul> |

**Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**

| Neighbour | Row |
|---|---|
| Content-sized toolbar rows (Master strip, transport, grid/snap row, marker buttons) | RV-1-TYPE |
| Truncation in the detail panel and the library | NO-CLIP, VISUAL |
| The pending Clip Gain border | T1, FUNC-SMOKE |
| Portals | FONTS-APPLIED, TOKENS-SCOPED |
| Store pages | FONTS-SCOPED |
| SSR and hydration of the new `links` | REG-HYD |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Studio typefaces (UI sans, numeral mono) | None used. Live's own UI font was not captured. Source: the user-approved `visual-direction-a.md` § „ტიპოგრაფია“. | Not checked. | **Not applicable; CZABA brand decision** (Instrument Sans / IBM Plex Mono). | Requirement: FONTS-APPLIED, RV-1-TYPE, NO-CLIP. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-151.md`, `a-round-151-result.json`, and `a-round-151/` (vitest JSON, mutations, end-sha256, diff patch).
- **C:** `c-round-151.md` and `c-round-151.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate` and `invalidRuns`. Measurements:
  - the FONTS-APPLIED platform fonts per node and viewport;
  - the RV-1-TYPE move table vs B's prediction;
  - the NO-CLIP list;
  - the RV-2 failures;
  - the tokens per scope.

  Tools, outputs and shots go in `c-round-151/{tools,out,shots}/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 152 planning)
| Condition | Round 152 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first (C re-checks every done / c_pass item in both viewports and runs `npm run test:e2e:smoke`), then the row below. |
| C FAIL Critical / High / Medium, or a Medium+ regression caused by this round | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL only on a Low this round caused (e.g. a clipped readout) | A bounded fix-up, same owner (not a waiver). |
| RV-1-TYPE shows a vertical or panel move, or a new clip | That is a FAIL (Medium if a control becomes unusable or hidden, otherwise Low) → fix-up. |
| C PASS (new unrelated Lows → `deferred_low_polish`) | <ul><li>Root publishes.</li><li>V-2a → `c_pass`.</li><li>Round 152 = **V-2b** (display serif ≥ 16 px, labels, weight roles), planned by B with the ≥ 16 px measurement.</li></ul> |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`. Both were absent at round 151 planning.

## 8. Root notes
- **Gate:** the `app.css` diff vs e94ae88 must be exactly the 3 F1 lines inside the obsidian block. `root.tsx` must be unchanged.
- **Frontend-architect checkpoint:** `b-round-148-checkpoint-request.md` (3 questions) is still pending and does not block. V-1 has closed, which is a stage boundary, so B re-asks it in `b-round-150.md` §5. V-2a does not wait for it.
- **User-visible decision (R1):** typography changes text widths. Horizontal shifts of up to ~9 px in content-sized rows are accepted as the effect of the approved font change (the V-0 precedent). The user may veto this in `feature-status.md`.
