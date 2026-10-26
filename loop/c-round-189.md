# C round 189: STORE-1d D10 entrance loader (independent verification)

**Verdict: FAIL.** One Medium finding (**C-R189-01**) and one Low (**C-R189-02**, deferred_low_polish). On a first visit to `/` in a session, the loader's own animated glow and logo divs cause a layout shift. Fresh-context home CLS medians are **0.2727 at 1280** and **0.6158 at 375**; STORE-AFTER-189 requires < 0.1. Every other row passed in a real browser.
`browserVerified=true`, `realVerified=true`. Every browser row that can run in this environment did run. No row needed the real backend.

## Environment
- Store dev server: `:5173`, shared and reused. `env-status.json`: store 200, round 189.
- Mock API: `:5199` was **not** listening, so C started `node mock-api/server.mjs` (log `c-round-189/mock.log`) and stopped it at the end.
- Browser: Playwright 1.57 Chromium, headless. Every session used a fresh anonymous context.
- Harness: `c-round-189/tools/`. `ld.cjs` installs, through `addInitScript`, a MutationObserver on `document` that records insertion and removal of `[data-testid=entrance-loader]`. It also runs a rAF sampler that records h1 count, logo opacity, computed `pointer-events` and `elementFromPoint` on the card Play.
- Card used for HIT and SKIP: **Middle East**, the same card as round 187 PREVIEW. Its index among the `audio-preview` buttons is 1 at 1440 and 1280 (the hover overlay) and 0 at 375 (the corner button).
- Side effect: `CI= npx playwright test` wrote `store/playwright-report/` (gitignored). C created it at 09:50:32 and moved it to `c-round-189/e2e-playwright-report/`, so the store has no residue.

## Rows
| Row | Result | Evidence |
|---|---|---|
| **DUR-189** (K1) | **PASS** | `out/dur-{1440,1280,375}.json`, `shots/loader/mid-*.png` |
| **HIT-189** (K2, C-R187-I1) | **PASS** | `out/dur-*.json` (`firstHitAfterIns`, `hitAfterExit`, `preview`) |
| **SKIP-189** (K3) | **PASS** | `out/skip-{1440,375}.json` |
| **SESSION-189** (K4) | **PASS** | `out/session.json` |
| **RM-189** (K5) | **PASS** | `out/session.json` (`rm1440`, `rm375`) |
| **H1-189** (K6, C-R188-I1) | **PASS** | `out/dur-*.json`, `out/aria-mid-*.txt`, `out/session.json` (`ssr*`) |
| **E2E-189** | **PASS** | `logs/e2e-nav.txt` |
| **STORE-AFTER-189** | **FAIL** (CLS, fresh mode) | `out/store-*.json`, `out/diff189.json`, `out/cls-*.json`, `shots/store-after/` |
| **KEEP-189** | **PASS** | `out/keep.json`, `shots/keep-popup-*.png` |
| **G189-3** | **PASS** (mock-backed) | `out/g189-3.json`, `mock.log` |
| **STUDIO-RV-189** | **PASS** | `out/c189-{1440,1280}-1.json` |
| **SCOPE-189** | **PASS** | `logs/scope-end.txt` |
| **T-RUN-189** | **PASS** | `logs/t1-*.txt`, `scratch/` |
| **AN-REVIEW-189** | **PASS** | see below |
| **PX-NET / REG-HYD** | **PASS** | `ev` in every `out/*.json` |

Row details:
- **DUR-189:** insertion → removal, raw values:
  - 1440: 1205.2 / 1172.9 / 1170.5 ms (median 1172.9).
  - 1280: 1163.8 / 1169.2 / 1164.8 ms (median 1164.8).
  - 375: 1167.9 / 1167.1 / 1160.9 ms (median 1167.1).

  Every load is ≤ 1300 ms. The overlay appeared on all 9 loads. Logo opacity reached a maximum of 1 on every load. Before paint, sampled in a ResizeObserver, it stays ≥ 0.9 for **516–569 ms** (9/9 loads, `out/flicker-*.json`). The mid-loader screenshots show "CZABA", the rule line and the tagline at all 3 viewports.
