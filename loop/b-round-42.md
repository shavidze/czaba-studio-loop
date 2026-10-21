# B — round 42 result → round 43 dispatch (D-29z8)

Dispatcher: B · Date: 2026-10-14 · Session: restarted B. The earlier B-42 session stopped after archiving and backups.

**Inputs read:**
- `tasks/round-42.md`, the round-42 task. It already existed (earlier B-42 session, 19:04), and `cmp` against `current-task.md` gave SAME, so it was **kept as it is** and not rewritten.
- `a-round-42.md`, `c-round-42.md`, `c-round-42.json`.
- `publication-checkpoint.json` (it has no `round42Checkpoint` yet) and `root-pre-push-review.md`.
- `b-round-41.md`, `b-next.json`, `backlog.json` v44, `feature-status.md`, and `plan.md` (D-29z7, the round table, the FB map, the dependency graph and the done policy).

**Partial state reused:**
- `b-round-42-checkpoint.md` (archive and backups done).
- The backups `backlog.before-b-round-42.json`, `feature-status.before-b-round-42.md`, `plan.before-b-round-42.md`, `b-next.before-b-round-42.json` and `current-task.before-b-round-42.md` were each `cmp`-SAME with the live files before this session edited anything. They are valid pre-edit backups and were not overwritten.
- `b-round-42-result.json` (0 bytes) is the loop runner's session-output file. B did not write it.

**Source read for the decisions:**
- `ArrangementContext.tsx` l.900–990 (`flushPendingVolume`/`flushPendingMaster`, `applyEdit`), l.2040–2190 (Volume preview/commit/begin/blur) and l.2296–2345 (Master preview).
- `ArrangementLane.tsx` l.660–699 (the Volume input) and `ArrangementMaster.tsx` l.1–196.
- `ArrangementTrackMeter.tsx` (whole) and `meter.ts` l.1–60, l.130–133.
- `useRelativeFaderDrag.ts` l.1–80.
- `StudioWorkspace.tsx` l.1150–1235 (the window key handler).
- `fader-guards.test.tsx` l.1600–1710.
- The test greps for `translateX`, `data-hold-db` and `style.transform`.
- The evidence: `c-round-30.md` R30-K, `a-round-29.md` §4, `a-round-33.md` §4, `a-round-37.md` §4 R4/R5, `c-round-38.md` §9.1 (i), `c-round-26.md` §9.

**Advisor:** available (Fable). It was called twice before writing (§9) and once after.

## 1. Independent verification (`b-round-42/gates.txt`, 19:27, `node.exe` 32 → 36)

**HEAD and remotes**
- HEAD is **`b6a96f8`** (`fix(studio): recover pan controls and scope deployment triggers`), a root commit made after C finished.
- It contains the 3 round-42 files at C's shas (`855bc517`, `de42634f`, `9b15bc74`), plus root's `.github/workflows/ci.yml` and `vercel.json`.
- `git ls-remote` shows **both** master remotes (`TCzaba/czaba-store`, `shavidze/czaba-store`) at `b6a96f8`.
- `git status --short` is empty.

**Frozen list and snapshots**
- New `b-round-42-tree-sha256.txt`: **387** entries = 386 − `ArrangementMaster.tsx` − `fader-guards.test.tsx` + the 3 round-42 files. All 387 are OK.
- Snapshots in `b-round-42-snapshots/`: `ArrangementMaster.tsx` `1707798c`, `fader-guards.test.tsx` `9721d08f`.

**Gates**
- protected 4/4 OK; tsc exit 0; vitest **74 files / 1333 passed**.
- `/studio-lab` returned **000** once at 19:2x and **200** at 19:27.
- B did not re-run build and Biome. C's G42-1 covers them on the same bytes; root's checkpoint gates cover `b6a96f8`.

## 2. Round-42 verdict (C evidence only)

**C PASS on every contracted ID:** G42-1, G42-2, G42-3, R42-S, R42-U (mutations a–f), R42-Doc, R42-PK, R42-RW, R42-REG.

**Closed by C evidence:**
- A-R32-REVIEW-1 and CP-R37-PAN-KEY-LOCK (R42-PK, R42-U);
- A-R31-REVIEW-2 and CP-R37-DRAG-ENTRIES (R42-RW, R42-U).

SRW-13 4b-2 group 2 is done. FB-05 stays **მოწმდება**, because the Tech Lead's R31-T (with the round-42 Alt+Tab step), R33-T and R38-T remain.

**C's three records:**

| Record | Verdict |
|---|---|
| TASK-R42-REGDEL | **B's task-text error, closed.** Delete/Backspace on any range input keep the selected clip with 0 entries, and Space toggles playback (C-R31-02). Round 43 REG-DEL states this, and it is now a fixed B checklist line. |
| FOREIGN-CI-YML | **Closed on root evidence.** Root committed `ci.yml` on purpose in `b6a96f8`, together with `vercel.json`, which C had not recorded. |
| GSTACK-ACL | **New, root/environment (Low).** It is not a CZABA app bug. Root decides whether to restore ACL inheritance on `tmp/studio-real-loop` and `tmp`. A and C run no ACL command. |

