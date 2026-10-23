# C round 106 checkpoint
09:40 UTC: SOURCE start OK (HEAD 3b6178b, 6M+4??, frozen 535 OK, hashes = A end-hashes). Diff vs snapshots reviewed (out/diff-code.txt) — within narrow ranges.
Next: tools/kr106.cjs (KR rows), tools/sr106.cjs (HD-BLOCKED-HOLD, SR-REPEAT-SPACE, SR-TEXT-REG), G106-3, AN-REVIEW scratch mutations, T106-TARGETED, DOC-092.
- 09:5x KR snapoff-asis(0 spans, confirms A), snapoff 1280/1440 PASS, snapon PASS, group PASS
- moves PASS (revised), moves-asis 0 refusal (TIME0), loop PASS (run1 regex bug in my check, rerun clean); Ctrl+L held toggles each repeat (bug for B)
- marker-flag, marker-step, detail-enter PASS
- HD-BLOCKED-HOLD, SR-REPEAT-SPACE PASS, SR-TEXT-REG identical to r105
- G106-3 PASS both vps
- 10:1x AN-REVIEW: head 391 identical, no as/@ts/any; running mut106.py
- mut k1/k4/k8/k9 match; T106 69/1138 pass
- 09:56 report + json written (PASS). Pending: advisor final review.
- 09:58 DONE: passed ids normalised, passedWithDeviation added, nudge identity diff. Final.
