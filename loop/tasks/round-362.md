# CURRENT TASK — Round 362: PERF-10b-ii-a. Play/Stop becomes its own leaf (28 → 11 components) and no component can call `setPlaying`

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 361 → 362 planning (`b-round-361.md`).

**Decisions** (`backlog.json` → `decisions_log_b`, v324 → v325):
- **D-29z1172:** round 361 closes as PASS: `c-round-361.json` has browserVerified true, and gate 361 published `6fdd82f`.
- **D-29z1173:** rulings on the round-361 findings (`b-round-361.md` §2):
  - A's L11 STOP is an accepted delta (runner load).
  - GATE361-S1 is not a regression. The proposed prop-identity fix lets the wrapper's memo skip, but the leaf header still renders once per edit (leaf count 1 → 1), because the leaf reads the whole context. It moves to PERF-11.
  - GATE361-L2 is fixed in this round.
  - GATE361-L3 is deferred.
- **D-29z1174 / D-29z1175:** PERF-10b-ii is split into 10b-ii-a (this round) and 10b-ii-b (the harness rows C-R320-01 and GATE320-S3).
- **D-29z1177:** the scope, budgets and rulings of this round (§0).
- **D-29z1176:** the order after this round (§5).

**Why this round, now.**
- REGRESSION is not due: `regression-last.json` says 2026-11-05, so the next one falls on 2026-11-08 or later. Today is 2026-11-06.
- No Critical, High or Medium finding can be worked in the cloud. The gate's new Medium GATE361-S1 was measured and re-graded (D-29z1173, evidence in `b-round-361/ghr1-*.log`). The other open Mediums are `open_tech_lead_manual`, `awaiting_user` or `open_root`.
- PERF-10b-ii was next by D-29z1171.

