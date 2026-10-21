# C — Round 61 verification (SRW-14 grid-menu fix-up, D-29z26)

Verifier: C · started 2026-10-18 ~19:00 +04, interrupted by a machine restart, resumed and finished 2026-10-19 10:20–10:50 +04.
**Verdict: PASS** — every §4.6 row ran and passed at 1440×900 and 1280×720. No bugs. Info items are listed below.
Evidence: `c-round-61/` (checkpoint.md, mutations*.txt, runs/, gates/, tools/pw61.cjs, shots/).

## Environment and resume
- The previous C session ended mid-R61-U when the machine restarted. Before continuing I checked that nothing was mutated. HEAD `038ed5a`, `git status` 30 lines (case A + `?? doc 054`). Frozen list 418/418 OK, protected 4/4 OK. The owned files `96779a7d` / `49ce77b0` / `839847b9` / doc `852bdbd5` equal A's report. The 3 scratch files equal the store files.
- Servers. Start (10:2x): `:5173/studio-lab` 200, `:5199/api/products` **000**. Mid-run (10:31): 200 / 000. End (10:45): 200 / 000. The backend was down for this whole session, after the restart; agents do not start servers. On 2026-10-18 (15:00 and 19:04) both servers were up.
- **Deviation (C):** I ran §4.6 even though the backend was down. Reason: `/studio-lab` makes no backend request except the root-allowed `GET /api/cart`; the network logs show this, and the same holds in round 60. Every browser row below ran with **backend :5199 down**. B can discount this if needed.
- `node.exe`: 16–20. The extra processes are the user's own Codex/therapy-notes MCP processes, which I did not touch. The Vite dev server is PID 17396.

## G61-2 — tree: PASS
HEAD stayed the same from start to end. Status is 30 lines, which matches §3.1 case A. Owned files keep their start codes. Frozen list 418 OK and protected 4/4 OK, at both start and end.

## R61-S — static: PASS
Done in the first C session (`c-round-61/r61-s-static.txt`, `r61-s-scan.txt`); I re-confirmed the diffs at the end.
- **`ArrangementGridMenu`:**
  - The diff contains only the root `onMouseDown` (prevented only when the target is not inside a `button`) and the named `releaseOnFreshKey(event: WindowEventMap['keydown'])` wrapper.
  - `releaseOnFreshKey` is the identifier in both `addEventListener('keydown', …, true)` (l.60) and `removeEventListener('keydown', …, true)` (l.38). There are 0 inline keydown arrows.
  - `blur` is registered and removed non-capture.
- **`StudioWorkspace`:** +5 lines (the `openScrollTop` record plus the early close). `handleTimelineScroll` is unchanged. Line endings: CRLF 1812/1812, 0 bare LF.
- **`grid-snap-menu` test:** 35 old `it` are AST-identical, with GM32–GM35 added. The negative control detects a GM8 edit.
- **Banned patterns:** 0 hits on added lines. No `.skip`/`.only`/timeouts.
- **Doc 054:** all §2.5 sections are present, including the supersession sentence and the Ableton table. Ableton rows 2–4 are 3/3 „დაუდასტურებელი (წყარო არ არის)“, and line 103 says explicitly that „Ableton იგივეს აკეთებს“ is not claimed.

## R61-U — mutations, in C's own scratch with C's own strings: PASS
Source: `c-round-61/mutations.txt` (first session: none, a, b, c) and `mutations2.txt` (full re-run 10:24–10:31). Restored after each mutation: yes.

