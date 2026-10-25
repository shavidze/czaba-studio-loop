#!/usr/bin/env bash
set -u
STORE=/home/runner/czaba-project/store
A=/home/runner/czaba-project/tmp/studio-real-loop/a-round-174
T=app/lib/arrangement/__tests__
CC=$T/content-colour-ui.test.tsx
C=app/components/arrangement
run() {
  id=$1; file=$2; sedexpr=$3; shift 3
  cd "$STORE"
  before=$(sha256sum "$file" | cut -d' ' -f1)
  cp "$file" "$A/mutations/$id.orig"
  sed -i "$sedexpr" "$file"
  changed=$(cmp -s "$file" "$A/mutations/$id.orig" && echo false || echo true)
  npx vitest run "$@" --reporter=json --outputFile="$A/mutations/$id-vitest.json" >/dev/null 2>&1
  cp "$A/mutations/$id.orig" "$file"
  after=$(sha256sum "$file" | cut -d' ' -f1)
  node -e '
const [id,file,sedexpr,changed,before,after,out]=process.argv.slice(1,8);
const files=process.argv.slice(8);
const j=require(out+"/"+id+"-vitest.json");
const failed=[];
for(const s of j.testResults) for(const t of s.assertionResults) if(t.status!=="passed") failed.push(s.name.split("/").pop()+" :: "+t.fullName);
const r={id,file,sed:sedexpr,mutationApplied:changed==="true",suites:files,numFailed:j.numFailedTests,numPassed:j.numPassedTests,failed,restoredShaMatches:before===after,sha256:after};
require("fs").writeFileSync(out+"/"+id+".json",JSON.stringify(r,null,2));
console.log(id,"applied="+r.mutationApplied,"failed="+r.numFailed,"restored="+r.restoredShaMatches);
failed.forEach(f=>console.log("   ",f));
' "$id" "$file" "$sedexpr" "$changed" "$before" "$after" "$A/mutations" "$@"
  rm -f "$A/mutations/$id.orig"
}
run m241 $C/ArrangementClip.tsx "s#cursor-text', 'text-muted/70')#cursor-text', 'text-brand/70')#" $CC
run m242 $C/ArrangementClip.tsx "s#isVideo ? 'bg-muted-bg' : 'bg-elevated'#isVideo ? 'bg-accent/10' : 'bg-elevated'#" $CC
run m243 $C/ArrangementClip.tsx "s#'bg-foreground/15 text-foreground'#'bg-accent/30 text-foreground'#" $CC
run m244 $C/ArrangementClip.tsx "878s#'text-foreground',#'text-accent',#" $CC $T/video-fades-ui.test.tsx
run m245 $C/ArrangementOverview.tsx "s#\['bg-foreground/80',#['bg-brand',#" $CC
run m246 $C/ArrangementDetailPanel.tsx "s#bg-background text-muted/70 contain-strict#bg-background text-brand/70 contain-strict#" $CC $T/detail-panel-polish.test.tsx $T/panel-radius-ui.test.tsx
run m247 $C/ArrangementClip.tsx "s#'bg-brand text-brand-foreground'#'bg-muted-bg text-brand-foreground'#" $CC
