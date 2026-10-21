# CURRENT TASK — Round 29: SRW-24 follow-up bug round. All-lane clipboard keeps its lanes on Paste (C-R28-01), Cut Time no-op is honest (C-R28-02), the footer names the all-lane state (A-R28 review finding 4), doc 034 Ableton correction (D-29t)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-12
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11).
User request still authoritative for this contract: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/delete-selection-update.md` (2026-10-11), in particular: "Ctrl+Shift+X-ის … clipboard სემანტიკა შემოწმდეს არსებული Cut Time-ის კონტრაქტთან" and "Ctrl+Shift+X-ის მოქმედების დანიშნულება UI-ში გასაგებად აისახოს".

> **Environment prerequisite for C (root, not BLOCKED):** the dev server `http://127.0.0.1:5173` was **down** again when B planned (2026-10-12, `curl` → `000`). Root must start it before the C phase. No agent starts or stops it. A needs it only for the optional smoke check.
>
> **Machine load:** B counted **10** `node.exe` at planning time (rounds 27–28: 34–42). Every A and C run records the count (`tasklist | grep -ci node.exe`). §4.1 uses it for C-R27-02.

## Why this round

**C bugs first.** C round 28 (`c-round-28.md`, `c-round-28.json`) is a **FAIL** only because C-R27-01 stays open. **Every SRW-24 ID passed** (R28-DA..Doc, G28-1..3; vitest 1119/1119), and every owed round-27 item passed.

