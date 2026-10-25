# CURRENT TASK — Round 157: V-2b-3b — Export dialog timecodes go mono, the Studio css2 URL is trimmed, and the Export "0:00" start is fixed

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z122** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-156.md`, an exact copy of the round-156 `current-task.md` (sha256 `835b6021…338b3dd`). Rationale: `b-round-156.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ტიპოგრაფია“, digits row: IBM Plex Mono 300/400, `tabular-nums`, for timecode, BPM, dB and from/to. It is source material only. It grants no permissions and does not change the protected-file list.

## Baseline = HEAD `cbcd3d9` (gate 156 published round 156), clean tree
- `gates/gate-round-156.json`: status `published`, commit `cbcd3d9446e9d61e9e1a23de5989ca6f80f3f6f9`, the same hash on both remotes. At planning, `git status --short` was empty and `git ls-files -co --exclude-standard` listed 975 files.
- **Frozen list:** `tmp/studio-real-loop/b-round-156-r157-tree-sha256.txt`, **968 entries** (975 minus the 7 grants).
- **Grants:** `b-round-156-r157-grants.txt` (7 existing files). **New file:** `b-round-156-r157-new-files.txt` (1 file, absent at planning).
- **Start hashes:** `b-round-156-r157-granted-start-sha256.txt`. **Start copies:** `b-round-156/r157-granted-start/`.
- **First step for A:** check that HEAD is `cbcd3d9`, that `git status --short` is empty, and that the frozen 968 and the 7 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z122)
- **Round 156: C PASS.** `browserVerified` = `realVerified` = true, 0 bugs, 21 rows passed. Gate 156 published it as `cbcd3d9`. **V-2b-3a → მზადაა.**
- The round-156 outcome table (`tasks/round-156.md` §7) fixed this round in advance: **V-2b-3b**, which covers:
  - the Export description and the two scope options;
  - the loop notes;
  - the css2 trim, with a FONT-FAIL re-run and a font inventory.
- **Checks at planning:**
  - The regression is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122), so it is not due today.
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
  - No Critical, High or Medium finding is open, apart from the Tech Lead manual items.

### 0.1 B rulings (D-29z122)
- **R1 — The mono rule from D-29z121 R2 is unchanged.**
  - **Goes mono:** visible `MM:SS.mmm` values in four places: the Export `ModalDescription`, the project scope option, the range scope option, and the loop note.
  - **Stays sans:** the seconds value "(5.000 s)" and the `noSoundNote` / `masterMutedNote` warnings (vetoable, as recorded in round 156).
