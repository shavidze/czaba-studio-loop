# A round 326: GATE325-IM24-WALLCLOCK fix-up

**Scope completed:** §1.1 and §1.2 exactly. No STOP condition was hit.

## Changed files (store/)
- `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx`: one inserted line, the first statement after `const mounted = await mountMarkerWorkspace();` in IM24:
  `vi.spyOn(Date, 'now').mockReturnValue(Date.now());`
  `git diff --stat`: `1 file changed, 1 insertion(+)`. No other line changed.
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`: one Problem → Solution bullet (Georgian, technical terms in English), appended at the end of `## პრობლემები და გადაწყვეტები`. l.4 is unchanged (K13 equal). The 7 headings and their order are unchanged.

## Pre-flight
- Assumptions: the mechanism is the wall-clock fake `currentTime` plus the 50 ms lookahead hold. The freeze is scoped to IM24 and restored by `afterEach` `vi.restoreAllMocks()`.
- Smallest change: 1 line plus 1 bullet. No helper.

## Rows (all actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | Equal to `claims-326-planning-output.txt` before editing (diff empty) | run in the session |
| A-IMPL | done | diff above |
| A-CLAIMS-AFTER | The only differences: K2 `b925434 17`, K3 `1`, K11 first value `f82813bbdc5e` (expected per the ruling), K17 `1 2` (≥1). K12 `a098fabed5c4 cfe1faaafc67` unchanged. K13 unchanged | `a-round-326/claims-after.txt` |
| K11 ruling | `git diff --name-only HEAD -- app perf \| sort` equals `app-perf-changed-files.txt` plus the IM file | NAMELIST-OK |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-326/typecheck.log` |
| A-LINT | `npm run lint` rc 0. Biome reports 205 warnings and 1 info repo-wide; they were already there and none is in the edited file. Scoped `npx biome check <IM file>` rc 0, no findings | `a-round-326/lint.log`, `biome-scoped.log` |
| A-UNIT | 3 runs, 29/29 each. IM24 took 93 / 98 / 92 ms against the default 5000 ms vitest timeout (no per-test override) | `a-round-326/unit-run-{1,2,3}.log` |
| A-MUTANT | Scratch copy at `/tmp/a326-scratch` (store tree without .git/node_modules; node_modules symlinked; removed afterwards). MU-DELAY-60 on the pre-fix file: IM24 **red** `16.018`. On the fixed file: IM24 **green** | `a-round-326/mutant-prefix-mu-delay-60.log`, `mutant-fixed-mu-delay-60.log` |
| A-MUTANT location | `mu-delay-60.patch.txt` is a normal-format diff (`678a679,682`) with no context, so `patch` inserts at a fixed line number. On the fixed file, the extra line at 627 shifts the insertion point one line up. I checked it: on the fixed file the busy-wait lands at l.679–682, inside the `for (step…)` loop, as `if (step === 4) {…}` before `key(ctrlRight)` and the 5th `getLivePosition()` read, after the 4th seek. That is the intended place, so the green result is meaningful | sed of the patched copy |
| A-EXPECT | `expect(` count 204 before (pre-fix copy) and 204 after | the session |
| A-REVIEW | Not requested (2 files) | none |

Status entries: 17 (16 from round 325 plus the IM file). No protected file was touched (K8 11).

## Not run (by the speed rules / gate)
- Full vitest, build, `npm run verify`, e2e smoke: these are gate rows.
- No browser check: this is a test-only change. B-IM24 and G326-AUTH are C's rows.

## Known gaps
- The other wall-clock rows (VDS3, EN10, BW5) are unchanged by design. They belong to SYS-CLOCK-DETERMINISM.
- The IM24 under-CPU-load check was not run by A. It is C's UNIT row.

## Next C checks
1. `bash b-round-325/claims-326.sh`; compare against `a-round-326/claims-after.txt` and apply the K11 ruling. K12 must equal planning.
2. SOURCE-SCOPE: 17 entries; the IM diff is exactly 1 insertion; doc 232 differs only by the bullet.
3. UNIT: the file ×3 alone, then ×3 under 2× `node -e "for(;;){}"` load.
4. MUTANT: MU-DELAY-60 pre-fix (red) / fixed (green), plus C's own mutant (for example remove the spy line plus the delay, or a Ctrl+Right handler that does not seek).
5. EXPECT 204; DOCS headings and l.4.
6. B-IM24 and G326-AUTH in the browser at 1440×900 and 1280×720. CARRY-325 through K12.

B acceptance rows passed by A: A-CLAIMS, A-IMPL, A-CLAIMS-AFTER (with the K11 ruling), A-TYPE, A-LINT, A-UNIT, A-MUTANT, A-EXPECT. A-REVIEW is not applicable.