B's decisions (D-29t in `plan.md`, rationale in `b-round-28.md`):
- **C-R27-01 (Medium) → decision-table row 3, Tech Lead quiet Chrome.** vm-3's actions all landed ~2 s off-procedure, the same category C used to replace vm-1/vm-2. That leaves 2 valid runs (vm-4 PASS 19.0 ms, vm-5 FAIL 287.6 ms) with the budget exhausted, so the result is mixed. **No A round:** there is no mechanism hypothesis, so an A round would be the open-ended sync investigation the workflow forbids. Not in this round.
- **C-R27-02 (Low) → watch**, with a now-evaluable rule (§4.1).
- **New Low bugs, both on the SRW-24 contract, scheduled now** (round size: at most three tightly related bugs):
  1. **C-R28-01:** material cut or copied from an all-lane range pastes onto the **active** lane when it spans a single audio lane (`planClipboardPaste`'s D-25 rule; `c-round-28/runs/finding2.txt`). A round-28 code review finding 2 is the same issue.
  2. **C-R28-02:** Cut Time on a zero-width range (or one that changes nothing) says `სიცარიელე დაიხურა ყველა ხაზზე` although nothing changed, and it clears the range and remaps a stopped playhead (`c-round-28/runs/zero-width-cx.txt`).
  3. **A-R28-REVIEW-4:** the all-lane state is visible only in the transient status. The overlay is `aria-hidden`, and the footer `arrangement-range` line does not name it.
- **Doc 034 correction:** B's round-27 Ableton table said Live's Ctrl+Shift+L was "not confirmed". B's own saved source shows it exists (§4.5). This was **B's error**, and A corrects the doc.

**Accepted, not scheduled:** A-R28 review finding 5. The Split button stays enabled on an all-lane range and refuses on click with a status, like Ctrl+E (C R28-TF PASS). Disabling it would hide the reason.

**Rescheduled, not dropped:** SRW-13 stage 3 (FB-04 clip gain, R13-M1) moves to **round 30**, and stage 4 to round 31. Then SRW-14..20, R26-M1, SRW-21 and T12, in dependency order (§7).

**Previous round:** archived as `tasks/round-28.md`, byte-identical to the dispatched round-28 task (B verified with `cmp` on 2026-10-12).

**References:**
- B's record: `b-round-28.md`. Progress board: `feature-status.md`. Plan: `docs/technical/studio-real-workspace/plan.md` (D-29t).
- Backlog v30: `backlog.json` items **SRW-24** and **SRW-09**, plus findings C-R28-01, C-R28-02 and A-R28-REVIEW-4-ALL-LANE-FOOTER.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline** (B verified on 2026-10-12):
- HEAD is `c5ed47b`.
- `git status --short` has **66 lines**, identical to `b-round-28-git-status.txt`, which equals `c-round-28/gates/git-status-end.txt`.
- `sha256sum -c ../tmp/studio-real-loop/b-round-28-tree-sha256.txt` → **72 OK**.
- Dispatch snapshots of A's three existing code files and doc 034 are in `../tmp/studio-real-loop/b-round-28-snapshots/`:

  | File | sha256 |
  |---|---|
  | `app/lib/arrangement/clipboard.ts` | `fd24ad8e…` |
  | `app/contexts/ArrangementContext.tsx` | `a391f59b…` |
  | `app/components/arrangement/StudioWorkspace.tsx` | `8bf122dc…` |
  | `docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md` | `9fd808bc…` |

- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat anything in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit or delete them.
- Nobody commits in this round.

## 0. Scope

**The contract after this round** (it amends D-25; the rest of SRW-24 is unchanged):

| Action | Result |
|---|---|
| Ctrl+C / Ctrl+X on an **all-lane** range (after Ctrl+Shift+L), then Ctrl+V | Every pasted part goes back onto **its original lane**, even when the material came from one audio lane only. The active lane is ignored. |
| Ctrl+Shift+X (Cut Time) with material, then Ctrl+V | The same rule: original lanes. Cut Time always acts on every lane, so its clipboard is an all-lane clipboard. |
| Ctrl+C / Ctrl+X on a **single-lane** range, or on selected clips, then Ctrl+V | **Unchanged** (D-25): a clipboard on one audio lane goes to the active audio lane; a multi-lane clipboard keeps its lanes. |
| Ctrl+Shift+X when the edit changes nothing (zero-width range, or nothing at or after the window and no loop change) | No-op: no history entry, playhead unchanged, range and selection kept, clipboard unchanged, and an honest status. |
| Ctrl+Shift+X over a silent window **with clips after it** | **Not** a no-op: time closes, as today, with today's "nothing in the window" status wording. |
| An all-lane range exists | The footer range line also says `ყველა ხაზი`. |

**In (A):**
- the clipboard provenance flag and the paste rule (§2.1);
- Cut Time sets the flag, and the Cut Time no-op (§2.2);
- the footer range line (§2.3);
- doc 034 (§2.4);
- red-first tests in **one new** file (§2.5).

**In (C):**
- §4.1: the C-R27-02 rule and the C-R23-01 record;
- §4.2–§4.4: R29-PA, R29-PB, R29-PC, R29-PD, R29-NO, R29-NE, R29-FT, R29-UR, R29-K, R29-R, R29-S, R29-U, R29-Doc, G29-1..3;
- the Ableton compliance column (§4.5).

**Not in this round** (scheduled; not PASS):
- C-R27-01 (Tech Lead quiet Chrome; no re-measurement this round);
- SRW-13 stage 3 (round 30) and stage 4 (round 31);
- the stale status after Ctrl+Shift+L and a click on an empty lane (information; the existing pattern). The footer range line now shows the live state;
- automatic edge fades after cuts (routed to SRW-18/FB-06);
- the lane overlay `/60` readability (R28-T, Tech Lead);
- Paste Time (Live's Ctrl+Shift+V). The user did not ask for it. Recorded in §4.5 as a conscious difference, not as deferred user scope.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- the D-25 single-lane paste-to-active-lane rule for single-lane ranges and clips (R9-C1/C2, the frozen `ArrangementContext.test.ts` l.486–503);
- Cut Time: R9-C3 (paste on original lanes, multi-lane), the loop remap (R5-L5), the playhead remap while stopped, and "Cut Time over silence keeps the previous clipboard" (frozen l.505–521);
- the round-28 delete/extend behaviour (frozen `delete-selection*.test.*`);
- the footer geometry (R28-UI numbers);
- the render budget (`render-budget.test.tsx`).

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`. Also read `prompts/studio-feature.md`, and run the `pre-flight` skill. `AUDIO_ARCHITECTURE.md` is required only if you touch anything that reschedules audio; this task should not.
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-28-tree-sha256.txt` and expect **72 OK**. Run `git status --short` and expect **66 lines**, identical to `b-round-28-git-status.txt`. Compare your four existing files with the snapshot shas above. Report any difference **before** doing anything else, and do not "fix" it.
3. Read:
   - `clipboard.ts`, all of it (`ArrangementClipboard` l.20–23, `copyRangeToClipboard` l.71–85, `cutTimeToClipboard` l.161–175, `planClipboardPaste` l.185–232);
   - `ArrangementContext.tsx`:
     - l.905–924 (`applyEdit` returns `false` when nothing was committed);
     - l.1651–1768 (`copySelection`, `cutSelection`, `cutTimeSelection`, `pasteClipboard`);
   - `StudioWorkspace.tsx` l.1435–1451 (the footer `arrangement-range` line);
   - `model.ts` l.378–408 (`deleteTime`, read-only). Note that it returns a **new** object for any non-zero window, even when no clip moves, so the no-op test must use `applyEdit`'s return, **not** object identity;
   - the frozen tests:
     - `clipboard.test.ts` l.120–141 (`cutTimeToClipboard`'s clipboard is pinned with `toEqual`, so its output must stay byte-identical);
     - `ArrangementContext.test.ts` l.480–541;
     - `delete-selection.test.ts` l.164–212;
     - `delete-selection-ui.test.tsx` l.380–405;
     - `detail-panel.test.tsx` l.320–326 (`arrangement-range` with `toContain`).
4. **B's probes** (these decide the contract):
   - Every frozen assertion on a clipboard object either has no flag (single-lane range, clips, `cutTimeToClipboard`) or compares only `items`/`length`. Therefore the new field must be **absent unless true**: never write `allTracks: undefined` or `false`.
   - The frozen "Cut Time over silence keeps the previous clipboard" test (l.505–521) runs Cut Time 9–10 on a fixture where `applyEdit` commits nothing (`undoLabel` stays `null`). It is exactly the C-R28-02 no-op. It requires the status to **contain** `ბუფერი არ შეცვლილა`, and the later Paste of the clip clipboard to go to the active lane `sfx`. Your no-op must keep both.
   - The frozen R9-C3 provider test (l.523–541) pastes a multi-lane Cut Time clipboard. It is unaffected.
   - **Grep yourself** for any other frozen test that runs `cutTimeSelection()` then `pasteClipboard()` with a one-audio-lane window and a different active track. Report the result. If one exists, stop and report: it would be a frozen contract conflict for B, not something to edit.
   - Also grep every consumer of `clipboardRef` and `ArrangementClipboard` (status text, any serialisation, `toStrictEqual`/`toEqual` on a whole clipboard). Report each, and confirm that the new optional field breaks none.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Clipboard provenance (`clipboard.ts`)

- `ArrangementClipboard` gets **one** optional field meaning "taken from a time selection across every lane", for example `allTracks?: true`. Use another name if you prefer, but document it in doc 034. It is present only when true.
- `copyRangeToClipboard(arrangement, range)` sets it when `range.allTracks` is set; otherwise its output is **identical** to today.
- `cutTimeToClipboard` is **not** changed (byte-identical function body).
- `planClipboardPaste`: when the clipboard has the flag, it **skips** the one-audio-lane active-track routing. Every item goes to `item.trackId`, and the plan's `trackId` is `null` (as for a multi-lane clipboard). Everything else is unchanged: refusals, lane-kind check, source availability, overlap check, `at` clamp, ids.
- `copyClipsToClipboard` and `cutRangeFromArrangement` are unchanged.

### 2.2 Context (`ArrangementContext.tsx`)

**`cutSelection` / `copySelection`:** no code change is needed if they keep using `copyRangeToClipboard`. Verify it.

**`cutTimeSelection`** (the only changed callback):
- Compute `cutTimeToClipboard` as today, then call `applyEdit(result.arrangement, 'Cut Time', undefined, { a, b })` **before** touching the clipboard.
- **If `applyEdit` returns `false` (no-op):**
  - do not change `clipboardRef`;
  - no `updatePosition`;
  - no `setRange(null)` and no `setSelection(NO_SELECTION)`;
  - status: `Cut Time {a} — {b}: ამოსაჭრელი დრო არ არის — არაფერი შეცვლილა, ბუფერი არ შეცვლილა.` It must contain `ბუფერი არ შეცვლილა` (frozen l.512) and must **not** contain `სიცარიელე დაიხურა`.
- **If it returns `true`:**
  - when there is material, `clipboardRef.current = { ...result.clipboard, allTracks: true }` (the §2.1 flag);
  - everything else as today: stopped-playhead remap, clear the range and selection, the status (including the "მონაკვეთში ხმა არ იყო, ბუფერი არ შეცვლილა" wording when there was no material but time closed), and the loop-removed suffix.
- The gesture guard and the no-range refusal are unchanged.

**`pasteClipboard`:** no change. The existing status prints `· {lane} ხაზზე` only when `plan.trackId` is set, so an all-lane paste reads `ჩასმა (n): {t}-ზე.`. That is honest and needs no new string.

No change to the video, dock, scheduler, loop, transport, meters, Master or graph logic.

### 2.3 Footer (`StudioWorkspace.tsx`)

- In the `arrangement-range` paragraph, when `range.allTracks` is set, append ` · ყველა ხაზი` after the length segment, before the `arrangement-delete-hint` span.
  - Example: `მონიშვნა: 00:03.000 — 00:05.000 · სიგრძე 00:02.000 · ყველა ხაზი · Delete = წაშლა, სიცარიელე რჩება · Ctrl+Shift+X = Cut Time`.
- Wrap it in `data-testid="arrangement-range-all-lanes"` so it can be queried; no new colour (inherit, or reuse a token already used in that footer).
- Without the flag, the line is byte-identical in rendered text to today.
- No other change in this file. The footer must not wrap at 1280 or 1440 (C's R29-FT geometry oracle).

### 2.4 Doc 034 (`docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md`)

Add a dated Round-29 section (Georgian; technical terms in English) and fix the existing text:
- **Line ~63 (Paste):** state the rule exactly: an all-lane clipboard (all-lane Copy/Cut, Cut Time) goes to the original lanes; a single-lane range or clip clipboard on one audio lane goes to the active lane (D-25).
- **Cut Time no-op:** what counts as a no-op, and what does not (silence with later clips still closes time).
- **The footer `· ყველა ხაზი`.**
- **The Ableton table (l.118–140):** replace the Ctrl+Shift+L row's "Live-ში Ctrl+Shift+L-ის არსებობა არ შემოწმებულა", and add the rows from §4.5 below with their statuses and section numbers.
- **The tests** of §2.5, and the D-25 amendment (D-29t).

### 2.5 Tests (written first; red on the snapshot sources)

**Order:**
1. Write the new tests against the **unchanged** sources.
2. Run them and paste which fail and why. If the file fails to load, prove red in a scratch copy **outside `store/`**, as in rounds 24–28, and say how.
3. Implement, then re-run.

**New file:** `app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx`. Pure and provider tests may share it; mount the real provider as the frozen tsx tests do.

**No existing test file changes.** All 72 frozen files stay byte-identical, including `clipboard.test.ts`, `ArrangementContext.test.ts`, `delete-selection.test.ts` and `delete-selection-ui.test.tsx`.

At least **10** new `it` blocks. Each fixture must make the wrong behaviour observable, for example a one-audio-lane window with the active lane set to a **different** audio lane:

1. **Pure:**
   - `copyRangeToClipboard` with an all-lane range whose material is on music only → the clipboard has the flag, and `planClipboardPaste` with `activeTrackId: 'sfx'` puts the part on **music**, with plan `trackId` `null`;
   - the same clipboard **without** the flag (single-lane range) → it goes to `sfx` (D-25 unchanged);
   - `copyRangeToClipboard` without `range.allTracks` has **no** own property for the flag (`Object.hasOwn` is false);
   - a flagged clipboard whose original lane is video still pastes on video, and the lane-kind and overlap refusals still apply to it (one overlap case).
2. **Provider:**
   - the C repro: music 7–23, range 20–22 on music, `extendRangeToAllTracks`, `cutSelection`, active lane `sfx`, seek 20, `pasteClipboard` → the part is on music at 20 with offset 13 and duration 2; the label is `ჩასმა (1)`; the status has no `SFX ხაზზე`;
   - the same with `copySelection` instead of cut;
   - Cut Time on a window with material on **music only**, active `sfx`, seek 30, paste → music at 30;
   - a single-lane range Ctrl+X on music, active `sfx`, paste → `sfx` (D-25 regression);
   - the Cut Time no-op on a zero-width range (`start === end`), stopped with the playhead **after** the window (seek 20, range 15–15):
     - `undoLabel` unchanged and the position still 20;
     - the range is still set and the selection unchanged;
     - the clipboard unchanged (a later paste pastes the previous clipboard);
     - the status contains `ბუფერი არ შეცვლილა` and does not contain `სიცარიელე დაიხურა`;
   - the Cut Time no-op on a non-zero window with nothing at or after it (for example 40–41 on the fixture) → the same oracles;
   - Cut Time over silence **with** a later clip → **not** a no-op: one history entry `Cut Time`, the later clip moves left by the length, and the stopped playhead after the window is remapped.
3. **UI:**
   - after Ctrl+Shift+L (the real `StudioWorkspace` key handler), `arrangement-range-all-lanes` exists and the `arrangement-range` text contains `ყველა ხაზი`;
   - on a single-lane range neither appears.

### 2.6 After the code

- Self-check these edge cases:
  - an all-lane clipboard where one source became unavailable (the existing `missing` refusal);
  - paste at 0 (`at` clamp);
  - Cut Time while playing on a no-op window (no remap either way);
  - Undo right after a no-op (it undoes the previous entry);
  - the detail panel Apply after Ctrl+Shift+L (it writes a single-lane range; the footer label disappears).
- Run `npx biome check --write` **only** on your own code and test files, then a read-only `npx biome check ./app`.
- Run the `code-reviewer` agent (more than 3 files changed) and report its findings and your dispositions.
- **Mutation checks only in a scratch copy outside `store/`.** Never mutate in place.
- Run the §5 commands. One browser smoke check is allowed if the server is up.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

The 66 lines of `b-round-28-git-status.txt`, including the two foreign agent files (not Studio work; do not touch).

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/clipboard.ts` | A | §2.1 only |
| `app/contexts/ArrangementContext.tsx` | A | §2.2 only (`cutTimeSelection`) |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.3 only (the `arrangement-range` paragraph) |
| `docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md` | A | §2.4 |
| `app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx` | A | **new**, §2.5 |
| `../tmp/studio-real-loop/a-round-29.md`, `a-round-29/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-29.md`, `c-round-29.json`, `c-round-29/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: exactly 67 lines.** That is the 66 baseline lines plus:

```
?? app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx
```

`clipboard.ts`, `ArrangementContext.tsx`, `StudioWorkspace.tsx` and doc 034 are already in the 66 (` M` or `??`). Check this and report if not.

### 3.3 Frozen this round

**Frozen:** all 72 files in `b-round-28-tree-sha256.txt` and everything else under `store/`. That includes:
- `types/arrangement.ts`, `model.ts`, `ArrangementLane.tsx`, `ArrangementTransport.tsx`, `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementTrackMeter.tsx`, `ArrangementExportDialog.tsx`, `ArrangementLibrary.tsx`;
- `meter.ts`, `graph.client.ts`, `loop.ts`, `transport.ts`, `video-sync.ts`, `schedule.ts`, `view.ts`;
- **every existing test**.

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
- reverting round-6..28 work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewports:** 1440×900; 1280×720 for R29-FT.

**Harness rules (unchanged):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press` (`Control+Shift+KeyL`, `Control+KeyX`, `Control+KeyC`, `Control+KeyV`, `Control+Shift+KeyX`).
- Ranges come from the existing clip range gesture or the detail panel inputs. Zero-width ranges come from the clip range gesture (drag ~4 px and back), as in round 28.
- No source instrumentation. C may hook browser APIs, labelled as such.
- Mutations run only in a scratch copy outside `store/`.
- **Every run and every vitest gate records the `node.exe` count.**

**Checkpoint order if the session may end:** G29 → §4.2 → §4.3 → §4.1. Write `c-round-29/checkpoint.md` as you go.

### 4.1 Carried follow-ups

**C-R27-02** (B's pre-registered rule, D-29t):
- Run the round-27 frozen 8-file batch **3 times**, recording `node.exe` each time.
- "Low load" = `node.exe` **< 30** at batch time:
  - 3/3 green at < 30 → **closed**;
  - any failure at < 30 → it stays open as a test-robustness item, with the failing assertion text;
  - a run at ≥ 30 does not count either way. State that, and it stays on watch.
- No test is edited.

**C-R27-01:** not re-measured this round (row 3 → Tech Lead quiet Chrome). Carry it.

**C-R23-01 information record** (not PASS, not FAIL): the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab` (round 28: 2 at 28013/28014), with context. This round changes footer text only when a range exists, so a change in offset is not a fix.

### 4.2 The clipboard keeps its lanes

**Setup** (C round 28 `finding2.txt`): library `სრული მიქსი` on music at 7 (7–23), `Soft impact` on SFX at 4 (4–6), the demo video at 0 (0–6.008). Record the clip table (id, lane, start, offset, duration) before and after each step.

**R29-PA — the C-R28-01 repro, all-lane Cut:**
- Range 20–22 on the music clip, then Ctrl+Shift+L, Ctrl+X, a click on the SFX lane name (active = SFX), seek 20, Ctrl+V.
- **Oracle:**
  - the pasted part is on **music** at 20.000, with offset = the cut clip's source offset + (20 − its start) (13.000 for a clip at 7 with offset 0; C round 28 actually used the music clip at 12, giving 8.000), ±0.001, and duration 2.000;
  - nothing new on SFX;
  - the status has no `SFX ხაზზე`;
  - label `ჩასმა (1)`.
- Audio proof (one export, music solo): `[20, 22)` equals the before-cut export's `[20, 22)` within max |Δ| ≤ 1 LSB.

**R29-PB — all-lane Copy:** the same with Ctrl+C instead of Ctrl+X, pasting at 26 → the part is on music at 26.

**R29-PC — Cut Time clipboard on one audio lane:**
- Range 14–16 on music (only music has material there), Ctrl+Shift+X, active SFX, seek 30, Ctrl+V → the part is on **music** at 30.
- The Cut Time itself is unchanged: later clips move left 2.000 and a loop around it is remapped (R5-L5, one run).

**R29-PD — D-25 unchanged (regression):**
- a single-lane range on music, Ctrl+X, active SFX, Ctrl+V → it goes to **SFX**, with status `· SFX ხაზზე`;
- one selected music clip, Ctrl+C, active SFX, Ctrl+V → **SFX**;
- a multi-lane all-lane window (3–5 across music, SFX and video, round-28 R28-CX layout), Cut Time, Ctrl+V at 30 → original lanes (R9-C3).

### 4.3 Cut Time no-op and the footer

**R29-NO — Cut Time no-op:**
- Stopped, playhead at 20, zero-width range 15–15 on music, then Ctrl+Shift+X:
  - no history entry;
  - the playhead stays at 20.000;
  - the range is still shown (footer `arrangement-range`);
  - the clip table is unchanged;
  - the status contains `ბუფერი არ შეცვლილა` and not `სიცარიელე დაიხურა`;
  - a following Ctrl+V pastes the **previous** clipboard.
- Repeat on a non-zero window after the last clip (for example 40–41): the same oracles.
- One run while **playing** on the zero-width window: no jump and no stop.

**R29-NE — not a no-op:** a silent window with a later clip (for example 24–26 with music ending at 23 and a second clip at 28), Ctrl+Shift+X:
- one history entry `Cut Time`;
- the later clip moves left 2.000;
- the stopped playhead after the window is remapped by −2.000;
- the status is today's wording (`მონაკვეთში ხმა არ იყო, ბუფერი არ შეცვლილა; სიცარიელე დაიხურა ყველა ხაზზე.`).

**R29-FT — footer:**
- After Ctrl+Shift+L, `arrangement-range-all-lanes` exists and `arrangement-range` contains `ყველა ხაზი`; on a single-lane range neither appears.
- **Geometry oracle (C round 28 R28-UI, range state):** footer 89, the range line 16 (one line), scroller 476 at 1440 and 280 at 1280 (panel open). Any wrap or any changed number is a FAIL.
- Screenshots at 1440 and 1280.

**R29-UR:** after R29-PA, PC and NE, each edit is exactly one history step; Undo restores the clip table exactly and Redo re-applies it.

### 4.4 Adjacent, static and tests

**R29-K (one run each):** Ctrl+Shift+L, Delete on an all-lane range (gap kept, round-28 R28-VD), Ctrl+L still toggles the loop, Ctrl+Z/Y, and the gesture guard (Ctrl+V and Ctrl+Shift+X during a clip drag → `GESTURE_EDIT_BLOCKED_MESSAGE`).

**R29-R (adjacent, one run each):**
- the R9-C4 refusals: a paste overlap, and an **empty clipboard** in a fresh page (owed from round 28);
- Ctrl+Shift+X without a range → `Cut Time-ისთვის ჯერ მონიშნე მონაკვეთი (Ctrl+Shift+X).`;
- the track meters still move during playback.

**R29-S (static, read-only):** `diff -u` of `b-round-28-snapshots/` against the live files. Every hunk must be within §3.2 (report each hunk's purpose):
- `clipboard.ts`:
  - the interface field;
  - `copyRangeToClipboard`'s flag;
  - `planClipboardPaste`'s routing condition only;
  - `cutTimeToClipboard` **byte-identical**;
- `ArrangementContext.tsx`: `cutTimeSelection` only;
- `StudioWorkspace.tsx`: the `arrangement-range` paragraph only;
- no hardcoded colour and no `any`/`@ts-ignore`.

**R29-U:**
- the §2.5 cases exist and are green, and A's red-first output shows them failing on the snapshot sources;
- C mutations in a scratch copy outside `store/`; each must make a test fail. Report how each mutation was done:
  - (a) `planClipboardPaste` ignores the flag;
  - (b) `copyRangeToClipboard` never sets the flag;
  - (c) `cutTimeSelection` stores the clipboard without the flag;
  - (d) the no-op path remaps the playhead;
  - (e) the no-op path clears the range;
  - (f) the no-op path keeps the old `სიცარიელე დაიხურა` status;
  - (g) `copyRangeToClipboard` writes the flag as `false`/`undefined` on single-lane ranges.

**R29-Doc:** doc 034 has the Round-29 section, the corrected Paste sentence, the no-op rule, the footer, and the corrected Ableton table (§4.5), and it matches the code.

### 4.5 Ableton source and compliance (workflow addendum 2026-10-11)

**Source:**
- **Ableton Live 12 Reference Manual**, saved by B on 2026-10-12 13:25 +04:00 with gstack `/browse`: `b-round-27/ableton-arrangement-view-20261012.txt` and `b-round-27/ableton-keyboard-shortcuts-20261012.txt`.
  - <https://www.ableton.com/en/live-manual/12/arrangement-view/> §6.9, §6.11;
  - <https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/> §42.5, §42.8, §42.16.
- B re-grepped the saved shortcut text on **2026-10-12** for this round:
  - §42.8 "Select Material in Loop = Ctrl+Shift+L";
  - §42.16 "Toggle Loop Brace = Ctrl+L", "Select Loop Brace Contents = Ctrl+Shift+L", "Cut Time = Ctrl+Shift+X", "Paste Time = Ctrl+Shift+V", "Delete Time = Ctrl+Shift+Delete".
- §6.11 says Paste Time "places copied time into the Arrangement". **No text in the source states which track a plain Paste targets.**
- No video is used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Pasting material taken from an all-lane time selection | §6.9 (selection-based Cut/Copy/Paste), §6.11 | **Not confirmed** (target track not stated) | Original lanes (user's vertical-selection request + "clipboard semantics checked against Cut Time"); D-25 amended | R29-PA, R29-PB |
| Pasting after Cut Time | §6.11, §42.16 (Cut Time Ctrl+Shift+X; Paste Time Ctrl+Shift+V) | Cut Time confirmed; Paste Time **exists** as a separate time-inserting command | Ctrl+V pastes clips on their original lanes and does **not** insert time; there is no Paste Time (**conscious difference**; not requested) | R29-PC |
| Cut Time with nothing to change | — | **Not confirmed** (the source does not describe it) | No-op with an honest status (smallest honest behaviour) | R29-NO |
| Ctrl+Shift+L | §42.8, §42.16 | Confirmed: Live uses it for "Select Material in Loop" / "Select Loop Brace Contents" | CZABA uses it to extend the existing range to every lane (**conscious difference, user request**). **Corrects B's round-27 "not confirmed".** | R29-K, R29-FT |
| Delete Time shortcut | §42.16: Ctrl+Shift+Delete | Confirmed | CZABA binds nothing to it; only Ctrl+Shift+X closes time (**conscious difference, user request**) | R29-K (Ctrl+Shift+Delete leaves the clip table unchanged) |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). A test PASS alone never proves Ableton compliance.

### 4.6 Gates

**G29-1:**
- tsc 0;
- vitest = **1119** + A's new tests (≥ 10 new `it`), 0 failures. Record `node.exe`. If a failure is a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome 0 errors on `./app` (read-only), with the warning count not above round 28's 218 + 1 info;
- the frozen tests are green **and unchanged** (in the 72 list): `clipboard.test.ts`, `ArrangementContext.test.ts`, `delete-selection.test.ts`, `delete-selection-ui.test.tsx`, `detail-panel.test.tsx`, `gesture-guard.test.tsx` and `render-budget.test.tsx`.

**G29-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-28-tree-sha256.txt` → **72 OK**;
- `git status --short` = the 66 baseline lines plus exactly the 1 line in §3.2 (67 lines);
- `Header.tsx` is identical to HEAD, and nothing else under `store/` changed.

**G29-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (including during cut/paste/Cut Time and an export);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts`.

**Not re-run this round:** RF5-3, R3-V1, R3-V4, R11-P3 sync and the C-R27-01 table. The change is clipboard/status/footer text only; the video, dock, scheduler and transport code do not change (G29-2/R29-S prove it).

### 4.7 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01 (Medium, Tech Lead quiet Chrome; vm-5 287.6 ms);
- C-R27-02 (Low; §4.1);
- C-R23-01 (Medium, Tech Lead);
- C-R6-02 and C-R8-01 (Tech Lead quiet Chrome).

**Open low items:**
- R26-M1;
- the Master hold tick (stage 4);
- DEMO-SFX-FULL-SCALE (Tech Lead a/b);
- L3 (removed-track taps);
- LIB-SEP-REASON;
- R27-T (the 4 px over cap);
- R9-REVIEWER-M1-L8 (stage 4).

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- the final commit/push only after everything, and the uncommitted round-6..28 tree (66 lines);
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4, and C's python probes in rounds 21–22;
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push);
- `Content-Type: text/html` without a charset;
- machine load: 34–42 `node.exe` in rounds 27–28, but 10 at B's planning time;
- the dev server was down again at planning.

Root review M1–M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

**Tech Lead manual checks:** R23-1/2, R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, R25-T, R26-T, R27-T, R28-T, Lenis `/studio/*`, and the positive MP4/MOV import path.
- **R28-T is extended:** after Ctrl+Shift+L, Ctrl+X and Ctrl+V on another active lane, the material returns to its own lane.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-28-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx
npx vitest run app/lib/arrangement/__tests__/clipboard.test.ts app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/delete-selection.test.ts app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
git diff --stat cc1e531 -- app/components/layout/Header.tsx
diff -u ../tmp/studio-real-loop/b-round-28-snapshots/clipboard.ts app/lib/arrangement/clipboard.ts
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If the server is up, A may use the browser (`a-browse.json`) for one smoke check on `/studio-lab`: the R29-PA repro lands on music; the footer shows `ყველა ხაზი`; no console error. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G29-1/2, R29-S, R29-U, R29-Doc, the C-R27-02 reruns). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-29.md`:**
1. the pre-flight gate, including the §1.4 grep result;
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations.

Do not claim PASS.

**C → `c-round-29.md` and `c-round-29.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the clip tables;
- the export window numbers;
- the C-R27-02 rule outcome;
- the Ableton compliance column (§4.5);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers (before the next feature round). **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 30: SRW-13 stage 3**, FB-04 clip gain in the detail panel:
  - R13-M1: +6 dB ±0.2 on that clip only;
  - the existing `clipGain` node;
  - one history entry per gesture;
  - the export applies it;
  - never labelled input sensitivity;
  - the track meter shows it.
- **Round 31: stage 4:** FB-05 pan (R13-M2), the fader-click UX, round-9 M1/L8 and the Master hold tick.
- **Then:**
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including the edge fades C noted) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter contract;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 29 -StartPhase A` and a higher limit.
