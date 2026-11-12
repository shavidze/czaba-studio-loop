# Round 476: DPG-FIX P0 stage 3a (DPG-P0-3a): the entrance loader and the header logo in Obsidian & Brass

**Planned by:** B, at the round 475 → 476 planning on 2026-11-12 (`b-round-475.md`).
- **Advisor:** available, and consulted after orientation.
- **`product-designer`:** ruled on the palette (`b-round-475/pd-p0-3a.md`).
- **`tech-lead`:** reviewed the sketch, APPROVE WITH CHANGES. All changes are adopted in v2 (`b-round-475/sketch-review.md`).
- **Archive:** the round-475 task is `tasks/round-475.md` (byte-identical, `cmp`).

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1682: round 475 result.**
  - C PASS, with `browserVerified`/`realVerified` true (`c-round-475.json`). Gate 475 published `edeba5a`.
  - DPG-P0-2 is C-verified and **awaiting the DP-gate re-review**; it is not მზადაა.
  - A-R187-PRODUCTCARD-PRIMARY-TOKEN closes on C6.
- **D-29z1683: ruling on A's round-475 STOP (L10).**
  - The tree is accepted as is, and C-R475-01 closes.
  - **The clause that wins from now on:** for a file granted "byte-equal to the sketch", a reviewer **Low** is reported, never edited, and is not a STOP. A STOP is raised only for a Medium or higher finding, or one that needs a file outside the grant (§1.6 wins over §1.2).
  - Reviewer findings:
    - R1 is recorded as `confirmedBy` on SIG-R475-TOKEN-GUARD-LIMITS (L7);
    - R2, R3, R4 and the UT3 title go to `deferred_low_polish` (C-R475-REVIEW-LOWS);
    - the gate-475 suggestions (title hover cue, stub-route inline styles) are recorded as signals.
- **D-29z1684: P0-3 is split.**
  - **Round 476 = 3a, the loader and logo palette.** It is user-visible and needs the browser.
  - **Round 477 = 3b, DPG-DOCS-UPDATE.** `docs/design/DESIGN_SYSTEM.md` has 13 hue hits and `docs/design/**` has 51 (`b-round-475/scan/docs-design-counts.txt`) [K18].
  - A failure in one half no longer holds the other.
  - **The `.claude` primitives text is delivered to root now:** `b-round-475/root-primitives-patch.md`, for ROOT-REQ-DPG-PRIMITIVES-PATCH.
- **D-29z1685: palette rulings** (`product-designer`, `b-round-475/pd-p0-3a.md`):
  - **Obsidian background:** `var(--color-background)` in the overlay, its base layer and the pre-hydration failsafe cover, so cover, loader and page share one colour.
  - **Brass light:** cone 0.04 / 0.10 / 0.04, pool 0.18 / 0.06, floor 0.12.
  - **Dust and vignette:** ivory dust `bg-foreground/50`; obsidian vignette via `color-mix`.
  - **Brass wordmark,** with **DPG-LOGO's header colour pulled forward.** Its `font-serif` half is a no-op (`--font-serif` = Instrument Sans) [K20], so it is not added. That goes to Saba once as SABA-Q-DPG-LOGO-FONT-SERIF (`user-review/questions-round-475.md` Q1, L44).
  - **Divider and tagline:** unchanged.
  - **SABA-B-16 stays open.** The asset is unconfirmed (questions-round-467 Q3), and favicon and og-image are root-only.
- **D-29z1687: R59 superseded.** The STORE-1 rule R59 (header wordmark `text-foreground`, marked vetoable) is superseded by Saba's DPG-LOGO (2026-11-12) for its colour clause. Its other clauses (non-heading span, link name `CZABA`, href `/`) stay, and N3 still pins them. The regression round must not report the brass logo as a regression.
- **D-29z1686: parked items owned by "the next SpotlightLoader owner"** (L6). Each is now a row:
  - the portal test, C-R190-INFO I1 / A-R190 Medium #1 → P1;
  - GATE460-2, random dust per render → P4;
  - A-R460-REVIEW-5, the stale comment → its sketch line.

  Not taken: A-R460-REVIEW-4 (possible one-frame flash, needs its own probe) and C-R190-I4 (ArrowDown scroll). Both stay deferred: they are not colour, and they touch the skip path.

