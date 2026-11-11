# C round 442 — SYS-3 stage 1 (IME composition guard)

Verdict: PASS on the task's C rows, with one open question for B (A's STOP, M1). Evidence is in `c-round-442/`.

| Row | Result | Evidence |
|---|---|---|
| C1/C10 scope | the 7 changed paths equal grants-442.txt | git status diff |
| C2 patch identity | 6/6 files identical to sketch-files | cmp |
| C3 covering | 60 files, 1114/1114, rc 0 | c3-covering.log |
| C4 mutants | 14/14 red; id, rc and failed rows equal b-round-441 results.jsonl | mut/results.jsonl |
| C5 claims | diff equals expected-after-A | claims-diff.txt |
| C6 IME browser | ALL OK (18 cells) at 1440x900 and 1280x720 on the tree, real Chromium with CDP IME | ime-sites-tree.json |
| C6-HEAD control | first run had one cold-start timeout cell (environment-invalid, not counted). The single replacement run reproduces compare-head.txt line for line: 18/18 failing on HEAD | compare-head2.txt |
| C7 | anonymous /studio-lab: auth_user null. /studio/middle-east shows "Sign in required", 0 audio[src], studio-token 401. Premium auth is not bypassed. Play reaches Playing and Stop returns to Stopped at both viewports | auth2.mjs output, play-*.png |
| C9 doc 288 | line 4 exact, 14 mutant ids and TLM present | grep |
| C8 | optional browser cells not run | — |

## Open: M1 (held key after a composing key)
A stopped on A-R442-REVIEW-M1 (code-reviewer, Medium): the non-composing repeat keydowns that follow a composing first key can still commit or cancel on Tempo (Enter and Escape), Marker Escape and Clip Gain Escape. The end state is the same as HEAD, so this is not a regression. C did not measure it, because only a synthetic CDP autoRepeat probe is possible here, and it would not show what a real IME sends. Recorded as an unverified Medium hypothesis. B must rule on it (L11). The reviewer Lows L1 and L2 (no plain-Escape-after-composition test, a weak IME1 final assertion) are also unruled.
