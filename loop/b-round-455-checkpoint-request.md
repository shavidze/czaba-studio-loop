# Architecture checkpoint request — ARCH-CHECKPOINT-STYLE-SCAN (B, 2026-11-11, D-29z1619)

**For:** root. Run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`, on the published commit of round 456 (after its gate), or on `db95f40` + `b-round-455/sketch-456.patch.txt` if root wants it earlier.
**Blocking:** no. Round 456 (STORE-2b-3c-2a) is dispatched regardless. The next rounds (SABA-B-13 entrance, 2b-3c-2b) do not depend on the answer; 2b-3c-2b touches the same helper, so an answer before it is planned is preferred.
**Scope:** test helpers only — `app/lib/__tests__/helpers/style-scan.ts` and its four importers (`store-live-teal`, `store-glow-shadow`, `store-gradient-text`, `store-teal-sweep` tests). No app source.

## Why now (signals, file/line evidence)
- **Signal 1 (mixed responsibility):** after round 456 the helper holds style-token counting, two brace walkers (`cssGradientTextHits` and the new `cssRuleBlocks`), and an import-graph walker (`resolvedImports`, `reachableScripts`) that has nothing to do with styles. The `tech-lead` review of the round-456 sketch recommends a checkpoint now (`b-round-455/sketch-review.md`).
- **Signal 3 (repeated costly change):** rounds 451, 452, 453, 454 and 456 all edited this helper or its allow-lists. Open signals: SIG-R453-CSSRULEBODIES and SIG-R454-HITSBYRULE (acted on in round 456), SIG-R454-ALLOWLIST-PINS (allow-lists edited every stage), and the gate-452 note "extraction task first if the helper grows".
- **Upcoming:** 2b-3c-2b (glow regex forms), 2b-3d (dead tokens/rules deletion) and LEGACY-DEAD-STORE-COMPONENTS will all rely on the reachability walker and the rule reader.

## Questions (keep or extract, value, risk; at most 3 sentences each)
1. Split `style-scan.ts` into `helpers/css-rules.ts` (one reader; `cssGradientTextHits` rebuilt on `cssRuleBlocks`) and `helpers/module-graph.ts` (`resolvedImports`, `reachableScripts`), or keep one file?
2. Should the dead-code allow-lists (GT5 `DEAD_COMPONENTS`, GT5b `DEAD_MODULES`, LT7 `DEAD_TOKEN_CONSUMERS`, GS2 allow-list) move to one shared data file (SIG-R454-ALLOWLIST-PINS), and should GT5's word-match be replaced by `reachableScripts`?
3. Known walker limits recorded as Low TL-R455-WALKER-LIMITS (side-effect imports, type-only imports counted, unclosed block at EOF dropped, `@starting-style` and nested `&` rules): fix inside the split or leave?

## Evidence
- `b-round-455/sketch-review.md` (tech-lead v1 and v2 delta reviews), `b-round-455/sketch-456.patch.txt`, `b-round-455/mutants/mutants.txt`.
- `gates/round-452/review.md` (architecture note), `a-round-453.md`, `a-round-454.md` (code-reviewer architecture notes).

## After the result
B records the verdict in `backlog.json` (`architecture_checkpoint_requests`) and, only if root approves an extraction, plans it as one bounded test-only task with one owner and behaviour-preserving tests (same mutants red).
