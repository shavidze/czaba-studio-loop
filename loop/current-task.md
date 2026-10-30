# Round 274: SYS-6 STATUS-LIFETIME, stage 3 (of 3, final). An arrow-key nudge states its result, so the line no longer keeps a stale "Move clip …" or "… added … at 00:00.000" text. Closes C-R271-01-NUDGE-STALE-STATUS; closes GATE270-S2-REPEAT-ANNOUNCE as not reproducible; closes SYS-6

**Planned by:** B, at the round 273 → 274 planning, 2026-10-30.

**Decisions:**
- D-29z601: round 273 result.
- D-29z602: gate-273 triage and the C/A notes.
- **D-29z603: this contract.**
- D-29z604: order after this round (RETRO 275), the checkpoint addendum, SYS-6 close.

**Type:** a bug round on one owner function, `nudgeSelectedClip` in `ArrangementContext.tsx`, plus one formatter in `strings.ts`.
- **What it covers:** one Low (C-R271-01) whose class is "an edit that writes no result text leaves the previous text standing, now false". Both success paths of the one function (single clip and group) have it.
- **Reference-first does not apply.** This is a bug-fix round. Live has no status line, so Ableton conformance is "does not apply". The nudge itself (arrow keys move the selection by the grid) is unchanged.
- **No `product-designer` consult.** There is no new feature and no new persistent element. The new text is one status-line string (L39: no new line, see SCREEN-BUDGET).

**Grants:** `b-round-273-r274-grants.txt`. Everything not granted is frozen.

## Baseline: HEAD `52b17e4`, clean tree
`gates/gate-round-273.json` is `published`, commit `52b17e4ef77300a8f13f9babba9d3ea9a9d1c0c6` [K1]. Its `head` field `b288be7` is the pre-commit HEAD.

## 1. What changes, and why
B reproduced every row at HEAD `52b17e4` in Chromium at 1440×900 and 1280×720 with 0 page errors (`b-round-273/probe-r274-head.json`; script `b-round-273/probe-r274.cjs`). Demo: the 16 s demo stem "pulse" added to Music at 00:00.000. Snap is on with grid 1/2 at 120 BPM, so one arrow step is 1 s.

| # | Recipe (probe scenario) | HEAD | After this round (B's sketch, `probe-r274-sketch.json`) |
|---|---|---|---|
| 1 | **C-R271-01, single** (`nudgeSingle`). Add the clip, click its header, ArrowRight | clip at 1.000, Undo title `Undo: Nudge clip (Ctrl+Z)`, but the line still reads `“…” added to the Music track at 00:00.000. …` (**0 status mutations**) | `Nudge clip: start 00:01.000.` |
| 1b | the same, then three held ArrowRight keydowns (`repeat` true on the 2nd and 3rd), then ArrowLeft | clip 4.000, then 3.000; the line is unchanged (0 mutations) | `Nudge clip: start 00:04.000.` after the hold (one new text per step), then `Nudge clip: start 00:03.000.` |
| 2 | **C-R271-01, group** (`nudgeGroup`). Add the stem twice (at 0 and 16), Ctrl+A, ArrowRight | both clips move +1; the line still reads `“…” added to the Music track at 00:16.000 (nearest free spot).` | `Move (2): 2 clips moved 00:01.000 to the right.` |
| 3 | **A-R273-REPEAT-PASTEND** (`repeatPastEnd`). Marker at 17, Space (refused: `Insert marker (00:17.000) is past the end …`), click the clip header, hold ArrowRight for 3 steps | Rule R re-derives the T text at each step: `Stopped — the insert marker (00:17.000) is at the end; …`, then `Stopped — Space plays from the insert marker at 00:17.000.` (4 mutations) | `Nudge clip: start 00:01.000.` → `…00:02.000.` → `…00:03.000.` (the edit-result text wins, §2.3) |

