# Round 333: PERF-DRAG-PREVIEW stage c2b-ii. The Clip details Start/End text follows the clip in render, not in a layout effect

**Planned by:** B, at the round 332 → 333 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v292; D-29z984…D-29z994):
- **D-29z984: round 332 closed as PASS, from C's evidence.** `c-round-332.json`: `taskStatus` PASS, `browserVerified`/`realVerified` true, 11 rows, 0 bugs. Gate 332 published `de28cca` on both remotes, review 9/10 [K1].
  - **Stage c2b-i → done.** C measured fade at 10.817 per move (max 11), equal to B's sketch.
  - **Closed:** GATE331-S1 (as ruled in D-29z975), GATE331-S2 and GATE331-S3 (fixed in round 332).
- **D-29z985:** A's l.5 hand edit of doc 232 went beyond §1.3 of the round-332 task. It is accepted: it fixes a reviewer Low, and C's DOCS row passed.
- **D-29z986: A-R332-REVIEW-OVERVIEW-PROP-TYPE becomes the info signal SIG-R332-OVERVIEW-PICK.** A's reviewer rated it a latent Medium.
  - It has no reproducible failure. C found 0 overview diffs at 23 samples per viewport, and the gate-332 reviewer traced the same independently.
  - It is folded into checkpoint D-29z915, with an L46 deadline of RETRO 336. It does not hold the Medium gate.
  - A's Low about a loop-toggle row → a named row in the REGRESSION `scope_additions`. A's other Lows → `deferred_low_polish` as A-R332-REVIEW-LOWS.
- **D-29z987: gate-332 suggestion 1** (`heldRef` is written during render) → info GATE332-S1-HELDREF-RENDER, accepted as is. The architecture note is added as evidence to ARCH-R331-PREVIEW-READERS. No new addendum is written, because D-29z915 is already requested and still unanswered.
- **D-29z988: REGRESSION timing is corrected.** D-29z982 assumed round 333 would be planned on or after 2026-11-05. It is planned on 2026-11-04, only 2 days after `regression-last` (2026-11-02) [K9], and the speed rule needs 3. REGRESSION is therefore the first round B plans on or after 2026-11-05, and its `scope_additions` gain one c2b-ii row and the loop-toggle row.
- **D-29z989: the stage c2b-ii contract,** §0–§1 below.
- **D-29z990: PERF-CAND-PEAK-PRIMITIVE-PROPS becomes its own stage c2b-iii.** Both consults advised this. It uses a different mechanism, touches `ArrangementClip.tsx` plus 2 call sites, and needs its own perf run.
  - The ArrangementDetailClipGain memo → signal PERF-CAND-DETAIL-CLIPGAIN-MEMO.
- **D-29z991: SIG-R333-HOOK-LIVE-MARGIN.** On the sketch, `interact.harness.hook-live` falls from 2 to 1. Its budget is assert ≥ 1 [K13], so it still passes, but it now sits at its bound. This round does not change `perf/**`.
- **D-29z992:** the render counts in DP33, DP34 and DP38 depend on how `selection.clip` reaches the panel. The answer to D-29z915 must re-check them. Doc 232 records this (§1.3).
- **D-29z993:** the predicate is named `isSameDetailRangeTextSource`, as tech-lead advised. The helpers stay at module level in `ArrangementDetailPanel.tsx`.
- **D-29z994: this task.**

**Read first:**
- From `lessons.md`: L23, L29, L31, L38, L52, L56, L57, L58.
- A also reads the primitives `AGENT_DISCOVERABLE_CODE.md` (new names), `FORWARDREF_COMPONENT.md` (an existing component) and `AUDIO_ARCHITECTURE.md` (Studio).

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§7).

## Baseline
HEAD is `de28cca` (gate 332, published), with a clean tree: 0 entries in `git status` [K2]. Protected files: 11/11 OK [K8]. No dependency changes.

## 0. Why this round, and B's evidence
- **What renders today.** Every trim and move pointermove makes two commits in the browser (C round 332, `c-round-332/names-a.json`, 1440×900):
  - trim [22, 2, 22, 2, …];
  - move [21, 2, 21, 2, 103, 2, 21, 2];
  - a clip click [100, 2, 0].

  Each `2` is `ArrangementDetailContentInner` plus one host, and nothing else.
