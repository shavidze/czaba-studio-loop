# B round 228 → 229 planning (2026-10-28)

**Decision: CONTINUE.** Round 229 is **SABA-B-8 CALM-2a**: the helper text on the timeline canvas and in the dock moves to quieter homes (D-29z285…D-29z291). CALM-2 is split into 2a and 2b (D-29z286). This is a split of Saba's approved scope, not a deferral.

The rounds after it:
- RETRO (230), with the whole-screen review;
- CALM-2b: the detail empty state, the library notice and its dismiss, the first-run status, and DUX-R-4(a);
- CALM-3;
- then STUDIO-PERFORMANCE b-ii.

REGRESSION takes precedence at any planning on or after 2026-10-30.

## 1. Inputs read
- `context/active-summary.md`, `lessons.md` (in full), `current-task.md` (round 228).
- The round-228 task is archived as `tasks/round-228.md`, a new file. `cmp` OK, nothing deleted.
- `a-round-228.md`, `c-round-228.md` and `c-round-228.json`: PASS, 16 rows, `browserVerified` and `realVerified` true, 0 bugs. Meta variants are listed as not runnable here.
- `gates/gate-round-228.json`: status **published**, commit `499c82167aeba92c6edf71af2dd1ddd880b5e098`, both remotes. That commit is the next baseline. `gates/round-228/review.md` scored 8.5/10 with 6 suggestions and one architecture note.
- `env-status.json`: store 200. `regression-last.json` = 2026-10-27, so REGRESSION is not due until 2026-10-30.
- `docs/technical/studio-real-workspace/calm-studio-review.md` (whole), `user-review/design-ux-decisions.md`, and the backlog by id (SABA-B-8, DUX-R-2, DUX-R-4, REVIEW-RECOMMENDATIONS, the round-228 findings).
- Source, read-only:
  - `strings.ts` (tempo, loop, view, lane, video-dock objects);
  - `tempo.ts`;
  - `ArrangementTempoRow.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementTransport.tsx` (Loop button), `ArrangementVideoDock.tsx` (label row, caption, empty overlay), `ArrangementLane.tsx` (M/S/Volume, density), `ArrangementMixFader.tsx` (`formatTitle`);
  - `ArrangementLibrary.tsx`, `collection.ts` and `studio-lab-demo.ts`, for 2b scoping only.

## 2. Backlog: updated only from independent evidence (v214)
- **Round 228: `published`.** C PASS with `browserVerified` true, plus the gate. **CALM-1b → მზადაა**, so **CALM-1 → მზადაა** (rounds 226–228).
- **Closed (D-29z285):**
  - DUX-R-2, in REVIEW-RECOMMENDATIONS and in `design_ux_recommendations`;
  - B-R225-BACK-TO-START-KEY (C-TITLES-228 and C-KEYS-228, Home);
  - C-R227-01 (C-ROWS-228);
  - C-R227-02 (AN-REVIEW-228).
- **Not closed:** R77-BUTTON-SHORTCUT-SUPERSET stays open (D-29z268).
- **New Tech Lead manual check:** TLM-R228-META-KEYS (Cmd variants on a Mac).
- **The LAB-SMOKE observation** (peak 1.0, 30 full-scale samples) is the existing C-R184-EXPORT-FULLSCALE-INFO class (L7). No new id.
- **DUX-R-4:** partial. The Loop reason is in 2a; (a) is in 2b, with Saba's SABA-B-8 change; the other (b) reasons stay in REVIEW-RECOMMENDATIONS.
- **REGRESSION scope additions:** CALM-1, and CALM-2a if it is done.
- **The architecture checkpoint input:** ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP gains 3 inputs (§3).
- **RETRO-230 input (B-R228-VACUOUS-DELETED-EXPORT, info):** deleting an export can turn an identity assertion into `undefined === undefined`. That passes under vitest and fails only under `tsc` (`tempo.test.ts` T10 in this pre-check). The retro decides whether L23 gets a clause ("a deleted export: grep its importers and run `tsc`, not only vitest"). `lessons.md` is not edited for a 1× observation.

## 3. Rulings
- **D-29z286 (split):**
  - **2a:** 7 app files, all removals or `title` moves, with no new state.
  - **2b:** a new persisted dismiss state and a new render condition ("only before the first clip"). That could pull in the frozen `StudioWorkspace.tsx` (L29), so it is its own stage.
  - The precedent is CALM-1a and CALM-1b.
