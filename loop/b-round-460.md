# B round 460 → 461 planning (2026-11-12)

**Decision: CONTINUE.** Round 461 is SABA-B-13 test hardening, test-only. The task is `current-task.md`. D-29z1628 records the round-460 result and D-29z1629 the dispatch.

- **Advisor:** available, consulted after orientation and again before closing. Its closing check found that the mutants were proven only under `-t` filters; in a whole-file run M5 stayed GREEN. That led to v3, described below. It also found that the doc lacked the `pending` invariant, gaps in claim tags and in K10, a missing apply check, C7/C8 expected values with no source, root files B had not read, and wording errors in this report. All are fixed.
- **Project agents:** `tech-lead` reviewed the sketch three times (`b-round-460/sketch-review.md`):
  - review 1: APPROVE-WITH-CHANGES on v1; all 7 findings applied;
  - review 2: APPROVE on v2;
  - review 3: **APPROVE** on the dispatched v3, sha `b154ff5396da0d16cc564931836b7f9124694b0eda6583d255cd2179775376f5`. `product-designer`, the reference section and the screen budget do not apply, because the round is test-only with no visible change.
- **Archive:** `tasks/round-460.md` is a byte-identical copy (`cmp` OK). Pre-edit copies are in `b-round-460/`: `backlog-before-461.json`, `b-next-before-461.json`, `feature-status-before-461.md` and `current-task-before-461.md`.
- **Baseline:** gate 460 is `published` with commit `ffd0c7c`, which is the next task's baseline HEAD. The store tree is clean. B edited no store file; all sketch work ran in `/tmp/b461-scratch`.

## Round 460 result, from the evidence
- **C PASS** (`c-round-460.json`: C1–C16, `browserVerified`/`realVerified` true, 0 bugs). Gate 460 published `ffd0c7c`: review COMMIT OK 8.5/10 (`gates/round-460/review.md`), verify green.
- **SABA-B-13 / STORE-2b-ENTRANCE is now მზადაა for Chromium.** Firefox and Safari remain TLM-R459-FIREFOX-SAFARI-ENTRANCE, with Saba, deadline RETRO 465.
- **Closed on matching C rows:**

| Finding | Closed by |
|---|---|
| A-R459-REVIEW-R1 | C12 |
| A-R459-REVIEW-R2 | C4 (E18 green, M23 RED); C did not measure browser listener leaks |
| C-R459-02 | C6 |
| C-R459-03 | C9 |
| TL-R460-2 | C13 |
| TL-R460-3 | C3/C4 |
| A-R459-REVIEW-R6 | C16 |
| A-R459-REVIEW-R7 | C9 |

  TL-R460-1 has no entry of its own in `backlog.json`. Its closure is recorded only in the text of decision D-29z1626, and C13 confirms it; `update-backlog-461.py` closes it only if an entry exists.
- **C's observations:**
  - the CPU-4 `inject` logo runs 249–344 ms, record-only under the C6 ruling;
  - the `click50` gaps are a probe artefact.

  Both are noted; no finding was filed.

## New findings, routed (L7: duplicates get `confirmedBy`, not a new id)
- **A-R460-REVIEW-1 (Medium):** no real `hydrateRoot` unit test. Scheduled for round 461.
- **A-R460-REVIEW-6 and -7 (Low, same file, cost little):** scheduled for round 461.
- **A-R460-REVIEW-2 and -4:** both unverified, because C did not run the optional probes. They go to `deferred_low_polish`, and C may probe -4 optionally in round 461.
- **A-R460-REVIEW-5 (stale code comment) and GATE460-2 (dust particles re-randomized in render):** new Lows in `deferred_low_polish`.
- **`confirmedBy` on existing ids:**
  - A-R460-REVIEW-3 and GATE460-1 on TL-R459-COLOR-BLACK-DEP;
  - GATE460-3 on A-R459-REVIEW-R4 (CSP);
  - GATE460-4 on A-R459-REVIEW-R8. The E11 part is fixed in round 461;
  - GATE460-5 on TL-R459-TEST-NITS. The E8 part is fixed in round 461;
  - the code-reviewer's "fade cut short" note on TL-R459-EXPIRED-CUT.
