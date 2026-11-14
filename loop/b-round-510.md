# B round 510 → 511 planning (2026-11-14)

**Decision: CONTINUE.** Round 511 = DPG-BUTTON-CLEANUP-2-NONBRAND stage N2 (PurchaseHeader purchase card). Baseline HEAD `f5d1b9e`: gate 510 is `skipped` ("no real changes"), not `published`, so the baseline stays gate 509's commit. Advisor: available, consulted after orientation (and before hand-off). Consults actually run: `product-designer` (`b-round-510/consult-product-designer.md`), `tech-lead` sketch review (`b-round-510/sketch-review.md`, Verdict: approve). `performance-optimizer` and `ableton-arrangement-expert` were not needed (Store restyle).

## Round 510 acceptance (C evidence only; D-29z1850, D-29z1851)
- `c-round-510.json`: PASS, `browserVerified`/`realVerified` true; rows 1–13 passed (auth guard, real WAV export peak 1.0 / RMS 0.172 at both viewports, screen counts, retro traceability). RETRO 510 recorded as done.
- C's 3 Lows (origin B spec) are in B's own retro text: corrected by an errata section in `retros/retro-510.md` (before-copy `b-round-510/retro-510-before-errata.md`, diff `retro-510-errata.diff.txt`). Status `fixed_pending_C`; C verifies in round 511 row C11.
- Recorded: INFO-C510-COLD-HYDRATION (environment), INFO-C510-RTSABA-OBSERVATION. C's "Space after add" info → the round-382 "no auto-start" ruling was never asked (L44) → SABA-Q-511-SPACE-AFTER-ADD.

## Round 511 (D-29z1852…D-29z1854)
- **Scope:** Buy Now → `Button` buy lg; "Open in Studio" and "Downloads" links → secondary lg builder; CartButton → shape/size/weight only (named exception, product-designer option b). Product byte sketch only (RC-R510-SKETCH-SCOPE trial); A writes tests (N2-1…N2-9, B2C-7/B2C-8/ST5 rewrites) and doc 330 from `b-round-510/test-contract-511.md` v2 (tech-lead Lows folded in, M1–M23).
- **PlayStems out of N2:** unreachable — no producer sets `DisplayVersion.stems`; browser: Premium on harbour-lights → 0 "Play Stems" at 3 viewports. This confirms the round-474 signal SIG-R473-STEMS-PLAYER-DEAD (`confirmedBy`; no new id, L7 — the first draft filed B-R510-PLAYSTEMS-UNREACHABLE, withdrawn at the advisor check, D-29z1855) + question SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE (`user-review/questions-round-511.md`, default remove). ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE superseded (a fixture cannot help). Not a scope cut: the item stays open with its decision owner.
- **Scanner gap:** `motion.*` tags were invisible to the NONBRAND scanner; widened copy (mutant-proven) = 54 at HEAD, only CartButton new.
- **Pre-check:** scratch `/home/runner/b510-scratch` (archive `f5d1b9e` + sketch): tsc rc 0; full suite 305 files, only B2C-7, B2C-8, ST5 fail (granted); lint 174 = HEAD; sketch dev server :5174 with its own Vite cache: state and action probes HEAD vs sketch (`probe/head`, `probe/sketch`): same-line buttons 50/50 at 1440/1280, radius 8, weight 600, POST sets equal, busy width 167, focus ring equal, price-unknown equal. Claims (`claims-511-planning-output.txt`, stderr empty; L58 OK, LEDGER OK).
- **New deferred Low:** B-R510-BUSY-CURSOR-HIDDEN.
- **Advisor closing check (D-29z1855):** DESIGN_SYSTEM.md l.895/l.1174 granted with exact text (they named Add to Cart/Buy Now as `primary`); rewrite helpers allowed and the unused `HEAD_BUY_NOW_CLASS` removed (lint 174); post-sketch pin `r511-post-sketch-sha.txt` (`90435d96…`); C2 widths per viewport; rows C6b hover (record), C6c busy line (sketch PNG), Added/reduced-motion (record); research search recorded (3 hits, none about button style, K24); L29 tags added; CartButton joins SIG-R507 keep list; RC-R510 note median fixed. Claims now K1–K24.

## Architecture checkpoint
None requested: N2 closes no feature boundary and shows no repeated structural risk on one owner. SIG-R507-NONBRAND-KEEP-PRIMITIVES stays a signal (CartButton joins it as an in-cart-state candidate for a later shared variant decision).

## Ready for commit
Nothing new for root to publish from this planning (round 510 changed no source). After round 511 C PASS, root gates the 6 granted paths.

## Files written by B this planning
`tasks/round-510.md` (byte copy), `current-task.md`, `b-next.json`, `b-round-510.md`, `b-round-510/*` (checkpoint, probes, sketch, review, contract v1/v2, consult, claims, pins, scanner, logs, backups `backlog-before-511.json`, `feature-status-before-511.md`, `b-next-before-511.json`), `backlog.json` (v516 → v517; backups `b-round-510/backlog-before-511.json`, `backlog-before-advisor-fix.json`), `feature-status.md`, `retros/retro-510.md` (errata), `user-review/questions-round-511.md`. No store file changed: `git status` empty, HEAD `f5d1b9e`. Mock API started by B for the probes was stopped by PID.
