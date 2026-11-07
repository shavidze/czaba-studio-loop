# A round 384: PERF-13b-i doc status line

**Scope:** `current-task.md` §2 (grant `b-round-383/grants-384.txt`, 1 path). No source, test or perf file was changed.

## Pre-flight (STOP L11 check, before the edit)
- `sha256sum -c --quiet b-round-383/r384-frozen-sha256.txt` returned rc 0.
- `sha256sum -c --quiet b-round-318/protected-sha256.txt` returned rc 0.
- `git status --short`: 11 lines (the same 11 as in the baseline [K2]).
- Primitive read: `.claude/primitives/GEORGIAN_DOCS.md`. Lessons read: L11, L28.

## Changed files
- `docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md`: l.4 only.

## Diff (`a-round-384/doc248.diff`; the before copy is `a-round-384/doc248-before.md`)
```
4c4
< **სტატუსი:** In Progress (stage 1 of 2; C round 383 PASS)
---
> **სტატუსი:** In Progress (stage 1 of 2; C round 384 PASS)
```
Line 4 now matches the §2.1 string byte for byte (a shell `[ = ]` check printed `L4-exact`).

## Other lines that name round 383 as the verifying round
**None.** These are the other `383` hits in the doc: l.45, 73, 81, 84, 85, 88. Each names round 383 as the round that **introduced** a change: `deleteMany`, the MU-383-* mutant ids, and the round-383 mutant runner path. None of them names 383 as the round in which C verifies, so all were left unchanged.

## SOURCE-SCOPE (after the edit)
- The status still has 11 lines (doc 248 was already untracked `??`).
- `r384-frozen` returned rc 0 (it covers every file except the grant).
- Protected returned rc 0.
- `grep "C round .* pending" docs/implementation` found 0 hits.

## Tests
None were run. Per §2.3 there are no tests, builds or browser jobs, because no code changed. The task also does not require a `code-reviewer` for a single doc file. Biome does not apply to `.md`.

## Known gaps
- C-R382-01 is still open. It waits for C's production heap row and PERF-RES in this round (task §3).
- A-R383-REVIEW-L1-STALE-ENSURE-DECODED (Low) is assigned to PERF-13b-ii and was not touched.

## Next C checks
- Row 1: `r384-frozen` rc 0 and protected rc 0.
- Row 2, DOCS-L4: `sed -n 4p` of doc 248 equals the §2.1 string, and the diff touches only l.4.
- Then the heap, PERF-RES and auth rows from task §3.

## B acceptance passed by A
- §2.1: l.4 matches the string exactly.
- §2.2: no other lines needed changing ("none").
- §2.3: the diff and SOURCE-SCOPE results are reported above.
