# B — round 37 result → round 38 dispatch (D-29z3)

Dispatcher: B · Date: 2026-10-13

**Inputs read:**
- the round-37 task: `current-task.md`, identical to the existing archive `tasks/round-37.md` (`cmp` SAME, so the archive was not overwritten);
- `a-round-37.md`, `c-round-37.md`, `c-round-37.json`;
- `backlog.json` v38, `feature-status.md`, `plan.md` (D-29z2, the round table), `b-round-36.md`, `b-next.json`;
- `publication-checkpoint.json` (`round37Checkpoint`: `134b4ab`, both remotes, verify 1264 + 2 smoke), `checkpoint-r37-review.md` (triaged in §5), `checkpoint-r37-resume.txt`, `root-pre-push-review.md` (unchanged items, carried in §6).

**Partial state from the earlier B-37 session (inspected before writing):**
- the backups `*.before-b-round-37*` existed;
- `backlog.json`, `feature-status.md`, `plan.md` and `b-next.json` were byte-identical to those backups, so nothing had been written yet;
- the backups were not re-created.

**Source read for the contract:**
- `ArrangementLane.tsx` (the Pan handlers l.255–336 and the Volume/Pan inputs l.578–652);
- `ArrangementMaster.tsx`;
- `ArrangementContext.tsx` l.2057–2410 (the Volume/Pan/Master preview/commit/begin/blur functions);
- `model.ts` l.589–611 (`commitHistory` drops JSON-equal snapshots);
- `StudioWorkspace.tsx` l.895–924 (both root captures) and l.1181–1184 (Delete on a range);
- `ArrangementTransport.tsx` l.186–200 (Zoom);
- `fader-guards.test.tsx` l.600–900, l.1228–1317 and l.1540–1606;
- a grep of `fireEvent.change` / `activeElement` across the fader suites.

**Advisor:** available, and called once before writing. Advice applied:
- inspect the partial state first;
- a new baseline: `134b4ab` with a clean tree, a new frozen list, snapshots and own gates;
- bookkeeping from C evidence only; B fixes its own C-R37-02 wording;
- round 38 = 4b-1 with the `preventDefault`-on-`pointerdown` design, which keeps the frozen `pointerDown` + `change` tests green;
- the exact frozen focus-test amendments are pre-authorised;
- the double-click verification limits are stated, and the Ableton table is precise.

A second call follows after the files are written; its outcome is in §8.

## 1. Archive, backups, artifacts

- `tasks/round-37.md`: the existing archive, identical to the round-37 `current-task.md`; not modified.
- The backups from the earlier session were kept as they were. Checkpoint: `b-round-37-checkpoint.md`.
- Scripts: `b-scripts/b-round-37-backlog.cjs` (v38 → v39), `b-round-37-plan.cjs`, `b-round-37-feature-status.cjs`.
- New baseline files:
  - `b-round-37-tree-sha256.txt`: 376 = round 36's list − `ArrangementLane.tsx` − `ArrangementMaster.tsx` + `ArrangementDetailPanel.tsx` + doc 036; 0 non-OK;
  - `b-round-37-snapshots/`: Lane `b689c710`, Master `0de72e4f`, fader-guards `3d120483`.
- Ableton captures in `b-round-37/` (2026-10-13, gstack `/browse`, own state `b-browse.json`): `ableton-live-keyboard-shortcuts-20261013.txt`, `ableton-live-concepts-20261013.txt`, `ableton-working-with-instruments-and-effects-20261013.txt`, `ableton-first-steps-20261013.txt`.
- The mechanism probe: `b-round-37/probe-pointerdown.txt`.

## 2. Independent verification (`b-round-37/gates.txt`, 18:53–18:56, `node.exe` 8 → 8)

