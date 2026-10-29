# C round 248: SABA-B-11b stage 2b (a hidden grid pauses Snap). Verdict: **PASS**

- **Environment:** Chromium 143 (Playwright), a fresh context per row, at 1440×900 and 1280×720.
  - The fix ran on `:5173` (store working tree).
  - The HEAD control ran on `:5174`, from `git archive da8c641` in `/tmp/c248-head` with linked `node_modules`. It was stopped after use (by `pkill`); `:5173` was unaffected, and later rows ran on it.
  - `env-status.json`: store 200.
- **Harness:** `c-round-248/scripts/c248.cjs` (rows), `scripts/edge.cjs` (edge magnet), and `../c-round-247/c247.cjs` for budget, smoke and auth.
- **Results:** `c-round-248/out-fix/c248.json`, `out-head/c248.json`, `out-std/c247.json`, `out-edge/{fix,head}.json`, with screenshots next to each file.
- Every ruler or lane click has its own x inside the visible ruler, with ≥ 850 ms between clicks.
- "Free" means |result − pointer time| × px/s ≤ 1 px **and** the result is not a multiple of the hidden step (±1.5 ms).
- Every row had 0 page errors.

## Acceptance

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-248 | PASS | <ul><li>HEAD is `da8c641`.</li><li>`git status` shows exactly `M` on the 10 grants (`status-before.txt`).</li><li>The frozen 1,098 list gives `sha256sum -c` rc 0. The 4 root files equal HEAD. The 7 protected files give `git diff --quiet` rc 0.</li><li>`git diff HEAD -- app` equals `b-round-247/precheck-scratch.diff` file by file, apart from the `index` lines (9/9 files).</li></ul> |
| C-UNIT-248 | PASS | Covering set: 134 files, **2,073/2,073**, rc 0, 228 s (`covering.log`). |
| C-MUT-248 | PASS | <ul><li>Run on the scratch copy `/tmp/c248-mut` (HEAD archive plus the 9 files, `cmp` equal), with B's runner (backup paths renamed).</li><li>Red rows: FIX-CONTROL none; MU-HEAD GM5 GS10 HP1 HP2 HS1 HS2 HS4 HS5 ST23 ST24; ACTIVE-IGNORES-LINES GS10 HP1 HS5; ALT-ENABLES-HIDDEN HP2 HS2 HS3; LANE-FORWARDS HS2 HS3; SEEK-REF HP1 HP2; NUDGE-HIDDEN HS4; NO-NOTE HS1; TITLE-NOT-PAUSED HS1; PAUSED-ATTR GS10 HS1 HS5. This equals §0.2 exactly.</li><li>The repo status was identical before and after (`status-after.txt`).</li></ul> |
| C-HIDDEN-SNAP-248 | PASS | See table A. In all 3 cases, at both viewports, the ruler click, the empty-lane click, the playhead-drag release and the clip drag all land on the free time. At HEAD the same x positions land on the hidden line. `data-snap-paused="true"`, and the control and all 4 lanes report `data-grid-lines="hidden"`. |
| C-ALT-HIDDEN-248 | PASS | <ul><li>Hidden 0.1 at 40 px/s with Snap off + Alt: ruler 11.687 / lane 10.119 / clip 0.332 (1440), against HEAD 11.7 / 10.1 / 0.3.</li><li>Snap on + Alt: free (14.227, clip +0.3325).</li><li>Control, 0.1 at 60 px/s with Snap off + Alt: the ruler snaps, 10.696 → **10.7** (1280: 10.161 → 10.2), the same as HEAD.</li></ul> |
| C-VISIBLE-KEEP-248 | PASS | Every value equals HEAD at both viewports (table B): <ul><li>0.1 at 60 px/s;</li><li>1/32 at 100 px/s, with two distinct clicks. The 1280 click B/A could not measure is now valid: 2.801 → 2.813 and 4.517 → 4.5;</li><li>the load state (adaptive 1 s at 40 px/s, Snap on): ruler, clip drag, loop brace drag (1–4 → 2–5) and marker drag (1 → 3).</li></ul> |
| C-RESUME-248 | PASS | <ul><li>0.1 at 40 px/s with Snap on: `data-snap-paused` true. Moving the slider 678 → 741 (40 → 60 px/s) with no key: true for 11 samples up to 58.9 px/s, then **false** at 60.</li><li>`aria-pressed` was true at every sample.</li><li>The ruler click then snaps: 5.7 (1440), 4.7 (1280).</li><li>The status was unchanged by the zoom.</li></ul> |
| C-NUDGE-248 | PASS | 0.000 → 0.100 → 0.200 → **0.250** at both viewports. HEAD: 0.000 → 0.250 → 0.500 → 0.750. |
| C-KEYSTEP-248 | PASS | <ul><li>**Marker** at a free time: hidden ArrowRight 5.336 → **5.436** (+0.1). At 60 px/s, ArrowRight → **5.500** (the next line). 1280: 4.410 → 4.510 → 4.600. HEAD starts on the line: 5.300 → 5.400 → 5.500.</li><li>**Loop brace** (free range 1.63–4.17 in the clip body, then Ctrl+L): hidden ArrowRight → **1.73–4.27**. At 60 px/s → **1.80–4.34** (start on the next line, length kept). HEAD: 1.60–4.20 → 1.70–4.30 → 1.80–4.40.</li></ul> |
| C-SIGNALS-248 | PASS | <ul><li>The hidden Snap title, select title and statuses match §0.3/§1.3 exactly.</li><li>The note appears after: `G`, `4`; `1`/`2` in fixed mode; `1`/`2` in adaptive mode; `5` (both directions); select 0.1 and select 1/32; grid-menu division 0.1; grid-menu widths Narrowest/Widest/Medium; grid-menu Snap; `3` in fixed mode (1/32 ↔ 1/32T).</li><li>There is no note when the result is visible (0.25, 0.1 at 60 px/s, 1 s) or Snap is off.</li><li>Zoom crossings in both directions leave the status unchanged.</li><li>Visible: paused false and the HEAD titles.</li><li>**`3` in adaptive mode** (`out-adaptive3/fix.json`, both viewports, pulse at 4 and 2.5 px/s): <ul><li>`1` narrows the adaptive grid to 1/2 and then 1/4, both hidden, with the note.</li><li>`3` gives adaptive **1/8T**, hidden, with the note `Grid: 1/8T · 0.167 s at 120 BPM (Snap on) · Lines are hidden…`. Pressing `3` again goes back to 1/4 with the note.</li><li>The grid-menu **Narrowest** at a musical tempo gives `Adaptive grid — Narrowest, now 1/4 · Lines are hidden…`.</li><li>The `bar` refusal at 0.5 px/s carries no note, which is correct: it is not a wrapped write.</li></ul></li></ul> |
| C-STATUS-BOX-248 | PASS | <ul><li>The 1/32T note status is 1 line (16 px), `scrollWidth = clientWidth` (1416/1256), and does not overlap the transport. The footer is 49 px.</li><li>The seed status: 1 line, 16 px, footer 49 px, at both viewports.</li></ul> |
| C-STATUS-NEIGHBOURS-248 | info | <ul><li>The seed, adaptive end ("already at its widest/narrowest") and triplet refusal texts equal HEAD.</li><li>Cases where "Snap on" shows while paused: <ul><li>the seed status after zooming out to 0.5 px/s;</li><li>`Grid: 0.1 s (Snap on)` after a zoom crossing into hidden;</li><li>"already at its widest — 10 s (2)".</li></ul></li><li>The reverse case: the "paused" note stays after zooming in (now visible).</li><li>All of these are §1.4 as ruled (D-29z357). Saba is asked about them in SABA-Q-11B-HIDDEN-SNAP (d).</li></ul> |
| C-KEYS-248 | PASS | Typing `g45123` in the library search and in the BPM field leaves snap, division and mode unchanged (fix and HEAD). |
| C-BUDGET-248 | PASS | Empty / demo: 85/101 (1440), 69/85 (1280). |
| AN-REVIEW-248 | PASS (with a Low) | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>D-29z420 and the rejected coarsening are explained.</li><li>All 12 cited ids exist in the tests.</li><li>The TODO no longer says 2b is next and lists SABA-Q-11B-HIDDEN-SNAP.</li><li>The diff touches only the granted sections.</li></ul>See C-R248-01. |
| LAB-SMOKE-248 | PASS | <ul><li>Space plays (0 → 0.89 s; tap RMS 0.0013) and pauses (position held).</li><li>Export WAV: sha256 `1fea093b…3f94`, 48 kHz / 24-bit / stereo, 768,000 frames = 16.000 s, peak 0.2967, RMS −24.91 dB, 0 NaN, at both viewports.</li></ul> |
| Auth | PASS | <ul><li>Fresh context: 0 cookies. `/studio-lab` opens with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401; a fake bearer returns 500 (not 200).</li></ul> |
| Purchased origin | BLOCKED | Backend unavailable in cloud. |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke belong to the root gate. |

