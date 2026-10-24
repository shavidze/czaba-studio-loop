# CURRENT TASK — Round 127: VISUAL-A V-0, stage 1 — Export copy to English through the new strings module

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned from ~05:05 UTC, `date -u`)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. These rules take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md`. The relevant parts are M2 (the Studio UI is entirely in English, from one strings module, and user content is not translated) and stage V-0.
- **Previous task:** `tasks/round-126.md`, an exact copy (`cmp` OK, 24995 bytes). Rationale: `b-round-126.md`. Decision record: **D-29z92** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: clean commit `608187fdf279d9b579c279f3c536b27be74c0eea`.** Gate 126 is `skipped` (no real changes), and gate 122 is `published`. `git status --porcelain` was empty at planning.
  - Frozen list: `tmp/studio-real-loop/b-round-126-r127-tree-sha256.txt`, **913 entries**. That is every file except the 24 granted tracked files in §2. `sha256sum -c --quiet` gave OK at planning, run from `store/`.

## 0. Why this round (D-29z92)
- **DESIGN-UX-REVIEW is done.**
  - C round 126: PASS, `browserVerified`, `realVerified`, `allRowsRan` and `reviewComplete` all true. D3, D4 and D5 are done, and nothing spilled.
  - D3-A: the panel is at the documented 120 px fallback, and the SFX lane can be reached with one wheel or scrollbar action. That is friction, not a bug, and it became DUX-R-3.
  - The three new bugs, DUX-B-2/3/4, are all **Low**, so they go to `deferred_low_polish`. DUX-R-3…9 are `awaiting_user`.
- **The "Otherwise" row of the round-126 §7 applies.**
  - Regression is not due: `regression-last.json` is 2026-10-24, so the next one is due on or after 2026-10-27.
  - There is no Critical, High or Medium finding.
  - So round 127 = **V-0, stage 1**.
- **No root answer to `b-round-124-checkpoint-request.md` Q1.** B found no result file, so the recorded fallback applies:
  - one module, `app/lib/arrangement/strings.ts`;
  - plain constants plus small formatter functions;
  - one owner group per round.
- **Why Export comes first.** It is one complete feature with its own files and its own test family. C can check every state of it in the browser, and it does not touch `StudioWorkspace.tsx`.
- **The full V-0 plan (5 stages; the scope is unchanged)** is in `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92`:
  - V-0.1 Export (this round);
  - V-0.2 the remaining `ArrangementContext` status texts and their helpers;
  - V-0.3 the workspace chrome;
  - V-0.4 lanes and the detail panel;
  - V-0.5 the library, the video dock, the route, `lang="en"`, the final RV-4 scan and the RV-1 re-capture.
  - The spec estimated 2–3 rounds. The measured inventory (about 30 source files and 58 test files) needs 5.
- `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist. Nothing from ABL-R or DUX-R is scheduled.

## 1. What changes (user-visible)
| # | Now | After round 127 |
|---|---|---|
| 1 | The Export dialog is Georgian: format buttons, scope cards, notes, the Master/video lines, Cancel/Close, the progress text, the empty-project reason | All of it is English. The layout, controls, order, focus and behaviour stay the same |
| 2 | Export status and result messages are Georgian: rendering, done, error, cancelled, MP3 encoder load/timeout/failure, WAV worker failure or stall, overload warning, Master-muted suffix | English, with the same information: times, frame data, the format, "no file was created", and the reason |
| 3 | — | **User content is not translated:** sound titles, video file names and `source.audioNote` (it comes from `video.client.ts`, which is V-0.2). Download file names are unchanged |
| 4 | Every other Studio area stays Georgian | Unchanged in this round. **Mixed language outside Export is expected during V-0 and is not a finding** |

