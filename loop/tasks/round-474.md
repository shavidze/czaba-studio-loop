# Round 474: DPG-FIX P0 stage 1 (DPG-P0-1): no teal left in the Store, gradient and glow tokens brass

**Planned by:** B, at the round 473 → 474 planning on 2026-11-12 (`b-round-473.md`).
- The advisor was available and consulted after orientation.
- `tech-lead` reviewed the sketch: APPROVE with three test changes, all adopted (`b-round-473/sketch-review.md`).
- The round-473 task is archived as `tasks/round-473.md` (byte-identical, checked with `cmp`).

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1673: round 473 result.** C PASS, with `browserVerified` and `realVerified` true (`c-round-473.json`). Gate 473 published `58fc56e`.
  - STORE-2c-1 is **done**. Its browser evidence is C round 472 C1–C10, at the same `app.css` sha `d3af7582…` that `58fc56e` holds. Its doc evidence is C round 473.
  - C-R471-01 and C-R472-01 are closed.
  - DPG-FONT-RESOLVE stays open: 2c-1 is only its token half.
- **D-29z1674: DPG P0 inventory and stage split** (`b-round-473/dpg-inventory.md`).
  - The policy says about 100 teal values. Its "61" equals the hue-scan total of `app.css` at `a8599a2` (2026-11-11, before STORE-2b-3) [K15], so the review most likely read that older tree. `58fc56e` holds 41 hue-scan hits in all of `app/` [K3, K13]. Root is asked to name the commit the reviewers read (ROOT-REQ-DPG-GATE-REPORT).
  - P0 is split into three stages:
    - **P0-1 (this round):** teal, gradient and glow tokens, and the dead decorative tokens.
    - **P0-2:** the undefined tokens. These are live and visible.
    - **P0-3:** SpotlightLoader and the docs. These need `product-designer` and root's report.
