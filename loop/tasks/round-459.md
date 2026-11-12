# Round 459: SABA-B-13: the Store entrance is black from the first frame and plays for its full length

**Planned by:** B, at the round 458 → 459 planning, 2026-11-12 (`b-round-458.md`).
- **Advisor:** available. Consulted after orientation and before writing. Its points are applied: a black first frame instead of a longer timer, failsafe and skip rows, the Saba reload default kept, and the L3 collision ruled.
- **Archive:** the round-458 task is saved as `tasks/round-458.md`. It is a byte-identical copy (`cmp` OK) made before this file was rewritten.
- **Baseline:** gate 458 is `published` with commit `891dc0f` [K1]. The store tree is at `891dc0f` and clean at planning [K2].
- **Regression:** not due. The last ran 2026-11-10 (round 425); the next is due on or after 2026-11-13.
- **Next RETRO:** round 465.

## Why this round
- **Round 458 is closed.** C round 458 returned PASS on C1–C10, with `browserVerified` and `realVerified` true. Its two Lows go to `deferred_low_polish`. Gate 458 published `891dc0f`, so STORE-2b-3c-2a is done.
- **SABA-B-13 is next in the recorded order** (D-29z1616, D-29z1623): "STORE-2b-ENTRANCE right after 2b-3c-2a passes C".
  - It is a **Medium**, because Saba saw it himself (bug gate 2026-10-23).
  - Saba's report (policy, 2026-11-11): "the opening animation completes too quickly even on a hard refresh … it flashes instead of playing through … minimum display duration (e.g. 1.2–1.5 s)".
- **Type:** a user-visible Store fix. It follows reference-first and takes a `product-designer` consult. The screen budget (L39) does not apply, because nothing persistent is added.

## What B measured at HEAD (production build, real Chromium, mock API)
- **Probes:**
  - `b-round-458/probe/frames.mjs`: rAF sampling of the cover and the overlay, plus CDP screencast frame luminance.
  - `b-round-458/probe/entrance-timing.mjs`.
  - Both ran on `serve-prod.sh` builds: HEAD on `:5190`, the sketch on `:5191`.
- **The flash is the paint order, not only the length.**
  - At HEAD the page paints first. The black overlay mounts only after hydration, 140–170 ms later at 1× CPU and 330–380 ms later at 4× (`probe/head-prod-1440-cpu{1,4}.txt`).
  - The first painted frame has luminance 13.4: the page background and the header. HEAD rows `firstCov` > `fp` [K12].
- **The length:** at HEAD the overlay is visible about 1.16–1.21 s. The logo is fully visible for 433–446 ms and the tagline for only 138–172 ms [K12].
- **Timer-driven:** the timeline is `SPOTLIGHT_ENTRANCE_TOTAL_MS = 1150`, plays once per tab (`czaba_entrance_seen`), and there is no `EntranceCover` module yet [K3].
- **Why a cover inside the route cannot work:**
  - The route content sits inside `PageTransition`, which server-renders `opacity: 0` and `y: 8` [K5]. A fixed cover inside it is invisible on the first paint.
  - B's first, route-local sketch put a `<style>` and a script in the body. The header still painted for about 45 ms before the cover (`probe/f-5191-1440-cpu1-fresh.json`, first frames at luminance 13.4).

## What changes (user-visible)
- **Fresh tab on `/`:** the first painted frame is black. The animated entrance then runs without a homepage frame in between, and the cover lifts about 1.45–1.55 s after its first frame at 1× CPU. At most 1.9 s is the code cap; at 4× CPU it measured ≤ 1.91 s.
  - The logo is fully visible for at least about 680 ms, and "Cinematic Sound Design" for at least about 415 ms [K13].
- **Same-tab reload (Ctrl+F5 included) and reduced motion:** no black frame at all [K20]. This is unchanged in effect from HEAD, and once per tab stays (SABA-Q-ENTRANCE-RELOAD default (a)).
- **JS slow or blocked:** a black-only cover gives way by CSS alone after 1.0 s, with a 250 ms fade. A later hydration never replays the entrance.
- **Skip:** Esc, Tab (focus still moves) or a click skips at any time, including before hydration. A click on the cover never reaches the page underneath.
- **Arriving from another page and clicking through to `/`:** it plays once per tab, as at HEAD.
- **Nothing else moves.** There are no copy, position or keep-list changes, and the animation's look is unchanged except that the phases are longer.