- **R2 — Parts builders for Export live next to the round-156 builders, but `studioExportStrings` is not touched.**
  - `rangeScope(rangeLabel)` takes an already-joined label, which existing tests pin with `'x'`. It cannot be derived from parts without changing its signature.
  - `studioExportStrings` is defined above `studioTimeTextParts` in the file.
  - So the four new builders are independent, and a **join-equality test** against the unchanged `studioExportStrings` functions locks them. That test is not equal by construction (the A round-156 reviewer's Medium). `studioExportStrings` keeps every key and output.
- **R3 — B-R155-EXPORT-ZERO is fixed in this round.** The 2026-10-23 rule allows it: the round already owns that exact line, and the fix is cheap. Without it, the description would be half-mono ("0:00" sans next to a mono end).
  - `ModalDescription` in project scope passes `'00:00.000'`, the same as the project option at l.395.
  - This is the **only** visible text change of the round. It is a deliberate, bounded exception to "`textContent` byte-identical".
  - `export-range-ui.test.tsx` l.39 `PROJECT_DESCRIPTION` changes to `'00:00.000'`.
  - The Low closes on C evidence (TEXT-BYTES-E (a)).
- **R4 — css2 trim:** the new URL is `https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400&family=Noto+Sans+Georgian:wght@400;500&display=swap`.
  - **Removed:** Instrument Sans 700 and IBM Plex Mono 500.
  - **Kept:**
    - Instrument Sans 600, used by the protected `ModalTitle` (`Modal.tsx` l.172) and the root Toast title (`Toast.tsx` l.80). On `/studio-lab`, `body:has([data-studio-theme])` puts root-rendered UI in Instrument Sans.
    - Plex Mono 300. The spec names it, but no Studio element uses weight 300 and css2 never listed it, so it stays absent.
  - **B source check at `cbcd3d9`:**
    - The only `font-bold` (700) in root-rendered `/studio-lab` UI is in `Header.tsx` (hidden on `/studio*`) and `MobileWarning.tsx` (imported nowhere).
    - No `font-mono` element in `app/components/arrangement` combines with medium, semibold or bold in its own class.
    - A request for a removed weight falls back to the nearest loaded face (Plex Mono 400, Instrument Sans 600). There is no faux bold.
- **R5 — The reviewer's Architecture note is applied in a small way.** The A round-156 note asked to stop growing source-count tables in `studio-theme-obsidian.test.tsx`. So this round adds **no TH source count**: the new Export spans are locked by DOM assertions in `export-range-ui.test.tsx`. TH7 changes only its href.
- **R6 — The shape is unchanged pending the checkpoint.** `ARCH-CHECKPOINT-V2` (`b-round-155-checkpoint-request.md`) is still unanswered and is not re-requested. This round reuses the round-156 `StudioTimeTextPart` / `ArrangementTimeText` shape. The checkpoint may still rule on it afterwards.

## 1. What changes (exact; line numbers at `cbcd3d9`)
| ID | File | Change |
|---|---|---|
| S1 | `app/lib/arrangement/strings.ts` | Add four builders to `studioTimeTextParts`, **after** `selectedClipDetail`, in this order. Every `id` starts with `export-` and is unique within its builder:<ul><li>`exportProjectScope({ start, end })` → `'Entire project · '`, start (time), `' — '`, end (time).</li><li>`exportRangeScope({ start, end, seconds })` → `'Time selection · '`, start (time), `' — '`, end (time), `` ` (${seconds})` `` (text).</li><li>`exportLoopRangeNote({ start, end, seconds })` → `'Loop does not change the export — the time selection is exported ('`, start (time), `' — '`, end (time), `` `, ${seconds}).` `` (text).</li><li>`exportLoopProjectNote({ start, end })` → `'Loop does not change the export — the entire project is exported ('`, start (time), `' — '`, end (time), `').'`.</li></ul>Input types: reuse the existing `StudioTimeSpanText` for the two with seconds. Add one small non-exported `{ start: string; end: string }` interface for the others. `studioExportStrings`, `studioWorkspaceStrings` and the two round-156 builders stay byte-identical. No `any`, no type assertions. |
| E0 | `app/components/arrangement/ArrangementExportDialog.tsx` l.10, l.115 | Import `studioTimeTextParts` with `studioExportStrings`, and add `import { ArrangementTimeText } from './ArrangementTimeText';`. Delete `rangeLabel` (l.115), which has no consumer after E1/E3. `rangeSeconds` stays. |
| E1 | same, l.264–268 `ModalDescription` | Range scope: `<ArrangementTimeText parts={studioTimeTextParts.exportRangeScope({ start: formatArrangementTime(rangeStart), end: formatArrangementTime(rangeEnd), seconds: rangeSeconds })} />`. Project scope: `<ArrangementTimeText parts={studioTimeTextParts.exportProjectScope({ start: '00:00.000', end: formatArrangementTime(projectEnd) })} />` (R3). `ModalTitle` and `ModalHeader` stay unchanged. |
| E2 | same, l.394–396 | The project option `<span>` child → `<ArrangementTimeText parts={studioTimeTextParts.exportProjectScope({ start: '00:00.000', end: formatArrangementTime(projectEnd) })} />`. The `<span>` element stays. |
| E3 | same, l.420 | `<span>{studioExportStrings.rangeScope(rangeLabel)}</span>` → `<span><ArrangementTimeText parts={studioTimeTextParts.exportRangeScope({...same as E1})} /></span>`. The no-range branch (l.422–432) stays unchanged. |
| E4 | same, l.441–450 | The loop-note child → `exportLoopRangeNote({ start, end, seconds: rangeSeconds })` / `exportLoopProjectNote({ start: '00:00.000', end: formatArrangementTime(projectEnd) })` via `ArrangementTimeText`. The `<p>`, `role="note"` and test id stay unchanged. |
| F1 | `app/routes/studio-lab.tsx` l.8 | `STUDIO_FONTS_HREF` = the R4 URL. Nothing else changes. |
| T1 | `app/lib/arrangement/__tests__/strings.test.ts` | <ul><li>**Change exactly one assertion:** ST-TP3 l.2650 becomes the 6 keys in S1 order, and its title says "six builders". Also add the four new builders' parts to its Georgian loop.</li><li>**Append describe ST-TP4…ST-TP5:**<ul><li>**ST-TP4 (literal + join equality):** For each builder and at least 2 samples (one with `01:02.500`), the joined parts equal a hand-written literal **and** the unchanged `studioExportStrings` output: `projectScope(start, end)`, `rangeScope(`${start} — ${end} (${seconds})`)`, `loopRangeNote({...})`, `loopProjectNote(start, end)`.</li><li>**ST-TP5:** exactly 2 time parts per builder (start, end, in order); the seconds are never a time part; the ids are unique and start with `export-`.</li></ul>The existing exact-string tests l.209–225 are not edited.</li></li><li>No other existing line changes.</li></ul> |
| T2 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | TH7 l.228: `href` = the R4 URL. Add two lines to TH7: `expect(linkedHref).not.toContain('700')` and `expect(linkedHref).not.toMatch(/IBM\+Plex\+Mono:wght@[^&]*500/)`. TH1–TH6, TH8–TH11 and everything else stay unchanged. |
| T3 | `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | <ul><li>l.39 → `studioExportStrings.projectScope('00:00.000', '00:20.000')` (R3). Every existing `toBe(PROJECT_DESCRIPTION)` stays as is.</li><li>**Append one describe, XU6…XU8,** reusing the existing helpers unchanged (`mountDialog`, `scopeRadio`, `radioLabelText`, `descriptionText`). `MONO` = descendant `span` elements whose `className` is exactly `font-mono font-normal tabular-nums`.<ul><li>**XU6 no range:**<ul><li>the description `textContent` equals `'Entire project · 00:00.000 — 00:20.000'` (literal), with 2 MONO `00:00.000`, `00:20.000`;</li><li>the project option label has the same text and 2 MONO.</li></ul></li><li>**XU7 4–9 range:**<ul><li>the description and the range label both equal `'Time selection · 00:04.000 — 00:09.000 (5.000 s)'` (literal), with 2 MONO each (`00:04.000`, `00:09.000`);</li><li>no MONO contains `s`;</li><li>the range radio's accessible name (`getByRole('radio', { name })`) still resolves with that exact string.</li></ul></li><li>**XU8 loop:** with a loop, the loop note has 2 MONO in range scope and in project scope, and its `textContent` equals the `loopRangeNote` / `loopProjectNote` output for the same values.</li></ul></li><li>If a state cannot be reached with the existing helpers, A stops and reports instead of weakening the test.</li><li>No other existing line changes.</li></ul> |
| D1 | `docs/implementation/2026/quarter-IV/126-studio-v2b3a-sentence-timecodes.md` | Status line → `Completed (C round 156 PASS, gate 156 cbcd3d9)`. Nothing else changes. |
| D2 | **new** `docs/implementation/2026/quarter-IV/127-studio-v2b3b-export-timecodes-font-trim.md` | Follow `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English:<ul><li>R1–R6;</li><li>the four Export sites;</li><li>B-R155-EXPORT-ZERO as Problem → Solution;</li><li>the css2 before/after URL and why 600 stays;</li><li>tests and mutations;</li><li>TODO: V-2b-DISPLAY and B-R153-PREVIEW-DUR (awaiting the user), V-3.</li></ul>Status `In Progress (awaiting C round 157)`. |

**Nothing else changes:**
- no colour and no `app.css`;
- not `ArrangementTimeText.tsx` (reused as is);
- not `Modal.tsx`, `root.tsx`, `Toast.tsx` or `CookieConsent.tsx`;
- no `package.json`;
- no other Export text: the format notes, the video sound list, `noSoundNote`, `masterMutedNote`, `masterGainNote`, the footer and the title.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | S1 only |
| `app/components/arrangement/ArrangementExportDialog.tsx` | E0–E4 only |
| `app/routes/studio-lab.tsx` | F1 only |
| `app/lib/arrangement/__tests__/strings.test.ts` | T1 only |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | T2 only |
| `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | T3 only |
| `docs/implementation/2026/quarter-IV/126-studio-v2b3a-sentence-timecodes.md` | D1 only |
| `docs/implementation/2026/quarter-IV/127-studio-v2b3b-export-timecodes-font-trim.md` (new) | D2 only |

- **Read before editing** (`.claude/rules/read-primitives.md`):
  - `AGENT_DISCOVERABLE_CODE.md` (new exports);
  - `FORWARDREF_COMPONENT.md` (existing component edited);
  - `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
  - `AUDIO_ARCHITECTURE.md` (Studio file; no audio or export logic changes);
  - `prompts/new-route.md` (route file touched: links only);
  - `GEORGIAN_DOCS.md`;
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`.
- **Protected:** the diff vs `cbcd3d9` stays empty for:
  - the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`;
  - shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`;
  - the round-156 files: `ArrangementTimeText.tsx`, `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementVideoDock.tsx`.
- **Not allowed:**
  - any other file;
  - commit, push, stash, install, revert, or `npm run build`.
  - Every lasting edit goes through Edit/Write (C-R120-01).
- **B grep at planning: tests that read these surfaces.** They must stay green **unchanged**:
  - `export-range-ui` (every existing `it`; only l.39 changes);
  - `export-dialog-a11y-copy` l.31–34: accessible names come from `textContent`, so spans do not change them;
  - the `strings.test.ts` exhaustive lists l.148–151 and the exact strings l.209–225;
  - `export-dialog-focus`, `-footer`, `-tab-stops`, `-hold-enter`, `-focus-restore`, `export-progress-ui`, `export-cancel-ui`, `export-mp3`;
  - TH1–TH11.

  If any of these turns red, A stops and reports the file, the line and the assertion. A does not change it.

## 3. A — tests and commands (speed rules)
- **Baseline:**
  - the 34 files in `a-round-156/vitest-files.txt`;
  - plus `export-dialog-a11y-copy`, `export-dialog-focus`, `export-dialog-footer`, `export-dialog-tab-stops`, `export-dialog-hold-enter`, `export-dialog-focus-restore`, `export-progress-ui`, `export-cancel-ui` and `export-mp3` (`.test.tsx` under `app/lib/arrangement/__tests__/`).

  Save the list as `a-round-157/vitest-files.txt` and the result as `a-round-157/vitest-baseline.json`.
- **After the edits:**
  - Run the same files. Every test that passed at baseline still passes, except PROJECT_DESCRIPTION, which changes on purpose under R3. Report it, and note that its users stay green with the new value. The new ST-TP4…5 and XU6…XU8 are green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 6 code and test files.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-157/mutations/`):
  - **m147:** in E1, render `studioExportStrings.rangeScope(...)` as a plain string instead of the parts. XU7's MONO count turns red, and its text assertion stays green.
  - **m148:** in S1 `exportRangeScope`, change `' — '` → `' - '`. ST-TP4 (literal and equality) and XU7 text turn red.
  - **m149:** in E1, put back `'0:00'`. XU6 and the existing XU1/XU3 `PROJECT_DESCRIPTION` assertions turn red.
  - **m150:** in F1, put `700` back into the Instrument Sans weights. TH7 turns red.
