# Round 328: PERF-DRAG-PREVIEW stage b fix-up. A status write mid-drag shows no stale text and remounts no span (C-R327-01, C-R327-02)

**Planned by:** B, at the round 327 → 328 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v287):
- **D-29z937: round 327 closed as FAIL.**
  - C round 327: FAIL, with `browserVerified`/`realVerified` true. 13 rows passed: PERF (fade 21.633 per move, max 22, 0 restarts), every B-FADE-* row at both viewports, the WAV sha and G327-AUTH. The one failure is **C-R327-01** (Medium).
  - Gate 327 was skipped [K1]. Nothing was published, and HEAD stays `234ccdd`.
  - **A's 11-entry uncommitted tree is the base of this round.** Do not revert it, re-apply it or reset it [K2].
- **D-29z938: one ruling covers A's STOP (A-R327-REVIEW-SAME-TEXT-REMOUNT), C-R327-01 and C-R327-02.**
  - They share one trigger and one root, which is B's round-327 §1.2.3. `flushStatusPreview` cleared the status-preview store synchronously, which is a `useSyncExternalStore` sync re-render. The `adoptPreview` dispatch was still pending in the default lane at that moment. So for about 6 ms the footer showed the committed pre-drag sentence, and then a new span with the fade text.
  - The origin is **B's spec**, not A's work.
  - A's option (b) alone is rejected, because it fixes only C-R327-02.
- **D-29z939:** B's sketch and its evidence (§0).
- **D-29z940:** reviewer finding 3 (the settle order) is A-R327-REVIEW-SETTLE-ORDER, Low → `deferred_low_polish`. Reviewer finding 4 is closed: `tasks/round-327.md` §1.3 already rules it.
- **D-29z941:** two infos become signals and are not scheduled.
  - INFO-C327-ALT-CLICK-MARKER → SIG-R327-NOBPM-RULER-CLICK. The next REGRESSION round probes it.
  - INFO-C327-RELEASE-2ND-COMMIT → SIG-R327-HARNESS-PER-COMMIT.
- **D-29z942:** A's architecture note becomes A-R327-ARCH-STATUS-ONE-SOURCE, filed in `b-round-327-checkpoint-addendum.md` (D-29z915). It does not block anything.
- **D-29z943:** this task.
- **D-29z944:** the next round is REGRESSION if it is planned on or after 2026-11-05. Otherwise it is stage c.

**Read first:** `lessons.md`: L4, L11, L23, L26, L29, L31, L34, L37, L38, L56, L57, L58.

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§7).

## Baseline
- HEAD is `234ccdd`, plus round 327's tree: 9 modified files and 2 new files [K2].
- `b-round-327/tree-327-sha256.txt` holds the sha256 of all 11 files at planning. After A's work, only the three files granted in §3 may differ.
- Protected files: 11/11 OK [K8].
- No dependency change.

## 0. Why this round, and B's evidence
- **C-R327-01 (Medium, origin B spec).** A user's public previews are still downloading. They add "Pulse", drag its Fade In handle and hold still, and then the collection settles.
  - The settle runs `setStatus((current) => settledCollectionStatus(current, copy, failedCount))`; it is the l.4049 region of `ArrangementContext.tsx` [K7].
  - On A's tree, `aria-live` gets the stale "“Night Pulse · Pulse” added…" span, and about 6 ms later a new "Fade In: 1.250 s" span. HEAD has 0 mutations.
  - B re-ran C's probe on A's tree as a control and reproduced it at both viewports (`b-round-327/probe-settle-atree.json`).
