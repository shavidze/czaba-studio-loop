# B — Round 236 → 237 planning (2026-10-29)

**Decision: CONTINUE.** Round 237 is **SABA-B-11a-FIX-2**, the seed-status cluster. It was planned at the last planning (D-29z334) to run before SABA-B-11b:
- **A-R234-REVIEW-M1** (Medium), with B-R235-READY-CLOBBER merged into it. The provider's plain-string loading and ready writes overwrite the seed status.
- **GATE234-S2** (Low): the seed search never closes when no source can seed.
- **GATE234-S3** (Low): a leading space.
- **Doc grants:** the bullet in doc 183 (C-R236-02) and two bullets in doc 182.

The task is in `current-task.md`. The round-236 task is archived at `tasks/round-236.md`; it is a new copy, and nothing was overwritten. Decisions: D-29z339…D-29z345. I consulted the advisor before writing.

## 1. Round 236 result (evidence)
| Source | Result |
|---|---|
| `c-round-236.json` | taskStatus **PASS**, `browserVerified` true, `realVerified` true. 16 rows passed, 0 blocked. Gate rows not claimed. Two Lows: C-R236-01 and C-R236-02. |
| `gates/gate-round-236.json` | `published`, commit `ecaf0e4bd9c99081c2db7a4cd97497562d00193d` on both remotes. **This is the round-237 baseline.** |
| `gates/round-236/review.md` | 9/10. No Critical. Five Low suggestions and two Architecture signals. |
| `a-round-236.md` | No STOP. The BR13 extension (MU-L, MU-P) is accepted as additive (D-29z340). The doc-183 ruling request is granted in round 237. |
| `store/` at planning | HEAD `ecaf0e4`, empty status (`b-round-236/git-status-at-planning.txt`). |

**Backlog:** v221 → v222 (script `b-round-236/update-backlog.py`). Before-copies of the backlog, b-next, feature-status, lessons and the checkpoint request are in `b-round-236/`.
- **D-29z339:**
  - GATE235-S1, A-R235-REVIEW-M1 and C-R235-01 are closed by C's browser evidence and the published gate.
  - The round-237 status contract is ruled (§2).
  - New Saba question: SABA-Q-READY-AFTER-ACTION (L44).
- **D-29z340:** these go to `deferred_low_polish`, because they are outside the round-237 grants:
  - C-R236-01;
  - gate-236 suggestions 1 and 2 (GATE236-S1-MIXED-ZONE-DBL, GATE236-S2-RIGHT-CLICK-REF);
  - A-R236-REVIEW-PLAYING-PAST-END.

  C-R236-02 is fixed now as a doc grant. Suggestion 3 is B-R236-END-WORDING, which is already deferred. Suggestion 5 is a note. `deferred_low_polish` has 379 entries.
- **D-29z341:** MU-SR is an equivalent mutant; it is recorded, not required.
- **D-29z342:** GATE234-S2 uses a per-collection memo guard. It cannot be reached in `/studio-lab`, so its row is unit-only, not BLOCKED.
- **D-29z343:** the gate-236 Architecture notes become signals GATE236-ARCH-PLAYFROM-HELPER and GATE236-ARCH-PRESS-TARGET, plus addendum 2 to `b-round-234-checkpoint-request.md`. They are not scheduled.
- **D-29z344:** doc grants 182 and 183, so the SABA-B-11a docs match the code.
- **D-29z345:**
  - no Saba answers have arrived;
  - the Store `direction-decision.md` was already recorded;
  - the regression is not due (it is due on or after 2026-10-30; today is 2026-10-29), and the FIX-2 key acceptance was added to its `scope_additions`;
  - the next RETRO is at round 245.

