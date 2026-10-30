# C round 257: SABA-B-9 stage 1 fix-up (C-R256-01 playing state, C-R256-02)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. Every browser row ran in a fresh Chromium 143.0.7499.4 context (Playwright 1.57, no credentials) at 1440×900 and 1280×720 against `http://127.0.0.1:5173/studio-lab`. There are 16 browser runs (8 rows × 2 viewports), and all 16 pass.

No bugs were found. This round closes C-R256-01 (Medium) and C-R256-02 (Low). The purchased origin `/studio/$productId` is BLOCKED because the backend is unavailable in the cloud. Gate rows are not claimed.

Evidence is in `c-round-257/`: `browser/c257.json` (raw measurements), the screenshots, `unit.log`, `mutant-M6.log`, `mutant-M8.log`, `granted-diff.txt`, `scope-end.txt`, `checkpoint.txt` and the script `c257.cjs`.

## 1. Rows

| ID | Result | Evidence |
|---|---|---|
| C-SCOPE-257 | PASS | <ul><li>HEAD is `a061d52`, and the status has the same 14 paths.</li><li>Carried (7), frozen tree (1,106), root files, the 7 protected files and A's `granted-end-sha256.txt` all give rc 0, at the start and again at the end (`scope-end.txt`, 00:01:20Z).</li><li>`git diff HEAD` sha256 is `df28c1b5…` at both the start and the end, so the source did not change during C's phase.</li><li>The diff of each granted file against `b-round-256/r257-granted-start/` shows only §0.1 changes (`granted-diff.txt`).</li></ul> |
| C-UNIT-257 | PASS | <ul><li>The §2.3.3 set: 15 files, **243/243** green (`unit.log`).</li><li>C's own mutants, on the scratch copy `/tmp/c257-mut`: **M6** (no `aria-describedby` on Play) turns TC10 and TC11 red. **M8** (no `hidden`) turns TC11 red, 1 failed / 10 passed.</li></ul> |
| C-COLLISION-257 | PASS | <ul><li>ST10 gains exactly `playbackStatePlaying: 'Playing'` and `playbackStateStopped: 'Stopped'`.</li><li>render-budget gains exactly 3 before/after `dataset.playing` pairs around the 3 cleanup Stop clicks, and nothing else.</li><li>GS14 changes its title only.</li><li>The diffs remove 0 lines from assertions.</li><li>In `transport-centre-ui`, TC10 and TC11 are pure additions.</li></ul> |
| C-A11Y-257 | PASS | CDP `Accessibility.getPartialAXTree` at both viewports. See the table in §2. |
| C-ONSTATE-257 | PASS | <ul><li>`data-playing` flips false → true.</li><li>The Play box is identical in both states: [779.5, 43, 32, 32] at 1440 and [699.5, 43, 32, 32] at 1280.</li><li>Play glyph contrast is 15.62 stopped and 8.32 playing. Stop is 13.24.</li></ul> |
| C-FOCUS-257 | PASS | <ul><li>The toolbar Tab stops are Undo, Split, Delete, Follow, Play, Stop, Back to start, Zoom, Fit, Export, the same as round 256.</li><li>The full sequence has 80 stops at 1440 and 75 at 1280. Both equal round 256's per-viewport numbers (see C-I257-01).</li><li>The state element is never a Tab stop.</li><li>After a keyboard Tab the ring shows (`:focus-visible` true, outline solid). After a mouse click it does not (`:focus-visible` false, outline none).</li><li>After a double-click on Stop while playing, `activeElement` is Stop.</li></ul> |
| C-KEYS-257 | PASS | <ul><li>Tab to Play, then Space: playback starts, the description becomes `Playing`, and RMS is 0.0233.</li><li>Tab to Stop, then Space: playback stops, and both descriptions are `Stopped`.</li><li>Space produced **0** native click events on Play/Stop.</li><li>Held Enter on Stop while playing (CDP keyDown plus 20 autoRepeat events, 20 repeats seen by the page) gives **one** stop:<ul><li>`ph` stays 2.769 after the hold;</li><li>the status count is unchanged;</li><li>there is 1 click, the first press;</li><li>RMS is 0;</li><li>the description is `Stopped`.</li></ul></li></ul> |
| C-LAYOUT-257 | PASS | <ul><li>1440: toolbar 49 px, centre offset 0 px. 1280: 87 px.</li><li>Library, dock, ruler and first-lane tops are 84/84/191/275 and 122/122/229/313, equal to round 256.</li><li>The centre group rect is identical while playing.</li><li>No overlap and no overflow.</li><li>Centre order: Follow · clock · Play · Stop · Back to start · Loop.</li></ul> |
| C-BUDGET-257 | PASS | <ul><li>Persistent visible text lines: 1440 empty 85 / demo 101, and 1280 empty 69 / demo 85. These equal round 256.</li><li>While playing the demo count is unchanged (101 / 85).</li><li>The words "Playing" and "Stopped" are never visible.</li><li>Full-window screenshots: `budget-*`.</li></ul> |
| C-LESSON-257 | PASS | <ul><li>`lessons.md` has 58 lines.</li><li>L29 contains the C-R256-01 removed-signal clause.</li><li>L4 contains the "no assertion lost; equal or stronger replacements allowed" collision wording.</li></ul> |
| AN-REVIEW-257 | PASS | <ul><li>Doc 193 l.4 is byte-exact.</li><li>The new Problem → Solution bullet names C-R256-01 and D-29z492, explains the hidden description, and says why `aria-pressed` was rejected.</li><li>The new testing bullet names TC10, TC11 and M6–M9.</li><li>The cited ids exist: TC1–TC11 in `transport-centre-ui`, TS1/TS2/TS6 in `transport-surface-ui`, and GS14.</li><li>The 7 TEMPLATE headings are in order. The text is Georgian with English terms.</li></ul> |
| LAB-SMOKE-257 | PASS | <ul><li>Space plays (RMS 0.0238, the playhead advances).</li><li>The exported WAV is 48 kHz / 24-bit / 2 ch, 768,000 frames = 16.000 s, −24.91 dB RMS, peak 0.2967, NaN 0.</li><li>sha256 `1fea093b…3f94`, equal to rounds 255 and 256, at both viewports.</li><li>0 page errors.</li></ul> |
| Auth | PASS | <ul><li>A fresh context with no credentials opens the `/studio-lab` demo, and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", with 0 `audio[src]` and no workspace.</li><li>`/api/studio-token` returns 401 with no header and 500 with a fake bearer. It never returns 200, and the page made no 200 token response.</li><li>The 500 is expected here: the backend is absent in the cloud. Round 256 recorded the same 401/500.</li><li>Premium auth is not bypassed.</li></ul> |
| Purchased origin | BLOCKED | Backend unavailable in cloud. |
| gate | not claimed | Full vitest, typecheck, lint, build, verify and e2e smoke belong to the gate. |

