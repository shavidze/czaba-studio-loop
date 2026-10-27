# C round 209 — PERF-FADER-a (SABA-B-5 part 1) — verification

**Verdict: FAIL — incomplete: A reported a STOP and B has not ruled yet (L10).** A has a real diff, but three mandatory deliverables are missing and one frozen test is red. The real-browser probes of the implemented part look good (see below). They are recorded as evidence for B's ruling and are **not claimed as PASS**. `browserVerified=false`.

## Row table
| Row | Status | Evidence |
|---|---|---|
| SCOPE-209 (start) | PASS | HEAD `f535ab3`. 9 M (4 granted sources + 5 granted tests) + 4 untracked, all on the new-files list. `sha256sum -c --quiet b-round-208-r209-tree-sha256.txt` rc 0 (1,031 frozen unchanged). No clip-gain, `StudioWorkspace.tsx`, `useRelativeFaderDrag.ts`, style or auth file changed. Hunk-by-hunk audit of the granted tests not done (re-dispatch will change them again). |
| SCOPE-209 (end) | not run | runs after re-dispatch |
| PERF-RUN-209 | FAIL (not implemented) | `perf/budgets.json` untouched: the 48 rows to flip are still `record`. C did not run `test:perf`; A's two runs (`a-round-209/run{1,2}.json`) are A's evidence, not C's. |
| WINDOW-209 | observed, not claimed | Dev server, not the production build; no harness comparison. See probe table. |
| LIVE-DISPLAY-209 | observed, not claimed | At 25/50/75 % the value, `aria-valuetext`, readout text, `--studio-fader-fill` and live param all agree. No sample snaps back. Only the mid-drag screenshot is kept. |
| AUDIO-209 | (a) observed; (b) loop wrap and (c) Space mid-drag not run | — |
| GROUP-209 | pointercancel observed; group blur not run (track blur observed) | — |
| INVARIANTS-209 | not run | baseline `f535ab3` build not made |
| EXPORT-209 | not run | — |
| VISUAL-209 | not run | — |
| DOC-209 | FAIL (not implemented) | doc 165 does not exist; doc 163 D-29z181 lines not edited |
| AN-REVIEW-209 | not run | deferred to the complete diff |
| G209-3 | PASS | `c-round-209/out/g209-3.json`, shots `g209-3-*.png`. `/studio-lab` anonymous at 1440 and 1280 (auth_user null, 0 cookies, demo badge, 0 forbidden requests, 0 Authorization headers). `/studio/middle-east`: "Sign in required", 0 `audio[src]`, no workspace (1440 + 1280). Token endpoint: no header → 401; fake Bearer → 500 "Unable to prepare Studio access" (no `:5199` mock), no Set-Cookie. **No token issued.** |
| gate | gate | not claimed by C |

## STOP confirmed independently (C-R209-01)
`npx vitest run gesture-guard.test.tsx clip-gain.test.tsx clip-gain-waveform.test.tsx clip-gain-multi.test.tsx` gives 68/69. The only failure is `gesture-guard.test.tsx:447`, "restores the stored Volume without an entry when the slider blurs mid-drag (D-30 abort)": expected 0.2985 (−10.5 dB), received 1. Log: `c-round-209/out/vitest-stop.log`. The clip-gain neighbours are green and unedited. The file is not in the 19 grants, so the gate's full vitest run would fail on this tree.

C's view for B's ruling: A's proposed re-expression (fader `'-10.5'` / `'−10.5 dB'`, model `1` mid-gesture) keeps the row's intent. The browser shows the same behaviour: blur mid-drag restores the display and the live gain, with 0 release commits (track-blur row below).

## Real-browser probe (C's own; `c-round-209/tools/c209probe.cjs`; dev server `127.0.0.1:5173/studio-lab`; Playwright Chromium, real mouse)
**Setup:** add a sound. Set the start value by keyboard (track/group −12 dB, master −6 dB; pending path, undo "Volume" / "Master Volume"). Press Space (playing). Then mouse down at 50 %, move to 5 % (60 steps), then to 95 % (60 steps). Outputs: `out/probe-1440.json`, `out/probe-1280.json`, shots `out/probe-*-mid.png`.

