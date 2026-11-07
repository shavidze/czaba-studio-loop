# A round 397: PERF-13d — demo synth buffers in five tasks from one shared array

**Status:** implemented, no STOP. Baseline `4f28bff`, clean tree at start.
**Scope completed:** §3 items 1–5 (3 code/test paths = B's sketch, byte-equal; 2 docs).

**Note for C/B (not treated as a STOP; B/C may rule otherwise):** the reviewer's pass-1 Medium on doc l.4 `Completed (C round 397 PASS)` is superseded by L28 and §3, which mandate that string byte for byte. Pass 2, run with the L28 context, found 0 Medium. Details under "Code-reviewer".

**Claims at the end vs the planning output** (`a-round-397/claims-end-vs-planning.diff`): the changed tags are exactly K2, K8, K9, K10, K12, K13, K14, K17 and K24, the §7 list. K11 and K23 are unchanged.

## Changed files (only the 5 grants)
| File | Change |
|---|---|
| `app/data/studio-lab-demo.ts` (M) | Sketch applied as-is: removed the `generateDemoStereoChannels` import; added `yieldToNextTask()` (`setTimeout(resolve, 0)`); `synthesizeDemoSamples(sourceId, signal)` → on the worker path: await composition → `await yieldToNextTask()` → `signal.throwIfAborted()` → stem/mix; the SFX path is unchanged (no yield); the buffer is `numberOfChannels: 2`, `length: samples.length`, `copyToChannel(samples, 0)` + `copyToChannel(samples, 1)` |
| `app/lib/arrangement/demo-synth.ts` (M) | `generateDemoStereoChannels` deleted (7 lines) |
| `app/data/__tests__/studio-lab-demo-synth-buffer.test.ts` (new) | SB1–SB6, identical to the sketch (`diff` = 0) |
| `docs/implementation/2026/quarter-IV/253-perf-demo-synth-buffers.md` (new) | Georgian; 7 TEMPLATE headings in order; l.4 `**სტატუსი:** Completed (C round 397 PASS)` |
| `docs/implementation/2026/quarter-IV/247-perf-pcm-live-baseline.md` (M) | l.4 → `**სტატუსი:** Completed (C round 397 PASS)`; TODO item 4 gains the suffix `**შესრულდა (round 397)**, დეტალები: doc 253 (...)`. No other line changed |

Code diff: `a-round-397/app.diff.txt`. Sketch equality: the `+/-` lines of the 2 source files equal the sketch hunks exactly; the test file equals the sketch's new file exactly.

## Commands (rc, log)
| Command | rc | Log |
|---|---|---|
| claims at start (`b-round-396/claims-397.sh`) | 0; equal to `claims-397-planning-output.txt` (no diff, so doc number 253 was free) | `a-round-397/claims-start.txt` |
| `git apply --check` + `git apply` sketch (sha256 `4db03d5a…ce3a6`, verified) | 0 | — |
| `npm run typecheck` | 0 | `a-round-397/typecheck.log` |
| `npm run lint` | 0 (205 warnings, 1 info, no errors; repo-wide, existing) | `a-round-397/lint.log` |
| `npx biome check` on the 3 `app/**` paths | 0 | `a-round-397/biome-scoped.log` |
| `npx vitest run` on `b-round-396/covering-files.txt` (16 files) | 0; 16 files, 219 tests | `a-round-397/covering.log` |
| Mutants: `python3 -I b-round-396/mutants/run.py /tmp/a397-scratch a-round-397/mutants` | 7/7 RED, pristine rc 0, pristine-after rc 0 (same rows as B's summary) | `a-round-397/mutants/summary.txt`, `mutant-*.log` |
| claims at end | 0; vs `claims-397-on-sketch.txt` only K2 (`4f28bff 5`) and K13 (both docs l.4 Completed, doc253 headings 7, in-progress-docs 3) differ, both §7-allowed | `a-round-397/claims-end.txt`, `claims-end-vs-sketch.diff` |
| `sha256sum -c b-round-396/r397-frozen-sha256.txt` | 0 failures | — |
| `sha256sum -c b-round-318/protected-sha256.txt` | 11/11 OK | — |
| `grep -rln 'In Progress (stage' docs/implementation` | 3 files | — |
| `grep -rn 'C round [0-9]* pending' docs/implementation` | 0 | — |

**Timeout headroom (L31):** the slowest covering tests are NG5 at 1.68 s (15 s describe timeout) and DW10 at 1.20 s (5 s default), both under 50 %. Not run, per the speed rule and the task: the full suite, verify, build, the perf spec and any browser.

## Deviations from the sketch / task
- None in code.
- **Doc 247 TODO wording:** my first edit replaced the prefix `4. **13d:**`, which moved claim K23 (`todo-13d` 1 → 0), and K23 is not in §7. I re-edited the item so it keeps the exact prefix and appends the done marker plus the doc 253 pointer. K23 now equals the planning value.

## Code-reviewer (actually invoked; 2 passes)
- **Pass 1** (all 5 files): Critical 0, High 0. The reviewer verified that both `loadSource` consumers ignore the new aborted rejection (`ArrangementContext.tsx` ~1505/1517, ~4468/4490), that timer ordering holds, and that every SB row can fail.
  - **Medium (docs l.4 "Completed (C round 397 PASS)" not backed in the tree):** not changed. L28 and task §3 mandate this exact string byte for byte, and C checks it. This is not a STOP: the reviewer's ask conflicts only with the policy-defined convention, not with the task.
  - **Low (doc 253 abort sentence overgeneralised):** fixed. The doc now says only the worker path checks the signal and the two SFX do not.
  - **Low (future tense on the browser rows):** fixed. The rows are now cited as C round 397 evidence.
  - **Low (no row for an abort during the worker await or a pre-aborted signal):** not changed. This is B's ruled matrix exclusion (`sketch-review.md` L3, same `throwIfAborted` line as SB5).
  - **Low (`vi.restoreAllMocks()` no-op; SB6 sits before SB5):** not changed. The test file is B's sketch verbatim.
- **Pass 2** (delta re-review of the two doc edits): 0 Critical/High/Medium. One Low said the B-sketch perf numbers were not attributed to a source. I fixed that with a doc-only attribution edit (the numbers now cite `b-round-396/perf-sketch-load-rows.txt`); there was no re-review after this one-phrase doc edit.
- **Architecture note:** the reviewer said "none". Its alternative (one shared build queue) was rejected in favour of the current per-load yield.

## Known gaps
- C has not run any browser row yet; the doc's l.4 is the post-PASS value per L28.
- Hidden-tab `setTimeout(0)` throttling (about 1 s) is accepted (sketch-review L1) and recorded in the doc 253 TODO.
- The two generated SFX still build in the effect task and ignore the abort signal (ruled, SB6).
- Older docs (`211-perf-demo-synth-worker.md`) still mention `generateDemoStereoChannels` as history. Not granted, not changed.

## Exact next C checks (task §6)
1. SOURCE-SCOPE first: claims (start must equal the planning output) and `git status` (exactly 3 M and 2 ??, as above); both sha256 manifests.
2. PERF-LOAD alone (`npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts`): `failures` empty, `load.script-max` < 100, `harness.loaf-scripts-live`; record the `load.*` rows next to `b-round-396/perf-sketch-load-rows.txt`.
3. Warm up `/studio-lab` in a browser, then `rows.cjs` 3× per viewport at 6× → BUF-TASKS (`maxSynthBuildsPerLongtask` ≤ 1), BUF-SAME-ARRAY (5), BUF-HASH (equals `head-6x-hash.json`, hash0 = hash1), BUF-STATUS (the exact ready text), BUF-PLAY.
4. AUTH (fresh context), DOCS (doc 253 headings and ids; doc 247 diff = l.4 + TODO item 4 only).
5. jsdom-only SB5/SB6: `a-round-397/mutants/summary.txt`.

## Acceptance (A-side only)
- Passed by A: SB1–SB6 green; 7/7 mutants red; typecheck, lint and scoped Biome rc 0; covering set rc 0; claims at the end differ only in the §7 facts; manifests intact.
- Not claimed: every §6 browser row (C) and every gate row (root).
