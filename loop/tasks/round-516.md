# Round 516: NONBRAND N4 (Home). The two special-offer links and the LeadMagnet Close X move onto the shared Button / IconButton

**Planned by:** B at the round 515 → 516 planning, 2026-11-14 (`b-round-515.md`). Round 515's task is archived as `tasks/round-515.md` (byte copy).
- **Advisor:** available. Consulted after orientation (before writing) and again before hand-off.
- **Consults (run, saved):**
  - `product-designer` (`b-round-515/consult-product-designer.md`): it confirmed the round-506 ruling for the links and ruled the Close position (compensate the inset so the glyph does not move).
  - `tech-lead` sketch review (`b-round-515/sketch-review.md`): approve-with-changes. The one change is applied: N4-2 pins `<Link\b` = 2, which kills mutant M12.

## Decisions (`backlog.json` v523, `decisions_log_b`)
- **D-29z1872:** round 515 is accepted (C PASS, `browserVerified` true; gate 515 published `63c8894`) [K3] [K4].
  - A-R514-R2 and A-R514-R3 are closed.
  - GATE514-M1: the browser half is verified. It stays open only for the real phone keyboard (TLM-R515-PHONE-KEYBOARD, manual, non-blocking).
  - C-R514-01 stays open for Safari.
- **D-29z1873:** gate 515's review is recorded (all Low/info). A's reviewer Medium A-R515-REVIEW-SELECTOR-ROWS is re-rated Low: the behaviour is proven, only rows are missing. It is deferred with the other A-R515 Lows.
- **D-29z1874:** this round's scope and ruling (§1).
- **D-29z1875:** hand-off amendments after the advisor review (link boxes, mutants on a copy, L38, docs/e2e inventory, claims K11/K19); INFO-B515-SHARED-VITE-CACHE recorded.

## Rules
- **Read `lessons.md` first.** Applies: L1, L3, L4, L10, L11, L12, L15, L23, L26, L28, L29, L39, L47, L54, L56, L57, L58, L60, L61 (not applicable: no native control is added).
- **Baseline: HEAD `63c8894`, clean tree** [K1] [K2].
  - **HEAD-drift rule:** if HEAD moved at A's start, run `git diff --name-only 63c8894 HEAD`.
    - If it touches neither the grants (§2) nor the covering files (`b-round-515/covering-files.txt`), go on. Run frozen check 1 with those paths filtered out (`grep -vF`) and note it.
    - Otherwise STOP. C applies the same rule to C0 and to claim differences that come only from drifted paths, with a note.
- **STOP threshold (L10, one clause).** Write "STOP — needs B ruling" and change nothing more if any of these happens:
  - a frozen check is not rc 0;
  - a covering test fails or takes more than 2,500 ms;
  - a Medium-or-higher finding needs a change outside the grants.
- **Pre-ruled (not STOPs; list them under "For B" if raised again):**
  1. **Keep-list items (Saba).** The SpecialOffers section and the LeadMagnet popup are restyled only. No copy, target or position changes. The radius, weight and glyph-size deltas in §1 are the ruled restyle.
  2. **Close position.** `top-4 right-4` on a 48 px box keeps the glyph centre at 40 px from the top and right edges, as at HEAD (B probe: 40/40 at every width [K11]). This rule **wins over** "use the primitive's default placement".
  3. **The Close X gains a native `title="Close"` tooltip** from IconButton. product-designer accepts it (it equals the accessible name).
  4. **Pressed scale.** A pressed read shows `matrix(0.9875…)` at HEAD and on the sketch alike (mid-transition at 80 ms). It is recorded, not asserted.
  5. **Outline width reads `1px`** in Chromium for the 1.5 px ring, both at HEAD and on the sketch (engine rounding, L15). C compares it with HEAD and does not assert 1.5.
  6. **HEAD Close contrast `1.08` in the probe is an artefact.** The probe's `lum()` ignores the alpha of `foreground/60`. The sketch colour is opaque (`rgb(163,155,142)`), so its 7.06 is valid. Only the sketch value is asserted.
  7. **The scanner stays as is.** It still misses controls without padding or rounding (the round-506 note). This round removes the two SpecialOffers hits: 50 → 48 [K5].
  8. Other NONBRAND stages (N5 cart … N9 hero) and the StemsPlayerModal pair are not touched.
  9. **Docs and e2e outside the grants (inventory by grep, `b-round-515/doc-e2e-inventory.txt`):**
     - `docs/design/DESIGN_SYSTEM.md` l.1161 lists example users of the `default` shape. It is not exhaustive: round 513's cookie pills are not listed either, and C round 513 passed. It is **not granted**; DPG-BUTTON-CONTRACT-TABLE owns the full list.
     - Doc 327 l.63 names the LeadMagnet Close as NONBRAND work to come. Older implementation docs stay byte-identical (check 1). Doc 334 states that it completes that item.
     - `e2e/auth-modal.spec.ts:65` and `e2e/accessibility.spec.ts:60` select `button[aria-label="Close"]`. IconButton still renders a `<button>` with that label, so the selectors keep matching (gate e2e smoke).