## Reference: how established splash screens do it
- **Android 12+ SplashScreen** (official, `https://developer.android.com/develop/ui/views/launch/splash-screen`, read 2026-11-12):
  1. The splash is a window that covers the app from launch: "The system shows the splash screen … When the app is ready, the splash screen is dismissed". It uses "a single window background color with no transparency". → **Match:** opaque black from the first frame.
  2. "make sure the motion can be comfortably skipped". → **Match:** Esc, Tab and click, before and after hydration.
  3. Exit animation: "Call `remove()` on it when your animation ends"; the remaining duration is computed from the animation's start time. → **Match:** a 250 ms exit fade, with timers anchored to the cover's start (`data-start`), not to hydration.
  4. "Introducing an incomplete interface can be jarring for users". → **Match:** no homepage frame before the exit fade.
  5. "we recommend not exceeding 1,000 ms" for the icon animation. → **Deviation (Saba decision, 2026-11-11):** the minimum is 1.45 s for perceived value ("premium products have a confident entrance"). "Simpler to build" is not the reason.
- **Saba's own reference** (Ableton, Logic Pro and Splice show a splash for 1–2 s) is his statement. B did not source it, and the task does not claim it.
- **`product-designer` consult** (`b-round-458/pd-consult.md`):
  - **Chosen:** the clock starts at the first painted cover frame; target 1450 ms; failsafe 1000 ms; skip before hydration; reduced motion unchanged.
  - **Rejected:**
    - a clock starting at hydration, because the user sees black from the first paint;
    - a static wordmark on the cover before hydration, because the brand would show twice, and a change of look needs Saba.
  - **Questions for Saba, added to `user-review/questions-saba-b-13.md`:** a static wordmark; the entrance when `/` is first reached by in-app navigation (B keeps HEAD's behaviour; `product-designer` would drop it); hero animations that finish under the cover.
- **No Ableton reference:** this is the Store, not the Studio.

## Why we missed it (Saba-found issue rule)
- **Which phase should have caught it:** the B spec of STORE-1d (doc 156, spec D10). Its rows were jsdom timer rows measured from mount (`store-entrance-loader.test.tsx` L3, "at most 1200 ms" [K6]), plus a browser check that the overlay appears.
- **Why it was missed:** no row looked at what the first painted frames show in a production build. A mount-relative timer cannot see that the page paints before hydration, and D10 capped the length instead of setting a floor.
- **Rule:** L18 gains a "first painted frame" clause in this planning (no new line; `lessons.md` stays at 60 lines). Any timed entrance, splash or overlay is measured from the first painted frame on a production build, with frame evidence at 1× and 4× CPU. C checks that the clause exists (C14).

## Ruling lines (L4)
- **`app/root.tsx` (global_forbidden) vs the mandatory head cover:** the narrow grant wins for exactly 2 added lines:
  - `import { EntranceCoverHead } from '~/components/loading/EntranceCover';`
  - `<EntranceCoverHead />` directly after `<Links />` [K4].

  Nothing else in `root.tsx` changes. Precedent: the round-201 narrow root grant (D-29z166). `tech-lead` confirmed this is the smallest choice (`sketch-review.md`). The auth-protected files are untouched.
- **Spec D10 "≤ 1.2 s" and test L3 "at most 1200 ms" vs Saba's minimum:** Saba's minimum wins (D-29z1616). L3 becomes "1450 ms minimum … never past 1900 ms":
  - `toBeLessThanOrEqual(1200)` becomes `toBe(1450)`, plus `ENTRANCE_MAX_TOTAL_MS` `toBe(1900)`;
  - its present-at-`TOTAL−1` and gone-at-`TOTAL` checks stay;
  - the `1200 + 5000` tail becomes `MAX + 5000`.

  No assertion is lost; equal or stronger replacements are allowed. L1 gains a console spy, and L9 gains one more step (`TOTAL`).
- **Tailwind-first vs the cover CSS string:** the string `ENTRANCE_COVER_CSS` is the ruled exception. A pre-hydration `body::before` cannot be a utility class on a React-owned node, and `app/styles/**` is not granted. It uses the theme variable `var(--color-black)`, which is emitted because `SpotlightLoader` uses `bg-black` [K15]. Doc 300 records the exception.
- **Biome:** 2 new `noDangerouslySetInnerHtml` warnings (static strings, no user input). Lint goes from 205 to 207 warnings [K14]. Accepted.
- **Clock:**
  - `data-start` is the boot script's `performance.now()`. The script runs in `<head>`, before the first paint.
  - C measures durations from the first covered rAF sample.
  - The 1× bounds apply only to rows that end `live` (fresh and clientnav). Failsafe, skip and reduced-motion rows have their own rows.
- **Once per tab:** kept, as the one-line `sessionGate` (SABA-Q-ENTRANCE-RELOAD default (a)). C and Saba verify in a **fresh tab**, never with a same-tab reload.
- **Client navigation to `/`:** keeps HEAD's behaviour (the fallback claim), which plays once per tab. This is not changed silently; it is a Saba question.
- **The pre-existing inline `'#000'` in `SpotlightLoader`:** untouched this round (owner 2b-3d / STORE-5).

## 1. Changes
A applies `b-round-458/sketch-459.patch.txt` with sha256 `f499b724240383adaa5ede24f377ae471d8112435bef59885088f2784eb6e164`. `tech-lead` reviewed this exact sha: APPROVE (`b-round-458/sketch-review.md`, review 2) [K11]. The per-file hashes are in `b-round-458/sketch-files-sha256.txt`.
- **`app/components/loading/EntranceCover.tsx`** (new):
  - the constants `ENTRANCE_COVER_ID`, `ENTRANCE_SESSION_KEY`, `ENTRANCE_MIN_TOTAL_MS` 1450, `ENTRANCE_MAX_TOTAL_MS` 1900, `ENTRANCE_FAILSAFE_MS` 1000, `ENTRANCE_EXIT_MS` 250, `ENTRANCE_TAKEOVER_EVENT` and `ENTRANCE_REDUCED_MOTION_QUERY`;
  - `ENTRANCE_COVER_CSS`: a `body::before` black cover at z-index 60, with the CSS failsafe;
  - `ENTRANCE_BOOT_SCRIPT`: path `/` only, no reduced motion, `sessionGate`; it sets `data-start` and `media='all'`, and adds capture keydown/click skip listeners that the takeover event removes;
  - `EntranceCoverHead`: `<style media="not all" suppressHydrationWarning>` plus `<script>`.
- **`app/components/loading/SpotlightLoader.tsx`:**
  - `entranceTimeline(elapsed)`: the pure phase math.
  - `claimEntranceStart`:
    - with a live cover, it returns its start, or retires it as `expired` once 1000 ms have passed or the start is missing;
    - otherwise it falls back to HEAD's session claim.
  - The timer effect arms its timers from the absolute start. It attaches React's skip listeners first. Then it either honours a pending `skipped` or hands off (`live`, cover off), and finally dispatches the takeover event.
  - The visual overlay markup is unchanged, except that the `dark` phase is gone (the static cover is the dark phase).
- **`app/root.tsx`:** the 2 lines in the ruling above, and nothing else.
- **`app/lib/__tests__/store-entrance-loader.test.tsx`:**
  - L1–L11 keep their bodies, with the ruled L3/L1/L9 changes.
  - A new describe "SABA-B-13 static head cover and takeover" adds E1–E14 (E3 and E8 are `it.each`; E8b exists).
- **`docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md`** (new): written by A, in Georgian, with the TEMPLATE headings in order.
  - l.3 is exactly `**თარიღი:** 2026-11-12`.
  - l.4 is exactly `**სტატუსი:** Completed (C round 459 PASS)` (L28).
  - The word `pending` appears nowhere.

  The doc must contain:
  - the HEAD numbers above;
  - why the cover lives in `<head>`, and the root narrow grant;
  - the clock definition;
  - the Tailwind exception;
  - the Android reference and its deviation;
  - the E ids;
  - TLM-R459-FIREFOX-SAFARI-ENTRANCE;
  - the "Why we missed it" line;
  - the Saba questions.

**Grants:** exactly `b-round-458/grants-459.txt` (the 5 paths above). No other file. `app/styles/**`, `app/components/animations/**` and every auth-protected file stay unchanged.

## 2. A: steps
1. **Read first:**
   - `lessons.md`, the A part;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `SECURITY_AUDIT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `.claude/prompts/new-test.md`.
2. **Claims before:** run `bash b-round-458/claims-459.sh > a-round-459/claims-before.txt 2> a-round-459/claims-before.err`. The output must equal `b-round-458/claims-459-planning-output.txt`, and stderr must be empty. On a mismatch other than a root-only HEAD drift (L29), STOP.
3. **Apply the patch,** with no hand edits to the 4 code files (C3 pins their hashes):
   - `sha256sum -c b-round-458/sketch-459.sha256` (from the loop root);
   - in the store, `git apply <loop>/b-round-458/sketch-459.patch.txt`;
   - `sha256sum -c <loop>/b-round-458/sketch-files-sha256.txt` from the store root: 4 OK.
4. **Write doc 300** as in §1.
5. **Checks for the changed code** (speed rules):
   - `npm run typecheck`: rc 0.
   - `npm run lint`: rc 0, with 207 warnings [K14].
   - `npx biome check` on the 4 code files: only the 6 diagnostics of [K18]; no format diff.
   - `npx vitest run $(cat <loop>/b-round-458/covering-459.txt)`: 11 files / 201 tests green [K17].
   - **Mutants:**
     - Make a scratch with `git clone --shared` at `891dc0f`, apply the patch, symlink `node_modules`.
     - Run `python3 -I <loop>/b-round-458/mutants.py <scratch> <abs a-round-459/mutants/mutants.txt>`.
     - The output must equal `b-round-458/mutants/mutants.txt` (20 lines: BASE green, M1–M19 red).
   - **code-reviewer:** run it (5 changed paths). Pass its Architecture note to B without acting on it.
6. **Browser (A's own check, not C's rows):**
   - `bash <loop>/b-round-458/probe/serve-prod.sh start /tmp/a459-prod 5191 TREE`.
   - Then `node <loop>/b-round-458/probe/frames.mjs http://127.0.0.1:5191 1440 900 1 fresh a-round-459/fresh-1440.json`: `firstPaintedLum` ≤ 3, and removal minus `firstCovered` within 1400–1700.
   - Run `reload` once: `anyBlackSample` false.
   - Stop the server afterwards.
7. **Claims after:** run `claims-459.sh` again. Its output must equal `b-round-458/claims-459-expected-after-A.txt`, and stderr must be empty. That file is the script's own output on a clean clone with the patch applied and a doc 300 present. It differs from the planning output only in K2, K3, K4, K6, K8 and K9.
8. **Scope:** `git status --short --untracked-files=all` shows only the 5 grants.
9. **Report:** write `a-round-459.md` with the changed files, each step with its real result and log path, the reviewer's findings with ids, and the known gaps.

## 3. C: acceptance rows
**Setup:**
- Real Chromium (Playwright). Copy `b-round-458/probe/*.mjs`, `serve-prod.sh` and `matrix/table.py` into `c-round-459/` first (L60).
- **Servers** (production builds; never the dev server for timing rows):
  - HEAD: `bash c-round-459/serve-prod.sh start <abs c-round-459>/head 5190 891dc0f`.
  - Tree: `bash c-round-459/serve-prod.sh start <abs c-round-459>/tree 5191 TREE`.
  - The mock API runs on `:5199` (start it with `setsid node <loop>/mock-api/server.mjs` if it is down).
- Warm each server once in a browser (L38).
- Run probes one at a time, never during vitest.
- Fill a matrix with `frames.mjs <base> <w> <h> <cpu> <mode> <out.json>`:
  - all modes, on the tree, at 1440×900 and 1280×720, CPU 1 and 4;
  - `fresh`, `reload` and `arrive` on HEAD.
- Write each output line to `c-round-459/matrix/summary.txt` (same format as B's) and tabulate it with `table.py`.

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all`; `git diff --numstat 891dc0f -- app/root.tsx` | Only the 5 grant paths. `root.tsx` numstat is `2 0`, and the 2 added lines are exactly the ruled import and `<EntranceCoverHead />` after `<Links />`. `app/styles/**`, `app/components/animations/**` and the auth-protected files are unchanged |
| C2 CLAIMS | `S=<git clone --shared at 891dc0f, node_modules symlinked> bash b-round-458/claims-459.sh`, then the same on the tree | The clone equals `claims-459-planning-output.txt`; the tree equals `claims-459-expected-after-A.txt`; stderr is empty. Also run L29's grep over this task |
| C3 APPLY | `sha256sum -c b-round-458/sketch-files-sha256.txt` in the store | 4 OK |
| C4 COVERING + MUTANTS | `npx vitest run $(cat b-round-458/covering-459.txt)`; `mutants.py` on a C scratch (clone at `891dc0f` + A's diff, absolute OUT) | 11 files / 201 tests green; `mutants.txt` equals `b-round-458/mutants/mutants.txt` (20 lines) |
| C5 FIRST FRAME (the bug) | `fresh` on HEAD and tree, both viewports, CPU 1 and 4 | **Tree:** `firstPaintedLum` ≤ 3; `firstCovered` ≤ `fp` (the cover is sampled at or before the first paint); `gapsWhileCovered` 0. **HEAD (control):** `firstPaintedLum` ≥ 6 and `firstCovered` > `fp`. Keep one 1440 screenshot of the first non-white frame from each (B: tree 0, HEAD 13.4 [K12]) |
| C6 DURATION | Tree `fresh` and `clientnav` rows | **CPU 1** (state `live`): removed − `firstCovered` within [1400, 1700] (B: 1460–1514 [K13]). **CPU 4 `fresh`:** removed − `dataStart` ≤ 2000 (B: 1846–1910). **CPU 4 `clientnav`:** record only. **All fresh/clientnav/arrive rows:** `logoFullMs` ≥ 600 and `tagFullMs` ≥ 400 (B min 685 / 417). **HEAD control:** `tagFullMs` < 200 |
| C7 NO COVER | Tree `reload` and `rm`, both viewports, CPU 1 and 4 | `anyBlackSample` false, `blackFrames` 0, `finalState` null (B [K20]) |
| C8 FAILSAFE | Tree `blockjs` and `delayjs` | removed − `firstCovered` within [1200, 1500] (B: 1257–1392); the last sample has cover 0; `delayjs` `finalState` `expired` and `logoFullMs` 0 (no replay after hydration) |
| C9 SKIP BEFORE HYDRATION | Tree `esc50`, `tab50`, `click50` | `logoFullMs` 0 (the overlay is never fully shown); `finalState` `skipped` (or `live` for a click that landed after the hand-off); removed − `firstCovered` ≤ 300 at CPU 1 and ≤ 700 at CPU 4. `tab50`: `finalFocus` `A`. `click50` (clicks the header Store link's box): `url` `/` |
| C10 ARRIVE PARITY | `arrive` on HEAD and tree (from `/store`, click the header logo) | Both play (`logoFullMs` > 0). Tree: removed − `firstCovered` ≥ 1300 and `logoFullMs` ≥ 600; `finalState` null (no boot cover on an in-app arrival) |
| C11 HYDRATION + SSR LOG | On the tree dev server `:5173`, warmed twice: `console.mjs <base> fresh` ×3 and `console.mjs <base> reload` ×3; then grep the dev server's SSR log (or run `renderToString` via the L1 row) for `useLayoutEffect does nothing on the server` | `hydration` 0 in every run, as on HEAD (B: `console-sketch-dev3.json`, `console-head-dev.json`). No SSR useLayoutEffect warning. A cold-start run that logs Vite "optimized dependencies changed" is environment-invalid, kept and replaced |
| C12 COLOUR + LAYER | Tree `fresh`, 1440: read `getComputedStyle(document.body,'::before')` while covered | `background-color` `rgb(0, 0, 0)`, `z-index` `60`, `position` `fixed`; the header (`z-50`) is not visible in the first frame screenshot |
| C13 STUDIO + PURCHASE PROTECTION | From inside `c-round-459/`: `node <copy of b-round-453/probe/c12-run/c12-from-c448.cjs> <base> <tag> > c12-<tag>.json` on the tree dev server | At 1440 and 1280: `/studio-lab` has 1 clip, goes to Playing and Stopped, and `stopHeld` is true; anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0 |
| C14 DOCS + LESSON | doc 300; `lessons.md` | Doc 300: l.3/l.4 exact; TEMPLATE headings in order; no `pending`; E1–E14 cited and present in the test file; the Tailwind exception, the Android reference, the TLM row and the Saba questions are present. `lessons.md` has 60 lines or fewer, and `grep -c "first painted frame" lessons.md` ≥ 1 |
| C15 L57 | `python3 -I tools/l57-check.py c-round-459.json c-round-459/l57-check.txt` | rc 0 |

**Notes for C:**
- **Gate rows** (full vitest, typecheck, build, Biome, verify) are marked `gate` and are not claimed by C.
  - B's runs on the dispatched sketch: full 284 files / 4171 tests rc 0 (`precheck-full-raw.log`), typecheck rc 0, e2e smoke 2/2 (`precheck-smoke.log`), production build rc 0.
- **Not testable in the cloud:** Firefox and Safari (`body::before` + the `media` toggle, the WebKit first-paint timing). Tech Lead row TLM-R459-FIREFOX-SAFARI-ENTRANCE, deadline RETRO 465.
- **Saba's own check needs a fresh tab** (a new window or a new tab, not a reload). This goes in the feature-status note.
- **`c-round-459.json`:**
  - Write all L57 fields, and give every finding an `origin`.
  - Set `mutantRedOnSketch` = `b-round-458/mutants/mutants.txt`.
  - Set `affectedChecksRunOnSketch` = `b-round-458/precheck-covering.log` and `b-round-458/probe/matrix/summary.txt`.

**Neighbours that could break:**
- **The full e2e suite** (`npm run test:e2e`, not a gate row) has 40 `goto('/')` calls [K19]. Those specs now wait up to about 0.3 s longer behind the entrance. Recorded, not run.
- **LeadMagnet, toasts and the cookie banner** appear after hydration, above or below the z-60 cover, as `tech-lead` checked. The cookie banner (z-50 [K7]) sits under the cover while it lasts.
- **Studio and purchase protection:** C13.

## 4. Claims
Run `bash b-round-458/claims-459.sh`. It also runs `tools/l58-check.py`.
- The planning output is `b-round-458/claims-459-planning-output.txt`.
- The expected after-A output is `b-round-458/claims-459-expected-after-A.txt`: a clean clone at `891dc0f`, the patch applied, and a placeholder doc 300.
- Both stderr files are empty.

| Tag | Claim | Expected at planning |
|---|---|---|
| K1 | gate 458 status and commit | `published 891dc0f` |
| K2 | store HEAD, dirty count | `891dc0f dirty=0` |
| K3 | SpotlightLoader total; session key count; EntranceCover.tsx exists | `SPOTLIGHT_ENTRANCE_TOTAL_MS = 1150\|1\|EntranceCover=0` |
| K4 | root.tsx `<Links />` count, `<EntranceCoverHead />` count, line after `<Links />` | `links=1 cover=0` + the GA4 comment line |
| K5 | PageTransition `opacity: 0,` count and `y: 8,` count | `2 1` |
| K6 | "at most 1200 ms" in the entrance test | `1` |
| K7 | Header `sticky top-0 z-50`; CookieConsent `z-50` | `1 1` |
| K8 | doc 300 exists | `0` |
| K9 | importers of `SPOTLIGHT_ENTRANCE_TOTAL_MS` \| `entrance-loader` \| `czaba-entrance-cover`/`EntranceCover` in app/perf/e2e | see the planning output file |
| K10 | cited `b-round-458/` files exist (29) | `1` × 29 |
| K11 | patch sha OK; review names the sha; mutant lines; red; base | `OK review=1 mutants=20 red=19 base=1` |
| K12 | HEAD `fresh` rows (fp, firstCov, logo, tag) | from `probe/matrix/summary.txt` |
| K13 | sketch `fresh`/`clientnav` rows (remFirstCov, remStart, logo, tag, state) | from `probe/matrix/summary.txt` |
| K14 | Biome lint warnings, HEAD vs sketch | `205` / `207` |
| K15 | `bg-black` in SpotlightLoader.tsx | `1` |
| K16 | L58 check on this task | `L58 OK …` |
| K17 | full and covering test counts on the sketch | `4171 passed` / `201 passed` |
| K18 | Biome diagnostics on the 4 sketch files | `5 noDangerouslySetInnerHtml, 1 noArrayIndexKey` |
| K19 | `goto('/')` count in `e2e/*.ts` | `40` |
| K20 | sketch `reload`/`rm` rows (black frames, firstCov) | `black0 firstCovNone` × 8 |

## 5. After this round
- **REGRESSION-2026-11-13:** due when round 460 is planned on or after 11-13 (`regression-last.json`).
- **Then the remaining STORE-REDESIGN order:**
  1. **STORE-2b-3c-2b**, the glow regex forms (Low/info);
  2. **STORE-2b-3d**, the dead tokens;
  3. **STORE-2b-4**;
  4. **STORE-2c…5**.
- **After STORE-2b:** the root DP-GATE.
- **Then** ARCH-SPLIT, REVIEW-RECOMMENDATIONS (SABA-B-12 stage 4, STUDIO-VIS-5) and T12-ADVANCED, then phase 2 under the skip rule.
- **RETRO** at round 465.
