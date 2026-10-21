# B — Round 43 → Round 44 planning (D-29z9)

Dispatcher: B · 2026-10-15 · planning artifacts only (no app source touched).

## 1. Inputs read

- `tasks/round-43.md` (the archived round-43 task; copied from `current-task.md` before rewriting, not deleted).
- `a-round-43.md`, `c-round-43.md`, `c-round-43.json`, `backlog.json` (v45), `feature-status.md`, `docs/technical/studio-real-workspace/plan.md`, `agent-workflow.md`.
- `publication-checkpoint.json`, `root-pre-push-review.md`, `checkpoint-r43-root-review.json`, `checkpoint-r43-push.log`, `root-r43-publication-note.txt`.
- Source (read-only): `ArrangementContext.tsx` l.520–600, 740–850, 925–975, 1020–1050, 2060–2190, 2310–2340, 2785–2840; `model.ts` l.439–472; `ArrangementLane.tsx` l.325–345; greps for `transportRunning`, `must be used within`, `setTrackMix`, `previewTrackVolume`, `renderLog`.

**Pre-revision backups:**
- `current-task.before-b-round-43.md`
- `feature-status.before-b-round-43.md`
- `b-next.before-b-round-43.json`
- `backlog.before-b-round-43.json`
- `plan.before-b-round-43.md`

Earlier `*.before-b-round-42.*` files are untouched.

## 2. Round 43 result — what changed in the backlog, and why

**C PASS on every contracted ID** (`c-round-43.json` `taskStatus: PASS`, `bugs: []`):
- G43-1/2/3; R43-S; R43-HT-TOP/ZERO/LOW/FLOOR/1280/TRACK/BAND;
- R43-U (a, b, c, d-equivalence-confirmed, e);
- R43-REG-METER/FADERS/PAN/DEL/CG;
- R43-Doc.

| ID | Backlog change | Evidence |
|---|---|---|
| MASTER-HOLD-TICK-EDGE | closed | R43-HT real-playback geometry (`c-round-43.md` §3) + R43-U a/b/c |
| A-R37-TEST-HARDENING | closed | R43-S fader-guards diff; R43-U (e): N5 is red at the new pin and green on the snapshot file |
| A-R38-TEST-ORDER | closed **as equivalent** | `c-round-43.md` §4: mutation (i) survives 155/155; C independently read every cited handler and could not construct a differing case. Not a detecting test |
| TASK-R43-HTZERO | closed (task wording) + harness rule | `c-round-43.md` §8 |
| ROOT-ROUND42-CHECKPOINT-RECORD | closed | `publication-checkpoint.json` now has `round42Checkpoint` (`b6a96f8`) |
| ROOT-ROUND43-CHECKPOINT-RECORD | new, open_root | `2c0f800` on both remotes, no `round43Checkpoint` yet |
| ENV-BROWSE-DAEMON | round-43 record + approved fallback | `c-round-43/runs/daemon-diag.txt` |

Round 43 → `C PASS`. Root commit `2c0f800`:
- B ran `git ls-remote` at 12:06 and both `TCzaba/czaba-store` and `shavidze/czaba-store` were at `2c0f800`.
- Earlier, at about 12:03, shavidze still showed `b6a96f8` while root's push was running.
- The commit holds exactly the 5 round-43 paths. Their shas equal C's: `849e6b40`, `f60b34d9`, `93eb697a`, `113d74b4`, `f91ab6cb`.

## 3. Dispositions without code (D-29z9)

- **A-R43-EXACT-5DB (Low) → accepted.**
  - At exactly +5.0 dB the unclamped tick centre is (65/66)·80 = 78.79 px and the clamped one is 79 px: Δ 0.21 ≤ 0.5.
  - Both are inside the box, so every round-43 rule holds for either `>` or `≥`.
  - C saw the 0.21 px step and judged it allowed.
  - A direct pin would need a new export from a component.
- **A-R43-REVIEW-W66 (Low) → accepted with a watch condition.**
  - The meter is `w-20` and frozen.
  - Any future task that changes the Master meter width must re-measure R43-HT. This is recorded in the backlog and feature-status.
- **A-R43-REVIEW-ROOTFONT (info) → accepted.**
  - At the Store's 16 px root font the guarantee holds. Browser zoom scales px and rem alike.
  - Already documented in doc 040.
- **TASK-R43-HTZERO → closed** as a B task-text gap. The standing harness rule is "video Mute on" for ≈ 0 dBFS meter fixtures (`backlog.harness_rules`, from round 44).
- **ENV-BROWSE-DAEMON → approved fallback.**
  - The fallback is C's round-43 workaround: a self-launched `server-node.mjs`, `BROWSE_PARENT_PID=0`, a fresh state file and a log.
  - It is allowed after one CLI daemon failure, and the command, PID and log are recorded.
  - Still no `$B restart`, and no foreign process is killed.
  - This is smaller than letting C exceed the retry budget again. It weakens no criterion.

## 4. Round 44 — why stage 4c, and the contract choices

**Ordering:**
- There is no open Critical/High bug.
- The open C bugs (C-R41-01, C-R27-01, C-R6-02, C-R8-01, C-R23-01/C-R38-01) all wait on the Tech Lead.
- So the next item is the plan-approved stage 4c (`plan.md` round table, row 44).
- Round size: three small changes in one file.

