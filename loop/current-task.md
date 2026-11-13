# Round 482: REGRESSION round, part 1 (REGRESSION-2026-11-13). C-only browser sweep of rounds 426–481, newest risk first, plus every carried scope addition. A changes nothing

**Planned by:** B, at the round 481 → 482 planning. Planning started 2026-11-12T23:47Z (`b-round-481.md`, `b-round-481/checkpoint.md`). The round-481 task is archived as `tasks/round-481.md` [K16].
- **Advisor:** available and consulted twice.
  - After orientation, it flagged six things: the early-run wording, the stale oracles (the overlap map in §2), the L6 carry, the baseline and a new manifest, the backlog before-copies, and the order shift.
  - Before hand-off, it flagged four more: compare-script inputs, pre-font scroll numbers, round 453's non-home glows, and small wording.
  - All ten are applied below. The compare invocations were validated by B runs at `751e30e`; see the §2 "B pre-runs" list.
- **Decisions:** D-29z1712 … D-29z1715 (`backlog.json` `decisions_log_b`, `regression_rounds` id `REGRESSION-2026-11-13`).

## Read first
- **`lessons.md` in full.** Directly relevant:
  - L6: every scope addition is a named row or marked "carried".
  - L29 and L56: claims.
  - L36: stubbed client path before BLOCKED.
  - L38: perf runs alone; warm `/studio-lab` before timed probes.
  - L48: playback-start lead; wait for `Demo collection ready`.
  - L54: journey row.
  - L57: all harness fields.
  - L59: do not end early; heaviest first.
  - L60: destructive commands stay in `c-round-482/`.
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md`. Read the speed rules, "Regression round every 3 days", the 2026-10-23 bug gate and the cloud-runner section.
- **The template, by reference:** `tasks/round-423.md` §2–§7 (part 1 of the previous regression) [K16]. **This task lists only rounds 426–481 and the scope additions. Where it differs from round 423, this task wins.** Part 2 covers everything up to round 425 and the carries of REGRESSION-2026-11-10. It is planned for round 483 (§8).
- **Claims:** `bash b-round-481/claims-482.sh` (`STORE_ROOT=` can be overridden).
  - Planning output: `b-round-481/claims-482-planning-output.txt`. Its stderr, `claims-482-planning.err`, is empty.
  - Run the script at G482-SCOPE start and end. The output must equal the planning output.
  - K15 runs the hue scan into a temporary file. The output must still read `TOTAL 20 equal-474 yes`.

## Baseline: HEAD `751e30e`, clean tree
- `gates/gate-round-481.json` is `published` at `751e30e475ab…` on both remotes [K6].
  - Its `head` field (`bbb3193`) is the pre-commit HEAD. Do not use it.
  - `context/head-sha.txt` (`bbb3193`) is stale as well.
- At planning:
  - `git rev-parse HEAD` = `751e30e` [K1];
  - status empty [K2];
  - tracked tree frozen in `b-round-481/r482-tree-sha256.txt` (1,393 entries, rc 0) [K3];
  - protected files 11/11 OK (`b-round-318/protected-sha256.txt`, rc 0) [K4].
- If root publishes in between and K1 differs:
  - a root-only commit that leaves `git diff 751e30e HEAD -- app` empty is accepted, with a note (L29);
  - anything else is "STOP — baseline differs".

## 0. Why this round (D-29z1712, D-29z1713)
- **Round 481 passed and is published.** C PASS, 8 rows, `browserVerified` true, 0 bugs. Gate 481 published `751e30e`.
  - B-R478-DEAD-MUSIC-LINK stays open: the protected `account.downloads.tsx` half is ROOT-REQ-DOWNLOADS-MUSIC-LINK.
- **The regression runs a few minutes early, on purpose.** `regression-last.json` = 2026-11-10, round 425 [K5]. B started planning at 2026-11-12T23:47Z, 13 minutes before the 3-day mark, and A and C run on 2026-11-13.
  - The 3-day rule is a floor, not a prohibition (precedent: D-29z1476, round 423 was planned an hour early).
  - D-29z1709 already ordered 482 = REGRESSION.
  - Rounds 426–481 changed shared infrastructure on both sides:
    - Studio: the held-key guards, IME, native control chrome and the copy;
    - Store: tokens, teal, glows, fonts, the entrance, client navigation and the LeadMagnet routes.
  - `regression-last.json` is **not** updated until part 2 closes.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only, `awaiting_user`, or scheduled (CLIENT-NAV-CONTRACT, B-R480-ORDER-CARD-KEYBOARD).
- **Reference / Ableton / product-designer:** this is a regression round. It adds no new behaviour and makes no new parity claim. C judges the CZABA requirement only. Ableton conformance: does not apply.

## 1. A: no code or doc change
- From `store/`: `git rev-parse HEAD` must be `751e30e…` and `git status --short --untracked-files=all` must be empty. If either differs, write "STOP — baseline differs" at the top of `a-round-482.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer: there is no change.
- Write `a-round-482.md` with:
  - the start HEAD;
  - the status output;
  - the line "no change by design (REGRESSION round, D-29z1713)".