**Read first:**
- `lessons.md`. A reads 10, 11, 12, 23, 26, 28, 34 and 58. C also reads 22, 37, 38, 57, 59 and 60.
- `c-round-361.md`, `b-round-361.md` and §0 below.
- Primitives: `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md` (one export renamed, one new internal component), `FORWARDREF_COMPONENT.md` (the leaf is internal and unexported), `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:**
- Reference-first, product-designer, the YouTube request and the screen budget. This is a performance refactor, and nothing changes on screen. The Play and Stop buttons keep the same DOM, names, `data-playing`, titles, `aria-keyshortcuts`, `aria-describedby` and the hidden state span, in the same order [K16].
- Ableton conformance: not applicable.

## Baseline
- HEAD is `6fdd82f`, the gate-361 publication [K1]. The tree is clean (0 status entries) [K2].
- Protected files are 11/11 OK [K6]. There is no dependency change [K8]. The perf harness (`perf/lib` and the specs) is unchanged [K9].
- **Root lanes (2026-11-05 parallel policy).** Root may apply its own patches before the round on `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx`, or `docs/` outside doc 234. A HEAD that descends from `6fdd82f` through only those paths is an allowed delta, not a STOP. This round touches no root-lane file.

## 0. The change and B's evidence (D-29z1177)

### 0.1 Premise (measured, L37)
- After PERF-10a, Play and Stop each render 28 components (`interact.play.start/stop-components`, C361 28 ×3 at 1× and 6×, `c-round-361/latest-interactions.json`).
- `ArrangementTransport` itself calls `useArrangementIsPlaying()` at its top [K5]. So on every Play and Stop the whole Transport body re-renders: undo/redo, edit, loop, zoom, Follow and every icon. Only the Play button, the Stop button and the hidden state span read `isPlaying` [K5].
- `useArrangementPlaybackStore()` hands the whole playback store, including `setPlaying`, to any component. Its only consumer is `ArrangementMarkerRow`, which reads `getState().isPlaying` inside a key handler [K7]. This is B-R356-PLAYBACK-SETTER.

### 0.2 The design
- **The Play/Stop leaf.** The Play button, the Stop button and the hidden `arrangement-playback-state` span move unchanged into `function ArrangementTransportPlayStopInner({ togglePlayback, returnToStart })`. It is wrapped as `const ArrangementTransportPlayStop = memo(ArrangementTransportPlayStopInner)` and not exported from the module.
  - The leaf owns `useArrangementIsPlaying()` and its own `useId()` for the state span.
  - `preventRepeatedEnterKeyDown` becomes a module-level function. It uses no hooks and is shared by the Transport body and the leaf.
  - The Transport body no longer reads `isPlaying`.
- **The reader-only playback hook (B-R356).**
  - The exported `useArrangementPlaybackStore()` is replaced by `useArrangementIsPlayingReader(): () => boolean`, a `useCallback` over the store's `getState().isPlaying`.
  - The store lookup becomes the module-private `useArrangementPlaybackStoreContext()`, which `useArrangementIsPlaying()` also uses.
  - `ArrangementMarkerRow` calls `readIsPlaying()` where it read `playbackStore.getState().isPlaying`, and its deps entry changes accordingly.
  - After this round, nothing outside the provider can reach `setPlaying`.
- **Tests.**
  - `playback-store.test.ts` gets **PS4**: the context module exports `useArrangementIsPlayingReader` and `useArrangementIsPlaying`, and not `useArrangementPlaybackStore`.
  - `render-budget.test.tsx` gets the L23 grant in §1.1.
- **No other memo and no other rename.** The runtime name `ArrangementTransport` keeps its hits outside `render-budget.test.tsx` [K12].

### 0.3 B's sketch (scratch `git archive 6fdd82f`, `/home/runner/b362-scratch/sc`; it does not survive the job)
- **Code:** `b-round-361/sketch.patch.txt`, covering 5 files under `app/`. **Budgets:** `b-round-361/budgets.patch.txt`, produced by `apply-budgets.py`. sha256 of both are in `b-round-361/sketch-dispatched.sha256`.
- **Checks on the sketch:**
  - `npm run typecheck` rc 0 (`sketch-typecheck.log`).
  - `biome check` on the 4 changed code files is clean (`sketch-biome.log`).
  - `biome lint ./app`: 205 warnings, equal to HEAD (`sketch-lint.log`).
  - The 15 covering files are listed in `covering-files.txt`, and the final run is in `sketch-covering-final.log`.
  - Full vitest on the final sketch, run after perf (L23): 248 files, 3644 tests (HEAD 3643 plus PS4), rc 0 (`precheck-full.log`).
- **Production perf.**
  - Transport leaf only, budgets still at HEAD: `perf-sketch.log` rc 0, 95/95, 0 NEW.
    - Play start/stop **28 → 11** ×3 at 1× and 6×. `interact.click.components` 42 → **38** ×3, because the memoized leaf no longer re-renders with the Transport.
    - 44 rows differ from C361, **all of them decreases** (`perf-sketch-rowcmp.txt`).
  - The full sketch with asserting budgets: `perf-final.log`, `perf-final-results/latest-interactions.json` and `perf-final-rowcmp.txt` (vs C361). The result is in §0.4.

| Mutant (`b-round-361/mutants/`) | Change | Red (predicted first in `checkpoint.md`) |
|---|---|---|
| MU-A | The Transport body calls `useArrangementIsPlaying()` again | Three `render-budget.test.tsx` rows go red (`MU-A-render-budget.log`): the two "Play → Stop → Play" rows and RB-PB2 (`ArrangementTransport` renders > 0). In perf this equals HEAD: play 28 > 11 (C361) |
| MU-B | The leaf is not memoized (`= ArrangementTransportPlayStopInner`) | jsdom stays green, as predicted (`MU-B-render-budget.log`). Perf with asserting budgets: rc 1, 94/95, red **only** on `interact.click.components` 43 ×3 > 38. B predicted 42; it measured 43, because the extra function component counts. Play stays 11 (`perf-mu-b.log`, `perf-mu-b-rowcmp.txt`) |
| MU-C | The context module re-exports `useArrangementPlaybackStore` | PS4 only (`MU-C-ps4.log`) |

### 0.4 Final sketch run
`b-round-361/perf-final.log` rc 0, run alone on the full sketch with asserting budgets:
- 95/95 asserted pass, `failures` [], 252 rows, 0 NEW.
- Play start/stop: 11 ×3 at 1× and 6×. `interact.click.components`: 38 ×3 at 1× and 6×.
- The 44 DIFF rows against C361 are identical to the leaf-only run, and all are decreases (`perf-final-rowcmp.txt`).
- `durationMs` 503995.

The B-R356 half changes no subscription, and this run confirms it is render-neutral. The checkpoint line "FINAL" in `b-round-361/checkpoint.md` repeats these numbers.

## 1. Scope (A)

### 1.1 Files (exactly 7)
| # | File | Change |
|---|---|---|
| 1–5 | `app/components/arrangement/ArrangementTransport.tsx`, `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementMarkerRow.tsx`, `app/lib/arrangement/__tests__/playback-store.test.ts`, `app/lib/arrangement/__tests__/render-budget.test.tsx` | From the store root: `patch -p1 < ../tmp/studio-real-loop/b-round-361/sketch.patch.txt`, unchanged. Afterwards K15 equals the sketch output |
| 6 | `perf/budgets.interactions.json` | `git apply ../tmp/studio-real-loop/b-round-361/budgets.patch.txt`, unchanged. Afterwards K4 equals the sketch output |
| 7 | `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | §1.2 |

