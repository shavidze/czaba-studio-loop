# Round 307: PERF-COMMIT-RESCHEDULE stage a. A pure per-clip schedule diff and a `replaceClips` graph handle method, with unit rows and mutants; no runtime change yet

**Planned by:** B, at the round 306 → 307 planning, 2026-11-03.

**Decisions** (all in `backlog.json` → `decisions_log_b`):
- D-29z812: round 306 closure. PERF-3d is done and PERF-3 is done (EXIT met). C's notes are ruled: WG5 and MU-NO-PENDING are accepted, and the stale columns off the window are the design. The gate-306 review findings are recorded.
- D-29z813: PERF-COMMIT-RESCHEDULE premise re-measured and its order ruled; the stage is split into a (this round) and b.
- D-29z814: the stage-a contract (§4) and the cases that keep the full rebuild.
- D-29z815: the architecture checkpoint request (`b-round-306-checkpoint-request.md`). It is non-blocking.

**Read first:** `lessons.md` (59 lines). These apply directly: L11 (STOP), L23 (no sketch this round, see §2), L26/L28 (doc), L29/L56 (claims), L37 (premise re-measured), L38 (perf runs alone), L52 (asserts that can fail) and L57 (C harness fields).
- **L29 note:** untagged greps in this task are expected values, new ids, new names or grant text. They are not facts about current code. Facts about `store/` files carry `[K#]`.
- **Loop path:** `tmp/studio-real-loop` is a symlink, so search it with `find -L`.

