# C round 253: SABA-B-10a stage 2b fix-up (status after Stop, paused-Follow copy)

**Verdict: PASS.** Every C row that can run here passes at 1440×900 and 1280×720. HEAD and round-252 controls confirm the fix. `browserVerified` = `realVerified` = true.

**One new Low (C-R253-01).** It confirms A's code-reviewer Low A-R253-REVIEW-PASTEND-COPY in the browser. No row covers it, so it goes to `deferred_low_polish` under the 2026-10-23 bug gate.

**Two observations for B:**
- The spec's residual case reproduces.
- Escape does not stop playback at all.

**A's STOP (render-budget test at 50.7 % of its 5 s timeout in A's covering run)** does not block C:
- L11 makes it a report-and-rule item ("Report a STOP and change nothing else"). It does not require a fix in this round.
- The test file is frozen and outside the grants, and the test passes.
- It goes to B for a ruling (split or timeout) before the gate's full suite. C did not re-time it.

**Not claimed by C:**
- **Blocked:** the purchased-origin row (backend unavailable in cloud).
- **Gate rows:** full suite, typecheck, lint, build, verify and e2e smoke.

## Environment
- `env-status.json`: store 200, round 253.
- Browser: Playwright Chromium, a fresh context per row, no credentials. The run used three servers:

| Server | Tree | How it was built |
|---|---|---|
| `:5173` (fix) | The working tree under test | — |
| `:5174` (HEAD control) | Pure `83b7c75` | `git archive HEAD`, at `/tmp/c253/head` |
| `:5175` (round-252 control) | The round-252 end state | A tar copy with `b-round-252/r253-granted-start/` restored. `sha256sum -c b-round-252-r253-grants-start-sha256.txt` gave rc 0. |

- **Setup** (§4 step 7): wait for `Demo collection ready`, then `demo-stem-pulse` → Add → blur → `=` ×4. This gives 97.7 px/s at 120 BPM.
- **Aim:** lower-zone clicks are at scroller right − 300 px, and `elementFromPoint` must return `arrangement-bars-ruler` before the click. Every aim was confirmed.
- **Status writes:** a MutationObserver on `[data-testid="arrangement-status"]` counts them.
- **Scope:** C changed no app source. All scratch copies are in `/tmp/c253` (outside the repo).
- **Final scope re-check** after all browser, mutant and server work:
  - HEAD is `83b7c75`. `git status --short --untracked-files=all` shows exactly 13 lines, all ` M`, with nothing untracked.
  - The frozen, carried and root sha lists all give rc 0.
  - The 7 protected files are unchanged against HEAD.

