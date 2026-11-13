# Round 490: SABA-B-17 fix-up. The entrance tests send real scroll events, so an over-broad zoom classifier turns red; C re-verifies the entrance in the browser

**Planned by:** B, at the round 489 → 490 planning on 2026-11-13 (`b-round-489.md`, `b-round-489/checkpoint.md`).
- **Archive:** the round-489 task is copied byte-equal (`cmp`) to `tasks/round-489.md`. B's second copy is `b-round-489/current-task-before-490.md`.
- **Decisions:** D-29z1747 … D-29z1751 (`backlog.json`, `decisions_log_b`).
- **Advisor:** available; consulted before the sketch and at the end (`b-round-489.md`).

## Read first
- **`lessons.md` in full.** Directly relevant:
  - L7, L10, L11 and L22 (rulings and STOPs);
  - L28 (doc l.4), L29 (claims), L38 (timed probes run alone);
  - L52, which gains the new "classifier rows dispatch the real event" clause in this planning;
  - L56, L57, L58 and L60.
- **Claims:** `bash b-round-489/claims-490.sh` (`ROOT=` and `LOOP=` can be overridden).
  - `b-round-489/claims-490-planning-output.txt` is its output on the store tree at planning: HEAD `73f994d` with round 489's sketch v3 applied and uncommitted, 4 paths. **A** runs the script before applying, and the output must be equal.
  - `b-round-489/claims-490-sketch-output.txt` is its output on B's scratch (`ROOT=/tmp/b490-scratch`: a clone at `73f994d` with v3 and this round's v4 delta applied). **C** compares the store tree with it at start and at end; every line must be equal. Only K15 may differ, and only if root rewrote this task.

## Baseline: HEAD `73f994d`, round 489's v3 still in the working tree
- **Gate 489 was `skipped` (C FAIL)** [K1], so nothing was published. HEAD is still `73f994d` (gate 488). The store tree carries round 489's four paths uncommitted: 3 ` M` + 1 `??` [K2].
- **Those four paths are byte-equal to `b-round-488/sketch-489/`** [K3, K4]. Round 489's apply is not repeated; v4 is a delta on top of it.
- **Accepted:** a root-only commit after planning that leaves `git diff 73f994d HEAD -- app` empty, with a note. Anything else is "STOP — baseline differs".

