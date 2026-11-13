# Round 489: SABA-B-17-ENTRANCE-3-4S. The first-visit entrance lasts at least 3.5 s and can be seen on a slow first visit; a scroll gesture under the cover skips it instead of scrolling the page unseen

**Planned by:** B, at the round 488 → 489 planning on 2026-11-13 (`b-round-488.md`, `b-round-488/checkpoint.md`).
- **Archive:** the round-488 task is archived as `tasks/round-488.md`, copied byte-equal (`cmp`) before this task was written; B's second copy is `b-round-488/current-task-before-489.md`.
- **Decisions:** D-29z1741 … D-29z1746 (`backlog.json`, `decisions_log_b`).
- **Advisor:** available; consulted before the sketch and at the end (`b-round-488.md`).

## Read first
- **`lessons.md` in full.** Directly relevant: L4 (ruling lines; port preserves HEAD), L10 (one STOP threshold), L11, L18 (first painted frame; the new "felt quantity" clause), L23, L28 (doc l.4), L29 (claims), L38 (timed probes run alone; warm up), L56, L57, L58 (sketch, mutants, review), L59, L60.
- **Claims:** `bash b-round-488/claims-489.sh` (`ROOT=` and `LOOP=` can be overridden).
  - `b-round-488/claims-489-planning-output.txt` is its output on the store tree at planning (HEAD `73f994d`, clean). **A** runs it before applying: it must be equal.
  - `b-round-488/claims-489-sketch-output.txt` is its output on B's sketch-applied scratch (`ROOT=/tmp/b489-scratch`: a clone at `73f994d` with the sketch applied). **C** compares the store tree with it at start and at end; every line must be equal. Only K16 may differ, and only if root rewrote this task.

## Baseline: HEAD `73f994d`, clean tree
- Gate 488 is `published`, commit `73f994d` [K1]. The store HEAD is `73f994d` with 0 changed paths [K2].
- A root-only commit after planning that leaves `git diff 73f994d HEAD -- app` empty is accepted with a note. Anything else is "STOP — baseline differs".

## 0. Why this round
- **SABA-B-17-ENTRANCE-3-4S (Medium, Saba 2026-11-13).** "The SpotlightLoader disappears too fast. On a first visit it must last at least 3–4 seconds. It does not load every time anyway (only the first visit), so what is the point if you cannot see it." Today the constants are 1450 / 1900 / 1000 / 250 ms (min total, max total, failsafe, exit) [K3]. The post-takeover pacing is logo +120 ms, line and tagline +300 ms, exit no earlier than +1050 ms [K4].
- **B measured HEAD on production builds** (`b-round-488/probe/head/`; full control matrix in `probe/head-matrix/table.txt`; Chromium, mock API, fresh tab):
  - fresh at 1× CPU: the cover lifts about 1.55 s after its first frame (1440: firstCovered 98 → removed 1650). The logo is fully visible about 710 ms, the tagline about 465 ms.
  - 4× CPU: logo 409–576 ms, tagline 185–354 ms.
  - **Slow first visit** (new Medium B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED): with JS delayed 1.5 s, or on Fast 3G, the entrance never plays. The user sees about 1.3 s of plain black, then the page (state `expired`, logo 0). At 4G + 4× CPU the logo is fully visible 170 ms and the tagline never.
  - **Wheel under the cover** (new Medium B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER): a 600 px wheel at 0.8 s scrolls the page underneath unseen (`scrollY` 600).
  - A 3.5 s floor makes both more likely, so they are fixed in this round (L10: one feature plus its directly amplified defects).
- No REGRESSION round is due (`regression-last.json`: 2026-11-13, round 484; next on or after 2026-11-16). The next RETRO is at round 495.

