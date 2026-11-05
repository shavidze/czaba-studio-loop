# CURRENT TASK — Round 358: PERF-10a, re-dispatched with the ruling on C-R357-01 (the workspace remount keeps HEAD's status text and announcement)

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 357 → 358 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v320 → v321):
- **D-29z1155:** round 357 is closed as FAIL from C's evidence. `c-round-357.json` has `taskStatus` FAIL and `browserVerified`/`realVerified` false. This was an L22 short round after A's STOP. C reproduced **C-R357-01 (Medium)** in a real browser. Gate 357 was skipped, so nothing was published [K16].
- **D-29z1156:** the ruling on C-R357-01 is **(b), restore HEAD's text and order** (§1). It covers this task.
- **D-29z1157:** routing of A's code-reviewer notes (§5).
- **D-29z1158:** the order after this round (§5).

**This is the same feature, PERF-10a.** The round-357 task, archived byte-equal as `tasks/round-357.md`, stays in force except where this file changes it. In particular, these sections apply unchanged:
- §0.2, the change and its rulings;
- §1.2 and §1.3, the test rulings, new rows and mutants M-B1–M-B4;
- §3, neighbouring behaviour;
- §4, the STOP conditions.

Section numbers like "357 §0.2" below refer to that archive.

**Read first:**
- `lessons.md`. A reads 10, 11, 12, 23, 26, 28, 38, 52 and 58. C also reads 22, 37, 38, 48, 51, 57, 59 and 60.
- `a-round-357.md` (A's STOP trace) and `c-round-357.md` (C's reproduction).
- Primitives, as in round 357: `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new name, an expected value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:**
- Reference-first, product-designer, the screen budget and the YouTube request: this is still a performance round. The ruling exists precisely so that nothing on screen, in audio or in behaviour changes against HEAD.
- Ableton conformance: not applicable.

## Baseline
- HEAD is `d49536b`, the gate-356 publication [K1]. Gate 357 did not publish [K16].
- **The tree is A's round-357 work and must be kept** (L11, policy 6: preserve partial work):
  - 56 status entries [K2];
  - B's round-356 sketch, applied exactly;
  - doc 234.
- A starts from this tree and does not re-apply or revert round-357 work.
- The root-lane rule is unchanged: the K2 count of changes outside root lanes must stay 0.
- Protected files are 11/11 OK [K6]. There is no dependency change [K9].

## 1. The ruling on C-R357-01 (D-29z1156)

### 1.1 What C found
On A's tree, a WIDE → NARROW → WIDE resize with a tempo-source clip present and a stopped insert-marker status leaves that status followed by an appended "Tempo 120 BPM from …" sentence. On HEAD the status after the remount is only the insert-marker sentence. Evidence: `c-round-357/remount3-head.json` vs `c-round-357/remount3-atree.json`.

The cause is the one A traced (`a-round-357.md` STOP, points 1–4):
- React runs child effects before the parent's.
- So the follow leaf's mount run queues its functional rewrite **before** StudioWorkspace's tempo-seed effect appends.
- On HEAD the Follow effect was a parent effect declared after tempo-seed, and its **string** write replaced the append.
- The second half of the finding: a string write always bumps `statusSequence`, so HEAD re-announces the unchanged stopped text at remount. A's tree does not.

### 1.2 Why (b) and not (a)
- PERF-10a promised no behaviour change.
- The only visible difference comes from a tempo seed re-running on remount. A flagged that as a pre-existing defect (A-R357-TEMPO-SEED-REMOUNT-DUP, now a deferred Low, §5).
- Accepting (a) would make a perf round depend on that defect's output. Whether tempo text should survive a remount is a question for that Low's own fix, not for this round.

### 1.3 The change (B's sketch, already run)
The patch is `b-round-357/sketch/source-delta.patch.txt`, made against A's tree. Its sha256 is in `b-round-357/sketch/patches.sha256` [K20]. It changes `StudioWorkspace.tsx` only, in three parts:

1. **The leaf fires only on a transition.**
   - `ArrangementPlaybackFollowSyncInner` keeps `const syncedRef = useRef(isPlaying)`.
   - Its `useEffect` returns early when `syncedRef.current === isPlaying`. Otherwise it stores the new value and calls `onPlayingChange(isPlaying)`.
   - It is a prev-value guard, not a first-run boolean. It stays correct under StrictMode's double effect run, although `entry.client.tsx` does not use StrictMode today [K19].
   - The layout effect that writes `committedRef` is unchanged.
2. **`syncFollowWithPlayback(isPlaying, atMount = false)`.**
   - In the stopped branch, `if (previewText !== null || atMount)` keeps **HEAD's string write** `current.setStatus(current.describeSpaceStart())`.
   - The functional form (357 §0.2 item 4, sketch-review finding 1) stays for every transition.
3. **The mount sync goes back to HEAD's position.**
   - `useEffect(() => { syncFollowWithPlayback(committedIsPlayingRef.current, true); }, [syncFollowWithPlayback]);` is declared right after `syncFollowWithPlayback`. That is HEAD's Follow-effect position, **after** the tempo-seed effect [K18].
   - It may read `committedIsPlayingRef`, because the leaf's layout effect writes the ref before any passive effect of the same commit.
   - `syncFollowWithPlayback` has stable deps (`[setFollowMode]`, a `useCallback` with `[]` deps), so the effect runs once per mount, exactly like HEAD's effect with `isPlaying` unchanged.

Nothing else changes: the store, the provider, the consumers, the 46-file sweep and the perf budgets stay as they are.

### 1.4 New test rows
File: `app/lib/arrangement/__tests__/follow-remount-ui.test.tsx` (new; B's copy is `b-round-357/sketch/tests-delta.patch.txt`).

The harness is a `RemountHarness` under a live `ArrangementProvider`. It conditionally renders `<StudioWorkspace />`, so the provider, its status and the playback store survive the remount, as on `/studio-lab` [K2]. The insert marker is set to 20 s, beyond a clip that ends at 6 s, and the status is set to `describeSpaceStart()`, a `stopped`-kind text.

- **RM1:** the clip is the bpm-90 stem. After the remount, the status equals the stopped text and does not contain the tempo-seed sentence.
- **RM2:** the clip is a music source without a BPM. After the remount, the status text is unchanged and `statusSequence` is `before + 1`, which is HEAD's re-announce.

| Tree | RM1 / RM2 | Evidence |
|---|---|---|
| HEAD `d49536b` | green | `b-round-357/rm-on-head.log` |
| A's round-357 tree | **red**: RM1 gets the tempo append; RM2 gets 2 where 3 is expected. These are C-R357-01's two halves | `b-round-357/rm-on-atree.log` |
| Sketch | green | `b-round-357/cover-sketch.log` |

**New named mutants** (L58), each red on RM1 and RM2:
- **M-B5:** delete the mount effect (item 3). Evidence: `b-round-357/mutants/mutant-m-b5.log`.
- **M-B6:** the mount call takes the functional path (drop `|| atMount`). Evidence: `b-round-357/mutants/mutant-m-b6.log`.

### 1.5 B's sketch runs (scratch `/home/runner/b357-scratch`: `git archive HEAD` + A's `git diff --binary` + A's 4 untracked files + the delta + a `node_modules` symlink; the scratch does not survive the job)

| Check | Result | Evidence |
|---|---|---|
| `npm run typecheck`; Biome on the two changed files | rc 0; rc 0 | `b-round-357/typecheck.log`, `b-round-357/biome.log` |
| Covering set: A-COVER's 69 files + `tempo-seed-ui` + `follow-remount-ui` | **71 files, 1290/1290** | `b-round-357/cover-paths.txt`, `b-round-357/cover-sketch.log` |
| RM1/RM2 on HEAD, on A's tree and on the sketch | green / red / green | §1.4 |
| C's own remount probe, run on a sketch dev server at :5191 | **equal to `c-round-357/remount3-head.json` on all 7 steps**. The final text is the insert-marker sentence only | `b-round-357/remount3-sketch.json` (script copy: `b-round-357/remount-probe3.mjs`) |
| `git apply --check` of both delta patches on A's tree | OK | — |
| M-B1–M-B4 on the sketch (A's round-357 builder) | red sets **identical** to A's round 357: 3, 2, 18 and 9 names | `b-round-357/mutants/sketch-m-b{1,2,3,4}.log` and `-red.txt` |
| Perf | **not re-run by B.** The delta adds no component and no render (one `useRef` in an existing leaf), and its only new write is on the mount path, which the interactions spec does not measure apart from page load. A-PERF and C's PERF still run in full, with the same expected values as 357 §0.3 | — |

Note: the sketch dev server shared `node_modules/.vite` through the symlink and re-optimised dependencies. That is a cache only, not source. If the :5173 dev server serves a stale optimise, restart it before the browser rows (L38: warm up first).

## 2. Scope (A)

### 2.1 Files
| File | Change |
|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | §1.3. Apply `b-round-357/sketch/source-delta.patch.txt` with `git apply`, or write the equivalent code |
| `app/lib/arrangement/__tests__/follow-remount-ui.test.tsx` | new: RM1, RM2 (§1.4). Apply `b-round-357/sketch/tests-delta.patch.txt`, or write the equivalent |
| `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | <ul><li>l.4 becomes `**სტატუსი:** In Progress (stage 1 of 3; C round 358 PASS)` (L28).</li><li>In Georgian, add the remount ruling C-R357-01 → (b), the mount sync after tempo-seed, and RM1/RM2 to its sections. Keep TEMPLATE's 7 `## ` headings in order (L26).</li><li>Cite only rows that exist.</li></ul> |

