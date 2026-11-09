# A round 421: SYS-R418-PREVIEW-LIFECYCLE

**Status: implemented. No STOP.** I followed the sketch exactly, wrote doc 271, and ran every A check (A1–A6). Each one matches what B expected.

## Changed files (`git status --short --untracked-files=all`)
```
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/__tests__/library-preview-stream.test.tsx
 M app/lib/arrangement/preview.client.ts
?? docs/implementation/2026/quarter-IV/271-sys-preview-lifecycle.md
```
- **The 3 code and test files are exactly B's sketch.**
  - I applied `b-round-420/sketch-421.patch.txt` (sha256 `8d5fc47d2751…`) with `git apply --check`, then `git apply`.
  - Nobody edited them afterwards: `git apply --reverse --check` on the same patch is clean.
  - Diff: `a-round-421/diff.patch` (`git diff --stat`: 3 files, +200 −6).
- **Doc 271 is new.** It is in Georgian, with English technical terms.
  - l.4 is exactly `**სტატუსი:** Completed (C round 421 PASS)`.
  - Its `## ` headings equal TEMPLATE's 7, in order (checked with `diff`).
  - The mutant block equals `b-round-420/mutants/summary.txt` byte for byte (checked with python).
  - It covers rulings 1–9, the 8 closed ids with their rows, the lock rows PL3/PL4/PL5 and why each is a lock, and a Mermaid sequence of error → microtask → teardown (stop + token bump) → stale token → nothing starts.
  - Every row id it cites exists under `app/` (grep): PL1–PL9, PC12, PC3, PS9, PS10, PS11, PS16–PS19, PS24, PS25, PS27, EV12.

## Checks (logs in `a-round-421/`)
| # | Command | Result |
|---|---|---|
| A1 | `bash b-round-420/claims-421.sh` at the start | rc 0; equal to `claims-421-planning-output.txt` (empty diff); stderr 0 bytes (`claims-start.txt`, `claims-start.err`) |
| A2 | `npx vitest run $(cat …/covering-files.txt)` | rc 0; **14 files, 286/286** (`a2-vitest.log`) |
| A3 | `npm run typecheck` / `npm run lint` | rc 0 / rc 0, 205 warnings, 1 info (`typecheck.log`, `lint.log`) |
| A4 | `npx biome check` on the 3 code files | rc 0, "No fixes applied" (`biome3.log`) |
| A5 | claims at the end | rc 0, stderr empty (`claims-end.txt`). Against planning (`claims-planning-vs-end.diff`), it differs only in K2 `1 ?? 3 M total 4`, K5 `no`, K6 (`271-sys-preview-lifecycle.md` and its exact l.4), K9 and K10. K9 and K10 equal `claims-421-sketch-output.txt`. K1 stays `6609dfa`. K2b 0; K3 frozen 1316 rc 0; K4 protected rc 0, granted-protected 0 |
| A6 | `code-reviewer` subagent on the 4 files | No Critical, High or Medium findings. Two Lows, below |

I did not run any browser check this round. The task gives all browser rows to C. I did not run the full suite or verify (both are gate rows).

## Reviewer findings
- **Low, doc wording (fixed in the doc).** The testing section said that behaviour "should be equal". It now says "equal to HEAD" and cites B's precheck, `b-round-420/probe/compare-head-vs-sketch.txt` (ALL EQUAL, 16 cells). C's row 4 is still the real check.
- **Low, test coverage (not fixed in the tests, because the test file is sketch-only; recorded in doc 271's TODO).** No row checks that a **decoded buffer** preview that is already playing gets `source.stop` when the collection changes. The code covers it through the same `stopLibraryPreview()` line that PL1/PL2 pin. Proposed id **A-R421-REVIEW-L1**, for B's `deferred_low_polish`.
- **The reviewer confirmed:**
  - `stopLibraryPreview` has a stable identity (`useCallback([releasePreviewPin])` → `useCallback([decodedBuffers])` → `useState`), so the effect gets no new re-run trigger.
  - Unmount order: the collection effect's cleanup runs before the player teardown, and the second stop does nothing.
  - No `stopPlayback` change; the public surface is unchanged.

## For B
- **Architecture note (a proposal, not done; it is outside the grants).** The collection effect in `ArrangementContext.tsx` (~l.4523) now also owns part of the preview lifecycle. The preview state is spread over `previewTokenRef`, `previewPlayerRef`, `streamFallbackRef` and `startLibraryPreviewRef`, plus the callbacks around l.1785–2046. Rounds 416, 418 and 421 each changed this region.
  - The reviewer's verdict: keep for now.
  - Candidate for a later bounded task: an internal `useLibraryPreviewController({ collection, decodedBuffers, ensureAudioContext, ensureDecoded, stopPlayback, setStatus })`.
    - Acceptance: the `useArrangement()` surface is unchanged; PC/PS/PL/EV12 tests pass with unchanged bodies; MU-COLLECTION-NO-STOP still turns PL1/PL2 red.
- A-R421-REVIEW-L1 (above).

## Acceptance (A rows only)
A1 ✔, A2 ✔, A3 ✔, A4 ✔, A5 ✔, A6 ✔. C rows 1–8 have not been run by A. They are for C.

## Exact next C checks
Section 6 of the task, in L59 order:
1. Row 3: mutants on a HEAD scratch; must match the 7-line summary; plus 1 loaded replicate.
2. Row 4: browser compare, 16 cells, must print `ALL EQUAL`; R11 shows `paused [false]` and `advanced true`.
3. Row 5: play/stop smoke.
4. Row 6: auth; the fake-bearer path is BLOCKED (backend unavailable in the cloud).
5. Rows 1, 2, 7, 8: claims and scope, patch identity, doc 271 byte checks, L57.

## Known gaps
- PL4 (unmount) is a lock row: it cannot observe the token bump (TL-R421-01; accepted).
- The new stop trigger cannot be reached in `/studio-lab`, because the collection there is a constant. Only jsdom proves it.