- **C-R327-02 (Low).** After that write, a vertical-only move (same fade value) remounts the span on A's tree; HEAD keeps the node. It is fixed here because the round already owns this code and the fix costs one guard.
- **B's sketch** (`b-round-327/sketch/sketch.patch.txt`; it applies cleanly with `git apply` on A's tree; scratch `/home/runner/b327-scratch`). Only two files change: `ArrangementContext.tsx` and `drag-preview-render.test.tsx`.
  - **Browser, C's own probe** (`b-round-327/probe-settle-remount.mjs`, a copy of `c-round-327/probe-settle-remount.mjs` whose output dir is set by `PROBE_DIR`). The sketch dev server on :5198 equals HEAD on :5197 at 1440×900 and 1280×720:
    - after the settle: `rec` [] and the same node;
    - after the same-value move: `rec` [] and the same node;
    - the next real move and the release give the same texts as HEAD.

    Evidence: `probe-settle-sketch-final.json` and `probe-settle-head.json`. The 1440 run first timed out on the cold compile (environment-invalid) and was re-run: `probe-settle-sketch-1440-rerun.json`.
  - **Browser, a text-changing write mid-drag** (`b-round-327/probe-refusal-mid-drag.mjs`): press Delete mid-drag, which gives the refusal; then move; then release. Sketch, HEAD and A's tree are identical at both viewports. The sequence is one removed and one added span per text change, then "Fade In: 1.875 s." and the Undo title "Undo: Fade In (Ctrl+Z)" (`probe-refusal-{sketch-final,head,atree}.json`).
  - **Full vitest on the sketch: 3559/3559**, and typecheck rc 0 [K16].
  - **HEAD parity:** DP17–DP19 pass on a `234ccdd` copy once their getter asserts are removed (`head-parity-dp17-19.log`).
  - **jsdom mutants** (`run-mutants.sh`, results in `mutants-summary.txt`) [K17]:
    - MU-NO-SAME-TEXT-GUARD → red on DP17.
    - MU-READOPT → red on DP19.
    - MU-NO-LAYOUT-CLEAR → red on DP9a, DP12, DP14, DP15, DP16, DP17, DP18 and DP19.
    - **MU-SYNC-CLEAR, which is C-R327-01 itself, stays green in jsdom.** jsdom does not reproduce the lane split; A's ZZ1 and B's DP18 both show this. **The C-R327-01 row is therefore browser-only.** DP18 is kept as the jsdom guard for the same-text timer path.
- **Not chosen:**
  - Moving the committed status into the store. That is the architecture checkpoint's question (D-29z942).
  - `flushSync`. The stop effect calls `setStatus` from an effect.
  - Changing the footer. The sketch tried `preview && key !== statusKey`, but no row needed it, so `StudioWorkspace.tsx` stays as it is.
- **Reference-first, product-designer, screen budget:** not applicable. This is a perf fix-up, and behaviour is held to HEAD.

## 1. Contract (`app/contexts/ArrangementContext.tsx`, the status-preview block only)
**Apply `b-round-327/sketch/sketch.patch.txt` with `git apply` on the tree** (from `store/`; verified clean at planning with `git apply --check`). §1.1–§1.8 describe that patch. Do not retype it: `run-mutants.sh` and K3–K6/K10 match its exact lines. §1.9 (doc 232) is the only edit by hand. If the patch does not apply, STOP.

1. **Two new refs**, next to `lastNonRefusalStatusRef`:
   - `const committedStatusTextRef = useRef(status);`
   - `const adoptedPreviewSequenceRef = useRef(0);`
2. **`flushStatusPreview` never writes the store** [K3 → first value 0].
   1. If there is no pending preview, or `pending.sequence <= adoptedPreviewSequenceRef.current`, return.
   2. Otherwise set `adoptedPreviewSequenceRef.current = pending.sequence`.
   3. Keep the existing `lastNonRefusalStatusRef` update.
   4. Dispatch `{ adoptPreview: pending }`.

   "Adopt once per preview sequence" is required. Without it, two `setStatus` calls in one batch adopt twice, and the second updater sees the preview text instead of the first write (DP19).
3. **A new `useIsomorphicLayoutEffect` with deps `[statusEntry, statusPreviewStore]`** [K6]. When the store's preview exists and its `sequence <= adoptedPreviewSequenceRef.current`, call `clearPreview()`. A newer preview, written after the flush, is kept.
   - The adopted entry carries `previewKey` = the preview's key, so the committed span and the preview span have the same key and text. React keeps the node, which gives 0 mutations.
   - The existing reducer, `adoptPreview` and `statusKey` do not change.
4. **`previewStatus(text)`:** when the store's preview is `null` and `text === committedStatusTextRef.current`, return without writing [K5]. Otherwise call `showPreview(text)`.
   - This mirrors HEAD's rule `gestureActive && next === previous.text` in `reduceArrangementStatus`.
