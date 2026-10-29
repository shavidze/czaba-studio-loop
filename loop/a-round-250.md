# A round 250: SABA-B-10a stage 2a. Edit commands use the Insert Marker, the past-end refusal names its start point, keys are blocked during a gesture

Written 2026-10-29 by A. HEAD is `dcb7eb14127850eecad45f373cdebba2258ee95e`, unchanged. No commit or push. Evidence folder: `a-round-250/`.

## STOP: needs B ruling on a covering-test flake (L11)
- **Covering run 1** was 1839/1841: 2 rows of `app/lib/arrangement/__tests__/export-progress-ui.test.tsx` failed.
  - "SRW-20 stage 3a export progress while the encoder module is still importing (…runs first in this file, while the import gate is still closed)": l.319, `resetEncoderMock` expected 1 call, got 0.
  - "PU4 with the module loaded, a never-settling load resets once…": l.350, expected 1 call, got 2.
  - Evidence: `a-round-250/covering.json` and `covering.log`, kept.
- **Run 1 had concurrent load:** the code-reviewer subagent was running and I was extracting the `/tmp` scratch with `git archive`.
- **Isolated reruns** of that file: 3/3 green, 8/8 each (`export-progress-rerun-{1,2,3}.log`).
- **Covering run 2,** with nothing else running: **123 files, 1841/1841 green** (`covering-2.json`).
- `git diff HEAD -- app | grep -ci encoder` = **0**. The round does not touch export, encoder or timer code.
- Gate 249 `verify.log` l.1491 has the same file green (8 tests, 1430 ms).
- **My reading:** a load-sensitive flake in fake-timer code this round did not change. It is not a regression of this diff. B rules on whether it needs a flake task (gate risk under a loaded full run). The tree is consistent and complete.
- No covering test is above 50 % of its timeout. The slowest are CP12a–d at 8.2–8.8 s against 30 s (29 %). Gate 249 had CP12 at about 8 s.

## Scope completed
- **Start state (§0):** checked before applying anything.
  - HEAD was `dcb7eb1` and `git status` was empty.
  - `sha256sum -c` gave rc 0 on all three lists: the frozen 1,097, the root list and the grant-start list.
  - The diff sha256 was `928c4950…5fe2811`, as stated.
- **Grants 1–12:** applied `b-round-249/precheck-scratch.diff` as is (`git apply -p1`, rc 0).
  - `git diff --numstat` matches the §0.1 table: +39/−22, +2/−2, +3/−2, +3/−1, +19/−7, +3/−3, +168/−7, +30/−12, +6/−2, +5/−3, +1/−1, +1/−1.
  - `git diff HEAD -- app` equals the precheck diff file by file (scripted compare: same file set, same hunks).
