# A round 409 — PERF-11c-iii-e-ii (Lane shell + memo inner)

No STOP. Evidence folder: `a-round-409/`.

## Pre-flight gate (run before the patch)
- Assumptions: the reviewed patch is applied byte-for-byte and is the only code change. Nothing visible or behavioural should change.
- Files: the 2 patch files (the patch itself), doc 261 l.4 (L28 final stage) and doc 262 (the new implementation doc). These are the 4 granted paths and nothing else.
- Success: A1–A5 as run below. `/check` was applied as the task defines it, as `npm run lint` plus `npx biome check` on the 2 patch paths. No `check` skill exists under `.claude/skills`.

## Changed files (`git status --short --untracked-files=all`: 3 ` M` + 1 `??`)
- ` M app/components/arrangement/ArrangementLane.tsx`: patch, byte-for-byte; not edited afterwards.
- ` M app/lib/arrangement/__tests__/render-budget.test.tsx`: patch, byte-for-byte; not edited afterwards.
- ` M docs/implementation/2026/quarter-IV/261-perf-lane-actions.md`: l.4 only -> `**სტატუსი:** Completed (C round 409 PASS)`.
- `?? docs/implementation/2026/quarter-IV/262-perf-lane-memo.md`: new doc. l.4 is byte-exact `**სტატუსი:** Completed (C round 409 PASS)`. Its `## ` headings equal TEMPLATE's 7 (after `## Prompt`), in order (checked by diffing `grep '^## '` output). The mutant block is copied verbatim from `b-round-408/mutants/summary.txt`.

Patch: `b-round-408/sketch-409.patch.txt`, sha256 `1beedffbda3eca0f6b7befe112c8d7729b0684929cb60633e1024fe5e49c50ac` (equals the dispatched sha). `git apply --check` OK, then `git apply`.

## Checks (actually run)
| # | Check | Result | Evidence |
|---|---|---|---|
| A1 | claims at start | Identical to `claims-409-planning-output.txt` (`diff` empty); stderr 0 bytes; HEAD `37b1db8`, tree clean | `a-round-409/claims-start.txt`, `claims-start-stderr.txt` |
| A2 | `npm run typecheck` / `npm run lint` / `npx biome check` on the 2 patch files | rc 0 / rc 0 / rc 0 | `a-round-409/rc.txt`, `typecheck.log`, `lint.log`, `biome.log` |
| A3 | `npx vitest run $(cat b-round-408/sketch-logs/covering.txt)` (46 files) | **914/914 pass**, 46/46 files, rc 0, 111 s | `a-round-409/covering.log`, `covering.json`, `slowest.txt` |
| A3 L31 | Slowest test vs its declared timeout | Slowest is UC5 (`track-group-collapse-ui`) at 3,790 ms of 20,000 ms (19 %). Every test above 2 s sits in a describe or test with a 15,000 or 20,000 ms timeout. The highest ratios are render-budget Play→Stop→Play at 2,658/15,000 (18 %) and NG5 at 2,344/15,000 (16 %). Tests under 2 s at the default 5,000 ms are below 40 %. RB-LEAF rows take at most 652 ms. **None is above 50 %.** These times are higher than B's sketch run (2,072 ms max) but use the same timeouts | `a-round-409/slowest.txt` |
| A4 | claims at end | rc 0, stderr 0 bytes. Differs from planning only on K2 (4), K5 (`no`), K6 (`1` + doc 262 l.4), K6a (`Completed (C round 409 PASS)`), K6b (7, pending-form 0), K7, K9 and K10. K7/K9/K10 equal `claims-409-sketch-output.txt` (the sketch-vs-end diff covers only K1/K2/K6/K6a/K6b). K3 frozen 1,299 rc 0; K4 protected rc 0, granted-protected 0 | `a-round-409/claims-end.txt`, `claims-planning-vs-end.diff`, `claims-sketch-vs-end.diff` |
| A5 | `code-reviewer` (4 files) | see below | below |

Not run by A (speed rules / gate rows): the full vitest suite, `npm run build`, `npm run verify`, the mutants and the browser probes (C rows 3–5). A ran no browser.

## Code review (A5): the `code-reviewer` subagent ran on the 4 files
**Verdict: no Critical, High or Medium findings.** Score 8.5/10. The stale-props check passes, the hooks are correct, there is no `any`, `ts-ignore` or `as` assertion, the tests are not vacuous, and the doc's test claims exist.

