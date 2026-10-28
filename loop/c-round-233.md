# C round 233 — CALM-3 follow-up: Overview focus rescue (GATE232-S1) + render-budget timeout (C-R232-01)

**Verdict: PASS** for GATE232-S1. C-R232-01 is **not closed**: its premise was false (C-R233-01, B ruling needed). browserVerified = realVerified = true. Chromium (Playwright) on `http://127.0.0.1:5173/studio-lab`, 1440×900 and 1280×720, fresh contexts, no credentials. env-status: store 200, round 233.

Scripts and evidence are in `c-round-233/`:
- `c233f.cjs`: the focus rows. `out/` is run 1 (synthetic WebM rejected, see info). `out2/` is the run of record, with the owned `media/beeps-6s-vp9-opus.webm`.
- `c233e.cjs`: guard and export (`out-e/`).
- `inventory.mjs`: text inventory (`inv/`).
- `unit.log` and `unit-shuffle.log`.

## Rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-233 | PASS | <ul><li>End-of-C-phase receipt: `c-round-233/end-status.txt` (same 3 `M` + 1 `??`; the frozen, root and A-end lists give rc 0 after all C work).</li><li>HEAD is `bd71144`; status shows 3 `M` plus `??` doc 181.</li><li>The tree, root and A-end sha lists give rc 0, and the protected files diff clean.</li><li>The hunks are §2.1–§2.3 only; render-budget changes exactly one line, at l.377.</li><li>Also confirmed: at HEAD, l.336 is already `}, 15000);` (see C-R233-01).</li></ul> |
| C-UNIT-233 | PASS | <ul><li>I read the OV-T6 diff (28+/0−): Play keeps focus with Meta; the focused Overview hides to expand, with `preventDefault` asserted; show keeps focus on expand; floating hides to placeholder-return.</li><li>32 files / 542 tests green (rc 0, 57.7 s).</li><li>`OV-T6` grep: 1 hit. Shuffle (seed 1793218270374): 7/7.</li><li>The l.303 test declares 15000 at HEAD; it took 2,757 ms. l.338 took 1,098 ms (now 15000). R11-P1e took 1,739 ms.</li></ul> |
| C-FOCUS-DOCKED-233 | PASS (both viewports; S0, S1 and video loaded) | <ul><li>Hide → `activeElement` = `arrangement-video-expand`, `:focus-visible` true, outline `solid 1px` brass /0.8, offset 2px. Brass pixels in the band outside the bbox: 60 focused vs 0 blurred.</li><li>Status is exact. Tab → `arrangement-snap-toggle`; Shift+Tab after a fresh hide → `arrangement-library-separator`.</li><li>Meta+Alt+O gives the same result. The keydown is `defaultPrevented`.</li><li>Scroller scroll and `window.scrollY` are unchanged (preventScroll). The target is inside the viewport and is the topmost element.</li></ul> |
| C-FOCUS-FLOAT-233 | PASS (both viewports; S0 and video) | <ul><li>Hide → `arrangement-video-placeholder-return`, `:focus-visible`, ring band 114 px. Tab → `arrangement-video-drag`.</li><li>Escape returns the floating video ("The video went back to the compact view."), and focus lands on `arrangement-video-expand`, not BODY.</li></ul> |
| C-FOCUS-OTHER-233 | PASS | <ul><li>Focus on body, Play or the separator: hide and show both work, and `activeElement` is unchanged each time.</li><li>Show from the expand button: focus stays there, also 600 ms later (no rescue steals it).</li></ul> |
| C-TOGGLE-233 | PASS | <ul><li>The slot bbox equals the Overview bbox, Δ 0 px at both viewports.</li><li>Show restores the Overview; reload while hidden keeps the slot (key `1`).</li><li>A held key flips once. In the search field there is no toggle and no preventDefault.</li><li>On the focused Overview, → / ← move it (0→5→0). In S1, Space plays (00:01.172, Pause button present) and Space pauses.</li><li>The round-232 guards were re-run (`out-neg/c232n.json`, both viewports): search field, open sheet, Ctrl+O, Alt+O, Ctrl+Alt+Shift+O, open Export dialog and during a pointer drag all give no toggle. AltGr cannot be tested here (TLM).</li></ul> |
| C-BUDGET-233 | PASS | Inventory equals C round 232: 142/158/121/127 rows, 0 added, 0 removed (`inv/diff.txt`). |
| G233-3 | PASS | <ul><li>`/studio-lab` returns 200, shows the demo badge, and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", with 0 `audio[src]` and no workspace.</li><li>`/api/studio-token` with no header → 401. A fake bearer → 500, as in round 232. No token is issued.</li></ul> |
| LAB-SMOKE-233 | PASS | Add, then Export WAV, at both viewports: 24-bit, 48 kHz, stereo, 4,864,896 frames = 101.352 s. RMS −65.21 / −21.59 / −21.54 dB (whole −15.29), identical to round 232. 0 page errors. |
| C-LESSON-233 | PASS | `lessons.md` l.28 has L47. |
| AN-REVIEW-233 | PASS (with a Low) | <ul><li>l.4 is byte-exact (string compare: True). The L26 headings are present, and the cited test names exist.</li><li>The doc truthfully states that the timeout was already present at HEAD.</li><li>One provenance slip: "since 4c07d5f" is wrong (C-R233-03).</li></ul> |
| C-REF-233 | PASS | The task §3 records "no reference found" for Live and lists no deviation. Ableton conformance: not applicable. |
| C-SHOTS-233 | PASS | <ul><li>Before: B's `b-round-232/probe/float-*.png`.</li><li>After: `out2/{docked,float,s1-docked,video-docked,video-float}-{focused,full}-{1440x900,1280x720}.png` and `out2/ring-crops-x12.png`.</li></ul> |
| TLM-R232-MAC / TLM-R232-ALTGR-WIN | BLOCKED | Need a Mac / a Windows AltGr layout. |
| Gate rows (full suite, typecheck, lint, build, verify, e2e smoke) | gate | Not claimed. |