- **Grant 13 (doc 191):**
  - l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 250 PASS)`.
  - The title names stages 1–2a.
  - Stage 2a is added to all seven TEMPLATE sections, in order (`grep -n '^## '`: კონტექსტი l.7, მიდგომა l.28, არქიტექტურა l.131, შეცვლილი ფაილები l.170, პრობლემები და გადაწყვეტები l.214, ტესტირება l.241, TODO l.270).
  - **Content added:**
    - the §1.1 table with D-29z437, the §1.2 origins with D-29z438, and the 2a/2b split with D-29z436;
    - three rejected alternatives;
    - the measured facts kept apart from the inferences (paste: "no reference found");
    - the Mermaid diagram extended with `getLocatorPosition`, the three command readers, the origin edges and the gesture guard;
    - the round-250 file list;
    - three Problem → Solution entries;
    - the round-250 tests;
    - the TODO for 2b, 10b, 9, the Saba questions (d) and (e), ABL-R-10 and GATE249-ARCH-TRANSPORT-POSITIONS.
  - The reviewer's doc finding is corrected: only Ctrl/Cmd+Shift+Space has the `event.repeat` check; Home never had it.
  - Every cited test id was grepped and exists: IM3, IM11, IM13, IM15–IM21, BR4b, BR8, BR13, ST6/10/11/12/28, NS1, MS1, and the D-27 row at `ArrangementContext.test.ts:645`.
- **End state:**
  - `git status --short --untracked-files=all` shows exactly `M` on the 13 grants and nothing else.
  - Nothing was left inside `store/`.
  - The 7 protected files give `git diff --quiet HEAD` rc 0.
  - `sha256sum -c` gave **rc 0** on the frozen 1,097 list and **rc 0** on the root list, both re-run at the end.

## Hunks (source, grants 1–6)
- **`ArrangementContext.tsx`:**
  - `PlaybackStartOrigin` and the private `PLAYBACK_START_SUBJECT` `Record`.
  - `playPastEndMessage(position, end, origin)`.
  - `startPlaybackAt(current, origin)`: `togglePlayback` passes `'selection'` or `'insert-marker'`, `continuePlayback` passes `'playhead'`, and `playFrom` passes `'insert-marker'` for both the start and the refusal.
  - `getLocatorPosition()` is on the interface and in the value and memo deps.
  - `pasteClipboard`, `addSourceToActiveTrack` and both no-range `splitSelection` branches read `insertMarkerRef.current`, and `livePosition` left those dep lists.
  - `splitPlayheadOutside` → `splitInsertMarkerOutside`.
- **`StudioWorkspace.tsx`:** Ctrl/Cmd+Shift+Space and Home also require `!current.isPointerGestureActive()`. `preventDefault` is unchanged.
- **`ArrangementMarkerRow.tsx`:** `beginAddMarker` reads `getLocatorPosition()`. The range start still wins.
- **`ArrangementTransport.tsx`:** the Split title uses `splitAtInsertMarkerTitle`.
- **`strings.ts` and `shortcuts.ts`:** the §1.3 texts, exactly.

## Tests run (actual)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0: 533 files, 205 warnings and 1 info (`lint.log`) |
| `npx biome check` on grants 1–12 | rc 0, "Checked 12 files … No fixes applied", 0 diagnostics (`biome.log`) |
| Covering set, run 1 (123 files) | 1839/1841: the export-progress flake, see STOP |
| Covering set, run 2 (123 files, alone) | **1841/1841** |
| `export-progress-ui.test.tsx` alone ×3 | 8/8 each time |

Not run: the full suite, `npm run verify`, the build and e2e smoke. Those are gate rows under the speed rule.

The lint warnings were not compared with HEAD's count. Biome on the 12 granted files reports 0 diagnostics, so none of the warnings is in a changed file.

## Mutants (scratch `/tmp/a250-fixed` = `git archive dcb7eb1` + the 12 changed files; logs in `a-round-250/mutants/`)
`run-mutants.sh` gave the following (17 runs). It matches §0.2 row for row:
- FIX-CONTROL: none
- MU-PASTE-LIVE: IM15
- MU-ADD-LIVE: IM16
- MU-SPLIT-ONE-LIVE: IM17
- MU-SPLIT-MULTI-LIVE: IM17
- MU-M-LIVE: IM18
- MU-M-MARKER: IM18
- MU-STARTAT-PLAYHEAD-SUBJECT: D-27 row (AC), IM11, IM19
- MU-PLAYFROM-PLAYHEAD-SUBJECT: BR8, BR13
- MU-SHIFT-AS-MARKER: IM19
- MU-SELECTION-AS-MARKER: IM19
- MU-NO-GESTURE-GUARD-CS: IM20
- MU-NO-GESTURE-GUARD-HOME: IM20
- A-MU-CTRL-ONLY: IM3
- C-MU-LEAK-CS: IM13
- C-MU-LEAK-SHIFT: IM13
- MU-SCRUBEND-NO-RANGE-CLEAR: IM21

MU-HEAD (by hand, `/tmp/a250-muhead`, the 6 source files from `dcb7eb1`) went red on **IM15, IM16, IM17, IM18, IM20, MS1, NS1, ST6, ST10, ST11, ST28** (11/133 failed). This matches §0.2 exactly. IM3, IM13, IM19 and IM21 stay green at HEAD, as B explains.

**Extra mutant (from the reviewer's finding), A-MU-PASTE-SPLIT-LOCATOR:** paste and both split branches read `getLocatorPosition()` instead of `insertMarkerRef.current`. Result: `tsc` rc 0 and **none red** (133/133 green). This confirms the Medium below.

Repo `git status` was identical before and after the mutants (`status-before-mutants.txt` = `status-after-mutants.txt`).

## Playwright (Chromium, `http://127.0.0.1:5173/studio-lab`, 1440×900 and 1280×720, fresh context per case)
I ran copies of B's scripts: `a-round-250/edit-probe-250-a.cjs` (all 9 cases) and `box-probe-250-a.cjs`. Results are in `edit-a.json` and `box-a.json`, screenshots in `shots-edit-a/` and `shots-box-a/`.

