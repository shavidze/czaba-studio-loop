# C round 332 — PERF-DRAG-PREVIEW c2b-i: **PASS** (browserVerified true)

A's tree on :5173 vs HEAD `c1d3fbf` (git archive, own Vite cacheDir, :5197), 1440×900 and 1280×720. Evidence in `c-round-332/`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS — equals `a-round-332/claims-after.txt`, also at the end | `claims.txt` |
| SOURCE-SCOPE | PASS — 7 modified, 0 untracked; `git apply -R --check` passes; Lane/Overview/Clip/DetailPanel `git diff --quiet`; `app/` unchanged at end | |
| UNIT | PASS ×3 — 3 files, 53/53 each; DP29–DP32, PS-OVR-ROLES, PS-OVR-ARR once each | `unit-{1,2,3}.log` |
| MUTANT | PASS — 6/6 killed on the §0 rows, restored; C's own (drop `trackId` from the overview clip equality) red on PS-OVR-ROLES, restored | `mutants-b.txt`, `mutant-c.txt` |
| DRAG-NAMES | PASS — fade [11×4] with 0 Overview*/TrackMeter*; trim [22,2…]; move [21,2,21,2,103,2,21,2]; click [100,2,0]; name multisets equal B's sketch; 0 names gained vs C331; `ArrangementTrackMeterInner` in no commit | `names-a.json`, `names-compare.txt` |
| PERF | PASS — prod build, rc 0, complete, failures [], 36/36 asserted; 83 EQUAL; 38 DIFF are all lower and identical to B's sketch (fade 13.767→10.817, max 14→11; trim 24.583→23.6; move 29.4→28.2; click 106→102; play 90→86; zoom 99→95 / 244→240) | `perf-rowcmp-vs-c331.txt` |
| OVERVIEW-SHOWN | PASS — 23 samples/viewport, 0 diffs vs HEAD at both. Fade drag: bars and extent equal pre-drag. Move/trim: bars change every move (extent changes only on move, same as HEAD). Undo/add/delete correct | `ovr-compare.txt` |
| METER-SHOWN | PASS — meters move while playing and in fade, name-bar and Volume drags on both trees. Over latches (lane 2, sr-only "Music: the level went above 0 dBFS"), Master Peak click clears it after stop; identical to HEAD at both viewports | `ovr/latch-*.json` |
| D-ROWS | PASS — DIFFS 0; no page errors; EXPORT WAV sha `453d1a04…c567` equal on A and HEAD at both viewports | `rows/rows-diff.txt` |
| G332-AUTH | PASS — `/studio-lab` anonymous workspace + demo badge, auth_user null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; `/api/studio-token` no header 401, fake bearer 500 w/o token | `g332-auth.json` |
| DOCS | PASS — l.1/l.4, c2b-i section, 4 alternatives, 7 headings in order, cited DP/PS ids exist | |

Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed by C.

## Findings
None. Notes: A's reviewer item A-R332-REVIEW-OVERVIEW-PROP-TYPE (overview prop typed as full `Arrangement`) has no reproducible failure; a loop-toggle-during-hold row was not run by C. Environment-invalid attempts (cold compile while the perf build ran: G332-AUTH first try, probe timeouts) were replaced.
Ableton conformance: not applicable (perf round).
