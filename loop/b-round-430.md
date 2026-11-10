# B round 430 → 431 planning (2026-11-10)

**Decision: CONTINUE.** Round 431 = SABA-B-12 stage 2a (STUDIO-VIS-2, the Export dialog radios) on baseline `5a30894` (gate 430 published). Task: `current-task.md`. Decisions D-29z1515 … D-29z1520, `backlog.json` v412. The previous task is archived as `tasks/round-430.md` (a copy; nothing deleted). The advisor was consulted after orientation and before close. Consults: `product-designer` (radio ruling), `tech-lead` (sketch review).

## 1. Round 430 result (B's own re-runs, not reports)
- `c-round-430.json`: PASS, 0 bugs, `browserVerified`/`realVerified` true; gate rows listed as gate; fake-bearer and Firefox/Safari BLOCKED (cloud).
- B re-ran: `tools/l57-check.py` L57 OK (`b-round-430/l57-check-c430.txt`); `b-round-429/probe/compare.py` on C's JSONs ALL OK (6 cells) (`b-round-430/recompare/compare.txt`); C mutant lines identical to `b-round-429/mutants/summary.txt`; `c-round-430/auth/g428-auth.json` pass true (attempt-1 cold-server hydration error = environment, no bypass).
- Gate 430 published `5a30894` on both remotes; `gates/round-430/review.md` COMMIT OK with three suggestions, no Medium+.
- Closed/recorded (D-29z1515, D-29z1516): **SABA-B-12 stage 1 done**. Lows → `deferred_low_polish`: A-R430-REVIEW-NF2-TYPE-BOUNDARY, A-R430-REVIEW-NF2-SIDE-EFFECT-IMPORT, A-R430-REVIEW-NF2-CLASSNAME-CONST (= TL-R430-05/06, `confirmedBy` gate suggestion 2), GATE430-REVIEW-L1-INPUTCLASS-CN. No Architecture note from A or the gate.

## 2. Why round 431 is SABA-B-12 stage 2a
- Round 430's fixed outcome: regression only from 2026-11-13; `regression-last` is 2026-11-10 (round 425). STEM-LANES has no Saba answer.
- No open Critical/High bug; the open Mediums are root/manual/awaiting_user or Saba-scheduled tasks.
- **Split (D-29z1517):** 2a radios now; 2b `<progress>` next UI round, because its two states (determinate, and the indeterminate PU4 encoder-load state) need a repeatable real-Chromium hold recipe proved at HEAD (L58), and DXL7c/DXL8 pin its tokens. Full scope kept.
- **Radio ruling:** `product-designer` chose (b) a theme-drawn dot on the native input over the audit's `sr-only` lean: global focus ring stays on the input (L1, one focus style), a shape cue (not colour-only), native arrow keys, forced-colors fallback. Card highlight stays.

