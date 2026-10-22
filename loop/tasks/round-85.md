# CURRENT TASK — Round 85: X1 = C-R84-M1 (sticky track header covers clip content; Medium) + SRW-20 stage 1 — range export (R20-X1, R20-X3) (D-29z50)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-84.md` (an exact copy; sha256 `59075581…`). Rationale: `b-round-84.md`. Decision record: D-29z50 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** **first** the one open Medium C bug, **X1 = C-R84-M1** (a one-token stacking fix, with its own C rows). **Then** one feature stage, **SRW-20 stage 1** (range export, WAV). These follow the round-84 precedent of one labelled bounded fix plus one feature stage. The files do not overlap: X1 is a lane/clip class, and SRW-20 is the export path. One owner (A).
- **SRW-20 is split into three stages. Nothing is deferred or shrunk:**
  - stage 1 (this round): range export, R20-X1, and a re-check of R20-X3;
  - stage 2: MP3 through the existing `app/utils/ffmpeg.ts`, with a clear error and no file when the CDN load fails (R20-X2);
  - stage 3: encoding off the main thread, with progress and cancel on a 5-minute project (R20-X4).

## Why this round
- **C round 84: PASS, `browserVerified=true`, `realVerified=true`.** All SRW-19 rows (R19-F1, R19-F2) and X1-ALIGN (C-R83-L1) passed at both viewports. The only BLOCKED item is the fake-Bearer 403 sub-check (backend unavailable in the cloud).
- **Gate 84** published `88b0262bda6bdc928bbc39c4cbca77c8a2ca9504` to both remotes.
- **SRW-19 is now "მოწმდება"** (C PASS with browser evidence; Tech Lead R84-T remains). **C-R83-L1 is closed** (X1-ALIGN, 0 px).
- **New C bugs:**
  - **C-R84-M1, Medium:** the P-M1 probe reproduced the gate-83 reviewer's M1. Video fade handles (`z-40`) and audio fade handles (`z-30`) paint over the sticky track header (`z-20`). They are also the topmost element for hit-testing. A real drag at a header spot changed the fade of a hidden video clip from 1.000 to 2.000, with an Undo entry. Envelope points are covered correctly. → **X1, first.**
  - **C-R84-L1, Low:** two exports of an unchanged project differ by ±1 LSB, only over the span of the video's own sound. The audio path is frozen and the difference is inaudible → Lows batch and a harness rule. This round's export oracles apply that rule (§5).
- **No Critical/High bug is open.** The regression round is not due yet: `regression-last.json` = 2026-10-21, due on/after **2026-10-24**.
- **SRW-20 depends on SRW-13.** SRW-13 is `in_progress_bug_open` only for meter/polish residue. Its export parts (R13-M3, R13-M4) are C PASS, so this is not a blocker.