## What changes (user-visible)
- **Fresh tab on `/`, 1× CPU:** the cover lifts about 3.5 s after its first black frame, up from about 1.55 s. The logo is fully visible about 1.7 s and "Cinematic Sound Design" about 1.05 s. The pacing is: light (0.8 s fade-in), then the name (+0.4 s, 0.7 s fade), then the line and tagline (+1.1 s, 0.5 s fades), then a hold, then a 0.5 s exit fade.
- **Slow CPU or slow JS:** the black cover now waits up to 2 s for the page's JS (was 1 s), so 4G + 4× CPU and "JS 1.5 s late" play the full entrance (at most 5 s in total). Fast 3G (JS about 2.3 s late) still gives up: about 2.3 s of black, then the page. That case goes to Saba (SABA-Q-ENTRANCE-SLOW-WAIT).
- **Scroll under the cover:** a wheel or touch scroll skips the entrance, and its first event does not scroll the page. A zoom gesture (Ctrl+wheel, two-finger pinch) also skips it but is not blocked. Esc, Tab and click still skip at any time; other keys still do not.
- **Unchanged:** once per tab; same-tab reload and reduced motion show no black frame; the look, copy, colours and positions; the no-JS fallback (a black-only cover that fades by CSS, now after 2.0 s instead of 1.0 s, still with a 250 ms fade). No persistent screen element is added (L39 does not apply).

