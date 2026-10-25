# A round 156 — V-2b-3a sentence timecodes mono (D-29z121)

Status: A scope complete. The real code-reviewer ran and its Medium is addressed (see Code review). Awaiting C.

## Code review (real `code-reviewer` subagent, 8.5/10; full text in `a-round-156/code-review.md`)
- **Medium:** ST-TP1 compared the code with itself. Fixed by adding literal assertions inside the T1 describe. Re-run after the fix: 34 files 576/576, typecheck 0, lint 0 (218 warnings, unchanged), scoped Biome clean. m145 was **re-run after the fix** (`mutations/m145-rerun.json`) and the same 6 tests went red, ST-TP1 now on its literal array. The restore was verified against `end-sha256.txt`. `post-edit-sha256.txt` was refreshed to the final hashes.
- **Reviewer scope limit (stated by the reviewer):** it had no shell, so it read the current files and the new file rather than `git diff`, and it did not review doc 125.
- **Lows for B, not fixed (outside ownership or against the spec):**
  - TH11 is source-count only. The drop-ghost and VideoDock spans have no DOM class test; C's MONO-STYLE (c)/(f) cover them in the browser.
  - WSU3 prefix check: this is what the spec asks for.
  - Mono glyphs are wider, so badges may clip sooner → LAYOUT-FIT.
- **Pre-existing info:** the selected-clip `title` falls back to `sourceId`, but the visible line shows only `selectedTitle`.
- **Architecture note (verbatim, for B):** "Signal 3 (repeated costly change), `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx:408-481`: the theme test now keeps per-file class-string count tables, so every class tweak in the arrangement components means editing them. **Keep for now:** it's the established pattern in this file and it's cheap. If it keeps growing, the planner could schedule one bounded task to replace source counting with DOM assertions per site."

## End state
- `a-round-156/end-sha256.txt` (12 paths), `a-round-156/diff-vs-start.patch` (vs `b-round-155/r156-granted-start/`, plus the 2 new files in full), `git-status-end.txt` = 10 ` M` + 2 `??`.
- Frozen 963: OK at the end. Protected diff vs `4c07d5f` is empty, including `ArrangementExportDialog.tsx`, `studio-lab.tsx` and `app.css`.

## Pre-flight
- HEAD `4c07d5f`, `git status --short` empty at start, frozen 963 OK, 10 granted start hashes OK.
- Primitives/templates read: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT (does not apply: `ArrangementTimeText` renders a fragment, no element of its own → no ref target; `className`/`cn()` items of `prompts/new-component.md` skipped on purpose per C1 "no DOM wrapper"), prompts/new-component, TAILWIND_FIRST, DESIGN_TOKENS, AUDIO_ARCHITECTURE (no audio logic touched), GEORGIAN_DOCS, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, docs/implementation/TEMPLATE.md.

## Changed files (12 = 10 ` M` + 2 `??`)
| Row | File | Change |
|---|---|---|
| S1 | `app/lib/arrangement/strings.ts` | `StudioTimeTextPart`, `studioTimeTextParts {rangeReadout, selectedClipDetail}` (stable ids), non-exported `joinStudioTimeTextParts`; `studioWorkspaceStrings.rangeReadout` and `selectedClipDetailText` derive from the parts. 7 keys unchanged. |
| C1 | `app/components/arrangement/ArrangementTimeText.tsx` (new) | fragment; time part → `<span key className="font-mono font-normal tabular-nums">`, text part → keyed `Fragment`. |
| W1/W2 | `StudioWorkspace.tsx` | range readout + selected-clip detail via `ArrangementTimeText`; 2 imports; `title`, `{' '}`, all-lanes span, delete hint, `<p>` classes unchanged. |
| L1/L2 | `ArrangementLane.tsx` | drop-ghost start span; lane label min/max spans. N6 ghost untouched. |
| K1 | `ArrangementClip.tsx` | badge start/end spans. |
| V1 | `ArrangementVideoDock.tsx` | gap span gets the class; `ref` + imperative textContent unchanged. |
| T1 | `strings.test.ts` | appended describe ST-TP1..3 (+1 inserted import line in the `../strings` block; no existing line changed). |
| T2 | `studio-theme-obsidian.test.tsx` | TH11 appended. |
| T3 | `workspace-strings-ui.test.tsx` | WSU3–WSU5 appended (new describe + small helper); mount helper unchanged. |
| T4 | `clip-strings-ui.test.tsx` | CSU1: 2 mono-span assertions after the unchanged textContent assertion. |
| D1 | doc 125 | status line only. |
| D2 | doc 126 (new) | Georgian, TEMPLATE sections. |

Separator note (R5): Biome formatter required `·{' '}\n{seconds}` to be written as `· {seconds}` on L2/K1; rendered text is identical (verified by the unchanged CSU1 / delete-selection-ui l.520 / all-lane-clipboard textContent tests).

## Tests actually run
- Baseline: 34 files (`a-round-156/vitest-files.txt`), 569/569 → `vitest-baseline.json`.
- After: same 34 files, **576/576** → `vitest-after.json` (new: ST-TP1, ST-TP2, ST-TP3, TH11, WSU3, WSU4, WSU5; CSU1 extended). No previously green test changed status; none of B's listed neighbour tests turned red.
- `npm run typecheck` exit 0 (`typecheck.log`). `npm run lint` exit 0, 218 warnings / 1 info = identical to round 155 (`lint.log`). `npx biome check` on the 10 code/test files: clean (`biome-scoped.log`).
- Mutations (Edit → run → Edit restore → sha256 vs `post-edit-sha256.txt` OK), JSONs in `mutations/`:
  - m143 (no `font-normal` in ArrangementTimeText): red TH11, WSU3, WSU4. ✔
  - m144 (old string in W1): red TH11 (`<ArrangementTimeText` 1≠2), WSU3 mono count; WSU3 text prefix stayed green. ✔
  - m145 (`' — '`→`' - '`): red ST31, ST-TP1, ST-TP2, WSU3, all-lane-clipboard, detail-panel. ✔
  - m146 (no K1 end span): red CSU1 mono count (text assertion stayed green), TH11. ✔
- Not run by A (speed rules): full suite, verify, build, e2e, browser rows.

## Known gaps / notes for B
- ST-TP1's "joined parts == studioWorkspaceStrings" is equal by construction after S1 (both derive from the parts); the real byte lock is the literal anchors (ST31 l.1742–1758 and ST-TP1's literal), which m145 proved.
- Browser facts (computed Plex Mono 400, CDP platform font, layout fit, video gap during playback) are not verified by A.

## Exact next C checks
All §4 rows of the task: T156-TARGETED (re-run `a-round-156/vitest-files.txt`, expect 34 files 576/576), SOURCE-SCOPE (`a-round-156/end-sha256.txt`), AN-REVIEW (`a-round-156/diff-vs-start.patch`), TEXT-BYTES (a)–(f), MONO-STYLE-N7…N12, LAYOUT-FIT, PLEX500-INVENTORY-S, FUNC-SMOKE-S, G156-3, PX-NET/REG-HYD.

## B acceptance actually passed by A
A-side rows only: S1, C1, W1, W2, L1, L2, K1, V1, T1–T4, D1, D2 implemented; baseline/after vitest; typecheck; lint; scoped Biome; m143–m146 as specified. No browser/C row claimed.