## Baseline (measured by B, 2026-10-22)
- **HEAD `88b0262bda6bdc928bbc39c4cbca77c8a2ca9504`** (published by gate 84). `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-84-r85-tree-sha256.txt`, **481** entries, **481/481 OK**.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-84-r85-tree-sha256.txt`.
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 7 owned existing files below. The round-84 files `video-fades.ts`, `ArrangementVideoDock.tsx` and `ArrangementClipEnvelope.tsx` are now frozen.
  - Frozen examples: `schedule.ts`, `model.ts`, `fades.ts`, `envelope.ts`, `StudioWorkspace.tsx`, `app/utils/ffmpeg.ts`, `lib/sfx-edit.ts`, and every test except `graph.test.ts` (`master-ui.test.tsx`, `export-dialog-focus*.test.tsx`, `clip-fades-ui.test.tsx`, `video-fades-ui.test.tsx`, …).
- **Snapshots:** `../tmp/studio-real-loop/b-round-84-r85-snapshots/` (`SHA256SUMS.txt`). All LF, CR=0:

  | File | sha256 prefix | lines |
  |---|---|---|
  | `app/components/arrangement/ArrangementLane.tsx` | `46e5ff16` | 987 |
  | `app/components/arrangement/ArrangementClip.tsx` | `67166666` | 952 |
  | `app/lib/arrangement/graph.client.ts` | `e2d41e0c` | 461 |
  | `app/contexts/ArrangementContext.tsx` | `497a96ec` | 3092 |
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `d5f1f611` | 318 |
  | `app/lib/arrangement/__tests__/graph.test.ts` | `ae58d726` | 391 |
  | `docs/implementation/2026/quarter-IV/074-studio-lab-video-opacity-fade.md` | `7fffc793` | 84 |

- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). The auth files are also never touched.
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected.
  - Re-check at phase start.
  - Never start or stop servers.
  - A row that truly needs the backend is "BLOCKED: backend unavailable in cloud".
- **Do not change the repository state:**
  - never stash, reset, checkout, clean or re-create anything;
  - a mismatch (another HEAD, non-empty status, a changed frozen file) means stop and report;
  - never run `biome check --write`, `format --write`, `npm run format` or `check:fix`; format new files through stdin to stdout;
  - run mutation proofs **in a scratch copy** (`a-round-85/mut/`, as in round 84), never in `store/`.

## 1. What changes (A)

### X1 — C-R84-M1: the sticky track header must cover clip content scrolled under it (first)
**Today (B read the source at `88b0262`):**
- The track header (`ArrangementLane.tsx` l.617) is `sticky left-0 z-20`, and it comes first in the row's DOM.
- The lane body (l.778) is `relative shrink-0` with no z-index, so it is **not** a stacking context.
- The clip root (`ArrangementClip.tsx` l.803–806) is `absolute` with **no** z-index unless it is selected (`z-10`).
- So the children of an **unselected** clip compete directly with the header in the same stacking context:
  - fade handles `z-30` / `z-40` (l.924) → paint and hit **above** the header;
  - trim strips `z-20` (l.939/944) → same z as the header, but later in the DOM → **above** the header;
  - the lane-move/library ghosts `z-30` (Lane l.824/858; `pointer-events-none`) → paint above the header.
- Envelope points are covered only because their parent (`ArrangementClipEnvelope` l.334) is `absolute … z-10`, a stacking context capped below 20. That explains C's observation.
- Frozen `clip-fades-ui.test.tsx` l.342–343 asserts `z-40` on active handles. **The handle z-classes stay.**

**Contract (acceptance, not mechanism):**
- At every point inside a track header's rect, the topmost element (`elementFromPoint`) is the header or one of its descendants. This holds for audio and video fade handles, trim strips and envelope points of any clip, selected or not, scrolled under that header.
- A real press or drag there acts only on the header control under the pointer. It never changes a clip value, never adds an Undo entry and never writes a clip status.
- Ghosts and range overlays never paint over the header.
- Inside the visible lane area nothing changes:
  - handles, trim strips and envelope points keep their relative order (handles above the waveform, trim strips at the edges, the selected clip's ring above its neighbours);
  - the playhead line stays visible;
  - the header's sticky `left-56` hint text sits right of the header (224 px = `ARRANGEMENT_HEADER_WIDTH_PX`).
- **Fix (smallest honest; B's recommendation):** add Tailwind `isolate` to the **lane body** className (l.779). That makes the lane body one stacking context below the `z-20` header and covers handles, trim strips, ghosts and overlays at once.
  - **Allowed alternative,** only if the lane-body token breaks a frozen test or a visible-area behaviour: `isolate` on the **clip root** (l.803), plus the same on any ghost wrapper that still escapes. Justify the choice in `a-round-85.md`.
  - No other change to either file. Do not raise the header's z-index.
- **Structural guard test (honest label):** jsdom does not paint and does not hit-test.
  - `track-header-stacking.test.tsx` (new) renders the workspace with an unselected faded audio clip, an unselected faded video clip, a lane-move ghost and a selected clip. It asserts that the element you chose is a stacking context by class (`isolate`) and that the header keeps `sticky … z-20`.
  - This is a regression lock, not proof of behaviour. The behaviour proof is C's browser rows M1-*.

### SRW-20 stage 1 — range export (R20-X1, R20-X3)
**Today (B read the source at `88b0262`):**
- `renderArrangementWav(arrangement, buffers)` (`graph.client.ts` l.425–461):
  - always renders `0 … projectEnd` (`length = ceil(end × 48000)`) through `applySchedule(ctx, planSchedule(arrangement, 0), { from: 0, startAt: 0, … })`;
  - then measures overload and encodes 24-bit with `encodeSfxWav`.
- `planSchedule(arrangement, from, until?)` (`schedule.ts` l.68, frozen) already gives mid-start items (`when = max(start, from)`, `sourceOffset += from − start`).
- `applySchedule` / `scheduleClipFadeGain` / `scheduleClipEnvelopeGain` take `from` / `startAt`. This is the same path that live playback uses from any position: FD-MIDSTART and EN-MIDSTART are C-verified.
- `exportWav()` (`ArrangementContext.tsx` l.2653–2696):
  - takes no argument;
  - writes `WAV შეიქმნა: {projectEnd}, 24-bit · 48 kHz · stereo.` (locked by frozen `master-ui.test.tsx` l.258 DONE_MESSAGE);
  - downloads `czaba-studio-lab.wav`.
- The dialog (`ArrangementExportDialog.tsx`):
  - lists `range` ("მხოლოდ მონიშნული მონაკვეთი") as a **disabled** "unavailable" option next to MP3 (l.18–21);
  - its description says `მთელი პროექტი · 0:00 — {projectEnd}`;
  - its loop note says that the whole project is exported.
- The context exposes `range: TimeRange | null` (`{ start, end, trackId, allTracks? }`). The lane code reads it with `Math.min` / `Math.abs`, so treat it as possibly unnormalised.
- Frozen `graph.test.ts` l.384–390 locks the literal `applySchedule(ctx, planSchedule(arrangement, 0)` inside `renderArrangementWav`.

**Contract (B decision; Live 12 §5.1.3.1 confirms the time-selection → render range behaviour, §4):**
- **E1 — Render window.** `renderArrangementWav(arrangement, buffers, window?)`, where `window = { start, end }` in seconds.
  - **No window:** byte-identical to today for the whole project (same length `ceil(projectEnd × 48000)`, same graph, same encoding).
  - **With a window:**
    - `length = round((end − start) × 48000)` frames;
    - the schedule is `planSchedule(arrangement, start, end)` with `from = start`, `startAt = 0`, so clips that started before `start` play from the right offset, and fades and envelopes start at their correct mid-values (the existing from/startAt path);
    - overload is measured **only** over the rendered window;
    - encoding is the same.
  - The window is the **Master** mix of all tracks, whichever track the range was drawn on (Live: Rendered Track = Main by default). A window past `projectEnd` renders trailing silence up to `end`.
  - Invalid windows (non-finite values, `start < 0`, `end − start < 0.001`) never reach the renderer (E3).
  - **Literal grant:** amend `graph.test.ts` l.388 to the new call text and list the old and new line in `a-round-85.md`. A may add one source-text assertion for the no-window default (for example the default-from literal), but this is optional: the behavioural no-window guarantee is carried by XR1. No other `graph.test.ts` change.
- **E2 — Dialog scope.** A new fieldset "მონაკვეთი" with two radios `name="arrangement-export-scope"`:
  - `data-testid="arrangement-export-scope-project"`, label `მთელი პროექტი · 00:00.000 — {formatArrangementTime(projectEnd)}`;
  - `data-testid="arrangement-export-scope-range"`, label `მონიშნული მონაკვეთი · {formatArrangementTime(a)} — {formatArrangementTime(b)} ({(b − a).toFixed(3)} წმ)`, where a = min and b = max of the context range.
  - **Default at each open:** range if a valid range exists (b − a ≥ 0.001), otherwise project. The choice is read when the dialog opens. Changing the range while the dialog is open is not required.
  - **No valid range:** the range radio is **disabled**, with the reason line `მონიშნე დროის მონაკვეთი Arrangement-ში (drag კლიპზე ან სახაზავზე)`.
  - The old disabled `range` entry is removed from `unavailableOptions`. MP3 stays disabled with `UNAVAILABLE_REASON` (stage 2). The video option and the round-84 video-fades line stay unchanged (R20-X3).
  - `ModalDescription`: in project scope it stays **exactly** today's text (`მთელი პროექტი · 0:00 — {formatArrangementTime(projectEnd)}`); only in range scope is it replaced with `მონიშნული მონაკვეთი · {a} — {b} ({len} წმ)` (B grepped: no test locks the description).
  - With range scope, the loop note / master-mute note / no-sound note name the range length instead of `projectEnd`. The project-scope texts stay **byte-identical** to today.
  - Tailwind tokens only; the radios use the same visual pattern as the format radio.
- **E3 — `exportWav(window?)`** (`ArrangementContext.tsx`):
  - **No window:** today's behaviour byte-for-byte (messages, filename, guards).
  - **With a window:**
    - an invalid window → `phase: 'error'`, message `მონაკვეთი არასწორია — ფაილი არ შეიქმნა.`, no render, no download;
    - otherwise render through E1, download `czaba-studio-lab-range.wav`, and write the done message `WAV შეიქმნა: მონაკვეთი {formatArrangementTime(start)} — {formatArrangementTime(end)} ({(end − start).toFixed(3)} წმ), 24-bit · 48 kHz · stereo.` plus the existing master-mute suffix;
    - the overload warning comes from the window peak.
  - The existing guards (no Web Audio, empty project, video sound decoding) run first, unchanged.
  - The dialog passes the window only when the range scope is chosen.
- **Docs:**
  - **doc 074 l.4** → exactly:

    ```text
    **სტატუსი:** Round 84 — C PASS (`browserVerified`), გამოქვეყნდა `88b0262`
    ```

    No other change to doc 074.
  - **New doc 075** `docs/implementation/2026/quarter-IV/075-studio-lab-range-export-and-header-stacking.md`, in Georgian with the TEMPLATE sections. Status: `Round 85 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z50)`. Record:
    - the stacking cause and fix (X1);
    - E1–E3;
    - the round-length rule (round vs ceil, and why);
    - the Master-only render;
    - the stage plan (2: MP3, 3: worker/progress/cancel);
    - every Live difference from §4.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | X1: the `isolate` token on the lane body className. Nothing else |
| `app/components/arrangement/ArrangementClip.tsx` | X1 alternative only (root `isolate`). If it is unused, the file must stay byte-identical to the snapshot |
| `app/lib/arrangement/graph.client.ts` | E1: the optional `window` parameter of `renderArrangementWav` (+ type). Nothing else |
| `app/contexts/ArrangementContext.tsx` | E3: the `exportWav` signature/type, its window branch, messages, filename. Nothing else |
| `app/components/arrangement/ArrangementExportDialog.tsx` | E2 |
| `app/lib/arrangement/__tests__/graph.test.ts` | l.388 literal + one added assertion (E1 grant) |
| `app/lib/arrangement/__tests__/export-range.test.ts` | **new** (renderer level) |
| `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | **new** (dialog + context) |
| `app/lib/arrangement/__tests__/track-header-stacking.test.tsx` | **new** (X1 structural guard) |
| `docs/implementation/2026/quarter-IV/074-studio-lab-video-opacity-fade.md` | l.4 only |
| `docs/implementation/2026/quarter-IV/075-studio-lab-range-export-and-header-stacking.md` | **new** |

