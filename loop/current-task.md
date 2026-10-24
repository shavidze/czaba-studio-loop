# CURRENT TASK — Round 131: VISUAL-A V-0.2c1 — video import messages in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 130)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). The module contract is in `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract`:
  - a leaf module, one object per area;
  - plain strings plus small pure formatters;
  - no type assertions;
  - **existing exported names keep their names and signatures and get their values from the module**.
- **Previous task:** `tasks/round-130.md` (exact copy, `cmp` OK, 32190 bytes). Rationale: `b-round-130.md`. Decision record: **D-29z96** in `plan.md`.
- **Baseline: commit `ba542970c31b235c1e77e23dea06ec366fe7d721`** (gate 130 published). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-130-r131-tree-sha256.txt`, **935 entries**. It is `git ls-files -co --exclude-standard` minus the 7 grants in `b-round-130-r131-grants.txt`. `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 7 grants:** `b-round-130-r131-granted-start-sha256.txt`. **Start copies:** `b-round-130/r131-granted-start/` (paths relative to `store/`). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z96)
- **Round 130: C PASS**, `browserVerified` = `realVerified` = true, 0 bugs. Gate 130 published `ba54297`. **V-0.2b is done.**
- `tasks/round-130.md` §8 fixed this step: after a V-0.2b PASS comes V-0.2c, which B measures first and splits if needed.
- B measured it (exact greps, `b-round-130.md` §3). V-0.2c as one round would be 3–4 times the size of round 130:
  - groups: 190 test lines in 11 files (a separate, overlapping grep finds about 180 uses of the default group name `ჯგუფი N` in fixtures; B re-measures at c3 planning);
  - collection: 42 test lines in 7 files;
  - tempo, metronome and view: 23 test lines;
  - video: 8 test lines.

  **Split, with the scope unchanged:**
  - **c1** = video import (this round);
  - **c2** = `tempo.ts`, `metronome.ts`, `view.ts`;
  - **c3** = `selection.ts` + `groups.ts`.

  `collection.ts` (with the Context l.3462 load fallback) moves whole to **V-0.5** with the library UI that shows its errors. `library.ts` (the track-kind labels) moves to **V-0.4** with the default track names.
- The regression round is not due: `regression-last.json` is dated 2026-10-24, so the next one is due on or after 2026-10-27. No Critical, High or Medium finding is open. `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
- **Folded in (costs little; the round already owns the code):**
  - **GATE130-S5:** doc 106's status line. One line changes.
  - **GATE130-S3 forward rule:** each new formatter gets **one literal English assertion** in a UI test, besides `strings.test`. The new UI test below applies this rule.

## 1. What changes (user-visible)
One new exported object, **`studioVideoStrings`**, goes in `app/lib/arrangement/strings.ts`. Every Georgian literal below moves there, in English.

**Text only.** No change to any of these:
- a condition or the order of checks;
- the abort or early-return paths;
- a state update, history push, seek or decode chain;
- timing;
- `classifyVideoFile`.

### 1.1 The English map (exact text; A may not reword it — if a line seems wrong, report it and B rules)
Notation:
- `{name}` = a file name. It is user content and is not translated.
- `{start}` / `{end}` = already formatted times (`formatArrangementTime`, called in the Context, as in V-0.2b).
- `{detail}` = an error message or a file extension.
- Georgian „…“ quotes become English “…” (U+201C / U+201D).

| # | Where today (baseline line) | Object.key (A may rename the key, not the text) | English |
|---|---|---|---|
| V1 | Context `runVideoImport` l.2230 `„${file.name}“ იხსნება…` | `opening(name)` | `Opening “{name}”…` |
| V2 | Context l.2280 | `addToTrackFailed(name)` | `“{name}”: could not be added to the video track.` |
| V3 | Context l.2286, the history label | `historyAddVideo(name)` | `Add video — {name}` |
| V4 | Context l.2291 (status; no final period today, so none is added) | `added({name, start, end})` | `“{name}” added to the video track: {start} — {end}` |
| V5 | Context `importVideoFiles` catch, l.2321 | `importFailed(detail)` | `Could not add the video: {detail}` |
| V6 | `video.ts` `audioFileRejectionMessage` l.66 | `audioFileRejected(name)` | `“{name}”: audio files cannot be added here — only your own video can; sounds are added from the library.` |
| V7 | `video.ts` `unsupportedFileMessage` l.72 | `notVideo(name, detail)` | `“{name}”: the format is not video ({detail}).` |
| V7a | `video.ts` l.71, the fallback `'უცნობი ტიპი'` | `unknownType` | `unknown type` |
| V8 | `video.ts` `audioLaneDropMessage` l.85 | `dropOnVideoTrack` | `Drop the video on the video track.` |
| V9 | `video.client.ts` `videoProbeErrorMessage` l.35 | `probeFailed(name)` | `“{name}”: the browser could not open this video — try MP4 (H.264) or WebM.` |
| V10 | `videoAudioNote('no-audio')` l.40 | `noSound` | `The video has no sound` |
| V11 | `videoAudioNote('too-long')` l.43 | `tooLongToRead` | `Sound not read: the video is longer than 20 minutes` |
| V12 | `videoAudioNote('too-large')` l.46 | `tooLargeToRead` | `Sound not read: the file is larger than 1 GB` |
| V13 | `videoAudioNote('decode-failed')` l.48 | `soundUnreadable` | The same text as `studioExportStrings.videoSoundUnreadable`: `The video's sound could not be read — it is not in the export`. A may write it as a reference to that value inside `strings.ts`. |
| V14 | `video.client.ts` l.70, the probe abort | `probeCancelled` | `Adding the video was cancelled.` |
| V15 | `video.client.ts` l.141 and l.148, the decode abort | `decodeCancelled` | `Reading the video's sound was cancelled.` |

