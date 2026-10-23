# A round 97: Export Lows part 1 (GATE90-S3 / GATE90-S4 / GATE96-S1)

Implementer: A (Claude Opus 5.5) · 2026-10-23 · task `current-task.md` (round 97, D-29z62)
Status: implementation done, code-reviewer run (9/10) and its findings addressed. **No commit, push or deploy.**

## Start state (checked before any edit)
- HEAD `ce440360062f16ee3db2e9795bf33b42c63abc23`, `git status --short` empty.
- `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-96-r97-tree-sha256.txt` → OK (526/526).
- Owned files matched the snapshots: dialog `0040e050…`, doc 084 `869f9238…`.

## Pre-flight (posted in chat before the first edit)
- Assumptions: E1 = an inline `onKeyDown` on Close that prevents only Enter+repeat. E2 = drop one token from Cancel. The tests mirror the `export-cancel-ui.test.tsx` mount pattern.
- Smallest version: ~5 lines plus one removed token in the component, one new test file, the doc 084 status line and the new doc 085.
- Files: dialog (E1/E2), new test (HE1–HE7), doc 084 l.4, doc 085. No other file.
- Success: the new test passes; fail-before is HE1/HE4/HE5/HE7 red on baseline; targeted vitest, typecheck, lint and scoped Biome are green.