- **Forbidden:**
  - `global_forbidden_files` / `global_forbidden_actions`;
  - the protected files;
  - commit, push, stash, checkout, deploy;
  - dev-server restarts.

## 2. C: scope, method and budget (round 423 §2 applies, with these changes)
- **Tools.** Each row names the script of the round it re-checks; every one exists [K16].
  - Copy what you use into `c-round-482/` and run the copies. Never write into an earlier round's folder (L38, L60).
  - Keep each copy at the same folder depth as its source, so relative imports such as `c-round-382/lib.mjs` and `c-round-205/tools/lib.cjs` still resolve.
  - Where a script hard-codes an output path or URL, changing it is "lookup, not deviation"; name the change.
- **Oracle rule (the overlap map, D-29z1713).** "As in round N" means: reuse that round's script and its PASS output as the oracle.
  - **Compare inputs.** The `compare*.py` scripts of rounds 426–434 read a `head/` folder that holds that round's **pre-fix control** (e.g. 430's compare asserts that HEAD still showed spin buttons). So copy round N's own `head/` folder **unchanged** into `c-round-482/<row>/head/`, write the new run to the run folder the compare reads (`sketch/` or the named subdir), and invoke the compare exactly as written in the row. Never put a post-change output into `head/`.
  - Where a row names a JSON oracle (`after/`, `*-tree.json`, `rows.json`), the new run must equal it as the row states.
  - A later round in 426–481 changed several of the measured surfaces on purpose (the map below, from `gates/gate-round-*.json` `paths`). For those rows the oracle is the **latest** round's output, and an earlier round's cell that differs only on the element the later round changed is compared with the later round's value.
  - If no later output holds that value, the cell is `record`, with the later round named. It is never a finding by itself.
  - A cell that differs on an element no later round touched is a finding.

| Surface (file) | Changed in rounds | Latest oracle |
|---|---|---|
| `ArrangementDetailPanel.tsx` | 427, 430, 437, 442, 443, 445 | 445 for key handling; 437 for the Detail hairline; 430 for spin buttons |
| `ArrangementExportDialog.tsx` | 428, 431, 432, 434, 437 | 437 for the Export button; 431/432/434 for their own chrome |
| `ArrangementShortcutSheet.tsx` | 428, 433, 434, 444 | 444 for the search IME/focus; 434 for the scrollbar; 433 for the clear button |
| `ArrangementMarkerRow` / `TempoRow` / `GroupHeader` | 426/429, 442, 443, 445 | 445 (`c-round-445/*.json`) |
| `app/styles/app.css`, `utilities.css` | 449, 453, 454, 463, 464, 473, 474, 475 | 474 (`c-round-474/browser.json`) and 475 (`c-round-475/rows.json`, `card.json`). **The glow inventory of 453 and the teal states of 447/454 are superseded and are not oracles** |
| `ProductSection.tsx`, `StudioShowcase.tsx` | 449, 470, 479 | 470 for the glows; 479 for the links |
| `SpotlightLoader.tsx`, `EntranceCover.tsx` | 447, 460, 477 | 477 for colours; 460 for the timing rules |
| `ProductCard.tsx` | 447, 475 | 475 |
| `LeadMagnetPopup.tsx` | 446, 449 | 446 for routes |