| # | Mutation | Failing | Needed | Result |
|---|---|---|---|---|
| none | — | 0/91 | — | ok |
| a | root onMouseDown removed | GM32 | GM32 | killed |
| b | prevent for every target | GM32 | GM32 | killed |
| c | repeat guard removed | GM33 | GM33 | killed |
| d | scrollTop check removed | GM34 | GM34 | killed |
| e | compare to 0 | GM34 | GM34 | killed |
| f | blur capture true (add+remove) | GM35 | GM35 | killed |
| g | onContextMenu removed | GM25 | GM25 | killed |
| h | keydown add removed | GM26, GM33 | GM26 | killed |
| i | blur add removed | GM27 | GM27 | killed |
| r58a | swallow arm removed | GM16, GM33, GM35 | GM16 | killed |
| r58d | close on any scroll | GM21, GM34 | GM21 | killed |
| r59k | release preventDefault | GM23 | GM23 | killed |
| n (info) | 2 px tolerance | — | survive | survives (expected) |
| p (info) | only button 0 prevented | GM32 | GM32 | killed |
| q (info) | wrapper ignores Shift | GM26, GM33 | GM33 | killed |
| xleak (C extra) | keydown remove dropped | — | — | **survives**: only the static check covers it |
| xspan (C extra) | `instanceof HTMLButtonElement` | — | — | **survives** in jsdom; covered in the browser (MN-ITEM-PRESS on the SPAN) |

- The first `q` attempt did not apply because the pattern matched twice; the second match is the pre-existing Enter/Space `repeat` guard. The pattern is now anchored on the wrapper body and applies once.
- `grid-snap-menu` alone: 39 passed, 13.6 s. GM32 146 ms, GM33 220 ms, GM34 132 ms, GM35 101 ms. No test took over 3 s.

## G61-1 — gates: PASS
Output in `c-round-61/gates/`.
- tsc: 0.
- Full vitest: **89 files / 1556 passed**, 0 `Test timed out`. `node.exe` 16.
- Build: rc 0.
- Biome `./app`: **5 errors / 218 warnings / 1 info**. The errors are the baseline CRLF `format` list: StudioWorkspace, auth-bugs.test, grid.test, render-budget.test, auth.ts.
- Owned files: 0 diagnostics. StudioWorkspace: `lint` 0, and the stdin format output equals the LF copy.
- **`npm run verify`: rc 0 on the first quiet attempt** (10:44:57).

## G61-3 — anonymous workspace and purchase protection: PASS
Two runs: first session 2026-10-18 19:04 (both servers up); re-run 2026-10-19 10:36, fresh gstack state `c-browse-2.json`, backend down. The header line of `runs/r2-g61-3.txt` still says `c-browse.json`; that text was copied from the old script and is stale. The real `BROWSE_STATE_FILE` was `c-browse-2.json` (see `b2.sh`).
- **Opening `/studio-lab`:** directly and via the header link (`Studio LabDemo`), the workspace renders with the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. `auth_user` null, no cookies.
- **Studio session:** a REAL add and REAL Space play/stop made 0 hooked auth/token requests.
- **Network:** 0 requests to studio-token / recording / download / R2 in the direct, session and header runs, and in every PW §4.6 run (`NET … bad 0 withAuth 0`).
- **`/studio/middle-east`:** shows "Sign in required"; no workspace.
- **Anonymous `/api/studio-token?product=middle-east&file=mix.mp3`:** 401.
- **Fake Bearer:** 403 on 10-18 with the backend up; **500 `Unable to prepare Studio access`** on 10-19 with the backend down. Access is still refused (fail-closed). → INFO-R61-FAKEBEARER-500.

## §4.6 browser acceptance
REAL-mouse (PW) = standalone Playwright, installed Chromium, fresh context, no credentials (`tools/pw61.cjs`, logs `runs/pw61-<vp>-<scenario>.txt`). SEL-KEYS used gstack REAL.

