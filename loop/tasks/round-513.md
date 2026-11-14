# Round 513: DPG-BUTTON-CLEANUP-2-NONBRAND stage N3, the cookie banner. Accept and Decline onto `Button` (equal weight), Close onto `IconButton`

**Planned by:** B at the round 512 → 513 planning, 2026-11-14 (`b-round-512.md`). Round 512's task is archived as `tasks/round-512.md` (byte copy).
- **Advisor:** available. Consulted after orientation and before writing, and again before hand-off.
- **Consults (run, saved):**
  - `product-designer` approved (`b-round-512/consult-product-designer.md`).
  - `tech-lead` reviewed the sketch: approve, 6 Lows ruled (`b-round-512/sketch-review.md`).

## Decisions (`backlog.json` v519, `decisions_log_b`)
- **D-29z1860:** round 512 is accepted, so N2 is complete. The gate published `cbc5709` [K3] [K4].
- **D-29z1861:** the round-512 Lows and gate 512's review items are recorded (see `b-round-512.md`).
- **D-29z1862:** this round is NONBRAND N3. Saba has not answered SABA-Q-507-COOKIE-WEIGHT, so the default already sent to him ships: equal weight. The question stays open, and the variant is a one-prop swap.
- **D-29z1863:** design gate 2 (2026-11-14) is recorded as DPG2-* ids; none of them is in this round.
- **D-29z1864:** pre-existing focus loss after dismissal is filed as B-R512-COOKIE-DISMISS-FOCUS-LOST (Medium) for **round 514**. This round leaves it unchanged.
- **D-29z1865:** the 375 px crops show the Close X covering the "Privacy" glyphs, at HEAD and on the sketch (`b-round-512/probe/head/banner-375.png`, `probe/sketch/banner-375.png`).
  - It is filed as pre-existing B-R512-COOKIE-CLOSE-OVERLAPS-TEXT (Medium) and paired with the focus bug in round 514.
  - Product-designer's row "the X must not cover the text" is therefore ruled pre-existing for this round, and C1 records it.
  - Also in D-29z1865: tsc on the dispatched sketch, including the test rows, is rc 0; the policy's font decision is recorded.

## Rules
- **Read `lessons.md` first.** Applies: L1, L4, L10, L11, L12, L23, L26, L28, L29, L36, L47, L52, L54, L56, L57, L58, L59, L60.
- **Baseline: HEAD `cbc5709`, clean tree** [K1] [K2].
  - **HEAD-drift rule:** if HEAD moved at A's start, run `git diff --name-only cbc5709 HEAD`.
    - If it touches neither the two grants nor the covering files (`b-round-512/covering-files.txt`), go on. Run frozen check 1 with those paths filtered out (`grep -vF`) and note it.
    - Otherwise STOP. ROOT-REQ-DPG2-APPLIED-NOT-AT-HEAD may land `EntranceCover.tsx` or `.claude/**`.
    - **C applies the same rule:** run C0 check 1 with the drifted paths filtered out, and accept K1, K23 and K24 differences that come only from those paths, with a note.
- **STOP threshold (L10, one clause).** Write "STOP — needs B ruling" and change nothing more if any of these happens:
  - a frozen check is not rc 0;
  - a covering test fails or takes more than 2,500 ms;
  - a Medium-or-higher finding needs a change outside the grants.
- **Pre-ruled (not STOPs; list them under "For B" if raised again):**
  1. The banner root `div` keeps its inline rgba gradient and blur style (A-R183-COOKIE-INLINE-GRADIENT, deferred). CC1 keeps pinning the root class unchanged.
  2. Focus falls to `body` after Decline, Accept or Close, the same as HEAD (B-R512-COOKIE-DISMISS-FOCUS-LOST, round 514). At 375 the Close X covers the end of "Privacy", the same as HEAD (B-R512-COOKIE-CLOSE-OVERLAPS-TEXT, round 514).
  3. The secondary pills barely separate from the near-black banner (bg vs black 1.21:1; B-R512-COOKIE-PILL-LOW-SEPARATION, deferred). Label contrast is 13.94:1.
  4. `Button` renders no `type` attribute; there is no `<form>` here.
  5. The Close tooltip "Close" (IconButton `title`) and its size change from 34 to 32 px are intended.
  6. tech-lead Lows #1–#3 (`sketch-review.md`).
  7. `docs/prompts/modules/analytics.prompt.md` is an old genesis prompt example, not a variant rule [K19].
  8. The stale `.claude/primitives/DESIGN_TOKENS.md` brand row (teal) is a root item [K23]. `app/styles/app.css` is the source of truth.
