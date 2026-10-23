# A — Round 99 report: one held Enter adds exactly one clip (+ doc 086 status)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-23 · Task: `current-task.md` (round 99, D-29z64). Nothing was committed or pushed. No server was started or stopped (I used the existing :5173).

## Baseline (checked before the first edit)
- HEAD `736db33c339bcef4757535d60524c2f92d7e6587`. `git status --short` was empty.
- Frozen list `b-round-98-r99-tree-sha256.txt`: 528/528 OK, at the start and at the end.
- All four owned files matched the snapshot prefixes (`a2b6f78d`, `1270f6c5`, `c6efc0ef`, `524d9b22`).

## Changes (end state: 4 M + 2 ??)
| File | Change | end sha256 |
|---|---|---|
| `app/components/arrangement/ArrangementLibrary.tsx` | T1. In the row's Enter branch, `preventDefault` and `stopPropagation` still run on every Enter. `selectSource` and `addSourceToActiveTrack` now run only when `!event.repeat`. Hunk `@@ -245,2 +245,4`. | `32613fe16b2e2e91734f45c542db1ffd69f541595a18f93e5f4d68039dbf9fbc` |
| `app/components/arrangement/StudioWorkspace.tsx` | T2. In the global Enter branch, the condition and `preventDefault` are unchanged. `current.addSourceToActiveTrack()` now runs only when `!event.repeat`. Hunk `@@ -1967 +1967,3`. | `ac9c08150213ee456055edb72e17f79dd500c481875dafaf9e030157470d3796` |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | T3. ＋ დამატება gets an inline `onKeyDown`: on Enter with `event.repeat`, it calls `preventDefault()`. There is no stopPropagation, and onClick, disabled, className and the label are unchanged. Hunk `@@ -306,0 +307,5`. | `f074a9bb4cd12ecb8695ccbaab7f44c734a7b2299736b1c7cf15abd535b6737d` |
| `docs/implementation/2026/quarter-IV/086-studio-toolbar-export-hold-enter.md` | Only l.4 changed: `**სტატუსი:** C PASS (Round 98), გამოქვეყნდა 736db33 (D-29z63)`. | `f3208cf6de585a893fd7da4773eb6ab021985f7874533f6dca1e49f191d10e83` |
| `app/lib/arrangement/__tests__/held-enter-add.test.tsx` (new) | HA1–HA8. The real `StudioWorkspace` runs under `ArrangementProvider` with 3 ready demo sources. It has no `as`, no `as const` and no `@ts-`. | `b1d6ff96e36b0a6d68186dd99b3181029053756179931b946b0f42d980f26855` |
| `docs/implementation/2026/quarter-IV/087-studio-held-enter-single-add.md` (new) | Georgian implementation doc. Status: waiting for C (D-29z64). | `38cbeb221f5b6a7c3aa2ae03968c88131f805b6c65023ef48c95d77d2fc2a999` |

The hashes are also in `a-round-99/end-hashes.txt`. All six files are LF, CR=0. `git diff -U0` hunks fall only inside the allowed ranges.

## Browser reproduction (A's own check, Playwright Chromium 1280×720, B's probes copied to `a-round-99/tools/`)
| Path | Before (`repro-before.json`) | After (`repro-after.json`) |
|---|---|---|
| row (focus on `demo-middle-east`) | 0 → 3 | 0 → **1** |
| body via status click | 0 → 3 | 0 → **1** |
| body via JS blur | 0 → 3 | 0 → **1** |
| ＋ დამატება focused | 0 → 3 | 0 → **1** |
| held ArrowDown ×3 | middle-east → slow-rise | middle-east → slow-rise (unchanged) |

In every hold run the recorder logged one `repeat=false` keydown and two `repeat=true` keydowns on the expected target. There were 0 pageerrors.

Status text after the change: `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.`

## Commands run and results
- `npm run typecheck`: exit 0 (`a-round-99/typecheck.log`).
- `npm run lint`: exit 0. The 218 warnings are repository-wide; the owned files have none (`lint.log`).
- `npx biome check` on the 3 components and the new test (read-only): exit 0, no diagnostics (`biome-check-owned.txt`).
- `npx vitest run app/lib/arrangement/__tests__/held-enter-add.test.tsx`: 8/8 pass.
- `npx vitest run $(cat a-round-99/targeted-list.txt)`: **55 files, 969 tests, all pass** (`targeted-vitest.log`).
  - The list comes from the §2 grep. It includes the new file, render-budget, library-preview, collection-load-status, purchased-collection-ui, failed-source-refusal and pending-status.
- I did not run the full suite or `npm run verify`; those belong to the gate.

