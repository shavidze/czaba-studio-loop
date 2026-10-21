# CURRENT TASK — Round 32: C bugs first — keys and pointers on faders (C-R31-02, C-R31-01, R31-U-GAP-B2)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-13
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorization 2026-10-13).
- Decision record: **D-29w** in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-31.md`.
- Round size: **three tightly related bugs** (workflow rule "one feature or at most three related bugs"). No feature work this round.

> **Environment prerequisite (root, not BLOCKED):** the dev server `http://127.0.0.1:5173/studio-lab` answered **200** when B planned (2026-10-13 ~13:15 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** B counted **7** `node.exe`. Every A and C run records the count (`tasklist | grep -ci node.exe`).

## Why this round

C round 31 (`c-round-31.md`, `c-round-31.json`) is a **PASS** on every dispatched ID (G31-1..3, R31-PE..Doc; vitest 1193/1193; mutations a–k killed). B re-ran the gates independently (`b-round-31/gates.txt`): 371 OK, protected 4/4, tsc 0, vitest 68 files / 1193, build ✓, Biome 2 baseline CRLF errors + 218 warnings.

C reported three findings. All three are about **keys and pointers on a fader**, they touch the same two handlers, and they are fixed before stage 4b (fader UX), which will rework the same code:

| ID | Severity | What | Where |
|---|---|---|---|
| **C-R31-02** | **Medium** (pre-existing, confirmed in the browser) | With a clip selected, Delete/Backspace on a focused **Volume** slider deletes the clip (undoable). By code reading the same holds for Master and Zoom. | `StudioWorkspace.tsx` window keydown: the Delete branch (l.1135–1141) has no slider guard |
| **C-R31-01** | Low (round-31 code) | Blur during a Pan drag cancels correctly. But if the same pointer is still held and `input` keeps firing, **each** input becomes its own history entry (past 72 → 73 → 74). | `ArrangementLane.tsx`: `handlePanBlur` nulls the drag refs, so `handlePanChange` falls into the keyboard branch |
| **R31-U-GAP-B2** | test gap | Removing the override term in `syncPlayback`'s non-reschedule pan push kills no test. | `ArrangementContext.tsx` l.905–911 |

C-R31-02 is not data loss (Undo restores the clip), so severity alone does not make it preempt. It goes first because it is a confirmed Medium bug, and stage 4b must not be built on top of a fader that edits the timeline.

**References:**
- Backlog v33: `backlog.json` (`open_findings` C-R31-01, C-R31-02, R31-U-GAP-B2; `rounds` 32; SRW-13 `decisions_round32`).
- Progress board: `feature-status.md`.
- C's reproduction material (read-only for A): `c-round-31/scripts/pg.js` (modes `blur-continue`, `vol-blur-continue`), `c-round-31/runs/volume-delete-key.txt`, `pg-blur-cancel.txt`, `pg-vol-blur-continue.txt`.
- A's round-31 report: `a-round-31.md` §4 (review findings), §6 (deviations).
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Previous round:** archived as `tasks/round-31.md` (`cmp`-identical to the dispatched round-31 task).

## Baseline

B verified on 2026-10-13 (~13:15):
- HEAD is **`1cefea1`**.
- `git status --short` = the **7** round-31 lines. C verified them; root has not committed them yet. Saved in `../tmp/studio-real-loop/b-round-31-git-status.txt`:
  ```
   M app/components/arrangement/ArrangementLane.tsx
   M app/contexts/ArrangementContext.tsx
   M app/lib/arrangement/graph.client.ts
   M app/lib/arrangement/model.ts
   M app/types/arrangement.ts
  ?? app/lib/arrangement/__tests__/track-pan.test.tsx
  ?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ```
- `sha256sum -c ../tmp/studio-real-loop/b-round-31-tree-sha256.txt` → **375 OK**.
  - It covers every tracked or untracked file under `app/` and `docs/implementation/` **except your 3 existing files** below.
  - It includes round 31's `ArrangementContext.tsx`, `graph.client.ts`, `model.ts`, `types/arrangement.ts` and `track-pan.test.tsx`. These are now frozen.
