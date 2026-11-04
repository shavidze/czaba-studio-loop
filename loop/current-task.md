# Round 327: PERF-DRAG-PREVIEW stage b. The audio fade-handle drag leaves React history and the provider status during the gesture

**Planned by:** B, at the round 326 → 327 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v286):
- **D-29z928: rounds 325 and 326 are closed from evidence.** C round 326 PASS (`c-round-326.json`: `browserVerified`/`realVerified` true). Gate 326 published `234ccdd` (rounds 325 + 326) [K1].
  - PERF-DRAG-PREVIEW stage a → done.
  - GATE325-IM24-WALLCLOCK → done.
  - B-R299-IM24-LOAD-SIGNAL → closed.
- **D-29z929: C-R326-01** (Low, origin **B spec**) → `deferred_low_polish`.
  - Round 253's task had already ruled the playing "after the playhead" tail jsdom-only (`tasks/round-253.md` l.208), and B's round-326 B-IM24 row asked for it anyway.
  - The IM24 tail goes to SYS-CLOCK-DETERMINISM (jsdom fake fidelity: the end-stop tick never runs there). C suggested SYS-R2-FAKE-FIDELITY, but that task covers the R2 worker fake.
  - L29 gains this as evidence.
- **D-29z930: the two round-326 infos.**
  - INFO-C326-PLAYING-STEP-MOVES-INSERT-MARKER matches the recorded contract: Ctrl+→ moves the marker during playback (`tasks/round-252.md` l.254/l.322, `tasks/round-253.md` l.224). That contract was set by the planner, not by Saba, and Live 12's behaviour while playing is unverified. B therefore adds LIVE-MEAS-MARKER-STEP-PLAYING to `user-review/live-checks.md` (L44). A different Live result goes to Saba as one question.
  - INFO-C326-END-STOP-STALE-STATUS becomes the signal SIG-R326-END-STOP-STATUS (status lifetime, not scheduled).
- **D-29z931: round 327 = PERF-DRAG-PREVIEW stage b**, with the contract in §1. Consults: `tech-lead` and `performance-optimizer` (`b-round-326.md` §3).
- **D-29z932: budgets.**
  - Five 1× fade rows become `assert`, with owner `PERF-DRAG-PREVIEW-b`. Their `.6x` copies stay `record`, as in stage a.
  - The stage-a trim/move per-move rows stay `record`. Converting them (D-29z922) moves to stage c, together with the move rows. B has no perf mutant run for trim, and L58 does not allow an assert without one.
- **D-29z933: DP9 is rewritten, not deleted.**
  - Its fade half becomes DP9a, with the provider expectation inverted and stronger asserts.
  - Its video half becomes DP9b, unchanged.
  - DP10–DP15 are added. No assertion is lost: `expect(` goes from 68 to 112 on the sketch [K10].
- **D-29z934:** doc 232 is the feature doc for all three stages. Stage b rewrites its sections, and l.4 becomes `**სტატუსი:** In Progress (stage 2 of 3; C round 327 PASS)`.
- **D-29z935: the item target stays at ≤ 15 components per move.** The sketch reaches 21.633 for fade. The gap carries to stage c, with three unscheduled signals:
  - SIG-R326-READOUT-PRIMITIVE;
  - SIG-R326-DETAIL-IGNORES-FADE;
  - SIG-R326-SKIP-UNCHANGED-FADE.
- **D-29z936: the next round** is REGRESSION if its planning falls on or after 2026-11-05 (`regression-last` is 2026-11-02 [K9]). Otherwise it is PERF-DRAG-PREVIEW stage c.

**Read first:** `lessons.md`: L4, L11, L23, L26, L28, L29, L31, L34, L37, L49, L51, L52, L56, L57, L58.

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§8).

## Baseline
- **HEAD `234ccdd`**, tree clean (0 status entries) [K2].
- Protected files: 11/11 OK [K8].
- No dependency change: `zustand` is already a dependency, used by `preview-store.ts`.

