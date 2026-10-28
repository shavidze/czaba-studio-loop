A self-check (temp copy /tmp/a46mut, node_modules symlinked; C must re-run independently):
- M1 getDefaultValue('number') -> 0: killed by (n9)
- M2 renderer empty input sends 0: killed by (r2)
- M3 badge `> 0`: killed by file-row-display "returns true for zero", "negative number", "typed 0 (D-50)"
- M4 number '' not treated as empty on write: killed by (n2), (n3), (n6 clear), (n7), (n8)
- M5 standard getter keeps 0: killed by (n1), (n6 clear), (n6 year 0)
- Note: M1-M5 ran before F1 fix; F1 changed only the display expression, not onChange, so M2 is still killed by (r2) (r2 green after F1 in check2.log).