- Protected 4/4 OK; tsc 0; build ✓; vitest **68 files, 1193/1193**.
- Biome `./app`: **2 errors** + 218 warnings + 1 info.
  - Both errors are `format` errors (CRLF) on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. They belong to root.
  - **Do not touch those files.** Your files must add 0 errors.
- Dispatch snapshots of your 3 existing files are in `../tmp/studio-real-loop/b-round-31-snapshots/`:

  | File | sha256 (first 8) |
  |---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `d993cc97` |
  | `app/components/arrangement/ArrangementLane.tsx` | `718e0ca3` |
  | `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | `b8dfb711` |

- **If root commits before you start** (B recommended committing round 31 first), the new HEAD is the baseline:
  - record it;
  - check that `b-round-31-tree-sha256.txt` is still 375 OK. If root normalises the CRLF auth files, those lines may change; report that, and do not treat it as yours;
  - check that none of your 3 files differs from its snapshot. If one does, **stop and report**.

Rules for the baseline:
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's.
- Nobody but root commits or pushes.

## 0. Scope

**The contract after this round:**

| Action | Result |
|---|---|
| Delete or Backspace while focus is on a **native range input** (`input[type="range"]`: track Volume, track Pan, Master Volume, Zoom) | **Nothing** happens to the timeline: no clip or range deletion, no history entry, no status change. The workspace does not `preventDefault` the key. |
| Delete or Backspace anywhere else (lane body, clip, `document.body`, the playhead handle, the overview, the library preview scrubber) | **Unchanged** (SRW-24 contract: deletes the selection and leaves a gap). |
| Delete/Backspace on a focused range **while another pointer gesture is active** | Unchanged: the existing gesture-blocked status (`StudioWorkspace` l.1039–1058). C records it as information; it is not a bug. |
| Blur during a Pan drag, then the **same held pointer** keeps producing `input` | The blur has already reverted the pan with no entry. Every further `input` is **ignored** (no draft, no preview, no entry, no live change) until that pointer's window `pointerup`/`pointercancel`. The slider shows the stored value. |
| After that pointer is released | The slider works normally again: a new drag is one entry, a key step is one entry. |
| A new successful Pan `pointerdown` while the suppression is pending | Starts a normal drag and clears the suppression. |
| The same blur-and-continue sequence on **Volume** | **Unchanged** (today: one `Volume` entry on release). A reference test records it; changing it is not in scope. |
| `syncPlayback`'s non-reschedule pan push | Code unchanged. Accepted as defensive (§2.3); A verifies the reachability enumeration. |

**Decisions (B, D-29w), with the reasons:**
1. **Guard native range inputs only, not `role="slider"`.**
   - The bug is "a key on a fader edits the timeline". Faders are value controls; Delete has no meaning on them.
   - The `role="slider"` elements are timeline and navigation objects: the playhead handle (`ArrangementRuler.tsx:195`), the overview (`ArrangementOverview.tsx:280`) and the library preview (`ArrangementLibraryPreview.tsx:233`). A user who has just dragged the playhead and presses Delete expects the selection to be deleted.
   - Widening the guard to `isSliderTarget` would silently change the SRW-24 flow. The narrow guard is the smallest honest change.
2. **Remove A's round-31 deviation 1**, the Pan `onKeyDown` that stops Delete/Backspace propagation.
   - It was a workaround for the then-frozen `StudioWorkspace.tsx`. With the real guard it is dead code.
   - Worse, it would hide a broken workspace guard from the frozen `track-pan.test.tsx` Delete test. That test becomes the regression oracle for Pan.
3. **C-R31-01 = "ignore", not "coalesce".**
   - A blur means the drag was cancelled. Writing anything afterwards would undo the cancellation.
   - Real Chrome may never fire range `input` after a blur while the button is held; C used synthetic events. The fix is dispatched anyway because it is in round 31's own code, it is small, and it makes the lane's state honest.
   - The real-Chrome check stays with the Tech Lead (R31-T).
4. **R31-U-GAP-B2 is accepted; A does not hunt for a test.**
   - Every edit path is refused while a pointer gesture is active (`refuseEditDuringGesture`, l.596), and so are Undo/Redo (l.1837–1861).
   - The remaining `syncPlayback` callers during a gesture are force-reschedules, and `startGraph` honours the override (mutation (h) proves it).
   - So the non-reschedule override term is unreachable today. It stays as a guard against a future non-reschedule sync (stage 4b coalesced commits, SRW-18) snapping the live pan back mid-drag.
   - A verifies the enumeration (§1.4). If A finds a reachable path, A reports it (§2.3).

**In (A):** §2.1 (workspace guard), §2.2 (lane), §2.3 (enumeration, no code), §2.4 (a doc 036 section), §2.5 (one new test file, red-first).

**In (C):** §4.

**Not in this round** (each one is queued, not deferred scope):
- **stage 4b (round 33):**
  - the no-jump fader click;
  - double-click reset;
  - per-key entry coalescing (FADER-KEY-ENTRIES);
  - A-R29-REVIEW-1;
  - the pending-commit order;
  - MASTER-HOLD-TICK-EDGE;
  - **A-R31-REVIEW-2** (the lane's draft gate uses the global `isPointerGestureActive()`; visual only);
  - the refusal status that stays visible after a drag (C round 31 info);
  - Volume's own blur-continue behaviour, if 4b changes the gesture machine;
- **stage 4c + polish (round 34):** round-9 M1/L8, C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE;
- any change to `role="slider"` key handling.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- SRW-24 Delete/Backspace with a clip selection, with a range (gap), and the Shift variants (`delete-selection-ui.test.tsx`);
- Delete in text and number fields (`detail-panel.test.tsx`, `clip-gain.test.tsx`) and in the library search;
- Space/Home/Arrow handling on sliders (R24-HC, `track-layout.test.tsx`);
- the gesture-blocked branch;
- the Pan drag, key steps, reset and blur/pointercancel revert (`track-pan.test.tsx`, frozen);
- the Volume gesture machine (`gesture-guard.test.tsx`).

## 1. Mandatory before acting (A)

1. **Read the rules and primitives.**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, then run the `pre-flight` skill.
2. **Check the baseline** and report it before any edit:
   - `git rev-parse HEAD`;
   - `git status --short` (the 7 lines above, or the post-commit equivalent);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-31-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - your 3 files against the snapshot shas;
   - protected 4/4;
   - the `node.exe` count.
3. **Read:**
   - `StudioWorkspace.tsx`:
     - l.206–245 (`isTypingTarget`, `isRoleSliderTarget`, `isSliderTarget`);
     - the keydown handler, l.981–1162;
   - `ArrangementLane.tsx`:
     - l.105–150 (context, pan refs and derived values);
     - l.245–313 (the pan handlers);
     - l.550–620 (row 1 Pan JSX, and the row 2 Volume input for comparison);
   - `ArrangementContext.tsx`:
     - `refuseEditDuringGesture` l.596;
     - `syncPlayback` l.870–916;
     - `flushPendingVolume`/`flushPendingMaster` l.922–945;
     - `undo`/`redo` l.1837–1861;
     - the pan actions (`beginTrackPanGesture`, `previewTrackPan`, `commitTrackPan`, `cancelTrackPan`, around l.2200–2290; `beginTrackPanGesture` flushes at l.2252–2253);
     - the Volume and Master preview/revert paths (l.2040–2140, l.2296–2340);
   - the frozen tests:
     - `track-pan.test.tsx` l.800–840 (Delete on Pan) and its blur test;
     - `delete-selection-ui.test.tsx` l.400–490;
     - `track-layout.test.tsx` l.1042–1148 (the R24-H/HC Home harness);
     - `gesture-guard.test.tsx` (Volume blur/cancel).
4. **Grep yourself and report** (contract-conflict check):
   - **Every test that presses Delete/Backspace, with the focused target in each.** B found 7 files: `track-pan`, `clip-gain`, `all-lane-clipboard`, `delete-selection-ui`, `ArrangementContext`, `detail-panel`, `transport`. **If any frozen test expects Delete on a focused `input[type="range"]` to delete, stop and report.** That is a contract conflict for B.
   - **Every `syncPlayback(` call site in `ArrangementContext.tsx`.** For each one, answer: can it run while `gestureCountRef.current > 0` **and** without a reschedule (no `force`, no `removed`, and an unchanged `scheduleKey`)? Paste the table. B's reading is that none can (§0 decision 4).
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Workspace Delete guard (`StudioWorkspace.tsx`, the Delete/Backspace branch **only**)

- In the non-modifier `Delete`/`Backspace` branch (l.1135–1141), return **before** `preventDefault` and `deleteSelection` when the event target is a native range input.
- Add a small local predicate next to the existing ones, for example `isRangeInputTarget(target)` = `target instanceof HTMLInputElement && target.type === 'range'`. The name must be grep-friendly (`AGENT_DISCOVERABLE_CODE`).
- Do **not** use `isSliderTarget` here (decision 1).
- Do not change any other branch: the gesture-blocked branch, Space, Home, the arrows, Enter, the modifiers, `isTypingTarget` and `isSliderTarget` all stay as they are.

### 2.2 Lane Pan handlers (`ArrangementLane.tsx`, the Pan handlers and the Pan input's props **only**)

1. **Remove** `handlePanKeyDown` and the Pan input's `onKeyDown={handlePanKeyDown}` (decision 2). Nothing else in row 1 changes.
2. **Suppression after blur (C-R31-01):**
   - In `handlePanBlur`, when a drag is active, remember the dragging pointer id (for example in `panCancelledPointerRef`) **before** the existing cancel and cleanup.
   - Add window `pointerup`/`pointercancel` listeners that clear it when that pointer id ends. Keep their cleanup in a ref, so that the existing lane unmount effect (or one next to it) removes them.
   - In `handlePanChange`, when the suppression is set, **return** without `setPanDraft`, `previewTrackPan` or `setTrackPan`. React then restores the controlled value to the stored pan.
   - In `handlePanPointerDown`, after a **successful** `beginTrackPanGesture`, clear any pending suppression and its listeners.
   - `handlePanPointerEnd` keeps its current behaviour; `commitTrackPan` is already a no-op without an active gesture.
3. Do not change:
   - the context, or `previewTrackPan`'s signature;
   - the readout;
   - row 2, the meter, the fold or the height handle.

   A-R31-REVIEW-2 stays as it is (stage 4b).

### 2.3 `syncPlayback` override push (R31-U-GAP-B2): no code change

- Write the §1.4 enumeration into the report.
- If it shows **no** reachable path, leave `ArrangementContext.tsx` untouched. It is frozen this round.
- If it shows a reachable path, **report it**. Do not edit the context and do not write a test that depends on that path; B will grant that test (test only, no code) in the next round.

### 2.4 Doc 036 (`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`)

Append one section in Georgian, with technical terms in English (for example `## Round 32 — fader-ის კლავიშები და blur-ის შემდეგ drag`). Cover:
- **C-R31-02:** the narrow guard, which elements it covers, why `role="slider"` is excluded (decision 1), and that deviation 1 was removed;
- **C-R31-01:** the suppression rule, when it ends, and that Volume keeps its current behaviour (reference test);
- **R31-U-GAP-B2:** the enumeration result, and why the defensive term stays;
- the new test file and the C verification IDs;
- the Ableton note of §4.5.

Update the doc's header status/date line if it has one. Do not rewrite the earlier sections.

### 2.5 Tests (written first; red on the snapshot sources)

**Order:**
1. Write the tests against the **unchanged** sources.
2. Run them and paste which fail and why. If the file fails to load, prove red in a scratch copy **outside `store/`**.
3. Implement, then re-run.

**New file:** `app/lib/arrangement/__tests__/fader-guards.test.tsx`. **No other test file changes** (`track-pan.test.tsx` is frozen).

At least **12** `it` blocks, through the real `StudioWorkspace` and provider (the guard is module-local). The fixtures must make the wrong behaviour observable: two audio tracks plus the video track, clips on each, and one clip selected.

1. **The Delete guard (C-R31-02):**
   - Delete, then Backspace, on the focused music **Volume** slider → clip ids and positions unchanged, `history.past.length` unchanged.
   - The same on the focused **Master** slider.
   - The same on the focused **Zoom** slider.
   - The same on the focused **Pan** slider, which is now protected by the workspace guard only.
   - **Positive control in the same harness:** Delete with focus on `document.body` (or on the selected clip) deletes the clip and leaves a gap, with one entry.
   - **The narrow-guard contract:** Delete with focus on the **playhead handle** (`role="slider"`, `aria-label="Playhead"`) still deletes the selected clip.
   - The Pan input no longer stops Delete: a `keydown` listener on `window` receives the Delete dispatched on the focused Pan slider. This proves the workspace guard is the only mechanism.
2. **Pan blur-continue (C-R31-01):**
   - pointerdown (primary, id 41) → 2 `change`s → `blur` → 2 more `change`s → window `pointerup` id 41. Then:
     - `history.past.length` and `present` are unchanged versus before the pointerdown;
     - the track has no `pan` key (or keeps the stored value, if one was set);
     - the slider `value` equals the stored value;
     - the fake panner received **no** `setTargetAtTime` after the revert call.
   - After that release, a fresh pointerdown → `change` → pointerup gives exactly **one** `Pan — {name}` entry.
   - After that release, one keyboard-style `change` (no pointer) gives exactly one entry.
   - While the suppression is pending, a **new** successful pointerdown (id 42) starts a normal drag: the draft follows, and its release makes one entry.
3. **The Volume reference (unchanged behaviour):** the same blur-continue sequence on the music Volume slider gives exactly **one** `Volume` entry on release. This freezes today's behaviour, so a later change must be deliberate.
4. **Coverage closures** (C round 31 notes; test only):
   - Home on the focused music **Volume** slider and on the **Master** slider does not seek. R24-HC now exercises Pan instead.
   - A pending keyboard **Volume** preview is committed **before** the Pan gesture starts: a Volume key change (no keyup yet) → Pan pointerdown → `change` → pointerup → `past` ends with the Volume entry, then the Pan entry (labels exactly as the app writes them).
   - The same for a pending keyboard **Master** preview.

### 2.6 After the code

- **Self-check** (report each one):
  - blur during a Pan drag while playing;
  - pointercancel after a blur (the suppression clears);
  - provider or lane unmount with a pending suppression (the listeners are removed);
  - Delete on a focused range during a clip drag (blocked status; information);
  - Backspace in the library search still edits text.
- **Biome:** run `npx biome check --write` **only** on your own files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (3+ files changed). Report its findings and your dispositions.
- **Mutation checks:** only in a scratch copy outside `store/`. Never mutate in place.
- **Commands:** run the §5 commands. One browser smoke check is allowed if the server is up.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `1cefea1` plus the 7 round-31 lines, or root's newer commit that contains them.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.1 only (the Delete/Backspace branch plus one local predicate) |
| `app/components/arrangement/ArrangementLane.tsx` | A | §2.2 only (Pan handlers, Pan input props, the suppression ref/listeners and their unmount cleanup) |
| `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | A | §2.4 only (append) |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | **new**, §2.5 |
| `../tmp/studio-real-loop/a-round-32.md`, `a-round-32/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-32.md`, `c-round-32.json`, `c-round-32/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end:**
- if root has **not** committed round 31: exactly **9** lines, i.e. the 7 baseline lines plus
  ```
   M app/components/arrangement/StudioWorkspace.tsx
  ?? app/lib/arrangement/__tests__/fader-guards.test.tsx
  ```
- if root **has** committed round 31: exactly **4** lines:
  ```
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ?? app/lib/arrangement/__tests__/fader-guards.test.tsx
  ```

### 3.3 Frozen this round

**Frozen:**
- all **375** files in `b-round-31-tree-sha256.txt`, and everything else under `store/`;
- that includes `ArrangementContext.tsx`, `graph.client.ts`, `model.ts`, `types/arrangement.ts`, `track-pan.test.tsx`, `ArrangementMaster.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementOverview.tsx` and `ArrangementLibraryPreview.tsx`;
- docs 001–035;
- **every existing test**.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs and `../backend/**`;
- env/config files, the sitemap and `app/data/studio-lab-demo.ts`;
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

**Viewport:** 1440×900.

**Harness rules (unchanged):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press`/`$B type`.
- Range drags, blur and pointercancel are synthetic; label them.
- C may hook browser APIs (`AudioParam.prototype.setTargetAtTime`, `BaseAudioContext.prototype.createStereoPanner`, `AudioBufferSourceNode.prototype.start`), labelled as such. No source instrumentation.
- Mutations run only in a scratch copy outside `store/`.
- **Every run and every gate records the `node.exe` count.**

**Layout L32** = round 31's L31: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4. Record the clip table `[id, track, start, duration]` and `history.past.length` before and after every key step.

**Checkpoint order if the session may end:** G32 → R32-DK → R32-BC → R32-K → rest. Write `c-round-32/checkpoint.md` as you go.

### 4.1 R32-DK — Delete/Backspace on focused controls (C-R31-02)

Select the SFX clip with a real click. Then, for each control: focus it (`element.focus()` or Tab), real `$B press Delete`, then real `$B press Backspace`. Record the clips, the past length, the status text and the control's value.
- **Must not edit** (PASS = the clip table, the past length and the value are unchanged): music **Volume**, SFX **Volume**, **Master** Volume, **Zoom**, music **Pan**.
- **Must still delete** (PASS = the clip is deleted with one entry and a gap; then Undo):
  - focus on `document.body` (click an empty lane area);
  - the selected clip itself;
  - the **playhead** handle (`role="slider"`).
- **Record only** (no verdict; this documents the narrow decision): the overview (`role="slider"`) and the library preview scrubber.
- **During a clip drag** (synthetic hold): Delete on a focused Volume shows the existing gesture-blocked status (information).
- **SRW-24 regression** (one run each, Undo after each):
  - with a **range** selection (no clip selected) and focus on the lane body, Delete leaves a gap;
  - Ctrl+Shift+L, then Delete, leaves the gap on every lane;
  - Ctrl+Shift+X still closes it.
- **Re-run C's round-31 reproduction** (`runs/volume-delete-key.txt` steps): the clip must now stay.

### 4.2 R32-BC — Pan blur-continue (C-R31-01) and the Volume reference

- **Re-run `c-round-31/scripts/pg.js` mode `blur-continue`** (playing, music solo, Master −12; pointer id 41; 3 inputs; `blur()`; 2 more inputs; pointerup):
  - `history.past.length` is unchanged from before the pointerdown; the stored pan is unchanged; the slider `value` and readout equal the stored value;
  - with the `setTargetAtTime` hook: the music panner gets exactly the revert call after the blur, and **no** call for the post-blur inputs;
  - **then** a fresh drag gives exactly 1 `Pan — მუსიკა` entry, and a key step gives 1 entry.
- **`pointercancel` mid-drag** (the round-31 R31-PG step) still reverts with no entry.
- **A new pointer while suppressed:** after the blur, with id 41 still held, pointerdown id 42 + input + pointerup id 42 → 1 entry; then pointerup id 41 → nothing.
- **Volume reference:** `vol-blur-continue` → exactly **1** `Volume` entry, unchanged from round 31.

### 4.3 R32-K — adjacent behaviour (one run each)

- **Pan drag while playing:** no new source start; `setTargetAtTime` only on the music panner, the last value matching the drag, τ 0.015; one entry on release; Undo while playing restores live (R31-PV, short form).
- **Pan keyboard** Home/End/arrows: one entry per change. The readout reset → C with one entry, then disabled.
- Space on a focused Pan and on a focused Volume toggles playback. Home on a focused Pan, Volume and Master does not seek.
- A Volume drag → one `Volume` entry. A Master keyboard step → one entry. Clip Gain `6` + Enter → one `Clip Gain` entry.
- Delete/Backspace inside the Clip Gain field and in the library search do not delete the clip.
- Mute/Solo, fold/unfold and a clip drag work.

### 4.4 R32-S, R32-U, R32-Doc

**R32-S** (static, read-only): `diff -u` of `b-round-31-snapshots/` against the live files. Every hunk must be within §3.2; report each hunk's purpose.
- `StudioWorkspace.tsx`: only the Delete/Backspace branch and one predicate. `isSliderTarget` and every other branch are byte-identical.
- `ArrangementLane.tsx`: only the Pan handlers, the removal of the Pan input's `onKeyDown`, and the suppression ref/listeners/cleanup. Row 2, the meter, the fold and the height handle are untouched.
- `ArrangementContext.tsx` and the other frozen files: 375 OK.
- No hardcoded colour, no `any`/`@ts-ignore`, and no new `// comment`.

**R32-U:**
- The §2.5 cases exist and are green.
- A's red-first output shows the Delete-guard and blur-continue cases failing on the snapshot sources. The reference and coverage tests may be green on the snapshot, and so is the **Pan** Delete-guard test (the snapshot still has deviation 1's `stopPropagation`); for Pan only the window-listener test is red. A labels which ones. B checked the sources: the playhead (`ArrangementRuler.tsx:181`) and overview (`ArrangementOverview.tsx:261`) key handlers return early for non-Arrow keys, so Delete reaches the window handler there; `ArrangementMaster.tsx` and `ArrangementTransport.tsx` have no `onKeyDown`, so the Master and Zoom tests are red on the snapshot.
- C runs these mutations in a scratch copy outside `store/`; each must make a test fail. Report how each mutation was done:
  - (a) the workspace guard removed → the Volume/Master/Zoom Delete tests (and the frozen `track-pan` Delete test) fail;
  - (b) the guard widened to `isSliderTarget` → the playhead test fails;
  - (c) the lane suppression removed (`handlePanChange` ignores it) → the blur-continue test fails;
  - (d) the suppression never cleared on pointerup → the "fresh drag after release" test fails;
  - (e) the suppression not cleared on a new successful pointerdown → the id-42 test fails;
  - (f) `beginTrackPanGesture` without `flushPendingVolume()` (frozen context; scratch only) → the pending-Volume test fails;
  - (g) the Pan `onKeyDown` stopPropagation restored → the window-listener test fails.
