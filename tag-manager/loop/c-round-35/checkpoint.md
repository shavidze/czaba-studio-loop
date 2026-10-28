# C round 35 checkpoint
- R35-1 diff scope: done, clean (quiet=0, -w diff = D-42 + 4 D-43 lines, inner fieldset identical modulo 2-space indent, `as` counts unchanged 3/2, no aria/comments).
- R35-6 docs: refs verified by sed, names 1/1 each, recount 19/10/9/5 OK, word-diff shows only SE + MP>=225 refs changed.
- R35-4 gate: running (verify.log, e2e-retries0.log).
- Copies: /tmp/c35/{red,old,new,mut}.
- Next: R35-2 red/green in /tmp/c35, R35-3 mutants, R35-5 builds + harness.
- DONE: all six PASS; reports written (c-round-35.md/.json). fingerprint start=end 1146314b.
