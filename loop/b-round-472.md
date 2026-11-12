# B round 472 → 473 planning (2026-11-12)

**Advisor:** available, and consulted once after orientation. Its points were applied:
- a whole-doc accuracy grant instead of line-only grants;
- a per-line ruling on round numbers;
- the test sha pinned in the claims;
- a semantic doc-vs-test C row plus a browser smoke;
- the TestimonialsSection history checked;
- DPG-FIX recorded but not dispatched;
- the inventory contradiction sent to root.

**Consults:** none. A doc-only fix-up needs no product-designer, tech-lead or Ableton input.

**Archive:** `tasks/round-472.md` is a byte-identical copy of the round-472 `current-task.md` (checked with `cmp` before the rewrite). Backups: `b-round-472/backlog-before-473.json`, `feature-status-before-473.md`, `lessons-before-473.md`, `b-next-before.json`.

## Inputs read
- **`c-round-472.md` / `.json`: FAIL.**
  - `browserVerified` and `realVerified` are true.
  - C1–C11, C13 and C14 PASS. C12 FAIL (C-R472-01, Medium).
  - Backend-only parts are BLOCKED: the C8 stubbed client path and the C13 fake-bearer path.
- **`a-round-472.md`:** STOP on A-R472-REVIEW-M1, which was outside the doc grant. The sketch was applied byte for byte, and checks and mutants equal B's.
- **`gates/gate-round-472.json`:** skipped (C taskStatus FAIL). The baseline HEAD stays `5cd9645` (gate 470).
- **Date:** today is 2026-11-12 and `regression-last.json` is 2026-11-10, so regression is not due.
- **TestimonialsSection:** `git log -S` shows Saba's `a208b4c` (2026-10-02) unmounted it from `_index` [K13].

## Backlog updates (C evidence only)
- **D-29z1667:** STORE-2c-1 is not done. Its browser half is verified at the `app.css` and test shas; only the doc remains. C-R471-01's fix is verified (C10) and it closes on publish.
- **D-29z1668: the ruling on C-R472-01 and A-R472-REVIEW-M1/L1/L2.**
  - The exact text for l.4, l.78, l.79 and l.90 is in `b-round-472/doc306-l*.txt`.
  - A whole-doc accuracy grant is added.
  - l.48, l.94 and l.106 keep "472", because those are true facts.
  - A-R472-REVIEW-L4 goes to `deferred_low_polish`, owner 2c-4.
  - Process finding B-R472-LINE-GRANTS (Low, B) is recorded, plus RC-R472-DOC-GRANT-LINES. The rule is merged into L26, so `lessons.md` stays at 60 lines.
- **D-29z1669: the DPG-FIX block** (P0/P1/P2, all 18 ids) is inserted into `post_current_stage_queue` before the STORE-REDESIGN remainder. It is also noted in `design_philosophy_gate`. Rulings:
  - **DPG P0 comes before STORE-2c-2.** It overrides the D-29z1660 cap of 3 rounds. The intermediate state is visually safe: C5 found no fake bold.
  - **REGRESSION-2026-11-13 still runs first when due.** It is a standing user rule; root may override.
  - **DPG-FONT-RESOLVE is STORE-2c-1…4.**
  - **Root-only and proposal-only parts are flagged:** the primitives, `public/**`, the deleted `email.server.ts`, and the frozen legacy studio CSS.
- **D-29z1670:** the testimonials question goes to Saba (`user-review/questions-round-472.md` Q1). It is not a bug.
- **Root request ROOT-REQ-DPG-GATE-REPORT.** B's grep (`b-round-472/teal-inventory.txt`) finds about 16 teal literals, while the policy says about 100 (61 + 14 in `app.css`). Root is asked for the gate report with file:line. The next B planning also runs a 160–200° hue scan and reads `store-live-teal.test.ts` before sizing P0.
- **Architecture signal:** SIG-R472-TEST-FIXTURE-STACKS (the reviewer's note, a duplicate of SIG-R472-FONT-STACK-DUP). It is not scheduled.
- **Backlog compare:** the same top-level keys. Changed keys: `updated`, `current_task`, `advisor_used_by_B`, `rounds`, `post_current_stage_queue`, `open_findings`, `architecture_signals`, `deferred_low_polish`, `decisions_log_b`, `retro_candidates`, `root_requests_b`, `design_philosophy_gate`. No duplicate IDs. The style is kept: `ensure_ascii`, indent 2, no trailing newline.

- **D-29z1672 (second advisor pass):**
  - SpecialOffers shows no text on the mock data. It stays open evidence (C-R472-EVID-SPECIALOFFERS); DPG P0 planning must add a stub or fixture before it edits `SpecialOffersSection.tsx`.
  - Saba's 2026-11-10 lane resize handle was missing from the backlog. It is now SABA-VIS-LANE-RESIZE-HANDLE (Low, STUDIO-VIS).
  - The other 2026-11-10…12 Saba items were already present: SABA-B-13/14/15, SABA-Q-CTRLK-CONTENT, SABA-Q-GIFTCARDS-HEADER, SABA-B-12, STUDIO-VIS-1…10, ARCH-SPLIT.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` exist but date from 2026-10-07 (round 3). They have no remaining finding that applies to round 473.

## Second advisor pass: changes made
- K7 no longer prints today's date, so C7 cannot fail on a date change.
- A step 4 lists the findings that are already ruled ("report, do not STOP").
- C2 fails only on a contradiction or a granted line that is not byte-exact; omissions and wording are Low. B read doc 306 in full against the test and `app.css`: nothing beyond l.78, l.79 and l.90 is false. The `font-serif` count is 45, as the doc says.
- C5 starts the mock API.
- The claims, `l58-check` (`L58 OK`) and the store status (the same 3 paths) were re-run.

## Dispatch: round 473 = STORE-2c-1 doc fix-up (D-29z1671)
- **A** edits only doc 306: the 4 exact lines plus accuracy corrections. A reviews the doc against the test with `code-reviewer`. No source change.
- **C runs:**
  - C1 scope (3 paths, diff sha `7a5ee8da803b7379`, `app.css` `d3af7582…`, test `bb46efc7…`);
  - C2 doc vs test, semantically;
  - C3 hygiene;
  - C4 unit sanity;
  - C5 a browser smoke on the dev server (fonts on `/` and `/store`, anonymous `/studio-lab`, the locked premium route);
  - C6 auth;
  - C7 claims.
- The round-472 C1–C10 browser rows stand at the same shas.
- **Claims:** `b-round-472/claims-473.sh` → `claims-473-planning-output.txt`: 0 MISSING, `L58 OK` (no sketch).

## Architecture checkpoint
Not requested. This is a doc-only round. A bounded frontend-architect checkpoint is a candidate at the DPG P0 boundary, because `app.css` will take repeated large edits.

## Commit readiness
Nothing is ready yet. After round 473's C PASS, root's gate can publish STORE-2c-1 (rounds 471–473: `app.css`, `self-hosted-fonts.test.ts`, doc 306).

## Next
- **If the next planning is dated 2026-11-13 or later:** REGRESSION-2026-11-13.
- **Otherwise:** DPG-FIX P0 stage 1, planned from the hue scan and any root report.
- **Then:** the rest of DPG P0, root's re-review, P1 (including STORE-2c-2…4), P2, then STORE-2d/3/4/5, ARCH-SPLIT and REVIEW-RECOMMENDATIONS, as queued.
