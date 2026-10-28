# B round 225 → 226 planning (2026-10-28)

**Decision: CONTINUE.** Round 226 = **SABA-B-8 CALM-1a**: the `?` shortcut sheet, the footer button "Shortcuts ?", the removal of the permanent shortcut line, and the lane-move hint in the contextual row. Decisions D-29z266…D-29z271. After it:
- CALM-1b (227);
- CALM-2 (228);
- CALM-3 (229);
- RETRO (230).

REGRESSION takes precedence on or after 2026-10-30.

## 1. Inputs read
- `context/active-summary.md` (head) and `lessons.md`.
- `current-task.md`. It is archived as `tasks/round-225.md` (a new file; `cmp` OK, nothing deleted).
- `a-round-225.md`, `c-round-225.md`, `c-round-225.json`.
- `gates/gate-round-225.json`: **published**, commit `80fbb3b` on both remotes. That commit is **the round-226 baseline**. The JSON's `head` field (`bbaea50`) is the value before the gate. Store HEAD = `80fbb3b`, and the tree is clean.
- `env-status.json` (round 225, store 200). `regression-last.json` (2026-10-27, round 199), so REGRESSION is not due.
- `b-round-224.md`, `b-next.json`.
- `docs/technical/studio-real-workspace/calm-studio-review.md` (whole).
- Backlog lookups by ID only.
- Source, read-only:
  - `StudioWorkspace.tsx`: the footer (l.2576–2657), `handleKeyDown` (l.1748–2085) and `isTypingTarget`;
  - `ArrangementTransport.tsx` (titles);
  - `strings.ts`;
  - `ui/Modal.tsx`;
  - `ArrangementExportDialog.tsx` (its focus pattern);
  - `ArrangementLibrary`, `Overview`, `Lane`, `Clip`, `MarkerRow` and `GroupHeader` (key bindings);
  - `view.ts`, `fader.ts`, `track-volume-db.ts`;
  - the repo-scan tests (`studio-focus-ring`, `panel-radius-ui`, `studio-theme-obsidian`, `timeline-cursor-map`).

## 2. Backlog: updated only from independent evidence (D-29z266)
**Round 225: C PASS.** 10 rows; `browserVerified` and `realVerified` are true; 0 bugs. Gate 225 published `80fbb3b`.
- **PERF-HARNESS-SHARED-LIB-b-i → done.**
- **Closed, each by a named C row:**
  - C-R224-01 (BUDGETS-DIFF-225, EQUIV-225, REPLAY-225 b);
  - A-R224-REVIEW-TENTHS-NAN (CODE-225, UNIT-225 G-1…G-6, REPLAY-225 c);
  - C-R224-02 (UNIT-225: CM-3 is now killed).

  All three moved to `closed_findings_d29z163`.
- **Recorded:**
  - C-R225-OBS-01 (info; supports D-29z259);
  - C-R225-OBS-02 (info; candidate b-ii scope "pin every kind", not scheduled);
  - the recurrence of C-R223-OBS-01;
  - the round-225 data of R224-WINDOW-BOUNDARY-WATCH.
- **Still open:** PERF-REPORT-TEST-INCLUDE (Low, root-dependent).
- **New:**
  - **B-R225-BACK-TO-START-KEY** (Low). The title "Back to start (0)" names a key with no binding; the key is Home. It is fixed in CALM-1b, the round that owns the title, so it is not deferred.
  - **R226-PERF-LAYOUT-WATCH** (info). The scroller becomes 20 px taller, so the PERF-1b counts may shift; b-ii re-baselines.
- `deferred_low_polish`: **349**, unchanged. `backlog.json` v211.

## 3. Rulings
- **D-29z267: split CALM-1 into 1a and 1b, with the full scope kept.** B's L23 pre-check ran on a scratch copy (`git archive 80fbb3b`) across `app/lib app/components app/hooks app/routes`:
  - **1a** (line removed, contextual slot, skeleton sheet and button): 2 red / 2801 green. Only WSU1 and UC12 fail; both are granted. No repo-scan collision (`b-round-225/l23-precheck-1a.txt`).
  - **1b** (Undo/Redo/Home titles with keys): 18 more red tests in 7 more files (`l23-precheck-1b.txt`).

  One feature stage per round, so 1b goes next round.
- **D-29z268: R77-BUTTON-SHORTCUT-SUPERSET is NOT closed by CALM-1.** It concerns the marker prev/next buttons announcing a superset key; the review mislabelled it. It stays deferred.
- **D-29z269: the sheet = frozen `ui/Modal` + a local focus trap,** copied from the Export dialog.
  - There is no `focus:outline-none` container, because SFR2 allows only the Export one. Initial focus goes to the search field.
  - This is the 3rd local dialog-focus implementation, so a **bounded, non-blocking frontend-architect checkpoint** was filed: `b-round-225-checkpoint-request.md` (useDialogFocus, keymap module, footer component).
