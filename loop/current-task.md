# Round 477: DPG-P0-3a re-dispatch, the entrance loader and the header logo in Obsidian & Brass (R1 ruled)

**Planned by:** B, at the round 476 → 477 planning on 2026-11-12 (`b-round-476.md`).
- **Advisor:** available, and consulted after orientation.
- **Archive:** the round-476 task is `tasks/round-476.md` (byte-identical, `cmp`).
- **What this round is:** the round-476 acceptance, run in full on the tree A already left. Round 476 stopped on the code-reviewer finding R1 before C could run any browser row. The R1 ruling (L10) is below. No feature scope changes.

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1688: ruling on R1 (C-R476-STOP-R1, A's STOP).** The tree is accepted as is.
  - **The finding:** `SpotlightLoader.tsx` paints the overlay twice, with an inline `backgroundColor` style and a child `bg-background` layer [K21].
  - **Why it is accepted:**
    - Both parts were already at HEAD, as inline `'#000'` plus a child `bg-black` [K22]. The sketch changed their colour only.
    - The render is identical; the reviewer said the same, and C confirmed it in source.
    - `pd-p0-3a.md` ruling 1 names the inline style as a place to recolour.
  - **Severity:** the reviewer called it Medium; B rates it **Low**. It is a pre-existing Tailwind-first duplication with no visible, functional, a11y or security effect, and this round did not introduce it.
  - **Where it goes:** `deferred_low_polish`, as `A-R476-REVIEW-R1-OVERLAY-DUP`. It is also a named row candidate for DPG-CSS-DEDUP (P1 item 9), on the "next SpotlightLoader owner" list (D-29z1686).
  - **The D-29z1683 STOP clause stays as it is:** an unruled Medium on a byte-equal file is still a STOP (L22, the gate never publishes an unruled Medium). R1 is now ruled. When A cites it by this D-ID, it is **not** a new STOP.
- **D-29z1689: round 476 result.** C short FAIL (L22): C1, C2 and C12 (anonymous) PASS. C3–C11 were not run, and `browserVerified` is false (`c-round-476.json`).
  - DPG-P0-3a stays **მუშავდება**.
  - GATE460-2, A-R460-REVIEW-5 and the portal-test signal stay open until C passes this round.
  - Reviewer Lows R2–R6 go to `deferred_low_polish` (A-R476-REVIEW-LOWS). R7 is A's fix to doc 309; C checks it in C11.
  - The Architecture note (signal 4, `dustParticles` state kept in place) is recorded as an architecture signal, not a task.
- **D-29z1690: prevention.** For a sketch granted byte-equal, B's `tech-lead` sketch review explicitly covers project-rule compliance on every line the sketch touches or recolours: Tailwind-first, inline styles and duplicate layers. The task rules each finding before dispatch. This is lesson L10's new clause, and it is recorded in `retro_candidates` for RETRO 480.

## Rules
- **Read `lessons.md` first,** in particular L10, L11, L22, L28, L29, L31, L54, L56, L57 and L58.
- **Claims (L29):** `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-476/claims-477.sh`.
  - B's output on the tree as A left it is `b-round-476/claims-477-planning-output.txt`.
  - The allowed output after A is `b-round-476/claims-477-allowed-deltas.txt`. It is the script's output on B's scratch copy, made with A's doc edit (L56).
  - The last line is `L58 OK`. This task dispatches no sketch.
- **Screen budget (L39):** nothing new becomes permanently visible.
  - The header wordmark and the transient loader change colour only.
  - Persistent text lines are unchanged.
- **One element, one rule (L4):** as in round 476. The header wordmark is brass, under D-29z1685 and D-29z1687.
- **A reviewer finding on the unchanged sketch files** is handled under D-29z1683, plus D-29z1688 for R1.

## Baseline
- **HEAD `edeba5a`.** Gate 476 was skipped (C FAIL), so HEAD is still gate 475's commit.
- **The working tree is preserved from round 476** [K1]:
  - the 5 sketch files, equal to `b-round-475/sketch-476-files-sha256.txt` [K2];
  - the new doc 309.
- **The sketch is already applied** [K2b]. A must not apply it again.

### Grants (exactly these paths)
| Path | What |
|---|---|
| `docs/implementation/2026/quarter-IV/309-dpg-p0-3a-entrance-logo-brass.md` | A's own file from round 476. Two edits only: (1) l.4 becomes exactly `**სტატუსი:** In Progress (stage 3 of 4; C round 477 PASS)` (L28 re-dispatch); (2) one Problem → Solution entry under „პრობლემები და გადაწყვეტები“ for R1, naming `D-29z1688` exactly once in the file, in Georgian, 1–3 lines [K23][K24] |

**Unchanged and byte-equal to the sketch:**
- `app/components/loading/SpotlightLoader.tsx` [K2]
- `app/components/loading/EntranceCover.tsx` [K2]
- `app/components/layout/Header.tsx` [K2]
- `app/lib/__tests__/store-entrance-loader.test.tsx` [K2]
- `app/lib/__tests__/store-header-footer.test.tsx` [K2]

**Every other file is also unchanged:** `app/styles/**` [K9], `Footer.tsx` [K10], the protected files [K9] and the keep-list components.

## Reference
This is a colour-only round, so there is no reference product for behaviour. The Store reference is direction A, Obsidian & Brass (`/home/runner/czaba-project/docs/technical/store-redesign/direction-decision.md`). The palette ruling is `b-round-475/pd-p0-3a.md`.

**Deviations** (unchanged from round 476):
1. `font-serif` is not added; it is SABA-Q-DPG-LOGO-FONT-SERIF.
2. The loader wordmark stays `font-bold`.
3. Two brass items in the `/store` header go to the DP gate.

## 1. A: steps
1. **STOP (L11)** if `claims-477.sh` K1/K2/K2b differ from `b-round-476/claims-477-planning-output.txt`:
   - HEAD `edeba5a`;
   - 6 status lines;
   - 5 of 5 `sha256sum -c` OK;
   - reverse-check rc 0.

   Read `GEORGIAN_DOCS.md`.
2. **Edit doc 309,** the two grant edits only.
3. **Run the claims script** and save its output to `a-round-477/claims.txt`. It must be byte-equal to `b-round-476/claims-477-allowed-deltas.txt`.
4. **Checks.** No source file changes, so A runs only:
   - `npm run typecheck`;
   - `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-475/covering-476.txt)` (16 files), logged to `a-round-477/`.

   Mutants are not re-run by A (round 476 did: `a-round-476/mutants/summary.txt`); C runs them on its own copy. The full suite belongs to the gate.
5. **Code-reviewer** is not re-run on the 5 unchanged files. Do not open a new STOP for R1 (D-29z1688).
6. **Report** in `a-round-477.md`.

## 2. C: what to verify
**Files.** Write `c-round-477.md`, `c-round-477.json` (all L57 fields, including `mutantRedOnSketch` = `b-round-475/mutants/b-run/summary.txt`) and `c-round-477/progress.json` as you go.

**Setup:**
- Start the mock API with `node $(realpath mock-api/server.mjs)` from the loop folder if `:5199` does not answer.
- **Warm the server first:** `b-round-475/probe/warm.mjs <base>` (L38).
- **The probe:** `b-round-475/probe/probe-entrance.mjs <base> <tag> <outDir>`. It uses a fresh context per viewport and stubs only the LeadMagnet; the entrance must play.
- **Never run vitest alongside a probe.**

The child indices in the probe (`hold.kids[n]`) are unchanged, because the tree is the sketch.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE | `git status --short --untracked-files=all` and the protected list | Only the 6 round-476 paths changed. The 5 sketch files equal `b-round-475/sketch-476-files-sha256.txt`. K9 = 0 |
| C2 | CLAIMS | `bash b-round-476/claims-477.sh` | Byte-equal to `b-round-476/claims-477-allowed-deltas.txt`; last line `L58 OK` |
| C3 | TESTS-MEAN-SOMETHING | Read P1–P4 and N3c. Run `python3 -I b-round-475/mutants/mutants.py <your cp -a copy> c-round-477/mutants` | 12 of 12 RED, with the same rows as `b-round-475/mutants/b-run/summary.txt`; no `NOT-APPLIED`. Each new row has a mutant that turns it red |
| C4 | UNIT | `npx vitest run $(cat b-round-475/covering-476.txt)` | 16 files pass. `store-entrance-loader` stays under 50 % of the default timeout (L31) |
| C5 | HAND-OFF COLOUR (both viewports) | `probe-<tag>.json`: `cover[].before`, `hold.overlayBg`, `hold.kids[0].bgc`, `after.bodyBg` | Every non-null cover sample, the overlay, its base layer and `body` after exit are all `rgb(14, 13, 12)`. HEAD control: `rgb(0, 0, 0)` (`b-round-475/probe/probe-head.json`) |
| C6 | LIGHT, DUST, VIGNETTE (both viewports) | `hold.kids[1..3].bg`, `hold.dustBg`, `hold.kids[6].bg` | All values are as in `b-round-475/probe/probe-sketch.json`. The cone is `rgba(201, 164, 106, 0.04)` / `0.1`. The pool is `0.18` / `0.06`. The floor is `0.12`. Dust is `oklab(0.926355 0.00167474 0.0172472 / 0.5)`. The vignette ends `color(srgb 0.054902 0.0509804 0.0470588 / 0.8) 100%`. No captured overlay `bg` contains `255, 255, 255` |
| C7 | WORDMARK + LOGO (both viewports) | `hold.word`, `after.logo`, `store.logo`; then `b-round-475/probe/contrast-wordmark.mjs <tag>` in your out-dir | The loader wordmark is `rgb(201, 164, 106)`, weight 700, box 318×72. The header logo is `rgb(201, 164, 106)`, weight 800, on `/` and `/store`. `ratioMedian` ≥ 4.5 (B: 7.55 / 7.56, `b-round-475/probe/contrast-wordmark.json`) |
| C8 | TIMING (record) | `b-round-458/probe/entrance-timing.mjs <base> 1440 900 3` | **record:** `coverMs`, `onAt`/`offAt` per run, against SABA-B-13 (removal 1450–1900 ms from the first cover frame). A miss is reported with a HEAD control run, not as a FAIL of this colour round |
| C9 | HEADER, two brass (record) | `after-*.png`, `store-header-*.png` | Both viewports, `/` and `/store`. The computed colours of the logo and the active "Collections" link, as DP-gate input. Persistent header text lines are unchanged |
| C10 | JOURNEY (L54) | A fresh context on `/`: the entrance ends → click a ProductCard → product page → back | The product page shows its h1 and the brass logo. After back there is no second entrance. Screenshot each step |
| C11 | DOC 309 | Headings, l.4 [K23] and the R1 entry [K24] | TEMPLATE headings in order. l.4 is exactly `**სტატუსი:** In Progress (stage 3 of 4; C round 477 PASS)`. The R1 entry names `D-29z1688`. Every row id the doc names exists (grep), including R7's "which rows pin what" text |
| C12 | AUTH | `/studio/middle-east` anonymous; `/api/studio-token?product=middle-east&file=x` with no bearer | "Sign in required" and 0 audio `src`; 401. `/studio-lab` opens anonymously as the demo. The real-owner path is BLOCKED (backend unavailable in cloud) |
| gate | — | Full verify, code review, publish | Root. Not claimed |

**What could break nearby:**
- the pre-hydration cover (`--color-background`);
- the skip, reduced-motion and once-per-tab paths (the L/E rows in C4);
- the legacy pages that render `Header` (C9).

**R1** is ruled (D-29z1688). C does not fail the round on it; C records it as known.

## 3. After this round
1. **On C PASS:**
   - DPG-SPOTLIGHT-FIX is C-verified and awaits the DP gate.
   - The DPG-LOGO header colour is done; its `font-serif` half waits for Q1.
   - GATE460-2, A-R460-REVIEW-5 and the portal signal close.
2. **The next planning:**
   - **REGRESSION-2026-11-13** first, if the date is 2026-11-13 or later (`regression-last.json` is 2026-11-10). Its header row expects the brass logo (D-29z1687).
   - Then **DPG-P0-3b**, the design reference docs (scope and counts: `b-round-475/scan/docs-design-counts.txt`).
   - Then **RETRO 480**.
   - After P0, root re-runs the DP gate.
3. **Root, non-blocking:**
   - ROOT-REQ-DPG-PRIMITIVES-PATCH;
   - ROOT-REQ-NAV-LOADING-BAR-RENDER;
   - ROOT-REQ-DPG-GATE-REPORT.
