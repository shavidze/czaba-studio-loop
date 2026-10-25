#!/bin/bash
cd /home/runner/czaba-project/store
id=$1; out=/home/runner/czaba-project/tmp/studio-real-loop/a-round-150/mutations/$id.json
npx vitest run app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/arrangement/__tests__/pending-status.test.tsx app/lib/arrangement/__tests__/detail-panel-fit.test.tsx app/lib/arrangement/__tests__/view.test.ts app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx --reporter=json --outputFile=$out >/dev/null 2>&1
echo "vitest exit $?"
node -e 'const r=require(process.argv[1]);console.log("passed",r.numPassedTests,"failed",r.numFailedTests);for(const t of r.testResults)for(const a of t.assertionResults){if(a.status!=="passed")console.log("RED",t.name.split("/").pop(),a.title.slice(0,40));if(a.title.startsWith("PM2"))console.log("PM2",a.status)}' $out
