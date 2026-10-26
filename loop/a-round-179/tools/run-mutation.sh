#!/usr/bin/env bash
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop
A=$L/a-round-179
F=app/components/arrangement/StudioWorkspace.tsx
ID=$1; SEDEXPR=$2; DESC=$3
cp $F $A/tools/StudioWorkspace.backup.tsx
sed -i "$SEDEXPR" $F
diff -u $A/tools/StudioWorkspace.backup.tsx $F > $A/mutations/$ID.diff
npx vitest run $(cat $A/vitest-files.txt) --reporter=json --outputFile=$A/out/vitest-$ID.json >/dev/null 2>&1
cp $A/tools/StudioWorkspace.backup.tsx $F
grep "  $F\$" $L/b-round-178-r179-tree-sha256.txt | sha256sum -c --quiet && RESTORE=OK || RESTORE=FAIL
node $A/tools/summarise.mjs "$ID" "$DESC" "$A/mutations/$ID.diff" "$A/out/vitest-$ID.json" "$RESTORE" "$(sha256sum $F | cut -d' ' -f1)" > $A/mutations/$ID.json
cat $A/mutations/$ID.json
