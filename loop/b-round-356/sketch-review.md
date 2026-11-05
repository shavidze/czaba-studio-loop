# Sketch review: PERF-10a (B round 356 → 357)

**Dispatched sketch:**
- `sketch/source.patch.txt` sha256 `4f97750830fbdcc0ce509deb39aff60577c519cbdfe237ab07f2a985713ebd07`
- `sketch/tests.patch.txt` sha256 `ca0277658b7ec9d91fd37903cb8ba1b30a13c660afd6c8b8a51eb9916fbbf75c`

The hashes are also in `sketch/patches.sha256`. Both patches pass `git apply --check` on store HEAD `d49536b`.

**Reviewer:** `tech-lead`, acting as code reviewer. `code-reviewer` is not on B's consult list (ROOT-REQ-B-CONSULT-CODE-REVIEWER). The review covered the first sketch, before the fixes below. Its findings are numbered as tech-lead gave them.

| # | Sev | Finding | Ruling |
|---|---|---|---|
| 1 | Medium | When playback stops outside a React event (the video play-failure `.catch`), the `useSyncExternalStore` write commits at SyncLane, apart from the status reducer. The Follow leaf could then read the committed status before the failure message lands, and overwrite it with `describeSpaceStart()`. | **Fixed defensively in the sketch, final form.**<ul><li>The stop branch first checks the shown status exactly as HEAD does (preview, else committed). If HEAD would not write, it returns, so no dispatch and no extra commit.</li><li>If HEAD would write and a preview is shown, the string write stays.</li><li>Otherwise it writes through `setStatus((text) => …)`. That form re-checks the queued text, so a failure message queued behind the stop survives.</li></ul>**First form rejected:** it always dispatched the functional form, and that raised `interact.play.stop-commits` from 1 to 2 (`perf-sketch-final-v1-results/`, `perf-rowcmp-final-v1-vs-c356.txt`).<br>**Honest limit:**<ul><li>jsdom merges the two commits, so the queued-text branch cannot be reached there. FW-PB1 is green on the pre-fix sketch (`fw-pb1-prefix.log`), and a mutant that changes only that branch stayed green (equivalent).</li><li>FW-PB1 guards the contract "a stop's own message survives a Follow pause". Its mutant M-B4 (no HEAD pre-check, and always `describeSpaceStart()`) turns red FW-PB1, FW6, FW10, LT15, LT21, DP16 and the render rows (`mutants/mutant-m-b4.log`).</li><li>The split-commit path itself goes to C's browser row VIDEO-FAIL-STOP.</li></ul> |
| 2 | Medium | The render-budget "does not re-render clips…" test loses its proof that the memo barriers hold, because the parents no longer render on Play. | **Fixed.** After the Play/Stop/Play block, `setStatus('Positive control')` makes Ruler, Library and Lane render (`> 0`) while `WATCHED_LISTS` stays 0. |
| 3 | Medium | R9-L2's `toBe(valueAtPlay)` now checks the probe object, not the context value. | **Fixed.** `mountWorkspace` also mounts `RawContextProbe`. R9-L2 keeps its probe asserts and adds two `raw.current` `toBe` asserts and one `not.toBe` assert, so no assertion was lost. |
| 4 | Low | The leaf's effect runs before the parent's on mount. | **Info.** It cannot happen today: the workspace never mounts while playing, because `StopPlaybackOnNarrow` stops playback before the wide remount. Noted in the task (§3). |
| 5 | Low | The null leaf sits inside the `<output>` live region. | **Fixed.** It is now a sibling after `</output>` and renders no DOM, so the footer child counts are unchanged. |
| 6 | Low | Inline props type, and `{ current: boolean }`. | **Fixed.** Added `interface ArrangementPlaybackFollowSyncProps` with `MutableRefObject<boolean>`. |
| 7 | Low | MarkerRow's `getState()` is fresher than the old closure. | **Info.** The deviation is accepted and is the intended behaviour. |
| 8 | Low | `useArrangementPlaybackStore()` exposes `setPlaying` to any consumer. | **Routed** as B-R356-PLAYBACK-SETTER to `deferred_low_polish`. Fix home: PERF-10b, with a reader type that has no setter, as `useArrangementPositionWriter` does. |

**Architecture note (tech-lead):** keep the playback store as its own file, because it follows the split-store pattern. This joins question 1/1b of the repeated checkpoint request.

**Runs on the fixed sketch:**
- `tsc` 0 and Biome 0.
- Covering files 48/48 (962 tests, `sketch-cover-postfix.log`).
- Mutants M-B1–M-B4 are red as listed in `mutants/`.
- The final perf run is in `perf-summary.txt`, and the final full suite is in `precheck-full-final.log`.
