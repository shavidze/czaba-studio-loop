# C round 272: SYS-6 STATUS-LIFETIME stage 1, independent verification

**Verdict:** PASS, with one row FAIL (LT-RANGE-OWN-STATUS) and one new Low returned to B (C-R272-01). The FAIL is pre-existing and comes from B's §3.7 premise, not from A's work.
- The three target bugs (C-R253-01, C-R254-OBS-01, B-R253-STALE-PLAYING-STATUS-RESIDUAL) are fixed in real Chromium at 1440×900 and 1280×720, with 0 page errors.
- **browserVerified / realVerified:** true. Every browser row that can run in the cloud was run. Gate rows are not claimed.
- **Ableton conformance:** does not apply. Live has no status line with this text (task §2), so C makes no conformance claim.
- **Baseline:** HEAD `66b570a` plus A's 8 uncommitted paths. `git status` shows exactly the granted paths, before and after C's run.
- **Method:**
  - C copied the HEAD tree (`git archive 66b570a`) into `/tmp/c272-head` and served it on :5186 for the before/after comparisons.
  - C copied A's working tree into `/tmp/c272-new` for the mutants, typecheck and Biome.
  - Both copies use per-entry `node_modules` symlinks. Store source was never edited.
  - Evidence is in `c-round-272/`.

## 1. Browser rows (Playwright, fresh anonymous contexts, demo stem "pulse" 16 s on Music, wait for `Demo collection ready`, play state read from `[data-playing]`)

| Row | Result | Evidence (identical at 1440 and 1280 unless noted) |
|---|---|---|
| K12 / CLAIMS (HEAD) | PASS | `probe-stale-status-c-head.json` (:5186) reproduces every HEAD text in task §1: pastEnd → `Stopped — … 00:17.000.`; atEnd → `Stopped — … 00:16.000.`; residual (Ctrl+← and Ctrl+→) → the stale `… 00:04.000 — playback continues, Follow paused…` after Stop; stoppedMove → `Stopped — … 00:04.000.` |
| B-PASTEND | PASS | `probe-stale-status-c-new.json` pastEnd: after Stop the status is exactly `Insert marker (00:17.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.` After Space: `playing:false`, same text |
| B-ATEND | PASS | atEnd: `Stopped — the insert marker (00:16.000) is at the end; Space plays from 00:00.000.` After Space: playing, position 00:00.661 / 00:00.650 |
| B-RESIDUAL-PLAYING | PASS | residualManual: after Ctrl+←: playing, marker 0, `Insert marker at 00:00.000 — playback continues, Follow paused. Stop, then Space plays from here.` After Stop: `Stopped — Space plays from the insert marker at 00:00.000.` |
| B-RESIDUAL-END | PASS | residual: Ctrl+→ while playing sends the playhead to 16 and playback ends → `Stopped — the insert marker (00:16.000) is at the end; Space plays from 00:00.000.` Two extra **real** natural-end runs (waited about 15 s for `data-playing=false`, `extended-new.json`): marker 4 → `Stopped — Space plays from the insert marker at 00:04.000.`, then Space plays from 00:04.86; marker 16 → the from-start text, then Space plays from 00:00.85 |
| B-PASTEND-HOME | PASS | `extended-new.json` pastEndHome: refusal text → Home → `Stopped — Space plays from the insert marker at 00:00.000.` → Space plays (00:00.861 / 00:00.850, RMS > 0) |
| B-STOPPED-MOVE | PASS | stoppedMoveBack: `… 00:04.000.` → Ctrl+→ → the from-start text with 00:16.000 → Ctrl+← → `Stopped — Space plays from the insert marker at 00:00.000.` → Space plays from 0 |
| B-UNRELATED | PASS | unrelatedFollowResumed: strip click at 2.1 (plays), scroll (Follow paused, `Follow paused by manual navigation…`), press Follow → `Follow is following the playback position again.` → Space (stop): the text is unchanged |
| B-AUDIO | PASS | audioAtEnd. An analyser tap was inserted before `AudioDestinationNode` with an init script; it observes only and does not change the graph. In the from-start state the RMS is 0 while stopped. After Space the position goes 00:00.10 → 00:01.17 over 8 samples, and the RMS shows the pulse pattern (0.067, 0.012, 0.001, 0.115, 0.014, 0.002, 0.124, 0.024). This is real output from 0. No WAV export was made: this round does not touch export, and the row allows either check |
| LT-RANGE-OWN-STATUS | **FAIL** (C-R272-01, Low, pre-existing) | rangeOwnStatus / rangeSpace. A time-selection drag (2 → 5 s on the Music lane, lower half) while `Stopped — Space plays from the insert marker at 00:04.000.` shows updates only the `arrangement-range` readout. **The status line keeps the old text.** Space then plays from **00:02.548** (the selection start), not from 4. HEAD (:5186) is identical, so this is not a regression. The §3.7 premise "setting a range always writes its own range status" is false in the browser. Rule W corrects the text on the next marker write (Ctrl+→ → `Stopped — Space plays from the time selection start at 00:02.000.`), and Rule S corrects it on the next Stop |
| LT-WIDTH | PASS | width, 1280×720: the status box height is 16 px with the Follow-paused playing text, the from-start text and the past-end text alike; `scrollWidth == clientWidth` (1256); document overflow 0. Same at 1440 (1416) |
| SCREEN-BUDGET | PASS | `guards.json`: visible text lines outside the timeline in the demo state are HEAD 115 / new 115 at 1440, and HEAD 102 / new 102 at 1280 |
| G272-AUTH | PASS | `/studio-lab` anonymous loads (localStorage holds only `czaba_session_id`). `/studio/demo-product` signed out shows "Sign in required" and no workspace (`shots/auth-studio-id.png`). `/api/studio-token?product=middle-east&file=Music.wav` with no header → 401 `Please sign in to access Studio.`; with a fake Bearer → 500 `Unable to prepare Studio access`; no token in either body. Without parameters the route returns 400 before its auth check, as at HEAD |

