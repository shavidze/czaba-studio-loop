# A round 259: C-R258-01 perf harness fix-up (test code and docs only)

No STOP. No budget failure. No DEVIATION H6.

## Baseline
- The start HEAD was `d732d2623fc16032153aa262c3e7d41fca4ed59a` and the tree was clean.
- `app/` and the 7 protected files are untouched.

## Changed files (7)
`git status --short --untracked-files=all` shows these files, and only these:
- `M perf/lib/page.ts`:
  - **H1:** `playButton` now uses `getByRole('button', { name: 'Play', exact: true })`.
  - **H2:** `isPlaying` now checks `getAttribute('data-playing') === 'true' && audioRunning(page)`.
  - **H3:** `setPlayback` now waits for `toHaveAttribute('data-playing', playing ? 'true' : 'false', { timeout: 15000 })`.
  - These are the same hunks as B's `b-round-258/precheck/perf-fix.diff`, applied with `patch`.
- `M perf/studio-lab-interactions.perf.spec.ts`:
  - **H4:** `dragTarget` `'range'` now looks up `'drag = time selection · click = insert marker'`, still with `exact: true`.
- `M perf/budgets.json` (l.28) and `M perf/budgets.interactions.json` (l.39):
  - **H5:** only the `note` text changed. The Play button's "label Pause" wording became "data-playing attribute true".
  - Check: `jq 'walk(del(.note))'` on HEAD and on the working tree gives identical output for both files ("note-only OK").
- `M docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`:
  - l.73 is in the granted `## მეტრიკების განმარტება და ზღვრები` section.
  - l.100 is in the granted `## პრობლემები და გადაწყვეტები` section.
  - Both lines now describe the playing check as Pause → `data-playing`. `grep -c Pause` = 0.
- `M docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`:
  - l.48 is in the granted `### Liveness-ის წესები` section.
  - l.208 is in the granted `## Hygiene (PERF-1a)` section.
  - `grep -c Pause` = 0.
- `?? docs/implementation/2026/quarter-IV/194-perf-harness-playing-signal.md` (new):
  - It has the seven TEMPLATE headings in order.
  - l.4 is byte-exact: `**სტატუსი:** Completed (C round 259 PASS)`.
  - It names C-R258-01, the 6 stale hits, rounds 252–253 and 256, and D-29z512.
  - It cites the three existing perf spec files and A's real run result.

## Checks A ran
| Check | Result |
|---|---|
| `grep -rn "Pause\|click = playhead" perf` (H-GREP) | 0 hits (rc 1) |
| `npm run typecheck` (it covers `perf/**`, L30) | rc 0, no errors |
| `npm run lint` (`biome lint ./app`) | rc 0: 205 warnings and 1 info, all in unchanged `app/` (none caused by this round) |
| `/check` with Biome on the owned paths | Checks nothing: `biome.json` includes only `app/**`, so it does not cover `perf/` or `docs/` (L30). `typecheck` is the real check for `perf/**`. |
| `npm run test:perf` (run-1, log `a-round-259/perf-run-1.log`) | rc 0, all 3 specs passed in 15.2 min (PERF-1b-i 5.4 min, PERF-1b-ii 1.1 min, PERF-1a 8.4 min) |

### Perf run-1 details
Copies of the reports are in `a-round-259/latest*.json`.
- **Every report:**
  - `latest.json`, `latest-interactions.json` and `latest-resources.json` all have `complete: true` and `failures: []`.
  - Each has 6/6 passes with `abortedAt: null`, 0 page errors and 0 problems.
- **Assert rows:** every one passed: 92/92 (PERF-1a), 17/17 (PERF-1b-i) and 15/15 (PERF-1b-ii).
- **Liveness:** `harness.audio-running` = 1 and `interact.harness.audio-running` = 1.
- **SABA-B-5 / RR-FADER**, PERF-1a, for track, group and master faders, at 1× and 6×:
  - `*.playing.restarts` = 0;
  - `*.move-components-max` = 1 (budget ≤ 3);
  - `move-components-per-move` = 0.742–0.792;
  - `release-commits` = 1 (budget ≥ 1).
  - The pan rows also pass.
- **Run isolation (L38):** no vitest, tsc, build or other browser job ran during run-1. These light jobs did overlap it:
  - doc edits;
  - writing the checkpoint file;
  - a few `grep` calls;
  - the read-only `code-reviewer` subagent.

  All budgets passed, so run-1 stands and I did not use a replacement attempt.
- **Not run by A:** the RR-PERF-ORACLE (`equiv-check-b2.py`). That is C's job, so I make no claim about INFO-B259-COMPONENT-DRIFT.
- **Report location:** reports are written to `test-results/perf/`, which is gitignored, so they add no untracked paths.

## Code review (`code-reviewer` subagent, 7 files)
The score was 9/10, with no Critical, High or Medium findings.
- **Low:** doc 194 listed commands but no results. **Fixed:** the real run-1 result was added to `## ტესტირება`.
- **Low:** the Georgian wording "SABA-B-9 ეტაპ 1-მა" in doc 194. **Fixed:** it now reads "SABA-B-9-ის პირველმა ეტაპმა".
- **Info (signal for B / RETRO 260, outside this round):**
  - `perf/studio-lab.perf.spec.ts:596` and `perf/studio-lab-interactions.perf.spec.ts:535` save `isPlaying()` as `detail.contextRunning`.
  - After H2 that value means "`data-playing` is true and the context is running", so the name is slightly misleading.
  - I left it as it is, because §2.1 forbids any other change.
- **Other reviewer results:**
  - Only one element can match the exact `Play` name on `/studio-lab`:
    - `AudioPlayer` and `StemsPlayerModal` are not rendered on `/studio*`;
    - the library preview buttons are named `Preview`.
  - Every other perf lookup the reviewer traced resolves to a current app string.
- **Architecture note:** none. The underlying risk is already the RETRO 260 candidate PERF-HARNESS-STRINGS-DRIFT (task §7).

## B acceptance rows: what A checked itself
I ran these checks myself. C still decides on each row.
- **SOURCE-SCOPE:** the path list above matches the task's list exactly.
- **H-GREP:** 0 hits.
- **H-DIFF:** H1–H5 only; the `budgets*.json` files differ only in `note`.
- **DOC-259:** no Pause wording left in the granted sections; doc 194 has the right headings and l.4.

Not claimed by A:
- **H-SIGNAL:** browser check on :5173, C's row.
- **RR-PERF-259:** C's run is the acceptance; mine is supporting evidence.
- **RR-PERF-ORACLE** and **G259-AUTH:** C's rows.
- **Gate rows:** full vitest, build and verify.

## Next C checks (in B's order)
1. SOURCE-SCOPE-start.
2. H-DIFF, with the `jq` note-only diff.
3. H-GREP.
4. H-SIGNAL at 1440×900 and 1280×720: Add a clip, blur focus, press Space twice; expect `data-playing` to go false → true → false, with 1 Play match.
5. RR-PERF-259: `test:perf` alone.
6. RR-PERF-ORACLE: report only.
7. DOC-259.
8. G259-AUTH.
9. SOURCE-SCOPE-end.

## Known gaps
- The perf run had light overlap (see run isolation above).
- The `detail.contextRunning` name is outside scope (reviewer info).
- I did not run the oracle.
