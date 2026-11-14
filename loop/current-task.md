# Round 506: DPG-BUTTON-CLEANUP-2 stage 2e. Move the LeadMagnet popup's three actions ("FREE DOWNLOAD", "CONTINUE", "BACK TO SITE") onto `Button`, as a keep-list restyle only

**Planned by:** B, at the round 505 → 506 planning on 2026-11-14 (`b-round-505.md`).

## Decisions (`backlog.json` v508, `decisions_log_b`)
- **D-29z1823, round 505 acceptance:** C PASS with `browserVerified`/`realVerified` true; gate 505 published `d6903a7`. Stage 2d is verified, and B-R505-CHAT-SEND-FOCUS-LOST and B-R505-GUESTFORM-START-FOCUS-LOST are closed on C7.
- **D-29z1823, A's STOP CR-1 ruled Low, deferred:** B re-ran B2D-7 with "Start Chat" focused before the rerender and all 15 mutants (`b-round-505/cr1/`). Every mutant outcome is identical, and the browser path is C-measured (TEXTAREA at 3 viewports).
- **D-29z1824, round 506 = stage 2e:** the mapping below follows product-designer. CONTINUE goes red → brass; this reverses the round-497 inventory line "the `bg-destructive` CONTINUE stays" and is asked of Saba once (default brass).
- **D-29z1825, consults, review and pre-check:** see §5.
- **D-29z1826, new ids:** listed in §6.
- **D-29z1827, closing check:** no Saba or spec decision fixed CONTINUE as red [K36]. Chromium names the email field from its placeholder (Low stands) [K36]. INFO-C505-C3-OFFSET-UNMEASURED closes on C's own round-505 data [K35]. Pre-ruled Lows #8–#11 are added.

## Rules
- **Read `lessons.md` first.** Applied here:
  - L1 (scanner, mutant-proven at round 497);
  - L4 (ruling lines), L7, L10, L22;
  - L23 (sweep [K10, K11]);
  - L26 (`b-round-505/doc-ledger.md` maps every doc 327 and DESIGN_SYSTEM sentence), L28, L29 (claims K1–K36);
  - L31 (covering times, all < 250 ms [K25]);
  - L36 (stubbed success step), L38 (warm-up; perf and pixel runs alone);
  - L39, L47 (focus targets), L50 (focus-origin grep [K14]), L52 (every jsdom row has a mutant);
  - L56 (artifacts [K29]), L57, L58 [K28], L59, L60, L61 (native chrome: none added; the email field is unchanged).
  - L54 does not apply: the popup is not a purchase entry, exit or hand-off.
- **Keep-list (policy 2026-10-25, binding):** the LeadMagnet "FREE DOWNLOAD" popup stays. Restyle only:
  - every visible string stays byte-equal [K6];
  - the steps (offer → email → success), the trigger rules [K13], the focus moves and the scroll lock stay.
  - Copy case: `uppercase tracking-wide` stays in `className` (SABA-Q-499-BUTTON-CASE is open; this round does not decide it) [K31].
- **L47 focus targets** (unchanged; measured equal at HEAD and on the sketch [K27]):
  - on open: Close;
  - FREE DOWNLOAD unmounts the offer step: the email field;
  - CONTINUE disables itself while focused during the request: on a failed submit, the email field (the refocus guard [K15]); on success, BACK TO SITE;
  - BACK TO SITE closes the popup: focus returns to the element focused before it opened (HEAD behaviour).
- **L50 focus origins** [K14]: one regex over the granted component gives 12 hits at HEAD and on the sketch:
  - the focus calls at HEAD l.45, 49, 61, 62, 70, 94 and 97 (sketch +1 for the import line) [K14];
  - the step and alert conditionals at HEAD l.166, 200, 239 and 257 (sketch 167, 195, 234, 254) [K14];
  - the SENDING ternary (HEAD l.250, sketch 247) [K14].
  - **Ruling:** every hit is unchanged code. Only `backToSiteButtonRef` now reaches the DOM through `Button`'s `forwardRef`, and B2E-5 (mutant M10) and C7 cover it. The trap query `button:not([disabled]), input:not([disabled])` matches the same set, because `Button` renders a native `<button disabled>` [K15].