All other round-357 files stay as A left them. An edit to any other file is outside scope, except a test file that `tsc` or the covering set forces. That case is a STOP (L11), not an edit.

### 2.2 STOP conditions (in addition to 357 §4)
- RM1 or RM2 is not red on the tree before the delta, or not green after it.
- Any covering test changes result other than through RM1/RM2, or any of M-B1–M-B4 gives a red set different from `b-round-357/mutants/sketch-m-b{1,2,3,4}-red.txt`. B measured those on the sketch, and they are identical to A's round-357 red sets.
- The code-reviewer reports a new Medium+ that this task does not rule.

## 3. Acceptance

### 3.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-357/claims-358.sh`, run from the loop root | equals `b-round-357/claims-358-planning-output.txt` |
| A-CLAIMS final | same | <ul><li>K2 = `d49536b 57 outside-root-lanes-since-d49536b 0` (the 56 entries plus the new test file).</li><li>K4 `StudioWorkspace:11`.</li><li>K14 `raw-useArrangement-in-tests 72`.</li><li>K17 = `1 1 1 1`.</li><li>K18 `order seed-first`.</li><li>K19 = `rm-rows 2 strict-mode-in-entry 0`.</li><li>Every other K equals the planning output. K18's line numbers may differ from the sketch's 2028/2353; only the order is asserted.</li></ul> |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-COVER | from `store/`: `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-357/cover-paths.txt)` | all pass. B's sketch: 71 files, 1290/1290 |
| A-RM-RED (on the real tree, by order; no scratch) | <ol><li>Apply `tests-delta.patch.txt` **first**.</li><li>Run `npx vitest run app/lib/arrangement/__tests__/follow-remount-ui.test.tsx` and save the log as `a-round-358/rm-before-delta.log`.</li><li>Then apply `source-delta.patch.txt` and run it again (`a-round-358/rm-after-delta.log`).</li></ol> | before: RM1 and RM2 red, as in `b-round-357/rm-on-atree.log`; after: green |
| A-MUTANT (scratch only, L60) | <ul><li>M-B1–M-B4 exactly as in round 357 (357 §2.1 A-MUTANT).</li><li>M-B5 and M-B6 (§1.4) on `follow-remount-ui.test.tsx`.</li></ul> | <ul><li>M-B1–M-B4: the same red names and counts as `b-round-357/mutants/sketch-m-b{1,2,3,4}-red.txt` (3, 2, 18 and 9; identical to `a-round-357/mutant-m-b*-red.txt`).</li><li>M-B5 and M-B6: RM1 and RM2 red.</li><li>`store/` `git status` is unchanged.</li></ul> |
| A-PERF (production, **alone**, L38) | 357 §2.1 A-PERF's command and comparison | as in 357: rc 0; `complete`; 252 rows; 84/84; 0 NEW; play start/stop components equal 357 §0.3 (28); `perf-rowcmp.py` DIFF vs C356 only on the four play component rows; `durationMs` ≤ 540000 |
| A-REVIEW | `code-reviewer` on the **full** diff (the round-357 files plus this delta) | no unruled Medium+. Any code changed after the review goes back to the reviewer (L11). The Architecture note goes to B. Lows already routed by D-29z1157 need no new id |
| A-DOC | doc 234 | as in §2.1 |