## Reference
| Point | Reference (source) | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|
| A splash covers the app from launch and is opaque | Android 12+ SplashScreen, https://developer.android.com/develop/ui/views/launch/splash-screen (cited in round 459, `tasks/round-459.md` "Reference"; not re-fetched this round) | "a single window background color with no transparency"; dismissed "when the app is ready" | **Match:** unchanged black cover from the first frame | C5, C9 |
| Motion can be skipped | same page: "make sure the motion can be comfortably skipped" | skippable | **Match, extended:** Esc/Tab/click as before, plus wheel/touchmove (a scroll is a clear "let me in") | C8, C11 |
| Recommended duration | same page: "we recommend not exceeding 1,000 ms" for the icon animation | ≤ 1 s | **Deviation (Saba's decision, 2026-11-13):** at least 3.5 s on the first visit, once per tab, for perceived value; Saba asked for 3–4 s. "Simpler to build" is not the reason | C5, C6 |
| Zoom is an accessibility gesture | WCAG 2.2 SC 1.4.4 Resize Text (https://www.w3.org/TR/WCAG22/#resize-text; cited, not re-fetched) | the user can zoom | **Match:** Ctrl+wheel and pinch are never cancelled (tech-lead finding 1) | S3, E8e (jsdom); C8 record |

- **No Ableton reference:** this is the Store, not the Studio.
- **Lenis** (third-party code, not a reference product): `lenis` 1.3.17 listens for `wheel` on `window` in the bubble phase with `{ passive: false }` [K10]. A capture listener on `window` therefore sees the event first.
- **`product-designer`** (2 consults, `b-round-488/pd-consult.md`): it chose the 3500 ms floor, the 500 ms overlay exit, the 2000 ms window and the 5000 ms cap, and said the blind scroll must be fixed now. Its preferred fix for Fast 3G, a static CSS logo on the cover, changes the look. It stays a Saba question (SABA-Q-ENTRANCE-WORDMARK, re-asked with the new evidence) and is not built.

## Why we missed it (Saba-found issue rule)
- **Which phase should have caught it:** the B spec of SABA-B-13 (rounds 455–461). Saba wrote "a minimum display duration (e.g. 1.2–1.5 seconds)"; B and `product-designer` built 1450 ms from the example, and C verified exactly that number.
- **Why it was missed:** an example number in a feel request was treated as the target. Saba got no recording to judge the feel before the item was called done. No row ran a slow-network first visit, where the entrance does not play at all.
- **Rule:** L18 gains a "felt quantity" clause in this planning (merged, `lessons.md` stays at 60 lines; D-29z1746). An example number Saba gives is a lower bound to confirm with him, not the target. A duration or speed round ships a 1× screen recording for Saba and a network-throttled first-visit row. C checks the clause exists (C17), and C13 makes the recording.

## Ruling lines (L4)
- **"Other keys do not skip"** (L6 row with `['a', 'ArrowDown', 'Shift']`, and E8b with `Enter` added [K9]) vs "a scroll gesture skips": the keys clause wins for keys. Wheel and touchmove are a separate new clause. Scroll keys under the cover stay as at HEAD (Low B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER, deferred until Saba answers SABA-Q-ENTRANCE-SCROLL-SKIP).
- **`ENTRANCE_EXIT_MS` (250, the no-JS CSS fade and the boot listeners' self-removal) vs the new `ENTRANCE_OVERLAY_EXIT_MS` (500, the React overlay fade):** each keeps its own job. E1's `250ms ease-in-out` literal stays.
- **The wheel during the 500 ms exit fade** is still swallowed (first event only), while clicks pass through (`pointer-events-none`). Accepted (tech-lead Low 6); not changed.
- **Doc 300** (SABA-B-13) keeps its historical numbers. It is not granted; doc 316 supersedes it for the timing.
- **Port of the HEAD pins** in `store-entrance-loader.test.tsx`; no assertion is lost, and equal or stronger replacements are allowed:
  - L3: `toBe(1450)` → `toBe(3500)`; `toBe(1900)` → `toBe(5000)`; plus one new assert at 2999 ms (pointer events still on). Present at `TOTAL − 1` and gone at `TOTAL` stay; the tail stays `MAX + 5000`.
  - E1: `toBe(1000)` → `toBe(2000)`; the `250ms ease-in-out ${FAILSAFE}ms` literal stays.
  - E6: the literal objects become `{400, 1100, 3000, 3500}` and `{400, 1100, 2840, 3340}`. `160 + end` = 3500 (was 1460). `900 + end` = 3900 (was MAX). `999 + end = MAX` becomes `1999 + end = 4999`, `2000 + end = MAX` and `2600 + end = MAX`. `-50` equals `0` stays.
  - L4, L5, L6, L9, L11 and E5, E7, E17–E21 are unchanged; they use `TOTAL`, `ENTRANCE_FAILSAFE_MS` or `entranceTimeline`.
  - New rows: S1, S2, S3, E6b, E8c, E8d, E8e [K13].
- **Sweep (L23, L29):** the importers of the changed constants and modules in `app`, `perf` and `e2e` are the 7 files in K5: the two components, the entrance test, the 3 source-scan tests in the covering set (`store-gradient-text`, `store-live-teal`, `store-teal-sweep`) and `app/root.tsx` (it imports `EntranceCoverHead` only and is not changed). `app/routes/_index.tsx` reaches `SpotlightLoader` through the barrels `app/components/loading/index.ts` and `app/components/common/index.ts`, which re-export the component only [K23]. Old literals 1450/1900 next to entrance words in the tests, components, `perf` and `e2e`: the count in K6 (B: 0 after the port). `e2e/agent-system-smoke.spec.ts` never visits `/`; the full e2e suite has 40 `goto('/')` calls [K11]; it is not a gate row and needs the backend (ruled: record, not run).
- **Tailwind scan of docs (L56):** the production CSS of HEAD, the sketch and the sketch plus doc 316 are byte-equal (`probe/css-compare.txt`) [K20].

## 1. What changes (sketch `b-round-488/sketch-489.patch.txt`, sha256 in `b-round-488/sketch-489.sha256`)
A applies it from `store/` with `git apply ../tmp/studio-real-loop/b-round-488/sketch-489.patch.txt`. The result must be byte-equal to `b-round-488/sketch-489/` (K14 `====`).
1. **`app/components/loading/EntranceCover.tsx`:**
   - The constants become `ENTRANCE_MIN_TOTAL_MS = 3500`, `ENTRANCE_MAX_TOTAL_MS = 5000` and `ENTRANCE_FAILSAFE_MS = 2000`. `ENTRANCE_EXIT_MS = 250` is unchanged.
   - New constants: `ENTRANCE_OVERLAY_EXIT_MS = 500`, `ENTRANCE_EXIT_AFTER_TAKEOVER_MIN_MS = 2500` and `ENTRANCE_SCROLL_SKIP_EVENTS = ['wheel', 'touchmove']`.
   - The boot script adds a `scroll` handler on `window`, capture, `passive: false`, built from `ENTRANCE_SCROLL_SKIP_EVENTS`. For a non-zoom gesture (not `ctrlKey`, fewer than 2 touches) it calls `preventDefault` (when cancelable) and `stopPropagation`; then it calls `end()` (skipped). `off()` removes both listeners with capture `true`.
2. **`app/components/loading/SpotlightLoader.tsx`:**
   - Pacing: `LOGO_AFTER_TAKEOVER_MS = 400`, `HOLD_AFTER_TAKEOVER_MS = 1100`, `SPOTLIGHT_DURATION = 0.8`, `LOGO_FADE_DURATION = 0.7`, `LOGO_TRACKING_DURATION = 0.9`, `TAGLINE_FADE_DURATION = 0.5`. The exit duration is `ENTRANCE_OVERLAY_EXIT_MS`.
   - `entranceTimeline` uses `ENTRANCE_OVERLAY_EXIT_MS` and `ENTRANCE_EXIT_AFTER_TAKEOVER_MIN_MS`.
   - The overlay effect adds the same scroll-skip listeners. `isZoomGesture` checks `instanceof WheelEvent` with `ctrlKey`, or `TouchEvent` with 2 or more touches, with no type assertions; the cleanup removes the listeners with `{ capture: true }`.
3. **`app/lib/__tests__/store-entrance-loader.test.tsx`:** the port above, plus S1, S2, S3, E6b, E8c, E8d and E8e. The listener tracker counts `(type, listener, capture)`.
4. **`docs/implementation/2026/quarter-IV/316-saba-b-17-entrance-duration.md`** (new; B writes it in full in the sketch, so the delivered tree equals B's pre-check tree, L56). Its l.4 is `**სტატუსი:** Completed (C round 489 PASS)` (L28).

## 2. A: grants, forbidden, checks
- **Granted paths (only these):** the 4 sketch files (§1), applied byte-equal. A changes no sketch line, doc 316 included; a doc 316 line A finds false is a STOP (below), not an edit.
- **Forbidden:**
  - `global_forbidden_files` (including `app/root.tsx`, which stays byte-equal [K7]; `app/styles/**`; `app/contexts/AuthContext.tsx`; `app/lib/auth*`) and `global_forbidden_actions`;
  - the protected purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`); `app/components/arrangement/**`; `app/hooks/useSmoothScroll.ts`; doc 300;
  - commit, push, stash, checkout, reset, deploy; restarting the :5173 dev server.
- **STOP threshold (the only statement of it; L10):** STOP and report, without editing any sketch line, if:
  - `git apply` fails or K14 is not `====`;
  - a Medium+ finding (your code-reviewer, or a failing or slow covering test) is not ruled in this task;
  - a line of doc 316 is false at hand-over;
  - any path outside the grants would need to change.
- **A runs:**
  - the start check: `bash ../tmp/studio-real-loop/b-round-488/claims-489.sh` equals `claims-489-planning-output.txt`;
  - after applying: `npm run typecheck`; `npm run lint`; `npx biome check app/components/loading/ app/lib/__tests__/store-entrance-loader.test.tsx` (expected: the 3 pre-existing warnings, 2 `noDangerouslySetInnerHtml` in `EntranceCover.tsx` and 1 `noArrayIndexKey` in `TrackListSkeleton.tsx`, as at HEAD [K15]);
  - `npx vitest run app/lib/__tests__/store-entrance-loader.test.tsx app/lib/__tests__/store-live-teal.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts`. B's sketch run: 4 files, 92 tests (`b-round-488/sketch-489-covering.log`) [K24];
  - the code-reviewer (4 files).
- **A does not run** the full suite (B ran it on the sketch: `b-round-488/precheck-full-489.log` [K19]; the gate runs it again) or any browser probe.
- **Report in `a-round-489.md`:** start HEAD and `git status`; the start check; `git apply` output; K14; commands with pass counts; reviewer findings and its Architecture note.

## 3. C: rows
- **Setup (production builds; never the dev server for timing rows):**
  - Copy `b-round-488/probe/{frames489.mjs,run-matrix.sh,table.py,serve-prod489.sh,record.mjs}` into `c-round-489/` first (L60).
  - Servers: HEAD with `bash c-round-489/serve-prod489.sh start <abs c-round-489>/head 5190 73f994d`; tree with `bash c-round-489/serve-prod489.sh start <abs c-round-489>/tree 5191 TREE` (`SRC` unset = the store tree). Start them in the background; the script returns once the port answers.
  - Start the mock API on `:5199` if it is down: `setsid node <loop>/mock-api/server.mjs`.
  - Matrices: `bash c-round-489/run-matrix.sh http://127.0.0.1:5191 <abs c-round-489>/tree-m`, then the same for `:5190` into `head-m`. Each runs alone (L38; no vitest, build or other browser job meanwhile). Then run `table.py` on each `summary.jsonl`.
  - B's values: `b-round-488/probe/sketch-all-modes/table.txt` (sketch; every mode in this table) and `probe/head-matrix-all-modes/table.txt` (HEAD). B's first v2 run, without the C5b/C7b/C11b modes and the `hydrationErrors` field, is `probe/sketch/table.txt` and `probe/head-matrix/table.txt` (doc 316 cites it). One environment-invalid run (timeout, cold start) may be replaced twice per row; keep it.
- **Measurement base:** `remFc` = removed − first covered rAF sample; `remDs` = removed − `data-start`. The floor counts from `data-start` (the boot script's clock) and is asserted on `remDs`; the first covered sample is about 10–60 ms later, so `remFc` reads slightly below 3500 (B: down to 3418 on `clientnav`) and gets a looser bound.

| Row | What | Pass when |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all`; `git diff --numstat 73f994d -- app/root.tsx` | exactly the 4 granted paths (3 ` M`, 1 `??`); `root.tsx` has no diff; protected files unchanged |
| C2 CLAIMS | `bash b-round-488/claims-489.sh` at start and at end; L29's grep over this task | at start and at end every line equals `claims-489-sketch-output.txt` (K16 may differ only if root rewrote this task); stderr empty |
| C3 APPLY | K14 | `====` |
| C4 COVERING + MUTANTS | A's covering command; `python3 -I b-round-488/mutants-489.py <C outdir> <C scratch: clone at 73f994d + the store diff>` (never on `store/`) | 4 files / 92 tests green; C's `mutants-summary.txt` equals `b-round-488/mutants/mutants-summary.txt` (22 lines, no `NONE`, no `BAD-ANCHOR`) [K18] |
| C5 DURATION 1× | tree `fresh` 1440 and 1280 (cpu 1) | state `live`; `firstCovered` ≤ `fp`; `remDs` ≥ 3450 and `remFc` within [3300, 3800]; `logoFullMs` ≥ 1400; `tagFullMs` ≥ 800; `gapsWhileCovered` 0. **HEAD control:** `remFc` ≤ 1800 and `tagFullMs` ≤ 600 |
| C5b CLIENT NAV BACK | tree `clientnav` (load `/`, wait 6 s, go to `/store`, then Back) | the first load as C5 (state `live`, `remDs` ≥ 3450, `remFc` within [3300, 3800]); after Back `coveredAfterMark` 0 (no second cover or overlay) and URL `/` |
| C6 DURATION 4× | tree `fresh` cpu 4, both viewports | `remDs` within [3450, 5000]; `logoFullMs` ≥ 1200; `tagFullMs` ≥ 600 |
| C7 SLOW FIRST VISIT | tree `net4g` cpu 1 and cpu 4, `delay800` (JS 0.8 s late, clearly inside the 2 s window) | state `live`; `logoFullMs` ≥ 1200; `tagFullMs` ≥ 600; `remDs` ≤ 5000. **HEAD control:** `delayjs` state `expired` with `logoFullMs` 0; `net4g` cpu 4 `tagFullMs` < 300. `delayjs` (1.5 s) and `net3g` are near the 2 s edge: `record` only on both trees (B: tree `delayjs` `live`, `net3g` `expired` after about 2.3 s of black; SABA-Q-ENTRANCE-SLOW-WAIT) |
| C7b LATE JS GIVES UP | tree `delay3000` 1440 and 1280 (JS 3 s late, clearly outside the window) | state `expired`; `logoFullMs` 0 and `tagFullMs` 0 (no replay after hydration); `remFc` within [2100, 2700] (the black cover gives way by CSS after 2.0 s + 0.25 s); the last sample has cover 0. **HEAD control:** `expired`, `remFc` within [1150, 1600] |
| C8 SCROLL UNDER THE COVER | tree `wheel` 1440 and 1280 (wheel at 0.8 s, after takeover) and `wheel50` (wheel as soon as the head cover is on) | `scrollY` 0; `logoFullMs` 0 for `wheel50`; `wheel` removed within 1200 ms of `firstCovered`; final state `live` (`wheel`) / `skipped` (`wheel50`). **HEAD control:** `wheel` `scrollY` 600. Ctrl+wheel browser zoom: `record` only (a headless page cannot prove browser zoom; jsdom rows S3/E8e cover the not-blocked contract). Touch: jsdom only; the real-phone half is TLM-R489-TOUCH-SWIPE |
| C9 NO COVER | tree `reload`, `rm` | `firstCovered` null; state null |
| C10 NO-JS FAILSAFE | tree `blockjs` | `remFc` within [2100, 2700]; `logoFullMs` 0; state null |
| C11 SKIP BEFORE HYDRATION | tree `esc50`, `tab50`, `click50` | `logoFullMs` 0; state `skipped`; `remFc` ≤ 400; `scrollY` 0; `tab50` final focus `A`; `click50` URL `/` |
| C11b SKIP DURING LOGO / HOLD | tree `esc1500`, `tab1500`, `click1500` (the key or click 1.5 s after `data-start`, after takeover, while the logo shows) | state `live`; `logoFullMs` > 0; `removedAfterMarkMs` ≤ 300 (the overlay goes at once, no exit fade); `scrollY` 0; `tab1500` final focus `A`; `click1500` URL `/` (the click on the overlay does not reach the Store link) |
| C12 ARRIVE | tree `arrive` | `logoFullMs` ≥ 1400; `remFc` ≥ 3300; state null |
| C13 RECORDING FOR SABA | `node c-round-489/record.mjs http://127.0.0.1:5190 <abs c-round-489>/rec saba-b-17-entrance-before-1440` and the same on `:5191` as `…-after-1440`; then **copy** (never move or delete) the two `.webm` files into `<loop>/user-review/img/` | both `.webm` files and the 3 stills each (`-0500`, `-2000`, `-3200.png`) exist in `c-round-489/rec/`; the after stills at 2.0 s and 3.2 s show the wordmark, the before still at 2.0 s shows the page (B's run: `b-round-488/probe/rec/`). Saba's own judgement is TLM-R489-SABA-ENTRANCE-FEEL, not a C row |
| C14 HYDRATION | `hydrationErrors` in every tree row of the production matrix (console #418/#423/#425/hydrat) | 0 in every row, as on HEAD |
| C15 STUDIO + PURCHASE PROTECTION (G489-AUTH) | fresh context, no credentials, both viewports | `/account` shows "Sign in required" with no "Full Name"; `/studio-lab` opens the demo anonymously (`auth_user` null) and plays; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` |
| C16 DOC | doc 316 | l.4 byte-exact `**სტატუსი:** Completed (C round 489 PASS)`; TEMPLATE's 7 headings in order (L26); no `pending`; every cited row id (L3, E1, E6, E6b, S1, S2, S3, E8c, E8d, E8e) exists in the test file; every number in the browser-measurement bullet of its "ტესტირება" section ("B-ის ბრაუზერის გაზომვა …") is in `b-round-488/probe/sketch/table.txt` or `probe/head-matrix/table.txt` |
| C17 LESSON | `lessons.md` | at most 60 lines; `grep -c "example number" lessons.md` ≥ 1 [K22] |
| C18 L57 | `python3 -I tools/l57-check.py c-round-489.json c-round-489/l57-check.txt` | rc 0; all L57 fields are written, including `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch` (INFO-C488-L57-ABSENT) |
| gate | full vitest, typecheck, build, Biome, `npm run verify` | root gate only; never in `passed` |

- **product-designer's rows** (`b-round-488/pd-consult.md`), each mapped:
  | product-designer row | Covered by |
  |---|---|
  | Esc / Tab / click in the cone phase | jsdom L5, L6 (300 ms) |
  | Esc / Tab / click during logo and hold | C11b |
  | Esc / Tab / click during the exit fade | ruled: the overlay is already leaving (`pointer-events-none`, L4); no row |
  | click on the black cover before takeover; React does not restart it | C11 `click50`; jsdom E8, E14 |
  | reduced motion | C9 `rm`; jsdom L9, E3 |
  | same-tab reload / returning visit | C9 `reload`; jsdom L7, E10 |
  | client navigation back to `/` | C5b |
  | 4× CPU: floor, logo ≥ 1.2 s | C6 |
  | 1280×720 logo and tagline not clipped | ruled: the sketch changes no class, size or position (K14 diff; the CSS is byte-equal, K20); C5 at 1280 plus C13 stills |
  | skip while the cover is still black | C11, C8 `wheel50` |
  | tab hidden mid-entrance | out of scope (SABA-Q-ENTRANCE-BACKGROUND-TAB, unchanged default) |
  | focus after the exit | C11 `tab50`, C11b `tab1500` (focus `A`); a natural finish leaves focus where it was (BODY), as at HEAD (`record`) |
  | overlay hidden from screen readers | jsdom L2 (`aria-hidden`) [K25] |
  | page at the top after any skip | C8, C11, C11b `scrollY` 0 |
- C writes all L57 fields, with an `origin` per finding. `mutantRedOnSketch` names `b-round-488/mutants/mutants-summary.txt`.
- The Tech Lead manual rows **TLM-R489-SABA-ENTRANCE-FEEL** (Saba on the Vercel preview, in a fresh tab) and **TLM-R489-TOUCH-SWIPE** (a real phone: a swipe skips without scrolling, a pinch zooms) do not block (2026-10-23 clarification). Deadline: RETRO 495 (L46).

## 4. Rulings (L10)
- **Floor and cap:** 3500 ms from `data-start` on every path that ends `live`; 5000 ms cap = window 2000 + post-takeover floor 2500 + overlay exit 500. A takeover at the end of the window still gets the whole post-takeover floor (E6b).
- **Window 2000 ms:** a page whose JS arrives later than that gets no entrance (`expired`, as HEAD at 1000 ms). The black wait before giving up grows from about 1.3 s to about 2.3 s; this is SABA-Q-ENTRANCE-SLOW-WAIT (non-blocking, default 2 s).
- **Scroll skip:** wheel and touchmove skip before and after hydration. The first non-zoom event is swallowed (`preventDefault` when cancelable, plus `stopPropagation` on `window` capture); later events of the same gesture scroll normally once the cover is gone. Zoom gestures (Ctrl+wheel, 2 or more touches) skip without being blocked. This is the default of SABA-Q-ENTRANCE-SCROLL-SKIP and is reversible.
- **tech-lead review of v1** (`b-round-488/sketch-review.md`), each finding ruled:
  - M1 (zoom blocked): fixed in v2.
  - M2 (doc 316 over-claims): fixed in v2. l.4 keeps the L28 final form, as the loop rule requires; the browser lines cite B's probe numbers and say what C repeats.
  - L3 (tracker ignores capture): fixed.
  - L4 (constant name and location; boot event list): fixed.
  - L5 (constant-only pins): fixed (dropped).
  - L6 (wheel in the exit fade): accepted (ruling line).
  - Info 7 (measurement base): written into §3.
- **Out of scope:** the look (no CSS logo on the cover; SABA-Q-ENTRANCE-WORDMARK), scroll keys (Low B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER), a hidden background tab (SABA-Q-ENTRANCE-BACKGROUND-TAB, unchanged default), hero animations under the cover (SABA-Q-ENTRANCE-HERO), `PageTransition`, `root.tsx`.

## 5. Sketch review and mutants (L58)
- `b-round-488/sketch-review.md` names the dispatched sha256 and records `tech-lead`'s verdicts. v1 `fe221c54…`: APPROVE WITH CHANGES (2 Medium, 4 Low, 1 Info). v2 `dd413c11…`: APPROVE (delta re-review). v3 `4a15bff3…` (doc 316 numbers only, `sketch-489-v2-to-v3.diff.txt`) is the dispatched sketch; its delta review is recorded with both shas.
- **Mutants:** 22 (M0 = the HEAD source files with the new tests; M1–M21). Logs and summary are in `b-round-488/mutants/`. Run them from a clone, never from `store/`.

## 6. Outcome fixed in advance
- **C PASS with browserVerified true:** SABA-B-17-ENTRANCE-3-4S, B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED and B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER → done (Saba's feel check TLM-R489-SABA-ENTRANCE-FEEL stays open and does not block). Round 490 = B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, unless a REGRESSION is due.
- **FAIL:** a fix-up first.
- **PARTIAL (time):** the same round resumes from `c-round-489/progress.json`.