- HEAD `134b4ab`; `git status --short` is empty; `git ls-remote origin master` = `134b4ab`.
- Frozen 376 OK (both the old r36 list and the new r37 list: 0 non-OK).
- Protected 4/4 OK; `curl /studio-lab` 200.
- tsc exit 0; vitest **69 files / 1264 passed**; build exit 0.
- Biome `./app`: 2 errors. Both are `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts` (CRLF, root's), plus 218 warnings and 1 info.
- **Probe:** this used B's own browser context, with listeners injected via `$B js` only and no source change.
  - With `preventDefault` on Master's `pointerdown`, a real `$B click` gives value `0` (unchanged), events `pointerdown, pointerup, click`, and `activeElement` BODY.
  - Control without it: value `−27`, events `pointerdown, mousedown, input, focus, pointerup, mouseup, change, click`, focus on Master.
  - Widths at 1440×900: Master 96, Volume 107, Pan 48, Zoom 80 px.

## 3. Round-37 verdict (C evidence only)

- **C PASS on every ID** (G37-1..3, R37-S, PG, MN, CR, K, U, Doc). B's gates reproduce 1264.
- **Closed:**
  - C-R36-01 (R37-PG; mutation a = snapshot source → exactly N1–N3 red);
  - A-R36-TEST-NITS (R37-S, mutation e);
  - DOC036-R36-REVIEW-SENTENCE (R37-Doc).
- **C-R37-02 — B's wording, closed by B.** `plan.md` never contained the table. The wrong row 5 ("normalised-equal text → early return") is in the archived task only. D-29z3 now records the correct behaviour: `commitClipGain` l.330 compares the **raw text** (C MN-2b). The archive stays unchanged.
- **New, open:**
  - C-R37-01 (Low → 4b-2, together with the stale status);
  - DOC036-R37-TAIL and DOC036-ROUND-REF (Low → polish);
  - A-R37-TEST-HARDENING (Low; A's review R4/R5).
- **Statuses:**
  - FB-04 → **მოწმდება**: every C ID passes; only Low C-R37-01 is open, with no data loss. This is the same convention as FB-05.
  - SRW-13 stays **ბაგია** (C-R27-01, Tech Lead), and 4b-1 is in progress.
  - Nothing new moves to **მზადაა**.

## 4. Round 38 — SRW-13 4b-1 (D-29z3) and why

**Why this scope now:**
- There is no Critical/High bug.
- No open Medium is assignable without the Tech Lead (C-R27-01, C-R23-01, C-R6-02, C-R8-01).
- The remaining Lows are queued in 4b-2 or polish, and none involves security or data loss.
- So the next dependency-ordered scope runs: stage 4b. The plan already split it into 4b-1 and 4b-2. 4b-1 is one user-visible feature, the fader press/drag/double-click on all mixer faders. The double-click depends on the no-jump press: without it, both clicks of a double-click would jump and write entries.

**Smallest honest design:**
- The suite models a drag as `pointerDown` + `fireEvent.change` (44 + 11 + 10 call sites). So the jump cannot be "compensated" on the first `change`.
- `preventDefault` on `pointerdown` removes the native jump in Chrome, as the probe shows. The real drag then comes from `window` `pointermove` into the **existing** preview functions, and `onChange` stays for the keyboard and those tests.
- The context needs no change: `commitHistory` drops equal snapshots, so a press with no move writes nothing.
- A prevented press loses the native focus. So the fader focuses itself on a successful claim, which keeps Delete a no-op and the arrows working after a click (the round 32–33 contract).
- With that, exactly two frozen assertions change: l.840 and l.1602, plus the l.1597 title. Both pinned the jsdom-only "focus stays put"; Chrome never behaved that way. B pre-authorised exactly those 3 lines, so round 35's frozen-test stop does not repeat.
- B's audit of every other `activeElement` assertion after a fader press: l.743/746, 765, 1265/1272, 1551/1552 and 1566/1568/1573 stay green (the explicit focus happens only on a successful claim).

**Pitfalls written into the task as re-checks/tests:**
- After a blur-cancel, `previewTrackVolume` / `previewMasterGain` with no gesture would create a pending preview that a later blur commits. The hook must stop on blur/cancel (F9b, MN-BLUR, mutation f).
- A refused press (another gesture) must show the existing status, because the native refused `change` that used to show it no longer fires.
- C-R36-01's path now keeps the field focused: MN-CR36.
- CR-1 changes from `[Clip Gain, Volume]` to `[Clip Gain]`: R1, CR-1.

**Rejected:** jump compensation; `mousedown` only; a custom `role="slider"`; `preventDefault` in the root capture (it would hit Zoom and amend D-29z decision 5).

**Verification honesty:**
- C proves the no-jump press with **real** clicks.
- The drag and the double-click can only be synthetic: gstack has no drag/dblclick, and the CDP `Input.dispatchMouseEvent` call is not allow-listed.
- So DR and DC are labelled synthetic, and the real feel is Tech Lead row R38-T.
- The live audio of the drag is checked with `setTargetAtTime` / `start` hooks (DR-AU, DR-AU-P).

**Drag scale:** full rendered width = full range, snapped to the step. B does not take this from Ableton; it is the smallest honest mapping (the thumb moves about as far as the pointer). The doc records it, and Shift fine-drag stays T12.9.

## 5. Triage of `checkpoint-r37-review.md` (no blockers)

| # | Finding | Disposition |
|---|---|---|
| 1 | Pan keyboard can stay locked after a lost release (blur suppression) | CP-R37-PAN-KEY-LOCK → 4b-2, with A-R32-REVIEW-1 (same root cause) |
| 2 | window-blur abort without an element blur → drag via the keyboard path, one entry per event | CP-R37-DRAG-ENTRIES (info) → re-evaluate after round 38 (the Pan drag moves to pointermove) |
| 3, 4 | `trackPanValue` / `handle.setTrackPan` have no clamp | CP-R37-PAN-CLAMP **accepted**: no import or persistence exists; reopen if one is added |
| — | "keep the two preview mechanisms; unify in 4b" | noted; 4b-1 deliberately reuses both as they are (context frozen) |

## 6. Ableton (workflow addendum)

New source browsed today: Live 12 Reference Manual §42 "Live Keyboard Shortcuts" (https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/, 2026-10-13):
- §42.4 "Reset Parameter Value — Delete or double-click" (device parameters);
- §42.6 "Return to Default — Delete" and "Finer Resolution When Dragging — Shift".

§18.1 (capture of 2026-10-12): "Double-clicking the Pan control resets it to its default value."

No text about a no-jump click was found in §18.1, Live Concepts, Working with Instruments and Effects, First Steps or §42.

Verdicts for round 38:
- Pan reset: **confirmed**.
- Volume/Master reset: **unconfirmed** for the mixer.
- No-jump press: **unconfirmed** (a CZABA requirement).
- Delete-to-default: **confirmed in Live; a deliberate difference** (it would collide with the round 32–33 Delete contract on a focused fader).
- Shift fine-drag: confirmed; it belongs to T12.9.

No video was used.

## 7. Root and Tech Lead items (carried)

- **Root:**
  - rounds 31–37 are committed and published (`134b4ab`); round 38 becomes ready for a checkpoint only after C PASS;
  - `test:e2e:smoke` (root only);
  - SRW-21 (the middle-east loader);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS (no limiter; out of scope as an effect);
  - the CRLF auth files;
  - the `frontend-architect.md` grant;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - fake Bearer → 500;
  - the CDP allowlist (it now also limits the real dblclick/drag checks);
  - `Content-Type` without a charset;
  - the dev server's availability.
- **Tech Lead:**
  - C-R23-01 (React 19 or an `entry.server.tsx` grant);
  - C-R27-01, C-R6-02 and C-R8-01 (quiet Chrome);
  - DEMO-SFX-FULL-SCALE;
  - TL-Q-FB05-FB11;
  - the manual rows R35-T (now live), R38-T (after round 38), R30-T, R31-T, R33-T and R34-T.

## 8. Decision

**CONTINUE.**
- **Not BLOCKED:** no external info, approval or credentials are needed for round 38, and the dev server answers 200.
- **Not COMPLETE:**
  - 4b-1/4b-2/4c and polish remain;
  - FB-06/07/09..13 (SRW-14..20) have not started;
  - the SRW-21 adapter remains;
  - the Tech Lead Medium bugs C-R27-01, C-R23-01, C-R6-02 and C-R8-01 are open;
  - the full regression and the root review are still to do;
  - then T12.
- No Critical/High bug is open. Purchase protection holds (C G37-3: anonymous token 401, `/studio/middle-east` → Sign in required).
- **Ready for a root checkpoint:** nothing new (rounds 31–37 are already in `134b4ab`).

**Second advisor call (after writing):** it found three task errors, all fixed in `current-task.md`:
1. R38-S had listed `handlePanPointerDown` as byte-identical, although A must change it. Now only `suppressPanPointerAfterBlur`, `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur` and the readout are frozen.
2. MN-BLUR used a ruler click, which does not blur a fader during a gesture (D-29z row 2; fader-guards l.750). It now uses a REAL `Tab`, or a labelled synthetic `blur()`.
3. F9b now asserts that `history.present` is unchanged immediately after the stray move, followed by a committing blur.

Also tightened:
- F1/F2 now use the fader-guards fixture value 0.6 (→ 0.35).
- The hook must stop permanently on its own blur and on the release/cancel of its pointer, not by polling the global gesture flag.
- DR-AU's "0 starts" is now backed by B's read of `syncPlayback` (l.876/898: a volume-only change keeps `scheduleKey` and goes through the handle).

`tasks/round-38.md` is not created now; it is archived when round 38 completes.