Expected end state: **6 M + 4 ??** (`ArrangementLane.tsx`, `graph.client.ts`, `ArrangementContext.tsx`, `ArrangementExportDialog.tsx`, `graph.test.ts`, doc 074), or **7 M + 4 ??** if the X1 alternative is used (plus `ArrangementClip.tsx`). Everything else is frozen (the 481-entry list). If a frozen test turns red, **stop and report**; do not edit it.

### Required tests (behavioural; the IDs are for C to cite)
`export-range.test.ts`. Use a recording fake `OfflineAudioContext` that captures the constructor `length`, each `source.start(when, offset, duration)` and gain-param calls; a sample-level check can use a deterministic fake render.
- **XR1:**
  - no window → `length = ceil(end × 48000)`, and the recorded `start(when, offset, duration)` calls equal a hand-computed `planSchedule(arrangement, 0)` plan (`toStrictEqual`);
  - window 4–9 on a 20 s project → `length = 240000`;
  - a clip spanning 2–12 starts at `when 0` with `offset = sourceOffset + 2`;
  - a clip starting at 6 starts at `when 2`;
  - a clip that ends before 4 or starts at/after 9 is not scheduled.
- **XR2:** a faded clip (fade-in 3–5 s) with window start 4 → the fade gain begins at the mid-value 0.5 and ramps to 1 at render time 1. An envelope point crossing the window start is handled the same way (the existing mid-start functions).
- **XR3:** overload is measured over the window only. Example: a clipping clip at 1–2 s with window 4–9 gives `clippedSamples 0`; the same clip inside the window gives > 0.
- **XR4:** window past `projectEnd` → length is the window length; the samples past the end are 0.

