# A round 78 — SRW-16 stage 2b-3 (markers as snap targets for seek / range / loop)

Status: IMPLEMENTED — awaiting C (no commit/push; root publishes)

## Baseline at phase start (A, 2026-10-22)
- HEAD 60006d4305c4ef316f5459e6fa29a48e7931b36c, `git status --short` 0 lines.
- Frozen list 455/455 OK; snapshots 6/6 match (0398debc, 07cbc584, 4b82508a, e57566a7, dbc6895e, f0e786c6); protected 4/4 OK.
- `pgrep -c node` = 1; `:5173/studio-lab` 200 (not started/stopped by A).
- Pristine copies of the 5 owned sources: `a-round-78/pristine/`.

## Changed files (all inside the B grants)
| File | Change | sha256 prefix / LF |
|---|---|---|
| `app/lib/arrangement/grid.ts` | + `resolveGridTimeWithTargets` right after `resolveGridTime` (11 lines, nothing else) | `0eb7b0e2` / 306 |
| `app/components/arrangement/ArrangementRuler.tsx` | optional prop `getSnapMarkerTimes?: () => readonly number[]` (default: a module-level function returning a frozen empty array); destructured in `ArrangementRulerPlayhead` and `ArrangementRuler` (forwarded by the existing `{...props}` spread); P1 (l.~334), P2 move (l.~172) and P2 pointerup (l.~195) use `resolveGridTimeWithTargets(..., getSnapMarkerTimes())`; import swapped. Double-click, navigation drag, playhead keys, rendering untouched | `b9ce9cf9` / 448 |
| `app/components/arrangement/ArrangementClip.tsx` | P5 `onGrid` → `snapTimeToGridOrEdges(time, step, markerSnapTimes(gesture.before))`; P4 → `resolveGridTimeWithTargets(..., markerSnapTimes(gesture.before))`; imports: `resolveGridTime`→`resolveGridTimeWithTargets`, unused `snapTimeToGrid` removed (necessary consequence) | `5fa05648` / 731 |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | pointer-move only: `step`, `markers = markerSnapTimes(before)`; move → `step === null ? raw : snapMoveStartToGridOrEdges(raw, original.end - original.start, step, markers, markers)` then `moveLoop(before, start, step)`; resize → `resolveGridTimeWithTargets(..., markers)`; imports updated (+ `markerSnapTimes`). Key handler untouched | `e8bbab9a` / 280 (after review fix #1: move result rounded to 1 µs) |
| `app/components/arrangement/StudioWorkspace.tsx` | P3 `resolveGridTimeWithTargets(..., markerSnapTimes(latest.getArrangement()))`; stable `getRulerSnapMarkerTimes = useCallback(() => markerSnapTimes(workspaceRef.current.getArrangement()), [])` placed right after `workspaceRef`; one JSX attribute on `<ArrangementRuler>`; imports (`resolveGridTime`→`resolveGridTimeWithTargets`, + `markerSnapTimes`). `handleKeyDown` and gesture block untouched | `56e7ef00` / 2044 |
| `docs/implementation/2026/quarter-IV/067-…md` | line 4 only, replaced by B's exact line | `eb388458` / 95 |
| `app/lib/arrangement/__tests__/marker-time-snap.test.ts` (new) | TU1a–TU1e, 5 tests | `fbd1e948` / 54 |
| `app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx` (new) | TS1, TS1b, TS2, TS2b, TS3–TS5, TS6a/b, TS7, TS7b, TS7c, TS7d, TS8, TS9a–c, 17 tests | `8e6e5801` / 651 |
| `docs/implementation/2026/quarter-IV/068-studio-lab-marker-time-snap.md` (new) | Georgian, LF, per TEMPLATE; status: awaiting C | `ddd6b35c` / 96 |
All CR=0. `git status --short`: 6 `M` + 3 `??` (exactly §3).

Fixture choice: marker B = **12.000** (B's §1 fixture said 20.000, TS9 and C's setup say 12.000; nothing in TS1–TS8 depends on it). TS7 second move uses raw end **6.425** (97 px at 40 px/s) instead of 6.42 (256.8 px, fractional clientX); expected result identical (end 6.375, start 4.375). The original TS7c (candidate below 0) was removed after review (#2): it could not tell right from wrong, because `moveLoop` clamps to 0 anyway, so a UI test can't observe the negative filter. It is proven in TU1d. The new TS7c checks the 1 µs rounding (loop 0.3–1.0, marker 1.3 → 0.600–1.300).

## Checks actually run (A)
- `npm run typecheck`: clean.
- `npm run lint`: exit 0 (218 pre-existing warnings repo-wide, 0 errors).
- `npx biome check` on the 7 owned code paths (no `--write`): clean ("No fixes applied", 0 errors). One format finding in my new UI test was fixed by hand.
- Targeted vitest (B's grep + named files, list in `a-round-78/targeted-files.txt`): **26 files, 508 tests passed** (final run after the review fixes). Output: `a-round-78/targeted-run.txt`.
- Extra: every other test file mounting `StudioWorkspace`/`ArrangementClip`/`ArrangementLane` (`a-round-78/targeted-files-workspace.txt`): **24 files, 436 tests passed** (final run).
- No full suite, no `npm run verify` (root gate).

## Mutation proofs (script `a-round-78/mutate.py`, output `a-round-78/mutations.txt`; each restored and `cmp`'d against `a-round-78/final/`, all True)
| Mutation | Red |
|---|---|
| (a) helper ignores targets | TU1a, TU1b, TS1, TS1b, TS2, TS2b, TS3, TS4, TS6a, TS6b, TS7d |
| (b) ruler scrub move without markers | TS2, TS2b |
| (c) P3 without markers | TS3 |
| (d) P5 `onGrid` without markers | TS5 |
| (e) loop move `endEdges = []` | TS7, TS7c |
| (f) markers used when step is null | TU1a, TU1e, TS1, TS2, TS3, TS7d, TS9b |
| (g) tie prefers the marker | TU1c |
| (h) loop resize without markers | TS6a, TS6b, TS7d |
| (i) extra: loop-move 1 µs rounding removed (`Math.round`→`Number`) | TS7c (the first (i) line in mutations.txt was a bad mutation that rounded to whole seconds; superseded by the last line) |

## A's own browser sanity (NOT acceptance; C owns every MT/REG row)
Playwright Chromium, 1440x900, `:5173/studio-lab` (existing server), script `a-round-78/smoke.mjs`, output `a-round-78/smoke-1440.json`, screenshot `a-round-78/smoke-1440.png`. Middle East added via "+ დამატება"; Snap off; ruler click at 6.375 → 6.375; M, Enter → marker 6.375. 40 px/s, grid 1 s. Ruler clicks (playhead first moved to 2 s each time): Snap on 6.45 → **6.375**, Snap on 6.10 → **6**, Snap on+Alt 6.45 → **6.45**, Snap off 6.45 → **6.45**, Snap off+Alt 6.45 → **6.375**. Ruler double-click → Fit (40 → 9 px/s). Console: no non-noise errors.
**Measurement trap for C:** a ruler click at the x where the playhead already sits lands on the 12 px playhead handle (z-10), starts a no-move scrub and does not seek. My first run showed "Snap off + Alt → 6.45" only because of this; after moving the playhead away the result was correct. In MT-RULER / MT-AUDIO, move the playhead away (or click elsewhere) before each measured click. Pre-existing behaviour, unchanged this round.

## Code-reviewer (real `code-reviewer` subagent, read-only, score 8.5/10; no Critical/High)
| # | Finding | Action |
|---|---|---|
| 1 Low | Loop move marker candidate `marker - length` leaves float noise in `loop.start` (e.g. 0.6000000000000001) | **Fixed** inside P6 grant: move result rounded to 1 µs (`Math.round(x*1e6)/1e6`, same grain as `snapGroupMoveDelta`). Grid results are already ms-exact, so no-marker behaviour is unchanged (TS7b/TS8 + 26-file list green). New TS7c + mutation (i) |
| 2 Low | Old TS7c could not discriminate | **Replaced** (see above) |
| 3 Low | No brace test for Snap on+Alt / Snap off | **Added** TS7d (move/resize free with Alt or Snap off; Snap off+Alt resize → marker 6.375) |
| 4 Low | Scrub pointercancel untested | **Added** TS2b |
| 5 Low | Naming: `targets` vs `edges` vs `markerTimes` for the same concept; 5 positional params (mirrors `resolveGridTime`) | Not changed (rename outside the one-export grant). **Signal for B** |
| 6 Low | `markerSnapTimes` allocates per pointermove; could be cached on the gesture | Not changed (cost is small; the gesture structs are outside P4/P5/P6 lines). **Signal for B** |

**Architecture note (verbatim intent, for B; not an in-round refactor):** `grid.ts:77-96, 263-282` has changed several rounds in a row (SRW-14, SRW-16) and now has four entry points on one theme; `resolveGridTime` has a single caller left (`ArrangementMarkerRow.tsx:490`, marker drag). Keep: pure, cheap, well tested. Optional proposal: when marker-drag snap is next touched, fold `resolveGridTime` into `resolveGridTimeWithTargets` with `targets = []` default. Reviewer endorsed the getter-prop approach over a `markers` array prop (no ruler render coupling).

Browser state/evidence index: `a-browse.json`.

## Final integrity (A, end of phase)
See the last block of commands: frozen 455/455 OK, protected 4/4 OK, HEAD 60006d4, `git status --short` = 6 M + 3 ?? (as §3), CR=0 on all owned files, `pgrep -c node` = 1 (server untouched).

## B acceptance — what A actually passed
- Contract T1–T7 implemented in exactly the granted sites. One addition to T5: the loop-move result is rounded to 1 µs before `moveLoop` (reviewer #1); no-marker results are byte-identical per TS7b/TS8 and the 26-file list; T3 (no markers = old behaviour) shown by TU1e, TS7b, TS8 and the unchanged 26-file + 24-file regression lists.
- Required tests TU1, TS1–TS9 present and green; mutations (a)–(h) each red, restored, `cmp` True.
- typecheck clean, `npm run lint` exit 0, Biome clean on the 7 owned code paths.
- Code-reviewer run; findings 1–4 fixed, 5–6 and the Architecture note passed to B.
- NOT claimed: any C browser row (MT-*, REG-*, RU-DBLCLICK, MT-AUDIO, G78-3). A's smoke above is sanity only. Gate rows (full vitest, build, verify, e2e smoke) are not run by A.

## Known gaps / notes for C
- jsdom cannot prove pixel-exact behaviour; MT-* rows need real `page.mouse`.
- **Click-on-playhead trap** (see the smoke section): move the playhead away before each measured ruler click.
- B's fixture marker B 20.000 vs 12.000: tests use 12.000.
- Not run by A: build, full suite, e2e smoke (gate).

## Exact next C checks
MT-RULER, MT-SCRUB, MT-LANE, MT-CLIPCLICK, MT-RANGE, MT-LOOP-RESIZE, MT-LOOP-MOVE, MT-AUDIO, REG-SNAP-SEEK, REG-LOOP-KEYS, REG-CLIP-SNAP, REG-MARKERS, RU-DBLCLICK (ruler file changed: main regression risk), T78-TARGETED (`npx vitest run $(cat a-round-78/targeted-files.txt)` → 26 files / 508 tests), REG-HYD, G78-3, SOURCE-UNCHANGED against the hashes above. Both 1440x900 and 1280x720.

## Scope completed
Round 78 stage 2b-3 implementation. SRW-16 stage 2b closes only after C evidence. The backlog is not complete.
