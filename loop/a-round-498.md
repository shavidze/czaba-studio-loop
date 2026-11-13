# A round 498: DPG-BUTTON-CLEANUP-2 stage 2a (status-page CTA links → `buildButtonClassName`)

**Status:** Implemented. The sketch is applied unchanged, doc 320 prose is written, and the code-reviewer has run (8/10, no open Medium+).
**STOP:** none.

## What was done
- Ran frozen checks 1–3 (rc 0), then `git apply b-round-497/sketch-498-v3.patch.txt` (rc 0; the sketch sha256 matched `90786f20…`), then check 4 (rc 0). Checks 1 and 2 re-run after apply: rc 0. Log: `a-round-498/frozen-checks.log`.
- Wrote the doc 320 prose: Georgian, the 7 headings, status line unchanged from the sketch.
- No other edits.

## Changed files (the 8 sketch paths)
M app/routes/checkout.cancel.tsx, app/routes/checkout.success.tsx, app/routes/faq.tsx, app/routes/account.orders.tsx, app/lib/__tests__/store-theme-tokens.test.ts, docs/design/DESIGN_SYSTEM.md
?? app/lib/__tests__/store-button-cleanup-2.test.tsx, docs/implementation/2026/quarter-IV/320-dpg-button-cleanup-stage-2a.md

## Checks run by A (logs in `a-round-498/`)
| Check | Result | Log |
|---|---|---|
| typecheck | rc 0 | typecheck.log |
| lint (repo) | rc 0, 182 warnings, 1 info | lint.log |
| Biome on the 6 code/test paths | rc 0, 5 warnings (= B precheck-biome.log) | biome-scoped.log |
| covering (9 files) | 9 files, 120/120 pass | covering.log, covering-verbose.log |
| scanner `scan-brand.py` | 116 hits; 48 solid | scan-after.log |
| builder calls in the 4 routes | 2+2+1+1 = 6 | (grep, this report) |
| doc 320 backtick class tokens vs HEAD 5d12c75 | every class token found; the only misses are file and log paths, a hash and `restContrast` (harness field) | (loop in this session) |

L11 timeouts: the slowest covering test is BC1b at 1771 ms against its 20,000 ms timeout (9 %). Every other test is ≤ 90 ms against the 5 s default. None is above 50 %.

**Not run by A:** browser rows C1–C7, mutants (C10), claims script (C12), the full suite, build, `npm run verify` (gate).

Final frozen checks after doc 320 (c1, c2 and c4 all rc 0; `git status` shows exactly the 8 paths): `a-round-498/frozen-final.log`.

## Code-reviewer (actual subagent, Sonnet; read-only, no shell)
- **Medium, the doc 320 sections were empty.** Stale: the reviewer read the file before A's prose landed. The prose is now written, so nothing is open.
- **Low, the ST5 orders part no longer counts exactly 1 builder call.** HEAD counted exactly 1 hand-rolled `bg-brand`+`inline-block` attribute, a string that no longer exists. The new block asserts 0 `bg-brand` literals, the builder call, the primary tokens and background = brand-foreground. B2-4 and AO2 pin the link itself. Proposed: assert the builder call occurs exactly once. Not applied (outside the sketch) → For B.
- **Low, B2-5 scans only `className="…"` literals.** It misses template, `{'…'}` and `cn()` forms, and a file with no literals passes trivially. B2-1…B2-4 compare the full class string, so impact is limited → For B.
- **Low, icons kept but not tested.** Proposed: one `svg` per pair link → For B.
- **Low, `DESIGN_SYSTEM.md` l.1112** still says hand-rolled `bg-brand` buttons "remain and move in DPG-BUTTON-CLEANUP-2". That stays true, since 48 solid remain, but it does not mention 2a. Not a sketch hunk, so not edited → For B.
- **Info:** B2-4 duplicates AO1.
- **Architecture note (for B, proposal only):** keep as is. The routes now use the shared builder, which is the right direction. The primary and ghost variant strings are pinned in 3 places (`Button.tsx`, ST5 `BUTTON_UNCHANGED_VARIANT_BLOCKS`, the B2-0 oracles, maybe stage-1 BC tests). Those pins are deliberately independent, and B2-0 catches drift between them. If the variants change again, consider one bounded task for a shared expected-string helper across the button-cleanup tests.

## For B
1. **Status line vs L28 (spec conflict).** The sketch pins doc 320 l.4 as `In Progress (stage 2a of DPG-BUTTON-CLEANUP-2)`. L28 wants `In Progress (stage k of n; C round 498 PASS)`. §3.2 says to keep the status line, C11 checks it, and a non-prose doc edit would be a STOP trigger, so A kept it byte for byte. Precedent: B-R455-DOC298-STATUS-LINE, fixed by a one-line grant. B rules whether round 499 grants l.4.
2. The reviewer Lows above (ST5 count, B2-5 literal forms, icon assert, DESIGN_SYSTEM l.1112).
3. Pre-ruled Lows #1–#5 were not re-raised by the reviewer.

## B acceptance criteria truly passed by A
- §3.1: frozen checks 1–3, the apply and check 4, all rc 0. Pass.
- §3.2: grants respected (8 paths); doc 320 prose has the 7 sections, D1–D4, ST5, evidence and 2b–2e + NONBRAND, and its numbers name their logs. Pass. The class-token grep was run by A; C re-checks it in C11.
- §3.3: typecheck rc 0, lint rc 0, covering 9 files 120/120, code-reviewer invoked. Pass.
- Not claimed: every C row (C1–C13), the browser checks, mutants, claims, and the gate rows.

## Exact next C checks
C0, then the browser rows C1–C7 using `b-round-497/measure/measure-498.mjs` and `nav-498.mjs` against http://127.0.0.1:5173, then C8 (expect 116/48 and 6 calls; A already saw both), C9, C10 mutants, C11 docs (status line per the sketch; see For B 1), C12 claims, C13.

## Scope
DPG-BUTTON-CLEANUP-2 stage 2a implemented only. Stages 2b–2e, NONBRAND, PD-R498-404-SECONDARY-ALIGN and the DP gate remain. The backlog item is not complete.
