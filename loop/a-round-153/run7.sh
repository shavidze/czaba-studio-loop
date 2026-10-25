#!/bin/bash
cd /home/runner/czaba-project/store
out=$1
npx vitest run app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/tempo-ui.test.tsx app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx --reporter=json --outputFile=$out >/dev/null 2>&1
node -e 'const j=require(process.argv[1]);console.log("total",j.numTotalTests,"passed",j.numPassedTests,"failed",j.numFailedTests);for(const f of j.testResults)for(const a of f.assertionResults)if(a.status!=="passed")console.log("RED:",a.fullName)' $out