- **Changed UI facts since round 425.** Adapt older scripts to these. Each is tagged.
  - **Copy (436):** the Detail panel says "Clip origin", "From" and "To" [K8 1/1/1].
  - **Store footer and content links are client-side `<Link>` since round 479** [K9 9 `<Link>` in Footer, `app/lib/link-focus.ts` exists]. A script that waits for a full `load` after a footer click will hang. Wait for the URL and the page heading instead.
  - **Entrance (477):** the entrance cover is `var(--color-background)` = `rgb(14, 13, 12)` [K10 1], not round 460's `rgb(0, 0, 0)`.
  - **Fonts (473):** the Store body font is Instrument Sans [K11 2].
  - **Glows (470):** the home page has no `blur(100/120px)` glows [K12 0].
  - **Teal (474):** the only teal hits left are the 20 in frozen legacy Studio files, identical to round 474 [K15].
  - **My Orders (481):** the empty state links to `/store`. The protected downloads half still links to `/music` [K13 1/1].
  - **Held-Enter guard (426–429):** 15 Studio component files import `studio-repeat-safe` [K14 15].
- **B pre-runs at `751e30e` (L58; saved under `b-round-481/probe/`).**
  - `p430/`: spin probe + compare gave `ALL OK (6 cells)`.
  - `p426/`: held-Enter 2a + compare gave `ALL OK (28 cells)`, in 2 m 46 s.
  - `ime-sites.json`: `compare-ime.py` gave `ALL OK (18 cells)`.
  - `store-colour-751e30e.json`: `compare-store-colour.py` against `c-round-474/browser.json` gave `ALL SAME (18 cells)`.
  - `rows-751e30e.json` (mock API on): 66/66 flat values equal `c-round-475/rows.json`.
  - `card-751e30e.json` (mock API on): equal to `c-round-475/card.json`.
  - Use these as a second oracle: a C value that differs from both B's pre-run and the round's oracle is a finding.
- **Single dev server.** Every dev row runs on :5173. A row that needs a production build serves its build on its own port (`git archive HEAD` scratch copy with a symlinked `node_modules`), so `store/` stays clean. Never start a second dev server that shares the store's `node_modules/.vite` (L38).
- **Mock API.** Only R482-JOURNEY, R482-SEEK-THUMB, R482-STORE-COLOUR (c)/(e) and REG-CART use it: start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199. At planning, :5199 answered `000`. Record its PID and stop only that PID. Mock data is not backend evidence.
- **Order (L59: heaviest first):**
  1. G482-SCOPE start and claims;
  2. RR-PERF alone;
  3. PERF-LIB;
  4. R482-SCROLL;
  5. the §3 Studio rows;
  6. the §4 Store rows;
  7. R482-JOURNEY;
  8. RG-SMOKE;
  9. G482-AUTH;
  10. G482-SCOPE end.

  Write `c-round-482/progress.json`, `c-round-482.json` and `c-round-482.md` after every row.
- **Budget per row:** up to 2 replacement attempts, for environment-invalid runs only (a cold-start timeout, a port in use; keep the log). Thresholds are not relaxed. A row that fails on a valid setup is a finding.
- **Console noise known in the cloud:** `Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`. Record any other page error with its row.
- **Both viewports** (1440×900 and 1280×720) on every row unless the row says otherwise.
- **Severity:** the 2026-10-23 bug gate applies. Medium and above → a fix-up round. A new Low → `deferred_low_polish`.

