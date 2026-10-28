# Round 236: SABA-B-11a-FIX-1 — the scrub strip's play-from path: a ref-safe `playFrom`, no play-from-0 at the project end, and a strip double-click that does not Fit

**Planned by:** B, at the round 235 → 236 planning, 2026-10-28. **Decisions:** D-29z333…D-29z338.

**Type:** bug round, three tightly related bugs in one code path: the strip click → play-from path of SABA-B-11a stage 2 (published in round 235 as `49b4c74`).

| Id | Severity | Origin | One line |
|---|---|---|---|
| **GATE235-S1** | Medium | gate 235 review, finding 1 | A strip double-click starts playback **and** runs Fit. Reproduced by B at the baseline in Chromium (§0.3). |
| **A-R235-REVIEW-M1** | Medium (latent) | A round 235 code-reviewer | `playFromRuler` decides "start or not" from the render-time `isPlaying`, while `togglePlayback` reads `isPlayingRef`. If the two disagree, a strip click stops playback. The unit red-proof is BR14 (§2.4). |
| **C-R235-01** | Low (fixed now) | C round 235 | A strip click that snaps to the project end plays from 0. It is in the same function, so the fix costs almost nothing (bug-gate exception: the round owns the code). |

**Read first:** `lessons.md` in full.
- Directly relevant to this task: L23 (B's pre-check, §0.2), L29 (recipes B ran in Chromium, §0.3), L31 (timeouts), L28 (doc status), L44 (one new Saba question), L48 (new: timing rows and the 50 ms start lead).
- For A: L11, L32 and L33 (STOP), L12 (no class selectors), L26 (doc headings), L40 (testid elements).

**Not this round:**
- the seed-status cluster A-R234-REVIEW-M1 + GATE234-S2 + GATE234-S3. It is **round 237** (SABA-B-11a-FIX-2, D-29z334), still before SABA-B-11b;
- **C-R235-02**, Follow pause/resume on ruler clicks (Live 6.2). It is scheduled inside **SABA-B-10a**, which redefines what a ruler click does (D-29z335). Until then it is a listed deviation (§3);
- the Insert Marker model, the seconds ruler's click (`SABA-Q-TIME-RULER-ROLE`), hold-to-loop, Add Locator, the adaptive grid, the transport layout;
- moving `watchUncapturedPointerGesture` out of `ArrangementClip.tsx` (an Architecture signal, not a task; D-29z337);
- the purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 `deferred_user`); SABA-B-7 (`awaiting_user`).

## 0. Baseline and scope

