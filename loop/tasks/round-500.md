# Round 500: DPG-BUTTON-CLEANUP-2 stage 2b-1, re-dispatch. Pin the `/store` error "Try again" link, then run the full verification

**Planned by:** B, at the round 499 → 500 planning on 2026-11-13 (`b-round-499.md`).
- **Advisor:** available; consulted after orientation and at the closing check.
- **Archive:** the round-499 task is archived as `tasks/round-499.md`, a byte-identical copy (`cmp` rc 0).

## Decisions (`backlog.json` v493, `decisions_log_b`)
- **D-29z1792: round 499 is not accepted.**
  - C failed on the L22 short route, with `browserVerified` and `realVerified` false. Gate 499 is `skipped` ("C taskStatus FAIL") [K15].
  - The baseline stays `82e118a` [K1]. A's round-499 tree is kept, not reverted: 5 modified and 2 untracked paths [K2]. This round applies a **delta** sketch on top of it.
  - Stage 2b-1 is **not** done. No backlog item changes to done.
- **D-29z1793: ruling on A-R499-CR-STORE-TRY-UNPINNED (Medium, origin `B spec`; C confirmed it in round 499, recorded as `confirmedBy`).**
  - **Option (a) is chosen.** A DOM row now pins the link. Option (b), "C's browser rows cover it", is rejected because the gate does not run browser rows, so a later regression would ship.
  - New row **SE1** in `product-price-cards.test.tsx`:
    - it renders `StorePage` through the real `loader`, with `getProducts` rejected, so the code takes the error branch;
    - that file's Remix `Link` mock passes `className` and `to` [K6];
    - it asserts one `role="alert"` block, one link, text "Try again", `href="/store"` and the exact primary lg pill class string.
  - Mutants N10 (ghost), N11 (`md`), N12 (`to="/"`), N13 (a `bg-brand` array join) and N17 (copy) turn SE1 red.
  - This is a **planning FAIL** under L58: an unruled Medium that A's reviewer found on B's sketch. It is counted for RETRO 510.
  - Cause: the round-499 matrix pinned the other two sites by DOM rows and this site by a source substring only. tech-lead had rated the gap Info. The fix is the site × attribute matrix in `b-round-499/sketch-review.md`; every cell has a row and a mutant, or a ruling.
