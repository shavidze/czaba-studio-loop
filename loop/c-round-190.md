# C round 190: STORE-1d fix-up (C-R189-01 CLS, C-R189-02 Tab), independent verification

**Verdict: PASS.** Every C row in `current-task.md` §4 ran in real Playwright Chromium and passed. `browserVerified=true`, `realVerified=true`. No new Critical, High or Medium finding. Info notes for B are listed at the end: the T1 portal gap and a harness timing rule, among others.

## Setup
- Start: HEAD `850445c`. The frozen list (`b-round-189-r190-tree-sha256.txt`, 1016) was checked from the store root: OK. The 3 grants match `a-round-190/end-sha256.txt`. `git status` was 2 ` M` + 2 `??`.
- Mock: :5199 was **not** listening, so C started `node mock-api/server.mjs` (log `c-round-190/mock.log`) and stopped it at the end. The shared :5173 dev server was used as found (`env-status.json`: store 200, 10:39:20Z).
- Tools: `c-round-190/tools/`, copied from `c-round-189/tools/`. Changes beyond paths and names:
  - `cls.cjs`: one warm-up load; records the overlay's parent and height every frame; flags shift sources inside the overlay.
  - `skip.cjs`: adds cases (d) Shift+Tab and (e) ArrowDown, records focus visibility and `defaultPrevented`, and scrolls the card only after t > 250 ms (see I2).
  - `dur.cjs`: `TAG=-hit2` uses the same scroll timing.
  - `vitest.scratch.config.mjs`: adds a `react-dom` alias, because the end copy imports `createPortal`.
  - New scripts: `vis.cjs`, `tabtop.cjs`, `hitprobe.cjs`, `scrollprobe.cjs`, `durdbg.cjs`.
- Ableton parity: **არ ეხება** (not applicable). This is a store page, not an Arrangement feature; the task's §5 lists no source.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLS-FRESH-190 | **PASS** | `out/cls-{375,1280,1440}.json/.log` |
| DUR-190 | **PASS** | `out/dur-*.json`, `out/dur-*-hit2.json`, `out/flicker-*.json`, `shots/loader/mid-*.png` |
| VIS-190 | **PASS** | `out/vis-190.json`, `out/vis-logo-centre.txt`, `shots/loader/vis-{1440,375}-{550,800}.png` |
| HIT-190 | **PASS** (after the harness timing fix, I2) | `out/dur-*-hit2.json`; diagnosis in `out/scroll-1280-*.json`, `out/dur-1280-dbg.json` |
| SKIP-190 | **PASS** | `out/skip-{1440,375}.json`, `out/tabtop-{375,1440}.json`, `shots/tabtop-*.png` |
| H1-190 | **PASS** | `out/dur-*.json` (`h1max`, `h1bad`, `ariaH1`), `out/session.json` (ssr) |
| RM-190 | **PASS** | `out/session.json` `rm1440`, `rm375` |
| SESSION-190 | **PASS** | `out/session.json` `a_reload`, `e_newCtx` |
| STORE-AFTER-190 | **PASS** | `out/diff190.json`, `shots/store-after/` (the next baseline), `out/store-*.json` |
| G190-3 | **PASS** (mock-backed) | `out/g190-3.json`, `shots/g190-3-*.png`, `mock.log` |
| STUDIO-RV-190 | **PASS** | `out/c190-{1440,1280}-1.json`, `shots/c190-*-1/rest-full.png` |
| SCOPE-190 | **PASS** | see below |
| T-RUN-190 | **PASS** | `logs/t1-*.txt`, `scratch/` |
| AN-REVIEW-190 | **PASS** | see below |
| PX-NET / REG-HYD | **PASS** | `out/pxnet.json`, plus `ev` in each out file |
| Gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL) | **gate**: not run by C | `gates/gate-round-190.json` |

