# A round 404: SYS-R385-LEAF-ACTIONS-CONTEXT stage 1

**Note for B at the top (not a STOP):** the A5 code-reviewer reported one **Medium about test strength**: A-R404-REVIEW-AC1-COVERAGE. It is in the dispatched test file `actions-context.test.tsx`, not in the patch logic. Under the reviewed = dispatched rule (D-29z1392, L58) I did not edit the 8 patch files. The finding is recorded in doc 258 TODO and below. B decides whether it goes into stage 2 or a re-dispatch. Because of this, A5 does **not** fully pass ("no Medium").

**For C row 7:** after the review I edited only doc 258: the context paragraph, the approach paragraph (the `collection` precondition, checked in the code: `ensureDecoded` l.1580, `startPlaybackAt` l.1836, `startLibraryPreview` l.1991 and `addSourceToActiveTrack` l.2210 have `collection` in their deps; `togglePlayback` depends on `startPlaybackAt`), and the TODO reviewer list. I also added a verbatim `summary.txt` block; `diff` against `b-round-403/mutants/summary.txt` is empty. The AC table and the mutant table rows are unchanged. After the last edit, l.4 is still byte-exact and the 7 headings are still in order (re-checked).

## Scope completed
- Applied patch `b-round-403/sketch-404.patch.txt` (sha256 `9c0cdbc99e9e0b1c05274d8ff2c7477a15d8e859a397545d0f89ec82d641d8ef`) byte-for-byte: `git apply --check` rc 0, then `git apply` rc 0. No edits after that.
- Wrote doc 258. After review I edited only doc 258.

## Changed files (`git status --short --untracked-files=all`: 7 M + 2 ??)
- M `app/contexts/ArrangementContext.tsx` (patch)
- M `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementLibrary.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementMaster.tsx`, `ArrangementTransport.tsx` (patch)
- ?? `app/lib/arrangement/__tests__/actions-context.test.tsx` (patch, new)
- ?? `docs/implementation/2026/quarter-IV/258-sys-arrangement-actions-context.md` (A)

## Checks (actually run)
| # | Result | Evidence |
|---|---|---|
| A1 | Start claims rc 0; they equal `claims-404-planning-output.txt` byte for byte; stderr 0 bytes | `a-round-404/claims-start.txt`, `claims-start-stderr.txt` |
| A2 | `npm run typecheck` rc 0; `npm run lint` rc 0; `npx biome check` on the 8 patch files rc 0 ("Checked 8 files… No fixes applied") | `a-round-404/typecheck.log`, `lint.log`, `biome.log` |
| A3 | `npx vitest run` on the 6 files: 6 files / 83 tests passed, rc 0 | `a-round-404/vitest-a3.log` |
| A3 L31 | The slowest test is render-budget "does not re-render clips, overview bars, library rows or ruler ticks over Play → Stop → Play": A 2223 ms, gate-403 `verify.log` 2745 ms, timeout 15 000 ms (18 %). The next is SS8a: A 1541 ms, gate 2365 ms, timeout 20 000 ms. master-ui footer: gate 1934 ms, describe timeout 15 000 ms. None is above 50 % | `vitest-a3.log`, `gates/round-403/verify.log` |
| A4 | End claims rc 0, stderr 0 bytes. They differ from planning only on K2 (status-lines 9), K5 (applies-on-tree no), K6 (doc258-free 1, in-progress stage docs 7 → 8), K8, K9 and K10. K8–K10 equal `claims-404-sketch-output.txt`. Frozen 1,290 `sha256sum -c` rc 0 | `a-round-404/claims-end.txt`, `claims-end-vs-planning.diff` |
| A5 | `code-reviewer` subagent, run for real: 0 Critical, 0 High, 2 Medium (1 test, 1 doc), 4 Low; score 8/10. Dispositions below | this file |
| Doc | l.4 byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 404 PASS)`. The 7 TEMPLATE headings appear in order (`diff` of the `^## ` lists is empty). The mutant table copies the 10 rows of `mutants/summary.txt`. The AC table names AC1–AC6, and each row exists in the test file (`it('AC1 …` … `it('AC6 …`) | doc 258 |

Not run by A (gate rows, per the speed rules): full vitest, `npm run verify`, build, and the perf interactions spec (C row 5). No browser was used.

## Reviewer findings and dispositions
- **Medium, test (A-R404-REVIEW-AC1-COVERAGE).** AC1 never changes `selectedSourceId` or `sourceStates` (the fixture has one source and `selectSource` is a no-op). A future dependency on that state would not turn AC1 red. **Not edited** (reviewed = dispatched). The doc's claim was narrowed to what AC1 really covers, and the finding is listed in the doc TODO. **For B:** stage 2 or a follow-up adds a second source plus `selectSource` and `loadSource` resolution, and asserts `toBe(actions)`.
- **Medium, doc.** The "never replaced" wording ignored the `collection` prop precondition. **Fixed in doc 258:** the precondition and the dependent callbacks are named, and the only mount passes a module constant (`studio-lab.tsx`).
- **Low, doc.** The bundle hooks already memoized field by field, so the gain is the pin, the narrow types and one memo, not new runtime stability. **Fixed in doc 258** (§კონტექსტი).
- **Low, test (A-R404-REVIEW-AC2-ALL-KEYS).** AC2 checks `toBe` on only 4 of the 34 keys. Recorded in the doc TODO, not edited.
- **Low (A-R404-REVIEW-LIBRARY-PARAM).** The `useArrangementLibraryActions` parameter is still named `workspace`. Recorded, not edited (outside the patch).
- **Low, test placement.** AC4 and AC5 cover other gates, and the AC5 comment strip can swallow code after a `/*` inside a string. This is the existing deferred TL-R403-SK2-L3.
- **Architecture note (for B/root, proposal only).** The 34 names now sit in 3 lists in `ArrangementContext.tsx` (Pick, memo object, deps) plus the 5 leaf Pick types, so adding one leaf action costs 4 edits. Reviewer verdict: **keep**. There is one owner, `exhaustive-deps` guards the list, and deriving the keys from the leaf types would invert the dependency. This is the same as TL-R403-SK-L1.

## B acceptance criteria truly passed by A
- §3 steps 1–4: done.
- A1, A2, A3 (including L31), A4: pass.
- A5: 0 Critical/High, and no Medium in the patch logic. **One test-strength Medium remains open** (see top), so A5 is not a clean pass.

## Known gaps
- No browser or perf check by A. C rows 3, 4 and 5 are untested by A.
- The open test-strength Medium and Lows are listed above.

## Exact next C checks
- Row 1/8: claims start and end against the A4 delta; status = 9 granted paths; frozen 1,290 and protected rc 0.
- Row 2: patch identity of the 8 files against `sketch-404.patch.txt`.
- Rows 3 and 4: browser at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab` (already running).
- Row 5: the interactions perf spec, run alone.
- Row 6: mutants on `/tmp/c404-scratch` with C's own `OUT`.
- Row 7: doc 258. l.4, headings, mutant table, AC table. Doc 258 was edited after review (the context paragraph, the approach paragraph, and the TODO reviewer list); the mutant and AC tables are unchanged.
