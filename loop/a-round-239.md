# A round 239: SABA-B-11b stage 1 — adaptive grid, `5`, `1`/`2` density

**STOP:** none. **No test above 50 % of its timeout** (slowest single test in the covering run: UC5 `track-group-collapse-ui` 2.54 s; slowest new: GAU6 0.54 s; all granted files declare 15 s per describe).

Code-reviewer: 2 Medium + 4 Low findings. A fixed both Mediums and 2 Lows inside grants 1, 2, 5, 6 and 13 (§5). Diff from B's pre-check: `changeTempo` tempo-clear branch, the adaptive density step in `stepGridDivision`, one guard in `adaptiveGridDivisionId`, and new rows GAU11–GAU13 plus one GA6 line.

## 1. Start state
- HEAD `15a0b412b48740f9211bed344050fa5398130d08`, `git status --short --untracked-files=all` empty.
- `sha256sum -c --quiet` rc 0 on `b-round-238-r239-tree-sha256.txt` (1,091), on the root list and on the grant-start list. Re-run after all work (and after the scratch mutants): tree rc 0, root rc 0.

## 2. Changed files (13 granted, nothing else)
`git status`: 10 `M`, 3 `??`.

| # | Path | Change |
|---|---|---|
| 1 | `app/lib/arrangement/grid-divisions.ts` | B's pre-check hunk, plus one early-return guard (musical id with a null BPM returns the input; reviewer #4): `GridMode`, `GRID_ADAPTIVE_MIN_SPACING_PX`, `GRID_ADAPTIVE_DENSITY_MIN/MAX`, `gridDivisionSecondsOf`, `adaptiveGridDivisionId`, private `adaptiveBaseIndex`. 0 removed lines. |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | B's pre-check hunk, plus 2 reviewer fixes inside the granted grid block: (a) `changeTempo` tempo-clear branch → `resolveAdaptiveGrid(String(seconds), null)` and the status uses the resolved step; (b) the adaptive `stepGridDivision` steps the density until the visible pick changes or ±2 is left. |
| 3 | `app/lib/arrangement/strings.ts` | 6 properties. 0 removed lines. |
| 4 | `app/lib/arrangement/shortcuts.ts` | `grid-mode` row after `triplet`. |
| 5 | `app/lib/arrangement/__tests__/grid-adaptive.test.ts` | **New**, GA1–GA8 (GA6 also pins a musical id with a null BPM). |
| 6 | `app/lib/arrangement/__tests__/grid-adaptive-ui.test.tsx` | **New**, GAU1–GAU10 + GAU11–GAU13 (reviewer gaps), `{ timeout: 15_000 }` on the describe, fakes from `createWorkspaceTestEnvironment`. |
| 7–12 | the 6 granted existing tests | B's pre-check hunks as is. `-expect(` / `+expect(` per file: snap-keys 3/3, snap-ui 3/3, triplet-ui 3/3, musical-ui 1/1, shortcuts 0/0, strings 0/0 (additions only). No removed assertion. |
| 13 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | **New**, Georgian; l.4 `**სტატუსი:** In Progress (stage 1 of 2; C round 239 PASS)`; the 7 TEMPLATE headings in order. |

Applied `b-round-238/precheck-scratch.diff` first, unchanged (`git apply --check` rc 0, then apply). Full diff of tracked files: `a-round-239/granted-hunks.diff`. No class, colour or layout change (DESIGN_TOKENS/TAILWIND_FIRST: nothing to apply).

