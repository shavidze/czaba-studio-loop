# Round 470: SABA-B-15 stage 2b. Fix the glow shape (C-R469-01) and close round 469 with a control that works on this runner

**Planned by:** B, at the round 469 → 470 planning on 2026-11-12 (`b-round-469.md`).
- The advisor was available and consulted after orientation.
- `product-designer` was consulted twice: on s4 (`b-round-469/pd-s4.md`) and on the dispatched s6 (`b-round-469/pd-s6.md`, "none — ship as is").
- `tech-lead` reviewed the sketch twice (`b-round-469/sketch-review.md`).
- The round-469 task is archived as `tasks/round-469.md`.

## Decisions (all in `backlog.json` `decisions_log_b`)
- **D-29z1652: round 469 is not accepted.**
  - C's verdict is BLOCKED: C2–C13 PASS, C1 env-invalid ×3 (`c-round-469.json`). Gate 469 was skipped ("C taskStatus BLOCKED") [K2].
  - The round-469 diff stays in the tree, uncommitted [K1]. SABA-B-15 does **not** become "home cause fixed in cloud".
- **D-29z1653: the HEAD control becomes a measured p95 row.**
  - C1's "> 33.4 ms median ≥ 5" is a cliff. On this runner HEAD drops single frames at exactly 2 vsyncs (33.2–33.3 ms), which that count does not see.
  - In C's own round-469 data, HEAD `/` p95 ≥ 33.0 in **17/18** frozen passes and TREE p95 ≤ 16.8 in **18/18** [K10]. B's re-run at planning: HEAD 6/6, round-469 TREE 0/6, s6 0/6 [K10].
  - The same split holds on the earlier runners [K10]. HEAD frozen p95 is 33.3–50 in every pass of B 467, A 468 and C 468. The fixed variants' frozen p95 is ≤ 16.8 in every pass of A 468 (×2), C 468 and B 468 sketch2. Only one **full-page** pass (B 468 sketch2) reached 33.4, so C3 records p95 and does not assert it.
  - The new C1 asserts that separation. The old ">33.4 median ≥ 5" is kept as a `record` field, never deleted. Analysis: `b-round-469/c469-reanalysis.txt`.
- **D-29z1654: C-R469-01 is fixed now; it is not deferred.**
  - C measured it as Low; product-designer's eyeball said Medium. B rules **Low**: the max patch delta is 2.8 of 255, and the section mean was inside the band.
  - It is fixed in this round under the bug-gate exception "the current round already owns that code and it costs little". The diff is unpublished, the same three lines are in A's grant, and the sketch is measured.
  - On s6, product-designer rates the remaining difference "none" and would ship it as is (`pd-s6.md`). Its weakest spot is the upper-right accent patch at 0.79×.
- **D-29z1655: this dispatch.** Scope is sketch s6 (the scale and stop classes on the 3 glow lines) plus doc 305's update. The test file is not touched.
- **Regression not due.** `regression-last.json` is dated 2026-11-10 [K7]; it is due 2026-11-13. This planning is dated 2026-11-12.

