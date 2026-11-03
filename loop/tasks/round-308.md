# Round 308: PERF-COMMIT-RESCHEDULE-b-close. C confirms in the browser that today's full rebuild is sample-continuous; A hardens the unused `replaceClips` path (stop never moves later, required shapes) and closes doc 224

**Planned by:** B, at the round 307 → 308 planning, 2026-11-03.

**Decisions** (all in `backlog.json` → `decisions_log_b`):
- D-29z816: round 307 closure. Stage a is done (C PASS, gate published `d8e5ce5`). The gate-307 review findings F1–F5 and C's INFO notes are ruled (§1).
- D-29z817: **PERF-COMMIT-RESCHEDULE closes on evidence**, as D-29z813 allowed. Wiring (stage b) is not dispatched. The close becomes final when C reproduces the evidence (§3.2). If C hears a click, the stage reopens as b-ii wiring.
- D-29z818: **keep stage a as prepared code, and harden it now.** The stop guard, the required shape fields and a TODO that points at doc 224.
- D-29z819: what was **not** measured. These are inferences, not facts (policy rule 8). See §0.

**Read first:** `lessons.md`. These apply directly: L11 (STOP), L26/L28 (doc), L29/L56 (claims), L31 (timeouts), L37 (premise measured), L38 (perf and audio probes run alone), L52 (asserts that can fail) and L57 (C harness fields).
- **L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`.
- **Loop path:** `tmp/studio-real-loop` is a symlink, so search it with `find -L`.

## Baseline: HEAD `d8e5ce5`, clean tree
- Gate 307 published `d8e5ce5` [K1]. HEAD is `d8e5ce5` and `git status` is empty [K2].
- **Frozen list:** `b-round-307-r308-tree-sha256.txt`, **1,181** entries [K3]. Each of the 7 protected auth/purchase files appears once [K4]. From `store/`, after A's change, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-307-r308-tree-sha256.txt` fails only on the 3 granted paths of §5.

## 0. Why this round
- **Round 307 closed with C PASS** (7 rows, `browserVerified`/`realVerified` true, 0 bugs). Gate 307 published `d8e5ce5`. No Critical, High or Medium finding is open on the Studio. REGRESSION is due on or after 2026-11-05 [K15], so not now. The next RETRO is at round 320.
- D-29z813 required stage b to **measure audio churn and continuity before any wiring**, and to close the stage if there was no benefit. B ran those measurements at planning on HEAD `d8e5ce5` (dev server, real Chromium, an AudioWorklet tap on the real output). Probe: `b-round-307/probe/continuity-probe.cjs`.
  - **1 clip** (Bass): play, then at about 2.5 s drag the clip's **fade-out** handle. That handle is far from the playhead, so the gain at the playhead does not change. The release restarts 1 source. In 6 of 6 valid runs (3 per viewport), the largest sample step within −3…+10 ms of the splice was **0.0016–0.0019**. The 99.9th percentile of the steps in the second before the splice was **0.0035**. No dropout: the longest zero run was 0 samples. RMS in the 20 ms after the splice was 0.79–1.08× the 20 ms before. In every run the largest step sat 114–399 samples away from the splice, so it came from the stem's content and not from the splice (`continuity-head-dev.json`).
  - **30 clips** (Add + 29× Ctrl+D, same edit on clip 1): the release restarts **30** sources. In 6 of 6 valid runs the largest splice step was **0.0013–0.0015**, against the same 0.0035 baseline, with zero-run 0, RMS ratio 0.77–0.90, and the largest step 45–441 samples away from the splice (`continuity-head-dev-30.json`) [K13].
  - **Chromium `ended`** (`probe/onended-probe.json`) [K12]: a source stopped before its start fires `ended` at the stop time (0.311 s). A second, later `stop()` wins (`ended` at 0.908 s, no throw). The second fact confirms gate-307 finding F1.
  - The round-306 premise was main-thread cost of 0.4–0.8 ms per 30-start burst, LoAF 0 and Event Timing ≤ 32 ms. Round 307's NO-CHANGE confirmed it on A's tree.