### 1.1 Fixed glossary (B, from Live 12 terms where they exist; see §6)
| Georgian | English |
|---|---|
| WAV-ის / MP3-ის / WAV + MP3 ექსპორტი (button) | `Export WAV` / `Export MP3` / `Export WAV + MP3` |
| მთელი პროექტი | `Entire project` |
| მონიშნული მონაკვეთი | `Time selection` |
| მონაკვეთი (scope legend) | `Range` |
| ფორმატი | `Format` |
| გაუქმება / დახურვა | `Cancel` / `Close` |
| მიმდინარეობს… | `Rendering…` |
| ექსპორტის პროგრესი | `Export progress` |
| შედის / გამორთულია (M/Solo) | `Included` / `Off (M/Solo)` |
| იშიფრება — დაელოდე | `Decoding — please wait` |
| წმ (unit) | `s` (e.g. `4.000 s`) |
| ფაილი არ შეიქმნა | `No file was created.` |
| ექსპორტი გაუქმდა | `Export cancelled` |
| რენდერი | `Rendering` |
| გადატვირთვა | `Overload` |
| ვიდეო (აუდიოთი) | `Video (with audio)` |
| დადუმებულია / სიჩუმე | `muted` / `silence` |

- These stay as they are: time formats (`00:00.000`, `0:00`), `·`, `—`, `WAV`, `MP3`, `LAME (ffmpeg.wasm)`, `24-bit · 48 kHz · stereo`, `dBFS`, `M/Solo`, `Loop`, `Master`, `CDN`, `~31 MB`, `120`/`30` seconds.
- A translates every other sentence **faithfully**: the same facts, no new claims, nothing dropped. Plain, short English in sentence case.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | **new**. Contains `studioExportStrings` only (R1) |
| `app/components/arrangement/ArrangementExportDialog.tsx` | Every Georgian UI string → module reference (R2). No class, structure, order, `id`, `data-testid` or handler change |
| `app/lib/arrangement/export-progress.ts` | The 4 progress texts (l.76–82) → module formatters |
| `app/lib/arrangement/export-cancel.ts` | The 2 constants keep their exported names; their values come from the module |
| `app/lib/arrangement/export-wav.client.ts` | `ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE` and `ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE` (l.8–13) keep their names; their values come from the module. The stall text is `studioExportStrings.wavWorkerStalled(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS / 1000)`, called here, so the `30` is no longer written twice (this closes GATE103-S2 at little cost, because the line is already owned) |
| `app/lib/arrangement/graph.client.ts` | **Narrow:** only the return text of `formatExportOverloadWarning` (l.405–413), the empty-project `Error` text (l.460) and one import line |
| `app/contexts/ArrangementContext.tsx` | **Narrow:** `MASTER_MUTED_EXPORT_SUFFIX` (l.204), and the string literals inside the bodies of `exportWav` (l.3021–3098) and `exportMp3` (l.3099–3308), plus one import line. No other line. In particular: l.186 Web Audio, l.3391 load error, and every other status text stay as they are (V-0.2) |
| 18 tests in `app/lib/arrangement/__tests__/` | **Literal → module reference only** (R3): `export-cancel-ui`, `export-cancel`, `export-dialog-a11y-copy`, `export-dialog-focus-restore`, `export-dialog-focus`, `export-dialog-footer`, `export-dialog-hold-enter`, `export-dialog-tab-stops`, `export-mp3`, `export-progress-ui`, `export-progress`, `export-range-ui`, `export-toolbar-hold-enter`, `export-wav`; `master-ui` (**export lines only**, l.258/530/565/659/661/673 and their uses); `master` (overload lines l.247/266/272 only); `meter-ui` (**l.571 only**; the l.278 meter `OVER_SUFFIX` is V-0.4); `video-fades-ui` (the export note lines l.111/113 and the export dialog `დახურვა` at l.518 only) |
| `app/lib/arrangement/__tests__/strings.test.ts` | **new**: ST1–ST5 (§3.2) |
| `docs/implementation/2026/quarter-IV/104-studio-v0-export-strings.md` | **new** implementation doc: the TEMPLATE.md sections in Georgian, plus the full Georgian → English map (R5) |

- **Pre-edit greps (A repeats them and records the results):**
  - **Needle grep.** For each Georgian literal you replace, grep `app/**/__tests__/**` and `e2e/**`. B's fragment grep found stage-1 text only in the 18 files above. Short generic words such as `გამორთულია`, `მონაკვეთი` or `შეიქმნა` also appear in other tests, but those belong to other strings.
  - **e2e/smoke.** B found no Georgian in `e2e/`.
  - **Stop rule:** if a stage-1 literal is asserted in a test outside the list, or a replacement needs a frozen file, **stop and report**. Do not edit; B rules.
