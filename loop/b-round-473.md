# B round 473 → 474 planning (2026-11-12)

**Advisor:** available, and consulted once after orientation. Its points were applied:
- the baseline is `58fc56e`, not the stale context sha;
- the date check: regression is not due;
- the `app.css` teal history was checked against the "~100" claim;
- a per-DPG-id inventory;
- live code before dead code;
- the pinned tests were pre-run on a scratch copy (L23);
- frozen and root-only parts become questions;
- the scanner was proved on mutants (space-syntax rgb, 8-digit hex);
- after C PASS the DPG ids wait for the DP-gate re-review;
- the DPG process rules were merged into lessons.

**Consults:** `tech-lead` reviewed the sketch: APPROVE with three test changes, all adopted (`b-round-473/sketch-review.md`). No `product-designer` consult, because P0-1 changes nothing visible on reachable pages; P0-2 and P0-3 will consult it.

**Archive and backups:** `tasks/round-473.md` is byte-identical to the round-473 `current-task.md` (checked with `cmp`). Backups are in `b-round-473/`: `backlog-before-474.json`, `feature-status-before-474.md`, `lessons-before-474.md` and `b-next-before.json`.

## Inputs read
- **`c-round-473.md` / `.json`: PASS.**
  - `browserVerified` and `realVerified` are true. C1–C7 PASS, with 0 bugs.
  - The C6 real-owner path is BLOCKED (backend unavailable in cloud).
  - One Low note, about doc 306 l.114/l.116.
- **`a-round-473.md`:** done with no STOP. Doc 306 only. The reviewer's FN4 source notes are proposals.
- **`gates/gate-round-473.json`:** published `58fc56e` (rounds 471–473) to both remotes. That is the baseline. The store tree is clean.
- **Date:** today is 2026-11-12 and `regression-last.json` is 2026-11-10, so regression is not due. It falls due on 2026-11-13.

## Backlog updates (C evidence only)
- **D-29z1673:**
  - STORE-2c-1 is done: C-472 C1–C10 (browser) at the same `app.css` sha, plus C-473 (doc), and published.
  - C-R471-01 and C-R472-01 are closed.
  - New deferred Lows, owner 2c-4: C-R473-01 and A-R473-REVIEW-FN4-SOURCE-NOTES. Both are distinct from SR-472-L2 and A-R472-REVIEW-L4.
- **D-29z1674: DPG P0 inventory** (`b-round-473/dpg-inventory.md`).
  - A 160–200° hue scan of `app/` finds 41 hits at `58fc56e`. The policy's "61" equals the hue-scan total of `app.css` at `a8599a2`, before STORE-2b-3 (K15). The review most likely read that tree.
  - P0 is split three ways: P0-1 teal and tokens, P0-2 the undefined tokens, P0-3 SpotlightLoader and docs.
  - ROOT-REQ-DPG-GATE-REPORT now carries the commit history.
- **D-29z1675: rulings** (replace in place, redefine, delete the decorative tokens).
  - The frozen legacy Studio teal becomes SABA-Q-DPG-LEGACY-STUDIO-TEAL (`user-review/questions-round-473.md` Q1). The default is "stays until SRW-21".
- **D-29z1676:** StemsPlayerModal can never open. This is signal SIG-R473-STEMS-PLAYER-DEAD.
- **D-29z1677:** the dispatch.
- **New root request:** ROOT-REQ-DPG-PRIMITIVES-PATCH (`DESIGN_TOKENS.md` l.9, l.26, l.108).
- **New retro candidate:** RC-R473-POLICY-COUNT-STALE.
- **Lessons:** the DPG process rules (exhaustive hue sweep, docs in the same round, a visual block is done only after the DP gate, primitive staleness at RETRO) are merged into L2. `lessons.md` stays at 60 lines.
- **`feature-status.md`:**
  - round 473 is მზადაა, and STORE-2c-1 is მზადაა;
  - round 474 is მუშავდება;
  - a DPG-FIX row is added (it was missing; L42);
  - C-R471-01 and C-R472-01 are struck as closed.
- **Backlog compare:** the same top-level keys. The style is kept: `ensure_ascii`, indent 2, no trailing newline. There are no duplicate ids (the script asserts this).

## Dispatch: round 474 = DPG-P0-1
- **Sketch:** `b-round-473/sketch-474.patch.txt`, with 50 changed lines in 4 files. It applies to HEAD with rc 0.
- **Scratch pre-run** (14 covering files): exactly LT3, LT5, LT7, TS2 and ST3 turn red, with 5 failed and 147 passed. These are the expected collisions, and all are granted.
- **After the sketch,** the hue scan leaves 20 hits. All of them are frozen legacy Studio code or non-colour words.
- **A:** applies the sketch, edits the 3 tests (shrink only; GR1; HUE1–3), writes doc 307, and runs typecheck, lint, the 14 files, `npm run build` and 4 mutants.
- **C:**
  - C1 scope; C2 hue scan; C3 mutants; C4 unit;
  - C5 browser no-change against HEAD at both viewports;
  - C6 injected-rule probe; C7 contrast (8.32:1, arithmetic);
  - C8 doc; C9 auth; C10 claims.
- **Claims:** `b-round-473/claims-474.sh` → `claims-474-planning-output.txt`, with 0 MISSING.

## Architecture checkpoint
Not requested now. A bounded `frontend-architect` checkpoint on the `app.css` and `utilities.css` structure (dead rule families, duplicate utilities: DPG-CSS-DEDUP) is requested from root at the end of DPG P0, before P1's DPG-CSS-DEDUP and DPG-BUTTON-CLEANUP. Those two stages restructure the same owner.

## Commit readiness
Nothing new is pending. Rounds 471–473 are already published (`58fc56e`). Round 474 can be published after C PASS and the gate.

## Next
1. **If the next planning is dated 2026-11-13 or later:** REGRESSION-2026-11-13 first, with its `scope_additions`.
2. **DPG-P0-2:** the undefined tokens. This is live and visible, so `product-designer` is consulted, and the docs change in the same round.
3. **DPG-P0-3:** SpotlightLoader with SABA-B-16, plus DESIGN_SYSTEM.md and the primitives patch to root. Then root runs the P0 re-review.
4. **Then:** P1 (including STORE-2c-2…4 as DPG-FONT-RESOLVE), P2, then STORE-2d/3/4/5, ARCH-SPLIT and REVIEW-RECOMMENDATIONS, as queued.