A changes nothing else. A code-reviewer Medium+ on the sketch, or any change A believes is needed beyond the patches, is a STOP (L11), not an edit.

**L23 grant, `render-budget.test.tsx` (in the patch):**
- In the three Play → Stop → Play rows (l.342, l.481 and RB-PB2 l.646 [K11]), the positive control `ArrangementTransport > 0` becomes `ArrangementTransportPlayStopInner > 0`. Each row also gains `ArrangementTransport` `toBe(0)`.
- RB-PB2's zero map gains `ArrangementTransport: 0`, and its title names the Play/Stop leaf.
- **No assertion is lost; each one is replaced by an equal or stronger one** (L4).
- The R9-L2 positive control is unchanged and still passes: `setStatus` makes every `CONTEXT_CONSUMERS` entry render more than 0 times, `ArrangementTransport` included.

**Untouched:**
- every other `app/` file;
- `perf/*.spec.ts`, `perf/lib`, `perf/budgets.json` and `perf/budgets.resources.json`;
- e2e, config and the protected files.

`track-groups-ui.test.tsx` and `track-group-collapse-ui.test.tsx` are not touched (L31, D-29z1173).

**Budgets (rows owned by `PERF-10b-ii-a`):**
| Row | Now [K3] | After | C361 | B sketch |
|---|---|---|---|---|
| `interact.play.start-components` | assert `<= 28` | assert `<= 11` | 28 ×3 | 11 ×3 (1× and 6×) |
| `interact.play.stop-components` | assert `<= 28` | assert `<= 11` | 28 ×3 | 11 ×3 (1× and 6×) |
| `interact.click.components` | assert `<= 42` | assert `<= 38` | 42 ×3 | 38 ×3 (1× and 6×) |

- There is no headroom, because the counts are deterministic (the round-348 rule) and equal in 6 samples. MU-B proves that `<= 38` catches a 5-component regression.
- The `.6x` copies stay `record`. The asserted count stays at 95 of 252 [K3].
- The owner and note of each row name PERF-10b-ii-a and D-29z1177 (in the patch).

### 1.2 Doc 234 (Georgian, technical terms in English; L34: the whole stage-4 section is granted)
PERF-10 now has 5 stages: 10a, 10a-budgets, 10b-i, 10b-ii-a (this round) and 10b-ii-b.
- **l.4 (L28):** exactly `**სტატუსი:** In Progress (stage 4 of 5; C round 362 PASS)`.
- **l.5:** unchanged. It already lists `ArrangementTransport.tsx` and `ArrangementMarkerRow.tsx`.
- **A new subsection** under `## მიდგომა`, after stage 3, titled exactly `### ეტაპი 4: PERF-10b-ii-a (round 362, D-29z1177)`. It contains:
  - the premise (28; the Transport reads `isPlaying`);
  - the design of §0.2;
  - the budget table and its rules;
  - the MU-A/MU-B/MU-C table;
  - the B-R356 closure.
- **GATE361-L2 (fixed here):** in `## ტესტირება`, the stage-3 bullet's UC7 clause becomes `UC7 (არსებული, უკვე HEAD-ზე)`, so it no longer reads as added in round 361. Nothing else in that bullet changes.
- **`## შეცვლილი ფაილები`:** one dated bullet per changed file of this stage: the 5 app files and the budgets file.
- **`## ტესტირება`:** one stage-4 bullet that cites only real artifacts: PS4, the three granted `render-budget.test.tsx` rows, `b-round-361/perf-final.log` and C's round-362 PERF row.
- **`## TODO / შემდეგი ნაბიჯები`:** the bullet that starts "**PERF-10b-ii:**" [K14] is replaced by two bullets:
  - PERF-10b-ii-a, struck as done (C round 362 PASS);
  - **PERF-10b-ii-b:** C-R320-01-ის render-budget row (+ A-R320-REVIEW-WAVEFORM-NAME-POSITIVE) და GATE320-S3-ის record row.
