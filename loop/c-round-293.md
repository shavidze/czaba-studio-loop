# C round 293 — FIX-PD-1c2 (C-R292-01): narrowing stops the library preview

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs. All 13 specified rows pass. The `gate` row belongs to root.

Baseline: HEAD `88b23dd` + A's working tree (9 paths). C did not edit app source. Mutants ran on a scratch copy (`/tmp/c293-scratch`), and its restore diff is empty.

## Rows
| Row | Result | Evidence / measurement |
|---|---|---|
| CLAIMS | PASS | `c-round-293/claims-on-A.txt`. Every delta is on the allow-list: K3 rc 1; K5 94 lines + `stopLibraryPreview` destructure; K6 3; K10 440 lines / 16 rows / NG5c 1; K11 `Completed (C round 293 PASS)`. K2 is still 9. The one extra delta, **K15 1→2**, is INFO-C293-K15: the claim greps the whole file, NG5b still uses `demo-soft-impact` once (l.193), and NG5c (l.239) adds the second use that §3.2 requires |
| SOURCE-SCOPE | PASS | `git status` shows the 9 round-292 paths. `sha256sum -c` fails only on `studio-lab.tsx`, the test file and doc 218 (`sha-check.txt`). The 7 protected files are OK |
| TYPECHECK | PASS | rc 0 (`typecheck.log`) |
| UNIT | PASS | 5 files, 46/46 (`covering.log`). NG1–NG9, NG5b, NG5c, NG7a–d, NG9b and NG9c are present by name. Slowest is NG5 at 918 ms of 15 000 (6 %); NG5c takes 248 ms |
| UNIT-MUTANTS | PASS | (a) effect deleted → only NG5c red. (b) M9 stop child removed → NG5b and NG5c red. (c) server snapshot false → NG9c red (`mutants.json`, `mutant-*.log`) |
| B-NARROW-PREVIEW | PASS | Preview of Bass plays at RMS 0.112 with the toggle reading `Stop`. Resized 1440→899, 1280→899 and 1440→390: master-tap RMS is **0 at 100, 200 and 300 ms and at 1, 5 and 10 s**. After widening, the toggle reads `Preview`, Bass is still selected (no re-select needed), and Preview plays again at RMS 0.067–0.084. Shots: `shots/preview-*-{narrow,widened,replay}.png` |
| B-NARROW-MIX | PASS | Preview playing, resize to 390, native Play: `paused` false, `currentTime` 0.398 → 1.902 s, Studio master tap 0 and 0. Only one source sounds (`shots/mix-390-native-play.png`) |
| B-RESIZE-KEEP | PASS | **(a)** All 4 mute buttons `aria-pressed=false`. The clip landed on lane `music` and plays at RMS 0.045 / 0.048. After resizing to 899, RMS is 0 at 100 ms…1 s and `studio-narrow-heading` has focus. **(b)** Music muted, then 899 and back: clips 1 = 1, Music still muted, `data-playing=false`, focus on `arrangement-exit`, and Ctrl+Z un-mutes. Both viewports |
| B-NARROW-WIDE | PASS | 390→1440: focus on `arrangement-exit`, narrow state hidden. After add + Play: `data-playing=true`, RMS 0.045 |
| B-DESK-SAME | PASS | 0 differing pixels against `b-round-291/probe/desk-5173-*.png` at 1280×720 and 1440×900. 0 hydration warnings |
| B-NARROW-LOAD (short) | PASS | 390×844: narrow state shown, `activeElement` is BODY, `arrangement-exit` is not in the DOM, 0 hydration warnings, no errors |
| G293-AUTH | PASS | `/studio-lab` anonymous: at 1440 the badge reads "Demo collection — no sign-in required"; at 390 the narrow state shows; `auth_user` is null at both. `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`. Token API: GET 401 "Please sign in", POST 405, no token in either. Attempt 1 threw mid-navigation (`document.body` null). That attempt was environment-invalid and was replaced once (INFO-C293-AUTH-ATTEMPT1) |
| DOC-218 | PASS | l.4 byte-exact. The C-R292-01 Problem → Solution entry is at l.61. NG5c is cited (l.65) and exists. The other cited ids also exist: NG1/5b/7a/9/9b/9c, TH4, TH10, LRS4 |
| gate | gate | Full suite, build, Biome, `verify` and `test:e2e:smoke` are root's gate rows |

Carried from round 292 and not re-run: B-BOUNDARY, B-THEME, B-AX, B-FOCUS-ORDER, B-PREVIEW, B-SEND, B-AUDIO-ERROR, B-NET and B-JOURNEY-292. SOURCE-SCOPE shows their files are byte-identical to the tree that passed in round 292.

## INFO (for B, no bug)
- **INFO-C293-K15** (origin C): K15 counts the whole file, so it reads 2. This is an expected spec gap that A flagged; it is not an A deviation.
- **INFO-C293-DOC-L21** (origin A's reviewer, confirmed by C): the approach section of doc 218 (l.21) names only `togglePlayback` for the narrowed branch. It does not claim "all sound", and it is outside the §4 grant. Add one clause at the next doc touch.
- **INFO-C293-BASS-NAME** (origin C): the library option's accessible name is `BassStem00:16.000`, and the collection label "Synthetic demo · Night Pulse" is a group heading. The spec's "Night Pulse · Bass" refers to this option.
- **INFO-C293-AUTH-ATTEMPT1**: see G293-AUTH above.
- **INFO-C293-L49**: the L49 subtree-unmount clause (D-29z730) is present at lessons.md l.34; lessons.md has 59 lines.
- A's Architecture note (a `silenceAll()` context method) is B's decision. C did not act on it.

## Requirement vs Ableton
- **CZABA requirement** "a narrowed Studio makes no sound the user cannot see or stop": **met** for the transport, the library preview and the video dock. The video dock unmounts with the workspace.
- **Ableton conformity:** not applicable. Live has no browser or phone version.

## Reproduce
From `tmp/studio-real-loop/c-round-293/`, run `node c293.cjs '<rowRegex>'`. Results go to `c293.json` and screenshots to `shots/`. Mutants: `python3 -I mutants.py` on a scratch copy of `store/` at `/tmp/c293-scratch`, with node_modules symlinked.