- **Expected end state:**
  - ` M` for the granted tracked files you actually changed;
  - `??` for the 3 new files;
  - nothing else.
  - `sha256sum -c --quiet b-round-126-r127-tree-sha256.txt` is OK at the start and at the end.
- **Protected (unchanged; `git diff 608187f` on them is empty):**
  - `app/routes/studio.$productId.tsx` `fa2cf0bc`
  - `app/routes/api.studio-token.ts` `13914809`
  - `app/lib/auth.ts` `56f5b76f`
  - `app/contexts/AuthContext.tsx` `bf9ee257`
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check` (`--write`), `npm run format`.
- **Edit rule (C-R120-01):** every lasting edit uses the Edit or Write tool, including formatting fixes. Shell replaces are allowed only for temporary mutations, which are restored and checked by sha256. List every shell write in the report.
- **Before editing, read:**
  - `.claude/primitives-map.json`;
  - `AGENT_DISCOVERABLE_CODE.md` (new exports);
  - `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md` (owned component, context and export files);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` casts (also no `as const`), semicolons, no code comments, Tailwind tokens only.

## 3. A — rules and tests

### 3.1 Rules (D-29z92)
- **R1 — the module contract. Later stages extend it, so do not deviate.**
  - **Path and object:** `app/lib/arrangement/strings.ts` exports **one object, `studioExportStrings`**. Later stages add sibling objects (`studioStatusStrings`, `studioToolbarStrings`, …) to the same file.
  - **Values:** every property is either a plain English string or a small pure formatter function that returns a string (for example `rangeOption(label)`, `rangeSeconds(seconds)`, `overloadWarning({ peakDb, clippedSamples })`, `wavDone(...)`, `progressRendering(percent)`).
    - Use a named-params object when a formatter takes 3 or more values of the same type.
    - Formatters take already-computed values (see the leaf rule below). They do not compute audio data.
  - **`strings.ts` is a leaf module.** It imports nothing from `~/lib/arrangement`, `~/contexts` or `~/components`. Formatters take already-formatted values: the caller passes `formatArrangementTime(…)` or `formatMasterGainDb(…)` results and the seconds number. This avoids import cycles; for example, `export-wav.client.ts` imports the module while it owns the timeout constant. Later stages keep this rule.
  - **Not allowed:** React nodes, a locale switch, language state or context, type assertions, and `export *` barrels.
  - **Names:** follow `AGENT_DISCOVERABLE_CODE.md` (2–3 words, one domain term).
  - **Existing exported constants keep their names** and are defined from the module: `ARRANGEMENT_EXPORT_CANCELLED_MESSAGE`, `ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE`, `ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE` and `ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE`. Their importers do not change.
- **R2 — copy only, no behaviour change.**
  - The text a user sees or hears changes. Nothing else changes: element types, order, `id`/`aria-*` wiring, `data-testid`, classes, disabled rules, focus and Tab logic, timers, the export pipeline, file names and frame output.
  - JSX text that mixes values (for example `Master: {gain} — …`) becomes a formatter call, or a module string around the same `{value}`. The rendered text node structure may change only where that is needed. Tests that read `textContent` must still pass.
- **R3 — tests.**
  - In the 18 granted tests, each changed line only swaps a Georgian literal (or a regex built from one) for the module value, or for a formatter called with the same inputs. Imports may be added.
  - **Assertion strength stays the same:** `toBe` stays `toBe`, an exact `getByText`/`getByRole` name stays exact, and a regex substring check stays a substring of the same part.
  - No `it`/`describe` is added, removed, skipped or renamed, **except** the test titles that quote a Georgian label, such as TH1 in `export-toolbar-hold-enter` ("closing from დახურვა"). Their title text may change to the English label.
  - The `it` count per file is unchanged. Report the counts before and after.
- **R4 — the only place for English literals in tests is `strings.test.ts`.** It pins each value exactly, so a wrong formatter cannot pass by being compared with itself.
- **R5 — doc 104** contains the full map: key | old Georgian | new English | where it shows. C and Saba review the meaning from it.

