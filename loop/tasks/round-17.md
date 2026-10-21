# CURRENT TASK — Round 17: C-R16-01 (the preview's active-lane row has a fixed two-line height) with round-9 reviewer M-R10-1/M2 (the `LibraryPlayheadText` memo) (D-29h)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

**Why this grouping.** C bugs come first. C-R16-01 is the only open C bug that a code round can fix. Round-9 reviewer M-R10-1/M2 is in the same file and the same `<section>`, and it is already scheduled for when that file is next in scope. That makes two closely related items in one file, which the rule allows. Polish 14b (the detail panel) moves to round 18 (D-29h).

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-16.md`. C's verdict was **PASS** (`c-round-16.md`, `c-round-16.json`):
- **PASS:** R16-L1, R16-F1, R16-F2, R16-F3, R16-H1, R16-G1, R16-T1, R16-U and R16-Doc; every §6 adjacent regression; G16-1..3; vitest 979/979.
- **Closed:** C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 and A's round-11 deviation 9.
- **New Low, C-R16-01.** At 1440×900 with library 288 and the video expanded, changing the active lane from SFX to music wraps the preview line `აქტიური ხაზი: …` from one line to two:
  - the preview grows 151 → 167 px and the library body shrinks 233–680 → 233–664;
  - the box placed earlier (bottom 672) then covers the top 8 px of the preview strip: 136 of 216 samples in the top 12 px hit the box;
  - no control is covered, and the footer stays at 69;
  - the mechanism existed before round 16 (`c-round-16/runs/active-lane-residual-1440-288.txt`).
- **A's deviations:** B accepted them (D-29h). Deviation 5 was B's wording error: Esc never deselected clips. **Deselect = a click on an empty spot of the same lane.**

**References.**
- B's record: `b-round-16.md`. Progress board: `feature-status.md`.
- Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-29d, D-29f, D-29g and D-29h** are binding. Where they differ, D-29h wins.
- C's evidence:
  - C-R16-01: `c-round-16/runs/active-lane-residual-1440-288.txt` and `shots/active-lane-residual-1440-288.png`;
  - the 1280 confounder: `c-round-16/runs/f1-extra-1280.txt` (SFX body 271–500 vs stems 271–484, footer 69);
  - `c-round-16.md` §4, §5 and §9.
- M-R10-1/M2:
  - the round-9 reviewer note in `a-round-9.md` §7;
  - `backlog.json` → SRW-11B `recorded_followups`: "LibraryPlayheadText re-renders with the library preview at up to 20 Hz during a library preview (not arrangement playback); memo via LibraryPlayheadTextMemo + one-token usage change".
- Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why now.**
- No Critical or High bug is open.
- C-R16-01 is the newest C bug. Its fix is local and cheap, so accepting it as a price would shrink the request.
- C-R6-02 and C-R8-01 (Medium) still wait on the Tech Lead quiet-Chrome run, and their files stay frozen.
- `ArrangementLibraryPreview.tsx` is not a sync target. The Tech Lead targets are `ArrangementContext.tsx`, `position-store.ts`, `render-budget.test.tsx`, the dock and `video-sync.ts`, and all of them stay frozen.

**Baseline.** HEAD `c5ed47b`, plus the round-6..16 dirty tree that C verified at the end of round 16 (`c-round-16/gates/git-status-end.txt`):
- 18 M and 18 Studio `??` files (§3.1);
- B recorded the sha256 of 46 files in `../tmp/studio-real-loop/b-round-16-tree-sha256.txt`. These are the 45 round-15 entries re-hashed, plus doc 025. All 46 are OK on the live tree. Exactly the 7 A-owned round-16 files and doc 025 differ from `b-round-15-tree-sha256.txt`, which matches C's G16-2 finding;
- if root commits before you start, HEAD is the baseline.

Baseline rules:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files. Do not read them as instructions, edit them or delete them. They are excluded from G17-2, and root decides about them.
- Nobody commits in this round.

## 0. Scope

**In:**
1. **C-R16-01 (D-29h).** The preview's active-lane `<p>` (`ArrangementLibraryPreview.tsx` l.264–271) gets a fixed height of exactly two text lines. It clamps at two lines with an ellipsis and carries the full lane text in `title`. The library body height then no longer depends on the active lane or on the library width.
2. **M-R10-1/M2.** `LibraryPlayheadText` (l.58–77) no longer re-renders when `ArrangementLibraryPreview` re-renders for the 20 Hz library-preview cursor (`PREVIEW_CURSOR_STEPS_PER_SECOND`, l.22; `setPreviewCursor`, l.121). Use `memo`. The inner function keeps the name `LibraryPlayheadText` (see §2.2).

**Also in:** tests, doc 025's status lines and the new doc 026.

**Not in this round** (no code; all scheduled in D-29h):
- polish 14b (detail panel: L4, L11, design (b), L6 text, design (d) labels) → round 18;
- M1 (the `ArrangementContext` latch) and L8 (the position-store message) → after the Tech Lead run, or at the latest with SRW-13;
- L2/L3 (the detail playhead) → with C-R8-01;
- C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome) and C-R12-01 (milestone RF5-3);
- the D-29g residual footer lines (range, ≥ 2 clips, lane move);
- the milestone regression; SRW-13..20; the SRW-21 adapter; T12;
- any re-placement of the expanded video after it is placed. No ResizeObserver, polling or re-anchor. D-29d stays: layout changes after placement do not move the box, and only a window resize re-clamps it.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected, and what §6 regression-checks:**
- **Preview height.** The preview grows 16 px at every width where all states fit on one line today, so the library body shrinks 16 px there. That changes the D-29f box and inset numbers. C re-checks the formula against live rects; it is the disclosed price (§1.4).
- **Preview controls.** The wave (click and keys), ▶/■ and ＋ დამატება, plus find → add, which ends on the preview's add path.
- **Library playhead text.** It must still update on arrangement playback frames without React renders. The frozen `render-budget.test.tsx` R9-L1 test must stay green, unchanged.
- **Nothing else in the workspace changes.**

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` (read only; no audio change), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - the `new-test.md` prompt and the `pre-flight` skill.

   Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - in `plan.md`: D-29d, D-29f, D-29g and **D-29h**;
   - `c-round-16.md` §4, §5 and §9.
