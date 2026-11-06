# Round 370: PERF-11a. Lazy signalr and no framer page transition on `/studio*` (root diet, stage 1 of PERF-11), plus RT-FIX for the round-369 retro

**Planned by:** B, at the round 369 → 370 planning, 2026-11-06 (`b-round-369.md`).

**Decisions** (`backlog.json` v334 → v335, `decisions_log_b`):
- **D-29z1218:** round 369 is accepted from C's evidence (`c-round-369.json` PASS, 11 rows, `browserVerified` and `realVerified` true, 0 app bugs).
  - Gate 369 was **skipped (no real changes)**, so nothing was published. The baseline stays `29f4b4d`.
  - C369-L1 (Low, B): B corrected `retros/retro-369.md` §10 and `lessons.md` l.3. C re-checks them in row RT-FIX.
  - C369-L2 (Low, B spec) is closed as wording: a cross-lane move is labelled "Undo: Move to track — <lane>".
- **D-29z1219:** PERF-11 is next. Root answered none of the 18 architecture checkpoint requests, so SYS-R369 is skipped under its own condition. PERF-11 splits into three stages:
  - **11a:** this round;
  - **11b:** lazy Firebase. It needs the protected `auth.ts` [K7] and goes to root/Saba as `b-round-369/root-request-perf11b-firebase-lazy.md` (non-blocking);
  - **11c:** the ArrangementContext leaf-consumer inputs.
- **D-29z1220:** the target is re-based from measurement. "230 KB" is not reachable inside the loop; the reasons are in the root request.
- **D-29z1221:** consult opinions (`tech-lead`, `performance-optimizer`). PERF-CAND-STUDIO-LENIS is recorded as a candidate, not scheduled.
- **D-29z1222:** this task and the order after it (§6).

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28, 30 and 58. C also reads 22, 29, 38, 56, 57, 59 and 60.
- `b-round-369/sketch.patch.txt` (the dispatched sketch) and `b-round-369/sketch-review.md`.
- Primitives:
  - `AGENT_DISCOVERABLE_CODE.md` (new export `RouteTransition`);
  - `FORWARDREF_COMPONENT.md` (a new component; it takes no ref, so plain function);
  - `REACT_CONTEXT.md` (ChatContext);
  - `API_ERROR_HANDLING.md` (a chunk-load failure takes the existing chat error path);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§8).

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a pure performance round: no new control and no new user action.
**Screen budget:** no persistent element is added. The only visible difference is that `/studio*` no longer fades in from opacity 0. C's row PAINT checks that the first paint shows the workspace.

## Baseline
- HEAD is `29f4b4d`, and gate 369 was skipped with that head [K1]. The tree is clean [K2].
- Protected files: all pass their sha check [K10].
- Frozen: every tracked file except the grants below is listed in `b-round-369/r370-frozen-sha256.txt` [K12]. C checks it at the start and the end.
- `regression-last.json` is 2026-11-05 [K20], so REGRESSION is due on or after 2026-11-08, not now.
- **Today, at HEAD:**
  - `app/root.tsx` imports `AnimatePresence` from framer-motion and `PageTransition` [K3]. It wraps every route, `/studio*` included, in `<AnimatePresence mode="wait"><PageTransition key=…>` [K3]. So the server HTML of `/studio-lab` carries inline `opacity:0` on `.page-transition-wrapper`, and the first paint waits for hydration and the fade.
  - `app/contexts/ChatContext.tsx` has a value import `import * as signalR from '@microsoft/signalr'`. It is the only file in `app/` that imports signalr [K4]. `connect()` is reached only from `startSession` (`await connect()`) and from the reconnect timer (`connectRef.current()`) [K9]. Both follow a user action.
  - `app/styles/app.css` targets `.page-transition-wrapper` twice (min-height, and the `:has(.studio-container)` override) [K6]. The class must stay.
  - No test file under `app/`, `e2e/` or `perf/` names ChatProvider, PageTransition, AnimatePresence or `page-transition-wrapper` [K5].
  - The three `res.js.*.encoded-bytes` rows of `perf/budgets.resources.json` are `record` [K8].

