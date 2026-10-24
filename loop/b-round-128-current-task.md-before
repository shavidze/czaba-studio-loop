# CURRENT TASK — Round 128: VISUAL-A V-0.1 fix-up — one name per Export dialog button (C-R127-01) + Export wording (C-R127-L1)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned from ~06:15 UTC, `date -u`)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. These rules take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md`, M2 and stage V-0.
- **Previous task:** `tasks/round-127.md`, an exact copy (`cmp` OK, 26991 bytes). Rationale: `b-round-127.md`. Decision record: **D-29z93** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `608187fdf279d9b579c279f3c536b27be74c0eea` plus the round-127 working tree that C verified.**
  - Gate 127 was `skipped` (C FAIL), so nothing was published.
  - At planning the tree had 24 ` M` and 3 `??` (`strings.ts`, `strings.test.ts`, doc 104): **the round-127 work. Keep it. Do not revert, stash or re-do it.**
- **Frozen list:** `tmp/studio-real-loop/b-round-127-r128-tree-sha256.txt`, **930 entries**.
  - It covers every tracked **and untracked** file (`git ls-files -co --exclude-standard`) except the 10 grants in §2. That includes the 16 round-127 files that are not granted now, frozen at their C-verified state.
  - `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 10 grants:** `b-round-127-r128-granted-start-sha256.txt`. **Start copies:** `b-round-127/r128-granted-start/` (paths relative to `store/`). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z93)
- **C round 127: FAIL** (`browserVerified` and `realVerified` true). The only failure is **C-R127-01 (Medium)**, which is A's P1.
  - The footer button now reads `Close`. The frozen `Modal.tsx` ✕ already has `aria-label="Close"`, so one dialog has two buttons named "Close".
  - During a render the footer one is disabled and the ✕ is enabled, so a screen-reader user hears two "Close" buttons with different states.
  - 15 granted tests fail with `Found multiple elements … name "Close"`.
- **Everything else passed in the real browser:**
  - Georgian count 0 everywhere, except `source.audioNote`, which belongs to V-0.2;
  - export output unchanged: 7217877 frames, a range of 192000 frames, a silent muted WAV, MP3 and WAV + MP3;
  - layout attributable to the shorter text; keys otherwise at baseline;
  - G127-3 and PX-NET passed.
- **The §8 row "C FAIL with Medium" of round 127 applies:** a bounded V-0.1 fix-up, then V-0.2.
- Regression is not due (`regression-last.json` 2026-10-24 → due on or after 2026-10-27). No Critical or High finding is open. `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.

### 0.1 B ruling on P1 (A's four options)
| Option | Ruling | Reason |
|---|---|---|
| 1. Relabel the footer button | **Chosen: `Done`** | It removes the duplicate **in the product** (C asked for that), it changes one module value, and it needs no query change, because every query reads `studioExportStrings.closeButton`. The ✕ keeps "Close". |
| 2. `aria-label` on the footer | Rejected | Visible text and accessible name would differ (WCAG 2.5.3, label in name), and exact-name queries could match the ✕ silently. |
| 3. Relabel the Modal ✕ | Rejected for now | `Modal.tsx` is frozen and shared (auth modal, store). `e2e/auth-modal.spec.ts:65` and `e2e/accessibility.spec.ts:60` select `button[aria-label="Close"]`. It needs its own task and owner. Recorded as signal `ARCH-R127-MODAL-CLOSE-LABEL`. |
| 4. Relax the test matchers | Rejected | The duplicate would stay in the product. |

- **Why `Done`, the smallest honest label.** The button only closes the dialog: it does not cancel a render (that is `Cancel`, a separate button) and it does not export. "Done" is distinct from "Close", "Cancel" and "Export …". It also reads naturally after an export finishes. No Ableton claim is made about this label (§6).
- **The key stays `closeButton`.** It names what the button does (it closes the dialog). Renaming it would touch 35 references in 13 files for no behaviour gain. Record this reason in doc 104.