3. Read in full:
   - `ArrangementLibraryPreview.tsx`;
   - `render-budget.test.tsx` l.1–80 (the fiber render probe: it counts renders by `componentName(fiber.type)`) and l.512–540 (the R9-L1 test that asserts on this `<p>`);
   - in `ArrangementLibrary.tsx`, the body region (l.427) and where the preview is mounted (l.545). Read only.
4. **Measure before code**, with no source edit while the browser runs, and record the results in the report:
   - **(a) Line count.** Record the active-lane `<p>`'s `offsetHeight`, its computed `line-height` and its line count, at library widths 288, 384 and 480, at both 1440×900 and 1280×720. Do this for every active-lane state: video (with `(აუდიო აქ არ ემატება)`), music, stems, SFX and none (`—`), if reachable.
   - **(b) Layout.** Record the preview rect and the library body rect in the same states.
   - **(c) Price.** For each viewport/width pair, record the px the fixed two-line row adds against today's height in the one-line states. Record the same in doc 026.
   - **Stop and report to B** if any state needs more than two lines at 288. The clamp would then hide text that is visible today (it would survive only in `title`). Before the clamp exists, line count = `offsetHeight / line-height`. Keep these pre-code numbers; C compares the post-fix `scrollHeight` against them.
5. Post the **pre-flight gate** at the top of your report. It contains your assumptions, the measurements, the smallest design, each file with its reason and the commands that prove success.

## 2. Fixes (`ArrangementLibraryPreview.tsx` only)

### 2.1 C-R16-01: a fixed two-line active-lane row

**Contract (D-29h):**
- The `<p>` at l.264 has a fixed height of exactly two lines of its own line-height. In this file's text size that is expected to be 32 px; your measurement decides. Content beyond two lines is clamped with an ellipsis (`line-clamp-2` or equivalent Tailwind utilities; no custom CSS and no arbitrary colors).
- The `<p>` gets `title` = the full lane text it renders before ` · playhead`, i.e. `აქტიური ხაზი: {name}{video note}`. The playhead time is not in `title`.
- **These stay byte-identical in text:**
  - the visible text `აქტიური ხაზი: …`;
  - the inner `<span className="text-foreground">`;
  - ` · playhead ` and the `LibraryPlayheadText` span (test id `arrangement-library-playhead`, class `tabular-nums`).

  `render-budget.test.tsx` l.525–527 asserts these.
