# C round 237 — SABA-B-11a-FIX-2 (seed status vs collection ready write): independent verification

**Verdict: FAIL.** The three target bugs are fixed in the real browser, but the round causes a Medium regression: **C-R237-01** (= A-R237-REVIEW-M1, reproduced independently by C). A gesture refusal that is on screen when loading settles is replaced on release with a stale `Loading the demo collection…`. At HEAD the same steps end on the ready text. `browserVerified` / `realVerified` = true: every browser row that can run in the cloud was run. Only the purchased-origin browser check is BLOCKED (backend unavailable in cloud).

Environment: Chromium 143.0.7499.4 (Playwright, headless), round tree on `:5173`, HEAD control `git archive ecaf0e4` → `/tmp/c237-head` on `:5174`. Fresh context per row, no credentials, `auth_user` null everywhere. 0 page errors in every row.

## Bug for B

### C-R237-01 (Medium, regression this round caused)
- **Steps:**
  1. Open a fresh context on `/studio-lab`.
  2. Delay both demo MP3s by 6 s with `page.route`.
  3. While the status reads `Loading the demo collection…`: press on the first `Volume — …` slider, move 4 px, press Ctrl+Z. The refusal `Undo/Redo does not work while dragging — let go first.` shows.
  4. Keep holding until the hero row shows `02:30.372` (decoded), wait 1.5 s, then release.
- **Expected:** the ready text, or failed(n); this is what HEAD does.
- **Actual:** the final status is `Loading the demo collection…` and stays there. The screenshot shows every library row with its duration while the status still says loading.

| Viewport | Tree | History (ms → text) | Final |
|---|---|---|---|
| 1440 | round 237 | 189 loading → 1099 refusal → 8658 **loading** | `Loading the demo collection…` |
| 1280 | round 237 | 251 loading → 1168 refusal → 8703 **loading** | `Loading the demo collection…` |
| 1440 | HEAD ecaf0e4 | 223 loading → 1124 refusal → 7244 ready | ready |
| 1280 | HEAD ecaf0e4 | 298 loading → 1210 refusal → 7412 ready | ready |

- **Evidence:** `c-round-237/race-after.json` and `race-head.json` (mode `refusal`); `shots/after-refusal-{1440x900,1280x720}.png`; `shots/head-refusal-*.png`. Script: `c-round-237/race.cjs`.
- **Cause:** A's trace, which C did not re-derive in code. The provider's `lastNonRefusalStatusRef` still holds `copy.loading` when the refusal is restored. A's candidate fix is `a-round-237/candidate-fix.diff`, outside the grants; C has not verified it.
- **Same class, not browser-reproduced by C:** reviewer L1 (seed status appended onto a showing refusal). B should rule on both together.