## 0. Why this round
- **Measured at HEAD.** C round 325's production run was on the tree that is now HEAD. The fade-in drag renders **103.25 components per move** (max 105), with 0 graph restarts during the move and 1 at release [K19].
- **Two writes per move cause it.** The fade branch of `handlePointerMove` does both of these on every move:
  - it calls `previewArrangement(next)`, which runs setHistory [K3, first value 2: the fade line and the group line];
  - it calls `setStatus(studioClipStrings.fadePreview(…))` [K3, second value].

  `status` is a provider `useReducer`, and the footer renders `<span key={statusSequence}>{status}</span>` from the context value [K4]. Rerouting only the geometry would leave about 100 components.
- **B's sketch** (`b-round-326/sketch/sketch.patch.txt`, 9 files; scratch `/home/runner/b326-scratch`; apply scripts `apply-sketch.py`, `apply-sketch-getter.py`, `apply-budgets.py`):
  - **Perf, measured with C's command** (the perf spec on a production build) [K20]:
    - fade **21.633 per move**, stopped and playing, and the same in the 6× replicate;
    - max 22;
    - 0 move restarts;
    - stopped `release-commits` 2, playing 1. B's probe shows that the second stopped commit renders **0 components**, 5–9 ms after the 96-component release commit (`b-round-326/perf-sketch-probe-results/`).
  - **Perf mutant run** [K21]: the fade status back on the provider plus a resync in `previewClipGeometry` give 110.133 per move and 59 restarts.
  - The perf runs used sketch v2. v3 only adds the six comparison reads of §1.6, which render nothing, so A-PERF and C re-measure the final tree.
  - **Full suite on the final sketch:** 3555/3555 [K23].
  - **jsdom mutants:** 7/7 red on their rows, and the restored file is green [K22] (`b-round-326/sketch/mutants-summary.txt`).
  - **HEAD parity:** the behaviour rows DP10, DP11, DP12 and DP14 also pass on a HEAD copy (`b-round-326/sketch/head-parity-dp10-14.log`), so they pin today's behaviour.
- **Why not "status only at release":** it would change what `aria-live` announces mid-drag, and a perf round cannot rule on that. The per-move text stays.
- **Reference-first, product-designer, screen budget:** not applicable. This is a perf round with nothing visible or audible changed, and every state is pinned to HEAD (§2).

## 1. Contract
1. **New module `app/lib/arrangement/status-preview-store.ts`** (`zustand/vanilla`, the same shape as `preview-store.ts`). Use the sketch file `b-round-326/sketch/status-preview-store.ts.txt` as is.
   - State: `preview: { text, sequence } | null`, plus `written: number`, a counter that never resets.
   - `showPreview(text)` does not notify when the text equals the current preview text. Otherwise it writes `{ text, sequence: written + 1 }`.
   - `clearPreview()`.
   - The pure helper `statusPreviewKey(preview)` returns `` `preview-${sequence}` ``.
2. **`ArrangementContext.tsx`:**
   1. **Store.** Add a per-provider `statusPreviewStore` behind its own context. The hook `useArrangementStatusPreview(selector)` throws outside a provider, as `useArrangementPreview` does.
   2. **Status reducer.** Rename the `useReducer` dispatch to `dispatchStatus` [K4, second value → 0]. Its state gains `previewKey: string | null`.
      - A new internal action `{ adoptPreview }` sets `text` to the preview text, increments `sequence` and sets `previewKey = statusPreviewKey(preview)`.
      - Every other action goes through `reduceArrangementStatus` unchanged. A changed result gets `previewKey: null`; an unchanged result returns the same object.
      - `status-announcement.ts` does not change.
   3. **`setStatus` becomes a stable wrapper.** It first runs `flushStatusPreview()`, then `dispatchStatus(update)`. Its context name, its type and its callers do not change.
      - When a preview exists, `flushStatusPreview` clears the store, sets `lastNonRefusalStatusRef.current` to the preview text when that text is not a refusal (`gestureRefusalPrefix`), and then dispatches `{ adoptPreview }`.
      - So any committed write during a drag (updaters, refusals, a playback stop) sees and replaces the shown text, as at HEAD.
   4. **Two new stable context functions:**
      - `previewStatus(text)` calls `statusPreviewStore.showPreview(text)`;
      - `getStatusPreviewText()` returns the current preview text or `null`.
   5. **A new context value `statusKey`** = `previewKey ?? String(statusSequence)`. `statusSequence` stays in the value with today's meaning.
   6. **The gesture release closure** (`beginPointerGesture`, `if (gestureCountRef.current === 0)` [K7]) does not change. Its existing `setStatus((current) => rewriteStoppedTruth(statusAfterGestureRelease(current, lastNonRefusalStatusRef.current)))` now flushes first through the wrapper, so the updater sees the last preview text, as at HEAD.
   7. **Dependency arrays.** Add `setStatus` (and `getStatusPreviewText` where it is used) to every hook dependency array that Biome's `useExhaustiveDependencies` now flags. Nothing else in those arrays changes, and the rule's count for this file stays **0** [K12]. The sketch made exactly this change with `biome lint --write --unsafe --only=correctness/useExhaustiveDependencies`.