## Baseline: HEAD `ecb832a`, clean tree
- Gate 306 published `ecb832a` [K1]. HEAD is `ecb832a` and `git status` is empty [K2].
- **Frozen list:** `b-round-306-r307-tree-sha256.txt`, **1,178** entries [K3]. Each of the 7 protected auth/purchase files appears once [K4]. From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-306-r307-tree-sha256.txt` fails only on the §5 modified paths after A's change.

## 0. Why this round
- **Round 306 closed with C PASS** (12 rows, `browserVerified`/`realVerified` true, 0 bugs) and was published as `ecb832a`. **PERF-3 is done.** EXIT was met: the in and out keydown-max medians were 24 ms, the wheel LoAF median 0 and the commit max 1. No Critical, High or Medium finding is open on the Studio. REGRESSION is due on or after 2026-11-05 (`regression-last.json`: round 301, 2026-11-02), so not now. The next RETRO is at round 320.
- **Next in `STUDIO-PERFORMANCE`** (`execution_order_d29z673`) is **PERF-COMMIT-RESCHEDULE**. When a clip edit is committed during playback, today the whole graph is rebuilt and every clip restarts: `syncPlayback` [K9] sees a changed `scheduleKey` [K8] and calls `startGraph` [K9]. The backlog note says to measure first and claim after.
- **Premise (L37), re-measured by B at `ecb832a`** (production build, `b-round-306/probe/release-probe.cjs`, `head-1440.json`, `head-1280.json`):
  - With 30 clips, every release (fade drag, trim drag and each Ctrl+Z) calls `start()` 30 times. The burst spans 0.4–0.8 ms.
  - LoAF is 0 in the 800 ms after the release, and the largest pointerup/keydown Event Timing is 32 ms.
  - So the **main-thread cost is immaterial**. What remains is the audio side: about 60 sources around each edit, a number that grows with the clip count, plus the splice itself. Neither has been measured yet. B's continuity probe attempt was invalid: its drag did not commit (`consults.md`).
- **Ruling (D-29z813):** keep the stage in its place and split it. **Stage a (this round)** builds the tested pieces and changes no runtime path. **Stage b** wires them into `syncPlayback`. Before any assert, stage b measures churn and continuity in the browser. If that measurement shows no benefit, the stage closes on that evidence instead of being wired.
- **Consults** (read-only, `b-round-306/consults.md`): `performance-optimizer` and `tech-lead` both endorse the a/b split, a pure diff, and a `replaceClips` handle method. They gave the full-rebuild list and the mutants used below.
- **Reference first / Ableton:** not in scope (performance round). **Screen budget:** nothing visible changes.

## 1. Code facts
- `ScheduleHandle` [K5] has `appendPlan`, `appendClicks`, `stop`, `disconnect`, `setTrackGain`, `setMasterGain`, `setClipGain`, `setTrackPan` and `activeSourceCount`. Every handle comes from `applySchedule` [K5]. No test or app file builds a handle literal [K13], and `appendPlan` is called only in the files listed in [K12].
- Inside `applySchedule`, `clipGainTargets` is already a mutable map, copied from `options.clipGains` [K6]. `startPlan` reads `options.clipFades` and `options.clipEnvelopes` directly, so both are fixed when the handle is created [K6]. A replace would therefore replay the old fade (tech-lead trap).
- `planSchedule(arrangement, from)` [K7] computes the mid-clip offset `clip.sourceOffset + max(0, from − clip.start)` [K7] and drops clips that ended before `from`.
- `scheduleKey` [K8] is `JSON.stringify([clips, loop])` with `gainDb` removed [K8]. Track changes (mute, volume, pan) are not in it and go through the gain path.
- Clip previews (`previewArrangement`) do not call `syncPlayback`. Only the loop-handle preview does, and it always changes the loop (performance-optimizer, verified by B by reading the code). So the incremental path concerns only commits.
- `graph.test.ts` has 19 `it` rows in 394 lines [K14], with fakes `FakeGain`, `FakeSource` (records `starts` and `stops`) and `FakeContext` [K15]. Gate 306 ran it at 19 tests in 19 ms [K19], so timeout headroom is ample (L31).
- The budget row `interact.drag.fade.30.playing.release-restarts` is `record` with no budget [K18]. C round 306 measured it at 30 three times out of three (`c-round-306/perf/perf-1b-i-*.json`).

## 2. B's pre-check
- **No sketch this round.** The change is additive: one new file, one new handle method and a copy of two option maps. No existing test is granted. Any red existing test is a STOP (§9), and that rule replaces the L23 sketch. Rationale: L23 binds mandatory changes that collide with frozen tests, and this round has none [K12, K13].
- B's runtime baseline for C's NO-CHANGE row: `probe/head-1440.json` and `probe/head-1280.json` (30 starts per release, LoAF 0, playing true).

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-306/claims-307.sh` equals `b-round-306/claims-307-head-output.txt`. A difference is a STOP |
| A-UNIT | New `app/lib/arrangement/__tests__/reschedule.test.ts` with rows **RS1–RS10**, and a new top-level `describe('replaceClips', …)` appended after the final `});` of `graph.test.ts` with rows **RC1–RC9** (§6). Then the covering set: `reschedule.test.ts`, `graph.test.ts`, `schedule.test.ts`, `clip-fades.test.ts`, `envelope.test.ts`, `clip-gain.test.tsx`, `video-fades.test.ts`, `metronome.test.ts`, `master.test.ts`, `track-group-mix.test.ts`. All green. Report each file's time; a test above 50 % of its declared timeout is a STOP (L31) |
| A-MUTANTS | On A's own scratch copy (never in `store/`), the seven mutants of §6. Each must be red on its listed rows and green when restored. Log under `a-round-307/` |
| A-TYPE/LINT | `npm run typecheck` rc 0. `npm run lint`: no new finding in a granted path |
| A-REVIEW | `code-reviewer` on the §5 paths (≥ 3 files). For any Medium+ inside the grants, fix it, then re-run the reviewer on the changed lines. A Medium+ regression outside the grants is a STOP. The Architecture note goes to B |
| A-DOC | New `docs/implementation/2026/quarter-IV/224-perf-commit-reschedule.md` (224 is free [K16]). It has TEMPLATE's 7 headings in order (L26), and l.4 exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 307 PASS)` (L28). Content: B's premise numbers with their files, the contract of §4, the full-rebuild list for stage b (§4.4), the rows and mutants, and under TODO the stage-b plan (§10). It cites only rows that exist |

### 3.2 C's rows
C writes `c-round-307.md` and `c-round-307.json` as it goes. The JSON carries the L57 fields. Here `assertsSpecified` = 19 (RS1–RS10, RC1–RC9) and `mutantsRecorded` = 7. Since B ran no sketch, `mutantRedOnSketch` = 0 and C notes that. Each finding carries an `origin`.