- Re-run C's round-31 mutation **b2** in the scratch copy. It is still expected to **survive**; record it as accepted (decision 4), unless A's enumeration found a reachable path.

**R32-Doc:** doc 036's new section covers §2.4 and matches the code.

### 4.5 Ableton source and compliance (workflow addendum 2026-10-11)

This is a bug round.

**Source:** the Ableton Live 12 Reference Manual §18.1 "The Live Mixer", captured as `b-round-29/ableton-mixing-20261012.txt` (gstack `/browse`, 2026-10-12; B re-read it on 2026-10-13).
- It describes the Pan and Volume controls and the double-click reset.
- **It says nothing about Delete/Backspace on a focused mixer control, or about pointer behaviour after focus loss.**
- No video is used. B did not browse a new source.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Delete/Backspace on a focused fader does not edit the timeline | none captured | **Unconfirmed** (no source) | CZABA requirement from C-R31-02: a fader is a value control | R32-DK |
| Delete with focus on the playhead or the overview still deletes the selection | none captured | **Unconfirmed** | CZABA SRW-24 contract (user request 2026-10-11) | R32-DK |
| A cancelled drag (focus lost) writes nothing afterwards | none captured | **Unconfirmed** | CZABA consistency with the round-31 cancel contract | R32-BC |
| Pan/Volume reset by double-click | §18.1 | **Confirmed** | Still stage 4b (round 33) | — (not this round) |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). Never write "Ableton does it this way" for an unconfirmed row.

