# Round 512: DPG-BUTTON-CLEANUP-2-NONBRAND stage N2, close-out. The Button docs match the code. Re-check in the browser on the round-511 tree.

**Planned by:** B at the round 511 → 512 planning, 2026-11-14 (`b-round-511.md`, `b-round-511/checkpoint.md`). Round 511's task is archived as `tasks/round-511.md` (byte copy).
- **Advisor:** available; consulted after orientation and before hand-off.
- **Consult (run):** `tech-lead` reviewed the doc sketch in two passes and approved both (`b-round-511/sketch-review.md`). Four wording Lows are applied. One Low (a "pending" status line) is rejected because L28 forbids that form, and the reviewer accepted the rejection.

## Decisions (`backlog.json`, `decisions_log_b`)
- **D-29z1856: ruling on A's STOP A-R511-REVIEW-DESIGN-SYSTEM-PRIMARY-EXAMPLES (L10).**
  - Chosen: option (a), a doc-only follow-up grant. Option (b), Low and deferred, is not chosen, for three reasons:
    - B's own two-line grant caused the bug: origin B spec, and it repeats L34.
    - A design doc that tells implementers "Buy Now = `PrimaryButton`" steers N3–N9 wrong (DPG process rule 5).
    - Round 511 cannot publish without a C PASS in any case.
  - The finding has one id, C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES (Medium). A's STOP id is its alias (L7).
  - Round 511's browser, test and mutant rows stand as evidence for the code. The code is unchanged since C checked it [K5].
- **D-29z1857: scope of the doc grant (L34, L1).** B grepped every Button doc for the same claim [K6] [K15]. The stale claim "Add to Cart / Buy Now = primary" also appears in `docs/design/components/button.md` and in the Button section of `docs/technical/components/ui-components.md`. That section also has teal `#13D9CC` and old accent `#f9a91f`. All three are granted, as whole sections.
  - `docs/design/components/card.md` l.126 is not granted. It is an illustrative Card composition, not a variant rule; recorded only.
  - The doc text describes HEAD exactly [K7] [K8] [K9]:
    - `buy` is used only by Buy Now.
    - Proceed to Checkout, Get it free, Upgrade to Premium and Unlock Premium are `primary`.
    - The cart "Upgrade" colour cites SABA-Q-502-UPGRADE-VARIANT and does not invent a rule.
- **D-29z1858: new Low from B's pre-check: B-R511-CART-PULSE-REDUCED-MOTION.**
  - B's probe found that the "Added" pulse on Add to Cart scales to 1.04 even under `prefers-reduced-motion: reduce` [K13]. `motion.button` `animate` has no `useReducedMotion` guard; other Store components have one.
  - The behaviour is older than N2: N2 did not touch the pulse.
  - It goes to `deferred_low_polish` under the 2026-10-23 bug gate. This round does not own that code for a fix.
- **D-29z1859: doc 330 l.4 under L28.** This is a re-dispatch, so l.4 is granted implicitly and is rewritten to `Completed (C round 512 PASS)`.

## Rules
- **Read `lessons.md` first.** Applies: L1, L5, L10, L11, L22, L26, L28, L29, L34, L36, L38, L56, L57, L58, L59, L60.
- **Baseline is HEAD `f5d1b9e` plus A's uncommitted round-511 tree.** Gate 511 was `skipped` (C FAIL), and nothing was published [K3]. **Do not re-apply the round-511 sketch. Do not reset, revert or re-edit any round-511 file.** The four round-511 code and test files stay byte-equal to `b-round-511/r512-a511-pin-sha.txt` [K5].
- **The round is docs-only.** The only source change is applying B's byte sketch of four Markdown files. No `app/` file changes.
- **STOP threshold (L10, one clause).** Write "STOP — needs B ruling" and change nothing more in either of these cases:
  - a frozen check is not rc 0;
  - a Medium-or-higher finding needs a change outside the grants.
- **Pre-ruled (not STOPs; list them under "For B" if raised again):**
  1. `docs/design/components/card.md` l.126 and the ui-components Modal example "Add to Cart" (l.645) are illustrative compositions, not variant rules (D-29z1857).
  2. Doc 330 l.4 says `Completed (C round 512 PASS)` before C runs (L28).
  3. Stale content in the three docs outside the variant claim is SIG-R477-DOCS-OUTSIDE-DESIGN, a later DPG docs follow-up. Examples: Sizes table units, the teal hex values elsewhere in `ui-components.md`, the Active row.
  4. `button.md`'s Primary text row names `--color-brand-foreground`, while `Button.tsx` uses `text-background`. Both are #0e0d0c. This is PD-R496-PRIMARY-TEXT-TOKEN, an input to DPG-COLOR-CONSOLIDATE.
  5. The `PrimaryButton` example in `.claude/primitives/FORWARDREF_COMPONENT.md` is generic and does not say Buy Now. Primitives are proposals for Saba only.