## Row details
- **CLS-FRESH-190.** Each viewport: one warm-up load, then 3 fresh loads and 3 seen loads (seen = key preset by init script). DPR 2, `--disable-lcd-text`.

  | VP | fresh CLS per load | fresh median | seen CLS per load | seen median | LCP median fresh / seen |
  |---|---|---|---|---|---|
  | 375 | 0.0001 / 0.0001 / 0.0001 | **0.00005** | 0 / 0 / 0 | 0 | 492 / 500 ms |
  | 1280 | 0.0014 / 0.0014 / 0.0014 | **0.0014** | 0.0014 / 0.0222 / 0.0014 | 0.0014 | 556 / 516 ms |
  | 1440 | 0.0009 / 0.0009 / 0.0198 | **0.0009** | 0.0009 / 0.0009 / 0.0009 | 0.0009 | 536 / 540 ms |

  - **Overlay-sourced shifts with value > 0: none, in any of the 18 loads** (`freshOvShiftMax = seenOvShiftMax = 0`). The only overlay-sourced entries are the expected `v: 0` rule-line entries (`DIV.h-[1px] mx-auto mt-4 mb-4`, y and height unchanged).
  - The overlay's parent is `BODY` from its first observed frame. Its height equals the viewport on every frame: 812, 720 and 900, y = 0. The C-R189-01 mechanism (overlay sized to the document inside the transformed `page-transition-wrapper`) is gone.
  - Every remaining shift is **outside** the overlay: header `A.no-underline` / `NAV` / `page-transition-wrapper`, 0.0008–0.0221. It appears in seen mode too, so it is pre-existing page behaviour (info).
  - The LCP element is the hero `IMG` on all fresh loads and is never inside the overlay. Seen-mode LCP medians are ≤ 516 ms. Single slow seen loads (text `P` / `H1` at ≈ 2.0 s) stay ≤ 2.5 s.
- **DUR-190.** Insertion → removal over 18 fresh loads, all ≤ 1166 ms:
  - first run: 1440 1165.5 / 1165.4 / 1162.3; 1280 1163.8 / 1158.9 / 1163.7; 375 1163.6 / 1158.9 / 1164.1;
  - `-hit2` run: 1440 1160.1 / 1163.0 / 1160.4; 1280 1160.1 / 1160.0 / 1160.3; 375 1159.1 / 1164.3 / 1163.4.

  Medians are 1159–1165 ms, and the overlay appeared on every load. Pre-paint ResizeObserver sampler: the logo stays ≥ 0.9 for **454–522 ms** (9/9 loads), with 0 dips. The one-sample rAF opacity-0 reading is the known C-R189-I1 artifact and is absent before paint. The mid-loader shots (`shots/loader/mid-{1440,1280,375}.png`, viewed) show "CZABA", the rule line and the tagline at all 3 viewports.
- **VIS-190.** Captures at 1440 and 375, about 550 and 800 ms after insertion, plus a DOM inventory:
  - The overlay is `BODY` > full viewport. 24–25 sized `DIV`s in each capture. Logo and tagline "Cinematic Sound Design" are present.
  - The cone, both glows, the rule line, the tagline, the vignette and the dust are visible in the screenshots.
  - At 375, the bounding box of the teal logo letters is `[88,352,285,386]`, centre (186.5, 369), **identical** to `c-round-189/shots/loader/mid-375.png` at ≈ 800 ms, and within 1 px at ≈ 550 ms.
  - At 1440: the round-189 baseline `mid-1440.png` was captured during the exit fade, with the page showing through, so a full-threshold box is not comparable. The letter tops (y 397/398) and the "ZABA" left edge (x 640) match. The DOM logo centre (719.5, 424) is at the viewport centre. No element is missing or relocated.
  - The disclosed change, that the overlay now also covers the sticky header and the cookie banner during the first ≈ 450 ms on cold 375 loads, is what a full-screen loader is meant to do. C does not count it as an R66 regression (info I3).
- **HIT-190.** With the `-hit2` harness, the first `elementFromPoint` hit on the card Play comes at:
  - 1440: 964 / 962 / 913 ms;
  - 1280: 922 / 911 / 911 ms;
  - 375: 910 / 927 / 923 ms.

  All are ≤ 1250 ms, followed by 0 misses in 77–85 samples. The real click started the preview 9/9 times: `currentTime` advanced 3.64–3.73 s, the label became "Pause preview", and the URL was unchanged. The first run's 1280 misses are a harness artifact (I2), not a product defect.
