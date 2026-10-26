# A round 190 — STORE-1d fix-up (C-R189-01 Medium, C-R189-02 Low)

Status: implementation done, awaiting C round 190. Not self-marked complete.

## Start checks
- HEAD `850445c` OK; frozen list (1016) OK from the store root; 3 start hashes match (`579d1fba…`, `f1b741ea…`, `4323f083…`).
- Mock :5199 was NOT listening → A started `node mock-api/server.mjs` (log `a-round-190/mock.log`) and stopped it at the end. The shared :5173 dev server was used, not restarted.

## Changed files (grants only)
| File | sha256 (end) | Change |
|---|---|---|
| `app/components/loading/SpotlightLoader.tsx` | `97b61316…` | K1: overlay rendered via `createPortal(…, document.body)`; the guard `if (!isVisible) return null` stays before it, so SSR still returns ''. K2: keydown handler (renamed `handleEntranceSkipKey`) hides on `Escape` **or** `Tab` (Shift+Tab included), no `preventDefault`. No visual element, class, style, colour or timing changed. No new export. |
| `app/lib/__tests__/store-entrance-loader.test.tsx` | `b15d1bab…` | `findOverlay` → `document.querySelector('[data-testid="entrance-loader"]')` (the portal moves the overlay out of the RTL container; the param is kept so the other cases stay unchanged). L2 heading query scoped to the overlay. "Tab does not skip" → `it.each` Tab / Shift+Tab "ends it like Escape without preventing the focus move" (overlay gone, `fireEvent` returns `true`, timer count 0, keydown listeners removed). New "other keys do not skip" (`a`, `ArrowDown`, `Shift`). 17 tests. |
| `docs/implementation/2026/quarter-IV/156-store-1d-entrance-loader.md` | `a469ffe8…` | Status `In Progress (awaiting C round 190)`; portal bullet; R67 with 3 rejected alternatives; R63 Tab clause marked replaced; problem→solution for C-R189-01 (bisect, confirmed cause, before/after CLS, visual side-effect and stacking disclosure), C-R189-02 and the test helper; testing; TODO incl. architecture note. |

Evidence: `a-round-190/end-sha256.txt`, `a-round-190/diff-vs-start.patch` (vs `b-round-189/r190-granted-start/`). `git status`: exactly 2 ` M` (SpotlightLoader; doc 155 untouched since 189) + 2 `??` (T1, doc 156). Frozen list re-checked at the end: OK.