### Section 0 of A's report (strip click / marker-flag double-click from a stopped T text): an observation for a B ruling, not a bug
- **New build:** `Stopped — … 00:04.000.` → a strip click at 6 → while playing: `Insert marker at 00:06.000 — playback continues. Stop, then Space plays from here.`; after Stop: `Stopped — Space plays from the insert marker at 00:06.000.` A marker-flag double-click at 8 gives the same pattern with 00:08.000. Both viewports.
- **HEAD:** the stale `Stopped — Space plays from the insert marker at 00:04.000.` stays while playing from 6 or 8, and **also after Stop** (`extended-head.json`).
- **Assessment:** the new text is true at every step. This closes the strip and flag half of B-R272-STOPPED-TEXT-WHILE-PLAYING. The **Space half stays open**: after Space, `data-playing=true` while the status still reads `Stopped — …` (every `afterSpace`/`afterSpaceAgain` sample). That row is a known open row for stage 2, not a round-272 bug.

## 2. Scope, source and tests (C's own runs)

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE / HUNK-SCOPE | PASS | `git status`: exactly the 8 granted paths. The diff hunks match §4: StudioWorkspace has the import and the stop effect `if`/write (the removed `marker` const belonged to the old `if`); ArrangementContext has the import, the re-export, the interface field, `describeSpaceStartRef` with Rule W in `writeInsertMarker`, the `startPlaybackAt` resolver, `togglePlayback`, `describeSpaceStart` and the two value objects; strings.ts has the two formatters after `insertMarkerAfterStop`; strings.test has additions only |
| SRC-ONE-PREDICATE | PASS | `endedHere` / `> end +` appears only at l.1177 (the existing `tick` overshoot). `resolvePlaybackStart(` is called only at l.1357 (`startPlaybackAt`) and l.1409 (`describeSpaceStart`) |
| TESTS-TARGETED | PASS | 9 files, 244/244 on C's copy, which is byte-identical to the store tree (`targeted-vitest.log`); `status-lifetime` takes 2346 ms for 11 tests |
| TEST-ADDITIONS | PASS | the strings.test diff is +8 lines and 0 removed |
| MUTANTS | PASS (with notes) | `c-round-272/mutants/results.txt`. All 8 §7 mutants turn red (A's mutate script, run on C's copy), and so do 3 mutants of C's own: MC-S-NO-FOLLOWPAUSED → FW8; MC-W-IGNORE-PLAYING → LT5, LT6, LT8; MC-S-REMOVED → 13 rows. The restored sources compare byte-identical to `store/`. Notes are in §4 |
| typecheck / Biome (owned files) | PASS | `tsc --noEmit` rc 0 (`typecheck.log`); `biome check` on 7 files is clean (`biome-owned.log`) |
| DOC-203 | PASS | l.4 is byte-exact. The 7 TEMPLATE headings appear in order. Every cited LT/PB id exists in the new test files |
| ARCH-EVIDENCE | PASS | `status-lifetime.test.tsx` l.206: `describe('SYS-6 STATUS-LIFETIME stage 1: …')` |
| CLAIMS K1–K16 | PASS except K11 | All were re-run on the HEAD copy. K2–K10 and K13–K16 match. **K11 is false:** `app/lib/__tests__/store-focus-fixups.test.tsx:59/71` already has `it('PB1: …')` and `it('PB2: …')`, so the PB ids are not unique repository-wide (INFO-C272-K11) |

