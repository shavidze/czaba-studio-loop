# A round 468: SABA-B-15 stage 1, diagnosis of slow frames when the Store home page scrolls

**Status:** cause confirmed (task step 5). The store tree is unchanged. There is a proposal for stage 2: `a-round-468/proposal.diff.txt`. Nothing in this report is a ruling. B and product-designer rule on the visual sentence.

## Start state (L11)
- HEAD `9ba13ac`. `git status --short --untracked-files=all` showed 0 lines at the start and shows 0 at the end.
- Protected manifest `b-round-318/protected-sha256.txt` returns rc 0 at the start and at the end. It must be run from the store root: run from the loop folder it fails on relative paths, which is not a manifest failure.
- Store files changed: **none**. All edits are in scratch copies under `a-round-468/` (`head/`, `fix/`, `pristine/`, `dry/`, `d/`).

## Housekeeping (for root)
- I removed the regenerable scratch trees `a-round-468/head`, `fix` and `p2` (about 325 MB each), with absolute paths (L60).
- They can be rebuilt as a `9ba13ac` archive plus `proposal.diff.txt` or `product-only.diff.txt`.
- I gzipped both traces: `trace-head.json.gz` is 3.7 MB and `trace-inv.json.gz` is 7.0 MB.
- `a-round-468/` is now 15 MB in total.
- Small copies remain: `pristine/`, `d/` (the diff sources) and `dry/` (the dry-run target).
- `pgrep remix-serve|server.mjs` shows nothing left running.

## Environment
- The renderer is software raster: WebGL reports `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))`, from `trace.cjs` stdout.
- Large `filter: blur()` costs far more in software raster than on a GPU. The cause below is **confirmed in this environment**. Saba's own device stays TLM-R468-SABA-SCROLL-DEVICE.
- Mock API: `node $(realpath mock-api/server.mjs)`. With the symlinked loop path, its `import.meta.url === argv[1]` main-check fails silently, so the server does not start. Use `realpath`.
- My servers: HEAD on :3468 and the fix on :3469, both via remix-serve, and the mock on :5199. All three are stopped; curl returns 000. The root dev server :5173 was not touched (200).
- L38: every probe and trace ran alone. Builds, Biome and vitest ran only while no probe ran.

## Commands (in order)
1. `git -C store archive 9ba13ac | tar -x -C a-round-468/head`, a symlink to `node_modules`, then `npm run build`: rc 0 (`build-head.log`).
2. `PORT=3468 npx remix-serve build/server/index.js` and the mock API.
3. `node b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3468 a-round-468/scroll-head.json 1` (`scroll-head.log`).
4. Trace: `node a-round-468/trace.cjs a-round-468/trace-head.json`, then `trace-sum.cjs` → `trace-sum.txt`. Then `trace-inv.cjs`, which adds invalidationTracking, → `invalidations.txt`.
5. Layout map: `layout-map.cjs` → `layout-map.json`.
6. Screens s1–s7: `a-round-468/screen.sh <name> <css>`, which wraps `store-scroll-floor-probe.cjs` with HIDE_CSS → `screens/*.json` and `screens/summary.txt`.
7. Fix copy `a-round-468/fix`, edited with the editor tools. `npm run build`: rc 0 (`build-fix.log`). Served on :3469 and probed twice (`scroll-fix-1.json`, `scroll-fix-2.json`).
8. `visual.cjs` → `proposal-visual/*.png` and `diff-stats.json`. `overflow.cjs` → `overflow.txt`.
9. `diff -ru` between a pristine and a fixed copy → `proposal.diff.txt`. `patch -p1 --dry-run -d a-round-468/dry < proposal.diff.txt` on a fresh `9ba13ac` archive: rc 0.
10. Run in the scratch fix copy:
    - `npx biome check` on the 2 files: rc 0, with 1 warning (`noArrayIndexKey` ProductSection:54). The same warning is in HEAD, so it is pre-existing.
    - `npx vitest run app/lib/__tests__/studio-naming.test.tsx app/lib/__tests__/store-hidden-focusables.test.tsx`: 2 files, 13 tests passed (`vitest-fix.log`).

## Step 2: reproduce HEAD
| `/` | Slow frames per pass (>33.4 ms) | Median | Moving frames | finalY |
|---|---|---|---|---|
| 1440 | 11, 6, 4 | **6** | 166–172 | 2400 |
| 1280 | 6, 4, 5 | **5** | 171–178 | 2400 |

- `/free-downloads`: 0 at both viewports, with finalY 575 / 755.
- B measured 9 / 8. A's 6 / 5 is lower, but both are well above 2, so the bug reproduces. Passes are noisy (4–11), so I judged screens by **whether a band's slow-frame scrollY values disappear**, not by small median moves.

