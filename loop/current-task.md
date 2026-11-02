# CURRENT TASK — Round 301: REGRESSION round (phase 1 + T12 V1 + everything done since round 199, now including rounds 259–300). C-only browser sweep; A changes nothing

Dispatcher: B · Implementer: A (no change, baseline report only) · Verifier: C · Planned 2026-11-02 · Decisions: **D-29z774 … D-29z780** (`backlog.json` → `decisions_log_b`, `rounds[301]`, `regression_rounds` id `REGRESSION-ROUND-2026-11-02`).

**Read first:**
- `lessons.md` in full. Directly relevant: L6 (every scope addition is a named row or "carried"), L29 (claims), L38 (perf runs alone), L48 (playback-start lead; wait for `Demo collection ready`), L25 (file chooser), L54 (journey row).
- The rules: `docs/technical/studio-real-workspace/agent-workflow.md` (speed rules, "Regression round every 3 days", the 2026-10-23 bug gate, the cloud-runner section).
- **The template, by reference:** `tasks/round-258.md` §2–§10 (which itself references `tasks/round-199.md`), plus `regression_rounds[2].template_corrections_d29z510` in `backlog.json`, and `c-round-258.md` (114 rows PASS, tools in `c-round-258/tools/`). **This task lists only what changed since round 258. Where this task and round 258 differ, this task wins.**
- The previous task is `tasks/round-300.md` (exact copy of the round-300 `current-task.md`, `cmp` OK). B's reasoning: `b-round-300.md`.
- Every fact about current code below carries a `[K#]` tag from `b-round-300/claims-301.sh` (output `b-round-300/claims-301-output.txt`). Re-run it at SOURCE-SCOPE start.

## Baseline: HEAD `aa7a6ef`, clean tree
- `gates/gate-round-300.json` is `published`; its `commit` field is `aa7a6ef27333fba8377e3ee06ee43024e24ce3c0`, on both remotes. (Its `head` field `61c37d8` is the pre-commit HEAD; do not use it.)
- At planning: `git rev-parse HEAD` = `aa7a6ef…` [K1]; `git status --short --untracked-files=all` is empty [K2]; the 7 protected files have no diff [K3]: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Frozen tracked tree: `b-round-300-r301-tree-sha256.txt` (1170 entries). Run `sha256sum -c` on it from `store/`; it must report 0 failures at start and at end.

## 0. Why this round (D-29z778)
- **Round 300 passed and is published** (C PASS, 19 rows, `browserVerified`/`realVerified` true; gate 300 published `aa7a6ef`). STUDIO-LINK (a…b) is complete.
- **The regression is due:** `regression-last.json` = 2026-10-30, round 258 [K8]; today is 2026-11-02 (3 days). The speed rule makes this round a REGRESSION round instead of new scope.
- **Nothing outranks it:** no Critical, High or Medium finding is open with a cloud reproduction. Round 300's findings are all Low (deferred, D-29z775).
- A Critical, High or Medium finding becomes round 302, a bounded fix-up (§7).