**Table A: hidden grid, Snap on (fix / HEAD), 1440**

| Case | Ruler | Lane | Playhead release | Clip drag +13.3 px |
|---|---|---|---|---|
| (a) 0.1 at 40 px/s | 8.487 / 8.5 | 10.119 / 10.1 | 11.787 / 11.8 | 0.332 / 0.3 |
| (b) adaptive 10 s at 0.5 px/s (hero music) | 669.56 / 670 | 955.64 / 960 | 1106.68 / 1110 | 26.6 / 30 |
| (c) pulse, 1/32 at 40 px/s | 8.487 / 8.5 | 10.119 / 10.125 | 11.787 / 11.813 | 0.332 / 0.313 |

At 1280: (a) 7.002/7, 8.345/8.3, 9.736/9.7, 0.332/0.3; (b) 551.16/550, 786.04/790, 911.48/910, 26.6/30; (c) 7.002/7, 8.345/8.375, 9.736/9.75, 0.332/0.313.

**Table B: visible grid (fix = HEAD)**

| Case | 1440 | 1280 |
|---|---|---|
| 0.1 at 60 px/s: ruler / lane / playhead / clip | 5.7 / 6.7 / 7.9 / 0.2 | 4.7 / 5.6 / 6.5 / 0.2 |
| 1/32 at 100 px/s: ruler / ruler2 / lane / clip | 3.375 / 5.5 / 4.063 / 0.125 | 2.813 / 4.5 / 3.313 / 0.125 |
| Load state, Snap on: ruler / clip / loop / marker | 8 / 0 / 1–4 → 2–5 / 1 → 3 | 7 / 0 / same / same |

