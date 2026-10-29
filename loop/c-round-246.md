# C round 246: verification of B-R243-UNDO-MARKER-FOCUS and RT-FIX-246

**Verdict: PASS.** `browserVerified: true`, `realVerified: true`. There are no bugs. One row is BLOCKED because the backend is unavailable in the cloud. The gate rows are left to the gate.

- **Environment:** Chromium 143.0.7499.4 (Playwright). The fix ran on `:5173`. A HEAD control ran on `:5174`, built from `git archive e9fb805` in `/tmp/c246-head` with its own Vite cache.
- **Script:** `c-round-246/c246.cjs`.
- **Results:** `c-round-246/out-fix/c246.json` (fix) and `c-round-246/out-head/c246.json` (HEAD).
- **Screenshots:** `c-round-246/out-fix/*.png` and `out-head/*.png`.
- **Summary table:** `c-round-246/table.txt`.
- **Reproducibility.** `c246.cjs` on disk is the final version. `out-fix/c246.json` merges: <ul><li>the first full run;</li><li>the re-runs made after my recipe fixes: cutTime (taken from `out-dbg`), and addUndoPrevious, editorReg, editorOrigin and groupUndo (re-run on `:5173`).</li></ul>Running `node c246.cjs http://127.0.0.1:5173 <dir>` again reproduces every row.

