# C — Round 129 verification: VISUAL-A V-0.2a (edit-command messages in English)

Verifier: C · Date: 2026-10-24 · Server: env-status.json store 200 (round 129) · Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720. No store writes by C.

**Verdict: PASS.** `browserVerified` = `realVerified` = true. No bugs found.

## Rows
| ID | Result | Evidence |
|---|---|---|
| T129-TARGETED | **PASS.** A's 19-file list: 19 files, 386 tests, all green. Matches A's counts. | `c-round-129/out/vitest.log` |
| SOURCE-SCOPE | **PASS.** Start and end: 11 ` M` + 1 `??` (doc 105). Frozen list (929 entries) OK. `git diff 77f2763` on the 5 protected files is empty. A's 12 end hashes match. The grants did not change during C's phase (`c-start-sha256.txt` re-checked at the end). | `out/git-status-end.txt`, `out/c-start-sha256.txt` |
| AN-REVIEW | **PASS** (findings for B below). `strings.ts`: one new `studioEditStrings` object, the X1 value changed, two local interfaces, no imports, no other `studioExportStrings` change. Context: the import changed; the 6 constants were deleted (`LOOP_STEP_BLOCKED_MESSAGE` kept); every other hunk is inside the 8 commands and only swaps a string expression for a module value or formatter. There is no change to any condition, dependency array or call order. The ternaries (`allTracks`, paste refusal, `hasMaterial`, loop/marker suffix) and the `?? '—'` fallback stay in the Context. Meaning check against the Georgian originals: no E row adds or drops a fact. The E36b spacing is kept: the Context adds the space before `loopRemoved`, and `markersRemoved` carries its own leading space. Tests: each hunk is either an import or a literal → module reference with the same matcher, and the track names are kept. ST6–ST9 are present: ST6 checks that the key list equals the expected list; ST7 samples every plural formatter at 1 and 3, and the track formatters with `SFX` and `—`; ST8 checks the formatter list against the sample list; ST9 checks both anchors. | `out/diff-src.txt`, `out/diff-tests.txt` |
| EDIT-COPY (both) | **PASS.** 29 exact `===` matches at 1440 (r3) and 29 at 1280 (r1); a second 1440 run (r4) also matched. C wrote the expected strings by hand from §1.1, not by importing the module. Georgian in the status region is 0 after removing the track names `მუსიკა` and `სტემები`. | `out/edit129-1440-r3.json`, `out/edit129-1280-r1.json`, `out/edit129-1440-r4.json` |
| UNDO-LABEL (1440, also 1280) | **PASS.** All 13 labels were exact: `Undo: Split`, `Split (2)`, `Split (1)`, `Split at time selection`, `Delete clip`, `Delete clips (2)`, `Delete time selection`, `Delete time selection (all tracks)`, `Duplicate (1)`, `Paste (1)` ×2, `Cut`, `Cut Time`. Each Ctrl+Z restored the clips and markers exactly. Each Ctrl+Shift+Z re-applied them, with matching `Redo: …` titles. Undo titles contain 0 Georgian after these edits. | same JSONs, `undoTitleOk/undoRestored/redoReapplied` |
| EDIT-LAYOUT (both) | **PASS.** S0 and S1 compared with `c-round-125` baselines: 0 boxes moved by more than 1 px at either viewport (1440: 111/122 elements, 1280: 103/121). S2: the only differences are the Done and Export WAV buttons renamed in round 128. The status region after E14-all and E36 is identical to its pre-edit box (1440: 12,838,1416×16; 1280: 12,658,1256×16) and has no overflow. The Undo button after `Delete time selection (all tracks)` keeps its box (408.75,43,112×32) and the toolbar row tops (1440 [43,47], 1280 [43,47,81]); document width equals the viewport. | `out/layout-compare.json`, `undoBox`/`statusBox` in the edit JSONs |
| REG-EXPORT-COPY (1440) | **PASS.** The dialog `innerText` is byte-identical to round 128's S2 text. Georgian net count 0. X1 is not reachable in the browser, so it is inconclusive here (ST1 covers it). | `out/layout129-1440-r1.json`, `shots/S2-1440-r1.png` |
| G129-3 (last, alone) | **PASS.** `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required" at both 1440 and 1280, with no workspace and 0 `audio[src]`. The token API returns **401** `{"error":"Please sign in to access Studio."}`. The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)**. | `out/g129-3.json`, `shots/g129-3-*.png` |
| PX-NET / REG-HYD | **PASS.** In every session: 0 forbidden requests, 0 `Authorization` headers, 0 hydration errors, 0 `pageerror`. Only the known cart noise (2 per session) appeared. | `net` in each JSON |

## EDIT-COPY: messages and effects (1440 r3; 1280 r1 identical)
Setup: snap off; `CZABA hero` on მუსიკა at 0 (150.372 s); `პულსი` on სტემები at 2–18; `Soft impact` on SFX at 4–6.

| # | Action | Status (exact) | Effect observed |
|---|---|---|---|
| E8 | Ctrl+E, nothing selected | `To split, select a clip and place the playhead inside it, or make a time selection.` | no change |
| E9 | SFX selected, playhead 1 | `The playhead must be inside the selected clip.` | no change |
| E11 | SFX selected, playhead 5 | `Clip split at 00:05.000.` | SFX 4–5 and 5–6; the right part is selected |
| E4 | music + stems selected, playhead 10 | `2 clips split at 00:10.000; the right parts are selected.` | both split at 10; both right parts selected |
| E7 | range 12–14 on stems | `Clip split at both edges of the time selection; the middle part is selected.` | stems 10–12, 12–14 (selected), 14–18 |
| E21 | Ctrl+Shift+L on 15–16 | `Selection on all tracks: 00:15.000 — 00:16.000.` | range now covers all 4 lanes |
| E1 | Ctrl+E on that all-track range | `Split does not work on a selection across all tracks — make a time selection on one track.` | no change |
| E4 (n=1) | SFX 5–6 + stems 2–10, playhead 4.5 | `1 clip split at 00:04.500; the right part is selected.` | only stems split |
| E2 | two SFX clips, playhead 8.5 | `The playhead does not cross any selected clip.` | no change |
| E19 | Delete one clip | `Clip deleted; the gap remains.` | SFX 5–6 removed; nothing moved |
| E16 | Delete 2 clips | `2 clips deleted; the gap remains.` | 2 removed; gap kept |
| E14 | Delete range 1–3 on music | `⌫ Deleted 00:01.000 — 00:03.000 on the მუსიკა track; the gap remains.` | music 0–1 and 3–10; gap kept |
| E21 + E14 | Ctrl+Shift+L on 6–8, then Delete | `Selection on all tracks: 00:06.000 — 00:08.000.` → `⌫ Deleted 00:06.000 — 00:08.000 on all tracks; the gap remains.` | music and stems both cut at 6–8; gap kept |
| E17 / E20 | no target | `To delete, select a clip or make a time selection.` / `Make a time selection first to extend it to all tracks (Ctrl+Shift+L).` | no change |
| E23 / E26 / E22 | Ctrl+D: nothing, stems 14–18, a range | `Select a clip to duplicate.` / `Duplicate (1): the copy starts at 00:18.000.` / `Duplicate works on clips; there is no Duplicate Time.` | copy at 18–22, selected; the range case changed nothing |
| E30 | Ctrl+C clip | `Copy: 1 clip on the clipboard.` | no arrangement change |
| E37 | Ctrl+V at 13 (stems occupied) | `Paste failed: 00:13.000–00:17.000 on the სტემები track is occupied. Nothing changed.` | no change |
| E28 | Ctrl+C range 12–14 on music | `Copy: მუსიკა 00:12.000–00:14.000 (1 part).` | no change |
| E42 | Ctrl+V at 1 | `Paste (1): at 00:01.000 · on the მუსიკა track.` | music clip 1–3 (source offset 12), selected |
| E32 / E33 | Ctrl+X: nothing, then the pasted clip | `To cut, select a clip or make a time selection.` / `Cut: 1 part on the clipboard; the gap remains.` | clip removed; gap kept |
| E28 (all) / E42 (all) | all-track copy 12–14, paste at 6 | `Copy: all tracks 00:12.000–00:14.000 (1 part).` / `Paste (1): at 00:06.000.` | music clip 6–8; no track suffix |
| E34 | Ctrl+Shift+X with no range | `Make a time selection first for Cut Time (Ctrl+Shift+X).` | no change |
| E36 | marker at 16.5, range 16–17, Ctrl+Shift+X | `Cut Time 00:16.000 — 00:17.000: 2 parts on the clipboard; the gap was closed on all tracks. 1 marker deleted.` | music and stems shift left by 1 s after 16; marker removed |

Not exercised in the browser (inconclusive, unit tests only):
- E24 `duplicateConflict`: not in the task's (c) list and not exercised; ST7 covers it.
- E36b `loopRemoved` suffix: not exercised; only the marker half of E36b was verified. ST7 covers it.

Not reachable in the browser, covered by unit tests only (inconclusive):
- E5, E35, E38, E39.
- E12, E27, E31: dragging on empty lane background creates no time selection, so a range with no material could not be built.

## Screenshots
Opened and checked by C:
- `shots/E36-msg-1440-r4.png`: the bottom status line shows the full English Cut Time message. The marker row is empty, and the music/stems clips after 16 s are shifted left. Undo reads `Undo: Cu…` (truncated).
- `shots/E42-msg-1440-r4.png`: the status line reads `Paste (1): at 00:01.000 · on the მუსიკა track.` The pasted clip at 1–3 s is selected. The detail panel shows start 00:01.000, length 00:02.000, source offset 00:12.000.
- `shots/E14all-1440-r3.png` and `shots/E36-1280-r1.png`: taken after the Undo/Redo cycle. The status line shows `Redo: Delete time selection (all tracks)` / `Redo: Cut Time`, all in English. Gaps are visible on music and stems at 6–8. The toolbar is unchanged.
- `shots/S2-1440-r1.png`: the Export dialog is all English (Done / Export WAV), as in round 128.
- `shots/g129-3-protected-1440.png`: the lock icon, "Sign in required" and a Sign In button. No workspace.
- `shots/g129-3-protected-1280.png`: the same Sign in required page at 1280.
- `shots/g129-3-lab-1440.png`: the empty `/studio-lab` workspace with the demo badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`. Undo is disabled.
- `shots/E19-msg-1440-r4.png`: the status reads `Clip deleted; the gap remains.` The SFX 5–6 part is gone, the SFX 4–5 part stays, and nothing else moved. This is the m4 message, which has no unit assertion.
- `shots/E11-msg-1440-r4.png`: the status reads `Clip split at 00:05.000.` SFX is split at 5 with the right part selected. The toolbar shows `Undo: Split` in full.
- `shots/E14-msg-1440-r4.png`: the status reads `⌫ Deleted 00:01.000 — 00:03.000 on the მუსიკა track; the gap remains.` There is a gap at 1–3 on music only.
- `shots/E14all-msg-1440-r4.png`: the status reads `⌫ Deleted 00:06.000 — 00:08.000 on all tracks; the gap remains.` Gaps at 6–8 on music and stems.
- `shots/E33-msg-1440-r4.png`: the status reads `Cut: 1 part on the clipboard; the gap remains.` The 1–3 music paste is gone. The toolbar shows `Undo: Cut`.
- `shots/S1-1280-r1.png`: the S1 setup (video, marker, loop 2–4, group, SFX selected) matches the baseline layout. The status line is the Georgian group message, which is V-0.2b/V-0.2c scope.