## Step 3: trace summary (`a-round-468/trace-summary.md` holds the detail)
Totals over the 9 slow frames of one wheel sequence at 1440×900 (ms, all threads):

| Event (thread) | Time in slow frames |
|---|---|
| RasterTask / DisplayItemList::Raster (ThreadPoolForegroundWorker) | 918 |
| ProxyMain::BeginMainFrame (main) | 403 |
| LayerTreeHost::WaitForCommitCompletion (main) | 373 (main waits for raster) |
| Commit (main) | 248 |
| Display::DrawAndSwap (VizCompositorThread, SoftwareRenderer) | 222 |
| FireAnimationFrame / FunctionCall (main, script) | 117 |
| ScrollLayer | 115 |
| ImageDecodeTask | 32 |
| Paint, Layout, RecalculateStyle | small |

The window is `[mark startTime, startTime + dt]`. My first draft summed `[ts − dt, ts]`, one frame early. I corrected `trace-sum.cjs` and re-ran it on the same trace. Raster still dominates.

- The cost is **tile raster off the main thread**. The main thread blocks on commit until raster finishes. Script time is small.
- Invalidations: the hero Ken Burns `motion.img` changes inline style every frame (260×). Screen s1 shows it is not the cause.

## Step 4: bisect (`a-round-468/bisect.md`)
| Build / screen | Change | `/` median >33.4 ms 1440 / 1280 | Moving frames | Result file |
|---|---|---|---|---|
| HEAD (A repro) | none | 6 / 5 | 166–178 | `scroll-head.json` |
| s1 | Hero image `transform:none` (Ken Burns off) | 5 / 4 | 164–178 | `screens/s1-hero-img-static.json` |
| s2 | All large blur glows hidden | **0 / 0** | 165–180 | `screens/s2-glows-hidden.json` |
| s3 | ProductSection's 2 glows hidden | 2 / 1. Band 1 gone; band 2 (~1930–2020) remains | 174–179 | `screens/s3-…` |
| s4 | StudioShowcase glows hidden | 3 / 2. Band 2 gone; band 1 remains | 166–181 | `screens/s4-…` |
| s5 | Glows promoted with `will-change:transform` (keeps the look) | **71 / 57**. Much worse: the compositor applies the filter every frame | 102–119 | `screens/s5-…` |
| s6 | ProductSection's 2 glows + the Showcase 800px glow hidden | 0 / 0 | 174–179 | `screens/s6-…` |
| s7 | ProductSection's 2 glows + the reflection glow hidden (800px kept) | 3 / 2. Band 2 remains | 172–181 | `screens/s7-…` |
| **Proposal build** | Gradient swap of the 3 glows (real source) | **0 / 0 and 0 / 0** (2 runs) | 167–190 | `scroll-fix-1.json`, `scroll-fix-2.json` |
| ProductSection-only build | Only the 2 ProductSection lines (`product-only.diff.txt`) | 2 / 0 (passes 2,2,3 / 2,0,0). Band 2 ~1920–2040 remains | 172–179 | `scroll-product-only.json` |

**Cause.** Three large round decorative glows drawn with `filter: blur()`:
- `ProductSection.tsx:38` (500px, blur 120) and `:39` (400px, blur 100) cause band 1 (scrollY ~360–900);
- `StudioShowcase.tsx:75` (800px, blur 120) causes band 2 (~1850–2020).

- **Confirmed fact:** hiding or replacing these three glows removes both bands.
- **Inference, not measured:** each tile that the blur's visual overflow enters must re-run the blur in raster.
- **Why the proposal is 3 lines, not 2:** the ProductSection-only build meets the ≤ 2 bound only at its edge. Its 1440 median is exactly 2, with one pass at 3, and band 2 remains. The two causes add up, so the proposal holds both. The 3-line version gives 0 / 0 twice.

## Step 5: proposal (`a-round-468/proposal.diff.txt`)
- **Files touched:**
  - `app/components/home/ProductSection.tsx` (2 lines);
  - `app/components/home/StudioShowcase.tsx` (1 line).
- **Change:** each `bg-<token>/N blur-[…]` becomes a Tailwind `bg-radial from-<token>/N via-<token>/… to-transparent to-70%` gradient. The same box gets a `scale-…` so the soft edge reaches about as far as the old blur (≈ r + 2.5σ: 220 %, 225 %, 175 %). Position, `rounded-full`, `pointer-events-none` and the tokens are unchanged. There are no hardcoded colours and no new CSS.
- **Confirm build:** the scratch copy `a-round-468/fix`, served on :3469. The tree has since been removed and can be rebuilt from `9ba13ac` plus the diff.
- **Product-section pair:** I opened it and checked it. The cards are revealed in both shots, and the glow is the only difference.

