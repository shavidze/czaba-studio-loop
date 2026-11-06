# CURRENT TASK — Round 361: PERF-10b-i. The active track moves into the selection store; a cross-lane clip click drops from 83 to 42 components

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 360 → 361 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v323 → v324):
- **D-29z1167:** round 360 is closed as PASS (`c-round-360.json`, browserVerified true; gate 360 published `93ea6c1`).
- **D-29z1168:** routing of the round-360 notes (§5). C-R360-NOTE-STALE is fixed in this round, because this round owns the budgets file.
- **D-29z1169:** PERF-10b is split into 10b-i (this round) and 10b-ii (§5).
- **D-29z1170:** the scope, budgets and rulings of this round (§0).
- **D-29z1171:** the order after this round (§5).

**Why this round, now.**
- D-29z1166 put PERF-10b next. REGRESSION is not due: `regression-last.json` says 2026-11-05, so the next one is on or after 2026-11-08 (today is 2026-11-06).
- No Critical, High or Medium finding can be worked in the cloud. The open Mediums are all `open_tech_lead_manual`, `awaiting_user` or `open_root`, and the 2026-10-23 root clarification says they do not block.
- PERF-10b as written in D-29z1153 bundled four unrelated changes. This round takes the one with the measured premise: the active track (83 → 42, §0.3).