- **D-29z271, contract choices (the smallest honest behaviour):**
  - The subline ends "Esc closes." The review's "Press ? or Esc" would be false while focus is in the search field.
  - `aria-keyshortcuts="Shift+/"` for `?`. This is a physical-key inference; no spec example was found.
  - The PageUp/PageDown row says "bigger step", not "−6 dB". It is native behaviour: B measured 0 → −6 → 0 dB on the 60 dB video fader.
  - In number fields, `?` neither opens the sheet nor is prevented. It is not "typed", because Chromium rejects it.
- **Sheet rows are grounded in source.** All 43 rows carry a file and line at `80fbb3b`. The two native behaviours (Shift+wheel, PageUp/PageDown) were measured in Chromium (`b-round-225/probe-before.json`). A row A cannot confirm is a STOP, and A never invents one.

## 4. Before-evidence (B, Chromium on the live dev server)
- Footer: 69 px. Shortcut line: 1 line, 16 px. Scroller `clientHeight`: 496 (1440) / 386 (1280). The values are the same in S0 and S1.
- So C-GEOM expects a footer of 49 ± 1 and a scroller of 516 / 406 ± 1.
- `bbox-before.json` holds 143–156 keys per state. It is deterministic: 0 px between two runs (`bbox-before-run1.json`).
- Full-window screenshots: `before-full-{S0,S1}-{1440x900,1280x720}.png`.
- Scripts: `b-round-225/probe.mjs`, `bbox-before.mjs`.

## 5. Reference first (Live 12 manual, fetched 2026-10-28)
- ch. 42 (42.1: Info View "Shift?", Hide/Show Overview Ctrl+Alt+O, Esc closes a dialog; 42.5; 42.16; 42.20).
- 2.2.2 Info View: the `?` key; shows the name and function of the hovered element.
- 3.2 Status Bar.

The review's local captures (`/home/claude/...`) are not on this runner and are not cited. The task's §2 lists R1–R5 and the deviations.

## 6. Saba-issue root cause (policy 2026-10-28)
`Why we missed it` is in task §1.1. **L39** was added to `lessons.md` (55 lines, ≤ 60; D-29z270). C checks it (row C-LESSON).

## 7. Consults
- **Advisor (before writing):** adopted. It contributed:
  - the baseline from the gate commit;
  - grounding every sheet row in source, and probing the native keys;
  - the L23 pre-check;
  - the local focus pattern plus the checkpoint;
  - the number-field row fix;
  - fetching the Live manual instead of the missing captures;
  - capturing the before geometry;
  - the contextual priority rule.
- **Advisor (final review):** adopted, in `current-task.md` and the backlog only:
  - the sheet-open `?` close path also ignores `event.repeat`, so a held `?` opens once (SS3, C-NO-OPEN, MU-c);
  - C-A11Y now measures the footer button contrast at rest and on hover;
  - the ⌘/⌥ glyph coverage, with the fallback text ruled in advance;
  - the widest sheet row at 1280×720;
  - the harness-copy signal ARCH-R226-SHEET-UI-HARNESS-COPY.
- **ableton-arrangement-expert / docs-explorer:** not consulted. B fetched the Live 12 manual sections directly, which is the primary source.
- **tech-lead / design-philosopher:** not consulted. The design choices come from the Saba-approved review; the structural question goes to the frontend-architect checkpoint.

## 8. Architecture checkpoint
New and non-blocking: `b-round-225-checkpoint-request.md` (ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP). Still pending with root:
- `b-round-221-checkpoint-request.md`;
- `b-round-211`, `203` and `205`.

CALM-1a does not wait.

## 9. For Saba (`awaiting_user`, unchanged)
- GATE220-S3 / GATE221-S2;
- SABA-Q-FFMPEG-FILENAME, SABA-Q-LAME-LGPL;
- the retro-200/215 proposals.

## 10. Files written by B
- **Task files:**
  - `tasks/round-225.md` (a copy);
  - `current-task.md` (round 226);
  - `b-round-225-r226-{tree-sha256 (1,073; rc 0), grants (4), new-files (5), root-or-granted (4), granted-start-sha256, root-files-start-sha256}.txt`;
  - `b-round-225-checkpoint-request.md`.
- **`b-round-225/`:**
  - backups: `backlog-before.json`, `feature-status-before.md`, `b-next-before.json`, `current-task-before.md`, `lessons-before.md` and `regression-last-before.json`;
  - `git-status-at-planning.txt` (empty);
  - `probe.mjs`, `probe-before.json`;
  - `bbox-before.mjs`, `bbox-before.json`, `bbox-before-run1.json`;
  - `before-*.png`;
  - `l23-precheck-1a.txt`, `l23-precheck-1b.txt`;
  - `backlog-update.py`.
- **Updated:**
  - `backlog.json` (v211);
  - `feature-status.md`;
  - `lessons.md` (L39);
  - `b-next.json`.

Unchanged:
- `regression-last.json`, because REGRESSION is not due;
- `context/*`, which is root-generated.

App source was not touched; the store `git status` is clean. The scratch copy (`/tmp/b226`) is outside the repository.

## 11. Status
**CONTINUE.** Round 226 is dispatched.

**Commit readiness:** round 225 is published. Round 226 becomes commit-ready after C PASS and the root gate.