Not opened individually (kept as raw evidence; the same states were checked through JSON measurements): `S0-*`, `S1-1440-r1`, `S2-1280-r1`, `setup-*`, and the post-Undo/Redo `E11/E14/E19/E33/E36/E42-*-r2/r3/r1` shots. `explore-1440.png` comes from the orientation run.

## Invalid runs
- `explore-1440` attempt 1: ENV-FIRST-LOAD. The grid control was missing right after load. Discarded; attempt 2 was OK.
- `edit129-1440-r1`: a harness error on C's side. Escape does not clear the clip selection, so E8 met a still-selected clip (it showed the E9 text) and E19 deleted a 2-clip selection (it showed the E16 text). Both texts were correct for the actual state. C fixed the script to deselect by clicking the empty SFX lane. C deleted this run's JSON by mistake while renaming it; only the console output survives.
- `edit129-1440-r2`: valid, but E33 hit E32 because Redo after Paste does not restore the selection. That behaviour predates this round. r3 added a direct E33 step.

## Notes for B (not bugs)
1. A's deviation 1: four English fragment assertions (`the clipboard did not change`, `the gap was closed`, `marker`). They keep the same matchers and are not weaker than the Georgian fragments. The reviewer's L2 point is a possible deferred Low: they would pass silently if the wording changes later.
2. A's deviation 2: the 6 constants were deleted, which §2(b) allows. ST9's per-constant check now has nothing to check; the slice check covers the places where they were used.
3. m4 survived: no UI unit test asserts the delete-clip status. C confirmed E19 and E16 exactly in the browser at both viewports. A test assertion is still worth adding in a later round.
4. The visible Undo label is truncated (`Undo: De…`; span 252 px of text in 74 px). It was already truncated before this round (the Georgian add-clip label was 203 > 74). The box is unchanged and the full text is in `title`. Not a regression.
5. Redo after Paste does not restore the pasted selection. This round only changed strings, so it did not cause this. Recorded for information only.
6. The Studio is still mixed-language, as planned: track names, toolbar `წაშლა`, the add-clip status and Undo label (`დამატება — …`), and the detail panel stay Georgian until V-0.2b, V-0.3 and V-0.4.

## Ableton
- **CZABA requirement met:** yes. The text is exact and the effects did not change.
- **Correspondence with Ableton:**
  - The Split, Cut Time, Paste, Duplicate and time selection terms are **confirmed** (Live 12 manual ch. 6, §6.11/§6.12, via B's capture `b-round-71`).
  - Cut Time closing the gap on all tracks is **confirmed** and was observed in the browser.
  - Delete leaving a gap is a **conscious difference** (user decision 2026-10-11) and was observed.
  - "No Duplicate Time" is a **conscious difference**, and the message says so.
  - The Undo label wording is **unconfirmed**; C makes no claim about it.

## Gate rows (not claimed by C)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
