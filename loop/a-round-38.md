# A — Round 38 report: SRW-13 stage 4b-1 (fader press does not jump, relative drag, double-click reset)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-13 · Task: `current-task.md` (Round 38, D-29z3). Not a PASS claim; C verifies.

## 1. Pre-flight gate (+ §1.4 re-checks)

**Baseline before any edit:**
- HEAD `134b4aba`; `git status --short` was empty;
- `b-round-37-tree-sha256.txt`: 0 non-OK (376 OK);
- my 3 files matched the snapshots (`b689c710` / `0de72e4f` / `3d120483`);
- protected 4/4 OK;
- `node.exe` = 7.

**Read before the first edit:**
- `.claude/rules/read-primitives.md`;
- the primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT, AUDIO_ARCHITECTURE, DESIGN_TOKENS, TAILWIND_FIRST, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS;
- `prompts/new-hook.md`, `prompts/studio-feature.md` and the `pre-flight` skill;
- the source and test ranges of §1.3, and `b-round-37/probe-pointerdown.txt`.

**Pre-flight gate:**
- **Assumptions:**
  - the contract is exactly D-29z3, and every needed context API exists, so `ArrangementContext.tsx` stays untouched;
  - a press calls `preventDefault`, then refuses if a gesture is active, otherwise does `focus()` → `begin`;
  - the drag comes from window `pointermove` filtered by `pointerId` and stops on blur, pointerup or pointercancel;
  - double-click calls the existing APIs with no extra condition.
- **Smallest version:** `fader.ts` (~30 lines), the hook (~90), the Lane/Master wiring (~45), plus the tests and the doc.
- **Files:** exactly the 7 of §3.2.
- **Success:** fader-click all green; fader-guards 71/71; full vitest = 1264 + N; tsc 0; build ✓; Biome adds 0 errors.

**§1.4 re-checks:**
- **`commitHistory` drops an equal snapshot** (`model.ts` l.598-606, JSON compare): `previewTrackVolume(id, stored)` + `commitTrackVolume(id)` writes 0 entries. Proven by F3 (drag −25 then back to 0 → 0 entries) and D4 (dblclick at the default).
- **After `cancelTrackVolumeGesture` / `cancelMasterGainGesture`,** a later `previewTrackVolume` / `previewMasterGain` with no gesture would set `volumeBeforeRef` / `masterBeforeRef` (l.2063 / l.2315). So the hook stops on the fader's blur and on pointercancel (F8, F9/F9b).
- **`GESTURE_EDIT_BLOCKED_MESSAGE`** is exported (l.134). `setStatus` is in the context value (l.290). The Lane already destructured it; Master did not, so I added `setStatus` and `getArrangement` to its destructure.
- **`activeElement` assertions after a fader `pointerDown`:**
  - In `gesture-guard`, `track-pan`, `master-ui` and `clip-gain`, the only `activeElement` assertion is `track-pan.test.tsx` l.780, which comes after a reset-**button** click, not a fader `pointerDown`.
  - In `fader-guards`, only l.840 and l.1602 change under explicit focus. l.743/746, 765, 1513, 1532, 1552, 1566/1568/1573 stay green. **No other one found.**
- **No frozen test asserts the return value of `fireEvent.pointerDown` on a fader.**

## 2. Red run → green run

**Red** (`a-round-38/red-run.txt`; `fader.ts` stub returning `startValue`; 3 frozen lines amended):
- **22 failed / 71 passed (93):**
  - fader-click: 20 red;
  - fader-guards: exactly the 2 amended tests (l.835 SFX Volume self-check, l.1597 Master-press focus).
- **Green on old source:** P5 (the stub satisfies the guards) and D4 (must-not).
- **F8 and F9/F9b were red on old source,** but only because their drag precondition (`0.35`) fails with no relative drag. F1 was red through `pointerDown` returning `true` and the focus.
- **No other case was green on old source.**

**Green** (`a-round-38/green-run.txt`, final code):
- `fader-click.test.tsx` **26/26**, `fader-guards.test.tsx` **71/71**.
- The 26 are the 22 of B's table (P1–P5, F1–F9/F9b, D1–D6, T1, R1) plus 4 added after the review (§4): P6 and 3 must-not.
- The 4 extra tests were written after the implementation and were not red-run first. They are hardening, not red-first evidence.

