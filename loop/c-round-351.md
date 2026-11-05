# C — Round 351: FAIL (A STOPPED, routed to B)

A stopped at A-REVIEW (code-reviewer F1, Medium: DP72's release half is unguarded). Per A's "Next C checks" (L22) C ran only the STOP-related checks; the full mutant and names browser sets were deliberately not re-run. Task not complete.

## Run (evidence in `c-round-351/`)
| Row | Result |
|---|---|
| CLAIMS | PASS: `claims.txt` byte-equal to `a-round-351/claims-final.txt` |
| SOURCE-SCOPE | PASS: git status = exactly 3 modified files, 0 untracked; dock sha256 `037f62fa…5e96` (equal to task); DP72 test numstat `54 0` vs `b-round-350/drag-preview-render.test.r350.tsx` |
| READ DP72 vs F1 | F1 CONFIRMED by reading (test l.2243–2288): after `pointerUpAt` the test goes directly to `undo()` and asserts the pre-drag time. No assert between release and Undo, so a release that seeks back to the old position, or an Undo that writes nothing, is not caught. Not demonstrated with a mutant (read-based). A mutant for the release half is needed |
| G351-AUTH (browser, 1440×900 and 1280×720) | PASS: `/studio-lab` opens the workspace with the demo badge, `auth_user` null; `/studio/1` shows "Sign in required", 0 `audio[src]`; `/api/studio-token` GET 400, POST 405 (`auth.json`). Note: the first run timed out at cold dev-server compile (120 s `ready` wait); the repeat took 9 s |
| UNIT / MUTANT jsdom / MUTANT browser M-B2′ / NAMES smoke | NOT RUN by C (A's own mutant logs `a-round-351/mutant-*.log` show the §0.1 red sets, A's claim, not independently verified by C). Not counted as passed |
| DOCS | not independently checked beyond K6 in CLAIMS (h2 7, pending-351 1, awaiting-ruling 0, ruling-d1119 1, dp72 2, m-b5 1) |

## Bugs
- **C-R351-01 (Medium, origin B spec; same as A-R351-REVIEW-RELEASE-ASSERT):** DP72 has no assertion after release. B must add the post-release assert (reviewer's proposal: `waitFor(() => expect(seeks.at(-1)).toBeCloseTo(previewTarget, 3))` right after `pointerUpAt`), re-run B's sketch and name a mutant for the release half. Then re-dispatch. Also decide A's low items (F2 global spy, F3 try span) and which l.4 string wins (L28).

## Not closed
C-R350-01 and A-R350-REVIEW-SEEK-TEST stay open until a C PASS.

browserVerified=false: MUTANT (browser) and NAMES smoke rows can run here and were not run.