- **Exported names stay; their values move.** These functions keep their names, parameters and return types, and their bodies return module values:
  - `audioFileRejectionMessage`, `unsupportedFileMessage` and `audioLaneDropMessage` (`video.ts`);
  - `videoProbeErrorMessage` and `videoAudioNote` (`video.client.ts`).

  Their importers stay frozen: `ArrangementLane.tsx`, the Context, `export-mp3.test`, `video.test` and `strings.test`.
- **Conditional copy stays where it is.** These only pick module values:
  - the `reason` branches in `videoAudioNote`;
  - the `extension ? … : file.type || unknownType` choice;
  - the `kind` branches in `audioLaneDropMessage`;
  - the `error instanceof Error ? error.message : String(error)` detail.

  `strings.ts` imports nothing. `video.ts` and `video.client.ts` may import `studioVideoStrings` from `./strings` (the leaf rule allows this direction).
- **Unchanged this round** (they stay Georgian; C subtracts them by name):
  - (a) The default track names, Context l.546–547 (V-0.4).
  - (b) The group nudge label `გადატანა (${ids.length})`, l.1760 (V-0.4, D-29z95 R4).
  - (c) The library load fallback `'ჩატვირთვა ვერ მოხერხდა'`, l.3462. **Ruling:** it is shown only as a library item error, after `შეცდომა:` (`ArrangementLibrary.tsx` l.122), next to the `collection.ts` thrown messages. All of these move together in V-0.5, so one library error line never mixes two languages.
  - (d) The video lane's own texts in `ArrangementLane.tsx`: the empty-lane hint l.853, the drag hint l.864 `აქ ვიდეო არ ემატება — ჩააგდე ვიდეოხაზზე`, and the clip sound badge l.951–954 (`ხმა იშიფრება…` / `ხმა ვერ წაიკითხა` / `ხმა არ არის`). These are V-0.4, with the whole lane. **Ruling on GATE130-S1 (ghost/hint vs status):** the lane has 20 Georgian lines, and tests pin its ghost texts. Moving 3–5 of them now would leave the lane half-migrated, and it would need a second per-file scan. Instead, V-0.4 must move the lane's ghost and hint texts using the same English as the status texts (`No room here`, `has not loaded yet`, `Drop the video on the video track`). The mixed language is temporary and tracked (GATE128-S1).
