# Round 468: SABA-B-15 stage 1. Find what drops frames when the Store home page scrolls (diagnosis; no store change)

**Planned by:** B, at the round 467 → 468 planning on 2026-11-12 (`b-round-467.md`). The advisor was available and was consulted twice: after orientation and before hand-off. The round-467 task is archived as `tasks/round-467.md`; its byte-identical copy is `b-round-467/current-task-before-468.md`.

## Decisions (all in `backlog.json` `decisions_log_b`)
- **D-29z1647: round 467 accepted.** C PASS (`c-round-467.json`: 13 rows, 0 bugs, browserVerified/realVerified true). Gate 467 published `9ba13ac` [K2].
  - Closed: C-R466-01, A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC and GATE452-L1-GLOW-REGEX-WHOLE-SOURCE.
  - The STORE-2b-3c-2b code stage is done. A-R467-REVIEW-L1 (Low) goes to `deferred_low_polish`.
- **D-29z1648: Saba's 2026-11-12 items are recorded (L42).**
  - SABA-B-15: the scroll is not smooth (Medium).
  - SABA-Q-CTRLK-CONTENT and SABA-Q-GIFTCARDS-HEADER: `awaiting_user`.
  - SABA-B-16-LOGO-OLD-COLORS (Medium): input to the first DP-GATE.
  - The critical review stance is recorded on ROOT-REQ-DP-GATE-FIRST.
  - Questions: `user-review/questions-round-467.md`.
- **D-29z1649: this dispatch.** SABA-B-15 goes ahead of STORE-2c. This follows the SABA-B-14 precedent: a Saba Medium on a mounted Store screen.
  - It is split: **stage 1 = diagnosis** (this round), **stage 2 = the fix**, with exact grants, in round 469.
  - Reason: B's own bisect shows the cost is not in the Lenis hook. The file that holds the cause is unknown, so a grant cannot be written yet.
  - **Regression is not due.** `regression-last.json` is dated 2026-11-10 [K12], and 2026-11-10 + 3 days = 2026-11-13. This planning is dated 2026-11-12.

## Rules
- **Read `lessons.md` first.** L18 now has a scroll-frame clause from this issue.
- **L57:** C writes **all L57 fields** (see `lessons.md` L57) and an enum `origin` per bug. C runs `python3 -I tools/l57-check.py c-round-468.json c-round-468/l57-check.txt` (rc 0) before hand-off.
  - `mutantRedOnSketch` is `null`: no sketch, because this is a diagnosis round.
  - The mutant of the eased-scroll guard is B's Lenis-off build (`b-round-467/probe/scroll-prod-lenis-off-cpu1.json`): 20 moving frames, which is < 100, so the guard is red.
- **L29:** every statement about a file under `store/` carries a `[K#]` tag. The claims script is `b-round-467/claims-468.sh`, and B's run is `b-round-467/claims-468-planning-output.txt`.
- **L38:** the frozen scroll probe runs alone. No vitest, tsc, build or other browser job runs while it does.
- **L59 / L60:** run the heaviest browser rows first, and write `progress.json` after each row. Destructive commands stay inside your own round folder. Never use `git stash` or `git checkout --` in the store tree.
- **Not applicable:** reference-first, Ableton conformance, the product-designer step and the screen budget. Nothing visible changes this round.

## Baseline: HEAD `9ba13ac`, clean
- `git status` shows 0 lines [K1]. The protected manifest `b-round-318/protected-sha256.txt` is rc 0 [K14].
- **Grants in the store tree: none.** The store tree stays byte-identical, and so does every protected file.
- All edits happen only in scratch copies under `a-round-468/` (A) or `c-round-468/` (C). Make each copy with `git -C <store> archive 9ba13ac | tar -x -C <dir>`, plus an `ln -s <store>/node_modules <dir>/node_modules`.
- In a scratch copy, edit with a script or the editor tools, and save each change as a `*.diff.txt`.

## 0. What B found
**Saba (2026-11-12):** the Store scroll is "not smooth and soft". He named `/free-downloads`.