## Findings for B

- **C-R233-01 (Low, task premise).** The round-232 STOP and C-R232-01 misread the file.
  - At HEAD, the "…over Play → Pause → Play" test already has `}, 15000);` at l.336, and it already had it at 4c07d5f~1.
  - The granted l.377 change raised the timeout of the neighbouring test, "moves the playhead, ruler handle and transport time…" (1,098 ms).
  - The change is harmless, but nothing was fixed. B should mark C-R232-01 invalid and decide whether to keep or revert the l.377 `15000`.
  - My own round-232 report shares the misread.
- **C-R233-02 (Low, pre-existing, deferred-low candidate).** With a video loaded, the rescued focus target (`arrangement-video-expand`) sits on the video picture.
  - The shared 1 px brass ring drops to about 1.7:1 against the bright frame: brass band pixels fall from 60 to 18 (`out2/ring-crops-x12.png`).
  - This was not caused by this round, but code now lands focus there.
- **C-R233-03 (Low, docs).** Doc 181 l.51 says "since commit 4c07d5f", but the timeout predates that commit. Fix it at the next touch of the doc.
- **Info.**
  - A WebM I recorded myself with MediaRecorder (no duration header) was rejected with "the browser could not open this video". The cause is unverified and outside this round's scope. The owned `media/beeps-6s-vp9-opus.webm` loads fine.
  - I did not re-run MU-1, because it requires editing source; I rely on A's and B's mutant runs.
  - Code-reviewer Minor 2 (hidden/inert dock buttons are not skipped) is latent today: every button following the Overview is enabled with tabIndex ≥ 0 in all 4 measured states.

## Outcome
GATE232-S1 is verified in the real browser: closable after the gate. C-R232-01 stays open until B rules it invalid. A changed no app source beyond the grants; C changed no source.