- **Edits only through `git apply`** of the sketch, plus the editor tool for the new doc. No shell string-replace, `git stash` or `git checkout --` in the store tree (L60).
- **Persistent screen text (L39):** none added or removed. The labels "Decline", "Accept" and "Close" are unchanged.
- **Purchase protection:** the protected files stay byte-identical (check 2). The consent logic is unchanged: `setAnalyticsConsent`, `fbq`, the timer and the Studio-route hide.
- **No full suite.** Full vitest, build, Biome-all, `npm run verify` and `test:e2e:smoke` are gate rows.
- **L29:** code text in §1–§3 that carries no tag is the sketch's content, a row id or a loop path. Every fact about `store/` carries a tag.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`; store `/home/runner/czaba-project/store`.

## Frozen checks (run from `store/`; all rc 0 at planning [K16])
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-512/r513-tree-sha256.txt`: 1,428 tracked files, all except the 2 grants.
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`
3. Before applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-512/r513-pre-sha.txt`
4. After applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-512/r513-post-sketch-sha.txt`. Both granted files must equal B's sketch result.

## 0. Why this round
- **No C bug is open.** C round 512 found 0 bugs [K4].
- **The open High needs root:** B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED requires the backend and the protected `auth` files.
- **REGRESSION is not due:** `regression-last.json` is dated 2026-11-13, so the next one is on or after 2026-11-16 [K21].
- **Order:** NONBRAND continues with stage N3, the cookie banner (product-designer stage 3).

## 1. Reference and ruling
**Reference: how established practice does it.** The Store reference is competitor research plus the consent guidance.
- The EDPB Cookie Banner Taskforce report (adopted 2023-01-17, https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf) advises against colours or contrast that highlight "accept" over the other options. It calls a reject option with barely readable contrast misleading. The consult confirmed this from summaries, not from the PDF; CNIL was not checked.
- Store research (`docs/technical/store-redesign/research/visual-pass.md`): Spitfire and Epidemic show cookie modals that cover the hero, which the research lists as cheap-feeling. CZABA keeps a slim bottom bar.
- **HEAD today:** Accept is a white pill and Decline is muted plain text [K5]. That is the asymmetry the EDPB report describes.

| Point | Ruling | Deviation / reason | C row |
|---|---|---|---|
| Decline | `Button` secondary sm pill | was plain text; equal weight (Saba default, EDPB) | C1, C2 |
| Accept | `Button` secondary sm pill | was a hardcoded white pill; tokens only | C1, C2 |
| Order | Decline, then Accept (HEAD order) | none | C1 |
| Close (below 640 px only) | `IconButton` ghost sm, X 16, `absolute top-2 right-2 sm:hidden` | 34 → 32 px; `text-dim` → `text-muted`; title "Close" | C1, C4 |
| Banner root, text, timer, handlers | unchanged | pre-ruled 1, 2 | C0, C5 |

**States covered:**
- rest and hover at 1440, 1280 and 375;
- keyboard focus-visible (Decline, Accept, and Close at 375);
- mouse press;
- keyboard Enter on Decline and on Accept, and a tap on Close (consent stored, banner gone, focus target recorded);
- the decided state in the journey (no banner on the next pages);
- `/studio-lab` with GA4 set (no banner);
- reduced motion: not applicable (no motion added).

