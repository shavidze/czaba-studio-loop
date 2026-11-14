# Round 514: Cookie banner fix-up. Focus goes back to a named element after dismissal, and the mobile Close X stops covering the text

**Planned by:** B at the round 513 → 514 planning, 2026-11-14 (`b-round-513.md`). Round 513's task is archived as `tasks/round-513.md` (byte copy).
- **Advisor:** available. Consulted after orientation (before writing) and again before hand-off.
- **Consults (run, saved):**
  - `product-designer` ruled twice; B's browser measurement refuted the first ruling's premise (`b-round-513/consult-product-designer.md`).
  - `tech-lead` reviewed the sketch: approve-with-changes; B applied changes 1, 4 and 5 (`b-round-513/sketch-review.md`).
  - **Not re-reviewed:** the three post-review deltas were not re-read by tech-lead. They are the outside-focus early return, the `instanceof` guard and the type aliases. Mutants M15, M9 and the tsc run cover them, and C's code-reviewer row in §3 sees the final diff.

## Decisions (`backlog.json` v520, `decisions_log_b`)
- **D-29z1866:** round 513 is accepted, so NONBRAND N3 is complete; gate 513 published `4c85587` [K3] [K4]. A-R183-COOKIE-BUTTON-TYPE and A-R183-REVIEW-FBQ-BRANCH are closed.
- **D-29z1867:** A's review Lows and gate 513's review items are recorded:
  - two Lows deferred;
  - "Close records a decline" goes to Saba as SABA-Q-513-CLOSE-AS-DECLINE (default: keep);
  - the 32 px touch target becomes `confirmedBy` on B-R512-COOKIE-CLOSE-OVERLAPS-TEXT;
  - the gate's architecture note becomes the signal SIG-R513-COOKIE-FOCUS-GROWTH.
- **D-29z1868:** this round fixes both Medium bugs (C bugs first, same file).
  - The site header is **not** effectively sticky: `app/styles/app.css` l.269–272 sets `html, body { overflow-x: hidden }` (cause of C-R205-02) [K6] [K11].
  - So the "always the header logo" ruling would focus an off-screen logo with no ring. product-designer approved the revised rule in §1.

## Rules
- **Read `lessons.md` first.** Applies: L1, L4, L10, L11, L12, L23, L26, L28, L29, L36, L47, L50, L52, L54, L56, L57, L58, L59, L60.
- **Baseline: HEAD `4c85587`, clean tree** [K1] [K2].
  - **HEAD-drift rule:** if HEAD moved at A's start, run `git diff --name-only 4c85587 HEAD`.
    - If it touches neither the two grants nor the covering files (`b-round-513/covering-files.txt`), go on. Run frozen check 1 with those paths filtered out (`grep -vF`) and note it.
    - Otherwise STOP. ROOT-REQ-DPG2-APPLIED-NOT-AT-HEAD may land `EntranceCover.tsx` or `.claude/**`.
    - **C applies the same rule** to C0 check 1 and to K1, K6, K7 and K16 differences that come only from drifted paths, with a note.
- **STOP threshold (L10, one clause).** Write "STOP — needs B ruling" and change nothing more if any of these happens:
  - a frozen check is not rc 0;
  - a covering test fails or takes more than 2,500 ms;
  - a Medium-or-higher finding needs a change outside the grants.
- **Pre-ruled (not STOPs; list them under "For B" if raised again):**
  1. The banner root keeps its inline rgba gradient and blur style (A-R183-COOKIE-INLINE-GRADIENT, deferred).
  2. The header scrolls away (C-R205-02, deferred; `app/styles/**` needs a root grant). So a **pointer** dismissal mid-page focuses an off-screen logo without a ring or scroll. This is intended: the ring is suppressed for pointer focus [K7].
  3. Shift+Tab into the banner from a never-focused mid-page state, then a keyboard dismissal, scrolls to the logo at the top with a ring. This is the accepted trade-off (consult 2).
     - Measured on the sketch: scrollY 2416 → 0 at 1280 and 2833 → 0 at 375, with `focusVisible` true [K10].
  4. Known limits, documented and not fixed:
     - a window refocus while a banner control has focus clears the stored element, so focus goes to the logo;
     - screen-reader mouse simulation may send `detail ≥ 1`, which means `preventScroll` and no ring (`sketch-review.md` findings 2–3).
  5. The Close label stays "Close" and still records a decline (SABA-Q-513-CLOSE-AS-DECLINE awaits Saba).
  6. The pills' low separation from the banner (B-R512-COOKIE-PILL-LOW-SEPARATION) and SABA-Q-507-COOKIE-WEIGHT stay open.
  7. The stale `.claude/primitives/DESIGN_TOKENS.md` teal row is a root item.
  8. The CC1 root-class pin is unchanged. The `ref` and `onFocus` props do not change the class.