## 0. Why this round (L10: fix-up first)
- **Round 489, C FAIL.** The only reason was **A-R489-REVIEW-NONZOOM-CLASSIFY** (Medium, origin A's code-reviewer; confirmed by C as C-R489-A-STOP-NONZOOM-TEST-GAP, which is recorded as `confirmedBy` per L7, not as a new id).
  - `dispatchScrollGesture` sends a plain `new Event(type)` [K5], which has no `ctrlKey`, `deltaY` or `touches`.
  - S1, S2 and E8c therefore never reach the non-zoom side of the classifiers. Those are `isZoomGesture` in `SpotlightLoader.tsx` and the boot `scroll` handler in `EntranceCover.tsx` [K8].
  - Mutants MA–MD (any wheel = zoom; one touch = zoom, in the overlay and in the boot script; any real wheel unblocked) stayed green: A 61/61 (`a-round-489/review-mutants.log`), and C reproduced MA and MB.
- **The product behaviour was right in every real-browser row of round 489:**
  - C5–C14 (`c-round-489/tree-table.txt`);
  - a real CDP touch swipe: 0 of 24 scroll events while covered (`c-round-489/touch-under-cover.txt`);
  - C15 (`c-round-489/auth.json`).
  - This round changes **no component line** [K3]. Only the test file and doc 316 change.
- **Not done yet:**
  - SABA-B-17-ENTRANCE-3-4S, B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED and B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER stay open until this round's C PASS with `browserVerified` true (V2). Round 489's browser rows are evidence, not a PASS.
  - Round 489's C15 did not exercise `/studio-lab` playback, which the row required. C runs it here (C15).
- No REGRESSION round is due: `regression-last.json` gives 2026-11-13, round 484, so the next is on or after 2026-11-16. The next RETRO is round 495.

## What changes (user-visible)
- **Nothing.** The components are byte-equal to round 489's v3 [K3].
- The user-visible change is round 489's, still unpublished:
  - the entrance lasts at least 3.5 s;
  - a slow first visit inside a 2 s window still plays it;
  - a wheel or touch under the cover skips it without scrolling the page;
  - a zoom gesture skips it but is not blocked.
- No persistent screen element is added (L39 does not apply). This is a test and doc fix-up, so there is no new Reference section (the reference-first rule excludes test-only rounds). Round 489's Reference table is in `tasks/round-489.md` and still applies.

## Rulings (L10, each finding of round 489)
| Id | Ruling |
|---|---|
| **A-R489-REVIEW-NONZOOM-CLASSIFY** (Medium; `confirmedBy` C-R489-A-STOP-NONZOOM-TEST-GAP) | **Fixed in v4.** `dispatchScrollGesture` sends a real `WheelEvent` (`deltaY` 100, `ctrlKey` false) and a `TouchEvent` whose `touches` has length 1. It uses the same `Object.defineProperty` pattern `dispatchZoomGesture` already uses (no type assertion). MA–MD are added to the mutant set (`b-round-489/mutants-490.py`) and are red on B's scratch: MA and MB red at S1, MC and MD red at E8c [K10] |
| TL-R490-F1 sign-keyed zoom survivor (Medium, `tech-lead` delta review) | **Fixed in v4.** The zoom wheel fixture in `dispatchZoomGesture` used `deltaY: -100`, so a classifier keyed on the delta's sign (`deltaY < 0` = zoom) stayed green; a Chromium trackpad pinch-in is ctrl+wheel with a positive delta. The fixture now defaults to `deltaY: 100` [K5b]. New mutants ME (overlay) and MF (boot) are red at S3 and E8e [K10] |
| TL-R490-F1b mirror survivor (Low, `tech-lead` re-review of `6541b85b…`) | **Fixed in v4.** With only a positive delta left, `ctrlKey && deltaY > 0` (block a ctrl+wheel zoom whose delta is negative) survived. S3 and E8e now run over (wheel, 100), (wheel, −100) and (touchmove, 0) [K5b]; mutants MG (overlay) and MH (boot) are red at S3 and E8e [K10] |
| TL-R490-F3 doc probe lines (Low) | **Fixed in v4.** Doc 316 says the one-finger swipe was checked by C in Chromium via CDP, that pinch is jsdom-only, and it names E8d among the plain-`Event` rows |
| TL-R490-F2 doc l.4 says PASS before C (Low) | **Kept by L28** (the loop's rule: the post-PASS form is intended, C checks it byte for byte, the gate skips a C FAIL) |
| TL-R490-F7 a real pinch can start with one finger (Low, product) | **Added to TLM-R489-TOUCH-SWIPE** (real phone): the first `touchmove` of a pinch may carry 1 touch and be prevented. jsdom cannot express it |
| Remaining classifier survivors named by `tech-lead` (`ctrlKey \|\| metaKey`; a touch check written `length !== 1`) | **Ruled Low, recorded, not a STOP.** The contract the tests pin: for wheel, `ctrlKey` alone decides zoom, at both delta signs; for touch, 1 touch = scroll and 2 touches = zoom. Other modifiers (meta, shift) and 0 or 3+ touches are outside the contract; they are listed in `sketch-review.md`, and a finding about them from A's code-reviewer is ruled here (Low, no STOP) |
| A-R489-REVIEW-E8D-LITERAL (Low) | **Fixed in v4** (this round owns the line; costs one token). E8d advances `ENTRANCE_FAILSAFE_MS + ENTRANCE_EXIT_MS` instead of `+ 250` [K6] |
| A-R489-REVIEW-L3-CLASS (Low) | **Deferred** to `deferred_low_polish`. L3's assert uses `classList.contains('pointer-events-none')`, as L4 already did at HEAD. A role- or testid-based assert would need a component change, and this round keeps the components byte-equal. It closes in the polish pass or in the first round that touches `SpotlightLoader.tsx` |
| A-R489-REVIEW-DOC-STATUS (Low) | **Closed, not a defect:** L28 makes the final form intended. v4 rewrites l.4 to `Completed (C round 490 PASS)` (L28 re-dispatch clause) |
| Info: React-path burst (1–2 more blocked events before the commit) | Inside round 489's accepted exit-fade ruling (tech-lead Low 6); no change. Doc 316 l.20 stays true (A read it in full) |
| C-R489-ENV-K17-WEBM-GITIGNORED (info, environment) | **Closed as environment.** `*.webm` is ignored by the loop's `.gitignore:3`, so the recordings do not survive a job. This round's claims cite no `.webm`. Root request **ROOT-REQ-LOOP-WEBM-EVIDENCE**: either keep `user-review/img/*.webm` or confirm that Saba gets the recording some other way. C13 re-records each round until root answers |
| C-R489-ENTRANCE-TOUCH-FIRST-MOVES (info) | A record: on the tree, 0 scroll events while covered, and the rest of the swipe scrolls the visible page, as designed. It becomes row C8t (assert) here; the real phone stays TLM-R489-TOUCH-SWIPE |
| Architecture note (zoom rule twice: boot string and `isZoomGesture`) | **A backlog signal only:** SIG-R489-ENTRANCE-ZOOM-RULE-TWICE. A frontend-architect checkpoint request for `app/components/loading/` goes to root at this feature boundary, after this round passes (ARCH-CHECKPOINT-ENTRANCE-LOADING). Not scheduled as a task |

## 1. What changes (delta sketch `b-round-489/sketch-490-v3-to-v4.patch.txt`, sha256 in `b-round-489/sketch-490.sha256`)
A applies it from `store/` with `git apply ../tmp/studio-real-loop/b-round-489/sketch-490-v3-to-v4.patch.txt`, on top of the v3 tree. The result must be byte-equal to `b-round-489/sketch-490/` (K9 `====`).
1. **`app/lib/__tests__/store-entrance-loader.test.tsx`:**
   - `dispatchScrollGesture` sends the real events (above).
   - `dispatchZoomGesture(type, deltaY = 100)`: the ctrl+wheel fixture takes its delta from the row; S3 and E8e become `it.each` over (wheel, 100), (wheel, −100) and (touchmove, 0). That is 2 more tests: the entrance file has 63, the covering set 94.
   - `ENTRANCE_EXIT_MS` is added to the import list.
   - E8d uses `ENTRANCE_FAILSAFE_MS + ENTRANCE_EXIT_MS`.
   - No assertion is removed or weakened, and no row id is added. S1, S2, E8c and E8d now run on the real event types. Covering run: 4 files, 94 tests (K11; round 489 had 92).
2. **`docs/implementation/2026/quarter-IV/316-saba-b-17-entrance-duration.md`:**
   - l.4 → `**სტატუსი:** Completed (C round 490 PASS)`.
   - The S1/E8c unit bullets name the real event types.
   - One Problem → Solution line for the test gap.
   - The "C round 489 …" line now says what round 489 measured and what 490 repeats, and adds one mutation bullet (30 mutants, all red).
   - The 7 TEMPLATE headings are unchanged [K13].
3. **Unchanged, and must stay byte-equal to v3:** `EntranceCover.tsx` and `SpotlightLoader.tsx` [K3].

## 2. A: grants, forbidden, checks
- **Granted paths (only these):** the 2 files of §1, changed only by the delta patch. A changes no sketch line; a doc 316 line A finds false is a STOP (below), not an edit.
- **Forbidden:**
  - every other path, `EntranceCover.tsx` and `SpotlightLoader.tsx` included;
  - `global_forbidden_files`, including `app/root.tsx` [K7], `app/styles/**`, `app/contexts/AuthContext.tsx` and `app/lib/auth*`;
  - the protected purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`) [K7];
  - `global_forbidden_actions`: commit, push, stash, checkout, reset, deploy, and restarting the :5173 dev server.
- **STOP threshold (the only statement of it; L10):** STOP and report, without editing any line, if:
  - the start check differs (except K15 if root rewrote the task);
  - `git apply` fails or K9 is not `====`;
  - a Medium+ finding (from your code-reviewer, or a failing or slow covering test) is not ruled in this task;
  - a line of doc 316 is false at hand-over;
  - any path outside the grants would need to change.
- **A runs:**
  - the start check `bash ../tmp/studio-real-loop/b-round-489/claims-490.sh`, which must equal `claims-490-planning-output.txt`;
  - after applying: `npm run typecheck`, `npm run lint`, and `npx biome check app/components/loading/ app/lib/__tests__/store-entrance-loader.test.tsx`. Expected: exactly the 3 pre-existing warnings, as in round 489 [K14];
  - `npx vitest run app/lib/__tests__/store-entrance-loader.test.tsx app/lib/__tests__/store-live-teal.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts`. B's run: 4 files, 94 tests (`b-round-489/sketch-490-covering.log`) [K11];
  - the code-reviewer on the 2 changed files.
- **A does not run** the full suite, the build, mutants or browser probes. B ran the full suite on the scratch (`b-round-489/precheck-full-490.log`) [K12], and the gate runs it again.
- **Report in `a-round-490.md`:**
  - the start HEAD and `git status`;
  - the start check;
  - the `git apply` output;
  - K9 and K3;
  - the commands with pass counts;
  - the reviewer findings and its Architecture note.

## 3. C: rows
- **Setup (production builds; never the dev server for timing rows):**
  - **Scripts:** copy `b-round-488/probe/{frames489.mjs,run-matrix.sh,table.py,serve-prod489.sh,record.mjs}` and `c-round-489/touch2.mjs` into `c-round-490/` first (L60).
  - **Tree server:** `bash c-round-490/serve-prod489.sh start <abs c-round-490>/tree 5191 TREE` (`SRC` unset = the store tree), started in the background. **HEAD is unchanged (`73f994d`)**, so the HEAD controls are carried from `c-round-489/head-table.txt` and a HEAD server is not needed.
  - **Mock API:** start it on `:5199` if it is down: `setsid node <loop>/mock-api/server.mjs`.
  - **Matrix:** `bash c-round-490/run-matrix.sh http://127.0.0.1:5191 <abs c-round-490>/tree-m`, run alone (L38), then `table.py` on its `summary.jsonl`.
  - **Reference values:** round 489's tree values are `c-round-489/tree-table.txt`. One environment-invalid run may be replaced twice per row; keep it.
- **Measurement base:** as in round 489. `remDs` = removed − `data-start`, and the floor is asserted on it. `remFc` = removed − the first covered rAF sample, with a looser bound.

| Row | What | Pass when |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all`; `git diff --numstat 73f994d -- app/root.tsx` and the protected files | exactly the same 4 paths as round 489 (3 ` M`, 1 `??`); `root.tsx` and the protected files have no diff (K7 `0 0`); `EntranceCover.tsx` and `SpotlightLoader.tsx` are byte-equal to `b-round-488/sketch-489/` (K3 `= =`) |
| C2 CLAIMS | `bash b-round-489/claims-490.sh` at start and at end; L29's grep over this task | at start and at end every line equals `claims-490-sketch-output.txt` (K15 may differ only if root rewrote this task); stderr empty |
| C3 APPLY | K9 | `====` and the patch sha equals `recorded` |
| C4 COVERING + MUTANTS | A's covering command; `python3 -I b-round-489/mutants-490.py <C outdir> <C scratch: clone at 73f994d + the store diff>`, never on `store/` | 4 files / 94 tests green; C's `mutants-summary.txt` equals `b-round-489/mutants/mutants-summary.txt` (30 lines, no `NONE`, no `BAD-ANCHOR`; MA, MB red at S1; MC, MD red at E8c; ME, MG red at S3; MF, MH red at E8e) [K10] |
| C4b REAL-EVENT ROWS | grep the test file | K5 `plain-event-dispatch 0 real-wheel=1 one-touch=1`; K5b as in `claims-490-sketch-output.txt` (the zoom wheel takes `deltaY` from the row; S3 and E8e list both 100 and −100); S1, S2, E8c and E8d call `dispatchScrollGesture` (no plain `new Event(` left for wheel or touchmove) |
| C5 DURATION 1× | tree `fresh` 1440 and 1280 (cpu 1) | state `live`; `firstCovered` ≤ `fp`; `remDs` ≥ 3450 and `remFc` within [3300, 3800]; `logoFullMs` ≥ 1400; `tagFullMs` ≥ 800; `gapsWhileCovered` 0. HEAD control carried from `c-round-489/head-table.txt` (`remFc` 1596, tag 466) |
| C5b–C12 (carried modes, same matrix) | tree `clientnav`, cpu 4 `fresh`, `net4g` cpu 1/4, `delay800`, `delay3000`, `reload`, `rm`, `blockjs`, `esc50`/`tab50`/`click50`, `esc1500`/`tab1500`/`click1500`, `arrive` | each meets round 489's pass condition word for word (`tasks/round-489.md` §3 rows C5b, C6, C7, C7b, C9, C10, C11, C11b, C12); HEAD controls carried from `c-round-489/head-table.txt` |
| C8 SCROLL UNDER THE COVER | tree `wheel` and `wheel50`, 1440 and 1280 | `scrollY` 0; `logoFullMs` 0 for `wheel50`; `wheel` removed within 1200 ms of `firstCovered`; final state `live` (`wheel`) / `skipped` (`wheel50`). HEAD control carried (`scrollY` 600) |
| C8t REAL TOUCH SWIPE | `node c-round-490/touch2.mjs http://127.0.0.1:5191 100` and `… 1200` (CDP touch, 1280×720, `hasTouch`) | `whileCovered 0` in both runs; the first scroll event comes after the cover or overlay is gone (its 4th field is empty). Round 489's tree values: 24 events, 0 covered (`c-round-489/touch-under-cover.txt`). The real phone stays TLM-R489-TOUCH-SWIPE |
| C13 RECORDING FOR SABA | `node c-round-490/record.mjs http://127.0.0.1:5191 <abs c-round-490>/rec saba-b-17-entrance-after-1440`, then **copy** (never move or delete) the `.webm` into `<loop>/user-review/img/` | the `.webm` and its 3 stills (`-0500`, `-2000`, `-3200.png`) exist in `c-round-490/rec/`; the stills at 2.0 s and 3.2 s show the wordmark. The "before" evidence is round 489's three PNG stills, `c-round-489/rec/saba-b-17-entrance-before-1440-{0500,2000,3200}.png` [K16]. Its `.webm` is gitignored and may be missing. The `.webm` is gitignored (ROOT-REQ-LOOP-WEBM-EVIDENCE): record its size and sha256 in the report |
| C14 HYDRATION | `hydrationErrors` in every tree row | 0 in every row |
| C15 STUDIO + PURCHASE PROTECTION (G490-AUTH) | fresh context, no credentials, both viewports | `/account` shows "Sign in required" with no "Full Name"; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/studio-lab` opens anonymously (`auth_user` null), shows `Demo collection ready`, then Enter on a library item adds a clip (1 clip). Space plays: **assert** the transport state reads `Playing` and the clock reads more than `00:00.000` about 1.5 s later. **Record** the clock value; the regression journey read `00:01.271` (`c-round-482/jn/journey.json` `playState`, `pos`). Space again → `Stopped`. Screenshot per step. **This is the playback half round 489 did not exercise** |
| C16 DOC | doc 316 | l.4 byte-exact `**სტატუსი:** Completed (C round 490 PASS)`; TEMPLATE's 7 headings in order (L26); no `pending`; every cited row id (L3, E1, E6, E6b, S1, S2, S3, E8c, E8d, E8e) exists in the test file; every number in the browser-measurement bullet is in `b-round-488/probe/sketch/table.txt` or `probe/head-matrix/table.txt`; the mutation bullet's "30" equals the line count of `b-round-489/mutants/mutants-summary.txt` |
| C17 LESSON | `lessons.md` | at most 60 lines; `grep -c "real event" lessons.md` ≥ 1 and `grep -c "example number" lessons.md` ≥ 1 (round 489's Saba-issue lesson; `Why we missed it` is in `tasks/round-489.md`) [K18] |
| C18 L57 | `python3 -I tools/l57-check.py c-round-490.json c-round-490/l57-check.txt` | rc 0; every L57 field is written: `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (= `b-round-489/mutants/mutants-summary.txt`), `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch` |
| gate | full vitest, typecheck, build, Biome, `npm run verify` | root gate only; never in `passed` |

- **L22:** if A STOPs with no diff, C runs only C1, C2 and C15 and reports "STOPPED — routed to B".
- **Manual rows (do not block, deadline RETRO 495, L46):** TLM-R489-SABA-ENTRANCE-FEEL (Saba in a fresh tab on the Vercel preview) and TLM-R489-TOUCH-SWIPE (a real phone).
- **Ctrl+wheel browser zoom:** `record` only, as in round 489.

## 4. Sketch review and mutants (L58)
- `b-round-489/sketch-review.md` names the dispatched delta sha256 and the v3 sha it sits on, and records `tech-lead`'s verdict and how B ruled each finding.
- **Mutants:** 30 in total: round 489's 22 (M0–M21, unchanged results; K10 `first22-equal-489=yes`) plus MA–MH. Logs and summary are in `b-round-489/mutants/`. Run them from a clone, never from `store/`.

## 5. Outcome fixed in advance
- **C PASS with `browserVerified` true:** SABA-B-17-ENTRANCE-3-4S, B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED, B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER and A-R489-REVIEW-NONZOOM-CLASSIFY become done. TLM-R489-SABA-ENTRANCE-FEEL stays open and does not block. Root publishes round 489's change together with this one. B sends root ARCH-CHECKPOINT-ENTRANCE-LOADING.
- **Next:** round 491 = B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, then round 492 = B-R488-PASSWORD-MODAL-DIALOG, unless a REGRESSION is due (on or after 2026-11-16).
- **FAIL:** a fix-up first.
- **PARTIAL (time):** the same round resumes from `c-round-490/progress.json`.
