# C round 326: GATE325-IM24-WALLCLOCK, independent verification

**Verdict: PASS** (browserVerified = realVerified = true). The 1-line IM24 freeze and the doc bullet are exactly as specified, and they make IM24 deterministic. There is one **Low** finding (C-R326-01) about the B-IM24 browser row: IM24's playing-state tail is not reachable in the real app. It is pre-existing and was not caused by this round. B routes it to SYS-R2-FAKE-FIDELITY / deferred_low_polish.

env-status.json: store 200 (2026-11-04T03:54Z, round 326). The backend is not needed for these rows.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS. Run first (0 min). Byte-equal to `a-round-326/claims-after.txt`. Against planning, only K2 `b925434 17`, K3 `1`, K11 first value (`f82813bbdc5e`, ruled) and K17 `1 2` differ. K12 `a098fabed5c4 cfe1faaafc67` equals planning. K8 11. The end-of-phase re-run is identical | `c-round-326/claims.txt`, `claims-end.txt` |
| K11 ruling | PASS. `git diff --name-only HEAD -- app perf \| sort` = `b-round-325/app-perf-changed-files.txt` + the IM file | run in session (NAMELIST-OK) |
| SOURCE-SCOPE | PASS. 17 status entries (round 325's 16 + the IM file). The IM diff is `1 insertion(+)`, exactly `vi.spyOn(Date, 'now').mockReturnValue(Date.now());` after `mountMarkerWorkspace()` in IM24. Protected 11/11 (K8) | git output in session |
| UNIT | PASS. On C's scratch copy: alone ×3, 29/29 each. Under load (2 × `node -e "for(;;){}"`, 4 vCPU) ×3: 29/29 each, IM24 103/130/124 ms. Order check (IM24 then IM21, `-t`): both green, so there is no leak of the frozen clock | `c-round-326/unit-alone-{1,2,3}.log`, `unit-load-{1,2,3}.log`, `order-im24-im21.log` |
| MUTANT | PASS. m1 pre-fix + MU-DELAY-60: **red** `16.019`. m2 fixed + MU-DELAY-60 as-is: green. B's patch has no context, so on the fixed file it lands before the 5th `key(ctrlRight)`. m3 fixed + delay at the identical spot (after the key, before the read): green. **C's own mutants:** m4 fixed + a 200 ms busy-wait at every playing step: green. m5 spy line removed + MU-DELAY-60: red `16.019`. m6 app mutant `ArrangementMarkerRow.tsx` `seekTo` only when not playing: red `[0,0,0,0,0]` on the IM24 playing assert. Restored: 29/29 | `c-round-326/mutants/*.log`, `*-context.txt`, `m6-app-noseek-while-playing.diff` |
| EXPECT | PASS. 204 in the tree, 204 at HEAD | session |
| DOCS | PASS, with a limitation. The new bullet sits inside `## პრობლემები და გადაწყვეტები`, in Problem → Solution form (Georgian, terms in English). l.4 is byte-equal to K13. The 7 headings are in TEMPLATE order. **Limitation:** there is no prior C copy and no per-path hash in `gates/gate-round-325.json` (the doc is untracked). "Only the one bullet changed" therefore rests on structure, K17 (IM24 mentions 0 → 2, both in the new bullet) and l.4 equality, not on a byte diff | doc l.64–75 |
| B-IM24 (browser) | **PARTIAL, not in `passed`.** Both viewports, fresh anonymous context, Pulse clip 0–16 s, markers added by Alt-click + M + Enter at exactly 00:02.000 and 00:06.000. Home, then Space plays. Ctrl+Right while playing: **2.069 → 6.060** (1440) and **2.060 → 6.060** (1280), so 2 then 6, in order. The 3rd press goes to 16.000 (clip edge = project end), and playback **stops** (`playing=false`). Later presses give the stopped text `No more markers after the insert marker`. The expected tail ("No more markers after the playhead" + still Playing) is not met → C-R326-01 | `c-round-326/b-im24.json`, `shots/bim24-*` |
| G326-AUTH | PASS, both viewports. `/studio-lab`: workspace + "Demo collection — no sign-in required" badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`. `/api/studio-token`: no header 401, fake bearer 500 (no token), bare 400 | `c-round-326/g326-auth.json`, `shots/lab-*`, `shots/legacy-*` |
| CARRY-325 | PASS. K12 equals planning at start and end, so the round-325 evidence still applies; not re-run | claims |

**Gate rows (not claimed):** full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke. The gate re-runs them on the combined 325 + 326 tree.

**Environment-invalid replacements:** b-im24 attempt 1 and g326-auth attempt 1 timed out on the dev server's cold first compile (`*-attempt1-*.log`). Each got one replacement.

## Finding C-R326-01 (Low)
- **Origin:** B's row text plus jsdom test-fake fidelity. This is pre-existing IM24 content; round 326 did not cause it.
- **Steps:** as in B-IM24 above.
- **Expected (row / IM24):** after the last marker, `No more markers after the playhead` and Playing. IM24 asserts `[2,6,10,16,16]` with `isPlaying` true.
- **Actual:** `adjacentMarkerTarget` always uses projectEnd as the last forward stop (markers.ts:162). The rAF `tick` stops playback at `current >= end` when no loop is active (ArrangementContext.tsx:1263–1269). The real app therefore stops at 16 s. Stopping at the project end is the agreed, browser-verified contract (c-round-272 B-ATEND).
- **Bounded probe:** two synchronous Ctrl+Right keydowns from 6 s. The playing text `No more markers after the playhead` **does render**, but within 50 ms the transport is Stopped at 00:16.000 (`probe-sync-ctrlright.json`, both viewports). IM24's "Playing at 16" state exists only because jsdom never runs the end-stop tick.
- **Suggestion for B:** under SYS-R2-FAKE-FIDELITY, either make IM24's tail assert the end-stop or use a fixture whose project end lies past the last stop. No app change is implied.

## Info for B (not findings)
- **INFO-C326-PLAYING-STEP-MOVES-INSERT-MARKER:** during playback, Ctrl+Right also moves the insert marker. The library panel shows "insert marker 00:06.000" (`shots/bim24-1280x720-03-ctrlright-2.png`). B should confirm this against SABA-B-10a (D-29z436).
- **INFO-C326-END-STOP-STALE-STATUS:** after the auto-stop at the end (reached by Ctrl+Right), the status still read "Marker “Marker 2” added at 00:06.000." This is the same class as SYS-6 status lifetime. Classification probe (`probe-natural-end.json`, 1280×720): when playback reaches 16 s naturally with no keys pressed, the previous status also stays. The behaviour is consistent, so this stays info.
- The `noclip` variant is context only. With no clip, the Alt-clicks clamp to 0 and Space says "Nothing to play".

## L57 fields
- `manifestPaths`: 25 cited artifacts, all present (`c-round-326/manifest-check.txt`). `missingPaths` and `countMismatches` are both none.
- A's numbers match its logs: IM24 93/98/92 ms, prefix mutant 16.018. B's sketch log shows 16.021, red (re-read).
- `assertsSpecified` 1, `mutantsRecorded` 1, `mutantRedOnSketch` true, `mutantRedOnTree` true (m1).
- `gateChecksNamed` 6, `gateChecksRunOnSketch` 0 ("B ran only the touched file").
- `chainHeadGateRunGreen` null ("not a fix-up chain; gate 326 is the first re-run").

**Ableton conformance:** not applicable (test-only round). For context: Live keeps playing past the arrangement end, while CZABA stops. This is an existing difference and is not re-ruled here.

Source stayed read-only. The scratch copy `/tmp/c326-scratch` was removed. `store/` still shows 17 entries, and the end-of-phase claims equal the start.