- **D-29z1794: A's round-499 reviewer Lows are fixed in this delta, inside files already granted.** Each closes with C round 500 PASS.
  - A-R499-CR-PAIR-ORDER: `isBefore` in B2B-1, B2B-2 and B2B-3. Mutants N16 (EmptyState pair swapped) and N18 (error pair swapped).
  - A-R499-CR-TRYAGAIN-TYPE: `ErrorDisplay` "Try Again" gets `type="button"`, asserted in B2B-3 and B2B-4. Mutant N15.
  - A-R499-CR-DS-SAME-RULE: DESIGN_SYSTEM l.1193 now reads „Store-ის CTA წყვილის წესი (`ghost` `lg` `pill`) ეხება …“ [K12].
  - A-R499-CR-DOC321-WORDING: the doc 321 l.30 D1 height, the build line and the l.83 coverage sentence (A's round-499 tree; l.85 after the delta) [K23]. The heights are checked against `b-round-498/measure/summary.txt`: REC-DENIED-PRIMARY is 52 at 1280 and 1440 through row stretch, and 50 at 375. The build question ("v1 or v2") is settled by re-running the build on this delta: rc 0 and `✓ built` (`b-round-499/precheck-build-sketch.log`).
  - Plus the advisor's cell: the "Try Again" reload handler is pinned by B2B-5 (`pins`), and mutant N14 deletes it.
- **D-29z1795: consults.**
  - tech-lead reviewed the frozen delta adversarially and returned **APPROVE**, with no Medium. Its site × attribute matrix and B's rulings are in `b-round-499/sketch-review.md`, which names the sha. Its Lows are pre-ruled #9–#12.
  - product-designer is not consulted: there is no UX change. The delta adds a `type` attribute and tests only, and the §1 reference is carried from round 499.
  - **No architecture checkpoint.** The change is small and has one owner. A's round-499 Architecture note ("no signal") is recorded as `confirmedBy` on SIG-R498-BUTTONLINK-WRAPPER, which stays a signal.
- **D-29z1796: corrections from the closing check.**
  - Every pre-check was re-run on the final sketch tree, docs included (L56).
  - The C1 `type` exception, the C9 verbose reporter and the C11 token and `pending` evidence are written in.
  - A's log names are listed, the D1 correction is added, and ruling #8 is reworded from the probe.
  - The mutant script now creates its log directory.

## Rules
- **Read `lessons.md` first.** Applied here: L4, L7, L10, L11, L22, L23, L26, L28, L31, L56, L57 and L58.
- **STOP threshold (L10):** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch;
  - one of A's numbers differing from B's expected value in §3.
- **The sketch writes every granted byte, doc 321 included.** A writes no prose this round. Doc 321 l.89–94 state A's expected results [K21]; if A's logs differ, that is a STOP, not an edit.
- **Ruling lines (L4), carried from round 499:**
  - Error-page emphasis: the product-designer ruling (Try Again primary, Go Home ghost) wins over HEAD's secondary Try Again. No position moves.
  - `EmptyState`'s secondary becomes ghost. The DESIGN_SYSTEM ghost rule wins over the old bordered look.
  - The 404 "Browse Store" stays a text link (PD-R498-404-SECONDARY-ALIGN).
  - `account.downloads.tsx` is protected and is not edited. Its href stays `/music`.
- **Pre-ruled Lows:** a re-raise is listed "For B" and is not a STOP.
  - #1 links have no `:active` scale (SIG-R496-LINK-NO-PRESS-SCALE).
  - #2 there is no `ButtonLink` wrapper yet (SIG-R498-BUTTONLINK-WRAPPER).
  - #3 the literal oracles are duplicated on purpose. SE1's `STORE_ERROR_TRY_AGAIN_CLASS` is a third copy of the primary lg pill; it is byte-equal to the 2b-1 file's `PRIMARY_LG_PILL` [K24], and B2B-0 proves that one equals the builder.
  - #4 `EmptyState`'s `<button>` branches have no caller (B-R499-EMPTYSTATE-ONACTION-UNUSED).
  - #5 the ghost hover fill is faint (PD-R499-GHOST-HOVER-FAINT).
  - #6 after a Remix client navigation `document.activeElement` is BODY (C6 oracle).
  - #7 SE1 lives in `product-price-cards.test.tsx`, not in the 2b-1 test file. That file already mocks Remix for `StorePage` [K6]; mocking `@remix-run/react` in the 2b-1 file would break `RootErrorBoundary`'s `useRouteError` [K20].
  - #8 the reload handler is pinned by source text (B2B-5 `pins`, mutant N14), not by a click. B's probe (`b-round-499/reload-spy-probe.txt`) shows `vi.spyOn(window.location, 'reload')` throws "Cannot redefine property: reload". Replacing `window.location` with `Object.defineProperty` does work, but it is not adopted: the handler is byte-unchanged since HEAD except for the new `type`, and C6 checks the reload in the browser.
  - #9 SE1's console spy is restored inline and leaks only when its own assert fails (TL-R500-SE1-SPY-FINALLY).
  - #10 the `Link` mock forwards only `to`, `className` and `children` [K20], so an added `reloadDocument`, `replace` or `prefetch` prop passes (TL-R500-LINK-MOCK-DROPS-PROPS). C6 covers client navigation versus a full load.
  - #11 the error-page icons are counted, not identified (`confirmedBy` on A-R498-CR-ICON-ASSERT).
  - #12 the doc 321 D1 phrase „denied წყვილში 52-დან“ could name the element (TL-R500-DOC321-D1-WORDING).
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.
- **Out of scope:** Studio (`/studio-lab`) and the Ableton check. This is a Store round.
- **Persistent screen text (L39):** nothing is added.
- **Purchase protection:** no auth, cart, checkout or download logic changes. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.

## Baseline
HEAD is `82e118a` [K1] (gate 498 `commit`). The worktree holds A's round-499 change: 5 modified and 2 untracked paths [K2]. Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-499/r500-tree-sha256.txt`: every tracked file outside the six granted tracked paths (1,403 files [K22]).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files.
3. Before applying: `b-round-499/r500-pre-sha.txt`. It covers the 8 granted paths in A's round-499 form: `ErrorBoundary.tsx`, `EmptyState.tsx`, `store.tsx`, DESIGN_SYSTEM.md, doc 320, the 2b-1 test, doc 321 and `product-price-cards.test.tsx`.
4. After applying: `b-round-499/r500-post-sketch-sha.txt`, the same 8 paths with the delta applied, doc 321 included.

B checked that applying the patch to a copy of A's tree reproduces checks 4 and 1 byte for byte.

## 0. Why this round
- The round-499 change itself is unchanged and was correct in C's protection rows. What failed was the test net: one of the three sites had no row that a plausible regression would turn red.
- This round closes that gap and four reviewer Lows. Then C runs the **full** C0–C14 in the browser, which was not run in round 499.
- **REGRESSION is not due.** The last one was 2026-11-13; the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference
Carried unchanged from `tasks/round-499.md` §1: direction A, "a brass pill", plus the Artlist and Epidemic pill CTAs, with deviations D1–D4. **One correction to D1:** HEAD's 52 px heights are the recordings-denied pair. The ghost is 52 because of its border, and the primary is 52 at 1280 and 1440 through flex row stretch (50 at 375). All other targets were 50 (`b-round-498/measure/summary.txt`). This round adds no behaviour or visual change. The delta's only product change, `type="button"` on a button that is not inside a form, renders and acts the same.

## 2. What changes: delta sketch `b-round-499/sketch-500.patch.txt`
sha256 `79835ecda0c3636fff487ac3562a891d9a4e3ccc794da2b259bbc2dd38f012ea`, the line in `b-round-499/sketch-sha.txt`.

| File | Change |
|---|---|
| `app/components/errors/ErrorBoundary.tsx` | `ErrorDisplay` "Try Again": `<Button size="lg" shape="pill" …>` → `<Button type="button" size="lg" shape="pill" …>` [K3] |
| `app/lib/__tests__/product-price-cards.test.tsx` | new `STORE_ERROR_TRY_AGAIN_CLASS` literal + row **SE1** in `describe('/store card price')`. `console.error` is spied, its single loader log is asserted, and the spy is restored. The loader's error value is `'Failed to load products'` and the route has one `role="alert"` block [K5]. The `Link` line under test is [K4] |
| `app/lib/__tests__/store-button-cleanup-2b.test.tsx` | `isBefore` helper. Pair order in B2B-1, B2B-2 and B2B-3. `type="button"` asserted in B2B-3 and B2B-4. `STAGE_2B1_SITES` gains `pins`, and the ErrorBoundary block must contain `onClick={() => window.location.reload()}` [K7] |
| `docs/design/DESIGN_SYSTEM.md` | the Ghost "Use for" sentence: „იგივე წესი ეხება“ → „Store-ის CTA წყვილის წესი (`ghost` `lg` `pill`) ეხება“ [K12] |
| `docs/implementation/2026/quarter-IV/321-dpg-button-cleanup-stage-2b-1.md` | l.4 → `In Progress (stage 2b-1 of DPG-BUTTON-CLEANUP-2; C round 500 PASS)` (L28 re-dispatch) [K11]. D1 wording, the changed-files list, a round-499 STOP problem bullet, the coverage sentence and the whole `## ტესტირება` section, rewritten for round 500. Ledger: `b-round-499/doc-ledger.md` |

Unchanged: `EmptyState.tsx`, `store.tsx` and doc 320. Their round-499 bytes are pinned by checks 3 and 4. The builder calls stay 2, 1 and 1 [K8]. The scanner stays at 109 hits, 44 solid [K9] (`b-round-499/scan-sketch.txt`). The CSS bundle is the same as at gate 498.

**Sweep (L23)** [K10]: the accessible names and module paths hit the same 4 unit and 4 e2e files as round 499. No new class, testid or label is added. `type="button"` is an attribute, and no test pins its absence.

**L31 timeout headroom** [K14]:
- In the files gaining rows, `product-price-cards` takes 44 ms and the 2b-1 file 164–467 ms. Both have the 5 s default.
- In the covering set:
  - UT2 is 2,933 ms at gate 498 against its describe timeout of 30 s;
  - BC1b is 2,024 ms at gate 498 against the 5 s default (40 %).

  Neither is a STOP.

## 3. A: what to implement
1. From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-499/sketch-500.patch.txt`, then `git apply` on the same path;
   - run check 4 and check 1 again (rc 0).
2. **Grants:** the 5 files in the §2 table, exactly as the sketch writes them. Nothing else changes.
3. **Run** (logs under `a-round-500/`). Each expected value is B's sketch output, and a difference is a STOP:
   - Save the logs under the names doc 321 cites (A cannot edit the doc): `a-round-500/typecheck.log`, `lint.log`, `biome-scoped.log` and `covering.log`.
   - `npm run typecheck`: rc 0 (`b-round-499/precheck-tsc.log`);
   - `npm run lint`: rc 0, "Found 180 warnings." (`precheck-lint.log`);
   - `npx biome check app/components/errors/ErrorBoundary.tsx app/components/ui/EmptyState.tsx app/routes/store.tsx app/lib/__tests__/product-price-cards.test.tsx app/lib/__tests__/store-button-cleanup-2b.test.tsx`: rc 0, 6 warnings (`precheck-biome.log`);
   - `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-499/covering-files.txt)`: 14 files, 138/138 (`precheck-covering.log`);
   - the code-reviewer on the whole round-499 + 500 change against `82e118a`. The 3+ file rule applies; give it `git diff 82e118a` and the two untracked files.
   - Not run by A: the full suite and the build. B ran them on the sketch (`precheck-full.log`, `precheck-build-sketch.log`).
4. Write `a-round-500.md` with the code-reviewer's Architecture note for B.

## 4. C: what to verify (the full table; round 499 ran only C0, C12, C13 and C14)
C writes `c-round-500.md`, `c-round-500.json` and `c-round-500/progress.json` as it goes, with the heaviest browser rows first (L59).

**Environment and harness (as in round 499):**
- **Mock API:** start it with `node mock-api/server.mjs` from the loop folder for `MOCK=on`.
- **Stopping the mock:** stop it **by exact PID** for `MOCK=off`, using `ps -eo pid,args | awk '$2=="node" && $3=="mock-api/server.mjs"{print $1}'`. If that finds nothing, use the port: `ss -ltnp 'sport = :5199'`. Confirm with `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5199/__mock/health`, which prints `000`. Never `pkill -f`.
- **Stubs:** use the L36 stubs and the malformed-catalog recipe for the root error page (`b-round-498/probe/reach.mjs`). Warm each page once.
- **Harness:** `MOCK=on BASE=http://127.0.0.1:5173 node /home/runner/czaba-project/tmp/studio-real-loop/b-round-498/measure/measure-499.mjs <c-round-500/after> after`, then `MOCK=off` with the same arguments.
- **Oracles:** `b-round-498/measure/sketch/sketch-{on,off}.json`. The delta changes no class, so the round-499 sketch oracles hold.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 6 modified (`ErrorBoundary.tsx`, `EmptyState.tsx`, `store.tsx`, DESIGN_SYSTEM.md, doc 320, `product-price-cards.test.tsx`) and 2 untracked (the 2b-1 test, doc 321). Checks 1, 2 and 4 rc 0 |
| C1 | REST (browser, 1440×900, 1280×720, 375×812) | The 10 targets in `measure-499.mjs` | As round 499 C1. Exception: `rest.type` is `"button"` on ROOT-ERR-TRY and ROUTE-ERR-TRY, where the oracle has `null`; the delta adds that attribute. Every other field equals the oracle. Primary: bg `rgb(201, 164, 106)`, text `rgb(14, 13, 12)`. Ghost: bg `rgba(0, 0, 0, 0)`, text `rgb(163, 155, 142)`. All: radius `9999px`, height 48, 16px / 600, padding 12px 24px. Boxes equal `sketch-{on,off}.json` ±1 px |
| C2 | HOVER | Hover each target | Primary bg `rgb(217, 184, 127)`. Ghost bg `rgb(29, 26, 23)`, text `rgb(236, 230, 218)` |
| C3 | FOCUS (1440 + 1280) | Keyboard Tab to each target; mouse press | Keyboard: `:focus-visible` true, outline solid 1px, offset 2px, and a ring visible in at least 4 viewed crops. Press: `:focus-visible` false, outline `none` |
| C4 | STACK (375×812) | The recordings-denied pair and the root-error pair | Denied: both 179×48, stacked, same width. Root error: both 343×48, stacked. Labels on one line; nothing clipped |
| C5 | CONTRAST | `restContrast` / `hoverContrast` | Primary rest 8.32, ghost rest 7.06, all hover ≥ 10.28. A failure is a Medium |
| C6 | NAV (1440) | `MOCK=on` then `MOCK=off` with `…/b-round-498/measure/nav-499.mjs <c-round-500/after> after` | `finalPath` and `fullDocumentLoad` equal `b-round-498/measure/head/head-nav-{on,off}.json`. Root "Try Again" and route "Try Again" reload the page; "Go Home" goes to `/` with a full load; `/store` "Try again" goes to `/store` |
| C7 | JOURNEY (L54, 1440) | `/cart` (empty) → "Discover the Collection" → `/store` → back | Paths `/cart`, `/store`, `/cart`; one screenshot per step; no console error in the journey |
| C8 | GREP | `python3 -I b-round-497/scan-brand.py . /tmp/s.json` from `store/`; `grep -c 'buildButtonClassName('` on the 3 code files | `109 hits; 44 solid`; calls 2, 1, 1 |
| C9 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-499/covering-files.txt)` | 14 files, 138/138 pass; the SE1 line is present (B: `b-round-499/precheck-covering.log`) |
| C10 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules` and `.git`) to a folder outside `store/`, `git init`, commit, symlink `node_modules`. Run `bash b-round-498/mutants-499.sh <copy>`, then `python3 -I b-round-499/mutants-500.py <copy> <c-round-500/mutant-logs>` | mutants-499: N1–N4 and N6–N9 RED, and N5 `APPLY-FAILED` (its anchor gained `type="button"`; replaced by N5b). mutants-500: N5b, N10–N18 all RED, each on the rows in `b-round-499/mutants-500-failing-rows.txt` |
| C11 | DOCS | `git diff 82e118a -- docs/design/DESIGN_SYSTEM.md docs/implementation/2026/quarter-IV/320-dpg-button-cleanup-stage-2a.md`; doc 321 | DESIGN_SYSTEM: hunks only in the pill row and the Ghost "Use for" line. Doc 320: only l.4, `In Progress (stage 2a of DPG-BUTTON-CLEANUP-2; C round 498 PASS)`. Doc 321: the 7 headings (L26 subsequence), and l.4 byte-equal to `In Progress (stage 2b-1 of DPG-BUTTON-CLEANUP-2; C round 500 PASS)`. Every number traces to the log or row in `b-round-499/doc-ledger.md`. Every backtick-quoted class token is found by `git grep -F <token> 82e118a -- app docs`; B's run on the sketch has 65 hits and only non-class misses (paths, env names, labels) (`b-round-499/doc321-tokens.txt`). `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 (B: `pending-grep.txt`) |
| C12 | CLAIMS | `bash b-round-499/claims-500.sh` (default tree), compared with `b-round-499/claims-500-sketch-output.txt` | No `MISSING`. Output identical, except K1 (HEAD may move to the loop-state commit), K2 (the sketch scratch reads the store's status line), and K18 locations (archive moves) |
| C13 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link; `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each); check 2 rc 0 |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-500.json c-round-500/l57-check.txt` | As C0; rc 0. The JSON carries every L57 field. `mutantRedOnSketch` names `b-round-499/mutants-500.txt` |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Neighbours that could break:** the stage-1 and 2a sites (frozen, checked by C0); the cart e2e smoke (C1, C6); the protected downloads empty state (C1); the route error page (C1, C6); the other `/store` rows in `product-price-cards.test.tsx` (C9: VC1–VC5, PC1, PC2 and SC1 stay green).
- **L22:** if A STOPs, C runs C0, C12 and C14 only.
- **Closing:** with C PASS and `browserVerified` true:
  - DPG-BUTTON-CLEANUP-2 stage 2b-1 is verified;
  - B-R498-DOC320-L28, A-R499-CR-STORE-TRY-UNPINNED, A-R499-CR-PAIR-ORDER, A-R499-CR-TRYAGAIN-TYPE, A-R499-CR-DS-SAME-RULE and A-R499-CR-DOC321-WORDING close.

## 5. B's pre-check (on a scratch copy of A's round-499 tree plus the delta, outside `store/`)
| Check | Result | Log |
|---|---|---|
| tsc / Biome on 5 code and test files | rc 0 / rc 0, 6 warnings | `precheck-tsc.log`, `precheck-biome.log` |
| lint (`biome lint ./app`) | rc 0, 180 warnings, 1 info | `precheck-lint.log` |
| Covering tests | 14 files, 138/138 | `precheck-covering.log` |
| Full suite on the final sketch tree (docs included) | 297 files / 4,329 tests, rc 0 (round 499: 4,328, +1 SE1) | `precheck-full.log` |
| Build on the final sketch tree | rc 0; CSS bundle `app-P1AqvFE3.css`, the same as gate 498 | `precheck-build-sketch.log` |
| Doc 321 tokens / `pending` grep / reload-spy probe | 65 hits, only non-class misses / 0 / spyOn throws, defineProperty works | `doc321-tokens.txt`, `pending-grep.txt`, `reload-spy-probe.txt` |
| Mutants | N5b and N10–N18 RED on their named rows; the old N1–N9 re-run on this tree are RED except N5 (anchor moved) | `mutants-500.txt`, `mutants-500-failing-rows.txt`, `mutants-499-on-500-tree.txt`, `mutant-logs/` |
| Scanner, builder calls | 109/44; 2, 1, 1 | `scan-sketch.txt`, `builder-calls-sketch.txt` |
| Patch reproduces the tree | `git apply` on a copy of A's tree: checks 4 and 1 rc 0 | (this table) |
| Sketch review | tech-lead **APPROVE** on the frozen sha `79835ecd…`: no Medium; Lows pre-ruled #9–#12 | `sketch-review.md` |
| Claims (A's tree and the sketch) | rc 0, no MISSING | `claims-500-planning-output.txt`, `claims-500-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **DPG-BUTTON-CLEANUP-2 stage 2b-2**, the `<button>` and submit sites: free-downloads "Download", the NewsletterSection submit, and the hire-us submit (ST5 pin granted).
3. **2b-3:** recordings "Create a scene", cart and StudioShowcase. Re-evaluate SIG-R498-BUTTONLINK-WRAPPER at about 15 call sites.
4. **2c:** PurchaseHeader. **2d:** chat. **2e:** LeadMagnet (keep-list restyle). Then **NONBRAND** and **PD-R498-404-SECONDARY-ALIGN**.
5. **Then the rest of DPG P1** (CSS-DEDUP, COLOR-CONSOLIDATE, FONT-RESOLVE), the DP-gate re-run with root, and P2. The next RETRO is round 510.

## Claims (`b-round-499/claims-500.sh`; planning output `claims-500-planning-output.txt` on A's tree, sketch output `claims-500-sketch-output.txt` on the scratch)
K1 HEAD · K2 worktree counts · K3 Try Again type · K4 `/store` Link line · K5 loader error value + alert count · K6 `Link` mock + SE1 count · K7 `isBefore`, pins, type asserts · K8 builder calls · K9 scanner · K10 sweep · K11 doc 321 l.4 + headings · K12 DESIGN_SYSTEM phrase · K13 doc 320 l.4 · K14 L31 timings · K15 gate 499 status · K16 c-round-499 L57 · K17 artifacts · K18 ids · K19 l58 · K20 `useRouteError` + `Link` mock props · K21 doc 321 l.89/l.103 · K22 frozen list sizes · K23 doc 321 line numbers · K24 SE1 literal = `PRIMARY_LG_PILL`.