## 1. What changes (user-visible)
| # | Key in `studioExportStrings` | Now | After round 128 | Where it shows |
|---|---|---|---|---|
| W0 | `closeButton` | `Close` | `Done` | the footer button, idle and after an export (disabled during a render, as before) |
| W1 | `videoRenderReason` | `Video is not rendered in this cycle — …` | `Video is not rendered in this version — …` (rest unchanged) | the disabled Video option's reason |
| W2 | `loopRangeNote`, `loopProjectNote` | `… the time selection is created (…)` / `… the entire project is created (…)` | `… the time selection is exported (…)` / `… the entire project is exported (…)` | the WAV note with Loop on, range and project scope |
| W3 | `exportCancelled`, `exportCancelledEncoder`, `emptyProjectNoFile`, `invalidRangeNoFile`, `encoderLoadFailed`, `exportFailed`, `mp3Failed`, `encoderLoadTimeout` | `… — No file was created. …` | `… — no file was created. …` (lowercase after the dash, mid-sentence). `videoDecodingNoFile` keeps `No file was created.`, because there it starts a sentence | the cancelled and failure statuses |
| W4 | `exportedRange` | `range 00:02.000 — 00:06.000 (4.000 s)` | `time selection 00:02.000 — 00:06.000 (4.000 s)` | the done message after a range export (`WAV created: time selection …`) |

- **Nothing else changes.** No other key, element, order, `id`/`aria-*`, `data-testid`, class, disabled rule, focus or Tab logic, timer, export pipeline, file name or frame output.
- **Glossary amendment (§1.1 of round 127):** `დახურვა` (footer) → `Done`; the Modal ✕ stays `Close`. `No file was created.` is lowercase `no file was created.` after an em dash inside a sentence.
- **Deferred, not in this round** (→ `deferred_low_polish`):
  - C-R127-L1e: `busyButton` `Rendering…` also shows during the encoder load and the MP3 encode. Fixing it needs state-dependent label logic.
  - C-R127-L1f: `export-cancel.test` l.211–215 and `export-wav.test` l.170/594 compare a constant with its module source, and the EW8f title overstates what it checks.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | **Only** the values of the W0–W4 keys. No key added, removed or renamed, no signature change |
| `app/lib/arrangement/__tests__/strings.test.ts` | The ST1/ST2 literals of the W0–W4 keys follow the new English, still `toBe`. ST1–ST5 keep their structure and their `it` count |
| `app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx` | **+1 `it`: HE8** (§3.1), the only `it` added in the round, plus the title-only changes below. It has the render-phase harness (`pendingRenders`, `closeButton()`, `cancelButton()`) that HE8 needs |
| Title-only, 6 more files: `export-dialog-focus`, `export-dialog-focus-restore`, `export-toolbar-hold-enter`, `export-dialog-footer`, `export-cancel-ui`, `export-cancel` (all `.test.ts(x)` under `app/lib/arrangement/__tests__/`) | Change only `it`/`describe` title text. Where a title names the **footer** button as `Close`, it now says `Done`: HE1–HE7, the 4 `export-dialog-focus` titles, FR1/FR3/FR4, TH1, FT1/FT3/FC3, CU1/CU9. A title's `X` or `✕` that means the Modal button stays. `export-cancel.test.ts` "exports the exact Georgian messages and a named cancel error" → "exports the exact messages and a named cancel error". **No other line in these 6 files changes** (and in `export-dialog-hold-enter`, no line outside HE8 and the titles) |
| `docs/implementation/2026/quarter-IV/104-studio-v0-export-strings.md` | Update the W0–W4 map rows. Add the §0.1 P1 ruling as Problem → Solution, the glossary amendment and the key-name reason. Set the status to Completed only after the checks in §4 are green; otherwise leave it In Progress and say why |

- **Not granted** (frozen at their C-verified state): `ArrangementExportDialog.tsx`, `ArrangementContext.tsx`, `graph.client.ts`, `export-progress.ts`, `export-cancel.ts`, `export-wav.client.ts`, and the other 11 round-127 tests (`export-dialog-a11y-copy`, `export-dialog-tab-stops`, `export-mp3`, `export-progress-ui`, `export-progress`, `export-range-ui`, `export-wav`, `master-ui`, `master`, `meter-ui`, `video-fades-ui`). `app/components/ui/Modal.tsx` stays `741c2341…`.
- **Pre-edit grep (A records the results):**
  - Grep `app/**/__tests__/**` and `e2e/**` for each old English value of W0–W4: `in this cycle`, `is created (`, `— No file was created`, `range ${` / `'range `, and `'Close'` or `name: 'Close'` as a **footer** query.
  - B found English literals of these values only in `strings.test.ts`. The `button[aria-label="Close"]` selectors and the `'Close'` aria-labels in `export-cancel-ui` CU9 (l.619/647), `export-dialog-focus` l.213, `export-dialog-focus-restore` l.189, `export-dialog-footer` l.151, `export-dialog-tab-stops` l.183 and `export-range-ui` l.492 all mean the **Modal ✕**. They stay unchanged.
  - **Stop rule:** if a test outside §2 asserts an old W0–W4 literal, or turns red, or a change needs a frozen file, **stop and report**. Do not edit; B rules.