**Probe:** `b-round-467/probe/store-scroll-probe.cjs`, sha in `store-scroll-probe.sha256` [K15].
- It runs on a production build, served with the mock API, with the LeadMagnet suppressed through localStorage `czaba_lead_magnet` [K5].
- Each pass sends 20 wheel ticks of 120 px, 60 ms apart. There are 3 passes per viewport.
- It records frames over 33.4 ms while the page moves, long animation frames with their scripts, and the eased-scroll values.

**B's bisect:** `b-round-467/probe/bisect-b.md` [K16][K17][K20]. The metric is the median of frames over 33.4 ms on `/`, at 1440 / 1280.

| Build | Median slow frames | Moving frames |
|---|---|---|
| HEAD | 9 / 8 | 165–175 |
| Lenis off | 5 / 4 | 20 (not eased) |
| Header `backdrop-blur-lg` removed | 10 / 8 | |
| Hero's 2 backdrop blurs removed | 10 / 9 | |
| Hero video `autoPlay` removed | 9 / 6 | |
| Floor control: HEAD with all content hidden (`visibility: hidden`), same page height | 0 / 0 | 140 |

- **The cost is painting the visible home content.** The floor control (all content hidden, same page height) shows 0 slow frames and is still eased, so the bound ≤ 2 is reachable in this environment [K17].
- **Lenis is not the cause.** The dev run attributes the long scripts to `useSmoothScroll.ts` `raf` [K18], because Lenis calls `scrollTo` every frame. With Lenis off, the slow frames remain, and their long frames carry no script.
- **Where the slow frames fall** (`slowFrames` `[t, dt, y]` in `scroll-prod-9ba13ac-cpu1.json` [K22]): while scrollY is about **360–850**, and again about **1850–2000**. With Lenis off, the bands are about 360–960 and 2040–2280. Screen the content painted in those bands first.
- **`/free-downloads` is not reproduced.** The screenshot `free-downloads-fullpage.png` shows its 3 free items, on a page 1475 px tall, and has 0 slow frames in every build [K17].
  - Saba's own device stays a Tech Lead row: TLM-R468-SABA-SCROLL-DEVICE, deadline RETRO 480 (L46).
- **The jump to scrollY 0 is not a bug.** It is the keep-list LeadMagnet's scroll lock (exploratory, `probe/superseded/`; lesson L1).

**Why we missed it.**
- **Phase:** the STORE rounds. Their C rows measured LCP and CLS at load, plus contrast. No row measured frame timing while scrolling. The PERF harness covers `/studio-lab` only.
- **Why:** smooth scroll was treated as "on" (Lenis is present), not as a measured behaviour.
- **The rule, merged into L18:** a Store page with smooth scroll gets a wheel-scroll frame row on a production build, with the LeadMagnet stubbed.

**Rulings for the fix (stage 2 inherits them):**
- **R-468-1:** Lenis stays on with its current curve: `duration: 1.2` and the current easing [K3]. A proposal that needs a different scroll feel (`lerp`, `autoRaf` timing, a duration change) is listed as an **option for Saba**, with traces. It is never the chosen fix.
- **R-468-2:** keep-list components (SpecialOffers, LeadMagnet, testimonials/stats) may only be restyled. A proposal that changes how they look is flagged for B and product-designer.
- **R-468-3:** the fix must not touch `app/root.tsx` or `app/styles/**` [K13] unless root grants it. If the cause is there, the proposal names the root request.

## 1. A: steps (no store change)
1. **STOP (L11) if the start state is wrong.** HEAD must be `9ba13ac`, `git status` must be clean, and the protected manifest must be rc 0.
2. **Reproduce HEAD.**
   - Build a scratch copy `a-round-468/head` and serve it with `PORT=3468 npx remix-serve build/server/index.js`.
   - If `curl 127.0.0.1:5199/api/products` is not 200, start `node <loop>/mock-api/server.mjs`.
   - Run `node <loop>/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3468 <abs a-round-468/scroll-head.json> 1`.
   - If either median on `/` is ≤ 2, the environment cannot show the bug: that is a STOP with the logs.
