# C — Round 60 verification (SRW-14 stage 4b-2b, D-29z25)

Verifier: C (Claude Opus 5.5) · 2026-10-18 · Task: `current-task.md` (round 60) · A report: `a-round-60.md`
Evidence: `c-round-60/` (checkpoint.md, runs/, shots/, tools/, scripts/, mutations.txt, gates-meta.txt). No app edits, commits, pushes or server start/stop. Browser side effects: local demo state only, fresh contexts, no credentials.

## Verdict: **FAIL** (1 Low, acceptance row MN-CONTEXT edge half)

Everything A built is in scope and works. Offline gates, mutations, G60-3 and every regression pass. One §4.6 row fails:
- **MN-CONTEXT (edge half) fails.** A right-click on the menu's own padding or `<hr>` is prevented (no native menu, as intended). But the press moves focus out of the menu to `BODY`. After that the menu's keyboard is dead: Escape and the arrows do nothing, and the menu stays open until an outside press.
- The root cause **existed before round 60.** A **left** press on the same padding does exactly the same (`runs/edgediag-1440x900.txt`).
- Still, §0.2 ("same focus") and the MN-CONTEXT pass column ("focus inside … Escape closes it") are not met → **C-R60-01**.

## Servers and machine

| Check | Time (UTC) | 5173 | 5199 | node.exe |
|---|---|---|---|---|
| start | 13:47 | 200 | 200 | 12 |
| browser runs | 13:53–14:03 | up | up | 13–20 (gstack + PW) |
| gates | 14:04–14:08 | — | — | 12 |
| end | 14:09 | 200 | 200 | 12 |

## G60-2 — tree: **PASS**
- HEAD `038ed5a` at start and end (case A). `git status --short` has **29** lines at start and end, identical (`status-start.txt` = `status-end.txt`).
  - The owned files keep their codes: SW ` M`; menu, both tests `??`; `?? doc 053`.
- Frozen list 416, 0 non-OK (start and end). Protected 4/4 OK (start and end). Snapshots `SHA256SUMS.txt` 4/4 OK.
- Owned files equal A's hashes:
  - `StudioWorkspace` `0ea67202`, CRLF 1807/1807, 0 bare LF;
  - `ArrangementGridMenu` `baf32ff4`, LF 202;
  - menu test `12870d41`, LF 954;
  - keys test `89c40175`, LF 456;
  - doc 053 `4983c748`, LF 124.

## R60-S — static: **PASS**
- **`diff-sw.txt`** has only these changes:
  - `stepGridDivision` (deps `[changeGridDivision]`);
  - the window digit branch, with its guards in the same order (`modifier` return → `!alt && !shift` → `preventDefault` → `repeat` return), now calling it;
  - the select `onKeyDown`, with guards `exportOpenRef`, the code ∉ {Digit1, Digit2} return and Ctrl/Meta/Alt/Shift, then `preventDefault`, then a step only when `!repeat`;
  - the effect deps.

  `isTypingTarget` is unchanged (l.223–235; `HTMLSelectElement` → true), and the window handler returns early for it (l.1162–1168), so there is no double step. `current` in that effect is `workspaceRef.current` (l.1179), so `workspaceRef.current.setStatus` behaves the same.
- **`diff-menu.txt`** has only the root `onContextMenu` and the `keydown` (capture) and `blur` (non-capture) add/remove pairs in `armGridMenuDismissClickSwallow`.
- **AST** (`scripts/asteq-it.cjs`, `r60-s-asteq.txt`):
  - menu: 28/28 old `it` are identical, plus GM25–GM31;
  - keys: 11/12 identical, GK9 rewritten (old name missing, new GK9 added), GK11 appended;
  - negative control: one changed literal in a copy is detected (`changed: [GM8]`).
