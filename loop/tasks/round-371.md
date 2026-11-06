# Round 371: PERF-11c-i. The track-group header leaf stops reading the whole workspace context (GATE361-S1, the first leaf of SIG-R361), plus the playback-store hook error text (A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT)

**Planned by:** B, at the round 370 → 371 planning, 2026-11-06 (`b-round-370.md`).

**Decisions** (`backlog.json` v335 → v336, `decisions_log_b`):
- **D-29z1223:** round 370 (PERF-11a) is accepted from C's evidence (`c-round-370.json` PASS, `browserVerified` and `realVerified` true, 0 bugs). Gate 370 published `f530e2d`, which is the new baseline.
- **D-29z1224:** the round-370 reviewer Lows and architecture notes are recorded and not scheduled.
- **D-29z1225:** PERF-11c is split into three stages:
  - **11c-i (this round):** the group header leaf. Done first because it has the smallest grant and its jsdom rows are red at HEAD.
  - **11c-ii:** committed status leaves the context value (SIG-R360). 28 test files read `status`/`statusSequence` off the value, so that stage carries a test-migration grant.
  - **11c-iii:** the remaining `useArrangement()` leaves, and PERF2-FIRST-FRAME-LONGTASK.
- **D-29z1226:** this task and the order after it (§6).

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28 and 58. C also reads 22, 29, 38, 56, 57, 59 and 60.
- `b-round-370/sketch.patch.txt` (the dispatched sketch) and `b-round-370/sketch-review.md`.
- Primitives:
  - `AGENT_DISCOVERABLE_CODE.md` (a new export `ArrangementGroupHeaderActions`);
  - `FORWARDREF_COMPONENT.md` (an existing component's props change; no ref);
  - `REACT_CONTEXT.md` (context consumers, ArrangementContext hook errors);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§8).

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a pure performance round: no new control, no new user action and no visible change.
**Screen budget:** nothing visible is added or removed.