- **The cause.** `ArrangementDetailContentInner` copies `onClipStart`, `onClipEnd`, `clipStart` and `clipDuration` into the editable `startText`/`endText` inside a `useIsomorphicLayoutEffect` [K3]. Each change therefore commits once more after the main commit.
- **The cut.** The same component already does this in render for Clip Gain (`syncedClipGainText`) [K4]. The sketch moves Start/End onto that pattern, in one file:
  - `interface DetailRangeTextSource { onClipStart; onClipEnd; clipStart; clipDuration }`;
  - `isSameDetailRangeTextSource(synced, next)`: `Object.is` on the 4 raw values, so `NaN` cannot loop;
  - `detailRangeTexts(source)`: `null` while the clip start or duration is undefined, else `rangeInputText(onClipStart ?? clipStart)` and `rangeInputText(onClipEnd ?? clipStart + clipDuration)` [K5];
  - in the component: `startText`, `endText` and `syncedRangeTextSource` are seeded with the current source. When the source differs from the synced one, render stores it and, if the texts are not `null`, sets both texts.
  - The layout effect is removed. `isContentMountedRef` and the other layout effects stay, so the file goes from 5 to 4 `useIsomorphicLayoutEffect` matches [K3].
- **Why the behaviour cannot change.**
  - The content is keyed by the clip id [K4]. Selecting or deselecting remounts it, as at HEAD.
  - Typed text is replaced exactly when one of the 4 raw values changes, as with the effect's dependency list.
  - DP35–DP37 and DP39–DP42 are green on HEAD's source, so they pin HEAD's behaviour.
- **Consults (read-only, this planning):**
  - `performance-optimizer`: the render-phase update is safe (no loop, no extra commit, safe under StrictMode and concurrent rendering), and nothing read the input after the commit. It advised seeding the state (D-29z989) and moving PeakPath to its own stage (D-29z990). It also found the ClipGain memo candidate (D-29z990).
  - `tech-lead`: seed instead of `null`; keep the helpers at module level; add the trimEnd, on-clip/off-clip range, Enter-apply, Undo and focused-input rows (DP38–DP42); make PeakPath stage c2b-iii; c2b-ii does not wait for D-29z915; note the render-count dependency (D-29z992).
- **Not applicable:** `product-designer`, `ableton-arrangement-expert`, reference-first, the screen budget and the YouTube request. This is a perf round, and nothing visible or audible changes.
- **B's sketch** (`b-round-332/sketch/sketch.patch.txt`; scratch `/home/runner/b332-scratch/sc`, made with `git archive de28cca`). It has 2 files, 231 insertions and 10 deletions, and `git apply --check` is clean on `store/`:
  - `ArrangementDetailPanel.tsx`: the helpers and the sentinel.
  - `drag-preview-render.test.tsx`: a `detailRangeInputs` helper and a new describe block with DP33–DP42.
  - The v1 sketch (seeded with `null`) is kept as `sketch/sketch-v1.patch.txt`, with `mutants-summary-v1.txt` and `perf-sketch-results-v1/`. Its perf output is identical to v2's.
- **jsdom on the sketch:**
  - the covering set (`b-round-332/covering-files.txt`, 37 files) is green, 613/613 [K15];
  - typecheck rc 0 (`sketch-typecheck.log`); Biome is clean on both files (`biome-sketch.log`);
  - the slowest row in the file takes 389 ms against the 5 s default, and the new rows take 65–124 ms (`new-rows-durations.txt`, L31).
- **Mutants** (`b-round-332/run-mutants.py`, `mutants-summary.txt`). All 6 are red, and the file is byte-restored [K16]:

| Mutant | Change | Red on |
|---|---|---|
| MU-DTXT-EFFECT-BACK | HEAD's `ArrangementDetailPanel.tsx` (the layout effect) | DP33, DP34, DP38 |
| MU-DTXT-IGNORES-START | `clipStart` drops out of the comparison | DP33, DP36, DP41, DP42 |
| MU-DTXT-IGNORES-DURATION | `clipDuration` drops out of the comparison | DP38 |
| MU-DTXT-IGNORES-ONCLIP | `onClipStart`/`onClipEnd` drop out of the comparison | DP39 |
| MU-DTXT-MOUNT-ONLY | the texts sync only on mount | DP33, DP34, DP36, DP38, DP39, DP41, DP42 |
| MU-DTXT-KEYS-ON-GAIN | the source key includes the clip gain | DP35 |

