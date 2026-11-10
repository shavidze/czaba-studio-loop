# A round 426 — SYS-2 stage 2a (held Enter on lane, group, master, tempo-row buttons)

STATUS: DONE (handed to C). No STOP.

## Changed files (`git status --short --untracked-files=all`: 6 M + 3 ??, exactly the 9 grants)
- From B's sketch `b-round-425/sketch-426.patch.txt` (sha256 `c97f080fae4a…84078` = `sketch-426.sha256`). Applied with `git apply --check` then `git apply`. **None of these 8 files was edited afterwards.**
  - M `app/components/arrangement/ArrangementGroupHeader.tsx`
  - M `app/components/arrangement/ArrangementLane.tsx`
  - M `app/components/arrangement/ArrangementMaster.tsx`
  - M `app/components/arrangement/ArrangementTempoRow.tsx`
  - M `app/components/arrangement/ArrangementTransport.tsx`
  - M `app/components/arrangement/studio-soft-disabled.ts`
  - ?? `app/components/arrangement/studio-repeat-safe.ts`
  - ?? `app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx`
- Written by A: ?? `docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md`.
  - l.4 is byte-exact `**სტატუსი:** In Progress (stage 2 of 3; C round 426 PASS)`.
  - It has the 7 TEMPLATE `## ` headings, in order.
  - Its mutant block equals `b-round-425/mutants/summary.txt` (checked with `diff`, empty).
  - Every HM row id it cites exists in the test file (checked with grep).
  - Every `tmp/…` path it cites exists.
  - The per-file descriptions were checked against `git diff`.

## Checks (logs in `a-round-426/`)
| # | Check | Result |
|---|---|---|
| A1 | `claims-426.sh` at the start | rc 0; stderr empty; `claims-start.txt` identical to `claims-426-planning-output.txt` |
| A2 | covering vitest (57 files from `covering-files.txt`) | rc 0, **57 files, 1015/1015**; `mixer-held-enter-ui` 17/17 (`a2-vitest.log`). Slowest single test 1,999 ms (TC10, `transport-centre-ui`, describe timeout 15 s). The same TC10 took 4,679 ms in gate 424 `gates/round-424/verify.log`. The higher time decides (L11): 31 % of 15 s. `vitest.config.ts` sets no `testTimeout`. The gate's slowest tests are CP12a–d at about 5.7 s, in `clip-gain-pointer-preview.test.tsx` with a 30 s timeout, and that file is not in the covering set. **No covering test is above 50 % of its timeout.** |
| A3 | `npm run typecheck` / `npm run lint` | typecheck rc 0 (`typecheck.log`); lint rc 0 with 205 warnings and 1 info, the same as B's `precheck-lint.log` (`lint.log`) |
| A4 | `npx biome check` on the 8 code files | rc 0, "No fixes applied" (`biome8.log`) |
| A5 | claims at the end | rc 0, stderr empty (`claims-end.txt`). `claims-planning-vs-end.diff` differs from the planning output only as expected (see below) |
| A6 | `code-reviewer` on the 9 files | No Critical or High. One Medium, which is the already-ruled TL-R425-09 (see below). Lows handled. Score 8.5/10. Findings saved in `a-round-426/code-reviewer.md` |

### A5 detail
- K1 is still `f6c76f4…`.
- K2 = `3 ?? 6 M total 9`.
- K6 = `274-sys-held-enter-mixer.md` with the l.4 above.
- K2b 0; K3 frozen 1316 rc 0; K4 rc 0 with granted-protected 0.
- K8, K9 and K17 are byte-equal to `claims-426-sketch-output.txt`: helper local-fn 0, onKeyDown-helper 12, inline 0; scan-2a 14 ENTER-GUARD; HM rows 17, TH5 Fit unguarded, fit-onKeyDown 0.
- No other claim line differs from the planning output.