- **Where `videoAudioNote` shows (for C).** Its output is stored as `source.audioNote` and is shown **only in the Export dialog** (`ArrangementExportDialog.tsx` l.68, in the list `data-testid="arrangement-export-video-sound"`). The clip badge on the lane is the lane's own text, (d) above.
- **Glossary additions** (doc 107 and the backlog glossary):
  - video track (`ვიდეოხაზი`);
  - Add video — {name} (`ვიდეოს დამატება`);
  - Opening … (`იხსნება…`);
  - the format is not video;
  - unknown type;
  - Sound not read (`ხმა არ წაიკითხა`);
  - The video has no sound.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Add `studioVideoStrings` with V1–V15. The six existing objects are unchanged. Imports nothing |
| `app/lib/arrangement/video.ts` | **Only:** the import and the string literals of l.66, 71, 72 and 85 (module values or formatters). No condition or non-string expression changes |
| `app/lib/arrangement/video.client.ts` | **Only:** the import and the string literals of l.35, 40, 43, 46, 48, 70, 141 and 148. The timeout constant, the `reason` order and the abort checks are unchanged |
| `app/contexts/ArrangementContext.tsx` | **Only:** the import, and the string expressions at baseline l.2230, 2280, 2286, 2291 and 2321 → `studioVideoStrings` formatters. The times are still formatted in the Context. No condition, dependency array, call order or non-string expression changes. l.546–547, l.1760 and l.3462 stay |
| `app/lib/arrangement/__tests__/strings.test.ts` | New `describe('V-0.2c1 video import strings')` with ST14–ST16 (§3.1). **ST13:** remove the 5 video-import lines from its expected list, which leaves 4 lines in order: `'ვიდეო'`, `'აუდიო'`, the `გადატანა` label and the l.3462 fallback. Its title may change from "later V-0 stages" only if A reports the new title. ST1–ST12 are unchanged |
| `app/lib/arrangement/__tests__/video.test.ts` | l.59 → `studioVideoStrings.dropOnVideoTrack` (same `toBe`). l.62 → `studioVideoStrings.audioFileRejected('tone.wav')` (keep `toContain`, or use `toBe` with the same value; report which). The track names l.20–21 stay |
| **new** `app/lib/arrangement/__tests__/video-import-status-ui.test.tsx` | Exactly **4 `it`s**, VI1–VI4 (§3.2). Copy the whole mock preamble of `export-mp3.test.tsx` l.24–41 (`@remix-run/react`, `graph.client`, `video.client` with `importOriginal`, `mp3-encoder.client`) and its mounting/provider helper (`mountMp3Dialog`/`live` style), because `decodeVideoAudio(file, getDecodeContext(), …)` evaluates the decode context first. Override only `probeVideoFile` and `decodeVideoAudio`. Drive the import through the Context's `importVideoFiles`. Read the status the way the existing Context UI tests read it. A missing test-side mock is not a stop-rule case; only a needed **production** hook is |
| `docs/implementation/2026/quarter-IV/106-studio-v0-playback-loop-strings.md` | **Only l.4**, the status line → `**სტატუსი:** Completed (A-ის შემოწმებები მწვანეა რაუნდ 130-ში; C round 130 — PASS, browserVerified; gate 130 — ba54297)` (GATE130-S5) |
| **new** `docs/implementation/2026/quarter-IV/107-studio-v0-video-import-strings.md` | TEMPLATE.md sections, in Georgian: the V map, the split of V-0.2c (c1/c2/c3, collection → V-0.5, library labels → V-0.4), rulings (c) and (d), the forward rule (one literal per formatter), the glossary additions, the tests and the mutations. Status is Completed only after §4 is green |

- **Test rules (as in rounds 129–130, plus one forward rule):**
  - In existing tests, every assertion that pins a V-text uses the module value or formatter, with the same inputs and **the same matcher**.
  - **New rule (GATE130-S3):** VI1–VI4 assert the **hand-written English literal** for each formatter they reach. A module-built expected value alone is not enough there, because it cannot catch a template change.
  - Georgian track names inside expected text stay.
  - No `it` is added, removed or renamed outside the new describe and the new file.
  - Line numbers are baseline (`ba54297`) positions. Find each by its text.