3. **`ArrangementClip.tsx`, fade branch only.**
   - `previewArrangement(next)` becomes `previewGeometry(next)`, the existing local, which stays `previewArrangement` for video [K3, first value → 1].
   - The text goes to `previewStatus(text)` when `previewStatus` is given and the clip is not video. Otherwise it goes to `setStatus(text)`, as today.
   - Add the optional prop `previewStatus?: (text: string) => void`.
   - Nothing else changes: `endStaleClipGesture`, `finishGesture`, the double-click reset and the group/cross-lane lines stay as they are.
4. **`ArrangementLane.tsx`** passes `previewStatus` from the context to the clip, next to `previewClipGeometry` [K6 → `1 2`].
5. **`StudioWorkspace.tsx`:**
   - The footer `<span key={statusSequence}>{status}</span>` [K4] becomes `<ArrangementStatusText status={status} statusKey={statusKey} />`. Use the project form `function ArrangementStatusTextInner` + `const ArrangementStatusText = memo(…)` (L23, runtime name).
   - The component renders `<span key={statusPreviewKey(preview)}>{preview.text}</span>` while a preview exists, else `<span key={statusKey}>{status}</span>`.
   - The `<output aria-live="polite" data-testid="arrangement-status">` wrapper, its classes and its position do not change.
   - The workspace destructures `statusKey` instead of `statusSequence`.
6. **Every read that compares the status text reads the shown text:** `getStatusPreviewText() ?? <committed status>`. There are exactly six such reads [K25 → `0 0 0 0`, K24 → `3 2`]:
   - in `StudioWorkspace.tsx`:
     - the stop effect's `insertMarkerStatusKind(current.status)` and `current.status === FOLLOW_PAUSED_MESSAGE` (one `shownStatus` const);
     - the nudge `current.status !== NUDGE_AT_TIME_START_MESSAGE`;
   - in `ArrangementMarkerRow.tsx`: `status !== message` ×2 and `status !== MARKER_AT_TIME_START_MESSAGE`.

   Why: at HEAD, each of these saw "Fade In: x s" during a fade drag; without the change it would see the pre-drag text. The stop effect is reachable, because playback can reach the project end mid-drag (the C-R326 B-IM24 observation). **Ruling:** all six are changed the same way, with no per-site exception.
7. **Budgets (`perf/budgets.interactions.json`).** Edit the file in place; do not reflow it. The sketch diff touches 5 rows. Each row gets `mode: "assert"`, `owner: "PERF-DRAG-PREVIEW-b"` and the note suffix ` Asserted since PERF-DRAG-PREVIEW stage b (round 327).` [K11 → `5 12`]:

   | Row | Budget |
   |---|---|
   | `interact.drag.fade.stopped.move-components-per-move` | `<= 24` |
   | `interact.drag.fade.playing.move-components-per-move` | `<= 24` |
   | `interact.drag.fade.stopped.move-components-max` | `<= 24` |
   | `interact.drag.fade.playing.move-components-max` | `<= 24` |
   | `interact.drag.fade.playing.move-restarts` | `== 0` |

   - **Headroom (L37):** the sketch measured 21.633 per move and 22 max. The headroom is therefore 2.37 and 2 components, both deterministic, and 6× equals 1×.
   - The `.6x` copies and every other row do not change.
