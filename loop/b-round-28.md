# B — Round 28 result → Round 29 dispatch (D-29t)

Author: B · Date: 2026-10-12 · Decision: **CONTINUE**

## 1. Session and restart record (honest)

- The first B session for this phase ended with an API error. Before it ended, it had made these durable:
  - `tasks/round-28.md` (byte-identical to the dispatched round-28 `current-task.md`; re-verified with `cmp`, and not overwritten);
  - backlog **v30** (`b-scripts/b-round-28-update.cjs`);
  - the backups (`backlog.json.bak-before-b-round-28`, `feature-status.before-b-round-28.md`, `b-scripts/b-next.before-r29.json`, `b-scripts/plan.before-r29.md`).
- Its `plan.md` script (`b-round-28-plan.cjs`) had literal CR/LF bytes written into string and regex literals by shell escaping. It never ran: `plan.md` had no D-29t, and it was identical to `plan.before-r29.md`.
- This session:
  - re-verified v30 against `c-round-28.json`/`c-round-28.md` (they match: the SRW-24 acceptance is PASS only on C's IDs, and C-R28-01/02 are open);
  - applied `plan.md` with `b-scripts/b-round-28-plan-v2.cjs` (CRLF preserved; 4 `D-29t` hits);
  - added a small backlog addendum (`b-round-28-backlog-addendum.cjs`: the C-R27-02 rule, round-29 C IDs and owned files, and the resume note);
  - wrote `current-task.md`, `feature-status.md`, this file and `b-next.json`, in that order.
- **Advisor (Fable):** available. It was called once after orientation and before writing; it was also used by the interrupted session. Advice applied:
  - write order;
  - the flag is "present only when true";
  - the no-op guard uses `applyEdit`'s return, because `deleteTime` returns a new object;
  - the footer geometry oracle;
  - the C-R27-02 `node.exe` < 30 rule;
  - B re-greps its own Ableton source before calling the round-27 row an error;
  - C-R27-01 moves into the Tech Lead banner.
- **Second advisor call** (after the files were written, before declaring done) found:
  - the cross-artifact consistency holds (owned files are outside the 72; the frozen tests stay compatible);
  - B had not yet read the two root files. B read them (see §8);
  - B added the `clipboardRef`/`ArrangementClipboard` consumer grep to the task's §1.4.
  The backlog v30 sentence written by the interrupted session ("called … once before declaring done") was written before this session's calls. This record is the authoritative one.

## 2. Independent checks by B (2026-10-12)

| Check | Result |
|---|---|
| HEAD | `c5ed47b` |
| `git status --short` | 66 lines = `b-round-28-git-status.txt` (= `c-round-28/gates/git-status-end.txt`) |
| `sha256sum -c b-round-28-tree-sha256.txt` | 72 OK, 0 other |
| Snapshot shas | `clipboard.ts` fd24ad8e, `ArrangementContext.tsx` a391f59b, `StudioWorkspace.tsx` 8bf122dc, doc 034 9fd808bc — all equal to live |
| Dev server | `curl` → **000** (down) → root prerequisite in the task, not BLOCKED |
| `node.exe` | **10** |
| Ableton source re-grep (`b-round-27/ableton-keyboard-shortcuts-20261012.txt`) | §42.8 "Select Material in Loop = Ctrl+Shift+L"; §42.16 "Toggle Loop Brace = Ctrl+L", "Select Loop Brace Contents = Ctrl+Shift+L", "Cut Time = Ctrl+Shift+X", "Paste Time = Ctrl+Shift+V", "Delete Time = Ctrl+Shift+Delete". The arrangement-view text has no statement about which track a plain Paste targets |
| Code reading | `planClipboardPaste` l.193–200 routes any one-audio-lane clipboard to the active track (C-R28-01 cause). `cutTimeSelection` l.1706–1734 ignores `applyEdit`'s boolean (C-R28-02 cause). Frozen `clipboard.test.ts` l.133 pins `cutTimeToClipboard`'s clipboard with `toEqual`. Frozen `ArrangementContext.test.ts` l.505–521 is exactly the no-op case and needs `ბუფერი არ შეცვლილა`. The frozen round-28 tests compare only `items`/`length`, or use single-lane clipboards, so the flag is compatible |

B did not re-run live behaviour (the server was down). The backlog status changes rest only on C's evidence.

## 3. Round 28 result (C)

- **FAIL** only on C-R27-01. Every SRW-24 ID passed: R28-DA/DB/DV/DM/VL/VD/CX/UR/PS/TF/UI/K/E/R/S/U/Doc and G28-1..3 (vitest 1119/1119; Biome 218 + 1; build 0; protected 4/4; anonymous `/studio-lab` OK; premium still requires sign-in).
- Round-27 owed items: all passed.
- R28-CX's while-playing "export matches" sub-oracle was a **labelled method substitution** (source offsets, not tap-vs-export). B accepts it as evidence of sync for the edit, not as an export comparison.
- R9-C4's empty-clipboard refusal was not run → R29-R.

## 4. Decisions (D-29t)

1. **C-R27-01 → row 3 (Tech Lead quiet Chrome).**
   - vm-3 was off-procedure: every action landed ~2 s late. That is the same environment category C used to replace vm-1/vm-2.
   - That leaves vm-4 PASS and vm-5 FAIL, with the budget exhausted, so the result is mixed.
   - There is no A round, because there is no mechanism hypothesis (track reads excluded, hardSeek 0, vm-3's excursion before any click). Such a round would be the open-ended sync investigation the workflow forbids.
   - **B table gap**, now defined for future tables: fewer than 3 valid runs after replacements = mixed/insufficient → Tech Lead, never PASS.
2. **C-R27-02 → watch with an evaluable rule:** `node.exe` < 30 is low load; 3/3 green → closed; a failure → test-robustness item.
3. **Round 29 = bug round** (C bugs first; the round-size rule allows at most three tightly related bugs). C-R28-01, C-R28-02 and A-R28 review finding 4 are all on the SRW-24 contract.
4. **C-R28-01: D-25 is amended.** A clipboard taken from an all-lane time selection (all-lane Copy/Cut, Cut Time) keeps its lanes on Paste. Single-lane range and clip clipboards keep the active-lane rule.
   - Smallest honest behaviour: one optional field, present only when true, and one condition in `planClipboardPaste`.
   - `cutTimeToClipboard` stays byte-identical, and the context adds the flag for Cut Time.
   - Rationale: the user asked for the Ctrl+Shift+X clipboard semantics to be checked against Cut Time. Sending material taken from a vertical selection onto an unrelated lane breaks that selection's meaning.
5. **C-R28-02:** the no-op is defined by `applyEdit` returning `false`. A silent window with later clips is **not** a no-op.
6. **Finding 4:** the footer range line gets `· ყველა ხაზი`. **Finding 5 is accepted:** the Split button stays enabled and refuses on click with a reason.
7. **Ableton correction (B's error):** round 27 said Live's Ctrl+Shift+L was "not confirmed". B's own saved source lists it. Doc 034 is corrected in round 29. Paste Time (Ctrl+Shift+V) exists in Live but not in CZABA: a conscious difference, not requested, and not deferred user scope. The paste target track is **unconfirmed** in the source.
8. **Information only:** the stale status after Ctrl+Shift+L and a click (the footer line now shows live state); no edge fades (→ SRW-18); the overlay `/60` (→ R28-T); C-R23-01 now 2 NUL (an offset shift, not a fix).

## 5. Status changes (`feature-status.md`)

- FB-02, SRW-09 and SRW-24 → **ბაგია (Low)**: every C ID passed, with C-R28-01/02 and finding 4 open.
- SRW-13 stays **ბაგია**: stage 2b's IDs all passed, and C-R27-01 is with the Tech Lead. Stage 3 → round 30, stage 4 → round 31.
- C-R27-01 is promoted into the top Tech Lead banner next to C-R23-01.
- Nothing becomes "მზადაა" in this round.

## 6. Next task

`current-task.md`, round 29, built on the round-28 baseline.

**A owns:**
- `clipboard.ts`;
- `ArrangementContext.tsx` (`cutTimeSelection` only);
- `StudioWorkspace.tsx` (the `arrangement-range` paragraph only);
- doc 034;
- a new `all-lane-clipboard.test.tsx` (≥ 10 `it`).

All 72 frozen files stay untouched, and the expected status is 67 lines.

**C checks:**
- R29-PA/PB/PC/PD (paste lanes, with the D-25 regression);
- R29-NO/NE (Cut Time no-op vs a real close);
- R29-FT (footer text and the round-28 geometry);
- R29-UR, R29-K, R29-R (including the owed empty-clipboard refusal), R29-S, R29-U (mutations a–g), R29-Doc and G29-1..3;
- the Ableton two-verdict column;
- the C-R27-02 rule and the C-R23-01 record.

## 7. Why not COMPLETE / BLOCKED

- **Not COMPLETE:**
  - FB-04..07 and FB-09..13 have not started (SRW-13 stages 3–4, SRW-14..20);
  - SRW-21's adapter is not done;
  - C-R27-01, C-R23-01, C-R6-02 and C-R8-01 are open (Medium);
  - the full regression and the root check have not been run.
- **Not BLOCKED:**
  - the dev server being down is a root environment action, not missing information or approval;
  - the Tech Lead items (C-R23-01 grant/React 19, quiet Chrome, DEMO-SFX, SRW-21 route mount) block only themselves; independent scope continues.

## 8. Root follow-ups carried

Carried from `root-pre-push-review.md` and `publication-checkpoint.json`, unchanged:
- SRW-21's middle-east loader;
- Lenis on `/studio/*`;
- portable instruction paths;
- the export hard-clip;
- the final commit/push, with the uncommitted round-6..28 tree at 66 lines;
- `Modal.tsx` focus;
- GA scroll while consent is denied;
- the 2 foreign agent files;
- the fake Bearer → 500;
- the CDP allowlist;
- `Content-Type` without a charset;
- the publication-checkpoint items (T12, final commit/push).

Updated: machine load was 10 `node.exe` at planning, and the dev server was down at planning.

**B read both root files on 2026-10-12:**
- `root-pre-push-review.md` (2026-10-07):
  - M1–M3, L1–L4 and L6–L8 are closed in earlier rounds; L5 (`biome-ignore` tool directives) is accepted;
  - the §3 commit-scope rule (stage exact paths, never `git add -A`) stays a root rule for the final commit.
- `publication-checkpoint.json` (2026-10-09):
  - its remaining requirements are already carried: library/stems/scrollbars (SRW-12 ready, SRW-23 Tech Lead), discoverable entry (SRW-22 ready), the purchased-adapter limitation (SRW-21), portable paths, T12 after the original scope, and the final commit/push by root only after everything.
- **No finding is missing** from the carried list in `current-task.md` §4.7 / `feature-status.md` §6.