**Browser rows** (real Chromium; production builds on their own ports; L38: a warm-up load first, nothing else running):
| Row | Action | Expected |
|---|---|---|
| NO-CHANGE | Copy `b-round-306/probe/release-probe.cjs` to `c-round-307/` and run it on a production build of A's tree at **1440×900 and 1280×720**, once each | Equal in class to B's HEAD files `head-1440.json` / `head-1280.json`: `clips` 30, `playingAtStart` true, every one of the 12 releases has `starts` **30**, `playing` "true", `loafMax` < 50, and `posAfter` > `posBefore`. Stage a must not change runtime behaviour |
| PLAY-SMOKE-307 | On `/studio-lab` (dev server) at both viewports, after `Demo collection ready`: add `Bass` (Enter), Play; after 1.5 s the position is ≥ `00:01.000`; then drag the clip's fade-in handle while playing and check playback continues; export a WAV | Playback continues after the edit (`data-playing` true, position advancing); WAV is RIFF/WAVE, 48 kHz, 16.000 s, peak > 0 |
| G307-AUTH | As G306-AUTH (fresh anonymous context, both viewports, wait for a non-empty body) | `/studio-lab` works with `auth_user` null; `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`; `/api/studio-token` with no header returns 401; no token appears in any body |

**Offline rows:**
- **SOURCE-SCOPE.** `git status --short --untracked-files=all` lists exactly the §5 paths (2 modified, 3 new). `sha256sum -c` fails only on the 2 modified paths. Protected files have no diff. `ArrangementContext.tsx` has no diff. In `graph.test.ts` the diff only appends a top-level `describe` after the final `});`, plus at most one import line (no existing line changed). In `graph.client.ts` existing behaviour is unchanged: the only edits are the new interface member and its implementation, the two copied maps, and `startPlan` reading them.
- **CLAIMS.** Re-run `claims-307.sh`. B ran no sketch, so the expected values after A's change are written here (the "After A" column of §12):
  - K2 `5 ecb832a` (2 modified + 3 new);
  - K6 only the `clipGainTargets` copy line remains (its line may move), because `startPlan` no longer reads `options.clipFades`/`options.clipEnvelopes`;
  - K10 > 0;
  - K11 `present present`;
  - K14 `19 <lines>`: the RC rows sit in a new top-level `describe`, so `^  it\(` still counts 19, and the line count grows;
  - K16 `224-perf-commit-reschedule.md 1`.

  Every other K equals the HEAD output, by content where a granted file moved lines (D-29z793: K5). A different value is a `countMismatches` entry with its K.
- **TESTS-READ.** RS1–RS10 and RC1–RC9 exist with the §6 semantics and their asserts can fail (L52). A's mutant log shows each listed row red.
- **DOC.** Doc 224 per A-DOC.
- **Gate rows** (not claimed by C; list them under `"gate"`): full vitest, build, Biome, `npm run verify`, e2e smoke.

`browserVerified` is true only if NO-CHANGE, PLAY-SMOKE-307 and G307-AUTH all ran at both viewports. **BLOCKED:** none expected; `/studio-lab` needs no backend.

## 4. Contract (D-29z814)

### 4.1 `app/lib/arrangement/reschedule.ts` (new, pure, no DOM or audio)
- `export interface ClipScheduleDiff { changedClipIds: string[] }`.
- `export function diffClipSchedule(previous: Arrangement, next: Arrangement): ClipScheduleDiff | null`. **`null` means "full rebuild".** Return null when:
  1. the loop differs (compare by `JSON.stringify` of `loop`, including added or removed);
  2. the ordered list of track ids differs;
  3. the set of clip ids differs (add, delete, split).
- Otherwise `changedClipIds` lists, in `next.clips` order, every clip whose JSON with `gainDb` removed differs from the clip with the same id in `previous`. The `gainDb` rule matches `scheduleKey` [K8]. A changed `trackId` (onto a track that exists, by rule 2) counts as changed.
- A pure reorder of clips with no field change gives `[]`. This is a deliberate difference from `scheduleKey`, which compares order; reordering does not change the sound.
- `export function planChangedClips(next: Arrangement, changedClipIds: readonly string[], from: number): ScheduledClip[]` returns `planSchedule(next, from)` [K7] filtered to the ids. A clip that ended before `from` yields no item.

