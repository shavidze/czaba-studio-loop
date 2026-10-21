# CURRENT TASK — Round 28: SRW-24 — Delete/Backspace always leaves a gap, Ctrl+Shift+L extends the time selection to every lane, Ctrl+Shift+X is the only gap-closing delete (user request 2026-10-11; D-29s)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-12
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09, Ableton-source addendum 2026-10-11).
User request (authoritative for this round): `C:/Apps/czaba-project/docs/technical/studio-real-workspace/delete-selection-update.md`.

> **Environment prerequisite for C (root, not BLOCKED):** the dev server `http://127.0.0.1:5173` was **down** on 2026-10-12 (B: `curl` → `000`). Root must start it before the C phase. No agent starts or stops it. A does not need it except for the optional smoke check.
>
> **Machine load:** A round 27 saw 40–42 `node.exe` processes, and B counted 34 on 2026-10-12. Load explains A's timeouts and is the leading hypothesis for C-R27-01/C-R27-02. Root: please reduce stray node processes before the C phase. Every C run records the `node.exe` count.

## Why this round

**C bugs first.** C round 27 (`c-round-27.md`, `c-round-27.json`) is a **FAIL**:
- **C-R27-01 (Medium):** the R27-RB drift sample failed. 4 of 5 runs are over 30.1 ms, with dock hardSeeks 2/2 in every run. Two control runs with the track reads zeroed are also bad (60.4 and 130.6 ms), so the track reads are probably **not** the cause. Round 26's reference was on a different layout, so attribution is open. The budget is exhausted. Per the workflow policy, this becomes the **concrete C follow-up in §4.1**, with a pre-registered decision table. It does not touch security or data and does not block another feature.
- **C-R27-02 (Low):** two frozen tests are flaky in an 8-file batch under load. They are green alone and in the full suite. Follow-up in §4.1 (C reruns with the load recorded). No test is edited.
- **Oracle correction (B's error, not a bug):** R27-TL's literal ±1.0 dB window-max does not fit a transient source in its decay windows, because the meter's 20 dB/s release (round 26 design) keeps it above the tap. The Master meter shows exactly the same. §4.1 restates the oracle **before** C re-scores, without relaxing the sustained windows.
- **Not run in round 27, because the server was down** (`c-round-27.md` §13). These are owed acceptance of round 27's code, which is unchanged. C runs them in §4.1.
- **Still open:** C-R23-01 (Medium, SSR NUL; awaits the Tech Lead), and C-R6-02/C-R8-01 (Tech Lead quiet Chrome).

**So this round's feature is SRW-24**, the user's delete-and-vertical-selection request of 2026-10-11. It **supersedes** the old contract "Delete with a range = Delete Time, closing the gap on all lanes":
- the old contract is in R1-B5, R1-B12 and R9-C5;
- in today's code it is `deleteSelection` → `deleteTime` (`ArrangementContext.tsx` l.1547–1561);
- in today's UI it is the transport hint `დროის წაშლა — სიცარიელე დაიხურება ყველა ხაზზე` (`ArrangementTransport.tsx` l.70–72).

The shipped FB-02 behaviour is therefore **wrong against the user's current decision**. Each later round would freeze more tests onto it, which is why B schedules this before SRW-13 stage 3 (rationale in `b-round-27.md` §3).

**Scheduled, not dropped:** SRW-13 stage 3 (FB-04 clip gain, R13-M1) is **round 29**, and stage 4 (FB-05 pan, fader-click UX, round-9 M1/L8, the Master hold tick) follows it. Then SRW-14..20, R26-M1 hardening, SRW-21 and T12, in dependency order (§7).

**Previous round:** archived as `tmp/studio-real-loop/tasks/round-27.md` (byte-identical to the dispatched round-27 task, created by B on 2026-10-12 before an API crash; verified with `cmp`).

**References:**
- B's record: `b-round-27.md`. Progress board: `feature-status.md`. Plan: `docs/technical/studio-real-workspace/plan.md` (D-29s).
- Backlog: `backlog.json` item **SRW-24**.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline:** HEAD `c5ed47b` plus the round-6..27 dirty tree.
- `git status --short` has **62 lines**, identical to `c-round-27/gates/git-status-now.txt`. B's copy is `b-round-27-git-status.txt`.
- Frozen for this round: `../tmp/studio-real-loop/b-round-27-tree-sha256.txt`, **66 files**. That is:
  - round 26's 60 files, minus the four A owns now (`types/arrangement.ts`, `StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `ArrangementContext.test.ts`);
  - plus round 27's owned files except `ArrangementContext.tsx` and `ArrangementLane.tsx` (`meter.ts`, `graph.client.ts`, `ArrangementTrackMeter.tsx`, `meter-ui.test.tsx`, `track-meter.test.ts`, `track-meter-ui.test.tsx`, doc 033);
  - plus `clipboard.test.ts`, `loop.test.ts` and `selection.test.ts`.

  B verified **66 OK** on the live tree.
- The 9 round-27 owned shas equal `c-round-27/gates/owned-sha-now.txt` (B re-ran `sha256sum -c`: 9 OK).
- Dispatch snapshots of A's seven existing files are in `../tmp/studio-real-loop/b-round-27-snapshots/`:

  | File | sha256 |
  |---|---|
  | `app/contexts/ArrangementContext.tsx` | `df4484a9…` |
  | `app/components/arrangement/ArrangementLane.tsx` | `f2db8fe2…` |
  | `app/components/arrangement/StudioWorkspace.tsx` | `750c75e6…` |
  | `app/components/arrangement/ArrangementTransport.tsx` | `f0054cfd…` |
  | `app/types/arrangement.ts` | `ac2eed7e…` |
  | `app/lib/arrangement/clipboard.ts` | `514e2f75…` (committed in HEAD; not in the status list) |
  | `app/lib/arrangement/__tests__/ArrangementContext.test.ts` | `7c93153d…` (one-line amendment only, §2.6) |

- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any file in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit or delete them.
- Nobody commits in this round.

## 0. Scope

**The user's contract** (verbatim intent of `delete-selection-update.md`):

| Action | Result |
|---|---|
| Delete **or** Backspace on any selection (time range, one clip, several clips) | Only the selected material is removed. Time does **not** close. Later clips do not move, and the remaining parts are not joined. |
| Ctrl+Shift+L | The **existing** selected time window spreads to the whole vertical: every audio lane and the video lane. Start and end stay the same. It never selects the whole project. |
| Delete/Backspace after Ctrl+Shift+L | The same window is removed on every lane. The gap stays, and later clips keep their start. |
| Ctrl+Shift+X | The **only** action that removes the time and closes the gap: every lane, video included, shifts by the window length, keeping sync. |

Also:
- No other delete path closes the gap: the transport `⌫ წაშლა` button, Shift+Delete and Shift+Backspace all leave a gap.
- Delete/Backspace while typing in a text or number field never deletes timeline material.
- Delete without a selection and Ctrl+Shift+L without a range must not delete or select anything project-wide.

**In (A):**
- `TimeRange` gets an optional "all lanes" flag (§2.1);
- the gap-keeping range delete in `clipboard.ts` and the multi-lane range variants (§2.2);
- the context: the new `deleteSelection` range branch, `extendRangeToAllTracks()`, and Copy/Cut/Split on an all-lane range (§2.3);
- the keys (Ctrl+Shift+L vs Ctrl+L), the transport labels and the footer hint (§2.4);
- the lane-level overlay for an all-lane range (§2.5);
- red-first tests in **two new** files, plus the one-line amendment in `ArrangementContext.test.ts` (§2.6);
- implementation doc 034.

**In (C):**
- §4.1, round-27 follow-ups: C-R27-01 attribution, C-R27-02 reruns, the restated R27-TL score and the §13 not-run items;
- §4.2–§4.5, SRW-24: R28-DA, R28-DB, R28-DV, R28-DM, R28-VL, R28-VD, R28-CX, R28-UR, R28-PS, R28-TF, R28-UI, R28-K, R28-E, R28-R, R28-S, R28-U, R28-Doc, G28-1..3, the C-R23-01 record, and the Ableton compliance column.

**Not in this round** (scheduled; not PASS):
- **SRW-13 stage 3 (round 29):** FB-04 clip gain.
- **Stage 4:** pan, fader-click UX, M1/L8, the Master hold tick.
- **Later:** R26-M1; L3 (removed-track taps); LIB-SEP-REASON (the first round that edits `ArrangementLibrary.tsx`, at the latest before the final regression); the lane overlay `/60`; the footer selected-clip Latin text; the Latin `range` group hint; folded-clip a11y (SRW-17).
- **Split across all lanes:** Ctrl+E on an all-lane range is **refused** with a status in this round (§2.3). The user did not ask for it, and Ableton's behaviour was not verified. It is recorded as a conscious difference, not as deferred user scope.
- **Tech Lead:** C-R6-02, C-R8-01, C-R23-01, DEMO-SFX-FULL-SCALE and the manual list (§4.6).

**Out of scope for the whole project:** plugins and effects (including compressor/limiter), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- **Ctrl+Shift+X / Cut Time:** R9-C3, its clipboard, the position remap while playing (old R1-B12, now on Ctrl+Shift+X), and the loop remap (R5-L5).
- **The other edits:** Ctrl+X Cut (gap) / Ctrl+C / Ctrl+V on single-lane ranges (R9-C1/C2/C4), Ctrl+L loop toggle, Ctrl+A, Ctrl+D, Undo/Redo, and the gesture guard.
- **Video sync** after a gap edit on the video lane.
- **The render budget** (`render-budget.test.tsx`: `ArrangementLane` 0 renders per frame).
- **The round-27 track meters** in the lane header (geometry untouched).
- **The export.**

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md` (the edit reschedules audio while playing), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`. Also read `prompts/studio-feature.md`, and run the `pre-flight` skill. Read `delete-selection-update.md` in full.

   Run the `design-philosopher` agent once, read-only, for the all-lane range overlay and the label wording. Its constraints:
   - tokens only, reusing the clip range overlay's tokens (`ArrangementClip.tsx` l.587–595);
   - no layout change;
   - Georgian UI text with "Cut Time", "Delete" and the shortcut names kept as they are (D-07).

   Report its advice and your dispositions.
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-27-tree-sha256.txt` and expect **66 OK**. Run `git status --short` and expect **62 lines**, identical to `b-round-27-git-status.txt`. Compare your seven existing files with the snapshot shas above. Report any difference **before** doing anything else, and do not "fix" it.
3. Read:
   - `clipboard.ts` (all of it);
   - `model.ts` l.270–330 (`splitClipsByRange`) and l.370–420 (`deleteTime`), read-only;
   - `ArrangementContext.tsx`:
     - l.530–560 (`setRange`);
     - l.1360–1400 (`toggleLoopSelection`);
     - l.1480–1590 (`splitSelection`, `deleteSelection`);
     - l.1628–1712 (`copySelection`, `cutSelection`, `cutTimeSelection`);
     - the value/actions blocks around l.2420–2540;
   - `StudioWorkspace.tsx` l.980–1140 (the key handler; note that `modifier && key === 'l'` at l.1078 has **no** Shift check, so today Ctrl+Shift+L toggles the loop) and l.1480–1490 (the footer hint);
   - `ArrangementTransport.tsx` l.50–150;
   - `ArrangementLane.tsx` l.540–665 (ghost overlays and the `clipRange` filter);
   - `ArrangementClip.tsx` l.520–600 (read-only: the range overlay classes and the label);
   - `ArrangementDetailPanel.tsx` l.140–280 (read-only: it reads `range.trackId`);
   - the frozen `ArrangementContext.test.ts` l.378–392 (fixture) and l.505–568, `clipboard.test.ts` (all of it), and `gesture-guard.test.tsx` around l.300–340.
4. **B's probes** (these decide the contract):
   - A range only ever exists **inside one clip on one lane** today:
     - `ArrangementLane.tsx` l.618–624 passes a range to a clip only when the range lies inside it;
     - ranges are created by the clip range gesture or the detail panel inputs.

     So an "all-lane" range needs its own lane-level overlay (§2.5).
   - Exactly **one** frozen test line encodes the old Delete contract: `ArrangementContext.test.ts` l.567, `expect(result.current.undoLabel).toBe('დროის წაშლა');`. Its fixture's `m1` (music 0–8) covers the range 1–2, so the new delete has material there.
   - No frozen test asserts the transport delete `title`/`aria-label` or the footer hint text (B grepped `__tests__`).
   - The frozen `clipboard.test.ts` asserts `cutRangeFromArrangement`/`copyRangeToClipboard` with single-lane ranges (no flag). They must stay green **unchanged**.
   - `cutTimeToClipboard` → `deleteTime` (Ctrl+Shift+X) is unchanged, and its tests (`clipboard.test.ts` l.120–131, `ArrangementContext.test.ts` l.523–541) stay frozen.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Type (`types/arrangement.ts`)

- `TimeRange` gets **one** optional field, `allTracks?: true`. Name it as you see fit, but it must be an optional literal or boolean, documented in doc 034.
- `trackId` stays required. It is the lane where the range was drawn, and it keeps the detail panel and the single-lane paths working unchanged.
- No other type change, no `Arrangement` field, and `scheduleKey` unchanged.

### 2.2 Pure edits (`clipboard.ts`)

- `cutRangeFromArrangement(arrangement, range)` and `copyRangeToClipboard(arrangement, range)` honour the flag:
  - with `allTracks`, they treat **every** lane's clips in `[a, b)`;
  - without it, they behave **exactly** as today (the frozen `clipboard.test.ts` proves it).
- **A Delete on a range = `cutRangeFromArrangement`'s arrangement, with no clipboard.** Export a clearly named helper, for example `deleteRangeKeepingGap(arrangement, range)`, so the context and the tests have a single entry point.
  - It returns the **same object** when nothing in the window changes, so the context can refuse a no-op without a history entry.
- `cutTimeToClipboard` is **not** changed.
- Pure helpers only. Keep `CLIPBOARD_MIN_PART_SECONDS`, the id rules (the left part keeps the id, the right part gets a new id) and the `sourceOffset` rule (`+ (b − clip.start)`) exactly as `cutRangeFromArrangement` has them.

### 2.3 Context (`ArrangementContext.tsx`)

**`deleteSelection` with a range** (the only changed branch):
- It applies the §2.2 helper: `applyEdit(next, label)` with **no** time-map argument.
- The label is `წაშლა მონაკვეთზე` for one lane, and `წაშლა მონაკვეთზე (ყველა ხაზი)` for an all-lane range.
- The playhead is **not** remapped (no `updatePosition(remapTime…)`), and the loop is unchanged.
- It clears the range and the selection, as today.
- The status is `⌫ წაიშალა {a} — {b} {ხაზის სახელი-ზე | ყველა ხაზზე}; სიცარიელე დარჩა.`.
- **No-op** (no material in the window): no history entry, the range is kept, and the status is `მონიშნულ მონაკვეთში წასაშლელი მასალა არ არის — არაფერი შეცვლილა.`.
- The one-clip and multi-clip branches are unchanged (they already leave a gap).

**`extendRangeToAllTracks()`** (new action, exposed like the others):
- With a range, it sets the same range with the flag. This is **not** an edit: no history entry, no arrangement change. The status is `მონიშვნა ყველა ხაზზე: {a} — {b}.`.
- If the range is already all-lane, it is a no-op with the same status.
- Without a range: nothing changes, and the status is `ყველა ხაზზე გასავრცელებლად ჯერ მონიშნე მონაკვეთი (Ctrl+Shift+L).`.
- It is refused during a pointer gesture, like the other edit commands (`refuseEditDuringGesture`).

**Other commands on an all-lane range:**
- **Ctrl+C / Ctrl+X:** they work on every lane through the §2.2 flag (the clipboard holds the material of every lane; Paste uses the existing multi-lane path, as for the Cut Time clipboard). Ctrl+X leaves the gap.
- **Ctrl+Shift+X:** unchanged.
- **Ctrl+L:** unchanged (it uses start/end).
- **Ctrl+D:** already refused on a range; unchanged.
- **Ctrl+E (Split):** refused, with the status `გაყოფა ყველა ხაზის მონიშვნაზე არ სრულდება — მონიშნე მონაკვეთი ერთ ხაზზე.`, no history entry and the range kept.
- **The detail panel's range inputs** write a single-lane range (they set `trackId` and drop the flag). That is acceptable, and doc 034 states it.

**No change** to the video, dock, scheduler, loop, transport, meters, Master or graph logic.

### 2.4 Keys and labels (`StudioWorkspace.tsx`, `ArrangementTransport.tsx`)

**Keys:**
- Ctrl/Cmd+Shift+L → `extendRangeToAllTracks()`. Ctrl/Cmd+L **without** Shift → `toggleLoopSelection()`, as today.
  - The gesture-guard list already contains `l`; keep it for both.
  - Check how `shortcutLetter` reports a Shifted letter and handle both `l`/`L`.
- Delete/Backspace (with or without Shift) keep calling `deleteSelection()`. Typing targets keep returning early (the existing `isTypingTarget` guard).

**Transport `⌫ წაშლა` button:**
- `title`/`aria-label` with a range: `წაშლა მონაკვეთზე — სიცარიელე დარჩება (Delete / Backspace). დროის ამოჭრა სიცარიელის დახურვით: Ctrl+Shift+X`;
- on an all-lane range: the same with `ყველა ხაზზე` after `მონაკვეთზე`;
- without a range: unchanged.
- The disabled logic is unchanged.

**Footer hint:** add `Ctrl+Shift+L` and make Ctrl+Shift+X legible, for example `… Ctrl+Shift+X (Cut Time — სიცარიელე იხურება) · Ctrl+Shift+L (ყველა ხაზი) · Ctrl+L · … Delete / Backspace (სიცარიელე რჩება) …`. Keep the other items.

No other change in these files.

### 2.5 All-lane overlay (`ArrangementLane.tsx`)

- When the range has the flag, every lane renders **one** lane-level overlay `[start, end)`:
  - `data-testid="arrangement-lane-range"`, `data-range-start`/`data-range-end` (3 decimals);
  - `aria-hidden="true"` and `pointer-events-none`;
  - it uses the clip range overlay's tokens (no hardcoded colour; no inline style except `left`/`width`, like the ghosts);
  - it shows on empty stretches too.
- In that state the lane passes `range={null}` to its clips, so there is no double overlay.
- The label `{a} – {b} · {len} წმ · ყველა ხაზი` is rendered once, on the origin lane (`range.trackId`).
- Without the flag, everything is exactly as today.
- No change to the header, the track meter, row heights or the scroller.
- `ArrangementLane` still renders **0** times per Play frame.

### 2.6 Tests (written first; red on the snapshot sources)

**Order:**
1. Write the new tests against the **unchanged** sources.
2. Run them and paste which fail and why (tsc failures for missing exports are expected). If a whole file fails to load, prove red in a scratch copy outside `store/`, as in rounds 24–27, and say how.
3. Implement, then re-run.

**New files:**
- `app/lib/arrangement/__tests__/delete-selection.test.ts` (pure);
- `app/lib/arrangement/__tests__/delete-selection-ui.test.tsx` (provider, keys, lanes).

**One-line amendment** to `ArrangementContext.test.ts`: l.567 `'დროის წაშლა'` → `'წაშლა მონაკვეთზე'`. Nothing else in that file changes. C diffs it against the snapshot.

At least **16** new `it` blocks, covering:

1. **Pure:**
   - an audio clip 0–10, range 3–5, delete → parts 0–3 and 5–10, the right part's `sourceOffset` is +5, and a later clip on that lane and the clips on the other lanes keep their `start`;
   - the same on a video clip;
   - a range across two adjacent clips on one lane;
   - all-lane, 3–5 → every lane has a 3–5 gap, and every later clip keeps its `start`;
   - a no-op window returns the same object;
   - without the flag, `cutRangeFromArrangement`/`copyRangeToClipboard` are identical to the snapshot behaviour (equality against a copy of the fixture);
   - with the flag, `copyRangeToClipboard` holds every lane's material with its `trackId`;
   - Ctrl+Shift+X's `cutTimeToClipboard` on an all-lane range equals `deleteTime` (the range flag does not change Cut Time).
2. **Provider:**
   - `deleteSelection` with a range: label `წაშლა მონაკვეთზე`; the playhead unchanged (seek 7, delete 3–5, position 7); the loop unchanged (a loop at 6–8 stays 6–8); one Undo restores exactly; Redo re-applies;
   - while playing: no position jump (it stays monotonic within one frame step), and the graph reschedules once;
   - no-op: no history entry, the range is kept, the status text matches;
   - `extendRangeToAllTracks`: sets the flag, with no history or arrangement change; without a range there is no change and the status text matches; refused during a gesture;
   - an all-lane delete gives label `წაშლა მონაკვეთზე (ყველა ხაზი)`, and one Undo restores every lane;
   - Ctrl+E on an all-lane range is refused (no history, the status matches);
   - Ctrl+X on an all-lane range leaves gaps on every lane and the clipboard holds every lane's material; Ctrl+V at 30 pastes on the original lanes. The fixture must have material on **at least two lanes** inside the window: `planClipboardPaste` routes a clipboard that spans one lane to the active track (`clipboard.ts` l.186–191), so a one-lane fixture would pass for the wrong reason.
3. **Keys and UI** (the real `StudioWorkspace` key handler, as the frozen tsx tests mount it):
   - Delete, Backspace, Shift+Delete and Shift+Backspace with a range each leave a gap (four cases; no `start` of a later clip changes);
   - Ctrl+Shift+L sets the flag and the loop is **not** toggled; Ctrl+L still toggles the loop and does not set the flag;
   - Ctrl+Shift+X still closes the gap on every lane;
   - Backspace inside a detail number input and inside the library search changes no clip;
   - Delete with nothing selected changes nothing;
   - after Ctrl+Shift+L, every lane has exactly one `arrangement-lane-range` with the right `data-range-*`, the label appears once and no clip-level range overlay is rendered;
   - the transport delete button's `title` matches §2.4 in the three states.

### 2.7 After the code

- Self-check these edge cases:
  - a range on the video clip;
  - a range touching a clip edge;
  - an all-lane range where some lanes are empty;
  - Delete while playing inside the window;
  - Delete with a loop around the window;
  - Undo after a no-op;
  - Ctrl+Shift+L, then a click elsewhere (the range clears as today);
  - the detail panel showing the origin clip's range;
  - `Esc` behaviour unchanged.
- Run `npx biome check --write` **only** on your own code and test files, then a read-only `npx biome check ./app`.
- Run the `code-reviewer` agent (more than 3 files changed) and report its findings and your dispositions.
- **Mutation checks only in a scratch copy outside `store/`.** Never mutate in place.
- Run the §5 commands. One browser smoke check is allowed if the server is up (§5).

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

The 62 lines of `b-round-27-git-status.txt`, including the two foreign agent files (not Studio work; do not touch).

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/types/arrangement.ts` | A | §2.1: the one optional `TimeRange` field |
| `app/lib/arrangement/clipboard.ts` | A | §2.2 |
| `app/contexts/ArrangementContext.tsx` | A | §2.3 only |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.4: the Ctrl+Shift+L branch and the footer hint text only |
| `app/components/arrangement/ArrangementTransport.tsx` | A | §2.4: the delete button hint strings only |
| `app/components/arrangement/ArrangementLane.tsx` | A | §2.5: the lane-level overlay and the `clipRange` condition only |
| `app/lib/arrangement/__tests__/ArrangementContext.test.ts` | A | §2.6: line 567 only |
| `app/lib/arrangement/__tests__/delete-selection.test.ts` | A | **new**, §2.6 |
| `app/lib/arrangement/__tests__/delete-selection-ui.test.tsx` | A | **new**, §2.6 |
| `docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md` | A | new doc (Georgian, `docs/implementation/TEMPLATE.md`) |
| `../tmp/studio-real-loop/a-round-28.md`, `a-round-28/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-28.md`, `c-round-28.json`, `c-round-28/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: exactly 66 lines.** That is the 62 baseline lines plus:

```
 M app/lib/arrangement/clipboard.ts
?? app/lib/arrangement/__tests__/delete-selection-ui.test.tsx
?? app/lib/arrangement/__tests__/delete-selection.test.ts
?? docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md
```

The other owned files already have ` M` lines in the 62. `types/arrangement.ts` is ` M` in the baseline; check it and report if not.

No barrel export: `app/components/arrangement/index.ts` is frozen.

### 3.3 Frozen this round

**Frozen:** all 66 files in `b-round-27-tree-sha256.txt` and everything else under `store/`. That includes:
- `model.ts` (`deleteTime`, `splitClipsByRange`), `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementTrackMeter.tsx`, `ArrangementExportDialog.tsx`;
- `meter.ts`, `graph.client.ts`, `loop.ts`, `transport.ts`, `video-sync.ts`, `schedule.ts`, `view.ts`;
- every existing test except the one-line amendment, including `clipboard.test.ts`, `model.test.ts`, `loop.test.ts`, `selection.test.ts`, `gesture-guard.test.tsx`, `render-budget.test.tsx`, `track-layout.test.tsx`, `track-meter*.test.*` and `meter-ui.test.tsx`.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**` and `../backend/**`;
- user settings, env/config files and the sitemap; `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..27 work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewports:** 1440×900; 1280×720 for R28-UI and R28-K.

**Harness rules (unchanged):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press` (including `Shift+Delete`, `Control+Shift+KeyL`, `Control+Shift+KeyX`). Ranges are made with the existing clip range gesture or the detail panel inputs.
- No source instrumentation. The `data-*` attributes named in §2.5 and the existing clip attributes may be read. C may hook browser APIs, labelled as such.
- The export is compared by frames, NaN, header and RMS, or by max |Δ| ≤ 1 LSB per window. Byte identity is never an oracle.
- Mutations run only in a scratch copy outside `store/`.
- **Every run records the `node.exe` count** (`tasklist | grep -ci node.exe`).

**Run budget** (workflow policy): for each live-audio/video measurement, 3 valid runs plus at most 2 replacements for environment-invalid runs. A repeated failure stays an open bug. Tolerances are never relaxed.

**Checkpoint order if the session may end:** G28 → §4.1 (C-R27-01 first) → §4.2–§4.4 → §4.1 leftovers. Write `c-round-28/checkpoint.md` as you go.

### 4.1 Round-27 follow-ups (code unchanged since C round 27; G28-2 proves it)

**C-R27-01 attribution** (pre-registered; 3 valid + 2 replacements):
- **Layout and procedure:** the exact round-26 `vm-1` layout and the same action sequence (B checked `c-round-26/runs/vm-1.txt`: `mute@0.689 unmute@2.438 keys@3.278`, 12 key steps to −6.0 dB, drift max 20.1 ms, dock 0/0). That is the same procedure as round 27, so the 30.1 ms threshold compares like with like. Reproduce that layout (`c-round-26/runs/vm-1.txt` and its setup; music muted as in round 26) at 1440 on the current tree. Use the method of `c-round-25/scripts/vm-start.js` / `vm-an.js`, with the Master Mute clicks at ~0.5/2.3 s and 12× ArrowDown on Master Volume at ~3.2 s.
- **Record per run:**
  - the drift max;
  - the dock counters;
  - the **timestamps of each dock hardSeek**, correlated with the Master Mute click times;
  - the `node.exe` count.
- **Decision table** (applied as written):
  1. **r26 layout ≤ 30.1 ms in ≥ 2 of 3 valid runs, and dock 0 → 0:** there is no code regression on the identical layout. C-R27-01 closes as "no regression established". The lay11 numbers from round 27 become **information** for the Tech Lead's quiet-Chrome C-R6-02/C-R8-01 runs.
  2. **r26 layout > 30.1 ms in ≥ 2 of 3 valid runs:** C-R27-01 stays open as an attributed regression against round 26 on the same layout. B schedules an A bug round.
  3. **Mixed (1 of 3):** it stays open and goes to the Tech Lead's quiet Chrome.
  4. **Independent of 1–3:** if any dock hardSeek lands within ±100 ms of a Master Mute click in ≥ 2 runs, C opens a **new** bug, "Master Mute causes a video hard seek", with the timestamps.

**C-R27-02:** run the frozen 8 batch (round-27 list) **3 times**, recording the `node.exe` count each time. Report pass counts. This is not a PASS/FAIL of this round's code. It stays open (Low) until 3/3 batches pass at a recorded lower load, or until the failure is reproduced at low load (then B schedules a test-robustness fix).

**R27-TL, restated oracle** (B's correction, written before C re-scores; it applies to every per-track and Master meter comparison from now on):
- **Sustained windows** (the tap max within 1.0 dB of the previous 1 s window): the literal ±1.0 dB window-max oracle, unchanged.
- **Decay windows** (the tap max drops by more than 1.0 dB versus the previous window): compare the meter frame by frame with the round-26 ballistics model (the meter's `stepMeter` with 20 dB/s release) fed with the tap's per-frame block peak. Pass: **p95 |Δ| ≤ 0.5 dB and max |Δ| ≤ 1.0 dB** over every frame from the second frame after onset to the floor. The onset frame itself belongs to the onset window, which keeps the literal ±1.0 dB.
- C may re-score the existing `c-round-27/runs/tl-sfx-*` data (the tree is unchanged). Report the max as well as the p95 (round 27 gave p95 0.11 dB and no max).

**Not run in round 27 (§13), now owed** (one run each unless stated):
- R27-K at 1440 and Space on `M`;
- R27-L floating video at 1440 with the library collapsed (8,503 272×153);
- R27-TO: reset with a **non-empty Redo stack** (the Redo stack is untouched);
- R27-E: analysers/splitters created on `OfflineAudioContext` = **0**, measured live with a hook on `OfflineAudioContext.prototype.createAnalyser`/`createChannelSplitter`;
- R27-R: track Mute de-click (R22-M1 numbers), one loop 8–12 seam (round 25 `ur-1`), and the library drop of `სრული მიქსი` onto music at 7 (one clip);
- R27-TI: the video floor time after 6.008 s against the time-to-floor oracle;
- the C-R23-01 post-hydration code points (lane `aria-label`s, track-meter sr-only text while over, Master control names).

### 4.2 SRW-24: the gap-keeping delete

**Setup:**
- library `სრული მიქსი` on music at 0 (trim it to 0–10 if needed) and a second music clip at 12;
- `Soft impact` on SFX at 4;
- the demo video on the video lane at 0 (0–6.008).

Record the clip table (id, lane, start, offset, duration) before and after each step.

**R28-DA — Delete on an audio range:**
- Make a 3–5 range on the music clip and press **Delete**.
- **Oracle:**
  - music parts 0–3 and 5–10;
  - the second part's `sourceOffset` = the original offset + 5.000 (±0.001);
  - the music clip at 12, every SFX/video clip and every `start` outside the window are unchanged;
  - the playhead is unchanged;
  - one history entry, labelled `წაშლა მონაკვეთზე`;
  - the status matches §2.3.
- **Audio proof:** export before and after. With the other lanes muted or soloed:
  - after-export `[3, 5)` on music is silent (≤ −90 dBFS, or digital 0);
  - `[5, 10)` equals the before-export `[5, 10)` within max |Δ| ≤ 1 LSB;
  - `[0, 3)` is equal.

**R28-DB — Backspace and Shift variants:** the same as R28-DA with Backspace (after an Undo), then Shift+Delete and Shift+Backspace. Each gives the same gap result, and none closes time.

**R28-DV — video:**
- A 2–4 range on the video clip, then Delete → parts 0–2 and 4–6.008, with the right part's offset at 4.000.
- Play from 1.5 s:
  - in 2–4 the dock shows the existing no-clip state;
  - from 4 s the video time = clip time − 4 + 4.000, within the existing R3-V1 tolerance (state it);
  - the audio lanes are unaffected.

**R28-DM — whole clip, several clips, several lanes:**
- one whole clip selected → Delete leaves a gap (unchanged behaviour; regression);
- two clips on two lanes selected → both gone, gaps kept;
- every other clip unchanged.

### 4.3 SRW-24: vertical extend and the ripple

**R28-VL — Ctrl+Shift+L:**
- A 3–5 range on the music clip, then **Ctrl+Shift+L**:
  - every lane shows one `arrangement-lane-range` with `data-range-start="3.000"`/`data-range-end="5.000"`, the label appears once, and no clip-level range overlay remains;
  - the loop is **not** toggled;
  - there is no history entry and the status matches.
- Ctrl+Shift+L without a range: nothing is selected and the status matches.
- Ctrl+L still toggles the loop on the range.
- Screenshot at 1440.

**R28-VD — Delete after Ctrl+Shift+L:**
- Delete → 3–5 gaps on music, SFX (if `Soft impact` crosses 3–5; otherwise report that the lane had no material there) and video;
- every later clip keeps its `start`;
- one history entry, labelled `წაშლა მონაკვეთზე (ყველა ხაზი)`;
- the playhead and the loop are unchanged.

**R28-CX — Ctrl+Shift+X:**
- On the same all-lane 3–5 range (after an Undo), Ctrl+Shift+X:
  - 2.000 s is removed from the timeline;
  - every later audio/video clip moves left by exactly 2.000;
  - clips straddling the edges are trimmed/joined with correct offsets (= `deleteTime`);
  - the clipboard holds the parts, and Ctrl+V at 30 pastes them on their original lanes (R9-C3).
- Repeat once on a **single-lane** range: it closes on every lane, as before.
- **While playing** (old R1-B12): start at 7, press Ctrl+Shift+X with a range 4–6 at ~8 s. The playhead jumps left by 2 s consistently, there is no stop, and the audio stays aligned with the shifted clips (the export after the edit matches).
- **Loop** (old R5-L5): a loop at 6–8 is remapped to 4–6 with status.

**R28-UR — Undo/Redo:**
- each of DA, VD and CX is exactly one history step;
- Undo restores the clip table exactly; Redo re-applies it exactly;
- the playhead, the loop and the video stay in sync after each, checked as in R28-PS.

### 4.4 SRW-24: safety, labels and keyboard

**R28-PS — position, loop, sync:**
- After DA and VD while **playing** across the window: no playhead jump and no stop. The gap is silent on the tap for the edited lanes (≤ −60 dBFS within 60 ms of the window start), and after the window the audio and video continue aligned (drift within the existing tolerance; state it).
- One run each for DA and VD.

**R28-TF — no unplanned ripple:**
- Backspace/Delete while typing in the library search, in a detail panel number input and in a track name field (if it is editable): no clip changes.
- Delete with nothing selected: nothing changes, and the existing status appears.
- The transport `⌫ წაშლა` button on a range: a gap (like Delete).
- Ctrl+E on an all-lane range: refused, and nothing changes.

**R28-UI:**
- the transport button `title`/`aria-label` in the three states (§2.4);
- the footer hint shows `Ctrl+Shift+L` and the legible Ctrl+Shift+X text at 1440 and 1280;
- **geometry oracle:** the footer height and the scroller numbers equal round 27 (C round 27 R27-L: 1440 scroller 496/604; 1280 closed 386, open 280; rows 81×4 and 53/61/61/61). A wrapped hint that changes any of them is a FAIL;
- screenshots.

**R28-K:**
- the Tab order from `← CZABA` to the first lane's Volume equals round 27;
- Space on a lane button still toggles playback;
- the global keys still work: Ctrl+Z/Y, Ctrl+A, Ctrl+D (refused on a range), Ctrl+C/X/V on a single-lane range (R9-C1/C2, one run each).

**R28-E:** one export of the R28-DA result is consistent with the clip table: frames, NaN 0, header, and silence in the gap.

**R28-R (adjacent, one run each):**
- R9-C4 refusals;
- the gesture guard: Delete/Ctrl+Shift+L during a clip drag gives `GESTURE_EDIT_BLOCKED_MESSAGE` and no change;
- the track meters still move during playback;
- the header is 35 px and the rows are 81×4 at 1440.

**R28-S (static, read-only):** `diff -u` of `b-round-27-snapshots/` against the live files. Every hunk must be within §3.2 (report each hunk's purpose).
- `ArrangementContext.test.ts`: exactly line 567;
- `StudioWorkspace.tsx`: the Shift branch and the hint text only;
- `ArrangementTransport.tsx`: strings only;
- `ArrangementLane.tsx`: the overlay and the `clipRange` condition only;
- `clipboard.ts`: `cutTimeToClipboard` byte-identical;
- `types/arrangement.ts`: one optional field.
- No hardcoded colour and no `any`/`@ts-ignore`; `scheduleKey` unchanged.

**R28-U:**
- the §2.6 cases exist and are green, and A's red-first output shows them failing on the snapshot sources;
- C mutations in a scratch copy outside `store/`, each must make a test fail:
  - (a) the range branch calls `deleteTime` again;
  - (b) the flag is ignored in `cutRangeFromArrangement` (one lane only);
  - (c) Ctrl+Shift+L falls through to the loop toggle;
  - (d) the delete remaps the playhead;
  - (e) the no-op creates a history entry;
  - (f) `cutTimeToClipboard` uses the gap-keeping helper.

  Report how each mutation was done.

**R28-Doc:** doc 034 exists, is in Georgian and matches the code. It states:
- the user's contract and the date;
- the superseded R1-B5, R1-B12 and R9-C5 clause;
- the flag and why `trackId` stays;
- the no-op rule;
- the Split refusal;
- the detail-panel single-lane rewrite;
- the overlay;
- the keys;
- the Ableton table of §4.5 with its statuses;
- the tests.

### 4.5 Ableton source and compliance (workflow addendum 2026-10-11)

B verified the primary source live on **2026-10-12 13:25 +04:00** with gstack `/browse`. The text is saved in `b-round-27/ableton-arrangement-view-20261012.txt` and `b-round-27/ableton-keyboard-shortcuts-20261012.txt`. The source is the **Ableton Live 12 Reference Manual**:
- <https://www.ableton.com/en/live-manual/12/arrangement-view/> §6.9 "Selecting Clips and Time" and §6.11 "Using the … Time Commands";
- <https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/> §42.5 "Editing".

No video is used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Delete on a time selection leaves a gap | §6.11: "Whereas the standard commands like Cut, Copy and Paste only affect the current selection, their '… Time' counterparts act upon all tracks by inserting and deleting time."; §42.5 lists Delete (Delete key) as a standard editing command | Standard commands affect only the selection; the time variants close time | Same (**user request**, and it matches the source) | R28-DA, R28-DB |
| Backspace = Delete | §42.5 lists only "Delete" (Win/Mac) | **Not confirmed** for the Windows Backspace key | **User request** | R28-DB |
| Delete Time / Cut Time close the gap on every track | §6.11: "Delete Time deletes a selection of time from the Arrangement, thereby moving any audio or MIDI clips on either side of the deleted area closer together"; the same for Cut Time | Confirmed | Ctrl+Shift+X is CZABA's **only** gap-closing delete. There is no separate Delete Time command (**conscious difference, user request**) | R28-CX |
| The Shift modifier = "Time Across All Tracks" | §42.5: "Some of the above editing shortcuts can also be applied … Time Across All Tracks: Shift" | Confirmed as a modifier rule; Shift+Delete is not named explicitly | Shift+Delete/Shift+Backspace **leave a gap** in CZABA. The user's rule "Delete/Backspace always leave a gap" wins (**conscious difference**). Ctrl+Shift+X = Cut Time is consistent with the modifier rule | R28-DB, R28-CX |
| Extending a selection across tracks | §6.9: "Holding Shift while clicking extends an existing selection in the same track or across tracks." | Confirmed (Shift+click / Shift+arrows) | Ctrl+Shift+L extends to **every** lane in one step (**user request; conscious difference** in gesture and shortcut). Shift+click extension is not implemented in this round. Whether Live has a Ctrl+Shift+L is **not confirmed**, so nothing is claimed | R28-VL |
| Split on a multi-track selection | not checked | **Not confirmed** | Refused with a status (**conscious difference**, smallest honest behaviour) | R28-TF |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). A test PASS alone never proves Ableton compliance.

### 4.6 Gates

**G28-1:**
- tsc 0;
- vitest = **1096** + A's new tests (≥ 16 new `it`), 0 failures. If a failure is a timeout under load, re-run that file alone and report both runs with the `node.exe` count;
- the build passes;
- Biome 0 errors on `./app` (read-only), with the warning count not above round 27's 218 + 1 info;
- the frozen tests are green **and unchanged** (sha in the frozen list): `clipboard.test.ts`, `model.test.ts`, `loop.test.ts`, `selection.test.ts`, `gesture-guard.test.tsx`, `render-budget.test.tsx`, `track-layout.test.tsx`, `track-meter.test.ts`, `track-meter-ui.test.tsx` and `meter-ui.test.tsx`;
- `ArrangementContext.test.ts` is green with only the line-567 amendment.

**G28-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-27-tree-sha256.txt` → **66 OK**;
- `git status --short` = the 62 baseline lines plus exactly the 4 lines in §3.2 (66 lines);
- `Header.tsx` is identical to HEAD, and nothing else under `store/` changed.

**G28-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (including during the edits, playback and an export);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts`.

**C-R23-01 information record (not PASS, not FAIL):** the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab` (round 27: 4 at 28013/28014 and 58733/58734), with context.

**Not re-run this round:** RF5-3, R3-V1, R3-V4 and R11-P3 sync. The change is an edit command; the video, dock, scheduler and transport code do not change (G28-2 proves it). The drift work is §4.1.

### 4.7 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01 (Medium; §4.1);
- C-R27-02 (Low; §4.1);
- C-R23-01 (Medium, Tech Lead);
- C-R6-02 and C-R8-01 (Tech Lead quiet Chrome).

**Open low items:**
- R26-M1;
- the Master hold tick (stage 4);
- DEMO-SFX-FULL-SCALE (Tech Lead a/b);
- L3 (removed-track taps);
- LIB-SEP-REASON;
- R27-T: the 4 px over cap is a readability question for the Tech Lead.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- the final commit/push only after everything, and the uncommitted round-6..27 tree (62 lines);
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4, and C's python probes in rounds 21–22;
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push);
- `Content-Type: text/html` without a charset;
- **new:** machine load (34–42 `node.exe`) during A/C runs.

Root review M1–M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

**Tech Lead manual checks:** R23-1/2, R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, R25-T, R26-T, R27-T, Lenis `/studio/*`, and the positive MP4/MOV import path.
- **New, R28-T:** in real Chrome with a real mouse and keyboard:
  - Delete/Backspace on a range leave a gap;
  - Ctrl+Shift+L is not intercepted by the browser on Windows;
  - Ctrl+Shift+X closes the gap;
  - the all-lane overlay is readable.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-27-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/delete-selection.test.ts app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts
npx vitest run app/lib/arrangement/__tests__/clipboard.test.ts app/lib/arrangement/__tests__/model.test.ts app/lib/arrangement/__tests__/loop.test.ts app/lib/arrangement/__tests__/selection.test.ts app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/track-meter-ui.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
git diff --stat cc1e531 -- app/components/layout/Header.tsx
diff -u ../tmp/studio-real-loop/b-round-27-snapshots/ArrangementContext.test.ts app/lib/arrangement/__tests__/ArrangementContext.test.ts
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If the server is up, A may use the browser (`a-browse.json`) for one smoke check on `/studio-lab`:
- range 3–5 + Delete leaves a gap;
- Ctrl+Shift+L shows the overlay on every lane;
- Ctrl+Shift+X closes the gap;
- there is no console error.

This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G28-1/2, R28-S, R28-U, R28-Doc, the C-R27-02 reruns and the R27-TL re-score). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-28.md`:**
1. the pre-flight gate (with the design-philosopher advice);
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes), including the exact `ArrangementContext.test.ts` diff;
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations.

Do not claim PASS.

**C → `c-round-28.md` and `c-round-28.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the clip tables;
- the export window numbers;
- the §4.1 decision-table row applied;
- the Ableton compliance column (§4.5);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers (before the next feature round).
- **If §4.1 row 2 or row 4 fires:** an A bug round before stage 3.
- **Round 29: SRW-13 stage 3**, FB-04 clip gain in the detail panel:
  - R13-M1: +6 dB ±0.2 on that clip only;
  - the existing `clipGain` node;
  - one history entry per gesture;
  - the export applies it;
  - never labelled input sensitivity;
  - the track meter shows it.
- **Stage 4:** FB-05 pan (R13-M2), the fader-click UX, round-9 M1/L8, and the Master hold tick.
- **Then:**
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter contract;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 28 -StartPhase A` and a higher limit.