## Pre-edit browser reproduction (optional row, done)
- Tool: `a-round-97/tools/repro.cjs`, a copy of C round 90 `lib90.cjs` with its OUT/SHOTS paths changed to `a-round-97/` (C's files were not edited). Playwright Chromium, fresh context, 1280×720, `/studio-lab` on :5173 (the server was not started or stopped).
- Steps: setup (3 demo clips + 3× Ctrl+D), WAV, mouse-click Export, focus Cancel, `keyboard.down('Enter')`, wait for focus on დახურვა, `keyboard.down('Enter')`, `keyboard.up('Enter')`.
- **Before (`a-round-97/repro-before.json`): reproduced.** The keydowns were `{repeat:false, active:გაუქმება}` and `{repeat:true, active:დახურვა}`. After the first one: status `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.`, focus on დახურვა. After the repeat: **dialog closed** (`open:false`), focus on the toolbar `Export`. 0 downloads in 10 s, 0 errors, 0 forbidden requests, 0 Authorization headers.
- Note: `labelAtEnter` was `null`. Cancel was pressed before the first progress label was painted, so the phase was rendering (Cancel exists only while rendering), but no percentage was recorded.
- **After the edit (`a-round-97/repro-after.json`, `shots/repro-after.png`):** the same keydowns (`repeat=true` on დახურვა). **Dialog still open**, status `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.`, focus on დახურვა, 0 downloads in 10 s, 0 errors / forbidden / auth.
- Gap: the after run overwrote the before screenshot (same file name). There is no before screenshot; the before JSON is intact. This is A's own check, not C acceptance.

## Changes
| File | State | end sha256 |
|---|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | M (576 lines, LF) | `cbee8cc6f5c816c70bbd8e2920a8ef60c0d8dc3732d27d5729dc8a9bb95ae71b` |
| `app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx` | ?? | `cd2b256299ec30ecd8faec202d55d1224c38c40460e3f290447853cc1649e856` |
| `docs/implementation/2026/quarter-IV/084-studio-failed-source-refusal-text.md` | M (l.4 only) | `8068fc1a52b70d336339016646afa18ffcee6668731bab17c0c868c33eceae4b` |
| `docs/implementation/2026/quarter-IV/085-studio-export-dialog-hold-enter.md` | ?? | `ae26a4f558e9500854dc2e79c3b90c5f2cb03c007b30a172238131219d376323` |

(`a-round-97/end-hashes.txt`.) The dialog diff (`git diff -U0`) has exactly two hunks:
- **E2** at l.532, inside the Cancel button: `disabled:opacity-40` removed; every other token is unchanged and in the same order.
- **E1** at l.541–545, inside the Close button: an inline `onKeyDown` that runs `if (event.key === 'Enter' && event.repeat === true) { event.preventDefault(); }`.

No new export, hook, state, ref, effect or module-level function. Focus effects, `handleClose`, the footer, the progress element, the status and the primary button are untouched. `export-cancel.ts` and `export-cancel.test.ts` were not edited (GATE90-S5 is recorded in doc 085 as B's decision).
- Doc 084 l.4 now reads `**სტატუსი:** C PASS (Round 96), გამოქვეყნდა ce44036 (D-29z61)`.
- Doc 085 records the approach, the rejected alternatives, that doc 078's class note is superseded for the `disabled:` token, and the GATE90-S5 decision. Its status line is `Round 97 — C-ის შემოწმებას ელოდება (D-29z62)`.

End state: `git status --short` = 2 M + 2 ?? exactly. The frozen list is still 526/526 OK.

## Tests (new file, HE1–HE7)
Pattern copied from `export-cancel-ui.test.tsx`, with nothing imported from a test file: provider + dialog host, a pending `renderArrangementWav`, and a mocked encoder module. Buttons are found by role and name; the result of `fireEvent.keyDown` is asserted; strings use exact `toBe`. There are no `as` assertions. `afterEach` runs `unstubAllGlobals` and `restoreAllMocks`, and restores the saved `URL.createObjectURL`/`revokeObjectURL` descriptors (or deletes them if they were absent). This came from a review fix. `onClose` is a `vi.fn` wrapped by the host, which also closes the dialog.

**Fail-before** (scratch `a-round-97/mut/`, own `cacheDir`; the new test was run against the baseline snapshot `b-round-96-r97-snapshots/ArrangementExportDialog.tsx`): red **HE1, HE4, HE5, HE7**; green HE2, HE3, HE6. **This matches B's expectation exactly.**
- Explained difference during development: the first draft of HE6 also asserted `fireEvent.keyDown(...) === false` and `defaultPrevented`, so it was red on baseline.
- B defines HE6 as a propagation-only lock, so those two assertions were removed from HE6. HE1/HE4/HE7 still cover the prevention.
- The numbers above are from the final file.

**Mutations** (`a-round-97/run-mutations.py`, results in `mutation-results.json` / `mutations.log`, final file):
| mut | change | red |
|---|---|---|
| a | remove `preventDefault` (guard) | HE1, HE4, HE7 |
| b | drop the `repeat` check | HE2, HE4 |
| c | drop the `key` check | HE3 |
| d | add `stopPropagation()` | HE6 |
| e | put `disabled:opacity-40` back on Cancel | HE5 |
| f | remove `disabled:opacity-40` from Close | HE5 |
| control | unmutated | 0 red, 7/7 pass |

## Commands run (in `store/`, final state)
- `npx vitest run $(cat ../tmp/studio-real-loop/a-round-97/targeted-list.txt)` → **14 files, 154 tests, all pass** (`a-round-97/targeted-vitest.log`).
  - The 14 files are the 10 named in the task plus the grep hits `master-ui`, `meter-ui`, `track-group-mix-ui` and `video-fades-ui` (`grep -rlE "ArrangementExportDialog|arrangement-export-cancel|დახურვა"` over `*.test.ts(x)` under `app/`).
- `npm run typecheck` → exit 0 (`typecheck.log`).
- `npm run lint` → exit 0: 218 warnings and 1 info, identical to `a-round-96/lint.log` (218 / 1), so there is no new diagnostic; `lint.log`.
- `npx biome check <dialog> <new test>` → exit 0, "Checked 2 files … No fixes applied" (`biome-check-owned.txt`).
  - The first run flagged formatting in the new test. I formatted it with `npx biome format --stdin-file-path=… < file > /tmp/he.fmt` and copied the result over my own new file. I never used `--write`.
- No full suite and no `npm run verify` (speed rules; these belong to the gate).

## Code review (actual `code-reviewer` subagent, read-only)
Score **9/10**: 0 Critical, 0 High, 0 Medium, 4 Low, 5 Nit. The reviewer had no shell and reviewed the file contents. A ran the `git diff -U0` / status check itself; results are above.

| Finding | Severity | Disposition |
|---|---|---|
| Browser evidence is Chromium only | Low | **To C/B.** Only Chromium is installed in the cloud and A may not install. Doc 085 now says "მხოლოდ Chromium". Suggest a non-Chromium HOLD-ENTER check when an environment has one. |
| Some environments send auto-repeat as `repeat=false` (VNC/remote desktop, some X11, soft keyboards), which the guard cannot see | Low | **Fixed (doc):** doc 085 records it as a deliberate boundary. |
| `Object.defineProperty(URL, …)` stubs are not restored in afterEach | Low | **Fixed:** descriptors are saved in beforeEach and restored or deleted in afterEach. The same pattern in 8 sibling files is outside ownership; see the Architecture note. |
| Doc 085 points at loop-folder files for results | Low | **Fixed:** the results (14 files / 154 tests, typecheck, lint, Biome) are now stated in doc 085, which also says the loop folder is not part of the repo. |
| `event.repeat === true` is redundant | Nit | **Kept:** the task wording requires `event.repeat === true`. |
| `vi.useRealTimers()` is a no-op | Nit | **Fixed:** removed. |
| `PendingRender.options` is unused | Nit | **Fixed:** removed, along with the unused `ArrangementRenderOptions` import. |
| HE2's title overstates the click | Nit | **Fixed:** the title now says jsdom sends no click and the click is explicit. |
| Doc 085 "სხვა ღილაკი" is ambiguous | Nit | **Fixed:** changed to "სხვა კლავიში". |

After the fixes, A re-ran everything: the new test 7/7; fail-before and mutations (same red lists as the table above; control 7/7); targeted 14 files / 154 tests; typecheck exit 0; lint exit 0 (218/1); scoped Biome exit 0 (formatted via stdin, no `--write`); hashes regenerated last.

**Architecture note (verbatim, for B):**
> Keep the component as is: the guard is a one-line inline handler with no new state, ref or effect, and it fits the dialog's existing focus logic. One structural signal (#3, repeated expensive change) is in the tests: the same fake AudioContext, encoder mock and `URL.createObjectURL` setup is now copied into 9 `__tests__/*-ui`/`export-*` files, and each round copies it again. Proposal for the planner: one scoped task to move this into a shared non-test helper module (for example under `app/test-utils/`) with matching setup and restore functions, which keeps the "no imports from other test files" rule and also fixes the restore gap.

This is a proposal only. A did not extract anything outside ownership.

## Known gaps
- C has not verified the browser acceptance yet. A's own repro covers only HOLD-ENTER at 1280 (WAV) before and after. HOLD-ENTER-MP3, FRESH-ENTER-CLOSES, OPEN-HOLD, SPACE-REG, CANCEL-CLASS (computed opacity), CX-REG, DONE-REG, ESC-REG and the 1440 viewport are unverified by A.
- There is no before screenshot (overwritten); the before JSON exists.

## Next C checks (exact)
1. SOURCE-UNCHANGED: HEAD `ce44036`; 2 M + 2 ??; `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-96-r97-tree-sha256.txt` 526/526; `sha256sum -c ../tmp/studio-real-loop/a-round-97/end-hashes.txt`. The `git diff -U0` dialog hunks are only at l.532 (Cancel) and l.541–545 (Close); doc 084 is only at l.4.
2. HOLD-ENTER at 1280 and 1440, HOLD-ENTER-MP3 at 1440, FRESH-ENTER-CLOSES (Enter press + mouse click), OPEN-HOLD at 1280, SPACE-REG at 1280, CANCEL-CLASS (Close computed opacity 0.4 while rendering → 1 after cancel), CX-REG, DONE-REG, ESC-REG, PX-NET, REG-HYD, G97-3 (fake-Bearer BLOCKED).
   - `a-round-97/tools/repro.cjs` is a usable starting point, with the paths in its `lib90.cjs` copy.
3. AN-REVIEW: re-run mutations a, b and e in C's own scratch. Expected: a → HE1/HE4/HE7, b → HE2/HE4, e → HE5.
4. T97-TARGETED: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-97/targeted-list.txt)` → 14 files / 154 tests.

## B acceptance criteria A truly passed
- E1 and E2 implemented within the allowed lines; nothing else in the dialog changed.
- New test HE1–HE7 green; fail-before list = B's list; all six mutations red as specified; control green.
- Doc 084 l.4 updated; doc 085 written.
- typecheck, lint and scoped Biome are clean; targeted vitest is green.
- End state is 2 M + 2 ??; frozen 526/526.
- The browser rows are **not** claimed: they are C's.