### 4.2 `graph.client.ts`: `ScheduleHandle.replaceClips`
- New member: `replaceClips(clipIds: readonly string[], items: readonly ScheduledClip[], from: number, startAt: number, shapes: ReplaceClipShapes): void`. Also add `export interface ReplaceClipShapes { clipGains?: ReadonlyMap<string, number>; clipFades?: ReadonlyMap<string, ClipFadeShape>; clipEnvelopes?: ReadonlyMap<string, ClipEnvelopeShape> }`.
- At handle creation, copy `options.clipFades` and `options.clipEnvelopes` into two mutable maps (like `clipGainTargets` [K6]). `startPlan` reads those maps. Behaviour for every existing call is unchanged.
- `replaceClips` does nothing on a disconnected handle. Otherwise it:
  1. prunes ended states exactly as `appendPlan` does;
  2. stops, at exactly `startAt`, every state whose `clipId` is in `clipIds` and that has not ended and is not already stopped at or before `startAt`, including states scheduled to start after `startAt`. It uses the same try/catch as `stop`, and other clips' states are untouched;
  3. for each id in `clipIds`, sets or deletes its entry in the fade map and the envelope map from `shapes` (present = set, absent = delete), and sets `clipGainTargets` when `shapes.clipGains` has the id;
  4. starts, through `startPlan(…, from, startAt)`, only the `items` whose `clipId` is in `clipIds`.

### 4.3 Not in this round
`ArrangementContext.tsx`, `schedule.ts`, the perf spec, budgets and `perf/lib/**` stay unchanged. No harness row is added. Stage a does not claim the metric (performance-optimizer).

### 4.4 Full-rebuild list for stage b (recorded in doc 224, not built now)
`force`; `removed`; scrubbing; a loop active (`loopScheduleRef`) or `diffClipSchedule` = null; metronome on and `projectEnd` changed. On the incremental path, `scheduledEndRef`/`scheduledKeyRef` (or its replacement) are always refreshed. `from` = `positionAt(anchorRef.current, startAt)` with the existing anchor (no `reschedulePlaybackAnchor`). A 30-clip budget is `<= 1`, not `== 1`, because an edit on a clip before the playhead correctly starts 0 sources (tech-lead).

## 5. Grants
A edits only these paths.

**Modified (2):**
1. `app/lib/arrangement/graph.client.ts`: `ReplaceClipShapes`, the `replaceClips` member of `ScheduleHandle` and its implementation, the two copied maps, and `startPlan` reading them. Imports only if needed.
2. `app/lib/arrangement/__tests__/graph.test.ts`: append one new **top-level** `describe('replaceClips', …)` after the file's final `});`, with its rows written as `it(` inside it, reusing the existing fakes and helpers. It may import `planChangedClips` from `~/lib/arrangement/reschedule` (granted file) to build its items. No existing line changes.

**New (3):**
3. `app/lib/arrangement/reschedule.ts`.
4. `app/lib/arrangement/__tests__/reschedule.test.ts`.
5. `docs/implementation/2026/quarter-IV/224-perf-commit-reschedule.md`.

Nothing else: not `ArrangementContext.tsx`, `schedule.ts`, `fades.ts`, `envelope.ts`, `perf/**`, `vitest.config.ts`, `package.json`, other docs, or any protected file.

## 6. Specified test rows (L52)
**`reschedule.test.ts`.** The fixture is 2 tracks (`music`, `sfx`) and clips `a` (music, 0–10 s, `sourceOffset` 0), `b` (music, 10–20 s, `sourceOffset` 1) and `c` (sfx, 5–15 s, `sourceOffset` 0); no loop, no fades or envelopes. Assert with `toEqual`/`toBe`.

| Row | Change from the fixture | Expected |
|---|---|---|
| RS1 | none (deep copy) | `{ changedClipIds: [] }` |
| RS2 | `b.gainDb` −6 | `[]` |
| RS3 | `b` fade-in 0 → 1 s | `['b']` |
| RS4 | `b` gets an envelope point; separately, `c.start` 5 → 6; separately, `a` trimmed (`duration` and `sourceOffset`) | `['b']`; `['c']`; `['a']` |
| RS5 | loop added; separately, loop end moved | `null`; `null` |
| RS6 | clip `d` added; separately, `c` removed | `null`; `null` |
| RS7 | a third track added; separately, track order swapped | `null`; `null` |
| RS8 | `music` muted and its volume changed (tracks otherwise identical); separately, `clips` reversed | `[]`; `[]` |
| RS9 | `planChangedClips(next, ['b'], 12)` (fixture `b`) | one item: `when` 12, `sourceOffset` 3, `duration` 8 |
| RS10 | `planChangedClips(next, ['a', 'b'], 12)` (`a` ended at 10) and `planChangedClips(next, ['b'], 4)` | `[b]` only; for `from` 4 one item with `when` 10, `sourceOffset` 1 |