## 3. Diff summary and hook signature

- **`app/lib/arrangement/fader.ts` (new):**
  - `relativeFaderValue({ startValue, deltaPx, widthPx, min, max, step })`;
  - returns `startValue` when any input is non-finite, `deltaPx === 0`, `widthPx ≤ 0`, `step ≤ 0` or `max ≤ min`;
  - otherwise snaps from `min` on the step grid, then clamps;
  - normalisation: `Number.parseFloat(v.toPrecision(12))`.
- **`app/hooks/useRelativeFaderDrag.ts` (new):** `useRelativeFaderDrag({ min, max, step, readStoredValue, isPointerGestureActive, beginGesture, previewValue, refuseGesture }) → onPointerDown`.
  - **Press:** `button !== 0` → return, not prevented. Otherwise `preventDefault()`. Then `buttons === 0` → return (the existing guard is kept).
    - If a gesture is active: `refuseGesture()`, then return.
    - Otherwise `focus()`, stop any previous drag, and `beginGesture(pointerId)`. If that is false, return.
    - Then read the width and `readStoredValue()`, and add window `pointermove` / `pointerup` / `pointercancel` / `blur` listeners plus a native fader `blur` listener.
  - **Move:** filtered by `pointerId`; previews only when the value changes.
  - **Stop:** removes every listener. It runs on that pointer's `pointerup`/`pointercancel`, the fader `blur`, a window `blur`, unmount, and a new press.
  - `optionsRef` is refreshed in an effect. A one-render-stale options object cannot change behaviour, because every option captures only stable identities (`track.id`, the context callbacks, `setPanDraft`, `getArrangement`).
  - It is not exported from `app/hooks/index.ts`.
- **`ArrangementLane.tsx`** (`a-round-38/diff-lane.txt`):
  - imports; `TRACK_VOLUME_STEP` / `TRACK_VOLUME_DEFAULT`;
  - `handlePanPointerDown`'s body became `beginPanPointerDrag(pointerId): boolean` (the button guard moved to the hook);
  - the new `handlePanPointerDown` comes from the hook: preview = `setPanDraft` + `previewTrackPan`, stored value = `round(pan·50)` from `getArrangement()`;
  - `handleVolumePointerDown` comes from the hook; `resetTrackVolume` = `previewTrackVolume(id, 1)` + `commitTrackVolume(id)`;
  - **Pan input:** `+onDoubleClick={() => setTrackPan(track.id, 0)}`, `+touch-none`;
  - **Volume input** (the same element serves the video track): `onPointerDown` → the hook, `+onDoubleClick`, `step={TRACK_VOLUME_STEP}`, `+touch-none`.
  - **Byte-identical:** `suppressPanPointerAfterBlur`, `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur`, the readout button, and Volume's `onChange` / `onPointerUp` / `onLostPointerCapture` / `onKeyUp` / `onBlur`.
- **`ArrangementMaster.tsx`** (`a-round-38/diff-master.txt`):
  - imports `GESTURE_EDIT_BLOCKED_MESSAGE` and the hook; `MASTER_GAIN_DEFAULT_DB = 0`; destructures `getArrangement` and `setStatus`;
  - the hook is wired; `resetMasterGain` = `previewMasterGain(0)` + `commitMasterGain()`;
  - on the input: `onPointerDown` → the hook, `+onDoubleClick`, `+touch-none`. The other handlers are unchanged.
- **`fader-guards.test.tsx`:** exactly the 3 lines of decision 6. The diff shows 3 `-` and 3 `+`.
- **`fader-click.test.tsx` (new, 26 `it`).**
- **`docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md` (new).**

## 4. Code-reviewer findings (real `code-reviewer` subagent) and dispositions

The reviewer scored it 8/10 with no High. It read only; it did not run gates.

