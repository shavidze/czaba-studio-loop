# A round 328 — PERF-DRAG-PREVIEW stage b fix-up (C-R327-01, C-R327-02)

No STOP. Every A row below was run. No browser or perf row was run: per the task, C runs those.

**Pre-flight** (written in the session before editing):
- Assumptions: B's patch applies cleanly; behaviour is held to HEAD.
- Scope: the 3 granted files; no abstractions added.
- Success: the §2.1 rows.

**§1.8 delta:** DP17–DP19 differ from `b-round-327/sketch/drag-preview-render.test.tsx.txt` only by strengthening, which §1.8 allows. No assertion was removed, and the `expect(` count went from 135 to 137. `run-mutants.sh` mutates the context, not the test, so the mutants ran against the strengthened test file (`mutants-a-final.txt`).

## Changed files (this round)
Only the three files in the grant (A-SCOPE):
- `app/contexts/ArrangementContext.tsx`: `git apply b-round-327/sketch/sketch.patch.txt`, nothing else. `git apply -R --check --include=<ctx>` on the patch passes, so the file equals the sketch exactly.
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: DP17–DP19 from the patch. After the code-reviewer, A strengthened them; nothing was weakened:
  - DP18: the MutationObserver now also records `characterData` changes. Its callback is a named `collect`, which also processes `observer.takeRecords()` before `disconnect()`. There is a new assert `getStatusPreviewText()` → `null` after the timer write.
  - DP18: `globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }` was a type assertion (banned by CLAUDE.md). It is replaced by `vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false)` and then `vi.stubGlobal(…, true)` in `finally`. The file's `afterEach` `vi.unstubAllGlobals()` restores the original. `unstubAllGlobals` is deliberately not called mid-test, because it would drop the AudioContext/ResizeObserver stubs.
  - DP19: new assert after release: footer = `fadeCommitted('Fade In', '2.000')`.
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (§1.9):
  - l.4 is exact.
  - The 7 headings are in order.
  - Items 15–17 are new (adopt-once flush, layout-effect clear, same-text guard); Budgets is renumbered to 18. Item 10's outdated "flush clears the store" sentence is corrected.
  - Mermaid: the guard and adopt branches were added.
  - New Problem → Solution entry for C-R327-01/02. It states the sync clear happened before the reducer commit, and that MU-SYNC-CLEAR is green in jsdom, so the bug's row is the browser probe SETTLE-REMOUNT.
  - DP17–DP19 testing bullet. The doc cites only DP/SP ids that exist.

