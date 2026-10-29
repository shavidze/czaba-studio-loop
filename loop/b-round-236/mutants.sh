#!/bin/bash
# usage: mutants.sh <scratch root> <out dir>
R=$1; OUT=$2; mkdir -p "$OUT"; cd "$R" || exit 1
CTX=app/contexts/ArrangementContext.tsx; SW=app/components/arrangement/StudioWorkspace.tsx
T="app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx app/lib/arrangement/__tests__/tempo-seed-search-ui.test.tsx app/lib/arrangement/__tests__/collection.test.ts app/lib/arrangement/__tests__/tempo-seed.test.ts"
run() { name=$1; file=$2; old=$3; new=$4
  cp "$file" "$file.bak"
  python3 -I -c "import sys;p,o,n=sys.argv[1:];s=open(p).read();assert s.count(o)==1,(o,s.count(o));open(p,'w').write(s.replace(o,n))" "$file" "$old" "$new" || { echo "$name: apply failed"; mv "$file.bak" "$file"; return; }
  timeout 300 npx vitest run $T > "$OUT/mutant-$name.log" 2>&1
  echo "$name red: $(grep -oE '× [A-Z]+[0-9]+[a-z]?' "$OUT/mutant-$name.log" | sort -u | tr '\n' ' ')"
  mv "$file.bak" "$file"
}
run MU-RC $CTX "setStatus((current) => settledCollectionStatus(current, copy, failedCount));" "setStatus(failedCount === 0 ? copy.ready : copy.failed(failedCount));"
run MU-LD $CTX "setStatus((current) => loadingCollectionStatus(current, copy));" "setStatus(copy.loading);"
run MU-F $SW ".filter((part) => part.length > 0)" ""
run MU-S2 $SW "if (!collectionHasTempoSource || !tempoSeedOpenRef.current" "if (!tempoSeedOpenRef.current"
run MU-SR $SW "    workspaceRef.current.setStatus((current) =>
      [current, ...parts].filter((part) => part.length > 0).join(' '),
    );" "    workspaceRef.current.setStatus(
      [workspaceRef.current.status, ...parts].filter((part) => part.length > 0).join(' '),
    );"
