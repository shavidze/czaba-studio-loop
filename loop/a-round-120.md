# A round 120 — T12 stage 4a: the waveform shows the clip's Clip Gain (display only)

Implementer: A (Claude Opus 5.5) · 2026-10-23 · Task: `current-task.md` (round 120, D-29z85)

## Start state
- HEAD `4090f6ea78317ebc331cd6add9c63d318ca4ab41`, `git status --porcelain` empty.
- `sha256sum -c --quiet b-round-119-r120-tree-sha256.txt` → OK at the start.
- Pre-edit grep `grep -rn "h1V\|svg path" app --include=*.test.*` → **0 hits**. B's note expected hits in fade and envelope tests; there were none, so no existing test pins a peak path.
- C-R119-01: no pre-existing untracked file was touched. Both new files were created from scratch. Scripts and evidence are in `a-round-120/`, along with copies of the 2 tracked files at HEAD (`a-round-120/ArrangementClip.tsx`, `a-round-120/ArrangementDetailPanel.tsx`).

## WG2 pre-edit pin (unmodified `buildPeakShape`, run before any edit)
- Script: `a-round-120/wg2-pin.ts` (vite-node). Output: `a-round-120/wg2-pre-edit.txt` (contains the full literal path).
- Fixture: 300 buckets, `peaks[i] = |sin(i/7)| * (0.3 + 0.7*|cos(i/41)|)`, `sourceOffset 0.5`, `duration 2`, `columns 120`.
- Result: 120 columns, path length 2530, sha256 `cc617f0c9a6251120fb9cf2b60a1f3f665568e1a2cf5bd1da5e10313980ced33`. WG2 pins this sha256.
- The WG1 fixture before the edit gave exactly B's scale-1 literal.

## Diff summary
- **`app/components/arrangement/ArrangementClip.tsx`** (+8/−4)
  - `buildPeakShape` has a required 5th parameter, `scale: number`.
  - `const s = Number.isFinite(scale) && scale >= 0 ? scale : 1;` and the column height is `Math.max(0.02, Math.min(1, max * s))`. The floor, `toFixed(3)`, the loop and the bucket mapping are unchanged.
  - The lane uses `const gainScale = clipLinearGain(clip);` and passes it as the 5th argument. `gainScale` is in the memo deps.
  - `clipLinearGain` is imported from `~/lib/arrangement/model`.
  - `data-testid="arrangement-clip-waveform"` is on the peak `<svg>`.
- **`app/components/arrangement/ArrangementDetailPanel.tsx`** (+4/−2)
  - The detail call site passes `gainScale = clipLinearGain(clip)`, and `gainScale` is in the deps.
  - `clipLinearGain` is imported. Nothing else changed.
- **New `app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx`:** 8 tests, WG1–WG8.
  - It defines its own `FakeWaveAudioBuffer` with a deterministic non-zero waveform (0.15…0.75). The existing harness fake returns zeros, which would make every scale assertion vacuous.
  - Expected shapes come from `live(api).sourcePeaks`, with the column count parsed from the svg `viewBox`.
  - WG4 also asserts that the detail panel follows the drag before release (reviewer suggestion).
- **New `docs/implementation/2026/quarter-IV/102-studio-waveform-clip-gain.md`:** all TEMPLATE sections, in Georgian.
- Audio files are untouched (R5): `ArrangementContext.tsx`, `graph.client.ts`, `schedule.ts`, `export-wav*.ts`, `model.ts`, `peaks.ts`.

## Deviations
1. **Memo deps form (R3).** B prescribed `clipLinearGain(clip)` inside the memo with `clip.gainDb` in the deps. Biome `useExhaustiveDependencies` flagged that form (`clip` missing, `clip.gainDb` extra). I moved the computation to `const gainScale = clipLinearGain(clip)` outside the memo, with `gainScale` in the deps, at both call sites.
   - The behaviour is the same: the value is a plain number that changes exactly when `gainDb` changes.
   - The m1 mutation therefore removes `gainScale` instead of `clip.gainDb`.
2. **One shell write.** One formatting fix to the new test file (Biome line wrapping) was applied with a python string replace instead of the Edit tool. It was a new, A-owned file, and Biome re-checked it clean. The mutation edits (m1–m5) were also shell string replaces on the 2 tracked files. They were temporary: each was restored from a copy and verified by sha256 (`a5c0b7be…` / `87c878e5…`). Every lasting edit used Edit/Write.
4. **WG5 setup.** The −6/+3 gains are now set through the context (`setClipGain`) after mounting, as §3.2 says, not through the initial arrangement. Re-run: 8/8 passed.
3. **Name `s` kept.** The reviewer suggested a longer name, but B's R1 names the variable `s`.

