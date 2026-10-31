# A round 296 — STUDIO-LINK-a (product page → `/studio-lab?preview=` deep link)

**Status:** implemented as specified; no STOP. Browser rows are C's; full suite/build/verify/smoke are gate rows.
Evidence logs: `a-round-296/` (claims before/after, covering run, tsc, lint, mutant logs a–e).

## Pre-flight gate
- Assumptions: apply B's sketch exactly (9 code/test files) + write doc 220; deep link selects and focuses, never adds; missing/unknown param = today's behaviour.
- Smallest version: the sketch (~60 prod lines); no extra helper.
- Files: exactly the 10 §4 grants.
- Success: claims after = after-sketch with allowed deltas; 9 files / 89 tests; 4 mutants red; tsc rc 0; Biome no new finding.

## Changed files (10, = §4)
- M `app/components/product/ProductSidebar.tsx`
- M `app/contexts/ArrangementContext.tsx`
- M `app/routes/studio-lab.tsx`
- M `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` (1 mock line)
- M `app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx` (1 mock line)
- M `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` (1 mock line)
- M `app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx` (1 mock line)
- ?? `app/data/studio-lab-links.ts`
- ?? `app/lib/arrangement/__tests__/studio-link-ui.test.tsx`
- ?? `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md`

The 9 code/test files are byte-for-byte the hunks of `b-round-295/sketch-studio-link-a.diff` (applied with `patch -p0`, dry-run clean first). No protected or frozen file touched.

## Claims
- **Before editing:** `claims-296.sh` output **equal** to `claims-296-output.txt` (diff empty).
- **After:** diff vs `claims-296-after-sketch.txt` is only the allowed deltas: K1–K3 lines present (K2 `status lines 10`, K3 `frozen 1163 rc 1`) and K14 `1` (was 0). K4–K13 and K16 identical.
- `sha256sum -c` fails on exactly the 7 modified paths (ProductSidebar, ArrangementContext, studio-lab route, 4 route tests). The 7 protected files pass (K4 each listed once).

## Checks run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 |
| `npm run lint` | rc 0 (205 pre-existing repo warnings, 1 info; none new in owned files) |
| `npx biome check` on the 9 code/test paths | 1 warning: `ProductSidebar.tsx:75` `useButtonType` on the Complimentary Download button — pre-existing on HEAD. No new finding, no ignore. |
| Covering set (9 files) | **9 files, 89 tests passed** (8.46 s). Per file: link 20, obsidian 12, ssr 4, narrow-gate 16, dtn 2, price-unavailable 7, handle-route 12, presentation 8, price-cards 8. |
| Timing (L11) | slowest NG5 1822 ms of 15 000 ms (12 %); next 461 ms (LK3, of 15 s) / 455 ms. Nothing above 50 % of its timeout. |
| stderr | `act(...)` warnings: 4 from LK5/LK6 (ArrangementProvider update outside act), plus 9 pre-existing in `studio-narrow-gate-ui` and `product-presentation`. Not failures. B's `sketch-covering-run.log` is compact-reporter output without stderr, so no baseline comparison is claimed. |

## Mutants (scratch copy `/tmp/a296-scratch`; each restored and `cmp`-equal to the store file)
| Mutant | Change | Result |
|---|---|---|
| (a) no-focus | route `?.focus()` → no-op | **LK5 red** (1 failed / 19) |
| (b) no-initial | context drops the `find(…initialSelectedSourceId)` term | **LK4 `second`, `third` red** (2 failed) |
| (c) plain-object | links module uses object literal lookup | **LK1 `__proto__`, `constructor`, `toString` red** (3 failed) |
| (d) link-always | sidebar renders the link unconditionally | **LK3 red** (1 failed) |
| (e) informational, not in task | route drops `initialSelectedSourceId={previewSourceId}` | **all 20 green** — confirms reviewer finding 2 (gap below) |

