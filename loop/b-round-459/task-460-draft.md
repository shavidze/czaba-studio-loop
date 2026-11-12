# Round 460: SABA-B-13 fix-up: the Store entrance survives a hydration re-render (C-R459-01)

**Planned by:** B, at the round 459 → 460 planning, 2026-11-12 (`b-round-459.md`).
- **Advisor:** available and consulted after orientation, before the sketch was written. Applied: a delta sketch on the exact tree, browser proof of the fix before pinning, the L58 chain on the new sha, a measured C6 ruling instead of only lowering the floor, C9 skip latency measured from the input event, runnable commands for the C11/C2 halves, and the L7/L10 bookkeeping.
- **Archive:** the round-459 task is saved as `tasks/round-459.md`, a byte-identical copy (`cmp` OK) made before this file was rewritten.
- **Baseline:** gate 459 is `skipped` (C FAIL), and gate 458 is `published` with commit `891dc0f` [K1]. The baseline commit stays `891dc0f`.
  - The store tree holds round 459's uncommitted work [K2, K3]: the v1 patch, with the four code-file hashes of `b-round-458/sketch-files-sha256.txt`, and A's doc 300.
  - That work is **kept, not reverted**. This round applies a delta on top of it.
- **Regression:** not due today (2026-11-12). The last ran 2026-11-10 (round 425), and the next is due on or after 2026-11-13. If round 461 is planned on or after 11-13, it is the REGRESSION round.
- **Next RETRO:** round 465.

