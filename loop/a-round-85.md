# A — Round 85 report: X1 (C-R84-M1 header stacking) + SRW-20 stage 1 (range export)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-22 · Task: `current-task.md` (Round 85, D-29z50)
STATUS: IMPLEMENTED — awaiting C (scope completed; no C row claimed). Code review: actual `code-reviewer` subagent → **8/10, COMMIT OK** (Critical 0, High 0, Medium 1 fixed).

## Baseline (verified before the first edit)
- HEAD `88b0262bda6bdc928bbc39c4cbca77c8a2ca9504`, `git status --short` = 0 lines.
- Frozen list `b-round-84-r85-tree-sha256.txt`: 481/481 OK.
- 7 snapshots matched their prefixes. Protected 4/4 OK.
- `:5173/studio-lab` = 200.

## Pre-flight
- **Primitives read:** AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, API_ERROR_HANDLING, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS and REACT_CONTEXT (hook reminder). Also prompts `studio-feature.md` and `new-test.md`, and skills `pre-flight` and `web-audio-api`.
- **Callers.** `renderArrangementWav` is called only by `ArrangementContext.exportWav`. `exportWav` is called only by the dialog button; tests also call it directly.
- **Frozen-test locks B's grep missed (no frozen file edited; implementation adapted instead):**
  1. The literal `applySchedule(ctx, planSchedule(arrangement, 0)` is locked in **three more frozen tests**, not only `graph.test.ts` l.388:
     - `clip-fades.test.ts` l.475 (FD8);
     - `clip-gain.test.tsx` l.498;
     - `track-pan.test.tsx` l.453.

     FD8, EV6 and track-pan also assert that the text after `export async function renderArrangementWav` contains no `pan` substring, which also rules out names like `span`.
     → The no-window branch keeps the exact old call. The window branch is a second `applySchedule(ctx, planSchedule(arrangement, renderWindow.start, renderWindow.end), { ...options, from: renderWindow.start })`. The options object is built once.
     → **The l.388 "amend" grant was not used: l.388 is unchanged.** One assertion was added right after it: `applySchedule(ctx, planSchedule(arrangement, renderWindow.start, renderWindow.end)`.
  2. `export-dialog-focus.test.tsx` l.531 (C-R14-02) asserts **exactly 4 enabled tabbable controls**: X, format radio, დახურვა, WAV. An always-enabled project radio would make that 5.
     → **A decision B did not specify: with no valid range, both scope radios are `disabled`.** The project radio stays `checked`; the range radio shows the reason. With a valid range both are enabled.
     → The scope fieldset comes **after** the format fieldset, so `enabledFormatRadio` (the first enabled radio) is unchanged.
     → Both scope radios are also disabled while rendering.
- **z-classes in the lane body and clip:**
  - header `sticky left-0 z-20` (Lane l.617);
  - drop hint `sticky left-56 z-30` (l.813);
  - library ghost and lane-move ghosts `z-30` (l.824/858);
  - range overlay `z-10` (l.940);
  - clip root `z-10` when selected;
  - fade handles `z-30` / `z-40`;
  - trim strips `z-20`.

  The height handle `z-20` (l.979) is a row child, not inside the body, and is unaffected.