## Rules
- **Read `lessons.md` first.** These apply especially:
  - L1, L2 (DPG clause), L4, L10 and L23;
  - L29, L31, L39, L54, L56 and L58.
- **Claims (L29):** `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-475/claims-476.sh`.
  - B's output at HEAD is `b-round-475/claims-476-planning-output.txt`.
  - The allowed deltas after A are `b-round-475/claims-476-allowed-deltas.txt`: the script's output on B's sketch-applied scratch, with a doc-309 placeholder (L56).
  - The last line is `L58 OK`.
- **Screen budget (L39):** nothing new becomes permanently visible.
  - The header wordmark changes colour only.
  - The loader is transient and changes colour only.
  - Persistent text lines are unchanged.
- **One element, one rule (L4):**
  - **The header wordmark:** "D-29z1685 brass" wins over "colour-only Store scope stays P1" and over the old STORE-1 rule R59 ("wordmark … text-foreground", vetoable; superseded by Saba's DPG-LOGO, D-29z1687). Only its colour class changes [K6].
  - **`store-entrance-loader.test.tsx` E1:** its one cover-pin line changes (sketch); every other E/L row is byte-unchanged.
- **Reviewer findings in A's step 6:** follow D-29z1683.

## Baseline
- **HEAD `edeba5a`** (gate 475 published), clean tree [K1].
- **Sketch v2:** `b-round-475/sketch-476.patch.txt`, sha `83341e9f…` [K2], 5 files. It applies to HEAD with rc 0.
- **Per-file sha256 after applying:** `b-round-475/sketch-476-files-sha256.txt`.

### Grants (exactly these paths)
| Path | What |
|---|---|
| `app/components/loading/SpotlightLoader.tsx` | Only the sketch's edits, byte for byte. The colour values change, the base-layer class changes and its English comment goes, the wordmark becomes `text-brand`, the dust is `bg-foreground/50` drawn once (`createDustParticles` + lazy `useState`), the vignette uses `color-mix`, and the Georgian timeline comment is corrected. Timing, phases, skip, portal and sizes are unchanged [K3][K4] |
| `app/components/loading/EntranceCover.tsx` | Only `background:var(--color-black)` → `background:var(--color-background)` in `ENTRANCE_COVER_CSS` [K5] |
| `app/components/layout/Header.tsx` | Only the wordmark span: `text-foreground` → `text-brand` (Biome puts the span on one line) [K6] |
| `app/lib/__tests__/store-entrance-loader.test.tsx` | Only the sketch: the E1 cover pin line [K7] and the new rows P1–P4 [K8] |
| `app/lib/__tests__/store-header-footer.test.tsx` | Only the sketch: the new row N3c [K8] |
| `docs/implementation/2026/quarter-IV/309-dpg-p0-3a-entrance-logo-brass.md` | New. It follows TEMPLATE. l.4 is exactly `**სტატუსი:** In Progress (stage 3 of 4; C round 476 PASS)` (L28 form; DPG-FIX P0 is now 4 stages: P0-1, P0-2, P0-3a, P0-3b) |

**Unchanged:** every other file, in particular:
- `app/styles/**` (no `@theme` token is added or changed, so DPG rule 2 needs no design-doc edit in this half) [K9];
- `Footer.tsx` [K10];
- the protected files (`app/root.tsx`, `components/studio/**`, `public/**`, `.claude/**`, `package.json`) [K9];
- the keep-list components.

## Reference
**Reference product:** none for the behaviour, because nothing in it changes; this is a colour-only round.
- **Store reference:** direction A, Obsidian & Brass (`/home/runner/czaba-project/docs/technical/store-redesign/direction-decision.md`).
- **Ruling:** `product-designer` (`pd-p0-3a.md`).

**Deviations from Saba's text:**
1. **`font-serif` is not added.** It is a no-op, so it goes to Saba as a question (Q1).
2. **The loader's wordmark weight stays `font-bold`,** against the header and footer `font-extrabold`. That is typography, outside a colour round, and goes to the DP gate.
3. **Two brass items in the `/store` header** (logo + active nav) are recorded for the DP gate, not decided by the loop.

## 1. A: steps
1. **STOP (L11) if K1 or K2 differ from B's output.** Read `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `FORWARDREF_COMPONENT.md` (Header), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
2. **Apply the sketch:** `git apply -p1 /home/runner/czaba-project/tmp/studio-real-loop/b-round-475/sketch-476.patch.txt`. This is a reviewed sketch, which L60 allows.
   - Check all 5 sha256 values with `sha256sum -c` from the store root against `b-round-475/sketch-476-files-sha256.txt`.
   - If a reviewer asks for a change to a granted file, follow D-29z1683.
3. **Write doc 309** (TEMPLATE headings in order, L26). It must name:
   - the `product-designer` rulings and the measured contrast (K16);
   - the hand-off colour (K15);
   - the parked items closed: P1, P4 and the comment;
   - the deviations above;
   - the TODO: P0-3b docs, ROOT-REQ-DPG-PRIMITIVES-PATCH, SABA-Q-DPG-LOGO-FONT-SERIF, SABA-B-16 and the DP-gate re-review.
4. **Run the checks** and save the logs to `a-round-476/`:
   - `npm run typecheck` and `npm run lint`;
   - `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-475/covering-476.txt)` (16 files [K13]).

   The full suite belongs to the gate.
5. **Mutants on a copy of your tree:**
   ```
   cp -a /home/runner/czaba-project/store /tmp/a476-mut
   python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-475/mutants/mutants.py /tmp/a476-mut /home/runner/czaba-project/tmp/studio-real-loop/a-round-476/mutants
   ```
   The script refuses the store tree and restores each file itself. All 12 must be RED, with the same red rows as `b-round-475/mutants/b-run/summary.txt`. A `NOT-APPLIED` line means your edit differs from the sketch; it is not a pass.
6. **Run `code-reviewer`** (3+ files), and pass its Architecture note on.
7. **Report in `a-round-476.md`:** files and shas, logs, mutants, reviewer findings.

## 2. C: what to verify
**Files.** Write `c-round-476.md`, `c-round-476.json` (all L57 fields) and `c-round-476/progress.json` as you go.

**Setup:**
- Start the mock API with `node $(realpath mock-api/server.mjs)` from the loop folder if `:5199` does not answer.
- **The probe:** `b-round-475/probe/probe-entrance.mjs <base> <tag> <outDir>`. It uses a fresh context per viewport, so the entrance plays. It stubs the LeadMagnet only; the entrance must NOT be skipped.
- **Before it:** warm the server once in a browser with `b-round-475/probe/warm.mjs <base>` (L38: a cold server timed out in B's first sketch run).
- **Never run vitest alongside a probe.**

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE | `git status --short --untracked-files=all` and the protected list | Only the 6 granted paths changed. The 5 sketch files equal `sketch-476-files-sha256.txt`. K9 = 0 |
| C2 | CLAIMS | `bash b-round-475/claims-476.sh` | Byte-equal to `b-round-475/claims-476-allowed-deltas.txt`; last line `L58 OK` |
| C3 | TESTS-MEAN-SOMETHING | Read P1–P4 and N3c. Run `mutants.py` on your own `cp -a` copy, out-dir under `c-round-476/` | 12 of 12 RED, with the same rows as `b-round-475/mutants/b-run/summary.txt` [K14]. Each new row has a mutant that turns it red |
| C4 | UNIT | `npx vitest run $(cat b-round-475/covering-476.txt)` | 16 files pass. `store-entrance-loader` stays under 50 % of the default timeout (L31; B's run is K17) |
| C5 | HAND-OFF COLOUR (both viewports) | `probe-entrance.mjs` → `probe-<tag>.json`: `cover[].before`, `hold.overlayBg`, `hold.kids[0].bgc`, `after.bodyBg` | Every non-null cover sample, the overlay, its base layer and `body` after exit are all `rgb(14, 13, 12)`. HEAD control: the cover and overlay are `rgb(0, 0, 0)` (K15, `b-round-475/probe/probe-head.json`) |
| C6 | LIGHT, DUST, VIGNETTE (both viewports) | Same JSON, `hold.kids[1..3].bg`, `hold.dustBg`, `hold.kids[6].bg` | The cone carries `rgba(201, 164, 106, 0.04)` and `0.1`. The pool is `rgba(201, 164, 106, 0.18) 0%, rgba(201, 164, 106, 0.06) 40%`. The floor is `rgba(201, 164, 106, 0.12)`. Dust is `oklab(0.926355 0.00167474 0.0172472 / 0.5)`. The vignette ends `color(srgb 0.054902 0.0509804 0.0470588 / 0.8) 100%`. No captured overlay `bg` text (the probe keeps the first 160 characters per child) contains `255, 255, 255`; P3 covers the full source. All values are as in `b-round-475/probe/probe-sketch.json` |
| C7 | WORDMARK + LOGO (both viewports) | `hold.word`, `after.logo` and `store.logo`; then `b-round-475/probe/contrast-wordmark.mjs <tag>` (run in your out-dir, after copying `probe-<tag>.json` and the `-hold-` PNGs there) | The loader wordmark is `rgb(201, 164, 106)`, weight 700, box 318×72, the same as HEAD. The header logo is `rgb(201, 164, 106)`, weight 800, on `/` and on `/store`. Wordmark contrast `ratioMedian` ≥ 4.5 (B's sketch: 7.55 / 7.56, K16) |
| C8 | TIMING UNCHANGED (record) | `b-round-458/probe/entrance-timing.mjs <base> 1440 900 3` [K19], on the tree | **record — not run on sketch: B ran the colour probes only** (L58): `coverMs` and `onAt`/`offAt` per run. C compares them with the SABA-B-13 contract: removal 1450–1900 ms from the first cover frame. A miss is reported with HEAD's run as the control, not as a FAIL of this colour round |
| C9 | HEADER, two brass (record) | `after-*.png` and `store-header-*.png` from the probe | Screenshots at both viewports, `/` and `/store`. Record the computed colours of the logo and the active "Collections" (B: both `rgb(201, 164, 106)`). Input for the DP gate, not pass/fail. Persistent text lines in the header are unchanged |
| C10 | JOURNEY (L54) | A fresh context on `/`: watch the entrance end, click a ProductCard → product page → back | The product page shows its own h1 and the brass logo. After back, there is no second entrance (once per tab). Screenshot each step |
| C11 | DOC 309 | Headings and l.4; each claim against the tests | TEMPLATE headings in order. l.4 exact. Every row id the doc names exists |
| C12 | AUTH | `/studio/middle-east` anonymous; `/api/studio-token?product=middle-east&file=x` with no bearer | "Sign in required" and 0 audio `src`; 401. The real-owner path is BLOCKED (backend unavailable in cloud) |
| gate | — | Full verify, code review, publish | Root. Not claimed |

**What could break nearby:**
- **The pre-hydration cover** (E rows and C5): it now reads `--color-background`, which is defined in `@theme`, as `--color-black` was in Tailwind's default.
- **The skip, reduced-motion and once-per-tab paths:** unchanged code, covered by the L/E rows in C4.
- **The legacy pages that render `Header`:** same component; C9 covers it.

## 3. After this round
1. **On C PASS:**
   - DPG-SPOTLIGHT-FIX is C-verified and awaiting the DP gate.
   - The DPG-LOGO header colour is done; its `font-serif` half waits for Q1.
   - GATE460-2, A-R460-REVIEW-5 and the portal-test signal close.
2. **The next planning:**
   - **REGRESSION-2026-11-13** first, if the date is 2026-11-13 or later (`regression-last.json` 2026-11-10). Its header row expects the brass logo (R59 superseded, D-29z1687).
   - Then **DPG-P0-3b** (DESIGN_SYSTEM.md and the `docs/design` reference docs).
   - Then **RETRO 480**, which falls due by round count.
   - After P0, root re-runs the DP gate.
3. **Root, non-blocking:**
   - ROOT-REQ-DPG-PRIMITIVES-PATCH (text ready in `b-round-475/root-primitives-patch.md`);
   - ROOT-REQ-NAV-LOADING-BAR-RENDER;
   - ROOT-REQ-DPG-GATE-REPORT.