| Path | Viewport | Slow frames per pass, run 1 / run 2 | Moving frames | finalY |
|---|---|---|---|---|
| `/` | 1440 | 0,0,0 / 0,0,0 | 167–179 | 2400 |
| `/` | 1280 | 0,0,0 / 0,0,0 | 173–190 | 2400 |
| `/free-downloads` | both | 0 | 64 / 72 | 575 / 755 |

- **Visual:** `proposal-visual/{product-section,studio-showcase}-{1440,1280}-{before,after}.png`, plus `diff-stats.json`.
  - Pixel diff: mean |Δ| 0.9–1.3 of 255, max 6.7, 0 % of pixels > 10.
  - Mean luminance rises by +0.9 to +1.3 (of 255).
  - **One sentence:** the brass glows behind the product carousel and the Studio mockup look the same in shape and position. They are a touch broader and brighter (about 1/255 on average), with a slightly more even falloff than the Gaussian blur. No other element changes.
- **Overflow:** both sections are `overflow-hidden`. `scrollWidth` equals `clientWidth`, and `scrollHeight` is unchanged (4921 / 5683) at 1440, 1280 and 375 before and after (`overflow.txt`).
- **R-468-1:** met. Lenis is untouched.
- **R-468-2:** met. No keep-list component is touched: ProductSection and StudioShowcase are not on the keep-list.
- **R-468-3:** met. Neither `app/root.tsx` nor `app/styles/**` is touched.

## For B (not done; outside the smallest change)
- **The same pattern exists below scrollY 2400 or on other routes, unmeasured** (`other-large-blurs.txt`):
  - `NewsletterSection.tsx:28` (blur 100);
  - `SpecialOffersSection.tsx:49–50` (blur 80; **keep-list, R-468-2**);
  - `StudioShowcase.tsx:118` (reflection, blur 40; s7 shows it is not needed);
  - `MobileWarning.tsx:117–118`;
  - `routes/gift-cards.tsx:254` (blur 120).

  The frozen probe stops at scrollY 2400, so these were not measured. Stage 2 might extend the probe or add a row.
- **s5 is a trap for stage 2:** promoting a filtered glow (`will-change`/`transform-gpu`) makes it 10× worse in this renderer.
- **Hero Ken Burns:** it invalidates every frame (260 style mutations per sequence). It is not a measurable cause here (s1). This is info only.

## Tests
- No store tests ran against the store tree, because nothing changed. In the scratch fix copy, the 2 test files that import StudioShowcase passed 13 of 13.
- No typecheck ran: the change is className strings only. Stage 2 runs typecheck with the grant.
- No code-reviewer ran, per the task (no store change).

## Exact next checks for C
- **C1:** HEAD probe at both viewports; expect a median ≥ 5 at one or both.
- **C2:** `patch -p1 --dry-run -d <fresh 9ba13ac copy> < a-round-468/proposal.diff.txt`, then apply it.
  - Grep that `scale-220`, `scale-225`, `scale-175` and `bg-radial` landed, and that `blur-[120px]` / `blur-[100px]` are gone from those 3 lines.
  - Build and probe: `/` ≤ 2 at both viewports, moving frames ≥ 100, finalY 2400. `/free-downloads` 0 with finalY 575 / 755.
- **C3:** add `b-round-467/probe/lenis-off.diff.txt` on top of the proposal; expect moving frames < 100 at 1440.
- **C4:** before/after screenshots of the ProductSection and StudioShowcase glows; compare them with the sentence above.
- **C5:** the R-468-1…3 checks above.
- **C6:** source scope 0 lines, protected manifest rc 0, run from the store root.
- **C7, C8, C9:** as in the task.

## Acceptance (A's part of the task, steps 1–7)
- [x] Start state checked: HEAD, a clean tree, protected rc 0.
- [x] HEAD reproduced: medians 6 / 5, above 2.
- [x] Trace summary written.
- [x] Screens and builds recorded in `bisect.md`.
- [x] Confirmed cause:
  - a real source change: the smallest one that reaches the bound with margin, with `/` 0 / 0 on 2 runs. The 2-line ProductSection-only build reaches 2 / 0 with no margin;
  - scrolling still eased: moving frames ≥ 100, finalY 2400;
  - `/free-downloads` 0;
  - dry-run rc 0;
  - visuals captured.
- [x] Servers stopped. The store tree is unchanged.

**Not claimed:**
- the C rows;
- Saba's device;
- any product-designer or B ruling on the visual change.
