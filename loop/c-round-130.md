# C — Round 130 verification: VISUAL-A V-0.2b (playback, library, loop and nudge messages in English)

Verifier: C · Date: 2026-10-24 · Server: env-status.json store 200 (round 130). Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, 1440×900 and 1280×720. C made no store writes.

**Verdict: PASS.** `browserVerified` = `realVerified` = true. No bugs. Every browser row was run at both viewports. The P texts that cannot be reached in the cloud are listed as inconclusive, not passed.

Expected strings in the browser harness were **hand-written from task §1.1**, not imported from `strings.ts`. Times use C's own `mm:ss.mmm` formatter, and the playhead value is read from `aria-valuenow`.

## Rows
| ID | Result | Evidence |
|---|---|---|
| T130-TARGETED | **PASS.** A's 21-file list: 21 files and 413 tests, all green. The per-file counts match A's: strings 13, status-announcement-ui 33, grid-snap-loop-drop 36, ArrangementContext 21, and so on. | `c-round-130/out/vitest.log` |
| SOURCE-SCOPE | **PASS.** At the start and at the end: 11 ` M` + 1 `??` (doc 106). Frozen list (930) OK. The protected files are unchanged against `1e453b1`. The 12 hashes equal A's end hashes, and they were re-checked unchanged at the end of C's phase. | `out/git-status-start.txt`, `out/git-status-end.txt`, `out/c-start-sha256.txt` |
| AN-REVIEW | **PASS.** See the notes below. | `out/diff-src.txt`, `out/diff-tests.txt` |
| PLAY-COPY (both) | **PASS.** See the table. No playback started: there was no AudioContext, `createBufferSource` was never called, the playhead stayed put over 500 ms, and the Play label did not change. A positive control (Home, then Space) did play: 1 buffer source, playhead 0.66 s after 700 ms. | `out/copy130-play-{1440,1280}-r1.json` |
| LIB-COPY (both) | **PASS** for (a), (b), (c), (d) and (e), and for the Undo titles in (f). P5 itself is inconclusive (no drop event on a blocked spot). | `out/copy130-lib-1440-r3.json`, `out/copy130-lib-1280-r1.json` |
| LOOP-COPY (both) | **PASS** for (a) through (g). P17 was reached by typing 10 / 10.05 into the detail inputs. | `out/copy130-loop-1440-r2.json`, `out/copy130-loop-1280-r1.json` |
| NUDGE-COPY (both) | **PASS** for (a) through (d). For the hold, CDP sent 1 keydown plus 10 `autoRepeat` keydowns, and the page recorded 11 keydowns with 10 `event.repeat`. P3 was announced **once** (1 status mutation), and the clip stayed at 0. This held with Snap on (the StudioWorkspace `===` path) and with Snap off (the Context thunk path). | `out/copy130-nudge-1440-r2.json`, `out/copy130-nudge-1280-r1.json` |
| DEL-COPY-RECHECK | **PASS** at 1440, and also at 1280. `Clip deleted; the gap remains.` with `Undo: Delete clip`; `2 clips deleted; the gap remains.` with `Undo: Delete clips (2)`. | `out/copy130-del-*.json` |
| GEO-COUNT (both) | **PASS.** Net Georgian is 0 in the status region and 0 in the Undo title for every step. The subtracted items are listed below. | `out/aggregate.json` |
| LAYOUT (both) | **PASS.** S0 and S1 compared with the `c-round-125` baselines: 0 boxes moved by more than 1 px (1440: 111 and 122 elements; 1280: 103 and 121). S2 differs only by the round-128 renamed Done and Export WAV buttons, the same as in round 129. After P9 and P4, the status region box is unchanged (1440: 12,838 1416×16; 1280: 12,658 1256×16). It stays one line with no overflow, and the document width equals the viewport. | `out/layout-compare.json`, `statusBox` in the run JSONs |
| G130-3 (alone, last) | **PASS.** First run at 08:31Z; re-run at 08:35:34Z as the last session, after the extra edge-drag runs, with the same result. `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required" at 1440 and 1280, with no workspace and 0 `audio[src]`. The token API returns **401** `{"error":"Please sign in to access Studio."}`. The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)**. | `out/g130-3.json`, `shots/g130-3-*.png` |
| PX-NET / REG-HYD | **PASS.** Every session had 0 forbidden requests, 0 `Authorization` headers, 0 hydration errors and 0 `pageerror`. The only console noise was the known cart errors (2 per session). | `net` in each JSON |

## Messages and effects (identical at 1440 and 1280)
| Row | Action | Status (exact) | Effect |
|---|---|---|---|
| PLAY a | Space on an empty project | `Nothing to play — add a clip from the library first.` | Nothing played |
| PLAY b | Soft impact on SFX at 0; ruler click at 5 s (Snap off); Space | `Playhead (00:05.000) is past the end of the project (00:02.000) — there is nothing to play here. Home returns to 0.` | Playhead stayed at 5.000; no buffer source |
| LIB a | Music track, playhead 0, ＋ დამატება | `“CZABA hero — საჯარო preview” added to the მუსიკა track at 00:00.000.` | music@0, selected. `Undo: Add — CZABA hero — საჯარო preview`; Undo removed it; Redo restored it |
| LIB b | SFX 0–2 exists, playhead 1, ＋ დამატება | `“Soft impact” added to the SFX track at 00:02.000 (nearest free spot).` | New clip at 2.000 |
| LIB c | Video track active, Enter on the focused option | `Choose an audio track (music, stems or SFX) — audio is not added to the video track.` | Clip count 3 → 3 |
| LIB d | Drag Soft impact onto SFX at 1 s (occupied) | Status unchanged | The ghost showed `00:01.000 · აქ ადგილი არ არის`; clip count 3 → 3 |
| LIB e | Drag onto SFX at 8 s | `“Soft impact” added to the SFX track at 00:08.000.` | Clip at 8.000. `Undo: Add — Soft impact`; Undo removed it |
| P1/P2 | Ctrl+Z, then Ctrl+E, during a live clip-header drag | `Undo/Redo does not work while dragging — let go first.` / `Editing does not work while dragging — let go first.` | Both refused |
| LOOP a | Ctrl+L with no range and no loop | `To set a loop, first make a time selection on the waveform.` | No brace |
| LOOP b | Range 1–3 on music, Ctrl+L | `Loop created and turned on: 00:01.000 — 00:03.000.` | Brace at 40 px, 80 px wide, on. `Undo: Loop created` → brace gone; Redo restored it |
| LOOP c | Range 4–6, Ctrl+L | `Loop replaced with the new range: 00:04.000 — 00:06.000.` | `Undo: Loop replaced` → brace back to 1–3 |
| LOOP d | Click the clip, Ctrl+L, Ctrl+L | `Loop is off; the range is kept.` / `Loop is on.` | `data-loop-enabled` false, then true, at the same position. `Undo: Loop off` / `Undo: Loop on` restore the previous state |
| LOOP e | Range 10–10.05 (detail inputs), Ctrl+L | `A loop needs a time selection of at least 0.1 s.` | Loop unchanged at 4–6 |
| LOOP f | Brace focused: ←; ← until blocked; drag the brace body +2 s; **drag the end edge +1 s** (separate session, loop 4–6); off, then → | `Loop: 00:03.900 — 00:05.900.` / `The loop cannot move further: start of the timeline or minimum length.` (after 40 presses, brace at 0–2) / `Loop: 00:02.000 — 00:04.000.` / `Loop: 00:02.100 — 00:04.100 · off.` | `Undo: Loop range` restores 4–6, and after the drag restores 0–2. End-edge drag: `Loop: 00:04.000 — 00:07.000.` (start kept at 160 px, width 80 → 120 px); `Undo: Loop range` restores 4–6 exactly (`out/edge130-{1440,1280}-r1.json`, `shots/LOOP-f-edge-*.png`) |
| NUDGE a | Clip at 0, ← (Snap off and Snap on) | `Nudge blocked — start of the timeline.` | Clip stays at 0 |
| NUDGE b | Clip at 2 butting 0–2, ← | `Nudge blocked — a neighbouring clip or the start of the timeline.` | No move |
| NUDGE c | Clip at 2, → | (no new status, by design) | 2 → 2.1. `Undo: Nudge clip` returns it to 2.000; Redo works |

## AN-REVIEW notes
- **`strings.ts`:** the four new objects only; `studioExportStrings` and `studioEditStrings` are unchanged; 0 `import` lines. Every value equals §1.1, including the curly quotes U+201C/U+201D and the leading space in ` (nearest free spot)`.
- **Context hunks:**
  - The import.
  - l.178–190: aliases. The exported names are kept; the private aliases are kept too, which B allowed.
  - `playPastEndMessage`: same signature, and it now calls the formatter.
  - String expressions inside `togglePlayback`, `startLibraryPreview`, `addSourceToActiveTrack`, `dropLibrarySource`, `toggleLoopSelection`, `commitLoopRange`, `stepLoopRange` and `nudgeSelectedClip`. The three multi-line reflows keep their arguments and order.
  - No condition, dependency array or call order changed. The `keyRepeat ? () => message : message` thunks are intact. l.1760 `გადატანა (${ids.length})` is unchanged.
- **Tests:** only 5 `it`s were added (SA-DEL and ST10–ST13), and none were removed. The ghost texts in `grid-snap-loop-drop` are kept, along with the Georgian track names. ST9 now uses `toBe(-1)`. There are no `skip`, `only` or `todo`.
- **Meaning check:** P1–P25 side by side with the Georgian originals: no fact is dropped or added. P4 names the track roles, per B's ruling.

## GEO-COUNT: subtracted items
- Track name `მუსიკა` (LIB a status).
- Sound title `CZABA hero — საჯარო preview` (LIB a status and Undo title; LOOP a's Undo title before the loop).
- The drop ghost `· აქ ადგილი არ არის`. It is a ghost element, not the status region, so nothing was subtracted from the region.
- Not triggered in these rows: the group nudge label, the group-blocked status and the collection-load message.

## Screenshots (opened and described)
- `PLAY-b-1280-r1.png`: the playhead and time readout show 00:05.000 / ბოლო 00:02.000. The Soft impact clip is at SFX 0–2. The status line shows the P9 text on one line, and Play is not active.
- `LIB-c-1440-r3.png`: the video track header is highlighted and ＋ დამატება is greyed out. The status shows the P4 text. SFX holds the two Soft impact clips at 0 and 2.
- `LIB-d-1280-r1.png`: after the blocked drop release, the SFX lane still has 2 clips and the status still shows P4 (unchanged).
- `LOOP-d1-1440-r2.png`: the dashed `Loop off` brace is at 4–6, and the Loop strip reads `Loop 00:04.000 — 00:06.000 · off`. The status shows `Loop is off; the range is kept.`
- `LOOP-f-blocked-1280-r1.png`: the brace is at 0–2, the Loop button is lit, and the status shows P8.
- `NUDGE-a-1440-r2.png`: the selected SFX clip is at 0 with a neighbour at 2, and the status shows P3.
- `LIB-b-1280-r1.png`: the selected clip is at 2.000 next to the 0–2 clip, and the status ends `(nearest free spot).`
- `LOOP-f-edge-1280-r1.png`: after the edge drag and Ctrl+Z, the brace is back at 4–6 (`Loop 00:04.000 — 00:06.000`), the status reads `Undo: Loop range`, and Redo is enabled.
- `g130-3-protected-1440.png`: a lock icon, "Sign in required", and the Sign In button. No workspace.
- `probe-1440.png`: a fully white page. This is the invalid ENV-FIRST-LOAD run; the second load, `probe-1440-r2.png`, was normal.

## Inconclusive (not passed; covered offline only)
- **P5:** real Chromium fires no drop on a blocked spot. The ghost and the no-change effect were verified.
- **P6, P12, P16:** no source is failed or still loading in the cloud.
- **P7:** Web Audio exists in this browser.
- **P11:** a demo source is always selected.
- **P13:** an `addClip` failure cannot be triggered.

These rely on ST10/ST11 and the jsdom tests.

## Invalid runs and harness reruns
- **ENV-FIRST-LOAD:** probe-1440 r1 was a blank first load; one replacement was used.
- **Harness reruns.** These were errors in C's own scripts, not in the app or the environment:
  - lib 1440 r1: the script clicked ＋ დამატება on the video track, where it is disabled.
  - loop 1440 r1: the expected span was built from raw input numbers.
  - nudge 1440 r1: the script looked for the clip at 2 after redo had moved it to 2.1.
  - lib 1440 r2: the redo comparator counted the selection mark.

  The app output was correct in every case. The final valid runs are listed in the JSON.

## Gate rows (not claimed by C)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## CZABA requirement vs Ableton correspondence
| Behaviour | CZABA requirement | Ableton correspondence |
|---|---|---|
| Ctrl+L sets or toggles the loop | Met: the messages and Undo titles are English, and the effects are unchanged | **Confirmed**: Live 12 manual §6.6 via B's capture `b-round-71/ableton-arrangement-view-20261021.txt`. C did not re-browse it. |
| Arrow keys nudge the loop brace | Met (`Loop: …`, P8) | **Confirmed term "nudge"** (same source) |
| Clip nudge; "nearest free spot" on add | Met | **Unconfirmed**: no Ableton claim is made |
| Space plays from the playhead; refusal past the end | Met | Space playback is **confirmed** (§6.3). The past-end refusal is a **deliberate CZABA rule** |

## Notes for B (no bugs)
1. **m7 deviation (A §9).** `grid-snap-loop-drop` cannot catch a `clipAdded` template mutation, because your §2 rule builds the expected text with the same formatter. Only ST11 guards the template. This is not a weakened test, and C's hand-written browser texts matched. B rules on it.
2. **Stale task wording.** The task's "button or `A`" is out of date: `A` is the Envelope hotkey. Add uses ＋ დამატება, or Enter on a focused option.
3. **P4 is reachable only by Enter.** On the video track, ＋ დამატება is disabled and gives no reason, so P4 can only be reached with Enter. This is existing UX and a possible V-0.3/V-0.4 polish item.
4. **INFO, already known (components unchanged this round).** Escape during a live clip drag does not cancel it: the clip committed at the release point (2 → 2.75). This is the existing ruled signal **ESCAPE-CANCEL-GESTURE** (B D-29z51: not a CZABA contract; c-round-85 M1-GHOST evidence). It is not a new finding and not a regression.
5. **Architecture note.** A's note goes to the V-0.2c frontend-architect checkpoint: the Context re-exports the module strings, and the leaf test imports the Context.