- **SKIP-190.** One fresh context per case; input 307–387 ms after insertion.
  - (a) Click at the centre and (a2) click at the card Play: removed 2.5–3.9 ms after the click. The click target was inside the overlay. 0 audio plays, URL unchanged.
  - (b) Escape: removed after 4.3–6 ms.
  - (c) Tab: removed after 3.1–3.8 ms. `defaultPrevented=false` is recorded on window bubble. Focus landed on the visible card link "Harbour Lights": inside the viewport, top at point, not `body`, not in the overlay.
  - (d) Shift+Tab: removed after 2.5 ms. Focus landed on the visible "Middle East" card link.
  - (e) ArrowDown: **not** removed. The loader ended by itself at 1158–1165 ms, and the hidden page scrolled 40 px (info, outside R67).
  - `tabtop` (no pre-scroll, a user at the top of the page):
    - Tab focuses the header "CZABA" link at `scrollY` 0, removed after 2.9–3.2 ms.
    - Shift+Tab focuses the footer "Cookie Policy", and the browser scrolls to it (`scrollY` 4900 / 4121). Its rect is inside the viewport and it is top at point. Removed after 2.4–3.1 ms.
  - Every SKIP and tabtop case: 0 audio, URL unchanged, 0 pageerror.
- **H1-190.** `h1max` = 1 and 0 `h1bad` samples on all 18 DUR loads. The overlay has `aria-hidden="true"` and 0 headings. The mid-loader `ariaSnapshot` has a single `heading "CZABA" [level=1]` at each viewport. SSR with JS off: 1 h1 on `/` and on `/store`, no overlay, and the HTML has no `entrance-loader`.
- **RM-190.** Under `reduce`, at 1440 and at 375: 0 insertions in 3.5 s, and the key is absent. After `no-preference` and a reload, the overlay shows once; a further reload shows 0.
- **SESSION-190.** (a) A reload in the same page: 0 insertions in 3 s. (e) A new context shows the overlay again. Also passed: client navigation back via the wordmark (0), `/store` → wordmark (shown once, 1161.9 ms), and a new tab in the same context (shown; C-R189-I5).
- **STORE-AFTER-190.** `/`, `/store` and `/products/middle-east` at 3 viewports, non-scrolled, compared with `c-round-189/shots/store-after/`:
  - **0 changed px outside the masked hero on all 9 shots** (header 0, footer copy 0, other 0).
  - The scrolled home shots differ in the same regions as round 189's own diff (scroll-triggered sections). That is pre-existing; info, not part of the row.
  - 0 pageerror. The 375 home had one late `/images/packs/cover.jpg` (C-R189-I6).
- **G190-3** (mock-backed, not real-backend evidence):
  - `/studio-lab`: `auth_user` null, 0 cookies, workspace and demo badge present, 0 entrance overlay, key absent.
  - `/studio/middle-east` at 1440 and 1280: "Sign in required", 0 `audio[src]`, no workspace.
  - `studio-token`: no header → 401 "Please sign in to access Studio."; fake Bearer → 403 "Unable to verify ownership", no Set-Cookie. `mock.log`: `GET /api/downloads origin=- auth=yes 401`.
  - Page traffic: 0 forbidden requests, 0 Authorization headers.
  - **Premium auth is not bypassed.**
- **STUDIO-RV-190.** `/studio-lab` rest screenshot against `c-round-189/shots/c189-{1440,1280}-1/rest-full.png`: **0 changed px, maxDelta 0** at both viewports. 0 errors, 0 hydration messages, 0 forbidden requests, 0 auth headers. Fonts ready.
- **SCOPE-190.**
  - Start and end: the frozen list (1016) is OK from the store root, and HEAD is `850445c`.
  - `git status`: exactly ` M SpotlightLoader.tsx`, ` M doc 155`, `?? T1`, `?? doc 156`. Doc 155 = `cdf011f9…`.
  - A's `end-sha256.txt`: 3/3 OK (`97b61316…`, `b15d1bab…`, `a469ffe8…`).
  - Loader diff against the start copy: the `createPortal` import and wrap; the handler renamed and given the `|| event.key === 'Tab'` condition. `export function SpotlightLoader()` takes no props; the only other export is the existing `SPOTLIGHT_ENTRANCE_TOTAL_MS`.