## 0. B's pre-check (L30, L37, L58)
| What | Command | Result |
|---|---|---|
| HEAD bytes (C's command) | `npx playwright test --config playwright.perf.config.ts studio-lab-resources` on a production build of HEAD | studio-lab **378,121**, home 264,641, studio-guard 286,109 (`b-round-369/perf-res-head.log`) [K14] |
| Sketch bytes, with the new asserts | same command on the sketch | studio-lab **362,477**, home 250,526, studio-guard 270,648; all PASS (`perf-res-sketch-final.log`; the v1 sketch gave 362,494 in `perf-res-sketch-v1.log`) [K14] |
| Mutant MU-CHAT-STATIC (ChatContext back to HEAD) | same command | the 3 encoded-bytes asserts FAIL: 378,149 / 264,669 / 286,137 (`mutants/mutant-MU-CHAT-STATIC-perf.log`) [K15] |
| Paint (record) | `b-round-369/probe/paint-probe.mjs`, 5 fresh contexts each, median | FCP − DCL: HEAD 358 ms → sketch 6 ms (an earlier pair of builds: 352 → 44, `probe/paint-run1.log`); SSR `opacity:0` on HEAD 5/5, sketch 0/5 (`probe/paint-final.log`) [K17] |
| Unit rows and mutants | `npx vitest run` on the 4 covering files | 23/23 PASS on the sketch (`sketch-covering.log`); the chat file passes under shuffle seeds 1, 7, 42 (`sketch-chat-shuffle.log`). Mutants: MU-CHAT-STATIC → CL1, CL2, CL4 red; MU-CHAT-IMPORT-OUTSIDE-TRY → CL4; MU-CHAT-ALWAYS-CONNECTED → CL3; MU-RT-NO-KEY → RT3; MU-RT-STORE-PLAIN → RT2; MU-RT-STUDIO-MOTION → RT1, RT3, RT4 (`mutants/*.log`) [K16] |
| Sketch review (L58) | `tech-lead`, v1 then a delta review of the frozen sketch | 2 Mediums fixed in the sketch, the Lows ruled; reviewed sha = dispatched sha `338dbe40…` (`sketch-review.md`) |
| Typecheck, Biome | `npx tsc --noEmit`; `npx biome check` on the changed files | rc 0 and rc 0. The Biome output has 5 pre-existing warnings: 3 × `noDangerouslySetInnerHtml` in root.tsx and 2 × `noArrayIndexKey` in ScrollReveal.tsx (`sketch-typecheck.log`, `sketch-biome.log`) |
| Other test roots (L30) | `perf/lib` is not touched; `self-hosted-fonts.test.ts` and `store-focus-ring.test.ts` read `root.tsx` [K22] | both PASS on the sketch (in `sketch-covering.log`) |

**Notes on the measurements:**
- `encodedDataLength` includes response headers. The values were identical over the three runs of each spec [K14].
- The long task near FCP (51–73 ms in 3 of 5 sketch runs) is hydration that now happens before the first paint instead of behind an invisible page. It is **record only**. PERF2-FIRST-FRAME-LONGTASK stays with PERF-11c.

## 1. What A changes (grants: exactly these files)
1. **`app/contexts/ChatContext.tsx`.** Make signalr lazy:
   - `import type { HubConnection } from '@microsoft/signalr'`;
   - inside `connect()`'s existing `try`, after `setConnectionStatus('connecting')`: `const signalR = await import('@microsoft/signalr')`. Store it in a module-level `let loadedSignalR: typeof import('@microsoft/signalr') | null = null`;
   - one module-level `isHubConnected(connection: HubConnection | null): boolean`. It replaces the four `state === signalR.HubConnectionState.Connected` compares.

   Rules: no `any`, no type assertion and no string compare against the enum. A failed import lands in the existing `catch`, which sets `disconnected` and the existing error text. Everything else stays as it is: handlers, reconnect, `startSession`, `disconnect` and the context value.
2. **`app/components/animations/RouteTransition.tsx` (new)** plus one export line in `app/components/animations/index.ts`:
   - `RouteTransition({ pathname, isStudioPage, children })`;
   - studio: `<div key={pathname} className="page-transition-wrapper">{children}</div>`;
   - otherwise: exactly today's `<AnimatePresence mode="wait"><PageTransition key={pathname}>…`.
3. **`app/root.tsx` (narrow grant, D-29z852 precedent):** byte-equal to `b-round-369/sketch-root.tsx.txt`.
   - The two imports (`AnimatePresence`, `PageTransition`) become `import { RouteTransition } from '~/components/animations'`.
   - The block becomes `<RouteTransition pathname={location.pathname} isStudioPage={isStudioPage}><Outlet /></RouteTransition>`.
   - Nothing else changes. `isStudioPage` is the existing `location.pathname.startsWith('/studio')` [K3].
4. **Tests (new files):**
   - `app/components/animations/__tests__/route-transition.test.tsx`, rows RT1–RT4 (§3).
   - `app/contexts/__tests__/chat-lazy-signalr.test.tsx`, rows CL1–CL4 (§3). Each test gets a fresh module graph: `vi.resetModules()` and `vi.doMock('@microsoft/signalr', …)` in `beforeEach`, and ChatContext is imported dynamically (sketch-review TL-2).
5. **`perf/budgets.resources.json`:** three rows only. `res.js.studio-lab.encoded-bytes`, `res.js.home.encoded-bytes` and `res.js.studio-guard.encoded-bytes` become `mode: "assert"` with `{ "op": "<=", "value": 372000 }`, `258000` and `278000`, owner `PERF-11a`, and an appended note. Every other row is unchanged.
6. **`docs/implementation/2026/quarter-IV/237-perf-root-diet-studio.md` (new; 237 is free [K11]):**
   - Georgian, with the TEMPLATE headings (L26);
   - l.4 exactly `Completed (C round 370 PASS)` (L28);
   - it records the measurements of §0, the 11b/11c split, and that 230 KB is not reachable inside the loop.

**Ruling lines (L4):**
- `.page-transition-wrapper` on `/studio*`: the class stays (app.css [K6]) and wins over "remove the transition wrapper"; only the motion goes.
- `/studio/$productId` (protected route): the route file does not change. The root change applies to it as well, and that is intended (the same full-screen Studio rule).

**Behaviour that must not change (neighbour risk):**
- The store pages keep their fade (RT2; C row FADE).
- Navigating from the store to the Studio loses the store page's exit fade. This is accepted: it is the smallest honest behaviour for "no framer transition on `/studio*`", because the studio branch is outside `AnimatePresence`.
- Navigating from the Studio to the store plays the store's enter fade, as on a cold load.
- Chat (`/support`, ChatWidget) works the same after the first `startSession`; the backend is unavailable in the cloud (CL rows cover it in jsdom).

## 2. A: checks (speed rules)
- Run `npm run typecheck`, `npm run lint`, and `npx vitest run` on the covering files:
  - `app/components/animations/__tests__/route-transition.test.tsx`;
  - `app/contexts/__tests__/chat-lazy-signalr.test.tsx`;
  - `app/lib/__tests__/self-hosted-fonts.test.ts`;
  - `app/lib/__tests__/store-focus-ring.test.ts`.
- Run the perf spec `npx playwright test --config playwright.perf.config.ts studio-lab-resources` **alone** (L38). The three asserts must PASS. Report the three values.
- Ask the code-reviewer once (8 files change), and send any later edit back to it (L11).
- A STOP is the L11 form: a red covering file, an assert that fails, or a sketch line that does not fit.

## 3. C: what to verify
C writes `c-round-370.md` and `c-round-370.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` for every finding;
- `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (= `b-round-369/mutants/`), `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-370.json c-round-370/l57-check.txt` must exit 0. Write `c-round-370/progress.json` after every row (L59).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all` lists only the §1 files (4 changed, 4 new). `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-369/r370-frozen-sha256.txt` from `store/` gives rc 0. The protected sha check gives rc 0 | Nothing outside the grants changed |
| **CLAIMS** | Run `bash b-round-369/claims-370.sh` from the loop root first (L56). Compare with `b-round-369/claims-370-output.txt` | On A's tree, K3, K4, K5 and K8 may differ only as `b-round-369/claims-370-sketch-output.txt` shows (the same script on the sketch, `STORE=/home/runner/b369-sketch`), and K2 shows `29f4b4d` with 8 status lines (the 4 changed and the 4 new files of §1). K11 reads `K11 doc 237 free: 1 last: 237-perf-root-diet-studio.md`, because A creates that file (§1 item 6; the sketch has no doc). Every other line is equal (K12 stays at 0 failing lines) and there is no `MISSING` |
| **ROOT-NARROW** | `diff app/root.tsx ../tmp/studio-real-loop/b-round-369/sketch-root.tsx.txt` | No output |
| **CHAT-SHAPE** | Read the ChatContext diff | Type-only import, `await import` inside the `try`, one `isHubConnected`, no `any`, no `as`, no string compare to `'Connected'`, nothing else changed |
| **UNIT** | Run the 4 covering files, and the chat file again with `--sequence.shuffle --sequence.seed=42` | All pass. RT1–RT4 and CL1–CL4 exist as §4 states |
| **MUTANTS-TREE** | On a copy of A's tree under `c-round-370/`: (a) ChatContext back to HEAD; (b) the `key` removed from the studio div; (c) the studio branch returns the motion branch; (d) the `await import` moved before the `try` | (a) CL1, CL2 and CL4 red; (b) RT3 red; (c) RT1 red; (d) CL4 red. Record as `mutantRedOnTree` |
| **PERF-BYTES** | The perf spec `studio-lab-resources`, run **alone** (L38) | The three encoded-bytes asserts PASS. Record the values (B's sketch: 362,477 / 250,526 / 270,648). A studio-lab value more than 1,000 B away from 362,477 is recorded with its cause |
| **NO-SIGNALR (browser)** | Fresh context at 1440×900 and 1280×720, on the production server of the perf run or on `:5173`. List the Script responses of `/studio-lab` and `/` | No loaded script contains the signalr library string `Server timeout elapsed without receiving a message from the server.` On HEAD's build that string is in the shared root chunk |
| **SSR-OPACITY (browser/HTTP)** | GET `/studio-lab`, `/studio/middle-east` and `/` | `.page-transition-wrapper` has no inline `opacity:0` on the two studio routes and still has it on `/` |
| **PAINT (browser, record)** | Fresh context at both viewports, `/studio-lab`, 3 runs: DCL, FCP, the screenshot at FCP + 100 ms | Record the medians (B's final pair: FCP − DCL 6 ms on the sketch, 358 ms at HEAD). The screenshot shows the workspace, not a blank page. Wallclock values are never a FAIL |
| **FADE (browser)** | On `/`, a store link to `/about`, then back | The store page still fades: the wrapper opacity is < 1 shortly after navigation and reaches 1 |
| **NAV (browser)** | `/` → the nav "Studio" link → `/studio-lab` → `← CZABA` back | Both moves work; the workspace renders; no console error other than the cloud-expected network errors |
| **G370-AUTH (browser)** | A fresh anonymous context at both viewports. Warm up first (L38) | `/studio-lab` shows the workspace and the demo state, and `localStorage.auth_user` is null. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `/api/studio-token` returns 401 with no token (a fake bearer: 403 with the mock, else a fail-closed 500 under `blocked`). No token appears in any body |
| **STUDIO-SMOKE-370 (browser)** | After `Demo collection ready` (L48), at both viewports: <ul><li>add `Bass` with Enter;</li><li>Play: the position is ≥ 00:01.000 after 1.5 s;</li><li>drag the clip by its name bar to the lane below, then Ctrl+Z (a cross-lane move reads "Undo: Move to track — <lane>");</li><li>export a WAV</li></ul> | As stated. The WAV is RIFF/WAVE, 48 kHz, with peak > 0 |
| **CHAT (blocked)** | A real chat connect needs the backend hub | BLOCKED, "backend unavailable in cloud". It is never PASS. CL2–CL4 cover the client path |
| **DOCS** | Doc 237: l.4 byte for byte; the TEMPLATE headings as a subsequence; every test it names exists (L26) | As stated |
| **RT-FIX** | `diff b-round-369/retro-369-before-370.md retros/retro-369.md` and `diff b-round-369/lessons-before-370.md lessons.md` | Only the §10 L58 bullet and `lessons.md` l.3 changed. They name R11-P1e, the three chain ranges and the dropped phrases. `lessons.md` is still 60 lines |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if NO-SIGNALR, SSR-OPACITY, PAINT, FADE, NAV, G370-AUTH and STUDIO-SMOKE-370 ran at both viewports. CHAT is backend-blocked and does not make it false.

## 4. Unit rows (the sketch has all eight; A keeps them, equal or stronger)
| Row | Asserts | Mutant that turns it red |
|---|---|---|
| RT1 | `renderToString` with a studio path: the wrapper class is present, and no `opacity:0` | the studio branch returns the motion branch |
| RT2 | a store path inside `MemoryRouter`: the wrapper class is present, with inline `opacity:0` | the store branch returns the plain div |
| RT3 | studio `/studio/a` → `/studio/b`: the page element is a new node | the `key` removed |
| RT4 | the same studio path re-rendered: the page node is the same | the studio branch returns the motion branch (MU-RT-STUDIO-MOTION) |
| CL1 | every `@microsoft/signalr` import line in the source is `import type`, and `await import('@microsoft/signalr')` is present | the HEAD value import |
| CL2 | mounting the provider loads the mocked module 0 times; `startSession` loads it once, reaches `connected` and invokes `JoinSession` | the HEAD value import (it loads at module load) |
| CL3 | a hub whose state is not `Connected`: `invoke` is never called | `isHubConnected` returns true |
| CL4 | the mocked import throws: `connectionStatus` is `disconnected`, the error is exactly `Failed to connect to chat. Please try again.` (the existing connect-catch text), and `invoke` is not called | the import moved before the `try` (startSession's catch text then wins) |

## 5. Neighbour risk
- **The chat reconnect path** (`onclose` → timer → `connectRef.current()` [K9]) now awaits the import, which is cached after the first load. `performance-optimizer` (opinion) notes that the path already captures a stale `state.session`, so it is not a regression probe.
- **A slow chunk on the first chat open** adds one fetch to the first connect only, inside the existing `connecting` state.
- **A failed chunk load** shows the existing connect error. Some browsers cache a failed dynamic import until reload, so a retry may fail again. This is recorded (sketch-review TL-9); there is no code for it in 11a.
- **Unmount during connect:** a connection built after the provider unmounts is never stopped. This is pre-existing at HEAD around `start()`, and the import widens the window slightly. It is deferred as B-R369-CHAT-UNMOUNT-RACE (Low).
- **Future Studio features** add bytes to the studio-lab route. The 372,000 assert then fails, and B rules a new budget with a measurement. That is the purpose of the row, not a reason to drop it.

## 6. Order after this round (D-29z1222)
1. REGRESSION at the first planning on or after 2026-11-08.
2. PERF-11c.
3. PERF-11b, if root or Saba answers.
4. PERF-12…15, then SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
5. STEM-LANES, then SYS-1…3.
6. STORE-2b…5, then REVIEW-RECOMMENDATIONS and T12-ADVANCED.
7. The phase-2 entries, under the skip rule.

SYS-R369 runs when root answers ARCH-CHECKPOINT-PERF9-STEM-CACHE.

## 7. Root notes
- **For root and Saba:** `b-round-369/root-request-perf11b-firebase-lazy.md`. Lazy Firebase needs a 2-line edit of the protected `app/lib/auth.ts` [K7] (estimated −36 KB on every page). It asks for option (a), (b) or (c).
- The perf-plan's 230 KB target is not reachable inside the loop.
- The open root requests are unchanged:
  - ARCH-CHECKPOINT-PERF9-STEM-CACHE (non-blocking);
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1);
  - ROOT-REQ-B-RETRO-CONSULTS.

## 8. Claims (L29 + L56)
Run `bash b-round-369/claims-370.sh` from the loop root. The expected output at HEAD is `b-round-369/claims-370-output.txt`, and on the sketch it is `b-round-369/claims-370-sketch-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 369 skipped, head `29f4b4d` |
| K2 | HEAD and the status line count |
| K3 | root.tsx: the framer and PageTransition imports, the AnimatePresence block, the `isStudioPage` definition |
| K4 | the ChatContext value import; one file in `app/` imports signalr |
| K5 | 0 test files name ChatProvider, PageTransition, AnimatePresence or `page-transition-wrapper` |
| K6 | the 2 app.css wrapper rules |
| K7 | auth.ts's static firebase import, and auth.ts is protected |
| K8 | the three `res.js` encoded rows are `record` at HEAD |
| K9 | the 2 `connect` call sites |
| K10 | the protected sha check |
| K11 | doc 237 is free, and the last doc number |
| K12 | the frozen list check |
| K13 | `useSmoothScroll` starts a Lenis rAF loop (the candidate) |
| K14 | HEAD and sketch bytes from the perf logs |
| K15 | the mutant perf rows that fail |
| K16 | the mutant unit reds |
| K17 | the paint medians |
| K18 | every cited artifact exists |
| K19 | the lessons line count |
| K20 | the regression-last date |
| K21 | the round-369 archive sha |
| K22 | the 2 covering tests that read root.tsx |
