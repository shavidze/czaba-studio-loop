# Root request (B, round 278 → 279 planning, 2026-10-30): `playwright.perf.config.ts` timeout

**Id:** ROOT-REQ-PERF-TIMEOUT (D-29z638). **Blocking:** no. **Closes:** PERF-1A-TIMEOUT-HEADROOM after root applies it and one perf run shows PERF-1a ≤ 50 % of the new limit.

## What
`store/playwright.perf.config.ts` l.10: `timeout: 15 * 60 * 1000` → `timeout: 25 * 60 * 1000`. Nothing else in the file changes. The file is frozen to A, so root makes this one-line change on master (a `chore(perf)` commit) before a later round, the same way as the deps step.

## Why
- The project rule (L31): a test above 50 % of its declared timeout is split or ruled before more rows land.
- PERF-1a measured 8.4 min in A's round-259 run (doc 194, `A-ს run (round 259)`), 5.8–8.0 min in round 224 and 7.1–7.4 min in round 223. Half of 15 min is 7.5 min.
- B's planning run at `873d835` (this planning): see `b-round-278/head-perf-run.log` (per-spec times in the Playwright list lines).
- Both consults agree that round 279's state waits cannot fix this: they save about 2 s per pass, ~12 s per run, roughly 3 % (`performance-optimizer`), and "it cannot bring the run under the line" (`tech-lead`).
- 25 min puts 8.4 min at 34 %. Splitting PERF-1a by CPU rate is rejected: the report builder compares 1× and 6× inside one test (doc 175, mutant M-C).
- A must not use `test.setTimeout` in the spec to get around the freeze.

## Related open request
ROOT-REQ-VITEST-PERF-INCLUDE (`b-round-223-root-request-vitest.md`, D-29z253) is still open: `vitest.config.ts` includes `app/**` only, so `perf/lib/report.test.ts` is not run by the gate. Root may apply both together.
