# A — Round 213: GATE212-B1 (CP12 split, test-only)

No STOP. Implemented exactly task §1 (D-29z201). No deviation.

## Changed files (the 2 grants only)
- `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx`
  - New constant `CP12_SLIDER_CHUNKS: Array<[string, number, number]>` right after `MEMBERS`, holding the four chunks `['a',-600,-391]`, `['b',-390,-181]`, `['c',-180,29]` and `['d',30,240]`. No `as const`, no assertion.
  - The old `CP12` row is replaced by:
    - **CP12-COVER** (sync): the chunks, iterated in order, `toEqual` the generated `CLIP_GAIN_MIN_DB*10 … CLIP_GAIN_MAX_DB*10` list.
    - **CP12a–CP12d**: `it.each(CP12_SLIDER_CHUNKS)('CP12%s: …')`. Each row mounts its own workspace (`cm:-6, cx:1`) and uses `select(['cm'])` with a pointer counter that starts at 200. It runs the old single-clip loop body unchanged over `fromTenth…toTenth`, then ends with `gainOf(api,'cm')` = -6, `mismatches` = [] and `undoLabel` null.
    - **CP12e**: its own mount and `select(['cm'])` with a counter from 200. It contains the old Shift-fine block and the members-anchor loop unchanged and ends with `undoLabel` null.
  - Old vs new `expect`s. Every old `expect` is kept:
    - `gainOf cm toBe -6` is now in each of CP12a–d;
    - `gainOf toBe fineDb` (×2) is in CP12e;
    - `viaPointer toEqual expected` and `viaPending toEqual viaPointer` (×3 anchors) are in CP12e;
    - `mismatches toEqual []` is in CP12a–d;
    - `undoLabel toBeNull` is in CP12a–d and CP12e.
  - The step is still 0.1 dB, the describe timeout is still 30 s, and no per-test timeout was added.
  - A diff against the start copy `b-round-212/r213-granted-start/` touches only the constant and the CP12 block. CP1–CP11, CP13–CP17, the helpers and the setup are unchanged.
  - Biome reflowed the `it.each(` header over 3 lines (new lines only).
- `docs/implementation/2026/quarter-IV/167-waveform-outline-path.md`
  - l.70 is rewritten as Problem → Solution: 841 drags; 33.3 s in gate 212 against 30 s; the start copy at 33.8 s; the split; and the measured numbers below.
  - l.110 TODO now says the gate must confirm CP12a–d inside 30 s.
  - l.4 is unchanged: `In Progress (C round 212 check pending)`.
  - The rows cited in the doc exist: CP12-COVER, CP12e and `CP12_SLIDER_CHUNKS` as literals. CP12a–d are generated rows, and l.70 says so: "`it.each(CP12_SLIDER_CHUNKS)` … `'CP12%s: …'`". Grep `CP12%s` and `CP12_SLIDER_CHUNKS`, not `CP12a`.

## Tests actually run (this machine)
| Check | Result |
|---|---|
| `sha256sum -c --quiet b-round-212-r213-tree-sha256.txt` | rc 0 at start, rc 0 at end |
| Grant start hashes | Both OK at start |
| `npm run typecheck` | rc 0 (after the edits and again at the end) |
| `npx biome check` on the test file | No diagnostics, no fixes. Doc 167 is a `.md` file, which Biome does not process ("Checked 1 file") |
| File alone, run 1 | 25/25. COVER 1 ms, a 2253, b 2122, c 2111, d 2047, e 137 ms |
| File alone, run 2 | 25/25. COVER 1 ms, a 2149, b 2154, c 2095, d 2021, e 135 ms |
| Covering run `npx vitest run app/lib/arrangement app/components app/hooks --reporter=verbose`, nothing else running | rc 0. 155 files / 2236 tests passed in 133 s. COVER 2 ms, **a 4930, b 5104, c 4598, d 4627**, e 313 ms. All < 12 s |

The per-chunk times are about 2× lower than B's estimate (3.6–4.1 s alone, 8.0–8.8 s covering). This runner is faster than B's. The load ratio is the same (≈2.2×).

