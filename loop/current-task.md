# Round 272: SYS-6 STATUS-LIFETIME, stage 1. The stopped status tells the truth about Space, and the texts that name the insert marker follow it. Closes B-R253-STALE-PLAYING-STATUS-RESIDUAL, C-R253-01 and C-R254-OBS-01

**Planned by:** B, at the round 271 → 272 planning, 2026-10-30.

**Decisions:**
- D-29z592: round 271 result.
- D-29z593: gate-271 triage.
- **D-29z594: this contract.**
- D-29z595: checkpoint addendum.
- D-29z596: SYS-6 stage 2 and the order.

**Type:** a systemic bug round. It covers 3 tightly related Lows with one root cause, plus the SYS-6 matrix test, in one owner pair: `ArrangementContext.tsx` and the `StudioWorkspace.tsx` stop effect.
- **Reference-first does not apply.** Policy exempts bug-fix rounds.
- **No `product-designer` consult.** There is no new user-visible feature.

**Grants:** `b-round-271-r272-grants.txt`. Everything not granted is frozen.

## Baseline: HEAD `66b570a`, clean tree
`gates/gate-round-271.json` is `published`, commit `66b570add291123a296f87044070804abe73707d`. `git status --short` is empty [K1].

## 1. What changes, and why
**One root cause.** A status text that names the insert marker ("…from here", "…at 00:04.000") is written once and never rewritten when the marker moves. The stop effect then writes "Stopped — Space plays from the insert marker at t" without asking where Space will really start.
- The stop effect compares the status with the playing texts **built from the current marker time** [K2]. When the marker moved without a status write, the match fails and the old "playback continues" text stays.
- `writeInsertMarker` writes no status [K3]. Both `seekTo` [K4] and the Ctrl/Alt+Arrow marker step [K5] go through it. The step is `stepMarker` → `seekTo`, and it writes no status when it succeeds.
- The "can Space play here?" predicate exists only inside `startPlaybackAt` [K6]. Nothing else can ask it.

**Reproduced by B at HEAD `66b570a`** in Chromium at both viewports, with 0 page errors [K12].
- Script: `b-round-271/probe-stale-status.cjs`.
- Results: `b-round-271/probe-stale-status-head.json` and `probe-stale-status-head-stoppedmove.json`.
- Every case starts the same way: the demo stem "pulse" (16 s) on Music, Space, then a lower-zone bars-ruler click while playing.

| Case | Finding | HEAD status after the steps | What Space really does |
|---|---|---|---|
| click → 17.000, Stop | **C-R253-01** | `Stopped — Space plays from the insert marker at 00:17.000.` | refused: `Insert marker (00:17.000) is past the end of the project (00:16.000) — …` |
| click → 16.000 (= end), Stop | **C-R254-OBS-01** | `Stopped — Space plays from the insert marker at 00:16.000.` | plays from 0 (position 00:00.650 after Space) |
| click → 4.000, Ctrl+← (marker → 0, still playing), Stop | **B-R253-…-RESIDUAL** | `Insert marker at 00:04.000 — playback continues, Follow paused. …`, both while playing **and** after Stop | plays from 0 |
| click → 4.000, Ctrl+→ (marker → 16, natural end) | RESIDUAL (natural-end path) | the same stale "playback continues" text | plays from 0 |
| click → 4.000, Stop, then Ctrl+→ while stopped (marker → 16) | same class, found by B; part of RESIDUAL | `Stopped — Space plays from the insert marker at 00:04.000.` | plays from 0 |

**Why we missed it:** this is not a Saba-found issue, so the mandatory section does not apply. Lesson L51 ("lifetime too") was added after rounds 252–254 for exactly this class, and SYS-6 is the systemic task its evidence asked for. No new lesson.

## 2. Reference
- **Reference-first:** not required, because this is a bug-fix round (policy, "Not in scope").
- **The Space/Stop contract** belongs to SABA-B-10a (it replaced D-15; rounds 250–253):
  - Space plays from the insert marker, or from the time-selection start when a selection exists;
  - at the project end it plays from 0;
  - past the end it is refused with `playPastEnd`.