**Baseline:** HEAD = `49b4c74f193555dd0fee57036060623cfe0aae5a`. This is gate 235 `published`, its `commit`. At the start, `git status --short --untracked-files=all` must be empty. B's check is in `b-round-235/git-status-at-planning.txt`: HEAD `49b4c74`, 0 changed paths.
- If HEAD differs or any path is dirty at the start: **STOP** (L11). One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-235-r236-tree-sha256.txt` lists **1,093** tracked files: every tracked file except the 5 grants and the 4 root files. From `store/`, `sha256sum -c --quiet` gives rc 0 at planning.
- The frozen set includes every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- It also includes `.claude/**`, `CLAUDE.md` and every config file.
- Frozen code: `app/hooks/useRulerNavigation.ts`, `ArrangementRuler.tsx`, `ArrangementTransport.tsx`, `strings.ts`, `shortcuts.ts`, `tempo-seed.ts`.
- Frozen tests: every test except N2's file, including `tempo-seed-ui.test.tsx`, `tempo-ui.test.tsx`, `tempo-window-ui.test.tsx`, `strings.test.ts` and `shortcuts.test.ts`.

**Root-owned, must equal HEAD:** `b-round-235-r236-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes are in `b-round-235-r236-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants
| # | Path | Change |
|---|---|---|
| 1 | `app/contexts/ArrangementContext.tsx` | §2.1 only: one new interface member `playFrom: (time: number) => void`, its `useCallback` (placed after `seekTo`), and `playFrom` in the context value object and its dependency list. **`togglePlayback`, `seekTo` and every other member are unchanged.** |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | §2.2 only: the body of `playFromRuler` becomes `workspaceRef.current.playFrom(time)`. It stays a `useCallback` with `[]` deps. `barsRulerGestures` is unchanged. |
| 3 | `app/components/arrangement/ArrangementTempoRow.tsx` | §2.3 only: `pressInStripRef`, a wrapper on `onPointerDown` that records the zone, and a guard on `onDoubleClick`. Nothing else in the bars ruler, the tempo field or the metronome. |
| 4 | `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | §2.4: new rows BR12, BR13, BR14. **BR1–BR11 and BR4b stay byte-identical**, and so do the helpers above them. |
| 5 | `docs/implementation/2026/quarter-IV/183-saba-b-11a-bars-ruler.md` | Only two parts may change. In `## მიდგომა`, the bullet **"Drag და double-click"** (l.34–35) says that a strip double-click does not Fit, and points to doc 184. In `## არქიტექტურა`, the mermaid `Dbl` branch (l.74–75) gains the strip-press condition. l.4 and the rest of the doc are unchanged. |
| N1 | `docs/implementation/2026/quarter-IV/184-saba-b-11a-play-from-fix.md` | New implementation doc (§2.5). |

The grants' start hashes are in `b-round-235-r236-granted-start-sha256.txt`. The lists are in `b-round-235-r236-grants.txt` and `b-round-235-r236-new-files.txt`. N1 does not exist at HEAD.

Before editing, read:
- `AUDIO_ARCHITECTURE.md` (playback);
- `REACT_CONTEXT.md` (a context member);
- `FORWARDREF_COMPONENT.md` and `AGENT_DISCOVERABLE_CODE.md` (component and new export naming);
- `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests);
- `GEORGIAN_DOCS.md` (doc 184).

### 0.2 B's collision pre-check (L23, done)
B applied a sketch of §2 to a scratch copy: `git archive HEAD` → `/tmp/b235-scratch`, with `node_modules` symlinked. That copy is outside the repo and the loop folder. The script is `b-round-235/sketch.py`, the diff is `b-round-235/precheck-scratch.diff`, and the sketch tests are in that diff.
- **Static checks:** `npx tsc --noEmit` rc 0. `npx biome check` on the 4 touched code files is clean with no fixes.
- **New rows:** the N2 file has 15 tests (BR1–BR14 with BR4b), all green, at 2.6 s.
- **Covering set:** `b-round-235/covering-files.txt` holds **118** test files. They are every test that mentions `ArrangementProvider`, `StudioWorkspace`, `ArrangementTempoRow`, `ArrangementRuler`, `useRulerNavigation`, `playPastEnd`, `togglePlayback`, `seekTo` or `studio-lab`. **All 118 files and 1,692 tests are green** (`b-round-235/precheck-covering.log`, 209 s). There is no red row, so no existing test needs a grant. The slowest tests are CP12a–d at 9.0 s of 30 s, and UM3/UC5 at 3.5 s of 20 s.
- **Context shape:** no test builds a hand-made `ArrangementContextValue` (grep `setMetronomeBpm` in `__tests__`: only real `useArrangement()` calls). So adding a required member breaks no fixture. `tsc` confirms this.
- **Mutants run by B on the sketch** (A re-runs them, §4):
  - MU-R (restore the render-state `latest.isPlaying` check in `playFromRuler`) → BR13 and BR14 red.
  - MU-E (disable the end guard) → BR13 red.
  - MU-T (decide the double-click zone from `event.target` instead of the recorded press) → BR12 red.
- **Keep these true:**
  - do not rename `ArrangementBarsRulerInner` (BU8 and BR11 count its renders);
  - keep `barsRulerGestures` referentially stable (BR11);
  - with no tempo, render no handler, title or child (BR1, BU7).

### 0.3 Recipes, signals, timeouts and testids (L29, L31, L40)
**Recipes (L29).** B ran these in Chromium at both viewports, against the baseline on `:5173` and the scratch build on `:5174`. The files are `b-round-235/probe/dbl-baseline.json`, `out-baseline.json` and `out-scratch.json` (script `recipes.cjs`). There were 0 page errors.
- **Wait for ready first (new, L29):** before the seed, wait until `[data-testid="arrangement-status"]` starts with `Demo collection ready`. Without this wait, the provider's ready message can land after the seed and overwrite the status. That happens within about 1–2 s of load (`out-baseline-noreadywait.json`; this is the A-R234-REVIEW-M1 class, round 237). Status rows then read the wrong text.
- **Seed a tempo:** click `[data-source-id="demo-stem-pulse"]`, then the enabled button whose text starts with `Add`. The result is tempo 120, `1/4`, Snap on, a 16 s project and 40 px/s, so x = `bars.x + t × 40`.
- **Event targets of a strip double-click** (`page.mouse.dblclick(bars.x + 120, bars.y + 4)`, at the baseline):
  - each `pointerdown` targets `arrangement-bars-scrub-strip`;
  - every `pointerup`, `click` **and `dblclick`** targets `arrangement-bars-ruler`, because of pointer capture.

  So the double-click zone **must** come from the recorded press, not from `event.target`. MU-T encodes this.
- **Baseline effect of a strip double-click:** playing (`Pause`, position 3.26–3.28 after 300 ms), with the status `Fit: the entire project is visible (00:16.000). X goes back.` at both viewports. Baseline end click at 15.95 s with `scrollLeft` 300: it plays from 0 (0.47 s after 500 ms), and Follow scrolls back to 0. This is C-R235-01.
- **Scratch effect** (both viewports):
  - strip double-click: playing from 3.000 (3.249 after 300 ms), with the seed status unchanged (no Fit) and `scrollLeft` 0;
  - lower-zone double-click: the exact Fit status;
  - end click: `Play`, position 16, `scrollLeft` 300, with the exact `playPastEnd` status of C-END-236.
- **Signals:**
  - Status text: `[data-testid="arrangement-status"]`.
  - Play state: the transport button's `aria-label`, `Pause` while playing and `Play` when stopped.
  - Position: `[data-testid="arrangement-playhead-handle"]` `aria-valuenow`.
  - Scroll: `arrangement-timeline-scroller.scrollLeft`.
  - Zoom: the Fit status, or `pxPerSecond` via the zoom readout.

**Timeouts (L31).** In gate 235 (`gates/round-235/verify.log`), `bars-ruler-ui.test.tsx` ran 12 tests in 5.3 s. Its slowest row was BR2 at 1.23 s, against the declared `{ timeout: 15_000 }`. The sketch's 15 rows took 2.6 s in total. No test in the covering set is near its limit.

**Testids (L40).** The `arrangement-bars-ruler` element gains two wrapper handlers. It keeps its attributes, classes and children. Its tests (`tempo-ui`, `tempo-window-ui`, `tempo-seed-ui`, `bars-ruler-ui`) are in the covering set.

## 1. Why
- **GATE235-S1.** A strip double-click is two clicks and then a `dblclick`.
  - Today the first click starts playback from the point, and the second jumps there again.
  - Then `dblclick` reaches the shared Fit handler, so the view zooms out to the whole project while playback runs. This is a second, unasked effect on a gesture Live documents only as "launches playback" (§3).
  - The gate rated it Medium.
- **A-R235-REVIEW-M1.** `playFromRuler` (`StudioWorkspace.tsx` l.1312–1318 at `49b4c74`) runs `latest.seekTo(time)`, then `if (!latest.isPlaying) latest.togglePlayback()`.
  - `latest` is the last **rendered** context value. `togglePlayback` reads `isPlayingRef` (`ArrangementContext.tsx` l.1269–1271).
  - When they disagree, for example a playback start and a strip click in the same task before React commits, `togglePlayback` sees "playing" and **stops** playback instead of starting it.
  - BR14 reproduces this in jsdom (§0.2, MU-R). The proper home is the context, which owns the ref (both reviewers' proposal).
- **C-R235-01.** `togglePlayback` plays from 0 when `current >= end − EPS` and no loop is active (l.1294). That is right for Space at the end, but wrong for an explicit "play from here" click. C saw it at both viewports: a strip click at 15.95 s snaps to 16.000 and plays from 0.000.

## 2. Changes

### 2.1 `playFrom` in the context (grant 1)
Add `playFrom(time)` to `ArrangementContextValue` and implement it with `useCallback`, after `seekTo`:
1. `target = Math.max(0, time)`.
2. **Playing** (`isPlayingRef.current`): `seekTo(target)` and return. This is the same jump as today (the graph restarts at the target, l.1368–1383).
3. **Stopped**:
   - read `arrangement = historyRef.current.present` and `end = projectEnd(arrangement)`;
   - if `end > 0`, `target >= end − ARRANGEMENT_EPS` and `resolveActiveLoop(arrangement.loop, target) === null`, then:
     - call `stopLibraryPreview()`, as `togglePlayback` does before its own guards;
     - call `seekTo(target)`, so the position shows where the user clicked, as for t = 20 today;
     - call `setStatus(playPastEndMessage(target, end))` and return. Do not start playback;
   - otherwise call `seekTo(target)`, then `togglePlayback()`. Every existing guard still applies there: `nothingToPlay` in an empty project, `playPastEnd` past the end, the loop and the preview stop.
4. Dependencies: `[seekTo, stopLibraryPreview, togglePlayback]`. Add `playFrom` to the value object and to its dependency list, next to `seekTo`.

**Message at exactly the end.** The status is the existing `playPastEnd` text: "Playhead (00:16.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0." B chose to add no new string (D-29z333), because "nothing to play here" is true at the end too. A wording refinement ("at the end") goes to `deferred_low_polish` as B-R236-END-WORDING.

### 2.2 `playFromRuler` (grant 2)
- `const playFromRuler = useCallback((time: number) => { workspaceRef.current.playFrom(time); }, []);`
- Nothing else changes: `barsRulerGestures`, its memo and the seconds ruler.

### 2.3 The strip double-click (grant 3)
- In `ArrangementBarsRulerInner`, add `const pressInStripRef = useRef(false);`.
- **When interactive**, the root's `onPointerDown` becomes a wrapper:
  1. `pressInStripRef.current = event.target instanceof Node && (stripRef.current?.contains(event.target) ?? false)`;
  2. then `navigation.onPointerDown(event)`.
- **When interactive**, the root's `onDoubleClick` becomes: if `pressInStripRef.current` is true, return; otherwise call `navigation.onDoubleClick()`.
- When `bpm === null`, both stay `undefined`, as now.
- **Result:**
  - a strip double-click = two "play from here" clicks, and no Fit;
  - a lower-zone double-click = Fit or zoom to the time selection, with the 300 ms after-drag guard, as now;
  - the seconds ruler is unchanged.
- **Why the press and not `event.target`:** Chromium delivers `dblclick` to the capturing root (§0.3). Do not compare `clientY` with a px constant either: the painted strip element stays the only zone rule (round 235 §2.2).

### 2.4 Tests (grant 4)
Add three rows after BR11. Use the same helpers and the same query rules (L12). Do not change existing rows.

| Row | Case | Expected |
|---|---|---|
| BR12 | Tempo 90 and Snap on. Status set to `'marker'`. Two strip clicks at 4.1 s, then `fireEvent.doubleClick(root)` (the root, as in Chromium). Then stop playback, do two lower-zone clicks at 6.3 s and a root `doubleClick` | After the strip pair: playing, position 4.000 (±1 ms), status still `'marker'` (no Fit). After the lower pair: the status matches `/^Fit: the entire project is visible \(/`. |
| BR13 | Tempo 90 and Snap on (1/4 = 0.6667 s). Strip click at 15.95 s, which snaps to 16.000 = the project end | Not playing. Position 16.000. Status = `playPastEndMessage(16, 16)`. Then `togglePlayback()` → playing from 0 (the unchanged Space-at-end rule). |
| BR14 | Tempo 90 and Snap on. Inside **one** `act`: `live(api).togglePlayback()`, then a strip click at 8.2 s | Playing, position 8.000. Red on MU-R. |

### 2.5 Docs
**N1 (doc 184):**
- written in Georgian, with technical terms in English and the L26 headings;
- l.4 exactly `**სტატუსი:** Completed (C round 236 PASS)`;
- it records:
  - the three ids;
  - why the press is recorded (Chromium `dblclick` retargeting, with B's probe as the source);
  - the end rule and its message;
  - the context `playFrom`;
  - the Live references and deviations (§3);
  - the new Saba question `SABA-Q-SCRUB-DOUBLE-CLICK`;
- it cites only tests that exist (BR12, BR13, BR14, and BR7 for the lower-zone Fit).

**Grant 5 (doc 183):** only the bullet and mermaid lines in the grant table, and nothing else. A checks it with `git diff -U0`.

## 3. Reference: how Ableton Live 12 does it
**Sources:**
- the Live 12 manual [6 Arrangement View](https://www.ableton.com/en/live-manual/12/arrangement-view/), §6.1 "Layout", §6.2 (Follow) and §6.3 "Transport and Playback". B fetched it with WebFetch on 2026-10-28 for round 235 (`tasks/round-235.md` §3). C re-confirmed the §6.2 sentence on the same date (`c-round-235.json` C-R235-02, local capture `b-round-71/ableton-arrangement-view-20261021.txt`);
- the `ableton-arrangement-expert` consult of round 235. No new video was watched for this bug round.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A click in the scrub area | 6.1: "Clicking anywhere in the scrub area launches playback from that point." | Confirmed | Unchanged: the strip click plays from the snapped point | C-STRIP-236 |
| A double-click in the scrub area | — | **Not found** in the manual. It is an **inference** from 6.1 that each click of a double-click launches playback, so a double-click = two launches | **CZABA decision (D-29z333):** a strip double-click = two "play from here" clicks, with no Fit. Sent to Saba once as `SABA-Q-SCRUB-DOUBLE-CLICK` (L44) | C-DBL-STRIP |
| A double-click in the beat-time ruler | 6.1: "Double-clicking in the beat-time ruler zooms in to the current selection" (or the whole Arrangement if none) | Confirmed | Unchanged for the lower zone (the beat-time ruler proper): Fit, or zoom to the selection | C-DBL-LOWER |
| A scrub click at the very end of the Arrangement | — | **Not found** (how Live behaves at or past the last clip was not checked) | **CZABA rule:** CZABA stops at the project end, so a click at or past the end reports `playPastEnd` and does not play. This is the same as a click at t = 20 (round 235 C-EDGE). It is not "Live does the same" | C-END-236 |
| A scrub click while playing | 6.3: the jump is quantized | The jump is confirmed; that playback keeps going is an inference (round 235) | Unchanged: jump and keep playing. The play/stop decision now reads the playing ref | C-STRIP-236 |
| Follow when you click the beat-time ruler or the scrub area | 6.2: "Follow will pause if you … click on the beat-time ruler. Follow will start again once you stop or restart playback, or click in the Arrangement or clip scrub area." | Confirmed (verbatim) | **Listed deviation, temporary:** CZABA does not change Follow on ruler clicks (C-R235-02, Low). It is scheduled inside SABA-B-10a, which redefines the ruler click as the Insert Marker (D-29z335). It is not fixed this round | — (C confirms Follow is unchanged from the baseline) |

**Deviations, with their reasons:**
- No Fit on a strip double-click: the scrub area's documented meaning is "launch playback". This goes to Saba.
- The end rule: CZABA's player has a hard project end.
- Follow on ruler clicks: it waits for 10a.

None of them is there because it is "simpler to build".

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. `npm run typecheck` rc 0. `npx biome check` on every changed code file is clean.
2. Run `npx vitest run $(cat ../tmp/studio-real-loop/b-round-235/covering-files.txt)`. Everything must be green. Any test above 50 % of its timeout goes at the top of the report (L32).
3. Apply MU-R, MU-E and MU-T (§0.2), run N2 for each, report the red rows, and revert. The final files contain no mutant.
4. Run the `code-reviewer` (3+ files changed). Pass its Architecture note to B.
5. Do your own Playwright run on `/studio-lab` at both viewports:
   - the strip double-click (event list plus status);
   - the lower-zone double-click;
   - the end click at 15.95 s after scrolling by 300 px;
   - the full-window before/after screenshots. There is no new persistent text (L39).
6. Write `a-round-236.md`: changed files, the tests run with counts, the mutants, the reviewer result, and any STOP at the top.

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720, fresh context per row)
| Row | What | Pass when |
|---|---|---|
| C-SCOPE-236 | HEAD, status, hashes | <ul><li>HEAD is `49b4c74`;</li><li>only the 5 grants are `M`, plus the 1 new file;</li><li>`sha256sum -c` on the frozen and root lists gives rc 0;</li><li>protected files: `git diff --quiet HEAD` gives rc 0;</li><li>in doc 183, every `git diff -U0` hunk lies inside the "Drag და double-click" bullet of `## მიდგომა` or the mermaid `Dbl` branch of `## არქიტექტურა`. Check it by content, not by line number.</li></ul> |
| C-UNIT-236 | N2 (BR1–BR14), `tempo-ui`, `tempo-window-ui`, `tempo-seed-ui`, `grid-snap-position`, `navigation-strings-ui`, `markers-ui` | All green. The full suite is a gate row. |
| C-DBL-STRIP | Seed. `page.mouse.dblclick` on the strip at t = 3 s (y + 4), with a time selection absent and the zoom at its default | <ul><li>Playing (`Pause`).</li><li>The source restarted at 3.000 (±25 ms, measured from the audio source start, L48).</li><li>The status does **not** contain `Fit:`.</li><li>The zoom is unchanged (px/s 40).</li><li>`scrollLeft` is unchanged.</li></ul> |
| C-DBL-LOWER | Seed. Double-click the lower zone (y + 15), first stopped and then while playing | The status is exactly `Fit: the entire project is visible (00:16.000). X goes back.` A lower-zone double-click after a drag within 300 ms does nothing (the existing guard). |
| C-END-236 | Seed. `scrollLeft = 300`. Strip click at 15.95 s (snaps to 16.000). Then Space | <ul><li>After the click: not playing, the playhead reads 16.000, and the status is exactly `Playhead (00:16.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.`</li><li>Space then plays from 0 (the existing rule).</li><li>With a loop brace 2–6 active, a strip click at 15.95 → not playing, with the same status. The source: `resolveActiveLoop` (`loop.ts` l.99–107) returns `null` when the position is ≥ `loop.end`, so the end guard applies. A strip click at 3 → it plays and wraps (unchanged).</li><li>Record what you see, not pass/fail: a loop that reaches past the project end (e.g. 14–18) with a click at 16 counts as an active loop, so playback starts.</li></ul> |
| C-STRIP-236 | Regression of the round-235 rows: a strip click stopped at 4.1, a strip click while playing at 8.2, a lower click at 6.3 (stopped and playing), Alt, a drag from both zones, past the end at t = 20, an empty project with tempo 90 | The same results as `c-round-235.json` C-STRIP-STOPPED / C-STRIP-PLAYING / C-LOWER / C-ALT / C-DRAG / C-EDGE. Timing is relative to the audio source start, with the 50 ms lead (L48). |
| C-RACE-236 | A-R235-REVIEW-M1 | Unit only: BR14 is green and MU-R is red in A's report (C re-runs MU-R once). In the browser: 10 fast strip clicks at 1–10 s (one per 80 ms) end playing, with no `Play` label in between (a MutationObserver on the button). |
| C-SECONDS-236 | The seconds ruler | A click at 3.175 → `3.000`, not playing. Its double-click → Fit. Its drag scrolls. The handle drag still scrubs. Unchanged. |
| C-FOLLOW-236 | Follow, no change expected | Experiments A and B of `c-round-235.json` C-R235-02 give the same results as in round 235 (a listed deviation until 10a). |
| C-NO-TEMPO-236 | Add `demo-soft-impact` only | No strip, no `title`, cursor `auto`. A double-click at y 4 and y 15 does nothing (no Fit status, zoom unchanged). |
| C-BUDGET-236 | L39 | Persistent text lines outside the timeline are unchanged against the baseline at both viewports (empty and seeded). |
| C-REF-236 | §3 | Each row matches or is a listed deviation. `SABA-Q-SCRUB-DOUBLE-CLICK` exists in `backlog.json`. C-R235-02 is attached to SABA-B-10a in `backlog.json`. |
| AN-REVIEW-236 | Docs 183 and 184 | <ul><li>Doc 184: L26 headings, l.4 byte-exact, cites only existing ids.</li><li>Doc 183: only the granted lines changed, and l.4 is still `**სტატუსი:** Completed (C round 235 PASS)`.</li></ul> |
| LAB-SMOKE-236 | `/studio-lab` | It loads. Play/Pause with Space works, and the export dialog opens. 0 page errors. |
| C-SHOTS-236 | Evidence | Before/after full-window screenshots at both viewports (seeded, after a strip double-click). |
| Auth | Standing check | A fresh context: `/studio-lab` opens anonymously with `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **Space and the transport button** still use `togglePlayback`, unchanged:
  - Space at the project end plays from 0;
  - Space past the end gives `playPastEnd`;
  - Space in an empty project gives `nothingToPlay`.
- **Library preview:** a strip click while a preview plays stops the preview. This holds both when playback then starts and at the end, where the guard stops it too.
- **The playhead handle** (drag and arrows) and the seconds-ruler double-click are not touched.
- **A strip press then drag** (≥ threshold) followed by a double-click within 300 ms: nothing, as before.
- **Render budget:** BR11 and BU8 stay green. Playhead frames do not re-render the bars ruler.
- **A pointerdown on the strip, then a pointer cancel** still never plays (BR6).

## 7. Outcomes for B's next planning
- **PASS and gate published:** GATE235-S1, A-R235-REVIEW-M1 and C-R235-01 close. Round 237 is SABA-B-11a-FIX-2 (the seed status: A-R234-REVIEW-M1, GATE234-S2, GATE234-S3). Then SABA-B-11b. The REGRESSION round comes first if the planning falls on or after 2026-10-30.
- **FAIL:** a fix-up on the same grants.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.

## 8. Root notes
- New Saba question: `SABA-Q-SCRUB-DOUBLE-CLICK` (`backlog.json`, `awaiting_user`).
- Checkpoint request `b-round-234-checkpoint-request.md` has a new addendum (GATE235-ARCH-POINTER-UTIL). It is still non-blocking; please run it before SABA-B-11b if possible.
- B's scratch dev server on `:5174` shared the symlinked `store/node_modules/.vite` cache. No tracked file changed.
