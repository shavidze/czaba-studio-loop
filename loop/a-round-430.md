# A round 430: SABA-B-12 stage 1 (STUDIO-VIS-1), number-field spin buttons

**Status:** implementation complete; handed to C. Logs are in `a-round-430/`.

## Baseline
- HEAD is `832b3ba`, not `76f4147`. It is a root-only commit (`primitive: Context limit 500 → 800 lines`) that touches only `.claude/primitives/REACT_CONTEXT.md`.
- `git diff 76f4147 HEAD -- app` is empty, so I accepted it as the task's Baseline clause allows. The tree was clean at the start.
- A1 claims at the start (`a-round-430/claims-start.txt`): rc 0 and stderr empty. The only line that differs from `claims-430-planning-output.txt` is K1 (the head sha). K3 is 1329 rc 0, K4 rc 0, K5 yes, K19 `L58 OK`.

## Changed files (`git status --short --untracked-files=all`: 2 ` M` and 3 `??`)
- ` M app/components/arrangement/ArrangementDetailPanel.tsx`: sketch only.
- ` M app/lib/arrangement/__tests__/detail-panel-fit.test.tsx`: sketch only (F10).
- `?? app/components/arrangement/studio-number-field.ts`: sketch only.
- `?? app/lib/arrangement/__tests__/studio-number-field.test.ts`: sketch only (NF1, NF2).
- `?? docs/implementation/2026/quarter-IV/278-saba-b-12-number-spinbuttons.md`: new doc.

The sketch's sha256 is `a459d975…`, which matches `sketch-430.sha256`. It was applied with `git apply --check` and then `git apply`, both rc 0. I did not edit the 4 sketch files afterwards.

## Checks (actually run)
| # | Check | Result | Log |
|---|---|---|---|
| A1 | claims at start | rc 0; matches the planning output except K1 (see above) | `a-round-430/claims-start.txt`, `claims-start-vs-planning.diff` |
| A2 | covering set (`covering-files.txt`) | **32 files, 660/660, rc 0** | `a-round-430/a2-vitest.log` |
| A3 | `npm run typecheck` | rc 0 | `a-round-430/a3-typecheck.log` |
| A3 | `npm run lint` | rc 0, 205 warnings and 1 info (same as HEAD/B) | `a-round-430/a3-lint.log` |
| A4 | `npx biome check` on the 4 code/test files | rc 0, no fixes | `a-round-430/a4-biome.log` |
| A5 | claims at end | rc 0, stderr empty. Compared with `claims-430-sketch-output.txt`, only K1 (head `832b3ba`, root commit), K2 (`3 ?? 2 M total 5`) and K6 (doc 278 is last; l.4 exact) differ. K3, K4, K5 (`no`), K8, K8b, K17 and K19 are equal | `a-round-430/claims-end.txt` |
| A6 | `code-reviewer` subagent on the 5 files | 0 Critical/High/Medium, 5 Low, score 9/10 (below) | this file |
| extra | B's `spin-probe.mjs` + `compare.py` on :5173 (A's tree), 1440×900 and 1280×720 | **`ALL OK (6 cells)`** on the second run. The first run's 1440 cell timed out on a cold load (an environment problem under L38; kept as `probe/after-try1-cold`). I opened 8 of the 18 crops myself (hover: all 3 fields at 1280 plus clip gain and start at 1440; focus: start at 1280, end at 1440, clip gain at 1280): no ▲▼. The other 10 crops (including all 6 `gutter-hover` ones) are covered only by the pixel diff. ArrowUp steps match HEAD in both viewports (`probe-run2.log`) | `a-round-430/probe-compare.txt`, `probe/after/`, `probe-run2.log` |

Doc 278 checks:
- l.4 is byte-exact.
- The 7 TEMPLATE headings are present, in order.
- The mutant block is identical to `b-round-429/mutants/summary.txt` (checked with diff).
- `grep 'C round N pending'` has 0 hits.