- **HIT-189:** the first `elementFromPoint` hit on the card Play comes at **963 / 1068 / 993 ms** (1440), **1033 / 1046 / 990 ms** (1280) and **919 / 919 / 923 ms** (375) after insertion. That is ≤ 1250 ms each time, and always the same frame in which `pointer-events: none` starts. From there on there are 0 misses in 68–92 samples, and 0 hits while the overlay is opaque. The real click (after hover at 1440 and 1280) started the audio: `currentTime` advanced 3.64–3.73 s in 4 s, the label changed to "Pause preview" and the URL was unchanged, 9/9.
- **SKIP-189** (each case: input about 300 ms after insertion, viewports 1440 and 375):
  - **(a) click at the viewport centre:** the overlay is removed 5.6 / 5.5 ms after the `click` event. The click target was inside the overlay.
  - **(a2) extra case, click at the card Play position:** removed after 5.3 / 4.1 ms. No audio started, the label stayed "Play preview" and the URL was unchanged.
  - **(b) Escape:** removed after 5.8 / 4.0 ms.
  - **(c) Tab:** not removed. The overlay ended by itself at 1188 / 1167 ms.

  In (a), (a2) and (b), `elementFromPoint` hits the button in the first sample after removal. In every case: 0 `play()` calls and the URL unchanged.
- **SESSION-189:**
  - (a) Reload: 0 insertions in 3 s.
  - (b) `/` → Collections (`/store`) → wordmark, a client navigation: 0 insertions.
  - (c) `/store` first: 0. Then the wordmark: the overlay showed once (1162.7 ms). Reload: 0.
  - (d) `sessionStorage.czaba_entrance_seen === '1'`; `localStorage.czaba_spotlight_last_shown` is null. The only localStorage key is `czaba_session_id`.
  - (e) A new context shows the overlay again. Extra check: a new page in the **same** context also shows it, because `sessionStorage` is per tab.
- **RM-189:** with `reduce`, 0 insertions in 3.5 s at 1440 and at 375. The MutationObserver ran from the start of the document. The session key is absent. The hero h1 "CZABA" and 14 card buttons render. After `emulateMedia no-preference` and a reload, the overlay shows once and the key becomes `'1'`. The next reload shows 0.
- **H1-189:**
  - Max h1 count is **1** at every rAF sample, from document start until 1 s after removal, on all 9 loads (0 bad samples).
  - The overlay has `aria-hidden="true"` and contains 0 headings.
  - The mid-loader `ariaSnapshot` has exactly one `heading "CZABA" [level=1]` at each viewport.
  - SSR with JS off: `/` has 1 h1 ("CZABA") and 0 overlays; `/store` has 1 h1. The SSR HTML has no `entrance-loader`.
- **E2E-189:** `CI= npx playwright test e2e/navigation.spec.ts -g "homepage loads|header logo"` reused :5173. Result: **2 passed** (3.7 s).
- **STORE-AFTER-189:**
  - **Pixels:** 0 changed px on all 9 non-scrolled shots, outside the masked hero, against `c-round-188/shots/store-after/`. The header and footer bands are also 0. `/store` and the product pages are 0 even in the scrolled shots. The scrolled home shots differ in the content area, as in round 188 against 187 (that row compares non-scrolled shots only).
  - **LCP:** within bound in both modes. The LCP element is never inside the overlay; it is the hero image or the h1.
    - Fresh mode medians: 828 / 732 / 584 ms (1440 / 1280 / 375).
    - Seen mode medians: 652 / 604 / 580 ms.
  - **CLS, seen mode** (session key preset): 0.0198 / 0.0014 / 0. This equals round 188.
  - **CLS, fresh mode** (the loader shows): median **0.0815 / 0.2727 / 0.6158**. Values per load:
    - 1440: 0.0815, 0.1938, 0.0334;
    - 1280: 0.2933, 0.2727, 0.2727;
    - 375: 0.6158 ×3.

    **FAIL at 1280 and 375.** See C-R189-01.
