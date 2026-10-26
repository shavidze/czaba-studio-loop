#!/usr/bin/env bash
# Run from cwd = store. Temporary line-number mutations, each restored and sha-checked.
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop
OUT=$L/a-round-180/mutations
C=app/components/arrangement
FILES=$(cat $L/b-round-179-r180-vitest-base.txt | tr '\n' ' ')
FILES="$FILES app/lib/arrangement/__tests__/drag-feedback-colour-ui.test.tsx"
mkdir -p "$OUT"

mutate() {
  local id="$1" file="$2" line="$3" from="$4" to="$5"
  local before after json
  before=$(sha256sum "$file" | cut -d' ' -f1)
  cp "$file" "/tmp/$id.bak"
  sed -i "${line}s|${from}|${to}|" "$file"
  if cmp -s "$file" "/tmp/$id.bak"; then
    echo "{\"id\":\"$id\",\"error\":\"mutation did not apply\"}" > "$OUT/$id.json"
    echo "$id NOT APPLIED"; return
  fi
  diff -u "/tmp/$id.bak" "$file" | sed "1s|/tmp/$id.bak|a/$file|;2s|$file|b/$file|" > "$OUT/$id.diff"
  json="/tmp/$id-vitest.json"
  npx vitest run $FILES --reporter=json --outputFile="$json" >/dev/null 2>&1
  cp "/tmp/$id.bak" "$file"
  after=$(sha256sum "$file" | cut -d' ' -f1)
  node -e '
    const [id,file,line,from,to,before,after,json,out]=process.argv.slice(1);
    const r=require(json);
    const failed=[];
    for (const f of r.testResults) for (const a of f.assertionResults) if (a.status==="failed") failed.push(f.name.split("/").pop()+" :: "+a.title);
    const o={id,file,line:Number(line),from,to,files:r.testResults.map(f=>f.name.split("/").pop()),failedCount:r.numFailedTests,total:r.numTotalTests,failed,restoredShaMatches:before===after,sha:after};
    require("fs").writeFileSync(out,JSON.stringify(o,null,2));
    console.log(id,"failed",r.numFailedTests+"/"+r.numTotalTests,"restored",before===after);
    for (const t of failed) console.log("   ",t);
  ' "$id" "$file" "$line" "$from" "$to" "$before" "$after" "$json" "$OUT/$id.json"
  sha256sum -c --quiet "$L/a-round-180/end-copies.sha256" || echo "$id RESTORE SHA MISMATCH"
}

mutate m291 $C/ArrangementLane.tsx 884 "'border-foreground bg" "'border-brand bg"
mutate m292 $C/ArrangementLane.tsx 883 "'border-muted bg-muted/20 text-muted'" "'border-foreground bg-foreground/15 text-foreground'"
mutate m293 $C/ArrangementLane.tsx 920 'bg-foreground/20' 'bg-brand/20'
mutate m294 $C/ArrangementLane.tsx 842 'ring-muted' 'ring-accent'
mutate m295 $C/ArrangementLane.tsx 872 'font-medium text-foreground"' 'font-medium text-brand"'
mutate m296 $C/ArrangementLane.tsx 723 'border-outline-strong' 'border-brand'
mutate m297 $C/ArrangementLane.tsx 731 'text-xs text-foreground' 'text-xs text-brand'
mutate m298 $C/ArrangementLibraryPreview.tsx 332 'border-outline-strong' 'border-transparent'
