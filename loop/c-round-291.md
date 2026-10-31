# C round 291: FIX-PD-1b2 verification (library group heading a11y, stable group keys, doc 216 l.17, ST47/ST51, RT-FIX-291)

**Verdict: PASS.** `browserVerified` and `realVerified` are both true. Every browser row ran in Playwright Chromium against `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720, in fresh contexts with empty storage. Before the timed probes I loaded the page once untimed (L38).

A's report opens with a STOP that has two items. Neither one fails an acceptance row, and both still need a B ruling (L10/L11; round 253 is the precedent):
1. **LRS4 headroom.** C reproduced it: 2707 ms in C's 15-file run, against a 2500 ms threshold. See INFO-C291-LRS4-HEADROOM.
2. **Reviewer M1, the unpinned `#occurrence` suffix.** C confirmed it with mutant M4. See C-R291-01 (Low).

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS | <ul><li>`claims-291.sh` on A's tree differs only where §6 allows: K2 5; K3 rc1; K5 2 lines + `aria-hidden` 8; K6 `208:runs.push({`; K7 `2482 2750 0`; K8 no hit and l.4 289; K11 `217 1`; K12 `17 668`; K16 LG1–LG9.</li><li>The planning values K3–K19 were reproduced on a `git archive` of `5a911ff`. K1 and K2 differ there only because the archive is not the repo.</li><li>L29 grep: 30 hits. None is an untagged fact about current store code; they are grants, instructions or claims rows.</li></ul> `c-round-291/claims-on-A.txt`, `claims-at-5a911ff-archive.txt`, `l29-untagged.txt` |
| SOURCE-SCOPE | PASS | <ul><li>Exactly the 5 §4 paths.</li><li>`sha256sum -c` fails only on the 4 granted existing paths.</li><li>`strings.test.ts` changes 2 title lines.</li><li>Doc 216 has one hunk, `@@ -17 +17`.</li></ul> `sha-check.txt`, `source-diff.txt` |
| TYPECHECK | PASS | rc 0 (`typecheck.log`) |
| UNIT | PASS | <ul><li>15 files, 258 tests.</li><li>LG1–LG9 pass (LG8 counts 2), and ST47 and ST51 pass under their new titles.</li></ul> `covering.log` |
| UNIT-MUTANTS | PASS | Scratch copy `/tmp/c291a`: <ul><li>M1 (`key={headingId}`): LG8 c-two and LG8 b-two red.</li><li>M2 (`key={results[run.start].id}`): only LG8 b-two red.</li><li>M3 (`aria-hidden` removed): LG9 red.</li><li>Extra M4 (key = label only): all 10 green, see C-R291-01.</li></ul> The scratch file matched the live file byte for byte after the restore, and the live tree was untouched. `mutant-*.log` |
| B-AX | PASS | At both viewports: <ul><li>non-option children in the groups 0 (HEAD 2);</li><li>`text:` lines 0 (HEAD 2);</li><li>group names exactly `CZABA public previews + synthetic SFX` and `Synthetic demo · Night Pulse`;</li><li>4 and 5 children, all `option`;</li><li>listbox bbox Δ 0 against `ax-before.json`.</li></ul> `probe/ax-after.json` |
| B-KEYS-291 | PASS | <ul><li>17 steps visit the 9 task-289 ids in order and back.</li><li>Every focused element is an option, never a heading.</li><li>`:focus-visible` is true, with a 1px solid brass outline at 0.8 opacity.</li><li>Each focused option lies inside the list box.</li></ul> `probe/main-a.json`, `shots/keys-end-*` |
| B-STATES-291 | PASS | <ul><li>(a) Night Pulse node: 0 groups, 5 options.</li><li>(b) `bass`: 0 groups, `demo-stem-bass` only.</li><li>(c) `synthetic`: 2 groups with the exact names, 9 options, and 0 `text:` lines in the ariaSnapshot.</li></ul> `shots/state-*` |
| B-SCREEN | PASS | The full-window screenshots differ from B's HEAD `ax-before-*.png` by **0 pixels** at both viewports, so the heading boxes and the persistent text are unchanged. `probe/screen-diff.json` |
| B-JOURNEY-291 | PASS | <ul><li>The status starts `“Night Pulse · Bass” added to the Music track`.</li><li>Position at 1.50 s: `00:01.483` at 1440 and `00:01.471` at 1280.</li><li>`data-playing` goes false → true → false.</li><li>Master tap RMS is about 0.045 while playing and 0 after Stop.</li><li>Extra export: a WAV at 48 kHz, 24-bit, 2 ch, 16.000 s (768000 frames), peak 0.217, with a consistent RIFF size.</li></ul> `shots/journey-*`, `probe/export-a-*.wav` |
| G291-AUTH | PASS | <ul><li>`/studio-lab` opens anonymously with the badge, and `auth_user` is null.</li><li>`/studio/middle-east` shows `Sign in required`, with 0 `audio[src]` and no workspace.</li><li>Token API: 401 with no header, and 500 with a fake bearer. The mock is not running on :5199, so the API fails closed. No token appears in either body.</li></ul> `probe/auth-a.json`, `shots/auth/*` |
| DOC-216 | PASS | <ul><li>l.17 is byte-equal to §3.4(1), once the task's `\`` escapes are unescaped.</li><li>Only l.17 differs.</li><li>l.4 is `Completed (C round 289 PASS)`.</li></ul> |
| DOC-217 | PASS | <ul><li>l.4 is byte-exact.</li><li>The TEMPLATE headings are in order (the diff is empty).</li><li>Every cited test id exists (LG1, LG7, LG8, LG9, ST47, ST51).</li><li>It records the key choice, the M2 rejection and the deferred B-R290-LIB-SHAPE-SWITCH-FOCUS.</li></ul> |
| RT-FIX-291 | PASS | <ul><li>The retro diff is byte-equal to `b-round-290/retro-diff.txt` (l.87 only).</li><li>`gates/round-276/verify.log`: `Test Files 2 failed \| 218 passed (220)`.</li><li>NS1 is the strings test, NS6 is Loop `disabled`, and TC9 is Stop/Undo.</li><li>The old phrase appears 0 times.</li></ul> |
| gate | not claimed | Full suite, build, Biome, `verify` and `test:e2e:smoke` are gate rows. |