- **Pre-edit grep (A records it):** for each V row, grep the old Georgian text in `app/**/__tests__/**` and `e2e/**`. B's grep found test hits only in `video.test.ts` (l.59, l.62) and `strings.test.ts` (ST13 l.662–666). `e2e/` has no Georgian. These name-only importers need no change, because the names stay: `export-mp3.test`, `waveform-zoom.test` and `ArrangementLane.tsx`.
- **Stop rule:** stop and report (B rules) if any of these happens:
  - a test outside §2 asserts an old V-text, or turns red;
  - a change needs a frozen file, or a non-string line in the Context, `video.ts` or `video.client.ts`;
  - VI1–VI4 cannot be written with the `export-mp3` mock pattern without a new production hook.
- **Expected end state:** `git status` shows 7 ` M` + 2 `??` (the new test and doc 107) and no other path. The frozen list is OK at the start and at the end. Report the end sha256 of the 9 paths.
- **Protected (unchanged; `git diff ba54297` on them is empty):**
  - `app/routes/studio.$productId.tsx`;
  - `app/routes/api.studio-token.ts`;
  - `app/lib/auth.ts`;
  - `app/contexts/AuthContext.tsx`;
  - `app/components/ui/Modal.tsx`;
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check:fix` / any `--write`, `npm run format`.
- **Edit rule (C-R120-01):** lasting edits only with the Edit/Write tool. Shell writes are allowed only for temporary mutations, which are restored and checked by sha256. List every shell write.
- **Before editing, read:**
  - `.claude/primitives-map.json`;
  - `AGENT_DISCOVERABLE_CODE.md`;
  - `REACT_CONTEXT.md`;
  - `AUDIO_ARCHITECTURE.md` (the decode path is touched, strings only);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `.claude/prompts/new-test.md` (new test file);
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` (also no `as const`), semicolons, no code comments.

## 3. A — tests and mutations
### 3.1 `strings.test.ts`: ST14–ST16 (the file goes from 13 to 16 `it`s)
- **ST14:** every plain-string property of `studioVideoStrings` equals its exact English literal from §1.1 (`toBe`). Its key list equals the expected list. `soundUnreadable` `toBe` `studioExportStrings.videoSoundUnreadable`.
- **ST15:** every formatter returns the exact English for its inputs, with `toBe`:
  - `opening`, `addToTrackFailed`, `historyAddVideo`, `audioFileRejected` and `probeFailed` with the name `film.mp4`;
  - `added` with `00:01.000` / `00:07.000`;
  - `importFailed` with `boom`;
  - `notVideo` with `doc.pdf` / `.pdf`.

  It also checks the exported functions `toBe` the expected English:
  - `videoAudioNote` for each of the 4 reasons;
  - `videoProbeErrorMessage('film.mp4')`;
  - `audioFileRejectionMessage('tone.wav')`;
  - `unsupportedFileMessage({name: 'doc.pdf', type: 'application/pdf'})` → `.pdf`;
  - `unsupportedFileMessage({name: 'noext', type: ''})` → `unknown type`.
- **ST16:** no plain value and no formatter output of `studioVideoStrings` contains a Georgian codepoint. **Plus a per-file scan:** after comments are stripped, `video.ts` and `video.client.ts` contain no Georgian codepoint.
- **ST13:** the list shrinks to the 4 lines of §2. Any new or remaining Georgian video line turns it red.

### 3.2 `video-import-status-ui.test.tsx`: VI1–VI4
Each `it` asserts the **hand-written English literal**. Names below are examples. A uses the same names in the file and reports them.
- **VI1, a good import:**
  - Mock the probe to resolve `{duration: 4, width: 640, height: 360}`, and make the decode stay pending.
  - Call `importVideoFiles([film.mp4])` on an empty project.
  - Expect the status `toBe('“film.mp4” added to the video track: 00:00.000 — 00:04.000')`.
  - Expect the last history label `toBe('Add video — film.mp4')`. If the Context exposes only the Undo title, use `'Undo: Add video — film.mp4'`.
  - Expect one video clip at 0.
  - Also record that the transient `Opening “film.mp4”…` status was set before the probe resolved. A deferred probe promise makes this observable.