**`graph.test.ts` → `describe('replaceClips')`.** Use the existing `FakeContext`/`FakeSource` [K15] (its clock starts at `currentTime = 10`, so every row sets the clock explicitly). Use the `reschedule.test.ts` fixture (3 clips on 2 tracks) with buffers for all three sources. Set `ctx.currentTime = 0`, then call `applySchedule` with `planSchedule(arrangement, 0)`, `from` 0 and `startAt` 1. For a replace, set `ctx.currentTime = 2.9` and call it with `startAt1` = 3 and `from1` = 2. Items come from `planChangedClips(next, ids, from1)`.

| Row | Steps | Expected |
|---|---|---|
| RC1 | `replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, {})`, `next` = the fixture with a changed `b` that still covers `from1` | the old `b` source has `stops` `[3]`; the `a` and `c` sources have `stops` `[]` and exactly 1 start each; exactly one new source exists, with one start `[3, expected offset, expected duration]` |
| RC2 | as RC1 but for clip `a` (sounding: start 0, `sourceOffset` 0; first scheduled at `startAt` 1 with offset 0) | the new `a` source starts at 3 with offset = old offset + (3 − 1) = **2**, within 1e-9 (the splice is sample-continuous) |
| RC3 | `b` starts at 10 s (not yet sounding at 3) | the old `b` source is stopped with `3` and a new `b` source starts with `when` = 3 + (10 − 2) |
| RC4 | `shapes.clipFades` gives `b` a fade-in | the new `b` chain contains a fade gain whose automation equals that of a fresh `applySchedule` with the same shape, `from` 2 and `startAt` 3; then a second replace with no fade for `b` gives a chain without a fade gain |
| RC5 | `items` contains entries for `b` and `c`, `clipIds` = `['b']` | only one new source (for `b`); `c` untouched |
| RC6 | Replace clip `a` (sounding at 2–3 s) instead of `b`. `activeSourceCount()` counts every source that has not ended and is not stopped at or before the clock, scheduled future sources included. (1) First replace of `a` at `startAt` 3 with the clock at 2.9; (2) set the clock to 3.1; (3) fire `onended` on the old `a` source, set the clock to 3.15, and replace `a` again with `startAt` 3.2 and `from` 2.2; (4) set the clock to 3.3 | (1) **4** (the old `a` is active until its stop at 3); (2) **3**; (3) **4**, and the old `a` source and its clip gain have `disconnected` true (pruned); (4) **3**. Under MU-NO-PRUNE, (3) is red because nothing is disconnected |
| RC7 | `shapes.clipGains` sets `b` to 0.5 | the new `b` clip gain value is 0.5; a following `setClipGain('b', 0.5)` schedules nothing |
| RC8 | `disconnect()` then `replaceClips(...)` | no new source, no stop |
| RC9 | replace `b` with a new fade, then `appendPlan([item for b], …)` | the appended `b` chain uses the new fade (the map is shared with `startPlan`) |

**Mutants** (A, on scratch):
- MU-DIFF-FADE: the diff ignores fade fields → RS3 red.
- MU-TRACK-SET: the diff ignores the track list → RS7 red.
- MU-SHAPES-IGNORED: `replaceClips` does not update the fade/envelope maps → RC4, RC9 red.
- MU-STOP-NOW: stop at `ctx.currentTime` instead of `startAt` → RC1 red.
- MU-SOUNDING-ONLY: stop only states whose scheduled start is ≤ `startAt` → RC3 red.
- MU-NO-PRUNE: no pruning of ended states → RC6 red.
- MU-ID-FILTER: start every item → RC5 red.

## 7. A's order of work
1. A-CLAIMS.
2. `reschedule.ts` and its test.
3. The `graph.client.ts` change and the RC block.
4. Typecheck, lint, A-UNIT.
5. A-MUTANTS on scratch.
6. Doc 224.
7. `code-reviewer`, re-reviewing after any later change.
8. Write `a-round-307.md` as you go: per-row results, the mutant table, claims after the change, and the reviewer's Architecture note.

