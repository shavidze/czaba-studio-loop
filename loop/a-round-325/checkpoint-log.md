# A round 325 — checkpoint (in progress)

- A-CLAIMS: `bash b-round-324/claims-325.sh` output equals `claims-325-planning-output.txt` (saved `a-round-325/claims-before.txt`).
- Next: pre-flight, read source, implement §1/§2.
- Step 1 done: `app/lib/arrangement/preview-store.ts` (new) and context (`previewClipGeometry`, clear in `updateHistory`, convergence in `beginPointerGesture` release via `publishedHistoryRef`, `ArrangementPreviewContext`, `useArrangementPreviewStore`, `useArrangementPreview`). Next: Clip call sites, Lane, Workspace, Transport.
- Step 2 done: Clip (2 call sites via `previewGeometry`, optional prop so `gesture-reentry.test.tsx` stays untouched), Lane (`clips` from preview via `useShallow`), Workspace (readout, detail, new `ArrangementOverviewWithPreviewInner`, live `projectEnd`), Transport (live `projectEnd`). typecheck rc 0. Next: tests DP1–DP9, covering set, mutants, perf.
- Step 3: tests written: preview-store.test.ts (4) and drag-preview-render.test.tsx (9) pass. Next: covering set, mutants, perf, names, docs.
- Step 4: covering set 54 files pass after P1 rewrites in grid-snap-ui (3 lines), grid-snap-edit (3), gesture-guard (2); expect counts equal. Next: perf/report test, mutants, perf builds, names probe, docs, budgets, review.
- Step 5: perf report unit 34/34; budgets 2 rows asserted (K15 48 46); mutants 7/7 red on named rows, restored 13/13 (a-round-325/mutants/). Next: lint/typecheck, code-reviewer, perf builds, names probe, docs.
- Step 6: docs 230/231 §5 done (K16 0 0); doc 232 drafted with PERF_NUMBERS_PENDING; code-reviewer running in background. Next: address review, then perf builds HEAD vs A + names probe, fill numbers in doc 232 + doc 168.
- Step 7: A-NAMES on :5173 (A tree): trim-moves per-commit [23,2,...], no forbidden names, ArrangementLane 1 per move commit; move-moves provider false but StudioWorkspace renders (end moves; stage c). Run 1 cold-start timeout at page load (L38, env-invalid, kept as note). Scratch trees /tmp/a325h (HEAD) and /tmp/a325a (A) prepared. Waiting for code-reviewer, then perf.
- Step 8: HEAD perf run started (/tmp/a325h, a-round-325/perf-driver.sh h). Claims-after preview: K2 15, K5 5, K7 Clip 5, K13 doc232, K15 48 46, K16 0 0, K17 present 1, K22 list +drag-preview-render.test.tsx (51 files).
- Step 9: review 1 done (no Critical/High; Medium perf = §1.5 ruled, report; Low 4c unmount split = conflicts §1.3, report to B). Test Lows fixed (DP2 pin, DP3 label, new DP5b mixed path; 10/10). HEAD perf rc 0 saved perf-h-results. A perf running; re-review of test edits running.