**B probed and ruled two premises before writing this contract (L29 premise claims):**
- **GATE270-S2-REPEAT-ANNOUNCE is not reproducible.** Its premise was "the keep branch writes the same string, so React skips the update".
  - At HEAD, a string write always bumps the sequence when no gesture is active [K6], and the live region re-keys its span on the sequence [K7].
  - In the browser at 1440×900 (`detailEnterTwice`): pressing Enter twice in the Detail range Start field with unchanged values gives **2 mutations per Enter** (span removed, span added). Enter twice in Clip Gain (`Clip Gain unchanged: 0.0 dB.`) gives the same.
  - The existing rows SK8 and SK12 already pin "re-announced once per press" [K8].
  - At 1280×720 the Start field had a zero box in that recipe (`startVisible: false`). **Cause, measured (`detail1280`):** at 1280×720 the Clip details panel is collapsed by default (36 px tall, an `Expand` button; the content and the Start field have 0×0 boxes), while at 1440×900 it is open (144 px) [K19]. This is the existing collapsed default, not a finding. C presses `Expand` first at 1280.
  - **No code change; the finding closes.**
- **B-R273-PLAYING-TEXT-WITH-RANGE is real; it stays Low and is deferred.** Scenarios `playingWithRange` and `ctrlLeftRangeStop`, both viewports:
  - While playing, draw a range 2–5, then press Ctrl+←. The line says `Insert marker at 00:00.000 — playback continues. Stop, then Space plays from here.`, and the range is still there.
  - Stop gives the true `Stopped — Space plays from the time selection start at 00:02.000.`, and Space then plays from 2.56.
  - The false clause lives only while playing.
  - A true fix needs two new templates (plain and Follow-paused) and two classifier kinds, which is more than one bug in this round. It moves to `deferred_low_polish` with this repro (D-29z602). **Not part of this round.**

## 2. The contract (D-29z603)
B's sketch: `b-round-273/sketch.diff`, applied to a `git archive 52b17e4` scratch.

### 2.1 Single-clip success (closes C-R271-01, single)
- **Where:** in `nudgeSelectedClip`, after the existing `applyEdit(next, studioMoveStrings.historyNudgeClip)` and `setRange(null)` [K2].
- **What:**
  ```ts
  const moved = next.clips.find((entry) => entry.id === clip.id);
  const text = studioMoveStrings.nudged(formatArrangementTime(moved?.start ?? target));
  setStatus(keyRepeat ? () => text : text);
  ```
- **Copy:** one new formatter in `studioMoveStrings`, right after `historyNudgeClip` [K3]: `nudged: (start: string): string => \`Nudge clip: start ${start}.\``.
  - "Nudge clip" is the Undo label of the same edit [K3].
  - The shape mirrors the drag-release lane form `<label>: start <t>.` [K4].
  - No `nudged` formatter and no `Nudge clip:` text exist today [K10].
- **The start is read from the committed arrangement** (`next`), not from `target`, so the text names where the clip really is.

### 2.2 Group success (closes C-R271-01, group)
- **Where:** the `ids.length >= 2` branch, after the existing `applyEdit(moved, studioClipStrings.historyMoveClips(ids.length))` and `setRange(null)` [K2].
- **What:** reuse the group drag-release texts `groupMovedRight` / `groupMovedLeft` [K5], with:
  - `label`: `historyMoveClips(ids.length)`, the same label as this edit's Undo entry [K2];
  - `count`: `ids.length`;
  - `distance`: `formatArrangementTime(Math.abs(after.start - before.start))` for the first selected id (`ids[0]`), read in `arrangement` (before) and `moved` (after).
- **Direction:** `after.start >= before.start` → right, otherwise left.
- **The write:** `setStatus(keyRepeat ? () => text : text)`.
- **Example:** `Move (2): 2 clips moved 00:01.000 to the right.`

### 2.3 Rulings (each one is a row)
- **Write order.** The result text is written **after** `setRange(null)`.
  - Rule R's function update from `setRange(null)` returns a non-T text unchanged, and an explicit write queued after it wins anyway (round 273 §3.8).
  - Either order would give the same text. The order is fixed so the code reads like every other edit: edit, clear the range, state the result. Row LT21.
