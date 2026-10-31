# A round 285 — PERF-3b: seconds ruler page window + Follow flip notify

No STOP. Every §9 condition was checked and none was met.

## Changed files (exactly §4)
`git status --short` shows 7 `M` and 1 `??`:
- `app/lib/arrangement/view.ts`, `app/components/arrangement/ArrangementRuler.tsx`, `app/components/arrangement/ArrangementTempoRow.tsx`, `app/components/arrangement/StudioWorkspace.tsx`, `app/lib/arrangement/__tests__/view.test.ts`, `app/lib/arrangement/__tests__/tempo-window-ui.test.tsx`: these equal `b-round-284/sketch.diff`. `sha256sum -c b-round-284/sketch-sha256.txt` gave 6/6 OK, rc 0.
- `docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md`: only l.4, l.17 and l.101 changed, to the exact §4 texts (`git diff -U0` shows 3 −/3 +).
- `docs/implementation/2026/quarter-IV/213-perf-ruler-tick-window.md` (new):
  - l.4 = `**სტატუსი:** In Progress (stage 2 of 3; C round 285 PASS)`;
  - it has the 7 TEMPLATE headings in order;
  - every row id it cites (RW1–3, SR1–6, BU1/2/7/8) has exactly 1 hit in the test files;
  - the mutant ids it cites are those of §3.

No other files changed. Protected files, `perf/**`, `peaks.ts` and `package.json` are untouched.

## Commands and results (actually run)
1. Claims: ran `bash ../tmp/studio-real-loop/b-round-284/claims-285.sh` before any edit. Its output is identical to `claims-285-output.txt` (`diff` empty).
2. Applied `patch -p1 < …/sketch.diff`. The dry run was clean and the real apply returned rc 0. sha256 check: 6/6 OK.
3. `npm run typecheck`: rc 0. `npm run lint`: rc 0, with **205 warnings and 1 info**, the same as gate 284. Biome on the 6 code/test files: clean.
4. `npx vitest run $(cat b-round-284/covering-files.txt)`: **69 files / 1,261 tests passed**, in 130 s wall time. The per-file times for the touched tests are `view.test.ts` 44 tests in 0.68 s and `tempo-window-ui` 14 tests in 4.7 s.
   - **L11 timeout headroom:** no test is above 50 % of its timeout. The slowest are CP12b at 9.9 s of 30 s (33 %), TC10 at 4.6 s of 15 s, DXM3 at 3.7 s of 20 s, and NS5 at 2.1 s of the 5 s default (41 %). These ran while 69 files ran in parallel. Gate 284 times were lower (for example, CP12b 4.4 s).
5. Mutants: `HEAD_TREE=/tmp/a285/head` (a `git archive 0f99960` copy), run on a copy of the final tree. Log: `a-round-285-mutants.txt`.

| Mutant | rc | Red rows (A) | §3 expected |
|---|---|---|---|
| HEADRULER | 1 | SR2, SR3, SR4, SR5, SR6 | same |
| W1 | 1 | SR2, SR3, SR4, SR5, SR6 | same |
| W2 | 1 | RW1, RW2, SR2 | same |
| W3 | 1 | RW1, RW2 | same |
| W4 | 1 | SR2, SR3, SR4, SR5, SR6 | same |
| W5 | 1 | SR3 | same |
| W6 | 1 | RW3, BU2–BU7, SR2, SR3, SR4, SR6 | same |
| W7 | 1 | SR6 | same |

6. Browser smoke (§7.6), run alone:
   - Build: A's own production build in scratch `/tmp/a285/base`, with its own `cacheDir` `/tmp/a285/vitecache` (the vite.config edit is in scratch only), served by `remix-serve` on :5291 and warmed up once.
   - Probe: `ruler-probe.cjs` in `in` mode at 1440×900. Output: `a-round-285/smoke-in-1440.json`, shots in `a-round-285/shots-in-1440/`.
   - Ruler counts: **start 94, then `[76,62,50,40,64,40,50,62,76,94]`**. This equals §1.2. `coverage.missing` is 0 at the start and at every step.
   - Event Timing is recorded only. It is not a perf run.
   - Afterwards the :5291 server was stopped. The orchestrator's :5173 dev server was not touched and returns 200.
7. Docs: doc 213 and the three doc 212 lines, as described above.
8. The code-reviewer subagent ran on all 8 paths. It scored **9/10** and found no Critical, High or Medium findings. Its notes follow.

## Code-review notes (for B/root)
**§9 check:** §9 counts "a defect the code-reviewer finds in the sketch" as a STOP, so I checked whether the Low in item 1 triggers it. It does not, and I made no edit:
- the finding is Low and cannot be reached (`scrollLeft` is always finite);
- the bars ruler already behaves this way at HEAD;
- the code is byte-locked by `sketch-sha256.txt`.