`export-range-ui.test.tsx` (workspace render, same harness style as `master-ui.test.tsx`, `renderArrangementWav` mocked):
- **XU1:** no range → the project radio is checked and the range radio is disabled with the exact reason; Export calls the renderer with **no** window; the done message equals the frozen DONE_MESSAGE form; the filename is `czaba-studio-lab.wav`.
- **XU2:**
  - with a range 4–9 (set through the context, and once unnormalised 9→4) → the range radio is checked by default, with the exact label;
  - Export calls the renderer with `{ start: 4, end: 9 }`;
  - the message is exact, the filename is `czaba-studio-lab-range.wav`, and the overload warning comes from the mocked window peak.
- **XU3:** with a range, choosing the project radio → no window, and the project texts are byte-identical. Reopening the dialog defaults to range again.
- **XU4:** a range shorter than 0.001 s → treated as no range. `exportWav({start: 5, end: 5})` called directly → the exact error, and the renderer is not called.
- **XU5:** MP3 stays disabled with `UNAVAILABLE_REASON`; the video option and its reason are unchanged; the round-84 video-fades line still follows a video fade. The Tab-wrap still holds (all radios reachable; the frozen `export-dialog-focus*.test.tsx` stays green).

### Mutation proofs (A runs them in a scratch copy; logs in `a-round-85/mut/`; each must turn at least one listed test red)
- (a) The window length uses `end` instead of `end − start` (XR1).
- (b) `from` stays 0 with a window, so there is no mid-start offset (XR1 or XR2).
- (c) Overload is measured over the whole project (XR3).
- (d) The range radio is not the default when a range exists (XU2).
- (e) The dialog passes the window in project scope (XU3).
- (f) The 0.001 s guard is removed (XU4).
- (g) The X1 `isolate` token is removed (the stacking guard).