## 8. Neighbouring behaviour at risk (C probes)
- **Every existing playback path** goes through `startPlan`, which now reads copied maps. Covering tests and NO-CHANGE confirm that nothing moved (30 starts per release, playback continuous). Export uses `applySchedule` too (`renderArrangementWav`), so PLAY-SMOKE-307 exports a WAV.
- **Loop refill** (`appendPlan`) now reads the shared fade map. RC9 and the existing `appendPlan` rows (`clip-fades`, `envelope`, `clip-gain` [K12]) stay green.

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-307.md` and changes nothing else when:
- A-CLAIMS differs from `claims-307-head-output.txt`;
- a change is needed outside §5 (including `ArrangementContext.tsx` or `schedule.ts`);
- any existing test turns red;
- a mutant stays green;
- a covering test is above 50 % of its timeout;
- typecheck fails or lint has a new finding in a granted path;
- the reviewer reports a Medium+ regression outside the grants.

## 10. Next
- C PASS + gate → **stage b**. Its contents:
  - wire `syncPlayback` to `diffClipSchedule`/`replaceClips` with the §4.4 list, using `ArrangementContext.tsx` (one owner);
  - harness rows `interact.drag.trim.30.playing.release-restarts` (record; HEAD 30 per B's probe) and the release rows performance-optimizer named (`release-event-ms`, `release-active-sources-peak`), then assert `<= 1` on the 30-clip rows;
  - a C browser row for audio continuity: a destination tap with an edit on a non-sounding clip while another sounds, with a fixed probe.
  - **Move with 30 clips:** the Ctrl+D copies are adjacent and `moveClip` refuses overlaps, so clip 1 cannot move right. B's attempt on the last clip did not commit. Stage b covers move with a context unit row and a 2-clip-with-gap browser row, and records the shared `applyEdit` → `syncPlayback` funnel as the inference.
- If stage b's measurement shows no churn or continuity benefit, B closes PERF-COMMIT-RESCHEDULE on that evidence (D-29z813).
- A C FAIL on a Medium+ comes first. A Low goes to `deferred_low_polish` unless this round owns the code.
- For root: ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) is still open. ARCH-CHECKPOINT-STUDIO-LINK, D-29z811 and the new request `b-round-306-checkpoint-request.md` are unanswered, and none of them blocks.

## 11. Commit readiness
After C PASS and the gate, root publishes the §5 paths.

## 12. Claims (L29 + L56)
Run `bash b-round-306/claims-307.sh` from the loop root. HEAD output: `b-round-306/claims-307-head-output.txt`.

| Tag | Claim | Expected at HEAD | After A (if different) |
|---|---|---|---|
| K1 | gate 306 published `ecb832a` | `published ecb832a` | — |
| K2 | clean tree, HEAD | `0 ecb832a` | `5 ecb832a` |
| K3 | frozen entries | `1178` | — |
| K4 | each protected file once | `1 1 1 1 1 1 1` | — |
| K5 | `ScheduleHandle` l.72, `appendPlan` l.73, `activeSourceCount` l.81, `applySchedule` l.168 | four hits | — |
| K6 | `clipGainTargets` copy l.204; `startPlan` reads `options.clipFades` l.218 and `options.clipEnvelopes` l.226 | `204 218 226` | only the `clipGainTargets` copy line |
| K7 | `planSchedule` l.68; mid-clip offset expression once | `68 1` | — |
| K8 | `scheduleKey` l.633; `gainDb` excluded once | `633 1` | — |
| K9 | `startGraph` l.1027, `syncPlayback` l.1235 | `1027 1235` | — |
| K10 | new identifiers absent | `0` | > 0 |
| K11 | new files absent | `absent absent` | `present present` |
| K12 | files calling `appendPlan` | 6 files (output file) | — |
| K13 | no handle literal or class | `0` | — |
| K14 | `graph.test.ts` `it` rows and lines | `19 394` | `19` and more lines |
| K15 | fakes in `graph.test.ts` | `FakeGain` l.43, `FakeSource` l.51, `FakeContext` l.64 | — |
| K16 | last doc number; 224 free | `223-perf-waveform-window.md 0` | `224-perf-commit-reschedule.md 1` |
| K17 | round-306 archive equals the old task | `archive-equal-306` | — |
| K18 | fade.30 release-restarts row | `record None` | — |
| K19 | gate-306 `graph.test.ts` time | `19 tests) 19ms` | — |
| K20 | every cited artifact exists (L56) | `done` | — |
