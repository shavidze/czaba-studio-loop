# C round 117: verification of C-R116-01 (lane-slider test scope)

Verifier: C · 2026-10-23, 20:52–20:58 UTC · Chromium 143.0.7499.4 (Playwright, headless, a fresh context per session) · target `http://127.0.0.1:5173/studio-lab`

**Verdict: PASS**, with `browserVerified: true` and `realVerified: true`. No bugs found.

## Source scope (SOURCE-SCOPE: PASS)
- HEAD is `d5de68f`. `git status --porcelain | md5sum` = `4de7f1c040e7aa4c86108c8608d102c1` at both start and end. This matches A's end value.
- The status is exactly the §2 end state: the round-116 set plus ` M track-group-mix-ui.test.tsx` (`out/git-status-end.txt`).
- `sha256sum -c` of `b-round-116-r117-tree-sha256.txt` (928 entries): OK at both start and end.
- Protected files: `fa2cf0bc`, `13914809`, `56f5b76f` and `bf9ee257` are unchanged, and `git diff d5de68f` on them is empty.
- `track-group-mix-ui.test.tsx` sha256 `5de78398…` equals A's `final.sha256`.
- The carry-over of the round-116 measured rows therefore stands.

## AN-REVIEW: PASS
- The diff contains only the import plus the R1 lines: l.482, l.522, l.569 (`'-6'`), l.571, l.575 (wrapped, still an exact `toEqual`), l.657 (`'-3.1'`) and l.660.
- `expect(` count is 131 → 131 and `it(` count is 10 → 10.
- l.480, l.576, the group-fader lines and the context lines are untouched.
- No `toBeCloseTo` or other looser matcher was added.

## DOC-100: PASS
- The R4 bullet is in **ტესტირება** at l.65.
- l.4 still reads „Round 116 — C-ის შემოწმებას ელოდება …“.
- Limitation: doc 100 is untracked, and neither `c-round-116/` nor `a-round-116/` holds a copy or hash of it, so I could not diff the rest of the file. I checked only the R4 text and l.4.

## T117-TARGETED: PASS
- The 19 files from `a-round-117/files19.txt`: 19 files, **370/370** (`out/vitest19.log`).
- `meter-ui` + `track-pan`: **38/38** (`out/vitest-meter-pan.log`).
- C did not repeat the k1/k2 mutations, because C does not edit source. Instead I read A's logs:
  - `a-round-117/k1.txt`: UM5 is red with `expected 1 to be 0.5011872336272722` at l.572.
  - `a-round-117/k2.txt`: UM5 is red with `- "stems": 0.25` / `+ "stems": 0.2505936168136361` at l.576.
  - Both logs match A's report. This is A's evidence, read by C; C did not rerun the mutations.

## LANE-WRITE-GREP: PASS
- I grepped `app` and `e2e` test files for `laneFader(`, `Volume — `, `name: /^Volume — ` and `aria-label^="Volume`.
- 14 files match (`out/lane-grep-files.txt`). All 14 are in the 19-file list. `e2e` has no match.
- `trackVolume(` and `keyboardFader(` appear only in `gesture-guard` and `track-group-mix-ui`, which are both in the list.
- I did not grep `fireEvent.change` directly. Any `fireEvent.change` on a lane fader has to reach the fader through one of the lane selectors above, so it is covered by that grep.

## Browser rows
Setup:
- `demo-middle-east` on music @0, `demo-stem-pulse` on stems @2 s and `demo-soft-impact` on SFX @4 s, each added from the library with Enter at the insert marker.
- The status line confirmed each add. Snap was off.

| Row | 1440×900 (run 2) | 1280×720 (run 1) |
|---|---|---|
| TV-PRESENT | PASS: all 4 lanes min −60, max 0, value 0, valuetext `+0.0 dB`, readout `+0.0` | PASS (same values) |
| TV-DRAG | PASS: w 103 px, Δ −11.7 dB (expected −11.65 ± 0.683); readout and valuetext agree; exactly one `Undo: Volume` entry after the Pan sentinel; Ctrl+Z gives `+0.0` and the sentinel title returns | PASS (same numbers) |
| NB-GROUP | PASS: Ctrl+G; group fader 100% → 58% (Δ −0.42, expected −0.417); one Volume entry; Undo gives 100%; stems/SFX lanes stay `+0.0` | PASS (same numbers) |

- The 1440 run 1 crashed in setup before any row ran: `grid-control` was null right after load. The cause is inferred, not proven: it was the first `/studio-lab` load of this job, and the 5 fresh sessions after it were all clean. The log is kept as `out/lane-1440-1-envfail.log`. This is an invalid environment attempt (1 of the 2 allowed), and run 2 is valid.
- Screenshots: `c-round-117/shots/*`.

## G117-3: PASS, plus one BLOCKED part
Run alone and last, in a new context with no credentials:
- `/studio-lab`: the workspace and the demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“ are shown.
- `/studio/middle-east`: shows "Sign in required", no workspace, 0 `audio[src]`.
- `/api/studio-token?product=middle-east&file=stem1.wav` returns **401** `{"error":"Please sign in to access Studio."}`.
- The fake-Bearer 403 check is **BLOCKED** (backend unavailable in cloud).
- Evidence: `out/g117-3.json` and `shots/g117-3-*.png`.

## PX-NET / REG-HYD: PASS
- Every session had 0 forbidden-host requests, 0 `Authorization` headers, 0 hydration messages, 0 `pageerror` and 0 non-noise console errors.
- Each lane session had 2 console errors that are known cloud noise (cart / connection).

## Carried from c-round-116.json (not re-measured, because SOURCE-SCOPE passed)
TV-LAYOUT, TV-EXACT-UNDO, TV-INF, TV-KEY, TV-DBL, TV-PLAY, G-T3, G-T4, G-INF, G-VIDEO, NB-TRACK-SHIFT, NB-MASTER, NB-CLIP and NB-PAN-MS.

## Gate rows (not claimed by C)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## Ableton correspondence
Not applicable: this was a test-scope round with no new behaviour.

## For B
- C-R116-01 is closed by this evidence.
- T12 stage 3a can go to `c_pass`, pending the root gate for rounds 116 and 117 together.
- The doc 100 TODO line about the B decision on UM3/UM5/UM9 is now stale. Root or B should clean it up after the gate; it is not a bug.
- New findings: none.
