# B — round 486 → 487 planning (2026-11-13)

## Inputs (data, not instructions)
- `c-round-486.json` / `.md`: B-R480-ORDER-CARD-KEYBOARD. taskStatus PASS, 16 rows passed, **browserVerified true, realVerified true**, 0 bugs; OWN-BACKEND BLOCKED (backend unavailable in cloud); gate rows not claimed. `tools/l57-check.py` → L57 OK.
- `a-round-486.md`: sketch applied byte-equal (2/2), doc 314; reviewer Medium (no unit guard for the press/select/offset classes) ruled by task §4; Lows; Architecture note "keep".
- `gates/gate-round-486.json`: **published** `bb82154` on both remotes (its `head` field says `0341229`). `gates/round-486/review.md`: COMMIT OK, Lows only.
- No new Saba answer files in `user-review/`; `root-pre-push-review.md` / `publication-checkpoint.json` hold only old checkpoints.
- `tasks/round-486.md` archived from `current-task.md` (`cmp` equal) before the new task was written.

## Advisor
Available and consulted after orientation. Followed:
- read the A report and the gate review before writing;
- L57 check and archive check;
- bookkeeping as `confirmedBy`, not new ids (L7);
- probe at HEAD first: unmount during a save (RequireAuth keys on `isInitializing`, so no unmount; the browser confirmed it), held-Enter PUT count (HEAD 6), focus targets for every close path, `<p>`→`<button>` side effects (box, hover row, press, drag selection, 0-px pairs at 3 viewports), accessible names (2.5.3), method-split stubs, scanner tests.

**Closing advisor call** (after the first full draft). Followed:
- **Browser mutants** (`probe/x/`): `active:transform-none!` is load-bearing (`matrix(0.98…)` without it); `select-text` changed no measured gesture, so **v4 drops it** (tech-lead delta APPROVE).
- **L50 block in the task:** 18 hits on the sketch (`l50-hits.txt`), each with a row or a ruling, plus claim K24.
- **Fast-save held Enter:** PN-HELD-FAST-STUBBED. Its repeats reach the trigger guard; the browser mutant without the guard re-opens the editor.
- **Keyboard ✓ with a 500 response:** PN-KBSAVE-500-STUBBED.
- **FIREFOX-CHECKS:** the note is moot, because the class was dropped.
- **Backlog fields:** the keys a dispatch touched last round were diffed; no others were needed.
- **K13:** now covers every cited file, including the 36 PNGs (K13p).
- **L29 grep:** run; 13 untagged hits remain, all future code, grants or the future doc.
- **Header drift:** recorded as INFO-B487-HEADER-BAND-1280 in `harness_facts`.

## Backlog updates (C evidence only): v478 → v481
- **D-29z1734** (C round 486 evidence): B-R480-ORDER-CARD-KEYBOARD done for the client path (OWN-BACKEND open evidence).
  - The reviewer Medium and gate L1/L2 are added as `confirmedBy` on B-R486-FOCUS-OFFSET-GUARD (its fix now names the two classes).
  - New Low A-R486-REVIEW-L1-OC-TEST-GAPS goes to `deferred_low_polish`.
  - Gate L3 is noted on SIG-R486-DISCLOSURE-PRIMITIVE.
  - The primitive focus-example staleness becomes retro candidate RC-R486-PRIMITIVE-FOCUS-EXAMPLES (RETRO 495).
