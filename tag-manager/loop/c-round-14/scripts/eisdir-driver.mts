import { createWavTestFixtures } from "/home/runner/czaba-project/czaba-tag-manager/tests/fixtures/create-fixtures.ts";
try { createWavTestFixtures("/tmp/c-r14-eisdir/t"); console.log("no throw"); } catch (e) { console.log("threw", (e as NodeJS.ErrnoException).code); }