| fader (both viewports identical) | moves in window | before-first-move commits | window commits / max components / per-move | release commits | source starts during drag | live gain matches readout | after release | Ctrl+Z |
|---|---|---|---|---|---|---|---|---|
| Volume — Music (playing) | 120 | 0 | 104 / 1 / 0.867 | 1 | 0 | −25.5 dB→0.0531, −12→0.2512, 0→1 ✓ | +0.0 dB, "Undo: Volume" | −12.0 dB, gain 0.2512 ✓ |
| Master Volume (playing) | 120 | 0 | 101 / 1 / 0.842 | 1 | 0 | −21→0.0891, −6→0.5012, +6→1.995 ✓ | +6.0 dB, "Undo: Master Volume" | −6.0 dB, gain 0.5012 ✓ |
| Pan — Music (playing) | 120 | 0 | 105 / 1 / 0.875 | 1 | 0 | 22L→−0.44, C→0, 22R→0.44 ✓ | 45R, "Undo: Pan — Music" | C, pan 0 ✓ |
| Group 1 Volume (Stems+SFX, playing) | 120 | 0 | 104 / 1 / 0.867 | 1 | 0 | both member gains follow (−25.5→0.0531 …) ✓ | +0.0 dB, "Undo: Volume" | −12.0 dB, both members 0.2512 ✓ |
| Group 1 pointercancel at 50 % | 90 | 0 | 91 / 1 / 1.011 | **0** | 0 | members followed, then restored to 0.2512 | display −12.0 dB restored | — |
| Volume — Music blur at 50 % | 90 | 0 | 91 / 1 / 1.011 | **0** | 0 | followed, then restored to 0.2512 | display −12.0 dB restored | — |

**Reading:**
- Starting below max, every drag got ≥ 101 window commits, against A's 78–105 from the harness, which starts at max. This is data for B's ruling on the WINDOW-209 "≥ 100" threshold.
- 0 release commits after a cancel or blur means no history commit and no context update. The undo title cannot tell entry counts apart, because the keyboard set-up already wrote "Volume".
- **Info, not a regression of this round:** new AudioParam ids appear only after pointerup and after Ctrl+Z while playing (track release id 5; master release and undo ids 7–10). This is the pre-existing graph rebuild on an edit during playback (perf-plan §1.5). There is no rebuild during the drag. The rebuilt graph carries the committed value: id 8 = 0.2512 (Music −12 dB) after the master release, and the Music gain = 1 after the 0 dB release. So nothing jumps back. Noted for PERF-2+.
- Caveats:
  - dev build, not production;
  - no Space mid-drag and no loop wrap;
  - no export;
  - no baseline comparison.

## Findings for B
- **C-R209-01 (medium):** frozen `gesture-guard.test.tsx:447` red on this tree (above). B rules: grant the hunk or change §1.
- **C-R209-02 (medium):** mandatory deliverables not done:
  - `perf/budgets.json` 48 flips plus the `harness.move-window-live` note;
  - doc 163 D-29z181 lines;
  - new doc 165;
  - red-on-start-copy and named-mutant proofs (FP rows);
  - code-reviewer on the final delta.
- **C-R209-03 (low, needs a ruling):** A's declared "knowing simplification". A native Pan `change` after a stolen claim no longer shows a display-only draft. No test covers it and there is no browser repro (C did not reach that state either). It must be ruled as an accepted delta, not counted as "unchanged".
- **Carried (A's code-reviewer Mediums, unaddressed):**
  - pan cancel rows (pointercancel, blur, stolen claim);
  - the group pending-path row (FP9 extension).
- **Root pre-push notes:** none new this round.

## Not run, and why
- INVARIANTS, EXPORT, VISUAL, AUDIO (b)/(c), PERF-RUN ×2, AN-REVIEW, SCOPE end and the hunk audit: the round is incomplete and its code will be re-dispatched (budgets, tests, docs), so those results would be stale.
- No baseline worktree was built.
- Ableton conformance: not applicable (performance round, behaviour unchanged by design).