**Invalid attempt, kept:** `edit-a-attempt1-timeout.log`. The first cold load after the source change timed out waiting for "Demo collection ready", the same as B's attempt 1. I re-ran it, and the second run completed every case.

| Case | 1440 | 1280 | Matches the §0.3 Fix column |
|---|---|---|---|
| paste (stop 3.483) | `sfx@2.000`, `Paste (1): at 00:02.000 · on the SFX track.` | same | yes |
| split stopped (stop 6.491) | `music@5.000`, `Clip split at 00:05.000.` | same | yes |
| split while playing | split at 5.000, still playing (7.011) | 5.000, playing (7.002) | yes |
| M stopped / playing | `00:02.000` / `00:03.172` while playing | same | yes |
| Enter-add stopped (stop 4.491) | `sfx@3.000`, `“Soft impact” added to the SFX track at 00:03.000.` | same | yes |
| Enter-add playing | `sfx@3.000`, playing (5.362) | same | yes |
| past end 18 / 16 | Space: `Insert marker (00:18.000) is past …`; Shift+Space: `Playhead (00:18.000) …`; no playback | same | yes |
| keys during a drag | mid-drag and after pointerup: marker `2.000`, playhead 3.483, range present | same | yes |
| splitNoTarget | the exact `splitNeedsTarget` text, 16 px, one line, sw = cw 1416 | sw = cw 1256 | yes |
| status box at past end | 16 px, sw = cw 1416 | 16 px, 1256 | yes |
| `?` sheet rows | 20 / 20 / 40 px, no overflow | same | yes |

**Every case had 0 page errors.**

**Extra case, A:** paste while playing lands at `sfx@2.000` with playback continuing, at both viewports (`paste-playing-a.json`).

**Not run by A** (C rows): the scrub-strip past-end click, C-CMD-250 (CDP `metaKey`), C-KEYS-250 in the fields, C-HANDLE-RANGE-250, C-BUDGET-250, the export WAV hash and the auth standing check.

## code-reviewer (real subagent, read-only) — score 8/10, no Critical or High
1. **Medium, open, not fixed in round (A-R250-REVIEW-PASTE-SPLIT-PLAYING):** IM15 and IM17 test Paste and Ctrl+E only while stopped. A change of paste or split to `getLocatorPosition()` (the M rule) passes the whole granted test set. A-MU-PASTE-SPLIT-LOCATOR proves it: 0 red.
   - **Product behaviour is correct, measured in Chromium:**
     - split while playing lands at 5.000 (`edit-a.json`);
     - paste while playing lands at 2.000 (`paste-playing-a.json`, script `paste-playing-probe-a.cjs`: copy at 8, SFX lane click at 2, Space, 1 s, Ctrl+V). At both viewports: `sfx@2.000`, status `Paste (1): at 00:02.000 · on the SFX track.`, playhead 3.503 and still playing, 0 page errors.
   - **Not fixed here** because C-SCOPE-250 requires `git diff HEAD -- app` = the precheck diff, file by file. The class matches A-R249-REVIEW-IM3-CMD. This is a test-strength gap, not a regression, so it is not an L11 STOP.
   - **Proposed fix for B:** add a playing branch to IM15 and IM17 (Space, advance 1 s, live > marker, paste or split, expect the marker time). Red proof: A-MU-PASTE-SPLIT-LOCATOR.