## Baseline
- HEAD is `f530e2d`, published by gate 370 [K1]. The tree is clean [K2].
- Protected files: all pass their sha check [K10].
- Frozen: every tracked file except the grants below is listed in `b-round-370/r371-frozen-sha256.txt` (1,257 entries) [K12]. C checks it at the start and the end.
- `regression-last.json` is 2026-11-05 [K20], so REGRESSION is due at the first planning on or after 2026-11-08, not now.
- **Today, at HEAD:**
  - `ArrangementGroupHeader` (the leaf) calls `useArrangement()` and computes `trackGroupSoloState(arrangement, group.id)` itself [K3]. So every context value change re-renders every group header: each status write and each arrangement edit, including edits outside the group (GATE361-S1).
  - The wrapper `ArrangementGroupHeaderWithSelection` is a plain `memo` [K4]. StudioWorkspace rebuilds each folded group's overview and active-candidate arrays on every arrangement edit [K4], so the wrapper also re-renders on edits outside the group.
  - The leaf is rendered at exactly one site, the wrapper [K5].
  - `useArrangementPlaybackStoreContext` throws the text `useArrangementIsPlaying must be used within an ArrangementProvider` also for `useArrangementIsPlayingReader` [K6]. No test asserts that text [K7].
  - fader-pointer-preview.test.tsx keys its `PARENT_NAMES` on the runtime name `'ArrangementGroupHeader'` [K8]. So the leaf must keep that name: it is **not** wrapped in `memo` and not renamed. Its parent wrapper is already memoised, so the leaf renders only when the wrapper does or when its own state changes.
  - Five test files read the `ArrangementGroupHeader.tsx` source [K9]. All pass on the sketch (§0).
  - The `/studio-lab` demo has no track groups, and the interactions perf spec never presses Ctrl+G. The fader perf spec groups Stems + SFX for its group fader rows [K13].
  - **Browser baseline (B's probe at HEAD, both viewports)** [K25]:
    - Ctrl+G on Music + Stems creates "Group 1".
    - Group Solo goes off → on → off. Soloing the Music lane makes the group Solo `mixed`.
    - Group Mute: on, then Ctrl+Z turns it off.
    - Group Volume: ArrowDown 0 → −0.1, Ctrl+Z → 0.
    - F2 rename "Drums" + Enter: the name updates and focus returns to the name button.
    - With the group folded, muting SFX (outside the group) renders the header leaf **1** time and the wrapper **1** time.

## 0. B's pre-check (L23, L30, L37, L58)
| What | Command | Result |
|---|---|---|
| New rows on HEAD | the two covering test files of §4 copied onto a HEAD copy | GH1, GH2, GH5 and L8d are **red**; GH3, GH4 and L8c are green (positive controls) (`b-round-370/head-new-rows.log`) [K14] |
| Mutants on the sketch | `b-round-370/mutants.py` (each mutant applied, the two test files run, restored) | all 8 red as predicted (§4; `b-round-370/mutants/mutant-*.log`) [K15] |
| Full suite on the sketch (L23 RETRO 305) | `npm run test:run` | 252 files and 3,703 tests pass (`b-round-370/precheck-full.log`) [K16] |
| Typecheck, Biome, lint | `npx tsc --noEmit`; `npx biome check` on the 5 files; `npm run lint` | rc 0, rc 0, rc 0. Lint shows the repo's 205 pre-existing warnings (`sketch-typecheck.log`, `sketch-biome.log`, `sketch-lint.log`) |
| Interactions perf spec, alone (L38) | `npx playwright test --config playwright.perf.config.ts studio-lab-interactions` on sketch **v1** | 1 passed, `failures []`, 95 asserts. All 264 deterministic rows are equal to `c-round-364/latest-interactions.json`. The demo has no group, so this spec cannot see the change (`perf-sketch.log`, `perf-sketch-rowcmp.txt`) [K17]. v1 → v2 changed only the comparator's form and added test rows (`sketch-v1-to-v2.diff.txt`) |
| Fader perf spec, alone | `npx playwright test --config playwright.perf.config.ts studio-lab.perf` on sketch **v2** | 1 passed, `failures []`, 94 asserts. All deterministic rows are equal to `c-round-347/fader-perf-results/latest.json`, including the 26 group fader rows (`perf-fader-sketch.log`, `perf-fader-rowcmp.txt`) [K17b] |
| Other test roots (L30) | `perf/lib` is not touched; e2e is not touched | n/a |
| Consult (perf queue rule) | `performance-optimizer`, read-only, on v2 | Keep the sketch. The per-clip table loop is a small constant-factor overhead; it also runs in the preview-store selector on drag ticks. The solo map does no more work than HEAD. The 11c-ii premise still holds; MarkerRow needs a committed-status getter there. Recorded as `consults_round_371` |
| Sketch review (L58) | `tech-lead`: v1, then a delta review of v2 | v1: 1 Medium (the comparator could silently ignore a new prop) fixed in v2 with a compile-checked equality table; Lows fixed or ruled. v2 approved, nothing new at Medium or above. Reviewed sha = dispatched sha `e82ad292…51bb` (`sketch-review.md`) |

## 1. What A changes (grants: exactly these files)
A applies `b-round-370/sketch.patch.txt` with `patch -p1` from `store/`, after checking its sha256 against `b-round-370/sketch-dispatched.sha256`. A makes no other edit to these five files (row SKETCH-EQUAL).
1. **`app/components/arrangement/ArrangementGroupHeader.tsx`:**
   - The leaf no longer imports or calls `useArrangement`.
   - New exported type `ArrangementGroupHeaderActions`: a `Pick` of 9 context callbacks.
   - Two new props, `soloState: TrackGroupSoloState` and `actions: ArrangementGroupHeaderActions`.
   - One TODO line: keep the leaf un-memoised (because of `PARENT_NAMES`).
2. **`app/components/arrangement/StudioWorkspace.tsx`:**
   - A per-group `trackGroupSoloStates` map (`useMemo` on `arrangement` and `trackRows`).
   - One memoised `groupHeaderActions` object.
   - Both are passed to the wrapper.
   - The wrapper's `memo` gets `sameGroupHeaderWithSelectionProps`. It is driven by `GROUP_HEADER_WITH_SELECTION_PROP_EQUALITY: PropEquality<…>`, a mapped type with `-?`, so tsc rejects a missing or extra key. `overviewClips` and `activeCandidateTrackIds` are compared by content.
   - `sameTrackGroupOverviewClips` compares clips through `TRACK_GROUP_OVERVIEW_CLIP_EQUALITY`.
   - No `any`, no type assertion.
3. **`app/contexts/ArrangementContext.tsx`:** `useArrangementPlaybackStoreContext(hookName: string)`. Each of its two callers passes its own name.
4. **Tests (existing files, rows added):**
   - `app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx`: rows GH1–GH5.
   - `app/lib/arrangement/__tests__/context-hygiene.test.tsx`: rows L8c and L8d.
5. **`docs/implementation/2026/quarter-IV/238-perf-group-header-leaf.md` (new; 238 is free [K11]):**
   - Georgian, with the TEMPLATE headings (L26);
   - l.4 exactly `**სტატუსი:** In Progress (stage 1 of 3; C round 371 PASS)`, the label form of docs 234–237 and the L28 multi-stage form;
   - it records §0's measurements, the 11c-i/ii/iii split, and the browser baseline;
   - it names only tests that exist.

**Ruling lines (L4):**
- The leaf's runtime name: "keep `'ArrangementGroupHeader'` (fader-pointer-preview `PARENT_NAMES` [K8])" wins over "memo every leaf you touch" (L58's memo clause). The wrapper is the memo boundary.
- `ArrangementContextValue`'s shape: unchanged in this round. Removing `status` is 11c-ii.

