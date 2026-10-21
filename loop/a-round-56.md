# A — Round 56 report: C-R48-01 timeout headroom (D-29z21)

Implementer: A (Claude Opus 5.5) · 2026-10-17 20:21–20:35 +04 · Evidence folder: `tmp/studio-real-loop/a-round-56/`
**No PASS claim.** C verifies. Nothing was committed, pushed, installed or deleted, and no server was started or stopped.

## 1. Pre-flight gate and baseline

**Pre-flight gate:**
- **Assumptions:**
  - Add the suite option as the 2nd argument to the 6 top-level `describe` calls.
  - Vitest 4 merges it into child tests and nested suites; hooks are untouched.
- **Smallest version:** 6 call sites, plus Biome's wrap.
- **Files to touch:**
  - the 4 owned tests;
  - the new doc 049.
- **Success criteria:**
  - `named-after` 128/128 with durations within 2× of before;
  - M1–M4 report 15000/15000/5000/5000;
  - tsc 0;
  - vitest 87/1504;
  - build rc 0 and verify rc 0;
  - Biome 0 diagnostics on the owned files, and `./app` ≤ 5/218/1.

**Primitives read before the edits:**
- `rules/read-primitives.md`;
- `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `AGENT_DISCOVERABLE_CODE.md`;
- `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`;
- the `pre-flight` skill.

The hook also injected `AUDIO_ARCHITECTURE.md` for doc 049. It does not apply to test infrastructure.

**Baseline (`baseline.txt`, 20:21): case (A).**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status` lists exactly the 17 listed paths.
- Frozen list 409 entries, 0 not-OK. Snapshots `SHA256SUMS` 4/4 OK, and `cmp` shows all 4 owned files the same.
- Protected files 4/4 OK. `node.exe` 9.
- Servers: `/studio-lab` **000**, `:5199` **000**. This contradicts the orchestrator note that 5173 is running (see §7).

## 2. Mechanism proof and durations

**Mechanism (`mechanism.txt`, logs `m-M1..M4.log`).**
- Scratch setup: `a-round-56/scratch` holds a copy of `store/app`, its own `vitest.config.mts` (the round-55 one, with paths changed to round 56) and a `node_modules` junction.
- The junction was created with `cmd //c "mklink /J …" </dev/null` and removed at the end with `cmd //c "rmdir …"`. `store/node_modules` still has 618 entries.
- Each case inserted `await new Promise<void>(() => undefined);` as the first statement of the named test, ran it, then restored the file from `store/` (cmp same).
- Command: `npx vitest run --config vitest.config.mts <file>` (from scratch).

| # | Change | Result |
|---|---|---|
| M1 | `track-layout` fold test (l.279) | `Test timed out in 15000ms`; 1 failed / 35 passed |
| M2 | `fader-guards` first `it` of `C-R36-01` (2 levels deep, l.1621) | `Test timed out in 15000ms`; 1 failed / 70 passed |
| M3 | M1 + removed `{ timeout: 15_000 }` from that describe | `Test timed out in 5000ms`; 1 failed / 35 passed |
| M4 | non-owned `grid-snap-ui` GS14 (l.363) | `Test timed out in 5000ms`; 1 failed / 19 passed |

All four behave as expected.

**Alone-durations.** Files: `named-before.txt` and `named-after.txt`; both 4 files, 128/128, rc 0, `node.exe` 9.

| Test | before ms | after ms | ratio |
|---|---|---|---|
| fold | 998 | 891 | 0.89 |
| no-history | 116 | 170 | 1.47 |
| adds three | 1145 | 1041 | 0.91 |
| searches | 462 | 600 | 1.30 |
| renders | 370 | 296 | 0.80 |
| `Clip Gain typed "3" → the same SFX header click …` | 57 | 80 | 1.40 |

No change exceeds 2×.

## 3. Diff summary

Files: `diff.patch`, `diff-w.txt`, `token-equivalence.txt`, `eol.txt`.