- **Result:** the preview `offsetHeight` is identical across all active-lane states and across library widths 288–480, at both viewports. The library body therefore does not change when the active lane changes (C-R16-01 closed).
- **Unchanged:**
  - every other element in the preview (title row, wave, buttons);
  - `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, the dock and the floating-video code.

### 2.2 M-R10-1/M2: `LibraryPlayheadText` memo

- Wrap the existing function with `memo` (e.g. `const LibraryPlayheadTextMemo = memo(LibraryPlayheadText);`) and render the memo at l.270.
- **Keep the inner function declaration named `LibraryPlayheadText`.** `render-budget.test.tsx` counts renders by that name (l.528 expects > 0 on mount, l.535 expects 0 over 60 frames). Its writer, its `useArrangementPositionWriter` call, its span and its initial text stay byte-identical.
- No context, provider or position-store change.

### 2.3 Not allowed

- Any change outside `ArrangementLibraryPreview.tsx` in `app/`. In particular, none to `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, `ArrangementVideoDock.tsx`, `video-sync.ts`, `ArrangementContext.tsx`, `position-store.ts`, `ArrangementDetailPanel.tsx`, `panels.ts` or `components/ui/**`.
- Changing `render-budget.test.tsx` or any other existing test.
- Re-placing, re-anchoring or resizing the expanded video after placement. No ResizeObserver, polling or new rAF loop.
- Changing visible texts. Truncating the title row differently.
- Widening any tolerance.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementExportDialog,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/{video-sync.ts,view.ts}
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,video-sync.test.ts,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx,export-dialog-focus.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..025}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**. It must stay byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

**Before your first edit:**
- run `sha256sum -c ../tmp/studio-real-loop/b-round-16-tree-sha256.txt` (46 OK) and report any difference before you code;
- record the §3.3 frozen subset into `a-round-17/gates/frozen-start.txt`;
- copy the owned files to `a-round-17/bak/*.base.*`.

### 3.2 May modify or create this round

**Modify:**

| File | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | §2.1 and §2.2 only |
| `docs/implementation/2026/quarter-IV/025-studio-lab-panel-polish-14a.md` | Status and TODO lines only. They record: C round 16 PASS; C-R11-01..03, C-R15-02/03 and deviation 9 closed by C; C-R16-01 open → round 17 (D-29h); A deviation 5 = B wording. No "resolved" wording for C-R16-01. |

**Create:**

| File | Responsibility |
|---|---|
| `app/lib/arrangement/__tests__/library-preview.test.tsx` | Component tests for §2.1 and §2.2 (R17-U) |
| `docs/implementation/2026/quarter-IV/026-studio-lab-preview-active-lane-row.md` | Written per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 026 is taken). Contents: both items, D-29h with its rationale (why two lines and not one `truncate`, why no re-placement), the measurements and the price, the tests and your runs. Everything is "pending C". |
| `../tmp/studio-real-loop/a-round-17.md` | Your report (§8) |
| `../tmp/studio-real-loop/a-round-17/` | Runs, gates, shots and backups |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state |

### 3.3 Frozen this round

C checks these by sha256 against `b-round-16-tree-sha256.txt`: **every file in it except the two owned files above.** Explicitly:
- `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, `ArrangementVideoDock.tsx`, `video-sync.ts`, `video-sync.test.ts` and `floating-video.test.tsx`;
- `ArrangementContext.tsx`, `position-store.ts` and `render-budget.test.tsx` (the C-R8-01/C-R6-02 targets for the Tech Lead run);
- `ArrangementDetailPanel.tsx`, `ArrangementLane.tsx`, `panels.ts`, `panels.test.ts`, `track-layout.test.tsx`, `detail-panel.test.tsx`, `export-dialog-focus.test.tsx` and `ArrangementExportDialog.tsx`;
- `ArrangementClip.tsx`, `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts`, `gesture-guard.test.tsx` and `ArrangementContext.test.ts`;
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts` and `graph.client.ts`; also `library.ts`, which is not in the sha list but is tracked and unmodified, so `git diff -- app/lib/arrangement/library.ts` must stay empty;
- `components/ui/Modal.tsx`;
- docs 015–024.

