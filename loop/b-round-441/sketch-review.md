# Sketch review — round 442 (SYS-3 stage 1)

Dispatched sketch: `b-round-441/sketch-442.patch.txt` sha256 **0715fbdfba298ef17c8f1fcefbb9faee170171811b60d67764d2c231af2dc0d5** (v2).
Reviewed: v1 sha256 ff1650775c51026f357e067b5c9bbaafe4a251fe3065a7ab1746b7cb39e65d8c (full review), then the v1 → v2 delta re-reviewed on sha256 0715fbdfba298ef17c8f1fcefbb9faee170171811b60d67764d2c231af2dc0d5 (both by `tech-lead`, read-only). Reviewed = dispatched.

**Verdict: approve. 0 Medium+ on v1 and 0 Medium+ on v2.**

## v1 full review (tech-lead)
- Low 1 — no real-browser run of the sketch. **Fixed by evidence:** `probe/compare-sketch.txt` ALL OK (18 cells, 1440×900 and 1280×720), `probe/compare-head.txt` NOT ALL OK (18 of 18).
- Low 2 — the Detail To field was untested. **Fixed in v2:** IME4 sends a composing Enter to both `arrangement-detail-start` and `arrangement-detail-end`.
- Low 3 — `as unknown as` in IME0 (CLAUDE.md: no type assertions). **Fixed in v2:** the helper takes the structural `ImeCompositionKeyEvent` type, and IME0 passes plain objects.
- Ruling (a), accepted: in the Marker and Group editors the guard sits after `stopPropagation()` and before `preventDefault()`. Ancestors see what they saw at HEAD, and the browser finishes the composition. NOSTOP and PD mutants are red.
- Ruling (b), accepted: keep `keyCode === 229`. Safari's committing Enter arrives with `isComposing` false and keyCode 229. Android soft keys that send 229 carry `key: "Unidentified"` and never reach an Enter/Escape branch. The rare false positive is mild (the Enter does nothing; blur still commits). The platform half goes to the Tech Lead list (TLM-SYS3-IME-PLATFORMS).
- (d) Window and document listeners: no new exposure. The capture listeners run before the target. `StudioWorkspace` `handleKeyDown` returns early on typing targets (text and number included).
- (e) Blur mid-composition: Low, out of scope. The browser finalizes the composition before blur.

## v2 delta (tech-lead)
- The structural type accepts React's `KeyboardEvent<HTMLInputElement>` at all five call sites without a cast (typecheck rc 0).
- The interface name is acceptable.
- IME4 proves both fields.
- No new issues.

## Mutants (on v2, `mutants/results.jsonl`, per-mutant logs `mutants/mutant-<id>.log`)
| id | change | red rows |
|---|---|---|
| M-TEMPO | tempo guard removed | IME1 ×2 |
| M-MARKER | marker guard removed | IME2 ×2 |
| M-MARKER-NOSTOP | marker guard before stopPropagation | IME2 ×2 |
| M-MARKER-PD | marker guard after preventDefault | IME2 ×2 |
| M-GROUP / -NOSTOP / -PD | same three for the group editor | IME3 ×2 each |
| M-RANGE | range handler guard removed | IME4 ×2 |
| M-GAIN | Clip Gain guard removed | IME5 ×2 |
| M-HELPER-NO229 | helper without keyCode 229 | IME0 + 5 keyCode229 rows |
| M-HELPER-NOCOMPOSING | helper without isComposing | IME0 + 5 isComposing rows |
| M-HELPER-ALWAYS | helper true for any keyCode ≠ 0 | IME0 |
| M-HELPER-TRUE | helper always true | all 11 |
| M-HEAD-SOURCE | all guards removed (HEAD behaviour) | IME1–IME5, 10 rows |

14 of 14 red. v1 mutant logs are kept in `mutants/v1/` and `mutants/results-v1.jsonl`.

## Pre-check on the sketch
- Full suite on v1: 274 files, 4041 tests, rc 0 (`precheck-full.log`). Full suite on the dispatched v2: 274 files, 4041 tests, rc 0 (`precheck-full-v2.log`).
- Scoped `npx biome check` on the 6 sketch paths (v2): rc 0 (`biome-scoped-sketch.log`).
- Covering on v2: 60 files, 1114 tests, rc 0 (`covering-sketch.log`).
- typecheck rc 0; lint 205 warnings, equal to HEAD.
