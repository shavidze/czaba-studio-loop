#!/usr/bin/env bash
# Removed UI literals since f6c76f4 (Studio arrangement + strings), still absent at HEAD, grepped in the base copies.
cd /home/runner/czaba-project/store || exit 1
L=/home/runner/czaba-project/tmp/studio-real-loop
git diff f6c76f4 751e30e -- app/components/arrangement app/lib/arrangement/strings.ts | grep -E "^-[^-]" | grep -oE "(data-testid|aria-label|title|placeholder)=\"[^\"]+\"|'[A-Za-z][^']{3,}'|>[A-Z][A-Za-z ,.]{3,}<" | sed -E "s/^[a-z-]+=//; s/^[\"'>]//; s/[\"'<]$//" | sort -u | while read -r v; do [ ${#v} -lt 4 ] && continue; if ! grep -rqF --include=*.tsx --include=*.ts --exclude-dir=__tests__ -e "$v" app; then h=$(grep -rliF --include=*.js --include=*.cjs --include=*.mjs --include=*.py -e "$v" $L/c-round-425/tools $L/c-round-425/t258 $L/c-round-425/t301 $L/c-round-425/t301x $L/c-round-425/wk $L/c-round-425/t389 $L/c-round-423 2>/dev/null | sed "s#$L/##" | tr '\n' ' '); echo "GONE '$v' :: $h"; fi; done