- **Edits through `git apply` only.** No shell string-replace in the store tree (L60, A-R511-L60-SHELL-EDITS).
- **Reference-first:** not applicable. This is a docs-only fix-up with no user-visible change.
- **Persistent screen text (L39):** nothing changes.
- **Purchase protection:** protected files stay byte-identical (check 2). No product code changes.
- **No full suite.** Full vitest, build, Biome-all, `npm run verify` and `test:e2e:smoke` are gate rows.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`; store `/home/runner/czaba-project/store`.

## Frozen checks (run from `store/`; all rc 0 at planning [K11] [K5])
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-511/r512-tree-sha256.txt` covers 1,425 tracked files: every tracked file except the three granted tracked docs. It includes the round-511 code and test changes.
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`
3. `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-511/r512-a511-pin-sha.txt` covers the four round-511 code/test files, including the untracked `store-button-cleanup-n2.test.tsx`.
4. Before applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-511/r512-pre-sha.txt` (the four granted docs as they are now).
5. After applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-511/r512-post-sketch-sha.txt` (the four docs equal B's scratch).

## 1. What changes (grants: 4 paths)
From `store/`: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-511/sketch-512-docs.patch.txt`. The sketch's sha256 is `ad47fec454fb51e7bef53c6bdd9ab34fa3261473419a16dfad93e8fee8e25c14` [K12]. Apply it byte-equal, with no other edit. The generator is `b-round-511/edit-docs-512.py`, and its output is in `b-round-511/scratch/`.

| File | Sections changed (whole sections, L34) |
|---|---|
| `docs/design/DESIGN_SYSTEM.md` | Colour table, Buy/Purchase row: "Buy Now" (`variant="buy"`, product page). Variant Selection Guide: buy = product-page Buy Now; primary = main action (Submit, Proceed to Checkout, Get it free, Unlock Premium); secondary adds Open in Studio. Buttons: Usage Examples (primary = Proceed to Checkout; new buy example; `PrimaryButton` = Submit); Shape table (the full PurchaseHeader list with variant and min-width per action); "Primary Button (Main Actions)" with its Use-for and the SABA-Q-502 note; new "Buy Button (Direct Purchase)" block |
| `docs/design/components/button.md` | Primary usage row; new Buy table; Focus row (`:focus-visible` 1.5px brass 80%, offset 2px, the shared `app.css` rule); Loading text "Loading..."; props (`buy`, `destructive`, `shape`); example lines |
| `docs/technical/components/ui-components.md` | Button section: props (`buy`, `destructive`, `shape`); "Primary (Main Actions)" with brass `#C9A46A`; new "Buy (Direct Purchase)"; accent `#C9A46A`; the Examples line uses `variant="buy"` |
| `docs/implementation/2026/quarter-IV/330-dpg-nonbrand-stage-n2-purchase-card.md` | l.4 becomes `Completed (C round 512 PASS)` (L28). The approach paragraph now describes the three-doc fix and the finding id. The changed-files list names all three docs. The TODO line about the stale examples is removed |

