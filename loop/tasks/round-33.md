# CURRENT TASK — Round 33: C bug first — a click in the timeline moves focus off a fader (C-R32-01)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-13
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorization 2026-10-13).
- Decision record: **D-29x** in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-32.md`.
- Round size: **one Medium bug** (workflow rule "one feature or at most three related bugs"). No feature work this round.

> **Environment prerequisite (root, not BLOCKED):** the dev server `http://127.0.0.1:5173/studio-lab` answered **200** when B planned (2026-10-13 ~14:20 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** B counted **7** `node.exe`. Every A and C run records the count (`tasklist | grep -ci node.exe`).

## Why this round

C round 32 (`c-round-32.md`, `c-round-32.json`) is a **FAIL** on one new Medium bug. Everything else C ran passed: G32-1..3, R32-BC, R32-K, R32-S, R32-U (mutations a–g killed, b2 survives as accepted) and R32-Doc. B re-ran the gates independently (`b-round-32/gates.txt`): 375 OK, protected 4/4, tsc 0, vitest 69 files / **1212/1212**, build ✓, Biome 2 baseline CRLF errors + 218 warnings + 1 info.

**C-R32-01 (Medium, new, caused by round 32's guard):**
- **Steps (real clicks):** click the music Volume fader, then click the SFX clip header (the clip becomes selected), then press Delete or Backspace.
- **Result:** nothing happens. No deletion, no history entry, no status. The same happens after clicking the empty lane body.
- **Cause (C's code reading, confirmed by B):**
  - `ArrangementClip.tsx:228` (`beginGesture`) calls `event.preventDefault()` on pointerdown, so the browser never moves focus. `handleLaneBackgroundPointerDown` (`StudioWorkspace.tsx` ~l.893) and the ruler's `handlePointerDown` (`ArrangementRuler.tsx` ~l.320) do the same.
  - The clip root and the lane body are not focusable (no `tabIndex`).
  - So `document.activeElement` stays on the fader, and round 32's `isRangeInputTarget(event.target)` guard swallows Delete.
- **Regression scope:** before round 32, Volume, Master and Zoom deleted the clip in this sequence (the C-R31-02 path); now they do nothing. On Pan it was already dead before round 32 (deviation 1).
- **Same root cause, already broken before round 32 and fixed by the same change:** ArrowLeft/ArrowRight nudge, Enter (add source) and Home (seek) are all gated by `!isSliderTarget(event.target)`. After a fader → clip click they do nothing either.
- **Evidence:** `c-round-32/runs/dk-focus-retention.txt` (A = the body-focus control, which deletes; B, C and D keep the fader focus and Delete is a no-op), `runs/dk.txt` row "selected clip", `runs/bc-pid1-realclick.txt`.

The bug blocks committing round 32's files (C's report), so it goes before stage 4b.

**References:**
- Backlog v34: `backlog.json` (`open_findings` C-R32-01, A-R32-REVIEW-1; `rounds` 33; SRW-13 `decisions_round33`).
- Progress board: `feature-status.md`.
- C's reproduction material (read-only for A): `c-round-32/runs/dk-focus-retention.txt`, `c-round-32/scripts/`.
- A's round-32 report: `a-round-32.md` (§4 review findings, §7 harness notes).
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Previous round:** archived as `tasks/round-32.md` (`cmp`-identical to the dispatched round-32 task).

## Baseline

B verified on 2026-10-13 (~14:20):
- HEAD is **`1cefea1`**.
- `git status --short` = **9** lines (round 31's 7 lines plus round 32's `StudioWorkspace.tsx` and `fader-guards.test.tsx`; `ArrangementLane.tsx` and doc 036 were already in the list). Saved in `../tmp/studio-real-loop/b-round-32-git-status.txt`:
  ```
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M app/contexts/ArrangementContext.tsx
   M app/lib/arrangement/graph.client.ts
   M app/lib/arrangement/model.ts
   M app/types/arrangement.ts
  ?? app/lib/arrangement/__tests__/fader-guards.test.tsx
  ?? app/lib/arrangement/__tests__/track-pan.test.tsx
  ?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ```
- `sha256sum -c ../tmp/studio-real-loop/b-round-32-tree-sha256.txt` → **376 OK**.
  - It covers every tracked or untracked file under `app/` and `docs/implementation/` **except your 3 files** below.
  - It is round 31's list (375) **plus round 32's `ArrangementLane.tsx`**, which is now frozen.
- Protected 4/4 OK; tsc 0; build ✓; vitest **69 files, 1212/1212**.
- Biome `./app`: **2 errors** + 218 warnings + 1 info.
  - Both errors are `format` errors (CRLF) on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. They belong to root.
  - **Do not touch those files.** Your files must add 0 errors.
- Dispatch snapshots of your 3 files are in `../tmp/studio-real-loop/b-round-32-snapshots/`:

  | File | sha256 (first 8) |
  |---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `0bf51b45` |
  | `app/lib/arrangement/__tests__/fader-guards.test.tsx` | `c7b071e8` |
  | `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | `4aede19f` |

- **If root commits before you start** (B recommends round 31's 7 files only; round 32's files wait for this round's C PASS), the new HEAD is the baseline:
  - record it;
  - check that `b-round-32-tree-sha256.txt` is still 376 OK. If root normalises the CRLF auth files, those lines may change; report that, and do not treat it as yours;
  - check that none of your 3 files differs from its snapshot. If one does, **stop and report**.

Rules for the baseline:
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's.
- Nobody but root commits or pushes.

## 0. Scope

**The contract after this round:**

| Action | Result |
|---|---|
| A native range input (track Volume, track Pan, Master Volume, Zoom) has focus, and a `pointerdown` lands **anywhere inside the timeline scroller** (`data-testid="arrangement-timeline-scroller"`: clip header, clip body, trim handles, lane body, ruler, loop-brace row, lane header) **on an element that is not itself a native range input** | The focused range input is **blurred** before any handler of that element runs. Keys then reach the workspace as if focus were on `document.body`. |
| The same, but a **pointer gesture is already active** (`isPointerGestureActive()`) | **No blur.** The second pointer's claim is refused anyway; blurring would cancel the running fader drag. |
| The `pointerdown` lands on a native range input (the focused one or another one) | **No blur by the new code.** The browser and the existing fader handlers behave as today. |
| The blurred fader has a **pending keyboard preview** (Volume or Master changed by keys, no keyup yet) | Its existing `onBlur` commits it: exactly **one** entry (`Volume` / Master label), written **before** the clicked element's gesture claims the pointer. |
| After a fader → clip click: Delete/Backspace | Deletes the selected clip and leaves a gap with one entry (SRW-24). |
| After a fader → clip click: ArrowLeft/ArrowRight, Enter | Behave as with body focus (nudge the selected clip; Enter adds the library source to the active track). |
| Delete/Backspace while a fader **really** has focus (no click in between) | **Unchanged** (round 32): nothing happens to the timeline. |
| A `pointerdown` **outside** the scroller (library, detail panel, overview, header, transport) | **Unchanged** this round. C records the library-item and detail-panel cases only. |
| A focused **text** field (library search, Clip Gain) followed by a click in the timeline | **Unchanged** this round. C records it only (B observation FOCUS-TEXT-STALE; see §0 decision 4). |

**Decisions (B, D-29x), with the reasons:**
1. **Fix the focus, not the guard.** Round 32's guard is correct: a key on a fader must not edit the timeline. The bug is that timeline pointerdowns call `preventDefault()` and so never take focus. Every way of narrowing the guard further (focus-visible, selection state, the last pointer target) either brings back C-R31-02 or adds hidden state. Blurring reproduces exactly what the browser would do without `preventDefault`: focus goes to `document.body`, which is C's passing control case.
2. **One capture-phase listener on the scroller, in `StudioWorkspace.tsx`.** It covers the clip header, the clip body, the trim handles, the lane body, the ruler and the lane headers in one place. `ArrangementClip.tsx`, `ArrangementRuler.tsx` and `ArrangementLane.tsx` stay frozen.
   - Rejected: **focusing the clip.** The clip root has no `tabIndex`. That would need a new focusable element and tab-order changes in a frozen file.
   - Rejected: **one call per handler** (clip, lane background, ruler). That means three or more files for the same rule.
   - The capture phase runs before the clip's `stopPropagation`, and before any `claimPointerGesture`. So a pending fader commit is not refused as "edit during gesture".
3. **No blur while a gesture is active.** A second pointer cannot start anything then (`claimPointerGesture` refuses it), and a blur would cancel a running Pan drag (`handlePanBlur`) or Volume drag (`blurTrackVolume` → `cancelTrackVolumeGesture`).
4. **Range inputs only.** A focused text field followed by a timeline click (Delete then edits the search text, or the typed Clip Gain is committed later) is the same *class* of focus retention. But C has not reproduced it, and blurring the Clip Gain field commits its value, which is a separate contract. B records it as **FOCUS-TEXT-STALE** (observation, from code reading), and C records it this round without a verdict. If C confirms it, B plans it as its own bug.
5. **A-R32-REVIEW-1 stays Low and moves to stage 4b (round 34).** C proved that a trusted mouse `pointerup` (id 1) clears the suppression. Mouse ids are constant, and touch or pen get a `pointercancel` when the browser takes over. The only symptom, Pan keys dropped silently, needs a pointer that never releases. Any change to how the suppression clears would alter round 32's §0 contract and A's post-review tests, and 4b reworks these handlers anyway.

**In (A):** §2.1 (the scroller listener), §2.2 (a doc 036 section), §2.3 (tests appended to `fader-guards.test.tsx`, red-first).

**In (C):** §4.

**Not in this round** (each one is queued, not deferred scope):
- **stage 4b (round 34):**
  - the no-jump fader click;
  - double-click reset (Live §18.1);
  - per-key entry coalescing (FADER-KEY-ENTRIES);
  - A-R29-REVIEW-1;
  - the pending-commit order;
  - MASTER-HOLD-TICK-EDGE;
  - A-R31-REVIEW-2;
  - **A-R32-REVIEW-1**;
  - the stale refusal status;
  - Volume's own blur-continue behaviour, if 4b changes the gesture machine;
- **stage 4c + polish (round 35):** round-9 M1/L8, C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE;
- FOCUS-TEXT-STALE (record only this round);
- any change to `role="slider"` key handling, or to pointerdowns outside the scroller.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- a clip drag, trim, range drag and click-to-playhead started while a fader has focus;
- the marquee and the lane-background click;
- ruler click/scrub and the loop brace;
- a fader drag started on a different fader while one has focus (Volume → Pan, Pan → Volume);
- the pending keyboard Volume/Master commit order;
- the Pan blur suppression (round 32): a click in the timeline while **no** Pan drag is running must not create a suppression;
- the round-32 Delete guard on its own (Delete straight after focusing a fader).

## 1. Mandatory before acting (A)

1. **Read the rules and primitives.**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, then run the `pre-flight` skill.
2. **Check the baseline** and report it before any edit:
   - `git rev-parse HEAD`;
   - `git status --short` (the 9 lines above, or the post-commit equivalent);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-32-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - your 3 files against the snapshot shas;
   - protected 4/4;
   - the `node.exe` count.
3. **Read:**
   - `StudioWorkspace.tsx`:
     - l.206–235 (`isTypingTarget`, `isRoleSliderTarget`, `isSliderTarget`, `isRangeInputTarget`);
     - the wheel listener on `scrollerRef`, l.848–874 (the pattern for a native listener);
     - `handleLaneBackgroundPointerDown`, l.883 onward;
     - the keydown handler, l.985–1170;
     - the scroller JSX, l.1349–1422;
   - `ArrangementClip.tsx` `beginGesture` l.224–260 (read-only);
   - `ArrangementRuler.tsx` `handlePlayheadPointerDown` l.123–140 (it focuses itself) and `handlePointerDown` l.307–330 (it does not);
   - `ArrangementLoopBrace.tsx` l.60–95 (it focuses itself);
   - `ArrangementLane.tsx` `handlePanPointerDown`, `handlePanBlur` and the Volume input's `onBlur` (read-only);
   - `ArrangementContext.tsx` `blurTrackVolume` (~l.2159) and `blurMasterGain` (~l.2404) (read-only);
   - your own `fader-guards.test.tsx` (the harness, the fixtures and the history proxy).
4. **Grep yourself and report:**
   - every `pointerdown` handler inside the scroller subtree that calls `preventDefault()`, and whether it calls `focus()` afterwards. B found: clip `beginGesture` (no focus), the lane background (no focus), ruler `handlePointerDown` (no focus), the height handle (no focus), the playhead (focuses itself) and the loop brace (focuses itself);
   - every existing test that checks `document.activeElement` after a pointerdown in the timeline. **If any frozen test expects a fader to keep focus after a pointerdown on a non-range timeline element, stop and report.** That is a contract conflict for B.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Scroller focus release (`StudioWorkspace.tsx`)

- Add **one** capture-phase `pointerdown` handler on the scroller element. Either use React's `onPointerDownCapture` on the `scrollerRef` div, or add a native listener with `{ capture: true }` in a `useEffect` with cleanup, like the wheel listener.
- Behaviour:
  - read the focused element from the event target's `ownerDocument.activeElement`;
  - if it is a native range input (reuse `isRangeInputTarget`), **and** the event target is not a native range input, **and** `workspaceRef.current.isPointerGestureActive()` is false, then call `blur()` on it;
  - nothing else: no `preventDefault`, no `stopPropagation`, no focus moved to another element, no status text.
- Give the handler a grep-friendly name (`AGENT_DISCOVERABLE_CODE`), for example `releaseFaderFocusOnTimelinePointerDown`.
- Do **not** change the keydown handler, the round-32 guard, `isSliderTarget`, `handleLaneBackgroundPointerDown`, or any other branch.

### 2.2 Doc 036 (`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`)

Append one section in Georgian, with technical terms in English (for example `## Round 33 — timeline-ზე click fader-იდან focus-ს აშორებს`). Cover:
- C-R32-01: the steps, the cause (`preventDefault` on the timeline pointerdowns, not focusable) and why round 32's tests did not see it (they set focus directly);
- the rule: the capture listener, the three conditions, what is covered and what is not (outside the scroller; text fields);
- the pending-commit order, and the keys that also start working again (Arrow nudge, Enter, Home);
- decision 5 (A-R32-REVIEW-1 → 4b) and the FOCUS-TEXT-STALE observation;
- a correction to round 32's mutation (d) wording: the "fresh drag after release" test does not protect the pointerup clear; the pointercancel→key and another-pointer tests do (C round 32 §R32-U);
- the new tests and the C verification IDs;
- the Ableton note of §4.5.

Update the doc's header status/date line. Do not rewrite the earlier sections.

### 2.3 Tests (written first; red on the snapshot sources)

**Order:**
1. Append the tests to `fader-guards.test.tsx` against the **unchanged** `StudioWorkspace.tsx`.
2. Run them and paste which fail and why.
3. Implement, then re-run.

**File:** `app/lib/arrangement/__tests__/fader-guards.test.tsx`, **append only**: add one new `describe` block, for example `'a timeline pointerdown releases fader focus (C-R32-01)'`. You may add small helpers. The existing 19 `it` blocks must stay byte-identical, and so must the existing helpers they use, unless a helper only gains an optional parameter (report it). **No other test file changes.**

jsdom does not move focus on pointerdown, so the tests assert the explicit blur. At least **11** new `it` blocks, through the real `StudioWorkspace` and provider, on the existing fixture (video + music + SFX, SFX clip selected):

1. **Fader → clip header → Delete**, once per fader:
   - focus the music **Volume**; `pointerDown` (button 0, buttons 1, a pointer id) on the SFX clip header, then the matching `pointerUp`. Then: `document.activeElement` is not the range input, and Delete deletes the SFX clip, leaves a gap and adds one entry;
   - the same with **Pan**;
   - the same with **Master**;
   - the same with **Zoom**.
2. **Fader → empty lane body → clip header → Delete** (C's variant D) deletes the clip with one entry.
3. **Fader → clip body** (the range/playhead area, `beginGesture('range')`): the fader loses focus.
4. **Fader → ruler** pointerdown/up: the fader loses focus. Then Delete behaves as it does with body focus. If the ruler click keeps the selection, the clip is deleted. If the code clears the selection, A reports that and asserts the body-focus equivalent.
5. **Pending keyboard Volume preview** (a Volume `change` without keyup) → clip header pointerdown/up → Delete. The undo chain ends with exactly one `Volume` entry, then `კლიპის წაშლა` (labels exactly as the app writes them). The Volume entry is written before the clip gesture.
6. **Fader → clip header → ArrowRight** nudges the selected clip by the nudge step, with one entry.
7. **No blur on its own fader:** focus the music Volume, then `pointerDown` on that Volume input. `document.activeElement` is still the Volume input. Release it.
8. **No blur during an active gesture:** start a Pan drag (pointerdown id 41 on the focused Pan, one `change`). Then `pointerDown` id 42 on the clip header. Pan is still focused, and after the window `pointerup` id 41 there is exactly one `Pan — {name}` entry. This is the decision-3 oracle.
9. **No suppression from a plain blur:** focus Pan with no drag → clip header pointerdown/up. Then one keyboard-style Pan `change` gives exactly one entry. This shows the round-32 suppression is not triggered by the new blur.
10. **Round-32 regression in the same `describe`:** focus the music Volume → Delete with no click in between → the clip table and the history are unchanged.

### 2.4 After the code

- **Self-check** (report each one):
  - a clip drag started while Volume is focused moves the clip and writes one entry;
  - a marquee started while Master is focused works;
  - a Volume drag on another track's Volume while the music Volume is focused;
  - provider unmount (the listener is removed, if it is native);
  - Backspace in the library search still edits text.
- **Biome:** run `npx biome check --write` **only** on your own files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (3 files changed). Report its findings and your dispositions.
- **Mutation checks:** only in a scratch copy outside `store/`. Never mutate in place.
- **Commands:** run the §5 commands. One browser smoke check is allowed if the server is up.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `1cefea1` plus the 9 lines, or root's newer commit that contains round 31.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.1 only (one capture handler or listener on the scroller) |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | §2.3 only (append one `describe`; existing `it` blocks byte-identical) |
| `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | A | §2.2 only (append + header status line) |
| `../tmp/studio-real-loop/a-round-33.md`, `a-round-33/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-33.md`, `c-round-33.json`, `c-round-33/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end:**
- if root has **not** committed: exactly the same **9** lines as the baseline;
- if root **has** committed round 31's 7 files as they are: exactly **4** lines:
  ```
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ?? app/lib/arrangement/__tests__/fader-guards.test.tsx
  ```
- if root committed only round 31's **5 untouched** files (`ArrangementContext.tsx`, `graph.client.ts`, `model.ts`, `types/arrangement.ts`, `track-pan.test.tsx`): exactly **4** lines, the same as above except that doc 036 stays untracked (`?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`).
- Any other root commit: record it, and check every line against this section.

### 3.3 Frozen this round

**Frozen:**
- all **376** files in `b-round-32-tree-sha256.txt`, and everything else under `store/`;
- that includes `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementContext.tsx`, `ArrangementMaster.tsx`, `ArrangementTransport.tsx`, `ArrangementOverview.tsx` and `ArrangementLibraryPreview.tsx`;
- docs 001–035;
- **every existing test** (the existing 19 `it` blocks of `fader-guards.test.tsx` included).

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
- C may hook browser APIs (`AudioParam.prototype.setTargetAtTime`, `AudioBufferSourceNode.prototype.start`), labelled as such. No source instrumentation.
- Mutations run only in a scratch copy outside `store/`.
- **Every run and every gate records the `node.exe` count.**

**Layout L33** = L32: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4. Before and after every step, record the clip table `[id, track, start, duration]`, `history.past.length` and **`document.activeElement`** (aria-label or tag).

**Checkpoint order if the session may end:** G33 → R33-FT → R33-KO → R33-G → R33-K → rest. Write `c-round-33/checkpoint.md` as you go.

### 4.1 R33-FT — fader → timeline click → key (C-R32-01; real clicks only)

For each fader, use a **real click** on it to give it focus (record the `Volume`/Master entry this may write). Then make the real click listed in the column. Record `activeElement` after the click. Then press Delete (Undo after each deletion) and repeat with Backspace.

| Fader ↓ / click → | SFX clip header | empty SFX lane body, then the clip header | clip body (waveform area) | ruler |
|---|---|---|---|---|
| music Volume | must delete | must delete | focus released; record Delete | focus released; record Delete |
| SFX Volume | must delete | — | — | — |
| Master Volume | must delete | must delete | — | focus released |
| Zoom | must delete | — | — | focus released |
| music Pan | must delete | must delete | — | — |

- **PASS** = `activeElement` is no longer the fader after the click. Every "must delete" cell deletes the clip with one entry and a gap. Backspace behaves the same.
- **Re-run C's `runs/dk-focus-retention.txt` steps B, C and D:** each must now delete.
- **Round-32 regression (short):** focus each of the 5 faders with **no** click after it → Delete/Backspace → nothing changes (R32-DK must-not-edit rows).

### 4.2 R33-KO — commit order and other keys

- **Pending Volume:** focus the music Volume, then use a real ArrowUp and hold off the keyup if the harness allows (otherwise a synthetic `change` without keyup, labelled). Then a real click on the clip header, then Delete. `past` gains exactly +1 `Volume`, then +1 `კლიპის წაშლა`.
- **The same with Master.**
- **Fader → clip header click → real ArrowRight:** the clip moves by the nudge step, with one entry.
- **Fader → clip header click → real Enter:** behaves as with body focus. Record it.
- **Fader → clip header click → real Home:** seeks to 0.

### 4.3 R33-G — no blur in the excluded cases (synthetic, labelled)

- **During a Pan drag** (`pg.js`-style, id 41 on music Pan, 2 inputs), pointerdown id 42 on the clip header: Pan stays focused, the drag is not cancelled, and the window `pointerup` id 41 writes exactly 1 `Pan — მუსიკა`. With the `setTargetAtTime` hook: no revert call at id 42.
- **During a Volume drag:** the same, with exactly 1 `Volume` entry.
- **Pointerdown on the focused fader itself:** it keeps focus.
- **Pointerdown on another fader** (music Volume focused → music Pan drag): one `Pan` entry, and no extra `Volume` entry unless a keyboard preview was pending.
- **No new suppression:** focus Pan (no drag) → a real click on the clip header → focus Pan again → real ArrowRight. That writes +1 `Pan`.

### 4.4 R33-K — adjacent behaviour (one run each, with a fader focused first)

- A clip drag (synthetic) moves the clip, with 1 entry. A trim works.
- A marquee over two clips selects both. A click on an empty lane sets the playhead.
- A ruler click seeks. A ruler drag scrubs. The loop brace drag works, and the brace has focus afterwards.
- A real click on the playhead handle focuses it, and Delete deletes the selection (round 32 narrow-guard row).
- Space still toggles playback with the fader focused and after the click.
- Pan and Volume keyboard steps on a focused fader still write one entry each.
- With the music Pan focused at a non-centre value, a real click on the Pan readout (reset): the pan returns to C with one entry, and the Pan slider has focus afterwards (round-31 deviation 8; the new handler blurs first, then the reset focuses the slider again).

### 4.5 Record only (no verdict)

- **FOCUS-TEXT-STALE:** focus the library search and type `ab`. Then a real click on a clip header, then Delete. Record whether the clip or the search text changed. Do the same with the Clip Gain field: type `3` (no Enter), then a real click on another clip, then Delete. Record the clip table, `past` and the gain value.
- **Clicks outside the scroller** with a fader focused: a library item, the detail panel background, the overview. Record `activeElement`, then what Delete does.
- **A-R32-REVIEW-1:** not re-tested; it is carried to 4b.

### 4.6 R33-S, R33-U, R33-Doc

**R33-S** (static, read-only): `diff -u` of `b-round-32-snapshots/` against the live files.
- `StudioWorkspace.tsx`: only the scroller capture handler, or the listener and its effect. The keydown handler, the round-32 guard, `isSliderTarget`, `isRangeInputTarget` and every other branch are byte-identical.
- `fader-guards.test.tsx`: only appended lines, plus any helper that gained an optional parameter. The 19 existing `it` blocks are byte-identical.
- Doc 036: append and header only.
- The other frozen files: 376 OK.
- No hardcoded colour, no `any`/`@ts-ignore`, and no new `// comment`.

**R33-U:**
- The §2.3 cases exist and are green.
- A's red-first output shows the focus-release cases (1–6) failing on the snapshot `StudioWorkspace.tsx`. Cases 7–10 may be green on the snapshot (they pin the exclusions and the regression). A labels which ones.
- C runs these mutations in a scratch copy outside `store/`; each must make a test fail. Report how each mutation was done:
  - (a) the handler removed → cases 1–6 fail;
  - (b) the "target is not a range input" condition removed → case 7 fails;
  - (c) the "no active gesture" condition removed → case 8 fails;
  - (d) the handler narrowed to clip targets only (`closest('[data-clip-id]')`) → cases 2 (lane body) and 4 (ruler) fail;
  - (e) the round-32 Delete guard removed → case 10 and the round-32 Delete-guard tests fail;
  - (f) `blur()` replaced by focusing the scroller element → record the result (information; the scroller is not focusable, so this is expected to fail cases 1–6).
- Round 32's mutation set (a)–(g) is not re-run, except (e) above.

**R33-Doc:** doc 036's new section covers §2.2 and matches the code.

### 4.7 Ableton source and compliance (workflow addendum 2026-10-11)

This is a bug round.

**Source:** the Ableton Live 12 Reference Manual §18.1 "The Live Mixer", captured as `b-round-29/ableton-mixing-20261012.txt` (gstack `/browse`, 2026-10-12; B re-read it on 2026-10-13).
- It describes the mixer controls and the double-click reset.
- **It says nothing about which view receives keys after a click on a clip, or about focus on a mixer control.**
- No video is used. B did not browse a new source; no Ableton claim is made.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A click in the timeline moves the edit context away from a fader | none captured | **Unconfirmed** (no source) | CZABA requirement from C-R32-01 (SRW-24 flow: Delete after selecting a clip deletes it) | R33-FT |
| A pending fader keyboard change is committed when focus leaves the fader | none captured | **Unconfirmed** | CZABA consistency with the existing `onBlur` commit | R33-KO |
| Delete on a really focused fader does nothing to the timeline | none captured | **Unconfirmed** | CZABA requirement (round 32) | R33-FT regression rows |
| Pan/Volume reset by double-click | §18.1 | **Confirmed** | Still stage 4b (round 34) | — (not this round) |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). Never write "Ableton does it this way" for an unconfirmed row.

### 4.8 Gates

**G33-1:**
- tsc 0;
- vitest = **1212** + A's new tests (≥ 11 new `it`), 0 failures. Record `node.exe`. If a failure is a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome `./app` (read-only): exactly the 2 baseline CRLF errors, 0 errors in Studio files, and warnings ≤ 218 + 1 info;
- these frozen tests are green: `track-pan.test.tsx`, `delete-selection-ui.test.tsx`, `detail-panel.test.tsx`, `clip-gain.test.tsx`, `all-lane-clipboard.test.tsx`, `track-layout.test.tsx`, `gesture-guard.test.tsx`, `master-ui.test.tsx`, `ArrangementContext.test.ts` and `render-budget.test.tsx`.

**G33-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-32-tree-sha256.txt` → 376 OK (or the documented CRLF exception);
- `git status --short` = §3.2 (9 or 4 lines);
- HEAD recorded at start and end.

**G33-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (during the R33-FT runs and a drag);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, the dev-module `GET /app/lib/r2.config.ts`, and the homepage hero image from `images.unsplash.com` before header navigation (C round 32 note; not workspace code).

**Not re-run this round:** the exports, the audio graph checks (R31-PE/PV/PL), the PUI geometry, R32-BC, the video sync checks and the C-R27-01 table. Nothing in the audio graph, the export, the scheduler, the video, the layout or the lane changes. R33-S and R33-K prove that.

### 4.9 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01, C-R6-02 and C-R8-01 (all Tech Lead);
- C-R23-01 (Tech Lead). Record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab`; round 32: 2 at 28013/28014, 63 520 bytes;
- C-R30-01 (polish);
- C-R31-02: fixed in isolation in round 32. It closes together with C-R32-01.

**Open low items:**
- R26-M1;
- MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, A-R31-REVIEW-2 and A-R32-REVIEW-1 (stage 4b);
- R9-REVIEWER-M1-L8 (4c);
- DEMO-SFX-FULL-SCALE; L3; LIB-SEP-REASON; R27-T; DOC034-UNREACHABLE-NOTE; DOC035-NOTES;
- FOCUS-TEXT-STALE (observation; record only).

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `b-round-32.md` §7):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- the CRLF Biome errors on the merged auth files;
- the tracked `frontend-architect.md` grants Write/Bash;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the fake Bearer gets 500 without a token;
- the CDP allowlist;
- `Content-Type` without a charset;
- the dev server's availability;
- **resolved:** the second remote. B ran `git ls-remote` on 2026-10-13, and both `TCzaba/czaba-store` and `shavidze/czaba-store` `master` are at `1cefea1` (matches `publication-checkpoint.json` `oct13Checkpoint.status`);
- **round 31's 7 C-verified files are ready for root's checkpoint commit.** Round 32's files (`StudioWorkspace.tsx`, `fader-guards.test.tsx`, and the round-32 parts of `ArrangementLane.tsx` and doc 036) wait for this round's C PASS. `ArrangementLane.tsx` and doc 036 contain both rounds' changes, so in practice root commits round 31 + 32 + 33 together after C passes round 33, or round 31's five untouched files first.