- **Production perf on the sketch.** The spec ran alone, after the jsdom runs (L38). `b-round-332/perf-rowcmp-vs-c332.txt` compares it with `c-round-332/perf-interactions-atree-results`: rc 0, `failures` [], `complete` true, 167 rows. 103 rows are EQUAL and 18 are DIFF [K17], every DIFF lower:

| Rows | C round 332 | Sketch |
|---|---|---|
| `interact.drag.trim.{stopped,playing}.move-components-per-move` (+ `.6x`) | 23.6 | **21.633** |
| `interact.drag.move.{stopped,playing}.move-components-per-move` (+ `.6x`) | 28.2 | **26.233** |
| `interact.drag.range.{stopped,playing}.move-components-per-move` (asserted) (+ `.6x`) | 9.233 | **7.267** |
| `interact.click.commits` (+ `.6x`) | 3 | **2** |
| `interact.click.components` (+ `.6x`) | 102 | **100** |
| `interact.select.same-lane.30.components` | 24 | **22** |
| `interact.harness.hook-live` (assert ≥ 1) | 2 | **1** |

- **Browser names probe on the sketch.** A dev server with its own `cacheDir` ran on :5198. The warm-up attempt crashed on a cold compile; it is environment-invalid and kept as `names-warmup.log`. Output: `b-round-332/names-sketch.json`; `names-compare.txt` compares it with C round 332:
  - `harness-clip-click` [100, 0], was [100, 2, 0];
  - `fade-moves` [11, 11, 11, 11], unchanged;
  - `trim-moves` [22, 22, 22, 22], was [22, 2 ×4];
  - `move-moves` [21, 21, 103, 21], was [21, 2, 21, 2, 103, 2, 21, 2].

  Every remaining commit has the same name multiset as the matching C-332 commit. Only the `[ArrangementDetailContentInner, host]` commits are gone.

## 1. Contract
**Apply `b-round-332/sketch/sketch.patch.txt` with `git apply` from `store/`.** §1.1–§1.2 describe that patch. Do not retype it, because the mutants and the claims match its exact lines. §1.3 (doc 232) is the only edit by hand. If the patch does not apply, STOP.

1. **Code.** `ArrangementDetailPanel.tsx`:
   - adds the interface and the two helpers directly above `function ArrangementDetailContentInner({`;
   - replaces the `startText`/`endText` state and the copy effect with the seeded sentinel.

   Nothing else in the file changes. `StudioWorkspace.tsx`, `ArrangementClip.tsx` and `ArrangementContext.tsx` stay untouched [K18].
2. **Tests.** The patch appends `detailRangeInputs` and the `describe('PERF-DRAG-PREVIEW stage c2b-ii — …')` block to `drag-preview-render.test.tsx`. No existing `it(` or `expect(` changes [K7].
   - **DP33:** a same-lane move. After one move, `ArrangementDetailContentInner` renders exactly once per pointermove. Start/End read `4`/`10`, and Start stays `4` after the release.
   - **DP34:** a trim-start move. It renders once; Start/End read `4`/`8`.
   - **DP35:** typed `3.5`/`5.25` survive a committed `gainDb` change. The content renders (positive control) and the text is kept.
   - **DP36:** typed text is replaced by `3`/`9` when the clip start is committed at 3.
   - **DP37 (HEAD pin, remount):** a deselect leaves the inputs disabled and `''`; reselecting shows `2`/`8`.
   - **DP38:** a trim-end move. It renders once; Start stays `2`, End reads `7`, and End is `7` after the release.
   - **DP39:**
     - a time selection on the clip (3–5.5) fills Start/End;
     - one that moves (3–6) updates them;
     - one on another lane falls back to the clip bounds `2`/`8`.
   - **DP40 (HEAD pin):**
     - Enter applies a typed `3.25`/`6.5`;
     - a second Enter keeps the text;
     - an invalid typed Start `1` stays typed after Enter.
   - **DP41:** after a move and its release, Undo shows `2`/`8`.
   - **DP42:** in a focused Start input, the typed `3.5` is replaced by the dragged start `4`, during the drag and after it, as at HEAD.