### 3.2 New test file `strings.test.ts`
| ID | Asserts |
|---|---|
| ST1 | **Exact literals.** Every plain-string property of `studioExportStrings` equals its English literal (`toBe`), one assertion per property. The glossary terms of §1.1 are among them |
| ST2 | **Formatters, exact.** Each formatter returns the exact expected English for at least two inputs. Required cases:<br>• the overload warning for the three `master.test.ts` cases (+0.8 dBFS / 3 samples, +1.6 / 2, +0.0 / 1);<br>• `rangeSeconds(4)` → `'4.000 s'`;<br>• the four progress texts at 0 % and 57 %;<br>• the WAV done message with and without the Master-muted suffix;<br>• `wavWorkerStalled(30)` equals its exact English literal |
| ST3 | **No Georgian anywhere in the module.** Walk `studioExportStrings`: each string, and each formatter's output on sample inputs, contains no codepoint U+10A0–U+10FF |
| ST4 | **Source scan (the V-0 guard; later stages extend its list).** Read these files with `readFileSync`, which is an existing test pattern, and strip `//` and `/* */` comments:<br>• `ArrangementExportDialog.tsx`, `export-progress.ts`, `export-cancel.ts`, `export-wav.client.ts`, `graph.client.ts` (whole files);<br>• the `ArrangementContext.tsx` text from `const exportWav = useCallback(` up to `const cancelExport = useCallback(`, and the `MASTER_MUTED_EXPORT_SUFFIX` line.<br>None of it contains a Georgian codepoint. If a marker string is not found, the test fails (no silent pass) |
| ST5 | **Existing constants alias the module.** `ARRANGEMENT_EXPORT_CANCELLED_MESSAGE`, `ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE` and `ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE` each `toBe` their module value. `ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE` `toBe(studioExportStrings.wavWorkerStalled(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS / 1000))` |

### 3.3 Mutations
A runs each one, and each must turn the named test red. After each one, A restores the file and checks the restore by sha256.
- **m1:** put one Georgian dialog string back (for example the `Cancel` label) → ST4 red, and the dialog tests that query `Cancel` red.
- **m2:** swap two arguments of the range-label or overload formatter → ST2 red.
- **m3:** change one module value (for example `Close` → `Closee`) → ST1 red. The UI tests stay green, because they read the module, which proves where the literals are pinned.
- **m4:** put the Georgian empty-project `Error` text back in `graph.client.ts` → ST4 red.

## 4. A — checks (speed rules)
- Run `npm run typecheck` and `npm run lint`, plus a read-only `npx biome check` on every changed or new file.
- Run `npx vitest run` on `strings` and the 18 granted tests, plus these neighbours: `export-range`, `export-wav-in-place`, `mp3-encoder`, `graph`, `meter`, `clip-fades-ui`, `render-budget`, `status-announcement-ui`, `ArrangementContext`.
  - Every file that exists must be green.
  - Report the counts and the per-file `it` counts before and after.
- No full suite and no `npm run verify`: the gate runs them.
- **The code-reviewer is required** (more than 3 files). Pass its Architecture note to B.
- **Report `a-round-127.md`:**
  - the start HEAD and frozen OK;
  - the pre-edit grep results;
  - the diff summary per file;
  - the map location (doc 104);
  - the test counts;
  - m1–m4;
  - the typecheck and lint results;
  - the reviewer verdict and Architecture note;
  - every shell write;
  - frozen OK at the end and the end `git status`;
  - any deviations.
- **A stops and reports (no edit; B rules) if:**
  - a test outside §2 turns red or asserts a stage-1 literal;
  - a string cannot be moved without changing structure or behaviour;
  - a needed change touches a frozen file or a non-granted line.

