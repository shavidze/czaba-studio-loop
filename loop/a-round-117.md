# A — Round 117 report (C-R116-01: lane-slider test scope in track-group-mix-ui)

Implementer: A · Date: 2026-10-23 (~20:40–20:52 UTC) · Task: `current-task.md` (D-29z82)
Scope: test scope only. No app source changed. Ableton correspondence: not applicable (no new behaviour).

## Start state
- HEAD `d5de68fe27c165b00b5578f016703af90730500b`.
- `git status --porcelain | md5sum` = `49a4b7cd717023e3a2c52dd5912658c1` (matches B/C chain of custody).
- `sha256sum -c --quiet b-round-116-r117-tree-sha256.txt` → **OK**.
- Pre-edit run of `track-group-mix-ui.test.tsx`: 3 failed / 7 passed (UM3 received `0.03162277660168379` = −30 dB; UM5 and UM9 received `1`). This is exactly C-R116-01.
- Primitives read before editing: `.claude/primitives-map.json`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `AGENT_DISCOVERABLE_CODE.md`.
- All edits were made with the Edit tool. The primitives hook fired on every edit.

## Changed files (owned only)
1. `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx`
2. `docs/implementation/2026/quarter-IV/100-studio-track-volume-db.md`

### Changed lines (`old → new`)
The import adds one line, so post-edit line numbers are the B line number + 1.

| B line | Test | old → new |
|---|---|---|
| after l.21 | import | (none) → `import { trackVolumeFromDb } from '../track-volume-db';` |
| l.482 | UM3 | `.toBe(0.5)` → `.toBe(trackVolumeFromDb(-30))` |
| l.522 | UM3 | `.toBe(0.5)` → `.toBe(trackVolumeFromDb(-30))` |
| l.569 | UM5 | `keyboardFader(laneFader(view, 'სტემები'), '0.5')` → `'-6'` |
| l.571 | UM5 | `.toBe(0.5)` → `.toBe(trackVolumeFromDb(-6))` |
| l.575 | UM5 | `toEqual({ video: 1, music: 1, stems: 0.25, sfx: 0.5 })` → `toEqual({ video: 1, music: 1, stems: trackVolumeFromDb(-6) * 0.5, sfx: 0.5 })`. This is still an exact `toEqual`; see deviation 1. |
| l.657 | UM9 | `value: '0.7'` → `value: '-3.1'` |
| l.660 | UM9 | `.toBe(0.7)` → `.toBe(trackVolumeFromDb(-3.1))` |

- Not touched: l.480 `dragFader(stemsFader, 12, -50)`, l.576 `toEqual(storedGains(api))`, every group-fader line, every context-driven line (l.510–521, l.523), the titles, the steps and the pointer ids.
- No `toBeCloseTo` or looser matcher anywhere.
- Counts: `expect(` 131 → 131. `it(` 10 → 10.
- R2: the exact match passed on the first run. The STOP condition did not trigger.

### Doc 100 (R4)
- Appended one bullet to **ტესტირება**: „Round 117 (D-29z82): `track-group-mix-ui.test.tsx` UM3/UM5/UM9 — ხაზის slider-ის სკალაზე დამოკიდებული ხაზები dB-ზე გადავიდა (C-R116-01).“
- l.4 is unchanged („Round 116 — C-ის შემოწმებას ელოდება …“).
- The TODO line „B-ს გადაწყვეტილება `track-group-mix-ui.test.tsx`-ზე …“ is still there, because R4 granted exactly one bullet. Root or B may clean it up after the gate.

## Tests (actually run)
- `npx vitest run` on the 19 files (`track-volume-db`, `fader-click`, `fader-guards`, `fader-touch`, `fader-focus-order`, `pan-release-recovery`, `gesture-guard`, `context-hygiene`, `pending-status`, `track-group-collapse-ui`, `clip-gain-fader`, `clip-gain-multi`, `track-group-mix-ui`, `master-ui`, `track-layout`, `clip-gain`, `status-announcement-ui`, `self-disabling-focus`, `render-budget`): **19 files, 370/370 passed**. Log: `a-round-117/vitest19.log`; file list: `a-round-117/files19.txt`.
- `meter-ui` + `track-pan`: **2 files, 38/38 passed**. Log: `a-round-117/vitest-meter-pan.log`.
- `track-group-mix-ui` alone after the edit: 10/10.

