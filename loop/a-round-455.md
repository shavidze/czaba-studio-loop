# A round 455 — SABA-B-14: the Store player's seek thumb stays on the brass fill edge

**Status:** implemented; awaiting C. No STOP.

**For B, near the top (not a STOP):** the task's §1 and C8 pin doc 298 l.4 as exactly `**სტატუსი:** In Progress (SABA-B-14, round 455)`. Lesson L28 prescribes the post-PASS form (`Completed (C round 455 PASS)`). A wrote the task's string because C8 checks it byte for byte. B should rule on which form the gate and root expect, and decide whether l.4 needs changing after C PASS.

## Changed files (exactly `b-round-454/grants-455.txt`)
- `app/components/audio/AudioPlayer.tsx` — from `b-round-454/sketch-455.patch.txt`, no hand edits.
- `app/lib/__tests__/audio-preview-player.test.tsx` — from the same patch, no hand edits.
- `docs/implementation/2026/quarter-IV/298-saba-b-14-store-seek-thumb.md` — new, written by A (Georgian; TEMPLATE headings in order; l.3 `**თარიღი:** 2026-11-11`; l.4 `**სტატუსი:** In Progress (SABA-B-14, round 455)` as the task orders; `grep -ic pending` = 0; ST1–ST8, ST3b, ST3c, both causes with HEAD numbers, keyboard and volume-fill rulings, `aria-valuetext` reason, TLM-R455-FIREFOX-SEEK-THUMB, Why-we-missed-it).

`git status --short --untracked-files=all`: only these 3 paths.

## Steps and real results
| Step | Result | Evidence |
|---|---|---|
| 1 Read | What was actually read: the lessons A section (L11, L26 and L28 read in full, the rest cut to 600 characters per line); the first 40 lines of each of the 6 primitives; the first 30 lines of `new-test.md`; TEMPLATE.md in full; `context/active-summary.md` (head 40). `root-pre-push-review.md` and `publication-checkpoint.json` exist, and neither mentions 455 or SABA-B-14. **Pre-flight** was not posted as a separate gate before the patch was applied. The scope was fixed by B's reviewed patch and the 3 grants. A read the skill afterwards: assumptions = the task text, files = the 3 grants, success = §2 steps 5–8. | — |
| 2 claims before | rc 0, stderr empty, **equal** to `claims-455-planning-output.txt` | `a-round-455/claims-before.txt`, `.err` |
| 3 patch sha / apply / per-file sha | `sketch-455.patch.txt: OK`; `git apply` clean; 2 OK | — |
| 5 `npm run typecheck` | rc 0 | `a-round-455/typecheck.log` |
| 5 `npm run lint` | rc 0; 205 warnings, HEAD (scratch at `2e26962`) also 205 | `a-round-455/lint.log`, `lint-head.log` |
| 5 Biome on the 2 code files | rc 0; 5 warnings, all `lint/a11y/useButtonType` (pre-existing); no format diff | `a-round-455/biome.log` |
| 5 covering vitest (`covering-455.txt`) | 6 files / 73 tests passed, rc 0 | `a-round-455/covering.log` |
| 5 mutants (scratch `/tmp/a455-scratch`: `git clone --shared` at `2e26962` + patch committed in scratch, `node_modules` symlinked) | `mutants.txt` **equal** to `b-round-454/mutants/mutants.txt` (BASE green, M1–M13 red) | `a-round-455/mutants/mutants.txt`, `mutant-*.log`, `run.log` |
| 6 browser: mock API was down (product page 503), started detached with `setsid node mock-api/server.mjs`; dev `:5173` warmed twice | 200 | `a-round-455/mock-api.log` |
| 6 `seek-probe.mjs` 1440×900 | `MAX_ABS_LEAD_PX 0.00`. All 10 paused samples (0.4 … 149.6 s) are present with lead 0. The 4 playing samples have `step='any'` and fractional values (0.162446, 0.428058, …). | `a-round-455/seek-1440.{txt,json}`, `shots/` |
| 6 `seek-probe.mjs` 1280×720 | `MAX_ABS_LEAD_PX 0.00`. All 10 paused samples are present with lead 0. The 4 playing samples have `step='any'` and fractional values. |
| extra: new tests against the HEAD component (scratch, `AudioPlayer.tsx` checked out at `2e26962`, then restored) | 9 failed (K1, ST1, ST2, ST3, ST3b, ST4, ST5, ST6, ST7); ST3c and ST8 pass on HEAD (the guards are killed by M12 and M10) | `a-round-455/st-on-head-component.log` | `a-round-455/seek-1280.{txt,json}`, `shots/` |
| 6 `key-probe.mjs … none` | **equal** to `b-round-454/probe/key-sketch.txt` | `a-round-455/key-tree.txt` |
| 7 claims after | rc 0, stderr empty, **equal** to `claims-455-sketch-output.txt` | `a-round-455/claims-after.txt`, `.err` |
| 8 git status | only the 3 grants | above |

