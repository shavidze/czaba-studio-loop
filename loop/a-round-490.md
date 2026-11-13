# A round 490 — SABA-B-17 fix-up (real scroll events in entrance tests)

No STOP. Every STOP condition in the task's §2 was checked and none applies. A read doc 316 in full (75 lines) and found no false line.

**For B — needs ruling: A-R490-REVIEW-NOCTRL-NEG-WHEEL (Low as rated by the reviewer, unruled).** It falls inside the stated contract ("ctrlKey alone decides zoom, at both delta signs"). Scroll rows S1 and E8c send a no-ctrl wheel only at `deltaY` +100, so the classifier `ctrlKey || deltaY < 0` survives. This is the same family as TL-R490-F1. The task's Low ruling covers modifiers and 0/3+ touches, not this case. It is below the STOP threshold, which is keyed on the reviewer's severity. A does not rule it. See R1 below.

## Start
- HEAD `73f994d`. `git status --untracked-files=all`, before applying: ` M app/components/loading/EntranceCover.tsx`, ` M app/components/loading/SpotlightLoader.tsx`, ` M app/lib/__tests__/store-entrance-loader.test.tsx`, `?? docs/implementation/2026/quarter-IV/316-saba-b-17-entrance-duration.md`. These are the same 4 paths as round 489.
- Start check: `bash ../tmp/studio-real-loop/b-round-489/claims-490.sh` gave rc 0 and empty stderr. Its output is equal to `b-round-489/claims-490-planning-output.txt` (`diff` gave no output). Saved as `a-round-490/claims-start.txt`.