- **This round does not change where Space plays.** It changes only what the status line says.
- **Ableton conformance: does not apply.** Live has no status line with this text. C rates the round "does not apply" and makes no conformance claim.

## 3. The contract (D-29z594)
### 3.1 New pure module `app/lib/arrangement/playback-start.ts` (a behaviour-preserving extraction)
1. **`PlaybackStartOrigin`** moves here. `ArrangementContext.tsx` re-exports it with `export type { PlaybackStartOrigin }`, so every importer keeps compiling [K13].
2. **`resolvePlaybackStart({ requested, arrangement, playbackEndedAt })`** returns `{kind:'empty'} | {kind:'past-end', requested, end} | {kind:'play', requested, from}`.
   - The predicate is HEAD's `startPlaybackAt` l.1335–1353, unchanged [K6]:
     - `projectEnd <= 0` → `empty`;
     - `past-end` when all three hold: no active loop at `requested`; not `endedHere` (|playbackEndedAt − requested| < `ARRANGEMENT_EPS`); and `requested > end + ARRANGEMENT_EPS`;
     - otherwise `play`, with `from = requested >= end − ARRANGEMENT_EPS && !loopActive ? 0 : requested`.
   - `startPlaybackAt` must call it. There must be no second copy of the predicate (C row SRC-ONE-PREDICATE).
3. **`resolveSpaceStartPoint({ insertMarker, range })`** returns:
   - `{origin:'selection', requested: min(range.start, range.end)}` when a range exists;
   - otherwise `{origin:'insert-marker', requested: insertMarker}`.

   This is HEAD's `togglePlayback` branch [K7]. `togglePlayback` must call it.
4. **`insertMarkerStatusKind(text)`** returns `'playing' | 'playing-follow-paused' | 'stopped' | null`.
   - **How it matches:** it extracts the `mm:ss.mmm` time tokens from `text`, re-renders the templates with them, and compares the whole string. A template change then cannot silently stop matching.
   - **The set T** (texts that name the insert marker):

| Kind | Texts (`studioPlaybackStrings`) |
|---|---|
| `playing` | `insertMarkerWhilePlaying(t)` |
| `playing-follow-paused` | `insertMarkerWhilePlayingFollowPaused(t)` |
| `stopped` | `insertMarkerAfterStop(t)`; the new `insertMarkerAfterStopFromStart(t)` and `selectionAfterStop(t)`; `insertMarkerToPlayhead(t)`; `playPastEnd` with subject `startPointInsertMarker`, in both its "past the end" and "at the end" forms |

   Every other text returns `null`. That includes `followPaused`, `followResumed`, `playPastEnd` with subject Selection or Playhead, loading/ready, refusals and edit results.

### 3.2 `describeSpaceStart(): string`, a new field on `ArrangementContextValue` and on both value objects
It reads the live refs:
1. `resolveSpaceStartPoint` from the insert marker and the range.
2. `resolvePlaybackStart` with `playbackEndedAtRef`.

Then, with `time = formatArrangementTime(point.requested)`:

| Plan | Text |
|---|---|
| `empty` | `studioPlaybackStrings.nothingToPlay` |
| `past-end` | `playPastEndMessage(requested, end, origin)`, **the exact text Space would write** |
| `play` with `from !== requested` (at the end, plays from 0) | `insertMarkerAfterStopFromStart(time)` |
| `play`, origin selection | `selectionAfterStop(time)` |
| `play`, origin insert-marker | `insertMarkerAfterStop(time)` (unchanged) |

### 3.3 Rule W: a write of the insert marker keeps a text that names it true
This rule lives in `writeInsertMarker`, the single write point [K3] [K8].
- **When the current status is in T**, it is replaced after the marker write:
  - `playing-follow-paused` → `insertMarkerWhilePlayingFollowPaused(new t)`;
  - otherwise, while playing → `insertMarkerWhilePlaying(new t)`;
  - otherwise (stopped) → `describeSpaceStart()`.
