# Round 501: DPG-BUTTON-CLEANUP-2 stage 2b-2. Move the free-downloads "Download", newsletter "Subscribe" and Hire Us "Send Message" buttons onto `Button`

**Planned by:** B, at the round 500 → 501 planning on 2026-11-13/14 (`b-round-500.md`).
- **Advisor:** available; consulted after orientation and at the closing check.
- **Archive:** the round-500 task is archived as `tasks/round-500.md`, a byte-identical copy (`cmp` rc 0).

## Decisions (`backlog.json` v495, `decisions_log_b`)
- **D-29z1797: round 500 is accepted, from C's evidence only.**
  - `c-round-500.json` is PASS with `browserVerified` and `realVerified` true and 0 bugs. Gate 500 is `published` at `462570e` [K19].
  - Stage 2b-1 is verified.
  - Six ids close: B-R498-DOC320-L28, A-R499-CR-STORE-TRY-UNPINNED, A-R499-CR-PAIR-ORDER, A-R499-CR-TRYAGAIN-TYPE, A-R499-CR-DS-SAME-RULE and A-R499-CR-DOC321-WORDING.
  - C passed C11 in its core form only: the doc-ledger trace was not redone line by line. That is recorded as INFO-C500-DOC321-LEDGER-TRACE. This round's C11 does the full trace.
- **D-29z1798: gate 500's three review Lows map to existing ids** (L7):
  - `confirmedBy` on PD-R499-GHOST-HOVER-FAINT;
  - A-R500-CR-B2B5-COMMENT-ANCHOR, a new deferred Low from A's reviewer;
  - `confirmedBy` on B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML;
  - the architecture note goes as `confirmedBy` on SIG-R498-BUTTONLINK-WRAPPER.
- **D-29z1799: stage 2b-2 scope and mapping.**
  - **Scope:** the three inventory sites (`b-round-497/stage2-inventory.md` row A2): free-downloads "Download", the NewsletterSection submit and the hire-us submit, plus the ST5 pin.
  - **Mapping:** product-designer, `b-round-500/consult-product-designer.md`. Standalone CTAs are pills; form submits use the default shape.
  - **Not in scope:** "Send Download Link" (a white pill, not a brand fill) stays in NONBRAND.
- **D-29z1800: consults (L58).**
  - product-designer ruled the mapping.
  - tech-lead reviewed three versions of the sketch:
    - v1 (`b489d495…`): **CHANGES-REQUIRED**. One Medium: the B2B2-6 regex could not see the HEAD button shape. Three Lows. All four are fixed.
    - v2 (`baa0445a…`): **CHANGES-REQUIRED**, for doc 322 D1/D5 wording only.
    - v3 (`13624731…`): **APPROVE**. B's closing check then found that its D5 doc line was false, because the shadow is measured in the probe JSONs.
    - v4 (`acb11d51…`), the dispatched sketch: a doc-only fix (D5, the DESIGN_SYSTEM two-shapes sentence, mutant M31). **APPROVE**.
  - All three reviews are in `b-round-500/sketch-review.md`.
  - TL-R501-FD-ARIA-CONTROLS goes to `deferred_low_polish`.
  - **No architecture checkpoint:** small change, one owner. SIG-R498-BUTTONLINK-WRAPPER is re-evaluated at 2b-3.
- **D-29z1801: two product-designer questions go to Saba** (`user-review/questions-round-501.md`), both `awaiting_user` and neither blocking:
  - should the newsletter and Hire Us inputs move to `rounded-md`?
  - should NONBRAND's "Send Download Link" become `secondary`?

## Rules
- **Read `lessons.md` first.** Applied here: L1, L4, L7, L10, L11, L12, L22, L23, L26, L28, L31, L47, L52, L54, L56, L57 and L58.
- **STOP threshold (L10):** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch;
  - one of A's numbers differing from B's expected value in §3.
- **The sketch writes every granted byte, doc 322 included.** A writes no prose this round.
- **Ruling lines (L4):**
  - NL height: `className="h-14"` wins over `lg`'s 48 px. The builder sets no `h-*`, and the button must equal the 56 px email field [K5].
  - NL and HU shape: the product-designer form-submit rule (default `rounded-md`) wins over the DESIGN_SYSTEM "Store CTA = pill" row. DESIGN_SYSTEM's default row now names these two submits.
  - Busy hover: `Button`'s disabled `pointer-events-none` [K9] wins over HEAD's busy hover colour. The busy fill is rest brass.
  - FD `type="button"`: the Download button is not inside a form [K3], so the attribute does not change behaviour.
  - Copy: the busy texts "Subscribing..." and "Sending..." win over `Button`'s `isLoading` "Loading..." [K7, K9]. `isLoading` is not used.
