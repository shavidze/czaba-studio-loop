# Round 469: SABA-B-15 stage 2. Replace the three home-page blur glows with radial gradients at today's strength

**Planned by:** B, at the round 468 → 469 planning on 2026-11-12 (`b-round-468.md`). The advisor was available and was consulted after orientation and before hand-off. `product-designer` was consulted on the look change (`b-round-468/pd-ruling.md`). The round-468 task is archived as `tasks/round-468.md`.

## Decisions (all in `backlog.json` `decisions_log_b`)
- **D-29z1650: round 468 accepted.**
  - C PASS (`c-round-468.json`: C1–C9, 0 bugs, browserVerified/realVerified true).
  - Gate 468 was skipped, "no real changes" (no store change) [K2].
  - **Cause confirmed** (in the cloud's software raster): three large `filter: blur()` glows.
    - `ProductSection.tsx` l.38–39 [K3] causes the band at scrollY ≈ 360–900.
    - `StudioShowcase.tsx` l.75 [K3] causes the band at ≈ 1850–2020.
- **D-29z1651: this dispatch.** SABA-B-15 stage 2 = the fix, with exact grants. It keeps the gradient approach (A's proposal), with the opacity lowered to today's glow strength, as product-designer ruled.
  - **The regression is not due.** `regression-last.json` is dated 2026-11-10 [K7], so it is due 2026-11-13. This planning is dated 2026-11-12.
- **Not closed by this round.** SABA-B-15 becomes "home cause fixed in cloud" after C PASS.
  - Saba named `/free-downloads`. It is 0 here at HEAD and is not touched.
  - Everything was measured in SwiftShader software raster.
  - TLM-R468-SABA-SCROLL-DEVICE stays open. The question to Saba is in `user-review/questions-round-468.md`.

## Rules
- **Read `lessons.md` first.** It applies especially:
  - L18 (scroll frames);
  - L12 (no styling-class selectors in tests);
  - L38 (perf runs alone);
  - L57 (C's harness fields);
  - L58;
  - L59/L60 (progress, destructive commands).
- **L29:** every statement about a file under `store/` carries a `[K#]` tag. The claims script is `b-round-468/claims-469.sh`, and B's run is `b-round-468/claims-469-planning-output.txt`.
- **Reference-first:** not applicable, because this is a performance fix. **Screen budget:** not applicable, because no persistent element is added. **product-designer:** done at planning; C consults it in review mode (C7).

## Baseline: HEAD `9ba13ac`, clean [K1]; protected manifest rc 0 [K8]

### Grants (exactly these four paths)
| Path | What |
|---|---|
| `app/components/home/ProductSection.tsx` | Only the two glow `<div>` lines (l.38–39 [K3]) |
| `app/components/home/StudioShowcase.tsx` | Only the glow `<div>` line l.75 [K3]. The reflection line l.118 (`blur-[40px]`) stays |
| `app/lib/__tests__/store-scroll-paint.test.ts` | New |
| `docs/implementation/2026/quarter-IV/305-saba-b-15-home-scroll-glows.md` | New. The number 305 is free [K6] |

**Everything else stays byte-identical.** That includes:
- `app/hooks/useSmoothScroll.ts`, so Lenis `duration: 1.2` is kept [K17];
- `app/root.tsx` and `app/styles/**` (both forbidden [K17]);
- the keep-list `SpecialOffersSection.tsx`;
- `NewsletterSection.tsx`;
- every protected file.

### Rulings carried from round 468
- **R-468-1:** Lenis's curve is unchanged.
- **R-468-2:** keep-list components are not touched.
- **R-468-3:** no `root.tsx` or `app/styles/**` change.

**New rulings:**
- **R-469-1 (product-designer, `pd-ruling.md`): the look stays at today's strength.**
  - Glow contribution = mean section luminance of the build minus the **HEAD build with its glows hidden** (`look-profile.cjs` uses the variant named `hidden` as the control).
  - Per section and viewport it must be **0.8×–1.3× HEAD's**.
  - A's round-468 opacities measured 2.4–3.1× and are red.
- **R-469-2: do not promote the glows.** No `will-change`, `transform-gpu` or `translate-z` on these elements. A's s5 screen made frames 10× worse.

## Why we missed it (SABA-B-15, from round 468)
- **Phase:** the STORE rounds' C rows measured LCP/CLS at load and contrast. No row measured frames while scrolling, and the PERF harness covers `/studio-lab` only. Smooth scroll was treated as "on" (Lenis is present), not as a measured behaviour.
- **Rule:** already merged into L18, "Scroll frames (D-29z1648)" [K18]. It is unchanged this round.
- **Round 468's own near-miss:**
  - A's and C's whole-section pixel diff called a 2.4–3.1× stronger glow "a touch brighter", because the means were about 1/255.
  - Only the deleted-glow control and product-designer caught it.
  - This is recorded for RETRO 480 as RETRO480-LOOK-CONTROL. It is a counter, not yet a lesson (1×).

## 0. The sketch (B, L58)
**`b-round-468/sketch-469.diff.txt`** applies to the tree with `git apply --check` rc 0 [K9]. It changes 3 files:

**1. ProductSection l.38–39.** `bg-<token>/5 blur-[1x0px]` becomes:
```
scale-220 rounded-full bg-radial from-brand/2 via-brand/1 via-30% to-transparent to-70%
scale-225 rounded-full bg-radial from-accent/2 via-accent/1 via-30% to-transparent to-70%
```
The position classes and `size-[…]` are unchanged.

**2. StudioShowcase l.75.** `bg-brand/20 blur-[120px]` becomes:
```
scale-175 rounded-full bg-radial from-brand/10 via-brand/5 via-40% to-transparent to-70%
```

**3. `store-scroll-paint.test.ts`.**
- **SP1:** on files under `components/home/`, the large-blur count (`(?<![\w-])blur-\[(\d+)px\]` with px ≥ 80) must match the allow-list exactly:
  - `NewsletterSection.tsx` 1;
  - `SpecialOffersSection.tsx` 2.

  These are the HEAD counts [K4]. The reason for both is SIG-R469-UNMEASURED-BLURS.
- **SP2:** the 2 measured sections have 0 large blurs.
- **SP3:** non-vacuous. Each listed file is scanned. The counter's self-tests are:
  - `blur-[120px]` = 1;
  - `md:blur-[100px] blur-[80px]` = 2;
  - `blur-[40px] blur-[79px]` = 0;
  - `backdrop-blur-[120px] backdrop-blur-lg` = 0.
- **It does not pin the new gradient classes.** STORE-2d/3 may restyle these sections (L8).

**B's measurements on the applied sketch** (`b-round-468/`, numbers in `claims-469-planning-output.txt`):

| Check | Result | Source |
|---|---|---|
| Frozen probe (`b-round-467/probe/store-scroll-probe.cjs`) | `/` medians **0 / 0**, moving 174–180, finalY 2400. `/free-downloads` 0, finalY 575 / 755 | K11 `scroll-sketch2-frozen.json` |
| Full-page probe (`b-round-468/store-scroll-probe-full.cjs`, 40 ticks, `PATHS=/,/gift-cards`) | `/` medians **1 / 1**, finalY = maxScroll 4121. HEAD is 8 / 5. `/gift-cards` 0 at HEAD and on the sketch | K11 |
| Look band (`look-probe2.cjs` + `look-profile.cjs`) | ratioToHead 1.19 / 1.21 (1440) and 1.09 / 1.20 (1280) | K12 |
| Tailwind emitted every new class | yes | K15 `built-css-classes.txt` |
| Unit | SP1–SP3: 3 passed | K13 |
| SP mutant (HEAD's two section files) | SP1 and SP2 red: 2 failed | K13 |
| Scan suites `store-*` + `studio-naming` with the sketch | 15 files, 212 tests passed | K13 |
| L23 sweep: old glow tokens in the test roots | 0 files [K16]. The two section importers [K16] pass in the scan run | K16 |

- **An observation, not a bound:** one full-page pass at 1440 had 8 frames of 50 ms at scrollY 1796–2032, with no long task (`sketch2-full-slowframes.txt`). The medians stay ≤ 2. HEAD's 3 frames at 3012–3158 are an observation too.

## 1. A: steps
1. **STOP (L11) if the start state is wrong.** HEAD must be `9ba13ac` and the tree clean, with protected rc 0.
2. **Apply the sketch.** Use `git apply b-round-468/sketch-469.diff.txt` from the store root. That is correct in the store repo; the loop-folder trap does not apply here.
   - You may change only the opacity stops (`from-*/N`, `via-*/N`), and only to keep R-469-1 inside its band.
   - Any other class change is a STOP for B.
3. **Write doc 305** in Georgian, following `docs/implementation/TEMPLATE.md` and L26.
   - Status l.4 is exactly `Completed (C round 469 PASS)` (L28).
   - **Context:** Saba's report, the round-468 cause, and the software-raster limit.
   - **Approach:** gradient vs blur. Why not `will-change`: s5. The rejected options are: delete the glows (look change), A's stronger opacities (product-designer) and a Lenis change (R-468-1).
   - **Testing:** SP1–SP3 by id, the probe commands, and the band.
   - **TODO:** TLM-R468-SABA-SCROLL-DEVICE and SIG-R469-UNMEASURED-BLURS.
4. **Run the checks** (A's speed rules):
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run app/lib/__tests__/store-scroll-paint.test.ts app/lib/__tests__/studio-naming.test.tsx app/lib/__tests__/store-hidden-focusables.test.tsx app/lib/__tests__/store-` (the scan suites, L23).

   Save the logs under `a-round-469/`.
5. **If you changed an opacity stop,** re-run the band yourself:
   - make a production build of a scratch copy of the tree (`git archive` of HEAD + your diff, applied with `patch -p1` under `a-round-469/`), next to a HEAD build;
   - run `node b-round-468/look-probe2.cjs <out.json> <shotDir> head=<HEAD url> tree=<tree url> hidden=<HEAD url>,hide`;
   - then run `node b-round-468/look-profile.cjs <out.json> <out.txt> tree`;
   - perf runs alone (L38).
6. **Ask `code-reviewer`** (4 changed files) and include its Architecture note.
7. **Report** `a-round-469.md`: the diff stat, the logs, the reviewer findings, and whether you changed opacities from the sketch.

## 2. C: what to verify
- **Files:** write `c-round-469.md`, `c-round-469.json` and `c-round-469/progress.json` as you go.
- **Builds:** make two scratch production builds under `c-round-469/`: **HEAD** (`git archive 9ba13ac`) on :3471 and **TREE** (HEAD + `git -C store diff` applied with `patch -p1`) on :3472. Start the mock API with `node $(realpath mock-api/server.mjs)` if :5199 does not answer.
- **Order:** run the probes one at a time (L38), heaviest first.
- **Budget:** at most 2 extra attempts per row to replace an environment-invalid measurement (agent-workflow).
  - **Environment-invalid means only:** an L38 overlap (another job ran during the probe), or C1 failing (the environment cannot show the bug). A slow pass is never replaceable.
  - In C2 and C3, record the slow-frame scrollY values of every pass. A cluster of slow frames inside one of the fix's bands (scrollY ≈ 360–900 or ≈ 1800–2050) in **two or more passes** is a FAIL, even when the median is ≤ 2. B's sketch had one such pass (`sketch2-full-slowframes.txt`).

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | HEAD-CONTROL (browser) | Frozen probe on HEAD | `/` median ≥ 5 at either viewport. Otherwise the environment is invalid: use a replacement attempt |
| C2 | FRAMES (browser, both viewports) | `node b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3472 <out> 1` | `/` medians **≤ 2**, moving ≥ 100 and finalY 2400 in every pass. `/free-downloads` median 0, finalY 575 / 755 |
| C3 | FRAMES-FULL (browser, both viewports) | `PATHS=/,/gift-cards node b-round-468/store-scroll-probe-full.cjs http://127.0.0.1:3472 <out> 1` | `/` median **≤ 2**. In every pass finalY === maxScroll and moving ≥ 100. `/gift-cards` median ≤ 2 |
| C4 | GUARD-MUTANT (browser, 1440) | `b-round-467/probe/lenis-off.diff.txt` applied on top of TREE (third scratch copy, `patch -p1`), then the frozen probe | `/` moving < 100. The eased-scroll guard of C2 can fail |
| C5 | COMPUTED (browser, both viewports) | `node b-round-468/look-probe2.cjs <out> <shots> head=…3471 tree=…3472 hidden=…3471,hide` | TREE: product-section glowCount 2 and studio-showcase 1. Each has `filter` `none` and a `backgroundImage` containing `radial-gradient`. HEAD shows `blur(120px)` / `blur(100px)` |
| C6 | LOOK-BAND (browser, both viewports) | `node b-round-468/look-profile.cjs <out> <txt> tree` | ratioToHead **0.8–1.3** for each section × viewport. The band is two-sided: A's round-468 opacities measured 2.4–3.1 (K12), and a deleted glow is 0 by construction |
| C7 | SHAPE / EDGES (browser) | Same shots, plus your own 200 % zoom crops of each glow; binned profile and edgeJump from `look-profile.cjs`; product-designer in review mode (≤ 7 findings) | Record the rows. edgeJump at the top and bottom ≤ HEAD's + 1 level. No visible ring at the circle edge, no banding steps and no seam at the section edge at 100 %. A visible defect is a finding: **Medium** if it is seen at 100 % at either viewport, else Low |
| C8 | OVERFLOW (browser) | `/` at 1440, 1280 and 375 on HEAD and TREE | `scrollWidth === clientWidth`, and scrollHeight is equal between HEAD and TREE |
| C9 | UNIT + MUTANT | In the store: `npx vitest run app/lib/__tests__/store-scroll-paint.test.ts`. In a scratch copy of TREE, put back HEAD's `ProductSection.tsx` only, then HEAD's `StudioShowcase.tsx` only. `git -C store diff` leaves out the untracked test and doc, so copy `store-scroll-paint.test.ts` (and doc 305 for C11) from the store into each scratch copy with `cp`. Never use `git add -N` or `stash` in the store | rc 0 at the tree. Each mutant turns SP1 and SP2 red |
| C10 | SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff -U0` of the two components; protected manifest | Exactly the 4 granted paths. The component diff touches only l.38–39 and l.75. `useSmoothScroll.ts`, `root.tsx`, `app/styles/**`, SpecialOffers and Newsletter are unchanged. No `will-change`/`transform-gpu` on the glow lines (R-469-2). Protected rc 0 |
| C11 | DOC | Doc 305 | Its `## ` headings contain TEMPLATE's seven, in order. l.4 is `Completed (C round 469 PASS)`. Every SP id it cites exists in the test file (L26) |
| C12 | AUTH + STUDIO SMOKE (browser, 1440 and 1280) | As round 468 C7 | Same PASS meaning. The fake-bearer path is BLOCKED (backend unavailable in cloud) |
| C13 | CLAIMS | `bash b-round-468/claims-469.sh` | Equal to `claims-469-planning-output.txt` except K1's status count (4) and K9 (the diff is already applied, so `--check` fails). K6 and K16 read `9ba13ac`, so they do not change. No `MISSING` |
| gate | — | Full verify, code review, publish | Root. Not claimed |

## 3. Claims (`b-round-468/claims-469.sh`)
| Claim | What it checks |
|---|---|
| K1 | HEAD and status |
| K2 | Gate 468 |
| K3 | HEAD glow line numbers |
| K4 | Large-blur counts at HEAD per home file |
| K5 | The home route mounts |
| K6 | Doc 305 is free |
| K7 | `regression-last.json` |
| K8 | Protected rc |
| K9 | The sketch applies, and its files |
| K10 | The artifacts exist |
| K11 | Frame medians per file |
| K12 | Look ratios |
| K13 | Unit and mutant logs |
| K14 | The probe shas |
| K15 | The built CSS classes |
| K16 | The test-root sweep |
| K17 | Forbidden files and Lenis duration |
| K18 | lessons.md |

## 4. After this round
1. **On C PASS:**
   - SABA-B-15 = "home cause fixed in cloud (C round 469)". It closes only after Saba's device answer (TLM-R468-SABA-SCROLL-DEVICE, deadline RETRO 480).
   - REG-SCROLL-HOME-FRAMES turns its `/` median ≤ 2 into an assert.
2. **Next planning dated 2026-11-13 or later:** REGRESSION-2026-11-13, with every `scope_additions` entry.
3. **Then:** STORE-2c, STORE-2d (it owns Lenis reduced-motion), STORE-3, STORE-4, STORE-5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
4. **Root, non-blocking:**
   - ROOT-REQ-DP-GATE-FIRST, with SABA-B-16 and the critical stance;
   - the next RETRO is round 480.