- **When the status is not in T**, nothing changes and `statusSequence` does not move. Use the function form of `setStatus`, which returns the same text [K9].
- **Explicit writes still win.** Some callers write their own status right after the marker write, and their text stays the final text [K8]:
  - `setInsertMarker` while playing;
  - `placeInsertMarkerFromRuler`;
  - `moveInsertMarkerToPlayhead`;
  - `playFrom`'s past-end refusal.

### 3.4 Rule S: Stop (the `StudioWorkspace` effect on `isPlaying` going false [K2])
- If the status is in T, or is `studioViewStrings.followPaused`, the effect writes `describeSpaceStart()`. This replaces the three exact-string comparisons.
- Any other text stays and is not rewritten (FW10 `followResumed` is unchanged).
- The Follow-resume logic in the same effect is unchanged.

### 3.5 Copy: two new `studioPlaybackStrings` formatters, exact
- `insertMarkerAfterStopFromStart: (time) => \`Stopped — the insert marker (${time}) is at the end; Space plays from 00:00.000.\``
- `selectionAfterStop: (time) => \`Stopped — Space plays from the time selection start at ${time}.\``

**Screen budget (L39):** no new persistent element. These are status-line texts that replace an existing text.

**Width (L3):** the longest new text is 82 characters. The same line already shows longer texts at HEAD: the Follow-paused playing text (97) and the past-end refusal (118). Row LT-WIDTH measures it.

### 3.6 Unchanged (each is frozen; a change is a STOP)
- **Where playback starts:** Space, Shift+Space (`continuePlayback`, origin playhead) and the top-strip `playFrom`, including its at-end refusal. That refusal differs from Space's behaviour at the end; the difference is pre-existing, is recorded as signal B-R272-PLAYFROM-END-ASYMMETRY, and is not changed here.
- **Other behaviour:** `seekTo` and `stepMarker`, the Follow modes, and every other status writer.
- **Ruled out of this stage:**
  - edit-result texts: C-R271-01 (the nudge writes no status) goes to SYS-6 stage 2;
  - repeat announcement: GATE270-S2 goes to stage 2. The live span is keyed by `statusSequence` [K10], so the reviewer's claim needs a probe first;
  - the snap-paused note INFO-C248-STALE-NOTE is carried to stage 2;
  - loading, ready, refusals and seed are not in T and stay untouched.
- **Focus:** no element moves or unmounts. The L50 grep is not required; that is the ruling.

### 3.7 L51 clobber and lifetime list
**Writes that can land on the same line, in real order:**
1. **Ruler click while playing:** W → `setInsertMarker`'s `insertMarkerWhilePlaying` → `placeInsertMarkerFromRuler`'s Follow-paused text. The Follow-paused text is final; IM4 and the bars-ruler FW rows already pin it.
2. **Ctrl+Shift+Space:** W → `insertMarkerToPlayhead(t)`, which is final.
3. **Ctrl+Arrow while playing with a T text:** W only. The final text is the playing form with the new time.
4. **Natural end right after a W:** the playing text, then S at the end. The final text is `describeSpaceStart()` (B probe "residual").
5. **Loading and ready:** no T text can exist yet, so nothing is touched.

**Lifetime:**
- **Playing forms** become false on Stop (cleared by S) and on a marker move (cleared by W).
- **Stopped forms** become false on a marker move (cleared by W).
- **Stopped forms also become false when playback starts** (Space or a strip click): `startPlaybackAt` writes nothing on success, so "Stopped — …" stays while `data-playing` is true. It is pre-existing at HEAD (B probe `probe-stale-status-head.json`, atEnd `afterSpaceAgain`). **Ruled: out of stage 1.** It is recorded as **B-R272-STOPPED-TEXT-WHILE-PLAYING** (Low) and scheduled in SYS-6 stage 2, together with the other play-start and edit-result writes. In this round C records it as a known open row and not as a bug of round 272.
- **Range set or cleared** (ruled):
  - setting a range always writes its own range status today; C row LT-RANGE-OWN-STATUS checks this;
  - clearing a range happens through `placeInsertMarker`, which goes through W.

