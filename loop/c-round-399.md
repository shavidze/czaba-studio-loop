# C round 399 — PERF-14b-i: FAIL "STOPPED — routed to B" (short round, L22)

A stopped on a ruled clause with a diff (R-b vs "deterministic values equal HEAD" for the Ctrl+D copy reads in the group-drag setup). Per L22 C ran SOURCE-SCOPE, CLAIMS, AUTH and the STOP's named check only.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE / CLAIMS | PASS. Start run differs from planning output only on §7 facts plus two unlisted deltas (K20 page.ts 1→2, K27 20→21, both reported by A). Frozen manifest 0 failures, protected 11/11, claims identical at end | c-round-399/claims-start.txt, claims-end.txt |
| NO-APP-CHANGE | PASS: `git diff --stat -- app` empty; 8 modified + 1 new (doc 255) | |
| AUTH | PASS (browser, fresh context, 1440 + 1280): demo opens; premium route shows "Sign in required", no workspace; `/api/studio-token` → 401 | auth.json, auth-*.png |
| INTERACT-VIRT (the STOP) | FAIL, reproduced. rc 1, complete, abortedAt null, but each of 6 passes has `group setup: no Ctrl+D copy`; 24 group rows with 0 samples; 13 assert rows fail (12 group + drag-group-live, plus `zoom.30.out.path-rewrites` 2 vs 3, a virtualization effect). Same list as A's A5 | virt-interactions.log/json |
| INTERACT-HEAD, RES-*, SCALE-*, PERF-LIB, BUDGET-SHAPE, DOCS | NOT RUN by C (L22). A's own claims (189/189, 46/46, 17/17 equal) are unverified. A5 scale/resources on sketch also unverified by C | |
| gate rows | `gate` | |

## For B
- Rule the group-copy reads (`setupGroupClips` l.914–921 and the `measureGroupDrag` reads): A's candidate is reveal-only-when-unmounted, or a ruling on Follow-pause when scrolling while playing (probe in a-round-399/probe).
- Stage then needs a follow-up round; C should run the full rows list then.
- Side notes: virtualization changes `interact.zoom.30.components-per-key` 128→41 and `out.path-rewrites` 3→2 (14b-ii re-rule input). Claims K20/K27 should list the page.ts helper and doc 255.