## 2. Pre-flight for A
- **Primitives to read:** `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `API_ERROR_HANDLING.md` (error display only), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`. Also read the prompts `.claude/prompts/studio-feature.md` and `new-test.md`, and the skill `web-audio-api`.
- **Verify the baseline before the first edit:** HEAD, 0-line status, 481/481, the snapshots, protected 4/4, LF/CR.
- **Grep before coding:**
  - every caller of `renderArrangementWav` and `exportWav`;
  - every test that asserts dialog texts, radio counts or `unavailableOptions` (B found only `export-dialog-focus*.test.tsx`, `master-ui.test.tsx` and `graph.test.ts` l.388);
  - every `z-` class inside the lane body and the clip.
  - **Stop and report** if a frozen test or a site outside the grants must change.
- **Checks A runs (speed rules):**
  - `npm run typecheck`, `npm run lint`, and a scoped `biome check` on the owned files (no `--write`);
  - targeted vitest: the three new files, `graph.test.ts`, plus every test that renders `ArrangementExportDialog`, `ArrangementLane` or `ArrangementClip`, or imports `graph.client`. List them in `a-round-85/targeted-list.txt`. Not the full suite.
- **A's own Playwright smoke at 1440×900** is welcome (not C evidence). Do one warm-up load first, and use integer pointer coordinates.
- **Run the code-reviewer** (3+ files changed) and pass its Architecture note to B verbatim.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-85*`. **B** owns the planning artifacts. Root owns gates, commits and pushes.
- Protected (never edited): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, and the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`).
- `/studio-lab` stays the public **demo-only** workspace: demo collection badge, no purchased audio, no token/R2 requests. User video stays local (object URL); nothing is uploaded.

