# A round 512: DPG-BUTTON-CLEANUP-2-NONBRAND N2 close-out (docs only)

No STOP. B's sketch was applied byte-equal. No `app/` file changed.

## Changed files (this round)
Applied with `git apply b-round-511/sketch-512-docs.patch.txt` (sha256 `ad47fec4…8e25c14` verified). No other edit:
- `docs/design/DESIGN_SYSTEM.md` (M; already M from round 511)
- `docs/design/components/button.md` (M, new this round)
- `docs/technical/components/ui-components.md` (M, new this round)
- `docs/implementation/2026/quarter-IV/330-dpg-nonbrand-stage-n2-purchase-card.md` (untracked; l.4 is `Completed (C round 512 PASS)` per L28)

`git status`: 8 paths, 6 `M` and 2 `??`. `git diff f5d1b9e --stat -- app` is the same 3 files as round 511 (65+/20-). See `a-round-512/frozen-post.txt`.

## Commands and results (logs in `a-round-512/`)
| Check | Result | File |
|---|---|---|
| Frozen 1 (tree 1,425), 2 (protected), 3 (r511 pin), 4 (pre-sha) before apply | all rc 0 | `frozen-pre.txt` |
| `git apply --check` + apply | rc 0 | `frozen-post.txt` |
| Frozen 5 (post-sketch) after apply; 1, 2, 3 again | all rc 0 | `frozen-post.txt` |
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, **174** warnings (unchanged), 1 info | `lint.log` |
| Covering: `npx vitest run --reporter=verbose $(cat b-round-510/covering-files-head.txt) app/lib/__tests__/store-button-cleanup-n2.test.tsx` | rc 0, 7 files, 92 tests; slowest test 765 ms (SF1, store-sidebar-free-r509), below 50 % of the 2,500 ms C7 bar | `covering.log`, ANSI-stripped `covering-plain.log`, `slowest.txt` |
| Stale-string scan (K17 command, live files) | 0 / 0 / 0 | `stale-scan.txt` |
| Doc 330: 7 TEMPLATE headings in order (l.7, 13, 24, 36, 46, 55, 71); `grep -c 'pending\|C round 511 PASS'`; l.4 | in order; 0; byte string present | `doc330-check.txt` |
| Final state after all tools: `git status` + frozen 1, 2, 3, 5 | 6 `M` + 2 `??`; all rc 0 | `frozen-final.txt` |
| Doc ledger (L26) | every changed behaviour sentence mapped to a code fact or an existing test row | `doc-ledger.md` |
| Docs diff | saved | `docs-diff.patch` |

No full suite, no build, no Biome-all: those are gate rows. No mutants were run because no code or test changed. Scoped Biome on the granted Markdown paths: "No files were processed" (rc 1, the paths are ignored by config, `biome-md.txt`). Biome therefore covers no file this round beyond `npm run lint`.

## code-reviewer (actual subagent run; 4 changed files; report in `a-round-512/code-review.md`)
Score 9/10. No Critical, High or Medium findings. Every variant, size, min-width, colour hex, focus rule, Loading text and test id in the changed text matches the code. Three Lows are all inside B's sketch. Per the task, A does not hand-edit the sketch, so they are passed to B:
1. **A-R512-REVIEW-DOC330-HEAD-WORDING** (Low): doc 330 l.22 says the docs were aligned with "HEAD-ის ქცევა". The docs actually describe the N2 working tree, because HEAD f5d1b9e still has the hand-rolled Buy Now (doc 330 l.11 says so). Once the gate publishes, the statement becomes true at HEAD.
2. **A-R512-REVIEW-DOC330-BUTTONMD-CLAIM** (Low): doc 330 l.22 says all three docs named Add to Cart **and Buy Now** as primary. The old `button.md` named only Add to Cart and "Revenue actions", not Buy Now.
3. **A-R512-REVIEW-DECISION-TREE-UNLOCK** (Low): in the DESIGN_SYSTEM decision tree, Unlock Premium is also a direct purchase on the product page (`handleBuyNow`, `PurchaseHeader.tsx:277–282`), but it is primary. The tree gives the right answer only because of its explicit example list. A clause such as "upgrade purchases stay primary" would make the rule explicit.

Reviewer notes, not defects:
- `button.md` and `ui-components.md` list `destructive` in their props tables but have no Destructive block.
- CartButton still has `border` and `min-w-[140px]`. This is the 2 px difference already recorded in doc 330.
- Pre-ruled items 3 and 4 were re-seen: the Disabled row lacks `pointer-events-none`, and the ui-components `disabled` default says `false`.

A fixed the one ledger line cite the reviewer flagged (cart.tsx 389–398). That file is in the loop folder, not the store.

**Architecture note:** none.

## Pre-ruled items seen again (For B; not STOPs)
- Pre-ruled 3: stale content outside the variant claim (SIG-R477-DOCS-OUTSIDE-DESIGN).
- Pre-ruled 4: button.md Primary Text row (PD-R496-PRIMARY-TEXT-TOKEN).

## B acceptance (A part) passed
- §2 step 1: frozen checks 1–4 rc 0; GEORGIAN_DOCS.md read.
- §2 step 2: sketch applied; check 5 rc 0.
- §2 step 3: typecheck rc 0; lint rc 0 with 174 warnings; covering rc 0 (7/92); stale scan 0/0/0; doc ledger written; code-reviewer run.
- §2 step 4: this report.

## Not done / known gaps
- No browser rows. C3–C6 belong to C.
- C5 recording: B-R511-CART-PULSE-REDUCED-MOTION (Low, deferred) is unchanged.
- Gate rows (full vitest, build, Biome-all, verify, e2e smoke) were not run by A.

## Exact next C checks
C0 (8 paths; frozen 1, 2, 3 and 5), C1 (stale scan + read the four sections against `Button.tsx:45–50` and the variants table in `doc-ledger.md`), C2 (doc 330 l.4 byte check, 7 headings, grep 0, ledger), C3–C6 browser rows as in `current-task.md` §3, C7 covering 7/92, C8 claims-512 + L57.
