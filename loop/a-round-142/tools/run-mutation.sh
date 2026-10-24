#!/usr/bin/env bash
set -u
cd /home/runner/czaba-project/store
D=/home/runner/czaba-project/tmp/studio-real-loop/a-round-142
id=$1; file=$2; from=$3; to=$4; shift 4
mkdir -p $D/mut-backup
cp "$file" "$D/mut-backup/$id.bak"
before=$(sha256sum "$file" | cut -d' ' -f1)
node $D/tools/mutate.cjs "$file" "$from" "$to" || { cp "$D/mut-backup/$id.bak" "$file"; exit 2; }
npx vitest run "$@" --reporter=json --outputFile=$D/mut-$id.json > $D/mut-$id.log 2>&1
cp "$D/mut-backup/$id.bak" "$file"
after=$(sha256sum "$file" | cut -d' ' -f1)
[ "$before" == "$after" ] && echo "$id restored sha OK $after" || echo "$id RESTORE MISMATCH"
node -e 'const r=require(process.argv[1]);console.log(process.argv[2],"failedTests",r.numFailedTests,"of",r.numTotalTests);for(const s of r.testResults)for(const a of s.assertionResults)if(a.status==="failed")console.log("  RED",s.name.split("__tests__/")[1],"::",a.title.slice(0,90))' $D/mut-$id.json $id