- **The `## ` count stays 7** [K14], in TEMPLATE order (L26).

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-361/claims-362.sh`, from the loop root | equals `b-round-361/claims-362-planning-output.txt` |
| A-CLAIMS final | same | <ul><li>K3, K4, K5, K7, K11, K12 and K15 equal `b-round-361/claims-362-sketch-output.txt`.</li><li>K2 = `6fdd82f 7`.</li><li>K14 = `doc234-l4 ef9813ea doc234-h2 7 doc234-stage4 1 doc234-uc7-existing 1` (`ef9813ea` is the md5 prefix of the §1.2 l.4 line with its newline).</li><li>K1, K6, K8, K9, K10, K13 and K16 equal the planning output.</li></ul> |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-TESTS | `npx vitest run --reporter=verbose $(cat ../tmp/studio-real-loop/b-round-361/covering-files.txt)` (15 files) | <ul><li>All pass; PS4 and RB-PB2 are named in the log.</li><li>The file and test counts equal B's `sketch-covering-final.log` (15 files, 284 tests).</li><li>B's slowest test was TC10 at 4487 ms, against a declared 15 000 ms (30 %); gate 361 measured it at 4511 ms on HEAD.</li><li>A test above 50 % of its timeout here is reported with B's run as the reference. It is a STOP only if B's run of the same test was under 50 % (D-29z1173: parallel load alone is an accepted delta).</li></ul> |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (GATE304-M1) | 40/40 |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`. Then `python3 -I b-round-329/perf-rowcmp.py c-round-361/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | <ul><li>rc 0; `complete`; `failures` [].</li><li>252 rows; **95/95** asserted pass; 0 NEW.</li><li>Play start/stop components 11 ×3 and their `.6x` 11 ×3; `interact.click.components` 38 ×3.</li><li>No deterministic components or commits row is higher than C361.</li><li>The DIFF rows equal B's `perf-final-rowcmp.txt`.</li><li>`durationMs` ≤ 540000, recorded.</li></ul> |
| A-MUTANT | Not required: B ran MU-A…MU-C (§0.3). A cites them | — |
| A-REVIEW | `code-reviewer` on the 7 files | No unruled Medium+ (a Medium+ is a STOP, §1.1). Any change after the review goes back to the reviewer (L11). The Architecture note goes to B |
| A-DOC | doc 234 | as §1.2 |

### 2.2 C rows
Use a warm dev server (L38): load `/studio-lab` once in a browser before any timed probe. If `:5173` returns "504 Outdated Optimize Dep", restart it first.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-361/claims-362.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `patch -p1 -R --dry-run < ../tmp/studio-real-loop/b-round-361/sketch.patch.txt`; `git apply -R --check` of `b-round-361/budgets.patch.txt`; `git diff --stat` | <ul><li>7 modified files, 0 untracked.</li><li>Both patches reverse-apply.</li><li>Doc 234 is the only doc changed.</li></ul> |
| PERF (browser, production, alone) | A-PERF's command and comparison | As A-PERF: 95/95, 0 NEW, play 11 and click 38, no row higher than C361. `durationMs` recorded |
| MUTANT (C's own, scratch, predicted first in `c-round-362/progress.json`) | One mutant that is **not** MU-A…MU-C and that should move a play or click row. Examples: <ul><li>the leaf gets an inline arrow `togglePlayback={() => togglePlayback()}`, so memo breaks;</li><li>the hidden state span stays in the Transport body and reads `isPlaying` there;</li><li>`ArrangementTransportPosition` moves into the leaf.</li></ul> Run the interactions spec alone on it | <ul><li>Red on an asserted play or click row, or its value reported with numbers if it stays green.</li><li>Scratch under `c-round-362/` only, deleted afterwards (L60); `store/` unchanged.</li><li>A mutant that stays green is a finding against B's budget only if a play row rose above 11, or click above 38, and still passed.</li></ul> |
| PERF-LIB | A-PERF-LIB | 40/40 |
| PLAY-STOP (browser, dev, both viewports) | On `/studio-lab` after "Demo collection ready" (L48), with screenshots at 1440×900 and 1280×720: <ol><li>Click Play: `data-playing="true"` on Play, the state span reads the playing text, and the clock advances over 1 s.</li><li>Click Stop: `data-playing="false"`, the stopped text, and the clock stops.</li><li>Space starts and stops playback the same way.</li><li>Hold Enter on the focused Play button: one start, no toggling on key repeat.</li><li>Double-click Stop: back to 00:00.000.</li><li>Tab order around the centre group (Follow → Play → Stop → Back to start → Loop).</li></ol> | Each step equals a HEAD run of the same probe. C runs it on a HEAD scratch dev server with its own Vite `cacheDir` (L38), or cites the `c-round-361/beh-tree-*.json` rows that already cover a step |
| MARKER-NONE (browser, dev, 1440×900) | Add the demo "Full mix". With no marker after the playhead, press Ctrl+Right while stopped, then while playing | Stopped: status "No more markers after the insert marker". Playing: "No more markers after the playhead". This is the `readIsPlaying()` path, as in IM24 [K16] |
| VIDEO-FAIL-STOP-1 (browser, dev, both viewports; regression guard) | `c-round-358/behaviour-probe.mjs` on the tree | Every row equals `c-round-361/beh-tree-*.json` (FOLLOW within the 4 px jitter rule of C-R359-OBS-FOLLOW-JITTER) |
| G362-AUTH (browser, both viewports) | `c-round-358/auth.mjs`, copied to `c-round-362/` | As G361-AUTH. A fake-bearer 500 that fails closed while the mock is down goes under `blocked` |
| DOCS | doc 234 | <ul><li>l.4 byte-exact: `**სტატუსი:** In Progress (stage 4 of 5; C round 362 PASS)`.</li><li>7 `## ` headings in TEMPLATE order (L26).</li><li>Every budget and count in the stage-4 section matches the live budgets file and `b-round-361/perf-final.log` (L34).</li><li>Every test the doc names exists (L26), and UC7 is called existing.</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files.</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify` and the e2e smoke.