## K1 — order of work
1. **Reproduce** (start tree, `tools/cls.cjs` = C's method, 3 fresh + 3 seen loads per viewport, DPR 2) → `out/cls-before-{375,1280,1440}.json`. Fresh: 375 = 0 (1st load cold, no insertion) / 0.6158 / 0.6158 → median 0.6158; 1280 = 0.2727 / 0.2934 / 0.2934 → 0.2934; 1440 = 0.1938 ×3 → 0.1938. One shift per load ≈490 ms after insertion, source `DIV.absolute top-1/2 left-1/2…`, prev [0,0] → cur h 500. Reproduced.
2. **Bisect** (375, 1 fresh load each, `tools/bisect.py`, `out/bisect-375.txt`):

| Frozen element (initial = animate = final) | CLS |
|---|---|
| none (control) | 0.6158 |
| main glow (opacity+scale) | 0.6158 |
| main glow scale only | 0.6158 |
| main glow opacity only | 0.6158 |
| secondary glow | 0.6158 |
| logo wrapper (opacity/y/scale) | 0.6158 |
| rule line | 0.6158 |
| tagline | 0.6158 |

   → C's hypothesis (the end of framer child animations) is **rejected**. A per-frame probe (`tools/probe.cjs`, `tools/anc.cjs` → `out/ancestor-375.txt`) gives the **confirmed cause**: the ancestor `DIV.page-transition-wrapper` (`PageTransition.tsx`, frozen) animates `opacity 0→1` + `transform: translateY(8px)→0` for ~500 ms. While `transform ≠ none` it is the containing block of the `fixed inset-0` overlay: the overlay is 375×5564 (the whole document) and the centred glow and logo sit at the document's middle, off-screen (prev rect 0×0). When the transform clears (~490 ms after insertion) the overlay snaps to 375×812 and the glow enters the viewport. That is the shift.
3. **Fix:** portal to `document.body`. After: `out/ancestor-375-after.txt` → overlay 812 from the first frame, no containing ancestor.
4. **Optional old-loader probe** (850445c, 375, 1 load, 4 s window): CLS 0.0000 (`out/cls-old850445c-375.json`). The working copy was restored and verified (`97b61316…` OK). Inference only, not confirmed: the old, longer timeline showed the glow after the wrapper transform had cleared.

## Live proof after the fix (Playwright Chromium, mock :5199, dev :5173)
- **CLS** (`out/cls-after-*.json`, summary `out/cls-summary.txt`):

| VP | fresh loads | fresh median | seen loads | seen median |
|---|---|---|---|---|
| 375 | 0.0000 / 0.0000 / 0.0000 | 0.00005 | 0 / 0 / 0 | 0 |
| 1280 | 0.0014 ×3 | 0.0014 | 0.0014 / 0.0221 / 0.0221 | 0.0221 |
| 1440 | 0.0009 ×3 | 0.0009 | 0.0009 / 0.0198 / 0.0009 | 0.0009 |

  - No fresh load has an overlay-sourced shift with value ≥ 0.005. Only the expected `v:0` rule-line entries remain.
  - The seen-mode 0.0198–0.0221 shifts come from the header (`A "CZABA"`, NAV, `page-transition-wrapper`). They are outside the overlay and pre-existing: the before run had them too, in 1 of 3 loads at 1280 and at 1440.
  - The seen 1280 median landed on 0.0221 this time (2 of 3 loads), against round 189's 0.0014. That is page behaviour on a code path this round did not touch (the loader returns null in seen mode), and it stays < 0.1.
  - Fresh LCP medians are 460 / 532 / 548 ms, and the LCP element is the hero `IMG` on all 9 fresh loads.
  - Info for C: the seen 375 LCP median is 2000 ms. In 2 of 3 loads Chrome chose the hero `P` text at ~2 s. That is ≤ 2.5 s, on an untouched path.
- **Timing** (1440, `out/timing-after.json`): insertion→removal 1164 / 1164 / 1167 ms. Logo opacity stays ≥ 0.9 for 497 / 503 / 475 ms in the pre-paint (ResizeObserver) sampler. The overlay height is 900 on every sample, and its parent is `body`.
- **Mid-loader shots** (`shots/mid-{375,1440}-{550,800}.png`, `out/shots-after.json`): 375@571 ms and 1440@561 ms show the logo, rule line and tagline centred (logo centre 188,370 and 720,424). The 1440@800 capture landed after removal because of screenshot latency, not a defect.
- **Keys** (`out/keys-after.json`, key pressed ≈300 ms after insertion):
  - Tab at 375 and 1440: overlay removed 5 ms after the key; focus on the visible header link `A "CZABA"`.
  - Shift+Tab: removed after 4 / 7 ms; focus on the "Cookie Policy" link. A rerun (`out/keys-after-shifttab.json`, removed after 29 / 5 ms) confirms the link is inside `FOOTER` (not the cookie banner) and the browser scrolled to it (`scrollY` 4900 at 375, 4121 at 1440); its rect is inside the viewport.
  - Escape: removed after 4 / 6 ms.
  - ArrowDown: not removed; the loader ended by itself at 1166 / 1163 ms. The hidden page scrolled 40 px, which is info and outside R67.
  - Every case: 0 audio plays, URL unchanged, 0 pageerror.

## Unit / static checks (actually run)
- `npx vitest run app/lib/__tests__/store-entrance-loader.test.tsx`: **17/17 green** (`out/t1-tree.txt`).
- Red proof on the start copy (temporary copy over the grant, restored, sha OK): **only the 2 Tab cases red**, 15 green (`out/red-proof-start-copy.txt`).
- Mutant m2 (`preventDefault` on Tab): both Tab cases red on "expected false to be true" (`out/mutant-m2.txt`); restored, sha OK.
- `npm run typecheck`: exit 0. `npm run lint`: **214 warnings + 1 info**, the same as round 189. `npx biome check` on SpotlightLoader + T1: 0 errors, 1 expected `noArrayIndexKey` (dust map).
- The full suite and verify were not run; they are the gate's job.

## Code review (code-reviewer subagent, actually invoked; score 8/10, no Critical/High)
- **Medium #1, not fixed, routed to B:** no unit test covers the portal; reverting `createPortal` keeps all 17 tests green. A `parentElement === document.body` assertion would turn L2 red on the start copy, which contradicts T-RUN-190 ("only the two new Tab cases red") and the T1 grant ("only as in §1"). Doc 156 says K1 is checked only by Playwright. **B decision needed:** allow a portal assertion and amend T-RUN-190 to "Tab cases + the portal case red on start".
- Low #2 (unused `findOverlay` param): kept on purpose so the other cases stay unchanged; noted in the doc.
- Low #3, Low #4 and Info #5, #6, #7: fixed in doc 156 (labels, L2 scope wording, the K1 unit-test gap, compositing wording, and the stacking disclosure: the header `sticky z-50` and the cookie banner `z-50` are now covered while the loader is up; Toast, modals, LeadMagnet and the cursor stay above it).
- Info #8 (`AnimatePresence` is inert, pre-existing) and #9 (bubble-phase keydown; `capture` optional): not changed.
- **Architecture note (verbatim from the reviewer):** "Signal (coupling): `SpotlightLoader.tsx:75-283` now relies on how an ancestor animates (the `y` in `PageTransition.tsx:9-21`). Keep it: a portal is the standard way out for a `fixed` overlay, and the component stays self-contained. The underlying risk lives in the frozen `PageTransition`. During route enter it is the containing block for every `fixed` descendant, including `DownloadDialog.tsx:96`, `studio.$productId.tsx:104` and `account.tsx:309`. Proposal for the planner: one bounded task, either removing `y` from `pageVariants` or auditing the fixed overlays inside routes. Value is medium, cost is low, and the risk is a subtle visual change on page enter."

## Disclosed visual consequence of K1 (for VIS-190 / R66) — with screenshots
Evidence: `shots/early-{before,after}-{375,1440}-{80,250}.png`, `out/early-{before,after}.json`. The "before" set was taken with the start copy temporarily over the grant; the working copy was restored and verified (`97b61316…` OK). Screenshot capture latency: the 375 shots landed 92–492 ms after insertion and the 1440 shots up to 787 ms.
- **Before (375):** while the wrapper transform was active, the overlay took the wrapper's box. It started at y = 81, below the header, and was 5564 px tall. The header sits outside `page-transition-wrapper` (confirmed: `headerInsideWrapper=false`), so it was **visible above the overlay**, and the logo sat off-screen (y ≈ 2860).
- **After (375):** the overlay covers the whole viewport, header included, from the first frame. The logo is centred (y 403 → 370).
- **1440 (warm server):** the wrapper transform had already cleared before insertion in this run, so before and after look the same.
- **Correction to my earlier wording:** in this run the wrapper opacity was already 0.97 at insertion, so the screenshots do not show the page "partly visible through" the overlay. Across runs the first-sample wrapper opacity ranged from 0 to 0.97 (`out/ancestor-375.txt`); the doc now says this.
- **Stacking:** the header (`sticky z-50`) and the cookie banner (`z-50`) are now under the overlay while it is up. Toast, modals, LeadMagnet and the cursor stay above it.
- **Unchanged:** no loader element is removed; classes, styles, colours and timings are identical.

## B acceptance I believe passed (A-side evidence only; C verifies)
- K1: reproduce → bisect → confirmed cause → fix, all recorded. Fresh median < 0.1 at 375, 1280 and 1440, with no overlay shift ≥ 0.005 (A's measurement). T ≤ 1200 ms, and the logo stays ≥ 0.9 for ≥ 200 ms pre-paint.
- K2: Tab and Shift+Tab end the loader like Escape, without preventDefault; other keys don't skip (unit and live).
- T1 as specified; on the start copy only the Tab cases are red.
- D1 updated. Typecheck, lint and Biome run. Code review done; Medium #1 is open for B.

## Exact next C checks (priority)
1. CLS-FRESH-190 at 375 first (it was 0.62), then 1280 and 1440. Confirm the parent of `[data-testid=entrance-loader]` is `body` and its height equals the viewport from the first sample.
2. VIS-190: judge the disclosed first-450 ms change (solid black, overlay above the header) against R66; compare at ≈550 and ≈800 ms.
3. SKIP-190 (c)/(d): Shift+Tab focus lands on the footer "Cookie Policy" and the browser scrolls to it. Confirm it counts as "visible inside the viewport after the browser's scroll".
4. T-RUN-190 mutants m1–m4. Note that T1 does NOT catch a portal-removal mutant (reviewer Medium #1).
5. DUR-190 / CLS: warm the dev server with one throwaway load before counting. My very first fresh 375 load of the before run had **no overlay insertion in the 4 s window** (cold Vite transform; LCP fell to the header SPAN at 1000 ms). This is the ENV-FIRST-LOAD class, not a K1 regression.
6. HIT-190, STORE-AFTER-190, STUDIO-RV-190 and G190-3 regressions. The stacking change could matter for any popup that appears within the first 1.2 s.

## Known gaps
- No unit test for the portal (B decision).
- ArrowDown, Space and PageDown scroll the hidden page while the loader is up. This is outside R67 and a Low candidate for `deferred_low_polish`.
- Pre-existing page behaviour outside the grants: the seen-mode header shift (0.02), and the occasional late text LCP at 375 in seen mode.
