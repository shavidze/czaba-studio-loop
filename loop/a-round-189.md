# A round 189 — STORE-1d: D10 entrance loader

**Status:** implementation complete and handed to C. Nothing committed or pushed. STORE-1d is not done until C passes it.

## Start checks (all OK)
1. HEAD `850445c`.
2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-188-r189-tree-sha256.txt` from the store root: OK at start and at end.
3. Start hashes `abfe013b…` and `b47bec15…` matched.
4. Neither new file existed.

The mock was **not** listening on :5199, so A started it (`node mock-api/server.mjs`, PID 3801, log `a-round-189/mock.log`). A stopped it at the end; `ss` showed :5199 free afterwards. :5173 was reused, not restarted.

## Changed files (exactly 4, within ownership)
| File | Change |
|---|---|
| `app/components/loading/SpotlightLoader.tsx` (grant) | **K1:** `SPOTLIGHT_ENTRANCE_TOTAL_MS = 1150` (≤ 1200), measured from mount to unmount with the exit fade included. Phases: spotlight at 100 ms, logo at 250 ms (fade 0.25 s), hold at 450 ms, exit at 900 ms (fade 0.25 s), hide at 1150 ms. Every framer duration was shrunk to fit, and timers are now `ReturnType<typeof setTimeout>`. **K2:** `pointer-events-none` from exit onwards, via `cn`. **K3:** a native `click` listener on the overlay through a ref, plus a document `keydown` listener for `Escape`. Both live in the one effect keyed on `isVisible`, so skip, finish and unmount all use the same cleanup (timers, keydown, click). **K4:** `sessionStorage` `czaba_entrance_seen`; the old localStorage key is neither read nor written; `getItem` and `setItem` sit in one try/catch, and a failure means no loader. **K5:** a `matchMedia('(prefers-reduced-motion: reduce)')` check runs before the storage step, so nothing renders and nothing is written. **K6:** root has `aria-hidden="true"` and `data-testid="entrance-loader"`; `motion.h1` became `motion.span` with `block` and the same classes and styles. Export name and props are unchanged; the only new export is the constant. No new colour, inline style or custom CSS. |
| `docs/implementation/2026/quarter-IV/155-store-1c-header-footer.md` (grant, K7) | l.4 is now `Completed`; l.72 now cites C round 188 PASS (`c-round-188.md`, browserVerified), published as `850445c`. `git diff --numstat`: 2/2. |
| `app/lib/__tests__/store-entrance-loader.test.tsx` (new, T1) | 15 tests: L1–L11 plus L10b. |
| `docs/implementation/2026/quarter-IV/156-store-1d-entrance-loader.md` (new, D1) | In Georgian, with the TEMPLATE sections. Records R61–R66 with the rejected alternatives, a Mermaid diagram, problem → solution entries and testing. Status: `In Progress (awaiting C round 189)`. |

Evidence: `a-round-189/end-sha256.txt` (4 files), `a-round-189/diff-vs-start.patch`, `a-round-189/SpotlightLoader.end.tsx`.

## Tests and checks actually run
- `npx vitest run app/lib/__tests__/store-entrance-loader.test.tsx`: **15/15 pass**. framer-motion is real; no rAF shim was needed. `vi.getTimerCount()` is 2 while the loader is shown and 0 after unmount or skip, so framer leaves no fake timers.
- **Red proof:** the start copy was put over the grant temporarily, then the end copy restored and checked with `sha256sum -c`: OK.
  - **Start code: 12 fail** (L2, L3, L4, L5, all three L6 cases except Tab, L7, L8, L9, L10, L10b). L1, L6-Tab and L11 stay green. See `a-round-189/red-start.txt`.
  - Note: the start code does not export the constant, so L3 and L4 fail there partly for that reason. Its 5.6 s behaviour would fail them anyway.
  - **Mutants:** firing on `pointerdown` instead of `click` turns L5 red (`red-mutant-pointerdown.txt`). Removing `removeEventListener` turns the 3 L6 hygiene cases red (`red-mutant-noremove.txt`).
- `npm run typecheck`: exit 0.
- `npm run lint`: **214 warnings + 1 info**, the same as round 188.
- `npx biome check` on the component and T1: 0 errors, 1 warning. It is the pre-existing `noArrayIndexKey` on the dust map (l.242), which this round did not change.
- I did not run the full suite or verify. That is the gate's job.

## Live proof (Playwright Chromium, 1440×900, `/`, mock :5199, dev :5173)
Script: `a-round-189/tools/probe.mjs`. Results: `probe-final-run{1,2,3}.json`. Screenshot: `mid-loader-1440.png`, taken about 550 ms after insertion, shows CZABA, the rule line and the tagline.

| Measure | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| Insertion → removal (MutationObserver + `performance.now`) | 1166.3 ms | 1171.4 ms | 1168.4 ms |
| Insertion time after navigation (after hydration) | 895 ms | 647 ms | 647 ms |
| Max h1 count, sampled every frame until 1 s after removal | 1 | 1 | 1 |
| Logo opacity (root × wrapper): max / time ≥ 0.9 | 1 / 519 ms | 1 / 525 ms | 1 / 506 ms |
| `pointer-events: none` from (after insertion) | 919 ms | 935 ms | 920 ms |
| Session key / old local key / pageerror | '1' / null / 0 | same | same |
| Reload in the same context: overlay insertions in 3 s | 0 | 0 | 0 |
| Fresh context with `reducedMotion: 'reduce'`: insertions / session key / h1 | 0 / null / 1 | same | same |

## Code review (code-reviewer subagent, actually run; score 8/10, no Critical or High)
**Fixed in this round:**
- **Medium:** the first version measured 1215–1217 ms against the 1200 constant, with no margin. → T lowered to 1150 ms; measured 1166–1171 ms.
- **Medium:** the hygiene tests passed vacuously when no listener had been added. → `expectAllRemoved` now asserts that at least one listener was added first.
- **Medium:** L11 could not fail on React 18. → L11 and L5 now assert `vi.getTimerCount() === 0` after unmount and after skip.
- **Low:** L5 now asserts that a `pointerdown` does **not** skip.
- **Low:** added L10b for a `setItem` failure.

**Not changed (reported):**
- **Low:** L4 samples only at 100 ms and T−1, not at the exact exit boundary. The task says not to pin the phase split.
- **Low:** `findOverlay` uses `container.firstElementChild`. L2 asserts that element carries the testid, and the component renders only the overlay root. I kept this so the red proof on the start code fails for behavioural reasons, not because a selector is missing.
- **Low:** the `typeof window` guard can never run.
- **Low:** the click listener would be silently skipped if the ref were null. That cannot happen today.
- **Low (design):** the tagline is fully visible for only about 150 ms before the exit starts. The spec requires the logo, not the tagline. Note for Saba.
- **Low:** the StrictMode double effect is correct only by analysis; no StrictMode test.
- **Nit:** test location. B's task fixed it in `app/lib/__tests__`.
- The reviewer's alternative, an inline head script for an SSR overlay, was rejected for this round because of CSP and split logic. A trade-off for Saba at STORE-2.

**Architecture note (verbatim to B):**
> Signal 4 (new state or lifecycle added to an existing owner): the session gate, the reduced-motion gate and the skip listeners are now in `app/components/loading/SpotlightLoader.tsx:18-30, 43-66`.
> **Keep:** it is one lifecycle in one effect, with no prop plumbing, and the cost of keeping it is low.
> The only thing that would justify extracting it is a second loader needing the same once-per-session / reduced-motion gate. The doc's STORE-5 item lists three loaders that currently have no users. No proposal for now.

## Known gaps and notes for C
- **Probe artifact, not a flash:** a rAF reader that runs early in the frame sees the logo wrapper at opacity 0 for one sample, about 700 ms after insertion (2–3 of 3 runs).
  - Cause: framer-motion 12's WAAPI `onfinish` sets the motion value and then immediately `cancel()`s the `fill: both` animation; the style is committed in framer's batch later in the same frame.
  - A ResizeObserver sample taken after all rAF callbacks and before paint showed **0 dips in 3/3 runs** (`tools/flicker-prepaint.mjs`, `flicker-prepaint.json`).
  - If C's DUR sampler sees a single 0, sample before paint the same way before calling it a flicker. The same framer pattern exists in the start code.
- The overlay appears 0.65–0.9 s after navigation, after hydration. This is the R61 trade-off, recorded as info.
- Only the 1440 viewport was probed live. C owns the 1280 and 375 viewports, HIT, SKIP in the browser, SESSION (b), (c) and (e), E2E, STORE-AFTER, KEEP, G189-3 and STUDIO-RV.
- Housekeeping: I deleted my own superseded scratch output files `a-round-189/probe-result-run{1,2,3}.json` (measurements from the earlier 1200/350 split, quoted in D1's problem section). No repository or other-agent file was deleted.
- `a-round-189/tools/staged.tsx` and `tools/body.txt` are stale scratch intermediates from the first edit pass (1200/350 split). They are **not** the end state. The end state is `a-round-189/SpotlightLoader.end.tsx`, which matches `end-sha256.txt`.
- The Biome `noArrayIndexKey` warning is pre-existing: `git show HEAD:app/components/loading/SpotlightLoader.tsx` has the same `key={i}` at l.242.

## Exact next C checks (§4)
DUR-189 (bound median ≤ 1250; expect about 1165–1175), HIT-189 (expect hit from about 920 ms), SKIP-189, SESSION-189, RM-189, H1-189, E2E-189, STORE-AFTER-189, KEEP-189, G189-3, STUDIO-RV-189, SCOPE-189 (`end-sha256.txt` above), T-RUN-189 (15 tests; red on start code as listed), AN-REVIEW-189, PX-NET / REG-HYD.

## B acceptance I actually passed (A side only)
- K1–K7, T1 and D1 are implemented.
- §3 test cases L1–L11 pass. The red proof matches §3: L2–L10 red and L1 green on the start code.
- Typecheck passes, lint shows no new warnings, and scoped Biome has 0 errors.
- The §3 live proof ran: duration, h1 count, second load, reduced motion and the screenshot.
- The code review ran and its Medium findings are fixed.
- None of the C rows are claimed.