**browserVerified** is false if any of these rows does not run: PERF, MUTANT, PLAY-STOP, MARKER-NONE, VIDEO-FAIL-STOP-1 or G362-AUTH. None of them needs the backend.

**L57: write all L57 fields** in `c-round-362.json`, and run `python3 -I tools/l57-check.py c-round-362.json c-round-362/l57-check.txt` until it exits 0.
- `assertsSpecified`: `interact.play.start-components`, `interact.play.stop-components`, `interact.click.components`, PS4 and RB-PB2.
- `mutantsRecorded`: MU-A…MU-C and C's own.
- `mutantRedOnSketch`: `b-round-361/mutants/MU-A-render-budget.log`, `b-round-361/perf-mu-b-results/latest-interactions.json` and `b-round-361/mutants/MU-C-ps4.log`.
- `gateChecksRunOnSketch`: `b-round-361/precheck-full.log` (full vitest on the sketch: 248 files, 3644 tests, rc 0), `b-round-361/sketch-typecheck.log`, `b-round-361/sketch-lint.log` and `b-round-361/sketch-covering-final.log`.
- `affectedChecksNamed`: the interactions perf spec, the 15 covering files, the perf-lib tests and the behaviour probe.
- `affectedChecksRunOnSketch`: `b-round-361/perf-final.log`, `b-round-361/perf-sketch.log` and `b-round-361/sketch-covering-final.log`.