## Reviewer findings and what A did
- **Medium (reviewer): HM5 sends the repeats to the already-disabled reset button.** The case behind ruling 5 (reset refused during an active pointer gesture, button still enabled) has no row.
  - **The reviewer rated this Medium; B had ruled it Low.** It is TL-R425-09: `sketch-review.md` l.23 records it, and D-29z1491 deferred it to `deferred_low_polish` (stage 2b may add a gesture-active row).
  - It is a test-coverage gap, not sketch logic: MU-PAN-RESET turns HM5 red. So it is not a STOP (L11), and A did not edit the test.
  - B: please confirm the Low ruling, or schedule the gesture-active row in 2b.
- **Low: HM15's runtime asserts are green at HEAD as well** (TL-R425-01 already covers this). The doc now calls them a regression pin. The real evidence is `expectTypeOf` plus MU-SPREAD-TYPE.
- **Low: the doc said only Split, Loop and Zoom to range carry the spread.** Seven transport buttons place `onKeyDown` before `{...softDisabledButtonProps(...)}`: Undo, Redo, Split, Delete, Loop, Zoom to range and Zoom back. The doc is corrected.
- **Low: no Space-on-fold per-press row in the new suite.** The existing covering rows pin it, and both pass in A2:
  - `track-group-collapse-ui.test.tsx` UC1 (l.992 sends a repeated Space);
  - `track-layout.test.tsx` "Space on the focused fold button folds the lane…" (l.454).

  Not changed.
- **Low: HM13 observes only `defaultPrevented`.** The doc already says this. Not changed.
- The reviewer had no git and could not see `b-round-425/`. Its "behaviour identical to the old helper" is therefore unverified by the reviewer. A checked `git diff` itself: the deleted private fn and the Export inline copy had the same `Enter && repeat → preventDefault` logic as the shared helper.

## For B
- **Architecture note (code-reviewer):** no signal; keep as is. The repeated per-button edits are already planned for stage 2b with a grep row (TL-R425-06).
- **TL-R425-09** (HM5 gesture-active row): reconfirm it as a deferred Low, or add the row in stage 2b.

## Process notes (honest)
- The pre-flight skill was read after the sketch was applied, not before.
- The A self-check lessons (L11–L28) were first read truncated at 600 characters. Only L11 was later read in full.
- Of the task's "Read first" primitives, A read only `GEORGIAN_DOCS.md` (partly) and TEMPLATE (headings and writing style). The others (AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS) were not read.
- A wrote no code beyond B's sketch except the doc.
- After the review, A changed only doc wording, to address the reviewer's own doc Lows. No code changed after the review, so no re-review was needed (L11, RETRO 305).
  - Pre-flight in short: the request is to apply the dispatched sketch unchanged plus write doc 274.
  - It touches the 9 granted files only, with no drive-bys.
  - Success means A2 57/1015, typecheck and lint rc 0, Biome clean, and end claims as A5.
- No browser run by A (none required). Dev server :5173 was not started or stopped.
- No commit, push or install. No protected file touched.

## Known gaps
- No real-browser verification by A; C rows 4–7 provide it.
- TL-R425-09 is untested (deferred).
- Full suite, build and verify belong to the gate.

## Next C checks (task §6 order, L59)
1. Row 3 MUTANTS first, on a clean `git archive HEAD` base with `b425copy`. It passes when the output equals B's 18-line `summary.txt`.
2. Rows 4–7 in the browser on :5173:
   - row 4: held-enter probe, `ALL OK (28 cells)`;
   - row 5: per-press mouse and Space smoke equal to B's HEAD `smoke-focus-*.json`;
   - row 6: focus targets (Pan slider; group name button with a 1px solid `:focus-visible` outline);
   - row 7: the lane name probe for fade and trim, at 1440 only.
3. Rows 1, 2, 8, 9 and 10:
   - row 1: claims as A5, `L58 OK`, K13 has no NOT-FOUND;
   - row 2: patch identity `cmp` of the 8 files, plus A2;
   - row 8: auth;
   - row 9: doc 274 pins;
   - row 10: end scope and `l57-check`.

## Scope completed
Task §3 items 1–4: claims, sketch applied unchanged, doc 274 and this report.

## B acceptance this A actually passed
A1, A2, A3, A4, A5, A6 (with the TL-R425-09 note). C rows 1–10 are not claimed.