## Why this round (L10 ruling on A's STOP)
- **Round 459 failed.** C returned FAIL with `browserVerified` and `realVerified` true. Gate 459 was skipped.
- **The bug:** A stopped on **A-R459-REVIEW-R1** (Medium, origin B spec), and C confirmed it independently as **C-R459-01** (L7: recorded as `confirmedBy` on A's id).
  - A browser extension that inserts a node into `<body>` before hydration makes React 18 client-render the whole document (`hydrateRoot(document)`).
  - That replaces the React-owned cover `<style>`. The v1 handshake lived in that node's attributes, so it was lost: the entrance did not play at all, while HEAD plays it.
- **The STOP is accepted.** It is B's spec gap: neither the v1 sketch nor its two tech-lead reviews considered a document re-render.
  - B re-sketched, proved the fix in Chromium and pinned it again.
  - A applies the delta as written. A hand edit to the three code files is still a STOP (C3 pins their hashes).
- **Not in scope:** SABA-B-13's look, its timings (1450 ms minimum, 1900 ms cap, 1000 ms failsafe), once per tab, the client-navigation behaviour and `root.tsx` are all unchanged.

## What B measured (production builds, real Chromium, mock API)
Servers, all built with `b-round-459/probe/serve-prod.sh`:
- HEAD `891dc0f` on `:5190`;
- the store tree (v1) on `:5191`;
- the sketch (v2c) on `:5192`, with `R=<scratch>`.

**R1 reproduction** on the final sketch (`probe/r1-repro.mjs <base> inject` inserts one `<div>` before hydration, so React #418 fires; `probe/r1/r1-b.txt`) [K7]:

| Server | Entrance plays after the mismatch |
|---|---|
| HEAD `:5190` | 3/3 |
| v1 `:5191` | **0/3** (bug) |
| v2c `:5192` | 3/3 |

The first fix (v2a) also played 3/3 (`probe/r1/r1-b-v2a.txt`), but left a cover gap, described below.

**What breaks in v1:**
- The replaced `<style>` comes back as `media="not all"` with no `data-start`.
- `czaba_entrance_seen` is already set, so React's session fallback refuses.
- No takeover event is sent, so the boot capture listeners stay for the life of the tab.

**v2a still had a gap:** the cover dropped for about 40–80 ms before the overlay mounted (`probe/matrix/v2a-partial/5192-1440-cpu1-inject.json`, samples at 291 and 330 ms). HEAD shows the page for about 137 ms in the same case. v2c keeps the cover on during that gap.

**The full v2c matrix** is in `probe/matrix/summary.txt`, tabulated by `probe/matrix/table.py` [K11–K13]. It covers both viewports and CPU 1 and 4, with `fresh`, `reload`, `rm`, `blockjs`, `delayjs`, `esc50`, `tab50`, `click50`, `clientnav`, `arrive`, `inject` and `delayinject` on v2c, and `fresh`, `reload`, `arrive`, `inject` and `delayinject` on HEAD, plus replicates.

**v2c matrix summary** (`probe/matrix/table.txt`; `reblack.py` for C12/C13):

| Area | Result |
|---|---|
| **First frame** (every tree `fresh`/`inject` row, 1440/1280 × CPU 1/4, with replicates) | `firstPaintedLum` 0 and `firstCovered` ≤ `fp`. HEAD: 13.2–13.5 and `firstCovered` > `fp` |
| **Duration, CPU 1** | removed − `firstCovered`: `fresh` 1503–1517, `clientnav` 1515–1525, `arrive` 1427–1438. Logo/tag ≥ 707/466 (`arrive` 832/583) |
| **Duration, CPU 4** | removed − `dataStart`: `fresh` 1910–1920. Logo/tag: `fresh` 543/341, 656/417, 649/434 (1440) and 698/482 (1280); `clientnav` 559/350, 667/435, 609/355 (1440) and 682/450 (1280) [K11]. B's own replicate (543/341) misses C's old 600/400 floor too, which is why the ruling below makes CPU-4 logo/tag record-only |
| **Inject, tree** | plays (`handshakeState` `live`); `gapsWhileCovered` 0 and 0 re-black samples; removed − `firstCovered`: CPU 1 1588–1631, CPU 4 1894–1924. CPU-4 logo 237–380, because the document re-render costs main-thread time. HEAD inject plays (logo 417–434) [K12] |
| **Delayinject, tree** (bundle +1500 ms, then #418) | ends `expired`, overlay never shown, 0 re-black samples; the cover is gone 1272–1407 ms after `firstCovered`. HEAD plays late (logo 379–435), as in round 459's `delayjs` (no replay after the failsafe, C8 ruling) [K12] |
| **Failsafe** | `blockjs`/`delayjs` removed − `firstCovered` 1269–1406 |
| **Skip, removed − input** [K13] | CPU 1: Esc 8/110, Tab 13/4, click 25/87/101/74. CPU 4: Esc 2/9, Tab 10/46, click 117/128. All `skipped`, or `live` for one click that landed after the hand-off. `tab50` focus is `A` |
| **Reload and reduced motion** | no black sample, state null |


## What changes (user-visible)
- **Hydration mismatch** (a browser extension, or any #418):
  - The entrance still plays, as on HEAD.
  - The black cover stays on until the animated overlay takes over, with no homepage frame in between.
  - If the bundle arrives after the 1000 ms failsafe, a re-render does **not** re-blacken the visible page.
- **Boot skip listeners** (Esc, Tab, click before hydration) remove themselves 1250 ms after the cover started, even if the page never takes over (A-R459-REVIEW-R2).
- **Everything else is as round 459 specified:**
  - fresh tab: black first frame, entrance ≥ 1450 ms, ≤ 1900 ms cap;
  - reload, reduced motion: no cover;
  - CSS failsafe;
  - skip before hydration;
  - client navigation: plays once per tab.
- **Nothing persistent is added.** The screen budget (L39) does not apply.

## Reference
- **Splash-screen reference:** unchanged from round 459. It is the Android 12+ SplashScreen (`https://developer.android.com/develop/ui/views/launch/splash-screen`, read 2026-11-12): an opaque window from launch, skippable, an exit tied to the animation start, and no incomplete interface shown. Deviation: the 1450 ms minimum (Saba decision 2026-11-11). Full table: `tasks/round-459.md` § Reference.
- **React reference for the fix** (official docs, `https://react.dev/reference/react-dom/client/hydrateRoot`, section "Handling different client and server content" / hydration errors):
  - React treats a hydration mismatch as an error and falls back to client rendering.
  - So no state that must survive may live only on React-owned DOM nodes. B's browser repro confirms the replacement for this tree [K7].
- **`product-designer`:** not re-consulted. The fix adds no UI and keeps round 459's chosen behaviour (`b-round-458/pd-consult.md`). The background-tab case (A-R459-REVIEW-R5) is a product question, recorded for Saba as **SABA-Q-ENTRANCE-BACKGROUND-TAB**, default keep (`user-review/questions-saba-b-13.md`).
- **No Ableton reference:** this is the Store.

## Why we missed it
- **Which phase should have caught it:** B's sketch and its review (`b-round-458/sketch-review.md`, two `tech-lead` passes).
- **Why it was missed:** the scenarios list covered first paint, failsafe, late hydration and skip, but not a document re-render after a hydration error. React 18 does this for `hydrateRoot(document)`.
- **Rule:** recorded as retro input **RETRO465-B-PREHYDRATION-HANDSHAKE**. Any pre-hydration DOM handshake keeps its state outside React-owned nodes, and carries a browser row with an injected-node mismatch, and one with slow JS plus a mismatch. `lessons.md` is not edited this round, because it is at 60 lines and RETRO 465 owns the merge.

## Rulings
- **Handshake location (A's Architecture note):** the handshake stays in the granted files. The typed global is `declare global { interface Window { __czabaEntrance?: EntranceHandshake } }` in `EntranceCover.tsx`.
  - There is no new module and no new grant. `tech-lead` found this fine within the grant.
  - Extracting `app/lib/entrance-handshake.ts` is recorded as architecture signal SIG-R459-ENTRANCE-HANDSHAKE, not scheduled.
- **Render-time read of `window.__czabaEntrance` in `EntranceCoverHead`** (`media={isEntrancePending() ? 'all' : 'not all'}`, time-bounded by `ENTRANCE_FAILSAFE_MS`): accepted.
  - The server still renders `media="not all"` (E1).
  - During normal hydration, React does not patch attributes, and `suppressHydrationWarning` is set.
  - The state never returns to `pending`, so React can never write `'all'` over an imperative `'not all'`. `tech-lead` reviews 1 and 2 agree.
- **C-R459-02 (C6 logo/tag floors at CPU 4, Low, origin B spec):**
  - At 4× CPU, hydration lands later, so the takeover happens later. The 1900 ms cap (D-29z1625) then compresses the logo phase.
  - Saba's request is a **minimum total**. It holds at both CPU rates.
  - **Ruling:** the CPU 1 floors stay binding: logo ≥ 600 ms and tag ≥ 400 ms on `fresh`, `clientnav` and `arrive`.
  - At CPU 4, the total-duration rows bind. Logo and tag are recorded, with only a `> 0` sanity row.
  - C round 459's 482/250 `clientnav` sample was one of three; the others were 675/455 and 687/467. B's CPU-4 replicates are in [K11].
  - The cap is not changed. A longer cap would lengthen the wait on slow devices, and that would need Saba.
- **C-R459-03 (C9 click latency, Low, origin environment):** the old measure started at `firstCovered` and included Playwright's `boundingBox()` round trip. C9 now measures **removed − input**, where the input is the first trusted click or keydown `timeStamp`, recorded by the probe in a capture listener (`removedMinusInput`). The removed − `firstCovered` value is recorded only.
- **C11, SSR half:** this is L1 in the covering run, whose console spy asserts that `renderToString(<SpotlightLoader />)` logs nothing. Add `grep -c useLayoutEffect` = 0 on both loading files [K5], with M16 red. The hydration half stays a browser row on the dev server.
- **Doc 300, l.4:** becomes exactly `**სტატუსი:** Completed (C round 460 PASS)` (L28). Round 459's l.4 named round 459 [K8].

## 1. Changes
A applies `b-round-459/sketch-460-delta.patch.txt`:
- sha256 `2c99e2b6d1977dee0020e8fd54cb33af39515f996d8a2e76509f3c03c3de031b`;
- `tech-lead` review 1 REQUEST CHANGES on v2b, review 2 **APPROVE** on this sha (`b-round-459/sketch-review.md`) [K4];
- the result equals `b-round-459/sketch-460-files-sha256.txt`. `root.tsx` keeps its v1 hash.

**`app/components/loading/EntranceCover.tsx`:**
- New: `EntranceHandshakeState`, `EntranceHandshake` and the `Window.__czabaEntrance` global.
- The boot script stores `{start, state: 'pending'}` on `window`.
- The skip handler looks the cover node up at call time, and writes `skipped` to the window state and the current node.
- The boot listeners self-remove after `FAILSAFE + EXIT` (1250 ms).
- New `isEntrancePending()`, used for the `media` prop.

**`app/components/loading/SpotlightLoader.tsx`:**
- `claimEntranceStart()` reads the window handshake:
  - `pending` and under the failsafe → its `start`;
  - otherwise → `expired` plus the takeover event.
- A live cover node with no handshake is retired, as v1's E13.
- Otherwise the code falls back to HEAD's session claim.
- New `syncEntranceCover()` mirrors the state to the current node, for the probes.
- The hand-off reads the window state.

**`app/lib/__tests__/store-entrance-loader.test.tsx`:**
- The window global is reset in both describes.
- Helpers `reinsertCoverHeadHtml`, `watchOverlayMounts` and `trackBootCaptureListeners`.
- E8 and E16 assert that the overlay never mounts.
- New E15–E19:

| Test | What it checks |
|---|---|
| E15 | A replaced style still plays, keeps the cover on until the takeover, and frees the listeners |
| E16 | A skip after the replacement |
| E17 | Expired frees the listeners |
| E18 | Listener self-timeout |
| E19 | No re-blackening after the failsafe |

All 41 entrance tests are green on the sketch; the covering set is 11 files / 206 tests [K14].

**`docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md`** (A updates it, in Georgian):
- l.3 stays `**თარიღი:** 2026-11-12`.
- l.4 becomes exactly `**სტატუსი:** Completed (C round 460 PASS)`.
- The word `pending` appears nowhere (L28, checked case-insensitively), not even as the code state name. Describe that state as „მოლოდინის მდგომარეობა“.
- Add:
  - the R1 scenario (React #418 → document client render);
  - the window handshake and the time-bounded `media`;
  - the boot listener self-timeout;
  - the E15–E19 ids;
  - TL-R460-1..3;
  - the C6 and C9 rulings;
  - SABA-Q-ENTRANCE-BACKGROUND-TAB;
  - the "Why we missed it" line.
- Keep the round-459 content that is still true. TEMPLATE headings stay in order.

**Grants:** exactly `b-round-458/grants-459.txt` (5 paths). `app/root.tsx` must stay byte-identical to v1 (its hash is in `sketch-460-files-sha256.txt`). No other file. `app/styles/**`, `app/components/animations/**` and every auth-protected file stay unchanged.

## 2. A: steps
1. **Read first:**
   - `lessons.md`, the A part;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `SECURITY_AUDIT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
2. **Claims before:** from the loop root, `bash b-round-459/claims-460.sh > a-round-460/claims-before.txt 2> a-round-460/claims-before.err`. It must equal `b-round-459/claims-460-planning-output.txt`, and stderr must be empty. On a mismatch other than a root-only HEAD drift (L29), STOP.
3. **Apply,** with no hand edits:
   - `sha256sum -c b-round-459/sketch-460.sha256` from the loop root: 2 OK;
   - in the store, `git apply <loop>/b-round-459/sketch-460-delta.patch.txt`;
   - from the store root, `sha256sum -c <loop>/b-round-459/sketch-460-files-sha256.txt`: 4 OK.
4. **Update doc 300** as in §1.
5. **Checks for the changed code** (speed rules):
   - `npm run typecheck`: rc 0.
   - `npm run lint`: rc 0, with 207 warnings, the same as round 459 [K14].
   - `npx biome check` on the 4 code files: only 5 `noDangerouslySetInnerHtml` + 1 `noArrayIndexKey` [K15]; no format diff.
   - `npx vitest run $(cat <loop>/b-round-459/covering-460.txt)`: 11 files / 206 tests green [K14].
   - **Mutants:**
     - Make a scratch with `git clone --shared` at `891dc0f`, then `git apply <loop>/b-round-459/sketch-460-full.patch.txt`, and symlink `node_modules`.
     - Run `python3 -I <loop>/b-round-459/mutants.py <scratch> <abs a-round-460/mutants/mutants.txt>`.
     - The output must equal `b-round-459/mutants/mutants.txt` (28 lines: BASE green, M1–M27 RED) [K6].
   - **code-reviewer:** run it (4 changed paths this round). Pass its Architecture note to B.
6. **Browser (A's own check):**
   - `bash <loop>/b-round-459/probe/serve-prod.sh start /tmp/a460-prod 5191 TREE`.
   - `node <loop>/b-round-459/probe/r1-repro.mjs http://127.0.0.1:5191 inject`: `overlaySeen` true.
   - `node <loop>/b-round-459/probe/frames.mjs http://127.0.0.1:5191 1440 900 1 fresh a-round-460/fresh-1440.json`: `firstPaintedLum` ≤ 3.
   - Stop the server afterwards.
7. **Claims after:** run `claims-460.sh` again. Its output must equal `b-round-459/claims-460-expected-after-A.txt`, and stderr must be empty.
8. **Scope:** `git status --short --untracked-files=all` shows only the 5 grants.
9. **Report:** write `a-round-460.md`.

## 3. C: acceptance rows
**Setup:**
- Real Chromium (Playwright). Copy `b-round-459/probe/*` into `c-round-460/` first (L60).
- **Servers,** production builds only for timing rows:
  - HEAD: `bash c-round-460/serve-prod.sh start <abs c-round-460>/head 5190 891dc0f`;
  - tree: `… start <abs c-round-460>/tree 5191 TREE`.
- **Mock API:** check it on `:5199`. If it is down, start it from the real path: `setsid nohup node $(realpath <loop>)/mock-api/server.mjs &`. A plain symlinked path silently does nothing (a-round-459.md).
- Warm each server once (L38).
- Run probes one at a time, never during vitest or a build.
- **Matrix:** run `frames.mjs` in the same modes as `b-round-459/probe/matrix/run-matrix.sh`, with ports 5190 (HEAD) and 5191 (tree). Write `c-round-460/matrix/summary.txt` and tabulate it with `table.py`.

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all`; `git diff --numstat 891dc0f -- app/root.tsx` | Only the 5 grant paths. `root.tsx` is `2 0`, with the 2 ruled lines. Protected, `app/styles/**` and `app/components/animations/**` files are unchanged |
| C2 CLAIMS | `claims-460.sh` on the tree; then run L29's grep from the loop root: `grep -nE 'l\.[0-9]+\|(app\|perf\|docs)/[^ `]+\|data-testid\|aria-[a-z-]+' current-task.md` | The tree equals `claims-460-expected-after-A.txt`, and stderr is empty. Every grep hit that states a fact about a `store/` file carries a `[K#]` tag, or is a grant path, a command argument or a loop artifact. List the hits in `c-round-460/l29.txt` |
| C3 APPLY | `sha256sum -c b-round-459/sketch-460-files-sha256.txt` in the store | 4 OK |
| C4 COVERING + MUTANTS | `npx vitest run $(cat b-round-459/covering-460.txt)`; `mutants.py` on a C scratch (clone at `891dc0f` + `sketch-460-full.patch.txt`, absolute OUT) | 11 files / 206 tests green [K14]. `mutants.txt` equals `b-round-459/mutants/mutants.txt` (28 lines) |
| C5 FIRST FRAME | `fresh` on HEAD and tree, both viewports, CPU 1 and 4 | **Tree:** `firstPaintedLum` ≤ 3, `firstCovered` ≤ `fp`, `gapsWhileCovered` 0. **HEAD:** `firstPaintedLum` ≥ 6 and `firstCovered` > `fp` |
| C6 DURATION (ruled, C-R459-02) | Tree `fresh`, `clientnav`, `arrive`; 3 runs per 1440 CPU-4 `fresh` and `clientnav` cell | **CPU 1** (state `live`): removed − `firstCovered` within [1400, 1700]; `logoFullMs` ≥ 600 and `tagFullMs` ≥ 400 on `fresh`, `clientnav` and `arrive`. **CPU 4 `fresh`:** removed − `dataStart` ≤ 2000 and removed − `firstCovered` ≥ 1400. **CPU 4 logo/tag:** record only, each > 0. **HEAD control (CPU 1 `fresh`):** `tagFullMs` < 200 |
| C7 NO COVER | Tree `reload` and `rm`, both viewports, CPU 1 and 4 | `anyBlackSample` false, `blackFrames` 0, `finalState` null |
| C8 FAILSAFE | Tree `blockjs`, `delayjs` | removed − `firstCovered` within [1200, 1500]; the last sample has cover 0; `delayjs` `finalState` `expired` and `logoFullMs` 0 |
| C9 SKIP (ruled, C-R459-03) | Tree `esc50`, `tab50`, `click50`, both viewports, CPU 1 and 4; 3 runs for 1440 CPU-1 `click50` | `logoFullMs` 0. `finalState` `skipped`, or `live` for a click that landed after the hand-off. **`removedMinusInput` ≤ 200 at CPU 1 and ≤ 400 at CPU 4** (B's max 110 / 128 [K13]; the bound allows main-thread work queued before the input handler). `tab50`: `finalFocus` `A`. `click50`: `url` `/`. Removed − `firstCovered` is recorded only |
| C10 ARRIVE PARITY | `arrive` on HEAD and tree | Both play (`logoFullMs` > 0). Tree: removed − `firstCovered` ≥ 1300 and `finalState` null |
| C11 HYDRATION + SSR | Hydration half: `console.mjs http://127.0.0.1:5173 fresh` ×3 and `… reload` ×3 on the dev server (warm it twice first). SSR half: L1 in C4's covering run + `grep -c useLayoutEffect app/components/loading/SpotlightLoader.tsx app/components/loading/EntranceCover.tsx` | `hydration` 0 in every run. L1 green. Both greps 0. M16 RED in C4. A cold-start run with Vite "optimized dependencies changed" is environment-invalid; keep it and replace it |
| **C12 R1 RE-RENDER (the bug)** | `r1-repro.mjs <base> inject` ×3 on HEAD and on the tree; then `frames.mjs` `inject` on the tree, both viewports, CPU 1 and 4; `python3 -I reblack.py <matrix dir> inject` | **r1:** tree `overlaySeen` true 3/3, HEAD 3/3, tree `curState` `live`. **frames inject (tree):** `overlaySeen` true, `firstPaintedLum` ≤ 3, `gapsWhileCovered` 0, `reblack` 0, `handshakeState` `live`. CPU 1: removed − `firstCovered` within [1400, 1700] and logo ≥ 600. CPU 4: record only (logo > 0) |
| **C13 SLOW JS + RE-RENDER (TL-R460-2)** | `frames.mjs` `delayinject` on the tree and HEAD, both viewports, CPU 1 and 4; `reblack.py <matrix dir> delayinject` | **Tree:** `handshakeState` `expired`, `logoFullMs` 0, `overlaySeen` false; uncovered − `firstCovered` ≤ 1500; `reblack` 0 (no re-blackening). HEAD: record only |
| C14 COLOUR + LAYER | Tree `fresh`, 1440: `getComputedStyle(document.body,'::before')` while covered | `rgb(0, 0, 0)`, z-index `60`, `fixed` |
| C15 STUDIO + PURCHASE PROTECTION | `node <copy of b-round-453/probe/c12-run/c12-from-c448.cjs> <base> <tag>` on the dev server | At 1440 and 1280: `/studio-lab` has 1 clip, goes to Playing and then Stopped, `stopHeld` true; anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0 |
| C16 DOCS | doc 300 | l.3/l.4 exact (l.4 `Completed (C round 460 PASS)`); TEMPLATE headings in order; 0 `pending` (`grep -ci pending` = 0); E1–E19 cited and present in the test file; the R1 scenario, TL-R460-1..3, the C6/C9 rulings and SABA-Q-ENTRANCE-BACKGROUND-TAB are present |
| C17 L57 | `python3 -I tools/l57-check.py c-round-460.json c-round-460/l57-check.txt` | rc 0 |

**Notes for C:**
- **Gate rows** (full vitest, typecheck, build, Biome, verify) are marked `gate`.
- **Not testable in the cloud:** Firefox and Safari, row TLM-R459-FIREFOX-SAFARI-ENTRANCE (deadline RETRO 465).
- **Saba checks in a fresh tab.** If he sees no entrance, the note suggests a window with no extensions (`user-review/questions-saba-b-13.md`).
- **`c-round-460.json`:**
  - Write all L57 fields, and give every finding an `origin`.
  - `mutantRedOnSketch` = `b-round-459/mutants/mutants.txt`.
  - `affectedChecksRunOnSketch` = `b-round-459/precheck-covering.log` and `b-round-459/probe/matrix/summary.txt`.
- **TL-R460-2 and the release:** the review asks for `delayinject` rows that pass before release. That is C13.

**Neighbours that could break:**
- **e2e `goto('/')` specs** wait up to about 0.3 s longer behind the entrance. Unchanged from round 459; not run.
- **StrictMode:** `app/entry.client.tsx` has no `StrictMode` wrapper [K16]; the claim path is idempotent anyway (`tech-lead`).
- **LeadMagnet, toasts and the cookie banner:** unchanged.
- **Studio and purchase protection:** C15.

## 4. Claims
Run from the loop root: `bash b-round-459/claims-460.sh`.
- Planning output: `b-round-459/claims-460-planning-output.txt`.
- After-A expectation: `b-round-459/claims-460-expected-after-A.txt`, generated by B on a scratch (`891dc0f` + v1 + the delta + doc 300 with the new l.4). It differs from the planning output only in K3 (`v1=1 v2c=4`), K5 (`12 3 2`) and K8 (`0 1`).
- Both stderr files are empty.

| Tag | Claim |
|---|---|
| K1 | gate 458 published `891dc0f`; gate 459 skipped (C FAIL) |
| K2 | store HEAD and dirty count (5: the round-459 work) |
| K3 | the tree's code files: v1 hashes 4 OK and v2c hashes 1 OK (`root.tsx` only) at planning; after A, v1 1 OK (`root.tsx`) and v2c 4 OK |
| K4 | both patch shas OK; the review names the delta sha |
| K5 | `handshake`/`__czabaEntrance` count in SpotlightLoader, `__czabaEntrance` count and `isEntrancePending` count in EntranceCover (0/0/0 at planning) |
| K6 | mutants: 28 lines, 27 RED, BASE green |
| K7 | r1 inject: `overlaySeen` true per port (`5190:3/3 5191:0/3 5192:3/3`) |
| K8 | doc 300 l.4 round 459 count / "C round 460 PASS" count |
| K9 | L58 check on this task |
| K10 | the cited `b-round-459/` files exist |
| K11 | v2c `fresh`/`clientnav` rows: remFC, remStart, logo, tag, state |
| K12 | `inject`/`delayinject` rows on both servers: remFC, gaps, logo, state |
| K13 | v2c skip rows: `removedMinusInput` |
| K14 | covering test counts, tsc rc, lint warnings on the sketch |
| K15 | Biome diagnostics on the 4 sketch files |
| K16 | `StrictMode` count in `app/entry.client.tsx` (0) |

## 5. After this round
- **REGRESSION-2026-11-13:** when round 461 is planned on or after 11-13.
- **Then the remaining STORE-REDESIGN order:**
  1. STORE-2b-3c-2b;
  2. STORE-2b-3d;
  3. STORE-2b-4;
  4. STORE-2c…5.
- **After STORE-2b:** the root DP-GATE.
- **Then** ARCH-SPLIT, REVIEW-RECOMMENDATIONS (SABA-B-12 stage 4, STUDIO-VIS-5) and T12-ADVANCED, then phase 2 under the skip rule.
- **RETRO** at round 465.
