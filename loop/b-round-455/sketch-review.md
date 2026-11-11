# Sketch review — round 456 (STORE-2b-3c-2a)

Dispatched sketch: `b-round-455/sketch-456.patch.txt` sha256 b3eab344c105f291fcf886c2ad004093ed6ca68204daa7cffab2e81755244e94 (v2). v1 (sha 64bf66b0cd599c7317356c88be3ec98e0ea4cb973e6e960a888f3574c11e26cb) is kept in `v1-superseded/`; delta `sketch-456-delta-v1-v2.patch.txt`.

## Review 1 — tech-lead on v1: APPROVE-WITH-CHANGES
- **M1 (Medium):** `reachableScripts` matched barrel re-exports on the source name; `export { default as X }`, `export { A as B }` and default imports from a barrel were not followed (fail-open, no current instance). **Fixed in v2:** `resolvedImports` returns `bindings {imported, exported}`, default clause recorded as `default`; barrel matching on the exported name; LT8 fixtures; mutants M16, M17.
- **M2 (Medium):** the overlay-only ruling checked callers only. **Fixed in v2:** LT7 pins the default in the signature, checks the overlay branch holds the overlay class and not the inline class, and that the inline class sits after the branch; mutant M18.
- **Lows fixed in v2:** token-to-rule tie (every DEAD_RULE_TOKENS token appears in its rule; mutant M19); @theme 6 hits vs 5 names (every teal @theme declaration ends with a listed token; mutant M20); whole-file `toContain("variant = 'overlay'")` replaced by the signature regex.
- **Lows recorded, not fixed:** TL-R455-WALKER-LIMITS (side-effect imports, type-only/commented imports fail-closed, block open at EOF, teal in selectors/conditions, `@starting-style`, nested `&` rules, aliased/createElement AudioPreviewButton, `>` in string attributes, keyframe comma list, LT1 double read).
- **No assertion lost** (per-file totals 37/6/2 still cover every hit; LT1 stronger; GS4 equivalent-or-stronger).
- **Architecture:** helper now mixes CSS reading and an import-graph walker; recommends a frontend-architect checkpoint → `b-round-455-checkpoint-request.md` (non-blocking).

## Review 2 — tech-lead delta on v2 (sha b3eab344c105f291fcf886c2ad004093ed6ca68204daa7cffab2e81755244e94): APPROVE
- M1 and M2 closed (M16/M17/M18 red).
- GT5b semantics unchanged (`default` can never equal `Timeline` or `''`).
- No new Medium+. Lows (added to TL-R455-WALKER-LIMITS): `export * as NS from` a barrel forwards `NS` and misses inner files; the overlay branch is not asserted to contain `return (`; @theme check uses `endsWith` + `>= 5`; `bracedBlockAfter` counts braces in strings (fails closed); `deadRuleText` re-reads per key.

## Verdict
APPROVE on the dispatched sha (reviewed = dispatched).

## Runs on the dispatched sketch (scratch `/tmp/b455-scratch` = db95f40 + v2)
- covering (`covering-456.txt`): 4 files / 26 tests, rc 0 — `precheck-covering.log`
- full vitest 284 files / 4150 tests rc 0 — `precheck-full-raw.log`; `tsc --noEmit` rc 0 — `precheck-typecheck.log`; `npm run lint` 205 warnings (HEAD 205) rc 0 — `precheck-lint.log`
- mutants (`run-mutants.sh`): 22 lines, BASE and C1 control green, M1–M20 red — `mutants/mutants.txt`, per-mutant logs `mutants/mutant-<id>.log`