## Findings for B
- **C-R291-01 (Low, origin: B spec; confirms A-R291-REVIEW-M1 / A STOP item 2).**
  - Mutant M4 replaces the run key with the bare label. All 10 library-group-heading rows stay green.
  - So `#occurrence` is pinned by no row. With A, B, A data, M4 would render duplicate React keys.
  - There is no user-visible failure today, because the demo and purchased data never repeat a label.
  - R3 kept A from adding the row. The fix needs a B grant: an LG10 on `nonContiguousSources`, or a `console.error` spy in LG7.
  - The reviewer graded it Medium as a test gap. C grades it Low, because there is no reproducible behaviour failure.
  - Evidence: `c-round-291/mutant-M4-label-only-key.log`.
- **INFO-C291-LRS4-HEADROOM (pre-existing; A STOP item 1).**
  - `library-row-strings-ui.test.tsx` LRS4 took 2707 ms in C's 15-file run. The threshold is 2500 ms, 50 % of the 5000 ms default.
  - Other times: A's runs 2609 and 2543 ms; the file alone 1061 ms (A); gate 289 1044 ms.
  - The file is unchanged and the time depends on load. It needs a B ruling (L31 split or an accepted ruling) before the gate's full suite grows.
- **INFO-C291-K5-WORDING (B spec).**
  - §6 expects "the 3 `headingId` lines" after A's edit. But §3.1(2) replaces `key={headingId}`, so the correct count is 2 (l.676 and l.680). B's sketch gives the same.
- **INFO-C291-S3-BROWSER (C extra).**
  - In the All view, with `demo-stem-bass` focused, C set the search value to `a` without moving focus. That removes Full mix while 2 groups remain.
  - The focused element stayed the same node, still connected, at both viewports.
  - The grouped ↔ flat switch is still B-R290-LIB-SHAPE-SWITCH-FOCUS (deferred). C did not run HEAD in the browser.

## Requirement vs Ableton
- **CZABA requirement: met.**
  - The collection name is exposed once, as the group name only.
  - Focus stays on the same option when a run's index shifts or the first option of its run disappears.
- **Ableton conformity: not applicable** to this fix-up. The group heading stays the task-289 §2 deviation. Its status is not confirmed until LIVE-MEAS-BROWSER-SEARCH-LOCATION is measured.
- No screen reader is available in the cloud. The Chromium AX tree is the proxy, and no row claims NVDA or VoiceOver behaviour.

## Scope notes
- C did not edit app source and made no commits.
- The mutants ran only on `/tmp/c291a`.
- Browser side effects stayed in demo local state.