## 2. A: what to do
1. Run frozen checks 1–4 (rc 0). Read `GEORGIAN_DOCS.md`.
2. Apply the sketch. Run frozen check 5 (rc 0) right after.
3. Save the following under `a-round-512/`:
   - `npm run typecheck` rc 0. `npm run lint` rc 0 with **174** warnings, unchanged.
   - **Covering:** `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/covering-files-head.txt) app/lib/__tests__/store-button-cleanup-n2.test.tsx` gives rc 0, 7 files and 92 tests (the same as C round 511 C9). Its only job here is to show the tree is consistent. No mutants: no code or test changed.
   - **Stale-string scan (K17's command on the live files):** `grep -cE 'Revenue|<PrimaryButton>Buy Now|PrimaryButton size="lg">Buy Now|variant="primary"( size="(md|lg)")?>Add to Cart|13D9CC|f9a91f|ring-2 ring-brand ring-offset-2|"ეს action რევენიუ' docs/design/DESIGN_SYSTEM.md docs/design/components/button.md docs/technical/components/ui-components.md` gives 0 / 0 / 0.
   - **Doc ledger:** `a-round-512/doc-ledger.md` maps each changed behaviour sentence in the four docs to its code fact (file:line in `Button.tsx`, `PurchaseHeader.tsx`, `cart.tsx`, `ProductSidebar.tsx`, `app.css`) or to a test row that exists (L26).
   - **code-reviewer** (4 changed files): review `git diff -- docs/design docs/technical` plus doc 330. A Medium+ finding inside the four docs that the sketch got wrong is a STOP (B owns the sketch); A does not hand-edit.
4. Write `a-round-512.md` with the changed files, the commands and their rc, and the reviewer's notes. No full suite, no build.

## 3. C: what to verify
Write `c-round-512.md`, `c-round-512.json` and `c-round-512/progress.json` as you go. Run the browser rows first (L59).

**Environment.**
- Dev server `:5173`. Mock API `:5199`: if `/__mock/health` fails, start `node mock-api/server.mjs` from the loop root, and stop it by PID at the end.
- Harnesses: copy `b-round-510/probe/n2-states.mjs`, `c-round-511/extra.mjs`, `c-round-511/prot.mjs` and `b-round-511/probe/n2-added.mjs` into `c-round-512/`.
  - `extra.mjs` is C round 511's script. It writes to `./extra`, so run it with `c-round-512/` as the working directory. It covers C3's mouse-down probe, C6b hover, C8's journey (`c8-1-store.png` … `c8-3-signin.png`) and C13 (`/studio/…`, `/account/downloads`, `/studio-lab`, `/api/studio-token`). This round uses its C8 and C13 parts.
  - `prot.mjs` re-checks only the two protected pages, with a 7 s wait.
  - `c-round-511/n2-anon.mjs` is only a copy of `n2-states.mjs`; do not use it.
- Signed-in states are **-STUBBED** (L36).
- Warm up once (L38). A cold-Vite hydration error that a warm re-run clears is environment, as in C round 511 C1.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start and end) | `git status --short --untracked-files=all`; frozen checks 1, 2, 3 and 5 | 8 paths: the 6 round-511 paths plus `docs/design/components/button.md` and `docs/technical/components/ui-components.md` (6 `M` + 2 untracked: the n2 test and doc 330); every check rc 0 (check 5: the four docs are byte-equal to the scratch); `git diff f5d1b9e --stat -- app` equals round 511's (3 files) |
| C1 | DOCS CONTENT | the stale-string scan in §2 step 3 on the live files; read the four changed sections | 0 / 0 / 0 hits. The DESIGN_SYSTEM "Buy Button" block's class list equals `variantStyles.buy` in `app/components/ui/Button.tsx` plus the base `font-semibold` and shape. Every variant named for a store action in the changed text equals the code: Buy Now `buy`; Proceed to Checkout, Get it free, Upgrade to Premium, Unlock Premium `primary`; Open in Studio and Downloads `secondary` [K7]. Hex values in the changed text equal `app.css` [K9] |
| C2 | DOC 330 + LEDGER | doc 330, `a-round-512/doc-ledger.md` | 7 TEMPLATE headings in order. l.4 byte-equal to `**სტატუსი:** Completed (C round 512 PASS)`. `grep -c 'pending\|C round 511 PASS'` = 0. Every row id cited in the doc exists in the test files. The ledger maps every changed behaviour sentence |
| C3 | DEFAULT CARD (browser) | `n2-states.mjs` ANON at 1440×900 and 1280×720 | Same values as C round 511 C1: Add to Cart 163×50, Buy Now 139×50, same top, radius 8px, weight 600, Buy Now bg rgb(201,164,106) and text rgb(14,13,12); 0 page errors after warm-up |
| C4 | ANON JOURNEY (browser, L54) | `extra.mjs`, C8 part (C round 511 C8): `/store` → `/products/middle-east` → Buy Now at 1440 | email field 0 → 1; a screenshot per step; 0 page errors except the expected cloud ones |
| C5 | ADDED PULSE (browser, record) | `node n2-added.mjs c-round-512/added c` | At both viewports and under both motion settings: labels `Adding...` → `Added` → `In Cart`; radius 8px; In Cart text rgb(201,164,106), width 140; 1 POST `/api/cart/items`. **Record** the max scale under `reduce` (B measured 1.04, filed as B-R511-CART-PULSE-REDUCED-MOTION, Low, deferred). Not a FAIL of this round |
| C6 | PROTECTION + STUDIO (browser) | `extra.mjs` C13 part plus `prot.mjs` (C round 511 C13), fresh context with no credentials, 1440 and 1280 | `/studio/middle-east` and `/account/downloads` show "Sign in required" with no download link (wait at least 7 s). Unauthenticated `GET /api/studio-token?product=middle-east&file=stem.mp3` = 401 with no URL. `/studio-lab` opens the demo. Check 2 rc 0 |
| C7 | TESTS | the §2 covering command | rc 0, 7 files, 92 tests; N2-1…N2-9, B2C-7, B2C-8 and ST5 present; no test above 2,500 ms |
| C8 | CLAIMS + L57 | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-511/claims-512.sh` compared with `b-round-511/claims-512-planning-output.txt`; `python3 -I tools/l57-check.py c-round-512.json c-round-512/l57-check.txt` | No MISSING. Only K2 (two more `M` docs), K6 (stale lines gone; Buy block count 1), K11 (pre-sha now fails by design: use check 5) differ, as A's change implies. L57 rc 0 |

- **Gate rows** (list them under `gate`, never `passed`): full vitest suite, build, Biome-all, `npm run verify`, `test:e2e:smoke`.
- **Blocked:** a real signed-in purchase and ownership need the backend (FREE-CHECKOUT-REAL-BACKEND, PURCHASE-REAL-BACKEND). This round does not include them.
- **L57:** write every field:
  - `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
  - an `origin` for each finding;
  - `assertsSpecified`;
  - `mutantsRecorded`: "none: docs-only round";
  - `mutantRedOnSketch`: `null`;
  - `mutantRedOnTree`: `null`, with the reason "no code or test change; round-511 mutants 26/26 in c-round-511/mutants-c.txt";
  - `gateChecksNamed`, `gateChecksRunOnSketch` (`null`: docs only), `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-511/claims-512-planning-output.txt`).
