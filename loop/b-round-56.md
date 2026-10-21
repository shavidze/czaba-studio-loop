# B — Round 56 result → Round 57 dispatch (D-29z22)

Dispatcher: B · 2026-10-17, one session (20:54–21:1x +04) · Evidence folder: `b-round-56/`.

I changed only planning artifacts: B files in `tmp/studio-real-loop/` and `docs/technical/studio-real-workspace/plan.md`. I did not touch app source.

## 1. Resume state and inputs

- **Fresh B start.**
  - `b-round-56-result.json` was empty; the harness writes it.
  - There was no `b-round-56.md` and no `tasks/round-56.md`.
- **Archive:** `current-task.md` → `tasks/round-56.md` (new file, `cp -n`, `cmp` equal). No archive was overwritten.
- **Backups before any write:** `current-task.before-b-round-57.md`, `backlog.before-b-round-57.json`, `feature-status.before-b-round-57.md`, `b-next.before-b-round-57.json`, `plan.before-b-round-57.md`.
- **Checkpoint:** `b-round-56-checkpoint.md`.
- **Read:**
  - `tasks/round-56.md`, `a-round-56.md`, `c-round-56.md`, `c-round-56.json`, `b-round-55.md`;
  - `backlog.json` v58 (SRW-14 stages, open findings) and `feature-status.md`.
- **Root files:** `root-pre-push-review.md` (mtime 2026-10-07 18:22) and `publication-checkpoint.json` (2026-10-17 11:11) are unchanged. Their open items are carried verbatim in `current-task.md` §4.9.
- **Root activity:** none since 11:11. Neither the servers question nor ARCH-CHECKPOINT has an answer.
- **Source read (read-only):**
  - `grid.ts` l.1–60 and `formatGridDivision` (l.84);
  - `StudioWorkspace.tsx`: `isTypingTarget`/`isLoopBraceTarget` (l.218–265), `toggleSnap`/`changeGridDivision` (l.813–830), `releaseEditFocusOnTimelinePointerDown` (l.930), the lane-background handler (l.963), the window `keydown` (l.1069–1100, l.1298) and the grid control and lanes JSX (l.1465–1580);
  - `ArrangementLane.tsx`: props (l.73–99), the timeline element (l.720–745) and the clips inside it (l.826–897);
  - `ArrangementLoopBrace.tsx` l.195–260;
  - every `event.button` guard in `components/arrangement`. There is no `onContextMenu` anywhere.
- **User source:** `docs/video-to-text-bugs/transcripts/2.srt` 00:06:41–00:07:53: "choose the grid … or with the right click …"; "we must have free".
- **B's own measurements** (`b-round-56/gates.txt`):
  - HEAD `038ed5a`; 22 status lines (case A);
  - protected 4/4; `node.exe` 9;
  - `:5173` and `:5199` `000` at 20:54 and 21:02;
  - new frozen list 410, 0 non-OK;
  - Biome on the 3 LF owned files: 0 diagnostics.

## 2. Round 56: what C evidenced