## Apply
- The patch sha256 is `9280c737640e6f8755f0d3cbc1b567e70652eec83155fe03f7ee41094e2ded81`, which equals `b-round-489/sketch-490.sha256`.
- `git apply --check` and then `git apply ../tmp/studio-real-loop/b-round-489/sketch-490-v3-to-v4.patch.txt` gave rc 0 and printed nothing. A copy of the patch is in `a-round-490/applied-delta.patch.txt`.
- After applying, `git status` still lists the same 4 paths.
- Post-apply claims (`a-round-490/claims-after.txt`, rc 0, empty stderr) are **equal to `b-round-489/claims-490-sketch-output.txt`**:
  - K9 `sketch-490-files ==== patch=9280c737640e6f87 recorded=9280c737640e6f87`
  - K3 `components-equal-v3 EC== SL==`
  - K5 `plain-event-dispatch 0 real-wheel=1 one-touch=1`; K5b `zoom-fixture-param=1 zoom-default=1 s3-rows=2 e8e-rows=2 old-fixed=0`
  - K10 `lines=30 none=0 badanchor=0 … first22-equal-489=yes` (B's mutants; A ran no mutants, per the task)
- `cmp` with `b-round-489/sketch-490/` is equal for all 4 paths.

## Changed files (this round; no edits by A beyond the patch)
1. `app/lib/__tests__/store-entrance-loader.test.tsx`: changed by the delta patch only.
2. `docs/implementation/2026/quarter-IV/316-saba-b-17-entrance-duration.md`: changed by the delta patch only. Line 4 reads `**სტატუსი:** Completed (C round 490 PASS)`, which is the L28 form.
- `EntranceCover.tsx` and `SpotlightLoader.tsx` are byte-equal to v3 (K3). The protected files and `app/root.tsx` were not touched.

## Checks run (logs in `a-round-490/`)
| Command | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0: 187 warnings and 1 info across the repo, no errors. This equals `a-round-489/lint.log` (187 warnings, 1 info) (`lint.log`) |
| `npx biome check app/components/loading/ app/lib/__tests__/store-entrance-loader.test.tsx` | rc 0. 9 files checked, **exactly 3 pre-existing warnings**: EntranceCover.tsx:59 and :61 `noDangerouslySetInnerHtml`, and TrackListSkeleton.tsx:11 `noArrayIndexKey`. This matches K14 (`biome-scoped.log`) |
| `npx vitest run` on the 4 covering files | **4 files, 94 tests passed**, rc 0, 1.84 s in total (`covering.log`). No test is near its timeout |
| code-reviewer on the 2 changed files | the actual subagent ran it; findings are below |

Not run, per the task's §2: the full suite, the build, mutants and browser probes. They belong to the gate, to B and to C.

## Code-reviewer findings (score 8/10; no Critical, High or Medium)
| # | Sev | Finding | Disposition |
|---|---|---|---|
| R1 | Low | **A-R490-REVIEW-NOCTRL-NEG-WHEEL.** Scroll wheel rows run only with no-ctrl and `deltaY` +100, never with no-ctrl −100. So a classifier `ctrlKey \|\| deltaY < 0` would survive in S1 and E8c. | **Unruled; see the top of this report.** Below the STOP threshold. It is inside the pinned contract, so the task's "remaining survivors" ruling does not cover it. **For B:** possibly add a `deltaY` parameter to `dispatchScrollGesture` and an S1/E8c row at −100, or rule it out of contract |
| R2 | Low | **A-R490-REVIEW-TOUCH-DELTA-LABEL.** The touchmove rows pass `deltaY 0`, which has no effect, so the E8e title shows "touchmove (deltaY 0)". The `deltaY = 100` default of `dispatchZoomGesture` is never used by any caller. | For B (cosmetic test-title nit). The sketch is frozen, so it is not edited |
| R3 | Low | **A-R490-REVIEW-E18-LITERAL.** E18 (test file l.926) still uses `ENTRANCE_FAILSAFE_MS + 250`, while E8d now uses `ENTRANCE_EXIT_MS`. | For B; it is the same class as A-R489-REVIEW-E8D-LITERAL. It is not weaker: E1 pins 250 |
| R4 | Low | Doc l.4 says PASS before C has run. | Covered by the task's ruling (TL-R490-F2 / L28 kept). No action |
| R5 | Low | "30 mutants" includes the M0 control. | A checked it. `M0-HEAD-SOURCE rc=1 red=E1,…,S3` is the HEAD (pre-fix) source and it is red, so "30, all red" is true, and C16 counts 30 lines. No action |
| Nit | — | The doc says S2/E8d "sent a plain Event". The reviewer calls this imprecise because those rows dispatch after the listeners are removed. | The sentence is factually true (they did dispatch a plain `Event`), so it is not a false doc line and there is no STOP |

**Architecture note (from the reviewer):** none. Keep both helpers in the test file. As a possible later change, a contract table ({ctrl × sign} and {1, 2 touches}) would close R1 in one place if the contract grows. This is a proposal for B, not an in-round change. B's existing signal SIG-R489-ENTRANCE-ZOOM-RULE-TWICE stays as it is.

## B acceptance (§2, A's part) truly passed
- Start check equal ✔. `git apply` clean ✔. K9 `====` ✔. K3 equal ✔.
- typecheck ✔, lint ✔, scoped Biome with exactly 3 pre-existing warnings ✔, covering 4 files / 94 tests ✔.
- code-reviewer was run, with no Medium+ ✔.
- C's rows (C1–C18) are **not** claimed. No browser rows were run by A.

## Final `git status --short --untracked-files=all` (after all checks and the review)
```
 M app/components/loading/EntranceCover.tsx
 M app/components/loading/SpotlightLoader.tsx
 M app/lib/__tests__/store-entrance-loader.test.tsx
?? docs/implementation/2026/quarter-IV/316-saba-b-17-entrance-duration.md
```

## Known gaps
- R1–R3 are open Lows for B, to file or defer.
- The SABA-B-17 browser acceptance (C5–C15, including the C15 `/studio-lab` playback half) is still to be verified by C. Nothing is done until C PASS with `browserVerified` true.

## Exact next C checks
- C1: same 4 paths; `git diff --numstat 73f994d -- app/root.tsx` plus the protected files are empty.
- C2: claims start and end equal `b-round-489/claims-490-sketch-output.txt`. A's post-apply output already matches.
- C3/C4/C4b: K9, the covering 94 tests, and the mutants from a clone (never from `store/`).
- C5–C14: production-build matrix on :5191, run alone (L38); C8t: CDP touch.
- C15: `/studio-lab` anonymous → Enter adds a clip → Space gives `Playing` with the clock > 0 after about 1.5 s → Space gives `Stopped`. Also the `/account` and `/studio/middle-east` sign-in guards.
- C16 doc, C17 lessons, C18 L57 checker.

## Scope completed
Round 490's A part only: the delta was applied and the checks run. The whole backlog is not marked complete.