**R9-REVIEWER-M1: removal, not rename.**
- Source read: `transportRunningRef` is read only at l.836, inside the guard that decides whether to set it again.
- No other reader exists in `app/` (grep). Renaming it would keep dead code.
- No unit test can catch re-adding dead code, so none is invented. Acceptance is:
  - grep 0;
  - the full suite (including `render-budget` R9-L2);
  - C's transport walk in the browser (R44-TR: play/stop/resume, the end, loop wraps with audio continuing, seek, library preview handover).
- Stop condition: if A finds another reader, it stops and reports.

**R9-REVIEWER-L8:**
- The text becomes `useArrangementPositionStore must be used within an ArrangementProvider`.
- No test pins the old text (B grep), so the new L8a pin is red-first.
- L8b is a must-not pin on `useArrangement`.

**PREVIEW-VOLUME-IDENTITY:**
- `setTrackMix` (`model.ts` l.439) always returns a new object, so a `next === present` check (as in `previewMasterGain`) would never fire.
- Options:
  - (a) change `model.ts` to return the same object, as `setMasterMix` does;
  - (b) compare values in the context.
- **Chosen: (b), context only.** `setTrackMix` also serves the Mute toggle (l.2048), and an info item does not justify opening the model.
- The comparison uses the clamped value. A missing track also returns.
- Placement mirrors `previewMasterGain`: after the `flushPendingMaster` block, before `volumeBeforeRef` is set. PV7 pins the flush order.
- Red-first render-count pins:
  - PV1 (identity);
  - PV2 (clamp);
  - PV3 (missing track);
  - PV4 (the real Lane double-click path).
- Green pins:
  - PV5 (off-default round trip);
  - PV6 (a pending `before` is kept);
  - PV7 (flush order);
  - PV8 (return to start while pending → 0 entries; catches a wrong "equals before" short-circuit, mutation (e)).

**Neighbouring behaviour C checks:**
- transport;
- the meters;
- Volume double-click, drag and keys;
- Mute (another `setTrackMix` caller);
- Master;
- Delete with fader focus.

## 5. Baseline built for round 44

- `b-round-43-tree-sha256.txt`: **391** = the 387 list − `ArrangementContext.tsx` + the 5 round-43 files. `sha256sum -c` → 0 non-OK.
- `b-round-43-snapshots/ArrangementContext.tsx` `91fa12d6` (= HEAD, `SHA256SUMS.txt`).
- `b-round-43/gates.txt`:
  - HEAD `2c0f800`; `git status` empty; both remotes `2c0f800`;
  - protected 4/4 OK;
  - `/studio-lab` 200; `node.exe` 15.
- `b-round-43/tsc.txt` (exit 0); `b-round-43/vitest.txt` (76 files / 1341 passed).

## 6. Scope integrity

- **Nothing is deferred or shrunk.** After round 44 comes round 45 (polish), then SRW-14 stage 1 (FB-13 Grid/Snap), SRW-15 (FB-09/FB-11; grid tempo is never audio stretch), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20 and the SRW-21 adapter, then the full regression with root review, then T12.
- **Out of scope** (unchanged): professional plugins and effects, pitch, multiple video layers, audio time-stretch.
- **Public `/studio-lab` stays demo-only** (G44-3). Purchase protection is re-checked every round (token 401, `/studio/middle-east` Sign in required, protected 4/4).
- **Root review findings:** `root-pre-push-review.md` (2026-10-07) has M1–M3, L1–L4 and L6–L8 closed and L5 accepted. Its shared remaining items are carried in task §4.9.
- **Remaining non-blocking root review notes** (`checkpoint-r43-root-review.json`) are all already tracked:
  - the meter width/root font (W66, ROOTFONT);
  - the exact +5 boundary (EXACT-5DB);
  - the focus-order equivalence (A-R38-TEST-ORDER, closed as equivalent).

## 7. Decision

**CONTINUE.**

**Not COMPLETE:**
- SRW-13 4c, polish, C-R41-01;
- FB-06/07/09..13 (SRW-14..20) not started;
- the SRW-21 adapter;
- the Tech Lead items and manual checks;
- the full regression and root review;
- T12.

**Not BLOCKED:** nothing needs external information, approval or credentials to proceed with round 44.

**Commit readiness:** round 43 is already committed and pushed by root (`2c0f800`). Round 44 becomes checkpoint-ready only after C PASS.

## 8. Advisor

Available. Called once before writing. The advice covered:
- rebuild the frozen list from `2c0f800`;
- re-check the shavidze remote;
- M1 by removal with no invented red test;
- a render-count pin with the clamp and flush placement;
- the model.ts choice;
- approve the daemon fallback;
- the HTZERO harness rule.

All of it was followed. B added PV8 after self-review, so that mutation (e) has a catcher. A second call was made after writing (§9).

## 9. Post-write review (advisor, second call)

**Outcome:** the contracts are consistent with the source.
- PV1–PV4 are red on the snapshot through the render count, because the snapshot always calls `setHistory` with a new object.
- PV7 catches mutation (b); PV8 catches mutation (e).
- The value-comparison form also covers the missing-track case.
- CONTINUE is correct.

**Applied:**
1. This section was filled in.
2. TR-LOOP now names the real control: the transport `↻ Loop` button (`ArrangementTransport.tsx` l.153) or Ctrl/Cmd+L on a selected range (`StudioWorkspace.tsx` l.1124).
3. Doc 041 must reconcile the round-9 note that reviewer #2 called the ref "a latch, not dead". A states what read it then and what reads it at `2c0f800`, with line references.

**Noted, no action:** the name `context-hygiene.test.tsx` follows the earlier B-dictated naming, which the round-38 reviewer accepted.