## 4. Ableton source table
**Sources:**
- Live 12 Reference Manual, "Managing Files and Sets", §5.1.3 "Exporting Audio and Video", §5.1.3.1 "Selection Options". URL: `https://www.ableton.com/en/live-manual/12/managing-files-and-sets/`. Fetched by B on 2026-10-22 with curl and stored as untrusted text in `b-round-84/web/managing-files.{html,txt}` (l.120–221).
- The X1 stacking rule is generic UI layering. There is no Live source and none is claimed.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A time selection in the Arrangement sets the render start and length | §5.1.3.1 ("You can also quickly set the range … by creating a time selection") | Confirmed (text) | Same: a valid range makes the range scope the default | XR-DEFAULT |
| By default the render covers the whole Set | §5.1.3.1 | Confirmed (text) | Same: with no range, project scope (unchanged whole export) | XR-PROJECT |
| Rendered Track "Main" = the post-fader Main output, the sound you hear | §5.1.3.1 | Confirmed (text) | Same: the range export is the Master mix of all tracks, whichever lane holds the range | XR-ALLTRACKS |
| Start/length can be typed in the dialog | §5.1.3.1 (Render Start / Render Length fields) | Confirmed (text) | **Conscious simplification:** no typed fields; the range comes from the Arrangement selection (user scope: simple editing) | — |
| Individual / selected tracks rendered as separate files | §5.1.3.1 | Confirmed (text) | **Not in CZABA scope** (no stems export requested); Master only | — |
| Render as Loop, MP3 with leading silence, progress bar | §5.1.3.2 | Confirmed (text) | Loop: CZABA ignores loop (existing D-note). MP3 → stage 2 (CZABA has no leading-silence requirement; C records the offset). Progress → stage 3 | — |
| Sticky track header covers clip content | — | Not applicable | Generic UI layering (bug fix) | M1-* |

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous, real `page.mouse` and keyboard)
**Setup per session** (one warm-up load first): demo audio as loaded, with no video unless the row says so.

**Harness rule from C-R84-L1:** a "range = window of the whole export" oracle is valid only on spans without the video's own sound, or with the video track muted. Where video sound is present, a difference of ≤ 1 LSB at 24 bit is jitter and not a fail. Report the per-span counts.

