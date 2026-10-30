# C round 273: SYS-6 STATUS-LIFETIME stage 2 (independent verification)

**Verdict: PASS.** browserVerified = realVerified = true. 1 Low planning finding for B, which does not block the round.
**Tree checked:** HEAD `b288be7` plus A's uncommitted diff (7 modified files, 1 new doc). The :5173 dev server serves A's tree.
**HEAD comparison:** `git archive b288be7` was copied to `/tmp/c273-head` and served on :5186.
**Browser:** Playwright with Chromium headless, a fresh anonymous context per scenario, 1440×900 and 1280×720, waiting for `Demo collection ready` (L48). The audio tap is an AnalyserNode inserted before `AudioDestinationNode` (round 272's tap).
**Env:** `env-status.json` round 273, store 200. The backend is not used (`/studio-lab`).
**Ableton conformance:** does not apply. This is a bug-fix round on CZABA's own status line; Live has no such text (task header).

## Scope, claims and tests
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE / HUNK-SCOPE | PASS | `git status`: exactly the 7 granted paths plus the new doc 204. `git diff -- app/components` = 0 lines. The context diff contains only §3.1–§3.5. `describeSpaceStart`'s body is byte-identical to HEAD, and only its position moved. The classifier loop (`end: second ?? first`) classifies the same set as HEAD's two insert-marker branches plus the selection subject. **Two more test-only hunks** are in `status-lifetime.test.tsx` but not listed in §4: the import line at l.19 is extended, and the helper `stoppedAt` is added at l.181 (+7 lines, which only combines existing helpers). Both are additive, A disclosed them, and no assertion is affected, so they are accepted |
| NO-REF | PASS | `grep -n describeSpaceStartRef` → 0 hits |
| CLAIMS (K1–K23 at HEAD on `/tmp/c273-head`) | PASS, with 1 Low | Every command's output matches §9: K5 819/836/1428; K6 676…759; K8 1 hit at :792; K9 2063/397; K11 deps `[]`; K12 has no `setStatus` after `setIsPlaying(true)`; K13 0; K15 1940/1943; K17 2+8, then 0; K19 3; K20 7 files; K21 0; K23 17. **L29 sweep:** task l.86 "`ArrangementDetailPanel` l.604, Enter" is an untagged code fact. It is true at HEAD (`setTimeRange(next)` at l.604, followed by an explicit `setStatus`), so it is recorded as C-R273-01 (Low, planning) |
| TESTS-TARGETED | PASS | The §5.3 15 files: **362/362**, rc 0 (`c-round-273/targeted-vitest.json`). The slowest is master-ui at 1604 ms, against a 15 s describe timeout (11 %). The new LT rows are all < 400 ms |
| TEST-CHANGES | PASS | strings: +1 sample and +1 exact expect. playback-start: renames, the 2 selection samples moved from `outside` into `kinds` as `'stopped'`, `playingFrom` added, new PBS9. status-lifetime: the removed lines are the import line (now extended) and LT8 l.326. LT8 l.326 is replaced by `selectionAfterStop('00:02.000')`, the exact new contract. The LT10 hunk is absent, so LT10 is byte-identical. No assertion is lost |
| MUTANTS | PASS | C re-ran the mutants on its own scratch copy, `/tmp/c273-new` (`c-round-273/mutants/results.txt`): M-NO-R → LT8, LT14; M-R-NO-GUARD → LT17; M-NO-G → LT17; M-NO-P → LT14, LT16; M-P-ALWAYS → LT12, LT15; M-NO-KIND-FROM → LT14, LT16, PBS8, PBS9; M-NO-SEL-PASTEND → LT18, PBS8, PBS9; M-SNAPSHOT → LT12; M-STOP-EXACT → LT10, LT14. **C's own extra mutant M-C-R-ANYTEXT** (`rewriteStoppedTruth` without the kind check) → LT19. The restore `cmp` is clean. **§7 deviation:** M-NO-R does not turn LT13 red, but LT8 and LT14 catch it, so the §10 STOP is not met. The reason, Rule W's late read, is consistent with §2. Accepted |

## Browser behaviour
Probe: `c-round-273/probe-r273.cjs`, B's script plus C's scenarios. Results: `probe-r273-new.json` and `probe-r273-head.json`. Screenshots: `shots/{new,head}-*`. **Page errors: 0** in every run, both trees, both viewports.

| Row | Result | NEW (1440 / 1280 identical unless noted) | HEAD (control) |
|---|---|---|---|
| B-RANGE-STATUS | PASS | Stopped at 4, then a drag from 2 to 5 s on the Music clip body. **During the drag:** the text is unchanged, with **0 mutations**. **After the release:** `Stopped — Space plays from the time selection start at 00:02.000.` (2 mutations in total, one keyed swap). **Space:** `Playing from 00:02.000.`, position 00:02.551 / 00:02.571, RMS 0.133 / 0.112. **Stop:** the selection text | after the release: stale `… insert marker at 00:04.000.`, and Space plays from 2.56 under the stale text |
| B-SPACE-PLAYING | PASS | `Playing from 00:04.000.`, data-playing=true. Stop → `Stopped — Space plays from the insert marker at 00:04.000.` **spaceCtrlLeft:** `Insert marker at 00:00.000 — playback continues. Stop, then Space plays from here.`, and after Stop `… insert marker at 00:00.000.` | `Stopped — …00:04.000.` while playing |
| B-SPACE-FROMSTART | PASS | Marker 16: `Stopped — the insert marker (00:16.000) is at the end; Space plays from 00:00.000.` → Space → `Playing from 00:00.000.`. Position 0.200 → 0.449 → 0.719 → 0.972 (advancing from 0, with the L48 lead). Stop → the from-start text again | the stopped text while playing |
| B-SEL-PASTEND-HOME | PASS | Range 17–18, Space refused with the selection past-end text. Home → range null, marker 0, `Stopped — Space plays from the insert marker at 00:00.000.` | the refusal text stays after Home |
| B-STRIP-STOPPED | PASS | `Insert marker at 00:06.000 — playback continues. Stop, then Space plays from here.`, then after Stop `… insert marker at 00:06.000.` | identical |
| B-CLOBBER | PASS | **clobberAdded:** the clip-added text is unchanged through Space and Stop. **followResumed:** strip at 2.1, scroll (Follow paused), Follow → `Follow is following the playback position again.` It stays unchanged through Stop, a second Space and Stop | same |
| B-AUDIO | PASS | spaceFromStopped and audioPlaying: RMS 0.1332 at Space plus 0.55 s. 5 samples at 250 ms intervals all > 0 (0.0005–0.0172; the pulse stem is rhythmic). Position 4.200 → 5.198. Stop → RMS 0 | — |
| LT-WIDTH | PASS | The status box is 16 px tall with `Playing from 00:04.000.`, the same as with the from-start text (16 px). scrollWidth = clientWidth (1416 / 1256), no document overflow (`shots/new-width-*`) | — |

**C's extra probes:** observations, all true texts, no new bug.
- **naturalEnd:** play from 15 → `Playing from 00:15.000.`; at the natural end → `Stopped — Space plays from the insert marker at 00:15.000.` (Rule S). This is the same as HEAD's final text.
- **shiftSpace:** Shift+Space continues → `Playing from 00:05.172.` (the true continue point); Stop → `… insert marker at 00:04.000.`. Ctrl+Shift+Space → `Insert marker moved to the playhead (00:05.630)…`, then Space → `Playing from 00:05.630.`. HEAD kept the stopped or to-playhead text while playing. This is A's A-R273-TOPLAYHEAD case, and it is better than HEAD.
- **rangeWhilePlaying:** a range drag while playing keeps `Playing from 00:04.000.` (0 mutations during the drag). After Stop, the selection text. This is the §3.7 known limit B-R273-PLAYING-TEXT-WITH-RANGE, as ruled.
- **faderRelease (Pan, Music):** 0 status mutations, and the stopped text stays true.
- **loopOn (Ctrl+L with no selection):** the loop refusal text is kept through Space and Stop, which is correct non-T clobber protection.
- **Not observed:** A-R273-REPEAT-PASTEND (key-repeat nudge at past-end). This was an optional observation, and it stays a stage-3 recipe.

## Guards and docs
| Row | Result | Evidence |
|---|---|---|
| SCREEN-BUDGET | PASS | Persistent text lines outside the timeline in the demo state: HEAD 115 / new 115 at 1440, HEAD 102 / new 102 at 1280. The line sets are identical (`guards.json`, `shots/budget-*`) |
| G273-AUTH | PASS | **`/studio-lab`:** loads in a fresh anonymous context; localStorage holds only `czaba_session_id`. **`/studio/demo-product`, signed out:** "Sign in required" and no workspace (`shots/auth-studio-id.png`). **`/api/studio-token?product=middle-east&file=Music.wav`:** with no header → **401** `Please sign in to access Studio.`; with a fake Bearer → 500 `Unable to prepare Studio access` (backend absent), and neither body contains a token. Without parameters the route returns 400/405 before its auth check, which is the same at HEAD (`auth-token.json`, `guards.json`) |
| DOC-204 | PASS | l.4 is byte-exact: `**სტატუსი:** In Progress (stage 2 of 3; C round 273 PASS)`. The 7 TEMPLATE headings are in order. `## მიდგომა` carries the §2 sentence in Georgian and the 3-stage split. Cited ids LT8, LT10, LT12–19, PBS1/8/9 and ST11/ST12 all exist (`it('ST11:` form). **Doc 203:** the diff is only the 3 `PB`→`PBS` tokens; l.4 is untouched |

**Gate rows (not claimed):** full vitest, build, full Biome, verify and e2e smoke.

## Findings for B
- **C-R273-01 (Low, planning, L29).** Task §3.3 l.86 states "`ArrangementDetailPanel` l.604, Enter" with no `[K#]` tag. C verified that it is true at HEAD. There is no impact on A's work.

**Carried signals, unchanged:**
- B-R273-PLAYING-TEXT-WITH-RANGE: observed as ruled.
- A-R273-REPEAT-PASTEND: not probed.
- A-R273-TOPLAYHEAD-REWRITE: observed; the result is a true text.

**Close list per task §11:** this PASS supports closing GATE272-S1-LATE-READ, B-R272-STOPPED-TEXT-WHILE-PLAYING, C-R272-01, GATE272-S3-SELECTION-PASTEND-STALE, GATE272-S2-RENDER-REF and INFO-C272-K11. SYS-6 stays in_progress (stage 3, round 274).

## Cleanup
The :5186 HEAD server is stopped, and `/tmp/c273-head` and `/tmp/c273-new` are removed after this report. No app source was touched by C.