| ID | C verdict | Evidence |
|---|---|---|
| G56-2 | PASS (HEAD `038ed5a`, 22 lines, frozen 409, snapshots 4/4, protected 4/4) | `c-round-56.md` G56-2 |
| R56-S | PASS with R56-S-DEV1 (Biome re-indent + 2 `toBe(` re-wraps; token-equivalent by C's own `tokeq.cjs`) | R56-S |
| R56-U | PASS: M1 15000, M2 15000 (nested), M3 5000, M4 5000 (non-owned), M5 15000; durations within 2× | R56-U |
| G56-1 | PASS (tsc 0, Biome at baseline, 87 / 1504, build, verify rc 0 on attempt 1) | G56-1 |
| R56-LOAD | PASS: control 0 timeouts, 3 valid loaded runs 0 timeouts → **closure form 2** | R56-LOAD |
| Browser half, G56-3 | not run (environment, fifth round) | §4.5 |
| New bugs | none | — |

**Backlog changes, made only from that evidence** (`backlog.json` v59, `b-round-56/update_backlog.py`):
- **C-R48-01 → closed (form 2).** In feature-status it is **დაიხურა** (the bug convention), with C's wording "not reproduced under test load; headroom proven only by M1–M5".
- **New:**
  - R56-S-DEV1 (info, **accepted** — the token-equivalence rule for later suite-option edits);
  - R57-T-TECH-LEAD.
- **Updated:**
  - C-R48-01-GRID-RESIDUAL, C-R51-02 → scheduled for round 57;
  - C-R51-01, INFO-R55-FREE-ROUND-UNGUARDED, A-R55-REVIEW-SHIFT-MIDDRAG-TEST, CTRL-DIGIT-BROWSER-RESERVED → 4b-2 (round 58);
  - ENV-DEV-SERVER-DOWN-R52 (fifth round), ROOT-COMMIT-ROUND51, ARCH-CHECKPOINT-SRW14-PREFS;
  - SRW-14 stage 4 and 4b (split), rounds, planned_rounds and floor/expected.
- **Nothing promoted to მზადაა for features.** Stage 4a still has no browser evidence. G-3 last passed in a browser in round 51 (G51-3; C's "never" refers to rounds 52–56).
- **Architecture signal (round 56):** A's proposal that StudioWorkspace's jsdom mount cost is the real cause, with a root `testTimeout`/worker cap as the systemic lever. Recorded in `architecture_signals`, **not scheduled**.

## 3. B decisions (D-29z22)

1. **Round 57 = SRW-14 stage 4b-1. This explicitly narrows D-29z21's "no more grid code without stage-4a browser evidence".**
   - **Reason:** the browser-independent pool is empty, and the user said not to delay core features indefinitely.
   - **Why it is safe:**
     - The menu is a second entry point to the existing `changeGridDivision`/`toggleSnap` state.
     - No snap, edge or precision logic changes.
     - `grid.ts`, `selection.ts`, `ArrangementClip.tsx`, `ArrangementRuler.tsx` and `ArrangementLoopBrace.tsx` are frozen, so the stage-4a diff stays exactly as C reviewed it.
   - **Accepted risk:** the uncommitted StudioWorkspace/Lane unit grows. Root can avoid that by committing 50–55 and 56 first.
2. **4b split (not a cut):**
   - **4b-1 (round 57):** the menu, C-R51-02 and GRID-RESIDUAL.
   - **4b-2 (round 58):** narrow/widen keys after B's Chrome Ctrl+digit check, the C-R51-01 probe, and the INFO-R55 and SHIFT-MIDDRAG tests.
3. **C-R51-02 is in this round ("C bugs first").** Its fix site is the capture handler that every lane right-click passes through. The menu's focus return depends on it.
4. **GRID-RESIDUAL is in this round.** It is the mechanical D-29z21 form in the two grid-snap files. The new mounting file gets the same headroom **from birth**: a new file has no 5 s history to mask, and a hang still fails. This rule wins over "evidence-only", and the choice is recorded.
5. **Smallest honest UI contract (rationale recorded in task §0.1):**
   - **Where it opens:** the lane timeline area, including clip bodies, because the user said "right-click" and clips have no other menu. Headers, ruler and library keep the native menu.
   - **Items:** the 7 existing divisions and `Snap (G)`, for the user's "free". No adaptive/fixed modes, no triplets, no narrow/widen items.
   - **No edit on right-click.** The menu does not open during a gesture.
   - **Keyboard events stop inside the menu**, so Space, G, Delete, Ctrl+Z, the arrows and Escape never reach the window handlers.
   - **The dismissing press is consumed**, like a native menu.
   - **Focus return** goes to the element focused at the first open. The keyboard ContextMenu key gets no handling; the header `<select>` and `G` remain the keyboard path.
6. **Test contract:**
   - exactly 19 named tests (GM1–GM15, FR1–FR4) → **88 / 1523**;
   - mutations a–g, each with named victims;
   - the C extras (h)/(i) are info.
   - Snap starts **off** (`useState(false)`, l.324), so GM4/GM5 turn it on first.
7. **The CRLF trap** is written out: `StudioWorkspace.tsx` 1673/1673 CRLF, no `--write`, and the stdin format check.

## 4. Scheduling

- **Round 58:**
  - round-57 bugs or browser bugs first;
  - otherwise 4b-2. B checks Chrome's Ctrl+1/Ctrl+2 handling before dispatch; that needs a browser, so if none is available B records the result as unconfirmed and chooses keys that do not depend on it.
- **Then:** 4c (C-R52-T1), SRW-15 (+ stage 5), SRW-16..20, Lows, SRW-21, full regression and root review, T12.
- **No scope cut, nothing labelled deferred.**
  - Out of scope as before: plugins/effects, pitch, multiple video layers and time-stretch. Grid tempo is not audio stretch.
  - `/studio-lab` stays demo-only, and the protected purchase/auth files stay unchanged.

## 5. Ableton

The source is the re-used capture `b-round-46/ableton-6.7-6.10-20261016.txt` (Live 12 manual ch. 6, §6.10; captured 2026-10-16, re-used 2026-10-17). I took no new capture, watched no video and used no Live installation.

| Behaviour | Ableton conformance |
|---|---|
| Lane context menu for the grid width | **confirmed**. The content (seconds divisions, no adaptive/fixed, no triplets) is a **deliberate difference**. |
| Grid items on a clip's menu | **unconfirmed** — no source |
| Snap in the context menu | **unconfirmed** — no source |
| Right-click does not edit | **unconfirmed** — no source |
| Keyboard ownership (C-R51-02) | **unconfirmed** — no source |
| Placement of the "current spacing" display | **deliberate difference** |
| Ctrl+1/2 | confirmed in §6.10, but → 4b-2 |

## 6. Requests to root

1. **Servers, fifth round:** start `:5173` and `:5199` before C, **or answer yes/no: can they be restored here?**
   - A "no" is external missing information. B would then ask the user how completion is to be evidenced without a browser.
   - On silence, B keeps dispatching offline-verifiable dependency-ordered stages and records the browser debt per ID.
2. **Commits:**
   - round 56 is commit-ready (C PASS);
   - rounds 50–55 are root's decision (no browser evidence);
   - committing both before A round 57 keeps round 57 separately reviewable.
3. **ARCH-CHECKPOINT-SRW14-PREFS** (bounded, non-gating): the 4b feature boundary and the fifth round on one owner. The menu is another consumer of `snapEnabled`/`gridSeconds`. Answer keep/extract, value, risk, ≤ 3 sentences.
4. **Optional:** a root `testTimeout` or worker cap (the systemic lever for C-R48-01).

## 7. Root follow-up and commit readiness

- **Round 56** (4 test files + doc 049): **commit-ready** on C's round-56 PASS (`test(store): … C-R48-01 timeout headroom`).
- **Rounds 50–55** (17 paths): no open C defect, but no browser evidence. Committing is root's decision; it is not a PASS.
- **Carried from `root-pre-push-review.md` / `publication-checkpoint.json`** (unchanged, listed in task §4.9):
  - video sync RF3-1/RF3-2/R5-L6 (C-R27-01);
  - R5-L3 partial; R5-L5/R5-E1/R6-S2/R6-S3 unit-only;
  - Medium M1 (rAF-only loop refill in a hidden tab) and M2 (context re-renders);
  - Lows L1–L4, L6–L8;
  - SRW-21 `middle-east` hardcode; portable paths; scrollbar refinement; library/stems parity; T12.

## 8. Advisor

The advisor was available.

**Call 1, after orientation.** I applied all of it:
- the explicit D-29z22 narrowing;
- C-R51-02 included;
- the contextmenu target, gesture guard, keyboard isolation with assertions, focus return and the CRLF trap;
- GRID-RESIDUAL closed in the same pass, with headroom from birth recorded;
- the exact test count;
- the Ableton row;
- evidence-only backlog moves;
- the servers yes/no put to the user in plain words.

**Call 2, after writing:** §8.1.

## 9. Outputs

- `current-task.md` (round 57) and `tasks/round-56.md` (archive);
- `backlog.json` v59 and `feature-status.md`;
- `plan.md` D-29z22 (CRLF 1344/1344);
- `b-next.json`;
- `b-round-56-r57-tree-sha256.txt` (410) and `b-round-56-r57-snapshots/` (4 + SHA256SUMS);
- `b-round-56/` (gates, owned, frozen paths, biome-owned-lf, update scripts);
- `b-round-56-checkpoint.md`.

The harness writes `b-round-56-result.json`.

### 8.1 Addendum — second advisor call

The advisor agreed with CONTINUE, D-29z22, the evidence-only backlog moves, the 25-line status math and 1504 + 19. I applied:
1. **Biome a11y vs. "no comments" vs. "0 diagnostics"** (§0.1 M11):
   - Preferred: a native container with `<button role="menuitemradio|menuitemcheckbox">` items, so no suppression is needed.
   - Otherwise exactly the `ArrangementLoopBrace.tsx` l.206/208 precedent applies: one `biome-ignore` citing D-29z22, recorded as a deviation.
2. **jsdom focus:** FR1–FR4 and GM11 focus explicitly with `element.focus()` and assert it before the press. `fireEvent.pointerDown` moves no focus, so without this mutation (f) would survive.
3. **M6 reworded:** a reopen only replaces the position. I dropped the "first open focus" claim, which needed no extra state. M10 stores focus when the menu opens from closed. C extra (i) was adjusted to match.
4. **M3:** removed the false "`<select>` re-selection" comparison.
5. **feature-status:**
   - C-R48-01 now uses the bug convention **დაიხურა**, not the feature word მზადაა.
   - R57-T was added to the §5 Tech Lead table as well as the top list.