## Tests run (actually executed)
- `npx vitest run` on the §4 list: all 20 listed files exist. **20 files passed, 331 tests passed, 0 failed** (`a-round-120/vitest-list.txt`).
  - The new file has 8 tests (WG1–WG8).
  - After the reviewer edit (WG4 detail check) and the WG5 setup change, only the new file was re-run: 8/8 passed. No other file changed after the list run.
- WG1: B's 5 literals matched exactly on the first run. No literal was edited.
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0. It reports 218 warnings and 1 info across the repo; none of them is in the changed files.
- `npx biome check` (read-only) on the 2 changed + 1 new code file → clean.
- No full suite, no `npm run verify`, no build (left to the gate under the speed rules).

## Mutations (`a-round-120/mutations.txt`; each one restored, sha256 verified OK)
The table below is the second run, against the **final** test file. The first run, before the WG4/WG5 test edits, is also kept in the file.

| ID | Mutation | Result (final test file) |
|---|---|---|
| m1 | lane memo deps without `gainScale` | WG4, WG5, WG8 **red** |
| m2 | `Math.min(1, max) * s` (scale after the clamp) | WG1 **red** |
| m3 | detail call site passes `1` | WG4 (its detail check), WG6 **red** |
| m4 | lane passes `clipLinearGain(clip) ** 2` (squared linear gain) | WG3, WG4, WG5, WG8 **red** |
| m5 (extra) | detail memo deps without `gainScale` | WG4 **red** |

## Code review (required: 4 files)
- The real `code-reviewer` subagent ran. **Verdict: approve, 9/10, no critical or major issues.**
- It had no shell, so it reviewed by reading the files. It did not run the tests.
- Findings addressed:
  - (1) Low: the detail panel's live drag was untested → the detail check is now in WG4, and m5 proves it.
  - (5) Nit: the doc's mutation labels were unexplained → the doc now lists the mutations.
- Findings noted and not changed:
  - (2) WG3–WG6 use `buildPeakShape` as their oracle. This is acceptable because WG1 and WG2 pin the function itself.
  - (3) The WG2 length check is redundant.
  - (4) The name `s` is B's name.
  - (6) Video clips rely on having no `gainDb`. That is true today, since Clip Gain is audio-only.
- **Architecture note (for B/root, not acted on):** `buildPeakShape` is a pure geometry helper exported from a component file. The detail panel and the test import it from there. Stage 4b will change it again. Recommendation: keep it where it is for now. Optionally, when 4b lands, move `buildPeakShape` and `PeakShape` to `app/lib/arrangement/peaks.ts` with the same signatures, as a single-owner task that WG1/WG2 cover. Low value. This could go as an addendum to `b-round-91-checkpoint-request.md`.

## End state
- `git status --porcelain`:
  ```
   M app/components/arrangement/ArrangementClip.tsx
   M app/components/arrangement/ArrangementDetailPanel.tsx
  ?? app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx
  ?? docs/implementation/2026/quarter-IV/102-studio-waveform-clip-gain.md
  ```
  This is exactly the §2 end state.
- `sha256sum -c --quiet b-round-119-r120-tree-sha256.txt` → OK at the end.
- Protected files: `git diff --stat 4090f6e` on `studio.$productId.tsx`, `api.studio-token.ts`, `auth.ts` and `AuthContext.tsx` is empty.
- No commit, push, stash, checkout, install, dev-server restart or `--write`.

## B acceptance (A side only)
- §2 ownership and end state: met.
- R1–R5: implemented (R3 with deviation 1).
- §3.2 WG1–WG8: written with exact matchers and passing.
- §3.3 m1–m4: each turns its named test red.
- §4 checks: run and green.
- Not claimed: every C browser row (WG-SCALE, WG-CLAMP-FLOOR, WG-LIVE, WG-DETAIL, WG-MULTI, WG-MUSTNOT, WG-PLAY, WG-AUDIO, WG-VIDEO, G120-3, PX-NET/REG-HYD). A did not use the browser this round, so `realVerified` for A = false. C owns those rows.

## Known gaps
- No browser check by A.
- The ratio rule, the export audio isolation (WG-AUDIO) and the video clip state still need C's real Chromium runs.
- Stage 4 (T12.27 item 8) still needs 4b (Waveform Vertical Zoom).

## Exact next C checks
1. T120-TARGETED: the same 20-file vitest list → expect 20 files / 331 tests passing.
2. AN-REVIEW: `git diff 4090f6e` on the 2 files. Note deviation 1: `gainScale` sits outside the memo instead of `clip.gainDb` in the deps.
3. SOURCE-SCOPE: `git status`, the frozen list and the protected hashes.
4. Browser rows from §5 at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`: read `[data-clip-id=<id>] [data-testid="arrangement-clip-waveform"] path` (this testid is new this round). For the detail panel, read `[data-testid="arrangement-detail-waveform"] svg path`.
