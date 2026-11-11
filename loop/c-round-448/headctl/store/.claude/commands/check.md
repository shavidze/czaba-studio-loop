# /check

Run `npm run verify` (agent consistency, lint, TypeScript, unit tests, build), then `npm run test:e2e:smoke` for UI changes. Report every command and exit status. A build is not a TypeScript typecheck.

`npm run check` is a non-mutating Biome check. Only use `npm run check:fix` when fixes are in scope; inspect its diff afterwards. Do not claim success when a check failed or was not run.
