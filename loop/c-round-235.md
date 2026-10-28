# C round 235: SABA-B-11a stage 2 (interactive bars ruler and scrub strip)

**Verdict: PASS, with 2 new Low findings** (C-R235-01, C-R235-02). Under the 2026-10-23 bug gate they go to `deferred_low_polish` and do not block. `browserVerified = realVerified = true`: every browser row ran in real Chromium (Playwright 1.x, the installed Chromium) at 1440×900 and 1280×720, with a fresh context per row. No row was BLOCKED. The gate rows belong to root.

Evidence: `c-round-235/out/` (`c235.json`, `follow-work.json`, `follow-head.json`, `preview.json`, 28 screenshots), `c-round-235/unit.log`. Scripts: `c-round-235/c235.cjs`, `follow.cjs`, `preview.cjs`. HEAD baseline: `git archive c95b8a8` dev server in `/tmp/c235-head` on :5174 (outside the repo, `node_modules` symlinked).

## Rows
| Row | Result | Evidence (both viewports unless noted) |
|---|---|---|
| C-SCOPE-235 | PASS | HEAD `c95b8a8`; exactly the 8 grants `M` + 3 `??`. `sha256sum -c` gives rc 0 on the frozen (1,087) and root lists; the 7 protected files: `git diff --quiet` rc 0; doc 182 diff is the single hunk `@@ -4 +4 @@`. The source was unchanged during C (status + sha at the end = start). |
| C-UNIT-235 | PASS | 10 files / 173 tests green: N2 12/12, strings 64, shortcuts 6, tempo-ui 12, tempo-window-ui 8, tempo-seed-ui 8, grid-snap-position 17, navigation-strings-ui 7, markers-ui 25 (MU8d), grid-musical-ui 14. |
| C-STRIP-STOPPED | PASS | A strip click at 4.1 s → label `Pause` within 42 / 18 ms. The live `AudioBufferSourceNode.start` offset is **4.000** (the 1/4 line at 120 BPM). The destination analyser reads RMS 0.155 (0 at idle). 0 page errors. |
| C-STRIP-PLAYING | PASS (qualified: the literal ±50 ms bound is exceeded by ≤ ~17 ms) | Playing from 1.0; a strip click at 8.2 → the source restarts at offset **8.000**. The `aria-label` MutationObserver recorded **0** changes (no Pause→Play blip). Playhead − (8 + time since pointerup) = −47…−63 ms. HEAD's seconds-ruler seek while playing gives −49…−69 ms on the same machine (`headLatency@1280x720`): it is the existing 50 ms start lead (`when = 0.05`) plus sample granularity, not a continuation of the old position (that would be about −4.1 s). The HEAD comparison covers one viewport: `headLatency@1440x900` timed out loading :5174. B should restate the criterion relative to the audio start. |
| C-LOWER | PASS | Stopped click at 6.3 → `6.5`, `Play`. Playing, click at 10.2 → still `Pause`, 0 label changes, jumped to 10 (the same −44…−70 ms lead). |
| C-ALT | PASS | Alt + strip at 4.3 → source offset **4.3**, playing. Alt + lower at 6.3 → `6.3`. |
| C-DRAG | PASS | 200 px left from the lower zone: scrollLeft 0→200; from the strip: 200→400; 60 px down: bars width 1840→1251 (zoom). The playhead stays 0; 0 live source starts. |
| C-DBL | PASS | Lower-zone double-click → `Fit: the entire project is visible (00:16.000). X goes back.` Drag-then-double-click within 300 ms → no Fit (status unchanged). |
| C-EDGE | PASS | Scroll 400, strip at t = 20 → `Play`, the exact `playPastEnd` text. Empty project with tempo 90 → `Nothing to play — add a clip from the library first.` |
| C-NO-TEMPO | PASS | soft impact: 0 strips, `title` null, cursor `auto`, touch-action `auto`, `textContent ''`; clicks at y+4 and y+15 and a drag change nothing (pos 0, scroll 0). |
| C-SECONDS | PASS | Click at 3.175 → `3`, not playing; title unchanged. Pan +200; vertical zoom; drag-then-double-click guard (no Fit); double-click Fit; handle drag 0→9.5; ArrowRight →9.6. |
| C-ZONES | PASS | `elementFromPoint` gives the strip at y+4 and y+9.5, and the ruler at y+10.5 and y+15. Strip: computed height 10px, width 1840 = the ruler's, top 0. Title `Click = play from here`, `aria-hidden`. Cursor `pointer` on both. Background `rgba(0,0,0,0)` at rest and when the lower zone is hovered; `oklab(… / 0.08)` only when the strip is hovered (`zone-strip-hover-*.png`, `zone-lower-hover-*.png`). |
| C-SHEET | PASS | The `?` sheet's Transport group lists Play / Stop, Back to start, `Play from a point (needs a BPM)` with `Click the top strip of the bars ruler`, then Loop. The filter `play` keeps it (`sheet-*.png`, `sheet-filter-*.png`). |
| C-BUDGET | PASS | Persistent visible text outside the timeline, HEAD (:5174) vs work, compared line by line: empty 86=86 (1440) and 70=70 (1280); seeded 102=102 and 86=86; 0 lines only in work or only in HEAD. The strip has no text and no fill at rest. |
| C-REF-235 | PASS with 1 Low | Every §3 row matches or is a listed deviation. C re-fetched the manual on 2026-10-28 and confirmed the 6.1/6.3 quotes. **Exception:** in 6.2, Follow pauses on a beat-time-ruler click and resumes on a scrub-area click. CZABA does neither, and §3 lists neither → C-R235-02. All 5 Saba questions are in `backlog.json`. |
| AN-REVIEW-235 | PASS | Doc 183: l.4 byte-exact; the `##` headings are TEMPLATE's seven, in order, plus one `###`. Every cited id (BR1–BR11, BR4b, ST17, SC1, SC4) exists in the tests. MU-B/C/D/MEMO are mutant names in A's report, BU7/BU8 exist in tempo-window-ui. Doc 182 l.4 byte-exact. |
| LAB-SMOKE-235 | PASS | Loads; Space plays (`Pause`, RMS 0.011) and Space stops. The export dialog opens. WAV: 48 kHz / 24-bit / 2 ch, 768,000 frames = **16.000 s**, 0 non-finite samples, peak 0.297, RMS −24.9 dBFS; byte-identical at both viewports (sha `1fea093b…`). 0 page errors. |
| C-SHOTS-235 | PASS | `full-empty-*`, `full-seeded-*`, `full-seeded-strip-hover-*`, `budget-{head,work}-{empty,demo-stem-pulse}-*`. |
| Auth | PASS | A fresh context with no credentials: `/studio-lab` opens with the workspace, `auth_user` null. `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`. `/api/studio-token` with no header → 401; with a fake bearer → 500 "Unable to prepare Studio access" (no backend; no access granted). |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke: root gate. Not claimed. |