3. **Doc 232** (`docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`):
   - **l.1:** inside the parentheses, after `ეტაპი c2b-i — overview და meter`, add `, ეტაპი c2b-ii — Clip details-ის Start/End ტექსტი`.
   - **l.4** becomes exactly `**სტატუსი:** In Progress (stage c2b-ii of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3–c5; round 333, C verifies)` [K11].
   - **l.5:** add `ArrangementDetailPanel.tsx` to the component list [K12].
   - **New section** `### ეტაპი c2b-ii: Clip details-ის Start/End ტექსტი render-ში (round 333, D-29z989)`, after the c2b-i section and before `### განხილული ალტერნატივები`. Items 35–38:
     - the problem: the 2-component commit, with C round 332's names;
     - the sentinel, its three names and `Object.is`;
     - the seeded initial state, and the content key's remount on selection;
     - the HEAD pins, and D-29z992 (the render counts depend on the selection path; the D-29z915 answer must re-check DP33, DP34 and DP38).
   - **`### განხილული ალტერნატივები`** gains four entries:
     - keep the layout effect (rejected: the extra commit);
     - seed the sentinel with `null` (v1; rejected, D-29z989: one more render pass on every mount);
     - PeakPath primitive props in this round (moved to c2b-iii, D-29z990);
     - key the sentinel on the formatted strings (rejected, D-29z976: raw numbers).
   - **`## შეცვლილი ფაილები`:**
     - add `app/components/arrangement/ArrangementDetailPanel.tsx (ეტაპი c2b-ii: DetailRangeTextSource, isSameDetailRangeTextSource, detailRangeTexts)`;
     - the test-file entry gains `; round 333-ში DP33–DP42`.
   - **`## პრობლემები და გადაწყვეტები`** gains one Problem → Solution entry: the second commit on every trim, move or range move; solved by the sentinel, guarded by DP33, DP34 and DP38.
   - **`## ტესტირება`** names DP33–DP42, plus the perf and names numbers cited to B's sketch (`b-round-332/perf-rowcmp-vs-c332.txt`, `names-compare.txt`). C measures the real ones. Name only rows that exist (L26).
   - **`## TODO`:**
     - the c2b-ii bullet becomes a c2b-iii bullet: PERF-CAND-PEAK-PRIMITIVE-PROPS (D-29z990);
     - in the stage-c bullet, `c2 დასრულდა c2b-ii-ის გარდა` becomes `c2 დასრულდა c2b-iii-ის გარდა`;
     - add SIG-R333-HOOK-LIVE-MARGIN and PERF-CAND-DETAIL-CLIPGAIN-MEMO as signals.
   - The seven TEMPLATE headings stay in order (`^## ` count 7) [K12].

**Ownership:** A edits exactly these 3 files: the 2 patch files and doc 232. These stay untouched:
- every other component, the context and `perf/**`;
- every protected file.

A may strengthen the new rows, never weaken them.

**Neighbour behaviour that could break** (C covers each one in §2.2):
- Start/End during a drag, a trim, a range and Undo;
- typed text being kept or replaced;
- Enter-apply and the invalid message;
- the deselect and reselect;
- the export sound;
- anonymous `/studio-lab` access and purchase protection.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-332/claims-333.sh` from the loop root. The output must equal `b-round-332/claims-333-planning-output.txt`. Any difference is a STOP |
| A-IMPL | `git apply b-round-332/sketch/sketch.patch.txt`, then §1.3 by hand |
| A-CLAIMS-AFTER | Save as `a-round-333/claims-after.txt`. It must equal `b-round-332/claims-333-sketch-output.txt` except:<ul><li>K2: `de28cca 3`.</li><li>K11: the new l.4.</li><li>K12: `1 1 1 7` (HEAD and the sketch print `0 0 0 7`).</li><li>K7: higher only if A strengthens a row.</li></ul> |
| A-SCOPE | `git status --short` lists exactly 3 modified files and nothing untracked |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0, and K10 stays **16**. `npx biome check` on the 2 patch files is clean |
| A-UNIT | `npx vitest run $(cat <loop>/b-round-332/covering-files.txt)` (37 files): all green, 613 or more. List any test above 50 % of its timeout (L31) |
| A-MUTANT | On a scratch copy, never in `store/`, run `python3 -I b-round-332/run-mutants.py <scratch>`. The scratch must be a git repo whose HEAD is `de28cca`'s tree, because MU-DTXT-EFFECT-BACK reads `git show HEAD:`. All 6 must be red on the rows in §0, with `restored` true |
| A-REVIEW | Required: 3 changed files (the 2 patch files and doc 232). Run the real `code-reviewer` subagent on the 3 files and pass its findings and Architecture note to B |

A does not run browser or perf rows; C runs them.

### 2.2 C's rows
C writes `c-round-333.md` and `c-round-333.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding;
- `assertsSpecified` = 15: 10 jsdom rows (DP33–DP42), 4 browser or perf rows (DRAG-NAMES, PERF, DETAIL-TEXT, D-ROWS) and G333-AUTH;
- `mutantsRecorded` = 6, the `run-mutants.py` set; `mutantRedOnSketch` = true, evidence `b-round-332/mutants-summary.txt`; `mutantRedOnTree` from C's own run;
- `gateChecksNamed` = 6; `gateChecksRunOnSketch` = 1 (typecheck, `b-round-332/sketch-typecheck.log`). The full suite stays a gate row;
- `chainHeadGateRunGreen` = true, evidence `gates/gate-round-332.json` and `gates/round-332/verify.log`.

