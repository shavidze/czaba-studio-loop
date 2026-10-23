# C — Round 105 verification: A-R104-REPEAT-DRAG + GATE104-S3

Verifier: C · Date: 2026-10-23 (08:38–08:53 UTC) · Task: `current-task.md` (round 105, D-29z70) · A report: `a-round-105.md`

**Verdict: PASS.** `browserVerified=true`, `realVerified=true`. There is 1 Low doc finding and no bug in the app.

Environment: `env-status.json` → store 200 (checked 08:38:01Z). Playwright with the installed Chromium. Every row ran in a fresh incognito context with no credentials. The backend `:5199` is unavailable, as expected; the cart `ERR_CONNECTION_REFUSED` is the only noise.

Tools: `c-round-105/tools/`.
- `sr105.cjs` is the round 104 harness head plus a new main. It adds:
  - a capture `pointermove`/`pointerup` listener on `window`, with timestamps;
  - a `MutationObserver` record timestamp on every record;
  - a check at every pointermove and every mutation that the `<output>` is the same node, still `aria-live=polite`, with exactly one element child.
- `run-g1053.cjs` runs G105-3.
- `mut105.py` and `setup-scratch.sh` run the mutations in a scratch copy.

Results are in `c-round-105/out/*.json` and the screenshots in `c-round-105/shots/`.

## Results by acceptance row

| ID | Result | Evidence (measured) |
|---|---|---|
| **HD-BLOCKED-HOLD 1280** | PASS | <ul><li>91 pointermoves: 60 steps plus 30 one-pixel wiggles.</li><li>**Window:** 1 blocked sentence, 2 added elements, 89 pointermoves in the window. Added in order: `გადატანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.` → `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` (the release text, shown after the release).</li><li>The `<output>` was the same node at all 93 samples, `polite`, with 1 child at every sample. It was replaced 0 times.</li><li>Clips at x 512/889, w 377, both before and after: no overlap.</li><li>The Undo label is unchanged (`Undo: დამატება — Middle East — საჯარო preview`).</li><li>Round 104 had 81 spans. `out/blocked-1280x720.json`, `shots/hd-blocked-hold-1280x720.png`.</li></ul> |
| **HD-BLOCKED-HOLD 1440** | PASS | Same result: blocked sentence 1, 2 elements, 89 pointermoves in the window, the same release text, 0 bad samples, clips 512/969 unchanged, Undo unchanged. `out/blocked-1440x900.json`. |
| **HD-FADE-CLAMP 1280** | PASS | <ul><li>91 pointermoves: 60 plus 30 wiggles.</li><li>On the way to the clamp, 60 distinct readouts were each added once (`Fade In: 1.696 წმ` … `100.059 წმ`, then `101.352 წმ`).</li><li>**Clamp window** (from `Fade In: 101.352 წმ` up to pointerup): 1 added element, 30 pointermoves. Round 104 had 21.</li><li>Release text: `Fade In: 101.352 წმ.`.</li><li>Fade-in ends at 101.352. The Undo label became `Undo: Fade In`, and one Ctrl+Z gave fade 0.000 with the label restored, so there was exactly one history entry.</li><li>No pageerror. Longest long task: 0 (none recorded; the PerformanceObserver raised no error).</li></ul> |
| **HD-READOUT-CHANGING 1280** | PASS | <ul><li>30 steps at 40 ms, inside the range: 31 pointermoves.</li><li>30 distinct readouts, 30 added, 0 duplicates.</li><li>31 added elements in total, within the bound of pointermoves + 2.</li><li>The last readout is `Fade In: 29.599 წმ`, and the final fade is 29.599.</li><li>No clamp: 29.599 is below the clamp limit of 101.352 measured in HD-FADE-CLAMP.</li><li>The script's `no clamp` check entry is a hard-coded placeholder. The measured comparison is the one in the previous item.</li><li>0 bad samples.</li></ul> |
| **SR-REPEAT-SPACE 1280** | PASS | <ul><li>Focus was on `BODY`.</li><li>Both presses gave `დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.`. The second press removed the old span and added a new span with that exact text.</li><li>Same `<output>`, 1 child, position unchanged, 0 clips.</li></ul> |
| **SR-REPEAT-FAILED-ROW 1280** | PASS | <ul><li>Hero music was aborted by `context.route`, and the keyboard reached `demo-hero-music`.</li><li>Both presses gave `„CZABA hero — საჯარო preview“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`. The second Enter added a new span with the exact text.</li><li>0 clips were added.</li></ul> |
| **SR-TEXT-REG 1280** | PASS | <ul><li>Each text matches its source string: Enter → `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.` (ArrangementContext l.1366); Fit → `Fit: მთლიანი პროექტი ჩანს (01:41.352). X აბრუნებს.` (StudioWorkspace l.1142); Delete → `კლიპი წაიშალა; სიცარიელე დარჩა.` (l.1808); Ctrl+Z → `Undo: კლიპის წაშლა` (l.2027 + l.1806).</li><li>Selecting a clip sets no status, so the text stayed at the Fit text.</li><li>Same `<output>`, 1 child after every action.</li><li>Rect y 658, h 16, line-height 16 px: one line at 1280.</li></ul> |
| **PX-NET** | PASS | 9 sessions: 0 page requests to studio-token, R2, recording-* or download, and 0 `Authorization` headers. |
| **REG-HYD** | PASS | 0 hydration warnings, 0 pageerrors, 0 non-noise console errors. The aborted request logged verbatim: `/videos/hero/hero-music.mp3 net::ERR_FAILED` (console: `Failed to load resource: net::ERR_FAILED`). |
| **G105-3** | PASS (one sub-check BLOCKED) | <ul><li>Run alone, after all other rows, at both 1280 and 1440.</li><li>The header link leads to `/studio-lab`, with the workspace and the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", with 0 workspaces and 0 audio.</li><li>Anonymous `/api/studio-token` returns 401 `{"error":"Please sign in to access Studio."}`.</li><li>localStorage holds only `czaba_spotlight_last_shown` and `czaba_session_id`.</li><li>**The fake-Bearer sub-check is BLOCKED: backend unavailable in cloud.**</li></ul> |
| **AN-REVIEW** | PASS | <ul><li>A's fail-before list (SA6 and SU5 red) matches §1.</li><li>C ran its own mutations in its own scratch copy (`out/mut105.json`):<ul><li>control: 13/13 green;</li><li>**m6** (provider passes `0 > 0`): SU5 red only;</li><li>**m7** (reducer guard made unreachable with `&& previous.sequence < 0`): SA6 and SU5 red.</li></ul>These are the same red tests as A's m6/m7.</li><li>SU1–SU4 (lines 1–314) are byte-identical to the snapshot. The UI diff is one pure addition, `314a315,390`.</li><li>In the SA file, only the call lines gained `false`, and SA6/SA7 were appended.</li><li>Assertions are exact (`toBe`/`toEqual`; `not.toBe` is used for identity).</li><li>The added lines contain no `as`, `@ts-` or `any` (grep).</li></ul> |
| **T105-TARGETED** | PASS | <ul><li>C ran the grep itself: 69 files, the same list as A's.</li><li>`npx vitest run` in C's scratch copy (byte-equal to `store/app`, checked with `diff -rq`): **69 files, 1126/1126 passed** (`out/targeted.log`).</li></ul> |
| **SOURCE-UNCHANGED** | PASS | <ul><li>HEAD `3b6178b` at the start (08:38) and at the end (08:52), with the same 3 M + 4 ?? paths.</li><li>The frozen list is 537/537 OK at both points, and A's end hashes match exactly.</li><li>The `ArrangementContext.tsx` diff against the snapshot has exactly 4 hunks: 2 import lines, `+gestureCountRef` above `useReducer`, the reducer argument, and `-gestureCountRef` at the old l.615. No `setStatus(` line changed.</li><li>`out/source-start.txt`, `source-end.txt`, `diff-*.txt`.</li></ul> |
| **GATE104-S3** (doc) | PASS | Doc 092 l.4 now carries the round 105 status, and l.60/61 describe the round 105 solution instead of a hand-off to B. |