- **Expected end state:** the same 27 `git status` entries as at the start (24 ` M` + 3 `??`), no new path. `sha256sum -c --quiet b-round-127-r128-tree-sha256.txt` is OK at the start and at the end. Report the end sha256 of each of the 10 grants.
- **Protected (unchanged; `git diff 608187f` on them is empty):**
  - `app/routes/studio.$productId.tsx` `fa2cf0bc`
  - `app/routes/api.studio-token.ts` `13914809`
  - `app/lib/auth.ts` `56f5b76f`
  - `app/contexts/AuthContext.tsx` `bf9ee257`
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check` (`--write`), `npm run format`.
- **Edit rule (C-R120-01):** every lasting edit uses the Edit or Write tool. Shell replaces are allowed only for temporary mutations, which are restored and checked by sha256. **This includes the untracked `strings.ts`:** take a sha256 before each mutation and check it after the restore (round 127 left `Closee` behind once). List every shell write in the report.
- **Before editing, read:** `.claude/primitives-map.json`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` casts (also no `as const`), semicolons, no code comments.

## 3. A — tests and mutations

### 3.1 New test HE8 (`export-dialog-hold-enter.test.tsx`)
**HE8 — every button in the Export dialog has a unique accessible name, idle and during a WAV render.** Use the file's existing helpers: `mountHoldEnterDialog`, `pendingRenders`, `clickExport`, `closeButton()`, `cancelButton()` and `settleRenders`. If a needed helper is missing, stop and report; do not add test infrastructure outside the HE8 `it`. Assert both states:
1. **Idle** (dialog open, project scope):
   - `within(dialog).getAllByRole('button', { name: 'Close' })` has length 1, and that element has `aria-label="Close"`. That is the Modal ✕; the literal is allowed here because it is `Modal.tsx`'s value, not module copy.
   - `getAllByRole('button', { name: studioExportStrings.closeButton })` has length 1, and it is the footer button (the element the existing `closeButton()` helper returns).
   - The list of accessible names of **all** buttons in the dialog has no duplicate. Name = `aria-label` if present, else the trimmed `textContent`. Assert with `new Set(names).size === names.length`, and print the list in the failure message.
2. **During a WAV render** (Cancel visible): the same three assertions. Also: the footer button is disabled, and the ✕ is enabled (unchanged behaviour, now pinned).
- HE8 is a new `it`. The `it` count of `export-dialog-hold-enter` goes 7 → 8. Every other file's count is unchanged; report before and after.

### 3.2 Mutations
A runs each one, and each must turn the named test red. After each one, A restores the file and checks the restore by sha256 (§2 edit rule).
- **m5:** `closeButton` → `'Close'` → HE8 red, ST1 red, and the 15 round-127 P1 tests red again. This proves HE8 catches C-R127-01.
- **m6:** `closeButton` → `'Export WAV'` → HE8 red in the idle state, because it collides with the export button. This proves the uniqueness check is general, not tied to "Close".
- **m7:** put back `in this cycle` (W1) or `range ${start}` (W4) → ST1 or ST2 red.

## 4. A — checks (speed rules)
- Run `npm run typecheck` and `npm run lint`, plus a read-only `npx biome check` on the 9 changed code files.
- Run `npx vitest run` on:
  - `strings` and the 18 round-127 granted tests: `export-cancel-ui`, `export-cancel`, `export-dialog-a11y-copy`, `export-dialog-focus-restore`, `export-dialog-focus`, `export-dialog-footer`, `export-dialog-hold-enter`, `export-dialog-tab-stops`, `export-mp3`, `export-progress-ui`, `export-progress`, `export-range-ui`, `export-toolbar-hold-enter`, `export-wav`, `master-ui`, `master`, `meter-ui`, `video-fades-ui`;
  - neighbours: `export-range`, `export-wav-in-place`, `mp3-encoder`, `graph`, `ArrangementContext`, `status-announcement-ui`.
  - **Every file must be green, including the 15 tests that were red in round 127.** Name the file list exactly in the report. C runs the same list.
