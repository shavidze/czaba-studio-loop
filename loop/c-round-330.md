# C round 330: PERF-DRAG-PREVIEW stage c1 fix-up (C-R329-01 memo leaf, C-R329-02 loop extent), independent verification

**Verdict: PASS.** Every C row in §2.2 ran and met its expected result on A's final tree:
- CLAIMS, SOURCE-SCOPE, UNIT ×3, MUTANT (plus C's own mutant) and DOCS.
- In the real browser: END-LIVE, VIEWPORT-BOUND, D-ROWS and G330-AUTH at 1440×900 and 1280×720. DRAG-NAMES once at 1440×900.
- PERF: a production build, run alone, after a warm-up.

C-R329-01 is closed by measurement:
- `click.components` is back to 106.
- Range `move-components-max` is back to 30, and `-per-move` to 9.233.
- zoom.1 is 99, zoom.30 244, and play start/stop 90.
- 113 non-wallclock rows are EQUAL to round 328.
- Only the 8 move record rows differ: 30.367 per move and a max of 108.

C-R329-02 is closed: DP24 exists, and the mutant MU-OVERVIEW-NO-LOOP is red on it.

`browserVerified` = `realVerified` = **true**. No row was blocked.

## Environment
- env-status: `store 200`, round 330, attempt 1.
- A's tree runs on `:5173`.
- HEAD `dae81bf` runs on `:5197`. It is a `git archive` copy in `/tmp/c330h` with its own Vite `cacheDir` (`/tmp/c330-head-vite-cache`, L38).
- Scratch `/tmp/c330s` is an rsync of the store, and its `app/` and `perf/` are byte-equal to the store. It has its own `cacheDir` and its own git baseline, and is used for unit, mutant and perf runs only.
- The first `:5197` warm-up timed out on the cold compile (240 s). It was environment-invalid and was replaced; the second warm-up was ready in 4.8 s (`warm.log`, `warm2.log`).
- At the start and end of the run:
  - the source sha is the same (`source-sha-{start,end}.txt`);
  - the claims are stable (`claims-end.txt` = `claims.txt`);
  - `git status --short` lists exactly 4 M, with nothing untracked;
  - HEAD is `dae81bf`.
- C changed no application source.
- Evidence folder: `c-round-330/`. State file: `c-browse.json`.
- At the end of the run, the HEAD `:5197` server was confirmed stopped (`pgrep` finds no `/tmp/c330h` process). A's `:5173` still answers 200.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | **PASS.** Run first. Byte-equal to `a-round-330/claims-after.txt`. It differs from `claims-330-sketch-output.txt` only in the allowed lines: K2 `dae81bf 4`, K7 (new l.4), K8 `11`, and K6 `176 26 2 0 4 2`. K6 is 3 `expect(` lines above the sketch's 173 because of A's DP21 strengthening. The run took about 2 min | `c-round-330/claims.txt`, `claims-end.txt` |
| SOURCE-SCOPE | **PASS.** 4 M, nothing untracked.<br>`git apply -R --check b-round-329/sketch/sketch.patch.txt` passes.<br>The `StudioWorkspace.tsx` check against `b-round-328` passes.<br>C rebuilt the sketch's test file (HEAD + the b328 and b329 test hunks) and diffed it with A's file. The only difference is DP21's `api`, `endAtRest`/`extentAtRest` and 3 Undo `expect(` lines. These are additions only, and 0 `expect(` lines are removed from the test diff against HEAD.<br>Protected files: 11/11 (K8) | `test-a-vs-sketch.diff`, `source-sha-start.txt` |
| UNIT | **PASS** ×3. `drag-preview-render` + `status-preview-store`: 29/29 on each run. DP20–DP24 are present | `unit-{1,2,3}.log` |
| MUTANT | **PASS.** All 7 of B's mutants are red on exactly the rows in §0:<ul><li>RAW-END: DP21, DP22</li><li>COMMITTED-END: DP22</li><li>OVERVIEW-COMMITTED-END: DP21, DP22, DP24</li><li>CLEAR-ANY-PREVIEW: DP20</li><li>TRANSPORT-SUBSCRIBES: DP2, DP9a, DP21</li><li>ENDTEXT-NO-MEMO: DP23</li><li>OVERVIEW-NO-LOOP: DP24</li></ul>Restored: 26/26.<br>**C's own mutant, MU-C330-MEMO-IGNORES-END-DECREASE,** has a memo comparator that skips the render when `committedProjectEnd` falls, as on Undo. It is red on DP21 at l.863, A's new Undo line (`expected '00:12.750' to be '00:12.000'`). This gives A's Undo assertions the isolated red proof that A's own mutant could not. Restored 26/26, and the scratch `app/` is byte-equal to the store afterwards | `mutants-b.txt`, `mutant-c.txt` |
| **END-LIVE (browser)** | **PASS**, both viewports. A's output is byte-equal (`cmp`) to HEAD's:<ul><li>`moves` 61</li><li>`distinctEnds` 60, `distinctExtents` 60</li><li>4 ruler widths</li><li>`afterRelease`: end 01:44.352, extent 104.352, ruler 5400</li></ul> | `end-bound-a.json`, `end-bound-head.json` |
| **VIEWPORT-BOUND (browser)** | **PASS**, both viewports. At the minimum zoom, scrollW = clientW (1142 and 982). Every field equals HEAD, including all samples, `pre`, `afterRelease` and the errors (none) | `vp/vp-{a,head}.json`, `vp/vp-summary.txt`, `vp/*.png` |
| **DRAG-NAMES (browser)** | **PASS** (warm server, 1440×900).<ul><li>`harness-clip-click`: [104, 2, 0], equal to the sketch and to HEAD in counts and names. No click commit contains `ArrangementProjectEndText` or `…Inner`.</li><li>`move-moves`: [23, 2, 23, 2, 108, 2, 23, 2], with the names equal to the sketch. Only #4 (108) contains `StudioWorkspace`, `ArrangementTransport`, `ArrangementRuler` and `ArrangementLibrary`, and every 23-commit contains `ArrangementProjectEndTextInner`. The provider rendered on no move.</li><li>`fade-moves` [22×4] and `trim-moves` [23, 2 ×4] equal HEAD in counts and names.</li></ul>This probe does not record the ruler width per commit. As in round 329, C identifies #4 as the second-crossing commit from END-LIVE's 4 ruler widths | `names-a.json`, `names-compare.txt` |
| **D-ROWS (browser)** | **PASS.** `DIFFS 0` (HEAD vs A, both viewports), with `errors` [] on both trees. The EXPORT WAV sha256 `453d1a04…dac567` is the same on A and HEAD at both viewports, and equal to round 329. C's own parse is below the table | `rows/rows-{a,head}.json`, `rows/rows-diff.txt`, `rows/wav-sha.txt`, `rows/wavcheck.txt`, `rows/shots/` |
| **PERF** | **PASS.**<ul><li>rc 0, `failures` [], 167 rows; all 36 asserted rows PASS.</li><li>Compared with C round 328: **113 EQUAL**, and the only DIFFs are the 8 move record rows. This includes `click.components` 106, range `move-components-max` 30, `-per-move` 9.233, zoom.1 99, zoom.30 244, and play start/stop 90.</li><li>Record rows: `interact.drag.move.{stopped,playing}.move-components-per-move` (and `.6x`) **30.367**, and `-max` (and `.6x`) **108**. Both are within the ≤ 31 / ≤ 108 finding thresholds, and they equal B's sketch.</li><li>`move-restarts` while playing: 0.</li></ul> | `perf-interactions-atree-results/latest-interactions.json`, `perf-rowcmp-vs-c328.txt`, `perf-interactions-atree.log` |
| G330-AUTH | **PASS**, both viewports, in fresh anonymous contexts.<ul><li>`/studio-lab`: workspace and demo badge shown, `auth_user` null, no page errors.</li><li>`/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401. A fake bearer → 500 "Unable to prepare Studio access", with no token. This equals round 329 (no backend in the cloud).</li></ul>Attempt 1 timed out on the cold compile of the legacy route. It was environment-invalid, is kept, and was replaced after a warm GET | `g330-auth.json`, `g330-auth.log`, `g330-auth-attempt1.log`, `shots/` |
| DOCS | **PASS.**<ul><li>l.4 is byte-equal to §1.3.</li><li>The 7 `##` headings are in TEMPLATE order.</li><li>c1 item 23 (the memo leaf) is present.</li><li>The C-R329-01 Problem → Solution entry is present.</li><li>ტესტირება names DP23 and DP24.</li><li>The TODO line for A-R329-REVIEW-VIEWPORT-BOUND (D-29z957) is present.</li><li>Every DP id cited in the doc exists as an `it('DP…` row.</li></ul>The round-330 testing line cites B's sketch perf numbers with their source. C's measured numbers are equal (30.367 / 108) | doc 232 |

**Gate rows** (not claimed by C): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**D-ROWS: C's own WAV parse** (`rows/wavcheck.txt`):
- PCM, 2 channels, 48 kHz, 24-bit;
- 5,703,120 frames = **118.815 s**;
- the first audible sample is at 41.910 s (the clip start);
- 20 full-scale samples (INFO-C329-FULLSCALE, the same as HEAD).

A and HEAD are byte-identical.

## Findings
There are no new bugs.

Signals for B (info, not findings against this round):
- **INFO-C330-DP24-FAR.** This is A's reviewer Low 1, and C confirms it by reading the code. DP24's far-move `> 20` step would also pass if the loop were ignored. The loop proof is the `20.000` assertion at rest and after the 12.750 move, and MU-OVERVIEW-NO-LOOP is red on it. Optional: pin the exact far-move extent.
- **INFO-C330-DP21-GRANT.** A's DP21 Undo lines go beyond the §3 DP21 item (a key rename only). §2.2 SOURCE-SCOPE allows them ("unless A strengthened a test: only test hunks may differ, with no `expect(` removed"), and C's own mutant shows they guard a real regression. C sees no reason to revert them. B should record a D-ID that accepts the 7 lines or asks for their removal, so that the grant question is ruled.
- **INFO-C330-ENV.** Two first attempts were environment-invalid cold compiles: the HEAD warm-up and G330-AUTH attempt 1. Both were replaced, and the originals are kept.
- INFO-C329-FULLSCALE persists, unchanged at HEAD (signal D-29z959).

## Ableton conformance
Not applicable. This is a perf fix-up, and the behaviour is held to HEAD (END-LIVE, VIEWPORT-BOUND and D-ROWS equal HEAD).

## For B
- Stage c1 has C PASS. Gate 330 can publish rounds 329 and 330 together.
- C-R329-01, C-R329-02 and C-R328-01 (DP20) can close when the gate publishes.
- Next round: REGRESSION if it is planned on or after 2026-11-05 (D-29z961).
