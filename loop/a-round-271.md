# A round 271 — SABA-B-11c stage 2: relative snap of clip drags

No STOP. Baseline HEAD `4b912a9`, clean tree at start (K1, K2, K3 re-checked: lines 272/285/296/298 and 15/140/150/176 matched).

## Changed files (9, all within the §4 grants)
- `app/lib/arrangement/grid.ts`: adds `GRID_OFFSET_TOLERANCE` (0.0005), `isOnGrid`, `relativeGridStart`, the exported `snapRelativeMoveStartToGridOrEdges`, and `relativeGroupDelta` (not exported, as in B's sketch; nothing outside grid.ts needs it). Changes only the `gridStart` / `target` / `gridFallback` lines of the `snapGroupMoveDelta` body. `snapMoveStartToGridOrEdges`, `snapGroupDelta`, `snapTimeToGrid` and `adjacentGridLine` are byte-identical: `git diff -U0` shows one pure addition hunk plus the body hunk.
- `app/components/arrangement/ArrangementClip.tsx`: the import and the one call in `moveStartOnGrid`.
- `app/lib/arrangement/strings.ts`: `snapOnTitle` → `Snap on — clips follow the grid (G)`.
- Tests:
  - `grid-edges.test.ts`: RU1–RU8, RG1, and **RG2 (new, beyond the sketch; see below)**;
  - `grid-snap-ui.test.tsx`: the §5.1 rewrites and RS1–RS5;
  - `grid-snap-clip-edges.test.tsx`: CM11;
  - `strings.test.ts`: the literal.
- Docs:
  - new doc 202, with l.4 exactly `**სტატუსი:** Completed (C round 271 PASS)`, the 7 TEMPLATE headings in order (re-checked after the Mermaid label was quoted), and the D-29z587 saved-project change. Every cited test id was grep-checked and exists once;
  - doc 198, l.4 only.

## Differences from B's sketch (please check, B and C)
1. **Blocked off-grid group fallback (§3.2 choice).** I derive it from `relativeGridStart` (stored line + offset), so it does not drift, instead of `whole·step`.
2. **The code-reviewer's Medium finding, fixed.** On a musical step the stored-line distance can exceed `n·step` by up to 1 ms, so the fallback could pass `maxDelta` by less than 1 ms. The fallback is now checked against the bounds. If it fails, it steps one whole step toward 0, and finally returns 0, mirroring the old `snapGroupDelta`, which returns 0 when its candidate fails.
   - New row RG2 pins it: (0.2, step 60/90, max 0.6667) → allowed 0; max 0.667 → 0.667.
   - New mutant M-NO-BOUND-CHECK is red on RG2.
   - RG2 is an extra row inside the granted new describe, in a granted file.
   - This is a latent bug in the sketch too, not one my change introduced. With B's `roundGridTime(whole·step)` fallback, step 60/90 and whole 1, the result is 0.667, which is above max 0.6667 + 1e-6 (checked with `node -e`). RG2 therefore guards a real bound overshoot.
3. RU6, RU7 and RU8 are reordered numerically. The RU2 loop variable `tenth` is renamed `twentieth` (reviewer Low).

## Checks actually run (speed rules)
| Check | Result |
|---|---|
| `npx vitest run` on the 7 §5.3 files | **197/197 pass** (B's 196 plus RG2) |
| Slowest covering test | GU1, `grid-musical-ui`, 926 ms; declared describe timeout 15 000 ms (6 %), below the 2500 ms STOP |
| `npm run typecheck` | rc 0 |
| `npm run lint` | rc 0 (205 warnings and 1 info repo-wide; the scoped Biome run is clean) |
| `npx biome check` on the 7 code and test files | clean, no fixes |
| Mutants (`a-round-271/mutants.py`, B's script plus M-NO-BOUND-CHECK, on a `git archive` scratch with the diff applied) | every one red as listed in §7. Also RG2 is red on M-ABSOLUTE-GROUP and M-GROUP-CLAMP-ZERO, and M-NO-BOUND-CHECK is red on RG2. Output: `a-round-271-mutants.txt` |

Not run, because they are gate rows: the full vitest suite, build, full Biome, verify and e2e smoke.

## Browser (A evidence only; not C rows)
I copied B's probes to `a-round-271/` so they would not overwrite B's shots, and ran them against :5173 after the change.

| Viewport | Results | Page errors |
|---|---|---|
| 1440×900 | Alt +12 px → 10.300; jitter ±5 px → 10.300 with the exact "nothing changed" status; +48 px → 11.300, then 12.300; cross-lane to Stems → 13.300 with status `Move to track — Stems: start 00:13.300.`; left trim +30 px → 14.000; ArrowRight → 11.000, Undo → 10.300; group drag → 11.300 / 16.000 with status `Move (2): 2 clips moved 00:01.000 to the right.` | 0 |
| 1280×720 | identical | 0 |

- This matches the sketch column of §1 and K13.
- The first attempt of the relative probe timed out waiting for "Demo collection ready" (Vite cold start); the retry passed.
- Files: `a-round-271/probe-*-a271.json`, `a-round-271/shots/`.

## code-reviewer (a real subagent run): 8/10, no Critical
| Severity | Finding | Action |
|---|---|---|
| Medium | the fallback could overshoot the bound | **fixed**, with RG2 |
| Low | the strict `<` at exactly 0.5 ms depends on float error; RU6 tests 0.4 and 0.6 ms only | not changed (B's contract says "within 0.5 ms") |
| Low | `+ GRID_TIME_TOLERANCE` inside `floor` in `relativeGridStart` is redundant after `isOnGrid` | kept (B's sketch; harmless) |
| Low | Alt with Snap off on a visible grid now also takes the relative path (HS2 7.525). HS2's title is not in §5.1 | title left unchanged; doc 202 now states it precisely |
| Low | naming (`tenth`) | fixed |

**Architecture note:** none.

## Acceptance I actually passed
- §5.3 runs (all of them).
- §7 mutants (red-proofed by A).
- HUNK-SCOPE: checked by `git diff -U0`.
- SOURCE-SCOPE: 9 paths, all granted.
- TEST-REWRITES: sketch rewrites replace each `expect`; none is removed.

C rows (RS-B-*, SNAP-TITLE, SCREEN-BUDGET, G271-AUTH, DOC rows, CLAIMS) are **not** claimed.

## Known gaps
- The ≤ 1 ms musical-step blocked-group case is now bounds-safe. No UI-level row covers it; only RG2, at the unit level.
- Nudge, loop brace and realign stay absolute by design (SABA-Q-11C-NUDGE / REALIGN, awaiting Saba).

## Next C checks
1. The §8 rows at both viewports. The recipe is in `b-round-270/probe-relative-snap.mjs` and `probe-group-nudge.mjs`.
2. TEST-REWRITES, including that RG2 is an addition.
3. MUTANTS on C's own scratch, including M-NO-BOUND-CHECK → RG2.
4. HUNK-SCOPE. Note: the `relativeGroupDelta` fallback differs from the sketch, as described above.
5. The DOC-202 / DOC-198 byte checks.