### 4.6 Gates

**G32-1:**
- tsc 0;
- vitest = **1193** + A's new tests (≥ 12 new `it`), 0 failures. Record `node.exe`. If a failure is a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome `./app` (read-only): exactly the 2 baseline CRLF errors, 0 errors in Studio files, and warnings ≤ 218 + 1 info;
- these frozen tests are green: `track-pan.test.tsx`, `delete-selection-ui.test.tsx`, `detail-panel.test.tsx`, `clip-gain.test.tsx`, `all-lane-clipboard.test.tsx`, `track-layout.test.tsx`, `gesture-guard.test.tsx`, `master-ui.test.tsx`, `ArrangementContext.test.ts` and `render-budget.test.tsx`.

**G32-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-31-tree-sha256.txt` → 375 OK (or the documented CRLF exception);
- `git status --short` = §3.2 (9 or 4 lines);
- HEAD recorded at start and end.

**G32-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (during the key runs and a drag);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, and the dev-module `GET /app/lib/r2.config.ts`.

**Not re-run this round:** the R31-PE/PE2 exports, R31-PL, R31-PUI geometry, RF5-3, R3-V1/V4 and the C-R27-01 table. Nothing in the audio graph, the export, the scheduler, the video or the layout changes; R32-S and R32-K prove it.

### 4.7 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01, C-R6-02 and C-R8-01 (all Tech Lead);
- C-R23-01 (Tech Lead). Record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab`; round 31: 2 at 28013/28014, 63 520 bytes;
- C-R30-01 (polish).