3. **Trace.** Run one Playwright Chrome trace (`browser.startTracing` with the `devtools.timeline` categories) of the same wheel sequence on `/` at 1440×900. In `a-round-468/trace-summary.md`, list the event types (Paint, Layout, RecalculateStyle, UpdateLayerTree, Raster, DecodeImage, script) and their total time inside every frame over 33.4 ms, with the DOM node or URL where the trace names one.
4. **Screen, then bisect.**
   - **Screen cheaply first.** Use `b-round-467/probe/store-scroll-floor-probe.cjs` [K15] on the one served HEAD build, with `HIDE_CSS` set to a `visibility: hidden` (or `backdrop-filter: none`, `filter: none`, `animation: none`) rule for one suspect at a time. This needs no rebuild.
   - **Confirm with a real source change.** Rebuild only to confirm a real source change.
   - **Record every screen and every build** as one row of `a-round-468/bisect.md`, with the same columns as `bisect-b.md`.
   - Start from the trace and the two scrollY bands.
   - The suspects not yet tried include:
     - the `ScrollReveal` wrappers on the home route;
     - `ProductSection` / `ProductCard`, including its `backdrop-blur-sm` overlay and its images;
     - `SpecialOffersSection` and its image;
     - `NewsletterSection` and the footer;
     - large decorative gradients or background layers;
     - the `PageTransition` wrapper;
     - framer-motion animations that start when a section enters view.
   - Do not repeat B's rows.
5. **Confirmed cause:** the smallest scratch change for which all of these hold on the same build:
   - the `/` medians are **≤ 2** at both viewports;
   - moving frames are ≥ 100 and `finalY` is 2400 (the scroll is still eased);
   - `/free-downloads` stays at 0.

   **Write the proposal:**
   - `a-round-468/proposal.diff.txt`: a unified diff with `a/` and `b/` paths. It must pass `patch -p1 --dry-run` on a `9ba13ac` copy. Inside a scratch copy under the loop folder, never use `git apply`: the loop folder is a git repository, and `git apply` skips the paths silently;
   - the list of store files it touches;
   - `a-round-468/proposal-visual/`: before/after screenshots of each changed element at 1440×900 and 1280×720, with one sentence on what looks different;
   - the R-468-1…3 status of the proposal.

   If two causes add up, the proposal holds both.
6. **No single source change reaches ≤ 2.**
   - Report the per-section screen table, the narrowed set and the best partial result.
   - If only hiding content reaches the floor, say so: that is a design question for B and product-designer (stage 2), not an A failure.
   - A "BLOCKED for time" report must name the real stop signal (L59).
7. **Report.** Write `a-round-468.md`: the commands, the trace summary, the bisect table and the proposal. Stop every server you started. Confirm with `git status` that the store tree is unchanged. No code-reviewer is needed (no store change), and there are no tests or doc this round.

