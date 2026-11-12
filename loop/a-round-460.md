# A round 460: SABA-B-13 fix-up (C-R459-01). Hand-over to C

**Status:** implemented as specified. No STOP. The code is B's pinned delta, applied byte for byte with no hand edits. A's own edits are only in doc 300.

**Why the reviewer's Medium (A-R460-REVIEW-1) is not an L11 STOP:**
- It is a test-quality gap, not a regression: no test fails, and every covering test is green.
- The test file is hash-pinned.
- The task already assigns both React assumptions it names to the browser rows C11, C12 and C13.
- A's own production runs show each assumption once in Chromium:
  - (a) `r1 inject`: `styleReplaced` true, the overlay plays, `curState` `live`;
  - (b) the clean-hydration `fresh` run: `styleReplaced` false, `hydrationErrors` 0, `firstCovered` 69 ≤ `fp` 212 and `gapsWhileCovered` 0, so the boot script's `'all'` survived a clean hydration.

**Doc checks:** doc 300 contains 0 descriptive mutant names (`grep -F` of the name column of `mutants.txt`), only the ids `M1–M27`. The mermaid block was edited but not rendered.

## Changed files (the 5 grants; `git status --short --untracked-files=all`)
- `app/components/loading/EntranceCover.tsx` (untracked, new since round 459; v2c hash OK)
- `app/components/loading/SpotlightLoader.tsx` (v2c hash OK)
- `app/lib/__tests__/store-entrance-loader.test.tsx` (v2c hash OK)
- `app/root.tsx`: byte-identical to v1 (hash OK); `git diff --numstat 891dc0f` = `2 0`
- `docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md` (A's update)

No other path changed. Protected files, `app/styles/**` and `app/components/animations/**` were not touched.

## Steps actually run
| Step | Result | Evidence |
|---|---|---|
| 1 Read | the A part of lessons.md; the primitives AGENT_DISCOVERABLE_CODE, TAILWIND_FIRST, SECURITY_AUDIT, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS | — |
| 2 Claims before | identical to `claims-460-planning-output.txt`; stderr 0 bytes | `a-round-460/claims-before.txt` |
| 3 Apply | `sketch-460.sha256`: 2 OK. `git apply` of the delta: clean. `sketch-460-files-sha256.txt`: 4 OK | — |
| 4 Doc 300 | l.3 `**თარიღი:** 2026-11-12`, l.4 `**სტატუსი:** Completed (C round 460 PASS)`. `grep -ci pending` = 0, `isEntrancePending` = 0. TEMPLATE headings in order. Added: the R1 scenario, the window handshake, `media` computed at render time, the listener self-timeout, E15–E19, TL-R460-1..3, the C6/C9 rulings, SABA-Q-ENTRANCE-BACKGROUND-TAB, the round-460 "Why we missed it" paragraph and SIG-R459. Each of E1–E19 exists in the test file (grep) | the doc |
| 5 typecheck | rc 0 | `a-round-460/typecheck.log` |
| 5 lint | rc 0, 207 warnings (same as round 459) | `a-round-460/lint.log` |
| 5 Biome, the 4 code files | rc 0, 6 warnings: 5 `noDangerouslySetInnerHtml` + 1 `noArrayIndexKey`; no format diff. Base `891dc0f` (root.tsx + SpotlightLoader) has 3 + 1, so 2 are new, matching the doc's 205 → 207 | `a-round-460/biome.log` |
| 5 Covering tests | 11 files / 206 tests passed, 3.6 s total (no slow test) | `a-round-460/covering.log` |
| 5 Mutants | scratch: `git clone --shared` at `891dc0f` + `sketch-460-full.patch.txt` (its 4 code files hash OK). `mutants.txt` is 28 lines and **identical** to `b-round-459/mutants/mutants.txt` (BASE green, M1–M27 RED) | `a-round-460/mutants/` |
| 5 code-reviewer | the actual subagent ran: 8/10, no Critical or High findings; the findings are below | this file |
| 6 Browser, production build of the tree on :5191 (mock API on :5199, started from the real path) | `r1-repro.mjs inject`: `overlaySeen` true, `styleReplaced` true, 2× React #418 logged, `curState` `live`, `curMedia` `not all`. `frames.mjs` 1440×900 CPU 1 `fresh`: `firstPaintedLum` 0, `firstCovered` 69 ≤ `fp` 212, `gapsWhileCovered` 0, logo 704, tag 467, `finalState` `live`, `hydrationErrors` 0. Server stopped afterwards | `a-round-460/r1-inject.txt`, `a-round-460/fresh-1440.json` |
| 7 Claims after | identical to `claims-460-expected-after-A.txt`; stderr 0 bytes. Re-run after the last doc edit: still identical | `a-round-460/claims-after.txt` |
| 8 Scope | only the 5 grants | — |

The browser checks cover one inject run and one fresh run (1440, CPU 1). These are A's own spot checks. They are not the C matrix.

## Code-reviewer findings (all go to B; A cannot fix the code ones, because a hand edit to a code file is a STOP under C3)
- **A-R460-REVIEW-1 (Medium, test quality, a release gate and not a code defect):** E15–E19 fake the re-render with `renderToString` and `head.innerHTML`. No test runs a real `hydrateRoot`. Two React assumptions are therefore unit-untested:
  - (a) after a mismatch, the rebuilt `<style>` takes the `media` computed at render time;
  - (b) a clean hydration leaves the boot script's `media='all'` in place.

  Only C11 (dev hydration 0), C12 and C13 in a real browser cover them. A's r1 run shows (a) once in Chromium.
- **A-R460-REVIEW-2 (Low, unverified):** after a document re-render, `<body>` is new, so the `body::before` failsafe animation probably restarts. If nothing takes over at `/` (for example the root ErrorBoundary renders), the cover could last about the re-render time + 1250 ms, and the boot skip listeners are already gone by then. C13's `delayinject` row (`reblack` 0) partly probes this.
- **A-R460-REVIEW-3 (Low, unverified):** `var(--color-black)` has no fallback. If the stylesheets re-inserted after a re-render load late, the re-created cover could be briefly transparent. A fallback colour conflicts with the no-hardcoded-colours rule, so B must decide.
- **A-R460-REVIEW-4 (Low):** a skip landing between `claimEntranceStart` and the hand-off effect (the E14 case) can commit the overlay for one frame after the cover is off: a possible one-frame black flash. E14 has no `watchOverlayMounts` assertion.
- **A-R460-REVIEW-5 (Low, verified by A):** the boot script still writes `data-start`, and E2 asserts it, but only the probes read it now.
  - The pinned code comment `SpotlightLoader.tsx:32` still says the time is counted from `data-start` (A confirmed it with grep and left it unchanged, because the file is pinned).
  - A fixed the matching doc wording (doc l.20, the l.44 mermaid line and l.75). The doc now says that the code no longer reads `data-start` and that only the probes and E2 use it. A checked this with grep: the code has no `dataset.start` or `getAttribute` reader.
- **A-R460-REVIEW-6 (Low):** E9 can false-pass, because a lingering boot listener would just rewrite `live`. `trackBootCaptureListeners` spies only on `document`, so the removal of the window takeover listener is not asserted.
- **A-R460-REVIEW-7 (Low):** the server branch of `isEntrancePending` (`typeof window === 'undefined'`) is not exercised directly. E1 passes because `beforeEach` clears the global.
- **Also noted:**
  - A takeover or re-render between 1000 and 1250 ms cuts the 250 ms fade short (cosmetic).
  - With no takeover, the state stays at its initial value forever. This is safe only because both readers check the time.
- **Architecture note (for B/root, not a refactor in this round):** the single `{start, state}` contract is spread across the string boot script, the read at render time and the claim/retire code in SpotlightLoader. **Keep** while there is a single consumer. If a second consumer appears, extract `claimEntranceStart`, `retireEntrance` and `syncEntranceCover` with the type into `app/lib/entrance-handshake.ts` (SIG-R459-ENTRANCE-HANDSHAKE).
- The reviewer reported no shell, so it reviewed the current files rather than `git diff`.

## Known gaps
- **C matrix not run by A:** C5–C13 (both viewports, CPU 4, `delayinject`, skip latency), C11's dev-server hydration half and C15.
- **Not testable here:** Firefox and Safari (TLM-R459-FIREFOX-SAFARI-ENTRANCE).
- **Gate rows (speed rules):** A did not run the full suite, the build gate or `verify`.
- **Servers:** the mock API that A started on :5199 (`/tmp/a460-mock.log`) is still running. The :5191 prod server is stopped. A did not touch the :5173 dev server.

## Next C checks (exact)
- Rows C1–C17 of `current-task.md` §3 as written, in this priority:
  - **C12:** r1 ×3 per server, and `frames inject` valid only with `styleReplaced` true and `hydrationErrors` > 0.
  - **C13:** `delayinject`, the release gate for TL-R460-2.
  - **C11:** dev hydration 0 in 6/6.
  - **C6 and C9** under the new rulings.
- **Optional probes from the review:**
  - A-R460-REVIEW-2: a re-render with no takeover, and how long the cover lasts.
  - A-R460-REVIEW-4: a skip inside the claim → hand-off window, and whether one black frame flashes.

## B acceptance passed by A (only A's own steps; the C rows are C's)
- Steps 2, 3, 4, 5 (typecheck, lint, Biome, covering, mutants, code-reviewer), 6, 7 and 8: passed as listed above.
- No C row is claimed. The whole backlog item is **not** marked complete.