- **Ruling lines (L4):**
  - **Height:** `Button`'s `lg` padding (`12px 24px`) wins over HEAD's `py-4 px-8`. All three actions go 57.6 → 48 px. No padding or radius is passed in `className`: `buildButtonClassName` does not merge classes [K8].
  - **Width:** `max-w-[320px]` on FREE DOWNLOAD and BACK TO SITE wins over `fullWidth`'s `w-full` (320 px at every viewport). CONTINUE gets its width from its 320 px form.
  - **SENDING... state:** `disabled={isSubmitting}` only. `Button`'s `isLoading` is not used, because it would replace the text with a spinner and "Loading..." [K7].
  - **Disabled CONTINUE:** `Button`'s `pointer-events-none` wins over HEAD's `disabled:cursor-not-allowed` (the same class as PD-R504-DISABLED-NO-REASON).
  - **CONTINUE colour:** product-designer's (c), brass primary, wins over the round-497 inventory line. SABA-Q-506-LM-CONTINUE-COLOUR is asked once; the default is brass.
  - **Close X:** not touched. It is NONBRAND (`IconButton`'s sizes would change its 32 px glyph).
- **STOP threshold (L10).** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing or slow covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch;
  - one of A's numbers differing from B's expected value in §3.
- **The sketch writes every granted byte**, doc 327 included. A writes no prose this round.
- **Pre-ruled Lows** (a re-raise is listed "For B", not a STOP):
  - #1 B2E-2's `bg-brand`/`bg-destructive` token checks repeat the class equality (tech-lead Review 1).
  - #2 B2E-6 bans every `bg-brand` literal in the popup, including future non-button uses; the NONBRAND stage notes it.
  - #3 doc 327 l.4 says "C round 506 PASS" before C runs (L28 contract) [K16].
  - #4 ST5's title still says "all nine" fills; only its LeadMagnet assertions change.
  - #5 the popup imports `Button` from the `~/components/ui` barrel, as stages 2a–2d did (GATE498-L2-BARREL-IMPORT).
  - #6 the email field's Chromium accessible name comes from its placeholder (AX tree, `b-round-505/probe/ax-email-head.out`), and it has no `aria-invalid`/`aria-describedby` (B-R506-LM-EMAIL-NO-LABEL) [K34]. The native email bubble appears before the styled message (B-R506-LM-NATIVE-VALIDATION).
  - #7 the white field, the plain "CZABA" span and the emoji icon are unchanged (B-R506-LM-WHITE-FIELD, -WORDMARK, -EMOJI-ICON).
  - #8 B2E-1, B2E-2, B2E-3 and B2E-5 pin whole builder class strings (SIG-R501-SHARED-BUTTON-SCANNER), as stages 2a–2d did.
  - #9 B2E-6 reads source text (counts of `<button`/`<Button`, literals and copy).
  - #10 the `useLeadMagnet` mock fixture is a copy of the one in `store-lead-magnet-dialog.test.tsx` (no shared helper yet).
  - #11 B2E-3 mounts already submitting (no enabled → submitting transition in jsdom), and B2E-5 reaches the success step with focus on Close, not on a focused CONTINUE as in the real flow (the A-R505-CR-1 class). The real path is C6/C7 in the browser and LM3 in `store-lead-magnet-dialog`.
- **Purchase protection:** no auth, cart, checkout, ownership or download file is touched. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.
- **Persistent screen text (L39):** nothing is added or removed. The popup is a transient overlay, and its copy is byte-equal.
- **Out of scope:** Studio (`/studio-lab` is smoke-checked only, C12), the Close X, the email field, the headings, `useLeadMagnet`, NONBRAND.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.

## Baseline
HEAD is `d6903a7` [K1], the gate 505 `commit` [K19]. `context/head-sha.txt` still names `e3e9e49`, which is stale. The worktree is clean [K2]. Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-505/r506-tree-sha256.txt`: every tracked file except the three granted tracked paths (1,418 of 1,421 [K21]).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files. No granted path is protected [K22].
3. Before applying: `b-round-505/r506-pre-sha.txt` (the three granted tracked paths at HEAD).
4. After applying: `b-round-505/r506-post-sketch-sha.txt`, covering all five paths.

B applied the patch to a fresh `git archive` of `d6903a7` (`/home/runner/b505-fresh`). Checks 4 and 1 are rc 0 there, and all five files equal the scratch tree (`/home/runner/b505-scratch`).

## 0. Why this round
- **Saba's DPG item 7:** "Use Button.tsx component only". Stages 1, 2a, 2b-1…2b-3, 2c and 2d are done.
- **Stage 2e** is inventory row A5, the LeadMagnet keep-list [K32]. The scanner count drops from 94 hits / 33 solid to 92 / 31 [K12], and the red hand-rolled submit (not counted by the `bg-brand` scanner) leaves too [K5].
- **Bugs first:** no Critical, High or Medium finding is open on Store code the loop may change. The open Mediums are root-only, Saba-only, device-only or `awaiting_user` (`context/active-summary.md`). B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High) needs a backend endpoint and the protected `auth.ts`, so it stays with root.
- **REGRESSION is not due:** the last one was 2026-11-13; the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference
- **Store rule** (DESIGN_SYSTEM shape table): a form submit and a dialog action use the default shape (8 px). Examples are newsletter "Subscribe", Hire Us "Send Message" and chat "Start Chat" (`lg`, `fullWidth`).
- **Why it was red:** the December 2025 original painted all three actions `#E63946`. Later token work moved FREE DOWNLOAD and BACK TO SITE to the brand fill and mapped CONTINUE to `destructive`. No Saba or spec decision fixed CONTINUE as red; the round-497 "stays" line was B's own ruling [K36].
- **Colour role:** `--color-destructive` is the error token; its DESIGN_SYSTEM example is "Invalid email". The popup's validation alert above the button is `text-destructive`, so a red submit reads as part of the error (product-designer Q2, `b-round-505/consult-product-designer.md`).
- **Competitor practice for email-capture popups:** not verified by a primary source this round (no search was run). The behaviour is unchanged, so no reference behaviour is adopted.
- **Ableton:** does not apply (Store overlay).

| Point | Reference / rule | CZABA after this round | Deviation (reason) |
|---|---|---|---|
| FREE DOWNLOAD, BACK TO SITE | dialog CTA, default shape | `<Button type="button" size="lg" fullWidth className="max-w-[320px] uppercase tracking-wide">` | D1: 57.6 → 48 px, padding `16px 32px` → `12px 24px`, `shadow-sm`, press opacity 0.9 |
| CONTINUE | form submit, primary | `<Button type="submit" size="lg" fullWidth disabled={isSubmitting} className="uppercase tracking-wide">` | D1 as above. D2: red `rgb(210, 119, 106)` → brass `rgb(201, 164, 106)`; contrast 6.09 → 8.32 (Saba question, default brass) |
| SENDING... | text unchanged, disabled | disabled, opacity 0.5, no spinner | D3: `pointer-events: none` (HEAD `auto`) |
| Focus targets, trap, Esc | L47 | unchanged | none |
| Keyboard ring | the shared ring (SABA-B-4) | unchanged: `:focus-visible`, solid, offset 2 px | none |

## 2. What changes: sketch `b-round-505/sketch-506.patch.txt`
sha256 `b52088bdbb36ea032842badf2bbafc9b0935505c8e8dced61702c11d1b073e0d` (`b-round-505/sketch-sha.txt`). v1 `e859573c…` is superseded; see `sketch-sha-history.txt` and `sketch-delta-v1-v2.diff.txt` (two doc wording lines).

| File | Change |
|---|---|
| `app/components/marketing/LeadMagnetPopup.tsx` | import `Button` from `~/components/ui`. FREE DOWNLOAD and BACK TO SITE become `<Button type="button" size="lg" fullWidth … className="max-w-[320px] uppercase tracking-wide">`, and BACK TO SITE keeps `ref={backToSiteButtonRef}`. CONTINUE becomes `<Button type="submit" size="lg" fullWidth disabled={isSubmitting} className="uppercase tracking-wide">`. Copy and handlers are byte-equal. HEAD has 4 `<button` and 0 `<Button`; the sketch has 1 and 3 [K4, K33] |
| `app/lib/__tests__/store-theme-tokens.test.ts` | ST5: the LeadMagnet red-submit pin (one `bg-destructive uppercase` class attribute with dark text) becomes 0 `bg-destructive` and 0 `bg-brand` class attributes in the popup. The "SENDING..."/"CONTINUE" ternary pin stays [K9] |
| `app/lib/__tests__/store-button-cleanup-2e.test.tsx` (new) | B2E-1 to B2E-6 [K23]. 1 = FREE DOWNLOAD type, class equals the builder's (`lg`, `fullWidth`, narrow classes), copy, and the click calls `setStep('email')` once. 2 = CONTINUE is a submit on the primary class (no `bg-destructive`), enabled. 3 = submitting: "SENDING...", disabled, builder class with `isDisabled`, no svg and no "Loading...". 4 = validation unchanged: empty and `listener@example` show the alert and submit nothing; a valid email submits once. 5 = BACK TO SITE type and class, focused on email → success, and the click closes once. 6 = source pins: one `<button`, three `<Button`, the barrel import, no `bg-brand`/`bg-destructive`, the six copy strings, no `isLoading` |
| `docs/design/DESIGN_SYSTEM.md` | the default row of the shape table adds the LeadMagnet popup's three actions [K17] |
| `docs/implementation/2026/quarter-IV/327-dpg-button-cleanup-stage-2e.md` (new) | l.4 `**სტატუსი:** In Progress (stage 2e of DPG-BUTTON-CLEANUP-2; C round 506 PASS)` [K16]; the 7 TEMPLATE headings; D1–D3; the TODO list |

**Sweep (L23)** [K10, K11]:
- The test-root hits for `LeadMagnetPopup` and the action names are `store-focus-ring`, `store-theme-tokens`, `store-lead-magnet-dialog` and `store-lead-magnet-routes`. All four are in the covering set and green on the sketch.
- `store-focus-ring` lists the popup as ring-free (kept). `store-theme-tokens` ST7 pins the email field (unchanged). Only ST5 needed the grant.
- No `perf/**` or `e2e/**` file names the popup or its labels [K10, K11].

**L31 timeout headroom:** every covering test is under 250 ms on B's run [K25]. No covering file declares its own timeout, so each runs under the 5 s default.

## 3. A: what to implement
1. From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-505/sketch-506.patch.txt`, then `git apply` on the same path;
   - run check 4 and check 1 again (rc 0).
2. **Grants:** the 5 files in the §2 table, exactly as the sketch writes them. Nothing else changes.
3. **Run.** Save the logs under `a-round-506/`. Each expected value is B's sketch output, and a difference is a STOP:
   - `npm run typecheck`: rc 0 (`typecheck.log`; B: `b-round-505/precheck-tsc.log`).
   - `npm run lint`: rc 0, "Found 179 warnings." (`lint.log`; B: `precheck-lint.log`) [K24].
   - `npx biome check app/components/marketing/LeadMagnetPopup.tsx app/lib/__tests__/store-button-cleanup-2e.test.tsx app/lib/__tests__/store-theme-tokens.test.ts`: rc 0, "Checked 3 files", no fixes (`biome-scoped.log`; B: `precheck-biome.log`) [K24].
   - `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-505/covering-files.txt)`: 5 files, 108/108, with the B2E-1…B2E-6 lines present, and no test above 2,500 ms (`covering.log`; B: `precheck-covering.log`) [K25].
   - The code-reviewer on the whole change against `d6903a7`. Give it `git diff d6903a7` and the two untracked files.
   - Not run by A: the full suite and the build. B ran both on the sketch tree: `precheck-full.log` (303 files / 4,379 tests, rc 0) and `precheck-build-sketch.log` (rc 0) [K25].
4. Write `a-round-506.md` with the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-506.md`, `c-round-506.json` and `c-round-506/progress.json` as it goes, heaviest rows first (L59).

