# B — Round 141 → 142 planning (D-29z107)

Date: 2026-10-24 · Author: B · Advisor: available and used (once before writing; once before finishing).

## 1. Inputs read (as data)
- `context/active-summary.md`.
- `tasks/round-141.md`: archived this run as an exact copy of the round-141 `current-task.md` (sha256 `c45b533e…`; no earlier archive existed). I also read `a-round-141.md`, `c-round-141.md` and `c-round-141.json`.
- `gates/gate-round-141.json`: **published** `6e9f9b1e97d67703ba34e8b2a260a0a5215c3506`, with the same hash on both remotes. This is the round-142 baseline (HEAD; the tree is clean).
- `gates/round-141/review.md`: COMMIT OK, 8/10, verify 166 files / 2481 tests, both builds green. It has 5 suggestions and an Architecture note.
- `env-status.json`: store 200.
- `regression-last.json`: 2026-10-24 (round 122). The next regression is due on or after 2026-10-27, so not now.
- `user-review/ableton-decisions.md` and `design-ux-decisions.md` **do not exist**. There is no strings-split checkpoint result.
- I opened `backlog.json`, `plan.md` and `feature-status.md` only to look up specific IDs.
- I re-measured the V-0.4e source and pins with grep at `6e9f9b1`.
- I ran a read-only Playwright probe of the detail panel on the live dev server (`b-round-141/tools/detail-probe.cjs`). It used no store writes; 0 errors, 0 hydration and 0 forbidden requests.

## 2. Evidence → backlog (only independent C and gate results)
| Item | Evidence | New status |
|---|---|---|
| V-0.4d | `c-round-141.json`: PASS, `browserVerified` = `realVerified` = true. Every browser row ran at both viewports. Real audio: group Mute −179 dB, unmute ≤ 0.03 dB. GEO net 0, LAYOUT 0 px. Gate 141 published `6e9f9b1` | `c_pass_published` → **მზადაა** |
| C-R141-01 (Low) | C screenshot `group1-outer-after-drums-1280-r1.png` | `deferred_low_polish` (198 → 199) |
| C's demo-badge subtraction | `collection.ts` = V-0.5 (`area_addition_d29z96`) | confirmed by B |
| A round-141 deviations 1–4 | C AN-REVIEW + gate review "Good practices" | ratified; the DS2 codepoint form is kept |
| Gate-141 #1 (ST39 `>=`), #5 (doc 117 status) | review.md | folded into round 142 (owned files) |
| Gate-141 #2 (SSR console spy), #3 (ST40 meta pin) | review.md | V-0.5 forward constraints |
| Gate-141 #4 (library mixed) | review.md | library labels in round 142; the rest in V-0.5 |
| Architecture notes (gate + A) | review.md, a-round-141.md | ARCH-R141-DEFAULT-NAME-SEEDS (checkpoint addendum) and ARCH-R141-SSR-TEST-HELPER (signal); not tasks |
| G141-3 fake-Bearer 403 | BLOCKED | open backend evidence |
| Tech Lead | — | R141-T added |

No Critical, High or Medium finding is open.

## 3. Why V-0.4e now, and its shape
`tasks/round-141.md` §8 set this step: C PASS → V-0.4e, re-measured first. Nothing overrides it: the regression is not due, there are no decision files and there is no checkpoint result.

**Measured at `6e9f9b1`:**
- 44 source lines: detail panel 38, `panels.ts` 1, `clip-gain-multi.ts` 1, `library.ts` 4.
- 56 pins in 13 test files; `e2e/` has 0. Three collection files match `დეტალები` only inside V-0.5 load-error copy and are excluded.
- `group.count` ≥ 2.
- `LIBRARY_KIND_LABELS` is part of the search haystack, so this is the only behaviour coupling.

**Rulings (summary; full text in `current-task.md` and plan.md D-29z107):**
- **R1 — one round.** The library gets its own section, mutation (m86) and C row.
- **R2 — module.** New `studioDetailStrings`, plus 4 keys in `studioLibraryStrings`. Exported names stay.
- **R3 — multi-clip note.** It says "The selected clips", not "group", because "group" would collide with `Group N`. This deliberately departs from my round-141 §8 hint.
- **R4 — vocabulary.** The panel uses collapse/expand and a track uses fold. The apply button reads `Set selection`.
- **R5–R7 — formatters.**
  - one `clipGainUnchanged` formatter for 5 sites;
  - plural-safe `clipCount` / `clipGainMembers`;
  - the pending `slice` invariant is pinned.
