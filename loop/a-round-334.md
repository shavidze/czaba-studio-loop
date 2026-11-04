# A round 334: PERF-DRAG-PREVIEW stage c2b-iii (ArrangementPeakPath primitive props)

**Status:** A rows complete. No STOP condition hit. Browser and perf rows were not run by A; C runs them.

## Changed files (7, `git status --short`, nothing untracked)
- `app/components/arrangement/ArrangementClip.tsx` (patch)
- `app/components/arrangement/ArrangementDetailPanel.tsx` (patch)
- `app/lib/arrangement/model.ts` (patch: `gainDbLinearGain`)
- `app/lib/arrangement/waveform-zoom.ts` (patch: `waveformScaleForGainDb`)
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (patch: DP43–DP48)
- `app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx` (patch: WG9, WG10)
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (§1.3, by hand)

The patch was applied with `git apply` exactly as written. A did not strengthen any test row, so the test hunks match the sketch byte for byte. `git apply -R --check b-round-333/sketch/sketch.patch.txt` passes from `store/`. `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementContext.tsx`, `perf/**` and the protected files are untouched (K18 `2 untouched`, K8 11 OK).

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: the output equals `claims-334-planning-output.txt` (empty diff) | `a-round-334/claims-before.txt` |
| A-IMPL | PASS: the patch applied cleanly; doc 232 edited per §1.3 (l.1, l.4 byte-exact, l.5; the c2b-iii section with items 39–42; 3 alternatives; files; problem; the c2b-ii testing sentence; a new testing entry; TODO edits; `^## ` count 7) | diff |
| A-CLAIMS-AFTER | PASS: the only differences from `claims-334-sketch-output.txt` are K2 `3f945e3 7`, K11 new l.4, K12 `1 1 1 7`. K7 is unchanged at `286 50 6 65 2` | `a-round-334/claims-after.txt` |
| A-SCOPE | PASS: 7 modified files, 0 untracked | — |
| A-TYPE / A-LINT | PASS: typecheck rc 0; lint rc 0, K10 16; `npx biome check` on the 6 patch files is clean (rc 0) | `a-round-334/typecheck.log`, `lint.log`, `biome-owned.log` |
| A-UNIT | PASS: 155 files, 2459/2459, rc 0, 192 s | `a-round-334/covering-unit.log`, `covering.json` |
| A-UNIT timeouts (L31) | No test is above 50 % of its declared timeout. Slowest: CP12a 6.84 s of 30 s (23 %; gate 333 5.28 s); TC10 3.25 s of 15 s (22 %; describe at l.176–472); UM3/UM9/UC5/UM1/UM4 ≤ 2.87 s of 20 s | `a-round-334/slow-tests.txt` |
| A-MUTANT | PASS: 9/9 red, every one on exactly the rows in the §0 table, all `restored` true. Scratch `/home/runner/a334-scratch/sc` (a git clone at `3f945e3`, HEAD tree `bcc3a7c…` = `3f945e3^{tree}`; `public/middle-east.mp3` was already tracked, so no extra commit) | `a-round-334/mutants-a.txt` |
| A-REVIEW | DONE: the real `code-reviewer` subagent reviewed the 7 files. Score 9/10, 0 Critical/High/Medium | below |

Mutant rows: CLIP-PROP-BACK DP43/44/47/48; NO-MEMO DP43/44/46/47/48; LANE-GAIN-DROPPED CP13/CP14/DP47/WG3/WG5/WZ3; DETAIL-GAIN-DROPPED DP47/WG6; DRAFT-IGNORED CP1/CP3/CP4/CP13/WG4/WG8/WZ3; COMMITTED-WINS CP1/CP3/CP4/CP13/WZ3; LANE-OFFSET-ZERO WG3/WG5/WG10/WZ2; DETAIL-OFFSET-ZERO WG9/WG10; MEMO-DEPS-STALE WG10.

## Code-reviewer findings (for B; none fixed in-round)
- **Low A-R334-REVIEW-WG9-UNDEF:** `clip-gain-waveform.test.tsx` WG9, `expect(panel.d).not.toBe(fromStart?.path)`. This would pass trivially if `fromStart` were undefined. Today it is safe only because `expectedShape` throws when there are no peaks. Suggested fix: an explicit `expect(fromStart).toBeDefined()`. A did not strengthen the row, so the test hunks stay byte-equal to B's sketch for C's SOURCE-SCOPE and K7 rows; B may add it in a later round.
- **Low A-R334-REVIEW-DP-ORDER:** DP48 comes before DP47 in the file (cosmetic).
- **Low A-R334-REVIEW-DP43-DETAIL:** DP43 does not check whether the detail panel is open. Its 0-render assert covers the lane, which matches the doc.
- **info:** naming (`gainDbLinearGain` repeats "gain"; `waveformScaleForGainDb` is 4 words). Neither blocks; both follow `clipLinearGain`/`masterLinearGain` as tech-lead ruled.
- **info:** doc 232 l.90 (the c2a alternatives entry) still says PeakPath takes `ArrangementClip`. That is accurate as history.
- **Architecture note (verbatim gist):** "Keep. The change keeps ownership as it was: drawing stays in `ArrangementClip.tsx`, and only a pure gain→scale helper moved into `lib/`. No new state or lifecycle was added. The one leftover, the redundant `clipWaveformScale` delegate, is already tracked as SIG-R334-INLINE-DB-GAIN for the planner." (Proposal only; A did no refactor. Note: the `clipWaveformScale` test-only delegate and SIG-R334-INLINE-DB-GAIN are separate TODO bullets in doc 232.)

## Known gaps
- A ran no browser or perf rows: DRAG-NAMES, PERF, WAVEFORM-D (including C's own trim-end sample), VIDEO-WAVE, D-ROWS and G334-AUTH are all C's rows.
- The trim-end browser limit from §0 is still open, waiting on C's own sample.
- `clipWaveformScale` remains as a delegate used only by tests (out of scope).
- SIG-R334-INLINE-DB-GAIN (`ArrangementContext.tsx` inline dB) was not touched.
- D-29z1002: no wait on checkpoint D-29z915.
- A did not run the full suite or `npm run verify` (gate rows, speed rule).

## Exact next C checks (§2.2)
CLAIMS (must equal `a-round-334/claims-after.txt`), SOURCE-SCOPE, UNIT ×3, MUTANT (+ C's own), DRAG-NAMES (1440×900; `fade-moves` [10×4], `move-moves` [19,19,101,19], `trim-moves` [22×4], `harness-clip-click` [100,0]), PERF (alone, after warm-up; 104 EQUAL; the 17 rows ≤ sketch; `hook-live` 1), WAVEFORM-D (both viewports, `DIFFS 0`, plus the trim-end sample), VIDEO-WAVE, D-ROWS (EXPORT WAV sha = HEAD), G334-AUTH, DOCS. Gate rows: full vitest, build, Biome, typecheck, verify, e2e smoke.

## Scope
Stage c2b-iii's A part is complete. The stage is not done until C has its browser and perf evidence. The backlog was not marked.

STATUS: READY-FOR-C
