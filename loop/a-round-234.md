# A round 234 — SABA-B-11a stage 1: project tempo from the asset's catalogue BPM

**No STOP.** No covering test fails. No test is above 50 % of its timeout: the slowest is CP12b, 6.35 s of its declared 30 s (21 %), against 8.0 s at gate 233; the new tempo-seed-ui tests take ≤ 0.5 s of 15 s.
**Needs B ruling (not a STOP; not a regression of existing behaviour, not reachable in `/studio-lab`):** A-R234-REVIEW-M1, the mount-time seed status is overwritten (see §5).

## 1. Baseline and scope
- At the start: HEAD `db5c297946e3295fec7b2647a2e66dd4cad10692`; `git status --short --untracked-files=all` was empty; frozen tree, root-file and grant start sha256 checks all rc 0.
- At handover (rechecked as the last step, after the review edits and MU-A restore): only the 6 grants are `M`, plus the 4 new files. Frozen tree `sha256sum -c` rc 0. Root files rc 0. Protected routes and tests: `git diff --quiet HEAD` rc 0.

## 2. Changed files (exactly the grants)
| # | Path | Change |
|---|---|---|
| 1 | app/types/arrangement.ts | `WorkspaceSource.bpm?: number;` |
| 2 | app/data/studio-lab-demo.ts | imports `DEMO_STEM_BEAT_SECONDS`; `SYNTHETIC_COMPOSITION_BPM = 60 / DEMO_STEM_BEAT_SECONDS`; `bpm` on `demo-synth-mix` + the 4 `demo-stem-*` |
| 3 | app/lib/arrangement/strings.ts | `studioTempoStrings.seeded({ bpm, title })` (exact §2.4 text) |
| 4 | app/components/arrangement/StudioWorkspace.tsx | imports (`studioTempoStrings`, `formatTempoBpm`, `findAssetTempoSeed`); 3 refs; flag in `toggleSnap` (first line), in `changeGridDivision` (**after** both refusal guards, unlike B's scratch, which set it first), in `changeTempo` (first line); the seed effect over `arrangement.clips`, `arrangement.tracks`, `collection.sources` |
| 5 | app/lib/arrangement/__tests__/strings.test.ts | `'seeded'` in the key list, a `seeded` sample (Latin title), an exact-output assertion in ST18, `'../tempo-seed.ts'` in the ST19 source list. Existing assertions unchanged. |
| 6 | app/data/__tests__/studio-lab-demo.test.ts | DL-BPM added |
| N1 | app/lib/arrangement/tempo-seed.ts | `findAssetTempoSeed` (+ type `AssetTempoSeed`) |
| N2 | app/lib/arrangement/__tests__/tempo-seed.test.ts | TS1–TS6 |
| N3 | app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx | TU1–TU8, describe `{ timeout: 15_000 }` |
| N4 | docs/implementation/2026/quarter-IV/182-saba-b-11a-tempo-seed.md | Georgian; l.4 `**სტატუსი:** In Progress (stage 1 of 2; C round 234 PASS)` (same line form as docs 180/181); the 7 TEMPLATE headings in order; cites L45/L44, TS1–TS6, TU1–TU8, DL-BPM, ST17–ST19 |

## 3. Tests actually run
- `npm run typecheck` → rc 0.
- `npm run lint` → 0 errors (205 warnings and 1 info, repo-wide, outside my paths). `npx biome check` on the 9 changed code paths → clean, no fixes.
- §4.2 covering run: `npx vitest run $(cat b-round-233/covering-files.txt) …tempo-seed.test.ts …tempo-seed-ui.test.tsx` → **103 files passed, 1547/1547 tests passed**, rc 0, 135.8 s. Log: `a-round-234-covering.log`.
- No source file changed after the covering run. Only `tempo-seed-ui.test.tsx` (assertions added) and doc 182 changed afterwards, and tempo-seed-ui was rerun: 8/8.
- Single files: tempo-seed 6/6, tempo-seed-ui 8/8 (rerun 8/8 after the review edits), strings 64/64, studio-lab-demo 14/14.
- I did not run the full suite or `verify` (speed rule; gate rows).

## 4. Mutant MU-A (rerun on the final test file, after the review edits)
I removed the seed effect from StudioWorkspace.tsx and ran tempo-seed-ui: **7 failed, 1 passed**. TU1 stays green (mount state); **TU2, TU3, TU4, TU5, TU6, TU7 and TU8 are red**, including the required TU2/TU3/TU6/TU8. Log: `a-round-234-mu-a.log`. I restored the file from a byte copy; `cmp` shows it identical. The final file contains no mutant.

## 5. code-reviewer (actual subagent run, score 8/10, 0 Critical/High)
- **M1 (Medium), id A-R234-REVIEW-M1:** the reviewer read the code and concluded that when the *initial arrangement* already holds a BPM clip, the seed's status (loading text + seeded sentence) is immediately overwritten by the provider's source-loading `setStatus(copy.loading)`, because the child effect runs before the parent effect. Tempo, grid and Snap are still correct; only the explanation is lost. The same applies to a seed triggered by a late `collection.sources` change. **Confirmed by A:** a temporary `console.log` in TU8 (removed afterwards; the file is byte-identical to the final file) printed the status `"Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts."`, with no seeded sentence. Unreachable in `/studio-lab`, which starts empty and seeds only on clip edits, whose status lands in the same batch (TU2 pins this exactly; the browser confirms it). The fix needs a functional `setStatus` in `ArrangementContext.tsx` (frozen) or moving the seed into the provider, both outside grant 4. Not a STOP under L33: it is not a regression of existing behaviour (there was no seed before) and it is not on a reachable path today. **B to rule** (e.g. a follow-up with an `ArrangementContext` grant before SRW-21 passes an initial arrangement). I corrected the doc wording.
- Addressed in ownership:
  - L4: the TU4 typed case now also asserts grid `1`, Snap `off` and no seeded sentence.
  - L6 (partly): TU5 gains a case where Snap was turned on by hand first, so Snap stays on and the status is exactly placement + seeded, with no Snap part.
  - L8: doc fixes: the effect "runs on every change and returns early"; Redo cannot be the first seed; the Snap label is the current division (`0.5 s` if chosen by hand); `toBeCloseTo(x, 3)` is < 0.5 ms; the MU-A count is cited from the log.
  - After the edits: tempo-seed-ui 8/8, tsc rc 0, biome clean.
- Not addressed (Low, reported):
  - L1: the search reruns on drag previews until the seed closes. It is cheap and not on the playback path.
  - L2: rounding is duplicated with `parseTempoBpm`, and `tempo.ts` is frozen.
  - L3: a source that failed to load can still seed.
  - L5: the redundant literal in TU2 is kept to pin the copy.
  - L6: no test for refused-grid, drop or paste seeding (the refused musical id is not selectable without a tempo).
  - L7: mount waits 2 microtasks, as the other suites do.
- **Architecture note (for B/root, not acted on):** keep the seed in StudioWorkspace for now; the state it writes lives there. After 11b, consider one scoped task that extracts the tempo/grid/Snap cluster (`StudioWorkspace.tsx` ~526–561, ~1326–1424) into a hook, and/or exposes a functional `setStatus` from the context, which would also fix M1.

## 6. Browser self-check (Playwright, Chromium, http://127.0.0.1:5173/studio-lab, fresh context per case)
Script: `a-round-234/probe.mjs`. Results: `a-browse.json`. Screenshots: `a-round-234/empty-{1440,1280}.png` and `after-<source>-{1440,1280}.png`.
| Case | 1440×900 | 1280×720 |
|---|---|---|
| Add `demo-stem-pulse` (button) | tempo 120, `1/4`, grid-seconds 0.5, Snap on, 92 marks, status = §2.5 example exactly, 16 px, fits | same, 76 marks, 16 px, fits |
| Enter on `demo-synth-mix` | same, with the “… · სრული მიქსი” title; 16 px, fits | same; 16 px, fits (screenshot checked by eye: one line) |
| Add `demo-soft-impact` | tempo empty, `1`, Snap off, 0 marks, no "120 BPM" in body text | same |
- 0 page errors. The console shows only the expected cart `ERR_CONNECTION_REFUSED` (no backend).
- The first probe attempt timed out waiting for Add while Vite compiled cold; a debug load then showed Add enabled, and the rerun passed. This was the environment, not a product failure.
- No new persistent text: the seeded sentence lives only in the existing status line. The bars numerals are timeline content.

## 7. Known gaps and notes for B/root
- **A-R234-REVIEW-M1:** see §5 (mount-time seed status lost; TU8 checks state only).
- Clip starts are rounded to ms by the model, so a snap on the 60/90 s grid lands at 0.667. TU7 therefore compares at ±1 ms. Existing behaviour.
- C-SNAP, C-EXPORT, C-USER-WINS, C-HAND, C-ONESHOT, C-MIXED, C-BUDGET, LAB-SMOKE: not run by A (C rows).

## 8. Next C checks (exact)
C-SCOPE-234 → C-UNIT-234 (tempo-seed, tempo-seed-ui, strings, studio-lab-demo, tempo-ui) → C-SEED-STEM / C-SEED-ENTER / C-NO-BPM / C-MIXED / C-USER-WINS (a, b, c) / C-HAND (a, b) / C-ONESHOT (a, b) / C-SNAP / C-EXPORT / C-STATUS-FIT / C-BUDGET / C-REF-234 / C-LESSON-234 / AN-REVIEW-234 / LAB-SMOKE-234 / C-SHOTS-234 at 1440×900 and 1280×720. Probe §6 first: F1-ABSOLUTE-SNAP jumps after a seed, the loop brace and marker snap at 0.5 s, and the grid menu with seconds after a seed.

## 9. Scope completed
Implementation of §2.1–§2.7 and the §4 A checks 1, 2, 3, 5 and 6. Check 4 (reviewer) is done and its findings are handled in §5. Acceptance rows I truly passed: none are C rows. My browser self-check matches the C-SEED-STEM, C-SEED-ENTER, C-NO-BPM (first case only) and C-STATUS-FIT expectations, but C owns those verdicts.