**Behaviour that must not change (neighbour risk):**
- Group Solo, Mute, Volume (drag, keys, double-click reset, Undo), rename (F2, Enter, Esc, blur), fold, overview blocks and their selection marks, focus restore when a focused group row unmounts.
- Group fader perf rows (asserts ≤ 3 per move, 0 restarts).

## 2. A: checks (speed rules)
- Run `npm run typecheck` and `npm run lint`.
- Run `npx vitest run` on the covering files:
  - `selection-wrappers-render.test.tsx`;
  - `context-hygiene.test.tsx`;
  - `fader-pointer-preview.test.tsx`;
  - `track-group-collapse-ui.test.tsx`;
  - `track-group-mix-ui.test.tsx`;
  - `track-groups-ui.test.tsx`;
  - `group-volume-db.test.tsx`;
  - `affordance-colour-ui.test.tsx`;
  - `mixer-onstate-colour-ui.test.tsx`;
  - `studio-theme-obsidian.test.tsx`;
  - `studio-focus-ring.test.ts`;
  - `strings.test.ts`;
  - `drag-preview-render.test.tsx`;
  - `fader-style-ui.test.tsx`;
  - `fader-touch.test.tsx`;
  - `clip-gain-waveform.test.tsx`;
  - `grid-snap-menu.test.tsx`;
  - `header-meter-envelope-strings-ui.test.tsx`;
  - `track-volume-db.test.tsx`.

  These are the 19 app test files that name the group header, its testids or its actions (B's grep; all passed in `precheck-full.log`). All live under `app/lib/arrangement/__tests__/`.
- Do not run the perf specs: B ran both, and C runs them alone.
- Ask the code-reviewer once (6 files change), and send any later edit back to it (L11).
- A STOP takes the L11 form: a red covering file, a test above 50 % of its timeout, or a sketch hunk that does not apply.

## 3. C: what to verify
C writes `c-round-371.md` and `c-round-371.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` for every finding;
- `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (= `b-round-370/mutants/`), `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-371.json c-round-371/l57-check.txt` must exit 0. Write `c-round-371/progress.json` after every row (L59).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all` lists only the §1 files (5 changed, 1 new doc). `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-370/r371-frozen-sha256.txt` from `store/` gives rc 0. The protected sha check gives rc 0 | Nothing outside the grants changed |
| **CLAIMS** | Run `bash b-round-370/claims-371.sh` from the loop root first (L56). Compare with `b-round-370/claims-371-output.txt` (HEAD) and `b-round-370/claims-371-sketch-output.txt` (the same script on the sketch) | On A's tree, K3, K4, K6, K7, K8, K24 and K26 equal the sketch output (K26: 0 failing lines). K2 reads `f530e2d status-lines: 6`. K11 reads `doc 238 free: 1 last: 238-perf-group-header-leaf.md`. Every other line equals the HEAD output, with K12 at 0 failing lines and no `MISSING` |
| **SKETCH-EQUAL** | From `store/`: `sha256sum -c ../tmp/studio-real-loop/b-round-370/sketch-files-sha256.txt` (the five patched files of B's sketch) | rc 0, all five OK. A `git diff` byte compare with `sketch.patch.txt` is optional and never a FAIL by itself (git config can change the headers) |
| **UNIT** | The 19 covering files of §2, plus `selection-wrappers-render.test.tsx` with `--sequence.shuffle --sequence.seed=42` | All pass. GH1–GH5, L8c and L8d exist as §4 states |
| **MUTANTS-TREE** | On a copy of A's tree under `c-round-371/` (never in `store/`, L60), at least: MU-GH-CTX, MU-GH-DEFAULT-MEMO, MU-GH-COMPARATOR-NO-GROUP and MU-L8-NAME (`python3 -I b-round-370/mutants.py <copy> <loop>/c-round-371/mutants`: the first argument is the tree and the second is the output folder; never leave the default output, which is B's `b-round-370/mutants/`) | Each is red on the rows §4 predicts. Record them as `mutantRedOnTree` |
| **PERF-FADER** | `npx playwright test --config playwright.perf.config.ts studio-lab.perf`, run **alone** (L38) | 1 passed, `failures []`. The 26 group fader deterministic rows equal B's sketch values (`b-round-370/perf-fader-rowcmp.txt`: move-components-max 1, per-move 0.75, release-commits 1, restarts 0, at 1× and 6×). A deterministic row that differs from B's v2 sketch is recorded with its cause |
| **PERF-INTERACT** | `npx playwright test --config playwright.perf.config.ts studio-lab-interactions`, run **alone** | 1 passed, `failures []` (the budgets file is unchanged). Deterministic rows: record. B's v1 values equal `c-round-364`; a difference is recorded, never a FAIL by itself (`record — v2 not run on sketch: v2 changes only the comparator form; the demo has no group`) |
| **GROUP-BEHAVIOUR (browser)** | `b-round-370/probe/group-probe.mjs` on `http://127.0.0.1:5173` (A's tree), output under `c-round-371/`. Fresh context at 1440×900 and 1280×720. Warm up first (L38) | Every behaviour field equals B's HEAD run `b-round-370/probe/group-head.json` [K25]: group created, solo off → on → off, member solo `mixed` then `off`, mute true → Ctrl+Z false, volume 0 → −0.1 → Ctrl+Z 0, rename "Drums" with focus back on `arrangement-group-name`, folded `aria-expanded="false"`, outside mute pressed. Screenshots at both viewports |
| **GROUP-RENDERS (browser, record)** | The same probe's `rendersOnOutsideMute` | `record — not run on sketch: a second dev server for the sketch needs its own Vite cache, which this planning did not run`. Expected header 0 and wrapper 0 (HEAD: 1 and 1). If either is > 0 on A's tree, record it with the commit's names; jsdom GH2 is the assert |
| **G371-AUTH (browser)** | A fresh anonymous context at both viewports. Warm up first (L38) | `/studio-lab` shows the workspace and the demo state, and `localStorage.auth_user` is null. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `/api/studio-token` returns 401 with no token (a fake bearer: 403 with the mock, else a fail-closed 500 under `blocked`). No token appears in any body |
| **STUDIO-SMOKE-371 (browser)** | After `Demo collection ready` (L48), at both viewports: <ul><li>add `Bass` with Enter;</li><li>Play: the position is ≥ 00:01.000 after 1.5 s;</li><li>drag the clip by its name bar to the lane below, then Ctrl+Z (the Undo title reads "Undo: Move to track — <lane>");</li><li>export a WAV</li></ul> | As stated. The WAV is RIFF/WAVE, 48 kHz, with peak > 0 |
| **DOCS** | Doc 238: l.4 byte for byte (§1 item 5); the TEMPLATE headings as an in-order subsequence; every test it names exists (L26). `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits | As stated |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if GROUP-BEHAVIOUR, G371-AUTH and STUDIO-SMOKE-371 ran at both viewports. GROUP-RENDERS is record-only.

## 4. Unit rows (the sketch has all seven; A keeps them, equal or stronger)
| Row | Asserts | Red on HEAD | Mutant that turns it red |
|---|---|---|---|
| GH1 | folded group, `setStatus`: Transport renders (> 0); the wrapper and the leaf `ArrangementGroupHeader` render 0 | yes | MU-GH-CTX, MU-GH-ACTIONS-INLINE |
| GH2 | folded group, `toggleTrackMute('music')` (outside the group): music is muted, the undo label changed, StudioWorkspace renders; the wrapper and the leaf render 0; the overview starts are unchanged | yes | MU-GH-CTX, MU-GH-DEFAULT-MEMO, MU-GH-ACTIONS-INLINE |
| GH3 | nudge of a member clip: the leaf renders; the overview block's `data-overview-start` follows the new start | no (positive control) | MU-GH-CLIP-START-IGNORED |
| GH4 | member solo → group `data-solo`/`aria-pressed` `mixed`, the leaf renders; then off; group Solo click → `on`; group Mute click → `aria-pressed` true | no (positive control) | MU-GH-SOLO-OFF, MU-GH-COMPARATOR-NO-SOLO, MU-GH-COMPARATOR-NO-GROUP |
| GH5 | two groups; muting the second renders exactly 1 header leaf; only that group's Mute is pressed | yes ("expected 2 to be 1") | MU-GH-CTX, MU-GH-DEFAULT-MEMO, MU-GH-COMPARATOR-NO-GROUP |
| L8c | `useArrangementIsPlaying` outside a provider throws its own name | no | — |
| L8d | `useArrangementIsPlayingReader` outside a provider throws its own name | yes | MU-L8-NAME |

## 5. Neighbour risk
- **A prop added to the group header later:** tsc rejects the equality table until the new key is listed (TL-1 fix). A field added to `TrackGroupOverviewClip` is caught the same way.
- **A callback that loses identity stability** (a new dependency in its chain): GH1, GH2 and GH5 turn red. `tech-lead` traced all 13 callbacks as stable at HEAD.
- **The volume fader preview** runs through the mix-draft store and `useRelativeFaderDrag`'s ref, not through the parent render. The fader perf rows are unchanged on the sketch.
- **Ruled, not changed** (Lows): B-R370-GH-ACTIVE-CANDIDATES-ROW (a clip-less track joining a folded group changes only the candidate list); expanded groups are trivially stable; B-R370-HOOK-ERROR-NAMES (other wrapper hooks name their store hook).

## 6. Order after this round (D-29z1226)
1. REGRESSION at the first planning on or after 2026-11-08.
2. PERF-11c-ii (status out of the context value), then PERF-11c-iii.
3. PERF-11b, if root or Saba answers.
4. PERF-12…15, then SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
5. STEM-LANES, then SYS-1…3.
6. STORE-2b…5, then REVIEW-RECOMMENDATIONS and T12-ADVANCED.
7. The phase-2 entries, under the skip rule.

SYS-R369 runs when root answers ARCH-CHECKPOINT-PERF9-STEM-CACHE. RETRO is due at about round 384, or at the end of STUDIO-PERFORMANCE.

## 7. Root notes
- No new root request. The open ones are unchanged:
  - ROOT-REQ-PERF11B-FIREBASE-LAZY (`b-round-369/root-request-perf11b-firebase-lazy.md`);
  - ARCH-CHECKPOINT-PERF9-STEM-CACHE;
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1);
  - ROOT-REQ-B-RETRO-CONSULTS.
- After C PASS, this round is ready for the gate: 5 source/test files and 1 doc.

## 8. Claims (L29 + L56)
Run `bash b-round-370/claims-371.sh` from the loop root. The expected output at HEAD is `b-round-370/claims-371-output.txt`, and on the sketch it is `b-round-370/claims-371-sketch-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 370 published `f530e2d` |
| K2 | HEAD and the status line count |
| K3 | the leaf's `useArrangement` lines and its own `trackGroupSoloState(arrangement, …)` |
| K4 | the wrapper's plain `memo`; the per-edit overview and candidate arrays |
| K5 | the one leaf render site |
| K6 | the playback-store error text and the no-argument lines (the definition plus 2 callers) |
| K7 | 0 tests assert the old text at HEAD |
| K8 | the test files keyed on the runtime name `'ArrangementGroupHeader'` |
| K9 | the 5 test files that read `ArrangementGroupHeader.tsx` |
| K10 | the protected sha check |
| K11 | doc 238 is free, and the last doc number |
| K12 | the frozen list check |
| K13 | no group in the demo or in the interactions spec; the fader spec's group step |
| K14 | the new rows that are red on HEAD |
| K15 | the mutant reds |
| K16 | the full suite on the sketch |
| K17, K17b | the interactions (v1) and fader (v2) perf runs on the sketch |
| K18 | every cited artifact exists |
| K19 | the lessons line count |
| K20 | the regression-last date |
| K21 | the round-370 archive sha |
| K22 | the l57 check on `c-round-370.json` |
| K23 | SS8a exists |
| K24 | the `useArrangement()` consumer files (11c-iii input) |
| K25 | B's HEAD browser probe, both viewports |
| K26 | the five granted files equal B's sketch (`b-round-370/sketch-files-sha256.txt`; HEAD 5 failing lines, sketch 0) |