- **KEEP-189:** after the loader, a 50 % scroll brings up the LeadMagnet "FREE DOWNLOAD" popup after 6.47 s (1440) and 6.43 s (375). "Browse Gift Cards", a "Limited" badge and the "Free Samples" nav are present.
- **G189-3:**
  - `/studio-lab`: `auth_user` null, 0 cookies, workspace and demo badge present. 0 entrance overlay, and `czaba_entrance_seen` is absent, so the loader never mounted there.
  - `/studio/middle-east` at 1440 and 1280: "Sign in required", 0 `audio[src]`, no workspace.
  - Token request without a header: **401**. With a fake Bearer: **403** "Unable to verify ownership". `mock.log` shows `GET /api/downloads auth=yes 401`.

  This is mock-backed, not real-backend evidence.
- **STUDIO-RV-189:** the `/studio-lab` rest screenshot differs from `c-round-188/shots/c188-{1440,1280}-1/rest-full.png` by **0 changed px** at both viewports. 0 console errors, fonts ready.
- **SCOPE-189:**
  - The frozen list (1015) is OK at start and at end.
  - A's `end-sha256.txt` matches 4/4.
  - `git status` shows exactly 2 ` M` and 2 `??`. HEAD is `850445c`.
  - The doc 155 diff is 2/2 lines (l.4 `Completed`; l.72 cites C round 188 PASS and `850445c`).
  - `SpotlightLoader` keeps its export name and has no props. The only new export is `SPOTLIGHT_ENTRANCE_TOTAL_MS`.
- **T-RUN-189:**
  - **On the tree:** T1 passes 15/15.
  - **On the start copy** (scratch Vite alias, `tools/vitest.scratch.config.mjs`): 12 cases fail: L2, L3, L4, L5, L6 Escape plus the 2 hygiene cases, L7, L8, L9, L10 and L10b. L1, L6-Tab and L11 stay green.
  - **Each mutant turns its named case red:**
    - `motion.h1` → L2;
    - no `pointer-events-none` → L4;
    - a 2000 ms hold behind an unchanged constant → L3, L4 and finish hygiene;
    - `pointerdown` instead of `click` → L5;
    - `localStorage` instead of `sessionStorage` → L7 and L8;
    - no reduced-motion check → L9;
    - no keydown `removeEventListener` → the 3 L6 cases.
  - **Control:** the end copy run through the scratch alias stays green.
- **AN-REVIEW-189:**
  - The diff adds no colour, inline style or `background`. The only `+` className lines are the `cn(...)` pointer-events line and the `block` span.
  - No `as`, `any` or `@ts-ignore` in the component or in T1.
  - All 5 timers, the keydown listener and the click listener are removed in one cleanup.
  - D1 is in Georgian, has the TEMPLATE sections (context, approach, architecture, files, problems, testing, TODO) and records R61–R66. R61–R63 carry "rejected" alternatives (4 places). Its status is `In Progress (awaiting C round 189)`.
- **PX-NET / REG-HYD:** every session had 0 pageerror and 0 hydration messages. There were 0 non-font remote requests and 0 Authorization headers from the page.

## Bug for B
### C-R189-01: the entrance loader's animated glow and logo divs add a large layout shift on the first home visit (Medium)
**Steps:**
1. Open a fresh Chromium context (no `czaba_entrance_seen`) at 375×812 or 1280×720.
2. Install a `layout-shift` PerformanceObserver before navigation.
3. Open `/` and wait 4 s.

**Expected** (STORE-AFTER-189): home CLS median < 0.1 in fresh mode too.

**Actual:**
- **CLS medians:** 0.6158 at 375 (3/3 loads), 0.2727 at 1280 (3/3 loads ≥ 0.27) and 0.0815 at 1440 (one load 0.1938).
- **One shift per load, from the overlay itself,** about 470–495 ms after insertion. The sources are `DIV.absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` boxes inside `[data-testid=entrance-loader]`, with `previousRect` 0×0 → `currentRect` 500 px tall (the 500×500 spotlight glow) or 400×200 or 389×125 (secondary glow, logo).
- **Values of that shift:** 0.6158 at 375; 0.2713 at 1280; 0.0617, 0.1929 and 0.0325 at 1440.
- **Control:** the same pages with the session key preset have CLS 0.0198 / 0.0014 / 0, identical to round 188.