- **Conclusion (D-29z817):** today's full rebuild has no measured cost on the main thread and no audible discontinuity at 1 or 30 clips. Wiring per-clip replace would cut start() calls from 30 to ≤ 1 with no user-visible gain. The stage closes on evidence. PERF-COMMIT-RESCHEDULE was a planner candidate (doc 168 PERF candidates and the tech-lead consult of 2026-10-28), not an item of Saba's `perf-plan.md`, so closing it removes nothing from user scope.
- **Not measured (D-29z819, inferences):**
  - an edit on a sounding clip while many other clips also sound (inferred to cost about the same as pressing Play, which starts the same sources);
  - `ended` in Firefox and Safari;
  - a gain-changing edit at the playhead (a legitimate gain step on either path, so it does not tell the two apart).
- **Why harden code that has no caller (D-29z818):** stage a is reviewed, published and covered by tests, and STEM-LANES or phase 2 may want a per-clip reschedule. But gate finding F1 is a trap for any future caller: `stop(when)` can move a stop set by `replaceClips` **later**, and in Chromium the later stop wins [K12]. Fixing it now costs about 2 lines and 2 rows. The fix is behaviour-neutral for today's callers (§1).
- **Reference first / Ableton:** not in scope (performance round). **Screen budget:** nothing visible changes.

## 1. Code facts and rulings
- `stop(when)` in `applySchedule` skips a state only when `state.ended || (state.stopAt !== null && state.stopAt <= ctx.currentTime)`. The clip loop is at l.323 and the click loop at l.337 [K5].
- `ReplaceClipShapes` (l.91) has three optional fields: `clipGains`, `clipFades` and `clipEnvelopes` [K6]. `replaceClips` starts at l.417, and its stop at `startAt` is l.442 [K7]. Outside tests, only `graph.client.ts` and `reschedule.ts` name it, so it has no caller [K21].
- **Every `.stop(` caller in `ArrangementContext.tsx`** [K8]:
  - l.1015 `handleRef.current.stop();`, immediate, in `stopGraph`;
  - l.1022 `entry.handle.stop();`, immediate, for the retired graphs in `stopGraph`;
  - l.1093 `previous.stop(stopAt);`, in `startGraph`. Here `stopAt` is `ctx.currentTime` or `startAt`, and the handle is retired at that moment, so it is stopped with a time only once.

  **Ruling:** no caller stops a state at a future time and then asks for a *later* time. An immediate `stop()` is unchanged by the guard below (`when` is undefined, so the bound stays `ctx.currentTime`). So the guard changes no current runtime path. C's NO-CHANGE and CONT rows check this in the browser.
- **Existing test that pins `stop` order:** `metronome.test.ts` M10 calls `handle.stop(21)` and then `handle.stop()` and expects `[21, undefined]` [K14]. Under the guard the immediate stop still moves the stop earlier, so M10 stays green. It is in A's covering set.
- **Gate-307 review rulings (D-29z816):**
  - **F1** (a later `stop()` overrides a `replaceClips` stop): fixed this round (§4.1, RC12/RC13).
  - **F2** (`ended` for stop-before-start): resolved for Chromium by B's probe [K12]. Firefox and Safari remain an inference, recorded in doc 224.
  - **F3** (continuity of the splice): answered for today's runtime by the CONT rows. The splice of a *replace* has no caller, so its probe moves to the doc 224 TODO for any future caller.
  - **F4** (the `gainDb` rule is written twice): moot without wiring. It is recorded in doc 224's TODO.
  - **F5** (asymmetric optional shapes): ruled. `clipFades` and `clipEnvelopes` become required (§4.2).
- **C's INFO notes from round 307:**
  - INFO-C307-K14-COUNT: the claims regex is fixed. K10 counts `it('RC` rows by name.
  - INFO-C307-RC1-WORDING: noted. The archive is not edited. A's assert `[[11, 1, 9]]` is right.
  - INFO-C307-COLD-DEV: C warms each route up before a measured load.