| ID | 1440×900 | 1280×720 | Evidence |
|---|---|---|---|
| MN-EDGE-FOCUS* | **PASS** | **PASS** | 5 cases each: left / right / **middle** press on the left padding (`DIV#arrangement-grid-menu`), and left / right on the `<hr>`. After each press: active element still `✓1 წმ`, 1 menu, same rect. ArrowDown → `0.5 წმ`. Escape closes. Division stays 1. Right presses: exactly 1 `contextmenu`, `defaultPrevented: true` |
| MN-CONTEXT* | **PASS** | **PASS** | Right-click on item, then on edge: 2 `contextmenu`, both prevented. 1 menu, same rect, `inMenu` true/true (round 60 had `false` on the edge, now fixed). Division 1/1/1. Escape closes |
| MN-ITEM-PRESS | **PASS** | — | Clicked the item's inner **SPAN** (hit-test `BUTTON text=0.5 წმ`): division 1 → 0.5, menu closed |
| MN-REPEAT | **PASS** | **PASS** | With the repeat, the page saw `{key:Shift, repeat:true}`. Dismiss is swallowed (Snap stays off), and the next plain click turns Snap on. Control (no repeat) is also swallowed, and the next click turns it on. Info: the bubble-phase recorder did not see the control's first Shift press, made while the menu was open, so "page saw it" is asserted only for the repeat keydown. The swallow listens in the capture phase on window, so this does not affect the mechanism |
| MN-KEY-RELEASE | **PASS** | — | Written method: Export focused with `locator.focus()` while the press is held → Enter opens the export dialog. Info: held focus = BODY; after Escape and `mouse.up`, `clicks` +1 with no visible action |
| VSCROLL-CLOSE* | **PASS** | **PASS** | 1440: overflow 272, menu still open 400 ms after opening; wheel → scrollTop 162 → 272, 1 `scroll`, **menu closed**, Follow `on`, playing (0.891 → 1.790 s), scrollLeft 0. 1280: overflow 382; the wheel point hit `arrangement-track-height` (a lane separator inside the scroller, outside the menu); 275 → 382, 1 scroll, closed, Follow `on`, playing, scrollLeft 0 |
| MN-FOLLOW | **PASS** | — | Menu open through 34 samples and 1 page flip (scrollLeft 0 → 590). Meter non-inf throughout. A horizontal wheel then closes it (Follow paused, as designed) |
| MN-FOLLOW in the overflow layout (C extra, the neighbour risk of rule V) | **PASS** | **PASS** | Lanes enlarged, zoom 97.7 px/s, play from 0, menu opened before the flip. scrollTop stayed constant (171 / 277) through the flip (0 → 590 / 0 → 482), and the menu stayed open in all 35 / 33 samples. Rule V does not close it on a Follow flip |
| MN-DISMISS-BUTTON* | **PASS** | **PASS** | `addfirst,dismiss`: Snap / Play / Export each do nothing on the dismissing click; the next click works. The Play run without a clip (`dismiss` alone) was not discriminating and is not counted |
| MN-KEYS | **PASS** | — | ArrowDown+Enter → 0.5 and closes. ArrowDown+Escape → no change. ArrowUp+Space → 1, closed, **not playing** |
| SEL-KEYS | **PASS** | **PASS** | Select click → Escape → 1 2 1 1 1 gives 0.5, 1, 0.5, 0.25, 0.1. Focus stays on SELECT, no 10 s jump. The first 1440 attempt was invalidated by a gstack daemon self-restart (page went to `about:blank`); the 1 retry passed |

## Ableton (two verdicts each)
Source re-used: Live 12 Reference Manual §6.10 (B capture `b-round-46/ableton-6.7-6.10-20261016.txt`). No new capture, no video, no Live installation.

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| Grid width offered in the track context menu | PASS (MN-KEYS, MN-ITEM-PRESS) | Confirmed (§6.10, round-57 row) |
| Press on an open menu's non-item area | PASS (GM32, MN-EDGE-FOCUS) | **Unconfirmed** (no source) |
| Held modifier while dismissing a menu | PASS (GM33, MN-REPEAT) | **Unconfirmed** (no source) |
| Vertical scroll with an open context menu | PASS (GM34, VSCROLL-CLOSE, MN-FOLLOW) | **Unconfirmed** (no source) |

