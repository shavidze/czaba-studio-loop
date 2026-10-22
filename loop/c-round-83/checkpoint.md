# C round 83 checkpoint
- Start: HEAD bdc2067, 8 M + 5 ??, frozen 471/471 OK, A end-hashes OK (c-round-83/hashes-start.txt). Server 200.
- Tools copied from c-round-82 into c-round-83/tools (OUT → c-round-83). lib83.cjs = envelope helpers.
- Next: write r1 (DOM rows), r2 (exports), r3 (meters), r4 (EN-EDITS DOM), g83; run at 1440x900 then 1280x720.
- r1 PASS both viewports (rerun after harness fix for stale coords at 1280). r2 exports written; running.
- r2 PASS both viewports. r3 meters next.
- r3 PASS both (wide-window paired oracle; narrow ±0.1s noisy, recorded). Next g83, vitest targeted, end hashes, report.
- DONE: report c-round-83.md/.json written; PASS w/ 1 low.