## Rules
- **Read `lessons.md` first.** These apply especially:
  - L18 (scroll frames);
  - L12 (no styling-class selectors in tests);
  - L38 (perf runs alone);
  - L57 (C's harness fields);
  - L58 (asserted numbers come from B's sketch run; mutants named);
  - L59 and L60 (progress, destructive commands).
- **L29:** every statement about a file under `store/` carries a `[K#]` tag. The claims script is `b-round-469/claims-470.sh`; B's run is `b-round-469/claims-470-planning-output.txt`.
- **Not applicable:** reference-first (a performance and look-preserving fix) and the screen budget (nothing persistent is added).
- **product-designer:** consulted at planning. C consults it in review mode (C7).

## Baseline
- HEAD `9ba13ac` plus the round-469 diff, uncommitted [K1].
  - `git status --short --untracked-files=all` shows exactly 4 lines.
  - `git diff | sha256sum` starts with `9b69dffe162894903a6c` and equals `c-round-469/tree.diff` [K1, K1b].
- Protected manifest rc 0 [K8].

### Grants (exactly these paths)
| Path | What |
|---|---|
| `app/components/home/ProductSection.tsx` | Only the two glow lines l.38–39 [K3] |
| `app/components/home/StudioShowcase.tsx` | Only the glow line l.75 [K3]. The reflection `blur-[40px]` line stays [K3] |
| `docs/implementation/2026/quarter-IV/305-saba-b-15-home-scroll-glows.md` | Edit (see A step 3) |

**Unchanged byte for byte:**
- `app/lib/__tests__/store-scroll-paint.test.ts`: sha256 `b53b4529fdf9153d53aa3eec9b75f58e2fa51ae5e6d5e55bd44aaedbe68a252b`.
- Everything else, including:
  - `useSmoothScroll.ts` (Lenis `duration: 1.2`), `app/root.tsx` and `app/styles/**`;
  - SpecialOffers (keep-list) and Newsletter;
  - every protected file.

### Rulings
- **Carried over:**
  - R-468-1: Lenis is unchanged.
  - R-468-2: the keep-list is untouched.
  - R-468-3: no `root.tsx` or styles change.
  - R-469-1: section band 0.8–1.3× HEAD.
  - R-469-2: no `will-change`, `transform-gpu` or `translate-z` on the glows.
- **New, R-470-1 (product-designer, `pd-s4.md`): the glow keeps today's shape as well as its mean.**
  - **Bright patches.** On the 7×7 grid of 40×40 patches, every patch where HEAD's glow is at least 2 levels above the hidden control has a tree glow of 0.7–1.3× HEAD's.
  - **Patch delta.** No patch differs from HEAD by more than 1.5 levels.
  - **Lean.** No section has every changed patch (|Δ| ≥ 0.05) moving the same way while its section ratio is outside 0.9–1.1.
- **New, R-470-2 (tech-lead): no gradient stop goes past 70 %.** On a square box, farthest-corner puts the inscribed circle at about 70.7 %, so a later stop would clip at the `rounded-full` edge. Recorded as SIG-R470-STOP-CEILING.

## Why we missed it (C-R469-01)
- **Phase:** B's planning row R-469-1 bounded the section **mean** only.
  - In round 468 B had demoted product-designer's "peak within ±1 level" row to `record`. B's reason was that content confounded the centre-line peak (the ProductCard `backdrop-blur`).
  - C's round-469 patch grid, measured against the hidden control, showed that the confound does not stop a patch comparison. A wider, flatter glow keeps its mean and loses its peak.
- **Rule:** RETRO480-LOOK-CONTROL had 1 occurrence (round 468). It now has 2, so B promotes it into `lessons.md` L58 this planning: "a look-preserving swap is bounded by shape (bright-patch ratio, max patch delta) as well as the section mean; a mean-only band passes a flatter, wider glow." The file stays at 60 lines; the clause is merged into L58.

## 0. The sketch (B, L58)
**`b-round-469/sketch-470.patch.txt`** (sha256 `abff32ff1b9457b9c8a414bd7ade1ea03844f56b5b30d4edfb123e93c0fc3370`, reviewed: `sketch-review.md`) applies to the current tree with `git apply --check` rc 0 [K4, K5]. It changes 2 files:

| Line | Round 469 (now in tree) | s6 (this sketch) |
|---|---|---|
| PS l.38 | `scale-220 … from-brand/2 via-brand/1 via-30% to-transparent to-70%` | `scale-160 … from-brand/6 via-brand/3 via-30% to-transparent to-60%` |
| PS l.39 | `scale-225 … from-accent/2 via-accent/1 via-30% … to-70%` | `scale-180 … from-accent/5 via-accent/2 via-25% … to-60%` |
| SS l.75 | `scale-175 … from-brand/10 via-brand/5 via-40% … to-70%` | `scale-145 … from-brand/20 via-brand/12 via-35% … to-70%` |

Position, `size-[…]`, `rounded-full` and `bg-radial` are unchanged. Each new selector is emitted in the tune build [K12].

**B's measurements on s6** (production build of the tree + sketch in `b-round-469/tune`, `tune-run.sh`):

| Check | s6 | Round-469 tree (s0) = mutant | Source |
|---|---|---|---|
| Section ratio (R-469-1) | 1.21 / 0.94 (1440), 1.18 / 0.94 (1280) | 1.19 / 1.21, 1.09 / 1.20 | K9 |
| Bright-patch ratio, all patches with HEAD glow ≥ 2 | 0.78–1.08 | **0.43–0.63 in product** (red) | K9b |
| Max \|cand − HEAD\| per patch | 0.54–0.78 | **2.64–2.77** (red) | K9b |
| Lean | mixed (+16/−7, +15/−8, +13/−2, +9/−8) | — | K9b |
| Edge jump top/bottom | PS 0/1, SS 1.67/0. HEAD is PS 1/0.33 and SS 1/0, so ≤ HEAD + 1 | — | K9, `look-s6-profile-head.txt` |
| Frozen probe `/` | p95 ≤ 16.8 in 6/6 passes; over33 0/0; 0 in-band slow frames; moving 175–179; finalY 2400. `/free-downloads` 0, finalY 575/755 | — | K10, `s6-frames-summary.txt` |
| Full-page probe `/` | median 0/0; finalY 4121 = max; one isolated frame at y 3215; `/gift-cards` 0 | — | K10 |
| HEAD frozen at planning | p95 ≥ 33.0 in 6/6 passes (over33 median 1/1) | — | K10, `b-probe-summary.txt` |
| Unit SP1–SP3 on s6 | 3 passed | — | K11 |

The deleted glow is also red on the bright-patch row, at 0× by construction.

## 1. A: steps
1. **STOP (L11) if the start state is wrong.** Check all of these:
   - HEAD is `9ba13ac`;
   - the status shows exactly the 4 round-469 lines;
   - `git diff | sha256sum` starts with `9b69dffe162894903a6c`;
   - the protected manifest gives rc 0.
2. **Apply the sketch from the store root:** `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-469/sketch-470.patch.txt` (that is `b-round-469/sketch-470.patch.txt`).
   - Do not tune. Any other class change is a STOP for B.
   - Do not edit `store-scroll-paint.test.ts`.
3. **Update doc 305** in Georgian, following L26.
   - l.4 becomes exactly `**სტატუსი:** Completed (C round 470 PASS)` (L28).
   - **მიდგომა:**
     - give the s6 classes;
     - add R-470-1 (bright patches, patch delta, lean) next to R-469-1;
     - add a rejected option: "round 469-ის sketch (s0): საშუალო ზოლში იყო, მაგრამ glow უფრო ბრტყელი და ფართო გამოვიდა (C-R469-01)".
   - **ტესტირება:**
     - B's s6 numbers from the table above, attributed to B and not to C;
     - "round 469" becomes "round 470" where it names C's confirmation;
     - one line saying round 469's C1 control used a > 33.4 ms count that this runner does not reach, and that the control is now p95.
   - **TODO:** keep TLM-R468-SABA-SCROLL-DEVICE and SIG-R469-UNMEASURED-BLURS, and add SIG-R470-STOP-CEILING.
   - Every SP id it cites must exist in the test file.
4. **Run the checks** (A's speed rules). Save the logs under `a-round-470/`.
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run app/lib/__tests__/store-scroll-paint.test.ts app/lib/__tests__/studio-naming.test.tsx app/lib/__tests__/store-hidden-focusables.test.tsx app/lib/__tests__/store-`.
5. **Ask `code-reviewer`** (3 changed files) and include its Architecture note.
6. **Report** in `a-round-470.md`: the diff stat (vs HEAD and vs the round-469 tree), the logs and the reviewer's findings.

## 2. C: what to verify
**Files.** Write `c-round-470.md`, `c-round-470.json` and `c-round-470/progress.json` as you go.

**Builds.** Make three scratch production builds under `c-round-470/`:
- **HEAD** (`git archive 9ba13ac`) on :3471;
- **S0**, the round-469 tree (HEAD + `c-round-469/tree.diff` applied with `patch -p1`, plus `cp` of the untracked test), on :3474;
- **TREE**, the current store (HEAD + `git -C store diff` applied with `patch -p1`, plus `cp` of the untracked test and doc), on :3472.

Start the mock API with `node $(realpath mock-api/server.mjs)` if :5199 does not answer.

**Order.** Run one probe at a time (L38).

**Budget.** At most 2 extra attempts per row, and only to replace an environment-invalid measurement.
- Environment-invalid means only an L38 overlap, or a C1 failure.
- A slow TREE pass is never replaceable.
- In C2/C3, record the slow-frame scrollY of every pass. A cluster inside a fix band (≈ 360–900 or ≈ 1800–2050) in **two or more passes** is a FAIL.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | HEAD-CONTROL (browser) | `node b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3471 <out> 1` | `/` **p95 ≥ 33.0 in ≥ 2 of 3 passes at each viewport**. **Record** the old field too: the movingOver33 median. Otherwise the environment is invalid; use a replacement attempt |
| C2 | FRAMES (browser, both viewports) | Same probe on :3472, 3 runs | `/` **p95 ≤ 17.0 in ≥ 8 of the 9 passes at each viewport** (every pass recorded; the in-band cluster rule above stays a hard FAIL), movingOver33 median ≤ 2, moving ≥ 100, finalY 2400. `/free-downloads` median 0, finalY 575/755 |
| C3 | FRAMES-FULL (browser, both viewports) | `PATHS=/,/gift-cards node b-round-468/store-scroll-probe-full.cjs http://127.0.0.1:3472 <out> 1`, 3 runs | `/` median ≤ 2. In every pass finalY === maxScroll and moving ≥ 100. `/gift-cards` median ≤ 2. Record p95 |
| C4 | GUARD-MUTANT (browser, 1440) | `b-round-467/probe/lenis-off.diff.txt` on top of TREE (a fourth scratch copy, `patch -p1`), then the frozen probe | `/` moving < 100 |
| C5 | COMPUTED (browser, both viewports) | `node b-round-468/look-probe2.cjs <out.json> <shotDir> head=http://127.0.0.1:3471 tree=http://127.0.0.1:3472 s0=http://127.0.0.1:3474 hidden=http://127.0.0.1:3471,hide` | TREE: product-section glowCount 2 and studio-showcase 1, each with `filter` `none` and a `radial-gradient` backgroundImage, no `will-change`. HEAD shows `blur(120px)` / `blur(100px)` |
| C6a | LOOK-MEAN | `node b-round-468/look-profile.cjs <out.json> <txt> tree s0` | tree ratioToHead 0.8–1.3 for each section × viewport |
| C6b | LOOK-BRIGHT-PATCHES (R-470-1) | `node b-round-469/patches2.cjs <shotDir> tree <patches-tree.json>` and the same with `s0`. Per section × viewport, take every patch with HEAD glow (head − hidden) ≥ 2 | Every such patch has a tree glow of 0.7–1.3× HEAD's. **Mutant:** S0 has at least one product patch below 0.7 |
| C6c | LOOK-PATCH-DELTA (R-470-1) | The same JSON | max \|tree − head\| over all 49 patches ≤ 1.5 per section × viewport. **Mutant:** S0 is above 1.5 |
| C6d | LOOK-LEAN (R-470-1) | The same JSON | No section where every patch with \|Δ\| ≥ 0.05 has the same sign while its C6a ratio is outside 0.9–1.1 |
| C7 | SHAPE / EDGES (browser) | Shots plus your own 200 % crops of each glow, including the upper-right accent patch (product 0.8, 0.2), which is `record`; edgeJump from C6a; product-designer in review mode (≤ 7 findings) | edgeJump top and bottom ≤ HEAD's + 1. No visible ring, banding steps or seam at 100 %. A visible defect is **Medium** at 100 % at either viewport, else Low |
| C8 | OVERFLOW (browser) | `/` at 1440, 1280 and 375 on HEAD and TREE | `scrollWidth === clientWidth`; scrollHeight equal between HEAD and TREE |
| C9 | UNIT + MUTANT | In the store: `npx vitest run app/lib/__tests__/store-scroll-paint.test.ts`. In a scratch copy of TREE, restore HEAD's `ProductSection.tsx` only, then HEAD's `StudioShowcase.tsx` only. `cp` the untracked test into each copy; never use `git add -N` or `stash` in the store | rc 0 at the tree; each mutant turns SP1 and SP2 red |
| C10 | SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff -U0` of the two components; `sha256sum` of the test; protected manifest | 4 paths, the same as round 469. Component hunks only at l.38–39 and l.75, and the `+` lines equal the sketch's `+` lines byte for byte. Test sha `b53b4529…252b`. `useSmoothScroll.ts`, `root.tsx`, `app/styles/**`, SpecialOffers and Newsletter are unchanged. No `will-change`/`transform-gpu`. Protected rc 0 |
| C11 | DOC | Doc 305 | It contains TEMPLATE's seven `## ` headings in order; l.4 is `**სტატუსი:** Completed (C round 470 PASS)`; every SP id it cites exists; it names C-R469-01 and R-470-1 |
| C12 | AUTH + STUDIO SMOKE (browser, 1440 and 1280) | As round 469 C12 | `/studio-lab` opens anonymously with the demo; premium `/studio/<handle>` shows "Sign in required" with no audio src; `/api/studio-token` returns 401. The fake-bearer path is BLOCKED (backend unavailable in cloud) |
| C13 | CLAIMS | `bash b-round-469/claims-470.sh` | Equal to `claims-470-planning-output.txt` except: K1's diff sha (the sketch is applied), K4 (`--check` now fails), and K14's L58 line, which can only change if `current-task.md` changes. No `MISSING` |
| gate | — | Full verify, code review, publish | Root. Not claimed |

## 3. Claims (`b-round-469/claims-470.sh`)
| Claim | What it checks |
|---|---|
| K1 / K1b | HEAD, status, diff sha; C's TREE diff sha |
| K2 | Gate 469 |
| K3 | Glow line numbers in the tree; the reflection line |
| K4 / K5 | The sketch applies; its sha |
| K6 | The artifacts exist |
| K7 | `regression-last.json` |
| K8 | Protected rc |
| K9 / K9b | Look ratios and edges; patch rows for s0, s4 and s6 |
| K10 | Frame p95 separation (C469 data and B's runs) |
| K11 | Unit on s6 |
| K12 | Built CSS selectors |
| K13 | The probe shas |
| K14 | The L58 check |
| K15 | `lessons.md` length |

## 4. After this round
1. **On C PASS:**
   - SABA-B-15 becomes "home cause fixed in cloud (C round 470)". It closes only after Saba's device answer (TLM-R468-SABA-SCROLL-DEVICE, deadline RETRO 480).
   - C-R469-01 closes.
   - REG-SCROLL-HOME-FRAMES uses the p95 control.
2. **Next planning dated 2026-11-13 or later:** REGRESSION-2026-11-13, with every `scope_additions` entry.
3. **Then:** STORE-2c, STORE-2d (it owns Lenis reduced-motion), STORE-3, STORE-4, STORE-5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
4. **Root, non-blocking:** ROOT-REQ-DP-GATE-FIRST (with SABA-B-16) and RETRO 480.