## 2. B's pre-check
- B ran the probes in §0 and the claims script. Its HEAD output is `b-round-307/claims-308-head-output.txt`.
- **No sketch this round.** The guard edit is 2 conditions. The type change touches only test call sites that A wrote in round 307 [K9: 14 call lines end in `, {});`]. No row of another round is affected except M10, which stays green by the reasoning in §1. Any red existing test outside the `replaceClips` describe is a STOP (§9).

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-307/claims-308.sh` equals `b-round-307/claims-308-head-output.txt`. A difference is a STOP |
| A-UNIT | RC12 and RC13 (§6) appended at the end of `describe('replaceClips')`. The call sites in that describe updated for the required fields, with no `expect(` line changed. Then the covering set: `graph.test.ts`, `reschedule.test.ts`, `metronome.test.ts`, `clip-fades.test.ts`, `envelope.test.ts`, `clip-gain.test.tsx`, `master.test.ts`, `track-group-mix.test.ts`, `video-fades.test.ts`, `schedule.test.ts`, `fader-pointer-preview.test.tsx`, `metronome-horizon-ui.test.tsx`. All green. Report each file's time; a test above 50 % of its timeout is a STOP (L31) |
| A-MUTANTS | On a scratch copy (never in `store/`), the 3 mutants of §6. Each is red on its listed rows and green when restored. Logs go under `a-round-308/` |
| A-TYPE/LINT | `npm run typecheck` rc 0. `npm run lint`: no new finding in a granted path |
| A-REVIEW | `code-reviewer` on the 3 granted paths. For a Medium+ inside the grants, fix it and re-review the changed lines. A Medium+ regression outside the grants is a STOP. The Architecture note goes to B |
| A-DOC | Doc 224 updated as one contract (L34). l.4 is exactly `**სტატუსი:** Completed (C round 308 PASS)` (L28). Content: the stage-a work; B's §0 numbers with their files; the close decision and its condition (C reproduces); the not-measured list of §0 as inferences; the stop guard and RC12/RC13 with the mutants; and under TODO, "before any caller of `replaceClips`", the old full-rebuild list (D-29z814 §4.4), the replace-splice continuity probe, the `gainDb` rule (F4), `ended` in Firefox and Safari, and the source-registry extraction (architecture signal). It cites only rows and files that exist |

### 3.2 C's rows
C writes `c-round-308.md` and `c-round-308.json` as it goes, with the L57 fields: `assertsSpecified` = 2 (RC12, RC13) and `mutantsRecorded` = 3. B ran no sketch, so `mutantRedOnSketch` = 0, and C notes that. Each finding carries an `origin`.

**Browser rows.** Real Chromium. Make a production build of A's tree in C's scratch and serve it on its own port. L38 applies: nothing else runs during the CONT and NO-CHANGE runs, and C loads each route once to warm it up before measuring.

| Row | Action | Expected |
|---|---|---|
| CONT-1 | Copy `b-round-307/probe/continuity-probe.cjs` to `c-round-308/` and run `node continuity-probe.cjs <prodBase> <out> 3 1` | Both viewports, 3 **valid** runs each. Sync budget: 3 valid plus at most 2 replacements for runs invalid because of the environment. `valid` is the probe's own flag: the clip count, the fade-out committed, `data-playing` true, starts ≥ 1, the splice inside the capture, and ≥ 20 ms of contiguous capture on both sides. In every valid run: `starts` 1 and no **click** (rule below) |
| CONT-30 | As CONT-1 with the last argument `30` | As CONT-1 but `starts` **30** and `clips` 30 |
| ENDED | Copy and run `b-round-307/probe/onended-probe.cjs` | `stopBeforeStart` is a number (`ended` fired). `stopTwiceLaterWins` ≥ 0.85 (the later stop won). `secondStopThrew` false |
| NO-CHANGE | Copy `b-round-306/probe/release-probe.cjs` and run it on the same production build at 1440×900 and 1280×720, once each | Same class as round 307's `c-round-307/probe/a-1440.json`/`a-1280.json`: `clips` 30, `playingAtStart` true, all 12 releases with `starts` 30, `playing` "true", `loafMax` < 50, and `posAfter` > `posBefore` |
| PLAY-SMOKE-308 | Run `c-round-307/smoke/smoke307.cjs`, copied, on `/studio-lab` (dev server) at both viewports | As round 307: playback continues after the fade-in edit, and the WAV is RIFF/WAVE, 48 kHz, 16.000 s, with peak > 0 |
| G308-AUTH | As G307-AUTH (`c-round-307/auth/g307-auth.cjs`, a fresh anonymous context, both viewports) | `/studio-lab` works with `auth_user` null. `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`. `/api/studio-token` with no header returns 401. No token appears in any body |

**Click rule for CONT-1 and CONT-30.** A real splice discontinuity is sample-accurate, so it sits at the splice. Content transients do not; in B's runs the largest step sat 45–441 samples away. C classifies each valid run as follows:
- **Click (FAIL):**
  - `zeroRunMaxSamples` > 0; or
  - `spliceMaxDiff` > `baseP999` **and** `|spliceMaxAtSamples|` ≤ 3; or
  - `spliceMaxDiff` > `baseMax`.
- **Inconclusive:** `baseP999` < `spliceMaxDiff` ≤ `baseMax` with `|spliceMaxAtSamples|` > 3, or an RMS ratio `rmsAfter20 / rmsBefore20` outside [0.6, 1.4]. C logs the run and replaces it within the sync budget. It is neither a PASS nor a FAIL. If the budget runs out, the row is inconclusive and `browserVerified` stays true only if the row ran.
- **No click (PASS):** every other valid run.

A click makes the row **FAIL with origin "runtime (HEAD)"**, not A's work. C keeps every run, including invalid and inconclusive ones. B then reopens PERF-COMMIT-RESCHEDULE as b-ii wiring (D-29z817).

**Offline rows:**
- **SOURCE-SCOPE.** `git status --short --untracked-files=all` lists exactly the 3 §5 paths, all modified and none new. `sha256sum -c` fails only on those 3. The protected files, `ArrangementContext.tsx`, `reschedule.ts` and `metronome.test.ts` have no diff. In `graph.test.ts`, lines before `describe('replaceClips'` (l.397 [K9]) are unchanged; inside the describe, no `expect(` line is removed or changed and no `it(` row is removed.
- **CLAIMS.** Re-run `claims-308.sh`. After A, the expected changes are:
  - K2 `3 d8e5ce5`;
  - K5 empty (the old guard text is gone from both loops) and the new guard is present twice;
  - K6 shows `clipFades:` and `clipEnvelopes:` without `?`, with `clipGains?` unchanged;
  - K9: l.397 unchanged, the `, {});` count below 14, and the `replaceClips(` count ≥ 19;
  - K10 `13 2`;
  - K11 `**სტატუსი:** Completed (C round 308 PASS)`;
  - K18 `1 0`.

  Every other K equals the HEAD output, by content where a granted file moved lines (K7). A different value is a `countMismatches` entry with its K.
- **TESTS-READ.** RC12 and RC13 exist with the §6 semantics, and their asserts can fail (L52). A's mutant log shows each listed row red. C may add its own mutant.
- **DOC.** Doc 224 per A-DOC.
- **Gate rows** (C does not claim them; list them under `"gate"`): full vitest, build, Biome, `npm run verify` and the e2e smoke.

`browserVerified` is true only if CONT-1, CONT-30, ENDED, NO-CHANGE, PLAY-SMOKE-308 and G308-AUTH all ran (both viewports where the row says so). **BLOCKED:** none expected; `/studio-lab` needs no backend.

## 4. Contract (D-29z818)

### 4.1 Stop never moves later
In **both** loops of `stop(when)` (clips and clicks), the skip condition becomes:

`state.ended || (state.stopAt !== null && state.stopAt <= (when ?? ctx.currentTime))`

So a stop can move earlier (an immediate `stop()`, or an earlier `when`) but never later. Everything else in `stop` stays as it is, including how `state.stopAt` is set, the try/catch, and `ended` on an immediate stop.

### 4.2 Required shapes
In `ReplaceClipShapes`, `clipFades` and `clipEnvelopes` become **required** (`ReadonlyMap`). `clipGains` stays optional. The `replaceClips` semantics do not change: an id absent from a map deletes its fade or envelope, and a missing gain keeps the old target. The implementation may drop the optional chaining (`?.`) on `shapes.clipFades` and `shapes.clipEnvelopes` that becomes unnecessary; that is inside §4.2.

### 4.3 TODO
One line directly above `replaceClips(` in the `ScheduleHandle` interface:

`// TODO: no caller yet; read implementation doc 224 (2026/quarter-IV) before wiring.`

The line stays within 100 characters including its indentation (L5).

(CLAUDE.md allows TODO comments.)

### 4.4 Not in this round
`ArrangementContext.tsx`, `reschedule.ts`, `schedule.ts`, `perf/**`, the budgets (the `fade.30 release-restarts` row stays `record` [K17]) and every other file stay unchanged.

## 5. Grants
A edits only these paths, all already existing:
1. `app/lib/arrangement/graph.client.ts`: §4.1, §4.2 and §4.3 only.
2. `app/lib/arrangement/__tests__/graph.test.ts`: inside `describe('replaceClips')` only. First, change the call-site arguments so they satisfy §4.2: replace `{}` with explicit empty maps, and add the missing map next to an existing one. Second, add new fixture lines if RC13 needs a metronome option. Third, append RC12 and RC13 at the end of the describe. No `expect(` line changes, and no row is removed or renamed.
3. `docs/implementation/2026/quarter-IV/224-perf-commit-reschedule.md`: the whole doc (A-DOC).

Nothing else: no new file, not `metronome.test.ts`, not `ArrangementContext.tsx`, `reschedule.ts`, `perf/**`, `vitest.config.ts` or `package.json`, and no protected file.

## 6. Specified test rows (L52)
Use the existing `describe('replaceClips')` fixture and fakes. `FakeSource.stops` records every `stop` argument.

| Row | Steps | Expected |
|---|---|---|
| RC12 | As RC1: `ctx.currentTime = 0`, apply at `startAt` 1; set the clock to 2.9; `replaceClips(['b'], …, 2, 3, shapes)`; then `handle.stop(3.5)` | the old `b` source has `stops` `[3]` (not `[3, 3.5]`); the `a` and `c` sources and the new `b` source have `stops` `[3.5]` |
| RC13 | A fresh handle over the same clips **with metronome clicks** (`options.metronome`, at least 2 clicks after `from`). Clock 2.9: `handle.stop(3)`, then `handle.stop(3.5)`, then set the clock to 2.95 and call `handle.stop()` | after `stop(3.5)`, every clip and click source has `stops` `[3]`; after the immediate `stop()`, every one has `[3, undefined]` (an earlier stop still applies). Assert that at least one click source exists (L52) |

**Mutants** (A, on scratch):
- MU-CLIP-STOP-LATER: the clip loop keeps `<= ctx.currentTime` → RC12 and RC13 red.
- MU-CLICK-STOP-LATER: the click loop keeps `<= ctx.currentTime` → RC13 red.
- MU-STOP-ONCE: skip any state with `stopAt !== null` → RC13 red (the immediate part), and also `metronome.test.ts` M10 red. Run M10 in this mutant.

## 7. A's order of work
1. A-CLAIMS.
2. §4.1, then RC12/RC13.
3. §4.2 and the call sites, then §4.3.
4. Typecheck, lint, A-UNIT.
5. A-MUTANTS.
6. Doc 224.
7. `code-reviewer`.
8. Write `a-round-308.md` as you go: per-row results, the mutant table, the claims after the change, and the Architecture note.

## 8. Neighbouring behaviour at risk (C probes)
- **Every stop of a playing graph** goes through `stop()`: Stop, a full rebuild on an edit (l.1093), retired graphs, and export's offline render. NO-CHANGE, CONT-*, PLAY-SMOKE-308 (Stop, then export) and M10 cover these.
- **Metronome clicks** use the second loop. RC13 and M10 cover it. `metronome-horizon-ui.test.tsx` is in the covering set.

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-308.md` and changes nothing else when:
- A-CLAIMS differs from `claims-308-head-output.txt`;
- a change is needed outside §5;
- an existing test outside `describe('replaceClips')` turns red, or a row inside it needs an `expect(` change;
- a mutant stays green;
- a covering test is above 50 % of its timeout;
- typecheck fails or lint has a new finding in a granted path;
- the reviewer reports a Medium+ regression outside the grants.

## 10. Next
- C PASS + gate → PERF-COMMIT-RESCHEDULE is **closed on evidence** (`closed_on_evidence_c308`). The next STUDIO-PERFORMANCE stage is **PERF-4** (R2 worker: ETag/304, Range/206, immutable keys, private purchased files). Before dispatch, B locates the worker code, lists the exact header changes (perf-plan rule) and consults `performance-optimizer` and `tech-lead`.
- **REGRESSION** comes first when it is due (on or after 2026-11-05).
- A CONT click → B reopens stage b-ii wiring (D-29z817). A C FAIL on a Medium+ in A's work comes first. A Low goes to `deferred_low_polish` unless this round owns the code.
- For root: ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) is still open. The checkpoint requests ARCH-CHECKPOINT-STUDIO-LINK, D-29z811 and `b-round-306-checkpoint-request.md` are unanswered and non-blocking. The two round-307 Architecture notes are attached to them as signals (no new request).

## 11. Commit readiness
After C PASS and the gate, root publishes the 3 §5 paths.

## 12. Claims (L29 + L56)
Run `bash b-round-307/claims-308.sh` from the loop root (K1–K21). HEAD output: `b-round-307/claims-308-head-output.txt`.

| Tag | Claim | Expected at HEAD | After A (if different) |
|---|---|---|---|
| K1 | gate 307 published `d8e5ce5` | `published d8e5ce5` | — |
| K2 | clean tree, HEAD | `0 d8e5ce5` | `3 d8e5ce5` |
| K3 | frozen entries | `1181` | — |
| K4 | each protected file once | `1 1 1 1 1 1 1` | — |
| K5 | old stop guard in both loops | `323 337` | empty |
| K6 | `ReplaceClipShapes` l.91, three optional fields | as output | `clipFades`/`clipEnvelopes` required |
| K7 | `replaceClips` impl l.417, its stop l.442 | `417 442` | moved by content |
| K8 | `.stop(` callers in `ArrangementContext.tsx` | l.1015, 1022, 1093 | — (no diff) |
| K9 | replaceClips describe l.397; `, {});` lines; `replaceClips(` count | `397 14 18` | `397 <14 ≥19` (RC12 adds one call) |
| K10 | `it('RC` rows; RC12/RC13 | `11 0` | `13 2` |
| K11 | doc 224 l.4 | `In Progress (stage 1 of 2; C round 307 PASS)` | `Completed (C round 308 PASS)` |
| K12 | Chromium `ended` probe | `0.311 0.502 0.908 False` | — |
| K13 | B continuity probes | 6/6 valid each, starts [1] and [30], max step ≤ p99.9, zero run 0 | — |
| K14 | M10 `stop(21)` and `[21, undefined]` | `1 1` | — |
| K15 | last regression date | `2026-11-02` | — |
| K16 | round-307 archive equals the old task | `archive-equal-307` | — |
| K17 | fade.30 release-restarts row | `record None` | — |
| K18 | TODO lines in graph.client.ts / reschedule.ts | `0 0` | `1 0` |
| K19 | gate-307 `graph.test.ts` time | `30 tests) 28ms` | — |
| K20 | every cited artifact exists (L56) | `done` | — |
| K21 | non-test files in `app/` naming `replaceClips`/`diffClipSchedule`/`planChangedClips` | `2` (graph.client.ts, reschedule.ts) | — |
