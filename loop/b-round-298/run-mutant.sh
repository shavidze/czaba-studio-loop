#!/usr/bin/env bash
# usage: run-mutant.sh <scratch> <name> <python-mutant-script|-> ; runs the 3 hydration files, restores app/ after
set -u
S=$1; N=$2; M=$3; L=$(cd "$(dirname "$0")" && pwd)
rm -rf /tmp/b299-snap && cp -a "$S/app" /tmp/b299-snap
if [ "$M" != "-" ]; then python3 "$M" "$S" || exit 2; fi
cd "$S" && timeout 300 npx vitest run app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx > "$L/mutant-$N.log" 2>&1
rm -rf "$S/app" && cp -a /tmp/b299-snap "$S/app"
diff -rq /tmp/b299-snap "$S/app" >/dev/null && echo "restore cmp-equal"
echo "== $N"; grep -E "^ *(×|✗)|FAIL .*>|Tests  " "$L/mutant-$N.log" | sed 's/\x1b\[[0-9;]*m//g' | head -12
