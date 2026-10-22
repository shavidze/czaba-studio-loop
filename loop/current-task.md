# CURRENT TASK — Round 93: Lows batch part 1 — export dialog radio names, descriptions and format-aware notes (D-29z58)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-92.md` (exact copy, sha256 `f79db29d…`). Rationale: `b-round-92.md`. Decision record: D-29z58 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** three tightly related Low bugs in one file and one dialog, one owner (A):
  1. **GATE91-S1-NOTE-IN-LABEL:** every format radio's accessible name includes its note, because the note sits inside the `<label>`. This affects the WAV graph note, the MP3 note, the WAV + MP3 note and the disabled video reason. The fix applies to the whole group, not only the WAV + MP3 radio. Fixing one radio would leave three inconsistent siblings in the same fieldset.
  2. **A-R86-L7-REASON-READ-TWICE:** the disabled range radio has the opposite problem. Its reason is in the name (inside the label) **and** in `aria-describedby`, so it is read twice.
  3. **A-R86-L8-NOTES-SAY-WAV:** the no-sound note and the Master-mute note say `WAV შეიქმნება` even when MP3 or WAV + MP3 is selected.
  Plus one doc status line (doc 080 l.4) and one new implementation doc.

## Why this round
- **C round 92: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 92: published**, commit `64e12d823cc35efa4e69b975dab34c6ab7d46802` on both remotes (verify 137/137 files, build OK, reviewer 9/10). **SRW-21 stage 1 is done.** The route mount is still blocked by the auth owner.
- **C has no open bug.** The regression round is due on or after 2026-10-24 (`regression-last.json` = 2026-10-21). Today is 2026-10-22, so this is not a regression round.
- **The only buildable core item is blocked.** The SRW-21 mount needs the auth owner. The approved order is phase 1 → T12 → VISUAL-A-OBSIDIAN, and the open Lows are phase-1 debt (D-29z24: Lows → SRW-21 → full regression → T12). The export dialog Lows come first because they are reachable in a real browser and stay within one owned file.

