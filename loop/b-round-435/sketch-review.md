# Sketch review — round 436 (COPY-PD-VIS stage 1: STUDIO-VIS-4 + SR-435-2 + STUDIO-VIS-6)

Dispatched sketch: `b-round-435/sketch-436.patch.txt` sha256 `4bb19dd1f7954794ad90eca2589d66434de4c75092a8cd176edeb1ea5f1eca89` (10 diff headers). Reviewed = dispatched; no edit after the review.

**Verdict: tech-lead approve-with-lows** (2026-11-10, B round 435 -> 436). No Critical, High or Medium.

## B's runs on this sketch (L58)
- Covering (`covering-files.txt`, 8 files): `precheck-covering.log` 8 files, 208/208, rc 0.
- Full vitest on the sketch (L23 RETRO 305): `precheck-full.log` 272 files, 4018 tests, rc 0.
- `npm run typecheck` rc 0 (`precheck-typecheck.log`); `npm run lint` rc 0, 205 warnings + 1 info = HEAD (`precheck-lint.log`).
- Mutants (`mutants/summary.txt`, logs `mutants/mutant-M*.log`): M1-label, M2-footer, M3-announce, M4-from, M5-to each revert one string in source only; all 5 rc 1 (red); sketch green rc 0.
- Real Chromium 143 (`probe/copy-probe.mjs`), HEAD :5173 vs sketch :5174 (own cacheDir, stopped after): `probe/compare-raw.txt`. Label and input boxes, the "Clip origin" row box and the panel box are identical at 1440x900 and 1280x720 (1280: the Detail panel starts collapsed; the probe expands it). "source offset" hits in text/attributes: HEAD 0/2/1/3/1, sketch 0/0/0/0/0 (empty, selected text, selected attrs, after move text, after move attrs).

## Tech-lead findings and B's rulings
| id | severity | finding | ruling |
|---|---|---|---|
| TL-R436-01 | info | No user-visible "source offset" left in app/perf/e2e; only test titles (LSU6, CT3, SE4, WG9/10, MS7b/c, RC2) and historical implementation docs | Accepted. Titles describe the internal model; old docs are history |
| TL-R436-02 | low | The move/trim status text stays an inline literal in ArrangementClip.tsx; "clip origin" now lives in two places | Accepted for this round (smallest diff). `deferred_low_polish` id TL-R436-02-INLINE-STATUS (move to a strings.ts builder) |
| TL-R436-03 | low, pre-existing | WCAG 2.5.3: visible "From" is not in the accessible name "Time selection start (seconds)"; HEAD's "From, s" was not either | Not a regression. `deferred_low_polish` id TL-R436-03-LABEL-IN-NAME |
| TL-R436-04 | low | Visible labels lose the unit (sighted users get seconds from context) | Saba-approved copy; same question is already Saba's Q4 (`user-review/questions-retro-435.md`, SR-435-1). No new id |
