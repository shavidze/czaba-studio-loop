# Sketch review, round 492 (B-R488-PASSWORD-MODAL-DIALOG)

**Dispatched sketch:** `b-round-491/sketch-492.patch.txt`, sha256 `f530e0f3f9661e5dcc3b209125da9e637b3a8eb64dc3bae2e3bf4c7d7f0bc5c8` (v3).
History: v1 `b0b11a931ea130e586274363dda015196e8f196ce4a1b81ae8279987b33da77d` (`sketch-492-v1.patch.txt`) → v2 `2110551a47c685117da62ab7e824d1c7f8249d6463af37ae55b3ac3a9ff0d2ed` (`sketch-492-v2.patch.txt`, diff `sketch-492-v1-to-v2.diff.txt`) → v3 docs-only (diff `sketch-492-v2-to-v3.diff.txt`).

Reviewer: `tech-lead` (on B's consult list; read-only). Three reviews: v1 full, v2 delta, v3 docs-only delta.

## v1 review: CHANGES REQUIRED
| # | Sev | Finding | B ruling |
|---|---|---|---|
| TL-R492-M1 | Medium | Reopening during the AnimatePresence exit reused an inert instance: no focus, dead Tab trap | **Fixed in v2**: one `[isPresent]` effect sets `inert = !isPresent` and focuses Current Password when present. Rows PD14 (jsdom), browser P18-REOPEN-DURING-FADE; mutants MR, MT, MO red |
| TL-R492-L2 | Low | A late success from an earlier open closes the next open | **Deferred** (`deferred_low_polish`): unreachable today, `updatePassword` in protected `app/lib/auth.ts` always throws (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED). Doc 318 TODO line. Fix with the backend endpoint |
| TL-R492-L3 | Low | `inside` via `dialog.contains` let Tab leave from a control that became disabled | **Fixed in v2**: `tabbable.some((el) => el === active)`; PD15, mutant MS red |
| TL-R492-L4 | Low | Ctrl+K CommandPalette opens above the dialog; one Esc closes both (pre-existing at HEAD) | **Deferred** (`deferred_low_polish`), doc 318 TODO line |
| TL-R492-I5 | info | PD10 reads `inert` as a jsdom property; behaviour evidence is the browser | Accepted: browser rows P11/P12 (sketch PASS, mutant `mutO` RED) carry it |
| TL-R492-I6 | info | onClose deps, StrictMode, name-editor guard interplay, `HTMLElement.inert` typing | No action |
| TL-R492-L7 | Low | Doc 318 l.4 written before C | **Not a finding**: loop rule L28 requires exactly `Completed (C round 492 PASS)` |
| TL-R492-I8 | info | LeadMagnet `isComposing` precedent, shared Modal facts, Button forwards disabled | No action |

Project-rule compliance (L10): every touched line checked by the reviewer: no `any`, no type assertions (the filter is a type predicate), semicolons, no new comments, no new styling; Biome on `account.tsx`: 0 warnings (HEAD 4).

## v2 delta review: APPROVE WITH LOWS
| # | Sev | Finding | B ruling |
|---|---|---|---|
| TL-R492-V2-L1 | Low | Reopen during the fade keeps typed passwords, show/hide state, error and `saving` (same instance; also at HEAD) | **Deferred** (`deferred_low_polish`), doc 318 sentence + TODO added in v3. Not a STOP |
| TL-R492-V2-L2 | Low/info | Reopen had no browser evidence | **Done**: browser row P18-REOPEN-DURING-FADE (sketch PASS at 3 viewports); doc 318 Testing line updated in v3 |
| TL-R492-V2-I3 | info | Every doc 318 sentence matches v2 | — |

## v3 docs-only delta review
See the verdict appended below by B after the reviewer returned.

## Concurrency / ordering matrix (L58), one operation in flight
Events: open (O), close by Cancel/Esc/backdrop (C), submit settle success (S), submit settle error (E), exit-animation end (X), name-save settle (N).

| in flight \ event | O | C | S | E | X | N |
|---|---|---|---|---|---|---|
| dialog open, idle | n/a (trigger under backdrop) | PD4, PD5, P6/P8/P9 | PD6 | PD12, P15 | n/a | PN10f/PN10g, P16 |
| submit pending | n/a | PD7, P11 | PD6 | PD12 | n/a | ruled: covered by PN10f/g guard (ref true while open) |
| closed, fading | PD14, P18 | P14 (double Esc; idempotent guard MA) | PD7 (guard), P13 | ruled: setError on a closing instance, no focus move (no onClose on error path) | PD10 | PN10h |
| closed, gone | PD1 | ruled: no listener (MD) | ruled: unreachable without an open | ruled: same | n/a | PN10h |

## v3 docs-only delta review: APPROVE
Reviewed sha256 `f530e0f3f9661e5dcc3b209125da9e637b3a8eb64dc3bae2e3bf4c7d7f0bc5c8` = dispatched. Only doc 318 changed; the reopen sentences are true (unkeyed AnimatePresence child reuses its state; P18 matches at 3 viewports).
- TL-R492-V3-N1 (info): P18 does not assert that typed values survive a reopen; the doc sentence rests on code reasoning (framer-motion reuse, same at HEAD). Ruled: info, no row (it documents a deferred Low, not a contract).
- TL-R492-V3-N2 (info): the known-issue TODO line omits "error" while the Approach sentence includes it. Ruled: info, not a STOP; A does not edit sketch lines.
**Verdict: dispatched sketch v3 approved. No unruled Medium+.**