## Baseline (measured by B, 2026-10-22)
- **HEAD `64e12d823cc35efa4e69b975dab34c6ab7d46802`** (gate 92 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-92-r93-tree-sha256.txt`, **518** entries, **518/518 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the two owned existing files below.
  - It includes every existing test: `export-range-ui.test.tsx` (`790af7ab`), `export-mp3.test.tsx` (`f2cdbe21`), `master-ui.test.tsx` (`5292b689`), `meter-ui`, `video-fades-ui`, and all `export-dialog-*` tests. **No existing test is granted.**
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-92-r93-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-92-r93-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `b93710cd` | 533 | owned (D1, D2 only) |
  | `docs/implementation/2026/quarter-IV/080-studio-workspace-purchased-collection-readiness.md` | `72b7fd89` | 97 | owned (l.4 only) |

- **Protected (frozen, never edited):** `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`), and the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`). `app/contexts/ArrangementContext.tsx` (`140f17ec`) is frozen in this round too. The done messages there stay unchanged.
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs in a scratch copy (`a-round-93/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder.
  - A mismatch (another HEAD, a dirty tree at start, a changed frozen file) means stop and report.

## 1. What changes (A)

### D1 — accessible name = main text, description = note (GATE91-S1 + A-R86-L7)
**Pattern.** For each radio below:
- the main text goes in its own `<span id={nameId}>`;
- the note or reason becomes a **sibling** span with `id={noteId}` (the WAV main text currently *contains* its note span, so split it);
- the `<input>` gets `aria-labelledby={nameId}` and `aria-describedby={noteId}`.

The ids come from `useId()`. Use one `useId()` with suffixes, or one per id; both are fine. The ids must be unique in the document and must resolve inside the dialog.

**What must not change:**
- the DOM text: each `label.textContent` stays byte-identical, because the frozen `radioLabelText` locks in `export-range-ui` (l.274, 290, 454–455) and `export-mp3` (l.255, 352) read it;
- the order of the visible text, every class, every `data-testid`, `name`, `checked`, `disabled` and `onChange`;
- that the radio stays inside its `<label>`, so a click on the text still selects it.

The note spans keep their existing classes (`block text-xs …`). The new name span gets **no** class, so it renders inline exactly as the bare text node did.

| Radio | Accessible name (exact) | Accessible description (exact) |
|---|---|---|
| WAV (`arrangement-export-format-wav`) | `WAV · 24-bit · 48 kHz · stereo` | the current graph note (`arrangement-export-graph-note`): one of its four texts, depending on scope and loop |
| MP3 | `MP3 · 48 kHz · stereo` | `MP3_FORMAT_NOTE` |
| WAV + MP3 | `WAV + MP3 · ორი ფაილი` | `BOTH_FORMAT_NOTE` |
| video (disabled, no testid) | `ვიდეო (აუდიოთი)` | `VIDEO_RENDER_REASON` |
| range, **no valid range** (disabled) | `მონიშნული მონაკვეთი` | `EXPORT_RANGE_MISSING_REASON` (keep the existing `aria-describedby={hasValidRange ? undefined : rangeReasonId}` byte-identical; add `aria-labelledby={hasValidRange ? undefined : rangeNameId}`) |
| range, **valid range** | `მონიშნული მონაკვეთი · {rangeLabel}` (unchanged) | none: neither `aria-describedby` nor `aria-labelledby` (frozen export-mp3 l.644) |
| project | `მთელი პროექტი · 00:00.000 — {end}` (unchanged, no new attributes) | none |

The `arrangement-export-scope-range-reason` span keeps its `id={rangeReasonId}`, its testid and its text.

### D2 — format-aware silence notes (A-R86-L8)
Add one constant next to `EXPORT_FORMAT_BUTTON_LABELS`:
`EXPORT_FORMAT_CREATES: Record<ArrangementExportFormat, string> = { wav: 'WAV შეიქმნება', mp3: 'MP3 შეიქმნება', both: 'WAV და MP3 შეიქმნება' }`.
The wording mirrors the context's existing done messages (`WAV შეიქმნა`, `MP3 შეიქმნა`, `WAV და MP3 შეიქმნა`).

The two notes read it from the selected `exportFormat`. The exact `textContent`, with `{len}` = `rangeSeconds` in range scope or `formatArrangementTime(projectEnd)` otherwise:
- no sound: `პროექტში ხმოვანი კლიპი არ არის — {creates} {len} სიგრძის სიჩუმით.`
- Master mute (`arrangement-export-master-mute`): `Master დადუმებულია (M) — {creates} {len} სიგრძის სიჩუმით. ჩართე Master, თუ ხმა გჭირდება.`

With `wav`, both texts are **byte-identical to today**. Frozen locks: `export-range-ui` l.325/347/381/385 and `master-ui` l.659. The conditions for showing each note do not change. Nothing else in the dialog changes: no focus effect, tab stops, footer guard, button, progress, message, or the loop and video notes.

### New test — `app/lib/arrangement/__tests__/export-dialog-a11y-copy.test.tsx`
Mount `ArrangementProvider` and the dialog the way `export-range-ui.test.tsx` does. Copy the stubs and the mount helper; never import from a test file. Use `getByRole('radio', { name, description })` (`@testing-library/dom` 10.4.1 supports `description`). Exact strings only.

- **AN1 no range, no loop:** each of the five radios (WAV, MP3, WAV + MP3, video, range) is found by its exact `name` **and** exact `description` from the D1 table. In this state the WAV description is exactly `მთელი პროექტი, იგივე graph რაც დაკვრისას`. The project radio is found by its exact name, and `hasAttribute('aria-describedby')` and `hasAttribute('aria-labelledby')` are both false.
- **AN2 negative:** `queryAllByRole('radio', { name: /LAME|ან ორივე|graph|ვიდეოს რენდერი|მონიშნე დროის/ })` is empty. No note text leaks into any name.
- **AN3 valid range + enabled loop:**
  - The range radio's name is exactly `მონიშნული მონაკვეთი · 00:04.000 — 00:09.000 (5.000 წმ)`, with neither attribute.
  - The WAV description is exactly `მონიშნული მონაკვეთი წრფივად, იგივე მიქსით — loop იგნორირდება`.
  - After clicking the project radio, the WAV description is exactly `მთელი პროექტი წრფივად 0-დან ბოლომდე, იგივე მიქსით — loop იგნორირდება`. This shows the description follows the live note.
- **AN4 the label still selects:** a click on the MP3 name span checks MP3, and the export button reads `MP3-ის ექსპორტი`. A click on the WAV + MP3 note span checks WAV + MP3.
- **AN5 ids:** every `aria-labelledby` and `aria-describedby` value on the dialog's radios resolves to exactly one element (`document.querySelectorAll('#' + CSS.escape(id)).length === 1`, or `getElementById`), and that element is inside the dialog. All ids differ from each other.
- **AN6 text lock:** each `label.textContent` equals the frozen values: MP3 and WAV + MP3 exactly as `export-range-ui` l.454–455, video as `export-mp3` l.352. This duplicates the frozen locks on purpose, so a mutation is caught in the new file too.
- **NC1 Master mute:**
  - Project scope (projectEnd 00:20.000): WAV → `Master დადუმებულია (M) — WAV შეიქმნება 00:20.000 სიგრძის სიჩუმით. ჩართე Master, თუ ხმა გჭირდება.`
  - Click MP3 → `… — MP3 შეიქმნება 00:20.000 …`.
  - Click WAV + MP3 → `… — WAV და MP3 შეიქმნება 00:20.000 …`.
  - Click WAV → the original text again.
  - Range scope 4–9 with MP3 → `… — MP3 შეიქმნება 5.000 წმ …`.
- **NC2 no sound:** use the same ghost-clip setup as `export-range-ui` XU3 l.364. The three formats give the three exact texts in project scope; MP3 gives the exact text in range scope.
- **NC3 reset:** close and reopen the dialog. The format is WAV again, and the Master-mute note says `WAV შეიქმნება` (the existing reset effect).

**Mutation proofs** (scratch copy; each must turn at least one listed test red; the frozen tests are listed only for information):

| ID | Mutation | Expected red |
|---|---|---|
| a | drop `aria-labelledby` from the MP3 input | AN1, AN2 |
| b | drop `aria-describedby` from the WAV + MP3 input | AN1 |
| c | WAV note span moved back inside the WAV name span | AN1, AN2 |
| d | drop `aria-labelledby` from the disabled range input | AN1, AN2 |
| e | range input gets `aria-describedby` also with a valid range | AN3 (and frozen export-mp3 l.644) |
| f | Master-mute note hardcoded to `WAV შეიქმნება` | NC1 |
| g | no-sound note hardcoded to `WAV შეიქმნება` | NC2 |
| h | the MP3 name span gets class `block` (layout drift); the text still matches | none expected; **report the result honestly**. This one is a C browser check (VIS-LAYOUT), not a unit test |

### Docs
- `080-studio-workspace-purchased-collection-readiness.md` **l.4 only** → `**სტატუსი:** C PASS (Round 92), გამოქვეყნდა 64e12d8 (D-29z57)`.
- New `docs/implementation/2026/quarter-IV/081-studio-lab-export-dialog-names-and-notes.md`, written per `docs/implementation/TEMPLATE.md` (Georgian, every section). Status line: `**სტატუსი:** Round 93 — C-ის შემოწმებას ელოდება (D-29z58)`. It records:
  - the name/description pattern and why the DOM text stays the same (frozen locks);
  - the three closed IDs;
  - what remains in the Lows batch.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | D1 + D2 only (format fieldset l.250–332 markup ids/attributes, range radio l.364–387, the two notes l.419–435, one new constant, the `useId` lines) |
| `app/lib/arrangement/__tests__/export-dialog-a11y-copy.test.tsx` | **new** (AN1–AN6, NC1–NC3) |
| `docs/implementation/2026/quarter-IV/080-studio-workspace-purchased-collection-readiness.md` | l.4 only |
| `docs/implementation/2026/quarter-IV/081-studio-lab-export-dialog-names-and-notes.md` | **new** |

**Expected end state: 2 M + 2 ??**, and all 518 frozen entries unchanged.
- **If any frozen test turns red, stop and report; do not edit it.** B expects every frozen test to stay green, because the label text, the testids and the WAV texts are byte-identical.

## 2. Pre-flight for A
- **Primitives:** `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md` (new constant), `TAILWIND_FIRST.md` / `DESIGN_TOKENS.md` (no class change), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. **Prompts:** `new-test.md`.
- **Verify the baseline before the first edit:** HEAD `64e12d8`; clean status; frozen 518/518; the two owned hashes; LF/CR.
- **Checks (speed rules):**
  - `npm run typecheck`, `npm run lint`, and a scoped `npx biome check` on the owned code and test file (no `--write`). Save `npx biome lint <owned files>` to `a-round-93/biome-lint-owned.txt`.
  - **Targeted vitest:** the new file; every `export-*.test.*`; `master-ui`, `meter-ui`, `video-fades-ui`, `track-group-mix-ui` (all of them mount the dialog); and any other `__tests__` file that greps for `ArrangementExportDialog`. Write the list to `a-round-93/targeted-list.txt`. Do not run the full suite.
- **A's own smoke (not C evidence), 1440×900:** Export dialog open. The CDP accessibility name and description of the MP3 radio are exact. Master mute + MP3 shows the exact note.
- **Code-reviewer: required** (4 changed files; the project rule counts files, not code files). Ask it to check the accessible-name/description computation and the SSR `useId` ids. Pass its Architecture note to B verbatim.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-93*`. **B** owns the planning artifacts. **Root** owns gates, commits and pushes.
- **Protected (never edited):** see Baseline. Purchase protection and the studio-token flow are untouched.
- **`/studio-lab`** stays the public **demo-only** workspace: demo badge; no purchased audio; no token or R2 requests; user video stays local; unpkg only after an MP3 export click.

## 4. Ableton source table
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Export option names and descriptions for assistive tech | none (web a11y of CZABA's own dialog; Live's Export dialog is not a web form) | — | **არ ეხება** | AX-NAMES |
| Silence-note wording per format | none (CZABA copy) | — | **არ ეხება** | NOTE-FORMAT |

## 5. C acceptance (real browser, Playwright Chromium 1.57, `/studio-lab` anonymous)

**Setup:** check `env-status.json` and that `:5173` returns 200. Do one warm-up load first (ENV-VITE-REOPTIMIZE-RELOAD: visit `/` alone, never in parallel with other sessions). Use a fresh incognito context per session, with the demo setup from rounds 90–92 (`c-round-92/tools/lib92.cjs`).

| ID | Viewport | Action | Pass evidence |
|---|---|---|---|
| AX-NAMES (primary) | 1280 and 1440 | (a) Demo with clips, no range: open Export. (b) Drag a range of 00:04.000–00:09.000 on a clip, open Export. (c) With the loop on, repeat (b) and switch scope to project | For every radio, the **real Chrome AX tree** (CDP `Accessibility.getPartialAXTree` on the input, or `getFullAXTree` filtered by role radio) gives `name.value` and `description.value` **exactly** as in the D1 table, including the graph-note variant for each state. `page.getByRole('radio', { name: X, exact: true })` has count 1 for each name. The leak regex (below the table, `LEAK-RE`) gives count 0. In (b), the range radio has no description. In (c), the WAV description changes to the project/loop text. Save the AX JSON for each state |
| AX-SELECT | 1440 | Click the MP3 **name text**, then the WAV + MP3 **note text**, then the WAV text | Each click checks that radio, and the export button reads `MP3-ის ექსპორტი` → `WAV + MP3 ექსპორტი` → `WAV-ის ექსპორტი` |
| NOTE-FORMAT | 1280 and 1440 | Mute Master (M), open Export, project scope: WAV → MP3 → WAV + MP3 → WAV; then a range 4–9 with MP3 | The `arrangement-export-master-mute` textContent is exactly per D2 in each state (`WAV შეიქმნება` / `MP3 შეიქმნება` / `WAV და MP3 შეიქმნება`, `{len}` = the projectEnd you read from the dialog description, or `5.000 წმ`). Close and reopen: WAV text. Screenshot each format |
| NOTE-NOSOUND | 1440 | **Try** a project whose only clip has no ready audio. For example, import a local silent video (make it in the browser with canvas `captureStream` + `MediaRecorder`, keep it under `c-round-93/`) as the only clip, or another honest path you find | If reachable: the three exact D2 no-sound texts. If you cannot reach it in a real browser, write **unit-only (NC2)** with the reason. That is not a FAIL |
| VIS-LAYOUT | 1280 and 1440 | Export dialog, no range | Each format option looks as it did at `64e12d8`: main text on the first line and the note on its own line below (rects: note top ≥ name bottom; the name is one line), and option heights equal to the round-92 run within ±1 px. Compare with screenshots taken from round-92 evidence or a fresh measurement of the same DOM nodes. Screenshot both viewports |
| EXPORT-REG | 1280: WAV project; 1440: MP3 range 4–9 | Base demo setup | `suggestedFilename` `czaba-studio-lab.wav` / `czaba-studio-lab-range.mp3`; the files parse (RIFF PCM 24-bit/48k/2ch; MP3 decodes); done texts as in round 92 |
| KEYS-REG | 1440 | Open Export, then Tab and Shift+Tab around the whole dialog; arrow keys inside the format group | Same stop order as rounds 90–92 (the format group is one stop, then the scope group, then the buttons); arrows move the format selection; Esc closes when idle |
| PX-NET | all sessions | — | No request to any R2/workers.dev host, `/api/studio-token`, `/api/recording-*` or `/api/download`; 0 `Authorization` headers; no unpkg request before the first MP3 click; audio only from the demo files |
| REG-HYD | all sessions | — | No hydration warning (the `useId` ids match between SSR and client) and no non-noise console error |
| G93-3 | 1440 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace; `/api/studio-token?…` anonymous → 401; the header link opens `/studio-lab` with the demo badge; fake-Bearer 403 → BLOCKED if the backend is unavailable |
| AN-REVIEW | — | Read `export-dialog-a11y-copy.test.tsx`; in a scratch copy, re-run A's mutations **a** and **f** | Both turn red as A's table says. Every AN/NC row asserts exact names, descriptions or texts, not only rendering |
| T93-TARGETED | — | A's `a-round-93/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | — | Start = end | HEAD `64e12d8`; 2 M + 2 ??; frozen 518/518; A's end hashes; the `git diff -U0` hunks of the dialog touch only the granted regions; doc 080 differs only on l.4; protected hashes as in Baseline |

- **`LEAK-RE`** for AX-NAMES, copy it literally: `page.getByRole('radio', { name: /LAME|ან ორივე|graph|ვიდეოს რენდერი|მონიშნე დროის/ })` → count 0. In (a) the WAV description is exactly `მთელი პროექტი, იგივე graph რაც დაკვრისას`.
- **No snapshot test** exists in `app/lib/arrangement/__tests__` (B grep), so the D1 markup change cannot hit a snapshot lock.
- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, and the production bundle (PROD-MP3-UNVERIFIED).
- **Neighbour behaviour that could break:** the label click target, the tab-stop grouping (radios by `name`), the footer focus guard (it measures the focused input), the video-fades note, the export button label, SSR ids.
- **Known and intended (not new bugs):** everything listed in round 92 §5; the 1-LSB WAV jitter (C-R84-L1, HR-C-R84-L1-EXPORT-JITTER); the demo row `შეცდომა: Failed to fetch` on an aborted demo load (C-R92 signal, Lows batch).

## 6. After this round
- **If C PASS:** GATE91-S1, A-R86-L7 and A-R86-L8 close.
- **Round 94:** if planned on or after 2026-10-24, it is the **regression round**: every done/c_pass item at both viewports plus `npm run test:e2e:smoke`. Otherwise it is **Lows part 2**, the load-effect pair plus its test gap:
  - COLLECTION-EMPTY-STATUS;
  - GATE92-S1 (status not reset on a collection swap);
  - GATE92-S2 (purchased MP3 names test).
  Then come the remaining export-dialog Lows (GATE90-S3/S4/S5, A-R88-REVIEW-EDGES, GATE89-S3/S4/S6, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER) and the grid/tempo Lows.
- **After the Lows that touch shipped behaviour:** R21-I2 full regression → T12 → VISUAL-A-OBSIDIAN. Lows that are only optional or info-level do not gate T12. Scope is not reduced.
- **Architecture:** the q14 checkpoint (`b-round-91-checkpoint-request.md`) is still pending at root and non-blocking. The round-92 reviewer note (move `workspaceCollectionCopy` into the V-0 strings module when V-0 lands) is recorded as signal q14 (f). Nothing is extracted in this round.
