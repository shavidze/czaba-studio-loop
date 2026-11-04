# C round 331: PERF-DRAG-PREVIEW stage c2a (selected-clip readers), independent verification

**Verdict: PASS.** All 14 C rows in §2.2 ran on A's tree and met their expected results:
- CLAIMS, SOURCE-SCOPE, UNIT ×3, MUTANT (B's 7 plus C's own) and DOCS.
- In the real browser at 1440×900 and 1280×720, A's tree `:5173` compared with HEAD `1e5f552` on `:5197`: FADE-SHOWN, TRIM-SHOWN, MOVE-HINT, GROUP-SHOWN, D-ROWS and G331-AUTH. DRAG-NAMES ran once at 1440×900, as the task specifies.
- PERF: a production build of A's tree, run alone after a warm-up.

`browserVerified` = `realVerified` = **true**. No row was blocked. No new Medium-or-above bug. One pre-existing Low/info observation and several notes for B are listed below.

## Environment
- env-status: `store 200`, round 331, attempt 1.
- A's tree runs on `:5173`.
- HEAD `1e5f552` ran on `:5197`. It is a `git archive` copy in `/tmp/c331h` with its own Vite `cacheDir` (`/tmp/c331-head-vite-cache`, L38). It was stopped before PERF; afterwards `curl :5197` returned 000.
- Scratch `/tmp/c331s` is an rsync of the store with its own `cacheDir` and git baseline. It was used for the unit, mutant and perf runs. Its `app/` is byte-equal to the store at the start and at the end.
- Start and end of the run:
  - the source sha is the same (`c-round-331/source-sha-{start,end}.txt`);
  - the claims are stable (`claims-end.txt` = `claims.txt`);
  - `git status --short` lists exactly 5 M and nothing untracked;
  - HEAD is `1e5f552`.
