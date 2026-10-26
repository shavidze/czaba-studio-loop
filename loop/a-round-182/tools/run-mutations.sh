#!/usr/bin/env bash
set -u
L=../tmp/studio-real-loop/a-round-182
F=app/components/arrangement/ArrangementLibrary.tsx
cp "$F" /tmp/a182-lib-end.tsx
run() {
  id=$1; expr=$2
  sed -i "$expr" "$F"
  git diff --no-index /tmp/a182-lib-end.tsx "$F" > "$L/mutations/$id.diff"
  npx vitest run $(tr '\n' ' ' < "$L/vitest-files.txt") --reporter=json --outputFile="$L/mutations/$id-vitest.json" >/dev/null 2>&1
  cp /tmp/a182-lib-end.tsx "$F"
  restore=$(sha256sum -c --quiet "$L/end-sha256.txt" >/dev/null 2>&1 && echo OK || echo FAIL)
  node -e '
const [file,id,restore,diffLines]=process.argv.slice(1);
const r=require(file);
const failed=[];const failedFiles=new Set();
for(const t of r.testResults){for(const a of t.assertionResults){if(a.status!=="passed"){failed.push({file:t.name.replace(/.*store\//,""),title:a.title,message:(a.failureMessages||[]).join("\n").split("\n").slice(0,6).join("\n")});failedFiles.add(t.name.replace(/.*store\//,""));}}}
const out={id,passed:r.numPassedTests,total:r.numTotalTests,failed:r.numFailedTests,failedTests:failed,failedFiles:[...failedFiles],restoreSha:restore};
require("fs").writeFileSync(file.replace("-vitest.json",".json"),JSON.stringify(out,null,1));
console.log(id,"passed",out.passed,"/",out.total,"failedFiles",out.failedFiles.join(","),"failed",failed.map(f=>f.title.slice(0,5)).join(","),"restore",restore);
' "$PWD/$L/mutations/$id-vitest.json" "$id" "$restore"
}
run m304 "s/'min-h-0 min-w-0 flex-1 space-y-1 overflow-y-auto p-1'/'min-h-0 min-w-0 flex-1 overflow-y-auto p-1'/"
run m305 "s/'min-h-0 min-w-0 flex-1 space-y-1 overflow-y-auto p-1'/'min-h-0 min-w-0 flex-1 space-y-2 overflow-y-auto p-1'/"
run m306 "s/'flex w-full flex-col rounded-md px-2 py-1.5 text-left /'flex w-full flex-col rounded-md mb-1 px-2 py-1.5 text-left /"
run m307 "s/'flex w-full flex-col rounded-md px-2 py-1.5 text-left /'flex w-full flex-col rounded-md px-2 py-2.5 text-left /"