- **Held key (L4, same key path).** Every key-repeat write uses the function form, as the refusal branches already do [K2].
  - **Single:** each step names a new start, so each step is a new text and is announced. That is the true state, and it matches the existing "a changing readout is announced at every change" rule (SU6 [K8]). Rows SK13, SK7 and NZ3.
  - **Group:** each step names the same per-step distance, so the text is identical across repeats. The function form returns the same text, so there is **no new announcement during a hold**, and a fresh press announces again (the SK refusal pattern [K9]). Row SK14.
  - **Refusal once per press stays.** When a hold reaches a neighbour or 0, the refusal is written once: its function form now replaces a nudge text, which bumps the sequence once, and later repeats return the same text. The existing filter and final-text lines of SK7 and NZ3 are unchanged; only their exact `added` lists grow (§5.1).
- **What the result text can land on (L51 clobber).** Any earlier text: clip-added, a stopped T text (`Stopped — Space plays …`), a past-end refusal, `Loop is on.` or `followResumed`.
  - In every case the nudge result replaces it, because it is an explicit edit result. "The last message wins", as with drag release and clip-added.
  - Rows: LT21 (stopped T text) and the browser row B-NUDGE-PASTEND.
- **Its lifetime (L51).** It becomes false when the clip moves again or the edit is undone. Each of these paths writes its own text:
  - another nudge (§2.1, §2.2);
  - a drag release [K4];
  - Undo or Redo: `restoreHistory` writes `Undo: <label>` / `Redo: <label>` [K11].

  A marker move, Space and Stop do not rewrite it, because it is not a T kind (Rules W, P and S touch T kinds only). It stays true then, because the clip has not moved. Rows: LT20 (Undo) and LT21 (Space and Stop keep it).
- **These stay as they are** (a change is a STOP):
  - the refusal branches and their `keyRepeat` function forms;
  - the deps array;
  - `StudioWorkspace`'s arrow branches [K12];
  - every other status writer.