The reviewer had no shell, so it asked A to confirm three points with git. A confirmed all three:
- (a) No test row in `render-budget.test.tsx` was removed. The diff has 136+/1−, and the only `-` line is the old `studioLibraryPanelStrings` import, merged into `import { studioClipStrings, studioLibraryPanelStrings }`.
- (b) The inner body. The patch is byte-identical to B's reviewed sha, and `tech-lead` approved the inner body in `b-round-408/sketch-review.md`.
- (c) Doc 261's diff is the l.4 line only.

Findings:

| id | sev | where | disposition |
|---|---|---|---|
| A-R409-REVIEW-L1-SK6-WORDING | Low | doc 262 TODO | **Fixed in doc 262.** SK-6 now says that any `sourceStates` change, and any `collection`, `sourcePeaks` or `videoSources` change, re-renders all lanes. This means extra renders only, never stale UI |
| A-R409-REVIEW-L2-EVIDENCE-OUTSIDE-REPO | Low | doc 262 | **Fixed in doc 262:** an explicit Evidence line says the loop evidence cannot be reproduced from the repo. The l.4 status stays `Completed (C round 409 PASS)`, because L28 and the task require that byte-exact form |
| A-R409-REVIEW-L3-L49-REF | Low | doc 262 §მიდგომა | **Fixed in doc 262:** "(L49)" replaced with a plain description of the rule |
| A-R409-REVIEW-L4-TRACK-FIELD-COVERAGE | Low | `render-budget.test.tsx` RB-LEAF7 | **Not applied**, because the patch is byte-for-byte (D-29z1420). There is no mutant coverage of a wrong compare body for `name`, `volume`, `groupId` or `kind`; only a missing key is a compile error. Proposal for B: add a volume step and a rename step, each expecting 1 inner render and the DOM updated |
| A-R409-REVIEW-I1 | Info | test l.1044/1050 | `shells() <= 3` is an upper bound only, as ruled (D-29z1419) |
| A-R409-REVIEW-I2 | Info | test l.1104 | `as const`, an existing pattern in 23 test files |
| A-R409-REVIEW-I3 | Info | `ArrangementLane.tsx` `biome-ignore` | Pre-existing: HEAD also has 1 occurrence. Not added in this round |

After the doc fixes, A re-ran the A4 claims (same result, stderr 0), the TEMPLATE heading diff (OK) and `git status` (3 M + 1 ??). The two patch files were not touched after the review.

**Architecture note (verbatim intent, a proposal for B and root, not acted on):**
- Signal 2 at `ArrangementLane.tsx` ~l.1305–1349: the ghost subscription and the title lookup moved into the shell. The reviewer says **keep it**: the move is local to one file and cheap.
- A possible follow-up owned by ArrangementContext: make the `sourceDurations` identity stable so that unrelated `sourceStates` patches stop re-rendering every lane. Acceptance: a status-only patch gives `ArrangementLaneViewInner` 0 renders, proved by a new RB row.

## Acceptance self-assessment (A rows only)
- A1 PASS, A2 PASS, A3 PASS (914/914, L31 OK), A4 PASS. A5 PASS: no Medium or higher finding; the Low doc findings are fixed in doc 262; the Low test-coverage finding goes to B as a proposal.
- C rows 1–8 are not claimed by A.

## Known gaps
- No browser check by A. LANE-ACTIONS, LEAF-PROBE and AUTH are C rows 3, 4 and 6.
- The doc's browser and mutant numbers are copied from B's sketch evidence (`b-round-408/probe/leaf-sketch-vs-head-409.txt`, `lane/*.json`, `mutants/summary.txt`). C's rows 3–5 confirm them on the working tree.

## Exact next C checks
Run row 5 first, then row 4, then row 3, as `current-task.md` §6 orders (L59):
1. Row 5: A3 set again, then the mutants on a committed scratch `/tmp/c409-scratch` (`OUT=<loop>/c-round-409/mutants`), plus the tsc guard (`colour?: string;` after `groupId?: string;`).
2. Row 4: `node b-round-408/probe/leaf-probe-409.mjs http://127.0.0.1:5173 <out>.json`. Warm `/studio-lab` in a browser first (L38).
3. Row 3: `node b-round-408/lane/lane-actions-probe.mjs http://127.0.0.1:5173 <out>.json 1440x900` and `1280x720`.
4. Rows 1, 2, 6, 7 and 8 as written. For row 2, compare the patch on a `git archive HEAD` scratch against the 2 working-tree files.

## For B
- Nothing outside the grants was touched. No STOP.
- A-R409-REVIEW-L4-TRACK-FIELD-COVERAGE (Low): candidate for `deferred_low_polish`, or a later test-only row.
- The architecture note above goes to the boundary checkpoint request: keep the current shape; making `sourceDurations` stable is a possible PERF follow-up.
