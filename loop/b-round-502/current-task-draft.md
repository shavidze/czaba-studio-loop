# Round 503: DPG-BUTTON-CLEANUP-2 stage 2b-3. Move the cart "Upgrade", recordings "Create a scene" and Studio showcase "Browse the Collection" links onto `buildButtonClassName`

**Planned by:** B, at the round 502 → 503 planning on 2026-11-14 (`b-round-502.md`).
- **Advisor:** available; consulted after orientation and at the closing check.
- **Archive:** the round-502 task is archived as `tasks/round-502.md`, a byte-identical copy (`cmp` rc 0).

## Decisions (`backlog.json` v499, `decisions_log_b`)
- **D-29z1807: round 502 is accepted, from C's evidence only.**
  - `c-round-502.json` is PASS with `browserVerified` and `realVerified` true and 0 bugs. `c-round-502/l57-check.txt` says `L57 OK`. Gate 502 is `published` at `882854e` [K21, K22].
  - B-R502-CART-MOBILE-ITEMS-HIDDEN, B-R502-CART-LG-SUMMARY-CLIPPED and B-R502-CART-WHEEL-NESTED-SCROLL are closed for the client path. Their rows were stubbed (L36), so CART-REAL-BACKEND stays open.
- **D-29z1808: round-502 follow-ups (L7).**
  - A's reviewer Lows A-R502-CR-1…5 go to `deferred_low_polish`. CR-2 and CR-5 are `confirmedBy` gate 502's Lows 1 and 2.
  - Gate 502 Info 5 (the `useSmoothScroll` rAF loop is never cancelled) becomes GATE502-I5-LENIS-RAF-LEAK and joins the SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE sweep.
  - C's two infos: INFO-C502-CHECKOUT-RING-1PX (info) and C-R502-SUMMARY-CARD-WIDTH-375 (deferred Low).
  - Doc 323's l.4 was dispatched as `In Progress (…; C round 502 PASS)` for a one-round fix. L28 requires `Completed (C round 502 PASS)`. That is B-R502-DOC323-L28-STATUS (Low, origin B spec), fixed by a one-line grant in this round [K16].
- **D-29z1809: stage 2b-3 scope, mapping and sketch.**
  - **Scope:** the last three sites of inventory row A2 (`b-round-497/stage2-inventory.md`), plus the doc 323 status line.
  - **Mapping:** product-designer's ruling, unchanged (`b-round-501/consult-product-designer.md`, D-29z1804).
  - **Not adopted:** the arrow nudge (PD-R502-SHOWCASE-ARROW-NUDGE).
  - **Open question:** SABA-Q-502-UPGRADE-VARIANT stays `awaiting_user`; its default is brass primary, and it does not block.
- **D-29z1810: consults and review.** See `b-round-502/sketch-review.md`.
  - tech-lead reviewed the frozen sketch (<REVIEW-SUMMARY>).
  - **No architecture checkpoint:** three one-line class swaps in three owners. SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER are decided at the close of stage 2 (after 2e). The 2b-3 sites follow the existing `<Link>` + `buildButtonClassName` pattern (HeroSection [K8]).

## Rules
- **Read `lessons.md` first.** Applied here: L1, L4, L7, L10, L12, L22, L23, L26, L28, L29, L31, L39, L47, L52, L54, L56, L57 and L58.
- **STOP threshold (L10):** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch;
  - one of A's numbers differing from B's expected value in §3.
- **The sketch writes every granted byte**, docs 323 and 324 included. A writes no prose this round.
- **Ruling lines (L4):**
  - "Upgrade" height: `min-h-11` (44 px) wins over `sm`'s 32 px. The notice grows 64 → 70 px at 1440 and 1280, and stays 168 px at 375 [K29]. product-designer accepted this. Round 502's `lg` equality rows (`compare-502.py`) are not re-run here, because the owned-item states change by design. The cart neighbours are re-checked by C6.
  - Showcase hover and press: the builder (no transform) wins over HEAD's `scale(1.05)`/`scale(0.98)`. Links get no `:active` scale [K9]. Deviation D3.
  - "Create a scene" size: `min-h-11` keeps it 44 px tall, and `md`'s `py-2.5` changes its padding from `0 16px` to `10px 16px`. The box stays 131×44 [K29].
