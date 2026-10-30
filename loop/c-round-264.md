# C round 264 — L46-CONTRACT-CHECKS: verdict **PASS**

`browserVerified` = `realVerified` = **true**. Env: `env-status.json` (store 200, checked 2026-10-30T07:29:55Z). HEAD `28c4f83`. No bugs.
Ableton conformance for every row: **not applicable**. These rows check CZABA handler contracts, not Live behaviour (task §3).

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: `sha256sum -c` rc 0 at start and at end of C's phase; status = exactly the 2 granted `??` files; HEAD `28c4f83bf3a9…` | shell, re-run at end |
| Claims (L29) | K1–K9 and K12 re-run verbatim (`claims.txt`); K10/K11 covered by C's equivalent `cc.mjs` (allowed by §3). All values match B's expected outputs. K1 now shows 2 lines and K3 shows `0` and `197-…` only because of A's 2 granted files. The L29 untagged-fact grep hits only the claims block | `c-round-264/claims.txt` |
| MS-REVIEW | PASS: MS1–MS5 run `it.each` Ctrl/Meta halves; MS6 is Alt-only. Each asserts the effect (clip count, `aria-pressed`, loop state, status text, Undo/Redo `title`) before the `defaultPrevented` check. Selectors are role, testid and `aria-keyshortcuts`; there are no class selectors | `meta-shortcuts-ui.test.tsx` l.211–317 |
| TESTS-TARGETED | PASS: 3 files, 47/47 | `vitest-targeted.txt` |
| MUTANTS (C's own scratch `tmp/c264-scratch`, new file only) | PASS. Control 11/11. **M1**: 5 Meta halves red at l.219/233/248/266/284; Ctrl halves and MS6 green. **M2**: MS3 Ctrl and MS3 Meta red at l.248 (2 failed, 9 passed). Restored diff-identical | `mutant-control.txt`, `mutant-m1.diff/.txt`, `mutant-m2.diff/.txt` |
| DOC-197 | l.4 = `**სტატუსი:** Completed (C round 264 PASS)`. Its 7 `## ` headings are TEMPLATE's 7 content headings, in order. It cites only MS1–MS6 (plus GATE244-S4 as context) | grep |
| CC-META-1440 / -1280 | PASS. The capture listener records Meta keys as `meta true, ctrl false, trusted true`. Control and Meta give identical steps: clips 1, 0, 1, 0, 1 → 2 after E; "Clip split at 00:07.500."; Loop `true` with "Loop created and turned on: 00:02.500 — 00:07.500.", then `false` with "Loop is off; the range is kept." Exactly 1 Loop button. 0 page errors | `cc.json` `.meta`, `meta-*-loop-*.png` |
| CC-ALTGR-1440 / -1280 | PASS. (1) AltGraph: state true, `dispatchEvent` true, Overview stays, status unchanged. (2) Without AltGraph: prevented, Overview hidden, "Overview hidden. Ctrl+Alt+O shows it again." (3) After the synthetic toggle restored the Overview (`altgr_restored` true), two real `Control+Alt+KeyO` presses: first hidden ("Overview hidden. Ctrl+Alt+O shows it again."), then shown ("Overview shown. Ctrl+Alt+O hides it.") | `cc.json` `.l46.*.altgr_*` |
| CC-SR-ORDER-1440 / -1280 | PASS. Active right after the press is `BUTTON "Expand video"`. It matches `:focus-visible`, with outline solid / 1px / offset 2px, colour C9A46A at 0.8. Status after 600 ms is "Overview hidden. Ctrl+Alt+O shows it again." The ariaSnapshot shows region "Video" with paragraph and button "Expand video", and no Overview | `cc.json`, `sr-order-*.png` |
| CC-CTRLCLICK-1440 / -1280 (observe and record) | PASS on the regression criterion. (a) Right-click from "Search the library": menu 1, Escape returns focus to the INPUT. (b) Ctrl+left-click from the same field: after the press, focus is **BODY** and no menu has opened (Linux). The dispatched `contextmenu` opens the menu (count 1). After Escape, focus is **BODY**. This is **GATE244-S4 reproduced** at both viewports. It stays `deferred_low_polish` (D-29z548) and is not a FAIL | `cc.json` `cc_right`/`cc_ctrl`, `ctrlclick-*.png` |
| G264-AUTH | PASS. `/studio-lab` anon: workspace (4 lanes, Add), demo notice 1, demo badge, `auth_user` null, 0 cookies, 0 page errors. `/studio/middle-east`: "Sign in required" 1, `audio[src]` 0, 0 audio or token requests. `/api/studio-token` with no header: **401** "Please sign in to access Studio.", no token | `g264-auth.json`, `studio-*-anon-1440x900.png` |

**Gate rows (not claimed):** the full vitest, the build, Biome (full), `npm run verify` and `test:e2e:smoke`. Their result is in `gates/gate-round-264.json`.
**notRunHere (neither PASS nor FAIL):** Windows AltGr, macOS Cmd and Ctrl+click, VoiceOver/NVDA, and Safari (A-R204-SAFARI-USERMENU-CLICK). Reason: the cloud is Linux Chromium only; these are Saba's platform checks. This round proves only that **Chromium-delivered** `metaKey` and AltGraph events reach the right handlers.

## Notes for B
1. Environment: the first `cc.mjs` attempt timed out waiting for "Demo collection ready" (curl and env-status already returned 200). Likely cause: the first browser load triggering Vite module transforms. This is not confirmed. The next run of `diag.mjs` saw the text within 5 s. That used one replacement attempt; the log is kept in `cc-attempt1-invalid.log`.
2. `/api/studio-token` with a fake Bearer returns **500** "Unable to prepare Studio access" because there is no backend. No token is issued. This is unchanged from round 262 (`c-round-262/g262-auth.json`) and outside this round's criteria.
3. GATE244-S4 cloud evidence: `c-round-264/cc.json` `l46.<vp>.cc_ctrl` and `ctrlclick-ctrl-menu-*.png`, for the deferred_low_polish entry.
4. C's scratch copy `tmp/c264-scratch` is outside `store/` and holds no mutant: `StudioWorkspace.tsx` is restored diff-identical.
