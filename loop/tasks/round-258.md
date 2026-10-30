# CURRENT TASK — Round 258: REGRESSION round (phase 1 + T12 V1 + everything done since round 199). C-only browser sweep; A changes nothing

Dispatcher: B · Implementer: A (no change, baseline report only) · Verifier: C · Planned 2026-10-30 from 00:10 UTC (`date -u`) · Decisions: **D-29z499 … D-29z506** (`backlog.json` → `decisions_log_b`, `rounds[258]`, `regression_rounds[2]`).

**Read first:**
- `lessons.md` in full. These apply directly:
  - L6: every scope addition is a named row.
  - L29: every recipe below was run by B, or is cited from the C round that ran it.
  - L38: perf runs alone.
  - L48: the playback-start lead; wait for `Demo collection ready`.
  - L25: the file chooser.
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md` (speed rules, "Regression round every 3 days", the 2026-10-23 bug gate and the cloud-runner section). They take precedence over older text.
- **The template:** `tasks/round-199.md` §2–§10 and `c-round-199.md` (91 rows, PASS). **This task reuses round 199's row text by reference** and lists only what changed since then. Where this task and round 199 differ, this task wins.
- **The previous task** is `tasks/round-257.md`, an exact copy of the round-257 `current-task.md` (`cmp` OK). B's reasoning is in `b-round-257.md`.

## Baseline: HEAD `d732d26`, clean tree
- `gates/gate-round-257.json` is `published`: commit `d732d2623fc16032153aa262c3e7d41fca4ed59a`, on both remotes (rounds 256 + 257).
- At planning, `git rev-parse HEAD` = `d732d2623fc1…` and `git status --short --untracked-files=all` is empty.
- The 7 protected files are unchanged at HEAD:
  - `app/routes/studio.$productId.tsx`
  - `app/routes/api.studio-token.ts`
  - `app/routes/account.downloads.tsx`
  - `app/lib/__tests__/download-routes.test.ts`
  - `app/lib/auth.ts`
  - `app/contexts/AuthContext.tsx`
  - `app/entry.server.tsx`

## 0. Why this round (D-29z499)
- **Round 257 passed and is published.**
  - C round 257: PASS, `browserVerified=true`, `realVerified=true`, 0 bugs. It closes C-R256-01 and C-R256-02.
  - Gate 257 published `d732d26`.
  - SABA-B-9 stage 1 is **done**.
- **The regression is due.** `regression-last.json` = 2026-10-27 (round 199), and today is 2026-10-30, 3 days later. The speed rule makes the next round a REGRESSION round instead of new scope. Round 257 §7 fixed this in advance (D-29z497).
- **Nothing outranks it.**
  - No Critical, High or Medium finding is open with a cloud reproduction:
    - SABA-B-7 is `awaiting_user`;
    - A-R73-SAFARI-FLAG-FOCUS and GATE232-S2 are Tech Lead manual checks;
    - R80-RECORDINGS-FIELD-BORDERS is backend-blocked.
  - **The gate-257 reviewer's Suggestion 1** ("Medium: on narrow windows the toolbar's groups overlap") was reproduced by B in Chromium (`b-round-257/probe/narrow2.json`, `narrow-768.png`):
    - the overlap starts at **864 px** (Delete × Zoom, 1 px) and reaches 48 px at 768;
    - at 870, 900, 960, 1024, 1100 and 1280 there is no overlap.
  - **B rules it Low (D-29z500).** The overlap appears only below the project's own desktop floor:
    - `MobileBlocker` shows "Studio is Desktop-Only" below 1024 px (`app/components/ui/MobileWarning.tsx` l.103), but only on the purchased route `studio.$productId.tsx` (l.301), and it offers "continue anyway". **`/studio-lab` has no blocker at all**, so the 1024 px floor is the project's stated intent, not a guard on the lab;
    - the two required viewports are 1280×720 and 1440×900;
    - TL-Q-VIEWPORT (are widths below 1280 in scope?) is still open;
    - the precedent is C-R41-01 at 1024×768 (Low, TL-Q-VIEWPORT).
  - **Where it goes:**
    - recorded as **GATE257-NARROW-TOOLBAR-OVERLAP** (Low, regression since round 256, `deferred_low_polish`);
    - added to TL-Q-VIEWPORT and SABA-Q-9-TRANSPORT;
    - flagged as a cheap candidate for SABA-B-9 stage 2, if that round grants `ArrangementTransport.tsx`.
  - C records it once as observation RP-NARROW (§5), so C's own evidence exists too.
- **A changes nothing.** A regression round checks the published HEAD, so A writes a baseline-only report (§1).
- A Critical, High or Medium finding becomes round 259, a bounded fix-up (§7).

## 1. A — no code or doc change
- **Baseline check, from `store/`:**
  - `git rev-parse HEAD` must be `d732d26…`;
  - `git status --short --untracked-files=all` must be empty.
- **If either differs:** write "STOP — baseline differs" at the top of `a-round-258.md` with the output, and change nothing.
- **Do not edit any file in `store/`.** Run no vitest, typecheck, lint or code-reviewer, because there is no change.
- **Report:** write `a-round-258.md` with:
  - the start HEAD;
  - the status output;
  - "no change by design (REGRESSION round, D-29z499)".
- **Forbidden:**
  - everything in `global_forbidden_files` and `global_forbidden_actions`;
  - the 7 protected files;
  - commit, push, stash, checkout and deploy;
  - dev-server restarts.

## 2. C — scope, method and budget
**Round 199 §2 applies unchanged, with these changes:**
- **SOURCE-SCOPE**, at the start and at the end:
  - HEAD = `d732d26`;
  - `git status --short --untracked-files=all` is empty;
  - the protected files are unchanged: `git diff --quiet HEAD -- <7 files>` gives rc 0.

  A change by anyone is a SCOPE FAIL. Report who made it, if you can tell.
- **Tooling base:**
  - Use the newest per-round scripts:
    - post-199 rows: the script of the round that the row cites (`c-round-N/*.cjs`, see §4b);
    - phase-1 rows: `c-round-199/tools/` (`lib.cjs`, `rows1..10.cjs`, `rich.cjs`, `rk-lib.cjs`).
  - Adapt them only for the intended changes listed in §3 ("adapted for round N"). Record each fix as **"lookup, not deviation"**.
  - Copy what you use into `c-round-258/tools/`, and say which scripts you adapted.
- **Changed UI facts since round 199.** B checked all of these at `d732d26` (`b-round-257/probe/recipes2.json`) unless another source is cited.
  - **Transport:**
    - separate **Play** and **Stop** buttons, and no `Pause` button;
    - Play's `data-playing` is `true` while playing;
    - Play and Stop share the description `Playing`/`Stopped` (C round 257).
  - **Space and Home:**
    - Space plays from the insert marker (`[data-insert-marker]`);
    - a second Space stops, and Space again restarts at the marker;
    - **Shift+Space** continues from the stop point;
    - **Home** sends the marker and the playhead to 0.
  - **Seconds ruler, while stopped:** a click sets the insert marker and the playhead to the click time, with no playback. B's probe: a click at 2 s gives `m = 2.000`, `ph = 2`, not playing.
  - **Playhead handle, while stopped:** dragging it from 0 to 6 s gives `m = 6.000` and `ph = 6`.
  - **A fresh `/studio-lab`:**
    - 0 clips and an empty BPM field;
    - Snap **off**, and an adaptive grid labelled `1 s` at 40 px/s;
    - the status `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.`
  - **Library Enter** adds the selected row to the active track at the insert marker. The status is `“<title>” added to the <Track> track at 00:00.000.`
  - **Space on an empty project** writes `Nothing to play — add a clip from the library first.` and does not play.
  - **MP3 export** runs through `mediabunny` (PERF-16). There is no ffmpeg CDN path any more, so an MP3 encode failure is a finding, not "inconclusive (environment)".
  - **CALM:**
    - no permanent shortcut line;
    - `?` and the footer `Shortcuts ?` open the sheet;
    - the BPM, Loop and dock texts moved into titles.
- **The ledger rule for RV-EN** (OBS-R199-LEDGER ruled, D-29z501):
  - The demo sound titles in `app/data/studio-lab-demo.ts` (`საჯარო preview`, `ღამის პულსი` and the stem names) are an allowed ledger. They are excluded from RV-EN, together with user-typed text.
  - Every other Georgian character in visible text or an accessible name is a hit.
- **Store rows** need the mock API:
  - Start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199 if it is not running. It was not running at planning (`curl` returned code 000).
  - Stop only the PID you started.
- **Order.** After a time-limit stop, resume from `c-round-258/progress.json`.
  1. SOURCE-SCOPE start;
  2. §4b (the post-199 rows, newest risk first);
  3. §3;
  4. §4;
  5. §4.S;
  6. §5;
  7. RR-PERF (alone, L38);
  8. RG-SMOKE;
  9. G258-3;
  10. SOURCE-SCOPE end.

  **Write `c-round-258.json` and `c-round-258.md` after every row.**
- **Budget per row** (as in round 199):
  - up to 2 replacement attempts, for environment-invalid runs only;
  - thresholds are not relaxed;
  - a row that fails on a valid setup is a finding.
- **Network and console (PX-NET / REG-HYD), every session:**
  - as in round 199 §2;
  - the known cloud noise is `Failed to load cart`, `ERR_CONNECTION_REFUSED` and `ERR_TUNNEL_CONNECTION_FAILED`;
  - `/api/studio-token` 401/500 without the mock is expected.
- **Ableton:** no new behaviour is introduced, so no new parity claim is made.
  - C judges only the CZABA requirement.
  - Parity statuses stay as recorded in the original rounds and in `user-review/ableton-review.md`.

## 3. C — Studio phase 1 + T12 V1 rows (round 199 §3, adapted)
Run every row of `tasks/round-199.md` §3 (**RG-01 … RG-24, RG-T1 … RG-T4B**) at both viewports (RG-03 at 1440 only). Use the round-199 action and expected text, **except for these adaptations**:

| Row | Adapted for | Action and expected (replaces round 199's text where they differ) |
|---|---|---|
| RG-01 | 10a (round 250) | <ul><li>"Demo music on Music at 0": Library row + Enter at insert marker 0.</li><li>"Split at 4": click the clip body at 4 (this moves the insert marker), then Ctrl+E.</li><li>The expected text is unchanged.</li></ul> |
| RG-03 | SABA-B-9 | <ul><li>Start and stop with the **Play** and **Stop** buttons, or with Space.</li><li>The `Original video sound` toggle is the video lane's M control. Its title names "Original video sound" (CALM-2a).</li></ul> |
| RG-04 | 10a (249–253), B probe | <ul><li>Stopped, 1 clip on Music: drag the playhead handle from 0 to 6. `[data-insert-marker]` = `6.000`, the playhead is 6 ±0.05, and the handle tracks the pointer within ±1 px.</li><li>Space → playing from 6. After about 1 s, drag a 1 s body range on the clip: no playhead jump (monotonic, no step > 0.1).</li><li>**Space → stopped.** Only now, while stopped, click an empty lane point at 6. This clears the range, and that point becomes the new insert marker (the C-N229-S3 recipe; L29: Escape does not clear a range). Do not click the lane while playing: a click during playback moves only the insert marker (Saba decision 1).</li><li>Space → playing from 6. Space at ≈ 7.2 → stopped. Space → restarts at 6.000 (±0.05, plus the 0.05 s start lead, L48). Space → stopped at t₁. Shift+Space → continues from t₁ ±0.05.</li><li>Stop, then Home → marker 0.000, playhead 0.</li></ul> |
| RG-05 | CALM-2a | <ul><li>The status strings come from `strings.ts` (lookup).</li><li>The disabled Loop title is `Loop: make a time selection first (Ctrl+L)`.</li><li>The rest of the expected text is unchanged.</li></ul> |
| RG-10 | 10a, 11a | <ul><li>The zoom-key and Z/X parts are unchanged.</li><li>A seconds-ruler click under 4 px of movement while stopped: on release, the insert marker and the playhead move to the click time. No playback and no history entry (no new `Undo:` title).</li></ul> |
| RG-12 | 10a | <ul><li>Enter adds the item at the insert marker on the active lane.</li><li>The status names the track and the time.</li></ul> |
| RG-14 | 11a, 11b | <ul><li>Fresh session: BPM empty, Snap off, adaptive `1 s` at 40 px/s.</li><li>Press **G** → Snap on. Drag a clip 2 → ≈ 3.3 → start 3.000.</li><li>**G** again → Snap off. Drag to ≈ 4.37 → the start is within ±1 px of the pointer.</li><li>The grid lines follow the 1 s division.</li></ul> |
| RG-15 | 11a, CALM-2 | <ul><li>Type BPM 90. Bars 1, 2 and 3 show under the unchanged seconds ruler.</li><li>"Audio is not stretched" is in the **BPM field title** and in the status written when the BPM is set. There is no persistent sentence (CALM-2).</li><li>The metronome export comparison is unchanged.</li></ul> |
| RG-16 | 10a | <ul><li>"Insert marker at 12": a seconds-ruler click at 12, then `M`.</li><li>"Next-marker key": Home, then Ctrl+Right. If Ctrl+Right stops at a clip edge first, press it again until the flag at 12 is reached. The expected readouts, as in C-NAV-ORIGIN-252: the flag at 12 has `aria-current`, `[data-insert-marker]` = `12.000`, the playhead is 12, and the clock reads `00:12.000`.</li><li>The rest is unchanged.</li></ul> |
| RG-20 | PERF-16 | <ul><li>WAV is unchanged.</li><li>**MP3** (High, 320k) decodes at 5.0 ±0.06 s.</li><li>An encode error is a **finding**; there is no CDN fallback any more.</li></ul> |

**Not adapted.** Run these as written in round 199: RG-02, RG-06, RG-07, RG-08, RG-09, RG-11A, RG-11B, RG-13, RG-17, RG-18, RG-19, RG-22, RG-23, RG-24 and RG-T1 … RG-T4B. Where a control name or key differs from the round-199 text, use the current UI (`strings.ts`, testids, `shortcuts.ts`) and record a lookup.

## 4. C — items finished between rounds 122 and 199 (round 199 §4, adapted)
Run **RV-EN, RV-TOKENS, RV-ICONS, RV-M, RV-SABA-1-2, RV-SABA-3-4, RV-REVEAL and RV-MARKER-ENTER** as written in `tasks/round-199.md` §4, at both viewports, with these adaptations:
- **RV-EN:** apply the ledger rule in §2. Scan the same 6 states, plus the shortcut sheet open.
- **RV-ICONS:** the new **Stop** button renders a lucide `svg` and has empty `innerText`.
- **RV-M:** Play is still a round, icon-only, 32×32 ±0.5 button. Its box is identical while playing (C round 257: [779.5, 43, 32, 32] at 1440 and [699.5, 43, 32, 32] at 1280).
- **RV-SABA-1-2 (Overview):**
  - Scan `[data-testid=arrangement-overview]`, not `arrangement-overview-frame` (OBS-C200-OVERVIEW-FRAME, scope addition SA-1).
  - OBS-R199-OV-PLAYHEAD-CORNER applies: with the playhead at 0 %, the overview playhead itself paints into the corner arc. Measure the empty-project notch with the playhead off 0, as round 199 did.
- **RV-SABA-3-4:** the PERF-FADER work (rounds 208–213) changed how faders write, not their style, so the expected style is unchanged.

### 4.S — store rows (mock API on :5199; both viewports)
Run **RS-1A, RS-1B, RS-1C, RS-1D and RS-2A** as written in round 199 §4.S, plus:

| Row | Item (rounds) | Action | Expected |
|---|---|---|---|
| RS-4B | SABA-B-4 stage 2, store focus style (201–203, SA-0) | On `/` and on a product page, keyboard-Tab to a nav link, a card Play, a field (LeadMagnet or `/support`) and a footer link; then mouse-press each one | <ul><li>Keyboard: one outline ring, as in KEY-RING-203.</li><li>Mouse press: no ring.</li><li>The input error border is visible, as in ERROR-BORDER-203.</li><li>No layout shift on focus, as in NO-SHIFT-203.</li></ul> |
| RS-HIDDEN | Hidden focusables (204) | As MOBILE-204, USERMENU-204 and SHOWCASE-204 (`tasks/round-204.md`) | <ul><li>The closed mobile menu has no Tab stop.</li><li>The user menu works by keyboard.</li><li>No Tab stop sits at effective opacity 0.</li></ul> |
| RS-LM | LeadMagnet dialog (205) | As LM-OPEN-205, LM-TAB-205, LM-CLOSE-205 and SCROLL-LOCK-205 | <ul><li>The popup is a real dialog: focus moves in, Tab is trapped, and Esc closes it with focus restored.</li><li>The page position is kept after close.</li><li>The keep-list text ("FREE DOWNLOAD") is unchanged.</li></ul> |

## 4b. C — items finished since round 199 (one short check each; both viewports unless stated)
"As in round N" means: reuse that round's C script and threshold, adapted only for a later intended change named in the row. Every scope addition of `regression_rounds[2]` (SA-0 … SA-42, numbered in `b-round-257.md` §3) is either a named row here, in §4 or in §4.S, or is marked carried (L6).

| Row | Item (rounds; scope additions) | Action and expected |
|---|---|---|
| RR-CURSOR | SABA-B-6 (207) | <ul><li>As CUR-ENV-207, CUR-POINT-207 and CUR-VIDEO-207.</li><li>The computed `cursor` on the envelope overlay, its breakpoint and the floating dock follows the round-207 cursor map, at rest and during the drag.</li><li>No `crosshair`, `move`, `copy` or `cell` cursor remains on those elements.</li></ul> |
| RR-FADER | PERF-FADER a/b/c (209–213) | <ul><li>As EXPORT-210 and EXPORT-211: drag a track Volume and a group Volume to a value and export WAV. Then type the same values and export again. The two exports have **equal sha256**.</li><li>**No graph restart during a drag while playing** is not re-measured here. RR-PERF's fader scenarios carry it: PERF-1a's track, group, master, pan and clip-gain drags while playing, with 0 restarts as the PERF-FADER budget. An output-RMS liveness check would false-fail on the gapped pulse stem (round 199 RG-18).</li></ul> |
| RR-MP3 | PERF-16a, 16b-i, 16b-ii (218–221; SA-2, SA-4, SA-5) | <ul><li>**1440:** one lab MP3 export at High. Every audio frame is 320 kbps CBR at 48 kHz (joint stereo is fine), with the expected duration and not silent, as MP3-REAL in round 218.</li><li>FACADE-REAL: `convertWavToMp3` at 128k, 192k and 320k gives CBR frames in Chromium, as in round 220.</li><li>DEPS: `npm ls @ffmpeg/ffmpeg @ffmpeg/util` is empty and `require.resolve` fails. An empty scope directory is not a finding (D-29z239).</li></ul> |
| RR-OSS | OSS-LIC (219; SA-3) | `CI=true npx vitest run app/lib/__tests__/third-party-licenses.test.ts` passes. This single named file is a row; the full suite stays a gate row. |
| RR-LEGACY | B-R220-LEGACY-EXPORT-NO-STEMS (222; SA-6), HR-LEGACY-STUBBED | Through `/studio/middle-east` with the round-221/222 `page.route` stubs: <ul><li>the initial checked count is 10/10, and Export Audio is enabled without Select All;</li><li>one deselect → close → reopen gives 9/10;</li><li>one MP3 export at High completes, as in LEGACY-UI-STUBBED-221.</li></ul> The row proves the client path only. The backend-only ownership row stays BLOCKED. |
| RR-SHEET | CALM-1, CALM-2, SABA-B-8 (226–232; SA-8, SA-9, SA-10), C-SHEET-256 (SA-40, SA-41) | <ul><li>`?` and the footer `Shortcuts ?` open the sheet. Esc closes it and returns focus to the opener. Searching "split" shows `Ctrl+E`.</li><li>The transport titles end with their first key, and `aria-keyshortcuts` matches the `shortcuts.ts` rows: `Undo (Ctrl+Z)`, `Back to start (Home)`, `Loop … (Ctrl+L)`, `Play (Space)`, `Stop (Space)`.</li><li>There is no `arrangement-shortcut-hint`.</li><li>The sheet's `scrollHeight` is ≤ 1280 at both viewports. **C-SHEET-256's bound replaces C-SHEET-255's ≤ 1260** (D-29z502). The back-to-start keys are `Home` and `Double-click Stop`.</li><li>The empty demo shows no text in the BPM strip, the Loop strip, the dock label row or the empty monitor.</li><li>Library notice: a dismissal is remembered in that context, and a fresh context shows the notice again.</li><li>The first-run status is as in §2.</li><li>The active empty-lane hint shows only on the active empty lane, and only before the first clip.</li></ul> |
| RR-OVERVIEW | CALM-3 + follow-up (232–233; SA-10, SA-11) | <ul><li>The empty project shows an Overview hairline. With the first clip it shows in full, and its bbox is unchanged.</li><li>Ctrl+Alt+O hides and shows it, and the choice persists after a reload.</li><li>With the Overview focused (separator → Tab), Ctrl+Alt+O moves focus to `arrangement-video-expand` with a visible ring (floating video: placeholder-return). Focus elsewhere is unchanged.</li></ul> |
| RR-TEMPO | SABA-B-11a stage 1 (234; SA-12) | <ul><li>Fresh `/studio-lab`: Add `demo-stem-pulse` → tempo 120, Snap on, bars marks.</li><li>The adaptive grid label at the load zoom is whatever the D-29z359 contract gives (**adapted for 11b**: C round 239 measured 1/2 at 40 px/s for a 120 BPM seed, not 1/4).</li><li>In a fresh context, Add `demo-soft-impact` alone → tempo empty, grid `1 s`, Snap off, and no `120 BPM` anywhere.</li></ul> |
| RR-STRIP | SABA-B-11a stage 2 + FIX-1 (235–236; SA-13, SA-14) | Seeded (wait for `Demo collection ready` first): <ul><li>a click on the bars-ruler top strip at 4.1 s → playing from 4.000;</li><li>a lower-zone click at 6.3 → **insert marker** 6.5 (adapted for 10a);</li><li>a seconds-ruler click is unchanged;</li><li>with no tempo, the bars ruler is inert;</li><li>a strip double-click at 3 s → playing from 3.000, with no Fit status; a lower-zone double-click → Fit;</li><li>a strip click at 15.95 s → the `playPastEnd` status, not playing.</li></ul> |
| RR-SEEDRACE | SABA-B-11a-FIX-2, FIX-3 (237–238; SA-15, SA-16) | As in round 238 (`c-round-238/race238.cjs`): <ul><li>the 4 s delay recipe keeps the exact placement and the seed status;</li><li>the fail recipe shows failed(1);</li><li>an idle load shows the ready text;</li><li>the C-R237-01 refusal recipe (6 s delay; hold a Volume slider and press Ctrl+Z through settle) ends on the ready text.</li></ul> |
| RR-ADAPT | SABA-B-11b stage 1 + FIX-1 (239–240; SA-17, SA-18, SA-19) | As C-ADAPT-SEC-239, C-ADAPT-MUS-239, C-SILENT-239, C-MODE-239 and C-HAND-240: <ul><li>at mount: adaptive `1 s`;</li><li>`=` ×4 → 0.25 s, with a painted period ≥ 24 px;</li><li>`5` → `Fixed grid — <label> at every zoom (5)`;</li><li>`1` at the load zoom → `Grid: 0.5 s (Snap off)`;</li><li>zooming writes no status;</li><li>a 120 BPM seed at 40 px/s shows 1/2;</li><li>`1`, then the demo-synth-mix seed, keeps adaptive 0.5 with `Snap on — grid 0.5 s (G)`.</li></ul> |
| RR-MENU | SABA-B-11b stage 2a + FIX-2 (241–242; SA-20, SA-21) | <ul><li>The grid menu has the groups `Adaptive grid` and `Fixed grid`, with exactly one checked radio (Medium at mount; the division after `5`).</li><li>Narrow → `Adaptive grid — Narrow, now 0.5 s`.</li><li>Plain `4` toggles Snap, with the `(G)` statuses.</li><li>The C-S4-AX description is present.</li><li>The BPM menu fits inside 1280×720.</li><li>C-FOCUS-242: Tab to the Snap toggle, right-click an empty lane point, then Escape → `document.activeElement` = the Snap toggle, with a visible ring.</li></ul> |
| RR-FOCUS-ORIGINS | C-R242-01-FIX, editor, undo and group origins (243–247; SA-22 … SA-25) | One check per origin class, at both viewports: <ul><li>**243:** the fader, the BPM field, the loop brace and a marker flag each get focus back after right-click lane + Escape. After the brace gets focus back, ArrowRight moves the loop.</li><li>**244:** marker add editor, marker rename editor and group name editor → right-click an empty lane → Escape → focus on the successor (the new or renamed flag, or the group name button).</li><li>**246:** with a marker flag focused, Ctrl+Z of its add → `Add marker` (if no other flag exists) or the next surviving flag. Redo of its delete → the next flag.</li><li>**247:** with a group name focused, Ctrl+Z of Group Tracks → the first member name button, with a ring.</li></ul> In every case the focused element has a visible ring and is never BODY. |
| RR-HIDDEN-SNAP | 248 (SA-26), SA-28 | <ul><li>Fixed 0.1 s at 40 px/s with Snap on: a ruler click lands on the free time, and `data-snap-paused` is true. At 60 px/s the same click snaps.</li><li>**SA-28 (record only):** compare adaptive `3` on 1/4 at 120 BPM and 4 px/s with the D-29z361 chooser rule. A mismatch is a note for B, not a FAIL.</li></ul> |
| RR-MARKER | SABA-B-10a (249–253; SA-27, SA-29 … SA-37, SA-39) | At both viewports: <ul><li>**C-INSERT-MARKER-249:** ruler 2 s, Space, 1.5 s, Space, Space → restarts at the marker. Shift+Space continues. A ruler click while playing moves only `data-insert-marker`.</li><li>**C-EDIT-MARKER-250:** play from 2 and stop at ≈ 3.5. Then each of these lands at the insert marker, not at the stop point: Ctrl+V on another track; Ctrl+E on a clip spanning 5 s, after a clip-body click at 5 and play/stop; Enter on a library row; `M`. Space past the end says `Insert marker (…`.</li><li>**C-CAPTION-251:** after play from 3 and stop at ≈ 4.5, the library line reads `Active track: SFX · insert marker 00:03.000`, both stopped and while playing. `+ Add` lands at 3.000.</li><li>**C-FOLLOW-252 / C-FOLLOW-STOP-253:** use the round-252 §0.2 recipe. While playing, a bars lower-zone click → Follow paused, with the composed status. A strip click → Follow on + followResumed. Space → Follow on and exactly `Stopped — Space plays from the insert marker at <t>.`</li><li>**C-STOP-PLAIN-253 / C-STOP-UNRELATED-253:** Follow off + ruler click + stop → the stopped text. A plain stop writes nothing.</li><li>**C-TITLES-253:** the paused Follow title is exactly `Follow paused — press Follow, or stop playback, to resume`.</li><li>**C-NAV-ORIGIN-252/253:** markers at 2 and 6; play from 1 and stop at ≈ 4; Ctrl+Right selects the marker at 2. Stopped, the none text names the insert marker. Playing half: Home, Space, two fast Ctrl+Left → `No more markers before the playhead`, still playing.</li><li>**GATE251-REVIEW-HOME-DRAG-INFO:** Home during a range drag moves neither the page scroll nor focus.</li></ul> |
| RR-BLINK | SABA-B-10b (254–255; SA-38, SA-40) | <ul><li>C-MARKER-VISIBLE-254: one visible ink line at the click time.</li><li>C-BLINK-254: it blinks with `prefers-reduced-motion: no-preference` and is static with `reduce`.</li><li>C-SHEET-254: the transport rows `Shift+Space` and `Ctrl+Shift+Space`, with their exact texts.</li><li>C-MARKER-RANGE-254: the marker is hidden while a time selection exists.</li><li>C-VIDEO-ZORDER-255: the insert-marker line paints in the playhead's order, over both the docked and the floating video.</li></ul> |
| RR-TRANSPORT | SABA-B-9 stage 1 (256–257; SA-41, SA-42) | <ul><li>**C-LAYOUT-256:**<ul><li>the toolbar is 49 px at 1440 and ≤ 87 px at 1280;</li><li>the transport is centred ±24 px;</li><li>the below-toolbar tops are within ±1 px of round 257 (library/dock/ruler/first lane: 84/84/191/275 at 1440, 122/122/229/313 at 1280).</li></ul></li><li>**C-STOP-256:** Play while playing is a no-op; Stop stops; a double-click on Stop → 0.</li><li>**C-A11Y-257:** the Play and Stop descriptions are `Stopped`/`Playing` (CDP `Accessibility.getPartialAXTree`), the names stay constant, and the state element is `hidden`.</li></ul> |

## 5. C — parked rows and observations (record only unless stated)
| Row | Source | Action | Expected / how B rules it |
|---|---|---|---|
| RP-METRO-MUTE | C-R167 (info) | As round 199 | Record only. |
| RP-SPACE-EMPTY | C-R149 (info) | Empty project, press Space | Record the text and whether the playhead moves. B's probe: `Nothing to play — add a clip from the library first.`, with no movement. |
| RP-VIDEO-MARKER | GATE76-S3 (Low, deferred) | As round 199 | A wrong snap is Low. A lost clip or a broken Undo is Medium. |
| RP-NARROW | GATE257-NARROW-TOOLBAR-OVERLAP (Low, D-29z500) | `/studio-lab` at 1024×768, 900×720, 864×720 and 768×720: the bounding boxes of every `button`, `input`, `select` and `label > span` in `arrangement-transport-edit` versus `-view`, plus a screenshot | <ul><li>Record the overlap pairs and their px.</li><li>B's probe: 0 at 1024 and 900, 1 px at 864, 48 px at most at 768.</li><li>This is not a FAIL in this round, because the overlap is below the 1024 px desktop floor.</li><li>A **new** overlap at ≥ 1024 px would be Medium.</li></ul> |

## 6. C — perf, smoke, gate rows, auth guard
- **RR-PERF** (SA-7, PERF-HARNESS-SHARED-LIB):
  - Run `npm run test:perf` **alone**, after §5. L38: no other browser, vitest or build job may run at the same time.
  - **PASS:** rc 0, 3/3 specs pass, every budget row passes its contract (`perf/budgets*.json`), `complete` is true, 0 aborts and 0 page errors. A budget assertion that fails on a valid isolated run is a **finding**. Its severity is Medium for a fader, drag or playback budget, and Low otherwise.
  - **Comparison with the last accepted oracle (report, not a pass criterion):**
    - The oracle is `c-round-225/latest-interactions.json` and `latest-resources.json`, accepted at gate 225 (`80fbb3b`).
    - `npm run test:perf` has not run on a published commit since then (`git log -- perf/` ends at `80fbb3b`), while the transport, the insert marker and the grid changed in rounds 234–257.
    - Run `python3 -I b-round-224/scripts/equiv-check-b2.py` against that oracle, and list every deterministic row that differs, with its scenario id and both values.
    - B rules those deltas at the round 258 → 259 planning (L10). A delta alone is not a FAIL.
  - An overlapped run is environment-invalid and uses one replacement attempt.
- **RG-SMOKE:** run `npm run test:e2e:smoke` in `store/` after RR-PERF, and not concurrently with anything. The round-199 §6 validity rules apply.
- **G258-3 (auth):**
  - `/studio-lab` shows the workspace and the demo badge anonymously, and `auth_user` is null.
  - `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`.
  - `/api/studio-token` with no header → 401. With a fake Bearer → 403 when the mock runs, or 500 without it. **Never 200.**
  - The SRW-21 purchased-route mount is **BLOCKED** (backend unavailable in cloud; SRW-21 is `deferred_user`).
- **Blocked, as in round 199:**
  - R80-RECORDINGS-FIELD-BORDERS, F11–F13 (`/account`) and F16 (`ChatInput`): backend unavailable in cloud.
  - They are listed under `blocked` and do not make `browserVerified` false.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome and `npm run verify`.

## 7. Outcome, fixed in advance
| C result | B at the round 258 → 259 planning |
|---|---|
| Every row PASS, smoke PASS | <ul><li>**First**, set `regression-last.json` = `{"date": <C's completion date>, "round": 258}`.</li><li>Round 259 = **SABA-B-9 stage 2** (master volume to the workspace bottom-right). If it grants `ArrangementTransport.tsx`, it also folds in the cheap gate-257 Lows: GATE257-NARROW-TOOLBAR-OVERLAP (`flex-wrap` on the three groups, probed at 768/900/1280/1440), GATE257-KBD-GESTURE, GATE257-INDEX-LOOKUP and the doc-193 notes (C-I257-03, GATE257-DOC193-TC).</li><li>Round 260 = **RETRO** (every 15 rounds; the last was 245).</li><li>Then SABA-B-11c, after the `ableton-arrangement-expert` consult on the off-grid offset.</li></ul> |
| Any Critical, High or Medium finding, including a regression | <ul><li>Round 259 = a **bounded fix-up**: at most three related bugs, Critical first. C re-runs the failed rows.</li><li>`regression-last.json` is still updated, because the sweep ran.</li><li>SABA-B-9 stage 2 follows the fix-up. The RETRO stays at round 260, or moves to the round after the fix-up.</li></ul> |
| Low findings only | <ul><li>They go to `deferred_low_polish` with id, severity, evidence and repro.</li><li>Otherwise the same as the all-PASS row.</li></ul> |
| Rows not run (time limit), or inconclusive past the budget | <ul><li>The missing rows continue first in round 259, from `progress.json`.</li><li>`regression-last.json` is updated only when every row has run.</li><li>An inconclusive row is never PASS.</li></ul> |
| A browser row that could run here did not run | `browserVerified=false`, and B re-plans that half. |

**Item status:** a failed row does not change its item's earlier status by itself. It opens a finding linked to the item. The item drops from done or c_pass only when B rules the finding a reproducible regression.

## 8. Neighbour risk
| Risk | Check |
|---|---|
| A probe writes into `store/` | SOURCE-SCOPE at the start and at the end |
| The perf run, the smoke run or the mock disturb the 5173 tabs | The serial order in §2; the mock is started and stopped by its PID |
| The job time limit | Incremental reports and `progress.json`; §4b runs first |
| False FAILs from pre-10a or pre-SABA-B-9 scripts (Pause button, Space resume) | The "Changed UI facts" in §2 and the §3 adaptations; record "lookup, not deviation" |
| C's own stubs (HR-LEGACY-STUBBED) mistaken for backend evidence | RR-LEGACY proves the client path only; the ownership row stays BLOCKED |

## 9. Deliverables
- **A:** `a-round-258.md` (baseline only).
- **C:**
  - `c-round-258.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `observations`, `invalidRuns`, `lookups` and `carried` (any scope addition not run, with the reason);
  - `c-round-258.md`;
  - evidence under `c-round-258/{tools,out,shots}`.
- Every bug gets:
  - an id `C-R258-NN`;
  - a severity;
  - the item;
  - the steps;
  - the evidence path;
  - "regression yes/no", with the round of the last pass.

## 10. Root notes
- **Gate on C PASS:** no source change is expected. Nothing is published when no source changed; the loop-state commit records the sweep.
- **Architecture checkpoint (non-blocking):** `b-round-257-checkpoint-addendum.md` adds two items to ARCH-CHECKPOINT-TRANSPORT-POSITIONS, as question 7:
  - the gate-257 Signal 3 (toolbar layout churn, and tests that depend on button order);
  - C's note (the transport a11y contract is spread over 9–10 test files).

  SABA-B-9 stage 2 does not wait for it.
- **For Saba (non-blocking):** SABA-Q-9-TRANSPORT gains part (g). Below 1408 px the Tab order (edit → centre → view) differs from the visual order, where the centre row is on top. The gate-257 reviewer's Suggestion 2 notes this.
  - The question: is that acceptable, or should the centre row come first in Tab order too?
  - Today's default: keep the DOM order.