**Browser rows** compare A's tree (:5173) with HEAD `de28cca` on a second dev server that has its own Vite `cacheDir` (L38), at **1440×900 and 1280×720**, unless the row says otherwise. A cold-compile timeout is environment-invalid: replace it and keep the original.

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-332/claims-333.sh`, first (L56) | Equal to A-CLAIMS-AFTER |
| SOURCE-SCOPE | `git status`; `git diff --stat`; protected sha | <ul><li>3 modified files, nothing untracked.</li><li>`git apply -R --check b-round-332/sketch/sketch.patch.txt` passes. Only test hunks may differ, and only if A strengthened a row with no `expect(` removed.</li><li>`git diff --quiet` passes for `StudioWorkspace.tsx`, `ArrangementClip.tsx` and `ArrangementContext.tsx`.</li><li>Protected files 11/11.</li></ul> |
| UNIT | On C's scratch, run `drag-preview-render`, `detail-panel` and `detail-panel-polish` ×3 | Green on every run; DP33–DP42 present once each |
| MUTANT | `run-mutants.py` on C's scratch (git HEAD = `de28cca`), plus one mutant of C's own | As A-MUTANT. C's own mutant is red on the row C names |
| **DRAG-NAMES (browser)** | `node b-round-328/names-probe.mjs <A base> <out>` on A's tree, warm server, 1440×900 | Per-commit counts and name multisets equal `b-round-332/names-sketch.json`:<ul><li>`harness-clip-click` [100, 0];</li><li>`fade-moves` [11, 11, 11, 11];</li><li>`trim-moves` [22, 22, 22, 22];</li><li>`move-moves` [21, 21, 103, 21].</li></ul>No commit is `ArrangementDetailContentInner` plus a host alone. Compared with `c-round-332/names-a.json`, only those commits are lost |
| **PERF** | Production build of A's tree. Run `perf/studio-lab-interactions.perf.spec.ts` **alone**, after a browser warm-up (L38). Compare with `python3 -I b-round-329/perf-rowcmp.py c-round-332/perf-interactions-atree-results/latest-interactions.json <C's latest-interactions.json>` | <ul><li>rc 0, `failures` [], all asserted rows pass. `interact.harness.hook-live` reads 1: record it (SIG-R333-HOOK-LIVE-MARGIN). 0 is a FAIL.</li><li>Every non-wallclock row outside the 18 in §0 is `EQUAL` to C round 332 (103 on B's sketch). Any other `DIFF` is a finding, reported with its number.</li><li>The 18 rows are **record** this round, except the asserted range rows, which keep their spec budget. A value at or below B's sketch value passes; a value above it is a finding with its number.</li></ul> |
| **DETAIL-TEXT (browser)** | On the demo's first music clip, A and HEAD, both viewports. Read the `arrangement-detail-start`/`-end` input values and `disabled` after every step:<ol><li>Click the clip's name bar. Then drag the name bar 4 moves of 10 px on the same lane, release, and press Ctrl+Z.</li><li>Focus Start and type `1.5`. Then drag the trim-start edge 3 moves of 10 px, release, and press Ctrl+Z.</li><li>Type a Start and End inside the clip. Change Clip Gain in the detail Clip Gain field (type `-3`, Enter).</li><li>Press Enter in Start, then type a Start before the clip start and press Enter (read the status line too).</li><li>Make a time selection on the clip body (drag inside the clip), then one on another lane.</li><li>Deselect with a click on an empty part of a lane, then click the clip's name bar again.</li></ol> | <ul><li>A equals HEAD at every sample, both viewports: input values, `disabled`, and the status text after each Enter.</li><li>In step 1 Start follows every move; in step 2 the typed `1.5` is replaced during the drag; in step 3 the typed values are kept.</li><li>Screenshots of the detail panel after steps 1, 3 and 6, on A and HEAD.</li></ul> |
| **D-ROWS (browser)** | `ROWS_DIR=<absolute c-round-333/rows dir> node b-round-328/rows.mjs <base> <tag>` on A and on HEAD, then `python3 b-round-328/rows-diff.py <dir>/rows-head.json <dir>/rows-a.json` | `DIFFS 0`; no page errors on either tree; the EXPORT WAV sha equals HEAD's at both viewports |
| G333-AUTH | As G330-AUTH (`c-round-330/g330-auth.cjs`), at both viewports, in fresh anonymous contexts | <ul><li>`/studio-lab`: the anonymous workspace and the demo badge, `auth_user` null.</li><li>`/studio/middle-east`: "Sign in required" and 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401.</li></ul> |
| DOCS | Read doc 232 | Matches §1.3:<ul><li>l.1 and l.4 are byte-exact, and l.5 names the panel;</li><li>the c2b-ii section has items 35–38, including D-29z992;</li><li>the four alternatives, the files entry, the problem entry, the testing entry and the TODO changes are present;</li><li>the 7 headings are in TEMPLATE order;</li><li>every DP id the doc cites exists as an `it(` row.</li></ul> |

