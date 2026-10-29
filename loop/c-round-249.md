# C round 249: SABA-B-10a stage 1 (separate Insert Marker), independent verification

**Verdict: PASS** on every acceptance row of the task (§5). One row is BLOCKED by the backend; the gate rows are not claimed. `browserVerified: true`. Two Medium **test-strength** findings, inherited from A's reviewer and confirmed by me, go to B for a ruling. In the real browser neither is a product failure.

- Environment: Chromium 143.0.7499.4 (Playwright), store dev server `:5173` (env-status: store 200, round 249). HEAD control: `git archive 0e862be` served on `:5175` from `/tmp/c249-head`, with its own `.vite` cache (per-entry `node_modules` symlinks). It was stopped after use.
- Every case ran in a fresh browser context: wait for `Demo collection ready`, then add `demo-stem-pulse` (the §0.3 recipe). Both viewports (1440×900, 1280×720). 0 page errors in every row.
- Script: `c-round-249/c249.cjs`. Results: `c-round-249/out-fix/c249.json` (fix), `out-head/c249.json` (HEAD control), `out-extra/c249.json` (neighbour probes). Screenshots are in the same folders.

## Environment notes (kept as evidence)
- My first HEAD server symlinked the whole `node_modules`. Its start re-optimized the shared `node_modules/.vite/deps` at 14:09:12. A smoke row on `:5173` right after still passed (sha unchanged). I then rebuilt the HEAD copy with per-entry symlinks so its `.vite` stayed local, and `:5173`'s `_metadata.json` was not touched again.
- HEAD `restart@1440` attempt 1 timed out at 150 s on the first cold load of `:5175`. That attempt is invalid (environment) and was replaced by one re-run.
- I ran no vitest or mutant job while any browser timing row was running (L38).

## Acceptance rows