## 5. C — rows
- Use real Playwright Chromium, a fresh context per session, at **1440×900 and 1280×720**, on `http://127.0.0.1:5173/studio-lab`.
- **Fixtures:** the round-125 S0/S1/S2 states and the `S1setup` steps in `c-round-125/out/bbox-baseline-1440.json`. Media comes from `tmp/studio-real-loop/media/`.
- **Harness rules:**
  - ENV-FIRST-LOAD: discard a crashed first load once and record it under `invalidRuns`.
  - Every run writes a uniquely named file (C-R125-HARNESS-OVERWRITE).
  - Open every screenshot with the Read tool and describe it.
  - At most 2 replacement attempts per row, and only for environment-invalid runs.
- **Georgian count** = the codepoints U+10A0–U+10FF in the dialog's `innerText` plus its `aria-label`/`title`/`aria-valuetext` attributes, **minus** user content: sound titles, the video file name, and the `source.audioNote` text from `video.client.ts`. List what was subtracted.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T127-TARGETED** | A's §4 vitest list | Green, with A's counts |
| **AN-REVIEW** | `git diff 608187f` on the granted files; read `strings.ts`, `strings.test.ts` and doc 104 | Only the §2 lines changed. The `graph.client.ts` and `ArrangementContext.tsx` hunks lie inside the narrow ranges (an added import line shifts the later line numbers by +1; that is expected). `strings.ts` has no import from `~/lib/arrangement`, `~/contexts` or `~/components` (R1 leaf rule). Test hunks are literal → module only, with unchanged `it` counts and matcher strength (sample at least 10 hunks across 6 files, and list them). The ST1–ST5 literals match §1.1. **Meaning check:** read the doc 104 map row by row and flag any English that drops or adds a fact, as a finding with its row id. List every shell write A reports |
| **SOURCE-SCOPE** | `git status`, `sha256sum -c --quiet b-round-126-r127-tree-sha256.txt` (from `store/`), protected hashes | The §2 end state exactly, the frozen list OK, the protected hashes unchanged |
| **EX-EN-IDLE** (both) | Open Export from S1 (no time selection) and from S2 (with a time selection); dump the text; screenshot | Georgian count **0** in the dialog in both states. The format buttons, scope cards, notes, Master line and Close are English and use the §1.1 terms. The disabled time-selection card shows its English hint |
| **EX-EN-RUN** (1440, also 1280 for WAV) | WAV export of the whole project; read the progress text during the render, then the done message and the overload alert. A WAV render takes about 0.9 s (C-R89-HARNESS-5M-SHORT), so sample the progress text with the HR-PHASE / 10M-recipe fallback. The MP3 encode phase in EX-EN-MP3 is the primary place to read the progress text | Progress like `Rendering · n%` / WAV write, in English. Done message in English with the length and `24-bit · 48 kHz · stereo`. The overload alert (the default demo peaks +1.7 dBFS) is in English with its numbers. Georgian count 0. **Behaviour unchanged:** the downloaded WAV has the round-125 frames (project 7217877 at the S fixture, or the same frames as a same-session baseline export, which C records), 48 kHz / 24-bit / 2 ch, and the same file name pattern |
| **EX-EN-RANGE** (1440) | Range 4.000 s, WAV | The scope text says `Time selection · …` and `4.000 s`. The file is 192000 frames |
| **EX-EN-MP3** (1440) | MP3, then WAV + MP3 | Encoder load, encode, done, and the "two files" notes are all English. If the CDN is not reachable, the **English** load-failure message ("No file was created.") is the PASS evidence, labelled as such |
| **EX-EN-CANCEL** (1440) | Start a WAV (or MP3) render, then Cancel | The `Export cancelled — No file was created.`-type message is English, no download happens, and focus follows the round-90 rules (as before) |
| **EX-EN-MUTE** (1440) | Master mute, open Export, export WAV | The muted note in the dialog and the done suffix are English |
| **EX-EN-EMPTY** (1280) | Delete every clip, open Export | The disabled reason is English, and the export button is disabled as before |
| **EX-EN-VIDEO** (1440) | Video clip with a fade (round-84 setup), open Export | The video option text and the video-fade note are English. The video sound line shows `Included` / `Off (M/Solo)` / `Decoding — please wait` as reachable, and the name is unchanged |
| **EX-LAYOUT** (both) | bbox of every dialog control vs the frozen `c-round-125/out/bbox-baseline-*.json` S2 state; also S0/S1 outside the dialog | **S0/S1 outside the dialog: every box identical within 1 px.** Inside the dialog, apply the RV-1 V-0 rule (`backlog.json` `v0_plan_d29z92.rv1_rule_v0`): every delta over 1 px is attributed to a changed text node or its container. There is no new `scrollWidth > clientWidth` on any control, the footer buttons stay on one row, and at 1280 the range card's footer overlap is recorded and compared with F-2 (13 px / 45 px). An unexplained delta is a finding |
| **EX-KEYS** (1440, neighbours) | In the dialog: the Tab stop count and order, Escape, hold-Enter on Export, focus return to the toolbar Export button | Identical to the baseline behaviour (the round-125/126 numbers or a same-session pre-check). Accessible names are now English |
| **G127-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | The workspace and the demo badge show. The product route shows "Sign in required", with no workspace and 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G127-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror`. The known cloud noise is not reported |

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:** any behaviour change (export output, disabled rules, focus or Tab, timers); a weakened, removed or skipped test; Georgian UI copy left in the Export area; an English text that drops a fact the user needs (for example "no file was created" or the reason).
  - **Low:** wording or style; a small overflow that hides no content.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| The export command's name | Live 12 Reference Manual ch. 42 "Keyboard Shortcuts", B capture `b-round-71/ableton-shortcuts-20261021.txt` (2026-10-21; text re-read 2026-10-24) | **Confirmed** term: "Export Audio/Video Ctrl Shift R" | The toolbar keeps `Export`; the dialog buttons say `Export WAV` / `Export MP3` (no new shortcut) | EX-EN-IDLE |
| "Time selection" as the term for a selected time range | Live 12 manual ch. 6 "Arrangement View", B capture `b-round-71/ableton-arrangement-view-20261021.txt` | **Confirmed** term: "…at the start of the time selection", "Zoom to Arrangement Time Selection" | The scope card says `Time selection` | EX-EN-RANGE |
| Export behaviour, layout and options | — | **არ ეხება** (not applicable): copy only, behaviour unchanged | — | EX-KEYS, EX-EN-RUN |

- C rates "CZABA requirement met" and "Ableton correspondence" separately. The two confirmed rows are terminology matches only.

## 7. Evidence and reporting
- **C writes** `c-round-127.md` and `c-round-127.json` as it goes. The JSON has `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (per row and viewport) and `notesForB`.
- Evidence goes under `c-round-127/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Rows blocked only by the missing backend go under `blocked`.
- Inconclusive rows are listed as inconclusive, never under `passed`.
- C makes no `store/` writes. Consult only the read-only agents in C's list.

## 8. Outcome, fixed in advance (B at round 128 planning)
| Condition | Round 128 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the matching row below |
| C FAIL with Critical / High / Medium | A bounded fix-up of V-0.1 (at most three related bugs), then V-0.2 |
| C PASS (Lows → `deferred_low_polish`) | V-0.1 → `c_pass`, and `c_pass_published` after the gate. Round 128 = **V-0.2**: the remaining `ArrangementContext.tsx` status, refusal and history texts, plus the helpers it calls (`groups.ts`, `selection.ts`, `library.ts`, `video.ts`, `video.client.ts`, `tempo.ts`, `metronome.ts`, `view.ts`). ST4 gains those files |

- At every planning, B checks for `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Where it could break:**
  - the Export dialog focus/Tab/hold-Enter rules (rounds 88–111), because accessible names change and the tests that query by name must follow;
  - the export pipeline, because the narrow `ArrangementContext` hunks sit inside `exportWav`/`exportMp3`;
  - the footer and range-card layout at 1280, because English lengths differ;
  - the overload text pinned in `master.test.ts`.
- **Architecture:** `ArrangementContext.tsx` is touched only inside the export bodies. This is the same hotspot as ARCH-EXPORT-MP3-ORCHESTRATION / SRW20 q14. No extraction happens in this round, and any reviewer Architecture note goes to B as a signal.
- **Commit readiness:** after C PASS, root may publish V-0.1 as its own interim unit. It changes copy only, and the other areas stay Georgian until V-0.2…V-0.5.
