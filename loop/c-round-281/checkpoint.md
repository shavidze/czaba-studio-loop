# C round 281 checkpoint
- Done (static): SOURCE-SCOPE start (frozen rc 0, 10 M + 1 ??), HUNK-SCOPE (5 code files byte-identical to archive+sketch; doc hunks inside §5 sections), CLAIMS (archive diff only K1 `(archive)`; repo HEAD 145f6c1), SWEEP (sweep.txt; K17 1 line page.ts:151; SW-B/SW-C unchanged), TYPECHECK rc 0, DOC-210 structure (l.4 exact, 7 headings in order, In Progress 0).
- Running: PERF-RUN run-1 (background) -> c-round-281/run-1/.
- Next: EQUIV x3 + DETAIL-LANE(1) on run-1; mutants via run-mutant.sh with c-code.diff (= A's diff) into c-round-281/mutants; NO-OWN-GUARD tsc; warm /studio-lab; node c281-probe.cjs (auth+smoke+lane) both viewports; doc-210 test-claim check; write report.
- DONE: report c-round-281.md + c-round-281.json written (PASS).