## §6 neighbours
- Follow: a bars-ruler drag during playback → Follow `aria-pressed false`, status `Follow paused by manual navigation. Follow or Play resumes it.`, still playing.
- Loop 2–6 (selection + Ctrl+L), then a strip click at 3 → it plays and wraps (max 5.99, later 2.19). A strip click at 9, outside the loop, plays from 9 (the existing rule, recorded).
- Library preview: Preview → `Stop`; a strip click → the preview button shows `Preview` again, the main transport `Pause` (`preview.json`).
- Performance: a `longtask` PerformanceObserver during 3 s of strip-started playback recorded **0** long tasks. BU8 (render budget) is green in the unit run. No DevTools trace file was taken.
- Touch: `touch-action: none` with a tempo, `auto` without one. No real touch device.
- MU8d marker release: covered by the green markers-ui run only, not by a browser run.

## Findings for B
**C-R235-01 (Low).** A strip click that snaps to the project end plays from 0.
- Steps: seed pulse; scrollLeft 300; strip click at 15.95 s → it snaps to 16.000; playback starts at 0.000 (0→0.84 s), and the status does not change.
- Expected: play from the point, or the past-end status, as at t = 20.
- Cause: the existing `togglePlayback` rule (≥ end − EPS, no loop → from 0). A predicted it; C reproduced it at both viewports.
- Band: with Snap at 1/4 (0.5 s), clicks from 15.75 to 16.25 s snap to 16.000. That is 20 px at 40 px/s, not a pixel-exact edge.
- Low: the gesture's meaning is unchanged and no data is affected; it happens only at the last grid line with no loop.
- Owner of a fix (none proposed): `playFromRuler` in `StudioWorkspace.tsx`, or `togglePlayback` in `ArrangementContext.tsx` (round 236 grant).

**C-R235-02 (Low, reference): Follow on ruler clicks differs from Live, and the task does not list it.**
- Live 12 §6.2, verbatim (local capture `b-round-71/ableton-arrangement-view-20261021.txt`, confirmed by WebFetch on 2026-10-28): "Follow will pause if you make an edit or scroll the view horizontally in the Arrangement, or if you click on the beat-time ruler. Follow will start again once you stop or restart playback, or click in the Arrangement or clip scrub area."
- CZABA, experiment A (playing, Follow on, an unmoved lower-zone click): Follow stays on. A strip click and a seconds-ruler click behave the same; HEAD's seconds ruler is the same (`follow-work.json`, `follow-head.json`).
- CZABA, experiment B (playing, a bars drag pauses Follow → `Follow ‖`): a strip click **does not** resume it, and neither does a lower-zone click (`follow-resume.json`, both viewports).
- §3 calls a plain beat-time-ruler click "Not found" and has no Follow row, so both differences are unlisted.
- Severity Low (rule: Medium only when it changes what a user must learn). The gestures themselves match Live; only the Follow side state differs, and the status line says how to resume. B may escalate this, or list it as a deviation or a Saba question. Not measured: a strip click while stopped with Follow paused.

**Info:** a strip double-click starts playback (from the first click) and fits the view. No manual source covers a double-click in the scrub area. Not a bug.

**A-R235-REVIEW-M1** (A's reviewer, theoretical `isPlaying` race): not reproduced in any C run. It stays B's ruling.

**Ableton fit:** strip = play from the point: confirmed. Jump while playing: the jump is confirmed; keeping playback going is an inference. Drag scroll/zoom and double-click: confirmed. Quantize by the editing grid: a deliberate deviation (Saba question). Hold-to-loop and Add Locator: not built (Saba questions). Follow pause/resume on ruler clicks: differs, not listed (C-R235-02).