**Tech Lead manual checks:**
- the `feature-status.md` §5 list, including R30-T and R31-T;
- **R33-T (new):** with a real mouse in real Chrome: click a fader, click a clip, press Delete;
- TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
sha256sum -c ../tmp/studio-real-loop/b-round-32-tree-sha256.txt | grep -vc ': OK$'
npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
diff -u ../tmp/studio-real-loop/b-round-32-snapshots/StudioWorkspace.tsx app/components/arrangement/StudioWorkspace.tsx
diff -u ../tmp/studio-real-loop/b-round-32-snapshots/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If the server is up, A may do one browser smoke check (`a-browse.json`): a real click on the music Volume, a real click on a clip, Delete, and the clip is deleted. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G33-1/2, R33-S, R33-U, R33-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-33.md`:**
1. the pre-flight gate, including the §1.4 grep tables;
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations and the §2.4 self-check results.

Do not claim PASS.

**C → `c-round-33.md` and `c-round-33.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the R33-FT table with `activeElement`;
- the hook counts;
- the mutation table;
- the record-only results (§4.5);
- the Ableton two-verdict table (§4.7);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers. **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- If C confirms FOCUS-TEXT-STALE, B plans it as its own small bug round before 4b.
- **Round 34 — SRW-13 stage 4b** (fader UX for Volume, Master and Pan):
  - no jump to the click point;
  - double-click reset (Live §18.1);
  - per-key entry coalescing;
  - A-R29-REVIEW-1;
  - the pending-commit order;
  - MASTER-HOLD-TICK-EDGE;
  - A-R31-REVIEW-2;
  - A-R32-REVIEW-1;
  - the stale refusal status.
- **Round 35:** stage 4c (round-9 M1/L8), then polish (C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE).
- **Then:**
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including the edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 33 -StartPhase A` and a higher limit.