## Changed files (end state 6 M + 4 ??; X1 alternative NOT used, `ArrangementClip.tsx` byte-identical `67166666`)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | X1: `'relative shrink-0'` → `'relative isolate shrink-0'` on the lane body. Nothing else. |
| `app/lib/arrangement/graph.client.ts` | E1. New `export interface ArrangementRenderWindow { start; end }`, placed before the function. `renderArrangementWav(arrangement, buffers, renderWindow?)`:<br>• length = window ? `Math.round((end − start) × 48000)` : `Math.ceil(end × 48000)`;<br>• options built once;<br>• the window branch uses `planSchedule(arrangement, start, end)` with `from: start`, `startAt 0`;<br>• otherwise the exact old call.<br>Overload/clamp/encode are unchanged, so overload is measured over the rendered window only. |
| `app/contexts/ArrangementContext.tsx` | E3:<br>• type import and `exportWav: (renderWindow?: ArrangementRenderWindow) => Promise<void>`;<br>• after the 3 unchanged guards: an invalid window (non-finite, `start < 0`, `end − start < 0.001`) → `{ phase: 'error', message: 'მონაკვეთი არასწორია — ფაილი არ შეიქმნა.' }`, with no render and no download;<br>• the renderer is called with **exactly 2 args** when there is no window and 3 with a window;<br>• filename `czaba-studio-lab-range.wav` / `czaba-studio-lab.wav`;<br>• range message `WAV შეიქმნა: მონაკვეთი {start} — {end} ({len} წმ), 24-bit · 48 kHz · stereo.` plus the master-mute suffix. |
| `app/components/arrangement/ArrangementExportDialog.tsx` | E2:<br>• `range` removed from `unavailableOptions` (MP3 stays);<br>• new fieldset with legend `მონაკვეთი` and radios `name="arrangement-export-scope"` (testids `…-scope-project` / `…-scope-range`), using the exact label texts;<br>• range normalised with `Math.min` / `Math.max`; the guard is ≥ 0.001 s, finite, start ≥ 0;<br>• scope = `scopeChoice ?? 'range'` when the range is valid, otherwise project. `scopeChoice` resets to null when the dialog closes, so each open defaults to range again;<br>• reason line `arrangement-export-scope-range-reason`;<br>• range scope changes the `ModalDescription`, the graph note (also the loop variant), the loop note, the no-sound note and the master-mute note. Project-scope texts are byte-identical (JSX whitespace checked by tests);<br>• Export calls `exportWav({ start, end })` only in range scope, otherwise `exportWav()`. |
| `app/lib/arrangement/__tests__/graph.test.ts` | +1 assertion (3 lines) after l.388. l.388 is unchanged. |
| `app/lib/arrangement/__tests__/export-range.test.ts` (new) | XR1 ×4, XR2 ×2, XR3, XR4 (8 tests). Recording fake OfflineAudioContext: constructor length, `start(when, offset, duration)`, gain set/ramp calls. A deterministic fake render sums buffer levels over the started spans, then the real overload measurement and WAV encoding run. |
| `app/lib/arrangement/__tests__/export-range-ui.test.tsx` (new) | XU1, XU2 ×3, XU3 ×3, XU4 ×2, XU5 ×2 (11 tests). Provider + dialog with an open/close host. `renderArrangementWav` mocked; anchor `click` spy captures the filenames. |
| `app/lib/arrangement/__tests__/track-header-stacking.test.tsx` (new) | X1 structural guard (4 tests). It renders `StudioWorkspace` with:<br>• an unselected faded audio clip (m1) and an unselected faded video clip (v1);<br>• a selected clip (m2), with `z-10` asserted;<br>• an enveloped clip (s1);<br>• a real cross-lane move ghost;<br>• Env mode points.<br>It asserts that each element is inside a lane body with `isolate` and no `z-*`, that the body is the next sibling of a header with `sticky left-0 z-20`, and that the header does not contain the element. **Honest label: a regression lock, not a paint or hit-test proof.** |
| `docs/.../074-studio-lab-video-opacity-fade.md` | l.4 only, exact text. |
| `docs/.../075-studio-lab-range-export-and-header-stacking.md` (new) | Georgian, TEMPLATE sections. Status `Round 85 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z50)`. Covers the stacking cause and fix, E1–E3, round vs ceil, Master-only, the stage plan, the Live differences and the frozen-test locks. |

## Tests actually run (A scope per speed rules)
- `npm run typecheck`: exit 0.
- `npm run lint`: 0 errors. 218 warnings + 1 info repo-wide, the same count as the round-84 baseline.
- Scoped `npx biome check` (no `--write`) on the 8 owned code/test files: clean. New files were formatted with `biome format --stdin-file-path` → stdout.
- Targeted vitest: `a-round-85/targeted-list.txt` has 65 files: every test that imports `graph.client`, `ArrangementExportDialog`, `ArrangementLane`, `ArrangementClip`, `StudioWorkspace` or `ArrangementContext`, or that mentions `exportWav` / `renderArrangementWav`, plus the 3 new files.
  → **65 files, 1151 tests passed (final run after the review follow-up).** Log: `a-round-85/targeted-run.log`.
  This includes the frozen `export-dialog-focus*.test.tsx`, `master-ui.test.tsx` (DONE_MESSAGE), `clip-fades.test.ts` (FD8), `clip-gain.test.tsx`, `track-pan.test.tsx`, `envelope.test.ts` (EV6) and `clip-fades-ui.test.tsx` (`z-40`).
