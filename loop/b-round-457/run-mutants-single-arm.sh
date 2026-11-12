#!/usr/bin/env bash
# usage: run-mutants.sh <scratch-root> <out-file>; scratch must hold the round-458 sketch (db95f40 + b-round-455/sketch-456.patch.txt + b-round-456/sketch-457-delta.patch.txt + b-round-457/sketch-458-delta.patch.txt), committed
set -u
R="$1"; OUT="$(realpath -m "$2")"; : > "$OUT"
T="app/lib/__tests__/store-live-teal.test.ts app/lib/__tests__/store-glow-shadow.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts"
FILES="app/routes/_index.tsx app/components/product/ProductSidebar.tsx app/components/product/ProductCard.tsx app/components/audio/AudioPreviewButton.tsx app/styles/app.css app/lib/__tests__/helpers/style-scan.ts app/lib/__tests__/store-live-teal.test.ts"
cd "$R"; mkdir -p /tmp/m458sbak; for f in $FILES; do cp "$f" "/tmp/m458sbak/$(echo $f | tr / _)"; done
restore() { for f in $FILES; do cp "/tmp/m458sbak/$(echo $f | tr / _)" "$f"; done; }
run() { local id="$1"; local file="$2"; shift 2
  python3 -c "import sys;p='$file';s=open(p).read();o,n=sys.argv[1],sys.argv[2];assert o in s,('MISSING',o);open(p,'w').write(s.replace(o,n,1))" "$@" || { echo "$id APPLY-FAIL" >> "$OUT"; restore; return; }
  local log; log="$(dirname "$OUT")/mutant-$id.log"; npx vitest run $T > "$log" 2>&1
  local res; res=$(sed -E 's/\x1b\[[0-9;]*m//g' "$log" | grep -E "^\s+×" | grep -oE "(LT|GS|GT|TS)[0-9]+b?" | sort -u | tr '\n' ' ')
  [ -z "$res" ] && echo "$id GREEN(survived)" >> "$OUT" || echo "$id RED $res" >> "$OUT"
  restore; }
IDX=app/routes/_index.tsx
SS=app/lib/__tests__/helpers/style-scan.ts
run M21a-ONLY-STRIPPED-ARM-REMOVED $SS "    ...resolvedImports(stripped, importer),
" ""
run M22a-ONLY-RAW-ARM-REMOVED $SS "    ...resolvedImports(source, importer),
" ""