**ENV-BROWSE-DAEMON recurred:** `$B restart` broke the daemon twice. From round 43 the rule is: no `$B restart`, only a fresh `BROWSE_STATE_FILE`.

**C-R23-01 / C-R38-01** are unchanged: 3 NUL at 11729, 28025 and 28026 (64 312 bytes), and 1 U+FFFD label.

## 3. Group 3 — resolved without code (D-29z8)

The plan queued FADER-KEY-ENTRIES, A-R29-REVIEW-1 and A-R33-REVIEW-TOUCH as round 43. The source read shows that none of them is a code defect that a meaningful C criterion could prove fixed. A Low that is "fixed" without a real criterion would only pad the round.

| ID | Decision | Rationale |
|---|---|---|
| FADER-KEY-ENTRIES | **Accepted** (contract) | Volume and Master commit on `keyup` (Lane l.687–691, Master l.179–183). Pan writes one entry per value-changing key (round-42 contract). All three faders therefore follow D-29v, "keyboard step = one entry". C recorded this in round 42 (REG-FADERS for Volume/Master, REG-KEYS for Pan) and in round 30 (R30-K). Coalescing Volume/Master behind a timer would make them differ from Pan without a user request. No Ableton claim is made. C re-records the behaviour in round 43 REG-FADERS. |
| A-R29-REVIEW-1 | **Accepted** (no C evidence, so "accepted", not "closed") | `applyEdit` (l.961–962) writes a pending Volume/Master preview before the next edit. That preview is a real, uncommitted user change, so after a no-op Cut Time the undo label truthfully names it, and the status speaks about the Cut Time. It is reachable only through key rollover: an arrow held on a fader while Ctrl+Shift+X is pressed (Ctrl+Shift+X is not range-gated, StudioWorkspace l.1153–1161). |
| A-R33-REVIEW-TOUCH | **Tech Lead, R38-T** | The obvious fix, skipping `pointerType === 'touch'` in the timeline capture handler, would bring C-R32-01 back on touchscreen laptops with a keyboard: tap a clip, press Delete, and the fader still has focus. A deferred tap-only blur needs device evidence first. The step was added to R38-T. |

## 4. Round 43 — 4b-2 group 4 (D-29z8) and why

**Choice:** group 4 is the next **code** group in the approved queue.
- Nothing is failing that would justify reordering.
- The done policy requires the Lows to close before COMPLETE.
- SRW-14 waits for 4c and polish, as planned.

**Why the three items go together:** the plan approved group 4 as one round. The two test-only items share the fader-focus theme. The tick is a one-element visual fix.

### 4.1 MASTER-HOLD-TICK-EDGE (geometric contract)

Today the tick is `-ml-px w-0.5` inside an `inset-0` layer, translated by `f × 100 %`, in an 80 px `overflow-hidden rounded-full` box. So at `holdDb ≥ +6` only 1 px is visible (C round 26 §9).

**Contract:**
- at `holdDb ≥ +6`, the whole 2 px tick is inside the box;
- at `holdDb ≤ +5 dB`, the tick centre is within 0.5 px of `meter.left + f × W` (at 0 dB it overlaps the 0 dBFS mark);
- the tick moves monotonically in between.

