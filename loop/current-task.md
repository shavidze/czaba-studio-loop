# Round 515: Cookie banner follow-up. A tap dismissal no longer sends focus back into a text field, and focus that left the banner is forgotten

**Planned by:** B at the round 514 → 515 planning, 2026-11-14 (`b-round-514.md`). Round 514's task is archived as `tasks/round-514.md` (byte copy).
- **Advisor:** available. Consulted after orientation (before writing) and again before hand-off.
- **Consults (run, saved):**
  - `product-designer` (`b-round-514/consult-product-designer.md`): the logo target is kept; skip only keyboard-opening fields.
  - `tech-lead` sketch review (`b-round-514/sketch-review.md`): approve-with-changes. Both changes are applied. Of the three rows it asked for, two were added (T7 and the `contenteditable="false"` case). The third, a BODY row, was declined under L47; R514-F8 pins that edge.

## Decisions (`backlog.json` v521, `decisions_log_b`)
- **D-29z1869:** round 514 is accepted (C PASS, `browserVerified` true; gate 514 published `b7cb61f`) [K3] [K4]. B-R512-COOKIE-DISMISS-FOCUS-LOST and B-R512-COOKIE-CLOSE-OVERLAPS-TEXT are closed.
- **D-29z1870:** gate 514's review is recorded [K7]:
  - finding 1 (Medium) → **GATE514-M1-POINTER-FIELD-KEYBOARD**;
  - findings 2 and 3 → deferred Lows;
  - finding 4 → info;
  - the architecture note → `confirmedBy` on SIG-R513-COOKIE-FOCUS-GROWTH (signal only).

  C-R514-01 is an open Low; its Safari half goes to SAFARI-CHECKS. A's R2 and R3 become rows here; R6 is deferred.
- **D-29z1871:** this round's scope and ruling (§1).

## Rules
- **Read `lessons.md` first.** Applies: L1, L4, L10, L11, L12, L23, L26, L28, L29, L47, L50, L52, L54, L56, L57, L58, L59, L60.
- **Baseline: HEAD `b7cb61f`, clean tree** [K1] [K2].
  - **HEAD-drift rule:** if HEAD moved at A's start, run `git diff --name-only b7cb61f HEAD`.
    - If it touches neither the two grants nor the covering files (`b-round-514/covering-files.txt`), go on. Run frozen check 1 with those paths filtered out (`grep -vF`) and note it.
    - Otherwise STOP.
    - **C applies the same rule** to C0 and to K1, K2, K5, K6 and K15 differences that come only from drifted paths, with a note.
- **STOP threshold (L10, one clause).** Write "STOP — needs B ruling" and change nothing more if any of these happens:
  - a frozen check is not rc 0;
  - a covering test fails or takes more than 2,500 ms;
  - a Medium-or-higher finding needs a change outside the grants.