### 3.2 C rows
C runs **every** row of 357 §2.2 that did not run in round 357, plus the new rows below. Round 357 ran only CLAIMS, SOURCE-SCOPE, DOCS, G357-AUTH and the STOP check.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-357/claims-358.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff --stat` | <ul><li>Only the files of 357 §1.1 plus §2.1 here (57 entries).</li><li>The `StudioWorkspace.tsx` change since round 357 matches §1.3 (C reads the hunk against `b-round-357/sketch/source-delta.patch.txt`).</li><li>`perf/**` and `package.json` are unchanged; K6 11/11.</li></ul> |
| READ | 357 §2.2 READ, plus §1.3 here | <ul><li>Every 357 READ point holds.</li><li>The leaf has the prev-value guard.</li><li>The mount effect is declared after the tempo-seed effect.</li><li>The mount call writes a string; transitions use the functional form.</li></ul> |
| UNIT | A-COVER's command | all pass |
| MUTANT (C's own, predicted first in `c-round-358/progress.json`) | 357 §2.2 MUTANT. One extra choice is allowed: a mutant of the §1.3 change other than M-B5/M-B6, for example removing the prev-value guard so the leaf also fires on mount, with the prediction written first | red on the predicted rows. If the prediction is "stays green" (that example is behaviour-equivalent at mount), C records it as an equivalence finding, not a FAIL |
| PERF | 357 §2.2 PERF | as A-PERF; play rows equal 357 §0.3 |
| PLAY-BEHAVIOUR, FOLLOW, VIDEO-SYNC, VIDEO-FAIL-STOP, NARROW | 357 §2.2, unchanged (both viewports where it says so) | as written there |
| REMOUNT (browser, dev, 1440×900; C-R357-01) | `c-round-357/remount-probe3.mjs` on A's tree. HEAD's result is `c-round-357/remount3-head.json`; C may re-run HEAD on a scratch server with its own `cacheDir` | each of the 7 step texts equals HEAD's; the final `data-playing` is false |
| REMOUNT-ANNOUNCE (jsdom) | RM2 within UNIT | green. The browser cannot show this half, because the status span is re-created on remount in both trees (C-R357-01 notes) |
| PRE-REMOUNT (record row; HEAD **and** tree, same script) | Tempo seed without a ruler click:<ol><li>Add "Night Pulse · Full mix".</li><li>Resize to 800×900, then to 1440×900.</li><li>Record the status text and the tempo field.</li></ol>Typed BPM, continuing from the first part's state (Night Pulse still on the timeline, so a re-seed could overwrite the value):<ol><li>Type 100 in the tempo field and commit it.</li><li>Resize to 800×900, then to 1440×900.</li><li>Record the tempo field.</li></ol> | **record only.** It is a FAIL of A only if the tree differs from HEAD. If the typed 100 is lost on HEAD, report it as pre-existing (`origin: pre-existing`) so B can re-evaluate A-R357-TEMPO-SEED-REMOUNT-DUP's severity |
| G358-AUTH (browser, both viewports) | `c-round-357/auth.mjs`, copied to `c-round-358/` | as G357-AUTH. A fake-bearer 500 that fails closed while the mock is down goes under `blocked` |
| DOCS | doc 234 | <ul><li>l.4 byte-exact: `**სტატუსი:** In Progress (stage 1 of 3; C round 358 PASS)`.</li><li>7 `## ` headings in TEMPLATE order.</li><li>It cites RM1/RM2 and only rows that exist.</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files.</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified** is false if any of these rows does not run: PERF, PLAY-BEHAVIOUR, FOLLOW, VIDEO-SYNC, VIDEO-FAIL-STOP, NARROW, REMOUNT, PRE-REMOUNT or G358-AUTH. None of them needs the backend.

**L57: write all L57 fields** in `c-round-358.json`, and run `python3 -I tools/l57-check.py c-round-358.json c-round-358/l57-check.txt` until it exits 0.
- `assertsSpecified`: none (no perf row changes mode). The new jsdom rows are RM1 and RM2, plus round 357's PS1–PS3, RB-PB1, RB-PB2 and FW-PB1.
- `mutantsRecorded`: M-B1–M-B6 plus C's own.
- `mutantRedOnSketch`:
  - `b-round-357/mutants/mutant-m-b5.log` and `mutant-m-b6.log`;
  - `b-round-357/mutants/sketch-m-b{1,2,3,4}.log`, the round-357 mutants re-run on this sketch (builder: `b-round-357/mutants/make-mutants-on-sketch.py`);
  - `b-round-357/rm-on-atree.log`;
  - `b-round-356/mutants/mutant-m-b{1,2,3,4}.log`.
- `gateChecksRunOnSketch`:
  - `b-round-357/typecheck.log` and `b-round-357/biome.log`;
  - `b-round-356/precheck-full-final.log`, the round-357 sketch's full vitest. This delta was not run on the full suite; the covering set was.
- `affectedChecksNamed`: the covering set (`b-round-357/cover-paths.txt`), the interactions perf spec, the Follow tests and the remount probe.

## 4. Neighbouring behaviour that could break
- 357 §3 applies in full: Follow, the status at Stop, the video dock, the narrow screen, marker navigation and the perf harness.
- **New in this round:**
  - **Remount status (L51).** The mount string write can overwrite whatever is on the status line when the workspace mounts. It writes only when the shown status is an insert-marker kind or "Follow paused", exactly as HEAD did.
    - On a first mount the status is the loading/ready text, so nothing is written there. TU8–TU11 in `tempo-seed-ui` cover the seed and ready texts, and they are in the covering set.
    - On a remount, the tempo-seed append to an insert-marker status is replaced, as on HEAD (RM1).
  - **A transition while mounting** cannot happen (357 sketch-review finding 4: the workspace never mounts while playing). If it ever did, the leaf would see `syncedRef` equal to the mount value and skip, and the parent mount call would run HEAD's playing branch.

## 5. Routed, not in scope
- **D-29z1157:** A's code-reviewer notes from round 357 go to `open_findings` and `deferred_low_polish`:
  - A-R357-REVIEW-SPLIT-RENDER-LATENT (Low);
  - A-R357-REVIEW-FWPB1-TIMING (Low);
  - A-R357-REVIEW-READ-POLICY (Low);
  - A-R357-TEMPO-SEED-REMOUNT-DUP (Low candidate; C's PRE-REMOUNT row informs its severity).

  The Architecture note becomes the signal A-R357-ARCH-PLAYBACK-SPLIT-HOOKS. It is not scheduled, and it joins the pending architecture-checkpoint request (`b-round-356/root-request-arch-checkpoint.md`, repeated, non-blocking).
- **D-29z1158, next (unchanged from D-29z1154):**
  1. REGRESSION, if the next planning is on or after 2026-11-08 [K10].
  2. PERF-10a-BUDGETS, from C358's values.
  3. PERF-10b.
  4. PERF-9, PERF-11 … PERF-15, then STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED.

  RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.
- **Lesson candidate (parked for RETRO 368, because `lessons.md` is at 60 lines):** "When a task moves an effect into a child component, it lists the parent's sibling effects that write the same state and their mount order, and it carries a remount row." The evidence is C-R357-01.

## 6. Deliverables
- **A:** `a-round-358.md`, with every §3.1 row, its evidence under `a-round-358/` and the code-reviewer result.
- **C:** `c-round-358.md` and `c-round-358.json` with all L57 fields, and evidence under `c-round-358/`.

## 7. Claims
Run `bash b-round-357/claims-358.sh` from the loop root. It runs `b-round-356/claims-357.sh` (K1–K15, unchanged meaning; 357 §7) and adds K16–K20.

| Output | File |
|---|---|
| Planning, on A's round-357 tree | `b-round-357/claims-358-planning-output.txt` |
| Sketch, with `CLAIMS_STORE` set to the scratch | `b-round-357/claims-358-sketch-output.txt` |

| Tag | What it pins | Planning (A's tree) | Sketch |
|---|---|---|---|
| K1 | gate 356 published `d49536b` | `published d49536b` | same |
| K2 | HEAD, status count, root-lane delta | `d49536b 56 … 0` | scratch git (n/a); A's final: `d49536b 57 … 0` |
| K4 | consumer `isPlaying` counts | StudioWorkspace 8 | StudioWorkspace 11 |
| K6 | protected files | 11 | 11 |
| K10 | `regression-last.json` date | 2026-11-05 | — |
| K14 | sweep list, helper users, raw `useArrangement()` test files, round-356 patch sha256 | `46 46 71 2` | `46 46 72 2` |
| K16 | gate 357 status | `skipped` | — |
| K17 | leaf transition guard, `atMount` param, `atMount` string branch, mount effect | `0 0 0 0` | `1 1 1 1` |
| K18 | tempo-seed effect line < mount-sync line | `2023 none n/a` | `2028 2353 seed-first` |
| K19 | RM rows; StrictMode in `entry.client.tsx` | `0 0` | `2 0` |
| K20 | every cited `b-round-357/` and `c-round-357/` artifact exists (L56); delta patch sha256 | `15 listed, 0 missing`, `2` | same |

The other K values (K3, K5, K7–K9, K11–K13, K15) are equal in the planning and sketch outputs.

C also runs the L29 grep over this task.
