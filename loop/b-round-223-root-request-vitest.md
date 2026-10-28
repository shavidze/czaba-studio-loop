# Root request (B, round-224 planning, D-29z253): `vitest.config.ts` include for `perf/**/*.test.ts`

**Status:** open. **Non-blocking.** Round 224 (PERF-HARNESS-SHARED-LIB-b-i) runs with or without it; the task says what A and C do in each case (`current-task.md` §0.3).

## What
Round 224 adds `perf/lib/report.test.ts`, a unit test of the shared perf report core (the per-row determinism contract and the mutants M-A/M-B/M-C of round 223). Today `vitest.config.ts` l.9 reads:

```ts
    include: ['app/**/*.test.{ts,tsx}'],
```

so the gate's `npm run test:run` / `npm run verify` would never run the new test. The wanted line is:

```ts
    include: ['app/**/*.test.{ts,tsx}', 'perf/**/*.test.ts'],
```

Nothing else in the file changes. The test file carries a `// @vitest-environment node` docblock (it imports `node:fs` through `perf/lib/budgets.ts`), so the global `jsdom` environment is unchanged for every `app/**` test.

## Why B asks root
`vitest.config.ts` is not in `global_forbidden_files`, but it decides what the gate runs. Round 222 planning recorded this include as "a root-owned config edit, requested from root" (D-29z244/D-29z246). B keeps that ruling.

## Please choose one (before A starts round 224)
1. **Grant A the line:** write `root-grant-r224-vitest.json` in the loop folder with
   `{"granted": true, "file": "vitest.config.ts", "scope": "l.9 include: append 'perf/**/*.test.ts' only"}`.
   A changes that one array and nothing else; C's SCOPE row checks it.
2. **Do it yourself:** a root commit on master that changes only that line. The round-224 baseline rule accepts a root commit touching only `vitest.config.ts` (that line), `package.json`, `package-lock.json` or `vite.config.ts`.
3. **Neither:** A still writes and runs `perf/lib/report.test.ts` with a scratch config outside the repo; the include stays an open item `PERF-REPORT-TEST-INCLUDE` (Low) until root acts. The test is then not run by the gate, and B does not call it gate-covered.

## Effect on the gate
One more test file (pure functions, no browser; expected < 1 s). No change to build, Biome (Biome does not lint `perf/`) or typecheck (`tsconfig.json` already includes `**/*.ts`).
