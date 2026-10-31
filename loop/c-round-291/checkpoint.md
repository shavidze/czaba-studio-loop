# C round 291 checkpoint
- CLAIMS: on A tree deltas match §6 expected (K5 shows 2 headingId lines, not 3 — B wording slip, A noted); HEAD archive claims K3..K19 equal planning output. L29 grep: 30 hits, none untagged fact needing a tag (instructions/claims rows).
- TYPECHECK rc0; UNIT 15 files / 258 tests pass; LRS4 2707 ms (>2500 = 50% of 5000) reproduces A's STOP item 1.
- MUTANTS: M1 LG8 both red; M2 LG8 b-two red; M3 LG9 red; M4 (label-only key) survives -> A-R291-REVIEW-M1 confirmed. Live tree unchanged.
- Next: browser rows (ax-probe, keys, states, screen, journey, auth).
- B-AX PASS both vp (0/0, names, 4+5 options, bbox delta 0). B-KEYS PASS (9 ids there and back, option only, focus-visible 1px brass 0.8 outline, inside). B-STATES PASS a 0g/5o, b 0g/1o bass, c 2g/9o text lines 0. S3 browser extra: query 'a' (synth-mix removed) focus same node kept.
- B-SCREEN: full-window pixel diff vs B ax-before = 0 px both vp. B-JOURNEY PASS (status, pos 1.483/1.471 at 1.5s, playing f/t/f, RMS ~0.045, WAV 48k/24bit/2ch 16.000 s). G291-AUTH PASS (401 no header, 500 fake w/o mock).
- DOC-216 PASS (l.17 byte-equal, only hunk @@17, l.4 289). DOC-217 PASS. RT-FIX-291 PASS (diff equal, old phrase 0). SOURCE-SCOPE PASS (5 paths, sha fails only 4 granted).
- Open: A STOP items (LRS4 2609/2543 ms A, 2707 ms C > 2500; M4 survives). Verdict decision pending.
- DONE: c-round-291.md/json written, PASS.