## Acceptance rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-246 | PASS | <ul><li>HEAD is `e9fb805`.</li><li>Status is exactly `M` on ArrangementMarkerRow.tsx and markers-ui.test.tsx, plus `??` on doc 189.</li><li>`sha256sum -c` gives rc 0 on the tree list (1,104 files) and on the root list.</li><li>Each of the 7 protected files gives `git diff --quiet HEAD` rc 0 and is in the list once.</li><li>The `@@`/`+`/`-` lines of `git diff HEAD` on grants 1–2 are identical to `b-round-245/precheck-scratch.diff`.</li><li>The same checks gave the same result again at the end of the round.</li></ul> |
| C-UNIT-246 | PASS | <ul><li>`npx vitest run $(cat covering.txt)`: 58 files, 1,115/1,115 passed, rc 0 (`c-round-246/covering.log`).</li><li>`markers-ui` ran 31 tests in 5.45 s.</li><li>The slowest single test is CP12d at 6.7 s of its 30 s timeout (22 %). UC5 is 2.55 s of 20 s. Nothing is near 50 %.</li></ul> |
| C-MUT-246 | PASS | The scratch copy was outside the repo (`/tmp/c246-scratch`), run with B's `run-mutants.sh`, plus MU-HEAD by hand (`c-round-246/mutants-summary.txt`, `mutants/*.log`). Red rows: <ul><li>FIX-CONTROL: none (31/31).</li><li>MU-HEAD: MU18, MU19, MU20, MU23.</li><li>MU-ALWAYS-ADD, MU-PREVIOUS-FIRST and MU-STEAL: MU19, MU20, MU23 each.</li><li>MU-NO-ID-CHECK: MU4, MU7, MU8, MU8e, MU17, MU20, MU21, MU22.</li><li>MU-NEXT-NOT-SURVIVOR: MU23.</li><li>MU-BODY-BASED: MU21.</li></ul>This equals §0.2. The repo `git status` was identical before and after (`status-before.txt` = `status-after.txt`). |
| C-UNDO-ORIGINS-246 | PASS | At 1440 and 1280, every row lands on its successor with `:focus-visible` and a brass outline `solid 1px color(srgb .788 .643 .416 / 0.8)`; HEAD leaves BODY on every row (next table). The flag counts and the status texts equal HEAD. 0 page errors. |
| C-NO-STEAL-246 | PASS | Both viewports: <ul><li>Another flag (0.500) was focused and `Ctrl+Z` removed the new flag: focus stayed on the 0.500 flag.</li><li>Shift+Tab from a flag reached `arrangement-marker-next`; after `Ctrl+Z`, focus stayed there and the flag was removed.</li><li>A click on the non-focusable status line left focus on BODY; after `Ctrl+Z` it stayed BODY and the flag was removed. HEAD gives the same.</li></ul> |
| C-KEEP-246 | PASS | <ul><li>moveUndo: the flag is back at 0.000 and keeps focus, with the ring.</li><li>Rename: F2, type `Hit`, Enter, `Ctrl+Z`. The status reads `Undo: Rename Marker`, the old name is back, and the same marker id keeps focus with the ring.</li></ul>Both viewports; the fix equals HEAD. |
| C-CUTTIME-246 | PASS | The browser equivalent of MU23. The recipe: <ul><li>demo-stem-pulse is on Music;</li><li>flags are at 0, 2 and 6 s (with a clip, ArrowRight moves a flag 1 s, because the grid is seeded);</li><li>a time selection is Alt-dragged on the clip body;</li><li>the focus is on the 2 s flag.</li></ul>Results: <ul><li>Range 1–3 and `Ctrl+Shift+X`: the flags are 0 and 4, focus is on the 4.000 flag (the next survivor, shifted), and the status ends with `1 marker deleted.`</li><li>After `Ctrl+Z`, range 1–7: only 0 is left, focus is on the 0.000 flag (the previous survivor), and the status ends with `2 markers deleted.`</li></ul>Both viewports. HEAD gives BODY. |
| C-UNDO-BUTTON-246 | PASS | Both viewports, same as HEAD: <ul><li>A click on Undo removes the flag, the status reads `Undo: Add Marker`, and focus is on the history button "Redo: Add Marker (Ctrl+Shift+Z)". Focus is neither BODY nor Add marker.</li><li>A click on Redo brings 1 flag back and focus is on "Undo: Add Marker (Ctrl+Z)".</li></ul> |
| C-MENU-DELETE-246 | PASS | <ul><li>The menu items are Rename (F2), Play from here and Delete (Delete).</li><li>Right-click the 0.000 flag and choose Delete: focus is on the 0.500 flag and the status reads `Marker “Marker 2” deleted.`</li><li>Right-click the remaining flag, then Escape: the menu closes and focus returns to that flag.</li></ul>Both viewports; the fix equals HEAD. |
| C-EDITOR-REG-246 | PASS | <ul><li>`M` opens the editor. A right-click on an empty lane opens the grid menu. After Escape, focus is on the new flag (1 flag, `:focus-visible`).</li><li>From `arrangement-marker-next` with no markers: `M` opens the editor, and Escape adds nothing and returns focus to that button with the ring. HEAD gives the same.</li><li>My first try of the second half was invalid: there was already a flag at the playhead, and `M` then opens no editor. I re-ran it on a clean state.</li></ul> |
| C-BUDGET-246 | PASS | Persistent text lines outside the timeline: <ul><li>1440×900: empty 85, demo 101.</li><li>1280×720: empty 69, demo 85.</li></ul>These equal the round-244 values. Screenshots: `budget-*.png`. |
| AN-REVIEW-246 | PASS | <ul><li>l.4 is byte-exact: `**სტატუსი:** Completed (C round 246 PASS)`.</li><li>The 7 TEMPLATE headings are in order.</li><li>The doc explains D-29z408 (l.24). It explains the ref-detach reason, keeping the measured Chromium and jsdom facts apart from the inference (l.44–53). It names the two rejected designs, onBlur and BODY-based, plus the StudioWorkspace option.</li><li>Every cited row exists (each grep gives 1): MU4, MU7, MU8, MU8b, MU8e, MU17–MU23.</li><li>B-R245-UNDO-GROUP-FOCUS is under TODO.</li><li>There is a Mermaid sequence.</li></ul> |
| RT-FIX-246 | PASS | <ul><li>`diff lessons-before-246.md lessons.md` changes only l.3 (header), l.35 (L50), l.39 (L11) and l.40 (L12). The file has 57 lines.</li><li>L11 contains "(a timeout included)", `not under "For B/root"` and "its declared timeout". L12 contains the "a hit that pins classes in a frozen or protected file is a STOP (L11) with the hit list" clause.</li><li>The L50 regex works under `grep -nE`: on the e9fb805 file it gives 12 hits, including l.779 `.map`, l.853 `{editor ? (` and l.880 `{menu && menuMarker`. The rule names its root: the granted files plus the callers found by grep, never the whole folder.</li><li>The caller grep gives the same 5 hits as `l50-undo-callers.txt`.</li><li>`diff retro-245-before-246.md retros/retro-245.md` changes only l.179–180. R49-T has one concrete question (relative vs absolute snap) and "ვადა: RETRO 260". GATE244-S4 has "ვადა: RETRO 260".</li></ul> |
| LAB-SMOKE-246 | PASS | Both viewports: <ul><li>Space plays (0 → 0.882 s, RMS 0.0013 / 0.0015) and pauses (the position holds).</li><li>The export WAV is 48 kHz, 24-bit, stereo, 768,000 frames = 16.000 s, peak 0.2967, −24.91 dB RMS, 0 NaN.</li><li>sha256 `1fea093b…3f94` matches.</li><li>0 page errors.</li></ul> |
| Auth | PASS | Fresh context, 0 cookies: <ul><li>`/studio-lab` opens the workspace and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401 "Please sign in to access Studio."</li><li>A fake Bearer returns 500 "Unable to prepare Studio access". No token is issued; the 500 is the backend being unavailable.</li></ul>Premium auth is not bypassed. |
| Purchased origin (browser) | BLOCKED | The backend is unavailable in the cloud. |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke belong to the root gate. They are not claimed. |