**Gate rows** (not claimed by C): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**Ableton conformance:** not applicable. This is a perf round, and the behaviour is held to HEAD.

## 3. Not in scope
- **Later stages:**
  - c2b-iii: PERF-CAND-PEAK-PRIMITIVE-PROPS;
  - the ArrangementDetailClipGain memo (signal);
  - c3: cross-lane ghosts;
  - c4: group moves;
  - c5: video clips.
- **For checkpoint D-29z915:** the preview-readers module, the overview `Pick` projection (SIG-R332-OVERVIEW-PICK), `memo(ArrangementLane)` and the timeline width from a store.
- **Other:**
  - `perf/budgets.interactions.json`, including the hook-live margin;
  - the protected files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx` and the rest of `b-round-318/protected-sha256.txt`;
  - commits and pushes (root only).

## 7. Claims
Run `bash b-round-332/claims-333.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). Expected output at HEAD: `b-round-332/claims-333-planning-output.txt`. On B's sketch: `b-round-332/claims-333-sketch-output.txt`.
- **K1:** gate 332 is published, commit `de28cca`.
- **K2:** HEAD's short hash and the `git status` entry count.
- **K3:** the HEAD copy line in the layout effect (1 → 0); the `useIsomorphicLayoutEffect` matches (5 → 4); the sentinel condition (0 → 1); the `detailRangeTexts` definition (0 → 1).
- **K4:** the `syncedClipGainText` sentinel and the content `key` by clip id.
- **K5:** the `rangeInputText` body and `memo(ArrangementDetailContentInner)`.
- **K6:** the `ArrangementPeakPath` memo export and its detail call site, both unchanged.
- **K7:** in `drag-preview-render.test.tsx`: the `expect(` count, the DP `it(` count and the DP33–DP42 count (HEAD `229 34 0`, sketch `265 44 10`).
- **K8:** protected sha, 11 OK.
- **K9:** the `regression-last` date.
- **K10:** the Biome lint diagnostic count (16).
- **K11:** doc 232 l.4.
- **K12:** doc 232: c2b-ii in l.1; the panel in l.5; the c2b-ii section; the `## ` heading count.
- **K13:** the `interact.harness.hook-live` budget (`assert >= 1`).
- **K14:** every cited artifact exists (L56).
- **K15:** B's covering run and file count.
- **K16:** mutants: the `restored` count (6) and the empty-red count (0).
- **K17:** perf EQUAL/DIFF counts vs C round 332 (103/18).
- **K18:** `ArrangementDetailContentInner` is not referenced in `StudioWorkspace.tsx`, and the 3 untouched files are clean.