**Cause:** hypothesis, not confirmed. The timing matches the end of the framer-motion opacity, scale and `y` animations (spotlight 100 + 300 ms, logo 250 + 250 ms). It also lines up with the one-sample rAF opacity 0 that A noted for framer's WAAPI finish and cancel. Chrome reports the box as newly placed.

**Pre-existing?** Unverified. The start code had the same animated divs, but round 188 never measured fresh-mode CLS: its "seen" loads were suppressed by the old 5–7 h localStorage rule. This round's acceptance explicitly requires fresh mode.

**Why Medium:** field CLS (web-vitals and CrUX) counts it on every first home visit of a session. That is "poor" (> 0.25) on mobile and laptop.

**What the user sees:** nothing moves. The overlay is opaque black and the page content does not shift, so this is a metric-only shift. Medium follows the explicit acceptance row and the field-metric impact. B decides whether it needs a fix-up round now.

**Data labels:** in `out/store-*.json`, `perf` / `perfMedian` (the round-188 "new page in the same context" method) is **also fresh mode**: a new tab is a new session, so the loader showed there. The only valid seen-mode numbers are `seen` / `seenMedian` in `out/cls-*.json`.

**Evidence:** `c-round-189/out/cls-{1440,1280,375}.json`, `out/store-*.json` (`perfFresh`) and `tools/cls.cjs`.

### C-R189-02: Tab while the loader is up moves focus and scrolls the page under the opaque overlay (Low → deferred_low_polish)
**Steps:**
1. Open a fresh context at 375×812 (or 1440×900).
2. Open `/`.
3. About 300 ms after the overlay appears, press Tab.

**Expected** (R63: "Tab and screen-reader keys should not have side effects"): the hidden page does not change while the black overlay covers it.

**Actual:**
- The overlay stays up, as it should, and SKIP-189 (c) passes. But focus moves to a card link under the overlay ("Harbour Lights": `A AmbientTrackHarbour Lights$24`). The page is not `inert`.
- At 375 that focus scrolled the card carousel. After removal, the Middle East Play was no longer under its old point (`hitNextFrame.hit=false`).
- Nothing activates and nothing plays.

**Possible direction** (B or Saba decide): make the page `inert` while the overlay is up, or let the loader end on Tab as well.

**Evidence:** `c-round-189/out/skip-{1440,375}.json`, case `c`.

## Info (not bugs)
- **C-R189-I1:** A's rAF "logo opacity 0 for one sample" artifact reproduces in C's early-rAF sampler (one sample per load, 8 of 9 DUR loads). A ResizeObserver sample, taken after all rAF callbacks and before paint, saw **0 dips in 9/9 loads**. It is not a painted flicker.
- **C-R189-I2:** promoted to the Low bug C-R189-02 below.
- **C-R189-I3** (the R61 trade-off, as B predicted): the overlay is inserted 558–656 ms after navigation, after hydration. The page paints first, then the loader covers it.
- **C-R189-I4:** 1440 load 1 measured 1205.2 ms, between 1200 and 1300. That load took a mid-loader screenshot, which stalls frames; the median is in bound. Timer jitter, info only. The same screenshot shortened the rAF-sampled logo ≥ 0.9 span to 77 ms; the pre-paint runs give 516–569 ms.
- **C-R189-I5** (harness note for the regression round): sessionStorage is per tab, so "seen" checks must preset `czaba_entrance_seen` with an init script or reload in the same page. A new page in the same context is a new session and shows the loader. Round 188's perf method (new pages in one context) now measures fresh mode.
- **C-R189-I6:** on the 375 home full-page shot, 1 image (`/images/packs/cover.jpg`) was not loaded at capture time. The non-scrolled comparison was still 0 px. A note for whoever reads the next baseline.
- **Mock:** stopped at the end; `:5199` is free (checked with `ss`).

## Ableton parity
Not applicable (არ ეხება). This is a store page. Studio is unchanged: STUDIO-RV-189 shows 0 px, and the protection checks in G189-3 hold.

## Gate rows (not C's)
Full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.
