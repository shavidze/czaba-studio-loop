# Round 427: SYS-2 stage 2b-i — a held Enter acts once on the footer toggles, the library tree, the detail toggle and the video dock

**Planned by:** B, at the round 426 → 427 planning, 2026-11-10 (`b-round-426.md`). The advisor was used after orientation and before close. The round-426 task is archived as `tasks/round-426.md` [K12].
**Decisions:** D-29z1492 … D-29z1497 (`backlog.json` v405) [K14].

## Read first
- **`lessons.md` in full** [K23]. Most relevant: L4, L10, L11, L23, L28, L29, L31, L47, L50, L52, L56, L57, L58, L59, L60.
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`. Read them **before** you apply the sketch (round 426's A read them late; see `a-round-426.md`, Process notes).
- **Template round:** `tasks/round-426.md` (SYS-2 stage 2a) with `c-round-426.md`. Where this task differs, this task wins.
- **Claims:** `bash b-round-426/claims-427.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-426/claims-427-planning-output.txt` (stderr `claims-427-planning.err`, empty).
  - Output on a scratch with the sketch applied (no doc): `b-round-426/claims-427-sketch-output.txt`.
  - Expected differences: `b-round-426/claims-427-planning-vs-sketch.diff`.
  - K13 passes when every id is located and none is `NOT-FOUND` (the optimizer may archive an id between B and C, L56).
- **Sketch review (L58):** `b-round-426/sketch-review.md` names the dispatched sha256 `aef454cd…`, the first review (approve-with-lows on `82a785ce…`), the test-only delta and the delta re-review. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `052c76c`, clean tree
- Gate 426 is `published` at `052c76c…` on both remotes, and that commit is the baseline [K1]. Status is empty [K2].
- **Frozen:** `b-round-426/r427-frozen-sha256.txt` has **1,319** entries: every tracked file except the 6 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `052c76c` at A1 (root published in between), a root-only commit that leaves `git diff 052c76c HEAD -- app` empty is accepted with a note. A re-runs the claims and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 426 passed** (D-29z1492). C PASS, 0 bugs, `browserVerified` true [K21].
  - B re-ran C's compare (ALL OK, 28 cells). C's mutant summary is identical to B's.
  - Gate 426 published `052c76c`.
  - **SYS-2 stage 2a is done.** A-R422-REVIEW-L1 is closed (HM15).
- **STEM-LANES still waits for Saba.** `AGREE-STEM-LANES.md` has no answer, and no transcripts file exists [K22]. Task 426 §6 row 1 applies, so this round is SYS-2 stage 2b.
  - The regression is due on or after 2026-11-13 [K7].
  - RETRO 435 is not due.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **The defect, in real Chromium at HEAD** (`b-round-426/probe/head/*.json`; 14 of 18 cells change state on the repeats [K15]). A held Enter clicks again on every auto-repeat:
  - it toggles the footer Snap and Envelope buttons back and forth;
  - it folds and unfolds a library collection;
  - it collapses and expands the detail panel;
  - it floats and docks the video;
  - after Close or Return docks the video, focus lands on Expand, so the repeats float it again.

## 1. What the code does today (tagged)
- **Inline copies [K8].** In the five 2b-i files there are 5 inline `event.key === 'Enter' && event.repeat` copies:
  - Library: 1, inside the private `preventRepeatedLibraryEnter`, which is used 3 times;
  - LibraryPreview: 2;
  - DetailPanel: 2.

  None of the five files imports the shared `preventRepeatedEnterKeyDown`.
- **Enter scanner** (`b-round-425/button-guard-scan-enter.py`):
  - the five files [K9]: 7 ENTER-GUARD, 3 KEYDOWN-NO-ENTER (detail toggle, video drag handle, library option), 11 NONE (10 in this round's scope plus the footer Shortcuts button, which pairs with the shortcut sheet in 2b-ii);
  - the whole folder [K9b]: 37 ENTER-GUARD, 4 KEYDOWN-NO-ENTER, 21 NONE;
  - what is left for 2b-ii, by file: K9c.
- **Detail toggle:** `handleToggleKeyDown` handles Space only [K29]. It toggles on keydown and ignores Space repeats. An Enter falls through to the native click.
- **Library options** already ignore a repeated Enter: `handleOptionKeyDown` acts only `if (!event.repeat)` [K29].
- **Library search field:** `handleSearchKeyDown` has no Enter branch [K26]. After the notice is dismissed, focus goes to the search field, and held-Enter repeats there do nothing. The window handler skips typing targets [K30].
- **During a pointer gesture,** the StudioWorkspace window keydown handler prevents a fresh Enter on any non-typing target and writes the gesture refusal status [K24]. So a refused Pan reset is never clicked by Enter. That corrects TL-R425-02's premise (ruling 6).

## 2. Rulings (B, D-29z1493 … D-29z1496)
1. **Guards added.** Each is `onKeyDown={preventRepeatedEnterKeyDown}`, or `if (preventRepeatedEnterKeyDown(event)) { return; }` as the first statement of an existing handler:
   - `StudioWorkspace.tsx`: the Snap toggle and the Envelope toggle.
   - `ArrangementLibrary.tsx`: the collection fold, the All node, the collection node, the folder node and the notice dismiss.
   - `ArrangementDetailPanel.tsx`: the detail toggle, as the first statement of `handleToggleKeyDown`, so Space behaves as today.
   - `ArrangementVideoDock.tsx`: Expand/Return, the floating Close and the placeholder Return.
2. **Folds (behaviour-identical):**
   - the private `preventRepeatedLibraryEnter` is deleted, and its 3 uses take the shared helper;
   - the 2 inline copies in LibraryPreview and the 2 in DetailPanel become `onKeyDown={preventRepeatedEnterKeyDown}`;
   - the LibraryPreview copies stay before `{...softDisabledButtonProps(...)}`, and that spread cannot carry `onKeyDown` (`onKeyDown?: never`, round 426).
3. **Out of scope, ruled:**
   - the video drag handle (KEYDOWN-NO-ENTER, no `onClick`): Enter has no action there;
   - Transport Fit stays unguarded (TH5 lock);
   - the search field and the library options: the options already ignore a repeated Enter (`if (!event.repeat)`), and the search field has no Enter action.
4. **Per press, nothing changes.**
   - A fresh Enter, Space or mouse click acts exactly as at HEAD.
   - No text, label, title, class or layout changes, and nothing new mounts.
   - The screen-budget, product-designer and journey rows do not apply.
5. **Focus targets (L47, L50).** The three buttons that unmount themselves hand focus, as today, to an element that stays mounted:
   - the notice dismiss → the library search field (`input[type=search]`);
   - the floating Close → the video Expand button;
   - the placeholder Return → the video Expand button (the dock's effect cleanup calls `expandButtonRef.current?.focus()` [K30]).

   The repeats then land on that element. The search field ignores them. Expand ignores them only with this round's guard; without it, this is the HEAD bug.
   - **L50 enumeration** (`b-round-426/data/l50-focus-origins.txt` [K31]): the L50 regex gives 18 / 20 / 5 / 11 / 17 hits in the five granted source files, and **0 added and 0 removed lines** of the sketch match it. **Class ruling:** the sketch adds, moves and removes no focus call, blur handler, pointer-down handler, list render or conditional render. All 71 hits are pre-existing and are left out of scope. The three focus hand-offs this round relies on are named above and checked by C row 4. The other guarded buttons keep focus (the toggles) or are idempotent (the tree nodes).
   - The probe records `document.activeElement` after the repeats in every cell, and C row 4 checks it.
6. **TL-R425-09: premise corrected (D-29z1493, D-29z1496).**
   - The HM5 gesture-active case cannot be reached by Enter, because the window handler refuses Enter first [K24].
   - **HM5b is a characterization row, green at HEAD by design.** It pins the real path: the fresh Enter is prevented, pan stays at 0.5, focus stays on the reset, the refusal is written once, and the whole snapshot, `statusSequence` included, is unchanged after 3 repeats. No mutant is expected to turn it red.
   - The Low that B first filed for a re-announced refusal (B-R426-GESTURE-REFUSAL-REPEAT-STATUS) is withdrawn as not a defect. The moving-drag variant stays a hypothesis, INFO-TL-R426-MOVING-DRAG-REPEAT.
7. **Stage numbering (D-29z1494).** SYS-2 now has 4 stages:
   - stage 1: round 422, doc 272;
   - stage 2 (2a): round 426, doc 274. Its l.4 was published as "stage 2 of 3" and stays;
   - stage 3 (2b-i): this round, doc 275;
   - stage 4 (2b-ii): the transient surfaces plus a closing grep row, 0 inline copies outside `studio-repeat-safe.ts`. It also grants l.4 of docs 274 and 275 to `Completed` (L28). Its button scan and its closing grep must cover every folder `/studio-lab` renders, not only `app/components/arrangement`.
8. **Doc:** `275-sys-held-enter-panels.md` [K6: 274 is the last].

## Reference
- **No Ableton reference applies.** The change removes Chromium's auto-repeat activation of a focused button. No per-press behaviour changes, so there is no Live behaviour to match. Ableton conformance: არ ეხება (does not apply). The reference is the project's own convention (rounds 108, 422, 426).
- **Deviations:** none.

## 3. What A changes (sketch `b-round-426/sketch-427.patch.txt`, sha256 `aef454cd…` [K10])
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-426/sketch-427.patch.txt`, then `git apply` the same file. It touches 7 files: 6 modified, 1 new.
   - **Do not edit those seven files afterwards.**
   - If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11). Do not edit around it.
3. **Doc:** create `docs/implementation/2026/quarter-IV/275-sys-held-enter-panels.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** In Progress (stage 3 of 4; C round 427 PASS)` (L28).
   - It has TEMPLATE's 7 `## ` headings, in order (L26).
   - Content:
     - rulings 1–8;
     - A-R107-SWEEP-HELD-ENTER-TOOLBAR → HP1–HP9 (partial; it stays open for 2b-ii);
     - TL-R425-09 → HM5b (characterization);
     - the HEAD counts from §1;
     - a mutant block that copies the 12 lines of `b-round-426/mutants/summary.txt` byte for byte;
     - the browser HEAD-vs-sketch table from `b-round-426/probe/compare.txt`;
     - TODO: SYS-2 stage 2b-ii (ruling 7).
   - It cites only rows and files that exist (L26).
4. Write `a-round-427.md` as you go. It has:
   - the changed files;
   - each check with its rc and log path (`a-round-427/`);
   - the reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-426/grants-427.txt`, 8 paths)
- `app/components/arrangement/ArrangementDetailPanel.tsx` (sketch only)
- `app/components/arrangement/ArrangementLibrary.tsx` (sketch only)
- `app/components/arrangement/ArrangementLibraryPreview.tsx` (sketch only)
- `app/components/arrangement/ArrangementVideoDock.tsx` (sketch only)
- `app/components/arrangement/StudioWorkspace.tsx` (sketch only)
- `app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx` (sketch only: HM5b and one import)
- `app/lib/arrangement/__tests__/panel-held-enter-ui.test.tsx` (new, sketch only)
- `docs/implementation/2026/quarter-IV/275-sys-held-enter-panels.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 6 ` M` lines and 2 `??` lines.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-426/claims-427.sh` at the start | Equals `claims-427-planning-output.txt`; stderr empty |
| A2 | `npx vitest run $(grep '^app/' ../tmp/studio-real-loop/b-round-426/covering-files.txt)` from `store/`. That is 68 files: every test file that references the changed buttons, testids, labels or `repeat: true`, plus the render-log files and the two held-Enter files | rc 0; **68 files, 1226/1226** (`b-round-426/precheck-a2.log` [K18]). `panel-held-enter-ui` alone is 9/9 and `mixer-held-enter-ui` is 18/18 |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0 (`precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info (`precheck-lint.log`) |
| A4 | `npx biome check` on the 7 granted code and test files | rc 0, no fixes (`precheck-biome7.log`) |
| A5 | Claims at the end | Differs from the planning output only in the lines that `claims-427-planning-vs-sketch.diff` lists, with these exceptions: K1 stays `052c76c…`; K5 becomes `no` (the sketch is already applied); K2 becomes `2 ?? 6 M total 8` (the scratch shows `1 ??` because it has no doc); K6 shows the doc 275 name and its l.4. K8, K9, K9b, K9c and K17 equal `claims-427-sketch-output.txt`. K2b is 0; K3 is 1,319 rc 0; K4 is rc 0 |
| A6 | `code-reviewer` on the diff and doc 275 (8 files) | No Critical, High or Medium in the sketch logic (otherwise STOP, L11). Rulings 1–8 and the TL-R426-01…09 findings in `sketch-review.md` are not new findings. Fix doc findings in the doc only |

**Timeout headroom (L31). The higher of the sketch and gate-426 times decides:**
- CP12c is 4.6 s at gate 426 (2.9 s on the sketch) against a 30 s describe timeout;
- TC10 is 2.3 s at gate 426 (2.2 s on the sketch) against 15 s [K32];
- the two held-Enter files have a 15 s describe timeout, and every test takes under 1 s on the sketch (the mixer file totals 6.8 s for 17 tests at gate 426).

No covering test is above 50 % of its timeout.

## 6. C's acceptance
**Before hand-off:** write `c-round-427.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-426/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-427.json c-round-427/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4–6 (browser), then the rest. Write `c-round-427/progress.json` after every row. Never run vitest while a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation and **stderr is empty**. K19 prints `L58 OK`. K13 lists every id with a location, none `NOT-FOUND`. Status shows only the 8 granted paths. Frozen: 1,319 rc 0. Protected: rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-427.patch.txt` to a `git archive HEAD` scratch and `cmp` the 7 files against the working tree: identical. The patch has 7 `diff --git` headers. A2's command gives 68 files, 1226/1226 |
| 3 | **MUTANTS** | **Base = HEAD with nothing applied:** `git archive HEAD \| tar -x -C /tmp/c427-mut`, symlink `node_modules`, then `git init && git add -A && git commit`. Copy `b-round-426` to `c-round-427/b426copy/` and run `python3 -I c-round-427/b426copy/mutants/run.py /tmp/c427-mut $PWD/c-round-427/b426copy`. Never write into `b-round-426/`. **Pass = the same 12 lines as B's `summary.txt`** [K16]: MU-HEAD-SRC turns HP1–HP9 red (9 failed, 18 passed of 27). Each single-site mutant turns exactly its row red: SNAP→HP1, ENVELOPE→HP2, LIB-FOLD→HP3, LIB-ALL/LIB-COLLECTION/LIB-FOLDER→HP4, LIB-DISMISS→HP5, DETAIL-TOGGLE→HP6, VIDEO-CLOSE→HP8, VIDEO-RETURN→HP9. VIDEO-EXPAND turns HP7, HP8 and HP9 red, because focus returns to Expand after Close and Return (ruling 5) |
| 4 | **HELD-ENTER BROWSER + FOCUS** | Real Chromium, `/studio-lab` on :5173 (A's tree), at **1440×900 and 1280×720**, with a fresh context per cell. Copy `b-round-426/probe/{held-enter-2bi.mjs,compare.py}` to `c-round-427/probe/`, and B's HEAD results `b-round-426/probe/head/*.json` to `c-round-427/probe/head/`. Run `OUT=<abs>/c-round-427/probe/sketch node <abs>/c-round-427/probe/held-enter-2bi.mjs`, then `python3 -I c-round-427/probe/compare.py c-round-427/probe`. The import `../../c-round-382/lib.mjs` resolves from `c-round-427/probe/`. **Pass: `ALL OK (18 cells)`** [K15]. That means the first Enter acts, three repeated Enter keydowns change nothing, and there are 0 page errors. `compare.py` also asserts the focus map and the ring below, and skips non-cell JSONs. **Focus after the repeats** (`focusedAfterHeld` in each JSON) must be: LDISMISS `arrangement-library-search` (`INPUT`, type `search`); VCLOSE and VRETURN `arrangement-video-expand`; every other cell, the target itself. Each has `focusVisible` true and `outline` `solid`, as B measured on the sketch. Warm `/studio-lab` once in a browser before the first cell (L38). A cold first load that times out is environment-invalid and is retried |
| 5 | **PER-PRESS SMOKE** (browser, both viewports) | Copy `b-round-426/probe/smoke-2bi.mjs` and run it with `OUT=<abs>/c-round-427/probe/smoke`. Use its own folder, never `probe/sketch`. **Pass = equal to B's HEAD output** `b-round-426/probe/head/smoke-*.json` [K27] (ignore `vp`). Expected values: Snap and Envelope clicks `false,true,false`; library fold `true,false,true`; folder click `aria-current` `true`; detail toggle click, then Space, flips once each (1440: `true,false,true`; 1280: `false,true,false`); video Expand click floats, Escape docks, then Expand + Close docks (`[1,0,0]`); 0 page errors. B's sketch output equals HEAD on both viewports (`smoke-compare.txt`) |
| 6 | **AUTH** (fresh context, no credentials, both viewports) | Copy `c-round-390/tools/g390-auth.cjs`. You may start the mock API from `mock-api/server.mjs` on :5199; if you do, record its PID in `c-round-427/mock.pid` and stop only that PID. Pass: the demo `/studio-lab` opens with the demo badge and `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=mix.wav` without auth → 401; bare `/api/studio-token` → 400; no token in any body. **BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud). It does not make `browserVerified` false |
| 7 | **DOC** | Doc 275 l.4 is byte-exact `**სტატუსი:** In Progress (stage 3 of 4; C round 427 PASS)`. The 7 TEMPLATE headings are in order. Its mutant block equals the 12 lines of `b-round-426/mutants/summary.txt` byte for byte. Every row id it cites exists in the test files. No other doc differs from HEAD |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims. `git diff HEAD --stat` lists only the 6 granted modified files. `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C. These are gate rows: they go under `"gate"` in the JSON, never under `"passed"`. B's full vitest on the final sketch: 266 files / 3,984 tests, rc 0 (`b-round-426/precheck-full.log` [K25]) |

**Retries (rows 4–6):** a cold-server first load, a port already in use or an overlapped job is an environment problem (L38). Retry at most twice; it is never a FAIL. A row that fails on a valid setup is a finding.

The browser probe and smoke were run by B on the v1 sketch (`82a785ce…`). Its 5 source files are byte-identical to the final sketch; the delta changes tests only (`sketch-delta-82a785ce-to-final.patch.txt`).

## 7. The new rows and their mutants (`b-round-426/mutants/run.py`; logs in `b-round-426/mutants/`)
| Row | Closes / advances | What it proves | Red under |
|---|---|---|---|
| HP1 | A-R107 (Snap) | a fresh Enter flips Snap; 3 repeats are prevented and change no snapshot field | HEAD-SRC, SNAP |
| HP2 | A-R107 (Envelope) | as HP1, for the Envelope toggle | HEAD-SRC, ENVELOPE |
| HP3 | A-R107 (library fold) | the collection folds once; focus stays on the fold | HEAD-SRC, LIB-FOLD |
| HP4 | A-R107 (library nodes) | folder, collection and All each select once (`aria-current`); the repeats are prevented. Selection is idempotent, so the prevented repeat is what the row observes | HEAD-SRC, LIB-ALL, LIB-COLLECTION, LIB-FOLDER |
| HP5 | A-R107 (notice dismiss) | a repeated Enter is prevented and does not dismiss; a fresh Enter dismisses once and focuses the search field; repeats there change nothing (that tail is characterization) | HEAD-SRC, LIB-DISMISS |
| HP6 | A-R107 (detail toggle) | a held Enter toggles once; Space plus a Space repeat still toggle once | HEAD-SRC, DETAIL-TOGGLE |
| HP7 | A-R107 (video expand) | Expand floats once | HEAD-SRC, VIDEO-EXPAND |
| HP8 | A-R107 (video close) | a repeated Enter is prevented; a fresh Enter docks once, focus goes to Expand, and repeats there do not re-float | HEAD-SRC, VIDEO-CLOSE, VIDEO-EXPAND |
| HP9 | A-R107 (placeholder return) | as HP8, for the placeholder Return (focus assert included) | HEAD-SRC, VIDEO-RETURN, VIDEO-EXPAND |
| HM5b | TL-R425-09 (characterization) | during a pointer gesture, the workspace prevents a fresh Enter on Pan reset before it can click: pan stays 0.5, focus stays on the reset, the refusal is written once, and the whole snapshot (incl. `statusSequence`) is unchanged after the repeats | none: green at HEAD by design (ruling 6) |

**The HP snapshot** contains:
- the arrangement JSON;
- the Undo title;
- the status sequence;
- the active track;
- the track and group attributes;
- every `aria-pressed`;
- the library `aria-expanded` and `aria-current`;
- the detail toggle `aria-expanded`;
- the video Expand label;
- the group name input;
- the file-chooser count.

The folded inline copies keep their existing covering rows in the A2 set (`library-preview`, `held-enter-add`, `library-focus-handoff`, `detail-panel*`, `self-disabling-focus`). Those copies are the Library expand, collapse and clear search, the LibraryPreview preview and add, and the DetailPanel clip-gain reset and Apply.

**Neighbouring behaviour that could break:**
- the detail toggle's Space handler (HP6; smoke);
- the library option, search and preview keyboard paths (covering);
- the video Escape-to-dock window branch (smoke);
- the `floating-video.test.tsx` focus rows (covering);
- Snap `G` and Envelope `A`, which are window keys and do not change;
- lane and footer render counts (`drag-preview-render` and `render-budget` in the covering set).

**Ableton conformance:** does not apply (see Reference).

## 8. Outcome, fixed in advance (for the 427 → 428 planning)
| C result | Next |
|---|---|
| PASS, no Medium+ | The gate publishes. Round 428 = REGRESSION-2026-11-13 if planning falls on or after 2026-11-13, otherwise SYS-2 stage 2b-ii, unless Saba answers STEM-LANES |
| A Medium+ finding in the changed code | Round 428 = its bounded fix-up |
| A STOP from A | B rules on it (L10) before re-dispatch |
| A browser row that could run was not run | `browserVerified` false; B re-plans that half |
