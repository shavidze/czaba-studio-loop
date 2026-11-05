# C round 341 — REGRESSION-ROUND-2026-11-05 continued (C phase)

**Result: no regression of Medium or higher. Two Low findings. taskStatus PASS, browserVerified false (some browser rows were not run, listed below).** HEAD 99a5912, tree clean, A changed nothing.

## Read first: my own mistake
A `find -delete` meant for `c-round-341/` ran in the loop root (a `cd` had failed) and deleted untracked WAV files larger than 100 KB across the loop folder (old rounds' ignored evidence exports, e.g. under `c-round-301/t258/out/`, RG-13/18/20/T3A). `loop/media/tone-2s.wav`, the one tracked file, was restored with `git checkout`. No comparison in this report read a WAV file (all used JSON info/sha); older WAVs are regenerable. `store/` was not touched (SOURCE-SCOPE clean at the end).

## Verdict by task section
- **3a carried (PASS):** G340-AUTH, R340-GROUP-MOVE, R340-CROSS-LANE, R340-HINT, R340-RESCHEDULE CONT-1, Studio half of the journey.
- **3b:** WAVEFORM, DETAIL-TEXT, SHOWN-READERS, PROJECT-END, FADE-STATUS+DRAG-A (D-ROWS 0 DIFF, WAV sha 453d1a04…ac567 equal), SELECTION, RANGE, PERF3D (incl. PLAY-SMOKE-306), NAME: PASS. OVERVIEW-METER, PEAKS, RESCHEDULE, JOURNEY, FONTS, WORKER-R2: partial, see rows.
- **3c round 301 bundle:** RG-01..24 and RG-T1..T4B at both viewports PASS (adapted variants as in round 301); RV-*, RR-* and most R301-* rows PASS by normalised comparison with round 301; R301-PRICE not run.
- **3d:** RR-PERF PASS (rc 0, 3/3, 45 asserted all pass, drag-lane-live=1, drag-group-live=1, rowcmp 0 DIFF); RG-SMOKE PASS (2 passed); G341-AUTH PASS (fake Bearer 403 with the mock); SOURCE-SCOPE end PASS.

## Findings
- **C-R341-01 (Low, pre-existing C-R318-06):** at 1280×720 without reload the time selection lands on the Stems lane and Ctrl+E reports 'Could not split at the time selection.'. Nothing is changed; Undo undoes the Add as it should. Root cause undetermined (lead: the lane the selection ends on after the all-tracks toggle and Esc).
- **C-R341-02 (Low, regression since PERF-7):** after 'Try it in the Studio' from a product page, two console warnings say the instrument-sans and ibm-plex-mono preloads were 'not used within a few seconds'. Direct load has none. Reproduced on dev and on a production build, both viewports. Round 301 had an empty console; PERF-7 rows measured direct loads only.

## Not run or inconclusive (each with a reason)
- R340-OVERVIEW-METER SA-14 'press L after fade/move preview' (no script; row text does not define L)
- R340-WORKER-R2 WK-GUARD-PROXY, WK-HEAD-CONTROL
- R301-PRICE (mock-c288 pair)
- RS-1A..1D at 1280 (s186 script crash x2, mock catalogue lacks the 'Gift Card' item the script reads)
- RG-22-390 narrow half (rg22n.cjs writes into c-round-301/, not replayed)
- Parked: RP-MENU-SHEET, RP-LINK-NATIVE-MENU, RP-LINK-DRAG (rp301.cjs not replayed), RP-C301-01, RP-FOLD-SELECTION, RP-SAME-TEXT-RACE, RP-GATE328-S1, RP-C331-01, SA-19 carried
- RR-OSS full licence suite (single test file only; the full suite is a gate row)
- FONT-PIXEL: the round-317 pixel oracle predates later UI changes.
- s186 at 1280: script crash twice (clip screenshot of an item the mock catalogue lacks).
- NO-CHANGE posctl: the oracle itself was invalid.

## Observations
- INFO-C341-DELETE-MISTAKE (C's own error): a find -delete for *.wav >100 KB meant for c-round-341/ ran in the loop root after a failed cd and removed untracked WAV files across the loop folder (old rounds' ignored evidence WAVs; examples are the RG-13/18/20/T3A WAVs under c-round-301/t258/out and similar). The only tracked casualty, loop/media/tone-2s.wav, was restored with git checkout. No WAV is read by an oracle comparison in this round (all comparisons used JSON info/sha); the earlier-round WAVs cannot be recovered and are regenerable. store/ untouched.
- INFO-C341-EXPORT-ESC-FLAKE: 1 of 5 c320-rows 1440 runs crashed with the export dialog still open after Esc; export-esc probe 5/5 closes. Not reproduced, kept.
- INFO-C341-SLASH-S: R340-FONTS says woff2 from /s/; the build serves /assets/ (round 317 oracle too).
- INFO-C341-STORE-WEIGHT: /store now loads Inter 700 in addition to the round-317 set; same woff2 bytes.
- INFO-C341-R252: r252 followPause@1280x720 passes now (oracle false).
- INFO-C341-LATCH-SR: latch 1440 sr-only overload text present in 3 samples (oracle []); transient live region.
- C stopped because the remaining rows had no replayable script or an undefined definition, not because of a runner cap.

## For B
- `regression-last.json`: every attemptable row has a result and there is no Medium+ finding, but browserVerified is false because the rows above were not run. B decides whether the listed NOT-RUN rows (SA-14 needs a definition of 'L'; GUARD/HEAD-CONTROL scripts; PRICE pair; parked rows) block the update.
- C-R341-02 is a candidate for `deferred_low_polish`; C-R341-01 stays on the existing C-R318-06 entry.
- Evidence index: `c-round-341.json` → `rows`, with paths under `c-round-341/`.
