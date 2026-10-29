# B round 253 → 254 planning (2026-10-29)

**Decision: CONTINUE.** Next task: **round 254, SABA-B-10b**, the visible flashing insert marker and the transport rows of the shortcut sheet (`current-task.md`). Decisions: D-29z467…D-29z474.

**Advisor:** used once before writing. Its points were adopted:
- the baseline is `c65e5e9`;
- the expert consult comes before the grants;
- marker/playhead distinguishability under reduced motion;
- the render-budget ruling;
- defer C-R253-01 unless the predicate can be mirrored exactly. It cannot, so it is deferred.

**Consults:**
- **`docs-explorer`:** fetched the Live 12 manual chapters 6 and 42.
- **`ableton-arrangement-expert`:** it had no web access and confirmed only the 6.9 quote stored in the repo. Its other answers were UNKNOWN, and it invented nothing.
- **B's own check:** B then fetched both manual pages with curl and grepped every "insert marker" sentence. The quotes in task §3 are verbatim.

## 1. Inputs read
- `tasks/round-253.md`: the archived copy of the round-253 task, made at the start of this planning. Nothing was overwritten.
- `a-round-253.md`
- `c-round-253.md` and `c-round-253.json`: PASS, `browserVerified` true, `realVerified` true.
- `gates/gate-round-253.json`: **published**, commit `c65e5e9`. That commit is the next baseline.
- `gates/round-253/review.md`: suggestions S1–S5 and an Architecture note.
- `lessons.md`
- `context/active-summary.md`
- `regression-last.json`: 2026-10-27.
- The backlog entries by ID.
- `transport-grid-review.md` §2 and §4.2 (10b).
- `reference/youtube/SABA-B-9-10-11-transcripts.md`.

**Snapshots before editing:** `b-round-253/*-before-254`.

## 2. Backlog changes from independent C evidence only (D-29z467, D-29z468)
**C round 253 PASS (15 rows) + gate 253 published:**
- **SABA-B-10a → done** (rounds 249–253).
- **Closed:**
  - C-R235-02
  - B-R250-NAV-ORIGIN
  - B-R250-PLAYHEAD-TITLES
  - B-R251-PASTEND-AT-END
  - B-R236-END-WORDING
  - A-R251-REVIEW-IM22-PLAYING
  - C-R252-01
  - C-N252-FOLLOW-TITLE
  - B-R253-STALE-PLAYING-STATUS. Its C-reproduced residual is split out as **B-R253-STALE-PLAYING-STATUS-RESIDUAL** (Low, deferred).

**New findings and their routing:**

| ID | Severity | Route |
|---|---|---|
| C-R253-01 | Low | `deferred_low_polish`. The refusal predicate (`startPlaybackAt` l.1339–1346: `loopActive`, `endedHere`) is context-private, and a copy in StudioWorkspace could disagree. The fix needs the exported resolver (checkpoint question 2). A-R253-REVIEW-PASTEND-COPY is merged into it. |
| A-R253-REVIEW-STRICTMODE-REMOUNT, -PASSIVE-EFFECT, -STOP-PATHS-UNIT | Low | `deferred_low_polish` |
| GATE253-S1, GATE253-S4 | Low | `deferred_low_polish` |
| GATE253-S2, GATE253-S3 | Low | Merged into A-R252-REVIEW-PLAYING-SOURCE (same root cause). |
| GATE253-S5 | info | Recorded only. |
| INFO-C253-ESCAPE-NO-STOP | info | The round-253 §6 premise "Escape stops playback" was false. This is L29 evidence; L29's evidence line was extended, with no new lesson line (`lessons.md` 58 lines). |
| A-R253-STOP-RENDER-BUDGET | STOP | Ruled (D-29z471): round 254 declares `{ timeout: 15_000 }` on that test. |

- **Architecture signals:** GATE253-ARCH-STATUS-SCOPE and A-R253-ARCH-ISPLAYING-EFFECT are recorded as signals, not tasks.
- **Lows total:** `deferred_low_polish` now has **421** entries.
- **Neither severity is Medium+**, so no bug blocks new scope. Under the 2026-10-23 bug gate, the new Lows are deferred.