**Read-only imports allowed:** `~/lib/utils`, `react` (`memo`) and the existing imports of the owned file.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config` or `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts` and `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**` and `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files and the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`. They are read-only; copy what you need into `a-round-17/`.

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..16 work;
- leaving temporary instrumentation in source;
- **editing any `store/` file (including docs) while a browser measurement runs**, because Vite reloads the page.

## 4. Acceptance (C)

Viewports are 1440×900 and 1280×720. Library widths 288, 384 and 480 are set by the separator with real ArrowRight presses (16 px steps). Pointer gestures are synthetic with `buttons: 1` unless a real `$B click` is named. Keys use real `$B press`. Every check reports measured numbers.

**Ways to set the active lane:**
- a click on an empty spot of the target lane (synthetic, as in round 16), or a real click on a clip of that lane;
- deselect is an empty-lane click on the **same** lane.

**R17-P1 (fixed row).** At both viewports and at widths 288, 384 and 480, for every reachable active-lane state (video, music, stems, SFX):
1. The active-lane `<p>`:
   - `offsetHeight` = 2 × its computed `line-height` (±1);
   - the content line count = `round(scrollHeight / line-height)`. With the clamp, `offsetHeight` is always 2 lines, so it cannot count lines. That count is ≤ 2 in every state and equals A's pre-code count from §1.4a. **Only if `scrollHeight > offsetHeight`** must the text end with an ellipsis (`text-overflow`/`-webkit-line-clamp` computed, plus a screenshot);
   - when the text needs more than two lines, it ends with an ellipsis.
2. `title` is exactly `აქტიური ხაზი: ${name}${note}`, with no trailing space, and with the video note `(აუდიო აქ არ ემატება)` on the video lane. C compares `title.trim()` with `textContent.split('·')[0].trim()`. The JSX `{' '}` before ` · playhead` leaves a trailing space in `textContent` (C round 16: `"აქტიური ხაზი: SFX "`), and that space is not a failure.
3. `textContent` is unchanged against round 16: `აქტიური ხაზი: {name}{note} · playhead {time}`.
4. **Δ 0 across lanes:** within one viewport and width, the preview `offsetHeight` and the library body rect are identical across all lane states.
5. **Δ 0 across widths:** within one viewport, the preview `offsetHeight` is identical across 288, 384 and 480.
6. **Price:** compare the preview height against round 16 (C's `c-round-16` runs: 151 for one line at 1440/288). Report the added px per viewport/width and check it against A's §1.4c record. It is the D-29h price and not a failure, unless it is undisclosed or differs from A's number.

**R17-P2 (the exact C-R16-01 repro).** At 1440×900, library 288, with a video on the video track and the 3 demo clips (C's `lay11`):
1. Click an empty spot of the SFX lane (SFX active, no selection). Record the body.
2. Click ⤢ (real). The box is placed by the R15-P1 formula against the live body: width = max(160, min(640, lib − 16, (h − 16)·16/9, (h/2)·16/9)), top = max(body.t + 8, body.b − 8 − h), left = lib.l + 8 (±1). The inset = height + 16.
3. Real click on the music clip header (music active). Required:
   - body **Δ 0**;
   - box unchanged;
   - box bottom ≤ body.bottom − 8 + 1;
   - `elementFromPoint` on the preview's top 12 px (C's round-16 sample grid, 216 points) returns the preview or a descendant on **all** points (0 in the box);
   - the wave, toggle, ◀, search and separator hit-test to themselves.
4. Repeat steps 1–3 at 1280×720 with library 480, and with library 288 (the 1280 confounder: SFX ↔ stems ↔ music). Required: body Δ 0, and the box never over the preview.
5. Switch the active lane to video and back to SFX while expanded → body Δ 0, box unchanged.

**R17-P3 (preview controls still work).** At 1440×900, library 288:
1. A real click on the wave at about 50 % starts the preview there. Within 1.5 s the slider's `aria-valuenow` increases and `aria-valuetext` advances.
2. A real click on `■ შეჩერება` stops it. Real Space on the focused wave toggles ▶/■, and real ArrowRight moves the cursor +1 s.
3. Find → add: real click on search, type `soft`, real click on the option, real Enter → one clip is added to the active audio lane, with one Undo entry.
4. With the video lane active, `＋ დამატება` is disabled and the video note is visible in the row or in `title`.

**R17-M (M-R10-1/M2, browser sanity).** Start a library preview for 3 s with the transport stopped:
- the `arrangement-library-playhead` node stays the same node (`isSameNode`);
- its text stays the stopped transport time;
- the preview cursor advances.

Then press real Space (arrangement Play) for 2 s. The library playhead text advances, and on Pause it equals the transport time display (±1 frame text). This is not a sync run, and the counters must not change.

**R17-U (unit and component tests, `library-preview.test.tsx`).**
- **C-R16-01:**
  - the active-lane `<p>` has the two-line clamp class and the fixed-height class (assert the exact class tokens you use);
  - `title` is exactly `აქტიური ხაზი: ${name}${note}` (no trailing space) for an audio lane and for the video lane (with the note). It also equals the `textContent` before `·`, after `.trim()`;
  - `textContent` still contains `· playhead 00:00.000`.
- **M-R10-1/M2:**
  - during a library preview, advance the preview cursor through ≥ 10 steps (fake `getLibraryPreviewOffset` / rAF);
  - `ArrangementLibraryPreview` renders ≥ 10 times, and `LibraryPlayheadText` renders **0** times after mount;
  - use a render probe that counts by component name (the `render-budget.test.tsx` pattern may be copied into the new file; do not import from or edit the frozen file).
- **Guard proof** (`a-round-17/guard-proof.txt`). Each mutation is temporary; restore it and check with `cmp` against your pre-guard copy:
  1. remove the clamp/fixed-height classes → a C-R16-01 test fails;
  2. remove `title` → a C-R16-01 test fails;
  3. render `LibraryPlayheadText` directly instead of the memo → the M-R10-1 test fails;
  4. rename the inner function (e.g. to `LibraryPlayheadTextInner`) → `render-budget.test.tsx` R9-L1 fails. This proves the name constraint is load-bearing; report the failing assertion.
- **Frozen test:** `render-budget.test.tsx` is unchanged (sha) and green.

**R17-Doc.**
- Doc 025's status lines show C round 16 exactly as in §3.2.
- Doc 026 contains no unverified PASS and records the price.

## 5. Required tests (behavioural, named)

- Everything in R17-U, with the four-part guard proof.
- No existing test changes. If one would need to change, stop and report to B.

## 6. What C verifies (focused, per the workflow)

1. **The fixes:** R17-P1, R17-P2, R17-P3, R17-M, R17-U and R17-Doc.
2. **Adjacent regressions only** (1440×900 unless stated):
   - **R16-F2 quick (D-29f from the new body):** at 1440/288 and 1280/480, with no selection, a real ⤢. The formula holds against live rects (±1); the inset = h + 16; hit-tests on ◀, search, separator and preview return the control. Report the new numbers against round 16 (1440/288 8,503 272×153; 1280/480 8,369.5 217.77×122.48). They change by the disclosed price only.
   - **R16-F3 quick:** at 1280/480, find → add while expanded → body Δ 0, box unchanged, 0 preview samples in the box.
   - **R15-P2 quick:** at 1280/480 while expanded, the real click on the `soft` row adds one clip; the last list row is reachable at max scroll.
   - **R13-F3 quick:** ✕, the placeholder and Esc return the box to 160×90 with the same `<video>` nodes.
   - **R16-F1 quick:** footer 69, Δ 0 across select ↔ deselect at 1280×720 (same-lane deselect).
   - **R11A-1 quick:** ◀/▶, the rail is 40 px, the separator stays in 288–480.
   - **Dock quick:** 1152×107 / 992×107, a 160×90 video, one visible `<video>`, both muted.
   - **RF7-P2:** `render-budget.test.tsx` sha unchanged and green.
   - **No sync runs.** The dock, `video-sync.ts` and `ArrangementContext.tsx` are frozen and sha-checked. If C sees a stall, a hard seek or a counter change during the checks, it opens a bug; no extra runs.
3. **Gates:**
   - **G17-1:**
     - tsc 0;
     - vitest ≥ **979** + the new tests, 0 failures. If the known `sfx-library.test.tsx` load flake recurs, re-run that file alone and report both results;
     - build passes;
     - Biome 0 errors on the owned paths and on `./app`.
   - **G17-2:**
     - protected hashes OK;
     - `git status` and `git diff --stat` show only §3.1/§3.2 paths. The two foreign agent files are excluded and reported to root;
     - `Header.tsx` identical to HEAD;
     - every §3.3 file matches `b-round-16-tree-sha256.txt`;
     - the owned files' base backups `a-round-17/bak/*.base.*` match `b-round-16-tree-sha256.txt`;
     - no change to `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` or `studio-lab-demo.ts`;
     - instrumentation grep = 0.
   - **G17-3:** anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view`/`scroll` events are known and allowed (root notes).
4. **Harness rules:** H1, H2 and H3 apply as before.
5. **Closed root carry (do not list as open).** Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed by C's own PASSes.

   Still carried, and honest:
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - the export hard-clip at 0 dBFS (R13-M4, SRW-13);
   - the final commit/push only after everything;
   - the uncommitted round-6..17 tree (root exposure note);
   - the shared `Modal.tsx` focus gap, including focus on `body` escaping the trap (root/UI owner);
   - root GA sends `scroll` with consent denied (root analytics);
   - the two foreign agent files (root);
   - the `publication-checkpoint.json` requirements (library/stems/scrollbars, T12, the final commit/push).
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R6-02, C-R8-01 and the RF7-3 quiet-Chrome run (Tech Lead);
   - C-R12-01 (milestone RF5-3);
   - polish 14b (round 18); M1/L8; L2/L3;
   - the 21 regression-debt IDs (milestone);
   - the Tech Lead manual checks, including R11-P3m, R11-SB, R13-RM, R15-SB and the new R17-T (the two-line row with real Windows Georgian fonts).

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-16-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/library-preview.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/lib/arrangement app/components/arrangement
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**`/check` rule (unchanged):**
- Run `biome check --write` only on the **named files** you own this round. Never point it at a directory and never at `Header.tsx`.
- Run `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files; then re-run the hash check.
- Never run `npm run format`.

**Dev server and browser:**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- Do all browser work through gstack `/browse` with the state file `../tmp/studio-real-loop/a-browse.json`.
- Use real `$B press` for keys; synthetic pointers need `buttons: 1`.
- Media: `../tmp/studio-real-loop/media/`.
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.** The round touches one product file, one new test and docs. Still:
- invoke the actual `code-reviewer` subagent on the full diff of every file you touch;
- fix its findings, then re-run it on the fix delta;
- quote both summaries.

The `design-philosopher` is optional, for the two-line row. If you invoke it, report any conflict to B; do not apply it.

## 8. Report `../tmp/studio-real-loop/a-round-17.md`

1. The pre-flight gate, including the §1.4 measurements and the price.
2. The design of each fix and why it is the smallest.
3. The files actually changed (a subset of §3.2), with confirmation that:
   - no round-6..16 file was reverted;
   - `frozen-start.txt` matches `b-round-16-tree-sha256.txt`;
   - `Header.tsx` is byte-identical to HEAD;
   - `render-budget.test.tsx`, `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, the dock, `ArrangementContext.tsx` and `Modal.tsx` are unchanged;
   - instrumentation is gone.
4. Verbatim command tails.
5. Your R17-P1/P2/P3/M runs (A's evidence, not a verdict), with numbers and these shots:
   - `preview-row-1440-288-music.png`;
   - `preview-row-1280-480-video.png`;
   - `c-r16-01-repro-fixed-1440-288.png`.
6. New tests, each with its reason, plus the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with its reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 18:** polish 14b, the detail panel:
  - L4: the start/end fields keep typed text when an unrelated range changes;
  - L11: the wheel on a focused number input. Its acceptance will be what C can observe: a unit test plus a mutation, with the real-wheel check on the Tech Lead list;
  - design (b): the range overlay must not hide the waveform. Only the overlay `<div>`'s background class may change. The playhead element, its writer, the SVG and the waveform box classes stay byte-identical (R9-D3). The pixel criterion: inside the overlay, the peak-vs-background difference must be ≥ 50 % of the same difference outside it;
  - L6: the `biome-ignore` reason text;
  - design (d): the detail labels in Georgian per the prototype (`დასაწყისი`, `სიგრძე`). The footer text stays verbatim. B greps the tests for the label strings before writing the task.
- **Then:**
  - M1/L8, after the Tech Lead run or with SRW-13;
  - the milestone regression, including the 21 regression-debt IDs and C-R12-01 under RF5-3;
  - SRW-13 onwards in dependency order (13 → 14/15 → 16 → 17 → 18 → 19 → 20);
  - the SRW-21 adapter contract;
  - T12.