| Finding | Severity | Disposition |
|---|---|---|
| Touch may still jump: Chromium's range may slide natively on `touchstart`/`touchmove`, and `pointerdown.preventDefault` does not stop touch events. Unverified (from the reviewer's memory) | Medium, unverified | **Not changed.** The fix (a non-passive `touchstart` with `preventDefault`) amends the contract. → **B / Tech Lead R38-T** (`A-R38-REVIEW-TOUCH`) |
| `optionsRef.current = options` during render | Low | **Fixed:** now refreshed in `useEffect` |
| No stop on a window `blur` | Low | **Fixed:** a window `blur` listener calls `stopDrag` |
| Optional: stop in `pointermove` when `!isPointerGestureActive()` or `buttons === 0` | — | **Rejected.** The contract forbids deciding by polling. Synthetic window moves carry `buttons` 0 |
| A vertical move from an off-grid value previews a snap | Nit | **Fixed:** `deltaPx === 0` → `startValue` (P6) |
| Mutation gaps: no-snap is not caught by P1/P3; nothing covers a foreign pointerId, a non-left button or an unmount leak | Nit | **Added:** P6 (`Δ −24.6` → 0.75; off-grid start with 0 Δ), plus 3 must-not tests (a foreign pointer and a vertical move change nothing; a non-left press is not prevented, starts no gesture and moves no focus; unmount removes the move listener). The `focus()`→`begin` order is still not separable in jsdom → noted |
| `previewTrackVolume` has no identity short-circuit, so a dblclick at the default costs one render | Nit | Context is frozen → 4b-2 material (in doc 037) |
| `focus({ preventScroll: true })` | Nit | Not applied: defensive only, and outside the contract |

## 5. Command tails (final code)

```
git rev-parse HEAD → 134b4aba8f4680a10c61313c692e51e15922c728 (start and end)
git status --short →
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/ArrangementMaster.tsx
 M app/lib/arrangement/__tests__/fader-guards.test.tsx
?? app/hooks/useRelativeFaderDrag.ts
?? app/lib/arrangement/__tests__/fader-click.test.tsx
?? app/lib/arrangement/fader.ts
?? docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md
sha256sum -c b-round-37-tree-sha256.txt | grep -vc ': OK$' → 0
protected: download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
npx tsc --noEmit → exit 0
vitest fader-click + fader-guards → Test Files 2 passed (2) · Tests 97 passed (97) [26 + 71]
vitest frozen 10 suites (gesture-guard, track-pan, master-ui, clip-gain, meter-ui, track-meter-ui, track-layout, render-budget, delete-selection-ui, ArrangementContext.test.ts) → Test Files 10 passed (10) · Tests 191 passed (191)
npm run verify → exit 0 (agents:check, test:agents, lint, typecheck, test:run: Test Files 70 passed (70) · Tests 1290 passed (1290), build ✓ built)
npx vitest run (standalone, final code) → Test Files 70 passed (70) · Tests 1290 passed (1290) (= 1264 + 26)
npm run build (standalone, final code) → exit 0, ✓ built
npx biome check ./app → Found 2 errors (the baseline CRLF format errors in app/lib/auth.ts and app/lib/__tests__/bug-hunting/auth-bugs.test.ts) · Found 218 warnings · Found 1 info
npx biome check <my 6 TS/TSX files> → Checked 6 files, no diagnostics
diff fader-guards snapshot → 3 '-' / 3 '+'
final shas (first 8): Lane 7de5a093 · Master 1707798c · fader-guards 9721d08f · fader.ts d754367a · useRelativeFaderDrag.ts dabedf7d · fader-click 65758397 · doc 037 263325b9
tasklist | grep -ci node.exe → 7 (start) · 6 (gates) · 7 (my browse daemon) · 6 (end)
```

Gate output files are in `a-round-38/`: `red-run.txt`, `green-run.txt`, `frozen-suites.txt`, `vitest-full.txt` (final 1290 run), `build.txt`, `biome-app.txt`, `verify.txt`, `diff-lane.txt`, `diff-master.txt` and `browser-smoke.txt`.

**`npm run test:e2e:smoke`: not run.** It starts its own dev server, which A must not do. That is root's job.

## 6. Deviations and §2.6 self-check

- **Deviations from B's text:**
  - **The new test file has 26 `it`, not B's 22.** The 4 extra came from the review hardening, so the expected full count is **1290**.
  - **A window `blur` stop and the `deltaPx === 0` early return** were added after the review. Both stay inside §2.1/§2.2. The window-blur stop is not a gesture-flag poll.
  - **The doc status is "In Progress"** (waiting for C), not "Completed". After the advisor check, the doc now says B *authorised* the 3 frozen lines and A edited them.