- **Not run by A (gate rows):** full vitest, build, `npm run verify`, e2e smoke.

## Mutation proofs
Run in the scratch copy `a-round-85/mut/store` (rsync of `store/` without `.git`/`node_modules`; `node_modules` symlinked). `store/` was never mutated. Script: `a-round-85/scripts/mutate.py`. Logs and `summary.txt` are in `a-round-85/mut/`.

| ID | Mutation | Red |
|---|---|---|
| (a) | window length uses `end` instead of `end − start` | XR1 ×2, XR4 |
| (b) | `from: 0` with a window | XR1, XR2 ×2, XR4 |
| (c) | overload taken from a whole-project render | **XR3** (plus XR1 ×2, XR2 ×2, XR4, from the extra render) |
| (d) | the default is project when a range exists | XU2 ×3, XU3 (5 red) |
| (e) | the dialog passes the window in project scope | XU3 |
| (f1) | dialog 0.001 s guard → ≥ 0 | XU4 (short range) |
| (f2) | context 0.001 s guard removed | XU4 (invalid window) |
| (g) | X1 `isolate` removed | stacking guard ×4 |

## A's own Playwright smoke (1440×900, one warm-up load, integer coordinates; NOT C evidence)
Files are in `a-round-85/pw/` (`smoke.cjs`, `smoke-output.json`, screenshots). State file: `tmp/studio-real-loop/a-browse.json`.
- Setup: double-click the first library option (Middle East demo, 101.352 s) → audio clip on the `music` lane at 0. Zoom 40.0 px/s; G → `Snap ჩართულია — ბადე 1 წმ (G)`.
- Range drag on the clip body from 4 to 9 s, then open Export:
  - range radio checked and enabled;
  - label `მონიშნული მონაკვეთი · 00:04.000 — 00:09.000 (5.000 წმ)`, with the same description;
  - project label `მთელი პროექტი · 00:00.000 — 01:41.352`.
- Range export:
  - download `czaba-studio-lab-range.wav`, PCM 24-bit / 48 kHz / 2 ch, **240000 frames**;
  - message `WAV შეიქმნა: მონაკვეთი 00:04.000 — 00:09.000 (5.000 წმ), 24-bit · 48 kHz · stereo.`
- Project export (radio switched):
  - `czaba-studio-lab.wav`, 4864896 frames (= ceil(101.352 × 48000));
  - message `WAV შეიქმნა: 01:41.352, 24-bit · 48 kHz · stereo.`
- The range file equals the project frames [192000, 432000) with **max |diff| = 0 LSB**, NaN 0, and 479910 non-zero samples. There is no video, so the C-R84-L1 jitter does not apply.
- Close and reopen → range checked again.
- X1:
  - the clip was scrolled so the unselected audio fade-in handle sat at x≈397 under the header (288–512);
  - `elementFromPoint` at the handle → a header SPAN (`inHeader: true`, `inClip: false`); at clip left + 3 (trim strip) → a header INPUT;
  - a real +40 px drag there: fade-in `0.000` → `0.000`, Undo label unchanged, status unchanged (no clip status);
  - screenshot `a-r85-header-1440.png`: no teal handle on the header.
- Console: no hydration / `useLayoutEffect` warning, no non-noise error.
- Not covered by my smoke (C rows): the video handle under the header, the selected-clip variant, the ghost pixel crop, M1-VISIBLE/M1-ENV, XR-MIDSTART, XR-ALLTRACKS, XR-PASTEND, XR-OVERLOAD, XR-KEYS, XR-X3 with video, 1280×720, G85-3.

