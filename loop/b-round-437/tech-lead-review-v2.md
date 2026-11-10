# tech-lead delta review of sketch v2 (sha 062c2ae09075cd7f739ec4fc5523073e61d702b2c782b49920341ca63d0dba95), 2026-11-10 — verbatim

**Verdict: approve-with-lows.** Nothing blocks; the parser switch closes v1's over-run class.

v1 findings: 1 (Medium) resolved — fed createSourceFile six broken inputs (unterminated string, unclosed JSX, unterminated template, missing `}`, bad character, truncated EOF); each one set ThisNodeHasError; a stray `'` in JSX text now parses cleanly. 3 resolved (unreadable source throws `path:line`). 4 resolved (parse tree, `=` whitespace irrelevant). 5 resolved (own attributes only). 6 resolved (`===` names, no RegExp). 7 mostly resolved, see new 1. 8 resolved (IN1 own id; SS7 path suffix).

Parser checks: ThisNodeHasError covered (duplicate attributes and JSDoc errors not flagged, harmless here). JsxNamespacedName getText gives `xlink:href`, fine as a key. `.ts` parsed with ScriptKind.TS, so `<T>x` casts are safe. `import ts from 'typescript'` fine with esModuleInterop (tsconfig.json:11). Cache memory negligible (vitest isolates modules per test file). No any, no type assertions, semicolons present.

Findings:
1. Low (NF2 soundness). ArrangementDetailPanel.tsx:427 uses inputClass as a prop (declared :283), not the local const at :989; the file-wide regex is satisfied by the const but nothing checks the hand-off `inputClass={inputClass}` at :1123; passing `inputClass="h-6 ..."` keeps NF2 green. The carrier check runs over the whole className text, so `{x ? 'a' : inputClass}` passes. Fix: every `inputClass=` attribute in the owner file is exactly `{inputClass}`; check the const with the parser (exactly one declaration named inputClass whose template contains the identifier); mutant: :1123 to a string literal.
2. Low. identifierUsesOutsideImports also counts property names (`o.X`), `export { X }` and a shadowing local. Fix: skip property-access names and ExportDeclaration (or resolve references). Low priority; tag checks carry the guarantee.
3. Low. NF2's const regex requires `${STUDIO_NUMBER_FIELD_CLASS}` last in the template; reordering classes turns it red without a defect. Finding 1's parser check removes this.
4. Low (carried). HS1 is still a text regex; matches inside comments or strings count. Acceptable this round; port later.

Architecture note: keep this helper as the one test-only parse-tree scanner; port the remaining hand-written walkers (focus-ring, theme-obsidian, panel-radius, strings) later, and give it a by-attribute-name lookup to fix finding 1.