- **Edits only through `git apply`** of the sketch, plus the editor tool for the new doc and the ledger. No shell string-replace, `git stash` or `git checkout --` in the store tree (L60).
- **Strengthen-only (A-R514-SPEC-STRENGTHEN-ONLY):** A proposes further rows under "For B" and does not edit the pinned bytes.
- **Persistent screen text (L39):** none is added or removed. The only new text is the hover tooltip "Close" (a quieter home by L39).
- **Purchase protection:** the protected files stay byte-identical (check 2). No auth, purchase, download or Studio file is in the grants.
- **No full suite.** Full vitest, build, Biome-all, `npm run verify` and `test:e2e:smoke` are gate rows. B's own pre-check of the full suite on the sketch is evidence only [K18].
- **L29:** code text that carries no tag is the sketch's content, a row id or a loop path. Every fact about `store/` carries a tag.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`; store `/home/runner/czaba-project/store`.

## Frozen checks (run from `store/`; all rc 0 at planning [K15])
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-515/r516-tree-sha256.txt`: 1,430 tracked files, all except the 3 tracked grants.
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`
3. Before applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-515/r516-pre-sha.txt`
4. After applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-515/r516-post-sketch-sha.txt`. All 4 files (3 tracked grants and the new test) must equal B's sketch result.

## 0. Why this round
- **The bug gate is clear for this stage.**
  - Gate 515's review has Lows and info only (D-29z1873).
  - The open High B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED needs root and the backend.
  - The other open Mediums are manual, root-only or awaiting Saba (`context/active-summary.md`). None reproduces in the cloud on this code.
- **REGRESSION is not due:** `regression-last.json` is dated 2026-11-13, so the next one is on or after 2026-11-16 [K16]. The next RETRO is at 525.
- **NONBRAND (Saba DPG item 7, Medium, in progress)** is next in DPG-FIX P1. Stage N4 is the Home stage from product-designer's round-506 stage list:
  - **SpecialOffers:** two hand-rolled `<Link>` buttons [K5] [K6].
  - **LeadMagnet:** the hand-rolled Close `<button>`, a scanner miss [K7].

## 1. Reference and ruling
**Reference: established practice** (Store; Ableton conformance does not apply). Sources:
- `docs/design/DESIGN_SYSTEM.md`, "Square buttons for icons only" (product-designer round-506 consult).
- WCAG 2.2 SC 2.5.8 Target Size (Minimum), https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum: 24 × 24 CSS px minimum. The 48 px Close exceeds it.
- WCAG SC 1.4.11 Non-text Contrast (≥ 3:1).
- One shared button system (Saba DPG item 7: "use Button.tsx component only"). Its luxury/competitor research is in `docs/technical/store-redesign/research/`. No other reference was searched for this restyle.