- **Pre-ruled Lows:** a re-raise is listed "For B" and is not a STOP.
  - #1 there is no `aria-controls` on FD (TL-R501-FD-ARIA-CONTROLS).
  - #2 the spinner pixel size is not pinned in jsdom; C's busy rows read the box. The reviewer agreed.
  - #3 the five literal oracles duplicate the builder on purpose. B2B2-0 proves they are equal.
  - #4 the brace-aware `openingTags` is a copy of the IL3 scanner in `store-internal-links.test.ts`. Sharing it is a later helper extraction, not this stage.
  - #5 the success, error and `loading` branches of the three forms are unchanged code and are not part of the button contract.
  - #6 doc 322 lists D5 before D4.
  - #7 the disabled builder output keeps both `cursor-pointer` and `cursor-not-allowed` (pre-existing in the builder; `pointer-events-none` removes the cursor anyway).
  - #8 the inline `style`, the JSX comments and the Biome label warning in `hire-us.tsx` are pre-existing and untouched.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.
- **Out of scope:** Studio (`/studio-lab`) and the Ableton check. This is a Store round.
- **Persistent screen text (L39):** nothing is added. Labels are unchanged; `aria-expanded` is not visible.
- **Purchase protection:** no auth, cart, checkout or download logic changes. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.

## Baseline
HEAD is `462570e` [K1] (gate 500 `commit`). The worktree is clean [K2]. Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-500/r501-tree-sha256.txt`: every tracked file outside the five granted tracked paths (1,406 files [K21]).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files.
3. Before applying: `b-round-500/r501-pre-sha.txt` (the five granted tracked paths at HEAD).
4. After applying: `b-round-500/r501-post-sketch-sha.txt`, which covers the seven paths, doc 322 and the new test included.

B checked that applying the patch to a `git archive` copy of HEAD reproduces check 4 and keeps check 1 rc 0.

## 0. Why this round
- Saba's DPG item 7 says "Use Button.tsx component only". Stages 1, 2a and 2b-1 are done. Stage 2b-2 moves the three `<button>` sites with a solid brass fill. Each site keeps its label, position and behaviour, and takes the shared `Button`.
- **REGRESSION is not due:** the last one was 2026-11-13, and the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference: how premium stores style form submits and CTAs
Carried from `tasks/round-499.md` §1:
- direction A, "a brass pill";
- the Artlist and Epidemic pill CTAs;
- `docs/technical/store-redesign/direction-decision.md`.

This round adds one source and one deviation.
- **Source:** DESIGN_SYSTEM's radius token comment, `--radius-md` 8px "Buttons (dialogs, Studio), inputs; Store CTAs use pill" [K26]. The existing account primary `lg` `fullWidth` submit uses the default shape [K10].
- **Store rule:** standalone CTAs are pills, and form submits share the inputs' family of shape (product-designer).

| Point | Reference / rule | CZABA after this round | Deviation (reason) |
|---|---|---|---|
| Standalone CTA (FD "Download") | brass pill (direction A) | primary `lg` pill | D1: 50 → 48 px, weight 500 → 600, width 150 → 152 (the shared `lg` pill) |
| Form submit beside a field (NL) | same height as the field, same shape family | primary `lg`, `h-14`, 8 px radius | D2: the radius is 8 px against the field's 12 px. There is no class merge, and the field radius is a Saba question (D-29z1801) |
| Full-width form submit (HU) | full width under the fields | primary `lg` `fullWidth`, 8 px | D3: 58 → 48 px, 16 → 8 px radius |
| Busy | copy unchanged, the control disabled | disabled, opacity 0.5, a dark `Loader2` | D2/D3: no hover while busy |
| Press / shadow | — | `active:opacity-90`, `shadow-sm` | D5: new on all three |
| Keyboard focus | the shared ring (SABA-B-4) | unchanged ring, `:focus-visible` only | none |

## 2. What changes: sketch `b-round-500/sketch-501.patch.txt`
sha256 `acb11d513566038107f566557df86d92de04d66b2219c3da4c8670ee1e730c58` (`b-round-500/sketch-sha.txt`). v1–v3 are superseded; see `sketch-sha-history.txt`.

| File | Change |
|---|---|
| `app/routes/free-downloads.tsx` | "Download" [K3]: raw `<button>` → `<Button type="button" size="lg" shape="pill" aria-expanded={isExpanded} onClick=…>`. Children unchanged. `import { Button } from '~/components/ui';` |
| `app/components/home/NewsletterSection.tsx` | Submit [K4]: → `<Button type="submit" size="lg" disabled={isSubmitting} className="h-14">`. The busy `Loader2` gains `motion-reduce:animate-none`. Barrel import |
| `app/routes/hire-us.tsx` | Submit [K6]: → `<Button type="submit" size="lg" fullWidth disabled={isSubmitting}>`. The white `div` spinner becomes `<Loader2 size={18} className="animate-spin motion-reduce:animate-none" />`. `Loader2` import, barrel import |
| `app/lib/__tests__/store-theme-tokens.test.ts` | ST5 hire-us pin [K8]: `toHaveLength(1)` on the `bg-brand w-full rounded-xl` attribute → 0 `bg-brand` attributes in the file, plus `toContain` on the exact `<Button …>` line. No assertion is lost; the dark text is already asserted by the primary-variant tokens in the same row |
| `app/lib/__tests__/store-button-cleanup-2b2.test.tsx` (new) | B2B2-0 to B2B2-7: five literal oracles = builder; FD three cards (class, type, `aria-expanded`, icon then label, not in a form); FD open/close per card; FD enabled while another form submits; NL idle → busy (fresh element, L52); HU idle → busy; brace-aware per-file scan (0 raw brass `<button>`, 1 `<Button`); a scanner self-test on the HEAD shape [K14] |
| `docs/design/DESIGN_SYSTEM.md` | shape table: the default row names the two Store form submits, and the pill row adds free downloads' "Download" [K16]. The two-shapes sentence below the table now names the form submits at 8 px [K27] |
| `docs/implementation/2026/quarter-IV/322-dpg-button-cleanup-stage-2b-2.md` (new) | l.4 `In Progress (stage 2b-2 of DPG-BUTTON-CLEANUP-2; C round 501 PASS)` [K15]; 7 TEMPLATE headings; ledger `b-round-500/doc-ledger.md` |

**Sweep (L23)** [K12]:
- The labels, removed tokens and module paths hit 8 test-root files. Each one runs green on the sketch, either in the covering set or in the full suite.
- The e2e locators find `button[type="submit"]` with the text Subscribe [K13], and `type="submit"` is kept.
- The scanner goes from 109/44 to 104/41 [K11] (`b-round-500/scan-sketch.txt`).

**L31 timeout headroom** [K18]: no covering test is above 50 % of its timeout.
- BC1b: 1,853 ms at gate 500, 1,891 ms in B's covering run, against the 5 s default.
- HE5:
  - 1,551 ms in B's covering run against the 5 s default (31 %);
  - its file takes 1,466 ms in B's full-suite run (`precheck-full.log`);
  - alone it takes 218 ms at HEAD and 565 ms on the sketch (`b-round-500/he5-alone.log`). The barrel import adds load time.

  A's HE5 time above 2,500 ms is a STOP.

## 3. A: what to implement
1. From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-500/sketch-501.patch.txt`, then `git apply` on the same path;
   - run check 4 and check 1 again (rc 0).
