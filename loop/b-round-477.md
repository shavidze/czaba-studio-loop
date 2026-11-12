# B round 477 → 478 planning

**Date:** 2026-11-12 (`date -u` 20:20).
- **Advisor:** available. Consulted once after orientation and once before hand-off.
- **Project agent consults:** none. This is a docs-only round with no user-visible feature, so `product-designer` and the reference-first rule do not apply.

## Inputs read
- `context/active-summary.md`;
- `current-task.md`, archived byte-identical as `tasks/round-477.md` (`cmp` OK);
- `a-round-477.md`, `c-round-477.md` and `c-round-477.json`;
- `gates/gate-round-477.json`: **published `10791ac`**, which is the new baseline;
- `regression-last.json`: 2026-11-10, next due 2026-11-13, so **not due** on 2026-11-12;
- `lessons.md` L1, L2, L5, L10, L26, L28, L29, L30, L56, L57 and L58;
- backlog entries for DPG-FIX, DP-GATE, GATE460-2, A-R460-REVIEW-5, C-R190-INFO, A-R190-SIGNALS and SABA-B-16 (grep only).

## Round 477 result (C evidence only, D-29z1691)
- **C PASS:** C1–C12, `browserVerified`/`realVerified` true, 0 bugs. The gate published it as `10791ac`.
- **DPG-P0-3a is C-verified but not მზადაა.** Under DPG rule 4 it waits for the DP gate (10/10 from both reviewers).
- **Closed, each on a named C row:**
  - GATE460-2: C3, mutant M7 turns P4 red;
  - A-R460-REVIEW-5: C1, the sketch sha256 includes the comment fix;
  - the portal guard (C-R190-INFO I1, A-R190-SIGNALS #1): C3, mutant M8 turns P1 red.
- **SABA-B-16 stays open,** because the asset is still unnamed.
- **C's notes are recorded as DP-gate inputs, not bugs** (SIG-R477-DP-GATE-INPUTS):
  - the product-page hero image has a white edge-light baked into the asset;
  - the product page shows a brass "Sign In" button.

## Next task: round 478 = DPG-P0-3b (DPG-DOCS-UPDATE)
This is the last DPG P0 stage. It is docs only: no `app/**` change.

- **Scan:** `b-round-477/tools/hue-scan.py` found 82 hit lines in `docs/design` plus the Store `direction-decision.md`. Each line is ruled into one of four classes (D-29z1692):
  1. rewrite;
  2. competitor facts, kept;
  3. dated audits, which get a banner;
  4. not old identity, kept.

  Classes 2–4 form a 27-line residual list, `b-round-477/residual-478.tsv`, compared by content.
- **`--color-obsidian-*` claim:** found in `store/docs/technical/store-redesign/direction-decision.md` l.23 and l.52–55 (K4 = 5 hits) and granted. The loop-root copy of that doc has no such claim.
- **Checkers** (D-29z1694, a stated deviation from L56/L58: there is no sketch, because A writes the Georgian prose):
  - `residual-check.py` and `doc-token-check.py` read `app.css` at run time.
  - On HEAD both are red: K2 `unexpected=55`, K3 `FAILS 156`.
  - On a synthetic compliant tree both are green (`scan/syn-*.txt`).
  - On a one-value mutant the token check is red again (`FAILS 2`).
- **Second advisor pass** (before hand-off). All five blocking points are fixed:
  1. **Full fail list read.** The only hit that was not old identity, the modal backdrop `hsl(0, 0%, 0%, 0.95)`, is allowlisted. DESIGN_SYSTEM l.704, l.840/844 and l.1489, and style-guide l.52, are now named in the grants.
  2. **Name→value rule added.** It catches `buy (#006AFF)`, which the existence-only rule missed because `--color-blue-60` still holds that value. HEAD now has 134 → 156 fails.
  3. **Claims rework:**
     - `STORE_ROOT` override;
     - the banner lives in a single file, `banner-478.txt`, with 0 hue hits;
     - the mechanical parts ran green on a scratch clone (`claims-478-mechanical-scratch.txt`).
  4. **K20: 0 code files read `docs/`.**
  5. **C4 baseline probed** (`c4-computed-head.json`).

  Also done:
  - D-29z1692 notes that it narrows D-29z1684's "51 total";
  - the awwwards glow advice is a signal, SIG-R478-AWWWARDS-GLOW;
  - Georgian colour words: K22 = 0;
  - ROOT-REQ-DPG-PRIMITIVES-PATCH should land before the DP re-run.
- **WCAG:** the new section's ratios are the saved output of `tools/wcag-ratios.py` (`wcag-ratios.txt`, `wcag-section-478.md`).
- **Claims:** `b-round-477/claims-478.sh`, with K1–K23. The planning output is `claims-478-planning-output.txt`; K18 (l58-check) rc 0. C2 in the task lists every "after" value.
- **Out of scope, by name (D-29z1693):**
  - fonts → DPG-FONT-RESOLVE;
  - info and error colours → DPG-COLOR-CONSOLIDATE;
  - `.claude/**` → root;
  - 114 hits outside `docs/design` → SIG-R477-DOCS-OUTSIDE-DESIGN, for RETRO 480.

## Architecture
- **No checkpoint requested.** P0 ends with this round, which is a feature boundary, but the round touches docs only.
- **Root's DP-gate re-run after P0** is the review that applies here.

## Files B changed
| File | Backup |
|---|---|
| `current-task.md` | — |
| `tasks/round-477.md` (copy) | — |
| `backlog.json`, via `b-round-477/update-backlog-478.py` (re-serialised with the file's own `indent=2`, ASCII escapes; 75 diff lines) | `b-round-477/backlog-before-478.json` |
| `feature-status.md` | `b-round-477/feature-status-before-478.md` |
| `b-next.json` | `b-round-477/b-next-before.json` |
| `b-round-477/**` (tools, scans, claims, residual list, WCAG section) | — |

Not changed:
- `lessons.md`. RC-R478-DOCS-NO-SKETCH goes to RETRO 480.
- The store tree. `git status` is clean at `10791ac`.

## Readiness
- **Commit-ready stage:** round 477, already published by root.
- **Order after round 478:**
  1. REGRESSION-2026-11-13;
  2. RETRO 480;
  3. DPG P1, plus the DP-gate findings.
