# C round 236 — SABA-B-11a-FIX-1 (scrub strip play-from path): independent verification

**Verdict: PASS.** Two new Low findings, both non-blocking under the 2026-10-23 bug gate (→ `deferred_low_polish`):
- **C-R236-01:** a stale `playPastEnd` status remains during playback. It is pre-existing and identical at HEAD.
- **C-R236-02:** doc 183 has a stale `playFromRuler` bullet. A flagged it, and it is outside the grants.

GATE235-S1, A-R235-REVIEW-M1 and C-R235-01 are fixed in the real browser.

`browserVerified = realVerified = true`. Every browser row ran in real Chromium (Playwright, the installed Chromium) on `http://127.0.0.1:5173/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. No row is BLOCKED. Gate rows belong to root.

- **Server:** env-status.json `store 200` (round 236).
- **HEAD baseline:** `git archive HEAD` (49b4c74) → `/tmp/c236-head` on `:5174` (outside the repo, `node_modules` symlinked).
- **Scripts and raw output:** `c-round-236/c236.cjs`, `follow.cjs` and `resume.cjs`; results in `c-round-236/out/` (working tree) and `c-round-236/out-head/` (HEAD).

The harness is derived from `c235.cjs`, with one change: it waits for `Demo collection ready` before seeding (L29/L48). Audio is measured by hooking `AudioBufferSourceNode.start` (offset/when) and adding a destination `AnalyserNode` (RMS). The play/pause signal is a `MutationObserver` on the transport `aria-label`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-236 | PASS | See the scope notes below the table. |
| C-UNIT-236 | PASS | 7 files, 92/92 green: bars-ruler-ui (BR1–BR14, BR4b), tempo-ui, tempo-window-ui, tempo-seed-ui, grid-snap-position, navigation-strings-ui, markers-ui (`c-round-236/unit.log`). |
| C-RACE-236 (unit) | PASS | C re-ran MU-R in a scratch copy `/tmp/c236-work`, outside the repo; the repo status was unchanged before and after. **BR13 and BR14 red**, 13 passed (`c-round-236/mutant-MU-R.log`). |
| C-RACE-236 (browser) | PASS | 10 strip clicks at 1…10 s. Actual intervals 83–94 ms. The live sources started at offsets **1,2,…,10**. Label changes: one `Play→Pause`, **0 `Play`**. Final `Pause` at 10.4. No `Fit:` status ever appeared (status MutationObserver). Both viewports. |
| C-DBL-STRIP | PASS | See the C-DBL-STRIP notes below the table. |
| C-DBL-LOWER | PASS | See the C-DBL-LOWER notes below the table. |
| C-END-236 | PASS | See the C-END-236 notes below the table. |
| C-STRIP-236 | PASS (same as round 235) | See the C-STRIP-236 notes below the table. |
| C-SECONDS-236 | PASS (byte-identical values to round 235) | Click 3.175 → `3`, `Play`. Pan scroll 0→200. Vertical drag zoom: width 1251.125. Drag + dblclick guard: no Fit. Dblclick → exact Fit. Handle drag → 9.5, ArrowRight → 9.6. |
| C-FOLLOW-236 | PASS (deviation holds, unchanged) | See the C-FOLLOW-236 notes below the table. |
| C-NO-TEMPO-236 | PASS | `demo-soft-impact` only: 0 strips, `title` null, cursor `auto`. A dblclick at y+4 and at y+15 → status unchanged (no Fit), bars width 1280, pos 0. Clicks and a drag do nothing (the round-235 `noTempo` row). |
| C-BUDGET-236 | PASS | Persistent text lines outside the timeline, HEAD vs work: 1440 empty 86/86, seeded 102/102; 1280 empty 70/70, seeded 86/86. No line differs. |
| C-REF-236 | PASS | See the C-REF-236 notes below the table. |
| AN-REVIEW-236 | PASS, with 1 Low | See the AN-REVIEW-236 notes below the table. |
| LAB-SMOKE-236 | PASS | Load; Space → `Pause`, destination RMS 0.011; Space → `Play`. Export dialog → `Export WAV`: 48 kHz / 24-bit / 2 ch, 768,000 frames = **16.000 s**, RMS −24.91 dB, peak 0.2967, 0 NaN, sha256 `1fea093b…f94` (same at both viewports). 0 page errors. |
| C-SHOTS-236 | PASS | `out/shot-before-{vp}.png` and `out/shot-after-strip-dbl-{vp}.png` (playhead 3.9, no Fit). Also `end-*`, `preview-end-*`, `stale-status-*` and `budget-{head,work}-{empty,demo-stem-pulse}-*`. |
| Auth | PASS | Fresh context, no credentials. `/studio-lab` opens the workspace, `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`. `/api/studio-token` with no header → 401; with a fake bearer → 500 "Unable to prepare Studio access", the same as round 235 (the backend is unavailable; no bypass). |
| gate | gate | Full vitest, typecheck, lint, build, `npm run verify` and e2e smoke belong to root. Not claimed. |

**C-SCOPE-236 notes:**
- HEAD is `49b4c74`. There are 5 `M` (exactly grants 1–5) plus 1 `??` (doc 184).
- `sha256sum -c` on the frozen list (1,093) gives rc 0, and on the root files rc 0.
- `git diff --quiet HEAD` on the 7 protected auth/purchase files gives rc 0.
- Doc 183 has 2 hunks, judged by content: the "Drag და double-click" bullet and the mermaid `Dbl` branch. Its l.4 is unchanged.
- Removed lines: `bars-ruler-ui.test.tsx` **0** (BR1–BR11 and BR4b are byte-identical); `ArrangementContext.tsx` 0 (+28); `StudioWorkspace.tsx` only the old `playFromRuler` body; `ArrangementTempoRow.tsx` only the 2 replaced handler props.

**C-DBL-STRIP notes:**
- `page.mouse.dblclick` on the strip at t = 3 (y + 4), seeded at 120 BPM.
- Event targets: `pointerdown:strip`, then `pointerup/click:root` ×2, then `dblclick:root`. This confirms B's retargeting probe.
- **Live sources: 2 starts, both at offset 3.000** (`when` 0.05 / 0.070). The label is `Pause`, with 1 change.
- The status is unchanged (the seed text, no `Fit:`). Bars width stays 1840 (40 px/s) and `scrollLeft` stays 0.
- The implied start is 2.93–2.96, which is the 50 ms lead (L48). Both viewports.
- **The same probe at HEAD (1280) shows the old bug:** status `Fit: the entire project…`, width 2167.75. The HEAD 1440 attempt timed out on a cold Vite compile and is environment-invalid.

**C-DBL-LOWER notes:**
- Stopped: a dblclick at y+15 gives the exact text `Fit: the entire project is visible (00:16.000). X goes back.`
- While playing: the same exact text, 0 label changes, still `Pause`.
- A lower dblclick right after a 120 px lower drag: no Fit (status `Previous view restored.`).
- A strip drag followed by a strip dblclick within 300 ms: no Fit, and the two clicks play from 12.5. This is **identical at HEAD** (`out-head`), so it is unchanged "as before".

**C-END-236 notes:**
- `scrollLeft` 300, then a strip click at 15.95: `Play`, pos 16, **exact** text `Playhead (00:16.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.` There are 0 live source starts, 0 label changes and RMS 0.
- Space then plays: a live source at offset **0**, pos 0.58 after 600 ms.
- **Loop 2–6** (selection + Ctrl+L, status `Loop created and turned on: 00:02.000 — 00:06.000.`): a click at 15.95 gives the exact same text, not playing. A strip click at 3 plays and wraps (max 5.98, later minimum 2.16).
- **Library preview** running ("Stop", RMS 0.011), then a strip click at 15.95: the toggle goes back to "Preview", RMS 0, not playing, exact text.
- **Recorded observation, not judged:** loop 14–18 was built with a selection 14–16, Ctrl+L and an end-edge drag; the times read `Loop 00:14.000 — 00:18.000`. A click at 15.95 then **starts playback from 16.000**: 16.27 → 17.81 is silent (RMS ~0, past the clip), then it wraps to 14.11 at ≈2.16 s. The source at offset 14 is scheduled at `when` 2.05. Both viewports.
- Space past the end (t = 20) gives the exact `playPastEnd` text. Space in an empty project gives exact `Nothing to play — add a clip from the library first.`

**C-STRIP-236 notes (regression of round 235):**
- Strip stopped at 4.1: live offset **4.000**, `Pause` within 37/13 ms, RMS 0.142/0.155.
- Strip while playing at 8.2: offset **8.000**, 0 label changes; playhead −49…−68 ms (the 50 ms lead, the same as round 235).
- Lower stopped at 6.3 → `6.5` `Play`. Lower while playing at 10.2 → `Pause` kept, 0 changes.
- Alt + strip → offset 4.3. Alt + lower → 6.3.
- Drags: lower scrolls 0→200, strip 200→400, vertical zoom to width 1251, 0 sources.
- t = 20 → exact `playPastEnd`. Empty project with tempo 90 → exact `nothingToPlay`.

**C-FOLLOW-236 notes:**
- Experiment A (an unmoved click while playing): Follow `true→true` on the strip, the lower zone and the seconds ruler. This is identical in the working tree and at HEAD (`out/follow-work.json`, `out/follow-head.json`).
- Experiment B (a drag pauses Follow, then a click): it stays `Follow ‖` paused (`out/follow-resume.json`). This is the same as round 235.
- `follow.cjs` and `resume.cjs` are copied from round 235 without the `Demo collection ready` wait. That is valid here because they read only the Follow button's `aria-pressed` and text, not the status line.

**C-REF-236 notes:**
- §3 rows: the 6.1 click → match. The strip double-click → a listed deviation (D-29z333) with the Saba question. The lower double-click → match (6.1). The end click → a listed CZABA rule. A jump while playing → match/inference. Follow → a listed temporary deviation.
- `backlog.json` has `SABA-Q-SCRUB-DOUBLE-CLICK` (`awaiting_user`). C-R235-02 is "scheduled inside SABA-B-10a (D-29z335)". B-R236-END-WORDING is in `deferred_low_polish`.

**AN-REVIEW-236 notes:**
- Doc 184: l.4 is byte-exact `**სტატუსი:** Completed (C round 236 PASS)`. It has the 7 TEMPLATE headings in order. It cites BR7, BR11, BR12, BR13 and BR14, and all of them exist (grep).
- Doc 183: l.4 is still `Completed (C round 235 PASS)`, and only the granted hunks changed.
- Doc 184 content (grep): it records the dblclick retargeting under pointer capture with B's probe `b-round-235/probe/dbl-baseline.json` as the source (l.39–42), the end rule with `playPastEndMessage` (l.25–27, l.45) and the §3 reference table quoting 6.1 (l.52–58).
- **C-R236-02:** doc 183 l.38–41 still describes the old `playFromRuler`.

## Findings
**C-R236-01 (Low, pre-existing, not a regression): the `playPastEnd` status stays on screen while playback runs.**
- Steps: seed (demo-stem-pulse), then `scrollLeft` 400, then a strip click at t = 20 (status "…there is nothing to play here…"), then `scrollLeft` 0, then a strip click at t = 2.
- Result: it plays (`Pause`, pos 2.97 after 1 s), and the status still says "Playhead (00:20.000) is past the end … nothing to play here". The same happens with Space after the new end click at 16.000.
- At HEAD it is **identical** (`out-head/c236.json` staleStatus).
- This round makes the message more reachable, because the end click at 16 now produces it instead of playing from 0.
- Evidence: `out/stale-status-*.png`, `out/c236.json` staleStatus/end.
- Suggestion for B, not a fix: clear or replace the status when playback actually starts. Under the bug gate this goes to `deferred_low_polish`.

**C-R236-02 (Low, doc drift): doc 183's `playFromRuler` bullet (l.38–41) still says `seekTo` + `togglePlayback` in `StudioWorkspace`.**
- The behaviour now lives in the context's `playFrom`, with the end rule.
- It is outside grant 5, so it is not a scope failure.
- B should rule on a one-line doc fix (A asked the same).

## Notes for B
- **A's BR13 extension** (loop 14–18 and preview stop, with mutants MU-L and MU-P) is additive and inside the granted new row. C accepts it as info.
  - The browser agrees with its loop 14–18 claim: playback starts at 16.000.
  - A product question remains: a click past the last clip inside a long loop plays 2 s of silence before it wraps. This is an observation, not a bug, because the task said "record what you see".
- `dblStrip` RMS read about 0.0013 at ~1 s. The pulse stem is sparse, and the snapshot fell between hits. The source offset is the measurement of record. The RMS in `stripStopped` (0.14–0.16) shows the graph is audible.

## Ableton fit (separate from the CZABA requirement)
| Behaviour | Status |
|---|---|
| Scrub click = play from the point | confirmed (6.1) |
| Lower (beat-time) double-click = zoom/Fit | confirmed (6.1) |
| Strip double-click = two launches, no Fit | not confirmed: an inference from 6.1, a deliberate difference awaiting Saba (`SABA-Q-SCRUB-DOUBLE-CLICK`) |
| End click does not play | not confirmed: a CZABA rule, not Live behaviour |
| Follow on ruler clicks | differs: a listed temporary deviation until SABA-B-10a |

## Environment
- The HEAD server on `:5174` shared the `node_modules/.vite` cache, as B's did. No tracked file changed: the repo status is the same 6 paths as at the start.
- The scratch copies were outside the repo, in `/tmp` (`/tmp/c236-work` had MU-R applied). Both were deleted at the end of the phase.