**Gate rows (not claimed):** the full vitest, build, full Biome, `npm run verify` and the e2e smoke.

## 3. Bugs and findings for B
- **C-R272-01 (Low, pre-existing; status: deferred_low_polish or SYS-6 stage 2):** a time selection set by a lane drag leaves a stopped T text that names the insert marker, while Space now plays from the selection start.
  - **Steps:** 16 s demo, Space, click the bars ruler lower zone at 4, Space (stop) → `Stopped — Space plays from the insert marker at 00:04.000.` Then drag on the Music lane from 2 to 5 s, then Space.
  - **Expected:** a status that matches where Space will play: a range text, or `selectionAfterStop('00:02.000')`.
  - **Actual:** the status stays `… insert marker at 00:04.000.`, and Space plays from 00:02.5.
  - **Evidence:** `extended-new.json` / `extended-head.json` rangeSpace and rangeOwnStatus; `shots/new-rangeSpace-afterDrag-*.png`.
  - **Root cause and suggestion:** the same class as this round's three Lows. It fits stage 2 together with the reviewer's "status truth at commit" proposal and A's reviewer Low "range clears outside `placeInsertMarker`".
- **INFO-C272-K11:** see §2. The PB ids collide with `store-focus-fixups.test.tsx`. There is no functional effect.
- **INFO-C272-MUTANT-MAP:**
  - M-STOP-EXACT is killed **only** by A's extension of LT10 beyond §5.2. LT3 and LT4 stay green, because Rule W keeps the playing text in step with the marker. B should pin the LT10 extension in the stage-2 contract, so that a later trim does not let the mutant survive.
  - M-KIND-LOOSE is killed by PB8 only, not by LT9.
  - M-PRED-COPY uses `>= end − EPS`, A's documented equivalent.
  - Extra kills: M-PRED-COPY is also caught by BR13 and IM11; M-ORIGIN also by IM5 and IM19.
- **Section 0 (needs a B ruling):** the strip and flag behaviour is now truthful (§1). B should pin it in stage 2.

## 4. Not done / limits
- No WAV export. This round does not touch export; B-AUDIO used the live graph output instead.
- The "selection that starts at the project end" wording (A's reviewer Low) was not probed in the browser.
- Cleanup: the :5186 server is stopped and the `/tmp` copies are removed after this report.