### C-UNDO-ORIGINS-246, focus after the step (fix vs HEAD)
The results are the same at 1440×900 and 1280×720.

| Case | Fix | HEAD |
|---|---|---|
| addUndo (`M`, `Enter`, `Ctrl+Z`) | `arrangement-marker-add`, ring | BODY |
| addUndoNeighbour (Marker 1 nudged to 0.100) | flag 0.100, ring | BODY |
| addUndoMiddle (C's own case: flags at 0.5 and 1.0, a new one at 0) | flag 0.500, the next survivor | BODY |
| addUndoPrevious (C's own case: a clip, a flag at 0, play and pause, a new flag later) | flag 0.000, the previous survivor | BODY |
| deleteRedo with `Ctrl+Shift+Z` | Add marker, status `Redo: Delete Marker` | BODY |
| deleteRedo with `Ctrl+Y` | Add marker, status `Redo: Delete Marker` | BODY |

## Neighbouring behaviour (§6)
- **Focus stealing on re-render.** A flag focused through 1.5 s of playback keeps focus. It also keeps focus during a 60 px mouse drag and after it; the flag ends at 1.500, with the same id. The focus does not jump.
- **Delete, the menu Delete, the editor successor, the history labels and the statuses** are unchanged from HEAD (rows above).

## Info (not pass criteria, no bug filed)
- **A-R246-REVIEW-L1 in the browser (info).** This is the branch A's reviewer found no test for: "the next flag was removed in the same step, but a later one survives". Probe `c-round-246/c246-skip.cjs`, results in `out-fix/c246-skip.json`, screenshots in `cutTime-skipNext-*.png`. Steps: <ul><li>flags at 0, 2, 4 and 6 s;</li><li>Alt-drag the range 1–5;</li><li>focus the 2 s flag;</li><li>press `Ctrl+Shift+X`.</li></ul>Result at both viewports: the flags are 0 and 2.000 (the old 6 s flag, shifted), focus is on that survivor with a solid 1px ring, and the status ends with `2 markers deleted.`; 0 page errors. The browser behaviour is right. The unit-test gap stays A's Low for B.
- **C-GROUP-INFO-246.** In groupUndo the group count goes 1 → 0 and focus ends on BODY, on HEAD and on the fix, at both viewports. This is the known B-R245-UNDO-GROUP-FOCUS, scheduled next, and not a regression of this round.
- **INFO-C246-DRAG-RING (pre-existing).** After a mouse drag, the focused flag still matches `:focus-visible`, but its computed outline is `none 0px`. Before the drag it was solid 1px brass. HEAD `e9fb805` shows the same (`out-head/c246.json`, focusStability). It is outside this round. B may decide whether it is a finding: is a focused-but-dragged flag meant to look like the "selected" state?
- **INFO-C246-VITE-CACHE.** My first start of the HEAD control server shared the dependency cache with `:5173`, because `/tmp/c246-head/node_modules` was symlinked whole. It rewrote `store/node_modules/.vite/deps` for about 20 s. I then restarted it with per-entry links and its own `.vite`. Nothing in the source changed: status and hashes are as above, and `:5173` stayed 200.
- **Invalid attempts, kept as evidence:**
  - HEAD addUndo@1440: Vite cold-start timeout (`out-head/c246-attempt1-addUndo1440-timeout.json`), re-run once.
  - My first addUndoPrevious and cutTime recipes, and the second half of editorReg, were C recipe errors. On an empty project, Space does not move the playhead. With a clip, a nudge is 1 s. `M` on an existing flag time opens no editor. I fixed each and re-ran it.

## Requirements and Ableton parity
- **CZABA requirement (D-29z408):** met. Focus goes to the next surviving flag, else the previous one, else Add marker. Focus elsewhere is never moved. History steps that keep the flag id keep focus.
- **Ableton parity:** does not apply. This is a DOM focus-management fix; Live has no comparable focus model, and B claims no parity.

## For B
- No bugs. B-R243-UNDO-MARKER-FOCUS and C-R245-01…03 can close after the gate.
- B may triage INFO-C246-DRAG-RING (pre-existing).
- The HEAD control server on `:5174` is stopped at the end of this round.