- **Pre-ruled (not STOPs; list them under "For B" if raised again):**
  1. **Window switch.** While a banner control has focus, switching windows and returning sends a keyboard dismissal to the logo. This is the same as HEAD (round 514's pre-ruled limit 4; `sketch-review.md` finding 1). No `document.hasFocus()` guard is added.
  2. **No header and no previous element:** focus ends on BODY (R514-F8 now pins it). This edge does not exist in the app. The site header renders on every non-`/studio` route, and the banner hides on `/studio*` with the same prefix [K23].
  3. **After a tap dismissal from a text field,** the next Tab starts at the header, and a screen-reader cursor may jump to the top. This is the accepted cost (product-designer).
  4. **Out of the cloud's reach:**
     - the on-screen keyboard itself → TLM-R515-PHONE-KEYBOARD in SABA-DEVICE-CHECKS;
     - real Safari → SAFARI-CHECKS.

     C-R514-01 stays open after a C PASS until the Safari check.
  5. **GATE514-L3** (fallback selector not scoped to the site header) needs `Header.tsx` and is deferred. GATE514-L2 (a detached node is kept in memory only when no candidate takes focus) is deferred: it has no observable behaviour.
  6. Round 514's pre-ruled items 1–8 stay. Among them: the inline gradient, the header not being sticky (C-R205-02), Close recording a decline (SABA-Q-513), and the pill separation.
  7. **Doc 332 stays byte-identical** (it is in the tree pin). The new doc 333 states that it supersedes 332's pointer rule for keyboard-opening fields only.
- **Edits only through `git apply`** of the sketch, plus the editor tool for the new doc and the ledger. No shell string-replace, `git stash` or `git checkout --` in the store tree (L60).
- **Strengthen-only (A-R514-SPEC-STRENGTHEN-ONLY, ruled):** the pinned sketch already carries R2 and R3. A proposes any further rows under "For B" and does not edit the pinned bytes.
- **Persistent screen text (L39):** none added or removed. Layout is unchanged (C2).
- **Purchase protection:** the protected files stay byte-identical (check 2). The consent logic is unchanged: `setAnalyticsConsent`, `fbq`, the 1500 ms timer and the Studio-route hide.
- **No full suite.** Full vitest, build, Biome-all, `npm run verify` and `test:e2e:smoke` are gate rows.
- **L29:** code text that carries no tag is the sketch's content, a row id or a loop path. Every fact about `store/` carries a tag.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`; store `/home/runner/czaba-project/store`.

## Frozen checks (run from `store/`; all rc 0 at planning [K15])
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-514/r515-tree-sha256.txt`: 1,430 tracked files, all except the 2 grants. Doc 332 is included.
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`
3. Before applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-514/r515-pre-sha.txt`
4. After applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-514/r515-post-sketch-sha.txt`. Both granted files must equal B's sketch result.

## 0. Why this round
- **The bug gate comes first.**
  - **GATE514-M1 (Medium, gate reviewer)** [K7]. At HEAD, a pointer Accept after clicking the newsletter email field leaves focus **on the email INPUT**, at 375 and 1280. The same happens with the `/hire-us` textarea. On a phone that reopens the on-screen keyboard [K8 `head` P1, P3].
  - **C-R514-01 (Low)** sits on the same lines and costs little. It is reproduced only by simulation: in Chromium, a `mousedown` `preventDefault` stands in for Safari not focusing a clicked button. At HEAD, focus goes back to the stale "Cookie Policy" link [K8 `head` P2].
- **The open High needs root:** B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (backend plus protected `auth` files).
- **REGRESSION is not due:** `regression-last.json` is dated 2026-11-13, so the next one is on or after 2026-11-16 [K21]. The next RETRO is at 525.
- **NONBRAND N4** (Home: SpecialOffers ×2 plus the LeadMagnet Close X) follows.

## 1. Reference and ruling
**Reference: how established practice does it** (Store; Ableton conformance does not apply).
- **WCAG 2.4.3 Focus Order and 3.2.1 On Focus** (https://www.w3.org/WAI/WCAG22/Understanding/on-focus): moving focus must not cause an unexpected change of context. A keyboard opening after a tap on "Accept" is such a surprise.
- **WAI-ARIA APG, dialog focus return** (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): return focus to a sensible element. The banner has no invoker; round 514's rule uses the element before the banner.
- **Mobile platforms:** iOS Safari and Android Chrome open the virtual keyboard when script focuses a text-entry field inside a user gesture. This is an **inference** from the gate reviewer's finding, not measured here. Chromium headless shows no keyboard, so the real-device row is TLM-R515-PHONE-KEYBOARD.

| Point | Ruling | Deviation / reason | C row |
|---|---|---|---|
| Pointer/tap dismissal entered from a **keyboard-opening field** (textarea; `[contenteditable]` not "false"; `input` of any type except checkbox, radio, range, button, submit, reset, file, color, image, hidden) | The field is skipped as if nothing was focused before. Focus goes to the header logo with `preventScroll`: no ring, no scroll. The field keeps its value | product-designer: logo, not BODY (BODY is the lost-focus case round 514 fixed) | C1 P1, P3-textarea |
| Keyboard dismissal from such a field | Unchanged: focus returns to the field | a keyboard user continues where they were | jsdom R515-T2 (not reachable in the real DOM order: the banner comes after the footer) |
| Pointer dismissal from select, checkbox, radio, range, or `contenteditable="false"` | Unchanged: focus returns to it with `preventScroll` | nothing opens; the Tab position is kept | C1 P3-select; R515-T6 |
| Focus leaves the banner (to an element or to BODY) | The stored element is cleared (`onBlur` on the banner root; moves inside the banner are ignored) | C-R514-01 | C1 P2 (simulated); R515-T3, T7, T4 |
| Unmount paths (L50: `b-round-514/l50-focus-origins.txt`) | Decline and Accept (and Close through Decline) only; the `isStudioRoute` return is unchanged and not applicable (round 514) | — | C1, C2 |
| Everything else in round 514's table | Unchanged (C2 equality) | — | C2 |

**States covered:**
- pointer at 375 (touch tap) and 1280 (mouse): from the email field (P1), from the textarea with typed text (P3), from the select (P3);
- simulated no-focus click after focus left the banner (P2);
- all 22 round-514 focus rows and the layout at 5 widths (C2);
- the journey (C3);
- `/studio-lab` with no banner (C4);
- reduced motion: not applicable.

## 2. What changes (grants: 2 tracked paths + 1 new doc)
| File | Change |
|---|---|
| `app/components/common/CookieConsent.tsx` | From `store/`: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-514/sketch-515.patch.txt` (sha256 in `b-round-514/sketch-sha.txt`, `353e4239…` [K11]). The patch adds:<ul><li>`COOKIE_CONSENT_KEYBOARD_FIELD_SELECTOR`;</li><li>`skipPrevious` (pointer only) in `focusAfterCookieDismiss`;</li><li>`handleBannerBlur` on the root `onBlur`.</li></ul>This one apply covers both tracked files byte-equal; make no other edit |
| `app/components/common/__tests__/CookieConsent.test.tsx` | Same patch:<ul><li>the page helper gains a `button-only` header, an email input, a textarea, a select, a checkbox, a contenteditable div and a `contentEditable={false}` button;</li><li>R514-F8 also asserts `document.body`;</li><li>new describe R515: T1 (×3), T2 (×3), T6 (×3), T3, T7, T4, T5</li></ul> |
| `docs/implementation/2026/quarter-IV/333-cookie-banner-pointer-field-focus.md` (**new**, A writes it) | <ul><li>The seven TEMPLATE headings in order (L26).</li><li>l.4 is exactly `**სტატუსი:** Completed (C round 515 PASS)` (L28).</li><li>It names: the skip rule and its type list; the returnable fields; the `onBlur` clearing; pre-ruled 1–5; that it supersedes doc 332's pointer rule for keyboard-opening fields only; D-29z1871; GATE514-M1, C-R514-01, TLM-R515-PHONE-KEYBOARD and SAFARI-CHECKS.</li><li>It cites only test rows that exist.</li></ul>Write `a-round-515/doc-ledger.md` from `b-round-514/doc-ledger-template.md`: one source per behaviour sentence. **Do not edit doc 332** |

## 3. A: what to do
1. Run frozen checks 1–3 (rc 0). Read these files:
   - primitives `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `.claude/prompts/new-test.md`;
   - the `pre-flight` skill, **before** the apply.
2. Apply the sketch, then run frozen check 4 (rc 0). Write doc 333 and the ledger.
3. Save the following under `a-round-515/`:
   - `npm run typecheck` rc 0.
   - `npm run lint` rc 0 with **171** warnings [K17].
   - `npx biome check app/components/common/CookieConsent.tsx app/components/common/__tests__/CookieConsent.test.tsx` rc 0, no fixes.
   - **Covering:** `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-514/covering-files.txt)` gives rc 0, 6 files and **112** tests [K16]. R515-T1…T7 and R514-F8 must be present, with no test above 2,500 ms.
   - **Scanner:** `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/scan-nonbrand-motion.py . /tmp/r515.json` gives **50**, with no CookieConsent entry [K17].
   - **code-reviewer** on `git diff b7cb61f` plus doc 333, with its Architecture note.
   - No mutants: B ran M1–M11 [K13]. C re-runs them.
4. Write `a-round-515.md`. No full suite, no build.

## 4. C: what to verify
Write `c-round-515.md`, `c-round-515.json` and `c-round-515/progress.json` as you go. Run the browser rows first (L59).

**Environment** (as in round 514). The banner renders only when `VITE_GA4_MEASUREMENT_ID` is set [K10].
1. Make a copy of `store/` after A's change: tracked plus untracked files, `node_modules` symlinked. In the copy only, give `vite.config.ts` `cacheDir: '/tmp/c515-vitecache'`.
2. Start the server: `VITE_GA4_MEASUREMENT_ID=G-C515TEST npx remix vite:dev --host 127.0.0.1 --port 5174`.
3. Mock API on `:5199`: if `/__mock/health` fails, start `node mock-api/server.mjs` from the loop root. Stop your own processes by PID at the end.
4. Copy `b-round-514/probe/r515-focus.mjs`, `r514-banner.mjs` and `n3-journey.mjs` into `c-round-515/`. Warm the server once. A cold-Vite hydration error that a warm re-run clears is environment (INFO-C510-COLD-HYDRATION).

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start and end) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | Exactly 3 paths: 2 `M` plus the untracked doc 333. Every check rc 0 (doc 332 unchanged through check 1) |
| C1 | POINTER FIELD + STALE FOCUS (L47) | `node r515-focus.mjs http://127.0.0.1:5174 <dir>` | Equal to `b-round-514/probe/sketch/r515.json` [K8]:<ul><li>**P1** (375 tap, 1280 click): `after` is the "CZABA" logo link, `focusVisible` false, `scrollY` before = after, banner gone.</li><li>**P3-textarea:** the logo, `focusVisible` false, scrollY unchanged, `value` "abc".</li><li>**P3-select:** SELECT, scrollY unchanged.</li><li>**P2** (simulated no-focus click; record as simulation, not Safari): the logo, not "Cookie Policy".</li><li>0 page errors on the warm run.</li><li>Screenshots per P1/P3 row.</li></ul>**Record**, not fail: C adds one Tab press after P1 at 1280 in its own copy of the probe and records where focus lands, as product-designer asked. This is not in B's script |
| C2 | ROUND-514 EQUIVALENCE | `node r514-banner.mjs http://127.0.0.1:5174 <dir>` | The 22 focus rows (`w`, control, entry, after-string) and the 5-width layout equal `b-round-513/probe/sketch/r514.json` [K9]. BODY 0/22 |
| C3 | NEIGHBOURS (L54 journey) | `node n3-journey.mjs http://127.0.0.1:5174 <dir>` at 1440 and 1280 | `/` → Decline by keyboard → `/store` → `/products/middle-east`: consent `denied`; 0 banner buttons at each step; 0 errors [K18] |
| C4 | STUDIO + PROTECTION | `node r514-banner.mjs http://127.0.0.1:5174 <dir> studio-only`; on `:5173` `c-round-511/prot.mjs` | `/studio-lab`: 0 banner buttons, title "CZABA Studio — Demo collection", workspace text, 0 errors on the warm load. `/studio/middle-east` and `/account/downloads` show "Sign in required" with no download link (wait at least 7 s). Unauthenticated `GET /api/studio-token?product=middle-east&file=stem.mp3` returns 401 with no URL. Check 2 rc 0 |
| C5 | TESTS + MUTANTS | the §3 covering command; `python3 -I b-round-514/mutants-515.py <copy> c-round-515/mut-logs` on a copy outside `store/` with A's tree | rc 0, 6 files, 112 tests, R515-T1…T7 and R514-F8 present, none above 2,500 ms. Each of M1–M11 is red on exactly the rows in `b-round-514/mut-logs/mutants-summary.json` [K13]. Delete the copy afterwards |
| C6 | GREP + SCANNER + LINT | from `store/` | `grep -c '<button' app/components/common/CookieConsent.tsx` = 0; `grep -c 'onBlur={handleBannerBlur}' …CookieConsent.tsx` = 1; scanner 50 with no CookieConsent entry; `npm run lint` shows 171 warnings |
| C7 | DOC 333 + LEDGER | doc 333, `a-round-515/doc-ledger.md`, `git diff --quiet b7cb61f -- docs/implementation/2026/quarter-IV/332-cookie-banner-focus-return-close-overlap.md` | <ul><li>The 7 headings in order.</li><li>l.4 byte-equal to `**სტატუსი:** Completed (C round 515 PASS)`.</li><li>`grep -c 'pending'` = 0.</li><li>Every cited row id exists in the test file.</li><li>The ledger gives one source per behaviour sentence.</li><li>Doc 332 is unchanged (rc 0)</li></ul> |
| C8 | CLAIMS + L57 | `bash b-round-514/claims-515.sh` compared with `b-round-514/claims-515-planning-output.txt`; `python3 -I tools/l57-check.py c-round-515.json c-round-515/l57-check.txt` | No MISSING. The differences equal `b-round-514/claims-515-allowed-delta.txt`: K2 lists the 3 paths, K15 pre-sha FAILED by design, and K19's checkbox grep also lists `CookieConsent.tsx` (the new selector text contains `type="checkbox"`). L57 rc 0 |

- **Gate rows** (list under `gate`, never `passed`): full vitest suite, build, Biome-all, `npm run verify`, `test:e2e:smoke`.
- **Blocked:** none expected. The real phone keyboard and real Safari are manual rows (pre-ruled 4); they are not C rows.
- **L57:** write all L57 fields:
  - `mutantsRecorded` 11;
  - `mutantRedOnSketch`: `b-round-514/mut-logs/mutants-summary.json`;
  - `gateChecksRunOnSketch`: `b-round-514/precheck-tsc-sketch.log`;
  - `affectedChecksRunOnSketch`: `b-round-514/sketch-covering.log`, `probe/sketch/`, `probe/sketch-r514/`.
- **L22:** if A STOPs with no diff, run C0, C4 and C8 only.
- **Neighbours that could break:** CC1–CC6, N3-1…N3-6, R514-F1…F9, IL4 and the store scans. All are in the covering set [K16].
- **On closing:** a C PASS with `browserVerified` true closes GATE514-M1's browser half. It stays open on TLM-R515-PHONE-KEYBOARD, which does not block; then it closes. C-R514-01 stays open for SAFARI-CHECKS. A-R514-R2 and A-R514-R3 close.

## 5. B's pre-check (`b-round-514/`)
| Check | Result | File |
|---|---|---|
| tsc on the dispatched sketch | rc 0 | `precheck-tsc-sketch.log` [K12] |
| Scoped Biome on both files | rc 0, no fixes | `sketch-biome.log` [K12] |
| Covering set | sketch 6 files / 112 tests; slowest 187 ms | `sketch-covering.log` [K16] |
| Mutants M1–M11 | each red on its named rows | `mut-logs/` [K13] |
| New rows on the HEAD product file | red: R515-T1 ×3, T3, T7. Green: T2, T4, T5, T6 ×3 and F8. These are behaviour pins: T2, T4, T5 and T6 are killed by M2, M4, M5 and M7/M9/M11. F8 has no mutant (accepted edge pin, pre-ruled 2) | `r515-rows-on-head.log` [K14] |
| Browser HEAD `:5175` vs sketch `:5174`, GA4 set | P1, P2 and P3 as in §1 (HEAD: INPUT, "Cookie Policy", TEXTAREA; sketch: logo); 0 errors warm | `probe/head/`, `probe/sketch/` [K8] |
| Round-514 equivalence on the final sketch | 22/22 focus rows and the layout identical; 0 page errors on the final run (round 514's sketch run had 4 cold warm-up errors) | `probe/sketch-r514/` [K9] |
| Journey on the sketch | consent denied; 0 banners on `/store` and the product page | `probe/sketch-journey.log` [K18] |
| Lint and scanner | 171 and 50 (equal to HEAD) | [K17] |
| Full vitest on the sketch (the selector adds literal `type="checkbox"` etc. to app source; source-scan tests checked) | 306 files / 4,435 tests, rc 0 | `precheck-full.log` [K24] |
| Reviews | product-designer ruling; tech-lead approve-with-changes, applied | consult and `sketch-review.md` |

## 6. After this round
1. **REGRESSION** on or after 2026-11-16 (`regression-last.json`).
2. **NONBRAND N4** (Home: SpecialOffers ×2 → `buildButtonClassName` secondary lg; LeadMagnet Close X → IconButton ghost lg, X 24; keep-list restyle only), then N5–N9.
3. Then:
   - PD-R498-404-SECONDARY-ALIGN, then DPG-BUTTON-CONTRACT-TABLE;
   - the rest of DPG P1 (including the DPG2-* ids), the DP gate, then P2;
   - STORE-2c…5, then ARCH-SPLIT, then REVIEW-RECOMMENDATIONS, then the rest of the queue.

## Claims (`b-round-514/claims-515.sh`; planning output `b-round-514/claims-515-planning-output.txt`)
- **K1–K4:** HEAD, the clean tree, gate 514 and the C 514 verdict.
- **K5–K6:** the focus sites and fallback selectors at HEAD.
- **K7:** gate 514 review findings.
- **K8:** browser r515 HEAD vs sketch. **K9:** round-514 equivalence.
- **K10:** the GA4 render condition.
- **K11:** sketch sha, temp-copy apply and post pin, plus the L58 and ledger checks.
- **K12:** tsc and Biome. **K13:** mutants. **K14:** rows on HEAD.
- **K15:** frozen pins. **K16:** covering. **K17:** lint and scanner. **K18:** journey.
- **K19:** `/hire-us` fields and the checkbox inventory.
- **K20:** backlog entries. **K21:** regression date. **K22:** artifacts. **K23:** header and banner route conditions. **K24:** full vitest on the sketch.
