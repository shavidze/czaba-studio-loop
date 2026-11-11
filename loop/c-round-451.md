# C round 451 — FAIL (STOPPED — routed to B)

A stopped on code-reviewer Medium A-R451-REVIEW-M1-GT5-BARREL-SCOPE, which no ruling in the task covers. Per L22 this is a short FAIL even though every row run passed. Do not publish.

| Row | Result | Evidence |
|---|---|---|
| C1 scope start/end | PASS: status = exactly the 5 grants (unchanged at end); tree sha rc 0; protected rc 0 | c-round-451/status-start.txt |
| C2 claims | PASS: differs from sketch output only at K2 and K21 as expected; stderr empty | claims-c.txt |
| C3 sketch sha | PASS rc 0 | |
| Named check (GT5 root-barrel mutant) | **REPRODUCED**: HEAD red, A's tree green | mutant-gt5.txt |
| C10 auth (browser, 1440x900 and 1280x720) | PASS: auth_user null, workspace opens, /studio/middle-east "Sign in required", 0 audio[src], token API 401. Fake-bearer path BLOCKED (no backend) | auth-smoke.json, auth-studio-*.png |
| C11 smoke (browser, both) | PASS: Enter adds clip, Play moves position, Stop holds, Export opens/Esc closes | smoke-*.png |
| C12 L57 | see l57-check.txt | |
| C4–C9 | Not run (L22). A's own results are unverified by C | |

## Bug
**A-R451-REVIEW-M1-GT5-BARREL-SCOPE (medium, origin: B spec).** The sketch adds the two barrels to the shared `BARREL_FILES`, so GT5's name scan skips files HEAD scanned. Appending `export { ArtistBioSection as Bio } from './home';` to `app/components/index.ts` makes GT5 fail at HEAD but pass on A's tree. This breaks L4. B's mutant set did not include this one.

## For B
Rule one of: separate exclusion list for GT5b (GT5 keeps HEAD's 3 barrels), then re-issue the sketch sha, expect-counts and mutants with a GT5 root-barrel mutant added; or accept the Medium explicitly.

Note: first browser run timed out on a cold dev server; the rerun after warm-up passed.