### Mutation proof
- **k1** (l.569 back to `'0.5'`): UM5 turned **red**: `expected 1 to be 0.5011872336272722` at the l.571 assertion. Log: `a-round-117/k1.txt`.
- **k2** (l.575 `stems: 0.25`): UM5 turned **red**: `- "stems": 0.25` / `+ "stems": 0.2505936168136361`. This proves the matcher is exact. Log: `a-round-117/k2.txt`.
- I restored k1 and applied k2 back-to-back with no sha check in between. The k2 run passing the l.571 assertion shows k1 was restored correctly.
- Both were restored with Edit. The restored file's sha256 `5de78398ffa6f7471a0080ce68f2c6f5b2f2d8da79afbfaa17ce9fd5f6a3e22a` matches the post-edit hash taken before the mutations (`sha256sum -c a-round-117/final.sha256` → OK).

## Static checks
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. 455 files; 218 warnings and 1 info, no errors. None of the warnings is in the changed file: the single-file `biome check` reported no diagnostics for it.
- Read-only `npx biome check` on the changed test file: clean, no fixes applied.
- `npm run check` (write mode) and `format` were not run.
- No full suite and no `npm run verify` (speed rules; the gate runs them).
- No code-reviewer: only 2 files changed, under the 3-file threshold.

## End state
- `sha256sum -c --quiet b-round-116-r117-tree-sha256.txt` → **OK**.
- `git status --porcelain` is the §2 expected end state: the round-116 set plus ` M app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx`. Doc 100 is still `??`. There are no other paths.
- End `git status --porcelain | md5sum` = `4de7f1c040e7aa4c86108c8608d102c1`.
- Protected files: `git diff --stat d5de68f` on `studio.$productId.tsx`, `api.studio-token.ts`, `auth.ts` and `AuthContext.tsx` is empty.
- No commit, push, stash, checkout, reset, dev-server restart or install.

## Deviations
1. **The l.575 matcher spans 6 lines.** On one line, the new matcher is 107 characters. `biome.json` sets `lineWidth` to 100, so I wrapped it in the format Biome expects (`biome check` is clean). The content is exactly R1/R2: still `toEqual`, with only `stems` changed. Diff reviewers will see `-1/+6` lines here.
2. **One primitive read late.** For the doc path, the hook also mapped `AUDIO_ARCHITECTURE.md` (the path matches "studio"). I read it right after the one-bullet doc edit, not before. It has nothing that bears on a doc bullet. No change resulted.

## B acceptance criteria I actually met
- R1 import and lines: met.
- R2 exact match: met.
- R3 nothing else changed: met.
- R4 bullet: met.
- §3 checks: met. 370/370 + 38/38, k1 and k2 both red then restored, typecheck and lint clean, frozen OK at start and end.
- **Not claimed:** every C row (T117-TARGETED re-run, LANE-WRITE-GREP, AN-REVIEW, SOURCE-SCOPE, TV-*/NB-GROUP/G117-3 browser rows, PX-NET, DOC-100) and the gate rows. A did no browser work this round; the task needed none from A.

## Known gaps
- None in scope.
- Architecture: no new note. The round-116 Signal 4 (gesture start / `atStart` exposure before 3b) is already in B's checkpoint addendum (ab).

## Exact next C checks
1. `npx vitest run $(cat tmp/studio-real-loop/a-round-117/files19.txt)` → expect 19 files, 370/370. Then `meter-ui` + `track-pan` → 38/38.
2. `git diff app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx`: the import plus the 7 R1 lines (l.575 wrapped). `grep -c "expect("` = 131 and `it(` = 10.
3. `git diff` on doc 100 is not available, because the file is untracked. Compare the **ტესტირება** section against the R4 text and check that l.4 is unchanged.
4. SOURCE-SCOPE: the `sha256sum -c` frozen list, `git status` against §2, the protected-file hashes, and the md5 `4de7f1c040e7aa4c86108c8608d102c1`.
5. The browser rows in §4 at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`.
