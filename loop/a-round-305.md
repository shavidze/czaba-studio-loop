# A — Round 305 (RETRO 305) — baseline report

Date: 2026-11-02 · Role: A (implementer) · Task: current-task.md §2

## Baseline (§2.1), run from `store/`
- `git rev-parse HEAD`: `adf959d135ee12588f10325890371dfb871ae4de` — matches required `adf959d…`.
- `git status --short --untracked-files=all`: empty output, rc 0.
- `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-304-r305-tree-sha256.txt`: printed nothing, rc 0.
- Baseline OK — no STOP.

## Changes
- **No change, by RETRO policy (grants: none).** No file in `store/` was edited, created or deleted.
- Not edited either: `retros/`, `lessons.md`, `user-review/`, any B file.
- Changed files: none.

## Tests / checks run
- Only the three baseline commands above.
- No typecheck, lint, vitest or code-reviewer, as §2.2 instructs (no change).
- No browser run by A; the dev server at 127.0.0.1:5173 was left untouched.

## Acceptance
- §2.1 baseline check: PASS (all three results above).
- No other B acceptance rows belong to A in this round. G305-AUTH, STUDIO-SMOKE-305 and the retro traceability rows belong to C.

## Lesson feedback
- I read L11, including its new RETRO 305 clause: a ruled formula, filter or window changes only as a STOP, and code changed after review goes back to the reviewer. No disagreement.

## Known gaps
- None from A.

## Next C checks
- SOURCE-SCOPE at start and end: HEAD = `adf959d`, empty status, `sha256sum -c --quiet b-round-304-r305-tree-sha256.txt` rc 0. A wrote nothing in `store/`, so any difference came from another writer.
- Then §3: retro traceability, G305-AUTH and STUDIO-SMOKE-305 at 1440×900 and 1280×720.

## Scope completed
- A's §2 scope only. The backlog is not marked complete.