## §6 neighbour probes
- **Clip-edge magnet** (`out-edge`). Setup: slow-rise ends at 5.332 (off-grid), and soft-impact is dragged to 2 px past that edge (5.382).
  - Visible adaptive 1 s with Snap on: it lands on the **edge 5.332**, on fix and on HEAD (the magnet is intact).
  - Hidden 0.1 at 40 px/s: fix **5.382** (free, no magnet), HEAD 5.4 (the hidden line). This is the listed deviation ⚖.
- **Library drop with hidden lines** (pointer DnD of Soft impact onto SFX, pointer at 3.1325): fix **3.125** (0.3 px from the pointer, free); HEAD 3.100 (the hidden line).
- **Visible clip move keeps an off-grid start** (Snap off + Alt, 0.1 at 60 px/s: 0.664 + 0.22 s stays 0.664). This is the same on HEAD (0.632 stays), so it is pre-existing and relates to the relative-snap topic (F1-ABSOLUTE-SNAP / SABA-B-11c). It is not new in this round.
- Drawn lines and `data-grid-seconds` on the lanes stay those of the division (the hidden rows report `laneSeconds` = division).

## Ableton parity (separate from PASS)
| §3 row | Status |
|---|---|
| Snap follows the drawn grid lines (6.10) | **Confirmed** for visible grids (equal to HEAD). Snapping to undrawn lines is removed. |
| The modifier with the grid off enables it (6.10) | **Confirmed** for a visible grid (Alt control 10.7). **Deliberate deviation ⚖** for a hidden grid (free), as listed. |
| Snapping while the lines are not drawn | **Unconfirmed.** No Live reference exists; this is B's ruling D-29z420, and SABA-Q-11B-HIDDEN-SNAP is open. |

## Findings for B
- **C-R248-01 (Low, docs):** doc 186 is marked `Completed`, but two places contradict the shipped behaviour.
  - The title (l.1) still says "ეტაპები 1 და 2a".
  - `## არქიტექტურა` l.186–188 says "snap, Alt bypass, edges, markers და ყველა gesture `gridSeconds`-ს უცვლელად კითხულობს". After 2b they read `snapGridSeconds` / `activeSnapSeconds`, and Alt no longer enables a hidden grid.
  - Both are outside the granted sections (A flagged them in `a-round-248.md` §2). Per the 2026-10-23 bug gate this goes to `deferred_low_polish`, or into a small doc grant.
- **INFO-C248-STALE-NOTE:** after zooming in, the status still says "Snap is paused" while snapping works. After zooming out into hidden lines, the status shows plain "(Snap on)" or the seed's "Snap on". This is ruled behaviour (§1.4); it belongs to SABA-Q-11B-HIDDEN-SNAP (d).
- **INFO-C248-ADAPTIVE-3 (observation, unchanged code):** in adaptive mode at 120 BPM and 4 px/s with the narrowed density, `3` on 1/4 resolves to **1/8T** rather than 1/4T. The adaptive chooser picks the member of the triplet family at the current density. This is not part of this round. B may check it against SABA-B-11b stage 1 if it was not intended.
- C-STATUS-BOX: the status element is `break-words` (it wraps, not nowrap). The seed status fits on 1 line at 1280 (`out-std/budget-demo-1280x720.png`), so the 1-line comparison is valid.

browserVerified = true: every browser row that can run in the cloud was run. Only the purchased origin is BLOCKED (backend).