**Open low items:**
- R26-M1;
- MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES and A-R31-REVIEW-2 (stage 4b);
- R9-REVIEWER-M1-L8 (4c);
- DEMO-SFX-FULL-SCALE; L3; LIB-SEP-REASON; R27-T; DOC034-UNREACHABLE-NOTE; DOC035-NOTES.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `b-round-31.md` §7):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- the second-remote reconcile (no force push);
- the CRLF Biome errors on the merged auth files;
- the tracked `frontend-architect.md` grants Write/Bash;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the fake Bearer gets 500 without a token;
- the CDP allowlist;
- `Content-Type` without a charset;
- the dev server's availability;
- **round 31's 7 C-verified files are ready for root's checkpoint commit.**

**Tech Lead manual checks:**
- the `feature-status.md` §5 list, including R30-T and R31-T. R31-T now also asks: in real Chrome, does a range keep firing `input` after a focus loss while the button is held?
- TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
sha256sum -c ../tmp/studio-real-loop/b-round-31-tree-sha256.txt | grep -vc ': OK$'
npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
diff -u ../tmp/studio-real-loop/b-round-31-snapshots/StudioWorkspace.tsx app/components/arrangement/StudioWorkspace.tsx
diff -u ../tmp/studio-real-loop/b-round-31-snapshots/ArrangementLane.tsx app/components/arrangement/ArrangementLane.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If the server is up, A may do one browser smoke check (`a-browse.json`): select a clip, focus the music Volume, press Delete, and confirm the clip stays. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G32-1/2, R32-S, R32-U, R32-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-32.md`:**
1. the pre-flight gate, including the §1.4 Delete-test table and the `syncPlayback` enumeration;
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations and the §2.6 self-check results.

Do not claim PASS.

**C → `c-round-32.md` and `c-round-32.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the key-step tables;
- the hook counts;
- the mutation table;
- the Ableton two-verdict table (§4.5);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers. **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 33 — SRW-13 stage 4b** (fader UX for Volume, Master and Pan):
  - no jump to the click point;
  - double-click reset (Live §18.1);
  - per-key entry coalescing;
  - A-R29-REVIEW-1;
  - the pending-commit order;
  - MASTER-HOLD-TICK-EDGE;
  - A-R31-REVIEW-2;
  - the stale refusal status.
- **Round 34:** stage 4c (round-9 M1/L8), then polish (C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE).
- **Then:**
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including the edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 32 -StartPhase A` and a higher limit.