8. **Tests:**
   - In `drag-preview-render.test.tsx`, DP9 [K17] is replaced by **DP9a, DP9b, DP10, DP11, DP12, DP13, DP14 and DP15**, and the helper `fadeHandleOf` is added. Take them from `b-round-326/sketch/drag-preview-render.test.tsx.txt`. A may strengthen them, never weaken them.
   - The new file `app/lib/arrangement/__tests__/status-preview-store.test.ts` gets **SP1–SP3** (`b-round-326/sketch/status-preview-store.test.ts.txt`).
9. **Docs:**
   - **Doc 232.** Stage b rewrites the whole doc except the l.4 rule (L34), in Georgian with English terms.
     - l.4 becomes exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 327 PASS)` [K13].
     - The seven TEMPLATE headings stay in order (L26).
     - Add stage b to `## მიდგომა`, `## არქიტექტურა` (the status-preview path), `## შეცვლილი ფაილები`, `## პრობლემები და გადაწყვეტები` and `## ტესტირება`. Update `## TODO` with stage c and the D-29z935 signals.
     - Cite only rows that exist (L26).
   - **Doc 168.** The whole PERF-DRAG-PREVIEW paragraph block is granted: from the paragraph that starts `**PERF-DRAG-PREVIEW-ის ეტაპ a-დან` [K18] to the next `**` paragraph or heading. Add one stage-b paragraph there with A's measured numbers: HEAD 103.25 → A, and stopped `release-commits` 1 → 2 with a 0-component second commit.