- **Self-check:**
  - every frozen suite of §2.6 is green (191/191), and the full vitest passes (1290/1290);
  - edge cases: a NaN or zero width, a NaN delta, off-grid values, a foreign pointer, a non-left button and an unmount mid-drag are all tested;
  - no `any`, no `@ts-ignore`, no type assertion, no code comment, no new colour (only `touch-none`).
- **Mutations:** not run by A (they are C's, §4.7 R38-U). The reviewer's reading says (a)–(h) are caught. (h) is caught via P5's last assert, P6 and F2's float noise, not by P1/P3.

## 7. Browser smoke (optional, one run; not a PASS claim)

`a-round-38/browser-smoke.txt`: gstack browse with `a-browse.json`, `http://127.0.0.1:5173/studio-lab`, 1440×900, anonymous.
- The first browse start printed "Server failed to start within 15s". A retried `goto` loaded (200).
- REAL `$B click` on Master → value `0`, `activeElement` = `Master Volume`.
- REAL click on music Volume → `1`, `activeElement` = `Volume — მუსიკა`.
- Undo and Redo are both disabled, so there are 0 entries. Round 37 gave −27 and 0.5.
- I stopped the browse daemon; `a-browse.json` was removed by browse.
- Not checked by A: the drag, dblclick, audio, Pan, the video Volume, and 1280×720.

## Known gaps / open

- **A-R38-REVIEW-TOUCH (Medium, unverified):** a native touch slide on the range may bring the jump back on touch devices. jsdom and synthetic C runs cannot show it → Tech Lead R38-T on a real touch device; B decides on a contract amendment (a non-passive `touchstart` preventDefault).
- **Real `dblclick` after a prevented `pointerdown`** is not verifiable in headless gstack (no dblclick command; CDP not allow-listed) → R38-T.
- **The `focus()`→`begin` order** is not isolated by a test (jsdom). Its effect is covered indirectly (R1, l.840/l.1602), but a reversal mutation would likely survive. → A-R38-TEST-ORDER for B.
- **Carried (unchanged):** every §4.10 item.
  - **Root:** rounds 31–37 committed as `134b4ab` (`publication-checkpoint.json` → `round37Checkpoint`); `npm run test:e2e:smoke`; SRW-21; Lenis on `/studio/*`; portable instruction paths; the export hard-clip; the CRLF auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA scroll with consent denied; fake Bearer → 500; the CDP allowlist; Content-Type charset; dev-server availability.
  - **Also open:** C-R27-01, C-R23-01, C-R6-02, C-R8-01, C-R30-01, C-R37-01, and the 4b-2 list.
- **Round 38 is ready for C**, not for a checkpoint: root commits only after C passes it.

## Exact next C checks

1. **G38-2:** HEAD `134b4ab` and the 7-line status above; 376 OK; protected 4/4; `diff -u` of the snapshots. Byte-identical: `suppressPanPointerAfterBlur`, `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur` and the readout button. fader-guards shows 3 −/3 +.
2. **G38-1:**
   - tsc 0;
   - vitest **1290** (= 1264 + 26);
   - build ✓;
   - Biome at exactly the 2 CRLF errors, ≤ 218 warnings + 1 info;
   - fader-guards **71/71**, fader-click **26/26**.
3. **R38-PG:** the REAL-click table (PG-V/S/VID/M/P/KEY/DEL/1280) against the round-37 values (0.5 / −27).
4. **R38-DR:**
   - the synthetic drags at measured widths (DR-V/VID/M/P/0/Y/1280);
   - DR-AU/DR-AU-P: `setTargetAtTime` during the move and 0 new `start`s.
5. **R38-DC:** DC-V/M/P/VID/0/G/SEQ, plus the DC-REAL info row.
6. **R38-MN:**
   - MN-Z: Zoom still jumps and has no `touch-none`;
   - MN-G;
   - MN-CR36: the field keeps focus and `3`;
   - MN-BLUR/MN-CANCEL: read `history.present` immediately after the stray move;
   - MN-RESET.
7. **R38-CR / R38-K / R38-U** (mutations a–h in a scratch copy; also try reversing `focus()`/`begin`), **R38-Doc**, **G38-3**, and the §4.8 two-verdict table.