| Point | Ruling | Deviation / reason | C row |
|---|---|---|---|
| "Browse Gift Cards" → `/gift-cards` and "View Collection" → `/store` | `className={buildButtonClassName({ variant: 'secondary', size: 'lg', className: 'w-fit' })}`. Default shape. `w-fit` is kept so the flex-col parent does not stretch them | Restyle: radius 12 → 8 px, weight 500 → 600; box "Browse Gift Cards" 184×51.6 → 186×50, "View Collection" 167×51.6 → 170×50, at every width [K11]. Copy and targets unchanged | C1, C4 |
| LeadMagnet Close | `IconButton variant="ghost" size="lg" label="Close"`, `className="absolute top-4 right-4"`, `<X size={24} />`, `ref={closeButtonRef}`, `type="button"`, `onClick={close}` | Box 32 → 48 px. Glyph 32 → 24 px. Centre is unchanged at 40/40 px. Colour goes from foreground/60 to `text-muted` (7.06:1 on the dialog background) [K11]. Gains the title "Close" | C2 |
| Close keyboard focus | The global `:focus-visible` ring, unchanged | No new ring | C2 |
| Close hover | Ghost: background `elevated` `rgb(29,26,23)`, glyph foreground `rgb(236,230,218)` | New hover fill; HEAD had none | C2 |
| Focus on open / after Close (L47) | On open: the Close button (HEAD and sketch). After a pointer Close: focus returns to the element focused before (B probe: "Browse Gift Cards" at every width, HEAD = sketch) | Unchanged | C2 |
| B2E-6 source pin (round 505) | Was `<button\b` = 1. Now `<button\b` = 0, `<IconButton\b` = 1, `<Button\b` = 3, and the import line names `IconButton` (equal or stronger, L23) | — | C5 |

**States covered:** rest, hover, keyboard focus, pointer press (recorded only), at 375, 1280 and 1440. The popup steps offer, email and success are covered in jsdom (N4-3 ×3).

## 2. What changes (grants: 3 tracked paths + 2 new files)
- `M app/components/home/SpecialOffersSection.tsx`: sketch only.
- `M app/components/marketing/LeadMagnetPopup.tsx`: sketch only.
- `M app/lib/__tests__/store-button-cleanup-2e.test.tsx`: the sketch's B2E-6 change only.
- `?? app/lib/__tests__/store-button-cleanup-n4.test.tsx`: new, sketch only. Rows N4-1, N4-2, N4-3 (×3 steps).
- `?? docs/implementation/2026/quarter-IV/334-dpg-nonbrand-stage-n4-home.md`: new, written by A (number 334 is free [K17]).

Nothing else changes; check 1 pins the rest.

## 3. A: what to do
1. **Before the apply:**
   - Run frozen checks 1–3.
   - Read `lessons.md`, the `pre-flight` skill and these primitives: FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, TAILWIND_FIRST, DESIGN_TOKENS, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, and `prompts/new-test.md`.
   - State the pre-flight in the report.
2. **Apply:** `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-515/sketch-516.patch.txt`.
   - Its sha is `560cdf79…`; verify it with `sha256sum -c b-round-515/sketch-sha.txt`.
   - Then run frozen check 4.
3. **Checks (logs in `a-round-516/`):**
   - `npm run typecheck` rc 0.
   - `npm run lint`: rc 0 and **171** warnings [K14].
   - `npx biome check` on the 4 code/test files: rc 0.
   - Covering run: `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-515/covering-files.txt)`.
     - Expect **16 files / 194 tests** [K13].
     - N4-1, N4-2, N4-3 ×3 and B2E-6 must be present.
     - No test may take more than 2,500 ms.
   - Scanner: `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/scan-nonbrand-motion.py . a-round-516/scanner.json` → **48** hits, 0 SpecialOffers entries [K5].
4. **Doc 334** follows `docs/implementation/TEMPLATE.md`: 7 headings in order, in Georgian with English terms.
   - l.4 exactly `**სტატუსი:** Completed (C round 516 PASS)` (L28).
   - Cite only rows that exist (L26).
   - State the keep-list restyle deltas and the compensated Close inset with its reason.
   - Also write a doc ledger `a-round-516/doc-ledger.md`: claim → row id or probe key.
