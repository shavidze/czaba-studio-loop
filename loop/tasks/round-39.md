# CURRENT TASK — Round 39: SRW-13 stage 4b-2, group 1: the unsaved Clip Gain marker, the stale refusal status, and the order of pending previews

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-14
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorisation 2026-10-13).
- Decision record: **D-29z4** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-38.md`.
- Round size: **three tightly related bugs** from the same pending-state / status family. No new feature.

> **Environment prerequisite (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B time (2026-10-14 13:05 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **5 → 5** during B's gate run. Every A and C run records the count (`tasklist | grep -ci node.exe`).

## Why this round

**Round 38 landed:** **C PASS on every ID** (`c-round-38.md`, `c-round-38.json`).
- A real click no longer moves a fader (round 37: 0.5 / −27 dB).
- The drag is relative.
- A synthetic double-click resets.

Root committed round 38 as **`6c7b4bb`** and pushed both remotes (`publication-checkpoint.json` → `round38Checkpoint`). B compared the 7 committed files by sha256 with the shas C verified: identical.

**Why these three bugs now:** the workflow puts C's bugs first.
- The only open C bug that A can fix without the Tech Lead is **C-R37-01**:
  - C-R23-01 / C-R38-01 need `entry.server.tsx` or React 19;
  - C-R27-01 / C-R6-02 / C-R8-01 need quiet Chrome;
  - C-R30-01 is polish.
- C-R37-01 has three parts (`c-round-37/runs/kept.txt`):
  1. A Clip Gain text that was kept, not committed, during another gesture looks saved. It has **no pending marker**.
  2. The blocked status ("რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.") **stays after the gesture ends**, even across a later successful edit. This is also C-R31-INFO-REFUSAL-STATUS. C saw it again in round 38 (DC-G, MN-G).
  3. The kept text commits after edits made in between. **Accepted** (D-29z4): it commits when the user confirms it. Part 1 now makes it visible that it is unsaved.
- **Third related bug: PENDING-COMMIT-ORDER** (`checkpoint-oct13-review.md` #5).
  - `previewTrackVolume` does not commit an older pending Master preview first.
  - `applyEdit` then commits Volume before Master, so Undo can no longer restore the Master value.
  - **B proved it on the current code** in a scratch copy (`b-round-38/probe-order.test.snippet`). Steps: preview Master −3, preview the video track's Volume to 0.5, toggle Mute, then Undo ×3. Result: **Master stays at −3**; it should be 0. With the one-line flush below, Master returns to 0, Volume to 1, and the undo labels come in the order Mute, Volume, Master Volume.

## Baseline

B verified on 2026-10-14 13:05–13:09 (`b-round-38/gates.txt`):
- HEAD **`6c7b4bb`** (`feat(studio): refine relative fader drag and reset`), published on both remotes.
- `git status --short` shows only **17 untracked `.codex/agents/*.toml`** files. They are **root's** (created 2026-10-14 10:02): do not touch, delete or stage them.
- **New frozen list** `../tmp/studio-real-loop/b-round-38-tree-sha256.txt` → **380 OK**. It is round 37's list:
  - **minus** `ArrangementContext.tsx` and `ArrangementDetailPanel.tsx`;
  - **plus** the 6 round-38 code/test files (`ArrangementLane.tsx`, `ArrangementMaster.tsx`, `fader-guards.test.tsx`, `fader.ts`, `useRelativeFaderDrag.ts`, `fader-click.test.tsx`).
- Protected 4/4 OK; tsc 0; build ✓; vitest **70 files, 1290/1290**.
- Biome `./app`: **2 errors**. Both are the CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`; they are root's, so **do not touch** them. There are also 218 warnings and 1 info. Your files must add 0 errors.
- **Dispatch snapshots** of your 3 existing files (`../tmp/studio-real-loop/b-round-38-snapshots/`, `SHA256SUMS.txt` inside):

  | File | sha256 (first 8) |
  |---|---|
  | `app/contexts/ArrangementContext.tsx` | `06338774` |
  | `app/components/arrangement/ArrangementDetailPanel.tsx` | `a48523be` |
  | `docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md` | `263325b9` |

- **B's scratch probe** (`../tmp/studio-real-loop/b-round-38/probe/`, a copy of `app/` outside `store/`):
  - With the final design (`probe-context-v2.diff` + `probe-panel.diff`), vitest gives **1289 passed + 1 timeout** (`probe-v2-run.txt`). The timeout is `track-layout` "folds a lane…", 5450 ms under full-suite load; that file re-run alone gives 36/36 twice.
  - The earlier wrapper variant (`probe-context.diff`) gave 1290/1290, but Biome flagged **≈27 new `useExhaustiveDependencies` warnings**: a wrapped `setStatus` is no longer a stable setter. So it is **rejected**; see §0.2 decision 1.
  - The v2 behaviour probe (`probe-st.test.snippet`): the old code keeps the refusal; v2 restores `X` (S1, S5) and keeps `Y` (S3).
  - **No frozen test pins the stale status, the missing marker or the flush order.**
  - These diffs show that the design is feasible. They are not code to copy, and they contain no tests.
- If root commits again before you start, record the new HEAD. Check that `b-round-38-tree-sha256.txt` is still 380 OK and that none of your 3 files differs from its snapshot. If one does, **stop and report**.

Rules:
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's.
- Only root commits or pushes.

## 0. Scope

### 0.1 The contract (D-29z4)

**Status line** (`ArrangementContext.tsx`). A *refusal status* is `GESTURE_EDIT_BLOCKED_MESSAGE` (l.134) or `GESTURE_UNDO_BLOCKED_MESSAGE` (l.133).

| Situation | Result |
|---|---|
| Any non-refusal status is shown (committed to state) | It is remembered as the **last non-refusal status** L. |
| A refusal is shown | Unchanged: it shows immediately. L is not overwritten. |
| A second refusal (of either kind) | The status shows that refusal; L is unchanged. |
| The pointer-gesture count returns to **0** (the last gesture ends by commit, cancel, abort, window blur or any `release`) **and the current status is a refusal** | The status becomes **L**, exactly as it was. |
| The count returns to 0 and the current status is **not** a refusal (another status T was set after the refusal) | **T** stays. |
| Refusal → T → a second refusal → release | The status becomes **T** (the most recent non-refusal status). |
| The count drops from 2 to 1 | No change: the refusal stays while any gesture is still active. |
| A gesture starts and ends with no refusal | The status does not change. |
| A refusal set when no gesture is active (not expected today) | It stays, as today. Nothing is restored later. |

- The status is **never set to an empty string** by this mechanism.
- The exposed `setStatus: (message: string) => void` signature (l.290) **does not change**.
- Every refusal reaches the status through `setStatus`: the context's `refuseEditDuringGesture` (l.596), `undo`/`redo` (l.1837/1850), the Lane/Master `refuseFaderPress`, and the detail panel l.288/334/373. So all of them are covered without touching their call sites.

**Unsaved Clip Gain marker** (`ArrangementDetailPanel.tsx`, the Clip Gain field only).

| Situation | Result |
|---|---|
| The field is enabled (`clipGainReason === null`) and its **raw** text `clipGainText` ≠ `clipGainInputText(selection.clip.gainDb)` | This is the same raw comparison as the blur early return at l.330. Then: <br>• the input gets `data-pending="true"`; <br>• its border uses the `warning` design token (`border-warning`) instead of `border-outline`; <br>• the text **`შეუნახავია — Enter ინახავს, Esc აბრუნებს`** is shown below the `0 dB` button, as a `<p>` with `data-testid="arrangement-detail-clip-gain-pending"` and a `useId` id; <br>• the input's `aria-describedby` points to that id. |
| The text equals the stored text, or the field is disabled | No `data-pending` attribute, no pending element. `aria-describedby` is exactly as today (the reason id when disabled, otherwise `undefined`). |
| Typing, then Enter (commit), Escape (revert), the 0 dB reset, Enter refused during a gesture (the text reverts), or a blur that commits or reverts | The marker follows the text: it disappears exactly when the text equals the stored text again. |
| Blur during another gesture (the D-29z2 kept text) | The text is kept, so **the marker stays**. This is the C-R37-01 fix. |
| Selecting another clip | The content remounts (`key` = clip id, l.803), so the kept text and the marker disappear. Unchanged behaviour. |

- **Layout:** the detail panel's outer height must not change when the marker appears, at 1440×900 or at 1280×720 with the panel expanded.
  - The marker line shares the slot that the disabled-reason line uses: the two never show together.
  - If the line would grow the panel, keep the `data-pending` attribute, the border and the `aria-describedby`, and render the text with `sr-only` plus a `title` on the input instead. Report which variant you used, and why.
- Use design tokens only: `border-warning`, `text-warning`, or `text-dim` if `text-warning` fails contrast. Use no hardcoded colour and no custom CSS.

**Pending preview order** (`ArrangementContext.tsx` `previewTrackVolume`, l.2057–2071):
- When `previewTrackVolume` is about to **start** a new pending Volume preview (`volumeBeforeRef.current` is `null`), it first calls `flushPendingMaster()`.
  - This mirrors `previewMasterGain`, l.2307–2309.
  - It happens after the existing refusal guard, so a refused preview flushes nothing.
- A continuing Volume preview (the ref is already set) flushes nothing.
- Nothing else in `applyEdit`, `undo`, `redo` or the begin* functions changes.

**Unchanged** (C checks these):
- the round-38 no-jump press, relative drag and double-click;
- the round-36 root capture;
- the D-29z2 kept text and the Enter-during-gesture revert;
- the raw-text early return;
- Undo/Redo refusal during a gesture (D-20);
- keyboard entries;
- Delete/Backspace on a focused fader (no-op);
- the Pan suppression;
- live audio.

### 0.2 Decisions (D-29z4)

1. **Where the restore lives:** in the context, and **the raw `useState` setter stays untouched**.
   - A `useLayoutEffect([status])` copies every non-refusal status into a ref (`lastNonRefusalStatusRef` or a similar discoverable name).
   - Where `beginPointerGesture`'s release takes the count to 0 (l.1322–1325), call the functional form `setStatus((current) => (isRefusal(current) ? ref.current : current))`.
   - The functional updater sees a refusal queued in the same `act` or tick (probe "S1-same-act").
   - **Do not wrap `setStatus` in a `useCallback`.** A wrapper is not a stable setter for Biome, and it adds ≈27 `useExhaustiveDependencies` warnings (B probe). Fixing those would mean touching ~15 deps arrays outside scope.
   - Do not add per-call-site restores.
   - Do not use timers.
   - Do not clear the status on `applyEdit`: a later edit with no status of its own would then blank the line.
   - **Accepted edge:** `claimPointerGesture`'s same-pointer re-claim (l.1333–1341) releases the old gesture before it counts the new one. So the count touches 0 for an instant and the restore runs during that hand-off. This is harmless, because the refusal condition really did end. Record it in doc 038's problems list.
2. **C-R37-01 part 3 is accepted** and not changed. The kept text keeps its D-29z2 semantics.
3. **No frozen-test amendment is authorised.** B's probe shows none is needed. **Any frozen test that fails = stop and report.** Do not amend it.
4. **Out of this round** (queued, not deferred scope):
   - group 2, round 40: A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES;
   - group 3, round 41: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH;
   - group 4, round 42: MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER;
   - 4c: round-9 M1/L8, PREVIEW-VOLUME-IDENTITY;
   - polish: C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE;
   - A-R38-REVIEW-TOUCH (Tech Lead R38-T first).
5. **Rejected:**
   - (a) Clearing the refusal on any successful history entry: a Volume drag sets no status, so the line would go empty or keep stale text.
   - (b) Restoring after a timeout: this is time-dependent, and the user may still be dragging.
   - (c) Auto-committing the kept Clip Gain text on the next edit: it amends D-29z2 and writes a value the user did not confirm.
   - (d) A modal or toast for the unsaved text: too heavy.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks):**
- every refusal path (fader press, double-click, Mute/Solo/Pan/Clip Gain during a gesture, Undo/Redo during a gesture, detail range Apply);
- the status after commits;
- the Clip Gain flows of rounds 34–38 (CG-1, CR-1..4, MN-CR36, KEPT);
- Volume/Master keyboard entries and Undo;
- the detail panel geometry;
- the frozen suites `clip-gain`, `detail-panel`, `detail-panel-polish`, `gesture-guard`, `fader-guards`, `fader-click`, `track-pan`, `master-ui`, `track-layout`, `delete-selection-ui` and `ArrangementContext.test.ts`.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives in full, before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-test.md` and `prompts/studio-feature.md`;
   - then run the `pre-flight` skill.
2. **Check the baseline and report it before any edit:**
   - `git rev-parse HEAD`;
   - `git status --short` (the 17 root `.codex` lines, or root's newer state);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-38-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - your 3 files against the snapshot shas;
   - protected 4/4;
   - `node.exe`.
3. **Read:**
   - `ArrangementContext.tsx`:
     - l.133–134;
     - l.290;
     - l.473 (`status` state);
     - l.596–602;
     - l.922–967 (`flushPending*`, `applyEdit`);
     - l.1314–1376 (`beginPointerGesture`, `claimPointerGesture`);
     - l.1836–1860 (`undo`/`redo` refusals);
     - l.2057–2110 (Volume preview/commit);
     - l.2302–2347 (Master preview/commit);
   - `ArrangementDetailPanel.tsx`:
     - l.105–107;
     - l.217–382;
     - l.495–536;
     - l.800–806;
   - `app/styles/app.css` l.64–78 (the `warning`, `accent` and `dim` tokens);
   - B's probe files `b-round-38/probe-context.diff`, `probe-panel.diff`, `probe-order.test.snippet`, `probe-all-run.txt`;
   - `c-round-37.md` §9 (C-R37-01) and `c-round-38.md` §6–§7 (DC-G, MN-G, MN-CR36).
4. **Re-check (report each):**
   - Every `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` / `setStatus(GESTURE_UNDO_BLOCKED_MESSAGE)` call site (grep `app/`) sets the context's `status` state; the Lane/Master/DetailPanel get `setStatus` from `useArrangement()`. If one keeps its own status state, **stop and report**.
- Run `npx biome check app/contexts/ArrangementContext.tsx` before and after: there must be no new diagnostic.
   - `beginPointerGesture`'s release is the only place where the count goes down. If another path decrements `gestureCountRef`, list it and cover it.
   - Grep the frozen suites for status assertions after a gesture release. B's grep found 34 `GESTURE_EDIT_BLOCKED_MESSAGE` assertion sites, and B's probe kept them all green. If your implementation turns one red, **stop and report**.
   - The `useCallback` deps of `beginPointerGesture` and `previewTrackVolume` stay correct (Biome `useExhaustiveDependencies` must not add an error).
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 `ArrangementContext.tsx`

- Keep `const [status, setStatus] = useState(…)` exactly as it is.
- Add one ref for the last non-refusal status, initialised to the initial status, and one `useLayoutEffect([status])` that updates it for non-refusal values.
- In `beginPointerGesture`'s release, when the count reaches 0, call `setStatus` with the functional restore of §0.2 decision 1.
- Biome must report no new diagnostic in this file. B's probe of this design: `Checked 1 file … No fixes applied`.
- Use the names from `AGENT_DISCOVERABLE_CODE.md`. Do not add code comments, and do not add an exported API.
- In `previewTrackVolume`, when `!volumeBeforeRef.current`, call `flushPendingMaster()` before taking `historyRef.current`. Add `flushPendingMaster` to its deps.
- Nothing else in the file changes.

### 2.2 `ArrangementDetailPanel.tsx`

- Add one `useId` for the pending text, plus the derived `isClipGainPending` (`clipGainReason === null && clipGainText !== clipGainInputText(clipGainDb)`).
- On the input: `data-pending`, the conditional border class (`cn` is already imported, l.37), and `aria-describedby`.
- Add the pending `<p>`.
- Nothing else in the file changes.

### 2.3 Doc 037 (narrow)

- **Only** the `**სტატუსი:**` line: `Completed. Round 38 C PASS (c-round-38.md); Tech Lead R38-T ღიაა.`
- Plus one line in its TODO section that points to D-29z4 / doc 038 for 4b-2 group 1.
- Nothing else.

### 2.4 Doc 038 (`docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md`, new)

Write it per `docs/implementation/TEMPLATE.md` and `GEORGIAN_DOCS.md`. It covers:
- the date, the status and the project;
- the context, with C's evidence (C-R37-01 KEPT-1/2, DC-G/MN-G) and B's probe (pending order: Master stays −3);
- the contract tables of §0.1;
- the rejected alternatives a–d;
- the layout decision (visible text or the `sr-only` variant);
- the files;
- problems → solutions;
- the tests, with red/green numbers;
- the C IDs;
- the Ableton table of §4.8;
- the TODO for groups 2–4.

### 2.5 Tests (red-first, in `store/`)

**New file:** `app/lib/arrangement/__tests__/pending-status.test.tsx`.
- Mount the provider or workspace the way `ArrangementContext.test.ts` / `fader-guards.test.tsx` / `clip-gain.test.tsx` do. Copy what you need; do not import from another test file.
- Before you write the implementation, write every case and run it against the **current** source. Record the red/green result per case in `a-round-39/red-run.txt`.
- Must-not cases are expected green on the old source; say so.

| ID | Case | Expected |
|---|---|---|
| S1 | `setStatus('X')`; `beginPointerGesture()`; `toggleTrackMute(id)` (refused) | During the gesture: blocked. After release: `'X'`. 0 entries |
| S2 | `setStatus('X')`; one entry exists; gesture; `undo()` | During: `GESTURE_UNDO_BLOCKED_MESSAGE`. After release: `'X'`. The entry is still present |
| S3 | `'X'`; gesture; refusal; `setStatus('Y')` during the gesture; release | `'Y'` (must-not restore) |
| S4 | `'X'`; two gestures (count 2); refusal; release one | Still blocked. Release the second: `'X'` |
| S5 | `'X'`; gesture; edit refusal, then undo refusal; release | `'X'` |
| S5b | `'X'`; gesture; refusal; `setStatus('T')`; second refusal; release | `'T'` (the most recent non-refusal) |
| S6 | `'X'`; gesture with no refusal; release | `'X'` (must-not; green on old source) |
| S7 | UI: claimed gesture 41 (`claimPointerGesture` or a separator); `fireEvent.pointerDown` on music Volume (refused by the round-38 hook); `windowPointer('pointerup', 41)` | `arrangement-status` text: blocked, then the prior text |
| S8 | `claimPointerGesture(41, abort)`; refusal; `window.dispatchEvent(new Event('blur'))` | The status returns to the prior text; `isPointerGestureActive()` is false |
| S9 | UI: Clip Gain `3` typed; gesture 41; field blur (kept) | Status blocked. After release 41: the prior status. The field still shows `3` and the marker |
| PM1 | SFX clip selected; type `3` in Clip Gain | `data-pending="true"`; the pending element has the exact text; `aria-describedby` = its id; the class contains `border-warning`, not `border-outline` |
| PM2 | PM1 then Enter | 1 `Clip Gain` entry; no `data-pending`, no pending element, `aria-describedby` absent |
| PM3 | PM1 then Escape | No marker; text `0.0`; 0 entries |
| PM4 | Type `0` over stored `0.0` (raw differs) | Marker shown. Blur: 0 entries, text `0.0`, marker gone |
| PM5 | A video clip selected, or a group selection | No pending element; `aria-describedby` = the reason id (must-not) |
| PM6 | Commit `3` with Enter first (the reset button is disabled while the gain is unset, l.519), type `5`, click the `0 dB` reset | Stored 0, text `0.0`, marker gone; +1 `Clip Gain` for the reset |
| PO1 | `previewMasterGain(-3)`; `previewTrackVolume(trackId, 0.5)`; `toggleTrackMute(otherTrack)`; then `undo()` ×3 | `undoLabel` before each undo: the Mute label, `Volume`, `Master Volume`; at the end, Master `0` and that Volume `1` (red on old: Master −3) |
| PO2 | Volume preview first, then Master preview, then Mute, undo ×3 | Labels: Mute, `Master Volume`, `Volume`; at the end, Master 0 and Volume 1 (must-not; green on old) |
| PO3 | No Master pending: `previewTrackVolume` + `commitTrackVolume` | Exactly 1 `Volume` entry |

**Rules:**
- no `any`, no `@ts-ignore`, no type assertions, no comments;
- exact strings imported from the source where they are exported (`GESTURE_*`);
- no snapshot tests;
- no timers unless the case needs them.

### 2.6 After the code

- **Self-check:** the frozen suites of §4.9 are green, and the full `npx vitest run` passes (1290 + your new `it` count).
- **Biome:** run `npx biome check --write` **only** on your 3 TS/TSX files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (≥ 3 files). Report its findings and your dispositions.
- **Browser smoke** (A, one run allowed if the server is up; `a-browse.json`), not a PASS claim:
  - type `3` in Clip Gain on the SFX clip → the marker is visible; record the detail panel height before and after;
  - Enter → the marker is gone.
- **Mutations:** only in a scratch copy outside `store/`, never in place. A may skip them; they are C's.
- **`/check`:** run `npm run verify`. Do not run `npm run test:e2e:smoke`: it starts its own dev server. Say so in the report.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `6c7b4bb` with only the 17 root `.codex` lines in `git status`, or a newer root commit that contains it.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/contexts/ArrangementContext.tsx` | A | §2.1 only: the last-non-refusal ref + layout effect, the release restore, the `previewTrackVolume` flush |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | §2.2 only: the Clip Gain field marker |
| `app/lib/arrangement/__tests__/pending-status.test.tsx` | A | new (§2.5) |
| `docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md` | A | new (§2.4) |
| `docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md` | A | §2.3 only (the status line + one TODO line) |
| `../tmp/studio-real-loop/a-round-39.md`, `a-round-39/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-39.md`, `c-round-39.json`, `c-round-39/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

`a-round-38/` and `c-round-38/` are read-only now. `b-round-38/probe/` is B's: do not edit it, but you may read it.

**Expected `git status --short` at the end** (root has not committed): your **5** lines plus root's 17 `?? .codex/agents/*.toml` (or whatever root decided; record it).
- ` M` for `ArrangementContext.tsx`, `ArrangementDetailPanel.tsx` and doc 037;
- `??` for `pending-status.test.tsx` and doc 038.

If root commits mid-round, record it and check every line against this section.

### 3.3 Frozen this round

- All **380** files in `b-round-38-tree-sha256.txt`, and everything else under `store/`.
- This includes:
  - `ArrangementLane.tsx`, `ArrangementMaster.tsx`, `useRelativeFaderDrag.ts`, `fader.ts`;
  - `StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `model.ts`, `graph.client.ts`, `app/hooks/index.ts`;
  - every existing test file: `fader-guards`, `fader-click`, `gesture-guard`, `track-pan`, `master-ui`, `clip-gain`, `detail-panel`, `detail-panel-polish`, `track-layout`, `delete-selection-ui`, `ArrangementContext.test.ts`;
  - docs 001–036.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting earlier work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewport:** 1440×900 with the detail panel expanded (a real click on `arrangement-detail-toggle`), plus the 1280×720 spot checks named below.

**Harness rules (unchanged):**
- **REAL** = `$B click` at the element centre, or `$B press` / `$B type`.
- **SYNTHETIC** (label it): pointer events at computed coordinates, the separator gesture (id 41), window `pointerup`/`pointercancel`/`blur`, `dblclick`, `blur()`.
- C may hook browser APIs and read state through the existing `window.__c` reader; label it.
- No source instrumentation. Mutations only in a scratch copy outside `store/`.
- Every run and gate records `node.exe`.

**Layout L39** = L38: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4.

Before and after every step, record:
- the `arrangement-status` text;
- `history.past.length` and the tail;
- the Clip Gain text, `data-pending` and the pending element;
- `document.activeElement`;
- `isPointerGestureActive` when readable.

**Checkpoint order if the session may end:** G39-2 → R39-S → R39-ST → R39-PM → R39-MN → R39-CR → R39-U → the rest. Write `c-round-39/checkpoint.md` as you go.

### 4.1 R39-ST — the refusal status returns (REAL inputs, SYNTHETIC gesture)

| Case | Steps | Expected |
|---|---|---|
| ST-1 | Record the status S. Synthetic separator 41 held → a REAL click on music Volume. | Blocked, 0 entries. After synthetic window `pointerup` 41: status = **S** exactly (read once immediately and once ≥ 100 ms later); 0 entries; the gesture flag is false. Compare round 38 (`c-round-38.md` §6: the blocked status persisted) |
| ST-2 | Make one entry first (a REAL click on Mute music); record S. Separator 41 → REAL `Ctrl+Z` | `Undo/Redo drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, the entries are unchanged. After `pointerup` 41: S. Then a REAL ruler click + REAL `Ctrl+Z` undoes normally (`Undo: …`) |
| ST-3 | DC-G replay: separator 41 → synthetic `dblclick` on music Volume (0.75 after a synthetic DR-V) | Blocked, value 0.75, 0 entries. After release: S |
| ST-4 | Separator 41 → REAL click on Master (blocked) → synthetic `window` `blur` event | Status S, gesture false, Master unchanged, 0 entries |
| ST-5 | Separator 41 → REAL click on music Volume (blocked) → while still held, any action that sets a **new non-refusal status** (C chooses one and names it, e.g. a REAL library preview click; if none exists during a gesture, write "unit only: S3") → release | That new status stays |
| ST-6 | Separator 41 held, no refused action, then release | The status is unchanged |
| ST-1280 | ST-1 once at 1280×720 | As ST-1 |

### 4.2 R39-PM — unsaved Clip Gain marker (REAL)

| Case | Steps | Expected |
|---|---|---|
| PM-1 | A REAL click on the SFX clip header, a REAL click into Clip Gain, REAL type `3` (no Enter) | `data-pending="true"`; the pending text is exactly `შეუნახავია — Enter ინახავს, Esc აბრუნებს` and visible; `aria-describedby` → its id; the input border computed colour = the `--color-warning` token (`rgb(245, 158, 11)`); screenshot. **Geometry:** the outer height of `[data-testid=arrangement-detail-panel]` and the top of the first lane before typing = after typing (± 0 px). If A used the `sr-only` variant, the text is not visible but is exposed through `aria-describedby`; record which |
| PM-2 | REAL Enter | +1 `Clip Gain`, status `Clip Gain: Soft impact — +3.0 dB.`, no marker |
| PM-3 | REAL type `5`, REAL Escape | Text `3.0`, no marker, 0 entries |
| PM-KEPT | C-R37-01 replay: REAL type `6` (no Enter) → synthetic separator 41 → a REAL click on Master | The field keeps `6` **with the marker**; status blocked; 0 entries. After `pointerup` 41: status = the status before the refusal (**not** blocked); the marker stays. Then a REAL click on music Volume → 0 entries (no jump), the marker stays, the status is not blocked (round 37 KEPT-2 had a stale blocked status). Then a REAL click into the field + REAL Tab → +1 `Clip Gain` `+6.0 dB`, no marker |
| PM-RAW | Stored `3.0`; REAL type `3` (raw differs) | Marker shown. After a REAL Tab: 0 entries, text `3.0`, no marker (C-R37-02 raw comparison) |
| PM-VID | Select the video clip | The Clip Gain field is disabled, no marker |
| PM-1280 | PM-1 at 1280×720 | As PM-1 (screenshot + geometry) |

### 4.3 R39-PO — pending preview order (unit + mutation; no browser path)

- The order needs a pending Master preview that survived a blur during a gesture. The harness cannot build that pending state honestly without source instrumentation.
- So R39-PO is: green PO1–PO3, PO1 red on the snapshot source (C re-runs A's red file against `b-round-38-snapshots/ArrangementContext.tsx` in scratch), and mutation (g).
- Label it **"unit-only"**. Do not mark it as browser-verified.

### 4.4 R39-MN — must-not

| Case | Expected |
|---|---|
| MN-1 | A synthetic DR-V drag on music Volume with no refusal: the status before = after; one `Volume` entry |
| MN-2 | R38 PG-V and PG-M once (REAL click): no jump, 0 entries, focus on the fader |
| MN-3 | MN-CR36 replay: Clip Gain `3` typed → separator 41 → REAL click on Master: the field keeps focus and `3` (with the marker), status blocked, 0 entries. After `pointerup` 41: status = the pre-refusal status. A REAL Enter → +1 `Clip Gain`, status `Clip Gain: Soft impact — +3.0 dB.` |
| MN-4 | Keyboard: a REAL Tab onto music Volume + REAL ArrowLeft → +1 `Volume`; Master ArrowDown → +1 `Master Volume`; REAL ruler click + REAL Ctrl+Z ×2 → both undone in reverse order |
| MN-5 | Detail range Apply during separator 41 → blocked; after release → the prior status (the same mechanism; the detail-panel refusal site) |

### 4.5 R39-CR — rounds 33–38 regression

- **CR-1:** Clip Gain `3` (no Enter) → a REAL click on music Volume → `[…, Clip Gain]` only, focus on music Volume, no blocked status.
- **CR-4:** CG-1: Clip Gain `3` → a REAL click on the music header → +1 `Clip Gain`, focus BODY; Delete deletes the music clip.
- **PG-DEL:** select the SFX clip → a REAL click on music Volume → REAL Delete → not deleted, 0 entries.
- **D-20:** Undo during a gesture is still refused (ST-2 covers this).

### 4.6 R39-K — adjacent

- Mute/Solo/Master Mute REAL clicks: one entry each.
- The Clip Gain 0 dB reset: +1, the marker gone.
- Lane height drag (synthetic): no fader entry.
- Space toggles playback with focus on a fader.

### 4.7 R39-S, R39-U, R39-Doc

**R39-S** (static, read-only): `diff -u` of `b-round-38-snapshots/` against the live files.
- **`ArrangementContext.tsx`:** changes only:
  - one ref + one `useLayoutEffect` near l.473; the raw `useState` line is unchanged;
  - the count-0 branch of `beginPointerGesture`'s release;
  - `previewTrackVolume` and its deps.
- **`ArrangementDetailPanel.tsx`:** changes only:
  - the pending id/derived value;
  - the Clip Gain input attributes/class;
  - the pending `<p>`.
- **Doc 037:** only the status line and one TODO line.
- 380 OK; the new files exist.
- No `any`, no `@ts-ignore`, no type assertion, no new `//` comment, no hardcoded colour.

**R39-U:**
- The new tests are green, and A's red run matches §2.5: S1, S2, S4, S5, S5b, S7–S9, PM1–PM4, PM6 and PO1 are red on the old source; S3, S6, PM5, PO2 and PO3 are green (S3 is green on old code, because it shows the newer status, as B's probe confirmed).
- **Mutations** in a scratch copy outside `store/`. Each must make a test fail; report which.

| # | Mutation | Must be caught by |
|---|---|---|
| (a) | No restore at count 0 | S1, S7 |
| (b) | Restore even when the current status is not a refusal | S3 |
| (b2) | Remember the status from before the first refusal instead of the most recent non-refusal | S5b |
| (c) | Restore when the count drops from 2 to 1 | S4 |
| (d) | Treat only the edit refusal (not the undo refusal) | S2, S5 |
| (e) | The marker condition is always false | PM1, S9 |
| (f) | The marker shows while the text equals the stored text | PM2, PM3 |
| (g) | Remove the `flushPendingMaster()` in `previewTrackVolume` | PO1 |

**R39-Doc:**
- Doc 038 covers §2.4, matches the code, and its Ableton table matches §4.8.
- Doc 037 changed only as §2.3 says.

### 4.8 Ableton source and compliance (workflow addendum 2026-10-11)

Live 12 Reference Manual, captured with gstack `/browse`:
- §5.4.2 "Accessing a Set's Undo History": https://www.ableton.com/en/live-manual/12/managing-files-and-sets/, 2026-10-14, `b-round-38/ableton-managing-files-and-sets-20261014.txt`;
- §3.2 "The Status Bar": https://www.ableton.com/en/live-manual/12/live-concepts/, 2026-10-13, `b-round-37/ableton-live-concepts-20261013.txt`.

No video was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| History entries follow the order in which the actions happened | §5.4.2: "you will see all the actions in the order they occurred, with the newest at the top" | **Confirmed** as a principle | The pending Master preview is committed before a newer Volume preview, so Undo reverses them in order | R39-PO (unit-only) |
| A temporary refusal message disappears once its condition ends | §3.2: "The Status Bar displays useful information like error messages…"; nothing about when a message clears | **Unconfirmed** | CZABA decision: return to the previous status when the last gesture ends | R39-ST |
| An unsaved value-box entry is marked | no source text found | **Unconfirmed** | CZABA requirement (C-R37-01) | R39-PM |

C gives two verdicts per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). Never write "Ableton does it this way" for an unconfirmed row.

### 4.9 Gates

**G39-1:**
- tsc 0;
- vitest = 1290 + the new `it` count, 0 failures (record `node.exe`; on a timeout under load, re-run that file alone and report both runs);
- build passes;
- Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218 + 1 info;
- green: `pending-status.test.tsx`, `fader-guards.test.tsx` (71), `fader-click.test.tsx` (26), `gesture-guard.test.tsx`, `track-pan.test.tsx`, `master-ui.test.tsx`, `clip-gain.test.tsx`, `detail-panel.test.tsx`, `detail-panel-polish.test.tsx`, `track-layout.test.tsx`, `delete-selection-ui.test.tsx`, `ArrangementContext.test.ts`.

**G39-2:**
- protected 4/4 OK;
- `sha256sum -c b-round-38-tree-sha256.txt` → 380 OK;
- `git status --short` = §3.2;
- HEAD at the start and the end.

**G39-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (during R39-ST/PM);
- media is only the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: root `CartContext` `GET /api/cart`, root GA consent-denied events, the dev-module requests, the homepage hero image from `images.unsplash.com`.

**Not re-run this round** (not PASS):
- exports and WAV integrity;
- PUI geometry beyond the detail panel;
- video sync and the C-R27-01 table;
- the full find sound → add → fit video → export flow;
- the FB-01..FB-16 stage regression.

### 4.10 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 + C-R38-01 (Tech Lead; record the NUL count and offsets from `curl -s http://127.0.0.1:5173/studio-lab`, and the two `aria-label`s in the hydrated DOM; round 38: 5 NUL at 11729, 28025/28026, 58745/58746, 63 611 bytes; any byte change in A's files may move them);
  - C-R30-01 (polish).
- **Open low items:** R26-M1; 4b-2 groups 2–4 (§0.2); A-R38-TEST-ORDER; R9-REVIEWER-M1-L8; PREVIEW-VOLUME-IDENTITY; A-R34-REVIEW-RESIDUALS; DEMO-SFX-FULL-SCALE; L3-REMOVED-TRACK-TAPS; LIB-SEP-REASON; DOC034-UNREACHABLE-NOTE; DOC035-NOTES; DOC036-R37-TAIL; DOC036-ROUND-REF; DOC015-DELETE-GAP-NOTE; EXPORT-DIALOG-FOCUS-RESTORE.
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `checkpoint-r38-review.md`):
  - rounds 31–38 are committed (`134b4ab`, `6c7b4bb`); round 39 becomes ready for a checkpoint only after C PASS;
  - the 17 untracked `.codex/agents/*.toml` files (root decides);
  - `npm run test:e2e:smoke` (root only);
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS;
  - the CRLF Biome errors on the auth files;
  - the `frontend-architect.md` Write/Bash grant;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - fake Bearer → 500;
  - the CDP allowlist (it blocks a real dblclick/drag/touch);
  - `Content-Type` without a charset;
  - the dev server's availability.
- **Tech Lead manual checks** (`feature-status.md` §5): R38-T, now live, including the A-R38-REVIEW-TOUCH touch-jump check; R35-T, R30-T, R31-T, R33-T, R34-T and TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-38-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/contexts/ArrangementContext.tsx app/components/arrangement/ArrangementDetailPanel.tsx docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md
npx vitest run app/lib/arrangement/__tests__/pending-status.test.tsx
npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-click.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-38-snapshots/ArrangementContext.tsx app/contexts/ArrangementContext.tsx
diff -u ../tmp/studio-real-loop/b-round-38-snapshots/ArrangementDetailPanel.tsx app/components/arrangement/ArrangementDetailPanel.tsx
diff -u ../tmp/studio-real-loop/b-round-38-snapshots/037-studio-lab-fader-click.md docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest.
- Do not create test files other than `pending-status.test.tsx`.
- C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- If it is down, write that into the report and do the offline items (G39-1/2, R39-S, R39-U, R39-PO, R39-Doc).
- Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-39.md`:**
1. the pre-flight gate, including the §1.4 re-checks;
2. the red run (per case) and the green run;
3. the diff summary per file;
4. the layout variant chosen (visible text or `sr-only`), with the measured panel height;
5. the code-reviewer findings and your dispositions;
6. the verbatim command tails, including `node.exe`;
7. the deviations and the §2.6 self-check results;
8. the optional browser smoke.

Do not claim PASS. If you hit a stop condition, stop and report. Do not widen or narrow the change to avoid it.

**C → `c-round-39.md` and `c-round-39.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the R39-ST table with the exact status strings before, during and after;
- the R39-PM table with screenshots and geometry;
- the R39-PO unit-only verdict;
- the mutation table;
- the Ableton two-verdict table (§4.8);
- the gates, the C-R23-01/C-R38-01 record and the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01 / C-R38-01** as soon as the Tech Lead answers. **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **A-R38-REVIEW-TOUCH:** if R38-T confirms a touch jump, B schedules the pre-specified fix: a non-passive `touchstart` + `preventDefault` on Volume, Pan and Master, with Zoom excluded.
- **Round 40 — 4b-2 group 2 (Pan, Lane only):**
  - a `keydown` on the Pan slider clears the blur suppression, so a lost release no longer kills the keyboard (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK). A `change` without a keydown stays ignored, so frozen `fader-guards` l.363–430 stay green;
  - the Lane's Pan bookkeeping also ends on `window` `blur`: the draft is cleared and the cleanup ref is set to null (A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES).
- **Round 41:** FADER-KEY-ENTRIES (re-read C's R30-K record first; do not assume a timer coalescing), A-R29-REVIEW-1, A-R33-REVIEW-TOUCH.
- **Round 42:** MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER.
- **Then:**
  - 4c (round-9 M1/L8, PREVIEW-VOLUME-IDENTITY) + polish;
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 39 -StartPhase A` and a higher limit.