I did not run the full suite, verify or build; those are gate rows.

## Reviewer findings (code-reviewer, 0 Medium+)
1. Low (doc): the doc said F10 checks the pending state on all 3 fields, but only Clip Gain has a pending state. **Fixed in the doc.**
2. Low (sketch test, not editable): the NF2 regex `NUMBER_INPUT` has no `\b` before `type=`, so `inputType="number"` would count. This can only cause a false failure, never a false pass.
3. Low (sketch test): `CONSTANT_USE` rejects `className={STUDIO_NUMBER_FIELD_CLASS}`, and it accepts the constant anywhere outside the imports, not specifically on the input. F10 covers the second gap for the Detail panel.
4. Low (sketch test): `IMPORT_STATEMENT`'s lazy match could swallow code after a side-effect `import './x';`. No such import exists in the file today.
5. Low (doc): the doc had no evidence for ArrowUp stepping. **Fixed in the doc:** it now cites the probe's ArrowUp measurements (0.0→0.1, 0→0.001, 101.352→101.353), plus `appearance: textfield` and the 80×24 box.

Items 2–4 are in sketch files I may not edit. The L11 STOP applies only to Medium and above, so these go to B below. Against `sketch-review.md`:
- Item 3 is largely **already ruled** under TL-R430-05 (the use pattern) and TL-R430-06 (the scan's documented limits).
- Items 2 and 4 are not among TL-R430-01…09 and are new Lows.

After the reviewer ran, only the doc changed (citations and accuracy); no code changed, so a re-review is not required (L11 RETRO 305 clause).

At the end I re-ran the checks after the doc edits:
- claims: rc 0, stderr empty; only K1, K2 and K6 differ;
- status: 2 ` M` and 3 `??`;
- doc: l.4 exact, 7 headings, mutant block identical.

Every path the doc cites exists.

L31: `detail-panel-fit` took 8 tests in 2,557 ms with the default 5 s timeout per test. Nothing is near 50 % of its timeout.

## For B
- **Architecture note:** none (reviewer: "a small constant module, no state or ownership change").
- Proposed follow-up Lows for NF2 hardening:
  - new: add `\btype=` to the number-input regex;
  - new: make the import stripping safe for side-effect imports;
  - with TL-R430-05/06: accept `className={STUDIO_NUMBER_FIELD_CLASS}`.
- Baseline note: HEAD `832b3ba` is root's primitive-only commit, and the frozen list still verified rc 0.

## Known gaps
- Firefox and Safari were not tested (cloud has Chromium only). This is TLM-SABA-B-12-FIREFOX-SAFARI, deadline RETRO 435.
- C's rows (mutants, probe, auth, docs, L57) were not run by A. My probe run does not replace C's row 4.
- **What I did not do:**
  - I did not run the pre-flight skill.
  - I did not open `context/active-summary.md`, `context/active-backlog.json`, `tasks/round-429.md` or `c-round-429.md`.
  - I read the primitives only partly: the first ~60 lines of AGENT_DISCOVERABLE_CODE, TAILWIND_FIRST, DESIGN_TOKENS, GEORGIAN_DOCS and TESTING_QUALITY_GATES. I did not read FORWARDREF_COMPONENT or BUG_HUNTING_TESTS.
  - From `lessons.md` I read only the A self-check section (L11–L15, L26, L28).

  The code is B's reviewed sketch, applied byte for byte, so the risk is low, but these were not done.

## Exact next C checks
Rows 1–7 of `current-task.md` §6, in L59 order: row 3 mutants, then row 4 probe (warm `/studio-lab` first; my cold first load timed out once), then row 5 auth, then rows 1, 2, 6 and 7.
- For K1, expect `832b3ba` (the root commit), not `76f4147`.

## B acceptance passed by A
A1–A6 pass, with the K1 root-commit note on A1 and A5. I am not marking any C row or the backlog item complete.
