# A — round 283 (PERF-2 fix-up: test file + docs only)

**Scope completed:** the §3 test sketch is applied byte-identically, doc 211 is written, and the doc 163/169 sections are written. Code files are untouched. No STOP was raised (see the reviewer's item 6 below: a judgement call B should confirm).

## Changed files (this round)
- `app/lib/arrangement/__tests__/demo-synth-worker.test.ts`: now equals `b-round-282/demo-synth-worker.test.sketch.ts` (applied with `patch -p1 < test-sketch.diff`, clean).
- `docs/implementation/2026/quarter-IV/211-perf-demo-synth-worker.md`: new.
- `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`: hunks only in these places:
  - `### Pass-ის თანმიმდევრობა`: step 1 names the four settled rows;
  - `## მეტრიკების განმარტება და ზღვრები`: the `load.commits`/`load.components` row is now wallclock; new rows `load.settled-ms`, `load.script-max`, `load.settled.longtask-max` / `longtasks-over-50`;
  - one new TODO bullet (PERF-2).
- `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md`:
  - the `loaf-blocking-max` row: the instrumentation stores `duration` and, since round 282, `scriptMax`; it still stores no `blockingDuration`;
  - the B-R281 TODO bullet gains the GATE281-S2 sentence.
- `git status --short` = 4 M code + 2 M docs + 4 ?? (client, worker, test, doc 211). This is exactly the §4 set.

## Commands actually run
| Check | Result |
|---|---|
| Claims `claims-283.sh`, before any edit | output identical to `b-round-282/claims-283-output.txt` (empty diff) |
| `sha256sum -c test-sketch-sha256.txt` | OK |
| `sha256sum -c code-six-sha256.txt` | 6 × OK, at the end |
| `sha256sum -c b-round-281-r282-tree-sha256.txt` | rc 0, no non-OK line, at the end |
| `npm run typecheck` | rc 0 |
| `npm run lint` | rc 0; 205 warnings, 1 info, 0 errors (repository-wide; same counts as round 282) |
| `npx biome check` on the test file | clean, no fixes |
| `npx vitest run` on the 5 §7 files | **5 files / 101 tests pass**. DW1–DW11 present (DW6 has two cases). **DW10 716 ms** (< 2.5 s). Log: `a-round-283/vitest-5files.txt` |
| `grep -rn 'In Progress (stage' docs/implementation` | 0 |
| Doc 211 | l.4 = `**სტატუსი:** Completed (C round 283 PASS)`; the 7 TEMPLATE headings in order; every DW id it cites matches `DWn:` once in the test file |

## Unit mutants
A's own runs, on the scratch tree `/tmp/a283/tree` (`git archive HEAD` + the working-tree files). Log: `a-round-283/mutants-a.txt`.

| Id | Red rows | Must be red | OK |
|---|---|---|---|
| unmutated | none (12/12 pass) | — | yes |
| MU-U1 `??=` → `=` | DW2, DW3, DW9 | DW2 | yes |
| MU-U2 `onerror` → `() => undefined` | DW4 | DW4 | yes |
| MU-U3 drop `{ transfer }` | DW10 | DW10 | yes |
| MU-U4 `composition.mix.fill(0.5);` in the worker | DW10 | DW10 | yes |
| MU-U5 postMessage catch `finish(null)` → `return` (exact diff: `a-round-283/mu-u5.diff`) | DW11 | DW11 | yes |
| MU-U4 **control** on `demo-synth-worker.test.a282.ts` | DW3, DW9 (DW10 **green**) | proves the old vacuity | yes |

The red rows are identical to B's `b-round-282/mutants.txt`. The scratch files were restored after each mutant.

## Code review (`code-reviewer` subagent, actually run; score 8/10; it had no shell)
**Addressed** (docs, inside the grants):
- **(M3)** Doc 211's "77–115 ms" had no source. It now cites `b-round-281/v2-1a/latest.json` ([115, 108, 77]) and says the round-282 A and C runs reached only 82 and 73.
- **(M2)** Doc 163 overstated the `harness.loaf-scripts` guard. The wording now says:
  - the guard needs only one LoAF entry with a `scripts` field;
  - an empty `scripts` array gives `scriptMax` 0 and satisfies it;
  - MU-SYNC-FALLBACK shows the assert is live.
- **(L4)** Doc 163 now labels `[5,5,6]/[371,371,464]` as B's sketch run and adds C's `[5,6,5]/[371,464,371]`.
- **(L5)** Doc 211: "every path" → "every path after the worker is created".
- **(L7)** The MU-U5 diff is saved (`a-round-283/mu-u5.diff`).
- **(L8)** Doc 211's Testing section gains the four moved `res.js.*` bytes rows (from `c-round-282.md` §Perf).

**Not addressed** (outside the grants or frozen; for B):
- **(M1)** Doc 163 l.16 and l.94 still say `budgets.json` has 316 rows; it now has 320. These lines are outside the granted §4 sections, so this is a proposal.
- **(M2, code proposal)** In `perf/lib/instrumentation.ts` or the spec, require at least one LoAF entry with `scripts.length > 0` (or `scriptMax > 0`). Then a window whose `scripts` arrays are all empty cannot satisfy `harness.loaf-scripts`. The code is frozen.
- **(L6, the reviewer's item 6)** No row pins that the stall timer is cleared. A mutant that removes `window.clearTimeout(stallTimer)` from `finish` would probably survive; A did not run it.
  - Proposed fix: `expect(vi.getTimerCount()).toBe(0)` after release in the fake-timer rows, and run DW3 under fake timers.
  - I judged this a coverage gap, not a defect in the sketch. So I raised no STOP and made no edit (the test file is byte-frozen). B decides.
- **(L9, nit)** Test l.156–159 repeat `expectReleased(worker)` inline instead of calling the helper.
- **Architecture note (a proposal, not acted on):** A-R282-REVIEW-WORKER-PROTOCOL. Move `DemoSynthWorkerResponse`, `readDemoSynthWorkerComposition` and `demoCompositionTransfer` into a neutral `demo-synth.protocol.ts`; today the worker imports its own launcher. It is already recorded in doc 211's TODO.

## B acceptance status (only what A actually ran)
- **Passed by A:**
  - claims;
  - TEST-BYTES, the six code files' bytes and the tree sha256;
  - typecheck; lint rc 0; Biome on the test file;
  - UNIT 5/101, with DW10 at 0.72 s;
  - MU-U1…U5 red at their rows, plus the MU-U4 control;
  - doc 211: l.4, the headings and the cited ids.
- **Not A's:**
  - the LIBRARY-STATES and G283-AUTH browser rows (C's);
  - the full vitest, build, verify and smoke (gate rows).

  A ran no browser check and no perf run (task §7).

## Known gaps
- Reviewer M1 (316 → 320 in doc 163, outside the grant), the M2 code proposal and the L6 timer-clear coverage. Details above.

## Next C checks
1. SOURCE-SCOPE: both sha256 files rc 0; `git status` = the 10 entries above.
2. TEST-BYTES and HUNK-SCOPE:
   - doc 163 hunks at Pass step 1, the metrics table and TODO;
   - doc 169 hunks at l.37 and the B-R281 bullet.
3. UNIT (5/101, DW10 < 2.5 s), plus C's own MU-U1…U5 and the MU-U4 control.
4. DOC-211:
   - l.4 byte-exact;
   - its numbers against `a-round-282.md`, `c-round-282.md`, `c-round-282/equiv.txt`, `export-c282.json`, `worker-probe.json` and the added `b-round-281/v2-1a/latest.json` citation;
   - the GATE281-S2 sentence in doc 169.
5. LIBRARY-STATES (C's own production build) and G283-AUTH (`:5173`), both viewports, after a warm-up.