No claim that "Ableton does the same" is made for rows 2–4.

## Not run, or not testable (honest)
- **Not testable headless → Tech Lead R61-T:**
  - real OS auto-repeat timing (PW sends one `repeat:true`; this proves the mechanism, not the timing);
  - a real Alt-Tab during a held press;
  - the native select popup with keys;
  - Ctrl/Cmd+digit;
  - a real-keyboard Shift+1 (INFO-R60-SHIFT1-SYNTH).
- **Out of round-61 scope (§4.9):**
  - video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
  - the full find → add → fit video → export flow with WAV data, duration and sample checks;
  - the FB-01..FB-16 stage regression;
  - `test:e2e:smoke` (root's).
  - None of these is claimed as passed.

## Info for B (no new bugs)
- **INFO-R61-XSPAN:** the `closest('button')` → `instanceof HTMLButtonElement` mutation survives unit tests. Optional: a GM32-style `mouseDown` on the item's inner `<span>`. Batch with the Lows.
- **INFO-R61-XLEAK (= A-R61-REVIEW-LEAK-STATIC-ONLY):** a leaked keydown remove is caught only by the static check. Keep that check as a C gate.
- **INFO-R61-FAKEBEARER-500:** when the backend is unreachable, a fake Bearer gets 500 instead of 403. It is still fail-closed. Root/B decide whether 503/403 is preferable; protected files are frozen.
- **A's items:** A-R61-REVIEW-CLOSEST-SCOPE (info) and A-R61-ARCH-FOLLOW-AUTOSCROLL-DUP (architecture) go to B/root as A recorded them.
- **Own processes:** after `b2.sh stop` (it printed "Unable to connect"), `c-browse-2.json` is gone. `tasklist | grep -iE "bun|browse|chrom|headless"` returns 0 lines; each Playwright run closed its own browser. `node.exe` 19, all of them the user's processes or the dev server.
- **ENV:** backend :5199 down after the machine restart (root should restart it before the next round). gstack daemon self-restart (ENV-BROWSE-DAEMON). The stale `c-round-61/c-browse.json.lock` from the crashed session was left as is (my own folder).

## Carried follow-ups (unchanged; from root-pre-push-review.md, publication-checkpoint.json, task §4.9)
- **Video sync:**
  - RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
  - R5-L3 is partially measured.
  - R5-L5, R5-E1, R6-S2 and R6-S3 are unit-tested only.
- **Medium:**
  - M1: loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value re-renders every consumer.
- **Lows:** L1–L4 and L6–L8.
- **`root-review-r50-58.md`:** L1 is now C-verified fixed (VSCROLL-CLOSE); L5 is the architecture item.
- **publication-checkpoint:**
  - SRW-21: the purchased loader hardcodes `middle-east`.
  - Portable instruction paths.
  - The SRW-23 scrollbar check at 1280×720 and 1440×900.
  - SRW-11/12 library and stems parity.
  - T12 continuation.
- **Open C items for round 62 (4c):** C-R51-01, C-R52-T1, INFO-R55-FREE-ROUND-UNGUARDED, A-R55-REVIEW-SHIFT-MIDDRAG-TEST. Also C-R41-01 (TL-Q-VIEWPORT), and the Tech Lead items C-R27-01, C-R6-02, C-R8-01, C-R23-01 and C-R38-01.
- **Closed by this round's evidence:** C-R60-01, C-R60-02, ROOT-R50-58-L1, A-R60-REVIEW-BLUR-CAPTURE-TEST.

## Commit readiness (for root; interim checkpoints, not a release)
- **Round 61:** ready. C PASS; the change is limited to the 3 owned files plus doc 054.
- **Round 60:** ready. Its Lows C-R60-01/02 are verified fixed by round 61.
- **Round 59:** ready.
- **Rounds 50–58 (`cb12805` bundle):** ready. Its regressions were re-run green again in this round.