- **D-29z287 (2a content):**
  - The video-sound fact uses the existing "Original video sound" wording, not the doc's "sound from the video" (L4).
  - The Loop reason goes into the disabled button's `title` through `studioShortcutTitle`, so it still ends in "(Ctrl+L)" and NS5 / C-PARITY hold.
  - There is no BPM placeholder and no "Adds to …" rewording (neither is in Saba's decision 2).
  - The empty monitor is a dark box with no text and no sr-only copy.
  - The dock row keeps 16 px.
  - The deleted strings are removed, not left dead.
- **D-29z288 (gate-228 review):**
  - **S1** (Ctrl vs ⌘ in the tooltips) has now been raised twice. It is recorded as the Saba question **SABA-Q-CTRL-CMD-DISPLAY** (`awaiting_user`), with three options; D-29z279 stands until he answers.
  - **S2:** `braceHint` disappears in 2a; the rest of the hard-coded key text is signal GATE228-S2-HARDCODED-KEYS.
  - **S3** (footer helper in the frozen SW) and **S4** (lookups per render) are signals.
  - **S5** (`toBe(8)`) is kept, for A's reason.
  - **S6** (doc 177 old wording) → `deferred_low_polish`.
  - The architecture note (keep) is a signal.
- **D-29z289:** A-R227-REVIEW-L3-WZ-VISIBLE-NAME is not a CALM-2 item. It stays info and is a polish-pass candidate.
- **D-29z290:** 16 grants. The frozen set holds 1,067 files (§4).
- **D-29z291:** no new checkpoint request. CALM-1's completion is a feature boundary, but ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP (`b-round-225-checkpoint-request.md`) already asks the dialog, keymap and footer questions. It is still pending with root and non-blocking, and it gets GATE228-ARCH-STRINGS-SHORTCUTS, S2 and S3 as inputs. **Root: please run that checkpoint at the next stable boundary.**

## 4. Pre-check (L23)
- **Scratch:** `/tmp/b229` = `git archive 499c821`, outside the repo.
- **App edits:** `b-round-228/precheck-apply.py`. `tsc` errors are only in test files. Biome is clean after `--write`.
- **Sweep** over `app/lib app/components app/hooks app/routes`: 6 files and 10 tests red, all of them copy or key-list pins (`b-round-228/l23-precheck-red.txt`).
- **Plus one typecheck-only collision:** `tempo.test.ts` T10 passes vacuously under vitest (`undefined === undefined`).
- **Test-only fixes:** `b-round-228/precheck-tests.py` plus TH9. The 7 files plus 11 neighbours give 18 files and 319 tests green (`l23-precheck-fixed.log`), with `tsc` rc 0 and Biome clean.
- **Reference diff:** `b-round-228/precheck-scratch.diff` (38 hunks).
- **`e2e/` and `perf/`:** 0 collisions.
- **L31:** the gate-228 times for the files that get new cases are 3.2–4.8 s per file (5 to 12 tests each).
- **Before inventory:** B captured the visible text on the live lab at `499c821` (S0 and S1, both viewports) with `b-round-228/text-inventory/inventory.mjs`. Each state has exactly the 7 own-text entries this round removes. C-TEXT-229 diffs against it.

## 5. Reference (reference-first)
Fetched 2026-10-28 (WebFetch):
- Live 12 manual 6.1 (Overview) and 6.6 (Arrangement Loop);
- 28.1, 28.2.2, 28.2.2.1 and 28.3 (Video);
- 2.2.2 (Info View).

The Control Bar tempo comes from WebSearch result text only; the default value was not confirmed and is not claimed. Rows R1–R6 are in task §3:
- **R3** (no Overview label) is a match.
- **R1, R2, R4 and R5** are listed deviations: an optional BPM; Loop needs a time selection; a docked monitor; a dedicated video track.
- **R4's** "closest to Live's black screen in gaps" is marked as an inference.

No claim of "Live has no helper text" is made; the task says "manual does not describe". No project subagent was consulted: the behaviour needed came from the fetched manual sections, and this is a copy-move stage with no new interaction.

## 6. Consults
- **The advisor (after orientation, before writing).** Adopted:
  - the 2a/2b split with a D-ID;
  - the Loop title through the helper;
  - one wording for the video-sound fact;
  - the 16 px row;
  - no sr-only copy;
  - a budget row that expects an exact decrease, using B's before-inventory;
  - the facts-reachable rows;
  - reference-first fetches;
  - `track-layout` in the covering set;
  - the gate triage with S1 as a Saba question;
  - the 2b planning notes (the L29 render condition, SSR-safe storage, dismiss/reload rows).
- **The advisor before handover:** see §8.

## 7. Feature status and readiness
- `feature-status.md` is updated:
  - round 229 is მუშავდება;
  - round 228 is მზადაა;
  - CALM-1 is მზადაა;
  - the SABA-B-8 and STUDIO-PERFORMANCE rows are updated;
  - TLM-R228-META-KEYS is added.
- **Ready for commit:** round 228 is already published by root (`499c821`). Nothing new is ready until C and the gate pass round 229.

## 8. Final check (after the advisor's final review)
The advisor's final review asked for 5 changes. All are applied:
1. **This section** no longer claims a confirmation before it happened.
2. **VDS4 and LSU8 have fallbacks with no STOP.** B checked the mount facts:
   - `importVideo(api, name)` is at `lane-strings-ui.test.tsx` l.187;
   - the height control is a `separator` named `Height — <name>` (`ArrangementLane.tsx` l.1050, `track-layout.test.tsx` l.1134).
3. **C-BUDGET-229 has an explicit baseline:** B's `before.json`, with 4 lines; the footer comes from C round 228's `geom-after.json`.
4. **S3 says how the range is cleared:** Escape, as in `c-round-228/c228.cjs`, with a state confirmation.
5. **The vacuous T10 pass** is recorded as a RETRO-230 input (§2; backlog `retro_inputs_round_230`).

The store tree was re-checked after the edits: clean, HEAD `499c821`, frozen list rc 0.