**B's arithmetic:**
- A wrapper inset (`right-px`, `left-px right-px`, or copying the track meter's `right-0.5` without `-ml-px`) moves the 0 dB tick by about 0.8–1.8 px, so it fails the 0.5 px rule.
- A translation clamp does not, for example `min(X%, calc(100% − 1px))` or a JS fraction clamp. A chooses the form.

**Accepted:**
- `rounded-full` clips the tick vertically in its last 3 px; the bar is fully red there.
- The jsdom pins are structural only. C's `getBoundingClientRect` measurement during REAL playback is the acceptance.

B checked that no frozen test parses the Master hold transform (`render-budget` l.244 parses only the detail playhead).

### 4.2 A-R38-TEST-ORDER

B's reading suggests that mutation (i) may be **equivalent** today:
- the root pointerdown capture releases a focused text field before any fader handler runs (C-R34-01);
- `beginTrackVolumeGesture` flushes a pending Volume/Master (l.2150–2151);
- for another track's Volume, `blurTrackVolume` does nothing during the new gesture, while the begin has already flushed.

The task therefore lets A either find a red-on-(i) case (S1–S5) or write the equivalence proof. C then confirms or refutes it, and a refuting case becomes a C bug with steps. A must not change the hook or the workspace to manufacture a difference.

### 4.3 A-R37-TEST-HARDENING

This is a narrow grant inside the frozen `fader-guards.test.tsx`, limited to the `C-R36-01` describe:
- **N5:** a mid-test `"3"` pin;
- **N1/N2:** a real focus move (`field.blur()`, or focus on another element), with `activeElement` asserts;
- every existing `expect` is kept with its value;
- a scratch mutation (the round-36 "blur during a gesture resets the text") must now fail N5 **at the new pin**.

### 4.4 Stop conditions for A

- a frozen test that parses or snapshots the Master hold layer;
- a 387 list or snapshot mismatch.

## 5. Ableton (workflow addendum)

No new behaviour, no new browsing and no video. All three rows are **არ ეხება**:
- the hold-tick geometry (CZABA meter design, round 26);
- the fader focus order;
- the kept Clip Gain text.

## 6. Root and Tech Lead items (carried)

**Root:**
- record `round42Checkpoint` (`b6a96f8`, both remotes verified by B) in `publication-checkpoint.json`;
- round 43 becomes checkpoint-ready only after C PASS;
- GSTACK-ACL (new);
- the ignored `.kilo/`; `test:e2e:smoke` (root only); SRW-21 (the middle-east loader); Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip at 0 dBFS; the CRLF auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA `scroll` with consent denied; fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset;
- dev-server availability (000 once at B time); ENV-BROWSE-DAEMON; Defender load.

`root-pre-push-review.md` M1–M3, L1–L4 and L6–L8 stay closed, and L5 is accepted.

**Tech Lead:**
- C-R23-01 + C-R38-01 (React 19 or an `entry.server.tsx` grant);
- C-R27-01, C-R6-02, C-R8-01 (quiet Chrome);
- DEMO-SFX-FULL-SCALE; TL-Q-FB05-FB11; TL-Q-VIEWPORT (C-R41-01);
- R23-1, R23-2;
- R38-T, which now includes A-R38-REVIEW-TOUCH and **A-R33-REVIEW-TOUCH**;
- R35-T, R30-T, R31-T (with the Alt+Tab step), R33-T, R34-T.

## 7. Files written by B this round

- `current-task.md` (round 43; `tasks/round-42.md` stays the round-42 archive);
- `b-round-42.md`;
- `b-next.json`;
- `backlog.json` v45 (`b-scripts/b-round-42-backlog.cjs`);
- `feature-status.md` (`b-scripts/b-round-42-feature-status.cjs`);
- `docs/technical/studio-real-workspace/plan.md` (D-29z8, rows 42–45 and status lines; `b-scripts/b-round-42-plan.cjs`);
- `b-round-42-tree-sha256.txt`;
- `b-round-42-snapshots/`;
- `b-round-42/gates.txt`;
- `b-round-42-checkpoint.md`.

No app source, test or other role's file was touched.

## 8. Decision

**CONTINUE.**

**Not BLOCKED:**
- no external info, approval or credentials are needed for round 43;
- the dev server answers 200.

**Not COMPLETE:**
- SRW-13 4b-2 group 4, 4c and polish remain;
- C-R41-01 (Tech Lead question) is open;
- FB-06/07/09..13 (SRW-14..20) have not started;
- the SRW-21 adapter remains;
- the Tech Lead bugs C-R27-01, C-R23-01, C-R38-01, C-R6-02 and C-R8-01, and the manual checks, are open;
- the full regression and the root review remain;
- then T12.

No Critical or High bug is open. Purchase protection holds (C G42-3: token 401, fake Bearer gets no token, `/studio/middle-east` → Sign in required, 0 Authorization headers, 0 token/recording/download/R2 requests).

## 9. Advisor

1. **Before writing (orientation done).**
   - Follow the plan queue rather than jump to SRW-14.
   - Rebuild the frozen list from `b6a96f8`, verify the remotes, and do not claim publication beyond the evidence.
   - Close FOREIGN-CI-YML on root evidence, fix the REG-DEL wording, and record the no-restart browse rule.
   - Read the source of each group-3 item before writing a contract.
2. **After the source read.** Group 3 collapses into dispositions, so round 43 = group 4, with:
   - a geometric hold-tick contract measured by C;
   - an A-R38 outcome that is either red-on-(i) or an equivalence proof;
   - a narrow `fader-guards` grant with additions-only intent.

   B checked its hint about the Clip Gain scenario against the source. The root capture blurs the text field first, so S1 is listed as a candidate, not as a predicted red.
3. **After writing.** No structural change. One task-text error was found and fixed before dispatch (`b-scripts/b-round-42-task-fix.cjs`):
   - **Hold-tick timing.** The first draft of §4.1 measured the tick after stopping playback. The meter floors on stop (`floorMasterMeter`, `meter.ts` l.93–101), and the hold falls back to the level 1.5 s after the peak (`METER_PEAK_HOLD_MS`). B confirmed this in the source. §4.1 now measures during playback inside the hold window, with a labelled read-only sampler, and evaluates the max-hold sample. HT-FLOOR now checks the hidden tick after stop. A's smoke step was corrected the same way.
   - **HT1 order.** HT1 depends on the form A chooses, so A writes HT2/HT3 first, then chooses the form, writes HT1 and runs the red run.

**B checklist (permanent, from rounds 42–43):**
- Delete/Backspace with focus on any range input keep the selected clip, write 0 entries, and Space still toggles playback (C-R31-02).
- Meter hold measurements run during playback, within `METER_PEAK_HOLD_MS` of the peak. The frame floors on stop.
