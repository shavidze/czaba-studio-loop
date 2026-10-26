# C round 184 — ROOT-RECON-GRID-HARNESS (D-29z149)

Verifier: C · Date: 2026-10-26 · HEAD `423fbc4` · Test-only round · **Verdict: PASS, 0 bugs** · browserVerified = realVerified = **true**

All evidence paths are relative to `tmp/studio-real-loop/c-round-184/` unless stated otherwise. I did not trust A's claims: every row below was re-run or re-derived by C.

## Results
| Row | Result | Evidence |
|---|---|---|
| T184-TARGETED | **PASS** | My own run: `out/vitest-c.json` + `out/vitest-c.log`, 3 files (`testResults` = 3: musical 14, snap 20, triplet 11), 45 passed, 0 failed, 0 pending, 0 todo, rc=0. I built the name list with **my own** tool (`tools/names.cjs`, not B's script). `out/vitest-c-names.txt` is `cmp`-byte-equal to `b-round-183/out/vitest-base-names.txt` (45 lines), so R49 holds. The helper is not collected: `npx vitest run …/helpers/workspace-test-environment` printed "No test files found", rc=1 (`out/not-collected.log`). |
| SCOPE-184 | **PASS** | At C's start and end: frozen list 1005 OK; A's `end-sha256.txt` 6/6 OK. `git status` = 4 ` M` + 2 `??` (`helpers/`, doc 152). `git diff 423fbc4 --stat` = only the 4 grants (+27/−237). `git diff --name-only -- app` = the 3 suites only; the only untracked file under `app/` is the helper. The full tree hash (tracked + untracked, 1011 files) is identical at start and end: `start-tree-sha256.txt` and `end-tree-sha256.txt` are `cmp`-equal. HEAD is unchanged. |
| AN-REVIEW-184 | **PASS** | Mechanical check: `diff <(sed -n 2,80p helper \| sed 's/^  //') <(sed -n 23,101p b-round-183/r184-granted-start/grid-snap-ui.test.tsx)` is empty. The helper's only non-indented lines are `export function createWorkspaceTestEnvironment() {` (l.1) and `}` (l.88). `fakeClock` and every class are created inside the function, with no module-level state (R47). l.81–87 are only the `return { fakeClock, FakeAudioContext, FakeOfflineAudioContext, FakeAudioBuffer, FakeResizeObserver }`. `grep` finds no `any`, `@ts-`, ` as ` or comments. The 3 start blocks (snap 23–101, musical 29–107, triplet 30–108) are identical to each other. The diff against the start copies has exactly 2 hunks per suite: snap `13a14` + `23,100c24,30`; musical `19a20` + `29,106c30,36`; triplet `20a21` + `30,107c31,37`. So `vi.mock`, `beforeEach`/`afterEach` and all tests are byte-identical. D1 (doc 151): only l.4, l.73 and l.75 changed, as written; l.74 is unchanged. D2 (doc 152): Georgian, TEMPLATE sections, status `In Progress (awaiting C round 184)`. It contains the approval source, why `3ea2e04` is not used, R47–R49, the 45 (20/14/11) base, m312/m313, the 73-copy TODO signal and the Ableton row "არ ეხება". |
| MUT-184 (read-only) | **PASS** | `a-round-184/mut/m312-typecheck.log` has TS2724 in each suite (musical 20,10; snap 14,10; triplet 21,10). `m312-vitest.log` has "Failed Suites 3" with `createWorkspaceTestEnvironment is not a function`. `m313-vitest.json`: 45/45 passed, and `m313-red.txt` is empty, so **0 red**. A has no separate restore-sha log. The restore is confirmed by **my** check instead: A's `end-sha256.txt` 6/6 OK, the empty mechanical diff on the current helper, and `currentTime` at l.37–38 reads `Date.now() / 1000 - fakeClock.base`. |
| STUDIO-RV-184 | **PASS** | Warm-up first (`out/warm.log`, discarded). Then a fresh anonymous context, DPR 2, `--disable-lcd-text`, fonts loaded in both sessions. Full-image diff over all pixels, not a crop: 1280×720 `shots/c184-1280-1/rest-full.png` vs `c-round-183/shots/c183-1280-1/rest-full.png`: **0 changed of 2560×1440**, maxDelta 0. 1440×900 `shots/c184-1440-1/rest-full.png` vs `c-round-183/shots/c183-1440-2/rest-full.png`: **0 changed of 2880×1800**, maxDelta 0. ENV-FIRST-LOAD did not occur, so nothing was replaced. Data: `out/c184-{1280,1440}-1.json`. |
| G184-3 | **PASS** (anonymous, protected, 401) | `out/g184-3.json`. Anonymous `/studio-lab`: `auth_user` null, 0 cookies, workspace and demo badge present (`shots/g184-3-lab-1440.png`). `/studio/middle-east` at 1440 and 1280: "Sign in required", no workspace, 0 `audio[src]` (`shots/g184-3-protected-{1440,1280}.png`). `GET /api/studio-token?product=middle-east&file=stem1.wav` returns **401** `{"error":"Please sign in to access Studio."}`. Premium auth is not bypassed. |
| G184-3 fake-Bearer 403 | **BLOCKED** | Backend unavailable in cloud. |
| PX-NET / REG-HYD | **PASS** | Every session (RV 1280, RV 1440, G184-3, flow): 0 forbidden hosts, 0 Authorization headers, 0 hydration messages, 0 pageerror and 0 non-noise console errors. The three lib-based sessions (RV 1280, RV 1440, flow) each had 2 cart/connection noise errors (expected in the cloud). G184-3 has no noise counter; it recorded 0 errors, 0 hydration, 0 forbidden and 0 auth. |

**Gate rows (not C's, not in `passed`):** full vitest (it must collect the 3 suites and must not count the helper as a file), typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL. Per the speed rules, C did not run the full suite, verify or the build.

## Informational real-flow smoke (not an acceptance row; no source changed)
`tools/c184-flow.cjs` → `out/c184-flow-1440.json`, `shots/c184-flow-1440-arranged.png`. Fresh anonymous context, 1440×900:
- **Find and add:** 9 demo sources are listed. `demo-middle-east` was added to Music at 2 s with Snap off. Status: "added to the Music track at 00:02.000"; the clip has start 2 and a width of 101.352 s.
- **Video:** owned synthetic `media/beeps-6s-h264-aac.mp4` went onto the video lane at 0 s, 6 s long.
- **Play 3 s from 0:** the playhead was at 2.971 s and `video.currentTime` at 2.965 s (playing, readyState 4); wall time was 3.023 s. The real audio-graph tap on the destination had a max peak of 0.748, and 80 of 200 frames were non-zero.
- **Export WAV (project):** `czaba-studio-lab.wav`, RIFF PCM 24-bit, 48 kHz, stereo, 4,960,896 frames = **103.352 s** (2 s + 101.352 s, matching the project end). The status line said "WAV created: 01:43.352". There are 0 NaN samples. 0–1.9 s holds only the video's beeps (20,096 non-zero samples), and 2.1–4 s is fully music (182,360 of 182,400 samples non-zero). I removed the 29.7 MB WAV after measuring it, as earlier rounds did. Its sha256 is in `out/flow-wav-sha256.txt`.
- The export has 30 full-scale samples (peak 1.0). The decoded source `/middle-east.mp3` itself has **30** full-scale samples (`out/src-peak.json`). The export passes the source through at unity gain and adds no clipping, so this is not a bug.

## Information for B
- **m313 = 0 red** (confirmed from A's artifacts): the 3 suites never assert anything through the fake clock's value. Adding an assertion is B's decision. This is not A's defect.
- **The code-reviewer's Architecture note, verbatim from `a-round-184.md`:**
  > One signal: checkpoint signal 3 (repeated expensive change in one region). The same Web Audio/ResizeObserver fakes block is still copied in 73 other suites, so any change to the fakes has to be repeated many times. Keep it as is for this round, because the user froze the scope at 3 suites. Proposal for the planner: one bounded task to move the remaining suites onto `createWorkspaceTestEnvironment()`. Before switching each suite, check that its fakes block is identical to the factory, and leave any suite whose copy has drifted on its own copy (or handle it separately) so its behaviour does not change silently. Pass criterion: each suite's diff is only the import and the destructure, and the suite passes before and after. This is a review of this diff only, not an audit of the module.
- The 73 remaining copies are a TODO signal only and are not scheduled. The user approved only 3 suites.
- Doc 152's status should become Completed after the gate (A/B's edit, not C's).

## Ableton
- **Meeting the CZABA requirement:** met (test-only extraction, served Studio pixel-identical).
- **Behavioural match with Ableton:** **არ ეხება** (not applicable). This is internal test infrastructure with no user-visible behaviour and no Ableton claim.

## State
- `c-browse.json`: every session was a fresh Playwright headless Chromium context, with no stored state and no credentials.
- C changed no source file, made no commit and did not push. The tree hash is the same at C's start and end.