- **T-RUN-190.**
  - **Tree:** T1 17/17 green.
  - **Start copy** (scratch alias): only "Tab ends it like Escape…" and "Shift+Tab ends it…" are red; 15 green.
  - **Control:** the end copy run through the alias is 17/17 green.
  - **m1** (no Tab branch): both Tab cases red.
  - **m2** (`preventDefault` on Tab): both Tab cases red, on line 177, `expect(notDefaultPrevented).toBe(true)`.
  - **m3** (every key skips): "other keys do not skip" red.
  - **m4** (no Escape branch): "Escape at 300 ms removes the overlay and its keydown listener" red.
  - **m5** (info, not required): with the portal removed, **17/17 stay green** (I1).
- **AN-REVIEW-190.**
  - The diff adds no class, colour, inline style or custom CSS. The pre-existing inline `style` blocks and `#000` are unchanged from the start copy.
  - No `as`, `any`, `@ts-ignore` or `@ts-expect-error` in the loader or T1.
  - The keydown and click listeners and the timers keep their single effect cleanup; T1 checks that the listener is removed and the timer count is 0. No `preventDefault` on Tab.
  - D1 is in Georgian with status `In Progress (awaiting C round 190)`. It records R67 with all three rejected alternatives (`inert`, `preventDefault`, deferral) and marks R63's Tab clause as replaced.
  - D1's C-R189-01 problem → solution entry separates the rejected hypothesis (bisect: every freeze stayed at 0.6158) from the confirmed cause (the `page-transition-wrapper` transform as containing block). It labels the old-loader 0.0000 explanation as an inference.
  - C's independent observation is consistent with the confirmed cause: the overlay is now parented to `body` at viewport height from the first frame, and the shift is gone. C did not re-run A's bisect.
- **PX-NET / REG-HYD.** 42 recorded sessions: 0 pageerror, 0 hydration messages, 0 non-font remote requests, 0 Authorization headers from the page (`out/pxnet.json`). Store-page runs also had 0 pageerror.

## Bugs
No new bug at any severity in this round's scope.

## Info for B
- **C-R190-I1 (test gap, already routed by A as reviewer Medium #1):** T1 does not guard the portal. Mutant m5 (`createPortal` removed) keeps 17/17 green (`logs/t1-m5-noportal.txt`), so a revert would bring back C-R189-01 with no unit failure. Only the browser CLS / parent check catches it. B decides whether to allow a `parentElement === document.body` case and amend the "start copy: only Tab cases red" clause. C-R189-01 is closed by browser evidence either way. Recommended: add the overlay parent/height and fresh CLS check to the regression-round store smoke.
- **C-R190-I2 (harness rule for the regression round):** a card `scrollIntoView` issued before ≈ 110 ms after navigation sometimes lands at `scrollY` 1299 instead of 857 at 1280. The scroll event fires with **no overlay present**, so this is early layout, not the loader (`out/scroll-1280-{fresh,seen}.json`, `out/dur-1280-dbg.json`). In `scrollprobe` it happened in 2 of 4 fresh loads (scroll calls at 71 and 102 ms) and 0 of 4 seen loads (calls at 98–142 ms). n=4 is small and the seen calls were on average later. At ≈ 107 ms both modes are still the pre-hydration SSR page, so the loader component is not mounted yet; C reads the asymmetry as timing, not the loader. It made the first DUR run's 1280 HIT miss 3/3. Rule: scroll after `performance.now() > 250` and `readyState !== 'loading'`, which is still before insertion (≈ 470–580 ms).
- **C-R190-I3:** the overlay now stacks above the sticky header and the cookie banner for its whole life (A disclosed this). On cold 375 loads the header was previously visible above the overlay for the first ≈ 450 ms. C reads this as the intended full-screen behaviour, not an R66 regression; Saba may judge it at STORE-2.
- **C-R190-I4:** ArrowDown while the loader is up scrolls the hidden page by 40 px (1440 and 375). This is outside R67 and is the same class as C-R189-02 → candidate Low for `deferred_low_polish`, as the task predicted.
- **C-R190-I5:** Shift+Tab from the top jumps to the footer "Cookie Policy" and scrolls the page to the bottom. That is the browser's normal reverse tab order, visible after removal; it meets the row.
- A's reviewer Architecture note (the `PageTransition` `y` transform is the containing block for every `fixed` overlay inside routes) is a valid signal. The route overlays it names were not re-tested by C this round.

## Gate
Full vitest, typecheck, lint/Biome, build, verify and e2e smoke belong to the root gate (`gates/gate-round-190.json`). C ran only T1 and its scratch variants.