## 2. Round 237 design
| Item | Ruling | Evidence |
|---|---|---|
| A-R234-REVIEW-M1 + READY-CLOBBER | The context `setStatus` type widens to the reducer's existing `ArrangementStatusUpdate`, and the provider's two writes become functional through pure rules in `collection.ts`. **ready** replaces only the loading text or its prefix. **failed(n)** always wins. **loading** keeps a status that already starts with its own loading text (child effects run before the parent's, so the mount seed was clobbered by `copy.loading` too: B found this when the TU10 sketch failed). | Baseline reproduced **deterministically**: `page.route` delays the two demo MP3s by 4 s, and the pulse Add then loses its status to the bare ready text at ≈5.6 s at both viewports (`b-round-236/probe/readyrace-baseline.json`). Scratch: the exact seed status is kept (`readyrace-scratch.json`). |
| failed(n) | Replace, not append. **This is where I differed from the advisor's open option:** I measured the append variant, and it gives a 2-line, 32 px status at 1280 (`probe/statusbox-append-variant-*`). The seed's facts stay reachable in the BPM field, the Snap state and the BPM title. | D-29z339 |
| GATE234-S2 | `hasAssetTempoSource` memo guard. It does not permanently close the seed, because a later BPM collection must still seed. | TQ1 red on MU-S2 |
| GATE234-S3 | Filter empty parts in the functional write. | TU11 red on MU-F |
| Reference | None found. Live 12 has no documented ready-versus-action status rule; WebSearch on 2026-10-28 (UTC, during this planning) gave no manual section. The binding rule is CALM-2's "facts that move stay reachable". | current-task §3 |
| L23 | Sketch on `/tmp/b236-scratch`: `tsc` rc 0, Biome clean. **121 covering files, 1,715 tests green**, so there is no red pin and no frozen-test grant. 4 required mutants are red, and MU-SR is equivalent. | `b-round-236/precheck-*`, `mutant-*.log` |
| L29 | The race recipe was run at HEAD and on the scratch build at both viewports, with 0 page errors. Two new recipe rules: (1) select the pulse until `aria-selected="true"`, because the first click can land before hydration; (2) do **not** wait for ready in these rows. | `b-round-236/probe/` |

**Scope check.** Nothing is shrunk or deferred without authority:
- the deferred items are Lows under the 2026-10-23 bug gate, and each is listed;
- protected auth and purchase files are frozen;
- `/studio-lab` stays demo-only and anonymous (the Auth row);
- no new persistent text is added (C-BUDGET-237);
- the purchased-origin browser path is backend-blocked and listed as such, with unit coverage in CR1 and `purchased-collection-ui`.

## 3. Ready for commit?
Round 236 is already published (`ecaf0e4`). Round 237 is dispatched, so nothing in `store/` is ready.

The loop state is ready for root's loop-state commit:
- `tasks/round-236.md` and `current-task.md`;
- backlog v222, `feature-status.md` and `b-next.json`;
- the `b-round-236-r237-*` lists and hashes;
- `b-round-236/`, and addendum 2 in `b-round-234-checkpoint-request.md`.

`lessons.md` is unchanged (58 lines). L48's ready-wait remains right for its rows, and round 237 states the inverse explicitly.

## 4. For root and Saba
- **Saba**, new question: SABA-Q-READY-AFTER-ACTION.
- **Saba**, still open: `user-review/AGREE-SABA-B-7.md`, SABA-Q-SCRUB-DOUBLE-CLICK, SABA-Q-TEMPO-UNDO and the round-235 SABA-Q questions.
- **Root:** please run `b-round-234-checkpoint-request.md` (ARCH-CHECKPOINT-TEMPO-GRID, now with addendum 2) **before SABA-B-11b, round 238**. `b-round-231-checkpoint-request.md` is still ready.
- **Policy file:** `docs/technical/studio-real-workspace/agent-workflow.md` on disk still has 87 lines and ends at "Loop v2". As before, I followed the newer prompt snapshot. Please reconcile the file.

## 5. Method notes
- **Scratch:** `/tmp/b236-scratch` (`git archive ecaf0e4`, `node_modules` symlinked), with a Vite server on `:5174`, now stopped.
  - The covering run and the browser probes did not overlap (L38).
  - The shared `node_modules/.vite` cache was re-optimised once; no tracked file changed.
- **`store/`:** never written. At the end, HEAD is `ecaf0e4`, the status is empty, and `sha256sum -c` on `b-round-236-r237-tree-sha256.txt` gives rc 0.
- **Advisor:** consulted after orientation and before writing, and again before handover. I took these points:
  - the baseline is the gate's `commit`;
  - the reducer path;
  - the prefix-swap ready rule;
  - the memo guard;
  - the jsdom deferred-load repro;
  - the doc-183 grant;
  - the Saba question.

  **Where I differed:** the failure rule, which I backed with a measurement.

## 6. Final advisor check (before handover), applied
- **Race validity:** every race row, including the HEAD control, is valid only if the status still reads `Loading the demo collection…` right before the Add. An invalid attempt is repeated with an 8 s delay, at most 2 extra attempts. Without this rule the rows could pass vacuously on a cold compile.
- **L29:** the library failure signal is now named and grepped. It is the text `Error: File failed to load (404)` inside `[data-source-id="demo-hero-music"]`, rendered by `ArrangementLibrary.tsx` l.130–131.
- **Diff check:** `git apply --check -p1 precheck-scratch.diff` on a fresh `git archive ecaf0e4` gives rc 0.
- **Known edge, recorded and not fixed:** a same-origin collection swap during a stale `Loading… <seed>` text keeps that text until the next settle. It cannot be reached in `/studio-lab`. It is stated in current-task §6 and must be stated in doc 185.
- **Dates:** the planning closed on 2026-10-29. The WebSearch ran on 2026-10-28 UTC during this planning.