## code-reviewer (real subagent, score 8/10, no Critical/High)
Dispositions (no code/test change in response: every proposed test adds `LK` ids → K9 delta = §8 STOP, and §3 binds to the sketch hunks):
1. **Medium — SSR → `hydrateRoot` path untested** (LK5/6/7 use `createRoot`, where hydrated is already true). Proposed LK5h (wide, renderToString + hydrateRoot, option focused, no hydration warning) and LK7h (wide SSR hydrated narrow → BODY; later widening → `arrangement-exit` only). **Open, for B** (test-only follow-up or 297 sketch). Browser rows B-LANDING / B-NARROW cover the real path in the meantime.
2. **Medium — route prop wiring not mutation-covered.** Mutant (e) proves it: removing the route's `initialSelectedSourceId` prop leaves all LK green, because `demo-middle-east` is `sources[0]` and LK5's focus uses `previewSourceId` directly. Fix proposal: a route test with `~/data/studio-lab-demo` mocked to a reordered collection, asserting `aria-selected` on the target. **Open, for B** (L52-type vacuity).
3. **Low — focus ring may be invisible after a mouse click.** Clicking the product link sets `html[data-focus-source="pointer"]` (`app/lib/focus-source.ts`), which survives Remix client navigation, so the option's `:focus-visible` ring may be hidden; with the selection identical to the default, a mouse user may see no change. **For C to measure** (below); B decides.
4. **Low — no `preventScroll`.** **Rejected:** §3.3 intends `focus()` to scroll the option into view, and B-LANDING requires the option box inside the list's visible box.
5. **Low — LK7 cannot fail on the `!isWide` guard** in a client render (narrow returns before the workspace mounts). Covered only by LK7h proposal (finding 1). **Open, for B.**
6. **Low — no StrictMode variant.** Logic correct (ref persists across double effects). **Open, for B**, low value.
7. **Info — changing `?preview=` while mounted keeps the old selection.** Intended; recorded as a TODO line in doc 220 for STUDIO-LINK-b (doc-only, no claim moves; claims re-run unchanged).
8. **Info — rAF stubbed in jsdom;** no mount-time deferred focus exists today. No action.

**Architecture note (for B, signal `A-R296-ARCH-DEEPLINK-HOOK`):** keep. The route gains one ref + one one-shot effect sharing its existing hydration/width latch; the provider only gains a pure initializer prop. Extract a `useStudioLabDeepLinkFocus` hook as one bounded task only if STUDIO-LINK-b adds a second URL-driven behaviour to this effect region, with LK5h/LK7h as acceptance.

## Acceptance rows A actually ran (A cannot mark C rows passed; this is self-check evidence)
- CLAIMS, SOURCE-SCOPE, TYPECHECK, UNIT (9/89, LK1–LK7 present by name), UNIT-MUTANTS (a–d red, restore `cmp` clean): met locally.
- DOC-220: exists; l.4 exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS)`; 7 TEMPLATE `## ` headings in order; all 10 files listed; cited ids (PD-REVIEW-2026-10-31, D-29z749, D-29z750, STUDIO-LINK-b, STUDIO-LINK-DYNAMIC, NAME-AND-HINT, LK1–LK7) exist in backlog / test file.
- Not run by A: every browser row (B-LINK … G296-AUTH), gate rows. No browser was used this round.

## Known gaps
- Reviewer findings 1, 2, 5, 6 (test coverage) are open; they need a B grant because new LK rows change K9.
- Pointer-click focus visibility (finding 3) unmeasured.
- act warnings in LK5/LK6 stderr (non-failing).

## Exact next C checks (beyond §6)
1. **B-LANDING, pointer vs keyboard visibility:** after a **mouse click** on "Try it in the Studio", read `document.documentElement.dataset.focusSource` and the option's computed `outline-width`/`outline-style` (and screenshot). Repeat after **keyboard Enter** on the link. Report whether a ring is painted in each case (finding 3).
2. **Cold load** of `/studio-lab?preview=middle-east` (direct URL, not client navigation) at both viewports: option focused, `aria-selected="true"`, 0 hydration warnings/page errors (covers the SSR→hydrate path that jsdom does not).
3. Cold load narrow 860×700 with `?preview=middle-east`, then widen: focus goes to `arrangement-exit` only, never the option.
4. Product page bundle: confirm `ProductSidebar.tsx` / product route chunk does not include `studio-lab-demo` (§6 adjacent behaviour).

## Scope completed
STUDIO-LINK-a as specified in §3 (all 10 grants). STUDIO-LINK-b ("View in store", `?` sheet row) untouched. Backlog not marked complete.