This is the same handling B gave A-R284-REVIEW-NEG-LOOP in D-29z682. Smoke evidence on disk: `smoke-in-1440.json` plus 11 shots in `shots-in-1440/`. I read the files on the §0.3 list, including `FORWARDREF_COMPONENT.md` and `prompts/studio-feature.md`.
1. **Low, in sketch code, not fixed** (the sketch is byte-locked, §4 and §9): `view.ts` `readTimelinePage` and `parseTimelinePageKey` do not reject a non-finite page.
   - Effect: a NaN `scrollLeft` would give key `'NaN:vp'`, then a `{NaN,NaN}` window, so the seconds ruler would render 0 ticks. On HEAD it would have rendered all of them.
   - The bars ruler already had the same behaviour on HEAD.
   - Reachability: none in practice. `Element.scrollLeft` is always finite in browsers, and in jsdom it defaults to 0.
   - Suggested later fix: return null for a non-finite page or a non-finite parse, plus an RW3 row.
   - Proposed id: **A-R285-REVIEW-NAN-PAGE (Low)**, to go to `deferred_low_polish`.
2. Info: the input guards of `rulerTickMarks` and `barsRulerMarks` differ. With `seconds = Infinity` and no window, `rulerTickMarks` throws a RangeError, and HEAD does the same. The app cannot reach this.
3. Info: the first client commit still renders every tick. The scroller ref is null on the first render, so the key is `''`. The window replaces the full list in the post-subscribe snapshot or on the resize notify. This matches D-29z684. Doc 213 now shows the ResizeObserver → notify edge in its diagram. **A fixed this in its own doc** (the reviewer's diagram note).
4. Info: `getTimelineViewportPx` reads the live `clientWidth`, but the Follow writer uses the cached `viewportWidthRef`. The two agree after ResizeObserver runs.
5. Info: in SR6, the line `expect(onScroll).not.toHaveBeenCalled()` is always true in jsdom. The row is still strong through its window assertions; W7 turns it red.
6. **Architecture note: keep.** The helpers moved into `lib/`, which removes a duplicate. The `useSyncExternalStore → parse → window` chain has 2 call sites (ArrangementRuler, ArrangementTempoRow). If a third consumer appears, a bounded `useTimelinePageWindow` hook task could follow, with BU1–BU8 and SR1–SR6 as its acceptance tests. This is a proposal only.

## B acceptance (A's part only)
- [x] Claims match before editing (§Baseline)
- [x] Patch applied and sha256 checks 6/6
- [x] typecheck rc 0, lint rc 0 (205 warnings)
- [x] 69 / 1,261 covering tests pass, none above 50 % of its timeout
- [x] HEADRULER and W1–W7 each red at their §3 rows
- [x] Browser smoke at 1440 `in` equals §1.2, missing 0
- [x] Doc 213 (l.4, headings, ids) and the three doc 212 lines
- [x] code-reviewer run, notes passed on above

Not claimed, because they belong to C or the gate:
- the C rows: RULER-NODES-IN/OUT (3 runs, both viewports, HEAD control), RULER-PIXELS, RULER-JUMP, RULER-FOLLOW-FLIP (including the W7 control build), FOLLOW-IDLE, ZOOM-TIMING, PERF-RUN, DOC-213 and G285-AUTH;
- the full vitest suite, the build gate, `npm run verify` and `test:e2e:smoke`.

## Exact next C checks
- **SOURCE-SCOPE:** `git status` shows 7 M + 1 ??; the sha256 check gives 6/6; the doc 212 diff covers only l.4, l.17 and l.101.
- **UNIT:** the 69 / 1,261 sweep, plus C's own HEADRULER and W1–W7.
- **RULER-NODES-IN/OUT and RULER-JUMP:** both viewports, compared with HEAD 0f99960 controls. Each build gets its own port and `cacheDir`, and is warmed up and run alone.
- **RULER-PIXELS:** 28 shots per viewport, meanAbs 0.
- **RULER-FOLLOW-FLIP:** A's tree gives `secondsGapRuns` `[]` (2 runs each, plus 1 run with BPM 120). The W7 control build shows at least one gap run.
- **FOLLOW-IDLE:** `rm.ruler` and `rm.bars` are 0, and the bars counts match HEAD.
- **PERF-RUN:** run alone, recording `res.dom.ruler-1/2`.
- **DOC-213:** the l.4 bytes, the headings, and the numbers against the `b-round-284/probe-results/*`.
- **G285-AUTH:** both viewports.

## Scratch
`/tmp/a285/` (head archive, final copy, base build, vitecache). It is temporary and does not survive the job.