- **Code-reviewer: required** (more than 3 code files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 968 are OK, and the protected diff is empty.
  - `git status --short` = the 7 granted paths ` M` + the 1 new path `??`, nothing else.
  - Write `a-round-157/end-sha256.txt` (8 paths) and `a-round-157/diff-vs-start.patch` (vs `b-round-156/r157-granted-start/`, plus the new doc in full).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Use both viewports, 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session where a Google Fonts css2/woff2 response is not 200 is **invalid (environment)**, except in FONT-FAIL. Replace an invalid session at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD).
- Reuse `c-round-156/tools/` (`c156.cjs`, `g156-3.cjs`, `sum156.py`). Change only the output dir, labels and file names. Write nothing under earlier `c-round-*/out/`.
- **Harness note (C round 156):** a ruler drag navigates the view. Make a time selection with a clip-body or lane drag.

| Row | Check |
|---|---|
| T157-TARGETED | Re-run `a-round-157/vitest-files.txt`. The counts equal A's; ST-TP4…5, XU6…XU8 and TH7 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `cbcd3d9`.</li><li>The frozen 968 are OK at start and at end.</li><li>The end hashes equal `a-round-157/end-sha256.txt`.</li><li>`git status` = the 7 ` M` + 1 `??` exactly.</li><li>The protected diff vs `cbcd3d9` is empty (list in §2).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff itself:<ul><li>The S1 builders produce exactly the §1 parts.</li><li>`studioExportStrings` and the round-156 builders are byte-identical.</li><li>The dialog diff is limited to E0–E4.</li><li>`rangeLabel` is gone.</li><li>The only literal change is `'0:00'` → `'00:00.000'` in E1.</li><li>F1 changes only the URL.</li><li>T1 changes exactly the ST-TP3 assertion, its title and its loop, and appends the rest.</li><li>T2 changes only TH7.</li><li>T3 changes only l.39 and appends the rest.</li><li>Doc 126 changed only its status line.</li><li>Doc 127 follows the template, in Georgian.</li></ul> |
| TEXT-BYTES-E | At both viewports, open Export and read `textContent`, comparing byte for byte with the reference from the `strings.ts` templates and the shown times:<ul><li>(a) **no range:** the description = `Entire project · 00:00.000 — <end>` (R3: no longer `0:00`, which closes B-R155-EXPORT-ZERO), and the project option label is the same text;</li><li>(b) **a 3 s → 5 s range** (clip-body drag): the description and the range option = `Time selection · 00:03.000 — 00:05.000 (2.000 s)`; choosing the project option switches the description to (a)'s text;</li><li>(c) **loop on** (Ctrl+L or the loop control) with and without the range: the loop note equals `loopRangeNote` / `loopProjectNote` for the same values;</li><li>(d) **CDP Accessibility:** the scope radios' accessible names equal those label texts (no added or missing spaces).</li></ul> |
| MONO-STYLE-N13…N16 | N13 description, N14 project option, N15 range option, N16 loop note. For each mono span:<ul><li>computed family IBM Plex Mono, weight **400**, `tabular-nums`;</li><li>CDP `getPlatformFontsForNode` = "IBM Plex Mono [web]";</li><li>exactly 2 spans per site, and the "(2.000 s)" text is not in a span;</li><li>the surrounding sans text keeps Instrument Sans at its container weight.</li></ul>Give one table per viewport. |
| LAYOUT-FIT-E | Both viewports, with the range and the loop on: `clientWidth`/`scrollWidth` and line count of the description, the two scope options and the loop note, as mono vs sans natural width (the round-156 clone method). The footer must still not cover a focused control. A new truncation or a hidden-content wrap is a finding (Low; Medium if content becomes unreachable). Width growth alone and the known C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER state are not findings. |
| CSS2-TRIM | <ul><li>The `/studio-lab` HTML links exactly the R4 URL.</li><li>The css2 response contains `@font-face` blocks for only:<ul><li>Instrument Sans 400/500/600;</li><li>IBM Plex Mono 400;</li><li>Noto Sans Georgian 400/500.</li></ul>There is no Instrument Sans 700 and no Plex Mono 500. Record the counts.</li><li>No woff2 request for a removed face.</li><li>Store pages `/` and `/products` still link no Studio css2 (FONTS-SCOPED, one session).</li></ul> |
| FONT-INVENTORY | At 1440 in one session, plus a 1280 spot check of S0 and Export. States:<ul><li>S0;</li><li>a selected clip with the Detail panel expanded;</li><li>a range;</li><li>all tracks;</li><li>the marker menu;</li><li>the grid menu;</li><li>library preview playing;</li><li>Export with range + loop + Master mute notes shown;</li><li>a Toast, if the cloud cart failure shows one (allowed state; record either way).</li></ul>In each state:<ul><li>0 visible elements whose computed weight is ≥ 700;</li><li>0 visible Plex Mono elements at weight ≥ 500;</li><li>every visible weight-600 element is listed by tag, text and source (expected: the Export `ModalTitle`, a Toast title if shown);</li><li>`document.fonts` has no loaded Instrument Sans 700 or Plex Mono 500 face.</li></ul> |
| FONT-FAIL | One session per viewport with `fonts.googleapis.com` and `fonts.gstatic.com` aborted by `page.route`. The Studio renders and works (Play 1 s, select a clip, open and close Export, Escape) with 0 pageerror. Record the fallback family. Not a layout row. |
| FUNC-SMOKE-E | Both viewports:<ul><li>Play 2 s; the playhead moves and the output peak is > 0.</li><li>WAV export of the 3–5 s range downloads one file of 2.000 s ± 1 ms (header duration).</li><li>A project WAV export downloads one file whose duration equals the project end.</li><li>Cancel and Escape still close the dialog, with focus returned to the Export button.</li></ul> |
| G157-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C rounds 154–156 verified it): MONO-STYLE N1–N12, TEXT-BYTES (a)–(f) of round 156, WEIGHT-STYLE, MASTER-OVER, RV-1, LABEL-STYLE and RV-2. A new observation about them is a note. FONT-INVENTORY covers the weight effect of the trim on those surfaces.
- **Not C rows:** V-2b-DISPLAY, B-R153-PREVIEW-DUR, C-R151-2/3 (deferred).
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Scope radio accessible names, tab stops, focus restore | TEXT-BYTES-E (d), T157-TARGETED (a11y-copy, tab-stops, focus-restore), FUNC-SMOKE-E |
| Export render and range window (no logic change, but the same file) | FUNC-SMOKE-E, T157-TARGETED (export-range-ui XU2/XU3) |
| Dialog height at 1280 (footer overlap) | LAYOUT-FIT-E |
| Any weight that silently relied on Instrument Sans 700 or Plex Mono 500 | CSS2-TRIM, FONT-INVENTORY |
| Store pages' fonts | CSS2-TRIM (FONTS-SCOPED) |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Monospaced timecodes in the Export dialog; font weights served | None used. Source: the user-approved `visual-direction-a.md` § „ტიპოგრაფია“. | Not checked. | **Not applicable; CZABA brand decision.** Seconds stay sans (vetoable). | Requirement: TEXT-BYTES-E, MONO-STYLE-N13…N16, CSS2-TRIM. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-157.md`, `a-round-157-result.json`, and `a-round-157/`. That folder holds the vitest JSON and file list, the mutations, end-sha256, the diff patch and the code-reviewer result.
- **C:** `c-round-157.md` and `c-round-157.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the TEXT-BYTES-E, MONO-STYLE and FONT-INVENTORY tables. Put tools, out and shots in `c-round-157/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 158 planning)
| Condition | Round 158 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`). Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL only on CSS2-TRIM / FONT-INVENTORY / FONT-FAIL | A fix-up bounded to the URL and TH7. If a removed weight is proven in use, the weight goes back; it is never synthesized. |
| C FAIL Low on TEXT-BYTES-E / MONO-STYLE / LAYOUT-FIT-E | A bounded fix-up of that row. |
| C PASS | Root publishes round 157. V-2b-3b → **მზადაა**, which completes V-2b apart from V-2b-DISPLAY (awaiting the user). B-R155-EXPORT-ZERO is closed. Round 158 = **V-3a**: B measures and splits V-3 (lucide icons, borderless buttons, radius, hover motion) against `visual-direction-a.md`, starting with the transport and toolbar icons. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 157 planning).

## 8. Root notes
- **Gate:** on a C PASS, publish round 157 (8 paths). `app/styles/**`, `root.tsx`, `Modal.tsx`, `Toast.tsx`, `CookieConsent.tsx` and the round-156 component files are unchanged vs `cbcd3d9`.
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - D-29z122 R3: the Export description now says `00:00.000` instead of `0:00`.
  - D-29z122 R4: Instrument Sans 700 and Plex Mono 500 are no longer downloaded.
  - D-29z121 R2 still holds: seconds and warnings stay sans.
- **Frontend-architect checkpoint:** `b-round-155-checkpoint-request.md` (V-2) and `b-round-148-checkpoint-request.md` are still pending. They are non-blocking and not re-requested. The V-2b end (on round 157 PASS) is the natural point for root to run them, before V-3 adds icon components.
- **User questions, unchanged:** B-R153-PREVIEW-DUR (a)–(c), V-2b-DISPLAY (a)–(d) including the Export title weight, and C-R151-2.
