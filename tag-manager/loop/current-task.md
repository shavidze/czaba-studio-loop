# CURRENT TASK — Round 50: BLOCKED — waiting on Saba (no runnable scoped work)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 49: C PASS** (R49-1..R49-7, `realVerified=true`, bugs 0). Biome `Checked 85 files`, 0 errors, 8 warnings (the same `src/` warnings as before). Renderer 326/326, main 135/135, E2E 7/7 (`--retries=0` 7/7). Root published **a849d29**. **TM-B06 is done** and D-52 is verified.
- Saba's ordered list (Q2 → Q8 → Q4/Q1 → Q5 → Q3 → Q6) is finished. No critical, high or data-loss bug is open.
- The scoped items that are not done are **TM-T2-DATA** and **TM-T2**. Both need information that only Saba can give:
  - **TM-T2-DATA** needs the UCS category list file (~750 CatIDs) and its licence confirmation (**Q7**). The file's sha256 must equal the copy in czaba-api `tools/recording-import/ucs-categories.json`.
  - **TM-T2** (the UCS CatID combobox on the category field) depends on TM-T2-DATA.
- Neither item is deferred, out of scope or shrunk. They stay `blocked` in the backlog with their full acceptance (T2-1..T2-7 + regression).

## Baseline
- HEAD `a849d29f879b0a9ca7eeecc1de1c4e2352af83b7`, clean working tree. The release-commit rule from `policy.local.md` applies.
- **Frozen: the whole repository.** No path may change this round.
- **Protected (as always):** `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `.claude/settings*`, `.claude/hooks/**`.

## Scope
**No work for A or C.** If this file is dispatched anyway:
- A changes nothing and writes `a-round-50.md` with the single line `BLOCKED: waiting on Saba Q7 (see current-task.md)`.
- C checks only that `git status --porcelain --untracked-files=all` is empty and that HEAD is a849d29.

**What unblocks the loop (root records Saba's answers in `policy.local.md`):**
1. **Q7.** Saba supplies the UCS list file and confirms its licence. The next round is then **TM-T2-DATA intake**: the file lands at `src/shared/ucs-categories.json` (T2-7), its licence and sha256 are recorded, and the sha256 is compared with the K-4 copy. TM-T2 is then planned in stages, reference-first (Soundminer / BWF MetaEdit / UCS docs).
2. **Q9–Q26** (UX and behaviour; definitions are in `b-round-41.md` … `b-round-47.md`), plus **C-R47-01**. These do not block, but none of them is scheduled before Saba answers.
3. **New Q27** (from root's round-49 review):
   - (a) Should tests move to single quotes so the D-52 override can be dropped (RR-R49-01)? That would reverse the "relaxed override" Saba accepted.
   - (b) Should `noNonNullAssertion` stay `off` (today `biome.json` turns it off for the whole project; `src/` has no such use, `tests/main/file-system.test.ts:73-75` does), be turned on, or should tests be recorded as exempt in `TYPESCRIPT_STRICT.md` (RR-R49-02)?
4. **RR-R49-03:** the 8 a11y warnings (click-only divs, labels without controls). This is a UX/a11y change that needs reference-first work. It joins the Q9–Q24 group.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| — (none in the repository) | BLOCKED round |

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R50-0 | `git rev-parse HEAD`; `git status --porcelain --untracked-files=all` | HEAD a849d29 (or the release exception), output empty. No feature acceptance runs: TM-T2-DATA and TM-T2 stay blocked until Q7 is answered. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud").

## What could break (C re-checks)
- Nothing. No change is allowed.

## Process note for later rounds (B-R49-01)
- The contract cross-check `tests/contract/check-ffprobe-tags.ts` runs in check.yml order: `npm run check` → contract cross-check → E2E. Playwright clears `test-results/` when it runs, so after E2E the contract WAV is gone.

## Next (orientation only)
- Q7 answered → TM-T2-DATA intake (T2-7). Then TM-T2 stage 1: the `searchUcs` / `isUcsCatId` pure functions with tests T2-1 and T2-2. Then the combobox UI and E2E (T2-3..T2-6, regression isDirty/skipSyncRef, bundle < 100 KB).