| ID | Action | Pass evidence |
|---|---|---|
| M1-HANDLE | Repeat C's `pm1b` probe: faded V (VP9 at about 2 s, fade-in 1 s) and the stems clip with a 1 s fade-in. Hover the clip, then wheel-scroll horizontally until each handle lies under the header. `elementFromPoint` there, then a real drag of +40 px | The topmost element is a header descendant for the video handle, the audio handle and a trim strip. After the drag: fade values unchanged, no new Undo entry, and **no** clip status (this also re-checks C's "status without change" observation at the same spot). Screenshots: no teal squares on the header |
| M1-SELECTED | The same with the clip selected, and with the clip unselected | Header topmost in both cases |
| M1-GHOST | Start a lane move of a clip and drag its ghost left until part of it lies under the header (screenshot), then Escape | No dashed ghost border is painted over the header region. Also check this pixel-wise: the header crop with and without the ghost differs only inside the lane area |
| M1-VISIBLE | In the visible lane area: drag a fade handle (FD-IN short), a trim strip, an envelope point (EN-DRAG short), select a clip next to a neighbour, play | Each works exactly as before; the selected ring is visible above the neighbour; the playhead line is visible over clips; the empty video lane hint sits right of the header |
| M1-ENV | Envelope point and header Mute click under the header (P-M1 sub-probes) | The header is topmost and the Mute click hits Mute (unchanged) |
| XR-DEFAULT (R20-X1) | Snap on (1 s grid). Range-drag 4→9 s on the stems body. Open Export | The range radio is checked, with the label `მონიშნული მონაკვეთი · 00:04.000 — 00:09.000 (5.000 წმ)`, and the description shows the range |
| XR-WAV (R20-X1, primary) | Export with the range scope; also export with the project scope | The range file `czaba-studio-lab-range.wav` has **240000 frames ±1** (5.000 s), 48 kHz / 24-bit / 2 ch, no NaN. Its samples equal the project export's frames [192000, 432000): max \|diff\| ≤ 1e-3 full-scale, and report the actual max (expected ≈ 0 to a few LSB). The done message is exact |
| XR-MIDSTART | Give the stems clip a fade-in that crosses the range start (for example a 2 s fade starting at the clip start 2 s, then range 3–8) and an envelope point inside the range | The range export equals the project-export window to the same tolerance (fade and envelope mid-values are correct) |
| XR-ALLTRACKS | A range drawn on the sfx lane over the same 4–9 s, and an all-lane range (Ctrl+Shift+L) | Both exports are the same Master mix as XR-WAV (within the tolerance), not one track |
| XR-PROJECT | With a range present, choose the project radio and export; then close the dialog, clear the range and export | The project file is `czaba-studio-lab.wav`, with length `ceil(projectEnd × 48000)` and the unchanged message. The range radio is disabled with the exact reason when there is no range |
| XR-PASTEND | A range from 95 s to 110 s (past the 101.352 s project end; zoom out as needed; ruler or empty-lane range) | Length = the range length; the samples after the project end are 0. If no UI path can create a range past the project end, report "not reachable" with the attempts and cite A's unit XR4. That is not a FAIL |
| XR-OVERLOAD | Master +6 dB. Range over a quiet span, then over the loud span | The warning appears only when the window itself clips. The numbers match the decoded file (pre-clamp peak and clamped count) |
| XR-KEYS | Keyboard only: Tab into the dialog, arrow between the scope radios, Enter/Space, Export | Focus never leaves the dialog. The radios are reachable and both scopes export |
| XR-X3 (R20-X3) | With and without a video clip | The video option is disabled with the unchanged reason; MP3 is disabled with "ამ ეტაპზე ხელმისაწვდომი არ არის"; the only downloads are `.wav` |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning, no non-noise console error |
| G85-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace. `/api/studio-token?…` anonymous → 401. No token/R2/download request from `/studio-lab`. The header link opens `/studio-lab` with the demo badge. Fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T85-TARGETED | A's `a-round-85/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD, 6 M + 4 ?? (or 7 M + 4 ?? with the X1 alternative), frozen 481/481, A's end hashes, protected 4/4 |

- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
- **Ableton match:** C reports it separately (confirmed / conscious difference / unconfirmed / not applicable), using §4.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutations (a)–(g) in a scratch copy, never in `store/`.

## 7. After this round
- **Round 86:** a **regression round** if round-86 planning falls on or after 2026-10-24. That is likely: one short browser check per done / c_pass item at both viewports, plus `npm run test:e2e:smoke`, and A fixes only what C finds. Otherwise **SRW-20 stage 2** (MP3).
- **Then:** SRW-20 stage 3 → the Lows batch (including C-R84-L1, SRW18-KEYBOARD-FADES and the fade-handle Lows) → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- The architecture checkpoint request (`b-round-83-checkpoint-request.md`, with the round-84 addendum) is with root and does not block this round.
