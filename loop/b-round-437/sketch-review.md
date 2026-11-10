# Sketch review — round 438 (SYS-R435-SOURCE-SCAN-HELPER)

**Dispatched sketch:** `b-round-437/sketch-438.patch.txt` (v3), sha256 `1b88d0ec860ff1bf14d9fcd9230686347fa8199d89e8b10391b6111aba1683ad`.
**Final verdict (tech-lead, v3): approve-with-lows.** Reviewed equals dispatched: the v3 check named this sha and confirmed the patch hash.

Review chain (tech-lead, read-only):
1. v1 `9c8f5d9f…` (hand-written walker): approve-with-lows, 1 Medium + 7 Low — full text `tech-lead-review-v1.md`; v1 artifacts in `v1/`.
2. v2 `062c2ae0…` (TypeScript parser engine, per the v1 Architecture note): approve-with-lows, 4 Low.
3. v3 `1b88d0ec…` (v2 Lows 1–3 applied, mutants M15/M16/H9 added): approve-with-lows, 3 new Low + 1 carried.

## Dispositions (D-29z1557)
| Finding | Severity | Disposition |
|---|---|---|
| v1-1 quote overrun in the hand walker | Medium | **Resolved by engine switch** (TS parser; `ThisNodeHasError` throws `path:line`; reviewer fed 6 broken sources, each flagged) |
| v1-2 MixFader `{...props}` after `type`; Omit is compile-time only | Low | Ruling (b) reworded "compile-time guard only"; app fix filed **TL-R438-02-MIXFADER-SPREAD-ORDER** (deferred Low; not in a test-only round) |
| v1-3 skeleton fallback drops spread silently | Low | Resolved (no skeleton; `JsxSpreadAttribute` node) |
| v1-4 `style = {x}` whitespace | Low | Resolved (parse tree) |
| v1-5 nested-expression attribute literal | Low | Resolved (own attributes only; SS1/SS3 fixtures) |
| v1-6 unescaped names in RegExp | Low | Resolved (`===` on tag and attribute names; H7) |
| v1-7 NF2 per-tag carrier + definition pin | Low | Resolved in v2/v3 (anchored carrier, AST definition check, hand-off check; M14/M15/M16) |
| v1-8 IN1 own id; SS7 path suffix | Low | Resolved |
| v1 rulings (a)(c)(d)(f) right; (e) understated | — | (e) replaced by ruling (0) |
| v1 note: other suites' own walkers | — | Signal **SIG-R438-OTHER-SCANNERS** (not scheduled) |
| v2-1 hand-off / ternary carrier | Low | Resolved in v3 (M15, M16) |
| v2-2 property-access / export counted | Low | Resolved in v3 (H9, SS5) |
| v2-3 const regex order | Low | Resolved in v3 (AST initializer search) |
| v2-4 / v3 carried: HS1 still a text regex (comments/strings count) | Low | **TL-R438-04-HS1-TEXT-REGEX** deferred (port to the parser with SIG-R438-OTHER-SCANNERS) |
| v3-N1 `variableInitializersUsing` counts property-access names | Low | **TL-R438-N1-INITIALIZER-PROPERTY-NAMES** deferred (one-line guard; same class as H9) |
| v3-N2 object-literal keys / qualified type names counted | Low | **TL-R438-N2-IDENTIFIER-KEYS** deferred |
| v3-N3 `cn(inputClass, …)` accepts later overriding classes | Low | **TL-R438-N3-CN-OVERRIDE** deferred (current code at :427 is fine) |
| Architecture notes (v1 keep; v2 by-name lookup — done; v3 shared "real identifier use" predicate) | — | Signal **SIG-R438-IDENTIFIER-PREDICATE** with SIG-R438-OTHER-SCANNERS |

A's code-reviewer: a Medium+ finding not ruled above is a STOP (task §3).