- **VI2, a probe failure:**
  - Mock the probe to reject with `new Error(videoProbeErrorMessage('bad.mp4'))`.
  - Expect the status `toBe('“bad.mp4”: the browser could not open this video — try MP4 (H.264) or WebM.')`.
  - Expect no clip.
- **VI3, a rejected batch:**
  - Call `importVideoFiles([tone.wav (audio/wav), doc.pdf (application/pdf)])`.
  - Expect the status to equal both literals joined with `' · '`, in order:
    - `“tone.wav”: audio files cannot be added here — only your own video can; sounds are added from the library.`
    - `“doc.pdf”: the format is not video (.pdf).`
  - Expect the probe not to be called.
- **VI4, no sound:**
  - The probe resolves, and the decode resolves `{buffer: null, reason: 'no-audio'}`.
  - Expect the video source's `audio` `toBe('none')` and its `audioNote` `toBe('The video has no sound')`.

### 3.3 Mutations (each turns the named test red; restore and check by sha256)
| Mutation | Change | Must turn red |
|---|---|---|
| **m9** | `added` drops `— {end}` | ST15 **and VI1** (this proves the forward rule) |
| **m10** | `noSound` back to `ვიდეოს ხმა არ აქვს` | ST14, ST16 and VI4 |
| **m11** | in `runVideoImport`, the history label uses `addToTrackFailed(file.name)` instead of `historyAddVideo` | VI1 |
| **m12** | put `` `„${file.name}“: ვიდეოხაზზე დამატება ვერ მოხერხდა.` `` back in the Context | ST13 |
| **m13** | in `unsupportedFileMessage`, the fallback `unknownType` → `'უცნობი ტიპი'` | ST15 and ST16 (per-file scan) |

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the 7 changed code and test files.
- `npx vitest run` on these files. Every one must be green. Name the exact list and counts in the report; C runs the same list.
  - The granted tests: `strings`, `video`, `video-import-status-ui`.
  - The name-only importers: `export-mp3`, `waveform-zoom`.
  - The neighbours: `ArrangementContext.test`, `gesture-reentry`, `status-announcement-ui`, `video-sync`, `video-fades`, `video-fades-ui`, `collection-load-status`, `failed-source-refusal`. If one of these file names does not exist, report it and do not invent one.
- No full suite and no `npm run verify` (the gate runs them).
- **code-reviewer required** (9 paths). Pass its Architecture note to B.
- **Report `a-round-131.md`:**
  - start HEAD, frozen OK and the 7 start hashes;
  - the pre-edit grep;
  - per granted file, the changed keys and lines (`diff -u` vs `b-round-130/r131-granted-start/`, saved as `a-round-131/granted.diff`);
  - `it` counts before and after, per file;
  - m9–m13;
  - typecheck and lint results;
  - the reviewer's verdict and Architecture note;
  - every shell write;
  - end `git status`, frozen OK, and the 9 end hashes;
  - deviations.