## 3. Checks run (actual results)
| Check | Result | Evidence |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-239/typecheck.log` |
| `npx biome check` on the 12 code/test files | rc 0, "Checked 12 files" | `a-round-239/biome.log` (first run flagged format in my new UI file; fixed by shortening the describe title + `biome format --write` on my 2 new files only) |
| `npm run lint` | rc 0 (205 pre-existing warnings, repo-wide) | `a-round-239/lint.log` |
| covering set (39 files of `b-round-238/covering-files.txt`) + 2 new files, final tree | **41 files, 676/676 passed** (655 + 21 new); slowest UC5 2.39 s | `a-round-239/covering-final.log`, `covering-final.json` (pre-fix run: `covering.log`, 673/673) |
| Full suite / `verify` / build | not run (speed rule; gate) | — |

## 4. Mutants, re-run on the final code (scratch `/tmp/a239-scratch`, rsync copy outside `store/`, node_modules symlinked; ran the 2 new files)
| Mutant | Red rows | Expected |
|---|---|---|
| MU-FIXED-DEFAULT (`useState<GridMode>('fixed')`) | GAU1–4, GAU6–13 | GAU1, GAU2 ✔ |
| MU-DENSITY-IGNORED (`base - 0 * density`) | GA5, GAU4, GAU12, GAU13 | GA5, GAU4 ✔ |
| MU-ZOOM-STATUS (`useEffect` on `gridDivisionId` writing `gridDivisionStatusMessage`) | GAU2, GAU3, GAU6, GAU11, GAU13 | GAU2 ✔ |
| MU-SELECT-5 (Digit5 returns early in the select handler) | GAU7 | GAU7 ✔ |
| PRE-FIX (B's pre-check code, before the reviewer fixes) with the final tests | GA6, GAU11, GAU12 | red-proof of the fixes ✔ |

Logs: `a-round-239/mutants/*-postfix.log`, `PRE-FIX-REVIEW.log`; the first-pass runs on B's code are `MU-*.log` (same named rows red).

Scratch location `/tmp/a239-scratch` (outside `store/`, does not survive the job). Exact recipes C can reproduce (run in the scratch's root):
- MU-FIXED-DEFAULT: `sed -i "s/useState<GridMode>('adaptive')/useState<GridMode>('fixed')/" app/components/arrangement/StudioWorkspace.tsx`
- MU-ZOOM-STATUS: `L=$(grep -n "gridSecondsRef.current = gridSeconds;" app/components/arrangement/StudioWorkspace.tsx | cut -d: -f1); sed -i "${L}a\\  useEffect(() => { workspaceRef.current.setStatus(gridDivisionStatusMessage(gridDivisionId, tempoBpm, false)); }, [gridDivisionId]);" app/components/arrangement/StudioWorkspace.tsx`
- MU-DENSITY-IGNORED: `sed -i "s/base - density));/base - 0 * density));/" app/lib/arrangement/grid-divisions.ts`
- MU-SELECT-5: `sed -i "s/event.code !== 'Digit5') ||/event.code !== 'Digit5') || event.code === 'Digit5' ||/" app/components/arrangement/StudioWorkspace.tsx`

Scratch files restored and `cmp`-equal to the repo; repo status and hashes unchanged after (see §1).

## 4b. Browser (Playwright, installed Chromium, against the running `:5173`; fresh context per viewport)
No persisted storage state was needed, so `a-browse.json` was not written. The server was not started or stopped.
Scripts copied, not edited in place: `a-round-239/probe-a.cjs` (extends `b-round-238/probe.cjs`: lane painted period, live-region MutationObserver, key cases), `probe-musical-a.cjs` (adds the period), `probe-select.cjs`.

- **Seconds family** (`probe-a.json`), both viewports, 0 page errors: mount `adaptive 1` (period 40 px); `=` ×1–3 `0.5`; ×4–6 `0.25` (24.41 px at 97.66 px/s); `5` → `fixed 0.25`, status `Fixed grid — 0.25 s at every zoom (5)`; `−` ×3 stays 0.25 (19.5 px at the 3rd step, fixed mode, expected); `5` → `adaptive 0.5`, `Adaptive grid — follows zoom, now 0.5 s (5)`; then `−` ×10: 0.5 → 1 → 2 → 5, every period ≥ 24 px. **Zoom is silent:** live-region child mutations stayed 0 across the 6 zoom-ins and constant across every other zoom step; they changed only on key presses (+2 per status replacement).
- **Keys:** Ctrl+5 on body: default not prevented, mode unchanged. Held 5 (1 press + 3 repeats): one toggle. Library search: gets the `5`, mode unchanged. Focused select at the load zoom (`probe-select.json`): `5` → fixed, value stays `1`, focus stays on the select; `5` again → adaptive.
- **Musical** (`probe-musical-a.json`), Enter on `demo-synth-mix`: seed `adaptive 1/2`, Snap on, `data-bpm` 120, status ends exactly `Snap on — grid 1/2 (G)`; `=` ×1–3 `1/4`, ×4–5 `1/8`; `3` → `adaptive 1/4T` (40.7 px); `5` → `fixed 1/4T`; `5` → `adaptive 1/4T`.
- **Screenshots:** `a-round-239/shots/{mount,zoom4-adaptive,fixed}-{1440,1280}.png`.
- After the reviewer fixes, `probe-a` and `probe-musical-a` were re-run at both viewports: same sequences, 0 page errors (pre-fix JSON kept as `probe-a-prefix.json`).
- Attempt 1 of `probe-a` timed out waiting for `Demo collection ready` (cold Vite after the edit; `probe-a-attempt1.err`); a debug load (`dbg.cjs`) then showed the ready text, and attempt 2 ran clean. Kept as environment-invalid evidence.

## 5. Code-reviewer (real `code-reviewer` subagent, given the actual diff and files; score 7/10)
| # | Sev | Finding | Action |
|---|---|---|---|
| 1 | Medium | Tempo cleared while adaptive: refs/status took the fixed seconds (e.g. "1 s") while the screen showed the adaptive pick (0.1 s at 320 px/s) | **Fixed** (grant 2); GAU11 red on B's code, green now |
| 2 | Medium | Stored density could pass the clamped family end: `1 1`, zoom to 320, `2` changed nothing visible | **Fixed** (grant 2, loop is bounded by −2…2); GAU12 red on B's code, green now |
| 3 | Low | GAU9 dx 60 could not tell 0.25 from 0.5 s | **Fixed**: dx 70 → 7.75 |
| 4 | Low | Musical id with a null BPM returned `bar` | **Fixed** (grant 1 guard); GA6 line red on B's code |
| 5 | Low | GK11 input `5`→`6` is an input change, not only an expected value | Already granted (grant 7, l.444); no assertion removed |
| 6 | Info | Seed after `5` overrides a frozen fixed pick with 1/4 (GAU6 pins this, per task); `3` in adaptive may re-resolve 1/8 → 1/4T; zoom during a drag changes the snap step | For B; not changed |

Coverage gaps the reviewer named (tempo clear, density after zoom, adaptive family end, density reset on 5) are now GAU11, GAU12 (includes the family-end text), GAU13.

A follow-up reviewer pass on the two fixes: see §5b.

**Architecture note (verbatim gist, for B; not acted on):** the grid region of `StudioWorkspace.tsx` (l.549–573, 1390–1595) has grown over rounds 4b-2a, 5a, 5b and now 11b; keep for this round (the chooser is pure in `lib/`, no audio/gesture/Undo invariant touched). Proposal: one scoped task to extract a `useGridDivision` hook owning seconds/musical/tempo/mode/density state and refs with the same surface; acceptance = every `grid-*.test.tsx` unchanged and green. The alternative (resolved id in state, updated by an effect on zoom) was judged worse: double render per zoom and a harder "zoom writes no status" guarantee.

## 5b. Follow-up review (second real `code-reviewer` pass on the fixes; 9/10)
No new bug. The loop is bounded (≤ 5 iterations); each key moves at most one visible step; fixed mode and the fixed-mode tempo clear (`grid-triplet-ui` l.586–589) are unchanged; refs stay in sync. Lows, recorded for B and not changed:
- after a skipped step the stored density is overwritten (GAU12: −2 → 1), so zooming back shows `2` s rather than the earlier `0.25` s. This follows the "density is relative to the zoom base" model;
- the density carries over to the seconds family when the tempo is cleared;
- the mirror case is untested: density +2 held at `10` at 0.5 px/s, then zoom in, then `1`.
Architecture note: none.

## 6. Known gaps / notes for B
- **Deviation from §2.2, needs a B ruling (non-blocking):** §2.2 says "adaptive: the density moves one level". After the reviewer fix the *visible* pick still moves exactly one step per key, but the *stored* density may skip levels when the clamp at a family end hides them (GAU12: −2 → 1). If the user then zooms back, the grid shows `2 s`, not the earlier `0.25 s`. The alternative, which recomputes the density from the visible index on every press, was rejected for now because it clamps the user's chosen density on every press. Without either fix, a key press visibly does nothing (reviewer Medium #2).
- Rows GAU11–GAU13 are in my new file (grant 6), not in any granted existing file; no granted existing file gains a row.
- **Final-tree evidence:** typecheck and the covering run (41 files, 676/676) were re-run on the exact final tree after the last edit; `a-round-239/changed-end-sha256.txt` holds the hashes of the 13 granted paths.
- **C-KEYS-239 wording trap:** "the select value is not `5`" is only meaningful where the adaptive pick is not 5 s. In my long probe, after zooming out to 8.39 px/s, `5` on the select legitimately resolved to `5` s (density reset, pick = 5 s). C should run that row at the load zoom (as `probe-select.cjs` does) or compare against the expected pick.
- **Deviation from B's pre-check code:** the two reviewer Medium fixes in §5 (inside grant 2's named handlers) and the grant-1 guard. C's C-SCOPE row should expect them; `git diff` of grant 1 still has 0 removed lines.
- C-DENSITY probe hint: after `1 1` and a zoom-in, one `2` must now visibly widen (GAU12).
- Not done this round (stage 2): `4` key, the grid menu's Adaptive/Fixed and density items, no snap on an invisible grid.
- Not probed by A: marker name editor `5`, BPM field `5` in the browser (jsdom GAU8 covers the BPM field), Export-open `5` in the browser, C-SNAP drag/ruler/nudge in the browser, L39 line count, LAB-SMOKE export hash, auth rows. These are C rows.

## 7. Exact next C checks
C-SCOPE-239, C-UNIT-239, C-MUT-239, C-ADAPT-SEC-239, C-ADAPT-MUS-239, C-SILENT-239, C-MODE-239, C-DENSITY-239, C-MUS-239, C-KEYS-239 (see the note above), C-SNAP-239, C-BUDGET-239, C-SHOTS-239, C-REF-239, AN-REVIEW-239, LAB-SMOKE-239, Auth; purchased origin BLOCKED (backend unavailable in cloud); gate rows to the gate.

## 8. Acceptance status (A's own; C decides)
Passed by A's own runs: typecheck, Biome on the owned files, lint, covering set + GA1–GA8 + GAU1–GAU10, the 4 mutants, the §0.3 browser sequences at both viewports. Not claimed: every C row, the gate rows, and the whole SABA-B-11b item (stage 2 remains).