5. Run the code-reviewer subagent on `git diff 63c8894` plus doc 334. Pass its Architecture note to B. Apply doc-only fixes; any code or test finding goes to "For B" (pinned bytes).
6. **Report `a-round-516.md`:**
   - the checks that actually ran, with their logs;
   - the exact list of changed paths (5);
   - "For B";
   - known gaps. A runs no browser rows (they are C's).

## 4. C: what to verify (dev server `http://127.0.0.1:5173`, which serves the A tree; mock API on :5199 if `cloud/run.sh` started it)
- **Probe:** `node /home/runner/czaba-project/tmp/studio-real-loop/b-round-515/probe/n4-probe.mjs http://127.0.0.1:5173 c-round-516/n4`.
  - It runs Playwright with fresh storage at 1440×900, 1280×720 and 375×812 (touch).
  - It opens the popup by exit intent: `networkidle`, scroll 55 %, then `document` `mouseleave` with clientY 0.
  - **L38 applies:** a second dev server or a mutant copy gets its own Vite cache (a `node_modules` folder of symlinks without `.vite`). B broke this rule at planning (INFO-B515-SHARED-VITE-CACHE): :5173 answered 504 "Outdated Optimize Dep" until `vite.config.ts` was touched (mtime only).

| Row | What | Pass when |
|---|---|---|
| **C0 scope** | `git status --short --untracked-files=all` and frozen checks 1, 2, 4 | Exactly the 5 paths of §2; checks rc 0 |
| **C1 links** | probe `gift`, `collection`, `giftHover`, `giftKeyboard` at 3 widths; screenshots `offers-<w>.png` | Equal to B's `probe/sketch/n4.json` in width/height only (x, y and `scrollY` are not compared: B's probe ran with the mock API down, so Home height may differ): gift [186, 50] and collection [170, 50] ±1 px; radius 8px; weight 600; width < parentW (w-fit); text and href unchanged; bg/border/colour equal; hover bg `rgb(36, 33, 30)` at 1280/1440; keyboard `fv` true with the same outline as B's sketch |
| **C2 Close** | probe `closeOnOpen`, `closeKeyboard`, `closeHover`, `closePressed`, `closedAfterClick`, `afterCloseActive` | Box 48×48; centre 40 ±2 px from top and right; glyph [24, 24]; `isActive` true on open; title "Close"; contrast ≥ 3:1 (B: 7.06); no wordmark overlap; no horizontal scroll; keyboard `fv` true with the same outline as B; hover bg `rgb(29, 26, 23)`; click closes; after-close focus equal to B's sketch ("Browse Gift Cards"); 0 page errors. Pressed transform recorded only (pre-ruled 4). Screenshots `popup-<w>.png`, `popup-close-hover-<w>.png` |
| **C3 journey (L54)** | At 1440 and 1280: Home → click "Browse Gift Cards" → `/gift-cards` renders; back → click "View Collection" → `/store` renders; screenshot per step | Client navigation lands on both routes; 0 page errors (cart fetch errors excepted, cloud note) |
| **C4 keep-list copy** | Home text of both cards; popup offer, email and success copy (`store-button-cleanup-2e` B2E-6 list) | Byte-equal to HEAD (N4-2, B2E-6 green; browser text equal) |
| **C5 tests and mutants** | Covering command (§3.3) in `store/`; then the mutants **on a copy outside `store/`** with A's tree (as round 515 C5; L60): `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-515/mutants-516.py <copy> c-round-516/mut-logs`. The copy needs its own `node_modules` folder of symlinks without `.vite` (L38) | 16 files / 194 tests, all named rows present. Mutants M1–M12 all red; `mutants-summary.json` red flags equal to B's `b-round-515/mut-logs/mutants-summary.json`. Frozen check 4 in `store/` stays rc 0 |
| **C6 grep, scanner, lint** | `grep -c '<button\b' app/components/marketing/LeadMagnetPopup.tsx` = 0; `grep -c 'buildButtonClassName(' app/components/home/SpecialOffersSection.tsx` = 2; scanner 48 with no SpecialOffers entry; lint 171 | As stated |
| **C7 Studio and protection** | Fresh context, no credentials: `/studio-lab` renders the workspace ("CZABA Studio" title, demo collection); `/studio/middle-east` and `/account/downloads` show "Sign in required" with no download link; the studio-token API returns 401 (`c-round-511/prot.mjs`) | As at round 515 C4 |
| **C8 doc 334** | Headings, l.4, row ids exist (L26), ledger | l.4 byte-exact; 7 TEMPLATE headings in order; `pending` 0; every cited row id greps ≥ 1 in the test files |
| **C9 claims (L56/L57)** | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-515/claims-516.sh` against `claims-516-planning-output.txt` | Only the allowed delta: K2 (3 tracked modified paths after A; the 2 new files are untracked), K6/K7/K8 empty or 0 after the sketch, K15 pre-check fails after the apply (expected), K17 shows doc 334. Then `l57-check.py` rc 0 |

Gate rows (not claimed by C): full vitest, build, Biome-all, `npm run verify`, `test:e2e:smoke`.

**Neighbours that could break:**
- LeadMagnet focus trap and initial focus (LM2/LM5 rows in `store-lead-magnet-dialog.test.tsx` are in the covering set);
- Home section layout at 375 (C1 boxes);
- SpecialOffers blur allow-list (`store-scroll-paint`, covering);
- the global focus ring (C1/C2 keyboard rows).

## 5. B's pre-check (`b-round-515/`)
- **Sketch:** `sketch-516.patch.txt`, built on a `/tmp` copy of HEAD.
  - `git apply --check` on HEAD rc 0 [K20].
  - tsc rc 0 (`precheck-tsc-sketch.log`).
  - Biome on the 4 files rc 0 (`sketch-biome.log`).
  - Lint 171 (`sketch-lint.log`).
  - Covering 16/194 (`sketch-covering.log`); the slowest test is 1,532 ms (pre-existing).
  - Full suite on the first sketch version (`2a62b3fa…`, one N4-2 assertion fewer) 307 files / 4,440 tests (`precheck-full.log`, evidence only) [K18]. The final sketch's covering run is 16/194.
- **Inventory (L1/L23):** I grepped every test that names SpecialOffers, LeadMagnet, `components/home`, `marketing/`, `text-foreground/60` or `X size={32}` (`covering-files.txt`, 16 files). The only collision is B2E-6, which is granted and replaced (§1).
- **Mutants (L58):**
  - M1 gift variant;
  - M2 lost `w-fit`;
  - M3 the old literal;
  - M4 the target;
  - M5 the old `top-6 right-6`;
  - M6 size md;
  - M7 glyph 32;
  - M8 variant default;
  - M9 no ref;
  - M10 no `onClick`;
  - M11 the old hand-rolled button;
  - M12 the View Collection element as a plain `<a href>` (the tech-lead finding).

  All 12 are red (`mut-logs/mutants-summary.json`) [K12].
- **Browser:** `probe/head/n4.json` (on :5173 = HEAD) vs `probe/sketch/n4.json` (on a scratch server :5174 with its own `.vite`) [K11]. The post-close focus is equal on both.
- **Consults:** `consult-product-designer.md`, `sketch-review.md` (L58 checker OK).

## 6. After this round
- REGRESSION on or after 2026-11-16.
- NONBRAND N5 (cart: 3 tags; a danger tone for Remove is needed), then N6–N9.
- Then PD-R498, DPG-BUTTON-CONTRACT-TABLE, the rest of DPG P1 (with the DPG2 ids), the DP gate, then P2.
- RETRO 525.

## Claims (`b-round-515/claims-516.sh`; planning output `b-round-515/claims-516-planning-output.txt`)
K1 HEAD · K2 tracked changes · K3 C round 515 · K4 gate 515 · K5 scanner HEAD/sketch · K6 SpecialOffers literal lines · K7 LeadMagnet Close facts · K8 B2E-6 pin · K9 IconButton lg/ghost/title · K10 Button default shape · K11 probe values · K12 mutants · K13 covering · K14 lint · K15 pins · K16 regression date · K17 doc number · K18 full pre-check · K19 artifacts exist · K20 sketch applies · K21 Close by role.