Acceptance IDs in `c-round-105.json` `passed` use B's row IDs. The viewport and sub-check details are in this table.

Gate rows (not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## Findings for B
- **C-R105-01-DOC092-L16 (Low, doc only):** the Approach section of doc 092, l.16, still says "the string branch ALWAYS creates a new object and bumps `sequence`, even when the text is the same". That is now wrong during a gesture, and it contradicts l.59–61 and the shipped reducer. The Mermaid diagram (l.32–44, which C read) also shows only the keyboard Space path, with no gesture case. This is the same point as code-reviewer finding #3. A correctly left it alone because it is outside the sections B listed. It needs a one-line qualifier in a later round. It does not block publication.
- **Carried for B (not acceptance this round):**
  - **R104-T:** a real screen-reader check, now extended with a held drag.
  - **Render-time flag semantics:** the late bump on the last move is still inferred, not shown. 0 late bumps were observed in 4 drags.
  - **Residual coalesced-render cost:** not measured.
  - **Reviewer #2:** the optional "dispatch during gesture, render after release" test.
  - **The Architecture note:** a status action that records the gesture flag at dispatch time.
- `root-pre-push-review.md` is dated 2026-10-07 (round 3) and has no new item for this round.

## Ableton correspondence
| Behaviour | Status |
|---|---|
| One gesture, one announcement per distinct status text | არ ეხება — this is CZABA's own a11y rule, and no Ableton claim is made (task §3). |

## CZABA requirement vs reference
- **CZABA requirement (A-R104-REPEAT-DRAG, plus no regression of GATE96-S2):** met in the real browser at both viewports. Neighbouring behaviour also held: identical text outside a gesture is still announced, changing readouts are still announced, the release restore works, drag results and history are correct, and no render-time crash occurred.
- **Ableton:** not applicable.