- No full suite and no `npm run verify`: the gate runs them.
- **The code-reviewer is required** (10 changed files, 9 of them code). Pass its Architecture note to B.
- **Report `a-round-128.md`:**
  - the start HEAD, frozen OK, and the 10 start hashes matching;
  - the pre-edit grep results;
  - the diff of each granted file against `b-round-127/r128-granted-start/` (per file: the keys or titles changed);
  - the test counts and the per-file `it` counts before and after;
  - m5–m7;
  - the typecheck and lint results;
  - the reviewer verdict and Architecture note;
  - every shell write;
  - frozen OK at the end, the end `git status`, and the 10 end hashes;
  - any deviations.
- **A stops and reports (no edit; B rules) if:** a test outside §2 turns red or asserts an old W0–W4 literal; or a change needs a frozen file (`export-dialog-a11y-copy` is frozen this round) or a non-title line in a title-only file.

## 5. C — rows
- Use real Playwright Chromium, a fresh context per session, at **1440×900 and 1280×720**, on `http://127.0.0.1:5173/studio-lab`.
- **Reuse** the `c-round-127/tools/` harness and the round-125 S0/S1/S2 fixtures. Media comes from `tmp/studio-real-loop/media/`.
- **Harness rules:**
  - ENV-FIRST-LOAD: discard a crashed first load once and record it under `invalidRuns`.
  - Every run writes a uniquely named file.
  - Open every screenshot with the Read tool and describe it.
  - At most 2 replacement attempts per row, and only for environment-invalid runs.