## 3. Why SABA-B-10b now
- **REGRESSION is not due.** The last regression was 2026-10-27, which is 2 days ago, and the rule needs ≥ 3. It is due at the next planning on or after 2026-10-30 and goes first then. Its `scope_additions` now carry the rows of rounds 252–254.
- **10b is the next stage in Saba's agreed order** (10a → 10b → 9 → 11c). No AGREE step is needed: the stage is already agreed, and root read its transcripts.
- **Scope kept whole except one deliberate move.** Double-click Stop needs the Stop button, which SABA-B-9 creates. It moves to SABA-B-9's `scope_additions`. This is not a deferral: it is the review's own note (§4.2: "B-9 adds Stop, B-10 gives it behaviour").

## 4. Pre-check (L23) and browser probe
Scratch `/tmp/b254-scratch` = `git archive HEAD` + `b-round-253/precheck-sketch.diff`. Results in `b-round-253/precheck-fails.txt`.

- `tsc` rc 0.
- **Arrangement + components:** 165 files, 2,411 tests. 2 fail, both in `shortcuts.test.ts`: SC1 (row order) and SC5 (the aria count 9 → 11). Both are granted.
- **Collision found and designed out:** `@keyframes` inside `@theme` turned **ST2/ST3/ST4 of the frozen `store-theme-tokens.test.ts`** red. The keyframes now sit outside `@theme`, and all 7 css-reading files pass (94/94).
- **Chromium probe** on a scratch dev server at :5180, now stopped; the main :5173 server was untouched and still answers 200. Results in `b-round-253/probe/scratch2.json` and 8 screenshots.
  - **Blink:** the visible ink line blinks 1 ↔ 0.25 on a 1.2 s cycle.
  - **`reduce`:** static at opacity 1.
  - **The two lines:** separate.
  - **Contrast:** 14.8:1 and 15.6:1 against the backgrounds measured under the line.
- **Environment note:** the scratch Vite server re-optimised deps into the shared `store/node_modules/.vite` cache, because `node_modules` was a symlink. This is not app source. The main dev server stayed healthy (200) after the probe.
- **L50:** 20 hits in grant 1, unchanged. The line is `pointer-events-none` and `aria-hidden`, so the ruling is "no focus impact".

## 5. Saba questions and checkpoint
- **SABA-Q-10B-MARKER-LOOK** (`awaiting_user`, non-blocking, L44), four deviations:
  - (a) ink, not blue;
  - (b) full height, not per track;
  - (c) visible while playing (the manual is silent);
  - (d) hidden while a time selection exists.
- **`b-round-253-checkpoint-request.md`:** ARCH-CHECKPOINT-TRANSPORT-POSITIONS for root, with questions 1–5 including the resolver for C-R253-01 and the status lifetime. Non-blocking. This is the 10a/10b feature boundary that D-29z440/D-29z451 named.

## 6. Files written by B
- `current-task.md` (round 254)
- `tasks/round-253.md` (archive copy)
- `backlog.json`
- `feature-status.md`
- `lessons.md` (L29 evidence only)
- `b-next.json`
- `b-round-253-checkpoint-request.md`
- **Round-254 baseline files:** `b-round-253-r254-{grants.txt, grants-start-sha256.txt, tree-sha256.txt (1,103), root-files.txt, root-files-start-sha256.txt}`
- **The `b-round-253/` folder:** snapshots, `covering-254.txt` (132), `head-at-planning.txt`, `git-status-at-planning.txt` (empty), `r254-granted-start/`, `precheck-*` and `probe/`

**No app source was modified;** `git status` in `store/` is empty. `regression-last.json` is unchanged.

## 7. Commit readiness
Rounds 252–253 are already published (`c65e5e9`). Nothing is pending for root from this planning except the non-blocking checkpoint request.
- Post-advisor additions: stopped SFX-lane recipe run at HEAD (b-round-253/probe/lane-click-baseline.json, marker 2.000 both viewports); range-cleared-elsewhere rule in task §1.1; L28 grep (one hit, doc 176, PERF stage, unrelated); e2e grep 0 hits.