## 2. What changes (grants: 2 tracked paths + 1 new doc)
| File | Change |
|---|---|
| `app/components/common/CookieConsent.tsx` | From `store/`: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-512/sketch-513.patch.txt` (sha256 `cd99584499de805a5b7c554b0b6308de458ebff94f5056e4dde9ce87a7ef81d8` [K12]). This one apply covers both tracked files byte-equal; make no other edit |
| `app/components/common/__tests__/CookieConsent.test.tsx` | Same patch: the imports (`cleanup`, `readFileSync`, `resolve`, `buildButtonClassName`, `IconButton`) and a describe with rows N3-1…N3-6 |
| `docs/implementation/2026/quarter-IV/331-dpg-nonbrand-stage-n3-cookie-banner.md` (**new**, A writes it) | The seven TEMPLATE headings in order (L26). l.4 is exactly `**სტატუსი:** Completed (C round 513 PASS)` (L28). It names the three controls, D-29z1862, SABA-Q-507-COOKIE-WEIGHT, B-R512-COOKIE-DISMISS-FOCUS-LOST, and only test rows that exist. It may name only Tailwind tokens that appear in `app/**` at HEAD or in the sketch. Write `a-round-513/doc-ledger.md` from `b-round-512/doc-ledger-template.md`: one source per behaviour sentence |

## 3. A: what to do
1. Run frozen checks 1–3 (rc 0). Read these files:
   - primitives `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md` (pre-ruled 8), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `.claude/prompts/new-test.md`.
2. Apply the sketch, then run frozen check 4 (rc 0). Write doc 331 and the ledger.
3. Save the following under `a-round-513/`:
   - `npm run typecheck` rc 0.
   - `npm run lint` rc 0 with **171** warnings. HEAD has 174; the sketch has 171 because the three `useButtonType` hits leave [K9].
   - `npx biome check app/components/common/CookieConsent.tsx app/components/common/__tests__/CookieConsent.test.tsx` rc 0, no fixes.
   - **Covering:** `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-512/covering-files.txt)` gives rc 0, 6 files and **88** tests (B's sketch run [K11]), with N3-1…N3-6 present and no test above 2,500 ms.
   - **Scanner:** `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/scan-nonbrand-motion.py . /tmp/n3.json` gives **50**, with no CookieConsent entry. HEAD has 51 [K8].
   - **code-reviewer** on `git diff cbc5709` plus doc 331, with its Architecture note.
   - No mutants: B ran M1–M13 on the sketch [K14]. C re-runs them on A's tree.
4. Write `a-round-513.md`. No full suite, no build.

## 4. C: what to verify
Write `c-round-513.md`, `c-round-513.json` and `c-round-513/progress.json` as you go. Run the browser rows first (L59).

**Environment.** The banner renders only when `VITE_GA4_MEASUREMENT_ID` is set [K7], and `:5173` has none.
1. Make a copy of `store/` after A's change: tracked plus untracked files, `node_modules` symlinked. In the copy only, give `vite.config.ts` `cacheDir: '/tmp/c513-vitecache'` (L38).
2. Start the server: `VITE_GA4_MEASUREMENT_ID=G-C513TEST npx remix vite:dev --host 127.0.0.1 --port 5174`.
3. Mock API on `:5199`: if `/__mock/health` fails, start `node mock-api/server.mjs` from the loop root. Stop both by PID at the end.
4. Harnesses: copy `b-round-512/probe/n3-banner.mjs` and `n3-journey.mjs` into `c-round-513/`. Run `node n3-banner.mjs http://127.0.0.1:5174 <dir>` and `node n3-journey.mjs http://127.0.0.1:5174 <dir>`.
   - The scripts abort GA hosts.
   - They set `czaba_lead_magnet_dismissed` and `czaba_entrance_seen`.
   - They warm up once.
5. Expected values come from B's sketch run (`b-round-512/probe/sketch/n3.json`, `sketch-journey/journey.json`) [K17] [K25]. HEAD values are in `probe/head/n3.json`. A cold-Vite hydration error that a warm re-run clears is environment (INFO-C510-COLD-HYDRATION).

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start and end) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | Exactly 3 paths: 2 `M` plus the untracked doc 331. Every check rc 0 |
| C1 | REST (1440, 1280, 375) | `n3-banner.mjs`, `rest` | Decline and Accept: radius 9999px, weight 600, bg rgb(29,26,23), text rgb(236,230,218), border 1px rgb(36,33,30), height 34 ±0.5, equal top; widths 78 / 75 ±1. Order `[Decline, Accept, Close]`. Close: `display:none` at 1440 and 1280; 32×32 ±0.5 at 375, radius 12px, title "Close". **Record** the overlap of the Close box with the "Privacy" glyphs at 375 with a crop: it is equal to HEAD (34×34 at x 333, y 696; pre-ruled 2, D-29z1865), not a FAIL. No page errors after warm-up |
| C2 | HOVER + PRESS | `hover`, `mousePress` | On hover both buttons go to bg rgb(36,33,30) and border rgb(46,42,38), the same for both. A mouse press gives opacity 0.9, outline none, `:focus-visible` false. Crops saved |
| C3 | KEYBOARD (L47) | `keyboard` | From the banner's Privacy link, Tab reaches Decline, then Accept, then (375 only) Close. Each has `:focus-visible` true and outline `solid 1px` brass at 0.8 with offset 2px, the same as HEAD. Crops show the ring is not clipped |
| C4 | ACTIONS + CONSENT | `actions` | Enter on Decline stores `denied`; Enter on Accept stores `granted`; a click on Close (375) stores `denied`. The banner is gone after each (0 Accept buttons). **Record** `focusAfter`/`firstTabAfter`; both equal HEAD (BODY, then "CZABA"; pre-ruled 2) |
| C5 | JOURNEY (L54) | `n3-journey.mjs` at 1440 and 1280 | `/` → Decline by keyboard → header link to `/store` → `/products/middle-east`: consent `denied`; 0 banner buttons at each step; a screenshot per step; 0 page errors |
| C6 | STUDIO + PROTECTION | `studio` part of `n3-banner.mjs`; plus `c-round-511/prot.mjs` on `:5173` | `/studio-lab` shows 0 banner buttons with GA4 set, and the demo workspace. `/studio/middle-east` and `/account/downloads` show "Sign in required" with no download link (wait at least 7 s). Unauthenticated `GET /api/studio-token?product=middle-east&file=stem.mp3` returns 401 with no URL. Check 2 rc 0 |
| C7 | TESTS + MUTANTS | The §3 covering command; `python3 -I b-round-512/mutants-513.py <copy> c-round-513/mut-logs` on a copy outside `store/` with A's tree | rc 0, 6 files, 88 tests, N3-1…N3-6 present, none above 2,500 ms. Each of M1–M13 is red on the rows in `b-round-512/mut-logs/mutants-summary.json` [K14]. Delete the copy afterwards |
| C8 | GREP + SCANNER + LINT | from `store/` | `grep -c '<button' app/components/common/CookieConsent.tsx` = 0. Scanner 50 with no CookieConsent entry. `npm run lint` shows 171 warnings |
| C9 | DOC 331 + LEDGER | doc 331, `a-round-513/doc-ledger.md` | The 7 headings in order. l.4 byte-equal to `**სტატუსი:** Completed (C round 513 PASS)`. `grep -c 'pending'` = 0. Every cited row id exists in the test file. The ledger gives one source per behaviour sentence |
| C10 | CLAIMS + L57 | `bash b-round-512/claims-513.sh` compared with `b-round-512/claims-513-planning-output.txt`; `python3 -I tools/l57-check.py c-round-513.json c-round-513/l57-check.txt` | No MISSING. The differences equal `b-round-512/claims-513-allowed-delta.txt`: the claims output on a sketch-applied clone, which shows K2 with 3 paths and K16 pre-sha FAILED by design. L57 rc 0 |

- **Gate rows** (list under `gate`, never `passed`): full vitest suite, build, Biome-all, `npm run verify`, `test:e2e:smoke`.
- **Blocked:** none expected.
- **L57:** write all L57 fields:
  - `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding;
  - `assertsSpecified`;
  - `mutantsRecorded`;
  - `mutantRedOnSketch`: `b-round-512/mut-logs/mutants-summary.json`;
  - `mutantRedOnTree`: C's run;
  - `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-512/precheck-full.log`, `precheck-tsc-dispatched.log`), `chainHeadGateRunGreen`;
  - `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-512/sketch-covering.log`, `probe/sketch/`).
- **L22:** if A STOPs with no diff, run C0, C6 and C10 only. A STOP that names an unruled Medium+ is a short FAIL.
- **Neighbours that could break:**
  - CC1–CC6 (root class, Studio hide, route change, decisions, Privacy link);
  - IL4 (the banner Link keeps focus) [K22];
  - store-theme-tokens, store-focus-ring and store-gradient-text scans.

  All are in the covering set [K11].
- **On closing:**
  - A C PASS with `browserVerified` true completes N3.
  - It closes A-R183-COOKIE-BUTTON-TYPE and A-R183-REVIEW-FBQ-BRANCH.
  - SABA-Q-507-COOKIE-WEIGHT stays open.

## 5. B's pre-check (`b-round-512/`)
| Check | Result | File |
|---|---|---|
| Full suite on the product sketch, before the N3 rows were added | 306 files, 4,405 tests, rc 0; tsc rc 0 | `precheck-full.log`, `precheck-tsc.log` [K13] |
| tsc on the dispatched sketch (product and test rows) | rc 0 | `precheck-tsc-dispatched.log` [K13] |
| Claims on a sketch-applied clone (C10's allowed delta) | only K2 and K16 differ | `claims-513-sketch-output.txt`, `claims-513-allowed-delta.txt` [K24] |
| Covering set | HEAD 6/82; sketch with rows 6/88; slowest test 181 ms | `head-covering.log`, `sketch-covering.log` [K11] |
| Mutants M1–M13 | each red on its named row | `mut-logs/` [K14] |
| N3 rows on the HEAD product file | N3-1, N3-3 and N3-5 red; N3-2, N3-4 and N3-6 green (behaviour pins, proven by M4, M5, M11 and M13) | `n3-rows-on-head.log` [K15] |
| Browser, HEAD :5175 vs sketch :5174, GA4 set, separate caches | 3 viewports; actions; Studio routes | `probe/head/`, `probe/sketch/` [K17] |
| Journey on the sketch | consent denied; 0 banners on `/store` and the product page | `probe/sketch-journey/` [K25] |
| Lint and scanner | 174 → 171; 51 → 50 | [K8] [K9] |
| Reviews | product-designer approve; tech-lead approve | consult and `sketch-review.md` |

## 6. After this round
1. **Round 514:** B-R512-COOKIE-DISMISS-FOCUS-LOST and B-R512-COOKIE-CLOSE-OVERLAPS-TEXT (both Medium, the same banner). B names the focus target with product-designer (L47).
2. **REGRESSION** on or after 2026-11-16.
3. **NONBRAND N4–N9.**
4. Then:
   - PD-R498-404-SECONDARY-ALIGN, then DPG-BUTTON-CONTRACT-TABLE;
   - the rest of DPG P1 (including the DPG2-* ids), the DP gate, then P2;
   - STORE-2c…5, then ARCH-SPLIT, then REVIEW-RECOMMENDATIONS, then the rest of the queue.

## Claims (`b-round-512/claims-513.sh`; planning output `b-round-512/claims-513-planning-output.txt`)
- **K1–K4:** HEAD, the clean tree, gate 512 and the C 512 verdict.
- **K5:** the banner's sites at HEAD.
- **K6:** the Button and IconButton classes.
- **K7:** the GA4 render condition.
- **K8:** scanner. **K9:** lint. **K10:** test greps. **K11:** covering.
- **K12:** sketch sha, temp-copy apply and post pin, and the L58 check.
- **K13:** full suite on the sketch. **K14:** mutants. **K15:** N3 rows on HEAD.
- **K16:** frozen pins.
- **K17:** browser probes. **K25:** journey.
- **K18:** cookie findings. **K19:** doc greps. **K20:** C 512 L57 check. **K21:** regression date.
- **K22:** IL4. **K23:** design-gate-2 facts at HEAD.
- **K24:** artifacts.