## Fail-before and mutations (scratch `a-round-99/mut/`, Vitest cacheDir in scratch, script `run-mutations.py`, results `mutation-results.json`)
| Run | Red tests |
|---|---|
| fail-before (baseline snapshots) | **HA1, HA3, HA5, HA8**. This matches B's expectation; HA2, HA4, HA6 and HA7 are green. |
| a: remove the row guard | HA1, HA8 |
| b: remove the global guard | HA3 |
| c: remove the ＋ guard | HA5 |
| d: global never adds | HA3, HA4 |
| e: row never adds | HA1, HA2, HA8 |
| f: ＋ guard without the key check | HA6 |
| g: ＋ guard with stopPropagation | HA6 |
| h: row skips every repeated key | HA1, HA7 |
| unmutated control | none (8/8) |

Note: in my first HA6 draft, the propagation listener also asserted `defaultPrevented`. That made HA6 red at baseline as well, together with c. I narrowed it to "receives `q` and the repeated Enter", which follows the round-98 TH4 precedent; `preventDefault` stays covered by HA5. The table above is from the final file.

`'q'` has no workspace shortcut at baseline. I checked: `shortcutLetter` branches handle only e/z/y/l/a/d/c/x/v/g/m/u, and `timelineNavigationKey` handles only +/-/z/x. No `'q'` or `KeyQ` appears in the arrangement components, lib or context.

## Code review (code-reviewer subagent, actually run): 9/10, no Critical or High
| Finding | Disposition |
|---|---|
| Low: ▶ მოუსმინე still toggles on a held Enter | Out of scope by the B decision. Doc 087 records it as `B-R98-H1-PREVIEW-TOGGLE-HOLD`. |
| Nit: `=== true` in ArrangementExportDialog.tsx | That code predates this round and the file is frozen. Already tracked as GATE97-S4. |
| Low: HA8 adds little on its own | Kept. It locks one Undo step for the row path, as §1 asks. |
| Nit: rAF stub id reuse and a no-op cancel | **Fixed**: counter ids, and `cancelAnimationFrame` now removes the queued frame. |
| Nit: readiness relies on 2 microtask ticks | **Fixed**: HA3, HA4 and HA6 now assert `draggable="true"` before acting. |
| Low: duplicated fake harness | Not refactored (outside ownership). It goes to B as the architecture note. |

After the fixes I re-ran the matrix, the new file and the targeted list; the results are identical.

**Architecture note (verbatim from code-reviewer):**
> Signal #3 (repeated expensive change): `app/lib/arrangement/__tests__/held-enter-add.test.tsx:17-90` and l.181-195 copy the audio/DOM fake harness for about the 60th time, so every Studio round pays for a copy-and-adjust (rAF behaviour already differs between files). Keep it for this round, since this is a test change with no production impact. Proposal for the planner, if they want it: one separate task to create a shared `__tests__/harness` module for the fakes and rAF queue, with acceptance criteria that existing tests stay green and behaviour doesn't change.

## B acceptance items A actually met
- T1, T2 and T3 are implemented as specified, inside the allowed line ranges.
- Doc 086 l.4 is updated and doc 087 is written.
- HA1–HA8 exist and pass. The fail-before list matches §1, and mutations a–h each turn their named tests red.
- typecheck, lint, owned-file Biome and the targeted list all pass.
- The code-reviewer was run and its findings are dispositioned.
- The end state is 4 M + 2 ??, the frozen list is 528/528, and `end-hashes.txt` is written.

The §3 C rows are **not** claimed. My browser runs are A's own repro, not C acceptance.

## Known gaps
- Browser evidence is Chromium only. Environments that send auto-repeat as `repeat=false` (VNC, some X11 setups, soft keyboards) remain the doc 085 boundary.
- ▶ მოუსმინე held Enter is unprobed (`B-R98-H1-PREVIEW-TOGGLE-HOLD`).
- I did not run a 1440×900 browser pass or the export, Space, CLOSE-HOLD or network rows; those are for C.

## Exact next C checks
HOLD-ROW, HOLD-BODY and HOLD-PLUS at 1280×720 and 1440×900. FRESH-ADD, HELD-ARROW-REG, SPACE-REG, CLOSE-HOLD-REG and EXPORT-REG at 1280. Then PX-NET, REG-HYD, G99-3 (the fake-Bearer sub-check is BLOCKED: backend unavailable in cloud), and AN-REVIEW (re-run mutations a, b, c and g; expect HA1+HA8, HA3, HA5, HA6). Then T99-TARGETED (`npx vitest run $(cat a-round-99/targeted-list.txt)`; expect 55 files and 969 tests) and SOURCE-UNCHANGED (compare with `a-round-99/end-hashes.txt`).
- Result data copy: a-round-99/result-summary.json (a-round-99-result.json may be overwritten by the runner's session output).