## 3. Neighbouring behaviour that could break
- **The Play and Stop buttons.** Click, Space, the held-Enter guard, double-click Stop, focus order, and the `aria-describedby` link to the state span (now with the leaf's own `useId`). PLAY-STOP and the 15 covering files guard them.
- **Undo/Redo focus hand-off.** `armFocusHandoff` and the layout effect stay in the Transport body, unchanged. `self-disabling-focus.test.tsx`, which is in the covering set, guards them.
- **The marker "no more markers" text.** It now goes through `readIsPlaying()`. IM24 and MARKER-NONE guard it.
- **Perf.** A changed row could become flaky. Each changed row has six equal samples (1× and 6×) on B's sketch.
- **Everything else in the app:** unchanged. VIDEO-FAIL-STOP-1 and G362-AUTH guard it.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1. A HEAD that descends through root-lane paths only is not a mismatch.
- A patch does not apply, or a change is needed outside the 7 files, beyond the two patches and §1.2.
- A covering test fails (the timing rule is in A-TESTS).
- A-PERF: any asserted row fails; any NEW row; any deterministic components or commits row higher than C361; or `durationMs` above 540000.
- The code-reviewer reports a Medium+ finding.

## 5. Routed, not in scope
- **D-29z1173 (round 361 findings):** see `b-round-361.md` §2.
  - GATE361-S1-COLLAPSED-HEADER-RENDERS is re-graded to Low (perf signal), with A-R361-REVIEW-CANDIDATES-ARRANGEMENT-DEP merged into it. It becomes a PERF-11 input: the group header should subscribe through selectors, and the harness needs a collapsed-group row.
  - GATE361-L3-LIBRARY-ACTIVE-RAW goes to `deferred_low_polish`.
  - GATE361-L2 is fixed in §1.2.
- **PERF-10b-ii-b (next PERF round):** the C-R320-01 render-budget row (with A-R320-REVIEW-WAVEFORM-NAME-POSITIVE) and the GATE320-S3 record row. Both are harness and budget rows only.
- **Architecture checkpoint** (`b-round-358/root-request-arch-checkpoint.md`): still unanswered and non-blocking. This round adds no store. The new signal SIG-R361-CONTEXT-LEAF-CONSUMERS (several leaves still call `useArrangement()` whole) is a PERF-11 input.
- **D-29z1176, next:**
  1. REGRESSION, if the next planning is on or after 2026-11-08.
  2. PERF-10b-ii-b.
  3. PERF-9, PERF-11…15, SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
  4. STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED.

  RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Deliverables
- **A:** `a-round-362.md`, with every §2.1 row, its evidence under `a-round-362/` and the code-reviewer result.
- **C:** `c-round-362.md` and `c-round-362.json` with all L57 fields, and evidence under `c-round-362/`.

## 7. Claims
Run `bash b-round-361/claims-362.sh` from the loop root. `CLAIMS_STORE` points it at a scratch.

| Output | File |
|---|---|
| Planning, on `6fdd82f` (clean tree) | `b-round-361/claims-362-planning-output.txt` |
| Sketch (code + budgets, no doc) | `b-round-361/claims-362-sketch-output.txt` |

| Tag | What it pins |
|---|---|
| K1 | gate 361 status and commit |
| K2 | HEAD and the status entry count |
| K3 | rows; asserted count; mode, budget and owner of the six play/click rows |
| K4 | budgets sha256 prefix |
| K5 | in `ArrangementTransport.tsx`: `useArrangementIsPlaying()` calls, the leaf function, the leaf memo, and lines with `isPlaying` |
| K6 | protected files OK |
| K7 | SWEEP (roots `app/**`, `perf/**`): `useArrangementPlaybackStore` hits, `useArrangementIsPlayingReader` hits, `playbackStore` lines in `ArrangementMarkerRow.tsx`, and files outside the context and the store that call `setPlaying(` |
| K8 | `package.json` sha256 prefix |
| K9 | sha256 over `perf/lib` and the perf specs |
| K10 | cited artifacts missing |
| K11 | in `render-budget.test.tsx`: `ArrangementTransport > 0` controls, `ArrangementTransportPlayStopInner > 0` controls and `ArrangementTransport` `toBe(0)`; the PS rows in `playback-store.test.ts` |
| K12 | runtime-name hits `'ArrangementTransport'` and `'ArrangementTransportPlayStopInner'` (roots `app/**`, `perf/**`) |
| K13 | quarter-IV doc count; `pending` docs |
| K14 | doc 234: l.4 md5 prefix, `## ` count, stage-4 heading, the UC7-existing wording |
| K15 | sha256 over the 5 sketch files |
| K16 | the IM24 row in `insert-marker-ui.test.tsx`; the `arrangement-playback-state` span in `ArrangementTransport.tsx` |

The values are in the two output files. L29 check for C: every backticked `store/` path or symbol in §0.1, §0.2 and the Baseline section that states a current-code fact carries a `[K#]`. C lists any untagged one as a B-spec Low; no separate grep tool is required.