5. **The existing status layout effect** (deps `[status]`) also sets `committedStatusTextRef.current = status`, before the refusal check. Its other line does not change.
6. **These do not change:**
   - `getStatusPreviewText`, `setStatus`'s wrapper shape, the reducer and the settle code (l.4044–4049 [K7]);
   - `StudioWorkspace.tsx`, including the footer [K13];
   - `status-preview-store.ts`, `ArrangementClip.tsx`, `ArrangementLane.tsx` and `ArrangementMarkerRow.tsx`;
   - the budgets, and every other file.
7. **Biome:** the `useExhaustiveDependencies` count for the context stays **0** [K12]. The sketch was clean with `biome lint`.
8. **Tests:** append **DP17, DP18 and DP19** to `drag-preview-render.test.tsx`, verbatim from `b-round-327/sketch/drag-preview-render.test.tsx.txt` (the sketch patch's test hunk). A may strengthen them, never weaken them. No other test changes.
9. **Doc 232** (whole doc, L34):
   - l.4 becomes exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 328 PASS)` [K11].
   - The seven TEMPLATE headings stay in order (L26).
   - In `### ეტაპი b`, `## არქიტექტურა` and `## ტესტირება`, describe the adopt-once flush, the layout-effect clear and the same-text guard, plus DP17–DP19.
   - In `## პრობლემები და გადაწყვეტები`, add one Problem → Solution entry for C-R327-01/02. It must state that the flush cleared the store before the reducer committed, and that MU-SYNC-CLEAR is green in jsdom, so the bug's row is a browser probe.
   - Cite only rows that exist.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-327/claims-328.sh` from the loop root. The output must equal `b-round-327/claims-328-planning-output.txt`. Any difference is a STOP |
| A-IMPL | `git apply b-round-327/sketch/sketch.patch.txt` (§1.1–§1.8), then §1.9 by hand |
| A-CLAIMS-AFTER | Save as `a-round-328/claims-after.txt`. Every line equals planning except: K3 `0 1`; K4 `1 1`; K5 `1 1`; K6 `1`; K10 `135 21 3` (more only if A strengthens a row); K11 the new l.4. K2 stays `234ccdd 11`. Compare with `b-round-327/claims-328-sketch-output.txt`: K2, K8 and K11 differ there by design (the scratch is not a git repo, its `vite.config.ts` has a `cacheDir`, and the doc was not sketched) |
| A-SCOPE | `sha256sum -c b-round-327/tree-327-sha256.txt` (run from `store/`) fails only for `ArrangementContext.tsx`, `drag-preview-render.test.tsx` and doc 232 |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0. The Biome warning count for `app/lib/arrangement app/contexts app/components/arrangement` stays **15** |
| A-UNIT | Run `npx vitest run` on round 327's 13 files: `drag-preview-render`, `status-preview-store`, `status-announcement-ui`, `status-announcement`, `status-lifetime`, `clip-fades-ui`, `video-fades-ui`, `affordance-colour-ui`, `clip-envelope-ui`, `track-header-stacking`, `insert-marker-ui`, `markers-ui` and `self-disabling-focus`. All must be green. List any test that runs above 50 % of its timeout (L31) |
| A-MUTANT | On a scratch copy, never in `store/`: `b-round-327/run-mutants.sh <scratch>`. MU-NO-SAME-TEXT-GUARD → red on DP17. MU-READOPT → red on DP19. MU-NO-LAYOUT-CLEAR → red on DP17, DP18 and DP19 (and others). MU-SYNC-CLEAR is expected **green**: record it, it is not a STOP. Restored: green |
| A-REVIEW | code-reviewer. Its Architecture note goes to B |

A does not run a browser or perf row; C runs them.

### 2.2 C's rows
C writes `c-round-328.md` and `c-round-328.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding;
- `assertsSpecified` = 3 (DP17–DP19) + 2 browser probes = 5;
- `mutantsRecorded` = 4, the `run-mutants.sh` set;
- `mutantRedOnSketch` = true for 3 of the 4, with evidence `b-round-327/mutants-summary.txt`; MU-SYNC-CLEAR is green in jsdom by design and is covered by SETTLE-REMOUNT;
- `mutantRedOnTree`, from C's own run;
- `gateChecksNamed` = 6;
- `gateChecksRunOnSketch` = 2: the full vitest and the typecheck (`b-round-327/precheck-full.log`, `sketch-typecheck.log`);
- **`chainHeadGateRunGreen`**: this is a fix-up chain on an unpublished tree. Set it to `null`, with the reason "no gate ran on the chain head: gate 327 skipped on C FAIL".

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-327/claims-328.sh`, first (L56) | Equal to A-CLAIMS-AFTER |
| SOURCE-SCOPE | `git status`; `sha256sum -c b-round-327/tree-327-sha256.txt`; protected sha | 11 entries, the same set as round 327. Only the three granted files differ from the planning hashes. Protected files 11/11 |
| UNIT | On C's scratch: `drag-preview-render` and `status-preview-store`, ×3 | Green on every run, and DP17–DP19 are present |
| MUTANT | `b-round-327/run-mutants.sh` on C's scratch, plus one mutant of C's own | As A-MUTANT. C's own mutant is red on the row C names |
| **SETTLE-REMOUNT (browser; closes C-R327-01 and C-R327-02)** | `PROBE_DIR=/home/runner/czaba-project/tmp/studio-real-loop/c-round-328 node b-round-327/probe-settle-remount.mjs <A> a` (create the dir first) and the same against HEAD on a second dev server with its own Vite `cacheDir` (L38). Run 3 times on A's tree, at both viewports | On every run and at both viewports:<ul><li>`afterSettle.rec` is [] and `sameNodeAsHold` is true;</li><li>`afterSameValueMove.rec` is [] and `sameNode` is true;</li><li>the `afterNextMove` texts and `afterRelease.status` equal HEAD.</li></ul>An environment-invalid run (a cold-compile timeout) is replaced, within the budget |
| REFUSAL-MID-DRAG (browser) | `PROBE_DIR=<same absolute dir> node b-round-327/probe-refusal-mid-drag.mjs <base> <tag>`, A vs HEAD; the script covers both viewports | Every recorded field equals HEAD: `atHold`, `afterKey` (one removed + one added span, the refusal text), `afterMove`, and `afterRelease` (text and Undo title) |
| B-FADE-STATUS, B-FADE-CANCEL, B-FADE-END-STOP, B-FADE-PLAYING, B-VIDEO-FADE (browser) | As in `tasks/round-327.md` §2.2. C may reuse `c-round-327/c327-rows.mjs`. A vs HEAD, both viewports | As in round 327: every step's text, the added spans, the cancel, the end-stop, 0 `start` calls during the move, and the video texts equal HEAD |
| B-FADE-EXPORT | As in round 327: Fade In set to 2.000 s by dragging, on A and on HEAD | WAV sha256 equal |
| PERF | Production build. Run the interactions spec **alone**, after a browser warm-up (L38) | <ul><li>The 5 asserted fade rows pass (≤ 24 per move and max, 0 restarts).</li><li>The fade, trim, move and range rows equal C round 327's run (`c-round-327/perf-interactions-atree-results/latest-interactions.json`) within the determinism contract.</li><li>Record the stopped and playing `release-commits`. A rise is a finding, reported with its number</li></ul> |
| G328-AUTH | As G327-AUTH, at both viewports | <ul><li>`/studio-lab`: the anonymous workspace and the demo badge, with `auth_user` null.</li><li>`/studio/middle-east`: "Sign in required" and 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401</li></ul> |
| DOCS | Check doc 232 against §1.9 | l.4 is byte-equal. The 7 headings are in order. The problem entry exists. Every cited DP or SP id exists |

**Gate rows.** C does not claim these: the full vitest, the build, Biome, typecheck, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if all of these ran at both viewports: SETTLE-REMOUNT, REFUSAL-MID-DRAG, B-FADE-STATUS, B-FADE-CANCEL, B-FADE-END-STOP, B-FADE-PLAYING, B-VIDEO-FADE and G328-AUTH; and B-FADE-EXPORT ran at least once.

**Ableton conformance:** not applicable. Behaviour is held to HEAD.

## 3. Grants
A edits only:
- `app/contexts/ArrangementContext.tsx`: §1.1–§1.5 only, inside the status-preview block (round 327's l.748–783 region);
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: append DP17–DP19 only;
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (§1.9).

Nothing else may change:
- no other file of round 327's tree;
- not `StudioWorkspace.tsx`, `status-preview-store.ts`, `status-announcement.ts` or `perf/*`;
- no other test;
- not the package, lock or config files;
- no protected file;
- no loop artifact outside `a-round-328*`.

## 4. Neighbouring behaviour at risk (C probes)
- **Every committed status write during a drag:** refusals, the playback start and stop texts, the insert-marker rewrite, and the gesture-release restore. Covering rows: DP12, DP16, SU5/SU6, `status-lifetime`, REFUSAL-MID-DRAG, B-FADE-END-STOP.
- **The `aria-live` re-announce rule:** a changed text remounts, and the same text does not. Covering rows: DP10, DP11, DP17, SETTLE-REMOUNT.
- **The getter `getStatusPreviewText`.** Between a flush and its commit, it still returns the preview text, as HEAD's provider status would. It returns `null` after the commit. Covering rows: DP15, DP17, DP19.
- **Video fade and video move** stay on the provider path (DP9b, DP13, B-VIDEO-FADE).

## 5. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-328.md` and leaves the tree consistent when:
- A-CLAIMS differs from planning;
- a covering test fails, or a test runs above 50 % of its timeout (L11);
- a mutant other than MU-SYNC-CLEAR is not red on its row;
- Biome flags anything new;
- another file seems to need a change;
- the reviewer's fix would change a clause ruled here (L11).

## 6. Next, and commit readiness
- **After C PASS:** the gate runs verify and publishes rounds 327 and 328 together. PERF-DRAG-PREVIEW stays in progress (stage 2 of 3 done).
- **Next round:** REGRESSION if it is planned on or after 2026-11-05 (regression-last is 2026-11-02 [K9]). It carries C-R318-06, CAND-R323-FOLD-CLEARS-SELECTION and SIG-R327-NOBPM-RULER-CLICK. Otherwise the next round is stage c, which reads the D-29z915 checkpoint answer if one exists and does not wait for it.

## 7. Claims (L29 + L56)
Run `bash b-round-327/claims-328.sh` from the loop root. `CLAIMS_STORE` may override the store path.
- Planning output: `b-round-327/claims-328-planning-output.txt`.
- Sketch output: `b-round-327/claims-328-sketch-output.txt`.

| Tag | Claim | Now | After A |
|---|---|---|---|
| K1 | gate 327 status; gate 326 status, commit | skipped; published 234ccdd | same |
| K2 | HEAD, status entries | 234ccdd 11 | same |
| K3 | `clearPreview()` inside `flushStatusPreview`; `statusPreviewStore.getState().clearPreview();` in the file | 1 1 | 0 1 |
| K4 | `adoptedPreviewSequenceRef` decl; `committedStatusTextRef` decl | 0 0 | 1 1 |
| K5 | the same-text guard line; the adopt-once guard line | 0 0 | 1 1 |
| K6 | `}, [statusEntry, statusPreviewStore]);` | 0 | 1 |
| K7 | the settle `lastNonRefusalStatusRef` line; the settle updater line | 1 1 | same |
| K8 | protected files OK | 11 | 11 |
| K9 | regression-last date | 2026-11-02 | same |
| K10 | `expect(` lines; `it('DP` rows; DP17–19 rows | 120 18 0 | ≥ 135, ≥ 21, 3 |
| K11 | doc 232 l.4 | `… (stage 2 of 3; C round 327 PASS)` | `**სტატუსი:** In Progress (stage 2 of 3; C round 328 PASS)` |
| K12 | Biome `useExhaustiveDependencies` in the context | 0 | 0 |
| K13 | the footer `<ArrangementStatusText …/>`; `return preview ? (` | 1 1 | same |
| K14 | cited artifacts exist | checked | checked |
| K15 | `tasks/round-327.md` equals the before-copy | archive-equal | same |
| K16 | B's full vitest on the sketch; typecheck rc 0 lines | `Tests 3559 passed (3559)` 1 | same |
| K17 | DP17–19 FAIL lines in the mutant summary; MU-SYNC-CLEAR green | 5 1 | same |