### 2.4 Out of scope (recorded, not built)
- **B-R273-PLAYING-TEXT-WITH-RANGE:** Low, deferred (§1).
- **INFO-C248-STALE-NOTE:** carried unchanged. It is ruled behaviour from round 248 and part of the open Saba question SABA-Q-11B-HIDDEN-SNAP (d). Nothing to do until he answers.
- **Gate-273 suggestion 1** (skip Rule R's write while playing or on a null→null range): no row can show it red, because neither the text nor the sequence changes. It is recorded as a STUDIO-PERFORMANCE candidate, not built here (D-29z602).
- **Moving Rule S into the provider** (the gate-273 and A Architecture notes): waits for root's checkpoint answer (D-29z604).

## 3. Why this is the smallest honest behaviour
- **Rejected: clear the line after a nudge.** The edit would lose its announcement, and an empty line says nothing about where the clip is.
- **Rejected: write nothing on key repeat.** The text would stay one step behind, which is the bug itself.
- **Rejected: re-derive the transport text after a nudge** (what Rule R does by accident today for T texts). It describes Space, not the edit, and it still leaves non-T texts such as clip-added stale.
- **Rejected: a new group wording.** The group drag already has a tested text with the same meaning [K5]. A second wording for the same edit would be one more string to learn.

## 4. Grants (exact; also in `b-round-273-r274-grants.txt`)
| Path | What may change |
|---|---|
| `app/contexts/ArrangementContext.tsx` | `nudgeSelectedClip` only: the two success writes of §2.1 and §2.2. The group label may become a local const. Nothing else |
| `app/lib/arrangement/strings.ts` | `studioMoveStrings.nudged`, right after `historyNudgeClip`. Nothing else |
| `app/lib/arrangement/__tests__/strings.test.ts` | **additions only:** `studioMoveStrings: {}` (HEAD l.771 [K13]) gets `nudged: [studioMoveStrings.nudged('00:01.000')]`; one exact-text expect in ST11: `Nudge clip: start 00:01.000.` |
| `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | SK7 (HEAD l.606) and NZ3 (HEAD l.1031) [K13]: the exact `added` list becomes the 4-item list of §5.1. New SK13, SK14 and SK15 in the `a held key announces the same refusal once` describe |
| `app/lib/arrangement/__tests__/status-lifetime.test.tsx` | the describe title (HEAD l.214 [K14]) → `'SYS-6 STATUS-LIFETIME: transport and edit-result texts stay true (D-29z594, D-29z599, D-29z603)'`, options unchanged; new LT20 and LT21. LT1–LT19 stay byte-identical |
| `app/lib/arrangement/__tests__/playback-start.test.ts` | the describe title (HEAD l.31 [K14]) → `'SYS-6 playback-start resolver (D-29z594, D-29z599)'`. No `it` changes (gate-273 suggestion 4) |
| `docs/…/203-sys-6-status-lifetime-stage-1.md` | l.4 only → `**სტატუსი:** Completed (C round 274 PASS)` (L28, final stage) |
| `docs/…/204-sys-6-status-lifetime-stage-2.md` | l.4 only → `**სტატუსი:** Completed (C round 274 PASS)` |
| `docs/…/205-sys-6-status-lifetime-stage-3.md` | **new** [K15]:<br>• l.4 exactly `**სტატუსი:** Completed (C round 274 PASS)`<br>• the 7 TEMPLATE headings in order (L26)<br>• `## მიდგომა` states the §2.3 held-key rule and the clobber rule<br>• `## პრობლემები და გადაწყვეტები` records GATE270-S2 as premise-false (SK8/SK12) and B-R273-PLAYING-TEXT-WITH-RANGE as deferred |

**Frozen:** everything else, in particular:
- `StudioWorkspace.tsx` (its arrow-key branches), `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx`, `status-announcement.ts` and `playback-start.ts`;
- these tests, which must pass unchanged: `grid-snap-ui`, `detail-panel`, `detail-panel-polish`, `track-layout`, `meter-ui` and `track-meter-ui` (they call `nudgeSelectedClip` or pin its Undo label [K16]), plus `status-announcement.test.ts`, `pending-status`, `insert-marker-ui`, `bars-ruler-ui` and `gesture-reentry`;
- `package.json`, `perf/**` and `e2e/**`.

**Protected (auth and purchase):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts` and `app/contexts/AuthContext.tsx`.

## 5. Tests
### 5.1 Tests that change
- **First sketch:** B's full pre-check gave **3278/3281**. The 3 failures are exactly the rows below (`b-round-273/precheck-vitest.json`).
- **Refined sketch** (the key-repeat function form): B re-ran the 8 nudge-related files on the scratch and got 185/187. The two failures are the same SK7 and NZ3.

| Test | Why it changes | New exact value |
|---|---|---|
| ST12 (`strings.test.ts`) | the new formatter needs a sample | addition only |
| SK7 l.606 [K13] | each successful step now announces its start | `['Nudge clip: start 00:05.200.', 'Nudge clip: start 00:05.100.', 'Nudge clip: start 00:05.000.', NUDGE_BLOCKED_TEXT]` |
| NZ3 l.1031 [K13] | the same | `['Nudge clip: start 00:00.200.', 'Nudge clip: start 00:00.100.', 'Nudge clip: start 00:00.000.', NUDGE_SNAP_BLOCKED_TEXT]` |

Both are stronger replacements. The refusal still appears exactly once (SK7's filter line l.605 stays [K18]), and every successful step is now pinned. **No assertion is lost. A test whose only change removes an assertion is a Medium bug.**

### 5.2 New rows
All expected texts are exact. "seq" is `statusSequence`.

| Row | File | Steps | Expected |
|---|---|---|---|
| **LT20** (single, lifetime) | status-lifetime | the file's fixture: one clip `p1` at 0 on Music, 16 s [K20]. `selectClip('p1')`; `nudgeSelectedClip(1)`; then `nudgeSelectedClip(-0.5)`; then `undo()` | `Nudge clip: start 00:01.000.` (seq +1); then `Nudge clip: start 00:00.500.` (seq +1); after Undo, `Undo: Nudge clip` with `p1` at 1 |
| **LT21** (clobber and order) | status-lifetime | a stopped T text at 4 (the file's `stoppedAt(4)` helper [K20]); `selectClip('p1')`; `nudgeSelectedClip(1)`; then Space (play), then Stop | after the nudge: `Nudge clip: start 00:01.000.`. While playing and after Stop: the same text, with seq unchanged by Space and by Stop |
| **SK13** (single, held) | status-announcement-ui | Snap off; `keyRepeatClip('c1', 1)` alone, `selectClip('c1')`; ArrowRight with `repeat:false`, then 3× `repeat:true` (the file's `pressKey`) | the added texts are exactly `['Nudge clip: start 00:01.100.', '…00:01.200.', '…00:01.300.', '…00:01.400.']`; seq +4; `childElementCount` 1 |
| **SK14** (group, held) | status-announcement-ui | Snap off; SK3's fixture: `keyRepeatClip('c1', 0)` and `keyRepeatClip('c2', 5)` (5 s each), `selectClips(['c1', 'c2'])` [K21]; ArrowRight `repeat:false`, then 3× `repeat:true`, then one more `repeat:false` | **First press:** added `['Move (2): 2 clips moved 00:00.100 to the right.']`, seq +1. **The 3 repeats:** added `[]`, the same span, seq unchanged, clips at 0.4 and 5.4. **The fresh press:** the same text added once, a new span, seq +1, clips at 0.5 and 5.5 |
| **SK15** (group, both directions) | status-announcement-ui | `keyRepeatClip('c1', 2)` and `keyRepeatClip('c2', 7)`, `selectClips(['c1', 'c2'])`; `act(() => live(api).nudgeSelectedClip(1))`; then `nudgeSelectedClip(-0.5)` | `Move (2): 2 clips moved 00:01.000 to the right.`; then `Move (2): 2 clips moved 00:00.500 to the left.` |

- **Helpers:** reuse each file's helpers (`playAndAdvance`, `stoppedAt`, `stop`, `key`, `live`, `pressKey`, `observeRegion`, `addedTexts`, `keyRepeatClip`). Keep `{ timeout: 15_000 }` on the status-lifetime describe.
- **Headroom (L31):**
  - At gate 273, `status-lifetime` ran 19 tests in 5522 ms and `status-announcement-ui` ran 33 in 5692 ms.
  - On B's scratch the slowest rows were LT11 at 826 ms (15 s limit) and SU1 at 363 ms (vitest default 5 s).
  - Every row is far below 50 %.

### 5.3 What A runs (speed rules)
- `npm run typecheck` and `npm run lint`.
- `npx vitest run` on these files: `strings`, `status-lifetime`, `status-announcement-ui`, `playback-start`, `grid-snap-ui`, `detail-panel`, `detail-panel-polish`, `track-layout`, `meter-ui`, `track-meter-ui`, `status-announcement`, `pending-status` and `insert-marker-ui`.
- A code-reviewer run is required (more than 3 files change).

## 6. B's pre-check (L23); all files are in `b-round-273/`
- **Sketch:** `sketch.diff`, on a `git archive 52b17e4` scratch with a private `node_modules` of per-entry symlinks. `tsc --noEmit` rc 0, and Biome is clean on both files.
- **Full vitest (first sketch): 3278/3281.** The failures are exactly ST12, SK7 l.606 and NZ3 l.1031 [K13] (`precheck-vitest.{json,log}`). With the refined sketch, the 8 related files gave 185/187 (SK7 and NZ3).
- **Consumers:**
  - `nudgeSelectedClip(` has 2 non-test callers, both in `StudioWorkspace`'s arrow branch [K12].
  - The test callers and the Undo-label pin are the frozen files of §4 [K16].
  - None of them asserts the status after a successful nudge; all of them passed on the sketch.
- **Browser** (`probe-r274.cjs`, HEAD on :5173 and the sketch on :5186, both viewports, 0 page errors): rows 1, 1b, 2 and 3 of §1, as listed.
- **Cleanup:** the scratch server is stopped, and `store/` is untouched (`git status` is empty).

## 7. Mutants
A red-proofs them on a scratch copy and restores the tree byte-identically. C re-runs them.

| Id | Mutation | Must turn red |
|---|---|---|
| M-NO-SINGLE | remove the single-clip success `setStatus` | LT20, LT21, SK13, SK7, NZ3 |
| M-NO-GROUP | remove the group success `setStatus` | SK14, SK15 |
| M-GROUP-ALWAYS-RIGHT | always use `groupMovedRight` | SK15 (second step) |
| M-SINGLE-PRE-START | name `clip.start`, the start before the move | LT20, SK13 |
| M-GROUP-NUDGE-LABEL | the group text uses `studioMoveStrings.historyNudgeClip` as its label | SK14, SK15 |
| M-GROUP-REPEAT-STRING | the group repeat write uses the string form | SK14 (seq during the hold) |
| M-REPEAT-SILENT | skip the success write when `keyRepeat` | SK13, SK7, NZ3 |

## 8. C rows (Chromium, `/studio-lab`, 1440×900 and 1280×720, fresh anonymous contexts)
- **Recipe:** copy `b-round-273/probe-r274.cjs` into `c-round-274/` first, because it writes next to itself. Run it on HEAD and on A's tree, and add scenarios as needed.
- **Wait first:** wait for `Demo collection ready` (L48).
- **Reading state:** play state from `[data-playing]`, clip starts from `[data-clip-start]`.

**Scope, claims and tests**

| Row | Check |
|---|---|
| SOURCE-SCOPE / HUNK-SCOPE | exactly the paths and hunks of §4. `git diff -- app/components` is empty, and the context diff is empty outside `nudgeSelectedClip` |
| CLAIMS | re-run §9 at HEAD, plus the L29 sweep over this task |
| TESTS-TARGETED, TEST-CHANGES, MUTANTS | per §5.3, §5.1 (no assertion lost) and §7 |

**Browser behaviour**

| Row | Recipe | Expected |
|---|---|---|
| B-NUDGE-SINGLE | §1 row 1 | `Nudge clip: start 00:01.000.`, the clip at 1.000, the Undo title `Undo: Nudge clip (Ctrl+Z)`, and one span swap |
| B-NUDGE-HELD | §1 row 1b (`keyboard.down` ×3, then up; then ArrowLeft) | after the hold: `Nudge clip: start 00:04.000.` and the clip at 4.000. After ArrowLeft: `Nudge clip: start 00:03.000.` and the clip at 3.000. At no read does the line name a start other than the clip's current one |
| B-NUDGE-GROUP | §1 row 2, then ArrowLeft | `Move (2): 2 clips moved 00:01.000 to the right.` (clips at 1.000 and 17.000); after ArrowLeft, `Move (2): 2 clips moved 00:01.000 to the left.` |
| B-NUDGE-UNDO | row 1, then Ctrl+Z | `Undo: Nudge clip`, and the clip is back at 0.000 |
| B-NUDGE-BLOCKED | a clip at 0, selected; ArrowLeft once, then held ×3 | the same text as HEAD, `Nudge blocked — start of the timeline.`, announced once: one span swap on the first press, none during the hold |
| B-NUDGE-PASTEND | §1 row 3, then Space and Stop | after the hold: `Nudge clip: start 00:03.000.`. Space plays: `data-playing` is true and the position advances from 17, inside the clip that now ends at 19; the line keeps the nudge text. After Stop: the same text |
| B-AUDIO | row 1 (the clip at 1.000), Home, Space; sample the analyser RMS every 100 ms for 3.2 s. Control: the same without the nudge | real output: every sample with position 0.10–0.85 s has RMS < 0.0005, and the maximum with position 1.05–2.10 s is > 0.05. Control: the maximum with position 0.05–0.60 s is > 0.05. B measured at HEAD (the audio path is unchanged by this round) [K22]: nudged 0 at every sample below 0.99 s, then 0.0857 at 1.08–1.09 s and 0.0949 at 1.99–2.01 s; control 0.097 at 0.06–0.07 s, both viewports |
| B-ENTER-TWICE (closes GATE270-S2) | both viewports (at 1280×720 press the panel's `Expand` first [K19]): a range 2–5 on the clip, Enter twice in Detail Start; then Enter twice in Clip Gain | each Enter swaps the span once (2 mutations), with the same text. C notes that this proves a DOM re-announcement, not screen-reader speech |
| B-R273-RANGE-PLAYING (observation) | `ctrlLeftRangeStop` | records that the deferred Low is still present (the same text as HEAD). **Not a FAIL** of this round |
| LT-WIDTH | the group text at 1280×720 and 1440×900 | the status box is no taller than with the clip-added text at the same width, and there is no horizontal overflow |

**Guards and docs**

| Row | Check |
|---|---|
| SCREEN-BUDGET | persistent text lines outside the timeline in the demo state, HEAD against new: equal |
| G274-AUTH | `/studio-lab` loads anonymously. `/studio/<id>` signed out shows "Sign in required". `/api/studio-token?product=middle-east&file=Music.wav` without a header returns 401 and no token |
| DOC-205 | l.4 byte-exact; the 7 TEMPLATE headings in order; every cited row id exists. Docs 203 and 204 differ from HEAD only on l.4, each `**სტატუსი:** Completed (C round 274 PASS)`. `grep -rn 'In Progress (stage' docs/implementation` leaves only doc 176 (STUDIO-PERFORMANCE, still open) |

**Gate rows** (C does not claim them): the full vitest, build, full Biome, verify and e2e smoke.

## 9. Claims (L29). Run from `store/` at HEAD `52b17e4`
| Tag | Command | Expected |
|---|---|---|
| K1 | `git rev-parse --short HEAD; git status --short \| wc -l` | `52b17e4`, `0` |
| K2 | `sed -n 1993,2031p app/contexts/ArrangementContext.tsx` | `nudgeSelectedClip`. Group branch: `applyEdit(moved, studioClipStrings.historyMoveClips(ids.length));` (l.2004), `setRange(null);`, `return;`, with no `setStatus` on success. Single branch: `applyEdit(next, studioMoveStrings.historyNudgeClip);` (l.2024) and `setRange(null);`, with no `setStatus` after them. Every refusal uses `keyRepeat ? () => … : …` |
| K3 | `sed -n 314,320p app/lib/arrangement/strings.ts` | `studioMoveStrings`, with `historyNudgeClip: 'Nudge clip',` at l.319 and no `nudged` |
| K4 | `sed -n 763,766p app/components/arrangement/ArrangementClip.tsx; sed -n 805,808p app/components/arrangement/ArrangementClip.tsx` | the drag-release texts `` `${laneLabel}: start ${…}.` `` and `` `${label}: start ${…}, length …, source offset ….` `` |
| K5 | `sed -n 691,699p app/lib/arrangement/strings.ts` | `historyMoveClips: (count) => \`Move (${count})\``; `groupMovedRight` / `groupMovedLeft` → `` `${label}: ${count} clips moved ${distance} to the right.` `` / `…left.` |
| K6 | `sed -n 12,28p app/lib/arrangement/status-announcement.ts` | a string bumps the sequence unless a gesture is active and the text is equal; a function returns `previous` when the text is unchanged |
| K7 | `sed -n 3136,3141p app/components/arrangement/StudioWorkspace.tsx` | `aria-live="polite"`, `data-testid="arrangement-status"` and `<span key={statusSequence}>{status}</span>` |
| K8 | `grep -n "it('SK8\|it('SK12\|it('SU6" app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | SU6 l.369, SK8 l.611 and SK12 l.695 |
| K9 | `sed -n 447,476p app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `expectOneAnnouncementPerPress`: the first press adds the text; repeats add nothing and keep the span and seq; a fresh press adds it again with seq +1 |
| K10 | `grep -rn "Nudge clip:\|nudged:" app perf e2e \| wc -l` | `0` |
| K11 | `sed -n 2389p app/contexts/ArrangementContext.tsx; sed -n 2402,2405p app/contexts/ArrangementContext.tsx` | `restoreHistory` ends with `setStatus(message);`; `undo` calls it with `` `Undo: ${label}` `` |
| K12 | `grep -rn "nudgeSelectedClip(" app --include=*.ts --include=*.tsx \| grep -v __tests__` | 2 hits: `StudioWorkspace.tsx:2554` and `:2570` |
| K13 | `sed -n 771p app/lib/arrangement/__tests__/strings.test.ts; sed -n 606p app/lib/arrangement/__tests__/status-announcement-ui.test.tsx; sed -n 1031p app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `  studioMoveStrings: {},`; `    expect(added).toEqual([NUDGE_BLOCKED_TEXT]);`; `    expect(addedTexts(stopWatching(watch))).toEqual([NUDGE_SNAP_BLOCKED_TEXT]);` |
| K14 | `sed -n 214p app/lib/arrangement/__tests__/status-lifetime.test.tsx; sed -n 31p app/lib/arrangement/__tests__/playback-start.test.ts` | `'SYS-6 STATUS-LIFETIME stage 1: texts that name the insert marker stay true (D-29z594)',`; `describe('SYS-6 stage 1 playback-start resolver (D-29z594)', () => {` |
| K15 | `ls docs/implementation/2026/quarter-IV/ \| tail -1; grep -rn 'In Progress (stage' docs/implementation \| wc -l` | `204-sys-6-status-lifetime-stage-2.md`; `3` (docs 176, 203 and 204) |
| K16 | `grep -rln "nudgeSelectedClip\|historyNudgeClip" app/lib/arrangement/__tests__ perf e2e` | 7 files: `detail-panel-polish`, `meter-ui`, `grid-snap-ui`, `track-meter-ui`, `strings`, `detail-panel` and `track-layout` |
| K17 | `grep -rnE "it\('(LT2[0-9]\|SK1[3-9])" app \| wc -l` | `0`: the new ids are free |
| K18 | `sed -n 605p app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `    expect(added.filter((text) => text === NUDGE_BLOCKED_TEXT)).toEqual([NUDGE_BLOCKED_TEXT]);` |
| K19 | browser: `b-round-273/probe-r274.cjs` scenario `detail1280` at HEAD | 1280×720: `arrangement-detail-panel` 36 px tall with an `Expand` button, `arrangement-detail-start` box 0×0; 1440×900: panel 144 px, Start 80×24 (`probe-r274-head.json`, `shots/head-detail1280-*.png`) |
| K20 | `sed -n 52,54p app/lib/arrangement/__tests__/status-lifetime.test.tsx; sed -n 181,186p app/lib/arrangement/__tests__/status-lifetime.test.tsx` | `PULSE_CLIPS` = one clip `{ id: 'p1', trackId: 'music', …, start: 0, …, duration: 16 }`; `async function stoppedAt(seconds: number)` |
| K21 | `sed -n 408,410p app/lib/arrangement/__tests__/status-announcement-ui.test.tsx; sed -n 529,533p app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `keyRepeatClip(id, start)` → duration 5 on `music`; SK3 mounts `c1` at 0 and `c2` at 5 and calls `selectClips(['c1', 'c2'])` |
| K22 | browser: `b-round-273/probe-r274.cjs` scenarios `nudgeAudio` and `baselineAudio` at HEAD | the RMS series in `probe-r274-head.json` quoted in B-AUDIO |

## 10. STOP conditions (L11)
- A frozen or covering test fails, including by timeout, or a covering test runs above 50 % of its timeout.
- A clause would change a refusal text, a refusal's announce-once behaviour, the nudge distance or where Space plays.
- A §7 mutant stays green and no equal-or-stronger row inside the grants catches it.
- The reviewer shows a Medium+ regression outside the grants.

## 11. After C PASS
**Close** these ids and remove them from `deferred_low_polish` and `open_findings` (L7):
- C-R271-01-NUDGE-STALE-STATUS;
- GATE270-S2-REPEAT-ANNOUNCE (premise false: browser evidence plus SK8/SK12);
- A-R273-REPEAT-PASTEND (superseded: the nudge now writes its own text).

**SYS-6 → done.** Docs 203, 204 and 205 have l.4 `Completed (C round 274 PASS)`.

**Next:** RETRO 275 (15 rounds after RETRO 260), unless REGRESSION is due first (on or after 2026-11-02).