## 2. C-A11Y-257: description table (identical at 1440×900 and 1280×720)

| Step | Play name / description | Stop name / description | `data-playing` | Output RMS |
|---|---|---|---|---|
| Stopped (marker 2.000) | Play / Stopped | Stop / Stopped | false | 0 |
| Click Play | Play / Playing | Stop / Playing | true | 0.0209 |
| Click Play again (no-op) | Play / Playing | Stop / Playing | true | 0.0469 |
| Click Stop | Play / Stopped | Stop / Stopped | false | 0 |
| Space (window) | Play / Playing | Stop / Playing | true | 0.0285 |
| Space again | Play / Stopped | Stop / Stopped | false | 0 |
| Play, then double-click Stop | Play / Stopped | Stop / Stopped | false | 0 |

**In every state:**
- The titles are `Play (Space)` and `Stop (Space)`, and the AX `keyshortcuts` is `Space`.
- There is exactly one state element. It is `hidden` (display none), with no tabindex, `aria-live` or role. It sits in the centre group, its id equals both `aria-describedby` values, and only Play and Stop reference it in the whole document.
- Its `boundingBox()` is null, and `focus()` cannot focus it.
- The centre `ariaSnapshot` while playing shows `button "Play"` and `button "Stop"`, and no `Pause`.

**Other points:**
- **DV1:** the status log has 0 writes on Play. This is the listed deviation, not a FAIL.
- **Control column (existing evidence, no new HEAD server):**
  - At HEAD, the playing state is exposed as the name `Pause`: `c-round-256/browser/a11y-playing-state.json`.
  - On the round-256 tree, the description is `Play (Space)` / `Stop (Space)` in both states: `b-round-256/probe/desc-probe-r256tree.json`. That is DV2.
- **The C-R256-01 regression is closed.** The playing state can again be determined programmatically.

## 3. Ableton parity (separate from the CZABA requirement)
- **R7-SR (screen reader can tell whether playback runs):** **unconfirmed**. There is no Live source; B's search is recorded in task §1. The CZABA requirement is met.
- **R-GROUP:** confirmed by text ([ACC] 41.4.1.1). The DOM order edit → centre → view is unchanged. `role="group"` stays a backlog signal (D-29z496).
- **DV1, DV2 and DV3** are listed deliberate deviations, and the measured behaviour matches each one.

## 4. Carried by diff identity (§3.3)
C-STOP-256, C-STATUS-256, C-SHEET-256 and C-REF-256 (R1–R6, R8–R10) carry:
- C-SCOPE shows only the granted changes, and the carried files are hash-identical.
- The re-run rows show no behaviour change: Stop and double-click Stop still stop with RMS 0, focus and layout are unchanged, and the export sha256 is unchanged.

## 5. Info for B (not bugs)
- **C-I257-01:** task C-FOCUS-257 says "80 stops". Round-256 evidence is 80 at 1440 and 75 at 1280. C compared each viewport against its own round-256 number. This affects the task text only.
- **C-I257-02:** Playwright `ariaSnapshot` does not print descriptions, so the description proof is the CDP column.
- **C-I257-03 (from A's reviewer, not granted this round):** two notes on doc 193.
  - l.132 says "six tests" while the new bullet says "five" (different scopes).
  - The approach bullet at l.39–43 does not mention the description.

  Rule on both at the stage-1 close.
- **C-I257-04:** the shared focus ring on Stop computes to `solid 1px` in Chromium 143, while the policy text says 1.5px. This round changed no class. The computed outline strings for the keyboard and mouse states are identical to round 256's `c256.json` focus rows at both viewports, so there is no regression. This is an observation only.
- **Architecture note from A's reviewer:** the transport a11y contract is spread over 9–10 test files. This is forwarded unchanged for B's backlog.

## 6. What I did not run
- No full suite, `verify`, build or e2e smoke: these are gate rows.
- No HEAD server: the control column cites existing evidence.