- **Architecture notes:** both reviewers say keep. They are added to SIG-R459-ENTRANCE-HANDSHAKE as signal only; no checkpoint is requested (single consumer, no repeated structural risk on one owner).

## Why round 461 is this, and not STORE-2b-3c-2b
- **Bug gate:** under the 2026-10-23 gate, a Medium that A can fix inside the loop comes before new scope. The root exemption covers only Mediums waiting on Saba's manual check, and A-R460-REVIEW-1 is not one of those. STORE-2b-3c-2b is Low/info only.
- **Feasibility was proven first.** In jsdom, React 18.3.1:
  - re-renders `head` on the client after a foreign leading node: 3 recoverable errors, a new `<style>`, media from render;
  - keeps the node on a clean hydration.
- **The sketch adds:**
  - E20, E20b, E21, E21b (E21b is labelled a React tripwire, with no source mutant possible);
  - E1b and a stronger E9;
  - the E8 and E11 nits.
- **v3 (row order):** a whole-file mutant run showed M5 GREEN on v2. React's dev build prints a hydration warning once per module, so E20's mismatch made E21's console assert vacuous. v3 moves E21 and E21b before E20 and E20b. The v2 evidence is in `b-round-460/v2-superseded/mutants-whole-v2/mutants.txt`.
- **Evidence:**
  - mutants run on the whole file, as C and the gate run it: M1–M10 RED in their target rows, BASE and BASE-ALL GREEN (`b-round-460/mutants/mutants.txt`);
  - `npm run lint` gives 207 warnings (`precheck-lint.txt`); `git apply --check` OK on the store tree (`apply-check.txt`);
  - covering 3 files / 62 tests, tsc rc 0, Biome clean, 0 hydration noise;
  - with E20 forced to fail, the other hydration rows still pass, so there is no leak.
- **Production gaps** that jsdom does not model (`startTransition`, the whole-`<html>` rebuild, a body mismatch) go into doc 300 and stay covered by browser rows. Round 461 keeps a browser anchor (C7: r1 inject plus a fresh frame on a prod build) and Studio + protection (C8).
- **The doc must keep its `pending`-free invariant:** `grep -ci pending` = 0, and L28 has its own grep (C9). C7 and C8 take their expected values from C's round-460 files on the same app code (K14).
- **Claims:** `b-round-460/claims-461.sh`. The planning and expected-after-A outputs differ only in K3 and K4, and stderr is empty. L58 OK (`b-round-460/l58-check.txt`). The L29 grep gives 6 hits, each a grant path, a planned change or a command argument.

## Other notes
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 (round 3). Their findings were carried long ago, and nothing new is in them.
- **Regression:** due from 2026-11-13. The next round planned on or after that date is REGRESSION-2026-11-13. `regression-last.json` is unchanged.
- **Commit readiness:** round 460 is already published. Round 461's tree becomes publishable after C PASS and the root gate.
- **Not COMPLETE:**
  - STORE-REDESIGN 2b-3c-2b … STORE-5 are open;
  - ARCH-SPLIT, REVIEW-RECOMMENDATIONS, STEM-LANES (`awaiting_user`), T12-ADVANCED and phase 2 are open;
  - open Mediums remain: manual, `awaiting_user` and scheduled;
  - the deferred Lows remain.
- **Not BLOCKED:** no external input is required.
- **Backlog:** version 452 → 453, by scripts `b-round-460/update-backlog-461.py` and `update-backlog-461b.py` (the v3 sha and the R2 wording), each with a `.done` marker.
- **feature-status.md:** header, the SABA-B-13 row and the round 460/461 lines are updated.
