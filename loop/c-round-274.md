# C round 274: SYS-6 STATUS-LIFETIME stage 3, the nudge result text (independent verification)

**Verdict: PASS.** browserVerified = realVerified = true. No new bug. Two info notes for B, neither blocking.

**Tree checked:** HEAD `52b17e4` plus A's uncommitted diff: 8 modified files and the new doc 205. The :5173 dev server serves A's tree. `git status` still shows the same 9 entries after C's run.

**HEAD control:** `git archive 52b17e4` was extracted to `/tmp/c274-head` and served on :5186. A copy of the working tree was put in `/tmp/c274-new` for the mutants. Both have private `node_modules` made of per-entry symlinks.

**Browser:** Playwright with Chromium headless, a fresh anonymous context for every scenario, at 1440×900 and 1280×720. Each run waits for `Demo collection ready` (L48). The audio tap is an AnalyserNode inserted before `AudioDestinationNode`. **Page errors: 0** in every scenario, on both trees and at both viewports.

**Env:** `env-status.json` round 274, store 200. The backend is not used.

**Ableton conformance:** does not apply. This is a bug-fix round on CZABA's own status line; Live has no such line. The nudge behaviour itself is unchanged.

## Scope, claims and tests
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE / HUNK-SCOPE | PASS | **Paths:** `git status` lists exactly the §4 paths plus the new doc 205; `git diff -- app/components` is 0 lines. **Context diff:** 2 hunks, both inside `nudgeSelectedClip`. They are the §2.2 group write (the label hoisted to a local const) and the §2.1 single write, each placed after `setRange(null)` and each using `keyRepeat ? () => text : text`. The refusal branches and the deps array are byte-identical. **strings.ts:** one line, `nudged`, placed right after `historyNudgeClip`. **One addition beyond the §2.2 text:** an `if (before && after)` guard around the group write. It cannot be reached by any known path (A's reviewer). Info, accepted |
| CLAIMS K1–K18, K20, K21 (at HEAD on `/tmp/c274-head`) | PASS | All match §9 (`c-round-274/claims.txt`). K2: group `applyEdit` at l.2004 and single at l.2024, with no success `setStatus`. K10: 0. K12: StudioWorkspace :2554 and :2570. K15: doc 204 is last, with 3 `In Progress (stage` hits. K16: 7 files. K17: 0 |
| CLAIMS K19, K22 (browser) | PASS (K22 with a caveat) | **K19** (`enterTwiceExpand` at HEAD, 1280): the Start field is hidden until the 1 `Expand` button is pressed. At 1440 it is visible without Expand. **K22 was not re-run at HEAD** (`nudgeAudio`/`baselineAudio` ran on A's tree only; the audio path is unchanged this round). B-AUDIO on A's tree reproduces B's HEAD values: nudged max 0.0857 / 0.0968 against B's 0.0857 / 0.0949, and control 0.097 against B's 0.097 |
| L29 sweep | PASS | C found no untagged code fact in this task that is false at HEAD |
| TESTS-TARGETED | PASS | The 13 §5.3 files plus the frozen bars-ruler-ui and gesture-reentry: **15 files, 362/362**, rc 0 (`c-round-274/targeted-vitest.json`). **Slowest:** track-layout "folds a lane" at 1816 ms (15 s describe limit, 12 %); BR2 at 1156 ms and IM7 at 1112 ms (both ≤ 23 % even against the 5 s default). **New rows:** LT21 437, NZ3 358, LT20 347, SK7 306, SK14 217, SK15 217 and SK13 212 ms |
| TEST-CHANGES | PASS | **Removed lines** in `__tests__` are exactly 5: the 2 describe titles, SK7 l.606, NZ3 l.1031 and `studioMoveStrings: {}`. Each is replaced by its exact §5.1 value, and no assertion is lost. **New rows:** SK13, SK14, SK15, LT20 and LT21 assert the exact §5.2 texts, sequences and spans. LT21 also pins the stopped text before the nudge (stronger than §5.2). **A's deviation 1:** SK14 rounds positions to ms. The text, sequence and span asserts stay exact, and the drift exists at HEAD in the frozen `moveClips`, so it is accepted (see INFO-C274-01) |
| MUTANTS | PASS | C re-ran them on the scratch `/tmp/c274-new`, never in `store/` (`c-round-274/mutants/run.log`, `results.json`).<br>• M-NO-SINGLE → LT20, LT21, NZ3, SK13, SK7<br>• M-NO-GROUP → SK14, SK15<br>• M-GROUP-ALWAYS-RIGHT → SK15<br>• M-SINGLE-PRE-START → LT20, LT21, NZ3, SK13, SK7<br>• M-GROUP-NUDGE-LABEL → SK14, SK15<br>• M-GROUP-REPEAT-STRING → SK14<br>• M-REPEAT-SILENT → NZ3, SK13, SK7<br>• C's own M-C-GROUP-SIGNED-LEFT (always the left text) → SK14, SK15<br>Every §7 row is red. After the restore, the sha is `1bd2f688…fe14` and `cmp` against `store/` is clean |

## Browser behaviour
**Files:** script `c-round-274/c274.cjs` (B's `probe-r274.cjs` plus C's scenarios); results `probe-r274-new.json` and `probe-r274-head.json`; screenshots `shots/{new,head}-*`.

**Results are identical at 1440 and 1280 unless noted.**

| Row | Result | NEW (A's tree) | HEAD control |
|---|---|---|---|
| B-NUDGE-SINGLE | PASS | `Nudge clip: start 00:01.000.`, `data-clip-start` 1.000, Undo title `Undo: Nudge clip (Ctrl+Z)`, 2 mutations (one span swap) | The clip moves to 1.000, but the line stays `“…” added to the Music track at 00:00.000. …`, with 0 mutations (the bug reproduces) |
| B-NUDGE-HELD | PASS | **Per-step reads** (`heldPerStep`), one `keyboard.down` at a time:<br>• 2.000 → `…00:02.000.`<br>• 3.000 → `…00:03.000.`<br>• 4.000 → `…00:04.000.`<br>One swap per step (cumulative mutations 2, 4, 6). At every read the text names the clip's current start. After ArrowLeft: `Nudge clip: start 00:03.000.` with the clip at 3.000 | added text, 0 mutations |
| B-NUDGE-GROUP | PASS | **Ctrl+A, ArrowRight:** `Move (2): 2 clips moved 00:01.000 to the right.`, clips at 1.000 and 17.000. **ArrowLeft:** `Move (2): 2 clips moved 00:01.000 to the left.`, clips at 0.000 and 16.000 (2 mutations each). **Extra, a held group:** a fresh keydown gives the same text with 1 swap, clips at 1 and 17. Two repeat keydowns give **0 mutations**, the same text, and clips at 3 and 19, so the per-step distance stays 1 s and is not stale | `“…” added … at 00:16.000 (nearest free spot).` after both moves, 0 mutations |
| B-NUDGE-UNDO | PASS | After the nudge, Ctrl+Z gives `Undo: Nudge clip` and the clip is back at 0.000. Ctrl+Shift+Z gives `Redo: Nudge clip` and the clip is at 1.000 | — |
| B-NUDGE-BLOCKED | PASS | Clip at 0, ArrowLeft press: `Nudge blocked — start of the timeline.` with 2 mutations (1 swap). Holding: the first `keyboard.down` after the release is a **fresh press** (Playwright `repeat`=false) and swaps once. The two real repeats swap **0** times. The clip stays at 0.000 | **Identical:** 2, 2 and 0 mutations, and the same text |
| B-NUDGE-PASTEND | PASS | **Before the nudge:** marker at 17, Space is refused with the past-end text. **Hold** (clip header, 3 downs): `…00:01.000.` → `…00:02.000.` → `…00:03.000.` (6 mutations), and the clip is at 3.000, so it now ends at 19. **Space:** `data-playing` true, position 17.000 → 17.121 → … → 18.340, advancing from 17. Real output RMS reaches 0.047, 0.096 and 0.155 (pulse peaks), so the clip really sounds. The line keeps `Nudge clip: start 00:03.000.` with 0 mutations during play. **Stop:** the same text, 0 mutations, and the marker still at 17.000 | During the hold, Rule R re-derives the T text: `Stopped — the insert marker (00:17.000) is at the end; …`, then `Stopped — Space plays from the insert marker at 00:17.000.` (4 mutations) |
| B-AUDIO | PASS | **Nudged** (clip at 1.000, Home, Space): 7 samples at positions 0.10–0.85 s, all RMS **0**. 10 samples at 1.05–2.10 s, max **0.0968** at 1440 and **0.0857** at 1280. **Control:** 6 samples at 0.05–0.60 s, max **0.097** | — |
| EXPORT-WAV (C's extra, real export) | PASS | Export dialog, then Export WAV (download, 24-bit PCM stereo 48 kHz). **Nudged:** duration **17.000 s**; first sample above 1e-4 at frame **48001** (1.0000208 s); RMS 0 over 0–0.95 s; RMS over 1.0–1.5 s = **0.1136401**; NaN 0; clipped 0; peak 0.593380. **Control** (clip at 0): duration 16.000 s; first audible at frame **1**; RMS over 0–0.5 s = **0.1136401**; peak 0.593380. The export is shifted by exactly 48000 frames (1.000 s) with identical sample energy. After the export the status line still names the nudge | — |
| B-ENTER-TWICE (closes GATE270-S2) | PASS | **Setup:** a range 2–5 on the clip. At 1280, the panel's `Expand` was pressed first (1 button). **Start field:** two Enters, each giving 2 mutations (1 span swap) and `Time selection: 00:02.000 — 00:05.000 · Music.` **Clip Gain:** two Enters, each giving 2 mutations and `Clip Gain unchanged: 0.0 dB.` This proves a DOM re-announcement per Enter, **not screen-reader speech** | Identical, 2/2/2/2 |
| B-R273-RANGE-PLAYING (observation) | Still present, as ruled (not a FAIL) | **While playing:** a range 2–5, then Ctrl+←. The line says `Insert marker at 00:00.000 — playback continues. Stop, then Space plays from here.` while the range `00:02.000 — 00:05.000` stays. **After Stop:** `Stopped — Space plays from the time selection start at 00:02.000.`, and Space then plays from 2.56 / 2.55 | Same text |
| LT-WIDTH | PASS | **Clip-added text:** status box 16 px tall (width 1416 / 1256). **Group text:** 16 px tall, scrollWidth = clientWidth, and no document overflow. **Visual check:** `shots/visible-group-{1280,1440}.png` show the visible line `Move (2): 2 clips moved 00:01.000 to the right.` on one line. A DOM leaf scan finds only the status span and the Undo button carrying it | — |

**Harness notes, for transparency:**
- The HEAD run overwrote `width-group-*.png`. Those files are renamed `head-width-group-*` and show HEAD's stale text. The new-tree visuals are `visible-group-*`.
- `visible-single-*` in `visible-check.json` did not isolate a single clip, because Escape kept the group selection. It is not used as evidence. The single path is covered by `nudgeSingle` and `heldPerStep`.
- HEAD probe attempt 1 timed out on a cold :5186 build (environment). After warming the server, the second attempt ran clean.

## Guards and docs
| Row | Result | Evidence |
|---|---|---|
| SCREEN-BUDGET | PASS | Persistent text lines outside the timeline in the demo state: HEAD 115 / new 115 at 1440, HEAD 102 / new 102 at 1280. The line sets are identical (`guards.json`, `shots/budget-*`) |
| G274-AUTH | PASS | **`/studio-lab`:** loads in a fresh anonymous context; localStorage holds only `czaba_session_id`. **`/studio/demo-product`, signed out:** "Sign in required" and no workspace (`shots/auth-studio-id.png`). **`/api/studio-token?product=middle-east&file=Music.wav`:** with no header → **401** `Please sign in to access Studio.`; with a fake Bearer → 500 `Unable to prepare Studio access` (backend absent). Neither body contains a token, and no cookies are set (`auth-token.json`) |
| DOC-205 | PASS | **Doc 205:** l.4 byte-exact `**სტატუსი:** Completed (C round 274 PASS)`. The 7 TEMPLATE headings are in order. Cited ids ST11, ST12, SK7, SK8, SK12, SK13, SK14, SK15, NZ3, LT20 and LT21 all exist as `it('<id>` in the tests. **Content:** `## მიდგომა` states the held-key rule (function form on repeat; single announces each new start, group once per press, refusal once) and the clobber rule (replaces any earlier text, written after `setRange(null)`, kept through Space/Stop/marker moves, replaced by the next nudge, drag release or Undo/Redo). `## პრობლემები და გადაწყვეტები` records GATE270-S2 as premise-false (SK8/SK12) and B-R273-PLAYING-TEXT-WITH-RANGE as deferred (D-29z602). **Docs 203 and 204:** the diff is l.4 only, each `Completed (C round 274 PASS)`. **`grep 'In Progress (stage'`:** only doc 176 is left |

**Gate rows (not claimed):** the full vitest, build, full Biome, verify and e2e smoke.

## Findings and notes for B
- **INFO-C274-01 (info): A-R274-GROUP-NUDGE-FLOAT-DRIFT, not observable in the browser.** C ran a group nudge with Snap off and ArrowRight ×4 (`floatDrift`).
  - `data-clip-start` read 0.100 / 16.100 … 0.400 / 16.400, and every status read `…moved 00:00.100 to the right.`
  - The drift A describes is in the model only, because the DOM formats to 3 decimals.
  - It stays a model-level candidate for B (frozen `moveClips`), with no user-visible effect found.
- **INFO-C274-02 (info): the `if (before && after)` guard.** It is an addition beyond the §2.2 text, and C found no path that reaches it. Taking the distance from `roundToMs(delta)` instead (the reviewer's alternative) would remove it. This is not required.

**Close list per task §11:** this PASS supports closing:
- C-R271-01-NUDGE-STALE-STATUS;
- GATE270-S2-REPEAT-ANNOUNCE (premise false: B-ENTER-TWICE gives 2 mutations per Enter on both trees, plus SK8/SK12);
- A-R273-REPEAT-PASTEND (superseded: B-NUDGE-PASTEND).

**SYS-6 → done** (docs 203/204/205 l.4 Completed). B-R273-PLAYING-TEXT-WITH-RANGE remains deferred and is still observed.

**Cleanup:** the :5186 server is stopped, and `/tmp/c274-head` and `/tmp/c274-new` are removed after this report. C touched no app source.