- **Test diffs:** the `afterEach` has `cleanup()` → `pointerDown(window)` → a click probe, before the old two lines. `cleanup` is imported. No other harness change.
- **Banned scan** (`r60-s-scan.txt`): 0 hits in the 3 LF files and in the SW added lines. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` timeout.
- **Doc 053** has every §2.5 section: date/status/project, context, approach (S/C/R, alternatives a/b and the Enter/Space option, the supersession sentence, the trade-off, the `rightClick()` note), changed files, problems, testing, Ableton, TODO.

## R60-U — unit and mutation: **PASS**
My own scratch (`c-round-60/scratch`, node_modules junction removed afterwards) and my own regexes (`scripts/cmut60.cjs`). Each run covers 87 tests (`grid-snap-keys`, `-menu`, `-ui`, `gesture-guard`). Each mutation matched exactly once, and the scratch was identical to `store/app` afterwards.

| # | Failing (must) | Killed |
|---|---|---|
| none | 0/87 | — |
| a | GK9, GK11 (GK9) | yes |
| b | GK9, GK11 (GK9) | yes |
| c | GK11 | yes |
| d | GK11 | yes |
| e | GK11 | yes |
| f | GK2, GK3, GK9 (GK2, GK9) | yes |
| g | GM25 | yes |
| h | GM26 | yes |
| i | GM27 | yes |
| j | GM28 | yes |
| k | GM29 | yes |
| l | 35 (whole menu file, incl. GM31) | yes |
| m | GM30 | yes |
| r58a | GM16 | yes |
| r58d | GM21 | yes |
| r59a | GK1, GK2, GK3, GK7, GK8 | yes |
| r59j | GM22 | yes |
| r59k | GM23 | yes |
| r59m | GM24 | yes |

**Extras** (info; all five survive, 0/87 failed):
- **n:** the `afterEach` window release removed.
- **p:** Numpad1 accepted. As built, Numpad1 would **widen**, because the ternary maps any non-Digit1 code to `'widen'`. Nothing tests Numpad, by design.
- **q:** `stopPropagation` added.
- **xblurcap:** `blur` registered with capture. This confirms A-R60-REVIEW-BLUR-CAPTURE-TEST: no test pins the non-capture `blur`.
- **xrepeat:** my build is flawed. The arrow wrapper is never removed, so it leaks; this run is not evidence. The browser probe below covers it.

**Alone durations:**
- `grid-snap-keys`: 13/13, 4.31 s (tests 1.44 s);
- `grid-snap-menu`: 35/35, 6.93 s (tests 3.65 s).
- No test is over 3 s. GK9 67 ms, GK11 192 ms, GM25–GM31 56–101 ms.

## G60-1 — gates: **PASS** (`gates-meta.txt`, node.exe 12 throughout, nothing in parallel)
- `tsc --noEmit` rc 0.
- **Biome `./app`:** 5 / 218 / 1. The 5 errors are exactly the baseline CRLF list (`biome-app-errors.txt`).
- **Owned files:** the 3 LF files have 0 diagnostics. `StudioWorkspace` lint 0.
- **SW stdin format:** identical to the LF copy. My first attempt passed the path at the wrong `argv` index; the corrected re-run was rc 0 and `cmp` identical.
- **Full vitest:** 89 files / **1552**, rc 0, 58.96 s.
- **Build:** rc 0.
- **`npm run verify`:** attempt 1, rc 0, 89 / 1552.
- `Test timed out`: 0 in both runs.

## G60-3 — anonymous workspace and purchase protection: **PASS** (`runs/g60-3.txt`)
Fresh gstack state `c-round-60/c-browse.json` (no restart; my daemon PID 39904, stopped by me).
- `/studio-lab` opened directly: `auth_user` null, cookie empty; workspace and the badge "დემო კოლექცია — ავტორიზაცია არ სჭირდება" are shown.
- Via the header link "Studio Lab Demo": workspace shown.
- REAL add + Space play/stop with `authhook`: 0 requests with an `Authorization` header.
- **Forbidden requests:**
  - direct, session and header-link runs: 0 matches for `studio-token`, `recording-`, `/api/download` or R2;
  - also 0 in every SEL, MN and probe run (`network-keys-*.txt` bad=0; every PW run `bad 0 withAuth 0`).
- **Media:** only the public `/middle-east.mp3` and `/videos/hero/hero-music.mp3`, as in round 59.
- **Hosts:** 5173, `:5199/api/cart` (known CORS error), GA, GTM and Google Fonts.
- Anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**. A fake Bearer → **403** (same as round 59).
- `/studio/middle-east` shows "Sign in required"; no workspace.

## §4.6 browser acceptance

Labels: **REAL** = gstack key/click; **REAL-mouse (PW)** = standalone Playwright, fresh context, no credentials.

| ID | Size | Result | Evidence |
|---|---|---|---|
| SEL-KEYS* | 1440 | **PASS** (REAL) | click select → Escape (focus stays on the select) → `1 2 1 1 1` = 0.5 → 1 → 0.5 → 0.25 → 0.1; status `ბადე: X წმ (Snap გამორთულია)` after each; focus stays on the select; never 10 s. `runs/keys-1440x900.txt` |
| SEL-KEYS* | 1280 | **PASS** (REAL) | same sequence and result. `runs/keys-1280x720.txt` |
| SEL-ENDS | 1440 | **PASS** (REAL) | at 0.1, `1` gives `ბადე უკვე ყველაზე მჭიდროა — 0.1 წმ (1)`, no change (`runs/keys-1440x900.txt`). In a fresh load: select → Escape → `2` ×3 = 2, 5, 10; the next `2` at 10 gives `ბადე უკვე ყველაზე ფართოა — 10 წმ (2)`, no change, focus stays on the select (`runs/sel-ends-wide-1440x900.txt`, shot `sel-ends-widest-1440x900.png`) |
| SEL-NATIVE | 1440 | **PASS** (REAL) | at 10, `5` → native type-ahead to `5 წმ` (status follows the native `change`); ArrowUp → 10; ArrowDown → 5 → 2 (one option each) |
| SEL-MOD | 1440 | **PASS with info** (REAL) | no CZABA step for Shift+1 or Alt+1. **Native:** gstack `Shift+1` type-aheads 1 → **10 s**; Alt+1 does nothing. PW probe `runs/shift1-probe-1440x900.txt`: `press("Shift+1")` sends `key: "1"` + `shiftKey` and jumps to 10 s; `press("Shift+Digit1")` sends `key: "!"` (what a real US layout produces) and nothing changes. Real-keyboard confirmation → INFO-R60-SHIFT1-SYNTH (Tech Lead R60-T) |
| SEL-SNAP | 1440 | **PASS** (REAL-mouse PW) | select click → Escape → `1` (the window-bubble keydown shows `prevented: true`) → blur → `g` (Snap on, 0.5) → drags of 1.6, 1.15 and 0.8 s: 0 → 1.500 → 2.500 → 3.500, all 0.5 multiples. `runs/pw60-1440x900-selsnap.txt` |
| MN-CONTEXT* | 1440 | **FAIL → C-R60-01** (REAL-mouse PW) | **item** right-click: `contextmenu` prevented, 1 menu, same rect `[812,356,956,599]`, focus moves to the `0.5 წმ` item (inside), division 1. **Edge** right-click (the hit is the menu root): prevented, 1 menu, same rect, division 1, but focus → `BODY`, and Escape leaves the menu open. `runs/pw60-1440x900-context.txt`, `runs/edgediag-1440x900.txt` |
| MN-CONTEXT* | 1280 | **FAIL → C-R60-01** | same: the item half passes; the edge half moves focus to BODY and Escape does not close. `runs/pw60-1280x720-context.txt` |
| MN-KEY-RELEASE | 1440 | **PASS (fallback method)** (REAL-mouse PW) | Export focused with `locator.focus()` → right-click lane → menu → `mouse.down` held on an empty SFX spot: the menu closes, but focus goes to `BODY`, **not** Export (INFO-R60-FOCUS-RETURN). Fallback: `locator.focus()` on Export while still held → Enter → **the export dialog opens** (the click was not swallowed). Escape. Final `mouse.up` → a click on the lane DIV with `prevented: false`: the release click is not swallowed, as the §0.3 trade-off says. `runs/pw60-1440x900-keyrelease.txt` |
| MN-BLUR-PROBE | 1440 | **PASS (PROBE, synthetic)** | held dismiss → `window.dispatchEvent(new Event('blur'))` → far `mouse.up` → REAL click on Snap: off → on on the first click. Not a real blur; not discriminating against the pointerup path. `runs/pw60-1440x900-blurprobe.txt` |
| MN-DISMISS-BUTTON* | 1440 / 1280 | **PASS** (REAL-mouse PW, clip added first) | Snap: the menu closes, Snap stays off, and the next click turns it on. Play: the menu closes, nothing plays; the next click plays (0.510 → 1.131, meter −9.2 dB; at 1280, 0.731 → 1.350, −13.0 dB). Export: the menu closes, no dialog; the next click opens the dialog. `runs/pw60-*-addfirst_dismiss.txt` |
| MN-KEYS | 1440 | **PASS** (REAL-mouse PW + keys) | ArrowDown+Enter chooses (1 → 0.5; the item order goes down) and closes. Reopen, ArrowDown, Escape → unchanged. Reopen, ArrowUp, Space → chooses 1, `▶ Play` stays (no playback). `runs/pw60-1440x900-menukeys.txt` |
| KEY-NARROW | 1440 | **PASS** (REAL) | body focus, `1` ×3: 10 → 5 → 2 → 1 (the select follows) |
| KEY-TYPE | 1440 | **PASS** (REAL) | `1` in the library search → value `1`; grid unchanged |
| MN-FOLLOW | 1440 | **PASS** (REAL-mouse PW) | Follow on, 97.7 px/s, play; menu opened at 1.51 s. 34 samples over 9 s: the menu stayed open; 1 page flip (scrollLeft 0 → 590); meter non-inf in 34/34; position 1.531 → 10.491. A horizontal wheel closes the menu (Follow → paused). `runs/pw60-1440x900-follow.txt` |
| VSCROLL-PROBE | 1280 | **evidence** (REAL-mouse PW) | 4 height separators × ArrowDown ×40 → 180 px each → `scrollHeight − clientHeight = 382`. Follow on, playing; menu opened on the stems lane. Vertical wheel over the lanes, away from the menu: `scrollTop` 282 → 382, **1 `scroll` event**, **the menu stays open** (one menu, same rect, focus inside), Follow `on`, still playing. **This confirms ROOT-R50-58-L1.** `runs/pw60-1280x720-vscroll.txt` |
| Reviewer #1 repeat probe (extra) | 1440 | **evidence → C-R60-02** (REAL-mouse PW) | control (Shift down → press on Snap → up, no repeat): **swallowed** (Snap stays off). With a second `keyboard.down('Shift')` while held (`repeat: true` is seen): **not swallowed**, and Snap toggles on in the same press that dismissed the menu. `runs/pw60-1440x900-repeat.txt` |

*SEL-ENDS note:* the widest end was measured in a short second gstack run (my first run reached 10 without an extra press).

**Screenshots:** `c-round-60/shots/` (sel-keys-1280x720, sel-ends-narrow/wide-1440x900, key-narrow-1440x900; plus anon-direct/header/studio-me from G60-3).

## §4.7 carried
- **EG-GROUP (C-R59-03), read-only: PASS** against the corrected criterion. In `c-round-59/runs/r59e-1440x900-g3_g4.txt` l.4–5 the selection is 2. The anchor SI 4 → **10** (a grid line), music 7 → 13 with deltas 6 and 6, and the status says "2 კლიპი გადავიდა 00:06.000-ით". Music lands on 13, not a grid line, so there is no edge capture. No re-run.
- **SEL-AFTER-MOUSE:** not testable headless → R60-T.

## Not run / not testable (honest)
- **Not testable headless, never PASS (→ R60-T):** keys with the native select popup **open**; a real Alt-Tab during a held press; Ctrl/Cmd+digit; SEL-AFTER-MOUSE; real-layout Shift+1 (INFO-R60-SHIFT1-SYNTH).
- **Not run this round by the task (§4.9):**
  - video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
  - the full find → add → fit video → export flow with WAV data/duration/sample checks;
  - the FB-01..FB-16 regression;
  - `test:e2e:smoke` (root);
  - the full stage-4a/4b re-run.
  - **The product flow (find → add → fit video → export) is therefore not verified this round.** It has no PASS here.

## Ableton table (two verdicts per row)
Source re-used: Live 12 Reference Manual §6.10 (B capture `b-round-46/ableton-6.7-6.10-20261016.txt`). No video and no Live installation.

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| Narrow/widen keys where the grid control has focus | **PASS** (GK9, GK11, SEL-KEYS ×2) | **Not applicable / partly confirmed:** §6.10 confirms Ctrl+1/2; Live has no division select. CZABA's plain `1`/`2` is a CZABA decision |
| Grid width offered in the track context menu | **PASS** (regression: MN-KEYS, MN-DISMISS-BUTTON, MN-FOLLOW) | **Confirmed** by §6.10 (round-57 row) |
| Right-click on an open context menu | **FAIL** (C-R60-01, edge half; the native menu suppression itself passes) | **Unconfirmed** (no source) |
| A dismissed menu's click after a key or a window blur | **PASS** for the rule as written (GM26–GM29, MN-KEY-RELEASE fallback, MN-BLUR-PROBE). The repeat edge is C-R60-02 | **Unconfirmed** (no source) |
| Multi-clip move: the anchor snaps to the grid | **PASS** (EG-GROUP read-only) | **Unconfirmed** (no source for Live's multi-clip anchor) |

## Bugs and info for B

**C-R60-01 (Low) — a press on the open grid menu's non-item area moves focus out of the menu; then Escape/arrows are dead and the menu stays open.**
- **Steps** (PW, 1440×900 or 1280×720, fresh `/studio-lab`):
  1. Right-click the music lane at x+300 → the menu opens, focus on `✓1 წმ`.
  2. Right-click (or left-click) at the menu's left padding (menu `left+2`, vertical middle) or on its `<hr>`.
  3. Press ArrowDown, then Escape.
- **Expected** (§0.2, MN-CONTEXT): no native menu; focus stays inside the menu; Escape closes it.
- **Actual:**
  - `contextmenu` is prevented (OK);
  - `document.activeElement` becomes `BODY`;
  - ArrowDown does nothing; Escape does nothing; the menu stays open until an outside press.
- **Cause (read-only):**
  - the menu root and the `<hr>` are not focusable, so Chrome's mousedown default moves focus to body;
  - `handleGridMenuKeyDown` is on the menu root, and the window handler does not close the menu.
  - A left press reproduces it, so it **existed before round 60** (round-57 menu). Round 60's MN-CONTEXT criterion exposes it.
- **Suggested direction (B decides):** `onPointerDown`/`onMouseDown` `preventDefault` on the menu root when the target is not an item; or `tabIndex={-1}` on the root plus a refocus of the active item.
- **Evidence:** `runs/edgediag-1440x900.txt`, `runs/pw60-1440x900-context.txt`, `runs/pw60-1280x720-context.txt`.
- **Test gap:** GM25 asserts "focus is still inside the menu" and passes, but `fireEvent.contextMenu` has no preceding mousedown, so jsdom never moves focus. **GM25 cannot catch C-R60-01.** This is the same class as reviewer #3 on GK9. A fix needs a test that dispatches the press default (or asserts the root `mousedown` is prevented) on a non-item target.

**C-R60-02 (Low; confirms A-R60-REVIEW-REPEAT-RELEASE) — an auto-repeat `keydown` of a held modifier releases the armed swallow.**
- **Steps:**
  1. Open the menu.
  2. `keyboard.down('Shift')`.
  3. `mouse.down` on Snap.
  4. `keyboard.down('Shift')` again (`repeat: true`, as an OS auto-repeat sends while Shift is held).
  5. `mouse.up`; `keyboard.up('Shift')`.
- **Expected** (round-58 intent): the dismissing click is swallowed.
- **Actual:** Snap toggles on the dismissing press. The control without a repeat is swallowed.
- **Assessment:** this conforms to the written D-29z25-R ("any key"), so it is **not** what fails this round. My PW run proves the mechanism: one `repeat: true` keydown between the press and the click releases the swallow. The OS timing ("a Shift/Ctrl held for more than about 0.5 s before a click") is A's reviewer's statement. I did not measure it; real-keyboard confirmation → R60-T.
- **One-line fix (A):** ignore `event.repeat` in the keydown release. GM26 stays valid.
- **Evidence:** `runs/pw60-1440x900-repeat.txt`.

**Info:**
- **INFO-R60-FOCUS-RETURN:**
  - What happens: with a mouse-opened menu, the right `mousedown` on the lane blurs the previously focused Export before `contextmenu` records the return target. `gridMenuReturnFocusRef` therefore holds `BODY`, and focus is not restored after a dismiss.
  - Effect: the MN-KEY-RELEASE premise ("focus returns to Export") does not hold for mouse-opened menus; the run used the `locator.focus()` fallback.
  - **Reconciled with round 59:** R57-FOCUS (round 59, `c-round-59/runs/pw59c-1440x900-focus.txt`) tested a different scenario: the brace releasing focus on a timeline press (C-R51-02). The round-57 contract M10 (`tasks/round-57.md` l.161, l.179) says the menu restores focus only if the return target is not `document.body`. A lane is not focusable, so Chrome's right `mousedown` default moves focus to body before `contextmenu`. The observed behaviour is therefore **the documented design, not a regression** (the round-60 diff does not touch focus). Only the round-60 task premise for MN-KEY-RELEASE was wrong.
- **INFO-R60-SHIFT1-SYNTH:** with a synthetic `key: "1"` + Shift on the focused select, native type-ahead jumps to 10 s. A layout-faithful `Shift+Digit1` (`key: "!"`) does nothing (measured, `runs/shift1-probe-1440x900.txt`) → R60-T for a real keyboard.
- **C-R59-01: closed.** SEL-KEYS at 1440 and 1280 (REAL): `1`/`2` on the focused select step the grid, with no jump to 10 s. The window-bubble keydown shows `prevented: true` (SEL-SNAP log). The popup-open and mouse-choice variants stay R60-T (SEL-AFTER-MOUSE).
- **VSCROLL-PROBE:** L1 is confirmed. With vertical overflow of 382 px, a vertical wheel during Follow playback scrolls the lanes by 100 px and fires `scroll`, and the menu stays open over a lane that moved. This is ready for B to schedule.
- **A-R60-REVIEW-BLUR-CAPTURE-TEST:** confirmed by `xblurcap` surviving.
- A-R60-REVIEW-GK11-EXPORT-STATUS: GK11's export step at 0.1 can only be killed by the return value. Confirmed by reading the test.

## Root inputs (re-checked mtimes; content as listed by B §4.9)
- **`root-pre-push-review.md`** (12:46:34, unchanged):
  - **Open:** RF3-1, RF3-2 and R5-L6 (video sync, C-R27-01).
  - **Partially measured:** R5-L3.
  - **Unit-only:** R5-L5, R5-E1, R6-S2, R6-S3.
  - **Medium:** M1 (the rAF-only loop refill goes silent in a hidden tab); M2 (the per-frame `position` in the context value re-renders every consumer).
  - **Lows:** L1–L4, L6–L8.
- **`root-review-r50-58.md`** (12:46:26):
  - L1 is **now confirmed in the browser** (VSCROLL-PROBE);
  - L2, L3 and L4 are implemented this round (L3 has the C-R60-01 focus caveat; L2 has the C-R60-02 repeat caveat);
  - L5 / `useArrangementGridMenu` is architecture, open.
- **`publication-checkpoint.json`** (2026-10-17 11:11:24, unchanged):
  - SRW-21: the `middle-east` loader is hardcoded;
  - portable instruction paths;
  - the SRW-23 scrollbar check at 1280/1440;
  - SRW-11/12 library/stems parity;
  - T12.

## Commit readiness (for root)
- **Rounds 50–58 (`cb12805` bundle): ready** as an interim checkpoint. Round-59 C evidence still applies, and this round's regressions passed again (MN-DISMISS-BUTTON ×2, MN-FOLLOW, MN-KEYS, G60-3).
- **Round 59: ready** as its own interim unit. KEY-NARROW and KEY-TYPE were re-run and pass. The round-59 GK9 contract is superseded by round 60 as designed.
- **Round 60: not a clean PASS.**
  - **For:** the source and tests are in scope; all gates pass; the mutations are killed; nothing measured regressed.
  - **Against:** MN-CONTEXT fails on its focus/Escape clause (C-R60-01, an older defect), and C-R60-02 is a known gap in the new release rule.
  - **Recommendation:** hold the round-60 commit until B rules on C-R60-01 and C-R60-02. Either fix them in round 61 first, or accept them explicitly and commit as an interim checkpoint.