10. **Out of scope** (these stay unchanged):
    - video fades and video moves (stage c);
    - the group move, the cross-lane move and the project-end move;
    - marker, envelope and loop-brace drags (SIG-R324-OTHER-PREVIEW-CALLERS);
    - the readout, detail-panel and skip-unchanged ideas (D-29z935);
    - `status-announcement.ts`, `preview-store.ts` and every other status writer.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-326/claims-327.sh` from the loop root. The output must equal `b-round-326/claims-327-planning-output.txt`. Any difference is a STOP |
| A-IMPL | §1.1–§1.9 |
| A-CLAIMS-AFTER | Every line equals planning except: K2 `234ccdd 11` (9 modified + 2 untracked); K3 `1 1`; K4 `0 0`; K5 `present`; K6 `1 2`; K10 ≥ `112 17`; K11 `5 12`; K13 the new l.4; K16 `11 7`; K17 `0 6`; K18 `1 ≥1`; K24 `3 2`; K25 `0 0 0 0`. K12 stays `0`. Save the output as `a-round-327/claims-after.txt`. Compare it with `b-round-326/claims-327-sketch-output.txt`. K2, K13 and K18 differ there by design: the scratch is not a git repo, and the docs were not sketched |
| A-TYPE / A-LINT | `npm run typecheck` rc 0; `npm run lint` rc 0. The Biome warning count for `app/lib/arrangement app/contexts app/components/arrangement` stays **15** (HEAD = sketch) |
| A-UNIT | `npx vitest run` on these files: `drag-preview-render`, `status-preview-store`, `status-announcement-ui`, `status-announcement`, `status-lifetime`, `clip-fades-ui`, `video-fades-ui`, `affordance-colour-ui`, `clip-envelope-ui`, `track-header-stacking`, `insert-marker-ui`, `markers-ui` and `self-disabling-focus`. These are the L23 sweep hits [K16] plus the marker and status readers. All green. List any test above 50 % of its timeout (L31) |
| A-MUTANT | Re-run B's 7 jsdom mutants (`b-round-326/sketch/run-mutants.sh`, `run-mutants-2.sh`), adapted to A's tree, on a scratch copy, never in `store/`. Each is red on the rows in `mutants-summary.txt`, and the restored file is green. Add one mutant of A's own for §1.6 (for example, drop the getter in the marker-row reads), and name the row that goes red or say why jsdom cannot reach it |
| A-PERF | `npm run test:perf -- perf/studio-lab-interactions.perf.spec.ts`, run **alone** (L38): `failures` []. Report the five asserted rows, plus stopped/playing `release-commits` with `releaseComponentsMax` |
| A-REVIEW | code-reviewer (more than 3 files). Its Architecture note goes to B |

### 2.2 C's rows
C writes `c-round-327.md` and `c-round-327.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` per finding;
- `assertsSpecified` = 18: the 5 budget rows, the 10 rows DP9a–DP15 and the 3 rows SP1–SP3;
- `mutantsRecorded` = 8: 7 jsdom mutants and 1 perf run with two combined mutants;
- `mutantRedOnSketch` = true, with evidence `b-round-326/sketch/mutants-summary.txt` and `b-round-326/perf-mutant-results/latest-interactions.json`;
- `mutantRedOnTree` (from C's own run);
- `gateChecksNamed` = 6;
- `gateChecksRunOnSketch` = 2: B ran the full vitest (`precheck-full-v3.log`) and the typecheck;
- `chainHeadGateRunGreen` = `null`, with the reason "not a fix-up chain".

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-326/claims-327.sh`, first (L56) | As A-CLAIMS-AFTER |
| SOURCE-SCOPE | `git status`; protected sha | 11 entries: §3's 9 modified files and 2 new files, nothing else. Protected 11/11 |
| UNIT | On C's scratch: `drag-preview-render` and `status-preview-store` ×3 | All green on every run |
| MUTANT | On C's scratch: MU-FADE-PROVIDER and MU-NO-FLUSH (from `run-mutants.sh`), plus one mutant of C's own | MU-FADE-PROVIDER is red on DP9a. MU-NO-FLUSH is red on DP9a, DP11, DP12, DP14 and DP15. C's own mutant is red on its named row. Restored: green |
| PERF | Production build, the interactions spec **alone**, after a browser warm-up (L38) | <ul><li>The 5 assert rows pass: fade ≤ 24 per move at 1×, and 6× equals 1×.</li><li>trim/move/range rows equal C round 325's run [K19] (the HEAD tree) within the determinism contract. A worse row is a finding, reported with its number.</li><li>Stopped `release-commits` = 2, with every commit after the first at 0 components; playing = 1. Record these; they are not a FAIL. A non-zero second commit is a finding</li></ul> |
| B-FADE-STATUS (browser) | `/studio-lab` at 1440×900 and 1280×720, fresh anonymous context. Add a demo clip and drag its Fade In handle about 120 px in steps. Watch `[data-testid="arrangement-status"]` with a MutationObserver (added nodes per step), on A's tree **and** on HEAD. HEAD runs on a second dev server with its own Vite `cacheDir` (L38) | <ul><li>For the same pointer path, the status text at each step equals HEAD, with one added span per changed text.</li><li>The final text after release and the Undo button title equal HEAD.</li><li>Ctrl+Z restores the fade: `data-fade-in` goes back to its start value.</li><li>Screenshots of each state</li></ul> |
| B-FADE-CANCEL (browser) | Mid-drag, blur the window (Alt+Tab or `window.dispatchEvent(new Event('blur'))`). Both viewports, A vs HEAD | The fade returns to its start value, and no history entry is added. The status text equals HEAD. A's tree adds 0 spans after the blur; record HEAD's count |
| B-FADE-END-STOP (browser) | Use a short clip (≤ 4 s). Start playing about 1 s before the end and begin a fade drag before playback reaches the end; keep moving past the end. A vs HEAD, both viewports | The status text while playing, at the auto-stop and after release equals HEAD (§1.6). The transport shows Stopped on both |
| B-FADE-PLAYING (browser) | Drag a fade while playing | No audible restart: the `AudioBufferSourceNode.start` count during the move is 0 (from a page probe or the harness counter). Playback continues, and the release behaves as at HEAD |
| B-FADE-EXPORT | On A's tree, set Fade In to 2.000 s by dragging. On HEAD, set the same value with the same pointer path. Export WAV from both | sha256 equal |
| B-VIDEO-FADE (browser) | Load a short video into the Video lane and drag its Fade In handle | The status text at each step and the final text equal HEAD. Video stays on the provider path |
| G327-AUTH | As G326-AUTH, both viewports | <ul><li>`/studio-lab`: anonymous workspace and demo badge, `auth_user` null.</li><li>`/studio/middle-east`: "Sign in required" and 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401</li></ul> |
| DOCS | Check doc 232 and doc 168 against §1.9 | l.4 is byte-equal. The 7 headings are in order. Every DP/SP id the doc cites exists (L26). Doc 168's numbers equal A's report |