2. **Low:** IM18 does not check that a time-selection start beats the locator, stopped or playing.
3. **Low:** IM20 does not assert `preventDefault` on the blocked keys (`fireEvent.keyDown(...) === false`), and has no `metaKey` variant.
4. **Low:** the sheet row `marker` says "Add a marker at the insert marker". That is inaccurate while playing and when a selection exists (`addTitle` is accurate). The text is pinned by §1.3 and C-TITLES-250, so it is not changed. B decides on the copy.
5. **Info:** the `ArrangementContext.test.ts:487` title "pastes at the playhead" is stale. It passes because `seekTo` writes both positions.
6. **Info:** the doc said both keys keep `event.repeat`. **Fixed in doc 191:** Home has no repeat check.
7. **Info:** a strip or flag play exactly at the end reads "(00:16.000) is past the end … (00:16.000)". This predates the diff (the D-27 at-or-past-end rule for `playFrom`). Candidate for 2b.

**Architecture note (proposal for B and root, nothing extracted):**
- Signals 3/4: `ArrangementContext.tsx` l.1331–1513 (transport and position commands) has changed three rounds in a row (248–250), and the owner holds a second position lifecycle (`insertMarkerRef`/`insertMarkerStore`).
- Keep the refs in the context, because they are tied to audio timing.
- Proposal, under GATE249-ARCH-TRANSPORT-POSITIONS: extract only a pure `lib/arrangement` resolver (command, isPlaying, range) → position source, with table tests mirroring D-29z437. Do it at the 10a/10b checkpoint, not in round.

## Known gaps
- The export-progress flake (STOP above): B ruling needed.
- A-R250-REVIEW-PASTE-SPLIT-PLAYING (Medium test gap) and reviewer Lows 2–4 are reported, not fixed (C-SCOPE-250 diff equality).
- The `selection` origin is reachable only through the API (jsdom IM19), with no browser row. This is as B planned.
- A real Mac Cmd+Shift+Space stays TLM-R249-MAC-CMD-SHIFT-SPACE.

## Exact next C checks
- **C-SCOPE-250:** 13 `M` paths; app diff = precheck diff; hashes; the 7 protected files.
- **C-UNIT-250:** the covering set. Watch `export-progress-ui.test.tsx` under load.
- **C-MUT-250:** the 18 runs, plus optionally A-MU-PASTE-SPLIT-LOCATOR (expected green: the gap).
- **Feature rows:** C-PASTE-250 (plus the paste-while-playing info), C-SPLIT-250, C-SPLIT-REFUSAL-250, C-ADD-250, C-M-250, C-PASTEND-250 (including the scrub-strip click), C-GESTURE-250 (`document.activeElement`), C-CMD-250, C-KEYS-250.
- **Text and screen rows:** C-TITLES-250, C-STATUS-BOX-250, C-BUDGET-250.
- **Other rows:** C-HANDLE-RANGE-250, AN-REVIEW-250 (l.4 byte-exact, headings, cited ids), LAB-SMOKE-250 (WAV sha `1fea093b…`), the auth standing check; the purchased origin is BLOCKED (backend).
- **Neighbours (§6):** library drag-drop at the drop point, all-lane paste, the range split, MU4 (M on an existing marker), and Ctrl+←/→ still from the playhead.

## B acceptance items A actually passed
- §4 steps 1–7 are done: start state, apply, static checks, covering set (run 2 green; run 1 flake reported), 18 mutant runs matching §0.2, code-reviewer, and Playwright matching §0.3 Fix at both viewports.
- C's rows are C's to pass. The backlog is not marked complete.