| Row | Result | Evidence (1440 / 1280) |
|---|---|---|
| C-SCOPE-249 | **PASS** | HEAD `0e862be`; status = 9 `M` (grants 1–9) + 2 `??` (grants 10, 11), nothing else. `sha256sum -c` gives rc 0 on the tree list (1,099) and on the root list. The 7 protected files give `git diff --quiet HEAD` rc 0. `precheck-scratch.diff` (sha `dd9b5198…2686`) applied with `git apply -p1` to a fresh HEAD archive gives byte-identical files (`cmp`) for all 10 app paths. |
| C-UNIT-249 | **PASS** | `covering.txt`: 122 files, **1,815/1,815**, 0 failed (`c-round-249/covering.json`). BR4b, ST11, ST12 and IM1–IM14 are each `passed`. Slowest: CP12a 7.6 s of 30 s (25 %). |
| C-MUT-249 | see §Mutants | `c-round-249/mutants/summary.txt` |
| C-RESTART-249 | **PASS** | ruler 2 → Space → 1.5 s → Space: stop 3.483 / 3.483. Space restart after 250 ms: **2.200 / 2.200**; marker `2.000` throughout. Output-tap RMS within 300 ms of the restart: 0.152 / 0.154. HEAD control: restart **3.682** (resume) at both viewports. |
| C-SHIFT-249 | **PASS** | stop 3.483 → Shift+Space reads 3.682 / 3.691 after 250 ms (stop + 0.25 − 0.051 / −0.042, inside ±0.05 + lead); marker `2.000` is unchanged; the next Space stops. |
| C-CTRLSHIFT-249 | **PASS** | After the stop at 3.491, Ctrl+Shift+Space gives marker `3.491` and the exact status `Insert marker moved to the playhead (00:03.491). Space plays from here.`; Space → 3.699 / 3.691. While playing: the live position is 4.701, the marker becomes `4.709` with the matching status, and playback continues (4.721 → 5.110). **Extra:** Meta+Shift+Space (CDP `metaKey` on Linux Chromium, **not a Mac**) after a stop gives marker = stop point (`3.468` / `3.471`) and the exact status. That is the browser evidence for the Cmd branch that IM3 does not pin. |
| C-CTRLSHIFT-FOCUS-249 | **PASS** | Play reached by Tab (5 presses); Ctrl+Shift+Space: not playing; `activeElement` is still Play, `:focus-visible` true, outline `solid 1px` brass /0.8. **Reviewer M1 orders** (Shift released before Space; Ctrl released first): not playing, and focus and ring kept, at both viewports. No reproduction in Chromium. |
| C-CLICK-PLAYING-249 | **PASS** | Play from 1. During playback: sfx-lane centre at 6 → playhead 1.681 → 2.602 (expected without a jump 2.606); **clip-body click** on the music clip (`be7c09d1…`, track music) at 11 → 3.551 (exp 3.540); seconds ruler at 8 → 4.471 (4.467); bars lower zone at 4 → 5.382 (5.385). Playback continues each time; the marker equals each click time (`6.000`, `11.000`, `8.000`, `4.000`), and the exact §1.3 status shows that time. Stop at 5.472 → Space → **4.211**. 1280: the same within ±0.03. HEAD control: jumps 1.681 → 6.85 → 11.838 → 8.829 → 4.838. |
| C-RANGE-249 | **PASS** | ruler 1; drag 5 → 7 on the music clip: Space → **5.232**; stop; Space → **5.200**. `[data-testid=arrangement-range]` stays. Shift+Space → 5.411 (stop 5.211 + 0.2). Both viewports identical. HEAD control: 1.232, 1.440. |
| C-POINT-RANGE-249 | **PASS** | With a fresh selection each time, the range disappears after: a seconds-ruler click, a stopped handle step, a playing scrub-strip click, Home, and Ctrl+Shift+Space. After the strip: Stop → Space → **9.200**, not 5. HEAD control keeps the range in all five cases (strip restart 9.594 = resume). This is the intended difference, listed under SABA-Q-TIME-RULER-ROLE. |
| C-CTRLARROW-249 | **PASS** (⚖ recorded) | `M` at 10 → flag `10.000`; ruler 1; selection 5–7; Ctrl+→: marker `1.000` → `10.000`, and the selection stays. **Space then plays the selection (5.223)**, not the marker. This is the recorded ⚖ (SABA-Q-10A-CTRL-ARROW-RANGE). |
| C-HOME-249 | **PASS** | Playing from 4 (4.972): Home → playhead 0.249, still playing, marker `0.000`. Ruler 5 while playing → marker `5.000`, playback continues (0.96). ↤ → 0.240, marker `0.000`. Stopped at 6: Home → playhead 0, marker `0.000`. |
| C-STRIP-249 | **PASS** | Stopped strip click at 9 → plays (9.272), marker `9.000`. Playing strip click at 12 → jumps (12.240), marker `12.000`. |
| C-FLAG-249 | **PASS** | Selection 5–7 + double-click on the flag at 10 → plays from 10 (10.272 / 10.292); the selection is cleared; marker `10.000`; the flag is `aria-current=true` and focused. While playing from 1, a single flag click → jumps to 10.261 / 10.240; marker `10.000` (as at HEAD, AV 6.4). |
| C-HANDLE-249 | **PASS** | Stopped: handle → twice: 3.100 / marker `3.100`, then 3.200 / `3.200`. Playing: → jumps +0.097 / +0.096 beyond the elapsed time, and the marker stays `3.200`. |
| C-D27-249 | **PASS** | ruler 18 (end 16) → Space refuses: `Playhead (00:18.000) is past the end of the project (00:16.0…`. Ruler 16 → Space plays from 0 (0.240 / 0.232). Natural end with the marker at 2 (set by a click while playing from 14) → Space → 2.208 / 2.211. A fresh natural end (marker 14) → Shift+Space → 0.191 / 0.200. The 18 s x was visible at both viewports (x 1232 < 1280). |
| C-CUT-249 | **PASS** | ruler 6 → marker `6.000`; music drag 2–4 + Ctrl+Shift+L (all-track range `2.000`–`4.000`); Ctrl+Shift+X → marker **`4.000`**, playhead 4; status `Cut Time 00:02.000 — 00:04.000 …`. |
| C-VIDEO-249 | **PASS** | `beeps-6s-vp9-opus.webm` imported at 0. Ruler 1 → Space → 1.5 s → Space (video paused at 2.483) → Space: after 300 ms the playhead is 1.252 and video `currentTime` 1.251; after 600 ms 1.551 vs 1.558. \|Δ\| = **0.007 / 0.006 s** (≤ 0.08). HEAD control: restart 2.743, video 2.740 (continues from the stop point). |
| C-KEYS-249 | **PASS** | Marker and playhead separated first (marker `2.000`, playhead 3.491), then Space, Shift+Space and Ctrl+Shift+Space typed in the BPM field and in the library search: not playing, marker `2.000`, playhead 3.491 unchanged. The search value is three spaces, so the keys reached the input. Ctrl+Space alone: no playback. Alt+Space plays from the marker (2.208 / 2.211) and toggles off. |
| C-STATUS-BOX-249 | **PASS** | `Insert marker at 00:11.000 — playback continues. …`: height 16 px (1 line), `scrollWidth = clientWidth` (1416 / 1256). The add + seed status is also 16 px. No overlap with the transport button. |
| C-STATUS-CLOBBER-249 | **PASS** (+info) | seed status → Space → sfx click at 6 → after 1 s the text is `Insert marker at 00:06.000 …`. Then Home: marker `0.000`, but the old status `… at 00:06.000 …` stays (INFO-B249-STALE-MARKER-STATUS confirmed, info). |
| C-EDIT-DIVERGE-249 | info | play from 2, stop at 3.483 (marker `2.000`): `M` adds the flag at **3.483 (playhead)**, status `Marker "Marker 1" added at 00:03.483.`; Ctrl+E splits the clip at ≈3.48 (playhead). Ctrl+V after Ctrl+C of the clip created no new clip id. **Inconclusive:** my copy step may not have taken. This is stage-2 scope (§7), not a FAIL. |
| C-BUDGET-249 | **PASS** | Persistent lines: empty 85 / 69, demo 101 / 85 = round 248. The signal is `hidden`, `aria-hidden=true`, `display:none`, 0×0, tabIndex −1. |
| C-LESSON-249 | **PASS** | `lessons.md` l.30 holds L44. Task §1.8 names the phase (B round-1 D-15, expert review P8/Q1, DUX table), the reason (a ⚖ treated as a Saba decision), and the rule (L44). |
| AN-REVIEW-249 | **PASS** | Doc 191 l.4 is byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 249 PASS)`. The 7 TEMPLATE headings are in order (l.7…155). D-29z430/431 are explained, with the rejected alternatives at l.53–60. Every cited row exists (BR4b, ST11, ST12, EN3, IM1–3, IM10, IM14). The TODO lists stage 2, 10b, 9, the three SABA-Q ids, INFO-B249 and B-R249. The Cmd wording (l.150–153) matches A-MU-CTRL-ONLY. |
| LAB-SMOKE-249 | **PASS** | Loads; Space plays (RMS 0.0013 at 0.9 s for the sparse pulse) and stops (position stable); Space again → 0.200 (from the marker 0). Export WAV sha256 **`1fea093b…3f94`** at both viewports: 48 kHz / 24-bit, 16.000 s, peak 0.2967, 0 NaN. 0 page errors. |
| Auth | **PASS** | Fresh context, no credentials: `/studio-lab` opens, `auth_user` null; `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`; `/api/studio-token` with no header → **401** `{"error":"Please sign in to access Studio."}`; with a fake bearer → 500 (not 200; backend absent). The premium route is not bypassed. |
| Purchased origin (browser) | **BLOCKED** | Backend unavailable in cloud. |
| gate | gate | Full vitest, typecheck, lint, build, `verify`, e2e smoke: root gate. Not claimed. |

## Neighbour probes (§6), `out-extra/c249.json`
- **Loop:** loop 4–6 (Ctrl+L). Ruler 4.5 snaps to 5, marker `5.000`. Space plays and wraps inside the loop (5.481 after 2.5 s). Stop → Space restarts at 5.191 (from the marker). OK. (The script's "pass=false" comes from my 4.5 assumption; the snap made it 5.)
- **Empty project:** Space → `Nothing to play — add a clip from the library first.`; Shift+Space does not play; 0 errors.
- **Playhead line:** after stop and restart, the line `left` moves 51.7 px against 51.6 px from `aria-valuenow` × pps. The line follows the playhead.
- **Clip drag while stopped** (8 → 10, upper half): the clip moves +2 s; marker and playhead stay `3.000`. Undo restores the clip.
- **History:** Space, Ctrl+Shift+Space and Shift+Space add no undo entry (the Undo title is unchanged).
- **Library preview → Play:** playback starts from the marker (2.269). Whether the preview stopped is **inconclusive**: the preview toggle exposes no aria-label to read. `startPlaybackAt` keeps `stopLibraryPreview()` first (source).

## Mutants (C-MUT-249): **PASS**
Scratch `/tmp/c249-scratch` = `git archive HEAD` + the 11 working-tree files. It was outside the repo and was removed afterwards. Run with `b-round-248/mutants/run-mutants.sh`; logs in `c-round-249/mutants/`.
| Run | Red rows | = §0.2 |
|---|---|---|
| FIX-CONTROL | none | yes |
| MU-SPACE-FROM-POSITION | BR4b IM1 IM4 IM5 | yes |
| MU-NO-RANGE-START | IM5 | yes |
| MU-SHIFT-SAME-AS-SPACE | IM2 | yes |
| MU-CLICK-SEEKS-PLAYING | BR4b IM4 | yes |
| MU-NO-STATUS-PLAYING | IM4 | yes |
| MU-NO-RANGE-CLEAR | IM6 IM12 | yes |
| MU-CTRL-SHIFT-NOOP | IM3 IM6 | yes |
| MU-HOME-MARKER-ONLY | IM7 | yes |
| MU-SEEKTO-NO-MARKER | IM9 | yes |
| MU-SCRUBEND-NO-MARKER | IM8 | yes |
| MU-HANDLE-ONSEEK | IM8 | yes |
| MU-CUT-NO-REMAP | IM10 | yes |
| MU-KEYUP-OLD | IM14 | yes |
| MU-MARKER-PLAY-TOGGLE | IM12 | yes |
| MU-HEAD (by hand: the 7 source files from `0e862be`) | `strings.test.ts` fails to load (`pb.insertMarkerWhilePlaying is not a function`); BR4b, IM1–IM10, IM12–IM14; IM11 green | yes |

The repo `git status` was identical before and after (`status-before.txt`). At the end: tree list rc 0, root list rc 0, grant hashes in `c-round-249/grants-end-sha256.txt`, and `git diff HEAD -- app` sha256 `032ea163…167b`.

## Findings for B
Both Mediums are test-strength gaps in grant 10 (B-designed tests). No product row fails, no HEAD coverage is lost, and C-SCOPE-249 forbade A from strengthening them. **They do not block this PASS;** B rules at stage-2 planning (grant the test file). The two info rows are not new findings: INFO-B249 is B's own id, and the past-end wording is already stage-2 scope.

| id | severity | summary |
|---|---|---|
| A-R249-REVIEW-IM3-CMD | medium (test strength) | IM3's Cmd+Shift+Space press happens with marker = playhead = 1.000, so the assert passes without the `metaKey` branch (A-MU-CTRL-ONLY stays green). The product branch works in Chromium via CDP `metaKey` (C-CTRLSHIFT-249 extra). A real Mac is still on TLM-R249-MAC-CMD-SHIFT-SPACE. The task's "Cmd+Shift+Space is jsdom-only (IM3)" claim is not true of IM3. |
| A-R249-REVIEW-IM13-LEAK | medium (test strength) | Red-proof run by C: mutant **C-MU-LEAK-CS** (the keydown typing-target guard at `StudioWorkspace.tsx` l.2130–2135 lets Ctrl/Cmd+Shift+Space through) leaves `insert-marker-ui` **14/14 green**. Control **C-MU-LEAK-SHIFT** (Shift+Space also leaks) turns IM13 red. Only the Ctrl/Cmd+Shift arm is unpinned, because marker = playhead = 2 at l.343–351. The browser check with separated positions (C-KEYS-249) shows no leak. Logs: `c-round-249/mutants/C-MU-LEAK-*.json`. |
| INFO-B249-STALE-MARKER-STATUS | info (not a new finding) | Confirmed: after Home the line still says `Insert marker at 00:06.000 …` while the marker is 0. |
| C-R249-INFO-PASTEND-WORDING | info (stage-2 scope) | The D-27 refusal still says "Playhead (00:18.000) is past the end" when the refused start point is the marker. This is already stage-2 scope (§7 "`playPastEnd` names the marker"). |
| A-R249-REVIEW-KEYUP-ORDER | info | Not reproduced in Chromium in either release order (C-CTRLSHIFT-FOCUS-249). Firefox and Safari are unverified. |

## Ableton parity (separate from the CZABA requirement)
Checked against the saved Live 12 manual captures (`b-round-71/ableton-arrangement-view-20261021.txt`, `ableton-shortcuts-20261021.txt`). I grepped the quoted lines myself.
| §3 behaviour | Status |
|---|---|
| Playback starts at the insert marker; click in a track moves it (AV 6.3) | **confirmed** |
| Shift+Space continues from the stop point (AV 6.3, KS "Continue Play from Stop Point") | **confirmed** |
| Space plays the selection (KS "Play Arrangement View Selection"; AV 6.6) | **confirmed** |
| Ctrl/Cmd+Shift+Space marker → playhead (KS "Move Insert Marker to Playhead Position") | **confirmed** keys; the status line is a **deliberate deviation** (⚖) |
| Home → marker to the start (AV 6.3, KS) | **confirmed** stopped; the jump while playing is a **deliberate deviation / unconfirmed** (SABA-Q-10A-HOME-PLAYING) |
| A click during playback moves only the marker | **unconfirmed** (no Live source; Saba decision 1) |
| A point replaces a selection (AV 6.9 background) | **confirmed** for background/clip; ruler, handle, strip, Home and Ctrl+Shift+Space clearing are **deliberate deviations** (SABA-Q-TIME-RULER-ROLE); Ctrl+←/→ keeping it is ⚖ |
| Ctrl+←/→ moves the marker (AV 6.9) | **confirmed** |
| Scrub area starts playback (AV 6.3) | **confirmed** |
| Stop keeps the marker | **inference** (not stated in the manual) |
| Additional observation | Live's shortcut table also lists "Play from Insert Marker in Selected Clip — Ctrl+Space / Option+Space" and "Stop Playback at End of Selection — Ctrl/Option+Space"; CZABA's Ctrl+Space does nothing, which is covered by SABA-Q-10A-DEVIATIONS. |

A test PASS is not proof of parity. The marker is not visible yet (SABA-B-10b), and the transport still says "Pause" (B-R249-PAUSE-LABEL, scheduled in SABA-B-9).
