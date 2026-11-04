STOP — needs B ruling on A-R327-REVIEW-SAME-TEXT-REMOUNT (§1.2.4 / §1.1 clause change)

# A round 327: PERF-DRAG-PREVIEW stage b (audio fade drag status preview)

The code-reviewer rated it Medium. A rates it Low: it is reachable only through a source load settling mid-drag or a second pointer. It is reproduced in jsdom and differs from HEAD (§4.2). Every fix changes a ruled clause, so under §5/L11 it is not applied. The tree is consistent and fully tested as B's sketch v3 + DP16. Everything else in this round passed (§3).

## 1. Scope completed
- §1.1–§1.8: B's sketch v3 (`b-round-326/sketch/sketch.patch.txt`) applied with `git apply` on HEAD `234ccdd`. It applied cleanly. Its test files are byte-equal to the `.txt` sketch files. I checked the diff against §1 item by item: the reducer and `adoptPreview`, the stable `setStatus` wrapper with `flushStatusPreview`, `previewStatus`, `getStatusPreviewText`, `statusKey`, the fade branch only in ArrangementClip, the lane pass-through, `ArrangementStatusTextInner` + `memo`, the six reads, the 5 budget rows, and the deps-array additions only.
- A strengthening (granted by §1.8): **DP16** in `drag-preview-render.test.tsx`. It covers the §1.6 stop-effect read: playback is stopped mid-fade while the committed status is a `playing-from` text, and the readout is not rewritten. It also passes on a HEAD copy without its getter assert (`a-round-327/head-parity-dp16.log`).
- §1.9: doc 232 rewritten for stage b, with l.4 exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 327 PASS)`, the 7 TEMPLATE headings in order, and every cited DP/SP id existing. Doc 168 gained one stage-b paragraph inside the granted block.

## 2. Changed files (11 = 9 modified + 2 new)
- `app/lib/arrangement/status-preview-store.ts` (new)
- `app/lib/arrangement/__tests__/status-preview-store.test.ts` (new)
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/ArrangementClip.tsx`
- `app/components/arrangement/ArrangementLane.tsx`
- `app/components/arrangement/StudioWorkspace.tsx`
- `app/components/arrangement/ArrangementMarkerRow.tsx`
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (sketch + DP16)
- `perf/budgets.interactions.json` (the 5 rows)
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`
- `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`

No protected file, `preview-store.ts`, `status-announcement.ts`, perf spec, package or config was touched.

## 3. Rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS. Before editing, the output was byte-equal to `claims-327-planning-output.txt` | `a-round-327/claims-before.txt` |
| A-CLAIMS-AFTER | PASS. Compared with `claims-327-sketch-output.txt`, only these differ: K2 `234ccdd 11`, K10 `120 18` (≥ 112/17; DP16 adds 8 expects and 1 row), K13 the new l.4, K18 `1 1`. Every other line equals the sketch output: K3 `1 1`, K4 `0 0`, K5 present, K6 `1 2`, K11 `5 12`, K12 `0`, K16 `11 7`, K17 `0 6`, K24 `3 2`, K25 `0 0 0 0` | `a-round-327/claims-after.txt` |
| A-TYPE | PASS, `npm run typecheck` rc 0 | `a-round-327/typecheck.log` |
| A-LINT | PASS, `npm run lint` rc 0. Biome warnings for `app/lib/arrangement app/contexts app/components/arrangement` = **15**. Scoped `biome check` on the 8 owned ts/tsx/json files: rc 0, no diagnostics. I first ordered DP16's import by hand wrongly; organizeImports flagged it and I fixed it manually, with no `--write` | `a-round-327/biome-owned.log`, `lint.log` |
| A-UNIT | PASS. The 13 files: **236/236** on the final tree (235 before DP16). The slowest test is 819 ms (VU4/LT11 range) against the 5000 ms default. Nothing is above 50 % | `a-round-327/unit-final.log`, `unit-files.txt` |
| A-MUTANT | PASS. B's 7 jsdom mutants, rerun on the scratch copy `/home/runner/a327-scratch` (never in `store/`). Each is red on its B row, and the restored file is green (18/18). With DP16, MU-STATUS-IN-PROVIDER also turns DP16 red, and so does MU-NO-FLUSH. A's own **MU-A-STOP-EFFECT-NO-GETTER** (`shownStatus = current.status`) is red on **DP16**. A's **MU-A-MARKER-NO-GETTER** stays **green**: jsdom cannot reach that read mid-drag, because every key during a pointer gesture is refused first ("Editing does not work while dragging — let go first.", seen in my first DP16 attempt). The nudge read is reached by key only, so the same reason applies | `a-round-327/mutants/mutants-summary.txt`, `run-mutants*.sh` |
| A-PERF | PASS. `perf/studio-lab-interactions.perf.spec.ts`, run **alone** on the final source tree, production build on :5188: rc 0, `failures` [], `complete: true`, 319528 ms. The table follows the evidence column | `a-round-327/perf-a-results/latest-interactions.json`, `perf-a-interactions.log` |
| A-REVIEW | Ran (code-reviewer subagent). Findings and the Architecture note are in §4 | this file |

A-PERF table (1× = 6×; HEAD = C round 325's run on `234ccdd`):

| Row | HEAD | A |
|---|---|---|
| fade stopped/playing `move-components-per-move` (assert ≤ 24) | 103.25 | **21.633** |
| fade stopped/playing `move-components-max` (assert ≤ 24) | 105 | **22** |
| fade playing `move-restarts` (assert == 0) | 0 | **0** |
| fade stopped `release-commits` | 1 | 2 (`releaseComponentsMax` 96) |
| fade playing `release-commits` | 1 | 1 (`releaseComponentsMax` 96) |
| trim/move/range rows (all) | — | equal to HEAD (trim 24.583/23, move 106.85/107, range 9.233/30) |

The harness reports only the release max. I did not measure that the second stopped commit renders 0 components on my tree; that figure is B's probe result.

## 4. code-reviewer findings (and what I did)
1. **Medium (reviewer, hypothesis): async-lane intermediate render.** Claim: when `setStatus` runs outside a React event, clearing the store (a SyncLane re-render through uSES) before the reducer dispatch (DefaultLane) could show the stale committed text once. **Not reproduced.** In jsdom with `IS_REACT_ACT_ENVIRONMENT=false`, a `setTimeout` `setStatus` mid-fade gives the same mutation records on A and on HEAD: `["-Fade In: 2.000 s","+Async write."]` (`a-round-327/probe/zz-a.log`, `zz-head.log`, rows `probe/zz-rows.tsx.txt`). Not fixed. Suggest C probe it in the browser: a status write from a timer or promise mid-fade, with a MutationObserver.
2. **A-R327-REVIEW-SAME-TEXT-REMOUNT, Low (reproduced; HEAD difference).** Mid-fade, an updater `setStatus` that returns the same text flushes the preview: it is adopted under the same key, so nothing remounts there, and the store is emptied. The next move with the same value then makes a new `preview-N+1` span with the same text, so the span remounts once and `aria-live` may repeat the identical text once. HEAD keeps the node. Repro ZZ2: `setInsertMarker(1)` mid-fade, then a move to 80.01. On A `sameAfterMove=false`, seq 1→2; on HEAD `sameAfterMove=true`, seq 2→2 (`probe/zz-a.log`, `zz-head.log`).
   - **Reachability by a user:** keys and other edits are refused mid-gesture. The remaining paths are a source load settling during a fade drag (`settledCollectionStatus` updater, startup only) and a second pointer. The playback end-stop writes no status.
   - **Not fixed (STOP).** Where the remount happens: (i) preview `{T, seq 1}`, key `preview-1`; (ii) the same-text updater flushes and adopts under `preview-1`, so there is no remount, and the store is emptied; (iii) the next same-value move makes `showPreview(T)` write `{T, seq 2}` → key `preview-2` → **remount**. A change to the adopt branch acts on (ii) and cannot fix (iii), because at (ii) the adopted text differs from the committed text. Options for B:
     - **(a)** defer as Low (`deferred_low_polish`), with ZZ2 as the repro.
     - **(b)** a §1.2.4 change: `previewStatus` skips `showPreview` when the store is empty **and** `text` equals the committed status text. Use a ref updated in the existing layout effect that tracks `status`, not a render-time assignment and not the adopted text. Tried on the scratch only, with a render-time ref, and then restored: ZZ2 gives `sameAfterMove=true`, and `drag-preview-render`, `status-announcement-ui`, `clip-fades-ui` and `status-lifetime` are 93/93 green (`a-round-327/probe/option-b-scratch.log`). Row: ZZ2 as DP17. Mutant: remove the guard → DP17 red.
3. **Low (reviewer): `ArrangementContext.tsx` settle writes `lastNonRefusalStatusRef` before `setStatus`, and the flush then overwrites it.** The final outcome equals HEAD, because HEAD's layout effect also tracked the preview text. It depends on ordering. Not fixed: that line is outside §1.2's listed changes.
4. **Low (reviewer): make `previewStatus` required on the clip.** Not applied: §1.3 rules it optional, as with `previewClipGeometry` for `gesture-reentry.test.tsx`.

**Architecture note (verbatim intent, for B/root):** signal 4 (new state and lifecycle in an existing owner) at `ArrangementContext.tsx` (a fourth per-provider store and an ordering rule between it and the reducer); signal 3 (docs 168 and 232 keep reshaping the status region). Keep it for now: it is one lifecycle, and extracting it would change `useArrangement()`'s shape. Proposal: one bounded task that moves the committed status entry into the status store, so the footer and the getter read one source and findings 1–2 cannot happen by construction. This adds to checkpoint request D-29z915.

## 5. Known gaps
- No browser row was run by A. All B-FADE-* rows, the export sha and G327-AUTH are C's.
- The second stopped release commit at 0 components is not re-measured on A's tree (the harness reports only the max of 96).
- The §1.6 marker-row ×3 and nudge reads have no jsdom row that can go red: keys are refused mid-gesture, so no user path is known. The stop-effect read is pinned by DP16.

## 6. Exact next C checks
1. `bash b-round-326/claims-327.sh`. Expect A-CLAIMS-AFTER as in §3: K10 is `120 18`, which satisfies ≥ 112/17.
2. SOURCE-SCOPE: 11 entries as in §2.
3. UNIT ×3 on C's scratch: `drag-preview-render` (18 rows incl. DP16) and `status-preview-store`.
4. MUTANT: MU-FADE-PROVIDER → DP9a; MU-NO-FLUSH → DP9a, DP11, DP12, DP14, DP15 (and DP16 on A's tree); C's own mutant.
5. PERF alone after a browser warm-up. Compare with `a-round-327/perf-a-results/latest-interactions.json`.
6. Browser: B-FADE-STATUS, B-FADE-CANCEL, B-FADE-END-STOP, B-FADE-PLAYING, B-FADE-EXPORT, B-VIDEO-FADE, G327-AUTH. Also probe reviewer finding 1 (a timer or promise status write mid-fade; count added spans on A vs HEAD). If possible, probe finding 2 by dragging a fade while a source is still loading.
7. DOCS: doc 232 l.4 byte-equal; headings; cited ids (DP1–DP16, DP5b, DP8a/8b, DP9a/9b, SP1–SP3 all exist); doc 168's stage-b numbers equal §3.

## 7. Acceptance status (A's rows only)
A-CLAIMS ✔, A-IMPL ✔ (§1.1–§1.9), A-CLAIMS-AFTER ✔, A-TYPE ✔, A-LINT ✔, A-UNIT ✔, A-MUTANT ✔ (with the marker-read mutant reported as unreachable in jsdom), A-PERF ✔, A-REVIEW: ran; finding 2 is open, STOP. The backlog item is not complete: stage c remains, and C has not verified this round.

## Pre-flight (as posted)
- Assumptions: the task is B's sketch v3 applied to HEAD `234ccdd`; the docs were not sketched.
- Smallest version: apply the patch, review it against §1, write the docs.
- Files: the 11 granted files only.
- Success: claims deltas as allowed; typecheck/lint rc 0; 13 files green; mutants red; perf `failures` [].