| File | Change | `it` lines | EOL after |
|---|---|---|---|
| `track-layout.test.tsx` | 3 describes, wrapped by Biome to `describe(\n  '<title>',\n  { timeout: 15_000 },\n  () => {` … `  },\n);`; bodies re-indented (+882/−866 raw, 1 hunk) | 36 | LF 1191, CRLF 0 (was 1175) |
| `sfx-library.test.tsx` | 1 line | 3 | LF 182, CRLF 0 |
| `master-ui.test.tsx` | 1 line | 18 | LF 701, CRLF 0 |
| `fader-guards.test.tsx` | 1 line | 63 | LF 1721, CRLF 0 |
| `docs/…/049-studio-test-timeout-headroom.md` | new | — | — |

## 4. Smoke

Not run. The servers are 000 at 20:21 and at 20:34. No app change was made.

## 5. code-reviewer (real subagent `code-reviewer`, agentId a7fee40ca8b95692b), score 9/10

**Verdict:** No Critical, High or Medium findings.
- The reviewer confirmed all 6 top-level describes, with nothing missed and nothing added elsewhere.
- It confirmed the runner semantics at l.726–727, 757, 817–818 and 942–946, and hooks at l.382, 1318 and 1322.
- It confirmed that `diff -w` scope matches token-equivalence.

**Findings and dispositions:**
- **Low — "no evidence for the after-durations or gate claims": rejected on evidence.** `named-after.txt`, `tsc.txt` (empty, rc 0), `full-vitest.txt`, `build.txt` and `verify.txt` are all in `a-round-56/`. The reviewer missed them.
- **Info — the row label `Clip Gain "3"` was ambiguous: fixed.** Doc 049 now names the full test.
- **Info — the round 51–54 counts and the 8454 ms value cannot be checked from A's folder:** these come from B's task and C's earlier reports. Doc 049 cites them as such.

**Architecture note:** none from the reviewer. Proposal for B, not acted on: the cost of mounting `StudioWorkspace` in jsdom is the real cause. A root `testTimeout` or worker cap stays the systemic lever.

## 6. Command tails (verbatim)

```
tsc rc=0
vitest rc=0
 Test Files  87 passed (87)
      Tests  1504 passed (1504)
   Duration  72.80s (transform 10.24s, setup 0ms, import 50.85s, tests 102.41s, environment 97.47s)
node.exe 9   (before and after the full run)
build rc=0   ✓ built in 2.48s
biome ./app --diagnostic-level=error: Found 5 errors (format): StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, auth.ts  = baseline CRLF list
biome ./app: Found 5 errors. Found 218 warnings. Found 1 info.
biome owned 4 files: "Checked 4 files in 46ms. No fixes applied." rc=0
npm run verify: rc=0 (quiet, node.exe 9 before; 0 "timed out" lines in verify.txt); tail "✓ built in 2.40s"
end (end-state.txt, 20:34): HEAD 038ed5a…; git status 22 lines (17 baseline + 4 ` M` + `?? …/049-…md`); frozen-notOK 0; protected 4/4 OK; node.exe 9; studio-lab 000; api 000
```

## 7. Deviations

1. **`track-layout` and the R56-S `diff -w` rule.** §4.1 allows a whole-body re-indent only if `diff -w` shows nothing but the added argument.
   - **Cause:** the re-indent pushed 2 `expect(live(api)…trackId).toBe('music'|'sfx')` lines (about l.703 and l.707) over Biome's lineWidth of 100. Biome re-wrapped them to `toBe(\n'music',\n)` (trailingCommas "all").
   - **Effect:** `diff -w` shows those 2 re-wraps, the 3 argument additions and the `},\n);` closings.
   - **Equivalence:** `token-equivalence.txt` proves the snapshot plus the 3 `{timeout:15_000},` insertions equals the edited file, after removing whitespace and normalising `,)`→`)`. The `,)` count went from 13 to 18, which is exactly 3 closings plus 2 `toBe`.
   - **Why I kept it:** the alternative is to leave the long line unformatted. That breaks the "0 diagnostics" criterion and the project Biome gate. The titles cannot change, and even a named constant would exceed 100 columns.
   - **B/C decide** whether this counts as acceptable Biome re-indentation.