## 3. C: Studio items finished in rounds 426–445 (one short check each)

| Row | Item (rounds) | Action and expected |
|---|---|---|
| R482-HELD-ENTER | SYS-2 stages 2a, 2b-i, 4, 5 (426–429) | Run the four held-Enter probes: `c-round-426/probe/held-enter-2a.mjs`, `c-round-427/probe/held-enter-2bi.mjs`, `c-round-428/probe/held-enter-2bii.mjs`, `c-round-429/b428copy/probe/held-enter-s5.mjs`. Each is copied with its `compare.py` and its `head/`. Invocation: `OUT=<abs>/c-round-482/pNNN/sketch node <probe>`, then `python3 -I compare.py c-round-482/pNNN`. 426 and 427 import `../../c-round-382/lib.mjs`, so keep them two levels below the loop folder. **Pass:** each compare prints `ALL OK`, with the same cell count as its round's `compare` output (426: 28 cells, B pre-run). The IME rounds 442–445 changed key handling on the marker, tempo, group and Detail editors, so a cell on those editors is judged by the 445 oracle (R482-IME), per the §2 rule |
| R482-SPIN **[REG-SABA-B-12-SPIN]** | SABA-B-12 stage 1 (430) | `OUT=<abs>/c-round-482/p430/sketch node spin-probe.mjs`, with `c-round-430/probe/head/` copied to `p430/head/`, then `python3 -I compare.py c-round-482/p430 sketch` → `ALL OK (6 cells)`. **Pass:** no spin-button pixels at rest, hover or focus on the From, To and Clip Gain fields, at both viewports. Labels read "From"/"To" (436) |
| R482-RADIOS **[REG-SABA-B-12-RADIOS]** | stage 2a (431) | `OUT=<abs>/c-round-482/p431/after node radio-probe.mjs` (with `c-round-431/probe/head/` copied to `p431/head/`), then `python3 -I compare-radio.py c-round-482/p431 after` → `ALL OK (2 cells, 6 radios each)`. `OUT=<abs>/c-round-482/p431/after-extra node radio-extra-probe.mjs`, then `python3 -I compare-extra.py c-round-482/p431/after-extra` → `EXTRA ALL OK (2 cells)`. **Pass:** both lines, covering the theme dot, the forced-colours fallback, disabled-checked while rendering |
| R482-PROGRESS **[REG-SABA-B-12-PROGRESS]** | stage 2b (432) | `OUT=<abs>/c-round-482/p432 node progress-probe.mjs`, then `python3 -I compare-progress.py c-round-482/p432` → `ALL OK (2 cells, 4 states each)`. **Pass:** theme fill and track; the indeterminate pulse; static under reduced motion; `appearance: auto` under forced colours; the MP3 and WAV downloads complete |
| R482-SEARCH-CLEAR **[REG-SABA-B-12-SEARCH-CLEAR]** | stage 3 (433) | `node clear-probe.mjs http://127.0.0.1:5173 <abs>/c-round-482/p433`, then `python3 -I compare-clear.py c-round-482/p433` → `ALL OK (2 cells)`. **Pass:** no native cancel ✕; Clear search clears the field and focuses it; the real Tab order is unchanged; Esc closes |
| R482-DIALOG-SCROLLBAR **[REG-SABA-B-12-DIALOG-SCROLLBAR]** | stage 3b (434) | `node scrollbar-probe.mjs http://127.0.0.1:5173 <abs>/c-round-482/p434`, then `python3 -I compare-scrollbar.py c-round-482/p434` → `ALL OK (2 cells)`. **Pass:** the shortcut sheet (both viewports) and Export (1280×720) show the warm Studio thumb, with 0 teal px and computed `scrollbar-color` auto |
| R482-COPY | COPY-PD-VIS stage 1 (436) | `b-round-435/probe/copy-probe.mjs`. **Pass:** the JSON deep-equals `c-round-436/probe/copy-probe.json` except the base URL. The Detail panel shows "Clip origin 00:00.000", "From"/"To"; the old phrase has 0 hits in all 4 states |
| R482-EXPORT-VIS | COPY-PD-VIS stage 2 (437) | `b-round-436/probe/vis-probe.mjs` + `summarize.py`, plus `narrow-probe.mjs`. **Pass:** the summary is identical to `c-round-437/vis/summary.txt`: rest brass with text rgb(14,13,12), hover 217,184,127, focus ring 0.8 at 2px, box 113×38. The exit link and the 1 px lane hairline match round 437 rows C4–C6. **Plus** one WAV export of the demo clip: 24-bit, 48 kHz stereo, ≈ 101.352 s, not silent (RMS > 0), as `c-round-437` C13 |
| R482-IME | SYS-3 stages 1, 1-fix, 2a, 2b (442–445) | Real Chromium with CDP IME, as in rounds 443–445. The scripts read the base URL from `BASE` and print their JSON to stdout (redirect into `c-round-482/ime/`). Run on :5173 only, with no HEAD server:<br>• `b-round-441/probe/ime-sites.mjs` → `compare.py`;<br>• `b-round-442/probe/ime-held.mjs` → `compare-held.py`;<br>• `b-round-442/probe/plain-held.mjs` → `compare-plain.py <new.json> c-round-445/plain-tree.json` (the latest tree output, per §2);<br>• `b-round-443/probe/ime-stage2.mjs` → `compare.py`;<br>• `b-round-443/probe/focus-targets.mjs` → `compare-c7.py <new.json> c-round-444/c7-tree.json`;<br>• `b-round-444/probe/held-escape-video.mjs` → `compare-video.py`.<br>**Pass:** sites, held and stage2 are each `ALL OK (18 cells)`; plain is `ALL SAME (18)`; focus targets `ALL SAME (6)`; held Esc + video `ALL OK (14)`. For sites, held, stage2 and video, the compare checks a single output against its fixed expectations; `c-round-445/{sites,held,stage2}.json` are the reference outputs for any diff. B's pre-run of ime-sites gave `ALL OK (18 cells)`. A cold-start `error` cell may be re-run once (round 443–445 precedent) |
| R482-OVERVIEW (record) | SYS-1 stage 2 (441; Overview data hooks, test-only otherwise) | After the first clip is added, the Overview strip is visible. Ctrl+Alt+O hides it and shows it again (CALM-3 contract). Screenshot each state. Record only: rounds 438–441 are test-only, and the gate's suite covers their asserts |