The mock API server (`:5199`) was left running for C (it was down when A started).

## code-reviewer (3 files)
A ran the real `code-reviewer` subagent (read-only, score 8/10). No Critical, High or Medium findings.
- **R455-1 (Low, for B):** `AudioPlayer.tsx:40-45, 149`. The key handler and `disabled` don't guard non-finite `duration`. With Infinity the slider stays enabled. With NaN, `seek(NaN)` would throw when `audio.currentTime` is set (`AudioContext.tsx:221`), though the context sets `duration` only on loaded metadata. The handler also doesn't early-return when the input is disabled; native disabled inputs get no keydown anyway. Suggested fix: one `isSeekable` flag. **Not applied:** the code file is hash-pinned (C3, "no hand edits"). Task's non-finite ruling (tech-lead) says this is not a row.
- **R455-2 (Low, addressed in doc after measuring):** the reviewer inferred that some ST rows pass on HEAD, because jsdom doesn't snap range values. A measured it (`st-on-head-component.log`): only ST3c and ST8 pass on HEAD, and ST1 fails because of its `step` check. Doc 298 §ტესტირება now states the measured list, the guard/mutant link (ST3c←M12, ST8←M10), and that the browser probe is the evidence for the snapping. These were doc-only edits after the review. No code changed after the review, so it was not re-run.
- **R455-3 (Low, addressed in doc):** the doc cited `lessons.md` and the probe scripts without saying they are outside the repo. The doc now says they are in the loop folder. Verified: `lessons.md` is 60 lines and `grep -ic "painted range fill"` = 1.
- **R455-4 (Info):** Alt+ArrowLeft no-navigation is covered only by the browser probe (C5 `altleft-probe`), not by a unit test. For B.
- **R455-5 (Info):** `Record<string, number>` lookup with `=== undefined`; a `switch` or `ReadonlyMap` would type it honestly. For B (code is pinned).
- **R455-6 (Info):** `rgba(255, 255, 255, 0.1)` is hardcoded. It was already in HEAD (2 hits in `git show 2e26962:…AudioPlayer.tsx`) and only moved. For B (token candidate).
- **Architecture note (proposal for B/root, not acted on):** keep it in `AudioPlayer.tsx`. One owner, no new state. If another painted range slider appears, one bounded task could move `audioPlayerRangeFill` and the thumb constant into a shared helper with a thumb-size design token. ST8 is currently the only link between the constant and `app.css`.

After the doc edits: claims-after rerun, still **equal** to `claims-455-sketch-output.txt`, stderr empty; `pending` count 0.

## Known gaps
- Firefox `step="any"` and `::-moz-range-thumb` inset not measurable in the cloud: TLM-R455-FIREFOX-SEEK-THUMB (deadline RETRO 465).
- A did not run `extra-probe.mjs`, `altleft-probe.mjs` or the C12 Studio/purchase probe; those are C rows (C5, C5b, C7). A did **not** run `npm run build`, the full suite or `verify` (speed rules: those are gate rows).
- Scratch clone `/tmp/a455-scratch` (with the sketch committed in the scratch only) was left in place for reference. It is outside the store and does not survive the job.

## B acceptance criteria A actually passed (own checks, not C rows)
- §2 steps 2, 3, 5 (typecheck, lint, Biome, covering 73/73, mutants equal), 6 (seek ≤ 1 px at both viewports: 0.00; key probe equal), 7, 8.

## Next C checks
C1–C9 as written in `current-task.md` §3; in particular C4/C4b on HEAD `:5182` vs tree `:5173`, C5b extra-probe (volume, hover, drag, modified arrows), C7 Studio + purchase protection, C8 doc 298 l.4 and lesson L61.