- **R8 — search.** English kind words match, and Georgian kind words no longer match by kind. This is accepted and tested.
- **R9 — mixed state.** V-0.5 surfaces stay Georgian for one more round, as named.

**Test strength:**
- ST39 goes back to exact.
- ST41–ST44 are exact literals plus a no-Georgian scan of the 4 sources.
- DPS1–DPS4 are rendered DOM pins.
- LB-SEARCH covers the search change.
- Mutations m82–m87.

**C checks behaviour, not only text:**
- DETAIL-STATUS: range apply/invalid, Clip Gain invalid/unchanged/pending/multi, Undo titles.
- CLIP-GAIN-AUDIO: paired RMS −20 dB ± 1 and reset.
- LIBRARY-LABELS: tree, chip and search.
- LAYOUT against B's real-browser baseline (`b-round-141/out/detail-baseline-6e9f9b1.json`). A worse wrap is a FAIL, not a Low.

**Smallest honest UI choices (rationale):** where wording was uncertain, I chose plain English that matches existing CZABA strings ("time selection", "collapsed", "Reset … ", "Unsaved"). There are no layout or class changes. Live's Clip View and Browser are not in the saved capture, so this round makes no Live claim (both rows unconfirmed).

## 4. Planning artifacts written
- `tasks/round-141.md` (exact copy) and `current-task.md` (round 142, V-0.4e).
- Backups: `b-round-141-{backlog.json,feature-status.md,b-next.json,current-task.md,regression-last.json,b-round-136-checkpoint-request.md,plan.md}-before`.
- `b-round-141-r142-grants.txt` (22 entries; the last 2 are new files).
- `b-round-141-r142-tree-sha256.txt` (941 entries; `sha256sum -c` OK).
- `b-round-141-r142-granted-start-sha256.txt` (20) and `b-round-141/r142-granted-start/` (OK).
- `b-round-141-r142-pin-lines.txt` (56 lines) and `b-round-141/raw-pin-grep.txt` (the raw grep, incl. the excluded hits).
- `b-round-141/{tools,out,shots}/` (detail panel browser baseline).
- `backlog.json` v134, with these changes:
  - round 141 result and round 142 record;
  - V-0.4d done and V-0.4e dispatched, with `measurement_d29z107`, `rulings_d29z107` and forward constraints;
  - `glossary_additions_d29z107`;
  - the V-0.5 forward constraints;
  - C-R141-01 deferred;
  - 10 findings/signals recorded;
  - R141-T;
  - `baseline_tree_at_round142`.
- `feature-status.md`: V-0.4d → მზადაა; V-0.4e → მუშავდება.
- `docs/technical/studio-real-workspace/plan.md`: D-29z107 block and ownership line.
- `b-round-136-checkpoint-request.md`: round-141 addendum appended (earlier text unchanged).
- `regression-last.json`: unchanged (due on or after 2026-10-27).

## 5. Request to root (bounded, non-blocking)
I am still requesting the strings-split / test-locator checkpoint from the read-only `frontend-architect`, per `store/.claude/references/architecture-checkpoint.md`. The request is `b-round-136-checkpoint-request.md` plus its addenda, now including ARCH-R141-DEFAULT-NAME-SEEDS. V-0.4 completes with this round, so this is a natural feature boundary for the answer. Recommended timing: answer before V-0.5 ends. V-0.4e is not delayed by it.

**Heads-up:** round 143 will most likely be planned on or after 2026-10-27, which makes it the REGRESSION round (§8 of the task).

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Still open:
  - VISUAL-A V-0.4e, V-0.5, V-1…V-3 and M1/M3/M4;
  - T12-ADVANCED;
  - the 199 deferred Lows;
  - the Tech Lead manual checks;
  - SRW-21 (`deferred_user`);
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED;
  - the regression due 2026-10-27 and the final full regression;
  - Saba's ABL-R/DUX-R answers;
  - the phase-2 go-ahead;
  - backend-only evidence.
- **Not BLOCKED:** nothing external is missing.

## 7. Commit readiness
Round 141 is published (`6e9f9b1`). Root may publish round 142 only after C PASS, the gate's verify and the independent review.