- **D-29z1675: rulings for P0-1.**
  - **Replace teal in place with brass token references; do not delete the dead rules.** Saba's text asks for "brass token references", and dead rules go to the LEGACY-DEAD list (tech-lead APPROVE).
  - **The 5 gradient tokens and 2 glow tokens are redefined** from `var(--color-*)` (Saba's DPG-GRADIENT-TOKENS). Two of them deliberately collapse, and the doc records this:
    - `--gradient-accent` becomes equal to `--gradient-primary`;
    - `--color-glow-secondary` changes from orange to `--color-brand-hover`.
  - **The 7 decorative `--color-crystal-*` and `--color-premium-*` tokens are deleted** (0 readers [K6]). This is the token half of DPG-DECORATIVE-PURGE, pulled forward.
  - **The frozen legacy Studio teal stays and is listed, not edited.** It covers `components/studio/**` and both `studio.css` copies. It goes to Saba as SABA-Q-DPG-LEGACY-STUDIO-TEAL (`user-review/questions-round-473.md` Q1).
- **D-29z1676: StemsPlayerModal can never open.** `createDisplayVersions` never sets `stems`, so `PlayStemsButton` never renders [K5]. Its teal is swapped anyway, and the dead path is added to LEGACY-DEAD-STORE-COMPONENTS (signal SIG-R473-STEMS-PLAYER-DEAD).

## Rules
- **Read `lessons.md` first.** These apply especially:
  - L1 (inventory, scanner proved on mutants), L2 (token change, including the new DPG clause) and L4;
  - L10, L11, L12, L15, L23, L26, L28 and L29;
  - L56–L58.
- **Claims script:** `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-473/claims-474.sh`. B's output is in `b-round-473/claims-474-planning-output.txt`, ending in `L58 OK`. The 14 covering files are listed in `b-round-473/covering-474.txt` [K21].
- **Screen budget:** nothing visible changes on any reachable Store page. Every changed rule or token is either unread or applies to an element that never renders.

## Baseline
- **HEAD `58fc56e`** (gate 473 published), with a clean tree [K1].
- **Sketch:** `b-round-473/sketch-474.patch.txt`, sha `239e1da1…`. It applies to HEAD with rc 0 [K2]. The per-file sha256 values after applying it are in `b-round-473/sketch-474-files-sha256.txt`.

### Grants (exactly these paths)
| Path | What |
|---|---|
| `app/styles/app.css` | **Only the sketch's hunks, byte for byte.** It deletes the 7 decorative tokens and redefines the glow, `video-sync` and 5 gradient tokens. It also changes the 7 `rgba(19, 217, 204,` occurrences [K15] to `rgba(var(--color-brand-rgb),` and `hsl(175, 85%, 65%)` to `var(--color-brand-hover)`. The obsidian block and every other byte stay unchanged |
| `app/styles/base/utilities.css` | Only the sketch's 3 `.stems-loader-list` values |
| `app/components/audio/StemControl.tsx` | Only the sketch's Solo-active class: `bg-brand text-background shadow-md` |
| `app/components/audio/StemsPlayerModal.tsx` | Only the sketch's spinner class: `text-brand` |
| `app/lib/__tests__/store-live-teal.test.ts` | Test edits in §1 step 3 |
| `app/lib/__tests__/store-teal-sweep.test.ts` | Test edits in §1 step 3, plus the new HUE rows |
| `app/lib/__tests__/store-theme-tokens.test.ts` | Test edits in §1 step 3 |
| `app/lib/__tests__/helpers/style-scan.ts` | Only if the hue scanner is placed here. It must be a new export, and every existing export stays byte-identical |
| `docs/implementation/2026/quarter-IV/307-dpg-p0-1-teal-purge-brass-tokens.md` | A new doc that follows TEMPLATE. l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 3; C round 474 PASS)` (L28) |

**Unchanged:** every other file, in particular:
- the protected files (`root.tsx`, `components/studio/**`, `styles/studio.css`, `styles/pages/studio.css`, `public/**` and `.claude/**`);
- the keep-list components.

## Reference
Not applicable: there is no new behaviour. Scope comes from Saba's DPG-FIX P0 list (policy, 2026-11-12). Brand tokens: `--color-brand` `#c9a46a`, `--color-brand-hover` `#d9b87f`, `--color-brand-rgb` `201, 164, 106` (`app.css` @theme) [K17].

## 1. A: steps
1. **STOP (L11) if K1 or K2 differ from B's output.** Read `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
2. **Apply the sketch:** `git apply -p1 b-round-473/sketch-474.patch.txt`. This is a reviewed `git apply` sketch, which L60 allows. Then check the 4 file sha256 values against `sketch-474-files-sha256.txt`.
3. **Edit the three test files.** No assertion is lost; equal or stronger replacements are allowed (L4). B's scratch pre-run turns exactly LT3, LT5, LT7, TS2 and ST3 red, with 5 failed and 147 passed over 14 files [K4]. The edits:
   - **`store-teal-sweep`:**
     - remove the StemControl and StemsPlayerModal entries from `TEAL_ALLOW_LIST`, so only `StudioTrack.tsx` remains;
     - add both files to `GRANTED_TEAL_FREE_SOURCES`.
   - **`store-live-teal`:**
     - remove the `styles/app.css` and `styles/base/utilities.css` entries from `CSS_TEAL_ALLOW_LIST`, and every app.css and utilities.css entry from `TEAL_RULE_ALLOW_LIST`;
     - add a row asserting that both files have **0** teal hits;
     - keep LT6, the teal-token-read ban. The two `studio.css` entries stay at their exact counts.
     - **Replace LT7** (it needs at least 5 dead-labelled rules [K18]) with an assertion that no `dead`-labelled teal rule remains. Delete the dead-rule constants and helpers only where nothing else uses them.
   - **`store-theme-tokens`:**
     - remove the 7 decorative keys from `STORE_2B_EXEMPT_COLOUR_KEYS` and add a row asserting they are absent from `@theme`;
     - move `--color-glow-primary`, `--color-glow-secondary` and `--color-video-sync` from the exempt list to the checked keys, so ST3's count goes from 26 to 29 [K16];
     - **add GR1:** each of `--gradient-primary`, `--gradient-card`, `--gradient-hero`, `--gradient-accent` and `--gradient-glow` is built only from `var(--color-…)`, `rgba(var(--color-brand-rgb), …)`, `transparent`, keywords and percentages. It contains no `hsl(`, no `#` and no numeric `rgb(`.
   - **New HUE rows** (in `store-teal-sweep`, or in a new export in `helpers/style-scan.ts`):
     - **HUE1:** no colour literal with hue 160–200° (saturation ≥ 25 %, lightness 12–90 %) appears in non-test `app/**` sources (`.css`, `.ts`, `.tsx`), except the frozen list at exact counts: `components/studio/StudioTrack.tsx` 1, `styles/studio.css` 4, `styles/pages/studio.css` 4.
     - **HUE2 fixtures:** each form is caught. The forms are:
       - `#1dc`, `#13d9cc`, `#13d9cc80`;
       - `rgb(19 217 204 / 0.4)`, `rgba(19,217,204,.2)`;
       - `hsl(175deg 85% 46%)`, `hsla(175, 85%, 46%, 0.3)`;
       - `oklch(0.78 0.13 185)`, `hwb(175 8% 15%)`;
       - the named colours `teal`, `cyan`, `aqua`, `turquoise`, `darkcyan` and `lightseagreen` as CSS values;
       - `bg-teal-500`, `text-cyan-400`, `bg-[hsl(175_85%_46%)]`, `bg-[#13d9cc]`.

       These are **not** flagged: `#c9a46a`, `#d9b87f`, `rgba(var(--color-brand-rgb), 0.4)`, `#404040`, `hsl(38, 95%, 55%)`, a selector word such as `.slider-thumb-teal`, and the word "Cyan" in a comment.
     - **HUE3 (L52):** a mutant that adds `rgba(19, 217, 204, 0.2)` to `app.css` turns HUE1 red.
4. **Write doc 307** (TEMPLATE headings in order). Its TODO section names P0-2 and P0-3 and SABA-Q-DPG-LEGACY-STUDIO-TEAL.
5. **Run the checks** and save the logs to `a-round-474/`:
   - `npm run typecheck` and `npm run lint`;
   - `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-473/covering-474.txt)` (the 14 files of B's pre-run);
   - `npm run build`, which proves that the `@theme` compile works (tech-lead 3a). The full verify belongs to the gate.
6. **Record the mutants,** with each log under `a-round-474/mutants/`:
   - **HUE3** turns HUE1 red.
   - **M-GR1:** restoring `hsl(175` in `--gradient-primary` turns GR1 red.
   - **M-ST:** re-adding `--color-crystal-cyan` turns the decorative-absent row red.
   - **M-TS:** restoring `bg-teal-500` in StemControl turns TS1 or HUE1 red.
7. **Run `code-reviewer`** (3+ files). STOP only for a Medium or higher finding that needs a file outside the grant.
8. **Report in `a-round-474.md`:**
   - the files and their shas;
   - the test edits, with every removed assertion and its replacement;
   - the mutants;
   - the logs;
   - the reviewer findings.

## 2. C: what to verify
**Files.** Write `c-round-474.md`, `c-round-474.json` (all L57 fields) and `c-round-474/progress.json` as you go. Start the mock API with `node $(realpath mock-api/server.mjs)` from the loop folder if `:5199` does not answer.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE | `git status --short --untracked-files=all` and the protected manifest | Only the granted paths changed. The 4 source files equal `sketch-474-files-sha256.txt`. Protected files: 0 changes [K10] |
| C2 | HUE-SCAN (DPG rule 1) | Claims K13 (the hue scanner over the live `app/`) and K13b (the exact-value teal grep outside `__tests__`). Planning: 41 and 27. Also `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-473/scan/hue-scan-v2.py /home/runner/czaba-project/store/app <out>` for the per-file list | **K13 = TOTAL 20, K13b = 9, 0 colour hits outside the frozen list.** The listed residue is exactly `StudioTrack.tsx` 1 hsl, the two `studio.css` copies (4 hex each, plus selector words), `VideoPlayer.tsx` class words 2, and `ableton-export.ts` comment 1, as in `scan/app-counts-sketch.txt`. Any other hit is a FAIL |
| C3 | TESTS-MEAN-SOMETHING | Read the diff of the 3 test files. Re-run A's 4 mutants (HUE3, M-GR1, M-ST, M-TS) on a scratch copy | No assertion was dropped without an equal or stronger replacement. HUE2 has every listed form, positive and negative. Each mutant is red |
| C4 | UNIT | `npx vitest run $(cat b-round-473/covering-474.txt)` | All 14 files pass |
| C5 | BROWSER NO-CHANGE (1440×900 and 1280×720) | Screenshot `/`, `/store`, `/products/middle-east` and `/studio-lab` on the tree. Compare them with the same pages on a HEAD `58fc56e` build (L38: separate Vite `cacheDir`, or a `git archive` copy) | Same layout, and no new brass or teal areas. Differences only where animation or timing varies, each one explained. `/studio-lab` opens anonymously |
| C6 | BROWSER RULE PROBE | On `/store` (tree), inject test elements with `page.evaluate`: `<div class="stems-loader-list">`, `<button class="audio-preview-inline-button playing">` and `<div class="waveform-bar active">` | Computed `scrollbar-color`, `box-shadow` (during the animation) and `background-image` contain `rgb(201, 164, 106)` / `rgba(201, 164, 106` or `rgb(217, 184, 127)`, and no `19, 217, 204`. Record `getComputedStyle(documentElement)` for `--gradient-primary` and `--color-glow-primary`, which may be empty when Tailwind does not emit an unused token. That is a record, not an assert |
| C7 | CONTRAST (L15) | StemControl Solo active, `text-background` on `bg-brand`: compute it from the token hex values | ≥ 4.5:1. Recorded with the formula. The component cannot be reached in the browser [K5], so this row is arithmetic only and says so |
| C8 | DOC 307 + DPG rule 2 | Headings, l.4, and every claim against the test files (L26). Claim K19: the 15 changed or removed tokens named in `docs/design`, `.claude/primitives` or `docs/technical/architecture` | TEMPLATE headings in order. l.4 exact. The deliberate collapse (accent = primary, glow-secondary → brand-hover) is recorded. Frozen-list question named. No "pending". K19 stays 0, so no design doc describes a changed token. The brand-colour docs (`DESIGN_SYSTEM.md`, `DESIGN_TOKENS.md` l.9/l.26/l.108 [K14]) are P0-3 |
| C9 | AUTH | `/studio/middle-east` anonymous, and `/api/studio-token` with no bearer | "Sign in required", 0 audio `src`; 401. The real-owner path is BLOCKED (backend unavailable in cloud) |
| C10 | CLAIMS | `bash b-round-473/claims-474.sh` | Equal to `claims-474-planning-output.txt`, except K1 (status lines), K2b (now `reverse-ok`), K13 (20) and K13b (9). K10 stays 0. The last line is `L58 OK` |
| gate | — | Full verify, code review, publish | Root. Not claimed |

**What could break nearby:**
- The Tailwind `@theme` compile, if a `var()` is misplaced. A's build and C5 cover this.
- Test-helper exports used by other suites. C4 covers this; the gate runs the full suite.
- The legacy Studio stems loader scrollbar colour changes from teal to brass, on a page that needs sign-in. C6 proves the rule. The page itself is backend-blocked.

## 3. After this round
1. **On C PASS:** DPG-P0-1 is C-verified. Its DPG ids become **"awaiting DP-gate re-review"**, not მზადაა (Saba's design-gate rule 4).
2. **The next planning:**
   - if it is dated 2026-11-13 or later: REGRESSION-2026-11-13 first;
   - then **DPG-P0-2:** the undefined tokens (`--primary-hue`, `--radius-xs`, `--color-text-primary`, and ProductCard `bg-primary`/`text-primary-foreground`). That stage needs `product-designer` and browser rows, and its docs land in the same round (DPG rule 2);
   - then **DPG-P0-3:** SpotlightLoader and the docs, followed by root's P0 re-review.
3. **Root, non-blocking:**
   - ROOT-REQ-DPG-GATE-REPORT (now with the commit history);
   - ROOT-REQ-DPG-PRIMITIVES-PATCH (`DESIGN_TOKENS.md` l.9, l.26 and l.108 [K14]);
   - ROOT-REQ-DP-GATE-FIRST;
   - RETRO 480.