Not re-checked here:
- rounds 435, 450, 465 and 480: RETRO, no app code;
- rounds 438–440, 451–452, 456–458 and 466–467: test-only; the gate's full suite covers them;
- round 468: diagnosis only;
- round 478: docs only;
- rounds 462–464: dead-module and dead-CSS deletions; the gate's build covers them, and the §4 Store page rows load every Store page they touched.

## 4. C: Store items finished in rounds 446–481, and the scope additions
| Row | Item (rounds) | Action and expected |
|---|---|---|
| R482-SCROLL **[REG-SCROLL-HOME-FRAMES]** | SABA-B-15 (468–470) | Use the **last** update only (`what_update_d29z1657`). Run `b-round-467/probe/store-scroll-probe.cjs` and `b-round-468/store-scroll-probe-full.cjs` (PATHS `/`, `/gift-cards`) on a **production build of `751e30e`**, and the control on a production build of `9ba13ac` (the pre-fix look). Each build is a `git archive` scratch copy with its own port.<br>**Pass, both viewports:**<br>• tree `/` p95 ≤ 17.0 in ≥ 8 of 9 passes;<br>• `movingOver33` median ≤ 2;<br>• moving ≥ 100, finalY 2400 (the probe's scroll target; if the page is now shorter, finalY === maxScroll);<br>• `/free-downloads` 0 slow frames and finalY === maxScroll. Record the value. Round 470's 575/755 predates the round-473 font change, so it is not an assert;<br>• full page `/`: median ≤ 2, finalY === maxScroll, moving ≥ 100.<br>**Control:** `9ba13ac` `/` p95 ≥ 33.0 in ≥ 2 of 3 passes per viewport. If the control does not reproduce, the row is invalid, not PASS.<br>**Look band (`record`):** `b-round-468/look-probe2.cjs` + `look-profile.cjs`, ratioToHead against the `9ba13ac` build. The fonts changed in 473 and the layout heights with them after that build, so the band 0.8–1.3 is recorded, not asserted. A visible ring, seam or banding in the screenshots is a finding. A "cluster" is ≥ 2 slow frames inside one fix band in one pass, recurring in ≥ 2 passes. The isolated frame near y≈372 is C-R470-F1 (deferred), not a finding.<br>Runs alone, never with RR-PERF |
| R482-FONTS **[REG-STORE-2C-1-FONTS]** | STORE-2c-1 (471–473) | The condition "only if round 471 C PASS" is met through the round-473 PASS, which closed STORE-2c-1 (D-29z1714). `b-round-470/type-probe.cjs` on `/`, `/store` and `/about`. **Pass:** computed body and h1 `font-family` start with "Instrument Sans"; the CDP platform font of the h1 = Instrument Sans; 0 `inter-*` / `playfair-*` woff2 requests |
| R482-LEADMAGNET | STORE-2b-1 (446) | `b-round-445/probe/lm-routes.cjs` (it imports `c-round-205/tools/lib.cjs`). **Pass:** per-route results equal `c-round-446/tree-all.json`: the popup opens on `/` (`viewCount` 1); no popup and no `viewCount` on `/products/*`, `/cart`, `/checkout/success`, `/checkout/cancel`. Full loads only. The client-nav timer case is C-R479 C13 (record) and is not re-tested here |
| R482-STORE-COLOUR | teal, gradients, glows and tokens (447, 449, 453, 454, 474, 475) | **(a)** K15 = `TOTAL 20 equal-474 yes`: no teal outside the frozen legacy Studio files.<br>**(b)** `b-round-481/probe/store-colour-482.mjs <out.json>` (the `probe-*` part of `c-round-474/browser.mjs`, which writes into its own folder and needs a :5180 HEAD server, so it is not run), then `python3 -I compare-store-colour.py <out.json> c-round-474/browser.json` → `ALL SAME (18 cells)`: scrollbar-color rgba(201,164,106,.4); inline-button shadow brass; waveform-bar gradient rgb(201,164,106)→rgb(217,184,127); `--gradient-primary` brass stops; `--color-glow-primary` #c9a46a.<br>**(c)** With the mock API on, run `node b-round-474/probe/probe-rows.mjs http://127.0.0.1:5173 tree > rows.json` and `node b-round-474/probe/probe-card.mjs http://127.0.0.1:5173 tree > card.json`. They must equal `c-round-475/rows.json` (66 flat values) and `c-round-475/card.json`. Without the mock API, home has no cards and `probe-rows.mjs` crashes; that is an environment-invalid run. The non-New badge is rgb(236,230,218) on the dark chip, contrast ≥ 4.5; `.nav-loading-bar` is display none.<br>**(d)** `/hire-us` loads with its form (448's page; the e-mail builder is gate-covered); screenshot.<br>**(e) Round 453's non-home glows (not superseded by 470):** on `/store` and `/products/middle-east` (mock API), record the computed `box-shadow` of the primary Button at rest and hover, plus the purchase header, at both viewports. The zero-offset glow scanner tests (466–467) are gate rows. A coloured zero-offset glow (offset 0, blur > 0, brand or teal colour) is a Low finding. The pixel diffs against HEAD in 447/453/454 are not repeated (superseded, §2) |
| R482-SEEK-THUMB | SABA-B-14 (455) | `b-round-454/probe/seek-probe.mjs` on a product page (mock API on). **Pass:** the thumb's lead over the brass fill is 0.00 at all 10 paused samples at both viewports, as `c-round-455` row C4 |
| R482-ENTRANCE | SABA-B-13 (459–461) + DPG-P0-3a (476–477) | `b-round-475/probe/probe-entrance.mjs` and `b-round-458/probe/entrance-timing.mjs`, plus `c-round-477/journey.mjs`.<br>**Pass:**<br>• every non-null cover sample, the overlay and `body` after exit are `rgb(14, 13, 12)`;<br>• the loader wordmark is `rgb(201, 164, 106)`, weight 700, box 318×72;<br>• the header logo is brass, weight 800, on `/` and `/store`;<br>• journey: the entrance ends, the product page opens without a loader, and Back to `/` shows no second entrance.<br>**Timing:** the exact values are recorded (C-R477 C8: `coverMs` ≈ 1284–1297, `offAt` ≈ 1699–1756 at 1440). The only timing assert is SABA-B-13's window: `offAt` in 1450–1900 ms in at least 1 of 3 runs. 3 of 3 outside the window is a Medium finding |
| R482-CLIENT-NAV | DPG-FOOTER-LINKS (479) | `b-round-478/probe/nav-probe-sketch.mjs`. **Pass:** equal to `c-round-479/nav.json`: footer Support, FAQ and Contact links change the path with no reload (marker alive), `scrollY` 0 at 400 ms and 3 s, first Tab = `a[href="/"]`, and Ctrl+click / middle-click open one new page while the current page keeps path and scroll. `/license` → 404 is the known B-R478-DEAD-LICENSE-LINK, not a finding |
| R482-ORDERS | B-R478-DEAD-MUSIC-LINK half (481) | `c-round-481/c481.mjs` (the L36 stubbed path). **Pass:** the C4 and C5 values equal `c-round-481/c481-out.json`: href `/store`, Enter lands on `/store` with a full load, first Tab after load = the logo, button box 151×50. Unstubbed → "Sign in required" |
| REG-CART **[REG-CART-CONFIRMDIALOG-SKIN]** | 434 (ui/Modal) | L36 first: mock API on, plus `page.route` stubbing `GET /api/cart` with one item (the mock returns an empty cart). Open `/cart`, press remove, and read the ConfirmDialog's scroll container class and computed `scrollbar-color`. **Pass:** the class is `styled-scrollbar` (the Modal default) and the store scrollbar style applies. If the stubbed client path cannot reach the dialog, the row is BLOCKED with the exact reason (backend unavailable in cloud) and listed under `blocked`. It is never PASS |
| R482-JOURNEY **[L54]** | journey | As R423-JOURNEY (`c-round-389/tools/journey.cjs`, mock API): product page → "Try it in the Studio" → `/studio-lab` titled "CZABA Studio" → Enter adds a clip → Space plays ≥ 1 s → Stop → Export WAV, not silent → "View in store" opens a new tab with `opener` null. Screenshot per step |

**Carried to part 2 (round 483), not run here (L6):**
- `carry_to_next_regression_d29z1490` of REGRESSION-2026-11-10: R-RVM, R-CROSS-LANE-FIBERS, R-FOLLOW-OFFSET, R-DEV-WARMUP and R-EVICT-PIN, with their base copies;
- the round-423 rows (items finished in rounds 391–422);
- the round-425 rows (items finished up to round 390).

## 5. C: perf, perf lib, smoke, auth and scope
- **RR-PERF [REG-PERF-FULL-SUITE]:** `npm run test:perf` **alone** (L38), first after the start claims, on the production build that config uses. `perf/` last changed at `cc5cbc6` [K7].
  - **PASS:** rc 0; every spec passes; every asserted budget row passes; `complete` true; 0 aborts; 0 page errors.
  - Compare every `interact.*` components row with the last green run, `c-round-424/perf-results/`, and list every change.
  - A failing budget on a valid isolated run is a finding: Medium for fader, drag or playback budgets, Low otherwise.
  - Save `latest*.json` under `c-round-482/perf-results/`.
- **PERF-LIB:** GATE304-M1 is still open. From `store/`, run `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs`. All must pass; report the counts. Never run it during RR-PERF.
- **RG-SMOKE:** `npm run test:e2e:smoke` in `store/` [K17], alone.
- **G482-AUTH:** as `c-round-389/tools/auth-smoke.mjs`, both viewports.
  - `/studio-lab` anonymous opens the workspace, with `auth_user` null.
  - `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.
  - `/api/studio-token?product=middle-east&file=a.mp3` with no header → 401, and no token in the body.
  - Fake Bearer → BLOCKED (backend unavailable in cloud), listed under `blocked`. It does not make `browserVerified` false.
  - SRW-21 stays `deferred_user`.
- **G482-SCOPE** (start and end): K1 `751e30e`, K2 0, K3 1,393 rc 0, K4 rc 0, and the claims output equals `b-round-481/claims-482-planning-output.txt`. Any change by anyone is a SCOPE FAIL; name the writer if you can.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome, `npm run verify`.

## 6. What could break, and where to look first
- **The Store CSS:** 8 rounds edited `app.css` (449–475). Watch R482-STORE-COLOUR (c) and R482-ENTRANCE for a lost token, a reappearing glow or a moved box.
- **Client navigation (479)** changed how pages are entered:
  - a LeadMagnet, entrance or scroll-reset regression shows up in R482-CLIENT-NAV and R482-LEADMAGNET;
  - the unannounced title is the known GATE479-M1, not a new finding.
- **Key handling (426–445)** touched every inline editor and transport button:
  - a single press or a mouse click must still act exactly once (R482-HELD-ENTER, R482-IME plain cells);
  - a preview or playback that does not stop is Medium.

## 7. Report
- **`c-round-482.json`** contains:
  - `taskStatus`: PASS, FAIL or PARTIAL;
  - `passed`, `failed`, `blocked`, `gate`, `notRun`;
  - `bugs`, each with `severity`, `origin`, repro and evidence path;
  - `browserVerified` and `realVerified`;
  - **all L57 fields:** `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (`null`, with the reason "regression round, no sketch"), `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`.

  Run `python3 -I tools/l57-check.py c-round-482.json c-round-482/l57-check.txt` before hand-off.
- **`c-round-482.md`:** one table, one line per row, each with its evidence file.
- **PARTIAL** is allowed only for a real time-limit stop. `progress.json` names the rows left and the `stopSignal`. A PARTIAL round is not done.

## 8. Outcome, fixed in advance (D-29z1715)
| C result | B at the 482 → 483 planning |
|---|---|
| Every row has an allowed result and there is no Medium+ finding (Lows → `deferred_low_polish`) | Round 483 = REGRESSION part 2 on the same baseline: the round-423 and round-425 rows plus `carry_to_next_regression_d29z1490`. When part 2 closes, B updates `regression-last.json`. Then 484 CLIENT-NAV-CONTRACT (GATE479-M1) and 485 B-R480-ORDER-CARD-KEYBOARD |
| A Critical or High finding | Round 483 = its bounded fix-up; part 2 follows |
| A cloud-reproducible Medium finding | Round 483 = its fix-up (≤ 3 related bugs), unless it is root-only or manual-only; part 2 follows |
| PARTIAL (time limit) | Round 483 continues part 1 from `progress.json` before part 2 |
| A browser row that could run here did not run | `browserVerified=false`; B re-plans that half |