## 3. B's pre-checks (L58: every asserted number is B's own run on the final sketch)
- Sketch `b-round-430/sketch-431.patch.txt`, sha256 `18d59a2fbe599fa84d67e442d6b602fc313a32982b2643172a62e861ee8222d6`, 6 files, on `/tmp/b431` (= `git archive 5a30894` + sketch).
- `tech-lead`: approve-with-lows; TL-R431-01 (dead transition tokens), -02 (RD2 spread/variable type), -03 (checked ring hover) all applied (`sketch-review.md`).
- Real Chromium, HEAD on :5173 and the sketch on a second Vite at :5174 with its own `cacheDir` (stopped afterwards): `probe/compare.txt` ALL OK (2 cells, 6 radios each); `compare-radio.py` on HEAD reports NOT OK on every radio, so the row discriminates. Label boxes identical, tab stops identical, ArrowDown wav→mp3→both→wav, no ring on mouse press, 0 page errors. Hover: unchecked → rgb(217,184,127), checked/disabled unchanged. Crops viewed (dialog 1280, mp3 key focus 1440). One cold-start sketch attempt kept in `probe/sketch-attempts.txt`; the first-version runs are in `probe/sketch-v1/` and `probe/head-v1/`.
- Contrast (`probe/contrast.txt`): unchecked ring vs card 3.5:1; brass ring vs selected card 6.74:1; dark centre vs brass 8.32:1; focus ring vs selected card ≈4.85:1.
- Mutants 7/7 red (`mutants/summary.txt`); covering 29 files 384/384 (`precheck-a2.log`); full vitest 269 files / 4,004 rc 0 (`precheck-full.log`); typecheck rc 0; lint rc 0 (205 warnings, 1 info = HEAD); Biome rc 0 on 6 files.
- Extra probe (`probe/compare-extra.txt`, EXTRA ALL OK; HEAD NOT OK): forced colours → all 6 radios `appearance: auto`; during a WAV render the Whole-project radio is disabled+checked with opacity 0.5 and the 4 px brass ring; the WAV download completes (journey row, L54).
- Timeouts (L31): the 4 files with new rows take 34–2,361 ms whole-file in the full run; no test near 50 % of its timeout.
- Collisions (L23): DXA7 and DXL8 pin `accent-brand` = 5 → granted, replaced by equal-or-stronger counts. DXL7c untouched.
- Claims: `claims-431.sh` rc 0, stderr empty (`claims-431-planning-output.txt`); sketch-side output and diff saved. L58 OK.

## 4. Reference
Live 12 manual 5.1.3 *Exporting Audio and Video* (read 2026-11-10): choosers and on/off options, no radio dots, no visual style stated. Our card radios are a pre-existing Saba-approved design (F11/COPY-PD); this round changes only how the dot is drawn, so no new L44 question. "Live never shows OS-default controls" is an inference.

## 5. L42 records from the 2026-11-10 policy (D-29z1518; recorded, not dispatched)
- **ARCH-SPLIT** queue entry after STORE-REDESIGN, before REVIEW-RECOMMENDATIONS (added to its prerequisites); stages -1/-2/-3/-REGRESSION in Saba's wording (see 5b for the StudioContext question).
- **SABA-LANE-RESIZE-HANDLE** (Low, Saba-seen) scheduled with COPY-PD-VIS.
- **LEGACY-REMOVAL-POLICY** in `workflow_policy.legacy_removal_2026_11_10`.
- `feature-status.md` and `b-next.json` `remaining` mirror them.

## 5b. Close-review follow-ups (D-29z1520)
- STUDIO-VIS-2 is a `stage_pointer` of SABA-B-12 with the parent's Medium severity (the audit's High kept as `severity_audit`).
- ARCH-SPLIT-3 keeps Saba's wording (DetailPanel + Lane + StudioContext); the conflict with the legacy freeze is root question ROOT-Q-ARCH-SPLIT-3-STUDIOCONTEXT, asked at ARCH-SPLIT planning.
- REGRESSION-2026-11-13 gains REG-SABA-B-12-SPIN and REG-SABA-B-12-RADIOS scope additions.

## 6. Order after round 431
REGRESSION-2026-11-13 when due → SABA-B-12 stage 2b (progress) → stage 3 (search cancel) → COPY-PD-VIS (+ lane resize handle) → SYS-1 → SYS-3 → STORE-REDESIGN 2b…5 (direction gate) → ARCH-SPLIT → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 queues under their gates. STEM-LANES jumps ahead when Saba answers. RETRO-435 at round 435.

## 7. Open items carried
TLM-SABA-B-12-FIREFOX-SAFARI (now also the radio dot; RETRO 435); ARCH-CHECKPOINT-SYS-2 (awaiting root); Saba-dependent: STEM-LANES, STORE-2b direction, SRW-21 (`deferred_user`), PHASE2-VIDEO-SCORING, SABA-Q-NUMBER-FIELD-DRAG.

## 8. Readiness for commit
Round 430 is published. This planning wrote only loop artifacts; store tree clean (`git status` empty at `5a30894`). The scratch `/tmp/b431` is outside the store.
