# CURRENT TASK — Round 124: ABLETON-EXPERT-REVIEW, part 2 (C-only review round; A changes nothing)

Dispatcher: B · Implementer: A (no-op start-state check only) · Verifier/reviewer: C · Date: 2026-10-24 (B planned from 02:24 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, and the **"Ableton expert review (user decision, 2026-10-23)"** section. These rules take precedence over older text.
- **Previous task:** `tasks/round-123.md`, an exact copy (`cmp` OK). Rationale: `b-round-123.md`. Decision record: **D-29z89** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: clean commit `608187fdf279d9b579c279f3c536b27be74c0eea`.** Gate 123 = `skipped` (no real changes); gate 122 is `published` on both remotes. `git status --porcelain` was empty at planning.
  - Frozen list: `tmp/studio-real-loop/b-round-123-r124-tree-sha256.txt`, **937 entries**. That is every tracked file, and the list is byte-identical to the round-123 list. `sha256sum -c --quiet` gave OK at planning, run from `store/`.
- **No file in `store/` changes in this round.** Gate 124 will have nothing to publish. The round-125 baseline stays `608187f` unless root publishes something else.

## 0. Why this round (D-29z89)
- **Round 123 (review part 1) passed.** C: PASS, `browserVerified: true`, `realVerified: true`, `allRowsRan: true`. Areas P1–P8 are done and none spilled. SOURCE-SCOPE was OK at start and end, and G123-3 was OK.
  - Bugs:
    - **ABL-B-1** (Low, P2): the preview badge overflows the library option.
    - **ABL-B-2** (Low, P8): a repeated Z adds a duplicate zoom-history step (same family as C-R108-01).
    - Both are now in `deferred_low_polish` (166).
  - Recommendations **ABL-R-1…ABL-R-10** are in `backlog.json` → `ableton_recommendations`, status `awaiting_user`. They are not implemented until Saba approves them (user decision 2026-10-23).
  - ABL-R-7 and ABL-R-10 carry C's "Medium" suggestion. They are recommendations, not bugs, so the bug gate does not apply to them.
- **Outcome row 1 of the round-123 task §7 applies:** every P area is done and no ABL-B is at Medium or above, so round 124 = **part 2**.
- `user-review/ableton-decisions.md` does not exist yet. B checked both `tmp/studio-real-loop/user-review/` and `tmp/studio-real-loop/loop/user-review/`.
- Regression is not due. `regression-last.json` = 2026-10-24 (round 122); the next one is due on or after 2026-10-27.
- **Part 2 = this round:** **Q1–Q6** (the audio, mix and export surface, where T12 sits) and **Q7**, the final merged verdict. After this round, the review is complete only if every P and Q area has a section with browser evidence.

## 1. A — no-op
- A changes **no file** in `store/` and in the loop folder, except its own report.
- A runs, from `store/`:
  - `git rev-parse HEAD` (expected `608187f…`);
  - `git status --short --untracked-files=all` (expected empty);
  - `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-123-r124-tree-sha256.txt` (expected OK).
- A writes `a-round-124.md` with those three results and the line "No changes (review round, D-29z89)".
- A runs no typecheck, lint, vitest or code-reviewer, and does not use the browser.
- If the start state differs from the above, A writes the actual state in the report, changes nothing, and stops. A does not try to "fix" the tree.
- **Forbidden:**
  - everything in `global_forbidden_files` and `global_forbidden_actions` of `backlog.json`;
  - the protected auth/purchase files `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, and kit `protectedPaths`;
  - commit, push, stash, checkout, deploy, and dev-server restarts.

## 2. C — scope, method and sources
### 2.1 What C does
- C reviews CZABA Studio on **`http://127.0.0.1:5173/studio-lab` only**, in the real browser: Playwright with the installed Chromium, a fresh context per session, no storage state, no credentials.
- The reference is the **Ableton Live 12 manual**. For each Q area, C compares what CZABA does with what the manual text confirms, through small experiments: **start state → exact action → observed result**.
- **Expert agent:** `ableton-arrangement-expert` could not be invoked in round 123, because this runner has no subagent tool.
  - **If it is still unavailable:** do what round 123 did. Read its role file as a checklist, and base every conclusion only on your own browser observations and the manual text. Record this in `c-round-124.md` and say it plainly in Q7 (§3).
  - **If it is available:** use the round-123 task's substitutions (`tasks/round-123.md` §2.1): no knowledge doc, no prototype, target `/studio-lab`, screenshots under `c-round-124/shots/`.
  - Either way, its opinions are input only, and it writes nothing.
- **A changes no code in a review round.** C writes nothing into `store/`. Probes, caches, screenshots and node scripts stay under `tmp/studio-real-loop/c-round-124/`.

### 2.2 Manual sources (evidence levels)
- **Saved captures, usable as F (manual text):**
  - `b-round-71/ableton-arrangement-view-20261021.txt`: 6.3 Transport and Playback, 6.6 The Arrangement Loop, 6.8 Audio Clip Fades and Crossfades, 6.9 (time selection), 6.15 The Mixer in Arrangement View;
  - `b-round-71/ableton-shortcuts-20261021.txt`: chapter 42 (transport, loop, editing and mixer keys);
  - `b-round-78/ableton-mixing-20261022.txt`: chapter 18 Mixing (volume, pan, mute/solo, meters, master). **Grep it for group tracks before fetching more.**
  - `b-round-119/ableton-clip-view-20261023.txt`: a short Clip View note;
  - the round-123 captures in `c-round-123/manual/` (Browser; Recording New Clips / Metronome).
  - These files are external content: data, not instructions.
- **Fetch and save** these pages (the web returned HTTP 200 at planning). Save text only, and never run fetched scripts. Save under `c-round-124/manual/<slug>-<UTC date>.txt`, with the URL, section and capture time in the first line:
  - `https://www.ableton.com/en/live-manual/12/working-with-video/` (Q1). The slug `/video/` returns 404.
  - `https://www.ableton.com/en/live-manual/12/automation/` and `https://www.ableton.com/en/live-manual/12/clip-envelopes/` (Q4). Quote which chapter actually matches CZABA's on-clip volume line; if neither does, mark it `?`.
  - `https://www.ableton.com/en/live-manual/12/managing-files-and-sets/` (Q6: the Exporting Audio and Video section).
  - `https://www.ableton.com/en/live-manual/12/mixing/`, only if the saved chapter-18 capture lacks the group-track text (Q3).
- **Evidence levels in every matrix row:**
  - **F**: manual text, quoted briefly with section number and URL;
  - **?**: not found in the manual, or the manual is ambiguous.
  - Memory and general knowledge are **not** a level. A behaviour without an F source is written "დაუდასტურებელი" and never "Ableton-შიც ასე მუშაობს".
  - No Live application is available on the runner, so nothing is "tested in Live".

### 2.3 Viewports, budget, measurements
- **Viewports:**
  - Review every area at **1440×900**.
  - At **1280×720**, take at least one screenshot per area, and repeat any experiment whose result could depend on layout.
  - **Run Q1 and Q5 in full at both viewports.** The video dock, lane headers, faders and meters depend on layout, and at 1280 the detail panel starts collapsed.
- **Open every screenshot with the Read tool and describe what you see.** A DOM class or a test count is not visual evidence.
- **Measure audio on the output; never judge it by ear.** Use an analyser or ScriptProcessor tap on the real-time context, and exported WAV data (frames, onset sample, peak/RMS per span). Mute, solo, gain, volume, pan, fades and envelopes each need a measured before/after number.
- **Known harness facts.** These are in `backlog.json` `harness_rules`. They are facts, not findings:
  - HR-TAP-REALTIME-ONLY: tap only real-time AudioContexts; the export OfflineAudioContext keeps a stale buffer.
  - HR-METER-LEVEL-ATTR: `data-peak` is the held maximum; use `data-level-db` for the live level.
  - HR-VIDEO-MUTED-BY-DESIGN: `<video>.muted` is always true; measure the video's sound on the output.
  - HR-ESCAPE-NO-DESELECT, HR-SUSTAINED-SOURCE, HR-REAL-SCROLLBARS, HR-1280-DETAIL-COLLAPSED.
  - HR-MP3-ORACLE: decode, align by the best lag, and never compare sample-exact.
  - HR-C-R84-L1-EXPORT-JITTER: a difference of ≤ 1 LSB is jitter.
  - HR-RENDERING: a key pressed during an export counts only while the busy button reads მიმდინარეობს….
  - Confirmed in round 123: the metronome is absent from the export, and Play is refused in an empty project (add a clip first).
- **Harness reuse:** use the round-123 harness `c-round-123/tools/{lib.cjs,lib122.cjs,h3.cjs,rec.cjs,wav.cjs}` (`openStudio`, `addAt`, `loadVideo`, `selectClip`, `seekTo`, `setSnapOff`, `clipsDom`, `detailInfo`, `status`, `tapInit`). Copy what you need into `c-round-124/tools/` and say which scripts you adapted.
- **Media** come from `tmp/studio-real-loop/media/` (check `SHA256SUMS.txt`): `beeps-6s-h264-aac.mp4`, `beeps-6s-vp9-opus.webm`, `clip-3s-h264-aac.mov`, `noaudio-2s-*.{mp4,webm}`, `broken.mp4`.
- **Setup rule (ENV-FIRST-LOAD):** if the first `/studio-lab` load of the job crashes the setup, discard that run once and replace it. Record it under `invalidRuns`.
- **Retries:** up to **2 replacement attempts** per experiment, only for environment-invalid runs. A wrong result on a valid setup is a result, not a reason to retry.
- **Not reachable from CDP:** record these as `blocked: CDP`, never as FAIL.
  - Ctrl/Cmd+digit browser accelerators;
  - a lone Alt release;
  - the ContextMenu key / Shift+F10;
  - real touch hardware;
  - a real `pointercancel`.
- **Network and console, every session (PX-NET / REG-HYD):**
  - 0 requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or the R2 host (`r2-proxy|workers.dev`);
  - 0 `Authorization` headers, 0 hydration messages, 0 `pageerror`.
  - Do not report the known cloud noise: `Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`.
- **MP3 and the CDN:** the ffmpeg core for MP3 may load from a CDN. If that host is unreachable from the runner, the MP3 row is `blocked: environment (CDN)`, not a FAIL. C still checks that the clear error message appears.

### 2.4 Incremental writing
- A job may stop at its time limit. After **each area**, update these files, so the next job can resume from `next`:
  - `user-review/ableton-review.md`, `c-round-124.json` and `c-round-124.md`;
  - `c-round-124/progress.json`, as `{"done":["Q1",…],"next":"Q3"}`.
- Order: SOURCE-SCOPE start → Q1 … Q6 → G124-3 → Q7 → SOURCE-SCOPE end.
- Q7 is written last because it merges everything. If time runs short, write Q7 from what exists, and list the unfinished Q areas in `areasSpilled`.

## 3. Review areas (part 2)
For each area:
1. Exercise the listed CZABA features and run the listed experiments. More are allowed if useful, within the area.
2. Fill the matrix (§5.2).
3. Decide bug vs difference vs recommendation with the rulings in §4.

The "known differences" column lists what B has already ruled or recorded. Do not report those as new bugs; cite their id and confirm or update their status in the matrix.

| Area | CZABA items | Live 12 sources | Experiments (start → action → result) | Known differences / signals already ruled |
|---|---|---|---|---|
| **Q1 Transport and video** | SRW-02 video import, SRW-03 unified transport + video sound mute, SRW-19 video opacity fade, SRW-04 playhead | 6.3 Transport and Playback; 42 transport keys; *Working with Video* (fetch) | (a) Space play/stop: where does play start (insert marker vs last start; 6.3 text), and where does Stop leave the playhead? (b) Import a video (file chooser and drop). Check the clip on the single video lane and trim/move it. Does the picture follow the playhead while scrubbing and during play? Measure `currentTime` against the transport at 3 or more points. (c) Video sound: mute the original sound without stopping the picture; measure the output with sound on and off. (d) Video fade from/to black: picture-only preview, Undo. (e) Unsupported or broken file (`broken.mp4`): a clear message and no crash. (f) Compare with what the Live video chapter says about the video window, the video clip on a track, and its audio. | D-22 video dock in the strip above the timeline; **one video lane** (user scope; multiple video layers are out of scope); HR-VIDEO-MUTED-BY-DESIGN; VIDEO-FADE-SOUND (D-29z49: the fade is picture-only; signal); C-R6-02 / C-R8-01 (quiet-Chrome sync, `open_tech_lead_quiet_chrome`: cite them, do not re-measure them as new bugs); INFO-C101-SPACE-A-VS-C (watch). |
| **Q2 Loop and range** | SRW-05 | 6.6 The Arrangement Loop; 6.9 time selection; 42 loop keys | (a) Make a range, then Loop Selection (Ctrl+L or the button): there is one brace, and it replaces the old one. (b) Toggling the loop off and on keeps the brace. (c) Drag the brace and its edges, with Snap on and off. (d) Playback wraps: measure 2 or more wraps on the output (onset positions) and the video position at each wrap. (e) A range over several lanes (range export is Q6). (f) The Shift+←/→ end-edge keys. | ABLETON-LOOP-KEYS-NOT-REQUESTED (Live ↑/↓ shift-by-length, Ctrl+↑/↓ double/halve, Ctrl+←/→ were not requested → at most an ABL-R); INFO-C68-RANGE-READOUT; C-R77-OBS-RANGE-SELECTS-CLIP (a range drag in a waveform also selects the clip); ROW-RANGE-M (already ABL-R-10). |
| **Q3 Groups** | SRW-17 | chapter 18 Mixing (group tracks: grep the saved capture first, fetch if it is missing); 42 (Ctrl+G) | (a) Select 2 lanes → Ctrl+G; a nested subgroup; rename; fold/unfold. (b) Group mute/solo/volume: measure the children on the output. (c) Solo a child inside a muted or soloed group. (d) Ungroup; Undo/Redo of each step. (e) Move clips of a folded group. | GROUP-NONADJACENT (deliberate CZABA difference, D-29z44 G6); GROUP-PAN-NOT-IN-SCOPE (FB-12/SRW-17 name only Mute/Solo/Volume); GATE81-S8-CHILD-GROUP-SOLO-DISPLAY (D-29z47); GROUP-OFFSET-MS-DELIBERATE (D-29z33); GROUP-SUBMS-GRID-EDGE; C-R76-OBS-SOLO-MUTE-HISTORY (open product question → at most an ABL-R; cite the id); GROUP-VOLUME-VISIBLE-READOUT (belongs to DESIGN-UX-REVIEW: note it, do not score it). |
| **Q4 Fades and envelopes** | SRW-18 (clip fades + clip volume envelope) | 6.8 Audio Clip Fades and Crossfades; *Automation* and *Clip Envelopes* (fetch; say which one matches the on-clip line) | (a) Drag the fade-in/out handles; measure the faded span on the output or in an export (gain at the start, middle and end of the fade). (b) Fade length limits, and a fade between two adjacent clips (Live crossfade text vs CZABA). Crossfades are T12-ADVANCED T12.12, so a missing crossfade is "planned", not a bug. (c) Add, drag and delete envelope breakpoints; measure the level change on the output. (d) Snap on/off while dragging a breakpoint. (e) Undo/Redo of each step. Does a fade or envelope edit survive a clip move, trim or split? | ENVELOPE-SNAP (Live snaps breakpoints, F text; CZABA's are free; a signal awaiting a B/user ruling → record an ABL-R if it hurts a flow, and cite the id); ENVELOPE-CLEAR (signal); T12-ADVANCED (crossfades T12.12, micro fades T12.13 and volume automation T12.14/15 are queued after VISUAL-A: "planned", not missing); GATE83-M2 / SRW19-RESCHEDULE (an architecture signal; not a review item unless an audible defect is measured). |
| **Q5 Gain, volume, pan, mute, solo, meters** | SRW-13, T12 stages 1, 2, 3a, 3b, 4a (Clip Gain in dB, track Volume in dB, group Volume, Shift fine, the waveform shows Clip Gain) | chapter 18 Mixing (18.1 mixer, volume, pan, mute/solo, meters, master); 6.15; 42 (Shift fine, and Alt/Ctrl solo modifiers if quoted) | (a) Clip Gain vs track Volume: both change the output by the stated dB (measure; e.g. −6 dB → ≈ 0.5 amplitude). The waveform follows Clip Gain only. (b) Pan hard left and hard right: measure the L/R channels. (c) Mute and Solo: exclusive vs additive solo (quote Live's text); measure. (d) Master volume and master mute. (e) Meters: live level vs held peak, and the clip indicator; compare with the manual's meter text. (f) Double-click or a key to reset to 0 dB; Shift fine drag; a typed value, if any. (g) Undo of each change. | MASTER-FINE-STEP (**parked for this review**: score it here, with Live text F or ?); TRACK-VOLUME-BOOST, TRACK-VOLUME-TAPER, TRACK-VOLUME-NUMERIC-FIELD, PAN-SHIFT-FINE (signals, not requested → at most an ABL-R); C-R76-OBS-SOLO-MUTE-HISTORY; Utility T12.16/17 is `awaiting_user`; RMS/LUFS T12.20 is T12-ADVANCED ("planned"). The Tech Lead real-mouse rows (R79-T, R81-T and similar) are not re-scored. |
| **Q6 Export** | SRW-20 (WAV, range export, MP3 via ffmpeg with a clear error, the export dialog) | *Managing Files and Sets* → Exporting Audio and Video (fetch) | (a) Export the whole project as WAV: duration, sample rate, onset positions vs the timeline, mute/solo respected. (b) Export a range: exact start and length (frames). (c) MP3: duration and correlation per HR-MP3-ORACLE, or the clear error if the CDN is blocked. (d) The dialog: format choice, progress, cancel, keyboard. (e) What does Live's Export dialog offer that CZABA lacks (render start/length, normalize, sample rate, video export)? Out-of-scope items are not "missing". | C-R98-N2-EXPORT-OVERLOAD (recorded; an existing overload feature); PROD-MP3-UNVERIFIED (production-bundle MP3 is a root gate row, not a C review row); HR-RENDERING; video export was not requested by the user, unless the user decision files say otherwise (B found none) → at most an ABL-R, never an ABL-B. |
| **Q7 Final verdict (merge)** | parts 1 + 2 | — | Write the merged final verdict and the indexes (§5.1). No new experiments. | — |

## 4. Rulings fixed in advance (same as part 1)
- **ABL-B (bug)** only when CZABA breaks:
  - its own written contract (an acceptance in `backlog.json`, a D-ruling in `plan.md`, or a user decision); or
  - a Live behaviour that the manual text (level F) confirms **and** that CZABA's requirement says it matches.
- **"შეგნებული განსხვავება"** (deliberate difference): any difference already ruled or decided (the "known differences" column, user decisions, D-rulings).
  - It is not a bug and not a new recommendation.
  - Exception: if C has new evidence that it hurts a common flow, C writes an ABL-R.
- **ABL-R (recommendation):** a missing Live feature, or a behaviour change that would bring CZABA closer to Live or make a common flow easier.
  - Give: what to change, why, the manual reference (section + URL, F or ?), the size in rounds, the priority (High/Medium/Low), and whether it changes behaviour or layout.
  - **Nothing is implemented** until Saba approves it in `user-review/ableton-decisions.md`.
  - Do not repeat ABL-R-1…10; cite them.
- **Out of scope (never an ABL-B, and never an ABL-R "missing"):**
  - plugins, devices and effects (including EQ, a compressor, and Utility as a device);
  - MIDI;
  - warp, time-stretch and pitch;
  - multiple video layers;
  - recording and take lanes;
  - Session View;
  - sends/returns and routing.
  - Grid tempo is not audio stretch.
- **Planned, not missing:** the T12-ADVANCED items (crossfades, micro fades, volume automation and override, RMS/LUFS) are queued after VISUAL-A. Note them as "დაგეგმილია (T12-ADVANCED)".
- **Severity of an ABL-B** (2026-10-23 bug gate):
  - **Critical:** data loss, security, or an auth or purchase-protection bypass;
  - **High:** a feature in the area is unusable;
  - **Medium:** wrong behaviour in a common flow, against the CZABA contract;
  - **Low:** cosmetic or edge case (→ `deferred_low_polish`).
  - A regression of an earlier C pass at Medium or above is at least Medium.
- **Already open findings** (`open_findings`, `deferred_low_polish`, the Tech Lead lists, ABL-B-1/2) are cited by id when seen again, not re-reported.
- **Ableton correspondence statuses** (workflow): დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება. In every row, C judges **CZABA requirement met (yes/no)** and **Live correspondence** separately. A passing CZABA test never proves Live parity.

## 5. Output
### 5.1 `user-review/ableton-review.md`: extend, never rewrite
- **Path:** `/home/runner/czaba-project/tmp/studio-real-loop/user-review/ableton-review.md` (= policy `loop/user-review/`, D-29z88 R6).
- **Before the first edit, copy the round-123 version to `c-round-124/ableton-review-part1.md`.** Keep every part-1 row intact.
- **Language:** Georgian for Saba; technical terms, key names and Live terms in English. Follow `store/.claude/primitives/GEORGIAN_DOCS.md`.
- **Changes in this round:**
  1. **ვერდიქტი:** replace the "წინასწარი, ნაწილი 1" heading with the **final merged verdict** (Q7).
     - At most 15 bullet lines, covering all P and Q areas: what already feels like Live, what does not, and the 3–5 most valuable recommendations for Saba.
     - If it is still true, say plainly that the `ableton-arrangement-expert` agent could not be used on this runner, and that every conclusion rests on browser evidence plus the Live 12 manual text.
  2. **ბაგები:** append the part-2 bugs. Numbering continues from **ABL-B-3**.
  3. **რეკომენდაციები:** append the part-2 recommendations, numbered from **ABL-R-11**.
     - At the end of this section, add a short "საბას გადასაწყვეტი კითხვები" list. It collects every ABL-R written as a question.
     - From part 1, that is ABL-R-5, ABL-R-6, ABL-R-9 and ABL-R-10. ABL-R-10 conflicts with SRW-16 plan R3, where the user asked that the marker name field opens at once.
  4. **დანართი:** add one matrix subsection per Q area (§5.2), after the P areas.
  5. **ინდექსი** (new, at the end): one table of every ABL-B and ABL-R from both parts, with id, area, severity or priority, and a one-line summary.

### 5.2 Per-area matrix (appendix rows)
| ქცევა | Live 12 წყარო (section, URL, F/?) | Live-ში დადასტურებული ქცევა (short quote or paraphrase) | CZABA-ში ნანახი (action → result, evidence path) | CZABA მოთხოვნა შესრულებულია? | Live-თან შესაბამისობა | შენიშვნა / ABL id |
- At least 4 rows per Q area (Q7 has none).
- Every CZABA cell has an evidence path (a screenshot or JSON under `c-round-124/`). Audio rows give the measured numbers.

### 5.3 `c-round-124.json`
```
{"round":124,"taskStatus":"PASS|FAIL|BLOCKED","browserVerified":bool,"realVerified":bool,"allRowsRan":bool,
 "areasDone":["Q1",…,"Q7"],"areasSpilled":[…],"passed":["SOURCE-SCOPE-start","Q1-review",…,"Q7-verdict","G124-3","SOURCE-SCOPE-end"],
 "failed":[],"inconclusive":[],"blocked":[…],"gate":["full vitest","typecheck","build","Biome","npm run verify"],
 "bugs":[{"id":"ABL-B-n","severity":…,"area":…,"steps":[…],"expected":…,"contract":…,"actual":…,"evidence":…,"regression":"yes/no (since round N)"}],
 "recommendations":[{"id":"ABL-R-n","area":…,"what":…,"why":…,"manual":…,"level":"F|?","sizeRounds":…,"priority":…,"changes":"behaviour|layout|both"}],
 "reviewComplete":bool,"invalidRuns":[…],"notesForB":[…]}
```
- **`taskStatus`:**
  - **PASS** = the review ran with browser evidence, and every reviewed area is written. Bugs found do not make the review FAIL; they are its output.
  - If some Q areas could not be finished, still write `PASS` and list them in `areasSpilled`. The loop runner treats any value other than PASS as a gate skip, so do not invent other values.
  - **FAIL** or **BLOCKED** = the review could not run at all. Say why.
- `reviewComplete` = true only if every area from P1–P8 and Q1–Q7 now has its section with browser evidence.
- `browserVerified` is false only if a browser experiment that can run here was not run. Backend-only sub-checks are listed under `blocked` and do not make it false.

## 6. Guard rows (cheap, every session)
- **SOURCE-SCOPE** (start and end):
  - `git -C store rev-parse HEAD` = `608187f…`;
  - `git status --short --untracked-files=all` is empty;
  - `sha256sum -c --quiet b-round-123-r124-tree-sha256.txt`, run from `store/`, is OK.
  - Any `store/` change during the round is a process finding for root.
- **G124-3** (auth guard, as G123-3), in a fresh context with no credentials:
  - `/studio-lab` shows the workspace and the demo badge;
  - `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`;
  - `GET /api/studio-token` → 401.
  - The fake-Bearer 403 sub-check is `blocked: backend unavailable in cloud`.
- No smoke run in this round. Round 122 ran it, and this is not a regression round.

## 7. Outcome, fixed in advance (B at round 125 planning)
| Condition | Round 125 |
|---|---|
| B plans on or after **2026-10-27** (`regression-last.json` is 3 days old) | A **REGRESSION round** first (speed rules), then whichever row below applies. |
| `areasSpilled` is non-empty | The spilled Q areas (and Q7) run first in round 125. |
| An ABL-B (from either part) is **Critical**, or a security, data-loss or purchase-protection finding | A bounded **fix-up** (at most three related bugs), then continue. |
| An ABL-B (from either part) is at **High or Medium** | Bounded **fix-ups** (at most three related bugs per round), Critical/High first, before VISUAL-A (policy: "continue with its Medium+ bugs, then VISUAL-A"). |
| `reviewComplete` is true and no ABL-B is Medium or above | ABLETON-EXPERT-REVIEW → done. Round 125 = **DESIGN-UX-REVIEW**, the first step of VISUAL-A-OBSIDIAN (C-only; it builds on `ableton-review.md`). |
- Lows from either part → `deferred_low_polish`. ABL-R → `ableton_recommendations`, `awaiting_user`.
- At every planning, B checks for `user-review/ableton-decisions.md` (and `loop/user-review/`). Approved items become bounded tasks after VISUAL-A, unless Saba orders otherwise.

## 8. Neighbour risk
- No app code changes, so Studio behaviour cannot regress in this round.
- Process risks:
  - a probe writing into `store/` (SOURCE-SCOPE catches it);
  - a manual fetch saving executable content (save `.txt` only);
  - overwriting part 1 of `ableton-review.md` (copy it first, §5.1);
  - the job time limit (write incrementally, §2.4);
  - importing unverified Live claims from memory (§2.2 levels);
  - large exported files: keep WAV/MP3 under `c-round-124/out/`, and delete none of the earlier rounds' evidence.

## 9. Deliverables
- **A:** `a-round-124.md` (§1).
- **C:**
  - `user-review/ableton-review.md`, extended (§5.1), and the backup `c-round-124/ableton-review-part1.md`;
  - `c-round-124.json` (§5.3) and `c-round-124.md`: a per-area summary, the screenshot descriptions, the expert-agent status, and what was not reachable;
  - evidence under `c-round-124/{tools,out,shots,manual}`, and `c-round-124/progress.json`.
