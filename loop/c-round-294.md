# C round 294: FIX-PD-1c3 (GATE293-T1 ST6 fix-up). Verdict: **PASS**

- `browserVerified`: true. `realVerified`: true.
- Env: `env-status.json` (round 294, store 200).
- Evidence folder: `c-round-294/`. Machine-readable result: `c-round-294.json`.
- C changed no app source. Scratch copies were made under `/tmp` only.

## Rows
| Row | Result | Evidence and measurement |
|---|---|---|
| CLAIMS | PASS | `claims-diff.txt`: deltas only in the allowed K2 (9→10), K3 (rc 1), K6 (746 lines, `totals l.` empty, StudioNarrowScreen 1), K9 (old title 0), K10 (`Completed (C round 294 PASS)`) and K11 (stopLibraryPreview 1, ST6/GATE293 2, TH4 line 66→67). Every other K line is identical. |
| SOURCE-SCOPE | PASS | `git status` shows exactly 10 paths. `sha256sum -c` fails only on the 3 §4 paths, and all 7 protected files are OK. Both test diffs reverse-apply B's sketches to the frozen hashes exactly (`sketch-exact.txt`). No non-test, non-doc file differs. The state was the same after all of C's runs. |
| TYPECHECK | PASS | rc 0 |
| UNIT | PASS | 6 files and 90 tests pass. ST6 took 21 ms and TH4 (new title) 11 ms. The slowest test was NG5 at 691 ms of 15 000 ms (4.6 %). |
| UNIT-MUTANTS | PASS | (a) Footer `<footer data-studio-theme="obsidian">`: ST6 red, `{5,3}` vs `{4,2}`. (b) Old map: ST6 red, `{4,2}` vs `{3,1}`. The scratch `diff -r` after restoring is empty. |
| B-MARKER | PASS | `/studio-lab` at 1440 and 1280: 1 marker, on the `div.studio-container` that holds `arrangement-exit`, and `body:has(...)` matches. At 390×844 (direct load): 1 marker, on `main[data-testid=studio-narrow-screen]`. `/` and `/store` at 1440: status 200, 0 markers in the DOM and 0 in the SSR HTML. No hydration warnings. Screenshots: `shots/marker-*`. |
| B-DESK-SAME | PASS (same-machine control) | Current tree vs HEAD `88b23dd` rendered on the same machine (git archive on :3294 with its own cacheDir): **0 px** at 1280×720 and 1440×900. The literal comparison with `b-round-291/probe/desk-5173-*` gives **15 / 22 px** (max delta 1, deterministic over 3 attempts), but HEAD on this machine gives the same 15 / 22 px. C-293's shots vs the baseline are 0 px. This is cross-job raster drift; see INFO-C294-DESK-BASELINE-DRIFT. |
| G294-AUTH | PASS | Fresh contexts, no credentials. `/studio-lab` at 1440 shows the demo badge with `auth_user` null; at 390 it shows the narrow state with `auth_user` null. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token`: GET 401, POST 405, no token in either. Attempt 1 was environment-invalid (navigation race) and was replaced once. |
| DOC-218 | PASS | l.4 is byte-exact. l.21 names both `togglePlayback` and `stopLibraryPreview`. The GATE293-T1 Problem → Solution entry is present (l.62) and the ST6 sentence is on l.67. All cited ids exist in `backlog.json` or the tests. |
| gate | gate | Full suite (with ST6), build, Biome, verify and smoke are root's rows; they are not claimed here. |

**Carried rows (not re-run, not in `passed`):** the round-293 and round-292 rows, on the strength of SOURCE-SCOPE: app source is byte-identical to the tree C passed in round 293. **No audio, export or source-timing measurement was made this round.** One playback sanity probe in attempt 1 read RMS 0 and was dropped as a non-row. It is not evidence either way.

## Findings
- **A-R294-REVIEW-L-DOC-FILELIST (Low; origin A's code-reviewer, confirmed by C).** Doc 218's "შეცვლილი ფაილები" list (l.44–53) does not name `app/lib/__tests__/store-theme-tokens.test.ts`. The fix is outside the grant, so B should schedule it. Suggested bullet: `` `app/lib/__tests__/store-theme-tokens.test.ts` — ST6: ზუსტ map-ში `StudioNarrowScreen.tsx` (total 4, script 2). ``
- **INFO-C294-DESK-BASELINE-DRIFT (origin C, environment).** A baseline captured in another job is not pixel-stable: ±1 LSB on the anti-aliased corners of `arrangement-library-search` and two rounded footer buttons. Proposal to B: define desk-sameness as "0 px vs HEAD rendered in the same job", or re-capture the baseline in each job. Evidence: `desk-headctrl.json`, `desk-control.json`, `pxdiff.cjs`.
- **INFO-C294-STORE-NO-MAIN-LANDMARK (origin C; B's row wording, a pre-existing a11y gap).** `/` and `/store` have no `<main>` or `role=main`, both at HEAD and now, so the row's "main landmark → BLOCKED" clause cannot be the test. C judged rendering by status 200 and the visible h1. The missing landmark (WCAG 1.3.1/2.4.1) is for B to rule on in the STORE stages.
- **INFO-C294-TOKEN-POST-405-STACK (origin C, pre-existing).** POST `/api/studio-token` on the dev server returns 405 with a Remix error body that includes a stack trace, and no token. This is a protected file. Whether production strips the stack trace was not verified.
- **INFO-C294-AUTH-ATTEMPT1 (environment).** One replacement was used. The record is in `c294-attempt1.json`.
- **INFO-C294-STORE-BACKENDLESS.** `/store` shows only its hero because there is no backend in the cloud. This is expected.

## Ableton conformity
- **CZABA requirement:** the Store never wears the Studio theme, and both Studio surfaces do. **Met** (B-MARKER).
- **Ableton conformity:** not applicable (a test- and doc-only gate fix-up).

## Housekeeping
- The :3294 control server is stopped; it used its own cacheDir, `/tmp/c294head-vitecache`.
- Root :5173 still answers 200.
- No commits, pushes or app edits.