- **L22:** if A STOPs with no diff, run C0, C6 and C8 only. A STOP that names an unruled Medium+ is a short FAIL.
- **Neighbours that could break:** none at runtime, because no code changes. Docs that agents read: N3–N9 tasks will cite the new Buttons sections.
- **On closing:** a C PASS with `browserVerified` true closes stage N2 (PurchaseHeader) for rounds 511 and 512 together. The gate then publishes the 8 paths. PlayStems and StemsPlayerModal stay open under SIG-R473-STEMS-PLAYER-DEAD / SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE.

## 4. B's pre-check (`b-round-511/`)
| Check | Result | File |
|---|---|---|
| Frozen checks on the round-511 tree | tree (old r511 pin), protected and post-sketch 511 all rc 0 | `frozen-511-tree.txt` |
| A's app diff equals `a-round-511/diff.patch` | equal | [K5] |
| Inventory: `buy` and primary revenue sites | `buy` only Buy Now; Checkout, Get it free, Upgrade and Unlock are primary | `inventory-revenue.txt`, `inventory-revenue-variants.txt` |
| Docs grep for the same stale claim | DESIGN_SYSTEM, button.md and ui-components are granted; card.md is recorded | `docs-grep-buttons.txt`, [K15] |
| Sketch | applies with `git apply --check`; scratch has 0 stale strings [K17]. Dry-run on a copy outside `store/`: checks 4 and 5 OK, stale scan 0/0/0, C2 grep 0, doc 330 l.4 and 7 headings | `sketch-512-docs.patch.txt`, `scratch/`, `dryrun-512.txt` |
| Tests or scripts that read the granted docs | none [K10] | claims |
| Added-pulse probe on the round-511 tree | labels correct; scale 1.04 under both motion settings | `probe/run/b-added.json`, PNGs |
| Sketch review | tech-lead, two passes: approve; 4 Lows applied, 1 rejected (L28) | `sketch-review.md` |
| Claims | `claims-512.sh` K1–K17; stderr empty | `claims-512-planning-output.txt` |
| L57 checker with the prescribed null fields | rc 0, L57 OK | dummy JSON, not kept |

## 5. After this round
1. **REGRESSION** on or after 2026-11-16 (`regression-last.json`).
2. **NONBRAND N3–N9** with the widened scanner. Then PD-R498-404-SECONDARY-ALIGN, DPG-BUTTON-CONTRACT-TABLE (it may take the three tag-scanner copies, SIG-R501-SHARED-BUTTON-SCANNER), the rest of DPG P1, the DP gate and P2. Then STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS and the rest of the queue.
3. PlayStems and StemsPlayerModal wait for SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE.

## Claims (`b-round-511/claims-512.sh`; planning output `b-round-511/claims-512-planning-output.txt`)
- **K1–K4:** HEAD, changed paths, gates 509–511, the C round 511 verdict.
- **K5:** round-511 code/test pin, and the app diff equals A's `diff.patch`.
- **K6:** stale lines at planning in the three docs.
- **K7:** inventory of `buy` and primary revenue sites.
- **K8:** Button variants, shape and the buy styles.
- **K9:** colour tokens.
- **K10:** no test or script reads the granted docs.
- **K11:** frozen pins.
- **K12:** sketch sha and the scratch post-sketch pin.
- **K13:** Added-pulse probe.
- **K14:** lessons cited.
- **K15:** other docs with the same claim (card.md only).
- **K16:** artifacts.
- **K17:** stale strings in the scratch (0/0/0).
