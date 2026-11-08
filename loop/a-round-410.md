# A round 410 — PERF-15a (precomputed peaks, stage 1 of 2)

**Status:** implementation complete; pending C. PERF-15 is NOT done (15b remains). Logs: `a-round-410/` (the earlier checkpoint is in `a-round-410/checkpoint-before-final.md`).

## Changed files (git status: 2 ` M` + 4 `??`, exactly the grants)
- ` M app/contexts/ArrangementContext.tsx` — from the patch only
- ` M app/types/arrangement.ts` — from the patch only
- `?? app/lib/arrangement/precomputed-peaks.ts` — from the patch
- `?? app/lib/arrangement/__tests__/precomputed-peaks.test.ts` — from the patch
- `?? app/lib/arrangement/__tests__/precomputed-peaks-context.test.tsx` — from the patch
- `?? docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md` — written by A

Patch `b-round-409/sketch-410.patch.txt`: sha256 `8f22c005447dc3885ed81152d621d868d530329a06a9c52380fd4fa899ab8c42`, equal to `sketch-dispatched.sha256`. `git apply --check` gave OK, then `git apply`. A did not edit the 5 patch files after that.

## Checks (actually run)
| # | Check | Result | Evidence |
|---|---|---|---|
| A1 | claims at start | identical to `claims-410-planning-output.txt`; stderr empty; HEAD `9616d3a` | `a-round-410/claims-start.txt`, `.err` |
| A2 | `npm run typecheck` | rc 0 | `a-round-410/typecheck.log` |
| A2 | `npm run lint` | rc 0 (205 pre-existing warnings, 1 info) | `a-round-410/lint.log` |
| A2 | `npx biome check` on the 5 patch files | rc 0, no fixes | `a-round-410/biome.log` |
| A3 | `npx vitest run` covering set (16 files) | **274/274**, rc 0. Slowest: render-budget "does not re-render clips, overview bars…" 2,816 ms against its 15,000 ms timeout (18.8 %); nothing is above 50 % (L31) | `a-round-410/covering.log`, `covering.json` |
| A4 | claims at end | differs from planning only on K2 (6), K5 (`no`), K6 (`1` + l.4), K6b (8, pending 0), K7, K10, K11, K12. K7/K10/K11/K12 equal `claims-410-sketch-output.txt`. K3 does not appear in the diff (1,301, rc 0). stderr empty | `a-round-410/claims-end.txt`, `claims-end-vs-planning.diff` |
| A5 | `code-reviewer` subagent (6 files) | **No Critical, High or Medium.** Score 8.5/10. Findings below | this file |
| doc | doc 263 l.4 byte-exact; 7 TEMPLATE headings in order; the 17 mutant lines (and the pristine/scratch lines) equal `b-round-409/mutants/summary.txt`; `C round N pending` hits 0 | pass (A's self-check) | — |

A3 timeout verified by A: that test starts at `render-budget.test.tsx:369` and declares `{ timeout: 15_000 }` at l.370. A4 was re-run after the final doc 263 edits: still 8 changed lines, the same set, and stderr is empty.

Not run by A (speed rules / gate): full vitest, `npm run verify`, build, mutants, browser probes.

## Code-reviewer findings and disposition
Patch-file findings are not edited, because the patch must stay byte-for-byte (L11 applies only to Medium+, and there are none). They are reported to B:
- **A-R410-REV-S1 (Low):** `precomputed-peaks.ts:105`. The fetch passes only `{ signal }`, so the browser default `credentials: 'same-origin'` applies, while the audio `source-fetch.ts:15` uses `'omit'`. Choose one policy before 15b and the protected purchased `peaksUrl`.
- **A-R410-REV-S2 (Low):** `precomputed-peaks.ts:107-108`. On non-ok or over-cap responses the body is not cancelled, so the download continues until abort. Suggestion: `response.body?.cancel()`.
- **A-R410-REV-S3 (Low, perf):** `ArrangementContext.tsx:4552-4565`. All peaks fetches start before any `loadSource`, so on HTTP/1.1 they can take connection slots ahead of the audio. Related: if `peaksUrl` throws (TL-R410-SK-3), no source starts decoding, which is worse than the `previewUrl` case. The loop order matters when SK-3 is fixed.
- **A-R410-REV-S4 (Low, design):** the bucket-count match is a weak identity check. Same-length stems served the wrong peaks would skip the worker. Versioned URLs (SK-6) partly cover this; a sample_rate or hash check could be added later.
- **S6 (Info, tests):** PPC8's `console.error` assertion is weak (the real check is `signal.aborted`). PP6's upper false case could be +481 instead of +961 (coverage is enough already). PPC6 has no `try/finally` unmount.
- **Doc findings, fixed in doc 263:** the "as on HEAD" nuance (HEAD never dropped peaks; `peaksReady` is new), and the non-numeric `content-length` rejection (S5, verified in code: `Number('x')` is NaN, so the response is rejected). The S7 absolute path was kept, because the task requires the handoff note to be cited by its full path.

## Architecture note (for B/root; proposal only, not done)
Signal 4 (new state and lifecycle in an existing owner): `ArrangementContext.tsx:4510-4524` adds three per-run maps/sets plus a second async chain per source to the collection-load effect. The reviewer's verdict is **keep for now**. A possible bounded task: move the per-source arbitration (early store / decided / ready / drop) into a pure helper in `app/lib/arrangement/` with `store` and `drop` callbacks, keeping PPC1–PPC11 green and adding jsdom-free unit rows. The reviewer's alternative approaches: parse in the worker (revisit if 15b brings long sources or gzip lets large files past the cap), or always run the worker (revisit if S4 shows up).

## B acceptance (§5) status
- A1 PASS · A2 PASS · A3 PASS · A4 PASS · A5 PASS (no Medium+ in the patch logic).

## Known gaps
- Nothing visible changes in `/studio-lab` in 15a. The "waveform before ready" browser proof is 15b's.
- A did not run any browser probe (C rows 3, 4 and 6).
- A did not re-run the mutants (C row 5).

## Exact next C checks
Per current-task §6, in L59 order: row 5 (A3 set + mutants on a committed scratch `/tmp/c410-scratch`, own `OUT`), row 4 (lane probe, both viewports, :5173), row 3 (peaks probe, both viewports), then rows 1, 2, 6, 7, 8 and `tools/l57-check.py`. Row 2: `cmp` the 5 patch files against the patch applied on a `git archive HEAD` scratch; there should be 0 differences.