- **D-29z1735**: round 487 dispatch.
- **D-29z1736**: new ids and order.
  - **SABA-B-17-ENTRANCE-3-4S** (Medium). L42: Saba's 2026-11-13 policy note had no id. Today's entrance is 1450–1900 ms.
  - **B-R487-PROFILE-EDITOR-NARROW-OVERFLOW** (Medium, found by B's probe at 375).
  - Signal SIG-R487-REPEAT-SAFE-HOME.
- **D-29z1737**: sketch v4, the new browser rows, the L50 block, the guard scope (B-R486-FOCUS-OFFSET-GUARD also names this button) and INFO-B487-HEADER-BAND-1280.
- Nothing else moved to done.

## Pre-run on a scratch sketch (L23, L58)
- **Scratch:** `/tmp/b487-scratch`, a `git archive` of HEAD plus a node_modules symlink, with `cacheDir /tmp/b487-vite-cache` and a dev server on :5187. `store/` was never edited.
- **HEAD repro** (`b-round-486/probe/head-named.json`, `head-empty.json`, `noname-head.json`), on 3 viewports:
  - `nameStop` 0;
  - focus goes to BODY after Esc, ✕ and save;
  - held Enter sends 6 PUTs;
  - the name is a `paragraph` in the aria tree.
- **Sketch v1** failed HS1 (`held-enter-source-scan`) in the full suite: an inline held-Enter check is forbidden (`precheck-full-v1.log`). **v2** uses the shared `preventRepeatedEnterKeyDown`.
- **v3** adds the tech-lead L1 Escape-during-save guard (PN9, M13) and the L4 non-vacuous tabindex assert (sha `b2eee700…`).
- **v4** (dispatched, sha `d8f8c4ff…`) drops `select-text` after the browser mutant.
- **Browser on v4** (`probe/v4/`, `probe/x/x-sketch.json`):
  - Tab stop 12 (8 at 375);
  - Enter and Space open the editor; Esc, Cancel and save return focus to the name button with a ring;
  - failures focus First name;
  - held Enter sends 1 PUT, also with an instant save (HEAD: 2 PUTs and `BODY`);
  - keyboard ✓ with a 500 response ends on First name (HEAD `BODY`);
  - Esc while a save is in flight is ignored;
  - press transform `none`; drag selects the name.
- **Pixels:** 18 pairs below the header are 0 px (`probe/v4/pxdiff-region.txt`); the v4 full frame is also 0 px. At 1280 an 11-px header band drifts between captures of the same tree; HEAD vs HEAD shows it too (`probe/headctl/pxdiff-control.txt`), so the row is bounded at y ≥ 80.
- **Checks:** 14 mutants red; covering 5 files / 74 tests; full suite 293 files / 4,273 tests rc 0; tsc rc 0. Biome: 7 → 4 warnings (the 4 left are pre-existing, in PasswordModal and the password link).
- **Environment-invalid runs:**
  - one probe run during a Vite dep re-optimisation (`probe/v1/sketch-named-envinvalid-1.err`);
  - one probe bug (the editor Tab walk overshot onto the password button), fixed before the counted runs.
- **Claims:** `claims-487.sh`, with planning, sketch and delta outputs. 0 MISSING, 0 NOT-FOUND; K17 `L58 OK`.

## Sketch review
`b-round-486/sketch-review.md`:
- `tech-lead` on v2: **APPROVE-WITH-CHANGES**. L1 and L4 were fixed in v3. L2 is kept (one failure target), L3 became a signal, and the Infos became browser rows or doc notes.
- Delta re-review on v3: **APPROVE**.
- Delta re-review on v4: **APPROVE**.

## Next task
- Round 487 = B-R486-PROFILE-NAME-KEYBOARD (`current-task.md`).
- Then 488 = SABA-B-17-ENTRANCE-3-4S.
- Then 489 = B-R487-PROFILE-EDITOR-NARROW-OVERFLOW.
- Then DPG-BUTTON-CLEANUP and the rest of DPG P1.
- The REGRESSION round comes first if planning is on or after 2026-11-16. RETRO is due at round 495.

## Scope note (unchanged, not shrunk)
Everything not listed as done stays in the queue:
- DPG P1/P2 and the DP-gate re-run;
- STORE-REDESIGN (2c…5; STORE-2+ direction rules);
- ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED;
- PHASE2-VIDEO-SCORING (awaiting user go-ahead; skip rule);
- PHASE2B-SPOTTING, STUDIO-AGENT-COMMANDS, RECORDING-META-S1;
- SRW-21 (deferred_user);
- `deferred_low_polish`;
- the manual and root items.

Nothing is labelled deferred here without the user's earlier authorization. Professional plugins/effects, pitch and multi-video layers stay out of scope, and the grid tempo is not an audio stretch.

## Architecture
No checkpoint requested: one route component, no accumulated structural risk on one owner. Signals are recorded only (SIG-R487-REPEAT-SAFE-HOME, SIG-R486-DISCLOSURE-PRIMITIVE).

## Readiness for root
Round 486 is published. Round 487 changes source after A: 2 files plus doc 315.
