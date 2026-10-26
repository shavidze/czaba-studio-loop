#!/usr/bin/env bash
# Run from cwd = store. Temporary line-number mutations, each restored and sha-checked.
set -u
OUT=/home/runner/czaba-project/tmp/studio-real-loop/a-round-178/mutations
T=app/lib/arrangement/__tests__
C=app/components/arrangement
NEW=$T/label-status-colour-ui.test.tsx
mkdir -p "$OUT"

mutate() {
  local id="$1" file="$2" line="$3" from="$4" to="$5"; shift 5
  local tests=("$@")
  local before after json
  before=$(sha256sum "$file" | cut -d' ' -f1)
  cp "$file" "/tmp/$id.bak"
  sed -i "${line}s|${from}|${to}|" "$file"
  if cmp -s "$file" "/tmp/$id.bak"; then
    echo "{\"id\":\"$id\",\"error\":\"mutation did not apply\"}" > "$OUT/$id.json"
    echo "$id NOT APPLIED"; return
  fi
  json="/tmp/$id-vitest.json"
  npx vitest run "${tests[@]}" --reporter=json --outputFile="$json" >/dev/null 2>&1
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
}

mutate m278 $C/ArrangementDetailPanel.tsx 676 'font-medium text-foreground' 'font-medium text-brand' $NEW
mutate m279 $C/ArrangementDetailPanel.tsx 754 'hover:text-foreground' 'hover:text-brand' $NEW $T/detail-panel-strings-ui.test.tsx
mutate m280 $C/StudioWorkspace.tsx 2197 'hover:text-foreground' 'hover:text-brand' $NEW $T/panel-radius-ui.test.tsx
mutate m281 $C/StudioWorkspace.tsx 2210 'border border-outline-strong px-2 py-0.5 text-xs text-muted' 'border border-accent px-2 py-0.5 text-xs text-accent' $NEW $T/mode-toggle-colour-ui.test.tsx
mutate m282 $C/StudioWorkspace.tsx 2562 'className="text-muted"' 'className="text-accent"' $NEW
mutate m283 $C/StudioWorkspace.tsx 2606 'font-medium text-foreground' 'font-medium text-accent' $NEW
mutate m284 $C/ArrangementLibrary.tsx 492 'className="text-foreground"' 'className="text-brand"' $NEW
mutate m285 $C/ArrangementGridMenu.tsx 226 'text-foreground' 'text-accent' $NEW $T/grid-triplet-ui.test.tsx
mutate m286 $C/ArrangementExportDialog.tsx 562 'accent-foreground' 'accent-brand' $NEW $T/affordance-colour-ui.test.tsx
mutate m287 $C/ArrangementExportDialog.tsx 569 'text-foreground' 'text-accent' $NEW $T/master-ui.test.tsx
