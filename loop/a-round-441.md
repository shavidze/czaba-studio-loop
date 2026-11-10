# A round 441 — SYS-1 stage 2: Overview data hooks

**Status:** implemented, no STOP. Tree ready for C. No commit/push.

## Precondition
`claims-441.sh | grep -E '^K(1|2|6) '` (log `a-round-441/claims-before.txt`):
- `K1 head 047a0fc gate440 published 047a0fc`
- `K2 status total 0 outside-grants 0`
- `K6 sketch-applies yes`

## Changed files (7, all granted)
- `app/components/arrangement/ArrangementOverview.tsx` — 4 data hooks only (sketch).
- `app/lib/arrangement/__tests__/{studio-theme-obsidian,panel-radius-ui,content-colour-ui,overview-visibility-ui,track-group-mix-ui}.test.tsx` — sketch.
- `docs/implementation/2026/quarter-IV/287-sys-1-stage-2-overview-hooks.md` — new doc (l.4 `**სტატუსი:** Completed (C round 441 PASS)`; TEMPLATE headings in order; mutant table, rulings S2-R1/2/3, SSR-empty finding, three closes, TODO TL-R440-UM8-GROUP-MUTE + RETRO-450 source-pin question).

Sketch applied with `git apply --check` then `git apply -p1` of `b-round-440/sketch-441.patch.txt`; not hand-edited. Full diff: `a-round-441/diff.patch.txt`.

## Checks actually run
| # | Result | Evidence |
|---|---|---|
| A1 | 6/6 identical to `b-round-440/sketch-files/` | `a-round-441/a1-cmp.txt` |
| A2 | rc 0, 12 files, 267/267 | `a-round-441/a2-covering.log` |
| A3 | typecheck rc 0; lint rc 0, **205 warnings** (= HEAD); scoped `biome check` on the 6 paths rc 0 | `a-round-441/typecheck.log`, `lint.log`, `biome-scoped.log` |
| A4 | claims diff vs planning output **equals** `claims-441-expected-after-A.diff.txt` exactly | `a-round-441/claims-after.txt`, `claims-diff.txt` |

L31 headroom (A's run): UM8b 1907 ms of the describe's 20 s (9.5 %); NS5 1345 ms of 5 s (27 %). No covering test above 50 %.
Not run by A (gate rows): full suite, build, verify. No browser probe by A (C6/C7 are C's).

## code-reviewer (actual subagent, 7 changed files)
Score 9/10, **0 Critical/High/Medium**. Note: it ran before `diff.patch.txt` was written and reviewed the sketch + working tree instead (identical, A1).
- **Low 1 (NOT covered by `sketch-review.md`):** in the full state, PNR4 (`panel-radius-ui.test.tsx` ~l.511-519) and DXC4 (`content-colour-ui.test.tsx` ~l.302-304) check only `parentElement === overview`; the old `firstElementChild`/`children[1]` also pinned outline-before-lanes order. An outline moved after the lanes (would paint over bars) stays green. Suggested fix: `expect(lanes.previousElementSibling).toBe(outlines[0])` in PNR4. **Not applied** — the task forbids hand-editing the sketch and A1 requires 6/6 identity. Proposed id for B: `A-R441-REVIEW-L1-OUTLINE-ORDER` (Low → `deferred_low_polish` or a one-line fix in a later owning round).
- Lows 2–5: covered by dispositions (b)/(h), S2-R3 + TL-R440-UM8-GROUP-MUTE, S2-R1, S2-R2.
- **Architecture note (for B):** none, keep as is. Static data attributes on one existing owner; no state/effect/ref/lifecycle; no checkpoint signal fires. S2-R2 source reads already recorded for RETRO 450.

Low 1 framing for B (L4): this is a **dropped HEAD pin** — HEAD PNR4/DXC4 pinned outline-before-lanes in the full state through `firstElementChild` / `children[1]`; the sketch keeps only the parent check. No mutant in `b-round-440/mutants/results.jsonl` swaps the outline and the lanes (D1/D1H insert a decoy, they do not reorder).

Doc 287 corrections after review (docs only; no code changed after the review; A4 re-run, still exact):
- Mermaid diagram: outline/baseline is the first child, lanes the second.
- OV-E1 collision cause rewritten from evidence: HEAD OV-E1 asserted `root.children[1]` had no `data-testid`, and the lanes container gained `arrangement-overview-lanes` (`b-round-440/precheck-full-v1.log` l.9108), not an outline shift.
- Biome wrapping sentence made exact (outline and lanes wrapped, bar +1 line, lane row single line).
- Testing section: browser 0 px attributed to B's sketch pre-check (`b-round-440/probe/pxdiff-head-5177.txt`); C re-verifies in C6.

Pre-flight: the gate (assumptions, smallest version, files, success commands) was published in chat before applying the sketch.

## B acceptance criteria passed by A
A1, A2, A3, A4 — PASS. code-reviewer — run, Architecture note passed above.

## Known gaps
- Reviewer Low 1 (above), unruled, handed to B.
- Group Mute not rendered in UM8b (TL-R440-UM8-GROUP-MUTE, already deferred).

## Exact next C checks
C1 SOURCE-SCOPE (7 paths) → C6 browser hooks + pixels vs in-job HEAD on 5177 (warm-up first) → C7 auth/smoke/real export → C2 patch identity → C3 covering → C4 mutants (30 lines) → C5 sweep K7/K8/K9/K10/K24 → C8 claims diff → C9 doc 287 → C10. Never run vitest during C6/C7 (L38).

Scope completed: SYS-1 stage 2 implementation only. Not marking the backlog complete.
