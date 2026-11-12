#!/usr/bin/env bash
# Usage: bash mutants.sh <scratch = eb4d6df + sketch-463, committed, node_modules linked> <out-dir>
# Each mutant edits the scratch, runs the covering set, records failing test-row ids, then restores with git checkout.
set -u
S="$1"; OUT="$2"; mkdir -p "$OUT"; cd "$S" || exit 2
FILES="app/lib/__tests__/store-dead-css.test.ts app/lib/__tests__/store-live-teal.test.ts app/lib/__tests__/store-gradient-text.test.ts"
rows() { npx vitest run $FILES 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E '^ FAIL ' | grep -oE '> (DC|LT|GT)[0-9]+[a-z]?:' | sed 's/> //;s/://' | sort -u | tr '\n' ' '; }
run() { local id="$1"; local r; r="$(rows)"; if [ -z "$r" ]; then echo "$id GREEN" ; else echo "$id RED $r"; fi; git checkout -q -- . ; git clean -qfd app; }
{
run BASE
git show eb4d6df:app/styles/app.css > app/styles/app.css; run "M1 HEAD app.css restored"
printf '\n.about-hero {\n  color: red;\n}\n' >> app/styles/base/utilities.css; run "M2 dead class rule re-added"
printf '\n@keyframes dc-orphan {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n' >> app/styles/app.css; run "M3 orphan keyframes"
printf '\n@media (min-width: 640px) {\n  .newsletter-perk:hover {\n    color: red;\n  }\n}\n' >> app/styles/app.css; run "M4 dead rule inside media"
sed -i "s/const selector = header.replace/const selector = '' \&\& header.replace/" app/lib/__tests__/store-dead-css.test.ts; grep -q "const selector = '' &&" app/lib/__tests__/store-dead-css.test.ts || echo "M5 sed did not apply" >&2; run "M5 class extractor vacuous"
printf '\n.loading-brand {\n  -webkit-background-clip: text;\n  background-clip: text;\n}\n' >> app/styles/app.css; run "M6 gradient-text rule re-added"
printf "export { sendOrderPaidEmail } from '~/lib/email.server';\n" >> app/components/common/index.ts; run "M7 barrel re-exports sendOrderPaidEmail"
printf '\n.hover-glow:hover {\n  box-shadow: 0 0 20px #13d9cc;\n}\n' >> app/styles/base/utilities.css; run "M8 dead teal rule re-added"
} > "$OUT/mutants.txt"
cat "$OUT/mutants.txt"
