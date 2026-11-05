# Sketch review — round 355 (SYS-R353-DP-TEST-POLISH), L58

Dispatched sketch sha256:
- test.patch.txt d9734f3272f31730468db729a11c09b3af1961e15fbfeef111d426fc7a0cdbdb
- drag-preview-render.test.sketch355.tsx 376b34d77065a5db77349cca5f97848c8a511cbda69a9db977829d38ad0429ba
- doc232.patch.txt 1333b368a973f648b8ac0a7bdb5a95a5684b1580bae44facad391ccc369185e0 (regenerated after the closing advisor check: the doc 232 TODO has one "next" line; both patches made with git diff on a fresh archive, patch-reproduce.txt BYTE-EQUAL-BOTH)

Reviewer: tech-lead (read-only), on sketch v1 (drag-preview-render.test.sketch355-v1.tsx). Result: **0 Medium+**.
- Caption removal in DP70 accepted (caption is '' in every DP70 state; DP64 covers the caption; the new gap checks kill M-B8 and M-B9).
- Fake timers in DP72: no leak (finally restores real timers before the later waitFor; React's scheduler uses setImmediate, not faked).
- Added limit (now in doc 232 item 111): a setTimeout reference saved at module load keeps real timers.

Lows, each fixed in the sketch (v2) or ruled:
- TL-R355-1 (Low): overlay '1.000' after the trim commit and after the second Redo — fixed in v2.
- TL-R355-2 (Low): DP69 not.toContain('1.000') is subsumed by toHaveLength(0) — ruled keep (clearer message under M-B1; it is the first red line there).
- TL-R355-3 (Low): DP69 title understated the new assert — fixed in v2 (title says the release writes nothing).
- TL-R355-4 (Low): previewOf(api) null after both Redos — fixed in v2.
- TL-R355-5 (info): exact toBe is deterministic (whole-pixel pointers, fixed PX_PER_SECOND) — no change.

All mutants were re-run on v2 (mutant-summary.txt; v1 results kept in mutant-summary-v1.txt). Biome check rc 0 and typecheck rc 0 on the scratch with v2 (sketch-biome.log, sketch-typecheck.log).