- **Pre-ruled Lows** (a re-raise is listed "For B", not a STOP):
  - #1 the three literal oracles duplicate the builder on purpose; B2B3-0 proves they are equal.
  - #2 `openingTags` is a third copy of the brace-aware scanner (also in the 2b-2 test and `store-internal-links.test.ts`). Sharing it is SIG-R501-SHARED-BUTTON-SCANNER at the stage-2 close.
  - #3 the cart and recordings render rows mock hooks and the API client. The browser rows (C1–C5) carry the real rendering.
  - #4 `transition-all duration-150` from the builder; the computed transition equals HEAD's because a global rule wins on links [K29].
  - #5 the 6 Biome warnings in the three code files are pre-existing and untouched [K26].
  - #6 BC1b in the covering set runs near 47 % of its 5 s timeout. A's BC1b time above 2,500 ms is a STOP (L31).
- **Purchase protection:** no auth, cart, checkout, ownership or download logic changes. Only three `className` values and three import lines change. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.
- **Persistent screen text (L39):** nothing is added or removed. Labels and icons are unchanged.
- **Out of scope:** Studio (`/studio-lab` is only smoke-checked in C12), the 2c–2e sites and NONBRAND.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.

## Baseline
HEAD is `882854e` [K1] (gate 502 `commit`). The worktree is clean [K2]. Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-502/r503-tree-sha256.txt`: every tracked file except the five granted tracked paths (1,410 of 1,415 files [K23]).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files. No granted path is protected [K24].
3. Before applying: `b-round-502/r503-pre-sha.txt` (the five granted tracked paths at HEAD).
4. After applying: `b-round-502/r503-post-sketch-sha.txt`, covering all seven paths.

B applied the patch to a `git archive` copy of HEAD. Check 4 matched, and check 1 stayed rc 0.

## 0. Why this round
- Saba's DPG item 7 says "Use Button.tsx component only". Stages 1, 2a, 2b-1 and 2b-2 are done. Stage 2b-3 moves the last three hand-rolled brass `<Link>` sites of inventory row A2 onto the shared builder. The scanner count drops from 104 hits / 41 solid to 100 / 38 [K11].
- **Bugs first:** no Critical, High or Medium finding is open on these files. The round-502 cart bugs are closed, and the new Lows are deferred under the 2026-10-23 rule.
- **REGRESSION is not due:** the last one was 2026-11-13, and the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference
- **Carried** from `tasks/round-501.md` §1:
  - direction A, "a brass pill";
  - the Artlist and Epidemic pill CTAs;
  - DESIGN_SYSTEM's radius rule "Store CTAs use pill".
- **Store rule:** standalone CTAs are pills. An action inside a notice row uses the default shape, as dialog actions do (product-designer).
- **Ableton:** does not apply (Store pages).

| Point | Reference / rule | CZABA after this round | Deviation (reason) |
|---|---|---|---|
| Action inside a notice (cart "Upgrade") | default shape; touch target ≥ 44 px | primary `sm`, 8 px, `min-h-11`, `shrink-0` | D1: 104×32 → 104×44; black text → `text-background`; 500 → 600; 4 → 8 px; hover `brand/90` → `brand-hover`; the notice grows 64 → 70 px at `lg` |
| Standalone page action ("Create a scene") | brass pill | primary `md` pill, `mb-6 min-h-11` | D2: 12 px → pill; padding `0 16px` → `10px 16px`; the box stays 131×44 |
| Section CTA ("Browse the Collection") | brass pill, same as the Hero CTA [K8] | primary `lg` pill | D3: 257×58 → 241×48; the hover/press scale is removed; the section is 9–10 px shorter |
| Press / shadow | — | `active:opacity-90`, `shadow-sm` | all three: new |
| Keyboard focus | the shared ring (SABA-B-4) | unchanged: `:focus-visible`, solid, offset 2 px | none |

## 2. What changes: sketch `b-round-502/sketch-503.patch.txt`
sha256 `<SHA>` (`b-round-502/sketch-sha.txt`; history in `sketch-sha-history.txt`).

| File | Change |
|---|---|
| `app/routes/cart.tsx` | "Upgrade" `<Link>` [K3]: the HEAD class string → `className={buildButtonClassName({ size: 'sm', className: 'min-h-11 shrink-0' })}`. `buildButtonClassName` is added to the `~/components/ui` import. Children, `to` and the `owns_same` branch [K6] are unchanged |
| `app/routes/recordings.$productId.tsx` | "Create a scene" `<Link>` [K4]: → `className={buildButtonClassName({ shape: 'pill', className: 'mb-6 min-h-11' })}`. Import as above. The render condition [K7] is unchanged |
| `app/components/home/StudioShowcase.tsx` | "Browse the Collection" [K5]: → `<Link to="/store" className={buildButtonClassName({ size: 'lg', shape: 'pill' })}>` (Biome joins it onto one line). `import { buildButtonClassName } from '~/components/ui';`. The motion wrapper, span and arrow are unchanged |
| `app/lib/__tests__/store-button-cleanup-2b3.test.tsx` (new) | B2B3-0 to B2B3-7 (12 tests): 0 = three literal oracles equal the builder; 1 = cart Upgrade rendered for owned Universal and owned Standard (class, `href`, svg then label, no `text-black`); 2 = no Upgrade for owned Premium, not owned, or buying Premium over Standard; 3 = Create a scene rendered for a Universal catalogue (class, `href`, text); 4 = none for Standard, or for Universal with 0 recordings; 5 = showcase link in its section (class, `href`, no `scale` token, span then svg); 6 = brace-aware scan of the three files (0 hand-rolled solid brass Link/a/button, at least 1 builder call each); 7 = the scanner's self-test on the three HEAD shapes, the builder form and an `onClick={() => …}` tag |
| `docs/design/DESIGN_SYSTEM.md` | shape table: the default row adds "an action inside a notice (cart "Upgrade", `sm`, `min-h-11`)"; the pill row adds recordings "Create a scene" (`md`, `min-h-11`) and the home Studio showcase "Browse the Collection". The two-shapes sentence below the table names the notice action at 8 px [K18] |
| `docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md` | l.4 → `**სტატუსი:** Completed (C round 502 PASS)` [K16] (B-R502-DOC323-L28-STATUS) |
| `docs/implementation/2026/quarter-IV/324-dpg-button-cleanup-stage-2b-3.md` (new) | l.4 `**სტატუსი:** In Progress (stage 2b-3 of DPG-BUTTON-CLEANUP-2; C round 503 PASS)` [K15]; the 7 TEMPLATE headings; deviations D1–D3; ledger `b-round-502/doc-ledger.md` |

**Sweep (L23)** [K13]:
- The labels, removed tokens and module paths hit test-root files. Each one is in the covering set and green on the sketch. `product-price-cards` has "Upgrade" (another component); `store-button-cleanup-2b`'s `text-black` pin covers its own sites.
- The e2e homepage locator is `a[href="/store"]` with the text [K14], and both are kept.
- K19: no `C round N pending` line exists. Each `In Progress (stage` hit belongs to an open DPG stage, or is doc 324 itself.

**L31 timeout headroom** [K20]: BC1b took 2,248 ms at gate 502 and 2,348 ms in B's covering run, against the 5 s default (47 %). No other covering test is above 600 ms. A's BC1b time above 2,500 ms is a STOP.

## 3. A: what to implement
1. From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-502/sketch-503.patch.txt`, then `git apply` on the same path;
   - run check 4 and check 1 again (rc 0).
2. **Grants:** the 7 files in the §2 table, exactly as the sketch writes them. Nothing else changes.
3. **Run.** Save the logs under `a-round-503/`. Each expected value is B's sketch output, and a difference is a STOP:
   - `npm run typecheck`: rc 0 (`typecheck.log`; B: `b-round-502/precheck-tsc.log`).
   - `npm run lint`: rc 0, "Found 179 warnings." (`lint.log`; B: `precheck-lint.log`) [K26].
   - `npx biome check app/routes/cart.tsx 'app/routes/recordings.$productId.tsx' app/components/home/StudioShowcase.tsx app/lib/__tests__/store-button-cleanup-2b3.test.tsx`: rc 0, "Found 6 warnings." (`biome-scoped.log`; B: `precheck-biome.log`).
   - `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-502/covering-files.txt)`: 13 files, 122/122, with the B2B3-0…B2B3-7 lines present, and BC1b ≤ 2,500 ms (`covering.log`; B: `precheck-covering.log`).
   - The code-reviewer on the whole change against `882854e`. The 3+ file rule applies; give it `git diff 882854e` and the two untracked files.
   - Not run by A: the full suite and the build. B ran both on the sketch tree: `precheck-full.log` (300 files / 4,353 tests, rc 0) and `precheck-build-sketch.log` (rc 0) [K27].
4. Write `a-round-503.md` with the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-503.md`, `c-round-503.json` and `c-round-503/progress.json` as it goes, heaviest rows first (L59). CART-UPGRADE and REC-SCENE rows are **-STUBBED** (L36): Playwright `page.route` on `/api/auth/profile`, `/api/cart`, `/api/downloads` and `/api/products/1/recordings`, with `localStorage.auth_user` set. They prove the client path only. The real-backend half is **BLOCKED: backend unavailable in cloud** and goes under `blocked`. That does not make `browserVerified` false.

**Environment:**
- The store dev server at `http://127.0.0.1:5173`.
- **Mock API** (the home page needs it): start `node mock-api/server.mjs` from the loop folder. Stop it by exact PID with `ps -eo pid,args | awk '$2=="node" && $3=="mock-api/server.mjs"{print $1}'`, never `pkill -f`.
- **Warm up (L38):** load `/`, `/cart` and `/recordings/1` once in a browser before measuring. A cold first run that crashes or finds 0 targets is environment-invalid and is replaced.

**Harness** (all under `b-round-502/probe/`, `BASE=http://127.0.0.1:5173`):
- `node measure-503.mjs <c-round-503/after> after`. It covers 3 targets × 1440×900, 1280×720 and 375×812: rest, hover, mouse press, keyboard focus (Escape, then focus) and the neighbour boxes.
- `node journey-503.mjs <c-round-503/after> after`. These are real mouse clicks at the element centre, at 1440 and 375.
- `node ../../b-round-501/probe/cart-actions.mjs <dir> after` and `node ../../b-round-501/probe/c7-journey.mjs <dir> after`, as neighbours.

The oracles are `probe/sketch/sketch.json`, `probe/sketch/sketch-journey.json`, `probe/nb-sketch/sketch-actions.json` and `probe/nb-sketch/sketch-c7.json`. The HEAD values are in `probe/head/` and `probe/nb-head/`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 5 modified (`cart.tsx`, `recordings.$productId.tsx`, `StudioShowcase.tsx`, `DESIGN_SYSTEM.md`, doc 323) and 2 untracked (the 2b-3 test, doc 324). Checks 1, 2 and 4 rc 0 |
| C1 | REST-STUBBED (3 targets × 3 viewports) | `measure-503.mjs` | `count` 1 in every row. Each `rest` field equals `sketch.json`, with boxes ±1 px. All: bg `rgb(201, 164, 106)`, color `rgb(14, 13, 12)`, weight 600, `boxShadow` ending `rgba(4, 5, 6, 0.3) 0px 1px 2px 0px` (HEAD `none`). Upgrade: 104×44, radius `8px`, 14px, padding `6px 12px`, `flexShrink` `0`, svg colour `rgb(14, 13, 12)` (HEAD 104×32, black text, 4px, 500). Scene: 131×44, radius `9999px`, padding `10px 16px`. Browse: 241×48, radius `9999px`, 16px, padding `12px 24px` (HEAD 257×58, `16px 32px`) |
| C2 | HOVER + PRESS | the `hover` and `press` fields | Hover bg `rgb(217, 184, 127)` on all three, and `hover.transform` `none` on Browse (HEAD `matrix(1.05, …)`). Press: opacity `0.9` and `transform` `none` on all three (HEAD Browse `matrix(0.98, …)`, HEAD opacity 1). `press.focusVisible` false |
| C3 | KEYBOARD FOCUS | the `focus` fields, plus the `*-focus-crop.png` crops | `source` `keyboard`, `focusVisible` true, outline `solid` with offset `2px` in all 9 rows (equal to HEAD). At least 3 crops viewed (one per target) with the ring visible |
| C4 | CONTRAST | `restContrast` / `hoverContrast` | 8.32 / 10.28 in all 9 rows. A failure is a Medium |
| C5 | NEIGHBOURS | `context` fields | Upgrade notice: `h` 70 at 1440 and 1280, 168 at 375 (HEAD 64 / 64 / 168); `ownLines` 1 / 1 / 3; card 225 / 225 / 323 (HEAD 219 / 219 / 323); `remove` box equal to `sketch.json`. Scene: `header` and `next` (`UL`) boxes equal to HEAD. Browse: `section.h` 1445 / 1445 / 1703, `wrap.h` 48, `grid` equal to HEAD. Full-page screenshots `after-CART-UPGRADE-375.png` and `after-SHOWCASE-BROWSE-1440.png` viewed: the label stays on one line, and nothing overlaps |
| C6 | CART NEIGHBOURS-STUBBED | `cart-actions.mjs` and `c7-journey.mjs` | JSON equal to `probe/nb-sketch/sketch-actions.json` and `sketch-c7.json` (both are equal to HEAD). Anonymous Checkout opens Sign in with 0 POSTs; signed-in sends 1 POST; the Remove dialog opens and closes |
| C7 | JOURNEY (L54) | `journey-503.mjs` | 6 rows: `count` 1, `hit` true, `ok` true, and `arrived` `/store`, `/products/stub-track?upgrade=premium` and `/scenes/1`. Equal to `sketch-journey.json` without `errors`. One before and one after screenshot per row viewed |
| C8 | GREP | from `store/`: `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-497/scan-brand.py . /tmp/s.json`; `grep -c 'buildButtonClassName(' <3 files>` | `100 hits; 38 solid` (HEAD 104 / 41); 1, 1, 1 |
| C9 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-502/covering-files.txt)` | 13 files, 122/122; the B2B3-0…B2B3-7 lines present; BC1b ≤ 2,500 ms |
| C10 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules`, `.git` and `build`) to a folder outside `store/`, symlink `node_modules`, then run `python3 -I b-round-502/mutants-503.py <copy> <absolute c-round-503/mutant-logs>` | M1–M16 all RED, each on the rows in `b-round-502/mutants-503.txt` (`summary.txt` lines end `OK`), and `restored rc 0` |
| C11 | DOCS | `git diff 882854e -- docs/design/DESIGN_SYSTEM.md docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md`; doc 324 | DESIGN_SYSTEM: exactly 3 changed lines (the default and pill rows of the shape table, and the two-shapes sentence). Doc 323: only l.4, byte-equal to `**სტატუსი:** Completed (C round 502 PASS)`. Doc 324: the 7 headings (L26 subsequence) and l.4 byte-equal to `**სტატუსი:** In Progress (stage 2b-3 of DPG-BUTTON-CLEANUP-2; C round 503 PASS)`. **Full trace:** every row of `b-round-502/doc-ledger.md` checked against its source. `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 |
| C12 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link. `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each). Check 2 rc 0 |
| C13 | CLAIMS | `bash b-round-502/claims-503.sh` (default tree), compared with `b-round-502/claims-503-sketch-output.txt` | No `MISSING`. Output identical except K1 (HEAD may move to the loop-state commit), K2 (the sketch output read the clean store) and K33 locations (archive moves) |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-503.json c-round-503/l57-check.txt` | As C0; rc 0. The JSON carries all L57 fields. `mutantRedOnSketch` names `b-round-502/mutants-503.txt` |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Blocked:** CART-REAL-BACKEND-503, the Upgrade notice and the recordings catalogue with a real backend ("backend unavailable in cloud").
- **Neighbours that could break:**
  - the cart notice layout at 375 (C5);
  - Remove and Checkout on `/cart` (C6);
  - the recordings header and list (C5);
  - the home showcase section height and the next section (C5);
  - the e2e homepage locator (K14).
- **L22:** if A STOPs, C runs C0, C13 and C14 only.
- **Closing:** with C PASS and `browserVerified` true, stage 2b-3 is verified and doc 323 is complete.

## 5. B's pre-check (`b-round-502/`, on `/home/runner/b502-scratch` = a `git archive` of HEAD plus the sketch, outside `store/`)
| Check | Result | Log |
|---|---|---|
| tsc / lint / Biome (4 code and test files) | rc 0 / rc 0, 179 warnings (= HEAD) / rc 0, 6 warnings (= HEAD) | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log` |
| Covering tests | 13 files, 122/122 | `precheck-covering.log` |
| Full suite on the sketch tree | 300 files / 4,353 tests, rc 0 | `precheck-full.log` |
| Build on the sketch tree (docs included) | rc 0 | `precheck-build-sketch.log` |
| Browser, HEAD (:5173) vs sketch (a second dev server on :5174 with its own `cacheDir`) | §1 table, C1–C7 | `probe/head.out`, `probe/sketch.out`, `probe/*-journey.out`, `probe/nb-head/`, `probe/nb-sketch/` |
| Mutants (on a separate copy) | M1–M16 RED on their expected rows; `restored rc 0` | `mutants-503.txt`, `mutant-logs/` |
| Scanner | 104/41 → 100/38 | `scan-head.json`, `scan-sketch.json`, `scan-sketch.txt` |
| Patch reproduces the tree | `git apply` on a fresh `git archive` of HEAD: all 7 files `cmp`-equal to the scratch; check 4 rc 0 there; check 1 rc 0 on `store/` | (this table) |
| Sketch review | <REVIEW-ROW> | `sketch-review.md` |
| Claims | HEAD and sketch outputs, no MISSING | `claims-503-planning-output.txt`, `claims-503-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **2c PurchaseHeader** (inventory A3; purchase protection: a click-still-works row against the mock API, buy/add-to-cart handlers unchanged, `bg-buy` untouched). Then **2d** chat, **2e** LeadMagnet (keep-list restyle), **NONBRAND** and PD-R498-404-SECONDARY-ALIGN.
3. At the stage-2 close: decide SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER. A bounded frontend-architect checkpoint goes to root only if that proposes a new ui primitive.
4. Then the rest of DPG P1 (CSS-DEDUP, COLOR-CONSOLIDATE, FONT-RESOLVE), the DP-gate re-run with root, and P2. RETRO at round 510.

## Claims (`b-round-502/claims-503.sh`; planning output `claims-503-planning-output.txt` on HEAD, sketch output `claims-503-sketch-output.txt` on `/home/runner/b502-verify`)
K1 HEAD · K2 worktree counts · K3 cart Upgrade old/new class · K4 scene old/new class · K5 showcase old/new class · K6 owns_same branch and returns · K7 scene condition · K8 HeroSection precedent · K9 `:active` scale selectors and DESIGN_SYSTEM sentence · K10 `_index` renders StudioShowcase · K11 scanner · K12 same-name view-all link · K13 SWEEP · K14 e2e locator · K15 doc 324 l.4 and headings · K16 doc 323 l.4 · K17 docs 320–322 · K18 DESIGN_SYSTEM phrases · K19 pending / In Progress (stage grep · K20 L31 timings · K21 gate 502 and c-round-502 · K22 c-round-502 L57 · K23 frozen list sizes · K24 granted paths not protected · K25 new rows · K26 lint/Biome counts · K27 full suite/build · K28 mutants · K29 probe key values · K30 journeys · K31 cart neighbours · K32 artifacts · K33 ids · K34 L58 check.