## Acceptance rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-237 | PASS | <ul><li>HEAD `ecaf0e4`. Exactly the 9 grants are `M`, plus the 2 new files.</li><li>Frozen `sha256sum -c` rc 0 and root files rc 0. Protected files: `git diff --quiet HEAD` rc 0.</li><li>Doc hunks: 182 @@100 (first problem bullet) and @@133/134 (last TODO bullet); 183 @@38 (`playFromRuler` bullet). Each l.4 is unchanged.</li><li>Removed test lines: only `import { findAssetTempoSeed } from '../tempo-seed';` in `tempo-seed.test.ts`, which became a two-name import. 0 removed lines elsewhere.</li></ul> |
| C-UNIT-237 | PASS | <ul><li>10 files, 116 tests green (`c-round-237/unit.log`).</li><li>Files: tempo-seed-ui (TU1–TU11), tempo-seed-search-ui (TQ1–TQ2), tempo-seed (TS1–TS7), collection (CR1–CR4), collection-load-status, purchased-collection-ui, label-status-colour-ui, library-row-strings-ui, status-announcement, status-announcement-ui.</li></ul> |
| C-MUT-237 | PASS | MU-RC on a scratch copy `/tmp/c237-mut`, outside the repo: **TU9 and TU10 red**, 2 failed and 9 passed (`mutant-MU-RC.log`). `git status` is identical before and after. |
| C-RACE-DELAY-237 | PASS (in isolation) | <ul><li>Both viewports, attempt 1 valid (status before Add = loading).</li><li>Final status exactly placement + seed + `Snap on — grid 1/4 (G)`.</li><li>0 ready entries after the Add. `data-bpm` 120, `data-snap` on, no leading space.</li><li>HEAD control: the final status is the bare ready text at both viewports (`race-head.json`).</li></ul> |
| C-RACE-FAIL-237 | PASS | <ul><li>Both viewports, valid. Final status exactly `1 sound in the demo collection failed to load — details are in the library.`</li><li>bpm 120, Snap on. The hero row shows `Error: File failed to load (404)`.</li><li>Status box is 16 px, one line, at both viewports.</li></ul> |
| C-IDLE-237 | PASS | `Loading the demo collection…`, then the exact ready text. After the seed: exactly placement + seed + Snap text. Both viewports. |
| C-PLACEMENT-237 | PASS | `demo-soft-impact`, valid. Final status exactly `“Soft impact” added to the Music track at 00:00.000.` `data-bpm` is empty before and after; Snap is off before and after; no leading space. |
| C-S2-237 | PASS (unit only) | TQ1 is green in C's run. MU-S2 red rests on A's report (C did not re-run it). The row cannot be reached in `/studio-lab`, because the demo collection has BPM stems. |
| C-FIX1-REG-237 | PASS | Measured against the source start (`AudioBufferSourceNode.start` offset), both viewports (`out/c237.json`):<ul><li>Strip click at 4.1 → one live start at offset **4.0**, then Pause, RMS 0.013–0.015.</li><li>Strip double-click at 3 → plays from 3, no `Fit:`.</li><li>Lower-zone double-click → exact Fit text.</li><li>Strip click at 15.95 → exact `playPastEnd` text, 0 starts, no Pause.</li><li>Space → plays from offset 0.</li></ul>The strip double-click gives two starts at offset 3, the same as round 236. |
| C-BUDGET-237 | PASS | Persistent text lines outside the timeline are identical to HEAD:<ul><li>1440: 86/86 empty, 102/102 seeded;</li><li>1280: 70/70 empty, 86/86 seeded.</li></ul>0 lines only in HEAD, 0 lines only in the work tree. |
| C-REF-237 | PASS | Task §3 states "no reference found" and the search. `SABA-Q-READY-AFTER-ACTION` is `awaiting_user`. C-R236-01, GATE236-S1 and GATE236-S2 are in `deferred_low_polish`; `playbackEndedAtRef` is recorded in the backlog. |
| AN-REVIEW-237 | PASS (note) | <ul><li>Doc 185 has the 7 L26 headings, and l.4 is byte-exact.</li><li>It cites CR1–4, LS3/3b/6/7, TQ1–2, TS7 and TU9–11, all of which exist.</li><li>Docs 182/183: only the granted bullets changed, and l.4 is `Completed (C round 235 PASS)`.</li><li>Doc 183's `playFromRuler` matches `playFrom` (l.1390–1413).</li></ul>**Note:** doc 185's l.4 claims PASS and it has no M1 bullet. The fix-up must add one. |
| LAB-SMOKE-237 | PASS | <ul><li>Space plays (pos 0.78, RMS 0.011); Space pauses.</li><li>The export dialog exports WAV: 48 kHz, 24-bit, stereo, 768,000 frames = 16.000 s. RMS −24.91 dBFS, peak 0.2967, 0 NaN.</li><li>The sha256 is identical at both viewports. 0 page errors.</li></ul> |
| C-SHOTS-237 | PASS | <ul><li>Delay mode: `shots/head-delay-*.png` (before, HEAD) and `shots/after-delay-*.png` (after).</li><li>Also `after-{fail,idle,placement,refusal}-*`, `head-refusal-*` and `out/full-*`.</li></ul> |
| Auth | PASS | <ul><li>`/studio-lab` opens anonymously with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`/api/studio-token`: no header → 401; fake bearer → 500 "Unable to prepare Studio access", the same as round 236. No bypass.</li></ul> |
| Neighbour §6: gesture refusals | **FAIL** | C-R237-01 above. |
| Purchased origin (browser) | BLOCKED | Backend unavailable in cloud. Covered only by CR1 and `purchased-collection-ui`. |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke are not claimed. |

## Live region (§6)
- The status `<output aria-live="polite">` remounts `<span key={statusSequence}>`.
- In delay mode the childList/characterData observer recorded **0 mutations** from the Add until the read at Add+7 s. Settle happened at about Add+4 s.
- So the ready settle neither changed the text nor remounted the span: there is no repeated announcement. This is by design.

## Ableton correspondence
Not applicable: this is a contract between CZABA's own status writers. "No reference found" is stated in the task with its search. C makes no Ableton claim.

## For B
- **Fix-up on the same grants**, plus the context's refusal-restore ref (A's candidate touches `ArrangementContext.tsx`, already grant 1, but needs a TU12 row outside grant 5's wording).
- Rule on reviewer L1 together with it.
- **Doc 185 l.4 is a false statement:** it says `Completed (C round 237 PASS)`, but C's verdict is FAIL. The fix-up must grant the l.4 rewrite explicitly and add an M1 Problem → Solution bullet.
- C's re-check recipe: `c-round-237/race.cjs <base> <out.json> refusal` at both viewports. Expected final status: ready, or failed(n).

## Hygiene
- C made no source edits. Scratch copies are `/tmp/c237-head` and `/tmp/c237-mut`, both outside the repo and both kept as evidence. The HEAD control server on :5174 was **stopped** after use; `curl` now returns 000.
- Store `git status` is unchanged from the start (11 entries).