- C changed no application source. State file: `c-browse.json`. Evidence folder: `c-round-331/`.
- L38: during PERF only file reads ran (`gates/gate-round-330.json`, doc 232, a `grep` of `ArrangementDetailPanel.tsx`). No vitest, build or browser job overlapped.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | **PASS.** Run first; the run took about 1 s. The output is byte-equal to `a-round-331/claims-after.txt`. It differs from `claims-331-sketch-output.txt` only in the allowed lines: K2 `1e5f552 5`, K11 (the new l.4), K12 `1 1 1 1` and K13 `11`. K10 and K15 equal the sketch | `c-round-331/claims.txt`, `claims-end.txt` |
| SOURCE-SCOPE | **PASS.** 5 M and nothing untracked; `git diff --stat` shows 318+/12−.<ul><li>`git apply -R --check b-round-330/sketch/sketch.patch.txt` → REVERSE-OK, so the four code files are exactly the sketch and no test hunk differs.</li><li>`git diff --quiet -- …/ArrangementDetailPanel.tsx` passes.</li><li>0 removed `expect(` lines in `git diff -- app`.</li><li>Protected files: 11/11 OK.</li></ul> | `c-round-331/scope.txt` |
| UNIT | **PASS** ×3 on the scratch. `drag-preview-render`, `preview-store` and `status-preview-store`: 39/39 on every run. DP25, DP26, DP27, DP28, PS-ROLES and PS-LIST are each present once | `c-round-331/unit-{1,2,3}.log` |
| MUTANT | **PASS.** `run-mutants.py` on `/tmp/c331s`: all 7 mutants are killed on exactly the rows in §0.<ul><li>DETAIL-SHALLOW: DP25.</li><li>READOUT-IDENTITY: DP25.</li><li>READOUT-HINT-SELECTS: DP26.</li><li>EQUAL-IGNORES-START: DP26, PS-LIST, PS-ROLES.</li><li>ROLE-GAIN-IGNORED: DP27, DP28, PS-ROLES.</li><li>DETAIL-SHOWS-FADE: DP27.</li><li>DETAIL-FADE-ATTR: DP27.</li></ul>`restored: true`.<br>**C's own mutant, MU-C331-EQUAL-IGNORES-OFFSET,** removes `a.sourceOffset === b.sourceOffset` from `sameSelectedClipShownFields`. It is red on **PS-ROLES** (1 failed / 35 passed). The scratch `app/` was byte-equal to the store after the restore | `c-round-331/mutants-b.txt`, `mutant-c.txt` |
| **DRAG-NAMES (browser)** | **PASS** (warm server, 1440×900). Every commit's count and name multiset equals `b-round-330/names-sketch.json`.<ul><li>`fade-moves` [14, 14, 14, 14] (HEAD [22 ×4]). Compared with C round 330, each commit lost exactly `ArrangementDetailPanelWithSelectionInner`, `ArrangementDetailPanel`, `ArrangementDetailContentInner`, `ArrangementDetailWaveformInner`, `ArrangementSelectedClipReadoutInner`, `ArrangementTimeText`, one `ArrangementPeakPathInner` and one `tag11`. Nothing was added.</li><li>`move-moves` [22, 2, 22, 2, 107, 2, 22, 2] (HEAD [23, 2, 23, 2, 108, 2, 23, 2]). No move commit contains `ArrangementSelectedClipReadoutInner`.</li><li>`trim-moves` [23, 2 ×4] and `harness-clip-click` [104, 2, 0] equal C round 330 and HEAD in counts and names.</li></ul> | `c-round-331/names-a.json`, `names-head.json`, `names-compare.txt` |
| **PERF** | **PASS.** rc 0, `complete` true, `failures` [], 167 rows; all 36 asserted rows pass.<ul><li>Compared with C round 330 (`perf-rowcmp.py`): **104 EQUAL**, and **exactly the 17 named rows DIFF**.</li><li>Fade ×9: per-move 21.633 → **13.767**, max 22 → **14**. The four asserted fade rows stay inside their ≤ 24 budget.</li><li>Move ×8: per-move 30.367 → **29.4**, max 108 → **107**.</li><li>No value crosses a finding threshold (fade ≤ 14.5 / 14, move ≤ 30 / 107). The values equal B's sketch.</li><li>`move-restarts` while playing is 0 for fade, move, range and trim.</li></ul> | `c-round-331/perf-interactions-atree-results/latest-interactions.json`, `perf-rowcmp-vs-c330.txt`, `perf-interactions-atree.log` |
| **FADE-SHOWN (browser)** | **PASS**, both viewports. One Music clip ("Middle East — public preview") with the detail panel open, then a fade-in drag of 4 × 10 px.<ul><li>During the drag, the readout text, its `title` and the detail-content text equal their pre-drag values on both trees.</li><li>`data-fade-in` follows the drag on both trees: 0.350 → 0.600 → 0.850 → 1.100.</li><li>After the release (Undo label "Fade In") and after Ctrl+Z, A equals HEAD at every sample.</li></ul> | `c-round-331/shown/{a,head}-{1440x900,1280x720}.json`, `shown/compare.txt`, `shown-probe.mjs` |
| **TRIM-SHOWN (browser)** | **PASS**, both viewports. A trim-start drag of 4 moves. The readout start and the detail Start, Length and Source offset change on every move (00:00.350 → 00:01.100), and they equal HEAD at every sample, including the release and Undo. The equality does not hold back a shown change | same |
| **MOVE-HINT (browser)** | **PASS**, both viewports. A name-bar drag of 4 moves on the same lane. On both trees, during the drag the lane-move hint is shown and `arrangement-selected-clip` is absent, while the detail Start follows (00:00.350 → 00:01.100). After the release, the readout shows 00:01.100 and equals HEAD; after Undo it is back to 00:00.000 | same |
| **GROUP-SHOWN (browser)** | **PASS** (state reached recorded, as the task allows). A equals HEAD at all 9 group samples per viewport. The steps:<ol><li>Clip Gain −3 on clip 1.</li><li>Ctrl+D duplicates clip 1, then Shift+click on the copy's name bar. The group view shows "2 clips", and the range reads `−3.0 … 0.0 dB`.</li><li>A fade-in drag on clip 1. **On both trees, pointer-down on the fade handle collapses the selection to that clip** (`groupView` false through `group-fade-*`), so the task's recipe cannot keep the group view through the fade.</li><li>C re-selected the group and typed −6 + Enter. Both members became −6.0, so the range span is absent: it is not mixed any more.</li><li>After a blur and Ctrl+Z, the range is back to `−3.0 … 0.0 dB`.</li></ol>All steps match on both trees | same |
| **D-ROWS (browser)** | **PASS.** `rows-diff.py` prints **DIFFS 0**. There are no page errors on either tree. The EXPORT WAV is 48 kHz / 24-bit / 2 ch, 5,703,120 frames (118.815 s), peak 1, 7,382,335 non-zero samples. Its sha256 `453d1a04…dfac567` is equal on A and HEAD at both viewports, and equal to C round 330 | `c-round-331/rows/rows-{head,a}.json`, `rows-diff.txt` |
| G331-AUTH | **PASS**, both viewports, in fresh anonymous contexts. Attempts 3 and 4 (the second one after PERF) are both clean.<ul><li>`/studio-lab`: workspace and demo badge shown, `auth_user` null, no page errors.</li><li>`/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401. A fake bearer → 500 "Unable to prepare Studio access", with no token. The bare request → 400. These equal round 330 (no backend in the cloud).</li></ul>Attempts 1 and 2 were environment-invalid and are kept (see INFO-C331-ENV) | `c-round-331/g331-auth.json`, `g331-auth-attempt3.{json,log}`, `g331-auth-attempt1.log`, `auth-attempt2/`, `shots/` |
| DOCS | **PASS.** Doc 232:<ul><li>l.4 is byte-exact to §1.3.</li><li>Both gate-330 strings are fixed (K12 `1 1 1 1`).</li><li>`### ეტაპი c2a` sits between c1 and `### განხილული ალტერნატივები`. The alternatives list the rejected `Pick` (D-29z967) and the held overview (D-29z966).</li><li>`preview-store.ts` is in `## შეცვლილი ფაილები`.</li><li>The c2a Problem → Solution entry exists.</li><li>`## ტესტირება` names DP25–DP28, PS-ROLES and PS-LIST, with the perf numbers cited to B's sketch.</li><li>`## TODO` lists c2b, SIG-R331-DETAIL-PICK and PERF-CAND-FADE-BUDGET.</li><li>The 7 TEMPLATE headings are in order.</li><li>Every DP/PS id the doc cites resolves to an `it(` row (0 missing).</li></ul>A's own "Known gap" stands: the older "stage c" TODO wording still mentions c2. It is not a row failure | doc 232 (read-only) |