2. **Servers down despite the orchestrator override.** 5173 and 5199 returned 000 at 20:21 and 20:34. No gstack browse was used; I created no browse state file.
3. **R56-LOAD was not run by A.** It is C's item.

## Scope completed / B acceptance

A-side items done:
- §1 baseline (case A);
- §2.1 (6 describe lines);
- §2.2 M1–M4 as expected;
- §2.3 durations within 2×, with tsc, vitest 87/1504, build, Biome and verify all rc 0;
- the code-reviewer review;
- §2.4 doc 049.

Not claimed: R56-S/U/LOAD, G56-1/2/3 and the §4.5 browser half. These are C's to verify.

## Next C checks (exact)

1. **G56-2:** HEAD, the 22-line status, frozen 409 OK, protected 4/4.
2. **R56-S:** `diff -u --strip-trailing-cr` and `diff -w` against the snapshots, and a ruling on deviation 1 (the 2 `toBe` re-wraps). `it` counts 36/3/18/63, LF.
3. **R56-U:** M1–M5 in C's own scratch with its own strings, plus durations.
4. **G56-1:** tsc, build, Biome, vitest 87/1504 and verify, quiet.
5. **R56-LOAD:** control run on the snapshot files, then 3 valid loaded runs.
6. **§4.5 and G56-3:** only if the servers are up. They were 000 at 20:34.

## Root / B follow-ups carried

- The servers-down question (the fifth round with no browser evidence).
- The root `testTimeout` / worker-cap option for C-R48-01-GRID-RESIDUAL.
- ARCH-CHECKPOINT-SRW14-PREFS.
- The commit units: rounds 50–55 (17 paths); round 56 (4 tests + doc 049) after C's PASS.
- **From `root-pre-push-review.md` (2026-10-07).** A has not re-verified these this round. Their current status is in B's `feature-status.md` and the backlog.
  - **Video sync:** RF3-1, RF3-2 and R5-L6 (now C-R27-01) are still open per task §4.7.
  - **Partially measured:** R5-L3 (master tap ≤ −60 dBFS; brace past `projectEnd`).
  - **Unit tests only:** R5-L5, R5-E1, R6-S2 and R6-S3.
  - **Medium:**
    - M1: loop refill is rAF-only, so a hidden tab goes silent.
    - M2: the per-frame `position` in the single context value makes every consumer re-render.
  - **Lows:**
    - L1: undo/redo is unguarded during a gesture.
    - L2: `holdUntil` on a reschedule in the hold window.
    - L3: Delete ignores `event.repeat` (backlog L3-REMOVED-TRACK-TAPS is a different item).
    - L4: a `setPointerCapture` throw leaves the gesture state set.
    - L6: export-dialog wording when the loop is on.
    - L7: unbounded history.
    - L8: an unguarded `new AudioContext`.
- **From `publication-checkpoint.json` (2026-10-07; A has not re-verified this round):**
  - **Purchased loader:** it hardcodes `middle-east`, so do not claim that every product's stems work (SRW-21). Instruction files need portable paths.
  - **Scrollbar refinement request:** a thin graphite track and a muted thumb with mint hover/focus, via tokens, on both timeline axes and the library. Wheel, keyboard and drag scrolling must be preserved. Check at 1280×720 and 1440×900.
  - **Library and stems parity:**
    - the SRW-12 library tree and the SRW-11 left panel;
    - audible, honestly labelled demo stems;
    - the flow: find → open the stems folder → preview → drag onto a lane.
  - **T12:** continue the V1 and advanced phases after the original scope is verified.

**R56-S equivalence recipe for C (deviation 1):**
1. Take the snapshot `track-layout.test.tsx`.
2. Insert `{timeout:15_000},` right after each of the 3 whitespace-stripped `describe('<title>',` prefixes.
3. On both files, strip all whitespace (`/\s+/g` → ``) and replace `,)` with `)`.
4. The two strings must be identical (`token-equivalence.txt`: `true`).