**Gate rows.** C does not claim these; they go under `"gate"`: the full vitest, the build, Biome, typecheck, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if B-FADE-STATUS, B-FADE-CANCEL, B-FADE-END-STOP, B-FADE-PLAYING, B-VIDEO-FADE and G327-AUTH ran at both viewports, and B-FADE-EXPORT ran at least once (export does not depend on the viewport).

**Ableton conformance:** not applicable. Behaviour is held to HEAD, and nothing changes for the user.

## 3. Grants
A edits only:
- `app/lib/arrangement/status-preview-store.ts` (new);
- `app/lib/arrangement/__tests__/status-preview-store.test.ts` (new);
- `app/contexts/ArrangementContext.tsx` (§1.2);
- `app/components/arrangement/ArrangementClip.tsx` (§1.3: the fade branch, the prop and the destructure only);
- `app/components/arrangement/ArrangementLane.tsx` (§1.4);
- `app/components/arrangement/StudioWorkspace.tsx` (§1.5, §1.6);
- `app/components/arrangement/ArrangementMarkerRow.tsx` (§1.6: the three reads, the destructure and the deps array);
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (§1.8);
- `perf/budgets.interactions.json` (the 5 rows);
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (whole doc, §1.9);
- `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` (the PERF-DRAG-PREVIEW block).

Nothing else may change: not `preview-store.ts`, not `status-announcement.ts`, no other test, no perf spec, not `package.json`, the lock file or config, no protected file, and no loop artifact outside `a-round-327*`.

## 4. Neighbouring behaviour at risk (C probes)
- **Every status write.** Any write during a drag must behave as at HEAD: refusals, the playback start and stop texts, the insert-marker rewrite and the restore at gesture release. Covering rows: DP12, SU5 in `status-announcement-ui`, and `status-lifetime`.
- **The `aria-live` re-announce rule.** HEAD's key-remount behaviour is pinned by `expectOneAnnouncementPerPress`, SU5 and SU6 in `status-announcement-ui`. DP10 and DP11 add the fade cases.
- **Trim and same-lane move** (stage a): their rows do not change, and the PERF row compares them.
- **Video fade and video move** still take the provider path (DP9b, DP13, B-VIDEO-FADE).
- **The double-click fade reset** (`resetClipFade`) and its 0.000 text do not change; `clip-fades-ui` covers them.

## 5. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-327.md` and leaves the tree consistent when:
- A-CLAIMS differs from planning;
- any covering test fails, or a test runs above 50 % of its timeout (L11);
- a mutant is not red on its row;
- A-PERF fails an assert, or a trim/move row gets worse;
- Biome flags anything beyond the dependency arrays of §1.2.7, or another file seems to need a change;
- the reviewer's fix would change a ruled formula or clause (L11).

## 6. Next and commit readiness
- **After C PASS:** the gate runs verify and publishes round 327. PERF-DRAG-PREVIEW stays in progress at stage 2 of 3.
- **Next round:** REGRESSION if its planning is on or after 2026-11-05. It carries C-R318-06 and CAND-R323-FOLD-CLEARS-SELECTION, with its Live 12 reference question. Otherwise the next round is stage c.
- **Stage c:** the group move, the cross-lane move, video, the project-end move and the trim/move asserts (D-29z922/D-29z932).
  - It reads the answer to the open frontend-architect checkpoint **D-29z915** (`b-round-324-checkpoint-request.md`). This round adds to that request, because `ArrangementContext.tsx` grows again with a fourth per-provider store.
  - Stage c does not wait for the answer if none arrives.