**5 slowest single tests (covering run):**
1. CP12b — 5104 ms
2. CP12a — 4930 ms
3. CP12d — 4627 ms
4. CP12c — 4598 ms
5. `track-group-mix-ui` UM9 X1 — 2116 ms

The next one is `track-group-collapse-ui` UC5 at 2026 ms. No other test is above 15 s, so there is no signal.

Logs: `a-round-213/a213-file-run1.log`, `a213-file-run2.log`, `covering-run.log` (and `.clean.log`).

## Red-proof (named mutants)
All mutants were made in the scratch copy `/tmp/a213scratch` (`git archive HEAD` + the 9 working-tree files + a `node_modules` symlink). Never in the store. Each mutant was restored and `cmp`-checked afterwards. Logs: `a-round-213/mutant-M{1,2,3}.log`.

- **M1.** Test l.217 chunk `c` → `['c', -179, 29]`.
  - **Red:** only CP12-COVER fails: `expected [ Array(840) ] to deeply equal [ Array(841) ]` at `expect(chunked).toEqual(full)`.
  - **Green:** CP12a–e (24 passed).
- **M2.** Scratch `app/contexts/ArrangementContext.tsx` l.466, inside `withMixOverride`, the `clip-gain` branch. This is the path of the single-clip pointer commit: `commitClipGainPending` → `withMixOverride(present, pointerOverride)`. When `override.gains.size === 1`, each `gainDb > 10` is written as `Math.min(gainDb + 0.1, 24)`.
  - **Red:** only CP12d fails, at `expect(mismatches).toEqual([])`. There are 139 entries, `single 10.1: 10.2 vs 10.1` … `single 23.9`, which is every unclamped value above 10 dB. 24.0 (clamped back) is not listed.
  - **Green:** CP12a–c, CP12e and COVER.
- **M3.** Test l.209 `MEMBERS_ANCHORS` `[40, [17, 24]]` → `[40, [17, 23.9]]`.
  - **Red:** only CP12e fails: `expected [ 17, 24 ] to deeply equal [ 17, 23.9 ]` at `expect(viaPointer).toEqual(expected)`.
  - **Green:** CP12a–d and COVER.

## Code review
I did not run a code-reviewer: only 2 files changed, and the task marks the review optional. So there is no Architecture note.

## Known gaps
- The full vitest suite, `npm run verify`, the build and the e2e smoke were not run (speed rule). They are gate rows. Whether CP12a–d fit inside 30 s under the gate's full load is still unproven until the gate runs. On this runner the covering run gives ~5 s per chunk.
- No browser rows were run by A (test-only round). G213-3 and STUDIO-SMOKE-213 belong to C.
- `git status` still shows the round-212 set (7 M + 2 ??) and nothing new.

## Exact next C checks
1. SCOPE-213:
   - HEAD is `28a274c`;
   - `git status` shows the round-212 set and nothing new;
   - `sha256sum -c` of the 1,057-file list;
   - `diff` of the 2 grants against `b-round-212/r213-granted-start/` (exact hunks, old→new: `213a214,219`, `901,902c907,924`, `906c928`, `926a949,956`, `955d984`; doc: `70c70` and `110c110` only).
2. COVERAGE-213:
   - compute the chunk coverage independently;
   - compare the old and new `expect` lists (above);
   - run the file twice;
   - run your own mutant, for example a seeded mismatch at one dB inside chunk `b`. Only CP12b should go red.
3. LOAD-213: the covering run alone, with CP12a–d < 12 s and the 5 slowest tests.
4. DOC-213: doc 167 l.70 and l.110, with each cited row id grepped. l.4 is unchanged.
5. AN-REVIEW-213: no `any`, `as` or `@ts-*`; semicolons present; Biome finds no fixes.
6. G213-3 and STUDIO-SMOKE-213 in the browser at 1440×900 and 1280×720 on `:5173`.

## Scope completed
The task's §1 split and the §2 grants are done. The self-checks I ran passed: typecheck, Biome, the file twice, the covering run under 12 s per chunk, M1–M3 red in the named row only, and the frozen list rc 0.

None of C's rows are claimed. GATE212-B1 is not closed until C PASS and the root gate.