## Rows
| ID | Result | Evidence |
|---|---|---|
| C-SCOPE-253 | PASS | <ul><li>HEAD is `83b7c75`. Status shows exactly the 13 round-252 `M` files, with nothing untracked.</li><li>Frozen (1,097), carried (7) and root sha checks: rc 0. The 7 protected files: `git diff --quiet HEAD` rc 0.</li><li>Only grants 1–6 differ from `r253-granted-start/`.</li><li>Grant 1's diff is +9 lines, inside the `!isPlaying` branch, after the `paused → on` step and before `return`.</li><li>L50 regex on grant 1: 20 hits, the same as the start state. No new hit.</li></ul> |
| C-UNIT-253 | PASS | <ul><li>The 6 files were run alone: 161/161 passed (`c-round-253/unit.{log,json}`).</li><li>FW6, FW8, FW9, FW10, NS3b, ST11, ST12 and ST17 each appear once, and all pass.</li><li>Removed asserts: FW6 `toBe(pausedBeforeStop)` and the sequence equality. Both are replaced in place by the exact stopped text, `pausedSequence + 1`, plus new pre-asserts. NS3b and ST17 only swap literals. No test's only change is a removal.</li></ul> |
| C-MUT-253 | PASS | <ul><li>Run on the scratch copy `/tmp/c253/mut` (`c-round-253/mutants/*.diff`, `*.log`).</li><li>NO-REPLACE: red at l.605, 627 and 651 (FW6, FW8, FW9).</li><li>REPLACE-ANY: red at l.589 and 669 (FW6 plain half, FW10).</li><li>NO-PLAIN: red at l.651 (FW9).</li><li>Extra mutant NO-FOLLOWPAUSED: red at l.627 (FW8).</li><li>FIX-CONTROL: green.</li><li>All of these match A's table.</li></ul> |
| C-FOLLOW-STOP-253 | PASS | <ul><li>Paused text at `00:06.500` (1440) and `00:04.750` (1280), equal to `[data-insert-marker]`.</li><li>After Space: `data-follow-mode="on"` with text `Follow`, and the status is exactly `Stopped — Space plays from the insert marker at 00:06.500.` (1280: `00:04.750`).</li><li>Exactly 1 MutationObserver callback and 1 text change.</li><li>**Round-252 control:** the paused text stays, with 0 writes.</li></ul> |
| C-STOP-PLAIN-253 | PASS | <ul><li>Follow is off. The lower-zone click writes `Insert marker at 00:06.500 — playback continues. …`.</li><li>After Space, Follow stays `off` and the status is exactly the stopped text, with 1 write. The same holds at 1280 (`00:04.750`).</li><li>**HEAD control:** the playing text stays, with 0 writes.</li></ul> |
| C-STOP-SCROLL-253 | PASS | <ul><li>A +200 px scroll gives exactly `Follow paused by manual navigation. Press Follow, or stop playback, to resume it.`</li><li>After Space, Follow is `on` and the status is `Stopped — Space plays from the insert marker at 00:00.000.`, which is the insert marker (playback had run from 0). 1 write.</li><li>**Round-252 control:** the old text `… Follow or Play resumes it.` stays after the stop.</li></ul> |
| C-STOP-UNRELATED-253 | PASS | <ul><li>**(a) Plain stop:** 0 callbacks, and the status is unchanged.</li><li>**(b) Auto-stop:** a strip click at 13.2 s plays from 13.299, and playback auto-stops at 16.000. 0 writes from the click through the stop, and the previous status (`… added to the Music track … Snap on — grid 1/2 (G)`) stays.</li><li>Both viewports.</li></ul> |
| C-TITLES-253 | PASS | <ul><li>Paused by a ruler click, and paused by a scroll: the title is exactly `Follow paused — press Follow, or stop playback, to resume`.</li><li>After a resume by the Follow button or by Stop, the title is `Follow: the view follows the playback position`.</li><li>L29 sweep: 0 hits.</li><li>Round-252 control: the old title.</li></ul> |
| C-STATUS-WIDE-253 | PASS | <ul><li>The new `followPaused` and the stopped text are each 1 line, height 16, with `scrollWidth` = `clientWidth` (1416 / 1256) and no transport overlap.</li><li>The composed control text gives the same box.</li></ul> |
| C-NAV-ORIGIN-253 | PASS | <ul><li>**Stopped:** markers at 2 and 6, a ruler click at 1, play about 3 s, then stop. Ctrl+→ goes to 2.000 (clock `00:02.000`), and then the status reads `No more markers after the insert marker`.</li><li>**Playing:** Home, Space, then two Ctrl+← give `No more markers before the playhead`, and playback continues.</li><li>The "after the playhead" case at the end is jsdom-only (IM24), because playback auto-stops at the end. This is not a failure.</li></ul> |
| C-BUDGET-253 | PASS | <ul><li>85/101 at 1440 and 69/85 at 1280.</li><li>The same on the HEAD and round-252 controls.</li><li>The first cold control load timed out at 150 s and was re-run once (`control-*-run1.log`).</li></ul> |
| C-LESSON-253 | PASS | `lessons.md` has 58 lines, and L51 and L52 are present. |
| AN-REVIEW-253 | PASS | <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 253 PASS)`.</li><li>The 7 TEMPLATE headings are in order, and each has a Round 253 part (l.50, 237, 311, 397, 454, 520, 560).</li><li>FW6, FW8, FW9, FW10, NS3b and ST11/12/17 are cited, and each exists in the tests.</li></ul> |
| LAB-SMOKE-253 | PASS | <ul><li>Playback works: RMS > 0.001.</li><li>The WAV is 48 kHz, 24-bit, 2 ch, 768,000 frames = 16.000 s, with 0 NaN, peak 0.2967 and −24.91 dB.</li><li>sha256 is `1fea093b…`, equal to round 252 and to the HEAD control.</li><li>0 page errors at both viewports.</li></ul> |
| Auth | PASS | <ul><li>`/studio/middle-east` with no session shows `Sign in required`, 0 `audio[src]` and no workspace.</li><li>`/api/studio-token` returns 401 with no header and 500 with a fake bearer; never 200.</li><li>The lab has no `auth_user`.</li></ul> |
| Purchased origin | BLOCKED | Backend unavailable in cloud. |
| gate rows | gate | Not claimed. |

## §6 neighbours and probes (both viewports, `fix/c253.json` → `probes@*`)
- **Transport Pause button** after a ruler-click pause: the status becomes the stopped text, with 1 write, and Follow is `on`. PASS.
- **Escape does not stop playback** (info, not a bug of this round). §6 says Escape stops "through the same effect". In the browser it does nothing during playback: 0 writes, still playing. The frozen `StudioWorkspace` Escape handler only returns the floating video. B should correct that premise.
- **Project-end auto-stop with a playing-only text** (the case A did not run):
  - Steps: a strip click at 12.4 s, then a lower-zone click at 14.6 s while playing (marker 14.500), then playback auto-stops at the end.
  - Result: the status becomes `Stopped — Space plays from the insert marker at 00:14.500.`, as the §1.1 table says ("any cause").
- **BR3** (a strip click while playing, Follow on): 0 status writes, Follow stays `on`, and the stop after it writes nothing.
- **Stop after an edit during playback:** an `m` (marker editor) cancelled with Esc gives `Marker not added`, and the stop keeps it (0 writes).
- **Residual (B-R253-STALE-PLAYING-STATUS; observed, not a failure under the spec):**
  - Steps: markers at 2 and 6, a ruler click while playing (marker 6.500 / 4.750, the paused text), then Ctrl+→ moves the insert marker to 2.000 with **no status write**, then Space.
  - Result: the stopped screen keeps `Insert marker at 00:06.500 — playback continues, Follow paused. …` (0 writes), while the button reads `Follow` and the marker is at 2.000. So both of its claims are now false.
  - This sizes the residual: it is reachable with one keystroke.

## Bug for B
**C-R253-01 (Low, new; confirms A-R253-REVIEW-PASTEND-COPY): the stopped text promises playback that the next Space refuses.**
- **Steps** (both viewports):
  1. Run the setup.
  2. Scroll so that 16 s is centred, then click the strip at about 13 s. Playback starts.
  3. While playing, click the lower zone at 16.4 s, past the 16 s end. The marker becomes 16.500.
  4. Press Space.
  5. Press Space again.
- **Actual:**
  - Step 4 writes `Stopped — Space plays from the insert marker at 00:16.500.`
  - Step 5 does not play and writes `Insert marker (00:16.500) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.`
- **Expected:** a stopped text that is true. One option is to keep the past-end wording when marker ≥ end; B decides.
- **Not checked:** the case where the marker is exactly at the end (16.000) during playback.
- **Evidence:** `c-round-253/fix/c253.json` (`probes@1440x900` and `probes@1280x720`: `pastClick`, `pastStop`, `pastSpaceAgain`), plus `fix/probes-*.png`.

## Ableton conformity (§3)
| Behaviour | Status |
|---|---|
| Follow resumes on stop (manual 6.2) | **Confirmed.** C round 252 checked the 6.2 quote verbatim; this round's browser rows show Follow `on` after every stop. |
| Status message on stop | **Deliberate difference / not applicable.** Live has no status line; the message is a CZABA addition. |
| Follow button tooltip while paused | **Unconfirmed.** B found no reference, and C did not find one either. |

## Notes for B
- **A's STOP (render-budget at 50.7 % of its timeout)** is for B. C did not run the covering set (speed rules).
- **Controls ran on dev servers** started from scratch copies. Their first cold loads timed out once and were re-run (disclosed above).

## Artefacts
- Harness: `c-round-253/c253.cjs`, adapted from `c252.cjs`.
- Results: `fix/c253.json`, `control-r252/c253.json`, `control-head/c253.json`, with screenshots in each folder.
- Logs: `fix-run1.log` and `fix-run2.log`. The first `probes` run failed on C's own script: the Escape step assumed a stop, and at 1280 the strip aim hit the metronome. Both were fixed and re-run.
- Other evidence: `unit.*`, `mutants/` and `checkpoint.txt`.