- **Do not re-verify** what round 127 already proved and this round does not touch: the per-state Georgian scan, every export format, and the frame counts beyond REG-WAV below.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T128-TARGETED** | A's exact §4 vitest list | All green, including the 15 round-127 P1 tests and HE8. The counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet b-round-127-r128-tree-sha256.txt` (from `store/`); protected hashes and `Modal.tsx` `741c2341` | The same 27 entries, no new path; the frozen list OK; the protected hashes unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` each granted file against `b-round-127/r128-granted-start/<path>` | `strings.ts`: only the W0–W4 values changed, with no key or signature change. `strings.test.ts`: only those literals changed. `export-dialog-hold-enter`: only the HE8 `it` added (plus any import it needs) and title text. The 6 title-only files: **every hunk is title text**; list them. W3 lowercases exactly the 8 keys and keeps `videoDecodingNoFile`. Doc 104 has the W0–W4 rows and the P1 ruling. **Meaning check:** no W row drops or adds a fact. List every shell write A reports |
| **EX-KEYS** (both) | Open Export (S2 state with a time selection). Count buttons by exact accessible name, idle and during a WAV render (Playwright `getByRole('button', { name, exact: true })`). Then repeat round 127's key sequence: Tab and Shift+Tab order from the footer button, Escape, hold-Enter on the footer button, hold-Enter on the toolbar Export | `Close` = **1** (the ✕), `Done` = **1** (the footer), and no two buttons share a name, in both states. During a render, `Done` is disabled and ✕ is enabled. Focus lands on `Done` when the dialog opens. The Tab order, Escape, focus return to the toolbar Export and the hold-Enter results equal the round-127 EX-KEYS observations, with `Done` in place of the footer `Close` |
| **EX-COPY** (1440, plus 1280 for EX-COPY-RANGE) | The states where W1–W4 show: **(a)** dialog with the disabled Video option (video clip on the lane) → its reason; **(b)** Loop on: make the time selection 00:02–00:06, press Ctrl+L (loop the selection, as in `c-round-106/tools/kr106.cjs`), open Export → the WAV note in range scope; then select `Entire project` → the WAV note in project scope; **(c)** WAV cancel during a render; **(d)** MP3 cancel while `Creating MP3` (if the CDN is reachable); **(e)** a range WAV export → the done message | Exact text: **(a)** `… in this version — …`; **(b)** `… the entire project is exported (…)` and `… the time selection is exported (…)`; **(c)** `Export cancelled — no file was created.`; **(d)** `Export cancelled — no file was created. The MP3 encoder will load again on the next MP3 export.`; **(e)** `WAV created: time selection 00:02.000 — 00:06.000 (4.000 s), …`, and the file is still 192000 frames. Georgian count in each of these dialogs is 0, minus the subtracted `source.audioNote`. **Not reachable** in the browser, and so not claimed: `emptyProjectNoFile`, `invalidRangeNoFile`, `encoderLoadFailed` (unless the CDN fails), `exportFailed`, `mp3Failed`, `encoderLoadTimeout`. They are covered by ST1/ST2 only, and listed under `inconclusive` |
| **EX-LAYOUT** (both) | Footer bboxes in S2 vs `c-round-127` S2; S0/S1 outside the dialog vs `c-round-125/out/bbox-baseline-*.json` | Outside the dialog: every box within 1 px. In the footer: only the `Done` button's width changes, attributable to its text. The buttons stay on one row, right-aligned, with the same y and h. There is no new `scrollWidth > clientWidth`. The 1280 range-card/footer overlap is recorded and compared with F-2 (13 / 45 px) |
| **REG-WAV** (1440) | One project WAV export from the S fixture | 7217877 frames, 48 kHz / 24-bit / 2 ch, `czaba-studio-lab.wav`. Copy-only sanity check |
| **G128-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | The workspace and the demo badge show. The product route shows "Sign in required", with no workspace and 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G128-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror`. The known cloud noise is not reported |

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:** a duplicate accessible name in the dialog; any behaviour change (focus, Tab, disabled rules, export output); a weakened, removed or skipped test; a non-title hunk in a title-only file; an English text that drops a fact.
  - **Low:** wording or style.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| The label of the button that dismisses the Export dialog | — | **არ ეხება** (not applicable). B did not verify Live's export dialog button labels, so no Ableton claim is made | `Done` is a CZABA naming and a11y choice: one name per button | EX-KEYS |
| "Time selection" in the done message (W4) | Live 12 manual ch. 6 "Arrangement View", B capture `b-round-71/ableton-arrangement-view-20261021.txt` (2026-10-21; reused from round 127) | **Confirmed** term: "time selection" | The done message uses the same term as the scope card | EX-COPY (e) |
| Export behaviour | — | **არ ეხება**: copy only | — | REG-WAV, EX-KEYS |

- C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- **C writes** `c-round-128.md` and `c-round-128.json` as it goes. The JSON has `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` and `notesForB`.
- Evidence goes under `c-round-128/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Rows blocked only by the missing backend go under `blocked`. Inconclusive rows are listed as inconclusive, never under `passed`.
- C makes no `store/` writes. Consult only the read-only agents in C's list.

## 8. Outcome, fixed in advance (B at round 129 planning)
| Condition | Round 129 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the matching row below |
| C FAIL with Critical / High / Medium | Another bounded fix-up of V-0.1 (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.1 → `c_pass`, and `c_pass_published` after the gate. GATE103-S2 → done after the gate. Round 129 = **V-0.2**: the remaining `ArrangementContext.tsx` status, refusal and history texts, plus the helpers it calls (`groups.ts`, `selection.ts`, `library.ts`, `video.ts`, `video.client.ts` including `source.audioNote`, `tempo.ts`, `metronome.ts`, `view.ts`). ST4 gains those files. Before V-0.3, B rules on the reviewer note: whether conditional copy may live in formatters, and whether to split the file |

- At every planning, B checks for `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Where it could break:**
  - the footer focus, Tab and hold-Enter rules (rounds 88–111): the footer button's name changes, and the tests query it through the module;
  - the 1280 footer row: `Done` is shorter than `Close`, so the risk is low;
  - title-only edits that slip into a test body (C checks every hunk).
- **Architecture:** no source file outside `strings.ts` changes. The Modal ✕ label is recorded as signal `ARCH-R127-MODAL-CLOSE-LABEL`, not scheduled.
- **Commit readiness:** after C PASS, root may publish V-0.1 (rounds 127 + 128) as one interim unit: the Export copy in English, with the other areas still Georgian until V-0.2…V-0.5.