## 4. Grants (exact; also in `b-round-271-r272-grants.txt`)
| Path | What may change |
|---|---|
| `app/lib/arrangement/playback-start.ts` | **new**: §3.1 |
| `app/contexts/ArrangementContext.tsx` | only these (a ref to `describeSpaceStart` is allowed):<br>• the import<br>• `PlaybackStartOrigin` → re-export<br>• `startPlaybackAt`: predicate → resolver<br>• `togglePlayback`: branch → `resolveSpaceStartPoint`<br>• the new `describeSpaceStart`, with its interface field, both value objects and their deps<br>• `writeInsertMarker` (Rule W) |
| `app/components/arrangement/StudioWorkspace.tsx` | the import of `insertMarkerStatusKind`; the stop effect's `if` and its write (§3.4). Nothing else |
| `app/lib/arrangement/strings.ts` | the two new formatters (§3.5), placed after `insertMarkerAfterStop`. Nothing else |
| `app/lib/arrangement/__tests__/strings.test.ts` | **additions only:**<br>• `V02B_FORMATTER_SAMPLES.studioPlaybackStrings`: two sample entries<br>• ST11: two exact-text expects<br>B's pre-check shows ST12 fails without the samples. |
| `app/lib/arrangement/__tests__/playback-start.test.ts` | **new**: the PB rows (§5.2) |
| `app/lib/arrangement/__tests__/status-lifetime.test.tsx` | **new**: the SYS-6 matrix, the LT rows (§5.2) |
| `docs/implementation/2026/quarter-IV/203-sys-6-status-lifetime-stage-1.md` | **new doc**. l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 272 PASS)` (L28: SYS-6 has 2 stages) |

**Frozen:** every other file, in particular:
- `bars-ruler-ui.test.tsx`, `insert-marker-ui.test.tsx` and `ArrangementContext.test.ts`, which must pass unchanged;
- `ArrangementMarkerRow.tsx`, `model.ts`, `loop.ts` and `shortcuts.ts`;
- `package.json`, `perf/**` and `e2e/**`.

**Protected (auth and purchase):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts` and `app/contexts/AuthContext.tsx`.

## 5. Tests
### 5.1 Tests that change
Only `strings.test.ts` changes, and only by additions (§4). No existing assertion is removed or rewritten. B's pre-check found exactly 1 collision, ST12, and the additions fix it (§6).

### 5.2 New rows
- **Ids:** no `it('PB…` or `it('LT…` exists under `app` [K11].
- **Timeout:** the new describe in `status-lifetime.test.tsx` gets `{ timeout: 15_000 }`, as in `bars-ruler-ui`.

**`playback-start.test.ts` (pure):**
- **PB1** an empty arrangement → `empty`.
- **PB2** requested 17, end 16, no loop → `past-end` {17, 16}.
- **PB3** requested 16 (= end) → `play`, from 0. Also requested 15.99995 (within EPS) → from 0.
- **PB4** requested 4 → `play`, from 4.
- **PB5** requested 17 with an enabled loop 16.5–18 containing it → `play`, from 17.
- **PB6** requested 17 with playbackEndedAt 17 (`endedHere`) → `play`, from 0.
- **PB7** `resolveSpaceStartPoint`: range {6, 2} → selection, 2; no range → marker.
- **PB8** `insertMarkerStatusKind`:
  - each T text returns its kind. This includes both `playPastEnd` insert-marker forms, built through `studioPlaybackStrings` with real times;
  - `followPaused`, `followResumed`, `playPastEnd` with subject Selection or Playhead, `nothingToPlay` and `Demo collection ready…` return `null`;
  - a T text with one character changed returns `null`.

**`status-lifetime.test.tsx` (jsdom, the full workspace):**
- **Setup:** copy the mount and stub pattern of `bars-ruler-ui.test.tsx`; do not import the frozen file. Every row starts from a 16 s project.
- **Asserts:** each row asserts the **exact final text** (L51), `isPlaying`, and `statusSequence` where stated.
- **L52:** before any "while playing" read, the row advances the clock and asserts that the position moved.

| Row | Steps | Expected |
|---|---|---|
| **LT1** (C-R253-01) | play; lower-zone click → 17 (Snap off, or a click past the end); Space (stop) | exactly `playPastEndMessage(17, 16, 'insert-marker')`. Then Space: `isPlaying` false, the same string, and `statusSequence` +1 (re-announced) |
| **LT2** (C-R254-OBS-01) | marker → 16 while playing; Stop | `insertMarkerAfterStopFromStart('00:16.000')`. Then Space: playing, and the position is < 1 s after a 0.5 s advance |
| **LT3** (RESIDUAL, manual stop) | play; click → 4; Ctrl+← | while still playing: `insertMarkerWhilePlayingFollowPaused('00:00.000')`. After Stop: `insertMarkerAfterStop('00:00.000')` |
| **LT4** (RESIDUAL, natural end) | play; click → 4; Ctrl+→ (the marker goes to 16 and the playhead reaches the end) | after the end: `insertMarkerAfterStopFromStart('00:16.000')`. No existing jsdom row drives a natural end (B grep). If the harness cannot reach `tick`'s end branch, A writes LT4 as the Rule S unit at the effect level (status = the T text, `isPlaying` → false) and reports it. The natural-end path is then browser-only, through B-RESIDUAL-END. This is not a STOP |
| **LT5** (the stopped sibling) | play; click → 4; Stop (`insertMarkerAfterStop('00:04.000')`); Ctrl+→ | `insertMarkerAfterStopFromStart('00:16.000')`. Then Ctrl+← → `insertMarkerAfterStop('00:00.000')` |
| **LT6** (the refusal text follows the marker) | the LT1 state; then Home | `insertMarkerAfterStop('00:00.000')`, and Space then plays |
| **LT7** (Follow off) | Follow off; play; click → 6; Ctrl+← | `insertMarkerWhilePlaying('00:00.000')` (not the Follow-paused form). After Stop: `insertMarkerAfterStop('00:00.000')` |
| **LT8** (selection origin, guard) | a stopped T text; then a time selection 2–5 set through the context API `setTimeRange`, which writes no status [K16]; then a marker write through `seekTo` | `selectionAfterStop('00:02.000')`. A guard row for §3.2's selection branch |
| **LT9** (texts outside T are untouched) | status `followResumed` (FW10 recipe), then Ctrl+←; also status `Demo collection ready…`, then Ctrl+→ | in both cases the text is unchanged **and** `statusSequence` is unchanged |
| **LT10** (an explicit write wins: clobber) | play; Ctrl+Shift+Space | the final text is `insertMarkerToPlayhead(t)`, not the W rewrite. Then Ctrl+← while playing → `insertMarkerWhilePlaying(new t)` |
| **LT11** (one predicate) | for markers 4, 16, 17, and 17 inside an enabled loop: Stop, read the text, then Space | Space's outcome matches the text, in order: plays from the marker; plays from 0; refused with the same text; plays from the marker |

### 5.3 What A runs (speed rules)
- **Tests:** `npx vitest run` on these 9 files:
  - `playback-start.test.ts`
  - `status-lifetime.test.tsx`
  - `strings.test.ts`
  - `bars-ruler-ui.test.tsx`
  - `insert-marker-ui.test.tsx`
  - `ArrangementContext.test.ts`
  - `status-announcement-ui.test.tsx`
  - `pending-status.test.tsx`
  - `markers-ui.test.tsx`
- **Checks:** `npm run typecheck`, `npm run lint`, and Biome on the changed files.
- **Review:** the code-reviewer, because 3 or more files change.
- **Not run by A:** the full suite, build and verify. They are gate rows.
- **Headroom (L31):** in gate 271 `verify.log`, `bars-ruler-ui` took 7977 ms for 25 tests and `insert-marker-ui` 7111 ms for 29 tests. No per-test time is above 2.5 s. A reports the slowest LT row.

## 6. B's pre-check (L23); all files in `b-round-271/`
- **Sketch:** `sketch.diff`, applied to a `git archive 66b570a` scratch with a private `node_modules` of symlinks, so `store/` was untouched. `tsc` rc 0, and Biome is clean.
- **Collision sweep:**
  - first sketch: the full vitest gave 3252/3253, and the only failure was ST12 (the formatter samples) (`precheck-vitest.json`);
  - second sketch: it adds the `playPastEnd` kind and moves the classifier into lib (`precheck-vitest-2.json`; the result is in `b-round-271.md` §4).
- **Browser:** the sketch on :5186 against HEAD on :5173, both viewports, 0 page errors (`probe-stale-status-sketch.json` against `-head.json`). Every case in §1 gave the expected text:
  - LT1-like: the refusal text at Stop, identical after Space;
  - LT2-like: the from-start text, and Space plays from 0;
  - LT3-like: `Insert marker at 00:00.000 — playback continues, Follow paused…`, then `Stopped — Space plays from the insert marker at 00:00.000.`;
  - the stopped sibling: the from-start text.
- **Grep roots (L23/L29):** every changed or extended text was grepped in `app/**/__tests__`, `perf/**` and `e2e/**`. The only hits are `bars-ruler-ui`, `insert-marker-ui` and `strings.test` [K14]. All of them pass on the sketch, except ST12.
- **Which sketch was probed:** the browser probe ran against **sketch 1** (`sketch-1.diff`). `sketch.diff` is the final contract (the classifier in lib, the `playPastEnd` kind, the Rule W order of §3.3); the probed cases give the same results under both. **Not browser-probed by B:** the refusal text following the marker (LT6; B-PASTEND then Home). C's row B-PASTEND-HOME covers it.
- **Mutants:** B did **not** pre-run the §7 mutants, because the LT and PB rows do not exist yet. A red-proofs them, and C re-runs them.

## 7. Mutants (A red-proofs them; C re-runs them on its own scratch)
| Mutant | Change | Must turn red |
|---|---|---|
| M-STOP-EXACT | Rule S goes back to HEAD's exact comparison with the current marker time | LT3, LT4 |
| M-NO-W | `writeInsertMarker` without Rule W | LT3, LT5, LT6, LT7, LT10 (second half) |
| M-W-ALWAYS-STOPPED | Rule W always uses `describeSpaceStart()`, even while playing | LT3, LT7, LT10 |
| M-DESCRIBE-MARKER-ONLY | `describeSpaceStart` always returns `insertMarkerAfterStop(time)` | LT1, LT2, LT4, LT5, LT11 |
| M-PRED-COPY | `startPlaybackAt` keeps its own predicate with `>=` instead of `>`; the resolver is unchanged | LT11 (and SRC-ONE-PREDICATE on the source) |
| M-KIND-LOOSE | `insertMarkerStatusKind` matches by the prefix `Insert marker` | PB8 (the one-character case; Selection/Playhead → `null`), LT9 |
| M-SEQ-BUMP | Rule W uses the string form (always writes) | LT9 |
| M-ORIGIN | `resolveSpaceStartPoint` ignores the range | PB7, LT8 |

## 8. C rows (Chromium, `/studio-lab`, 1440×900 and 1280×720, fresh anonymous contexts)
- **Recipe:** B's `b-round-271/probe-stale-status.cjs`.
- **Play state:** read it from `[data-playing]`, never from a Pause label.
- **Wait first:** wait for `Demo collection ready` before any step (L48).

**Scope, claims, tests**

| Row | Check |
|---|---|
| SOURCE-SCOPE / HUNK-SCOPE | exactly the paths and hunks in §4 |
| SRC-ONE-PREDICATE | `grep -rn "ARRANGEMENT_EPS" app/contexts/ArrangementContext.tsx` shows no past-end predicate (`endedHere` / `> end +`) left in `startPlaybackAt`. `grep -rn "resolvePlaybackStart(" app --include=*.ts --include=*.tsx` lists `startPlaybackAt` and `describeSpaceStart` only |
| CLAIMS | re-run §9 at HEAD |
| TESTS-TARGETED, TEST-ADDITIONS, MUTANTS | per §5.3, §5.1 and §7 |

**Browser behaviour**

| Row | Recipe | Expected |
|---|---|---|
| B-PASTEND | §1 row 1 | after Stop the text is exactly `Insert marker (00:17.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.` After Space: not playing, same text |
| B-ATEND | §1 row 2 | after Stop: `Stopped — the insert marker (00:16.000) is at the end; Space plays from 00:00.000.` After Space: playing, position < 00:01.000 |
| B-RESIDUAL-PLAYING | §1 row 3 | after Ctrl+← while playing: `Insert marker at 00:00.000 — playback continues, Follow paused. Stop, then Space plays from here.` After Stop: `Stopped — Space plays from the insert marker at 00:00.000.` |
| B-RESIDUAL-END | §1 row 4 | after the end: the from-start text with 00:16.000 |
| B-PASTEND-HOME | B-PASTEND, then Home | `Stopped — Space plays from the insert marker at 00:00.000.`; then Space plays |
| B-STOPPED-MOVE | §1 row 5 | the from-start text with 00:16.000; then Ctrl+← → `Stopped — Space plays from the insert marker at 00:00.000.` |
| B-UNRELATED | FW10 in the browser: scroll pauses Follow, press Follow, `Follow resumed…`, then Stop | the text is unchanged |
| B-AUDIO | the B-ATEND state | real playback, not only the text: export a WAV, or confirm that the playing position advances from 0 for 1 s |
| LT-RANGE-OWN-STATUS | a time-selection drag on a lane while a T text shows | the drag writes its own range text (records the §3.7 ruling) |
| LT-WIDTH | 1280×720, same session | the status element's box height with the from-start text is ≤ its height with the Follow-paused playing text; no horizontal overflow |

**Guards and docs**

| Row | Check |
|---|---|
| SCREEN-BUDGET | persistent text lines outside the timeline, HEAD against new, in the demo state: equal |
| G272-AUTH | `/studio-lab` loads anonymously; `/studio/<id>` signed out shows "Sign in required"; `/api/studio-token` without a header returns 401 |
| DOC-203 | l.4 byte-exact; the 7 TEMPLATE headings in order (L26); every cited row id exists |
| ARCH-EVIDENCE | `status-lifetime.test.tsx` exists, and its describe names SYS-6. B attaches it to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS question 3 after PASS |

**Gate rows** (C does not claim them): the full vitest, build, full Biome, verify and e2e smoke.

## 9. Claims (L29). Run from `store/` at HEAD `66b570a`
| Tag | Command | Expected |
|---|---|---|
| K1 | `git rev-parse --short HEAD; git status --short \| wc -l` | `66b570a`, `0` |
| K2 | `sed -n 1932,1952p app/components/arrangement/StudioWorkspace.tsx` | the stop effect. l.1938: `marker = formatArrangementTime(Math.max(0, current.getLocatorPosition()))`. l.1940–1942: compare `current.status` with `insertMarkerWhilePlaying(marker)`, `insertMarkerWhilePlayingFollowPaused(marker)` and `FOLLOW_PAUSED_MESSAGE`. l.1944: writes `insertMarkerAfterStop(marker)` |
| K3 | `sed -n 812,818p app/contexts/ArrangementContext.tsx` | `writeInsertMarker` sets the ref and the store only; no `setStatus` |
| K4 | `sed -n 1441,1457p app/contexts/ArrangementContext.tsx` | `seekTo` calls `writeInsertMarker(target)` (l.1453); no `setStatus` |
| K5 | `sed -n 262,293p app/components/arrangement/ArrangementMarkerRow.tsx` | `stepMarker`: a found target → `seekTo(target.time)` (l.288); no status write |
| K6 | `sed -n 1331,1368p app/contexts/ArrangementContext.tsx` | `startPlaybackAt`; the predicate is at l.1335–1353, as quoted in §3.1 |
| K7 | `sed -n 1370,1381p app/contexts/ArrangementContext.tsx` | `togglePlayback`: the range branch → `'selection'`; otherwise `insertMarkerRef.current`, `'insert-marker'` |
| K8 | `grep -n "writeInsertMarker(\|placeInsertMarker(" app/contexts/ArrangementContext.tsx` | 8 lines: 822, 1453, 1462, 1475, 1486, 1493, 1543, 2242 |
| K9 | `sed -n 13,28p app/lib/arrangement/status-announcement.ts` | the function form returns `previous` (no sequence bump) when the text is unchanged |
| K10 | `grep -n "key={statusSequence}" app/components/arrangement/StudioWorkspace.tsx` | 1 hit, l.3141 |
| K11 | `grep -rnE "it\('(PB\|LT)[0-9]+" app \| wc -l` | `0` |
| K12 | copy `../tmp/studio-real-loop/b-round-271/probe-stale-status.cjs` into `c-round-272/` first (it writes its JSON and shots next to itself), then `node c-round-272/probe-stale-status.cjs <HEAD server> c-head` | the HEAD texts in §1, both viewports |
| K13 | `grep -rn "PlaybackStartOrigin" app --include=*.ts --include=*.tsx \| grep -v contexts/ArrangementContext.tsx \| wc -l` | `0`. Only the context uses the type. `playPastEndMessage` is imported by 4 test files and stays in the context |
| K14 | `grep -rlE "insertMarkerAfterStop\|Stopped — Space plays\|playback continues\|insertMarkerWhilePlaying\|insertMarkerToPlayhead" app perf e2e` | 6 files, all under `app`: `StudioWorkspace.tsx`, `strings.ts`, `ArrangementContext.tsx`, and 3 tests (`insert-marker-ui`, `strings.test`, `bars-ruler-ui`); 0 under `perf`/`e2e` |
| K16 | `sed -n 1699,1704p app/contexts/ArrangementContext.tsx` | `setTimeRange` calls `setRange(next)` only; no status write (LT8's premise) |
| K15 | `grep -rc 'setStatus(' app --include=*.ts --include=*.tsx \| grep -v __tests__ \| grep -v ':0$'` | 9 files: ArrangementClip 15, ArrangementClipEnvelope 5, StudioWorkspace 49, ArrangementDetailPanel 19, ArrangementLane 2, ArrangementMaster 1, ArrangementGroupHeader 1, ArrangementMarkerRow 16, ArrangementContext 73. This stage covers the transport class only (§3.6) |

## 10. STOP conditions (L11)
- A frozen or covering test fails: `bars-ruler-ui`, `insert-marker-ui`, `ArrangementContext.test`, or any other covering file.
- A clause conflicts with HEAD's behaviour for where Space plays.
- A covering test runs above 50 % of its timeout.
- The reviewer shows a Medium+ regression that is outside the grants.

## 11. After C PASS
- **Close** B-R253-STALE-PLAYING-STATUS-RESIDUAL, C-R253-01 and C-R254-OBS-01, and remove them from `deferred_low_polish` (L7).
- **SYS-6 stays `in_progress`.** Stage 2 (round 273, D-29z596):
  - C-R271-01: the nudge status;
  - GATE270-S2: the repeat announcement, after first probing the claim against the keyed span;
  - B-R272-STOPPED-TEXT-WHILE-PLAYING, the play-start lifetime (§3.7);
  - INFO-C248-STALE-NOTE, carried;
  - doc 203 l.4 → `Completed`.