## 5. C — rows
Real Playwright Chromium, a fresh context per session, **1440×900 and 1280×720**, `http://127.0.0.1:5173/studio-lab`.
- **Tools and media:** `c-round-122/tools/lib.cjs` `loadVideo` (`[data-testid=arrangement-video-input]` `setInputFiles`), the synthetic `DataTransfer` drop in `c-round-124/tools/q1.cjs` l.94–96, and `c-round-130/tools/` (status reading, Undo title, GEO count). Media: `tmp/studio-real-loop/media/` (`beeps-6s-h264-aac.mp4`, `beeps-6s-vp9-opus.webm`, `clip-3s-h264-aac.mov`, `noaudio-2s-h264.mp4`, `broken.mp4`, `tone-2s.wav`). For a non-video file, C writes its own `doc.pdf` or `.txt` under `c-round-131/`.
- **Invalid runs:** ENV-FIRST-LOAD — discard one crashed first load and record it under `invalidRuns`. At most 2 replacement attempts per row, and only for runs that are invalid because of the environment.
- **Evidence:** a unique file per run. Open every screenshot with Read and describe it.
- **Reading values:**
  - Read the status from the live status region.
  - Record **every** text change with a MutationObserver, so the transient V1 is seen.
  - Read the Undo button `title`.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T131-TARGETED** | A's exact §4 vitest list | All green; the counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet b-round-130-r131-tree-sha256.txt` (from `store/`); protected `git diff ba54297` | 7 ` M` + 2 `??`; frozen OK; protected files unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` of each grant vs `b-round-130/r131-granted-start/`; read the 2 new files | **`strings.ts`:** one new object and nothing else changed; no import.<br>**`video.ts` / `video.client.ts`:** only the import and string literals. The conditions, the abort checks, the `reason` order and the timeout are unchanged.<br>**Context:** only the import and the 5 string expressions; l.546–547, 1760 and 3462 unchanged; no condition, dependency array or call-order change (list every hunk).<br>**Doc 106:** only l.4.<br>**Tests:** every hunk is an import, a literal → module change with the same matcher, ST13's shorter list, ST14–ST16, or the new file; VI1–VI4 use hand-written literals; no `skip`, `only` or `todo`.<br>**Meaning check:** no V row drops or adds a fact vs the Georgian original (side by side).<br>Every shell write is listed |
| **VID-ADD** (both viewports) | (a) `beeps-6s-h264-aac.mp4` through the video input on a fresh project. (b) `beeps-6s-vp9-opus.webm` next. (c) `clip-3s-h264-aac.mov`. (d) The Undo title after (a); Undo; Redo | (a) The observer sees `Opening “beeps-6s-h264-aac.mp4”…`, then `“beeps-6s-h264-aac.mp4” added to the video track: 00:00.000 — 00:06.000`, with the real times from the clip's start and length. The clip is on the video lane and the playhead seeks to its start.<br>(b) and (c) The same pattern with their own real times. A `.mov` is accepted as video.<br>(d) `Undo: Add video — beeps-6s-h264-aac.mp4`; Undo removes the clip; Redo restores it.<br>The effects are as before (clip count, start, seek). C states the effect next to each message |
| **VID-REJECT** (both) | (a) `tone-2s.wav` through the video input. (b) C's `doc.pdf` (or `.txt`). (c) A file with no extension and no type, if the input accepts it; otherwise inconclusive (ST15). (d) `broken.mp4`. (e) `tone-2s.wav` + `doc.pdf` in one selection | (a) V6 for `tone-2s.wav`.<br>(b) `“doc.pdf”: the format is not video (.pdf).`<br>(c) `… (unknown type).`<br>(d) V9 for `broken.mp4` (after the browser's error or the 10 s timeout).<br>(e) Both messages joined with ` · `.<br>No clip is added in any case, and no Undo entry is created |
| **VID-NOAUDIO** (both) | `noaudio-2s-h264.mp4`, wait until its decode settles, open Export | In the Export dialog, `arrangement-export-video-sound` shows `Original video sound (noaudio-2s-h264.mp4): The video has no sound`. The lane's clip badge `ხმა არ არის` is frozen (V-0.4) and is subtracted by name. Also do `noaudio-2s-vp9.webm` at 1440 |
| **VID-LANE-DROP** (both; try once) | Synthetic `DataTransfer` drop (the q1.cjs pattern) of `beeps-6s-vp9-opus.webm` on the **music** lane; then of `tone-2s.wav` on the music lane | `Drop the video on the video track.` / V6. If the synthetic drop does not reach the handler, the row is inconclusive (ST15/`video.test`), not FAIL. No clip is added. The lane's drag hint (l.864) is frozen and is subtracted by name |
| **GEO-COUNT** (both) | After each VID row | Georgian in the status region, the Undo title and the Export video-sound list = 0, after removing **by name**: the track names (`ვიდეო`, `მუსიკა`, `სტემები`), file names and sound titles, the lane's clip badge and drag hint, and the library error line. List each subtracted item |
| **LAYOUT** (both) | S0/S1 boxes vs `c-round-125/out/bbox-baseline-*.json`, outside the status region; the status region box after the longest V message (V6 or the V6 + V7 batch) | Every box outside the status region and the Undo button is within 1 px. The status region keeps its position. A height or wrap change must come from the message text (the RV-1 V-0 text-width exception). No new horizontal overflow |
| **REG-130** (1440, short) | One V-0.2b recheck: Ctrl+L on a time selection, then Space on an empty project in a fresh session | `Loop created and turned on: {span}.` / `Nothing to play — add a clip from the library first.` |
| **G131-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | The workspace and the demo badge show. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G131-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror` (the known cloud cart noise is not reported) |

- **Known not reachable in cloud Chromium (inconclusive; covered by ST14/ST15/VI only):**
  - V5: the outer import catch;
  - V11 / V12: a 20-minute or 1 GB video;
  - V13: a file whose audio marker is present but cannot be decoded, unless C has one;
  - V14 / V15: the abort texts. The Context returns before showing them;
  - V2: `appendVideoClip` failure.
- **Library add note (C-R130 note 2):** the library add action is **＋ დამატება, or Enter on a focused option**. `A` is the Envelope toggle.
- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:**
    - any behaviour change: a file accepted or rejected differently, clip placement, seek, the decode result, history, export content;
    - a wrong or fact-dropping message;
    - a weakened, removed or skipped test;
    - a non-string hunk in the Context, `video.ts` or `video.client.ts`.
  - **Low:** wording or style.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Importing a video file into the Arrangement | Live 12 manual has a video chapter (it is listed in the TOC of the B capture `b-round-71/ableton-arrangement-view-20261021.txt`, captured 2026-10-21). Its content was **not** captured or read for this round | **Unconfirmed**; no claim | One video track, own video only, sounds from the library: the user-agreed CZABA scope. This round changes text only | VID-ADD, VID-REJECT |
| Video sound used in the export | — | **Unconfirmed**; no claim | Existing CZABA behaviour (SRW-13); text only | VID-NOAUDIO |
| Wording "track", "Add …" | V-0 glossary (`tasks/round-127.md` §1.1, Live 12 terms where confirmed) | Term reuse only | "video track", "Add video — {name}" | AN-REVIEW |

C rates "CZABA requirement met" and "Ableton correspondence" separately. For this round the Ableton correspondence is **not applicable / unconfirmed**: only text changes, and no Live behaviour is claimed.

## 7. Evidence and reporting
- C writes `c-round-131.md` and `c-round-131.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted items), and `notesForB`. Evidence goes under `c-round-131/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`. An inconclusive "try once" row (VID-LANE-DROP, VID-REJECT (c)) does not make it false, as long as it was tried and recorded.
- C makes no `store/` writes. C's own test files (`doc.pdf`) live under `c-round-131/`.