## 1. A — no code or doc change
- From `store/`: `git rev-parse HEAD` must be `aa7a6ef…`, and `git status --short --untracked-files=all` must be empty. If either differs, write "STOP — baseline differs" at the top of `a-round-301.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer (there is no change).
- Write `a-round-301.md`: start HEAD, status output, "no change by design (REGRESSION round, D-29z778)".
- Forbidden: everything in `global_forbidden_files` / `global_forbidden_actions`; the 7 protected files; commit, push, stash, checkout, deploy; dev-server restarts.

## 2. C — scope, method and budget (round 258 §2 applies, with these changes)
- **SOURCE-SCOPE** at start and end: HEAD = `aa7a6ef`; status empty; protected `git diff --quiet` rc 0; `sha256sum -c b-round-300-r301-tree-sha256.txt` 0 failures. Any change by anyone is a SCOPE FAIL (name the writer if you can).
- **Tooling:** reuse round 258's tools (`c-round-258/tools/` and the per-round scripts it cites) for §3–§4b. For §4c use the script of the round each row cites ([K9] lists the ones B confirmed exist). Where a round kept no script, rebuild the check from that round's row text in `c-round-N.md` and record a lookup. Copy what you use into `c-round-301/tools/`. Adapting a script only for an intended later change listed below is **"lookup, not deviation"**.
- **Changed UI facts since round 258 (adapt older scripts to these):**
  - **Master volume** is in the footer's last row, the middle of three children `P(reserve) · FIELDSET(arrangement-master) · BUTTON(Shortcuts ?)`, not in the header (rounds 262/263; `c-round-262.md` PLACE/STATES: footer 53, toolbar 49 at 1440 and 87 at 1280, Master x 911.75 / 751.75, width 424.25) [K12]. Round 258's below-toolbar tops and footer height are replaced by these.
  - **A lane background drag** makes a time selection that is not clamped to one clip. **Ctrl/Cmd + drag** on the background is the marquee. Ctrl+E splits every clip the selection touches (rounds 265/266/270).
  - **Clip drags with Snap on use relative snap:** an off-grid clip keeps its offset and moves in whole divisions (round 271). A clip that starts on the grid behaves as before.
  - **The clip envelope** is dB-linear from 0 to −60 dB, with −∞ at the bottom (SABA-B-7, round 269). Stored point gains are unchanged; their on-screen height and the shape between points changed. An older envelope row that measures a point's pixel height or a mid-segment level uses round 269's values (TAPER-EXPORT −15.003 / −29.999 / −44.999 dB at 25/50/75 %).
  - **Ctrl/Cmd+letter shortcuts do not fire with Alt or AltGr** (rounds 267/268).
  - **Disabled toolbar controls** are `aria-disabled`, keep their Tab stop and carry a reason title (SYS-5, rounds 276–278).
  - **Demo names are English** (FIX-PD-1b): `app/data/studio-lab-demo.ts` has 0 Georgian characters [K4]. **RV-EN has no ledger exemption any more** (D-29z779): every Georgian character in visible text or an accessible name is a hit, except user-typed text.
  - **Below 900 px wide**, `/studio-lab` hides the workspace and shows the narrow screen ("The Studio works on a computer", with a preview player) [K5] (FIX-PD-1c, rounds 292–294). The workspace cannot be measured below 900.
  - **Product pages** show "Try it in the Studio" for mapped products (STUDIO-LINK-a). Mapped library options have a "View in store" context menu and a `?` sheet row [K10] (STUDIO-LINK-b).
- **Store rows and journey rows need the mock API.** At planning :5199 returned 000 [K11]. Start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199, record its PID, and stop only that PID. Mock data is not backend evidence.
- **Order** (after a time-limit stop, resume from `c-round-301/progress.json`):
  1. SOURCE-SCOPE start, and re-run `claims-301.sh` (only K11 may differ, if you already started the mock);
  2. §4c (rounds 259–300, newest risk first);
  3. §4b (round 258's post-199 rows);
  4. §3;
  5. §4 and §4.S;
  6. §5;
  7. RR-PERF (alone, L38);
  8. RG-SMOKE;
  9. G301-AUTH;
  10. SOURCE-SCOPE end.

  **Write `c-round-301.json` and `c-round-301.md` after every row**, not only at the end.
- **Budget per row:** up to 2 replacement attempts, for environment-invalid runs only. Thresholds are not relaxed. A row that fails on a valid setup is a finding.
- **Network and console:** the known cloud noise is `Failed to load cart`, `ERR_CONNECTION_REFUSED` and `ERR_TUNNEL_CONNECTION_FAILED`. Record any other page error with its row.
- **Ableton:** this round introduces no new behaviour, so it makes no new parity claim. C judges only the CZABA requirement. Parity statuses stay as recorded in their rounds and in `user-review/ableton-review.md`.

## 3. C — Studio phase 1 + T12 V1 rows
Run round 258 §3 (RG-01 … RG-24, RG-T1 … RG-T4B, with round 258's adaptations and `template_corrections_d29z510`) at both viewports (RG-03 at 1440 only), with these further adaptations:

| Row | Adapted for | Change |
|---|---|---|
| RG-03, RG-05 | SABA-B-9 st.2 | Read and move the master volume in the footer. Its testids are unchanged: `arrangement-master-readout`, `-meter`, `-peak`. |
| RG-14 | 11c st.2 | Unchanged for an on-grid clip. **Add one sub-check:** with Snap off, drag a clip to ≈ 2.3; press G (Snap on); drag it right by about 1 s → start 3.3 ±0.001 (relative snap), not 3.000. |
| RG-T rows on the clip envelope | SABA-B-7 | Use round 269's dB-linear expectations (§2). Export levels are judged by R301-TAPER in §4c, not by pre-269 pixel heights. |
| RG-22 | FIX-PD-1c | The 390 px half becomes: at 390×844 and 800×720, `/studio-lab` shows the narrow screen, no workspace, and 0 page errors (as B-NARROW-LOAD, round 292). The desktop halves are unchanged. |
| Any row that drags on a lane background | 11c st.1 | A background drag now makes a range. Where an older row used a background drag to deselect, use a click (< 4 px) instead. |

## 4. C — round 258 §4 and §4.S (items finished between rounds 122 and 199)
Run them as in round 258, with these changes:
- **RV-EN:** no ledger exemption (§2). Scan the same states, plus the `?` sheet open and the "View in store" menu open.
- **RV-M:** Play is still the round, icon-only 32×32 ±0.5 button. Record its box. Its position may differ from round 257's numbers because of the master move; any change in size is a finding.
- **RV-SABA-3-4:** the Master fader is now in the footer; its expected style is unchanged.

The §4.S store rows (RS-1A … RS-2A, RS-4B, RS-HIDDEN, RS-LM) run with the mock API, as in round 258.

## 4b. C — round 258 §4b rows (items finished in rounds 200–257)
Run every §4b row of round 258 (RR-CURSOR … RR-TRANSPORT) as written there, with `template_corrections_d29z510` applied, plus:
- **RR-TRANSPORT:** round 262's PLACE/STATES numbers (§2) replace C-LAYOUT-256's below-toolbar tops and footer numbers. The transport-centred check and the toolbar-height check (49 / ≤ 87) stay.
- **SA-28 (carried, record only):** adaptive off, fixed 1/4 at 120 BPM, about 4 px/s, press `3`; record the result (D-29z509).
- **NO-SHIFT-203 (carried):** a tree-vs-ref compare needs a reference server. If you do not start one, mark it carried again, with that reason.

## 4c. C — items finished in rounds 259–300 (one short check each; both viewports unless stated)
"As in round N" means: reuse that round's C script and threshold. Every `scope_additions` entry of `REGRESSION-ROUND-2026-11-02` is a named row here or in §4b/§5 (L6).

| Row | Item (rounds) | Action and expected |
|---|---|---|
| R301-MASTER | SABA-B-9 st.2 (262/263) | As PLACE-1440, PLACE-1280 and STATES (round 262): <ul><li>Master sits inside the footer's last row as the middle child, not in `header`.</li><li>The gap to `Shortcuts ?` is 16 ±1, with 0 overlaps, and the footer's `scrollWidth` = `clientWidth`.</li><li>Master x and width are equal in the empty, clip, range and lane-move states.</li><li>Keyboard, stopped: focus the Master slider and press ArrowDown, ArrowDown, Shift+ArrowDown → readout −0.5, −1.0, −1.5 dB, and each key-up writes `Undo: Master Volume` (one entry per key-up, as round 262 KEYS measured).</li></ul> |
| R301-CONTRACTS | L46 contract checks (264) | As CC-META, CC-ALTGR, CC-SR-ORDER and CC-CTRLCLICK (round 264). |
| R301-BG-RANGE | SABA-B-11c st.1 + fix-ups (265/266/270) | As BG-RANGE, BG-INTO-CLIP, MARQUEE-CTRL, SPLIT-PAST-START, SPLIT-BG-INTO-CLIP, SPLIT-ALL-TRACKS and DP-BROWSER (rounds 265/266/270): <ul><li>a background drag from an empty point into a clip makes a range that crosses the clip edge;</li><li>Ctrl+drag draws the marquee;</li><li>Ctrl+E cuts every touched clip at the range edges that fall inside a clip;</li><li>the detail panel shows the range.</li></ul> |
| R301-HIDDEN-GRID-BG | pre-planned scope addition REG-11C-HIDDEN-GRID-BG | <ul><li>With Snap on, zoom out until the grid lines are hidden (`data-snap-paused` true). A background drag makes a free (unsnapped) range: both edges are within ±1 px of the pointer.</li><li>Control: at a zoom where the grid shows, the same drag snaps.</li></ul> |
| R301-ALTGR | GATE264-S2 (267/268) | As ALTGR-UNDO, CTRLALT-REAL, POS-CTRL, GESTURE-ARROW and MAC-ALT-ARROW: <ul><li>Ctrl+Alt+Z and AltGr+Z do not undo; plain Ctrl+Z does.</li><li>Arrows during a gesture behave as in round 268.</li></ul> |
| R301-TAPER | SABA-B-7 (269) | **Exports at 1440 only; the drag at both viewports.** As TAPER-EXPORT, SILENCE-EXPORT, NO-CLICK-EXPORT and DRAG-READOUT: <ul><li>a 0 dB → −∞ line measures −15 / −30 / −45 dB ±0.5 at 25 / 50 / 75 %;</li><li>two bottom points render digital silence;</li><li>no click at the points;</li><li>the readout shows dB while a point is dragged.</li></ul> |
| R301-REL-SNAP | SABA-B-11c st.2 (271) | As RS-B-OFFSET, RS-B-XLANE, RS-B-NUDGE and RS-B-GROUP: <ul><li>an off-grid clip keeps its offset across drags, lane moves, nudges and group moves;</li><li>the SNAP-TITLE text is unchanged.</li></ul> |
| R301-STATUS-LIFETIME | SYS-6 (272–274) | As B-PASTEND, B-RANGE-STATUS, B-SPACE-PLAYING, B-NUDGE-SINGLE, B-NUDGE-HELD and B-CLOBBER: <ul><li>texts that name the insert marker are rewritten when it moves;</li><li>a held nudge writes one result text;</li><li>no ready or seed text clobbers a later status.</li></ul> |
| R301-DISABLED | SYS-5 (276–278) | As B-TAB, B-AX, B-NOOP, B-REASON-TITLES, B-ENABLE-WHILE-FOCUSED, V-RING and B-CURSOR (rounds 276/278). Disabled toolbar controls: <ul><li>keep their Tab stop, with `aria-disabled=true` and a reason title;</li><li>do nothing on Enter, Space or click;</li><li>show cursor `not-allowed` and the keyboard ring.</li></ul> |
| R301-WORKER | PERF-2 (282/283) | As WORKER-BROWSER, LIBRARY-STATES and EXPORT-BITEXACT (`c-round-282/export-probe-c282.cjs`): <ul><li>the demo synth runs in a Worker, and the library reaches `Demo collection ready`;</li><li>the Pulse WAV export has sha256 `1fea093b…3f94` (4 608 044 B), and the all-7-clips export has `72228706…b574e` (25 056 044 B), as in round 282.</li></ul> If a hash differs, re-export once. A reproducible difference is a finding (Medium: export output changed). Pre-check by B: no commit since `54a3fcc` (rounds 282–283) touched the synth, WAV writer, graph or render-window files [K14]; the only later commit on `studio-lab-demo.ts` is `5a911ff` (round 289) [K15], and its diff changes display names only (18 lines, no time, gain or seed value). So the round-282 hashes still apply; a delta is not an intended change. |
| R301-PERF3 | PERF-3a/3b (284/285) | As ZOOM-ONE-COMMIT, RULER-NODES-IN/OUT, RULER-JUMP and RULER-FOLLOW-FLIP: <ul><li>one commit per zoom step;</li><li>the ruler renders only the page window;</li><li>a jump repaints at the new position.</li></ul> **WAVE-PIXELS** was an A-vs-HEAD compare. Here, compare with round 284's own screenshots (`c-round-284/shots`) at the same steps and thresholds. If the setup makes that comparison invalid, check instead that the waveform is non-blank at every step, record it, and let B rule. |
| R301-PRICE | FIX-PD-1a/1a2 (286–288; mock API) | As B-KNOWN, B-UNKNOWN, B-VERSION-CARD and B-FREE: <ul><li>a product with `standardPrice`/`minPrice` shows that price, never `$0.00`;</li><li>with no price, Buy is disabled, with its reason;</li><li>free items keep their free state.</li></ul> |
| R301-NAMES | FIX-PD-1b/1b2 (289/291) | As B-NAMES, B-GROUPS and B-KEYS: <ul><li>the demo names are English;</li><li>the collection label is shown once, as a group heading;</li><li>group headings are not options in the keyboard order.</li></ul> |
| R301-NARROW | FIX-PD-1c…1c3 (292–294) | As B-NARROW-LOAD, B-BOUNDARY (899 vs 900), B-NARROW-PREVIEW, B-NARROW-MIX, B-RESIZE-KEEP and B-DESK-SAME: <ul><li>below 900: the narrow screen and its preview player;</li><li>at 900 and above: the workspace;</li><li>resizing across 900 keeps the project and stops the narrow preview.</li></ul> |
| R301-LOAF | SYS-VACUOUS-ROWS (295) | As B-LOAF-REAL: the LoAF scripts entry is non-empty in a real Chromium run. Record the entry. |
| R301-LINK | STUDIO-LINK-a…a4 (296–299; mock API) | As B-LINK, B-LINK-KEYBOARD, B-LANDING, B-DEEP-NEGATIVE, B-COLD-DEEPLINK and B-DOCK-MUTED: <ul><li>the product-page link opens `/studio-lab?preview=<handle>`, with that source focused and selected;</li><li>an unknown handle lands normally, with no error;</li><li>both dock `<video>` elements report `.muted === true` after hydration.</li></ul> |
| R301-MENU | STUDIO-LINK-b (300) | As B-MENU, B-NEWTAB, B-KBD (Shift+F10 and ContextMenu), B-CLOSE (a–d), B-SPACE (0 audio sources started), B-UNMAPPED and B-SHEET (`c-round-300/rows.cjs`, `audio.cjs`). |
| R301-JOURNEY | L54 journey across 296–300 (mock API) | As B-JOURNEY (`c-round-300/journey.cjs`), extended by one step, with a screenshot at each step: <ol><li>product page → "Try it in the Studio";</li><li>the Studio, with the source selected → Enter adds it;</li><li>Space plays ≥ 1 s (the clock advances) → Stop;</li><li>Export WAV completes, non-silent and with the expected length;</li><li>right-click → "View in store" opens the product page in a new tab, with `opener` null.</li></ol> |

## 5. C — parked rows and observations (record only unless stated)
| Row | Source | Action | Expected / how B rules it |
|---|---|---|---|
| RP-METRO-MUTE, RP-SPACE-EMPTY, RP-VIDEO-MARKER | as round 258 | as round 258 | as round 258 |
| RP-NARROW | GATE257-NARROW-TOOLBAR-OVERLAP (Low), adapted for FIX-PD-1c | Toolbar bounding-box overlap at 1024×768 and 900×720 (the workspace is hidden below 900) | <ul><li>0 overlap is expected at both.</li><li>A new overlap at ≥ 900 px is Medium.</li><li>Below 900, only the narrow screen is checked (R301-NARROW).</li></ul> |
| RP-MENU-SHEET | b-round-299 §9 (unverified candidate) | Open the library "View in store" menu (Shift+F10), then press `?`. Repeat with the marker menu open. | <ul><li>Record whether the sheet opens over the menu, and where focus ends after Esc.</li><li>Focus on BODY, or two stacked dialogs → Low.</li><li>A lost edit → Medium.</li></ul> |
| RP-LINK-NATIVE-MENU | GATE300-S2 (Low, deferred) | With the menu open, right-click the "View in store" item | Record whether the browser menu appears. Record only. |
| RP-LINK-DRAG | GATE300-S3 (Low, deferred) | Drag the "View in store" item onto the library search input | Record the input value afterwards. Record only. |

## 6. C — perf, smoke, auth guard
- **RR-PERF:**
  - Run `npm run test:perf` **alone**, after §5 (L38). An overlapped run is environment-invalid and uses one replacement attempt.
  - **PASS:** rc 0, 3/3 specs, every budget row passes its contract, `complete` is true, 0 aborts and 0 page errors.
  - A failing budget on a valid isolated run is a finding: Medium for fader, drag or playback budgets, Low otherwise.
  - **Comparison (report only):**
    - The oracle is `c-round-285/perf/latest.json`, `latest-interactions.json` and `latest-resources.json` [K7] (gate 285, `60bfb38`). `perf/` last changed at `eded57a` (round 295) [K6].
    - For each file pair, run `python3 -I b-round-224/scripts/equiv-check-b2.py <oracle> <new>`, and list every deterministic row that differs.
    - B rules the deltas at the 301 → 302 planning. A delta alone is not a FAIL.
- **RG-SMOKE:** run `npm run test:e2e:smoke` in `store/` after RR-PERF, alone.
- **G301-AUTH:**
  - `/studio-lab` anonymous shows the workspace and the demo badge, and `auth_user` is null.
  - `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`.
  - `GET /api/studio-token?product=middle-east&file=mix.wav` with no header → **401**. With a fake Bearer → 403 when the mock runs, or 500 without it. **Never 200, and no token in any body.**
  - A bare `GET /api/studio-token` returns 400. Record it; it is not a finding (C-R300-INFO-03, D-29z776).
  - The SRW-21 purchased mount is BLOCKED (backend unavailable in cloud; `deferred_user`).
- **Blocked, as in round 258** (backend unavailable in cloud): R80-RECORDINGS-FIELD-BORDERS, F11–F13 `/account`, F16 `ChatInput`, the legacy ownership half, the BLOCKED-AUTH-203 consumers, and BACKEND-EVIDENCE-F7/F9. List them under `blocked`; they do not make `browserVerified` false.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome and `npm run verify`.

## 7. Outcome, fixed in advance (D-29z780)
| C result | B at the 301 → 302 planning |
|---|---|
| Every row PASS, smoke PASS | <ul><li>First, set `regression-last.json` = `{"date": <C's completion date>, "round": 301}`.</li><li>Round 302 = **NAME-AND-HINT** (the Q4 naming and the Q5 one-time hint).</li><li>RETRO stays at round 305.</li></ul> |
| Any Critical, High or Medium finding, including a regression | <ul><li>Round 302 = a bounded fix-up (≤ 3 related bugs, Critical first). C re-runs the failed rows.</li><li>`regression-last.json` is still updated when every row ran.</li><li>NAME-AND-HINT follows.</li></ul> |
| Low findings only | They go to `deferred_low_polish` (id, severity, evidence, repro). Otherwise the same as the all-PASS row. |
| Rows not run (time limit), or inconclusive past the budget | <ul><li>The missing rows continue first in round 302, from `progress.json`.</li><li>`regression-last.json` is not updated until every row has run.</li><li>An inconclusive row is never PASS.</li></ul> |
| A browser row that could run here did not run | `browserVerified=false`, and B re-plans that half. |

**Item status:** a failed row does not change its item's status by itself; it opens a finding linked to the item. The item leaves done only when B rules the finding a reproducible regression.

## 8. Neighbour risk
| Risk | Check |
|---|---|
| A probe or the mock writes into `store/` | SOURCE-SCOPE and `sha256sum -c`, at start and at end |
| Perf, smoke or the mock disturb the :5173 tabs | The serial order in §2; the mock is started and stopped by its own PID |
| The job time limit | Incremental reports and `progress.json`; §4c runs first |
| False FAILs from pre-262/265/269 scripts (master in the header, a background drag that deselects, linear envelope heights) | The §2 "Changed UI facts" and the §3 adaptations; record "lookup, not deviation" |
| Mock product data taken as backend evidence | R301-PRICE, R301-LINK and R301-JOURNEY prove the client path only |

## 9. Deliverables
- **A:** `a-round-301.md` (baseline only).
- **C:**
  - `c-round-301.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `observations`, `invalidRuns`, `lookups` and `carried`;
  - `c-round-301.md`;
  - evidence under `c-round-301/{tools,out,shots}`.
- **Every bug gets:** an id `C-R301-NN`, a severity, the item, the steps, the evidence path, and "regression yes/no" with the round of the last pass.

## 10. Root notes
- No source change is expected. Nothing is published when no source changed; the loop-state commit records the sweep.
- **Frontend-architect checkpoint request (non-blocking):** see `b-round-300.md` §6. STUDIO-LINK is complete, so the feature-boundary checkpoint is due now. NAME-AND-HINT does not wait for it.
