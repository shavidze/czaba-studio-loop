# tech-lead review v4 — condensed by B from the agent reply (the full reply was returned inline to B; key lines kept word for word: VERDICT, REVIEWED, findings L1–L3)
VERDICT: approve-with-lows
REVIEWED: delta a03d0ad6de917cba9c3d05561a03231e33fcb66fa98ade51877cd538cff5728f full c7cbb400ed937bac3219b57047a9644d366e827b5884aa517a4fec4cd930eb8c

- v4 fixes the verifier's Medium: M17 red NF2; M18 red NF2 (green at HEAD, so stronger); M19 red PG2.
- (1) NF2 vs HEAD: stronger on `type={ "number" }` spacing, subfolders, wrapper in owner (M18), exact count 3, per-tag className/spread/style. Equally blind to type via spread object, createElement('input',{type:'number'}), type={NUMBER}.
  - L1: wrapper with non-literal type (`<Input type={'number' as const} />`, `type={number}`) red at HEAD, green on v4 (IN1 covers lowercase input only).
  - L2: markup in a string/comment in a new file (`innerHTML = '<input type="number">'`) red at HEAD, green on v4; PG2 got a raw guard but NF2 did not. Fix both: per-file raw count of `/(?<![\w-])type=["'`{]+number["'`}]+/g` equals the number-tag count.
  - PG2, RD2, SF2, DS4, HS1 unchanged in this delta; HEAD-red/v4-green only M1, M2, M4, M5, M12 (accepted in v3: false positives, replaced by stricter carrier, HS1 carried).
- (2) PG2 raw-count guard: not worse than HEAD in practice (HEAD already counted comment/string `<progress` in top-level .tsx); new exposure .ts + subfolders; a JSDoc mention would fail with a clear message. Low at most, no change needed.
- (3) L3: allJsxOpeningTags duplicates jsxOpeningTags' visitor; rewrite jsxOpeningTags as a filter over it. `name` via tagName.getText() is right (ui.Field, svg:rect; fragments excluded). v3 N1/N2 still open, outside this delta.