## 8. Outcome, fixed in advance (B at round 132 planning)
| Condition | Round 132 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.2c1 fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.2c1 → `c_pass`, then `c_pass_published` after the gate. Round 132 = **V-0.2c2**: `tempo.ts` (`TEMPO_INVALID_MESSAGE`, `TEMPO_EMPTY_HINT`, the tempo status), `metronome.ts` (`METRONOME_*` titles and statuses) and `view.ts` (`px/წმ` → `px/s`). The exported names stay. B measures the test coupling first |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Where it could break:**
  - **The import sequence:** status joins with ` · `, the per-file `report`, the abort early-returns and the `decodeChainRef` chain. Only strings change.
  - **The Export dialog's video-sound line:** `audioNote ?? videoSoundUnreadable`.
  - **The lane's file-drop status:** `audioLaneDropMessage`, called by the frozen `ArrangementLane`.
  - **`export-mp3.test`:** it mocks `video.client` with `importOriginal`, so the new import of `./strings` in `video.client.ts` must not break the mock.
- **Architecture:**
  - This is the **last V-0.2 edit to the Context's video region**. B writes the bounded frontend-architect checkpoint request now (`b-round-130-checkpoint-request.md`), so root can run it read-only alongside c2/c3. It does not block A or C.
  - The questions: the strings module shape and growth; conditional copy in formatters vs at the call site; the Context's re-export surface (aliases) vs direct imports; and the Context size.
- **Commit readiness:** after C PASS, root may publish V-0.2c1 as an interim unit.