- **Edits only through `git apply`** of the sketch, plus the editor tool for the new doc. No shell string-replace, `git stash` or `git checkout --` in the store tree (L60).
- **Persistent screen text (L39):** none added or removed. At 320 and 375 the text re-wraps inside the same two lines. The banner height is unchanged: 122 px at 320 and 375, 102 at 639, 66 at 1280/1440 [K9].
- **Purchase protection:** the protected files stay byte-identical (check 2). The consent logic is unchanged: `setAnalyticsConsent`, `fbq`, the 1500 ms timer and the Studio-route hide.
- **No full suite.** Full vitest, build, Biome-all, `npm run verify` and `test:e2e:smoke` are gate rows.
- **L29:** code text in §1–§3 that carries no tag is the sketch's content, a row id or a loop path. Every fact about `store/` carries a tag.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`; store `/home/runner/czaba-project/store`.

## Frozen checks (run from `store/`; all rc 0 at planning [K16])
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-513/r514-tree-sha256.txt`: 1,429 tracked files, all except the 2 grants.
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`
3. Before applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-513/r514-pre-sha.txt`
4. After applying: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-513/r514-post-sketch-sha.txt`. Both granted files must equal B's sketch result.

## 0. Why this round
- **C bugs first.** C round 513 found 0 bugs [K4]. The two open Medium bugs on this file are pre-existing and B-found:
  - **B-R512-COOKIE-DISMISS-FOCUS-LOST:** at HEAD, every dismissal leaves focus on BODY on every path, at 1280 and 375 [K10].
  - **B-R512-COOKIE-CLOSE-OVERLAPS-TEXT:** at HEAD, the X overlaps the text glyphs at 320 and 375 [K9].
- **The open High needs root:** B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED requires the backend and protected `auth` files.
- **REGRESSION is not due:** `regression-last.json` is dated 2026-11-13, so the next one is on or after 2026-11-16 [K21]. The next RETRO is at 525.

