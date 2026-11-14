# A round 508 — DPG-BUTTON-CLEANUP-2-NONBRAND stage N1, re-dispatch (v3 delta)

**Result: delta applied. Every §3 number matches B's value. No STOP.** One code-reviewer finding rated Medium (volume icon identity not pinned) is a re-raise of pre-ruled #13 / R6. It is listed under "For B" with mutant evidence. B should confirm that #13 also covers its threshold-drift half (X1 below).

## Changed files (all within the four round-507 grants; written only by B's delta, no A prose)
- `app/lib/__tests__/store-button-cleanup-n1.test.tsx` (untracked): delta v3 applied. Changes: N1-2 rewritten as a per-control loop; N1-4 gains the height check; N1-6 and N1-7 are new.
- `docs/implementation/2026/quarter-IV/328-dpg-nonbrand-stage-n1-audio-player.md` (untracked): delta applied. l.4 = `**სტატუსი:** In Progress (stage N1 of DPG-BUTTON-CLEANUP-2-NONBRAND; C round 508 PASS)` (L28 contract; it is a claim until C passes).
- `app/components/audio/AudioPlayer.tsx`, `docs/design/DESIGN_SYSTEM.md`: no change this round (v2 bytes; check 4 confirms).
- `git status --short`: 2 M + 2 untracked, exactly the four granted paths.

## Steps and evidence (logs in `a-round-508/`)
| Step | Result | B's value | Log |
|---|---|---|---|
| Frozen checks 1, 2, 3 (before) | rc 0 / 0 / 0 | rc 0 | (console; re-run after, below) |
| Delta sha256 | `405384eb…613f` = `sketch-sha.txt` | match | — |
| `git apply --check` + `git apply` | rc 0 / rc 0 | clean | `apply.log` |
| Checks 4, 1, 2 (after) | rc 0 / 0 / 0 | rc 0 | `apply.log` |
| `npm run typecheck` | rc 0 | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, "Found 175 warnings." | same | `lint.log` |
| Scoped Biome (2 files) | rc 0, "Checked 2 files", "No fixes applied.", "Found 1 warning." (#7) | same | `biome.log` |
| Covering vitest (8 files) | rc 0, 8 files, 88/88, N1-1…N1-7 all present; slowest LT7 356 ms (< 2,500 ms, #14) | 88/88, LT7 753 ms | `covering.log`, `covering.clean.log` |
| Mutant matrix (`mutants-508.py`, copy at `/home/runner/a508-mutant-copy`, node_modules symlinked) | M0–M14 all OK; per-mutant red sets identical to `b-round-507/mutants-508.txt` (diff empty). **M7 Prev↔Next swap and M8 Close↔Next swap turn N1-2 red.** Copy restored rc 0 | same | `mutants.txt`, `mutant-logs/` |
| Extra evidence mutants (for B, see below) | X1 and X2 both stay green | — | `extra-mutants.txt`, `extra-mutants.py`, `mutant-logs/X*.log` |
| `store/` after the mutant runs: checks 4, 1, 2 | rc 0 / 0 / 0 | rc 0 | `post-mutant-checks.log`, `final-checks.log` |
| Code-reviewer (real subagent) on `git diff 3021b30` + the 2 untracked files | 8.5/10, 0 Critical/High, 1 Medium (re-raise of #13), 5 Low | — | `review-diff.patch` (input) |

A did not run the full suite or the build (speed rules; B's `precheck-full.log` / `precheck-build-sketch.log`; gate rows).

## Code-reviewer findings and their mapping
1. **"Medium": volume icon identity not pinned; N1-6 checks only 20×20.** This re-raises **pre-ruled #13 / sketch-review R6** ("Icon path swap survives"). A's evidence on the mutant copy:
   - **X1:** the icon branch changes from `volume === 0` to `volume < 0.05` and the label is unchanged. Green, all rows.
   - **X2:** the muted and speaker icon paths are swapped. Green, all rows.

   X2 is exactly R6. X1 (the icon threshold drifts from the label threshold, so at 0.01 the muted icon shows on a "Mute" button) is the same "which icon is drawn" class. B, please confirm that #13 covers X1 too. If it does not, it is a new Medium in round-owned test code that the sketch would need to cover; it is not fixable by A under "the sketch writes every granted byte". Reviewer's suggested fix: assert that the muted cross path (`M17 14l2-2…`) is present at volume 0 and absent at 0.01.
2. **Low, new (not pre-ruled):** the Mute click is tested only at volume 0.7. A handler `setVolume(volume < 0.5 ? 0.7 : 0)` would pass N1-2 while unmuting at 0.01 under the "Mute" label. Suggested fix: in N1-6, click at 0.01 and expect `setVolume(0)`. Not run as a mutant.
3. **Low, new:** the `useAudio` mock factory is not typed against the hook's return type, so it can drift silently.
4. **Low, re-raise of #3:** N1-5 counts `<button` in the source text.
5. **Low, re-raise of R7 (accepted):** the test order does not match the numbering (N1-7 before N1-4, N1-6 before N1-5).
6. **Low, re-raise of #1:** doc 328 l.4 says "C round 508 PASS" before C runs (L28 contract).

The reviewer confirmed that every doc 328 test claim (N1-1…N1-7, `mutants-508.txt`, the `active:scale-95` note) exists. It also confirmed there is no `any`, `ts-ignore` or type assertion, and no flakiness concern.

## Architecture note (from code-reviewer, for B; a proposal, not acted on)
**Keep.** `AudioPlayer.tsx` only swaps markup for the existing `IconButton` primitive, with no state or ownership change. Possible later task: extract the three volume SVG branches into a small `VolumeIcon`, so the icon threshold and identity become testable on their own. This also relates to the deferred Low B-R508-VOLUME-ICON-LOW-SAME.

## B acceptance (§3, A rows only)
- [x] Delta applied cleanly with the sha matched; checks 1–4 rc 0 before and after.
- [x] Grants: only the four paths, as v2 plus the delta.
- [x] typecheck, lint (175 warnings), scoped Biome (1 warning), covering 8/88 with N1-1…N1-7 and no test > 2,500 ms.
- [x] Swap proof: M7/M8 red on N1-2; the whole matrix M0–M14 matches `mutants-508.txt`; `store/` restored (checks 4 and 1 rc 0).
- [x] Code-reviewer actually run; findings mapped above.
- [ ] All C rows (C0–C12, browser): **not verified by A**. N1 stays unverified until C runs them.

## Known gaps
- The volume icon identity and the icon threshold (X1/X2) are not pinned by any jsdom row (#13 / R6; B to confirm X1).
- Mute at a non-zero low volume (0.01) is not click-tested (new Low).
- No browser check by A (C's job: C1–C6, C11).

## Next for C (task §4)
1. C0 source scope.
2. Warm-up `ap-507.cjs`, then C1–C6 with the round-507 harnesses (`AudioPlayer.tsx` is byte-identical to v2).
3. C7 grep scans.
4. C8 covering (expect 8/88, N1-1…N1-7).
5. C9 mutant matrix on a copy outside `store/` (expect M0–M14 OK; A's run matched B's exactly).
6. C10 docs: l.4 byte-equal; 7 headings.
7. C11 protection plus the `/studio-lab` smoke.
8. C12 claims-508.sh, C0 again, and L57.

Optionally re-run `a-round-508/extra-mutants.py` (same usage: `<copy> <abs logdir>`) to confirm X1/X2 survive.

## Scope completed
Only round 508's A task (§3). The backlog is not marked complete. Nothing was committed, pushed or installed. No protected file was touched (check 2 rc 0).