**Read first:**
- `lessons.md`. A reads 10, 11, 12, 23 (memo/rename clause), 26, 28, 34 and 58. C also reads 22, 37, 38, 57, 59 and 60.
- `c-round-360.md`, and §0 below.
- Primitives: `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md` (Studio state), `AGENT_DISCOVERABLE_CODE.md` (one new export), `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:**
- Reference-first, product-designer, the YouTube request and the screen budget. This is a performance refactor; nothing changes on screen. The active-lane highlight, the collapsed-group ring and the library "Active track" line keep their exact current behaviour (UC7 and the full suite guard them).
- Ableton conformance: not applicable.

## Baseline
- HEAD is `93ea6c1`, the gate-360 publication [K1]. The tree is clean (0 status entries) [K2].
- Protected files are 11/11 OK [K6]. There is no dependency change [K8]. The perf harness (`perf/lib`, specs) is unchanged [K9].
- **Root lanes (2026-11-05 parallel policy).** Root may apply its own patches before the round on `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx` or `docs/` outside doc 234. A HEAD that descends from `93ea6c1` through only those paths is an allowed delta, not a STOP. This round touches no root-lane file.

## 0. The change and B's evidence (D-29z1170)

### 0.1 Premise (measured, L37)
- `activeTrackId` is provider `useState` and a field of `ArrangementContextValue` [K5]. Every change of it gives the whole context a new value.
- C360 at HEAD: a clip click that also changes the active lane renders **83** components in one commit (`interact.click.components`, perCommit `83,0`, ×3 at 1× and 6×). A same-lane click, which changes only the selection (already a store since PERF-8b), renders **15** (`interact.select.same-lane.30.components`). The difference is the active-track change (`c-round-360/latest-interactions.json`).
- Readers today: three `latestRef` reads in `ArrangementContext.tsx` and two `workspace`/`current` reads in `StudioWorkspace.tsx` [K7]; `ArrangementLane`, `ArrangementLibraryPreview` and the collapsed-group `containsActive` prop read the context field [K7].

### 0.2 The design (consults: `b-round-360/sketch-review.md`)
- **One store, not a 13th (TL-R361-1).** `activeTrackId` and `setActiveTrackId` join `ArrangementSelectionState` in `app/lib/arrangement/selection-store.ts`. The setter keeps the old state when the id is equal (the guard). `createArrangementSelectionStore(initial, initialActiveTrackId)` seeds it; the provider seeds it from the first **audio** track, as the `useState` initialiser does today [K19].
- **The field leaves the context value** and both `useMemo` dependency lists [K5]. The provider's `setActiveTrackId` writes the store. Handlers read `selectionStore.getState().activeTrackId` (library add, paste). `StudioWorkspace`'s edge navigation reads the same store through `useArrangementSelectionStore()`.
- **Subscribers:**
  - `ArrangementLane`: `useArrangementSelection((state) => state.activeTrackId === track.id)`, a boolean, so only the two lanes whose flag flips re-render (TL-R361-3).
  - `ArrangementLibraryPreview`: the new hook `useArrangementActiveTrackId()` in `ArrangementContext.tsx`.
  - Collapsed group header: `containsActive` moves into `ArrangementGroupHeaderWithSelectionInner` (already `XInner` + `memo`), with a boolean selector over `activeCandidateTrackIds`. `StudioWorkspace` passes those ids from a `useMemo` map over collapsed groups (`trackGroupActiveCandidates`) and a module constant `NO_ACTIVE_CANDIDATE_TRACK_IDS` for the rest, never an inline array (TL-R361-2). `StudioWorkspace` no longer reads the active track during render.
- **Test probes:** `useWorkspaceProbe` spreads `activeTrackId: useArrangementActiveTrackId()`, as it does for `isPlaying`. The two probes typed on `ArrangementContextValue` (`grid-snap-position.test.tsx`, `marker-time-snap-ui.test.tsx`) add the same field. No assertion changes in any existing test.
- **No memo or rename** of any component; the runtime names `ArrangementLane`, `ArrangementLibraryPreview` and `ArrangementGroupHeaderWithSelectionInner` keep their counts in `app/**/__tests__` and `perf/**` [K12].
- **Out of this round:** `SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE` (status writes still re-render the provider value) stays a PERF-11 input. Nothing reconciles the active track if its lane disappears; today no track-removal path exists, so this is a recorded hypothesis for STEM-LANES (`TL-R361-ACTIVE-TRACK-DANGLING`, info), and behaviour stays unchanged.

### 0.3 B's sketch (scratch `git archive 93ea6c1`, `/home/runner/b360-scratch/sc`; it does not survive the job)
- **Code:** `b-round-360/sketch.patch.txt` (9 files under `app/`, `apply-sketch.py` + `ss-rows.py`), sha256 in `b-round-360/sketch-dispatched.sha256`.
- **Budgets:** `b-round-360/budgets.patch.txt` (`apply-budgets.py`), sha256 in `b-round-360/budgets-dispatched.sha256`.
- **Checks on the sketch:**
  - typecheck rc 0 (`sketch-typecheck.log`); `biome lint ./app` 205 warnings, equal to HEAD (`sketch-lint.log`); `biome check` on the 9 files clean.
  - Full suite (L23) on the final sketch (code, SS8–SS11 and budgets): 248 files, 3643 tests, rc 0 (`precheck-full-final.log`; the earlier run without the SS rows is `precheck-full.log`, 3639). `selection-store.test.tsx` with SS8–SS11: 11/11 (`ss-sketch.log`). perf-lib 40/40 (`sketch-perf-lib.log`).
  - Production perf, alone, budgets still `record` (`perf-summary.txt`): rc 0, 93/93 asserted, 0 NEW; **only two deterministic rows differ from C360**: `interact.click.components` 83 → **42** and its `.6x` copy 83 → **42** (perCommit `42,0`, ×3 each). `click.commits` stays 2 ×3 at both rates; `select.same-lane` 15 and `reclick` 0 are unchanged. `durationMs` 396594.
  - The same with the asserting budgets file (`perf-sketch-b.log`, `perf-mu-1-b.log`; `perf-summary.txt`, blocks `sketch-b` and `mu-1-b`): sketch rc 0, **95/95**, 0 NEW, click 42 ×3, `durationMs` 425332; MU-1 rc 1, 94/95, red **only** on `interact.click.components` (82 > 42).

| Mutant (`b-round-360/mutants/`) | Change | Red (predicted in `checkpoint.md` first) |
|---|---|---|
| MU-1 | `StudioWorkspace` calls `useArrangementActiveTrackId()` at its top | perf `interact.click.components` 82 ×3 (> 42), the only failure of 95 |
| MU-2 | a provider `useState` mirror of the active track in the context value's deps | SS8 only |
| MU-3 | the store setter has no equality guard | SS9 only |
| MU-4 | the seed is the first track of any kind | SS10 only |
| MU-5 | paste reads a render-time snapshot of the active track | SS11 only |
| MU-6 | the group leaf never reports the active track | UC7 only [K11] (the perf harness has no collapsed group: green there, PO-R361-3) |
| MU-7 | the provider's `setActiveTrackId` also schedules `setStatus` 100 ms later (the red-proof for `click.commits <= 2`) | perf, with the asserting budgets: `click.commits` 3 ×3 (> 2) and `click.components` 113 ×3 (`42,0,71`), as predicted; 20 further drag rows also red (status writes in their windows; recorded, not predicted) (`perf-summary.txt` block `mu-7-b`) |

## 1. Scope (A)

### 1.1 Files (exactly 11)
| # | File | Change |
|---|---|---|
| 1–9 | `app/lib/arrangement/selection-store.ts`, `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementLane.tsx`, `app/components/arrangement/ArrangementLibraryPreview.tsx`, `app/components/arrangement/StudioWorkspace.tsx`, `app/lib/arrangement/__tests__/helpers/workspace-probe.ts`, `app/lib/arrangement/__tests__/grid-snap-position.test.tsx`, `app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx`, `app/lib/arrangement/__tests__/selection-store.test.tsx` | From the store root: `patch -p1 < ../tmp/studio-real-loop/b-round-360/sketch.patch.txt`, unchanged. Afterwards K15 equals the sketch output |
| 10 | `perf/budgets.interactions.json` | `git apply ../tmp/studio-real-loop/b-round-360/budgets.patch.txt`, unchanged. Its sha256 then equals `budgets-dispatched.sha256` |
| 11 | `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | §1.2 |

A changes nothing else. A code-reviewer Medium+ on the sketch, or any change A believes is needed beyond the patches, is a STOP (L11), not an edit.

**Untouched:** every other `app/` file; `perf/*.spec.ts`, `perf/lib`, `perf/budgets.json`, `perf/budgets.resources.json`; e2e, config and the protected files.

**Budgets (rows owned by `PERF-10b-i`):**
| Row | Now [K3] | After | C360 | B sketch |
|---|---|---|---|---|
| `interact.click.components` | record | assert `<= 42` | 83 ×3 | 42 ×3 (1× and 6×) |
| `interact.click.commits` | record | assert `<= 2` | 2 ×3 | 2 ×3 (1× and 6×) |

- `<= 42` has no headroom: the count is deterministic (the round-348 rule) and equal in 6 samples.
- `click.commits` is `<= 2`, an upper bound. The second commit renders 0 components and is unexplained (PO-R361-2); a click that commits nothing already fails `interact.harness.click-live` (the fader must become enabled) [K3].
- The `.6x` copies stay `record` (same ruling as round 360: the loaded replicate, with its own equal-samples check).
- **C-R360-NOTE-STALE** is fixed in the same patch: the two video-fade notes lose "Record until C measures it (…)", and the playing fade note loses "the third commit is intermittent" [K3 `stale-notes`]. Notes only; modes and budgets of those rows do not change.
- Asserted rows go from 93 to 95, of 252 [K3].

### 1.2 Doc 234 (Georgian, technical terms in English; L34: the whole stage-3 section is granted)
PERF-10 now has 4 stages: 10a, 10a-budgets, 10b-i (this round), 10b-ii.
- **l.4 (L28, no `pending`):** exactly `**სტატუსი:** In Progress (stage 3 of 4; C round 361 PASS)`.
- **l.5:** add `app/lib/arrangement/selection-store.ts`, `ArrangementLane.tsx` and `ArrangementLibraryPreview.tsx` to the list. Nothing else on that line changes.
- **A new subsection** under `## მიდგომა`, after stage 2, titled exactly `### ეტაპი 3: PERF-10b-i (round 361, D-29z1170)`. It contains the premise (83 vs 15), the design of §0.2, the budget table and its rules, the mutant table of §0.3, and the two items left out (SIG-R360, TL-R361-ACTIVE-TRACK-DANGLING).
- **`## შეცვლილი ფაილები`:** one dated bullet per changed file of this stage (the 9 app files, the budgets file).
- **`## ტესტირება`:** one stage-3 bullet that cites only real artifacts: SS8–SS11 in `selection-store.test.tsx`, UC7, `b-round-360/perf-summary.txt` and C's round-361 PERF row.
- **`## TODO / შემდეგი ნაბიჯები`:** the bullet that starts "**PERF-10b:** `activeTrackId` და selection store" [K14] is replaced by two bullets: PERF-10b-i struck as done (C round 361 PASS), and **PERF-10b-ii**: Transport-ის play ღილაკი საკუთარ subscriber-ად (≤ 20), `B-R356-PLAYBACK-SETTER`, C-R320-01-ის render-budget row, GATE320-S3-ის record row. Add one bullet for `TL-R361-ACTIVE-TRACK-DANGLING` (a STEM-LANES input).
- **The `## ` count stays 7** [K14], in TEMPLATE order (L26).

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-360/claims-361.sh`, from the loop root | equals `b-round-360/claims-361-planning-output.txt` |
| A-CLAIMS final | same | <ul><li>K3, K4, K5, K7, K11 and K15 equal `b-round-360/claims-361-sketch-output.txt`.</li><li>K2 = `93ea6c1 11`.</li><li>K14 = `doc234-l4 d116f6ef doc234-h2 7 doc234-stage3 1 doc234-10b-bullet 0` (`d116f6ef` is the md5 prefix of the §1.2 line with its newline).</li><li>K1, K6, K8, K9, K10, K12, K13 and K16–K20 equal the planning output.</li></ul> |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-TESTS | `npx vitest run` on `selection-store.test.tsx`, `track-group-collapse-ui.test.tsx`, `track-groups-ui.test.tsx`, `marker-edge-nav-ui.test.tsx`, `marker-time-snap-ui.test.tsx`, `grid-snap-position.test.tsx`, `background-time-selection-ui.test.tsx`, `all-lane-clipboard.test.tsx`, `clip-gain.test.tsx` (all under `app/lib/arrangement/__tests__/`) | all pass; SS8–SS11 and UC7 named in the log |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (GATE304-M1) | 40/40 |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`. Then `python3 -I b-round-329/perf-rowcmp.py c-round-360/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | <ul><li>rc 0; `complete`; `failures` [].</li><li>252 rows; **95/95** asserted pass; 0 NEW.</li><li>`interact.click.components` 42 ×3 and its `.6x` 42 ×3; no other deterministic components or commits row higher than C360.</li><li>`durationMs` ≤ 540000, recorded.</li></ul> |
| A-MUTANT | not required: B ran MU-1…MU-7 (§0.3). A cites them | — |
| A-REVIEW | `code-reviewer` on the 11 files | no unruled Medium+ (a Medium+ is a STOP, §1.1). Any change after the review goes back to the reviewer (L11). The Architecture note goes to B |
| A-DOC | doc 234 | as §1.2 |

### 2.2 C rows
Use a warm dev server (L38): load `/studio-lab` once in a browser before any timed probe. If `:5173` returns "504 Outdated Optimize Dep", restart it first.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-360/claims-361.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `patch -p1 -R --dry-run < ../tmp/studio-real-loop/b-round-360/sketch.patch.txt`; `git apply -R --check` of `b-round-360/budgets.patch.txt`; `git diff --stat` | <ul><li>11 modified files, 0 untracked.</li><li>Both patches reverse-apply; K15 and the budgets sha256 equal the sketch.</li><li>Doc 234 is the only doc changed.</li></ul> |
| PERF (browser, production, alone) | A-PERF's command and comparison | as A-PERF: 95/95, 0 NEW, click components 42, none higher than C360. `durationMs` recorded |
| MUTANT (C's own, scratch, predicted first in `c-round-361/progress.json`) | One mutant that is **not** MU-1…MU-7 and that should move `interact.click.components`. Examples: <ul><li>`ArrangementLibraryPreview` subscribes to the whole selection state;</li><li>`ArrangementLane` selects `state.activeTrackId` (a string) instead of the boolean;</li><li>`setActiveTrackId` in the provider also calls `setStatus` with the same text.</li></ul> Run the interactions spec alone on it | <ul><li>Red on `interact.click.components`, or its value reported with numbers if it stays green.</li><li>Scratch under `c-round-361/` only, deleted after (L60); `store/` unchanged.</li><li>A mutant that stays green is a finding against B's budget only if `click.components` rose above 42 and still passed.</li></ul> |
| PERF-LIB | A-PERF-LIB | 40/40 |
| ACTIVE-LANE (browser, dev, both viewports) | `node b-round-360/lane-probe.mjs http://127.0.0.1:5173 c-round-361/lane-<W>x<H>.json <W>x<H> active` (C reads the script first). On `/studio-lab` after "ready" it: adds "Full mix" with Enter; clicks the Stems lane name button; clicks the clip's name bar; clicks the Stems lane name button and presses Enter on "Full mix". After each step it reads the active lanes as the harness does (`[data-track-id] button[aria-pressed="true"]` [K17]), the library "Active track:" line, the status and the lane of each audio clip | Equal to B's run on HEAD `93ea6c1` (`b-round-360/lane-probe/head-1440x900.json`, `head-1280x720.json`): <ul><li>start, afterAdd: `music`, "Active track: Music · insert marker 00:00.000";</li><li>afterStemsClick: `stems`, line "Stems";</li><li>afterClipClick: `music`, line "Music";</li><li>afterEnterOnStems: `stems`, clips on `music, stems`, status "“Night Pulse · Full mix” added to the Stems track at 00:00.000."</li></ul> |
| GROUP-RING (browser, dev, 1440×900) | The same script with mode `all` (`c-round-361/lane-1440x900-all.json`): Stems name button, Shift+click SFX, Ctrl+G [K18]; click SFX; click "Fold or unfold group — Group 1" [K20]; click the Music name button | Equal to B's HEAD run (`head-1440x900.json` `groupRing`): <ul><li>afterGroup: status "Group “Group 1” created: Stems, SFX.", `data-contains-active` absent;</li><li>afterCollapse: `data-contains-active="true"` [K16] (no lane button is pressed, because the SFX lane is hidden) and the library line still "SFX";</li><li>afterMusicClick: `music` active, attribute absent again.</li></ul> |
| PASTE-LANE (browser, dev, 1440×900) | The same `all` run: add "Full mix", click its name bar, Ctrl+C, click the SFX name button, Ctrl+V | Equal to B's HEAD run (`pasteLane`): clips on `music, sfx`, `sfx` active, status "Paste (1): at 00:00.000 · on the SFX track." (SS11 in the browser) |
| VIDEO-FAIL-STOP-1 (browser, dev, both viewports; regression guard) | `c-round-358/behaviour-probe.mjs` on the tree | every row equals `c-round-360/beh-tree-*.json` (FOLLOW within the 4 px / jitter rule of C-R359-OBS-FOLLOW-JITTER) |
| G361-AUTH (browser, both viewports) | `c-round-358/auth.mjs`, copied to `c-round-361/` | as G360-AUTH. A fake-bearer 500 that fails closed while the mock is down goes under `blocked` |
| DOCS | doc 234 | <ul><li>l.4 byte-exact: `**სტატუსი:** In Progress (stage 3 of 4; C round 361 PASS)`.</li><li>7 `## ` headings in TEMPLATE order (L26).</li><li>Every budget and count the stage-3 section states matches the live budgets file and `perf-summary.txt` (L34).</li><li>Every test the doc names exists (L26).</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files.</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified** is false if any of these rows does not run: PERF, MUTANT, ACTIVE-LANE, GROUP-RING, PASTE-LANE, VIDEO-FAIL-STOP-1 or G361-AUTH. None of them needs the backend.

**L57: write all L57 fields** in `c-round-361.json`, and run `python3 -I tools/l57-check.py c-round-361.json c-round-361/l57-check.txt` until it exits 0.
- `assertsSpecified`: `interact.click.components`, `interact.click.commits`, SS8, SS9, SS10, SS11.
- `mutantsRecorded`: MU-1…MU-7 and C's own.
- `mutantRedOnSketch`: `b-round-360/perf-mu-1-b-results/latest-interactions.json`, `b-round-360/perf-mu-7-b-results/latest-interactions.json`, `b-round-360/mutant-MU-2.log` … `mutant-MU-6.log`.
- `gateChecksRunOnSketch`: `b-round-360/precheck-full-final.log`, `b-round-360/sketch-typecheck.log`, `b-round-360/sketch-lint.log`, `b-round-360/sketch-perf-lib.log`.
- `affectedChecksNamed`: the interactions perf spec, the A-TESTS files, the perf-lib tests and the behaviour probe. `affectedChecksRunOnSketch`: `b-round-360/perf-sketch-b.log`, `b-round-360/ss-sketch.log`, `b-round-360/precheck-full-final.log`, `b-round-360/lane-probe/head-1440x900.json` (the HEAD baseline of the three browser rows).

## 3. Neighbouring behaviour that could break
- **Which lane is active.** Lane click, clip click, library drop and Enter add all set it; library add and paste read it. UC7, the A-TESTS files, ACTIVE-LANE and PASTE-LANE guard it.
- **Collapsed-group ring.** It now subscribes inside the group header; UC7 / MU-6 and GROUP-RING guard it.
- **Edge navigation (Alt+Arrow over markers).** It reads the active track from the store at key time; `marker-edge-nav-ui.test.tsx` covers it.
- **Library "Active track" line.** It now has its own subscription; ACTIVE-LANE reads it.
- **Perf:** a flaky assert. Six equal samples per row (1× and 6×) on B's sketch; `click.commits` has a ceiling.
- **App behaviour otherwise:** unchanged. VIDEO-FAIL-STOP-1 and G361-AUTH guard it.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1. A HEAD that descends through root-lane paths only is not a mismatch.
- A patch does not apply, or a change is needed outside the 11 files or beyond the two patches and §1.2.
- A covering test fails or runs above 50 % of its timeout (L11).
- A-PERF: any asserted row fails; any NEW row; any deterministic components or commits row higher than C360 other than the expected drop; or `durationMs` above 540000.
- The code-reviewer reports a Medium+ finding.

## 5. Routed, not in scope
- **D-29z1168 (round 360 notes):**
  - **C-R360-NOTE-STALE** (Low, origin B spec) is fixed in this round (§1.1), with A-R360-REVIEW-VIDEOFADE-NOTE-STALE and A-R360-REVIEW-FADE-PLAYING-INTERMITTENT merged into it. It closes on C PASS.
  - The 0-commit side of `== 1` on the play rows stays untested (info, TL-R360-3).
  - VFS-v2's first-attempt cold-server timeout and the 1 px / 11 ms FOLLOW jitter are environment info (same class as C-R359-OBS-FOLLOW-JITTER).
- **D-29z1169 (PERF-10b split):** PERF-10b-ii = the Transport play/stop button as its own subscriber (≤ 20 on Play/Stop), `B-R356-PLAYBACK-SETTER`, the C-R320-01 render-budget row (with A-R320-REVIEW-WAVEFORM-NAME-POSITIVE) and the GATE320-S3 record row. `SIG-R322-ACTIVE-TRACK-STORE` is adopted by this round. `TL-R361-ACTIVE-TRACK-DANGLING` (info: a removed lane would leave the active id pointing at no track; no removal path exists today) is a STEM-LANES input, not a deferred Low.
- **Architecture checkpoint** (`b-round-358/root-request-arch-checkpoint.md`) is still unanswered and non-blocking. This round adds no store (the active track joins the selection store).
- **D-29z1171, next:**
  1. REGRESSION, if the next planning is on or after 2026-11-08.
  2. PERF-10b-ii.
  3. PERF-9 and PERF-11…15, then STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED.

  RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Deliverables
- **A:** `a-round-361.md`, with every §2.1 row, its evidence under `a-round-361/` and the code-reviewer result.
- **C:** `c-round-361.md` and `c-round-361.json` with all L57 fields, and evidence under `c-round-361/`.

## 7. Claims
Run `bash b-round-360/claims-361.sh` from the loop root. `CLAIMS_STORE` points it at a scratch.

| Output | File |
|---|---|
| Planning, on `93ea6c1` (clean tree) | `b-round-360/claims-361-planning-output.txt` |
| Sketch (code + budgets, no doc) | `b-round-360/claims-361-sketch-output.txt` |

| Tag | What it pins | Planning | Sketch |
|---|---|---|---|
| K1 | gate 360 status and commit | `published 93ea6c1` | same |
| K2 | HEAD and status entry count | `93ea6c1 0` | scratch n/a; A's final `93ea6c1 11` |
| K3 | rows; asserted count; click rows (1× commits, 1× components, `.6x` commits, `.6x` components); stale notes left | `252`, `93`, `r- r- r- r-`, `3` | `252`, `95`, `a<=2 a<=42 r- r-`, `0` |
| K4 | budgets sha256 prefix | `728ed85b08d4` | `371659418617` |
| K5 | `activeTrackId` field in `ArrangementContextValue`; `setActiveTrackIdState` uses; store field; `useArrangementActiveTrackId` export | `1 2 0 0` | `0 0 1 1` |
| K6 | protected files OK | 11 | 11 |
| K7 | SWEEP (roots `app/**`, `perf/**`): `activeTrackId` hits outside / inside tests; `latestRef` reads in the context; `workspace.`/`current.` reads in `StudioWorkspace.tsx` | `22 39 3 2` | `17 46 0 0` |
| K8 | `package.json` sha256 prefix | `948eb8eee712` | same |
| K9 | sha256 over `perf/lib` and the perf specs | `9b27ff50da71` | same |
| K10 | cited artifacts missing | `0` | `0` |
| K11 | SS rows in `selection-store.test.tsx`; UC7 in `track-group-collapse-ui.test.tsx`; the probe helper's new field | `7 1 0` | `11 1 1` |
| K12 | runtime-name hits (roots `app/**`, `perf/**`): `'ArrangementLane'`, `'ArrangementLibraryPreview'`, `'ArrangementGroupHeaderWithSelectionInner'` | `16 1 2` | same |
| K13 | `236-` docs in quarter IV; `pending` docs | `0 0` | same |
| K14 | doc 234: l.4 md5 prefix, `## ` count, stage-3 heading, old PERF-10b bullet | `5807ea0e 7 0 1` | unchanged on the scratch; A's final `d116f6ef 7 1 0` |
| K15 | sha256 over the 9 sketch files | `603be69e4ba2` | `f96e046ed0aa` |
| K16 | `data-contains-active` render in `ArrangementGroupHeader.tsx` | `1` | same |
| K20 | the group fold label `Fold or unfold group — ${name}` in `strings.ts` | `1` | same |
| K19 | the first-audio-track seed expression in `ArrangementContext.tsx` (`useState` initialiser at HEAD; store seed on the sketch) | `1` | `1` |
| K18 | the Ctrl/Cmd+G group chord in `StudioWorkspace.tsx` | `1` | same |
| K17 | the lane name button's `aria-pressed={isActive}` in `ArrangementLane.tsx`; the harness's active-lane reader in the interactions spec | `1 1` | same |

C also runs the L29 grep over this task.