## Acceptance status (honest)
- Unit/UI rows I ran: XR1–XR4, XU1–XU5, the X1 structural guard, mutations (a)–(g), T85-TARGETED (65 files / 1151 tests) → pass.
- **No C browser row is claimed.** M1-HANDLE, M1-SELECTED, M1-GHOST, M1-VISIBLE, M1-ENV, XR-DEFAULT, XR-WAV, XR-MIDSTART, XR-ALLTRACKS, XR-PROJECT, XR-PASTEND, XR-OVERLOAD, XR-KEYS, XR-X3, REG-HYD, G85-3 and SOURCE-UNCHANGED belong to C. My smoke only suggests XR-DEFAULT, XR-WAV and the audio part of M1-HANDLE should pass.

## Known gaps / signals for B
- **Unused grant.** `graph.test.ts` l.388 was not amended, because 3 more frozen tests lock the same literal. Only one assertion was added. B's planning grep should include `clip-fades.test.ts`, `clip-gain.test.tsx` and `track-pan.test.tsx` for any future `renderArrangementWav` change.
- **Disabled project radio when there is no range.** Forced by frozen C-R14-02 (exactly 4 enabled controls). If B wants an enabled project radio, the frozen focus test must be granted and amended in a later round.
- **Range changed while the dialog is open.** The default follows the current range until the user picks a scope, which the task did not require. If the range becomes invalid while range scope is chosen, the dialog falls back to project scope (no stale window).
- **XR-PASTEND reachability.** Not tried by A. Unit XR4 covers the renderer.
- **No status line after a range drag.** In A's smoke the status still showed the Snap message after the 4→9 drag. This round did not touch the range-creation code (A did not measure the pre-change behaviour); it is noted so it is not taken for a new finding.
- **No typed Render Start/Length fields** (conscious simplification, §4). MP3 → stage 2, worker/progress/cancel → stage 3.