**Gate rows** (not claimed by C): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**Ableton conformance:** not applicable (perf round). Behaviour is held to HEAD, and the browser rows show it is.

## Findings and notes for B
- **C-R331-01 / INFO-C331-TRIM-FADE-OVERLAP** (Low, pre-existing, origin C; identical on HEAD `1e5f552`, so not this round's code). The fade-in handle (10×10 px, from 20 px below the clip top) sits over the trim-left edge (x 513–521).
  - At 1280×720 with the detail panel open, the lane is 52 px tall. The trim edge box is 513,371 8×50, and its vertical centre (y 396) falls on the fade handle: `elementFromPoint` = "Fade In — drag · double-click = 0".
  - Steps: 1280×720 → Add the first library sound → click its name bar → the detail panel is open → press at the middle of the left edge and drag right → the Undo label is "Fade In", not "Trim — left edge".
  - At 1440×900 (72 px lane) the centre is clear.
  - C searched `backlog.json` and `active-backlog.json` and found no prior id.
  - Evidence: `c-round-331/shown/attempt1/a-1280x720-dbg.json` (`trim-grab`), `shown/attempt1/compare.txt` (the 1280 trim samples carry the Undo label "Fade In" on both trees).
  - For B to classify; under the 2026-10-23 gate a Low goes to `deferred_low_polish`.
- **Shown attempt 1 (probe-invalid, kept).** At 1280 the first full probe grabbed the trim edge at mid-height and hit that handle. The trim rows were replaced with a 75 %-height grab. Only the probe changed. Earlier probe drafts failed on recipe errors (one Add button only; the Ctrl+D copy off-screen) before writing any output.
- **A-R331-REVIEW-STALE-CLIP** (Medium, latent, origin A code-reviewer): carried to B as open, with no C ruling.
  - C's independent check: `ArrangementDetailPanel.tsx` has no spread or write-back of the held clip object. A `grep` for `...selection.clip`, `...clip` and `...selectedClip` finds none. The actions are id-based: `setClipGain(clipId, …)` and `setClipGainMembers(clipIds, …)`.
  - The ArrangementPeakPath memo reads only `sourceOffset`, `duration` and the gain, all of them shown fields.
  - There is no reproducible failure today.
- **NOTE-C331-OFFSET-ONLY-GUARD** (info, origin C): C's own mutant (dropping `sourceOffset` from the equality) is caught only by PS-ROLES. No DP render row isolates a change to `sourceOffset` alone, because a trim also moves `start`. PS-ROLES does guard it. For B: an optional render row if c2b touches the equality.
- **INFO-C331-ENV.** G331-AUTH's first two attempts were environment-invalid and are kept:
  - Attempt 1 hit a 120 s ready-status timeout right after C's warm `curl` of the legacy route.
  - Attempt 2 showed a blank `/studio/middle-east` at 1440 (`signIn` false, 0 errors, 0 audio, no workspace). That is the legacy route's first client compile; the 1280 visit right after it showed "Sign in required".
  - Attempts 3 and 4 (after PERF) are clean at both viewports. This matches C round 330's cold-compile pattern on the same route.
