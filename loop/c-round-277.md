# C — round 277 verification (GATE276 test-only fix-up)

**Verdict: PASS.** browserVerified = realVerified = true. No new bugs. Gate rows were not claimed.

The baseline is HEAD `a4c0e24` plus the round-276 working tree and A's round-277 edits. env-status: store 200, round 277. C changed no source. The manifest gave rc 0 both before and after C's runs.

## Rows
| Row | Result | Evidence (`c-round-277/`) |
|---|---|---|
| SOURCE-SCOPE | PASS | `manifest.log` rc 0 (1136 files). `git-status.txt` has 12 lines: 9 round-276 `M`, 2 granted tests `M`, doc 206 `??`. `grant-sha.log`: exactly the 3 grant files differ |
| HUNK-SCOPE | PASS | `hunk-ns.diff`, `hunk-tc.diff`, `hunk-doc.diff`. The test `+`/`-` lines are identical to `b-round-276/sketch.diff`. Doc 206 changes only at l.4 (byte-exact by `cmp`), plus 1 bullet and 1 testing line |
| TEST-CHANGES | PASS | NS1 goes from 1 to 4 assertions and keeps the old Split literal in the clip-selected state. NS6 goes from 1 to 2. TC9 goes from 1 to 2 and keeps `activeElement === redo`. No assertion was lost (L4) |
| CLAIMS | PASS | `claims-restored.txt` equals `b-round-276/claims-output.txt` (empty diff), run on a scratch copy with the planning copies put back |
| SWEEP | PASS | `claims-a-tree.txt`: SW-A finds 14 files and SW-B finds 6 hits. The navigation-strings hits are at l.227 and l.229, and the other 4 are unchanged. NS6's read is at l.434 |
| TESTS-TARGETED | PASS | `vitest-targeted.log`: 3 files, 36/36 pass |
| MUTANTS | PASS | N1: NS1, NS6 and TC9 red (3 failed / 15 passed). N2: NS1 red (1 failed / 17 passed). The scratch file was restored (`cmp`-equal) and the scratch copy removed |
| B-MATCH-SPLIT | PASS (1440×900, 1280×720) | `c277-bmatch-run2.json`, `bmatch-split-*.png` |
| B-MATCH-LOOP | PASS (both viewports) | `c277-bmatch-run2.json` (empty stems lane), `c277-bmatch-run1.json` (video lane), `bmatch-loop-*.png` |
| B-MATCH-UNDO | PASS (both viewports, 2 variants) | `c277-bmatch-run1.json` undo / undoLoop, `bmatch-undo*.png` |
| STUDIO-SMOKE-277 | PASS (both viewports) | `c277-smoke.json` |
| G277-AUTH | PASS (both viewports) | `c277-smoke.json`, `auth-*.png` |
| DOC-206 | PASS | l.4 is byte-exact, the 7 headings are in order, and the bullet names NS1, NS6 and TC9 |
| gate | gate | Full vitest, build, `verify` and e2e smoke are root's. `gates/gate-round-277.json` does not exist yet |

### What the browser showed (real Chromium, fresh anonymous contexts)

**Split**
- Empty demo: Split has `aria-disabled="true"`, no `disabled` attribute (`disabled` property false) and the title "Split — select a clip or make a time selection first (Ctrl+E)".
- After Add, the new clip is auto-selected, so Split is available.
- After a click on an empty stems lane: back to `aria-disabled="true"` with the no-target title.
- After a click on the clip: no `aria-disabled`, and the title is "Split at the insert marker (Ctrl+E)".

**Loop**
- No range: `aria-disabled="true"`, no `disabled`, and the title "Loop: make a time selection first (Ctrl+L)".
- After a drag on an empty lane: a range appears and `aria-disabled` is absent.
- Ctrl+L sets `aria-pressed="true"`.
- A click on an empty lane clears the range (0 ranges). `aria-disabled` stays absent, and the title is "Loop on / off (Ctrl+L)".

**Undo**
- Real Tab presses reached Undo: 55 at 1440×900 and 50 at 1280×720, or 31 in the loop variant.
- I pressed Enter until the history was empty: once after a clip add, twice after a clip add plus a loop edit.
- Undo then has `aria-disabled="true"` and no `disabled`. Focus is on Redo, which matches `:focus-visible` and shows a 1px brass outline at 0.8 opacity with a 2px offset. Redo is available.

**Smoke**
- `data-playing` goes false > true > false. The playhead advances, then holds after Stop.
- The live analyser RMS while playing is about 0.024 (above 0.001).
- Export WAV: 48 kHz, 24-bit, 2 ch, 768 000 frames = 16.000 s, 0 NaN, -24.9 dB in every second.
- The sha256 `1fea093b…f94` equals round 276's, which is consistent with no app-code change.

**Auth**
- A fresh context starts with 0 cookies and empty storage.
- `/studio-lab` opens with the "Demo collection — no sign-in required" badge, and `auth_user` is null.
- `/studio/middle-east` shows "Sign in required", with 0 `audio[src]` and no workspace.
- `/api/studio-token` returns 401 with no header and 500 with a fake bearer token. No token appears in any response body.

## CZABA requirement vs Ableton
- **CZABA:** this round's requirement is met. The tests now describe the soft-disabled contract that the real browser shows.
- **Ableton parity:** not applicable. This is a test-only round with no behaviour change.

## Notes (info, not bugs)
- **INFO-C277-DOC206-STAGE2-ROUND:** doc 206 l.9 and the TODO at l.63 still say stage 2 is round 277. Under D-29z618 it is round 278. A reported this too; the lines are outside the grant, so B should grant them in round 278.
- **INFO-C277-ENV-LOAD-TIMEOUT:** in run 1, the first context (split@1440x900) timed out after 150 s waiting for "Demo collection ready", probably during the dev server's first compile. The rerun passed, and every later context loaded normally.
- **Script versions:** `c277.cjs` on disk is the run-2 version. Run 1, which supplies the B-MATCH-UNDO, undoLoop and video-lane loop evidence, used the same file with three differences:
  - no deselect step in the split row;
  - empty lanes were not filtered against `data-track-id="video"`, so the first empty lane was the video lane;
  - the output file and row filter were fixed instead of coming from the `OUT`/`ONLY` env.

  The undo rows were not re-run.
- **Method note:** in the first split run, my own check expected Split to be unavailable right after Add. That expectation was wrong, because the added clip is auto-selected. The rerun adds a deselect step. This was not an app defect.
- `publication-checkpoint.json` and `root-pre-push-review.md` date from 2026-10-07. I found nothing in them that touches this round.

## For B
- The outcome follows §9: C PASS, so the round goes to the gate.
- No bugs.