## Exact next C checks
1. Both viewports, warm-up load, integer pointer coordinates.
2. **Harness note:** Playwright `locator.hover()` auto-scrolls a wide clip horizontally (A's smoke saw the handle jump to x=288 before the wheel). Position with `page.mouse.move` + `wheel`, as `pm1b` does, or re-read the rects after hovering.
   M1-HANDLE / M1-SELECTED with C's `pm1b` probe: video (VP9 ≈ 2 s, fade-in 1 s) and stems clip fade-in 1 s. Check `elementFromPoint` and a +40 px drag (fade, Undo, status unchanged) for the video handle, the audio handle and a trim strip. Run once with the clip selected and once unselected.
3. M1-GHOST: lane-move ghost dragged partly under the header, with the header-crop pixel diff; then Escape.
4. M1-VISIBLE / M1-ENV: short FD-IN, trim, EN-DRAG, selected ring above the neighbour, playhead line over clips, empty-video hint right of the header; header Mute click.
5. XR-DEFAULT / XR-WAV (240000 ±1 frames, window equality ≤ 1e-3 FS; A measured 0 LSB without video).
6. XR-MIDSTART, XR-ALLTRACKS (sfx lane and Ctrl+Shift+L), XR-PROJECT (+ cleared range → disabled with reason; note that the project radio is then disabled too, by design), XR-PASTEND, XR-OVERLOAD (+6 dB), XR-KEYS, XR-X3.
7. REG-HYD, G85-3, SOURCE-UNCHANGED:
   - 6 M + 4 ??;
   - frozen 481/481;
   - protected 4/4;
   - `ArrangementClip.tsx` still `67166666`;
   - end hashes `a-round-85/end-hashes.txt`.

## Code review (actual `code-reviewer` subagent, read-only; it had no shell, so it relied on reading the files and my reported checks)
- Result: **8/10 — COMMIT OK**, with the condition that X1 is only locked structurally; behaviour = C's browser rows. Critical 0, High 0, Medium 1, Low 7.
- M1: no test for a range cleared while the dialog is open → **fixed.** New test `XU3 a range cleared while the dialog is open falls back to the whole project`: project checked, range disabled, project description, renderer called with 2 args, `czaba-studio-lab.wav`.
- L1: the reason "მონიშნე დროის მონაკვეთი…" is also shown for a visible range shorter than 1 ms → **not changed.** B fixed this exact reason for "no valid range" and XU4 locks it. B may want a separate "too short" text later.
- L2: the validity rule lives in two owners (dialog constant, context literal 0.001); the renderer does not validate → **kept** (see the Architecture note). A sub-sample window can't reach the renderer, because both guards are ≥ 0.001 s = 48 frames.
- L3: the checked + disabled project radio when there is no range → accepted by the reviewer (frozen C-R14-02; documented in doc 075).
- L4: the XU5 title claimed more than jsdom shows (a real browser tabs only to the checked radio) → **retitled** to "both scope radios are enabled in DOM order and Tab still wraps at the ends".
- L5:
  - nested parentheses in the range loop note → **fixed:** `(00:04.000 — 00:09.000, 5.000 წმ)`, test updated;
  - `00:00.000` (label) vs `0:00` (byte-locked description) → kept; B's spec defines both strings;
  - the no-sound note uses project-wide `hasSoundingClip` → kept (unchanged rule; range-specific silence detection is not in scope). Signal for B.
- L6: visual change. The playhead (`z-10`, row sibling) now paints above fade handles inside lanes, and the marquee (`z-20`) above clip children. The playhead is `pointer-events-none`, so hit-testing is unchanged. Group header rows were not checked by the reviewer → C should look at M1-VISIBLE (playhead over clips/handles) and a group row.
- L7 (unverified by the reviewer) → verified by me: Biome lint/check is clean on `export-range.test.ts` (no `noParameterProperties` error). `graph.client.ts` window call is one formatted line and passes `biome check`. The mutation logs are in `a-round-85/mut/`.
- **Architecture note (verbatim from the reviewer, for B):**
  > - **სიგნალი 2 (coupling) — export window-ის ვალიდურობის წესი ორ owner-შია.** `app/components/arrangement/ArrangementExportDialog.tsx:22,71-78` (normalise + 0.001 ზღვარი), `app/contexts/ArrangementContext.tsx:2674-2685` (მხოლოდ ზღვარი, literal), `app/lib/arrangement/graph.client.ts:441-443` (ვალიდაციის გარეშე). → **keep**: ოთხიოდე ხაზია, ქცევა არ განსხვავდება, ახალი state არ ემატება და audio timing-ს არ ეხება. Proposal planner-ისთვის (არა დამტკიცებული scope): `lib/arrangement`-ში ერთი pure helper (normalise + validate → `ArrangementRenderWindow | null`), რომელსაც დიალოგიც და `exportWav`-იც იყენებს. მიღების კრიტერიუმი: XU2/XU4 უცვლელად მწვანეა, helper-ს ცალკე unit ტესტი აქვს (შებრუნებული, NaN, Infinity, <1 ms, უარყოფითი). `useArrangement()`-ის ფორმა არ იცვლება. ღირებულება: low.
  > - **სიგნალი 3 (განმეორებითი ცვლილება) — `ArrangementExportDialog.tsx`-ს 074 და 075 ცვლის.** ახლა scope-ზე დამოკიდებული ტექსტის ხუთი ადგილია: `:196-199, 218-224, 314-321, 340, 350`. → **keep, რადგან** ყველა სტრიქონი ტესტით byte-locked-ია. ტექსტების ცხრილად გამოტანა frozen assertion-ებს შეცვლიდა და ქცევაში არაფერს მოგვცემდა. Planner-ისთვის ჩანიშნე: თუ ეტაპი 2 (MP3) კიდევ ერთ ღერძს დაამატებს (format × scope), მაშინ ღირს checkpoint.
- Reviewer's alternative-approach verdict: render-window (current) beats render-whole-then-slice (cost ∝ range length, which matters for stage 3).

## Final source state
- `git status --short`: 6 M + 4 ?? (exactly the §1 Files table, X1 primary). Frozen 481/481 OK. All owned files LF, CR = 0.
