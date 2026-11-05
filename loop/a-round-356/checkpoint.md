# A round 356 checkpoint
- Patches applied (both), budgets sha = dispatched, doc232 cmp equal.
- A-CLAIMS pre MATCH; final: K2/K3/K5 differ from planning as expected, equal to sketch except K2 (HEAD 6588f08, 2 entries, 0 outside lanes); K7 0/0.
- A-READ MATCH. typecheck rc0, lint rc0 (205 warnings), perf-lib 40/40.
- Next: A-PERF (alone), then A-MUTANT scratch.
- A-PERF DONE: rc0, complete, failures [], 252 rows, 84/84, 0 NEW, 181 non-wallclock rows EQUAL to C354 (0 DIFF), durationMs 474487. Results in a-round-356/perf-results, rowcmp.txt.
- Next: A-MUTANT in /home/runner/a356-scratch.
- DONE: A-MUTANT red list = B's 9 ids/values; scratch deleted; claims-final re-run; a-round-356.md written.
