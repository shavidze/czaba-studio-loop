# A round 329: PERF-DRAG-PREVIEW stage c1 (project end leaves) + C-R328-01 test row (DP20)

**Status:** implemented, with all of A's rows run. No STOP. The tree is left uncommitted for C.
**Baseline:** HEAD `dae81bf`, clean before A started.

## Changed files (exactly 4; `git status --short`)
- `app/components/arrangement/StudioWorkspace.tsx`: B's sketch patch (§1.1–§1.2)
- `app/components/arrangement/ArrangementTransport.tsx`: B's sketch patch (§1.3)
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: B's sketch patch (§1.4: DP20–DP22 + `LATE_AUDIO_CLIPS`, verbatim, not strengthened)
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`: §1.5 by hand
  - l.4 is byte-exact.
  - The title names c1.
  - The 7 headings stay in order.
  - `### ეტაპი c1` (items 19–23) sits under მიდგომა.
  - Two alternatives are added.
  - A c1 mermaid diagram is added under არქიტექტურა.
  - Two file notes are added under შეცვლილი ფაილები.
  - One Problem → Solution entry is added.
  - Under ტესტირება: DP20–DP22 plus the names numbers 105 → 23 and the 108 crossing.
  - TODO lists c2–c5, the assert conversions (D-29z950) and the D-29z949 note.

The patch went in with `git apply` (its `--check` was clean). Nothing outside the grants was touched. No protected file was touched.

## A's rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: byte-equal to `b-round-328/claims-329-planning-output.txt` | run before editing (diff empty) |
| A-IMPL | PASS: the patch was applied, then §1.5 by hand | `git diff` |
| A-CLAIMS-AFTER | PASS. Only the allowed deltas differ from `claims-329-sketch-output.txt`: K2 `dae81bf 4`, K8 `11`, K11 the new l.4. K10 is unchanged (163 24 3) | `a-round-329/claims-after.txt` |
| A-SCOPE | PASS: 4 modified files, nothing untracked | `git status --short` |
| A-TYPE / A-LINT | PASS: `npm run typecheck` rc 0; `npm run lint` rc 0 (205 warnings, 1 info, pre-existing); K12 = 16; `npx biome check` on the 3 code files is clean (rc 0) | `a-round-329/typecheck.log`, `lint.log`, `biome-files.log` |
| A-UNIT | PASS: the 9 K13 files + `status-preview-store.test.ts`: **10 files, 117/117**. DP20–DP22 present and green | `a-round-329/unit.log` |
| A-MUTANT | PASS: `run-mutants.sh` on scratch `/home/runner/a329-scratch` (a git-tracked copy of A's tree, with `node_modules` symlinked). Each mutant is red on exactly B's rows. Restored: 24/24 | `a-round-329/mutants-a.txt` |
| A-REVIEW | done: the real `code-reviewer` subagent, 9/10, no Critical, High or Medium findings | below |

The mutant results:
- MU-WORKSPACE-RAW-END: red on DP21 and DP22.
- MU-WORKSPACE-COMMITTED-END: red on DP22.
- MU-OVERVIEW-COMMITTED-END: red on DP21 and DP22.
- MU-CLEAR-ANY-PREVIEW: red on DP20.
- MU-TRANSPORT-SUBSCRIBES: red on DP2, DP9a and DP21.

**Timeout headroom (L31):** no covering test is above 50 % of its declared timeout.
- The slowest is CP12a at 8.7 s, against the file's 30 s describe timeout (29 %).
- `render-budget` "does not re-render clips…" took 2.8 s against its 15 s timeout.
- R11-P1e took 1.8 s, NS5 1.6 s, against the 5 s default.
- DP2 is the slowest DP row at 0.57 s.
- Gate 328's `verify.log` times (the higher source, L11) are also all under 50 %:

  | Test | Gate time | Timeout | Share |
  |---|---|---|---|
  | CP12a | 10.2 s | 30 s | 34 % |
  | TC10 | 4.96 s | describe 15 s | 33 % |
  | SS8a | 2.7 s | 20 s | 14 % |
  | render-budget "does not re-render clips…" | 3.1 s | 15 s | 21 % |
  | RB-IM | 2.1 s | 15 s | 14 % |
  | R11-P1e | 2.07 s | 5 s | 41 % |
  | NS5 | 1.9 s | 5 s | 38 % |

**More checks:**
- K10 printed: `163 24 3`.
- `git apply -R --check b-round-328/sketch/sketch.patch.txt` from `store/`: OK. The patch hunks are verbatim, and the doc edit is separate.
- Pre-flight: run and stated in the session. The task's §1/§2 supplied the assumptions, files and success commands.

## code-reviewer findings → B (none fixed in this round, all Low)
- **A-R329-REVIEW-VIEWPORT-BOUND (Low, test gap).** jsdom's `clientWidth` is 0 and the fake ResizeObserver never fires, so no DP row covers the viewport-bound branch (`viewportSeconds` > end + 30). The selector is HEAD's formula, and C's D-ROWS covers that branch in the browser. Adding a jsdom row would need resize plumbing beyond the verbatim rows, so A did not strengthen here.
- **A-R329-REVIEW-LOOP-EXTENT (Low, test gap).** No DP row has a loop ending after the project end. Dropping `arrangement.loop` from the wrapper's `timelineExtent(projectEnd, arrangement.loop)` would stay green in jsdom. The loop argument is unchanged from HEAD (HEAD's `useMemo` also used `arrangement.loop`). Candidate for c2: one DP row with `loop.end` past the end, asserting `data-extent`.
- Reviewer Low 3 ("cited `b-round-328/*` artifacts do not exist") is **rejected**. The reviewer could not see the loop folder. `names-head-dae81bf.json`, `names-sketch-final.json` and `run-mutants.sh` exist, and the claims K14 = checked.
- **Architecture note (for B, not acted on):** "signal 2 (ownership moved): the extent and readout now live in the overview wrapper and `ArrangementProjectEndText`. **Keep.** State lives where it is rendered, and no state, effect or lifecycle was added. Lanes reading the timeline width from a store is already a recorded candidate."

## Known gaps
- A ran no browser or perf rows, as the task says. END-LIVE, DRAG-NAMES, D-ROWS, PERF and G329-AUTH are C's.
- A did not run the full vitest or `npm run verify` (speed rules: the gate runs them).
- The doc's l.4 text "C round 329 PASS" is B's prescribed wording. It is true only after C passes.

## Exact next C checks
1. `bash b-round-328/claims-329.sh` must equal `a-round-329/claims-after.txt`.
2. SOURCE-SCOPE: 4 files. `git apply -R --check b-round-328/sketch/sketch.patch.txt` must pass, because the test hunk is verbatim.
3. UNIT ×3 and MUTANT on C's scratch.
4. END-LIVE against :5173 vs a HEAD `dae81bf` server with its own `cacheDir`.
5. DRAG-NAMES on a warm :5173.
6. D-ROWS on A vs HEAD.
7. PERF on a production build, interactions spec alone.
8. G329-AUTH at both viewports.
9. DOCS against §1.5.

## Scope completed
§1.1–§1.5 of round 329 (stage c1 + DP20 for C-R328-01). PERF-DRAG-PREVIEW stays in progress: c2–c5 and the assert conversions remain. A does not mark any C or browser acceptance row as passed.