## 1. Reference and ruling
**Reference: how established practice does it** (Store; Ableton conformance does not apply).
- **WCAG 2.4.3 Focus Order** (https://www.w3.org/WAI/WCAG22/Understanding/focus-order) and **2.4.7 Focus Visible:** after a component disappears, focus must continue in a meaningful place with a visible indicator. BODY breaks the sequence.
- **WAI-ARIA APG** (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): a closing dialog returns focus to its invoker. This banner has no invoker. The closest analogue is the element the user was on before entering it (consult 2).
- **GOV.UK cookie banner** (https://design-system.service.gov.uk/components/cookie-banner/): it replaces the banner with a focused confirmation message and a Hide button. **Rejected:** it adds persistent text (L39) and a second dismissal.
- **WCAG 2.5.8 Target Size (AA, 24 px):** the Close X becomes 40 px.

| Point | Ruling | Deviation / reason | C row |
|---|---|---|---|
| Keyboard dismissal (Enter/Space; `click.detail === 0`) | Focus goes to the element focused just before focus entered the banner, else the header logo `header a[href="/"]`, else the first `header a[href], header button`. Uses `focus()`, so the browser scrolls only if needed and the ring shows | not GOV.UK's message (screen budget) | C3 |
| Pointer/tap dismissal (`detail ≥ 1`) | The same target with `focus({ preventScroll: true })`: no jump, no ring. If focus is already on an element outside the banner (a browser that does not focus clicked buttons), it stays there | pre-ruled 2 | C4 |
| Stored element | Overwritten on every focus entry from outside (null when entering from nothing); moves inside the banner are ignored. After each `focus()`, `document.activeElement` is checked and the next candidate tried | consult 2 conditions 1–2 | C3 (privacy-nav) |
| Unmount paths (L50: grep `setIsVisible(false)` and `return null` in the file) | Decline and Accept (and Close through `handleDecline`) are all covered. The `isStudioRoute` return is not applicable: no banner control navigates to `/studio*`, so focus is never inside the banner on that path | — | C3, C4 |
| Close X (below 640 px) | `IconButton` ghost **md** (40×40), X 20, `absolute top-2 right-2 sm:hidden`; label and behaviour unchanged | 32 → 40 px; pre-ruled 5 | C1 |
| Text | `<p>` gets `px-10 sm:px-0` (mirrored, so it stays centred) | — | C1 |
| 1280 / 1440 | Banner, text, link and button boxes equal HEAD | — | C1 |

**States covered:**
- rest at 320, 375, 639, 1280 and 1440;
- keyboard Enter on Decline, Accept and (375) Close, from these entries:
  - Shift+Tab from the top;
  - Tab from the last element before the banner mid-page (the footer "Cookie Policy");
  - Shift+Tab mid-page with nothing focused;
  - Privacy-link navigation entered from the footer link, which is route-owned and so stale after navigation;
- Space on Accept;
- a fresh first visit with empty storage (record);
- pointer click mid-page on each control;
- consent stored each time;
- the journey after Decline (L54);
- `/studio-lab` with GA4 set (no banner);
- reduced motion: not applicable (no motion added).

## 2. What changes (grants: 2 tracked paths + 1 new doc)
| File | Change |
|---|---|
| `app/components/common/CookieConsent.tsx` | From `store/`: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-513/sketch-514.patch.txt` (sha256 in `b-round-513/sketch-sha.txt`, `e6e5f1dc…` [K12]). The patch adds:<ul><li>`COOKIE_CONSENT_FOCUS_FALLBACK_SELECTORS` and `focusAfterCookieDismiss`;</li><li>`bannerRef` and `focusBeforeBannerRef`, plus `handleBannerFocus` on the root `onFocus`;</li><li>a call in `handleAccept` and in `handleDecline` before `setIsVisible(false)`;</li><li>the `<p>` padding;</li><li>Close md with X 20.</li></ul>This one apply covers both tracked files byte-equal; make no other edit |
| `app/components/common/__tests__/CookieConsent.test.tsx` | Same patch: N3-3 updated to md/40 px/X 20 (equal or stronger: the same pins plus new values); helpers `renderCookieConsentWithPage` and `enterBannerFrom`; rows R514-F1 (×3), F2–F9 |
| `docs/implementation/2026/quarter-IV/332-cookie-banner-focus-return-close-overlap.md` (**new**, A writes it) | The seven TEMPLATE headings in order (L26). l.4 is exactly `**სტატუსი:** Completed (C round 514 PASS)` (L28). It names the focus rule, the fallback chain, the keyboard/pointer split, the known limits (pre-ruled 2–4), the header-sticky cause (C-R205-02), the Close 40 px and the text padding, D-29z1868, both bug ids and SABA-Q-513-CLOSE-AS-DECLINE. It cites only test rows that exist. Write `a-round-514/doc-ledger.md` from `b-round-513/doc-ledger-template.md`: one source per behaviour sentence |

## 3. A: what to do
1. Run frozen checks 1–3 (rc 0). Read these files:
   - primitives `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `.claude/prompts/new-test.md`;
   - the `pre-flight` skill, **before** the apply.
2. Apply the sketch, then run frozen check 4 (rc 0). Write doc 332 and the ledger.
3. Save the following under `a-round-514/`:
   - `npm run typecheck` rc 0.
   - `npm run lint` rc 0 with **171** warnings [K18].
   - `npx biome check app/components/common/CookieConsent.tsx app/components/common/__tests__/CookieConsent.test.tsx` rc 0, no fixes.
   - **Covering:** `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-513/covering-files.txt)` gives rc 0, 6 files and **99** tests [K17]. R514-F1…F9 and N3-3 must be present, with no test above 2,500 ms.
   - **Scanner:** `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/scan-nonbrand-motion.py . /tmp/r514.json` gives **50**, with no CookieConsent entry [K18].
   - **code-reviewer** on `git diff 4c85587` plus doc 332, with its Architecture note.
   - No mutants: B ran M1–M15 [K14]. C re-runs them on A's tree.
4. Write `a-round-514.md`. No full suite, no build.

## 4. C: what to verify
Write `c-round-514.md`, `c-round-514.json` and `c-round-514/progress.json` as you go. Run the browser rows first (L59).

**Environment.** The banner renders only when `VITE_GA4_MEASUREMENT_ID` is set [K8], and `:5173` has none.
1. Make a copy of `store/` after A's change: tracked plus untracked files, `node_modules` symlinked. In the copy only, give `vite.config.ts` `cacheDir: '/tmp/c514-vitecache'` (L38).
2. Start the server: `VITE_GA4_MEASUREMENT_ID=G-C514TEST npx remix vite:dev --host 127.0.0.1 --port 5174`.
3. Mock API on `:5199`: if `/__mock/health` fails, start `node mock-api/server.mjs` from the loop root. Stop both by PID at the end.
4. Harnesses: copy `b-round-513/probe/r514-banner.mjs` and `n3-journey.mjs` into `c-round-514/`. Run `node r514-banner.mjs http://127.0.0.1:5174 <dir>` and `node n3-journey.mjs http://127.0.0.1:5174 <dir>`.
   - The scripts abort GA hosts, set `czaba_lead_magnet_dismissed` and `czaba_entrance_seen`, and warm up once.
5. Expected values are B's sketch run, `b-round-513/probe/sketch/r514.json` [K9] [K10]. HEAD values are in `probe/head/r514.json`. A cold-Vite hydration error that a warm re-run clears is environment (INFO-C510-COLD-HYDRATION).

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start and end) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | Exactly 3 paths: 2 `M` plus the untracked doc 332. Every check rc 0 |
| C1 | LAYOUT (320, 375, 639, 1280, 1440) | `r514-banner.mjs`, `layout` | <ul><li>At 320/375/639: `closeTextOverlap` false, min gap ≥ 8 px (B: 10.5 / 38 / 87.5), Close 40×40 ±0.5, `display` flex.</li><li>Banner height 122 / 122 / 102 ±1.</li><li>At 1280/1440: Close `display:none`, and the banner, text, link, Accept and Decline boxes equal `probe/head/r514.json` (±0.5).</li><li>Crops `banner-320/375/639.png` show the X clear of the text.</li><li>0 page errors after warm-up</li></ul> |
| C2 | NEIGHBOURS (L54 journey) | `n3-journey.mjs` at 1440 and 1280 | `/` → Decline by keyboard → `/store` → `/products/middle-east`: consent `denied`; 0 banner buttons at each step; a screenshot per step; 0 page errors [K19] |
| C3 | KEYBOARD FOCUS (L47) | `focus` rows with entry `shift-tab-from-top` (Enter, and Space on Accept), `tab-from-before-banner`, `privacy-nav-then-keyboard` and `shift-tab-mid-page-never-focused`, at 1280 and 375, for Decline, Accept and (375) Close; plus `fresh-first-visit-record` | <ul><li>`after.tag` is never BODY.</li><li>**shift-tab-from-top** (Enter and Space) and **privacy-nav** (`prev` = "Cookie Policy", URL `/privacy`): the "CZABA" logo link, `focusVisible` true, `inViewport` true, outline solid brass at 0.8.</li><li>**shift-tab-mid-page-never-focused**: the logo, `focusVisible` true, `inViewport` true, `scrollY` → 0 (pre-ruled 3).</li><li>**fresh-first-visit-record**: record only; B saw the logo with a ring and 0 dialogs open.</li><li>**tab-from-before-banner**: the element before the banner ("Cookie Policy"), `focusVisible` true, `inViewport` true, `scrollY` unchanged.</li><li>Consent is `denied` (Decline/Close) or `granted` (Accept); `bannerGone` true.</li><li>Screenshot per row shows the ring</li></ul> |
| C4 | POINTER FOCUS | `focus` rows with entry `pointer-mid-page` | Focus is on the "CZABA" logo, `focusVisible` false, `scrollY` before = after, consent stored, banner gone. **Record** `inViewport` false (pre-ruled 2) |
| C5 | STUDIO + PROTECTION | On the GA4 server: `node r514-banner.mjs http://127.0.0.1:5174 <dir> studio-only` (writes `r514-studio.json`: two loads, 3.5 s each). On `:5173`: `c-round-511/prot.mjs` | `/studio-lab` at 1280: 0 banner buttons, title "CZABA Studio — Demo collection", `workspaceText` true, 0 errors on the warm load [K10]. `/studio/middle-east` and `/account/downloads` show "Sign in required" with no download link (wait at least 7 s). Unauthenticated `GET /api/studio-token?product=middle-east&file=stem.mp3` returns 401 with no URL. Check 2 rc 0 |
| C6 | TESTS + MUTANTS | The §3 covering command; `python3 -I b-round-513/mutants-514.py <copy> c-round-514/mut-logs` on a copy outside `store/` with A's tree | rc 0, 6 files, 99 tests, R514-F1…F9 and N3-3 present, none above 2,500 ms. Each of M1–M15 is red on the rows in `b-round-513/mut-logs/mutants-summary.json` [K14]. Delete the copy afterwards |
| C7 | GREP + SCANNER + LINT | from `store/` | `grep -c '<button' app/components/common/CookieConsent.tsx` = 0. `grep -c 'querySelector<' app/components/common/CookieConsent.tsx` = 0 (no generic narrowing). Scanner 50 with no CookieConsent entry. `npm run lint` shows 171 warnings |
| C8 | DOC 332 + LEDGER | doc 332, `a-round-514/doc-ledger.md` | The 7 headings in order. l.4 byte-equal to `**სტატუსი:** Completed (C round 514 PASS)`. `grep -c 'pending'` = 0. Every cited row id exists in the test file. The ledger gives one source per behaviour sentence |
| C9 | CLAIMS + L57 | `bash b-round-513/claims-514.sh` compared with `b-round-513/claims-514-planning-output.txt`; `python3 -I tools/l57-check.py c-round-514.json c-round-514/l57-check.txt` | No MISSING. The differences equal `b-round-513/claims-514-allowed-delta.txt`: K2 lists the 3 paths, and K16 pre-sha FAILED by design. L57 rc 0 |

- **Gate rows** (list under `gate`, never `passed`): full vitest suite, build, Biome-all, `npm run verify`, `test:e2e:smoke`.
- **Blocked:** none expected.
- **L57:** write all L57 fields:
  - `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding;
  - `assertsSpecified`;
  - `mutantsRecorded` (15);
  - `mutantRedOnSketch`: `b-round-513/mut-logs/mutants-summary.json`;
  - `mutantRedOnTree`: C's run;
  - `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-513/precheck-tsc-sketch.log`), `chainHeadGateRunGreen`;
  - `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-513/sketch-covering.log`, `probe/sketch/`).
- **L22:** if A STOPs with no diff, run C0, C5 and C9 only. A STOP that names an unruled Medium+ is a short FAIL.
- **Neighbours that could break:**
  - CC1–CC6 (root class, Studio hide, route change, decisions, Privacy link);
  - N3-1…N3-6;
  - IL4 (the banner Link keeps focus);
  - store-theme-tokens, store-focus-ring and store-gradient-text scans.

  All are in the covering set [K17].
- **On closing:** a C PASS with `browserVerified` true closes both bugs. C-R205-02 stays deferred, and SABA-Q-513 and SABA-Q-507 stay open.

## 5. B's pre-check (`b-round-513/`)
| Check | Result | File |
|---|---|---|
| tsc on the dispatched sketch | rc 0 | `precheck-tsc-sketch.log` [K13] |
| Scoped Biome on both files | rc 0, no fixes | `sketch-biome.log` [K13] |
| Covering set | sketch 6 files / 99 tests; slowest test 183 ms | `sketch-covering.log` [K17] |
| Mutants M1–M15 | each red on its named rows | `mut-logs/` [K14] |
| New rows on the HEAD product file | N3-3 and R514-F1…F7 red; F8 and F9 green (behaviour pins killed by M9 and M15) | `r514-rows-on-head.log` [K15] |
| Browser HEAD :5175 vs sketch :5174, GA4 set, separate caches | layout at 5 widths; 22 focus rows each (HEAD BODY 22/22, sketch BODY 0/22; every keyboard row has a ring); `/studio-lab` no banner | `probe/head/`, `probe/sketch/` [K9] [K10] |
| Header sticky diagnosis | sticky with top -1500 at scrollY 1500 | `probe/sticky.mjs` [K11] |
| Journey on the sketch | consent denied; 0 banners on `/store` and the product page | `probe/sketch-journey/` [K19] |
| Lint and scanner | 171 and 50 (equal to HEAD) | [K18] |
| Reviews | product-designer approve (consult 2); tech-lead approve-with-changes, changes applied | consult and `sketch-review.md` |

## 6. After this round
1. **REGRESSION** on or after 2026-11-16 (`regression-last.json`).
2. **NONBRAND N4–N9.**
3. Then:
   - PD-R498-404-SECONDARY-ALIGN, then DPG-BUTTON-CONTRACT-TABLE;
   - the rest of DPG P1 (including the DPG2-* ids), the DP gate, then P2;
   - STORE-2c…5, then ARCH-SPLIT, then REVIEW-RECOMMENDATIONS, then the rest of the queue.

## Claims (`b-round-513/claims-514.sh`; planning output `b-round-513/claims-514-planning-output.txt`)
- **K1–K4:** HEAD, the clean tree, gate 513 and the C 513 verdict.
- **K5:** the banner sites at HEAD.
- **K6:** header and banner mount order; the sticky class and the logo link.
- **K7:** IconButton sizes; the global focus ring and its pointer suppression.
- **K8:** the GA4 render condition.
- **K9:** browser layout. **K10:** browser focus. **K11:** header sticky cause.
- **K12:** sketch sha, temp-copy apply and post pin, plus the L58 and ledger checks.
- **K13:** tsc and Biome. **K14:** mutants. **K15:** rows on HEAD.
- **K16:** frozen pins. **K17:** covering. **K18:** lint and scanner. **K19:** journey.
- **K20:** backlog entries. **K21:** regression date. **K22:** artifacts.
