# Sketch review: PERF-14b-ii (B round 401 → 402 planning)

- **Reviewer:** `tech-lead` (real read-only subagent runs, 2026-11-08), two passes. Neither pass ran commands (a perf run was in progress, L38).
- **Pass 1 reviewed:** `sketch-14bii-v2-reviewed.patch.txt` (sha256 86d6278a1d2d9209…).
- **Pass 2 (delta) reviewed = dispatched:** `sketch-402.patch.txt`, sha256 **28569ea2d35c479b**94b433161a4f584c0b4f2b751f78aa80de8231061d3867f2. It is the patch A applies (L58, reviewed = dispatched).

## Pass 1 findings and B's dispositions
| Id | Sev | Finding | Disposition |
|---|---|---|---|
| TL-R401-SK-M1 | Medium | The reviewed patch did not contain the new test file (untracked in scratch) | **Fixed:** `git add -N`; the dispatched patch has 6 file diffs incl. `lane-virtualization.test.tsx` |
| TL-R401-SK-M2 | Medium | `budgets.scale.json` dropped five HEAD notes (C-R398-SIGNAL-M2/M3 text from 14b-i); the round-398 flip patch was built on the round-398 base | **Fixed:** rebuilt from HEAD `c17d0e9` by script; exactly 7 rows change (6 flips + scroll ceiling), only `mode`, `budget`, `note`; each note keeps the HEAD note as prefix minus ` record — not run on sketch (L58)` |
| TL-R401-SK-M3 | Medium | Check (f) could no longer fail once same-lane members are unpinned | **Fixed** (reviewer's option 1): copy mounted at t0 → old check + "mounted at t0 but not on the own-lane read"; copy outside at t0 → fail if it is mounted on the own-lane read |
| TL-R401-SK-L1 | Low | VZ9 ignored the capture flag | **Fixed:** compares capture; new mutant MU-402-NO-CAPTURE-REMOVE red |
| TL-R401-SK-L2 | Low | Mutant name BLUR-KEEPS-LISTENERS was wrong | **Fixed:** renamed MU-402-NO-CANCEL-REMOVE |
| TL-R401-SK-L3 | Low | WG2–WG5 depend on the ghost pin | Not a code comment (project rule: no comments except TODO/Georgian context). A records it in doc 256 (§2 of the task) |
| TL-R401-SK-L4 | Low | Scroll ceiling would lock in a regression | **Fixed in the note:** "known, accepted cost and not a target", HEAD 57.75 vs 116.5 |
| nit | — | Lazy `useRef(new Map())` init | Not applied (cost negligible) |
| nit | — | `found.value === null` branch unreachable | Kept: it narrows the type |

Pass 1 also confirmed: the pin logic is correct (window capture pointerup runs before the clip's own handler; same-pointerId re-press; StrictMode; render-time ref read); Q-14B-PIN-GROUP-MEMBERS "do not pin same-lane members" is right (pinning would mount every selected clip on select-all + drag, defeating VZ7); spec Lows 1, 2 and 4 are fixed; keeping Low 3 is right; `path-rewrites == 2` and the scale flip values match B's runs.

## Pass 2 (delta) verdict
M1, M2, M3, L1, L2 and L4 fixed; the delta touches only the test file, the rebuilt scale budgets and the three-branch (f) check; the other files are byte-identical to pass 1. Reviewer: (f) false-failure risk low (the drag never sets `scrollLeft`; Follow does not scroll during a gesture; the page window extends ≥ 1 viewport past the visible edge). One Low wording note on the branch-3 message (geometry, not only the ruling, makes it unreachable): harmless, kept. **"no new Medium+"**.

## Runs on the dispatched patch (L58)
- Mutants: `mutants/summary.txt` — pristine rc 0, 11/11 RED, pristine-after rc 0 (the v1 set of 10 is kept in `mutants/v1/`).
- Scale spec on the dispatched patch: `perf-sketch-scale-final.json` (+ `.log`, `.rc` 0): page 950 / 1532 / 1868, model 200, zoom 42.4 (1x and 6x), scroll 116.5 per step, all 7 asserts PASS. Earlier runs on pass-1 budgets (`perf-sketch-scale-run1/run2.*`) gave the same values.
- Interactions spec: `perf-sketch-interactions-final.json` (+ `.log`, `.rc` 0): the dispatched (f) logic; see claims K11.
- Browser probes and the full vitest: see `checkpoint.md` and claims K19–K21.