## Rows
| Row | Result |
|---|---|
| A-CLAIMS | PASS: output byte-equal to `b-round-327/claims-328-planning-output.txt` (`a-round-328/claims-before.txt`) |
| A-IMPL | PASS: the patch applied cleanly; §1.9 done by hand |
| A-CLAIMS-AFTER | PASS. `a-round-328/claims-after.txt`: K3 `0 1`, K4 `1 1`, K5 `1 1`, K6 `1`, **K10 `137 21 3`** (+2 `expect(` from A's strengthening, which the task allows), K11 the new l.4, K2 `234ccdd 11`, K8 11. All other lines are the planning values. Diff vs the sketch output: only K2, K8, K11 (by design) and K10 (+2) |
| A-SCOPE | PASS: `sha256sum -c` fails only for the three granted files; `git status` has 11 entries |
| A-TYPE / A-LINT | PASS: `npm run typecheck` rc 0; `npm run lint` rc 0; Biome warnings for `app/lib/arrangement app/contexts app/components/arrangement` = **15**; `useExhaustiveDependencies` in the context = 0. `biome check` on the two code files is clean |
| A-UNIT | PASS: 13 files, 239/239 (`a-round-328/unit-13.log`). The slowest test is VU4 at 1589 ms against the default 5000 ms (32 %). None is above 50 % |
| A-MUTANT | PASS. Scratch `/home/runner/a328-scratch`; final run `a-round-328/mutants-a-final.txt`, first run `mutants-a.txt`:<ul><li>MU-SYNC-CLEAR green 24/24 (expected, recorded).</li><li>MU-NO-SAME-TEXT-GUARD red on DP17.</li><li>MU-READOPT red on DP19.</li><li>MU-NO-LAYOUT-CLEAR red on DP9a, DP12, DP14, DP15, DP16, DP17, DP18, DP19.</li><li>Restored: 24/24 green.</li></ul> |
| A-REVIEW | Done (code-reviewer, 8/10, no Critical). Findings and how they were handled are below |

## Code-reviewer findings
- **Medium, the type assertion in DP18:** fixed (see above).
- **Medium, "MU-SYNC-CLEAR should be red on DP18":** this was the reviewer's reasoning; it could not run tests. A's real runs show MU-SYNC-CLEAR **green** (24/24) twice, which agrees with B's `mutants-summary.txt`. The doc sentence stays as written.
- **Low, DP18 records only childList / no takeRecords / no getter check:** strengthened.
- **Low, DP19 has no assert after release:** added.
- **Low, mermaid draws the guard and the lastNonRefusal write as unconditional; item 15 omits the refusal condition:** both corrected in the doc.
- **Low, "probe and mutant ids exist nowhere":** a false negative, because they live in `b-round-327/run-mutants.sh` and `probe-settle-remount.mjs`. The doc now points to the mutant script and to A's run file.
- **Low, not fixed, for B: A-R328-REVIEW-SAME-TEXT-RACE.** The trigger is a non-sync committed `setStatus('X')` that adopts preview N. Before its commit, a pointermove calls `previewStatus('X')`. `pending` is still non-null, so the same-text guard is skipped and `showPreview('X')` writes N+1. N+1 is not cleared, so the footer remounts the same text once and `aria-live` announces it twice. The reviewer calls it rare: it needs a timer write and an input event within one default-lane window. A proper fix needs the text queued for commit, which would change §1.4, so A did not do it (L11). Neither A nor the reviewer reproduced it in a browser.
- **DP17 note:** its first block, the identity write inside `act`, would also pass on round-327 code. The guard is the 80.01 same-value move; MU-NO-SAME-TEXT-GUARD shows it red. No change.

## Architecture note (for B, not acted on)
- The reviewer suggests keeping the clear in the provider: it is tied to the `statusEntry` commit.
- The status-preview region (ArrangementContext ~l.727–794) has been reworked in 2 consecutive rounds (327, 328). If a third round touches it, B could consider one bounded task: extract a `useArrangementStatus(statusPreviewStore)` hook (reducer + flush + previewStatus + clear effect), with identical `setStatus`/`previewStatus`/`getStatusPreviewText`/`statusKey` behaviour and DP9a–DP19 and SP1–SP3 unchanged.
- This adds to A-R327-ARCH-STATUS-ONE-SOURCE (D-29z942).

## Known gaps
- C-R327-01 is browser-only. jsdom cannot reproduce it (MU-SYNC-CLEAR green). A ran no browser, so C-R327-01/02 are **not** shown closed until C's SETTLE-REMOUNT.
- No perf run by A.
- The A-R328-REVIEW-SAME-TEXT-RACE hypothesis above is unverified.

## Exact next C checks
1. `bash b-round-327/claims-328.sh`. Expect `a-round-328/claims-after.txt`, with K10 `137 21 3`.
2. SOURCE-SCOPE: `sha256sum -c b-round-327/tree-327-sha256.txt` from `store/` fails only for the 3 granted files; 11 status entries; protected files 11/11.
3. UNIT ×3 (`drag-preview-render`, `status-preview-store`). MUTANT via `run-mutants.sh` on C's own scratch, plus C's own mutant.
4. SETTLE-REMOUNT ×3 at both viewports against A's tree (:5173) and HEAD on a second server with its own `cacheDir`. Then REFUSAL-MID-DRAG, the B-FADE-* rows, B-VIDEO-FADE, B-FADE-EXPORT sha, PERF alone after a warm-up (record the stopped and playing `release-commits`), G328-AUTH and DOCS.
5. Optional probe of A-R328-REVIEW-SAME-TEXT-RACE (a timer `setStatus(sameText)` together with a pointermove in the same frame).

## Scope completed
Round 328's A rows (§2.1) only. PERF-DRAG-PREVIEW is not complete: stage b awaits C, and stage c remains. A does not mark any backlog item done.