- **Later:** PERF-9 … PERF-15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM (which now includes C-R326-01), then the rest of the queue.

## 7. Open items carried (not this round)
- C-R326-01 (deferred Low).
- A-R325-REVIEW-L4C (deferred Low; stage c).
- INFO-C325-MOVE-COMMITS (stage c).
- SIG-R326-END-STOP-STATUS.
- SIG-R326-READOUT-PRIMITIVE, SIG-R326-DETAIL-IGNORES-FADE and SIG-R326-SKIP-UNCHANGED-FADE (stage c candidates).
- LIVE-MEAS-MARKER-STEP-PLAYING (root measures it in Live).

## 8. Claims (L29 + L56)
Run `bash b-round-326/claims-327.sh` from the loop root. `CLAIMS_STORE` may override the store path.
- Planning output: `b-round-326/claims-327-planning-output.txt`.
- Output on B's sketch: `b-round-326/claims-327-sketch-output.txt`. The scratch is not a git repo, so K2 differs there.

| Tag | Claim | Now (HEAD) | After A |
|---|---|---|---|
| K1 | gate 326 status, commit | published 234ccdd | same |
| K2 | HEAD, status entries | 234ccdd 0 | 234ccdd 11 |
| K3 | `      previewArrangement(next);` in ArrangementClip; `studioClipStrings.fadePreview(` | 2 1 | 1 1 |
| K4 | the footer `<span key={statusSequence}>{status}</span>`; `const [statusEntry, setStatus] = useReducer(` | 1 1 | 0 0 |
| K5 | `status-preview-store.ts` | absent | present |
| K6 | `previewClipGeometry={previewClipGeometry}` in the lane; `previewStatus` in the lane | 1 0 | 1 2 |
| K7 | `if (gestureCountRef.current === 0) {` lines; the release updater line | 2 1 | same |
| K8 | protected files OK | 11 | 11 |
| K9 | regression-last date | 2026-11-02 | same |
| K10 | `expect(` lines; `it('DP` rows in drag-preview-render | 68 10 | ≥ 112, ≥ 17 |
| K11 | asserted fade rows; asserted drag rows | 0 7 | 5 12 |
| K12 | Biome `useExhaustiveDependencies` hits in the context | 0 | 0 |
| K13 | doc 232 l.4 | `**სტატუსი:** In Progress (stage 1 of 3; C round 325 PASS)` | `**სტატუსი:** In Progress (stage 2 of 3; C round 327 PASS)` |
| K14 | cited artifacts exist | checked | checked |
| K15 | `tasks/round-326.md` equals the before-copy | archive-equal | same |
| K16 | fade sweep files (`app` tests, `perf`, `e2e`); files with `statusSequence` | 10 8 | 11 7 |
| K17 | the old DP9 title; the rows DP9a/9b/10/11/12/13 | 1 0 | 0 6 (K10 counts DP14/15) |
| K18 | the doc-168 stage-a paragraph; `ეტაპ b` in doc 168 | 1 0 | 1 ≥1 |
| K19 | C round 325 (= HEAD) fade: per move, max, move restarts, stopped release-commits | 103.25 105 0 1 | same (artifact) |
| K20 | B's sketch fade: stopped/playing per move, max ×2, restarts, stopped release-commits | 21.633 21.633 22 22 0 2 | same (artifact) |
| K21 | B's mutant run: fade per move, restarts | 110.133 59 | same |
| K22 | red mutant lines; green sketch/restored lines | 7 2 | same |
| K23 | B's full vitest on the final sketch | `Tests 3555 passed (3555)` | same |
| K24 | `getStatusPreviewText() ?? ` in MarkerRow; in the workspace | 0 0 | 3 2 |
| K25 | the old comparison reads (stop effect, nudge, marker ×2, marker start) | 1 1 2 1 | 0 0 0 0 |