2. **Grants:** the 7 files in the §2 table, exactly as the sketch writes them. Nothing else changes.
3. **Run.** Save the logs under `a-round-501/` with the names doc 322 cites. Each expected value is B's sketch output, and a difference is a STOP:
   - `npm run typecheck`: rc 0 (`typecheck.log`; B: `b-round-500/precheck-tsc.log`).
   - `npm run lint`: rc 0, "Found 179 warnings." (`lint.log`; B: `precheck-lint.log`).
   - `npx biome check app/routes/free-downloads.tsx app/routes/hire-us.tsx app/components/home/NewsletterSection.tsx app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/store-button-cleanup-2b2.test.tsx`: rc 0, 1 warning (`biome-scoped.log`; B: `precheck-biome.log`).
   - `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-500/covering-files.txt)`: 15 files, 179/179 (`covering.log`; B: `precheck-covering.log`). HE5 must stay ≤ 2,500 ms.
   - The code-reviewer on the whole change against `462570e`. The 3+ file rule applies; give it `git diff 462570e` and the two untracked files.
   - Not run by A: the full suite and the build. B ran them on the sketch (`precheck-full.log`: 298 files / 4,337 tests rc 0; `precheck-build-sketch.log`: rc 0).
4. Write `a-round-501.md` with the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-501.md`, `c-round-501.json` and `c-round-501/progress.json` as it goes, with the heaviest rows first (L59).

**Environment:**
- **Mock API:** `node mock-api/server.mjs` from the loop folder (the home page needs it). Stop it by exact PID with `ps -eo pid,args | awk '$2=="node" && $3=="mock-api/server.mjs"{print $1}'`, never `pkill -f`.
- **Harness:** `BASE=http://127.0.0.1:5173 node /home/runner/czaba-project/tmp/studio-real-loop/b-round-500/probe/measure-501.mjs <c-round-501/after> after`. Warm each page once in a browser first (L38).
- **Journey:** `BASE=http://127.0.0.1:5173 node …/b-round-500/probe/nav-501.mjs <c-round-501/after> after`.
- **Oracles:** `b-round-500/probe/sketch/sketch.json` and `sketch.out`, and `b-round-500/probe/sketch-journey.out`. The HEAD values are in `head.out` and `head-journey.out`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 5 modified (`free-downloads.tsx`, `hire-us.tsx`, `NewsletterSection.tsx`, `store-theme-tokens.test.ts`, DESIGN_SYSTEM.md) and 2 untracked (the 2b-2 test, doc 322). Checks 1, 2 and 4 rc 0 |
| C1 | REST (1440×900, 1280×720, 375×812) | the 3 targets in `measure-501.mjs` | Each field equals `sketch.json`, with boxes ±1 px. All: bg `rgb(201, 164, 106)`, text `rgb(14, 13, 12)`, 16px / 600, padding 12px 24px, `boxShadow` not `none` and ending `rgba(4, 5, 6, 0.3) 0px 1px 2px 0px` (HEAD: `none`). FD: 3 buttons, 152×48, radius `9999px`, `type` `button`. NL: 124×56 at 1440 and 1280, radius `8px`, `type` `submit`, height = field height (56). HU: 832×48 at 1440 and 1280, 311×48 at 375, radius `8px`, `type` `submit` |
| C2 | HOVER | Hover each target | bg `rgb(217, 184, 127)` on all three (HEAD FD and HU: `bg-brand/90`) |
| C3 | FOCUS + PRESS (1440, 1280) | Keyboard Tab to each target, then a mouse press after a blur | Keyboard: `:focus-visible` true, outline solid, offset 2px, ring seen in at least 3 viewed crops (`after-*-focus-*.png`). Press: `:focus-visible` false, outline `none`, opacity about 0.9 |
| C4 | BUSY (1440, POST held) | `measure-501.mjs` busy rows | NL: "Subscribing...", disabled, opacity 0.5, `pointer-events` none, bg `rgb(201, 164, 106)`, height 56, svg colour `rgb(14, 13, 12)` with `animate-spin motion-reduce:animate-none`. HU: "Sending...", the same values, 832×48, and 0 `border-white` elements in the form. One screenshot each |
| C5 | STACK (375×812) | rest rows, plus C's own read of the 2nd and 3rd FD buttons (the harness measures only the first) | NL button 343×56, top 68 px below the field's top (field 280, button 348 in `sketch.out`); FD 152×48 on all 3 cards; HU 311×48; labels on one line |
| C6 | CONTRAST | `restContrast` / `hoverContrast` | rest 8.32 and hover 10.28 on all three. A failure is a Medium |
| C7 | JOURNEY (L54, 1440) | `nav-501.mjs` | 6 steps with no `error` and the paths `/`, `/free-downloads` ×3, `/hire-us` ×2. NL busy "Subscribing..." with opacity 0.5. Free Samples link → `/free-downloads` with 3 Download buttons. Keyboard Enter on Download: `aria-expanded` "true", "Send Download Link" ×1, focus stays on Download. Send-link busy: "Sending...", the Download buttons not disabled. HU busy "Sending...". `errors` `[]` (env errors filtered). One screenshot per step |
| C8 | GREP | `python3 -I b-round-497/scan-brand.py . /tmp/s.json` from `store/`; `grep -c '<Button' <3 files>` | `104 hits; 41 solid`; 1, 1, 1 |
| C9 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-500/covering-files.txt)` | 15 files, 179/179; the B2B2-0…B2B2-7 lines present; HE5 ≤ 2,500 ms |
| C10 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules`, `.git` and `build`) to a folder outside `store/`, symlink `node_modules`, then run `python3 -I b-round-500/mutants-501.py <copy> <c-round-501/mutant-logs>` | M1–M20, M26–M28, M30 and M31 all RED, each on the rows in `b-round-500/mutants-501-failing-rows.txt` (M31 on ST5 only) |
| C11 | DOCS | `git diff 462570e -- docs/design/DESIGN_SYSTEM.md`; doc 322 | DESIGN_SYSTEM: exactly 3 changed lines: the default and pill rows of the shape table, and the two-shapes sentence. Doc 322: the 7 headings (L26 subsequence) and l.4 byte-equal to `In Progress (stage 2b-2 of DPG-BUTTON-CLEANUP-2; C round 501 PASS)`. **Full trace:** every row of `b-round-500/doc-ledger.md` checked against its source (INFO-C500). `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 |
| C12 | CLAIMS | `bash b-round-500/claims-501.sh` (default tree), compared with `b-round-500/claims-501-sketch-output.txt` | No `MISSING`. Output identical except K1 (HEAD may move to the loop-state commit), K2 (the sketch scratch reads the store's status line) and K23 locations (archive moves) |
| C13 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link; `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each); check 2 rc 0 |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-501.json c-round-501/l57-check.txt` | As C0; rc 0. The JSON carries all L57 fields. `mutantRedOnSketch` names `b-round-500/mutants-501.txt` |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Neighbours that could break:**
  - the e2e Subscribe locators (C1 `type`, K13);
  - the free-downloads email form and its "Send Download Link" (C7);
  - the hire-us success message (unchanged code);
  - the home page sections around the newsletter (C1 boxes);
  - ST5's other fills (C9).
- **L22:** if A STOPs, C runs C0, C12 and C14 only.
- **Closing:** with C PASS and `browserVerified` true, DPG-BUTTON-CLEANUP-2 stage 2b-2 is verified.

## 5. B's pre-check (on a scratch copy of HEAD plus the sketch, outside `store/`)
| Check | Result | Log |
|---|---|---|
| tsc / lint / Biome on 5 code and test files | rc 0 / rc 0, 179 warnings / rc 0, 1 warning | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log` |
| Covering tests | 15 files, 179/179 | `precheck-covering.log` |
| Full suite on the sketch tree (code and tests equal to v4) | 298 files / 4,337 tests, rc 0 | `precheck-full.log` |
| Build on the final v4 tree (docs included) | rc 0; CSS `app-B4X5hQCC.css` | `precheck-build-sketch.log` |
| Browser, HEAD vs sketch (a second dev server on :5174 with its own `cacheDir`) | as §1 and C1–C7 | `probe/head.out`, `probe/sketch.out`, `probe/*-journey.out`, screenshots in `probe/head/`, `probe/sketch/` |
| Mutants | M1–M20, M26–M28, M30 and M31 all RED | `mutants-501.txt`, `mutants-501-failing-rows.txt`, `mutant-logs/` |
| Scanner | 104/41 | `scan-sketch.txt` |
| Patch reproduces the tree | `git apply` on a `git archive` copy of HEAD: check 4 equal to the scratch, check 1 rc 0 | (this table) |
| Sketch review | tech-lead v1 and v2 CHANGES-REQUIRED, fixed; v3 APPROVE, superseded by a doc fix; **v4 APPROVE** on the dispatched sha | `sketch-review.md` |
| Claims | HEAD and sketch outputs, no MISSING | `claims-501-planning-output.txt`, `claims-501-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **2b-3:** recordings "Create a scene", cart and StudioShowcase. Re-evaluate SIG-R498-BUTTONLINK-WRAPPER there. Fix A-R500-CR-B2B5-COMMENT-ANCHOR there if that test file is touched.
3. **2c:** PurchaseHeader. **2d:** chat. **2e:** LeadMagnet (keep-list restyle). Then **NONBRAND** (including "Send Download Link") and **PD-R498-404-SECONDARY-ALIGN**.
4. **Then the rest of DPG P1** (CSS-DEDUP, COLOR-CONSOLIDATE, FONT-RESOLVE), the DP-gate re-run with root, and P2. The next RETRO is round 510.

## Claims (`b-round-500/claims-501.sh`; planning output `claims-501-planning-output.txt` on HEAD, sketch output `claims-501-sketch-output.txt` on the scratch)
K1 HEAD · K2 worktree counts · K3 FD Download class / aria-expanded · K4 NL submit class / Button line · K5 NL field h-14 · K6 HU submit class / white spinner / Button line · K7 busy copy · K8 ST5 pin old/new · K9 Button lg / default shape / Loading... / disabled classes · K10 account.tsx precedent · K11 scanner · K12 SWEEP · K13 e2e locators · K14 new rows + barrel imports · K15 doc 322 l.4 + headings · K16 DESIGN_SYSTEM phrases · K17 pending grep · K18 L31 timings · K19 gate 500 · K20 c-round-500 L57 · K21 frozen list sizes · K22 artifacts · K23 ids · K24 l58 · K25 FD items + Send Download Link class · K26 DESIGN_SYSTEM radius-md comment · K27 DESIGN_SYSTEM two-shapes sentence.