**Stubbed rows (L36):** the success step needs `/api/subscribe` to answer 200. In the cloud it returns 500 "Server configuration error", because Brevo is not configured. The probe answers it with `page.route`, holding the reply 1.2 s so that SENDING... can be read. Rows on that path are **-STUBBED** and prove the client path only. One submit per viewport goes **unstubbed** and must show "Server configuration error", stay on the email step and return focus to the field. A real Brevo subscription is **BLOCKED: backend unavailable in cloud** (LEADMAGNET-REAL-SUBSCRIBE under `blocked`); that does not make `browserVerified` false.

**Environment:**
- The store dev server at `http://127.0.0.1:5173`. `/` needs no mock API.
- **Opening the popup:** scroll to 55 %, then a document `mouseleave` at `clientY` 0 (exit intent). This is built into the harness.
- **Warm up (L38):** run the harness once with `WIDTHS=1440` into `c-round-506/warm` and discard it. A cold first run that times out or opens no dialog is environment-invalid and is replaced.

**Harness:** `BASE=http://127.0.0.1:5173 node /home/runner/czaba-project/tmp/studio-real-loop/b-round-505/probe/lm-506.cjs <abs c-round-506/after> after`. It covers 1440×900, 1280×720 and 375×812 (fresh context each).
- Per step, it reads the action at rest, on hover, on mouse press and on keyboard focus (Tab from the previous control), with a padded crop `*-focus.png`.
- It walks offer → email (an empty submit, an unstubbed submit, then a stubbed Enter submit with SENDING... read mid-flight) → success → BACK TO SITE by keyboard. A second context checks Esc.
- The oracles are `b-round-505/probe/sketch/sketch.jsonl` and `compare.txt`; HEAD is `probe/head/head.jsonl`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 3 modified (the §2 tracked paths) and 2 untracked (the 2e test, doc 327). Checks 1, 2 and 4 rc 0 |
| C1 | REST | `after.jsonl` `offer.rest`, `email.rest`, `success.rest` | Equal to `sketch.jsonl` (boxes ±1 px) [K27]. All three actions: `BUTTON`, 320×48 at every viewport, bg `rgb(201, 164, 106)`, color `rgb(14, 13, 12)`, 16px / 600, uppercase, letter-spacing `0.4px`, padding `12px 24px`, radius `8px`, `shadow` not `none`. Types: `button`, `submit`, `button`. Close X box: 32 px tall at y 24 (`offerDialog.kids`), equal to HEAD |
| C2 | HOVER + PRESS | `hover`, `press` | hover bg `rgb(217, 184, 127)` on all three. Press: opacity `0.9` and `matrix(0.98, 0, 0, 0.98, 0, 0)` |
| C3 | KEYBOARD FOCUS | `kbd` fields plus the `*-focus.png` crops | `fv` true, outline `solid`, offset `2px` on all three at all 3 viewports. At least 3 crops viewed (one per action); the ring is visible and not clipped. **Also (carried from round 505, record-only, not a FAIL of this round):** view `c-round-505/after/after-1440-Start_Chat-focus.png` and `c-round-505/after/after-1440-Send_ready-focus.png` and record whether the ring is visible and not clipped. The offset itself is already in C's round-505 data: `c-round-505/after/after.json` has `"offset": "2px"` 6 times [K35] |
| C4 | CONTRAST | `restContrast` / `hoverContrast` | 8.32 / 10.28 on all three. HEAD CONTINUE was 6.09 (record). Below 4.5 is a Medium |
| C5 | VALIDATION + ERROR (unstubbed) | `emptyAlert`, `postsAfterEmpty`, `unstubbedAlert`, `stepAfterUnstubbed`, `activeAfterError`, `continueAfterError` | Empty CONTINUE click: "Please enter your email address", 0 POSTs. The unstubbed submit shows "Server configuration error", stays on `email`, focus is the `INPUT` "Enter your email address", and CONTINUE is enabled again. Equal to HEAD |
| C6 | SENDING + SUCCESS (stubbed) | `sending`, `postsTotal`, `activeOnSuccess`, `closedAfterBack`, `lm` | Mid-flight: text "SENDING...", `disabled` true, opacity `0.5`, `pe` `none`, bg brass; screenshot `after-<W>-sending.png` viewed at 1 width (no spinner, no "Loading..."). `postsTotal` 2 (one unstubbed, one stubbed). Success: focus is BACK TO SITE; Enter closes the dialog; `lm` has `"submitted":true` |
| C7 | FOCUS TARGETS (L47) | `activeOnOpen`, `activeOnEmail`, `activeAfterError`, `activeOnSuccess`; Esc pass | Per viewport: on open Close; after FREE DOWNLOAD the email `INPUT`; after a failed submit the `INPUT`; on success BACK TO SITE; Esc closes (`escClosed` true). All equal to HEAD and sketch [K27] |
| C8 | GREP | from `store/`: `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-497/scan-brand.py . /tmp/s.json`; the K4–K6 and K9 lines of `claims-506.sh` | `92 hits; 31 solid` (HEAD 94 / 33) [K12]. K4 `1 3`, K5 `0 0 0`, K6 `1 1 1 1 1 1`, K9 the two count-0 lines and no `leadMagnetSubmit` |
| C9 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-505/covering-files.txt)` | 5 files, 108/108; the B2E-1…B2E-6 lines present; no test above 2,500 ms |
| C10 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules`, `.git` and `build`) to a folder outside `store/`, symlink `node_modules`, then run `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-505/mutants-506.py <copy> <absolute c-round-506/mutant-logs>` | M1–M14 all RED, each on the rows in `b-round-505/mutants-506.txt` (`summary.txt` lines end `OK`), and `restored rc 0` |
| C11 | DOCS | `git diff d6903a7 -- docs/design/DESIGN_SYSTEM.md`; doc 327 | DESIGN_SYSTEM: only the default row changed [K17]. Doc 327: the 7 headings (L26 subsequence) and l.4 byte-equal to `**სტატუსი:** In Progress (stage 2e of DPG-BUTTON-CLEANUP-2; C round 506 PASS)`. Every number in doc 327's D1–D3 is traced to `head.jsonl`/`sketch.jsonl` or `after.jsonl`. `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 [K18] |
| C12 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link. `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each). Check 2 rc 0 |
| C13 | CLAIMS | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-505/claims-506.sh` (default tree), compared with `b-round-505/claims-506-sketch-output.txt` | No `MISSING`. Output identical except K1 (HEAD may move to the loop-state commit) and K2 (the sketch output read the clean store) |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-506.json c-round-506/l57-check.txt` | As C0; rc 0. The JSON carries all L57 fields, and every `null` names its reason. `mutantRedOnSketch` names `b-round-505/mutants-506.txt` |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Blocked:** LEADMAGNET-REAL-SUBSCRIBE, a real Brevo subscription ("backend unavailable in cloud").
- **Neighbours that could break:**
  - the popup's auto-open and route exclusion (`store-lead-magnet-routes`, untouched hook);
  - the focus trap, Esc and focus return (C7, `store-lead-magnet-dialog`);
  - other `Button` users: `Button.tsx` is unchanged.
- **L22:** if A STOPs, C runs C0, C13 and C14 only. A STOP that names an unruled Medium+ is a short FAIL even if every other row would pass (lessons L22, RETRO 450 clause).
- **Closing:** with C PASS and `browserVerified` true, stage 2e is verified. DPG-BUTTON-CLEANUP-2 then has only its close-out left: NONBRAND, the ChatButton legacy half, and the SIG-R498/SIG-R501 decisions.

## 5. B's pre-check (`b-round-505/`, on `/home/runner/b505-scratch` = a `git archive` of `d6903a7` plus the dispatched sketch, outside `store/`)
| Check | Result | Log |
|---|---|---|
| tsc / lint / Biome (3 code and test files) | rc 0 / rc 0, 179 warnings (= HEAD) / rc 0, no fixes | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log` |
| Covering tests (v2) | 5 files, 108/108 (slowest 214 ms) | `precheck-covering.log` |
| Full suite on the sketch tree | 303 files / 4,379 tests, rc 0 | `precheck-full.log`, `precheck-full-raw.log` |
| Build on the v2 sketch tree | rc 0 | `precheck-build-sketch.log` |
| Browser, HEAD (:5173) vs sketch (a second dev server on :5174, own `node_modules` dir without `.vite`) | §1 table, C1–C7 | `probe/head/head.jsonl`, `probe/sketch/sketch.jsonl`, `probe/compare.txt` |
| Mutants (on a separate copy of the sketch tree) | M1–M14 RED on their expected rows; `restored rc 0`. Run 1 had M4 expecting too little (ST5 is also red, by design) and is kept as `mutants-506-run1.txt` | `mutants-506.txt`, `mutant-logs/` |
| Scanner | 94/33 → 92/31 | `scan-head.json`, `scan-sketch.json` |
| Patch reproduces the tree | `git apply` on a fresh `git archive` of `d6903a7`: checks 4 and 1 rc 0 there | (this table) |
| Sketch review | tech-lead v1 `e859573c…` APPROVE WITH CONDITIONS (Medium: artifacts and the L28 line, resolved; 2 doc Lows fixed in v2; 2 test Lows pre-ruled). v2 `b52088bd…` APPROVE WITH CONDITIONS (M4 expectation fixed; status-line form confirmed) | `sketch-review.md` |
| CR-1 experiment (round 505) | B2D-7 with "Start Chat" focused: 10/10 pass, and M1–M15 are identical to round 505 | `cr1/README.txt`, `cr1/summary.txt` |
| Claims | HEAD and sketch outputs, no MISSING | `claims-506-planning-output.txt`, `claims-506-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **DPG-BUTTON-CLEANUP-2-NONBRAND:** the 30 non-brand hand-rolled buttons, including the LeadMagnet Close X, `support.tsx`'s cards and the PurchaseHeader siblings, with a mutant-proven scanner at its planning. Then PD-R498-404-SECONDARY-ALIGN.
3. **At the stage-2 close:** decide SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER. A bounded frontend-architect checkpoint goes to root only if that decision proposes a new ui primitive.
4. Then the rest of DPG P1 (CSS-DEDUP, COLOR-CONSOLIDATE, FONT-RESOLVE), the DP-gate re-run with root, and P2. RETRO at round 510.
5. **New ids this planning (D-29z1826):**
   - deferred Lows: B-R506-LM-EMAIL-NO-LABEL, B-R506-LM-NATIVE-VALIDATION, B-R506-LM-WHITE-FIELD, B-R506-LM-WORDMARK, B-R506-LM-EMOJI-ICON, A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON, A-R505-CR-3-SEND-LOGIC-DUP;
   - info: B-R506-LM-SPLIT-HEADINGS, B-R506-LM-ARBITRARY-VALUES, A-R505-CR-4-NULL-ACTIVE;
   - process info for RETRO 510: INFO-C505-UNRULED-STOP-PASS, INFO-B505-SKETCH-REVIEWER-MEDIUM, INFO-C505-C3-OFFSET-UNMEASURED, INFO-C505-DOC326-LEDGER-PARTIAL, INFO-C505-L57-NULL-REASONS;
   - signal: SIG-R505-CHAT-FOCUS-POINT;
   - question: SABA-Q-506-LM-CONTINUE-COLOUR;
   - blocked evidence: LEADMAGNET-REAL-SUBSCRIBE.
   - A-R505-CR-2 is `confirmedBy` on TL-R505-FOCUS-FLAG-AUTH-CHANGE. The stale `DESIGN_TOKENS.md` note is `confirmedBy` on ROOT-REQ-DPG-PRIMITIVES-PATCH.

## Claims (`b-round-505/claims-506.sh`; planning output `claims-506-planning-output.txt` on HEAD, sketch output `claims-506-sketch-output.txt` on `/home/runner/b505-scratch`)
[K1] HEAD · K2 worktree counts · K3 popup importers · K4 `<button`/`<Button` counts · K5 `bg-destructive`/`bg-brand`/`isLoading` counts · K6 copy kept · K7 Button `isLoading` branch · K8 Button lg / default shape / disabled classes · K9 ST5 LeadMagnet lines · K10 SWEEP popup in test roots · K11 SWEEP action names in test roots · K12 scanner · K13 subscribe endpoint and trigger constants · K14 L50 grep count and lines · K15 trap query and refocus guard · K16 doc 327 status line and headings · K17 DESIGN_SYSTEM phrase · K18 pending grep · K19 gate 505 and c-round-505 · K20 c-round-505 L57 · K21 frozen list sizes · K22 granted paths not protected · K23 new row ids · K24 tsc/lint/Biome · K25 full suite/build/covering · K26 mutants · K27 probe key values · K28 L58 check · K29 cited artifacts exist · K30 DPG-BUTTON-CLEANUP-2 "In Progress (stage" docs · K31 related ids · K32 inventory A5 line · K33 HEAD action class lines · K34 email field has no aria-label/aria-invalid/aria-describedby and no noValidate · K35 round-505 offset values · K36 red history and the email field's Chromium accessible name.