## 2. C: what to verify
Write `c-round-468.md`, `c-round-468.json` and `c-round-468/progress.json` as you go. Use scratch copies under `c-round-468/`. HEAD is served on port 3471 and the proposal build on port 3472, never probed at the same time (L38). Start the mock API if port 5199 does not answer.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | REPRO-HEAD (browser, both viewports) | Probe on the HEAD build | Median slow frames on `/` ≥ 5 at either viewport. Otherwise the row is environment-invalid: replace it, at most 2 attempts |
| C2 | CAUSE-CONFIRMED (browser, both viewports) | The loop folder is itself a git repository, so `git apply` inside a scratch copy there skips paths silently. Use `patch -p1 --dry-run -d <dir> < a-round-468/proposal.diff.txt`, then `patch -p1 -d <dir> < …`, and grep that each changed line landed. Apply it to a fresh `9ba13ac` scratch copy, build it, and run the probe | `/` medians ≤ 2 at 1440 and 1280. `finalY` is 2400 and moving frames are ≥ 100 per pass. `/free-downloads` has 0 slow frames, with `finalY` 575 / 755 |
| C3 | GUARD-MUTANT (browser) | In a third scratch copy, apply `b-round-467/probe/lenis-off.diff.txt` on top of the proposal with `patch -p1` (as in C2). Build it and probe `/` at 1440 | Moving frames < 100. This proves the C2 eased-scroll guard can fail |
| C4 | VISUAL (browser, both viewports) | Your own before/after screenshots of every element the proposal touches | Each difference matches A's sentence. Any visible change to a keep-list component is listed for B (R-468-2). This row is **record**: B rules on look changes in round 469 |
| C5 | RULINGS | The proposal against R-468-1…3 | No Lenis curve change is chosen. `root.tsx` and `app/styles/**` are touched only with a named root request |
| C6 | SOURCE-SCOPE | `git status --short --untracked-files=all` in the store; the protected manifest | 0 lines. Protected rc 0 |
| C7 | AUTH + STUDIO SMOKE (browser, 1440 and 1280) | As round 467 C8, on the dev server: a fresh anonymous context and one untimed warm-up (L38). On `/studio-lab`, wait for `Demo collection ready` and add an item with Enter. Open `/studio/middle-east`. Call `GET /api/studio-token?product=middle-east&file=stem.mp3` without auth | `auth_user` is null and the clip count rises. The product route shows "Sign in required" and 0 `audio[src]`. The token API returns 401. The fake-bearer path is BLOCKED (backend unavailable in cloud) |
| C8 | LESSON | `grep -c 'Scroll frames (D-29z1648)' lessons.md` | 1, and `wc -l lessons.md` ≤ 60 |
| C9 | CLAIMS | `bash b-round-467/claims-468.sh` | Matches `b-round-467/claims-468-planning-output.txt` exactly. No `MISSING` |
| gate | — | Root gate | No source change, so nothing is published. Not claimed |

**If A STOPs at step 2:** take the short route. Run C1, C6, C7 and C9, then write FAIL "STOPPED — routed to B" (L22).

**If A reports no single source change (step 6):** C1, C6, C7, C8 and C9 still run. C re-runs A's best screen rows with the floor probe. The round is a FAIL "cause not found" unless A's screen table names the section whose hiding reaches ≤ 2. In that case C writes PARTIAL with that evidence, and B routes the design choice to stage 2.

## 3. Claims (`b-round-467/claims-468.sh`)
| Claim | What it checks |
|---|---|
| K1 | HEAD and status |
| K2 | Gate 467 |
| K3 | Hook facts (`duration: 1.2`, rAF / cAF / `autoRaf` / reduced-motion counts) |
| K4 | The `root.tsx` call line |
| K5 | The LeadMagnet key |
| K6 | The Lenis CSS in `app.css` |
| K7 | The `data-lenis-prevent` sites |
| K8 | The Lenis version |
| K9 | SWEEP over the test roots |
| K10 | The hook's importers |
| K11 | Doc 305 is free (for stage 2) |
| K12 | `regression-last.json` |
| K13 | The forbidden list |
| K14 | Protected rc |
| K15 | The probe sha |
| K16 | The artifacts exist |
| K17 | Medians and values per build |
| K18 | Dev attribution |
| K19 | `l58-check` (no sketch) |
| K20 | The bisect diff files and their single-change content |
| K21 | The loop folder is a git work tree (`git apply` trap) |
| K22 | HEAD slow-frame scrollY values (the two bands) |

## 4. After this round (D-29z1649)
1. **On C PASS:** round 469 = SABA-B-15 stage 2.
   - Its grants are the proposal's files, plus a test and a doc.
   - Its rows: C2's bound as the assert (B re-runs it on the sketch, L58), the guard mutant, and product-designer on any visible change.
   - A visible change to a keep-list component is first asked of Saba.
2. **Next planning dated 2026-11-13 or later:** REGRESSION-2026-11-13. It carries every `scope_additions` entry, including the new `/` scroll row (recorded in `backlog.json` `regression_rounds`).
   - If round 469 is not dispatched yet at that planning, REGRESSION runs first, and SABA-B-15 stage 2 follows it.
3. **Then:** STORE-2c (typography), STORE-2d (motion; owns Lenis reduced-motion), STORE-3, STORE-4, STORE-5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
4. **Root, non-blocking:**
   - ROOT-REQ-DP-GATE-FIRST: the first DP-GATE, with SABA-B-16-LOGO-OLD-COLORS and the critical stance.
   - The next RETRO is round 480.
